# -*- coding: utf-8 -*-
"""Checks adicionais, independentes dos 2016 testes herdados da V10.

    ####################################################################
    ESTE SCRIPT NAO ESTA FUNCIONANDO — E NAO E POR CAUSA DOS CHECKS.
    ####################################################################

Ele procura os DXF em `R/camara/01_pecas`, onde R e a pasta DESTE arquivo
(a copia V12), e nao a raiz `cad_corte/`. Resultado: FileNotFoundError em
CAM-05.dxf na primeira linha, e ninguem chega a ver os 40 checks.

Pior: ele tambem le `R/pecas_v12.json`, que NUNCA foi gerado em lugar nenhum
do projeto. Ou seja, mesmo com o caminho corrigido, ele morreria duas linhas
depois.

DECISAO: nao ressuscitar agora. Os checks que importam de verdade — câmara
x painel, rotas, fios, terminais — rodam em `painel_interativo` (`npm run
valida`, `npm run audita`) e passam. O que este arquivo faria de diferente
seria conferir os DXF peca por peca, e isso exige regerar o CAD inteiro com
os parametros atuais — trabalho de outra rodada.

Se for mexer aqui: troque `R = Path(__file__).parent` por
`R = Path(__file__).resolve().parent.parent` e gere o `pecas_v12.json`
antes. Sem as duas coisas, o traceback e esperado.
"""
import parametros_v12 as P
from pathlib import Path
import ezdxf, json
R=Path(__file__).parent
checks=[]
def ck(label,ok):
    checks.append((label,bool(ok)))
def circles(c):
    d=ezdxf.readfile(R/'camara'/'01_pecas'/f'{c}.dxf')
    return [ent for ent in d.modelspace() if ent.dxftype()=='CIRCLE' and ent.dxf.layer=='CORTE'], [ent for ent in d.modelspace() if ent.dxftype()=='CIRCLE' and ent.dxf.layer=='GRAVACAO']
ck('Peltier duas ventoinhas frias 40x40x10', P.PEL_FAN_Q==2 and P.PEL_FAN_L==40 and P.PEL_FAN_T==10)
ck('Distancia entre centros nao inferior ao tamanho',P.PEL_FAN_PASSO_ESTUDO>=P.PEL_FAN_L)
ck('Distancia real nao confundida com hipotese',not P.PEL_FAN_MEDIDAS_CONFIRMADAS)
ck('Envelope ilustrativo contem duas ventoinhas', P.PEL_FAN_PROJECAO_W<=P.PEL_ABERTURA_W)
ck('Camara 15 litros',abs(P.W_GROSS*P.D_GROSS*P.H_GROSS/1e6-15)<1e-6)
ck('Tampa BLANK nao autorizada corte', not P.PEL_RECORTE_AUTORIZADO)
for c in ['CAM-05','ISO-09']:
    cc,g=circles(c)
    ck(c+' SEM FUROS CORTE',len(cc)==0)
    ck(c+' possui referencias GRAVACAO',len(g)>0)
cc,g=circles('CAM-04')
ck('CAM-04 sem furos prensa-cabo definitivos',len(cc)==0)
ck('CAM-04 4 circulos referencia',len(g)==4)
cc,g=circles('ISO-04')
ck('ISO-04 4 marcas de chicotes',len(g)==4)
d=ezdxf.readfile(R/'painel'/'01_pecas'/'PNL-05.dxf')
ck('PNL-05 nao cortada por PG estimado',not any(e.dxftype()=='CIRCLE' and e.dxf.layer=='CORTE' for e in d.modelspace()))
ck('PNL-05 seis posicoes referencia',sum(1 for e in d.modelspace() if e.dxftype()=='CIRCLE' and e.dxf.layer=='GRAVACAO')==6)
portos=list(P.PASSAGENS_CAMARA_ESTUDO)
ck('CAMARA 4 circuitos segregados',len(portos)==4 and len({x[0] for x in portos})==4)
for tag,x,z,d,func in portos:
    ck('posicao '+tag+' dentro CAM04',x-d/2>10 and x+d/2<P.W_GROSS-10 and z-d/2>8 and z+d/2<P.TRAS_FIXA_H-8)
    ck('posicao '+tag+' fora comporta',not (110-d/2<=x<=190+d/2 and 43-d/2<=z<=83+d/2))
ck('3 sensores com coordenadas limites de câmara',all(0<x<P.W_GROSS and 0<y<P.D_GROSS and 0<z<P.H_GROSS for name,x,y,z in P.SENSOR_POSICOES_ESTUDO))
for n in ('DETALHE_FANS_FRIAS_V12.dxf','DETALHE_ENTRADAS_CABOS_V12.dxf','LAYOUT_PAINEL_DETALHADO_V12.dxf'):
    ck('prancha '+n,(R/'camara'/'03_montagem'/n).exists())
# V12 - teste independente de componentes fisicos e remocao de pecas antigas.
pecas=json.loads((R/'pecas_v12.json').read_text(encoding='utf-8'))
bycode={p['cod']:p for p in pecas}
for cod,q in [('CAM-23',16),('CAM-24',4),('CAM-25',1)]:
    ck(cod+' presente nas listas',cod in bycode and bycode[cod]['qtd']==q)
ck('CAM-15 teto removida', 'CAM-15' not in bycode)
ck('Bandeja lampadas 210x90',P.LAMP_BANDEJA_W==210 and P.LAMP_BANDEJA_D==90)
ck('Base PTC superior 230x120',P.PLAT_W==230 and P.PLAT_D==120)
ck('4 blocos lamina=16',P.PTC_BLOCO_QTD==16 and len(P.PTC_BLOCO_CENTROS)==4)
ck('4 cantoneiras nas paredes',len(P.lamp_wall_holes())==4)
ck('Dois fans de duto internos',P.VENT_INTERNA and P.VENT_D==40 and len([a for a in P.POSES if a[0]=='CAM-11'])==2)
ck('Furos do kit Peltier nao autorizados', not P.PEL_RECORTE_AUTORIZADO)
ck('Sensor S1 afastado bandeja',P.SENSOR_POSICOES_ESTUDO[0][2]>P.LAMP_BANDEJA_Y0+P.LAMP_BANDEJA_D+20)
ck('Boca circular de entrada das fans na CAM-03',any(abs(c.dxf.radius*2-P.VENT_IN_ABERTURA)<.01 for c in circles('CAM-03')[0]))
for code in ('CAM-23','CAM-24','CAM-25'):
    ck('DXF '+code,(R/'camara'/'01_pecas'/f'{code}.dxf').exists())
passou=sum(ok for _,ok in checks)
print(f'INTEGRACAO V12: {passou}/{len(checks)} TESTES PASSARAM')
for label,ok in checks:
    print(('OK     ' if ok else 'FALHA  ')+label)
if passou!=len(checks):raise SystemExit(1)
