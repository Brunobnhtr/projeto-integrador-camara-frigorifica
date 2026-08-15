/**
 * PI-1 — LAYOUT FÍSICO DA PLACA ILHADA
 * ====================================
 *
 * Coordenadas em FUROS, não em milímetros. O furo (col, lin) fica em
 * x = col × 2,54 mm  ·  y = lin × 2,54 mm
 *
 * Assim o desenho é dimensionalmente verdadeiro: se aqui um componente
 * ocupa 4 furos, na placa real ele ocupa 10,16 mm. Dá para contar furo
 * por furo na hora de montar.
 *
 * Placa ilhada: NENHUM furo é ligado a outro de fábrica. Toda ligação
 * é uma perna de componente ou um fio que VOCÊ solda. É por isso que a
 * lista de JUMPERS abaixo é tão importante quanto a de componentes.
 */

export const PASSO = 2.54; // mm — passo padrão de placa ilhada / perfurada

export const PLACA = {
  colunas: 24,
  linhas: 29,
  get larguraMm() { return this.colunas * PASSO; }, // 60,96 mm
  get alturaMm() { return this.linhas * PASSO; },   // 73,66 mm
  caixa: 'Caixa modular DIN de 4 módulos (70 mm)',
  nota: 'Precisou virar 4 módulos: o borne J1 tem 11 vias × 5,08 mm = 55,9 mm, '
      + 'que NÃO cabe nos 45 mm úteis de uma caixa de 3 módulos.',
};

/* ── BORNES ────────────────────────────────────────────────────────────
 * KF301, passo 5,08 mm = exatamente 2 furos. Por isso os pinos caem em
 * colunas pares: via 1 na coluna 2, via 2 na coluna 4, e assim por diante.
 */
export const BORNES = [
  {
    ref: 'J1', papel: 'ENTRADAS', linha: 2, corpo: [0.4, 4.0],
    cor: '#1971c2',
    vias: [
      { n: 1,  col: 2,  sinal: 'IS#1',    de: 'BTS7960 #1 · pino R_IS' },
      { n: 2,  col: 4,  sinal: 'IS#2',    de: 'BTS7960 #2 · pino R_IS' },
      { n: 3,  col: 6,  sinal: 'DATA',    de: 'DS18B20 na câmara · fio de dados' },
      { n: 4,  col: 8,  sinal: '+5V',     de: 'BD-5V (LM2596 de 5 V)' },
      { n: 5,  col: 10, sinal: 'D9',      de: 'Arduino Mega · pino D9' },
      { n: 6,  col: 12, sinal: 'D10',     de: 'Arduino Mega · pino D10' },
      { n: 7,  col: 14, sinal: 'D11',     de: 'Arduino Mega · pino D11' },
      { n: 8,  col: 16, sinal: 'D12',     de: 'Arduino Mega · pino D12' },
      { n: 9,  col: 18, sinal: '0V',      de: 'BD-0V (barramento único de retorno)' },
      { n: 10, col: 20, sinal: '24V-SRV', de: 'BD-24V · PERMANENTE (não cai na emergência)',
        alerta: true },
      { n: 11, col: 22, sinal: '24V-POT', de: 'BD-POT · COMUTADO (cai na emergência)',
        alerta: true },
    ],
  },
  {
    ref: 'J2', papel: 'SAÍDAS', linha: 28, corpo: [26.0, 29.6],
    cor: '#2f9e44',
    vias: [
      { n: 1, col: 2,  sinal: 'A0',  para: 'Arduino · A0 — corrente do Peltier #1' },
      { n: 2, col: 4,  sinal: 'A1',  para: 'Arduino · A1 — corrente do Peltier #2' },
      { n: 3, col: 6,  sinal: 'D2',  para: 'Arduino · D2 — 1-Wire do DS18B20' },
      { n: 4, col: 8,  sinal: 'L1−', para: 'Sinaleiro ENERGIZADO · negativo' },
      { n: 5, col: 10, sinal: 'L2−', para: 'Sinaleiro RESFRIANDO · negativo' },
      { n: 6, col: 12, sinal: 'L3−', para: 'Sinaleiro AQUECENDO · negativo' },
      { n: 7, col: 14, sinal: 'L4−', para: 'Sinaleiro FALHA · negativo' },
      { n: 8, col: 16, sinal: 'D25', para: 'Arduino · D25 — vigia se o 24 V de potência caiu' },
    ],
  },
];

/* ── BARRAMENTO DE 0 V ─────────────────────────────────────────────────
 * Fio de cobre NU esticado numa fileira reta. É o único condutor "nu" da
 * placa — todo o resto é fio isolado. Solde este primeiro.
 */
export const BARRAMENTO_0V = { linha: 10, de: 2, ate: 20 };

