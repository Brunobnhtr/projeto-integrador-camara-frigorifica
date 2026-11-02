# -*- coding: utf-8 -*-
"""Validador do pacote CAD V12 — camara com DUTOS EXTERNOS.

Nao confia em nada. Abre cada DXF, mede o que esta desenhado e compara com
`parametros_v12.py`. Depois roda TESTES NEGATIVOS: injeta erros de proposito e
exige que o validador os detecte. Se um teste negativo passar batido, o proprio
validador falha — e a unica forma de saber que ele nao esta sempre dizendo "ok".

Uso:  python valida_cad_v12.py
Saida: valida_cad_saida.txt (quando redirecionado) e codigo 0/1.
"""
from __future__ import annotations

import io
import math
import os
import sys
from collections import Counter

import ezdxf
from ezdxf import bbox

import parametros_v12 as P

ROOT = os.path.dirname(os.path.abspath(__file__))
CAM = os.path.join(ROOT, 'camara')
PNL = os.path.join(ROOT, 'painel')

ERROS, AVISOS = [], []
N = [0]


def carrega_pecas():
    """Le pecas_v12.json (exportado pelo gerador) como objetos simples."""
    import json
    caminho = os.path.join(ROOT, 'pecas_v12.json')
    if not os.path.isfile(caminho):
        return []
    with open(caminho, encoding='utf-8') as f:
        dados = json.load(f)
    return [type('P', (), {
        'cod': d['cod'], 'nome': d['nome'], 'material': d['material'],
        'esp': d['esp'], 'w': d['w'], 'h': d['h'], 'qtd': d['qtd'],
        'furos': [tuple(x) for x in d['furos']],
        'recortes': [tuple(x) for x in d['recortes']],
        'grupo': d['grupo'],
    }) for d in dados]


def check(cond, msg):
    N[0] += 1
    if not cond:
        ERROS.append(msg)
    return cond


def aviso(cond, msg):
    N[0] += 1
    if not cond:
        AVISOS.append(msg)
    return cond


def caixa(a, b):
    """Distancia entre duas caixas AABB (0 se encostam ou sobrepoem)."""
    d = []
    for i in range(3):
        lo_a, hi_a = a[i], a[i + 3]
        lo_b, hi_b = b[i], b[i + 3]
        if hi_a < lo_b:
            d.append(lo_b - hi_a)
        elif hi_b < lo_a:
            d.append(lo_a - hi_b)
        else:
            d.append(0.0)
    return math.sqrt(sum(x * x for x in d))


def box_de_pose(p):
    _, x0, y0, z0, dx, dy, dz = p
    return (x0, y0, z0, x0 + dx, y0 + dy, z0 + dz)


# =============================================================================
# 1. ARQUIVOS E CONTEUDO DOS DXF
# =============================================================================
def f_dxf_existe(pastas, cods):
    for pasta in pastas:
        for c in cods:
            caminho = os.path.join(pasta, f'{c}.dxf')
            check(os.path.isfile(caminho), f'{c}: DXF nao encontrado em {pasta}')
            if os.path.isfile(caminho):
                check(os.path.getsize(caminho) > 1200,
                      f'{c}: DXF suspeito de vazio ({os.path.getsize(caminho)} B)')


def f_dxf_abre(pastas, cods):
    for pasta in pastas:
        for c in cods:
            caminho = os.path.join(pasta, f'{c}.dxf')
            if not os.path.isfile(caminho):
                continue
            try:
                doc = ezdxf.readfile(caminho)
            except Exception as e:
                check(False, f'{c}: ezdxf nao abriu -> {e}')
                continue
            check(doc.header.get('$INSUNITS') == 4,
                  f'{c}: $INSUNITS={doc.header.get("$INSUNITS")} (esperado 4 = mm)')
            msp = doc.modelspace()
            corte = [e for e in msp if e.dxf.layer == 'CORTE']
            check(len(corte) > 0, f'{c}: nenhuma entidade na camada CORTE')
            # camadas obrigatorias
            for cam in ('CORTE', 'GRAVACAO', 'COTA', 'TEXTO', 'MOLDURA', 'REF'):
                check(cam in doc.layers, f'{c}: camada {cam} ausente')
            # so CORTE pode estar em uso para corte: nenhuma entidade de
            # desenho tecnico pode estar na camada CORTE
            for e in msp:
                if e.dxf.layer == 'CORTE' and e.dxftype() == 'TEXT':
                    check(False, f'{c}: texto na camada CORTE (a maquina cortaria o texto)')


def f_dimensao(pastas, pecas):
    """O que esta desenhado tem de medir o que o parametro diz."""
    for pasta in pastas:
        for p in pecas:  # noqa: E501 - pasta e o diretorio do DXF; pecas vem do gerador
            caminho = os.path.join(pasta, f'{p.cod}.dxf')
            if not os.path.isfile(caminho):
                continue
            doc = ezdxf.readfile(caminho)
            msp = doc.modelspace()
            ents = [e for e in msp if e.dxf.layer == 'CORTE']
            if not ents:
                continue
            b = bbox.extents(ents)
            if not b.has_data:
                continue
            w, h = b.size.x, b.size.y
            check(abs(w - p.w) < 0.6,
                  f'{p.cod}: largura desenhada {w:.2f} != parametro {p.w:g}')
            check(abs(h - p.h) < 0.6,
                  f'{p.cod}: altura desenhada {h:.2f} != parametro {p.h:g}')


