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
 * Números: Doc 02 §2.4 (tabelas dos ramais R1, R2 e R3).
 */

/** Correntes nominais, em ampères, na tensão do próprio barramento. */
export const CARGAS = {
  // ── BD-POT · 24 V comutado (morre na emergência) ─────────────────
  peltier: 6.0,          // 2 pastilhas TEC1-12706 em série, a 100 %
  ptc: 3.3,              // PTC cerâmico 24 V / 80 W

  // ── BD-AUX · 12 V permanente ─────────────────────────────────────
  radiadorCada: 0.25,    // 80 mm, 3 fios — são 2
  internaCada: 0.125,    // ⭐ são CINCO: 2 frias + 2 dos dutos + a do PTC
  coolerBts: 0.12,       // 40 mm, sem comando — sempre ligado

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
};

/** Rendimento dos LM2596 — Doc 02 §2.5. */
const RENDIMENTO = { v5: 0.78, v12: 0.88 };

/** Limites de projeto, para o simulador poder reprovar sozinho. */
export const LIMITES = {
  fonte24: 10.0,      // A — fonte S-240-24
  F1: 10.0,           // A — ramal de potência
  F2: 2.0,            // A — ramal de comando (5 V + serviços de 24 V)
  F3: 2.0,            // A — ramal auxiliar (12 V)
  caboT2: 0.7,        // A — 0,50 mm² declarado no Doc 02 §2.7
  caboT3: 1.6,        // A — 0,75 mm² declarado no Doc 02 §2.7
  lm2596Seguro: 1.5,  // A — contínuo com dissipador colado
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
  const ha5v = (sim.barras?.['BD-5V'] ?? 0) > 0;

  // ── BD-POT ───────────────────────────────────────────────────────
  //   ⚠ O BTS em curto puxa os 6 A cheios ignorando o duty. É o pior
  //     caso de corrente do projeto, e ele NÃO aparece numa planilha
  //     de consumo — só num modelo que conheça o modo de falha.
  let iPot = 0;
  if (haPotencia) {
    if (sim.falhas.btsPeltierEmCurto) iPot += CARGAS.peltier;
    else if (f.renPeltier) iPot += CARGAS.peltier * f.duty / 100;
    if (f.renPtc) iPot += CARGAS.ptc * f.duty / 100;
  }

  // ── BD-AUX (12 V) ────────────────────────────────────────────────
  let i12 = 0;
  if (haAux) {
    // ⭐ quem gasta é o CONTATO do KA2, não a ordem do firmware
    const contatoKa2 = sim.falhas.ka2Colado ? true
      : sim.falhas.ka2Aberto ? false
      : f.ventRadiador;
    if (contatoKa2) i12 += 2 * CARGAS.radiadorCada;
    if (f.ventInternas) i12 += 5 * CARGAS.internaCada;
    i12 += CARGAS.coolerBts;      // sem comando: enquanto houver 12 V
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
    if (sim.eletrica.km1Selado) i24srv += CARGAS.bobinaRele;
  }

  // ── O que a fonte de 24 V enxerga ────────────────────────────────
  //   Cada conversor puxa a POTÊNCIA da saída dividida pelo rendimento.
  const i24de5 = (i5 * 5.1) / RENDIMENTO.v5 / 24;
  const i24de12 = (i12 * 12) / RENDIMENTO.v12 / 24;

  return {
    'BD-POT': iPot,
    'BD-AUX': i12,
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
