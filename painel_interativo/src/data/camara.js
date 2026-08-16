/* O que existe DENTRO da câmara e de onde vem cada fio.
   Cada `de:` aponta para um borne real da vista "Dentro do painel" —
   é isso que amarra as duas vistas.                                  */

export const CAIXA = {
  /* corte frontal, em px. 336 × 326 mm reais a ~1,55 px/mm */
  x1: 180, x2: 700, y1: 70, y2: 590,
  cobertura: 5,     // acrílico branco 3 mm
  xps: 46,          // isolamento 30 mm
  duto: 46,         // duto lateral 30 × 30 mm
  acrilico: 8,      // parede estrutural 5 mm
  plenum: 46,       // 30 mm sob a base interna
};

/* a face interna útil, calculada a partir das camadas */
const u = CAIXA.cobertura + CAIXA.xps;
export const UTIL = {
  x1: CAIXA.x1 + u + CAIXA.duto + CAIXA.acrilico,   // 285
  x2: CAIXA.x2 - u - CAIXA.duto - CAIXA.acrilico,   // 595
  y1: CAIXA.y1 + u + CAIXA.acrilico,                // 129
  y2: CAIXA.y2 - u - CAIXA.acrilico,                // 531
};
export const BASE_INT = UTIL.y2 - CAIXA.plenum;      // 485

