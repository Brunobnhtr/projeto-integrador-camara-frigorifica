/* Quanto cabo cabe num prensa-cabo.

   ⭐ POR QUE ISTO VIROU CÓDIGO: a saída para a câmara estava declarada como PG9, com
   `capacidade: 14` — um número escrito à mão, sem conta nenhuma atrás.
   Só que um PG9 aperta cabo de 4 a 8 mm, e doze condutores (quatro
   deles de 1,5 mm²) dão quase 10 mm de feixe. Não é apertado: não
   fecha. A vedação não morde, e num painel isso é a porta de entrada
   de poeira e umidade.

   A conta é a clássica de feixe: diâmetro equivalente pela raiz da
   soma dos quadrados, mais 15% de folga porque cabo redondo não se
   empacota perfeito.                                                  */

/* diâmetro EXTERNO aproximado do condutor flexível PVC 750 V, em mm */
export const D_EXTERNO = {
  0.25: 1.8, 0.5: 2.2, 0.75: 2.5, 1.0: 2.7, 1.5: 3.0, 2.5: 3.6, 4.0: 4.4,
};

/* faixa de aperto de cada rosca, em mm de diâmetro do cabo */
export const FAIXA_PRENSA = {
  PG7:      [3.0, 6.5],
  PG9:      [4.0, 8.0],
  PG11:     [5.0, 10.0],
  'PG13,5': [6.0, 12.0],
  PG16:     [10.0, 14.0],
};

/** Diâmetro do feixe formado por estes fios, em mm. */
export function feixeMm(fios) {
  const soma = fios.reduce((a, f) => a + (D_EXTERNO[f.mm2] ?? 2.2) ** 2, 0);
  return 1.15 * Math.sqrt(soma);
}

/** A menor rosca que aperta este feixe — ou null se nem a maior serve. */
export function prensaParaFeixe(d) {
  const cabe = Object.entries(FAIXA_PRENSA)
    .filter(([, [lo, hi]]) => d >= lo && d <= hi)
    .sort((a, b) => a[1][1] - b[1][1]);
  return cabe[0]?.[0] ?? null;
}

/**
 * Diz se a rosca declarada serve para o feixe que passa por ela.
 * `folga` = quanto sobra até o limite; negativo é o que não fecha.
 */
export function conferePrensa(tipo, fios) {
  const d = feixeMm(fios);
  const faixa = FAIXA_PRENSA[tipo];
  if (!faixa) return { d, ok: false, motivo: `rosca ${tipo} desconhecida` };
  const [lo, hi] = faixa;
  if (d > hi) return { d, ok: false, faixa, sugere: prensaParaFeixe(d),
    motivo: `feixe de ${d.toFixed(1)} mm num ${tipo}, que aperta até ${hi} mm` };
  if (d < lo) return { d, ok: false, faixa, sugere: prensaParaFeixe(d), fino: true,
    motivo: `feixe de ${d.toFixed(1)} mm num ${tipo}, que só morde a partir de ${lo} mm` };
  return { d, ok: true, faixa };
}
