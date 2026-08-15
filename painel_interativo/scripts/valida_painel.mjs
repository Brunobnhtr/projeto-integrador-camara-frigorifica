/**
 * Confere o inventário de terminais do painel.
 *
 * A pergunta que ele responde: cada componente tem bornes SUFICIENTES
 * para o que o projeto liga nele? É o tipo de erro que só aparece na
 * bancada, quando falta um lugar para o fio.
 */
import { COMPONENTES, TRILHOS, CAIXA } from '../src/data/painel_completo.js';

const erros = [], avisos = [];
let totPinos = 0, totUsados = 0;

console.log(`caixa ${CAIXA.largura} × ${CAIXA.altura} × ${CAIXA.profundidade} mm\n`);

for (const t of [...TRILHOS].sort((a, b) => a.n - b.n)) {
  const comps = COMPONENTES.filter(c => c.trilho === t.n);
  const larg = comps.reduce((s, c) => s + c.largura, 0);
  console.log(`── ${t.nome}  ·  ${comps.length} componentes  ·  ${larg} mm ocupados`);
  for (const c of comps) linha(c);
  if (larg > 360) erros.push(`${t.nome}: ${larg} mm ocupados, o trilho tem ~360 mm`);
  else avisos.push(`${t.nome}: ${larg}/360 mm — sobram ${360 - larg} mm`);
  console.log('');
}

const porta = COMPONENTES.filter(c => c.porta);
console.log(`── PORTA  ·  ${porta.length} componentes`);
for (const c of porta) linha(c);

function linha(c) {
  const pinos = c.grupos.flatMap(g => g.pinos);
  const usados = pinos.filter(p => p.usa).length;
  totPinos += pinos.length; totUsados += usados;
  const livres = pinos.length - usados;
  const marca = livres === 0 ? '⚠ LOTADO' : '';
  console.log(`   ${c.nome.padEnd(42)} ${String(usados).padStart(3)}/${String(pinos.length).padEnd(3)} usados`
            + `  ${String(livres).padStart(2)} livres  ${marca}`);
  if (livres === 0 && !c.porta)
    avisos.push(`${c.id}: todos os ${pinos.length} terminais ocupados — sem reserva`);
}

// ── as duas pontas de cada ligacao precisam existir ──────────────────
const idPorNome = new Map(COMPONENTES.map(c => [c.id, c]));
const refs = [];
for (const c of COMPONENTES)
  for (const g of c.grupos)
    for (const p of g.pinos)
      if (p.usa && p.para) refs.push({ de: c.id, pino: p.nome, para: p.para });

// a saida citada de um bloco tem de existir
for (const r of refs) {
  const m = r.para.match(/^(BD-[A-Z0-9]+) sa[ií]da (\d+)/i);
  if (!m) continue;
  const alvo = idPorNome.get(m[1]);
  if (!alvo) { erros.push(`${r.de}.${r.pino} cita ${m[1]}, que não existe`); continue; }
  const n = alvo.grupos.flatMap(g => g.pinos).filter(p => /^O\d+$/.test(p.nome)).length;
  if (+m[2] > n)
    erros.push(`${r.de}.${r.pino} pede a saída ${m[2]} do ${m[1]}, que só tem ${n}`);
}

/* ⭐ A CHECAGEM QUE MAIS IMPORTA: quantos fios chegam ao BD-0V.
   Dois pinos do mesmo componente indo ao 0 V NÃO é erro - o retorno de
   potência e o da lógica são dois fios de verdade. Mas cada um precisa
   do SEU ponto na barra. */
const bd0 = idPorNome.get('BD-0V');
const chegam = refs.filter(r => /^BD-0V$/i.test(r.para.trim()));
const pontos = bd0.grupos.flatMap(g => g.pinos).filter(p => /^R\d+$/.test(p.nome));
console.log(`\n── O 0 V ponto a ponto`);
console.log(`   fios declarados nos componentes: ${chegam.length}`);
chegam.forEach(r => console.log(`     · ${r.de} · ${r.pino}`));
const externos = pontos.filter(p => p.usa).length - chegam.length;
console.log(`   pontos usados na barra: ${pontos.filter(p => p.usa).length}`
          + `  (${chegam.length} de dentro do painel + ${externos} de fora)`);
console.log(`   pontos disponíveis: ${pontos.length}`);
if (chegam.length > pontos.length)
  erros.push(`BD-0V: chegam ${chegam.length} fios e a barra tem ${pontos.length} pontos`);
else if (pontos.length - pontos.filter(p => p.usa).length < 2)
  avisos.push(`BD-0V: só ${pontos.length - pontos.filter(p => p.usa).length} ponto(s) de reserva`);

// o mesmo para os barramentos de tensao
for (const id of ['BD-5V', 'BD-24V', 'BD-POT', 'BD-AUX']) {
  const b = idPorNome.get(id);
  const saidas = b.grupos.flatMap(g => g.pinos).filter(p => /^O\d+$/.test(p.nome));
  const usadas = saidas.filter(p => p.usa).length;
  if (usadas === saidas.length)
    erros.push(`${id}: as ${saidas.length} saídas estão todas ocupadas, sem reserva`);
}

console.log(`\n${'='.repeat(64)}`);
console.log(`TOTAL: ${totUsados} terminais usados de ${totPinos}  ·  ${totPinos - totUsados} livres`);
avisos.forEach(a => console.log('  . ' + a));
if (erros.length) {
  console.log('\nERROS:');
  erros.forEach(e => console.log('  X ' + e));
  process.exit(1);
}
console.log('\nOK - todo componente tem borne para o que liga nele');
