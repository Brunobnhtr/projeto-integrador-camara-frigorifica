/**
 * SIMULADOR · ENERGIA
 * ===================
 * Quanta corrente cada barramento puxa AGORA, dado o estado do painel.
 *
 * ⭐ POR QUE ISTO EXISTE. Uma planilha de consumo é uma foto do pior
 *   caso que alguém IMAGINOU. Este arquivo calcula o consumo do estado
 *   real, a cada passo — então o pior caso deixa de ser imaginado e
 *   passa a ser o maior valor que apareceu rodando os cenários.
 *
 *   Foi assim que se descobriu que a tabela do Doc 02 ainda somava
 *   "2 fans internas ativas" depois de as cinco terem sido juntadas
 *   num contato só, o do KA3.
 *
 * Números: proposta provisória de T2/T3/PTC; conferir no Doc 02 §2.4
 * antes de qualquer compra ou energização.
 */

/** Correntes nominais, em ampères, na tensão do próprio barramento. */
export const CARGAS = {
  // ── BD-POT · 24 V comutado (Peltier) ────────────────────────────
  peltier: 6.0,          // 2 pastilhas TEC1-12706 em série, a 100 %
  ptc: 50 / 12,          // A — PTC proposto 12 V / 50 W; variante pendente

  // ── BD-AUX · 12 V permanente (ventoinhas e serviços) ─────────────
  radiadorCada: 0.25,    // 80 mm, 3 fios — são 2
  internaCada: 0.125,    // ⭐ são CINCO: 2 frias + 2 dos dutos + a do PTC
  coolerBts: 0.12,       // 40 mm, sem comando — sempre ligado
  /* ⭐ AS 8 POSIÇÕES DE ENSAIO ENTRARAM NA CONTA. Elas são a carga que o
     projeto mede, e ficavam de fora do orçamento: 12 V sobre 1 kΩ dão 10 mA
     cada, 80 mA nas oito. Parece nada — e é, no total —, mas um orçamento que
     esquece a carga principal é o tipo de erro que só aparece na auditoria. */
  posicoesCada: 0.010,   // LED 5 mm + 1 kΩ em 12 V — são OITO

  // ── BD-5V · 5,10 V permanente ────────────────────────────────────
  mega: 0.20,
  ihm: 0.14,             // 0,25 A no pico, com o alto-falante
  sdRtc: 0.06,
  logicaBts: 0.02,
  ledsMaquete: 0.04,
  moduloReleCada: 0.065, // ⭐ KA1, KA2 e KA3 — os que este projeto acrescentou

  // ── BD-24V · 24 V permanente ─────────────────────────────────────
  esp32: 0.10,           // DNLCB30 + ESP32
  bobinaRele: 0.037,     // 24 V / 650 Ω — a bobina do KM1
  sinaleiroCada: 0.02,   // ⭐ agora em 5 V, acesos direto pelo pino do Mega
  /* ⭐ O INSTRUMENTO TAMBÉM CONSOME, e ele é o único que NUNCA desliga:
     fica no 24 V permanente justamente para sobreviver à emergência. Ficava
     fora da conta porque "é só um módulo" — 30 mA que ninguém somava. */
  n4aic24: 0.030,        // 24 V — módulo de aquisição (datasheet ~0,7 W)
};

/** Estimativas provisórias; substituir pelos dados dos conversores escolhidos. */
const RENDIMENTO = { v5: 0.85, v12: 0.88 };

/** Limites de projeto, para o simulador poder reprovar sozinho. */
export const LIMITES = {
  fonte24: 10.0,      // A — fonte S-240-24
  F1: 10.0,           // A — ramal de potência
  F2: 2.0,            // A — ramal de comando (5 V + serviços de 24 V)
  F3: 2.0,            // A — ramal auxiliar (12 V)
  caboT2: 0.7,        // A — 0,50 mm² declarado no Doc 02 §2.7
  caboT3: 1.6,        // A — 0,75 mm² declarado no Doc 02 §2.7
  t2SaidaDeclarada: 5.0, // A — conversor proposto; ficha do modelo exato pendente
  t3SaidaDeclarada: 20.0, // A — conversor proposto; ficha do modelo exato pendente
};

/**
 * Consumo instantâneo, a partir do estado do simulador.
 * @returns correntes por barramento + a corrente vista pela fonte
 */
