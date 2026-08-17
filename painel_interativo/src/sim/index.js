/**
 * SIMULADOR · O LAÇO
 * ==================
 * Junta a camada elétrica, o firmware e um modelo térmico simples, e
 * faz o tempo andar.
 *
 * ⭐ A ORDEM DE CADA PASSO É A PARTE QUE IMPORTA, e ela imita a
 *   realidade de propósito:
 *
 *     1. a cadeia elétrica resolve com as saídas do passo ANTERIOR
 *        (um relé leva ~10 ms para desatracar; o firmware não vê o
 *         efeito da própria ordem no mesmo instante)
 *     2. o firmware lê os pinos
 *     3. o firmware decide e escreve as saídas — que valem no próximo
 *
 *   Foi exatamente esse atraso de um passo que produziu o bug real do
 *   Doc 40 §40.10: apertar o STOP disparava as DUAS condições, e a
 *   ordem dos testes decidia se a parada virava FALHA.
 */

import { eletricaInicial, passoEletrica, barramentos, tensaoD25 } from './eletrica.js';
import { firmwareInicial, passoFirmware, ESTADO, MODO, RPM_MINIMA,
         FASE, RECEITA_PADRAO } from './firmware.js';

export { ESTADO, MODO, FASE, RECEITA_PADRAO };

/** Constantes térmicas — grandes o bastante para o comportamento ser real. */
const TERMICO = {
  C_CAMARA: 1800,       // J/K — ar + massa interna
  C_DISSIPADOR: 450,    // J/K — o bloco de alumínio do lado quente
  UA_CAMARA: 0.555,     // W/K — fita de alumínio direto no acrílico + porta dupla
  UA_DISSIP_COM_FAN: 4.0,   // W/K
  UA_DISSIP_SEM_FAN: 0.8,   // W/K — convecção natural
  // ⭐ A PELTIER NÃO BOMBEIA UMA POTÊNCIA FIXA — ela depende do ΔT que
  //   ela própria está sustentando, e é ISSO que faz um sistema Peltier
  //   se comportar diferente de um compressor:
  //
  //        Qc = Qc_max · duty · (1 − ΔT / ΔT_max)
  //
  //   Quanto mais quente o dissipador, MENOS ela consegue bombear. E o
  //   dissipador esquenta porque ela está trabalhando. É realimentação
  //   positiva no sentido errado — a razão pela qual "botar mais duty"
  //   pode dar MENOS frio. Ver §12.7 do Doc 12 e o cenário 27.
  QC_MAX: 114,          // W a ΔT = 0 (2× TEC1-12706 em série)
  DT_MAX: 65,           // K — ΔT máximo teórico, com Qc = 0
  P_ELETRICA: 144,      // W consumidos a 100 % de duty (24 V × 6,0 A)
  P_PTC: 80,            // W
  FUGA_PELTIER_OFF: 0.5, // W/K — o calor volta ATRAVÉS da pastilha desligada
};

/** ⭐ Quanto silêncio conta como "o Mega morreu". Três segundos: o JSON
 *  vem a 1 Hz, então isso tolera duas perdas antes de acusar. Curto
 *  demais dá alarme falso a cada travadinha da serial; longo demais e a
 *  tela mente por meio minuto. */
export const TIMEOUT_MEGA_MS = 3000;