export const COMPONENTES = [
  {
    id: 'PELT', pc: 'PC-1', nome: '2× Peltier TEC1-12706', tipo: 'frio',
    x: 378, y: 133, w: 124, h: 34, cor: '#1971c2',
    onde: 'Encaixadas na TAMPA, no centro. Face fria para dentro, face quente para fora.',
    porque: 'No topo porque o ar frio desce sozinho. Colocá-las embaixo faria o frio '
          + 'ficar empoçado no fundo e a câmara nunca homogeneizaria.',
    terminais: [
      { t: '+', de: 'BTS #1 · M+', ref: ['BTS1', 'M+'], fio: '1,5 mm² vermelho' },
      { t: '−', de: 'BTS #1 · M−', ref: ['BTS1', 'M−'], fio: '1,5 mm² preto' },
    ],
    avisos: [
      '⭐ AS DUAS EM SÉRIE, não em paralelo. O par forma uma carga de 24 V / 6 A que se '
      + 'alimenta direto do barramento, sem conversor — e cada pastilha continua vendo '
      + 'os seus 12 V nominais.',
      '🔥 SE UM COOLER DO RADIADOR PARAR, A PASTILHA MORRE EM MENOS DE UM MINUTO. Ela não '
      + 'produz frio: transporta calor de um lado para o outro. Lado quente saturado = o '
      + 'calor volta atravessando a pastilha. Por isso o firmware monitora o RPM.',
      '⚠️ NUNCA COMANDAR POR PWM RÁPIDO. Cada liga-desliga é um choque térmico na junção. '
      + 'O BTS #1 trabalha em regime contínuo ou com chaveamento muito lento.',
    ],
  },
  {
    id: 'VF', pc: 'PC-1', nome: '2× ventoinha fria 40 mm', tipo: 'ar',
    x: 390, y: 178, w: 100, h: 26, cor: '#4dabf7', sopra: 'baixo',
    onde: 'Logo abaixo das Peltier, soprando PARA BAIXO.',
    porque: 'Sem elas o frio fica colado na pastilha e a câmara estratifica — topo '
          + 'gelado, fundo morno. O ar precisa ser empurrado.',
    terminais: [
      { t: '+', de: 'MV-1 · O3+', ref: ['MV-1', 'O3+'], fio: '0,5 mm² vermelho' },
      { t: '−', de: 'MV-1 · O3−', ref: ['MV-1', 'O3−'], fio: '0,5 mm² preto' },
    ],
    avisos: [
      '📌 DIVIDEM O CANAL 3 COM AS 2 DO DUTO. São 4 ventoinhas no mesmo par de fios — '
      + 'ligam e desligam juntas, o que é o correto: elas formam um circuito de ar só.',
      '⭐ CONTINUAM GIRANDO DEPOIS DE DESLIGAR (pós-ventilação). O calor acumulado no '
      + 'dissipador precisa sair, senão volta para dentro da câmara.',
    ],
  },
  {
    id: 'VD1', pc: 'PC-1', nome: 'ventoinha do duto esq.', tipo: 'ar',
    x: 236, y: 300, w: 36, h: 30, cor: '#4dabf7', sopra: 'cima', pequeno: true,
    onde: 'Dentro do duto lateral esquerdo (30 × 30 mm).',
    porque: 'Fecha o circuito: o ar que desceu pelo centro sobe pelas laterais e volta '
          + 'ao topo. É o que impede o gradiente entre a base e a tampa.',
    terminais: [
      { t: '+', de: 'MV-1 · O3+', ref: ['MV-1', 'O3+'], fio: 'em paralelo com as frias' },
      { t: '−', de: 'MV-1 · O3−', ref: ['MV-1', 'O3−'], fio: '—' },
    ],
    avisos: ['📌 O duto fica FORA da parede de acrílico, dentro do isolamento. O ar circula '
           + 'sem furar o volume útil.'],
  },
  {
    id: 'VD2', pc: 'PC-1', nome: 'ventoinha do duto dir.', tipo: 'ar',
    x: 608, y: 300, w: 36, h: 30, cor: '#4dabf7', sopra: 'cima', pequeno: true,
    onde: 'Dentro do duto lateral direito.',
    porque: 'Idem à esquerda — o retorno tem que ser simétrico, senão um lado da câmara '
          + 'fica mais frio que o outro.',
    terminais: [
      { t: '+', de: 'MV-1 · O3+', ref: ['MV-1', 'O3+'], fio: 'em paralelo' },
      { t: '−', de: 'MV-1 · O3−', ref: ['MV-1', 'O3−'], fio: '—' },
    ],
    avisos: [],
  },
  {
    id: 'SENS', pc: 'PC-2', nome: 'AM2315C — temperatura e umidade', tipo: 'sensor',
    x: 402, y: 310, w: 76, h: 40, cor: '#f76707',
    onde: '⭐ NO CENTRO GEOMÉTRICO, suspenso no ar — longe da Peltier e longe do PTC.',
    porque: 'Este é o ponto mais importante da montagem. Se o sensor encostar na Peltier '
          + 'ele lê a pastilha, não o ar: o controle desliga cedo demais e a câmara nunca '
          + 'chega ao setpoint. Se ficar perto do PTC, lê o aquecedor e desliga cedo do '
          + 'outro lado. No centro, ele lê o que o ensaio realmente vê.',
    terminais: [
      { t: 'VCC', de: 'BD-5V saída 10', ref: ['BD-5V', 'O10'], fio: '0,25 mm² vermelho' },
      { t: 'GND', de: 'BD-0V · R15', ref: ['BD-0V', 'R15'], fio: '0,25 mm² preto' },
      { t: 'SDA', de: 'Mega D20', ref: ['MEGA', 'D20'], fio: '0,25 mm² azul' },
      { t: 'SCL', de: 'Mega D21', ref: ['MEGA', 'D21'], fio: '0,25 mm² amarelo' },
    ],
    avisos: [
      '🔥 É O ÚNICO SENSOR DO CONTROLE, E ISSO É UM RISCO ASSUMIDO. Se ele travar lendo um '
      + 'valor plausível mas errado, o sistema aquece ou resfria sem perceber. O firmware '
      + 'desconfia dele: valor congelado por muito tempo, fora de faixa ou variação '
      + 'impossível derrubam o ensaio.',
      '💧 A UMIDADE NÃO É ENFEITE. Ensaio térmico com condensação não vale — é ela que '
      + 'avisa quando é hora do ciclo de degelo.',
      '📌 I²C no endereço 0x38, dividindo o barramento com o DS3231 e os INA219.',
      '⚠️ Suspenso por fio de nylon ou haste fina — nada de parafusar na parede, que '
      + 'conduz a temperatura do acrílico para o sensor.',
    ],
  },
  {
    id: 'PTC', pc: 'PC-1', nome: 'PTC 24 V — aquecedor', tipo: 'quente',
    x: 385, y: 430, w: 110, h: 30, cor: '#e03131',
    onde: 'Na base interna, no centro, sobre o plenum de 30 mm.',
    porque: 'Embaixo porque o ar quente sobe sozinho — o oposto da Peltier. E sobre o '
          + 'plenum para o ar poder passar POR BAIXO dele e não só por cima.',
    terminais: [
      { t: '+', de: 'BTS #2 · M+', ref: ['BTS2', 'M+'], fio: '1,5 mm² vermelho' },
      { t: '−', de: 'BTS #2 · M−', ref: ['BTS2', 'M−'], fio: '1,5 mm² preto' },
    ],
    avisos: [
      '⭐ TEM QUE SER O PTC DE 24 V, não o de 12 V. Ele vai direto no barramento pelo '
      + 'BTS #2, sem conversor. Um PTC de 12 V ligado em 24 V queima.',
      '✅ ELE SE PROTEGE SOZINHO: conforme esquenta, a resistência sobe e a corrente cai. '
      + 'É a razão de ser um PTC e não uma resistência comum — que continuaria puxando '
      + 'corrente até derreter alguma coisa.',
      '🔥 NUNCA LIGAR O PTC SEM A VENTOINHA DELE. O firmware trava isso: sem fluxo de ar, '
      + 'o calor fica concentrado e o acrílico logo acima deforma.',
    ],
  },
  {
    id: 'VP', pc: 'PC-1', nome: 'ventoinha do PTC', tipo: 'ar',
    x: 405, y: 396, w: 70, h: 26, cor: '#4dabf7', sopra: 'baixo',
    onde: 'Logo acima do PTC, soprando PARA BAIXO — no MESMO sentido das de cima.',
    porque: 'Empurra o ar sobre o PTC e para dentro do plenum, de onde ele sobe pelos '
          + 'dutos. Canal próprio no MV-1 para o intertravamento com o aquecedor.',
    terminais: [
      { t: '+', de: 'MV-1 · O2+', ref: ['MV-1', 'O2+'], fio: '0,5 mm² vermelho' },
      { t: '−', de: 'MV-1 · O2−', ref: ['MV-1', 'O2−'], fio: '0,5 mm² preto' },
    ],
    avisos: [
      '🔥 SOPRA PARA BAIXO, IGUAL ÀS DE CIMA — e isto NÃO é engano. Uma ventoinha DC não '
      + 'gira ao contrário: invertendo a polaridade ela simplesmente não parte, e mesmo '
      + 'que partisse a pá é assimétrica e moveria quase nada de ar. Como as 2 do duto '
      + 'dividem um canal só, o circuito de ar é FIXO: sempre desce pelo centro e sobe '
      + 'pelos dutos. Ver Doc 12 §12.7.',
      '⭐ CANAL SEPARADO DE PROPÓSITO. Ela é intertravada com o PTC: o aquecedor não liga '
      + 'sem ela girando, e ela continua girando depois que ele desliga.',
    ],
  },
  {
    id: 'DUT1', pc: 'PC-2', nome: 'Posição de ensaio 1', tipo: 'dut',
    x: 296, y: 420, w: 76, h: 56, cor: '#c92a2a', dut: 1,
    onde: 'Na base interna, à esquerda, com folga das paredes.',
    porque: 'É o dispositivo sob ensaio — o motivo de a câmara existir. Consome 17,6 mA '
          + 'constantes, e é o sumiço dessa corrente que denuncia a falha.',
    terminais: [
      { t: '+24 V', de: 'F-P1 (fusível 100 mA)', ref: ['F-P', 'F-P1'], fio: '0,5 mm² vermelho' },
      { t: 'retorno', de: 'PI-2 · RET-1', ref: ['PI-2', 'RET-1'], fio: '0,5 mm² azul' },
    ],
    avisos: [
      '⚡ O RETORNO NÃO É O 0 V. Ele volta ao painel por um fio próprio e só vira 0 V '
      + 'depois de atravessar o shunt de 47 Ω dentro da PI-2 — é essa travessia que a '
      + 'medição enxerga.',
      '⭐ LED VERMELHO + RESISTOR DE 1,2 kΩ. O LED é só o indicador visual; quem fixa a '
      + 'corrente é o resistor.',
    ],
  },
  {
    id: 'DUT2', pc: 'PC-2', nome: 'Posição de ensaio 2', tipo: 'dut',
    x: 508, y: 420, w: 76, h: 56, cor: '#2f9e44', dut: 2,
    onde: 'Na base interna, à direita.',
    porque: 'Consome 9,8 mA — propositalmente DIFERENTE da posição 1. É o que prova que '
          + 'o sistema compara cada posição com o normal dela, e não com um limiar único.',
    terminais: [
      { t: '+24 V', de: 'F-P2 (fusível 100 mA)', ref: ['F-P', 'F-P2'], fio: '0,5 mm² vermelho' },
      { t: 'retorno', de: 'PI-2 · RET-2', ref: ['PI-2', 'RET-2'], fio: '0,5 mm² verde' },
    ],
    avisos: [
      '⚡ RETORNO INDIVIDUAL, obrigatoriamente. Se os dois retornos fossem um fio só, as '
      + 'correntes se somariam antes do shunt e não daria para saber qual posição parou.',
      '⭐ LED VERDE + RESISTOR DE 2,2 kΩ.',
    ],
  },
];