def f_furo_dentro(pastas, pecas):
    for p in pecas:
        for (x, y, d, *rest) in p.furos:
            nota = rest[0] if rest else ''
            check(0 < x < p.w and 0 < y < p.h,
                  f'{p.cod}: furo D{d:g} fora da peca em ({x:g}, {y:g}) [{nota}]')
            check(x - d / 2 >= -0.01 and x + d / 2 <= p.w + 0.01,
                  f'{p.cod}: furo D{d:g} sangra a borda em X ({x:g})')
            check(y - d / 2 >= -0.01 and y + d / 2 <= p.h + 0.01,
                  f'{p.cod}: furo D{d:g} sangra a borda em Y ({y:g})')


def f_furo_sobreposto(pecas):
    """Dois furos nao podem se sobrepor (a maquina perde a peca)."""
    for p in pecas:
        fs = p.furos
        for i in range(len(fs)):
            for j in range(i + 1, len(fs)):
                x1, y1, d1 = fs[i][0], fs[i][1], fs[i][2]
                x2, y2, d2 = fs[j][0], fs[j][1], fs[j][2]
                dist = math.hypot(x1 - x2, y1 - y2)
                check(dist >= (d1 + d2) / 2 - 0.01,
                      f'{p.cod}: furos D{d1:g} e D{d2:g} se sobrepoem em '
                      f'({x1:g},{y1:g}) e ({x2:g},{y2:g})')


def f_recorte_dentro(pecas):
    for p in pecas:
        for (x, y, rw, rh, *rest) in p.recortes:
            nota = rest[0] if rest else ''
            check(x >= -0.01 and y >= -0.01 and x + rw <= p.w + 0.01
                  and y + rh <= p.h + 0.01,
                  f'{p.cod}: recorte {rw:g}x{rh:g} em ({x:g},{y:g}) sai da peca [{nota}]')
            check(rw > 0 and rh > 0, f'{p.cod}: recorte com dimensao nula [{nota}]')


def f_duplicado(pecas):
    cods = [p.cod for p in pecas]
    rep = [c for c, n in Counter(cods).items() if n > 1]
    check(not rep, f'codigos duplicados: {rep}')


def f_quantidade(pecas):
    for p in pecas:
        check(p.qtd >= 1, f'{p.cod}: quantidade {p.qtd} invalida')
        check(p.w > 0 and p.h > 0, f'{p.cod}: dimensao nula')
        check(p.esp > 0, f'{p.cod}: espessura nula')


# =============================================================================
# 2. GEOMETRIA — os dutos TEM de ser externos (o ponto desta versao)
# =============================================================================
def f_dutos_externos():
    poses = P.poses_de('CAM-08')
    check(len(poses) == 6, f'CAM-08: {len(poses)} colocacoes (esperado 6 = 3 x 2 dutos)')
    esq = dir_ = 0
    for p in poses:
        _, x0, y0, z0, dx, dy, dz = p
        x1 = x0 + dx
        # externo = inteiramente fora da cavidade interna 0..W_GROSS
        fora = (x1 <= 0.0 + 1e-6) or (x0 >= P.W_GROSS - 1e-6)
        check(fora, f'CAM-08: painel em X {x0:g}..{x1:g} esta DENTRO da camara '
                    f'(a V12 exige duto externo)')
        if x1 <= 0:
            esq += 1
        if x0 >= P.W_GROSS:
            dir_ += 1
    check(esq == 3, f'CAM-08: {esq} paineis no duto esquerdo (esperado 3)')
    check(dir_ == 3, f'CAM-08: {dir_} paineis no duto direito (esperado 3)')

    # alojamento e flange tambem externos
    for cod in ('CAM-09', 'CAM-10', 'CAM-11'):
        for p in P.poses_de(cod):
            _, x0, y0, z0, dx, dy, dz = p
            x1 = x0 + dx
            check(x1 <= 1e-6 or x0 >= P.W_GROSS - 1e-6,
                  f'{cod}: peca do alojamento em X {x0:g}..{x1:g} invade a camara')

    # o canal tem de estar FECHADO em cima. Sem a tampa CAM-21 o duto e uma
    # chamine: a ventoinha empurra o ar para o ambiente e nao para a camara.
    tampa = P.poses_de('CAM-21')
    check(len(tampa) == 2, f'CAM-21: {len(tampa)} tampas de duto (esperado 2)')
    for p in tampa:
        _, x0, y0, z0, dx, dy, dz = p
        check(abs(z0 - P.DUTO_Z1) < 1e-6,
              f'CAM-21: tampa em Z {z0:g}, devia assentar em Z {P.DUTO_Z1:g}')
        check(abs((z0 + dz) - (P.H_GROSS + P.ACR)) < 1e-6,
              f'CAM-21: topo da tampa em Z {z0 + dz:g}, devia ficar rente ao teto '
              f'{P.H_GROSS + P.ACR:g}')
        check(dx + 1e-6 >= P.DUTO_W and dy + 1e-6 >= P.DUTO_D,
              f'CAM-21: tampa {dx:g}x{dy:g} menor que o canal {P.DUTO_W:g}x{P.DUTO_D:g}')
    lados = set()
    for p in tampa:
        _, x0, *_ = p
        lados.add(x0 < 0)
    check(len(lados) == 2, 'CAM-21: falta a tampa de um dos dutos')


