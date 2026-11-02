import fs from 'node:fs';
import {FIOS} from '../src/data/fiacao.js';
import {CAIXA,CANALETAS,CANALETAS_PORTA} from '../src/data/painel_completo.js';
import {PECAS,RESUMO} from '../src/data/montagem.js';
import {comporPainel,tracarFio} from '../src/lib/geometria_painel.js';
import {caminhoCamara} from '../src/lib/rota_camara.js';
const soma=p=>p.slice(1).reduce((n,b,i)=>n+Math.hypot(b[0]-p[i][0],b[1]-p[i][1]),0);
const comps=comporPainel(), grupos=new Map(),detalhes=[];
for(const [i,f] of FIOS.entries()){
 const rota=tracarFio(f,comps,i).pts;
 let mm=soma(rota);
 const porta=[f.de,f.para].some(p=>comps.find(c=>c.id===p.comp)?.porta);
 if(porta)mm+=500; // reserva para profundidade, flexão e abertura; desenho é plano
 let externo=0;
 if(f.etapa===6){
  const caminho=caminhoCamara(f.n);
  externo=1000+(caminho?soma(caminho.pontos):400);
  mm+=externo;
 }
 const corte=(mm+200)/1000; // 100 mm por ponta, antes da margem coletiva
 detalhes.push({fio:f.n,secao:f.mm2,func:f.func,rotaPlana_m:+(soma(rota)/1000).toFixed(3),portaReserva_m:porta?.5:0,externo_m:+(externo/1000).toFixed(3),corteEstimado_m:+corte.toFixed(3)});
 if(f.de.prensa)continue; // cabo de entrada 3 vias, cotado à parte
 const par=['D28k','D28l'].includes(f.n);
 if(par)continue; // A/B comprado como um cabo par trançado
 const key=f.mm2+'|'+f.func;
 const g=grupos.get(key)??{secao:f.mm2,func:f.func,cor:f.corNome??f.func,condutores:0,bruto_m:0};
 g.condutores++;g.bruto_m+=corte;grupos.set(key,g);
}
const cabos=[...grupos.values()].map(g=>({...g,bruto_m:+g.bruto_m.toFixed(2),compra_m:Math.ceil(g.bruto_m*1.15)}));
const areas={};
for(const p of PECAS){
 const area=p.id==='PM'?(2*210*10+2*230*10):p.qtd*p.l*p.a;
 areas[p.esp]=(areas[p.esp]??0)+area/1e6;
}
const canaletas=[['placa',CANALETAS],['porta',CANALETAS_PORTA]].map(([nome,ks])=>({nome,liquido_m:+(ks.reduce((s,k)=>s+(k.vertical?k.h:k.w),0)/1000).toFixed(3),compraBarras2m:Math.ceil(ks.reduce((s,k)=>s+(k.vertical?k.h:k.w),0)*1.15/2000)}));
const dados={
 premissas:['Estimativa de compra, não lista de corte definitiva. Rotas do desenho em mm; não usar posições em pixels da vista antiga da câmara.','Somar 0,20 m por condutor para terminações, 0,50 m para cada ligação à porta e 15% de margem coletiva. Arredondar compra por seção/função ao metro superior.','Para cada condutor painel-câmara: 1,00 m de percurso externo reservado + rota interna modelada (ou 0,40 m para tampa). Confirmar após posicionar as peças.','Cabo AC de entrada: proposta 3 m de cabo 3 vias, seção a dimensionar. A/B: comprar 2 m de cabo de um par trançado blindado, não dois fios avulsos.','Não inclui fios já internos aos kits, nem duplicação de cabos de fans. Acrescentar 2 m de 0,75 mm² por cor para derivações internas de ventiladores e dois vínculos PE de 0,8 m cada; seção PE a definir.'],
 painel_mm:CAIXA,camara:RESUMO,
 base:{l:1400,p:600,esp:18,calculo:'50 margem + 700 painel + 150 separação + 400 envelope reservado para câmara e acessórios + 100 margem = 1400 mm. Profundidade: 100 frente + 300 envelope reservado + 200 traseira = 600 mm. Pinus 18 mm sobre bancada; validar rigidez e ancoragem do painel vertical, não constitui mesa com pés dimensionada.'},
 areasAcrilico_m2:areas,canaletas,cabos,detalhes,
 epdm:{perimetro_m:1.08,compra_m:1.5},fitaAluminio:{areaOpaca_m2:.3262,compra_m:20,nota:'Duas faces opacas do corpo e dutos, fita 50 mm, margem para sobreposição e recortes. Um rolo de 20 m; não cobrir vidros de observação.'},
};
fs.writeFileSync(new URL('../../tmp/pdfs/dimensionamento_compras.json',import.meta.url),JSON.stringify(dados,null,2));
console.log(JSON.stringify({cabos,areas,canaletas},null,2));
