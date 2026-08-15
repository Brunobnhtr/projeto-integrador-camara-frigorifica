import { CABOS } from '../src/data/painel.js';
const blocos = ['BD-POT','BD-AUX','BD-5V','BD-24V','BD-0V'];
for (const b of blocos) {
  const usos = new Map();
  for (const c of CABOS) {
    for (const p of [c.de, c.para]) {
      const [comp, term] = p.split(':');
      if (comp !== b) continue;
      const outro = p === c.de ? c.para : c.de;
      if (!usos.has(term)) usos.set(term, []);
      usos.get(term).push(`${outro} (cabo ${c.n})`);
    }
  }
  console.log(`\n### ${b} — ${usos.size} terminais usados`);
  [...usos.entries()].sort().forEach(([t, v]) => {
    const flag = v.length > 1 ? '  <-- ' + v.length + ' FIOS NO MESMO TERMINAL' : '';
    console.log(`  ${t.padEnd(5)} ${v.join(' , ')}${flag}`);
  });
}
