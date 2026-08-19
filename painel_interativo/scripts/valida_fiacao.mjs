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
import { COMPONENTES, CANALETAS, CANALETAS_PORTA, CAIXA, PLACA, TRILHOS,
         canaletaDoGrupo, CALHAS } from '../src/data/painel_completo.js';
import { conferePrensa } from '../src/lib/prensas.js';
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
    /* destino fora do painel: a ponta é uma peça da câmara ou da tampa,
       e quem confere aquilo é o valida_camara */
    if (alvo.camara || alvo.tampa) continue;
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


  /* ── 6. ⭐ A ROTA COMEÇA E TERMINA NA CANALETA QUE O BORNE ENXERGA ──
     Um borne da borda de cima não alcança a canaleta de baixo: o fio
     teria que atravessar o corpo do componente e passar por debaixo do
     trilho DIN. É o erro que mais aparece no desenho. */
  if (f.rota.length) {
    const pontas = [['sai de', f.de, f.rota[0]],
                    ['chega em', f.para, f.rota[f.rota.length - 1]]];
    for (const [lado, alvo, kid] of pontas) {
      if (!alvo.comp) continue;
      const cc = COMPONENTES.find(x => x.id === alvo.comp);
      const gg = cc?.grupos.find(g => g.pinos.some(pp => pp.nome === alvo.via));
      if (!cc || !gg) continue;
      const ok = canaletaDoGrupo(cc, gg);
      if (ok.length && !ok.includes(kid))
        erros.push(`${f.n} ${lado} ${alvo.comp}.${alvo.via} (borda ${gg.lado}) usando a `
          + `${kid} — esse borne alcança ${ok.join(' ou ')}. Como está, o fio passaria `
          + 'por dentro do componente');
    }
  }

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

/* ── ⭐ A TRAVESSIA SÓ ACONTECE DENTRO DE UMA CALHA ──────────────────
   Placa e porta são dois planos, e o único ponto onde um fio passa de
   um para o outro é uma calha. Cada calha declara de qual canaleta da
   placa ela sai e em qual da porta ela chega — e o fio tem que usar
   exatamente esse par, senão o chicote estaria atravessando o vazio. */
console.log('\n=== as calhas de travessia ===');
for (const k of CALHAS) {
  const usam = FIOS.filter(f =>
    f.rota.includes(k.daPlaca) && f.rota.includes(k.naPorta));
  console.log(`  . ${k.id} (${k.tipo}): ${k.daPlaca} ↔ ${k.naPorta} — `
    + `${usam.length} fio(s): ${usam.map(f => f.n).join(', ') || '—'}`);
}
for (const f of FIOS) {
  const planos = f.rota.map(id => id.startsWith('CP-') ? 'porta' : 'placa');
  const trocas = planos.filter((p, i) => i && p !== planos[i - 1]).length;
  if (!trocas) continue;
  if (trocas > 1)
    erros.push(`${f.n} atravessa entre placa e porta ${trocas} vezes — a travessia `
      + 'é um ponto só');
  const i = planos.findIndex((p, j) => j && p !== planos[j - 1]);
  const [a, b] = [f.rota[i - 1], f.rota[i]];
  const ok = CALHAS.some(k =>
    (k.daPlaca === a && k.naPorta === b) || (k.daPlaca === b && k.naPorta === a));
  if (!ok)
    erros.push(`${f.n} cruza de ${a} para ${b}, e não existe calha ligando as duas. `
      + 'As calhas são: ' + CALHAS.map(k => `${k.daPlaca}↔${k.naPorta}`).join(', '));
}

/* ── quantos condutores por prensa-cabo ─────────────────────────────── */
console.log('\n=== ocupação dos prensa-cabos ===');
for (const p of PRENSAS_PAINEL) {
  /* o fio ENTRA por um prensa-cabo (de.prensa) ou SAI por um
     (campo `prensa`) — os dois ocupam o mesmo furo */
  const fs = FIOS.filter(f => f.de.prensa === p.id || f.prensa === p.id);
  const secao = fs.reduce((a, f) => a + f.mm2, 0);
  /* ⭐ ERA `capacidade`, um número escrito à mão. Quem decide quantos
     condutores cabem não é a contagem, é o DIÂMETRO DO FEIXE contra a
     faixa de aperto da rosca. O PG13-2 estava declarado com 14 e é um
     furo por onde passam quatro cabos de 1,5 mm². */
  const c = conferePrensa(p.tipo, fs);
  if (!c.ok && !c.fino) erros.push(`${p.id}: ${c.motivo} — use ${c.sugere ?? 'rosca maior'}`);
  else if (c.fino) avisos.push(`${p.id}: ${c.motivo}; precisa da vedação redutora`);
  console.log(`  ${c.ok ? '.' : c.fino ? '!' : 'X'} ${p.id} (${p.tipo}, X=${p.x}): `
    + `${fs.length} condutores · feixe ${c.d.toFixed(1)} mm de ${c.faixa?.join('–') ?? '?'} `
    + `· ${secao.toFixed(2)} mm² de cobre`);
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
  if (k === 'IN') continue;   /* a entrada da barra não é ponto de retorno */
  if (noPonto.has(k))
    erros.push(`${f.n} e ${noPonto.get(k)} vão os dois para o BD-0V.${k} — `
      + 'cada retorno precisa do SEU parafuso, senão um enxerga a queda do outro');
  else noPonto.set(k, f.n);
}
const bd0 = COMPONENTES.find(c => c.id === 'BD-0V');
/* Z1..Zn — os pontos de retorno. Chamavam-se R1..Rn até 18/08/2026, e o
   nome colidia com os resistores do projeto e com os ramais de energia. */
