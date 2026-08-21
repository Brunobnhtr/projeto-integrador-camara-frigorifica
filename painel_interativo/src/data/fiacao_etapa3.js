/**
 * ETAPA 3 — DISTRIBUIÇÃO
 * ======================
 * Dos quatro barramentos até quem consome, dentro do painel. A porta
 * fica para a etapa 5; aqui é tudo o que mora na placa de montagem.
 *
 * ⭐ A DIVISÃO QUE ORGANIZA ESTA ETAPA:
 *
 *   BD-POT  (comutado)   → morre na emergência: os dois BTS e o 24 V
 *                          de potência que a PI-1 vigia
 *   BD-24V  (permanente) → continua vivo: DNLCB30, sinaleiros, as
 *                          posições de ensaio, o COM do ULN
 *   BD-5V                → toda a eletrônica
 *   BD-AUX  (12 V)       → só as ventoinhas, pelos contatos do KA2 e do KA3
 *   BD-0V                → o retorno de tudo, um ponto por fio
 */

const pot = (n, de, para, mm2, diz, extra = {}) => ({
  n, etapa: 3, classe: 'potencia', func: 'pot24', mm2, de, para, diz, ...extra,
});
/* ⭐ 5 V de lógica NÃO é potência. Quem polui, segundo a própria regra do
   projeto, é a saída dos BTS, a entrada de 24 V deles e as bobinas dos
   relés. Um trilho de 5 V contínuo não chaveia nada — ele corre na
   canaleta de sinal, junto de quem ele alimenta. */
const cinco = (n, de, para, diz, extra = {}) => ({
  n, etapa: 3, classe: 'alim', func: 'log5', mm2: 0.5, de, para, diz, ...extra,
});
const zero = (n, de, para, diz, extra = {}) => ({
  n, etapa: 3, classe: 'comum', func: 'zero', mm2: 0.5, de, para, diz, ...extra,
});

