/**
 * O GUIA DE MONTAGEM — o que fazer, na ordem, para quem nunca mexeu com
 * eletrônica.
 * ======================================================================
 *
 * ⭐ POR QUE ELE É DIFERENTE DA DOCUMENTAÇÃO. Os documentos explicam o
 *    PROJETO: por que 24 V, por que dois selos, por que um divisor. Este
 *    guia responde outra coisa — "o que eu faço AGORA, com a peça na
 *    mão?" — e cada passo termina com uma medida que PROVA que ficou
 *    certo, porque quem está aprendendo não tem como saber sozinho.
 *
 * ⚠️ QUASE NADA AQUI É ESCRITO À MÃO. Os passos de componente puxam do
 *    `discretos.js` (as pernas viram ações, o ensaio vira a conferência,
 *    o "se inverter" vira o aviso) e os passos de fiação puxam de
 *    `fiacao.js` (cada fio com as duas pontas e a bitola). Este arquivo
 *    guarda só o que nenhum dos dois sabe: a ORDEM, o tempo, a
 *    ferramenta e o pré-requisito de cada passo.
 */
import { DISCRETOS } from './discretos.js';
import { FIOS, CORES } from './fiacao.js';

export const FASES = [
  {
    id: 'A', nome: 'Bancada', icone: '🔧',
    resumo: 'Tudo que se prepara com o painel ainda fechado — e que é mais fácil de fazer '
          + 'na mesa, com espaço, do que dentro da caixa depois.',
    onde: 'mesa de trabalho',
  },
  {
    id: 'B', nome: 'As duas placas', icone: '🟫',
    resumo: 'A PI-1 e a PI-2 saem do mesmo pedaço de placa ilhada. Solda-se na ordem que '
          + 'deixa cada peça acessível: o barramento reto primeiro, os componentes depois.',
    onde: 'bancada, com ferro de solda',
  },
  {
    id: 'C', nome: 'Painel e fiação', icone: '⚡',
    resumo: 'Componentes no trilho, e os fios em seis etapas. Cada etapa fecha um circuito '
          + 'inteiro — assim dá para testar antes de seguir.',
    onde: 'dentro do painel, DESENERGIZADO',
  },
  {
    id: 'D', nome: 'Energização por trechos', icone: '🔌',
    resumo: 'Energiza-se um pedaço de cada vez, medindo antes de ligar o próximo. Nunca '
          + 'tudo de uma vez.',
    onde: 'painel energizado — atenção',
  },
  {
    id: 'E', nome: 'Ensaios', icone: '✅',
    resumo: 'Os ensaios que provam que a segurança funciona, e os que geram os números do '
          + 'relatório.',
    onde: 'sistema completo',
  },
];

/* ── os passos escritos à mão ────────────────────────────────────────
 * `discretos` puxa os componentes daquele passo; o que eles trazem
 * (pernas, ensaio, aviso) NÃO se repete aqui.
 */
