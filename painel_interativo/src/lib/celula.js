/**
 * Endereço de cada furo, no estilo de uma planilha: coluna em LETRA,
 * fileira em NÚMERO. O furo da coluna 11, fileira 6, é a célula "K6".
 *
 * ⭐ Por que isto importa mais do que parece: "furo 11,6" e "furo 6,11"
 * são fáceis de trocar, e no meio de uma solda ninguém quer conferir
 * qual número era a coluna. "K6" não tem como inverter.
 *
 * E o endereço é do FURO, não da vista: K6 é o mesmo furo olhando a
 * placa por cima ou por baixo. Só a posição na tela muda.
 */

/** 1 → A · 26 → Z · 27 → AA · 28 → AB … igual à planilha. */
export function letra(col) {
  let s = '';
  let n = col;
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

/** "K6" a partir de (11, 6). */
export const cel = (col, lin) => `${letra(col)}${lin}`;

/** O caminho de volta: "AA6" → { col: 27, lin: 6 }. */
export function daCelula(txt) {
  const m = /^([A-Z]+)(\d+)$/.exec(String(txt).trim().toUpperCase());
  if (!m) return null;
  let col = 0;
  for (const ch of m[1]) col = col * 26 + (ch.charCodeAt(0) - 64);
  return { col, lin: +m[2] };
}
