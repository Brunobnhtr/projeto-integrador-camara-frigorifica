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
    id: 'VD1', pc: 'PC-1', nome: 'ventoinha da entrada do duto esq.', tipo: 'ar',
    x: 340, y: 485, w: 36, h: 30, cor: '#4dabf7', sopra: 'esquerda', grupoAr: 'duto', pequeno: true,
    onde: '⭐ ABAIXO DO PTC, na BOCA do duto esquerdo — não dentro dele.',
    porque: 'Fecha o circuito: o ar que desceu pelo centro entra aqui e sobe pelo duto '
          + 'lateral até o topo. É o que impede o gradiente entre a base e a tampa. '
          + '🔧 Ela ficava DENTRO do duto de 30 × 30 mm, e isso era um erro de duas caras: '
          + 'uma ventoinha de 40 mm não cabe folgada num vão de 30, e enfiada lá dentro '
          + 'ela sopra contra a parede em vez de empurrar o ar para a entrada.',
    terminais: [
      { t: '+', de: 'MV-1 · O3+', ref: ['MV-1', 'O3+'], fio: 'em paralelo com as frias' },
      { t: '−', de: 'MV-1 · O3−', ref: ['MV-1', 'O3−'], fio: '—' },
    ],
    avisos: ['📌 O duto fica FORA da parede de acrílico, dentro do isolamento. O ar circula '
           + 'sem furar o volume útil.',
           '⭐ AS DUAS FICAM LADO A LADO, ABAIXO DO PTC, cada uma soprando para a boca do '
           + 'seu duto. Assim elas ficam acessíveis para manutenção sem desmontar o duto, '
           + 'e o ar entra no duto já com velocidade em vez de ser empurrado contra a '
           + 'parede lateral.',
           '⚠️ CONFIRA A SETA DE FLUXO no corpo de cada uma antes de fixar. Invertidas, as '
           + 'duas puxam o ar do duto para o centro e o circuito de ar roda ao contrário — '
           + 'defeito quase impossível de perceber sem teste de fumaça.'],
  },
  {
    id: 'VD2', pc: 'PC-1', nome: 'ventoinha da entrada do duto dir.', tipo: 'ar',
    x: 504, y: 485, w: 36, h: 30, cor: '#4dabf7', sopra: 'direita', grupoAr: 'duto', pequeno: true,
    onde: '⭐ ABAIXO DO PTC, na BOCA do duto direito — ao lado da VD1.',
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
      { t: 'GND', de: 'BD-0V · Z15', ref: ['BD-0V', 'Z15'], fio: '0,25 mm² preto' },
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
          + 'dutos. 🔧 Antes tinha canal próprio no MV-1; hoje entra em PARALELO com as '
          + 'outras quatro internas, porque todas têm a mesma condição — ensaio rodando.',
    terminais: [
      { t: '+', de: 'MV-1 · O3+ (emenda com as 4 de circulação)', ref: ['MV-1', 'O3+'], fio: '0,5 mm² vermelho' },
      { t: '−', de: 'MV-1 · O3− (emenda com as 4 de circulação)', ref: ['MV-1', 'O3−'], fio: '0,5 mm² preto' },
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
      { t: '+24 V', de: 'F-P1 — fusível 100 mA + chave, e 10 voltas no sensor SC-1',
        ref: ['F-P', 'F-P1'], fio: '0,5 mm² vermelho' },
      { t: 'retorno', de: 'BD-0V · Z22', ref: ['BD-0V', 'Z22'], fio: '0,5 mm² azul' },
    ],
    avisos: [
      '⭐ O RETORNO VIROU 0 V COMUM. Ele ia para o shunt da PI-2, onde os 17,6 mA '
      + 'viravam tensão para o multiplexador ler; hoje quem responde "tem corrente?" é o '
      + 'sensor SC-1, no painel, e o retorno é um 0 V com parafuso próprio na barra.',
      '⭐ LED VERMELHO + RESISTOR DE 1,2 kΩ. O LED é só o indicador visual; quem fixa a '
      + 'corrente é o resistor.',
      '⚠️ QUEM DETECTA A FALHA NÃO ESTÁ AQUI DENTRO. O sensor fica no painel, e o fio '
      + 'que sai daqui passa 10 vezes pelo furo dele antes de seguir — é o que faz o '
      + 'sensor enxergar 176 mA em vez de 17,6 mA.',
    ],
  },
];