const bd0b = COMPONENTES.find(c => c.id === 'BD-0V-B');
const totPontos = [bd0, bd0b].filter(Boolean)
  .flatMap(c => c.grupos.flatMap(g => g.pinos))
  .filter(p => /^Z\d+$/.test(p.nome)).length;
console.log(`  . ${noPonto.size} retornos declarados em pontos distintos, `
  + `de ${totPontos} pontos na barra`);
if (noPonto.size > totPontos)
  erros.push(`a barra tem ${totPontos} pontos e já chegam ${noPonto.size} retornos`);

/* ── as rotas, em texto, para conferir na bancada ───────────────────── */
console.log('\n=== as rotas ===');
const nomeDe = a => a.prensa ?? (a.camara ? `câmara·${a.camara}.${a.borne}`
  : a.tampa ? `tampa·${a.tampa}.${a.borne}` : `${a.comp}.${a.via}`);
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

/* ── ⭐ AUDITORIA: o borne e o fio contam a MESMA história? ──────────
   Cada terminal do inventário diz, em texto, com quem ele se liga. Cada
   fio diz a mesma coisa em dados. Quando os dois discordam, um dos dois
   está errado — e é exatamente aí que a montagem erra o terminal. */
console.log('\n=== o borne e o fio concordam? ===');
const IDS = COMPONENTES.map(c => c.id).sort((a, b) => b.length - a.length);
const citados = txt => {
  const achados = new Set();
  for (const id of IDS) {
    /* o hífen NÃO pode entrar no lookahead: 'S2-11' tem que casar com
       'S2', que é justamente a forma como o inventário cita um borne */
    /* \w precisa de barra dupla DENTRO de string: com uma só, o JS
       engole a barra e o regex vira (?!w), que casa com quase tudo */
    /* ⚠️ dentro de string o \w precisa de barra DUPLA: com uma só o JS
       engole a barra e o regex vira (?!w), que casa com quase tudo —
       foi assim que "S3" apareceu casando dentro de "DS3231" */
    const re = new RegExp(id.replace(/[-]/g, '.') + '(?!\\w)', 'i');
    if (re.test(txt)) achados.add(id);
  }
  return achados;
};

let conferidos = 0, mudos = 0;
for (const c of COMPONENTES)
  for (const g of c.grupos)
    for (const p of g.pinos) {
      if (!p.usa || p.semFio || !p.para) continue;
      const meus = FIOS.filter(f =>
        (f.de.comp === c.id && f.de.via === p.nome) ||
        (f.para.comp === c.id && f.para.via === p.nome));
      if (!meus.length) { mudos++; continue; }
      conferidos++;
      /* ⭐ PONTE INTERNA NÃO ENTRA NA AUDITORIA. Num jumper dentro do
         próprio componente o "outro lado" é ele mesmo, e o texto do
         inventário fala — corretamente — de onde o sinal VEM lá atrás.
         Cobrar o nome do componente aqui seria cobrar o óbvio errado. */
      if (meus.every(f => f.de.comp === f.para.comp)) continue;
      /* ⭐ A ponta de FORA do painel não entra na auditoria de texto: o
         inventário fala do destino real (a peça na câmara), e às vezes
         em forma NEGATIVA — "sem passar pela placa" citaria uma peça que saiu, e
         faria o auditor acusar o oposto do que o texto diz. */
      if (meus.every(f => !f.de.comp || !f.para.comp)) continue;
      const alvos = new Set(meus.map(f =>
        f.de.comp === c.id && f.de.via === p.nome ? f.para.comp : f.de.comp)
        .filter(Boolean));
      const ditos = citados(p.para);
      ditos.delete(c.id);
      if (!ditos.size) continue;               // o texto não nomeia ninguém
      const bate = [...alvos].some(a => ditos.has(a));
      if (!bate)
        erros.push(`${c.id}.${p.nome}: o inventário diz "${p.para}" (cita `
          + `${[...ditos].join(', ')}) mas o fio vai para ${[...alvos].join(', ')}`);
    }
console.log(`  . ${conferidos} bornes com fio conferidos contra o texto do inventário`);
console.log(`  . ${mudos} bornes usados ainda sem fio declarado`);

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
      /* jumper de configuração ocupa o borne mas não é fio */
      if (!p.usa || p.semFio) continue;
      usados++;
      if (comFio.has(`${c.id}.${p.nome}`)) cobertos++;
      else faltando.set(c.id, (faltando.get(c.id) ?? 0) + 1);
    }
const pct = (cobertos / usados * 100).toFixed(0);
console.log(`  ${cobertos} de ${usados} bornes usados já têm fio declarado (${pct}%)`);
const top = [...faltando].sort((a, b) => b[1] - a[1]).slice(0, 8);
console.log('  ainda sem fio: ' + top.map(([id, q]) => `${id}(${q})`).join(' · '));

/* ── par que é um cabo só tem de andar pelo mesmo caminho ──────────────
   O +5 V e o 0 V de um Type-C são dois fios do MESMO plugue. Estavam
   declarados com rotas diferentes — no desenho o par se separava e
   descia por canaletas distintas, coisa que o plugue não deixa fazer. */
for (const f of FIOS) {
  if (!f.juntoCom) continue;
  const par = FIOS.find(x => x.n === f.juntoCom);
  if (!par) { erros.push(`${f.n} diz andar junto com ${f.juntoCom}, que não existe`); continue; }
  if (par.juntoCom !== f.n)
    erros.push(`${f.n} diz andar junto com ${par.n}, mas ${par.n} não diz o mesmo`);
  const a = [...f.rota].sort().join('>'), b = [...par.rota].sort().join('>');
  if (a !== b)
    erros.push(`${f.n} e ${par.n} são o mesmo cabo mas seguem canaletas diferentes: `
             + `[${f.rota}] contra [${par.rota}]`);
}

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
