/**
 * ETAPA 4 — SINAIS
 * ================
 * Tudo o que o Arduino lê e comanda, dentro do painel. A porta fica
 * para a etapa 5 e a câmara para a 6.
 *
 * ⭐ AQUI VALE A REGRA MAIS APERTADA DO PROJETO: nenhum destes fios
 * pode dividir canaleta com a saída dos BTS. São eles que a segregação
 * existe para proteger — o IS analógico, o 1-Wire e o I²C.
 *
 * Rotas possíveis, todas em canaleta de sinal:
 *   trilho 3 ↔ trilho 3, borda de cima  →  CH-topo
 *   trilho 3 ↔ trilho 3, borda de baixo →  CH-3x2
 *   entre bordas opostas                →  CH-topo · CV-dir · CH-3x2
 *   trilho 3 ↔ trilho 2                 →  CH-topo · CV-dir · CH-3x2
 */

const sig = (n, de, para, diz, extra = {}) => ({
  n, etapa: 4, classe: 'sinal', func: 'digital', mm2: 0.25, de, para, diz, ...extra,
});
const ana = (n, de, para, diz, extra = {}) => ({
  n, etapa: 4, classe: 'sinal', func: 'medida', mm2: 0.25, de, para, diz, ...extra,
});
const T = { comp: 'MEGA' };
const meg = via => ({ ...T, via });

