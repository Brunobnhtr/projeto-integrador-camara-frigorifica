/** Guia vigente, derivado da mesma fiação que o desenho renderiza. */
import {FIOS,CORES,ETAPAS} from './fiacao.js';
import {DISCRETOS} from './discretos.js';
export const FASES=[
 {id:'A',nome:'Montagem mecânica',icone:'📐',resumo:'Peças reais, fixações e separação AC/DC.',onde:'desenergizado'},
 {id:'B',nome:'Fonte e conversores',icone:'🔌',resumo:'Proposta T2/T3/PTC em revisão; não energizar o ramal do PTC.',onde:'rede AC somente por profissional habilitado'},
 {id:'C',nome:'Ligações fio a fio',icone:'🔩',resumo:'Ligações aprovadas; o ramo de potência do PTC está bloqueado.',onde:'desligado e ausência de tensão verificada'},
 {id:'D',nome:'Medição por Modbus',icone:'📏',resumo:'MAX485 no Serial3 e N4AIC24 lendo as 8 posições e as 2 tensões.',onde:'bancada, cargas térmicas desconectadas'},
 {id:'E',nome:'Ensaios e liberação',icone:'✓',resumo:'Validar medição direta, paradas e térmica antes de apresentar.',onde:'montagem supervisionada'},
];
const passo=(id,fase,titulo,faca,confira,seErrar='',extra={})=>({id,fase,titulo,faca,confira,seErrar:seErrar||'Não avançar se a conferência falhar: desenergizar, localizar a divergência e repetir a medição.',antes:'Concluir e medir a etapa anterior. Desenergizar antes de alterar ligações.',tempo:'conforme conferência',pegue:['diagrama e manual das peças reais','multímetro','ferramenta e terminais adequados'],...extra});
export const PASSOS=[
 passo('A-01','A','Conferir as peças e o espaço do painel',[
  'Escopo: painel, câmara e base de pinus; não instalar subestação, postes ou ambientação.',
  'O painel 700 × 700 × 250 mm é proposta de envelope. Medir a fonte, os suportes e os conversores; respeitar folgas térmicas e a abertura da porta antes de fabricar.',
  'Medição por um único módulo N4AIC24 (22 correntes + 2 tensões) em Modbus RTU, com MAX485 no Serial3 do Mega. Só 8 canais de corrente estão em uso; as tensões de 24 V e 12 V entram em V1 e V2. As entradas analógicas A2 e A3 continuam livres — não há sensor analógico de corrente nem divisor de tensão no painel.',
 ],'Peças e medidas reais conferidas. Nenhuma placa solta ou encostada na chapa.'),
 passo('A-02','A','Montar trilhos, canaletas e proteção dos bornes AC',[
  'Instalar os quatro trilhos na posição do desenho. Fonte PS1 e Q0 ficam na região inferior; não montar conversores nem proteção de potência até aprovação do modelo e dimensionamento.',
  'Manter entrada AC em corredor exclusivo, protegido contra toque e separado dos sinais. O suporte e a ventilação dos conversores dependem das fichas dos modelos escolhidos.',
  'Passar os chicotes móveis da porta com folga: sinal por CL-sin e comando por CL-pot. A antena fica na lateral, sem dobrar o coaxial na porta.',
 ],'Acesso aos bornes, ventilação e fechamento da porta verificados.'),
 passo('A-03','A','Montar os passivos em uso',[
  'C1/C2: 100 nF entre A0/A1 e GND2 do Mega (diagnóstico dos BTS). ⭐ Os C3/C4 saíram: eles filtravam as entradas A2/A3, que hoje estão livres.',
  'R8/R9: pull-down dos BTS. R10/R11/R12: pull-down dos três relés.',
  'D1: supressão da bobina do KM1, se não houver proteção interna apropriada. D2/D3: junto aos dois grupos de ventoinhas; conferir polaridade.',
 ],'Valores, polaridades e conexões conferidos. Sem resistores de terminação no RS-485.', '',{discretos:DISCRETOS.filter(d=>d.passo==='A-03').map(d=>d.id)}),
 passo('B-01','B','Ligar PE, entrada AC, Q0 e PS1',[
  'Profissional habilitado define proteção Q0 e cabo pela rede, corrente de entrada, inrush e fonte real. Não tratar C6 como dimensionamento já aprovado.',
  'Com a alimentação desligada e ausência de tensão verificada, ligar PE da rede à barra PE; dela à carcaça da fonte, gabinete metálico e porta por ligação flexível. PE não é 0 V.',
  'Ligar os dois condutores ativos aos dois polos de Q0 e destes aos bornes L/N da fonte. Em 220 V fase-fase, não presumir neutro. Conferir seletor da fonte, se existir.',
 ],'Continuidade de proteção, torque e proteção contra toque inspecionados.','Não fazer ligações de rede usando apenas uma foto ou um rótulo genérico.'),
 passo('B-02','B','Medir os 24 V e proteger os ramais',[
  'Manter lógica, conversores e cargas desconectados. Após inspeção, energizar somente PS1 e medir +24V contra 0V.',
  'Ajustar nominal de 24,0 V conforme a fonte. 25 V não é o nominal do projeto.',
  'Não instalar os fusíveis legados como dimensionamento final. F3 de 2 A não foi validado para T3 e o PTC 12 V; coordenar corrente, cabos, porta-fusível e capacidade DC antes da compra.',
 ],'24 Vcc medidos e polaridade correta; proteções do sistema ainda bloqueadas.'),
 passo('B-03','B','Ajustar T2 e T3 sem eletrônica conectada',[
  '⛔ Não executar a ligação ainda. A proposta é T2 24→5,0 V/5 A e T3 24→12 V/20 A, mas o modelo exato e as fichas não foram aprovados.',
  'Para T2, confirmar que a faixa máxima de entrada suporta a tensão máxima real da fonte e transientes. A saída de 5,0 V não autoriza alimentar diretamente o pino 5V do Mega sem análise da placa.',
  'T3 deve separar o BD-AUX permanente do ramal do PTC, com corte DC e proteção dimensionados. KM1 não corta esse ramal de 12 V.',
 ],'ETAPA BLOQUEADA até validação de conversores, cabos, proteções e ligação de alimentação.','Não ligar cargas nem energizar o PTC até haver projeto aprovado.'),
 passo('C-00','C','Preparar terminais e conferir cada condutor',[
  'Seguir as seis tabelas abaixo. A anilha identifica o fio; a cor identifica sua função.',
   'Não instalar o antigo fio D2 de BD-POT para BTS2. O PTC proposto é de 12 V e o novo ramal, corte DC, proteção, condutores e retorno ainda não foram definidos.',
  'Cortar com folga, identificar as duas pontas, crimpar o terminal adequado e apertar conforme o borne real.',
  'Testar continuidade ponta a ponta antes de marcar. Seções do modelo e roteamento devem ser validados na instalação.',
 ],'Fios identificados, sem cobre exposto e sem retornos comprimidos em borne incompatível.'),
 passo('D-01','D','Ligar o MAX485 ao Mega e o resistor de pull-down',[
  'MAX485 no trilho 3, ao lado do Mega. VCC no BD-5V · O8 e GND no BD-0V-B · Z17.',
  'RO → D15 (RX3), DI → D14 (TX3) e DE/RE → D26. ⭐ Inverter RO com DI é o erro clássico: o Mega fala para si mesmo e o módulo nunca responde.',
  'R13 de 10 kΩ entre o DE/RE e o GND2 do Mega. Sem ele o pino flutua entre o reset e a primeira linha do setup e o barramento vê lixo.',
  'Par trançado A/B até os bornes A e B do módulo. Sem terminação de 120 Ω — a linha tem menos de 40 cm.',
 ],'Com o Mega transmitindo, A contra B dá 1 a 2 V de diferença; em repouso o DE/RE está em 0 V.', 'Se A e B estiverem trocados nada queima — o barramento só fica mudo. Troque os dois antes de suspeitar do firmware.',{discretos:DISCRETOS.filter(d=>d.passo==='D-01').map(d=>d.id)}),
 passo('D-02','D','Alimentar e endereçar o módulo de medição',[
  'V+ no BD-24V · O3 (permanente, de propósito) e GND no BD-0V-B · Z22. O módulo tem que sobreviver à emergência para poder dizer que a potência caiu.',
  'V1 no BD-POT · O3 — é o antigo fio do D25, agora medindo em volts. V2 no BD-12V · O3.',
  'GND no BD-0V-B · Z22 — é o ÚNICO retorno do módulo: fecha os 22 shunts e a alimentação no mesmo parafuso. ⭐ O N4AIC24 não tem borne COM (a pinagem é VIN, GND, I1..I22, V1+, V2+, A+, B−). Se algum desenho mostrar COM, o desenho é que está errado.',
  'Endereço 1, 9600 8N1, função 04, registradores a partir de 0x0000. Ler os 24 canais numa requisição só (~70 ms).',
 ],'V1 ≈ 24,0 V e V2 ≈ 12,0 V na tela; os 24 registradores respondem numa leitura única.', 'Módulo mudo: conferir A/B, o endereço e se o firmware solta o DE depois de perguntar.',{discretos:DISCRETOS.filter(d=>d.passo==='D-02').map(d=>d.id)}),
 passo('D-03','D','Testar a detecção de falha nas posições de ensaio',[
  'Com as 8 posições acesas, I1 a I8 devem ler 7 a 9 mA cada. Registrar o valor de cada uma como referência.',
  'Desligar a chave da posição 1 na placa F-P: I1 cai a 0,00 mA e o alarme de posição 1 dispara em menos de 1 s. Ligar de novo e conferir que volta.',
  'Repetir posição por posição (F-P2 a F-P8, canais I2 a I8), validando independência total: com uma chave aberta, as outras sete não podem mudar de leitura.',
  '⭐ Testar também a diferença entre os dois zeros: chave aberta (I = 0 mA, V2 = 12 V) e T3 caído (I = 0 mA, V2 = 0 V). É o que separa falha de posição de falha de alimentador.',
 ],'Identificação imediata de qual posição falhou e de qual alimentador caiu — sem depender de leitura analógica de corrente.', 'Se a corrente ficar em zero com a posição acesa, o retorno foi ligado direto no 0 V em vez de passar pelo canal do módulo.',{discretos:DISCRETOS.filter(d=>d.passo==='D-03').map(d=>d.id)}),
 passo('E-01','E','Testar comando e estado seguro antes das cargas térmicas',[
  'Testar LIGAR, STOP, emergência e veto do KA1. Soltar a emergência não pode refazer o selo KM1.',
  'Em emergência, potência térmica cai, mas lógica e ventilação de segurança permanecem vivas. Q0 desliga a alimentação geral.',
  'Reiniciar o Mega. Conferir que não há partida automática nem perda dos intertravamentos.',
 ],'Corte em hardware e comportamento de boot comprovados.'),
 passo('E-02','E','Conectar a câmara e executar ensaios supervisionados',[
  'Conferir Peltier em série, polaridade, montagem térmica e os dois sinais de RPM do radiador.',
  'Conferir a tensão de todas as fans incluídas nos kits, especialmente a do PTC. Não ligar uma fan 24 V ao grupo 12 V por suposição.',
  'Conectar as cargas uma a uma; medir corrente e temperatura da fonte/conversores. Testar alarmes térmicos, pós-ventilação e perda de fan.',
  'Registrar medições, fotos e alterações de montagem antes de liberar a apresentação.',
 ],'Conjunto validado com as peças reais e resultados registrados.'),
];
export const PASSOS_FIACAO=ETAPAS.map(e=>passo(`C-0${e.n}`,'C',`Etapa ${e.n} · ${e.nome}`,[
 'Localizar cada origem e destino na tabela; passar pela sequência de canaletas indicada.',
 'Conferir seção e polaridade, crimpar, apertar e medir continuidade antes de marcar.',
],`${FIOS.filter(f=>f.etapa===e.n&&!f.bloqueado).length} condutores inspecionados.`,e.n===1?'AC e PE exigem validação da instalação real.':'Sinal analógico e comando separados de potência.',{fios:FIOS.filter(f=>f.etapa===e.n&&!f.bloqueado),diz:e.resumo}));
export const TODOS=[...PASSOS,...PASSOS_FIACAO].sort((a,b)=>a.id.localeCompare(b.id));
export const discretosDo=passo=>(passo.discretos??[]).map(id=>DISCRETOS.find(d=>d.id===id)).filter(Boolean);
export const CORES_FIO=CORES;