/* ── COMPONENTES ───────────────────────────────────────────────────────
 * `furos` = onde cada perna entra. 2 furos = 5,08 mm · 4 furos = 10,16 mm
 */
export const COMPONENTES_PI1 = [
  {
    ref: 'C1', tipo: 'capacitor', valor: '100 nF', circuito: 1,
    furos: [[3, 8], [3, 10]],
    polaridade: false,
    ligacao: 'Uma perna no nó A0 (furo 3,8), a outra no barramento de 0 V (furo 3,10).',
    papel: 'Filtra o ruído que o cabo do BTS #1 pegou no caminho',
    porque: 'O sinal IS é analógico e viaja num painel cheio de PWM. Sem o filtro, '
          + 'o Arduino lê picos de ruído como se fossem corrente real.',
  },
  {
    ref: 'C2', tipo: 'capacitor', valor: '100 nF', circuito: 1,
    furos: [[7, 8], [7, 10]],
    polaridade: false,
    ligacao: 'Uma perna no nó A1 (furo 7,8), a outra no barramento de 0 V (furo 7,10).',
    papel: 'O mesmo, para o BTS #2',
  },
  {
    ref: 'R3', tipo: 'resistor', valor: '4,7 kΩ', circuito: 2,
    furos: [[6, 5], [10, 5]],
    polaridade: false,
    ligacao: 'Perna esquerda no nó 1-Wire (furo 6,5), perna direita no +5 V (furo 10,5).',
    papel: 'Pull-up do 1-Wire',
    porque: 'O DS18B20 só sabe PUXAR a linha para 0 V — ele não tem como levantá-la. '
          + 'Quem levanta é este resistor. SEM ele não existe barramento 1-Wire, '
          + 'e o sensor simplesmente não responde.',
  },
  {
    ref: 'R1', tipo: 'resistor', valor: '22 kΩ', circuito: 3,
    furos: [[18, 6], [22, 6]],
    polaridade: false,
    ligacao: 'Perna direita no 24V-POT (furo 22,6), perna esquerda no nó D25 (furo 18,6).',
    papel: 'Braço de cima do divisor de tensão',
  },
  {
    ref: 'R2', tipo: 'resistor', valor: '4,7 kΩ', circuito: 3,
    furos: [[17, 6], [17, 10]],
    polaridade: false,
    ligacao: 'Perna de cima no nó D25 (furo 17,6), perna de baixo no 0 V (furo 17,10).',
    papel: 'Braço de baixo do divisor — 24 × 4,7/26,7 = 4,22 V',
    porque: 'O Arduino queima com 24 V num pino. O divisor entrega 4,22 V, '
          + 'que ele lê como "tem 24 V lá fora" sem morrer.',
  },
  {
    ref: 'C3', tipo: 'capacitor', valor: '100 nF', circuito: 3,
    furos: [[16, 6], [16, 10]],
    polaridade: false,
    ligacao: 'Perna de cima no nó D25 (furo 16,6), perna de baixo no 0 V (furo 16,10).',
    papel: 'Segura o nó do divisor, que é de alta impedância e capta ruído',
  },
];

/* ── CI ────────────────────────────────────────────────────────────────
 * DIP-18: 9 pinos por lado, passo 2,54 mm, fileiras a 7,62 mm = 3 furos.
 * CHANFRO À DIREITA nesta montagem. Com o chanfro à direita, os pinos
 * 1..9 ficam em CIMA (contando da direita para a esquerda) e 10..18
 * embaixo (da esquerda para a direita).
 */
export const CI1 = {
  ref: 'CI1', valor: 'ULN2803A', soquete: 'Soquete DIP-18',
  linhaTopo: 13, linhaBase: 16, colEsq: 8, colDir: 16,
  chanfro: 'direita',
  papel: 'É o "relé de interface" dos sinaleiros: deixa um pino de 5 V do Arduino '
       + 'acender um sinaleiro industrial de 24 V.',
  porque: 'Um pino do Arduino dá 5 V e 20 mA. O sinaleiro de 24 V precisa de muito '
        + 'mais. O CI não fornece corrente — ele ABRE O CAMINHO PARA O 0 V. '
        + 'O sinaleiro fica sempre ligado ao +24 V pelo lado positivo.',
  aviso: 'Girar o CI 180° liga os 24 V do COM direto na entrada e destrói o chip '
       + 'E o pino do Arduino. Confira o chanfro antes de energizar.',
  pinos: [
    { n: 1,  nome: 'IN1',  col: 16, lin: 13 },
    { n: 2,  nome: 'IN2',  col: 15, lin: 13 },
    { n: 3,  nome: 'IN3',  col: 14, lin: 13 },
    { n: 4,  nome: 'IN4',  col: 13, lin: 13 },
    { n: 5,  nome: 'IN5',  col: 12, lin: 13, livre: true },
    { n: 6,  nome: 'IN6',  col: 11, lin: 13, livre: true },
    { n: 7,  nome: 'IN7',  col: 10, lin: 13, livre: true },
    { n: 8,  nome: 'IN8',  col: 9,  lin: 13, livre: true },
    { n: 9,  nome: 'GND',  col: 8,  lin: 13 },
    { n: 10, nome: 'COM',  col: 8,  lin: 16 },
    { n: 11, nome: 'OUT8', col: 9,  lin: 16, livre: true },
    { n: 12, nome: 'OUT7', col: 10, lin: 16, livre: true },
    { n: 13, nome: 'OUT6', col: 11, lin: 16, livre: true },
    { n: 14, nome: 'OUT5', col: 12, lin: 16, livre: true },
    { n: 15, nome: 'OUT4', col: 13, lin: 16 },
    { n: 16, nome: 'OUT3', col: 14, lin: 16 },
    { n: 17, nome: 'OUT2', col: 15, lin: 16 },
    { n: 18, nome: 'OUT1', col: 16, lin: 16 },
  ],
};

