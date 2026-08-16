/**
 * Confere a fiação do painel contra as canaletas.
 *
 * Três coisas que só um script pega:
 *   1. a rota existe de verdade — canaletas seguidas têm que se TOCAR;
 *   2. nenhum fio de sinal entra em canaleta de potência (e vice-versa);
 *   3. o destino de cada fio é um borne que existe e está marcado como
 *      usado no inventário.
 */
import { COMPONENTES, CANALETAS, CANALETAS_PORTA, CAIXA, PLACA, TRILHOS }
  from '../src/data/painel_completo.js';
import { PRENSAS_PAINEL, FIOS, ETAPAS } from '../src/data/fiacao.js';

const erros = [], avisos = [];
const TODAS = [...CANALETAS, ...CANALETAS_PORTA];
const canal = id => TODAS.find(k => k.id === id);

/* duas canaletas se tocam se os retângulos delas se sobrepõem */
const tocam = (a, b) =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

console.log(`\n=== ${FIOS.length} fios · etapa(s) `
  + `${[...new Set(FIOS.map(f => f.etapa))].join(', ')} ===`);

for (const f of FIOS) {
  /* ── 1. a rota é contínua? ────────────────────────────────────────── */
  const ks = f.rota.map(id => ({ id, k: canal(id) }));
  for (const { id, k } of ks) if (!k) erros.push(`${f.n}: a canaleta ${id} não existe`);
  if (ks.some(x => !x.k)) continue;

  for (let i = 1; i < ks.length; i++)
    if (!tocam(ks[i - 1].k, ks[i].k))
      erros.push(`${f.n} (${f.nome}): ${ks[i - 1].id} e ${ks[i].id} não se tocam — `
        + 'o fio teria que atravessar o vazio entre elas');

  /* ── 2. segregação ────────────────────────────────────────────────── */
  if (f.classe !== 'comum')
    for (const { id, k } of ks)
      if (k.tipo !== f.classe)
        erros.push(`${f.n} é ${f.classe} e passa pela ${id}, que é ${k.tipo}`);

  /* ── 3. o destino existe e está declarado como usado? ─────────────── */
  const c = COMPONENTES.find(x => x.id === f.para.comp);
  if (!c) { erros.push(`${f.n}: o componente ${f.para.comp} não existe`); continue; }
  const via = c.grupos.flatMap(g => g.pinos).find(p => p.nome === f.para.via);
  if (!via) erros.push(`${f.n}: ${f.para.comp} não tem o borne ${f.para.via}`);
  else if (!via.usa)
    erros.push(`${f.n} chega em ${f.para.comp}.${f.para.via}, que o inventário diz estar LIVRE`);

  /* ── 4. o prensa-cabo existe? ─────────────────────────────────────── */
  if (f.de.prensa && !PRENSAS_PAINEL.some(p => p.id === f.de.prensa))
    erros.push(`${f.n}: o prensa-cabo ${f.de.prensa} não existe`);

  /* ── 5. a canaleta da entrada é a da base? ────────────────────────── */
  if (f.de.prensa) {
    const pr = PRENSAS_PAINEL.find(p => p.id === f.de.prensa);
    if (pr?.face === 'base' && !ks.some(x => x.k.y + x.k.h > CAIXA.altura - 70))
      erros.push(`${f.n} entra por baixo mas a rota não começa numa canaleta da base`);
  }
}

/* ── quantos condutores por prensa-cabo ─────────────────────────────── */
console.log('\n=== ocupação dos prensa-cabos ===');
for (const p of PRENSAS_PAINEL) {
  const fs = FIOS.filter(f => f.de.prensa === p.id);
  const secao = fs.reduce((a, f) => a + f.mm2, 0);
  const ok = fs.length <= p.capacidade;
  if (!ok) erros.push(`${p.id} leva ${fs.length} condutores e comporta ${p.capacidade}`);
  console.log(`  ${ok ? '.' : 'X'} ${p.id} (${p.tipo}, X=${p.x}): `
    + `${fs.length}/${p.capacidade} condutores · ${secao.toFixed(2)} mm² somados`);
  for (const f of fs)
    console.log(`      ${f.n} ${f.nome} — ${f.mm2} mm² ${f.corNome}`);
  if (!fs.length) avisos.push(`${p.id} está sem nenhum fio declarado`);
}

/* ── o 0 V é único? ─────────────────────────────────────────────────── */
console.log('\n=== o 0 V ===');
const zeros = FIOS.filter(f => f.classe === 'comum' && f.etapa === 1);
if (zeros.length !== 1)
  erros.push(`entram ${zeros.length} condutores de 0 V — o projeto é de UM só, `
    + 'porque os LM2596 dos postes não são isolados');
else console.log(`  . um único condutor de 0 V (${zeros[0].mm2} mm²), como manda a `
  + 'arquitetura de terra em estrela');

/* ── as rotas, em texto, para conferir na bancada ───────────────────── */
console.log('\n=== as rotas ===');
for (const f of FIOS)
  console.log(`  ${f.n}  ${f.de.prensa} → ${f.rota.join(' → ')} → `
    + `${f.para.comp}.${f.para.via}`.padEnd(26) + `  ${f.mm2} mm² ${f.corNome}`);

const feitas = ETAPAS.filter(e => e.feito).length;
console.log(`\netapas concluídas: ${feitas} de ${ETAPAS.length}`);
avisos.forEach(a => console.log('  ! ' + a));
if (erros.length) {
  console.log('\nERROS:');
  erros.forEach(e => console.log('  X ' + e));
  process.exit(1);
}
console.log('OK - toda rota existe, nada de sinal em canaleta de potência');
void PLACA; void TRILHOS;
