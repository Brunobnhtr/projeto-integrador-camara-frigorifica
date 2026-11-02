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

import { eletricaInicial, passoEletrica, barramentos } from './eletrica.js';
import { firmwareInicial, passoFirmware, dispararTripTermico, ESTADO, MODO, RPM_MINIMA,
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
  P_PTC: 50,            // W — especificação provisória do PTC de 12 V
  FUGA_PELTIER_OFF: 0.5, // W/K — o calor volta ATRAVÉS da pastilha desligada
};

/** ⭐ Quanto silêncio conta como "o Mega morreu". Três segundos: o JSON
 *  vem a 1 Hz, então isso tolera duas perdas antes de acusar. Curto
 *  demais dá alarme falso a cada travadinha da serial; longo demais e a
 *  tela mente por meio minuto. */
export const TIMEOUT_MEGA_MS = 3000;
// Model assumptions only; validate the real N4AIC24 poll cycle, timeout, and V1 threshold.
export const INTERVALO_MODBUS_MS = 250;
export const TIMEOUT_MODBUS_MS = 3000;
export const V1_MINIMO_POTENCIA_V = 18;
const CORRENTE_PTC_MODELO_A = 50 / 12;
const CORRENTE_PELTIER_MODELO_A = 6.0;

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
    // A opção permite ESTUDAR uma topologia candidata de corte em série.
    // FALSO por padrão: a montagem física atual não possui esse corte.
    cortePtcConceitual: opts.cortePtcConceitual === true,
    contatoKptcSeguranca: false,
    contatoKptcAquecimento: false,
    // ⭐ VIGILÂNCIA MÚTUA — os dois ESP32 escutam o Mega e acusam a
    //   ausência dele. Nenhum deles ATUA: quem corta a potência quando
    //   o Mega morre já é o pull-down no IN do KA1, em hardware.
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
    botoes: { s0Emergencia: false, s1Verde: false, s2Stop: false },
    falhas: {
      arduinoMorto: false,     // chip queimado ou removido
      btsPeltierEmCurto: false, // MOSFET colado: conduz ignorando o R_EN
      btsPeltierIsSemSinal: false, // corrente real existe, mas o BTS1 IS/A0 não a reporta
      ds18Solto: false,        // sensor fora do barramento → −127 °C
      fanTravada: false,       // RPM = 0 com a ventoinha comandada
      fan1Travada: false,      // cooler externo 1 sem RPM
      fan2Travada: false,      // cooler externo 2 sem RPM
      ka1Colado: false,        // contato do KA1 soldado fechado: o veto some
      km1Colado: false,        // contato de potência do KM1 soldado
      // ⭐ O KA2 tem os DOIS sentidos de falha, e eles não são simétricos.
      //   Com o contato NF, COLADO = ventoinha sempre girando (o velho
      //   comportamento "sem comando", que já era seguro) e ABERTO =
      //   ventoinha nunca girando, que era o pior caso do projeto e que
      //   até aqui não dava para simular.
      ka2Colado: false,        // contato NF soldado: ventoinha nunca desliga
      ka2Aberto: false,        // contato NF não fecha: ventoinha nunca liga
      ka3Aberto: false,        // contato NO não fecha: internas sem alimentação
      fanPtcTravada: false,    // ventoinha do PTC sem tacômetro
      btsPtcIsSemSinal: false, // corrente real existe, mas BTS2 IS/A1 não a reporta
      geralDesligada: false,   // alguém cortou a chave geral
      n4aic24SemComunicacao: false, // leitura V1 não é atualizada
      n4aic24LeituraInvalida: false, // V1 fora da faixa válida simulada
      // ⭐ ST-1/ST-2 são FÍSICOS: estão no caminho da corrente do PTC.
      // O ramal de 12 V segue permanente até o corte CC independente ser definido.
      // ⭐ O BTS #2 (driver do PTC) em curto é o espelho do BTS #1:
      //   o MOSFET colado conduz ignorando o R_EN. Mesmo com renPtc=false
      //   o PTC continua energizado — MAS só se a cadeia térmica estiver
      //   fechada. Se ST-1 ou ST-2 abriu, o curto do BTS não importa:
      //   o contato seco cortou o circuito.
      btsPtcEmCurto: false,    // BTS #2 colado: PTC conduz ignorando o R_EN
      // Contatos KPTC só existem na topologia CONCEITUAL, não em hardware.
      kptcSegurancaColado: false,
      kptcAquecimentoColado: false,
    },
    // Contatos físicos, separados dos comandos do firmware e das falhas dos drivers.
    // O rearme é uma ação explícita; o simulador não infere temperatura do corpo do PTC.
    termostatos: { st1Aberto: false, st2Aberto: false },
    bloqueioTermico: false, // trava retentiva externa proposta no circuito de comando do KM1
    modbus: { v1: null, atualizadoEm: null, proximaLeituraEm: 0 },
    eletrica: eletricaInicial(),
    firmware: firmwareInicial(),
  };
}

