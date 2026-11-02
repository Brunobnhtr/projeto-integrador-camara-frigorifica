# -*- coding: utf-8 -*-
"""Parametros centralizados da V12 — camara com DUTOS EXTERNOS.

Tudo que define geometria mora aqui. `gerar_cad_v12.py` importa deste arquivo e
`analise_termica_tec.py` (na raiz) importa daqui tambem.

Unidade: milimetros.

DECISAO DE PROJETO DESTA VERSAO
-------------------------------
Os dois dutos de recirculacao sao EXTERNOS, colados na face externa das
laterais. A V7 os havia internalizado; isso consumia 1,7 L do volume util e
nao era o conceito original. Aqui eles voltam para fora:

    camara 310 externa + 40 mm de duto por lado = 390 mm total

O duto usa a propria parede de acrilico como face interna. As duas "bocas"
(boca inferior de entrada e boca superior de saida) sao RECORTES na lateral.
Nada de ar ambiente entra por ali: o circuito e fechado.

DOIS SISTEMAS DE COORDENADAS — nao misture:

  (A) QUADRO INTERNO BRUTO  (cotas, analise termica, POSES)
      X = largura      0 .. 300   (0 = face interna da lateral esquerda)
      Y = profundidade 0 .. 200   (0 = face interna da porta, 200 = tras)
      Z = altura       0 .. 250   (0 = piso interno, 250 = teto interno)

  (B) COORDENADAS LOCAIS DE CADA PECA (usadas no DXF)
      Origem no canto inferior esquerdo da propria peca. A tabela POSES guarda
      a colocacao 3D de CADA PECA FISICA — uma peca com qtd 6 tem 6 linhas.
      Isto importa: na primeira tentativa a tabela tinha uma linha por codigo e
      o duto direito simplesmente nao aparecia nos desenhos.

PENDENCIA TERMICA REGISTRADA
----------------------------
Com isolante de 1 mm e 14,63 L brutos revestidos, a faixa termica de 5 C ainda nao foi validada com 30 C
de ambiente por medicao; os valores de modelo sao apenas hipotese. O valor de 1 mm foi mantido por decisao
do usuario. Ver analise_termica_tec.py e RELATORIO_ENTREGA_V12.md, secao E.
NAO LIBERADO PARA CORTE.
"""

# =============================================================================
# 1. ISOLAMENTO — 1 mm, decisao do usuario, com a limitacao termica registrada
# =============================================================================
# A matriz 1/5/10 mm esta na analise termica:
#  Espessuras de 1/5/10 mm: comparar mediante simulacao de estudo;
#  nao declarar desempenho real antes de medir Qc, resistencia termica e perdas.
# Nenhum dos tres (EPS, EPS-F, XPS) e incombustivel: confirmar a classe de
# reacao ao fogo antes de comprar.
ESPESSURA_ISOLANTE_MM = 1.0
ISO_K = 0.035          # W/mK — EPS tipico; XPS ~0,030

# =============================================================================
# 2. CAMARA COMPACTA — cavidade bruta entre as faces internas do acrilico
# =============================================================================
ACR = 5.0              # espessura do acrilico estrutural
ACR_K = 0.19           # W/mK

W_GROSS = 300.0        # largura interna bruta (310 externo - 2 x 5)
D_GROSS = 200.0        # profundidade interna bruta (210 externo - 2 x 5)
H_GROSS = 250.0        # altura interna bruta (260 externo - 2 x 5)

E = ESPESSURA_ISOLANTE_MM
W_NET = W_GROSS - 2 * E        # cavidade util
D_NET = D_GROSS - 2 * E
H_NET = H_GROSS - 2 * E

BODY_W = W_GROSS + 2 * ACR             # 310
BODY_D = D_GROSS + 2 * ACR             # 210 — a porta fecha rente, sem sobra
BODY_H = H_GROSS + 2 * ACR             # 260

TAMPA_TEC_H = 130.0                    # altura da tampa tecnica removivel
TRAS_FIXA_H = H_GROSS - TAMPA_TEC_H    # 260

# porta: 300 x 250 recessada em Y -5..0, profundidade externa 210
PORTA_W, PORTA_H = W_GROSS, H_GROSS    # 300 x 250
BATENTE_W, BATENTE_D, BATENTE_T = 15.0, 15.0, 3.0   # moldura de vedacao

# =============================================================================
# 3. DUTOS EXTERNOS DE RECIRCULACAO — 40 x 40, um de cada lado
# =============================================================================
# O duto e colado na face EXTERNA da lateral. A face interna do duto e a
# propria parede de acrilico: por isso nao existe quarta parede.
#
#   lateral esquerda: duto ocupa X -45..-5
#   lateral direita : duto ocupa X 415..455
#   largura total   : 345 - (-45) = 390 mm
DUTO_W = 40.0          # extensao em X (para fora da camara)
DUTO_D = 40.0          # extensao em Y (largura do canal)
DUTO_Y0 = (D_GROSS-DUTO_D)/2.0        # centrado em Y: (250 - 40) / 2 = 105
DUTO_Y1 = DUTO_Y0 + DUTO_D          # 145
DUTO_Z0 = 50.0         # o canal comeca acima da flange da ventoinha
DUTO_Z1 = H_GROSS      # 250 — paineis param na face inferior do teto
DUTO_H = DUTO_Z1 - DUTO_Z0          # 340 — altura de cada painel do duto

# TAMPA DO DUTO — sem ela o canal vira chamine aberta e o ar sopra para fora.
# Fecha em Z 250..255, rente com a face externa do teto (H_GROSS + ACR).
CAP_DUTO_T = ACR
CAP_DUTO_Z0 = DUTO_Z1
CAP_DUTO_Z1 = DUTO_Z1 + CAP_DUTO_T  # 395 — mesma altura do topo externo do corpo

