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
 *
 * ⭐ A PLACA ENCOLHEU PELA METADE — E O MOTIVO VALE A LEITURA.
 *    Ela tinha um ULN2803A em soquete, 4 entradas de sinal, um borne de
 *    24 V e 4 saídas para os sinaleiros: 20 jumpers e 34 colunas. Tudo
 *    isso existia por UMA razão — o sinaleiro era de 24 V e o pino do
 *    Arduino é de 5 V, então alguém tinha que estar no meio.
 *
 *    Com o sinaleiro de 5 V, o pino aciona direto. O CI, o soquete, as
 *    9 vias de borne, 10 jumpers e 5 fios do painel saíram juntos — não
 *    porque foram "otimizados", mas porque a razão de existirem sumiu.
 *    Ver Doc 33 §33.8.
 */

export const PASSO = 2.54; // mm — passo padrão de placa ilhada / perfurada

export const PLACA = {
  colunas: 22,
  linhas: 22,
  get larguraMm() { return this.colunas * PASSO; }, // 55,9 mm
  get alturaMm() { return this.linhas * PASSO; },   // 55,9 mm
  /* ⭐ CABE NUMA CAIXA DIN DE 4 MÓDULOS. Os 55,9 mm de largura entram
     nos ~61 mm úteis de uma caixa de 4M — era a de 6M que a versão com
     o CI exigia. */
  bruta: {
    nome: 'Placa ilhada 9 × 15 cm (AliExpress)',
    colunas: 34, linhas: 58,   // ⚠️ conferir contando; há versões 35 × 59
    corte: 'Primeiro corte: reto, entre as fileiras 29 e 30 — o pedaço de 34 × 29 é a PI-2. '
         + 'Do outro pedaço, corte um retângulo de 22 × 22 furos: essa é a PI-1. Risque dos '
         + 'dois lados com estilete apoiado numa régua de metal, na LINHA ENTRE furos, e quebre '
         + 'na quina da bancada.',
    sobra: '⭐ Agora sobra placa — a PI-1 encolheu de 34 × 29 para 22 × 22. Guarde as sobras: '
         + 'elas são o corpo das duas placas simuladoras de DUT (passos A-06 e A-07).',
  },
  caixa: 'Caixa modular DIN de 4 módulos (70 mm)',
  nota: 'A caixa caiu de 6M para 4M junto com a placa. Sobrou um módulo de espaço no trilho 3 — '
      + 'que é justamente onde o módulo do sensor de tensão caberia, se um dia o divisor do D25 '
      + 'também sair daqui.',
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
      { n: 1, col: 2,  sinal: 'IS#1',    de: 'BTS7960 #1 · pino R_IS' },
      { n: 2, col: 4,  sinal: 'IS#2',    de: 'BTS7960 #2 · pino R_IS' },
      { n: 3, col: 6,  sinal: 'DATA',    de: 'DS18B20 · fio de dados (1-Wire)' },
      { n: 4, col: 8,  sinal: '+5V',     de: 'BD-5V (LM2596 de 5 V)' },
      { n: 5, col: 10, sinal: '0V',      de: 'BD-0V (barramento único de retorno)' },
      { n: 6, col: 12, sinal: '24V-POT', de: 'BD-POT · COMUTADO (cai na emergência)',
        alerta: true },
    ],
  },
  {
    ref: 'J2', papel: 'SAÍDAS', linha: 20, corpo: [18.0, 21.6],
    cor: '#2f9e44',
    vias: [
      { n: 1, col: 2, sinal: 'A0',  para: 'Arduino · A0 — corrente do Peltier #1' },
      { n: 2, col: 4, sinal: 'A1',  para: 'Arduino · A1 — corrente do Peltier #2' },
      { n: 3, col: 6, sinal: 'D2',  para: 'Arduino · D2 — 1-Wire do DS18B20' },
      { n: 4, col: 8, sinal: 'D25', para: 'Arduino · D25 — vigia se o 24 V de potência caiu' },
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
    furos: [[3, 6], [3, 10]],
    polaridade: false,
    ligacao: 'Uma perna no nó A0 (furo C6), a outra no barramento de 0 V (furo C10).',
    papel: 'Filtra o ruído que o cabo do BTS #1 pegou no caminho',
    porque: 'O sinal IS é analógico e viaja num painel cheio de PWM. Sem o filtro, o '
          + 'Arduino lê picos de ruído como se fossem corrente real. ⭐ Com o PWM em alta '
          + 'frequência ele passa a ter um segundo papel: é ele que faz a média da corrente '
          + 'picotada, e sem ele a leitura vira serrilha.',
  },
  {
    ref: 'C2', tipo: 'capacitor', valor: '100 nF', circuito: 1,
    furos: [[8, 6], [8, 10]],
    polaridade: false,
    ligacao: 'Uma perna no nó A1 (furo H6), a outra no barramento de 0 V (furo H10).',
    papel: 'O mesmo, para o BTS #2',
  },
  {
    ref: 'R3', tipo: 'resistor', valor: '4,7 kΩ', circuito: 2,
    furos: [[13, 6], [17, 6]],
    polaridade: false,
    ligacao: 'Perna esquerda no nó 1-Wire (furo M6), perna direita no +5 V (furo Q6).',
    papel: 'Pull-up do 1-Wire',
    porque: 'O DS18B20 só sabe PUXAR a linha para 0 V — ele não tem como levantá-la. '
          + 'Quem levanta é este resistor. SEM ele não existe barramento 1-Wire, '
          + 'e o sensor simplesmente não responde.',
  },
  {
    ref: 'R1', tipo: 'resistor', valor: '22 kΩ', circuito: 3,
    furos: [[16, 14], [20, 14]],
    polaridade: false,
    ligacao: 'Perna direita no 24V-POT (furo T14), perna esquerda no nó D25 (furo P14).',
    papel: 'Braço de cima do divisor de tensão',
  },
  {
    ref: 'R2', tipo: 'resistor', valor: '4,7 kΩ', circuito: 3,
    furos: [[18, 14], [18, 10]],
    polaridade: false,
    ligacao: 'Perna de cima no nó D25 (furo R14), perna de baixo no 0 V (furo R10).',
    papel: 'Braço de baixo do divisor — 24 × 4,7/26,7 = 4,22 V',
    porque: 'O Arduino queima com 24 V num pino. O divisor entrega 4,22 V, '
          + 'que ele lê como "tem 24 V lá fora" sem morrer.',
  },
  {
    ref: 'C3', tipo: 'capacitor', valor: '100 nF', circuito: 3,
    furos: [[17, 14], [17, 10]],
    polaridade: false,
    ligacao: 'Perna de cima no nó D25 (furo Q14), perna de baixo no 0 V (furo Q10).',
    papel: 'Segura o nó do divisor, que é de alta impedância e capta ruído',
  },
];

