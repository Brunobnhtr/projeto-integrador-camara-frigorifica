/**
 * A MAQUETE VISTA DE CIMA — página inicial
 * ========================================
 * Coordenadas em MILÍMETROS: a maquete é 1500 × 600 mm.
 *
 * A história, da esquerda para a direita:
 *   SUBESTAÇÃO ──4 condutores pelo alto──► PADRÃO ──► PAINEL ──► CÂMARA
 *
 * ⭐ AS DUAS REGRAS QUE EXPLICAM O DESENHO INTEIRO:
 *
 * 1. Os TRÊS ramais de 24 V atravessam TODOS os postes e só descem no
 *    P4, lado a lado, cada um na sua entrada. Os transformadores T2 e T3
 *    são DERIVAÇÕES no meio do caminho — eles não interrompem o ramal.
 *
 * 2. Do transformador sai SÓ O POSITIVO. O 0 V não precisa voltar porque
 *    é o mesmo condutor dos dois lados: os conversores não isolam.
 */

export const TELA = { largura: 1500, altura: 620 };
export const DIMENSAO_REAL = '1500 × 600 mm';

/* Em planta, os 4 condutores aparecem lado a lado. Na maquete real eles
   ficam na cruzeta, com o 0 V numa altura um pouco menor. */
export const NIVEIS = { R1: 96, R2: 112, R3: 128, GND: 150 };
const Y_BASE_POSTE = 215;
const Y_SUBT = 400;     // faixa de baixo do tabuleiro
const Y_PAINEL = 300;   // borda inferior do painel

export const AREAS = [
  { id: 'sub',    nome: 'SUBESTAÇÃO',        x: 25,   y: 42, w: 210, h: 240,
    cor: '#c92a2a', legenda: 'Gera, protege e divide em três ramais' },
  { id: 'rua',    nome: 'RUA · rede aérea',  x: 268,  y: 42, w: 700, h: 240,
    cor: '#f08c00', legenda: 'A distribuição em miniatura' },
  { id: 'painel', nome: 'PAINEL DE COMANDO', x: 995,  y: 42, w: 235, h: 240,
    cor: '#1971c2', legenda: 'Recebe, decide e aciona' },
  { id: 'camara', nome: 'CÂMARA',            x: 1258, y: 42, w: 217, h: 240,
    cor: '#0ca678', legenda: 'Onde o frio e o calor acontecem' },
];

/* ── a subestação por dentro ─────────────────────────────────────── */
export const DISJUNTOR = {
  ref: 'Q0', x: 58, y: 56, w: 54, h: 26,
  spec: 'Disjuntor 2P · 6 A · curva C',
  papel: 'É a proteção da entrada e, agora, também a chave geral.',
  porque6A: 'A fonte é de 24 V / 10 A — mas esses 10 A são do lado de 24 V. Do lado '
          + 'de 127 V a mesma potência dá só ~2,4 A, porque a tensão é 5 vezes maior. '
          + 'O disjuntor de 6 A tem folga de sobra.',
  porqueC: 'Curva C por causa do "tranco" de partida: quando a fonte liga, os '
         + 'capacitores dela puxam dezenas de ampères por alguns milissegundos. Um '
         + 'disjuntor curva B desarmaria toda vez que você ligasse a maquete.',
};

export const FONTE = {
  x: 45, y: 98, w: 165, h: 120,
  nome: 'Fonte chaveada 24 V · 240 W',
  entrada: {
    nome: 'Rede 127 V CA',
    bornes: [
      { ref: 'L',  nome: 'Fase',   cor: '#8a1a1a' },
      { ref: 'N',  nome: 'Neutro', cor: '#1971c2' },
      { ref: 'PE', nome: 'Terra',  cor: '#2f9e44' },
    ],
    nota: 'É o único ponto do projeto com 127 V. Daqui para a frente tudo é 24 V ou menos.',
  },
  saidas: {
    positivas: ['V+ 1', 'V+ 2', 'V+ 3'],
    negativas: ['V− 1', 'V− 2', 'V− 3'],
    nota: 'Três saídas + e três −. Os três positivos viram os três ramais. Dos '
        + 'negativos, um só é usado — e dá conta de tudo, porque é o mesmo 0 V para '
        + 'todas as tensões. Os outros dois ficam de reserva.',
  },
};

