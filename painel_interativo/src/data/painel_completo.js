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
  { id: 'CH-2x1',  tipo: 'potencia', x: 14, y: 302, w: 472, h: 30, nome: 'entre os trilhos 2 e 1' },
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
  /* ⭐ TRÊS CLASSES, NÃO DUAS. A divisão binária não sabe onde pôr um
     trilho de 5 V: ele não POLUI (não chaveia nada) e não SOFRE (é de
     baixa impedância, com capacitor de desacoplamento em cada ponta).
     Forçá-lo numa das duas caixas gera rota impossível — foi o que o
     validador da fiação mostrou ao tentar levar 5 V do trilho 1 ao 3. */
  classes: [
    { id: 'potencia', nome: 'POLUI', cor: 'vermelha',
      quem: 'saída dos BTS, entrada de 24 V deles, bobinas dos relés',
      onde: 'só canaleta de potência' },
    { id: 'sinal', nome: 'SOFRE', cor: 'azul',
      quem: 'IS analógico, 1-Wire, I²C, SIG do mux, retornos das posições',
      onde: 'só canaleta de sinal' },
    { id: 'alim', nome: 'NEM UM NEM OUTRO', cor: 'qualquer',
      quem: 'trilhos de 5 V e 12 V, amostras de 24 V para divisor, COM do ULN',
      onde: 'a canaleta que der o caminho mais curto — cruzando a 90° quando '
          + 'precisar trocar de lado' },
    { id: 'comum', nome: 'O 0 V', cor: 'qualquer',
      quem: 'todos os retornos', onde: 'por onde for mais curto — ele é único' },
  ],
  regras: [
    'Canaleta VERMELHA só o que POLUI, canaleta AZUL só o que SOFRE.',
    'Alimentação limpa e o 0 V andam por qualquer uma — o que importa é '
    + 'não deixar o que polui ao lado do que sofre.',
    'Se um cabo de sinal precisar cruzar um de potência, cruze a 90°. Cruzamento '
    + 'perpendicular quase não acopla; paralelo lado a lado é o pior caso.',
    'Cabo de sinal longo e solto vira antena. Prenda-o na canaleta em vez de deixar '
    + 'sobra enrolada.',
    'O 0 V não separa: ele é único e vai por onde for mais curto.',
  ],
};

/* ── CANALETAS DA PORTA ───────────────────────────────────────────────
 * A porta tem tantos fios quanto a placa de montagem: 4 sinaleiros, 4
 * comandos, a tela e o conversor. Sem canaleta viram um chumaço solto
 * que fica preso na dobradiça.
 *
 * ⭐ A BORDA DA DOBRADIÇA É A ESQUERDA DO DESENHO. A porta é articulada
 * do lado direito do painel; desenhada "vista de dentro", deitada ao
 * lado do painel, a dobradiça cai na borda esquerda do desenho. É por
 * ela que TODOS os fios cruzam para dentro do painel.
 */
export const CANALETAS_PORTA = [
  { id: 'CP-topo', tipo: 'sinal',    x: 38, y: 10,  w: 200, h: 24, nome: 'superior' },
  { id: 'CP-1x2',  tipo: 'sinal',    x: 38, y: 136, w: 200, h: 26, nome: 'entre a tela e os sinaleiros' },
  { id: 'CP-2x3',  tipo: 'sinal',    x: 38, y: 214, w: 200, h: 26, nome: 'entre os sinaleiros e os comandos' },
  { id: 'CP-3x4',  tipo: 'potencia', x: 38, y: 292, w: 200, h: 26, nome: 'entre os comandos e a emergência' },
  { id: 'CP-base', tipo: 'potencia', x: 38, y: 384, w: 200, h: 26, nome: 'inferior' },
  /* ⭐ DUAS verticais na dobradiça, não uma. A porta carrega os dois
     mundos: o cogumelo, o STOP e os sinaleiros são 24 V de comando —
     e bobina de relé é POLUIDORA, dá pico ao desligar. A tela, os
     botões de 5 V e a seletora são sinal. Cada um na sua, e duas
     passagens flexíveis separadas. */
  { id: 'CP-vsin', tipo: 'sinal',    x: 2,  y: 10, w: 18, h: 400,
    nome: 'vertical da DOBRADIÇA — sinal', vertical: true, dobradica: true },
  { id: 'CP-vpot', tipo: 'potencia', x: 22, y: 10, w: 18, h: 400,
    nome: 'vertical da DOBRADIÇA — potência', vertical: true, dobradica: true },
];

/* ── O QUE FICA NAS LATERAIS DA CAIXA ─────────────────────────────────
 * Nem tudo mora na placa de montagem ou na porta. A antena é o caso
 * clássico: ela PRECISA sair da caixa metálica.
 */