/* ⭐ NÃO HÁ MAIS CI NESTA PLACA. O ULN2803A saiu com a mudança para
   sinaleiro de 5 V (Doc 33 §33.8) — o pino do Arduino aciona o sinaleiro
   direto, e não sobra nada para o CI fazer. */
export const CI1 = null;

/* ── NÓS ───────────────────────────────────────────────────────────────
 * Onde 3 pernas precisam se encontrar. Não force 3 pernas num furo:
 * use furos vizinhos e uma ponte curta de fio nu por baixo.
 */
export const NOS = [
  { ref: 'nó A0', linha: 6, de: 2, ate: 4, circuito: 1,
    furos: { 2: 'chega o fio de J1-1 (IS#1)', 3: 'perna do C1', 4: 'sai o fio para J2-1 (A0)' },
    nota: 'Três pernas se encontram — cada uma no SEU furo, unidas pela ponte de fio nu.' },
  { ref: 'nó A1', linha: 6, de: 7, ate: 9, circuito: 1,
    furos: { 7: 'chega o fio de J1-2 (IS#2)', 8: 'perna do C2', 9: 'sai o fio para J2-2 (A1)' },
    nota: 'Idem ao nó A0.' },
  { ref: 'nó 1-Wire', linha: 6, de: 12, ate: 14, circuito: 2,
    furos: { 12: 'chega o fio de J1-3 (DATA)', 13: 'perna esquerda do R3',
             14: 'sai o fio para J2-3 (D2)' },
    nota: 'O sensor e o Arduino conversam por este nó; o R3 só o mantém levantado.' },
  { ref: 'nó D25', linha: 14, de: 16, ate: 19, circuito: 3,
    furos: { 16: 'perna esquerda do R1', 17: 'perna de cima do C3',
             18: 'perna de cima do R2', 19: 'sai o fio para J2-4 (D25)' },
    nota: 'Quatro pernas, quatro furos. É o ponto onde os 24 V já viraram 4,22 V.' },
];

