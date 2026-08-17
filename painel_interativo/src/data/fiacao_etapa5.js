/**
 * ETAPA 5 — A PORTA
 * =================
 * A tela, o conversor de nível, os 4 sinaleiros e os blocos de 5 V dos
 * comandos. Tudo cruza pelas duas calhas da dobradiça.
 *
 * ⭐ AS DUAS CLASSES CRUZAM SEPARADAS:
 *   CL-pot  ·  o positivo comum de 24 V dos sinaleiros e os retornos
 *              deles, que o ULN chaveia
 *   CL-sin  ·  a tela, o conversor, e os quatro contatos de 5 V dos
 *              comandos
 *
 * 📌 O 0 V DOS COMANDOS É UM SÓ. Ele cruza a dobradiça uma vez e é
 * pontelhado entre os quatro blocos na própria porta — µA por contato,
 * onde alguns milivolts não mudam nada. Ver Doc 31 §31.8.
 */

const sin = (n, de, para, diz, extra = {}) => ({
  n, etapa: 5, classe: 'sinal', func: 'digital', mm2: 0.25, de, para, diz, ...extra,
});
const SIN = ['CV-dir', 'CP-vsin'];              // travessia pela calha de sinal
const POT = ['CH-base', 'CP-vpot'];             // travessia pela calha de potência