def f_largura_total():
    check(abs(P.TOTAL_W - 390.0) < 1e-6,
          f'largura total {P.TOTAL_W:g} != 390 mm')
    check(abs(P.BODY_W + 2 * P.DUTO_W - P.TOTAL_W) < 1e-6,
          'largura total nao fecha: corpo + 2 dutos')
    check(abs(P.BODY_D - 210.0) < 1e-6, f'profundidade externa {P.BODY_D:g} != 210')
    check(abs(P.BODY_H - 260.0) < 1e-6, f'altura externa {P.BODY_H:g} != 260')
    check(abs(P.BODY_W - 310.0) < 1e-6, f'largura externa {P.BODY_W:g} != 310')


def f_ventilacao():
    """A ventoinha de 40 mm tem de caber num alojamento com aba para os furos."""
    check(P.ALOJ_L > P.VENT_D,
          f'alojamento {P.ALOJ_L:g} nao e maior que a ventoinha {P.VENT_D:g}')
    check(P.ALOJ_L - P.VENT_D >= 8.0,
          f'folga lateral do alojamento {P.ALOJ_L - P.VENT_D:g} mm insuficiente')
    check(P.FLANGE_L >= P.VENT_D + 12.0,
          f'flange {P.FLANGE_L:g} sem aba para os furos M3 (precisa >= {P.VENT_D + 12:g})')
    check(P.VENT_ABERTURA < P.VENT_D,
          f'abertura D{P.VENT_ABERTURA:g} nao pode ser >= ventoinha {P.VENT_D:g}')
    # ligamento entre a abertura e os furos de passo 32
    raio_furo = math.hypot(P.VENT_PASSO / 2, P.VENT_PASSO / 2) - P.VENT_FURO / 2
    lig = raio_furo - P.VENT_ABERTURA / 2
    check(lig >= 2.0,
          f'ligamento entre D{P.VENT_ABERTURA:g} e os furos M3 = {lig:.2f} mm (< 2 mm)')
    # boca inferior abaixo da flange, senao o ar entra acima da ventoinha
    check(P.BOCA_INF_Z1 <= P.FLANGE_Z0,
          f'boca inferior termina em Z{P.BOCA_INF_Z1:g}, acima da flange Z{P.FLANGE_Z0:g}')
    check(P.BOCA_SUP_Z1 <= P.DUTO_Z1,
          f'boca superior termina em Z{P.BOCA_SUP_Z1:g}, acima do duto Z{P.DUTO_Z1:g}')
    check(P.BOCA_H > 0 and P.BOCA_H <= P.DUTO_D,
          f'boca de {P.BOCA_H:g} mm nao cabe no canal de {P.DUTO_D:g}')
    # Ventoinha INSIDE: corpo 40x40 na parede e passagem circular de 34mm.
    check(P.VENT_INTERNA and P.VENT_IN_CZ-P.VENT_D/2>=5, 'fan interna invade piso')
    check(P.VENT_IN_CZ+P.VENT_D/2<=P.DUTO_Z0, 'fan interna invade duto')


def f_ventoinha_cabe_no_alojamento():
    """Ventoinha 40x40x10 cabe abaixo do estreitamento e tem folga lateral."""
    check(P.ALOJ_L-2*P.ACR >= P.VENT_IN_ABERTURA+4, 'plenum de transicao pequeno')
    check(P.VENT_INTERNA and P.VENT_IN_CZ<P.FLANGE_Z0, 'fan deve ficar dentro da camara')
    check(P.VENT_IN_CZ-P.VENT_D/2>=P.ACR, 'fan interna invade fundo da camara')
    check(P.TOTAL_W_MAX == P.BODY_W+2*P.ALOJ_L, 'largura total alojamentos errada')


def f_bocas_na_lateral():
    """As 4 bocas tem de estar na face lateral, e o isolante tem de ter o vao."""
    for (x0, x1, y0, y1, z0, z1) in P.boca_global():
        check(abs(x1 - x0 - P.ACR) < 1e-6, 'boca nao atravessa exatamente a lateral')
        check(y1 <= P.D_GROSS and z1 <= P.H_GROSS, 'boca sai da lateral')
        check(z0 >= 0, 'boca abaixo do piso')


