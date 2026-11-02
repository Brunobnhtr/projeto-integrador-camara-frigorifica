# -*- coding: utf-8 -*-
"""CAD V12 — camara 310 x 210 x 260 com DUTOS EXTERNOS. Milimetros, escala 1:1.

O que muda em relacao a V7:
  - camara interna 300 x 200 x 250 mm, 15 L; suportes atualizados
  - os dois dutos de recirculacao voltam a ser EXTERNOS: 40 x 40 colados na
    face externa de cada lateral; largura total 390 mm
  - o pe de cada duto e um ALOJAMENTO de 56 x 56 x 50: uma ventoinha de 40 mm
    nao cabe num canal de 40 x 40 com flange (os furos M3 de passo 32 ficariam
    a 2,4 mm da borda). O alojamento sobra 16 mm para fora
  - flange com abertura CIRCULAR de D36 no topo do alojamento
  - COMPORTAS de renovacao: exaustao no teto e entrada na traseira baixa,
    separadas do circuito fechado de recirculacao
  - Peltier na traseira superior, dissipador quente para FORA

Toda a geometria vem de parametros_v12.py. NAO LIBERADO PARA CORTE.
"""
from __future__ import annotations

import csv
import json
import math
import os

from cad_lib import Peca, chapa, novo_doc, rect, circ, linha, txt, poly, previa
import parametros_v12 as P

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = ROOT
CAM = os.path.join(OUT, 'camara')
PNL = os.path.join(OUT, 'painel')
for d in (CAM, PNL):
    for n in ('01_pecas', '02_chapas', '03_montagem'):
        os.makedirs(os.path.join(d, n), exist_ok=True)
os.makedirs(os.path.join(OUT, 'previas'), exist_ok=True)

A = P.ACR
E = P.E
W, D, H = P.W_GROSS, P.D_GROSS, P.H_GROSS
WN, DN, HN = P.W_NET, P.D_NET, P.H_NET

cam, pnl, iso = [], [], []


def add(seq, c, n, mat, t, w, h, q=1, **k):
    p = Peca(c, n, mat, t, w, h, qtd=q, **k)
    seq.append(p)
    return p


# =============================================================================
# CAMARA — acrilico estrutural
# =============================================================================
add(cam, 'CAM-01', 'Base', 'Acrilico cristal', A, P.BODY_W, P.BODY_D,
    obs='Face INTERNA para cima. Sem furos. O fundo do alojamento da ventoinha '
        'e uma peca propria (CAM-10).')

# ---- teto: tirantes do PTC + suportes de lampada + vao da comporta ----------
teto = [(x + A, y + A, 4.5, 'M4 tirante do PTC (M4 + tubo ceramico)')
        for (x, y) in P.rod_global()]
# V12: lampadas montadas em bandeja lateral. NENHUM furo de lampada no teto.
teto_rec = [(P.COMP_TETO_X0 + (P.COMP_QUADRO_W - P.COMP_W) / 2 + A,
             P.COMP_TETO_Y0 + (P.COMP_QUADRO_H - P.COMP_H) / 2 + A,
             P.COMP_W, P.COMP_H, 'vao da comporta de exaustao (renovacao)')]
add(cam, 'CAM-02', 'Teto', 'Acrilico cristal', A, P.BODY_W, P.BODY_D,
    furos=teto, recortes=teto_rec,
    obs='4 tirantes M4 do PTC + o vao de '
        '80 x 40 da comporta de exaustao. Fora da comporta o teto e fechado: a '
        'recirculacao nao usa o teto.')

# ---- laterais: 2 bocas cada (entrada e saida do duto externo) ---------------
bocas = [(P.DUTO_Y0 + A, P.BOCA_SUP_Z0, P.DUTO_D, 40.0,
          'BOCA SUPERIOR - saida de ar do duto')]
add(cam, 'CAM-03', 'Lateral (esquerda/direita)', 'Acrilico cristal', A,
    P.BODY_D, H, q=2, recortes=bocas,
    furos=[(y+A,z,4.5,'M4 cantoneira bandeja W5W; arruela larga / bucha') for y,z in P.lamp_wall_holes()]
        + [(P.VENT_IN_CY+A,P.VENT_IN_CZ,P.VENT_IN_ABERTURA,'passagem ar fan INTERNA -> plenum externo')]
        + [(P.VENT_IN_CY+A+dy,P.VENT_IN_CZ+dz,3.5,'M3 fan interna 40x40, gaxeta e arruela')
           for dy in (-16,16) for dz in (-16,16)],
    obs='Peca SIMETRICA: a mesma serve para os dois lados (girar 180 graus). Os '
        'um recorte SUPERIOR 40x40 e uma boca INFERIOR CIRCULAR D34: dois ventiladores de duto montados DENTRO da camara. Nada de ar '
        'ambiente entra por eles: o duto e fechado.')

# ---- traseira fixa: comporta de entrada + prensa-cabos ---------------------
# Quatro passagens de estudo; SEM FURO FINAL ate comprovar prensa-cabos.
tras_furos = []
tras_grav=[('circ',x,z,diam) for tag,x,z,diam,func in P.PASSAGENS_CAMARA_ESTUDO]
for tag,x,z,diam,func in P.PASSAGENS_CAMARA_ESTUDO:
    tras_grav.append(('txt',x, z+11,tag,4.2,'center'))
tras_rec = [(P.COMP_TRAS_X0 + (P.COMP_QUADRO_W - P.COMP_W) / 2,
             P.COMP_TRAS_Z0 + (P.COMP_QUADRO_H - P.COMP_H) / 2,
             P.COMP_W, P.COMP_H, 'vao da comporta de entrada (renovacao)')]
add(cam, 'CAM-04', 'Traseira fixa (inferior)', 'Acrilico cristal', A, W, P.TRAS_FIXA_H,
    furos=tras_furos, recortes=tras_rec, grav=tras_grav,
    obs='Parte fixa da traseira. Quatro passagens separadas P1 a P4, todas '
        'APENAS GRAVADAS, sem furo de corte. Medir prensa-cabo e diametro '
        'real de cada chicote antes de perfurar; usar multicabos e passa-muro '
        'com compressao adequada. NUNCA passar 127/220 VAC na camara.')

# A CAM-05 sera fabricada como BLANK: somente contorno na camada CORTE.
# Todos os furos (inclusive M4 da calha) sao APENAS GRAVADOS para furação posterior.
tampa_furos = []
tampa_grav_fu = [(x, z, 4.5) for x in (15, W-15)
                  for z in (15, P.TAMPA_TEC_H-15)]
tampa_grav_fu += [(W/2, 15, 4.5)]
tampa_grav_fu += [(x, P.CALHA_APOIOS_Z_FURO-P.TRAS_FIXA_H, 4.5)
                   for x in P.CALHA_APOIOS_X]

add(cam, 'CAM-05', 'Tampa tecnica removivel (kit Peltier)', 'Acrilico cristal', A,
    W, P.TAMPA_TEC_H, furos=tampa_furos,
    grav=[('circ', x, z, diam) for x,z,diam in tampa_grav_fu] + [
          ('rect', cx-P.PEL_FAN_L/2, P.PEL_FAN_CZ-P.PEL_FAN_L/2-P.TRAS_FIXA_H,
           P.PEL_FAN_L,P.PEL_FAN_L) for cx in P.PEL_FAN_CX] + [
          ('lin',P.PEL_FAN_CX[0],P.PEL_FAN_CZ-P.TRAS_FIXA_H,
                 P.PEL_FAN_CX[1],P.PEL_FAN_CZ-P.TRAS_FIXA_H),
          ('txt',W/2,P.PEL_FAN_CZ-P.TRAS_FIXA_H-25,'PASSO 50 REF - NAO FURAR',4.3,'center')
          ] + [('rect', P.PEL_X0, P.PEL_Z0 - P.TRAS_FIXA_H,
           P.PEL_ABERTURA_W, P.PEL_ABERTURA_H),
          ('txt', W / 2, 34, 'KIT DUPLO 2 TEC', 6, 'center'),
          ('txt', W / 2, 22, 'PEL: NAO RECORTAR AINDA', 5, 'center'),
          ('circ', P.DRENO_X, P.DRENO_Z_PAREDE-P.TRAS_FIXA_H,
           P.DRENO_DIAMETRO_REFERENCIA),
          ('txt', W-75, 8, 'DRENO: GRAVACAO', 4.0, 'center')],
    obs='PLACA REMOVIVEL SEM CORTE DO PELTIER. O retangulo de 110x75 e so referencia, NAO '
        'recorte. O circulo D12 do dreno tambem e APENAS GRAVACAO: medir o adaptador '
        'passa-parede e validar vedacao antes de cortar. Fixacoes M4 dos suportes '
        'CAM-22 SO EM GRAVACAO. Nenhum furo na tampa ate medir kit e mangueira. Nao cortar '
        'o vao do kit: a medida do conjunto montado nao foi confirmada.')

