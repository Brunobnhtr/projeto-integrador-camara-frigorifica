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
  /* ── comando dos sinaleiros: Mega → PI-1 → ULN ────────────────────── */
  ...[['S1', 'D9', 'J1-5', 'ENERGIZADO'], ['S2', 'D10', 'J1-6', 'RESFRIANDO'],
      ['S3', 'D11', 'J1-7', 'AQUECENDO'], ['S4', 'D12', 'J1-8', 'FALHA']]
    .map(([n, d, j, nome]) => sig(n, meg(d), { comp: 'PI1', via: j },
      `Comando do sinaleiro ${nome}.`, { rota: ['CH-topo'],
      nome: `Mega ${d} → sinaleiro ${nome}` })),

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
  { ...sig('S8', { comp: 'PI1', via: 'J2-8' }, meg('D25'),
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
  ...[['S18', 'D28', 'IN2', 'PTC'],
      ['S19', 'D29', 'IN3', 'CIRCULAÇÃO']]
    .map(([n, d, i, g]) => sig(n, meg(d), { comp: 'MV-1', via: i },
      `Liga o grupo de ventoinhas ${g}.`,
      { rota: ['CH-topo', 'CV-dir', 'CH-3x2'], nome: `Mega ${d} → ventoinhas ${g}` })),

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
