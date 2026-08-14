#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Analisador de arquivos .CAD do CADe_SIMU
Gera:
  - relatorio_componentes.md  (lista de componentes detectados)
  - checklist_montagem.html   (passos de montagem A4 imprimivel, forca -> comando)
  - anilhas.html              (etiquetas alinhadas ao checklist)

Uso:
  python analisar_cad.py FORCA_PROJETO COMANDO_PROJETO
"""

import sys
import re
from pathlib import Path
from collections import defaultdict, OrderedDict

# ============================================================================
# 1. TABELA DE TIPOS DE COMPONENTES CADe_SIMU
# ============================================================================
# Mapeia codigo numerico -> (categoria, descricao, terminais_padrao)
# terminais_padrao = None significa que os terminais sao lidos do arquivo
TIPOS_COMPONENTES = {
    # --- 1xxx MOTORES E ATUADORES ---
    "1000": ("motor",        "Motor trifasico (basico)",        ["U1","V1","W1","PE"]),
    "1001": ("motor",        "Motor trifasico (estrela-tri)",   ["U1","V1","W1","PE","W2","U2","V2"]),
    "1002": ("motor",        "Motor monofasico",                ["U1","V1","PE"]),
    "1003": ("motor",        "Motor (variante 7t)",             ["U1","V1","W1","PE","U2","V2","W2"]),
    "1004": ("motor",        "Motor especial KLM",              ["U1","V1","W1","PE","K","L","M"]),
    "1005": ("motor",        "Motor (variante 7t)",             ["U1","V1","W1","PE","U2","V2","W2"]),
    "1006": ("solenoide",    "Solenoide / Atuador",             ["A1","A2","PE"]),
    "1007": ("motor",        "Motor c/ freio",                  ["A1","A2","PE","F1","F2"]),
    "1008": ("motor",        "Motor mono c/ aux",               ["U1","V1","PE","U2","V2"]),
    "1009": ("freio",        "Freio (Fr)",                      ["U1","V1","PE"]),
    "1010": ("motor",        "Motor trifasico variante",        ["U1","V1","W1","PE"]),
    "1011": ("motor",        "Motor (numerico)",                ["1","2","3","4","5","6"]),
    "1012": ("motor",        "Motor (numerico 4t)",             ["1","2","3","4"]),

    # --- 2xxx CONTATORES E CHAVES ---
    "2000": ("contator_pot", "Contator bipolar (forca)",        ["1","3","2","4"]),
    "2001": ("contator_pot", "Contator tripolar (forca)",       ["1","3","5","2","4","6"]),
    "2002": ("contator_pot", "Contator tetrapolar (forca)",     ["1","3","5","7","2","4","6","8"]),
    "2003": ("chave_sel",    "Chave seletora bipolar",          ["1","3","2","4"]),
    "2004": ("chave_sel",    "Chave seletora tripolar",         ["1","3","5","2","4","6"]),
    "2005": ("chave_sel",    "Chave seletora tetrapolar",       ["1","3","5","7","2","4","6","8"]),
    "2006": ("contator_pot", "Contator bipolar (variante)",     ["1","3","2","4"]),
    "2007": ("chave_sel",    "Chave seletora simples",          ["1","2"]),
    "2008": ("contator_pot", "Contator c/ contatos extras",     ["1","3","5","2","4","6"]),
    "2009": ("intertrav",    "Intertravamento mecanico",        []),

    # --- 3xxx ENTRADAS, FONTES, TRAFOS ---
    "3000": ("entrada",      "Entrada monofasica (1 fase)",     ["L1"]),
    "3001": ("entrada",      "Entrada monofasica + N",          ["L1","N"]),
    "3002": ("entrada",      "Entrada bifasica",                ["L1","L2"]),
    "3003": ("entrada",      "Entrada bifasica + N",            ["L1","L2","N"]),
    "3004": ("entrada",      "Entrada trifasica",               ["L1","L2","L3"]),
    "3005": ("entrada",      "Entrada trifasica + N",           ["L1","L2","L3","N"]),
    "3006": ("entrada",      "Entrada trifasica + N + PE",      ["L1","L2","L3","N","PE"]),
    "3007": ("entrada",      "Entrada com 5 fios",              ["L1","L2","L3","N","PE"]),
    "3008": ("entrada",      "Entrada DC (+/-)",                ["+","-"]),
    "3009": ("entrada",      "Entrada DC + terra",              ["+","-","PE"]),
    "3010": ("entrada",      "Entrada bifasica DC",             ["+","-"]),
    "3011": ("entrada",      "Entrada generica",                ["L1","L2","L3"]),
    "3012": ("trafo",        "Transformador 4t",                ["1","2","3","4"]),
    "3013": ("trafo",        "Transformador 4t (variante)",     ["1","2","3","4"]),
    "3014": ("trafo",        "Transformador 4t + PE",           ["1","2","3","4","PE"]),
    "3015": ("terra",        "Aterramento (PE)",                []),
    "3016": ("diodo",        "Diodo retificador",               ["1","2"]),
    "3017": ("trafo",        "Transformador 6t",                ["1","2","3","4","5","6"]),
    "3018": ("trafo",        "Transformador 5t + PE",           ["1","2","3","4","5","PE"]),
    "3019": ("fonte_dc",     "Fonte DC (+/-)",                  ["+","-"]),
    "3020": ("tc",           "Transformador de corrente (TC)",  []),

    # --- 5xxx FUSIVEIS ---
    "5000": ("fusivel",      "Fusivel monopolar",               ["1","2"]),
    "5001": ("fusivel",      "Fusivel bipolar",                 ["1","3","2","4"]),
    "5002": ("fusivel",      "Fusivel bipolar (variante)",      ["1","3","2","4"]),
    "5003": ("fusivel",      "Fusivel tripolar",                ["1","3","5","2","4","6"]),
    "5004": ("fusivel",      "Fusivel tetrapolar",              ["1","3","5","7","2","4","6","8"]),
    "5005": ("fusivel",      "Fusivel monopolar (variante)",    ["1","2"]),
    "5006": ("fusivel",      "Fusivel bipolar (variante 2)",    ["1","3","2","4"]),
    "5007": ("fusivel",      "Fusivel bipolar (variante 3)",    ["1","3","2","4"]),
    "5008": ("fusivel",      "Fusivel tripolar (variante)",     ["1","3","5","2","4","6"]),
    "5009": ("fusivel",      "Fusivel tetrapolar (variante)",   ["1","3","5","7","2","4","6","8"]),

    # --- 6xxx DISJUNTORES E PROTECOES ---
    "6000": ("disjuntor",    "Disjuntor monopolar",             ["1","2"]),
    "6001": ("disjuntor",    "Disjuntor bipolar",               ["1","3","2","4"]),
    "6002": ("disjuntor",    "Disjuntor bipolar (variante)",    ["1","3","2","4"]),
    "6003": ("disjuntor",    "Disjuntor tripolar",              ["1","3","5","2","4","6"]),
    "6004": ("disjuntor",    "Disjuntor tetrapolar",            ["1","3","5","7","2","4","6","8"]),
    "6005": ("disjuntor_dr", "Disjuntor DR bipolar",            ["1","3","2","4"]),
    "6006": ("disjuntor_dr", "Disjuntor DR tetrapolar",         ["1","3","5","7","2","4","6","8"]),
    "6007": ("rele_termico", "Rele termico (forca)",            ["1","3","5","2","4","6"]),
    "6008": ("disjuntor",    "Disjuntor bipolar (Q)",           ["1","3","2","4"]),
    "6009": ("disjuntor",    "Disjuntor tripolar (Q)",          ["1","3","5","2","4","6"]),
    "6010": ("disjuntor",    "Disjuntor monopolar (Q)",         ["1","2"]),
    "6011": ("disjuntor",    "Disjuntor bipolar (Q variante)",  ["1","3","2","4"]),
    "6012": ("disjuntor",    "Disjuntor tetrapolar (Q)",        ["1","3","5","7","2","4","6","8"]),
    "6013": ("disjuntor",    "Disjuntor 3t (sem neutro)",       ["1","2","3"]),
    "6014": ("disjuntor",    "Disjuntor 5t",                    ["1","2","3","4","5"]),

    # --- 7xxx CONTATOS AUXILIARES ---
    "7000": ("contato_na",   "Contato auxiliar NA",             None),
    "7001": ("contato_nf",   "Contato auxiliar NF",             None),
    "7002": ("contato_dual", "Contato NA+NF (dual)",            None),
    "7003": ("contato_com",  "Contato comutador",               None),
    "7004": ("aux_na_temp",  "NA temporizado (67-68)",          None),
    "7005": ("timer_na",     "NA temporizado (55-56)",          None),
    "7006": ("aux_dual_t",   "NA+NF temporizado",               None),
    "7007": ("aux_com_t",    "Comutador temporizado",           None),
    "7008": ("aux_na_temp",  "NA temporizado (variante)",       None),
    "7009": ("timer_na",     "NA temporizado (variante)",       None),
    "7010": ("aux_dual_t",   "NA+NF temporizado (var)",         None),
    "7011": ("aux_com_t",    "Comutador temporizado (var)",     None),
    "7012": ("aux_na_temp",  "NA temporizado (KA)",             None),
    "7013": ("timer_na",     "NA temporizado (KA)",             None),
    "7014": ("aux_dual_t",   "NA+NF temporizado (KA)",          None),
    "7015": ("aux_com_t",    "Comutador temporizado (KA)",      None),

    # --- 8xxx BOTOES ---
    "8000": ("botao_na",     "Botao NA (pulso)",                None),
    "8001": ("botao_nf",     "Botao NF (pulso)",                None),
    "8002": ("botao_dual",   "Botao NA+NF (pulso)",             None),
    "8003": ("botao_com",    "Botao comutador (pulso)",         None),
    "8004": ("botao_na",     "Botao NA (retencao)",             None),
    "8005": ("emergencia",   "Botao emergencia (retencao NF)",  None),
    "8006": ("botao_dual",   "Botao NA+NF (retencao)",          None),
    "8007": ("botao_com",    "Botao comutador (retencao)",      None),
    "8008": ("botao_na",     "Botao NA (chave)",                None),
    "8009": ("botao_nf",     "Botao NF (chave)",                None),
    "8010": ("botao_dual",   "Botao NA+NF (chave)",             None),
    "8011": ("botao_com",    "Botao comutador (chave)",         None),
    "8012": ("fimcurso_na",  "Fim de curso NA",                 None),
    "8013": ("fimcurso_nf",  "Fim de curso NF",                 None),
    "8014": ("fimcurso_d",   "Fim de curso NA+NF",              None),
    "8015": ("fimcurso_c",   "Fim de curso comutador",          None),
    "8016": ("rt_aux_na",    "Contato aux RT (NA, 97-98)",      None),
    "8017": ("rt_aux_nf",    "Contato aux RT (NF, 95-96)",      None),
    "8018": ("rt_aux_dual",  "Contato aux RT (NA+NF)",          None),
    "8019": ("rt_aux_com",   "Contato aux RT (comutador)",      None),
    "8020": ("seletora",     "Chave seletora 3 pos (1-2-3)",    None),
    "8021": ("seletora",     "Chave seletora 4 term",           None),
    "8022": ("seletora",     "Chave seletora 4 term variante",  None),

    # --- 9xxx BOBINAS, SINALEIROS, RELES ---
    "9000": ("bobina",       "Bobina de contator",              ["A1","A2"]),
    "9004": ("bobina_timer", "Bobina de timer (ON-delay)",      ["A1","A2"]),
    "9005": ("bobina_timer", "Bobina de timer (OFF-delay)",     ["A1","A2"]),
    "9006": ("bobina_timer", "Bobina de timer (ciclico)",       ["A1","A2"]),
    "9008": ("sinaleiro",    "Sinaleiro / Lampada",             ["X1","X2"]),
    "9009": ("sinaleiro",    "Sinaleiro c/ cor",                ["X1","X2"]),
    "9010": ("sinaleiro",    "Sinaleiro generico",              ["X1","X2"]),
    "9011": ("sinaleiro",    "Sinaleiro generico (var)",        ["X1","X2"]),
    "9012": ("sinaleiro",    "Sinaleiro generico (var2)",       ["X1","X2"]),
    "9040": ("rele_modular", "Rele modular L1L2L3+N",           ["L1","L2","L3","N"]),
    "9041": ("rele_modular", "Rele modular L1L2L3",             ["L1","L2","L3"]),
    "9042": ("rele_modular", "Rele modular variante",           ["L1","L2","L3"]),
    "9043": ("rele_modular", "Rele modular variante 2",         ["L1","L2","L3"]),

    # --- OUTROS ---
    "20000": ("limite",      "Limite de pagina",                []),
}

# Categorias que sao "wires" (linhas de conexao, nao tem nome)
# 4000, 4009, 4010, 4018, 4019 = linhas; 4001 = ponto/no de conexao
TIPOS_WIRES = {"4000", "4001", "4009", "4010", "4018", "4019"}


# ============================================================================
# TABELA DE OFFSETS DOS TERMINAIS POR CODIGO
# ============================================================================
# Para cada codigo de componente, lista a posicao (dx, dy) de cada terminal
# em relacao a origem do componente (que eh o ponto de "snap" no CAD).
#
# Os terminais de ENTRADA (1, 3, 5, 7 ou L1, L2, L3, X1, A1, etc) ficam na
# borda superior do componente (dy=0). Os terminais de SAIDA (2, 4, 6, 8 ou
# X2, A2) ficam na borda inferior (dy = altura do componente).
#
# Para os codigos com terminais lidos do arquivo (NA, NF, botoes - codigos
# 7xxx e 8xxx), usamos um padrao "binario": primeiro terminal em cima,
# segundo embaixo. As chaves _N aqui dizem: "ennesimo terminal nessa posicao".
# ============================================================================
TERMINAL_OFFSETS = {
    # Motores - layout default (motor "em pe", bbox mais alto que largo):
    # terminais U1/V1/W1/PE em LINHA no topo do simbolo, U2/V2/W2 em LINHA
    # embaixo. Quando o motor eh desenhado deitado (bbox mais largo que alto)
    # o layout muda automaticamente em calcular_posicao_terminal — ver
    # MOTOR_OFFSETS_HORIZONTAL.
    "1000": {"U1":(0,0), "V1":(6,0), "W1":(12,0), "PE":(18,0)},
    "1001": {"U1":(0,0), "V1":(6,0), "W1":(12,0), "PE":(18,0),
             "W2":(0,24), "U2":(6,24), "V2":(12,24)},
    "1002": {"U1":(0,0), "V1":(6,0), "PE":(12,0)},
    # Contatores de forca
    "2000": {"_n":2, "_top":[0,6], "_bot":[0,6], "_h":12},  # bipolar
    "2001": {"_n":3, "_top":[0,6,12], "_bot":[0,6,12], "_h":12},  # tripolar
    "2002": {"_n":4, "_top":[0,6,12,18], "_bot":[0,6,12,18], "_h":12},
    "2003": {"_n":2, "_top":[0,6], "_bot":[0,6], "_h":12},  # chave seletora
    "2004": {"_n":3, "_top":[0,6,12], "_bot":[0,6,12], "_h":12},
    "2005": {"_n":4, "_top":[0,6,12,18], "_bot":[0,6,12,18], "_h":12},
    "2006": {"_n":2, "_top":[0,6], "_bot":[0,6], "_h":12},
    "2007": {"_n":1, "_top":[0], "_bot":[0], "_h":12},
    "2008": {"_n":3, "_top":[0,6,12], "_bot":[0,6,12], "_h":12},
    # Trafos / Fontes
    # X (3004) eh entrada trifasica - desenha 3 linhas horizontais saindo
    # com offset y, NAO horizontal. L1 = mais baixo (origem), L3 = mais alto.
    "3004": {"L1":(0,0), "L2":(0,-6), "L3":(0,-12)},
    "3005": {"L1":(0,0), "L2":(0,-6), "L3":(0,-12), "N":(0,-18)},
    "3006": {"L1":(0,0), "L2":(0,-6), "L3":(0,-12), "N":(0,-18), "PE":(0,-24)},
    "3014": {"1":(0,0), "2":(6,0), "3":(0,21), "4":(6,21), "PE":(-9,12)},
    "3015": {},  # aterramento (so simbolo)
    "3019": {"+":(0,0), "-":(6,0)},
    # Disjuntores
    "6007": {"_n":3, "_top":[0,6,12], "_bot":[0,6,12], "_h":12},  # RT
    "6008": {"_n":2, "_top":[0,6], "_bot":[0,6], "_h":21},  # DJ bipolar
    "6009": {"_n":3, "_top":[0,6,12], "_bot":[0,6,12], "_h":21},  # DJ tripolar
    # Contatos auxiliares e botoes: o simbolo eh 12u alto e o terminal de saida
    # do .cad cai exatamente em y+12 (igual aos contatores de forca 2xxx).
    # Contatos auxiliares (terminais lidos do arquivo - sempre 2)
    "7000": {"_n":1, "_top":[0], "_bot":[0], "_h":12},  # NA
    "7001": {"_n":1, "_top":[0], "_bot":[0], "_h":12},  # NF
    "7002": {"_n":2, "_top":[0,9], "_bot":[0,9], "_h":12},  # NA+NF dual
    "7003": {"_n":1, "_top":[0], "_bot":[0,6], "_h":12},  # comutador
    "7004": {"_n":1, "_top":[0], "_bot":[0], "_h":12},
    "7005": {"_n":1, "_top":[0], "_bot":[0], "_h":12},  # timer NA
    # Botoes (terminais lidos do arquivo - sempre 2)
    "8000": {"_n":1, "_top":[0], "_bot":[0], "_h":12},  # NA
    "8001": {"_n":1, "_top":[0], "_bot":[0], "_h":12},  # NF
    "8002": {"_n":2, "_top":[0,9], "_bot":[0,9], "_h":12},
    "8003": {"_n":1, "_top":[0], "_bot":[0,6], "_h":12},
    "8005": {"_n":1, "_top":[0], "_bot":[0], "_h":12},  # emergencia
    "8016": {"_n":1, "_top":[0], "_bot":[0], "_h":12},  # RT aux NA
    "8017": {"_n":1, "_top":[0], "_bot":[0], "_h":12},  # RT aux NF
    # Bobinas / sinaleiros
    "9000": {"A1":(0,0), "A2":(0,15)},
    "9004": {"A1":(0,0), "A2":(0,15)},
    "9005": {"A1":(0,0), "A2":(0,15)},
    "9006": {"A1":(0,0), "A2":(0,15)},
    "9008": {"X1":(0,0), "X2":(0,15)},
    "9009": {"X1":(0,0), "X2":(0,15)},
}


# Layouts alternativos quando o componente esta desenhado em ORIENTACAO ROTACIONADA.
# CADe_SIMU permite girar o simbolo: o motor "em pe" tem bbox alto-fino (h > w) com
# terminais top/bottom em linha; quando gira pra "deitado" o bbox vira largo-baixo
# (w > h) e os terminais ficam empilhados nas laterais (x=0 e x=24).
# Usado por calcular_posicao_terminal quando comp['bbox_w'] > comp['bbox_h'].
TERMINAL_OFFSETS_ROTACIONADO = {
    # Motores - layout HORIZONTAL (deitado): W1 no topo, V1, U1 e PE descendo
    # na lateral esquerda; W2/U2/V2 descendo na lateral direita (offset x=24).
    "1000": {"W1":(0,0), "V1":(0,6), "U1":(0,12), "PE":(0,18)},
    "1001": {"W1":(0,0), "V1":(0,6), "U1":(0,12), "PE":(0,18),
             "W2":(24,0), "U2":(24,6), "V2":(24,12)},
    "1002": {"V1":(0,0), "U1":(0,6), "PE":(0,12)},
}


# Codigos para os quais a deteccao de orientacao por bbox eh aplicada.
# (Por enquanto so motores; outros componentes podem ser adicionados se
# precisarem suportar rotacao.)
CODIGOS_COM_ROTACAO = set(TERMINAL_OFFSETS_ROTACIONADO.keys())


def _offsets_para_componente(comp):
    """Retorna o dict de offsets adequado pro componente, escolhendo entre
    layout default e rotacionado pela proporcao do bounding box."""
    codigo = comp.get("codigo", "")
    if codigo in CODIGOS_COM_ROTACAO:
        bw = comp.get("bbox_w", 0)
        bh = comp.get("bbox_h", 0)
        # bbox mais largo que alto -> simbolo deitado -> usa layout rotacionado
        if bw and bh and bw > bh:
            return TERMINAL_OFFSETS_ROTACIONADO[codigo]
    return TERMINAL_OFFSETS.get(codigo)


def parse_cad_wire_networks(cad_path):
    """
    Parses a .cad file to extract wire networks based on wire IDs.
    Returns a dict {network_id: [component_terminals]}
    where component_terminals are (comp_name, terminal) tuples.
    """
    networks = defaultdict(list)
    
    try:
        with open(cad_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"[ERRO] Falha ao ler {cad_path}: {e}")
        return {}
    
    # Parse components first to get their positions
    componentes = parse_cad(cad_path)
    comp_by_pos = {}
    for comp in componentes:
        if comp.get('tipo') != 'wire':
            nome = comp.get('nome', '')
            if nome:
                # Store component by its position for wire connection lookup
                comp_by_pos[(comp.get('x', 0), comp.get('y', 0))] = nome
    
    # Parse wire lines
    lines = content.split('\n')
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # Wire lines start with *97*4018 or similar
        if line.startswith('*97*') and ('4018' in line or '4019' in line or '4000' in line):
            # Extract network ID from the end: *17*0#
            parts = line.split('*')
            if len(parts) >= 2 and parts[-2].isdigit():
                network_id = int(parts[-2])
                
                # Extract coordinates from the line
                # Format: *97*4018##########*0*0*0*0*0*0*0*0*27*147*297*147*0*0*0*0*0*0*0*0*0*17*0#
                # Coordinates are the numbers before the network ID
                coords = []
                for part in parts[:-2]:  # Exclude the last *17*0#
                    if part.isdigit():
                        coords.append(int(part))
                
                # Group coordinates into pairs (x, y)
                wire_points = []
                for i in range(0, len(coords) - 1, 2):
                    if i + 1 < len(coords):
                        wire_points.append((coords[i], coords[i + 1]))
                
                # Find components that touch these wire points
                connected_components = set()
                for x, y in wire_points:
                    # Check for components at this position
                    if (x, y) in comp_by_pos:
                        connected_components.add(comp_by_pos[(x, y)])
                    
                    # Also check nearby positions (terminals might be offset)
                    for dx in [-6, 0, 6]:
                        for dy in [-12, 0, 12]:
                            pos = (x + dx, y + dy)
                            if pos in comp_by_pos:
                                connected_components.add(comp_by_pos[pos])
                
                # For each connected component, find which terminals are at wire points
                for comp_name in connected_components:
                    comp = next((c for c in componentes if c.get('nome') == comp_name), None)
                    if not comp:
                        continue
                    
                    # Get all terminals of this component
                    terminais = comp.get('terminais', [])
                    for term in terminais:
                        term_pos = calcular_posicao_terminal(comp, term)
                        if term_pos:
                            tx, ty = term_pos
                            # Check if terminal is on the wire
                            for wx, wy in wire_points:
                                if abs(tx - wx) <= 3 and abs(ty - wy) <= 3:  # Close enough
                                    networks[network_id].append((comp_name, term))
                                    break
    
    # Remove duplicates and sort
    for net_id in networks:
        networks[net_id] = list(set(networks[net_id]))
        networks[net_id].sort()
    
    return dict(networks)


# ============================================================================
# DETECCAO AUTOMATICA DE NETS POR UNION-FIND
# ============================================================================
class UnionFind:
    def __init__(self):
        self.parent = {}
    def find(self, x):
        if x not in self.parent:
            self.parent[x] = x
            return x
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]
    def union(self, x, y):
        rx, ry = self.find(x), self.find(y)
        if rx != ry:
            self.parent[rx] = ry
    def grupos(self):
        from collections import defaultdict
        g = defaultdict(list)
        for x in list(self.parent.keys()):
            g[self.find(x)].append(x)
        return list(g.values())


def ponto_no_segmento(p, a, b, tol=1):
    """Verifica se ponto p esta sobre o segmento de a a b (T-junction).
    Tolera ate 'tol' unidades de desvio. Retorna True se estiver entre os
    endpoints e colinear (segmento horizontal ou vertical apenas)."""
    px, py = p; ax, ay = a; bx, by = b
    # Segmento horizontal
    if abs(ay - by) <= tol and abs(py - ay) <= tol:
        x_min, x_max = min(ax, bx), max(ax, bx)
        return x_min - tol <= px <= x_max + tol
    # Segmento vertical
    if abs(ax - bx) <= tol and abs(px - ax) <= tol:
        y_min, y_max = min(ay, by), max(ay, by)
        return y_min - tol <= py <= y_max + tol
    return False


def detectar_nets(componentes, snap_radius=2):
    """
    Detecta as redes eletricas (NETs) automaticamente:
      1. Wires conectam seus dois endpoints (union)
      2. Snap por proximidade (pontos a menos de snap_radius unidades)
      3. T-junctions: se um endpoint cai sobre um wire (entre seus 2
         endpoints), considera conectado
      4. Terminais de componentes sao anexados aos pontos pela posicao
         (calculada via TERMINAL_OFFSETS)

    Retorna lista de (id_net, descricao_auto, [terminais...]).
    """
    uf = UnionFind()

    # 1. Adicionar todos os wires ao union-find (endpoints)
    wires = [c for c in componentes if c.get("tipo") == "wire"]
    for w in wires:
        p1 = (w["x"], w["y"])
        p2 = (w.get("x2", w["x"]), w.get("y2", w["y"]))
        uf.union(p1, p2)

    # 2. Calcular posicao de cada terminal de cada componente e adicionar
    # como pontos no UF (mesmo se nao tiver wire conectado)
    ponto_para_terminais = defaultdict(list)
    for c in componentes:
        if c.get("tipo") == "wire":
            continue
        nome = c.get("nome", "")
        for t in c.get("terminais", []):
            pos = calcular_posicao_terminal(c, t)
            if pos is None:
                continue
            ponto_para_terminais[pos].append((nome, t))
            uf.find(pos)  # garante que o ponto esta no UF

    # 3. Snap: pontos proximos (<= snap_radius) viram o mesmo no
    pontos_unicos = list(uf.parent.keys())
    for i, p in enumerate(pontos_unicos):
        for q in pontos_unicos[i+1:]:
            if abs(p[0]-q[0]) <= snap_radius and abs(p[1]-q[1]) <= snap_radius:
                uf.union(p, q)

    # 4. T-junctions: pra cada wire, ver se algum outro ponto cai SOBRE ele
    pontos_unicos = list(uf.parent.keys())  # refresh
    for w in wires:
        a = (w["x"], w["y"])
        b = (w.get("x2", w["x"]), w.get("y2", w["y"]))
        if a == b:
            continue  # eh um no, nao um segmento
        for p in pontos_unicos:
            if p == a or p == b:
                continue
            if ponto_no_segmento(p, a, b, tol=snap_radius):
                uf.union(p, a)

    # 5. Para cada grupo do union-find, coletar terminais
    grupos = uf.grupos()
    nets = []
    for grupo_idx, grupo in enumerate(grupos):
        terminais = []
        for ponto in grupo:
            terminais.extend(ponto_para_terminais.get(ponto, []))
        # Remove duplicatas mantendo ordem
        vistos = set()
        terminais_unicos = []
        for t in terminais:
            if t not in vistos:
                vistos.add(t)
                terminais_unicos.append(t)
        if len(terminais_unicos) >= 2:
            net_id = f"AUTO{grupo_idx+1}"
            desc = f"NET detectada automaticamente: {len(terminais_unicos)} terminais"
            nets.append((net_id, desc, terminais_unicos))

    return nets


def escolher_source(terminais, componentes_por_nome=None):
    """Decide qual terminal eh a SOURCE (primeiro) de uma NET detectada.

    Heuristica em 3 niveis:
      1. Coordenada Y (mais alto no diagrama = mais upstream)
      2. PRIORIDADE_CLASSE (entrada > disjuntor > trafo > rele > borneira > botao > contator > timer > sinaleiro > motor)
      3. Coordenada X (mais a esquerda = mais upstream em circuitos lidos da esquerda pra direita)
    """
    def chave(t):
        nome, term = t
        prio = PRIORIDADE_CLASSE.get(classificar_componente(nome), 99)
        # busca coords no dict de componentes (se fornecido)
        y = x = 0
        if componentes_por_nome and nome in componentes_por_nome:
            comp = componentes_por_nome[nome]
            y = comp.get("y", 0)
            x = comp.get("x", 0)
        return (y, prio, x, nome, term)
    return sorted(terminais, key=chave)[0]


def descricao_inferida(terminais):
    """Cria uma descricao curta da NET baseada nos seus terminais.
    Ex: 'X:L1 -> DJ2:1' para 2 terminais; 'S1:12 distribui para 5 contatores'."""
    if len(terminais) < 2:
        return f"NET ({len(terminais)} terminal)"
    src = fmt_borne(terminais[0])
    consumers = terminais[1:]
    n = len(consumers)
    if n == 1:
        return f"{src} -> {fmt_borne(consumers[0])}"
    if n <= 3:
        return f"{src} -> " + ", ".join(fmt_borne(c) for c in consumers)
    # NET com muitos consumers: descreve por categoria
    from collections import Counter
    cats = Counter(classificar_componente(c[0]) for c in consumers)
    top = cats.most_common(2)
    cat_desc = " + ".join(f"{n}x {cat}" for cat, n in top)
    return f"{src} distribui para {len(consumers)} pontos ({cat_desc})"


def _fase_do_terminal(terminal):
    """Retorna 1/2/3 para a fase do terminal, ou None se nao tem fase.
    Convencao IEC: terminais de potencia 1-2 = L1, 3-4 = L2, 5-6 = L3.
    Motor: U=L1, V=L2, W=L3. Entrada: L1/L2/L3 nominais."""
    t = str(terminal).upper()
    if t in ("L1", "U1", "U2", "1", "2"):
        return 1
    if t in ("L2", "V1", "V2", "3", "4"):
        return 2
    if t in ("L3", "W1", "W2", "5", "6"):
        return 3
    # PE, N, A1/A2, X1/X2, 11/12, 13/14, 95/96, etc -> sem fase
    return None


def _fase_dominante_da_net(terminais):
    """Classifica a NET pela fase dos seus terminais. Retorna:
      1, 2, 3 -> NET inteira em uma unica fase (cabos de potencia)
      4       -> NET com terminais em mais de uma fase (jumpers estrela, etc.)
      99      -> NET sem terminais de fase (circuito de comando)
    Usado como chave primaria de ordenacao para que toda a fase L1 seja
    montada antes da L2, antes da L3."""
    fases = set()
    for _, t in terminais:
        f = _fase_do_terminal(t)
        if f is not None:
            fases.add(f)
    if not fases:
        return 99
    if len(fases) == 1:
        return next(iter(fases))
    return 4


def ordenar_nets_por_fluxo(nets, componentes=None):
    """Ordena NETs do upstream pro downstream e poe source no inicio.
    Se 'componentes' for passado, usa coords pra desempate.
    Chave primaria: fase eletrica (L1 antes de L2 antes de L3 antes de
    multi-fase antes de comando)."""
    comp_map = {}
    if componentes:
        for c in componentes:
            if c.get("tipo") != "wire" and c.get("nome"):
                comp_map[c["nome"]] = c

    nets_ordenadas = []
    for net_id, desc, terminais in nets:
        source = escolher_source(terminais, comp_map)
        outros = [t for t in terminais if t != source]
        terms_ord = [source] + outros
        # Atualiza descricao com algo mais util
        desc_nova = descricao_inferida(terms_ord)
        nets_ordenadas.append((net_id, desc_nova, terms_ord))

    nets_ordenadas.sort(key=lambda n: (
        _fase_dominante_da_net(n[2]),
        comp_map.get(n[2][0][0], {}).get("y", 999),
        PRIORIDADE_CLASSE.get(classificar_componente(n[2][0][0]), 99),
        comp_map.get(n[2][0][0], {}).get("x", 999),
    ))
    return [(f"N{i+1}", desc, terms) for i, (_, desc, terms) in enumerate(nets_ordenadas)]


# (ordenar_nets_por_fluxo agora esta acima, com suporte a componentes)

# Codigo do terminal de entrada (rede)
TIPO_ENTRADA = {"3004"}  # -X (entrada das fases)


# ============================================================================
# 2. PARSER DO ARQUIVO .CAD
# ============================================================================
def parse_cad(arquivo):
    """Parseia um arquivo .CAD e retorna lista de componentes detectados.

    Estrategia: o CADe_SIMU usa '*ID*CODIGO#' como inicio de cada componente.
    Encontramos todas essas posicoes e cortamos o conteudo entre elas.
    """
    try:
        with open(arquivo, 'r', encoding='latin-1', errors='ignore') as f:
            conteudo = f.read()
    except FileNotFoundError:
        print(f"[ERRO] Arquivo nao encontrado: {arquivo}")
        return None

    # Encontra todas as posicoes onde inicia um componente: *ID*CODIGO#
    # ID = numero, CODIGO = numero (entre 1 e 99999)
    inicios = [(m.start(), m.group(1), m.group(2))
               for m in re.finditer(r'\*(\d+)\*(\d{1,5})#', conteudo)]

    componentes = []
    for i, (pos, id_comp, codigo) in enumerate(inicios):
        # Bloco vai do inicio deste componente ate o inicio do proximo
        fim = inicios[i+1][0] if i+1 < len(inicios) else len(conteudo)
        bloco = conteudo[pos:fim]

        codigo = codigo.lstrip('0') or '0'

        # Wires
        if codigo in TIPOS_WIRES:
            partes = bloco.split('*')
            try:
                # estrutura: *ID, *CODIGO, *flag1, ..., *flag8, *x1, *y1, *x2, *y2, ...
                # depois do split, partes[0] eh '' (string vazia antes do primeiro *)
                if len(partes) >= 14:
                    x1 = int(partes[11]); y1 = int(partes[12])
                    x2 = int(partes[13]); y2 = int(partes[14]) if len(partes) > 14 else 0
                    componentes.append({
                        "id": id_comp, "codigo": codigo, "tipo": "wire",
                        "nome": "", "terminais": [], "x": x1, "y": y1,
                        "x2": x2, "y2": y2,
                    })
            except (ValueError, IndexError):
                pass
            continue

        if codigo not in TIPOS_COMPONENTES:
            continue

        categoria, desc, terminais_padrao = TIPOS_COMPONENTES[codigo]

        # Extrai nome e terminais. Formato apos *ID*CODIGO#:
        # NOME##term1#term2#...########FLAGS_E_COORDS
        # remove o prefixo "*ID*CODIGO" pra trabalhar so com o conteudo
        m_pref = re.match(r'\*\d+\*\d+#(.*)$', bloco, re.DOTALL)
        if not m_pref:
            continue
        resto = m_pref.group(1)

        # Os primeiros campos sao: NOME#(vazio)#term1#term2#...
        # quando atinge um campo que comece com "*" (flags) paramos.
        # Estrutura tipica: nome##t1#t2#t3##### (os # extras sao para terminais nao usados)
        idx_flags = resto.find('*')
        if idx_flags == -1:
            idx_flags = len(resto)
        cabecalho = resto[:idx_flags]
        cauda = resto[idx_flags:]
        campos = cabecalho.split('#')

        nome = campos[0] if campos else ''
        # Os terminais comecam em campos[1] (depois do nome). Pega ate encontrar campos vazios consecutivos.
        terminais_raw = campos[1:]
        terminais = []
        for p in terminais_raw:
            if p == '':
                continue
            # so aceita strings curtas alfanumericas como terminal
            if re.match(r'^[A-Za-z0-9_]{1,4}$', p):
                terminais.append(p)
            else:
                break

        if terminais_padrao:
            terminais = list(terminais_padrao)

        # Coordenadas e bounding box.
        # A cauda comeca com '*' e tem campos numericos em posicoes fixas:
        #   indices [1..8]  = 8 flags (0 ou 1, podem variar com mirror/rotacao)
        #   indices [9..10] = X, Y do componente
        #   indices [11..12]= 2 campos auxiliares (geralmente 0)
        #   indices [13..14]= bbox offset X, Y (negativos quando o simbolo se
        #                     extende a esquerda/cima do ponto de origem)
        #   indices [15..16]= bbox W, H
        # Usar split('*') eh mais robusto que regex: nao quebra se o conjunto
        # de flags 0/1 mudar em uma futura versao do CADe_SIMU ou ao espelhar.
        x = y = 0
        bbox_w = bbox_h = 0
        partes = cauda.split('*')
        try:
            if len(partes) > 10:
                x = int(partes[9]); y = int(partes[10])
            if len(partes) > 16:
                bbox_w = int(partes[15]); bbox_h = int(partes[16])
        except ValueError:
            # bloco corrompido ou variante nao esperada; mantem zero
            pass

        componentes.append({
            "id": id_comp,
            "codigo": codigo,
            "categoria": categoria,
            "tipo": categoria,
            "descricao": desc,
            "nome": nome.lstrip('-'),
            "terminais": terminais,
            "x": x, "y": y,
            "bbox_w": bbox_w, "bbox_h": bbox_h,
        })

    # Detecta a entrada -X (no inicio do arquivo, antes do primeiro *ID*CODIGO)
    m_x = re.search(r'\*(\d+)\*3004#(-?X)', conteudo)
    if m_x:
        # Verifica se ja foi adicionado
        if not any(c.get('codigo') == '3004' for c in componentes):
            componentes.insert(0, {
                "id": m_x.group(1), "codigo": "3004", "categoria": "entrada",
                "tipo": "entrada", "descricao": "Entrada de rede",
                "nome": m_x.group(2).lstrip('-'),
                "terminais": ["L1", "L2", "L3"], "x": 0, "y": 0,
            })

    return componentes


# ============================================================================
# 3. DEFINICAO DECLARATIVA DAS REDES ELETRICAS
# ============================================================================
# Cada NET = um potencial eletrico. O primeiro terminal eh a SOURCE (origem).
# Os demais sao CONSUMERS que recebem esse potencial.
#
# Formato: ("Componente", "terminal")
#
# A ordem fisica dos componentes no painel determina o roteamento dos jumps.
# ============================================================================

# ============================================================================
# >>>>>>>>>>>>>>>>>> CONFIGURACAO DO PAINEL - EDITE AQUI <<<<<<<<<<<<<<<<<<<<
# ============================================================================
# Posicao FISICA dos componentes no painel real, em coordenadas (linha, coluna).
# Linhas: -3=tampa botoes, -2=tampa sinaleiros, -1=topo do gabinete (DJ/RT/V),
#          0=primeira linha do trilho, 1=segunda linha, 2=borneira embaixo.
# Colunas: 0,1,2,... esquerda -> direita.
#
# A distancia entre dois componentes eh Manhattan (|linha_a - linha_b| +
# |col_a - col_b|), e o roteador usa isso para escolher o vizinho mais proximo
# que tenha menos fios ja conectados (balanceamento de carga).
# ============================================================================
POSICAO_FISICA = {
    # ---- CIRCUITO DE FORCA ----
    "DJ2": (-1, 0),
    "RT":  (-1, 1),

    # Trilho de contatoras em DUAS LINHAS (igual ao diagrama do .cad):
    #   linha 0 (cima):    K4   K5
    #   linha 1 (baixo):   K1   K2   K3
    "K4": (0, 0), "K5": (0, 1),
    "K1": (1, 0), "K2": (1, 1), "K3": (1, 2),

    # ---- CIRCUITO DE COMANDO ----
    "Q":   (-1, 2),  # DJ1 (disjuntor de comando)
    "V":   (-1, 3),  # trafo / fonte
    "F":   (-1, 4),  # rele termico aux (95-96 NF, 97-98 NA)

    # Timer (linha 1, coluna 3 - ao lado de K3)
    "T1":  (1, 3),

    # Borneira de distribuicao (se houver)
    "BD":  (2, 0),

    # ---- TAMPA DO GABINETE ----
    # Botoes na tampa, da esquerda pra direita
    "S0":  (-3, 0),   # desliga
    "S1":  (-3, 1),   # emergencia
    "S2":  (-3, 2),   # avanco
    "S3":  (-3, 3),   # reverso

    # Sinaleiros na tampa, da esquerda pra direita
    "H1":  (-2, 0),   # LIGADO (verde)
    "H2":  (-2, 1),   # DESLIGADO (vermelho)
    "H3":  (-2, 2),   # AVANCO
    "H4":  (-2, 3),   # REVERSO
    "H5":  (-2, 4),   # ESTRELA
    "H6":  (-2, 5),   # TRIANGULO
    "H7":  (-2, 6),   # SOBRECARGA

    # Entrada e motor (referencias simbolicas)
    "X":   (-1, -1),
    "M":   (3, 1),
    "PE":  (3, 0),
    "TERRA": (4, 0),
}

# Compatibilidade: derivar ordem linear da posicao fisica (apenas para sort)
ORDEM_FISICA_TRILHO = {
    nome: (linha * 100 + coluna)
    for nome, (linha, coluna) in POSICAO_FISICA.items()
}

# Limite de fios por borne (apenas usado para gerar AVISO no relatorio,
# nao bloqueia a geracao). Bornes com mais que isso sao listados para
# revisao manual. Coloque 99 para desativar o aviso.
LIMITE_AVISO_FIOS = 3

# Bornes que SO aceitam 1 fio (terminais pequenos, ex: timer, bobinas finas)
# Se essas conexoes ultrapassarem 1, sao listadas em destaque no relatorio.
BORNES_RESTRITOS = {
    ("T1", "55"), ("T1", "56"),  # contato NA do timer eh pequeno
    ("T1", "A1"), ("T1", "A2"),  # bobina do timer
}


def nets_forca():
    """Retorna lista de NETS do circuito de forca."""
    return [
        # (id_net, descricao, [terminais...])  -- primeiro terminal eh a SOURCE
        ("F1",  "Fase L1 da rede ate disjuntor DJ2",
            [("X","L1"), ("DJ2","1")]),
        ("F2",  "Fase L2 da rede ate disjuntor DJ2",
            [("X","L2"), ("DJ2","3")]),
        ("F3",  "Fase L3 da rede ate disjuntor DJ2",
            [("X","L3"), ("DJ2","5")]),
        ("F4",  "DJ2 saida 2 -> RT entrada 1",
            [("DJ2","2"), ("RT","1")]),
        ("F5",  "DJ2 saida 4 -> RT entrada 3",
            [("DJ2","4"), ("RT","3")]),
        ("F6",  "DJ2 saida 6 -> RT entrada 5",
            [("DJ2","6"), ("RT","5")]),
        ("F7",  "RT saida 2 -> bifurcacao K4:1 e K5:1 (L1 das contatoras de sentido)",
            [("RT","2"), ("K4","1"), ("K5","1")]),
        ("F8",  "RT saida 4 -> bifurcacao K4:3 e K5:3",
            [("RT","4"), ("K4","3"), ("K5","3")]),
        ("F9",  "RT saida 6 -> bifurcacao K4:5 e K5:5",
            [("RT","6"), ("K4","5"), ("K5","5")]),
        ("F10", "K4 saida 2 -> K1 entrada 1 (ramo direto)",
            [("K4","2"), ("K1","1")]),
        ("F11", "K4 saida 4 -> K1 entrada 3",
            [("K4","4"), ("K1","3")]),
        ("F12", "K4 saida 6 -> K1 entrada 5",
            [("K4","6"), ("K1","5")]),
        ("F13", "K5 saida 2 -> K2 entrada 1 (ramo reverso, fase invertida W2)",
            [("K5","2"), ("K2","1")]),
        ("F14", "K5 saida 4 -> K2 entrada 3 (fase invertida U2)",
            [("K5","4"), ("K2","3")]),
        ("F15", "K5 saida 6 -> K2 entrada 5 (fase invertida V2)",
            [("K5","6"), ("K2","5")]),
        ("F16", "K1 saida 2 -> Motor U1",
            [("K1","2"), ("M","U1")]),
        ("F17", "K1 saida 4 -> Motor V1",
            [("K1","4"), ("M","V1")]),
        ("F18", "K1 saida 6 -> Motor W1",
            [("K1","6"), ("M","W1")]),
        ("F19", "K2 saida 2 -> Motor W2 (INVERTIDO p/ reverso)",
            [("K2","2"), ("M","W2")]),
        ("F20", "K2 saida 4 -> Motor U2",
            [("K2","4"), ("M","U2")]),
        ("F21", "K2 saida 6 -> Motor V2",
            [("K2","6"), ("M","V2")]),
        ("F22", "K3 saida 2 -> Motor V2 (ponto estrela)",
            [("K3","2"), ("M","V2")]),
        ("F23", "K3 saida 4 -> Motor U2 (ponto estrela)",
            [("K3","4"), ("M","U2")]),
        ("F24", "K3 saida 6 -> Motor W2 (ponto estrela)",
            [("K3","6"), ("M","W2")]),
        # K3:1, K3:3, K3:5 sao jumpers internos (curto entre as 3 entradas)
        ("F25", "K3 jumper interno 1-3 (curto-circuito do ponto estrela)",
            [("K3","1"), ("K3","3")]),
        ("F26", "K3 jumper interno 3-5 (curto-circuito do ponto estrela)",
            [("K3","3"), ("K3","5")]),
    ]


def nets_comando():
    """Retorna lista de NETS do circuito de comando."""
    return [
        ("C1",  "Fase L1 da rede ate disjuntor DJ1 (Q:1)",
            [("X","L1"), ("Q","1")]),
        ("C2",  "Fase L2 da rede ate disjuntor DJ1 (Q:3)",
            [("X","L2"), ("Q","3")]),
        ("C3",  "DJ1 saida 2 -> entrada 1 do trafo/fonte V",
            [("Q","2"), ("V","1")]),
        ("C4",  "DJ1 saida 4 -> entrada 2 do trafo/fonte V",
            [("Q","4"), ("V","2")]),
        ("C5",  "Trafo V saida 3 -> entrada 95 do RT (contato auxiliar NF)",
            [("V","3"), ("F","95")]),
        ("C6",  "RT 96 -> S0:11 (botao desliga)",
            [("F","96"), ("S0","11")]),
        ("C7",  "S0:12 -> S1:11 (botao emergencia em serie)",
            [("S0","12"), ("S1","11")]),
        # >>>>> A GRANDE NET DE DISTRIBUICAO <<<<<
        # Tudo o que esta no potencial pos-S1:12 (depois da cadeia de seguranca)
        # Inclui: botoes, todos os contatos NA superiores das contatoras, NF de
        # K4/K5 (entrada 31), entrada F:97 (NA RT pra sobrecarga), K3:23 (NA p/ ESTRELA)
        ("C8",  "S1:12 -> distribuicao geral (botoes + contatos NA + NF de sinalizacao)",
            [("S1","12"),
             # botoes (na tampa)
             ("S2","13"), ("S3","13"),
             # contatoras (no trilho) - contatos NA 13/43, NF 31, K3:23 (NA p/ H5)
             ("K4","13"), ("K4","43"), ("K4","31"),
             ("K5","43"), ("K5","13"), ("K5","31"),
             ("K3","13"), ("K3","43"), ("K3","23"),
             ("K1","43"),
             # entrada F:97 do NA aux do RT (sinalizacao sobrecarga)
             ("F","97")]),
        # Ramo do AVANCO
        ("C9",  "Selo K4 + intertrav K5: S2:14 / K4:14 -> K5:21 (NF intertravamento)",
            [("S2","14"), ("K4","14"), ("K5","21")]),
        ("C10", "K5:22 (saida intertrav) -> bobina K4:A1 + sinaleiro H3 AVANCO em paralelo",
            [("K5","22"), ("K4","A1"), ("H3","X1")]),
        # Ramo do REVERSO
        ("C11", "Selo K5 + intertrav K4: S3:14 / K5:14 -> K4:21 (NF intertravamento)",
            [("S3","14"), ("K5","14"), ("K4","21")]),
        ("C12", "K4:22 (saida intertrav) -> bobina K5:A1 + sinaleiro H4 REVERSO em paralelo",
            [("K4","22"), ("K5","A1"), ("H4","X1")]),
        # Cascata estrela-triangulo + H1 LIGADO em paralelo
        # Atencao: K4:44 ja tem 3 fios (K5:44, T1:55, K3:14); H1:X1 vira o 4o.
        # Eh aceitavel pq o terminal da contatora aceita, mas T1:55 so aceita 1 fio.
        ("C13", "K4:44/K5:44 -> T1:55 + selo K3:14 + H1 LIGADO (mesmo potencial pos-K4 ou K5)",
            [("K4","44"), ("K5","44"), ("T1","55"), ("K3","14"), ("H1","X1")]),
        ("C14", "T1:56 (saida temporizada) -> bobina K3:A1",
            [("T1","56"), ("K3","A1")]),
        ("C15", "K3:44 (NA fecha apos estrela) -> bobina K1:A1 + sinaleiro H6 TRIANGULO",
            [("K3","44"), ("K1","A1"), ("H6","X1")]),
        ("C16", "K1:44 -> realimenta T1:A1 e K3:21 (NF bloqueia K2 enquanto estrela ativa)",
            [("K1","44"), ("T1","A1"), ("K3","21")]),
        ("C17", "K3:22 (saida NF) -> bobina K2:A1",
            [("K3","22"), ("K2","A1")]),
        # Sinaleiro H5 ESTRELA: usa K3:23-24 NA dedicado (S1:12 -> K3:23 ja em C8)
        ("C17a", "K3:24 -> H5:X1 (ESTRELA acende qdo K3 ativa)",
            [("K3","24"), ("H5","X1")]),
        # Sinalizacao H2 DESLIGADO: serie NF K4:31-32 + K5:31-32
        ("C17c", "K4:32 -> K5:31 (jump entre NF em serie p/ DESLIGADO)",
            [("K4","32"), ("K5","31")]),
        ("C17d", "K5:32 -> H2:X1 (DESLIGADO acende qdo ambas K4 e K5 desligadas)",
            [("K5","32"), ("H2","X1")]),
        # Sinalizacao H7 SOBRECARGA: F:98 (NA aux RT) -> H7:X1
        ("C17e", "F:98 -> H7:X1 (SOBRECARGA acende qdo RT trip)",
            [("F","98"), ("H7","X1")]),
        # Retorno (0V) - jumpers entre A2 das bobinas
        ("C18", "Retorno V:4 (0V) jumpeado por A2 de todas as bobinas",
            [("V","4"),
             ("K4","A2"), ("K3","A2"), ("K1","A2"),
             ("T1","A2"), ("K2","A2"), ("K5","A2")]),
        # PE / aterramento
        ("C19", "Aterramento PE do trafo V",
            [("V","PE"), ("PE","TERRA")]),

        # Retorno X2 das lampadas -> 0V (V:4)
        ("C20", "Retorno X2 de todos os sinaleiros -> 0V (V:4) jumpeado em serie",
            [("V","4"),
             ("H1","X2"), ("H2","X2"), ("H3","X2"),
             ("H4","X2"), ("H5","X2"), ("H6","X2"), ("H7","X2")]),
    ]


# ============================================================================
# 4. ALGORITMO DE ROTEAMENTO
# ============================================================================
# Routing Engine - Extracted and adapted from simulador_roteamento.py
# ============================================================================
CUSTO_MUDAR_ZONA = 50
CUSTO_FIO_EXTRA = 1000  # Penalidade progressiva para forçar distribuição

class RoteadorInteligente:
    def __init__(self, componentes, info_terminais, grid_config):
        self.componentes = componentes
        self.info_terminais = info_terminais
        self.grid_config = grid_config

    def _calcular_custo(self, u, v, graus):
        info_u = self.info_terminais[u]
        info_v = self.info_terminais[v]

        z_u = info_u['zona']
        z_v = info_v['zona']
        l_u = info_u['linha']
        c_u = info_u['coluna']
        l_v = info_v['linha']
        c_v = info_v['coluna']

        def dist_mesma_zona(zona, l1, c1, l2, c2):
            if l1 == l2:
                # Na mesma linha, os fios correm horizontalmente na mesma canaleta
                return abs(c1 - c2) * 10
            else:
                # Em linhas diferentes, precisam ir para a borda (canaleta vertical)
                max_col = self.grid_config[zona]['colunas'] - 1
                if zona == 'interno':
                    # Interno tem canaleta dos dois lados. Pega a rota mais curta.
                    dist_esq = (c1 * 10) + abs(l1 - l2) * 10 + (c2 * 10)
                    dist_dir = ((max_col - c1) * 10) + abs(l1 - l2) * 10 + ((max_col - c2) * 10)
                    return min(dist_esq, dist_dir)
                else:
                    # Tampa só tem canaleta na borda esquerda
                    return (c1 * 10) + abs(l1 - l2) * 10 + (c2 * 10)

        if z_u != z_v:
            # Se for entre Tampa e Interno, obrigatoriamente passa pela dobradiça (chicote)
            # O chicote fica no canto inferior direito do Painel (max_col, max_linha)
            # E entra no canto inferior esquerdo da Tampa (col 0, max_linha)
            
            l_int_max = self.grid_config['interno']['linhas'] - 1
            c_int_max = self.grid_config['interno']['colunas'] - 1
            l_tmp_max = self.grid_config['tampa']['linhas'] - 1
            
            if z_u == 'interno':
                dist_u = dist_mesma_zona('interno', l_u, c_u, l_int_max, c_int_max)
                dist_v = dist_mesma_zona('tampa', l_v, c_v, l_tmp_max, 0)
            else:
                dist_u = dist_mesma_zona('tampa', l_u, c_u, l_tmp_max, 0)
                dist_v = dist_mesma_zona('interno', l_v, c_v, l_int_max, c_int_max)
                
            custo = dist_u + dist_v + CUSTO_MUDAR_ZONA
        else:
            custo = dist_mesma_zona(z_u, l_u, c_u, l_v, c_v)

        if graus[u] >= 2: custo += CUSTO_FIO_EXTRA * graus[u]
        if graus[v] >= 2: custo += CUSTO_FIO_EXTRA * graus[v]

        return custo

    def rotear(self, terminais_net, origem_forcada=None):
        if len(terminais_net) < 2:
            return [], 0, {}

        melhor_rota_global = []
        melhor_custo_global = float('inf')
        melhores_graus_global = {}

        inicios = [origem_forcada] if origem_forcada and origem_forcada in terminais_net else terminais_net

        for inicio in inicios:
            conectados = {inicio}
            desconectados = set(terminais_net) - {inicio}
            graus = {t: 0 for t in terminais_net}
            rota = []
            custo_total = 0
            impossivel = False

            while desconectados:
                melhor_aresta = None
                menor_custo_aresta = float('inf')

                for u in conectados:
                    if graus[u] >= self.info_terminais[u]['limite']:
                        continue

                    for v in desconectados:
                        if graus[v] >= self.info_terminais[v]['limite']:
                            continue

                        custo = self._calcular_custo(u, v, graus)
                        if custo < menor_custo_aresta:
                            menor_custo_aresta = custo
                            melhor_aresta = (u, v)

                if melhor_aresta is None:
                    impossivel = True
                    break

                u, v = melhor_aresta
                rota.append((u, v))
                custo_total += menor_custo_aresta
                graus[u] += 1
                graus[v] += 1
                conectados.add(v)
                desconectados.remove(v)

            if not impossivel and custo_total < melhor_custo_global:
                melhor_custo_global = custo_total
                melhor_rota_global = list(rota)
                melhores_graus_global = dict(graus)

        if melhor_custo_global == float('inf'):
            return [], 0, {}

        return melhor_rota_global, melhor_custo_global, melhores_graus_global


# ============================================================================
# LEGACY ROUTING FUNCTIONS (to be replaced)
# ============================================================================
# Aplica as regras do usuario:
#  - Maximo 3 fios por borne
#  - Botoes antes de contatoras
#  - Para cada componente, faz JUMPS INTERNOS entre seus terminais do mesmo
#    potencial antes de ir para o proximo componente
#  - Componentes vizinhos no trilho fisico recebem o jump um do outro
# ============================================================================

def classificar_componente(nome):
    """Retorna a 'classe fisica' do componente para roteamento."""
    if nome in ("X",):
        return "entrada"
    if nome.startswith("DJ") or nome in ("Q",):
        return "disjuntor"
    if nome.startswith("FT") or nome in ("V",):
        return "trafo"
    if nome in ("F", "RT"):
        return "rele_termico"
    if nome.startswith("S"):
        return "botao"
    if nome.startswith("K"):
        return "contator"
    if nome.startswith("T"):
        return "timer"
    if nome.startswith("H"):
        return "sinaleiro"
    if nome in ("M",):
        return "motor"
    if nome in ("BD",):
        return "borneira"
    if nome in ("PE", "TERRA"):
        return "terra"
    return "outro"


# Prioridade de visita dentro de uma NET (menor = primeiro)
PRIORIDADE_CLASSE = {
    "entrada":      0,
    "disjuntor":    1,
    "trafo":        2,
    "rele_termico": 3,
    "borneira":     4,
    "botao":        5,   # <-- botoes antes de contatoras
    "contator":     6,
    "timer":        7,
    "sinaleiro":    8,
    "motor":        9,
    "terra":       10,
    "outro":       99,
}


# Dict de posicoes detectadas do .cad em modo auto (preenchido por main_auto)
# Chave = nome do componente, valor = (linha, coluna) escalado das coords reais
_POSICOES_AUTO = {}


def distancia_fisica(comp_a, comp_b):
    """Distancia com penalidade alta para mudanca de linha/grid."""
    pa = _POSICOES_AUTO.get(comp_a) or POSICAO_FISICA.get(comp_a)
    pb = _POSICOES_AUTO.get(comp_b) or POSICAO_FISICA.get(comp_b)
    if pa is None or pb is None:
        return 999
    
    linha_a, col_a = pa
    linha_b, col_b = pb
    
    dist_col = abs(col_a - col_b)
    dist_lin = abs(linha_a - linha_b)
    
    # Penalidade de 100 por pular de linha. Garante que componentes no mesmo
    # grid (mesma linha) serao sempre considerados mais proximos do que
    # componentes em linhas diferentes, mesmo que a coluna seja a mesma.
    return dist_col + (dist_lin * 100)


def popular_posicoes_auto(componentes, config_painel=None):
    """Popula _POSICOES_AUTO com (linha, coluna).

    Prioridade:
      1. Se config_painel for passado (JSON do painel real), usa ela
      2. Senao, usa coords (x, y) do .cad (linha = y // 6, coluna = x // 6)
    """
    global _POSICOES_AUTO
    _POSICOES_AUTO = {}

    # 1. Aplica config do painel real se houver (sobrescreve coords do .cad)
    if config_painel:
        # Interno: linhas 0, 1, 2, ...
        for linha_idx, grid in enumerate(config_painel.get("interno", {}).get("grids", [])):
            for coluna_idx, nome in enumerate(grid):
                _POSICOES_AUTO[nome] = (linha_idx, coluna_idx)
        # Tampa: linhas -100, -101, ... (offset grande pra ficar "longe" do interno)
        for linha_idx, grid in enumerate(config_painel.get("tampa", {}).get("grids", [])):
            for coluna_idx, nome in enumerate(grid):
                _POSICOES_AUTO[nome] = (-100 - linha_idx, coluna_idx)

    # 2. Pra componentes nao listados na config, fallback pras coords do .cad
    for c in componentes:
        if c.get("tipo") == "wire":
            continue
        nome = c.get("nome", "")
        if not nome or nome in _POSICOES_AUTO:
            continue
        linha = c.get("y", 0) // 6
        coluna = c.get("x", 0) // 6
        _POSICOES_AUTO[nome] = (linha, coluna)


def carregar_painel_config(caminho):
    """Carrega o painel_config.json (ou retorna None se nao existir)."""
    try:
        import json
        with open(caminho, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return None
    except Exception as e:
        print(f"[AVISO] Erro ao ler {caminho}: {e}")
        return None


def ordem_fisica(nome):
    """Retorna um indice ordenavel do componente baseado em sua posicao fisica.
    Em modo auto usa _POSICOES_AUTO; senao usa a tabela manual ORDEM_FISICA_TRILHO."""
    if nome in _POSICOES_AUTO:
        linha, coluna = _POSICOES_AUTO[nome]
        return linha * 1000 + coluna
    return ORDEM_FISICA_TRILHO.get(nome, 99999)


def _eh_na_tampa(nome_comp):
    """Retorna True se componente esta na tampa do gabinete."""
    pos = _POSICOES_AUTO.get(nome_comp) or POSICAO_FISICA.get(nome_comp)
    if pos is None:
        return False
    linha = pos[0]
    return linha < -1  # linha -2 ou -3 = tampa


def _escolher_terminal_principal(grupo_terminais, comp, descricao):
    """
    Em um grupo de terminais do mesmo componente (ex: K4:13, K4:43, K4:31),
    escolhe qual sera o 'principal' (primeiro a receber o cabo).
    
    Heuristica: 
    - Ordernar por prioridade: entrada < NA < NF < saída
    - Objetivo: terminal "de entrada" vem antes de "derivacoes"
    """
    def chave_terminal(term):
        # Extrai numero do terminal
        try:
            num = int(term)
            # Preferencia: 1/3/5 (entrada) < 13/43 (NA) < 31 (NF) < 2/4/6 (saida)
            if num in (1, 3, 5, 7):
                return (0, num)
            elif num in (13, 43):  # NA (contato aberto)
                return (1, num)
            elif num in (31, 32):  # NF (contato fechado)
                return (2, num)
            elif num in (2, 4, 6, 8):
                return (3, num)
            else:
                return (4, num)
        except:
            return (5, term)
    
    return min(grupo_terminais, key=chave_terminal)


def _otimizar_distribuicao_local(fios, terminais_consumidores_map, fonte_comp):
    """
    Otimização local: tenta mover componentes para pais com menos carga
    para reduzir terminais com 3 conexões, mantendo todas as restrições.
    """
    # Constrói mapa de conexões atuais
    conexoes_por_terminal = {}
    pai_por_componente = {}
    componente_por_terminal = {}

    for f in fios:
        if f["tipo"] == "jump":
            origem = f["origem"]
            destino = f["destino"]
            comp_origem = origem[0]
            comp_destino = destino[0]

            if origem not in conexoes_por_terminal:
                conexoes_por_terminal[origem] = []
            conexoes_por_terminal[origem].append(destino)

            pai_por_componente[comp_destino] = origem
            componente_por_terminal[origem] = comp_origem
            componente_por_terminal[destino] = comp_destino

    # Para cada componente, tenta encontrar um pai melhor
    melhorou = True
    while melhorou:
        melhorou = False

        for comp in list(terminais_consumidores_map.keys()):
            if comp == fonte_comp:
                continue

            pai_atual = pai_por_componente.get(comp)
            if not pai_atual:
                continue

            # Conta carga atual do pai
            carga_atual = len(conexoes_por_terminal.get(pai_atual, []))

            # Procura pais alternativos com menos carga
            for terminal_pai_cand in conexoes_por_terminal:
                comp_pai_cand = componente_por_terminal.get(terminal_pai_cand)
                if not comp_pai_cand or comp_pai_cand == comp:
                    continue

                # Verifica se pode conectar (mesmo lado ou fonte)
                lado_comp = "tampa" if _eh_na_tampa(comp) else "interno"
                lado_pai = "tampa" if _eh_na_tampa(comp_pai_cand) else "interno"
                classe_comp = classificar_componente(comp)

                pode_conectar = (
                    lado_comp == lado_pai or  # mesmo lado
                    comp_pai_cand == fonte_comp or  # fonte
                    (classe_comp == "timer" and classificar_componente(comp_pai_cand) in ("contator", "botao"))  # timer só de contator
                )

                if not pode_conectar:
                    continue

                # Verifica limites
                limite_pai = 1 if classificar_componente(comp_pai_cand) == "timer" else 3
                if comp_pai_cand == fonte_comp:
                    limite_pai = 5

                carga_cand = len(conexoes_por_terminal.get(terminal_pai_cand, []))
                if carga_cand >= limite_pai:
                    continue

                # Se candidato tem MENOS carga que atual, move
                if carga_cand < carga_atual:
                    # Remove do pai atual
                    if pai_atual in conexoes_por_terminal:
                        conexoes_por_terminal[pai_atual] = [
                            t for t in conexoes_por_terminal[pai_atual] if t[0] != comp
                        ]

                    # Adiciona ao novo pai
                    if terminal_pai_cand not in conexoes_por_terminal:
                        conexoes_por_terminal[terminal_pai_cand] = []
                    conexoes_por_terminal[terminal_pai_cand].append((comp, terminais_consumidores_map[comp][0]))

                    # Atualiza pai
                    pai_por_componente[comp] = terminal_pai_cand
                    melhorou = True
                    break

            if melhorou:
                break

    # Reconstrói lista de fios
    novos_fios = []
    for origem, destinos in conexoes_por_terminal.items():
        for destino in destinos:
            novos_fios.append({
                "net": fios[0]["net"] if fios else "",
                "descricao": fios[0]["descricao"] if fios else "",
                "origem": origem,
                "destino": destino,
                "tipo": "jump"
            })

    return novos_fios


def _distribuir_conexoes_inteligentes(fonte, terminais_consumidores_map, net_id, descricao):
    """
    Lógica AVANÇADA — ÁRVORE BALANCEADA + OTIMIZAÇÃO LOCAL:

    Fase 1: Construção gulosa inteligente
    Fase 2: Otimização local para reduzir terminais com 3 conexões
    Fase 3: Balanceamento final

    Resolve o problema matemático de distribuição ótima de conexões elétricas.
    """
    # Fase 1: Construção gulosa (igual ao anterior)
    fios_iniciais = _construir_arvore_gulosa(fonte, terminais_consumidores_map, net_id, descricao)

    # Fase 2: Otimização local
    fios_otimizados = _otimizar_distribuicao_local(fios_iniciais, terminais_consumidores_map, fonte[0])

    # Fase 3: Adiciona jumps internos (sempre necessário)
    todos_fios = fios_otimizados[:]
    for comp, termos in terminais_consumidores_map.items():
        for i in range(len(termos) - 1):
            todos_fios.append({
                "net": net_id, "descricao": descricao,
                "origem": (comp, termos[i]),
                "destino": (comp, termos[i + 1]),
                "tipo": "jump",
            })

    return todos_fios


def _construir_arvore_gulosa(fonte, terminais_consumidores_map, net_id, descricao):
    """
    Fase 1: Construção gulosa da árvore (extraído do algoritmo anterior)
    """
    fios = []

    fonte_comp, fonte_term = fonte
    fonte_na_tampa = _eh_na_tampa(fonte_comp)

    componentes = list(terminais_consumidores_map.keys())
    internos = [c for c in componentes if not _eh_na_tampa(c)]
    tampas = [c for c in componentes if _eh_na_tampa(c)]

    if fonte_na_tampa:
        grupos = [tampas, internos]
    else:
        grupos = [internos, tampas]

    # Ordena cada grupo para escolher o primeiro componente de cada lado
    def ordenar_grupo(grupo, origem_comp):
        return sorted(
            grupo,
            key=lambda c: (
                PRIORIDADE_CLASSE.get(classificar_componente(c), 99),
                distancia_fisica(origem_comp, c),
                ordem_fisica(c)
            )
        )

    grupo_interno = ordenar_grupo(internos, fonte_comp)
    grupo_tampa = ordenar_grupo(tampas, fonte_comp)
    componentes_ordenados = []
    if fonte_na_tampa:
        grupos_ordenados = [grupo_tampa, grupo_interno]
    else:
        grupos_ordenados = [grupo_interno, grupo_tampa]

    # Construir a ordem dos componentes em cada grupo, mantendo o mais próximo
    # de um dos componentes já alimentados e evitando concentrar saídas.
    pais_disponiveis = [{
        "comp": fonte_comp,
        "term": fonte_term,
        "saida": 0,
        "lado": "tampa" if fonte_na_tampa else "interno",
        "limite": 5,  # fonte pode ter mais saídas (fases e retificadora)
    }]

    for grupo in grupos_ordenados:
        while grupo:
            # Escolhe o próximo componente a alimentar do grupo
            proximo = min(
                grupo,
                key=lambda c: (
                    PRIORIDADE_CLASSE.get(classificar_componente(c), 99),
                    distancia_fisica(fonte_comp, c),
                    ordem_fisica(c)
                )
            )
            grupo.remove(proximo)
            componentes_ordenados.append(proximo)

            # Adiciona-o à lista de pais disponíveis para alimentar outros
            limite_saida = 1 if classificar_componente(proximo) == "timer" else 3
            pais_disponiveis.append({
                "comp": proximo,
                "term": terminais_consumidores_map[proximo][-1],
                "saida": 0,
                "lado": "tampa" if _eh_na_tampa(proximo) else "interno",
                "limite": limite_saida,
            })

    # Função para escolher o melhor pai para um componente alvo
    def escolher_pai(alvo):
        lado_alvo = "tampa" if _eh_na_tampa(alvo) else "interno"
        classe_alvo = classificar_componente(alvo)

        # Para temporizadores, só usar pais que sejam contatores ou fonte
        if classe_alvo == "timer":
            candidatos = [p for p in pais_disponiveis
                         if p["saida"] < p["limite"] and
                         (classificar_componente(p["comp"]) in ("contator", "botao") or p["comp"] == fonte_comp)]
        else:
            candidatos = [p for p in pais_disponiveis if p["lado"] == lado_alvo and p["saida"] < p["limite"]]
            if not candidatos:
                candidatos = [p for p in pais_disponiveis if p["saida"] < p["limite"]]

        if not candidatos:
            # Se nenhum pai disponível, usa o com menor saída mesmo que exceda limite
            candidatos = pais_disponiveis

        return min(
            candidatos,
            key=lambda p: (
                p["saida"],  # Prioriza pais com MENOS saídas (inteligente!)
                distancia_fisica(p["comp"], alvo),
                PRIORIDADE_CLASSE.get(classificar_componente(p["comp"]), 99),
                ordem_fisica(p["comp"]),
            )
        )

    # Constrói a árvore de alimentação
    for comp in componentes_ordenados:
        grupo_terms = terminais_consumidores_map[comp]
        primeiro_term = _escolher_terminal_principal(grupo_terms, comp, descricao)

        pai = escolher_pai(comp)
        origem = (pai["comp"], pai["term"])
        tipo = "cabo" if pai["comp"] != comp else "jump"

        fios.append({
            "net": net_id, "descricao": descricao,
            "origem": origem,
            "destino": (comp, primeiro_term),
            "tipo": tipo,
        })
        pai["saida"] += 1

    return fios


def rotear_net(net_id, descricao, terminais):
    """
    Roteador INTELIGENTE usando o algoritmo otimizado do simulador_roteamento.py
    """
    if len(terminais) < 2:
        return []

    # Build info_terminais for the router
    info_terminais = {}
    grid_config = {
        "interno": {"linhas": 4, "colunas": 6},  # Default, can be overridden
        "tampa": {"linhas": 4, "colunas": 4}
    }
    
    # Load grid config if available
    config_painel = carregar_painel_config("painel_config.json")
    if config_painel:
        grid_config["interno"]["linhas"] = len(config_painel.get("interno", {}).get("grids", []))
        grid_config["interno"]["colunas"] = max(len(row) for row in config_painel.get("interno", {}).get("grids", [])) if config_painel.get("interno", {}).get("grids") else 6
        grid_config["tampa"]["linhas"] = len(config_painel.get("tampa", {}).get("grids", []))
        grid_config["tampa"]["colunas"] = max(len(row) for row in config_painel.get("tampa", {}).get("grids", [])) if config_painel.get("tampa", {}).get("grids") else 4

    # Build component info
    componentes = {}
    for comp, term in terminais:
        if comp not in componentes:
            zona = "tampa" if _eh_na_tampa(comp) else "interno"
            linha, coluna = _POSICOES_AUTO.get(comp, (0, 0))
            componentes[comp] = {"zona": zona, "linha": linha, "coluna": coluna}
        
        # Set terminal limits based on component type
        classe = classificar_componente(comp)
        limite = 1 if classe == "timer" else 3
        if comp == terminais[0][0]:  # Source component
            limite = 5
        
        info_terminais[(comp, term)] = {
            "zona": componentes[comp]["zona"],
            "linha": componentes[comp]["linha"],
            "coluna": componentes[comp]["coluna"],
            "limite": limite
        }

    # Use the intelligent router
    roteador = RoteadorInteligente(componentes, info_terminais, grid_config)
    terminal_keys = list(info_terminais.keys())
    rota, custo, graus = roteador.rotear(terminal_keys)

    if not rota:
        return []

    # Convert to the expected format
    fios = []
    for u, v in rota:
        comp_u, term_u = u
        comp_v, term_v = v
        fios.append({
            "net": net_id,
            "descricao": descricao,
            "origem": u,
            "destino": v,
            "tipo": "cabo"
        })

    # Add internal jumps for components with multiple terminals
    grupos = {}
    for comp, term in terminais:
        grupos.setdefault(comp, []).append(term)
    
    for comp, termos in grupos.items():
        if len(termos) > 1:
            # Sort terminals intelligently
            termos_ordenados = sorted(termos, key=lambda t: _prioridade_terminal(t))
            for i in range(len(termos_ordenados) - 1):
                fios.append({
                    "net": net_id,
                    "descricao": descricao,
                    "origem": (comp, termos_ordenados[i]),
                    "destino": (comp, termos_ordenados[i + 1]),
                    "tipo": "jump"
                })

    return fios


def _prioridade_terminal(term):
    """Helper to sort terminals by priority: entrada < NA < NF < saida"""
    try:
        num = int(term)
        if num in (1, 3, 5, 7):
            return (0, num)
        elif num in (13, 43):
            return (1, num)
        elif num in (31, 32):
            return (2, num)
        elif num in (2, 4, 6, 8):
            return (3, num)
        else:
            return (4, num)
    except:
        return (5, term)


def gerar_roteamento(nets, label):
    """Aplica rotear_net em todas as NETS e retorna a lista completa de fios."""
    todos_fios = []
    for net_id, desc, terminais in nets:
        fios = rotear_net(net_id, desc, terminais)
        todos_fios.extend(fios)
    return todos_fios


def contar_carga_bornes(fios):
    """Retorna dict {borne: numero_de_fios} para todos os bornes usados."""
    contagem = defaultdict(int)
    for f in fios:
        contagem[f["origem"]]  += 1
        contagem[f["destino"]] += 1
    return contagem


def relatorio_carga(contagem):
    """Retorna (avisos, restritos) -- listas para inspecao manual."""
    avisos = [(b, n) for b, n in contagem.items() if n > LIMITE_AVISO_FIOS]
    restritos = [(b, n) for b, n in contagem.items() if b in BORNES_RESTRITOS and n > 1]
    return avisos, restritos


# ============================================================================
# 5. GERACAO DAS SAIDAS
# ============================================================================

def fmt_borne(b):
    """Formata um par (componente, terminal) como 'COMP:term'."""
    return f"{b[0]}:{b[1]}"


def gerar_relatorio_componentes(comps_forca, comps_comando, fios_forca, fios_comando):
    """Gera relatorio MD com todos os componentes detectados."""
    out = []
    out.append("# Relatorio de Componentes Detectados")
    out.append("")
    out.append("Gerado automaticamente por `analisar_cad.py`.")
    out.append("")

    def listar(componentes, titulo):
        out.append(f"## {titulo}")
        out.append("")

        # agrupa por categoria
        por_cat = defaultdict(list)
        for c in componentes:
            if c.get("tipo") == "wire":
                continue
            por_cat[c.get("categoria","outro")].append(c)

        for cat in sorted(por_cat.keys()):
            out.append(f"### {cat}")
            out.append("")
            out.append("| Nome | ID | Codigo | Terminais | Descricao |")
            out.append("|---|---|---|---|---|")
            for c in sorted(por_cat[cat], key=lambda x: (x.get("nome",""), int(x.get("id","0")))):
                terms = ", ".join(c.get("terminais", [])) or "-"
                out.append(f"| **{c.get('nome','')}** | {c.get('id')} | {c.get('codigo')} | {terms} | {c.get('descricao','')} |")
            out.append("")

    listar(comps_forca,   "CIRCUITO DE FORCA")
    listar(comps_comando, "CIRCUITO DE COMANDO")

    # Resumo de fios
    out.append("## Resumo do Roteamento")
    out.append("")
    out.append(f"- Fios de forca: **{len(fios_forca)}**")
    out.append(f"- Fios de comando: **{len(fios_comando)}**")
    out.append(f"- Total: **{len(fios_forca) + len(fios_comando)}**")
    out.append("")

    # Carga dos bornes
    contagem = contar_carga_bornes(fios_forca + fios_comando)
    avisos, restritos = relatorio_carga(contagem)

    out.append("## Carga por Borne (Top 20)")
    out.append("")
    out.append("Bornes ordenados por numero de fios. Inspecione manualmente os com mais de 2-3 fios:")
    out.append("se o terminal fisico for pequeno (ex: timer), considere realocar.")
    out.append("")
    out.append("| Borne | Fios |")
    out.append("|---|---|")
    top = sorted(contagem.items(), key=lambda x: (-x[1], x[0]))[:20]
    for b, n in top:
        marca = " **!!!**" if b in BORNES_RESTRITOS and n > 1 else ""
        out.append(f"| {fmt_borne(b)}{marca} | {n} |")
    out.append("")

    if restritos:
        out.append("### ATENCAO - Bornes pequenos com mais de 1 fio")
        out.append("")
        out.append("Estes bornes (timer, bobinas finas) sao fisicamente pequenos e geralmente")
        out.append("aceitam apenas 1 fio. Realoque a conexao para outro ponto do mesmo potencial:")
        out.append("")
        for b, n in sorted(restritos, key=lambda x: -x[1]):
            out.append(f"- **{fmt_borne(b)}** tem {n} fios")
        out.append("")

    if avisos:
        out.append(f"### Aviso - bornes com mais de {LIMITE_AVISO_FIOS} fios")
        out.append("")
        for b, n in sorted(avisos, key=lambda x: -x[1]):
            out.append(f"- {fmt_borne(b)}: {n} fios")
        out.append("")

    return "\n".join(out)


def gerar_checklist_html(fios_forca, fios_comando):
    """Gera o checklist HTML A4 imprimivel."""
    css = """
    @page { size: A4; margin: 12mm 14mm; }
    * { box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 10pt; color: #000; margin: 0; }
    h1 { font-size: 16pt; margin: 0 0 4mm 0; padding-bottom: 2mm; border-bottom: 0.6mm solid #000; }
    h2 { font-size: 12pt; margin: 6mm 0 2mm 0; padding: 1.5mm 2mm; background: #e8e8e8; border-left: 4mm solid #0066cc; }
    h3 { font-size: 10pt; margin: 3mm 0 1mm 0; color: #444; border-bottom: 0.3mm dashed #888; padding-bottom: 0.5mm; }
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
    .net-sep td { background: #d8d8d8 !important; font-size: 8pt !important; padding: 0.8mm 2mm !important; color: #333; }
    .page-break { page-break-after: always; }
    @media print { .legenda { background: transparent; } }
    """

    def render_secao(titulo, fios, prefixo_num):
        html = []
        html.append(f"<h2>{titulo}</h2>")
        html.append("<table class='checklist'>")
        html.append("<thead><tr>"
                    "<th>#</th><th>Ok</th><th>Tipo</th>"
                    "<th>Origem</th><th>&rarr;</th><th>Destino</th>"
                    "<th>Descricao</th></tr></thead>")
        html.append("<tbody>")
        ultimo_net = None
        for i, f in enumerate(fios, 1):
            num = f"{prefixo_num}{i:02d}"
            if f["net"] != ultimo_net:
                html.append(f"<tr class='net-sep'><td colspan='7'>"
                            f"<b>Rede {f['net']}</b> &mdash; {f['descricao']}</td></tr>")
                ultimo_net = f["net"]
            classe = "tipo-cabo" if f["tipo"] == "cabo" else "tipo-jump"
            tipo_label = "CABO" if f["tipo"] == "cabo" else "JUMP"
            html.append(f"<tr class='{classe}'>")
            html.append(f"<td class='num'>{num}</td>")
            html.append(f"<td class='box'>&#9744;</td>")
            html.append(f"<td class='tipo'>{tipo_label}</td>")
            html.append(f"<td class='origem'>{fmt_borne(f['origem'])}</td>")
            html.append(f"<td>&rarr;</td>")
            html.append(f"<td class='destino'>{fmt_borne(f['destino'])}</td>")
            html.append(f"<td class='descricao'>{f['descricao']}</td>")
            html.append(f"</tr>")
        html.append("</tbody></table>")
        return "\n".join(html)

    parts = []
    parts.append("<!DOCTYPE html><html lang='pt-BR'><head><meta charset='UTF-8'>")
    parts.append("<title>Checklist de Montagem - Painel Industrial</title>")
    parts.append(f"<style>{css}</style></head><body>")
    parts.append("<h1>Checklist de Montagem - Painel Estrela-Triangulo Reversivel</h1>")
    parts.append("<div class='header-info'>"
                 "Gerado automaticamente por <code>analisar_cad.py</code>. "
                 "Imprima em A4, monte na ordem listada e marque cada item conforme conclui."
                 "</div>")
    parts.append("<div class='legenda'>"
                 "<b>Como usar:</b><br>"
                 "1. Monte o circuito de <b>FORCA primeiro</b> (cabo 4 mm&sup2;), depois o de <b>COMANDO</b> (cabo 2,5 mm&sup2;).<br>"
                 "2. <b>CABO</b> (azul) = fio entre componentes diferentes &mdash; cole anilha em cada ponta.<br>"
                 "3. <b>JUMP</b> (laranja) = jumper interno do mesmo componente (ex: K4:13 -> K4:43) &mdash; sem anilha.<br>"
                 "4. Cada borne aceita ate <b>3 fios</b>. Se passar disso, o roteamento esta errado.<br>"
                 "5. Use a coluna <b>Ok</b> para marcar com caneta o que ja foi feito."
                 "</div>")
    parts.append(render_secao("Circuito de FORCA (cabo 4 mm&sup2;)", fios_forca, "F"))
    parts.append("<div class='page-break'></div>")
    parts.append(render_secao("Circuito de COMANDO (cabo 2,5 mm&sup2;)", fios_comando, "C"))
    parts.append("</body></html>")
    return "\n".join(parts)


def gerar_anilhas_html(fios_forca, fios_comando):
    """Gera o HTML das anilhas alinhadas ao checklist (mesma numeracao)."""
    css = """
    @page { size: A4; margin: 8mm; }
    * { box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 9pt; color: #000; margin: 0; }
    h1 { font-size: 14pt; margin: 0 0 3mm 0; padding-bottom: 1.5mm; border-bottom: 0.5mm solid #000; }
    h2 { font-size: 11pt; margin: 4mm 0 2mm 0; padding: 1mm 2mm; background: #e8e8e8; border-left: 3mm solid #0066cc; }
    .legenda { font-size: 7.5pt; background: #fff8dc; border-left: 1mm solid #d4a000; padding: 1.5mm 2mm; margin-bottom: 3mm; line-height: 1.3; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1mm 1.5mm; }
    .label {
      display: grid; grid-template-columns: 1fr auto 1fr;
      border: 0.2mm dashed #aaa; height: 11mm; page-break-inside: avoid;
    }
    .label.control { height: 9mm; }
    .label .text {
      display: flex; flex-direction: column; justify-content: center; align-items: center;
      font-weight: 900; font-size: 9pt; line-height: 1.05; padding: 0.3mm 0.5mm; text-align: center;
    }
    .label .text .num { font-size: 6.5pt; color: #0066cc; font-weight: bold; }
    .label .gap {
      width: 14mm; border-left: 0.15mm dashed #999; border-right: 0.15mm dashed #999;
      background: repeating-linear-gradient(45deg, #fff, #fff 0.8mm, #f0f0f0 0.8mm, #f0f0f0 1.6mm);
    }
    .label.control .gap { width: 11mm; }
    .page-break { page-break-after: always; }
    """
    parts = []
    parts.append("<!DOCTYPE html><html lang='pt-BR'><head><meta charset='UTF-8'>")
    parts.append("<title>Anilhas - Painel Industrial</title>")
    parts.append(f"<style>{css}</style></head><body>")
    parts.append("<h1>Anilhas - Painel Estrela-Triangulo Reversivel</h1>")
    parts.append("<div class='legenda'>"
                 "Cada <b>CABO</b> do checklist gera 2 anilhas espelhadas (uma para cada ponta). "
                 "<b>JUMPs</b> internos nao recebem anilha. Numero pequeno em azul = numero do passo no checklist. "
                 "Formato: texto | gap (cabo) | texto. Enrole o gap no cabo e cole as duas abas em bandeira."
                 "</div>")

    def render_grid(titulo, fios, prefixo, control):
        html = []
        html.append(f"<h2>{titulo}</h2>")
        html.append("<div class='grid'>")
        for i, f in enumerate(fios, 1):
            if f["tipo"] != "cabo":
                continue
            num = f"{prefixo}{i:02d}"
            a = fmt_borne(f["origem"])
            b = fmt_borne(f["destino"])
            for local, remote in ((a, b), (b, a)):
                html.append(
                    f"<div class='label{' control' if control else ''}'>"
                    f"<div class='text'><div class='num'>{num}</div><div>{local}</div><div>{remote}</div></div>"
                    f"<div class='gap'></div>"
                    f"<div class='text'><div class='num'>{num}</div><div>{local}</div><div>{remote}</div></div>"
                    f"</div>"
                )
        html.append("</div>")
        return "\n".join(html)

    parts.append(render_grid("FORCA - Anilhas (cabo 4 mm&sup2;)", fios_forca, "F", control=False))
    parts.append("<div class='page-break'></div>")
    parts.append(render_grid("COMANDO - Anilhas (cabo 2,5 mm&sup2;)", fios_comando, "C", control=True))
    parts.append("</body></html>")
    return "\n".join(parts)


# ============================================================================
# 6. MAIN
# ============================================================================

def main_auto(arquivos, base_dir):
    """Modo automatico: detecta NETs de cada .cad SEPARADAMENTE
    (cada arquivo eh um circuito independente, mesmo que coordenadas
    coincidam entre eles). Concatena os resultados com prefixo F/C/etc.
    """
    todos_componentes_relatorio = []  # so pra relatorio (todos juntos)
    todos_fios = []
    todas_nets = []

    config_painel = carregar_painel_config(base_dir / "painel_config.json")

    for idx, arq in enumerate(arquivos):
        comps = parse_cad(arq)
        if not comps:
            continue
        n_comp = len([c for c in comps if c.get('tipo') != 'wire'])
        n_wire = len([c for c in comps if c.get('tipo') == 'wire'])
        print(f"[INFO] {arq}: {n_comp} componentes, {n_wire} wires")
        todos_componentes_relatorio.extend(comps)

        # Popula posicoes fisicas com coords reais deste arquivo e do json
        popular_posicoes_auto(comps, config_painel)

        # Detecta NETs DESTE arquivo isoladamente
        nets_brutas = detectar_nets(comps)
        nets = ordenar_nets_por_fluxo(nets_brutas, comps)

        # Adiciona prefixo da origem (forca/comando/etc) ao net_id
        nome_lower = Path(arq).name.lower()
        if "forca" in nome_lower or "força" in nome_lower:
            prefixo = "F"
        elif "comando" in nome_lower:
            prefixo = "C"
        else:
            prefixo = chr(ord('A') + idx)

        nets_renomeadas = [(f"{prefixo}{i+1}", desc, terms)
                           for i, (_, desc, terms) in enumerate(nets)]

        print(f"       -> {len(nets_renomeadas)} NETs detectadas")
        todas_nets.extend(nets_renomeadas)

        # Gera roteamento deste arquivo
        fios = gerar_roteamento(nets_renomeadas, prefixo)
        todos_fios.extend(fios)

    if not todos_fios:
        print("[ERRO] Nenhum fio gerado (verifique TERMINAL_OFFSETS)")
        return 1

    nets = todas_nets
    fios_todos = todos_fios
    todos_componentes = todos_componentes_relatorio
    print(f"[INFO] {len(nets)} NETs no total, {len(fios_todos)} fios")

    # Separa fios por prefixo do net_id (F = forca, C = comando, etc)
    fios_forca = [f for f in fios_todos if f["net"].startswith("F")]
    fios_comando = [f for f in fios_todos if f["net"].startswith("C")]
    fios_outros = [f for f in fios_todos
                   if not (f["net"].startswith("F") or f["net"].startswith("C"))]
    # Se tudo veio sem prefixo F/C, mostra tudo num bloco so
    if not fios_forca and not fios_comando:
        fios_forca = fios_outros
        fios_outros = []
    fios_forca += [f for f in fios_outros if False]  # placeholder

    # Carga
    contagem = contar_carga_bornes(fios_todos)
    avisos, restritos = relatorio_carga(contagem)
    if restritos:
        print(f"[AVISO] {len(restritos)} bornes restritos com >1 fio:")
        for b, n in restritos:
            print(f"        {fmt_borne(b)}: {n} fios")
    if avisos:
        print(f"[INFO] {len(avisos)} bornes com >{LIMITE_AVISO_FIOS} fios:")
        for b, n in sorted(avisos, key=lambda x: -x[1])[:10]:
            print(f"        {fmt_borne(b)}: {n} fios")

    # Saidas
    out_relatorio = base_dir / "relatorio_componentes.md"
    out_checklist = base_dir / "checklist_montagem.html"
    out_anilhas   = base_dir / "anilhas.html"
    out_nets      = base_dir / "nets_detectadas.md"

    rel_md = gerar_relatorio_componentes(todos_componentes, [], fios_forca, fios_comando)
    out_relatorio.write_text(rel_md, encoding='utf-8')
    print(f"[OK] {out_relatorio}")

    chk_html = gerar_checklist_html(fios_forca, fios_comando)
    out_checklist.write_text(chk_html, encoding='utf-8')
    print(f"[OK] {out_checklist}")

    anl_html = gerar_anilhas_html(fios_forca, fios_comando)
    out_anilhas.write_text(anl_html, encoding='utf-8')
    print(f"[OK] {out_anilhas}")

    # Relatorio das NETs detectadas (util para debug e revisao)
    nets_md = ["# NETs Detectadas Automaticamente", ""]
    for net_id, desc, terminais in nets:
        nets_md.append(f"## {net_id} ({len(terminais)} terminais)")
        nets_md.append(f"_{desc}_")
        nets_md.append("")
        nets_md.append(f"- **Source:** `{fmt_borne(terminais[0])}`")
        nets_md.append(f"- **Consumers:** " + ", ".join(f"`{fmt_borne(t)}`" for t in terminais[1:]))
        nets_md.append("")
    out_nets.write_text("\n".join(nets_md), encoding='utf-8')
    print(f"[OK] {out_nets}")

    return 0


def main():
    if len(sys.argv) < 2:
        print("Uso:")
        print("  python analisar_cad.py FORCA_PROJETO COMANDO_PROJETO")
        print("      Modo MANUAL - usa NETs definidas no script (projeto estrela-triangulo)")
        print("")
        print("  python analisar_cad.py auto ARQUIVO.cad [ARQUIVO2.cad ...]")
        print("      Modo AUTO - detecta NETs automaticamente do .cad")
        return 1

    # Detecta modo
    modo = "manual"
    arquivos = sys.argv[1:]
    if arquivos and arquivos[0].lower() == "auto":
        modo = "auto"
        arquivos = arquivos[1:]
        if not arquivos:
            print("[ERRO] modo auto exige pelo menos 1 arquivo .cad")
            return 1

    base_dir = Path(arquivos[0]).parent if Path(arquivos[0]).parent != Path('') else Path('.')

    if modo == "auto":
        return main_auto(arquivos, base_dir)

    # Modo manual (legado, projeto estrela-triangulo reversivel)
    arq_forca = None
    arq_comando = None
    for a in arquivos:
        nome_lower = Path(a).name.lower()
        if "forca" in nome_lower or "força" in nome_lower:
            arq_forca = a
        elif "comando" in nome_lower:
            arq_comando = a

    if arq_forca is None and arq_comando is None and len(arquivos) >= 2:
        arq_forca, arq_comando = arquivos[0], arquivos[1]
    elif arq_comando is None and len(arquivos) == 1:
        arq_comando = arquivos[0]

    comps_forca   = parse_cad(arq_forca)   if arq_forca   else []
    comps_comando = parse_cad(arq_comando) if arq_comando else []

    print(f"[INFO] Forca:   {arq_forca}   -> {len([c for c in (comps_forca   or []) if c.get('tipo')!='wire'])} componentes")
    print(f"[INFO] Comando: {arq_comando} -> {len([c for c in (comps_comando or []) if c.get('tipo')!='wire'])} componentes")

    fios_forca   = gerar_roteamento(nets_forca(),   "forca")
    fios_comando = gerar_roteamento(nets_comando(), "comando")

    # Carga dos bornes
    contagem = contar_carga_bornes(fios_forca + fios_comando)
    avisos, restritos = relatorio_carga(contagem)
    if restritos:
        print(f"[AVISO] {len(restritos)} bornes restritos (timer/bobina) com mais de 1 fio:")
        for b, n in restritos:
            print(f"        {fmt_borne(b)}: {n} fios -> realoque")
    if avisos:
        print(f"[INFO] {len(avisos)} bornes com mais de {LIMITE_AVISO_FIOS} fios (revise manualmente):")
        for b, n in sorted(avisos, key=lambda x: -x[1])[:10]:
            print(f"        {fmt_borne(b)}: {n} fios")

    # Gera saidas
    out_relatorio = base_dir / "relatorio_componentes.md"
    out_checklist = base_dir / "checklist_montagem.html"
    out_anilhas   = base_dir / "anilhas.html"

    rel_md = gerar_relatorio_componentes(comps_forca or [], comps_comando or [], fios_forca, fios_comando)
    out_relatorio.write_text(rel_md, encoding='utf-8')
    print(f"[OK] {out_relatorio}")

    chk_html = gerar_checklist_html(fios_forca, fios_comando)
    out_checklist.write_text(chk_html, encoding='utf-8')
    print(f"[OK] {out_checklist}")

    anl_html = gerar_anilhas_html(fios_forca, fios_comando)
    # nao sobrescreve se ja existe um anilhas.html manual? -- aqui sobrescreve mesmo, eh o objetivo
    out_anilhas.write_text(anl_html, encoding='utf-8')
    print(f"[OK] {out_anilhas}")

    print()
    print(f"Total fios: {len(fios_forca)} forca + {len(fios_comando)} comando = {len(fios_forca)+len(fios_comando)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
