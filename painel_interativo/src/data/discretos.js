/**
 * OS COMPONENTES DISCRETOS DO PROJETO INTEIRO — CADASTRO ÚNICO
 * ============================================================
 *
 * ⭐ POR QUE ESTE ARQUIVO EXISTE. Até aqui, "componente discreto" não era
 *    um tipo de coisa no modelo: só existiam FIO e BORNE. Cada resistor
 *    acabou encaixado à força num lugar diferente — os da PI-1 viraram
 *    peça de placa, os dos relés viraram um segundo cadastro, o D1 foi
 *    declarado DUAS vezes (uma delas fingindo ser um fio, o C12), e os
 *    que ficam longe do painel (R8, R9, R4–R7, D2, os DUTs) não existiam
 *    em cadastro nenhum: só em parágrafos de documento.
 *
 *    Parágrafo não é desenhado, não é validado e não vira passo de
 *    montagem. Por isso todos eles moram aqui agora, no mesmo formato.
 *
 * ⚠️ ESTE ARQUIVO NÃO TEM GEOMETRIA. Onde a perna entra em qual FURO
 *    continua em `pi1_fisico.js` e `pi2_fisico.js` — é lá que o desenho
 *    da placa nasce. Aqui mora o que vale para TODO componente, esteja
 *    ele numa placa, num parafuso de relé ou dentro de um poste:
 *    o que é, onde vive, como liga, por que existe e o que se mede para
 *    provar que ficou certo.
 *
 * O `valida_discretos.mjs` confere que os dois lados concordam.
 */

/* ══════════════════════════════════════════════════════════════════════
   HOSTS — os lugares onde componente discreto pode morar
   ════════════════════════════════════════════════════════════════════
   `compPainel` liga o host a um componente do `painel_completo.js`, e é
   isso que deixa o validador conferir se o parafuso citado existe de
   verdade. Host sem `compPainel` fica FORA do painel — aí os terminais
   são declarados aqui mesmo, porque não há outro lugar que os conheça. */
export const HOSTS = [
  {
    id: 'PI1', tipo: 'placa', nome: 'Placa PI-1',
    onde: 'caixa modular DIN de 6M, trilho 3, ao lado do Arduino',
    compPainel: 'PI1', geometria: 'pi1_fisico.js',
    diz: 'Placa ilhada: nenhum furo vem ligado de fábrica. Toda ligação é uma '
       + 'perna de componente ou um fio que você solda.',
  },
  {
    id: 'PI2', tipo: 'placa', nome: 'Placa PI-2',
    onde: 'mesma caixa DIN da PI-1',
    compPainel: 'PI-2', geometria: 'pi2_fisico.js',
    diz: 'O outro pedaço da mesma placa de 9 × 15 cm.',
  },
  {
    id: 'KA2', tipo: 'borne', nome: 'Base PTF08A do KA2',
    onde: 'trilho 1 do painel', compPainel: 'KA2',
    diz: 'Componente parafusado direto no borne da base, sem placa nenhuma. '
       + 'Dobre as pernas em U e aperte cada uma no seu parafuso.',
  },
  {
    id: 'KA34', tipo: 'borne', nome: 'Bornes dos módulos KA3 e KA4',
    onde: 'caixa DIN de 4M, trilho 2', compPainel: 'KA34',
    diz: 'Os dois módulos dividem a mesma caixa. Os resistores entram nos '
       + 'bornes de parafuso do próprio módulo.',
  },
  {
    id: 'BTS1', tipo: 'modulo', nome: 'Driver BTS7960 #1 (Peltier)',
    onde: 'trilho 2 do painel, sobre dissipador', compPainel: 'BTS1',
    diz: '⚠️ O componente é soldado POR BAIXO do módulo comprado — fica '
       + 'invisível depois de montado. Fotografe antes de fechar.',
  },
  {
    id: 'BTS2', tipo: 'modulo', nome: 'Driver BTS7960 #2 (PTC)',
    onde: 'trilho 2 do painel', compPainel: 'BTS2',
    diz: 'Idem ao BTS #1.',
  },
  {
    id: 'POSTE-IL', tipo: 'maquete', nome: 'Base do poste de iluminação',
    onde: 'maquete — 3 postes da rua + 1 na guarita',
    terminais: ['+5V', '0V', 'LED+', 'LED−'],
    diz: 'Componente escondido dentro da base do poste, com termorretrátil. '
       + 'Alimentado pelo BD-5V saída O7, sempre aceso.',
  },
  {
    id: 'VENT-RAD', tipo: 'camara', nome: 'Ventoinhas do radiador (lado quente)',
    onde: 'fora da câmara, no dissipador quente das Peltier',
    terminais: ['+12V', '0V'],
    diz: 'O diodo vai junto das ventoinhas, e não no painel: o pico tem que '
       + 'ser grampeado onde ele nasce.',
  },
  {
    id: 'DUT1', tipo: 'camara', nome: 'Placa simuladora — posição de ensaio 1',
    onde: 'dentro da câmara, posição 1',
    terminais: ['+24V', 'RET-1'],
    diz: 'Consome uma corrente conhecida (17,6 mA) para o sistema perceber '
       + 'quando ela some.',
  },
  {
    id: 'DUT2', tipo: 'camara', nome: 'Placa simuladora — posição de ensaio 2',
    onde: 'dentro da câmara, posição 2',
    terminais: ['+24V', 'RET-2'],
    diz: 'Mesma ideia da posição 1, com corrente PROPOSITALMENTE diferente '
       + '(9,8 mA): é o que prova que cada posição é comparada com o normal dela.',
  },
];

