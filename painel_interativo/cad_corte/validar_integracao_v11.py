# -*- coding: utf-8 -*-
"""Checks adicionais, independentes dos 2016 testes herdados da V10."""
import parametros_v11 as P
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
for n in ('DETALHE_FANS_FRIAS_V11.dxf','DETALHE_ENTRADAS_CABOS_V11.dxf','LAYOUT_PAINEL_DETALHADO_V11.dxf'):
    ck('prancha '+n,(R/'camara'/'03_montagem'/n).exists())
passou=sum(ok for _,ok in checks)
print(f'INTEGRACAO V11: {passou}/{len(checks)} TESTES PASSARAM')
for label,ok in checks:
    print(('OK     ' if ok else 'FALHA  ')+label)
if passou!=len(checks):raise SystemExit(1)
