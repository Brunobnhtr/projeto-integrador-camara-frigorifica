/**
 * PI-2 — LAYOUT FÍSICO DA PLACA ILHADA
 * ====================================
 *
 * Mesma convenção da PI-1: coordenadas em FUROS, não em milímetros.
 * O furo (col, lin) fica em x = col × 2,54 mm · y = lin × 2,54 mm.
 *
 * ⚠️ A DIFERENÇA PARA A PI-1: aqui não há circuito integrado nu num
 * soquete. Há dois MÓDULOS COMPRADOS que se encaixam em barras de
 * pinos fêmea soldadas na placa. Você não solda o CI — solda a barra,
 * e o módulo entra e sai.
 */

export const PASSO = 2.54;

export const PLACA = {
  colunas: 24,
  linhas: 29,
  get larguraMm() { return this.colunas * PASSO; },  // 60,96 mm
  get alturaMm() { return this.linhas * PASSO; },    // 73,66 mm
  /* ⭐ A PLACA COMPRADA É DE 7 × 9 cm.
     A largura já bate: 24 colunas × 2,54 = 60,96 mm, que é o que cabe
     nos 61 mm úteis da caixa DIN de 4 módulos. Só a ALTURA sobra —
     e sobra numa direção só, então é um corte reto, ao longo de uma
     fileira de furos. Nada de recorte em L. */
  bruta: {
    nome: 'Placa ilhada 7 × 9 cm (AliExpress)',
    colunas: 24, linhas: 36,   // ⚠️ conferir contando na placa que chegar
    furos: '24 × 36 furos — ⚠️ CONTE quando chegar, há versões de 25 × 35',
    corte: 'Corte na fileira 30, tirando 7 fileiras (≈ 17,8 mm). Risque dos '
         + 'dois lados com estilete apoiado numa régua de metal, na LINHA ENTRE '
         + 'furos, e quebre apoiando na quina da bancada.',
    sobra: 'A tira que sai (24 × 7 furos) serve de gabarito para conferir o '
         + 'espaçamento dos bornes antes de soldar na placa boa.',
  },
  caixa: 'Caixa modular DIN de 4 módulos (70 mm)',
  nota: 'Mesma caixa da PI-1. O borne J3 tem 7 vias × 5,08 = 35,6 mm e divide '
      + 'a borda de baixo com o J2 (2 vias) — juntos dão 45,7 mm nos 61 disponíveis.',
};

/* ── BORNES ─────────────────────────────────────────────────────────── */
export const BORNES = [
  {
    ref: 'J1', papel: 'RETORNOS DA CÂMARA', linha: 2, corpo: [0.4, 4.0],
    cor: '#c92a2a',
    vias: [
      { n: 1, col: 2, sinal: 'RET-1', de: 'volta do DUT da posição 1 — passa pelo INA219 e pelo shunt R1' },
      { n: 2, col: 4, sinal: 'RET-2', de: 'volta do DUT da posição 2 — vai direto ao shunt R2' },
      { n: 3, col: 6, sinal: 'RET-3', de: 'reserva — borne montado, falta o shunt e o jumper para C2', livre: true },
      { n: 4, col: 8, sinal: 'RET-4', de: 'reserva — idem, para C3', livre: true },
    ],
  },
  {
    ref: 'J2', papel: 'ALIMENTAÇÃO', linha: 28, corpo: [26.0, 29.6],
    cor: '#f08c00',
    vias: [
      { n: 1, col: 2, sinal: '0V',  para: 'BD-0V · R17 — sai DEPOIS dos shunts' },
      { n: 2, col: 4, sinal: '+5V', para: 'BD-5V saída 8 — alimenta o mux e o INA219' },
    ],
  },
  {
    ref: 'J3', papel: 'SINAIS PARA O ARDUINO', linha: 28, corpo: [26.0, 29.6],
    cor: '#ae3ec9',
    vias: [
      { n: 1, col: 8,  sinal: 'S0',  para: 'Mega D31 — seleção de canal, bit 0' },
      { n: 2, col: 10, sinal: 'S1',  para: 'Mega D32 — bit 1' },
      { n: 3, col: 12, sinal: 'S2',  para: 'Mega D33 — bit 2' },
      { n: 4, col: 14, sinal: 'S3',  para: 'Mega D34 — bit 3' },
      { n: 5, col: 16, sinal: 'SIG', para: 'Mega A2 — a leitura dos 16 canais sai por aqui', alerta: true },
      { n: 6, col: 18, sinal: 'SDA', para: 'Mega D20 — só do INA219 de referência' },
      { n: 7, col: 20, sinal: 'SCL', para: 'Mega D21' },
    ],
  },
];