/* ══════════════════════════════════════════════════════════════════════
   ARRANJOS — como o componente entra no circuito
   ════════════════════════════════════════════════════════════════════
   Esta é a pergunta que mais confunde quem nunca mexeu com eletrônica,
   então ela virou campo obrigatório. */
export const ARRANJOS = {
  serie: {
    nome: 'em série',
    diz: 'A corrente ATRAVESSA o componente. Se ele sair, o circuito abre.',
  },
  paralelo: {
    nome: 'em paralelo',
    diz: 'Ele fica DE LADO, entre dois pontos que já se ligam por fio. Se ele '
       + 'sair, o circuito continua fechado — só perde a função dele.',
  },
  antiparalelo: {
    nome: 'em antiparalelo',
    diz: 'Em paralelo, mas com polaridade invertida em relação à tensão normal: '
       + 'no dia a dia ele não conduz nada, e só entra em ação no pico.',
  },
  derivacao: {
    nome: 'em derivação para o 0 V',
    diz: 'Uma perna encosta no caminho do sinal, a outra desce para o 0 V. O '
       + 'sinal NÃO passa por dentro dele.',
  },
};

/* ══════════════════════════════════════════════════════════════════════
   OS COMPONENTES
   ════════════════════════════════════════════════════════════════════
   Campos obrigatórios (o validador cobra):
     id · ref · peca · tipo · host · arranjo · pernas · papel · porque · ensaio · passo
   E, quando `polaridade: true`:  comoIdentificar · seInverter

   `pernas[].vai` aponta para { comp, via } — o mesmo par que a fiação usa,
   para que o validador possa conferir se o parafuso existe de verdade. */
