/**
 * PINAGENS REAIS DOS MÓDULOS COMPRADOS
 * ====================================
 *
 * Desenhadas a partir das fotos em `imagens/`. Coordenadas em MILÍMETROS,
 * origem no canto superior esquerdo da placa.
 *
 * ⚠️ O que é exato e o que é aproximado:
 *   · a ORDEM e o NOME dos pinos vêm da serigrafia da foto  → exatos
 *   · o CONTORNO da placa e a posição dos marcos            → aproximados
 *
 * Ou seja: pode confiar para ligar o fio no borne certo. Não use para
 * furar a chapa — para isso, meça o módulo que chegou.
 */

export const PINAGENS = {

  /* ── BTS7960 / IBT-2 ───────────────────────────────────────────────
     Foto: imagens/bts7960-Pinout.webp
     Uma ponte H completa. Não são dois canais — ver Doc 32. */
  BTS1: {
    nome: 'BTS7960 (IBT-2)', larguraMm: 50, alturaMm: 50, pcb: '#1c4f8f',
    nota: 'É UMA ponte H, não dois canais. Por isso o projeto usa dois módulos: '
        + 'um para as Peltier, outro para o PTC.',
    grupos: [
      {
        ref: 'P1', tipo: 'borne', lado: 'esquerda', x: 4, y: 9, passo: 7.5,
        cor: '#2f9e44', legenda: 'Borne verde de potência — parafuso',
        pinos: [
          { n: 9,  nome: 'M−',  papel: 'para a carga (Peltier / PTC)', usa: true },
          { n: 10, nome: 'M+',  papel: 'para a carga (Peltier / PTC)', usa: true },
          { n: 11, nome: 'B+',  papel: '24 V vindo do BD-POT', usa: true, alerta: true },
          { n: 12, nome: 'B−',  papel: '0 V — barramento único', usa: true },
        ],
      },
      {
        ref: 'J1', tipo: 'header', lado: 'direita', x: 45, y: 11, passo: 2.54, colunas: 2,
        cor: '#212529', legenda: 'Barra de 8 pinos (2 × 4) — sinal de 5 V',
        pinos: [
          { n: 1, nome: 'R_PWM', papel: 'PWM do sentido direto — vem do Arduino', usa: true },
          { n: 2, nome: 'L_PWM', papel: 'PWM do sentido reverso', usa: true },
          { n: 3, nome: 'R_EN',  papel: 'habilita o lado direito', usa: true, alerta: true },
          { n: 4, nome: 'L_EN',  papel: 'habilita o lado esquerdo', usa: true, alerta: true },
          { n: 5, nome: 'R_IS',  papel: 'realimentação de corrente → PI-1 → A0', usa: true },
          { n: 6, nome: 'L_IS',  papel: 'não usado neste projeto' },
          { n: 7, nome: 'VCC',   papel: '5 V da lógica — do BD-5V', usa: true },
          { n: 8, nome: 'GND',   papel: '0 V da lógica', usa: true },
        ],
      },
    ],
    marcos: [
      { tipo: 'ci', x: 17, y: 14, w: 16, h: 9, rot: 0, texto: 'BTS7960' },
      { tipo: 'ci', x: 17, y: 26, w: 16, h: 9, rot: 0, texto: 'BTS7960' },
      { tipo: 'cap', x: 10, y: 38, r: 5, texto: '' },
      { tipo: 'furo', x: 5, y: 5 }, { tipo: 'furo', x: 45, y: 5 },
      { tipo: 'furo', x: 5, y: 45 }, { tipo: 'furo', x: 45, y: 45 },
    ],
    avisos: [
      '⚠️ R_EN e L_EN vão JUNTOS no mesmo pino do Arduino. Aterrar o L_EN faz a '
      + 'corrente voltar pelo diodo de corpo do MOSFET e desperdiça ~5,4 W por driver.',
      '📌 Os 2 resistores de 10 kΩ de pull-down ficam soldados DENTRO deste módulo, '
      + 'não na PI-1 — assim um cabo rompido ainda deixa o driver desligado.',
    ],
  },

  /* ── DNLCB30 (base do ESP32) ───────────────────────────────────────
     Fotos: imagens/DNLCB30_1.avif e _2.avif */
  ESP32: {
    nome: 'DNLCB30 + ESP32 30 pinos', larguraMm: 96, alturaMm: 82, pcb: '#0f2f4f',
    nota: 'É só uma placa de expansão — o ESP32 de 30 pinos encaixa no soquete do meio. '
        + 'Ela traz conversor DC 7–30 V → 5 V (0,6 A) e adaptação de nível 3,3 V ↔ 5 V.',
    grupos: [
      {
        ref: 'ESQ', tipo: 'borne', lado: 'esquerda', x: 4, y: 9, passo: 5.0,
        cor: '#2f9e44', legenda: 'Bornes de GPIO — saída em 5 V (< 0,5 A)',
        pinos: [
          { n: 1, nome: 'GPIO15' }, { n: 2, nome: 'GPIO14' }, { n: 3, nome: 'GPIO16' },
          { n: 4, nome: 'GPIO17' }, { n: 5, nome: 'GPIO5' },  { n: 6, nome: 'GPIO18' },
          { n: 7, nome: 'GND', usa: true },
          { n: 8, nome: 'GPIO19' }, { n: 9, nome: 'GPIO21' },
          { n: 10, nome: 'GPIO3 (RX)', papel: 'só entrada — recebe do Arduino', usa: true },
          { n: 11, nome: 'GPIO1 (TX)', papel: 'envia para o Arduino', usa: true },
          { n: 12, nome: 'GPIO22' }, { n: 13, nome: 'GPIO23' }, { n: 14, nome: 'GND' },
        ],
      },
      {
        ref: 'DIR', tipo: 'borne', lado: 'direita', x: 91, y: 9, passo: 5.0,
        cor: '#2f9e44', legenda: 'Bornes de GPIO — saída em 5 V (< 0,5 A)',
        pinos: [
          { n: 15, nome: 'GND' }, { n: 16, nome: 'GPIO13' }, { n: 17, nome: 'GPIO27' },
          { n: 18, nome: 'GPIO26' }, { n: 19, nome: 'GPIO25' }, { n: 20, nome: 'GND' },
          { n: 21, nome: 'GPIO33' }, { n: 22, nome: 'GPIO32' },
          { n: 23, nome: 'GPI35', papel: 'SÓ ENTRADA' },
          { n: 24, nome: 'GPI34', papel: 'SÓ ENTRADA' },
          { n: 25, nome: 'GPI39 (VN)', papel: 'SÓ ENTRADA' },
          { n: 26, nome: 'GPI36 (VP)', papel: 'SÓ ENTRADA' },
        ],
      },
      {
        ref: 'PWR', tipo: 'borne', lado: 'baixo', x: 40, y: 76, passo: 5.0,
        cor: '#e03131', legenda: 'Alimentação DC 7–30 V',
        pinos: [
          { n: 27, nome: '+', papel: '24 V do BD-24V (permanente)', usa: true, alerta: true },
          { n: 28, nome: '−', papel: '0 V — barramento único', usa: true },
        ],
      },
    ],
    marcos: [
      { tipo: 'soquete', x: 30, y: 8, w: 36, h: 52, texto: 'soquete ESP32 30 pinos' },
      { tipo: 'ci', x: 33, y: 62, w: 30, h: 11, texto: 'DC-DC → 5 V 0,6 A' },
    ],
    avisos: [
      '⚠️ Os pinos 34, 35, 36(VP) e 39(VN) são SÓ ENTRADA. Não dá para acender nada neles.',
      '📌 A placa vem sem o ESP32. É preciso comprar a versão de 30 pinos — a de 38 não encaixa.',
      '✅ Aceita 24 V direto e tem proteção contra inversão de polaridade, que é '
      + 'exatamente o que o projeto precisa: ela fica no BD-24V permanente.',
    ],
  },

  /* ── LM2596 com display ────────────────────────────────────────────
     Foto: imagens/regulador_de_tensao_lm2596_step_down_com_display.webp */
  LM2596: {
    nome: 'LM2596 step-down com display', larguraMm: 66, alturaMm: 37, pcb: '#1c4f8f',
    nota: 'Conversor abaixador ajustável. ⚠️ NÃO é isolado: o 0 V da entrada e o da '
        + 'saída são o MESMO condutor. É por isso que o projeto tem um único 0 V.',
    grupos: [
      {
        ref: 'IN', tipo: 'borne', lado: 'esquerda', x: 4, y: 12, passo: 6.0,
        cor: '#2f9e44', legenda: 'Entrada',
        pinos: [
          { n: 1, nome: 'VIN+', papel: 'vem do ramal de 24 V', usa: true, alerta: true },
          { n: 2, nome: 'VIN−', papel: '0 V', usa: true },
        ],
      },
      {
        ref: 'OUT', tipo: 'borne', lado: 'direita', x: 62, y: 12, passo: 6.0,
        cor: '#2f9e44', legenda: 'Saída ajustada',
        pinos: [
          { n: 3, nome: 'VOUT+', papel: 'para o BD-5V (5,10 V) ou BD-AUX (12,0 V)', usa: true },
          { n: 4, nome: 'VOUT−', papel: '0 V — o MESMO fio do VIN−', usa: true, alerta: true },
        ],
      },
    ],
    marcos: [
      { tipo: 'display', x: 22, y: 20, w: 22, h: 11, texto: '5.10' },
      { tipo: 'trim', x: 52, y: 7, r: 4, texto: 'ajuste' },
      { tipo: 'botao', x: 55, y: 27, r: 3, texto: 'S1' },
      { tipo: 'ci', x: 20, y: 5, w: 14, h: 8, texto: 'LM2596' },
      { tipo: 'cap', x: 12, y: 9, r: 4 }, { tipo: 'cap', x: 45, y: 9, r: 4 },
    ],
    avisos: [
      '🔧 Ajuste a saída ANTES de ligar a carga: energize só a entrada, gire o trimpot '
      + 'até o display mostrar a tensão desejada, e só então ligue o VOUT.',
      '📌 O botão S1 alterna o display entre mostrar a tensão de ENTRADA e a de SAÍDA. '
      + 'Se o número não muda quando você gira o trimpot, ele está mostrando a entrada.',
      '⚠️ O 0 V atravessa o módulo. Não tente criar "um neutro para cada tensão" — '
      + 'eles já são o mesmo condutor por dentro.',
    ],
  },

  /* ── Kit Peltier duplo ─────────────────────────────────────────────
     Foto: imagens/peltir.avif — 2 conjuntos lado a lado */
  PELTIER: {
    nome: 'Kit Peltier duplo (2 × TEC1-12706)', larguraMm: 200, alturaMm: 95,
    pcb: '#b8bcc0', ehMecanico: true,
    nota: 'Dois conjuntos completos montados lado a lado num bloco de alumínio comum. '
        + 'Cada Peltier tem seu par de fios de força, e cada ventoinha tem os seus.',
    grupos: [
      {
        ref: 'TEC', tipo: 'fios', lado: 'baixo', x: 30, y: 88, passo: 45,
        cor: '#c92a2a', legenda: 'Força das pastilhas — 2 fios cada',
        pinos: [
          { n: 1, nome: 'TEC1 +/−', papel: '12 V · 6,0 A — vermelho e preto', usa: true, alerta: true },
          { n: 2, nome: 'TEC2 +/−', papel: '12 V · 6,0 A — vermelho e preto', usa: true, alerta: true },
        ],
      },
      {
        ref: 'FAN', tipo: 'fios', lado: 'baixo', x: 120, y: 88, passo: 22,
        cor: '#1971c2', legenda: 'Ventoinhas — 2 fios cada, independentes',
        pinos: [
          { n: 3, nome: 'FAN frio 1', papel: '12 V — sopra para BAIXO na câmara', usa: true },
          { n: 4, nome: 'FAN frio 2', papel: '12 V — sopra para BAIXO na câmara', usa: true },
          { n: 5, nome: 'FAN rad. 1', papel: '⚠️ TROCAR por 24 V com 3 fios (RPM)', usa: true, alerta: true },
          { n: 6, nome: 'FAN rad. 2', papel: '⚠️ TROCAR por 24 V com 3 fios (RPM)', usa: true, alerta: true },
        ],
      },
    ],
    marcos: [
      { tipo: 'bloco', x: 6, y: 18, w: 88, h: 58, texto: 'conjunto 1' },
      { tipo: 'bloco', x: 106, y: 18, w: 88, h: 58, texto: 'conjunto 2' },
      { tipo: 'fan', x: 50, y: 40, r: 20, texto: 'fan frio' },
      { tipo: 'fan', x: 150, y: 40, r: 20, texto: 'fan frio' },
      { tipo: 'fan', x: 50, y: 82, r: 13, texto: 'radiador' },
      { tipo: 'fan', x: 150, y: 82, r: 13, texto: 'radiador' },
    ],
    avisos: [
      '⭐ AS 3 MODIFICAÇÕES OBRIGATÓRIAS ANTES DE MONTAR:',
      '1️⃣ LIGAR AS DUAS PASTILHAS EM SÉRIE. O kit vem para 12 V em paralelo (por isso '
      + 'o anúncio fala em 15 A). Em série viram 24 V · 6,0 A · 144 W e ligam direto no '
      + 'barramento de 24 V, sem conversor. Ligue o (−) da TEC1 no (+) da TEC2; sobram '
      + 'um (+) e um (−), que vão ao BTS #1.',
      '2️⃣ SEPARAR OS FIOS DAS VENTOINHAS DOS FIOS DAS PASTILHAS. Elas não podem seguir '
      + 'a tensão das pastilhas — as ventoinhas continuam em 12 V pelo BD-AUX.',
      '3️⃣ TROCAR AS 2 VENTOINHAS DO RADIADOR por modelos de 24 V com 3 fios (sinal de '
      + 'RPM). Isso alivia o ramal de 12 V de 77% para 44% de carga e ainda deixa o '
      + 'Arduino perceber se uma ventoinha travou.',
      '✅ A foto confirma o que o projeto precisava: cada pastilha tem seu par de fios '
      + 'e cada ventoinha tem os seus — dá para religar em série sem cortar nada solidário.',
    ],
  },
};

/* Componentes que compartilham a mesma pinagem */
PINAGENS.BTS2 = { ...PINAGENS.BTS1, nome: 'BTS7960 (IBT-2) #2' };