export const PASSOS = [

  /* ═══ FASE A · BANCADA ═══════════════════════════════════════════ */
  {
    id: 'A-01', fase: 'A', titulo: 'Cortar a placa ilhada', tempo: '15 min',
    pegue: ['1 placa ilhada 9 × 15 cm', 'estilete', 'régua de metal', 'lixa fina'],
    antes: 'Nada. É o primeiro passo do projeto.',
    faca: [
      'Conte as fileiras e confirme: são 58 (há versões com 59 — se for a sua, o corte fica entre a 29 e a 30 mesmo assim).',
      'Risque dos DOIS lados, com o estilete apoiado na régua, na linha ENTRE furos — nunca em cima da fileira de furos.',
      'Apoie a placa na quina da bancada, alinhe o risco com a quina e quebre com um movimento firme.',
      'Do pedaço de 34 × 29, essa é a PI-2. Do outro, corte um retângulo de 22 × 22: essa é a PI-1.',
      'Passe a lixa nas bordas cortadas até ficarem retas. Guarde as sobras — são o corpo das placas dos DUTs.',
    ],
    confira: 'PI-2 com 34 × 29 furos, PI-1 com 22 × 22, e sobra guardada.',
    seErrar: 'Cortou torto ou lascou: a placa ainda serve se as fileiras inteiras sobraram. Se quebrou uma fileira de furos, use o lado bom para a PI-2, que é a mais cheia.',
  },
  {
    id: 'A-02', fase: 'A', titulo: 'Conferir os módulos comprados, um por um', tempo: '20 min',
    pegue: ['multímetro', 'os 2 BTS7960', 'os 2 módulos de relé', 'o KA1 e o KA2', 'lupa ou celular com zoom'],
    antes: 'As compras chegaram. Faça isto ANTES de montar qualquer coisa — devolução tem prazo.',
    faca: [
      '⭐ Nos módulos de relé: confirme "5VDC" escrito no corpo do relé. O mesmo anúncio vende 12 e 24 V.',
      '⭐ Ponha o jumper dos dois módulos em H (nível alto aciona). Em L a lógica inverte e o firmware vira armadilha.',
      'No KA2: multímetro em TESTE DE DIODO entre A1 e A2. Anote se conduz num sentido só — se conduzir, ele já tem roda-livre interno e o D1 do passo C-07 é dispensável.',
      'No KA1 e no KA2: confirme "24VDC" na bobina e o contato declarado em CORRENTE CONTÍNUA.',
      'Nos BTS7960: confirme que há barra de pinos com R_EN, L_EN, R_IS, L_IS, VCC e GND.',
    ],
    confira: 'Todos os relés com a tensão certa no corpo, os dois jumpers em H, e uma anotação dizendo se o KA2 tem ou não diodo interno.',
    seErrar: 'Relé de tensão errada não tem conserto na montagem: a bobina de 12 V queima em 24 V, e a de 24 V não atraca em 12 V. Troque com o vendedor.',
  },
  {
    id: 'A-03', fase: 'A', titulo: 'Soldar os pull-downs nos dois BTS7960', tempo: '15 min',
    pegue: ['2 resistores de 10 kΩ', 'ferro de solda', 'estanho', 'termorretrátil Ø 2 mm', 'multímetro'],
    antes: 'Passo A-02 feito. Os módulos DESENERGIZADOS e fora do painel.',
    discretos: ['BTS1-R8', 'BTS2-R9'],
    faca: [
      'Corte as pernas do resistor deixando ~8 mm de cada lado.',
      'Solde pelo lado de BAIXO do módulo, ligando o pad do R_EN ao pad do GND. Pernas curtas e rentes à placa.',
      'Cubra com termorretrátil ou uma gota de verniz.',
      '📷 Fotografe os dois — resistor invisível embaixo de um módulo é armadilha para a manutenção, e a foto vale ponto no relatório.',
    ],
    confira: 'Ohmímetro entre R_EN e GND de cada módulo: ~10 kΩ.',
    seErrar: 'Soldou no pad errado (R_IS em vez de R_EN, por exemplo): dessolde e refaça. Um pull-down no pino errado não protege nada e ainda atrapalha a leitura de corrente.',
  },
  {
    id: 'A-04', fase: 'A', titulo: 'Montar a iluminação dos 4 postes', tempo: '40 min',
    pegue: ['4 LEDs brancos 3 mm', '4 resistores de 220 Ω', 'termorretrátil', 'ferro de solda', 'fio 0,25 mm²'],
    antes: 'Os postes da maquete prontos (Doc 11). Cada poste tem um furo para o fio descer.',
    discretos: ['POSTE-R', 'POSTE-LED'],
    faca: [
      'Identifique a perna LONGA do LED (ânodo, +) antes de cortar qualquer coisa.',
      'Solde o resistor de 220 Ω na perna longa e isole com termorretrátil.',
      'Passe os dois fios por dentro do poste até a base.',
      'Monte a emenda dentro da base do poste — nunca solta no meio do fio.',
    ],
    confira: 'Ligando 5 V na bancada, o LED acende. Medindo sobre o resistor: ~1,9 V.',
    seErrar: 'Não acendeu: inverta o LED antes de suspeitar do resistor. LED invertido não queima, só não acende.',
  },
  {
    id: 'A-05', fase: 'A', titulo: 'Montar o diodo nas ventoinhas do radiador', tempo: '10 min',
    pegue: ['1 diodo 1N4007', 'ferro de solda', 'termorretrátil', 'multímetro'],
    antes: 'As ventoinhas do lado quente já escolhidas (3 fios, com tacômetro).',
    discretos: ['VENT-D2'],
    faca: [
      'Localize a faixa prateada do diodo: ela é o catodo, e vai no fio VERMELHO (+12 V).',
      'Solde o diodo em antiparalelo, direto nos terminais da ventoinha.',
      'Isole com termorretrátil — este componente vive perto do dissipador quente.',
    ],
    confira: 'Teste de diodo entre os terminais da ventoinha desconectada: conduz num sentido só.',
    seErrar: 'Invertido, ele curto-circuita os 12 V assim que a ventoinha liga, e o fusível F3 desarma. Confira a faixa antes de energizar.',
  },
  {
    id: 'A-06', fase: 'A', titulo: 'Montar a placa simuladora da posição 1', tempo: '25 min',
    pegue: ['1 placa ilhada pequena', '1 LED vermelho', '1 resistor 1,2 kΩ ½ W', '1 micro-chave ou barra de 2 pinos', 'ferro de solda'],
    antes: 'Passo A-01 (sobras de placa servem aqui).',
    discretos: ['DUT1-R', 'DUT1-LED', 'DUT1-J'],
    faca: [
      'Monte em série: +24 V → resistor → ânodo do LED → catodo → retorno.',
      'Ponha a micro-chave (ou o jumper) no caminho, para poder abrir o circuito na apresentação.',
      'Etiquete a placa como POSIÇÃO 1 — as duas são parecidas e têm resistores diferentes.',
    ],
    confira: 'Ligando 24 V na bancada: LED aceso e amperímetro em série marcando 17,6 mA ± 1 mA.',
    seErrar: 'Corrente muito diferente de 17,6 mA: é o resistor errado. O de 2,2 kΩ é da posição 2, e dá 9,8 mA.',
  },
  {
    id: 'A-07', fase: 'A', titulo: 'Montar a placa simuladora da posição 2', tempo: '25 min',
    pegue: ['1 placa ilhada pequena', '1 LED verde', '1 resistor 2,2 kΩ ½ W', '1 micro-chave', 'ferro de solda'],
    antes: 'Passo A-06 — faça igual, trocando LED e resistor.',
    discretos: ['DUT2-R', 'DUT2-LED', 'DUT2-J'],
    faca: [
      'Mesma montagem da posição 1, com LED verde e resistor de 2,2 kΩ.',
      'Etiquete como POSIÇÃO 2.',
    ],
    confira: '9,8 mA ± 1 mA — e o valor TEM que ser diferente do da posição 1: é isso que prova que cada posição é comparada com o normal dela.',
    seErrar: 'Se as duas derem a mesma corrente, os resistores foram trocados. Meça cada um antes de soldar.',
  },

  /* ═══ FASE B · AS DUAS PLACAS ════════════════════════════════════ */
  {
    id: 'B-01', fase: 'B', titulo: 'PI-1: o barramento de 0 V', tempo: '15 min',
    pegue: ['fio de cobre NU', 'ferro de solda', 'alicate de bico'],
    antes: 'Passo A-01. Placa cortada e lixada.',
    faca: [
      'Estique o fio nu na fileira 10, da coluna 2 até a 32.',
      'Solde furo a furo, mantendo o fio esticado e reto.',
      '⭐ Solde ESTE primeiro: é a referência de todo o resto e o único condutor nu da placa.',
    ],
    confira: 'Continuidade entre as duas pontas do barramento, e nenhuma solda encostando na fileira vizinha.',
    seErrar: 'Fio frouxo encosta em furos de outras fileiras. Dessolde, estique e refaça — é mais rápido que caçar o curto depois.',
  },
  {
    id: 'B-02', fase: 'B', titulo: 'PI-1: os dois bornes J1 e J2', tempo: '20 min',
    pegue: ['bornes KF301 passo 5,08 mm', 'ferro de solda'],
    antes: 'Passo B-01.',
    faca: [
      '⚠️ Confirme o passo do borne: 5,08 mm = exatamente 2 furos. Os de 5,00 mm não encaixam.',
      'J1 (11 vias, ENTRADAS) na fileira 2; J2 (8 vias, SAÍDAS) na fileira 28.',
      'Solde primeiro os dois pinos das pontas, confira se o corpo está reto e só então solde o resto.',
    ],
    confira: 'Os bornes assentados na placa, sem folga, e as vias caindo em colunas pares.',
    seErrar: 'Borne torto solda torto e não aceita o fio. Reaqueça um pino de cada vez, empurrando o corpo.',
  },
  {
    id: 'B-04', fase: 'B', titulo: 'PI-1: os três resistores', tempo: '20 min',
    pegue: ['R3 4,7 kΩ', 'R1 22 kΩ', 'R2 4,7 kΩ', 'ferro de solda', 'multímetro'],
    antes: 'Passo B-02.',
    discretos: ['PI1-R3', 'PI1-R1', 'PI1-R2'],
    faca: [
      '⚠️ MEÇA cada resistor antes de soldar. Faixa colorida se lê errado com facilidade, e o 22 kΩ e o 4,7 kΩ vão em circuitos diferentes.',
      'Monte deitados, uma perna por furo — nunca duas pernas no mesmo furo.',
      'Corte as sobras rentes depois de soldar.',
    ],
    confira: 'Ohmímetro nos pares de furos: 22 kΩ e 4,7 kΩ onde devem estar.',
    seErrar: 'Trocar o R1 pelo R2 muda a conta do divisor: chegariam ~19 V no pino D25 e a entrada do Arduino morre na primeira energização.',
  },
  {
    id: 'B-05', fase: 'B', titulo: 'PI-1: os três capacitores', tempo: '15 min',
    pegue: ['3 capacitores 100 nF (marcados 104)', 'ferro de solda'],
    antes: 'Passo B-04.',
    discretos: ['PI1-C1', 'PI1-C2', 'PI1-C3'],
    faca: [
      'Cerâmico de 100 nF NÃO tem polaridade — pode entrar em qualquer sentido.',
      'Uma perna no nó do sinal, a outra no barramento de 0 V.',
    ],
    confira: 'Nenhum curto entre o barramento de 0 V e os nós de sinal (ohmímetro: resistência alta, não zero).',
    seErrar: 'Se der zero ohm para o 0 V, uma perna caiu no furo errado ou há solda escorrida entre fileiras.',
  },
  {
    id: 'B-06', fase: 'B', titulo: 'PI-1: as pontes de nó e os 10 jumpers', tempo: '35 min',
    pegue: ['fio nu curto', 'fio isolado 0,25 mm²', 'ferro de solda', 'a lista de jumpers do aplicativo'],
    antes: 'Passos B-04 e B-05.',
    faca: [
      'Primeiro as pontes de nó (fio NU e curto), onde três ou quatro pernas se encontram.',
      'Depois os 10 jumpers, por baixo, com fio ISOLADO — ele pode cruzar por cima do barramento sem problema.',
      'Vá marcando cada jumper como soldado na tela da PI-1: são 10, e perder a conta é o normal.',
    ],
    confira: 'Os 10 jumpers marcados, e nenhum fio isolado passando por cima de solda quente sem proteção.',
    seErrar: 'Jumper faltando é o defeito mais comum da placa. A tela da PI-1 mostra quais faltam.',
  },
  {
    id: 'B-07', fase: 'B', titulo: 'PI-1: teste de continuidade COM O CI FORA', tempo: '30 min',
    pegue: ['multímetro em continuidade', 'a lista de ligações'],
    antes: 'Passo B-06.',
    faca: [
      'Confira cada via do borne contra o ponto onde ela deveria chegar.',
      'Confira que nenhum par de vias vizinhas apita entre si.',
      '⚠️ Este é o último momento em que um erro custa 5 minutos em vez de um componente.',
    ],
    confira: 'Todas as ligações da lista apitando, e nenhum curto entre vias vizinhas ou para o 0 V.',
    seErrar: 'Curto entre o 24 V e o 0 V: procure solda escorrida entre fileiras vizinhas, olhando contra a luz.',
  },
  {
    id: 'B-09', fase: 'B', titulo: 'PI-2: barramento, bornes e barras de pinos', tempo: '45 min',
    pegue: ['o outro pedaço da placa', 'bornes KF301', 'barras de pinos fêmea', 'ferro de solda'],
    antes: 'Passo A-01.',
    faca: [
      'Mesma sequência da PI-1: barramento de 0 V (fileira 11) primeiro, depois os bornes J1, J2 e J3.',
      '⭐ Solde as BARRAS DE PINOS fêmea, não os módulos: o mux e o INA219 entram e saem depois.',
    ],
    confira: 'Barras alinhadas — encaixe o módulo a seco para conferir antes de soldar tudo.',
    seErrar: 'Barra torta não aceita o módulo. Solde um pino de cada ponta, confira o encaixe e só então complete.',
  },
  {
    id: 'B-10', fase: 'B', titulo: 'PI-2: os dois shunts de 47 Ω', tempo: '15 min',
    pegue: ['2 resistores 47 Ω 1 %', 'ferro de solda', 'multímetro'],
    antes: 'Passo B-09.',
    discretos: ['PI2-R1', 'PI2-R2'],
    faca: [
      '⚠️ Use os de 1 % de tolerância: a medição de corrente é tão boa quanto o shunt.',
      'Monte EM PÉ, entre o nó de retorno e o barramento de 0 V.',
    ],
    confira: 'Ohmímetro: 47 Ω ± 1 Ω em cada um, do nó de retorno ao 0 V.',
    seErrar: 'Shunt de valor errado desloca todas as leituras de corrente daquela posição.',
  },
  {
    id: 'B-11', fase: 'B', titulo: 'PI-2: encaixar o mux e o INA219', tempo: '5 min',
    pegue: ['CD74HC4067', 'INA219 (GY-219)'],
    antes: 'Passo B-10.',
    faca: [
      'Encaixe os dois nas barras, conferindo a orientação pelo silk da placa.',
      'Confirme se o INA219 veio com borne de parafuso para VIN+/VIN− ou com furos.',
    ],
    confira: 'Módulos assentados, sem pino fora da barra.',
    seErrar: 'Módulo invertido na barra pode alimentar o chip ao contrário. Confira VCC e GND antes de energizar.',
  },

  /* ═══ FASE C · PAINEL E FIAÇÃO ═══════════════════════════════════
     Os passos de fiação são gerados dos dados (veja PASSOS_FIACAO). Aqui
     ficam só o que vem antes e os componentes que se penduram em borne. */
  {
    id: 'C-00', fase: 'C', titulo: 'Fixar os trilhos, canaletas e componentes', tempo: '3 h',
    pegue: ['painel', 'trilhos DIN', 'canaletas', 'parafusos', 'furadeira', 'o layout do aplicativo'],
    antes: 'Fases A e B concluídas. Painel vazio e desenergizado.',
    faca: [
      'Fure o backplate conforme o layout, monte os 3 trilhos e as canaletas.',
      'Encaixe cada componente no seu trilho, na posição do desenho — a aba "Dentro do painel" mostra em escala real.',
      'Monte a porta: botoeiras, sinaleiros e a IHM.',
      'NÃO passe fio nenhum ainda.',
    ],
    confira: 'Todo componente no lugar do desenho, e a porta fechando sem encostar em nada.',
    seErrar: 'Componente fora de posição obriga a refazer rota de fio depois. Confira contra o desenho antes de seguir.',
  },
  {
    id: 'C-07', fase: 'C', titulo: 'O diodo de roda-livre na bobina do KA2', tempo: '5 min',
    pegue: ['1 diodo 1N4007', 'chave de fenda 3 mm', 'alicate de bico', 'multímetro'],
    antes: 'Etapa 2 da fiação concluída, painel DESENERGIZADO. E a anotação do passo A-02: se o KA2 já tem diodo interno, este passo é dispensável.',
    discretos: ['KA2-D1'],
    faca: [
      'Dobre as pernas do diodo em U, com ~25 mm entre as pontas.',
      'Faixa prateada (catodo) no parafuso A1 — o A1 é o positivo.',
      'A outra perna no A2. Aperte os dois parafusos junto com os fios que já estão lá.',
      'Puxe cada perna de leve para conferir o aperto.',
    ],
    confira: 'Teste de diodo entre A1 e A2: ~0,55 V com a ponta vermelha no A2, e nada invertendo as pontas.',
    seErrar: 'Invertido, o fusível F2 desarma no primeiro START. Não queima nada — mas o sintoma engana.',
  },
  {
    id: 'C-08', fase: 'C', titulo: 'Os pull-downs nos gatilhos do KA3 e do KA4', tempo: '10 min',
    pegue: ['2 resistores de 10 kΩ', 'chave de fenda pequena', 'multímetro'],
    antes: 'Etapa 4 da fiação (os sinais do Arduino) concluída.',
    discretos: ['KA3-R10', 'KA4-R11'],
    faca: [
      'Dobre as pernas em U, medindo a distância entre os bornes IN e 0 V do módulo.',
      'Aperte uma perna no IN e a outra no 0 V, junto com o fio que já está no borne.',
      'Repita no segundo módulo.',
    ],
    confira: 'Ohmímetro entre cada IN e o 0 V: ~10 kΩ. Com o painel energizado e o Arduino desligado, cada IN medindo ~0 V.',
    seErrar: 'Sem eles, um módulo pode fechar por ruído: o KA3 armaria a potência sem comando, e o KA4 pararia a ventoinha sem comando.',
  },

  /* ═══ FASE D · ENERGIZAÇÃO ═══════════════════════════════════════ */
  {
    id: 'D-01', fase: 'D', titulo: 'Inspeção final a frio', tempo: '1 h',
    pegue: ['multímetro', 'a lista de fios', 'lanterna'],
    antes: 'Toda a fiação concluída. Disjuntor Q0 DESLIGADO e travado.',
    faca: [
      'Confira aperto de todos os bornes — puxando o fio, não olhando.',
      'Meça isolação entre 24 V e 0 V: tem que dar alta resistência, nunca zero.',
      'Confira que as duas placas de interface NÃO estão encaixadas ainda.',
    ],
    confira: 'Nenhum curto entre barramentos, e nenhum fio solto ao puxar.',
    seErrar: 'Um curto encontrado aqui custa minutos. O mesmo curto encontrado energizado custa a fonte.',
  },
  {
    id: 'D-02', fase: 'D', titulo: 'Energizar por trechos e medir cada nível', tempo: '1 h',
    pegue: ['multímetro', 'os fusíveis F1, F2 e F3'],
    antes: 'Passo D-01 aprovado.',
    faca: [
      'Energize só a fonte de 24 V, com os três fusíveis de ramal ainda FORA. Meça 24 V na saída.',
      'Ponha o F2 e ajuste o LM2596 de 5 V com o multímetro ANTES de ligar qualquer eletrônica: 5,10 V.',
      'Ponha o F3 e ajuste o LM2596 de 12 V: 12,0 V.',
      '⭐ Só depois de os dois estarem ajustados é que o Arduino, o ESP32 e as placas entram.',
      'Ponha o F1 (potência) por último.',
    ],
    confira: '5,10 V e 12,0 V medidos com carga, e 24 V no BD-24V.',
    seErrar: 'Ligar a eletrônica antes de ajustar o buck é o jeito mais rápido de queimar o Arduino: o módulo sai de fábrica em qualquer tensão.',
  },

  /* ═══ FASE E · ENSAIOS ═══════════════════════════════════════════ */
  {
    id: 'E-01', fase: 'E', titulo: 'Os 10 ensaios de segurança', tempo: '1 h',
    pegue: ['multímetro', 'o Doc 31 aberto'],
    antes: 'Fase D concluída, firmware gravado.',
    faca: [
      'Emergência: socar o cogumelo derruba a potência, e soltar NÃO religa — só o rearme azul religa.',
      'STOP: derruba o KA2, e só o verde religa.',
      'Arduino desligado: a potência não arma nem apertando o verde.',
      '⭐ Arduino desligado: as ventoinhas do radiador GIRAM.',
    ],
    confira: 'Os 10 ensaios do Doc 31 passando, um a um, com a resposta esperada.',
    seErrar: 'Qualquer ensaio de segurança reprovado para a montagem: não siga para os ensaios de desempenho antes de resolver.',
  },
  {
    id: 'E-02', fase: 'E', titulo: 'Ensaios de desempenho para o relatório', tempo: '4 h',
    pegue: ['cronômetro', 'planilha', 'multímetro', 'a câmara fechada'],
    antes: 'Passo E-01 aprovado.',
    faca: [
      'Curva de resfriamento (pull-down) com a câmara vazia e fechada.',
      'Resposta do PID a um degrau de setpoint.',
      'Validação da carga térmica calculada.',
      '⭐ Demonstração de falha: abrir o jumper de uma posição e cronometrar o alarme (deve ser < 2 s).',
    ],
    confira: 'As curvas registradas e os números batendo com o calculado dentro da margem — ou a divergência explicada.',
    seErrar: 'Divergência entre o calculado e o medido não é reprovação: é resultado. O que reprova é não medir.',
  },
];