export const DISCRETOS = [

  /* ───────────────────────── PLACA PI-1 ───────────────────────── */
  {
    id: 'PI1-C1', ref: 'C1', peca: 'Capacitor cerâmico 100 nF (marcado 104)',
    tipo: 'capacitor', valor: '100 nF', qtd: 1, host: 'PI1', arranjo: 'derivacao', polaridade: false,
    pernas: [
      { nome: 'perna 1', vai: { comp: 'PI1', via: 'nó A0' } },
      { nome: 'perna 2', vai: { comp: 'PI1', via: 'barramento 0V' } },
    ],
    papel: 'Filtra o ruído que o cabo do BTS #1 pegou no caminho até o Arduino',
    porque: 'O sinal IS sai limpo do driver e percorre 30 cm dentro de um painel que '
          + 'chaveia corrente. Sem o filtro, a leitura de A0 oscila e o firmware dispara '
          + 'alarme de falha com o sistema funcionando bem.',
    seFaltar: 'A leitura de A0 pula dezenas de contagens e o diagnóstico de corrente vira ruído.',
    ensaio: 'Sistema energizado e em repouso: A0 estável dentro de ±2 contagens de A/D.',
    passo: 'B-05', fonte: 'Doc 33 §33.2',
  },
  {
    id: 'PI1-C2', ref: 'C2', peca: 'Capacitor cerâmico 100 nF (marcado 104)',
    tipo: 'capacitor', valor: '100 nF', qtd: 1, host: 'PI1', arranjo: 'derivacao', polaridade: false,
    pernas: [
      { nome: 'perna 1', vai: { comp: 'PI1', via: 'nó A1' } },
      { nome: 'perna 2', vai: { comp: 'PI1', via: 'barramento 0V' } },
    ],
    papel: 'O mesmo do C1, para o BTS #2',
    porque: 'Mesma razão do C1 — o cabo é outro, o problema é igual.',
    seFaltar: 'A leitura de A1 fica instável.',
    ensaio: 'A1 estável dentro de ±2 contagens de A/D com o sistema em repouso.',
    passo: 'B-05', fonte: 'Doc 33 §33.2',
  },
  {
    id: 'PI1-R1', ref: 'R1', peca: 'Resistor 22 kΩ · ¼ W',
    tipo: 'resistor', valor: '22 kΩ', qtd: 1, host: 'PI1', arranjo: 'serie', polaridade: false,
    pernas: [
      { nome: 'perna 1', vai: { comp: 'PI1', via: 'J1-11' } },
      { nome: 'perna 2', vai: { comp: 'PI1', via: 'nó D25' } },
    ],
    papel: 'Braço de cima do divisor que mede o barramento de potência',
    porque: 'O pino D25 aguenta 5 V e o barramento tem 24 V. O divisor entrega 4,22 V — '
          + 'é o TP do Arduino, mesma função do transformador de potencial de uma subestação.',
    seFaltar: '⚠️ Ligar o D25 direto nos 24 V destrói a entrada do Arduino.',
    ensaio: 'Com o KA2 fechado, medir o nó D25 contra o 0 V → 4,2 V ± 0,3 V. Com a emergência '
          + 'acionada → 0 V.',
    passo: 'B-04', fonte: 'Doc 33 §33.2',
  },
  {
    id: 'PI1-R2', ref: 'R2', peca: 'Resistor 4,7 kΩ · ¼ W',
    tipo: 'resistor', valor: '4,7 kΩ', qtd: 1, host: 'PI1', arranjo: 'serie', polaridade: false,
    pernas: [
      { nome: 'perna 1', vai: { comp: 'PI1', via: 'nó D25' } },
      { nome: 'perna 2', vai: { comp: 'PI1', via: 'barramento 0V' } },
    ],
    papel: 'Braço de baixo do divisor — 24 × 4,7/26,7 = 4,22 V',
    porque: 'É a razão entre os dois resistores que define a tensão lida. Trocar um deles '
          + 'muda a escala inteira da medição.',
    seFaltar: 'Sem o braço de baixo, o D25 vai a 24 V e a entrada queima.',
    ensaio: 'Ohmímetro com a placa fora do circuito: 4,7 kΩ entre o nó D25 e o 0 V.',
    passo: 'B-04', fonte: 'Doc 33 §33.2',
  },
  {
    id: 'PI1-C3', ref: 'C3', peca: 'Capacitor cerâmico 100 nF (marcado 104)',
    tipo: 'capacitor', valor: '100 nF', qtd: 1, host: 'PI1', arranjo: 'derivacao', polaridade: false,
    pernas: [
      { nome: 'perna 1', vai: { comp: 'PI1', via: 'nó D25' } },
      { nome: 'perna 2', vai: { comp: 'PI1', via: 'barramento 0V' } },
    ],
    papel: 'Segura o nó do divisor, que é de alta impedância e capta ruído',
    porque: 'Sem ele o pino pode oscilar entre HIGH e LOW e o firmware enxergar a potência '
          + '"piscando". Custa centavos e elimina a classe inteira de problema.',
    seFaltar: 'Leitura de potência intermitente, sem causa aparente.',
    ensaio: 'Junto com o ensaio do divisor: 4,2 V estáveis, sem tremer no multímetro.',
    passo: 'B-05', fonte: 'Doc 33 §33.2',
  },
  {
    id: 'PI1-R3', ref: 'R3', peca: 'Resistor 4,7 kΩ · ¼ W',
    tipo: 'resistor', valor: '4,7 kΩ', qtd: 1, host: 'PI1', arranjo: 'paralelo', polaridade: false,
    pernas: [
      { nome: 'perna 1', vai: { comp: 'PI1', via: 'nó 1-Wire' } },
      { nome: 'perna 2', vai: { comp: 'PI1', via: 'J1-4' } },
    ],
    papel: 'Pull-up do barramento 1-Wire dos DS18B20',
    porque: '⭐ O sensor só sabe PUXAR a linha para 0 V — ele não tem como levantá-la. Quem '
          + 'levanta é este resistor. SEM ele não existe barramento: o sensor não responde, '
          + 'nem com fio perfeito e código perfeito.',
    seFaltar: 'O DS18B20 não responde. Não é leitura instável — é leitura nenhuma.',
    ensaio: 'Ohmímetro entre o D2 e o +5 V → ~4,7 kΩ.',
    passo: 'B-04', fonte: 'Doc 33 §33.2',
  },
  {
    id: 'PI1-CI1', ref: 'CI1', peca: 'ULN2803A em soquete DIP-18',
    tipo: 'ci', valor: 'ULN2803A', qtd: 1, host: 'PI1', arranjo: 'serie', polaridade: true,
    comoIdentificar: '⭐ O chanfro (meia-lua) no corpo do CI marca o lado dos pinos 1 e 18. '
                   + 'Nesta montagem ele fica À DIREITA.',
    seInverter: '🔥 Girado 180°, os 24 V do pino COM entram na entrada de sinal e destroem o '
              + 'chip E o pino do Arduino.',
    pernas: [
      { nome: 'pinos 1–4 (IN1..IN4)', vai: { comp: 'PI1', via: 'J1-5' } },
      { nome: 'pino 9 (GND)',         vai: { comp: 'PI1', via: 'barramento 0V' } },
      { nome: 'pino 10 (COM)',        vai: { comp: 'PI1', via: 'J1-10' } },
      { nome: 'pinos 15–18 (OUT4..OUT1)', vai: { comp: 'PI1', via: 'J2-4' } },
    ],
    papel: 'É o relé de interposição dos sinaleiros: deixa um pino de 5 V acender um sinaleiro '
         + 'industrial de 24 V',
    porque: 'Um pino do Arduino entrega 5 V e 20 mA. O sinaleiro de 24 V precisa de muito mais. '
          + 'O CI não fornece corrente — ele abre o caminho para o 0 V.',
    ensaio: 'Com o CI FORA do soquete, conferir continuidade de todos os jumpers. Só então '
          + 'encaixar, conferindo o chanfro. Depois: forçar cada saída em HIGH → sinaleiro acende.',
    passo: 'B-08', fonte: 'Doc 33 §33.2',
  },

  /* ───────────────────────── PLACA PI-2 ───────────────────────── */
  {
    id: 'PI2-R1', ref: 'R1', peca: 'Resistor 47 Ω · 1 % · ¼ W',
    tipo: 'resistor', valor: '47 Ω 1%', qtd: 1, host: 'PI2', arranjo: 'serie', polaridade: false,
    pernas: [
      { nome: 'perna de cima',  vai: { comp: 'PI2', via: 'nó RET-1' } },
      { nome: 'perna de baixo', vai: { comp: 'PI2', via: 'barramento 0V' } },
    ],
    papel: 'Shunt da posição de ensaio 1 — transforma corrente em tensão',
    porque: 'A corrente do DUT ATRAVESSA este resistor para chegar ao 0 V, e cria sobre ele '
          + '17,6 mA × 47 Ω = 0,83 V, que o multiplexador lê. Sem o shunt não existe nada para medir.',
    seFaltar: 'A posição 1 fica sem retorno: o DUT não acende e a medição não existe.',
    ensaio: 'Com a posição 1 energizada, medir sobre o shunt → ~0,83 V.',
    passo: 'B-10', fonte: 'Doc 33 §33.5 · Doc 13 §13.3b',
    aviso: '⚠️ Esta ref colide com o R1 da PI-1, que é outro componente (22 kΩ). Ver §renomear.',
  },
  {
    id: 'PI2-R2', ref: 'R2', peca: 'Resistor 47 Ω · 1 % · ¼ W',
    tipo: 'resistor', valor: '47 Ω 1%', qtd: 1, host: 'PI2', arranjo: 'serie', polaridade: false,
    pernas: [
      { nome: 'perna de cima',  vai: { comp: 'PI2', via: 'nó RET-2' } },
      { nome: 'perna de baixo', vai: { comp: 'PI2', via: 'barramento 0V' } },
    ],
    papel: 'Shunt da posição de ensaio 2',
    porque: 'Mesmo valor do shunt 1, de propósito: a posição 2 consome menos (9,8 mA) e entrega '
          + '0,46 V. A diferença entre as duas leituras é o que prova que cada posição é comparada '
          + 'com o normal DELA.',
    seFaltar: 'A posição 2 fica sem retorno.',
    ensaio: 'Com a posição 2 energizada, medir sobre o shunt → ~0,46 V.',
    passo: 'B-10', fonte: 'Doc 33 §33.5 · Doc 13 §13.3b',
    aviso: '⚠️ Esta ref colide com o R2 da PI-1, que é outro componente (4,7 kΩ).',
  },

  /* ─────────────────── NOS BORNES DOS RELÉS ──────────────────── */
  {
    id: 'KA2-D1', ref: 'D1', peca: 'Diodo 1N4007',
    tipo: 'diodo', valor: '1N4007', qtd: 1, host: 'KA2', arranjo: 'antiparalelo', polaridade: true,
    comoIdentificar: '⭐ A faixa prateada impressa no corpo marca o CATODO. Ela vai no A1.',
    seInverter: '🔥 Invertido ele curto-circuita a bobina e derruba o fusível F2 (2 A) assim que '
              + 'o KA1 selar. Não queima nada — mas você vai procurar o defeito no lugar errado.',
    pernas: [
      { nome: 'catodo (faixa prateada)', vai: { comp: 'KA2', via: 'A1' } },
      { nome: 'anodo',                   vai: { comp: 'KA2', via: 'A2' } },
    ],
    papel: 'Roda-livre da bobina do KA2',
    porque: 'Quando o contato do KA3 abre, o campo da bobina colapsa e induz centenas de volts. '
          + 'Sem o diodo esse pico aparece NO CONTATO DO KA3 e abre arco — contato que pita acaba '
          + 'soldando, e um KA3 soldado é o veto do firmware perdido em silêncio.',
    seFaltar: 'O contato do KA3 se degrada a cada desligamento e um dia solda fechado.',
    ensaio: 'Multímetro em TESTE DE DIODO entre A1 e A2 → conduz num sentido só (~0,55 V com a '
          + 'ponta vermelha no A2, nada no sentido inverso).',
    antesDeMontar: '🔎 Faça o teste de diodo no KA2 ANTES: se ele já conduzir num sentido só, o relé '
                 + 'tem diodo interno e o D1 é dispensável. Se conduzir nos dois, monte o D1.',
    passo: 'C-07', fonte: 'Doc 31 §31.9',
  },
  {
    id: 'KA3-R10', ref: 'R10', peca: 'Resistor 10 kΩ · ¼ W',
    tipo: 'resistor', valor: '10 kΩ', qtd: 1, host: 'KA34', arranjo: 'paralelo', polaridade: false,
    pernas: [
      { nome: 'perna 1', vai: { comp: 'KA34', via: 'IN3' } },
      { nome: 'perna 2', vai: { comp: 'KA34', via: '0V' } },
    ],
    papel: 'Pull-down do gatilho do KA3 — define o estado com o Arduino ausente',
    porque: 'Fio do D27 rompido ou Arduino desligado → o resistor leva o IN a 0 V → relé aberto → '
          + 'a potência nunca é armada. Ele torna MEDÍVEL o que antes era confiado.',
    seFaltar: '⚠️ O IN fica alto-impedante e o módulo pode fechar por ruído — potência autorizada '
            + 'sem ninguém mandar.',
    ensaio: 'Ohmímetro entre o IN3 e o 0 V → ~10 kΩ. Com o painel energizado e o Arduino desligado, '
          + 'o IN3 deve medir ~0 V.',
    passo: 'C-08', fonte: 'Doc 31 §31.13',
  },
  {
    id: 'KA4-R11', ref: 'R11', peca: 'Resistor 10 kΩ · ¼ W',
    tipo: 'resistor', valor: '10 kΩ', qtd: 1, host: 'KA34', arranjo: 'paralelo', polaridade: false,
    pernas: [
      { nome: 'perna 1', vai: { comp: 'KA34', via: 'IN4' } },
      { nome: 'perna 2', vai: { comp: 'KA34', via: '0V' } },
    ],
    papel: 'Pull-down do gatilho do KA4 — e aqui o resultado é o oposto, de propósito',
    porque: '⭐ O KA4 usa o contato NC: relé solto significa ventoinha do radiador GIRANDO. É o R11 '
          + 'que garante que um Arduino morto ventile.',
    seFaltar: 'A ventoinha do lado quente pode parar sozinha por ruído — e o lado quente sem '
            + 'ventilação leva a Peltier à fuga térmica.',
    ensaio: 'Ohmímetro entre o IN4 e o 0 V → ~10 kΩ. Puxar o fio do D30 com o ensaio rodando: as '
          + 'ventoinhas CONTINUAM girando.',
    passo: 'C-08', fonte: 'Doc 31 §31.14',
  },

  /* ──────────── SOLDADOS NO MÓDULO COMPRADO (BTS7960) ─────────── */
  {
    id: 'BTS1-R8', ref: 'R8', peca: 'Resistor 10 kΩ · ¼ W',
    tipo: 'resistor', valor: '10 kΩ', qtd: 1, host: 'BTS1', arranjo: 'paralelo', polaridade: false,
    pernas: [
      { nome: 'perna 1', vai: { comp: 'BTS1', via: 'R_EN' } },
      { nome: 'perna 2', vai: { comp: 'BTS1', via: 'GND' } },
    ],
    papel: 'Pull-down do R_EN — define o estado seguro do driver de potência',
    porque: '⭐ Fica NO TERMINAL DO DRIVER, e não na PI-1, porque assim ele cobre também o '
          + 'rompimento do cabo: com o Arduino desligado OU com o fio partido, o R_EN vai a 0 V '
          + 'e o driver não pode acordar sozinho. Um pull-down na placa protegeria só o primeiro caso.',
    seFaltar: '🔥 R_EN solto: o driver pode habilitar por ruído e acionar a Peltier sem comando.',
    ensaio: 'Ohmímetro entre R_EN e GND → ~10 kΩ. Com o painel energizado e o Arduino desligado, '
          + 'R_EN medindo ~0 V.',
    montagem: 'Soldar pelo lado de BAIXO do módulo, ligando o pad do R_EN ao pad do GND, pernas '
            + 'curtas e rentes, e cobrir com termorretrátil de Ø 2 mm. Alternativa sem solda: '
            + 'montar o resistor dentro de um alojamento Dupont de 2 vias e encaixar no barra de '
            + 'pinos, com um ponto de cola quente.',
    passo: 'A-03', fonte: 'Doc 33 §33.6',
    aviso: '📷 Fotografe antes de fechar: resistor invisível embaixo de um módulo é armadilha para '
         + 'quem for dar manutenção.',
  },
  {
    id: 'BTS2-R9', ref: 'R9', peca: 'Resistor 10 kΩ · ¼ W',
    tipo: 'resistor', valor: '10 kΩ', qtd: 1, host: 'BTS2', arranjo: 'paralelo', polaridade: false,
    pernas: [
      { nome: 'perna 1', vai: { comp: 'BTS2', via: 'R_EN' } },
      { nome: 'perna 2', vai: { comp: 'BTS2', via: 'GND' } },
    ],
    papel: 'O mesmo do R8, no driver do PTC',
    porque: 'Mesma razão do R8. O R_EN do módulo está ligado ao L_EN, então um resistor cobre os dois.',
    seFaltar: '🔥 O driver do aquecedor pode habilitar sozinho.',
    ensaio: 'Ohmímetro entre R_EN e GND → ~10 kΩ.',
    montagem: 'Idem ao R8.',
    passo: 'A-03', fonte: 'Doc 33 §33.6',
  },

  /* ───────────────── FORA DO PAINEL — MAQUETE ────────────────── */
  {
    id: 'POSTE-R', ref: 'R4–R7', peca: 'Resistor 220 Ω · ¼ W',
    tipo: 'resistor', valor: '220 Ω', qtd: 4, host: 'POSTE-IL', arranjo: 'serie', polaridade: false,
    pernas: [
      { nome: 'perna 1', vai: { comp: 'POSTE-IL', via: '+5V' } },
      { nome: 'perna 2', vai: { comp: 'POSTE-IL', via: 'LED+' } },
    ],
    papel: 'Limita a corrente do LED branco da iluminação pública',
    porque: 'Um LED é um diodo: não tem resistência que limite a própria corrente. Quem escolhe o '
          + 'brilho escolhe o resistor. Com 5 V e Vf ≈ 3,1 V: (5 − 3,1)/220 = 8,6 mA.',
    seFaltar: '🔥 Sem resistor o LED conduz sem limite e queima em segundos.',
    ensaio: 'LED aceso e estável; medir sobre o resistor → ~1,9 V.',
    montagem: 'Dentro da base do poste, com termorretrátil em cada emenda. Nunca solto no fio.',
    passo: 'A-04', fonte: 'Doc 33 §33.2 · Doc 03 M.4',
    aviso: '⚠️ 220 Ω, NÃO 2,2 kΩ. O valor de 2,2 kΩ é da versão antiga, quando estes LEDs eram '
         + 'alimentados em 24 V.',
  },
  {
    id: 'POSTE-LED', ref: 'LED-P', peca: 'LED 3 mm branco quente',
    tipo: 'led', valor: 'Vf ≈ 3,1 V · 8,6 mA', qtd: 4, host: 'POSTE-IL', arranjo: 'serie', polaridade: true,
    comoIdentificar: '⭐ A perna LONGA é o ânodo (+). Do lado do catodo (−) o corpo do LED tem um '
                   + 'chanfro reto — dá para sentir com a unha.',
    seInverter: 'Ele simplesmente não acende. Não queima — mas você vai procurar o defeito no fio.',
    pernas: [
      { nome: 'perna longa (ânodo, +)', vai: { comp: 'POSTE-IL', via: 'LED+' } },
      { nome: 'perna curta (catodo, −)', vai: { comp: 'POSTE-IL', via: '0V' } },
    ],
    papel: 'Iluminação pública da maquete — 3 luminárias da rua e 1 na guarita',
    porque: 'Cenografia que também prova o ramal de 5 V funcionando: se um poste apaga, o BD-5V '
          + 'tem problema.',
    seFaltar: '—',
    ensaio: 'Com o BD-5V energizado, os 4 acendem juntos e continuam acesos na emergência (eles '
          + 'são alimentados pelo permanente).',
    passo: 'A-04', fonte: 'Doc 03 M.4 · Doc 30 fio 54b',
  },

  /* ───────────────── FORA DO PAINEL — CÂMARA ─────────────────── */
  {
    id: 'VENT-D2', ref: 'D2', peca: 'Diodo 1N4007',
    tipo: 'diodo', valor: '1N4007', qtd: 1, host: 'VENT-RAD', arranjo: 'antiparalelo', polaridade: true,
    comoIdentificar: '⭐ Faixa prateada = catodo, e ela vai no +12 V.',
    seInverter: '🔥 Invertido, ele curto-circuita a alimentação de 12 V das ventoinhas.',
    pernas: [
      { nome: 'catodo (faixa prateada)', vai: { comp: 'VENT-RAD', via: '+12V' } },
      { nome: 'anodo',                   vai: { comp: 'VENT-RAD', via: '0V' } },
    ],
    papel: 'Roda-livre do motor das ventoinhas do lado quente',
    porque: 'Ventoinha é carga indutiva e nada mais a grampeia. Sem ele o pico aparece no contato '
          + 'do KA4 toda vez que a pós-ventilação termina.',
    seFaltar: 'O contato do KA4 se degrada a cada parada da ventoinha.',
    ensaio: 'Teste de diodo entre os terminais da ventoinha, com ela desconectada → conduz num '
          + 'sentido só.',
    montagem: '⚠️ NÃO fica no painel: vai junto das ventoinhas, onde o pico nasce.',
    passo: 'A-05', fonte: 'Doc 31 §31.14',
    aviso: '⚠️ Não confunda com o D1: mesmo componente, funções e lugares diferentes.',
  },
  {
    id: 'DUT1-R', ref: 'R-DUT1', peca: 'Resistor 1,2 kΩ · ½ W',
    tipo: 'resistor', valor: '1,2 kΩ', qtd: 1, host: 'DUT1', arranjo: 'serie', polaridade: false,
    pernas: [
      { nome: 'perna 1', vai: { comp: 'DUT1', via: '+24V' } },
      { nome: 'perna 2', vai: { comp: 'DUT1', via: 'RET-1' } },
    ],
    papel: 'Fixa a corrente da posição de ensaio 1 em 17,6 mA',
    porque: 'É esse valor constante que o sistema aprende como "normal" — e cuja ausência denuncia '
          + 'a falha do dispositivo.',
    seFaltar: 'Sem ele o LED queima e a posição não tem corrente de referência.',
    ensaio: 'Amperímetro em série na volta da posição 1 → 17,6 mA ± 1 mA.',
    passo: 'A-06', fonte: 'Doc 13 §13.3b',
    aviso: '⚠️ ½ W. O resistor de 220 Ω / 5 W da versão antiga saiu do projeto junto com a ideia '
         + 'de simular carga térmica.',
  },
  {
    id: 'DUT1-LED', ref: 'LED-DUT1', peca: 'LED 5 mm vermelho',
    tipo: 'led', valor: 'vermelho', qtd: 1, host: 'DUT1', arranjo: 'serie', polaridade: true,
    comoIdentificar: 'Perna longa = ânodo (+), do lado do resistor.',
    seInverter: 'A posição não acende e o sistema lê corrente zero — exatamente o mesmo sintoma '
              + 'de "dispositivo morto". É o erro mais confuso possível aqui.',
    pernas: [
      { nome: 'perna longa (ânodo)', vai: { comp: 'DUT1', via: '+24V' } },
      { nome: 'perna curta (catodo)', vai: { comp: 'DUT1', via: 'RET-1' } },
    ],
    papel: 'Sinal visual de que a posição 1 está energizada, visível pela porta da câmara',
    porque: 'Deixa a demonstração de detecção de falha acontecer aos olhos da banca.',
    seFaltar: '—',
    ensaio: 'Aceso com a posição energizada; apaga ao abrir o jumper de ensaio.',
    passo: 'A-06', fonte: 'Doc 13 §13.3',
  },
  {
    id: 'DUT1-J', ref: 'J-DUT1', peca: 'Micro-chave ou jumper de 2 vias',
    tipo: 'chave', valor: '—', qtd: 1, host: 'DUT1', arranjo: 'serie', polaridade: false,
    pernas: [
      { nome: 'via 1', vai: { comp: 'DUT1', via: '+24V' } },
      { nome: 'via 2', vai: { comp: 'DUT1', via: 'RET-1' } },
    ],
    papel: 'Abre o circuito da posição 1 para simular um dispositivo morto',
    porque: '⭐ É a melhor demonstração do projeto: tira-se o jumper e, em menos de 2 segundos, o '
          + 'alarme aparece na IHM e no dashboard.',
    seFaltar: 'A falha só poderia ser demonstrada desligando fio — feio e arriscado na apresentação.',
    ensaio: 'Abrir o jumper com o ensaio rodando → alarme da posição 1 em menos de 2 s.',
    passo: 'A-06', fonte: 'Doc 13 §13.3',
  },
  {
    id: 'DUT2-R', ref: 'R-DUT2', peca: 'Resistor 2,2 kΩ · ½ W',
    tipo: 'resistor', valor: '2,2 kΩ', qtd: 1, host: 'DUT2', arranjo: 'serie', polaridade: false,
    pernas: [
      { nome: 'perna 1', vai: { comp: 'DUT2', via: '+24V' } },
      { nome: 'perna 2', vai: { comp: 'DUT2', via: 'RET-2' } },
    ],
    papel: 'Fixa a corrente da posição de ensaio 2 em 9,8 mA',
    porque: 'Corrente PROPOSITALMENTE diferente da posição 1: prova que o sistema compara cada '
          + 'posição com o normal dela, e não com um limiar único.',
    seFaltar: 'Sem ele o LED queima e a posição não tem referência.',
    ensaio: 'Amperímetro em série na volta da posição 2 → 9,8 mA ± 1 mA.',
    passo: 'A-07', fonte: 'Doc 13 §13.3b',
  },
  {
    id: 'DUT2-LED', ref: 'LED-DUT2', peca: 'LED 5 mm verde',
    tipo: 'led', valor: 'verde', qtd: 1, host: 'DUT2', arranjo: 'serie', polaridade: true,
    comoIdentificar: 'Perna longa = ânodo (+), do lado do resistor.',
    seInverter: 'Mesmo sintoma do LED da posição 1: parece dispositivo morto.',
    pernas: [
      { nome: 'perna longa (ânodo)', vai: { comp: 'DUT2', via: '+24V' } },
      { nome: 'perna curta (catodo)', vai: { comp: 'DUT2', via: 'RET-2' } },
    ],
    papel: 'Sinal visual da posição 2',
    porque: 'Cor diferente da posição 1 para as duas serem distinguíveis pela porta.',
    seFaltar: '—',
    ensaio: 'Aceso com a posição energizada.',
    passo: 'A-07', fonte: 'Doc 13 §13.3',
  },
  {
    id: 'DUT2-J', ref: 'J-DUT2', peca: 'Micro-chave ou jumper de 2 vias',
    tipo: 'chave', valor: '—', qtd: 1, host: 'DUT2', arranjo: 'serie', polaridade: false,
    pernas: [
      { nome: 'via 1', vai: { comp: 'DUT2', via: '+24V' } },
      { nome: 'via 2', vai: { comp: 'DUT2', via: 'RET-2' } },
    ],
    papel: 'Simula dispositivo morto na posição 2',
    porque: 'Duas posições com jumper permitem mostrar que o alarme identifica QUAL posição caiu.',
    seFaltar: 'Só uma posição demonstrável.',
    ensaio: 'Abrir o jumper → alarme da posição 2, e só dela.',
    passo: 'A-07', fonte: 'Doc 13 §13.3',
  },
];


