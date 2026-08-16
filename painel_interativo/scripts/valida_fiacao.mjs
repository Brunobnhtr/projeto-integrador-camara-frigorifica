/**
 * Confere a fiação do painel contra as canaletas.
 *
 * Três coisas que só um script pega:
 *   1. a rota existe de verdade — canaletas seguidas têm que se TOCAR;
 *   2. nada que POLUI corre ao lado do que SOFRE — mas alimentação
 *      limpa e o 0 V passam por qualquer canaleta, porque não fazem
 *      nem uma coisa nem outra;
 *   3. o destino de cada fio é um borne que existe e está marcado como
 *      usado no inventário.
 */
import { COMPONENTES, CANALETAS, CANALETAS_PORTA, CAIXA, PLACA, TRILHOS }
  from '../src/data/painel_completo.js';
import { PRENSAS_PAINEL, FIOS, ETAPAS } from '../src/data/fiacao.js';

const erros = [], avisos = [];
const TODAS = [...CANALETAS, ...CANALETAS_PORTA];
const canal = id => TODAS.find(k => k.id === id);

/* ⭐ PORTA E PLACA SÃO PLANOS DIFERENTES. Comparar os retângulos das duas
   como se fossem o mesmo desenho daria sobreposição por acidente — os
   números coincidem sem que os caminhos se encontrem. A única ligação
   real entre os dois planos é a PASSAGEM FLEXÍVEL da dobradiça. */
const naPortaK = k => k.id.startsWith('CP-');
const sobrepoe = (a, b) =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

const tocam = (a, b) => {
  if (naPortaK(a) === naPortaK(b)) return sobrepoe(a, b);
  const kPorta = naPortaK(a) ? a : b, kPlaca = naPortaK(a) ? b : a;
  if (!kPorta.dobradica) return false;               // só se cruza pela dobradiça
  if (kPorta.tipo !== kPlaca.tipo) return false;     // e sem trocar de classe
  return kPlaca.x + kPlaca.w >= CAIXA.largura - 30;  // a canaleta tem que chegar na borda
};

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

  /* ── 2. segregação ─────────────────────────────────────────────────
     'alim' e 'comum' andam em qualquer canaleta: não poluem nem sofrem.
     Só 'potencia' e 'sinal' ficam presas à sua. */
  if (f.classe === 'potencia' || f.classe === 'sinal')
    for (const { id, k } of ks)
      if (k.tipo !== f.classe)
        erros.push(`${f.n} é ${f.classe} e passa pela ${id}, que é ${k.tipo}`);

  /* ── 3. AS DUAS PONTAS existem e estão declaradas como usadas? ─────
     Conferir só o destino deixaria passar o erro mais comum: partir de
     um borne que já está ocupado por outra coisa, ou que nem existe. */
  for (const [lado, alvo] of [['sai de', f.de], ['chega em', f.para]]) {
    if (!alvo.comp) continue;
    const c = COMPONENTES.find(x => x.id === alvo.comp);
    if (!c) { erros.push(`${f.n}: o componente ${alvo.comp} não existe`); continue; }
    const via = c.grupos.flatMap(g => g.pinos).find(p => p.nome === alvo.via);
    if (!via) {
      const tem = c.grupos.flatMap(g => g.pinos).map(p => p.nome).join(', ');
      erros.push(`${f.n} ${lado} ${alvo.comp}.${alvo.via}, que NÃO EXISTE. `
        + `O ${alvo.comp} tem: ${tem}`);
    } else if (!via.usa) {
      erros.push(`${f.n} ${lado} ${alvo.comp}.${alvo.via}, que o inventário diz estar LIVRE`);
    }
  }
  const c = COMPONENTES.find(x => x.id === f.para.comp);
  if (!c) continue;

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

/* ── ⭐ NINGUÉM PENDURA NO 0 V DE OUTRO ──────────────────────────────
   Cada retorno tem que ter o SEU ponto na barra. Dois fios no mesmo
   parafuso viram impedância comum: a corrente de um cria queda que o
   outro enxerga como deslocamento do seu 0 V. Com 6 A dos BTS num
   rabicho de 20 cm em 0,5 mm² dá 42 mV — e 42 mV sobre o shunt de 0,83 V
   da posição 1 são 5% de erro que aparecem e somem no ritmo do PWM. */
console.log('\n=== um ponto do 0 V por fio ===');
const noPonto = new Map();
for (const f of FIOS) {
  if (f.para.comp !== 'BD-0V') continue;
  const k = f.para.via;
  if (noPonto.has(k))
    erros.push(`${f.n} e ${noPonto.get(k)} vão os dois para o BD-0V.${k} — `
      + 'cada retorno precisa do SEU parafuso, senão um enxerga a queda do outro');
  else noPonto.set(k, f.n);
}
const bd0 = COMPONENTES.find(c => c.id === 'BD-0V');
const totPontos = bd0.grupos.flatMap(g => g.pinos).filter(p => /^R\d+$/.test(p.nome)).length;
console.log(`  . ${noPonto.size} retornos declarados em pontos distintos, `
  + `de ${totPontos} pontos na barra`);
if (noPonto.size > totPontos)
  erros.push(`a barra tem ${totPontos} pontos e já chegam ${noPonto.size} retornos`);

/* ── as rotas, em texto, para conferir na bancada ───────────────────── */
console.log('\n=== as rotas ===');
const nomeDe = a => a.prensa ?? `${a.comp}.${a.via}`;
let etapaAtual = null;
for (const f of FIOS) {
  if (f.etapa !== etapaAtual) {
    etapaAtual = f.etapa;
    const e = ETAPAS.find(x => x.n === f.etapa);
    console.log(`
  ── ETAPA ${f.etapa}: ${e?.nome ?? ''}`);
  }
  const via = f.rota.length ? f.rota.join(' → ') : '(ponte curta, sem canaleta)';
  console.log(`  ${f.n.padEnd(4)} ${nomeDe(f.de).padEnd(12)} → ${via}`);
  console.log(`       └─► ${nomeDe(f.para).padEnd(12)}  ${f.mm2} mm² ${f.corNome}`);
}

/* ── ⭐ COBERTURA: quais bornes já têm fio e quais ainda faltam ────── */
console.log('\n=== cobertura dos bornes ===');
const comFio = new Set();
for (const f of FIOS)
  for (const a of [f.de, f.para])
    if (a.comp) comFio.add(`${a.comp}.${a.via}`);

let usados = 0, cobertos = 0;
const faltando = new Map();
for (const c of COMPONENTES)
  for (const g of c.grupos)
    for (const p of g.pinos) {
      if (!p.usa) continue;
      usados++;
      if (comFio.has(`${c.id}.${p.nome}`)) cobertos++;
      else faltando.set(c.id, (faltando.get(c.id) ?? 0) + 1);
    }
const pct = (cobertos / usados * 100).toFixed(0);
console.log(`  ${cobertos} de ${usados} bornes usados já têm fio declarado (${pct}%)`);
const top = [...faltando].sort((a, b) => b[1] - a[1]).slice(0, 8);
console.log('  ainda sem fio: ' + top.map(([id, q]) => `${id}(${q})`).join(' · '));

const feitas = ETAPAS.filter(e => e.feito).length;
console.log(`\netapas concluídas: ${feitas} de ${ETAPAS.length}`);
avisos.forEach(a => console.log('  ! ' + a));
if (erros.length) {
  console.log('\nERROS:');
  erros.forEach(e => console.log('  X ' + e));
  process.exit(1);
}
console.log('OK - toda rota existe e a segregação está respeitada');
void PLACA; void TRILHOS;
