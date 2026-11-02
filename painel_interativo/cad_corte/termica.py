# -*- coding: utf-8 -*-
"""Modelo termico da V8 — fonte unica de fisica.

Usado por `analise_termica_tec.py` (na raiz) e por `valida_cad.py`.
Se a fisica mora num lugar so, o relatorio e o validador nao podem discordar.

Nada aqui assume "60 W de capacidade": a capacidade da Peltier e CALCULADA em
funcao de Tc, Th e da corrente, com o modelo de tres termos

    Qc = alfa*I*Tc - 0,5*I^2*R - K*(Th - Tc)
    I  = (V - alfa*(Th - Tc)) / R
    Th = Tamb + (Qc + Pe) * Rth_quente
    Tc = Tar  - Qc * Rth_frio

e resolvida por bissecao na temperatura do ar da camara.
"""
from __future__ import annotations

import parametros_v11 as P

# ---------------------------------------------------------------- Peltier ---
N_TEC = 2
V_TEC = 12.0
ALPHA = 0.0531      # V/K por modulo  (calibrado: Qmax ~60 W, dTmax ~69 K)
R_ELEC = 1.98       # ohm
K_TEC = 0.5506      # W/K

# ------------------------------------------------------------- paredes ------
H_IN = 8.0          # W/m2K conveccao interna (com ventoinhas)
H_IN_PARADO = 3.0   # W/m2K conveccao natural (sem ventoinhas)
H_OUT = 10.0        # W/m2K conveccao externa (ar parado)

# ------------------------------------------------------------- pontes -------
ROD_K = 50.0        # aco
ROD_D = 4.0
ROD_L = 0.062
ROD_N = 4
GRAMP_K = 16.0      # inox
GRAMP_A = 12e-3 * 1e-3
GRAMP_L = 0.010
GRAMP_N = 2
JUNTA_W_MK = 0.05   # EPDM comprimido, por metro linear
JUNTA_PERIM = 2 * (P.PORTA_W / 1000 + P.PORTA_H / 1000)   # 1,60 m na V8

# ------------------------------------------------------------- internos -----
P_VENT = 1.0        # W por ventoinha (motor + atrito, tudo vira calor)
# As 2 lampadas W5W de 10 W sairam do projeto. O DUT agora sao 8 posicoes de
# LED: cada uma dissipa ~20 mW no LED e ~100 mW no resistor de 1 k,
# 0,12 W no total, 0,96 W nas 8.
POS_P = 0.12        # W por posicao de ensaio (LED + resistor)
POS_QTD = 8


def area_interna():
    """6 faces da cavidade bruta, em m2."""
    W, D, H = P.W_GROSS / 1000, P.D_GROSS / 1000, P.H_GROSS / 1000
    return 2 * (W * H) + 2 * (D * H) + 2 * (W * D)


def U_global(iso_mm=None, ventoinhas=True):
    """Transmitancia das paredes, W/m2K."""
    e = (P.E if iso_mm is None else iso_mm) / 1000.0
    h_in = H_IN if ventoinhas else H_IN_PARADO
    return 1.0 / (1.0 / h_in + e / P.ISO_K + (P.ACR / 1000) / P.ACR_K + 1.0 / H_OUT)


def UA(iso_mm=None, ventoinhas=True):
    return U_global(iso_mm, ventoinhas) * area_interna()


def UA_pontes():
    """Condutancia das pontes termicas, W/K."""
    import math
    a_rod = math.pi * (ROD_D / 2000.0) ** 2
    g_rod = ROD_K * a_rod / ROD_L * ROD_N
    g_gr = GRAMP_K * GRAMP_A / GRAMP_L * GRAMP_N
    g_j = JUNTA_W_MK * JUNTA_PERIM
    return {'tirantes': g_rod, 'grampos': g_gr, 'junta_porta': g_j,
            'total': g_rod + g_gr + g_j}