export const LATERAIS = [
  {
    id: 'ANT', nome: 'Antena Wi-Fi 3 dBi + conector SMA de painel',
    face: 'direita', x: 100, y: 430, furo: 6.5, cor: '#e8590c',
    porque: '🔥 A caixa do painel é uma GAIOLA DE FARADAY. Com o ESP32 lá dentro e a '
          + 'antena junto dele, o sinal de Wi-Fi fica preso: o alcance despenca e o '
          + 'MQTT cai sozinho no meio do ensaio. A antena TEM que ficar do lado de fora.',
    onde: 'Lateral DIREITA, a 100 mm da traseira e 430 mm de altura — o mais alto '
        + 'possível, para não ser obstruída pela bancada nem pelas pessoas.',
    avisos: [
      '⚠️ NA LATERAL, NUNCA NA PORTA. A porta articula, e o coaxial teria que dobrar a '
      + 'cada abertura. Cabo coaxial não suporta ciclos de flexão — ele rompe por dentro '
      + 'e o defeito fica intermitente.',
      '🔥 NUNCA PASSE O COAXIAL POR PRENSA-CABO. O pigtail IPEX é de 1,13 mm: o aperto '
      + 'esmaga o dielétrico, a impedância deixa de ser 50 Ω e o alcance despenca. O '
      + 'conector SMA de painel existe exatamente para isso — ele é preso mecanicamente '
      + 'na chapa e não faz esforço no cabo.',
      '📌 O ESP32 tem que ser o WROOM-32U, que traz conector IPEX. O WROOM-32 comum só '
      + 'tem antena de placa e NÃO aceita antena externa.',
      '⭐ O DNLCB30 está no trilho 2, do lado direito — o pigtail de 30 cm chega folgado.',
    ],
  },
];

/* ⭐ FOLGA LATERAL ENTRE COMPONENTES.
   Os BTS, o MV-1 e o DNLCB30 têm bornes nas LATERAIS, e o fio precisa
   contornar o componente por fora para entrar neles. Sem folga o fio
   sobe rente à borda e some atrás da peça — no desenho e na bancada.
   8 mm entre vizinhos no trilho 2, que é onde estão esses três. */
export const FOLGA_LATERAL = 8;

/* ⭐ ATÉ ONDE O TRILHO DIN VAI.
   Ele NÃO atravessa a placa inteira: é cortado antes das canaletas
   verticais. Trilho por cima de canaleta é o que faz o fio parecer
   passar por baixo dele — e na bancada seria pior, porque a tampa da
   canaleta não fecharia. */
export const TRILHO_X0 = 42;    // logo depois da CV-esq (14..40)
export const TRILHO_X1 = 458;   // logo antes da CV-dir (460..486)

export const TRILHOS = [
  { n: 3, y: 125, nome: 'TRILHO 3 — Controle' },
  { n: 2, y: 255, nome: 'TRILHO 2 — Potência' },
  { n: 1, y: 385, nome: 'TRILHO 1 — Distribuição' },
];

/* ── atalhos para montar listas repetitivas ──────────────────────── */
const via = (nome, usa, para) => ({ nome, ...(usa ? { usa: true, para } : {}) });

/* ⭐ RELÉ: o nome IEC e o número do pino da base são coisas diferentes.
   O desenho fala 'KA1-14'; a base PTF08A tem gravado '5'. Guardar os
   dois no modelo é o que impede a troca na hora de parafusar.

     ⚠️ AS FILEIRAS SÃO DE FÁBRICA, não são escolha do projeto. O relé
     de 8 pinos (MY2 / LY2 / JQX-13F) sai assim, e não há como remontar:

        FILEIRA DE CIMA     4      8      12     14
                            NF2    NA2   COM2   bobina
        nome IEC            22     24     21     A2

        FILEIRA DE BAIXO    1      5      9      13
                            NF1    NA1   COM1   bobina
        nome IEC            12     14     11     A1

     A bobina fica na DIREITA, com uma perna em cada fileira. */
