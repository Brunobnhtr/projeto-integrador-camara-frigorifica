# -*- coding: utf-8 -*-
"""Gera o desenho 1:1 do SUPORTE DAS PLACAS DE LED (2x tiras de aluminio), em SVG e DXF.

    ========================================================================
    ESTAS 2 TIRAS SUBSTITUEM O ANTIGO CONCEITO DA CHAPA MACIÇA DOBRADA CAM-26
    ========================================================================

Duas tiras de aluminio (barra chata comercial 210 x 20 mm, 1,0 a 2,0 mm).
Cada tira parafusa nas cantoneiras CAM-24 das paredes laterais de acrilico
(distancia de 190 mm entre centros M4).

As duas placas de ensaio (PL-1 e PL-2, 95 x 75 mm) sao parafusadas nas duas
tiras atraves de 8 espacadores M3 (8 a 10 mm) de nylon ou latao.

VANTAGENS SOBRE A CHAPA MACICA DOBRADA:
1. Passagem de ar 100% livre: nao ha anteparo/vela bloqueando o fluxo descendente
   para as bocas dos dutos laterais.
2. Menor inercia termica: resfria e aquece mais rapido no ciclo do PID.
3. Seguranca eletrica: os espacadores impedem qualquer contato das soldas e
   trilhas do verso da placa com o metal.
4. Conveccao no verso: o ar circula tambem por baixo das placas, resfriando os resistores.
5. Fabricacao simples: corta-se de barra chata comercial na oficina do SENAI, sem laser/dobra.

Roda:  python placa_leds/gera_berco.py
"""
import os
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parent
RAIZ = BASE.parent
sys.path.insert(0, str(RAIZ / 'painel_interativo' / 'cad_corte' / 'V12_SUPORTES_PTC_LAMPADAS_FANS_INTERNAS'))

W = 210.0                    # comprimento das tiras (X) — bate nas cantoneiras CAM-24
TIRA_H = 20.0                # largura da barra chata (Y de cada tira)
GAP_TIRAS = 15.0             # separacao entre as 2 tiras no arquivo de corte
H = 2 * TIRA_H + GAP_TIRAS   # altura total do retalho: 55 mm

F_M4 = 4.5                   # furos para parafusar nas cantoneiras CAM-24
F_M3 = 3.2                   # furos para os espacadores das placas de LED

# furos M4 nas extremidades de cada tira (X = 10 e X = 200 mm)
FUROS_CANTONEIRAS_X = [10.0, 200.0]

# coordenadas X dos furos M3 para fixar as placas PL-1 e PL-2
# PL-1 de X=10 a X=100 (furos a 4 mm da borda -> X=14 e X=96)
# PL-2 de X=110 a X=200 (furos a 4 mm da borda -> X=114 e X=196)
FUROS_PLACAS_X = [14.0, 96.0, 114.0, 196.0]

# Y relativo ao centro de cada tira
TIRAS_Y0 = [0.0, TIRA_H + GAP_TIRAS]


def elementos():
    e = []
    for idx, y0 in enumerate(TIRAS_Y0):
        # contorno da tira
        e.append(("rect", 0.0, y0, W, y0 + TIRA_H, "CONTORNO"))
        y_centro = y0 + (TIRA_H / 2.0)
        # furos M4 nas pontas
        for x in FUROS_CANTONEIRAS_X:
            e.append(("circle", x, y_centro, F_M4 / 2.0, "FUROS"))
        # furos M3 para espacadores das placas
        for x in FUROS_PLACAS_X:
            e.append(("circle", x, y_centro, F_M3 / 2.0, "FUROS"))
    return e


TEXTOS = [
    ("TIRA 1 (SUPERIOR) · Barra Chata Al 210x20 mm · M4 nas pontas · M3 para espacadores",
     10.0, TIRAS_Y0[0] + 5.0, 2.5, "GRAVACAO"),
    ("TIRA 2 (INFERIOR) · Barra Chata Al 210x20 mm · M4 nas pontas · M3 para espacadores",
     10.0, TIRAS_Y0[1] + 5.0, 2.5, "GRAVACAO"),
    ("PL-1 (M3)", 50.0, TIRAS_Y0[0] + 13.0, 2.2, "GRAVACAO"),
    ("PL-2 (M3)", 150.0, TIRAS_Y0[0] + 13.0, 2.2, "GRAVACAO"),
]