add(cam, 'CAM-06', 'Batente de vedacao (moldura interna)', 'Acrilico branco', P.BATENTE_T,
    P.PORTA_W, P.PORTA_H,
    recortes=[(P.BATENTE_W, P.BATENTE_D, P.PORTA_W - 2 * P.BATENTE_W,
               P.PORTA_H - 2 * P.BATENTE_D, 'vazio onde o vidro encosta')],
    obs='Moldura de 15 mm colada na face interna do vao, em Y 0..3. E a face onde o '
        'EPDM e comprimido pela porta. Fica DENTRO da cavidade, por isso a '
        'profundidade externa fecha em 260 mm sem sobra.')

add(cam, 'CAM-07', 'Porta (vidro unico 5 mm)', 'Acrilico cristal', A,
    P.PORTA_W, P.PORTA_H,
    obs='Recessada em Y -5..0, rente a face frontal: 260 mm de profundidade total. '
        'Dobradica e trinco furados na montagem. Unico vidro de 5 mm (a V7 usava '
        'duplo); o isolante ISO-05 vai na face interna.')

# =============================================================================
# DUTOS EXTERNOS — 3 paineis por duto, todos iguais
# =============================================================================
add(cam, 'CAM-08', 'Painel do duto externo', 'Acrilico cristal', A,
    P.DUTO_W, P.DUTO_H, q=6,
    grav=[('seta', P.DUTO_W / 2, P.DUTO_H - 25, 16),
          ('txt', P.DUTO_W / 2, 12, 'TOPO', 4, 'center')],
    obs='3 paineis por duto x 2 dutos = 6 pecas IGUAIS (a quarta face do canal e a '
        'propria lateral da camara). Colados: face externa, face frontal e face '
        'traseira. A seta marca o TOPO — nao inverter.')

add(cam, 'CAM-09', 'Painel do alojamento da ventoinha', 'Acrilico cristal', A,
    P.ALOJ_L, P.FLANGE_Z0, q=6,
    obs='3 paineis por alojamento x 2 = 6 pecas iguais, de 56 x 47. Sao as paredes '
        'do pe do duto. A ventoinha 40x40x10 fica inteiramente no alojamento em Z36..46; flange CAM-11 por cima. Fundo removivel para manutencao: conferir parafusos.')

add(cam, 'CAM-21', 'Tampa do duto (topo)', 'Acrilico cristal', P.CAP_DUTO_T,
    P.DUTO_W, P.DUTO_D, q=2,
    obs='Fecha o TOPO de cada canal, rente com a face externa do '
        'teto. Sem esta peca o duto e uma chamine aberta: a ventoinha empurra o ar '
        'para o ambiente em vez de devolve-lo a camara pela boca superior.')
add(cam, 'CAM-10', 'Fundo do alojamento', 'Acrilico cristal', A, P.ALOJ_L, P.ALOJ_L,
    q=2, obs='Fecha o plenum externo por baixo. PREVER ACESSO REMOVIVEL para limpeza; furos de fecho nao autorizados sem ferragens. O ar vem da boca circular inferior da '
             'lateral, nao do ambiente.')

fx = P.FLANGE_L / 2
vent_furos = [(fx, fx, P.VENT_ABERTURA, 'abertura de ar CIRCULAR - passagem livre')]
add(cam, 'CAM-11', 'Placa de transicao do plenum para duto', 'Aluminio', P.FLANGE_T,
    P.FLANGE_L, P.FLANGE_L, 2, furos=vent_furos,
    obs='A abertura de ar e CIRCULAR (D36), nao quadrada: num quadrado de 32 x 32 os '
        'furos seriam incompatíveis com o vao. As fans agora ficam na parede interna. '
        'a boca superior e aberta para o duto de 40mm. Fecha o '
        'alojamento de 56 x 56 por cima.')

# =============================================================================
# CONJUNTO DO PTC — pendurado no teto
# =============================================================================
add(cam, 'CAM-12', 'Base superior removivel do PTC', 'Acrilico cristal', P.PLAT_T, P.PLAT_W, P.PLAT_D,
    furos=[(x-P.PLAT_X0,y-P.PLAT_Y0,P.ROD_D,'M4 atraves das 4 pilhas CAM-23 e teto')
           for x,y in P.rod_global()],
    obs='Base 230x120x5 mm SUSPENSA na parte superior, nao no piso. Apoiada por 4 blocos '
        'CAM-23 (25x25x20mm, 4 laminas de 5mm cada), com M4 atravessando as pilhas. '
        'O PTC permanece em suporte metalico 25mm abaixo, soprando PARA BAIXO. '
        'Afastar o conjunto do isolamento e validar temperatura com sensor e corte independente.')

add(cam, 'CAM-13', 'Suporte metalico do PTC', 'Aluminio', P.SUP_T, P.SUP_W, P.SUP_D,
    furos=[(17, 17, P.ROD_D, 'M4 tirante'), (143, 17, P.ROD_D, 'M4 tirante'),
           (17, 73, P.ROD_D, 'M4 tirante'), (143, 73, P.ROD_D, 'M4 tirante'),
           (P.GRAMP_X0[0] - P.SUP_X0, P.GRAMP_FURO_Y[0] - P.SUP_Y0, 4.5,
            'M4 grampo do PTC - frente'),
           (P.GRAMP_X0[0] - P.SUP_X0, P.GRAMP_FURO_Y[1] - P.SUP_Y0, 4.5,
            'M4 grampo do PTC - tras'),
           (P.GRAMP_X0[1] - P.SUP_X0, P.GRAMP_FURO_Y[0] - P.SUP_Y0, 4.5,
            'M4 grampo do PTC - frente'),
           (P.GRAMP_X0[1] - P.SUP_X0, P.GRAMP_FURO_Y[1] - P.SUP_Y0, 4.5,
            'M4 grampo do PTC - tras')],
    grav=[('rect', P.PTC_X0 - P.SUP_X0, P.PTC_Y0 - P.SUP_Y0, P.PTC_W, P.PTC_D),
          ('txt', P.SUP_W / 2, 14, 'PTC 110x30 - SEM FURO', 4.5, 'center')],
    obs='O PTC encosta por CIMA nesta chapa e sopra para baixo. Os 4 furos D5 sao os '
        'tirantes que vem do teto; os 4 D4,5 sao dos grampos.')

add(cam, 'CAM-14', 'Escudo / defletor do PTC', 'Aluminio', P.ESC_T, P.ESC_W, P.ESC_D,
    recortes=[(P.ESC_REC_X - P.ESC_X0, P.ESC_REC_Y - P.ESC_Y0, P.ESC_REC_W, P.ESC_REC_H,
               'vao do PTC - o corpo passa por aqui')],
    furos=[(27, 17, P.ROD_D, 'M4 tirante'), (153, 17, P.ROD_D, 'M4 tirante'),
           (27, 73, P.ROD_D, 'M4 tirante'), (153, 73, P.ROD_D, 'M4 tirante')],
    obs='Fica 12 mm abaixo do suporte, no MESMO padrao de tirantes. O vao de 114 x 34 '
        'deixa o PTC atravessar com 2 mm de folga por lado. E o escudo que impede o '
        'isopor e o acrilico de receberem radiacao direta.')

# CAM-15 da V11 era suporte de lampada no teto: RETIRADO na V12.
# Nao reciclar CAM-15: a nova bandeja e CAM-25 e as cantoneiras CAM-24.

add(cam, 'CAM-16', 'Grampo do PTC', 'Inox', P.GRAMP_T, P.GRAMP_W, P.GRAMP_D, 2,
    furos=[(P.GRAMP_W / 2, P.GRAMP_FURO_Y[0] - P.GRAMP_Y0, 4.5, 'M4 no suporte'),
           (P.GRAMP_W / 2, P.GRAMP_FURO_Y[1] - P.GRAMP_Y0, 4.5, 'M4 no suporte')],
    obs='Prensa o PTC contra o suporte. Inox de 1 mm e largura de 12 mm de proposito: '
        'o grampo e uma ponte termica entre a face quente e o suporte, e a secao '
        'pequena mantem essa ponte abaixo de 2 W.')

