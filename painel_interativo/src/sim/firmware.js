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

/* ⭐ AS RECEITAS DE ENSAIO ─────────────────────────────────────────
   Três tipos, e o terceiro é o que vale nota:

     FRIO    resfria até a faixa e segura, indefinidamente
     QUENTE  aquece até a faixa e segura
     CICLO   alterna frio ↔ quente N vezes, com PATAMAR em cada
             extremo e COOLDOWN entre eles

   O cooldown não é enfeite. Trocar direto de resfriar para aquecer
   significa disparar o PTC com o dissipador da Peltier a ~52 °C e a
   placa fria ainda gelada: o calor atravessa a pastilha no sentido
   errado, que é o que mais encurta a vida dela. E o choque térmico
   fadiga as soldas internas. Então entre as fases tudo desliga, as
   ventoinhas continuam, e só se avança quando o dissipador cair. */
export const FASE = {
  INDO_FRIO: 'INDO_FRIO', PATAMAR_FRIO: 'PATAMAR_FRIO',
  INDO_QUENTE: 'INDO_QUENTE', PATAMAR_QUENTE: 'PATAMAR_QUENTE',
  COOLDOWN: 'COOLDOWN', CONCLUIDO: 'CONCLUIDO',
};

export const RECEITA_PADRAO = {
  tipo: 'FRIO',
  faixaFria: { min: 4, max: 6 },
  faixaQuente: { min: 38, max: 42 },
  patamarMs: 10 * 60 * 1000,       // 10 min segurando em cada extremo
  cooldownMs: 3 * 60 * 1000,       // tempo morto MÍNIMO entre fases
  cooldownDissipador: 35,          // °C — e o dissipador tem de cair até aqui
  ciclos: 3,
};

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
    sentido: 'FRIO',
    faixaAtiva: null,
    fase: FASE.INDO_FRIO,       // onde o ciclo está
    tFase: 0,                   // ms dentro da fase atual
    cicloAtual: 0,
    tPatamar: 0,                // ms acumulados DENTRO da faixa
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
  //   ⭐ E OS DOIS RELÉS VÃO PARA LADOS OPOSTOS, que é o ponto inteiro do
  //     projeto do KA4. O R10 solta a bobina do KA3 e o contato NA abre
  //     → potência cortada. O R11 solta a bobina do KA4 e o contato NF
  //     FECHA → ventoinha do radiador GIRANDO. Primeiro para de gerar
  //     calor, depois continua tirando o que sobrou.
  if (!f.vivo) {
    f.habPotencia = false;    // KA3 (NA) abre → a potência cai e NÃO volta
    f.ventRadiador = true;    // ⭐ KA4 (NF) fecha → o radiador ventila
    f.radiadorLigado = true;
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
        // ⭐ O SENTIDO DO ENSAIO É DECIDIDO AQUI, no START, e não muda
        //   mais. Com receita, quem manda é ela; sem receita, vem de onde
        //   a câmara está em relação à faixa pedida.
        if (ent.receita) {
          f.sentido = ent.receita.tipo === 'QUENTE' ? 'QUENTE' : 'FRIO';
        } else {
          const fx = ent.faixa ?? FAIXA_PADRAO;
          if (ent.tCamara > fx.max) f.sentido = 'FRIO';
          else if (ent.tCamara < fx.min) f.sentido = 'QUENTE';
        }
        f.fase = f.sentido === 'FRIO' ? FASE.INDO_FRIO : FASE.INDO_QUENTE;
        f.cicloAtual = 0; f.tFase = 0; f.tPatamar = 0; f.integral = 0;
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
 * ⭐ O CICLO DE ENSAIO. Decide QUAL faixa vale agora — ou se ninguém
 *   deve trabalhar, no caso do cooldown.
 *
 *   Devolve a faixa ativa, ou `null` quando é para tudo ficar desligado.
 */
function gerenciarCiclo(f, ent, dt) {
  const r = ent.receita;
  f.tFase += dt;

  // Sem receita: faixa fixa, e o sentido foi decidido no START (ver
  // maquinaDeEstados). Não muda no meio do ensaio.
  if (!ent.receita) return { faixa: ent.faixa ?? FAIXA_PADRAO, sentido: f.sentido };

  // Receitas simples: uma faixa só, um sentido só, para sempre.
  if (r.tipo === 'FRIO') { f.fase = FASE.INDO_FRIO; return { faixa: r.faixaFria, sentido: 'FRIO' }; }
  if (r.tipo === 'QUENTE') { f.fase = FASE.INDO_QUENTE; return { faixa: r.faixaQuente, sentido: 'QUENTE' }; }

  const dentro = (fx) => ent.tCamara >= fx.min && ent.tCamara <= fx.max;
  const trocaFase = (nova) => { f.fase = nova; f.tFase = 0; f.tPatamar = 0; };

  switch (f.fase) {
    case FASE.INDO_FRIO:
      // ⭐ Chegar não basta: o patamar só conta com a câmara DENTRO da
      //   faixa. E se o firmware declarou inalcançável, o ensaio segue
      //   assim mesmo — com o número real, em vez de travar para sempre.
      if (dentro(r.faixaFria) || f.inalcancavel) trocaFase(FASE.PATAMAR_FRIO);
      return { faixa: r.faixaFria, sentido: 'FRIO' };

    case FASE.PATAMAR_FRIO:
      if (dentro(r.faixaFria)) f.tPatamar += dt;
      if (f.tPatamar >= r.patamarMs) {
        f.cicloAtual++;
        trocaFase(f.cicloAtual >= r.ciclos ? FASE.CONCLUIDO : FASE.COOLDOWN);
        f.proxima = FASE.INDO_QUENTE;
      }
      return { faixa: r.faixaFria, sentido: 'FRIO' };

    case FASE.COOLDOWN: {
      // ⚠ TUDO DESLIGADO, ventoinhas girando. Duas condições, e as duas
      //   têm de valer: o tempo mínimo E o dissipador ter esfriado.
      const tempoOk = f.tFase >= r.cooldownMs;
      const dissipOk = ent.tDissipador <= r.cooldownDissipador ||
                       f.proxima === FASE.INDO_FRIO;   // p/ o frio, só tempo
      if (tempoOk && dissipOk) trocaFase(f.proxima);
      return null;                                     // ninguém trabalha
    }

    case FASE.INDO_QUENTE:
      if (dentro(r.faixaQuente) || f.inalcancavel) trocaFase(FASE.PATAMAR_QUENTE);
      return { faixa: r.faixaQuente, sentido: 'QUENTE' };

    case FASE.PATAMAR_QUENTE:
      if (dentro(r.faixaQuente)) f.tPatamar += dt;
      if (f.tPatamar >= r.patamarMs) {
        f.cicloAtual++;
        trocaFase(f.cicloAtual >= r.ciclos ? FASE.CONCLUIDO : FASE.COOLDOWN);
        f.proxima = FASE.INDO_FRIO;
      }
      return { faixa: r.faixaQuente, sentido: 'QUENTE' };

    case FASE.CONCLUIDO:
    default:
      return null;
  }
}

/**
 * ⭐ A FAIXA, E O SENTIDO DE APROXIMAÇÃO.
 *
 *   O operador pede "entre 10 e 12". Mas 10 e 12 não são simétricos:
 *   num ensaio de FRIO você quer o mais perto de 10 que conseguir; num
 *   de QUENTE, o mais perto de 12. **O alvo é sempre a borda no sentido
 *   do esforço** — e a borda oposta já conta como sucesso.
 *
 *   É a segunda metade que importa: é ela que impede a máquina de
 *   perseguir um número exato que talvez não exista naquele ambiente,
 *   que é o que um ar-condicionado mal ajustado faz.
 */
const HISTERESE = 0.4;   // °C — impede o liga-desliga picotado na borda

/**
 * ⭐ O limitador térmico. Desce o teto de duty conforme o dissipador
 *   esquenta — e como o Qc cai com o ΔT, recuar aqui ENTREGA MAIS FRIO.
 */
function tetoPorDissipador(tDissipador) {
  if (tDissipador <= DISSIPADOR_ALVO) return DUTY_MAXIMO;
  if (tDissipador >= DISSIPADOR_TETO) return DUTY_MINIMO_LIM;
  const k = (tDissipador - DISSIPADOR_ALVO) / (DISSIPADOR_TETO - DISSIPADOR_ALVO);
  return DUTY_MAXIMO - k * (DUTY_MAXIMO - DUTY_MINIMO_LIM);
}

function controlar(f, ent, dt) {
  const plano = gerenciarCiclo(f, ent, dt);
  const faixa = plano === null ? null : plano.faixa;

  // ⭐ COOLDOWN ou ensaio CONCLUÍDO: os dois drivers ficam fora, mas as
  //   ventoinhas continuam (elas dependem do estado, não do modo). É o
  //   tempo morto que evita o choque térmico na pastilha.
  if (faixa === null) {
    if (f.modo !== MODO.PARADO) { f.modo = MODO.PARADO; f.tEmModo = 0; }
    f.renPeltier = false; f.renPtc = false; f.duty = 0;
    f.integral = 0;
    f.zona = f.fase === FASE.CONCLUIDO ? 'CONCLUIDO' : 'COOLDOWN';
    f.faixaAtiva = faixa;
    return;
  }
  f.faixaAtiva = faixa;

  // ⭐ O SENTIDO VEM DA RECEITA, NUNCA DA TEMPERATURA DO MOMENTO.
  //   Foi um defeito real: com o sentido tirado da leitura instantânea,
  //   passar 0,07 °C abaixo da mínima fazia o firmware concluir "estou
  //   frio demais" e LIGAR O PTC para voltar à máxima. Num ensaio de
  //   frio, o aquecedor não deve disparar nunca — e agora não dispara,
  //   porque quem decide é a receita.
  f.sentido = plano.sentido;

  const resfriando = f.sentido === 'FRIO';
  const alvo = resfriando ? faixa.min : faixa.max;   // a borda do esforço
  const chegou = resfriando ? ent.tCamara <= alvo : ent.tCamara >= alvo;
  const dentro = ent.tCamara >= faixa.min && ent.tCamara <= faixa.max;

  // ── PRONTO: chegou na borda de esforço. Desliga e deixa a inércia ──
  //   A histerese impede o picote: só volta a trabalhar depois de o
  //   ambiente empurrar 0,4 °C de volta.
  const parado = f.modo === MODO.PARADO;
  const soltou = resfriando ? ent.tCamara > alvo + HISTERESE
                            : ent.tCamara < alvo - HISTERESE;
  if (chegou || (parado && !soltou)) {
    if (!parado) { f.modo = MODO.PARADO; f.tEmModo = 0; }
    f.renPeltier = false; f.renPtc = false; f.duty = 0;
    f.integral *= 0.98;
    f.inalcancavel = false;
    f.tAvalRef = null;
    f.zona = 'PRONTO';
    return;
  }

  f.zona = dentro ? 'AJUSTE' : 'URGENTE';
  const erro = alvo - ent.tCamara;                   // + = aquecer, − = esfriar

  // ⭐ O TETO. Cheio na urgência; dentro da faixa, metade — não há pressa,
  //   e duty menor mantém o dissipador frio, o que dá MAIS Qc.
  const tetoTermico = resfriando ? tetoPorDissipador(ent.tDissipador) : DUTY_MAXIMO;
  const lim = f.zona === 'AJUSTE' ? Math.min(tetoTermico, 55) : tetoTermico;
  f.dutyTeto = lim;

  const bruto = KP * erro + f.integral;
  const saida = Math.max(-lim, Math.min(lim, bruto));
  if (saida === bruto) f.integral += KI * erro * (dt / 1000);

  // ── ⭐ AINDA ESTÁ INDO A ALGUM LUGAR? ─────────────────────────────
  //   Só avalia FORA da faixa: dentro dela não há o que alcançar.
  if (f.zona === 'URGENTE' && Math.abs(saida) >= lim - 0.5) {
    if (f.tAvalRef === null) { f.tAvalRef = ent.tCamara; f.tAval = f.tEmModo; }
    else if (f.tEmModo - f.tAval > AVAL_MS) {
      f.inalcancavel = Math.abs(f.tAvalRef - ent.tCamara) < MELHORA_MINIMA;
      f.tAvalRef = ent.tCamara; f.tAval = f.tEmModo;
    }
  } else { f.tAvalRef = null; if (f.zona !== 'URGENTE') f.inalcancavel = false; }

  // ⭐ Desistiu: recua para o ponto de MAIOR Qc em vez de forçar o teto.
  f.duty = f.inalcancavel ? Math.min(Math.abs(saida), DUTY_SUSTENTACAO)
                          : Math.abs(saida);

  const novoModo = resfriando ? MODO.RESFRIAMENTO : MODO.AQUECIMENTO;
  if (novoModo !== f.modo) { f.modo = novoModo; f.tEmModo = 0; }

  // ⚠ A ORDEM É A GARANTIA DO INTERTRAVAMENTO: o driver que vai
  //   desligar é desabilitado ANTES de o outro ser habilitado.
  if (resfriando) { f.renPtc = false; f.renPeltier = true; }
  else { f.renPeltier = false; f.renPtc = true; }
}

/** ⭐ Duty de sustentação quando o alvo é inalcançável — o ponto de MAIOR Qc
    medido no simulador (19,5 W a 60 %, contra 11,0 W a 100 %). */
const DUTY_SUSTENTACAO = 60;