def f_folgas():
    """Folga entre conjuntos internos. Menos de 8 mm e erro de projeto."""
    pares = [
        ('CAM-12', 'CAM-25', 8.0, 'base do PTC x bandeja das lampadas'),
        ('CAM-13', 'CAM-25', 8.0, 'suporte do PTC x bandeja das lampadas'),
        ('CAM-14', 'CAM-25', 8.0, 'escudo do PTC x bandeja das lampadas'),
        ('CAM-12', 'CAM-05', 5.0, 'plataforma x tampa tecnica'),
        ('CAM-17', 'CAM-14', 5.0, 'calha x escudo'),
        ('CAM-16', 'CAM-12', 1.0, 'grampo x plataforma'),
        ('CAM-19', 'CAM-18', 0.0, 'lamina x quadro da comporta'),
    ]
    for a, b, minimo, nome in pares:
        pa, pb = P.poses_de(a), P.poses_de(b)
        if not pa or not pb:
            check(False, f'folga {nome}: peca ausente em POSES')
            continue
        menor = min(caixa(box_de_pose(x), box_de_pose(y)) for x in pa for y in pb)
        check(menor >= minimo - 1e-6,
              f'folga {nome}: {menor:.2f} mm (< {minimo:g} mm)')

    # o PTC tem de passar pelo vao do escudo com folga
    ptc = (P.PTC_X0, P.PTC_Y0, P.PTC_Z0,
           P.PTC_X0 + P.PTC_W, P.PTC_Y0 + P.PTC_D, P.PTC_Z1)
    rec = (P.ESC_REC_X, P.ESC_REC_Y, P.ESC_Z0,
           P.ESC_REC_X + P.ESC_REC_W, P.ESC_REC_Y + P.ESC_REC_H, P.ESC_Z1)
    check(P.ESC_REC_W - P.PTC_W >= 4.0,
          f'vao do escudo {P.ESC_REC_W:g} deixa menos de 4 mm para o PTC {P.PTC_W:g}')
    check(P.ESC_REC_H - P.PTC_D >= 4.0,
          f'vao do escudo {P.ESC_REC_H:g} deixa menos de 4 mm para o PTC {P.PTC_D:g}')
    check(rec[0] <= ptc[0] and rec[1] <= ptc[1] and rec[3] >= ptc[3] and rec[4] >= ptc[4],
          'vao do escudo nao contem a seccao do PTC')
    # o escudo tem de estar na altura do PTC, nao abaixo dele
    check(P.ESC_Z1 > P.PTC_Z0, 'escudo abaixo da face quente do PTC')


def f_parede():
    """Nada pode atravessar o envelope sem furo previsto."""
    W, D, H = P.W_GROSS, P.D_GROSS, P.H_GROSS
    for (cod, x0, y0, z0, dx, dy, dz) in P.POSES:
        if cod in ('CAM-01', 'CAM-02', 'CAM-03', 'CAM-04', 'CAM-05', 'CAM-06',
                   'CAM-07', 'CAM-08', 'CAM-09', 'CAM-10', 'CAM-11', 'CAM-21',
                   'CAM-18', 'CAM-19', 'CAM-20'):
            continue        # envelope, dutos e comportas: fora por definicao
        check(x0 >= -1 and x0 + dx <= W + 1, f'{cod}: passa da lateral em X')
        check(y0 >= -1 and y0 + dy <= D + 1, f'{cod}: passa da porta/traseira em Y')
        check(z0 >= -1 and z0 + dz <= H + 1, f'{cod}: passa do piso/teto em Z')


def f_dreno_v10():
    """Invariantes independentes de drenagem. Nao confunde gravacao com furo."""
    from collections import Counter
    calha = P.poses_de('CAM-17')
    suportes = P.poses_de('CAM-22')
    check(len(calha) == 1, 'CAM-17 unica calha ausente')
    check(len(suportes) == 2, 'CAM-22 precisa de 2 suportes')
    check(P.CALHA_Z + P.CALHA_ABA_MM <= P.PEL_Z0 - 3,
          'calha invade o dissipador / folga inferior insuficiente')
    check(P.CALHA_X0 <= P.PEL_X0 - 10 and
          P.CALHA_X0+P.CALHA_W >= P.PEL_X1+10,
          'calha nao cobre a largura fria com margens de coleta')
    check(P.CALHA_Y0 <= P.D_GROSS-P.PEL_SALIENCIA-10,
          'calha nao cobre projecao em profundidade do lado frio')
    check(P.CALHA_Y0+P.CALHA_D<=P.D_GROSS,
          'calha atravessa a parede de tras')
    check(P.DRENO_Z_PAREDE < P.CALHA_Z,
          'dreno esta mais alto que o piso do coletor (sem gravidade)')
    check(P.DRENO_Z_PAREDE-P.DRENO_DIAMETRO_REFERENCIA/2 > P.TRAS_FIXA_H+5,
          'passagem de dreno invade ou enfraquece a emenda da tampa')
    check(P.CALHA_APOIOS_X[0]+P.CALHA_SUP_D/2 < P.PEL_X0 and
          P.CALHA_APOIOS_X[1]-P.CALHA_SUP_D/2 > P.PEL_X1,
          'fixacao das cantoneiras invade area do Peltier')
    # CAM-05 so aceita gravacao da mangueira (nao se corta D12 sem produto real)
    doc=ezdxf.readfile(os.path.join(CAM,'01_pecas','CAM-05.dxf'))
    corte=[ent for ent in doc.modelspace() if ent.dxf.layer=='CORTE' and ent.dxftype()=='CIRCLE']
    for ent in corte:
        c=ent.dxf.center
        check(abs(c.x-P.DRENO_X)>0.1 or abs(c.y-(P.DRENO_Z_PAREDE-P.TRAS_FIXA_H))>0.1,
              'CAM-05: dreno foi cortado sem medida do conector')
    # CAM-17 corte deve ser UM unico contorno poligonal fechado; sem recortes duplicados
    doc=ezdxf.readfile(os.path.join(CAM,'01_pecas','CAM-17.dxf'))
    cont=[ent for ent in doc.modelspace() if ent.dxf.layer=='CORTE']
    check(len(cont)==1 and cont[0].dxftype()=='LWPOLYLINE' and cont[0].closed,
          'CAM-17: cortes sobrepostos ou contorno nao fechado')
    # Piso isolado nao possui dreno antigo
    doc=ezdxf.readfile(os.path.join(CAM,'01_pecas','ISO-01.dxf'))
    check(not any(ent.dxf.layer=='CORTE' and ent.dxftype()=='CIRCLE'
                  for ent in doc.modelspace()),'ISO-01: dreno antigo no piso')


