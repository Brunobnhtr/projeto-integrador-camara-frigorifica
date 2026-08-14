#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Analisador de arquivos .CAD do CADe_SIMU - VERSÃO DEFINITIVA
Motor Inteligente de Roteamento (Graph Theory + CADe_SIMU Native NetIDs)
"""

import sys
import re
from pathlib import Path
from collections import defaultdict

# ============================================================================
# 1. TABELA DE TIPOS DE COMPONENTES CADe_SIMU
# Carregada de componentes_base.py (gerado por gerar_base_componentes.py).
# Códigos não cobertos lá entram em fallback baseado no que o próprio .cad
# declara (terminais lidos do bloco do componente).
# ============================================================================
from componentes_base import TIPOS_COMPONENTES, TIPOS_WIRES, TERMINAL_OFFSETS

def aplicar_orientacao(dx, dy, orient):
    # CADe_SIMU codifica orientação no campo partes[18]:
    #   bit 2 (valor 4): espelho horizontal, aplicado ANTES da rotação
    #   bits 0-1: número de rotações 90° no sentido horário (0..3)
    # Coordenadas de tela (Y pra baixo): 90° CW visual = (x, y) -> (-y, x)
    if orient & 4:
        dx = -dx
    for _ in range(orient & 3):
        dx, dy = -dy, dx
    return dx, dy

def calcular_posicao_terminal(comp, terminal):
    cx, cy = comp.get("x", 0), comp.get("y", 0)
    orient = comp.get("orient", 0)
    offsets = TERMINAL_OFFSETS.get(comp.get("codigo", ""))
    if not offsets:
        # Generic fallback for entrada (terminal block) codes with unknown offsets.
        # All terminal blocks use a 6px horizontal step, so terminal at index i
        # sits at (i*6, 0) relative to the component origin — matching codes
        # 3001/3004-3007/3010 which are explicitly defined with the same step.
        if comp.get('tipo') == 'entrada':
            terminais = comp.get("terminais", [])
            if terminal not in terminais:
                return None
            idx = terminais.index(terminal)
            dx, dy = idx * 6, 0
            dx, dy = aplicar_orientacao(dx, dy, orient)
            return (cx + dx, cy + dy)
        return None

    dx = dy = None
    if terminal in offsets:
        dx, dy = offsets[terminal]
    elif "_n" in offsets:
        terminais = comp.get("terminais", [])
        if terminal not in terminais: return None
        idx = terminais.index(terminal)
        n = offsets["_n"]
        # CADe_SIMU permite o usuário escolher tamanhos diferentes do mesmo
        # código (ex: contator 2008 vem na paleta com h=30 mas no .cad real
        # aparece com h=15 quando o desenhista usa o símbolo compacto).
        # Usar o bbox da instância real bate certo nos dois casos.
        # Mas o bbox no .cad é PÓS-rotação visual: pra rotações de 90°/270°
        # o que era width vira height. Então pra recuperar a "altura nativa"
        # (entre fileira top e bot, em coords pré-rotação) usamos bbox_h
        # quando orient é 0/2 e bbox_w quando orient é 1/3.
        bbox_w = comp.get("bbox_w")
        bbox_h = comp.get("bbox_h")
        h_real = bbox_w if (orient & 3) in (1, 3) else bbox_h
        if isinstance(h_real, int) and h_real > 3:
            h = h_real - 3
        else:
            h = offsets["_h"]
        if idx < n:
            dx, dy = offsets["_top"][idx], 0
        elif idx < 2 * n:
            dx, dy = offsets["_bot"][idx - n], h

    if dx is None: return None
    dx, dy = aplicar_orientacao(dx, dy, orient)
    return (cx + dx, cy + dy)

def ponto_no_segmento(p, a, b, tol=2):
    px, py = p; ax, ay = a; bx, by = b
    if abs(ay - by) <= tol and abs(py - ay) <= tol:
        return min(ax, bx) - tol <= px <= max(ax, bx) + tol
    if abs(ax - bx) <= tol and abs(px - ax) <= tol:
        return min(ay, by) - tol <= py <= max(ay, by) + tol
    return False

# ============================================================================
# PARSER ATUALIZADO (Extraindo IDs de Fios Nativos)
# ============================================================================
def parse_cad(arquivo):
    try:
        with open(arquivo, 'r', encoding='latin-1', errors='ignore') as f:
            conteudo = f.read()
    except FileNotFoundError:
        return None

    # Cortar no primeiro $$$: o trailer marca o fim dos componentes. Arquivos
    # que tiveram histórico de saves múltiplos (ex: COMANDO_PROJETO) podem ter
    # restos de versões antigas DEPOIS do trailer com componentes-fantasma que
    # não fazem parte do circuito atual.
    fim_dados = conteudo.find('$$$')
    if fim_dados != -1:
        conteudo = conteudo[:fim_dados]

    # Códigos válidos têm 4-5 dígitos (1000-99999). Restringir aqui filtra
    # rótulos e fragmentos curtos como `*190*8#` (texto "LIGADO") que casavam
    # com `[1-9]\d{0,4}`. Lookahead `(?=[^*])` rejeita o trailing pair
    # `*<net_term0>*<net_term1>#` (ex: `*20*22#`) que tem o mesmo formato e
    # quebraria o bloco anterior em dois — componentes reais têm cabeçalho
    # com letra/`#` logo depois do `#` inicial.
    inicios = [(m.start(), m.group(1), m.group(2))
               for m in re.finditer(r'\*(\d+)\*([1-9]\d{3,4})#(?=[^*])', conteudo)]
    componentes = []

    for i, (pos, id_comp, codigo) in enumerate(inicios):
        fim = inicios[i+1][0] if i+1 < len(inicios) else len(conteudo)
        bloco = conteudo[pos:fim]
        codigo = codigo.lstrip('0') or '0'

        if codigo in TIPOS_WIRES:
            partes = bloco.split('*')
            try:
                # Estrutura rígida do wire (26 campos após split('*')):
                #   [0]=''  [1]=ID  [2]=CODIGO+#####  [3..10]=8 flags
                #   [11]=x1 [12]=y1 [13]=x2 [14]=y2
                #   [15..23]=9 zeros  [24]=NET_ID  [25]='0#'
                # Para o último componente do arquivo, o bloco engole o trailer
                # ($$$...&&&...), então NUNCA usar partes[-2] — usar índice fixo 24.
                if len(partes) >= 26:
                    x1 = int(partes[11]); y1 = int(partes[12])
                    x2 = int(partes[13]); y2 = int(partes[14])
                    net_id = partes[24] if partes[24].lstrip('-').isdigit() else "0"

                    componentes.append({
                        "id": id_comp, "codigo": codigo, "tipo": "wire",
                        "nome": "", "terminais": [], "x": x1, "y": y1,
                        "x2": x2, "y2": y2, "net_id": net_id
                    })
            except (ValueError, IndexError):
                pass
            continue
        # Códigos não catalogados (ex: anotações, frame de página) com prefixo
        # exótico — pula só os explicitamente fora do escopo elétrico.
        # 20000 = frame XXX, 3015 = marcador visual de junção (sem terminal
        # elétrico — bbox 8x8, decorativo). 8023 = botão 3D visual (interativo
        # no CADe_SIMU mas sem função elétrica — os contatos reais estão nos
        # códigos 8000/8001). Sem terminais pra rotear, mas bloqueia o painel
        # mostrando uma entrada vazia se passar e corrompendo net_hints.
        if codigo in {"20000", "3015", "8023"}: continue

        m_pref = re.match(r'\*\d+\*\d+#(.*)$', bloco, re.DOTALL)
        if not m_pref: continue
        resto = m_pref.group(1)

        idx_flags = resto.find('*')
        cabecalho = resto[:idx_flags if idx_flags != -1 else len(resto)]
        campos = cabecalho.split('#')

        nome_raw = campos[0].strip() if campos else ''
        # '0' appears in headers of 8023-variant buttons as a state marker, not a terminal
        terminais = [p for p in campos[1:] if p
                     and re.match(r'^[A-Za-z0-9_+\-]{1,4}$', p)
                     and p != '0']
        # Sinaleiros (9008+: X1, X2, "0"/"1"/"2"...) e timers (9004: A1, A2,
        # "0", "10") listam rótulos de estado/cor/tempo no cabeçalho como se
        # fossem terminais. Filtra: se há pelo menos um nome elétrico (X1, A1,
        # PE, etc), corta no último elemento nomeado/com letra. Mantém listas
        # puramente numéricas (1,3,5,2,4,6 de contatos de potência).
        if terminais:
            ELETRICOS_NOMEADOS = {"X1", "X2", "A1", "A2", "A3", "+", "-",
                                  "PE", "U1", "V1", "W1", "U2", "V2", "W2",
                                  "L1", "L2", "L3", "N", "F1", "F2",
                                  "RA", "RC", "IN", "V+", "AI", "AO", "0V",
                                  "I1", "I2", "I3", "I4", "Q1", "Q2", "Q3", "Q4",
                                  "K", "L", "M"}
            if any(t in ELETRICOS_NOMEADOS for t in terminais):
                fim = 0
                for i, t in enumerate(terminais):
                    if t in ELETRICOS_NOMEADOS or any(c.isalpha() for c in t):
                        fim = i + 1
                terminais = terminais[:fim]

        info_tipo = TIPOS_COMPONENTES.get(codigo)
        if info_tipo is not None:
            categoria, _, terminais_padrao = info_tipo
        else:
            # Código desconhecido: só registra se o bloco tem assinatura
            # de componente (cabeçalho não-vazio com nome ou terminais).
            # Sem isso, o regex pega flags numéricas dentro de outros
            # blocos como falsos componentes (ex: '*30*31#' no fim de
            # uma definição vira id=30/codigo=31).
            if not cabecalho or (not nome_raw and not terminais):
                continue
            categoria, terminais_padrao = "outro", None

        nome = nome_raw or f"{codigo}_{id_comp}"
        # Respeita os terminais que o usuário renomeou no CADe_SIMU (ex: botão
        # com '1','2' em vez de '11','12'). terminais_padrao só entra como
        # fallback quando o bloco do .cad não lista nenhum (caso das fontes
        # 3004/3005, cujo cabeçalho é vazio mas precisamos de L1/L2/L3/N).
        if not terminais and terminais_padrao:
            terminais = list(terminais_padrao)

        x = y = 0
        orient = 0
        bbox_w = bbox_h = None
        net_hints = {}  # terminal_name -> net_id (vindo do trailing pair)
        partes = resto[idx_flags:].split('*')
        try:
            if len(partes) > 10: x = int(partes[9]); y = int(partes[10])
        except ValueError: pass
        try:
            # partes[18] codifica rotação/espelho do CADe_SIMU.
            # Sem isso, terminais de componentes espelhados/rotacionados caem
            # em coordenadas erradas e o detector mistura redes diferentes.
            if len(partes) > 18: orient = int(partes[18])
        except ValueError: pass
        try:
            # partes[15..16] = bbox (w, h) DEPOIS de aplicar a rotação visual.
            # O _h da paleta é em coords pré-rotação, então rotacionando 90°
            # o bbox h vira bbox w (e vice-versa). calcular_posicao_terminal
            # escolhe qual usar baseado no orient.
            if len(partes) > 16:
                bbox_w = int(partes[15])
                bbox_h = int(partes[16])
        except ValueError: pass

        # CADe_SIMU grava o net_id dos 2 PRIMEIROS terminais do componente
        # nos campos partes[22] e partes[23] (último é "<num>#"). Componentes
        # de 2 terminais têm cobertura completa nesses campos; com 4/6/8 só
        # os dois primeiros aparecem aqui (o resto vem por coordenada). Esses
        # hints são INDEPENDENTES de rotação/orient, então servem como fonte
        # de verdade lógica que sobrevive a bugs de offset.
        try:
            if len(partes) > 23 and len(terminais) >= 1:
                n0 = partes[22]
                if n0 and n0.lstrip('-').isdigit() and n0 != "0":
                    net_hints[terminais[0]] = n0
            if len(partes) > 23 and len(terminais) >= 2:
                n1 = partes[23].rstrip('#')
                if n1 and n1.lstrip('-').isdigit() and n1 != "0":
                    net_hints[terminais[1]] = n1
        except (ValueError, IndexError): pass

        componentes.append({
            "id": id_comp, "codigo": codigo, "tipo": categoria, "nome": nome.lstrip('-'),
            "terminais": terminais, "x": x, "y": y, "orient": orient,
            "bbox_w": bbox_w, "bbox_h": bbox_h,
            "net_hints": net_hints,
        })

    # NÃO agrupar peças físicas com mesmo nome (bobina + contatos auxiliares).
    # Cada peça tem sua própria posição (x,y) e código no .cad — agrupar destruiria
    # essas posições e impediria detectar_nets() de calcular onde cada terminal está.
    # O agrupamento lógico (somar terminais sob uma mesma tag) é feito downstream
    # em painel_gui.py (todos_componentes) usando o campo 'nome'.

    # Deduplicar apenas blocos de entrada (terminal blocks): cada placement físico
    # de um bloco de terminais vira um componente independente (X → X, X2, X3…).
    # Não renomear contatos de contatoras/relés (K1 coil + K1 contacts = mesmo K1).
    _name_seen: dict = {}
    for comp in componentes:
        if comp.get('tipo') != 'entrada':
            continue
        nome_c = comp.get('nome', '')
        if not nome_c:
            continue
        if nome_c not in _name_seen:
            _name_seen[nome_c] = 1
        else:
            _name_seen[nome_c] += 1
            comp['nome'] = f"{nome_c}{_name_seen[nome_c]}"

    m_x = re.search(r'\*(\d+)\*3004#(-?X)', conteudo)
    if m_x and not any(c.get('codigo') == '3004' for c in componentes):
        componentes.insert(0, {
            "id": m_x.group(1), "codigo": "3004", "tipo": "entrada",
            "nome": m_x.group(2).lstrip('-'), "terminais": ["L1", "L2", "L3"], "x": 0, "y": 0
        })

    return componentes

# ============================================================================
# PARSER DE REDES POR ID NATIVO DO CADe_SIMU
# ============================================================================

def parse_cad_wire_networks(cad_path):
    """Extrai redes do CAD usando IDs de rede de fios and conecta terminais."""
    networks = defaultdict(list)
    try:
        with open(cad_path, 'r', encoding='latin-1', errors='ignore') as f:
            content = f.read()
    except Exception:
        return {}

    componentes = parse_cad(cad_path)
    comp_by_pos = {}
    for comp in componentes:
        if comp.get('tipo') != 'wire':
            nome = comp.get('nome', '')
            if nome:
                comp_by_pos[(comp.get('x', 0), comp.get('y', 0))] = nome

    for line in content.splitlines():
        line = line.strip()
        if not line:
            continue
        if not line.startswith('*97*'):
            continue
        if not any(code in line for code in TIPOS_WIRES):
            continue

        parts = line.split('*')
        if len(parts) < 3 or not parts[-2].isdigit():
            continue

        net_id = parts[-2]
        coords = [int(p) for p in parts[:-2] if p.isdigit()]
        wire_points = [(coords[i], coords[i+1]) for i in range(0, len(coords)-1, 2)]

        connected_names = set()
        for x, y in wire_points:
            if (x, y) in comp_by_pos:
                connected_names.add(comp_by_pos[(x, y)])
            for dx in (-6, 0, 6):
                for dy in (-12, 0, 12):
                    pos = (x + dx, y + dy)
                    if pos in comp_by_pos:
                        connected_names.add(comp_by_pos[pos])

        for comp_name in connected_names:
            comp = next((c for c in componentes if c.get('nome') == comp_name), None)
            if not comp:
                continue
            for term in comp.get('terminais', []):
                pos = calcular_posicao_terminal(comp, term)
                if not pos:
                    continue
                tx, ty = pos
                for wx, wy in wire_points:
                    if abs(tx - wx) <= 3 and abs(ty - wy) <= 3:
                        networks[net_id].append((comp_name, term))
                        break

    for net_id in list(networks.keys()):
        terminais = list(dict.fromkeys(networks[net_id]))
        if len(terminais) < 2:
            del networks[net_id]
        else:
            networks[net_id] = terminais

    return dict(networks)

# ============================================================================
# DETECÇÃO DE NETS (Baseada em Union-Find + Proximidade ou net_ids nativos)
# ============================================================================

class UnionFind:
    def __init__(self):
        self.parent = {}

    def find(self, x):
        if x not in self.parent:
            self.parent[x] = x
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]

    def union(self, x, y):
        rx, ry = self.find(x), self.find(y)
        if rx != ry:
            self.parent[rx] = ry

    def grupos(self):
        g = defaultdict(list)
        for x in list(self.parent.keys()):
            g[self.find(x)].append(x)
        return list(g.values())

def _nets_por_id_nativo(componentes, snap_radius=2):
    """Mapeia terminais → net_id usando os IDs nativos do CADe_SIMU nos fios.
    Retorna {net_id: [(nome, terminal), ...]} sem filtrar tamanho."""
    nets_map = defaultdict(list)
    wires_por_net = defaultdict(list)
    for c in componentes:
        if c.get("tipo") == "wire" and c.get("net_id") and c["net_id"] != "0":
            wires_por_net[c["net_id"]].append(c)
    if not wires_por_net:
        return {}

    for c in componentes:
        if c.get("tipo") == "wire": continue
        nome = c.get("nome", "")
        if not nome: continue
        for t in c.get("terminais", []):
            pos = calcular_posicao_terminal(c, t)
            if not pos: continue
            for net_id, wires in wires_por_net.items():
                achou = False
                for w in wires:
                    p1 = (w["x"], w["y"])
                    p2 = (w.get("x2", w["x"]), w.get("y2", w["y"]))
                    if ponto_no_segmento(pos, p1, p2, tol=snap_radius):
                        nets_map[net_id].append((nome, t))
                        achou = True
                        break
                if achou: break

    # Dedup mantendo ordem
    out = {}
    for net_id, terms in nets_map.items():
        vistos = set()
        out[net_id] = [t for t in terms if not (t in vistos or vistos.add(t))]
    return out


def _nets_por_uniao_geometrica(componentes, snap_radius=2):
    """Detecção geométrica via UnionFind: une endpoints de fios, snap por
    proximidade, T-junctions, e anexa terminais de componentes pelos pontos.
    Retorna lista de listas: [[(nome, term), ...], ...]"""
    uf = UnionFind()
    wires = [c for c in componentes if c.get("tipo") == "wire"]
    for w in wires:
        p1 = (w["x"], w["y"])
        p2 = (w.get("x2", w["x"]), w.get("y2", w["y"]))
        uf.union(p1, p2)

    ponto_para_terminais = defaultdict(list)
    for c in componentes:
        if c.get("tipo") == "wire": continue
        nome = c.get("nome", "")
        if not nome: continue
        for t in c.get("terminais", []):
            pos = calcular_posicao_terminal(c, t)
            if pos:
                ponto_para_terminais[pos].append((nome, t))
                uf.find(pos)

    pontos_unicos = list(uf.parent.keys())
    for i, p in enumerate(pontos_unicos):
        for q in pontos_unicos[i+1:]:
            if abs(p[0] - q[0]) <= snap_radius and abs(p[1] - q[1]) <= snap_radius:
                uf.union(p, q)
    for w in wires:
        a = (w["x"], w["y"])
        b = (w.get("x2", w["x"]), w.get("y2", w["y"]))
        if a == b: continue
        for p in pontos_unicos:
            if p == a or p == b: continue
            if ponto_no_segmento(p, a, b, tol=snap_radius):
                uf.union(p, a)

    grupos_out = []
    for grupo in uf.grupos():
        terms = []
        for ponto in grupo:
            terms.extend(ponto_para_terminais.get(ponto, []))
        vistos = set()
        terms = [t for t in terms if not (t in vistos or vistos.add(t))]
        if terms:
            grupos_out.append(terms)
    return grupos_out


def detectar_nets(componentes, snap_radius=2):
    """Detecta redes combinando 3 fontes complementares.

    1) Hints lógicos (`net_hints` por componente): partes[22..23] do bloco
       gravam o net_id dos 2 primeiros terminais. Independente de coordenada
       e rotação — fonte da verdade pra componentes de 2 terminais (botão,
       contato aux, bobina, sinaleiro), que dominam circuitos de comando.
    2) IDs nativos dos fios (`_nets_por_id_nativo`): mapeia terminais a redes
       comparando posição calculada × segmento de fio numerado.
    3) União geométrica (`_nets_por_uniao_geometrica`): UnionFind por
       coordenada com snap e T-junction. Pega o que (1) e (2) perderam.

    Merge: hints (1) plantam o esqueleto, (2) preenche os terminais restantes,
    (3) completa lacunas e cria redes AUTO quando não há net_id nativo.
    Conflitos: (1) > (2) > (3) — hints lógicos são autoritativos porque vêm
    direto do que o CADe_SIMU gravou pro próprio simulador interno.
    """
    nets_native = _nets_por_id_nativo(componentes, snap_radius)
    grupos_geo = _nets_por_uniao_geometrica(componentes, snap_radius)

    # Índice reverso: terminal -> net_id onde já foi mapeado.
    term_to_native = {}
    for net_id, terms in nets_native.items():
        for t in terms:
            term_to_native[t] = net_id

    nets_merged = {nid: list(terms) for nid, terms in nets_native.items()}

    # Etapa 1: aplicar hints lógicos de forma CONSERVADORA.
    # partes[22..23] do componente carregam IDs de rede pra alguns tipos
    # (botões, contatos aux, contatores, disjuntores), mas outros (motor 1000,
    # certos geradores) usam esses campos pra coords de label — o número não
    # é um net válido. Validamos antes de aplicar:
    #   - Se a rede do hint já existe como net nativa → o hint é consistente,
    #     usamos pra preencher um terminal que coord não pegou.
    #   - Se o coord-based já colocou o terminal numa rede DIFERENTE, mantemos
    #     o coord-based (mais confiável quando há divergência).
    redes_validas = set(nets_native.keys())
    for c in componentes:
        if c.get("tipo") == "wire": continue
        nome = c.get("nome", "")
        if not nome: continue
        for term, hint_net in c.get("net_hints", {}).items():
            if hint_net not in redes_validas:
                continue  # net inexistente — descarta (provável label offset)
            chave = (nome, term)
            atual = term_to_native.get(chave)
            if atual is not None:
                continue  # coord já posicionou; respeita
            nets_merged.setdefault(hint_net, [])
            if chave not in nets_merged[hint_net]:
                nets_merged[hint_net].append(chave)
            term_to_native[chave] = hint_net

    auto_idx = 1
    for grupo in grupos_geo:
        nativas_alvo = []
        for t in grupo:
            nid = term_to_native.get(t)
            if nid and nid not in nativas_alvo:
                nativas_alvo.append(nid)

        if len(nativas_alvo) == 1:
            alvo = nativas_alvo[0]
            ja_tem = set(nets_merged[alvo])
            for t in grupo:
                if t not in ja_tem:
                    nets_merged[alvo].append(t)
                    term_to_native[t] = alvo
        elif len(nativas_alvo) == 0:
            if len(grupo) >= 2:
                key = f"AUTO{auto_idx}"
                auto_idx += 1
                nets_merged[key] = list(grupo)
                for t in grupo:
                    term_to_native[t] = key

    nets = []
    for net_id, terms in nets_merged.items():
        if len(terms) < 2: continue
        if str(net_id).startswith("AUTO"):
            desc = "Rede detectada (geométrica)"
            label = f"NET_{net_id}"
        else:
            desc = f"Rede nativa {net_id}"
            label = f"NET_{net_id}"
        nets.append((label, desc, terms))
    return nets

# ============================================================================
# O MOTOR DE ROTEAMENTO (Teoria dos Grafos Aplicada)
# ============================================================================
_POSICOES_AUTO = {}

def popular_posicoes_auto(componentes, config_painel=None):
    global _POSICOES_AUTO
    _POSICOES_AUTO.clear()

    if config_painel:
        for z in ["interno", "tampa"]:
            for linha_idx, grid in enumerate(config_painel.get(z, {}).get("grids", [])):
                for coluna_idx, nome in enumerate(grid):
                    _POSICOES_AUTO[nome] = {"zona": z, "linha": linha_idx, "coluna": coluna_idx}

    # Fallback para o que nao esta no JSON
    for c in componentes:
        nome = c.get("nome", "")
        if nome and nome not in _POSICOES_AUTO and c.get("tipo") != "wire":
            _POSICOES_AUTO[nome] = {"zona": "interno", "linha": c.get("y",0)//6, "coluna": c.get("x",0)//6}

def classificar_componente(nome):
    if nome.startswith("DJ") or nome == "Q": return "disjuntor"
    if nome.startswith("T"): return "timer"
    if nome.startswith("S"): return "botao"
    if nome.startswith("K"): return "contator"
    if nome.startswith("H"): return "sinaleiro"
    return "outro"

# Terminal classifications
# PE is kept separate from N so we can distinguish earth from neutral
_TERMOS_TERRA = {'PE'}  # Protective Earth — always yellow-green wire
_TERMOS_NEUTRO = {'N'}  # Neutral — blue wire
_TERMOS_FORCA = {
    'N', 'L1', 'L2', 'L3', 'T1', 'T2', 'T3',
    'U', 'V', 'W', 'R', 'S', 'T', 'X1', 'X2',
} | _TERMOS_TERRA
_COMP_FORCA = {'disjuntor', 'contator'}  # componentes de força (K*, DJ*)

def _eh_rede_terra(terminais):
    """Retorna True se a rede inclui terminal PE (terra / aterramento)."""
    return any(t.upper() in _TERMOS_TERRA for _, t in terminais)

def _eh_rede_forca(terminais):
    """Retorna True se a rede conecta terminais de potência (circuito de força).

    Critério: algum terminal é dígito simples 1-6 em componente de força,
    ou tem nome explícito de potência (L1, T1, U, V, W, PE...).
    """
    for comp, term in terminais:
        t_up = term.upper()
        if t_up in _TERMOS_FORCA:
            return True
        cat = classificar_componente(comp)
        if cat in _COMP_FORCA and term.isdigit() and 1 <= int(term) <= 6:
            return True
    return False


# ============================================================================
# PARES DE TERMINAIS (input/output do mesmo polo) — usados pra encadear redes.
# Ex: rede que tem K1:13 (input do contato NA) "alimenta" rede que tem K1:14
# (output do mesmo contato). O fluxo de montagem segue esse encadeamento.
# ============================================================================
def _build_terminal_pairs():
    """Pares de CONTATO (chave) onde o terminal-par está na MESMA fase do
    terminal original — corrente atravessa o componente sem mudar de fase.
    Carga (bobina A1↔A2, lâmpada X1↔X2) NÃO entra aqui: a corrente sai do
    outro lado já em fase oposta. Pra seguir o fluxo de montagem só vale
    atravessar contatos.
    """
    pairs = {}
    def add(a, b):
        pairs[a] = b
        pairs[b] = a
    # Contatos de potência (1-2, 3-4, 5-6, 7-8) — entrada e saída do mesmo polo
    for top in (1, 3, 5, 7):
        add(str(top), str(top + 1))
    # Contatos auxiliares (IEC: dezena=índice do contato, unidade=NA/NF)
    # NA: 13/14, 23/24, ..., 83/84   |   NF: 11/12, 21/22, ..., 81/82
    for dezena in range(1, 9):
        add(f"{dezena}1", f"{dezena}2")  # NF (mesmo polo)
        add(f"{dezena}3", f"{dezena}4")  # NA (mesmo polo)
    # Timers (contatos auxiliares com numeração própria)
    add("55", "56"); add("57", "58")
    add("65", "66"); add("67", "68")
    # Relé térmico (contatos auxiliares 95-96 NF e 97-98 NA, separados)
    add("95", "96"); add("97", "98")
    # NOTE: A1↔A2 (bobina) e X1↔X2 (lâmpada) NÃO entram aqui.
    # São CARGAS entre + e -, atravessar muda de fase. Quando o detector
    # chegar num desses terminais via uma rede, a próxima rede que continua
    # do MESMO lado da carga é encontrada por componente compartilhado, não
    # por par. Isso garante que o trilho negativo (FT:4 → bobinas A2) não
    # vire ponto de entrada na fase positiva (controle).
    return pairs

TERMINAL_PAIRS = _build_terminal_pairs()


def par_terminal(term):
    """Retorna o terminal-par de mesma fase (contato), ou None pra cargas."""
    return TERMINAL_PAIRS.get(term)


def _e_terminal_fonte(t):
    """Identifica terminais de fonte (X:L1/L2/L3/N, ±, etc)."""
    comp, term = t
    if comp in ("X", "-X"): return True
    if term in ("L1", "L2", "L3", "N", "+", "-"): return True
    return False


def ordenar_nets_por_fluxo(nets):
    """Reordena (net_id, desc, terminais) seguindo fluxo de energia.

    Estratégia: DFS percorrendo pares input/output dos terminais, priorizando
    redes de MENOR ramificação primeiro (chain-like). Isso desce pela cadeia
    mais longa de redes-de-passagem (cada uma com 2-3 termos) antes de tocar
    nos trilhos grandes (rails de 14+ termos).

    Lógica:
    - Da fonte (X), entra no DJ (rede de 2 termos), sai do DJ pro FT (2 termos).
    - No FT a saída se divide em FT:3 (chain longa: RT → S0 → S1 → rail) e
      FT:4 (trilho simples direto pras bobinas). Ramificação ascendente faz a
      chain longa (FT:3, 3 termos) ser percorrida ANTES do trilho FT:4 (14
      termos diretos), porque dentro do FT:3 caminhamos por nets de 2-3 termos
      que viram o último ponto de junção (rail).
    - O trilho final (FT:4 → bobinas) fica pro fim, junto com cross-conexões.

    Quando a DFS-por-par esgota uma frente, expande pra unvisited que
    compartilha componente, ainda priorizando menor ramificação. Redes
    desconectadas (raras, sem caminho geométrico) entram no final.
    """
    if not nets:
        return list(nets)

    term_to_net = {}
    for n in nets:
        for t in n[2]:
            term_to_net.setdefault(t, n)

    visited_ids = set()
    ordered = []

    def visit(n):
        if id(n) in visited_ids:
            return
        visited_ids.add(id(n))
        ordered.append(n)
        seen = set()
        neighbors = []
        for comp, term in n[2]:
            par = par_terminal(term)
            if par is None:
                continue
            nxt = term_to_net.get((comp, par))
            if nxt and id(nxt) not in visited_ids and id(nxt) not in seen:
                seen.add(id(nxt))
                neighbors.append(nxt)
        # Menor ramificação primeiro (caminho de chain antes de rail).
        neighbors.sort(key=lambda x: len(x[2]))
        for nxt in neighbors:
            visit(nxt)

    fontes = sorted([n for n in nets if any(_e_terminal_fonte(t) for t in n[2])],
                    key=lambda n: -len(n[2]))
    for f in fontes:
        visit(f)

    # Quando a DFS dos pares esgota, ainda há nets desconectadas-via-par mas
    # conectadas via componente compartilhado. Pega elas progressivamente.
    while True:
        unvisited = [n for n in nets if id(n) not in visited_ids]
        if not unvisited:
            break
        visited_comps = {c for n in ordered for c, _ in n[2]}
        conectadas = [n for n in unvisited
                      if any(c in visited_comps for c, _ in n[2])]
        if conectadas:
            conectadas.sort(key=lambda x: len(x[2]))
            visit(conectadas[0])
        else:
            unvisited.sort(key=lambda n: -len(n[2]))
            visit(unvisited[0])

    return ordered

def rotear_net_inteligente(net_id, descricao, terminais, terminal_preferido_inicio=None):
    """Roteia uma rede em árvore geradora mínima (MST gulosa).

    Quando `terminal_preferido_inicio` é fornecido E está nos terminais da
    rede, usa esse como ponto de partida (assim a rede começa a ser cabeada
    onde o checklist parou na rede anterior — continuidade física pra quem
    tá montando). Sem hint, testa todos os terminais e escolhe o que produz
    menor custo total.
    """
    if len(terminais) < 2: return []

    # Verificar se todos os terminais são do mesmo componente
    componentes = set(t[0] for t in terminais)
    if len(componentes) == 1:
        # Todos do mesmo componente: conectar em cadeia linear ordenada por número do terminal
        comp = list(componentes)[0]
        sorted_terminais = sorted(terminais, key=lambda t: int(t[1]) if t[1].isdigit() else 0)
        rota = []
        for i in range(len(sorted_terminais) - 1):
            origem = sorted_terminais[i]
            destino = sorted_terminais[i + 1]
            rota.append({
                "net": net_id,
                "descricao": descricao,
                "origem": origem,
                "destino": destino,
                "tipo": "jump"
            })
        return rota

    def get_limite(t, limite_global):
        comp = t[0]
        if classificar_componente(comp) == "timer": return 1
        return limite_global

    def calc_custo(u, v, graus):
        comp_u, comp_v = u[0], v[0]

        # Jumps internos têm desconto, mas pequeno — evita virar uma "estrela"
        # em volta de um único terminal do componente. Antes era -1000, o que
        # fazia 1 terminal absorver 3 fios (1 cabo + 2 jumps) ao invés de
        # encadear: K4:13 -> K4:31 -> K4:43 (cada terminal com degree 2).
        if comp_u == comp_v:
            return -10

        info_u = _POSICOES_AUTO.get(comp_u, {"zona":"interno", "linha":0, "coluna":0})
        info_v = _POSICOES_AUTO.get(comp_v, {"zona":"interno", "linha":0, "coluna":0})

        # Custo de distâncias físicas
        dx = abs(info_u["coluna"] - info_v["coluna"]) * 10
        dy = abs(info_u["linha"] - info_v["linha"]) * 10
        custo = dx + dy

        if info_u["zona"] != info_v["zona"]:
            custo += 50

        # Penalidade pra forçar linha reta ("Daisy-chain"). graus 2+ vira
        # parede dura porque o limite global geralmente é 2 — só passa pra 3
        # via fallback abaixo.
        if graus[u] >= 2: custo += 1000
        if graus[v] >= 2: custo += 1000
        return custo

    def construir_mst(limite_global, inicio):
        """Tenta construir MST com `limite_global` como teto de fios por
        terminal. Retorna (rota, custo) ou (None, ∞) se infeasivel."""
        conectados = {inicio}
        desconectados = set(terminais) - {inicio}
        graus = {t: 0 for t in terminais}
        rota_atual = []
        custo_total = 0

        while desconectados:
            melhor_aresta = None
            menor_custo = float('inf')

            for u in conectados:
                if graus[u] >= get_limite(u, limite_global): continue
                for v in desconectados:
                    if graus[v] >= get_limite(v, limite_global): continue
                    custo = calc_custo(u, v, graus)
                    if custo < menor_custo:
                        menor_custo = custo
                        melhor_aresta = (u, v)

            if not melhor_aresta:
                return None, float('inf')  # infeasivel com este limite

            u, v = melhor_aresta
            tipo = "jump" if u[0] == v[0] else "cabo"
            rota_atual.append({"net": net_id, "descricao": descricao,
                               "origem": u, "destino": v, "tipo": tipo})
            custo_total += (menor_custo if menor_custo > 0 else 0)
            graus[u] += 1
            graus[v] += 1
            conectados.add(v)
            desconectados.remove(v)

        return rota_atual, custo_total

    if terminal_preferido_inicio and terminal_preferido_inicio in terminais:
        candidatos_inicio = [terminal_preferido_inicio]
    else:
        candidatos_inicio = list(terminais)

    # Tenta primeiro com limite=2 (daisy-chain puro, todos os terminais
    # encadeados). Se nenhum início produzir MST viável (ex: rede com
    # restrição que requer hub), eleva pra 3. Resultado: o relatório de
    # carga só mostra ":3" em redes onde realmente é necessário.
    melhor_rota = []
    melhor_custo = float('inf')
    for limite in (2, 3):
        for inicio in candidatos_inicio:
            rota, custo = construir_mst(limite, inicio)
            if rota is not None and custo < melhor_custo:
                melhor_custo = custo
                melhor_rota = rota
        if melhor_rota:
            break  # achou solução com limite atual; não precisa subir
    return melhor_rota

# ============================================================================
# EXECUÇÃO E GERAÇÃO DE SAÍDAS
# ============================================================================
def gerar_relatorio_md(fios):
    out = ["# Relatório Inteligente de Cabeamento\n", "| Rede | Origem | Destino | Tipo |", "|---|---|---|---|"]
    for f in fios:
        out.append(f"| {f['net']} | {f['origem'][0]}:{f['origem'][1]} | {f['destino'][0]}:{f['destino'][1]} | {f['tipo'].upper()} |")
    return "\n".join(out)


def fmt_borne(b):
    return f"{b[0]}:{b[1]}"


def gerar_checklist_html(fios_forca, fios_comando, fios_terra=None):
    """Checklist A4 imprimível — terra primeiro, depois força, depois comando."""
    css = """
    @page { size: A4; margin: 12mm 14mm; }
    * { box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 10pt; color: #000; margin: 0; }
    h1 { font-size: 16pt; margin: 0 0 4mm 0; padding-bottom: 2mm; border-bottom: 0.6mm solid #000; }
    h2 { font-size: 12pt; margin: 6mm 0 2mm 0; padding: 1.5mm 2mm; background: #e8e8e8; border-left: 4mm solid #0066cc; }
    h2.terra { background: #f0ffe0; border-left-color: #4d9e00; color: #2d5c00; }
    .header-info { font-size: 8.5pt; color: #555; margin-bottom: 4mm; }
    .legenda { font-size: 8.5pt; background: #fff8dc; border-left: 1mm solid #d4a000; padding: 2mm 3mm; margin-bottom: 4mm; line-height: 1.35; }
    table.checklist { width: 100%; border-collapse: collapse; font-size: 9.5pt; }
    table.checklist th, table.checklist td { border: 0.2mm solid #999; padding: 1.3mm 2mm; text-align: left; vertical-align: top; }
    table.checklist th { background: #f0f0f0; font-weight: bold; font-size: 9pt; }
    table.checklist td.num { width: 10mm; text-align: center; font-weight: bold; }
    table.checklist td.box { width: 7mm; text-align: center; font-size: 11pt; }
    table.checklist td.tipo { width: 14mm; text-align: center; font-size: 8pt; }
    table.checklist td.origem, table.checklist td.destino { width: 22mm; font-family: 'Courier New', monospace; font-weight: bold; }
    table.checklist td.descricao { font-size: 8.5pt; color: #444; }
    .tipo-cabo { background: #e6f3ff; }
    .tipo-jump { background: #fff4e6; font-style: italic; }
    .tipo-cabo.terra-row { background: #f0ffe0; }
    .tipo-jump.terra-row { background: #f8fff0; }
    .net-sep td { background: #d8d8d8 !important; font-size: 8pt !important; padding: 0.8mm 2mm !important; color: #333; }
    .net-sep.terra-net td { background: #c8e8a0 !important; color: #1a4a00; }
    .page-break { page-break-after: always; }
    """

    def render_secao(titulo, fios, prefixo_num, terra=False):
        h2_class = " class='terra'" if terra else ""
        row_extra = " terra-row" if terra else ""
        sep_extra = " terra-net" if terra else ""
        html = [f"<h2{h2_class}>{titulo}</h2>", "<table class='checklist'>",
                "<thead><tr><th>#</th><th>Ok</th><th>Tipo</th>"
                "<th>Origem</th><th>&rarr;</th><th>Destino</th><th>Descrição</th></tr></thead>",
                "<tbody>"]
        ultimo_net = None
        for i, f in enumerate(fios, 1):
            num = f"{prefixo_num}{i:02d}"
            if f["net"] != ultimo_net:
                html.append(f"<tr class='net-sep{sep_extra}'><td colspan='7'><b>Rede {f['net']}</b> &mdash; {f.get('descricao','')}</td></tr>")
                ultimo_net = f["net"]
            classe = "tipo-cabo" if f["tipo"] == "cabo" else "tipo-jump"
            tipo_label = "CABO" if f["tipo"] == "cabo" else "JUMP"
            html.append(f"<tr class='{classe}{row_extra}'>"
                        f"<td class='num'>{num}</td>"
                        f"<td class='box'>&#9744;</td>"
                        f"<td class='tipo'>{tipo_label}</td>"
                        f"<td class='origem'>{fmt_borne(f['origem'])}</td>"
                        f"<td>&rarr;</td>"
                        f"<td class='destino'>{fmt_borne(f['destino'])}</td>"
                        f"<td class='descricao'>{f.get('descricao','')}</td>"
                        f"</tr>")
        html.append("</tbody></table>")
        return "\n".join(html)

    parts = ["<!DOCTYPE html><html lang='pt-BR'><head><meta charset='UTF-8'>",
             "<title>Checklist de Montagem</title>",
             f"<style>{css}</style></head><body>",
             "<h1>Checklist de Montagem do Painel</h1>",
             "<div class='header-info'>Gerado por <code>analisar_cad.py</code>. Imprima em A4 e marque cada passo conforme conclui.</div>",
             "<div class='legenda'><b>Como usar:</b><br>"
             "1. Monte TERRA (PE) primeiro (verde/amarelo), depois FORÇA (4 mm²), depois COMANDO (2,5 mm²).<br>"
             "2. <b>CABO</b> = fio entre componentes diferentes (cole anilha).<br>"
             "3. <b>JUMP</b> = jumper interno do mesmo componente (sem anilha).<br>"
             "4. Cada borne aceita até 3 fios. Marque a coluna Ok ao concluir.</div>"]
    any_prev = False
    if fios_terra:
        parts.append(render_secao("⏚ Terra / PE (verde-amarelo)", fios_terra, "PE", terra=True))
        any_prev = True
    if fios_forca:
        if any_prev:
            parts.append("<div class='page-break'></div>")
        parts.append(render_secao("Circuito de FORÇA (4 mm²)", fios_forca, "F"))
        any_prev = True
    if fios_comando:
        if any_prev:
            parts.append("<div class='page-break'></div>")
        parts.append(render_secao("Circuito de COMANDO (2,5 mm²)", fios_comando, "C"))
    parts.append("</body></html>")
    return "\n".join(parts)


def gerar_anilhas_html(fios_forca, fios_comando, fios_terra=None):
    """Anilhas alinhadas ao checklist (mesma numeração PE##/F##/C##)."""
    css = """
    @page { size: A4; margin: 8mm; }
    * { box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 9pt; color: #000; margin: 0; }
    h1 { font-size: 14pt; margin: 0 0 3mm 0; padding-bottom: 1.5mm; border-bottom: 0.5mm solid #000; }
    h2 { font-size: 11pt; margin: 4mm 0 2mm 0; padding: 1mm 2mm; background: #e8e8e8; border-left: 3mm solid #0066cc; }
    h2.terra { background: #f0ffe0; border-left-color: #4d9e00; color: #2d5c00; }
    .legenda { font-size: 7.5pt; background: #fff8dc; border-left: 1mm solid #d4a000; padding: 1.5mm 2mm; margin-bottom: 3mm; line-height: 1.3; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1mm 1.5mm; }
    .label { display: grid; grid-template-columns: 1fr auto 1fr; border: 0.2mm dashed #aaa; height: 11mm; page-break-inside: avoid; }
    .label.control { height: 9mm; }
    .label.terra { border-color: #4d9e00; background: #f8fff0; }
    .label .text { display: flex; flex-direction: column; justify-content: center; align-items: center; font-weight: 900; font-size: 9pt; line-height: 1.05; padding: 0.3mm 0.5mm; text-align: center; }
    .label .text .num { font-size: 6.5pt; color: #0066cc; font-weight: bold; }
    .label.terra .text .num { color: #2d5c00; }
    .label .gap { width: 14mm; border-left: 0.15mm dashed #999; border-right: 0.15mm dashed #999; background: repeating-linear-gradient(45deg, #fff, #fff 0.8mm, #f0f0f0 0.8mm, #f0f0f0 1.6mm); }
    .label.terra .gap { background: repeating-linear-gradient(45deg, #e8ffe0, #e8ffe0 0.8mm, #c8f0b0 0.8mm, #c8f0b0 1.6mm); border-color: #4d9e00; }
    .label.control .gap { width: 11mm; }
    .page-break { page-break-after: always; }
    """

    def render_grid(titulo, fios, prefixo, control, terra=False):
        h2_class = " class='terra'" if terra else ""
        extra_cls = " terra" if terra else ""
        html = [f"<h2{h2_class}>{titulo}</h2>", "<div class='grid'>"]
        for i, f in enumerate(fios, 1):
            if f["tipo"] != "cabo":
                continue
            num = f"{prefixo}{i:02d}"
            a, b = fmt_borne(f["origem"]), fmt_borne(f["destino"])
            for local, remote in ((a, b), (b, a)):
                cls = f"label{' control' if control else ''}{extra_cls}"
                html.append(
                    f"<div class='{cls}'>"
                    f"<div class='text'><div class='num'>{num}</div><div>{local}</div><div>{remote}</div></div>"
                    f"<div class='gap'></div>"
                    f"<div class='text'><div class='num'>{num}</div><div>{local}</div><div>{remote}</div></div>"
                    f"</div>"
                )
        html.append("</div>")
        return "\n".join(html)

    parts = ["<!DOCTYPE html><html lang='pt-BR'><head><meta charset='UTF-8'>",
             "<title>Anilhas</title>",
             f"<style>{css}</style></head><body>",
             "<h1>Anilhas do Painel</h1>",
             "<div class='legenda'>Cada CABO gera 2 anilhas espelhadas (uma por ponta). JUMPs não recebem anilha. "
             "Número pequeno = passo no checklist. Anilhas PE/Terra têm fundo verde. "
             "Enrole o gap no cabo e cole as duas abas em bandeira.</div>"]
    any_prev = False
    if fios_terra:
        parts.append(render_grid("⏚ Terra / PE – Anilhas (verde-amarelo)", fios_terra, "PE", control=False, terra=True))
        any_prev = True
    if fios_forca:
        if any_prev:
            parts.append("<div class='page-break'></div>")
        parts.append(render_grid("FORÇA – Anilhas (4 mm²)", fios_forca, "F", control=False))
        any_prev = True
    if fios_comando:
        if any_prev:
            parts.append("<div class='page-break'></div>")
        parts.append(render_grid("COMANDO – Anilhas (2,5 mm²)", fios_comando, "C", control=True))
    parts.append("</body></html>")
    return "\n".join(parts)

def gerar_relatorio_html(todos_fios, nets_meta):
    """Relatório de análise: ramificação por rede + fios por terminal + alertas.

    Útil pra:
    - Conferir se a ordem do checklist faz sentido (redes mais ramificadas
      no topo dentro de cada bloco força/comando).
    - Achar terminais sobrecarregados (>3 fios = limite físico do borne).
    - Entender qual fase/saída da fonte alimenta mais coisa.
    """
    fios_per_terminal = {}
    for f in todos_fios:
        for t in (f['origem'], f['destino']):
            fios_per_terminal[t] = fios_per_terminal.get(t, 0) + 1

    # Estatísticas por rede: ramificação (qtd terminais) e qtd fios gerados
    fios_per_net = {}
    for f in todos_fios:
        nid = f['net']
        fios_per_net[nid] = fios_per_net.get(nid, 0) + 1

    css = """
    @page { size: A4; margin: 12mm 14mm; }
    * { box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 10pt; color: #000; margin: 0; }
    h1 { font-size: 16pt; margin: 0 0 4mm 0; padding-bottom: 2mm; border-bottom: 0.6mm solid #000; }
    h2 { font-size: 12pt; margin: 6mm 0 2mm 0; padding: 1.5mm 2mm; background: #e8e8e8; border-left: 4mm solid #0066cc; }
    .summary { background: #f0f8ff; padding: 3mm 4mm; margin-bottom: 4mm; border-left: 1mm solid #0066cc; font-size: 10pt; }
    .summary b { font-size: 12pt; color: #0066cc; }
    table { width: 100%; border-collapse: collapse; font-size: 9.5pt; margin-bottom: 4mm; }
    th, td { border: 0.2mm solid #999; padding: 1.3mm 2mm; text-align: left; }
    th { background: #f0f0f0; font-weight: bold; }
    td.num { text-align: right; font-family: 'Courier New', monospace; }
    tr.alert td { background: #ffe6e6; }
    tr.warn td { background: #fff8e0; }
    tr.heavy td { background: #e6f3ff; }
    .legenda { font-size: 8.5pt; color: #555; margin-top: 1.5mm; }
    """

    # Ordena fios_per_net pela ordem em nets_meta (pra refletir fluxo)
    ordem_nets = [n[1] for n in nets_meta]
    fios_per_net_ord = [(nid, fios_per_net.get(nid, 0)) for nid in ordem_nets]

    parts = ["<!DOCTYPE html><html lang='pt-BR'><head><meta charset='UTF-8'>",
             "<title>Relatório de Cabeamento</title>",
             f"<style>{css}</style></head><body>",
             "<h1>Relatório de Cabeamento</h1>"]

    total_cabos = sum(1 for f in todos_fios if f['tipo'] == 'cabo')
    total_jumps = sum(1 for f in todos_fios if f['tipo'] == 'jump')
    total_terms = len(fios_per_terminal)
    parts.append(f"<div class='summary'>"
                 f"<b>{total_cabos}</b> cabos &middot; "
                 f"<b>{total_jumps}</b> jumpers &middot; "
                 f"<b>{len(nets_meta)}</b> redes &middot; "
                 f"<b>{total_terms}</b> terminais conectados"
                 f"</div>")

    # === Ramificação por rede (ordenada por fluxo de energia) ===
    parts.append("<h2>Ramificação por rede</h2>")
    parts.append("<table><thead><tr><th>#</th><th>Rede</th><th>Descrição</th>"
                 "<th>Terminais</th><th>Fios</th><th>Componentes</th></tr></thead><tbody>")
    for i, (prefixo, nid, desc, terminais) in enumerate(nets_meta, 1):
        comps_unicos = sorted(set(t[0] for t in terminais))
        n_fios = fios_per_net.get(nid, 0)
        n_terms = len(terminais)
        classe = "heavy" if n_terms >= 5 else ""
        parts.append(f"<tr class='{classe}'>"
                     f"<td class='num'>{i}</td>"
                     f"<td><b>{nid}</b></td>"
                     f"<td>{desc}</td>"
                     f"<td class='num'>{n_terms}</td>"
                     f"<td class='num'>{n_fios}</td>"
                     f"<td>{', '.join(comps_unicos)}</td></tr>")
    parts.append("</tbody></table>")
    parts.append("<div class='legenda'>Linha azul = rede com 5+ terminais "
                 "(prioridade na ordem de montagem por ter mais ramificações).</div>")

    # === Fios por terminal (top carregados) ===
    parts.append("<h2>Carga por terminal</h2>")
    parts.append("<table><thead><tr><th>Terminal</th><th>Fios</th><th>Status</th></tr></thead><tbody>")
    LIMITE_BORNE = 3
    for (comp, term), n in sorted(fios_per_terminal.items(), key=lambda x: (-x[1], x[0][0], x[0][1])):
        if n > LIMITE_BORNE:
            classe, status = "alert", f"EXCEDIDO ({n}>{LIMITE_BORNE})"
        elif n == LIMITE_BORNE:
            classe, status = "warn", f"NO LIMITE ({LIMITE_BORNE})"
        else:
            classe, status = "", "OK"
        parts.append(f"<tr class='{classe}'>"
                     f"<td><b>{comp}:{term}</b></td>"
                     f"<td class='num'>{n}</td>"
                     f"<td>{status}</td></tr>")
    parts.append("</tbody></table>")
    parts.append("<div class='legenda'>Cada borne físico aceita até 3 fios. "
                 "Vermelho = capacidade ultrapassada (revisar layout). "
                 "Amarelo = no limite (sem folga pra alteração futura).</div>")

    parts.append("</body></html>")
    return "\n".join(parts)


def carregar_painel_config(caminho):
    import json
    try:
        with open(caminho, 'r', encoding='utf-8') as f: return json.load(f)
    except: return None

def main_auto(arquivos, base_dir):
    todos_fios = []
    todas_nets_meta = []  # (prefixo, net_id, desc, terminais) pra relatório
    config_painel = carregar_painel_config(base_dir / "painel_config.json")

    for idx, arq in enumerate(arquivos):
        comps = parse_cad(arq)
        if not comps: continue

        popular_posicoes_auto(comps, config_painel)
        nets = detectar_nets(comps)

        # Reordena seguindo fluxo de energia (fonte → carga, mais ramificada
        # primeiro). Sem isso o checklist intercala redes aleatoriamente.
        nets_ordenadas = ordenar_nets_por_fluxo(nets)

        print(f"=== REDES DETECTADAS PARA {arq} ===")
        for net_id, desc, terminais in nets_ordenadas:
            print(f"{net_id}: {desc} ({len(terminais)} term)")
            for t in terminais:
                print(f"  - {t[0]}:{t[1]}")
            print()

        nome_lower = Path(arq).name.lower()
        if "forca" in nome_lower or "força" in nome_lower or "potencia" in nome_lower:
            prefixo = "F"
        elif "comando" in nome_lower:
            prefixo = "C"
        else:
            prefixo = chr(ord('A') + idx)

        # Roteia cada rede; o terminal de início preferido é o PAR (output)
        # do último destino da rede anterior — assim o eletricista termina
        # uma rede e já começa a próxima no terminal adjacente.
        ultimo_destino = None
        for net_idx, (_, desc, terminais) in enumerate(nets_ordenadas, 1):
            preferido = None
            if ultimo_destino:
                comp_ant, term_ant = ultimo_destino
                par = par_terminal(term_ant)
                if par:
                    candidato = (comp_ant, par)
                    if candidato in terminais:
                        preferido = candidato

            rota = rotear_net_inteligente(f"{prefixo}{net_idx}", desc, terminais, preferido)
            print(f"--- REDE {prefixo}{net_idx} --- {desc} ({len(terminais)} term)"
                  + (f" [início: {preferido[0]}:{preferido[1]}]" if preferido else ""))
            for i, fio in enumerate(rota, 1):
                print(f"  [{i}] {fio['origem'][0]}:{fio['origem'][1]} -> {fio['destino'][0]}:{fio['destino'][1]}")
            print()
            todos_fios.extend(rota)
            if rota:
                ultimo_destino = rota[-1]['destino']
            todas_nets_meta.append((prefixo, f"{prefixo}{net_idx}", desc, terminais))

    if not todos_fios:
        print("[ERRO] Nenhum fio gerado.")
        return 1

    # Mapeia net_id → seus terminais para classificação por tipo de circuito
    _net_terminais: dict = {}
    for net_meta in todas_nets_meta:
        prefixo_m, net_id_m, desc_m, terms_m = net_meta
        _net_terminais[net_id_m] = terms_m

    def _classificar_fio(fio):
        net_id = str(fio["net"])
        if net_id.startswith("F"): return "forca"
        if net_id.startswith("C"): return "comando"
        terms = _net_terminais.get(net_id, [])
        if _eh_rede_terra(terms):  return "terra"
        return "forca" if _eh_rede_forca(terms) else "comando"

    fios_terra   = [f for f in todos_fios if _classificar_fio(f) == "terra"]
    fios_forca   = [f for f in todos_fios if _classificar_fio(f) == "forca"]
    fios_comando = [f for f in todos_fios if _classificar_fio(f) == "comando"]
    if not fios_forca and not fios_comando and not fios_terra:
        fios_forca = todos_fios

    out_checklist = base_dir / "checklist_montagem.html"
    out_anilhas   = base_dir / "anilhas.html"
    out_relatorio = base_dir / "relatorio_cabeamento.html"
    out_checklist.write_text(gerar_checklist_html(fios_forca, fios_comando, fios_terra), encoding='utf-8')
    out_anilhas.write_text(gerar_anilhas_html(fios_forca, fios_comando, fios_terra), encoding='utf-8')
    out_relatorio.write_text(gerar_relatorio_html(todos_fios, todas_nets_meta), encoding='utf-8')
    print(f"[OK] {out_checklist}")
    print(f"[OK] {out_anilhas}")
    print(f"[OK] {out_relatorio}")
    return 0

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 2 and sys.argv[1] == "auto":
        args = sys.argv[2:]
        out_dir_arg = None
        cad_files = []
        for a in args:
            if a.startswith('--outdir='):
                out_dir_arg = Path(a[9:])
            else:
                cad_files.append(a)
        if not cad_files:
            print("Uso: python analisar_cad.py auto [--outdir=DIR] MEU_PROJETO.cad")
            sys.exit(1)
        if out_dir_arg:
            out_dir_arg.mkdir(parents=True, exist_ok=True)
            base = out_dir_arg
        else:
            p = Path(cad_files[0]).parent
            base = p if p != Path('') else Path('.')
        sys.exit(main_auto(cad_files, base) or 0)
    else:
        print("Uso: python analisar_cad.py auto [--outdir=DIR] MEU_PROJETO.cad")