/**
 * MONTAGEM DA CÂMARA — peças de corte e ordem de montagem
 * ========================================================
 * Fonte: Doc 12 (§12.1 geometria, §12.2 térmico, §12.6 condensado) e
 * a lista C.1 do Doc 03.
 *
 * ⭐ TODAS as medidas em MILÍMETROS, como saem para a gráfica.
 *
 * 🔧 Revisão de agosto/2026 — três mudanças que afetam o corte:
 *   1. O XPS saiu. O vão de 30 mm fica com AR, e a fita de alumínio
 *      nas duas faces o transforma em barreira de radiação.
 *   2. A base externa perdeu o furo do dreno.
 *   3. As ventoinhas dos dutos saíram de dentro dos dutos e foram para
 *      a base, abaixo do PTC, soprando para as bocas.
 *   4. Por causa disso o duto passou de 30 × 30 para 40 × 40 mm — a
 *      seção casa com a da ventoinha e some o estrangulamento.
 *      A largura externa foi de 336 para 356 mm.
 */

/* ── as peças que vão para a gráfica ────────────────────────────────
   recortes: janelas internas · furos: passantes · encaixe: como monta */
export const PECAS = [
  {
    id: 'PL', nome: 'Parede lateral (esq. e dir.)', qtd: 2,
    esp: 5, mat: 'acrílico transparente', l: 110, a: 250,
    recortes: [{ x: 10, y: 20, l: 90, a: 210, nome: 'passagem do duto' }],
    borda: '45° nas duas bordas verticais',
    porque: 'O recorte é a boca do duto lateral: o ar sobe por fora da parede e volta ao topo.',
    cuidado: 'As duas são ESPELHADAS. Se a gráfica cortar as duas iguais, uma fica com o '
           + 'chanfro de 45° do lado errado e a junta abre.',
  },
  {
    id: 'PT', nome: 'Parede traseira', qtd: 1,
    esp: 5, mat: 'acrílico transparente', l: 210, a: 250,
    furos: [
      { x: 30, y: 40, d: 16, nome: 'PC-1 · prensa-cabo de potência' },
      { x: 180, y: 210, d: 16, nome: 'PC-2 · prensa-cabo de sinal' },
      { x: 105, y: 235, d: 6, nome: '⭐ respiro Ø 4 mm (furo de 6 para o passa-fio)' },
    ],
    borda: '45° nas duas bordas verticais',
    cuidado: '⚠️ OS DOIS PRENSA-CABOS AFASTADOS ≥ 100 mm, em cantos opostos. Juntos, os 6 A '
           + 'chaveados dos BTS induziriam transiente nos 17,6 mA das posições de ensaio e '
           + 'no I²C do sensor.',
  },
  {
    id: 'TP', nome: 'Tampa do topo', qtd: 1,
    esp: 5, mat: 'acrílico transparente', l: 210, a: 110,
    recortes: [
      { x: 40, y: 30, l: 50, a: 50, nome: 'Peltier #1' },
      { x: 120, y: 30, l: 50, a: 50, nome: 'Peltier #2' },
    ],
    porque: 'As duas pastilhas atravessam a tampa: o bloco frio para dentro, o dissipador '
          + 'e as ventoinhas para fora.',
    cuidado: '⚠️ Meça o SEU kit antes de mandar cortar. Os 50 × 50 mm são do TEC1-12706 '
           + 'padrão, mas o bloco frio de alguns kits é maior. Recorte apertado demais não '
           + 'entra; folgado demais vira ponte térmica e fresta de vapor.',
  },
  {
    id: 'BE', nome: 'Base externa', qtd: 1,
    esp: 5, mat: 'acrílico transparente', l: 210, a: 110,
    borda: '90° em todas',
    porque: '🔧 SEM FURO. O dreno saiu do projeto — a bandeja é removível e você a esvazia '
          + 'pela porta. Ver Doc 12 §12.6.',
  },
  {
    id: 'BI', nome: 'Base interna (apoio do PTC)', qtd: 1,
    esp: 5, mat: 'acrílico transparente', l: 190, a: 90,
    borda: '90° em todas',
    porque: 'Fica sobre a base externa, deixando o vão onde a bandeja de condensado '
          + 'desliza. É nela que o PTC e as duas ventoinhas de duto se apoiam.',
  },
  {
    id: 'PE', nome: 'Porta — vidro EXTERNO', qtd: 1,
    esp: 5, mat: 'acrílico transparente', l: 210, a: 250,
    porque: 'A face de fora da porta dupla. É o único acrílico que NÃO leva fita de '
          + 'alumínio — é por ela que se vê o ensaio.',
  },
  {
    id: 'PI', nome: 'Porta — vidro INTERNO', qtd: 1,
    esp: 5, mat: 'acrílico transparente', l: 190, a: 230,
    porque: 'A face de dentro. Entre os dois vidros fica a câmara de ar de 10 mm — mesmo '
          + 'princípio da janela de vidro duplo.',
  },
  {
    id: 'PM', nome: 'Porta — moldura espaçadora', qtd: 4,
    esp: 10, mat: 'acrílico transparente', l: 210, a: 10,
    porque: 'As 4 tiras que criam a câmara de ar entre os dois vidros da porta.',
    cuidado: 'Corte 2 de 210 mm e 2 de 230 mm — as medidas aqui são da tira mais longa. '
           + 'Um sachê de sílica de 2 g vai DENTRO desta câmara, senão ela embaça.',
  },
  {
    id: 'DF', nome: 'Duto — face frontal', qtd: 2,
    esp: 3, mat: 'acrílico transparente', l: 40, a: 210,
    borda: '45° nas verticais',
    porque: '🔧 Passou de 30 para 40 mm de largura para casar com a ventoinha que sopra '
          + 'na boca. Um duto de 30 seria 44 % de estrangulamento na saída dela.',
  },
  {
    id: 'DL', nome: 'Duto — laterais', qtd: 4,
    esp: 3, mat: 'acrílico transparente', l: 40, a: 210,
    borda: 'traseira 90°',
  },
  {
    id: 'DT', nome: 'Duto — tampa do TOPO', qtd: 2,
    esp: 3, mat: 'acrílico transparente', l: 40, a: 40,
    cuidado: '⚠️ SÓ AS DO TOPO. A base de cada duto fica ABERTA — é a boca por onde a '
           + 'ventoinha empurra o ar. 🔧 Eram 4 peças; viraram 2.',
  },
];

