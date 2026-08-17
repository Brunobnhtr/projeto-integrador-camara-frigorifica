/**
 * SIMULADOR · O FIRMWARE
 * ======================
 * Espelho em JavaScript da máquina de estados do Doc 40 §40.10.
 *
 * ⚠️ ESTE ARQUIVO É UMA CÓPIA, E CÓPIAS DIVERGEM. Toda função aqui tem
 *   o mesmo nome da função C++ correspondente, de propósito: quando o
 *   `.ino` mudar, o diff aqui tem de ser óbvio. Se um dia os dois
 *   discordarem, **o C++ é a verdade** — este é o modelo.
 *
 * O que ele NÃO faz: PID de verdade, temporização em microssegundos,
 * leitura de I²C. O que ele faz: exatamente as decisões que decidem se
 * o painel liga, para, retém ou trava — que é o que precisamos provar.
 */

export const ESTADO = {
  BOOT: 'BOOT',
  AGUARDA_START: 'AGUARDA_START',
  RODANDO: 'RODANDO',
  EMERGENCIA: 'EMERGENCIA',
  FALHA: 'FALHA',
};

export const MODO = {
  PARADO: 'PARADO',
  RESFRIAMENTO: 'RESFRIAMENTO',
  AQUECIMENTO: 'AQUECIMENTO',
  DEGELO: 'DEGELO',
};

// ── PARÂMETROS — os mesmos números do Doc 40 §40.3 ──────────────────
export const RPM_MINIMA = 400;
export const TEMPO_PARTIDA_FAN = 5000;    // ms — a fan tem de acelerar
export const MARGEM_AMBIENTE = 5.0;       // °C acima da ambiente
export const DUTY_MAXIMO = 95;            // %

// ⭐ FAIXA DE TRABALHO em vez de ponto. O operador pede "entre 10 e 12",
//   não "10,0". Dentro da faixa o controle relaxa — é o que impede o
//   sistema de caçar um número que ele nunca alcança exatamente.
export const FAIXA_PADRAO = { min: 4, max: 6 };

// ⭐ O LIMITADOR TÉRMICO — a peça que faltava.
//   A Peltier bombeia Qc = Qc_max·duty·(1 − ΔT/ΔT_max). Quanto mais duty,
//   mais calor no dissipador; quanto mais quente o dissipador, MENOS ela
//   bombeia. Passado um ponto, mais duty dá MENOS frio.
//   Medido no simulador, com a câmara a 5 °C e ambiente a 25 °C:
//        100 % → 11,0 W de frio, dissipador a 63,7 °C
//         60 % → 19,5 W de frio, dissipador a 51,5 °C   ⭐ 77 % MAIS FRIO
//   Então o duty não é limitado por corrente: é limitado pela
//   TEMPERATURA DO DISSIPADOR, que o DS18B20 já mede.
export const DISSIPADOR_ALVO = 52;        // °C — onde o Qc é máximo
export const DISSIPADOR_TETO = 62;        // °C — aqui o duty já caiu ao mínimo
export const DUTY_MINIMO_LIM = 35;        // % — o piso do limitador

// Quando desistir de alcançar a faixa
export const AVAL_MS = 5 * 60 * 1000;     // 5 min observando
export const MELHORA_MINIMA = 0.4;        // °C de ganho para valer a pena

export function firmwareInicial() {
  return {
    vivo: true,                 // false = Arduino morto/removido
    estado: ESTADO.BOOT,
    modo: MODO.PARADO,
    alerta: '',
    // saídas — todas nascem em nível baixo, e os pull-downs garantem
    // que "Arduino ausente" produza exatamente este mesmo quadro
    habPotencia: false,         // D27 → KA3
    ventRadiador: true,         // D30 → KA4 · ⭐ nasce LIGADA, ver setup()
    ventInternas: false,        // D29 → MV-1 canal 3
    renPeltier: false,          // D4
    renPtc: false,              // D7
    duty: 0,
    // pedidos vindos da IHM ou do MQTT
    pedidoStart: false,
    pedidoStop: false,
    // memória interna
    tEmModo: 0,
    integral: 0,                // ⭐ o termo que mata o erro em regime
    dutyTeto: DUTY_MAXIMO,      // teto imposto pelo limitador térmico
    inalcancavel: false,        // o firmware desistiu da faixa?
    melhorT: null,              // melhor temperatura já atingida
    tAval: 0,                   // quando a janela de avaliação começou
    tAvalRef: null,
    zona: 'PRONTO',
    dissipadorQuente: true,     // "não sei" vale como "pode estar quente"
    radiadorLigado: true,
  };
}

