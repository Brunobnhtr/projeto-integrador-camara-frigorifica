/**
 * O RAMAL DO PTC continua bloqueado até existir uma arquitetura aprovada?
 *
 * ⭐ POR QUE ESTE VALIDADOR EXISTE. O Doc 31 exige, desde a V7, três proteções
 *    que não podem depender do firmware — entre elas o corte térmico do PTC e
 *    o termostato da câmara. Elas estavam escritas e NÃO existiam: nenhum
 *    cadastro, nenhum fio, nenhuma peça. E o texto que justificava a ausência
 *    era pior que a ausência: "o PTC é AUTO-LIMITADO, sem fluxo de ar ele corta
 *    a própria potência". Isso é falso como proteção — a temperatura de
 *    autorregulação do PTC é a do PTC, não a do acrílico da câmara.
 *
 *    Um validador que só confere números não pega isso. Este confere a
 *    TOPOLOGIA (há ligações não aprovadas?) e o TEXTO
 *    (alguma descrição voltou a dizer que o PTC se protege sozinho?).
 *
 * Roda: node scripts/valida_seguranca.mjs
 */
import {readFileSync, readdirSync, statSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

import {COMPONENTES, PECAS3D, EMENDAS_CAMARA} from '../src/data/camara.js';
import {FIOS} from '../src/data/fiacao.js';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, '..', '..');

let falhas = 0, avisos = 0;
const ok = (l, c, d = '') => {
  console.log((c ? '  OK    ' : '  FALHA ') + l + (d ? '  — ' + d : ''));
  if (!c) falhas++;
};
const avi = (l, d = '') => { console.log('  !     ' + l + (d ? '  — ' + d : '')); avisos++; };

/* ── 1. os dois termostatos existem, como peça e como cadastro ─────── */
console.log('=== 1 · os dois termostatos existem? ===');
for (const [id, temp, onde] of [['ST1', 90, 'corpo do PTC'], ['ST2', 70, 'parede interna']]) {
  const c = COMPONENTES.find(x => x.id === id);
  const p = PECAS3D.find(x => x.id === id);
  ok(`${id} no cadastro da câmara`, !!c, c ? c.nome : 'não existe em COMPONENTES');
  ok(`${id} como peça 3D (para a rota do fio)`, !!p, p ? `caixa ${p.caixa.join(',')}` : 'não existe em PECAS3D');
  if (!c) continue;
  ok(`${id} tem 2 terminais`, (c.terminais ?? []).length === 2,
     (c.terminais ?? []).map(t => t.t).join(' / '));
  ok(`${id} declara o valor de abertura`, c.nome.includes(String(temp)),
     `${c.nome} — o valor tem de estar no nome, é o que se lê no painel`);
  ok(`${id} é NF`, c.nome.includes('NF') || (c.avisos ?? []).some(a => a.includes('NF')),
     'contato normalmente FECHADO: fio rompido abre o PTC, que é o lado seguro');
  ok(`${id} diz onde fica`, (c.onde ?? '').toLowerCase().includes(onde.split(' ')[0]),
     c.onde);
}

/* ── 2. o ramal sem topologia DC aprovada permanece desconectado ──── */
console.log('\n=== 2 · o ramal do PTC continua bloqueado? ===');
const ptc = COMPONENTES.find(x => x.id === 'PTC');
const terminaisProtecao = COMPONENTES
  .filter(c => ['PTC', 'ST1', 'ST2'].includes(c.id))
  .flatMap(c => c.terminais ?? []);
const haFioTermico = FIOS.some(f =>
  ['PTC', 'ST1', 'ST2'].includes(f.para?.camara) ||
  (f.de?.comp === 'BTS2' && ['M+', 'M−'].includes(f.de.via)));
const haEmendaTermica = EMENDAS_CAMARA.some(e =>
  ['PTC', 'ST1', 'ST2'].includes(e.de.p) ||
  ['PTC', 'ST1', 'ST2'].includes(e.para.p));
ok('PTC e ST-1/ST-2 não têm conexões físicas declaradas',
   terminaisProtecao.every(t => !t.ref) && !haFioTermico && !haEmendaTermica,
   'ramal separado de 12 V e corte DC ainda não definidos; não conectar nem energizar');

/* ── 3. ninguém voltou a dizer que o PTC se protege sozinho ────────── */
/* ⚠ A versão anterior deste cheque tinha uma brecha: procurava a retratação
   em QUALQUER lugar do arquivo. Uma frase perigosa nova passava porque uma
   retratação antiga, em outra seção, a legitimava. Agora o cheque é POR
   SENTENÇA: cada ocorrência da frase perigosa é examinada no contexto da
   sua própria vizinhança (±200 caracteres), e só passa se a retratação
   estiver NESSE trecho — não do outro lado do documento. */