export const FUSIVEIS = [
  { ref: 'F1', a: '10 A', x: 228, y: 118, cor: '#c92a2a', protege: 'o ramal de potência' },
  { ref: 'F2', a: '2 A',  x: 228, y: 148, cor: '#f08c00', protege: 'o ramal que vira 5 V' },
  { ref: 'F3', a: '2 A',  x: 228, y: 178, cor: '#fab005', protege: 'o ramal que vira 12 V' },
];

/* ── os postes ───────────────────────────────────────────────────── */
export const POSTES = [
  { ref: 'P1', x: 390, base: Y_BASE_POSTE, nome: 'Poste 1 — só passagem',
    desce: 'nada — os quatro seguem em frente',
    faz: 'É um poste de passagem. Os quatro condutores sobem aqui e seguem viagem, '
       + 'sem que nada desça.',
    analogia: 'Como os postes que você vê na rua entre um transformador e outro: só '
            + 'sustentam o fio.' },
  { ref: 'P2', x: 560, base: Y_BASE_POSTE, nome: 'Poste 2 — transformador T2',
    equipa: { ref: 'T2', de: '24 V', para: '5,10 V', modelo: 'LM2596 com display' },
    desce: '5,10 V (a saída do T2)',
    faz: 'O ramal 2 NÃO para aqui: ele segue em frente. O que existe é uma DERIVAÇÃO '
       + 'que desce até o transformador, junto com o 0 V. Do T2 sai um fio só, com '
       + '5,10 V, que desce e vai por baixo até o painel.',
    porqueUmSo: '⭐ Sai só o positivo porque o 0 V da fonte já é o retorno de todas as '
              + 'tensões. O conversor não isola nada — o negativo entra e sai como o '
              + 'mesmo condutor. Um segundo fio de volta não teria função.',
    analogia: 'É o transformador de poste: pendurado na rede, atende quem está embaixo '
            + 'dele, e a rede continua passando por cima.' },
  { ref: 'P3', x: 730, base: Y_BASE_POSTE, nome: 'Poste 3 — transformador T3',
    equipa: { ref: 'T3', de: '24 V', para: '12,0 V', modelo: 'LM2596 com display' },
    desce: '12,0 V (a saída do T3)',
    faz: 'Igual ao P2: o ramal 3 segue em frente e uma derivação desce até o T3, com '
       + 'o 0 V junto. Sai um fio de 12 V, que desce e vai por baixo.',
    porqueUmSo: 'Também aqui o 0 V só entra — não sai. Mesmo motivo do P2.',
    analogia: 'Dois transformadores na mesma rua, cada um atendendo uma tensão '
            + 'diferente.' },
  { ref: 'P4', x: 900, base: Y_BASE_POSTE, nome: 'Poste 4 — PADRÃO DE ENTRADA',
    vazado: true, entradas: 3,
    desce: 'os 3 × 24 V, lado a lado  +  o 0 V',
    faz: 'Aqui termina a rede aérea. Os três ramais de 24 V, que atravessaram todos os '
       + 'postes sem parar, descem aqui em TRÊS entradas individuais, uma ao lado da '
       + 'outra. O 0 V desce junto, no mesmo poste.',
    porqueUmSo: '📌 Dos três 24 V, dois têm função definida — a potência e os serviços. '
              + 'O terceiro fica de RESERVA, e é bom que fique: acrescentar uma carga '
              + 'depois não vai exigir puxar fio novo pela rede toda.',
    analogia: '🏭 É o **padrão de entrada**: o poste com eletroduto onde a concessionária '
            + 'entrega a energia na porta da empresa. O miolo é vazado justamente para '
            + 'os cabos passarem por dentro.' },
];

