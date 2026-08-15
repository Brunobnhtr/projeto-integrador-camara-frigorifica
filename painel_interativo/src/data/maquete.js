/**
 * A MAQUETE VISTA DE CIMA — página inicial
 * ========================================
 * Baseada em desenhos/01_maquete_planta.svg.
 *
 * A história, da esquerda para a direita:
 *   SUBESTAÇÃO ──postes──► PAINEL ──► CÂMARA
 *
 * ⭐ A REGRA QUE EXPLICA O DESENHO INTEIRO:
 * Os 4 condutores viajam PELO ALTO, como rede de rua — os três positivos
 * em cima e o 0 V um pouco abaixo. Cada ramal desce no SEU poste e segue
 * por baixo do tabuleiro até o painel.
 *
 * E do transformador sai SÓ O POSITIVO. O 0 V não precisa voltar por ele
 * porque é o mesmo condutor dos dois lados — os conversores não isolam.
 */

export const TELA = { largura: 1420, altura: 700 };

/* alturas da linha aérea — os positivos em cima, o 0 V abaixo */
export const NIVEIS = { R1: 112, R2: 128, R3: 144, GND: 166 };
const Y_POSTE_BASE = 258;
const Y_SUBT = 440;      // por baixo do tabuleiro
const Y_BASE = 305;      // base do painel

export const AREAS = [
  { id: 'sub',    nome: 'SUBESTAÇÃO',        x: 40,   y: 55,  w: 210, h: 250,
    cor: '#c92a2a', legenda: 'Onde a energia é gerada e protegida' },
  { id: 'rua',    nome: 'RUA · rede aérea',  x: 285,  y: 55,  w: 490, h: 250,
    cor: '#f08c00', legenda: 'A distribuição em miniatura' },
  { id: 'painel', nome: 'PAINEL DE COMANDO', x: 830,  y: 55,  w: 245, h: 250,
    cor: '#1971c2', legenda: 'Recebe, decide e aciona' },
  { id: 'camara', nome: 'CÂMARA',            x: 1115, y: 55,  w: 240, h: 250,
    cor: '#0ca678', legenda: 'Onde o frio e o calor acontecem' },
];

export const FONTE = {
  x: 62, y: 105, w: 165, h: 130,
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
        + 'negativos, um só é usado — e ele dá conta de tudo, porque é o mesmo 0 V '
        + 'para todas as tensões. Os outros dois ficam de reserva.',
  },
};

export const FUSIVEIS = [
  { ref: 'F1', a: '10 A', x: 244, y: 130, cor: '#c92a2a', protege: 'o ramal de potência' },
  { ref: 'F2', a: '2 A',  x: 244, y: 160, cor: '#f08c00', protege: 'o ramal dos 5 V' },
  { ref: 'F3', a: '2 A',  x: 244, y: 190, cor: '#fab005', protege: 'o ramal dos 12 V' },
];