DUTO_X_OUT = ACR + DUTO_W           # 45 — face externa do duto a partir de X=0
TOTAL_W = BODY_W + 2 * DUTO_W       # 390 — corpo + dutos, SEM saliencia dos alojamentos
TOTAL_W_MAX = W_GROSS + 2*ACR + 2*ALOJ_L if False else None  # recalculado depois dos alojamentos

# bocas: recortes na lateral, unica ligacao entre duto e camara
BOCA_INF_Z0, BOCA_INF_Z1 = 12.0, 46.0      # 40 de altura — entrada de ar
BOCA_SUP_Z0, BOCA_SUP_Z1 = H_GROSS-50.0, H_GROSS-10.0   # 40 de altura — saida de ar
BOCA_H = BOCA_INF_Z1 - BOCA_INF_Z0        # 34, circulo de entrada interna

# =============================================================================
# 4. ALOJAMENTO DA VENTOINHA — 56 x 56, porque 40 x 40 nao acomoda o flange
# =============================================================================
# Ventoinha de 40 mm tem 40 x 40 de corpo e furos M3 num passo de 32, isto e,
# a 22,6 mm do centro. Num canal de 40 x 40 os furos cairiam a 2,4 mm da borda
# e nao haveria flange. Por isso o pe de cada duto e um alojamento de 56 x 56,
# que sobra 16 mm para fora. E o "flange saliente" previsto no projeto.
ALOJ_L = 56.0          # lado do alojamento (X e Y)
ALOJ_H = 50.0          # altura total do alojamento (Z 0..50)
ALOJ_Y0 = DUTO_Y0 - (ALOJ_L - DUTO_D) / 2     # 97
ALOJ_Y1 = ALOJ_Y0 + ALOJ_L                    # 153
# o alojamento cresce PARA FORA: face interna no acrilico, externa 16 mm adiante
ALOJ_X_ESQ = -(DUTO_X_OUT + (ALOJ_L - DUTO_W))   # -61
ALOJ_X_DIR = W_GROSS + ACR                       # 305
TOTAL_W_MAX = BODY_W + 2*ALOJ_L           # 422 mm na base, com alojamentos externos

# V12: as DUAS ventoinhas de dutos ficam DENTRO da camara, junto das
# paredes laterais. Cada uma impulsiona transversalmente ao plenum externo;
# depois o ar sobe pelos dutos. O alojamento externo e plenum de transicao,
# nao abriga mais ventoinha. Montagem tem de ter gaxeta removivel e parafusos.
VENT_INTERNA = True
VENT_IN_CY = DUTO_Y0+DUTO_D/2
VENT_IN_CZ = (BOCA_INF_Z0+BOCA_INF_Z1)/2   # Z29
VENT_IN_ABERTURA = BOCA_H                 # D34, somente ar interno->plenum
VENT_IN_ESPACO_X = 12.0                 # dentro do volume perto das paredes
VENT_D = 40.0          # lado da ventoinha
VENT_H = 10.0          # espessura
VENT_PASSO = 32.0      # passo dos 4 furos M3
VENT_FURO = 3.2        # Ø do furo de fixacao
VENT_ABERTURA = 36.0   # Ø da abertura de ar da flange (passagem livre)

FLANGE_L = 56.0        # lado da flange = lado do alojamento
FLANGE_T = 3.0
FLANGE_Z1 = ALOJ_H     # 50 — topo do alojamento
FLANGE_Z0 = FLANGE_Z1 - FLANGE_T      # 47 — altura dos paineis do alojamento
VENT_Z1 = FLANGE_Z0 - 1.0              # 46 — ventilador INTEIRO no alojamento largo, ABAIXO da flange
VENT_Z0 = VENT_Z1 - VENT_H            # 36: nao invade o canal estreito

# =============================================================================
# 5. COMPORTAS DE RENOVACAO — teto (exaustao) e traseira baixa (entrada)
# =============================================================================
# Circuito SEPARADO da recirculacao: fechadas em operacao normal, abertas so
# no modo de renovacao. Guilhotina simples: quadro + lamina deslizante + guias.
COMP_W, COMP_H = 80.0, 40.0        # vao livre da comporta
COMP_QUADRO_W, COMP_QUADRO_H = 110.0, 70.0
COMP_QUADRO_T = 5.0
COMP_LAMINA_W, COMP_LAMINA_T = 110.0, 2.0
COMP_GUIA_W, COMP_GUIA_H, COMP_GUIA_T = 110.0, 8.0, 3.0

# exaustao no teto (perto da porta, longe do PTC e das lampadas)
COMP_TETO_X0, COMP_TETO_Y0 = (W_GROSS-COMP_QUADRO_W)/2, 0.0
COMP_TETO_Z = BODY_H                  # 260 — quadro colado por FORA do teto
# entrada na traseira baixa (abaixo da tampa tecnica)
COMP_TRAS_X0, COMP_TRAS_Z0 = (W_GROSS-COMP_QUADRO_W)/2, 28.0
COMP_TRAS_Y = BODY_D                  # 260 — quadro colado por FORA da traseira

# =============================================================================
# 6. KIT PELTIER DUPLO — parede traseira superior (tampa tecnica)
# =============================================================================
PEL_X0, PEL_X1 = 95.0, 205.0      # faixa ocupada na parede traseira
PEL_Z0, PEL_Z1 = 160.0, 235.0      # faixa em altura
PEL_SALIENCIA = 45.0               # quanto o dissipador frio entra na camara
PEL_ABERTURA_W = PEL_X1 - PEL_X0   # 110 — PENDENTE: medir o kit real
PEL_ABERTURA_H = PEL_Z1 - PEL_Z0   # 75  — PENDENTE: medir o kit real

