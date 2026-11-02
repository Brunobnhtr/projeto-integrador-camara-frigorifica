# -*- coding: utf-8 -*-
"""
cad_lib.py — utilidades de desenho DXF para o pacote de corte.

Convenção de camadas (o NOME da camada manda, não a cor):

    CORTE      contorno da peça e furos   -> é o que a máquina corta
    GRAVACAO   marcas, códigos, setas     -> gravar / riscar (opcional)
    COTA       cotas                      -> só desenho técnico, não cortar
    TEXTO      textos e tabelas           -> não cortar
    MOLDURA    borda da chapa e título    -> não cortar
    REF        eixos e linhas de referência -> não cortar

Unidade do arquivo: milímetro (INSUNITS = 4). Origem de cada peça no canto
inferior esquerdo, eixo X para a direita, eixo Y para cima. Escala 1:1.
"""

from __future__ import annotations

import math
import os

import ezdxf
from ezdxf.enums import TextEntityAlignment

# ---------------------------------------------------------------- camadas ---
CAMADAS = {
    "CORTE":    (1, "CONTORNO E FUROS - CORTAR"),
    "GRAVACAO": (3, "MARCAS E IDENTIFICACAO - GRAVAR"),
    "COTA":     (4, "COTAS - NAO CORTAR"),
    "TEXTO":    (7, "TEXTOS E TABELAS - NAO CORTAR"),
    "MOLDURA":  (8, "BORDA DA CHAPA E TITULO - NAO CORTAR"),
    "REF":      (9, "EIXOS E REFERENCIA - NAO CORTAR"),
}

ALINHA = {
    "left": TextEntityAlignment.LEFT,
    "right": TextEntityAlignment.RIGHT,
    "center": TextEntityAlignment.MIDDLE_CENTER,
    "midleft": TextEntityAlignment.MIDDLE_LEFT,
    "midright": TextEntityAlignment.MIDDLE_RIGHT,
    "top": TextEntityAlignment.TOP_CENTER,
}


def novo_doc():
    """Documento DXF métrico, com camadas e estilo de cota prontos."""
    doc = ezdxf.new("R2010", setup=True)
    doc.header["$INSUNITS"] = 4        # milímetro
    doc.header["$MEASUREMENT"] = 1     # métrico
    doc.header["$LUNITS"] = 2
    doc.header["$LUPREC"] = 2

    for nome, (cor, desc) in CAMADAS.items():
        if nome not in doc.layers:
            doc.layers.add(nome, color=cor)

    if "ARIAL" not in doc.styles:
        try:
            doc.styles.add("ARIAL", font="arial.ttf")
        except Exception:
            pass

    ds = doc.dimstyles.get("EZDXF")
    for chave, valor in dict(dimtxt=8, dimasz=4, dimexo=4, dimexe=4, dimgap=2,
                             dimdec=0, dimzin=8, dimtad=1, dimtih=0,
                             dimtoh=0, dimscale=1.0, dimlfac=1.0, dimclrd=4,
                             dimclre=4, dimclrt=4).items():
        try:
            setattr(ds.dxf, chave, valor)
        except Exception:
            pass
    return doc


# ------------------------------------------------------------- primitivas ---
def poly(msp, pts, layer="CORTE", close=True):
    msp.add_lwpolyline([(float(x), float(y)) for x, y in pts], close=close,
                       dxfattribs={"layer": layer})


def rect(msp, x, y, w, h, layer="CORTE", lt=None):
    pts = [(x, y), (x + w, y), (x + w, y + h), (x, y + h)]
    if lt:
        msp.add_lwpolyline(pts, close=True, dxfattribs={"layer": layer,
                                                        "linetype": lt})
    else:
        poly(msp, pts, layer)


def circ(msp, x, y, d, layer="CORTE"):
    msp.add_circle((float(x), float(y)), d / 2.0, dxfattribs={"layer": layer})


def linha(msp, x1, y1, x2, y2, layer="REF"):
    msp.add_line((float(x1), float(y1)), (float(x2), float(y2)),
                 dxfattribs={"layer": layer})


