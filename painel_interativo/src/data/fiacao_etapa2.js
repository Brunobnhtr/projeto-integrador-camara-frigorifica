/**
 * ETAPA 2 — COMANDO E EMERGÊNCIA
 * ==============================
 * ⚠️ Este é o circuito que NÃO pode estar errado. É ele que corta a
 * energia quando alguém soca o cogumelo, e nenhuma linha de firmware
 * participa dele.
 *
 * A cadeia em um desenho:
 *
 *   BD-24V ──[S0 · cogumelo NF]──[S2 · STOP NF]──┬──[S1 · LIGAR NA]──┐
 *          (permanente)                          └──── KM1 · selo ───┤
 *                                                A1 [KM1] A2 ──[Q1]──► 0 V
 *
 * ⭐ UM SELO SÓ, UMA BOTOEIRA SÓ PARA REFAZÊ-LO:
 *     as DUAS paradas em hardware (cogumelo e preto) abrem a MESMA
 *     malha, e o LIGAR verde refaz o selo venha a parada de onde vier.
 *   O Q1 (contato do KA1) fica em serie com a bobina: e o veto do
 *   firmware, e em serie ele so pode derrubar.
 *
 *   PG9-1 (24 V potência) ──► KM1·11 ══ KM1·14 ──► BD-POT ──► os dois BTS
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
    n: 'C2', etapa: 2, func: 'srv24', nome: '⭐ EMERGÊNCIA → STOP, as duas em série',
    classe: 'potencia',
    de: { comp: 'S0', via: '12' }, para: { comp: 'S2', via: '11' },
    mm2: 0.5,
    rota: ['CP-3x4'],
    diz: 'Fio curto, todo dentro da porta: do cogumelo direto ao bloco NF do STOP.',
    porque: '⭐ OS DOIS BLOCOS NF FICAM EM SÉRIE, e é isso que faz as duas paradas '
          + 'derrubarem o MESMO selo. Qualquer um dos dois aberto interrompe a bobina '
          + 'do KM1 — e o selo, uma vez perdido, não se refaz sozinho.',
    aviso: '⚠️ Este fio não passa por relé nenhum. Antes existia um segundo relé de selo no meio do '
         + 'caminho; hoje o cogumelo alcança o STOP diretamente, e há um componente a '
         + 'menos entre o dedo e o corte.',
  },
  {
    n: 'C3', etapa: 2, func: 'srv24', nome: '⭐ STOP → nó do selo do KM1', classe: 'potencia',
    de: { comp: 'S2', via: '12' }, para: { comp: 'S1', via: '13' },
    mm2: 0.5,
    rota: ['CP-3x4'],
    diz: 'Bloco NF: em repouso conduz. Apertado, abre — e derruba o selo do KM1.',
    porque: '⭐ É AQUI QUE O STOP VIRA UM BOTÃO DE PARADA DE VERDADE. O bloco está DENTRO '
          + 'da malha do selo do KM1: aperta uma vez, a bobina cai, o contato de selo abre '
          + 'junto, e nem soltando o botão ela volta. Só o S1 verde religa. É o circuito '
          + 'universal de partida-parada, e não depende de uma linha de firmware.',
    aviso: '🔥 NÃO CONFUNDA OS DOIS BLOCOS DO S2. O de 24 V (11-12) é este, o que corta de '
         + 'verdade; o de 5 V (13-14) só avisa o D23. Ligar o Arduino no de 24 V queima o '
         + 'pino; ligar a cadeia no de 5 V deixa o STOP sem efeito em hardware.',
  },
  {
    n: 'C4', etapa: 2, func: 'srv24', nome: 'nó do selo → comum do KM1', classe: 'potencia',
    de: { comp: 'S1', via: '13' }, para: { comp: 'KM1', via: '21' },
    mm2: 0.5,
    rota: ['CP-3x4', 'CP-vpot', 'CH-base', 'CV-esq', 'CH-2x1'],
    diz: 'O mesmo nó do C3, indo ao comum do contato de selo do KM1.',
  },
  {
    n: 'C5', etapa: 2, func: 'srv24', nome: '⭐ LIGAR verde → bobina do KM1', classe: 'potencia',
    de: { comp: 'S1', via: '14' }, para: { comp: 'KM1', via: 'A1' },
    mm2: 0.5,
    rota: ['CP-3x4', 'CP-vpot', 'CH-base'],
    diz: 'Apertar o verde energiza a bobina do KM1 pela primeira vez.',
    porque: '⭐ É NA de propósito: fio partido no LIGAR impede a máquina de armar a '
          + 'potência — que é o estado seguro. Se fosse NF, um fio partido armaria tudo '
          + 'sozinho. É o raciocínio inverso ao dos botões de parada, que são NF pelo '
          + 'mesmo motivo: a falha tem de levar ao estado seguro.',
    aviso: '⚠️ ELE ARMA A POTÊNCIA, NÃO INICIA O ENSAIO. O ensaio começa no INICIAR da '
         + 'tela IHM. Etiquete o botão como LIGAR para o operador não confundir.',
  },
  {
    n: 'C6', etapa: 2, func: 'srv24', nome: '⭐ O SELO', classe: 'potencia',
    de: { comp: 'KM1', via: '24' }, para: { comp: 'KM1', via: 'A1' },
    mm2: 0.5, rota: [],
    diz: 'O contato do próprio KM1 realimentando a própria bobina — ponte na base.',
    porque: '🔥 É ESTE FIO QUE FAZ A MÁQUINA LEMBRAR. Solta o botão verde e o KM1 continua '
          + 'ligado, porque agora se alimenta pelo próprio contato. Abriu a corrente em '
          + 'qualquer ponto — cogumelo, STOP, veto do KA1, falta de energia — a bobina cai, '
          + 'o contato abre e o selo se perde. Só um novo LIGAR religa. Memória sem software.',
    aviso: '⚠️ Sem este fio o KM1 fica ligado só enquanto o verde estiver apertado, e a '
         + 'máquina desliga sozinha assim que a pessoa tira o dedo.',
  },
  {
    n: 'C7', etapa: 2, func: 'zero', nome: '⭐ bobina do KM1 → contato do KA1', classe: 'comum',
    de: { comp: 'KM1', via: 'A2' }, para: { comp: 'KA123', via: 'COM1' },
    mm2: 0.5,
    rota: ['CH-2x1'],
    diz: 'O retorno da bobina do KM1 já não vai direto ao 0 V: passa pelo contato do KA1.',
    porque: '⭐ É AQUI QUE MORA O VETO DO FIRMWARE. Com o KA1 aberto, a bobina do KM1 não '
          + 'energiza — e como o KM1 tem selo próprio, basta um pulso de 50 ms para o selo '
          + 'se perder e a potência ficar cortada até alguém apertar o botão verde. É o '
          + 'que dá ao trip um corte FÍSICO e RETENTIVO, em vez de só baixar o R_EN.',
    aviso: '⚠️ EM SÉRIE, NUNCA EM PARALELO. O KA1 está no caminho da bobina, DEPOIS do S0 '
         + 'e do S2. Assim ele só pode DERRUBAR a potência — jamais mantê-la contra uma '
         + 'botoeira. Um contato de software em paralelo com o STOP ou com o selo faria o '
         + 'firmware furar a emergência.',
  },
  {
    n: 'C8', etapa: 2, func: 'zero', nome: 'contato do KA1 → 0 V', classe: 'comum',
    de: { comp: 'KA123', via: 'NO1' }, para: { comp: 'BD-0V', via: 'Z12' },
    mm2: 0.5,
    rota: ['CH-2x1', 'CV-esq', 'CH-base'],
    diz: 'Fecha o circuito da bobina do KM1 no ponto Z12 da barra.',
    aviso: '🔥 USE O NO (NORMALMENTE ABERTO), NUNCA O NC. Módulo sem energia = contato '
         + 'aberto = potência cortada. No NC, um Arduino desligado ARMARIA a potência. '
         + '⚠ O KA2 usa o NC de propósito — lá o estado seguro é o contrário (§31.14).',
  },
  {
    n: 'C9', etapa: 2, func: 'srv24', nome: '⭐ roda-livre da bobina do KM1', classe: 'potencia',
    de: { comp: 'KM1', via: 'A1' }, para: { comp: 'KM1', via: 'A2' },
    mm2: 0.5, rota: [],
    diz: 'Diodo 1N4007 direto nos bornes da bobina — catodo (faixa) no A1.',
    porque: '🔥 COM UM CONTATO SECO ABRINDO A BOBINA, O PICO INDUTIVO FORMA ARCO NO '
          + 'CONTATO DO KA1. O diodo grampeia em ~24,7 V e o contato interrompe limpo. '
          + 'Sem ele o contato pita e, depois de algumas centenas de operações, solda — '
          + 'e um contato soldado no caminho da bobina é o veto do firmware perdido.',
    aviso: '⚠️ INVERTIDO ELE CURTO-CIRCUITA A BOBINA e derruba o F2 assim que o verde for '
         + 'apertado. Antes de montar, teste o KM1 com o multímetro em TESTE DE DIODO '
         + 'entre A1 e A2: se já conduzir num sentido só, o relé tem diodo interno e este '
         + 'é dispensável.',
  },
  {
    n: 'C10', etapa: 2, func: 'pot24', nome: '24 V comandado → BD-POT', classe: 'potencia',
    de: { comp: 'KM1', via: '14' }, para: { comp: 'BD-POT', via: 'IN' },
    mm2: 1.5,
    rota: ['CH-base', 'CV-esq', 'CH-2x1'],
    diz: 'A saída do contato de potência do KM1, indo ao barramento comutado.',
    porque: '⭐ Daqui para a frente tudo cai na emergência: os dois BTS e o 24 V de '
          + 'potência da PI-1. É a fronteira entre o que morre e o que continua vivo.',
    aviso: '⚠️ 1,5 mm², a mesma bitola da entrada — este fio conduz os mesmos 6 A das '
         + 'Peltier. Usar 0,5 aqui aquece e derruba tensão.',
  },
];