add(cam, 'CAM-17', 'Coletor condensado inox dobrado e selado', 'Inox', P.CALHA_T,
    P.CALHA_W, P.CALHA_D,
    # Contorno UNICO com os quatro cantos aliviados: sem linhas de corte sobrepostas.
    contorno=[(P.CALHA_ABA_MM, 0), (P.CALHA_W-P.CALHA_ABA_MM, 0),
              (P.CALHA_W-P.CALHA_ABA_MM, P.CALHA_ABA_MM),
              (P.CALHA_W, P.CALHA_ABA_MM),
              (P.CALHA_W, P.CALHA_D-P.CALHA_ABA_MM),
              (P.CALHA_W-P.CALHA_ABA_MM, P.CALHA_D-P.CALHA_ABA_MM),
              (P.CALHA_W-P.CALHA_ABA_MM, P.CALHA_D),
              (P.CALHA_ABA_MM, P.CALHA_D),
              (P.CALHA_ABA_MM, P.CALHA_D-P.CALHA_ABA_MM),
              (0, P.CALHA_D-P.CALHA_ABA_MM),
              (0, P.CALHA_ABA_MM), (P.CALHA_ABA_MM, P.CALHA_ABA_MM)],
    grav=[('rect', P.CALHA_ABA_MM, P.CALHA_ABA_MM,
           P.CALHA_W-2*P.CALHA_ABA_MM, P.CALHA_D-2*P.CALHA_ABA_MM),
          ('circ', P.DRENO_X-P.CALHA_X0, P.DRENO_Y-P.CALHA_Y0,
           P.DRENO_MANGUEIRA_REFERENCIA),
          ('txt', 90, 26, 'DOBRAR 4 ABAS 8mm + SELAR CANTOS', 4.0, 'center')],
    obs=f'BLANK DE INOX 1mm {P.CALHA_W:g}x{P.CALHA_D:g}, alivios de canto 8x8; abas de dobra. SOLDA '
        'ESTANQUE em todos os cantos antes de usar. Base inclinada com queda '
        'longitudinal 2mm (esquerda -> direita) e transversal 1,5mm (frente -> tras). '
        'O ponto de dreno D8 so GRAVADO; nao furar sem medir espigao e conexao. '
        f'MONTAR Z{P.CALHA_Z:g}, X{P.CALHA_X0:g}..{P.CALHA_X0+P.CALHA_W:g}, Y{P.CALHA_Y0:g}..{P.CALHA_Y0+P.CALHA_D:g}; cobrir '
        'toda a projecao fria com juncao vedada na traseira; teste de agua obrigatorio.')
add(cam, 'CAM-22', 'Cantoneira cantilever de apoio calha 90 graus', 'Aluminio',
    P.CALHA_SUP_T, P.CALHA_SUP_W, P.CALHA_SUP_D, 2,
    furos=[(12, P.CALHA_SUP_D/2, 4.5, 'M4 na tampa tecnica CAM-05')],
    grav=[('lin', P.CALHA_SUP_DOBRA, 0, P.CALHA_SUP_DOBRA, P.CALHA_SUP_D),
          ('txt', 71, 15, 'ABA SOB CALHA - SEM FURO', 4.0, 'center')],
    obs='DOBRAR 90 graus x35: perna de parede 35mm, prateleira 75mm. '
        'Fixar com 1x M4 nos centros parametrizados da CAM-05; ficam fora do envelope '
        'provisorio do Peltier. Apoiam a calha SEM perfurar o piso. '
        'Usar calcos metalicos inclinados e travamento removivel. '
        'Aba/grau e resistencia do apoio exigem prototipo. Nao liberar para corte final.')

# =============================================================================
# SUPORTES FISICOS V12: PTC E DUAS LAMPADAS
# =============================================================================
add(cam,'CAM-23','Lamina 25x25x5 - 4 blocos para base superior PTC','Acrilico cristal',
    P.PTC_BLOCO_T,P.PTC_BLOCO_L,P.PTC_BLOCO_L,P.PTC_BLOCO_QTD,
    furos=[(P.PTC_BLOCO_L/2,P.PTC_BLOCO_L/2,5.0,'M4 tirante na pilha')],
    obs='16 laminas formam 4 blocos de 25x25x20. Empilhar 4 laminas por bloco; '
        'fixacao mecanica com M4/arruelas, nunca confiar somente na cola. '
        'Blocos entre teto e CAM-12, passando pela camada ISO-02 com mangas/recortes localizados. '
        'Pendente verificar efeito da temperatura do PTC no acrilico.')
add(cam,'CAM-24','Cantoneira W5W dobrada 90 graus - 4 unidades','Aluminio',
    P.LAMP_L_T,P.LAMP_L_W,P.LAMP_L_D,4,
    furos=[(12,6.5,4.5,'M4 parede 1'),(12,18.5,4.5,'M4 parede 2'),
           (P.LAMP_L_DOBRA+P.LAMP_L_ALCANCE_FURO,P.LAMP_L_D/2,4.5,'M4 bandeja')],
    grav=[('lin',P.LAMP_L_DOBRA,0,P.LAMP_L_DOBRA,P.LAMP_L_D),
          ('txt',45,21,'DOBRA 90 - verificar raio',3.8,'center')],
    obs='Chapa plana 90x25x2, dobra a 25: aba vertical 25 e horizontal 65 mm. '
        'Montagem espelhada L/R, 2 cantoneiras por lado. Dois M4 na parede e '
        'um M4 na bandeja. Conferir recuo em face do isolamento e raio de dobra; '
        'nao considerar geometrias de chapa plana como folga fisica aprovada.')
add(cam,'CAM-25','Bandeja removivel para duas lampadas W5W','Aluminio',
    P.LAMP_T,P.LAMP_BANDEJA_W,P.LAMP_BANDEJA_D,
    furos=[(x,y,4.5,'M4 cantoneira CAM-24') for x,y in P.LAMP_BANDEJA_FUROS],
    recortes=[(x,y,P.LAMP_SLOT_W,P.LAMP_SLOT_H,'rasgo ajuste adaptador soquete')
              for x,y in P.LAMP_SLOTS],
    grav=[('circ',cx-P.LAMP_BANDEJA_X0,P.LAMP_BANDEJA_D/2,P.LAMP_SOQ_D)
          for cx in P.LAMP_CENTROS_X] +
         [('txt',P.LAMP_BANDEJA_W/2,68,'SOQUETES: SOMENTE GRAVACAO',5.2,'center')],
    obs='Bandeja 210x90x2 em Z110, 4 M4 de sustentacao mais 4 rasgos genericos 20x4 '
        'para suporte ADAPTADOR de soquete, sem recortar alojamento circular do soquete '
        '(D20 somente gravado). Duas lampadas 12V/5W com alimentacao e medicao separadas. '
        'Confirmar tipo e fixacao do soquete, radios dos rasgos e distancia de fios quentes; '
        'bandeja mantida removivel e ventilada.')

# =============================================================================
# COMPORTAS DE RENOVACAO — guilhotina
# =============================================================================
add(cam, 'CAM-18', 'Quadro da comporta', 'Acrilico cristal', P.COMP_QUADRO_T,
    P.COMP_QUADRO_W, P.COMP_QUADRO_H, 2,
    recortes=[((P.COMP_QUADRO_W - P.COMP_W) / 2, (P.COMP_QUADRO_H - P.COMP_H) / 2,
               P.COMP_W, P.COMP_H, 'vao livre da comporta')],
    obs='Colado por FORA do vao do teto (exaustao) e da traseira (entrada). O EPDM de '
        'vedacao vai na face que encosta no acrilico.')

add(cam, 'CAM-19', 'Lamina da comporta', 'Acrilico cristal', P.COMP_LAMINA_T,
    P.COMP_LAMINA_W, P.COMP_H, 2,
    grav=[('txt', P.COMP_LAMINA_W / 2, P.COMP_H / 2, 'PUXAR', 6, 'center')],
    obs='Desliza entre as duas guias CAM-20. Fecha o vao de 80 x 40. Aberta so no '
        'modo de renovacao; fechada, a camara volta a ser um circuito fechado.')

add(cam, 'CAM-20', 'Guia da comporta', 'Acrilico cristal', P.COMP_GUIA_T,
    P.COMP_GUIA_W, P.COMP_GUIA_H, 4,
    obs='2 guias por comporta, coladas no quadro, formando a canaleta da lamina.')

# =============================================================================
# ISOLAMENTO — camada independente, parametrica
# =============================================================================
MAT_ISO = 'Isopor EPS'


def iso_add(cod, nome, w, h, q=1, **k):
    return add(iso, cod, nome, MAT_ISO, E, w, h, q, **k)


iso_add('ISO-01', 'Isolamento do fundo', WN, DN,
        obs='Fundo INTEIRO. A V8 previa um furo de dreno incorreto no piso: REMOVIDO. '
            'Condensado sai na parte ALTA da traseira, sob o Peltier.')
iso_add('ISO-02', 'Isolamento do teto', WN, DN,
        recortes=[(P.COMP_TETO_X0 + (P.COMP_QUADRO_W - P.COMP_W) / 2 - E,
                   P.COMP_TETO_Y0 + (P.COMP_QUADRO_H - P.COMP_H) / 2 - E,
                   P.COMP_W, P.COMP_H, 'vao da comporta de exaustao')],
        furos=[(x - E, y - E, 6, 'passagem do tirante M4') for (x, y) in P.rod_global()]
,
        obs='Os tirantes M4 e as 4 pilhas CAM-23 precisam de isolamento recortado/vedado, '
            'so furo passante de referencia. A comporta deve ficar livre.')
