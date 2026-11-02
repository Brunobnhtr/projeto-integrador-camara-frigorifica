# -*- coding: utf-8 -*-
"""Gera o desenho 1:1 da placa PL-1 (4 cargas de LED) em SVG e DXF.

Placa de face simples, 95 x 75 mm. Cada canal e uma coluna vertical:
+12 V (pad de baixo) -> LED -> resistor de 1k -> retorno (pad de cima).
Sem cruzamento de trilha, sem ilha, sem jumper, sem barramento comum.
Duas placas iguais dao as 8 posicoes de ensaio.

POR QUE 95 x 75 E NAO 150 x 50
-----------------------------
A cavidade util da camara e 300 x 200 x 250. Duas placas de 150 lado a
lado dariam 300 mm exatos: nao entram, nem sobra folga para instalar.
Deitadas na bandeja (210 x 90) tambem nao: 300 > 210. Em pe, empilhadas,
110 mm de altura nao cabem entre a bandeja (Z110) e a base do PTC (Z225)
porque o PTC desce 20 mm abaixo dela.
Sobrou a unica combinacao que fecha: duas placas de 95 de largura, lado a
lado, em pe na bandeja -> 95 + 10 + 95 = 200 mm dentro dos 210 da bandeja,
e 75 mm de altura entre Z112 e Z187, com 38 mm livres ate o PTC.

⭐ O CORTE SAI DE UMA PLACA ILHADA 10 x 15 cm SEM SOBRA:
   150 / 75 = 2 placas  ·  100 - 95 = 5 mm de refilo

Roda:  python placa_leds/gera_placa.py
"""
from pathlib import Path

BASE = Path(__file__).resolve().parent
W, H = 90.0, 70.0
N = 4
X0, DX = 18.0, 18.0

Y_P12 = 7.0                  # pad do +12 V, na borda de baixo
Y_RET = 63.0                 # pad do retorno, na borda de cima
# ⚠️ A ORDEM DOS POLOS IMPORTA: o +12 V entra por baixo, então o ANODO fica
# embaixo e o CATODO em cima. Na versão anterior a corrente vinha do
# barramento de cima e era o contrário — inverter aqui deixa o LED
# polarizado ao contrário e ele simplesmente não acende.
Y_LED = (19.0, 21.54)        # anodo (embaixo, +12 V), catodo (em cima)
Y_RES = (31.0, 41.0)         # 10 mm entre os furos do resistor 1/4 W

PAD_TERM, PAD_LED, PAD_RES = 1.8, 1.0, 1.2
CX_TXT = W / 2

# ⚠️ O LED de 5 mm tem passo de 2,54 mm entre pernas. Com pad de 1,0 mm de
# raio, o desenho NÃO pode inflar o cobre (era +0,4 e as duas ilhas do LED
# se encostavam: curto no desenho e trilha de 0 mm na placa real).
INFLADO = 0.15


def xs():
    return [X0 + k * DX for k in range(N)]


def elementos():
    e = [("rect", 0, 0, W, H, "CONTORNO")]
    for hx, hy in ((4, 4), (W - 4, 4), (4, H - 4), (W - 4, H - 4)):
        e.append(("circle", hx, hy, 1.6, "FUROS"))
    for x in xs():
        # a trilha e uma reta so: pad de baixo, LED, resistor, pad de cima
        e.append(("line", x, Y_P12, x, Y_LED[0], "COBRE"))
        e.append(("line", x, Y_LED[1], x, Y_RES[0], "COBRE"))
        e.append(("line", x, Y_RES[1], x, Y_RET, "COBRE"))
        for yy, r in ((Y_P12, PAD_TERM), (Y_RET, PAD_TERM),
                      (Y_LED[0], PAD_LED), (Y_LED[1], PAD_LED),
                      (Y_RES[0], PAD_RES), (Y_RES[1], PAD_RES)):
            e.append(("circle", x, yy, r, "COBRE"))
        # serigrafia: corpo do LED, corpo do resistor e os dois terminais
        e.append(("silk_circle", x, sum(Y_LED) / 2, 2.75, "GRAVACAO"))
        # o traço chanfrado marca o CATODO — que agora é o pino de cima
        e.append(("silk_line", x - 1.5, Y_LED[1] + 0.6, x + 1.5, Y_LED[1] + 0.6, "GRAVACAO"))
        e.append(("silk_rect", x - 1.6, Y_RES[0] + 1.0, x + 1.6, Y_RES[1] - 1.0, "GRAVACAO"))
        e.append(("silk_rect", x - 2.7, Y_P12 - 2.7, x + 2.7, Y_P12 + 2.7, "GRAVACAO"))
        e.append(("silk_rect", x - 2.7, Y_RET - 2.7, x + 2.7, Y_RET + 2.7, "GRAVACAO"))
    return e


