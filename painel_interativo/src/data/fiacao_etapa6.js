/**
 * ETAPA 6 — AS SAÍDAS PARA A CÂMARA
 * =================================
 * Tudo o que deixa o painel e vai para o conjunto câmara + tampa.
 *
 * ⭐ SÃO DOIS DESTINOS DIFERENTES, e confundi-los é fácil:
 *
 *   DENTRO da câmara (atravessa a parede pelos PC-1 e PC-2):
 *     Peltier, PTC, ventoinhas internas, as 2 posições, o AM2315C
 *
 *   NA TAMPA, lado quente, do lado de FORA (não atravessa parede):
 *     as 2 ventoinhas do radiador, o DS18B20 do radiador e os 2 sinais
 *     de RPM — eles ficam no ar ambiente, junto dos dissipadores
 */

const kabo = (n, de, para, mm2, func, classe, diz, extra = {}) => ({
  n, etapa: 6, mm2, func, classe, de, para, diz, ...extra,
});

/* destino fora do painel: `camara` = peça de dentro · `tampa` = lado quente */
const naCamara = (peca, borne) => ({ camara: peca, borne });
const naTampa = (peca, borne) => ({ tampa: peca, borne });

export const FIOS_ETAPA6 = [
  /* ── POTÊNCIA: as duas cargas térmicas ────────────────────────────── */
  { ...kabo('X1', { comp: 'BTS1', via: 'M+' }, naCamara('PELT', '+'), 1.5,
      'pot24', 'potencia',
      'Positivo do par de Peltier, saindo da ponte H do BTS #1.'),
    nome: 'Peltier +', prensa: 'PG13-2', rota: ['CH-2x1', 'CV-esq', 'CH-base'],
    porque: '⭐ Sai de M+ e não do B+. O B+ é a alimentação do módulo; o M+ é a SAÍDA '
          + 'da ponte, que é o que o PWM comanda.' },
  { ...kabo('X2', { comp: 'BTS1', via: 'M−' }, naCamara('PELT', '−'), 1.5,
      'pot24', 'potencia', 'Retorno do par de Peltier, pela outra metade da ponte.'),
    nome: 'Peltier −', prensa: 'PG13-2', rota: ['CH-2x1', 'CV-esq', 'CH-base'],
    aviso: '🔥 O RETORNO DA PELTIER NÃO VAI AO BD-0V. Ele volta ao M− do BTS, porque a '
         + 'ponte H precisa dos dois lados para poder inverter. Ligar o M− no 0 V '
         + 'curto-circuita metade da ponte.' },
  { ...kabo('X3', { comp: 'BTS2', via: 'M+' }, naCamara('PTC', '+'), 1.5,
      'pot24', 'potencia', 'Positivo do PTC.'),
    nome: 'PTC +', prensa: 'PG13-2', rota: ['CH-2x1', 'CV-esq', 'CH-base'] },
  { ...kabo('X4', { comp: 'BTS2', via: 'M−' }, naCamara('PTC', '−'), 1.5,
      'pot24', 'potencia', 'Retorno do PTC, também pela ponte.'),
    nome: 'PTC −', prensa: 'PG13-2', rota: ['CH-2x1', 'CV-esq', 'CH-base'] },

  /* ── VENTILAÇÃO ───────────────────────────────────────────────────── */
  /* ⭐ AS VENTOINHAS DO RADIADOR NÃO PASSAM PELO MV-1. Elas iam para o
     canal 1, e o canal 1 chaveia o NEGATIVO. Com o negativo chaveado, o
     preto da ventoinha não é 0 V: é o dreno do MOSFET. E o tacômetro
     dela — o terceiro fio, o RPM — tem o emissor referenciado nesse
     mesmo preto.

     🔥 COM O CANAL DESLIGADO O PRETO SOBE PARA PERTO DE 12 V, levando
     junto a eletrônica da ventoinha. O fio de RPM sai dali e entra no
     D3 do Mega, que está em INPUT_PULLUP para 5 V. Os 12 V empurram
     corrente para dentro do pino, pelo diodo de proteção. E mesmo antes
     de queimar nada, a leitura já não presta: com o canal desligado o
     firmware leria "ventoinha parada" sempre — que é justamente o
     alarme que deveria salvar a pastilha.

     ⭐ POR ISSO ELAS FICAM PERMANENTEMENTE LIGADAS, direto no BD-AUX.
     Não é só conserto de erro, é o comportamento certo: o lado quente
     precisa continuar sendo resfriado DEPOIS que tudo desliga, porque o
     calor que já está no dissipador não some junto com o comando. O
     BD-AUX vem direto do prensa-cabo e não passa pelo KA2 — então elas
     sobrevivem até à emergência.

     📌 Se um dia quiser controlar a rotação delas, o caminho é ventoinha
     de 4 fios (PWM): ali o preto é 0 V de verdade, o tacômetro tem
     referência fixa e o controle vai por um fio só de comando. */
  { ...kabo('X5', { comp: 'KA34', via: 'NC4' }, naTampa('RAD', '+'), 0.5,
      'aux12', 'alim', 'As 2 ventoinhas do radiador, em paralelo, direto no 12 V.'),
    nome: '⭐ ventoinhas do radiador · +12 V COMANDADO pelo KA4', prensa: 'PG13-2',
    rota: ['CH-2x1', 'CV-esq', 'CH-base'],
    porque: '⭐ Elas NÃO atravessam a parede: ficam na tampa, do lado de fora, soprando '
          + 'nos dissipadores. É o calor que a Peltier tirou de dentro. 🔧 O fio agora '
          + 'nasce no contato do KA4, e não mais direto no BD-AUX: é assim que o firmware '
          + 'consegue desligá-las quando o dissipador esfria.' },
  { ...kabo('X6', naTampa('RAD', '−'), { comp: 'BD-0V', via: 'Z20' }, 0.5,
      'zero', 'comum', 'Retorno das ventoinhas do radiador, no 0 V de verdade.'),
    nome: 'ventoinhas do radiador · 0 V', prensa: 'PG13-2', rota: ['CH-base'],
    aviso: '🔥 ESTE FIO É A REFERÊNCIA DOS DOIS TACÔMETROS. Ligado num negativo '
         + 'chaveado, os sinais de RPM viram lixo e podem danificar o Mega. Ele vai '
         + 'na barra de 0 V, e em ponto próprio — não encadeado.' },
  { ...kabo('X9', { comp: 'MV-1', via: 'O3+' }, naCamara('VF', '+'), 0.5,
      'aux12', 'alim', '⭐ As 5 internas: 2 frias, 2 dos dutos e a do PTC.'),
    nome: 'ventoinhas internas +', prensa: 'PG13-2', rota: ['CH-2x1', 'CV-esq', 'CH-base'],
    porque: '⭐ CINCO VENTOINHAS EM DOIS FIOS. Ligam em paralelo dentro da câmara, '
          + 'porque formam um circuito de ar só — ligar uma sem as outras não faria '
          + 'sentido. Só 2 condutores atravessam a parede.',
    aviso: '🔧 A DO PTC ENTROU NESTE PAR. Ela tinha canal e par próprios (MV-1 O2, fios '
         + 'X7/X8) para poder continuar girando depois do aquecedor. Não precisa: o PTC '
         + 'é auto-limitado. Sumiram 2 condutores do PG13-2, 1 canal do MV-1 e o pino '
         + 'D28 do Mega. Emende o + dela junto com os outros quatro, dentro da câmara.' },
  { ...kabo('X10', { comp: 'MV-1', via: 'O3−' }, naCamara('VF', '−'), 0.5,
      'aux12', 'alim', 'Retorno das 5 internas.'),
    nome: 'ventoinhas internas −', prensa: 'PG13-2', rota: ['CH-2x1', 'CV-esq', 'CH-base'] },

  /* ── AS DUAS POSIÇÕES DE ENSAIO ───────────────────────────────────── */
  { ...kabo('X11', { comp: 'F-P', via: 'F-P1' }, naCamara('DUT1', '+24 V'), 0.5,
      'srv24', 'alim', 'Positivo da posição 1, já depois do fusível e da chave.'),
    nome: 'posição 1 +', prensa: 'PG13-2', rota: ['CH-2x1', 'CV-esq', 'CH-base'] },
  { ...kabo('X13', naCamara('DUT1', 'retorno'), { comp: 'BD-0V', via: 'Z22' }, 0.5,
      'zero', 'comum', 'A volta da posição 1 — agora vai direto ao 0 V.'),
    nome: 'posição 1 · retorno', prensa: 'PG9-3', rota: ['CV-dir', 'CH-base'],
    porque: '⭐ ANTES ELE ERA A MEDIÇÃO: passava pelo shunt da PI-2, onde os 17,6 mA '
          + 'viravam 0,83 V para o multiplexador ler. Com a detecção digital ninguém '
          + 'precisa medir essa corrente — quem responde "tem corrente?" é o sensor, no '
          + 'painel. O retorno virou um 0 V comum, com parafuso próprio na barra.' },

  /* ── O SENSOR DA CÂMARA ───────────────────────────────────────────── */
  { ...kabo('X15', { comp: 'BD-5V', via: 'O10' }, naCamara('SENS', 'VCC'), 0.25,
      'log5', 'alim', 'Alimentação do AM2315C.'),
    nome: 'AM2315C · VCC', prensa: 'PG9-3', rota: ['CH-base', 'CV-dir'] },
  { ...kabo('X16', naCamara('SENS', 'GND'), { comp: 'BD-0V', via: 'Z15' }, 0.25,
      'zero', 'comum', 'Retorno do sensor.'),
    nome: 'AM2315C · GND', prensa: 'PG9-3', rota: ['CV-dir', 'CH-base'] },
  { ...kabo('X17', { comp: 'RTC', via: 'SDA' }, naCamara('SENS', 'SDA'), 0.25,
      'digital', 'sinal', 'O I²C continua da PI-2 até o sensor, dentro da câmara.'),
    nome: 'I²C SDA → câmara', prensa: 'PG9-3', rota: ['CH-3x2', 'CV-dir'],
    porque: '⭐ Terceira parada do MESMO barramento: Mega → RTC → PI-2 → AM2315C. Três '
          + 'endereços, um par de fios.' },
  { ...kabo('X18', { comp: 'RTC', via: 'SCL' }, naCamara('SENS', 'SCL'), 0.25,
      'digital', 'sinal', 'Idem para o clock.'),
    nome: 'I²C SCL → câmara', prensa: 'PG9-3', rota: ['CH-3x2', 'CV-dir'] },

  /* ── O LADO QUENTE, NA TAMPA ──────────────────────────────────────── */
  { ...kabo('X19', naTampa('DS18', 'DATA'), { comp: 'PI1', via: 'J1-3' }, 0.25,
      'digital', 'sinal', 'O DS18B20 colado no dissipador, vigiando o lado quente.'),
    nome: 'DS18B20 do radiador', prensa: 'PG9-3', rota: ['CV-dir', 'CH-topo'],
    porque: '🔥 É O SENSOR QUE SALVA A PELTIER. Se o lado quente saturar, o calor volta '
          + 'atravessando a pastilha e ela se destrói em menos de um minuto. Este fio é '
          + 'o que permite o firmware perceber antes.' },
  { ...kabo('X20', naTampa('RAD', 'RPM1'), { comp: 'MEGA', via: 'D3' }, 0.25,
      'digital', 'sinal', 'Pulsos de rotação da ventoinha do radiador #1.'),
    nome: 'RPM do radiador #1', prensa: 'PG9-3', rota: ['CV-dir', 'CH-topo'] },
  { ...kabo('X21', naTampa('RAD', 'RPM2'), { comp: 'MEGA', via: 'A8' }, 0.25,
      'digital', 'sinal', 'Pulsos da #2 — cada uma é vigiada separadamente.'),
    nome: 'RPM do radiador #2', prensa: 'PG9-3', rota: ['CV-dir', 'CH-3x2'],
    porque: '⭐ Dois sinais e não um. Uma ventoinha travada com a outra girando ainda '
          + 'mata a pastilha do lado dela — a média das duas esconderia isso.' },

  /* ── ⭐ OS DOIS FIOS QUE FALTAVAM NO DS18B20 ───────────────────────
     O sensor é de TRÊS fios. O modelo declarava só o DATA, e assim o
     desenho mostrava um sensor de um fio só — que não existe. */
  { ...kabo('X22', { comp: 'BD-5V', via: 'O11' }, naTampa('DS18', 'VCC'), 0.25,
      'log5', 'alim', 'Alimentação do DS18B20 do radiador.'),
    nome: 'DS18B20 · VCC', prensa: 'PG9-3', rota: ['CH-base', 'CV-dir'],
    porque: '⭐ 5 V, e não 3,3: o pull-up de 4,7 kΩ do 1-Wire está na PI-1 puxando '
          + 'para +5 V. Sensor alimentado em 3,3 com a linha puxada para 5 leria, mas '
          + 'com o pino de dados acima da própria alimentação — que é o jeito de '
          + 'estragar um sensor devagar.' },
  { ...kabo('X23', naTampa('DS18', 'GND'), { comp: 'BD-0V', via: 'Z19' }, 0.25,
      'zero', 'comum', 'Retorno do DS18B20.'),
    nome: 'DS18B20 · GND', prensa: 'PG9-3', rota: ['CV-dir', 'CH-base'],
    aviso: '⚠️ SEM ESTE FIO NÃO EXISTE 1-WIRE. O protocolo mede o tempo em que a linha '
         + 'fica baixa, e "baixa" é em relação a este 0 V. Sem ele o sensor não '
         + 'responde — ou pior, responde errado de vez em quando.' },
];
