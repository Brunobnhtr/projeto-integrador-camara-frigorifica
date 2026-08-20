/**
 * OS RELÉS POR DENTRO — o que existe neles além dos bornes
 * ========================================================
 *
 * ⭐ POR QUE ESTE ARQUIVO EXISTE. No painel dá para clicar num relé e ver
 *    os fios que entram e saem — mas o D1, os pull-downs e as pontes na
 *    própria base não são fio nenhum. São componentes soldados ou
 *    parafusados NO BORNE, e até aqui não apareciam em lugar algum.
 *    A PI-1 tem desenho de placa; o relé precisava do
 *    equivalente.
 *
 * ⚠️ OS BORNES NÃO ESTÃO AQUI. Eles vêm do `painel_completo.js`, que é o
 *    que os validadores conferem. Aqui mora só o que aquele modelo não
 *    tem como saber: qual componente discreto pendura em qual borne, por
 *    que ele existe e o que se mede para provar que está certo.
 */

/* A base PTF08A: 8 parafusos em duas fileiras de 4, ordem de fábrica. */
export const BASE_8P = {
  cima: ['22', '24', '21', 'A2'],
  baixo: ['12', '14', '11', 'A1'],
  gravado: { 22: 4, 24: 8, 21: 12, A2: 14, 12: 1, 14: 5, 11: 9, A1: 13 },
  papel: {
    22: 'NF do contato 2', 24: 'NA do contato 2', 21: 'comum do contato 2', A2: 'bobina',
    12: 'NF do contato 1', 14: 'NA do contato 1', 11: 'comum do contato 1', A1: 'bobina',
  },
};

/* O módulo de relé de 1 canal: 3 bornes de entrada + 3 de saída. */
export const MODULO = {
  entrada: ['DC+', 'DC−', 'IN'],
  saida: ['COM', 'NO', 'NC'],
};

