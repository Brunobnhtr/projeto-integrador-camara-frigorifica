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
  { ...kabo('X5', { comp: 'MV-1', via: 'O1+' }, naTampa('RAD', '+'), 0.5,
      'aux12', 'alim', 'As 2 ventoinhas do radiador, no lado QUENTE.'),
    nome: 'ventoinhas do radiador +', prensa: 'PG13-2', rota: ['CH-2x1', 'CV-esq', 'CH-base'],
    porque: '⭐ Elas NÃO atravessam a parede: ficam na tampa, do lado de fora, soprando '
          + 'nos dissipadores. É o calor que a Peltier tirou de dentro.' },
  { ...kabo('X6', { comp: 'MV-1', via: 'O1−' }, naTampa('RAD', '−'), 0.5,
      'aux12', 'alim', 'Retorno das ventoinhas do radiador.'),
    nome: 'ventoinhas do radiador −', prensa: 'PG13-2', rota: ['CH-2x1', 'CV-esq', 'CH-base'] },
  { ...kabo('X7', { comp: 'MV-1', via: 'O2+' }, naCamara('VP', '+'), 0.5,
      'aux12', 'alim', 'A ventoinha do PTC, dentro da câmara.'),
    nome: 'ventoinha do PTC +', prensa: 'PG13-2', rota: ['CH-2x1', 'CV-esq', 'CH-base'],
    aviso: '⚠️ CANAL SEPARADO DO AQUECEDOR, de propósito. O PTC é comandado pelo BTS #2 '
         + 'e a ventoinha dele pelo MV-1 canal 2 — são dois circuitos independentes. É '
         + 'isso que permite o intertravamento: o firmware não liga o PTC sem ela, e a '
         + 'mantém girando depois que ele desliga.' },
  { ...kabo('X8', { comp: 'MV-1', via: 'O2−' }, naCamara('VP', '−'), 0.5,
      'aux12', 'alim', 'Retorno da ventoinha do PTC.'),
    nome: 'ventoinha do PTC −', prensa: 'PG13-2', rota: ['CH-2x1', 'CV-esq', 'CH-base'] },
  { ...kabo('X9', { comp: 'MV-1', via: 'O3+' }, naCamara('VF', '+'), 0.5,
      'aux12', 'alim', 'As 4 ventoinhas de circulação: 2 frias e 2 dos dutos.'),
    nome: 'circulação +', prensa: 'PG13-2', rota: ['CH-2x1', 'CV-esq', 'CH-base'],
    porque: '⭐ QUATRO VENTOINHAS EM DOIS FIOS. Elas ligam em paralelo dentro da câmara, '
          + 'porque formam um circuito de ar só — ligar uma sem as outras não faria '
          + 'sentido. Só 2 condutores atravessam a parede.' },
  { ...kabo('X10', { comp: 'MV-1', via: 'O3−' }, naCamara('VF', '−'), 0.5,
      'aux12', 'alim', 'Retorno das 4 de circulação.'),
    nome: 'circulação −', prensa: 'PG13-2', rota: ['CH-2x1', 'CV-esq', 'CH-base'] },

  /* ── AS DUAS POSIÇÕES DE ENSAIO ───────────────────────────────────── */
  { ...kabo('X11', { comp: 'F-P', via: 'F-P1' }, naCamara('DUT1', '+24 V'), 0.5,
      'srv24', 'alim', 'Positivo da posição 1, já depois do fusível e da chave.'),
    nome: 'posição 1 +', prensa: 'PG13-2', rota: ['CH-2x1', 'CV-esq', 'CH-base'] },
  { ...kabo('X12', { comp: 'F-P', via: 'F-P2' }, naCamara('DUT2', '+24 V'), 0.5,
      'srv24', 'alim', 'Positivo da posição 2.'),
    nome: 'posição 2 +', prensa: 'PG13-2', rota: ['CH-2x1', 'CV-esq', 'CH-base'] },
  { ...kabo('X13', naCamara('DUT1', 'retorno'), { comp: 'PI-2', via: 'RET-1' }, 0.5,
      'medida', 'sinal', 'A volta da posição 1, que vai atravessar o shunt na PI-2.'),
    nome: 'posição 1 · retorno', prensa: 'PG9-3', rota: ['CV-dir', 'CH-topo'],
    aviso: '🔥 ESTE FIO É A MEDIÇÃO. Ele carrega os 17,6 mA que o sistema está medindo, e '
         + 'só vira 0 V depois do shunt. Ele NÃO pode dividir prensa-cabo com a saída '
         + 'dos BTS — por isso sai pelo PG9-3, e não pelo PG13-2.' },
  { ...kabo('X14', naCamara('DUT2', 'retorno'), { comp: 'PI-2', via: 'RET-2' }, 0.5,
      'medida', 'sinal', 'A volta da posição 2, individual.'),
    nome: 'posição 2 · retorno', prensa: 'PG9-3', rota: ['CV-dir', 'CH-topo'],
    porque: '⭐ Individual, e não comum com o da posição 1. Se voltassem juntos as duas '
          + 'correntes se somariam antes do shunt e não daria para saber qual parou.' },

  /* ── O SENSOR DA CÂMARA ───────────────────────────────────────────── */
  { ...kabo('X15', { comp: 'BD-5V', via: 'O10' }, naCamara('SENS', 'VCC'), 0.25,
      'log5', 'alim', 'Alimentação do AM2315C.'),
    nome: 'AM2315C · VCC', prensa: 'PG9-3', rota: ['CH-base', 'CV-dir'] },
  { ...kabo('X16', naCamara('SENS', 'GND'), { comp: 'BD-0V', via: 'R15' }, 0.25,
      'zero', 'comum', 'Retorno do sensor.'),
    nome: 'AM2315C · GND', prensa: 'PG9-3', rota: ['CV-dir', 'CH-base'] },
  { ...kabo('X17', { comp: 'PI-2', via: 'SDA' }, naCamara('SENS', 'SDA'), 0.25,
      'digital', 'sinal', 'O I²C continua da PI-2 até o sensor, dentro da câmara.'),
    nome: 'I²C SDA → câmara', prensa: 'PG9-3', rota: ['CH-3x2', 'CV-dir'],
    porque: '⭐ Terceira parada do MESMO barramento: Mega → RTC → PI-2 → AM2315C. Três '
          + 'endereços, um par de fios.' },
  { ...kabo('X18', { comp: 'PI-2', via: 'SCL' }, naCamara('SENS', 'SCL'), 0.25,
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
];