def txt(msp, x, y, s, h=6, layer="TEXTO", align="left", rot=0):
    t = msp.add_text(str(s), height=h, rotation=rot,
                     dxfattribs={"layer": layer, "style": "ARIAL"})
    t.set_placement((float(x), float(y)), align=ALINHA.get(align, ALINHA["left"]))
    return t


def cota_h(msp, x1, x2, y, base, layer="COTA"):
    d = msp.add_linear_dim(base=(0, base), p1=(x1, y), p2=(x2, y), angle=0,
                           dimstyle="EZDXF", dxfattribs={"layer": layer})
    d.render()


def cota_v(msp, y1, y2, x, base, layer="COTA"):
    d = msp.add_linear_dim(base=(base, 0), p1=(x, y1), p2=(x, y2), angle=90,
                           dimstyle="EZDXF", dxfattribs={"layer": layer})
    d.render()


def seta(msp, x, y, comp=18, layer="GRAVACAO"):
    """Seta apontando para cima — marca o TOPO da peça na montagem."""
    msp.add_line((x, y - comp / 2), (x, y + comp / 2), dxfattribs={"layer": layer})
    msp.add_line((x, y + comp / 2), (x - comp * 0.28, y + comp * 0.1),
                 dxfattribs={"layer": layer})
    msp.add_line((x, y + comp / 2), (x + comp * 0.28, y + comp * 0.1),
                 dxfattribs={"layer": layer})


def cantos(msp, x, y, w, h, t=12, layer="GRAVACAO"):
    """Marca de dobra/chanfro 45° nos cantos (L invertido)."""
    for (cx, cy, dx, dy) in ((x, y, 1, 1), (x + w, y, -1, 1),
                             (x, y + h, 1, -1), (x + w, y + h, -1, -1)):
        msp.add_line((cx + dx * 1, cy + dy * 1), (cx + dx * (1 + t), cy + dy * 1),
                     dxfattribs={"layer": layer})
        msp.add_line((cx + dx * 1, cy + dy * 1), (cx + dx * 1, cy + dy * (1 + t)),
                     dxfattribs={"layer": layer})


