/**
 * Confere o layout da PI-1 antes de alguém soldar.
 *
 * A regra que mais importa: UM FURO, UMA PERNA. Furo de placa ilhada tem
 * ~1 mm; duas pernas já ficam apertadas e três não entram. Quando várias
 * pernas precisam se encontrar, isso é um NÓ — cada perna no seu furo, e
 * uma ponte de fio nu unindo os furos por baixo.
 */
import {
  PLACA, BORNES, BARRAMENTO_0V, COMPONENTES_PI1, CI1, NOS, JUMPERS,
} from '../src/data/pi1_fisico.js';
import { construirRede } from '../src/lib/rede.js';
import { rotear, conflitos } from '../src/lib/roteador.js';

/* Duas coisas MUITO diferentes disputam espaço num furo:
   · perna PASSANTE  — atravessa o furo (componente, pino do CI, borne).
                       Só cabe UMA.
   · fio de jumper   — solda no ANEL DE COBRE, por baixo. Não ocupa o
                       furo, então vários podem chegar na mesma ilha. */
const passantes = new Map();       // "col,lin" -> [quem atravessa]
const jumpers  = new Map();        // "col,lin" -> [quem solda no anel]
const erros = [], avisos = [];
const põe = (mapa, c, l, quem) => {
  const k = `${c},${l}`;
  if (!mapa.has(k)) mapa.set(k, []);
  mapa.get(k).push(quem);
};

COMPONENTES_PI1.forEach(c => c.furos.forEach(([a, b]) => põe(passantes, a, b, c.ref)));
/* ⭐ a placa pode não ter CI nenhum — foi o que aconteceu quando o
   sinaleiro virou de 5 V e o ULN2803A saiu (Doc 33 §33.8) */
CI1?.pinos.forEach(p => põe(passantes, p.col, p.lin, `CI1.${p.nome}`));
BORNES.forEach(b => b.vias.forEach(v => põe(passantes, v.col, b.linha, `${b.ref}-${v.n}`)));
JUMPERS.forEach(j => {
  põe(jumpers, j.de[0], j.de[1], `jumper ${j.n}`);
  põe(jumpers, j.para[0], j.para[1], `jumper ${j.n}`);
});
const pernas = passantes;

const fora = (c, l) => c < 1 || c > PLACA.colunas || l < 1 || l > PLACA.linhas;
const noBarramento = (c, l) =>
  l === BARRAMENTO_0V.linha && c >= BARRAMENTO_0V.de && c <= BARRAMENTO_0V.ate;
const noNo = (c, l) => NOS.some(n => n.linha === l && c >= n.de && c <= n.ate);

// 1. UM FURO, UMA PERNA PASSANTE
for (const [k, quem] of passantes)
  if (quem.length > 1)
    erros.push(`furo (${k}) com ${quem.length} pernas passantes: ${quem.join(' + ')}`
             + ` — use um NÓ (um furo por perna + ponte de fio nu)`);

// 1b. jumper tem de pousar numa ilha que exista de verdade
for (const [k, quem] of jumpers) {
  const [c, l] = k.split(',').map(Number);
  if (!passantes.has(k) && !noNo(c, l) && !noBarramento(c, l))
    erros.push(`${quem.join('/')} pousa em (${k}), que é ilha vazia`
             + ` — não há perna, nó nem barramento ali`);
}

// 1c. mais de 2 jumpers na mesma ilha fica difícil de soldar
for (const [k, quem] of jumpers)
  if (quem.length > 2)
    avisos.push(`ilha (${k}) recebe ${quem.length} jumpers — solda apertada, mas passa`);

// 2. tudo dentro da placa
for (const [k] of pernas) {
  const [c, l] = k.split(',').map(Number);
  if (fora(c, l)) erros.push(`furo (${k}) fora da placa`);
}

// 3. nada sob o corpo do CI
if (CI1) for (let c = CI1.colEsq; c <= CI1.colDir; c++)
  for (let l = CI1.linhaTopo + 1; l < CI1.linhaBase; l++)
    if (pernas.has(`${c},${l}`)) erros.push(`algo sob o corpo do CI em (${c},${l})`);

// 4. cada perna solta tem de estar num NÓ, no barramento ou num par direto
const ligados = new Set();
COMPONENTES_PI1.forEach(c => c.furos.forEach(([a, b]) => ligados.add(`${a},${b}`)));
CI1?.pinos.forEach(p => ligados.add(`${p.col},${p.lin}`));
JUMPERS.forEach(j => { ligados.add(j.de.join(',')); ligados.add(j.para.join(',')); });

const livres = new Set((CI1?.pinos ?? []).filter(p => p.livre).map(p => `${p.col},${p.lin}`));
for (const [k, quem] of passantes) {
  const [c, l] = k.split(',').map(Number);
  if (livres.has(k)) continue;                       // pino do CI sem uso: ok
  const vias = BORNES.some(b => b.linha === l && b.vias.some(v => v.col === c));
  if (!vias && !noNo(c, l) && !noBarramento(c, l) && !jumpers.has(k))
    erros.push(`perna solta em (${k}): ${quem.join(', ')} — nenhum fio, nó ou barramento a alcança`);
}