# -----------------------------------------------------------------------------
# V12: duas ventoinhas do LADO FRIO, ambas 40x40x10 mm
# 40 mm e tamanho de cada fan, NAO o passo entre centros de montagem.
# O passo 50 mm e HIPOTESE GRAFICA para visualizar o conjunto, nao medida de produto.
# Fonte comparavel (Dissipatec COOLER DUPLO) tem dois fans 40x40x10,
# dois dissipadores frios 40x25x70 e dissipador quente 104x25x200 mm.
# O usuario indicou outro anuncio: nao transferir cotas de fabricante.
# -----------------------------------------------------------------------------
PEL_FAN_L = 40.0
PEL_FAN_T = 10.0
PEL_FAN_Q = 2
PEL_FAN_PASSO_ESTUDO = 50.0
PEL_FAN_GAP_ESTUDO = PEL_FAN_PASSO_ESTUDO-PEL_FAN_L
PEL_FAN_CX = (W_GROSS/2-PEL_FAN_PASSO_ESTUDO/2,
              W_GROSS/2+PEL_FAN_PASSO_ESTUDO/2)
PEL_FAN_CZ = (PEL_Z0 + PEL_Z1)/2
PEL_FAN_PROJECAO_W = PEL_FAN_PASSO_ESTUDO+PEL_FAN_L
PEL_FAN_MEDIDAS_CONFIRMADAS = False
# Reservar dissipador frio, nao apenas espessura do fan
PEL_FRIO_PROF_REF = PEL_SALIENCIA
# Nao alterar CAM-05: apenas gravacao (sem recorte e sem furo)

# Roteamento de chicotes: passagem pela CAM-04 traseira fixa. PG7/PG9 sao
# referencias, diametros finais dependem da rosca e multicabos comprados.
# x,z em mm no quadro interno bruto, a altura da CAM-04 vai de 0 a 120.
PASSAGENS_CAMARA_ESTUDO = (
 ('P1_PTC_24V', 35.0, 96.0, 16.0, '24 V PTC / termico NF'),
 ('P2_FANS_12V', 35.0, 28.0, 16.0, '12 V fan dutos e fans frios; RPM se 3 fios'),
 ('P3_LAMP_12V', W_GROSS-35.0, 28.0, 12.5, 'dois +12 V W5W circuitos separados'),
 ('P4_SENS_I2C', W_GROSS-35.0, 96.0, 12.5, 'AM2315C/1-Wire; manter separado de potencia'),
)
PASSAGENS_MEDIDAS_CONFIRMADAS = False
# S1 em ar misturado, fora do jato Peltier; S2 no retorno; sensor quente FORA.
# ATENCAO: a tabela definitiva fica na secao 8 (S1_AR_MISTURADO em 150,145,95).
# Havia uma SEGUNDA definicao aqui, com S1 em 150,65,115, que era sobrescrita
# silenciosamente pela de baixo — quem lesse esta linha concluia a posicao
# errada. Foi removida de proposito; nao recriar.
# Passagens sugeridas na base do painel, sem corte ate medir PG e decidir bornes.
# (tag, x, profundidade, diametro nominal do desenho, funcao)
PASSAGENS_PAINEL_ESTUDO = (
 ('G1_REDE',70.0,125.0,20.5,'127/220 VAC: corredor exclusivo'),
 ('G2_24V',165.0,125.0,20.5,'24V aquecimento/refrigeracao'),
 ('G3_12V',265.0,125.0,15.5,'12V lampadas 1 e 2'),
 ('G4_FANS',365.0,125.0,15.5,'12V ventiladores e tach'),
 ('G5_SENS',465.0,125.0,12.5,'sinais I2C / 1-Wire'),
 ('G6_RES',550.0,125.0,12.5,'reserva / expansao'),
)

# =============================================================================
# 7. PTC — apontado PARA BAIXO, pendurado no teto
# =============================================================================
# ATENCAO AO NOME: aqui PTC_W e a LARGURA (width), nao a potencia. A potencia
# e PTC_POT_W, logo abaixo — as duas coexistem porque a peca tem as duas coisas.
PTC_W, PTC_D, PTC_H = 110.0, 30.0, 20.0   # CONFIRMAR o modelo comprado
PTC_X0 = 95.0
PTC_Y0 = 75.0
PTC_Z1 = H_NET - 50.0                            # face de cima (encosta no suporte)
PTC_Z0 = PTC_Z1 - PTC_H                   # 319 — face QUENTE, para baixo

# --- potencia do PTC: DECIDIDA em 80 W / 24 V --------------------------------
# A de 60 W nao existe no mercado brasileiro (as reais sao 80, 100 e 150 W).
# A analise termica (analise_termica_tec.py, cenario 3) pede 34 W para manter
# 50 C, entao 80 W da ~2,3x de margem e leva a camara a 81 C no maximo.
# 100 W e 150 W so aumentariam a corrente e o pior caso sem melhorar o ensaio.
PTC_POT_W = 80.0
PTC_V = 24.0
PTC_I = PTC_POT_W / PTC_V                        # 3,33 A

PLAT_W, PLAT_D, PLAT_T = 230.0, 120.0, 5.0
PLAT_X0, PLAT_Y0 = 35.0, 20.0
PLAT_Z1 = H_NET - 18.0                    # 371 — 18 mm abaixo do teto util
PLAT_Z0 = PLAT_Z1 - PLAT_T                # 366

