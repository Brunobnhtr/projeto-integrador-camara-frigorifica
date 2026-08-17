/**
 * AS LIGAÇÕES DA CÂMARA, PARTE POR PARTE
 * ======================================
 * A câmara lida de cima para baixo, como quem monta. Cada bloco diz o
 * que chega do painel, o que se liga a quê ali dentro, e o que volta.
 *
 * `externo` = fio que vem do painel — o número bate com a etapa 6
 * `interno` = ligação feita DENTRO da câmara, sem passar pelo painel
 */

export const BLOCOS_LIGACAO = [
  {
    id: 'B1', zona: 'TAMPA · lado quente, do lado de FORA',
    titulo: '🔥 Dissipadores, ventoinhas do radiador e o DS18B20',
    cor: '#e8590c',
    diz: 'Fica em cima da tampa, no ar ambiente. Nada aqui atravessa parede — os fios '
       + 'sobem pela lateral e entram direto nos componentes.',
    externo: [
      { fio: 'X5', o: 'BD-AUX · O2 (12 V direto)', para: 'os DOIS positivos, em paralelo' },
      { fio: 'X6', o: 'os dois negativos', para: 'BD-0V · R20 — 0 V de verdade' },
      { fio: 'X22', o: 'BD-5V · O11', para: 'DS18B20 · VCC (vermelho)' },
      { fio: 'X23', o: 'DS18B20 · GND (preto)', para: 'BD-0V · R19' },
      { fio: 'X19', o: 'DS18B20 · DATA (amarelo)', para: 'PI-1 · J1-3 — o pull-up de 4,7 kΩ está lá dentro' },
      { fio: 'X20', o: 'RPM da ventoinha #1', para: 'Mega D3' },
      { fio: 'X21', o: 'RPM da ventoinha #2', para: 'Mega A8' },
    ],
    interno: [
      'As duas ventoinhas em PARALELO: os dois vermelhos juntos no X5, os dois pretos no X6.',
      '⭐ O DS18B20 É DE TRÊS FIOS, e os três chegam no painel: vermelho no 5 V, preto no '
      + '0 V, amarelo (às vezes branco) no DATA. Não existe versão de dois fios aqui — a '
      + 'de dois é a alimentação parasita, que este projeto não usa.',
      'O DS18B20 vai COLADO no dissipador, com pasta térmica e abraçadeira. Colado no '
      + 'acrílico ou solto no ar ele não mede o que interessa.',
      '⭐ O RPM é o TERCEIRO fio da ventoinha, normalmente amarelo. Ventoinha de 2 fios '
      + 'não serve aqui — sem RPM não há como proteger a pastilha.',
    ],
    aviso: '🔥 ESTAS DUAS NÃO PASSAM PELO MV-1 — FICAM SEMPRE LIGADAS. O MV-1 chaveia o '
         + 'NEGATIVO, e o tacômetro da ventoinha tem o emissor referenciado nesse mesmo '
         + 'negativo. Com o canal desligado o preto sobe para perto de 12 V e empurra '
         + 'corrente para dentro do pino do Arduino. E antes de estragar nada, o RPM já '
         + 'leria "parada" sempre — justo o alarme que deveria salvar a pastilha. Ligadas '
         + 'direto no BD-AUX, elas continuam girando até depois da emergência, que é '
         + 'quando o dissipador ainda está quente. SE UM COOLER PARAR, A PASTILHA DAQUELE '
         + 'LADO MORRE EM MENOS DE UM MINUTO — por isso são dois RPM separados, e não a '
         + 'média dos dois.',
  },
  {
    id: 'B2', zona: 'TAMPA · a Peltier, atravessando',
    titulo: '❄️ As duas pastilhas, ligadas EM SÉRIE',
    cor: '#1971c2',
    diz: 'O par forma UMA carga de 24 V, não duas de 12. Só dois fios atravessam a parede.',
    desenho: [
      'M+ ──► [ PASTILHA 1 ] ──emenda──► [ PASTILHA 2 ] ──► M−',
      '          12 V            │            12 V',
      '                   feita DENTRO da câmara',
    ],
    externo: [
      { fio: 'X1', o: 'BTS #1 · M+', para: 'fio VERMELHO da pastilha 1' },
      { fio: 'X2', o: 'BTS #1 · M−', para: 'fio PRETO da pastilha 2' },
    ],
    interno: [
      '⭐ A EMENDA DA SÉRIE: o preto da pastilha 1 no vermelho da pastilha 2, feita ali '
      + 'no topo, com terminal isolado ou solda e termorretrátil.',
      'Cada pastilha continua vendo os seus 12 V nominais; somadas dão os 24 V do '
      + 'barramento, sem conversor no meio.',
      '📌 As duas têm que ser do MESMO modelo e lote: em série passa a mesma corrente '
      + 'pelas duas, e resistências diferentes dariam tensões diferentes.',
    ],
    aviso: '⚠️ A POLARIDADE DECIDE QUAL FACE ESFRIA. Invertido, a face que deveria ficar '
         + 'fria vira a quente — e com o dissipador do outro lado a pastilha cozinha. '
         + 'Energize 10 segundos e sinta com a mão ANTES de parafusar.',
  },
  {
    id: 'B3', zona: 'DENTRO · logo abaixo da Peltier',
    titulo: '🌀 As 2 ventoinhas frias',
    cor: '#4dabf7',
    diz: 'Sopram para BAIXO, empurrando o ar frio para dentro do volume.',
    externo: [
      { fio: 'X9', o: 'MV-1 · O3+', para: '⚠️ os positivos das QUATRO de circulação' },
      { fio: 'X10', o: 'MV-1 · O3−', para: 'os quatro negativos' },
    ],
    interno: [
      'As 2 frias e as 2 dos dutos ficam TODAS em paralelo nestes dois fios — quatro '
      + 'ventoinhas, dois condutores atravessando a parede.',
      'Elas formam um circuito de ar só, então ligam e desligam juntas.',
    ],
    aviso: '🔥 NUNCA LIGUE A VENTOINHA NA SAÍDA DA PELTIER. A saída do BTS é PWM de 24 V; '
         + 'a ventoinha é 12 V contínuos. Além de queimar, ela pararia sempre que o duty '
         + 'caísse — justo quando o ar mais precisa circular.',
  },
  {
    id: 'B4', zona: 'DENTRO · centro geométrico',
    titulo: '🌡️ O sensor AM2315C',
    cor: '#f76707',
    diz: 'Suspenso no meio do volume, longe da Peltier e do PTC.',
    externo: [
      { fio: 'X15', o: 'BD-5V · O10', para: 'VCC do sensor' },
      { fio: 'X16', o: 'GND do sensor', para: 'BD-0V · R15' },
      { fio: 'X17', o: 'PI-2 · SDA', para: 'SDA — terceira parada do MESMO barramento I²C' },
      { fio: 'X18', o: 'PI-2 · SCL', para: 'SCL' },
    ],
    interno: [
      '📌 O AM2315C JÁ VEM COM O CABO PRESO NELE. Não há terminal no corpo do sensor — '
      + 'as quatro pontas soltas são as que você liga DENTRO DO PAINEL.',
      'Ou seja: estes quatro fios não se emendam na câmara. É o próprio rabicho do '
      + 'sensor que atravessa o prensa-cabo PG9-3 e vai direto aos bornes.',
      '⭐ Meça o comprimento do rabicho antes de posicionar o sensor. Se não alcançar o '
      + 'painel, a emenda tem que ser feita com conector, e ela fica DENTRO da câmara — '
      + 'onde há condensação.',
    ],
    aviso: '⚠️ Suspenso por fio de nylon, nunca parafusado na parede: o acrílico conduz a '
         + 'temperatura da parede direto para o corpo do sensor.',
  },
  {
    id: 'B5', zona: 'DENTRO · na base, um de cada lado',
    titulo: '🔴 As duas posições de ensaio',
    cor: '#c92a2a',
    diz: 'Cada uma recebe o seu positivo e devolve o SEU retorno, individual.',
    desenho: [
      '+24 V ──[ R ]──┤▶├── LED ──► retorno',
      'posição 1 · 1,2 kΩ · LED vermelho · 17,6 mA',
      'posição 2 · 2,2 kΩ · LED verde    ·  9,8 mA',
    ],
    externo: [
      { fio: 'X11', o: 'F-P1 (fusível 100 mA)', para: 'DUT 1 · terminal +' },
      { fio: 'X13', o: 'DUT 1 · retorno', para: 'PI-2 · RET-1 — atravessa o shunt lá dentro' },
      { fio: 'X12', o: 'F-P2', para: 'DUT 2 · terminal +' },
      { fio: 'X14', o: 'DUT 2 · retorno', para: 'PI-2 · RET-2' },
    ],
    interno: [
      'Dentro de cada DUT: o + entra no resistor, o resistor vai no ânodo do LED, e o '
      + 'cátodo do LED é o retorno.',
      '⭐ Os dois retornos NÃO se juntam. Cada um sai da câmara por um fio próprio.',
    ],
    aviso: '🔥 SE OS DOIS RETORNOS FOSSEM UM SÓ, as correntes se somariam antes do shunt e '
         + 'o sistema saberia que "alguém parou" sem saber QUEM. É o retorno individual '
         + 'que faz a detecção valer alguma coisa.',
  },
  {
    id: 'B6', zona: 'DENTRO · base, no centro',
    titulo: '🔥 O PTC e a ventoinha dele',
    cor: '#e03131',
    diz: 'Dois circuitos SEPARADOS — e é isso que permite o intertravamento.',
    externo: [
      { fio: 'X3', o: 'BTS #2 · M+', para: 'PTC · positivo' },
      { fio: 'X4', o: 'BTS #2 · M−', para: 'PTC · negativo' },
      { fio: 'X7', o: 'MV-1 · O2+', para: 'ventoinha do PTC · + (12 V)' },
      { fio: 'X8', o: 'MV-1 · O2−', para: 'ventoinha do PTC · −' },
    ],
    interno: [
      '⭐ A VENTOINHA NÃO SE LIGA NO PTC. O aquecedor é 24 V comandado pelo BTS #2; a '
      + 'ventoinha é 12 V comandada pelo canal 2 do MV-1. Dois pares distintos.',
      'É por serem separados que o firmware consegue duas coisas: não ligar o PTC sem a '
      + 'ventoinha girando, e manter a ventoinha girando depois que o PTC desliga.',
    ],
    aviso: '⚠️ O PTC TEM QUE SER O DE 24 V. Ele vai direto no barramento pelo BTS, sem '
         + 'conversor — um de 12 V ligado aqui queima.',
  },
  {
    id: 'B7', zona: 'DENTRO · nos dutos laterais',
    titulo: '🌀 As 2 ventoinhas dos dutos',
    cor: '#74c0fc',
    diz: 'Uma em cada duto, soprando para CIMA — é o retorno do circuito de ar.',
    externo: [
      { fio: 'X9', o: 'MV-1 · O3+', para: 'em paralelo com as 2 frias' },
      { fio: 'X10', o: 'MV-1 · O3−', para: 'idem' },
    ],
    interno: [
      'Mesmo par de fios das ventoinhas frias — as quatro são um circuito só.',
      'Ficam FORA do volume útil, dentro do isolamento, então o ar circula sem furar a '
      + 'parede de acrílico.',
    ],
  },
];