/* ── BARRAMENTO DE 0 V ──────────────────────────────────────────────── */
export const BARRAMENTO_0V = { linha: 11, de: 2, ate: 21 };

/* ── COMPONENTES DISCRETOS ──────────────────────────────────────────── */
export const COMPONENTES_PI2 = [
  {
    ref: 'R1', tipo: 'resistor', valor: '47 Ω 1%', circuito: 1,
    furos: [[2, 6], [2, 11]],
    polaridade: false,
    ligacao: 'Perna de cima no nó RET-1 (furo 2,6), perna de baixo no barramento de 0 V '
           + '(furo 2,11). Montado EM PÉ, porque é o que cabe entre o nó e o barramento.',
    papel: 'O shunt da posição 1 — transforma corrente em tensão',
    porque: 'A corrente do DUT tem que atravessar este resistor para chegar ao 0 V. '
          + 'Atravessando, cria sobre ele uma tensão de 17,6 mA × 47 Ω = 0,83 V — que o '
          + 'multiplexador lê. Sem o shunt não existe nada para medir.',
  },
  {
    ref: 'R2', tipo: 'resistor', valor: '47 Ω 1%', circuito: 2,
    furos: [[7, 6], [7, 11]],
    polaridade: false,
    ligacao: 'Perna de cima no nó RET-2 (furo 7,6), perna de baixo no barramento (furo 7,11).',
    papel: 'O shunt da posição 2',
    porque: 'Mesmo valor do R1, de propósito. A posição 2 consome menos (9,8 mA) e entrega '
          + '0,46 V — a diferença entre as duas leituras é justamente o que prova que cada '
          + 'posição é comparada com o normal dela.',
  },
];

/* ── MÓDULOS ENCAIXADOS ─────────────────────────────────────────────────
 * Não são CIs soldados: são placas prontas que entram em barra de pinos
 * fêmea. Você solda a BARRA; o módulo entra depois e pode sair.
 *
 * ⚠️ As medidas do corpo são a RESERVA de espaço, não a medida conferida.
 * Reservei generoso de propósito: se o módulo chegar menor, sobra espaço;
 * se eu reservasse justo e ele viesse maior, a placa estaria errada.
 */
