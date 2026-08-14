#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gerador da base de componentes do CADe_SIMU.

Lê o arquivo "somente componentes" (paleta completa exportada do CADe_SIMU)
e produz `componentes_base.py` com TIPOS_COMPONENTES e TERMINAL_OFFSETS
populados para cada código encontrado.

Rodar manualmente quando a paleta do CADe_SIMU mudar:
    python gerar_base_componentes.py
"""

import re
from pathlib import Path
from pprint import pformat

BASE_DIR = Path(__file__).parent
ARQ_PALETA = BASE_DIR / "somente componentes"
ARQ_SAIDA = BASE_DIR / "componentes_base.py"

# Códigos de fios — registrados em TIPOS_WIRES, sem terminais.
CODIGOS_WIRES = {"4000", "4001", "4002", "4003", "4004", "4009", "4010",
                 "4011", "4012", "4013", "4014", "4015", "4016", "4017",
                 "4018", "4019"}

# Categoria por prefixo do código.
def categorizar(codigo):
    p = codigo[0] if codigo else ""
    if codigo.startswith("10") or codigo.startswith("11"):
        # 1000-1099 motores físicos; 1050+ geradores/PLCs/relés especiais
        n = int(codigo)
        if 1000 <= n < 1050: return "motor"
        if 1050 <= n < 1070: return "gerador"
        return "rele_logico"
    if p == "2": return "contator_pot"
    if p == "3":
        n = int(codigo)
        if 3000 <= n < 3012: return "entrada"
        if 3019 == n: return "fonte_dc"
        if codigo in ("3014", "3018"): return "trafo"
        if codigo in ("3012", "3013", "3017"): return "trafo"
        if codigo == "3020": return "trafo_corrente"
        return "entrada"
    if p == "5": return "fusivel"
    if p == "6":
        n = int(codigo)
        if 6007 == n: return "rele_termico"
        if 6008 <= n <= 6012: return "disjuntor"
        return "fusivel"
    if p == "7":
        n = int(codigo)
        if 7000 <= n < 7004: return "contato_aux"
        if 7004 <= n < 7016: return "timer_aux"
        if 7500 <= n < 7700: return "sensor"
        return "contato_aux"
    if p == "8":
        n = int(codigo)
        if 8016 <= n <= 8019: return "rt_aux"
        if 8020 <= n <= 8022: return "seletor"
        return "botao"
    if p == "9":
        n = int(codigo)
        if 9000 <= n < 9008: return "bobina"
        if 9008 <= n < 9040: return "sinaleiro"
        if 9040 <= n < 9044: return "tomada"
        return "bobina"
    return "outro"

DESCRICOES_CATEGORIA = {
    "motor": "Motor",
    "gerador": "Gerador/Fonte especial",
    "rele_logico": "Rele logico",
    "contator_pot": "Contator de potencia",
    "entrada": "Entrada/Borne",
    "fonte_dc": "Fonte DC",
    "trafo": "Transformador",
    "trafo_corrente": "TC",
    "fusivel": "Fusivel",
    "rele_termico": "Rele termico",
    "disjuntor": "Disjuntor",
    "contato_aux": "Contato auxiliar",
    "timer_aux": "Contato timer",
    "sensor": "Sensor",
    "rt_aux": "RT auxiliar",
    "seletor": "Seletor",
    "botao": "Botao",
    "bobina": "Bobina",
    "sinaleiro": "Sinaleiro",
    "tomada": "Tomada",
    "outro": "Outro",
}


def filtrar_rotulos_estado(terminais):
    """Remove rótulos de estado ('0', '1', '2'...) que aparecem após
    terminais elétricos nomeados em sinaleiros/timers/bobinas.

    Ex: ['X1','X2','0'] -> ['X1','X2'] (o '0' indica cor do LED)
        ['A1','A2','0','1'] -> ['A1','A2'] (estados do timer)
    Mantém terminais numéricos genuínos (1,3,5,2,4,6 de contatos de força).
    """
    if not terminais:
        return terminais
    eletricos_nomeados = {"X1", "X2", "A1", "A2", "A3", "+", "-",
                          "PE", "U1", "V1", "W1", "U2", "V2", "W2",
                          "L1", "L2", "L3", "N", "F1", "F2"}
    if not any(t in eletricos_nomeados for t in terminais):
        # Componente puramente numérico (contato de força). Mantém tudo.
        return terminais
    # Tem terminal nomeado: corta no último terminal nomeado/letra.
    fim = 0
    for i, t in enumerate(terminais):
        if t in eletricos_nomeados or any(c.isalpha() for c in t):
            fim = i + 1
    return terminais[:fim]


def parse_paleta(caminho):
    """Extrai (codigo, nome_template, terminais, bbox) de cada componente.

    bbox vem de partes[13..16] = (x_off, y_off, w, h) — usado pra deduzir
    altura entre fileiras de terminais.
    """
    with open(caminho, "r", encoding="latin-1", errors="ignore") as f:
        conteudo = f.read()

    inicios = [(m.start(), m.group(1), m.group(2))
               for m in re.finditer(r'\*(\d+)\*([1-9]\d{0,4})#', conteudo)]
    componentes = {}

    for i, (pos, _id_comp, codigo) in enumerate(inicios):
        fim = inicios[i+1][0] if i+1 < len(inicios) else len(conteudo)
        bloco = conteudo[pos:fim]
        codigo = codigo.lstrip('0') or '0'
        if codigo in CODIGOS_WIRES or codigo == "20000":
            continue
        if codigo in componentes:
            continue  # já catalogado

        m_pref = re.match(r'\*\d+\*\d+#(.*)$', bloco, re.DOTALL)
        if not m_pref:
            continue
        resto = m_pref.group(1)
        idx_flags = resto.find('*')
        if idx_flags == -1:
            continue
        cabecalho = resto[:idx_flags]
        campos = cabecalho.split('#')
        nome_template = campos[0].lstrip('-') if campos else ''

        terminais = [c for c in campos[1:]
                     if c and re.match(r'^[A-Za-z0-9_+\-]{1,4}$', c)]
        # Sinaleiros/timers/bobinas listam rótulos de estado ("0", "1") como
        # "terminais" na paleta — não são pinos elétricos roteáveis. Filtra.
        terminais = filtrar_rotulos_estado(terminais)

        partes = resto[idx_flags:].split('*')
        try:
            bbox_x = int(partes[13]); bbox_y = int(partes[14])
            bbox_w = int(partes[15]); bbox_h = int(partes[16])
        except (ValueError, IndexError):
            bbox_x = bbox_y = bbox_w = bbox_h = 0

        componentes[codigo] = {
            "nome_template": nome_template,
            "terminais": terminais,
            "bbox": (bbox_x, bbox_y, bbox_w, bbox_h),
        }
    return componentes


# Espaçamento padrão entre terminais (CADe_SIMU usa grade de 6 unidades).
SPACING = 6


def gerar_offsets(codigo, info):
    """Heurística pra gerar TERMINAL_OFFSETS a partir de bbox + lista.

    Regras (em ordem):
    1. Sem terminais → None (componente puramente visual, ex: -X bornes)
    2. Layout horizontal de motor (PE no meio da lista, sufixo no fim) →
       split na PE, top + bot
    3. 2 terminais com nomes verticais (A1/A2, X1/X2, +/-, etc.) → vertical
    4. 2 terminais numéricos (13/14, 11/12, 1/2, 95/96 etc.) → vertical _n=1
    5. 4/6/8 terminais → split simétrico em duas fileiras (_n style)
    6. Outros → tenta named horizontal numa fileira só
    """
    terminais = info["terminais"]
    bbox_h = info["bbox"][3]

    if not terminais:
        return None

    n = len(terminais)

    # === Motor com secundário (PE não no fim → split na PE)
    if "PE" in terminais and terminais.index("PE") < n - 1:
        idx_pe = terminais.index("PE")
        top = terminais[:idx_pe + 1]
        bot = terminais[idx_pe + 1:]
        bot_y = max(bbox_h - 3, 18)
        offsets = {}
        for i, t in enumerate(top):
            offsets[t] = (i * SPACING, 0)
        for i, t in enumerate(bot):
            offsets[t] = (i * SPACING, bot_y)
        return offsets

    # === 2 terminais verticais (bobinas, sinaleiros, fontes DC)
    NOMES_VERTICAIS = {("A1", "A2"), ("X1", "X2"), ("+", "-"),
                       ("A1", "A2", "0", "1"), ("X1", "X2", "0")}
    par2 = tuple(terminais[:2])
    if n == 2 and par2 in {("A1", "A2"), ("X1", "X2"), ("+", "-")}:
        h = max(bbox_h - 3, 12)
        return {terminais[0]: (0, 0), terminais[1]: (0, h)}
    if n in (3, 4) and par2 in {("A1", "A2"), ("X1", "X2")}:
        # Bobinas com terminais "0", "1" extras — só A1/A2 são roteáveis
        h = max(bbox_h - 3, 12)
        offsets = {terminais[0]: (0, 0), terminais[1]: (0, h)}
        return offsets

    # === 2 terminais numéricos (contato simples top/bot)
    if n == 2:
        h = max(bbox_h - 3, 12)
        return {"_n": 1, "_top": [0], "_bot": [0], "_h": h}

    # === 4/6/8 terminais multi-polo (top + bot iguais)
    if n in (4, 6, 8) and n % 2 == 0:
        meia = n // 2
        h = max(bbox_h - 3, 12)
        # Espaçamento real entre colunas de terminais é (bbox_w - SPACING) /
        # (meia-1). bbox_w=12 com 2 colunas -> 6 (default); bbox_w=15 -> 9
        # (botões 8002 e contatos aux 7002, onde o símbolo é mais largo);
        # bbox_w=18 com 3 colunas -> 6 (contator 2008). Sem isso, terminais
        # 13/14 dos botões caem em x errado e os fios não conectam.
        bbox_w = info["bbox"][2]
        spacing = (bbox_w - SPACING) // (meia - 1) if meia > 1 and bbox_w > SPACING else SPACING
        top_pos = [i * spacing for i in range(meia)]
        bot_pos = [i * spacing for i in range(meia)]
        # Mantém também named offsets para casos onde index() é mais robusto
        offsets = {"_n": meia, "_top": top_pos, "_bot": bot_pos, "_h": h}
        return offsets

    # === 3 terminais (motor mono [U1,V1,PE], seletor [1,2,3] etc)
    if n == 3:
        # Tudo numa fileira só (top), com PE no fim quando aplicável
        return {t: (i * SPACING, 0) for i, t in enumerate(terminais)}

    # === Tomadas (L1, L2, L3, N) — 4 terminais numa fileira
    if n == 4 and any(t in ("L1", "L2", "L3", "N") for t in terminais):
        return {t: (i * SPACING, 0) for i, t in enumerate(terminais)}

    # === Fallback: linha única horizontal
    return {t: (i * SPACING, 0) for i, t in enumerate(terminais)}


# Overrides manuais — onde a heurística não bate com o símbolo real do CADe_SIMU.
# Use só quando uma evidência concreta (fios em arquivo .cad real) mostrar o erro.
OVERRIDES = {
    # Trafo isolador: T1/T2 primário (direito/esquerdo), T3/T4 secundário (esq/dir)
    # Convenção verificada via COMANDO_PROJETO (FT espelhado, orient=4).
    "3014": {"1": (6, 0), "2": (0, 0), "3": (0, 18), "4": (6, 18), "PE": (-9, 9)},
    # Trafo sem PE — assumindo mesma convenção do 3014.
    "3013": {"1": (6, 0), "2": (0, 0), "3": (0, 18), "4": (6, 18)},
    # Fonte DC (positivo em cima, negativo embaixo).
    "3019": {"+": (0, 0), "-": (0, 12)},
    # Motores trifásicos clássicos (offsets verificados via FORCA_PROJETO).
    "1000": {"U1": (0, 0), "V1": (6, 0), "W1": (12, 0), "PE": (18, 0)},
    "1001": {"U1": (0, 0), "V1": (6, 0), "W1": (12, 0), "PE": (18, 0),
             "W2": (0, 24), "U2": (6, 24), "V2": (12, 24)},
    "1002": {"U1": (0, 0), "V1": (6, 0), "PE": (12, 0)},
    # Disjuntores: heurística dá _h=21 mas CADe_SIMU usa 21 pro bipolar (já bate)
    # e 24 pro tripolar (precisa override).
    "6009": {"_n": 3, "_top": [0, 6, 12], "_bot": [0, 6, 12], "_h": 24},
    # Entrada trifásica X — terminais virtuais L1/L2/L3/N (não estão no .cad,
    # mas o roteador precisa deles). Layout HORIZONTAL é o default do editor
    # (bbox w>>h em "somente componentes"); a rotação do .cad (orient=3) leva
    # esses offsets pra layout vertical empilhado quando a fonte é desenhada
    # virada — aplicar_orientacao faz a transformação automaticamente.
    "3004": {"L1": (0, 0), "L2": (6, 0), "L3": (12, 0)},
    "3005": {"L1": (0, 0), "L2": (6, 0), "L3": (12, 0), "N": (18, 0)},
    # Fontes monoterminais (3000=Terra/PE, 3001=Neutro, 3002=DC etc): a paleta
    # registra um único pino virtual na origem do símbolo. Sem isso o detector
    # nunca casa esses 'X' na linha do Neutro com nenhuma rede e a alimentação
    # vira uma rede solta de uma ponta só (descartada por len<2).
    "3001": {"N": (0, 0)},
}

# Override de terminais_padrao — quando a paleta não lista os terminais reais
# (entradas trifásicas têm L1/L2/L3 implícitos pelo símbolo, sem aparecer no
# bloco do .cad), forçamos a lista correta para o roteador.
TERMINAIS_OVERRIDE = {
    "3004": ["L1", "L2", "L3"],
    "3005": ["L1", "L2", "L3", "N"],
    "3001": ["N"],
}

# Códigos ausentes da paleta — declaração mínima de TIPOS_COMPONENTES.
TIPOS_EXTRAS = {
    "8023": ("botao", "Botao (variante)", None),
}


def gerar_arquivo():
    print(f"[gerar_base] lendo {ARQ_PALETA.name}...")
    componentes = parse_paleta(ARQ_PALETA)
    print(f"[gerar_base] {len(componentes)} códigos únicos extraídos")

    tipos = {}
    offsets = {}

    for codigo, info in sorted(componentes.items(), key=lambda kv: int(kv[0])):
        cat = categorizar(codigo)
        desc = DESCRICOES_CATEGORIA.get(cat, "Componente")
        if codigo in TERMINAIS_OVERRIDE:
            terminais_padrao = list(TERMINAIS_OVERRIDE[codigo])
            info["terminais"] = terminais_padrao
        else:
            terminais_padrao = info["terminais"] if info["terminais"] else None
        tipos[codigo] = (cat, desc, terminais_padrao)

        if codigo in OVERRIDES:
            offsets[codigo] = OVERRIDES[codigo]
        else:
            o = gerar_offsets(codigo, info)
            if o is not None:
                offsets[codigo] = o

    # Adiciona overrides para códigos não presentes na paleta (ex: TC variantes)
    for codigo, o in OVERRIDES.items():
        if codigo not in offsets:
            offsets[codigo] = o
    for codigo, info in TIPOS_EXTRAS.items():
        if codigo not in tipos:
            tipos[codigo] = info

    cabecalho = '''#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Base de componentes do CADe_SIMU — GERADO AUTOMATICAMENTE.
Não edite à mão; rode `python gerar_base_componentes.py` pra regenerar.

TIPOS_COMPONENTES: {codigo: (categoria, descricao, terminais_padrao_ou_None)}
TERMINAL_OFFSETS:  {codigo: dict de offsets relativos à origem do componente}
"""

TIPOS_WIRES = {"4000", "4001", "4002", "4003", "4004", "4009", "4010",
               "4011", "4012", "4013", "4014", "4015", "4016", "4017",
               "4018", "4019"}

'''

    out = [cabecalho]
    out.append("TIPOS_COMPONENTES = {\n")
    for codigo in sorted(tipos.keys(), key=int):
        cat, desc, terms = tipos[codigo]
        out.append(f"    {codigo!r}: ({cat!r}, {desc!r}, {terms!r}),\n")
    out.append("}\n\n")

    out.append("TERMINAL_OFFSETS = {\n")
    for codigo in sorted(offsets.keys(), key=int):
        o = offsets[codigo]
        out.append(f"    {codigo!r}: {pformat(o, width=160, sort_dicts=False)},\n")
    out.append("}\n")

    ARQ_SAIDA.write_text("".join(out), encoding="utf-8")
    print(f"[gerar_base] escrito {ARQ_SAIDA.name}: "
          f"{len(tipos)} TIPOS_COMPONENTES, {len(offsets)} TERMINAL_OFFSETS")


if __name__ == "__main__":
    gerar_arquivo()
