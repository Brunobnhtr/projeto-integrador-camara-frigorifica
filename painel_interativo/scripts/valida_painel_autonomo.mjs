/**
 * O PAINEL FECHA SOZINHO — E A MEDIÇÃO É POR MODBUS.
 *
 * Este script guarda as decisões que custaram uma refatoração inteira, para
 * que elas não voltem por distração:
 *
 *   1. a alimentação interna nasce e morre dentro do painel (nada de maquete);
 *   2. a medição é UM módulo N4AIC24 num par trançado, não sensores analógicos;
 *   3. o divisor de tensão (SV-1) e os dois ACS712 não existem mais;
 *   4. o módulo é alimentado pelo 24 V PERMANENTE e mede o COMUTADO — se ele
 *      morresse junto com a potência, não saberia dizer que a potência caiu;
 *      as duas tensões (24 V e 12 V) entram nos canais V1 e V2, e é por isso
 *      que A2/A3 do Mega continuam livres;
 *   5. cada posição de ensaio tem o SEU canal, e o retorno passa pelo shunt.
 *
 * Qualquer um destes quebrado aqui é erro de arquitetura, não de desenho.
 */
import assert from 'node:assert/strict';
import {FIOS} from '../src/data/fiacao.js';
import {COMPONENTES} from '../src/data/painel_completo.js';
import {TODOS} from '../src/data/guia_painel_atual.js';

const ids=new Set(COMPONENTES.map(c=>c.id));

/* ── 1. as peças da cadeia de alimentação e de medição existem ─────── */
for(const id of ['Q0','PS1','F-R','T2','T3','PE','BD-12V','MEGA','MAX485','N4AIC24'])
  assert(ids.has(id),`Falta ${id}`);

/* ── 2. e as que foram aposentadas não voltaram ───────────────────── */
for(const id of ['SV-1','ACS712-1','ACS712-2','ADC_Modbus'])
  assert(!ids.has(id),`${id} foi aposentado e não deve voltar ao painel`);
assert(!FIOS.some(f=>[f.de,f.para].some(p=>/^(SV-1|ACS712-\d|ADC_Modbus)$/.test(p.comp??''))),
  'sobrou fio apontando para uma peça aposentada');

/* ── 3. nada depende da maquete para se alimentar ─────────────────── */
assert(!FIOS.some(f=>f.de.maquete||f.para.maquete),'Alimentação ainda depende da maquete');

/* ── 4. o módulo é medido pelo lado certo ─────────────────────────── */
const liga=(a,p,b,q)=>FIOS.some(f=>f.de.comp===a&&f.de.via===p&&f.para.comp===b&&f.para.via===q);
const vem=(a,p,b,q)=>liga(b,q,a,p);

assert(vem('N4AIC24','V+','BD-24V','O3'),
  'o módulo tem que ser alimentado pelo 24 V PERMANENTE (BD-24V), não pelo comutado');
assert(vem('N4AIC24','V1','BD-POT','O3'),
  'V1 deve medir o 24 V COMUTADO (BD-POT) — é o antigo fio do D25');
assert(vem('N4AIC24','V2','BD-12V','O3'),
  'V2 deve medir o 12 V das posições de ensaio (BD-12V)');
assert(liga('N4AIC24','GND','BD-0V-B','Z22'),
  'o GND é o retorno ÚNICO do módulo (alimentação + shunts) e tem de fechar no BD-0V-B');

/* ⭐ O BORNE `COM` NÃO EXISTE — e este teste existe para ele não voltar.
   A pinagem publicada do N4AIC24 é VIN, GND, I1..I22, V1+, V2+, A+ e B−. O nó
   comum dos 22 shunts é o próprio GND. Modelar um COM separado criava um
   segundo fio de retorno para o MESMO terminal físico, e o orçamento passava a
   contar 136 fios e 219 terminais onde existem 133 e 213 (apos retirar a
   ligacao legada BD-POT -> BTS2 e os cabos BTS2 -> PTC, ainda sem topologia
   aprovada). */
const bornesDe = id => {
  const c = COMPONENTES.find(x => x.id === id);
  return (c.grupos ?? []).flatMap(g => (g.pinos ?? []).map(p => p.nome));
};
assert(!bornesDe('N4AIC24').includes('COM'),
  'o N4AIC24 NÃO tem borne COM (a pinagem é VIN, GND, I1..I22, V1+, V2+, A+, B−): ' +
  'o nó comum dos shunts é o GND. Um COM fictício parte o retorno em dois fios para o mesmo terminal');
assert(!FIOS.some(f => [f.de, f.para].some(p => p.comp === 'N4AIC24' && p.via === 'COM')),
  'sobrou fio ligado num borne COM do N4AIC24 que não existe');

assert(!ids.has('DIV-V'),'o divisor externo não é mais necessário: V1 e V2 leem 0–30 V direto');

/* ── 5. o RS-485 chega no Mega pelos pinos do Serial3 ─────────────── */
assert(liga('N4AIC24','A','MAX485','A')&&liga('N4AIC24','B','MAX485','B'),
  'o par A/B tem que ligar o módulo ao MAX485');
assert(liga('MAX485','RO','MEGA','D15'),'RO deve entrar no RX3 (D15)');
assert(liga('MAX485','DI','MEGA','D14'),'DI deve sair do TX3 (D14)');
assert(liga('MAX485','DE/RE','MEGA','D26'),'DE/RE deve ser comandado pelo D26');

/* ── 6. cada posição de ensaio tem o seu canal, e o retorno é medido ─ */
/* são 8 posições em 2 placas de 4 canais: PL-1 leva r1..r4 em I1..I4,
   PL-2 leva r1..r4 em I5..I8 */
const dut=(k)=>FIOS.some(f=>f.de.camara===`PL-${k<=4?1:2}`
                              &&f.de.borne===`r${k<=4?k:k-4}`
                              &&f.para.comp==='N4AIC24'&&f.para.via===`I${k}`);
for(let k=1;k<=8;k++)
  assert(dut(k),`o retorno da posição ${k} tem que entrar no canal I${k}`);
assert(!FIOS.some(f=>f.de.camara&&/^PL-/.test(f.de.camara)&&f.para.comp==='BD-0V-B'),
  'retorno de posição ligado direto no 0 V: a posição acende e a corrente lê zero');

/* ── 7. as entradas analógicas ficaram livres de verdade ──────────── */
const mega=COMPONENTES.find(c=>c.id==='MEGA');
const pinos=mega.grupos.flatMap(g=>g.pinos);
for(const p of ['A2','A3'])
  assert(!pinos.find(x=>x.nome===p)?.usa,`${p} deveria estar livre — a medição é por Modbus`);
const analogicosUsados=pinos.filter(x=>/^A\d+$/.test(x.nome)&&x.usa).map(x=>x.nome).sort();
assert.deepEqual(analogicosUsados,['A0','A1','A8'],
  `entradas analógicas em uso mudaram: ${analogicosUsados.join(', ')}`);

/* ── 8. o guia continua cobrindo todos os condutores, uma vez cada ── */
const guiados=TODOS.flatMap(p=>p.fios??[]).map(f=>f.n);
assert.equal(guiados.length,FIOS.length);
assert.equal(new Set(guiados).size,FIOS.length);
assert(TODOS.some(p=>p.id==='B-01')&&TODOS.some(p=>p.id==='D-03'));

console.log(`OK: alimentação interna, medição por Modbus (1 módulo, 22 correntes + 2 tensões) `
  +`e ${FIOS.length} condutores únicos no guia.`);