/** ⚡ Corte FÍSICO e RETENTIVO: derruba o KA3 → o selo do KA2 se perde. */
function cortarPotencia(f) { f.habPotencia = false; }

/** AUTORIZA — não arma. Depois disto ainda falta o dedo no botão verde. */
function autorizarPotencia(f) { f.habPotencia = true; }

function desabilitarDrivers(f) {
  f.renPeltier = false; f.renPtc = false; f.duty = 0;
}

function desligarTudo(f) {
  desabilitarDrivers(f);
  f.ventInternas = false;   // ⭐ as 5 internas param junto com o ensaio
  f.modo = MODO.PARADO;
  // ⚠ ventRadiador NÃO entra aqui: quem a desliga é gerenciarVentoinhas(),
  //   e só quando o DS18B20 disser que o dissipador esfriou.
}

function dispararTrip(f, motivo) {
  desabilitarDrivers(f);
  f.integral = 0;
  cortarPotencia(f);          // ⚡ e derruba o selo do KA2: retentivo
  desligarTudo(f);
  f.alerta = motivo;
  f.estado = ESTADO.FALHA;
}

/** Parada Categoria 2: a potência SEGUE ARMADA e a IHM religa. */
function pararProcesso(f) {
  desabilitarDrivers(f);
  f.integral = 0;             // equivale ao meuPID.SetMode(MANUAL)
  // ⭐ NÃO chama cortarPotencia(). Quem derruba o selo é o botão preto
  //    (em hardware) ou um trip. Ver Doc 31 §31.0.
  desligarTudo(f);
  f.pedidoStop = false;
  f.estado = ESTADO.AGUARDA_START;
}

/**
 * 🌀 As ventoinhas. Chamada em TODO passo, em QUALQUER estado —
 *    inclusive EMERGENCIA. A pós-ventilação do radiador não pode viver
 *    dentro do `if (estado == RODANDO)`.
 */
function gerenciarVentoinhas(f, ent) {
  // ⚠ SENSOR COM DEFEITO CONTA COMO QUENTE. O DS18B20 devolve −127 °C
  //   quando o fio se solta, e −127 é "frio" para qualquer comparação.
  const sensorOK = ent.tDissipador > -100 && ent.tDissipador < 150;
  f.dissipadorQuente = !sensorOK ||
    ent.tDissipador > ent.tAmbiente + MARGEM_AMBIENTE;

  const peltierAtiva = f.estado === ESTADO.RODANDO &&
    f.modo === MODO.RESFRIAMENTO;
  f.radiadorLigado = peltierAtiva || f.dissipadorQuente;
  f.ventRadiador = f.radiadorLigado;

  f.ventInternas = f.estado === ESTADO.RODANDO;
}

