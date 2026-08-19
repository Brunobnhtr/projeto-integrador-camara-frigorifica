/**
 * Redesenha os TRÊS TRILHOS dentro de desenhos/04_painel_layout.svg a partir
 * do painel_completo.js.
 *
 * ⭐ Existe pelo mesmo motivo do gera_trilhos.mjs: o desenho tinha derivado.
 *    Ele ainda mostrava `K1 · 4PDT` e `K0 · relé 5 V · trip D26` — nomes mortos
 *    há três revisões — numa escala de painel de 400 mm que não existe mais.
 *    Desenho de trilho feito à mão sobre um modelo que os validadores conferem
 *    sempre acaba mentindo. Este não pode.
 *
 *    Só os três grupos de trilho são regerados. A porta, os prensa-cabos, a
 *    antena e as cotas continuam desenhados à mão no arquivo.
 *
 *    Uso:  node scripts/gera_trilhos_svg.mjs            (confere)
 *          node scripts/gera_trilhos_svg.mjs --escreve  (redesenha)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { COMPONENTES, TRILHOS } from '../src/data/painel_completo.js';

const SVG = new URL('../../desenhos/04_painel_layout.svg', import.meta.url);

/* O trilho útil do modelo (42–458 mm) ocupa 110–450 px no desenho. */
const MM0 = 42, MM1 = 458, PX0 = 110, PX1 = 450;
const px = (mm) => PX0 + ((mm - MM0) * (PX1 - PX0)) / (MM1 - MM0);

/* Y de cada trilho no desenho, e a altura da faixa de componente. */
const Y = { 1: { rail: 221, topo: 196 }, 2: { rail: 351, topo: 326 }, 3: { rail: 481, topo: 456 } };
const ALT = 56;

const TITULO = {
  1: 'TRILHO DIN 1 — DISTRIBUIÇÃO E PROTEÇÃO',
  2: 'TRILHO DIN 2 — POTÊNCIA E COMANDO',
  3: 'TRILHO DIN 3 — CONTROLE',
};

/* Rótulo curto: o `nome` do modelo é longo demais para caber em 30 px. */
const CURTO = {
  'BD-POT': 'BD-POT', 'BD-AUX': 'BD-AUX', 'BD-24V': 'BD-24V', 'BD-5V': 'BD-5V',
  'BD-0V': 'BD-0V', 'KA1': 'KA1', 'KA2': 'KA2', 'KA3': 'KA3', 'KA4': 'KA4',
  'BTS1': 'BTS #1', 'BTS2': 'BTS #2', 'MV-1': 'MV-1', 'F-P': 'F-P',
  'ESP32': 'ESP32', 'MEGA': 'ARDUINO MEGA', 'RTC': 'RTC',
  'SV-1': 'SENSOR V', 'AD-1': 'ADAPT. 1-WIRE', 'BS-1': 'BORNES IS', 'SC-1': 'SENSOR A',
  'BD-0V-B': 'BD-0V-B',
};
const SUB = {
  'BD-POT': '24 V comutado', 'BD-AUX': '12 V perm.', 'BD-24V': '24 V perm.',
  'BD-5V': '5,10 V', 'BD-0V': 'star ground',
  'KA1': 'emergência', 'KA2': '⚡ 6 A', 'KA3': '⭐ veto D27', 'KA4': '⭐ fan D30',
  'BTS1': 'Peltier · frio', 'BTS2': 'PTC · quente', 'MV-1': '5 fans int.',
  'F-P': 'fusíveis', 'ESP32': 'DNLCB30 · MQTT', 'MEGA': '2560 + Shield',
  'SV-1': 'divisor 5:1', 'AD-1': 'pull-up 4,7 k', 'BS-1': 'C1 · C2', 'SC-1': 'WCS2702',
  'BD-0V-B': '0 V da eletrônica', 'RTC': 'DS3231',
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function grupo(tr) {
  const comps = COMPONENTES.filter((c) => c.trilho === tr).sort((a, b) => a.x - b.x);
  const y = Y[tr];
  const out = [
    `  <!-- ===== TRILHO ${tr} — GERADO por scripts/gera_trilhos_svg.mjs, NÃO EDITE À MÃO ===== -->`,
    `  <rect x="110" y="${y.rail}" width="340" height="8" fill="#b2bec3" stroke="#2d3436" stroke-width="1.5"/>`,
    `  <text x="118" y="${y.topo}" font-size="11" font-weight="700" fill="#2d3436">${TITULO[tr]}</text>`,
    `  <g data-gerado="trilho${tr}">`,
  ];

  for (const c of comps) {
    const x = px(c.x), w = Math.max(px(c.x + c.largura) - x, 9);
    const cor = c.cor || '#868e96';
    const destaque = /^KA[34]$/.test(c.id);
    out.push(`    <rect x="${x.toFixed(1)}" y="${y.topo}" width="${w.toFixed(1)}" height="${ALT}"`
      + ` fill="${cor}22" stroke="${cor}" stroke-width="${destaque ? 2.2 : 1.3}"/>`);

    const cx = (x + w / 2).toFixed(1);
    const nome = esc(CURTO[c.id] || c.id);
    const sub = SUB[c.id] ? esc(SUB[c.id]) : '';
    if (w >= 42) {
      out.push(`    <text x="${cx}" y="${y.topo + 24}" font-size="${destaque ? 11 : 10}"`
        + ` font-weight="700" fill="${cor}" text-anchor="middle">${nome}</text>`);
      if (sub) out.push(`    <text x="${cx}" y="${y.topo + 39}" font-size="8" fill="${cor}" text-anchor="middle">${sub}</text>`);
    } else {
      /* estreito demais para texto deitado: gira 90° */
      const cy = y.topo + ALT / 2;
      out.push(`    <text x="${cx}" y="${cy}" font-size="9.5" font-weight="700" fill="${cor}"`
        + ` text-anchor="middle" transform="rotate(-90 ${cx} ${cy})">${nome}</text>`);
    }
  }
  out.push('  </g>');
  return out.join('\n');
}

/* CRLF x LF: estes arquivos sao escritos com LF, mas num checkout Windows o
   git pode entrega-los com CRLF. Comparar byte a byte reprovaria o deploy
   por um motivo que nada tem a ver com o projeto. */
const lf = (s) => s.split(String.fromCharCode(13)).join('');

const doc = lf(readFileSync(SVG, 'utf8'));
let novo = doc;
for (const tr of [1, 2, 3]) {
  const marca = new RegExp(
    `  <!-- ===== TRILHO ${tr}[\\s\\S]*?\\n  </g>`, 'm');
  if (!marca.test(novo)) { console.error(`não achei o bloco do trilho ${tr}`); process.exit(1); }
  novo = novo.replace(marca, grupo(tr));
}

if (novo === doc) { console.log('04_painel_layout.svg já está em dia'); process.exit(0); }
if (!process.argv.includes('--escreve')) {
  console.log('⚠️  os trilhos do 04_painel_layout.svg estão diferentes do modelo. Rode com --escreve.');
  process.exit(1);
}
writeFileSync(SVG, novo, 'utf8');
console.log(`trilhos redesenhados · ${TRILHOS.length} trilhos, ${COMPONENTES.filter((c) => c.trilho).length} componentes`);
