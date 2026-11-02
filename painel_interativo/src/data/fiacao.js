export const CORES={
  "pot24": {
    "hex": "#c92a2a",
    "nome": "vermelho",
    "diz": "+24 V de POTÊNCIA — cai na emergência"
  },
  "srv24": {
    "hex": "#e8590c",
    "nome": "laranja",
    "diz": "24 V permanente em emergência; desliga com Q0"
  },
  "aux12": {
    "hex": "#f59f00",
    "nome": "amarelo",
    "diz": "+12 V auxiliar"
  },
  "log5": {
    "hex": "#7048e8",
    "nome": "violeta",
    "diz": "+5 V de lógica"
  },
  "zero": {
    "hex": "#1864ab",
    "nome": "azul escuro",
    "diz": "0 V comum"
  },
  "medida": {
    "hex": "#2f9e44",
    "nome": "verde",
    "diz": "analógico e medição"
  },
  "digital": {
    "hex": "#495057",
    "nome": "cinza",
    "diz": "sinal digital"
  },
  "ac": {
    "hex": "#5c3d2e",
    "nome": "marrom / azul conforme rede",
    "diz": "AC — rede; circuito exclusivo e protegido"
  },
  "pe": {
    "hex": "#2f9e44",
    "nome": "verde-amarelo",
    "diz": "PE — proteção, nunca substituir por 0 V"
  }
};
export const ETAPAS=[
  {
    "n": 1,
    "nome": "Alimentação interna",
    "resumo": "Entrada AC e PE → Q0 → fonte 24 V → F1/F2/F3 → conversores 5 V e 12 V.",
    "feito": false
  },
  {
    "n": 2,
    "nome": "Comando e emergência",
    "resumo": "Um selo KM1, com emergência, STOP, LIGAR e veto KA1.",
    "feito": false
  },
  {
    "n": 3,
    "nome": "Distribuição e aquisição",
    "resumo": "Alimentação de sensores e retornos; duas posições de ensaio em A2 e A3.",
    "feito": false
  },
  {
    "n": 4,
    "nome": "Sinais e supervisão no Mega",
    "resumo": "Serial1 para ESP32; Serial2 para IHM; sensores analógicos e comandos no Mega.",
    "feito": false
  },
  {
    "n": 5,
    "nome": "Porta",
    "resumo": "IHM, conversor de nível, sinaleiros e contatos de comando.",
    "feito": false
  },
  {
    "n": 6,
    "nome": "Câmara e radiador",
    "resumo": "Saídas de potência e sinais de sensores/rotação.",
    "feito": false
  }
];
export const FIOS=[
  {
    "n": "AC1",
    "etapa": 1,
    "de": {
      "prensa": "AC-IN",
      "borne": "L/F1"
    },
    "para": {
      "comp": "Q0",
      "via": "L_IN"
    },
    "func": "ac",
    "mm2": 1.5,
    "nome": "Entrada AC → Q0 polo 1",
    "diz": "Entrada AC → Q0 polo 1",
    "classe": "potencia",
    "rota": [
      "CV-ac"
    ],
    "cor": "#5c3d2e",
    "corNome": "marrom / azul (conforme rede)"
  },
  {
    "n": "AC2",
    "etapa": 1,
    "de": {
      "prensa": "AC-IN",
      "borne": "N/F2"
    },
    "para": {
      "comp": "Q0",
      "via": "N_IN"
    },
    "func": "ac",
    "mm2": 1.5,
    "nome": "Entrada AC → Q0 polo 2",
    "diz": "Entrada AC → Q0 polo 2",
    "classe": "potencia",
    "rota": [
      "CV-ac"
    ],
    "cor": "#5c3d2e",
    "corNome": "marrom / azul (conforme rede)"
  },
  {
    "n": "PE1",
    "etapa": 1,
    "de": {
      "prensa": "AC-IN",
      "borne": "PE"
    },
    "para": {
      "comp": "PE",
      "via": "IN"
    },
    "func": "pe",
    "mm2": 1.5,
    "nome": "Terra da rede → barra PE",
    "diz": "Terra da rede → barra PE",
    "classe": "comum",
    "rota": [
      "CV-ac",
      "CH-ac"
    ]
  },
  {
    "n": "AC3",
    "etapa": 1,
    "de": {
      "comp": "Q0",
      "via": "L_OUT"
    },
    "para": {
      "comp": "PS1",
      "via": "L"
    },
    "func": "ac",
    "mm2": 1.5,
    "nome": "Q0 → fonte L",
    "diz": "Q0 → fonte L",
    "classe": "potencia",
    "rota": [
      "CH-ac"
    ],
    "cor": "#5c3d2e",
    "corNome": "marrom / azul (conforme rede)"
  },
  {
    "n": "AC4",
    "etapa": 1,
    "de": {
      "comp": "Q0",
      "via": "N_OUT"
    },
    "para": {
      "comp": "PS1",
      "via": "N"
    },
    "func": "ac",
    "mm2": 1.5,
    "nome": "Q0 → fonte N",
    "diz": "Q0 → fonte N",
    "classe": "potencia",
    "rota": [
      "CH-ac"
    ],
    "cor": "#5c3d2e",
    "corNome": "marrom / azul (conforme rede)"
  },
  {
    "n": "PE2",
    "etapa": 1,
    "de": {
      "comp": "PE",
      "via": "PS1"
    },
    "para": {
      "comp": "PS1",
      "via": "PE"
    },
    "func": "pe",
    "mm2": 1.5,
    "nome": "Barra PE → carcaça da fonte",
    "diz": "Barra PE → carcaça da fonte",
    "classe": "comum",
    "rota": [
      "CH-ac"
    ]
  },
  {
    "n": "E2",
    "etapa": 1,
    "de": {
      "comp": "PS1",
      "via": "0V"
    },
    "para": {
      "comp": "BD-0V",
      "via": "IN"
    },
    "func": "zero",
    "mm2": 1.5,
    "nome": "Fonte 0 V → retorno comum",
    "diz": "Fonte 0 V → retorno comum",
    "classe": "comum",
    "rota": [
      "CH-base",
      "CV-esq",
      "CH-2x1"
    ],
    "cor": "#1864ab",
    "corNome": "azul escuro"
  },
  {
    "n": "F1A",
    "etapa": 1,
    "de": {
      "comp": "PS1",
      "via": "+24V"
    },
    "para": {
      "comp": "F-R",
      "via": "F1_IN"
    },
    "func": "srv24",
    "mm2": 1.5,
    "nome": "Fonte 24 V → entrada protegida F1",
    "diz": "Fonte 24 V → entrada protegida F1",
    "classe": "alim",
    "rota": [
      "CH-base"
    ],
    "cor": "#e8590c",
    "corNome": "laranja"
  },
  {
    "n": "F2A",
    "etapa": 1,
    "de": {
      "comp": "PS1",
      "via": "+24V"
    },
    "para": {
      "comp": "F-R",
      "via": "F2_IN"
    },
    "func": "srv24",
    "mm2": 0.75,
    "nome": "Fonte 24 V → entrada protegida F2",
    "diz": "Fonte 24 V → entrada protegida F2",
    "classe": "alim",
    "rota": [
      "CH-base"
    ],
    "cor": "#e8590c",
    "corNome": "laranja"
  },
  {
    "n": "F3A",
    "etapa": 1,
    "de": {
      "comp": "PS1",
      "via": "+24V"
    },
    "para": {
      "comp": "F-R",
      "via": "F3_IN"
    },
    "func": "srv24",
    "mm2": 0.75,
    "nome": "Fonte 24 V → entrada protegida F3",
    "diz": "Fonte 24 V → entrada protegida F3",
    "classe": "alim",
    "rota": [
      "CH-base"
    ],
    "cor": "#e8590c",
    "corNome": "laranja"
  },
  {
    "n": "E1",
    "etapa": 1,
    "de": {
      "comp": "F-R",
      "via": "F1_OUT"
    },
    "para": {
      "comp": "KM1",
      "via": "11"
    },
    "func": "srv24",
    "mm2": 1.5,
    "nome": "F1 → contato de potência KM1",
    "diz": "F1 → contato de potência KM1",
    "classe": "alim",
    "rota": [
      "CH-1x4"
    ],
    "cor": "#e8590c",
    "corNome": "laranja"
  },
  {
    "n": "E5",
    "etapa": 1,
    "de": {
      "comp": "F-R",
      "via": "F2_OUT"
    },
    "para": {
      "comp": "BD-24V",
      "via": "IN"
    },
    "func": "srv24",
    "mm2": 0.75,
    "nome": "F2 → barramento permanente 24 V",
    "diz": "F2 → barramento permanente 24 V",
    "classe": "alim",
    "rota": [
      "CH-1x4",
      "CV-esq",
      "CH-2x1"
    ],
    "cor": "#e8590c",
    "corNome": "laranja"
  },
  {
    "n": "T2A",
    "etapa": 1,
    "de": {
      "comp": "F-R",
      "via": "F2_OUT"
    },
    "para": {
      "comp": "T2",
      "via": "IN+"
    },
    "func": "srv24",
    "mm2": 0.75,
    "nome": "F2 → entrada positiva do conversor 5 V",
    "diz": "F2 → entrada positiva do conversor 5 V",
    "classe": "alim",
    "rota": [
      "CH-1x4"
    ],
    "cor": "#e8590c",
    "corNome": "laranja"
  },
  {
    "n": "T3A",
    "etapa": 1,
    "de": {
      "comp": "F-R",
      "via": "F3_OUT"
    },
    "para": {
      "comp": "T3",
      "via": "IN+"
    },
    "func": "srv24",
    "mm2": 0.75,
    "nome": "F3 → entrada positiva do conversor 12 V",
    "diz": "F3 → entrada positiva do conversor 12 V",
    "classe": "alim",
    "rota": [
      "CH-1x4"
    ],
    "cor": "#e8590c",
    "corNome": "laranja"
  },
  {
    "n": "T2N",
    "etapa": 1,
    "de": {
      "comp": "T2",
      "via": "IN-"
    },
    "para": {
      "comp": "BD-0V",
      "via": "Z6"
    },
    "func": "zero",
    "mm2": 0.75,
    "nome": "Entrada negativa T2 → 0 V",
    "diz": "Entrada negativa T2 → 0 V",
    "classe": "comum",
    "rota": [
      "CH-1x4"
    ],
    "cor": "#1864ab",
    "corNome": "azul escuro"
  },
  {
    "n": "T3N",
    "etapa": 1,
    "de": {
      "comp": "T3",
      "via": "IN-"
    },
    "para": {
      "comp": "BD-0V",
      "via": "Z11"
    },
    "func": "zero",
    "mm2": 0.75,
    "nome": "Entrada negativa T3 → 0 V",
    "diz": "Entrada negativa T3 → 0 V",
    "classe": "comum",
    "rota": [
      "CH-1x4"
    ],
    "cor": "#1864ab",
    "corNome": "azul escuro"
  },
  {
    "n": "E3",
    "etapa": 1,
    "de": {
      "comp": "T2",
      "via": "OUT+"
    },
    "para": {
      "comp": "BD-5V",
      "via": "IN"
    },
    "func": "log5",
    "mm2": 0.75,
    "nome": "Saída T2 regulada → barramento 5 V",
    "diz": "Saída T2 regulada → barramento 5 V",
    "classe": "alim",
    "rota": [
      "CH-base",
      "CV-esq",
      "CH-2x1"
    ],
    "cor": "#7048e8",
    "corNome": "violeta"
  },
  {
    "n": "E4",
    "etapa": 1,
    "de": {
      "comp": "T3",
      "via": "OUT+"
    },
    "para": {
      "comp": "BD-AUX",
      "via": "IN"
    },
    "func": "aux12",
    "mm2": 0.75,
    "nome": "Saída T3 regulada → barramento 12 V",
    "diz": "Saída T3 regulada → barramento 12 V",
    "classe": "alim",
    "rota": [
      "CH-base",
      "CV-esq",
      "CH-2x1"
    ],
    "cor": "#f59f00",
    "corNome": "amarelo"
  },
  {
    "n": "E4b",
    "etapa": 3,
    "classe": "alim",
    "func": "aux12",
    "mm2": 0.5,
    "de": {
      "comp": "T3",
      "via": "OUT+2"
    },
    "para": {
      "comp": "BD-12V",
      "via": "IN"
    },
    "diz": "O segundo fio do mesmo borne: 12 V para as posições de ensaio.",
    "rota": [
      "CH-base",
      "CV-esq",
      "CH-2x1"
    ],
    "porque": "⛔ T3 ainda não tem modelo aprovado. Não presumir que os dois ramais compartilham um borne nem acomodar dois condutores sob o mesmo terminal. Definir o bloco de distribuição, seção, ferrules e capacidade DC depois de consultar a ficha do conversor real.",
    "cor": "#f59f00",
    "corNome": "amarelo",
    "nome": "12 V → BD-12V"
  },
  {
    "n": "C1",
    "etapa": 2,
    "func": "srv24",
    "nome": "alimentação da cadeia",
    "classe": "potencia",
    "de": {
      "comp": "BD-24V",
      "via": "O2"
    },
    "para": {
      "comp": "S0",
      "via": "11"
    },
    "mm2": 0.5,
    "rota": [
      "CH-1x4",
      "CV-esq",
      "CH-base",
      "CP-vpot",
      "CP-3x4"
    ],
    "diz": "Sai do barramento PERMANENTE e vai até o cogumelo, na porta.",
    "porque": "⭐ Vem do BD-24V e não do BD-POT. Se a cadeia de comando fosse alimentada pela potência que ela mesma comanda, nada nunca ligaria.",
    "cor": "#e8590c",
    "corNome": "laranja"
  },
  {
    "n": "C2",
    "etapa": 2,
    "func": "srv24",
    "nome": "⭐ EMERGÊNCIA → STOP, as duas em série",
    "classe": "potencia",
    "de": {
      "comp": "S0",
      "via": "12"
    },
    "para": {
      "comp": "S2",
      "via": "11"
    },
    "mm2": 0.5,
    "rota": [
      "CP-3x4"
    ],
    "diz": "Fio curto, todo dentro da porta: do cogumelo direto ao bloco NF do STOP.",
    "porque": "⭐ OS DOIS BLOCOS NF FICAM EM SÉRIE, e é isso que faz as duas paradas derrubarem o MESMO selo. Qualquer um dos dois aberto interrompe a bobina do KM1 — e o selo, uma vez perdido, não se refaz sozinho.",
    "aviso": "⚠️ Este fio não passa por relé nenhum. Antes existia um segundo relé de selo no meio do caminho; hoje o cogumelo alcança o STOP diretamente, e há um componente a menos entre o dedo e o corte.",
    "cor": "#e8590c",
    "corNome": "laranja"
  },
  {
    "n": "C3",
    "etapa": 2,
    "func": "srv24",
    "nome": "⭐ STOP → nó do selo do KM1",
    "classe": "potencia",
    "de": {
      "comp": "S2",
      "via": "12"
    },
    "para": {
      "comp": "S1",
      "via": "13"
    },
    "mm2": 0.5,
    "rota": [
      "CP-3x4"
    ],
    "diz": "Bloco NF: em repouso conduz. Apertado, abre — e derruba o selo do KM1.",
    "porque": "⭐ É AQUI QUE O STOP VIRA UM BOTÃO DE PARADA DE VERDADE. O bloco está DENTRO da malha do selo do KM1: aperta uma vez, a bobina cai, o contato de selo abre junto, e nem soltando o botão ela volta. Só o S1 verde religa. É o circuito universal de partida-parada, e não depende de uma linha de firmware.",
    "aviso": "🔥 NÃO CONFUNDA OS DOIS BLOCOS DO S2. O de 24 V (11-12) é este, o que corta de verdade; o de 5 V (13-14) só avisa o D23. Ligar o Arduino no de 24 V queima o pino; ligar a cadeia no de 5 V deixa o STOP sem efeito em hardware.",
    "cor": "#e8590c",
    "corNome": "laranja"
  },
  {
    "n": "C4",
    "etapa": 2,
    "func": "srv24",
    "nome": "nó do selo → comum do KM1",
    "classe": "potencia",
    "de": {
      "comp": "S1",
      "via": "13"
    },
    "para": {
      "comp": "KM1",
      "via": "21"
    },
    "mm2": 0.5,
    "rota": [
      "CP-3x4",
      "CP-vpot",
      "CH-base",
      "CV-esq",
      "CH-2x1"
    ],
    "diz": "O mesmo nó do C3, indo ao comum do contato de selo do KM1.",
    "cor": "#e8590c",
    "corNome": "laranja"
  },
  {
    "n": "C5",
    "etapa": 2,
    "func": "srv24",
    "nome": "⭐ LIGAR verde → bobina do KM1",
    "classe": "potencia",
    "de": {
      "comp": "S1",
      "via": "14"
    },
    "para": {
      "comp": "KM1",
      "via": "A1"
    },
    "mm2": 0.5,
    "rota": [
      "CP-3x4",
      "CP-vpot",
      "CH-base",
      "CV-esq",
      "CH-1x4"
    ],
    "diz": "Apertar o verde energiza a bobina do KM1 pela primeira vez.",
    "porque": "⭐ É NA de propósito: fio partido no LIGAR impede a máquina de armar a potência — que é o estado seguro. Se fosse NF, um fio partido armaria tudo sozinho. É o raciocínio inverso ao dos botões de parada, que são NF pelo mesmo motivo: a falha tem de levar ao estado seguro.",
    "aviso": "⚠️ ELE ARMA A POTÊNCIA, NÃO INICIA O ENSAIO. O ensaio começa no INICIAR da tela IHM. Etiquete o botão como LIGAR para o operador não confundir.",
    "cor": "#e8590c",
    "corNome": "laranja"
  },
  {
    "n": "C6",
    "etapa": 2,
    "func": "srv24",
    "nome": "⭐ O SELO",
    "classe": "potencia",
    "de": {
      "comp": "KM1",
      "via": "24"
    },
    "para": {
      "comp": "KM1",
      "via": "A1"
    },
    "mm2": 0.5,
    "rota": [],
    "diz": "O contato do próprio KM1 realimentando a própria bobina — ponte na base.",
    "porque": "🔥 É ESTE FIO QUE FAZ A MÁQUINA LEMBRAR. Solta o botão verde e o KM1 continua ligado, porque agora se alimenta pelo próprio contato. Abriu a corrente em qualquer ponto — cogumelo, STOP, veto do KA1, falta de energia — a bobina cai, o contato abre e o selo se perde. Só um novo LIGAR religa. Memória sem software.",
    "aviso": "⚠️ Sem este fio o KM1 fica ligado só enquanto o verde estiver apertado, e a máquina desliga sozinha assim que a pessoa tira o dedo.",
    "cor": "#e8590c",
    "corNome": "laranja"
  },
  {
    "n": "C7",
    "etapa": 2,
    "func": "zero",
    "nome": "⭐ bobina do KM1 → contato do KA1",
    "classe": "comum",
    "de": {
      "comp": "KM1",
      "via": "A2"
    },
    "para": {
      "comp": "KA123",
      "via": "COM1"
    },
    "mm2": 0.5,
    "rota": [
      "CH-2x1"
    ],
    "diz": "O retorno da bobina do KM1 já não vai direto ao 0 V: passa pelo contato do KA1.",
    "porque": "⭐ É AQUI QUE MORA O VETO DO FIRMWARE. Com o KA1 aberto, a bobina do KM1 não energiza — e como o KM1 tem selo próprio, basta um pulso de 50 ms para o selo se perder e a potência ficar cortada até alguém apertar o botão verde. É o que dá ao trip um corte FÍSICO e RETENTIVO, em vez de só baixar o R_EN.",
    "aviso": "⚠️ EM SÉRIE, NUNCA EM PARALELO. O KA1 está no caminho da bobina, DEPOIS do S0 e do S2. Assim ele só pode DERRUBAR a potência — jamais mantê-la contra uma botoeira. Um contato de software em paralelo com o STOP ou com o selo faria o firmware furar a emergência.",
    "cor": "#1864ab",
    "corNome": "azul escuro"
  },
  {
    "n": "C8",
    "etapa": 2,
    "func": "zero",
    "nome": "contato do KA1 → 0 V",
    "classe": "comum",
    "de": {
      "comp": "KA123",
      "via": "NO1"
    },
    "para": {
      "comp": "BD-0V",
      "via": "Z12"
    },
    "mm2": 0.5,
    "rota": [
      "CH-2x1",
      "CV-esq",
      "CH-1x4"
    ],
    "diz": "Fecha o circuito da bobina do KM1 no ponto Z12 da barra.",
    "aviso": "🔥 USE O NO (NORMALMENTE ABERTO), NUNCA O NC. Módulo sem energia = contato aberto = potência cortada. No NC, um Arduino desligado ARMARIA a potência. ⚠ O KA2 usa o NC de propósito — lá o estado seguro é o contrário (§31.14).",
    "cor": "#1864ab",
    "corNome": "azul escuro"
  },
  {
    "n": "C9",
    "etapa": 2,
    "func": "srv24",
    "nome": "⭐ roda-livre da bobina do KM1",
    "classe": "potencia",
    "de": {
      "comp": "KM1",
      "via": "A1"
    },
    "para": {
      "comp": "KM1",
      "via": "A2"
    },
    "mm2": 0.5,
    "rota": [],
    "diz": "Diodo 1N4007 direto nos bornes da bobina — catodo (faixa) no A1.",
    "porque": "🔥 COM UM CONTATO SECO ABRINDO A BOBINA, O PICO INDUTIVO FORMA ARCO NO CONTATO DO KA1. O diodo grampeia em ~24,7 V e o contato interrompe limpo. Sem ele o contato pita e, depois de algumas centenas de operações, solda — e um contato soldado no caminho da bobina é o veto do firmware perdido.",
    "aviso": "⚠️ INVERTIDO ELE CURTO-CIRCUITA A BOBINA e derruba o F2 assim que o verde for apertado. Antes de montar, teste o KM1 com o multímetro em TESTE DE DIODO entre A1 e A2: se já conduzir num sentido só, o relé tem diodo interno e este é dispensável.",
    "cor": "#e8590c",
    "corNome": "laranja"
  },
  {
    "n": "C10",
    "etapa": 2,
    "func": "pot24",
    "nome": "24 V comandado → BD-POT",
    "classe": "potencia",
    "de": {
      "comp": "KM1",
      "via": "14"
    },
    "para": {
      "comp": "BD-POT",
      "via": "IN"
    },
    "mm2": 1.5,
    "rota": [
      "CH-1x4",
      "CV-esq",
      "CH-2x1"
    ],
    "diz": "A saída do contato de potência do KM1, indo ao barramento comutado.",
    "porque": "⭐ Daqui para a frente tudo cai na emergência: os dois BTS e o 24 V de potência da PI-1. É a fronteira entre o que morre e o que continua vivo.",
    "aviso": "⚠️ 1,5 mm², a mesma bitola da entrada — este fio conduz os mesmos 6 A das Peltier. Usar 0,5 aqui aquece e derruba tensão.",
    "cor": "#c92a2a",
    "corNome": "vermelho"
  },
  {
    "n": "D1",
    "etapa": 3,
    "classe": "potencia",
    "func": "pot24",
    "mm2": 1.5,
    "de": {
      "comp": "BD-POT",
      "via": "O1"
    },
    "para": {
      "comp": "BTS1",
      "via": "B+"
    },
    "diz": "Alimentação de potência do BTS das Peltier.",
    "rota": [
      "CH-1x4",
      "CV-esq",
      "CH-2x1"
    ],
    "aviso": "⚠️ 1,5 mm². Este par conduz 6 A — é o fio de maior corrente do painel, junto com o B−.",
    "cor": "#c92a2a",
    "corNome": "vermelho",
    "nome": "Alimentação de potência do BTS das Peltier."
  },
  {
    "n": "D4",
    "etapa": 3,
    "classe": "potencia",
    "func": "srv24",
    "mm2": 0.5,
    "de": {
      "comp": "BD-24V",
      "via": "O1"
    },
    "para": {
      "comp": "ESP32",
      "via": "+"
    },
    "diz": "Alimenta o DNLCB30 e o ESP32 que vai encaixado nele.",
    "rota": [
      "CH-1x4",
      "CV-esq",
      "CH-2x1"
    ],
    "porque": "⭐ Permanente de propósito: se o MQTT caísse junto com a emergência, ninguém saberia remotamente que houve uma.",
    "cor": "#e8590c",
    "corNome": "laranja",
    "nome": "Alimenta o DNLCB30 e o ESP32 que vai encaixado nele."
  },
  {
    "n": "D7",
    "etapa": 3,
    "classe": "alim",
    "func": "log5",
    "mm2": 0.5,
    "de": {
      "comp": "BD-5V",
      "via": "O1"
    },
    "para": {
      "comp": "MEGA",
      "via": "+5V"
    },
    "diz": "Alimenta o Arduino pelo pino 5V — não pelo USB.",
    "rota": [
      "CH-1x4",
      "CV-esq",
      "CH-topo"
    ],
    "aviso": "⚠️ Entrando pelo pino 5V, o regulador do Arduino fica FORA do caminho. Nunca alimente pelo 5V e pelo USB ao mesmo tempo.",
    "cor": "#7048e8",
    "corNome": "violeta",
    "nome": "Alimenta o Arduino pelo pino 5V — não pelo USB."
  },
  {
    "n": "D8",
    "etapa": 3,
    "classe": "alim",
    "func": "log5",
    "mm2": 0.5,
    "de": {
      "comp": "BD-5V",
      "via": "O3"
    },
    "para": {
      "comp": "RTC",
      "via": "VCC"
    },
    "diz": "O relógio, que guarda a hora dos ensaios.",
    "rota": [
      "CH-1x4",
      "CV-esq",
      "CH-3x2"
    ],
    "cor": "#7048e8",
    "corNome": "violeta",
    "nome": "O relógio, que guarda a hora dos ensaios."
  },
  {
    "n": "D9",
    "etapa": 3,
    "classe": "alim",
    "func": "log5",
    "mm2": 0.5,
    "de": {
      "comp": "BD-5V",
      "via": "O4"
    },
    "para": {
      "comp": "BTS1",
      "via": "VCC"
    },
    "diz": "Lado lógico do BTS #1 — não confundir com o B+.",
    "rota": [
      "CH-1x4",
      "CV-esq",
      "CH-3x2"
    ],
    "aviso": "🔥 VCC é a LÓGICA (5 V, miliampères). B+ é a POTÊNCIA (24 V, 6 A). Ligar 24 V no VCC destrói o módulo na hora.",
    "cor": "#7048e8",
    "corNome": "violeta",
    "nome": "Lado lógico do BTS #1 — não confundir com o B+."
  },
  {
    "n": "D10",
    "etapa": 3,
    "classe": "alim",
    "func": "log5",
    "mm2": 0.5,
    "de": {
      "comp": "BD-5V",
      "via": "O5"
    },
    "para": {
      "comp": "BTS2",
      "via": "VCC"
    },
    "diz": "Idem para o BTS #2.",
    "rota": [
      "CH-1x4",
      "CV-esq",
      "CH-3x2"
    ],
    "cor": "#7048e8",
    "corNome": "violeta",
    "nome": "Idem para o BTS #2."
  },
  {
    "n": "D11",
    "etapa": 3,
    "classe": "alim",
    "func": "log5",
    "mm2": 0.5,
    "de": {
      "comp": "BD-5V",
      "via": "O6"
    },
    "para": {
      "comp": "AD-1",
      "via": "+"
    },
    "diz": "O 5 V que alimenta o pull-up do 1-Wire no AD-1.",
    "rota": [
      "CH-1x4",
      "CV-esq",
      "CH-3x2"
    ],
    "cor": "#7048e8",
    "corNome": "violeta",
    "nome": "O 5 V que alimenta o pull-up do 1-Wire no AD-1."
  },
  {
    "n": "D12",
    "etapa": 3,
    "classe": "alim",
    "func": "log5",
    "mm2": 0.5,
    "de": {
      "comp": "BD-5V",
      "via": "O8"
    },
    "para": {
      "comp": "MAX485",
      "via": "VCC"
    },
    "diz": "Os 5 V do transceptor RS-485.",
    "rota": [
      "CH-1x4",
      "CV-esq",
      "CH-3x2"
    ],
    "porque": "⭐ O MAX485 é a única peça entre o Mega e o módulo de medição, e ele é de 5 V. Puxar do +5V do próprio Mega economizaria dois fios, mas jogaria o ruído do barramento dentro da régua que o ADC usa como referência.",
    "cor": "#7048e8",
    "corNome": "violeta",
    "nome": "5 V do MAX485"
  },
  {
    "n": "D14",
    "etapa": 3,
    "classe": "alim",
    "func": "aux12",
    "mm2": 0.75,
    "de": {
      "comp": "BD-AUX",
      "via": "O1"
    },
    "para": {
      "comp": "KA123",
      "via": "COM3"
    },
    "rota": [
      "CH-1x4",
      "CV-esq",
      "CH-2x1"
    ],
    "diz": "Os 12 V permanentes que o contato do KA3 entrega às 5 ventoinhas internas.",
    "porque": "🔧 IA AO VIN DO MV-1, que alimentava os 4 canais do módulo MOSFET. Agora vai ao COM do KA3 — mesmo barramento, mesma bitola, mesma rota. O que mudou é o que está do outro lado: um CONTATO SECO no lugar de um dreno.",
    "cor": "#f59f00",
    "corNome": "amarelo",
    "nome": "Os 12 V permanentes que o contato do KA3 entrega às 5 ventoinhas internas."
  },
  {
    "n": "D15",
    "etapa": 3,
    "classe": "comum",
    "func": "zero",
    "mm2": 1.5,
    "de": {
      "comp": "BTS1",
      "via": "B−"
    },
    "para": {
      "comp": "BD-0V",
      "via": "Z1"
    },
    "diz": "Retorno de potência do BTS #1 — 6 A.",
    "rota": [
      "CH-3x2",
      "CV-esq",
      "CH-1x4"
    ],
    "cor": "#1864ab",
    "corNome": "azul escuro",
    "nome": "Retorno de potência do BTS #1 — 6 A."
  },
  {
    "n": "D16",
    "etapa": 3,
    "classe": "comum",
    "func": "zero",
    "mm2": 1.5,
    "de": {
      "comp": "BTS2",
      "via": "B−"
    },
    "para": {
      "comp": "BD-0V",
      "via": "Z2"
    },
    "diz": "Retorno de potência do BTS #2.",
    "rota": [
      "CH-3x2",
      "CV-esq",
      "CH-1x4"
    ],
    "cor": "#1864ab",
    "corNome": "azul escuro",
    "nome": "Retorno de potência do BTS #2."
  },
  {
    "n": "D17",
    "etapa": 3,
    "classe": "comum",
    "func": "zero",
    "mm2": 0.5,
    "de": {
      "comp": "BTS1",
      "via": "GND"
    },
    "para": {
      "comp": "BD-0V",
      "via": "Z3"
    },
    "diz": "Retorno da LÓGICA do BTS #1, em fio próprio.",
    "rota": [
      "CH-3x2",
      "CV-esq",
      "CH-1x4"
    ],
    "porque": "⭐ Fio separado do B−, e não uma ponte no módulo. Os 6 A do B− criam queda no próprio fio; se a lógica pendurasse nele, essa queda apareceria como ruído na referência do sinal IS.",
    "cor": "#1864ab",
    "corNome": "azul escuro",
    "nome": "Retorno da LÓGICA do BTS #1, em fio próprio."
  },
  {
    "n": "D18",
    "etapa": 3,
    "classe": "comum",
    "func": "zero",
    "mm2": 0.5,
    "de": {
      "comp": "BTS2",
      "via": "GND"
    },
    "para": {
      "comp": "BD-0V",
      "via": "Z4"
    },
    "diz": "Idem para o BTS #2.",
    "rota": [
      "CH-3x2",
      "CV-esq",
      "CH-1x4"
    ],
    "cor": "#1864ab",
    "corNome": "azul escuro",
    "nome": "Idem para o BTS #2."
  },
  {
    "n": "D19",
    "etapa": 3,
    "classe": "comum",
    "func": "zero",
    "mm2": 0.5,
    "de": {
      "comp": "MEGA",
      "via": "GND3"
    },
    "para": {
      "comp": "BD-0V",
      "via": "Z5"
    },
    "diz": "O 0 V do Arduino.",
    "rota": [
      "CH-3x2",
      "CV-esq",
      "CH-1x4"
    ],
    "cor": "#1864ab",
    "corNome": "azul escuro",
    "nome": "O 0 V do Arduino."
  },
  {
    "n": "D7b",
    "etapa": 3,
    "classe": "alim",
    "func": "log5",
    "mm2": 0.5,
    "de": {
      "comp": "BD-5V",
      "via": "O12"
    },
    "para": {
      "comp": "KA123",
      "via": "+5V"
    },
    "diz": "⭐ Alimenta os TRÊS módulos de relé — o DC+ é pontelhado entre eles na caixa.",
    "rota": [
      "CH-1x4",
      "CV-esq",
      "CH-2x1"
    ],
    "nome": "5 V dos módulos KA1/KA2",
    "aviso": "⚠️ 65 mA CADA, com o relé fechado. São 130 mA a mais no ramal T2 — some com o Arduino, a tela e o ESP32 antes de fechar o projeto de energia.",
    "cor": "#7048e8",
    "corNome": "violeta"
  },
  {
    "n": "D20b",
    "etapa": 3,
    "classe": "comum",
    "func": "zero",
    "mm2": 0.5,
    "de": {
      "comp": "KA123",
      "via": "0V"
    },
    "para": {
      "comp": "BD-0V-B",
      "via": "Z21"
    },
    "diz": "⭐ O DC− dos dois módulos, em ponto próprio da barra.",
    "rota": [
      "CH-2x1",
      "CV-esq",
      "CH-3x2"
    ],
    "porque": "📌 PONTO PRÓPRIO, e não pendurado. O DC− carrega os 130 mA das duas bobinas e é também a referência do sinal de gatilho — a entrada do módulo tem só três bornes, então o DC− É o 0 V do IN. Pendurá-lo num retorno de medição somaria corrente chaveada a uma referência.",
    "cor": "#1864ab",
    "corNome": "azul escuro",
    "nome": "⭐ O DC− dos dois módulos, em ponto próprio da barra."
  },
  {
    "n": "D6b",
    "etapa": 3,
    "classe": "alim",
    "func": "aux12",
    "mm2": 0.5,
    "de": {
      "comp": "BD-AUX",
      "via": "O2"
    },
    "para": {
      "comp": "KA123",
      "via": "COM2"
    },
    "diz": "⭐ Os 12 V permanentes entrando no contato do KA2.",
    "rota": [
      "CH-1x4",
      "CV-esq",
      "CH-2x1"
    ],
    "nome": "12 V → contato do KA2",
    "porque": "⭐ O KA2 fica EM SÉRIE com o lado POSITIVO das ventoinhas do radiador. O negativo delas (X6) vai direto ao BD-0V · Z15 e NUNCA é chaveado — é a referência dos dois tacômetros, e mexer nela foi o erro que tirou o comando destas ventoinhas na primeira versão.",
    "aviso": "🔥 A SAÍDA É O CONTATO NC2, NÃO O NO2. Ao contrário do KA1, aqui o estado seguro é FECHADO: módulo sem energia, ventoinha girando (§31.14).",
    "cor": "#f59f00",
    "corNome": "amarelo"
  },
  {
    "n": "D21",
    "etapa": 3,
    "classe": "comum",
    "func": "zero",
    "mm2": 0.5,
    "de": {
      "comp": "ESP32",
      "via": "−"
    },
    "para": {
      "comp": "BD-0V",
      "via": "Z7"
    },
    "diz": "Retorno do DNLCB30.",
    "rota": [
      "CH-2x1",
      "CV-esq",
      "CH-1x4"
    ],
    "cor": "#1864ab",
    "corNome": "azul escuro",
    "nome": "Retorno do DNLCB30."
  },
  {
    "n": "D22",
    "etapa": 3,
    "classe": "comum",
    "func": "zero",
    "mm2": 0.5,
    "de": {
      "comp": "RTC",
      "via": "GND"
    },
    "para": {
      "comp": "BD-0V",
      "via": "Z8"
    },
    "diz": "Retorno do relógio.",
    "rota": [
      "CH-3x2",
      "CV-esq",
      "CH-1x4"
    ],
    "cor": "#1864ab",
    "corNome": "azul escuro",
    "nome": "Retorno do relógio."
  },
  {
    "n": "D26b",
    "etapa": 3,
    "classe": "comum",
    "func": "zero",
    "mm2": 0.25,
    "de": {
      "comp": "AD-1",
      "via": "−"
    },
    "para": {
      "comp": "BD-0V-B",
      "via": "Z24"
    },
    "diz": "O 0 V do adaptador do DS18B20.",
    "rota": [
      "CH-3x2"
    ],
    "nome": "0 V do adaptador 1-Wire",
    "cor": "#1864ab",
    "corNome": "azul escuro"
  },
  {
    "n": "D27b",
    "etapa": 3,
    "classe": "comum",
    "func": "zero",
    "mm2": 4,
    "de": {
      "comp": "BD-0V",
      "via": "Z16"
    },
    "para": {
      "comp": "BD-0V-B",
      "via": "PT"
    },
    "diz": "A ponte que faz os dois blocos serem um nó só.",
    "rota": [
      "CH-1x4",
      "CV-esq",
      "CH-topo"
    ],
    "nome": "⭐ ponte entre os blocos de 0 V",
    "aviso": "⚠️ 4 mm², e é a MAIOR bitola do painel depois da entrada. Não é pela corrente: é para a queda ser desprezível e os dois blocos ficarem no mesmo potencial.",
    "cor": "#1864ab",
    "corNome": "azul escuro"
  },
  {
    "n": "D28b",
    "etapa": 3,
    "classe": "alim",
    "func": "aux12",
    "mm2": 0.5,
    "de": {
      "comp": "BD-12V",
      "via": "O1"
    },
    "para": {
      "comp": "F-P",
      "via": "VCC"
    },
    "diz": "12 V permanente para a barra de entrada das 8 gavetas.",
    "rota": [
      "CH-1x4",
      "CV-esq",
      "CH-3x2"
    ],
    "porque": "⭐ É 12 V, não 24 V: a placa de LED da câmara é de 12 V e o resistor de 1 kΩ foi calculado para isso. Em 24 V o mesmo resistor deixaria passar 20 mA e dissiparia quatro vezes mais calor dentro da câmara.",
    "cor": "#f59f00",
    "corNome": "amarelo",
    "nome": "12 V → barra do F-P"
  },
  {
    "n": "S1",
    "etapa": 4,
    "classe": "sinal",
    "func": "digital",
    "mm2": 0.25,
    "de": {
      "comp": "MEGA",
      "via": "D9"
    },
    "para": {
      "comp": "H1",
      "via": "+"
    },
    "diz": "O pino D9 alimenta o sinaleiro ENERGIZADO — 5 V, ~20 mA.",
    "rota": [
      "CH-topo",
      "CV-dir",
      "CP-vsin",
      "CP-2x3"
    ],
    "nome": "Mega D9 → sinaleiro ENERGIZADO",
    "cor": "#495057",
    "corNome": "cinza"
  },
  {
    "n": "S2",
    "etapa": 4,
    "classe": "sinal",
    "func": "digital",
    "mm2": 0.25,
    "de": {
      "comp": "MEGA",
      "via": "D10"
    },
    "para": {
      "comp": "H2",
      "via": "+"
    },
    "diz": "O pino D10 alimenta o sinaleiro RESFRIANDO — 5 V, ~20 mA.",
    "rota": [
      "CH-topo",
      "CV-dir",
      "CP-vsin",
      "CP-2x3"
    ],
    "nome": "Mega D10 → sinaleiro RESFRIANDO",
    "cor": "#495057",
    "corNome": "cinza"
  },
  {
    "n": "S3",
    "etapa": 4,
    "classe": "sinal",
    "func": "digital",
    "mm2": 0.25,
    "de": {
      "comp": "MEGA",
      "via": "D11"
    },
    "para": {
      "comp": "H3",
      "via": "+"
    },
    "diz": "O pino D11 alimenta o sinaleiro AQUECENDO — 5 V, ~20 mA.",
    "rota": [
      "CH-topo",
      "CV-dir",
      "CP-vsin",
      "CP-2x3"
    ],
    "nome": "Mega D11 → sinaleiro AQUECENDO",
    "cor": "#495057",
    "corNome": "cinza"
  },
  {
    "n": "S4",
    "etapa": 4,
    "classe": "sinal",
    "func": "digital",
    "mm2": 0.25,
    "de": {
      "comp": "MEGA",
      "via": "D12"
    },
    "para": {
      "comp": "H4",
      "via": "+"
    },
    "diz": "O pino D12 alimenta o sinaleiro FALHA — 5 V, ~20 mA.",
    "rota": [
      "CH-topo",
      "CV-dir",
      "CP-vsin",
      "CP-2x3"
    ],
    "nome": "Mega D12 → sinaleiro FALHA",
    "cor": "#495057",
    "corNome": "cinza"
  },
  {
    "n": "S4b",
    "etapa": 4,
    "classe": "sinal",
    "func": "digital",
    "mm2": 0.25,
    "de": {
      "comp": "MEGA",
      "via": "D27"
    },
    "para": {
      "comp": "KA123",
      "via": "IN1"
    },
    "diz": "Gatilho do KA1 — o relé que fica em série com a bobina do KM1.",
    "nome": "Mega D27 → gatilho do KA1",
    "rota": [
      "CH-topo",
      "CV-dir",
      "CH-3x2"
    ],
    "porque": "⭐ O ÚNICO FIO DO PAINEL QUE DÁ AO SOFTWARE PODER SOBRE A POTÊNCIA — e é de propósito que ele seja só um. HIGH fecha o KA1 e a bobina do KM1 pode energizar; LOW abre, o selo do KM1 se perde e o BD-POT vai a 0 V. Como o selo não se refaz sozinho, o corte é RETENTIVO: só o botão verde religa. Doc 31 §31.13.",
    "aviso": "⚠️ JUMPER DO MÓDULO EM \"H\" e um resistor de 10 kΩ deste nó para o 0 V. É o que garante o fail-safe: Arduino resetado, desligado ou com este fio rompido → IN em 0 V → relé aberto → potência cortada.",
    "cor": "#495057",
    "corNome": "cinza"
  },
  {
    "n": "S4c",
    "etapa": 4,
    "classe": "sinal",
    "func": "digital",
    "mm2": 0.25,
    "de": {
      "comp": "MEGA",
      "via": "D30"
    },
    "para": {
      "comp": "KA123",
      "via": "IN2"
    },
    "diz": "Gatilho do KA2 — as duas ventoinhas do radiador.",
    "nome": "Mega D30 → gatilho do KA2",
    "rota": [
      "CH-topo",
      "CV-dir",
      "CH-3x2"
    ],
    "porque": "⭐ UM CONTATO SECO NÃO TEM LADO ALTO NEM LADO BAIXO. Era esse o problema que derrubou o comando destas ventoinhas: o MV-1 chaveia o NEGATIVO, e o tacômetro delas é referenciado nesse mesmo negativo. O relé chaveia o POSITIVO sem nenhum truque de nível — o preto fica em 0 V de verdade, sempre. Doc 31 §31.14.",
    "aviso": "⚠️ Idem: jumper em \"H\" e pull-down de 10 kΩ. Arduino ausente = ventoinhas paradas — aceitável porque, sem Arduino, o KA1 também abriu e a Peltier não está gerando calor.",
    "cor": "#495057",
    "corNome": "cinza"
  },
  {
    "n": "S7",
    "etapa": 4,
    "classe": "sinal",
    "func": "digital",
    "mm2": 0.25,
    "de": {
      "comp": "AD-1",
      "via": "S"
    },
    "para": {
      "comp": "MEGA",
      "via": "D2"
    },
    "diz": "O barramento 1-Wire do DS18B20 do radiador, já com o pull-up do AD-1.",
    "nome": "1-Wire → D2",
    "rota": [
      "CH-3x2",
      "CV-dir",
      "CH-topo"
    ],
    "aviso": "⚠️ Pulsos de microssegundos. Se este fio pegar ruído o sensor some do barramento e o firmware acusa CARGA_ABERTA sem haver defeito nenhum.",
    "cor": "#495057",
    "corNome": "cinza"
  },
  {
    "n": "S9",
    "etapa": 4,
    "classe": "sinal",
    "func": "medida",
    "mm2": 0.25,
    "de": {
      "comp": "BTS1",
      "via": "R_IS"
    },
    "para": {
      "comp": "MEGA",
      "via": "A0"
    },
    "diz": "Saída de corrente espelhada do BTS #1 — vai direto ao A0 do Mega, onde o C1 a filtra.",
    "nome": "IS bruto do BTS #1",
    "rota": [
      "CH-3x2"
    ],
    "aviso": "🔥 ESTE FIO NASCE AO LADO DO QUE POLUI. Ele sai do próprio BTS, a centímetros dos 6 A chaveados. Prenda-o na canaleta de sinal já na saída e nunca o deixe correr paralelo ao B+ ou ao M+.",
    "cor": "#2f9e44",
    "corNome": "verde"
  },
  {
    "n": "S10",
    "etapa": 4,
    "classe": "sinal",
    "func": "medida",
    "mm2": 0.25,
    "de": {
      "comp": "BTS2",
      "via": "R_IS"
    },
    "para": {
      "comp": "MEGA",
      "via": "A1"
    },
    "diz": "Idem para o BTS #2.",
    "nome": "IS bruto do BTS #2",
    "rota": [
      "CH-3x2"
    ],
    "cor": "#2f9e44",
    "corNome": "verde"
  },
  {
    "n": "S11",
    "etapa": 4,
    "classe": "sinal",
    "func": "digital",
    "mm2": 0.25,
    "de": {
      "comp": "MEGA",
      "via": "D5"
    },
    "para": {
      "comp": "BTS1",
      "via": "R_PWM"
    },
    "diz": "O PWM de 20 kHz que comanda as Peltier.",
    "nome": "PWM do frio",
    "rota": [
      "CH-topo",
      "CV-dir",
      "CH-3x2"
    ],
    "porque": "Lento de propósito: cada liga-desliga é um choque térmico na pastilha.",
    "cor": "#495057",
    "corNome": "cinza"
  },
  {
    "n": "S12",
    "etapa": 4,
    "classe": "sinal",
    "func": "digital",
    "mm2": 0.25,
    "de": {
      "comp": "MEGA",
      "via": "D4"
    },
    "para": {
      "comp": "BTS1",
      "via": "R_EN"
    },
    "diz": "Habilita a ponte do BTS #1.",
    "nome": "enable do BTS #1",
    "rota": [
      "CH-topo",
      "CV-dir",
      "CH-3x2"
    ],
    "cor": "#495057",
    "corNome": "cinza"
  },
  {
    "n": "S311",
    "etapa": 4,
    "classe": "sinal",
    "func": "digital",
    "mm2": 0.25,
    "de": {
      "comp": "BTS1",
      "via": "L_PWM"
    },
    "para": {
      "comp": "BTS1",
      "via": "GND"
    },
    "diz": "Prende o LPWM do BTS #1 em nível baixo.",
    "rota": [],
    "nome": "LPWM do BTS #1 no 0 V",
    "porque": "⭐ A carga é UNIDIRECIONAL: a Peltier só resfria e o PTC só aquece, então a ponte nunca precisa inverter. Quem conduz é sempre a metade R; a metade L existe só para devolver a corrente, e para isso o LPWM tem de estar baixo e o L_EN alto.",
    "aviso": "⚠️ NÃO CONFUNDA COM O L_EN. O L_EN vai ALTO (junto com o R_EN, no D4/D7) — é ele que liga o MOSFET de baixo da metade L para a corrente voltar por ali em vez de pelo diodo de corpo. O LPWM é que vai BAIXO. Trocar os dois é trocar 4 W de calor por um curto.",
    "cor": "#495057",
    "corNome": "cinza"
  },
  {
    "n": "S312",
    "etapa": 4,
    "classe": "sinal",
    "func": "digital",
    "mm2": 0.25,
    "de": {
      "comp": "BTS2",
      "via": "L_PWM"
    },
    "para": {
      "comp": "BTS2",
      "via": "GND"
    },
    "diz": "Prende o LPWM do BTS #2 em nível baixo.",
    "rota": [],
    "nome": "LPWM do BTS #2 no 0 V",
    "porque": "⭐ A carga é UNIDIRECIONAL: a Peltier só resfria e o PTC só aquece, então a ponte nunca precisa inverter. Quem conduz é sempre a metade R; a metade L existe só para devolver a corrente, e para isso o LPWM tem de estar baixo e o L_EN alto.",
    "cor": "#495057",
    "corNome": "cinza"
  },
  {
    "n": "S13",
    "etapa": 4,
    "classe": "sinal",
    "func": "digital",
    "mm2": 0.25,
    "de": {
      "comp": "BTS1",
      "via": "R_EN"
    },
    "para": {
      "comp": "BTS1",
      "via": "L_EN"
    },
    "diz": "Ponte curta no próprio módulo: os dois enables andam juntos.",
    "rota": [],
    "nome": "ponte R_EN–L_EN do BTS #1",
    "porque": "⭐ Um pino do Arduino comanda os dois. Nível baixo desabilita as DUAS metades da ponte — nenhuma corrente passa, aconteça o que acontecer no PWM.",
    "cor": "#495057",
    "corNome": "cinza"
  },
  {
    "n": "S14",
    "etapa": 4,
    "classe": "sinal",
    "func": "digital",
    "mm2": 0.25,
    "de": {
      "comp": "MEGA",
      "via": "D6"
    },
    "para": {
      "comp": "BTS2",
      "via": "R_PWM"
    },
    "diz": "O PWM do PTC.",
    "nome": "PWM do quente",
    "rota": [
      "CH-topo",
      "CV-dir",
      "CH-3x2"
    ],
    "cor": "#495057",
    "corNome": "cinza"
  },
  {
    "n": "S15",
    "etapa": 4,
    "classe": "sinal",
    "func": "digital",
    "mm2": 0.25,
    "de": {
      "comp": "MEGA",
      "via": "D7"
    },
    "para": {
      "comp": "BTS2",
      "via": "R_EN"
    },
    "diz": "Habilita a ponte do BTS #2.",
    "nome": "enable do BTS #2",
    "rota": [
      "CH-topo",
      "CV-dir",
      "CH-3x2"
    ],
    "cor": "#495057",
    "corNome": "cinza"
  },
  {
    "n": "S16",
    "etapa": 4,
    "classe": "sinal",
    "func": "digital",
    "mm2": 0.25,
    "de": {
      "comp": "BTS2",
      "via": "R_EN"
    },
    "para": {
      "comp": "BTS2",
      "via": "L_EN"
    },
    "diz": "Ponte curta no módulo.",
    "rota": [],
    "nome": "ponte R_EN–L_EN do BTS #2",
    "cor": "#495057",
    "corNome": "cinza"
  },
  {
    "n": "S19",
    "etapa": 4,
    "classe": "sinal",
    "func": "digital",
    "mm2": 0.25,
    "de": {
      "comp": "MEGA",
      "via": "D29"
    },
    "para": {
      "comp": "KA123",
      "via": "IN3"
    },
    "diz": "Gatilho do KA3 — liga as CINCO ventoinhas internas: 2 frias, 2 do duto e a do PTC.",
    "nome": "Mega D29 → gatilho do KA3",
    "rota": [
      "CH-topo",
      "CV-dir",
      "CH-3x2"
    ],
    "porque": "🔧 ERAM DOIS CANAIS E VIRARAM UM. A ventoinha do PTC tinha canal próprio (D28 → IN2) para poder continuar girando depois que o aquecedor desligava. A proteção térmica em hardware é apenas uma proposta: modelos, classificação CC, rearme manual e validação térmica continuam pendentes. Não energizar o PTC até encerrar essas pendências; a redução de canais não comprova segurança do aquecedor.",
    "aviso": "⚠️ Jumper em \"H\" e pull-down de 10 kΩ (R12), como nos outros dois. Contato NO: Arduino ausente = ventoinhas internas PARADAS — e aqui isso é o estado seguro, porque sem Arduino o KA1 já cortou a potência e não há calor sendo gerado. ⭐ O firmware não mudou uma linha: HIGH continua ligando.",
    "cor": "#495057",
    "corNome": "cinza"
  },
  {
    "n": "S25",
    "etapa": 4,
    "classe": "sinal",
    "func": "digital",
    "mm2": 0.25,
    "de": {
      "comp": "MEGA",
      "via": "D20"
    },
    "para": {
      "comp": "RTC",
      "via": "SDA"
    },
    "diz": "SDA do I²C, saindo do Arduino para o primeiro da fila.",
    "nome": "I²C SDA · Mega → RTC",
    "rota": [
      "CH-topo",
      "CV-dir",
      "CH-3x2"
    ],
    "cor": "#495057",
    "corNome": "cinza"
  },
  {
    "n": "S26",
    "etapa": 4,
    "classe": "sinal",
    "func": "digital",
    "mm2": 0.25,
    "de": {
      "comp": "MEGA",
      "via": "D21"
    },
    "para": {
      "comp": "RTC",
      "via": "SCL"
    },
    "diz": "SCL do I²C.",
    "nome": "I²C SCL · Mega → RTC",
    "rota": [
      "CH-topo",
      "CV-dir",
      "CH-3x2"
    ],
    "cor": "#495057",
    "corNome": "cinza"
  },
  {
    "n": "S29",
    "etapa": 4,
    "classe": "sinal",
    "func": "digital",
    "mm2": 0.25,
    "de": {
      "comp": "MEGA",
      "via": "D18"
    },
    "para": {
      "comp": "ESP32",
      "via": "RX0"
    },
    "diz": "Serial1: o Arduino fala, o ESP32 escuta.",
    "nome": "UART Mega TX → ESP32 RX",
    "rota": [
      "CH-topo",
      "CV-dir",
      "CH-3x2"
    ],
    "aviso": "⚠️ TX DE UM VAI NO RX DO OUTRO. Ligar TX no TX não queima nada, mas nenhum dado passa — e o sintoma é idêntico ao de firmware errado.",
    "cor": "#495057",
    "corNome": "cinza"
  },
  {
    "n": "S30",
    "etapa": 4,
    "classe": "sinal",
    "func": "digital",
    "mm2": 0.25,
    "de": {
      "comp": "ESP32",
      "via": "TX0"
    },
    "para": {
      "comp": "MEGA",
      "via": "D19"
    },
    "diz": "Serial1 no sentido de volta.",
    "nome": "UART ESP32 TX → Mega RX",
    "rota": [
      "CH-3x2",
      "CV-dir",
      "CH-topo"
    ],
    "porque": "📌 O ESP32 é de 3,3 V e o Mega de 5 V. Nesta direção não há problema: 3,3 V já é nível alto para o Mega. É na outra que o divisor importa — e ele está declarado na entrada do DNLCB30.",
    "cor": "#495057",
    "corNome": "cinza"
  },
  {
    "n": "P5",
    "etapa": 5,
    "classe": "sinal",
    "func": "zero",
    "mm2": 0.5,
    "de": {
      "comp": "H1",
      "via": "−"
    },
    "para": {
      "comp": "H2",
      "via": "−"
    },
    "nome": "ponte do 0 V · H1 → H2",
    "rota": [
      "CP-2x3"
    ],
    "diz": "Ponte curta na própria porta, entre sinaleiros vizinhos.",
    "cor": "#1864ab",
    "corNome": "azul escuro"
  },
  {
    "n": "P6",
    "etapa": 5,
    "classe": "sinal",
    "func": "zero",
    "mm2": 0.5,
    "de": {
      "comp": "H2",
      "via": "−"
    },
    "para": {
      "comp": "H3",
      "via": "−"
    },
    "nome": "ponte do 0 V · H2 → H3",
    "rota": [
      "CP-2x3"
    ],
    "diz": "Ponte curta na própria porta, entre sinaleiros vizinhos.",
    "cor": "#1864ab",
    "corNome": "azul escuro"
  },
  {
    "n": "P7",
    "etapa": 5,
    "classe": "sinal",
    "func": "zero",
    "mm2": 0.5,
    "de": {
      "comp": "H3",
      "via": "−"
    },
    "para": {
      "comp": "H4",
      "via": "−"
    },
    "nome": "ponte do 0 V · H3 → H4",
    "rota": [
      "CP-2x3"
    ],
    "diz": "Ponte curta na própria porta, entre sinaleiros vizinhos.",
    "cor": "#1864ab",
    "corNome": "azul escuro"
  },
  {
    "n": "P8",
    "etapa": 5,
    "classe": "sinal",
    "func": "zero",
    "mm2": 0.5,
    "de": {
      "comp": "H4",
      "via": "−"
    },
    "para": {
      "comp": "MEGA",
      "via": "GND2"
    },
    "nome": "retorno dos 4 sinaleiros → GND do Mega",
    "rota": [
      "CP-2x3",
      "CP-vsin",
      "CV-dir",
      "CH-3x2"
    ],
    "diz": "Um fio só fecha o circuito dos quatro sinaleiros.",
    "porque": "⭐ Vai no GND do Mega, e não no BD-0V: é a mesma referência do pino que acende o sinaleiro. Fechar em outro ponto faria a corrente dos LEDs atravessar o barramento e sujar as leituras analógicas.",
    "aviso": "⚠️ São 4 × 20 mA = 80 mA voltando por este fio. Ele é o único retorno dos sinaleiros — se ele abrir, os quatro apagam de uma vez.",
    "cor": "#1864ab",
    "corNome": "azul escuro"
  },
  {
    "n": "P10",
    "etapa": 5,
    "classe": "alim",
    "func": "log5",
    "mm2": 0.5,
    "de": {
      "comp": "BD-5V",
      "via": "O2"
    },
    "para": {
      "comp": "HMI",
      "via": "VBUS"
    },
    "nome": "alimentação da tela · +5 V",
    "rota": [
      "CH-1x4",
      "CV-dir",
      "CP-vsin",
      "CP-topo"
    ],
    "diz": "O +5 V da ES3C28P. VBUS É o Type-C: é o nome do fio de 5 V dele.",
    "porque": "⭐ VBUS NÃO É UMA ENTRADA À PARTE. \"VBUS\" é como se chama o pino de +5 V de qualquer conector USB — e neste projeto ele chega por um RABICHO Type-C: um plugue USB-C com dois fios nus na outra ponta, vermelho no BD-5V e preto no BD-0V. Você não solda nada na placa; pluga o Type-C.",
    "aviso": "⚠️ UM alimentador de cada vez. Com o rabicho ligado no BD-5V, não plugue também um carregador ou o cabo do PC: seriam duas fontes de 5 V empurrando uma contra a outra no mesmo conector. Para gravar firmware, desligue o disjuntor do painel ou desconecte o rabicho antes.",
    "juntoCom": "P11",
    "cor": "#7048e8",
    "corNome": "violeta"
  },
  {
    "n": "P11",
    "etapa": 5,
    "classe": "comum",
    "func": "zero",
    "mm2": 0.5,
    "de": {
      "comp": "HMI",
      "via": "GND-PWR"
    },
    "para": {
      "comp": "BD-0V",
      "via": "Z9"
    },
    "nome": "alimentação da tela · 0 V",
    "rota": [
      "CP-topo",
      "CP-vsin",
      "CV-dir",
      "CH-1x4"
    ],
    "diz": "O preto do MESMO rabicho Type-C, no ponto Z9 da barra.",
    "porque": "⭐ ANDA COLADO NO P10, porque é o outro fio do mesmo plugue. Se você vir este par se separando em canaletas diferentes no desenho, é erro: os dois saem do mesmo Type-C e voltam pelo mesmo caminho.",
    "juntoCom": "P10",
    "cor": "#1864ab",
    "corNome": "azul escuro"
  },
  {
    "n": "P12",
    "etapa": 5,
    "classe": "sinal",
    "func": "digital",
    "mm2": 0.25,
    "de": {
      "comp": "MEGA",
      "via": "D16"
    },
    "para": {
      "comp": "CONV",
      "via": "TXI"
    },
    "diz": "Serial2 do Arduino entrando no lado ALTO do conversor.",
    "nome": "UART Mega TX → conversor",
    "rota": [
      "CH-topo",
      "CV-dir",
      "CP-vsin",
      "CP-topo"
    ],
    "porque": "⭐ O Mega fala em 5 V e a tela é ESP32-S3, de 3,3 V. Sem o conversor, os 5 V no RX da tela estressam o pino — pode funcionar por um tempo e morrer depois, que é o pior modo de falhar.",
    "cor": "#495057",
    "corNome": "cinza"
  },
  {
    "n": "P13",
    "etapa": 5,
    "classe": "sinal",
    "func": "digital",
    "mm2": 0.25,
    "de": {
      "comp": "CONV",
      "via": "RXO"
    },
    "para": {
      "comp": "MEGA",
      "via": "D17"
    },
    "diz": "A volta, do lado alto do conversor para o Arduino.",
    "nome": "UART conversor → Mega RX",
    "rota": [
      "CP-topo",
      "CP-vsin",
      "CV-dir",
      "CH-topo"
    ],
    "cor": "#495057",
    "corNome": "cinza"
  },
  {
    "n": "P14",
    "etapa": 5,
    "classe": "alim",
    "func": "log5",
    "mm2": 0.25,
    "de": {
      "comp": "BD-5V",
      "via": "O7"
    },
    "para": {
      "comp": "CONV",
      "via": "HV"
    },
    "nome": "lado ALTO do conversor · 5 V",
    "rota": [
      "CH-1x4",
      "CV-dir",
      "CP-vsin",
      "CP-topo"
    ],
    "diz": "O conversor precisa conhecer as DUAS tensões para trabalhar.",
    "cor": "#7048e8",
    "corNome": "violeta"
  },
  {
    "n": "P15",
    "etapa": 5,
    "classe": "comum",
    "func": "zero",
    "mm2": 0.25,
    "de": {
      "comp": "CONV",
      "via": "GND-HV"
    },
    "para": {
      "comp": "BD-0V",
      "via": "Z10"
    },
    "nome": "retorno do conversor",
    "rota": [
      "CP-topo",
      "CP-vsin",
      "CV-dir",
      "CH-1x4"
    ],
    "diz": "O 0 V do lado alto.",
    "cor": "#1864ab",
    "corNome": "azul escuro"
  },
  {
    "n": "P16",
    "etapa": 5,
    "classe": "sinal",
    "func": "digital",
    "mm2": 0.25,
    "de": {
      "comp": "CONV",
      "via": "LV"
    },
    "para": {
      "comp": "HMI",
      "via": "3V3"
    },
    "diz": "O lado BAIXO do conversor pega a referência de 3,3 V da própria tela.",
    "nome": "referência de 3,3 V",
    "rota": [
      "CP-1x2",
      "CP-vsin",
      "CP-topo"
    ],
    "porque": "⭐ Os 3,3 V vêm DA TELA, não de um regulador nosso. É ela quem define o nível lógico daquele lado, então é dela que a referência tem que sair.",
    "cor": "#495057",
    "corNome": "cinza"
  },
  {
    "n": "P17",
    "etapa": 5,
    "classe": "sinal",
    "func": "digital",
    "mm2": 0.25,
    "de": {
      "comp": "CONV",
      "via": "TXO"
    },
    "para": {
      "comp": "HMI",
      "via": "RXD · IO43"
    },
    "diz": "Do conversor para o RX da tela, já em 3,3 V.",
    "nome": "conversor → tela RX",
    "rota": [
      "CP-1x2"
    ],
    "cor": "#495057",
    "corNome": "cinza"
  },
  {
    "n": "P18",
    "etapa": 5,
    "classe": "sinal",
    "func": "digital",
    "mm2": 0.25,
    "de": {
      "comp": "HMI",
      "via": "TXD · IO44"
    },
    "para": {
      "comp": "CONV",
      "via": "RXI"
    },
    "diz": "Do TX da tela para o conversor.",
    "nome": "tela TX → conversor",
    "rota": [
      "CP-1x2"
    ],
    "aviso": "🔥 TX DE UM NO RX DO OUTRO. São quatro fios de UART neste trecho (P12, P13, P17, P18) e trocar dois deles não queima nada — só faz a tela ficar em branco, com cara de firmware errado.",
    "cor": "#495057",
    "corNome": "cinza"
  },
  {
    "n": "P19",
    "etapa": 5,
    "classe": "comum",
    "func": "zero",
    "mm2": 0.25,
    "de": {
      "comp": "HMI",
      "via": "GND-UART"
    },
    "para": {
      "comp": "CONV",
      "via": "GND-LV"
    },
    "nome": "0 V comum do lado baixo",
    "rota": [
      "CP-1x2"
    ],
    "diz": "Ponte curta na porta: os dois lados precisam da mesma referência.",
    "aviso": "⚠️ Sem este fio o conversor não tem referência do lado de 3,3 V, e a comunicação fica intermitente — funciona no teste de bancada e falha no dia.",
    "cor": "#1864ab",
    "corNome": "azul escuro"
  },
  {
    "n": "P20",
    "etapa": 5,
    "classe": "comum",
    "func": "zero",
    "mm2": 0.25,
    "de": {
      "comp": "BD-0V-B",
      "via": "Z18"
    },
    "para": {
      "comp": "S2",
      "via": "13"
    },
    "nome": "0 V dos comandos → porta",
    "rota": [
      "CH-3x2",
      "CV-dir",
      "CP-vsin",
      "CP-2x3"
    ],
    "diz": "UM fio de 0 V cruza a dobradiça e serve os dois comandos de 5 V.",
    "porque": "⭐ Aqui pendurar É o certo. O limiar do Arduino fica em 2,5 V e o pull-up interno dá 0,25 mA — alguns milivolts de queda não mudam nada. 🔧 Eram QUATRO comandos antes de o START e a seletora saírem da porta; hoje são dois, e o fio serve o STOP e o cogumelo.",
    "cor": "#1864ab",
    "corNome": "azul escuro"
  },
  {
    "n": "P23",
    "etapa": 5,
    "classe": "comum",
    "func": "zero",
    "mm2": 0.25,
    "de": {
      "comp": "S2",
      "via": "13"
    },
    "para": {
      "comp": "S0",
      "via": "21"
    },
    "nome": "ponte do 0 V · S2 → cogumelo",
    "rota": [
      "CP-2x3",
      "CP-vsin",
      "CP-base"
    ],
    "diz": "Desce pela vertical de sinal até a fileira do cogumelo.",
    "cor": "#1864ab",
    "corNome": "azul escuro"
  },
  {
    "n": "P25",
    "etapa": 5,
    "classe": "sinal",
    "func": "digital",
    "mm2": 0.25,
    "de": {
      "comp": "S2",
      "via": "14"
    },
    "para": {
      "comp": "MEGA",
      "via": "D23"
    },
    "diz": "O Arduino lê o STOP por este fio.",
    "nome": "STOP → Mega D23",
    "rota": [
      "CP-2x3",
      "CP-vsin",
      "CV-dir",
      "CH-topo"
    ],
    "cor": "#495057",
    "corNome": "cinza"
  },
  {
    "n": "P26",
    "etapa": 5,
    "classe": "sinal",
    "func": "digital",
    "mm2": 0.25,
    "de": {
      "comp": "S0",
      "via": "22"
    },
    "para": {
      "comp": "MEGA",
      "via": "D24"
    },
    "diz": "O Arduino lê o EMERGÊNCIA por este fio.",
    "nome": "EMERGÊNCIA → Mega D24",
    "rota": [
      "CP-base",
      "CP-vsin",
      "CV-dir",
      "CH-topo"
    ],
    "cor": "#495057",
    "corNome": "cinza"
  },
  {
    "n": "X1",
    "etapa": 6,
    "mm2": 1.5,
    "func": "pot24",
    "classe": "potencia",
    "de": {
      "comp": "BTS1",
      "via": "M+"
    },
    "para": {
      "camara": "PELT",
      "borne": "+"
    },
    "diz": "Positivo do par de Peltier, saindo da ponte H do BTS #1.",
    "nome": "Peltier +",
    "prensa": "PG13-2",
    "rota": [
      "CH-2x1",
      "CV-esq",
      "CH-base"
    ],
    "porque": "⭐ Sai de M+ e não do B+. O B+ é a alimentação do módulo; o M+ é a SAÍDA da ponte, que é o que o PWM comanda.",
    "cor": "#c92a2a",
    "corNome": "vermelho"
  },
  {
    "n": "X2",
    "etapa": 6,
    "mm2": 1.5,
    "func": "pot24",
    "classe": "potencia",
    "de": {
      "comp": "BTS1",
      "via": "M−"
    },
    "para": {
      "camara": "PELT",
      "borne": "−"
    },
    "diz": "Retorno do par de Peltier, pela outra metade da ponte.",
    "nome": "Peltier −",
    "prensa": "PG13-2",
    "rota": [
      "CH-2x1",
      "CV-esq",
      "CH-base"
    ],
    "aviso": "🔥 O RETORNO DA PELTIER NÃO VAI AO BD-0V. Ele volta ao M− do BTS — mas NÃO é \"para poder inverter\": a pastilha só resfria, e o L_PWM está preso em 0 V pelo fio S311. O motivo é outro: com o L_EN em nível alto, a metade L devolve a corrente pelo MOSFET de baixo LIGADO, e não pelo diodo de corpo — cerca de 0,6 W de perda em vez de 5,4 W a 6 A. E ainda protege contra o jumper S311 cair: se o M− estivesse no 0 V, um L_PWM solto pegando ruído chavearia a metade ALTA e poria o B+ em curto direto contra o 0 V.",
    "cor": "#c92a2a",
    "corNome": "vermelho"
  },
  {
    "n": "X5",
    "etapa": 6,
    "mm2": 0.5,
    "func": "aux12",
    "classe": "alim",
    "de": {
      "comp": "KA123",
      "via": "NC2"
    },
    "para": {
      "tampa": "RAD",
      "borne": "+"
    },
    "diz": "As 2 ventoinhas do radiador, em paralelo, direto no 12 V.",
    "nome": "⭐ ventoinhas do radiador · +12 V COMANDADO pelo KA2",
    "prensa": "PG13-2",
    "rota": [
      "CH-2x1",
      "CV-dir"
    ],
    "porque": "⭐ Elas NÃO atravessam a parede: ficam na tampa, do lado de fora, soprando nos dissipadores. É o calor que a Peltier tirou de dentro. 🔧 O fio agora nasce no contato do KA2, e não mais direto no BD-AUX: é assim que o firmware consegue desligá-las quando o dissipador esfria.",
    "cor": "#f59f00",
    "corNome": "amarelo"
  },
  {
    "n": "X6",
    "etapa": 6,
    "mm2": 0.5,
    "func": "zero",
    "classe": "comum",
    "de": {
      "tampa": "RAD",
      "borne": "−"
    },
    "para": {
      "comp": "BD-0V",
      "via": "Z15"
    },
    "diz": "Retorno das ventoinhas do radiador, no 0 V de verdade.",
    "nome": "ventoinhas do radiador · 0 V",
    "prensa": "PG13-2",
    "rota": [
      "CV-dir",
      "CH-1x4"
    ],
    "aviso": "🔥 ESTE FIO É A REFERÊNCIA DOS DOIS TACÔMETROS. Ligado num negativo chaveado, os sinais de RPM viram lixo e podem danificar o Mega. Ele vai na barra de 0 V, e em ponto próprio — não encadeado.",
    "cor": "#1864ab",
    "corNome": "azul escuro"
  },
  {
    "n": "X9",
    "etapa": 6,
    "mm2": 0.5,
    "func": "aux12",
    "classe": "alim",
    "de": {
      "comp": "KA123",
      "via": "NO3"
    },
    "para": {
      "camara": "VF",
      "borne": "+"
    },
    "diz": "⭐ As 5 internas: 2 frias, 2 dos dutos e a do PTC.",
    "nome": "ventoinhas internas +",
    "prensa": "PG13-2",
    "rota": [
      "CH-2x1",
      "CV-dir"
    ],
    "porque": "⭐ CINCO VENTOINHAS EM DOIS FIOS. Ligam em paralelo dentro da câmara, porque formam um circuito de ar só — ligar uma sem as outras não faria sentido. Só 2 condutores atravessam a parede.",
    "aviso": "🔧 A DO PTC ENTROU NESTE PAR. Ela tinha canal e par próprios (fios X7/X8) para poder continuar girando depois do aquecedor. A cadeia ST-1/ST-2 é uma proteção proposta, ainda não aprovada: modelos, capacidade CC, rearme manual e validação térmica estão pendentes. Não energizar o PTC até fechar esses itens; a alteração da fiação não comprova a proteção.",
    "cor": "#f59f00",
    "corNome": "amarelo"
  },
  {
    "n": "X10",
    "etapa": 6,
    "mm2": 0.5,
    "func": "zero",
    "classe": "comum",
    "de": {
      "camara": "VF",
      "borne": "−"
    },
    "para": {
      "comp": "BD-0V",
      "via": "Z13"
    },
    "diz": "Retorno das 5 internas — agora no 0 V de verdade.",
    "nome": "ventoinhas internas · 0 V",
    "prensa": "PG13-2",
    "rota": [
      "CV-dir",
      "CH-1x4"
    ],
    "porque": "⭐ ELE MUDOU DE DESTINO JUNTO COM O MV-1. Enquanto quem chaveava era um MOSFET canal N, este fio voltava para o DRENO do módulo — o negativo das ventoinhas era comutado e só ficava em 0 V com o canal ligado. Com o KA3 no lado POSITIVO, ele vai direto à barra: o preto das internas é 0 V sempre, ligadas ou paradas. É a mesma correção que o X6 já tinha recebido no radiador — só que lá o tacômetro tornava o defeito visível, e aqui ele ficava esperando alguém trocar uma ventoinha por uma de 3 fios.",
    "aviso": "⭐ Ponto PRÓPRIO no BD-0V (Z13), não encadeado. É o mesmo Z13 que antes recebia o GND de carga do MV-1.",
    "cor": "#1864ab",
    "corNome": "azul escuro"
  },
  {
    "n": "X11",
    "etapa": 6,
    "mm2": 0.5,
    "func": "aux12",
    "classe": "alim",
    "de": {
      "comp": "F-P",
      "via": "F-P1"
    },
    "para": {
      "camara": "PL-1",
      "borne": "+1"
    },
    "diz": "Positivo da posição 1, já depois do fusível e da chave.",
    "nome": "posição 1 · +12 V",
    "prensa": "PG13-2",
    "rota": [
      "CH-2x1",
      "CV-dir"
    ],
    "porque": "⭐ O POSITIVO é o lado chaveado: abre a chave da posição 1 na placa F-P e este fio fica morto, enquanto o borne do porta-fusível continua vivo. O retorno é que vai para o módulo, e esse não se desconecta com o painel energizado.",
    "cor": "#f59f00",
    "corNome": "amarelo"
  },
  {
    "n": "X11b",
    "etapa": 6,
    "mm2": 0.5,
    "func": "aux12",
    "classe": "alim",
    "de": {
      "comp": "F-P",
      "via": "F-P2"
    },
    "para": {
      "camara": "PL-1",
      "borne": "+2"
    },
    "diz": "Positivo da posição 2, já depois do fusível e da chave.",
    "nome": "posição 2 · +12 V",
    "prensa": "PG13-2",
    "rota": [
      "CH-2x1",
      "CV-dir"
    ],
    "porque": "⭐ O POSITIVO é o lado chaveado: abre a chave da posição 2 na placa F-P e este fio fica morto, enquanto o borne do porta-fusível continua vivo. O retorno é que vai para o módulo, e esse não se desconecta com o painel energizado.",
    "cor": "#f59f00",
    "corNome": "amarelo"
  },
  {
    "n": "X11c",
    "etapa": 6,
    "mm2": 0.5,
    "func": "aux12",
    "classe": "alim",
    "de": {
      "comp": "F-P",
      "via": "F-P3"
    },
    "para": {
      "camara": "PL-1",
      "borne": "+3"
    },
    "diz": "Positivo da posição 3, já depois do fusível e da chave.",
    "nome": "posição 3 · +12 V",
    "prensa": "PG13-2",
    "rota": [
      "CH-2x1",
      "CV-dir"
    ],
    "porque": "⭐ O POSITIVO é o lado chaveado: abre a chave da posição 3 na placa F-P e este fio fica morto, enquanto o borne do porta-fusível continua vivo. O retorno é que vai para o módulo, e esse não se desconecta com o painel energizado.",
    "cor": "#f59f00",
    "corNome": "amarelo"
  },
  {
    "n": "X11d",
    "etapa": 6,
    "mm2": 0.5,
    "func": "aux12",
    "classe": "alim",
    "de": {
      "comp": "F-P",
      "via": "F-P4"
    },
    "para": {
      "camara": "PL-1",
      "borne": "+4"
    },
    "diz": "Positivo da posição 4, já depois do fusível e da chave.",
    "nome": "posição 4 · +12 V",
    "prensa": "PG13-2",
    "rota": [
      "CH-2x1",
      "CV-dir"
    ],
    "porque": "⭐ O POSITIVO é o lado chaveado: abre a chave da posição 4 na placa F-P e este fio fica morto, enquanto o borne do porta-fusível continua vivo. O retorno é que vai para o módulo, e esse não se desconecta com o painel energizado.",
    "cor": "#f59f00",
    "corNome": "amarelo"
  },
  {
    "n": "X11e",
    "etapa": 6,
    "mm2": 0.5,
    "func": "aux12",
    "classe": "alim",
    "de": {
      "comp": "F-P",
      "via": "F-P5"
    },
    "para": {
      "camara": "PL-2",
      "borne": "+1"
    },
    "diz": "Positivo da posição 5, já depois do fusível e da chave.",
    "nome": "posição 5 · +12 V",
    "prensa": "PG13-2",
    "rota": [
      "CH-2x1",
      "CV-dir"
    ],
    "porque": "⭐ O POSITIVO é o lado chaveado: abre a chave da posição 5 na placa F-P e este fio fica morto, enquanto o borne do porta-fusível continua vivo. O retorno é que vai para o módulo, e esse não se desconecta com o painel energizado.",
    "cor": "#f59f00",
    "corNome": "amarelo"
  },
  {
    "n": "X11f",
    "etapa": 6,
    "mm2": 0.5,
    "func": "aux12",
    "classe": "alim",
    "de": {
      "comp": "F-P",
      "via": "F-P6"
    },
    "para": {
      "camara": "PL-2",
      "borne": "+2"
    },
    "diz": "Positivo da posição 6, já depois do fusível e da chave.",
    "nome": "posição 6 · +12 V",
    "prensa": "PG13-2",
    "rota": [
      "CH-2x1",
      "CV-dir"
    ],
    "porque": "⭐ O POSITIVO é o lado chaveado: abre a chave da posição 6 na placa F-P e este fio fica morto, enquanto o borne do porta-fusível continua vivo. O retorno é que vai para o módulo, e esse não se desconecta com o painel energizado.",
    "cor": "#f59f00",
    "corNome": "amarelo"
  },
  {
    "n": "X11g",
    "etapa": 6,
    "mm2": 0.5,
    "func": "aux12",
    "classe": "alim",
    "de": {
      "comp": "F-P",
      "via": "F-P7"
    },
    "para": {
      "camara": "PL-2",
      "borne": "+3"
    },
    "diz": "Positivo da posição 7, já depois do fusível e da chave.",
    "nome": "posição 7 · +12 V",
    "prensa": "PG13-2",
    "rota": [
      "CH-2x1",
      "CV-dir"
    ],
    "porque": "⭐ O POSITIVO é o lado chaveado: abre a chave da posição 7 na placa F-P e este fio fica morto, enquanto o borne do porta-fusível continua vivo. O retorno é que vai para o módulo, e esse não se desconecta com o painel energizado.",
    "cor": "#f59f00",
    "corNome": "amarelo"
  },
  {
    "n": "X11h",
    "etapa": 6,
    "mm2": 0.5,
    "func": "aux12",
    "classe": "alim",
    "de": {
      "comp": "F-P",
      "via": "F-P8"
    },
    "para": {
      "camara": "PL-2",
      "borne": "+4"
    },
    "diz": "Positivo da posição 8, já depois do fusível e da chave.",
    "nome": "posição 8 · +12 V",
    "prensa": "PG13-2",
    "rota": [
      "CH-2x1",
      "CV-dir"
    ],
    "porque": "⭐ O POSITIVO é o lado chaveado: abre a chave da posição 8 na placa F-P e este fio fica morto, enquanto o borne do porta-fusível continua vivo. O retorno é que vai para o módulo, e esse não se desconecta com o painel energizado.",
    "cor": "#f59f00",
    "corNome": "amarelo"
  },
  {
    "n": "X13",
    "etapa": 6,
    "classe": "comum",
    "func": "medida",
    "mm2": 0.5,
    "prensa": "PG9-3",
    "de": {
      "camara": "PL-1",
      "borne": "r1"
    },
    "para": {
      "comp": "N4AIC24",
      "via": "I1"
    },
    "diz": "A volta da posição 1 — entra no canal I1 do módulo de medição.",
    "rota": [
      "CV-dir",
      "CH-topo"
    ],
    "porque": "⭐ O RETORNO NÃO VAI DIRETO AO 0 V: ele atravessa o shunt interno do módulo, e é essa passagem que mede a corrente. Do outro lado do shunt está o COM, que vai ao BD-0V-B. Ligado direto na barra, a posição funciona e a corrente lê zero para sempre — sem nenhum sintoma além do alarme errado. Cada posição tem o SEU canal: juntar dois retornos soma as correntes e cega o diagnóstico.",
    "cor": "#1864ab",
    "corNome": "azul escuro",
    "nome": "posição 1 · retorno"
  },
  {
    "n": "X13b",
    "etapa": 6,
    "classe": "comum",
    "func": "medida",
    "mm2": 0.5,
    "prensa": "PG9-3",
    "de": {
      "camara": "PL-1",
      "borne": "r2"
    },
    "para": {
      "comp": "N4AIC24",
      "via": "I2"
    },
    "diz": "A volta da posição 2 — entra no canal I2 do módulo de medição.",
    "rota": [
      "CV-dir",
      "CH-topo"
    ],
    "porque": "⭐ O RETORNO NÃO VAI DIRETO AO 0 V: ele atravessa o shunt interno do módulo, e é essa passagem que mede a corrente. Do outro lado do shunt está o COM, que vai ao BD-0V-B. Ligado direto na barra, a posição funciona e a corrente lê zero para sempre — sem nenhum sintoma além do alarme errado. Cada posição tem o SEU canal: juntar dois retornos soma as correntes e cega o diagnóstico.",
    "cor": "#1864ab",
    "corNome": "azul escuro",
    "nome": "posição 2 · retorno"
  },
  {
    "n": "X13c",
    "etapa": 6,
    "classe": "comum",
    "func": "medida",
    "mm2": 0.5,
    "prensa": "PG9-3",
    "de": {
      "camara": "PL-1",
      "borne": "r3"
    },
    "para": {
      "comp": "N4AIC24",
      "via": "I3"
    },
    "diz": "A volta da posição 3 — entra no canal I3 do módulo de medição.",
    "rota": [
      "CV-dir",
      "CH-topo"
    ],
    "porque": "⭐ O RETORNO NÃO VAI DIRETO AO 0 V: ele atravessa o shunt interno do módulo, e é essa passagem que mede a corrente. Do outro lado do shunt está o COM, que vai ao BD-0V-B. Ligado direto na barra, a posição funciona e a corrente lê zero para sempre — sem nenhum sintoma além do alarme errado. Cada posição tem o SEU canal: juntar dois retornos soma as correntes e cega o diagnóstico.",
    "cor": "#1864ab",
    "corNome": "azul escuro",
    "nome": "posição 3 · retorno"
  },
  {
    "n": "X13d",
    "etapa": 6,
    "classe": "comum",
    "func": "medida",
    "mm2": 0.5,
    "prensa": "PG9-3",
    "de": {
      "camara": "PL-1",
      "borne": "r4"
    },
    "para": {
      "comp": "N4AIC24",
      "via": "I4"
    },
    "diz": "A volta da posição 4 — entra no canal I4 do módulo de medição.",
    "rota": [
      "CV-dir",
      "CH-topo"
    ],
    "porque": "⭐ O RETORNO NÃO VAI DIRETO AO 0 V: ele atravessa o shunt interno do módulo, e é essa passagem que mede a corrente. Do outro lado do shunt está o COM, que vai ao BD-0V-B. Ligado direto na barra, a posição funciona e a corrente lê zero para sempre — sem nenhum sintoma além do alarme errado. Cada posição tem o SEU canal: juntar dois retornos soma as correntes e cega o diagnóstico.",
    "cor": "#1864ab",
    "corNome": "azul escuro",
    "nome": "posição 4 · retorno"
  },
  {
    "n": "X13e",
    "etapa": 6,
    "classe": "comum",
    "func": "medida",
    "mm2": 0.5,
    "prensa": "PG9-3",
    "de": {
      "camara": "PL-2",
      "borne": "r1"
    },
    "para": {
      "comp": "N4AIC24",
      "via": "I5"
    },
    "diz": "A volta da posição 5 — entra no canal I5 do módulo de medição.",
    "rota": [
      "CV-dir",
      "CH-topo"
    ],
    "porque": "⭐ O RETORNO NÃO VAI DIRETO AO 0 V: ele atravessa o shunt interno do módulo, e é essa passagem que mede a corrente. Do outro lado do shunt está o COM, que vai ao BD-0V-B. Ligado direto na barra, a posição funciona e a corrente lê zero para sempre — sem nenhum sintoma além do alarme errado. Cada posição tem o SEU canal: juntar dois retornos soma as correntes e cega o diagnóstico.",
    "cor": "#1864ab",
    "corNome": "azul escuro",
    "nome": "posição 5 · retorno"
  },
  {
    "n": "X13f",
    "etapa": 6,
    "classe": "comum",
    "func": "medida",
    "mm2": 0.5,
    "prensa": "PG9-3",
    "de": {
      "camara": "PL-2",
      "borne": "r2"
    },
    "para": {
      "comp": "N4AIC24",
      "via": "I6"
    },
    "diz": "A volta da posição 6 — entra no canal I6 do módulo de medição.",
    "rota": [
      "CV-dir",
      "CH-topo"
    ],
    "porque": "⭐ O RETORNO NÃO VAI DIRETO AO 0 V: ele atravessa o shunt interno do módulo, e é essa passagem que mede a corrente. Do outro lado do shunt está o COM, que vai ao BD-0V-B. Ligado direto na barra, a posição funciona e a corrente lê zero para sempre — sem nenhum sintoma além do alarme errado. Cada posição tem o SEU canal: juntar dois retornos soma as correntes e cega o diagnóstico.",
    "cor": "#1864ab",
    "corNome": "azul escuro",
    "nome": "posição 6 · retorno"
  },
  {
    "n": "X13g",
    "etapa": 6,
    "classe": "comum",
    "func": "medida",
    "mm2": 0.5,
    "prensa": "PG9-3",
    "de": {
      "camara": "PL-2",
      "borne": "r3"
    },
    "para": {
      "comp": "N4AIC24",
      "via": "I7"
    },
    "diz": "A volta da posição 7 — entra no canal I7 do módulo de medição.",
    "rota": [
      "CV-dir",
      "CH-topo"
    ],
    "porque": "⭐ O RETORNO NÃO VAI DIRETO AO 0 V: ele atravessa o shunt interno do módulo, e é essa passagem que mede a corrente. Do outro lado do shunt está o COM, que vai ao BD-0V-B. Ligado direto na barra, a posição funciona e a corrente lê zero para sempre — sem nenhum sintoma além do alarme errado. Cada posição tem o SEU canal: juntar dois retornos soma as correntes e cega o diagnóstico.",
    "cor": "#1864ab",
    "corNome": "azul escuro",
    "nome": "posição 7 · retorno"
  },
  {
    "n": "X13h",
    "etapa": 6,
    "classe": "comum",
    "func": "medida",
    "mm2": 0.5,
    "prensa": "PG9-3",
    "de": {
      "camara": "PL-2",
      "borne": "r4"
    },
    "para": {
      "comp": "N4AIC24",
      "via": "I8"
    },
    "diz": "A volta da posição 8 — entra no canal I8 do módulo de medição.",
    "rota": [
      "CV-dir",
      "CH-topo"
    ],
    "porque": "⭐ O RETORNO NÃO VAI DIRETO AO 0 V: ele atravessa o shunt interno do módulo, e é essa passagem que mede a corrente. Do outro lado do shunt está o COM, que vai ao BD-0V-B. Ligado direto na barra, a posição funciona e a corrente lê zero para sempre — sem nenhum sintoma além do alarme errado. Cada posição tem o SEU canal: juntar dois retornos soma as correntes e cega o diagnóstico.",
    "cor": "#1864ab",
    "corNome": "azul escuro",
    "nome": "posição 8 · retorno"
  },
  {
    "n": "X15",
    "etapa": 6,
    "mm2": 0.25,
    "func": "log5",
    "classe": "alim",
    "de": {
      "comp": "BD-5V",
      "via": "O10"
    },
    "para": {
      "camara": "SENS",
      "borne": "VCC"
    },
    "diz": "Alimentação do AM2315C.",
    "nome": "AM2315C · VCC",
    "prensa": "PG9-3",
    "rota": [
      "CH-1x4",
      "CV-dir"
    ],
    "cor": "#7048e8",
    "corNome": "violeta"
  },
  {
    "n": "X16",
    "etapa": 6,
    "mm2": 0.25,
    "func": "zero",
    "classe": "comum",
    "de": {
      "camara": "SENS",
      "borne": "GND"
    },
    "para": {
      "comp": "BD-0V-B",
      "via": "Z26"
    },
    "diz": "Retorno do sensor.",
    "nome": "AM2315C · GND",
    "prensa": "PG9-3",
    "rota": [
      "CV-dir",
      "CH-3x2"
    ],
    "cor": "#1864ab",
    "corNome": "azul escuro"
  },
  {
    "n": "X17",
    "etapa": 6,
    "mm2": 0.25,
    "func": "digital",
    "classe": "sinal",
    "de": {
      "comp": "RTC",
      "via": "SDA"
    },
    "para": {
      "camara": "SENS",
      "borne": "SDA"
    },
    "diz": "O I²C continua do RTC até o sensor, dentro da câmara.",
    "nome": "I²C SDA → câmara",
    "prensa": "PG9-3",
    "rota": [
      "CH-3x2",
      "CV-dir"
    ],
    "porque": "⭐ Segunda parada do MESMO barramento: Mega → RTC → AM2315C. Dois endereços, um par de fios.",
    "cor": "#495057",
    "corNome": "cinza"
  },
  {
    "n": "X18",
    "etapa": 6,
    "mm2": 0.25,
    "func": "digital",
    "classe": "sinal",
    "de": {
      "comp": "RTC",
      "via": "SCL"
    },
    "para": {
      "camara": "SENS",
      "borne": "SCL"
    },
    "diz": "Idem para o clock.",
    "nome": "I²C SCL → câmara",
    "prensa": "PG9-3",
    "rota": [
      "CH-3x2",
      "CV-dir"
    ],
    "cor": "#495057",
    "corNome": "cinza"
  },
  {
    "n": "X19",
    "etapa": 6,
    "mm2": 0.25,
    "func": "digital",
    "classe": "sinal",
    "de": {
      "tampa": "DS18",
      "borne": "DATA"
    },
    "para": {
      "comp": "AD-1",
      "via": "DAT"
    },
    "diz": "O DS18B20 colado no dissipador, vigiando o lado quente.",
    "nome": "DS18B20 do radiador",
    "prensa": "PG9-3",
    "rota": [
      "CV-dir",
      "CH-topo"
    ],
    "porque": "🔥 É O SENSOR QUE SALVA A PELTIER. Se o lado quente saturar, o calor volta atravessando a pastilha e ela se destrói em menos de um minuto. Este fio é o que permite o firmware perceber antes.",
    "cor": "#495057",
    "corNome": "cinza"
  },
  {
    "n": "X20",
    "etapa": 6,
    "mm2": 0.25,
    "func": "digital",
    "classe": "sinal",
    "de": {
      "tampa": "RAD",
      "borne": "RPM1"
    },
    "para": {
      "comp": "MEGA",
      "via": "D3"
    },
    "diz": "Pulsos de rotação da ventoinha do radiador #1.",
    "nome": "RPM do radiador #1",
    "prensa": "PG9-3",
    "rota": [
      "CV-dir",
      "CH-topo"
    ],
    "cor": "#495057",
    "corNome": "cinza"
  },
  {
    "n": "X21",
    "etapa": 6,
    "mm2": 0.25,
    "func": "digital",
    "classe": "sinal",
    "de": {
      "tampa": "RAD",
      "borne": "RPM2"
    },
    "para": {
      "comp": "MEGA",
      "via": "A8"
    },
    "diz": "Pulsos da #2 — cada uma é vigiada separadamente.",
    "nome": "RPM do radiador #2",
    "prensa": "PG9-3",
    "rota": [
      "CV-dir",
      "CH-3x2"
    ],
    "porque": "⭐ Dois sinais e não um. Uma ventoinha travada com a outra girando ainda mata a pastilha do lado dela — a média das duas esconderia isso.",
    "cor": "#495057",
    "corNome": "cinza"
  },
  {
    "n": "X22",
    "etapa": 6,
    "mm2": 0.25,
    "func": "log5",
    "classe": "alim",
    "de": {
      "tampa": "DS18",
      "borne": "VCC"
    },
    "para": {
      "comp": "AD-1",
      "via": "VCC"
    },
    "diz": "Alimentação do DS18B20 do radiador.",
    "nome": "DS18B20 · VCC",
    "prensa": "PG9-3",
    "rota": [
      "CV-dir",
      "CH-topo"
    ],
    "porque": "⭐ 5 V, e não 3,3: o pull-up de 4,7 kΩ do 1-Wire está na PI-1 puxando para +5 V. Sensor alimentado em 3,3 com a linha puxada para 5 leria, mas com o pino de dados acima da própria alimentação — que é o jeito de estragar um sensor devagar.",
    "cor": "#7048e8",
    "corNome": "violeta"
  },
  {
    "n": "X23",
    "etapa": 6,
    "mm2": 0.25,
    "func": "zero",
    "classe": "comum",
    "de": {
      "tampa": "DS18",
      "borne": "GND"
    },
    "para": {
      "comp": "AD-1",
      "via": "GND"
    },
    "diz": "Retorno do DS18B20.",
    "nome": "DS18B20 · GND",
    "prensa": "PG9-3",
    "rota": [
      "CV-dir",
      "CH-topo"
    ],
    "aviso": "⚠️ SEM ESTE FIO NÃO EXISTE 1-WIRE. O protocolo mede o tempo em que a linha fica baixa, e \"baixa\" é em relação a este 0 V. Sem ele o sensor não responde — ou pior, responde errado de vez em quando.",
    "cor": "#1864ab",
    "corNome": "azul escuro"
  },
  {
    "n": "M1",
    "etapa": 3,
    "classe": "alim",
    "func": "srv24",
    "mm2": 0.5,
    "de": {
      "comp": "BD-24V",
      "via": "O3"
    },
    "para": {
      "comp": "N4AIC24",
      "via": "V+"
    },
    "diz": "Os 24 V que mantêm o módulo de medição vivo.",
    "rota": [
      "CH-1x4",
      "CV-esq",
      "CH-topo"
    ],
    "porque": "⭐ VEM DO PERMANENTE, de propósito. Alimentado pelo BD-POT, o módulo apagaria junto com a potência — e aí o painel não saberia distinguir \"caiu a tensão\" de \"caiu o instrumento\". Daqui ele sobrevive à emergência e continua respondendo: V1 = 0,00 V. O instrumento tem que ser a última coisa a morrer.",
    "cor": "#e8590c",
    "corNome": "laranja",
    "nome": "24 V permanente → módulo"
  },
  {
    "n": "M2",
    "etapa": 3,
    "classe": "comum",
    "func": "zero",
    "mm2": 0.5,
    "de": {
      "comp": "N4AIC24",
      "via": "GND"
    },
    "para": {
      "comp": "BD-0V-B",
      "via": "Z22"
    },
    "diz": "O retorno do módulo: fecha a alimentação E a corrente medida das 8 posições.",
    "rota": [
      "CH-3x2"
    ],
    "porque": "⭐ É O ÚNICO RETORNO, e isso é o módulo real, não economia de fio. A pinagem publicada do N4AIC24 é VIN, GND, I1..I22, V1+, V2+, A+ e B− — não existe borne COM: o nó comum dos 22 shunts é o próprio GND. Este fio conduz ~150 mA (8 posições a 10 mA = 80 mA, mais ~60 mA do módulo), por isso 0,5 mm². Se um dia as posições virarem lâmpadas de 12 V, a soma passa de 1,6 A e este fio tem de subir de bitola.",
    "cor": "#1864ab",
    "corNome": "azul escuro",
    "nome": "0 V do módulo (retorno único)"
  },
  {
    "n": "M3",
    "etapa": 3,
    "classe": "alim",
    "func": "medida",
    "mm2": 0.25,
    "de": {
      "comp": "BD-POT",
      "via": "O3"
    },
    "para": {
      "comp": "N4AIC24",
      "via": "V1"
    },
    "diz": "A amostra dos 24 V comutados — o canal V1.",
    "rota": [
      "CH-1x4",
      "CV-esq",
      "CH-3x2"
    ],
    "porque": "⭐ Este é o fio que o D25 fazia. A diferença é que agora o valor é medido em volts, com duas casas, e volta pelo Modbus — em vez de um bit que só sabia dizer \"tem tensão\". Para diagnóstico, 23,7 V e 21,4 V são histórias diferentes. 📌 Classe alim de propósito: este fio não chaveia nada e a única rota entre o trilho 1 e o trilho 3 é a vertical de potência.",
    "cor": "#2f9e44",
    "corNome": "verde",
    "nome": "V1 — 24 V comutado"
  },
  {
    "n": "M4",
    "etapa": 3,
    "classe": "alim",
    "func": "medida",
    "mm2": 0.25,
    "de": {
      "comp": "BD-12V",
      "via": "O3"
    },
    "para": {
      "comp": "N4AIC24",
      "via": "V2"
    },
    "diz": "A amostra dos 12 V das posições — o canal V2.",
    "rota": [
      "CH-1x4",
      "CV-esq",
      "CH-3x2"
    ],
    "porque": "⭐ É o que separa \"posição desligada\" de \"alimentador caído\": as duas dão 0 mA, mas com a chave aberta o V2 continua em 12 V e com o T3 caído ele desaba. Sem este canal, o painel acusaria a posição e não o alimentador.",
    "cor": "#2f9e44",
    "corNome": "verde",
    "nome": "V2 — 12 V das posições"
  },
  {
    "n": "M6",
    "etapa": 3,
    "classe": "comum",
    "func": "zero",
    "mm2": 0.5,
    "de": {
      "comp": "MAX485",
      "via": "GND"
    },
    "para": {
      "comp": "BD-0V-B",
      "via": "Z17"
    },
    "diz": "O 0 V do transceptor RS-485.",
    "rota": [
      "CH-3x2"
    ],
    "porque": "⭐ Este é o 0 V que serve de REFERÊNCIA para o par A/B. Se ele estiver frouxo, o RS-485 não para de funcionar: ele passa a falhar de vez em quando, e o sintoma é um canal que some do dashboard sem motivo aparente.",
    "cor": "#1864ab",
    "corNome": "azul escuro",
    "nome": "0 V do MAX485"
  },
  {
    "n": "M7",
    "etapa": 3,
    "classe": "sinal",
    "func": "digital",
    "mm2": 0.25,
    "de": {
      "comp": "MAX485",
      "via": "RO"
    },
    "para": {
      "comp": "MEGA",
      "via": "D15"
    },
    "diz": "O que o módulo responde chega aqui: RO → RX3.",
    "rota": [
      "CH-topo"
    ],
    "porque": "⭐ RO é RECEIVER OUT — a saída do receptor. Ela fica em ALTA impedância enquanto o DE está em 1, e é por isso que o firmware pode deixar o pino ligado sem travar o RX. Quem escuta é o RX3 do Mega (D15), não o TX3.",
    "cor": "#495057",
    "corNome": "cinza",
    "nome": "RO → D15"
  },
  {
    "n": "M8",
    "etapa": 3,
    "classe": "sinal",
    "func": "digital",
    "mm2": 0.25,
    "de": {
      "comp": "MAX485",
      "via": "DI"
    },
    "para": {
      "comp": "MEGA",
      "via": "D14"
    },
    "diz": "O que o Mega pergunta sai por aqui: TX3 → DI.",
    "rota": [
      "CH-topo"
    ],
    "porque": "⭐ DI é DRIVER IN. O TX3 (D14) escreve, o DI repete na linha diferencial. Inverter estes dois — DI no D15 e RO no D14 — é o erro de montagem mais comum do MAX485, e o sintoma é silêncio total: o Mega fala para si mesmo.",
    "cor": "#495057",
    "corNome": "cinza",
    "nome": "DI → D14"
  },
  {
    "n": "M9",
    "etapa": 3,
    "classe": "sinal",
    "func": "digital",
    "mm2": 0.25,
    "de": {
      "comp": "MAX485",
      "via": "DE/RE"
    },
    "para": {
      "comp": "MEGA",
      "via": "D26"
    },
    "diz": "O pino que diz ao MAX485 se ele fala ou escuta.",
    "rota": [
      "CH-topo"
    ],
    "porque": "⭐ DE e /RE estão amarrados: em 1 transmite, em 0 escuta. O firmware tem que SOLTAR o pino depois de perguntar — se ficar em 1, o módulo nunca responde. E há um detalhe de tempo: soltar antes do último bit sair corta a resposta pela metade, então espere o Serial3 terminar de transmitir.",
    "cor": "#495057",
    "corNome": "cinza",
    "nome": "DE/RE → D26"
  },
  {
    "n": "M10",
    "etapa": 3,
    "classe": "sinal",
    "func": "digital",
    "mm2": 0.25,
    "de": {
      "comp": "N4AIC24",
      "via": "A"
    },
    "para": {
      "comp": "MAX485",
      "via": "A"
    },
    "diz": "Um dos dois fios do par trançado.",
    "rota": [
      "CH-3x2"
    ],
    "porque": "⚠️ A e B são um PAR TRANÇADO de verdade — os dois fios girados um sobre o outro, não dois fios paralelos. É o trançado que faz o ruído entrar igual nos dois e sumir na subtração do receptor. Separados, funcionam na bancada e falham no dia da apresentação.",
    "cor": "#495057",
    "corNome": "cinza",
    "nome": "A do par"
  },
  {
    "n": "M11",
    "etapa": 3,
    "classe": "sinal",
    "func": "digital",
    "mm2": 0.25,
    "de": {
      "comp": "N4AIC24",
      "via": "B"
    },
    "para": {
      "comp": "MAX485",
      "via": "B"
    },
    "diz": "O outro fio do par trançado.",
    "rota": [
      "CH-3x2"
    ],
    "porque": "⚠️ Invertido com o A, o barramento fica mudo — e não queima nada. Se depois de ligar tudo o módulo não responder a nenhum endereço, troque A com B antes de suspeitar do firmware.",
    "cor": "#495057",
    "corNome": "cinza",
    "nome": "B do par"
  },
  {
    "n": "M12",
    "etapa": 3,
    "classe": "comum",
    "func": "zero",
    "mm2": 0.25,
    "de": {
      "comp": "F-P",
      "via": "GND"
    },
    "para": {
      "comp": "BD-0V-B",
      "via": "Z25"
    },
    "diz": "O 0 V da placa de fusíveis — só para os LEDs indicadores de canal.",
    "rota": [
      "CH-3x2"
    ],
    "porque": "⚠️ Este fio NÃO é o retorno das posições. Ele fecha o circuito dos 8 LEDs que acendem junto com cada chave (~4 mA cada). O retorno de cada posição continua sendo o borne n− que fica VAZIO, porque a corrente tem que passar pelo shunt do módulo.",
    "cor": "#1864ab",
    "corNome": "azul escuro",
    "nome": "0 V da placa de fusíveis"
  }
];
export const PRENSAS_PAINEL=[
  {
    "id": "AC-IN",
    "tipo": "PG13,5",
    "liga": "rede AC + PE",
    "face": "base",
    "x": 50,
    "classe": "potencia",
    "nome": "ENTRADA AC — única alimentação externa",
    "diz": "Cabo com dois condutores ativos e PE, rosca e diâmetro pela instalação real."
  },
  {
    "id": "PG13-2",
    "tipo": "PG13,5",
    "liga": "câmara PC-1",
    "face": "base",
    "x": 230,
    "classe": "potencia",
    "nome": "SAÍDA POTÊNCIA → CÂMARA",
    "diz": "Saídas dos BTS e alimentação de cargas/ventilação."
  },
  {
    "id": "PG9-3",
    "tipo": "PG11",
    "liga": "câmara PC-2",
    "face": "base",
    "x": 620,
    "classe": "sinal",
    "nome": "SAÍDA SINAIS → CÂMARA",
    "diz": "Sensores e os 8 retornos de medição, segregados da potência. ⚠️ PG11 e não PG9: com as 8 posições da placa de LED este feixe vai a 9,5 mm e o PG9 aperta só até 8 mm."
  }
];