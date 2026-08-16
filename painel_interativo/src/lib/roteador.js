/**
 * Roteador dos fios do lado da solda.
 *
 * O problema que ele resolve: ligar 20 fios em linha reta ponto a ponto
 * dá um novelo em que ninguém consegue seguir um fio até o fim. Aqui
 * cada fio anda em ÂNGULO RETO, acompanhando as fileiras e colunas de
 * furos, e todos os trechos horizontais são distribuídos em CANAIS
 * distintos — como as canaletas de um painel.
 *
 * Onde um fio precisa passar por cima de outro, o desenho ganha uma
 * lombada em arco. É a convenção de esquema elétrico: quem tem a
 * lombada passa POR CIMA, quem passa reto fica embaixo.
 */

const PASSO = 2.54;

/* de quanto o trecho vertical se afasta da coluna de furos, para dois
   fios que sobem pela mesma coluna não ficarem um em cima do outro */
const DESVIOS = [0, -0.22, 0.22, -0.4, 0.4];

const cruza = (a, b) => a[0] < b[1] && b[0] < a[1];

/**
 * @param {Array} JUMPERS lista de { n, de:[col,lin], para:[col,lin] }
 * @param {Object} PLACA  { colunas, linhas }
 * @returns lista de { ...jumper, pontos, hops, comprimento }
 */