export function criarSimulador(opts = {}) {
  return {
    t: 0,                                   // ms desde o boot
    tAmbiente: opts.tAmbiente ?? 25,
    // ⭐ O alvo é uma FAIXA, não um ponto. `setpoint` continua aceito e
    //   vira uma faixa de ±1 °C em volta dele, para não quebrar chamadas
    //   antigas — mas a IHM trabalha com min e max.
    faixa: opts.faixa ?? { min: (opts.setpoint ?? 5) - 1, max: (opts.setpoint ?? 5) + 1 },
    receita: opts.receita ?? null,   // null = faixa fixa, sem ciclo
    tCamara: opts.tCamara ?? 25,
    tDissipador: opts.tDissipador ?? 25,
    uaCamara: opts.uaCamara ?? TERMICO.UA_CAMARA,   // W/K — permite comparar isolamentos
    qcPeltier: 0,                                   // W bombeados agora
    // ⭐ VIGILÂNCIA MÚTUA — os dois ESP32 escutam o Mega e acusam a
    //   ausência dele. Nenhum deles ATUA: quem corta a potência quando
    //   o Mega morre já é o pull-down no gate do KA3, em hardware.
    //   O papel dos ESP é CONTAR, e é por isso que a vigilância não
    //   enfraquece a segurança: ninguém novo ganhou poder sobre nada.
    ultimoJson: 0,          // ms — quando o Mega falou pela última vez
    ihmOnline: true,        // o ESP32-S3 da porta está respondendo?
    iotOnline: true,        // o DNLCB30 está respondendo?
    megaSumido: false,      // ⭐ os ESP concluíram que o Mega morreu
    // ⭐ Caracterização: trava o duty num valor e ignora o controlador.
    //   Serve para levantar a curva Qc × duty, que é o que prova que
    //   "mais duty" nem sempre é "mais frio". null = controle normal.
    dutyForcado: opts.dutyForcado ?? null,
    tCamaraFixa: opts.tCamaraFixa ?? null,   // segura a câmara p/ medir o regime
    botoes: { s0Emergencia: false, s1Verde: false, s2Stop: false, s3Rearme: false },
    falhas: {
      arduinoMorto: false,     // chip queimado ou removido
      btsPeltierEmCurto: false, // MOSFET colado: conduz ignorando o R_EN
      ds18Solto: false,        // sensor fora do barramento → −127 °C
      fanTravada: false,       // RPM = 0 com a ventoinha comandada
      ka3Colado: false,        // contato do módulo de relé soldado fechado
      ka2Colado: false,        // contato de potência do KA2 soldado
      geralDesligada: false,   // alguém cortou a chave geral
    },
    eletrica: eletricaInicial(),
    firmware: firmwareInicial(),
  };
}

/** Um passo de `dt` milissegundos. */
export function passo(sim, dt = 50) {
  const f = sim.firmware;

  // ── 1. A CADEIA ELÉTRICA, com as saídas do passo anterior ────────
  sim.eletrica = passoEletrica(sim.eletrica, sim.botoes, {
    ka3Fechado: sim.falhas.ka3Colado || f.habPotencia,
    geralLigada: !sim.falhas.geralDesligada,
    ka2Colado: sim.falhas.ka2Colado,
  });
  const barras = barramentos(sim.eletrica, {
    geralLigada: !sim.falhas.geralDesligada,
    ka2Colado: sim.falhas.ka2Colado,
  });

  // ── 2. OS PINOS DE ENTRADA ───────────────────────────────────────
  //   ⭐ Repare que NÃO existe entrada vinda dos relés. O firmware não
  //     pergunta "o KA2 fechou?"; ele mede se os 24 V chegaram.
  const radiadorGirando = (sim.falhas.ka3Colado || f.ventRadiador) &&
    barras['BD-AUX'] > 0 && !sim.falhas.fanTravada;
  const entradas = {
    stop: sim.botoes.s2Stop,                         // D23 · bloco NA de 5 V
    emergencia: sim.botoes.s0Emergencia,             // D24 · bloco NF de 5 V
    potenciaDisponivel: tensaoD25(barras) > 2.5,     // D25 · divisor 22k/4k7
    tDissipador: sim.falhas.ds18Solto ? -127 : sim.tDissipador,
    tAmbiente: sim.tAmbiente,
    tCamara: sim.tCamara,
    faixa: sim.faixa,
    receita: sim.receita,   // null = faixa fixa, sem ciclo
    rpm1: radiadorGirando ? 1850 : 0,
    rpm2: radiadorGirando ? 1820 : 0,
  };

  // ── 3. O FIRMWARE DECIDE ─────────────────────────────────────────
  const vivoAgora = !sim.falhas.arduinoMorto && barras['BD-5V'] > 0;
  // ⭐ NÃO EXISTE "pausar e continuar" para um microcontrolador. Ele
  //   morre e RENASCE — pelo watchdog ou por alguém religando o painel.
  //   Voltar direto ao estado anterior seria um modelo mentiroso, e foi
  //   o que fez o cenário 12 falhar na primeira execução.
  if (vivoAgora && !f.vivo) Object.assign(f, firmwareInicial());
  f.vivo = vivoAgora;
  passoFirmware(f, entradas, dt);

  // ── 3b. A VIGILÂNCIA MÚTUA ───────────────────────────────────────
  //   O Mega publica um JSON por segundo nas duas seriais. Os ESP não
  //   precisam de fio novo nem de pino: basta CRONOMETRAR o silêncio.
  if (f.vivo) sim.ultimoJson = sim.t;
  const silencio = sim.t - sim.ultimoJson;
  sim.megaSumido = silencio > TIMEOUT_MEGA_MS && barras['BD-5V'] > 0;

  // ── 4. O MUNDO FÍSICO RESPONDE ───────────────────────────────────
  termico(sim, barras, dt);
  sim.t += dt;
  sim.barras = barras;
  sim.entradas = entradas;
  return sim;
}