export const FIOS_ETAPA4 = [
  /* ── comando dos sinaleiros: o pino acende o sinaleiro, e pronto ────
     ⭐ ANTES ERAM DOIS FIOS E UM CI NO MEIO: o pino ia à PI-1, o ULN2803A
        puxava o negativo do sinaleiro de 24 V para o 0 V, e o positivo vinha
        do BD-24V. Tudo isso existia porque o sinaleiro era de 24 V e o pino
        é de 5 V. Com o sinaleiro de 5 V, o pino aciona direto.
     ⚠️ O LIMITE AGORA É O PINO: 20 mA. Meça o sinaleiro antes (passo A-02);
        acima disso ele não pode ser ligado direto. */
  ...[['S1', 'D9', 'H1', 'ENERGIZADO'], ['S2', 'D10', 'H2', 'RESFRIANDO'],
      ['S3', 'D11', 'H3', 'AQUECENDO'], ['S4', 'D12', 'H4', 'FALHA']]
    .map(([n, d, h, nome]) => sig(n, meg(d), { comp: h, via: '+' },
      `O pino ${d} alimenta o sinaleiro ${nome} — 5 V, ~20 mA.`,
      { rota: ['CH-topo', 'CV-dir', 'CP-vsin', 'CP-2x3'],
        nome: `Mega ${d} → sinaleiro ${nome}` })),

  /* ── ⭐ os dois gatilhos dos módulos de relé ───────────────────────── */
  { ...sig('S4b', meg('D27'), { comp: 'KA34', via: 'IN3' },
      'Gatilho do KA3 — o relé que fica em série com a bobina do KA2.'),
    nome: 'Mega D27 → gatilho do KA3', rota: ['CH-topo', 'CV-dir', 'CH-3x2'],
    porque: '⭐ O ÚNICO FIO DO PAINEL QUE DÁ AO SOFTWARE PODER SOBRE A POTÊNCIA — e é de '
          + 'propósito que ele seja só um. HIGH fecha o KA3 e a bobina do KA2 pode '
          + 'energizar; LOW abre, o selo do KA2 se perde e o BD-POT vai a 0 V. Como o '
          + 'selo não se refaz sozinho, o corte é RETENTIVO: só o botão verde religa. '
          + 'Doc 31 §31.13.',
    aviso: '⚠️ JUMPER DO MÓDULO EM "H" e um resistor de 10 kΩ deste nó para o 0 V. É o '
         + 'que garante o fail-safe: Arduino resetado, desligado ou com este fio rompido '
         + '→ IN em 0 V → relé aberto → potência cortada.' },

  { ...sig('S4c', meg('D30'), { comp: 'KA34', via: 'IN4' },
      'Gatilho do KA4 — as duas ventoinhas do radiador.'),
    nome: 'Mega D30 → gatilho do KA4', rota: ['CH-topo', 'CV-dir', 'CH-3x2'],
    porque: '⭐ UM CONTATO SECO NÃO TEM LADO ALTO NEM LADO BAIXO. Era esse o problema '
          + 'que derrubou o comando destas ventoinhas: o MV-1 chaveia o NEGATIVO, e o '
          + 'tacômetro delas é referenciado nesse mesmo negativo. O relé chaveia o '
          + 'POSITIVO sem nenhum truque de nível — o preto fica em 0 V de verdade, '
          + 'sempre. Doc 31 §31.14.',
    aviso: '⚠️ Idem: jumper em "H" e pull-down de 10 kΩ. Arduino ausente = ventoinhas '
         + 'paradas — aceitável porque, sem Arduino, o KA3 também abriu e a Peltier não '
         + 'está gerando calor.' },

  /* ── o que a PI-1 devolve ao Arduino ──────────────────────────────── */
  { ...ana('S5', { comp: 'PI1', via: 'J2-1' }, meg('A0'),
      'A corrente do BTS #1, já filtrada pelo C1.'),
    nome: 'IS do BTS #1 → A0', rota: ['CH-3x2'],
    porque: '⭐ O sinal mais sensível do painel: 0 a 5 V analógicos que o ADC lê em '
          + 'passos de 4,88 mV. É por causa dele que a canaleta de sinal existe.' },
  { ...ana('S6', { comp: 'PI1', via: 'J2-2' }, meg('A1'),
      'A corrente do BTS #2.'), nome: 'IS do BTS #2 → A1', rota: ['CH-3x2'] },
  { ...sig('S7', { comp: 'PI1', via: 'J2-3' }, meg('D2'),
      'O barramento 1-Wire do DS18B20 do radiador, já com o pull-up da PI-1.'),
    nome: '1-Wire → D2', rota: ['CH-3x2', 'CV-dir', 'CH-topo'],
    aviso: '⚠️ Pulsos de microssegundos. Se este fio pegar ruído o sensor some do '
         + 'barramento e o firmware acusa CARGA_ABERTA sem haver defeito nenhum.' },
  { ...sig('S8', { comp: 'PI1', via: 'J2-4' }, meg('D25'),
      'Os 4,22 V do divisor, dizendo se os 24 V de potência estão presentes.'),
    nome: 'vigia do 24 V → D25', rota: ['CH-3x2', 'CV-dir', 'CH-topo'] },

  /* ── o IS bruto dos BTS até a PI-1 ────────────────────────────────── */
  { ...ana('S9', { comp: 'BTS1', via: 'R_IS' }, { comp: 'PI1', via: 'J1-1' },
      'Saída de corrente espelhada do BTS #1, indo filtrar na PI-1.'),
    nome: 'IS bruto do BTS #1', rota: ['CH-3x2', 'CV-dir', 'CH-topo'],
    aviso: '🔥 ESTE FIO NASCE AO LADO DO QUE POLUI. Ele sai do próprio BTS, a '
         + 'centímetros dos 6 A chaveados. Prenda-o na canaleta de sinal já na saída '
         + 'e nunca o deixe correr paralelo ao B+ ou ao M+.' },
  { ...ana('S10', { comp: 'BTS2', via: 'R_IS' }, { comp: 'PI1', via: 'J1-2' },
      'Idem para o BTS #2.'), nome: 'IS bruto do BTS #2',
    rota: ['CH-3x2', 'CV-dir', 'CH-topo'] },

  /* ── comando dos BTS ──────────────────────────────────────────────── */
  { ...sig('S11', meg('D5'), { comp: 'BTS1', via: 'R_PWM' },
      'O PWM lento que comanda as Peltier.'), nome: 'PWM do frio',
    rota: ['CH-topo', 'CV-dir', 'CH-3x2'],
    porque: 'Lento de propósito: cada liga-desliga é um choque térmico na pastilha.' },
  { ...sig('S12', meg('D4'), { comp: 'BTS1', via: 'R_EN' },
      'Habilita a ponte do BTS #1.'), nome: 'enable do BTS #1',
    rota: ['CH-topo', 'CV-dir', 'CH-3x2'] },
  /* ── ⭐ O LPWM PRECISA FICAR PRESO NO 0 V, E ESTAVA SOLTO ──────────
     O Doc 32 sempre mandou aterrar os dois LPWM ("fixo em nível baixo,
     carga unidirecional"), mas nenhum fio dizia isso — o borne ficava
     declarado como livre, e na montagem sairia sem nada ligado.

     🔥 ENTRADA DE PWM FLUTUANDO É O PIOR CASO. O que decide o caminho
     da corrente é qual metade da ponte conduz: com o RPWM comandando a
     metade R e o LPWM em nível BAIXO, a metade L fica com o MOSFET de
     baixo ligado, e é por ele que a corrente volta do M− para o B−.
     Solto, o LPWM pega ruído: a metade L começa a chavear junto com a
     R, e as duas conduzindo ao mesmo tempo é curto no barramento de
     24 V, com 6 A disponíveis.

     📌 Na prática é um jumper de 3 cm entre o LPWM e o GND do próprio
     módulo, no bloco de bornes da direita. */
  ...['1', '2'].map((k, i) => ({
    ...sig(`S31${k}`, { comp: `BTS${k}`, via: 'L_PWM' }, { comp: `BTS${k}`, via: 'GND' },
      `Prende o LPWM do BTS #${k} em nível baixo.`),
    rota: [], nome: `LPWM do BTS #${k} no 0 V`,
    porque: '⭐ A carga é UNIDIRECIONAL: a Peltier só resfria e o PTC só aquece, então '
          + 'a ponte nunca precisa inverter. Quem conduz é sempre a metade R; a metade '
          + 'L existe só para devolver a corrente, e para isso o LPWM tem de estar '
          + 'baixo e o L_EN alto.',
    aviso: i === 0
      ? '⚠️ NÃO CONFUNDA COM O L_EN. O L_EN vai ALTO (junto com o R_EN, no D4/D7) — é '
      + 'ele que liga o MOSFET de baixo da metade L para a corrente voltar por ali em '
      + 'vez de pelo diodo de corpo. O LPWM é que vai BAIXO. Trocar os dois é '
      + 'trocar 4 W de calor por um curto.' : undefined,
  })),

  { ...sig('S13', { comp: 'BTS1', via: 'R_EN' }, { comp: 'BTS1', via: 'L_EN' },
      'Ponte curta no próprio módulo: os dois enables andam juntos.'), rota: [],
    nome: 'ponte R_EN–L_EN do BTS #1',
    porque: '⭐ Um pino do Arduino comanda os dois. Nível baixo desabilita as DUAS '
          + 'metades da ponte — nenhuma corrente passa, aconteça o que acontecer no PWM.' },
  { ...sig('S14', meg('D6'), { comp: 'BTS2', via: 'R_PWM' },
      'O PWM do PTC.'), nome: 'PWM do quente', rota: ['CH-topo', 'CV-dir', 'CH-3x2'] },
  { ...sig('S15', meg('D7'), { comp: 'BTS2', via: 'R_EN' },
      'Habilita a ponte do BTS #2.'), nome: 'enable do BTS #2',
    rota: ['CH-topo', 'CV-dir', 'CH-3x2'] },
  { ...sig('S16', { comp: 'BTS2', via: 'R_EN' }, { comp: 'BTS2', via: 'L_EN' },
      'Ponte curta no módulo.'), rota: [], nome: 'ponte R_EN–L_EN do BTS #2' },

  /* ── comando das ventoinhas ───────────────────────────────────────────
     ⭐ ERAM TRÊS, E SOBRARAM DUAS. O canal do RADIADOR (S17, D27→IN1) foi
     removido: as ventoinhas do lado quente ficaram permanentemente
     ligadas no BD-AUX, porque o MV-1 chaveia o NEGATIVO e o tacômetro
     delas tem o emissor referenciado nesse mesmo negativo. Ver X5/X6 na
     etapa 6. O D27 do Mega e o canal 1 do MV-1 ficaram livres. */
  { ...sig('S19', meg('D29'), { comp: 'MV-1', via: 'IN3' },
      'Liga as CINCO ventoinhas internas: 2 frias, 2 do duto e a do PTC.'),
    nome: 'Mega D29 → ventoinhas internas', rota: ['CH-topo', 'CV-dir', 'CH-3x2'],
    porque: '🔧 ERAM DOIS CANAIS E VIRARAM UM. A ventoinha do PTC tinha canal próprio '
          + '(D28 → IN2) para poder continuar girando depois que o aquecedor desligava. '
          + 'Isso deixou de ser necessário: o PTC é AUTO-LIMITADO — sem fluxo de ar a '
          + 'resistência dele sobe e ele corta a própria potência. Com a mesma condição '
          + 'das outras quatro (ensaio rodando), as cinco cabem num canal só.',
    aviso: '⭐ Sumiram o pino D28, o canal 2 do MV-1 e DOIS condutores do prensa-cabo '
         + 'PG13-2 — a ventoinha do PTC passou a entrar em paralelo com as outras, '
         + 'dentro da câmara.' },

  /* ── o multiplexador da PI-2 ──────────────────────────────────────── */
  ...[['S20', 'D31', 'S0', 0], ['S21', 'D32', 'S1', 1],
      ['S22', 'D33', 'S2', 2], ['S23', 'D34', 'S3', 3]]
    .map(([n, d, s, b]) => sig(n, meg(d), { comp: 'PI-2', via: s },
      `Bit ${b} da seleção de canal do multiplexador.`,
      { rota: ['CH-3x2'], nome: `seleção do mux · bit ${b}` })),
  { ...ana('S24', { comp: 'PI-2', via: 'SIG' }, meg('A2'),
      'A saída do multiplexador: os 16 canais chegam ao Arduino por este fio só.'),
    nome: 'SIG do mux → A2', rota: ['CH-3x2'],
    porque: '⭐ É o fio que faz a economia toda valer: 16 posições, uma entrada '
          + 'analógica. Como o Arduino escolheu o canal, ele sabe de quem é a leitura.' },

  /* ── o barramento I²C ─────────────────────────────────────────────── */
  { ...sig('S25', meg('D20'), { comp: 'RTC', via: 'SDA' },
      'SDA do I²C, saindo do Arduino para o primeiro da fila.'),
    nome: 'I²C SDA · Mega → RTC', rota: ['CH-topo', 'CV-dir', 'CH-3x2'] },
  { ...sig('S26', meg('D21'), { comp: 'RTC', via: 'SCL' },
      'SCL do I²C.'), nome: 'I²C SCL · Mega → RTC',
    rota: ['CH-topo', 'CV-dir', 'CH-3x2'] },
  { ...sig('S27', { comp: 'RTC', via: 'SDA' }, { comp: 'PI-2', via: 'SDA' },
      'O I²C segue do RTC para o INA219 da PI-2.'), nome: 'I²C SDA · RTC → PI-2',
    rota: ['CH-3x2'],
    porque: '⭐ AQUI PENDURAR É O CERTO, ao contrário do 0 V. I²C é um BARRAMENTO: '
          + 'todo mundo no mesmo par de fios, cada um com o seu endereço. Puxar um par '
          + 'do Arduino para cada módulo criaria vários barramentos com um dispositivo '
          + 'cada — e nenhum deles funcionaria melhor por isso.' },
  { ...sig('S28', { comp: 'RTC', via: 'SCL' }, { comp: 'PI-2', via: 'SCL' },
      'Idem para o SCL.'), nome: 'I²C SCL · RTC → PI-2', rota: ['CH-3x2'] },

  /* ── a serial do ESP32 ────────────────────────────────────────────── */
  { ...sig('S29', meg('D18'), { comp: 'ESP32', via: 'RX0' },
      'Serial1: o Arduino fala, o ESP32 escuta.'), nome: 'UART Mega TX → ESP32 RX',
    rota: ['CH-topo', 'CV-dir', 'CH-3x2'],
    aviso: '⚠️ TX DE UM VAI NO RX DO OUTRO. Ligar TX no TX não queima nada, mas '
         + 'nenhum dado passa — e o sintoma é idêntico ao de firmware errado.' },
  { ...sig('S30', { comp: 'ESP32', via: 'TX0' }, meg('D19'),
      'Serial1 no sentido de volta.'), nome: 'UART ESP32 TX → Mega RX',
    rota: ['CH-3x2', 'CV-dir', 'CH-topo'],
    porque: '📌 O ESP32 é de 3,3 V e o Mega de 5 V. Nesta direção não há problema: '
          + '3,3 V já é nível alto para o Mega. É na outra que o divisor importa — e '
          + 'ele está declarado na entrada do DNLCB30.' },
];
