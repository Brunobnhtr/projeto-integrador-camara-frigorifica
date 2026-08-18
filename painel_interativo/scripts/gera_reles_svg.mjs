/**
 * Gera desenhos/11_reles_ligacao.svg — os quatro relés do painel, cada um
 * desenhado como ele é de verdade, com os componentes discretos que ficam
 * pendurados nos bornes.
 *
 * ⭐ O desenho que faltava. O painel mostrava só cabo entrando e saindo; o
 *    D1, os pull-downs e os diodos de roda-livre não apareciam em lugar
 *    nenhum. Aqui eles aparecem — e no lugar físico onde são soldados.
 *
 *    KA1 e KA2 são relés de 8 pinos em base PTF08A (2 fileiras de 4
 *    parafusos). KA3 e KA4 são os dois canais de módulos de relé de 5 V,
 *    empilhados numa caixa DIN de 4M. São desenhos diferentes de propósito.
 *
 *    Uso:  node scripts/gera_reles_svg.mjs            (confere)
 *          node scripts/gera_reles_svg.mjs --escreve  (redesenha)
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { COMPONENTES } from '../src/data/painel_completo.js';

const SAIDA = new URL('../../desenhos/11_reles_ligacao.svg', import.meta.url);

/* ── o relé de 8 pinos ───────────────────────────────────────────── */
const CIMA = ['22', '24', '21', 'A2'];
const BAIXO = ['12', '14', '11', 'A1'];
const GRAVADO = { 22: 4, 24: 8, 21: 12, A2: 14, 12: 1, 14: 5, 11: 9, A1: 13 };
const PAPEL = {
  22: 'NF do contato 2', 24: 'NA do contato 2', 21: 'comum 2', A2: 'bobina',
  12: 'NF do contato 1', 14: 'NA do contato 1', 11: 'comum 1', A1: 'bobina',
};

/* ── os componentes discretos, e onde cada um mora ───────────────── */
const DISCRETOS = {
  KA2: [{ ref: 'D1', peca: '1N4007', onde: 'nos bornes A1 / A2', entre: ['A1', 'A2'],
          porque: 'grampeia o pico da bobina — sem ele o contato do KA3 abre arco e solda',
          cuidado: 'catodo (faixa prateada) no A1. Invertido, curto-circuita a bobina' }],
  KA3: [{ ref: 'R10', peca: '10 kΩ · ¼ W', onde: 'entre o IN3 e o 0 V, no borne do módulo',
          porque: 'fio do D27 rompido ou Arduino ausente → IN em 0 V → relé aberto → potência cortada',
          cuidado: 'é o que torna o fail-safe MEDÍVEL: ohmímetro entre IN e 0 V deve dar ~10 kΩ' }],
  KA4: [{ ref: 'R11', peca: '10 kΩ · ¼ W', onde: 'entre o IN4 e o 0 V, no borne do módulo',
          porque: 'mesma função do R10 — mas aqui relé aberto significa ventoinha LIGADA',
          cuidado: 'idem: ~10 kΩ entre IN e 0 V' },
        { ref: 'D2', peca: '1N4007', onde: '⚠️ não fica aqui — vai junto das ventoinhas, na câmara',
          porque: 'roda-livre do motor: ventoinha é carga indutiva e nada mais a grampeia',
          cuidado: 'catodo no +12 V' }],
};