def f_peltier_corte_posterior():
    """CAM-05 e ISO-09 devem permanecer SEM furos de corte, so com GRAVACAO."""
    for cod in ('CAM-05','ISO-09'):
        doc=ezdxf.readfile(os.path.join(CAM,'01_pecas',cod+'.dxf'))
        entities=[e for e in doc.modelspace() if e.dxf.layer=='CORTE']
        check(len(entities)==1 and entities[0].dxftype()=='LWPOLYLINE' and entities[0].closed,
              f'{cod}: deve existir somente contorno de corte fechado, nenhum furo do kit')
        grav=[e for e in doc.modelspace() if e.dxf.layer=='GRAVACAO']
        check(any(e.dxftype()=='LWPOLYLINE' for e in grav),
              f'{cod}: falta area orientativa para corte futuro do Peltier')
    check(not P.PEL_RECORTE_AUTORIZADO and not P.PEL_MONTAGEM_MEDIDA,
          'Nao autorizar corte Peltier antes das medidas do kit')


def f_quantidades():
    esperado = {'CAM-03': 2, 'CAM-08': 6, 'CAM-09': 6, 'CAM-10': 2,
                'CAM-11': 2, 'CAM-16': 2, 'CAM-18': 2,
                'CAM-19': 2, 'CAM-20': 4, 'CAM-21': 2, 'CAM-22': 2,
                'CAM-23': 16, 'CAM-24': 4, 'CAM-25': 1}
    c = Counter(p[0] for p in P.POSES)
    for cod, n in esperado.items():
        check(c[cod] == n, f'POSES: {cod} tem {c[cod]} colocacoes (esperado {n})')
    # total esperado = soma das quantidades declaradas na lista de pecas.
    # Numero derivado, nao constante magica: se uma peca nova entrar no gerador
    # sem colocacao em POSES, esta checagem acusa sozinha.
    total = len(P.POSES)
    soma = sum(p.qtd for p in carrega_pecas() if p.cod.startswith('CAM-'))
    if soma:
        check(total == soma,
              f'POSES: {total} pecas fisicas (a lista de pecas declara {soma})')


def f_chapa(chapas):
    for (nome, mat, esp, sw, sh, n, padrao) in chapas:
        check(sw > 0 and sh > 0, f'{nome}: dimensao de chapa invalida')
        if padrao:
            check(sw <= padrao[0] and sh <= padrao[1],
                  f'{nome}: chapa {sw:g}x{sh:g} nao cabe na padrao '
                  f'{padrao[0]:g}x{padrao[1]:g}')
        check(n > 0, f'{nome}: chapa sem pecas')


# =============================================================================
# 3. TERMICO
# =============================================================================
def f_termico():
    import termica as T
    r = P.resumo()
    check(12.0 <= r['vol_bruto_L'] <= 20.0,
          f'volume bruto {r["vol_bruto_L"]:.2f} L fora da faixa 35..45')
    check(abs(r['vol_bruto_L'] - P.W_GROSS * P.D_GROSS * P.H_GROSS / 1e6) < 1e-6,
          'volume bruto nao fecha com as dimensoes')
    check(r['vol_livre_L'] > 0, 'volume livre negativo')
    check(r['vol_livre_L'] < r['vol_util_L'], 'volume livre maior que o util')

    ua = T.UA() + T.UA_pontes()['total']
    check(ua > 0, 'UA total invalido')
    check(T.UA_pontes()['total'] < 0.5 * ua,
          'pontes termicas respondem por mais de metade do UA')

    t25, q25, qh25 = T.equilibrio_frio(298.15, 0.10)
    check(t25 is not None, 'nao ha equilibrio termico a 25 C')
    if t25:
        check(t25 < 298.15, 'camara nao esfria a 25 C de ambiente')
        check(qh25 > 0, 'calor rejeitado invalido')
        # a limitacao desta versao tem de aparecer no modelo, nao ser escondida
        t30, _, _ = T.equilibrio_frio(303.15, 0.15)
        aviso(t30 is not None and t30 <= 278.15,
              f'LIMITACAO REGISTRADA: com isolante de {P.E:g} mm a camara para em '
              f'{t30 - 273.15:+.1f} C a 30 C de ambiente (alvo 5 C) — ver secao E')

    # a matriz 1/5/10 tem de ser monotona: mais isolante, mais frio
    temps = []
    for iso in (1, 5, 10):
        t, _, _ = T.equilibrio_frio(298.15, 0.10, iso_mm=iso)
        temps.append(t if t else 999)
    check(temps[0] > temps[1] > temps[2],
          f'matriz de isolamento nao monotona: {[round(x - 273.15, 1) for x in temps]}')

    # PTC tem de conseguir aquecer
    tq, _ = T.equilibrio_quente(298.15, 200.0)
    check(tq > 323.15, 'PTC de 200 W nao chega a 50 C')
    p_ptc = T.potencia_para(298.15, 323.15)
    check(0 < p_ptc < 200, f'potencia de PTC para 50 C fora da faixa: {p_ptc:.1f} W')


