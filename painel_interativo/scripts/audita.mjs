/**
 * A VARREDURA — componente por componente, conexão por conexão.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * ⭐ POR QUE ELA EXISTE, se já há dez validadores. Os outros conferem
 *    ESTRUTURA: se o borne existe, se a rota fecha, se o furo tem uma
 *    perna só. Eles não leem TEXTO — e foi por texto que o projeto
 *    passou dias dizendo que o BD-5V "alimenta o mux e o INA219" depois
 *    de o mux e o INA219 terem saído.
 *
 *    Esta varredura confere as três coisas que sobram:
 *      1. peça a peça — todo componente tem os campos que a montagem exige
 *      2. ligação a ligação — todo terminal declarado usado tem fio, e
 *         todo fio chega em terminal declarado
 *      3. o texto — nenhuma descrição cita peça que já saiu do projeto
 *
 * Rode com: npm run audita
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DISCRETOS, HOSTS, ARRANJOS } from '../src/data/discretos.js';
import { COMPONENTES, TRILHOS } from '../src/data/painel_completo.js';
import { FIOS } from '../src/data/fiacao.js';
import { TODOS as PASSOS } from '../src/data/guia.js';

const azul = t => `\x1b[36m${t}\x1b[0m`;
const verde = t => `\x1b[32m${t}\x1b[0m`;
const verm = t => `\x1b[31m${t}\x1b[0m`;
const cinza = t => `\x1b[2m${t}\x1b[0m`;

const achados = [];
const anota = (o, q) => achados.push(`${o}: ${q}`);

/* ══ 1 · PEÇA A PEÇA ══════════════════════════════════════════════════
   O que a montagem exige de cada componente solto. Falta de qualquer um
   destes campos não trava o build, mas trava quem está com a peça na mão. */
console.log(azul('\n═══ 1 · COMPONENTE POR COMPONENTE ═══\n'));

const passos = new Set(PASSOS.map(p => p.id));
const porHost = new Map();

for (const d of DISCRETOS) {
  const host = HOSTS.find(h => h.id === d.host);
  const linhas = [];

  if (!host) anota(d.id, 'host inexistente');
  if (!passos.has(d.passo)) anota(d.id, `passo ${d.passo} não existe`);
  if (!d.ensaio) anota(d.id, 'sem ensaio — ninguém sabe se ficou certo');
  if (!d.porque) anota(d.id, 'sem porquê — vira peça de fé');
  if (d.polaridade && !(d.comoIdentificar && d.seInverter))
    anota(d.id, 'tem polaridade e não diz como identificá-la ou o que acontece se inverter');
  if (!ARRANJOS[d.arranjo]) anota(d.id, `arranjo "${d.arranjo}" desconhecido`);

  /* cada perna precisa de um destino que EXISTA — e o destino tem que ser
     coerente com o lugar onde a peça mora */
  for (const p of d.pernas ?? []) {
    const alvo = p.vai?.comp;
    const comp = COMPONENTES.find(c => c.id === alvo);
    const hostAlvo = HOSTS.find(h => h.id === alvo);
    if (!comp && !hostAlvo) { anota(d.id, `perna "${p.nome}" vai para ${alvo}, que não existe`); continue; }
    const vias = comp
      ? comp.grupos.flatMap(g => g.pinos.map(x => x.nome))
      : (hostAlvo.terminais ?? []);
    if (!vias.includes(p.vai.via))
      anota(d.id, `perna "${p.nome}" vai para ${alvo}·${p.vai.via}, que não é terminal dele`);
    linhas.push(`${p.nome} → ${alvo} · ${p.vai.via}`);
  }

  const lista = porHost.get(d.host) ?? [];
  lista.push({ d, linhas });
  porHost.set(d.host, lista);
}

for (const h of HOSTS) {
  const itens = porHost.get(h.id) ?? [];
  if (!itens.length) continue;
  console.log(`${h.id.padEnd(9)} ${cinza(h.nome)}`);
  for (const { d, linhas } of itens) {
    console.log(`  ${d.ref.padEnd(9)} ${d.peca}`);
    console.log(cinza(`            ${ARRANJOS[d.arranjo]?.nome} · passo ${d.passo}`));
    linhas.forEach(l => console.log(cinza(`            ${l}`)));
  }
}

/* ══ 2 · LIGAÇÃO A LIGAÇÃO ════════════════════════════════════════════ */
console.log(azul('\n═══ 2 · AS CONEXÕES ═══\n'));

const pontas = new Map();   // "COMP·VIA" -> [fios]
for (const f of FIOS)
  for (const p of [f.de, f.para])
    if (p.comp) {
      const k = `${p.comp}·${p.via}`;
      pontas.set(k, [...(pontas.get(k) ?? []), f.n]);
    }

let usados = 0, semFio = 0, comFio = 0;
for (const t of TRILHOS) {
  const cs = COMPONENTES.filter(c => c.trilho === t.n).sort((a, b) => a.x - b.x);
  if (!cs.length) continue;
  console.log(`${t.nome}`);
  for (const c of cs) {
    const pinos = c.grupos.flatMap(g => g.pinos);
    /* ⭐ `semFio` existe para o que é USADO sem receber fio: jumper de
       configuração, como o H/L do MV-1. Ele conta como usado na montagem
       e não pode ser cobrado como ligação. */
    const u = pinos.filter(p => p.usa && !p.semFio);
    usados += u.length;
    const faltando = u.filter(p => !pontas.has(`${c.id}·${p.nome}`));
    comFio += u.length - faltando.length;
    semFio += faltando.length;
    const marca = faltando.length ? verm(`${faltando.length} sem fio`) : verde('ok');
    console.log(`  ${c.id.padEnd(9)} ${String(u.length).padStart(2)} usados de ${String(pinos.length).padEnd(3)} ${marca}`);
    faltando.forEach(p => anota(c.id, `terminal ${p.nome} está marcado como usado e nenhum fio chega nele`));
  }
}
/* e os componentes da porta e de fora do trilho */
for (const c of COMPONENTES.filter(c => !c.trilho)) {
  const u = c.grupos.flatMap(g => g.pinos).filter(p => p.usa && !p.semFio);
  const faltando = u.filter(p => !pontas.has(`${c.id}·${p.nome}`));
  usados += u.length; comFio += u.length - faltando.length; semFio += faltando.length;
  faltando.forEach(p => anota(c.id, `terminal ${p.nome} usado e sem fio`));
}
console.log(cinza(`\n  ${comFio} de ${usados} terminais usados têm fio · ${FIOS.length} fios no total`));

