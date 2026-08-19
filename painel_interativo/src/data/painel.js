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
export const COMPONENTES = [
  // ── TRILHO 1 · distribuição ────────────────────────────────────────
  {
    id: 'BD-POT', nome: 'BD-POT', trilho: 1, x: 40, categoria: 'bloco',
    descricao: 'Bloco de distribuição · 24 V de POTÊNCIA',
    detalhe: 'Vem do ramal RM1 pelo poste P1 e passa pelo KA2. CAI NA EMERGÊNCIA.',
    tensao: '24V_POT', largura: 36,
    terminais: { 'IN': 'entrada 4 mm²', 'O1': 'saída 1', 'O2': 'saída 2', 'O3': 'saída 3', 'O4': 'reserva' },
  },
  {
    id: 'BD-AUX', nome: 'BD-AUX', trilho: 1, x: 76, categoria: 'bloco',
    descricao: 'Bloco de distribuição · 12 V auxiliar',
    detalhe: 'Vem do conversor T3, no poste P3.',
    tensao: '12V', largura: 36,
    terminais: { 'IN': 'entrada', 'O1': 'coolers Peltier', 'O2': 'fans internas', 'O3': 'cooler BTS', 'O4': 'reserva' },
  },
  {
    id: 'BD-5V', nome: 'BD-5V', trilho: 1, x: 112, categoria: 'bloco',
    descricao: 'Bloco de distribuição · 5,10 V de comando',
    detalhe: 'Vem do conversor T2, no poste P2.',
    tensao: '5V', largura: 36,
    terminais: { 'IN': 'entrada', 'O1': 'Arduino', 'O2': 'Nextion', 'O3': 'SD+RTC',
                 'O4': 'lógica BTS1', 'O5': 'lógica BTS2', 'O6': 'PI-1' },
  },
  {
    id: 'BD-24V', nome: 'BD-24V', trilho: 1, x: 148, categoria: 'bloco',
    descricao: 'Bloco de distribuição · 24 V de SERVIÇOS',
    detalhe: 'Vem do ramal RM3, pelo poste P3. PERMANENTE — não passa pelo KA2.',
    tensao: '24V_SRV', largura: 36,
    terminais: { 'IN': 'entrada', 'O1': 'DNLCB30/ESP32', 'O2': 'cadeia de comando',
                 'O3': 'sinaleiros + COM do CI', 'O4': 'reserva' },
  },
  {
    id: 'BD-0V', nome: 'BD-0V', trilho: 1, x: 189, categoria: 'bloco',
    descricao: '⭐ STAR GROUND — o 0 V é ÚNICO no projeto',
    detalhe: 'Todos os retornos convergem aqui, em estrela. Os LM2596 não são isolados: '
           + 'o 0 V da entrada e o da saída são o mesmo condutor. Não existem "3 neutros".',
    tensao: '0V', largura: 46,
    terminais: { 'IN': 'entrada 10 mm²', 'O1': 'BTS1 B−', 'O2': 'BTS2 B−', 'O3': 'Arduino',
                 'O4': 'Nextion', 'O5': 'SD+RTC', 'O6': 'DNLCB30', 'O7': 'PI-1', 'O8': 'coolers' },
  },

  // ── TRILHO 2 · potência ────────────────────────────────────────────
  {
    id: 'BTS1', nome: 'BTS7960 #1', trilho: 2, x: 40, categoria: 'driver',
    descricao: 'Driver de potência · FRIO (2× Peltier em série)',
    detalhe: 'Recebe 24 V no B+ e chaveia a 20 kHz por PWM. O R_EN e o L_EN vão JUNTOS '
           + 'no mesmo pino do Arduino, com pull-down de 10 kΩ soldado no próprio módulo.',
    tensao: '24V_POT', largura: 105,
    terminais: { 'B+': 'entrada 24 V', 'B-': 'retorno 0 V', 'M+': 'saída p/ Peltier',
                 'M-': 'retorno da Peltier', 'RPWM': 'PWM 20 kHz', 'R_EN': 'habilita',
                 'L_EN': 'habilita (junto com R_EN)', 'LPWM': '0 V', 'R_IS': 'diagnóstico de corrente',
                 'VCC': 'lógica 5 V', 'GND': 'lógica 0 V' },
  },
  {
    id: 'BTS2', nome: 'BTS7960 #2', trilho: 2, x: 150, categoria: 'driver',
    descricao: 'Driver de potência · QUENTE (PTC de 24 V)',
    detalhe: 'Mesmo módulo do BTS1. Intertravado por software: nunca liga junto com o frio.',
    tensao: '24V_POT', largura: 105,
    terminais: { 'B+': 'entrada 24 V', 'B-': 'retorno 0 V', 'M+': 'saída p/ PTC',
                 'M-': 'retorno do PTC', 'RPWM': 'PWM 20 kHz', 'R_EN': 'habilita',
                 'L_EN': 'habilita (junto com R_EN)', 'LPWM': '0 V', 'R_IS': 'diagnóstico de corrente',
                 'VCC': 'lógica 5 V', 'GND': 'lógica 0 V' },
  },
  {
    id: 'KA1', nome: 'KA1', trilho: 2, x: 260, categoria: 'rele',
    descricao: 'Relé de habilitação — faz o SELO',
    detalhe: 'Um contato mantém a própria bobina ligada (selo); o outro alimenta o KA2 '
           + 'através do NF do STOP. Conduz só miliampères.',
    tensao: '24V_SRV', largura: 16,
    terminais: { 'A1': 'bobina +', 'A2': 'bobina −', '11': 'comum 1', '14': 'NA 1 (selo)',
                 '21': 'comum 2', '24': 'NA 2 (saída p/ KA2)' },
  },
  {
    id: 'KA2', nome: 'KA2', trilho: 2, x: 280, categoria: 'rele',
    descricao: '⚡ Relé de POTÊNCIA — corta os 24 V em hardware',
    detalhe: 'Contato ≥ 10 A declarado em DC. É ele que a emergência abre. '
           + 'Fecha uma vez e fica: NÃO faz PWM (isso é trabalho do BTS7960).',
    tensao: '24V_POT', largura: 16,
    terminais: { 'A1': 'bobina +', 'A2': 'bobina −', '11': 'comum (entra 24 V)', '14': 'NA (sai p/ BD-POT)' },
  },

  // ── TRILHO 3 · controle ────────────────────────────────────────────
  {
    id: 'MEGA', nome: 'Arduino Mega', trilho: 3, x: 40, categoria: 'controlador',
    descricao: 'Controlador em tempo real — PID, proteções, intertravamento',
    detalhe: 'Não comanda relé nenhum: ele só LÊ (pelo D25) se a potência chegou. '
           + 'Quem comanda KA1/KA2 são as botoeiras, em hardware.',
    tensao: '5V', largura: 110,
    terminais: {
      '5V': 'alimentação', 'GND': 'retorno',
      'A0': 'corrente do BTS1', 'A1': 'corrente do BTS2', 'A8': 'RPM cooler 2',
      'D2': 'sensor DS18B20', 'D3': 'RPM cooler 1',
      'D4': 'habilita BTS1', 'D5': 'PWM frio', 'D6': 'PWM quente', 'D7': 'habilita BTS2',
      'D9': 'sinaleiro RUN', 'D10': 'sinaleiro COOL', 'D11': 'sinaleiro HEAT', 'D12': 'sinaleiro FAULT',
      'D22': 'START', 'D23': 'STOP', 'D24': 'EMERGÊNCIA', 'D25': 'lê se há 24 V',
    },
  },
  {
    id: 'PI1', nome: 'Placa PI-1', trilho: 3, x: 150, categoria: 'placa',
    descricao: '⭐ Placa de interface — onde moram os componentes discretos',
    detalhe: 'Não tem função elétrica própria: é o lugar onde 7 peças ficam soldadas em vez '
           + 'de penduradas no fio. J1 = só ENTRADAS · J2 = só SAÍDAS.',
    tensao: 'SINAL', largura: 52,
    ehPlaca: true,
    terminais: {
      'J1-1': 'entra IS#1', 'J1-2': 'entra IS#2', 'J1-3': 'entra DATA', 'J1-4': 'entra +5V',
      'J1-5': 'entra D9', 'J1-6': 'entra D10', 'J1-7': 'entra D11', 'J1-8': 'entra D12',
      'J1-9': 'entra 0V', 'J1-10': 'entra 24V-SRV', 'J1-11': 'entra 24V-POT',
      'J2-1': 'sai A0', 'J2-2': 'sai A1', 'J2-3': 'sai D2',
      'J2-4': 'sai L1−', 'J2-5': 'sai L2−', 'J2-6': 'sai L3−', 'J2-7': 'sai L4−',
      'J2-8': 'sai D25',
    },
  },
  {
    id: 'ESP32', nome: 'DNLCB30 + ESP32', trilho: 3, x: 203, categoria: 'controlador',
    descricao: 'Supervisão e comando remoto — Wi-Fi e MQTT',
    detalhe: 'Alimentado em 24 V pela DNLCB30, que também converte 5 V ↔ 3,3 V. '
           + 'Comanda só quando a chave está em REMOTO.',
    tensao: '24V_SRV', largura: 90,
    terminais: { 'VIN': '24 V', 'GND': '0 V', 'RX': 'do Arduino', 'TX': 'para o Arduino' },
  },
  {
    id: 'SDRTC', nome: 'SD + RTC', trilho: 3, x: 293, categoria: 'modulo',
    descricao: 'Registro dos ensaios com data e hora',
    detalhe: 'O log fica no cartão local, não na nuvem: Wi-Fi cai, e o registro não pode ter buraco.',
    tensao: '5V', largura: 60,
    terminais: { 'VCC': '5 V', 'GND': '0 V', 'CS': 'D53', 'SCK': 'D52', 'MOSI': 'D51', 'MISO': 'D50',
                 'SDA': 'D20', 'SCL': 'D21' },
  },

  // ── PORTA ──────────────────────────────────────────────────────────
  { id: 'H1', nome: 'Sinaleiro RUN', trilho: 'porta', x: 40, categoria: 'sinaleiro',
    descricao: 'Verde · processo rodando', tensao: '24V_SRV', largura: 40,
    terminais: { '+': 'do BD-24V', '-': 'para a PI-1 J2-5' } },
  { id: 'H2', nome: 'Sinaleiro COOL', trilho: 'porta', x: 90, categoria: 'sinaleiro',
    descricao: 'Azul · resfriando', tensao: '24V_SRV', largura: 40,
    terminais: { '+': 'do BD-24V', '-': 'para a PI-1 J2-6' } },
  { id: 'H3', nome: 'Sinaleiro HEAT', trilho: 'porta', x: 140, categoria: 'sinaleiro',
    descricao: 'Amarelo · aquecendo', tensao: '24V_SRV', largura: 40,
    terminais: { '+': 'do BD-24V', '-': 'para a PI-1 J2-7' } },
  { id: 'H4', nome: 'Sinaleiro FAULT', trilho: 'porta', x: 190, categoria: 'sinaleiro',
    descricao: 'Vermelho · falha. Fica aceso mesmo na emergência',
    tensao: '24V_SRV', largura: 40,
    terminais: { '+': 'do BD-24V', '-': 'para a PI-1 J2-8' } },
  { id: 'S0', nome: 'EMERGÊNCIA', trilho: 'porta', x: 250, categoria: 'botao',
    descricao: 'Cogumelo com trava · corta em hardware e NÃO religa sozinho',
    detalhe: 'Conforme ISO 13850: destravar libera, mas quem religa é o botão REARME.',
    tensao: '24V_SRV', largura: 40,
    terminais: { '11': 'comum NF', '12': 'NF (cadeia)', '21': 'comum NF 2', '22': 'NF 2 (avisa o Arduino)' } },
  { id: 'S1', nome: 'START', trilho: 'porta', x: 300, categoria: 'botao',
    descricao: 'Verde · dá partida no processo (software)', tensao: '5V', largura: 40,
    terminais: { '13': 'comum NA', '14': 'NA (para o Arduino D22)' } },
  { id: 'S2', nome: 'STOP', trilho: 'porta', x: 350, categoria: 'botao',
    descricao: 'Vermelho · corta em hardware, mas NÃO trava', tensao: '24V_SRV', largura: 40,
    terminais: { '11': 'comum NF', '12': 'NF (corta o KA2)', '13': 'comum NA', '14': 'NA (avisa o Arduino)' } },
  { id: 'S3', nome: 'REARME', trilho: 'porta', x: 400, categoria: 'botao',
    descricao: 'Azul · refaz o selo do KA1 depois de uma emergência',
    tensao: '24V_SRV', largura: 40,
    terminais: { '13': 'comum NA', '14': 'NA (para a bobina do KA1)' } },
];

