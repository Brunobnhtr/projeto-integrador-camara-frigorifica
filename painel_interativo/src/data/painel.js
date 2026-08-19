/**
 * MODELO DE DADOS DO PAINEL — Projeto Integrador CF-01
 *
 * Fonte da verdade: Doc 30 (lista de cabos), Doc 31 (comando),
 * Doc 32 (sinais) e Doc 33 (placa PI-1).
 *
 * Três conceitos, e só três:
 *
 *   COMPONENTE  um equipamento físico, com terminais nomeados
 *   TERMINAL    um ponto de ligação de um componente ("BTS1:B+")
 *   CABO        um fio ligando dois terminais, com bitola, cor e número
 *
 * Se você mudar a fiação no Doc 30, mude aqui também — este arquivo é
 * o que a tela desenha.
 */

// ─────────────────────────────────────────────────────────────────────
// TENSÕES — a cor de cada barramento, usada em todo o desenho
// ─────────────────────────────────────────────────────────────────────
export const TENSOES = {
  '127VCA': { cor: '#7a0b0b', label: '127 V CA', perigo: true,
              nota: 'Só existe dentro da casa de comando, fechada' },
  '24V_POT': { cor: '#c92a2a', label: '24 V potência',
               nota: 'Comutado pelo KA2 — cai na emergência' },
  '24V_SRV': { cor: '#e8590c', label: '24 V serviços',
               nota: 'Permanente — não cai na emergência' },
  '12V':    { cor: '#f5a524', label: '12 V auxiliar' },
  '5V':     { cor: '#2b8a3e', label: '5 V comando' },
  '0V':     { cor: '#111111', label: '0 V — retorno comum',
              nota: 'ÚNICO no projeto. Os LM2596 não são isolados' },
  'SINAL':  { cor: '#1f7bb6', label: 'Sinal' },
};

// ─────────────────────────────────────────────────────────────────────
// COMPONENTES
// ─────────────────────────────────────────────────────────────────────
/* ⚠️ AQUI EXISTIAM DOIS MODELOS DO PAINEL, E ISSO É PIOR QUE NÃO TER NENHUM.
   Este arquivo trazia um `COMPONENTES` e um `PI1_INTERNO` próprios, escritos
   antes do `painel_completo.js` — e eles continuaram descrevendo o ULN2803A,
   a PI-2 e as duas posições de ensaio muito depois de as três coisas saírem
   do projeto. Ninguém os consumia; só enganavam quem lesse.

   O modelo do painel, único, é o `painel_completo.js`.
   O que sobrou aqui tem dono: TENSOES e paraOndeVai (PlacaReal.jsx) e
   CABOS (scripts/conta_blocos.mjs). */