/* ⭐ O LADO QUENTE, na tampa. Não atravessa parede: fica no ar
   ambiente, em cima dos dissipadores. */
export const TAMPA3D = [
  { id: 'RAD', nome: '2 coolers do radiador', cor: '#e8590c',
    /* ⭐ ALIMENTAÇÃO À ESQUERDA, TACÔMETRO À DIREITA. Não é capricho de
       desenho: os 12 V vêm do MV-1 e sobem pelo lado da POTÊNCIA; os
       dois RPM vão para o Mega e sobem pelo lado do SINAL. Postos na
       ordem em que chegam, nenhum dos cinco precisa cruzar o outro. */
    bornes: [{ b:'+', lado:'base', t:0.12 }, { b:'−', lado:'base', t:0.30 },
              { b:'RPM1', lado:'base', t:0.72 }, { b:'RPM2', lado:'base', t:0.90 }],
    diz: 'Em paralelo nos dois primeiros; cada uma com o seu fio de RPM.' },
  /* ⭐ SÃO TRÊS FIOS, e o modelo declarava um. O DS18B20 vem com rabicho
     de 3 vias — VCC, GND e DATA — e não existe "o resto vem no cabo
     dele": as três pontas soltas chegam TODAS no painel. Sem o VCC ele
     não liga; sem o GND o barramento 1-Wire não tem referência e a
     leitura sai lixo, quando sai. */
  { id: 'DS18', nome: 'DS18B20 do radiador', cor: '#f76707',
    bornes: [{ b:'VCC', lado:'base', t:0.20 }, { b:'GND', lado:'base', t:0.50 },
             { b:'DATA', lado:'base', t:0.80 }],
    diz: 'Colado no dissipador com pasta térmica. Rabicho de 3 vias: '
       + 'vermelho +5 V, preto 0 V, amarelo (ou branco) DATA.' },
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
  { pc: 'PC-1', g: 'Ventilação', n: 2, o: '⭐ as 5 internas (4 de circulação + a do PTC, em paralelo)', de: 'MV-1 · O3', mm: '0,5 mm²' },
  { pc: 'PC-2', g: 'Ensaio',     n: 1, o: 'positivo da posição de ensaio', de: 'F-P1', mm: '0,5 mm²' },
  { pc: 'PC-2', g: 'Ensaio',     n: 1, o: 'retorno da posição de ensaio', de: 'BD-0V · Z22', mm: '0,5 mm²' },
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
    id: 'PC-1', nome: 'POTÊNCIA', tipo: 'PG13,5', cor: '#c92a2a', x: 45, z: 22,
    diz: 'Peltier, PTC e as ventoinhas. Os BTS chaveiam 6 A por aqui — '
       + 'é a fonte de ruído do projeto.',
    porque: '⭐ PG13,5 e não PG9: os dez condutores que entram aqui, quatro deles de '
          + '1,5 mm², dão 9,3 mm de feixe. Um PG9 vai até 8 mm e não fecharia.',
  },
  {
    id: 'PC-2', nome: 'SINAL E MEDIÇÃO', tipo: 'PG9', cor: '#1971c2', x: 155, z: 228,
    diz: 'As duas posições de ensaio e o AM2315C. Carrega os 17,6 mA que '
       + 'estão sendo medidos e os pulsos do I²C.',
  },
];

/* caixa = [x0, y0, z0, x1, y1, z1]
   bornes = onde o fio encosta, em fração da largura da peça (0 a 1) */
