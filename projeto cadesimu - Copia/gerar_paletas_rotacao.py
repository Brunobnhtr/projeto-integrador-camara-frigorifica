#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gera variantes da paleta "somente componentes" com cada componente
rotacionado/espelhado, em layout de grade pra não sobrepor.

Saída: 7 arquivos em "projetos para testar/" com cada combinação de orient
do CADe_SIMU (1=90° CW, 2=180°, 3=270° CW, 4=mirror, 5/6/7=mirror combinado).
Abre no CADe_SIMU, confere se o desenho bate, salva — o save reescreve o
bbox correto pós-rotação e a gente compara com nossos cálculos pra detectar
divergências em TERMINAL_OFFSETS.

Rodar:  python gerar_paletas_rotacao.py
"""

import re
from pathlib import Path

BASE_DIR = Path(__file__).parent
PALETA = BASE_DIR / "somente componentes"
OUT_DIR = BASE_DIR / "projetos para testar"

# Layout em grade — cada célula precisa caber a maior dimensão pós-rotação.
# Maior bbox da paleta é ~54×33 (módulo IO 1056), então célula 60×60 dá
# folga pros casos de 90° onde w e h trocam.
CELL_W = 60
CELL_H = 60
COLS = 12
START_X = 30
START_Y = 30

# Códigos que NÃO são componentes elétricos com terminais — pulamos.
WIRES = {"4000", "4001", "4002", "4003", "4004", "4009", "4010",
         "4011", "4012", "4013", "4014", "4015", "4016", "4017",
         "4018", "4019"}
LABELS = {"20000"}  # XXX label / frame da página


def parse_paleta():
    """Devolve (header, [{'id', 'code', 'block'}], trailer).

    header é o "CADe_SIMU" inicial; trailer é tudo a partir do primeiro $$$.
    Cada bloco contém o componente inteiro do `*ID*` até logo antes do próximo.
    """
    with open(PALETA, "r", encoding="latin-1", errors="ignore") as f:
        content = f.read()

    # Aceita também códigos negativos (-1 é submódulo do IO 1056 com pinos
    # analógicos R+/R-/AI etc, sem nome). E o lookahead `(?=[^*])` rejeita
    # falsos positivos do trailing pair `*<net0>*<net1>#` que casa com o
    # mesmo padrão e quebraria blocos em dois.
    matches = list(re.finditer(r'\*(\d+)\*(-?[1-9]\d{0,4})#(?=[^*])', content))
    if not matches:
        return None, None, None

    header = content[:matches[0].start()]
    trailer_start = content.find('$$$', matches[-1].end())
    if trailer_start == -1:
        trailer_start = content.find('$$$')
    trailer = content[trailer_start:]

    componentes = []
    for i, m in enumerate(matches):
        start = m.start()
        end = matches[i + 1].start() if i + 1 < len(matches) else trailer_start
        block = content[start:end]
        codigo = m.group(2)
        # lstrip('0') só pra positivos — em '-1' o '-' não conta como zero.
        codigo_norm = codigo if codigo.startswith('-') else (codigo.lstrip('0') or '0')
        componentes.append({
            "id": int(m.group(1)),
            "code": codigo_norm,
            "block": block,
        })
    return header, componentes, trailer


def modificar_bloco(block, new_id, new_x, new_y, new_orient):
    """Reescreve apenas id, x (partes[9]), y (partes[10]) e orient (partes[18]).
    Bbox e demais campos ficam intactos — o CADe_SIMU corrige no primeiro save.
    """
    m = re.match(r'^\*\d+\*(-?\d+)#(.*)$', block, re.DOTALL)
    if not m:
        return block
    code = m.group(1)
    resto = m.group(2)

    idx = resto.find('*')
    if idx == -1:
        return block
    cabecalho = resto[:idx]
    partes_str = resto[idx:]
    partes = partes_str.split('*')

    if len(partes) > 18:
        partes[9] = str(new_x)
        partes[10] = str(new_y)
        partes[18] = str(new_orient)

    return f'*{new_id}*{code}#{cabecalho}{"*".join(partes)}'


def gerar(orient, suffix):
    header, componentes, trailer = parse_paleta()
    if not componentes:
        print(f"[ERRO] Não conseguiu ler {PALETA}")
        return

    reais = [c for c in componentes if c["code"] not in WIRES and c["code"] not in LABELS]

    novos = []
    for idx, comp in enumerate(reais):
        col = idx % COLS
        row = idx // COLS
        x = START_X + col * CELL_W
        y = START_Y + row * CELL_H
        novos.append(modificar_bloco(comp["block"], idx, x, y, orient))

    out_path = OUT_DIR / f"paleta_orient{orient}_{suffix}.cad"
    out_path.write_text(header + "".join(novos) + trailer, encoding="latin-1")
    print(f"[OK] {out_path.name}: {len(reais)} componentes em orient={orient}")


VARIANTES = [
    (1, "90cw"),
    (2, "180"),
    (3, "270cw"),
    (4, "mirror_h"),         # flip esquerda/direita
    (5, "diagonal_anti"),    # mirror H + 90° = espelho diagonal anti
    (6, "mirror_v"),         # mirror H + 180° = flip cima/baixo
    (7, "diagonal"),         # mirror H + 270° = espelho diagonal
]


if __name__ == "__main__":
    OUT_DIR.mkdir(exist_ok=True)
    for orient, suffix in VARIANTES:
        gerar(orient, suffix)
