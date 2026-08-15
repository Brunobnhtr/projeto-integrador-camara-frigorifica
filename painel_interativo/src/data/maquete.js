/**
 * A MAQUETE VISTA DE CIMA — página inicial
 * ========================================
 * Baseada em desenhos/01_maquete_planta.svg. Coordenadas de desenho
 * (não são milímetros): a maquete real tem ~1,20 × 0,60 m.
 *
 * A história que o desenho conta, da esquerda para a direita:
 *
 *   SUBESTAÇÃO ──postes──► PAINEL ──► CÂMARA
 *   (faz a energia)  (leva)  (comanda)  (usa)
 */

export const TELA = { largura: 1420, altura: 700 };

/* ── as quatro áreas ─────────────────────────────────────────────── */
export const AREAS = [
  { id: 'sub',    nome: 'SUBESTAÇÃO',      x: 40,   y: 55,  w: 210, h: 250,
    cor: '#c92a2a', legenda: 'Onde a energia é gerada e protegida' },
  { id: 'rua',    nome: 'RUA · postes',    x: 285,  y: 55,  w: 480, h: 250,
    cor: '#f08c00', legenda: 'A rede de distribuição em miniatura' },
  { id: 'painel', nome: 'PAINEL DE COMANDO', x: 805, y: 55, w: 260, h: 250,
    cor: '#1971c2', legenda: 'O cérebro: recebe, decide e aciona' },
  { id: 'camara', nome: 'CÂMARA',          x: 1105, y: 55,  w: 250, h: 250,
    cor: '#0ca678', legenda: 'A carga: onde o frio e o calor acontecem' },
];

/* ── a fonte, dentro da subestação ───────────────────────────────── */
export const FONTE = {
  x: 62, y: 105, w: 165, h: 130,
  nome: 'Fonte chaveada 24 V · 240 W',
  entrada: {
    nome: 'Rede 127 V CA',
    bornes: [
      { ref: 'L',  nome: 'Fase',      cor: '#8a1a1a' },
      { ref: 'N',  nome: 'Neutro',    cor: '#1971c2' },
      { ref: 'PE', nome: 'Terra',     cor: '#2f9e44' },
    ],
    nota: 'É o único ponto do projeto com 127 V. Daqui para a frente tudo é 24 V ou menos.',
  },
  saidas: {
    positivas: ['V+ 1', 'V+ 2', 'V+ 3'],
    negativas: ['V− 1', 'V− 2', 'V− 3'],
    nota: 'A fonte tem 3 saídas + e 3 saídas −. Os três positivos viram os três '
        + 'ramais que sobem nos postes. Dos negativos, um só é usado: ele desce e '
        + 'vai por baixo até o painel.',
  },
};

/* ── os fusíveis, na saída da fonte ──────────────────────────────── */
export const FUSIVEIS = [
  { ref: 'F1', a: '10 A', x: 244, y: 130, cor: '#c92a2a', protege: 'o ramal de potência' },
  { ref: 'F2', a: '2 A',  x: 244, y: 160, cor: '#f08c00', protege: 'o ramal dos 5 V' },
  { ref: 'F3', a: '2 A',  x: 244, y: 190, cor: '#fab005', protege: 'o ramal dos 12 V' },
];

/* ── os três postes ──────────────────────────────────────────────── */
export const POSTES = [
  { ref: 'P1', x: 360, y: 200, nome: 'Poste 1 — derivação',
    equipa: null,
    faz: 'Só entrega os 24 V. Não tem transformador — a carga já usa 24 V, '
       + 'então não há nada para converter.',
    analogia: 'É o consumidor industrial que recebe na tensão da rede e monta a '
            + 'própria subestação. Não passa pelo transformador de poste.' },
  { ref: 'P2', x: 520, y: 200, nome: 'Poste 2 — T2',
    equipa: { ref: 'T2', de: '24 V', para: '5,10 V', modelo: 'LM2596 com display' },
    faz: 'Aqui os 24 V viram 5,10 V, a tensão da eletrônica.',
    analogia: 'É o transformador de poste que abaixa a tensão da rua para a tensão '
            + 'da casa.' },
  { ref: 'P3', x: 680, y: 200, nome: 'Poste 3 — T3',
    equipa: { ref: 'T3', de: '24 V', para: '12,0 V', modelo: 'LM2596 com display' },
    faz: 'Aqui os 24 V viram 12 V, para as ventoinhas. E daqui sai TAMBÉM uma '
       + 'derivação dos 24 V crus, pegada ANTES do conversor.',
    analogia: 'Um poste pode alimentar dois clientes diferentes: um que precisa da '
            + 'tensão baixa e outro que quer a tensão cheia.' },
];

/* ── entradas do painel ──────────────────────────────────────────── */
export const ENTRADAS_PAINEL = [
  { ref: 'PG9',  x: 850,  nome: '24 V potência' },
  { ref: 'PG7a', x: 900,  nome: '5 V' },
  { ref: 'PG7b', x: 960,  nome: '12 V + 24 V serviços' },
  { ref: 'PG-0', x: 1010, nome: 'retorno 0 V' },
];

