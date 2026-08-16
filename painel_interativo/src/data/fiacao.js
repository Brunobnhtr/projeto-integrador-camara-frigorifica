/**
 * A FIAÇÃO DO PAINEL, fio a fio.
 *
 * Construída por etapas. Cada fio declara de onde sai, onde chega, a
 * bitola, a cor da anilha e — o que mais importa — POR QUAIS CANALETAS
 * ele passa. O validador confere que a rota existe de verdade: que as
 * canaletas se tocam e que nenhum fio de sinal entra em canaleta de
 * potência.
 *
 * ⭐ ETAPA 1 — AS ENTRADAS. O que vem dos postes e entra pela base.
 */

/* ── prensa-cabos na FACE INFERIOR da caixa ───────────────────────────
 * X medido da esquerda da caixa. Todos na base, porque é lá que chega o
 * eletroduto que vem do padrão de entrada.
 */
export const PRENSAS_PAINEL = [
  {
    id: 'PG9-1', tipo: 'PG9', face: 'base', x: 50, classe: 'potencia',
    nome: 'ENTRADA DE POTÊNCIA', capacidade: 4,
    diz: 'Os dois condutores mais grossos: o 24 V de potência e o 0 V comum. '
       + 'Ambos de 1,5 mm², ambos vindos do poste 4.',
  },
  {
    id: 'PG7-1', tipo: 'PG7', face: 'base', x: 110, classe: 'potencia',
    nome: 'ENTRADA 5 V', capacidade: 2,
    diz: 'Só o positivo de 5 V, que desce do transformador T2 no poste 2.',
  },
  {
    id: 'PG7-2', tipo: 'PG7', face: 'base', x: 170, classe: 'potencia',
    nome: 'ENTRADA 12 V + 24 V SERVIÇOS', capacidade: 3,
    diz: 'Dois positivos: o 12 V do T3 (poste 3) e o 24 V de serviços do ramal R2.',
  },
];

/* ── os fios ──────────────────────────────────────────────────────────
 * `rota` = a sequência de canaletas, na ordem em que o fio anda.
 * `classe`: potencia · sinal · comum (o 0 V, que não se segrega)
 */
export const FIOS = [
  {
    n: 'E1', etapa: 1, nome: '24 V de POTÊNCIA', classe: 'potencia',
    de: { prensa: 'PG9-1' }, para: { comp: 'KA2', via: '11' },
    mm2: 1.5, cor: '#c92a2a', corNome: 'vermelho',
    rota: ['CH-base', 'CV-esq', 'CH-2x1'],
    diz: 'Vem do ramal R1, que desce no poste 4. Conduz os 6 A das Peltier — é o fio '
       + 'mais carregado do painel.',
    porque: '⭐ Ele NÃO vai direto ao barramento. Entra pelo contato 11 do KA2, e só sai '
          + 'pelo 14 se o relé estiver energizado. É isso que faz o cogumelo de '
          + 'emergência cortar a potência: sem o KA2, o BD-POT fica morto.',
  },
  {
    n: 'E2', etapa: 1, nome: '0 V comum', classe: 'comum',
    de: { prensa: 'PG9-1' }, para: { comp: 'BD-0V', via: 'IN' },
    mm2: 1.5, cor: '#4dabf7', corNome: 'azul claro',
    rota: ['CH-base', 'CV-esq', 'CH-2x1'],
    diz: 'Um condutor só para o painel inteiro. Conduz a soma de tudo: 6,9 A no pior caso.',
    porque: '🔥 É UM SÓ, e não um por tensão. Os LM2596 dos postes não são isolados — o '
          + 'negativo deles é fisicamente o mesmo cobre. Puxar quatro retornos separados '
          + 'não daria quatro circuitos: daria quatro caminhos para a mesma corrente, e '
          + 'malhas de terra que captam ruído.',
  },
  {
    n: 'E3', etapa: 1, nome: '5 V', classe: 'potencia',
    de: { prensa: 'PG7-1' }, para: { comp: 'BD-5V', via: 'IN' },
    mm2: 0.5, cor: '#f76707', corNome: 'laranja',
    rota: ['CH-base', 'CV-esq', 'CH-2x1'],
    diz: 'Só o positivo. Desce do transformador T2, no poste 2, e vai direto ao '
       + 'barramento — sem fusível.',
    porque: 'Sem fusível de propósito: o LM2596 do T2 já limita a corrente, e um fusível '
          + 'a mais aqui só criaria um ponto de falha que derrubaria o Arduino inteiro.',
  },
  {
    n: 'E4', etapa: 1, nome: '12 V auxiliar', classe: 'potencia',
    de: { prensa: 'PG7-2' }, para: { comp: 'BD-AUX', via: 'IN' },
    mm2: 0.75, cor: '#f59f00', corNome: 'amarelo',
    rota: ['CH-base', 'CV-esq', 'CH-2x1'],
    diz: 'Só o positivo, vindo do T3 no poste 3. Alimenta as ventoinhas pelo MV-1.',
    porque: '📐 0,75 mm² e não 0,5: as ventoinhas somam ~265 mA em regime, mas uma '
          + 'travada puxa corrente de rotor bloqueado. A bitola maior é a margem para '
          + 'isso.',
  },
  {
    n: 'E5', etapa: 1, nome: '24 V de SERVIÇOS', classe: 'potencia',
    de: { prensa: 'PG7-2' }, para: { comp: 'BD-24V', via: 'IN' },
    mm2: 0.5, cor: '#e03131', corNome: 'vermelho (anilha SRV)',
    rota: ['CH-base', 'CV-esq', 'CH-2x1'],
    diz: 'Vem do ramal R2, que também desce no poste 4. É o barramento PERMANENTE.',
    porque: '⭐ Este é o que NÃO cai na emergência. Ele alimenta o ESP32, os sinaleiros e '
          + 'as posições de ensaio — tudo o que precisa continuar vivo para registrar o '
          + 'que aconteceu quando alguém socou o cogumelo.',
    aviso: '⚠️ ANILHA DIFERENTE DA DO E1. Os dois são 24 V vermelhos e vão parar em '
         + 'barramentos com comportamento oposto na emergência. Trocá-los faz a potência '
         + 'ficar permanente e a supervisão morrer — exatamente o contrário do projeto.',
  },
];

/* ── o que cada etapa cobre, para não se perder ───────────────────── */
export const ETAPAS = [
  { n: 1, nome: 'Entradas — o que vem dos postes', feito: true,
    resumo: '5 condutores entram pela base: 24 V de potência, 0 V, 5 V, 12 V e '
          + '24 V de serviços. Todos pela canaleta de potência.' },
  { n: 2, nome: 'Comando e emergência', feito: false,
    resumo: 'KA1, KA2, o cogumelo e a seletora LOCAL/REMOTO.' },
  { n: 3, nome: 'Distribuição — dos barramentos aos consumidores', feito: false },
  { n: 4, nome: 'Sinais — Arduino, PI-1, PI-2 e sensores', feito: false },
  { n: 5, nome: 'Porta — tela, botões e sinaleiros', feito: false },
  { n: 6, nome: 'Saídas — o que vai para a câmara', feito: false },
];