// ─────────────────────────────────────────────────────────────────────
// CABOS — de onde sai, para onde vai
// A numeração segue a lista do Doc 30.
// ─────────────────────────────────────────────────────────────────────
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
export const PI1_INTERNO = {
  componentes: [
    { ref: 'C1', tipo: 'capacitor', valor: '100 nF', entre: ['J1-1 / J2-1', '0 V'],
      papel: 'Filtra o ruído que o cabo do BTS captou' },
    { ref: 'C2', tipo: 'capacitor', valor: '100 nF', entre: ['J1-2 / J2-2', '0 V'],
      papel: 'Idem, para o BTS #2' },
    { ref: 'R3', tipo: 'resistor', valor: '4,7 kΩ', entre: ['J1-11 (+5V)', 'J1-3 / J2-3'],
      papel: 'Pull-up do 1-Wire. SEM ele não existe barramento — o sensor só sabe puxar para 0 V' },
    { ref: 'R1', tipo: 'resistor', valor: '22 kΩ', entre: ['J1-4 (24V-POT)', 'nó D25'],
      papel: 'Braço superior do divisor' },
    { ref: 'R2', tipo: 'resistor', valor: '4,7 kΩ', entre: ['nó D25', '0 V'],
      papel: 'Braço inferior. 24 × 4,7/26,7 = 4,22 V' },
    { ref: 'C3', tipo: 'capacitor', valor: '100 nF', entre: ['nó D25', '0 V'],
      papel: 'Filtra o nó de alta impedância' },
    { ref: 'CI1', tipo: 'ci', valor: 'ULN2803A', entre: ['J1-5..8 (D9..D12)', 'J2-5..8 (L1..L4)'],
      papel: 'Deixa o Arduino (5 V) comandar sinaleiros de 24 V. É o "relé de interface" dos sinaleiros' },
  ],
  nota: 'Os 2 resistores de 10 kΩ (pull-down do R_EN) NÃO ficam aqui — vão soldados '
      + 'dentro dos próprios BTS7960, para que um rompimento de cabo ainda deixe o driver desligado.',
};

/** Índice: terminal "COMP:TERM" → lista de cabos que chegam nele. */
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