const Y_AEREO = 128;   // altura da linha aérea, no topo dos postes
const Y_SUBT  = 430;   // profundidade da linha enterrada
const Y_BASE  = 305;   // base do painel

/* ── OS FIOS ─────────────────────────────────────────────────────────
 * `caminho` = a trajetória inteira, ponto a ponto.
 * `passos`  = a mesma trajetória contada em palavras.
 */
export const FIOS = [
  {
    id: 'AC', nome: '127 V da tomada', cor: '#8a1a1a', tracejado: true,
    grupo: 'entrada', bitola: '2 × 1,5 mm² + terra',
    resumo: 'A energia que vem da parede. É o único trecho perigoso da maquete.',
    caminho: [[10, 170], [62, 170]],
    passos: [
      { onde: 'Tomada da bancada', diz: 'Entra com 127 V alternados.' },
      { onde: 'Chave geral Q0', diz: 'Desliga tudo de uma vez. É a primeira coisa que '
            + 'você aciona ao chegar e a última ao sair.' },
      { onde: 'Fonte 24 V', diz: 'A fonte transforma os 127 V alternados em 24 V '
            + 'contínuos. Daqui para a frente, nada mais tem 127 V.' },
    ],
    atencao: 'É o ÚNICO ponto do projeto com tensão de rede. Todo o resto trabalha em '
           + '24 V ou menos, que é seguro ao toque.',
  },
  {
    id: 'R1', nome: 'Ramal 1 — 24 V de potência', cor: '#c92a2a',
    grupo: 'ramal', bitola: '1,00 mm²', corrente: '6,0 A',
    resumo: 'O fio mais grosso da maquete. Leva quase toda a corrente do projeto.',
    caminho: [[227, 130], [244, 130], [300, 130], [360, 130], [360, Y_AEREO],
              [360, 200], [360, 250], [430, 250], [430, Y_BASE + 25], [850, Y_BASE + 25],
              [850, Y_BASE]],
    passos: [
      { onde: 'Fonte · saída V+ 1', diz: 'Começa aqui, na primeira saída positiva.' },
      { onde: 'Fusível F1 · 10 A', diz: 'É o maior fusível do projeto, porque este é o '
            + 'ramal que leva mais corrente: 6 ampères para as pastilhas e o aquecedor.' },
      { onde: 'Sobe no poste P1', diz: 'Vai pelo alto, como um fio de rua de verdade.' },
      { onde: 'Desce no poste P1', diz: 'O P1 não tem transformador — os 24 V descem '
            + 'do jeito que chegaram, porque a carga já usa 24 V.' },
      { onde: 'Entra no painel · prensa-cabo PG9', diz: 'Vai direto para o contato do '
            + 'relé KA2, que é quem liga e desliga a potência.' },
    ],
    atencao: 'É o único fio de 1,00 mm² da parte aérea. Os outros dois são mais finos '
           + 'porque levam bem menos corrente.',
  },
  {
    id: 'R2', nome: 'Ramal 2 — vira 5 V no poste', cor: '#f08c00',
    grupo: 'ramal', bitola: '0,50 mm²', corrente: '< 1 A',
    resumo: 'Sai da fonte com 24 V e chega ao painel com 5 V. Quem muda é o poste.',
    caminho: [[227, 160], [244, 160], [310, 160], [360, 160], [360, Y_AEREO + 14],
              [520, Y_AEREO + 14], [520, 200], [520, 250], [560, 250],
              [560, Y_BASE + 40], [900, Y_BASE + 40], [900, Y_BASE]],
    passos: [
      { onde: 'Fonte · saída V+ 2', diz: 'Sai da fonte com 24 V, igual ao R1.' },
      { onde: 'Fusível F2 · 2 A', diz: 'Fusível menor, porque este ramal leva pouca '
            + 'corrente. Se der defeito aqui, queima este e não o de 10 A — assim você '
            + 'sabe onde procurar.' },
      { onde: 'Passa pelo poste P1', diz: 'Só passa, não para.' },
      { onde: 'Chega no poste P2 · transformador T2', diz: '⭐ Aqui a tensão muda: o '
            + 'conversor pega os 24 V e entrega 5,10 V. É o transformador de poste da '
            + 'maquete.' },
      { onde: 'Desce e entra no painel · PG7a', diz: 'Do poste em diante o fio já é de '
            + '5 V. Alimenta o Arduino, a tela e a eletrônica toda.' },
    ],
    atencao: 'A tensão só muda NO POSTE. Antes dele o fio tem 24 V, depois tem 5 V — '
           + 'é o mesmo fio com dois nomes.',
  },
  {
    id: 'R3', nome: 'Ramal 3 — vira 12 V no poste', cor: '#fab005',
    grupo: 'ramal', bitola: '0,75 mm²', corrente: '< 1 A',
    resumo: 'Igual ao R2, mas entrega 12 V. E este poste ainda faz uma segunda coisa.',
    caminho: [[227, 190], [244, 190], [320, 190], [360, 190], [360, Y_AEREO + 28],
              [680, Y_AEREO + 28], [680, 200], [680, 250], [720, 250],
              [720, Y_BASE + 55], [960, Y_BASE + 55], [960, Y_BASE]],
    passos: [
      { onde: 'Fonte · saída V+ 3', diz: 'A terceira e última saída positiva.' },
      { onde: 'Fusível F3 · 2 A', diz: 'Também de 2 A, como o F2.' },
      { onde: 'Passa por P1 e P2', diz: 'Atravessa os dois primeiros postes sem parar.' },
      { onde: 'Chega no poste P3 · transformador T3', diz: '⭐ Aqui os 24 V viram 12 V, '
            + 'que é o que as ventoinhas usam.' },
      { onde: 'Desce e entra no painel · PG7b', diz: 'Alimenta os coolers do painel e '
            + 'os das pastilhas.' },
    ],
  },
  {
    id: 'SRV', nome: '24 V de serviços — a derivação do P3', cor: '#e8590c',
    grupo: 'ramal', bitola: '0,50 mm²', corrente: '< 0,5 A',
    resumo: 'O segundo fio de 24 V. Sai do mesmo poste do 12 V, mas ANTES do conversor.',
    caminho: [[680, Y_AEREO + 28], [680, 215], [700, 215], [700, 250], [745, 250],
              [745, Y_BASE + 70], [975, Y_BASE + 70], [975, Y_BASE]],
    passos: [
      { onde: 'Poste P3 · antes do transformador', diz: '⭐ É uma derivação: o fio de '
            + '24 V que chega no P3 se divide em dois. Um entra no conversor e vira '
            + '12 V; o outro segue com os 24 V intactos.' },
      { onde: 'Desce e entra no painel · PG7b', diz: 'Vira o barramento BD-24V.' },
      { onde: 'Alimenta o que não pode desligar', diz: 'O ESP32, a lâmpada de FALHA e '
            + 'as posições de ensaio. Este barramento NÃO cai quando alguém aperta a '
            + 'emergência — é o que mantém o sistema avisando o que houve.' },
    ],
    atencao: '⚠️ São DOIS fios de 24 V entrando no painel, e eles não são a mesma coisa. '
           + 'O do R1 cai na emergência; este não cai. Use anilhas de cores diferentes — '
           + 'trocar os dois faz a emergência deixar de funcionar.',
  },
  {
    id: 'NEG', nome: 'Retorno 0 V — o fio que vai por baixo', cor: '#212529',
    grupo: 'retorno', bitola: '1,50 mm²', corrente: '6,9 A (a soma de tudo)',
    resumo: 'Um único fio de volta, passando por baixo da maquete. Toda a corrente '
          + 'que sobe pelos postes volta por ele.',
    caminho: [[227, 225], [250, 225], [250, Y_SUBT], [360, Y_SUBT], [520, Y_SUBT],
              [680, Y_SUBT], [1010, Y_SUBT], [1010, Y_BASE]],
    subterraneo: true,
    passos: [
      { onde: 'Fonte · saída V− 1', diz: 'Sai por uma das três saídas negativas. As '
            + 'outras duas ficam de reserva.' },
      { onde: 'Desce e segue por baixo', diz: 'Enquanto os positivos vão pelo alto, o '
            + 'retorno vai por baixo do tabuleiro.' },
      { onde: 'Passa pelos três postes', diz: 'Cada poste pega um pedacinho dele: os '
            + 'conversores T2 e T3 também precisam de retorno.' },
      { onde: 'Entra no painel', diz: 'Chega no bloco BD-0V, que é o ponto de encontro '
            + 'de todos os retornos.' },
    ],
    atencao: '⭐ Existe UM ÚNICO 0 V no projeto inteiro. Não são três. Os conversores '
           + 'não separam o negativo: ele atravessa por dentro deles. Por isso todos os '
           + 'retornos podem — e devem — se encontrar no mesmo lugar.',
  },
];

/* ── conexões do painel para a câmara, só indicadas ──────────────── */
export const SAIDAS_CAMARA = [
  { nome: 'Pastilhas Peltier', cor: '#1971c2', y: 150 },
  { nome: 'Aquecedor PTC', cor: '#c92a2a', y: 190 },
  { nome: 'Sensores e ventoinhas', cor: '#0ca678', y: 230 },
];

export const LEGENDA = [
  { cor: '#8a1a1a', txt: '127 V da rede — o único trecho perigoso' },
  { cor: '#c92a2a', txt: '24 V de potência — cai na emergência' },
  { cor: '#e8590c', txt: '24 V de serviços — NÃO cai na emergência' },
  { cor: '#fab005', txt: '12 V — ventoinhas' },
  { cor: '#f08c00', txt: '5 V — eletrônica' },
  { cor: '#212529', txt: '0 V — o retorno, por baixo' },
];