export const MODULOS = [
  {
    ref: 'M1', valor: 'CD74HC4067', descricao: 'multiplexador de 16 canais',
    circuito: 3, cor: '#ae3ec9',
    corpo: { colEsq: 2, colDir: 20, linTopo: 14, linBase: 23 },
    aConferir: 'Conferir o comprimento real da barra de 16 canais quando o módulo chegar. '
             + 'Reservei 16 furos (40,6 mm) para ela.',
    papel: 'Uma chave rotativa eletrônica. Ele liga UM dos 16 canais ao pino SIG, e quem '
         + 'escolhe qual é o Arduino, pelos 4 bits S0–S3.',
    porque: 'Um só circuito de medição atende 16 posições. Dá para fazer isso porque '
          + 'dispositivo morto continua morto — não é preciso ler rápido, é preciso ler '
          + 'todos.',
    aviso: 'O pino EN é ATIVO EM NÍVEL BAIXO e NÃO tem borne: vai soldado direto ao '
         + 'barramento de 0 V. Deixá-lo solto faz o mux ficar permanentemente desligado '
         + 'e todas as leituras darem zero — que é exatamente o sintoma de "todos os '
         + 'dispositivos morreram".',
    pinos: [
      /* barra dos 16 canais — borda de cima do módulo */
      ...Array.from({ length: 16 }, (_, i) => ({
        n: i + 1, nome: `C${i}`, col: 3 + i, lin: 15,
        livre: i > 1,
      })),
      /* barra de controle — borda de baixo */
      { n: 17, nome: 'S0',  col: 3,  lin: 22 },
      { n: 18, nome: 'S1',  col: 4,  lin: 22 },
      { n: 19, nome: 'S2',  col: 5,  lin: 22 },
      { n: 20, nome: 'S3',  col: 6,  lin: 22 },
      { n: 21, nome: 'EN',  col: 7,  lin: 22, alerta: true },
      { n: 22, nome: 'SIG', col: 8,  lin: 22 },
      { n: 23, nome: 'VCC', col: 9,  lin: 22 },
      { n: 24, nome: 'GND', col: 10, lin: 22 },
    ],
  },
  {
    ref: 'M2', valor: 'INA219', descricao: 'medidor de referência',
    circuito: 4, cor: '#f08c00',
    corpo: { colEsq: 12, colDir: 22, linTopo: 3, linBase: 9 },
    aConferir: 'A maioria dos módulos GY-219 traz VIN+ / VIN− num borne de parafuso, e '
             + 'não em pino. Se for o caso, os furos [14,8] e [17,8] viram os do borne.',
    papel: 'O instrumento de referência. Fica em série com o retorno da posição 1, ANTES '
         + 'do shunt R1 — mede a mesma corrente que o mux vai medir.',
    porque: '⭐ É a prova da banca. Se o INA219 e o multiplexador dizem o mesmo número na '
          + 'posição 1, está demonstrado que o mux mede certo — e portanto que as outras '
          + '15 posições, que não têm INA219, também estão certas. Um instrumento '
          + 'calibrado validando um método barato.',
    aviso: 'A corrente da posição 1 passa POR DENTRO dele, entre VIN+ e VIN−. Não é um '
         + 'sensor que se encosta no fio: ele fica NO caminho. Ligar VIN+ e VIN− trocados '
         + 'faz a leitura sair negativa.',
    pinos: [
      { n: 1, nome: 'VCC',  col: 13, lin: 4 },
      { n: 2, nome: 'GND',  col: 15, lin: 4 },
      { n: 3, nome: 'SCL',  col: 17, lin: 4 },
      { n: 4, nome: 'SDA',  col: 19, lin: 4 },
      { n: 5, nome: 'VIN+', col: 14, lin: 8, alerta: true },
      { n: 6, nome: 'VIN−', col: 17, lin: 8, alerta: true },
    ],
  },
];

/* ── NÓS ────────────────────────────────────────────────────────────── */
export const NOS = [
  { ref: 'nó RET-1', linha: 6, de: 2, ate: 4, circuito: 1,
    furos: { 2: 'perna de cima do R1', 3: 'chega o fio do INA219 · VIN−',
             4: 'sai o fio para o canal C0 do mux' },
    nota: 'É AQUI que a medição acontece. A tensão deste nó em relação ao 0 V é '
        + 'exatamente o que o shunt R1 está criando — e é ela que o mux entrega ao '
        + 'Arduino quando seleciona o canal 0.' },
  { ref: 'nó RET-2', linha: 6, de: 7, ate: 9, circuito: 2,
    furos: { 7: 'perna de cima do R2', 8: 'chega o fio de J1-2 (RET-2)',
             9: 'sai o fio para o canal C1 do mux' },
    nota: 'Igual ao nó RET-1, mas sem INA219 no caminho — a posição 2 é medida só pelo '
        + 'multiplexador.' },
];