/* ── JUMPERS ───────────────────────────────────────────────────────────
 * Fio isolado de 0,25 mm², soldado no lado do cobre. Como é ISOLADO,
 * pode cruzar por cima do barramento de 0 V sem problema.
 *
 * ⭐ Eram 20. Com o CI fora, são 10.
 */
export const JUMPERS = [
  { n: 1,  de: [2, 2],   para: [2, 6],   circuito: 1, sinal: 'IS#1 → nó A0' },
  { n: 2,  de: [4, 6],   para: [2, 20],  circuito: 1, sinal: 'nó A0 → sai A0', cruzaBus: true },
  { n: 3,  de: [4, 2],   para: [7, 6],   circuito: 1, sinal: 'IS#2 → nó A1' },
  { n: 4,  de: [9, 6],   para: [4, 20],  circuito: 1, sinal: 'nó A1 → sai A1', cruzaBus: true },
  { n: 5,  de: [6, 2],   para: [12, 6],  circuito: 2, sinal: 'DATA → nó 1-Wire' },
  { n: 6,  de: [14, 6],  para: [6, 20],  circuito: 2, sinal: 'nó 1-Wire → sai D2', cruzaBus: true },
  { n: 7,  de: [8, 2],   para: [17, 6],  circuito: 2, sinal: '+5 V → R3' },
  { n: 8,  de: [10, 2],  para: [10, 10], circuito: 0, sinal: '0 V do borne → barramento' },
  { n: 9,  de: [12, 2],  para: [20, 14], circuito: 3, sinal: '24V-POT → R1', alerta: true },
  { n: 10, de: [19, 14], para: [8, 20],  circuito: 3, sinal: 'nó D25 → sai D25', cruzaBus: true },
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

/* ── OS 3 CIRCUITOS ────────────────────────────────────────────────────
 * A chave para não se perder: eles NÃO se tocam. A única coisa que
 * compartilham é o barramento de 0 V. Estude um de cada vez.
 *
 * ⭐ Eram 4. O quarto era o driver dos sinaleiros, e saiu inteiro.
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
];

export const ORDEM_MONTAGEM = [
  'Corte a placa: primeiro o pedaço de 34 × 29 (a PI-2), depois um retângulo de 22 × 22 '
  + 'para a PI-1. As sobras viram as placas dos DUTs.',
  'Solde o BARRAMENTO DE 0 V primeiro — fio nu, esticado da coluna 2 à 20, na linha 10.',
  'Solde os dois BORNES. São eles que definem a geometria de tudo.',
  'Solde os RESISTORES deitados: R3, R1, R2.',
  'Solde os CAPACITORES: C1, C2, C3.',
  'Solde as PONTES DE NÓ (fio nu curto) nos quatro nós.',
  'Solde os 10 JUMPERS por baixo, com fio ISOLADO de 0,25 mm².',
  'Teste com multímetro em continuidade, via por via.',
];