iso_add('ISO-03', 'Isolamento lateral', DN, HN, 2,
        furos=[(y-E,z-E,7.0,'M4 da cantoneira CAM-24, com manga de protecao') for y,z in P.lamp_wall_holes()]
              +[(P.VENT_IN_CY-E,P.VENT_IN_CZ-E,P.VENT_IN_ABERTURA+2*E,
                 'boca da ventoinha INTERNA')]
              +[(P.VENT_IN_CY+dy-E,P.VENT_IN_CZ+dz-E,5.0,'fixacao M3 fan interna')
                 for dy in (-16,16) for dz in (-16,16)],
        recortes=[(P.DUTO_Y0 - E, P.BOCA_SUP_Z0 - E, P.DUTO_D + 2 * E, 40.0 + 2 * E,
                   'boca superior do duto')],
        obs='Face interna das duas laterais. Os dois recortes de 42 x 42 sao as bocas '
            'do duto: o isolante nao pode fechar a passagem de ar.')
iso_add('ISO-04', 'Isolamento traseiro FIXO (inferior)', WN,
        P.TRAS_FIXA_H-E,
        recortes=[(P.COMP_TRAS_X0 + (P.COMP_QUADRO_W - P.COMP_W)/2 - E,
                   P.COMP_TRAS_Z0 + (P.COMP_QUADRO_H-P.COMP_H)/2 - E,
                   P.COMP_W, P.COMP_H, 'comporta de renovacao inferior')],
        grav=[('circ',x-E,z,d) for tag,x,z,d,func in P.PASSAGENS_CAMARA_ESTUDO],
        obs='Somente a traseira fixa. P1..P4 APENAS GRAVADOS, SEM FURO; '
            'repetir as passagens da CAM-04 DEPOIS de medir prensa-cabos; '
            'ISO-09 acompanha a tampa removivel.')
iso_add('ISO-09', 'Isolamento da tampa tecnica REMOVIVEL', WN,
        P.TAMPA_TEC_H-E,
        grav=[('rect', P.PEL_X0-E, P.PEL_Z0-P.TRAS_FIXA_H,
               P.PEL_ABERTURA_W, P.PEL_ABERTURA_H),
              ('circ', P.DRENO_X-E, P.DRENO_Z_PAREDE-P.TRAS_FIXA_H,
               P.DRENO_DIAMETRO_REFERENCIA)],
        furos=[],
        obs='Isolamento independente e removivel junto da CAM-05. '
            'Abertura do kit e passagem da mangueira em GRAVACAO apenas. '
            'Aguardar medidas do kit e do passa-parede antes de recortar.')
iso_add('ISO-05', 'Isolamento da porta', P.PORTA_W - 2 * P.BATENTE_W,
        P.PORTA_H - 2 * P.BATENTE_D,
        obs='Colado na face interna do vidro, dentro do vao do batente. '
            'Nao pode impedir a compressao do EPDM: fica 15 mm afastado da borda.')

# isolamento dos dutos externos: o usuario pediu canais isolados
iso_add('ISO-06', 'Isolamento do painel do duto', P.DUTO_W, P.DUTO_H, 6,
        obs='Colado na face EXTERNA dos 6 paineis CAM-08. Sem isolante o duto externo '
            'troca calor com o ambiente ao longo do seu comprimento.')
iso_add('ISO-07', 'Isolamento do alojamento', P.ALOJ_L, P.FLANGE_Z0, 6,
        obs='Face externa dos 6 paineis CAM-09.')
iso_add('ISO-08', 'Isolamento do fundo do alojamento', P.ALOJ_L, P.ALOJ_L, 2,
        obs='Sob a CAM-10. Fecha o pe do duto termicamente.')

# =============================================================================
# PAINEL — mantido da V6, inalterado
# =============================================================================
bph = []
for y in P.RAILS:
    for x in (85, 215, 345, 475, 515):
        bph.append((x, y, 5, 'M5 eixo do trilho DIN - conferir com o suporte comprado'))
for y in P.H_DUCTS:
    for x in (90, 270, 450):
        bph.append((x, y, 4, 'furo canaleta horizontal'))
for x in P.V_DUCT_X:
    for y in (110, 300, 490, 680):
        bph.append((x, y, 4, 'furo canaleta vertical'))
grav_p = []
# Reservas de montagem dos equipamentos (apenas gravacao, conferir fabricante)
componentes = {
  655:[('BD-POT',36),('BD-AUX',36),('BD-24V',45),('BD-5V',65),('BD-0V',70),('KM1',34)],
  485:[('BTS1',50),('BTS2',50),('K-INTERTR',38),('F-P',36),('ESP32',70)],
  315:[('MEGA',134),('ACS-L1',40),('ACS-L2',40),('RTC',50)],
  145:[('TB-CAMARA',110),('TB-SINAL',105),('EXPANSAO',105)]
}
for yy,pecas in componentes.items():
    xx=78.0
    for nm,ww in pecas:
        grav_p.extend([('rect',xx,yy-23,ww,46),('txt',xx+ww/2,yy,nm,5.5,'center')]); xx+=ww+5
for y in P.RAILS:
    grav_p.append(('lin', 75, y, 525, y))
for y in P.H_DUCTS:
    grav_p.append(('rect', 65, y - 15, 470, 30))
for x in P.V_DUCT_X:
    grav_p.append(('rect', x - 15, 95, 30, 615))

add(pnl, 'PNL-01', 'Fundo do painel', 'MDF', P.MDF, P.P_W, P.P_H, furos=bph, grav=grav_p,
    obs='Fundo do painel eletrico. Layout de furos INALTERADO em relacao a V6.')
add(pnl, 'PNL-02', 'Lateral esquerda', 'MDF', P.MDF, P.P_D, P.P_H)
add(pnl, 'PNL-03', 'Lateral direita', 'MDF', P.MDF, P.P_D, P.P_H)
add(pnl, 'PNL-04', 'Tampa superior', 'MDF', P.MDF, P.P_W, P.P_D)
# Base do painel com rotas de cabos; centros gravados, SEM FUROS para PG.
pnl_base_grav = [('circ',x,y,d) for tag,x,y,d,func in P.PASSAGENS_PAINEL_ESTUDO]
pnl_base_grav += [('txt',x,y+18,tag,5,'center') for tag,x,y,d,func in P.PASSAGENS_PAINEL_ESTUDO]
add(pnl, 'PNL-05', 'Tampa inferior - prensa cabos projetados', 'MDF', P.MDF, P.P_W, P.P_D,
    grav=pnl_base_grav,
    obs='G1 rede AC separada fisicamente de G2..G6 DC e sinais; PG apenas GRAVADOS. '
        'Prensa cabos reais e ferragens determinaram furos finais. Colocar borne de PE e protecao.')
porta_grav=[('rect',215,590,160,90),('txt',295,705,'IHM - MEDIR',8,'center')]
for x,name in [(90,'LIGAR'),(200,'RESFRIAR'),(310,'AQUECER'),(425,'FALHA')]:
    porta_grav.extend([('circ',x,435,22),('txt',x,470,name,6,'center')])
porta_grav.extend([('circ',100,280,22),('txt',100,315,'STOP - VERIFICAR',5.5,'center')])
add(pnl, 'PNL-06', 'Porta do painel - layout de botoes em estudo', 'MDF', P.MDF, P.P_W - 4, P.P_H - 4,
    grav=porta_grav,
    obs='Layout de IHM e botoes somente GRAVADO. Conferir fichas tecnicas, '
        'profundidade atras da porta e seguranca do botao de parada; nao furar ainda.')

# =============================================================================
# EXPORTA AS PECAS — o validador le este arquivo e confere peca por peca
# =============================================================================
def _dump(p):
    return {
        'cod': p.cod, 'nome': p.nome, 'material': p.material, 'esp': p.esp,
        'w': p.w, 'h': p.h, 'qtd': p.qtd,
        'furos': [list(f) for f in p.furos],
        'recortes': [list(r) for r in p.recortes],
        'contorno': [list(pt) for pt in p.contorno] if p.contorno else None,
        'grupo': ('camara' if p in cam else 'isolamento' if p in iso else 'painel'),
    }


with open(os.path.join(OUT, 'pecas_v12.json'), 'w', encoding='utf-8') as f:
    json.dump([_dump(p) for p in cam + iso + pnl], f, indent=1, ensure_ascii=False)
print(f'  pecas_v12.json: {len(cam) + len(iso) + len(pnl)} modelos exportados')

# =============================================================================
# DXF DE PECA
# =============================================================================
def dxf_peca(p, pasta):
    doc = novo_doc()
    msp = doc.modelspace()
    p.desenha(msp, 0, 0, cotas=True, rotulo=False, cod_na_peca=True)
    for i, s in enumerate(p.linhas_ficha()):
        txt(msp, 0, -46 - i * 7, s, 5.5 if i else 7.5, 'TEXTO', 'left')
    doc.saveas(os.path.join(pasta, f'{p.cod}.dxf'))