/* ── os postes ───────────────────────────────────────────────────── */
export const POSTES = [
  { ref: 'P1', x: 360, base: Y_POSTE_BASE, nome: 'Poste 1 — derivação dos 24 V',
    desce: '24 V de potência',
    faz: 'Não tem transformador. Os 24 V descem do jeito que chegaram, porque a carga '
       + 'já usa 24 V — não há nada para converter.',
    analogia: 'É o consumidor industrial, que recebe na tensão da rua e monta a própria '
            + 'subestação. Não passa pelo transformador de poste.' },
  { ref: 'P2', x: 520, base: Y_POSTE_BASE, nome: 'Poste 2 — transformador T2',
    equipa: { ref: 'T2', de: '24 V', para: '5,10 V', modelo: 'LM2596 com display' },
    desce: '5,10 V',
    faz: 'Descem DOIS fios até o transformador: os 24 V e o 0 V. Mas sai só UM — o '
       + 'positivo de 5,10 V.',
    porqueUmSo: '⭐ Sai só o positivo porque o 0 V da fonte já é o retorno de todas as '
              + 'tensões. O conversor não isola nada: o negativo entra e sai como o '
              + 'mesmo condutor. Então não faz sentido puxar um segundo fio de volta.',
    analogia: 'É o transformador de poste que abaixa a tensão da rua para a tensão da casa.' },
  { ref: 'P3', x: 680, base: Y_POSTE_BASE, nome: 'Poste 3 — transformador T3 e derivação',
    equipa: { ref: 'T3', de: '24 V', para: '12,0 V', modelo: 'LM2596 com display' },
    desce: '12,0 V  +  24 V de serviços',
    faz: 'Este poste faz DUAS coisas ao mesmo tempo. Parte dos 24 V entra no '
       + 'transformador e vira 12 V; a outra parte segue com os 24 V intactos e desce '
       + 'do lado, virando o segundo fio de 24 V do painel.',
    porqueUmSo: 'Também aqui o 0 V só entra — não sai. Mesmo motivo do P2.',
    analogia: 'Um poste pode atender dois clientes diferentes: um que precisa da tensão '
            + 'baixa e outro que quer a tensão cheia.' },
  { ref: 'P4', x: 800, base: Y_POSTE_BASE, nome: 'Poste 4 — padrão de entrada', vazado: true,
    desce: '0 V (o retorno)',
    faz: 'Poste com o miolo vazado: os condutores passam por dentro dele. É por aqui '
       + 'que o 0 V, que atravessou a rede inteira sem parar em nenhum transformador, '
       + 'finalmente desce e entra no painel.',
    analogia: '🏭 É o **padrão de entrada** — o poste com o eletroduto onde a '
            + 'concessionária entrega a energia na porta da empresa. Todo prédio '
            + 'industrial tem um.' },
];

export const ENTRADAS_PAINEL = [
  { ref: 'PG9',  x: 855,  nome: '24 V potência' },
  { ref: 'PG7a', x: 900,  nome: '5 V' },
  { ref: 'PG7b', x: 950,  nome: '12 V + 24 V serviços' },
  { ref: 'PG-0', x: 1015, nome: 'retorno 0 V' },
];