const PINO_BASE = { A1: 13, A2: 14, 11: 9, 12: 1, 14: 5, 21: 12, 22: 4, 24: 8 };
const rele = (nome, usa, para) => ({
  ...via(nome, usa, para), pino: PINO_BASE[nome],
});
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
        via('D22', 1, 'Botão START S1-14 — NA para o 0 V'), via('+5V', 1, 'BD-5V saída 1'), via('D21', 1, 'I²C SCL — o mesmo barramento'), via('D20', 1, 'I²C SDA — AM2315C (câmara), DS3231 e 2× INA219'),
        via('D19', 1, 'Serial1 RX ← DNLCB30/ESP32'), via('D18', 1, 'Serial1 TX → DNLCB30/ESP32'), via('D17', 1, 'Serial2 RX ← conversor ← tela'), via('D16', 1, 'Serial2 TX → conversor → tela'),
        via('D15'), via('D14'), via('D0'), via('D1'),
        via('D2', 1, 'PI-1 J2-3 — 1-Wire do DS18B20 do RADIADOR'), via('D3', 1, 'RPM da ventoinha do radiador #1'), via('D4', 1, 'BTS #1 · R_EN e L_EN juntos'), via('D5', 1, 'BTS #1 · RPWM (frio)'),
        via('D6', 1, 'BTS #2 · RPWM (quente)'), via('D7', 1, 'BTS #2 · R_EN e L_EN juntos'), via('D8'), via('D9', 1, 'PI-1 J1-5 → sinaleiro ENERGIZADO'),
        via('D10', 1, 'PI-1 J1-6 → sinaleiro RESFRIANDO'), via('D11', 1, 'PI-1 J1-7 → sinaleiro AQUECENDO'), via('D12', 1, 'PI-1 J1-8 → sinaleiro FALHA'), via('D13'),
        via('GND1'), via('D21/SCL'), via('D20/SDA'),
      ]},
      { ref: 'ESQ', lado: 'esquerda', legenda: 'Borda esquerda — 13 bornes (D31–D43)', pinos: [
        via('D31', 1, 'PI-2 · S0 — seleção do canal do mux'),
        via('D32', 1, 'PI-2 · S1'),
        via('D33', 1, 'PI-2 · S2'),
        via('D34', 1, 'PI-2 · S3'),
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
        via('A5'), via('A4'), via('A3'),
        via('A2', 1, '⭐ PI-2 · SIG — os 16 canais entram por aqui'),
        via('A1', 1, 'PI-1 J2-2 — corrente do BTS #2'), via('A0', 1, 'PI-1 J2-1 — corrente do BTS #1'), via('GND2'), via('IOREF'),
        via('AREF'), via('RESET'), via('+3V3'),
        via('GND3', 1, '⭐ BD-0V · R5 — o retorno da alimentação, no bloco POWER'),
        via('+5V', 1, 'BD-5V saída 1'), via('VIN'),
      ]},
    ],
    avisos: [
      '✅ Pinagem conferida na foto do adaptador: 35 bornes em cima, 13 à esquerda e '
      + '34 embaixo. O D21/SCL e o D20/SDA aparecem DUAS vezes na borda de cima — é o '
      + 'mesmo pino, espelhado, como no Mega original. Use um dos dois, não os dois.',
      '⚠️ Há 3 bornes GND — GND1 no topo, GND2 junto do A0 e GND3 no bloco POWER — e 2 de +5V. Use o GND3, que fica ao lado do +5V: ida e volta no mesmo bloco. O projeto usa 1 de '
      + 'cada. Os outros servem para sensores, sem precisar de régua extra.',
      '📌 D50–D53 ficaram LIVRES quando o cartão SD mudou para a tela ES3C28P.',
    ],
  },
  {
    id: 'PI1', nome: 'Placa de interface PI-1', trilho: 3,
    x: 176, largura: 105, altura: 62, cor: '#f08c00',
    nota: 'Caixa DIN de 6 módulos. A placa cresceu para 86 × 74 mm — a largura '
        + 'extra é o que dá espaço para os fios correrem em canais separados por '
        + 'baixo, em vez de amontoados. J1 só entra, J2 só sai.',
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
    id: 'ESP32', nome: 'DNLCB30 + ESP32 30 pinos', trilho: 2,
    x: 268, largura: 96, altura: 84, cor: '#1971c2',
    nota: 'Os nomes são os da serigrafia da borda externa, exatamente como estão '
        + 'impressos na placa. Cada bloco tem 15 bornes em FILEIRA ÚNICA — o "5V" é o '
        + 'primeiro borne de cada um, não uma coluna à parte.',
    grupos: [
      { ref: 'H1', lado: 'esquerda', legenda: 'Bloco esquerdo — 15 bornes', pinos: [
        { nome: '5V' },
        { nome: 'D15' },
        { nome: 'D4' },
        { nome: 'D16' },
        { nome: 'D17' },
        { nome: 'D5' },
        { nome: 'D18' },
        { nome: 'GND' },
        { nome: 'D19' },
        { nome: 'D21' },
        { nome: 'RX0', usa: true, para: 'Mega D18 — Serial1 (só entrada, com pull-up)' },
        { nome: 'TX0', usa: true, para: 'Mega D19 — Serial1' },
        { nome: 'D22' },
        { nome: 'D23' },
        { nome: 'GND' },
      ]},
      { ref: 'H2', lado: 'direita', legenda: 'Bloco direito — 15 bornes', pinos: [
        { nome: '5V' },
        { nome: 'GND' },
        { nome: 'D13' },
        { nome: 'D14' },
        { nome: 'D27' },
        { nome: 'D26' },
        { nome: 'D25' },
        { nome: 'GND' },
        { nome: 'D33' },
        { nome: 'D32' },
        { nome: 'D35' },
        { nome: 'D34' },
        { nome: 'VN' },
        { nome: 'VP' },
        { nome: 'GND' },
      ]},
      { ref: 'PWR', lado: 'baixo', legenda: 'Alimentação DC 7–30 V (2)', pinos: [
        via('+', 1, 'BD-24V saída 1'), via('−', 1, 'BD-0V'),
      ]},
    ],
    avisos: [
      '✅ Corrigido pela serigrafia da borda externa. Eu tinha desenhado duas colunas '
      + '(5 V de fora, sinal de dentro) e não é isso: é UMA fileira de 15 bornes, e o '
      + '"5V" é simplesmente o primeiro deles. O que parecia segunda coluna nas fotos '
      + 'é o furo de entrada do fio, que fica ao lado do parafuso.',
      '✅ E a nota 1 do fabricante estava certa: NÃO existe borne D12. O bloco direito '
      + 'vai de D13 direto para D14. Eu tinha lido D12 no esquemático, mas aquilo era '
      + 'o pino do soquete do ESP32, não o borne.',
      '⚠️ RX0, D34, D35, VN e VP são SÓ ENTRADA. E o RX0 usado como entrada precisa de '
      + 'pull-up (nota 3 do fabricante).',
      '🚨 SÃO CONVERSORES DIGITAIS (três TXS0108E no esquemático). É a nota 4 do '
      + 'fabricante: sinal ANALÓGICO que passe por esses bornes sai deformado. Para ler '
      + 'sensor analógico, ligue direto no pino do ESP32.',
      '📌 O 5V de cada bloco entrega no máximo 0,5 A. Serve para sensor, não para carga.',
      '📌 O projeto usa 4 bornes de 32: RX0, TX0 e os dois de alimentação.',
    ],
  },

  {
    id: 'PI-2', nome: 'PI-2 — medição de corrente das posições', trilho: 3,
    x: 291, largura: 105, altura: 62, cor: '#ae3ec9',
    nota: 'Caixa DIN de 6 módulos, igual à PI-1 — as duas saem da MESMA placa de 9 × 15 cm cortada ao meio. Dentro dela ficam soldados o multiplexador, os '
        + 'resistores shunt e o INA219 de referência. Os bornes abaixo são os FIOS que '
        + 'chegam e saem — não os pinos dos componentes.',
    interno: '1 × módulo CD74HC4067 (16 canais) · 2 × shunt 47 Ω 1% · 1 × INA219 '
           + '(referência) · o pino EN do mux vai soldado ao 0 V dentro da placa. '
           + '🔧 Clique no botão acima para ver o desenho furo por furo.',
    grupos: [
      { ref: 'J1', lado: 'cima', legenda: 'RETORNOS que voltam da câmara (4 vias)', pinos: [
        { nome: 'RET-1', usa: true, para: 'volta do DUT da posição 1 — o shunt dela está aqui dentro' },
        { nome: 'RET-2', usa: true, para: 'volta do DUT da posição 2' },
        { nome: 'RET-3' }, { nome: 'RET-4' },
      ]},
      { ref: 'J2', lado: 'baixo', legenda: 'Alimentação (2 vias) — divide a borda de baixo com o J3', pinos: [
        { nome: '0V', usa: true, para: 'BD-0V — o comum, DEPOIS dos shunts' },
        { nome: '+5V', usa: true, para: 'BD-5V saída 8 — alimenta o mux e o INA219' },
      ]},
      { ref: 'J3', lado: 'baixo', legenda: 'Sinais para o Arduino (7 vias)', pinos: [
        { nome: 'S0', usa: true, para: 'Mega D31 — seleção de canal, bit 0' },
        { nome: 'S1', usa: true, para: 'Mega D32 — bit 1' },
        { nome: 'S2', usa: true, para: 'Mega D33 — bit 2' },
        { nome: 'S3', usa: true, para: 'Mega D34 — bit 3' },
        { nome: 'SIG', usa: true, para: 'Mega A2 — a leitura dos 16 canais sai por aqui' },
        { nome: 'SDA', usa: true, para: 'Mega D20 — só do INA219 de referência' },
        { nome: 'SCL', usa: true, para: 'Mega D21' },
      ]},
    ],
    avisos: [
      '🔥 O QUE CHEGA AQUI É O RETORNO, NÃO O POSITIVO. O shunt fica no lado de baixo, '
      + 'entre o retorno do DUT e o 0 V — só assim a tensão sobre ele fica referenciada '
      + 'ao 0 V e o mux consegue lê-la. O positivo vai do fusível direto para a câmara e '
      + 'nunca passa por esta placa.',
      '🔌 SÃO 4 FIOS PARA A CÂMARA: 2 positivos (dos fusíveis) e 2 retornos INDIVIDUAIS. '
      + 'Os retornos não podem ser comuns — se fossem, as correntes se somariam antes do '
      + 'shunt e não daria para separar quem é quem.',
      '📍 COM 50 POSIÇÕES ESTA PLACA MUDA DE LUGAR, não de projeto. Ela sai do painel e '
      + 'vai para junto da câmara, em 4 cópias de 16 posições cada. Aí os 100 fios dos '
      + 'DUTs ficam curtos e só 9 sinais voltam ao painel. Ver Doc 14.',
      '📌 O pino EN do multiplexador NÃO tem borne: vai soldado ao 0 V dentro da placa. '
      + 'O datasheet confirma que o enable é ativo em nível BAIXO.',
      '📐 O mux tem 70 Ω de resistência quando ligado, e isso não atrapalha: a entrada '
      + 'analógica do Arduino não puxa corrente, então não há queda sobre eles.',
      '🔬 O INA219 de referência fica em série com o retorno da posição 1, antes do shunt '
      + 'dela. Os dois medem a mesma corrente — é assim que se prova que o mux acerta.',
    ],
  },
  {
    id: 'F-P', nome: 'F-P1 e F-P2 — fusíveis das posições de ensaio', trilho: 2,
    x: 224, largura: 36, altura: 46, cor: '#fab005',
    nota: '1 porta-fusível de 2 vias COM INTERRUPTOR — um fusível e uma chave por posição.',
    grupos: [
      { ref: 'IN', lado: 'cima', legenda: 'Entrada comum (1)', pinos: [
        { nome: 'V+', usa: true, para: 'BD-24V saída 4' },
      ]},
      { ref: 'OUT', lado: 'baixo', legenda: 'Saídas com fusível de 100 mA (2)', pinos: [
        { nome: 'F-P1', usa: true, para: 'DUT da posição 1, na câmara — direto, sem passar pela PI-2' },
        { nome: 'F-P2', usa: true, para: 'DUT da posição 2, na câmara' },
      ]},
    ],
    avisos: [
      '⭐ CADA VIA FAZ DUAS COISAS. O fusível de 100 mA protege contra curto; o '
      + 'interruptor permite DESLIGAR a posição na frente da banca e mostrar o sistema '
      + 'detectando a falha em segundos, com a outra posição seguindo normal.',
      '📌 Fusível de 100 mA para uma carga de 17,6 mA. Ele existe para curto, não para '
      + 'sobrecarga leve — nenhum fusível detecta um dispositivo que simplesmente parou.',
    ],
  },

  /* ════════════ TRILHO 2 — POTÊNCIA ════════════ */
  {
    id: 'BTS1', nome: 'BTS7960 (IBT-2) #1 — Peltier', trilho: 2,
    x: 34, largura: 50, altura: 50, cor: '#c92a2a',
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
    x: 92, largura: 50, altura: 50, cor: '#c92a2a',
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
    id: 'KA1', nome: 'KA1 — relé de selo', trilho: 1,
    x: 357, largura: 34, altura: 50, cor: '#7048e8',
    nota: 'Relé de 8 pinos com 2 contatos reversíveis, em base PTF08A.',
    grupos: [
      /* ⭐ A base PTF08A tem os 8 terminais em DUAS fileiras de 4.
         Aqui os que recebem FIO EXTERNO ficam na fileira de baixo, de
         frente para a CH-2x1 (potência), que é por onde a cadeia de
         comando anda. Em cima ficam os que só levam ponte curta na
         própria base, e os NF que o projeto não usa. */
      { ref: 'CIMA', lado: 'cima', legenda: 'Fileira de cima · pinos 4 · 8 · 12 · 14', pinos: [
        rele('22'),
        rele('24', 1, 'S2-11 (bloco NF do STOP) → daí para o KA2 · A1'),
        rele('21', 1, 'ponte curta do 11 — comum do contato de SAÍDA'),
        rele('A2', 1, 'BD-0V · R11'),
      ]},
      { ref: 'BAIXO', lado: 'baixo', legenda: 'Fileira de baixo · pinos 1 · 5 · 9 · 13', pinos: [
        rele('12'),
        rele('14', 1, '⭐ ponte curta até o A1: é ISTO que faz o relé se segurar'),
        rele('11', 1, 'nó CMD — comum do contato de SELO'),
        rele('A1', 1, '⭐ do REARME (S3-14) OU do próprio selo (14) — os dois em paralelo'),
      ]},
    ],
  },
  {
    id: 'KA2', nome: 'KA2 — relé de potência', trilho: 1,
    x: 397, largura: 34, altura: 50, cor: '#7048e8',
    nota: '⚠️ Contato declarado em CORRENTE CONTÍNUA, mínimo 10 A.',
    grupos: [
      { ref: 'CIMA', lado: 'cima', legenda: 'Fileira de cima · pinos 4 · 8 · 12 · 14', pinos: [
        rele('22'), rele('24'), rele('21'),
        rele('A2', 1, 'BD-0V · R12'),
      ]},
      { ref: 'BAIXO', lado: 'baixo', legenda: 'Fileira de baixo · pinos 1 · 5 · 9 · 13', pinos: [
        rele('12'),
        rele('14', 1, '⚡ saída para o BD-POT — é este contato que corta a potência'),
        rele('11', 1, '⚡ entrada dos 24 V do prensa-cabo PG9-1'),
        rele('A1', 1, 'S2-12 — vem pelo bloco NF do STOP, que vem do KA1 · 24'),
      ]},
    ],
    avisos: ['📌 Sobra um contato reversível inteiro (21-22-24) sem uso. Serve de '
           + 'reserva para um intertravamento futuro.'],
  },


  {
    id: 'MV-1', nome: 'MV-1 — módulo MOSFET 4 canais, isolado', trilho: 2,
    x: 150, largura: 66, altura: 51, cor: '#0ca678',
    nota: 'Comanda os três grupos de ventoinha e ainda sobra um canal. Optoacoplador '
        + 'em cada entrada, jumper H/L por canal e 66 × 50,5 mm.',
    grupos: [
      { ref: 'CTRL', lado: 'cima', legenda: 'Comando — vem do Arduino (6)', pinos: [
        { nome: 'VCC', usa: true, para: 'BD-5V saída 9 — alimenta o lado do comando' },
        { nome: 'GND-C', usa: true, para: 'BD-0V · R14 — retorno do COMANDO' },
        { nome: 'IN1', usa: true, para: 'Mega D27 — grupo RADIADOR' },
        { nome: 'IN2', usa: true, para: 'Mega D28 — grupo PTC' },
        { nome: 'IN3', usa: true, para: 'Mega D29 — grupo CIRCULAÇÃO' },
        { nome: 'IN4' },
      ]},
      { ref: 'VIN', lado: 'direita', legenda: 'Alimentação das cargas (2)', pinos: [
        { nome: 'VIN', usa: true, para: 'BD-AUX saída 1 — 12 V' },
        { nome: 'GND-P', usa: true, para: 'BD-0V · R13 — retorno das CARGAS' },
      ]},
      { ref: 'OUT', lado: 'baixo', legenda: 'Saídas — 4 pares independentes (8)', pinos: [
        { nome: 'O1+', usa: true, para: '2 ventoinhas do radiador +' },
        { nome: 'O1−', usa: true, para: '2 ventoinhas do radiador −' },
        { nome: 'O2+', usa: true, para: 'ventoinha do PTC +' },
        { nome: 'O2−', usa: true, para: 'ventoinha do PTC −' },
        { nome: 'O3+', usa: true, para: '2 frias + 2 do duto  +' },
        { nome: 'O3−', usa: true, para: '2 frias + 2 do duto  −' },
        { nome: 'O4+' }, { nome: 'O4−' },
      ]},
      { ref: 'JMP', lado: 'esquerda', legenda: 'Jumpers H/L, um por canal (4)', pinos: [
        { nome: 'J1', usa: true, para: 'deixar em H — liga com nível alto' },
        { nome: 'J2', usa: true, para: 'deixar em H' },
        { nome: 'J3', usa: true, para: 'deixar em H' },
        { nome: 'J4' },
      ]},
    ],
    avisos: [
      '🔥 OS DOIS GND NÃO SE TOCAM. O GND-C é o retorno do COMANDO (5 V, lado do Arduino) e o GND-P é o das CARGAS (12 V, das ventoinhas). O optoacoplador existe para mantê-los separados — uni-los anula o isolamento e traz o ruído das ventoinhas para dentro do Arduino. Cada um no SEU ponto do BD-0V.',
      '⭐ OS 4 JUMPERS H/L DEFINEM O NÍVEL QUE LIGA. Deixe todos em **H**: assim '
      + '`digitalWrite(pino, HIGH)` acende a ventoinha, que é a convenção intuitiva e a '
      + 'mesma dos sinaleiros. Em L o comando fica invertido e o firmware vira uma '
      + 'armadilha de leitura.',
      '⚠️ OS 4 CANAIS DIVIDEM O MESMO VIN. Todas as ventoinhas precisam ser da MESMA '
      + 'tensão — no projeto, 12 V. Se um dia o radiador virar 24 V, ele não pode '
      + 'compartilhar este módulo.',
      '⚠️ O MOSFET é o LR7843, de 30 V. Em 12 V sobra margem de sobra. Só não use este '
      + 'módulo para carga de 24 V: o pico que a ventoinha devolve ao desligar come a '
      + 'margem que restaria. (O anúncio diz "5–36 V", mas o transistor é de 30 V — '
      + 'confie no componente, não no anúncio.)',
      '📌 60 W por canal, e o maior grupo daqui puxa uns 7 W. O módulo trabalha frio.',
      '🎁 O canal 4 fica livre, com borne e jumper próprios.',
    ],
  },

  /* ════════════ TRILHO 1 — DISTRIBUIÇÃO ════════════ */
  {
    id: 'BD-POT', nome: 'BD-POT — 24 V de potência', trilho: 1,
    x: 30, largura: 36, altura: 58, cor: '#c92a2a',
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
    x: 72, largura: 36, altura: 58, cor: '#fab005',
    grupos: [
      { ref: 'IN', lado: 'cima', legenda: 'Entrada 2,5 mm² (1)', pinos: [via('IN', 1, 'prensa-cabo do 12 V')] },
      { ref: 'OUT', lado: 'baixo', legenda: 'Saídas (4)', pinos: [
        via('O1', 1, 'MV-1 · VIN — alimenta os 4 canais'),
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
        via('O4', 1, 'F-P1/F-P2 — entrada do porta-fusível'),
        via('O5', 1, 'PI-1 J1-10 — COM do ULN2803'), via('O6'),
      ]},
    ],
  },
  {
    id: 'BD-5V', nome: 'BD-5V — 5,10 V', trilho: 1,
    x: 165, largura: 80, altura: 58, cor: '#f08c00',
    grupos: [
      { ref: 'IN', lado: 'cima', legenda: 'Entrada 2,5 mm² (1)', pinos: [via('IN', 1, 'prensa-cabo dos 5 V')] },
      { ref: 'OUT', lado: 'baixo', legenda: 'Saídas (12) ⬆', pinos: [
        via('O1', 1, 'Arduino · pino 5V'), via('O2', 1, 'tela ES3C28P'),
        via('O3', 1, 'RTC DS3231'), via('O4', 1, 'BTS #1 · VCC'),
        via('O5', 1, 'BTS #2 · VCC'), via('O6', 1, 'PI-1 J1-4'),
        via('O7', 1, '4 LEDs da maquete'),
        via('O8', 1, 'PI-2 — alimenta o mux e o INA219'),
        via('O9', 1, 'MV-1 · VCC do lado do comando'),
        via('O10', 1, '⭐ AM2315C · VCC — o sensor DENTRO da câmara'),
        via('O11'), via('O12'),
      ]},
    ],
    avisos: ['📌 Cresceu de 10 para 12 pontos quando o AM2315C ganhou saída própria. '
           + 'As 11 cargas de 5 V somam ~310 mA — o LM2596 de 2 A trabalha folgado.'],
  },
  {
    id: 'BD-0V', nome: 'BD-0V — barra do 0 V (star ground)', trilho: 1,
    x: 251, largura: 100, altura: 58, cor: '#212529',
    nota: '⭐ O ÚNICO 0 V do projeto. Barra de 20 pontos — ou dois blocos de 8 mais '
        + 'um de 4, ligados por ponte de 4 mm².',
    grupos: [
      { ref: 'IN', lado: 'cima', legenda: 'Entrada 10 mm² (1)', pinos: [via('IN', 1, 'retorno do padrão de entrada')] },
      { ref: 'R', lado: 'baixo', linhas: 2, legenda: 'Retornos (20 pontos)', pinos: [
        via('R1', 1, 'BTS #1 · B−'), via('R2', 1, 'BTS #2 · B−'),
        via('R3', 1, 'BTS #1 · GND lógica'), via('R4', 1, 'BTS #2 · GND lógica'),
        via('R5', 1, 'Arduino · GND'), via('R6', 1, 'PI-1 J1-9'),
        via('R7', 1, 'DNLCB30 · −'), via('R8', 1, 'RTC DS3231 · GND'),
        via('R9', 1, 'tela ES3C28P · GND'), via('R10', 1, 'conversor de nível · GND'),
        via('R11', 1, 'KA1 · A2'), via('R12', 1, 'KA2 · A2'),
        via('R13', 1, 'MV-1 · GND da carga (lado VIN)'),
        via('R14', 1, 'MV-1 · GND do comando (lado isolado)'),
        via('R15', 1, '⭐ AM2315C · GND — o sensor DENTRO da câmara'),
        via('R16', 1, 'LEDs da maquete −'),
        via('R17', 1, 'PI-2 · 0V — retorno das posições, depois dos shunts'),
        via('R18', 1, 'seletora LOCAL/REMOTO — contato para o 0 V'),
        via('R19'), via('R20'),
      ]},
    ],
    avisos: ['🔥 É o componente mais fácil de subdimensionar. Chegam 18 retornos + a '
           + 'entrada. Um bloco comum de 8 saídas NÃO serve.'],
  },
  {
    id: 'RTC', nome: 'RTC DS3231', trilho: 3,
    x: 402, largura: 35, altura: 40, cor: '#0ca678',
    nota: '⭐ Subiu para o trilho 3, ao lado do Arduino: o I²C fica curto e o módulo '
        + 'sai da canaleta de potência. Abriu espaço no trilho 1 para os dois relés, '
        + 'que precisam de canaleta de POTÊNCIA nas duas bordas — e no trilho 1 as '
        + 'duas vizinhas (CH-2x1 e CH-base) são exatamente isso.',
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
    x: 64, y: 40, largura: 50, altura: 86, cor: '#1971c2',
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
    x: 128, y: 44, largura: 34, altura: 22, cor: '#7048e8',
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
    x: 46 + i * 42, y: 175, largura: 30, altura: 30,
    cor: ['#2f9e44', '#1971c2', '#e8590c', '#c92a2a'][i],
    grupos: [{ ref: 'LMP', lado: 'baixo', legenda: 'Sinaleiro 22 mm · 24 V (2)', pinos: [
      via('+', 1, 'BD-24V saída 3 — positivo comum'),
      via('−', 1, `PI-1 J2-${i + 4}`),
    ]}],
  })),
  {
    id: 'S1', nome: 'Botão START (verde)', porta: true,
    aConferir: '🔥 O bloco chaveia para o 0 V, NÃO para o 5 V. Com INPUT_PULLUP o Arduino já segura o pino em 5 V por dentro — ligar o botão no 5 V faz o pino ler HIGH apertado ou não, e o START nunca acontece.',
    x: 51, y: 250, largura: 30, altura: 30, cor: '#2f9e44',
    grupos: [{ ref: 'NA', lado: 'baixo', legenda: 'Bloco NA de 5 V — contatos 13-14', pinos: [
      via('13', 1, '⚡ 0 V comum dos comandos (vem do SA1-13)'),
      via('14', 1, 'Mega D22 — INPUT_PULLUP, LOW = apertado'),
    ]}],
  },
  {
    id: 'S2', nome: 'Botão STOP (preto)', porta: true,
    x: 96, y: 250, largura: 30, altura: 30, cor: '#212529',
    nota: 'Este é de 24 V: ele energiza a bobina do KA2 diretamente.',
    grupos: [{ ref: 'BLK', lado: 'baixo', legenda: '1 bloco NF (24 V) + 1 bloco NA (5 V) — 4 vias', pinos: [
      via('11', 1, '⚡ HARDWARE: KA1 · 24 (contato de saída)'),
      via('12', 1, '⚡ HARDWARE: KA2 · A1 — corta a bobina enquanto apertado'),
      via('13', 1, '⚡ 0 V comum dos comandos (ponte a partir do S1-13)'),
      via('14', 1, 'Mega D23 — INPUT_PULLUP, LOW = apertado'),
    ]}],
  },
  {
    id: 'S3', nome: 'Botão REARME (azul)', porta: true,
    x: 141, y: 250, largura: 30, altura: 30, cor: '#1971c2',
    grupos: [{ ref: 'NA', lado: 'baixo', legenda: 'Bloco NA de 24 V — contatos 13-14', pinos: [
      via('13', 1, 'nó CMD — a cadeia, depois do cogumelo'),
      via('14', 1, 'KA1 · A1 — refaz o selo'),
    ]}],
  },
  {
    id: 'SA1', nome: 'Seletora LOCAL / REMOTO', porta: true,
    x: 186, y: 250, largura: 30, altura: 30, cor: '#212529',
    grupos: [{ ref: 'SEL', lado: 'baixo', legenda: '2 posições · bloco NA — contatos 13-14', pinos: [
      via('13', 1, 'BD-0V · R18'), via('14', 1, 'Mega D26'),
    ]}],
    avisos: ['✅ Confirmado no firmware: 1 pino só, o D26, com INPUT_PULLUP. '
           + 'Aberto = LOCAL, fechado para o 0 V = REMOTO.',
             '⭐ A inversão é proposital: fio rompido lê HIGH e cai em LOCAL. Uma falha '
           + 'de fiação nunca abre a máquina para comando pela internet.'],
  },
  {
    id: 'S0', nome: 'Cogumelo de EMERGÊNCIA', porta: true,
    x: 136, y: 330, largura: 44, altura: 44, cor: '#c92a2a',
    nota: 'Cogumelo com trava. Dois blocos NF: um corta a potência, o outro avisa o '
        + 'Arduino.',
    grupos: [{ ref: 'NF', lado: 'baixo', legenda: '2 blocos NF (4)', pinos: [
      via('11', 1, 'BD-24V saída 2'), via('12', 1, 'cadeia → KA1 · A1'),
      via('21', 1, '⚡ 0 V comum dos comandos (ponte a partir do S2-13)'),
      via('22', 1, 'Mega D24 — INPUT_PULLUP, HIGH = EMERGÊNCIA (o NF abriu)'),
    ]}],
  },
];