print('=== DXF DE PECA ===')
for p in cam:
    dxf_peca(p, os.path.join(CAM, '01_pecas'))
for p in iso:
    dxf_peca(p, os.path.join(CAM, '01_pecas'))
for p in pnl:
    dxf_peca(p, os.path.join(PNL, '01_pecas'))
print(f'  camara {len(cam)} modelos | isolamento {len(iso)} | painel {len(pnl)}')

# =============================================================================
# DXF DE CHAPA
# =============================================================================
print('=== DXF DE CHAPA ===')
grupos = {}
for p in cam + iso + pnl:
    grupos.setdefault((p.material, p.esp), []).append(p)

CHAPA_PADRAO = {
    ('Acrilico cristal', 5.0): (2000, 1000),
    ('Acrilico cristal', 2.0): (2000, 1000),
    ('Acrilico cristal', 3.0): (2000, 1000),
    ('Acrilico branco', 3.0): (2000, 1000),
    ('Aluminio', 1.0): (2000, 1000),
    ('Aluminio', 2.0): (2000, 1000),
    ('Aluminio', 3.0): (2000, 1000),
    ('Inox', 1.0): (2000, 1000),
    ('Isopor EPS', 1.0): (2000, 1000),
    ('MDF', 15.0): (2750, 1850),
}

chapas_info = []
for (mat, esp), pecas in sorted(grupos.items()):
    nome = f"CHAPA_{mat.lower().replace(' ', '_')}_{esp:g}mm"
    pasta = os.path.join(CAM if mat != 'MDF' else PNL, '02_chapas')
    sub = (f'camara {P.BODY_W:g}x{P.BODY_D:g}x{P.BODY_H:g} + dutos 40x40 | '
           f'{sum(p.qtd for p in pecas)} pecas | escala 1:1 mm')
    pos, (sw, sh) = chapa(pecas, f'CHAPA {mat.upper()} {esp:g} mm', sub,
                          os.path.join(pasta, f'{nome}.dxf'),
                          chapa_padrao=CHAPA_PADRAO.get((mat, esp)))
    chapas_info.append((nome, mat, esp, sw, sh, sum(p.qtd for p in pecas)))
    print(f'  {nome:42} {sw:6.0f} x {sh:5.0f} mm  {sum(p.qtd for p in pecas):3d} pecas')

# =============================================================================
# LISTA DE CORTE
# =============================================================================
with open(os.path.join(OUT, 'lista_corte_camara.csv'), 'w', newline='',
          encoding='utf-8-sig') as f:
    w_ = csv.writer(f, delimiter=';')
    w_.writerow(['codigo', 'nome', 'material', 'esp_mm', 'larg_mm', 'alt_mm',
                 'qtd', 'area_m2', 'furos', 'recortes', 'obs'])
    for p in cam + iso:
        w_.writerow([p.cod, p.nome, p.material, f'{p.esp:g}', f'{p.w:g}', f'{p.h:g}',
                     p.qtd, f'{p.area_m2 * p.qtd:.4f}', len(p.furos), len(p.recortes),
                     p.obs])

with open(os.path.join(OUT, 'lista_corte_painel.csv'), 'w', newline='',
          encoding='utf-8-sig') as f:
    w_ = csv.writer(f, delimiter=';')
    w_.writerow(['codigo', 'nome', 'material', 'esp_mm', 'larg_mm', 'alt_mm', 'qtd'])
    for p in pnl:
        w_.writerow([p.cod, p.nome, p.material, f'{p.esp:g}', f'{p.w:g}', f'{p.h:g}', p.qtd])

print(f'  lista_corte_camara.csv: {len(cam) + len(iso)} linhas')
print(f'  lista_corte_painel.csv: {len(pnl)} linhas')

# =============================================================================
# DESENHOS DE MONTAGEM — projecao a partir de POSES (lista completa)
# =============================================================================
def vista(msp, ox, oy, eixo, K=1.0, rotulo=False, so=None, layer='CORTE'):
    """Projeta TODAS as colocacoes de POSES.

    eixo='XZ' -> u = X, v = Z   (frente / tras)
    eixo='YZ' -> u = Y, v = Z   (lateral)
    eixo='XY' -> u = X, v = Y   (planta)
    """
    for (cod, x0, y0, z0, dx, dy, dz) in P.POSES:
        if so and cod not in so:
            continue
        if eixo == 'XZ':
            u0, v0, du, dv = x0, z0, dx, dz
        elif eixo == 'YZ':
            u0, v0, du, dv = y0, z0, dy, dz
        else:
            u0, v0, du, dv = x0, y0, dx, dy
        rect(msp, ox + u0 * K, oy + v0 * K, du * K, dv * K, layer)
        if rotulo:
            txt(msp, ox + (u0 + du / 2) * K, oy + (v0 + dv / 2) * K, cod, 5,
                'TEXTO', 'center')


def refs(msp, ox, oy, eixo, K=1.0):
    """Componentes COMPRADOS em linha de referencia (nao sao peca de corte)."""
    # 2 ventoinhas 40x40x10 dentro dos alojamentos
    for sinal in (-1, 1):
        x = -P.DUTO_X_OUT - (P.ALOJ_L - P.DUTO_W) if sinal < 0 else P.W_GROSS
        x = x + (P.ALOJ_L - P.DUTO_W) / 2
        y = P.ALOJ_Y0 + (P.ALOJ_L - P.VENT_D) / 2
        if eixo == 'XZ':
            rect(msp, ox + x * K, oy + P.VENT_Z0 * K, P.VENT_D * K, P.VENT_H * K, 'REF')
        elif eixo == 'YZ':
            rect(msp, ox + y * K, oy + P.VENT_Z0 * K, P.VENT_D * K, P.VENT_H * K, 'REF')
        else:
            rect(msp, ox + x * K, oy + y * K, P.VENT_D * K, P.VENT_D * K, 'REF')
    # dissipador frio (dentro) e quente (fora), 110 x 45 x 75
    if eixo == 'YZ':
        rect(msp, ox + (P.PEL_Z0 * 0 + (P.D_GROSS - P.PEL_SALIENCIA)) * K,
             oy + P.PEL_Z0 * K, P.PEL_SALIENCIA * K, P.PEL_ABERTURA_H * K, 'REF')
        rect(msp, ox + P.D_GROSS * K, oy + P.PEL_Z0 * K,
             P.PEL_SALIENCIA * K, P.PEL_ABERTURA_H * K, 'REF')
    elif eixo == 'XZ':
        rect(msp, ox + P.PEL_X0 * K, oy + P.PEL_Z0 * K,
             P.PEL_ABERTURA_W * K, P.PEL_ABERTURA_H * K, 'REF')


def caixa_iso(msp, ox, oy, x0, y0, z0, dx, dy, dz, K=1.0, layer='CORTE'):
    a = math.radians(30)

    def p(x, y, z):
        return (ox + (x - y) * math.cos(a) * K,
                oy + ((x + y) * math.sin(a) * 0.5 + z) * K)

    poly(msp, [p(x0, y0, z0 + dz), p(x0 + dx, y0, z0 + dz),
               p(x0 + dx, y0 + dy, z0 + dz), p(x0, y0 + dy, z0 + dz)], layer)
    poly(msp, [p(x0, y0, z0), p(x0 + dx, y0, z0),
               p(x0 + dx, y0, z0 + dz), p(x0, y0, z0 + dz)], layer)
    poly(msp, [p(x0 + dx, y0, z0), p(x0 + dx, y0 + dy, z0),
               p(x0 + dx, y0 + dy, z0 + dz), p(x0 + dx, y0, z0 + dz)], layer)


def novo_desenho(titulo, sub, w=820, h=620, esc='1:1'):
    doc = novo_doc()
    msp = doc.modelspace()
    rect(msp, 0, 0, w, h, 'MOLDURA')
    txt(msp, 12, h - 18, titulo, 11, 'TEXTO', 'left')
    txt(msp, 12, h - 34, sub, 6.5, 'TEXTO', 'left')
    txt(msp, w - 12, h - 18, f'escala {esc} · mm · NAO CORTAR', 6, 'TEXTO', 'right')
    return doc, msp


MONT = os.path.join(CAM, '03_montagem')
K_ISO = 0.58     # a isometrica do conjunto nao cabe 1:1 na moldura
desenhos = []


def salva(doc, nome, tam=(14.5, 10.5)):
    p = os.path.join(MONT, f'{nome}.dxf')
    doc.saveas(p)
    desenhos.append(nome)
    previa(p, os.path.join(OUT, 'previas', f'{nome}.png'), dpi=150, tamanho=tam)
    return p


