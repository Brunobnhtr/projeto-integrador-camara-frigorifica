/* Confere a câmara contra o painel. Duas coisas que só um script pega:
   1. todo fio que a câmara diz receber tem borne de verdade no painel;
   2. nenhum componente invade a parede nem encosta no vizinho.       */

import { COMPONENTES, UTIL, BASE_INT, TRAVESSIA } from '../src/data/camara.js';
import { COMPONENTES as PAINEL } from '../src/data/painel_completo.js';

let erros = 0, avisos = 0;
const err = m => { console.log('  X ' + m); erros++; };
const avi = m => { console.log('  ! ' + m); avisos++; };

/* ── 1. cada ref aponta para um borne existente ────────────────────── */
console.log('\n=== os fios da câmara existem no painel? ===');
const bornes = new Map();
for (const c of PAINEL) {
  for (const g of c.grupos || []) {
    for (const p of g.pinos || []) {
      bornes.set(`${c.id}|${p.nome}`, { comp: c, pino: p });
    }
  }
}

const usados = new Set();
for (const c of COMPONENTES) {
  for (const t of c.terminais) {
    if (!t.ref) { avi(`${c.id} · ${t.t}: sem ref, não dá para conferir`); continue; }
    const chave = t.ref.join('|');
    const b = bornes.get(chave);
    if (!b) { err(`${c.id} · ${t.t} → ${chave} NÃO EXISTE no painel`); continue; }
    if (!b.pino.usa) err(`${c.id} · ${t.t} → ${chave} existe mas está marcado como LIVRE`);
    usados.add(chave);
  }
}
if (!erros) console.log(`  . ${usados.size} bornes distintos, todos conferidos`);

/* ── 2. geometria: nada atravessa parede nem vizinho ───────────────── */
console.log('\n=== os componentes cabem onde foram postos? ===');
const dentro = c =>
  c.x >= UTIL.x1 && c.x + c.w <= UTIL.x2 && c.y >= UTIL.y1 && c.y + c.h <= UTIL.y2;

for (const c of COMPONENTES) {
  /* as do duto ficam de propósito fora do volume útil */
  if (c.id.startsWith('VD')) continue;
  if (!dentro(c)) {
    err(`${c.id} sai do volume útil: x ${c.x}–${c.x + c.w} (limite ${UTIL.x1}–${UTIL.x2}), `
      + `y ${c.y}–${c.y + c.h} (limite ${UTIL.y1}–${UTIL.y2})`);
  }
}

const bate = (a, b) =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
for (let i = 0; i < COMPONENTES.length; i++) {
  for (let j = i + 1; j < COMPONENTES.length; j++) {
    if (bate(COMPONENTES[i], COMPONENTES[j]))
      err(`${COMPONENTES[i].id} e ${COMPONENTES[j].id} estão sobrepostos`);
  }
}

/* os que ficam sobre a base interna não podem flutuar nem afundar */
for (const c of COMPONENTES.filter(c => c.tipo === 'dut' || c.id === 'PTC')) {
  const fundo = c.y + c.h;
  if (fundo > BASE_INT) err(`${c.id} afunda no plenum (fundo ${fundo} > base ${BASE_INT})`);
  else if (BASE_INT - fundo > 30) avi(`${c.id} está ${BASE_INT - fundo}px acima da base`);
}
if (!erros) console.log('  . nada invade parede, plenum ou vizinho');

/* ── 3. o sensor tem que estar longe das duas fontes ───────────────── */
console.log('\n=== o sensor está mesmo no meio? ===');
const s = COMPONENTES.find(c => c.tipo === 'sensor');
const cx = c => c.x + c.w / 2, cy = c => c.y + c.h / 2;

/* o texto do projeto promete "centro geométrico" — o script cobra */
const alvoX = (UTIL.x1 + UTIL.x2) / 2, alvoY = (UTIL.y1 + UTIL.y2) / 2;
const desvio = Math.hypot(cx(s) - alvoX, cy(s) - alvoY);
if (desvio > 8) err(`sensor a ${desvio.toFixed(0)}px do centro (${alvoX}, ${alvoY}) — `
                  + `está em (${cx(s)}, ${cy(s)}). O projeto promete "centro geométrico"`);
else console.log(`  . no centro geométrico (${alvoX}, ${alvoY}), desvio de ${desvio.toFixed(1)}px`);
for (const f of COMPONENTES.filter(c => c.tipo === 'frio' || c.tipo === 'quente')) {
  const d = Math.hypot(cx(s) - cx(f), cy(s) - cy(f));
  const rel = (d / (UTIL.y2 - UTIL.y1) * 100).toFixed(0);
  if (d < 60) err(`sensor a apenas ${d.toFixed(0)}px do ${f.id} — vai ler a fonte, não o ar`);
  else console.log(`  . ${f.id}: ${d.toFixed(0)}px (${rel}% da altura útil)`);
}

/* ── 4. a conta dos condutores fecha? ──────────────────────────────── */
console.log('\n=== os condutores da travessia batem? ===');
const decl = TRAVESSIA.reduce((a, t) => a + t.n, 0);
const reais = usados.size;
if (decl !== reais)
  err(`TRAVESSIA declara ${decl} condutores, mas os componentes usam ${reais} bornes`);
else console.log(`  . ${decl} condutores declarados = ${reais} bornes usados`);

console.log(erros ? `\nFALHOU — ${erros} erro(s), ${avisos} aviso(s)`
                  : `\nOK — câmara e painel batem (${avisos} aviso(s))`);
process.exit(erros ? 1 : 0);
