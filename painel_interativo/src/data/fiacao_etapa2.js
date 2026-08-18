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
 *                                    KA1·14 ──[S2 · STOP NF]──┬──[S1 · START NA]──┐
 *                                                              └── KA2 · selo ─────┤
 *                                                          A1 [KA2] A2 ──[Q1]──► 0 V
 *
 * ⭐ DOIS SELOS, DUAS BOTOEIRAS DE REARME:
 *     KA1  cai na EMERGENCIA  →  refeito pelo REARME azul
 *     KA2  cai no STOP        →  refeito pelo START verde
 *   O Q1 fica em serie com a bobina do KA2: e o veto do firmware.
 *
 *   PG9-1 (24 V potência) ──► KA2·11 ══ KA2·14 ──► BD-POT ──► os dois BTS
 */

export const FIOS_ETAPA2 = [
  {
    n: 'C1', etapa: 2, func: 'srv24', nome: 'alimentação da cadeia', classe: 'potencia',
    de: { comp: 'BD-24V', via: 'O2' }, para: { comp: 'S0', via: '11' },
    mm2: 0.5,
    rota: ['CH-base', 'CP-vpot', 'CP-3x4'],
    diz: 'Sai do barramento PERMANENTE e vai até o cogumelo, na porta.',
    porque: '⭐ Vem do BD-24V e não do BD-POT. Se a cadeia de comando fosse alimentada '
          + 'pela potência que ela mesma comanda, nada nunca ligaria.',
  },
  {
    n: 'C2', etapa: 2, func: 'srv24', nome: 'nó CMD → REARME', classe: 'potencia',
    de: { comp: 'S0', via: '12' }, para: { comp: 'S3', via: '13' },
    mm2: 0.5,
    rota: ['CP-3x4'],
    diz: 'Fio curto, todo dentro da porta: do cogumelo até o botão de rearme.',
  },
  {
    n: 'C3', etapa: 2, func: 'srv24', nome: 'nó CMD → selo do KA1', classe: 'potencia',
    de: { comp: 'S0', via: '12' }, para: { comp: 'KA1', via: '11' },
    mm2: 0.5,
    rota: ['CP-3x4', 'CP-vpot', 'CH-base'],
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
    n: 'C8', etapa: 2, func: 'srv24', nome: '⭐ STOP → nó do selo do KA2', classe: 'potencia',
    de: { comp: 'S2', via: '12' }, para: { comp: 'S1', via: '13' },
    mm2: 0.5,
    rota: ['CP-3x4'],
    diz: 'Bloco NF: em repouso conduz. Apertado, abre — e derruba o selo do KA2.',
    porque: '⭐ É AQUI QUE O STOP VIRA UM BOTÃO DE PARADA DE VERDADE. O bloco está DENTRO '
          + 'da malha do selo do KA2: aperta uma vez, a bobina cai, o contato de selo abre '
          + 'junto, e nem soltando o botão ela volta. Só o S1 verde religa. É o circuito '
          + 'universal de partida-parada, e não depende de uma linha de firmware.',
    aviso: '🔥 NÃO CONFUNDA OS DOIS BLOCOS DO S2. O de 24 V (11-12) é este, o que corta de '
         + 'verdade; o de 5 V (13-14) só avisa o D23. Ligar o Arduino no de 24 V queima o '
         + 'pino; ligar a cadeia no de 5 V deixa o STOP sem efeito em hardware.',
  },
  {
    n: 'C8b', etapa: 2, func: 'srv24', nome: 'nó do selo → comum do KA2', classe: 'potencia',
    de: { comp: 'S1', via: '13' }, para: { comp: 'KA2', via: '21' },
    mm2: 0.5,
    rota: ['CP-3x4', 'CP-vpot', 'CH-base', 'CV-esq', 'CH-2x1'],
    diz: 'O mesmo nó do C8, indo ao comum do contato de selo do KA2.',
  },
  {
    n: 'C8c', etapa: 2, func: 'srv24', nome: '⭐ START verde → bobina do KA2', classe: 'potencia',
    de: { comp: 'S1', via: '14' }, para: { comp: 'KA2', via: 'A1' },
    mm2: 0.5,
    rota: ['CP-3x4', 'CP-vpot', 'CH-base'],
    diz: 'Apertar o verde energiza a bobina do KA2 pela primeira vez.',
    porque: '⭐ É NA de propósito, pelo mesmo motivo do REARME: fio partido no START '
          + 'impede a máquina de armar a potência — que é o estado seguro. Se fosse NF, '
          + 'um fio partido armaria tudo sozinho.',
    aviso: '⚠️ ELE ARMA A POTÊNCIA, NÃO INICIA O ENSAIO. O ensaio começa no INICIAR da '
         + 'tela IHM. Etiquete o botão como LIGAR para o operador não confundir.',
  },
  {
    n: 'C8d', etapa: 2, func: 'srv24', nome: '⭐ O SELO DO KA2', classe: 'potencia',
    de: { comp: 'KA2', via: '24' }, para: { comp: 'KA2', via: 'A1' },
    mm2: 0.5, rota: [],
    diz: 'O contato do próprio KA2 realimentando a própria bobina — ponte na base.',
    porque: '🔥 É ESTE FIO QUE FAZ O STOP FUNCIONAR COM UM TOQUE SÓ. Sem ele o KA2 fica '
          + 'ligado apenas enquanto o dedo estiver no botão verde. É o gêmeo do C6, que '
          + 'faz o mesmo pelo KA1 — mesma ponte, mesma base, mesmos 4 cm de fio.',
    aviso: '🔥 SÃO DOIS SELOS E ELES NÃO SÃO IGUAIS. O do KA1 (C6) se desfaz na EMERGÊNCIA '
         + 'e só o REARME azul o refaz. Este se desfaz no STOP e o botão VERDE o refaz. '
         + 'Trocados na montagem, o STOP passa a exigir rearme e a emergência religa com '
         + 'o verde — o inverso do que a norma manda.',
  },
  {
    n: 'C9', etapa: 2, func: 'zero', nome: 'retorno da bobina do KA1', classe: 'comum',
    de: { comp: 'KA1', via: 'A2' }, para: { comp: 'BD-0V', via: 'R11' },
    mm2: 0.5,
    rota: ['CH-2x1', 'CV-dir', 'CH-base'],
    diz: 'A bobina fecha no 0 V comum, ponto R11 da barra.',
  },
  {
    n: 'C10', etapa: 2, func: 'zero', nome: '⭐ bobina do KA2 → contato do KA3', classe: 'comum',
    de: { comp: 'KA2', via: 'A2' }, para: { comp: 'KA3', via: '11' },
    mm2: 0.5,
    rota: ['CH-2x1'],
    diz: 'O retorno da bobina do KA2 já não vai direto ao 0 V: passa pelo contato do KA3.',
    porque: '⭐ É AQUI QUE MORA O VETO DO FIRMWARE. Com o KA3 aberto, a bobina do KA2 não '
          + 'energiza — e como o KA2 tem selo próprio, basta um pulso de 50 ms para o selo '
          + 'se perder e a potência ficar cortada até alguém apertar o botão verde. É o '
          + 'que dá ao trip um corte FÍSICO e RETENTIVO, em vez de só baixar o R_EN.',
    aviso: '⚠️ EM SÉRIE, NUNCA EM PARALELO. O KA3 está no caminho da bobina, DEPOIS do S0 '
         + 'e do S2. Assim ele só pode DERRUBAR a potência — jamais mantê-la contra uma '
         + 'botoeira. Um contato de software em paralelo com o STOP ou com um dos selos '
         + 'faria o firmware furar a emergência.',
  },
  {
    n: 'C10b', etapa: 2, func: 'zero', nome: 'contato do KA3 → 0 V', classe: 'comum',
    de: { comp: 'KA3', via: '14' }, para: { comp: 'BD-0V', via: 'R12' },
    mm2: 0.5,
    rota: ['CH-2x1', 'CV-esq', 'CH-base'],
    diz: 'Fecha o circuito da bobina do KA2 no ponto R12 da barra.',
    aviso: '🔥 USE O CONTATO NA (11→14), NUNCA O NF. Relé desatracado = contato '
         + 'aberto = potência cortada. No NF, um Arduino desligado ARMARIA a potência. '
         + '⚠ O KA4 usa o NF de propósito — lá o estado seguro é o contrário.',
  },
  {
    n: 'C12', etapa: 2, func: 'srv24', nome: '⭐ roda-livre da bobina do KA2', classe: 'potencia',
    de: { comp: 'KA2', via: 'A1' }, para: { comp: 'KA2', via: 'A2' },
    mm2: 0.5, rota: [],
    diz: 'Diodo 1N4007 direto nos bornes da bobina — catodo (faixa) no A1.',
    porque: '🔥 COM UM CONTATO SECO ABRINDO A BOBINA, O PICO INDUTIVO FORMA ARCO NO '
          + 'CONTATO DO KA3. O diodo grampeia em ~24,7 V e o contato interrompe limpo. '
          + 'Sem ele o contato pita e, depois de algumas centenas de operações, solda — '
          + 'e um contato soldado no caminho da bobina é o veto do firmware perdido.',
    aviso: '⚠️ INVERTIDO ELE CURTO-CIRCUITA A BOBINA e derruba o F2 assim que o KA1 selar. '
         + 'Antes de montar, teste o KA2 com o multímetro em TESTE DE DIODO entre A1 e A2: '
         + 'se já conduzir num sentido só, o relé tem diodo interno e este é dispensável.',
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