def seta_v(msp, x, y1, y2, layer='GRAVACAO'):
    linha(msp, x, y1, x, y2, layer)
    d = 6 if y2 > y1 else -6
    linha(msp, x, y2, x - 4, y2 - d, layer)
    linha(msp, x, y2, x + 4, y2 - d, layer)


def seta_h(msp, x1, x2, y, layer='GRAVACAO'):
    linha(msp, x1, y, x2, y, layer)
    d = 6 if x2 > x1 else -6
    linha(msp, x2, y, x2 - d, y - 4, layer)
    linha(msp, x2, y, x2 - d, y + 4, layer)


# --- 1. frente ---------------------------------------------------------------
doc, msp = novo_desenho('CAMARA V12 — VISTA FRONTAL (porta removida)',
                        'Dutos externos 40 x 40 nas duas laterais | largura total 390 mm')
vista(msp, 90, 100, 'XZ')
refs(msp, 90, 100, 'XZ')
txt(msp, 90 + P.W_GROSS/2, 70, f'{P.W_GROSS:g} interno / {P.TOTAL_W:g} com os dutos', 7, 'TEXTO', 'center')
txt(msp, 90 - P.DUTO_X_OUT, 100 + P.BODY_H + 14, 'duto', 5.5, 'TEXTO', 'center')
txt(msp, 90 + P.W_GROSS + P.DUTO_W, 100 + P.BODY_H + 14, 'duto', 5.5, 'TEXTO', 'center')
salva(doc, 'VISTA_FRONTAL_V12')

# --- 2. lateral -------------------------------------------------------------
doc, msp = novo_desenho('CAMARA V12 — LATERAL ESQUERDA (duto externo)',
                        f'Bocas Z {P.BOCA_INF_Z0:g}..{P.BOCA_INF_Z1:g} e Z {P.BOCA_SUP_Z0:g}..{P.BOCA_SUP_Z1:g} | alojamento 56x56')
vista(msp, 150, 100, 'YZ')
refs(msp, 150, 100, 'YZ')
rect(msp, 150 + P.DUTO_Y0, 100 + P.DUTO_Z0, P.DUTO_D, P.DUTO_H, 'GRAVACAO')
rect(msp, 150 + P.ALOJ_Y0, 100, P.ALOJ_L, P.ALOJ_H, 'GRAVACAO')
txt(msp, 150 + P.DUTO_Y0 + P.DUTO_D + 6, 100 + P.DUTO_Z0 + P.DUTO_H/2, 'DUTO EXTERNO 40x40', 6, 'TEXTO')
txt(msp, 150 + P.ALOJ_Y0 + P.ALOJ_L + 6, 100 + 22, 'ALOJAMENTO 56x56', 6, 'TEXTO')
salva(doc, 'VISTA_LATERAL_V12')

# --- 3. planta ---------------------------------------------------------------
doc, msp = novo_desenho('CAMARA V12 — PLANTA',
                        f'Dutos externos de 40x40 nas laterais | {P.TOTAL_W:g}x{P.BODY_D:g} mm')
vista(msp, 110, 130, 'XY')
refs(msp, 110, 130, 'XY')
txt(msp, 110 + P.W_GROSS/2, 110, f'{P.TOTAL_W:g} mm total = {P.BODY_W:g} mm corpo + 2 x 40 mm dutos', 7,
    'TEXTO', 'center')
salva(doc, 'VISTA_PLANTA_V12')

# --- 4. traseira -------------------------------------------------------------
doc, msp = novo_desenho('CAMARA V12 — VISTA TRASEIRA',
                        'Tampa tecnica com o kit Peltier (vao PENDENTE) e comporta de entrada')
vista(msp, 90, 100, 'XZ', so={'CAM-04', 'CAM-05', 'CAM-01', 'CAM-02', 'CAM-03'})
refs(msp, 90, 100, 'XZ')
rect(msp, 90 + P.PEL_X0, 100 + P.PEL_Z0, P.PEL_ABERTURA_W, P.PEL_ABERTURA_H, 'GRAVACAO')
txt(msp, 90 + P.PEL_X0 + P.PEL_ABERTURA_W / 2, 100 + P.PEL_Z0 + 44, 'KIT PELTIER', 6,
    'TEXTO', 'center')
txt(msp, 90 + P.PEL_X0 + P.PEL_ABERTURA_W / 2, 100 + P.PEL_Z0 + 32,
    'AREA ILUSTRATIVA, NAO CORTAR', 5, 'TEXTO', 'center')
rect(msp, 90 + P.COMP_TRAS_X0, 100 + P.COMP_TRAS_Z0,
     P.COMP_QUADRO_W, P.COMP_QUADRO_H, 'GRAVACAO')
txt(msp, 90 + P.COMP_TRAS_X0 + P.COMP_QUADRO_W / 2, 100 + P.COMP_TRAS_Z0 - 8,
    'COMPORTA DE ENTRADA', 5, 'TEXTO', 'center')
salva(doc, 'VISTA_TRASEIRA_V12')

# --- 5. corte interno -------------------------------------------------------
doc, msp = novo_desenho('CAMARA V12 — CORTE INTERNO (Y-Z, centro)',
                        'PTC para baixo no teto | dissipador frio na traseira alta | lampadas')
vista(msp, 150, 100, 'YZ', rotulo=True)
refs(msp, 150, 100, 'YZ')
salva(doc, 'CORTE_INTERNO_V12')

# --- 6. explodida ------------------------------------------------------------
doc, msp = novo_desenho('CAMARA V12 — VISTA EXPLODIDA',
                        'Ordem de montagem: base, laterais, traseira, teto, porta, dutos externos',
                        esc='0,58:1 (isometrica)')
ofs = {
    'CAM-01': (0, 0, 0), 'CAM-03': (0, 0, 0), 'CAM-04': (0, 0, 0),
    'CAM-02': (0, 0, 300), 'CAM-05': (0, 120, 0), 'CAM-07': (0, -260, 0),
    'CAM-06': (0, -120, 0),
    'CAM-08': (-150, 0, 0), 'CAM-09': (-150, 0, -110), 'CAM-10': (-150, 0, -180),
    'CAM-11': (-150, 0, -70), 'CAM-21': (-150, 0, 150),
    'CAM-12': (0, 0, 120), 'CAM-23': (0, 0, 140), 'CAM-24': (0, 0, 70), 'CAM-25': (0, 0, 50), 'CAM-13': (0, 0, 90), 'CAM-14': (0, 0, 60),
}
for (cod, x0, y0, z0, dx, dy, dz) in P.POSES:
    if cod not in ofs:
        continue
    ox, oy, oz = ofs[cod]
    caixa_iso(msp, 320, 120, x0 + ox, y0 + oy, z0 + oz, dx, dy, dz, K_ISO)
salva(doc, 'EXPLODIDA_V12')

# --- 7. conferencia isometrica ----------------------------------------------
doc, msp = novo_desenho('CAMARA V12 — CONFERENCIA ISOMETRICA',
                        'Todas as pecas fisicas na posicao final, incluindo os dois dutos',
                        esc='0,58:1 (isometrica)')
for (cod, x0, y0, z0, dx, dy, dz) in P.POSES:
    caixa_iso(msp, 310, 110, x0, y0, z0, dx, dy, dz, K_ISO)
salva(doc, 'CONFERENCIA_ISOMETRICA_V12')

# --- 8. circulacao de ar ----------------------------------------------------
doc, msp = novo_desenho('CAMARA V12 — CIRCULACAO DE AR',
                        'Sobe pelo duto externo, desce pelo centro. Circuito FECHADO.')
oy = 110
ox = 190
rect(msp, ox + P.DUTO_Y0, oy + P.DUTO_Z0, P.DUTO_D, P.DUTO_H, 'REF')
txt(msp, ox + P.DUTO_Y0 + P.DUTO_D / 2, oy + P.H_GROSS + 14, 'DUTO', 6, 'TEXTO', 'center')
rect(msp, ox, oy, P.W_GROSS, P.H_GROSS, 'REF')
cx = ox + P.DUTO_Y0 + P.DUTO_D / 2
seta_v(msp, cx, oy + 60, oy + 330)
txt(msp, cx + 8, oy + 195, '1. sobe pelo duto', 6, 'TEXTO')
seta_h(msp, cx + 10, ox + 205, oy + 355)
txt(msp, ox + 205, oy + 368, '2. atravessa o teto', 6, 'TEXTO', 'center')
seta_v(msp, ox + 205, oy + 340, oy + 150)
txt(msp, ox + 215, oy + 250, '3. desce pelo centro', 6, 'TEXTO')
seta_h(msp, ox + 195, cx + 10, oy + 28)
txt(msp, ox + 205, oy + 12, '4. retorna a boca inferior', 6, 'TEXTO', 'center')
txt(msp, 30, 46, 'Os dutos NAO captam ar ambiente: as bocas dao para dentro da camara. '
                 'A renovacao e outro circuito, com as comportas CAM-18..20.', 6,
    'TEXTO', 'left')