/** Um passo da máquina de estados. `ent` são os pinos de entrada. */
export function passoFirmware(f, ent, dt = 50) {
  // ── Arduino morto: os pinos viram entrada e os pull-downs mandam ──
  if (!f.vivo) {
    f.habPotencia = false;    // KA3 abre → a potência cai e NÃO volta
    f.ventRadiador = false;   // KA4 abre
    f.ventInternas = false;
    f.renPeltier = false; f.renPtc = false; f.duty = 0;
    return f;
  }

  f.tEmModo += dt;
  gerenciarVentoinhas(f, ent);

  // EMERGÊNCIA tem prioridade absoluta, em qualquer estado
  if (ent.emergencia && f.estado !== ESTADO.EMERGENCIA) {
    desabilitarDrivers(f);
    cortarPotencia(f);        // redundante (o KA1 já caiu) — e é de propósito
    desligarTudo(f);
    f.alerta = 'EMERGENCIA';
    f.estado = ESTADO.EMERGENCIA;
    return f;
  }

  switch (f.estado) {
    case ESTADO.BOOT:
      autorizarPotencia(f);   // ⭐ "estou saudável" — o verde já pode armar
      f.estado = ESTADO.AGUARDA_START;
      break;

    case ESTADO.AGUARDA_START:
      // ⭐ INICIAR vem da IHM. O botão verde não é lido por pino nenhum:
      //   ele arma a potência em hardware e o firmware vê pelo D25.
      if (f.pedidoStart) {
        f.pedidoStart = false;
        if (!ent.potenciaDisponivel) { f.alerta = 'APERTE_O_VERDE'; break; }
        f.alerta = '';
        f.modo = MODO.PARADO;
        f.tEmModo = 0;
        f.estado = ESTADO.RODANDO;
      }
      break;

    case ESTADO.RODANDO:
      // ⚠ O STOP vem PRIMEIRO. A queda de potência que o botão preto
      //   causa não é defeito — e o teste de potência, se viesse antes,
      //   classificaria toda parada normal como FALHA.
      if (ent.stop || f.pedidoStop) { pararProcesso(f); break; }

      if (!ent.potenciaDisponivel) { dispararTrip(f, 'POTENCIA_PERDIDA'); break; }

      // Proteção de RPM — só arma quando a Peltier já teve tempo de partir
      if (f.radiadorLigado && f.modo === MODO.RESFRIAMENTO &&
          f.tEmModo > TEMPO_PARTIDA_FAN) {
        if (ent.rpm1 < RPM_MINIMA) { dispararTrip(f, 'FAN1_PARADA'); break; }
        if (ent.rpm2 < RPM_MINIMA) { dispararTrip(f, 'FAN2_PARADA'); break; }
      }

      controlar(f, ent, dt);
      break;

    case ESTADO.EMERGENCIA:
      if (!ent.emergencia) {              // cogumelo destravado
        f.alerta = '';
        f.pedidoStart = false;            // descarta START pendente
        autorizarPotencia(f);
        f.estado = ESTADO.AGUARDA_START;  // ⚠ NÃO religa sozinho
      }
      break;

    case ESTADO.FALHA:
      // Só sai por reconhecimento: STOP segurado, ou ACK pela IHM/MQTT
      if (ent.stop || f.pedidoStop) {
        f.pedidoStop = false;
        f.alerta = '';
        autorizarPotencia(f);
        f.estado = ESTADO.AGUARDA_START;
      }
      break;
  }
  return f;
}

/**
 * Controle térmico — faixa, PI e limitador de dissipador.
 *
 * ⭐ TRÊS IDEIAS, E A SEGUNDA É A QUE VOCÊ NÃO ESPERAVA:
 *
 *   1. FAIXA, não ponto. O operador pede "entre 10 e 12 °C". Dentro da
 *      faixa o erro é ZERO e o controle relaxa. Some a caça ao número.
 *
 *   2. O DUTY É LIMITADO PELA TEMPERATURA DO DISSIPADOR, não pela
 *      corrente. Numa Peltier, passar do ponto ótimo dá MENOS frio —
 *      medido: 100 % rende 11,0 W e 60 % rende 19,5 W. Um ar-condicionado
 *      que "não chega na temperatura e fica ligado direto" é exatamente
 *      isto acontecendo. A saída não é insistir: é recuar.
 *
 *   3. DESISTIR COM HONESTIDADE. Se em 5 minutos no teto o ganho for
 *      menor que 0,4 °C, o setpoint é inalcançável naquele ambiente.
 *      O firmware para de forçar, estabiliza no melhor ponto real e
 *      AVISA na tela — em vez de fingir que ainda está indo.
 */
const KP = 20;    // % de duty por °C de erro
const KI = 0.6;   // % de duty por °C por segundo

/**
 * ⭐ AS TRÊS ZONAS. É isto que substitui o setpoint de ponto único.
 *
 *      T > faixa.max     URGENTE   esfria com o teto cheio
 *      dentro da faixa   AJUSTE    esfria devagar, buscando a MÍNIMA
 *      T <= faixa.min    PRONTO    desliga e deixa subir
 *
 *   O operador pede "entre 10 e 12". O sistema trabalha para os 10, mas
 *   **os 12 já contam como sucesso** — e é essa segunda parte que impede
 *   a máquina de ficar armada perseguindo um número exato, que é o que
 *   um ar-condicionado mal ajustado faz.
 */
const HISTERESE = 0.4;   // °C — impede o liga-desliga picotado na mínima

function zona(t, faixa, estavaParado) {
  if (t > faixa.max) return 'URGENTE';
  // histerese: só volta a trabalhar depois de subir 0,4 °C acima da mínima
  if (estavaParado && t < faixa.min + HISTERESE) return 'PRONTO';
  if (t <= faixa.min) return 'PRONTO';
  return 'AJUSTE';
}