export const FIOS_ETAPA3 = [
  /* ── BD-POT: o que cai na emergência ──────────────────────────────── */
  { ...pot('D1', { comp: 'BD-POT', via: 'O1' }, { comp: 'BTS1', via: 'B+' }, 1.5,
      'Alimentação de potência do BTS das Peltier.'),
    rota: ['CH-base', 'CV-esq', 'CH-2x1'],
    aviso: '⚠️ 1,5 mm². Este par conduz 6 A — é o fio de maior corrente do painel, '
         + 'junto com o B−.' },
  { ...pot('D2', { comp: 'BD-POT', via: 'O2' }, { comp: 'BTS2', via: 'B+' }, 1.5,
      'Idem para o BTS do PTC.'),
    rota: ['CH-base', 'CV-esq', 'CH-2x1'] },
  { ...pot('D3', { comp: 'BD-POT', via: 'O3' }, { comp: 'SV-1', via: 'VCC' }, 0.5,
      'Amostra dos 24 V comutados, para a PI-1 vigiar.'),
    classe: 'alim', rota: ['CH-base', 'CV-esq', 'CH-topo'],
    porque: '⭐ Não alimenta nada: entra no divisor 22 k / 4,7 k e vira 4,22 V no D25. '
          + 'É assim que o Arduino SABE se a potência caiu, sem tocar no relé.' },

  /* ── BD-24V: o que sobrevive ──────────────────────────────────────── */
  { ...pot('D4', { comp: 'BD-24V', via: 'O1' }, { comp: 'ESP32', via: '+' }, 0.5,
      'Alimenta o DNLCB30 e o ESP32 que vai encaixado nele.'),
    func: 'srv24', rota: ['CH-base', 'CV-esq', 'CH-2x1'],
    porque: '⭐ Permanente de propósito: se o MQTT caísse junto com a emergência, '
          + 'ninguém saberia remotamente que houve uma.' },
  { ...pot('D5', { comp: 'BD-24V', via: 'O4' }, { comp: 'F-P', via: 'V+' }, 0.5,
      'Entrada comum do porta-fusível das duas posições de ensaio.'),
    classe: 'alim', func: 'srv24', rota: ['CH-base', 'CV-esq', 'CH-3x2'],
    porque: 'As posições continuam energizadas na emergência — é o que permite '
          + 'registrar o que aconteceu.' },
  { ...cinco('D7', { comp: 'BD-5V', via: 'O1' }, { comp: 'MEGA', via: '+5V' },
      'Alimenta o Arduino pelo pino 5V — não pelo USB.'),
    rota: ['CH-base', 'CV-esq', 'CH-topo'],
    aviso: '⚠️ Entrando pelo pino 5V, o regulador do Arduino fica FORA do caminho. '
         + 'Nunca alimente pelo 5V e pelo USB ao mesmo tempo.' },
  { ...cinco('D8', { comp: 'BD-5V', via: 'O3' }, { comp: 'RTC', via: 'VCC' },
      'O relógio, que guarda a hora dos ensaios.'), rota: ['CH-base', 'CV-esq', 'CH-3x2'] },
  { ...cinco('D9', { comp: 'BD-5V', via: 'O4' }, { comp: 'BTS1', via: 'VCC' },
      'Lado lógico do BTS #1 — não confundir com o B+.'),
    rota: ['CH-base', 'CV-esq', 'CH-2x1'],
    aviso: '🔥 VCC é a LÓGICA (5 V, miliampères). B+ é a POTÊNCIA (24 V, 6 A). '
         + 'Ligar 24 V no VCC destrói o módulo na hora.' },
  { ...cinco('D10', { comp: 'BD-5V', via: 'O5' }, { comp: 'BTS2', via: 'VCC' },
      'Idem para o BTS #2.'), rota: ['CH-base', 'CV-esq', 'CH-2x1'] },
  { ...cinco('D11', { comp: 'BD-5V', via: 'O6' }, { comp: 'AD-1', via: '+' },
      'O 5 V que alimenta o pull-up do 1-Wire dentro da PI-1.'),
    rota: ['CH-base', 'CV-esq', 'CH-3x2'] },
  { ...cinco('D12', { comp: 'BD-5V', via: 'O8' }, { comp: 'SC-1', via: 'VCC' },
      'Alimenta o sensor de corrente da posição de ensaio.'),
    rota: ['CH-base', 'CV-esq', 'CH-3x2'] },
  /* 🗑️ O D13 SAIU. Ele levava 5 V do BD-5V · O9 até o VCC do módulo MOSFET (MV-1),
     que deixou de existir: as 5 ventoinhas internas passaram para o KA3, um terceiro
     módulo de relé na mesma caixa DIN do KA1 e do KA2 — e a caixa já recebe 5 V por
     UM par de fios só (o D26, para o O12), com o DC+ pontelhado lá dentro.
     ⭐ A saída O9 do BD-5V ficou LIVRE. Ver Doc 31 §31.16. */

  /* ── BD-AUX: as ventoinhas ────────────────────────────────────────── */
  { n: 'D14', etapa: 3, classe: 'alim', func: 'aux12', mm2: 0.75,
    de: { comp: 'BD-AUX', via: 'O1' },
    para: { comp: 'KA123', via: 'COM3' }, rota: ['CH-base', 'CV-esq', 'CH-2x1'],
    diz: 'Os 12 V permanentes que o contato do KA3 entrega às 5 ventoinhas internas.',
    porque: '🔧 IA AO VIN DO MV-1, que alimentava os 4 canais do módulo MOSFET. Agora vai '
          + 'ao COM do KA3 — mesmo barramento, mesma bitola, mesma rota. O que mudou é o '
          + 'que está do outro lado: um CONTATO SECO no lugar de um dreno.' },

  /* ── BD-0V: um ponto por fio ──────────────────────────────────────── */
  { ...zero('D15', { comp: 'BTS1', via: 'B−' }, { comp: 'BD-0V', via: 'Z1' },
      'Retorno de potência do BTS #1 — 6 A.'),
    mm2: 1.5, rota: ['CH-2x1', 'CV-esq', 'CH-base'] },
  { ...zero('D16', { comp: 'BTS2', via: 'B−' }, { comp: 'BD-0V', via: 'Z2' },
      'Retorno de potência do BTS #2.'), mm2: 1.5, rota: ['CH-2x1', 'CV-esq', 'CH-base'] },
  { ...zero('D17', { comp: 'BTS1', via: 'GND' }, { comp: 'BD-0V', via: 'Z3' },
      'Retorno da LÓGICA do BTS #1, em fio próprio.'),
    rota: ['CH-2x1', 'CV-esq', 'CH-base'],
    porque: '⭐ Fio separado do B−, e não uma ponte no módulo. Os 6 A do B− criam queda '
          + 'no próprio fio; se a lógica pendurasse nele, essa queda apareceria como '
          + 'ruído na referência do sinal IS.' },
  { ...zero('D18', { comp: 'BTS2', via: 'GND' }, { comp: 'BD-0V', via: 'Z4' },
      'Idem para o BTS #2.'), rota: ['CH-2x1', 'CV-esq', 'CH-base'] },
  { ...zero('D19', { comp: 'MEGA', via: 'GND3' }, { comp: 'BD-0V', via: 'Z5' },
      'O 0 V do Arduino.'), rota: ['CH-3x2', 'CV-dir', 'CH-base'] },
  { ...cinco('D7b', { comp: 'BD-5V', via: 'O12' }, { comp: 'KA123', via: '+5V' },
      '⭐ Alimenta os TRÊS módulos de relé — o DC+ é pontelhado entre eles na caixa.'),
    rota: ['CH-base', 'CV-esq', 'CH-2x1'], nome: '5 V dos módulos KA1/KA2',
    aviso: '⚠️ 65 mA CADA, com o relé fechado. São 130 mA a mais no ramal T2 — some com '
         + 'o Arduino, a tela e o ESP32 antes de fechar o projeto de energia.' },
  { ...zero('D20b', { comp: 'KA123', via: '0V' }, { comp: 'BD-0V-B', via: 'Z21' },
      '⭐ O DC− dos dois módulos, em ponto próprio da barra.'),
    rota: ['CH-2x1', 'CV-dir', 'CH-3x2'],
    porque: '📌 PONTO PRÓPRIO, e não pendurado. O DC− carrega os 130 mA das duas bobinas '
          + 'e é também a referência do sinal de gatilho — a entrada do módulo tem só '
          + 'três bornes, então o DC− É o 0 V do IN. Pendurá-lo num retorno de medição '
          + 'somaria corrente chaveada a uma referência.' },
  { ...pot('D6b', { comp: 'BD-AUX', via: 'O2' }, { comp: 'KA123', via: 'COM2' }, 0.5,
      '⭐ Os 12 V permanentes entrando no contato do KA2.'),
    classe: 'alim', func: 'aux12', rota: ['CH-base', 'CV-esq', 'CH-2x1'],
    nome: '12 V → contato do KA2',
    porque: '⭐ O KA2 fica EM SÉRIE com o lado POSITIVO das ventoinhas do radiador. O '
          + 'negativo delas (X6) vai direto ao BD-0V-B · Z20 e NUNCA é chaveado — é a '
          + 'referência dos dois tacômetros, e mexer nela foi o erro que tirou o comando '
          + 'destas ventoinhas na primeira versão.',
    aviso: '🔥 A SAÍDA É O CONTATO NC2, NÃO O NO2. Ao contrário do KA1, aqui o estado '
         + 'seguro é FECHADO: módulo sem energia, ventoinha girando (§31.14).' },
  { ...zero('D20', { comp: 'BS-1', via: '0V' }, { comp: 'BD-0V', via: 'Z6' },
      'O 0 V dos dois filtros de corrente — a perna de baixo do C1 e do C2.'),
    rota: ['CH-3x2', 'CV-dir', 'CH-base'] },
  { ...zero('D21', { comp: 'ESP32', via: '−' }, { comp: 'BD-0V', via: 'Z7' },
      'Retorno do DNLCB30.'), rota: ['CH-2x1', 'CV-esq', 'CH-base'] },
  { ...zero('D22', { comp: 'RTC', via: 'GND' }, { comp: 'BD-0V', via: 'Z8' },
      'Retorno do relógio.'), rota: ['CH-3x2', 'CV-esq', 'CH-base'] },
  /* 🗑️ O D23 E O D25 SAÍRAM COM O MV-1. Eram os DOIS retornos que um módulo
     optoacoplado exige — o GND das cargas (12 V) e o GND do comando (5 V), obrigados a
     ir para pontos DIFERENTES do BD-0V para não anular o isolamento. Um contato seco
     não tem lado de carga nem lado de comando: o KA3 devolve o 5 V dele pela mesma
     ponte interna do KA1 e do KA2 (fio Z21, no BD-0V-B), e o negativo das ventoinhas
     vai direto da câmara para a barra, pelo X10. ⭐ Dois fios e uma armadilha a menos.
     O ponto Z13 do BD-0V agora recebe o X10; o Z14 ficou livre. */
  { ...zero('D24', { comp: 'SC-1', via: 'GND' }, { comp: 'BD-0V-B', via: 'Z17' },
      'O 0 V do sensor de corrente.'),
    rota: ['CH-3x2'],
    porque: '⭐ Este fio carrega a corrente que está sendo medida. Ele só é 0 V deste '
          + '0 V do sensor — o mesmo retorno comum do painel.' },
  /* ── o que a PI-1 fazia por dentro, e agora é fio ────────────────────
     ⭐ Trocar a placa soldada por módulos com borne tem um preço, e ele é
        este: três ligações que eram trilha de cobre viraram três fios. É
        um preço barato — fio em borne se mede, trilha soldada não. */
  { ...pot('D25b', { comp: 'SV-1', via: 'GND' }, { comp: 'BD-0V-B', via: 'Z25' }, 0.25,
      'A referência do divisor: sem ela o módulo mede contra o nada.'),
    classe: 'comum', func: 'zero', rota: ['CH-topo', 'CV-dir', 'CH-3x2'],
    nome: 'referência do sensor de tensão',
    porque: '⚠️ Este fio parece dispensável e não é. O divisor precisa de um caminho de volta '
          + 'para o 0 V; sem ele a saída flutua e o D25 lê qualquer coisa.' },
  { ...pot('D25c', { comp: 'SV-1', via: '−' }, { comp: 'BD-0V-B', via: 'Z23' }, 0.25,
      'O 0 V do lado da saída, que acompanha o sinal até o Arduino.'),
    classe: 'comum', func: 'zero', rota: ['CH-3x2'],
    nome: '0 V da saída do sensor de tensão' },
  { ...pot('D26b', { comp: 'AD-1', via: '−' }, { comp: 'BD-0V-B', via: 'Z24' }, 0.25,
      'O 0 V do adaptador do DS18B20.'),
    classe: 'comum', func: 'zero', rota: ['CH-3x2'],
    nome: '0 V do adaptador 1-Wire' },
  /* ── a ponte entre os dois blocos de 0 V ─────────────────────────────
     ⭐ ELA É PARTE DO CIRCUITO, não um detalhe de montagem. A barra de 0 V
        passou de 28 pontos e não cabia num bloco só; virou dois, e é esta
        ponte que os mantém sendo o MESMO nó. 4 mm² e o mais curta possível:
        se ela ficar fina ou frouxa, os retornos da eletrônica passam a
        procurar caminho por onde não deviam, e o sintoma é leitura
        analógica errada — não falta de energia. */
  { ...pot('D27b', { comp: 'BD-0V', via: 'Z16' }, { comp: 'BD-0V-B', via: 'PT' }, 4.0,
      'A ponte que faz os dois blocos serem um nó só.'),
    classe: 'comum', func: 'zero', rota: ['CH-base', 'CV-dir', 'CH-topo'],
    nome: '⭐ ponte entre os blocos de 0 V',
    aviso: '⚠️ 4 mm², e é a MAIOR bitola do painel depois da entrada. Não é pela corrente: '
         + 'é para a queda ser desprezível e os dois blocos ficarem no mesmo potencial.' },
];