SUP_W, SUP_D, SUP_T = 160.0, 90.0, 2.0
SUP_X0, SUP_Y0 = 70.0, 55.0
SUP_Z1 = PLAT_Z0 - 25.0                   # 341
SUP_Z0 = SUP_Z1 - SUP_T                   # 339

ESC_W, ESC_D, ESC_T = 180.0, 90.0, 1.0
ESC_X0, ESC_Y0 = 60.0, 55.0
ESC_Z1 = SUP_Z0 - 12.0                    # 327
ESC_Z0 = ESC_Z1 - ESC_T                   # 326
ESC_REC_W, ESC_REC_H = 114.0, 34.0        # vao do PTC + 2 mm de folga por lado
ESC_REC_X = PTC_X0 - 2.0                  # 148
ESC_REC_Y = PTC_Y0 - 2.0                  # 108

# padrao unico dos 4 tirantes (vale para teto, plataforma, suporte e escudo)
ROD_X = (87.0, 213.0)     # 126 entre centros
ROD_Y = (72.0, 128.0)      # 56 entre centros
ROD_D = 5.0                # furo passante M4
ROD_COMP = H_NET - ESC_Z0  # 63 — teto (389) -> escudo (326)

GAP_TETO_PLAT = H_NET - PLAT_Z1            # 18 — tubo ceramico de cima
GAP_PLAT_SUP = PLAT_Z0 - SUP_Z1            # 25 — tubo ceramico do meio
GAP_SUP_ESC = SUP_Z0 - ESC_Z1              # 12 — tubo ceramico de baixo
TUBO_QTD = 12              # 4 tirantes x 3 niveis

# grampos do PTC (inox 1 mm, contato pequeno de proposito)
GRAMP_W, GRAMP_D, GRAMP_T = 12.0, 90.0, 1.0
GRAMP_X0 = (PTC_X0 + 10.0, PTC_X0 + 75.0)  # 160, 225
GRAMP_Y0 = SUP_Y0
GRAMP_Z = PTC_Z0 - GRAMP_T                 # 318
GRAMP_FURO_Y = (GRAMP_Y0 + 8.0, GRAMP_Y0 + 82.0)

# =============================================================================
# 8. SUPORTES V12, PTC SUSPENSO + BANDEJA REMOVIVEL DE LAMPADAS
# =============================================================================
# Nao reutilizar CAM-07 (porta) nem CAM-18/19 (comportas).
# PTC permanece com saida para BAIXO; a plataforma fica na parte SUPERIOR.
# CAM-23: 16 pastilhas de acrilico 25x25x5, 4 pilhas de 20 mm,
# com furo passante para tirante M4. NAO sustentar tudo apenas por adesivo.
PTC_BLOCO_L = 25.0
PTC_BLOCO_T = 5.0
PTC_BLOCO_CAMADAS = 4
PTC_BLOCO_QTD = 4*PTC_BLOCO_CAMADAS
PTC_BLOCO_H = PTC_BLOCO_T*PTC_BLOCO_CAMADAS
# X e Y dos blocos coincidem com as hastes PTC, no teto acima da plataforma.
PTC_BLOCO_CENTROS = [(x,y) for x in ROD_X for y in ROD_Y]
# Bandeja em aluminio separada do PTC e da calha; nao instalar embaixo da calha.
LAMP_P = 5.0
LAMP_QTD = 2
LAMP_T = 2.0
LAMP_BANDEJA_W, LAMP_BANDEJA_D = 210.0, 90.0
LAMP_BANDEJA_X0, LAMP_BANDEJA_Y0 = 45.0, 25.0
LAMP_BANDEJA_Z0 = 110.0
LAMP_Z1 = LAMP_BANDEJA_Z0 + LAMP_T
LAMP_CENTROS_X = (LAMP_BANDEJA_X0+65.0, LAMP_BANDEJA_X0+145.0)
LAMP_CENTRO_Y = LAMP_BANDEJA_Y0+45.0
# Quatro cantoneiras com dobra de 90 graus; chapa plana 90x25x2mm.
LAMP_L_W, LAMP_L_D, LAMP_L_T = 90.0, 25.0, 2.0
LAMP_L_DOBRA = 25.0
LAMP_L_ALCANCE_FURO = 55.0  # distancia centro do furo ate parede lateral
LAMP_L_CENTROS_Y = (35.0,105.0)
LAMP_L_PAREDE_Z = 110.0
LAMP_L_PAR_M4_Y = (-6.0,6.0) # dois pontos na parede por cantoneira
LAMP_BANDEJA_FUROS = [
 (10.,10.),(200.,10.),(10.,80.),(200.,80.)
]
LAMP_SLOT_W,LAMP_SLOT_H=20.0,4.0
LAMP_SLOTS=[(41.,43.),(69.,43.),(121.,43.),(149.,43.)]
LAMP_SOQ_D=20.0  # SOMENTE GRAVACAO: soquete real nao medido
# S1 nao pode ficar na altura/posicao da bandeja de metal.
SENSOR_POSICOES_ESTUDO = (
 ('S1_AR_MISTURADO', 150.0, 145.0, 95.0),
 ('S2_RETORNO', W_GROSS-22.0, DUTO_Y1+15.0, 210.0),
 ('S3_LIMITE_PTC', 150.0, 110.0, 163.0),
)