TEXTOS = ([("PL-1 · 4 CARGAS LED 12 V", 8.0, 71.5, 2.6, "GRAVACAO"),
           ("+12V", 2.5, 9.6, 1.9, "GRAVACAO"),
           ("RET", 2.5, 66.5, 1.9, "GRAVACAO")]
          + [(f"{k+1}", x - 5.4, 9.2, 2.2, "GRAVACAO") for k, x in enumerate(xs())]
          + [("1k", x + 3.2, 35.0, 1.8, "GRAVACAO") for x in xs()])


def svg() -> str:
    def Y(y):
        return H - y

    out = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W+16}mm" height="{H+16}mm" '
           f'viewBox="-8 -8 {W+16} {H+16}" font-family="ui-monospace,monospace">',
           '<rect width="100%" height="100%" fill="#f2f5f3"/>',
           f'<rect x="0" y="0" width="{W}" height="{H}" fill="#0f4c2a"/>',
           f'<rect x="0.6" y="0.6" width="{W-1.2}" height="{H-1.2}" fill="none" '
           'stroke="#ffffff" stroke-width="1.0"/>']
    for el in elementos():
        if el[-1] != "COBRE":
            continue
        if el[0] == "line":
            _, x1, y1, x2, y2, _c = el
            out.append(f'<line x1="{x1}" y1="{Y(y1)}" x2="{x2}" y2="{Y(y2)}" '
                       f'stroke="#d4a017" stroke-width="1.2" stroke-linecap="round"/>')
        elif el[0] == "circle":
            _, x, y, r, _c = el
            out.append(f'<circle cx="{x}" cy="{Y(y)}" r="{r+INFLADO:.2f}" fill="#d4a017"/>')
    for el in elementos():
        if el[-1] != "FUROS":
            continue
        _, x, y, r, _c = el
        out.append(f'<circle cx="{x}" cy="{Y(y)}" r="{r}" fill="#ffffff"/>')
    for el in elementos():
        if el[-1] != "GRAVACAO":
            continue
        if el[0] == "silk_rect":
            _, x1, y1, x2, y2, _c = el
            out.append(f'<rect x="{x1}" y="{Y(y2)}" width="{x2-x1}" height="{y2-y1}" '
                       f'fill="none" stroke="#ffffff" stroke-width="0.25"/>')
        elif el[0] == "silk_circle":
            _, x, y, r, _c = el
            out.append(f'<circle cx="{x}" cy="{Y(y)}" r="{r}" fill="none" stroke="#ffffff" '
                       f'stroke-width="0.25"/>')
        elif el[0] == "silk_line":
            _, x1, y1, x2, y2, _c = el
            out.append(f'<line x1="{x1}" y1="{Y(y1)}" x2="{x2}" y2="{Y(y2)}" '
                       f'stroke="#ffffff" stroke-width="0.3"/>')
    for txt, x, y, size, _c in TEXTOS:
        out.append(f'<text x="{x}" y="{Y(y)}" fill="#ffffff" font-size="{size}">{txt}</text>')
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
                  "10", f"{x:.3f}", "20", f"{y:.3f}", "30", "0", "40", f"{h:.2f}",
                  "1", t])

    for el in elementos():
        if el[0] == "rect":
            _, x1, y1, x2, y2, c = el
            for a, b, cc, d in ((x1, y1, x2, y1), (x2, y1, x2, y2),
                                (x2, y2, x1, y2), (x1, y2, x1, y1)):
                line(a, b, cc, d, c)
        elif el[0] == "line":
            line(*el[1:6])
        elif el[0] == "circle":
            circle(*el[1:5])
        elif el[0] == "silk_rect":
            _, x1, y1, x2, y2, c = el
            for a, b, cc, d in ((x1, y1, x2, y1), (x2, y1, x2, y2),
                                (x2, y2, x1, y2), (x1, y2, x1, y1)):
                line(a, b, cc, d, c)
        elif el[0] in ("silk_circle",):
            circle(*el[1:5])
        elif el[0] == "silk_line":
            line(*el[1:6])
    for t, x, y, h, c in TEXTOS:
        text(t, x, y, h, c)
    o.extend(["0", "ENDSEC", "0", "EOF"])
    return "\n".join(o)


if __name__ == "__main__":
    (BASE / "placa_leds.svg").write_text(svg(), encoding="utf8")
    (BASE / "placa_leds.dxf").write_text(dxf(), encoding="utf8")
    print("gerado: placa_leds.svg e placa_leds.dxf")
    print("placa %.0f x %.0f mm · %d canais em %.0f mm de passo · corte de 1 ilhada "
          "10x15 cm da 2 placas (refilo de %.0f mm)" % (W, H, N, DX, 100 - W))
