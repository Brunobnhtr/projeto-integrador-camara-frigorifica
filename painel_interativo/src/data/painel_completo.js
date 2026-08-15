/**
 * O PAINEL POR DENTRO — inventário completo de terminais
 * ======================================================
 * Cada componente com TODOS os bornes que ele tem de verdade, não só os
 * que o projeto usa. É assim que se descobre, antes de comprar, que um
 * bloco de 8 saídas não vai dar conta.
 *
 * `usa` = o projeto ocupa este terminal
 *   ausente → o terminal existe e fica livre
 *
 * Dimensões em MILÍMETROS.
 */

export const CAIXA = { largura: 400, altura: 500, profundidade: 200 };
export const PLACA = { x: 12, y: 14, largura: 376, altura: 472 };
export const TRILHOS = [
  { n: 3, y: 125, nome: 'TRILHO 3 — Controle' },
  { n: 2, y: 255, nome: 'TRILHO 2 — Potência' },
  { n: 1, y: 385, nome: 'TRILHO 1 — Distribuição' },
];

/* ── atalhos para montar listas repetitivas ──────────────────────── */
const via = (nome, usa, para) => ({ nome, ...(usa ? { usa: true, para } : {}) });
const bloco = (n, prefixo = 'O') =>
  Array.from({ length: n }, (_, i) => ({ nome: `${prefixo}${i + 1}` }));