export const PECAS3D = [
  { id: 'PELT', bornes: [{ b:'+', lado:'esq', t:0.30 }, { b:'−', lado:'esq', t:0.70 }], nome: '2× Peltier', cor: '#1971c2', pc: 'PC-1',
    caixa: [60, 30, 236, 140, 70, 250],
    diz: 'Encaixadas na tampa. Face fria para dentro, quente para fora.' },
  { id: 'VF', bornes: [{ b:'+', lado:'base', t:0.35 }, { b:'−', lado:'base', t:0.70 }], nome: '2× ventoinha fria', cor: '#4dabf7', pc: 'PC-1',
    caixa: [70, 32, 210, 130, 68, 234],
    diz: 'Sopram para BAIXO — o ar desce pelo centro.' },
  { id: 'SENS', bornes: [{ b:'VCC', lado:'dir', t:0.15 }, { b:'GND', lado:'dir', t:0.38 },
              { b:'SDA', lado:'dir', t:0.62 }, { b:'SCL', lado:'dir', t:0.85 }], nome: 'AM2315C', cor: '#f76707', pc: 'PC-2',
    caixa: [88, 42, 116, 112, 58, 136],
    diz: '⭐ No centro geométrico, suspenso. Longe da Peltier e do PTC.' },
  { id: 'VP', bornes: [{ b:'+', lado:'topo', t:0.30 }, { b:'−', lado:'topo', t:0.70 }], nome: 'ventoinha do PTC', cor: '#4dabf7', pc: 'PC-1',
    caixa: [76, 32, 50, 124, 68, 72],
    diz: 'Sopra para BAIXO também — o circuito de ar é único.' },
  { id: 'PTC', bornes: [{ b:'+', lado:'base', t:0.30 }, { b:'−', lado:'base', t:0.70 }], nome: 'PTC 24 V', cor: '#e03131', pc: 'PC-1',
    caixa: [64, 30, 26, 136, 70, 44],
    diz: 'Na base, sobre o plenum de 30 mm.' },
  { id: 'DUT1', bornes: [{ b:'+24 V', lado:'base', t:0.35 }, { b:'retorno', lado:'topo', t:0.75 }], nome: 'Posição 1', cor: '#c92a2a', pc: 'PC-2',
    caixa: [22, 25, 24, 62, 75, 58],
    diz: 'LED vermelho + 1,2 kΩ — 17,6 mA.' },
  { id: 'VD1', bornes: [{ b:'+', lado:'topo', t:0.35 }, { b:'−', lado:'topo', t:0.70 }], nome: 'vent. entrada duto esq.', cor: '#74c0fc', pc: 'PC-1', fora: true,
    caixa: [-32, 35, 108, -6, 65, 138],
    diz: 'Dentro do duto lateral, FORA do volume útil. Sopra para CIMA.' },
  { id: 'VD2', bornes: [{ b:'+', lado:'topo', t:0.35 }, { b:'−', lado:'topo', t:0.70 }], nome: 'vent. entrada duto dir.', cor: '#74c0fc', pc: 'PC-1', fora: true,
    caixa: [206, 35, 108, 232, 65, 138],
    diz: 'Idem à esquerda — o retorno tem que ser simétrico.' },
];

/* ──────────────────────────────────────────────────────────────────────
   POR ONDE O FIO ANDA DEPOIS DE ATRAVESSAR A PAREDE
   ==================================================
   Faltava isto: a etapa 6 dizia que o fio X1 vai da BTS #1 até a
   pastilha, mas não dizia por onde ele passa DEPOIS do prensa-cabo. Sem
   caminho, o desenho parava na parede e o aluno não via a ida nem a volta.

   Tudo em milímetros do volume útil (x = 0 na parede esquerda,
   z = 0 no piso), do jeito que se mede com a trena na hora de montar:

     lane = corredor rente ao PISO, por onde o fio corre no sentido X
     sobe = coluna vertical rente à PAREDE, por onde ele ganha altura
     crz  = altura em que ele deixa a coluna e atravessa até a peça

   ⭐ A COLUNA ABRE 2,6 mm ENTRE FIOS, e não 1,6. Com o espaçamento
   antigo os seis fios que sobem até a Peltier viravam um borrão de
   2 px de largura — dava para ver que subia alguma coisa, não O QUÊ.
   Para caber a folga, as duas posições de ensaio recuaram 8 mm.

   ⭐ POR QUE CADA FIO TEM UM CORREDOR SÓ DELE: dois fios no mesmo
   corredor viram um risco só no desenho, e aí não dá para conferir na
   montagem. As alturas foram escolhidas numa ordem que faz o feixe se
   abrir como um leque — quem vai mais longe corre mais embaixo — e com
   isso NENHUM fio cruza outro aqui dentro.

   ⚠️ Quem tem `pc` atravessa a parede. Os cinco que faltam nesta lista
   (X5, X6, X19, X20, X21) são do lado quente, EM CIMA da tampa: sobem
   por fora e não furam nada.                                            */