def ganho_interno(posicoes=True, ventoinhas=True):
    """Calor gerado DENTRO da camara, em W.

    Nao existe mais lampada: o DUT sao 8 posicoes de LED (12 V / 1 kOhm,
    ~10 mA cada, ~0,12 W cada). O parametro `lampadas` virou `posicoes` para
    nao convidar a chamar de lampada uma coisa que nao e mais lampada.
    """
    q = 0.0
    if ventoinhas:
        q += P_VENT * 2
    if posicoes:
        q += POS_P * POS_QTD
    return q


# ---------------------------------------------------------------- Peltier ---
def tec_ponto(t_ar, tamb, rth_quente, rth_frio, qc_por_modulo, v=V_TEC):
    """Qc de um modulo numa condicao. Devolve (qc, pe, th, tc, i)."""
    tc = t_ar - qc_por_modulo * rth_frio
    th = tamb + 100.0                      # chute inicial
    for _ in range(60):
        dt = th - tc
        i = max(0.0, (v - ALPHA * dt) / R_ELEC)
        pe = v * i
        qc = ALPHA * i * tc - 0.5 * i * i * R_ELEC - K_TEC * dt
        th_novo = tamb + (qc + pe) * rth_quente
        if abs(th_novo - th) < 1e-6:
            th = th_novo
            break
        th = 0.5 * th + 0.5 * th_novo
    dt = th - tc
    i = max(0.0, (v - ALPHA * dt) / R_ELEC)
    pe = v * i
    qc = ALPHA * i * tc - 0.5 * i * i * R_ELEC - K_TEC * dt
    return qc, pe, th, tc, i


RTH_FRIO_COM_VENT = 0.10    # K/W — dissipador frio com as 2 ventoinhas
FATOR_SEM_VENT = 6.0        # sem ventoinha a conveccao do lado frio desaba


def equilibrio_frio(tamb, rth_quente=0.10, rth_frio=None, iso_mm=None,
                    posicoes=False, ventoinhas=True, t_min=200.0):
    """Temperatura de equilibrio do AR da camara, em K. None se nao ha solucao.

    Sem ventoinha o h interno cai E a transferencia do dissipador frio para o ar
    desaba. Modelar so a primeira parte daria um resultado absurdo (camara mais
    fria com as ventoinhas desligadas), que foi o que a primeira versao fez.
    """
    if rth_frio is None:
        rth_frio = RTH_FRIO_COM_VENT * (1.0 if ventoinhas else FATOR_SEM_VENT)
    ua = UA(iso_mm, ventoinhas) + UA_pontes()['total']
    q_int = ganho_interno(posicoes, ventoinhas)

    def sobra(t_ar):
        q_total = ua * (tamb - t_ar) + q_int
        qc, *_ = tec_ponto(t_ar, tamb, rth_quente, rth_frio, q_total / N_TEC)
        return N_TEC * qc - q_total

    lo, hi = t_min, tamb
    if sobra(hi) <= 0:
        return None, 0.0, 0.0
    for _ in range(120):
        mid = 0.5 * (lo + hi)
        if sobra(mid) > 0:
            hi = mid
        else:
            lo = mid
    t_ar = 0.5 * (lo + hi)
    q_total = ua * (tamb - t_ar) + q_int
    qc, pe, th, tc, i = tec_ponto(t_ar, tamb, rth_quente, rth_frio, q_total / N_TEC)
    return t_ar, q_total, (qc + pe) * N_TEC


def equilibrio_quente(tamb, p_ptc, iso_mm=None, posicoes=True, ventoinhas=True):
    """Temperatura de equilibrio com o PTC ligado (potencia constante)."""
    ua = UA(iso_mm, ventoinhas) + UA_pontes()['total']
    q_int = ganho_interno(posicoes, ventoinhas)
    return tamb + (p_ptc + q_int) / ua, ua * 0 + p_ptc + q_int


def potencia_para(tamb, t_alvo, iso_mm=None, posicoes=True, ventoinhas=True):
    """Potencia de PTC necessaria para manter t_alvo (K)."""
    ua = UA(iso_mm, ventoinhas) + UA_pontes()['total']
    return ua * (t_alvo - tamb) - ganho_interno(posicoes, ventoinhas)


def carga_parede(dt, iso_mm=None, ventoinhas=True):
    ua = UA(iso_mm, ventoinhas) + UA_pontes()['total']
    return ua * dt