console.log('\n=== 3 · o texto perigoso voltou? ===');
const PERIGOSO = [
  'SE PROTEGE SOZINHO',
  'AUTO-LIMITADO',
  'auto-limitado',
  'se protege sozinho',
  'corta a própria potência',
  'a proteção aqui é a fonte',
  'a proteção desse modo de falha é a fonte',
];
const RETRATACAO = /estav?a errado|foi retirad[oa]|afirmava que|dizia que|não é proteção|não se protege|não estava demonstrada|está errado/i;
const JANELA = 200; // caracteres antes e depois da ocorrência

const arquivos = [];
const varrer = (dir, filtro) => {
  for (const nome of readdirSync(dir)) {
    if (nome.startsWith('_') || nome === 'node_modules' || nome === '.workbuddy-ai') continue;
    const p = join(dir, nome);
    if (statSync(p).isDirectory()) { varrer(p, filtro); continue; }
    if (filtro(nome)) arquivos.push(p);
  }
};
varrer(join(AQUI, '..', 'src'), n => n.endsWith('.js'));
for (const camada of readdirSync(RAIZ).filter(n => n.startsWith('camada_')))
  varrer(join(RAIZ, camada), n => n.endsWith('.md'));
varrer(RAIZ, n => n.endsWith('.md') && !n.startsWith('PROMPT'));

const achados = [];
for (const p of arquivos) {
  const txt = readFileSync(p, 'utf8');
  for (const frase of PERIGOSO) {
    let idx = 0;
    while ((idx = txt.indexOf(frase, idx)) !== -1) {
      /* examina a vizinhança da ocorrência, não o arquivo inteiro */
      const ini = Math.max(0, idx - JANELA);
      const fim = Math.min(txt.length, idx + frase.length + JANELA);
      const trecho = txt.slice(ini, fim);
      if (!RETRATACAO.test(trecho))
        achados.push(`${p.replace(RAIZ, '')}:${txt.slice(0, idx).split('\n').length}: "${frase}"`);
      idx += frase.length;
    }
  }
}
if (achados.length) {
  for (const a of achados) console.log('  FALHA ' + a);
  falhas += achados.length;
} else {
  console.log('  OK    nenhuma frase perigosa sem retratação no contexto (cheque por sentença, não por arquivo)');
}

/* ── 4. o Doc 31 e o Doc 02 continuam apontando para a cadeia ──────── */
console.log('\n=== 4 · a documentação aponta para o que existe? ===');
const doc31 = readFileSync(join(RAIZ, 'camada_3_eletrica', '31_comando_e_protecoes.md'), 'utf8');
ok('Doc 31 nomeia ST-1', doc31.includes('ST-1'), 'o corte térmico do PTC tem de ter nome de peça, não só de conceito');
ok('Doc 31 nomeia ST-2', doc31.includes('ST-2'));
ok('Doc 31 não manda usar SSR (o driver é BTS)', !/──\[ SSR \]──/.test(doc31),
   'o diagrama antigo ainda tinha SSR e F5, que não existem no projeto');

const doc02 = readFileSync(join(RAIZ, 'camada_0_fundamentos', '02_arquitetura_de_energia.md'), 'utf8');
ok('Doc 02 registra que a alegação sobre a fonte foi retirada',
   /foi retirada|não estava demonstrada/i.test(doc02));
ok('Doc 02 tem a camada 5b (térmica)', /5b/.test(doc02), 'a cadeia térmica é camada de proteção, não acessório');
ok('Doc 02 não trata a cadeia térmica como validada',
   /não energizar o PTC/i.test(doc02) && /eficácia ainda não demonstrada/i.test(doc02),
   'o contato ideal do simulador não comprova o componente real');
const geradorBOM = readFileSync(join(RAIZ, 'gerar_planilha_bom.py'), 'utf8');
ok('BOM marca ST-1 como modelo pendente e não comprável',
   /ST-1: termostato NF 90 C de rearme manual — modelo pendente/.test(geradorBOM) &&
     /NAO COMPRAR: identificar variante exata/.test(geradorBOM),
   'não apresentar a família KSD9700 como item aprovado');
