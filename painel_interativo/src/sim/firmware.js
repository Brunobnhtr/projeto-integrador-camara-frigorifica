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
export const BANDA_MORTA = 0.6;           // °C
export const DUTY_MAXIMO = 95;            // %

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
 * Controle térmico — P + I, igual ao Doc 40 §40.6.
 *
 * ⭐ O TERMO INTEGRAL NÃO É ENFEITE, e este simulador provou isso: com
 *   proporcional puro a câmara estabilizava em 8,2 °C com setpoint de
 *   5 °C. Não era defeito do modelo térmico — é a definição de um
 *   controlador P: ele precisa de erro para gerar saída, então o erro
 *   nunca chega a zero. O integral acumula o que falta e fecha a conta.
 */
const KP = 20;    // % de duty por °C de erro
const KI = 0.6;   // % de duty por °C por segundo

function controlar(f, ent, dt) {
  const erro = ent.setpoint - ent.tCamara;   // + = falta calor

  if (Math.abs(erro) < BANDA_MORTA) {
    if (f.modo !== MODO.PARADO) { f.modo = MODO.PARADO; f.tEmModo = 0; }
    f.renPeltier = false; f.renPtc = false; f.duty = 0;
    return;
  }

  const bruto = KP * erro + f.integral;
  const saida = Math.max(-DUTY_MAXIMO, Math.min(DUTY_MAXIMO, bruto));
  // anti-windup: só acumula quando a saída NÃO está saturada
  if (saida === bruto) f.integral += KI * erro * (dt / 1000);

  const novoModo = saida > 0 ? MODO.AQUECIMENTO : MODO.RESFRIAMENTO;
  if (novoModo !== f.modo) { f.modo = novoModo; f.tEmModo = 0; }
  f.duty = Math.abs(saida);

  // ⚠ A ORDEM É A GARANTIA DO INTERTRAVAMENTO: o driver que vai
  //   desligar é desabilitado ANTES de o outro ser habilitado. Invertida,
  //   existiria uma janela com os dois ativos ao mesmo tempo.
  if (f.modo === MODO.RESFRIAMENTO) { f.renPtc = false; f.renPeltier = true; }
  else { f.renPeltier = false; f.renPtc = true; }
}