# ------------------------------------------------------------------ peça ---
class Peca:
    """Uma peça plana de uma chapa. Tudo em mm, origem no canto inferior esq."""

    def __init__(self, cod, nome, material, esp, w, h, qtd=1, bordas="",
                 obs="", furos=None, recortes=None, grav=None, contorno=None):
        self.cod = cod
        self.nome = nome
        self.material = material
        self.esp = esp
        self.w = w
        self.h = h
        self.qtd = qtd
        self.bordas = bordas
        self.obs = obs
        self.furos = furos or []        # [(x, y, d, nota)]
        self.recortes = recortes or []  # [(x, y, w, h, nota)]
        self.grav = grav or []          # [("txt"|"lin"|"rect"|"seta", ...)]
        self.contorno = contorno        # polilinha fechada alternativa

    @property
    def area_m2(self):
        return self.w * self.h / 1e6

    # -- desenho --------------------------------------------------------
    def desenha(self, msp, ox=0.0, oy=0.0, cotas=False, rotulo=True,
                contorno=True, cod_na_peca=True):
        w, h = self.w, self.h
        if contorno:
            if self.contorno:
                poly(msp, [(x + ox, y + oy) for x, y in self.contorno], "CORTE")
            else:
                rect(msp, ox, oy, w, h, "CORTE")

        for (x, y, d, *_n) in self.furos:
            circ(msp, ox + x, oy + y, d, "CORTE")
        for (x, y, rw, rh, *_n) in self.recortes:
            rect(msp, ox + x, oy + y, rw, rh, "CORTE")

        for g in self.grav:
            tipo = g[0]
            if tipo == "txt":
                _, x, y, s, hh = g[:5]
                al = g[5] if len(g) > 5 else "left"
                txt(msp, ox + x, oy + y, s, hh, "GRAVACAO", al)
            elif tipo == "lin":
                _, x1, y1, x2, y2 = g[:5]
                linha(msp, ox + x1, oy + y1, ox + x2, oy + y2, "GRAVACAO")
            elif tipo == "rect":
                _, x, y, rw, rh = g[:5]
                rect(msp, ox + x, oy + y, rw, rh, "GRAVACAO")
            elif tipo == "seta":
                _, x, y, comp = g[:4]
                seta(msp, ox + x, oy + y, comp, "GRAVACAO")
            elif tipo == "cantos":
                cantos(msp, ox, oy, w, h, g[1] if len(g) > 1 else 12)

        if cod_na_peca:
            hh = min(10.0, max(4.0, min(h / 8, w / 6.5)))
            txt(msp, ox + 5, oy + 6, self.cod, hh, "GRAVACAO", "left")

        if cotas:
            cota_h(msp, ox, ox + w, oy, oy - 14)
            cota_v(msp, oy, oy + h, ox, ox - 14)

        if rotulo:
            txt(msp, ox + w / 2, oy + h / 2, self.cod, min(14, h / 3.2),
                "REF", "center")

    # -- ficha técnica --------------------------------------------------
    def linhas_ficha(self):
        out = [f"{self.cod}  —  {self.nome}",
               f"MATERIAL: {self.material} {self.esp:g} mm",
               f"DIMENSOES: {self.w:g} x {self.h:g} mm   (qtd {self.qtd})"]
        if self.bordas:
            out.append(f"BORDAS: {self.bordas}")

        grupos = {}
        for f in self.furos:
            nota = f[3] if len(f) > 3 else ""
            grupos.setdefault((f[2], nota), []).append((f[0], f[1]))
        if grupos:
            out.append("FUROS (diâmetro x quantidade — posições):")
            for (d, nota), pts in grupos.items():
                if len(pts) <= 4:
                    pos = "  ".join(f"({x:g}, {y:g})" for x, y in pts)
                else:
                    xs = sorted({x for x, _ in pts})
                    ys = sorted({y for _, y in pts})
                    pos = (f"X {'/'.join(f'{v:g}' for v in xs)}   "
                           f"Y {'/'.join(f'{v:g}' for v in ys)}")
                out.append(f"   {len(pts):2d} x D{d:g}  {nota}")
                out.append(f"           {pos}")

        if self.recortes:
            out.append("RECORTES (x, y, larg x alt):")
            for (x, y, rw, rh, *rest) in self.recortes:
                nota = f"  {rest[0]}" if rest and rest[0] else ""
                out.append(f"   ({x:g}, {y:g})  {rw:g} x {rh:g}{nota}")
        if self.obs:
            out.append("OBS: " + self.obs)
        return out

    def ficha(self, msp, x, y, h=5.0, passo=7.0):
        import textwrap
        linhas = []
        for s in self.linhas_ficha():
            linhas += textwrap.wrap(s, 96) or [""]
        for i, s in enumerate(linhas):
            txt(msp, x, y - i * passo, s, h if i else h * 1.3, "TEXTO", "left")


# -------------------------------------------------------------- chapas -----
def empacota(pecas, sw, sh, gap=12, margem=18):
    """Empacotamento por prateleiras. Devolve [(peca, x, y)] dentro da chapa."""
    itens = []
    for p in pecas:
        for _ in range(p.qtd):
            itens.append(p)
    itens.sort(key=lambda p: (-p.h, -p.w))

    pos, x, y, altura_faixa = [], margem, margem, 0.0
    for p in itens:
        if x + p.w > sw - margem:
            x, y = margem, y + altura_faixa + gap
            altura_faixa = 0.0
        if y + p.h > sh - margem:
            raise RuntimeError(f"peça {p.cod} não coube na chapa {sw}x{sh}")
        pos.append((p, x, y))
        x += p.w + gap
        altura_faixa = max(altura_faixa, p.h)
    return pos