# =============================================================================
# 9. CONDENSADO — V12: abaixo das DUAS ventoinhas frias, dreno na TRASEIRA
# =============================================================================
# Referencia Peltier provisoria X95..205, Z160..235, saliencia interna 45mm:
# CAM-17 de 150x70 ocupa X75..225 Y130..200 e Z148..156 com abas 8 mm.
# A calha cobre toda a projecao fria e fica 4 mm abaixo do limite inferior.
# Folga e referencia, exige confirmacao do kit real e projecao fria.
CALHA_W, CALHA_D, CALHA_T = 150.0, 70.0, 1.0
CALHA_X0, CALHA_Y0 = 75.0, 130.0
CALHA_Z = 148.0  # cota minima da base no canto traseiro direito
CALHA_ABA_MM = 8.0
CALHA_QUEDA_X_MM = 2.0  # queda do lado esquerdo ao lado direito
CALHA_QUEDA_Y_MM = 1.5  # queda da frente para a traseira
# O perfil e INOX 1 mm; os quatro cantos devem ser soldados/selados sem vazamento.
# Os suportes de baixo nao perfuram o piso da calha.
CALHA_APOIOS_X = (80.0, 220.0)
CALHA_APOIOS_Z_FURO = 166.0
CALHA_SUP_W, CALHA_SUP_D, CALHA_SUP_T = 110.0, 20.0, 2.0
CALHA_SUP_DOBRA = 35.0  # perna vertical 35mm + prateleira de 75mm
# O dreno sai no canto traseiro direito, por tubo com uniao estanque.
# Os tamanhos de espigao/bulkhead devem ser MEDIDOS; so a localizacao e referencia.
DRENO_X, DRENO_Y = 200.0, 192.0
DRENO_Z_PAREDE = 140.0
DRENO_DIAMETRO_REFERENCIA = 12.0   # gravacao na CAM-05, NAO FURO
DRENO_MANGUEIRA_REFERENCIA = 8.0   # mm, nao define adaptador comprado

# Confirmar SEM furar: a area do kit e referencia visual apenas.
PEL_RECORTE_AUTORIZADO = False
PEL_MONTAGEM_MEDIDA = False
ESPIGAO_MEDIDO = False

DRENO_VEDADO = False               # pendencia de dimensionar tubo e vedacao

# =============================================================================
# 10. PAINEL — mantido da V9, inalterado
# =============================================================================
MDF = 15.0
P_W, P_H, P_D = 600.0, 800.0, 250.0
P_IN_W = P_W - 2 * MDF
P_IN_H = P_H - 2 * MDF
P_IN_D = P_D - MDF
RAILS = (145.0, 315.0, 485.0, 655.0)
H_DUCTS = (65.0, 235.0, 405.0, 575.0, 745.0)
V_DUCT_X = (35.0, 535.0)
V_DUCT_W = 30.0
FAIXA_UTIL = 470.0

# =============================================================================
# 11. BASE DA MAQUETE — 1500 x 500 mantida; camara com 390 mm total
# =============================================================================
BASE_W, BASE_H = 1500.0, 500.0
PANEL_X = 50.0          # painel ocupa X 50..650
GAP_PC = 60.0           # folga painel -> camara
CHAMBER_X = PANEL_X + P_W + GAP_PC       # camara ocupa X 710..1100 (390 de largura)
CHAMBER_Y = (BASE_H-BODY_D)/2.0       # centralizar em Y