/* ══════════════════════════════════════════════════════════════════════
   FATOS VIGIADOS — o que os documentos NÃO podem mais dizer
   ════════════════════════════════════════════════════════════════════
   ⭐ POR QUE ISTO EXISTE. As contradições que confundiram a montagem não
      foram erro de digitação: foram decisões tomadas em um documento e
      nunca propagadas para os outros. Cada fato abaixo é uma decisão já
      tomada; o validador varre os .md e avisa quem ainda diz o contrário.

   `arquivos` limita a varredura ao contexto certo — sem isso o projeto,
   que usa R1..R21 tanto para RAMAIS de energia quanto para PONTOS do
   BD-0V quanto para RESISTORES, geraria só ruído. */
export const FATOS_VIGIADOS = [
  {
    id: 'led-poste-220',
    diz: 'O LED da iluminação da maquete é de 5 V e seu limitador é de 220 Ω',
    porque: 'Na versão de 24 V o valor era 2,2 kΩ. Com a mudança para o ramal de 5 V ele '
          + 'passou a 220 Ω, e os documentos do poste não acompanharam.',
    arquivos: /11_subestacao|10_base|03_lista_materiais|30_forca/,
    /* as DUAS expressões têm que aparecer na linha: só assim se sabe que ela fala do
       LED do POSTE, e não do LED de uma posição de ensaio, que usa outro valor */
    linha: [/LED/i, /poste|ilumina|luminária|guarita|rua/i],
    unidade: 'Ω', aceitos: [220],
    /* linha riscada ou que já corrige o valor antigo não é contradição, é histórico */
    ignoraLinha: /~~|\(não |deixou de|passou a|virou|migraram|era d[ao]|vers[ãa]o antiga/i,
  },
  {
    id: 'dut-sem-carga-termica',
    diz: 'Os simuladores de DUT são LED + resistor de ½ W (1,2 kΩ e 2,2 kΩ) e NÃO simulam carga térmica',
    porque: 'A decisão do Doc 13 §13.3b eliminou os 220 Ω / 5 W. Onde eles aparecerem, a lista '
          + 'de compras e o cálculo de carga térmica ficam errados.',
    arquivos: /13_posicoes|03_lista_materiais/,
    linha: /simulador|DUT|posi[çc][ãa]o de ensaio/i, unidade: 'Ω', aceitos: [1200, 2200, 47, 4.7],
    ignoraLinha: /~~|\(não |deixou de|passou a|virou|era d[ao]|vers[ãa]o antiga/i,
  },
  {
    id: 'diodos-montados',
    diz: 'D1 e D2 são montados no projeto — não são peça sobressalente',
    porque: 'O Doc 33 §33.7 ainda manda guardá-los no saquinho, enquanto o Doc 31, a fiação, o '
          + 'desenho dos relés e o cadastro mandam montá-los.',
    arquivos: /\.md$/,
    texto: /1N4007/i, proibido: /sobressalente|sai do painel|n[ãa]o vai no painel/i,
  },
];

/* ══════════════════════════════════════════════════════════════════════
   ATALHOS
   ════════════════════════════════════════════════════════════════════ */
export const porHost = id => DISCRETOS.filter(d => d.host === id);
export const porPasso = passo => DISCRETOS.filter(d => d.passo === passo);
export const host = id => HOSTS.find(h => h.id === id);

/** Quantas peças físicas ao todo (um registro pode valer 4 peças iguais). */
export const TOTAL_PECAS = DISCRETOS.reduce((s, d) => s + (d.qtd ?? 1), 0);