const COR = { KA1: '#5f3dc4', KA2: '#5f3dc4', KA3: '#c2410c', KA4: '#c2410c' };
const SUB = {
  KA1: 'SEGURANÇA — cai na emergência, só o REARME azul devolve',
  KA2: 'PROCESSO — cai no STOP, só o START verde devolve · ⚡ contato de 6 A',
  KA3: 'VETO DO FIRMWARE — em série com a bobina do KA2 · contato NO',
  KA4: 'VENTOINHAS DO RADIADOR — chaveia o +12 V · contato NC ⭐',
};
const ONDE = {
  KA1: 'relé 8 pinos + base PTF08A · trilho 1',
  KA2: 'relé 8 pinos + base PTF08A · trilho 1',
  KA3: 'módulo de relé 1 canal 5 V · caixa DIN 4M, trilho 2',
  KA4: 'módulo de relé 1 canal 5 V · mesma caixa do KA3',
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const semEmoji = (s) => s.replace(/[\p{Extended_Pictographic}️]/gu, '').trim();

function curto(txt) {
  const c = semEmoji(txt).split(/\s+—\s+|:\s+/)[0].trim();
  return c.length > 46 ? c.slice(0, 44) + '…' : c;
}
function linhas(txt, max = 24) {
  if (txt.length <= max) return [txt];
  const p = txt.split(' '); const a = []; let n = 0;
  while (p.length && n + p[0].length <= max) { n += p[0].length + 1; a.push(p.shift()); }
  return [a.join(' '), p.join(' ')];
}

const P_W = 600, P_H = 470, B_X = 92, B_W = 416, COL = B_W / 4;

/* ═══ painel de um relé de 8 pinos (KA1, KA2) ═══════════════════════ */
function painelRele(id, ox, oy) {
  const c = COMPONENTES.find((k) => k.id === id);
  const cor = COR[id];
  const usados = new Map();
  for (const g of c.grupos) for (const p of g.pinos) if (p.usa) usados.set(p.nome, p.para);

  const o = [cabecalho(id, ox, oy, cor, `trilho ${c.trilho} · X = ${c.x} mm`)];
  const X = (i) => ox + B_X + COL * i + COL / 2;
  const by = oy + 196;

  o.push(`    <rect x="${ox + B_X}" y="${by}" width="${B_W}" height="76" fill="#f1f3f5" stroke="#868e96" stroke-width="1.6" rx="3"/>`);
  o.push(`    <text x="${ox + B_X + B_W / 2}" y="${by + 30}" font-size="12" font-weight="700" fill="#868e96" text-anchor="middle">BASE PTF08A · trilho DIN</text>`);
  o.push(`    <text x="${ox + B_X + B_W / 2}" y="${by + 48}" font-size="9.5" fill="#adb5bd" text-anchor="middle">o relé encaixa por cima e sai puxando · a base fica parafusada</text>`);
  o.push(`    <text x="${ox + B_X - 8}" y="${by - 4}" font-size="9" fill="#868e96" text-anchor="end">fileira de cima</text>`);
  o.push(`    <text x="${ox + B_X - 8}" y="${by + 86}" font-size="9" fill="#868e96" text-anchor="end">fileira de baixo</text>`);

  for (const [nomes, dir] of [[CIMA, -1], [BAIXO, +1]]) {
    nomes.forEach((nome, i) => {
      const cx = X(i), cy = dir < 0 ? by + 12 : by + 64;
      const usado = usados.has(nome), cf = usado ? cor : '#ced4da';
      o.push(`    <circle cx="${cx}" cy="${cy}" r="13" fill="${usado ? cor + '22' : '#f8f9fa'}" stroke="${cf}" stroke-width="${usado ? 2.2 : 1.3}"/>`);
      o.push(`    <path d="M${cx - 7} ${cy} L${cx + 7} ${cy}" stroke="${cf}" stroke-width="2"/>`);
      o.push(`    <text x="${cx}" y="${cy + (dir < 0 ? -20 : 30)}" font-size="13" font-weight="700" fill="${cf}" text-anchor="middle">${nome}</text>`);
      o.push(`    <text x="${cx + 17}" y="${cy + 4}" font-size="9" fill="#868e96">nº ${GRAVADO[nome]}</text>`);
      if (!usado) {
        o.push(`    <text x="${cx}" y="${cy + (dir < 0 ? -34 : 44)}" font-size="8.5" fill="#adb5bd" text-anchor="middle">livre · ${esc(PAPEL[nome])}</text>`);
        return;
      }
      o.push(...rabicho(cx, cy, dir, oy, cor, usados.get(nome), PAPEL[nome]));
    });
  }
  o.push(...discretos(id, ox, oy, cor));
  o.push('  </g>');
  return o.join('\n');
}

/* ═══ painel de um canal de módulo de relé (KA3, KA4) ═══════════════ */
function painelModulo(id, ox, oy) {
  const c = COMPONENTES.find((k) => k.id === 'KA34');
  const n = id === 'KA3' ? '3' : '4';
  const cor = COR[id];
  const usados = new Map();
  for (const g of c.grupos) for (const p of g.pinos) if (p.usa) usados.set(p.nome, p.para);

  const o = [cabecalho(id, ox, oy, cor, `trilho ${c.trilho} · caixa DIN 4M`)];
  const by = oy + 196;
  const MX = ox + 130, MW = 340;

  o.push(`    <rect x="${MX}" y="${by}" width="${MW}" height="76" fill="#e7f5ff" stroke="#1971c2" stroke-width="1.8" rx="4"/>`);
  o.push(`    <text x="${MX + MW / 2}" y="${by + 30}" font-size="12" font-weight="700" fill="#1864ab" text-anchor="middle">MÓDULO DE RELÉ 1 CANAL · 5 V · 51 × 25,5 mm</text>`);
  o.push(`    <text x="${MX + MW / 2}" y="${by + 48}" font-size="9.5" fill="#4c86c6" text-anchor="middle">optoacoplado · jumper de gatilho em H · 65 mA com o relé fechado</text>`);
  /* o próprio relé, dentro do módulo */
  o.push(`    <rect x="${MX + MW - 74}" y="${by + 12}" width="58" height="52" fill="#1971c2" opacity="0.14" stroke="#1971c2" stroke-width="1.2" rx="2"/>`);
  o.push(`    <text x="${MX + MW - 45}" y="${by + 43}" font-size="9" fill="#1864ab" text-anchor="middle">relé 5 V</text>`);

  /* entrada (em cima): DC+, DC−, IN */
  const ent = [['+5V', 'DC+ · alimentação'], ['0V', 'DC− · retorno E referência do IN'], [`IN${n}`, 'gatilho, vindo do Mega']];
  ent.forEach(([nome, papel], i) => {
    const cx = MX + 60 + i * 92, cy = by + 12;
    const usado = usados.has(nome);
    o.push(`    <circle cx="${cx}" cy="${cy}" r="11" fill="${cor}22" stroke="${cor}" stroke-width="2"/>`);
    o.push(`    <text x="${cx}" y="${cy - 18}" font-size="11.5" font-weight="700" fill="${cor}" text-anchor="middle">${esc(nome)}</text>`);
    if (usado) o.push(...rabicho(cx, cy, -1, oy, cor, usados.get(nome), papel));
  });

  /* saída (embaixo): COM e o contato usado */
  const contato = id === 'KA3' ? `NO${n}` : `NC${n}`;
  const naoUsado = id === 'KA3' ? `NC${n}` : `NO${n}`;
  const sai = [[`COM${n}`, 'comum do contato'], [contato, id === 'KA3' ? 'NO — aberto em repouso' : '⭐ NC — FECHADO em repouso']];
  sai.forEach(([nome, papel], i) => {
    const cx = MX + 84 + i * 118, cy = by + 64;
    o.push(`    <circle cx="${cx}" cy="${cy}" r="11" fill="${cor}22" stroke="${cor}" stroke-width="2"/>`);
    o.push(`    <text x="${cx}" y="${cy + 26}" font-size="11.5" font-weight="700" fill="${cor}" text-anchor="middle">${esc(nome)}</text>`);
    if (usados.has(nome)) o.push(...rabicho(cx, cy, +1, oy, cor, usados.get(nome), semEmoji(papel)));
  });
  const cxn = MX + 84 + 2 * 118;
  o.push(`    <circle cx="${cxn}" cy="${by + 64}" r="11" fill="#f8f9fa" stroke="#ced4da" stroke-width="1.3"/>`);
  o.push(`    <text x="${cxn}" y="${by + 90}" font-size="11.5" font-weight="700" fill="#ced4da" text-anchor="middle">${naoUsado}</text>`);
  o.push(`    <text x="${cxn}" y="${by + 104}" font-size="8.5" fill="#adb5bd" text-anchor="middle">NÃO USE</text>`);

  o.push(...discretos(id, ox, oy, cor));
  o.push('  </g>');
  return o.join('\n');
}

/* ═══ pedaços comuns ════════════════════════════════════════════════ */
function cabecalho(id, ox, oy, cor, canto) {
  return [
    `  <g data-rele="${id}">`,
    `    <rect x="${ox}" y="${oy}" width="${P_W}" height="${P_H}" fill="#ffffff" stroke="${cor}" stroke-width="2"/>`,
    `    <rect x="${ox}" y="${oy}" width="${P_W}" height="30" fill="${cor}"/>`,
    `    <text x="${ox + 14}" y="${oy + 21}" font-size="15" font-weight="700" fill="#fff">${id}</text>`,
    `    <text x="${ox + 56}" y="${oy + 21}" font-size="10.5" fill="#fff">${esc(SUB[id])}</text>`,
    `    <text x="${ox + P_W - 12}" y="${oy + 21}" font-size="9.5" fill="#ffffffcc" text-anchor="end">${esc(canto)}</text>`,
    `    <text x="${ox + 14}" y="${oy + 48}" font-size="10" fill="#868e96">${esc(ONDE[id])}</text>`,
  ].join('\n');
}

function rabicho(cx, cy, dir, oy, cor, destino, papel) {
  const o = [];
  const y0 = dir < 0 ? cy - 13 : cy + 13;
  const y1 = dir < 0 ? oy + 84 : oy + P_H - 96;
  o.push(`    <path d="M${cx} ${y0} L${cx} ${y1}" stroke="${cor}" stroke-width="2.4"/>`);
  o.push(`    <circle cx="${cx}" cy="${y1}" r="3.2" fill="${cor}"/>`);
  const ls = linhas(curto(destino));
  const ty = dir < 0 ? y1 - 12 : y1 + 16;
  ls.forEach((l, k) => {
    o.push(`    <text x="${cx}" y="${ty + (dir < 0 ? -(ls.length - 1 - k) * 12 : k * 12)}" font-size="9.5" fill="#343a40" text-anchor="middle">${esc(l)}</text>`);
  });
  o.push(`    <text x="${cx}" y="${dir < 0 ? ty - (ls.length - 1) * 12 - 13 : ty + ls.length * 12 + 1}" font-size="8" fill="${cor}" text-anchor="middle">${esc(papel)}</text>`);
  return o;
}

/* ⭐ os componentes discretos: a parte que o painel não mostrava */
function discretos(id, ox, oy, cor) {
  const lista = DISCRETOS[id];
  const y = oy + P_H - 74;
  if (!lista) {
    return [`    <rect x="${ox + 14}" y="${y}" width="${P_W - 28}" height="60" fill="#f8f9fa" stroke="#dee2e6" stroke-width="1"/>`,
      `    <text x="${ox + 24}" y="${y + 24}" font-size="11" font-weight="700" fill="#868e96">Sem componente discreto</text>`,
      `    <text x="${ox + 24}" y="${y + 42}" font-size="9.5" fill="#adb5bd">Só fio nos parafusos e duas pontes curtas na própria base. O KA1 não é comandado por pino nenhum.</text>`];
  }
  const o = [`    <rect x="${ox + 14}" y="${y}" width="${P_W - 28}" height="60" fill="#fff9db" stroke="#e8a33d" stroke-width="1.2"/>`,
    `    <text x="${ox + 24}" y="${y + 17}" font-size="10.5" font-weight="700" fill="#8a6116">⚡ COMPONENTES DISCRETOS — não vão em placa nenhuma, vão nos bornes</text>`];
  lista.forEach((d, i) => {
    const ty = y + 33 + i * 22;
    o.push(`    <text x="${ox + 24}" y="${ty}" font-size="10" font-weight="700" fill="#8a6116">${esc(d.ref)}</text>`);
    o.push(`    <text x="${ox + 58}" y="${ty}" font-size="9.5" fill="#5c4a00">${esc(d.peca)} · ${esc(semEmoji(d.onde))}</text>`);
    o.push(`    <text x="${ox + 24}" y="${ty + 11}" font-size="8.5" fill="#8a6116">${esc(d.porque)}</text>`);
  });
  return o;
}

const W = 1280, H = 1078;
const svg = [
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="Segoe UI, Arial, sans-serif">`,
  `  <rect width="${W}" height="${H}" fill="#ffffff"/>`,
  '  <!-- GERADO por painel_interativo/scripts/gera_reles_svg.mjs — NÃO EDITE À MÃO -->',
  '  <text x="40" y="36" font-size="22" font-weight="700" fill="#111">LIGAÇÃO DOS RELÉS KA1 A KA4 — e os componentes que ficam nos bornes</text>',
  '  <text x="40" y="57" font-size="12" fill="#555">KA1 e KA2: relé de 8 pinos em base PTF08A, trilho 1 · KA3 e KA4: módulos de relé de 5 V numa caixa DIN 4M, trilho 2 · Projeto Integrador CF-01</text>',
  '  <text x="40" y="77" font-size="11.5" font-weight="700" fill="#c2410c">⚠ No relé de 8 pinos, o número GRAVADO na base não é o nome do desenho: o diagrama diz KA1·14, o parafuso tem gravado 5. É o erro de montagem mais comum.</text>',
  painelRele('KA1', 40, 96),
  painelRele('KA2', 660, 96),
  painelModulo('KA3', 40, 586),
  painelModulo('KA4', 660, 586),
  `  <rect x="40" y="${H - 82}" width="1200" height="62" fill="#f8f9fa" stroke="#adb5bd" stroke-width="1.3"/>`,
  `  <text x="54" y="${H - 61}" font-size="11.5" font-weight="700" fill="#212529">O KA3 usa o NO e o KA4 usa o NC — e isso não é descuido.</text>`,
  `  <text x="54" y="${H - 44}" font-size="10.5" fill="#495057">KA3: módulo sem energia = contato aberto = potência cortada. Estado seguro é DESLIGADO. · KA4: módulo sem energia = contato fechado = ventoinha girando. Estado seguro é LIGADO.</text>`,
  `  <text x="54" y="${H - 27}" font-size="10.5" fill="#495057">Arduino morto, os dois caem juntos e para lados opostos: o KA3 corta a potência e o KA4 mantém o radiador. Primeiro para de gerar calor, depois continua tirando o que sobrou.</text>`,
  '</svg>',
  '',
].join('\n');

/* CRLF x LF: estes arquivos sao escritos com LF, mas num checkout Windows o
   git pode entrega-los com CRLF. Comparar byte a byte reprovaria o deploy
   por um motivo que nada tem a ver com o projeto. */
const lf = (s) => s.split(String.fromCharCode(13)).join('');

const igual = existsSync(SAIDA) && lf(readFileSync(SAIDA, 'utf8')) === lf(svg);
if (igual) { console.log('11_reles_ligacao.svg já está em dia'); process.exit(0); }
if (!process.argv.includes('--escreve')) {
  console.log('⚠️  o 11_reles_ligacao.svg está diferente do modelo. Rode com --escreve.');
  process.exit(1);
}
writeFileSync(SAIDA, svg, 'utf8');
console.log('desenhos/11_reles_ligacao.svg gerado — 2 relés de 8 pinos + 2 canais de módulo');