salva(doc, 'CIRCULACAO_DE_AR_V12')

# --- 9. detalhe da ventilacao ------------------------------------------------
KD = 3.0        # detalhe ampliado 3:1
doc, msp = novo_desenho('DETALHE — VENTILACAO DO DUTO EXTERNO',
                        'Alojamento 56 x 56 x 50 | flange D36 | ventoinha 40 mm passo 32',
                        esc='3:1 (detalhe)')
ox, oy = 120, 200
L = P.ALOJ_L * KD
rect(msp, ox, oy, L, L, 'CORTE')
circ(msp, ox + L / 2, oy + L / 2, P.VENT_ABERTURA * KD, 'GRAVACAO')
for sx in (-1, 1):
    for sy in (-1, 1):
        circ(msp, ox + L / 2 + sx * P.VENT_PASSO / 2 * KD,
             oy + L / 2 + sy * P.VENT_PASSO / 2 * KD, P.VENT_FURO * KD, 'CORTE')
txt(msp, ox + L / 2, oy - 22, 'PLANTA — flange vista de cima', 7, 'TEXTO', 'center')
txt(msp, ox + L / 2, oy + L + 26, f'furo D{P.VENT_ABERTURA:g}', 6, 'TEXTO', 'center')
txt(msp, ox + L / 2, oy + L + 14, f'4 x D{P.VENT_FURO:g} passo {P.VENT_PASSO:g}',
    5.5, 'TEXTO', 'center')

ox2 = ox + L + 150
H2 = P.ALOJ_H * KD
rect(msp, ox2, oy, L, H2, 'CORTE')
rect(msp, ox2, oy + P.FLANGE_Z0 * KD, L, P.FLANGE_T * KD, 'GRAVACAO')
fx2 = ox2 + (P.ALOJ_L - P.VENT_D) / 2 * KD
rect(msp, fx2, oy + P.VENT_Z0 * KD, P.VENT_D * KD, P.VENT_H * KD, 'GRAVACAO')
txt(msp, ox2 + L / 2, oy - 22, 'CORTE — alojamento + flange + ventoinha', 7,
    'TEXTO', 'center')
txt(msp, ox2 + L + 12, oy + (P.VENT_Z0 + P.VENT_H / 2) * KD, 'ventoinha 40x40x10', 6,
    'TEXTO')
txt(msp, ox2 + L + 12, oy + P.FLANGE_Z0 * KD - 3, 'flange 56x56x3', 6, 'TEXTO')
txt(msp, ox2 + L + 12, oy + 8, 'alojamento 56x56', 6, 'TEXTO')
seta_v(msp, ox2 - 18, oy, oy + H2)
txt(msp, ox2 - 26, oy + H2 / 2, '50', 6, 'TEXTO', 'right')

txt(msp, 30, 46, 'Um canal de 40 x 40 nao acomoda a ventoinha: os furos M3 de passo 32 '
                 'ficariam a 2,4 mm da borda. Por isso o pe do duto e 56 x 56 e sobra '
                 '16 mm para fora — o flange saliente previsto no projeto.', 6,
    'TEXTO', 'left')
salva(doc, 'DETALHE_VENTILACAO_V12')

# --- 10. detalhe do PTC -----------------------------------------------------
doc, msp = novo_desenho('DETALHE — CONJUNTO DO PTC (pendurado no teto)',
                        'Plataforma 150x80 | suporte 160x90 | PTC para baixo | escudo 180x90')
ox, oy = 140, 140
for cod in ('CAM-14', 'CAM-13', 'CAM-12'):
    x0, y0, z0, dx, dy, h = P.poses_de(cod)[0][1:]
    rect(msp, ox + (x0 - P.ESC_X0), oy + (z0 - P.ESC_Z0), dx, h, 'CORTE')
rect(msp, ox + (P.ESC_REC_X - P.ESC_X0), oy + (P.PTC_Z0 - P.ESC_Z0),
     P.ESC_REC_W, P.ESC_REC_H, 'GRAVACAO')
txt(msp, ox + 90, oy - 14, 'ESCUDO COM O VAO DO PTC', 6, 'TEXTO', 'center')
txt(msp, ox + (P.ESC_REC_X - P.ESC_X0) + P.ESC_REC_W / 2,
    oy + (P.PTC_Z0 - P.ESC_Z0) + P.ESC_REC_H / 2, 'PTC', 6, 'TEXTO', 'center')
salva(doc, 'DETALHE_PTC_V12')

# --- 11. detalhe da lampada -------------------------------------------------
doc, msp = novo_desenho('DETALHE — SUPORTE DA LAMPADA W5W 12 V / 5 W',
                        'Blank 40 x 80, dobra 90 graus em y=30, soquete D20 apenas gravado')
ox, oy = 110, 120
next(x for x in cam if x.cod == 'CAM-25').desenha(msp, ox, oy, cotas=True, rotulo=False)
txt(msp, ox + 20, oy - 24, 'PLANIFICADO', 6, 'TEXTO', 'center')
txt(msp, 30, 46, 'Duas lampadas, em paralelo, 12 V / 5 W cada. NUNCA ligar lampada de '
                 '12 V em 24 V. O circulo D20 e so gravado: medir o soquete antes de furar.',
    6, 'TEXTO', 'left')
salva(doc, 'DETALHE_LAMPADA_V12')

# --- 12. detalhe do isolamento ----------------------------------------------
doc, msp = novo_desenho('DETALHE — ISOLAMENTO (camada independente, 1 mm)',
                        '5 pecas da camara + 3 dos dutos externos | EPS com fita aluminio')
