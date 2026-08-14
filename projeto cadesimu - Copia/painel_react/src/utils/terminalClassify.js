/**
 * Classifica terminais elétricos em camadas visuais:
 *   'top'    → 1,3,5 / A1,U1,V1,W1 (entradas de potência)
 *   'middle' → 11,21,31 / 12,22,32 (contatos auxiliares) + PE, N (sem par)
 *   'bottom' → 2,4,6 / A2,U2,V2,W2 (saídas de potência)
 */
export function classifyTerminal(t) {
  if (/^\d+$/.test(t)) {
    const n = parseInt(t, 10);
    // Dois dígitos: 11-99 → auxiliares (meio)
    if (n >= 10 && n <= 99) return 'middle';
    // Um dígito: ímpar → topo, par → base
    return n % 2 === 1 ? 'top' : 'bottom';
  }
  // Sufixo letra+1 (A1, U1, V1, W1, X1) → topo
  if (/^[A-Z]+1$/.test(t)) return 'top';
  // Sufixo letra+2 (A2, U2, V2, W2, X2) → base
  if (/^[A-Z]+2$/.test(t)) return 'bottom';
  // Solo: PE, N → meio
  return 'middle';
}

/**
 * Agrupa terminais em pares (top, bottom) seguindo convenção elétrica.
 * Mirrors Python emparelhar_terminais().
 */
export function emparelharTerminais(terminais) {
  const usado = new Set();
  const colunas = [];
  for (const t of terminais) {
    if (usado.has(t)) continue;
    let partner = null;
    // Sufixo X1 ↔ X2
    if (t.length >= 2 && t.endsWith('1') && /^[A-Z]+$/.test(t.slice(0, -1))) {
      const cand = t.slice(0, -1) + '2';
      if (terminais.includes(cand) && !usado.has(cand)) partner = cand;
    } else if (/^\d+$/.test(t)) {
      const n = parseInt(t, 10);
      if (n % 2 === 1) {
        const cand = String(n + 1);
        if (terminais.includes(cand) && !usado.has(cand)) partner = cand;
      } else {
        const cand = String(n - 1);
        if (terminais.includes(cand) && !usado.has(cand)) {
          colunas.push([cand, t]);
          usado.add(cand);
          usado.add(t);
          continue;
        }
      }
    }
    if (partner) {
      colunas.push([t, partner]);
      usado.add(t);
      usado.add(partner);
    } else {
      colunas.push([t, null]);
      usado.add(t);
    }
  }
  return colunas;
}