/* o que fica FORA, na tampa — o lado quente */
export const EXTERNOS = [
  { id: 'DIS1', nome: 'dissipador + cooler', x: 366, y: 74, w: 68, h: 50 },
  { id: 'DIS2', nome: 'dissipador + cooler', x: 446, y: 74, w: 68, h: 50 },
];

/* ⭐ DOIS prensa-cabos, e não um. Potência que chaveia 6 A não pode
   dividir cabo com a medição de 17,6 mA nem com os pulsos do I²C.   */
export const PRENSAS = [
  {
    id: 'PC-1', nome: 'POTÊNCIA', y: 200, cor: '#c92a2a', lado: 'esq',
    onde: 'canto inferior esquerdo da parede traseira',
    diz: 'Os BTS chaveiam 6 A por estes fios. É a fonte de ruído do projeto — por isso '
       + 'ele sai sozinho.',
  },
  {
    id: 'PC-2', nome: 'MEDIÇÃO E SINAL', y: 440, cor: '#1971c2', lado: 'esq',
    onde: 'canto superior esquerdo, a pelo menos 100 mm do PC-1',
    diz: 'Os retornos das posições carregam a corrente que está sendo medida, e o I²C '
       + 'carrega pulsos de microssegundos. Um transiente de 6 A induzido aqui vira '
       + 'leitura errada ou sensor travado.',
  },
];

