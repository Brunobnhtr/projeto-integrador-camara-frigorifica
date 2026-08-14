import { PLACA, BORNES, BARRAMENTO_0V, COMPONENTES_PI1, CI1, JUMPERS }
  from '../src/data/pi1_fisico.js';

const ocupa = new Map();            // "col,lin" -> [donos]
const por = (k, quem) => { if(!ocupa.has(k)) ocupa.set(k,[]); ocupa.get(k).push(quem); };
const erros = [], avisos = [];

COMPONENTES_PI1.forEach(c => c.furos.forEach(([a,b]) => por(`${a},${b}`, c.ref)));
CI1.pinos.forEach(p => por(`${p.col},${p.lin}`, `CI1.${p.nome}`));
BORNES.forEach(b => b.vias.forEach(v => por(`${v.col},${b.linha}`, `${b.ref}-${v.n}`)));

// 1. dois componentes no mesmo furo
for (const [k, donos] of ocupa)
  if (donos.length > 1) erros.push(`furo (${k}) disputado por: ${donos.join(', ')}`);

// 2. limites da placa
const fora = (c,l) => c<1 || c>PLACA.colunas || l<1 || l>PLACA.linhas;
for (const [k] of ocupa) { const [c,l]=k.split(',').map(Number);
  if (fora(c,l)) erros.push(`furo (${k}) fora da placa`); }

// 3. jumpers precisam pousar em furo util
const valido = new Set([...ocupa.keys()]);
for (let c=BARRAMENTO_0V.de; c<=BARRAMENTO_0V.ate; c++) valido.add(`${c},${BARRAMENTO_0V.linha}`);
JUMPERS.forEach(j => {
  [j.de, j.para].forEach(([c,l]) => {
    if (fora(c,l)) erros.push(`jumper ${j.n} pousa fora da placa em (${c},${l})`);
    else if (!valido.has(`${c},${l}`))
      erros.push(`jumper ${j.n} (${j.sinal}) pousa em furo VAZIO (${c},${l})`);
  });
});

// 4. o corpo do CI nao pode invadir outro componente
CI1.pinos.forEach(p => { const k=`${p.col},${p.lin}`;
  const d=ocupa.get(k)||[]; if(d.length>1) erros.push(`CI invade ${k}`); });
for (let c=CI1.colEsq; c<=CI1.colDir; c++)
  for (let l=CI1.linhaTopo+1; l<CI1.linhaBase; l++)
    if (ocupa.has(`${c},${l}`)) erros.push(`algo sob o corpo do CI em (${c},${l})`);

// 5. barramento de 0V nao pode cruzar furo de sinal
for (let c=BARRAMENTO_0V.de; c<=BARRAMENTO_0V.ate; c++) {
  const donos = ocupa.get(`${c},${BARRAMENTO_0V.linha}`) || [];
  donos.forEach(d => {
    const ok = COMPONENTES_PI1.some(x => x.ref===d &&
      x.furos.some(([a,b]) => a===c && b===BARRAMENTO_0V.linha));
    if (!ok) erros.push(`barramento 0V encosta em ${d} na coluna ${c}`);
  });
}

// 6. bornes cabem na largura
BORNES.forEach(b => {
  const larg = (b.vias.length) * 5.08;
  if (larg > PLACA.larguraMm)
    erros.push(`${b.ref}: ${b.vias.length} vias = ${larg.toFixed(1)} mm > placa ${PLACA.larguraMm.toFixed(1)} mm`);
  else avisos.push(`${b.ref}: ${b.vias.length} vias = ${larg.toFixed(1)} mm  (placa tem ${PLACA.larguraMm.toFixed(1)} mm) OK`);
});

// 7. toda via de borne tem de estar num jumper OU num componente
const tocados = new Set();
JUMPERS.forEach(j => { tocados.add(j.de.join(',')); tocados.add(j.para.join(',')); });
COMPONENTES_PI1.forEach(c => c.furos.forEach(f => tocados.add(f.join(','))));
BORNES.forEach(b => b.vias.forEach(v => {
  if (!tocados.has(`${v.col},${b.linha}`))
    erros.push(`${b.ref}-${v.n} (${v.sinal}) nao tem nenhuma ligacao!`);
}));

console.log(`placa: ${PLACA.colunas}x${PLACA.linhas} furos = ${PLACA.larguraMm.toFixed(1)} x ${PLACA.alturaMm.toFixed(1)} mm`);
console.log(`furos usados: ${ocupa.size} de ${PLACA.colunas*PLACA.linhas}`);
console.log(`componentes: ${COMPONENTES_PI1.length} + CI  ·  jumpers: ${JUMPERS.length}`);
avisos.forEach(a => console.log('  . ' + a));
if (erros.length) { console.log('\nERROS:'); erros.forEach(e => console.log('  X ' + e)); process.exit(1); }
console.log('\nOK - layout consistente');