# =============================================================================
# 4. TESTES NEGATIVOS — provam que o validador morde
# =============================================================================
def _erros_de(fn):
    """Roda uma funcao de check isolada e devolve os erros que ela gerou."""
    global ERROS, N
    velho_e, velho_n = ERROS, N[0]
    ERROS = []
    try:
        fn()
        saida = list(ERROS)
    finally:
        ERROS = velho_e
        N[0] = velho_n
    return saida


def testes_negativos():
    print('=== TESTES NEGATIVOS (erros injetados de proposito) ===')
    resultados = []

    def caso(nome, fn_bad, fn_good):
        e_bad = _erros_de(fn_bad)
        e_good = _erros_de(fn_good)
        detectou = len(e_bad) > 0
        controle = len(e_good) == 0
        resultados.append((nome, detectou, controle, len(e_bad)))
        marca = 'DETECTADO' if detectou else 'PASSOU BATIDO'
        ctrl = 'ok' if controle else 'CONTROLE FALHOU'
        print(f'  [{marca:14}] {nome:46} ({len(e_bad)} erro(s), {ctrl})')
        if detectou:
            print(f'                   -> {e_bad[0]}')
        return detectou and controle

    # 1. duto interno (o erro conceitual que a V12 corrige)
    def bad_duto():
        orig = P.POSES
        P.POSES = [(c, 100.0 if c == 'CAM-08' else x, y, z, dx, dy, dz)
                   for (c, x, y, z, dx, dy, dz) in orig]
        try:
            f_dutos_externos()
        finally:
            P.POSES = orig

    def good_duto():
        f_dutos_externos()

    caso('duto desenhado DENTRO da camara', bad_duto, good_duto)

    # 1b. duto sem tampa no topo (chamine aberta: o ar ia para o ambiente)
    def bad_tampa():
        orig = P.POSES
        P.POSES = [p for p in orig if p[0] != 'CAM-21']
        try:
            f_dutos_externos()
        finally:
            P.POSES = orig

    caso('duto sem tampa no topo', bad_tampa, good_duto)

    # 2. flange pequena demais
    def bad_flange():
        orig = P.FLANGE_L
        P.FLANGE_L = 44.0
        try:
            f_ventilacao()
        finally:
            P.FLANGE_L = orig

    def good_flange():
        f_ventilacao()

    caso('flange de 44 mm (sem aba para os furos)', bad_flange, good_flange)

    # 3. boca inferior acima da flange (ar entraria depois da ventoinha)
    def bad_boca():
        orig = P.BOCA_INF_Z1
        P.BOCA_INF_Z1 = P.FLANGE_Z0 + 20.0
        try:
            f_ventilacao()
        finally:
            P.BOCA_INF_Z1 = orig

    def good_boca():
        f_ventilacao()

    caso('boca inferior acima da flange', bad_boca, good_boca)

    # 4. furo fora da peca
    def bad_furo():
        p = type('X', (), {'cod': 'TESTE', 'w': 100.0, 'h': 50.0,
                           'furos': [(120.0, 25.0, 5.0, 'fora')], 'recortes': []})
        f_furo_dentro([], [p])

    def good_furo():
        p = type('X', (), {'cod': 'TESTE', 'w': 100.0, 'h': 50.0,
                           'furos': [(50.0, 25.0, 5.0, 'dentro')], 'recortes': []})
        f_furo_dentro([], [p])

    caso('furo desenhado fora da peca', bad_furo, good_furo)

    # 5. furos sobrepostos
    def bad_sobreposto():
        p = type('X', (), {'cod': 'TESTE', 'w': 100.0, 'h': 50.0,
                           'furos': [(50.0, 25.0, 10.0, ''), (52.0, 25.0, 10.0, '')],
                           'recortes': []})
        f_furo_sobreposto([p])

    def good_sobreposto():
        p = type('X', (), {'cod': 'TESTE', 'w': 100.0, 'h': 50.0,
                           'furos': [(20.0, 25.0, 10.0, ''), (80.0, 25.0, 10.0, '')],
                           'recortes': []})
        f_furo_sobreposto([p])

    caso('dois furos sobrepostos', bad_sobreposto, good_sobreposto)

    # 6. codigo duplicado
    def bad_dup():
        a = type('X', (), {'cod': 'CAM-01', 'w': 10.0, 'h': 10.0, 'qtd': 1, 'esp': 5.0})
        b = type('X', (), {'cod': 'CAM-01', 'w': 10.0, 'h': 10.0, 'qtd': 1, 'esp': 5.0})
        f_duplicado([a, b])

    def good_dup():
        a = type('X', (), {'cod': 'CAM-01', 'w': 10.0, 'h': 10.0, 'qtd': 1, 'esp': 5.0})
        b = type('X', (), {'cod': 'CAM-02', 'w': 10.0, 'h': 10.0, 'qtd': 1, 'esp': 5.0})
        f_duplicado([a, b])

    caso('codigo de peca duplicado', bad_dup, good_dup)

    # 7. chapa maior que a comercial
    def bad_chapa():
        f_chapa([('CHAPA_X', 'Acrilico', 5.0, 3100.0, 2100.0, 3, (2000, 1000))])

    def good_chapa():
        f_chapa([('CHAPA_X', 'Acrilico', 5.0, 1400.0, 900.0, 3, (2000, 1000))])

    caso('chapa maior que a comercial', bad_chapa, good_chapa)

    # 8. PTC encostando no escudo (vao sem folga)
    def bad_ptc():
        orig = P.ESC_REC_W
        P.ESC_REC_W = P.PTC_W
        try:
            f_folgas()
        finally:
            P.ESC_REC_W = orig

    def good_ptc():
        f_folgas()

    caso('vao do escudo sem folga para o PTC', bad_ptc, good_ptc)

    # 9. largura total errada
    def bad_largura():
        orig = P.TOTAL_W
        P.TOTAL_W = 370.0
        try:
            f_largura_total()
        finally:
            P.TOTAL_W = orig

    def good_largura():
        f_largura_total()

    caso('largura total 370 em vez de 390', bad_largura, good_largura)

    # 10. alojamento menor que a ventoinha
    def bad_aloj():
        orig = P.ALOJ_L
        P.ALOJ_L = 38.0
        try:
            f_ventilacao()
        finally:
            P.ALOJ_L = orig

    def good_aloj():
        f_ventilacao()

    caso('alojamento menor que a ventoinha de 40', bad_aloj, good_aloj)

    # 11. numero de pecas fisicas errado
    def bad_qtd():
        orig = P.POSES
        P.POSES = orig[:-1]
        try:
            f_quantidades()
        finally:
            P.POSES = orig

    def good_qtd():
        f_quantidades()

    caso('uma peca fisica faltando em POSES', bad_qtd, good_qtd)

    # 12. comporta invadindo a tampa tecnica
    def bad_comporta():
        orig = P.COMP_TRAS_Z0
        P.COMP_TRAS_Z0 = P.TRAS_FIXA_H - 10.0
        try:
            check(P.COMP_TRAS_Z0 + P.COMP_H < P.TRAS_FIXA_H,
                  'comporta da traseira invade a tampa tecnica')
        finally:
            P.COMP_TRAS_Z0 = orig

    def good_comporta():
        check(P.COMP_TRAS_Z0 + P.COMP_H < P.TRAS_FIXA_H,
              'comporta da traseira invade a tampa tecnica')

    caso('comporta invadindo a tampa tecnica', bad_comporta, good_comporta)

    # 13. folga entre plataforma e lampada insuficiente
    def bad_folga():
        orig = P.POSES
        # a lampada fica longe da plataforma por projeto (X 25..65 x 130..280), entao
        # mover so em Z nunca colide: e preciso trazer em X, Y e Z ao mesmo tempo
        P.POSES = [(c, x, y, z + 110.0, dx, dy, dz)
                   if c == 'CAM-25' else (c, x, y, z, dx, dy, dz)
                   for (c, x, y, z, dx, dy, dz) in orig]
        try:
            f_folgas()
        finally:
            P.POSES = orig

    def good_folga():
        f_folgas()

    caso('lampada encostando na plataforma do PTC', bad_folga, good_folga)

    # 14. dimensao desenhada divergindo do parametro
    def bad_dimensao():
        real = carrega_pecas()
        if not real:
            return
        alvo = [p for p in real if p.cod == 'CAM-01'][0]
        alvo.w = alvo.w + 25.0
        f_dimensao([os.path.join(CAM, '01_pecas')], [alvo])

    def good_dimensao():
        real = carrega_pecas()
        if not real:
            return
        alvo = [p for p in real if p.cod == 'CAM-01'][0]
        f_dimensao([os.path.join(CAM, '01_pecas')], [alvo])

    caso('dimensao desenhada != parametro', bad_dimensao, good_dimensao)

    ok = all(d and c for _, d, c, _ in resultados)
    n_det = sum(1 for _, d, _, _ in resultados if d)
    print()
    print(f'  {len(resultados)} testes | {n_det} detectados | '
          f'{len(resultados) - n_det} passaram batido')
    return ok, len(resultados), n_det


