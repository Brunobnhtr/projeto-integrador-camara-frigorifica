/**
 * Confere o inventário de terminais do painel.
 *
 * A pergunta que ele responde: cada componente tem bornes SUFICIENTES
 * para o que o projeto liga nele? É o tipo de erro que só aparece na
 * bancada, quando falta um lugar para o fio.
 */
import { COMPONENTES, TRILHOS, CAIXA, PLACA, CANALETAS, CANALETAS_PORTA, LATERAIS }
  from '../src/data/painel_completo.js';

/* largura util = placa menos as canaletas verticais */
const cv = CANALETAS.filter(k => k.vertical);
const UTIL = Math.round(Math.min(...cv.map(k => k.x)) === cv[0].x
  ? cv[1].x - (cv[0].x + cv[0].w) : 0);

const erros = [], avisos = [];
let totPinos = 0, totUsados = 0;

console.log(`caixa ${CAIXA.largura} × ${CAIXA.altura} × ${CAIXA.profundidade} mm\n`);

for (const t of [...TRILHOS].sort((a, b) => a.n - b.n)) {
  const comps = COMPONENTES.filter(c => c.trilho === t.n);
  const larg = comps.reduce((s, c) => s + c.largura, 0);
  console.log(`── ${t.nome}  ·  ${comps.length} componentes  ·  ${larg} mm ocupados`);
  for (const c of comps) linha(c);
  if (larg > UTIL) erros.push(`${t.nome}: ${larg} mm ocupados, só há ${UTIL} mm entre as canaletas`);
  else avisos.push(`${t.nome}: ${larg}/${UTIL} mm — sobram ${UTIL - larg} mm`);
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
/* ── a porta: canaleta para cada fileira, e nada em cima de canaleta ── */
console.log('\n=== a porta ===');
const naPorta = COMPONENTES.filter(c => c.porta);
const bate = (a, b) =>
  a.x < b.x + b.w && b.x < a.x + a.largura &&
  a.y < b.y + b.h && b.y < a.y + a.altura;

for (const c of naPorta) {
  for (const k of CANALETAS_PORTA)
    if (bate(c, k)) erros.push(`${c.id} está em cima da canaleta ${k.id} da porta`);

  /* o fio tem que ter canaleta perto — 45 mm é o alcance razoável de um
     rabicho com folga, acima disso o chicote fica solto na porta */
  const perto = CANALETAS_PORTA.some(k => k.vertical
    ? Math.abs(c.x - (k.x + k.w)) < 45 || Math.abs(k.x - (c.x + c.largura)) < 45
    : Math.abs(c.y - (k.y + k.h)) < 45 || Math.abs(k.y - (c.y + c.altura)) < 45);
  if (!perto) erros.push(`${c.id} não tem canaleta a menos de 45 mm — o fio dele `
    + 'ficaria solto atravessando a porta');
}
avisos.push(`porta: ${naPorta.length} componentes e ${CANALETAS_PORTA.length} canaletas`);

const dob = CANALETAS_PORTA.filter(k => k.dobradica);
if (dob.length !== 1)
  erros.push(`a porta tem ${dob.length} canaletas marcadas como dobradiça — deve ser 1`);

/* ── a antena TEM que estar fora, e fora da porta ────────────────────── */
console.log('=== a antena ===');
const ant = LATERAIS.find(a => a.id === 'ANT');
if (!ant) erros.push('não há antena declarada — o ESP32 dentro da caixa metálica '
  + 'fica numa gaiola de Faraday');
else {
  if (!['direita', 'esquerda', 'traseira', 'topo'].includes(ant.face))
    erros.push(`a antena está na face "${ant.face}" — tem que ser uma LATERAL, `
      + 'nunca a porta: o coaxial não suporta os ciclos de flexão');
  if (ant.y < CAIXA.altura * 0.7)
    avisos.push(`a antena está a ${ant.y} mm — quanto mais alta, menos obstruída`);
  else avisos.push(`antena na lateral ${ant.face}, a ${ant.y} mm de altura, furo Ø ${ant.furo} mm`);
  /* ela tem que estar do mesmo lado do ESP32, senão o pigtail não alcança */
  const esp = COMPONENTES.find(c => c.id === 'ESP32');
  if (esp) {
    const meio = esp.x + esp.largura / 2 > 210;
    if ((ant.face === 'direita') !== meio)
      erros.push(`a antena está na lateral ${ant.face} e o ESP32 no lado oposto — `
        + 'o pigtail de 30 cm não alcança');
  }
}

avisos.forEach(a => console.log('  . ' + a));
if (erros.length) {
  console.log('\nERROS:');
  erros.forEach(e => console.log('  X ' + e));
  process.exit(1);
}
console.log('\nOK - todo componente tem borne para o que liga nele');

/* ── os rótulos precisam caber ─────────────────────────────────────── */
{
  const ruins = [];
  for (const c of COMPONENTES) {
    for (const g of c.grupos) {
      const porLinha = Math.ceil(g.pinos.length / (g.linhas ?? 1));
      const vert = g.lado === 'esquerda' || g.lado === 'direita';
      const passo = Math.max(2.6, Math.min(4.6, ((vert ? c.altura : c.largura) - 3) / porLinha));
      if (passo < 2.7)
        ruins.push(`${c.id}.${g.ref}: ${passo.toFixed(2)} mm por borne — ilegível`);
      // etiqueta em pé desce ~9 mm para dentro; dois grupos opostos não podem se encontrar
      if (passo < 4.2 && !vert && c.altura < 22)
        ruins.push(`${c.id}.${g.ref}: etiqueta em pé pede ~9 mm e a placa tem ${c.altura} mm`);
    }
  }
  if (ruins.length) { console.log('\nRÓTULOS:'); ruins.forEach(r => console.log('  X ' + r)); process.exit(1); }
  console.log('todos os rótulos cabem');
}