export const TRAVESSIA = [
  { pc: 'PC-1', g: 'Potência',   n: 2, o: 'Peltier + e −', de: 'BTS #1', mm: '1,5 mm²' },
  { pc: 'PC-1', g: 'Potência',   n: 2, o: 'PTC + e −', de: 'BTS #2', mm: '1,5 mm²' },
  { pc: 'PC-1', g: 'Ventilação', n: 2, o: 'circulação (4 ventoinhas)', de: 'MV-1 · O3', mm: '0,5 mm²' },
  { pc: 'PC-1', g: 'Ventilação', n: 2, o: 'ventoinha do PTC', de: 'MV-1 · O2', mm: '0,5 mm²' },
  { pc: 'PC-2', g: 'Ensaio',     n: 2, o: 'positivos das posições', de: 'F-P1 e F-P2', mm: '0,5 mm²' },
  { pc: 'PC-2', g: 'Ensaio',     n: 2, o: 'retornos individuais', de: 'PI-2 · RET-1/2', mm: '0,5 mm²' },
  { pc: 'PC-2', g: 'Sinal',      n: 4, o: 'AM2315C (VCC GND SDA SCL)', de: 'Mega + BD-5V', mm: '0,25 mm²' },
];

/* ══════════════════════════════════════════════════════════════════════
   MODELO 3D — para a vista girável
   ══════════════════════════════════════════════════════════════════════
   Coordenadas em mm dentro do VOLUME ÚTIL, que é 200 × 100 × 250:
     x  0 → 200   esquerda → direita
     y  0 → 100   FRENTE (a porta) → FUNDO
     z  0 → 250   base → tampa

   ⭐ Todos os cabos entram pelo FUNDO, nunca pela porta nem pelas
   laterais: a porta abre e as laterais têm os dutos de circulação.
   São dois prensa-cabos, em cantos opostos da parede traseira.       */

