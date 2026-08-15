/**
 * TRILHO 1 — DISTRIBUIÇÃO · vista realista do painel
 * ==================================================
 * Coordenadas em MILÍMETROS, origem no canto superior esquerdo da placa
 * de montagem. As larguras dos blocos seguem o número de vias comprado.
 */

export const PLACA_MONTAGEM = { largura: 400, altura: 470 };
export const TRILHO = { y: 385, altura: 35 };
export const PLACA_PRENSA = { y: 432, altura: 30 };

/* ── ENTRADAS ────────────────────────────────────────────────────────
 * ⭐ São DOIS cabos de 24 V, por prensa-cabos DIFERENTES. Não é um só
 *    que se deriva lá dentro — e o motivo está em `porque` abaixo.
 */
export const PRENSA_CABOS = [
  {
    ref: 'PG9', x: 50, bitola: 'PG9', vindo: 'poste P1 (ramal R1)',
    porque: 'Cabo grosso de potência: leva os 6,0 A das Peltier e do PTC.',
    cabos: [
      { n: 34, sinal: '24 V POTÊNCIA', cor: '#c92a2a', bitola: '1,5 mm²',
        para: 'KA2:11', tensao: '24V_POT', protegido: 'F1 · 10 A na subestação' },
      { n: 36, sinal: 'retorno potência', cor: '#212529', bitola: '1,5 mm²',
        para: 'BD-0V:IN1', tensao: '0V' },
    ],
  },
  {
    ref: 'PG7a', x: 110, bitola: 'PG7', vindo: 'poste P2 (ramal R2 · após o LM2596)',
    porque: 'A tensão já foi convertida no poste. Aqui chega 5,10 V pronto.',
    cabos: [
      { n: 37, sinal: '5,10 V', cor: '#f08c00', bitola: '0,5 mm²',
        para: 'BD-5V:IN', tensao: '5V', protegido: 'F2 · 2 A + proteções do LM2596' },
      { n: 38, sinal: 'retorno 5 V', cor: '#212529', bitola: '0,5 mm²',
        para: 'BD-0V:IN2', tensao: '0V' },
    ],
  },
  {
    ref: 'PG7b', x: 170, bitola: 'PG7', vindo: 'poste P3 (ramal R3)',
    porque: 'Deste poste vêm DUAS tensões: os 12 V já convertidos pelo LM2596 '
          + 'e uma derivação dos 24 V crus, tirada ANTES do conversor.',
    cabos: [
      { n: 39, sinal: '12 V auxiliar', cor: '#fab005', bitola: '0,75 mm²',
        para: 'BD-AUX:IN', tensao: '12V', protegido: 'F3 · 2 A + proteções do LM2596' },
      { n: 40, sinal: 'retorno auxiliar', cor: '#212529', bitola: '0,75 mm²',
        para: 'BD-0V:IN3', tensao: '0V' },
      { n: 41, sinal: '24 V SERVIÇOS', cor: '#e8590c', bitola: '0,5 mm²',
        para: 'BD-24V:IN', tensao: '24V_SRV', protegido: 'F3 · 2 A na subestação' },
      { n: 42, sinal: 'retorno serviços', cor: '#212529', bitola: '0,5 mm²',
        para: 'BD-0V:IN4', tensao: '0V' },
    ],
  },
];

/* ── OS 5 BLOCOS ─────────────────────────────────────────────────────
 * `vias` = o que comprar. Contado cabo a cabo no Doc 30.
 */