/* ── a ordem de montagem ────────────────────────────────────────────
   Cada passo diz o que fazer, o que conferir antes de seguir, e o que
   NÃO dá para desfazer depois. */
export const PASSOS = [
  {
    n: 1, titulo: 'Conferir o corte antes de colar qualquer coisa',
    pecas: ['PL', 'PT', 'TP', 'BE', 'BI'],
    faz: 'Apoie todas as peças na mesa e monte a caixa a seco, sem cola, com fita crepe '
       + 'segurando os cantos.',
    confira: 'As duas laterais são ESPELHADAS? Os recortes das Peltier batem com o seu kit? '
           + 'Os cantos fecham sem fresta?',
    irreversivel: false,
    porque: 'A cola de acrílico é por capilaridade e age em segundos. Descobrir que uma peça '
          + 'está espelhada errada DEPOIS de colar significa comprar a chapa de novo.',
  },
  {
    n: 2, titulo: 'Furar a parede traseira',
    pecas: ['PT'],
    faz: 'Dois furos Ø 16 mm para os prensa-cabos e um Ø 6 mm para o respiro.',
    confira: 'Os dois prensa-cabos estão a pelo menos 100 mm um do outro, em cantos opostos?',
    irreversivel: true,
    porque: '⚠️ Furar acrílico depois de colado racha a junta. E os prensa-cabos juntos '
          + 'fazem os 6 A chaveados dos BTS sujarem a medição das posições de ensaio.',
  },
  {
    n: 3, titulo: 'Colar a caixa interna',
    pecas: ['PL', 'PT', 'BE', 'BI'],
    faz: 'Cola S-320 por capilaridade nas juntas de 45°. Esquadro em todos os cantos.',
    confira: 'Esquadro. Depois de curar não há conserto.',
    irreversivel: true,
    cuidado: '⚠️ Silicone só NEUTRO. O acético ataca o acrílico e ele trinca semanas depois.',
  },
  {
    n: 4, titulo: 'Montar os dutos laterais',
    pecas: ['DF', 'DL', 'DT'],
    faz: 'Colar os dois dutos de 40 × 40 mm por fora das paredes laterais, alinhados com '
       + 'os recortes.',
    confira: '⭐ A tampa da BASE de cada duto fica ABERTA — é por ali que a ventoinha '
           + 'empurra o ar para dentro.',
    irreversivel: true,
  },
  {
    n: 5, titulo: '⭐ Forrar tudo com fita de alumínio',
    pecas: [],
    faz: 'Fita de 50 mm em TODA a superfície externa da caixa interna e em TODA a face '
       + 'interna da cobertura branca. Sobreponha 10 mm em cada emenda e alise com um '
       + 'cartão para não deixar bolha.',
    confira: 'Todas as juntas coladas ficaram cobertas? É a função mais importante da fita.',
    irreversivel: false,
    porque: '⭐ A fita faz DUAS coisas: sela as microfrestas das juntas (barreira de vapor — '
          + 'é o que faz a sílica dar conta sem dreno) e, de frente para o vão de ar, corta '
          + 'a radiação. Ver Doc 12 §12.2.',
    cuidado: '⚠️ NÃO cubra a porta. É por ela que se vê o ensaio.',
  },
  {
    n: 6, titulo: 'Instalar as Peltier na tampa',
    pecas: ['TP'],
    faz: 'Bloco frio para dentro, dissipador e ventoinhas para fora. Pasta térmica dos '
       + 'dois lados da pastilha.',
    confira: '⚠️ O lado FRIO é o que tem a marcação do fabricante virada para cima quando '
           + 'a corrente entra pelo vermelho. Ligue por 10 s na bancada e sinta antes de '
           + 'colar em definitivo.',
    irreversivel: true,
    cuidado: '🔥 Peltier invertida esquenta a câmara e resfria o ambiente, e ninguém percebe '
           + 'olhando. Testar antes custa 10 segundos.',
  },
  {
    n: 7, titulo: 'Montar o piso: bandeja, PTC e ventoinhas dos dutos',
    pecas: ['BI'],
    faz: 'A bandeja de alumínio desliza no vão entre a base externa e a interna. Sobre a '
       + 'base interna vão o PTC e, ⭐ ABAIXO dele, as DUAS ventoinhas de duto lado a lado, '
       + 'cada uma soprando para a boca do seu duto.',
    confira: '⚠️ A seta de fluxo de cada ventoinha. Invertidas, o circuito de ar roda ao '
           + 'contrário e é quase impossível perceber sem teste de fumaça.',
    irreversivel: false,
    porque: '🔧 Elas ficavam DENTRO dos dutos. Não cabiam com folga num vão de 30 × 30 mm, '
          + 'e lá dentro sopravam contra a parede. Na boca, o ar entra já com velocidade.',
  },
  {
    n: 8, titulo: 'Montar a porta dupla',
    pecas: ['PE', 'PI', 'PM'],
    faz: 'Vidro externo + moldura de 10 mm + vidro interno. Um sachê de sílica de 2 g DENTRO '
       + 'da câmara de ar antes de fechar. Perfil EPDM tubular 9 × 6 mm em todo o perímetro.',
    confira: 'A câmara de ar ficou selada? Se embaçar depois, a sílica não estava lá dentro.',
    irreversivel: true,
    cuidado: '⚠️ Perfil TUBULAR, não o chato de 5 mm. O tubular comprime e acompanha a '
           + 'irregularidade da porta; o chato só encosta.',
  },
  {
    n: 9, titulo: 'Dobradiça e fechos de pressão',
    pecas: [],
    faz: 'Dobradiça piano de 250 mm de um lado, dois fechos borboleta do outro.',
    confira: '⭐ Os fechos têm de COMPRIMIR o EPDM ao fechar, não só encostar. Ajuste o '
           + 'gancho até você sentir a resistência do perfil.',
    irreversivel: false,
    porque: 'É a mesma ideia do fecho de baú ou de freezer: sem compressão a vedação não '
          + 'veda, e a porta responde por mais da METADE de todo o calor que entra (§12.2).',
  },
  {
    n: 10, titulo: '⭐ Montar o respiro',
    pecas: [],
    faz: 'Tubo de silicone Ø 4 mm × 300 mm, enrolado em espiral e preso dentro da câmara, '
       + 'com uma ponta saindo pelo furo de 6 mm da parede traseira.',
    confira: 'O tubo está livre, sem dobra que o feche?',
    irreversivel: false,
    porque: '⚠️ NÃO É OPCIONAL. Resfriar de 25 para 5 °C contrai o ar 6,7 %. Numa câmara '
          + 'bem vedada isso dá 34 kgf puxando a porta para dentro — empena acrílico e '
          + 'arrebenta junta. O caminho longo e estreito equaliza a pressão e quase não '
          + 'deixa vapor passar.',
  },
  {
    n: 11, titulo: '🔧 Acabamento externo — a fita é a pele',
    pecas: [],
    faz: 'Repassar a fita de alumínio conferindo se não sobrou emenda aberta, bolha ou '
       + 'ponta descolada. Alisar tudo com um cartão.',
    confira: '⚠️ Agora a fita É a superfície externa, e não há mais cobertura protegendo. '
           + 'Ponta solta engancha e rasga; bolha vira caminho de vapor.',
    irreversivel: false,
    porque: '🔧 AQUI IAM A COBERTURA BRANCA E OS 8 ESPAÇADORES. Foram removidos do projeto. '
          + 'A fita continua cortando a radiação (ε ≈ 0,05) mesmo de frente para a sala — '
          + 'só perde o ganho extra que o vão de ar dava. Custo: 44 % → 51 % de duty.',
    cuidado: '⚠️ Alumínio de 0,05 mm corta. Passe a unha pelas bordas para dobrar as '
           + 'rebarbas antes de a câmara ir para a mesa de apresentação.',
  },
  {
    n: 12, titulo: 'Sílica e comissionamento',
    pecas: [],
    faz: '3 sachês de sílica indicadora dentro da câmara. Fechar, ligar e observar.',
    confira: 'A câmara chega ao setpoint? Em quanto tempo? Compare com o simulador: '
           + '~13 min até 10 °C e ~51 % de duty em regime.',
    irreversivel: false,
    porque: '⭐ A sílica azul vira ROSA quando satura. Regenera no forno a 120 °C por 2 h — '
          + 'não jogue fora.',
  },
];

