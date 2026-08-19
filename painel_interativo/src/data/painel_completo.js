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
  { id: 'CP-topo', tipo: 'sinal',    x: 2, y: 10,  w: 240, h: 24, nome: 'superior' },
  { id: 'CP-1x2',  tipo: 'sinal',    x: 2, y: 136, w: 240, h: 26, nome: 'entre a tela e os sinaleiros' },
  { id: 'CP-2x3',  tipo: 'sinal',    x: 2, y: 214, w: 240, h: 26, nome: 'entre os sinaleiros e os comandos' },
  { id: 'CP-3x4',  tipo: 'potencia', x: 2, y: 292, w: 240, h: 26, nome: 'entre os comandos e a emergência' },
  { id: 'CP-base', tipo: 'sinal', x: 2, y: 384, w: 240, h: 26,
    nome: 'inferior — o bloco de 5 V do cogumelo' },
  /* ⭐ DUAS verticais na dobradiça, não uma. A porta carrega os dois
     mundos: o cogumelo, o STOP e os sinaleiros são 24 V de comando —
     e bobina de relé é POLUIDORA, dá pico ao desligar. A tela, os
     botões de 5 V e a seletora são sinal. Cada um na sua, e duas
     passagens flexíveis separadas. */
  /* ⭐ A DE SINAL FICA NA BORDA e a de potência POR DENTRO, descendo
     60 mm mais. É isso que faz cada calha morrer dentro da SUA vertical
     sem passar por cima da outra: a CL-sin para na primeira que
     encontra, e a CL-pot cruza aquele trecho na altura em que a de
     sinal já acabou. */
  { id: 'CP-vsin', tipo: 'sinal',    x: 2,  y: 10, w: 22, h: 400,
    nome: 'vertical da DOBRADIÇA — sinal', vertical: true, dobradica: true },
  { id: 'CP-vpot', tipo: 'potencia', x: 26, y: 10, w: 22, h: 460,
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
/* ⭐ AS CALHAS DE TRAVESSIA — onde o chicote pula da placa para a porta.
   As duas ficam no CANTO INFERIOR DIREITO, uma acima da outra e bem
   separadas: a de potência rente à CH-base e a de sinal 46 mm acima,
   alimentada pela CV-dir.

   Cada uma é um trecho de calha flexível de verdade — espiral por dentro
   e folga de 60 mm — e é o ÚNICO ponto do painel onde os fios passam de
   uma parte para a outra. */
export const CALHAS = [
  { id: 'CL-pot', tipo: 'potencia', y: 444, h: 24, entraEm: 37,
    nome: 'calha de POTÊNCIA', daPlaca: 'CH-base', naPorta: 'CP-vpot',
    diz: 'Rente à CH-base, no canto de baixo. Leva a cadeia de comando de 24 V. '
       + 'Vai um pouco mais longe porque a vertical de potência é a de dentro.' },
  { id: 'CL-sin', tipo: 'sinal', y: 305, h: 24, entraEm: 13,
    nome: 'calha de SINAL E MEDIÇÃO', daPlaca: 'CV-dir', naPorta: 'CP-vsin',
    diz: 'Alinhada com a CH-2x1, e mais curta: morre na primeira vertical que '
       + 'encontra, a de sinal, na borda da dobradiça. Leva a tela, os botões de '
       + '5 V e a seletora.' },
];

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
export const COMPONENTES = [

  /* ════════════ TRILHO 3 — CONTROLE ════════════ */
  {
    id: 'MEGA', nome: 'MEGA — o cérebro: PID, proteções e intertravamento', trilho: 3,
    resumoFuncao: '❓ O QUE ELE MANDA E O QUE ELE RECEBE. MANDA (saidas): D27 -> KA3, autoriza a potencia · D30 -> KA4, fan externa · D29 -> MV-1, as 5 fans internas · D4 e D7 -> R_EN dos BTS · D5 e D6 -> PWM dos BTS · D9 a D12 -> sinaleiros · D31 a D34 -> mux da PI-2.  RECEBE (entradas): D23 <- STOP apertado · D24 <- emergencia acionada · D25 <- HA 24 V no BD-POT? · D2 <- temperatura do dissipador · D3 e A8 <- RPM dos 2 coolers · A0 e A1 <- corrente dos BTS · A2 <- corrente das posicoes · D20 e D21 <- I2C.  ⭐ Repare que ele NAO le os reles nem o botao verde: le o D25, que diz se a energia CHEGOU. Comando e verificacao sao fios diferentes.',
    x: 32, largura: 134, altura: 96, cor: '#0ca678',
    nota: 'O Mega encaixa no meio da placa adaptadora e cada pino dele vira um borne '
        + 'de parafuso nas bordas. São 82 bornes em FILEIRA ÚNICA por borda, um ao '
        + 'lado do outro — é o que obriga a placa a ser comprida.',
    aConferir: 'Dimensões estimadas em 134 × 96 mm a partir dos 35 bornes da borda de '
             + 'cima. Meça a placa quando ela chegar.',
    grupos: [
      { ref: 'TOPO', lado: 'cima', legenda: 'Borda de cima — 35 bornes', pinos: [
        via('D30', 1, '⭐ Gatilho do KA4 → ventoinhas do RADIADOR'), via('D29', 1, '⭐ MV-1 canal 3 → as 5 ventoinhas INTERNAS (4 de circulação + a do PTC)'), via('D28'),
        via('D27', 1, '⭐ HAB_POTENCIA → gatilho do KA3. HIGH autoriza a potência; LOW derruba o selo e corta'),
        via('D26'), via('D25', 1, 'PI-1 J2-8 — vigia se os 24 V caíram'), via('D24', 1, 'Emergência — bloco NF de 5 V'), via('D23', 1, 'Botão STOP (NA, 5 V)'),
        via('D22', 1, 'SC-1 · DOUT — detecção de dispositivo morto'), via('+5V', 1, 'BD-5V saída 1'), via('D21', 1, 'I²C SCL — o mesmo barramento'), via('D20', 1, 'I²C SDA — AM2315C (câmara), DS3231 e 2× INA219'),
        via('D19', 1, 'Serial1 RX ← DNLCB30/ESP32'), via('D18', 1, 'Serial1 TX → DNLCB30/ESP32'), via('D17', 1, 'Serial2 RX ← conversor ← tela'), via('D16', 1, 'Serial2 TX → conversor → tela'),
        via('D15'), via('D14'), via('D0'), via('D1'),
        via('D2', 1, 'PI-1 J2-3 — 1-Wire do DS18B20 do RADIADOR'), via('D3', 1, 'RPM da ventoinha do radiador #1'), via('D4', 1, 'BTS #1 · R_EN e L_EN juntos'), via('D5', 1, 'BTS #1 · RPWM (frio)'),
        via('D6', 1, 'BTS #2 · RPWM (quente)'), via('D7', 1, 'BTS #2 · R_EN e L_EN juntos'), via('D8'), via('D9', 1, 'PI-1 J1-5 → sinaleiro ENERGIZADO'),
        via('D10', 1, 'PI-1 J1-6 → sinaleiro RESFRIANDO'), via('D11', 1, 'PI-1 J1-7 → sinaleiro AQUECENDO'), via('D12', 1, 'PI-1 J1-8 → sinaleiro FALHA'), via('D13'),
        via('GND1'), via('D21/SCL'), via('D20/SDA'),
      ]},
      { ref: 'ESQ', lado: 'esquerda', legenda: 'Borda esquerda — 13 bornes (D31–D43)', pinos: [
        via('D31'),
        via('D32'),
        via('D33'),
        via('D34'),
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
        via('A2'),
        via('A1', 1, 'PI-1 J2-2 — corrente do BTS #2'), via('A0', 1, 'PI-1 J2-1 — corrente do BTS #1'), via('GND2', 1, 'retorno dos 4 sinaleiros da porta — mesma referência do pino que os acende'), via('IOREF'),
        via('AREF'), via('RESET'), via('+3V3'),
        via('GND3', 1, '⭐ BD-0V · Z5 — o retorno da alimentação, no bloco POWER'),
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
    id: 'PI1', nome: 'PI-1 — filtros, divisor e pull-up', trilho: 3,
    resumoFuncao: '🔎 O QUE ELA FAZ: limpa e adapta sinais entre o Arduino e o mundo. 1) filtra com 100 nF a leitura de corrente dos dois BTS; 2) divide os 24 V do BD-POT para 4,22 V, que e como o D25 sabe se a potencia chegou; 3) da o pull-up de 4,7 kΩ ao 1-Wire do DS18B20. Nao comanda potencia nenhuma. ⭐ O DRIVER DOS SINALEIROS SAIU DAQUI: com sinaleiro de 5 V o pino do Arduino aciona direto, e o ULN2803 perdeu a razao de existir (Doc 33 §33.8).',
    x: 176, largura: 70, altura: 62, cor: '#f08c00',
    nota: 'Caixa DIN de 4 módulos. A placa encolheu para 56 × 56 mm quando o CI, o '
        + 'soquete e as 9 vias dos sinaleiros saíram. J1 só entra, J2 só sai.',
    grupos: [
      { ref: 'J1', lado: 'cima', legenda: 'ENTRADAS (6 vias · KF301 5,08 mm)', pinos: [
        via('J1-1', 1, 'BTS #1 · R_IS'), via('J1-2', 1, 'BTS #2 · R_IS'),
        via('J1-3', 1, 'DS18B20 do radiador · DATA'), via('J1-4', 1, 'BD-5V saída 6'),
        via('J1-5', 1, 'BD-0V'), via('J1-6', 1, 'BD-POT saída 3'),
      ]},
      { ref: 'J2', lado: 'baixo', legenda: 'SAÍDAS (4 vias · KF301 5,08 mm)', pinos: [
        via('J2-1', 1, 'Mega A0'), via('J2-2', 1, 'Mega A1'),
        via('J2-3', 1, 'Mega D2'), via('J2-4', 1, 'Mega D25'),
      ]},
    ],
    avisos: ['✅ 10 vias, 10 usadas, ZERO reserva — e é assim de propósito. A PI-1 é '
           + 'uma placa feita à mão para este projeto: se um dia precisar de outro '
           + 'sinal, ela é refeita de qualquer jeito. Borne sobrando só ocuparia '
           + 'espaço no trilho.',
           '⭐ ELA JÁ FOI QUASE O DOBRO. Tinha 19 vias, um ULN2803A em soquete e 20 '
           + 'jumpers — tudo por causa de uma diferença de tensão: sinaleiro de 24 V, '
           + 'pino de 5 V. Trocado o sinaleiro por um de 5 V, metade da placa deixou de '
           + 'ter função. Vale como lição de projeto: antes de adaptar dois lados, '
           + 'pergunte se eles não podem falar a mesma língua.'],
  },
  {
    id: 'ESP32', nome: 'ESP32 — Wi-Fi, MQTT e dashboard remoto', trilho: 2,
    resumoFuncao: '🔎 O QUE ELE FAZ: e a janela do sistema para a internet. Recebe a telemetria do Mega pela Serial1, publica por MQTT e repassa comandos do dashboard. ⛔ So pode PARAR: o START e recusado por MQTT, porque ligar a maquina exige alguem olhando para ela. Nao aciona atuador nenhum — ele PEDE, o Mega valida e decide.',
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
    id: 'SC-1', nome: 'SC-1 — sensor de corrente da posição de ensaio', trilho: 3,
    resumoFuncao: '🔎 O QUE ELE FAZ: responde UMA pergunta — passa corrente pelo equipamento da posicao de ensaio? Se passa, ele esta vivo. Se nao passa, ou queimou, ou o fusivel abriu, ou alguem desligou a chave. ⭐ Ele nao MEDE: ele DECIDE, e entrega a decisao num fio, direto num pino digital do Mega. O fio da posicao passa POR DENTRO do furo do sensor — o circuito de ensaio nao e aberto para medir.',
    x: 291, largura: 40, altura: 44, cor: '#ae3ec9',
    nota: '⭐ O fio do +24 V da posição dá 10 VOLTAS pelo furo antes de seguir para a '
        + 'câmara. O sensor enxerga 10 × a corrente (176 mA em vez de 17,6 mA) e o '
        + 'comparador sai do ruído — é o mesmo princípio de espiras de um TC.',
    grupos: [
      { ref: 'ALIM', lado: 'baixo', legenda: 'Alimentação do módulo (2)', pinos: [
        { nome: 'VCC', usa: true, para: 'BD-5V saída 8' },
        { nome: 'GND', usa: true, para: 'BD-0V · Z17' },
      ]},
      { ref: 'SIG', lado: 'baixo', legenda: 'Saída digital (1)', pinos: [
        { nome: 'DOUT', usa: true, para: 'Mega D22 — nível baixo enquanto houver corrente' },
      ]},
    ],
    avisos: ['⚠️ AJUSTE O TRIMPOT NA BANCADA, com o equipamento ligado e depois desligado. '
           + 'É ele que decide onde fica a fronteira entre "tem corrente" e "não tem".',
           '⭐ O pino do Mega fica em INPUT_PULLUP: fio arrancado = nível alto = FALHA. '
           + 'O defeito cai do lado do alarme, nunca do lado do silêncio.'],
  },
  {
    id: 'F-P', nome: 'F-P — fusível e chave da posição de ensaio', trilho: 2,
    resumoFuncao: '🔎 O QUE ELE FAZ: e o disjuntor da posicao de ensaio, em miniatura. O fusivel abre se o dispositivo entrar em curto, e o interruptor liga e desliga a posicao a mao — e e com ele que se DEMONSTRA a deteccao de falha na apresentacao: desliga a chave, e em menos de 1 segundo o alarme aparece.',
    x: 224, largura: 26, altura: 46, cor: '#fab005',
    nota: '⭐ UM porta-fusível de 1 via COM INTERRUPTOR. Eram dois, um por posição de '
        + 'ensaio; com a detecção digital o protótipo passou a ter uma posição só.',
    grupos: [
      { ref: 'IN', lado: 'cima', legenda: 'Entrada (1)', pinos: [
        { nome: 'V+', usa: true, para: 'BD-24V saída 4' },
      ]},
      { ref: 'OUT', lado: 'baixo', legenda: 'Saída com fusível de 100 mA (1)', pinos: [
        { nome: 'F-P1', usa: true, para: 'sensor SC-1 (10 voltas no furo) → DUT da posição 1, na câmara' },
      ]},
    ],
  },

  /* ════════════ TRILHO 2 — POTÊNCIA ════════════ */
  {
    id: 'BTS1', nome: 'BTS1 — driver de potência da PELTIER (frio)', trilho: 2,
    resumoFuncao: '🔎 O QUE ELE FAZ: e a CHAVE DE CONTROLE da Peltier. Recebe os 24 V do BD-POT e entrega a pastilha em PWM de 20 kHz, na potencia que o PID pedir. Quem manda e o Arduino (D5 = quanto, D4 = pode ou nao). Devolve pelo R_IS uma amostra da corrente. ⚠ Ele e a chave de CONTROLE, nao a de SEGURANCA — quem corta de verdade e o KA2.',
    aConferir: '📐 NO DESENHO os 8 pinos de sinal aparecem em FILA ÚNICA, na borda. '
             + 'No módulo real eles são uma barra de 2 × 4. A ordem é a mesma; o que '
             + 'muda é só o desenho, para dar para ver qual fio entra em qual pino.',
    x: 34, largura: 50, altura: 50, cor: '#c92a2a',
    grupos: [
      { ref: 'P1', lado: 'esquerda', legenda: 'Borne verde de potência (4 parafusos)', pinos: [
        via('M−', 1, 'Peltier — negativo'), via('M+', 1, 'Peltier — positivo'),
        via('B+', 1, 'BD-POT saída 1'), via('B−', 1, 'BD-0V'),
      ]},
      { ref: 'J1', lado: 'direita', legenda: 'Barra de sinal — no módulo é 2 × 4', pinos: [
        via('R_PWM', 1, 'Mega D5'), via('L_PWM', 1, '⭐ ponte curta até o GND do próprio módulo — fixo em nível BAIXO'),
        via('R_EN', 1, 'Mega D4'), via('L_EN', 1, 'ponte curta do R_EN — o Mega D4 comanda os dois'),
        via('R_IS', 1, 'PI-1 J1-1'), via('L_IS'),
        via('VCC', 1, 'BD-5V saída 4'), via('GND', 1, 'BD-0V'),
      ]},
    ],
    avisos: ['⚠️ Os 2 resistores de 10 kΩ de pull-down ficam soldados DENTRO deste '
           + 'módulo, entre R_EN/L_EN e GND — não na PI-1.'],
  },
  {
    id: 'BTS2', nome: 'BTS2 — driver de potência do PTC (quente)', trilho: 2,
    resumoFuncao: '🔎 O QUE ELE FAZ: identico ao BTS1, mas para o aquecedor PTC. D6 = quanto, D7 = pode ou nao. ⚠ O firmware NUNCA habilita os dois ao mesmo tempo — e o intertravamento: aquecer e resfriar juntos so gastaria energia e brigaria consigo.',
    x: 92, largura: 50, altura: 50, cor: '#c92a2a',
    grupos: [
      { ref: 'P1', lado: 'esquerda', legenda: 'Borne verde de potência (4 parafusos)', pinos: [
        via('M−', 1, 'PTC — negativo'), via('M+', 1, 'PTC — positivo'),
        via('B+', 1, 'BD-POT saída 2'), via('B−', 1, 'BD-0V'),
      ]},
      { ref: 'J1', lado: 'direita', legenda: 'Barra de sinal — no módulo é 2 × 4', pinos: [
        via('R_PWM', 1, 'Mega D6'), via('L_PWM', 1, '⭐ ponte curta até o GND do próprio módulo — fixo em nível BAIXO'),
        via('R_EN', 1, 'Mega D7'), via('L_EN', 1, 'ponte curta do R_EN — o Mega D7 comanda os dois'),
        via('R_IS', 1, 'PI-1 J1-2'), via('L_IS'),
        via('VCC', 1, 'BD-5V saída 5'), via('GND', 1, 'BD-0V'),
      ]},
    ],
  },
  {
    id: 'KA1', nome: 'KA1 — SEGURANÇA: cai na emergência, rearme azul', trilho: 1,
    resumoFuncao: '🔎 O QUE ELE FAZ: e o rele da SEGURANCA. Sela-se sozinho quando alguem aperta o REARME azul e so cai quando o cogumelo e socado. Nenhum fio do Arduino chega perto dele — e por isso que a emergencia nao depende de software. Enquanto ele estiver caido, nada no painel pode armar potencia.',
    x: 362, largura: 34, altura: 50, cor: '#7048e8',
    nota: 'Relé de 8 pinos com 2 contatos reversíveis, em base PTF08A.',
    grupos: [
      /* ⭐ A base PTF08A tem os 8 terminais em DUAS fileiras de 4.
         Aqui os que recebem FIO EXTERNO ficam na fileira de baixo, de
         frente para a CH-2x1 (potência), que é por onde a cadeia de
         comando anda. Em cima ficam os que só levam ponte curta na
         própria base, e os NF que o projeto não usa. */
      /* ⭐ O SELO USA O CONTATO 2 E A SAÍDA USA O CONTATO 1, e não o
         contrário. Os dois são NA e eletricamente idênticos — o que
         decide é a FILEIRA: assim todos os fios EXTERNOS da cadeia
         (11, 14, A1) caem na fileira de baixo, que enxerga a CH-base,
         que é de potência e é quem alimenta a calha da porta. */
      { ref: 'CIMA', lado: 'cima', legenda: 'Fileira de cima · pinos 4 · 8 · 12 · 14', pinos: [
        rele('22'),
        rele('24', 1, '⭐ ponte curta até o A1: é ISTO que faz o relé se segurar'),
        rele('21', 1, 'ponte curta do 11 — comum do contato de SELO'),
        rele('A2', 1, 'BD-0V · Z11'),
      ]},
      { ref: 'BAIXO', lado: 'baixo', legenda: 'Fileira de baixo · pinos 1 · 5 · 9 · 13', pinos: [
        rele('12'),
        rele('14', 1, 'S2-11 (bloco NF do STOP) → daí para o KA2 · A1'),
        rele('11', 1, 'nó CMD — comum dos DOIS contatos'),
        rele('A1', 1, '⭐ do REARME (S3-14) OU do próprio selo (24) — os dois em paralelo'),
      ]},
    ],
  },
  {
    id: 'KA2', nome: 'KA2 — PROCESSO: cai no STOP, religa no verde', trilho: 1,
    resumoFuncao: '🔎 O QUE ELE FAZ: e o rele do PROCESSO, e o unico que liga e desliga os 24 V dos BTS. Tem selo proprio: o botao VERDE o arma, o botao PRETO o derruba (e ele NAO volta sozinho), e o KA3 pode derruba-lo tambem, quando o firmware detecta uma falha. ⚠ Contato de 10 A em corrente continua — ele pode abrir sob os 6 A da Peltier.',
    x: 402, largura: 34, altura: 50, cor: '#7048e8',
    nota: '⚠️ Contato declarado em CORRENTE CONTÍNUA, mínimo 10 A.',
    grupos: [
      { ref: 'CIMA', lado: 'cima', legenda: 'Fileira de cima · pinos 4 · 8 · 12 · 14', pinos: [
        rele('22'),
        rele('24', 1, '⭐ O SELO DO KA2 — ponte na base até o próprio A1'),
        rele('21', 1, '⭐ comum do selo — vem do S1 · 13, no nó depois do bloco NF do STOP'),
        rele('A2', 1, '⭐ KA3 · COM3 — a bobina fecha pelo contato do módulo de relé'),
      ]},
      { ref: 'BAIXO', lado: 'baixo', legenda: 'Fileira de baixo · pinos 1 · 5 · 9 · 13', pinos: [
        rele('12'),
        rele('14', 1, '⚡ saída para o BD-POT — é este contato que corta a potência'),
        rele('11', 1, '⚡ entrada dos 24 V do prensa-cabo PG9-1'),
        rele('A1', 1, '⭐ S1 · 14 (START verde) EM PARALELO com o selo KA2 · 24'),
      ]},
    ],
    avisos: ['⭐ ESTE RELÉ AGORA TEM SELO PRÓPRIO, igual ao KA1 — é o circuito clássico '
           + 'de partida-parada. O contato 21-24 realimenta a própria bobina, o S2 (NF) '
           + 'está em série e o S1 (START verde) em paralelo com o selo. Aperta o STOP '
           + 'UMA VEZ: a bobina cai, o selo abre junto, e nem soltando o botão ela volta. '
           + 'Só o botão verde religa. Memória sem uma linha de código.',
             '🔥 SÃO DOIS SELOS NO PAINEL, E ELES NÃO SÃO IGUAIS. O do KA1 se desfaz na '
           + 'EMERGÊNCIA e só o REARME azul o refaz. O do KA2 se desfaz no STOP e o botão '
           + 'VERDE o refaz. Trocar os dois na montagem faz o STOP exigir rearme e a '
           + 'emergência religar com o botão verde — exatamente o inverso da norma.',
           '⭐ A BOBINA DESTE RELÉ NÃO FECHA DIRETO NO 0 V. Entre o A2 e a barra '
           + 'está o CONTATO NA DO KA3, comandado pelo D27 do Mega. É o VETO DO '
           + 'FIRMWARE: ele pode DERRUBAR a potência (trip, STOP pela IHM, STOP '
           + 'remoto), mas não pode segurá-la contra o S0 nem contra o S2, que '
           + 'continuam a montante. Em série soma; em paralelo furaria. §31.13.',
           '🔥 MONTE O DIODO D1 (1N4007) DIRETO NESTES BORNES: catodo (faixa '
           + 'prateada) no A1, anodo no A2. SEM ELE o pico indutivo desta bobina abre '
           + 'arco NO CONTATO DO KA3, e um contato que pita acaba soldando — o veto do '
           + 'firmware perdido em silêncio. Se o relé já tiver diodo interno (teste de '
           + 'diodo entre A1 e A2 conduz num sentido só), o D1 externo é dispensável e '
           + 'o A1 é obrigatoriamente o positivo.',
           '⚠️ INVERTIDO, O D1 CURTO-CIRCUITA A BOBINA e derruba o F2 (2 A) assim que '
           + 'o KA1 selar. É um erro que se acha em 10 segundos e custa uma hora se '
           + 'você não desconfiar dele.',
           '🧪 O D1 COBRA UM PREÇO QUE VALE CONHECER: diodo puro na bobina atrasa o '
           + 'DESATRACAMENTO em 2 a 5 vezes, e contato que se separa devagar arca por '
           + 'mais tempo — justamente NESTE relé, que interrompe 6 A em corrente '
           + 'contínua. Quem quiser os dois lados troca por 1N4007 EM SÉRIE COM UM '
           + 'ZENER DE 24 a 33 V. Ver Doc 31 §31.15.',
           '⭐ TODO O CIRCUITO DE BOBINA DESTE RELÉ FICA NAS CANALETAS DE POTÊNCIA. O '
           + 'único fio de SINAL que chega perto é o do D27, e ele para no IN3 do módulo '
           + 'do KA3, no trilho 2 — nunca na bobina.'],
  },


  {
    id: 'KA34', nome: 'KA3 (POTÊNCIA) + KA4 (FAN EXTERNA DA PELTIER) — módulos de relé', trilho: 2,
    resumoFuncao: '🔎 O QUE FAZEM: sao as duas maos do FIRMWARE no mundo fisico. KA3 (POTENCIA) fica em serie com a bobina do KA2 — abrindo, derruba o selo e os 24 V somem do BD-POT, e nao voltam ate alguem apertar o botao verde. KA4 (FAN EXTERNA DA PELTIER) chaveia o +12 V das 2 ventoinhas do radiador. ⭐ Os dois so RECEBEM ordem; quem confirma que a potencia chegou e o divisor no pino D25.',
    x: 374, largura: 70, altura: 60, cor: '#e8590c',
    nota: 'Dois módulos de relé de 1 canal, 5 V, com optoacoplador e jumper H/L, '
        + 'empilhados dentro de uma caixa modular DIN de 4 módulos. 51 × 25,5 mm cada. '
        + 'O DC+ e o DC− são pontelhados entre os dois lá dentro — sai UM par de fios.',
    grupos: [
      { ref: 'ALIM', lado: 'baixo', legenda: 'Alimentação dos dois módulos (2)', pinos: [
        via('+5V', 1, 'BD-5V saída 12 — DC+ dos dois, em ponte interna'),
        via('0V', 1, 'BD-0V · Z21 — DC− dos dois, em ponte interna'),
      ]},
      { ref: 'CMD', lado: 'cima', legenda: 'Gatilhos, vindos do Arduino (2)', pinos: [
        via('IN3', 1, '⭐ Mega D27 — KA3, autoriza a potência'),
        via('IN4', 1, '⭐ Mega D30 — KA4, ventoinhas do radiador'),
      ]},
      { ref: 'KA3', lado: 'baixo', legenda: '⚡ KA3 · POTÊNCIA — corta os 24 V dos BTS (2)', pinos: [
        via('COM3', 1, 'KA2 · A2 — o retorno da bobina do KA2 passa por aqui'),
        via('NO3', 1, 'BD-0V · Z12 — fecha o circuito da bobina'),
      ]},
      { ref: 'KA4', lado: 'baixo', legenda: '🌀 KA4 · FAN EXTERNA — ventoinhas do radiador (2)', pinos: [
        via('COM4', 1, 'BD-AUX saída 2 — os 12 V permanentes'),
        via('NC4', 1, '⭐ fio X5 → ventoinhas do radiador · + — É O NC, e é por isso que o Arduino morto VENTILA'),
      ]},
    ],
    avisos: [
      '⭐ OS DOIS JUMPERS EM **H** (gatilho ALTO). Assim digitalWrite(pino, HIGH) fecha o '
      + 'relé, que é a convenção intuitiva e a mesma dos jumpers do MV-1. Em L a lógica '
      + 'inverte e o firmware vira uma armadilha de leitura.',
      '🔥 O KA3 USA COM + NO. NUNCA O NC. Módulo sem energia = contato aberto = '
      + 'potência cortada. Ligado no NC a lógica inverte e o fail-safe morre: um Arduino '
      + 'desligado passaria a ARMAR a potência.',
      '🔥 JÁ O KA4 USA COM + NC, E ISSO NÃO É DESCUIDO — É O CONTRÁRIO DO KA3 DE '
      + 'PROPÓSITO. Os dois têm estados seguros OPOSTOS: para o KA3, seguro é potência '
      + 'cortada; para o KA4, seguro é ventoinha GIRANDO, porque o dissipador quente é o '
      + 'que mata a pastilha. Com o NC, Arduino morto, fio do D30 rompido ou 5 V caído '
      + 'deixam as ventoinhas ligadas. No NO, a mesma falha parava a ventilação sem '
      + 'alarme nenhum — era o pior caso do projeto. Ver Doc 31 §31.14.',
      '⚠️ E POR ISSO A LÓGICA DO D30 É INVERTIDA EM RELAÇÃO À DO D27: HIGH fecha o relé, '
      + 'o NC abre e as ventoinhas PARAM. LOW ou pino solto = elas GIRAM. Existe UMA '
      + 'função no firmware que escreve neste pino, e a inversão mora só lá dentro — '
      + 'é assim que uma inversão deixa de ser armadilha (Doc 40 §40.10).',
      '⚠️ RESISTOR DE 10 kΩ ENTRE CADA IN E O 0 V. O anúncio promete tolerância a falha '
      + '("linha de controle quebrada, o relé não funciona") e o LED do optoacoplador de '
      + 'fato precisa de corrente para acender. O resistor torna isso determinístico em '
      + 'vez de confiado: pino solto = 0 V no IN = relé aberto, medível com multímetro.',
      '📌 A ISOLAÇÃO É NOMINAL, NÃO GALVÂNICA. O módulo tem só 3 bornes de entrada '
      + '(DC+, DC−, IN), então o DC− É a referência do sinal — ele partilha o 0 V do '
      + 'Arduino. O optoacoplador entrega imunidade a ruído (a entrada é acionada por '
      + 'corrente, não por tensão), não separação de terras. Para isolação de verdade '
      + 'seria preciso a versão de 4 pinos, com JD-VCC e jumper removível.',
      '⚠️ CONFIRME QUE A BOBINA É DE 5 V. Estes anúncios vendem 5 / 12 / 24 V na mesma '
      + 'página e a FOTO costuma ser da versão de 24 V. Ao receber, leia o corpo do relé: '
      + 'tem de estar escrito 5VDC. Um módulo de 24 V não fecha com os 5 V do BD-5V.',
      '📌 65 mA CADA, do barramento de 5 V. São 130 mA a mais no ramal T2 — confira a '
      + 'soma com o Arduino, a tela e o ESP32 antes de fechar o projeto de energia.',
      '❓ "O ARDUINO SÓ MANDA E NÃO RECEBE DOS RELÉS?" — sim, e é de propósito. Ele não '
      + 'lê contato auxiliar nenhum. O que ele lê é o RESULTADO: o divisor 22k/4,7k no '
      + 'pino D25 mede se os 24 V realmente chegaram ao BD-POT. É melhor que ler o '
      + 'relé, porque um contato auxiliar diria "mandei fechar" enquanto o D25 diz '
      + '"a energia chegou" — e ele denuncia relé colado, fusível aberto, borne solto '
      + 'e emergência acionada, tudo com o mesmo fio.',
    ],
  },
  {
    id: 'MV-1', nome: 'MV-1 — liga as 5 ventoinhas INTERNAS da câmara', trilho: 2,
    resumoFuncao: '🔎 O QUE ELE FAZ: liga e desliga as 5 ventoinhas INTERNAS da camara (2 frias da Peltier, 2 dos dutos e a do PTC), todas juntas, pelo canal 3. Elas giram enquanto o ensaio roda — aquecendo ou resfriando — e param junto com ele. ⚠ Ele chaveia o NEGATIVO, e foi por isso que NAO pode comandar as ventoinhas do radiador: o tacometro delas e referenciado nesse mesmo negativo. Quem faz aquelas e o KA4.',
    x: 150, largura: 66, altura: 51, cor: '#0ca678',
    nota: 'Comanda os três grupos de ventoinha e ainda sobra um canal. Optoacoplador '
        + 'em cada entrada, jumper H/L por canal e 66 × 50,5 mm.',
    grupos: [
      { ref: 'CTRL', lado: 'cima', legenda: 'Comando — vem do Arduino (6)', pinos: [
        { nome: 'VCC', usa: true, para: 'BD-5V saída 9 — alimenta o lado do comando' },
        { nome: 'GND-C', usa: true, para: 'BD-0V · Z14 — retorno do COMANDO' },
        { nome: 'IN1' },
        { nome: 'IN2' },
        { nome: 'IN3', usa: true, para: '⭐ Mega D29 — TODAS as 5 ventoinhas internas' },
        { nome: 'IN4' },
      ]},
      { ref: 'VIN', lado: 'direita', legenda: 'Alimentação das cargas (2)', pinos: [
        { nome: 'VIN', usa: true, para: 'BD-AUX saída 1 — 12 V' },
        { nome: 'GND-P', usa: true, para: 'BD-0V · Z13 — retorno das CARGAS' },
      ]},
      { ref: 'OUT', lado: 'baixo', legenda: 'Saídas — 4 pares independentes (8)', pinos: [
        { nome: 'O1+' },
        { nome: 'O1−' },
        { nome: 'O2+' },
        { nome: 'O2−' },
        { nome: 'O3+', usa: true, para: '⭐ 2 frias + 2 do duto + PTC  (+)' },
        { nome: 'O3−', usa: true, para: '⭐ 2 frias + 2 do duto + PTC  (−)' },
        { nome: 'O4+' }, { nome: 'O4−' },
      ]},
      { ref: 'JMP', lado: 'esquerda', legenda: 'Jumpers H/L, um por canal (4)', pinos: [
        { nome: 'J1' },
        { nome: 'J2' },
        { nome: 'J3', usa: true, semFio: true, para: 'deixar em H (é POSIÇÃO de jumper, não fio)' },
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
      '🎁 SOBRAM OS CANAIS 2 E 4. O canal 2 era da ventoinha do PTC, que passou para o canal 3 — as internas todas têm a MESMA condição (ensaio rodando), então cabem num canal só. Liberou também o pino D28 do Mega.',
      '⭐ O CANAL 1 VOLTOU — MAS COMANDANDO UM GATE, NÃO UMA VENTOINHA. O erro da versão '
      + 'anterior não foi usar o módulo: foi pedir a um MOSFET de lado baixo que fosse o RETORNO '
      + 'de uma ventoinha com tacômetro. Hoje o O1− puxa apenas o gate do Q2 (um P-MOSFET que '
      + 'chaveia o POSITIVO), e o preto das ventoinhas fica em 0 V de verdade, sempre. Puxar um '
      + 'gate para 0 V é literalmente a função de um canal N de lado baixo.',
      '⚠️ USE SÓ O O1−. O O1+ FICA SEM FIO: ele é o VIN de 12 V do módulo passando, e aqui quem '
      + 'alimenta a ventoinha é o Q2. O LR7843 do módulo só enxerga os 12 V do pull-up R11 — bem '
      + 'dentro dos 30 V dele.',
    ],
  },

  /* ════════════ TRILHO 1 — DISTRIBUIÇÃO ════════════ */
  {
    id: 'BD-POT', nome: 'BD-POT — 24 V COMUTADO (morre na emergência)', trilho: 1,
    resumoFuncao: '🔎 O QUE ELE E: a barra dos 24 V que MORRE. Tudo o que sai daqui cai na emergencia, no STOP e em qualquer trip — sao os dois BTS. E daqui tambem que sai a amostra que o pino D25 vigia para saber se a potencia esta presente.',
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
    id: 'BD-AUX', nome: 'BD-AUX — 12 V das ventoinhas (permanente)', trilho: 1,
    resumoFuncao: '🔎 O QUE ELE E: os 12 V das ventoinhas, tambem permanente. Ele nao passa pelo KA2 de proposito: e o que permite as ventoinhas do radiador continuarem resfriando o dissipador quente DEPOIS de alguem socar o cogumelo.',
    x: 72, largura: 36, altura: 58, cor: '#fab005',
    grupos: [
      { ref: 'IN', lado: 'cima', legenda: 'Entrada 2,5 mm² (1)', pinos: [via('IN', 1, 'prensa-cabo do 12 V')] },
      { ref: 'OUT', lado: 'baixo', legenda: 'Saídas (4)', pinos: [
        via('O1', 1, 'MV-1 · VIN — alimenta os 4 canais'),
        via('O2', 1, '⭐ KA4 · COM — 12 V das ventoinhas do radiador, comandado'), via('O3'), via('O4'),
      ]},
    ],
    avisos: ['⭐ A SAÍDA O2 VAI AO COM4 DO MÓDULO DO KA4, e o NC4 dele é que segue '
           + 'para o fio X5. O contato chaveia o LADO POSITIVO das ventoinhas do '
           + 'radiador — nunca o negativo, que é a referência do tacômetro e foi o que '
           + 'quebrou na versão anterior. Doc 31 §31.14.',
           '🔥 É O NC (FECHADO EM REPOUSO), NÃO O NO. Com o módulo sem energia — '
           + 'Arduino morto, fio do D30 rompido, 5 V caído — as ventoinhas GIRAM. Este '
           + 'é o único ponto do painel em que o estado seguro é LIGADO.',
           '⭐ O BD-AUX NÃO PASSA PELO KA2 DE PROPÓSITO. Com o cogumelo socado e o '
           + 'dissipador a 60 °C, estes 12 V continuam de pé e as ventoinhas continuam '
           + 'girando — até o DS18B20 dizer que esfriou.',
           '⭐ O D2 (1N4007) É DE RODA-LIVRE DO MOTOR, catodo no +12 V, montado junto '
           + 'das ventoinhas. Ventoinha é carga indutiva e nada mais a grampeia.'],
  },
  {
    id: 'BD-24V', nome: 'BD-24V — 24 V PERMANENTE (comando)', trilho: 1,
    resumoFuncao: '🔎 O QUE ELE E: a barra dos 24 V que SOBREVIVE. Alimenta a cadeia de comando (o cogumelo, o rearme, os reles) e as duas posicoes de ensaio. ⭐ Tem de ser permanente: se a cadeia de comando fosse alimentada pela potencia que ela mesma comanda, nada nunca ligaria. ⭐ AS SAIDAS O3 E O5 FICARAM LIVRES quando os sinaleiros passaram para 5 V — antes elas levavam o positivo comum das lampadas e o COM do ULN2803.',
    x: 114, largura: 45, altura: 58, cor: '#e8590c',
    nota: 'PERMANENTE — não cai na emergência.',
    grupos: [
      { ref: 'IN', lado: 'cima', legenda: 'Entrada 2,5 mm² (1)', pinos: [via('IN', 1, 'prensa-cabo dos 24 V de serviços')] },
      { ref: 'OUT', lado: 'baixo', legenda: 'Saídas (6)', pinos: [
        via('O1', 1, 'DNLCB30 · VIN'), via('O2', 1, 'cadeia de comando · S0'),
        via('O3'), via('O4', 1, 'F-P1/F-P2 — entrada do porta-fusível'),
        via('O5'), via('O6'),
      ]},
    ],
  },
  {
    id: 'BD-5V', nome: 'BD-5V — 5,10 V da eletrônica (permanente)', trilho: 1,
    resumoFuncao: '🔎 O QUE ELE E: os 5,10 V de toda a eletronica — Mega, IHM, ESP32, RTC e os dois modulos de rele. Permanente: o Arduino tem de continuar vivo depois da emergencia para registrar o evento no log e mostrar o alerta na tela.',
    x: 165, largura: 87, altura: 58, cor: '#f08c00',
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
        via('O11', 1, 'DS18B20 do radiador · VCC'), via('O12', 1, '⭐ KA3 + KA4 · DC+ — alimenta os dois módulos de relé'), via('O13'),
      ]},
    ],
    avisos: ['📌 Cresceu de 10 para 12 pontos quando o AM2315C ganhou saída própria. '
           + 'As 11 cargas de 5 V somam ~310 mA — o LM2596 de 2 A trabalha folgado.'],
  },
  {
    id: 'BD-0V', nome: 'BD-0V — retorno único de tudo (star ground)', trilho: 1,
    resumoFuncao: '🔎 O QUE ELE E: o ponto onde TODO retorno do painel se encontra, um parafuso por dispositivo. ⭐ Estrela, nunca em cadeia: pendurar um retorno no outro faz a corrente de um virar erro de medicao do outro — e como os BTS chaveiam, esse erro PISCA no ritmo do PWM. Chama-se acoplamento por impedancia comum e e a causa numero 1 de medicao ruim em painel.',
    x: 258, largura: 105, altura: 58, cor: '#212529',
    nota: '⭐ O ÚNICO 0 V do projeto. Barra de 24 pontos — três blocos de 8, ligados por '
        + 'ponte de 4 mm². ⭐ Subiu de 20 para 24 quando o retorno da posição de ensaio '
        + 'passou a vir direto para cá, em vez de atravessar o shunt da PI-2.',
    grupos: [
      { ref: 'IN', lado: 'cima', legenda: 'Entrada 10 mm² (1)', pinos: [via('IN', 1, 'retorno do padrão de entrada')] },
      { ref: 'R', lado: 'baixo', legenda: 'Retornos (20 pontos)', pinos: [
        via('Z1', 1, 'BTS #1 · B−'), via('Z2', 1, 'BTS #2 · B−'),
        via('Z3', 1, 'BTS #1 · GND lógica'), via('Z4', 1, 'BTS #2 · GND lógica'),
        via('Z5', 1, 'Arduino · GND'), via('Z6', 1, 'PI-1 J1-9'),
        via('Z7', 1, 'DNLCB30 · −'), via('Z8', 1, 'RTC DS3231 · GND'),
        via('Z9', 1, 'tela ES3C28P · GND'), via('Z10', 1, 'conversor de nível · GND'),
        via('Z11', 1, 'KA1 · A2'),
        via('Z12', 1, '⭐ KA3 · NO3 — o retorno da bobina, depois do contato do módulo de relé'),
        via('Z13', 1, 'MV-1 · GND da carga (lado VIN)'),
        via('Z14', 1, 'MV-1 · GND do comando (lado isolado)'),
        via('Z15', 1, '⭐ AM2315C · GND — o sensor DENTRO da câmara'),
        via('Z16', 1, 'LEDs da maquete −'),
        via('Z17', 1, 'PI-2 · 0V — retorno das posições, depois dos shunts'),
        via('Z18', 1, 'seletora LOCAL/REMOTO — contato para o 0 V'),
        via('Z19', 1, 'DS18B20 do radiador · GND'),
        via('Z20', 1, '⭐ retorno das ventoinhas do radiador — referência dos 2 RPM'),
        via('Z21', 1, '⭐ KA3 + KA4 · DC− — retorno dos dois módulos de relé'),
        via('Z22', 1, 'retorno do DUT da posição de ensaio — direto, sem shunt'),
        via('Z23'), via('Z24'),
      ]},
    ],
    avisos: ['🔥 É o componente mais fácil de subdimensionar. Chegam 18 retornos + a '
           + 'entrada. Um bloco comum de 8 saídas NÃO serve.'],
  },
  {
    id: 'RTC', nome: 'RTC DS3231 — data e hora reais para o log', trilho: 3,
    resumoFuncao: '🔎 O QUE ELE FAZ: guarda data e hora reais, com pilha propria, para que cada linha do log tenha carimbo de tempo verdadeiro mesmo depois de faltar energia. Sem ele o log comecaria em 1970 a cada boot, e a rastreabilidade do ensaio morreria.',
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
    id: 'HMI', nome: 'IHM — configura o ciclo, INICIAR, e grava o log no SD', porta: true,
    resumoFuncao: '🔎 O QUE ELA FAZ: e por onde o operador trabalha. Configura o ciclo, aperta INICIAR, ve temperatura e estado, e grava o log no cartao SD. ⭐ O INICIAR dela liga o PID e o PWM — NAO arma a potencia. Quem arma e o botao verde da porta.',
    x: 70, y: 40, largura: 50, altura: 86, cor: '#1971c2',
    nota: '⚠️ Recorte da porta 47 × 61 mm, EM RETRATO. Reserve 25 mm livres atrás.',
    grupos: [
      { ref: 'UART', lado: 'baixo', legenda: 'Conector UART (4)', pinos: [
        via('5V'), via('GND-UART', 1, 'conversor · GND-LV — a referência do lado de 3,3 V'),
        via('TXD · IO44', 1, 'conversor · RXI'), via('RXD · IO43', 1, 'conversor · TXO'),
      ]},
      { ref: 'I2C', lado: 'cima', legenda: 'Conector I²C (4)', pinos: [
        via('3V3', 1, 'conversor · LV'), via('GND-I2C'), via('SDA · IO16'), via('SCL · IO15'),
      ]},
      { ref: 'EXP', lado: 'cima', legenda: 'Expansão (4)', pinos: [
        via('IO2'), via('IO3'), via('IO14'), via('IO21'),
      ]},
      { ref: 'BAT', lado: 'baixo', legenda: 'Bateria (2)', pinos: [via('BAT+'), via('BAT−')] },
      /* ⭐ NÃO SÃO DUAS COISAS: VBUS e GND-PWR são o vermelho e o preto do
         MESMO Type-C. VBUS é o +5 V dele; GND-PWR é o retorno dele. Não
         existe alimentar por um sem o outro — é um par, como qualquer
         alimentação. Quem entra pelo Type-C entra pelos dois. */
      { ref: 'USB', lado: 'esquerda', legenda: 'Type-C — o +5 V e o 0 V dele (2)',
        parAlim: true, pinos: [
        via('VBUS', 1, '+5 V do Type-C ← BD-5V saída 2'),
        via('GND-PWR', 1, '0 V do Type-C → BD-0V · Z9'),
      ]},
    ],
    avisos: ['🔥 NÃO ligue o pino 5 V do conector UART. A wiki lista só Type-C e bateria '
           + 'como entradas de alimentação — esse pino é provavelmente saída.',
             '🔋 Deixe o conector BAT vazio. Lítio dentro de painel fechado é risco sem '
           + 'contrapartida.'],
  },
  {
    id: 'CONV', nome: 'CONV — adapta 5 V ↔ 3,3 V entre o Mega e a IHM', porta: true,
    resumoFuncao: '🔎 O QUE ELE FAZ: o Mega fala em 5 V e a tela IHM so aguenta 3,3 V. Sem este tradutor no meio, o pino RXD da tela se degrada — e o pior e que parece funcionar no comeco, porque os diodos internos de protecao grampeiam a tensao.',
    x: 134, y: 44, largura: 34, altura: 22, cor: '#7048e8',
    escala: 'ampliado — a placa real tem 14,7 × 12,7 mm',
    nota: 'Monta atrás da tela, em espaçadores de nylon. ⚠️ No desenho ele está '
        + 'ampliado: a placa real tem 14,7 × 12,7 mm e os pinos ficariam menores '
        + 'que a letra.',
    grupos: [
      { ref: 'HV', lado: 'cima', legenda: 'Lado alto — 5 V (6)', pinos: [
        via('TXI', 1, 'Mega D16'), via('HV', 1, 'BD-5V saída 7'),
        via('GND-HV', 1, 'BD-0V · Z10 — referência do lado de 5 V'),
        via('RXO', 1, 'Mega D17'), via('TXI2'), via('RXO2'),
      ]},
      { ref: 'LV', lado: 'baixo', legenda: 'Lado baixo — 3,3 V (6)', pinos: [
        via('TXO', 1, 'tela · RXD IO43'), via('LV', 1, 'tela · 3,3 V do conector I²C'),
        via('GND-LV', 1, 'tela · GND-UART — referência do lado de 3,3 V'), via('RXI', 1, 'tela · TXD IO44'),
        via('TXO2'), via('RXI2'),
      ]},
    ],
    avisos: ['⚠️ Cada canal é UNIDIRECIONAL. TXI→TXO leva de cima para baixo, RXI→RXO de '
           + 'baixo para cima. Trocar não queima, mas não comunica.'],
  },
  ...['ENERGIZADO', 'RESFRIANDO', 'AQUECENDO', 'FALHA'].map((nome, i) => ({
    id: `H${i + 1}`, nome: `Sinaleiro H${i + 1} — ${nome}`, porta: true,
    resumoFuncao: `🔎 O QUE ELE MOSTRA: ${nome}. ⭐ Sao de 5 V e o pino do Arduino os acende DIRETO — nao ha CI, rele nem resistor no meio. O vermelho de FALHA continua aceso com a emergencia acionada porque o BD-5V nao cai: quem alimenta o Arduino sobrevive ao cogumelo, e e o Arduino que segura o pino em nivel alto.`,
    x: 52 + i * 42, y: 175, largura: 30, altura: 30,
    cor: ['#2f9e44', '#1971c2', '#e8590c', '#c92a2a'][i],
    grupos: [{ ref: 'LMP', lado: 'baixo', legenda: 'Sinaleiro 22 mm · 5 V (2)', pinos: [
      /* ⭐ AGORA CADA UM TEM SEU FIO DE COMANDO — o pino do Arduino é o
         positivo dele. O que se encadeia é o NEGATIVO: três pontes curtas
         na porta e um retorno só até o GND do Mega. */
      via('+', 1, `Mega D${9 + i} — o pino acende direto (~20 mA)`),
      via('−', 1, i === 3 ? 'retorno dos quatro → GND2 do Mega'
        : `ponte curta para o H${i + 2} · −`),
    ]}],
    avisos: ['⚠️ 20 mA é o limite recomendado do pino do Mega. Meça o sinaleiro com fonte '
           + 'de bancada antes de ligar (passo A-02): se puxar mais que isso, ele não pode '
           + 'ir direto no pino.'],
  })),
  {
    id: 'S1', nome: 'S1 · LIGAR (verde) — arma a potência, NÃO inicia o ensaio', porta: true,
    resumoFuncao: '🔎 O QUE ELE FAZ: ARMA A POTENCIA. Refaz o selo do KA2 e traz os 24 V de volta ao BD-POT. ⭐ Ele NAO inicia o ensaio — isso e o INICIAR da tela IHM. E o Arduino nem o le: nao ha fio dele ate pino nenhum. O firmware descobre que a potencia voltou pelo divisor no D25, do mesmo jeito que ignora o REARME azul.',
    x: 147, y: 250, largura: 30, altura: 30, cor: '#2f9e44',
    nota: '⭐ Bloco de 24 V, na cadeia de comando — NÃO é um botão de sinal. Ele ARMA a '
        + 'potência refazendo o selo do KA2. O Arduino nem o lê.',
    grupos: [{ ref: 'NA24', lado: 'baixo', legenda: 'Bloco NA de 24 V — contatos 13-14', pinos: [
      via('13', 1, 'nó do STOP — vem do S2 · 12'),
      via('14', 1, 'KA2 · A1 — refaz o selo do KA2'),
    ]}],
    avisos: ['⭐ ELE ARMA A POTÊNCIA, NÃO INICIA O ENSAIO. São duas coisas diferentes e '
           + 'com nomes parecidos: o VERDE traz os 24 V de volta ao BD-POT (hardware); o '
           + 'INICIAR da tela IHM liga o PID e o PWM (software). Etiquete-o como LIGAR '
           + 'para o operador não confundir.',
             '📌 UM BLOCO SÓ, e de 24 V. Diferente do S2, este botão não tem contato de '
           + '5 V: o Arduino descobre que a potência voltou pelo divisor no D25, do mesmo '
           + 'jeito que já ignora o REARME azul.'],
  },
  {
    id: 'S2', nome: 'S2 · STOP (preto) — corta a potência E avisa o Arduino', porta: true,
    resumoFuncao: '❓ E AQUI QUE O ARDUINO DESCOBRE QUE APERTARAM O STOP. O botao tem DOIS blocos de contato empilhados atras da mesma pastilha plastica, acionados pelo mesmo dedo — mas eletricamente SEPARADOS. O bloco de 24 V (11-12) derruba o selo do KA2 e corta a potencia sem o Arduino participar de nada. O bloco de 5 V (13-14) fecha para o 0 V no pino D23, e e SO por ele que o firmware fica sabendo. Um botao, dois circuitos que nao se tocam.',
    x: 57, y: 250, largura: 30, altura: 30, cor: '#212529',
    nota: '⭐ AQUI ESTÁ A RESPOSTA PARA "como o Arduino sabe que apertaram o STOP?". '
        + 'O botão tem DOIS blocos de contato, empilhados atrás do mesmo cogumelo '
        + 'plástico e acionados pelo mesmo dedo — mas eletricamente SEPARADOS. O de '
        + '24 V derruba o selo do KA2 (hardware, o Arduino nem participa); o de 5 V '
        + 'fecha para o 0 V no pino D23 e é por ele que o firmware fica sabendo. '
        + 'Um botão, dois circuitos que não se tocam.',
    grupos: [
    { ref: 'NF24', lado: 'baixo', legenda: 'Bloco NF de 24 V — contatos 11-12', pinos: [
      via('11', 1, '⚡ HARDWARE: KA1 · 14 (contato de saída)'),
      via('12', 1, '⚡ HARDWARE: nó do selo do KA2 — vai ao S1 · 13 e ao KA2 · 21'),
    ]},
    { ref: 'NA5', lado: 'cima', legenda: 'Bloco NA de 5 V — contatos 13-14', pinos: [
      via('13', 1, '⚡ 0 V comum dos comandos (vem do BD-0V · Z18)'),
      via('14', 1, 'Mega D23 — INPUT_PULLUP, LOW = apertado'),
    ]}],
    avisos: ['🔥 NÃO CONFUNDA OS DOIS BLOCOS. O de 24 V (11-12) é o que corta de verdade; '
           + 'o de 5 V (13-14) só avisa. Ligar o Arduino no bloco de 24 V queima o pino '
           + 'D23 na hora; ligar a cadeia no bloco de 5 V deixa o STOP sem efeito nenhum '
           + 'em hardware. É o erro nº 1 do Doc 31 §31.5.',
             '⚠️ O bloco chaveia para o 0 V, NÃO para o 5 V. Com INPUT_PULLUP o Arduino '
           + 'já segura o pino em 5 V por dentro — ligado ao 5 V o pino lê HIGH '
           + 'apertado ou não, e o STOP nunca acontece.'],
  },
  {
    id: 'S3', nome: 'S3 · REARME (azul) — só depois da emergência', porta: true,
    resumoFuncao: '🔎 O QUE ELE FAZ: refaz o selo do KA1, e so isso. E o unico jeito de sair de uma emergencia — destravar o cogumelo NAO religa nada. A norma exige que religar seja um ato separado e deliberado de uma pessoa, e este botao azul e essa pessoa. Depois dele, ainda falta o verde para armar a potencia.',
    x: 192, y: 250, largura: 30, altura: 30, cor: '#1971c2',
    grupos: [{ ref: 'NA', lado: 'baixo', legenda: 'Bloco NA de 24 V — contatos 13-14', pinos: [
      via('13', 1, 'nó CMD — a cadeia, depois do cogumelo'),
      via('14', 1, 'KA1 · A1 — refaz o selo'),
    ]}],
  },
  {
    id: 'S0', nome: 'S0 · EMERGÊNCIA — corta tudo em hardware e trava', porta: true,
    resumoFuncao: '🔎 O QUE ELE FAZ: derruba o selo do KA1 e, com ele, TUDO. Corta em hardware puro, sem uma linha de firmware no caminho, e TRAVA: destravar o cogumelo nao devolve energia nenhuma. O segundo bloco, de 5 V, avisa o pino D24 — mas so para o firmware registrar no log e mostrar na tela. Ele nao participa do corte.',
    x: 142, y: 330, largura: 44, altura: 44, cor: '#c92a2a',
    nota: 'Cogumelo com trava. Dois blocos NF: um corta a potência, o outro avisa o '
        + 'Arduino.',
    /* ⭐ OS DOIS BLOCOS SAEM POR LADOS OPOSTOS, cada um para a canaleta
       da sua classe: o de 24 V é cadeia de comando (potência) e sobe;
       o de 5 V é leitura do Arduino (sinal) e desce. */
    grupos: [
    { ref: 'NF24', lado: 'cima', legenda: 'Bloco NF de 24 V — contatos 11-12', pinos: [
      via('11', 1, 'BD-24V saída 2'), via('12', 1, 'cadeia → KA1 · A1'),
    ]},
    { ref: 'NF5', lado: 'baixo', legenda: 'Bloco NF de 5 V — contatos 21-22', pinos: [
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
