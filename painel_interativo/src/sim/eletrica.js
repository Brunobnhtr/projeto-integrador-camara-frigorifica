/**
 * SIMULADOR · CAMADA ELÉTRICA
 * ===========================
 * Os dois selos, os barramentos e nada mais. Aqui NÃO existe firmware:
 * este arquivo só sabe de contatos, bobinas e tensão.
 *
 * É de propósito que ele seja assim. A pergunta que o projeto inteiro
 * responde — "a emergência funciona com o software morto?" — só tem
 * valor se der para responder SEM olhar para o software. Então o
 * firmware entra aqui como uma entrada externa (o estado do KA3), do
 * mesmo jeito que um dedo entra como o estado de um botão.
 *
 * 📐 A cadeia, igual ao Doc 31 §31.2:
 *
 *   BD-24V ──[S0 · EMERG NF]──┬──[S3 · REARME NA]──┐
 *                             └──── KA1 · SELO ────┤
 *                                        A1 [KA1] A2 ──► 0 V
 *          │ KA1 · contato de saída
 *          ▼
 *   ──[S2 · STOP NF]──┬──[S1 · START NA]──┐
 *                     └──── KA2 · SELO ───┤
 *                              A1 [KA2] A2 ──[KA3]──► 0 V
 */

/** Estado elétrico inicial: painel energizado, nada selado. */
export function eletricaInicial() {
  return {
    ka1Selado: false,   // cai na EMERGÊNCIA, refeito pelo REARME azul
    ka2Selado: false,   // cai no STOP, refeito pelo START verde
  };
}

/**
 * Resolve um passo da cadeia de comando.
 *
 * @param {object} eletrica  estado anterior (os dois selos)
 * @param {object} botoes    { s0Emergencia, s1Verde, s2Stop, s3Rearme }
 *                           s0Emergencia = true quando o cogumelo está SOCADO
 *                           (o bloco NF abre) — destravá-lo é voltar a false
 * @param {object} hw        { ka3Fechado, geralLigada, ka2Colado }
 * @returns novo estado elétrico
 */
export function passoEletrica(eletrica, botoes, hw) {
  const { s0Emergencia, s1Verde, s2Stop, s3Rearme } = botoes;
  const { ka3Fechado, geralLigada = true } = hw;

  // Chave geral desligada: nada tem tensão, os dois selos morrem.
  if (!geralLigada) return { ka1Selado: false, ka2Selado: false };

  // ── ESTÁGIO 1 · o selo do KA1 ────────────────────────────────────
  //   O bloco NF do cogumelo está EM SÉRIE com a bobina. Socado, ele
  //   abre e o selo se perde. Destravar não refaz nada: o selo já é
  //   passado. Só o REARME (NA, em paralelo com o contato de selo)
  //   energiza a bobina de novo.
  const cadeiaViva = !s0Emergencia;
  const ka1Selado = cadeiaViva && (s3Rearme || eletrica.ka1Selado);

  // ── ESTÁGIO 2 · o selo do KA2 ────────────────────────────────────
  //   Mesmo circuito, outros nomes: o S2 (NF) faz o papel do cogumelo
  //   e o S1 verde faz o papel do rearme. O KA3 entra EM SÉRIE — é o
  //   veto do firmware, e em série ele só pode derrubar.
  const noDoSelo = ka1Selado && !s2Stop;
  const ka2Selado = noDoSelo && ka3Fechado && (s1Verde || eletrica.ka2Selado);

  return { ka1Selado, ka2Selado };
}

/**
 * Os barramentos, derivados do estado dos relés.
 *
 * ⭐ Note quais NÃO dependem do KA2: o BD-24V, o BD-5V e o BD-AUX são
 *   permanentes. É o que mantém vivos o Arduino, a tela, os sinaleiros
 *   e as ventoinhas do radiador DEPOIS de alguém socar o cogumelo.
 */
export function barramentos(eletrica, hw = {}) {
  const geral = hw.geralLigada !== false;
  // 🔥 CONTATO SOLDADO É O ÚNICO DEFEITO QUE ESTE PAINEL NÃO COBRE.
  //   Quem entrega os 24 V ao BD-POT é o CONTATO 11-14 do KA2, não a
  //   bobina. Soldado, ele conduz com a bobina desenergizada — e aí nem
  //   o botão preto nem o cogumelo cortam, porque os dois agem sobre a
  //   BOBINA. Só a chave geral resolve. É por isso que o contato é
  //   declarado para ≥ 10 A em CORRENTE CONTÍNUA (Doc 31 §31.0): a
  //   especificação existe para tornar a solda improvável, já que
  //   nenhuma lógica a corrige depois.
  const contatoKa2 = eletrica.ka2Selado || hw.ka2Colado === true;
  return {
    'BD-24V': geral ? 24 : 0,   // permanente — comando e sinaleiros
    'BD-5V': geral ? 5.1 : 0,   // permanente — toda a eletrônica
    'BD-AUX': geral ? 12 : 0,   // permanente — ventoinhas
    'BD-POT': geral && contatoKa2 ? 24 : 0,   // ⭐ o único comutado
  };
}

/**
 * O que o divisor 22 k / 4,7 k entrega ao pino D25.
 * É por AQUI que o firmware descobre se a potência chegou — ele nunca
 * lê um contato auxiliar de relé. Ver Doc 31 §31.6.
 */
export function tensaoD25(barras) {
  return barras['BD-POT'] * (4.7 / (22 + 4.7));   // 24 V → 4,22 V
}
