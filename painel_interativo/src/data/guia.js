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
    id: 'B', nome: 'A placa PI-1', icone: '🟫',
    resumo: 'A PI-1 sai de um canto da placa ilhada comprada. Solda-se na ordem que '
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
      'Corte um retângulo de 22 × 22 furos: é a PI-1 inteira. O resto é sobra, e ela tem uso.',
      'Passe a lixa nas bordas cortadas até ficarem retas. Guarde as sobras — são o corpo da placa do DUT.',
    ],
    confira: 'PI-1 com 22 × 22 furos, bordas retas, e as sobras guardadas.',
    seErrar: 'Cortou torto ou lascou: sobra placa de sobra — a PI-1 usa menos de um quarto da que você comprou. Corte outro retângulo e siga.',
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
    id: 'A-06', fase: 'A', titulo: 'Montar o canal detector: fusível, chave e sensor', tempo: '40 min',
    pegue: ['1 sensor WCS2702', '1 porta-fusível DIN com interruptor', '1 fusível de 100 mA',
            'fio 0,5 mm² vermelho', 'multímetro', 'chave de fenda pequena'],
    antes: 'Painel DESENERGIZADO. Este é o circuito que prova a detecção de dispositivo morto.',
    discretos: ['SC1-SENSOR'],
    faca: [
      'Encaixe o porta-fusível com interruptor no trilho 2 e o sensor no trilho 3.',
      'Alimente o sensor: VCC no BD-5V (saída 8) e GND no BD-0V (Z17).',
      'Ligue o DOUT do sensor ao pino D22 do Arduino — um fio, sem nada no meio.',
      '⭐ Pegue o fio de +24 V que sai do fusível e dê 10 VOLTAS pelo furo do sensor, TODAS no '
      + 'mesmo sentido, antes de mandá-lo para a câmara.',
      'Só então leve esse fio ao borne +24 V da posição de ensaio, e traga o retorno dela ao '
      + 'BD-0V · Z22.',
      'Grave o firmware `camada_4_programacao/firmware/detector_corrente/detector_corrente.ino` e abra o monitor '
      + 'serial em 115200.',
      'Ligue a chave do porta-fusível e ajuste o trimpot do sensor até o serial dizer '
      + '"Equipamento em funcionamento".',
    ],
    confira: 'Desligue a chave: em menos de 1 s aparece "FALHA: Corrente Zero detectada". '
           + 'Religue: em 0,2 s volta "Equipamento em funcionamento". ⭐ E o teste que mais '
           + 'importa: com tudo ligado, desconecte o fio do D22 — tem que dar FALHA, nunca '
           + '"funcionando".',
    seErrar: 'Serial sempre em FALHA com o equipamento ligado: ou faltam voltas no furo (com 1 '
           + 'volta o sinal é 10× menor), ou o trimpot está fora do ponto, ou a polaridade do '
           + 'DOUT é invertida — troque NIVEL_COM_CORRENTE no firmware e grave de novo.',
  },
  {
    id: 'A-06b', fase: 'A', titulo: 'Montar a placa simuladora da posição 1', tempo: '25 min',
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

  /* ═══ FASE B · OS MÓDULOS DE INTERFACE ══════════════════════════
     ⭐ ESTA FASE ERA "SOLDAR A PI-1", com 8 passos e uma hora de ferro de
        solda. A placa tinha 6 peças; o divisor virou um módulo comprado,
        o pull-up veio dentro do adaptador do sensor, e sobraram dois
        capacitores — que entram parafusados num borne. Sem solda. */
  {
    id: 'B-01', fase: 'B', titulo: 'Conferir e montar o sensor de tensão', tempo: '20 min',
    pegue: ['1 módulo sensor de tensão 0–25 V', 'multímetro', 'fonte de bancada ou o próprio painel',
            'chave de fenda pequena'],
    antes: 'O módulo chegou. Faça isto ANTES de ligá-lo no Arduino.',
    discretos: ['SV1-MODULO'],
    faca: [
      'Encaixe o módulo no trilho 3 (ou numa base DIN), ao lado do Arduino.',
      'Ligue 24 V no borne de parafuso: VCC no positivo, GND no negativo.',
      '⭐ MEÇA A SAÍDA: ponta preta no pino −, ponta vermelha no pino S. Deve dar ~4,8 V.',
      'Anote o valor medido — é ele que o firmware vai enxergar no D25.',
      'Só depois disso ligue o pino S no D25 do Arduino.',
    ],
    confira: 'Com 24 V na entrada, a saída S mede entre 4,6 e 5,0 V. Abaixo de 3 V o Arduino '
           + 'leria "sem potência"; acima de 5,2 V ele sofre.',
    seErrar: '⚠️ Se a saída passar de 5,0 V, a fonte está acima de 25 V ou o módulo não é o de '
           + '5×. NÃO ligue no pino: um divisor errado destrói a entrada, e é o mesmo estrago que '
           + 'o divisor existia para evitar.',
  },
  {
    id: 'B-02', fase: 'B', titulo: 'Conferir o pull-up do adaptador do DS18B20', tempo: '10 min',
    pegue: ['1 adaptador DS18B20 (terminal plugável)', '1 sonda DS18B20 à prova d\'água',
            'multímetro'],
    antes: 'O kit chegou. Este passo existe por causa de UM resistor invisível.',
    discretos: ['AD1-MODULO'],
    faca: [
      '⭐ Ohmímetro entre o borne DAT e o borne VCC do adaptador, com ele desligado de tudo.',
      'Tem que dar ~4,7 kΩ. É o pull-up do 1-Wire, montado de fábrica.',
      'Se der circuito aberto, o adaptador veio SEM o resistor — solde um de 4,7 kΩ entre DAT e '
      + 'VCC, ou o sensor nunca vai responder.',
      'Ligue a sonda nos bornes pela cor: amarelo em DAT, vermelho em VCC, preto em GND.',
    ],
    confira: '~4,7 kΩ entre DAT e VCC. E, com tudo ligado, o firmware lê a temperatura em vez de '
           + 'devolver −127 °C (que é o código de "não achei o sensor").',
    seErrar: 'Sensor mudo com fio bom e código bom é quase sempre pull-up ausente. Meça antes de '
           + 'trocar a sonda.',
  },
  {
    id: 'B-03', fase: 'B', titulo: 'Parafusar os dois capacitores nos bornes', tempo: '15 min',
    pegue: ['2 capacitores 100 nF (marcados 104)', '3 bornes de passagem 2,5 mm² para trilho',
            'alicate de bico', 'chave de fenda pequena'],
    antes: 'Bornes já encaixados no trilho 3 e identificados: A0, A1 e 0V.',
    discretos: ['PI1-C1', 'PI1-C2'],
    faca: [
      'Dobre as pernas de cada capacitor em U, com a distância entre os dois bornes.',
      'No borne A0 entram TRÊS condutores: o fio que vem do IS do BTS #1, o fio que vai para o '
      + 'A0 do Arduino, e uma perna do C1.',
      'A outra perna do C1 vai no borne 0V.',
      'Repita para o C2 entre o borne A1 e o 0V.',
      '⚠️ Aperte com os três condutores dentro de uma vez. Apertar em dois tempos deixa um frouxo.',
    ],
    confira: 'Puxe cada fio e cada perna: nada sai. Ohmímetro entre A0 e 0V com o painel '
           + 'desligado: resistência alta, nunca zero — zero é capacitor em curto ou perna '
           + 'encostando onde não devia.',
    seErrar: 'Perna frouxa no borne é o defeito que aparece só depois do transporte, e some '
           + 'quando você mexe para procurar. Puxe cada uma antes de fechar o painel.',
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
      'Confira que a placa PI-1 NÃO está encaixada ainda.',
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
      '⭐ Só depois de os dois estarem ajustados é que o Arduino, o ESP32 e a PI-1 entram.',
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