/* ⭐ QUAL CANALETA CADA GRUPO DE BORNES ENXERGA
   ─────────────────────────────────────────────────────────────────────
   Um borne da borda de CIMA só alcança a canaleta que está acima dele;
   um da borda de BAIXO, a de baixo. Ignorar isso é o que faz o fio
   aparecer passando por debaixo do trilho DIN — ele "atravessa" o
   componente para chegar do outro lado, o que não existe na montagem. */
export function canaletaDoGrupo(comp, grupo) {
  const naPorta = !!comp.porta;
  const ks = (naPorta ? CANALETAS_PORTA : CANALETAS).filter(k => !k.vertical);
  const t = TRILHOS.find(x => x.n === comp.trilho);
  const cy = naPorta ? comp.y + comp.altura / 2 : t.y;
  const topo = naPorta ? comp.y : t.y - comp.altura / 2;
  const base = naPorta ? comp.y + comp.altura : t.y + comp.altura / 2;

  if (grupo.lado === 'cima' || grupo.lado === 'baixo') {
    /* borne de cima só alcança canaleta acima; de baixo, só a de baixo */
    const acima = grupo.lado === 'cima';
    const cand = ks.filter(k => acima ? k.y + k.h <= topo + 1 : k.y >= base - 1);
    if (!cand.length) return [];
    return [cand.reduce((a, k) => {
      const da = acima ? topo - (a.y + a.h) : a.y - base;
      const dk = acima ? topo - (k.y + k.h) : k.y - base;
      return dk < da ? k : a;
    }).id];
  }
  /* ⭐ BORNE LATERAL ALCANÇA AS DUAS. O fio sai de lado, contorna o
     componente e sobe OU desce — as duas canaletas vizinhas servem, e
     quem escolhe é a classe do fio. Tratar como "a mais próxima" faz o
     resultado virar no momento em que uma canaleta anda 6 mm. */
  const acima = ks.filter(k => k.y + k.h <= topo + 1)
    .sort((a, b) => b.y - a.y)[0];
  const abaixo = ks.filter(k => k.y >= base - 1).sort((a, b) => a.y - b.y)[0];
  void cy;
  return [acima, abaixo].filter(Boolean).map(k => k.id);
}