export const UTIL3D = { w: 200, d: 100, h: 250 };

export const PRENSAS3D = [
  {
    id: 'PC-1', nome: 'POTÊNCIA', cor: '#c92a2a', x: 45, z: 22,
    diz: 'Peltier, PTC e as ventoinhas. Os BTS chaveiam 6 A por aqui — '
       + 'é a fonte de ruído do projeto.',
  },
  {
    id: 'PC-2', nome: 'SINAL E MEDIÇÃO', cor: '#1971c2', x: 155, z: 228,
    diz: 'As duas posições de ensaio e o AM2315C. Carrega os 17,6 mA que '
       + 'estão sendo medidos e os pulsos do I²C.',
  },
];

/* caixa = [x0, y0, z0, x1, y1, z1] */
export const PECAS3D = [
  { id: 'PELT', nome: '2× Peltier', cor: '#1971c2', pc: 'PC-1',
    caixa: [60, 30, 236, 140, 70, 250],
    diz: 'Encaixadas na tampa. Face fria para dentro, quente para fora.' },
  { id: 'VF', nome: '2× ventoinha fria', cor: '#4dabf7', pc: 'PC-1',
    caixa: [70, 32, 210, 130, 68, 234],
    diz: 'Sopram para BAIXO — o ar desce pelo centro.' },
  { id: 'SENS', nome: 'AM2315C', cor: '#f76707', pc: 'PC-2',
    caixa: [88, 42, 116, 112, 58, 136],
    diz: '⭐ No centro geométrico, suspenso. Longe da Peltier e do PTC.' },
  { id: 'VP', nome: 'ventoinha do PTC', cor: '#4dabf7', pc: 'PC-1',
    caixa: [76, 32, 50, 124, 68, 72],
    diz: 'Sopra para BAIXO também — o circuito de ar é único.' },
  { id: 'PTC', nome: 'PTC 24 V', cor: '#e03131', pc: 'PC-1',
    caixa: [64, 30, 26, 136, 70, 44],
    diz: 'Na base, sobre o plenum de 30 mm.' },
  { id: 'DUT1', nome: 'Posição 1', cor: '#c92a2a', pc: 'PC-2',
    caixa: [14, 25, 24, 58, 75, 58],
    diz: 'LED vermelho + 1,2 kΩ — 17,6 mA.' },
  { id: 'DUT2', nome: 'Posição 2', cor: '#2f9e44', pc: 'PC-2',
    caixa: [142, 25, 24, 186, 75, 58],
    diz: 'LED verde + 2,2 kΩ — 9,8 mA.' },
  { id: 'VD1', nome: 'vent. duto esq.', cor: '#74c0fc', pc: 'PC-1', fora: true,
    caixa: [-32, 35, 108, -6, 65, 138],
    diz: 'Dentro do duto lateral, FORA do volume útil. Sopra para CIMA.' },
  { id: 'VD2', nome: 'vent. duto dir.', cor: '#74c0fc', pc: 'PC-1', fora: true,
    caixa: [206, 35, 108, 232, 65, 138],
    diz: 'Idem à esquerda — o retorno tem que ser simétrico.' },
];