/* ── NÓS ───────────────────────────────────────────────────────────────
 * Onde 3 pernas precisam se encontrar. Não force 3 pernas num furo:
 * use furos vizinhos e uma ponte curta de fio nu por baixo.
 */
export const NOS = [
  { ref: 'nó A0', linha: 8, de: 2, ate: 4, circuito: 1,
    furos: { 2: 'chega o fio de J1-1 (IS#1)', 3: 'perna do C1', 4: 'sai o fio para J2-1 (A0)' },
    nota: 'Três pernas se encontram — cada uma no SEU furo, unidas pela ponte de fio nu.' },
  { ref: 'nó A1', linha: 8, de: 6, ate: 8, circuito: 1,
    furos: { 6: 'chega o fio de J1-2 (IS#2)', 7: 'perna do C2', 8: 'sai o fio para J2-2 (A1)' },
    nota: 'Idem ao nó A0.' },
  { ref: 'nó 1-Wire', linha: 5, de: 3, ate: 6, circuito: 2,
    furos: { 3: 'chega o fio de J1-3 (DATA)', 4: 'sai o fio para J2-3 (D2)',
             6: 'perna esquerda do R3' },
    nota: 'O sensor e o Arduino conversam por este nó; o R3 só o mantém levantado.' },
  { ref: 'nó D25', linha: 6, de: 15, ate: 18, circuito: 3,
    furos: { 15: 'sai o fio para J2-8 (D25)', 16: 'perna de cima do C3',
             17: 'perna de cima do R2', 18: 'perna esquerda do R1' },
    nota: 'Quatro pernas, quatro furos. É o ponto onde os 24 V já viraram 4,22 V.' },
];

/* ── JUMPERS ───────────────────────────────────────────────────────────
 * Fio isolado de 0,25 mm², soldado no lado do cobre. Como é ISOLADO,
 * pode cruzar por cima do barramento de 0 V sem problema.
 */
export const JUMPERS = [
  { n: 1,  de: [2, 2],   para: [2, 8],   circuito: 1, sinal: 'IS#1 → nó A0' },
  { n: 2,  de: [4, 8],   para: [2, 28],  circuito: 1, sinal: 'nó A0 → sai A0', cruzaBus: true },
  { n: 3,  de: [4, 2],   para: [6, 8],   circuito: 1, sinal: 'IS#2 → nó A1' },
  { n: 4,  de: [8, 8],   para: [4, 28],  circuito: 1, sinal: 'nó A1 → sai A1', cruzaBus: true },
  { n: 5,  de: [6, 2],   para: [3, 5],   circuito: 2, sinal: 'DATA → nó 1-Wire' },
  { n: 6,  de: [4, 5],   para: [6, 28],  circuito: 2, sinal: 'nó 1-Wire → sai D2', cruzaBus: true },
  { n: 7,  de: [8, 2],   para: [10, 5],  circuito: 2, sinal: '+5 V → R3' },
  { n: 8,  de: [10, 2],  para: [16, 13], circuito: 4, sinal: 'D9 → IN1' },
  { n: 9,  de: [12, 2],  para: [15, 13], circuito: 4, sinal: 'D10 → IN2' },
  { n: 10, de: [14, 2],  para: [14, 13], circuito: 4, sinal: 'D11 → IN3' },
  { n: 11, de: [16, 2],  para: [13, 13], circuito: 4, sinal: 'D12 → IN4' },
  { n: 12, de: [18, 2],  para: [18, 10], circuito: 0, sinal: '0 V do borne → barramento' },
  { n: 13, de: [20, 2],  para: [8, 16],  circuito: 4, sinal: '24V-SRV → COM do CI', alerta: true },
  { n: 14, de: [22, 2],  para: [22, 6],  circuito: 3, sinal: '24V-POT → R1', alerta: true },
  { n: 15, de: [8, 13],  para: [8, 10],  circuito: 0, sinal: 'GND do CI → barramento' },
  { n: 16, de: [16, 16], para: [8, 28],  circuito: 4, sinal: 'OUT1 → L1−' },
  { n: 17, de: [15, 16], para: [10, 28], circuito: 4, sinal: 'OUT2 → L2−' },
  { n: 18, de: [14, 16], para: [12, 28], circuito: 4, sinal: 'OUT3 → L3−' },
  { n: 19, de: [13, 16], para: [14, 28], circuito: 4, sinal: 'OUT4 → L4−' },
  { n: 20, de: [15, 6],  para: [16, 28], circuito: 3, sinal: 'nó D25 → sai D25', cruzaBus: true },
];