/* ── OS FIOS ─────────────────────────────────────────────────────── */
export const FIOS = [
  {
    id: 'AC', nome: '127 V da tomada', cor: '#8a1a1a', tracejado: true,
    bitola: '2 × 1,5 mm² + terra',
    resumo: 'A energia que vem da parede. É o único trecho perigoso da maquete.',
    caminho: [[8, 170], [62, 170]],
    passos: [
      { onde: 'Tomada da bancada', diz: 'Entra com 127 V alternados.' },
      { onde: 'Chave geral Q0', diz: 'Desliga tudo de uma vez. Primeira coisa que você '
            + 'liga ao chegar, última que desliga ao sair.' },
      { onde: 'Fonte 24 V', diz: 'Transforma os 127 V alternados em 24 V contínuos. '
            + 'Daqui para a frente, nada mais tem 127 V.' },
    ],
    atencao: 'É o ÚNICO ponto com tensão de rede. Todo o resto trabalha em 24 V ou '
           + 'menos, que é seguro ao toque.',
  },
  {
    id: 'R1', nome: 'Ramal 1 — 24 V de potência', cor: '#c92a2a',
    bitola: '1,00 mm²', corrente: '6,0 A',
    resumo: 'O fio mais grosso da maquete. Sobe no P1, desce no P1 e vai por baixo.',
    caminho: [[227, 130], [244, 130], [300, 130], [340, NIVEIS.R1], [360, NIVEIS.R1],
              [360, Y_POSTE_BASE], [360, Y_SUBT], [855, Y_SUBT], [855, Y_BASE]],
    passos: [
      { onde: 'Fonte · saída V+ 1', diz: 'Começa na primeira saída positiva.' },
      { onde: 'Fusível F1 · 10 A', diz: 'O maior fusível do projeto, porque este ramal '
            + 'leva mais corrente: 6 ampères para as pastilhas e o aquecedor.' },
      { onde: 'Sobe no poste P1', diz: 'Vai pelo alto, como fio de rua de verdade.' },
      { onde: 'Desce no próprio P1', diz: 'Não segue para os outros postes. Aqui não há '
            + 'transformador — os 24 V descem como chegaram.' },
      { onde: 'Passa por baixo do tabuleiro', diz: 'Da base do poste até o painel, o fio '
            + 'corre escondido embaixo.' },
      { onde: 'Entra no painel · PG9', diz: 'Vai direto ao relé KA2, que liga e desliga '
            + 'a potência.' },
    ],
    atencao: 'É o único fio de 1,00 mm² da parte aérea. Os outros são mais finos porque '
           + 'levam bem menos corrente.',
  },
  {
    id: 'R2', nome: 'Ramal 2 — vira 5 V no poste 2', cor: '#f08c00',
    bitola: '0,50 mm²', corrente: '< 1 A',
    resumo: 'Sai com 24 V e chega ao painel com 5 V. Quem muda é o transformador T2.',
    caminho: [[227, 160], [244, 160], [300, 155], [340, NIVEIS.R2], [360, NIVEIS.R2],
              [520, NIVEIS.R2], [520, 176], [520, 196], [520, Y_POSTE_BASE],
              [520, Y_SUBT], [900, Y_SUBT], [900, Y_BASE]],
    passos: [
      { onde: 'Fonte · saída V+ 2', diz: 'Sai da fonte com 24 V, igual ao R1.' },
      { onde: 'Fusível F2 · 2 A', diz: 'Fusível menor, porque leva pouca corrente. Se '
            + 'der defeito aqui, queima este e não o de 10 A — assim você sabe onde '
            + 'procurar.' },
      { onde: 'Passa pelo poste P1', diz: 'Só passa por cima, não para.' },
      { onde: '⭐ Poste P2 · entra no T2', diz: 'Descem DOIS fios até o transformador: '
            + 'os 24 V e o 0 V. É preciso os dois para o conversor funcionar.' },
      { onde: 'Sai do T2 — só o positivo', diz: '⭐ Sai UM fio só, com 5,10 V. O 0 V não '
            + 'precisa voltar: ele é o mesmo condutor dos dois lados do conversor.' },
      { onde: 'Desce por dentro do poste e vai por baixo', diz: 'Chega ao painel pelo '
            + 'prensa-cabo PG7a e alimenta o Arduino, a tela e a eletrônica.' },
    ],
    atencao: 'A tensão só muda NO POSTE. Antes dele o fio tem 24 V, depois tem 5 V — é o '
           + 'mesmo fio com dois nomes.',
  },
  {
    id: 'R3', nome: 'Ramal 3 — vira 12 V no poste 3', cor: '#fab005',
    bitola: '0,75 mm²', corrente: '< 1 A',
    resumo: 'Igual ao R2, mas entrega 12 V. E este poste ainda faz uma segunda coisa.',
    caminho: [[227, 190], [244, 190], [300, 178], [340, NIVEIS.R3], [360, NIVEIS.R3],
              [520, NIVEIS.R3], [680, NIVEIS.R3], [680, 176], [680, 196],
              [680, Y_POSTE_BASE], [680, Y_SUBT], [950, Y_SUBT], [950, Y_BASE]],
    passos: [
      { onde: 'Fonte · saída V+ 3', diz: 'A terceira e última saída positiva.' },
      { onde: 'Fusível F3 · 2 A', diz: 'Também de 2 A, como o F2.' },
      { onde: 'Passa por P1 e P2', diz: 'Atravessa os dois primeiros postes sem parar.' },
      { onde: '⭐ Poste P3 · entra no T3', diz: 'Descem os 24 V e o 0 V até o '
            + 'transformador, e saem 12 V.' },
      { onde: 'Desce e vai por baixo', diz: 'Chega ao painel pelo PG7b e alimenta os '
            + 'coolers do painel e os das pastilhas.' },
    ],
  },
  {
    id: 'SRV', nome: '24 V de serviços — a derivação do P3', cor: '#e8590c',
    bitola: '0,50 mm²', corrente: '< 0,5 A',
    resumo: 'O segundo fio de 24 V. Sai do mesmo poste do 12 V, mas SEM passar pelo '
          + 'transformador.',
    caminho: [[680, NIVEIS.R3], [706, NIVEIS.R3], [706, Y_POSTE_BASE], [706, Y_SUBT],
              [975, Y_SUBT], [975, Y_BASE]],
    passos: [
      { onde: '⭐ Poste P3 · antes do transformador', diz: 'O fio de 24 V que chega no P3 '
            + 'se divide em dois. Um entra no T3 e vira 12 V; o outro segue com os 24 V '
            + 'intactos e desce ao lado.' },
      { onde: 'Desce e vai por baixo', diz: 'Entra no painel pelo mesmo prensa-cabo do '
            + '12 V, o PG7b.' },
      { onde: 'Alimenta o que não pode desligar', diz: 'O ESP32, a lâmpada de FALHA e as '
            + 'posições de ensaio. Este barramento NÃO cai quando alguém aperta a '
            + 'emergência — é o que mantém o sistema avisando o que aconteceu.' },
    ],
    atencao: '⚠️ São DOIS fios de 24 V entrando no painel, e não são a mesma coisa. O do '
           + 'R1 cai na emergência; este não cai. Use anilhas de cores diferentes — '
           + 'trocar os dois faz a emergência deixar de funcionar.',
  },
  {
    id: 'GND', nome: '0 V — o retorno de tudo', cor: '#212529',
    bitola: '1,50 mm²', corrente: '6,9 A (a soma de tudo)',
    resumo: 'Viaja um pouco abaixo dos positivos, entra nos dois transformadores e é o '
          + 'único que segue direto até o fim.',
    caminho: [[227, 225], [250, 225], [300, 205], [340, NIVEIS.GND], [360, NIVEIS.GND],
              [520, NIVEIS.GND], [680, NIVEIS.GND], [800, NIVEIS.GND],
              [800, Y_POSTE_BASE], [800, Y_SUBT], [1015, Y_SUBT], [1015, Y_BASE]],
    derivacoes: [
      [[520, NIVEIS.GND], [532, NIVEIS.GND], [532, 182]],
      [[680, NIVEIS.GND], [692, NIVEIS.GND], [692, 182]],
    ],
    passos: [
      { onde: 'Fonte · saída V− 1', diz: 'Sai por uma das três saídas negativas. As '
            + 'outras duas ficam de reserva — uma só dá conta.' },
      { onde: 'Sobe no P1, um pouco abaixo dos outros', diz: 'Viaja pelo alto junto com '
            + 'os positivos, na posição mais baixa da cruzeta.' },
      { onde: 'Entra nos DOIS transformadores', diz: 'Uma derivação desce no T2 e outra '
            + 'no T3. Sem o 0 V, os conversores não teriam por onde fechar o circuito.' },
      { onde: '⭐ E segue direto, sem parar', diz: 'É o único condutor que atravessa a '
            + 'rede inteira sem terminar em lugar nenhum. Ele serve a todos.' },
      { onde: 'Desce pelo poste 4, o padrão de entrada', diz: 'Um poste separado, com o '
            + 'miolo vazado, só para ele. Daí vai ao bloco BD-0V do painel.' },
    ],
    atencao: '⭐ Existe UM ÚNICO 0 V no projeto inteiro. Não são três, um por tensão. Os '
           + 'conversores não isolam o negativo: ele atravessa por dentro deles. É por '
           + 'isso que dos transformadores sai só o positivo — e é isso que deixa a '
           + 'fiação da maquete tão simples.',
  },
];

export const SAIDAS_CAMARA = [
  { nome: 'Pastilhas Peltier', cor: '#1971c2', y: 150 },
  { nome: 'Aquecedor PTC', cor: '#c92a2a', y: 195 },
  { nome: 'Sensores e ventoinhas', cor: '#0ca678', y: 240 },
];

export const LEGENDA = [
  { cor: '#8a1a1a', txt: '127 V da rede — o único trecho perigoso' },
  { cor: '#c92a2a', txt: '24 V de potência — cai na emergência' },
  { cor: '#e8590c', txt: '24 V de serviços — NÃO cai na emergência' },
  { cor: '#fab005', txt: '12 V — ventoinhas' },
  { cor: '#f08c00', txt: '5 V — eletrônica' },
  { cor: '#212529', txt: '0 V — o retorno, um pouco abaixo dos outros' },
];
