/* A AUDITORIA DO DESENHO: todo fio tem as duas pontas em algum lugar?

   Os outros scripts conferem o DADO — se a rota existe, se a segregação
   fecha, se o borne está declarado. Nenhum deles conferia se o desenho
   consegue TERMINAR o risco em algum ponto. E não conseguia: os 21 fios
   da etapa 6 tinham uma ponta na câmara, que não é componente do
   painel, então a função de desenho devolvia nulo e o fio sumia.
   O dado dizia que a ligação existia; a tela mostrava o MV-1 com os
   bornes de baixo vazios.

   Aqui a pergunta é a do montador: "abri o painel — todo borne que a
   lista diz que é usado tem fio encostado nele?"                      */

import { COMPONENTES, CAIXA, TRILHOS, TRILHO_X0, TRILHO_X1 } from '../src/data/painel_completo.js';
import { FIOS, PRENSAS_PAINEL } from '../src/data/fiacao.js';
import {
  comporPainel, pontaDoFio, foraDoPainel, ORDEM_NA_PRENSA, tracarFio,
} from '../src/lib/geometria_painel.js';
import { conferePrensa } from '../src/lib/prensas.js';

let erros = 0, avisos = 0;
const err = m => { console.log('  X ' + m); erros++; };
const avi = m => { console.log('  ! ' + m); avisos++; };
const ok  = m => console.log('  . ' + m);

const comps = comporPainel();

/* ── 1. as duas pontas de cada fio têm onde encostar ───────────────── */
console.log('\n=== todo fio consegue ser desenhado? ===');
const pontas = new Map();
for (const f of FIOS) {
  const a = pontaDoFio(f, f.de, comps), b = pontaDoFio(f, f.para, comps);
  pontas.set(f.n, [a, b]);
  if (!a.p) err(`${f.n} (${f.nome}): ponta DE sem lugar — ${a.motivo}`);
  if (!b.p) err(`${f.n} (${f.nome}): ponta PARA sem lugar — ${b.motivo}`);
}
if (!erros) ok(`${FIOS.length} fios, ${FIOS.length * 2} pontas, todas com coordenada`);

/* ── 2. todo borne usado tem fio encostado ─────────────────────────── */
console.log('\n=== algum borne usado ficou sem fio? ===');
const comFio = new Map();
for (const f of FIOS)
  for (const alvo of [f.de, f.para]) {
    if (foraDoPainel(alvo)) continue;
    const k = `${alvo.comp}.${alvo.via}`;
    comFio.set(k, [...(comFio.get(k) ?? []), f.n]);
  }
const vazios = new Map();
let usados = 0;
for (const c of COMPONENTES)
  for (const g of c.grupos ?? [])
    for (const p of g.pinos ?? []) {
      if (!p.usa || p.semFio) continue;
      usados++;
      if (!comFio.has(`${c.id}.${p.nome}`))
        vazios.set(c.id, [...(vazios.get(c.id) ?? []), p.nome]);
    }
for (const [id, ps] of vazios)
  err(`${id}: ${ps.length} borne(s) marcados como usados e SEM FIO — ${ps.join(', ')}`);
if (!vazios.size) ok(`${usados} bornes usados, todos com pelo menos um fio`);

/* ── 3. fio apontando para borne que não existe ou está livre ──────── */
console.log('\n=== fio apontando para borne errado? ===');
let ruins = 0;
for (const [k, ns] of comFio) {
  const [cid, ...resto] = k.split('.');
  const via = resto.join('.');
  const c = COMPONENTES.find(x => x.id === cid);
  const p = c?.grupos?.flatMap(g => g.pinos ?? []).find(x => x.nome === via);
  if (!p) { err(`${ns.join('/')} vai para ${k}, que não existe`); ruins++; continue; }
  if (!p.usa) { err(`${ns.join('/')} vai para ${k}, marcado como LIVRE`); ruins++; }
  if (p.semFio) { avi(`${ns.join('/')} vai para ${k}, que é jumper e não leva fio`); }
}
if (!ruins) ok('nenhum — todo destino existe e está declarado como usado');