export const RELES = {
  KM1: {
    comp: 'KM1',
    tipo: 'rele8',
    cor: '#5f3dc4',
    titulo: 'KM1 — o relé da cadeia',
    peca: 'Relé 8 pinos · bobina 24 Vcc · ⚠️ contato declarado 10 A em CORRENTE CONTÍNUA · base PTF08A',
    oQueE: 'O único relé da cadeia de comando, e o único que chaveia potência de verdade: '
         + '6,0 A em 24 Vcc para os dois BTS7960. É por causa DELE que o modelo de 10 A foi '
         + 'escolhido. Relé de painel, encaixado numa base parafusada no trilho DIN: o relé '
         + 'sai da base puxando, e a base fica. ⭐ Nenhum fio do Arduino chega à cadeia que o '
         + 'comanda — o firmware só alcança o RETORNO da bobina, pelo contato do KA1, e em '
         + 'série. É por isso que a emergência não depende de software.',
    conduz: 'Contato 1 (11→14): 6,0 A em 24 Vcc. Contato 2 (21→24, o selo): ~37 mA.',
    discretos: [
      {
        ref: 'D1', peca: 'Diodo 1N4007', onde: 'direto nos bornes A1 e A2 da base',
        orientacao: 'Catodo (a faixa prateada) no A1. O A1 é o positivo.',
        porque: 'Quando o contato do KA1 abre, o campo da bobina colapsa e induz centenas de '
              + 'volts. Sem o diodo esse pico aparece NO CONTATO DO KA1 e abre arco — e '
              + 'contato que pita acaba soldando, o que faz o veto do firmware sumir em silêncio.',
        cuidado: '⚠️ Invertido, ele curto-circuita a bobina e derruba o F2 (2 A) assim que o '
               + 'verde for apertado. Erro de 10 segundos para achar, e uma hora se você não '
               + 'desconfiar dele.',
        dispensavel: '🔎 Pode ser dispensável: ponha o multímetro em TESTE DE DIODO entre A1 e '
                   + 'A2. Se conduzir num sentido só, o relé já tem diodo interno.',
        preco: 'R$ 0,20 · já existem sobressalentes na lista L.2',
      },
    ],
    pontes: [
      { de: '24', para: 'A1', diz: '⭐ O SELO — a única ponte de memória do painel. O botão verde fecha a bobina uma vez; daí em diante é esta ponte que a segura.' },
    ],
    ensaios: [
      'Teste de diodo entre A1 e A2 → conduz num sentido só (é o D1, ou o diodo interno)',
      'Com o cogumelo destravado e o STOP solto, aperte o VERDE → ele atraca e FICA atracado com o botão solto',
      'Se ele soltar quando você tira o dedo do verde, a ponte 24→A1 não está feita',
      'Aperte o STOP UMA vez e solte → ele cai e NÃO volta. Multímetro no BD-POT: 0 V',
      'Soque o cogumelo → ele cai igual. Destrave → continua caído. Só o verde religa',
    ],
    naoConfundir: 'O contato de 10 A precisa ser declarado EM CORRENTE CONTÍNUA. Muitos '
                + 'anúncios dizem "10 A / 250 VAC" e caem para 5 A ou menos em CC — em CA o '
                + 'arco se apaga na passagem por zero, em CC não há passagem por zero.',
  },

  KA123: {
    comp: 'KA123',
    tipo: 'modulo2',
    cor: '#e8590c',
    titulo: 'KA1 + KA2 + KA3 — as três mãos do firmware',
    peca: '3 × módulo de relé 1 canal · 5 V · optoacoplado · jumper H/L · 51 × 25,5 mm cada, '
        + 'empilhados numa caixa modular DIN de 6 módulos',
    oQueE: 'Os três módulos ficam na MESMA caixa, com o DC+ e o DC− pontelhados entre eles lá '
         + 'dentro — sai um par de fios só para o BD-5V e o BD-0V. São a única coisa no painel '
         + 'que o firmware pode acionar. ⭐ O KA3 é o mais novo: ele entrou no lugar do MV-1, '
         + 'o módulo MOSFET de 4 canais que ligava as 5 ventoinhas internas usando 1 canal.',
    conduz: 'KA1: 37 mA (a bobina do KM1). KA2: 0,36 A (as duas ventoinhas do radiador). '
          + 'KA3: 0,63 A (as cinco internas) — 6 % dos 10 A do contato. '
          + 'Nenhum dos três chega perto do limite — e é por isso que aqui NÃO se '
          + 'justifica o relé caro de 8 pinos.',
    canais: [
      {
        id: 'KA1', papel: 'veto sobre a potência', contato: 'NO', gatilho: 'D27',
        regra: 'Módulo sem energia = contato ABERTO = potência cortada. Estado seguro é DESLIGADO.',
      },
      {
        id: 'KA2', papel: 'ventoinhas do radiador', contato: 'NC', gatilho: 'D30',
        regra: '⭐ Módulo sem energia = contato FECHADO = ventoinha GIRANDO. Estado seguro é LIGADO — '
             + 'o oposto do KA1, e é de propósito.',
      },
      {
        id: 'KA3', papel: 'as 5 ventoinhas internas', contato: 'NO', gatilho: 'D29',
        regra: 'Módulo sem energia = contato ABERTO = ventoinhas PARADAS. Estado seguro é '
             + 'DESLIGADO, como no KA1 — e pelo motivo oposto ao do KA2: ventoinha interna '
             + 'parada não queima nada. Sem Arduino, o KA1 já cortou a potência; e o PTC é '
             + 'auto-limitado, corta a própria potência sem fluxo de ar.',
      },
    ],
    discretos: [
      {
        ref: 'R10', peca: 'Resistor 10 kΩ · ¼ W', onde: 'entre o IN1 e o 0 V, nos bornes do módulo do KA1',
        orientacao: 'Resistor não tem polaridade. Vai no borne, não em placa.',
        porque: 'O anúncio promete tolerância a falha, e o LED do optoacoplador de fato precisa '
              + 'de corrente. O resistor torna isso MEDÍVEL em vez de confiado: fio do D27 '
              + 'rompido ou Arduino ausente → IN em 0 V → relé aberto → potência cortada.',
        cuidado: '⚠️ Sem ele, o IN fica alto-impedante e o módulo pode fechar por ruído — o que '
               + 'significa a potência sendo autorizada sem ninguém mandar.',
        preco: 'R$ 0,10',
      },
      {
        ref: 'R11', peca: 'Resistor 10 kΩ · ¼ W', onde: 'entre o IN2 e o 0 V, nos bornes do módulo do KA2',
        orientacao: 'Idem ao R10.',
        porque: 'Mesma função — mas aqui o resultado é o oposto, e melhor: relé solto significa '
              + 'ventoinha do radiador LIGADA. É o R11 que garante que um Arduino morto ventile.',
        cuidado: '⚠️ Vale o mesmo ensaio: ohmímetro entre IN e 0 V deve dar ~10 kΩ.',
        preco: 'R$ 0,10',
      },
      {
        ref: 'D2', peca: 'Diodo 1N4007', onde: '⚠️ NÃO fica aqui — vai junto das ventoinhas, dentro da câmara',
        orientacao: 'Catodo (faixa prateada) no +12 V.',
        porque: 'Roda-livre do motor. Ventoinha é carga indutiva e nada mais a grampeia — sem '
              + 'ele o pico aparece no contato do KA2 toda vez que a pós-ventilação termina.',
        cuidado: '⚠️ Não confunda com o D1, que é da bobina do KM1. São o mesmo componente com '
               + 'funções diferentes, em lugares diferentes do projeto.',
        preco: 'R$ 0,20',
      },
      {
        ref: 'R12', peca: 'Resistor 10 kΩ · ¼ W', onde: 'entre o IN3 e o 0 V, nos bornes do módulo do KA3',
        orientacao: 'Idem ao R10.',
        porque: 'Mesma função, terceiro módulo: Arduino ausente → IN em 0 V → contato aberto → '
              + 'ventoinhas internas paradas. Aqui parado É o estado seguro.',
        cuidado: '⚠️ Vale o mesmo ensaio: ohmímetro entre IN e 0 V deve dar ~10 kΩ.',
        preco: 'R$ 0,10',
      },
      {
        ref: 'D3', peca: 'Diodo 1N4007', onde: '⚠️ NÃO fica aqui — vai junto das 5 internas, dentro da câmara',
        orientacao: 'Catodo (faixa prateada) no +12 V, na emenda dos cinco positivos.',
        porque: '⭐ ELE APARECEU QUANDO O MOSFET SAIU. O MV-1 trazia a proteção dentro da placa '
              + 'comprada; o contato do KA3 não protege nada sozinho, e são CINCO motores '
              + 'desligando juntos no fim de cada ensaio.',
        cuidado: '⚠️ Um diodo só serve as cinco, porque elas estão em paralelo no mesmo par.',
        preco: 'R$ 0,20',
      },
    ],
    pontes: [
      { de: 'DC+ do KA1', para: 'DC+ do KA2 e do KA3', diz: 'Ponte dentro da caixa — sai um fio só para o BD-5V · O12. 🗑️ Foi ela que dispensou o fio D13, que levava 5 V ao VCC do MV-1.' },
      { de: 'DC− do KA1', para: 'DC− do KA2 e do KA3', diz: 'Idem — um fio só para o BD-0V · Z21. ⚠️ Ponto PRÓPRIO na barra, não pendurado: este 0 V é também a referência dos três gatilhos.' },
    ],
    ensaios: [
      '⭐ Jumper em H nos TRÊS módulos — em L a lógica inverte e o firmware vira armadilha',
      'Fio do KA1 no NO. Fio do KA2 no NC. Fio do KA3 no NO. ⚠️ O do meio é o diferente, de propósito',
      'Ohmímetro entre cada IN e o 0 V → ~10 kΩ (é o R10, o R11 e o R12 trabalhando)',
      'Sem o Arduino ligado: LED do KA1 apagado, e a potência não arma nem apertando o verde',
      '⭐ Sem o Arduino ligado: as ventoinhas do radiador GIRAM. Se estiverem paradas, o fio do KA2 está no NO',
      '⭐ Sem o Arduino ligado: as 5 internas ficam PARADAS. Se girarem, o fio do KA3 está no NC',
      'Confirme 5VDC escrito no corpo dos três relés — o mesmo anúncio vende 12 e 24 V',
    ],
    naoConfundir: 'A isolação aqui é NOMINAL, não galvânica. O módulo tem três bornes de '
                + 'entrada (DC+, DC−, IN), então o DC− É a referência do sinal — ele partilha o '
                + '0 V do Arduino. O optoacoplador entrega imunidade a ruído, não separação de '
                + 'terras. A isolação de verdade está no CONTATO, que é seco.',
  },
};

/** Qual verbete atende cada componente do painel. */
export const POR_COMPONENTE = { KM1: 'KM1', KA123: 'KA123' };