/* ── AS 3 PERGUNTAS QUE TODO MUNDO FAZ ─────────────────────────────────
 * Respostas curtas, mostradas junto do desenho de cada circuito.
 */
export const DUVIDAS = {
  1: [
    { p: 'Qual perna do capacitor é a positiva?',
      r: 'NENHUMA. O 100 nF é cerâmico (aquele disquinho azul marcado "104") e '
       + 'NÃO TEM POLARIDADE. Pode virar do avesso que funciona igual. Só '
       + 'eletrolítico — o cilíndrico de alumínio — tem lado certo.' },
    { p: 'O sinal entra por uma perna e sai pela outra?',
      r: 'NÃO. O sinal NÃO passa por dentro do capacitor. Ele vai de J1-1 direto '
       + 'para J2-1 por fio. O capacitor só ENCOSTA nesse caminho e desce para o '
       + '0 V. Se você arrancasse o C1, o sinal continuaria chegando no Arduino — '
       + 'só que sujo.' },
    { p: 'Então qual ponta segue para a saída?',
      r: 'Nenhuma ponta do capacitor "segue". Quem segue é o FIO. As três coisas '
       + '(fio que chega, perna do capacitor, fio que sai) se encontram no mesmo '
       + 'NÓ — e a partir de um nó tudo está ligado a tudo.' },
  ],
  3: [
    { p: 'Aqui o sinal passa pelos resistores?',
      r: 'SIM — este circuito é diferente do C1. Os 24 V entram pelo R1, e é a '
       + 'passagem por ele que derruba a tensão. Repare que R1 está NO CAMINHO, '
       + 'enquanto C1 estava DE LADO.' },
    { p: 'O resistor tem lado certo?',
      r: 'Não. Resistor não tem polaridade. As faixas coloridas são só o valor — '
       + 'lê-se a partir da ponta com as faixas mais juntas.' },
  ],
};

/* ── OS 4 CIRCUITOS ────────────────────────────────────────────────────
 * A chave para não se perder: eles NÃO se tocam. A única coisa que
 * compartilham é o barramento de 0 V. Estude um de cada vez.
 */
export const CIRCUITOS = [
  { id: 0, nome: 'Barramento de 0 V', cor: '#212529',
    resumo: 'O retorno comum. Único no projeto — os LM2596 não são isolados.' },
  { id: 1, nome: 'Filtros de corrente', cor: '#1971c2',
    resumo: 'C1 e C2 limpam o sinal IS dos dois BTS antes de entrar em A0 e A1.' },
  { id: 2, nome: 'Pull-up do 1-Wire', cor: '#0ca678',
    resumo: 'R3 levanta a linha do DS18B20. Sem ele, o sensor não responde.' },
  { id: 3, nome: 'Divisor do D25', cor: '#f08c00',
    resumo: 'R1 + R2 + C3 transformam 24 V em 4,22 V para o Arduino vigiar a emergência.' },
  { id: 4, nome: 'Driver dos sinaleiros', cor: '#ae3ec9',
    resumo: 'O ULN2803A deixa 4 pinos de 5 V acenderem 4 sinaleiros de 24 V.' },
];

export const ORDEM_MONTAGEM = [
  'Corte a placa em 24 × 29 furos (≈ 61 × 74 mm).',
  'Solde o BARRAMENTO DE 0 V primeiro — fio nu, bem esticado, na linha 10.',
  'Solde os dois BORNES. São eles que definem a geometria de tudo.',
  'Solde o SOQUETE DIP-18 (sem o CI dentro), chanfro à direita.',
  'Solde os RESISTORES deitados: R3, R1, R2.',
  'Solde os CAPACITORES: C1, C2, C3.',
  'Solde as PONTES DE NÓ (fio nu curto) — só o nó D25 precisa de uma.',
  'Solde os 20 JUMPERS por baixo, com fio ISOLADO de 0,25 mm².',
  'Teste com multímetro em continuidade, com o CI AINDA FORA.',
  'Só então encaixe o ULN2803A no soquete, conferindo o chanfro.',
];