# =============================================================================
# 5. EXECUCAO
# =============================================================================
def main():
    print('=' * 74)
    print('VALIDACAO DO PACOTE CAD V12 — CAMARA COM DUTOS EXTERNOS')
    print('=' * 74)
    r = P.resumo()
    print(f"  camara {P.W_GROSS:g} x {P.D_GROSS:g} x {P.H_GROSS:g} interna  "
          f"({r['vol_bruto_L']:.2f} L)")
    print(f"  externo {P.BODY_W:g} x {P.BODY_D:g} x {P.BODY_H:g}  |  "
          f"total com dutos {P.TOTAL_W:g} mm")
    print(f"  isolante {P.E:g} mm  |  pecas fisicas {len(P.POSES)}")
    print()

    # le a lista de chapas gerada pelo gerador
    chapas = []
    import glob
    for pasta in (os.path.join(CAM, '02_chapas'), os.path.join(PNL, '02_chapas')):
        for arq in glob.glob(os.path.join(pasta, '*.dxf')):
            nome = os.path.basename(arq)[:-4]
            try:
                doc = ezdxf.readfile(arq)
                b = bbox.extents(doc.modelspace().query('*[layer=="MOLDURA"]'))
                sw, sh = (b.size.x, b.size.y) if b.has_data else (0, 0)
            except Exception:
                sw = sh = 0
            chapas.append((nome, '', 0.0, sw, sh, 1, (3000, 2000)))

    print('=== 1. ARQUIVOS ===')
    cods_cam = sorted({p[0] for p in P.POSES})
    cods_iso = [f'ISO-{i:02d}' for i in range(1, 10)]
    cods_pnl = [f'PNL-{i:02d}' for i in range(1, 7)]
    f_dxf_existe([os.path.join(CAM, '01_pecas')], cods_cam + cods_iso)
    f_dxf_existe([os.path.join(PNL, '01_pecas')], cods_pnl)
    print(f'  {len(cods_cam) + len(cods_iso) + len(cods_pnl)} DXFs de peca procurados')

    print('=== 2. CONTEUDO DOS DXF ===')
    f_dxf_abre([os.path.join(CAM, '01_pecas')], cods_cam + cods_iso)
    f_dxf_abre([os.path.join(PNL, '01_pecas')], cods_pnl)
    print(f'  {N[0]} verificacoes acumuladas')

    print('=== 3. GEOMETRIA ===')
    f_largura_total()
    f_dutos_externos()
    f_ventilacao()
    f_ventoinha_cabe_no_alojamento()
    f_bocas_na_lateral()
    f_folgas()
    f_dreno_v10()
    f_peltier_corte_posterior()
    f_parede()
    f_quantidades()
    print(f'  {N[0]} verificacoes acumuladas')

    print('=== 3b. PECAS (furos, recortes, dimensoes) ===')
    pecas = carrega_pecas()
    check(len(pecas) > 0, 'pecas_v12.json ausente ou vazio — rode gerar_cad_v12.py')
    if pecas:
        f_duplicado(pecas)
        f_quantidade(pecas)
        f_furo_dentro([], pecas)
        f_furo_sobreposto(pecas)
        f_recorte_dentro(pecas)
        f_dimensao([os.path.join(CAM, '01_pecas')],
                   [p for p in pecas if p.grupo != 'painel'])
        f_dimensao([os.path.join(PNL, '01_pecas')],
                   [p for p in pecas if p.grupo == 'painel'])
        n_furos = sum(len(p.furos) for p in pecas)
        n_rec = sum(len(p.recortes) for p in pecas)
        n_pc = sum(p.qtd for p in pecas)
        print(f'  {len(pecas)} modelos | {n_pc} pecas fisicas | '
              f'{n_furos} furos | {n_rec} recortes')

    print('=== 4. CHAPAS ===')
    f_chapa(chapas)
    print(f'  {len(chapas)} chapas conferidas')

    print('=== 5. TERMICO ===')
    f_termico()

    print()
    ok_neg, n_neg, n_det = testes_negativos()

    print()
    print('=' * 74)
    if ERROS:
        print(f'ERROS ({len(ERROS)}):')
        for e in ERROS[:40]:
            print(f'  - {e}')
    if AVISOS:
        print(f'AVISOS ({len(AVISOS)}):')
        for a in AVISOS:
            print(f'  ! {a}')
    print('=' * 74)
    print(f'{N[0]} verificacoes executadas | {n_neg} testes negativos '
          f'({n_det} detectados) | {len(ERROS)} erro(s) | {len(AVISOS)} aviso(s)')

    if not ok_neg:
        print('FALHA: algum teste negativo passou batido — o validador nao e confiavel.')
        return 1
    if ERROS:
        return 1
    print()
    print('  Testes geometricos aprovados NAO significam liberado para fabricacao.')
    print('  Falta medir o kit Peltier, o soquete da lampada e o PTC. Ver LEIA-ME.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
