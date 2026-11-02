# -*- coding: utf-8 -*-
"""Teste de regressao do suporte das placas (tiras de aluminio com espacadores).

Roda:  python placa_leds/testa_berco.py
"""
import hashlib
import sys
import tempfile
from pathlib import Path

BASE = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE))

import gera_berco as G   # noqa: E402

falhas = []


def ck(label, ok, detalhe=''):
    print(('  OK    ' if ok else '  FALHA ') + label + (('  — ' + detalhe) if detalhe and not ok else ''))
    if not ok:
        falhas.append(label)


def h(p):
    return hashlib.sha256(Path(p).read_bytes()).hexdigest()


def main():
    print('=== 1 · a geometria vigente passa? ===')
    linhas = G.conferencia()
    for l in linhas:
        print('  ' + l)
    ck('conferencia vigente sem bloqueio',
       not any(l.startswith(G.BLOQUEIA) for l in linhas))

    print('=== 2 · colisao forcada NAO pode gravar ===')
    with tempfile.TemporaryDirectory() as td:
        svg = Path(td) / 'berco_placas.svg'
        dxf = Path(td) / 'berco_placas.dxf'
        # geracao boa
        G.gravar(svg, dxf)
        h_antes_svg, h_antes_dxf = h(svg), h(dxf)
        ck('geracao boa criou os dois arquivos', svg.exists() and dxf.exists())

        # colisao forcada (Z_FOLD em 200 mm encostando no escudo)
        estourou = False
        try:
            G.gravar(svg, dxf, z_fold=200.0)
        except SystemExit as e:
            estourou = True
            print('  SystemExit: %s' % e)
        ck('colisao levanta SystemExit', estourou)
        ck('SVG anterior intocado', h(svg) == h_antes_svg)
        ck('DXF anterior intocado', h(dxf) == h_antes_dxf)

    if falhas:
        print('\nFALHAS: %d' % len(falhas))
        sys.exit(1)
    print('\nTODOS OS TESTES PASSARAM COM SUCESSO.')


if __name__ == '__main__':
    main()