export function rotear(JUMPERS, PLACA) {
  /* ── 1. um canal horizontal para cada fio ────────────────────────── */
  const canais = new Map();               // linha do canal -> [[colA, colB]]
  const livre = (y, a, b) =>
    !(canais.get(y) ?? []).some(v => cruza([a, b], v));

  /* o fio mais comprido escolhe primeiro: ele é o mais difícil de
     encaixar, e sobra sempre canal curto para os pequenos */
  const ordem = [...JUMPERS].sort((p, q) =>
    Math.abs(q.para[0] - q.de[0]) - Math.abs(p.para[0] - p.de[0]));

  const canalDe = new Map();
  for (const j of ordem) {
    const [c1, l1] = j.de, [c2, l2] = j.para;
    const a = Math.min(c1, c2), b = Math.max(c1, c2);
    const alvo = (l1 + l2) / 2;

    /* candidatos: meias-linhas, começando pelo meio do percurso e
       abrindo para os dois lados */
    let escolhido = null;
    for (let d = 0; d <= PLACA.linhas && escolhido === null; d += 0.5) {
      for (const y of d === 0 ? [Math.round(alvo) + 0.5]
                              : [Math.round(alvo) + 0.5 - d, Math.round(alvo) + 0.5 + d]) {
        if (y < 0.5 || y > PLACA.linhas + 0.5) continue;
        if (livre(y, a, b)) { escolhido = y; break; }
      }
    }
    escolhido ??= Math.round(alvo) + 0.5;
    if (!canais.has(escolhido)) canais.set(escolhido, []);
    canais.get(escolhido).push([a, b]);
    canalDe.set(j.n, escolhido);
  }

  /* ── 2. desvio lateral dos trechos verticais ─────────────────────── */
  const verticais = new Map();            // coluna -> [{ faixa, desvio }]
  const desvioDe = (col, y1, y2) => {
    const faixa = [Math.min(y1, y2), Math.max(y1, y2)];
    const jaTem = verticais.get(col) ?? [];
    for (const d of DESVIOS)
      if (!jaTem.some(v => v.desvio === d && cruza(faixa, v.faixa))) {
        verticais.set(col, [...jaTem, { faixa, desvio: d }]);
        return d;
      }
    return DESVIOS[jaTem.length % DESVIOS.length];
  };

  /* ── 3. os pontos de cada fio, em coordenadas de furo ────────────── */
  const fios = JUMPERS.map(j => {
    const [c1, l1] = j.de, [c2, l2] = j.para;
    const y = canalDe.get(j.n);
    const d1 = desvioDe(c1, l1, y);
    const d2 = c1 === c2 ? d1 : desvioDe(c2, y, l2);
    const pontos = c1 === c2 && Math.abs(l1 - l2) > 0
      ? [[c1, l1], [c1 + d1, l1], [c1 + d1, l2], [c2, l2]]
      : [[c1, l1], [c1 + d1, l1], [c1 + d1, y], [c2 + d2, y], [c2 + d2, l2], [c2, l2]];
    return { ...j, pontos, canal: y };
  });

  /* ── 4. quem passa por cima de quem ──────────────────────────────── */
  const segs = f => f.pontos.slice(0, -1).map((p, i) => [p, f.pontos[i + 1]]);
  const eh = (a, b) => Math.abs(a - b) < 1e-6;

  for (const f of fios) f.hops = [];
  for (let i = 0; i < fios.length; i++)
    for (let k = 0; k < fios.length; k++) {
      if (i === k) continue;
      for (const [A, B] of segs(fios[i])) {
        if (!eh(A[1], B[1])) continue;                     // só os horizontais
        const [xa, xb] = [Math.min(A[0], B[0]), Math.max(A[0], B[0])];
        for (const [C, D] of segs(fios[k])) {
          if (!eh(C[0], D[0])) continue;                   // contra os verticais
          const [ya, yb] = [Math.min(C[1], D[1]), Math.max(C[1], D[1])];
          if (C[0] > xa + 0.05 && C[0] < xb - 0.05 &&
              A[1] > ya + 0.05 && A[1] < yb - 0.05)
            fios[i].hops.push({ x: C[0], y: A[1] });
        }
      }
    }

  /* ── 5. o caminho em SVG, com as lombadas ────────────────────────── */
  const R = 0.55;                                          // raio, em furos
  for (const f of fios) {
    const P = f.pontos.map(([c, l]) => [c * PASSO, l * PASSO]);
    let d = `M ${P[0][0].toFixed(2)} ${P[0][1].toFixed(2)}`;
    let mm = 0;
    for (let i = 1; i < P.length; i++) {
      const [x0, y0] = P[i - 1], [x1, y1] = P[i];
      mm += Math.hypot(x1 - x0, y1 - y0);
      const horiz = Math.abs(y1 - y0) < 1e-6;
      const nesta = horiz
        ? f.hops.filter(h => Math.abs(h.y * PASSO - y0) < 1e-6 &&
            h.x * PASSO > Math.min(x0, x1) && h.x * PASSO < Math.max(x0, x1))
            .map(h => h.x * PASSO)
            .sort((a, b) => (x1 > x0 ? a - b : b - a))
        : [];
      const dir = x1 > x0 ? 1 : -1;
      for (const hx of nesta) {
        const r = R * PASSO;
        d += ` L ${(hx - r * dir).toFixed(2)} ${y0.toFixed(2)}`;
        /* varredura escolhida para a lombada apontar sempre para cima */
        d += ` A ${r.toFixed(2)} ${r.toFixed(2)} 0 0 ${dir > 0 ? 1 : 0} `
           + `${(hx + r * dir).toFixed(2)} ${y0.toFixed(2)}`;
      }
      d += ` L ${x1.toFixed(2)} ${y1.toFixed(2)}`;
    }
    f.d = d;
    f.comprimento = mm;
  }

  return fios;
}

/** Quantos fios ficaram sem canal exclusivo — só para o validador. */
export function conflitos(fios) {
  const porCanal = new Map();
  for (const f of fios) {
    const xs = f.pontos.map(p => p[0]);
    const v = [Math.min(...xs), Math.max(...xs)];
    const lista = porCanal.get(f.canal) ?? [];
    const bate = lista.find(o => cruza(v, o.faixa));
    if (bate) return [{ a: f.n, b: bate.n, canal: f.canal }];
    porCanal.set(f.canal, [...lista, { n: f.n, faixa: v }]);
  }
  return [];
}
