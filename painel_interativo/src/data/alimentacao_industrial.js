/** Exemplos industriais são alternativas; não entram automaticamente na compra do protótipo. */
export const ALTERNATIVAS=[
 {nome:'Proposta provisória — bloqueada',entrada:'Rede AC → PS1 24 Vcc',saida:'T2: 24→5,0 V/5 A · T3: 24→12 V/20 A',uso:'Modelos e fichas ainda não aprovados. Confirmar tensão máxima/transientes de entrada do T2 e capacidade contínua/térmica do T3. Não alimentar diretamente o pino 5V do Mega sem validar a placa. O PTC 12 V/50 W exige ramal e corte DC independentes, ainda não definidos; não comprar nem energizar.',fonte:null},
 {nome:'Conversores DC/DC industriais DIN',entrada:'Barramento 24 Vcc',saida:'Uma saída regulada por tensão necessária',uso:'Exemplos: MEAN WELL DDR-15G-5 (5 V / 3 A) e DDR-30G-12 (12 V / 2,5 A), entrada 9–36 Vcc. São referências para cotação após calcular a carga, não substituições já aprovadas.',fonte:'https://www.meanwell.com/Upload/PDF/DIN_s.pdf'},
 {nome:'Fontes AC/DC separadas',entrada:'Rede AC com proteção de cada circuito',saida:'Fonte 24 V + fonte 5 V e/ou fonte 12 V',uso:'Também é possível. Escolher por potência, espaço, custo e manutenção. Não ligar saídas em paralelo. Definir as referências 0 V e a proteção de cada fonte.',fonte:null},
 {nome:'Equipamentos nativos em 24 V',entrada:'24 Vcc industrial',saida:'Tensão nominal do próprio equipamento',uso:'Quando sensores, I/O, IHM e ventiladores aceitarem 24 V, elimina conversores desnecessários. Arduino, MAX485 e a lógica de 5 V continuam exigindo alimentação adequada.',fonte:null},
];
export const FONTES_TECNICAS=[
 {nome:'MEAN WELL — conversores DDR para trilho DIN',url:'https://www.meanwell.com/Upload/PDF/DIN_s.pdf'},
 {nome:'MEAN WELL — instalação DDR',url:'https://www.meanwell.com/Upload/PDF/DDR%20DIN%20rail%20power%20supply.pdf'},
 {nome:'Arduino Mega — quatro UARTs',url:'https://docs.arduino.cc/hardware/mega-2560/'},
 {nome:'MAX485 — transceptor 5 V',url:'https://www.analog.com/en/products/max485.html'},
];
