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
 *   BD-AUX  (12 V)       → só as ventoinhas, pelo MV-1
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
  { ...pot('D3', { comp: 'BD-POT', via: 'O3' }, { comp: 'PI1', via: 'J1-11' }, 0.5,
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
  { ...pot('D6', { comp: 'BD-24V', via: 'O5' }, { comp: 'PI1', via: 'J1-10' }, 0.5,
      'O COM do ULN2803A — a referência dos diodos de retorno.'),
    classe: 'alim', func: 'srv24', rota: ['CH-base', 'CV-esq', 'CH-topo'],
    porque: '⭐ Este fio quase não conduz. O COM do ULN não alimenta os sinaleiros — o positivo deles vem do BD-24V O3 direto para a porta. O COM só ancora os diodos de roda-livre internos, e por isso pode correr na canaleta de sinal.',
    aviso: '🔥 NÃO CONFUNDA COM O D3. Os dois saem do mesmo trilho e chegam na mesma '
         + 'PI-1, um no J1-10 e outro no J1-11 — vias vizinhas. O J1-10 é PERMANENTE '
         + '(sinaleiros) e o J1-11 é COMUTADO (o que o divisor vigia). Trocados, a '
         + 'lâmpada de FALHA apaga na emergência e o Arduino acha que a potência '
         + 'nunca cai.' },

  /* ── BD-5V: a eletrônica ──────────────────────────────────────────── */
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
  { ...cinco('D11', { comp: 'BD-5V', via: 'O6' }, { comp: 'PI1', via: 'J1-4' },
      'O 5 V que alimenta o pull-up do 1-Wire dentro da PI-1.'),
    rota: ['CH-base', 'CV-esq', 'CH-topo'] },
  { ...cinco('D12', { comp: 'BD-5V', via: 'O8' }, { comp: 'PI-2', via: '+5V' },
      'Alimenta o multiplexador e o INA219 da PI-2.'),
    rota: ['CH-base', 'CV-esq', 'CH-3x2'] },
  { ...cinco('D13', { comp: 'BD-5V', via: 'O9' }, { comp: 'MV-1', via: 'VCC' },
      'Lado do COMANDO do módulo MOSFET, opticamente isolado.'),
    rota: ['CH-base', 'CV-esq', 'CH-3x2'],
    aviso: '⚠️ VCC e VIN do MV-1 são mundos separados pelo optoacoplador. VCC = 5 V do '
         + 'comando; VIN = 12 V das ventoinhas. Trocados, os 12 V entram no lado do '
         + 'Arduino.' },

  /* ── BD-AUX: as ventoinhas ────────────────────────────────────────── */
  { n: 'D14', etapa: 3, classe: 'alim', func: 'aux12', mm2: 0.75,
    de: { comp: 'BD-AUX', via: 'O1' },
    para: { comp: 'MV-1', via: 'VIN' }, rota: ['CH-base', 'CV-esq', 'CH-2x1'],
    diz: 'Os 12 V que os quatro canais do MV-1 chaveiam.' },

  /* ── BD-0V: um ponto por fio ──────────────────────────────────────── */
  { ...zero('D15', { comp: 'BTS1', via: 'B−' }, { comp: 'BD-0V', via: 'R1' },
      'Retorno de potência do BTS #1 — 6 A.'),
    mm2: 1.5, rota: ['CH-2x1', 'CV-esq', 'CH-base'] },
  { ...zero('D16', { comp: 'BTS2', via: 'B−' }, { comp: 'BD-0V', via: 'R2' },
      'Retorno de potência do BTS #2.'), mm2: 1.5, rota: ['CH-2x1', 'CV-esq', 'CH-base'] },
  { ...zero('D17', { comp: 'BTS1', via: 'GND' }, { comp: 'BD-0V', via: 'R3' },
      'Retorno da LÓGICA do BTS #1, em fio próprio.'),
    rota: ['CH-2x1', 'CV-esq', 'CH-base'],
    porque: '⭐ Fio separado do B−, e não uma ponte no módulo. Os 6 A do B− criam queda '
          + 'no próprio fio; se a lógica pendurasse nele, essa queda apareceria como '
          + 'ruído na referência do sinal IS.' },
  { ...zero('D18', { comp: 'BTS2', via: 'GND' }, { comp: 'BD-0V', via: 'R4' },
      'Idem para o BTS #2.'), rota: ['CH-2x1', 'CV-esq', 'CH-base'] },
  { ...zero('D19', { comp: 'MEGA', via: 'GND3' }, { comp: 'BD-0V', via: 'R5' },
      'O 0 V do Arduino.'), rota: ['CH-3x2', 'CV-dir', 'CH-base'] },
  { ...zero('D20', { comp: 'PI1', via: 'J1-9' }, { comp: 'BD-0V', via: 'R6' },
      'O 0 V da PI-1, que lá dentro vira o barramento de fio nu.'),
    rota: ['CH-topo', 'CV-dir', 'CH-base'] },
  { ...zero('D21', { comp: 'ESP32', via: '−' }, { comp: 'BD-0V', via: 'R7' },
      'Retorno do DNLCB30.'), rota: ['CH-2x1', 'CV-esq', 'CH-base'] },
  { ...zero('D22', { comp: 'RTC', via: 'GND' }, { comp: 'BD-0V', via: 'R8' },
      'Retorno do relógio.'), rota: ['CH-3x2', 'CV-esq', 'CH-base'] },
  { ...zero('D23', { comp: 'MV-1', via: 'GND-P' }, { comp: 'BD-0V', via: 'R13' },
      'Retorno das CARGAS do MV-1 — o lado dos 12 V das ventoinhas.'),
    rota: ['CH-2x1', 'CV-esq', 'CH-base'] },
  { ...zero('D25', { comp: 'MV-1', via: 'GND-C' }, { comp: 'BD-0V', via: 'R14' },
      'Retorno do COMANDO do MV-1 — o lado de 5 V do Arduino.'),
    rota: ['CH-3x2', 'CV-dir', 'CH-base'],
    aviso: '🔥 DOIS FIOS SEPARADOS, e não uma ponte entre os dois GND do módulo. O '
         + 'optoacoplador existe para isolar o lado das ventoinhas do lado do Arduino; '
         + 'unir os dois no módulo anula esse isolamento e traz o ruído de partida das '
         + 'ventoinhas para dentro da lógica.' },
  { ...zero('D24', { comp: 'PI-2', via: '0V' }, { comp: 'BD-0V', via: 'R17' },
      'Retorno das posições de ensaio, DEPOIS dos shunts.'),
    rota: ['CH-3x2', 'CV-dir', 'CH-base'],
    porque: '⭐ Este fio carrega a corrente que está sendo medida. Ele só é 0 V deste '
          + 'lado do shunt — do outro lado é o nó de medição.' },
];