# =============================================================================
# 12. POSES — colocacao 3D de CADA PECA FISICA (lista, nao dicionario)
# =============================================================================
# (cod, x0, y0, z0, dx, dy, dz)  em mm, no quadro (A).
# Uma peca com qtd N aparece N vezes. Isto e o que garante que o duto direito
# apareca nos desenhos e que o validador veja as duas copias.
POSES = [
    # --- envelope -----------------------------------------------------------
    ('CAM-01', -ACR, -ACR, -ACR, BODY_W, BODY_D, ACR),          # base
    ('CAM-02', -ACR, -ACR, H_GROSS, BODY_W, BODY_D, ACR),       # teto
    ('CAM-03', -ACR, -ACR, 0.0, ACR, BODY_D, H_GROSS),          # lateral esq
    ('CAM-03', W_GROSS, -ACR, 0.0, ACR, BODY_D, H_GROSS),       # lateral dir
    ('CAM-04', 0.0, D_GROSS, 0.0, W_GROSS, ACR, TRAS_FIXA_H),   # traseira fixa
    ('CAM-05', 0.0, D_GROSS, TRAS_FIXA_H, W_GROSS, ACR, TAMPA_TEC_H),  # tampa
    ('CAM-06', 0.0, 0.0, 0.0, PORTA_W, BATENTE_D, PORTA_H),     # batente
    ('CAM-07', 0.0, -ACR, 0.0, PORTA_W, ACR, PORTA_H),          # porta
    # --- duto esquerdo: 3 paineis ------------------------------------------
    ('CAM-08', -DUTO_X_OUT, DUTO_Y0, DUTO_Z0, ACR, DUTO_D, DUTO_H),        # externo
    ('CAM-08', -DUTO_X_OUT, DUTO_Y0, DUTO_Z0, DUTO_W, ACR, DUTO_H),        # frontal
    ('CAM-08', -DUTO_X_OUT, DUTO_Y1 - ACR, DUTO_Z0, DUTO_W, ACR, DUTO_H),  # traseiro
    # --- duto direito: 3 paineis -------------------------------------------
    ('CAM-08', W_GROSS + DUTO_W, DUTO_Y0, DUTO_Z0, ACR, DUTO_D, DUTO_H),
    ('CAM-08', W_GROSS, DUTO_Y0, DUTO_Z0, DUTO_W, ACR, DUTO_H),
    ('CAM-08', W_GROSS, DUTO_Y1 - ACR, DUTO_Z0, DUTO_W, ACR, DUTO_H),
    # --- alojamento esquerdo: 3 paineis + fundo + flange --------------------
    ('CAM-09', ALOJ_X_ESQ, ALOJ_Y0, 0.0, ACR, ALOJ_L, FLANGE_Z0),
    ('CAM-09', ALOJ_X_ESQ, ALOJ_Y0, 0.0, ALOJ_L, ACR, FLANGE_Z0),
    ('CAM-09', ALOJ_X_ESQ, ALOJ_Y1 - ACR, 0.0, ALOJ_L, ACR, FLANGE_Z0),
    ('CAM-10', ALOJ_X_ESQ, ALOJ_Y0, 0.0, ALOJ_L, ALOJ_L, ACR),
    ('CAM-11', ALOJ_X_ESQ, ALOJ_Y0, FLANGE_Z0, FLANGE_L, FLANGE_L, FLANGE_T),
    # --- alojamento direito -------------------------------------------------
    ('CAM-09', ALOJ_X_DIR + ALOJ_L - ACR, ALOJ_Y0, 0.0, ACR, ALOJ_L, FLANGE_Z0),
    ('CAM-09', ALOJ_X_DIR, ALOJ_Y0, 0.0, ALOJ_L, ACR, FLANGE_Z0),
    ('CAM-09', ALOJ_X_DIR, ALOJ_Y1 - ACR, 0.0, ALOJ_L, ACR, FLANGE_Z0),
    ('CAM-10', ALOJ_X_DIR, ALOJ_Y0, 0.0, ALOJ_L, ALOJ_L, ACR),
    ('CAM-11', ALOJ_X_DIR, ALOJ_Y0, FLANGE_Z0, FLANGE_L, FLANGE_L, FLANGE_T),
    # --- conjunto do PTC ----------------------------------------------------
    ('CAM-12', PLAT_X0, PLAT_Y0, PLAT_Z0, PLAT_W, PLAT_D, PLAT_T),
    ('CAM-13', SUP_X0, SUP_Y0, SUP_Z0, SUP_W, SUP_D, SUP_T),
    ('CAM-14', ESC_X0, ESC_Y0, ESC_Z0, ESC_W, ESC_D, ESC_T),
    ('CAM-16', GRAMP_X0[0], GRAMP_Y0, GRAMP_Z, GRAMP_W, GRAMP_D, GRAMP_T),
    ('CAM-16', GRAMP_X0[1], GRAMP_Y0, GRAMP_Z, GRAMP_W, GRAMP_D, GRAMP_T),
    # --- lampadas (aba do teto) --------------------------------------------
    # --- bandeja das duas W5W / abas horizontais das 4 cantoneiras ---------
    ('CAM-25', LAMP_BANDEJA_X0, LAMP_BANDEJA_Y0, LAMP_BANDEJA_Z0,
     LAMP_BANDEJA_W, LAMP_BANDEJA_D, LAMP_T),
    ('CAM-24', 0.0, LAMP_L_CENTROS_Y[0]-LAMP_L_D/2, LAMP_BANDEJA_Z0-LAMP_L_T,
     LAMP_L_ALCANCE_FURO+10, LAMP_L_D, LAMP_L_T),
    ('CAM-24', 0.0, LAMP_L_CENTROS_Y[1]-LAMP_L_D/2, LAMP_BANDEJA_Z0-LAMP_L_T,
     LAMP_L_ALCANCE_FURO+10, LAMP_L_D, LAMP_L_T),
    ('CAM-24', W_GROSS-(LAMP_L_ALCANCE_FURO+10), LAMP_L_CENTROS_Y[0]-LAMP_L_D/2,
     LAMP_BANDEJA_Z0-LAMP_L_T, LAMP_L_ALCANCE_FURO+10, LAMP_L_D, LAMP_L_T),
    ('CAM-24', W_GROSS-(LAMP_L_ALCANCE_FURO+10), LAMP_L_CENTROS_Y[1]-LAMP_L_D/2,
     LAMP_BANDEJA_Z0-LAMP_L_T, LAMP_L_ALCANCE_FURO+10, LAMP_L_D, LAMP_L_T),
    # --- condensado ---------------------------------------------------------
    ('CAM-17', CALHA_X0, CALHA_Y0, CALHA_Z, CALHA_W, CALHA_D, CALHA_T),
    # apoios em POSES representam so a ABA HORIZONTAL (75mm) dobrada da CAM-22;
    # a perna vertical de 35mm fica na traseira e nao e duplicada em POSES
    ('CAM-22', CALHA_APOIOS_X[0] - CALHA_SUP_D / 2, CALHA_Y0-5.0, CALHA_Z-CALHA_SUP_T, CALHA_SUP_D, 75.0, CALHA_SUP_T),
    ('CAM-22', CALHA_APOIOS_X[1] - CALHA_SUP_D / 2, CALHA_Y0-5.0, CALHA_Z-CALHA_SUP_T, CALHA_SUP_D, 75.0, CALHA_SUP_T),
    # --- comportas (quadro + lamina + 2 guias) ------------------------------
    ('CAM-18', COMP_TETO_X0, COMP_TETO_Y0, COMP_TETO_Z,
     COMP_QUADRO_W, COMP_QUADRO_H, COMP_QUADRO_T),
    ('CAM-18', COMP_TRAS_X0, COMP_TRAS_Y, COMP_TRAS_Z0,
     COMP_QUADRO_W, COMP_QUADRO_T, COMP_QUADRO_H),
    ('CAM-19', COMP_TETO_X0, COMP_TETO_Y0, COMP_TETO_Z + COMP_QUADRO_T,
     COMP_LAMINA_W, COMP_H, COMP_LAMINA_T),
    ('CAM-19', COMP_TRAS_X0, COMP_TRAS_Y + COMP_QUADRO_T, COMP_TRAS_Z0,
     COMP_LAMINA_W, COMP_LAMINA_T, COMP_H),
    ('CAM-20', COMP_TETO_X0, COMP_TETO_Y0, COMP_TETO_Z,
     COMP_GUIA_W, COMP_GUIA_H, COMP_GUIA_T),
    ('CAM-20', COMP_TETO_X0, COMP_TETO_Y0 + COMP_QUADRO_H - COMP_GUIA_H,
     COMP_TETO_Z, COMP_GUIA_W, COMP_GUIA_H, COMP_GUIA_T),
    ('CAM-20', COMP_TRAS_X0, COMP_TRAS_Y, COMP_TRAS_Z0,
     COMP_GUIA_W, COMP_GUIA_T, COMP_GUIA_H),
    ('CAM-20', COMP_TRAS_X0, COMP_TRAS_Y, COMP_TRAS_Z0 + COMP_QUADRO_H - COMP_GUIA_H,
     COMP_GUIA_W, COMP_GUIA_T, COMP_GUIA_H),
    # --- tampa do duto: fecha o topo do canal, rente com o teto -------------
    ('CAM-21', -DUTO_X_OUT, DUTO_Y0, CAP_DUTO_Z0, DUTO_W, DUTO_D, CAP_DUTO_T),
    ('CAM-21', W_GROSS, DUTO_Y0, CAP_DUTO_Z0, DUTO_W, DUTO_D, CAP_DUTO_T),
]