export const FIOS_ETAPA5 = [
  /* ── os 4 sinaleiros ──────────────────────────────────────────────── */
  { n: 'P1', etapa: 5, classe: 'alim', func: 'srv24', mm2: 0.5,
    de: { comp: 'BD-24V', via: 'O3' }, para: { comp: 'H1', via: '+' },
    nome: 'positivo comum dos sinaleiros', rota: [...POT, 'CP-2x3'],
    diz: 'Um fio só do barramento permanente até o primeiro sinaleiro.',
    porque: '⭐ Vem do BD-24V, que NÃO cai na emergência. A lâmpada de FALHA precisa '
          + 'continuar acesa justamente quando a potência morreu.' },
  ...[['P2', 'H1', 'H2'], ['P3', 'H2', 'H3'], ['P4', 'H3', 'H4']].map(([n, a, b]) => ({
    n, etapa: 5, classe: 'alim', func: 'srv24', mm2: 0.5,
    de: { comp: a, via: '+' }, para: { comp: b, via: '+' },
    nome: `ponte do +24 V · ${a} → ${b}`, rota: ['CP-2x3'],
    diz: 'Ponte curta na própria porta, entre sinaleiros vizinhos.',
  })),
  ...[['P5', 'H1', 'J2-4', 'ENERGIZADO'], ['P6', 'H2', 'J2-5', 'RESFRIANDO'],
      ['P7', 'H3', 'J2-6', 'AQUECENDO'], ['P8', 'H4', 'J2-7', 'FALHA']]
    .map(([n, h, j, nome]) => ({
      /* ⭐ 20 mA de LED, chaveados a cada MUDANÇA DE ESTADO — não a
         cada milissegundo. Não é o que a canaleta de potência existe
         para conter, e classificá-lo assim tornaria impossível chegar
         na PI-1, que só tem canaleta de sinal ao redor. */
      n: n, etapa: 5, classe: 'alim', func: 'srv24', mm2: 0.5,
      de: { comp: h, via: '−' }, para: { comp: 'PI1', via: j },
      nome: `retorno do sinaleiro ${nome}`,
      rota: ['CP-2x3', 'CP-vsin', 'CV-dir', 'CH-3x2'],
      diz: `O negativo do ${nome}, que o ULN2803A puxa para o 0 V quando acende.`,
    })),
  { n: 'P9', etapa: 5, classe: 'potencia', func: 'srv24', mm2: 0.5,
    de: { comp: 'H4', via: '+' }, para: { comp: 'H4', via: '+' }, rota: [],
    nome: '— placeholder do encadeamento', oculto: true,
    diz: 'Marcador de que a corrente do +24 V dos sinaleiros vem encadeada.' },

  /* ── a tela e o conversor de nível ────────────────────────────────── */
  { n: 'P10', etapa: 5, classe: 'alim', func: 'log5', mm2: 0.5,
    de: { comp: 'BD-5V', via: 'O2' }, para: { comp: 'HMI', via: 'VBUS' },
    nome: 'alimentação da tela', rota: ['CH-base', 'CV-dir', 'CP-vsin', 'CP-topo'],
    diz: 'Os 5 V que alimentam a ES3C28P, pelo VBUS.',
    aviso: '⚠️ Alimente pelo VBUS OU pelo USB-C, nunca pelos dois. E confira a bitola: '
         + 'a tela puxa ~140 mA e o cabo é longo, atravessa a dobradiça.' },
  { n: 'P11', etapa: 5, classe: 'comum', func: 'zero', mm2: 0.5,
    de: { comp: 'HMI', via: 'GND-PWR' }, para: { comp: 'BD-0V', via: 'R9' },
    nome: 'retorno da tela', rota: ['CP-1x2', 'CP-vsin', 'CV-dir', 'CH-base'],
    diz: 'O 0 V da tela, no ponto R9 da barra.' },
  { ...sin('P12', { comp: 'MEGA', via: 'D16' }, { comp: 'CONV', via: 'TXI' },
      'Serial2 do Arduino entrando no lado ALTO do conversor.'),
    nome: 'UART Mega TX → conversor',
    rota: ['CH-topo', 'CV-dir', 'CP-vsin', 'CP-topo'],
    porque: '⭐ O Mega fala em 5 V e a tela é ESP32-S3, de 3,3 V. Sem o conversor, os '
          + '5 V no RX da tela estressam o pino — pode funcionar por um tempo e morrer '
          + 'depois, que é o pior modo de falhar.' },
  { ...sin('P13', { comp: 'CONV', via: 'RXO' }, { comp: 'MEGA', via: 'D17' },
      'A volta, do lado alto do conversor para o Arduino.'),
    nome: 'UART conversor → Mega RX',
    rota: ['CP-topo', 'CP-vsin', 'CV-dir', 'CH-topo'] },
  { n: 'P14', etapa: 5, classe: 'alim', func: 'log5', mm2: 0.25,
    de: { comp: 'BD-5V', via: 'O7' }, para: { comp: 'CONV', via: 'HV' },
    nome: 'lado ALTO do conversor · 5 V',
    rota: ['CH-base', 'CV-dir', 'CP-vsin', 'CP-topo'],
    diz: 'O conversor precisa conhecer as DUAS tensões para trabalhar.' },
  { n: 'P15', etapa: 5, classe: 'comum', func: 'zero', mm2: 0.25,
    de: { comp: 'CONV', via: 'GND-HV' }, para: { comp: 'BD-0V', via: 'R10' },
    nome: 'retorno do conversor', rota: ['CP-topo', 'CP-vsin', 'CV-dir', 'CH-base'],
    diz: 'O 0 V do lado alto.' },
  { ...sin('P16', { comp: 'CONV', via: 'LV' }, { comp: 'HMI', via: '3V3' },
      'O lado BAIXO do conversor pega a referência de 3,3 V da própria tela.'),
    nome: 'referência de 3,3 V', rota: ['CP-1x2', 'CP-vsin', 'CP-topo'],
    porque: '⭐ Os 3,3 V vêm DA TELA, não de um regulador nosso. É ela quem define o '
          + 'nível lógico daquele lado, então é dela que a referência tem que sair.' },
  { ...sin('P17', { comp: 'CONV', via: 'TXO' }, { comp: 'HMI', via: 'RXD · IO43' },
      'Do conversor para o RX da tela, já em 3,3 V.'),
    nome: 'conversor → tela RX', rota: ['CP-1x2'] },
  { ...sin('P18', { comp: 'HMI', via: 'TXD · IO44' }, { comp: 'CONV', via: 'RXI' },
      'Do TX da tela para o conversor.'), nome: 'tela TX → conversor',
    rota: ['CP-1x2'],
    aviso: '🔥 TX DE UM NO RX DO OUTRO. São quatro fios de UART neste trecho (P12, P13, '
         + 'P17, P18) e trocar dois deles não queima nada — só faz a tela ficar em '
         + 'branco, com cara de firmware errado.' },
  { n: 'P19', etapa: 5, classe: 'comum', func: 'zero', mm2: 0.25,
    de: { comp: 'HMI', via: 'GND-UART' }, para: { comp: 'CONV', via: 'GND-LV' },
    nome: '0 V comum do lado baixo', rota: ['CP-1x2'],
    diz: 'Ponte curta na porta: os dois lados precisam da mesma referência.',
    aviso: '⚠️ Sem este fio o conversor não tem referência do lado de 3,3 V, e a '
         + 'comunicação fica intermitente — funciona no teste de bancada e falha no dia.' },

  /* ── os blocos de 5 V dos comandos ────────────────────────────────── */
  { n: 'P20', etapa: 5, classe: 'comum', func: 'zero', mm2: 0.25,
    de: { comp: 'BD-0V', via: 'R18' }, para: { comp: 'SA1', via: '13' },
    nome: '0 V dos comandos → porta', rota: ['CH-base', 'CV-dir', 'CP-vsin', 'CP-2x3'],
    diz: 'UM fio de 0 V cruza a dobradiça e serve os quatro comandos.',
    porque: '⭐ Aqui pendurar É o certo. O limiar do Arduino fica em 2,5 V e o pull-up '
          + 'interno dá 0,25 mA — alguns milivolts de queda não mudam nada. Quatro '
          + 'travessias de dobradiça economizadas sem custo de precisão.' },
  ...[['P21', 'SA1', '13', 'S1', '13'], ['P22', 'S1', '13', 'S2', '13']]
    .map(([n, a, va, b, vb]) => ({
      n, etapa: 5, classe: 'comum', func: 'zero', mm2: 0.25,
      de: { comp: a, via: va }, para: { comp: b, via: vb },
      nome: `ponte do 0 V · ${a} → ${b}`, rota: ['CP-2x3'],
      diz: 'Ponte curta entre blocos vizinhos, na própria porta.',
    })),
  /* o cogumelo está uma fileira abaixo, então o 0 V dele desce pela
     vertical de sinal em vez de ser ponte curta */
  { n: 'P23', etapa: 5, classe: 'comum', func: 'zero', mm2: 0.25,
    de: { comp: 'S2', via: '13' }, para: { comp: 'S0', via: '21' },
    nome: 'ponte do 0 V · S2 → cogumelo',
    rota: ['CP-2x3', 'CP-vsin', 'CP-base'],
    diz: 'Desce pela vertical de sinal até a fileira do cogumelo.' },
  ...[['P24', 'S1', '14', 'D22', 'START', 'CP-2x3'],
      ['P25', 'S2', '14', 'D23', 'STOP', 'CP-2x3'],
      ['P26', 'S0', '22', 'D24', 'EMERGÊNCIA', 'CP-base'],
      ['P27', 'SA1', '14', 'D26', 'LOCAL/REMOTO', 'CP-2x3']]
    .map(([n, c, v, d, nome, k]) => ({
      ...sin(n, { comp: c, via: v }, { comp: 'MEGA', via: d },
        `O Arduino lê o ${nome} por este fio.`),
      nome: `${nome} → Mega ${d}`,
      rota: [k, 'CP-vsin', 'CV-dir', 'CH-topo'],
    })),

  /* ── os LEDs da maquete ───────────────────────────────────────────── */
  /* ── os 4 LEDs da iluminação da maquete, que ficam FORA ──────────── */
  { n: 'P28', etapa: 5, classe: 'alim', func: 'log5', mm2: 0.25,
    de: { comp: 'BD-5V', via: 'O7' }, para: { maquete: 'LEDS', borne: '+' },
    prensa: 'PG9-2', nome: 'LEDs da maquete +', rota: ['CH-base'],
    diz: 'Alimenta os 4 LEDs brancos da iluminação da rua, sempre acesos.',
    porque: '📌 Cada LED tem o SEU resistor de 220 Ω, montado dentro da base do poste '
          + 'e não aqui. Do painel sai só o par de alimentação.' },
  { n: 'P29', etapa: 5, classe: 'comum', func: 'zero', mm2: 0.25,
    de: { maquete: 'LEDS', borne: '−' }, para: { comp: 'BD-0V', via: 'R16' },
    prensa: 'PG9-2', nome: 'LEDs da maquete −', rota: ['CH-base'],
    diz: 'Retorno comum dos quatro.' },
];