export const RESUMO = {
  volumeUtil: '200 × 100 × 250 mm = 5,0 litros',
  externo: '🔧 290 × 110 × 260 mm (encolheu: saiu a cobertura + o vão)',
  areaAcrilico5: '~0,42 m²',
  areaAcrilico3: '~0,12 m² (só os dutos)',
};

/* ── ❓ ONDE FICA CADA CAMADA — o corte que responde "onde vai a placa
      branca?". Medidas da esquerda para a direita, saindo do ar interno
      da câmara e indo até o mundo lá fora. */
export const CAMADAS = [
  { nome: 'ar da câmara', esp: null, cor: '#e7f5ff', tipo: 'ar',
    diz: 'O volume útil: 200 × 100 × 250 mm.' },
  { nome: 'parede de acrílico', esp: 5, cor: '#a5d8ff', tipo: 'acrilico',
    diz: 'A caixa interna colada. É ela que segura tudo.' },
  { nome: 'fita de alumínio', esp: 0.05, cor: '#ced4da', tipo: 'fita',
    diz: '⭐ Sela as juntas coladas (barreira de vapor) e encara o vão.' },
  { nome: 'DUTO de circulação', esp: 40, cor: '#d3f9d8', tipo: 'duto',
    diz: '🔧 40 × 40 mm — só nas laterais esquerda e direita. Na traseira '
       + 'e no topo, este espaço é vão de ar comum.' },
  { nome: 'fita de alumínio', esp: 0.05, cor: '#ced4da', tipo: 'fita',
    diz: '⭐ AGORA ELA É A SUPERFÍCIE EXTERNA. Continua fazendo as duas coisas: sela '
       + 'as juntas coladas (barreira de vapor, que é o que a estratégia de sílica sem '
       + 'dreno precisa) e, com ε ≈ 0,05, corta a troca por RADIAÇÃO com a sala. '
       + 'Isso sozinho já vale: a resistência de superfície sobe de 0,13 para ~0,31 '
       + 'm²·K/W — mais que o dobro.' },
  { nome: 'ar da sala', esp: null, cor: '#f8f9fa', tipo: 'ar',
    diz: '🔧 A COBERTURA BRANCA E O VÃO DE AR FORAM REMOVIDOS do projeto. Com eles '
       + 'saíram os 8 espaçadores de 30 mm. Custo: o duty de regime sobe de 44 % para '
       + '51 %. Ver Doc 12 §12.2.' },
];