def svg() -> str:
    def Y(y):
        return H - y

    out = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W+16}mm" height="{H+25}mm" '
           f'viewBox="-8 -10 {W+16} {H+25}" font-family="ui-monospace,monospace">',
           '<rect width="100%" height="100%" fill="#f4f6f8"/>',
           f'<rect x="0" y="0" width="{W}" height="{H}" fill="#eef2f6"/>']

    for el in elementos():
        c = el[-1]
        if el[0] == "rect":
            _, x1, y1, x2, y2, _c = el
            out.append(f'<rect x="{x1}" y="{Y(y2)}" width="{x2-x1}" height="{y2-y1}" '
                       'fill="#dfe6ec" stroke="#1a1d21" stroke-width="0.7"/>')
        elif el[0] == "circle":
            _, x, y, r, _c = el
            out.append(f'<circle cx="{x}" cy="{Y(y)}" r="{r}" fill="#ffffff" '
                       'stroke="#1a1d21" stroke-width="0.35"/>')

    for txt, x, y, size, _c in TEXTOS:
        out.append(f'<text x="{x}" y="{Y(y)}" fill="#212529" font-size="{size}">{txt}</text>')

    # cotas
    out.append(f'<line x1="0" y1="{Y(H+5)}" x2="{W}" y2="{Y(H+5)}" stroke="#495057" stroke-width="0.3"/>')
    out.append(f'<text x="{W/2}" y="{Y(H+7)}" text-anchor="middle" font-size="3" fill="#495057">{W:.0f} mm</text>')
    out.append("</svg>")
    return "\n".join(out)


def dxf() -> str:
    o = ["0", "SECTION", "2", "HEADER", "9", "$INSUNITS", "70", "4", "0", "ENDSEC",
         "0", "SECTION", "2", "ENTITIES"]

    def line(x1, y1, x2, y2, camada):
        o.extend(["0", "LINE", "8", camada,
                  "10", f"{x1:.3f}", "20", f"{y1:.3f}", "30", "0",
                  "11", f"{x2:.3f}", "21", f"{y2:.3f}", "31", "0"])

    def circle(x, y, r, camada):
        o.extend(["0", "CIRCLE", "8", camada,
                  "10", f"{x:.3f}", "20", f"{y:.3f}", "30", "0", "40", f"{r:.3f}"])

    def text(t, x, y, h, camada):
        o.extend(["0", "TEXT", "8", camada,
                  "10", f"{x:.3f}", "20", f"{y:.3f}", "30", "0", "40", f"{h:.2f}", "1", t])

    for el in elementos():
        if el[0] == "rect":
            _, x1, y1, x2, y2, c = el
            for a, b, cc, d in ((x1, y1, x2, y1), (x2, y1, x2, y2),
                                (x2, y2, x1, y2), (x1, y2, x1, y1)):
                line(a, b, cc, d, c)
        elif el[0] == "circle":
            circle(*el[1:5])

    for t, x, y, h, c in TEXTOS:
        text(t, x, y, h, c)

    o.extend(["0", "ENDSEC", "0", "EOF"])
    return "\n".join(o)


def conferencia(sobe=None, z_fold=None):
    """Confere a instalacao das tiras contra a camara."""
    try:
        import parametros_v12 as P
    except Exception as e:
        return ['FALHA: nao consegui importar parametros_v12 (%s)' % e]

    Z_BANDEJA = P.LAMP_BANDEJA_Z0 if z_fold is None else z_fold

    # As tiras ficam no plano horizontal das cantoneiras CAM-24 (Z ~ 110 mm)
    # com as placas elevadas 10 mm por espacadores
    z_tiras = Z_BANDEJA
    z_placas = z_tiras + 10.0  # com espacadores

    # Verifica folga com o escudo do PTC (Z ~ 185 mm)
    if hasattr(P, 'ESC_Z0') and z_placas + 20.0 > P.ESC_Z0:
        return ['COLISAO: placas encostam no escudo do PTC']

    if z_tiras < 0:
        return ['ABAIXO DO PISO: z=%.1f' % z_tiras]

    return [
        'OK — 2x tiras de aluminio 210x20 mm instaladas em Z=%.1f mm nas cantoneiras CAM-24; '
        'placas elevadas com espacadores M3 (Z=%.1f mm), fluxo de ar 100%% livre.'
        % (z_tiras, z_placas)
    ]


BLOQUEIA = ('COLISAO', 'ABAIXO', 'FALHA')


def gravar(dir_svg=None, dir_dxf=None, sobe=None, z_fold=None):
    linhas = conferencia(sobe=sobe, z_fold=z_fold)
    bloqueios = [l for l in linhas if l.startswith(BLOQUEIA)]
    if bloqueios:
        for l in linhas:
            print(l)
        raise SystemExit('desenho NAO liberado: %s' % bloqueios[0])

    svg_p = Path(dir_svg) if dir_svg else BASE / "berco_placas.svg"
    dxf_p = Path(dir_dxf) if dir_dxf else BASE / "berco_placas.dxf"

    for alvo, conteudo in ((svg_p, svg()), (dxf_p, dxf())):
        tmp = alvo.with_suffix(alvo.suffix + '.tmp')
        tmp.write_text(conteudo, encoding="utf8")
        os.replace(tmp, alvo)

    print("gerado: %s e %s" % (svg_p.name, dxf_p.name))
    print("2x tiras de aluminio 210 x 20 mm · 4 furos M4 nas pontas · 8 furos M3 para espacadores")
    for linha in linhas:
        print(linha)


if __name__ == "__main__":
    gravar()
