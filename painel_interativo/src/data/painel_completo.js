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

export const CAIXA = { largura: 500, altura: 500, profundidade: 200 };
/* ⚠️ A caixa CRESCEU de 400 para 500 mm de largura. Com o MV-1, a PI-2 e os
   porta-fusíveis, o trilho mais cheio passou a precisar de 356 mm — e num
   painel de 400 mm, descontadas as canaletas verticais e as margens, só
   sobram 312 mm de trilho útil. Não cabia. */
export const PLACA = { x: 12, y: 14, largura: 476, altura: 472 };
/* ── CANALETAS ────────────────────────────────────────────────────────
 * Os caminhos por onde os fios andam. A divisão POTÊNCIA × SINAL não é
 * organização: é o que impede o chaveamento dos BTS de sujar a leitura
 * dos sensores.
 */
export const CANALETAS = [
  { id: 'CH-topo', tipo: 'sinal',    x: 14, y: 22,  w: 472, h: 30, nome: 'superior' },
  { id: 'CH-3x2',  tipo: 'sinal',    x: 14, y: 180, w: 472, h: 28, nome: 'entre os trilhos 3 e 2' },
  { id: 'CH-2x1',  tipo: 'potencia', x: 14, y: 296, w: 472, h: 30, nome: 'entre os trilhos 2 e 1' },
  { id: 'CH-base', tipo: 'potencia', x: 14, y: 440, w: 472, h: 32, nome: 'inferior — entradas' },
  { id: 'CV-esq',  tipo: 'potencia', x: 14, y: 22,  w: 26,  h: 450, nome: 'vertical esquerda', vertical: true },
  { id: 'CV-dir',  tipo: 'sinal',    x: 460, y: 22, w: 26,  h: 450, nome: 'vertical direita', vertical: true },
];