def chapa(pecas, titulo, sub, path, chapa_padrao=None, gap=12, margem=18):
    """DXF de uma chapa: peças encaixadas por heurística de prateleiras.

    Não garante o encaixe global ótimo ou menor custo de material.
    A chapa é dimensionada pelo conteúdo (estimativa, arredondada a 50 mm),
    não pelo tamanho comercial — assim o desenho fica denso e legível. O tamanho
    da chapa padrão em que ela cabe vai escrito no rodapé.
    """
    import math

    itens = []
    for p in pecas:
        itens += [p] * p.qtd
    itens.sort(key=lambda p: (-p.h, -p.w))

    area = sum(p.w * p.h for p in itens)
    max_w = max(p.w for p in itens)
    alvo = max(2 * max_w + 3 * gap,
               min(2400, math.ceil(math.sqrt(area * 3) / 50) * 50))

    pos, x, y, faixa_h = [], 0.0, 0.0, 0.0
    for p in itens:
        if x + p.w > alvo and x > 0:
            x, y = 0.0, y + faixa_h + gap
            faixa_h = 0.0
        pos.append((p, x, y))
        x += p.w + gap
        faixa_h = max(faixa_h, p.h)

    x0 = min(x for _, x, _ in pos)
    y0 = min(y for _, _, y in pos)
    x1 = max(x + p.w for p, x, _ in pos)
    y1 = max(y + p.h for p, _, y in pos)
    sw = math.ceil((x1 - x0 + 2 * margem) / 50) * 50
    sh = math.ceil((y1 - y0 + 2 * margem + 42 + 6) / 50) * 50
    dx, dy = margem - x0, margem + 6 - y0

    doc = novo_doc()
    msp = doc.modelspace()
    faixa = 42
    rect(msp, 0, 0, sw, sh, "MOLDURA")
    linha(msp, 0, sh - faixa, sw, sh - faixa, "MOLDURA")
    txt(msp, margem, sh - 17, titulo, 11, "TEXTO", "left")
    txt(msp, margem, sh - 33, sub, 6.5, "TEXTO", "left")
    txt(msp, sw - margem, sh - 17, f"RECORTE {sw:g} x {sh:g} mm", 8,
        "TEXTO", "right")
    txt(msp, sw - margem, sh - 33, "escala 1:1 · mm · CORTE corta, "
                                   "GRAVACAO grava", 6, "TEXTO", "right")

    for (p, px, py) in pos:
        p.desenha(msp, px + dx, py + dy, cotas=False, rotulo=False,
                  cod_na_peca=True)

    usado = sum(p.w * p.h for p, *_ in pos)
    rodape = (f"{len(pos)} peças   |   área das peças {usado / 1e6:.3f} m²")
    if chapa_padrao:
        rodape += (f"   |   cabe em chapa padrão {chapa_padrao[0]:g} x "
                   f"{chapa_padrao[1]:g} mm")
    txt(msp, margem, 11, rodape, 7, "TEXTO", "left")
    txt(msp, sw - margem, 26, "REVISAO V2 - NAO CORTAR SEM VALIDACAO FISICA", 6, "TEXTO", "right")
    doc.saveas(path)
    return pos, (sw, sh)


# --------------------------------------------------------------- prévia ----
def previa(doc_ou_path, png, dpi=170, tamanho=(11.7, 8.3)):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    from ezdxf.addons.drawing import Frontend, RenderContext
    from ezdxf.addons.drawing.config import BackgroundPolicy, Configuration
    from ezdxf.addons.drawing.matplotlib import MatplotlibBackend

    doc = ezdxf.readfile(doc_ou_path) if isinstance(doc_ou_path, str) else doc_ou_path
    fig = plt.figure(figsize=tamanho)
    ax = fig.add_axes([0.01, 0.01, 0.98, 0.98])
    ax.set_facecolor("white")
    cfg = Configuration(background_policy=BackgroundPolicy.WHITE)
    Frontend(RenderContext(doc), MatplotlibBackend(ax), config=cfg)\
        .draw_layout(doc.modelspace(), finalize=True)
    fig.savefig(png, dpi=dpi, facecolor="white")
    plt.close(fig)


def pasta(*partes):
    p = os.path.join(*partes)
    os.makedirs(p, exist_ok=True)
    return p
