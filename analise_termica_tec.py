# -*- coding: utf-8 -*-
"""Analise termica da camara — 8 cenarios obrigatorios.

Roda a partir da raiz do projeto:   python analise_termica_tec.py

A fisica esta em cad_corte/termica.py e as dimensoes em
cad_corte/parametros_v11.py (a geometria base nao mudou desde a V11). Nada aqui usa "60 W de capacidade": a capacidade
da Peltier e recalculada em cada ponto de operacao.
"""
from __future__ import annotations

import os
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(ROOT, 'cad_corte'))

import parametros_v11 as P
import termica as T

K = 273.15
LIN = '=' * 78


def c(v):
    return v - K


def fmt_c(v):
    return 'sem solucao' if v is None else f'{c(v):7.1f} C'


def linha(titulo):
    print('\n' + LIN)
    print(titulo)
    print(LIN)


def main():
    r = P.resumo()
    ua = T.UA() + T.UA_pontes()['total']
    pontes = T.UA_pontes()

    linha('DADOS DE ENTRADA (todos de cad_corte/parametros_v11.py)')
    print(f'  camara interna bruta ...... {P.W_GROSS:g} x {P.D_GROSS:g} x {P.H_GROSS:g} mm '
          f'= {r["vol_bruto_L"]:.2f} L')
    print(f'  camara util (com isolante)  {P.W_NET:g} x {P.D_NET:g} x {P.H_NET:g} mm '
          f'= {r["vol_util_L"]:.2f} L')
    print(f'  volume livre (dutos + dissipador) = {r["vol_livre_L"]:.2f} L')
    print(f'  area interna (6 faces) .... {T.area_interna():.4f} m2')
    print(f'  isolante .................. {P.E:g} mm, k = {P.ISO_K:g} W/mK')
    print(f'  U das paredes ............. {T.U_global():.3f} W/m2K')
    print(f'  UA paredes ................ {T.UA():.3f} W/K')
    print(f'  UA pontes termicas ........ {pontes["total"]:.4f} W/K  '
          f'(tirantes {pontes["tirantes"]:.4f} + grampos {pontes["grampos"]:.4f} '
          f'+ junta {pontes["junta_porta"]:.4f})')
    print(f'  UA total .................. {ua:.3f} W/K')
    print(f'  2x TEC1-12706 a {T.V_TEC:g} V, alfa={T.ALPHA} V/K, R={T.R_ELEC} ohm, '
          f'K={T.K_TEC} W/K')

    # ------------------------------------------------------------------ 1 e 2
    linha('CENARIO 1 e 2 — refrigeracao: ambiente 25 C e 30 C, alvo 5 C')
    print(f'  {"ambiente":>10} {"Rth quente":>11} {"T ar":>11} {"Qc total":>10} '
          f'{"Qh rejeitado":>13} {"Th":>10} {"atende 5 C?":>13}')
    for tamb_c in (25.0, 30.0):
        for rth in (0.10, 0.15):
            t_ar, qc, qh = T.equilibrio_frio(tamb_c + K, rth)
            th = tamb_c + qh * rth
            ok = 'SIM' if (t_ar and c(t_ar) <= 5.0) else 'NAO'
            print(f'  {tamb_c:9.0f} C {rth:10.2f}  {fmt_c(t_ar)} {qc:9.1f} W '
                  f'{qh:12.1f} W {th:9.1f} C {ok:>13}')
    print('  Qh e o calor que o dissipador QUENTE tem de rejeitar (Qc + potencia eletrica).')
    print('  E esse numero, e nao 60 W, que dimensiona o dissipador externo.')

    # --------------------------------------------------------------------- 3
    linha('CENARIO 3 — aquecimento: ambiente 25 C, alvo 50 C (o alvo do ensaio)')
    print(f'  {"posicoes":>10} {"PTC necessario":>16} {"T com PTC 80 W":>18} '
          f'{"T com PTC 150 W":>18}')
    for pos in (False, True):
        p_nec = T.potencia_para(25 + K, 50 + K, posicoes=pos)
        t80, _ = T.equilibrio_quente(25 + K, 80, posicoes=pos)
        t150, _ = T.equilibrio_quente(25 + K, 150, posicoes=pos)
        print(f'  {"ligadas" if pos else "apagadas":>10} {p_nec:14.1f} W '
              f'{c(t80):15.1f} C {c(t150):15.1f} C')
    print('  O PTC ESCOLHIDO E O DE 80 W (24 V, 3,3 A) — ver a lista de materiais.')
    print('  Ele da ~2,3x de margem sobre os 34 W necessarios para manter 50 C, e')
    print('  levado ao maximo a camara passa de 80 C, muito acima do alvo.')
    print('  O PTC TEM DE SER MODULADO (PID no BTS7960): com 80 W fixos a camara nao')
    print('  para em 50 C, e com 150 W vai a ~130 C — os numeros da tabela acima, nao')
    print('  um chute. Nao existe "PTC de potencia constante", e por isso o corte')
    print('  termico independente e o sensor de sobretemperatura NAO sao opcionais.')
    print('  Limite pratico do PMMA: nao passar de 60 C na parede perto do PTC.')
    print('')
    print('  ATENCAO — ISTO E MODELO, NAO ENSAIO. As temperaturas de frio dependem de')
    print('  hipoteses que so a bancada fecha: eficiencia do dissipador (0,10-0,15 K/W),')
    print('  contato termico da Peltier, qualidade da vedacao e do EPS de 1 mm. Um')
    print('  contato ruim come 10-20 K de desempenho e o modelo nao ve. Aprovacao de')
    print('  5 C exige termopar no centro, ciclo real e 30 min de regime.')

    # --------------------------------------------------------------------- 4
    linha('CENARIO 4 — as 8 posicoes de LED acesas (~1 W dentro da camara)')
    t_off, q_off, _ = T.equilibrio_frio(25 + K, 0.10, posicoes=False)
    t_on, q_on, _ = T.equilibrio_frio(25 + K, 0.10, posicoes=True)
    print(f'  8 posicoes apagadas ... {fmt_c(t_off)}   carga {q_off:5.1f} W')
    print(f'  8 posicoes acesas ..... {fmt_c(t_on)}   carga {q_on:5.1f} W')
    print(f'  penalidade ............ {c(t_on) - c(t_off):+5.1f} K  '
          f'(as posicoes ficam dentro do volume refrigerado)')
    print('  As 8 posicoes somam ~1 W, contra os 10 W das duas W5W de antes: a')
    print('  penalidade no ensaio de frio praticamente desapareceu. E o ensaio de')
    print('  frio pode rodar com as posicoes acesas, que e o caso real.')

    # --------------------------------------------------------------------- 5
    linha('CENARIO 5 — ventoinhas funcionando normalmente x paradas')
    t_v, q_v, _ = T.equilibrio_frio(25 + K, 0.10, ventoinhas=True)
    t_s, q_s, _ = T.equilibrio_frio(25 + K, 0.10, ventoinhas=False)
    print(f'  2 ventoinhas ligadas ... {fmt_c(t_v)}   carga {q_v:5.1f} W   '
          f'U {T.U_global(ventoinhas=True):.3f}')
    print(f'  ventoinhas paradas ..... {fmt_c(t_s)}   carga {q_s:5.1f} W   '
          f'U {T.U_global(ventoinhas=False):.3f}')
    print('  ATENCAO: a temperatura MEDIA nao piora com as ventoinhas paradas — o que')
    print('  cai e o vazamento pelas paredes (U 3,57 -> 2,05). Entao o intertravamento')
    print('  NAO se justifica por temperatura media. Ele se justifica por tres coisas:')
    print('    a) sem circulacao o ar estratifica e o sensor nao ve o ponto quente;')
    print('    b) o PTC ligado sem escoamento superaquece a propria carcaca;')
    print('    c) o dissipador frio sem escoamento forma gelo e perde capacidade.')
    print('  Nao use este numero para dizer que "sem ventoinha refrigera mais".')

    # --------------------------------------------------------------------- 6
    linha('CENARIO 6 — dissipador quente com diferentes resistencias termicas')
    print(f'  {"Rth (K/W)":>10} {"T ar":>11} {"Qc":>9} {"Qh":>9} {"Th":>10} {"observacao":>24}')
    for rth in (0.05, 0.08, 0.10, 0.15, 0.20, 0.30, 0.45):
        t_ar, qc, qh = T.equilibrio_frio(25 + K, rth)
        th = 25 + qh * rth
        if t_ar is None:
            obs = 'nao refrigera'
        elif th > 70:
            obs = 'Th>70 C: risco p/ TEC'
        elif th > 55:
            obs = 'Th alta, mas atende'
        elif c(t_ar) > 5:
            obs = 'NAO atinge 5 C'
        else:
            obs = 'ok'
        print(f'  {rth:10.2f} {fmt_c(t_ar)} {qc:8.1f} {qh:8.1f} {th:9.1f} C {obs:>24}')
    print('  Referencia pratica: cooler de CPU torre pequeno ~0,10 a 0,15 K/W por modulo;')
    print('  bloco de aluminio sem aleta ~0,5 K/W. O alvo de 5 C sobrevive ate 0,45 K/W,')
    print('  mas a temperatura da face quente e que manda: acima de ~70 C o proprio TEC')
    print('  se degrada e o acrilico da tampa tecnica (PMMA, ~80 C) amolece.')

    # --------------------------------------------------------------------- 7
    linha('CENARIO 7 — isolamento de 1, 5 e 10 mm')
    print(f'  {"iso (mm)":>9} {"U (W/m2K)":>11} {"UA total":>9} {"T ar (25 C amb)":>17} '
          f'{"Qc":>9} {"ganho vs 1 mm":>14}')
    base = None
    for iso in (1.0, 5.0, 10.0):
        u = T.U_global(iso)
        uat = T.UA(iso) + pontes['total']
        t_ar, qc, _ = T.equilibrio_frio(25 + K, 0.10, iso_mm=iso)
        if base is None:
            base = c(t_ar)
        print(f'  {iso:9.1f} {u:11.3f} {uat:9.3f} {fmt_c(t_ar):>17} {qc:8.1f} W '
              f'{c(t_ar) - base:+12.1f} K')
    print('  O valor do projeto e 1 mm, por decisao do usuario. A diferenca esta acima,')
    print('  em K, e a secao 8 diz exatamente o que essa escolha custa.')

    # ------------------------------------------- 8. veredito da decisao -----
    linha('CENARIO 8 — VEREDITO: 1 mm mantido atende o alvo de 5 C?')
    print(f'  {"ambiente":>9} {"Rth quente":>11} {"T ar":>9} {"alvo 5 C":>10}')
    veredito = {}
    for tamb in (25, 30):
        for rth in (0.10, 0.15):
            t, q, qh = T.equilibrio_frio(tamb + K, rth)
            ok = t is not None and t <= 5 + K
            veredito[(tamb, rth)] = ok
            print(f'  {tamb:8d} C {rth:10.2f} {fmt_c(t):>9} '
                  f'{"ATENDE" if ok else "NAO ATENDE":>10}')
    n_ok = sum(veredito.values())
    print()
    if n_ok == 4:
        print('  Os quatro casos atendem.')
    else:
        print(f'  ATENCAO: {n_ok} de 4 casos atendem. Com 1 mm de isolante a camara NAO')
        print('  sustenta 5 C com 30 C de ambiente. Isso esta registrado no relatorio')
        print('  como limitacao do projeto, nao como erro de calculo.')
        print()
        print('  Para fechar o alvo existem duas saidas, com numeros:')
        for iso in (5.0, 10.0):
            t, q, qh = T.equilibrio_frio(30 + K, 0.15, iso_mm=iso)
            print(f'    isolante de {iso:4.0f} mm -> {fmt_c(t)} a 30 C / Rth 0,15')
        T.N_TEC = 4
        t, q, qh = T.equilibrio_frio(30 + K, 0.15, iso_mm=1.0)
        print(f'    4 Peltier com 1 mm -> {fmt_c(t)} a 30 C / Rth 0,15, '
              f'porem {qh:.0f} W a rejeitar')
        T.N_TEC = 2

    # ---------------------------------------------------------- sintese -----
    linha('SINTESE E RISCOS')
    t5, q5, qh5 = T.equilibrio_frio(25 + K, 0.10)
    qc1, pe1, th1, tc1, i1 = T.tec_ponto(t5, 25 + K, 0.10, 0.10, q5 / 2)
    # Th do CONJUNTO: o Rth do dissipador ve o Qh dos dois modulos, nao o de um.
    # (tec_ponto devolve o Th de um modulo contra o Rth inteiro — nao usar aqui.)
    th_tot = 25 + K + (q5 + 2 * pe1) * 0.10
    print(f'  - 25 C de ambiente, Rth 0,10 K/W: a camara estabiliza em {fmt_c(t5)}.')
    print(f'  - O dissipador quente rejeita {qh5:.0f} W a {th_tot - K:.0f} C, ou seja '
          f'{qh5 / q5:.1f}x a carga')
    print('    de parede: o gargalo nao e o isolamento, e o dissipador externo.')
    print(f'  - Cada Peltier puxa {pe1:.0f} W ({i1:.1f} A a {T.V_TEC:g} V). Total '
          f'{2 * pe1:.0f} W eletricos.')
    print('    Fonte, disjuntor e cabos tem de ser dimensionados por esse numero.')
    print('  - Sem o vao do kit Peltier na tampa tecnica (CAM-05) nada disso acontece:')
    print('    a peca esta em branco de proposito, aguardando a medida do conjunto.')
    print('  - Nada aqui substitui medicao. E um modelo de primeira ordem, sem resistencia')
    print('    de contato, sem aleta do lado frio e sem gradiente interno.')
    print('  - Os dutos externos NAO entram no UA: eles estao dentro do envelope')
    print('    isolado. Se ficassem sem isolante, seriam uma aleta de 0,32 m2.')
    print()


if __name__ == '__main__':
    main()