ok('BOM marca ST-2 como pendente e proíbe ligação direta',
   /ST-2: termostato NF 70 C de rearme manual — modelo pendente/.test(geradorBOM) &&
     /NAO COMPRAR NEM LIGAR DIRETO AO PTC/.test(geradorBOM),
   'a classificação AC não substitui capacidade CC documentada');

/* ── 5. especificação dos termostatos ──────────────────────────────── */
console.log('\n=== 5 · os termostatos estão especificados? ===');
const st1 = COMPONENTES.find(x => x.id === 'ST1');
const st2 = COMPONENTES.find(x => x.id === 'ST2');
ok('ST-1 exige ficha técnica com capacidade DC e rearme manual',
   (st1?.avisos ?? []).some(a => /rating DC|capacidade.*DC/i.test(a) && /rearme MANUAL/i.test(a)),
   'o KSD9700-B anteriormente sugerido não está aprovado');
ok('ST-2 não é apresentado como componente aprovado para compra',
   (st2?.avisos ?? []).some(a => /COMPRA E LIGAÇÃO DIRETA EM SÉRIE NÃO APROVADAS/i.test(a)),
   'falta identificar a variante manual com classificação CC, temperatura e proteção adequadas');
/* ⭐ A SEXTA AUDITORIA: uma classificação AC não comprova capacidade de
   interrupção em CC. O arco de CC não tem cruzamento por zero. O texto
   do ST-2 não pode dizer "ou AC 250 V/16 A" como se o rating AC cobrisse
   a aplicação DC — isso é exatamente o erro que a auditoria apontou. */
ok('ST-2 NÃO usa rating AC como prova de capacidade DC',
   !(st2?.avisos ?? []).some(a => /ou\s+AC\s+\d+\s*V/i.test(a)),
   'rating AC não comprova interrupção em CC — o arco de CC não cruza por zero');
ok('ST-2 exige ficha técnica com DC explícito',
   (st2?.avisos ?? []).some(a => /ficha técnica/i.test(a) && /DC/i.test(a)),
   'não comprar KSD301 sem rating CC documentado pelo fabricante');
ok('ST-2 condiciona alternativa a projeto e validação',
   (st2?.avisos ?? []).some(a => /Alternativa.*arquitetura.*corte.*DC.*validar/i.test(a)),
   'um relé alternativo também precisa de dimensionamento e validação');
ok('ST-2 é rearme MANUAL', (st2?.nome ?? '').includes('MANUAL') || (st2?.avisos ?? []).some(a => /rearme manual/i.test(a)),
   'auto-rearme permite ciclos repetitivos com a causa da falha ainda presente');
ok('ST-1 exige rearme manual ou trava equivalente',
   (st1?.avisos ?? []).some(a => /rearme MANUAL|trava de desligamento manual/i.test(a)),
   'qualquer disparo deve exigir inspeção e rearme deliberado');
/* ⭐ A SEXTA AUDITORIA: o texto dizia "o firmware detecta via DS18B20 e trip"
   — mas o DS18B20 mede o AR da câmara, não o corpo do PTC. Um disparo de ST-1
   a 90 °C no corpo não significa que o ar está a 90 °C. O texto tem de ser
   honesto sobre isso: NÃO afirmar que o firmware vê o disparo de ST-1. */
ok('ST-1 NÃO afirma que firmware detecta o disparo via DS18B20',
   !(st1?.avisos ?? []).some(a => /firmware detecta via DS18B20/i.test(a)),
   'DS18B20 mede ar da câmara, não corpo do PTC — gradiente pode ser de 40-50 °C');
ok('ST-1 documenta que firmware NÃO vê temperatura do corpo',
   (st1?.avisos ?? []).some(a => /DS18B20 mede o ar.*não o corpo do PTC/i.test(a)),
   'texto tem de declarar explicitamente: DS18B20 ≠ corpo do PTC');
ok('ST-1 não apresenta auto-rearme como aceitável',
   !(st1?.avisos ?? []).some(a => /auto-rearme é aceitável|ST-1 é auto-rearme/i.test(a)),
   'o DS18B20 não comprova o disparo no corpo do PTC');

/* ── 6. o texto da "ordem" não afirma determinismo ─────────────────── */
console.log('\n=== 6 · a ordem no circuito não é determinística ===');
ok('Doc 31 não diz que a posição determina quem abre primeiro',
   !/quem.*abre primeiro.*é.*ST-1|deve abrir primeiro|abriria por último/i.test(doc31),
   'a ordem de abertura depende da temperatura local, não da posição no fio');
ok('Doc 31 declara que a posição não determina a ordem',
   /não determina a ordem|não determina quem|posição.*não.*determin/i.test(doc31),
   'tem de estar explícito: a corrente atravessa os dois; qualquer um corta');