/* ── os passos de fiação, gerados dos dados ──────────────────────────
 * Cada etapa da fiação vira UM passo, com a lista dos seus fios. Fio
 * novo no `fiacao.js` aparece aqui sem ninguém escrever nada.
 */
const ETAPAS = [
  { n: 1, titulo: 'As entradas: o que vem dos postes', tempo: '1 h',
    diz: 'Os cabos que entram pelos prensa-cabos da base e morrem nos blocos de distribuição.' },
  { n: 2, titulo: 'O comando: emergência, START, STOP e os dois selos', tempo: '2 h',
    diz: '⭐ É a etapa da segurança. Erro aqui não aparece na bancada — aparece no dia da apresentação.' },
  { n: 3, titulo: 'A porta: botoeiras e sinaleiros', tempo: '1 h 30',
    diz: 'Tudo que atravessa a dobradiça. Deixe folga: a porta abre e fecha.' },
  { n: 4, titulo: 'Os sinais do Arduino', tempo: '2 h',
    diz: '⚠️ Fio de sinal NUNCA na canaleta de potência — o PWM dos BTS induz ruído nele.' },
  { n: 5, titulo: 'A alimentação da eletrônica', tempo: '1 h',
    diz: '5 V e 12 V para o Arduino, o ESP32, a IHM e as placas.' },
  { n: 6, titulo: 'As saídas para a câmara', tempo: '1 h 30',
    diz: 'Os 21 fios que saem pelos dois prensa-cabos e chegam nos bornes de dentro da câmara.' },
];

