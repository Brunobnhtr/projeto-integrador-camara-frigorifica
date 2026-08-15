import { TRAFO, FIOS, NIVEIS } from '../src/data/maquete.js';
const T2X=560, T3X=730, err=[];
const fim = f => f.caminho[f.caminho.length-1];
const ini = f => f.caminho[0];
const g = id => FIOS.find(f=>f.id===id);

// entradas devem POUSAR no topo do trafo
for (const [fio, x, tipo] of [
  [g('R2').derivacoes[0], T2X+TRAFO.dxEntrada24, 'R2 -> T2 (24 V)'],
  [g('R3').caminho,       T3X+TRAFO.dxEntrada24, 'R3 -> T3 (24 V)'],
  [g('GND').derivacoes[0],T2X+TRAFO.dxEntrada0,  '0 V -> T2'],
  [g('GND').derivacoes[1],T3X+TRAFO.dxEntrada0,  '0 V -> T3'],
]) {
  const p = fio[fio.length-1];
  if (p[1] !== TRAFO.topo) err.push(`${tipo}: termina em y=${p[1]}, o topo do trafo e ${TRAFO.topo}`);
  if (p[0] !== x) err.push(`${tipo}: termina em x=${p[0]}, o borne esta em ${x}`);
}
// saidas devem SAIR do borne de baixo
for (const [id, x, nome] of [['T2OUT',T2X,'T2'],['T3OUT',T3X,'T3']]) {
  const p = ini(g(id));
  if (p[1] !== TRAFO.base) err.push(`saida do ${nome}: comeca em y=${p[1]}, a base do trafo e ${TRAFO.base}`);
  if (p[0] !== x+TRAFO.dxSaida) err.push(`saida do ${nome}: comeca em x=${p[0]}, o borne esta em ${x}`);
}
// R3 nao pode chegar ao painel
if (fim(g('R3'))[1] === 300) err.push('R3 chega ao painel, e nao deveria');
// quantos fios chegam ao painel
const noPainel = FIOS.filter(f => fim(f)[1] === 300).map(f=>f.id);
console.log('chegam ao painel:', noPainel.join(', '), `(${noPainel.length})`);
console.log('trafo: topo', TRAFO.topo, '· base', TRAFO.base);
if (err.length) { console.log('\nERROS:'); err.forEach(e=>console.log('  X '+e)); process.exit(1); }
console.log('\nOK - entradas no topo, saidas na base');
