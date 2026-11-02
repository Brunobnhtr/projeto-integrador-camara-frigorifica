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
    peca: 'Relé 14 pinos HH64P / LY4NJ · bobina 24 Vcc · ⚠️ 4 contatos 10 A em CC · base PTF14A',
    oQueE: 'O relé mestre da cadeia de comando (HH64P / LY4NJ 14 pinos): chaveia a potência de 24 V da Peltier no Polo 1, os 12 V do PTC no Polo 2, e faz o selo no Polo 3. '
         + '6,0 A em 24 Vcc para os dois BTS7960. É por causa DELE que o modelo de 10 A foi '
         + 'escolhido. Relé de painel, encaixado numa base parafusada no trilho DIN: o relé '
         + 'sai da base puxando, e a base fica. ⭐ Nenhum fio do Arduino chega à cadeia que o '
         + 'comanda — o firmware só alcança o RETORNO da bobina, pelo contato do KA1, e em '
         + 'série. É por isso que a emergência não depende de software.',
    conduz: 'Polo 1 (9→5): 6,0 A em 24 Vcc (Peltier). Polo 2 (10→6): 4,2 A em 12 Vcc (PTC). Polo 3 (11→7): selo (~37 mA). Polo 4 (12→8): reserva.',
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
    tipo: 'modulo8',
    cor: '#e8590c',
    titulo: 'Módulo de 8 Relés 5 V Optoacoplado — KA1..KA3 + H1..H4 (24 V) + Reserva',
    peca: '1 × Módulo de 8 relés 5 V com optoacoplador · contatos reversíveis 10 A · suporte trilho DIN',
    oQueE: 'Placa central de acionamentos e sinalização do painel. Reúne em uma única placa compacta '
         + 'os 3 relés de comando/segurança e os 4 canais de chaveamento dos sinaleiros industriais de 24 Vcc fornecidos pelo SENAI, '
         + 'com acionamento optoacoplado ativo em nível baixo (Active-LOW).',
    conduz: 'KA1: 37 mA (bobina KM1). KA2: 0,36 A (coolers radiador). KA3: 0,63 A (5 coolers câmara). '
          + 'H1 a H4: ~15 a 20 mA cada em 24 Vcc (sinaleiros industriais LED 22 mm). Ch 8: reserva técnica.',
    canais: [
      {
        id: 'KA1 (Ch 1)', papel: 'Veto do firmware sobre KM1', contato: 'NO', gatilho: 'D27 (LOW = atracado)',
        regra: 'Módulo sem energia ou Mega desligado = contato ABERTO = potência cortada. Estado seguro é DESLIGADO.',
      },
      {
        id: 'KA2 (Ch 2)', papel: 'Ventoinhas do radiador', contato: 'NC', gatilho: 'D30 (LOW = desliga pós-vent)',
        regra: '⭐ Módulo sem energia = contato FECHADO = ventoinha GIRANDO. Estado seguro é LIGADO (fail-safe térmico passivo).',
      },
      {
        id: 'KA3 (Ch 3)', papel: 'As 5 ventoinhas internas da câmara', contato: 'NO', gatilho: 'D29 (LOW = ligadas)',
        regra: 'Módulo sem energia = contato ABERTO = ventoinhas PARADAS. Estado seguro é DESLIGADO.',
      },
      {
        id: 'H1 (Ch 4)', papel: 'Sinaleiro industrial 24 V VERDE — Painel Energizado / Operação', contato: 'NO', gatilho: 'D9 (LOW = aceso)',
        regra: 'Comuta +24 V do BD-24V para o borne X1 do sinaleiro verde H1.',
      },
      {
        id: 'H2 (Ch 5)', papel: 'Sinaleiro industrial 24 V AZUL — Resfriando (Peltier Ativa)', contato: 'NO', gatilho: 'D10 (LOW = aceso)',
        regra: 'Comuta +24 V do BD-24V para o borne X1 do sinaleiro azul H2.',
      },
      {
        id: 'H3 (Ch 6)', papel: 'Sinaleiro industrial 24 V AMARELO — Aquecendo (PTC Ativo)', contato: 'NO', gatilho: 'D11 (LOW = aceso)',
        regra: 'Comuta +24 V do BD-24V para o borne X1 do sinaleiro amarelo H3.',
      },
      {
        id: 'H4 (Ch 7)', papel: 'Sinaleiro industrial 24 V VERMELHO — Falha / Alarme', contato: 'NO', gatilho: 'D12 (LOW = aceso)',
        regra: 'Comuta +24 V do BD-24V para o borne X1 do sinaleiro vermelho H4.',
      },
      {
        id: 'RES (Ch 8)', papel: 'Canal Sobressalente', contato: 'NO/NC', gatilho: 'Livre',
        regra: 'Reserva técnica disponível para expansão de comando.',
      },
    ],
    discretos: [
      {
        ref: 'D2', peca: 'Diodo 1N4007', onde: 'junto das ventoinhas do radiador, na emenda do chicote',
        orientacao: 'Catodo (faixa prateada) no +12 V.',
        porque: 'Roda-livre do motor das ventoinhas do radiador.',
        cuidado: 'Não confundir com o D1, que fica nos bornes A1/A2 da bobina do KM1.',
        preco: 'R$ 0,20',
      },
      {
        ref: 'D3', peca: 'Diodo 1N4007', onde: 'junto das 5 ventoinhas internas da câmara',
        orientacao: 'Catodo (faixa prateada) no +12 V, na emenda dos cinco positivos.',
        porque: 'Roda-livre dos 5 micromotores que desligam juntos.',
        cuidado: 'Um único diodo atende as cinco ventoinhas em paralelo.',
        preco: 'R$ 0,20',
      },
    ],
    pontes: [
      { de: 'COM4', para: 'COM5, COM6 e COM7', diz: 'Ponte de distribuição do positivo +24 V (BD-24V) entre os quatro canais de sinalização.' },
      { de: 'H1.X2', para: 'H2.X2, H3.X2 e H4.X2', diz: 'Ponte do negativo comum 0 V na porta, retornando via chicote até o borne BD-0V da fonte.' },
    ],
    ensaios: [
      'Entradas IN1 a IN7: nível lógico LOW aciona o respectivo canal (LED indicador do canal acende na placa)',
      'Sem Arduino conectado: todos os canais desenergizados -> KA1 aberto (KM1 impedido), KA2 fechado (coolers giram), H1..H4 apagados',
      'Forçar D9 a LOW: relé 4 fecha -> sinaleiro Verde H1 acende com 24 V',
      'Forçar D10 a LOW: relé 5 fecha -> sinaleiro Azul H2 acende com 24 V',
      'Forçar D11 a LOW: relé 6 fecha -> sinaleiro Amarelo H3 acende com 24 V',
      'Forçar D12 a LOW: relé 7 fecha -> sinaleiro Vermelho H4 acende com 24 V',
    ],
    naoConfundir: 'Os canais 1 a 3 operam circuitos de comando/12 V, e os canais 4 a 7 operam o circuito de 24 V dos sinaleiros. '
                + 'Os contatos a relé são totalmente isolados e secos, garantindo separação galvânica entre 5 V, 12 V e 24 V.',
  },
};

/** Qual verbete atende cada componente do painel. */
export const POR_COMPONENTE = { KM1: 'KM1', KA123: 'KA123' };