export const BLOCOS = [
  {
    id: 'BD-POT', nome: 'BD-POT', x: 40, largura: 36, vias: 4, cor: '#c92a2a',
    subtitulo: '24 V potência', nota: 'COMUTADO pelo KA2 — cai na emergência',
    entrada: { ref: 'IN', bitola: '4 mm²', vem: 'KA2 · contato 14 (NA)' },
    saidas: [
      { ref: 'O1', vai: 'BTS #1 · B+', bitola: '1,5 mm²', cabo: 45 },
      { ref: 'O2', vai: 'BTS #2 · B+', bitola: '1,5 mm²', cabo: 46 },
      { ref: 'O3', vai: 'PI-1 · J1-11 (medir se o 24 V caiu)', bitola: '0,25 mm²', cabo: 57.8 },
      { ref: 'O4', vai: '— reserva —', livre: true },
    ],
  },
  {
    id: 'BD-AUX', nome: 'BD-AUX', x: 81, largura: 36, vias: 4, cor: '#fab005',
    subtitulo: '12 V auxiliar', nota: 'Ventilação',
    entrada: { ref: 'IN', bitola: '2,5 mm²', vem: 'prensa-cabo PG7b · cabo 39' },
    saidas: [
      { ref: 'O1', vai: 'cooler 40 mm dos BTS', bitola: '0,25 mm²', cabo: 55 },
      { ref: 'O2', vai: 'cooler do dissipador da Peltier #1', bitola: '0,5 mm²', cabo: 63 },
      { ref: 'O3', vai: 'cooler do dissipador da Peltier #2', bitola: '0,5 mm²', cabo: 64.2 },
      { ref: 'O4', vai: '— reserva —', livre: true },
    ],
  },
  {
    id: 'BD-24V', nome: 'BD-24V', x: 122, largura: 45, vias: 6, cor: '#e8590c',
    subtitulo: '24 V serviços', nota: 'PERMANENTE — não cai na emergência',
    alerta: 'Subiu de 4 para 6 vias: eram 5 cargas disputando 4 saídas.',
    entrada: { ref: 'IN', bitola: '2,5 mm²', vem: 'prensa-cabo PG7b · cabo 41' },
    saidas: [
      { ref: 'O1', vai: 'DNLCB30 / ESP32 · VIN', bitola: '0,5 mm²', cabo: 56 },
      { ref: 'O2', vai: 'cadeia de comando · S0 (emergência)', bitola: '0,5 mm²', cabo: 57 },
      { ref: 'O3', vai: 'positivo comum dos 4 sinaleiros da porta', bitola: '0,5 mm²', cabo: 57.7 },
      { ref: 'O4', vai: '4 posições de ensaio → F-P1..F-P4', bitola: '0,5 mm²', cabo: 57.13,
        aviso: 'Um fio só alimenta os 4 porta-fusíveis. Exige porta-fusível de 4 vias '
             + 'com barramento comum, ou 4 avulsos unidos por pente.' },
      { ref: 'O5', vai: 'PI-1 · J1-10 (COM do ULN2803)', bitola: '0,25 mm²', cabo: 57.8 },
      { ref: 'O6', vai: '— reserva —', livre: true },
    ],
  },
  {
    id: 'BD-5V', nome: 'BD-5V', x: 172, largura: 54, vias: 8, cor: '#f08c00',
    subtitulo: '5,10 V lógica',
    alerta: 'Subiu de 6 para 8 vias: eram 7 cargas disputando 6 saídas.',
    entrada: { ref: 'IN', bitola: '2,5 mm²', vem: 'prensa-cabo PG7a · cabo 37' },
    saidas: [
      { ref: 'O1', vai: 'Arduino Mega · pino 5V', bitola: '0,5 mm²', cabo: 49,
        aviso: 'No pino 5V, NÃO no VIN — o VIN passaria pelo regulador da placa.' },
      { ref: 'O2', vai: 'ESP32-S3 com tela (IHM)', bitola: '0,5 mm²', cabo: 50,
        aviso: 'Confira se o módulo aceita 5 V num pino — depender do conector USB '
             + 'dentro de um painel é frágil.' },
      { ref: 'O3', vai: 'RTC DS3231 (o SD saiu — agora é do S3)', bitola: '0,25 mm²', cabo: 51 },
      { ref: 'O4', vai: 'BTS #1 · VCC (lógica)', bitola: '0,25 mm²', cabo: 52 },
      { ref: 'O5', vai: 'BTS #2 · VCC (lógica)', bitola: '0,25 mm²', cabo: 53 },
      { ref: 'O6', vai: 'PI-1 · J1-4 (pull-up do 1-Wire)', bitola: '0,25 mm²', cabo: 54 },
      { ref: 'O7', vai: '4 LEDs da iluminação da maquete', bitola: '0,25 mm²', cabo: 54.2 },
      { ref: 'O8', vai: '— reserva —', livre: true },
    ],
  },
  {
    id: 'BD-0V', nome: 'BD-0V', x: 231, largura: 100, vias: 20, cor: '#212529',
    subtitulo: '⭐ star ground', ehBarra: true,
    nota: 'O ÚNICO 0 V do projeto. Todo retorno converge aqui.',
    alerta: 'Era um bloco de 8 saídas e não serve: chegam ~20 fios. '
          + 'Use barra de neutro de 20 furos, ou dois blocos de 8 interligados.',
    entrada: { ref: 'IN', bitola: '10 mm²', vem: '4 retornos dos prensa-cabos' },
    saidas: [
      { ref: 'R1', vai: 'BTS #1 · B−', bitola: '1,5 mm²', cabo: 47 },
      { ref: 'R2', vai: 'BTS #2 · B−', bitola: '1,5 mm²', cabo: 48 },
      { ref: 'R3', vai: 'Arduino · GND', bitola: '0,5 mm²', cabo: 58.1 },
      { ref: 'R4', vai: 'PI-1 · J1-9', bitola: '0,25 mm²', cabo: 58.2 },
      { ref: 'R5', vai: 'DNLCB30 / ESP32 · GND', bitola: '0,5 mm²', cabo: 58.3 },
      { ref: 'R6', vai: 'RTC DS3231 · GND', bitola: '0,25 mm²', cabo: 58.4 },
      { ref: 'R7', vai: 'ESP32-S3 da tela · GND', bitola: '0,5 mm²', cabo: 58.5 },
      { ref: 'R8', vai: 'BTS #1 · GND lógica', bitola: '0,25 mm²', cabo: 58.6 },
      { ref: 'R9', vai: 'BTS #2 · GND lógica', bitola: '0,25 mm²', cabo: 58.7 },
      { ref: 'R10', vai: 'KA1 · A2 (bobina)', bitola: '0,5 mm²', cabo: 57.4 },
      { ref: 'R11', vai: 'KA2 · A2 (bobina)', bitola: '0,5 mm²', cabo: 57.6 },
      { ref: 'R12', vai: 'cooler dos BTS −', bitola: '0,25 mm²', cabo: 55.2 },
      { ref: 'R13', vai: 'cooler Peltier #1 −', bitola: '0,5 mm²', cabo: 64 },
      { ref: 'R14', vai: 'cooler Peltier #2 −', bitola: '0,5 mm²', cabo: 64.3 },
      { ref: 'R15', vai: 'LEDs da maquete −', bitola: '0,25 mm²', cabo: 54.3 },
      { ref: 'R16', vai: 'retorno das 4 posições de ensaio', bitola: '0,5 mm²', cabo: 57.14 },
    ],
  },
];