/* ── JUMPERS ────────────────────────────────────────────────────────── */
export const JUMPERS = [
  { n: 1,  de: [2, 2],   para: [14, 8],  circuito: 1, sinal: 'RET-1 → INA219 VIN+' },
  { n: 2,  de: [17, 8],  para: [3, 6],   circuito: 1, sinal: 'INA219 VIN− → nó RET-1' },
  { n: 3,  de: [4, 6],   para: [3, 15],  circuito: 1, sinal: 'nó RET-1 → mux C0', cruzaBus: true },
  { n: 4,  de: [4, 2],   para: [8, 6],   circuito: 2, sinal: 'RET-2 → nó RET-2' },
  { n: 5,  de: [9, 6],   para: [4, 15],  circuito: 2, sinal: 'nó RET-2 → mux C1', cruzaBus: true },
  { n: 6,  de: [2, 28],  para: [2, 11],  circuito: 0, sinal: '0 V do borne → barramento' },
  { n: 7,  de: [4, 28],  para: [9, 22],  circuito: 3, sinal: '+5 V → mux VCC' },
  { n: 8,  de: [4, 28],  para: [13, 4],  circuito: 4, sinal: '+5 V → INA219 VCC' },
  { n: 9,  de: [10, 22], para: [10, 11], circuito: 0, sinal: 'mux GND → barramento' },
  { n: 10, de: [7, 22],  para: [7, 11],  circuito: 3, sinal: '⚠️ mux EN → barramento (0 V)', alerta: true },
  { n: 11, de: [15, 4],  para: [15, 11], circuito: 0, sinal: 'INA219 GND → barramento' },
  { n: 12, de: [3, 22],  para: [8, 28],  circuito: 3, sinal: 'mux S0 → J3-1' },
  { n: 13, de: [4, 22],  para: [10, 28], circuito: 3, sinal: 'mux S1 → J3-2' },
  { n: 14, de: [5, 22],  para: [12, 28], circuito: 3, sinal: 'mux S2 → J3-3' },
  { n: 15, de: [6, 22],  para: [14, 28], circuito: 3, sinal: 'mux S3 → J3-4' },
  { n: 16, de: [8, 22],  para: [16, 28], circuito: 3, sinal: 'mux SIG → J3-5' },
  { n: 17, de: [19, 4],  para: [18, 28], circuito: 4, sinal: 'INA219 SDA → J3-6', cruzaBus: true },
  { n: 18, de: [17, 4],  para: [20, 28], circuito: 4, sinal: 'INA219 SCL → J3-7', cruzaBus: true },
];

/* ── AS PERGUNTAS QUE ESTA PLACA LEVANTA ────────────────────────────── */
export const DUVIDAS = {
  1: [
    { p: 'Por que chega o RETORNO aqui, e não o positivo?',
      r: 'Porque o shunt precisa ter um dos lados no 0 V. Assim a tensão sobre ele fica '
       + 'referenciada ao 0 V, que é o que o multiplexador e o ADC do Arduino sabem ler. '
       + 'Se o shunt ficasse no lado do positivo, ele estaria "flutuando" a 24 V e seria '
       + 'preciso um amplificador diferencial por canal — caro e desnecessário. '
       + 'O positivo vai do fusível DIRETO para a câmara e nunca entra nesta placa.' },
    { p: 'A corrente passa por dentro do INA219?',
      r: 'SIM, e esta é a diferença dele para o capacitor da PI-1. Ele fica NO caminho: '
       + 'a corrente entra por VIN+ e sai por VIN−. Não é um sensor que se encosta no fio.' },
    { p: 'Por que só a posição 1 tem INA219?',
      r: 'Porque ele é o instrumento de AFERIÇÃO, não o método. Se o INA219 e o mux dão o '
       + 'mesmo número na posição 1, está provado que o mux mede certo — e o mesmo vale '
       + 'para as outras 15 posições, que não precisam de INA219 nenhum. É assim que se '
       + 'defende a solução barata: mostrando que ela bate com a cara.' },
  ],
  3: [
    { p: 'Por que o EN não tem borne?',
      r: 'Porque ele nunca muda. O EN é ativo em nível BAIXO — em 0 V o mux funciona, em '
       + '5 V ele desliga todos os canais. Como o mux tem que ficar sempre ligado, o pino '
       + 'vai soldado direto ao barramento de 0 V. Um borne aqui só criaria a chance de '
       + 'alguém deixá-lo solto.' },
    { p: 'O que acontece se eu esquecer de soldar o EN?',
      r: '🔥 Entrada flutuante em CMOS não é "nível baixo" — ela oscila com o ruído. O mux '
       + 'ficaria ligando e desligando sozinho, e as leituras dariam zero na maior parte '
       + 'do tempo. O sintoma seria "todos os dispositivos morreram ao mesmo tempo" — que '
       + 'é justamente o alarme de sistema. Confira este jumper antes de energizar.' },
    { p: 'Os 70 Ω de resistência interna do mux não atrapalham?',
      r: 'Não, e a razão é boa: a entrada analógica do Arduino praticamente não puxa '
       + 'corrente. Sem corrente, não há queda sobre os 70 Ω — `V = R × 0 = 0`. Eles só '
       + 'importariam se o mux tivesse que alimentar alguma coisa.' },
  ],
};