/**
 * ⭐ O limitador térmico. Desce o teto de duty conforme o dissipador
 *   esquenta — e como o Qc cai com o ΔT, recuar aqui ENTREGA MAIS FRIO.
 */
function tetoPorDissipador(tDissipador) {
  if (tDissipador <= DISSIPADOR_ALVO) return DUTY_MAXIMO;
  if (tDissipador >= DISSIPADOR_TETO) return DUTY_MINIMO_LIM;
  const f = (tDissipador - DISSIPADOR_ALVO) / (DISSIPADOR_TETO - DISSIPADOR_ALVO);
  return DUTY_MAXIMO - f * (DUTY_MAXIMO - DUTY_MINIMO_LIM);
}

function controlar(f, ent, dt) {
  const faixa = ent.faixa ?? FAIXA_PADRAO;
  const inverso = faixa.min > 25;                 // faixa quente: PTC manda
  const z = zona(ent.tCamara, faixa, f.modo === MODO.PARADO);
  f.zona = z;

  // ── PRONTO: chegou onde queria. Desliga e deixa a inércia trabalhar ──
  if ((z === 'PRONTO' && !inverso) || (inverso && ent.tCamara >= faixa.max)) {
    if (f.modo !== MODO.PARADO) { f.modo = MODO.PARADO; f.tEmModo = 0; }
    f.renPeltier = false; f.renPtc = false; f.duty = 0;
    f.integral *= 0.98;
    f.inalcancavel = false;
    f.tAvalRef = null;
    return;
  }

  // ── Quem trabalha, e com que urgência ─────────────────────────────
  const aquecer = inverso ? ent.tCamara < faixa.min
                          : ent.tCamara < faixa.min - HISTERESE;
  const alvo = aquecer ? faixa.max : faixa.min;   // sempre mira a borda oposta
  const erro = alvo - ent.tCamara;

  // ⭐ O TETO. Cheio na urgência; na faixa, metade — não há pressa, e
  //   duty menor mantém o dissipador frio, o que dá MAIS Qc.
  const tetoTermico = aquecer ? DUTY_MAXIMO : tetoPorDissipador(ent.tDissipador);
  const lim = z === 'AJUSTE' ? Math.min(tetoTermico, 55) : tetoTermico;
  f.dutyTeto = lim;

  const bruto = KP * erro + f.integral;
  const saida = Math.max(-lim, Math.min(lim, bruto));
  if (saida === bruto) f.integral += KI * erro * (dt / 1000);

  // ── ⭐ AINDA ESTÁ INDO A ALGUM LUGAR? ─────────────────────────────
  //   Só avalia na zona URGENTE: dentro da faixa não há o que alcançar.
  if (z === 'URGENTE' && Math.abs(saida) >= lim - 0.5) {
    if (f.tAvalRef === null) { f.tAvalRef = ent.tCamara; f.tAval = f.tEmModo; }
    else if (f.tEmModo - f.tAval > AVAL_MS) {
      const ganho = Math.abs(f.tAvalRef - ent.tCamara);
      f.inalcancavel = ganho < MELHORA_MINIMA;
      f.tAvalRef = ent.tCamara; f.tAval = f.tEmModo;
    }
  } else { f.tAvalRef = null; if (z !== 'URGENTE') f.inalcancavel = false; }

  // ⭐ Desistiu: recua para o ponto de MAIOR Qc em vez de forçar o teto.
  //   Não é falha, é o ambiente — e forçar daria menos frio, não mais.
  f.duty = f.inalcancavel ? Math.min(Math.abs(saida), DUTY_SUSTENTACAO)
                          : Math.abs(saida);

  const novoModo = aquecer ? MODO.AQUECIMENTO : MODO.RESFRIAMENTO;
  if (novoModo !== f.modo) { f.modo = novoModo; f.tEmModo = 0; }

  // ⚠ A ORDEM É A GARANTIA DO INTERTRAVAMENTO: o driver que vai
  //   desligar é desabilitado ANTES de o outro ser habilitado.
  if (f.modo === MODO.RESFRIAMENTO) { f.renPtc = false; f.renPeltier = true; }
  else { f.renPeltier = false; f.renPtc = true; }
}

/** ⭐ Duty de sustentação quando o alvo é inalcançável — o ponto de MAIOR Qc
    medido no simulador (19,5 W a 60 %, contra 11,0 W a 100 %). */
const DUTY_SUSTENTACAO = 60;