export function consumo(sim) {
  const f = sim.firmware;
  const geral = !sim.falhas.geralDesligada;
  const haPotencia = (sim.barras?.['BD-POT'] ?? 0) > 0;
  const haAux = (sim.barras?.['BD-AUX'] ?? 0) > 0;
  const haPtc = (sim.barras?.['BD-PTC'] ?? 0) > 0;
  const ha5v = (sim.barras?.['BD-5V'] ?? 0) > 0;

  // ── BD-POT · 24 V (Peltier) ──────────────────────────────────────
  let iPot = 0;
  if (haPotencia) {
    if (sim.falhas.btsPeltierEmCurto) iPot += CARGAS.peltier;
    else if (f.renPeltier) iPot += CARGAS.peltier * f.duty / 100;
  }

  // ── BD-PTC · 12 V permanente, separado do KM1 ────────────────────
  // ST-1/ST-2 são contatos físicos em série. Sem o corte CC independente
  // ainda definido, um BTS2 em curto pode manter o PTC energizado após STOP,
  // trip ou emergência, enquanto o barramento geral de 12 V estiver ativo.
  let iPtc = 0;
  const cadeiaTermicaFechada = !sim.termostatos.st1Aberto && !sim.termostatos.st2Aberto;
  if (haPtc && cadeiaTermicaFechada) {
    if (sim.falhas.btsPtcEmCurto) iPtc = CARGAS.ptc;
    else if (f.renPtc) iPtc = CARGAS.ptc * f.duty / 100;
  }

  // ── BD-AUX (12 V; PTC excluído) ──────────────────────────────────
  let i12 = 0;
  if (haAux) {
    // ⭐ quem gasta é o CONTATO do KA2, não a ordem do firmware
    const contatoKa2 = sim.falhas.ka2Colado ? true
      : sim.falhas.ka2Aberto ? false
      : f.ventRadiador;
    if (contatoKa2) i12 += 2 * CARGAS.radiadorCada;
    const contatoKa3 = sim.falhas.ka3Aberto ? false : f.ventInternas;
    if (contatoKa3) i12 += 5 * CARGAS.internaCada;
    i12 += CARGAS.coolerBts;      // sem comando: enquanto houver 12 V
    /* As 8 posições acendem com a chave de cada uma — e o ensaio roda com
       elas acesas, que é o caso real. Entram no pior caso, não no melhor. */
    i12 += 8 * CARGAS.posicoesCada;
  }

  // ── BD-5V ────────────────────────────────────────────────────────
  let i5 = 0;
  if (ha5v) {
    i5 += CARGAS.mega + CARGAS.ihm + CARGAS.sdRtc +
          CARGAS.logicaBts + CARGAS.ledsMaquete;
    // ⭐ os módulos só consomem com o relé ATRACADO
    if (f.habPotencia) i5 += CARGAS.moduloReleCada;   // KA1
    if (f.ventRadiador) i5 += CARGAS.moduloReleCada;  // KA2
    /* ⭐ KA3 — as 5 ventoinhas internas. Ele entrou no lugar do módulo
       MOSFET (MV-1), que gastava ~10 mA de LED de optoacoplador contra os
       65 mA de bobina deste. É o preço da troca, e ele cabe: o T2 fecha em
       0,635 A, 42 % do limite seguro do LM2596. Doc 31 §31.16. */
    if (f.ventInternas) i5 += CARGAS.moduloReleCada;  // KA3
    /* ⭐ OS SINALEIROS MIGRARAM PARA CÁ. Eram de 24 V no BD-24V, acionados
       pelo ULN2803; hoje são de 5 V e cada um sai de um pino do Mega —
       então quem paga a conta é o ramal de 5 V, e o pino é o limite
       (20 mA cada, 80 mA com os quatro acesos). */
    i5 += sinaleirosAcesos(sim) * CARGAS.sinaleiroCada;
  }

  // ── BD-24V (serviços permanentes) ────────────────────────────────
  let i24srv = 0;
  if (geral) {
    i24srv += CARGAS.esp32;
    i24srv += CARGAS.n4aic24;     // o instrumento nunca desliga
    if (sim.eletrica.km1Selado) i24srv += CARGAS.bobinaRele;
  }

  // ── O que a fonte de 24 V enxerga ────────────────────────────────
  //   Cada conversor puxa a POTÊNCIA da saída dividida pelo rendimento.
  const i24de5 = (i5 * 5.0) / RENDIMENTO.v5 / 24;
  const i24de12 = ((i12 + iPtc) * 12) / RENDIMENTO.v12 / 24;

  return {
    'BD-POT': iPot,
    'BD-AUX': i12,
    'BD-PTC': iPtc,
    'T3-OUT': i12 + iPtc,
    'BD-5V': i5,
    'BD-24V': i24srv,
    // as correntes vistas por cada fusível, do lado de 24 V
    F1: iPot,
    F2: i24de5 + i24srv,
    F3: i24de12,
    fonte: iPot + i24de5 + i24de12 + i24srv,
    potenciaTotal: (iPot + i24de5 + i24de12 + i24srv) * 24,
  };
}

function sinaleirosAcesos(sim) {
  const f = sim.firmware;
  let n = 0;
  if ((sim.barras?.['BD-POT'] ?? 0) > 0) n++;         // H1 ENERGIZADO
  if (f.renPeltier) n++;                              // H2 RESFRIANDO
  if (f.renPtc) n++;                                  // H3 AQUECENDO
  if (f.estado === 'FALHA' || f.estado === 'EMERGENCIA') n++;  // H4
  return n;
}

/**
 * Acompanha o PIOR CASO ao longo de uma simulação inteira.
 * É isto que substitui a planilha: em vez de somar o que se imagina,
 * guarda o maior valor que realmente aconteceu.
 */
export function criarMedidor() {
  return { picos: {}, quando: {} };
}

export function medir(medidor, sim) {
  const c = consumo(sim);
  for (const [k, v] of Object.entries(c)) {
    if (!(k in medidor.picos) || v > medidor.picos[k]) {
      medidor.picos[k] = v;
      medidor.quando[k] = `${(sim.t / 1000).toFixed(0)} s · ${sim.firmware.estado}` +
        (sim.firmware.modo !== 'PARADO' ? ` · ${sim.firmware.modo}` : '');
    }
  }
  return c;
}