export const COMPONENTES = [

  /* ════════════ TRILHO 3 — CONTROLE ════════════ */
  {
    id: 'MEGA', nome: 'Arduino Mega 2560 + Sensor Shield', trilho: 3,
    x: 20, largura: 110, altura: 62, cor: '#0ca678',
    nota: 'O Mega tem 70 pinos de sinal. O projeto usa 23 — e é bom que sobre, '
        + 'porque pino livre é o que permite consertar um erro sem trocar de placa.',
    grupos: [
      { ref: 'POWER', legenda: 'Barra de alimentação (8 pinos)', pinos: [
        via('IOREF'), via('RESET'), via('3V3'),
        via('5V', 1, 'BD-5V saída 1'),
        via('GND', 1, 'BD-0V'), via('GND'), via('VIN'), via('NC'),
      ]},
      { ref: 'ANALOG', legenda: 'Entradas analógicas (16 pinos)', pinos: [
        via('A0', 1, 'PI-1 J2-1 — corrente do BTS #1'),
        via('A1', 1, 'PI-1 J2-2 — corrente do BTS #2'),
        via('A2'), via('A3'), via('A4'), via('A5'), via('A6'), via('A7'),
        via('A8', 1, 'RPM do cooler externo #2'),
        via('A9'), via('A10'), via('A11'), via('A12'), via('A13'), via('A14'), via('A15'),
      ]},
      { ref: 'PWM', legenda: 'Digitais 0–13 + GND + AREF (16 pinos)', pinos: [
        via('D0'), via('D1'),
        via('D2', 1, 'PI-1 J2-3 — 1-Wire do DS18B20'),
        via('D3', 1, 'RPM do cooler externo #1'),
        via('D4', 1, 'BTS #1 · R_EN e L_EN juntos'),
        via('D5', 1, 'BTS #1 · RPWM (frio)'),
        via('D6', 1, 'BTS #2 · RPWM (quente)'),
        via('D7', 1, 'BTS #2 · R_EN e L_EN juntos'),
        via('D8'),
        via('D9',  1, 'PI-1 J1-5 → sinaleiro ENERGIZADO'),
        via('D10', 1, 'PI-1 J1-6 → sinaleiro RESFRIANDO'),
        via('D11', 1, 'PI-1 J1-7 → sinaleiro AQUECENDO'),
        via('D12', 1, 'PI-1 J1-8 → sinaleiro FALHA'),
        via('D13'), via('GND'), via('AREF'),
      ]},
      { ref: 'DIGITAL', legenda: 'Digitais 22–53 + 5V ×2 + GND ×2 (36 pinos)', pinos: [
        via('D14'), via('D15'),
        via('D16', 1, 'Serial2 TX → conversor → tela'),
        via('D17', 1, 'Serial2 RX ← conversor ← tela'),
        via('D18', 1, 'Serial1 TX → DNLCB30/ESP32'),
        via('D19', 1, 'Serial1 RX ← DNLCB30/ESP32'),
        via('D20', 1, 'I²C SDA — AM2315C, DS3231 e 4× INA219'),
        via('D21', 1, 'I²C SCL — o mesmo barramento'),
        via('D22', 1, 'Botão START (NA, 5 V)'),
        via('D23', 1, 'Botão STOP (NA, 5 V)'),
        via('D24', 1, 'Emergência — bloco NF de 5 V'),
        via('D25', 1, 'PI-1 J2-8 — vigia se os 24 V caíram'),
        ...Array.from({ length: 24 }, (_, i) => via(`D${26 + i}`)),
        via('5V'), via('5V'), via('GND'), via('GND'),
      ]},
    ],
    avisos: [
      '⚠️ O Mega tem só 5 pinos GND no total. O projeto usa 1 (para o BD-0V), então '
      + 'sobram 4 — suficiente, mas conte antes de pendurar sensor direto na placa.',
      '📌 D50–D53 (SPI) ficaram LIVRES quando o cartão SD mudou para a tela ES3C28P. '
      + 'São 4 pinos rápidos de graça, caso precise de outro periférico.',
    ],
  },
  {
    id: 'PI1', nome: 'Placa de interface PI-1', trilho: 3,
    x: 137, largura: 70, altura: 62, cor: '#f08c00',
    nota: 'Caixa DIN de 4 módulos. J1 só entra, J2 só sai.',
    grupos: [
      { ref: 'J1', legenda: 'ENTRADAS (11 vias · KF301 5,08 mm)', pinos: [
        via('J1-1', 1, 'BTS #1 · R_IS'), via('J1-2', 1, 'BTS #2 · R_IS'),
        via('J1-3', 1, 'DS18B20 · DATA'), via('J1-4', 1, 'BD-5V saída 6'),
        via('J1-5', 1, 'Mega D9'), via('J1-6', 1, 'Mega D10'),
        via('J1-7', 1, 'Mega D11'), via('J1-8', 1, 'Mega D12'),
        via('J1-9', 1, 'BD-0V'), via('J1-10', 1, 'BD-24V saída 5'),
        via('J1-11', 1, 'BD-POT saída 3'),
      ]},
      { ref: 'J2', legenda: 'SAÍDAS (8 vias · KF301 5,08 mm)', pinos: [
        via('J2-1', 1, 'Mega A0'), via('J2-2', 1, 'Mega A1'),
        via('J2-3', 1, 'Mega D2'), via('J2-4', 1, 'Sinaleiro H1 −'),
        via('J2-5', 1, 'Sinaleiro H2 −'), via('J2-6', 1, 'Sinaleiro H3 −'),
        via('J2-7', 1, 'Sinaleiro H4 −'), via('J2-8', 1, 'Mega D25'),
      ]},
    ],
    avisos: ['✅ 19 vias, 19 usadas, ZERO reserva — e é assim de propósito. A PI-1 é '
           + 'uma placa feita à mão para este projeto: se um dia precisar de outro '
           + 'sinal, ela é refeita de qualquer jeito. Borne sobrando só ocuparia '
           + 'espaço no trilho.'],
  },
  {
    id: 'ESP32', nome: 'DNLCB30 + ESP32 30 pinos', trilho: 3,
    x: 214, largura: 96, altura: 62, cor: '#1971c2',
    nota: 'Placa de expansão com bornes de parafuso. Já converte 3,3 V ↔ 5 V e '
        + 'aceita 24 V direto na alimentação.',
    grupos: [
      { ref: 'ESQ', legenda: 'Bornes GPIO — lado esquerdo (14)', pinos: [
        via('GPIO15'), via('GPIO14'), via('GPIO16'), via('GPIO17'), via('GPIO5'),
        via('GPIO18'), via('GND'), via('GPIO19'), via('GPIO21'),
        via('GPIO3 (RX)', 1, 'Mega D18 — Serial1'),
        via('GPIO1 (TX)', 1, 'Mega D19 — Serial1'),
        via('GPIO22'), via('GPIO23'), via('GND'),
      ]},
      { ref: 'DIR', legenda: 'Bornes GPIO — lado direito (12)', pinos: [
        via('GND'), via('GPIO13'), via('GPIO27'), via('GPIO26'), via('GPIO25'),
        via('GND'), via('GPIO33'), via('GPIO32'),
        via('GPI35 · só entrada'), via('GPI34 · só entrada'),
        via('GPI39 · só entrada'), via('GPI36 · só entrada'),
      ]},
      { ref: 'PWR', legenda: 'Alimentação DC 7–30 V (2)', pinos: [
        via('+', 1, 'BD-24V saída 1'), via('−', 1, 'BD-0V'),
      ]},
    ],
    avisos: ['📌 Sobram 22 GPIOs livres. É a placa mais folgada do painel.'],
  },

  /* ════════════ TRILHO 2 — POTÊNCIA ════════════ */
  {
    id: 'BTS1', nome: 'BTS7960 (IBT-2) #1 — Peltier', trilho: 2,
    x: 20, largura: 50, altura: 50, cor: '#c92a2a',
    grupos: [
      { ref: 'P1', legenda: 'Borne verde de potência (4 parafusos)', pinos: [
        via('M−', 1, 'Peltier — negativo'), via('M+', 1, 'Peltier — positivo'),
        via('B+', 1, 'BD-POT saída 1'), via('B−', 1, 'BD-0V'),
      ]},
      { ref: 'J1', legenda: 'Barra de sinal 2 × 4 (8 pinos)', pinos: [
        via('R_PWM', 1, 'Mega D5'), via('L_PWM'),
        via('R_EN', 1, 'Mega D4'), via('L_EN', 1, 'Mega D4 — o MESMO pino'),
        via('R_IS', 1, 'PI-1 J1-1'), via('L_IS'),
        via('VCC', 1, 'BD-5V saída 4'), via('GND', 1, 'BD-0V'),
      ]},
    ],
    avisos: ['⚠️ Os 2 resistores de 10 kΩ de pull-down ficam soldados DENTRO deste '
           + 'módulo, entre R_EN/L_EN e GND — não na PI-1.'],
  },
  {
    id: 'BTS2', nome: 'BTS7960 (IBT-2) #2 — PTC', trilho: 2,
    x: 77, largura: 50, altura: 50, cor: '#c92a2a',
    grupos: [
      { ref: 'P1', legenda: 'Borne verde de potência (4 parafusos)', pinos: [
        via('M−', 1, 'PTC — negativo'), via('M+', 1, 'PTC — positivo'),
        via('B+', 1, 'BD-POT saída 2'), via('B−', 1, 'BD-0V'),
      ]},
      { ref: 'J1', legenda: 'Barra de sinal 2 × 4 (8 pinos)', pinos: [
        via('R_PWM', 1, 'Mega D6'), via('L_PWM'),
        via('R_EN', 1, 'Mega D7'), via('L_EN', 1, 'Mega D7 — o MESMO pino'),
        via('R_IS', 1, 'PI-1 J1-2'), via('L_IS'),
        via('VCC', 1, 'BD-5V saída 5'), via('GND', 1, 'BD-0V'),
      ]},
    ],
  },
  {
    id: 'KA1', nome: 'KA1 — relé de selo', trilho: 2,
    x: 145, largura: 30, altura: 50, cor: '#7048e8',
    nota: 'Relé de 8 pinos com 2 contatos reversíveis, em base PTF08A.',
    grupos: [
      { ref: 'REL', legenda: 'Base PTF08A (8 terminais)', pinos: [
        via('A1', 1, 'cadeia de comando — S1/S0'), via('A2', 1, 'BD-0V'),
        via('11', 1, 'comum do contato 1'), via('12'), via('14', 1, 'selo da própria bobina'),
        via('21', 1, 'comum do contato 2'), via('22'), via('24', 1, 'habilita o KA2'),
      ]},
    ],
  },
  {
    id: 'KA2', nome: 'KA2 — relé de potência', trilho: 2,
    x: 182, largura: 30, altura: 50, cor: '#7048e8',
    nota: '⚠️ Contato declarado em CORRENTE CONTÍNUA, mínimo 10 A.',
    grupos: [
      { ref: 'REL', legenda: 'Base PTF08A (8 terminais)', pinos: [
        via('A1', 1, 'botão REARME (S2)'), via('A2', 1, 'BD-0V'),
        via('11', 1, 'entrada dos 24 V do prensa-cabo'), via('12'),
        via('14', 1, 'BD-POT entrada'),
        via('21'), via('22'), via('24'),
      ]},
    ],
    avisos: ['📌 Sobra um contato reversível inteiro (21-22-24) sem uso. Serve de '
           + 'reserva para um intertravamento futuro.'],
  },
  {
    id: 'FAN-BTS', nome: 'Cooler 40 mm dos BTS', trilho: 2,
    x: 225, largura: 42, altura: 42, cor: '#fab005',
    grupos: [
      { ref: 'FAN', legenda: '2 fios', pinos: [
        via('+', 1, 'BD-AUX saída 1'), via('−', 1, 'BD-0V'),
      ]},
    ],
  },

  /* ════════════ TRILHO 1 — DISTRIBUIÇÃO ════════════ */
  {
    id: 'BD-POT', nome: 'BD-POT — 24 V de potência', trilho: 1,
    x: 20, largura: 36, altura: 58, cor: '#c92a2a',
    nota: 'COMUTADO pelo KA2 — cai na emergência.',
    grupos: [
      { ref: 'IN', legenda: 'Entrada 4 mm² (1)', pinos: [via('IN', 1, 'KA2 · terminal 14')] },
      { ref: 'OUT', legenda: 'Saídas (4)', pinos: [
        via('O1', 1, 'BTS #1 · B+'), via('O2', 1, 'BTS #2 · B+'),
        via('O3', 1, 'PI-1 J1-11'), via('O4'),
      ]},
    ],
  },
  {
    id: 'BD-AUX', nome: 'BD-AUX — 12 V auxiliar', trilho: 1,
    x: 61, largura: 36, altura: 58, cor: '#fab005',
    grupos: [
      { ref: 'IN', legenda: 'Entrada 2,5 mm² (1)', pinos: [via('IN', 1, 'prensa-cabo do 12 V')] },
      { ref: 'OUT', legenda: 'Saídas (4)', pinos: [
        via('O1', 1, 'cooler dos BTS'), via('O2', 1, 'cooler da Peltier #1'),
        via('O3', 1, 'cooler da Peltier #2'), via('O4'),
      ]},
    ],
  },
  {
    id: 'BD-24V', nome: 'BD-24V — 24 V de serviços', trilho: 1,
    x: 102, largura: 45, altura: 58, cor: '#e8590c',
    nota: 'PERMANENTE — não cai na emergência.',
    grupos: [
      { ref: 'IN', legenda: 'Entrada 2,5 mm² (1)', pinos: [via('IN', 1, 'prensa-cabo dos 24 V de serviços')] },
      { ref: 'OUT', legenda: 'Saídas (6)', pinos: [
        via('O1', 1, 'DNLCB30 · VIN'), via('O2', 1, 'cadeia de comando · S0'),
        via('O3', 1, 'positivo comum dos 4 sinaleiros'),
        via('O4', 1, 'porta-fusíveis F-P1..F-P4 (4 posições de ensaio)'),
        via('O5', 1, 'PI-1 J1-10 — COM do ULN2803'), via('O6'),
      ]},
    ],
  },
  {
    id: 'BD-5V', nome: 'BD-5V — 5,10 V', trilho: 1,
    x: 152, largura: 54, altura: 58, cor: '#f08c00',
    grupos: [
      { ref: 'IN', legenda: 'Entrada 2,5 mm² (1)', pinos: [via('IN', 1, 'prensa-cabo dos 5 V')] },
      { ref: 'OUT', legenda: 'Saídas (8)', pinos: [
        via('O1', 1, 'Arduino · pino 5V'), via('O2', 1, 'tela ES3C28P'),
        via('O3', 1, 'RTC DS3231'), via('O4', 1, 'BTS #1 · VCC'),
        via('O5', 1, 'BTS #2 · VCC'), via('O6', 1, 'PI-1 J1-4'),
        via('O7', 1, '4 LEDs da maquete'), via('O8'),
      ]},
    ],
  },
  {
    id: 'BD-0V', nome: 'BD-0V — barra do 0 V (star ground)', trilho: 1,
    x: 211, largura: 100, altura: 58, cor: '#212529',
    nota: '⭐ O ÚNICO 0 V do projeto. Barra de 20 pontos, ou dois blocos de 8 ligados '
        + 'por ponte de 4 mm².',
    grupos: [
      { ref: 'IN', legenda: 'Entrada 10 mm² (1)', pinos: [via('IN', 1, 'retorno do padrão de entrada')] },
      { ref: 'R', legenda: 'Retornos (20 pontos)', pinos: [
        via('R1', 1, 'BTS #1 · B−'), via('R2', 1, 'BTS #2 · B−'),
        via('R3', 1, 'BTS #1 · GND lógica'), via('R4', 1, 'BTS #2 · GND lógica'),
        via('R5', 1, 'Arduino · GND'), via('R6', 1, 'PI-1 J1-9'),
        via('R7', 1, 'DNLCB30 · −'), via('R8', 1, 'RTC DS3231 · GND'),
        via('R9', 1, 'tela ES3C28P · GND'), via('R10', 1, 'conversor de nível · GND'),
        via('R11', 1, 'KA1 · A2'), via('R12', 1, 'KA2 · A2'),
        via('R13', 1, 'cooler dos BTS −'), via('R14', 1, 'cooler Peltier #1 −'),
        via('R15', 1, 'cooler Peltier #2 −'), via('R16', 1, 'LEDs da maquete −'),
        via('R17', 1, 'retorno das 4 posições de ensaio'),
        via('R18', 1, 'seletora LOCAL/REMOTO — contato para o 0 V'),
        via('R19'), via('R20'),
      ]},
    ],
    avisos: ['🔥 É o componente mais fácil de subdimensionar. Chegam 17 retornos + a '
           + 'entrada. Um bloco comum de 8 saídas NÃO serve.'],
  },
  {
    id: 'RTC', nome: 'RTC DS3231', trilho: 1,
    x: 316, largura: 35, altura: 40, cor: '#0ca678',
    nota: 'Ficou no trilho 1 porque I²C tolera distância. Só o cartão SD precisava '
        + 'estar perto do processador — e ele foi para dentro da tela.',
    grupos: [
      { ref: 'RTC', legenda: 'Pinos (6)', pinos: [
        via('VCC', 1, 'BD-5V saída 3'), via('GND', 1, 'BD-0V'),
        via('SDA', 1, 'Mega D20'), via('SCL', 1, 'Mega D21'),
        via('SQW'), via('32K'),
      ]},
    ],
  },

  /* ════════════ PORTA ════════════ */
  {
    id: 'HMI', nome: 'Tela ES3C28P (ESP32-S3)', porta: true,
    x: 48, y: 40, largura: 50, altura: 86, cor: '#1971c2',
    nota: '⚠️ Recorte da porta 47 × 61 mm, EM RETRATO. Reserve 25 mm livres atrás.',
    grupos: [
      { ref: 'UART', legenda: 'Conector UART (4)', pinos: [
        via('5V'), via('GND', 1, 'conversor · GND lado LV'),
        via('TXD · IO44', 1, 'conversor · RXI'), via('RXD · IO43', 1, 'conversor · TXO'),
      ]},
      { ref: 'I2C', legenda: 'Conector I²C (4)', pinos: [
        via('3V3', 1, 'conversor · LV'), via('GND'), via('SDA · IO16'), via('SCL · IO15'),
      ]},
      { ref: 'EXP', legenda: 'Expansão (4)', pinos: [
        via('IO2'), via('IO3'), via('IO14'), via('IO21'),
      ]},
      { ref: 'BAT', legenda: 'Bateria (2)', pinos: [via('BAT+'), via('BAT−')] },
      { ref: 'USB', legenda: 'Alimentação Type-C (2)', pinos: [
        via('VBUS', 1, 'BD-5V saída 2'), via('GND', 1, 'BD-0V'),
      ]},
    ],
    avisos: ['🔥 NÃO ligue o pino 5 V do conector UART. A wiki lista só Type-C e bateria '
           + 'como entradas de alimentação — esse pino é provavelmente saída.',
             '🔋 Deixe o conector BAT vazio. Lítio dentro de painel fechado é risco sem '
           + 'contrapartida.'],
  },
  {
    id: 'CONV', nome: 'Conversor de nível 2 canais', porta: true,
    x: 112, y: 46, largura: 15, altura: 13, cor: '#7048e8',
    nota: 'Monta atrás da tela, em espaçadores de nylon.',
    grupos: [
      { ref: 'HV', legenda: 'Lado alto — 5 V (6)', pinos: [
        via('TXI', 1, 'Mega D16'), via('HV', 1, 'BD-5V'), via('GND', 1, 'BD-0V'),
        via('RXO', 1, 'Mega D17'), via('TXI2'), via('RXO2'),
      ]},
      { ref: 'LV', legenda: 'Lado baixo — 3,3 V (6)', pinos: [
        via('TXO', 1, 'tela · RXD IO43'), via('LV', 1, 'tela · 3,3 V do conector I²C'),
        via('GND', 1, 'BD-0V'), via('RXI', 1, 'tela · TXD IO44'),
        via('TXO2'), via('RXI2'),
      ]},
    ],
    avisos: ['⚠️ Cada canal é UNIDIRECIONAL. TXI→TXO leva de cima para baixo, RXI→RXO de '
           + 'baixo para cima. Trocar não queima, mas não comunica.'],
  },
  ...['ENERGIZADO', 'RESFRIANDO', 'AQUECENDO', 'FALHA'].map((nome, i) => ({
    id: `H${i + 1}`, nome: `Sinaleiro H${i + 1} — ${nome}`, porta: true,
    x: 30 + i * 42, y: 175, largura: 30, altura: 30,
    cor: ['#2f9e44', '#1971c2', '#e8590c', '#c92a2a'][i],
    grupos: [{ ref: 'LMP', legenda: 'Sinaleiro 22 mm · 24 V (2)', pinos: [
      via('+', 1, 'BD-24V saída 3 — positivo comum'),
      via('−', 1, `PI-1 J2-${i + 4}`),
    ]}],
  })),
  {
    id: 'S1', nome: 'Botão START (verde)', porta: true,
    x: 35, y: 250, largura: 30, altura: 30, cor: '#2f9e44',
    grupos: [{ ref: 'NA', legenda: 'Bloco NA de 5 V (2)', pinos: [
      via('1', 1, 'BD-5V'), via('2', 1, 'Mega D22'),
    ]}],
  },
  {
    id: 'S2', nome: 'Botão REARME (azul)', porta: true,
    x: 80, y: 250, largura: 30, altura: 30, cor: '#1971c2',
    nota: 'Este é de 24 V: ele energiza a bobina do KA2 diretamente.',
    grupos: [{ ref: 'NA', legenda: 'Bloco NA de 24 V (2)', pinos: [
      via('1', 1, 'cadeia de comando'), via('2', 1, 'KA2 · A1'),
    ]}],
  },
  {
    id: 'S4', nome: 'Botão STOP (preto)', porta: true,
    x: 125, y: 250, largura: 30, altura: 30, cor: '#495057',
    grupos: [{ ref: 'NA', legenda: 'Bloco NA de 5 V (2)', pinos: [
      via('1', 1, 'BD-5V'), via('2', 1, 'Mega D23'),
    ]}],
  },
  {
    id: 'SA1', nome: 'Seletora LOCAL / REMOTO', porta: true,
    x: 170, y: 250, largura: 30, altura: 30, cor: '#212529',
    grupos: [{ ref: 'SEL', legenda: '2 posições · 1 bloco NA (2)', pinos: [
      via('1', 1, 'BD-0V'), via('2', 1, 'Mega D26'),
    ]}],
    avisos: ['✅ Confirmado no firmware: 1 pino só, o D26, com INPUT_PULLUP. '
           + 'Aberto = LOCAL, fechado para o 0 V = REMOTO.',
             '⭐ A inversão é proposital: fio rompido lê HIGH e cai em LOCAL. Uma falha '
           + 'de fiação nunca abre a máquina para comando pela internet.'],
  },
  {
    id: 'S0', nome: 'Cogumelo de EMERGÊNCIA', porta: true,
    x: 120, y: 330, largura: 44, altura: 44, cor: '#c92a2a',
    nota: 'Cogumelo com trava. Dois blocos NF: um corta a potência, o outro avisa o '
        + 'Arduino.',
    grupos: [{ ref: 'NF', legenda: '2 blocos NF (4)', pinos: [
      via('11', 1, 'BD-24V saída 2'), via('12', 1, 'cadeia → KA1 · A1'),
      via('21', 1, 'BD-5V'), via('22', 1, 'Mega D24'),
    ]}],
  },
];
