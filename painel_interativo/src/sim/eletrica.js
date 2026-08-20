/**
 * SIMULADOR · CAMADA ELÉTRICA
 * ===========================
 * Um selo, os barramentos e nada mais. Aqui NÃO existe firmware:
 * este arquivo só sabe de contatos, bobinas e tensão.
 *
 * É de propósito que ele seja assim. A pergunta que o projeto inteiro
 * responde — "a emergência funciona com o software morto?" — só tem
 * valor se der para responder SEM olhar para o software. Então o
 * firmware entra aqui como uma entrada externa (o estado do KA1), do
 * mesmo jeito que um dedo entra como o estado de um botão.
 *
 * 📐 A cadeia, igual ao Doc 31 §31.2:
 *
 *   BD-24V ──[S0 · EMERG NF]──[S2 · STOP NF]──┬──[S1 · LIGAR NA]──┐
 *                                             └──── KM1 · SELO ───┤
 *                                                A1 [KM1] A2 ──[KA1]──► 0 V
 *
 * ⭐ UM SELO SÓ, E UM BOTÃO SÓ PARA REFAZÊ-LO. As duas botoeiras de
 *   parada (o cogumelo e o preto) abrem a MESMA malha, em pontos
 *   diferentes dela; as duas derrubam o mesmo selo; e o LIGAR verde
 *   refaz esse selo, venha a parada de onde vier. Destravar o cogumelo
 *   não religa nada — o selo já se perdeu, e nada o refaz sozinho.
 */

/** Estado elétrico inicial: painel energizado, nada selado. */
export function eletricaInicial() {
  return {
    km1Selado: false,   // cai na EMERGÊNCIA, no STOP e no veto do KA1
  };
}

/**
 * Resolve um passo da cadeia de comando.
 *
 * @param {object} eletrica  estado anterior (o selo)
 * @param {object} botoes    { s0Emergencia, s1Verde, s2Stop }
 *                           s0Emergencia = true quando o cogumelo está SOCADO
 *                           (o bloco NF abre) — destravá-lo é voltar a false
 * @param {object} hw        { ka1Fechado, geralLigada, km1Colado }
 * @returns novo estado elétrico
 */
export function passoEletrica(eletrica, botoes, hw) {
  const { s0Emergencia, s1Verde, s2Stop } = botoes;
  const { ka1Fechado, geralLigada = true } = hw;

  // Chave geral desligada: nada tem tensão, o selo morre.
  if (!geralLigada) return { km1Selado: false };

  // ── A MALHA DO SELO ──────────────────────────────────────────────
  //   Os dois blocos NF estão EM SÉRIE com a bobina, e qualquer um
  //   deles aberto derruba o selo. Fechados de novo, não refazem nada:
  //   o selo já é passado. Só o LIGAR (NA, em paralelo com o contato de
  //   selo) energiza a bobina outra vez.
  const cadeiaViva = !s0Emergencia && !s2Stop;

  //   O KA1 entra EM SÉRIE — é o veto do firmware, e em série ele só
  //   pode derrubar, jamais segurar contra uma botoeira.
  const km1Selado = cadeiaViva && ka1Fechado && (s1Verde || eletrica.km1Selado);

  return { km1Selado };
}

/**
 * Os barramentos, derivados do estado do relé.
 *
 * ⭐ Note quais NÃO dependem do KM1: o BD-24V, o BD-5V e o BD-AUX são
 *   permanentes. É o que mantém vivos o Arduino, a tela, os sinaleiros
 *   e as ventoinhas do radiador DEPOIS de alguém socar o cogumelo.
 */
export function barramentos(eletrica, hw = {}) {
  const geral = hw.geralLigada !== false;
  // 🔥 CONTATO SOLDADO É O ÚNICO DEFEITO QUE ESTE PAINEL NÃO COBRE.
  //   Quem entrega os 24 V ao BD-POT é o CONTATO 11-14 do KM1, não a
  //   bobina. Soldado, ele conduz com a bobina desenergizada — e aí nem
  //   o botão preto nem o cogumelo cortam, porque os dois agem sobre a
  //   BOBINA. Só a chave geral resolve. É por isso que o contato é
  //   declarado para ≥ 10 A em CORRENTE CONTÍNUA (Doc 31 §31.0): a
  //   especificação existe para tornar a solda improvável, já que
  //   nenhuma lógica a corrige depois.
  const contatoKm1 = eletrica.km1Selado || hw.km1Colado === true;
  return {
    'BD-24V': geral ? 24 : 0,   // permanente — comando e sinaleiros
    'BD-5V': geral ? 5.1 : 0,   // permanente — toda a eletrônica
    'BD-AUX': geral ? 12 : 0,   // permanente — ventoinhas
    'BD-POT': geral && contatoKm1 ? 24 : 0,   // ⭐ o único comutado
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
