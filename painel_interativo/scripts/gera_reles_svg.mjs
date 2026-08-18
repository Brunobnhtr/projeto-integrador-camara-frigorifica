/**
 * Gera desenhos/11_reles_ligacao.svg — a base PTF08A dos quatro relés,
 * vista de cima, com o que entra em cada parafuso.
 *
 * ⭐ O desenho que faltava. O projeto descrevia KA1 a KA4 em texto e nos dados,
 *    mas não havia figura nenhuma mostrando ONDE o fio encosta. Gerado do
 *    painel_completo.js para não poder divergir.
 *
 *    Uso:  node scripts/gera_reles_svg.mjs            (confere)
 *          node scripts/gera_reles_svg.mjs --escreve  (redesenha)
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { COMPONENTES } from '../src/data/painel_completo.js';

const SAIDA = new URL('../../desenhos/11_reles_ligacao.svg', import.meta.url);

/* A base PTF08A tem os 8 parafusos em duas fileiras de 4. A ordem da
   esquerda para a direita é de fábrica — não é escolha do projeto. */
const CIMA = ['22', '24', '21', 'A2'];
const BAIXO = ['12', '14', '11', 'A1'];
const GRAVADO = { 22: 4, 24: 8, 21: 12, A2: 14, 12: 1, 14: 5, 11: 9, A1: 13 };
const PAPEL = {
  22: 'NF do contato 2', 24: 'NA do contato 2', 21: 'comum 2', A2: 'bobina',
  12: 'NF do contato 1', 14: 'NA do contato 1', 11: 'comum 1', A1: 'bobina',
};