/* ── 7. o item 1 não se chama "PTC não liga sem ventilação" ────────── */
console.log('\n=== 7 · o título do item 1 é honesto ===');
ok('Doc 31 item 1 diz "proteção térmica", não "intertravamento de ventilação"',
   /### 1\..*proteção térmica/i.test(doc31) || /### 1\..*Proteção térmica/i.test(doc31),
   'o que existe é proteção térmica (detecta calor), não intertravamento (detecta fluxo)');

/* ── 7b. validar ST-2 contra tipo de acrílico e IP ─────────────────── */
console.log('\n=== 7b · acrílico e grau de proteção ===');
/* ⭐ A SEXTA AUDITORIA: 70 °C ±5 °C pode chegar a 75 °C. PLEXIGLAS XT
   (extrudado) amolece em ~70 °C; só GS (fundido) amolece em ~80 °C.
   O texto tem de exigir confirmação do tipo de acrílico. */
ok('ST-2 valida contra tipo de acrílico (GS vs XT)',
   (st2?.avisos ?? []).some(a => /GS.*XT|fundido.*extrudado|tipo de acrílico|CONFIRMAR o tipo/i.test(a)),
   'XT amolece em 70 °C — 70 °C ±5 °C não oferece margem para extrudado');
ok('ST-2 pede medição de temperatura em múltiplos pontos',
   (st2?.avisos ?? []).some(a => /múltiplos pontos|multiplos pontos|vários pontos/i.test(a)),
   'gradiente entre PTC e parede: um sensor não basta');
ok('ST-2 verifica grau de proteção (IP)',
   (st2?.avisos ?? []).some(a => /IP\s*\d|grau de proteção|IP54|IP00/i.test(a)),
   'KSD301 IP00 em ambiente com condensação é risco');
ok('Doc 31 documenta validação do acrílico',
   /acrílico|PMMA|GS.*XT|fundido.*extrudado/i.test(doc31),
   'Doc 31 tem de mencionar a questão do tipo de acrílico');
ok('Doc 31 documenta verificação de IP',
   /IP\s*\d|grau de proteção|IP54|IP00/i.test(doc31),
   'Doc 31 tem de mencionar verificação de IP do KSD301');
ok('Doc 31 deixa claro que a proteção está pendente',
   /não aprovada para energização|não aprovada.*energização/i.test(doc31),
   'não afirmar proteção pronta antes da seleção e validação dos componentes');
ok('Doc 31 não aceita rearme automático de ST-1',
   /não aceitará auto-rearme de ST-1/i.test(doc31),
   'ST-1 deve manter o aquecedor desligado até inspeção e rearme manual');

/* ── 8. teste negativo: uma frase perigosa SEM retratação no contexto ── */
console.log('\n=== 8 · teste negativo do cheque textual ===');
const frasePerigosa = 'o PTC se protege sozinho';
const trechoIsolado = 'Lorem ipsum dolor sit amet. ' + frasePerigosa + ' Continua o texto.';
const janelaTeste = trechoIsolado.slice(
  Math.max(0, trechoIsolado.indexOf(frasePerigosa) - 200),
  trechoIsolado.indexOf(frasePerigosa) + frasePerigosa.length + 200);
ok('frase perigosa SEM retratação é detectada',
   !/estav?a errado|foi retirad[oa]|afirmava que|dizia que|não é proteção|não se protege/i.test(janelaTeste),
   'se o regex não acha retratação, o cheque reprova — e está certo');
const trechoRetratado = 'Isto estava errado: dizer que ' + frasePerigosa + ' não é proteção suficiente.';
ok('frase perigosa COM retratação no contexto passa',
   /estav?a errado|foi retirad[oa]|afirmava que|dizia que|não é proteção|não se protege/i.test(
     trechoRetratado.slice(Math.max(0, trechoRetratado.indexOf(frasePerigosa) - 200),
       trechoRetratado.indexOf(frasePerigosa) + frasePerigosa.length + 200)),
   'a retratação está na mesma vizinhança, não do outro lado do arquivo');

console.log();
if (falhas) {
  console.log(`REPROVADO — ${falhas} verificação(ões) falharam, ${avisos} aviso(s)`);
  process.exit(1);
}
console.log(`APROVADO — PTC, ST-1 e ST-2 seguem sem ligação física declarada; `
          + `o ramal permanece bloqueado (${avisos} aviso(s)).`);
console.log('Isto não comprova a proteção térmica nem libera compra ou energização.');