/* ── PORTA DO PAINEL ─────────────────────────────────────────────────
 * Vista de dentro, aberta para a direita.
 */
export const PORTA = {
  largura: 250, altura: 470, x: 430,
  itens: [
    { tipo: 'tela', ref: 'HMI', nome: 'ES3C28P · ESP32-S3 2,8"', x: 50, y: 38, w: 150, h: 100,
      pinagem: 'HMI',
      detalhe: '⭐ Substituiu o Nextion E o módulo de cartão SD. ESP32-S3 com 8 MB de '
             + 'PSRAM: desenha a própria tela em LVGL, grava o log no microSD e comporta '
             + 'a Xiaozhi depois. Toque capacitivo, microfone e alto-falante. '
             + 'Ligado ao Arduino pela Serial2 (Mega 16/17), passando por conversor de '
             + 'nível — os 5 V do conector UART são alimentação, o TXD/RXD são 3,3 V. '
             + 'Alimentação e serial vêm no MESMO cabo de 4 vias.' },
    { tipo: 'sinaleiro', ref: 'H1', nome: 'ENERGIZADO', x: 50, y: 190, cor: '#2f9e44',
      detalhe: 'Positivo comum no BD-24V (O3). Negativo vai à PI-1 · J2-4.' },
    { tipo: 'sinaleiro', ref: 'H2', nome: 'RESFRIANDO', x: 100, y: 190, cor: '#1971c2',
      detalhe: 'Negativo na PI-1 · J2-5 (saída OUT2 do ULN2803).' },
    { tipo: 'sinaleiro', ref: 'H3', nome: 'AQUECENDO', x: 150, y: 190, cor: '#e8590c',
      detalhe: 'Negativo na PI-1 · J2-6 (saída OUT3 do ULN2803).' },
    { tipo: 'sinaleiro', ref: 'H4', nome: 'FALHA', x: 200, y: 190, cor: '#c92a2a',
      detalhe: 'Negativo na PI-1 · J2-7. Alimentado pelo 24 V PERMANENTE — '
             + 'continua aceso com a emergência acionada.' },
    { tipo: 'botao', ref: 'S1', nome: 'LIGA', x: 60, y: 265, cor: '#2f9e44',
      detalhe: 'NA. Energiza a bobina do KA1, que se sela pelo próprio contato.' },
    { tipo: 'botao', ref: 'S2', nome: 'REARME', x: 125, y: 265, cor: '#1971c2',
      detalhe: 'NA. Energiza o KA2, que fecha o 24 V de potência.' },
    { tipo: 'chave', ref: 'SA1', nome: 'LOCAL / REMOTO', x: 190, y: 265,
      detalhe: 'Define quem comanda: o Arduino (LOCAL) ou o ESP32 por MQTT (REMOTO).' },
    { tipo: 'emergencia', ref: 'S0', nome: 'EMERGÊNCIA', x: 125, y: 360,
      detalhe: 'Cogumelo com trava, contato NF. Abre a cadeia de comando e derruba '
             + 'o KA2 — o BD-POT cai, o BD-24V não.' },
  ],
};

/* Todos os fios desenháveis, montados a partir dos blocos e das entradas */
export function montarFios() {
  const fios = [];
  PRENSA_CABOS.forEach(pc => pc.cabos.forEach(c => {
    fios.push({
      n: c.n, tipo: 'entrada', prensa: pc.ref, sinal: c.sinal, cor: c.cor,
      bitola: c.bitola, de: `${pc.ref} (entrada do painel)`, para: c.para,
      tensao: c.tensao, protegido: c.protegido, vindo: pc.vindo,
    });
  }));
  BLOCOS.forEach(b => b.saidas.filter(s => !s.livre).forEach(s => {
    fios.push({
      n: s.cabo, tipo: 'saida', bloco: b.id, terminal: s.ref, sinal: s.vai,
      cor: b.cor, bitola: s.bitola, de: `${b.id}:${s.ref}`, para: s.vai,
      aviso: s.aviso,
    });
  }));
  return fios;
}