/* ── OS 5 CIRCUITOS ─────────────────────────────────────────────────── */
export const CIRCUITOS = [
  { id: 0, nome: 'Barramento de 0 V', cor: '#212529',
    resumo: 'O retorno comum, DEPOIS dos shunts. Toda a corrente medida passa por aqui.' },
  { id: 1, nome: 'Medição da posição 1', cor: '#c92a2a',
    resumo: 'RET-1 → INA219 → nó → shunt R1 → 0 V. O canal C0 lê a tensão do nó.' },
  { id: 2, nome: 'Medição da posição 2', cor: '#2f9e44',
    resumo: 'RET-2 → nó → shunt R2 → 0 V. O canal C1 lê o nó. Sem INA219.' },
  { id: 3, nome: 'Comando do multiplexador', cor: '#ae3ec9',
    resumo: 'S0–S3 escolhem o canal, SIG entrega a leitura, EN fica preso no 0 V.' },
  { id: 4, nome: 'I²C do INA219', cor: '#f08c00',
    resumo: 'SDA e SCL saem para o Arduino, dividindo o barramento com o RTC e o sensor.' },
];

export const ORDEM_MONTAGEM = [
  'Corte a placa de 7 × 9 cm na fileira 30 — mesma medida da PI-1. Corte reto, '
  + 'só na altura; a largura de 24 colunas já vem certa.',
  'Solde o BARRAMENTO DE 0 V primeiro: fio nu esticado na linha 11.',
  'Solde os TRÊS BORNES. J1 em cima; J2 e J3 lado a lado embaixo.',
  'Solde as BARRAS DE PINOS FÊMEA dos dois módulos — sem os módulos encaixados.',
  'Solde os dois SHUNTS em pé: R1 no furo (2,6)→(2,11) e R2 no (7,6)→(7,11).',
  'Solde as PONTES DE NÓ (fio nu curto) dos nós RET-1 e RET-2.',
  '⚠️ Solde o JUMPER 10 — o EN do mux ao barramento. É o mais fácil de esquecer.',
  'Solde os outros 17 JUMPERS por baixo, com fio ISOLADO de 0,25 mm².',
  'Teste em continuidade com os módulos AINDA FORA. Confira que RET-1 NÃO tem '
  + 'continuidade com o 0 V sem o R1 no lugar.',
  'Encaixe o mux e o INA219, conferindo a orientação das barras.',
  '⭐ Aferição: com a posição 1 ligada, o INA219 e o canal C0 têm que dar a mesma '
  + 'corrente. Se não derem, o erro está no valor do shunt ou na conta do firmware.',
];