ox, oy = 110, 140
for i, q in enumerate(iso):
    px = ox + (i % 4) * 130
    py = oy + (i // 4) * 150
    q.desenha(msp, px, py, cotas=False, rotulo=False)
    txt(msp, px + q.w / 2, py - 10, q.cod, 5, 'TEXTO', 'center')
txt(msp, 30, 46, 'Nenhum EPS, EPS-F ou XPS e incombustivel. O escudo do PTC (CAM-14) '
                 'existe para que o isopor nao receba radiacao direta. Confirmar a '
                 'classe de reacao ao fogo antes de comprar.', 6, 'TEXTO', 'left')
salva(doc, 'DETALHE_ISOLAMENTO_V12')

# --- 13. detalhe do Peltier -------------------------------------------------
doc, msp = novo_desenho('DETALHE — KIT PELTIER (2 x TEC1-12706)',
                        'Traseira superior | dissipador frio dentro, quente FORA | vao PENDENTE')
ox, oy = 130, 150
rect(msp, ox, oy, P.PEL_ABERTURA_W, P.PEL_ABERTURA_H, 'GRAVACAO')
txt(msp, ox + P.PEL_ABERTURA_W / 2, oy + P.PEL_ABERTURA_H / 2 + 8, 'AREA ILUSTRATIVA', 7,
    'TEXTO', 'center')
txt(msp, ox + P.PEL_ABERTURA_W / 2, oy + P.PEL_ABERTURA_H / 2 - 8,
    'PENDENTE - NAO RECORTAR', 5, 'TEXTO', 'center')
rect(msp, ox + 10, oy - P.PEL_SALIENCIA - 10, P.PEL_ABERTURA_W - 20, P.PEL_SALIENCIA,
     'REF')
txt(msp, ox + P.PEL_ABERTURA_W / 2, oy - P.PEL_SALIENCIA / 2 - 10,
    'dissipador frio (dentro)', 5, 'TEXTO', 'center')
txt(msp, 30, 46, 'O vao do KIT DUPLO e so REFERENCIA, nao cotado para corte. A tampa '
                 'permanece em branco. O dissipador quente deve ser dimensionado para '
                 'rejeitar Qc+Pe; confirmar com o kit real.', 6, 'TEXTO', 'left')
salva(doc, 'DETALHE_PELTIER_V12')

# --- V12. DETALHE REAL DO COLETOR E PASSAGEM TRASEIRA ---------------------------
doc, msp = novo_desenho('V12 - COLETOR PELTIER E DRENO TRASEIRO',
                        'CAM-17 inox e 2 suportes CAM-22; corte/saida do tubo pendentes',
                        w=850,h=540)
ox, oz = 110, 110
# Projecao traseira X-Z
rect(msp,ox+P.PEL_X0,oz+P.PEL_Z0, P.PEL_ABERTURA_W,P.PEL_ABERTURA_H,'GRAVACAO')
txt(msp,ox+205,oz+345,'KIT DUPLO: Z '+str(int(P.PEL_Z0))+'..'+str(int(P.PEL_Z1))+' (REFERENCIA)',6,'TEXTO','center')
rect(msp,ox+P.CALHA_X0,oz+P.CALHA_Z,P.CALHA_W,P.CALHA_ABA_MM,'REF')
txt(msp,ox+205,oz+P.CALHA_Z-17,'CALHA Z'+str(int(P.CALHA_Z))+', ABA '+str(int(P.CALHA_ABA_MM))+' (referencia)',6,'TEXTO','center')
for x in P.CALHA_APOIOS_X:
    circ(msp,ox+x,oz+P.CALHA_APOIOS_Z_FURO,2.25,'GRAVACAO')
    txt(msp,ox+x,oz+P.CALHA_APOIOS_Z_FURO+16,'M4',5,'TEXTO','center')
circ(msp,ox+P.DRENO_X,oz+P.DRENO_Z_PAREDE,P.DRENO_DIAMETRO_REFERENCIA/2,'GRAVACAO')
linha(msp,ox+P.DRENO_X,oz+P.CALHA_Z,
          ox+P.DRENO_X,oz+P.DRENO_Z_PAREDE,'GRAVACAO')
txt(msp,ox+P.DRENO_X+20,oz+P.DRENO_Z_PAREDE-25,
    'PASSA-PAREDE D12 NOMINAL: SO GRAVADO',5,'TEXTO')
# Secao longitudinal Y-Z fora de escala construtiva para mostrar inclinacao
yx,yz=520,90
rect(msp,yx,yz,225,310,'MOLDURA')
linha(msp,yx+30,yz+220,yx+100,yz+220,'GRAVACAO')
linha(msp,yx+30,yz+P.CALHA_Z-70+P.CALHA_QUEDA_Y_MM,
          yx+100,yz+P.CALHA_Z-70,'REF')
linha(msp,yx+100,yz+P.CALHA_Z-70,
          yx+110,yz+P.DRENO_Z_PAREDE-70,'GRAVACAO')
txt(msp,yx+18,yz+45,'CORTE ESQUEMATICO: SAIDA MAIS BAIXA',5,'TEXTO')
txt(msp,25,52,'CALHA DEVE ABRANGER A SUPERFICIE FRIA E SER ESTANQUE; '
    'furo de tubo SO depois de medir adaptador e fazer teste de agua.',6,'TEXTO')
salva(doc,'DETALHE_DRENO_PELTIER_V12')


# --- NOVOS DETALHES V12: dois ventiladores frios, chicotes e painel ---------
doc, msp = novo_desenho('V12 - PELO LADO FRIO: DUAS FANS 40x40',
    'PASSO ENTRE CENTROS = 50 mm DE ESTUDO; NOTA: produto NAO MEDIDO',w=850,h=520)
ox,oz=120,140
rect(msp,ox,oz,P.W_GROSS,P.TAMPA_TEC_H,'CORTE')
for cx in P.PEL_FAN_CX:
    bx=ox+cx-P.PEL_FAN_L/2
    bz=oz+P.PEL_FAN_CZ-P.PEL_FAN_L/2-P.TRAS_FIXA_H
    rect(msp,bx,bz,P.PEL_FAN_L,P.PEL_FAN_L,'GRAVACAO')
    circ(msp,bx+20,bz+20,16,'REF')
    for dx in (4,36):
        for dz in (4,36): circ(msp,bx+dx,bz+dz,1.6,'GRAVACAO')
linha(msp,ox+P.PEL_FAN_CX[0],oz+22,ox+P.PEL_FAN_CX[1],oz+22,'GRAVACAO')
txt(msp,ox+P.W_GROSS/2,oz+35,'CENTROS +-'+str(int(P.PEL_FAN_PASSO_ESTUDO/2))+'mm / ESTUDO',6,'TEXTO','center')
txt(msp,ox+P.W_GROSS/2,oz-22,'CAM-05 INTEIRA: NENHUM FURO DE KIT AUTORIZADO',6,'TEXTO','center')
txt(msp,460,300,'COMPARAVEL: frio 2 fans 40x40x10',7,'TEXTO')
txt(msp,460,278,'dissipadores frios 40x25x70',6,'TEXTO')
txt(msp,460,256,'quente 104x25x200 aprox.',6,'TEXTO')
txt(msp,460,225,'PASSO E MONTAGEM: NAO VERIFICADOS',6,'TEXTO')
txt(msp,460,193,'MECA KIT ANTES DE RECORTAR.',6,'TEXTO')
salva(doc,'DETALHE_FANS_FRIAS_V12')

doc,msp = novo_desenho('V12 - PASSAGEM DOS 4 CHICOTES DA CAMARA',
    'CAM-04: furos apenas GRAVADOS, independentes da CAM-05 Peltier',w=850,h=520)
ox,oy=100,150
rect(msp,ox,oy,P.W_GROSS,P.TRAS_FIXA_H,'CORTE')
rect(msp,ox+110,oy+43,80,40,'REF')
for tag,x,z,d,func in P.PASSAGENS_CAMARA_ESTUDO:
    circ(msp,ox+x,oy+z,d/2,'GRAVACAO')
    txt(msp,ox+x,oy+z+17,tag,5.8,'TEXTO','center')
for i,(tag,x,z,d,func) in enumerate(P.PASSAGENS_CAMARA_ESTUDO):
    txt(msp,465,325-i*40,tag+' : '+func[:42],5.5,'TEXTO')
txt(msp,465,148,'APENAS REFERENCIAS - MEDIR PG E CABOS',5.6,'TEXTO')
txt(msp,465,125,'SINAIS E POTENCIA EM PASSAGENS DISTINTAS',5.6,'TEXTO')
salva(doc,'DETALHE_ENTRADAS_CABOS_V12')

doc,msp = novo_desenho('V12 - PAINEL 600x800: COMPONENTES E CANALETAS',
    '4 trilhos DIN; CHAPA PNL-01 e entradas PNL-05; footprints indicativos',w=880,h=1000)
ox,oy=100,95
rect(msp,ox,oy,P.P_W,P.P_H,'CORTE')
for y in P.RAILS:
    linha(msp,ox+65,oy+y,ox+535,oy+y,'GRAVACAO')
    txt(msp,ox+50,oy+y+32,'T'+str(P.RAILS.index(y)+1),6,'TEXTO')
for yy,pecas in componentes.items():
    xx=78
    for nm,ww in pecas:
        rect(msp,ox+xx,oy+yy-23,ww,46,'REF')
        txt(msp,ox+xx+ww/2,oy+yy,nm,5,'TEXTO','center')
        xx+=ww+5
for yy in P.H_DUCTS:
    rect(msp,ox+65,oy+yy-15,470,30,'GRAVACAO')
for xx in P.V_DUCT_X:
    rect(msp,ox+xx-15,oy+95,30,615,'GRAVACAO')
txt(msp,ox+300,oy-28,'AC G1 A ESQUERDA | SENSOR G5 A DIREITA | MEDIDAS A CONFERIR',6,'TEXTO','center')
salva(doc,'LAYOUT_PAINEL_DETALHADO_V12')

print(f'=== DESENHOS DE MONTAGEM: {len(desenhos)} ===')
for d in desenhos:
    print(f'  {d}')

# =============================================================================
# PREVIAS DAS CHAPAS
# =============================================================================
for (nome, mat, esp, sw, sh, n) in chapas_info:
    pasta = os.path.join(CAM if mat != 'MDF' else PNL, '02_chapas')
    previa(os.path.join(pasta, f'{nome}.dxf'),
           os.path.join(OUT, 'previas', f'{nome}.png'), dpi=130, tamanho=(12, 9))

print('=== PREVIAS ===')
print(f'  {len(os.listdir(os.path.join(OUT, "previas")))} PNG em previas/')

# =============================================================================
# JSON DE PARAMETROS
# =============================================================================
with open(os.path.join(OUT, 'parametros_v12.json'), 'w', encoding='utf-8') as f:
    json.dump({
        'versao': 'V12',
        'resumo': P.resumo(),
        'largura_total_mm': P.TOTAL_W,
        'dutos': {'w': P.DUTO_W, 'd': P.DUTO_D, 'y0': P.DUTO_Y0,
                  'z0': P.DUTO_Z0, 'z1': P.DUTO_Z1},
        'alojamento': {'l': P.ALOJ_L, 'h': P.ALOJ_H, 'flange': P.FLANGE_L,
                       'furo': P.VENT_ABERTURA, 'passo': P.VENT_PASSO},
        'bocas': {'inf': [P.BOCA_INF_Z0, P.BOCA_INF_Z1],
                  'sup': [P.BOCA_SUP_Z0, P.BOCA_SUP_Z1]},
        'peltier': {'x0': P.PEL_X0, 'x1': P.PEL_X1, 'z0': P.PEL_Z0, 'z1': P.PEL_Z1},
        'poses': [list(p) for p in P.POSES],
    }, f, indent=2, ensure_ascii=False)

print()
print('  V12 gerado. NAO LIBERADO PARA CORTE — ver LEIA-ME.md')