# CAM-23: quatro blocos empilhados a partir da plataforma superior ate o teto.
for _cx,_cy in PTC_BLOCO_CENTROS:
    for _k in range(PTC_BLOCO_CAMADAS):
        POSES.append(('CAM-23',_cx-PTC_BLOCO_L/2,_cy-PTC_BLOCO_L/2,
                      PLAT_Z1+_k*PTC_BLOCO_T,PTC_BLOCO_L,PTC_BLOCO_L,PTC_BLOCO_T))


def poses_de(cod):
    """Todas as colocacoes de um codigo."""
    return [p for p in POSES if p[0] == cod]


def rod_global():
    """As 4 posicoes (X, Y) dos tirantes no quadro interno bruto."""
    return [(x, y) for x in ROD_X for y in ROD_Y]


def lamp_global():
    """Nao ha mais furos para lampadas no teto V12; suportes vao nas laterais."""
    return []


def lamp_wall_holes():
    """Centros (profundidade,altura) de 8 furos por lateral para 4 cantoneiras."""
    return [(cy+dy,LAMP_L_PAREDE_Z) for cy in LAMP_L_CENTROS_Y for dy in LAMP_L_PAR_M4_Y]


def boca_global():
    """As 4 bocas dos dutos: (X0, X1, Y0, Y1, Z0, Z1) — 2 por lateral."""
    out = []
    for x0 in (-ACR, W_GROSS):
        out.append((x0, x0 + ACR, DUTO_Y0, DUTO_Y1, BOCA_INF_Z0, BOCA_INF_Z1))
        out.append((x0, x0 + ACR, DUTO_Y0, DUTO_Y1, BOCA_SUP_Z0, BOCA_SUP_Z1))
    return out


def volume_pecas():
    """Volume ocupado pelos conjuntos internos, em litros."""
    vol_ptc = (PLAT_W * PLAT_D * PLAT_T + SUP_W * SUP_D * SUP_T
               + ESC_W * ESC_D * ESC_T + PTC_W * PTC_D * PTC_H) / 1e6
    vol_pel = PEL_ABERTURA_W * PEL_SALIENCIA * PEL_ABERTURA_H / 1e6
    return vol_ptc, vol_pel


def resumo():
    vol_bruto = W_GROSS * D_GROSS * H_GROSS / 1e6
    vol_util = W_NET * D_NET * H_NET / 1e6
    vol_ptc, vol_pel = volume_pecas()
    return {
        'isolante_mm': E,
        'bruto_mm': (W_GROSS, D_GROSS, H_GROSS),
        'util_mm': (W_NET, D_NET, H_NET),
        'externo_mm': (BODY_W, BODY_D, BODY_H),
        'total_com_dutos_mm': (TOTAL_W, BODY_D, BODY_H),
        'largura_max_com_alojamentos_mm': TOTAL_W_MAX,
        'vol_bruto_L': round(vol_bruto, 3),
        'vol_util_L': round(vol_util, 3),
        'vol_conj_ptc_L': round(vol_ptc, 3),
        'vol_dissipador_L': round(vol_pel, 3),
        'vol_livre_L': round(vol_util - vol_ptc - vol_pel, 3),
        'area_interna_m2': round(2 * (W_GROSS * H_GROSS + D_GROSS * H_GROSS
                                      + W_GROSS * D_GROSS) / 1e6, 4),
    }