export const CABOS = [
  // potência 24 V
  { n: 34, de: 'ENTRADA:PG9', para: 'KA2:11', tensao: '24V_POT', bitola: '1,5 mm²', cor: 'vermelho',
    nota: 'Vem da derivação do poste P1' },
  { n: 35, de: 'KA2:14', para: 'BD-POT:IN', tensao: '24V_POT', bitola: '1,5 mm²', cor: 'vermelho',
    nota: '⚡ Depois deste ponto, a emergência corta' },
  { n: 45, de: 'BD-POT:O1', para: 'BTS1:B+', tensao: '24V_POT', bitola: '1,5 mm²', cor: 'vermelho' },
  { n: 46, de: 'BD-POT:O2', para: 'BTS2:B+', tensao: '24V_POT', bitola: '1,5 mm²', cor: 'vermelho' },
  { n: 47, de: 'BD-0V:O1', para: 'BTS1:B-', tensao: '0V', bitola: '1,5 mm²', cor: 'preto' },
  { n: 48, de: 'BD-0V:O2', para: 'BTS2:B-', tensao: '0V', bitola: '1,5 mm²', cor: 'preto' },

  // 5 V
  { n: 49, de: 'BD-5V:O1', para: 'MEGA:5V', tensao: '5V', bitola: '0,5 mm²', cor: 'vermelho',
    nota: '⚠️ No pino 5V, NUNCA no VIN' },
  { n: 52, de: 'BD-5V:O4', para: 'BTS1:VCC', tensao: '5V', bitola: '0,25 mm²', cor: 'vermelho' },
  { n: 53, de: 'BD-5V:O5', para: 'BTS2:VCC', tensao: '5V', bitola: '0,25 mm²', cor: 'vermelho' },
  { n: 54, de: 'BD-5V:O6', para: 'PI1:J1-4', tensao: '5V', bitola: '0,25 mm²', cor: 'vermelho',
    nota: 'Alimenta o pull-up do sensor' },

  // 0 V
  { n: 58.1, de: 'BD-0V:O3', para: 'MEGA:GND', tensao: '0V', bitola: '0,5 mm²', cor: 'preto' },
  { n: 58.2, de: 'BD-0V:O7', para: 'PI1:J1-9', tensao: '0V', bitola: '0,25 mm²', cor: 'preto' },
  { n: 58.3, de: 'BD-0V:O6', para: 'ESP32:GND', tensao: '0V', bitola: '0,5 mm²', cor: 'preto' },
  { n: 58.4, de: 'BD-0V:O5', para: 'SDRTC:GND', tensao: '0V', bitola: '0,25 mm²', cor: 'preto' },

  // 24 V serviços
  { n: 56, de: 'BD-24V:O1', para: 'ESP32:VIN', tensao: '24V_SRV', bitola: '0,5 mm²', cor: 'vermelho' },
  { n: 57, de: 'BD-24V:O2', para: 'S0:11', tensao: '24V_SRV', bitola: '0,5 mm²', cor: 'vermelho',
    nota: 'Início da cadeia de comando' },
  { n: 57.7, de: 'BD-24V:O3', para: 'PI1:J1-10', tensao: '24V_SRV', bitola: '0,25 mm²', cor: 'vermelho',
    nota: 'COM do ULN2803 — é o que mantém o FAULT aceso na emergência' },

  // cadeia de comando
  { n: 57.1, de: 'S0:12', para: 'S3:13', tensao: '24V_SRV', bitola: '0,5 mm²', cor: 'vermelho',
    nota: 'Emergência em série com o rearme' },
  { n: 57.2, de: 'S3:14', para: 'KA1:A1', tensao: '24V_SRV', bitola: '0,5 mm²', cor: 'vermelho' },
  { n: 57.3, de: 'KA1:14', para: 'KA1:A1', tensao: '24V_SRV', bitola: '0,5 mm²', cor: 'vermelho',
    nota: '⭐ O SELO — o relé segura a si mesmo' },
  { n: 57.4, de: 'KA1:A2', para: 'BD-0V:O8', tensao: '0V', bitola: '0,5 mm²', cor: 'preto' },
  { n: 57.5, de: 'KA1:24', para: 'S2:11', tensao: '24V_SRV', bitola: '0,5 mm²', cor: 'vermelho' },
  { n: 57.6, de: 'S2:12', para: 'KA2:A1', tensao: '24V_SRV', bitola: '0,5 mm²', cor: 'vermelho',
    nota: 'STOP em série com a bobina do KA2' },

  // sinais Arduino ↔ BTS
  { n: 111, de: 'MEGA:D5', para: 'BTS1:RPWM', tensao: 'SINAL', bitola: '0,25 mm²', cor: 'azul' },
  { n: 112, de: 'MEGA:D4', para: 'BTS1:R_EN', tensao: 'SINAL', bitola: '0,25 mm²', cor: 'azul',
    nota: 'Vai também ao L_EN. Pull-down de 10 kΩ soldado no módulo' },
  { n: 113, de: 'MEGA:D6', para: 'BTS2:RPWM', tensao: 'SINAL', bitola: '0,25 mm²', cor: 'azul' },
  { n: 114, de: 'MEGA:D7', para: 'BTS2:R_EN', tensao: 'SINAL', bitola: '0,25 mm²', cor: 'azul' },

  // sinais que ATRAVESSAM a PI-1
  { n: 115, de: 'BTS1:R_IS', para: 'PI1:J1-1', tensao: 'SINAL', bitola: '0,25 mm²', cor: 'amarelo',
    nota: 'Entra na PI-1 para ser filtrado' },
  { n: 116, de: 'PI1:J2-1', para: 'MEGA:A0', tensao: 'SINAL', bitola: '0,25 mm²', cor: 'amarelo',
    nota: 'Sai da PI-1 já filtrado' },
  { n: 117, de: 'BTS2:R_IS', para: 'PI1:J1-2', tensao: 'SINAL', bitola: '0,25 mm²', cor: 'amarelo' },
  { n: 118, de: 'PI1:J2-2', para: 'MEGA:A1', tensao: 'SINAL', bitola: '0,25 mm²', cor: 'amarelo' },
  { n: 119, de: 'CAMARA:DS18B20', para: 'PI1:J1-3', tensao: 'SINAL', bitola: '0,25 mm²', cor: 'amarelo',
    nota: 'Vem do sensor dentro da câmara' },
  { n: 120, de: 'PI1:J2-3', para: 'MEGA:D2', tensao: 'SINAL', bitola: '0,25 mm²', cor: 'amarelo',
    nota: 'Sai com o pull-up de 4,7 kΩ aplicado' },
  { n: 57.8, de: 'BD-POT:O3', para: 'PI1:J1-11', tensao: '24V_POT', bitola: '0,25 mm²', cor: 'vermelho',
    nota: '⚠️ Só para MEDIR. Não confundir com o 24V-SRV' },
  { n: 57.9, de: 'PI1:J2-8', para: 'MEGA:D25', tensao: 'SINAL', bitola: '0,25 mm²', cor: 'azul',
    nota: 'Os 24 V viraram 4,2 V no divisor' },

  // sinaleiros
  { n: 121, de: 'MEGA:D9',  para: 'PI1:J1-5', tensao: 'SINAL', bitola: '0,25 mm²', cor: 'azul' },
  { n: 122, de: 'MEGA:D10', para: 'PI1:J1-6', tensao: 'SINAL', bitola: '0,25 mm²', cor: 'azul' },
  { n: 123, de: 'MEGA:D11', para: 'PI1:J1-7', tensao: 'SINAL', bitola: '0,25 mm²', cor: 'azul' },
  { n: 124, de: 'MEGA:D12', para: 'PI1:J1-8', tensao: 'SINAL', bitola: '0,25 mm²', cor: 'azul' },
  { n: 125, de: 'PI1:J2-4', para: 'H1:-', tensao: '24V_SRV', bitola: '0,25 mm²', cor: 'preto' },
  { n: 126, de: 'PI1:J2-5', para: 'H2:-', tensao: '24V_SRV', bitola: '0,25 mm²', cor: 'preto' },
  { n: 127, de: 'PI1:J2-6', para: 'H3:-', tensao: '24V_SRV', bitola: '0,25 mm²', cor: 'preto' },
  { n: 128, de: 'PI1:J2-7', para: 'H4:-', tensao: '24V_SRV', bitola: '0,25 mm²', cor: 'preto' },
  { n: 129, de: 'BD-24V:O3', para: 'H1:+', tensao: '24V_SRV', bitola: '0,5 mm²', cor: 'vermelho',
    nota: 'O positivo dos 4 sinaleiros NÃO passa pela PI-1' },

  // botoeiras → Arduino
  { n: 131, de: 'S1:14', para: 'MEGA:D22', tensao: 'SINAL', bitola: '0,25 mm²', cor: 'azul' },
  { n: 132, de: 'S2:14', para: 'MEGA:D23', tensao: 'SINAL', bitola: '0,25 mm²', cor: 'azul' },
  { n: 133, de: 'S0:22', para: 'MEGA:D24', tensao: 'SINAL', bitola: '0,25 mm²', cor: 'azul' },
];

// ─────────────────────────────────────────────────────────────────────
// O QUE HÁ DENTRO DA PLACA PI-1 (para o zoom)
// ─────────────────────────────────────────────────────────────────────
export function indiceDeCabos() {
  const idx = {};
  for (const c of CABOS) {
    for (const t of [c.de, c.para]) (idx[t] ??= []).push(c);
  }
  return idx;
}

/** Dado "COMP:TERM", devolve o outro lado de cada cabo ligado nele. */
export function paraOndeVai(terminal) {
  return CABOS.filter(c => c.de === terminal || c.para === terminal)
    .map(c => ({ cabo: c, destino: c.de === terminal ? c.para : c.de }));
}