export const ROTAS_CAMARA = {
  /* ── PC-1 · potência, entra no piso à esquerda ───────────────────── */
  X2:  { alvo:'PELT.−', pc:'PC-1', gx:44.1, lane: 8.3, sobe: 4.0 },   // Peltier −
  X1:  { alvo:'PELT.+', pc:'PC-1', gx:43.2, lane: 9.6, sobe: 6.6 },   // Peltier +
  X9:  { alvo:'VF.+', pc:'PC-1', gx:42.3, lane:10.9, sobe: 9.2, crz:202 },  // circulação +
  X10: { alvo:'VF.−', pc:'PC-1', gx:41.4, lane:12.2, sobe:11.8, crz:198 },  // circulação −
  X11: { alvo:'DUT1.+24 V', pc:'PC-1', gx:38.7, lane:16.1 },              // posição 1 +
  X4:  { alvo:'PTC.−', pc:'PC-1', gx:46.8, lane:18.7 },              // PTC −
  X3:  { alvo:'PTC.+', pc:'PC-1', gx:47.7, lane:20.0 },              // PTC +

  /* ── PC-2 · sinal, entra no alto à direita ───────────────────────── */
  X13: { alvo:'DUT1.retorno', pc:'PC-2', gx:156.1, lane:225.7, sobe:195.6, crz: 94 }, // retorno 1
  X15: { alvo:'SENS.VCC', pc:'PC-2', gx:155.2, lane:224.4, sobe:194.2 },          // AM2315C VCC
  X16: { alvo:'SENS.GND', pc:'PC-2', gx:154.3, lane:223.1, sobe:192.8 },          // AM2315C GND
  X17: { alvo:'SENS.SDA', pc:'PC-2', gx:153.4, lane:221.8, sobe:191.4 },          // AM2315C SDA
  X18: { alvo:'SENS.SCL', pc:'PC-2', gx:152.5, lane:220.5, sobe:190.0 },          // AM2315C SCL
};

/* as emendas feitas DENTRO da câmara, que não são fio vindo do painel */
export const EMENDAS_CAMARA = [
  { de:{ p:'VF', b:'+' }, para:{ p:'VD1', b:'+' },
    diz:'⭐ as 5 internas em paralelo — 1 par de fios para 5 ventoinhas' },
  { de:{ p:'VF', b:'−' }, para:{ p:'VD1', b:'−' }, diz:'' },
  { de:{ p:'VF', b:'+' }, para:{ p:'VD2', b:'+' }, diz:'' },
  { de:{ p:'VF', b:'−' }, para:{ p:'VD2', b:'−' }, diz:'' },
  { de:{ p:'VF', b:'+' }, para:{ p:'VP', b:'+' },
    diz:'🔧 A ventoinha do PTC entrou nesta emenda. Ela tinha canal e par próprios '
      + '(MV-1 · O2, fios X7/X8) para continuar girando depois do aquecedor — não '
      + 'precisa: o PTC é AUTO-LIMITADO, sem fluxo de ar a resistência sobe e ele '
      + 'corta a própria potência. Saíram 2 condutores da parede, 1 canal do MV-1 '
      + 'e o pino D28 do Mega.' },
  { de:{ p:'VF', b:'−' }, para:{ p:'VP', b:'−' }, diz:'' },
];