/** Modelo térmico de 2 massas: a câmara e o dissipador do lado quente. */
function termico(sim, barras, dt) {
  const f = sim.firmware;
  const s = dt / 1000;
  const haPotencia = barras['BD-POT'] > 0;

  // caracterização: trava o duty antes de qualquer decisão deste passo
  if (sim.dutyForcado !== null) {
    f.duty = sim.dutyForcado; f.renPeltier = true; f.renPtc = false;
  }

  // ⚠ O BTS em curto conduz mesmo com o R_EN baixo — é justamente o
  //   modo de falha que o KA3 existe para cobrir.
  const peltierConduz = haPotencia &&
    (sim.falhas.btsPeltierEmCurto || (f.renPeltier && f.duty > 0));
  const ptcConduz = haPotencia && f.renPtc && f.duty > 0;
  const d = (sim.falhas.btsPeltierEmCurto ? 100 : f.duty) / 100;

  // ── A Peltier, com a dependência do ΔT ───────────────────────────
  //   ⭐ É AQUI QUE O MODELO FICOU HONESTO. A versão anterior tinha um
  //     "P_PELTIER_FRIO = 40 W" fixo, e com ele mais duty SEMPRE dava
  //     mais frio — o que é falso e escondia o problema que o controle
  //     de faixa existe para resolver.
  const dtPastilha = sim.tDissipador - sim.tCamara;
  let qc = 0, qh = 0;
  if (peltierConduz) {
    const rendimento = Math.max(0, 1 - dtPastilha / TERMICO.DT_MAX);
    qc = TERMICO.QC_MAX * d * rendimento;      // bombeado para FORA da câmara
    qh = qc + TERMICO.P_ELETRICA * d;          // despejado no dissipador
  }
  sim.qcPeltier = qc;                          // exposto para a tela

  // ── Câmara ───────────────────────────────────────────────────────
  let qCamara = (sim.tAmbiente - sim.tCamara) * sim.uaCamara;
  if (peltierConduz) qCamara -= qc;
  else qCamara += (sim.tDissipador - sim.tCamara) * TERMICO.FUGA_PELTIER_OFF;
  if (ptcConduz) qCamara += TERMICO.P_PTC * f.duty / 100;
  // ⭐ As 5 ventoinhas internas: todo watt elétrico vira calor AQUI DENTRO.
  if (f.ventInternas && barras['BD-AUX'] > 0) qCamara += 6.0;
  sim.tCamara += (qCamara / TERMICO.C_CAMARA) * s;
  if (sim.tCamaraFixa !== null) sim.tCamara = sim.tCamaraFixa;

  // ── Dissipador do lado quente ────────────────────────────────────
  const ventilando = (sim.falhas.ka3Colado || f.ventRadiador) &&
    barras['BD-AUX'] > 0 && !sim.falhas.fanTravada;
  const ua = ventilando ? TERMICO.UA_DISSIP_COM_FAN : TERMICO.UA_DISSIP_SEM_FAN;
  const qDissip = (sim.tAmbiente - sim.tDissipador) * ua + qh;
  sim.tDissipador += (qDissip / TERMICO.C_DISSIPADOR) * s;
}