export const ENTRADAS_PAINEL = [
  { ref: 'E1', x: 1020, nome: '24 V potência' },
  { ref: 'E2', x: 1052, nome: '24 V serviços' },
  { ref: 'E3', x: 1084, nome: '24 V reserva' },
  { ref: 'E4', x: 1128, nome: '12 V' },
  { ref: 'E5', x: 1160, nome: '5 V' },
  { ref: 'E6', x: 1200, nome: '0 V' },
];

/* ── OS FIOS ─────────────────────────────────────────────────────── */
export const FIOS = [
  {
    id: 'AC', nome: '127 V da tomada', cor: '#8a1a1a', tracejado: true,
    bitola: '2 × 1,5 mm² + terra',
    resumo: 'A energia que vem da parede. É o único trecho perigoso da maquete.',
    caminho: [[8, 69], [58, 69], [112, 69], [140, 69], [140, 98]],
    passos: [
      { onde: 'Tomada da bancada', diz: 'Entra com 127 V alternados.' },
      { onde: 'Disjuntor Q0 · 2P 6 A curva C', diz: 'É a proteção da entrada e também a '
            + 'chave geral: é ele que você liga ao chegar e desliga ao sair.' },
      { onde: 'Fonte 24 V', diz: 'Transforma os 127 V alternados em 24 V contínuos. '
            + 'Daqui para a frente, nada mais tem 127 V.' },
    ],
    atencao: 'É o ÚNICO ponto com tensão de rede. Todo o resto trabalha em 24 V ou '
           + 'menos, que é seguro ao toque.',
  },
  {
    id: 'R1', nome: 'Ramal 1 — 24 V de potência', cor: '#c92a2a',
    bitola: '1,00 mm²', corrente: '6,0 A',
    resumo: 'Atravessa os quatro postes sem parar e desce no padrão de entrada.',
    caminho: [[210, 118], [228, 118], [300, 110], [360, NIVEIS.R1], [390, NIVEIS.R1],
              [560, NIVEIS.R1], [730, NIVEIS.R1], [900, NIVEIS.R1],
              [893, Y_BASE_POSTE], [893, Y_SUBT], [1020, Y_SUBT], [1020, Y_PAINEL]],
    passos: [
      { onde: 'Fonte · saída V+ 1', diz: 'Começa na primeira saída positiva.' },
      { onde: 'Fusível F1 · 10 A', diz: 'O maior do projeto, porque este ramal leva mais '
            + 'corrente: 6 ampères para as pastilhas e o aquecedor.' },
      { onde: 'Sobe no P1 e atravessa P2 e P3', diz: 'Passa por cima dos dois '
            + 'transformadores sem parar — não tem nada para converter, a carga já usa '
            + '24 V.' },
      { onde: 'Desce no P4 · 1ª entrada', diz: 'Desce pelo padrão de entrada, na '
            + 'primeira das três entradas de 24 V.' },
      { onde: 'Entra no painel', diz: 'Vai direto ao relé KA2, que liga e desliga a '
            + 'potência.' },
    ],
    atencao: 'É o único fio de 1,00 mm² da rede aérea. Os outros são mais finos porque '
           + 'levam bem menos corrente.',
  },
  {
    id: 'R2', nome: 'Ramal 2 — alimenta o T2 e segue', cor: '#f08c00',
    bitola: '0,50 mm²', corrente: '< 1 A',
    resumo: 'Deriva no P2 para alimentar o transformador de 5 V, mas NÃO para ali — '
          + 'continua até o P4 como 24 V de reserva.',
    caminho: [[210, 148], [228, 148], [300, 138], [360, NIVEIS.R2], [390, NIVEIS.R2],
              [560, NIVEIS.R2], [730, NIVEIS.R2], [900, NIVEIS.R2],
              [906, Y_BASE_POSTE], [906, Y_SUBT], [1084, Y_SUBT], [1084, Y_PAINEL]],
    derivacoes: [[[560, NIVEIS.R2], [560, 168]]],
    passos: [
      { onde: 'Fonte · saída V+ 2', diz: 'Sai com 24 V, igual ao R1.' },
      { onde: 'Fusível F2 · 2 A', diz: 'Menor, porque leva pouca corrente. Se der '
            + 'defeito aqui, queima este e não o de 10 A — assim você sabe onde procurar.' },
      { onde: '⭐ Poste P2 · derivação para o T2', diz: 'Uma derivação desce até o '
            + 'transformador, junto com o 0 V. O ramal em si NÃO para: segue por cima.' },
      { onde: 'Continua até o P4', diz: 'Chega ao padrão de entrada ainda com 24 V.' },
      { onde: 'Desce no P4 · 2ª entrada', diz: 'Entra no painel como o 24 V de reserva.' },
    ],
  },
  {
    id: 'T2OUT', nome: 'Saída do T2 — 5,10 V', cor: '#e8590c',
    bitola: '0,50 mm²', corrente: '< 1 A',
    resumo: 'O único fio que sai do transformador de 5 V. Desce pelo poste e vai por '
          + 'baixo até o painel.',
    caminho: [[560, 190], [572, 200], [572, Y_BASE_POSTE], [572, Y_SUBT],
              [1160, Y_SUBT], [1160, Y_PAINEL]],
    passos: [
      { onde: 'Saída do transformador T2', diz: '⭐ Sai UM fio só, com 5,10 V. O 0 V não '
            + 'precisa voltar por aqui — ele é o mesmo condutor dos dois lados do '
            + 'conversor.' },
      { onde: 'Desce por dentro do poste', diz: 'E segue por baixo do tabuleiro.' },
      { onde: 'Entra no painel', diz: 'Alimenta o Arduino, a tela e toda a eletrônica.' },
    ],
    atencao: 'Repare que a tensão só muda NO POSTE. Antes do transformador o fio tem '
           + '24 V; depois dele, 5 V.',
  },
  {
    id: 'R3', nome: 'Ramal 3 — alimenta o T3 e segue', cor: '#fab005',
    bitola: '0,75 mm²', corrente: '< 1 A',
    resumo: 'Mesma ideia do R2: deriva no P3 para o transformador de 12 V e continua '
          + 'até o P4, virando o 24 V de serviços.',
    caminho: [[210, 178], [228, 178], [300, 165], [360, NIVEIS.R3], [390, NIVEIS.R3],
              [560, NIVEIS.R3], [730, NIVEIS.R3], [900, NIVEIS.R3],
              [919, Y_BASE_POSTE], [919, Y_SUBT], [1052, Y_SUBT], [1052, Y_PAINEL]],
    derivacoes: [[[730, NIVEIS.R3], [730, 168]]],
    passos: [
      { onde: 'Fonte · saída V+ 3', diz: 'A terceira e última saída positiva.' },
      { onde: 'Fusível F3 · 2 A', diz: 'Também de 2 A, como o F2.' },
      { onde: 'Atravessa P1 e P2', diz: 'Passa por cima sem parar.' },
      { onde: '⭐ Poste P3 · derivação para o T3', diz: 'Desce uma derivação até o '
            + 'transformador, com o 0 V junto. O ramal segue por cima.' },
      { onde: 'Desce no P4 · 3ª entrada', diz: 'Vira o **24 V de serviços** do painel.' },
      { onde: 'Alimenta o que não pode desligar', diz: 'O ESP32, a lâmpada de FALHA e as '
            + 'posições de ensaio. Este barramento NÃO cai quando alguém aperta a '
            + 'emergência — é o que mantém o sistema avisando o que aconteceu.' },
    ],
    atencao: '⚠️ São TRÊS fios de 24 V descendo no P4, e eles não são a mesma coisa. O '
           + 'do R1 cai na emergência; este não cai. Anilhas de cores diferentes — '
           + 'trocar os dois faz a emergência deixar de funcionar.',
  },
  {
    id: 'T3OUT', nome: 'Saída do T3 — 12,0 V', cor: '#f59f00',
    bitola: '0,75 mm²', corrente: '< 1 A',
    resumo: 'O único fio que sai do transformador de 12 V.',
    caminho: [[730, 190], [742, 200], [742, Y_BASE_POSTE], [742, Y_SUBT],
              [1128, Y_SUBT], [1128, Y_PAINEL]],
    passos: [
      { onde: 'Saída do transformador T3', diz: 'Um fio só, com 12 V. Mesmo motivo do '
            + 'T2: o 0 V não volta por aqui.' },
      { onde: 'Desce e vai por baixo', diz: 'Entra no painel e alimenta os coolers do '
            + 'painel e os das pastilhas.' },
    ],
  },
  {
    id: 'GND', nome: '0 V — o retorno de tudo', cor: '#212529',
    bitola: '1,50 mm²', corrente: '6,9 A (a soma de tudo)',
    resumo: 'Viaja um pouco abaixo dos positivos, entra nos dois transformadores e '
          + 'desce no P4 junto com os 24 V.',
    caminho: [[210, 208], [232, 208], [300, 190], [360, NIVEIS.GND], [390, NIVEIS.GND],
              [560, NIVEIS.GND], [730, NIVEIS.GND], [900, NIVEIS.GND],
              [932, Y_BASE_POSTE], [932, Y_SUBT], [1200, Y_SUBT], [1200, Y_PAINEL]],
    derivacoes: [
      [[560, NIVEIS.GND], [548, NIVEIS.GND], [548, 172]],
      [[730, NIVEIS.GND], [718, NIVEIS.GND], [718, 172]],
    ],
    passos: [
      { onde: 'Fonte · saída V− 1', diz: 'Sai por uma das três saídas negativas. As '
            + 'outras duas ficam de reserva — uma só dá conta.' },
      { onde: 'Sobe no P1, um pouco abaixo dos outros', diz: 'Na maquete real ele fica '
            + 'na posição mais baixa da cruzeta. Em planta, aparece como a quarta linha.' },
      { onde: 'Entra nos DOIS transformadores', diz: 'Uma derivação desce no T2 e outra '
            + 'no T3. Sem o 0 V, os conversores não teriam por onde fechar o circuito.' },
      { onde: '⭐ E segue direto, sem parar', diz: 'É o único condutor que atravessa a '
            + 'rede inteira servindo a todos, em vez de terminar em algum lugar.' },
      { onde: 'Desce no P4', diz: 'Chega ao bloco BD-0V do painel, onde todos os '
            + 'retornos se encontram.' },
    ],
    atencao: '⭐ Existe UM ÚNICO 0 V no projeto inteiro. Não são três, um por tensão. Os '
           + 'conversores não isolam o negativo: ele atravessa por dentro deles. É por '
           + 'isso que dos transformadores sai só o positivo.',
  },
];

export const SAIDAS_CAMARA = [
  { nome: 'Pastilhas Peltier', cor: '#1971c2', y: 120 },
  { nome: 'Aquecedor PTC', cor: '#c92a2a', y: 170 },
  { nome: 'Sensores e ventoinhas', cor: '#0ca678', y: 220 },
];

export const LEGENDA = [
  { cor: '#8a1a1a', txt: '127 V da rede — o único trecho perigoso' },
  { cor: '#c92a2a', txt: 'R1 · 24 V potência — cai na emergência' },
  { cor: '#fab005', txt: 'R3 · 24 V serviços — NÃO cai na emergência' },
  { cor: '#f08c00', txt: 'R2 · 24 V reserva' },
  { cor: '#e8590c', txt: '5 V — saída do T2' },
  { cor: '#f59f00', txt: '12 V — saída do T3' },
  { cor: '#212529', txt: '0 V — o retorno, abaixo dos outros' },
];
