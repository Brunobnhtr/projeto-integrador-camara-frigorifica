/**
 * Confere o layout da PI-2 antes de alguém soldar.
 *
 * Mesma regra da PI-1: UM FURO, UMA PERNA. E mais duas que só existem
 * aqui, porque esta placa tem MÓDULOS em vez de CI nu:
 *   · nenhum jumper pode terminar no vazio — todo ponto de solda tem
 *     que ser um pino, uma via de borne, um nó ou o barramento;
 *   · o EN do multiplexador TEM que estar preso no 0 V.
 */
import {
  PLACA, BORNES, BARRAMENTO_0V, COMPONENTES_PI2, MODULOS, NOS, JUMPERS, CIRCUITOS,
} from '../src/data/pi2_fisico.js';
import { rotear, conflitos } from '../src/lib/roteador.js';
import { COMPONENTES as PAINEL } from '../src/data/painel_completo.js';

const erros = [], avisos = [];
const err = m => erros.push(m);
const avi = m => avisos.push(m);

/* ── 1. um furo, uma perna ─────────────────────────────────────────── */
const passantes = new Map();
const põe = (c, l, quem) => {
  const k = `${c},${l}`;
  if (!passantes.has(k)) passantes.set(k, []);
  passantes.get(k).push(quem);
};
COMPONENTES_PI2.forEach(c => c.furos.forEach(([a, b]) => põe(a, b, c.ref)));
MODULOS.forEach(m => m.pinos.forEach(p => põe(p.col, p.lin, `${m.ref}.${p.nome}`)));
BORNES.forEach(b => b.vias.forEach(v => põe(v.col, b.linha, `${b.ref}-${v.n}`)));

for (const [k, quem] of passantes)
  if (quem.length > 1)
    err(`furo ${k} com ${quem.length} pernas passantes: ${quem.join(', ')} — `
      + 'furo de placa ilhada só aceita uma');

/* ── 2. nada fora da placa ─────────────────────────────────────────── */
const dentro = (c, l) => c >= 1 && c <= PLACA.colunas && l >= 1 && l <= PLACA.linhas;
for (const [k] of passantes) {
  const [c, l] = k.split(',').map(Number);
  if (!dentro(c, l)) err(`furo ${k} está fora da placa (${PLACA.colunas}×${PLACA.linhas})`);
}

/* ── 3. nenhum jumper termina no vazio ─────────────────────────────── */
const noBus = (c, l) =>
  l === BARRAMENTO_0V.linha && c >= BARRAMENTO_0V.de && c <= BARRAMENTO_0V.ate;
const noNo = (c, l) => NOS.some(n => n.linha === l && c >= n.de && c <= n.ate);

for (const j of JUMPERS) {
  for (const [c, l] of [j.de, j.para]) {
    if (!dentro(c, l)) { err(`jumper ${j.n} termina fora da placa em ${c},${l}`); continue; }
    if (passantes.has(`${c},${l}`) || noBus(c, l) || noNo(c, l)) continue;
    err(`jumper ${j.n} (${j.sinal}) termina no vazio em ${c},${l} — `
      + 'não é pino, via, nó nem barramento');
  }
}

/* ── 4. o EN preso no 0 V, que é o erro que apaga tudo ─────────────── */
const mux = MODULOS.find(m => m.valor.includes('4067'));
const en = mux?.pinos.find(p => p.nome === 'EN');
if (!en) err('o módulo do multiplexador não declara o pino EN');
else {
  const preso = JUMPERS.some(j =>
    [j.de, j.para].some(([c, l]) => c === en.col && l === en.lin) &&
    [j.de, j.para].some(([c, l]) => noBus(c, l)));
  if (!preso)
    err('🔥 o EN do mux NÃO está ligado ao barramento de 0 V — entrada CMOS solta '
      + 'oscila com ruído e TODAS as leituras dariam zero');
}

/* ── 5. cada shunt entre um nó e o barramento ──────────────────────── */
for (const r of COMPONENTES_PI2.filter(c => c.tipo === 'resistor')) {
  const [[c1, l1], [c2, l2]] = r.furos;
  const temNo = noNo(c1, l1) || noNo(c2, l2);
  const temBus = noBus(c1, l1) || noBus(c2, l2);
  if (!temNo) err(`${r.ref} não tem perna em nenhum nó — não há o que medir`);
  if (!temBus) err(`${r.ref} não chega ao barramento de 0 V — a corrente não fecha`);
}

/* ── 6. todo pino usado de módulo tem jumper ───────────────────────── */
const pontas = new Set(JUMPERS.flatMap(j => [j.de, j.para]).map(([c, l]) => `${c},${l}`));
for (const m of MODULOS)
  for (const p of m.pinos.filter(x => !x.livre))
    if (!pontas.has(`${p.col},${p.lin}`))
      err(`${m.ref}.${p.nome} está marcado como usado mas nenhum jumper chega nele`);

