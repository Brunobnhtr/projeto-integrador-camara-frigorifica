/**
 * ETAPA 2 — COMANDO E EMERGÊNCIA
 * ==============================
 * ⚠️ Este é o circuito que NÃO pode estar errado. É ele que corta a
 * energia quando alguém soca o cogumelo, e nenhuma linha de firmware
 * participa dele.
 *
 * A cadeia em um desenho:
 *
 *   BD-24V ──[S0 · cogumelo NF]──┬──[S3 · REARME NA]──┐
 *          (permanente)          │                    ├─► KA1·A1 ─► 0 V
 *                                ├──[KA1 · selo 11-14]┘
 *                                └─► KA1·21
 *                                    KA1·24 ──[S2 · STOP NF]──► KA2·A1 ─► 0 V
 *
 *   PG9-1 (24 V potência) ──► KA2·11 ══ KA2·14 ──► BD-POT ──► os dois BTS
 */

export const FIOS_ETAPA2 = [
  {
    n: 'C1', etapa: 2, func: 'srv24', nome: 'alimentação da cadeia', classe: 'potencia',
    de: { comp: 'BD-24V', via: 'O2' }, para: { comp: 'S0', via: '11' },
    mm2: 0.5,
    rota: ['CH-base', 'CP-vpot', 'CP-base'],
    diz: 'Sai do barramento PERMANENTE e vai até o cogumelo, na porta.',
    porque: '⭐ Vem do BD-24V e não do BD-POT. Se a cadeia de comando fosse alimentada '
          + 'pela potência que ela mesma comanda, nada nunca ligaria.',
  },
  {
    n: 'C2', etapa: 2, func: 'srv24', nome: 'nó CMD → REARME', classe: 'potencia',
    de: { comp: 'S0', via: '12' }, para: { comp: 'S3', via: '13' },
    mm2: 0.5,
    rota: ['CP-base', 'CP-vpot', 'CP-3x4'],
    diz: 'Fio curto, todo dentro da porta: do cogumelo até o botão de rearme.',
  },
  {
    n: 'C3', etapa: 2, func: 'srv24', nome: 'nó CMD → selo do KA1', classe: 'potencia',
    de: { comp: 'S0', via: '12' }, para: { comp: 'KA1', via: '11' },
    mm2: 0.5,
    rota: ['CP-base', 'CP-vpot', 'CH-base'],
    diz: 'O mesmo nó do C2, indo para o comum do contato de selo do KA1.',
  },
  {
    n: 'C4', etapa: 2, func: 'srv24', nome: 'REARME → bobina do KA1', classe: 'potencia',
    de: { comp: 'S3', via: '14' }, para: { comp: 'KA1', via: 'A1' },
    mm2: 0.5,
    rota: ['CP-3x4', 'CP-vpot', 'CH-base'],
    diz: 'Apertar o rearme energiza a bobina do KA1 pela primeira vez.',
    porque: '⭐ É NA de propósito. Fio partido no rearme impede a máquina de ligar — '
          + 'que é o estado seguro. Se fosse NF, um fio partido ligaria tudo sozinho.',
  },
  {
    n: 'C5', etapa: 2, func: 'srv24', nome: 'ponte do nó CMD na base do KA1', classe: 'potencia',
    de: { comp: 'KA1', via: '11' }, para: { comp: 'KA1', via: '21' },
    mm2: 0.5, rota: [],
    diz: 'Ponte curta na própria base PTF08A: os dois contatos do KA1 partem do mesmo nó.',
  },
  {
    n: 'C6', etapa: 2, func: 'srv24', nome: '⭐ O SELO', classe: 'potencia',
    de: { comp: 'KA1', via: '24' }, para: { comp: 'KA1', via: 'A1' },
    mm2: 0.5, rota: [],
    diz: 'O contato do próprio KA1 realimentando a própria bobina.',
    porque: '🔥 É ESTE FIO QUE FAZ A MÁQUINA LEMBRAR. Solta o rearme e o KA1 continua '
          + 'ligado, porque agora se alimenta pelo próprio contato. Abriu a corrente em '
          + 'qualquer ponto — cogumelo, falta de energia — o relé cai, o contato abre e '
          + 'o selo se perde. Só um novo rearme religa. Memória sem software.',
    aviso: '⚠️ Sem este fio o KA1 fica ligado só enquanto o rearme estiver apertado, e a '
         + 'máquina desliga sozinha assim que a pessoa tira o dedo.',
  },
  {
    n: 'C7', etapa: 2, func: 'srv24', nome: 'KA1 habilita → STOP', classe: 'potencia',
    de: { comp: 'KA1', via: '14' }, para: { comp: 'S2', via: '11' },
    mm2: 0.5,
    rota: ['CH-base', 'CP-vpot', 'CP-3x4'],
    diz: 'O KA1 só entrega tensão daqui se estiver selado.',
  },
  {
    n: 'C8', etapa: 2, func: 'srv24', nome: 'STOP → bobina do KA2', classe: 'potencia',
    de: { comp: 'S2', via: '12' }, para: { comp: 'KA2', via: 'A1' },
    mm2: 0.5,
    rota: ['CP-3x4', 'CP-vpot', 'CH-base'],
    diz: 'Bloco NF: em repouso conduz; apertado abre e o KA2 solta.',
    porque: '⭐ NF, e em HARDWARE. O STOP corta a bobina do KA2 sem passar por '
          + 'semicondutor nenhum — nem pelo Arduino. O bloco de 5 V do mesmo botão vai '
          + 'ao D23 só para o software SABER que apertaram e mudar de estado.',
    aviso: '🔥 NÃO CONFUNDA OS DOIS BLOCOS DO S2. O de 24 V (11-12) é o que corta de '
         + 'verdade; o de 5 V (13-14) só avisa. Ligar o Arduino no bloco de 24 V queima '
         + 'o pino; ligar a cadeia no bloco de 5 V deixa o STOP sem efeito em hardware.',
  },
  {
    n: 'C9', etapa: 2, func: 'zero', nome: 'retorno da bobina do KA1', classe: 'comum',
    de: { comp: 'KA1', via: 'A2' }, para: { comp: 'BD-0V', via: 'R11' },
    mm2: 0.5,
    rota: ['CH-2x1', 'CV-dir', 'CH-base'],
    diz: 'A bobina fecha no 0 V comum, ponto R11 da barra.',
  },
  {
    n: 'C10', etapa: 2, func: 'zero', nome: 'retorno da bobina do KA2', classe: 'comum',
    de: { comp: 'KA2', via: 'A2' }, para: { comp: 'BD-0V', via: 'R12' },
    mm2: 0.5,
    rota: ['CH-2x1', 'CV-dir', 'CH-base'],
    diz: 'Idem, no ponto R12.',
  },
  {
    n: 'C11', etapa: 2, func: 'pot24', nome: '24 V comandado → BD-POT', classe: 'potencia',
    de: { comp: 'KA2', via: '14' }, para: { comp: 'BD-POT', via: 'IN' },
    mm2: 1.5,
    rota: ['CH-base', 'CV-esq', 'CH-2x1'],
    diz: 'A saída do contato de potência do KA2, indo ao barramento comutado.',
    porque: '⭐ Daqui para a frente tudo cai na emergência: os dois BTS e o 24 V de '
          + 'potência da PI-1. É a fronteira entre o que morre e o que continua vivo.',
    aviso: '⚠️ 1,5 mm², a mesma bitola da entrada — este fio conduz os mesmos 6 A das '
         + 'Peltier. Usar 0,5 aqui aquece e derruba tensão.',
  },
];