# =============================================================================
# 13. SANIDADE — o arquivo se recusa a carregar incoerente
# =============================================================================
def _checa():
    assert abs(TOTAL_W - 390.0) < 1e-6, f'largura total {TOTAL_W} != 390'
    assert abs(BODY_D - 210.0) < 1e-6, f'profundidade externa {BODY_D} != 210'
    assert DUTO_Y1 <= D_GROSS, 'duto passa da traseira'
    assert ALOJ_Y0 >= 0 and ALOJ_Y1 <= D_GROSS, 'alojamento passa da parede'
    assert VENT_Z1 <= FLANGE_Z0, 'ventoinha invade flange ou duto estreito'
    assert BOCA_INF_Z1 < FLANGE_Z0, 'boca inferior sobe acima da flange'
    assert BOCA_SUP_Z1 <= DUTO_Z1, 'boca superior passa do topo do duto'
    # o canal tem de estar FECHADO em cima: sem a tampa ele sopra para o ambiente
    assert abs(CAP_DUTO_Z1 - (H_GROSS + ACR)) < 1e-6, 'tampa do duto fora do nivel do teto'
    assert BOCA_SUP_Z1 <= CAP_DUTO_Z0, 'boca superior acima da tampa do duto'
    assert ALOJ_L-2*ACR >= VENT_D+4, 'alojamento util insuficiente para ventoinha de 40 mm'
    assert TOTAL_W_MAX >= TOTAL_W, 'largura maxima dos alojamentos incoerente'
    assert FLANGE_L > VENT_D, 'flange menor que a ventoinha'
    assert FLANGE_L - VENT_D >= 12.0, 'flange sem aba para os furos M3'
    assert VENT_ABERTURA < VENT_D, 'abertura maior que a ventoinha'
    assert PEL_Z0 >= TRAS_FIXA_H, 'vao do Peltier cai na traseira fixa'
    assert CALHA_Z + CALHA_ABA_MM < PEL_Z0, 'calha invade dissipador frio'
    assert CALHA_X0 <= PEL_X0 and CALHA_X0 + CALHA_W >= PEL_X1, 'calha nao cobre largura da regiao fria'
    assert CALHA_Y0 <= D_GROSS - PEL_SALIENCIA, 'calha nao cobre projecao do dissipador para dentro'
    assert CALHA_Y0 + CALHA_D <= D_GROSS, 'calha penetra a parede traseira'
    assert CALHA_Y0 > PTC_Y0 + PTC_D + 20, 'calha perto demais do PTC'
    assert DRENO_Z_PAREDE - DRENO_DIAMETRO_REFERENCIA/2 > TRAS_FIXA_H+5, 'dreno sobre a junta inferior'
    assert DRENO_Z_PAREDE < CALHA_Z, 'dreno nao desce da base da calha'
    assert DRENO_X > CALHA_X0 + CALHA_ABA_MM and DRENO_X < CALHA_X0 + CALHA_W - CALHA_ABA_MM, 'dreno fora da calha'
    assert CALHA_APOIOS_X[0] + CALHA_SUP_D/2 < PEL_X0 and CALHA_APOIOS_X[1] - CALHA_SUP_D/2 > PEL_X1, 'apoios invadem a projecao do kit'
    assert ESC_REC_W > PTC_W and ESC_REC_H > PTC_D, 'escudo aperta o PTC'
    assert ESC_Z1 > PTC_Z0, 'escudo abaixo do PTC'
    assert PLAT_Z1 < H_NET, 'plataforma acima do teto util'
    assert COMP_TRAS_Z0 + COMP_H < TRAS_FIXA_H, 'comporta da traseira invade a tampa'
    assert PORTA_W <= W_GROSS and PORTA_H <= H_GROSS, 'porta maior que o vao'
    assert abs(PTC_BLOCO_H - (H_GROSS-PLAT_Z1)) < 1.1, 'blocos nao chegam ao teto'
    assert LAMP_BANDEJA_Y0+LAMP_BANDEJA_D < CALHA_Y0, 'bandeja das lampadas invade coletor'
    assert LAMP_BANDEJA_Z0+LAMP_T < CALHA_Z-20, 'bandeja proxima demais a calha'
    assert LAMP_BANDEJA_Z0+LAMP_T+40 < PTC_Z0, 'bandeja proxima demais do PTC'
    assert VENT_INTERNA and VENT_IN_ABERTURA <= DUTO_D-4, 'fan e sua boca devem caber'
    assert VENT_IN_CZ-VENT_D/2>5.0, 'ventoinha invade piso'
    assert VENT_IN_CZ+VENT_D/2<=DUTO_Z0, 'ventoinha sobrepoe plenum/canal'
    assert ALOJ_X_ESQ + ALOJ_L <= 0.0, 'alojamento esquerdo invade a camara'
    assert ALOJ_X_DIR >= W_GROSS, 'alojamento direito invade a camara'
    # contagem de colocacoes tem de casar com a quantidade de cada peca
    from collections import Counter
    c = Counter(p[0] for p in POSES)
    esperado = {'CAM-03': 2, 'CAM-08': 6, 'CAM-09': 6, 'CAM-10': 2,
                'CAM-11': 2, 'CAM-16': 2, 'CAM-18': 2,
                'CAM-19': 2, 'CAM-20': 4, 'CAM-21': 2, 'CAM-22': 2,
                'CAM-23': 16, 'CAM-24': 4, 'CAM-25': 1}
    for cod, n in esperado.items():
        assert c[cod] == n, f'{cod}: {c[cod]} colocacoes, esperado {n}'


_checa()


if __name__ == '__main__':
    from collections import Counter
    r = resumo()
    print('  V12 — CAMARA 310 x 210 x 260 EXTERNA, DUTOS EXTERNOS')
    print('  ' + '-' * 56)
    for k, v in r.items():
        print(f'  {k:22} {v}')
    print()
    print(f'  largura com dutos: {TOTAL_W:g} mm; com alojamentos: {TOTAL_W_MAX:g} mm '
          f'({BODY_W:g} + 2 x {DUTO_W:g})')
    print(f'  alojamento da ventoinha: {ALOJ_L:g} x {ALOJ_L:g} x {ALOJ_H:g} '
          f'(flange {FLANGE_L:g}, furo D{VENT_ABERTURA:g}, passo {VENT_PASSO:g})')
    print(f'  bocas por lateral: Z {BOCA_INF_Z0:g}..{BOCA_INF_Z1:g} e '
          f'{BOCA_SUP_Z0:g}..{BOCA_SUP_Z1:g}')
    print(f'  colocacoes na tabela POSES: {len(POSES)} pecas fisicas')
    for cod, n in sorted(Counter(p[0] for p in POSES).items()):
        print(f'    {cod} x{n}')
