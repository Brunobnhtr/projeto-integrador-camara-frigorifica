/**
 * Quantos bornes comprar para as duas placas.
 *
 * Bornes KF301 de 2 e de 3 vias ENCAIXAM lado a lado (rabo de andorinha),
 * então qualquer contagem se monta com esses dois. Não se compra um bloco
 * de 11 vias: compram-se três de 3 e um de 2, e eles viram um.
 *
 * Este script existe para a lista de compras não sair do ar quando o
 * layout mudar — foi exatamente o que aconteceu com a lista escrita à
 * mão, que pedia 2 bornes de 8 vias quando o projeto já precisava de 32.
 */
import * as PI1 from '../src/data/pi1_fisico.js';
import * as PI2 from '../src/data/pi2_fisico.js';

const PASSO_BORNE = 5.08;   // mm — exatamente 2 furos de 2,54

/* Com blocos de 2 e de 3, todo n ≥ 2 se resolve assim. */
const blocos = n => {
  if (n < 2) return { erro: `${n} via — não existe borne de 1` };
  const r = n % 3;
  if (r === 0) return { tres: n / 3, dois: 0 };
  if (r === 2) return { tres: (n - 2) / 3, dois: 1 };
  return { tres: (n - 4) / 3, dois: 2 };            // resto 1
};

let T = 0, D = 0, vias = 0, erros = 0;
const larguras = [];

for (const [nome, m] of [['PI-1', PI1], ['PI-2', PI2]]) {
  console.log(`\n${nome} — ${m.PLACA.larguraMm.toFixed(1)} mm de largura útil`);
  for (const b of m.BORNES) {
    const n = b.vias.length;
    const { tres, dois, erro } = blocos(n);
    if (erro) { console.log(`  X ${b.ref}: ${erro}`); erros++; continue; }
    const mm = n * PASSO_BORNE;
    larguras.push({ placa: nome, ref: b.ref, mm, util: m.PLACA.larguraMm });
    const partes = [tres && `${tres} × 3 vias`, dois && `${dois} × 2 vias`].filter(Boolean);
    console.log(`  ${b.ref} — ${String(n).padStart(2)} vias · `
      + `${mm.toFixed(1).padStart(5)} mm = ${partes.join(' + ')}`);
    T += tres; D += dois; vias += n;
  }
}

/* os bornes de uma mesma borda não podem estourar a largura da placa */
const porBorda = new Map();
for (const [nome, m] of [['PI-1', PI1], ['PI-2', PI2]])
  for (const b of m.BORNES) {
    const k = `${nome}|${b.linha}`;
    porBorda.set(k, (porBorda.get(k) ?? 0) + b.vias.length * PASSO_BORNE);
  }
console.log('\nLargura ocupada em cada borda:');
for (const [k, mm] of porBorda) {
  const [nome, linha] = k.split('|');
  const util = (nome === 'PI-1' ? PI1 : PI2).PLACA.larguraMm;
  const ok = mm <= util;
  if (!ok) erros++;
  console.log(`  ${ok ? '.' : 'X'} ${nome} fileira ${linha}: `
    + `${mm.toFixed(1)} de ${util.toFixed(1)} mm`);
}

console.log(`\n┌─ LISTA DE COMPRAS ────────────────────────────────`);
console.log(`│  ${T} blocos de 3 vias  ·  ${D} blocos de 2 vias`);
console.log(`│  = ${T * 3 + D * 2} vias (o projeto usa ${vias})`);
console.log(`│  Com reserva: ${T + 4} de 3 vias e ${D + 5} de 2 vias`);
console.log(`└───────────────────────────────────────────────────`);
console.log('\n⚠️  PASSO 5,08 mm — nunca 5,00 mm. Ver Doc 33 §33.3.');

if (T * 3 + D * 2 !== vias) { console.log('X a conta dos blocos não fecha'); erros++; }
process.exit(erros ? 1 : 0);