/* ══ 3 · O TEXTO ══════════════════════════════════════════════════════
   As peças que saíram do projeto. Citar uma delas só é legítimo quando o
   texto está explicando que ela saiu — por isso a lista de contextos. */
console.log(azul('\n═══ 3 · TEXTOS QUE FALAM DE PEÇAS QUE SAÍRAM ═══\n'));

const APOSENTADOS = [
  { termo: /ULN2803/i,        peca: 'ULN2803A (driver dos sinaleiros)' },
  { termo: /\bPI-?2\b/,       peca: 'placa PI-2' },
  { termo: /INA219/i,         peca: 'INA219' },
  { termo: /CD74HC4067|multiplexador/i, peca: 'multiplexador' },
  { termo: /shunts?/i,    peca: 'shunt de medição',
    /* o shunt do amperímetro do poste P1 é OUTRO componente, e continua no projeto */
    salvo: /amper[íi]metro|medidor|P1|poste|V\/A|mede tens|resistores de medi|suporte instrumentado|por canal/i },
  { termo: /PWM de 1 Hz|PWM lento|1 Hz.*Peltier/i, peca: 'PWM de 1 Hz' },
];
/* o texto pode citar a peça quando está dizendo que ela saiu */
/* o texto pode citar a peça quando está explicando que ela saiu — e é
   por isso que o projeto guarda essas explicações, então elas não podem
   ser acusadas */
const HISTORICO = new RegExp([
  'saiu', 'saíram', 'deixou', 'deixaram', 'era ', 'eram ', 'antig', 'virou', 'viraram',
  'perdeu', 'substitu', 'no lugar', 'passou a', 'não há', 'nao ha', 'não vai mais',
  'não precisa', 'nenhum', 'histórico', 'historico', 'ANTES', 'antes', '~~', '🗑️',
  'acabou', 'eliminad', 'versão anterior', 'dimensionava', 'media a corrente',
  'o que mudou', 'Peças', 'sem medição', 'já não', 'levou junto', 'digital',
  '20 kHz', 'soquete DIP', 'Com o sensor',
].join('|'), 'i');

/* ⭐ DOCUMENTOS QUE SÃO HISTÓRICO POR INTEIRO. Eles descrevem arquiteturas
   que o projeto já teve, e existem para mostrar o caminho percorrido —
   acusá-los linha a linha seria pedir que mentissem sobre o que já foi. */
const SO_HISTORIA = [/14_escala_e_cabeamento/];

const RAIZ = fileURLToPath(new URL('../../', import.meta.url));
const arquivos = [];
const varre = (dir) => {
  for (const nome of readdirSync(dir)) {
    if (nome.startsWith('.') || ['node_modules', 'dist', '__pycache__', 'referencias'].includes(nome)) continue;
    const cheio = join(dir, nome);
    if (statSync(cheio).isDirectory()) varre(cheio);
    else if (/\.(md|js|jsx|mjs)$/.test(nome) && !/PLANO_REFATORACAO|audita\.mjs/.test(cheio))
      arquivos.push(cheio);
  }
};
varre(RAIZ);

let suspeitas = 0;
for (const arq of arquivos) {
  if (SO_HISTORIA.some(r => r.test(arq))) continue;
  const linhas = readFileSync(arq, 'utf8').split(/\r?\n/);
  linhas.forEach((l, i) => {
    /* ⭐ olha a vizinhança: uma explicação histórica quebra em várias linhas,
       e a acusação tem que morrer com o parágrafo, não com a linha */
    /* a janela é de duas linhas para cada lado: explicação histórica quebra
       em parágrafo, e lista do que saiu tem o marcador no cabeçalho */
    const vizinhanca = linhas.slice(Math.max(0, i - 2), i + 3).join(' ');
    for (const a of APOSENTADOS) {
      if (a.termo.test(l) && !HISTORICO.test(vizinhanca) && !(a.salvo && a.salvo.test(vizinhanca))) {
        suspeitas++;
        console.log(`  ${verm('?')} ${arq.split(/[\\/]/).slice(-2).join('/')}:${i + 1} — cita ${a.peca}`);
        console.log(cinza(`     ${l.trim().slice(0, 110)}`));
      }
    }
  });
}
if (!suspeitas) console.log(verde('  nenhum texto cita peça aposentada fora de contexto histórico'));

/* ══ VEREDITO ═════════════════════════════════════════════════════════ */
console.log(azul('\n═══ VEREDITO ═══\n'));
if (achados.length) {
  achados.forEach(a => console.log(`  ${verm('X')} ${a}`));
  console.log(verm(`\n${achados.length} coisa(s) para arrumar\n`));
  process.exit(1);
}
console.log(verde(`${DISCRETOS.length} componentes · ${FIOS.length} fios · ${comFio} terminais com fio`));
console.log(verde('OK — cada peça tem lugar, destino, ensaio e passo; cada terminal usado tem fio\n'));