/* ── ❓ A PORTA, camada por camada, de fora para dentro ──────────────
      Ela é uma "janela de vidro duplo": dois acrílicos com ar preso
      entre eles, e é esse ar parado que isola. */
export const PORTA = [
  { nome: 'Vidro EXTERNO', l: 210, a: 250, esp: 5, cor: '#a5d8ff',
    diz: 'O maior dos dois. É ele que APOIA na moldura frontal da câmara e '
       + 'comprime o EPDM. Fica com 10 mm de sobra em cada lado — é essa '
       + 'sobra que faz a vedação.' },
  { nome: 'Moldura espaçadora', l: 190, a: 230, esp: 10, cor: '#ffd8a8',
    diz: '4 tiras de acrílico de 10 mm coladas em volta, entre os dois '
       + 'vidros. Elas não são enfeite: são o que CRIA a câmara de ar. '
       + '⚠️ O sachê de sílica de 2 g vai aqui dentro antes de fechar.' },
  { nome: 'Câmara de ar', l: 170, a: 210, esp: 10, cor: '#fff',
    diz: '⭐ O isolante de verdade da porta. Ar parado de 10 mm — mesmo '
       + 'princípio da janela de vidro duplo. Sem ele, a porta sozinha '
       + 'deixaria entrar 3,8 W em vez de 2,4 W.' },
  { nome: 'Vidro INTERNO', l: 190, a: 230, esp: 5, cor: '#a5d8ff',
    diz: 'Menor que o externo, do tamanho da moldura. Ele ENTRA no vão da '
       + 'boca da câmara quando você fecha, como a tampa de um pote.' },
];