// 5. cada NÓ declarado precisa mesmo unir 2+ pernas
NOS.forEach(no => {
  const dentro = [];
  for (let c = no.de; c <= no.ate; c++)
    if (passantes.has(`${c},${no.linha}`) || jumpers.has(`${c},${no.linha}`)) dentro.push(c);
  if (dentro.length < 2)
    erros.push(`${no.ref}: só ${dentro.length} perna(s) — um nó com uma perna não é nó`);
  else avisos.push(`${no.ref}: une ${dentro.length} pernas nos furos ${dentro.join(', ')} da linha ${no.linha}`);
  Object.keys(no.furos || {}).forEach(c => {
    if (!passantes.has(`${c},${no.linha}`) && !jumpers.has(`${c},${no.linha}`))
      erros.push(`${no.ref}: documenta o furo ${c} mas nada pousa lá`);
  });
});

// 6. bornes cabem na largura
BORNES.forEach(b => {
  const larg = b.vias.length * 5.08;
  const msg = `${b.ref}: ${b.vias.length} vias = ${larg.toFixed(1)} mm`;
  if (larg > PLACA.larguraMm) erros.push(`${msg} > placa ${PLACA.larguraMm.toFixed(1)} mm`);
  else avisos.push(`${msg} (placa tem ${PLACA.larguraMm.toFixed(1)} mm) OK`);
});

// 7. toda via de borne tem de ir a algum lugar
BORNES.forEach(b => b.vias.forEach(v => {
  if (!ligados.has(`${v.col},${b.linha}`))
    erros.push(`${b.ref}-${v.n} (${v.sinal}) não tem nenhuma ligação!`);
}));

const maxP = Math.max(...[...passantes.values()].map(v => v.length));
const maxJ = Math.max(...[...jumpers.values()].map(v => v.length));
let notaFios = null;
/* ── 11. o roteamento dos fios fecha? ──────────────────────────────── */
const fios = rotear(JUMPERS, PLACA);
const conf = conflitos(fios);
for (const c of conf)
  erros.push(`fios ${c.a} e ${c.b} disputam o canal ${c.canal} — o roteador não achou lugar`);
const maior = fios.reduce((a, f) => f.comprimento > a.comprimento ? f : a);
const hops = fios.reduce((a, f) => a + f.hops.length, 0);
if (maior.comprimento > 200)
  avisos.push(`o fio ${maior.n} ficou com ${maior.comprimento.toFixed(0)} mm — muito longo `
    + 'para placa ilhada, considere reposicionar as pontas');
notaFios = `  . ${fios.length} fios roteados em ${new Set(fios.map(f => f.canal)).size} `
  + `canais · ${hops} cruzamentos · o maior tem ${maior.comprimento.toFixed(0)} mm`;

console.log(`placa: ${PLACA.colunas}x${PLACA.linhas} furos = `
          + `${PLACA.larguraMm.toFixed(1)} x ${PLACA.alturaMm.toFixed(1)} mm`);
console.log(`furos com perna passante: ${passantes.size}  ·  pior caso: ${maxP} por furo`);
console.log(`ilhas que recebem jumper: ${jumpers.size}  ·  pior caso: ${maxJ} fios na mesma ilha`);

/* ── 12. a rede elétrica fecha? ────────────────────────────────────── */
let notaRede = null;
{
  const dados = { PLACA, BORNES, BARRAMENTO_0V, NOS, JUMPERS,
                  COMPONENTES_PI1, CI1: CI1, MODULOS: [] };
  const rede = construirRede(dados);
  let ilhados = 0;
  for (const b of BORNES)
    for (const v of b.vias.filter(x => !x.livre)) {
      const nn = rede.nos.get(rede.acha(`${v.col},${b.linha}`));
      /* uma via usada tem que dividir o nó com ALGUÉM — senão o fio dela
         não leva a lugar nenhum */
      const outros = (nn?.membros ?? []).filter(m => m.ponto !== `${v.col},${b.linha}`);
      if (!outros.length) { erros.push(`${b.ref}-${v.n} (${v.sinal}) está ilhado — nenhum outro `
        + 'ponto no mesmo nó elétrico'); ilhados++; }
    }
  const comBus = [...rede.nos.values()].filter(x => x.ehBus).length;
  if (comBus !== 1) erros.push(`o 0 V virou ${comBus} nós separados — deveria ser um só`);
  if (!ilhados)
    notaRede = `  . rede: ${rede.nos.size} nós elétricos · ${rede.elementos.length} `
      + 'elementos · nenhum borne ilhado';
}

if (notaFios) console.log(notaFios);
if (notaRede) console.log(notaRede);
console.log(`componentes: ${COMPONENTES_PI1.length}${CI1 ? ' + CI' : ' (sem CI)'}  ·  jumpers: ${JUMPERS.length}`
          + `  ·  nós: ${NOS.length}`);
avisos.forEach(a => console.log('  . ' + a));
if (erros.length) {
  console.log('\nERROS:');
  erros.forEach(e => console.log('  X ' + e));
  process.exit(1);
}
console.log('\nOK - layout consistente, um furo por perna');