/* ── 7. toda via usada de borne tem jumper ─────────────────────────── */
for (const b of BORNES)
  for (const v of b.vias.filter(x => !x.livre))
    if (!pontas.has(`${v.col},${b.linha}`))
      avi(`${b.ref}-${v.n} (${v.sinal}) não tem jumper saindo dele`);

/* ── 8. bate com o que o painel diz da PI-2? ───────────────────────── */
const noPainel = PAINEL.find(c => c.id === 'PI-2');
if (!noPainel) err('a PI-2 não existe em painel_completo.js');
else {
  for (const g of noPainel.grupos) {
    const aqui = BORNES.find(b => b.ref === g.ref);
    if (!aqui) { err(`o painel declara o grupo ${g.ref} da PI-2, que não existe no layout`); continue; }
    const nomesPainel = g.pinos.map(p => p.nome);
    const nomesAqui = aqui.vias.map(v => v.sinal);
    if (nomesPainel.join('|') !== nomesAqui.join('|'))
      err(`${g.ref}: o painel diz [${nomesPainel.join(', ')}] e o layout diz `
        + `[${nomesAqui.join(', ')}]`);
  }
  const refsAqui = BORNES.map(b => b.ref);
  for (const r of refsAqui)
    if (!noPainel.grupos.some(g => g.ref === r))
      err(`o layout tem o borne ${r}, que o painel não conhece`);
}

/* ── 9. todo circuito declarado é usado ────────────────────────────── */
const usados = new Set([
  ...JUMPERS.map(j => j.circuito), ...COMPONENTES_PI2.map(c => c.circuito),
  ...MODULOS.map(m => m.circuito), ...NOS.map(n => n.circuito),
]);
for (const c of CIRCUITOS)
  if (!usados.has(c.id)) avi(`o circuito "${c.nome}" está declarado mas ninguém o usa`);

/* ── 10. a placa cortada sai da placa comprada? ────────────────────── */
let notaCorte = null;
if (PLACA.bruta) {
  const b = PLACA.bruta;
  if (b.colunas < PLACA.colunas)
    err(`a placa comprada tem ${b.colunas} colunas e o layout precisa de ${PLACA.colunas}`);
  if (b.linhas < PLACA.linhas)
    err(`a placa comprada tem ${b.linhas} fileiras e o layout precisa de ${PLACA.linhas}`);
  const pedacos = Math.floor(b.linhas / PLACA.linhas);
  if (pedacos < 2)
    avi(`de uma placa comprada sai ${pedacos} placa(s) — o projeto conta com 2`);
  const ultima = Math.max(...[...passantes.keys()].map(k => +k.split(',')[1]));
  if (ultima > PLACA.linhas)
    err(`há perna na fileira ${ultima}, depois do corte na ${PLACA.linhas + 1}`);
  else
    notaCorte = `  . de UMA placa de 9 × 15 cm (${b.colunas}×${b.linhas}) saem `
      + `${Math.floor(b.linhas / PLACA.linhas)} placas de ${PLACA.colunas}×${PLACA.linhas} `
      + `— a PI-1 e a PI-2`;
}

let notaFios = null;
/* ── 11. o roteamento dos fios fecha? ──────────────────────────────── */
const fios = rotear(JUMPERS, PLACA);
const conf = conflitos(fios);
for (const c of conf)
  err(`fios ${c.a} e ${c.b} disputam o canal ${c.canal} — o roteador não achou lugar`);
const maior = fios.reduce((a, f) => f.comprimento > a.comprimento ? f : a);
const hops = fios.reduce((a, f) => a + f.hops.length, 0);
if (maior.comprimento > 200)
  avi(`o fio ${maior.n} ficou com ${maior.comprimento.toFixed(0)} mm — muito longo `
    + 'para placa ilhada, considere reposicionar as pontas');
notaFios = `  . ${fios.length} fios roteados em ${new Set(fios.map(f => f.canal)).size} `
  + `canais · ${hops} cruzamentos · o maior tem ${maior.comprimento.toFixed(0)} mm`;

/* ── relatório ─────────────────────────────────────────────────────── */
console.log(`\nPI-2 · ${PLACA.colunas}×${PLACA.linhas} furos · `
  + `${PLACA.larguraMm.toFixed(0)}×${PLACA.alturaMm.toFixed(0)} mm`);
console.log(`  ${BORNES.reduce((a, b) => a + b.vias.length, 0)} vias de borne · `
  + `${MODULOS.length} módulos · ${COMPONENTES_PI2.length} discretos · `
  + `${JUMPERS.length} jumpers`);
if (notaCorte) console.log(notaCorte);

if (notaFios) console.log(notaFios);
avisos.forEach(a => console.log('  ! ' + a));
if (erros.length) {
  console.log('\nERROS:');
  erros.forEach(e => console.log('  X ' + e));
  process.exit(1);
}
console.log(`\nOK - layout consistente, um furo por perna (${avisos.length} aviso(s))`);