/** Um passo de `dt` milissegundos. */
export function passo(sim, dt = 50) {
  const f = sim.firmware;

  if (sim.bloqueioTermico && sim.botoes.s1Verde &&
      f.estado === ESTADO.AGUARDA_START &&
      !sim.termostatos.st1Aberto && !sim.termostatos.st2Aberto &&
      !sim.falhas.btsPtcEmCurto && ventilacaoPtcDisponivel(sim)) {
    sim.bloqueioTermico = false;
  }

  // ── 1. A CADEIA ELÉTRICA, com as saídas do passo anterior ────────
  sim.eletrica = passoEletrica(sim.eletrica, sim.botoes, {
    ka1Fechado: !sim.bloqueioTermico &&
      (sim.falhas.ka1Colado || f.habPotencia),
    geralLigada: !sim.falhas.geralDesligada,
    km1Colado: sim.falhas.km1Colado,
  });
  // KPTC-S: bobina/estado fisicamente vinculada à cadeia de segurança,
  // NÃO ao contato de potência do KM1 (que pode soldar). KPTC-E: bobina
  // independente de habilitação do aquecimento (não é comandada por PWM).
  // Sinais anteriores ao passo atual introduzem um atraso de contato.
  const kptcSegurancaComando = sim.eletrica.km1Selado &&
    !sim.botoes.s0Emergencia && !sim.botoes.s2Stop &&
    !sim.bloqueioTermico;
  const kptcAquecimentoComando = f.vivo && f.renPtc && f.duty > 0;
  sim.contatoKptcSeguranca = kptcSegurancaComando || sim.falhas.kptcSegurancaColado;
  sim.contatoKptcAquecimento = kptcAquecimentoComando || sim.falhas.kptcAquecimentoColado;
  const barras = barramentos(sim.eletrica, {
    geralLigada: !sim.falhas.geralDesligada,
    km1Colado: sim.falhas.km1Colado,
    cortePtcConceitual: sim.cortePtcConceitual,
    kptcSegurancaComando,
    kptcAquecimentoComando,
    kptcSegurancaColado: sim.falhas.kptcSegurancaColado,
    kptcAquecimentoColado: sim.falhas.kptcAquecimentoColado,
  });
  atualizarV1Modbus(sim, barras);
  const idadeLeitura = sim.modbus.atualizadoEm === null
    ? Infinity : sim.t - sim.modbus.atualizadoEm;
  const leituraPotenciaValida = Number.isFinite(sim.modbus.v1) &&
    sim.modbus.v1 >= 0 && sim.modbus.v1 <= 30 &&
    idadeLeitura >= 0 && idadeLeitura <= TIMEOUT_MODBUS_MS;

  // ── 2. OS PINOS DE ENTRADA ───────────────────────────────────────
  //   ⭐ Repare que NÃO existe entrada vinda dos relés. O firmware não
  //     pergunta "o KM1 fechou?"; ele mede se os 24 V chegaram.
  // ⭐ O CONTATO DO KA2 É NF: ele conduz quando a bobina está SOLTA.
  //   Então "o firmware quer ventilar" (f.ventRadiador) = bobina solta =
  //   contato fechado. Colado, conduz sempre; aberto, nunca.
  const contatoKa2 = sim.falhas.ka2Colado ? true
    : sim.falhas.ka2Aberto ? false
    : f.ventRadiador;
  const radiadorAlimentado = contatoKa2 && barras['BD-AUX'] > 0;
  const radiadorFan1Girando = radiadorAlimentado &&
    !sim.falhas.fanTravada && !sim.falhas.fan1Travada;
  const radiadorFan2Girando = radiadorAlimentado &&
    !sim.falhas.fanTravada && !sim.falhas.fan2Travada;
  const radiadorGirando = radiadorFan1Girando && radiadorFan2Girando;
  const correntePtcRealA = correntePtcFisica(sim, barras);
  const correntePtcA = sim.falhas.btsPtcIsSemSinal ? 0 : correntePtcRealA;
  const correntePeltierRealA = correntePeltierFisica(sim, barras);
  const correntePeltierA = sim.falhas.btsPeltierIsSemSinal ? 0 : correntePeltierRealA;
  sim.radiadorGirando = radiadorGirando;   // o que GIRA, não o que foi mandado
  sim.radiadorFan1Girando = radiadorFan1Girando;
  sim.radiadorFan2Girando = radiadorFan2Girando;
  const entradas = {
    stop: sim.botoes.s2Stop,                         // D23 · bloco NA de 5 V
    emergencia: sim.botoes.s0Emergencia,             // D24 · bloco NF de 5 V
    leituraPotenciaValida,
    tensaoPotencia: leituraPotenciaValida ? sim.modbus.v1 : null,
    potenciaDisponivel: leituraPotenciaValida &&
      sim.modbus.v1 >= V1_MINIMO_POTENCIA_V,
    tDissipador: sim.falhas.ds18Solto ? -127 : sim.tDissipador,
    tAmbiente: sim.tAmbiente,
    tCamara: sim.tCamara,
    faixa: sim.faixa,
    receita: sim.receita,   // null = faixa fixa, sem ciclo
    rpm1: radiadorFan1Girando ? 1850 : 0,
    rpm2: radiadorFan2Girando ? 1820 : 0,
    correntePeltierA,
    correntePeltierRealA,
    ventilacaoPtcDisponivel: ventilacaoPtcDisponivel(sim, barras),
    correntePtcA,
    correntePtcRealA,
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

// Sim-only permissive from injected faults; no physical fan feedback exists in the panel.
function ventilacaoPtcDisponivel(sim, barras = sim.barras) {
  return !sim.falhas.geralDesligada &&
    !sim.falhas.ka3Aberto &&
    !sim.falhas.fanPtcTravada &&
    (barras?.['BD-AUX'] ?? 0) > 0;
}

function correntePtcFisica(sim, barras) {
  if ((barras?.['BD-PTC'] ?? 0) <= 0 ||
      sim.termostatos.st1Aberto || sim.termostatos.st2Aberto) return 0;
  if (sim.falhas.btsPtcEmCurto) return CORRENTE_PTC_MODELO_A;
  return sim.firmware.renPtc
    ? CORRENTE_PTC_MODELO_A * sim.firmware.duty / 100
    : 0;
}

function correntePeltierFisica(sim, barras) {
  if ((barras?.['BD-POT'] ?? 0) <= 0) return 0;
  if (sim.falhas.btsPeltierEmCurto) return CORRENTE_PELTIER_MODELO_A;
  return sim.firmware.renPeltier
    ? CORRENTE_PELTIER_MODELO_A * sim.firmware.duty / 100
    : 0;
}

/** Modelo térmico de 2 massas: a câmara e o dissipador do lado quente. */
function termico(sim, barras, dt) {
  const f = sim.firmware;
  const s = dt / 1000;
  const haPotencia = barras['BD-POT'] > 0;
  sim.ventInternasGirando = f.ventInternas &&
    barras['BD-AUX'] > 0 && !sim.falhas.ka3Aberto;
  sim.ventPtcGirando = sim.ventInternasGirando && !sim.falhas.fanPtcTravada;

  // caracterização: trava o duty antes de qualquer decisão deste passo
  if (sim.dutyForcado !== null) {
    f.duty = sim.dutyForcado; f.renPeltier = true; f.renPtc = false;
  }

  // ⚠ O BTS em curto conduz mesmo com o R_EN baixo — é justamente o
  //   modo de falha que o KA1 existe para cobrir.
  const peltierConduz = haPotencia &&
    (sim.falhas.btsPeltierEmCurto || (f.renPeltier && f.duty > 0));
  // ⭐ O PTC só conduz se a cadeia térmica estiver FECHADA. st1Aberto/st2Aberto
  //   são físicos: o termostato abriu, o contato seco cortou o circuito.
  //   Mesmo com renPtc=true e duty=100, se ST-1 ou ST-2 estiver aberto, o
  //   PTC não puxa corrente nem gera calor.
  // ⭐ O BTS #2 em curto (btsPtcEmCurto) faz o PTC conduzir mesmo sem comando
  //   do firmware (renPtc=false) — é o mesmo modo de falha do BTS #1 com a
  //   Peltier. MAS a cadeia térmica ainda corta: se ST-1/ST-2 abriu, o curto
  //   do BTS não alimenta nada. O duty vira 100 porque o MOSFET colado não
  //   respeita PWM.
  const correntePtcRealA = correntePtcFisica(sim, barras);
  const ptcConduz = correntePtcRealA > 0;
  const ptcDuty = sim.falhas.btsPtcEmCurto ? 100 : f.duty;
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
  if (ptcConduz) qCamara += TERMICO.P_PTC * ptcDuty / 100;
  // ⭐ As 5 ventoinhas internas: todo watt elétrico vira calor AQUI DENTRO.
  if (sim.ventInternasGirando) qCamara += 6.0;
  sim.tCamara += (qCamara / TERMICO.C_CAMARA) * s;
  if (sim.tCamaraFixa !== null) sim.tCamara = sim.tCamaraFixa;

  // ── Dissipador do lado quente ────────────────────────────────────
  // ⭐ MESMA REGRA DO CONTATO NF DO KA2 usada lá em cima: quem ventila é o
  //   contato, não a ordem. Aqui isso decide o UA do dissipador — 4,0 W/K
  //   ventilado contra 0,8 W/K em convecção natural.
  const contatoKa2t = sim.falhas.ka2Colado ? true
    : sim.falhas.ka2Aberto ? false
    : f.ventRadiador;
  const radiadorAlimentado = contatoKa2t && barras['BD-AUX'] > 0;
  const ventiladoresGirando = radiadorAlimentado
    ? Number(sim.radiadorFan1Girando) + Number(sim.radiadorFan2Girando)
    : 0;
  const ua = TERMICO.UA_DISSIP_SEM_FAN +
    (TERMICO.UA_DISSIP_COM_FAN - TERMICO.UA_DISSIP_SEM_FAN) *
      ventiladoresGirando / 2;
  const qDissip = (sim.tAmbiente - sim.tDissipador) * ua + qh;
  sim.tDissipador += (qDissip / TERMICO.C_DISSIPADOR) * s;
}

// ── AÇÕES DO OPERADOR ───────────────────────────────────────────────

/** Aperta e solta um botão de pulso (o verde e o preto). */
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

function atualizarV1Modbus(sim, barras) {
  if (sim.t < sim.modbus.proximaLeituraEm) return;
  sim.modbus.proximaLeituraEm = sim.t + INTERVALO_MODBUS_MS;
  if (sim.falhas.n4aic24SemComunicacao || barras['BD-24V'] <= 0) return;
  sim.modbus.v1 = sim.falhas.n4aic24LeituraInvalida ? 31 : barras['BD-POT'];
  sim.modbus.atualizadoEm = sim.t;
}

/** Abre fisicamente o contato; a temperatura de disparo é injetada, não calculada. */
export function dispararTermostato(sim, id) {
  const chave = id === 'ST1' ? 'st1Aberto' : id === 'ST2' ? 'st2Aberto' : null;
  if (!chave) throw new RangeError(`Termostato desconhecido: ${id}`);
  sim.termostatos[chave] = true;
  sim.bloqueioTermico = true;
  dispararTripTermico(sim.firmware, `TRIP_TERMICO_${id}`);
  return sim;
}

/** O contato só fecha por rearme manual após a causa ter sido corrigida. */
export function rearmarTermostato(sim, id, causaCorrigida = false) {
  const chave = id === 'ST1' ? 'st1Aberto' : id === 'ST2' ? 'st2Aberto' : null;
  if (!chave) throw new RangeError(`Termostato desconhecido: ${id}`);
  if (!causaCorrigida || sim.falhas.btsPtcEmCurto ||
      sim.firmware.estado === ESTADO.RODANDO || sim.firmware.renPtc ||
      !ventilacaoPtcDisponivel(sim)) return false;
  sim.termostatos[chave] = false;
  return true;
}

/** Foto legível do sistema — é o que os testes comparam. */
export function foto(sim) {
  const f = sim.firmware;
  return {
    km1: sim.eletrica.km1Selado,
    bdPot: sim.barras?.['BD-POT'] ?? 0,
    bdAux: sim.barras?.['BD-AUX'] ?? 0,
    bdPtc12v: sim.barras?.['BD-PTC'] ?? 0,
    cortePtcConceitual: sim.cortePtcConceitual,
    contatoKptcSeguranca: sim.contatoKptcSeguranca,
    contatoKptcAquecimento: sim.contatoKptcAquecimento,
    bd5v: sim.barras?.['BD-5V'] ?? 0,
    v1: sim.entradas?.tensaoPotencia ?? null,
    v1Valida: sim.entradas?.leituraPotenciaValida ?? false,
    bloqueioTermico: sim.bloqueioTermico,
    estado: f.estado,
    modo: f.modo,
    alerta: f.alerta,
    avisoPosVent: f.avisoPosVent,
    ka1: f.habPotencia,
    ventRadiador: f.ventRadiador,          // a ORDEM do firmware
    radiadorGirando: !!sim.radiadorGirando, // ⭐ o que de fato gira
    radiadorFan1Girando: !!sim.radiadorFan1Girando,
    radiadorFan2Girando: !!sim.radiadorFan2Girando,
    ventInternas: f.ventInternas,
    ventInternasGirando: !!sim.ventInternasGirando,
    ventPtc: f.ventInternas,
    ventPtcGirando: !!sim.ventPtcGirando,
    ventilacaoPtcDisponivel: ventilacaoPtcDisponivel(sim),
    renPeltier: f.renPeltier,
    correntePeltierA: sim.entradas?.correntePeltierA ?? 0,
    correntePeltierRealA: correntePeltierFisica(sim, sim.barras),
    renPtc: f.renPtc,
    correntePtcA: sim.entradas?.correntePtcA ?? 0,
    correntePtcRealA: correntePtcFisica(sim, sim.barras),
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