/* ── 4. os prensa-cabos: quantos fios passam e em que sentido ──────── */
console.log('\n=== o que passa por cada prensa-cabo ===');
for (const pr of PRENSAS_PAINEL) {
  const fs = FIOS.filter(f => f.prensa === pr.id
    || f.de.prensa === pr.id || f.para.prensa === pr.id);
  if (!fs.length) { avi(`${pr.id} (${pr.nome ?? ''}) não tem fio nenhum`); continue; }
  const sai = fs.filter(f => foraDoPainel(f.para)).length;
  const entra = fs.filter(f => foraDoPainel(f.de)).length;
  /* ⭐ A CAPACIDADE ERA UM NÚMERO ESCRITO À MÃO. Agora é a conta do
     feixe contra a faixa de aperto da rosca — que é o que decide se a
     vedação morde ou se o furo fica aberto para poeira e umidade. */
  const c = conferePrensa(pr.tipo, fs);
  const linha = `${pr.id} (${pr.tipo}): ${fs.length} condutores, feixe de `
              + `${c.d.toFixed(1)} mm — ${sai} saindo, ${entra} entrando`;
  if (c.ok) ok(linha);
  else if (c.fino) avi(`${linha} · ${c.motivo}; use a vedação redutora`
                     + (c.sugere ? ` (ou um ${c.sugere})` : ''));
  else err(`${linha} · ${c.motivo} — precisa de ${c.sugere ?? 'rosca maior'}`);
}
/* o leque desenhado tem de caber dentro da caixa */
for (const [id, n] of ORDEM_NA_PRENSA.total) {
  const pr = PRENSAS_PAINEL.find(x => x.id === id);
  if (!pr) { err(`${n} fios apontam para o prensa-cabo ${id}, que não existe`); continue; }
  const larg = (n - 1) * 2.4 + 4;
  if (pr.x - larg / 2 < 4 || pr.x + larg / 2 > CAIXA.largura - 4)
    err(`${id}: o leque de ${n} fios sai para fora da caixa`);
}

/* ── 5. o risco desenhado passa por onde não pode? ─────────────────────
   A regra do projeto: fio nenhum passa por baixo de componente nem
   atravessa o trilho DIN. Até agora isso era conferido a olho, num
   desenho de 120 fios — que é o mesmo que não conferir.               */
console.log('\n=== o risco passa por baixo de componente ou do trilho? ===');
const RECUO = 4.5;      /* o borne fica recuado para dentro da placa: os
                           últimos milímetros são o terminal, não invasão */
const H_TRILHO = 7.5;   // altura da barra DIN, em mm
let invade = 0, cortaTrilho = 0;
const tracados = FIOS.map((f, i) => tracarFio(f, comps, i));
for (const t of tracados) {
  if (!t.pts.length) continue;
  for (let i = 1; i < t.pts.length; i++) {
    const [ax, ay] = t.pts[i - 1], [bx, by] = t.pts[i];
    const sx0 = Math.min(ax, bx), sx1 = Math.max(ax, bx);
    const sy0 = Math.min(ay, by), sy1 = Math.max(ay, by);
    /* ⭐ INCLUSIVE O PRÓPRIO COMPONENTE DO FIO. Era a exceção que
       escondia as pontes: C5, C6, S13 e S16 ligam dois bornes da mesma
       peça e cortavam reto pelo meio dela, atrás do desenho. */
    for (const c of comps) {
      const x0 = c.x + RECUO, x1 = c.x + c.largura - RECUO;
      const y0 = c.y + RECUO, y1 = c.y + c.altura - RECUO;
      if (x1 <= x0 || y1 <= y0) continue;
      if (sx1 > x0 && sx0 < x1 && sy1 > y0 && sy0 < y1) {
        err(`${t.n} (${t.nome}) passa por dentro do ${c.id}`); invade++;
      }
    }
    /* trilho: só vale cruzar se o fio for de um componente daquele trilho */
    for (const tr of TRILHOS) {
      const y0 = tr.y - H_TRILHO / 2, y1 = tr.y + H_TRILHO / 2;
      const naFaixa = sx1 > TRILHO_X0 && sx0 < TRILHO_X1 && sy1 > y0 && sy0 < y1;
      if (!naFaixa) continue;
      const dono = [t.a?.comp, t.b?.comp].some(c => c && c.trilho === tr.n && !c.porta);
      if (!dono) {
        err(`${t.n} (${t.nome}) atravessa o trilho ${tr.n} sem ter borne nele`);
        cortaTrilho++;
      }
    }
  }
}
if (!invade) ok('nenhum fio passa por dentro de componente — nem do seu próprio');
if (!cortaTrilho) ok('nenhum fio atravessa trilho onde não tem borne');

/* ── 6. quem vai para a câmara volta de lá? ────────────────────────── */
console.log('\n=== ida e volta da câmara fecham? ===');
const seis = FIOS.filter(f => f.etapa === 6);
const idas = seis.filter(f => foraDoPainel(f.para));
const voltas = seis.filter(f => foraDoPainel(f.de));
ok(`${idas.length} fios saem do painel · ${voltas.length} voltam para ele`);
for (const f of seis) {
  const dentro = foraDoPainel(f.de) ? f.para : f.de;
  if (foraDoPainel(dentro))
    err(`${f.n} tem as DUAS pontas fora do painel — não sai de componente nenhum`);
  else ok(`  ${f.n}: ${foraDoPainel(f.para) ? '──►' : '◄──'} ${dentro.comp} · ${dentro.via}`
        + ` (${f.prensa})`);
}

console.log(erros ? `\nFALHOU — ${erros} erro(s), ${avisos} aviso(s)`
                  : `\nOK — todo fio tem as duas pontas e todo borne usado tem fio`
                    + ` (${avisos} aviso(s))`);
process.exit(erros ? 1 : 0);