// ── AÇÕES DO OPERADOR ───────────────────────────────────────────────

/** Aperta e solta um botão de pulso (verde, preto, azul). */
export function apertar(sim, botao, dt = 50) {
  sim.botoes[botao] = true;
  passo(sim, dt);
  sim.botoes[botao] = false;
  passo(sim, dt);
  return sim;
}

/** O cogumelo TRAVA: ele fica socado até alguém destravar. */
export function socarCogumelo(sim) { sim.botoes.s0Emergencia = true; return passo(sim); }
export function destravarCogumelo(sim) { sim.botoes.s0Emergencia = false; return passo(sim); }

/** Comandos da IHM (na porta) e do dashboard (remoto). */
export function iniciarPelaIHM(sim) { sim.firmware.pedidoStart = true; return passo(sim); }
export function pararPelaIHM(sim) { sim.firmware.pedidoStop = true; return passo(sim); }
export function pararPeloMQTT(sim) { sim.firmware.pedidoStop = true; return passo(sim); }
/** ⛔ Existe para provar que é recusado. Ver Doc 41 §41.3. */
export function iniciarPeloMQTT(sim) { return { recusado: 'START_SO_NA_IHM', sim: passo(sim) }; }

/** Deixa o tempo correr. */
export function avancar(sim, ms, dt = 50) {
  for (let i = 0; i < Math.round(ms / dt); i++) passo(sim, dt);
  return sim;
}

/** Foto legível do sistema — é o que os testes comparam. */
export function foto(sim) {
  const f = sim.firmware;
  return {
    ka1: sim.eletrica.ka1Selado,
    ka2: sim.eletrica.ka2Selado,
    bdPot: sim.barras?.['BD-POT'] ?? 0,
    bdAux: sim.barras?.['BD-AUX'] ?? 0,
    bd5v: sim.barras?.['BD-5V'] ?? 0,
    estado: f.estado,
    modo: f.modo,
    alerta: f.alerta,
    ka3: f.habPotencia,
    ventRadiador: f.ventRadiador,
    ventInternas: f.ventInternas,
    ventPtc: f.ventInternas,   // no canal 3, junto com as outras internas
    renPeltier: f.renPeltier,
    renPtc: f.renPtc,
    tCamara: +sim.tCamara.toFixed(1),
    tDissipador: +sim.tDissipador.toFixed(1),
    faixa: f.faixaAtiva ?? sim.faixa,   // ⭐ a faixa ATIVA, que o ciclo escolheu
    sentido: f.sentido,
    duty: +f.duty.toFixed(0),
    dutyTeto: +f.dutyTeto.toFixed(0),
    inalcancavel: f.inalcancavel,
    qcPeltier: +sim.qcPeltier.toFixed(1),
    naFaixa: (() => { const fx = f.faixaAtiva ?? sim.faixa;
      return sim.tCamara >= fx.min && sim.tCamara <= fx.max; })(),
    zona: f.zona,
    fase: f.fase,
    cicloAtual: f.cicloAtual,
    tPatamar: f.tPatamar,
    megaSumido: sim.megaSumido,
    silencioMega: sim.megaSumido ? Math.round((sim.t - sim.ultimoJson) / 1000) : 0,
  };
}

export { RPM_MINIMA };