export const PASSOS_FIACAO = ETAPAS.map(e => {
  const fios = FIOS.filter(f => f.etapa === e.n);
  return {
    id: `C-0${e.n}`, fase: 'C', titulo: `Fiação · etapa ${e.n} — ${e.titulo}`, tempo: e.tempo,
    pegue: ['fio nas bitolas da lista', 'anilhas numeradas', 'alicate de crimpar terminais',
            'chave de fenda', 'a lista de fios ao lado'],
    antes: e.n === 1 ? 'Passo C-00. Painel montado e DESENERGIZADO.'
                     : `Etapa ${e.n - 1} concluída e conferida.`,
    diz: e.diz,
    fios,
    faca: [
      'Corte o fio com folga para a rota, nunca esticado entre dois pontos.',
      'Descasque 8 mm, ponha a anilha ANTES de crimpar o terminal.',
      'Passe pela canaleta indicada na lista — a cor do fio diz a função, a anilha diz qual fio é.',
      'Aperte nos dois bornes e puxe para conferir.',
    ],
    confira: `Os ${fios.length} fios da etapa com as duas pontas apertadas, anilhados e dentro da `
           + 'canaleta certa. Continuidade ponta a ponta em cada um.',
    seErrar: 'Fio de sinal na canaleta de potência é o erro que não aparece agora: ele volta como '
           + 'leitura instável quando a Peltier liga.',
  };
});

/** Todos os passos, na ordem de montagem. */
export const TODOS = [...PASSOS, ...PASSOS_FIACAO]
  .sort((a, b) => a.id.localeCompare(b.id, 'pt'));

/** Os componentes que entram num passo. */
export const discretosDo = passo =>
  (passo.discretos ?? []).map(id => DISCRETOS.find(d => d.id === id)).filter(Boolean);

export const CORES_FIO = CORES;