const COR = { KA1: '#5f3dc4', KA2: '#5f3dc4', KA3: '#c2410c', KA4: '#c2410c' };
const SUB = {
  KA1: 'SEGURANÇA — cai na emergência, só o REARME azul devolve',
  KA2: 'PROCESSO — cai no STOP, só o START verde devolve · ⚡ contato de 6 A',
  KA3: 'VETO DO FIRMWARE — em série com a bobina do KA2 · contato NA',
  KA4: 'VENTOINHAS DO RADIADOR — chaveia o +12 V · contato NF ⭐',
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

/* Tira os emoji e corta no primeiro travessão: o `para` do modelo é uma
   frase inteira, e aqui só cabe o destino. */
function curto(txt) {
  const limpo = txt.replace(/[\p{Extended_Pictographic}️]/gu, '').trim();
  const corte = limpo.split(/\s+—\s+|:\s+/)[0].trim();
  return corte.length > 46 ? corte.slice(0, 44) + '…' : corte;
}

/* Quebra em até 2 linhas de ~24 caracteres, sem partir palavra. */
function linhas(txt) {
  if (txt.length <= 24) return [txt];
  const palavras = txt.split(' ');
  const a = [];
  let n = 0;
  while (palavras.length && n + palavras[0].length <= 24) { n += palavras[0].length + 1; a.push(palavras.shift()); }
  return [a.join(' '), palavras.join(' ')];
}

const P_W = 600, P_H = 470;      // caixa de um relé
const B_X = 92, B_W = 416;       // a base, dentro da caixa
const COL = B_W / 4;

function painel(id, ox, oy) {
  const c = COMPONENTES.find((k) => k.id === id);
  const cor = COR[id];
  const usados = new Map();
  for (const g of c.grupos) for (const p of g.pinos) if (p.usa) usados.set(p.nome, p.para);

  const o = [];
  const X = (i) => ox + B_X + COL * i + COL / 2;

  o.push(`  <g data-rele="${id}">`);
  o.push(`    <rect x="${ox}" y="${oy}" width="${P_W}" height="${P_H}" fill="#ffffff" stroke="${cor}" stroke-width="2"/>`);
  o.push(`    <rect x="${ox}" y="${oy}" width="${P_W}" height="30" fill="${cor}"/>`);
  o.push(`    <text x="${ox + 14}" y="${oy + 21}" font-size="15" font-weight="700" fill="#fff">${id}</text>`);
  o.push(`    <text x="${ox + 56}" y="${oy + 21}" font-size="10.5" fill="#fff">${esc(SUB[id])}</text>`);
  o.push(`    <text x="${ox + P_W - 12}" y="${oy + 21}" font-size="9.5" fill="#ffffffcc" text-anchor="end">trilho ${c.trilho} · X = ${c.x} mm</text>`);

  /* o corpo da base */
  const by = oy + 196;
  o.push(`    <rect x="${ox + B_X}" y="${by}" width="${B_W}" height="76" fill="#f1f3f5" stroke="#868e96" stroke-width="1.6" rx="3"/>`);
  o.push(`    <text x="${ox + B_X + B_W / 2}" y="${by + 30}" font-size="12" font-weight="700" fill="#868e96" text-anchor="middle">BASE PTF08A · trilho DIN</text>`);
  o.push(`    <text x="${ox + B_X + B_W / 2}" y="${by + 48}" font-size="9.5" fill="#adb5bd" text-anchor="middle">o relé encaixa por cima e sai puxando · a base fica parafusada</text>`);
  o.push(`    <text x="${ox + B_X - 8}" y="${by - 6}" font-size="9" fill="#868e96" text-anchor="end">fileira</text>`);
  o.push(`    <text x="${ox + B_X - 8}" y="${by + 4}" font-size="9" fill="#868e96" text-anchor="end">de cima</text>`);
  o.push(`    <text x="${ox + B_X - 8}" y="${by + 80}" font-size="9" fill="#868e96" text-anchor="end">fileira</text>`);
  o.push(`    <text x="${ox + B_X - 8}" y="${by + 90}" font-size="9" fill="#868e96" text-anchor="end">de baixo</text>`);

  for (const [fileira, nomes, dir] of [['cima', CIMA, -1], ['baixo', BAIXO, +1]]) {
    nomes.forEach((nome, i) => {
      const cx = X(i);
      const cy = dir < 0 ? by + 12 : by + 64;
      const usado = usados.has(nome);
      const cf = usado ? cor : '#ced4da';

      /* o parafuso */
      o.push(`    <circle cx="${cx}" cy="${cy}" r="13" fill="${usado ? cor + '22' : '#f8f9fa'}" stroke="${cf}" stroke-width="${usado ? 2.2 : 1.3}"/>`);
      o.push(`    <path d="M${cx - 7} ${cy} L${cx + 7} ${cy}" stroke="${cf}" stroke-width="2"/>`);
      o.push(`    <text x="${cx}" y="${cy + (dir < 0 ? -20 : 30)}" font-size="13" font-weight="700" fill="${cf}" text-anchor="middle">${nome}</text>`);
      o.push(`    <text x="${cx + 17}" y="${cy + 4}" font-size="9" fill="#868e96">nº ${GRAVADO[nome]}</text>`);

      if (!usado) {
        o.push(`    <text x="${cx}" y="${cy + (dir < 0 ? -34 : 44)}" font-size="8.5" fill="#adb5bd" text-anchor="middle">livre · ${esc(PAPEL[nome])}</text>`);
        return;
      }

      /* o rabicho e o destino */
      const y0 = dir < 0 ? cy - 13 : cy + 13;
      const y1 = dir < 0 ? oy + 78 : oy + P_H - 78;
      o.push(`    <path d="M${cx} ${y0} L${cx} ${y1}" stroke="${cor}" stroke-width="2.4"/>`);
      o.push(`    <circle cx="${cx}" cy="${y1}" r="3.2" fill="${cor}"/>`);

      const ls = linhas(curto(usados.get(nome)));
      const ty = dir < 0 ? y1 - 12 : y1 + 16;
      ls.forEach((l, k) => {
        o.push(`    <text x="${cx}" y="${ty + (dir < 0 ? -(ls.length - 1 - k) * 12 : k * 12)}" font-size="9.5" fill="#343a40" text-anchor="middle">${esc(l)}</text>`);
      });
      o.push(`    <text x="${cx}" y="${dir < 0 ? ty - (ls.length - 1) * 12 - 13 : ty + ls.length * 12 + 1}" font-size="8" fill="${cor}" text-anchor="middle">${esc(PAPEL[nome])}</text>`);
    });
  }
  o.push('  </g>');
  return o.join('\n');
}

const W = 1280, H = 1070;
const svg = [
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="Segoe UI, Arial, sans-serif">`,
  `  <rect width="${W}" height="${H}" fill="#ffffff"/>`,
  '  <!-- GERADO por painel_interativo/scripts/gera_reles_svg.mjs — NÃO EDITE À MÃO -->',
  '  <text x="40" y="38" font-size="22" font-weight="700" fill="#111">LIGAÇÃO DOS RELÉS KA1 A KA4 — vista de cima da base</text>',
  '  <text x="40" y="60" font-size="12" fill="#555">Os quatro são o MESMO relé: 8 pinos, bobina 24 Vcc, 2 contatos reversíveis de 10 A, em base PTF08A de trilho DIN · Projeto Integrador CF-01</text>',
  '  <text x="40" y="80" font-size="11.5" font-weight="700" fill="#c2410c">⚠ O número GRAVADO na base e o nome do desenho são coisas diferentes: o diagrama diz KA1·14, o parafuso tem gravado 5. É o erro de montagem mais comum.</text>',
  painel('KA1', 40, 100),
  painel('KA2', 660, 100),
  painel('KA3', 40, 590),
  painel('KA4', 660, 590),
  `  <rect x="40" y="${1070 - 88}" width="1200" height="66" fill="#f8f9fa" stroke="#adb5bd" stroke-width="1.3"/>`,
  `  <text x="54" y="${1070 - 66}" font-size="11.5" font-weight="700" fill="#212529">O KA3 usa o NA e o KA4 usa o NF — e isso não é descuido.</text>`,
  `  <text x="54" y="${1070 - 48}" font-size="10.5" fill="#495057">KA3: relé solto = contato aberto = potência cortada. Estado seguro é DESLIGADO. · KA4: relé solto = contato fechado = ventoinha girando. Estado seguro é LIGADO.</text>`,
  `  <text x="54" y="${1070 - 31}" font-size="10.5" fill="#495057">Arduino morto, os dois caem juntos e para lados opostos: o KA3 corta a potência e o KA4 mantém o radiador. Primeiro para de gerar calor, depois continua tirando o que sobrou.</text>`,
  '</svg>',
  '',
].join('\n');

const igual = existsSync(SAIDA) && readFileSync(SAIDA, 'utf8') === svg;
if (igual) { console.log('11_reles_ligacao.svg já está em dia'); process.exit(0); }
if (!process.argv.includes('--escreve')) {
  console.log('⚠️  o 11_reles_ligacao.svg está diferente do modelo. Rode com --escreve.');
  process.exit(1);
}
writeFileSync(SAIDA, svg, 'utf8');
console.log('desenhos/11_reles_ligacao.svg gerado');