/* ── como a porta prende e como ela veda ─────────────────────────── */
export const FIXACAO_PORTA = [
  { peca: 'Dobradiça piano de alumínio', onde: 'lateral ESQUERDA, na cobertura branca',
    med: '250 mm (cortada de barra de 75 cm)',
    diz: 'Piano, e não dobradiça de canto, porque ela distribui o esforço em toda a '
       + 'altura. Uma porta de acrílico presa em 2 pontos empena com o tempo.' },
  { peca: 'Perfil EPDM tubular 9 × 6 mm', onde: 'todo o perímetro da MOLDURA FRONTAL da câmara',
    med: '~2 m (perímetro de 210 + 250 × 2)',
    diz: '⚠️ TUBULAR, não o chato de 5 mm. O tubular é oco: ele AMASSA e acompanha as '
       + 'irregularidades da porta. O chato só encosta, e onde encostar mal, entra ar.' },
  { peca: '2 fechos de pressão (borboleta) inox', onde: 'lateral DIREITA, oposta à dobradiça',
    med: 'tipo fecho de baú',
    diz: '⭐ É AQUI QUE MORA A VEDAÇÃO. O fecho não é uma tranca: ele PUXA a porta contra '
       + 'o EPDM e o comprime uns 3 mm. Sem essa compressão o perfil só encosta e a '
       + 'porta responde por um terço de todo o calor que entra. Ajuste o gancho até '
       + 'sentir resistência ao fechar — se fecha fácil demais, não está vedando.' },
  { peca: 'Puxador pequeno', onde: 'centro da lateral direita', med: '—',
    diz: 'Estética. Serve para você ter onde puxar sem forçar a borda do acrílico.' },
];

/* ── o ensaio que prova que a porta veda ─────────────────────────── */
export const TESTE_PORTA = {
  nome: 'Teste da folha de papel',
  como: 'Feche a porta prendendo uma tira de papel comum entre ela e o EPDM. Puxe.',
  esperado: 'A tira tem de OFERECER RESISTÊNCIA em todos os 8 pontos do perímetro '
          + '(4 cantos + meio de cada lado). Onde ela sair fácil, a vedação está frouxa.',
  ajuste: 'Se sair fácil perto dos fechos, aperte o gancho. Se sair fácil no lado da '
        + 'dobradiça, calce a dobradiça com uma arruela — a porta está torta.',
};