export const REGRA_SEGREGACAO = {
  titulo: 'Por que potência e sinal não podem dividir canaleta',
  texto: 'Os BTS chaveiam 6 ampères a cada segundo. Cada chaveamento gera um pulso '
       + 'eletromagnético que o fio ao lado capta por indução — é o mesmo princípio de '
       + 'um transformador, só que indesejado. Num cabo de potência isso não faz '
       + 'diferença; num cabo que leva 0 a 5 V analógicos, vira leitura falsa.',
  quemSofre: [
    'IS dos BTS → PI-1: sinal analógico, o mais sensível do painel',
    '1-Wire do DS18B20: pulsos de microssegundos, corrompe fácil',
    'I²C dos INA219 e do RTC: o barramento trava se pegar ruído',
  ],
  quemPolui: [
    'Saída dos BTS para a Peltier e o PTC: 6 A chaveados',
    'Entrada de 24 V dos BTS: a corrente vem em pulsos, não contínua',
    'Bobinas dos relés KA1 e KA2: dão um pico ao desligar',
  ],
  regras: [
    'Canaleta VERMELHA só potência, canaleta AZUL só sinal. Nunca misture.',
    'Se um cabo de sinal precisar cruzar um de potência, cruze a 90°. Cruzamento '
    + 'perpendicular quase não acopla; paralelo lado a lado é o pior caso.',
    'Cabo de sinal longo e solto vira antena. Prenda-o na canaleta em vez de deixar '
    + 'sobra enrolada.',
    'O 0 V não separa: ele é único e vai por onde for mais curto.',
  ],
};

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
    id: 'MEGA', nome: 'Arduino Mega 2560 em adaptador de bornes', trilho: 3,
    x: 32, largura: 134, altura: 96, cor: '#0ca678',
    nota: 'O Mega encaixa no meio da placa adaptadora e cada pino dele vira um borne '
        + 'de parafuso nas bordas. São 82 bornes em FILEIRA ÚNICA por borda, um ao '
        + 'lado do outro — é o que obriga a placa a ser comprida.',
    aConferir: 'Dimensões estimadas em 134 × 96 mm a partir dos 35 bornes da borda de '
             + 'cima. Meça a placa quando ela chegar.',
    grupos: [
      { ref: 'TOPO', lado: 'cima', legenda: 'Borda de cima — 35 bornes', pinos: [
        via('D30'), via('D29', 1, '⭐ MV-1 canal 3 → ventoinhas de CIRCULAÇÃO'), via('D28', 1, '⭐ MV-1 canal 2 → ventoinha do PTC'), via('D27', 1, '⭐ MV-1 canal 1 → ventoinhas do RADIADOR'),
        via('D26', 1, 'Seletora LOCAL / REMOTO'), via('D25', 1, 'PI-1 J2-8 — vigia se os 24 V caíram'), via('D24', 1, 'Emergência — bloco NF de 5 V'), via('D23', 1, 'Botão STOP (NA, 5 V)'),
        via('D22', 1, 'Botão START (NA, 5 V)'), via('+5V', 1, 'BD-5V saída 1'), via('D21', 1, 'I²C SCL — o mesmo barramento'), via('D20', 1, 'I²C SDA — AM2315C (câmara), DS3231 e 4× INA219'),
        via('D19', 1, 'Serial1 RX ← DNLCB30/ESP32'), via('D18', 1, 'Serial1 TX → DNLCB30/ESP32'), via('D17', 1, 'Serial2 RX ← conversor ← tela'), via('D16', 1, 'Serial2 TX → conversor → tela'),
        via('D15'), via('D14'), via('D0'), via('D1'),
        via('D2', 1, 'PI-1 J2-3 — 1-Wire do DS18B20 do RADIADOR'), via('D3', 1, 'RPM da ventoinha do radiador #1'), via('D4', 1, 'BTS #1 · R_EN e L_EN juntos'), via('D5', 1, 'BTS #1 · RPWM (frio)'),
        via('D6', 1, 'BTS #2 · RPWM (quente)'), via('D7', 1, 'BTS #2 · R_EN e L_EN juntos'), via('D8'), via('D9', 1, 'PI-1 J1-5 → sinaleiro ENERGIZADO'),
        via('D10', 1, 'PI-1 J1-6 → sinaleiro RESFRIANDO'), via('D11', 1, 'PI-1 J1-7 → sinaleiro AQUECENDO'), via('D12', 1, 'PI-1 J1-8 → sinaleiro FALHA'), via('D13'),
        via('GND'), via('D21/SCL'), via('D20/SDA'),
      ]},
      { ref: 'ESQ', lado: 'esquerda', legenda: 'Borda esquerda — 13 bornes (D31–D43)', pinos: [
        via('D31'), via('D32'), via('D33'), via('D34'),
        via('D35'), via('D36'), via('D37'), via('D38'),
        via('D39'), via('D40'), via('D41'), via('D42'),
        via('D43'),
      ]},
      { ref: 'BASE', lado: 'baixo', legenda: 'Borda de baixo — 34 bornes', pinos: [
        via('D44'), via('D45'), via('D46'), via('D47'),
        via('D48'), via('D49'), via('D50'), via('D51'),
        via('D52'), via('D53'), via('A15'), via('A14'),
        via('A13'), via('A12'), via('A11'), via('A10'),
        via('A9'), via('A8', 1, 'RPM da ventoinha do radiador #2'), via('A7'), via('A6'),
        via('A5'), via('A4'), via('A3'), via('A2'),
        via('A1', 1, 'PI-1 J2-2 — corrente do BTS #2'), via('A0', 1, 'PI-1 J2-1 — corrente do BTS #1'), via('GND'), via('IOREF'),
        via('AREF'), via('RESET'), via('+3V3'), via('GND'),
        via('+5V', 1, 'BD-5V saída 1'), via('VIN'),
      ]},
    ],
    avisos: [
      '✅ Pinagem conferida na foto do adaptador: 35 bornes em cima, 13 à esquerda e '
      + '34 embaixo. O D21/SCL e o D20/SDA aparecem DUAS vezes na borda de cima — é o '
      + 'mesmo pino, espelhado, como no Mega original. Use um dos dois, não os dois.',
      '⚠️ Há 3 bornes GND (um em cima, dois embaixo) e 2 de +5V. O projeto usa 1 de '
      + 'cada. Os outros servem para sensores, sem precisar de régua extra.',
      '📌 D50–D53 ficaram LIVRES quando o cartão SD mudou para a tela ES3C28P.',
    ],
  },
  {
    id: 'PI1', nome: 'Placa de interface PI-1', trilho: 3,
    x: 171, largura: 70, altura: 62, cor: '#f08c00',
    nota: 'Caixa DIN de 4 módulos. J1 só entra, J2 só sai.',
    grupos: [
      { ref: 'J1', lado: 'cima', legenda: 'ENTRADAS (11 vias · KF301 5,08 mm)', pinos: [
        via('J1-1', 1, 'BTS #1 · R_IS'), via('J1-2', 1, 'BTS #2 · R_IS'),
        via('J1-3', 1, 'DS18B20 do radiador · DATA'), via('J1-4', 1, 'BD-5V saída 6'),
        via('J1-5', 1, 'Mega D9'), via('J1-6', 1, 'Mega D10'),
        via('J1-7', 1, 'Mega D11'), via('J1-8', 1, 'Mega D12'),
        via('J1-9', 1, 'BD-0V'), via('J1-10', 1, 'BD-24V saída 5'),
        via('J1-11', 1, 'BD-POT saída 3'),
      ]},
      { ref: 'J2', lado: 'baixo', legenda: 'SAÍDAS (8 vias · KF301 5,08 mm)', pinos: [
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
    x: 246, largura: 96, altura: 76, cor: '#1971c2',
    nota: 'Cada lado tem DUAS colunas de bornes: a de fora é 5 V e a de dentro é o '
        + 'GPIO. Ou seja, cada sinal já vem com a alimentação ao lado — é o que a '
        + 'serigrafia chama de "5V IO Level Converter". São 62 bornes ao todo.',
    grupos: [
      { ref: 'ESQ', lado: 'esquerda', linhas: 2,
        legenda: 'Lado esquerdo — 14 pares (5 V + sinal)', pinos: [
        via('5V'), via('GPIO15'),
        via('5V'), via('GPIO14'),
        via('5V'), via('GPIO16'),
        via('5V'), via('GPIO17'),
        via('5V'), via('GPIO5'),
        via('5V'), via('GPIO18'),
        via('5V'), via('GND'),
        via('5V'), via('GPIO19'),
        via('5V'), via('GPIO21'),
        via('5V'), via('GPI3 (RX0)', 1, 'Mega D18 — Serial1'),
        via('5V'), via('GPIO1 (TX0)', 1, 'Mega D19 — Serial1'),
        via('5V'), via('GPIO22'),
        via('5V'), via('GPIO23'),
        via('5V'), via('GND'),
      ]},
      { ref: 'DIR', lado: 'direita', linhas: 2,
        legenda: 'Lado direito — 14 pares (5 V + sinal)', pinos: [
        via('5V'), via('GND'),
        via('5V'), via('GPIO13'),
        via('5V'), via('GPIO14'),
        via('5V'), via('GPIO27'),
        via('5V'), via('GPIO26'),
        via('5V'), via('GPIO25'),
        via('5V'), via('GND'),
        via('5V'), via('GPIO33'),
        via('5V'), via('GPIO32'),
        via('5V'), via('GPI35'),
        via('5V'), via('GPI34'),
        via('5V'), via('GPI39 (VN)'),
        via('5V'), via('GPI36 (VP)'),
        via('5V'), via('GND'),
      ]},
      { ref: 'PWR', lado: 'baixo', legenda: 'Alimentação DC 7–30 V (2)', pinos: [
        via('+', 1, 'BD-24V saída 1'), via('−', 1, 'BD-0V'),
      ]},
    ],
    avisos: [
      '✅ Corrigido: eu tinha contado 28 bornes, mas são 62. Cada lado tem duas '
      + 'colunas — a externa entrega 5 V e a interna é o GPIO. Por isso ela se chama '
      + '"5V IO Level Converter": ela já eleva o 3,3 V do ESP32 para 5 V.',
      '⚠️ Os pinos 2 e 12 NÃO são trazidos para borne (está na nota do fabricante).',
      '⚠️ GPI3, 34, 35, 36(VP) e 39(VN) são SÓ ENTRADA.',
      '🔎 O diagrama do vendedor mostra GPIO14 nos DOIS lados, o que não pode estar '
      + 'certo. Confira com a placa em mãos antes de usar esse borne.',
      '📌 O 5 V dos bornes é limitado a 0,5 A no total. Serve para sensor, não para '
      + 'carga.',
    ],
  },

  /* ════════════ TRILHO 2 — POTÊNCIA ════════════ */
  {
    id: 'BTS1', nome: 'BTS7960 (IBT-2) #1 — Peltier', trilho: 2,
    x: 32, largura: 50, altura: 50, cor: '#c92a2a',
    grupos: [
      { ref: 'P1', lado: 'esquerda', legenda: 'Borne verde de potência (4 parafusos)', pinos: [
        via('M−', 1, 'Peltier — negativo'), via('M+', 1, 'Peltier — positivo'),
        via('B+', 1, 'BD-POT saída 1'), via('B−', 1, 'BD-0V'),
      ]},
      { ref: 'J1', lado: 'direita', linhas: 2, legenda: 'Barra de sinal 2 × 4 (8 pinos)', pinos: [
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
    x: 87, largura: 50, altura: 50, cor: '#c92a2a',
    grupos: [
      { ref: 'P1', lado: 'esquerda', legenda: 'Borne verde de potência (4 parafusos)', pinos: [
        via('M−', 1, 'PTC — negativo'), via('M+', 1, 'PTC — positivo'),
        via('B+', 1, 'BD-POT saída 2'), via('B−', 1, 'BD-0V'),
      ]},
      { ref: 'J1', lado: 'direita', linhas: 2, legenda: 'Barra de sinal 2 × 4 (8 pinos)', pinos: [
        via('R_PWM', 1, 'Mega D6'), via('L_PWM'),
        via('R_EN', 1, 'Mega D7'), via('L_EN', 1, 'Mega D7 — o MESMO pino'),
        via('R_IS', 1, 'PI-1 J1-2'), via('L_IS'),
        via('VCC', 1, 'BD-5V saída 5'), via('GND', 1, 'BD-0V'),
      ]},
    ],
  },
  {
    id: 'KA1', nome: 'KA1 — relé de selo', trilho: 2,
    x: 142, largura: 30, altura: 50, cor: '#7048e8',
    nota: 'Relé de 8 pinos com 2 contatos reversíveis, em base PTF08A.',
    grupos: [
      { ref: 'REL', lado: 'baixo', legenda: 'Base PTF08A (8 terminais)', pinos: [
        via('A1', 1, 'cadeia de comando — S1/S0'), via('A2', 1, 'BD-0V'),
        via('11', 1, 'comum do contato 1'), via('12'), via('14', 1, 'selo da própria bobina'),
        via('21', 1, 'comum do contato 2'), via('22'), via('24', 1, 'habilita o KA2'),
      ]},
    ],
  },
  {
    id: 'KA2', nome: 'KA2 — relé de potência', trilho: 2,
    x: 177, largura: 30, altura: 50, cor: '#7048e8',
    nota: '⚠️ Contato declarado em CORRENTE CONTÍNUA, mínimo 10 A.',
    grupos: [
      { ref: 'REL', lado: 'baixo', legenda: 'Base PTF08A (8 terminais)', pinos: [
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
    id: 'MV-1', nome: 'MV-1 — módulo MOSFET 4 canais (ventoinhas)', trilho: 2,
    x: 212, largura: 55, altura: 44, cor: '#0ca678',
    nota: 'Comanda as ventoinhas em três grupos, porque elas NÃO ligam todas juntas. '
        + 'MOSFET e não relé: ventoinha liga e desliga a cada ciclo de ensaio, e '
        + 'contato de relé tem vida contada em número de manobras.',
    grupos: [
      { ref: 'CTRL', lado: 'cima', legenda: 'Comando — vem do Arduino (5)', pinos: [
        { nome: 'IN1', usa: true, para: 'Mega D27 — grupo RADIADOR' },
        { nome: 'IN2', usa: true, para: 'Mega D28 — grupo PTC' },
        { nome: 'IN3', usa: true, para: 'Mega D29 — grupo CIRCULAÇÃO' },
        { nome: 'IN4' },
        { nome: 'GND', usa: true, para: 'BD-0V — referência do comando' },
      ]},
      { ref: 'PWR', lado: 'esquerda', legenda: 'Alimentação das cargas (2)', pinos: [
        { nome: 'V+', usa: true, para: 'BD-AUX saída 1 — 12 V' },
        { nome: 'V−', usa: true, para: 'BD-0V' },
      ]},
      { ref: 'OUT', lado: 'baixo', legenda: 'Saídas para as ventoinhas (8)', pinos: [
        { nome: 'O1+', usa: true, para: '2 ventoinhas do RADIADOR +' },
        { nome: 'O1−', usa: true, para: '2 ventoinhas do RADIADOR −' },
        { nome: 'O2+', usa: true, para: 'ventoinha do PTC +' },
        { nome: 'O2−', usa: true, para: 'ventoinha do PTC −' },
        { nome: 'O3+', usa: true, para: '2 frias da Peltier + 2 do duto  +' },
        { nome: 'O3−', usa: true, para: '2 frias da Peltier + 2 do duto  −' },
        { nome: 'O4+' }, { nome: 'O4−' },
      ]},
    ],
    avisos: [
      '⚠️ A VENTOINHA DO PTC PRECISA DE FIO PRÓPRIO. Se ela vier ligada nos mesmos '
      + 'dois fios do aquecedor, vai receber o PWM de 1 Hz do BTS #2 e ficar dando '
      + 'trancos uma vez por segundo. Separe os fios ao desembalar o PTC.',
      '🔥 A pós-ventilação depende deste módulo E do Arduino continuarem vivos depois '
      + 'do fim do ensaio. Os dois estão em barramentos PERMANENTES (BD-AUX e BD-5V), '
      + 'que não caem com a emergência — foi por isso que deu certo.',
    ],
  },

  {
    id: 'PI-2', nome: 'PI-2 — placa dos 4 sensores INA219', trilho: 3,
    x: 347, largura: 70, altura: 62, cor: '#ae3ec9',
    nota: 'Caixa DIN de 4 módulos com os 4 INA219 empilhados 2 × 2. Eles medem a '
        + 'corrente de cada posição de ensaio — é como o sistema descobre que uma '
        + 'placa morreu.',
    grupos: [
      { ref: 'J1', lado: 'cima', legenda: 'Entrada — 24 V fusíveis (5)', pinos: [
        { nome: 'IN1', usa: true, para: 'F-P1 — posição 1' },
        { nome: 'IN2', usa: true, para: 'F-P2 — posição 2' },
        { nome: 'IN3', usa: true, para: 'F-P3 — posição 3' },
        { nome: 'IN4', usa: true, para: 'F-P4 — posição 4' },
        { nome: '0V', usa: true, para: 'BD-0V' },
      ]},
      { ref: 'J2', lado: 'baixo', legenda: 'Saída — vai para a câmara (5)', pinos: [
        { nome: 'P1', usa: true, para: 'DUT da posição 1' },
        { nome: 'P2', usa: true, para: 'DUT da posição 2' },
        { nome: 'P3', usa: true, para: 'DUT da posição 3' },
        { nome: 'P4', usa: true, para: 'DUT da posição 4' },
        { nome: '0V', usa: true, para: 'retorno comum dos 4 DUTs' },
      ]},
      { ref: 'I2C', lado: 'direita', legenda: 'Barramento I²C (4)', pinos: [
        { nome: 'VCC', usa: true, para: 'BD-5V saída 8' },
        { nome: 'GND', usa: true, para: 'BD-0V' },
        { nome: 'SDA', usa: true, para: 'Mega D20' },
        { nome: 'SCL', usa: true, para: 'Mega D21' },
      ]},
    ],
    avisos: [
      '⭐ Os 4 INA219 usam endereços I²C diferentes (0x40, 0x41, 0x44, 0x45), '
      + 'escolhidos por jumper em cada módulo. É o que permite os quatro conviverem '
      + 'no mesmo par de fios.',
      '⚠️ Configure o endereço de cada um ANTES de fechar a caixa — depois de montado '
      + 'não dá para alcançar os jumpers.',
      '🔌 Só 5 fios entram na câmara: os 4 positivos das posições e um retorno comum.',
    ],
  },
  {
    id: 'F-P', nome: 'F-P1..F-P4 — fusíveis das posições de ensaio', trilho: 2,
    x: 272, largura: 72, altura: 46, cor: '#fab005',
    nota: '2 porta-fusíveis de 2 vias COM INTERRUPTOR. O interruptor é proposital: é '
        + 'com ele que você desliga um dispositivo na frente da banca e mostra o '
        + 'sistema detectando a falha.',
    grupos: [
      { ref: 'IN', lado: 'cima', legenda: 'Entrada comum (2)', pinos: [
        { nome: 'V+', usa: true, para: 'BD-24V saída 4' },
        { nome: 'V+', usa: true, para: 'ponte para o 2º porta-fusível' },
      ]},
      { ref: 'OUT', lado: 'baixo', legenda: 'Saídas fusíveis 500 mA (4)', pinos: [
        { nome: 'F-P1', usa: true, para: 'PI-2 · IN1' },
        { nome: 'F-P2', usa: true, para: 'PI-2 · IN2' },
        { nome: 'F-P3', usa: true, para: 'PI-2 · IN3' },
        { nome: 'F-P4', usa: true, para: 'PI-2 · IN4' },
      ]},
    ],
    avisos: [
      '⭐ O INTERRUPTOR É A DEMONSTRAÇÃO. Sem ele você teria que arrancar um fio para '
      + 'simular a falha de um dispositivo. Com ele, basta desligar a chave: o INA219 '
      + 'vê a corrente cair a zero e o sistema acusa em segundos.',
      '📌 Fusível de 500 mA. O DUT consome ~127 mA, então o fusível é quase 4× a carga '
      + '— ele existe para curto, não para sobrecarga leve.',
    ],
  },

  /* ════════════ TRILHO 1 — DISTRIBUIÇÃO ════════════ */
  {
    id: 'BD-POT', nome: 'BD-POT — 24 V de potência', trilho: 1,
    x: 32, largura: 36, altura: 58, cor: '#c92a2a',
    nota: 'COMUTADO pelo KA2 — cai na emergência.',
    grupos: [
      { ref: 'IN', lado: 'cima', legenda: 'Entrada 4 mm² (1)', pinos: [via('IN', 1, 'KA2 · terminal 14')] },
      { ref: 'OUT', lado: 'baixo', legenda: 'Saídas (4)', pinos: [
        via('O1', 1, 'BTS #1 · B+'), via('O2', 1, 'BTS #2 · B+'),
        via('O3', 1, 'PI-1 J1-11'), via('O4'),
      ]},
    ],
  },
  {
    id: 'BD-AUX', nome: 'BD-AUX — 12 V auxiliar', trilho: 1,
    x: 73, largura: 36, altura: 58, cor: '#fab005',
    grupos: [
      { ref: 'IN', lado: 'cima', legenda: 'Entrada 2,5 mm² (1)', pinos: [via('IN', 1, 'prensa-cabo do 12 V')] },
      { ref: 'OUT', lado: 'baixo', legenda: 'Saídas (4)', pinos: [
        via('O1', 1, 'MV-1 · V+ — alimenta os 3 grupos de ventoinha'),
        via('O2'), via('O3'), via('O4'),
      ]},
    ],
  },
  {
    id: 'BD-24V', nome: 'BD-24V — 24 V de serviços', trilho: 1,
    x: 114, largura: 45, altura: 58, cor: '#e8590c',
    nota: 'PERMANENTE — não cai na emergência.',
    grupos: [
      { ref: 'IN', lado: 'cima', legenda: 'Entrada 2,5 mm² (1)', pinos: [via('IN', 1, 'prensa-cabo dos 24 V de serviços')] },
      { ref: 'OUT', lado: 'baixo', legenda: 'Saídas (6)', pinos: [
        via('O1', 1, 'DNLCB30 · VIN'), via('O2', 1, 'cadeia de comando · S0'),
        via('O3', 1, 'positivo comum dos 4 sinaleiros'),
        via('O4', 1, 'F-P1..F-P4 — entrada dos porta-fusíveis'),
        via('O5', 1, 'PI-1 J1-10 — COM do ULN2803'), via('O6'),
      ]},
    ],
  },
  {
    id: 'BD-5V', nome: 'BD-5V — 5,10 V', trilho: 1,
    x: 164, largura: 66, altura: 58, cor: '#f08c00',
    grupos: [
      { ref: 'IN', lado: 'cima', legenda: 'Entrada 2,5 mm² (1)', pinos: [via('IN', 1, 'prensa-cabo dos 5 V')] },
      { ref: 'OUT', lado: 'baixo', legenda: 'Saídas (10) ⬆', pinos: [
        via('O1', 1, 'Arduino · pino 5V'), via('O2', 1, 'tela ES3C28P'),
        via('O3', 1, 'RTC DS3231'), via('O4', 1, 'BTS #1 · VCC'),
        via('O5', 1, 'BTS #2 · VCC'), via('O6', 1, 'PI-1 J1-4'),
        via('O7', 1, '4 LEDs da maquete'),
        via('O8', 1, 'PI-2 — VCC dos 4 INA219'), via('O9'), via('O10'),
      ]},
    ],
  },
  {
    id: 'BD-0V', nome: 'BD-0V — barra do 0 V (star ground)', trilho: 1,
    x: 235, largura: 100, altura: 58, cor: '#212529',
    nota: '⭐ O ÚNICO 0 V do projeto. Barra de 20 pontos, ou dois blocos de 8 ligados '
        + 'por ponte de 4 mm².',
    grupos: [
      { ref: 'IN', lado: 'cima', legenda: 'Entrada 10 mm² (1)', pinos: [via('IN', 1, 'retorno do padrão de entrada')] },
      { ref: 'R', lado: 'baixo', linhas: 2, legenda: 'Retornos (20 pontos)', pinos: [
        via('R1', 1, 'BTS #1 · B−'), via('R2', 1, 'BTS #2 · B−'),
        via('R3', 1, 'BTS #1 · GND lógica'), via('R4', 1, 'BTS #2 · GND lógica'),
        via('R5', 1, 'Arduino · GND'), via('R6', 1, 'PI-1 J1-9'),
        via('R7', 1, 'DNLCB30 · −'), via('R8', 1, 'RTC DS3231 · GND'),
        via('R9', 1, 'tela ES3C28P · GND'), via('R10', 1, 'conversor de nível · GND'),
        via('R11', 1, 'KA1 · A2'), via('R12', 1, 'KA2 · A2'),
        via('R13', 1, 'MV-1 · V− (potência das ventoinhas)'),
        via('R14', 1, 'MV-1 · GND (referência do comando)'),
        via('R15'), via('R16', 1, 'LEDs da maquete −'),
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
    x: 340, largura: 35, altura: 40, cor: '#0ca678',
    nota: 'Ficou no trilho 1 porque I²C tolera distância. Só o cartão SD precisava '
        + 'estar perto do processador — e ele foi para dentro da tela.',
    grupos: [
      { ref: 'RTC', lado: 'baixo', legenda: 'Pinos (6)', pinos: [
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
      { ref: 'UART', lado: 'baixo', legenda: 'Conector UART (4)', pinos: [
        via('5V'), via('GND', 1, 'conversor · GND lado LV'),
        via('TXD · IO44', 1, 'conversor · RXI'), via('RXD · IO43', 1, 'conversor · TXO'),
      ]},
      { ref: 'I2C', lado: 'cima', legenda: 'Conector I²C (4)', pinos: [
        via('3V3', 1, 'conversor · LV'), via('GND'), via('SDA · IO16'), via('SCL · IO15'),
      ]},
      { ref: 'EXP', lado: 'cima', legenda: 'Expansão (4)', pinos: [
        via('IO2'), via('IO3'), via('IO14'), via('IO21'),
      ]},
      { ref: 'BAT', lado: 'baixo', legenda: 'Bateria (2)', pinos: [via('BAT+'), via('BAT−')] },
      { ref: 'USB', lado: 'esquerda', legenda: 'Alimentação Type-C (2)', pinos: [
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
    x: 112, y: 44, largura: 34, altura: 22, cor: '#7048e8',
    escala: 'ampliado — a placa real tem 14,7 × 12,7 mm',
    nota: 'Monta atrás da tela, em espaçadores de nylon. ⚠️ No desenho ele está '
        + 'ampliado: a placa real tem 14,7 × 12,7 mm e os pinos ficariam menores '
        + 'que a letra.',
    grupos: [
      { ref: 'HV', lado: 'cima', legenda: 'Lado alto — 5 V (6)', pinos: [
        via('TXI', 1, 'Mega D16'), via('HV', 1, 'BD-5V'), via('GND', 1, 'BD-0V'),
        via('RXO', 1, 'Mega D17'), via('TXI2'), via('RXO2'),
      ]},
      { ref: 'LV', lado: 'baixo', legenda: 'Lado baixo — 3,3 V (6)', pinos: [
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
    grupos: [{ ref: 'LMP', lado: 'baixo', legenda: 'Sinaleiro 22 mm · 24 V (2)', pinos: [
      via('+', 1, 'BD-24V saída 3 — positivo comum'),
      via('−', 1, `PI-1 J2-${i + 4}`),
    ]}],
  })),
  {
    id: 'S1', nome: 'Botão START (verde)', porta: true,
    x: 35, y: 250, largura: 30, altura: 30, cor: '#2f9e44',
    grupos: [{ ref: 'NA', lado: 'baixo', legenda: 'Bloco NA de 5 V (2)', pinos: [
      via('1', 1, 'BD-5V'), via('2', 1, 'Mega D22'),
    ]}],
  },
  {
    id: 'S2', nome: 'Botão REARME (azul)', porta: true,
    x: 80, y: 250, largura: 30, altura: 30, cor: '#1971c2',
    nota: 'Este é de 24 V: ele energiza a bobina do KA2 diretamente.',
    grupos: [{ ref: 'NA', lado: 'baixo', legenda: 'Bloco NA de 24 V (2)', pinos: [
      via('1', 1, 'cadeia de comando'), via('2', 1, 'KA2 · A1'),
    ]}],
  },
  {
    id: 'S3', nome: 'Botão STOP (preto)', porta: true,
    x: 125, y: 250, largura: 30, altura: 30, cor: '#495057',
    grupos: [{ ref: 'NA', lado: 'baixo', legenda: 'Bloco NA de 5 V (2)', pinos: [
      via('1', 1, 'BD-5V'), via('2', 1, 'Mega D23'),
    ]}],
  },
  {
    id: 'SA1', nome: 'Seletora LOCAL / REMOTO', porta: true,
    x: 170, y: 250, largura: 30, altura: 30, cor: '#212529',
    grupos: [{ ref: 'SEL', lado: 'baixo', legenda: '2 posições · 1 bloco NA (2)', pinos: [
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
    grupos: [{ ref: 'NF', lado: 'baixo', legenda: '2 blocos NF (4)', pinos: [
      via('11', 1, 'BD-24V saída 2'), via('12', 1, 'cadeia → KA1 · A1'),
      via('21', 1, 'BD-5V'), via('22', 1, 'Mega D24'),
    ]}],
  },
];
