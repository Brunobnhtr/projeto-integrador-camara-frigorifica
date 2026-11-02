export const BASE_INT=485;
export const CAIXA={
  "x1": 180,
  "x2": 700,
  "y1": 70,
  "y2": 590,
  "cobertura": 0,
  "xps": 0,
  "duto": 62,
  "acrilico": 8,
  "plenum": 46
};
export const COMPONENTES=[
  {
    "id": "PELT",
    "pc": "PC-1",
    "nome": "2× Peltier TEC1-12706",
    "tipo": "frio",
    "x": 378,
    "y": 133,
    "w": 124,
    "h": 34,
    "cor": "#1971c2",
    "onde": "Na parede traseira superior (X 95 a 205 mm, Z 160 a 235 mm). Face fria para dentro com aletas (saliência 45 mm); face quente externa com radiador e 2 coolers de 80 mm.",
    "porque": "Posicionado no alto da parede traseira (tampa técnica) para insuflar o ar refrigerado diretamente na câmara sobre a calha de condensado, circulando com os dutos laterais.",
    "terminais": [
      {
        "t": "+",
        "de": "BTS #1 · M+",
        "ref": [
          "BTS1",
          "M+"
        ],
        "fio": "1,5 mm² vermelho"
      },
      {
        "t": "−",
        "de": "BTS #1 · M−",
        "ref": [
          "BTS1",
          "M−"
        ],
        "fio": "1,5 mm² preto"
      }
    ],
    "avisos": [
      "⭐ AS DUAS EM SÉRIE, não em paralelo. O par forma uma carga de 24 V / 6 A que se alimenta direto do barramento, sem conversor — e cada pastilha continua vendo os seus 12 V nominais.",
      "🔥 SE UM COOLER DO RADIADOR PARAR, A PASTILHA MORRE EM MENOS DE UM MINUTO. Ela não produz frio: transporta calor de um lado para o outro. Lado quente saturado = o calor volta atravessando a pastilha. Por isso o firmware monitora o RPM.",
      "⚠️ NUNCA COMANDAR POR PWM RÁPIDO. Cada liga-desliga é um choque térmico na junção. O BTS #1 trabalha em regime contínuo ou com chaveamento muito lento."
    ]
  },
  {
    "id": "VF",
    "pc": "PC-1",
    "nome": "2× ventoinha fria 40 mm",
    "tipo": "ar",
    "x": 390,
    "y": 178,
    "w": 100,
    "h": 26,
    "cor": "#4dabf7",
    "sopra": "baixo",
    "onde": "Logo abaixo das Peltier, soprando PARA BAIXO.",
    "porque": "Sem elas o frio fica colado na pastilha e a câmara estratifica — topo gelado, fundo morno. O ar precisa ser empurrado.",
    "terminais": [
      {
        "t": "+",
        "de": "KA3 · NO3",
        "ref": [
          "KA123",
          "NO3"
        ],
        "fio": "0,5 mm² vermelho"
      },
      {
        "t": "−",
        "de": "BD-0V · Z13",
        "ref": [
          "BD-0V",
          "Z13"
        ],
        "fio": "0,5 mm² preto"
      }
    ],
    "avisos": [
      "📌 DIVIDEM O CONTATO DO KA3 COM AS 2 DO DUTO. São 4 ventoinhas no mesmo par de fios — ligam e desligam juntas, o que é o correto: elas formam um circuito de ar só.",
      "⭐ CONTINUAM GIRANDO DEPOIS DE DESLIGAR (pós-ventilação). O calor acumulado no dissipador precisa sair, senão volta para dentro da câmara."
    ]
  },
  {
    "id": "VD1",
    "pc": "PC-1",
    "nome": "ventoinha da entrada do duto esq.",
    "tipo": "ar",
    "x": 340,
    "y": 485,
    "w": 36,
    "h": 30,
    "cor": "#4dabf7",
    "sopra": "esquerda",
    "grupoAr": "duto",
    "pequeno": true,
    "onde": "⭐ ABAIXO DO PTC, na BOCA do duto esquerdo — não dentro dele.",
    "porque": "Fecha o circuito: o ar que desceu pelo centro entra aqui e sobe pelo duto lateral até o topo. É o que impede o gradiente entre a base e a tampa. 🔧 Ela ficava DENTRO do duto de 30 × 30 mm, e isso era um erro de duas caras: uma ventoinha de 40 mm não cabe folgada num vão de 30, e enfiada lá dentro ela sopra contra a parede em vez de empurrar o ar para a entrada.",
    "terminais": [
      {
        "t": "+",
        "de": "KA3 · NO3",
        "ref": [
          "KA123",
          "NO3"
        ],
        "fio": "em paralelo com as frias"
      },
      {
        "t": "−",
        "de": "BD-0V · Z13",
        "ref": [
          "BD-0V",
          "Z13"
        ],
        "fio": "—"
      }
    ],
    "avisos": [
      "📌 O duto fica FORA da parede de acrílico, dentro do isolamento. O ar circula sem furar o volume útil.",
      "⭐ AS DUAS FICAM LADO A LADO, ABAIXO DO PTC, cada uma soprando para a boca do seu duto. Assim elas ficam acessíveis para manutenção sem desmontar o duto, e o ar entra no duto já com velocidade em vez de ser empurrado contra a parede lateral.",
      "⚠️ CONFIRA A SETA DE FLUXO no corpo de cada uma antes de fixar. Invertidas, as duas puxam o ar do duto para o centro e o circuito de ar roda ao contrário — defeito quase impossível de perceber sem teste de fumaça."
    ]
  },
  {
    "id": "VD2",
    "pc": "PC-1",
    "nome": "ventoinha da entrada do duto dir.",
    "tipo": "ar",
    "x": 504,
    "y": 485,
    "w": 36,
    "h": 30,
    "cor": "#4dabf7",
    "sopra": "direita",
    "grupoAr": "duto",
    "pequeno": true,
    "onde": "⭐ ABAIXO DO PTC, na BOCA do duto direito — ao lado da VD1.",
    "porque": "Idem à esquerda — o retorno tem que ser simétrico, senão um lado da câmara fica mais frio que o outro.",
    "terminais": [
      {
        "t": "+",
        "de": "KA3 · NO3",
        "ref": [
          "KA123",
          "NO3"
        ],
        "fio": "em paralelo"
      },
      {
        "t": "−",
        "de": "BD-0V · Z13",
        "ref": [
          "BD-0V",
          "Z13"
        ],
        "fio": "—"
      }
    ],
    "avisos": []
  },
  {
    "id": "SENS",
    "pc": "PC-2",
    "nome": "AM2315C — temperatura e umidade",
    "tipo": "sensor",
    "x": 402,
    "y": 310,
    "w": 76,
    "h": 40,
    "cor": "#f76707",
    "onde": "⭐ NO CENTRO GEOMÉTRICO, suspenso no ar — longe da Peltier e longe do PTC.",
    "porque": "Este é o ponto mais importante da montagem. Se o sensor encostar na Peltier ele lê a pastilha, não o ar: o controle desliga cedo demais e a câmara nunca chega ao setpoint. Se ficar perto do PTC, lê o aquecedor e desliga cedo do outro lado. No centro, ele lê o que o ensaio realmente vê.",
    "terminais": [
      {
        "t": "VCC",
        "de": "BD-5V saída 10",
        "ref": [
          "BD-5V",
          "O10"
        ],
        "fio": "0,25 mm² vermelho"
      },
      {
        "t": "GND",
        "de": "BD-0V · Z15",
        "ref": [
          "BD-0V",
          "Z15"
        ],
        "fio": "0,25 mm² preto"
      },
      {
        "t": "SDA",
        "de": "Mega D20",
        "ref": [
          "MEGA",
          "D20"
        ],
        "fio": "0,25 mm² azul"
      },
      {
        "t": "SCL",
        "de": "Mega D21",
        "ref": [
          "MEGA",
          "D21"
        ],
        "fio": "0,25 mm² amarelo"
      }
    ],
    "avisos": [
      "🔥 É O ÚNICO SENSOR DO CONTROLE, E ISSO É UM RISCO ASSUMIDO. Se ele travar lendo um valor plausível mas errado, o sistema aquece ou resfria sem perceber. O firmware desconfia dele: valor congelado por muito tempo, fora de faixa ou variação impossível derrubam o ensaio.",
      "💧 A UMIDADE NÃO É ENFEITE. Ensaio térmico com condensação não vale — é ela que avisa quando é hora do ciclo de degelo.",
      "📌 I²C no endereço 0x38, dividindo o barramento com o DS3231.",
      "⚠️ Suspenso por fio de nylon ou haste fina — nada de parafusar na parede, que conduz a temperatura do acrílico para o sensor."
    ]
  },
  {
    "id": "PTC",
    "pc": "PC-1",
    "nome": "Aquecedor Cerâmico PTC 12 V / 50 W com ventoinha integrada",
    "tipo": "quente",
    "x": 385,
    "y": 430,
    "w": 110,
    "h": 30,
    "cor": "#e03131",
    "onde": "Na base interna, montado sobre a chapa e plenum inferior.",
    "porque": "Elemento autorregulável que aquece o ar e o sopra para o plenum e dutos laterais. Acionado diretamente por PWM pelo BTS7960 (BTS2) em 12 Vcc.",
    "terminais": [
      {
        "t": "+",
        "de": "BTS #2 · M+",
        "ref": [
          "BTS2",
          "M+"
        ],
        "fio": "1,5 mm² vermelho"
      },
      {
        "t": "−",
        "de": "BTS #2 · M−",
        "ref": [
          "BTS2",
          "M−"
        ],
        "fio": "1,5 mm² preto"
      }
    ],
    "avisos": [
      "⭐ TOTALMENTE LIBERADO: Elemento cerâmico PTC 12 V / 50 W autorregulável com mini ventilador axial integrado.",
      "⚡ ACIONAMENTO DIRETO VIA BTS2: Modulado por PWM pelo driver BTS7960 #2.",
      "📌 Sem termostatos bimetálicos ST-1/ST-2 em série: o aquecedor cerâmico possui característica intrínseca de autorregulação e supervisão pelo sensor digital e firmware."
    ]
  },
  {
    "id": "VP",
    "pc": "PC-1",
    "nome": "ventoinha do PTC",
    "tipo": "ar",
    "x": 405,
    "y": 396,
    "w": 70,
    "h": 26,
    "cor": "#4dabf7",
    "sopra": "baixo",
    "onde": "Logo acima do PTC, soprando PARA BAIXO — no MESMO sentido das de cima.",
    "porque": "Empurra o ar sobre o PTC e para dentro do plenum, de onde ele sobe pelos dutos. 🔧 Antes tinha canal próprio; hoje entra em PARALELO com as outras quatro internas, porque todas têm a mesma condição — ensaio rodando.",
    "terminais": [
      {
        "t": "+",
        "de": "KA3 · NO3 (emenda com as 4 de circulação)",
        "ref": [
          "KA123",
          "NO3"
        ],
        "fio": "0,5 mm² vermelho"
      },
      {
        "t": "−",
        "de": "BD-0V · Z13 (emenda com as 4 de circulação)",
        "ref": [
          "BD-0V",
          "Z13"
        ],
        "fio": "0,5 mm² preto"
      }
    ],
    "avisos": [
      "Conferir a tensão da fan do PTC no kit real antes de agrupá-la nas ventoinhas 12 V. Não presumir compatibilidade."
    ]
  },
  {
    "id": "PL-1",
    "pc": "PC-2",
    "nome": "Placa PL-1 · 4 posições de ensaio",
    "tipo": "dut",
    "x": 296,
    "y": 420,
    "w": 76,
    "h": 56,
    "cor": "#c92a2a",
    "dut": 1,
    "onde": "Nas tiras de alumínio (CAM-26) com espaçadores M3. A PCB real tem 95 × 75 mm — nesta vista ela é desenhada menor para caber junto das outras peças.",
    "porque": "As 4 posições desta placa: o positivo vem da chave da placa F-P e o retorno entra no canal I_n do N4AIC24, que mede a corrente e entrega por Modbus.",
    "terminais": [
      {
        "t": "+1",
        "de": "F-P1",
        "ref": [
          "F-P",
          "F-P1"
        ],
        "fio": "0,5 mm² amarelo"
      },
      {
        "t": "+2",
        "de": "F-P2",
        "ref": [
          "F-P",
          "F-P2"
        ],
        "fio": "0,5 mm² amarelo"
      },
      {
        "t": "+3",
        "de": "F-P3",
        "ref": [
          "F-P",
          "F-P3"
        ],
        "fio": "0,5 mm² amarelo"
      },
      {
        "t": "+4",
        "de": "F-P4",
        "ref": [
          "F-P",
          "F-P4"
        ],
        "fio": "0,5 mm² amarelo"
      },
      {
        "t": "r1",
        "de": "N4AIC24 · I1",
        "ref": [
          "N4AIC24",
          "I1"
        ],
        "fio": "0,5 mm² azul"
      },
      {
        "t": "r2",
        "de": "N4AIC24 · I2",
        "ref": [
          "N4AIC24",
          "I2"
        ],
        "fio": "0,5 mm² azul"
      },
      {
        "t": "r3",
        "de": "N4AIC24 · I3",
        "ref": [
          "N4AIC24",
          "I3"
        ],
        "fio": "0,5 mm² azul"
      },
      {
        "t": "r4",
        "de": "N4AIC24 · I4",
        "ref": [
          "N4AIC24",
          "I4"
        ],
        "fio": "0,5 mm² azul"
      }
    ],
    "avisos": [
      "⚠️ O retorno NÃO vai ao 0 V: ele entra no canal I_n do módulo de medição. É a corrente passando pelo shunt interno que produz o número — ligado direto na barra, a posição acende e o painel lê zero.",
      "⭐ São 2 placas iguais. Esta é a de nº 1; a outra tem os mesmos 4 canais nos bornes seguintes da placa F-P."
    ]
  },
  {
    "id": "PL-2",
    "pc": "PC-2",
    "nome": "Placa PL-2 · 4 posições de ensaio",
    "tipo": "dut",
    "x": 510,
    "y": 420,
    "w": 76,
    "h": 56,
    "cor": "#c92a2a",
    "dut": 2,
    "onde": "Nas tiras de alumínio (CAM-26) com espaçadores M3. A PCB real tem 95 × 75 mm — nesta vista ela é desenhada menor para caber junto das outras peças.",
    "porque": "As 4 posições desta placa: o positivo vem da chave da placa F-P e o retorno entra no canal I_n do N4AIC24, que mede a corrente e entrega por Modbus.",
    "terminais": [
      {
        "t": "+1",
        "de": "F-P5",
        "ref": [
          "F-P",
          "F-P5"
        ],
        "fio": "0,5 mm² amarelo"
      },
      {
        "t": "+2",
        "de": "F-P6",
        "ref": [
          "F-P",
          "F-P6"
        ],
        "fio": "0,5 mm² amarelo"
      },
      {
        "t": "+3",
        "de": "F-P7",
        "ref": [
          "F-P",
          "F-P7"
        ],
        "fio": "0,5 mm² amarelo"
      },
      {
        "t": "+4",
        "de": "F-P8",
        "ref": [
          "F-P",
          "F-P8"
        ],
        "fio": "0,5 mm² amarelo"
      },
      {
        "t": "r1",
        "de": "N4AIC24 · I5",
        "ref": [
          "N4AIC24",
          "I5"
        ],
        "fio": "0,5 mm² azul"
      },
      {
        "t": "r2",
        "de": "N4AIC24 · I6",
        "ref": [
          "N4AIC24",
          "I6"
        ],
        "fio": "0,5 mm² azul"
      },
      {
        "t": "r3",
        "de": "N4AIC24 · I7",
        "ref": [
          "N4AIC24",
          "I7"
        ],
        "fio": "0,5 mm² azul"
      },
      {
        "t": "r4",
        "de": "N4AIC24 · I8",
        "ref": [
          "N4AIC24",
          "I8"
        ],
        "fio": "0,5 mm² azul"
      }
    ],
    "avisos": [
      "⚠️ O retorno NÃO vai ao 0 V: ele entra no canal I_n do módulo de medição. É a corrente passando pelo shunt interno que produz o número — ligado direto na barra, a posição acende e o painel lê zero.",
      "⭐ São 2 placas iguais. Esta é a de nº 2; a outra tem os mesmos 4 canais nos bornes seguintes da placa F-P."
    ]
  },
  
  
];
export const EMENDAS_CAMARA=[
  {
    "de": {
      "p": "VF",
      "b": "+"
    },
    "para": {
      "p": "VD1",
      "b": "+"
    },
    "diz": "⭐ as 5 internas em paralelo — 1 par de fios para 5 ventoinhas"
  },
  {
    "de": {
      "p": "VF",
      "b": "−"
    },
    "para": {
      "p": "VD1",
      "b": "−"
    },
    "diz": ""
  },
  {
    "de": {
      "p": "VF",
      "b": "+"
    },
    "para": {
      "p": "VD2",
      "b": "+"
    },
    "diz": ""
  },
  {
    "de": {
      "p": "VF",
      "b": "−"
    },
    "para": {
      "p": "VD2",
      "b": "−"
    },
    "diz": ""
  },
  {
    "de": {
      "p": "VF",
      "b": "+"
    },
    "para": {
      "p": "VP",
      "b": "+"
    },
    "diz": "🔧 A ventoinha do PTC entrou nesta emenda. Ela tinha canal e par próprios (fios X7/X8) para continuar girando depois do aquecedor. A alteração foi proposta junto com ST-1/ST-2, mas a proteção térmica ainda não está aprovada; não energizar o PTC até confirmar componentes, classificação CC, rearme manual e ensaios."
  },
  {
    "de": {
      "p": "VF",
      "b": "−"
    },
    "para": {
      "p": "VP",
      "b": "−"
    },
    "diz": ""
  }
];
export const EXTERNOS=[
  {
    "id": "DIS1",
    "nome": "dissipador + cooler",
    "x": 366,
    "y": 74,
    "w": 68,
    "h": 50
  },
  {
    "id": "DIS2",
    "nome": "dissipador + cooler",
    "x": 446,
    "y": 74,
    "w": 68,
    "h": 50
  }
];
export const PECAS3D=[
  {
    "id": "PELT",
    "bornes": [
      {
        "b": "+",
        "lado": "esq",
        "t": 0.3
      },
      {
        "b": "−",
        "lado": "esq",
        "t": 0.7
      }
    ],
    "nome": "2× Peltier",
    "cor": "#1971c2",
    "pc": "PC-1",
    "caixa": [
      60,
      30,
      236,
      140,
      70,
      250
    ],
    "diz": "Na parede traseira superior. Face fria para dentro (saliência 45 mm), quente para fora."
  },
  {
    "id": "VF",
    "bornes": [
      {
        "b": "+",
        "lado": "base",
        "t": 0.35
      },
      {
        "b": "−",
        "lado": "base",
        "t": 0.7
      }
    ],
    "nome": "2× ventoinha fria",
    "cor": "#4dabf7",
    "pc": "PC-1",
    "caixa": [
      70,
      32,
      210,
      130,
      68,
      234
    ],
    "diz": "Sopram para BAIXO — o ar desce pelo centro."
  },
  {
    "id": "SENS",
    "bornes": [
      {
        "b": "VCC",
        "lado": "dir",
        "t": 0.15
      },
      {
        "b": "GND",
        "lado": "dir",
        "t": 0.38
      },
      {
        "b": "SDA",
        "lado": "dir",
        "t": 0.62
      },
      {
        "b": "SCL",
        "lado": "dir",
        "t": 0.85
      }
    ],
    "nome": "AM2315C",
    "cor": "#f76707",
    "pc": "PC-2",
    "caixa": [
      88,
      42,
      116,
      112,
      58,
      136
    ],
    "diz": "⭐ No centro geométrico, suspenso. Longe da Peltier e do PTC."
  },
  {
    "id": "VP",
    "bornes": [
      {
        "b": "+",
        "lado": "topo",
        "t": 0.3
      },
      {
        "b": "−",
        "lado": "topo",
        "t": 0.7
      }
    ],
    "nome": "ventoinha do PTC",
    "cor": "#4dabf7",
    "pc": "PC-1",
    "caixa": [
      76,
      32,
      50,
      124,
      68,
      72
    ],
    "diz": "Sopra para BAIXO também — o circuito de ar é único."
  },
  {
    "id": "PTC",
    "bornes": [
      {
        "b": "+",
        "lado": "base",
        "t": 0.3
      },
      {
        "b": "−",
        "lado": "base",
        "t": 0.7
      }
    ],
    "nome": "PTC proposto 12 V / 50 W — bloqueado",
    "cor": "#e03131",
    "pc": "PC-1",
    "caixa": [
      64,
      30,
      26,
      136,
      70,
      44
    ],
    "diz": "Na base, sobre o plenum de 30 mm."
  },
  {
    "id": "PL-1",
    "bornes": [
      {
        "b": "+1",
        "lado": "base",
        "t": 0.15
      },
      {
        "b": "+2",
        "lado": "base",
        "t": 0.38
      },
      {
        "b": "+3",
        "lado": "base",
        "t": 0.62
      },
      {
        "b": "+4",
        "lado": "base",
        "t": 0.85
      },
      {
        "b": "r1",
        "lado": "topo",
        "t": 0.15
      },
      {
        "b": "r2",
        "lado": "topo",
        "t": 0.38
      },
      {
        "b": "r3",
        "lado": "topo",
        "t": 0.62
      },
      {
        "b": "r4",
        "lado": "topo",
        "t": 0.85
      }
    ],
    "nome": "Placa PL-1 — 4 posições · PCB real 95 × 75 mm (LED + 1 kΩ)",
    "cor": "#c92a2a",
    "pc": "PC-2",
    "caixa": [
      22,
      25,
      24,
      58,
      75,
      58
    ],
    "diz": "PCB de 95 × 75 mm com 4 canais. Cada canal é uma coluna reta: borne + (borda de baixo) → ânodo do LED → cátodo → resistor de 1 kΩ → borne r (borda de cima). Sem barramento comum: as 2 placas dão as 8 posições, o + vem da chave da placa F-P e o r volta para o canal I_n do módulo de medição."
  },
  {
    "id": "PL-2",
    "bornes": [
      {
        "b": "+1",
        "lado": "base",
        "t": 0.15
      },
      {
        "b": "+2",
        "lado": "base",
        "t": 0.38
      },
      {
        "b": "+3",
        "lado": "base",
        "t": 0.62
      },
      {
        "b": "+4",
        "lado": "base",
        "t": 0.85
      },
      {
        "b": "r1",
        "lado": "topo",
        "t": 0.15
      },
      {
        "b": "r2",
        "lado": "topo",
        "t": 0.38
      },
      {
        "b": "r3",
        "lado": "topo",
        "t": 0.62
      },
      {
        "b": "r4",
        "lado": "topo",
        "t": 0.85
      }
    ],
    "nome": "Placa PL-2 — 4 posições · PCB real 95 × 75 mm (LED + 1 kΩ)",
    "cor": "#c92a2a",
    "pc": "PC-2",
    "caixa": [
      142,
      25,
      24,
      178,
      75,
      58
    ],
    "diz": "PCB de 95 × 75 mm com 4 canais. Cada canal é uma coluna reta: borne + (borda de baixo) → ânodo do LED → cátodo → resistor de 1 kΩ → borne r (borda de cima). Sem barramento comum: as 2 placas dão as 8 posições, o + vem da chave da placa F-P e o r volta para o canal I_n do módulo de medição."
  },
  {
    "id": "SUP-E",
    "bornes": [],
    "nome": "Suporte CAM-26 — tiras de alumínio (apoio esquerdo)",
    "cor": "#868e96",
    "pc": "PC-1",
    "caixa": [
      14,
      25,
      22,
      21,
      75,
      62
    ],
    "diz": "⭐ SUPORTE DAS DUAS PLACAS. Duas tiras de alumínio apoiadas nas cantoneiras CAM-24, com espaçadores M3 para elevar as placas. Deixa o ar circular 100% livre pela frente e por trás das PCBs, sem bloquear o fluxo vertical."
  },
  {
    "id": "SUP-D",
    "bornes": [],
    "nome": "Suporte CAM-26 — tiras de alumínio (apoio direito)",
    "cor": "#868e96",
    "pc": "PC-1",
    "caixa": [
      179,
      25,
      22,
      186,
      75,
      62
    ],
    "diz": "A outra lateral do mesmo berço. As duas ficam FORA das placas, para não tapar LED nem borne."
  },
  
  
  {
    "id": "VD1",
    "bornes": [
      {
        "b": "+",
        "lado": "topo",
        "t": 0.35
      },
      {
        "b": "−",
        "lado": "topo",
        "t": 0.7
      }
    ],
    "nome": "vent. entrada duto esq.",
    "cor": "#74c0fc",
    "pc": "PC-1",
    "fora": true,
    "caixa": [
      -32,
      35,
      108,
      -6,
      65,
      138
    ],
    "diz": "Dentro do duto lateral, FORA do volume útil. Sopra para CIMA."
  },
  {
    "id": "VD2",
    "bornes": [
      {
        "b": "+",
        "lado": "topo",
        "t": 0.35
      },
      {
        "b": "−",
        "lado": "topo",
        "t": 0.7
      }
    ],
    "nome": "vent. entrada duto dir.",
    "cor": "#74c0fc",
    "pc": "PC-1",
    "fora": true,
    "caixa": [
      206,
      35,
      108,
      232,
      65,
      138
    ],
    "diz": "Idem à esquerda — o retorno tem que ser simétrico."
  }
];
export const PRENSAS=[
  {
    "id": "PC-1",
    "nome": "POTÊNCIA",
    "y": 200,
    "cor": "#c92a2a",
    "lado": "esq",
    "onde": "canto inferior esquerdo da parede traseira",
    "diz": "A potência da Peltier e os 8 positivos das posições de ensaio saem por aqui. O ramal do PTC está excluído até definir fonte, corte DC, proteção e cabos."
  },
  {
    "id": "PC-2",
    "nome": "MEDIÇÃO E SINAL",
    "y": 440,
    "cor": "#1971c2",
    "lado": "esq",
    "onde": "canto superior esquerdo, a pelo menos 100 mm do PC-1",
    "diz": "Os 8 retornos das posições carregam a corrente que está sendo medida, e o I²C carrega pulsos de microssegundos. Um transiente de 6 A induzido aqui vira leitura errada ou sensor travado."
  }
];
export const PRENSAS3D=[
  {
    "id": "PC-1",
    "nome": "POTÊNCIA",
    "tipo": "PG13,5",
    "cor": "#c92a2a",
    "x": 40,
    "z": 10,
    "diz": "Peltier, ventoinhas internas e os 8 positivos das posições de ensaio. O ramal do PTC não está incluído: fonte, corte DC e passagem de cabos ainda não foram definidos.",
    "porque": "A contagem atual é de 12 condutores antes do ramal do PTC. Recalcular diâmetro do feixe e prensa-cabo com os cabos reais; não usar a estimativa antiga como dimensionamento."
  },
  {
    "id": "PC-2",
    "nome": "SINAL E MEDIÇÃO",
    "tipo": "PG11",
    "cor": "#1971c2",
    "x": 155,
    "z": 228,
    "diz": "As 8 posições de ensaio, o AM2315C, o DS18B20 e os dois tacômetros. Carrega os ~80 mA que estão sendo medidos e os pulsos do I²C.",
    "porque": "⚠️ PG11 e não PG9: 8 retornos de 0,5 mm² mais 9 condutores de sinal dão 9,5 mm de feixe, e o PG9 aperta até 8 mm — não fecharia com as 8 posições ligadas. Sobram 0,5 mm; se quiser folga, use PG13,5. O PG9-3 do painel cresce junto, porque é o mesmo feixe."
  }
];
export const ROTAS_CAMARA={
  "X1": {
    "alvo": "PELT.+",
    "pc": "PC-1",
    "gx": 43.2,
    "lane": 17.0,
    "sobe": 6.6
  },
  "X2": {
    "alvo": "PELT.−",
    "pc": "PC-1",
    "gx": 44.1,
    "lane": 16.0
  },
  "X9": {
    "alvo": "VF.+",
    "pc": "PC-1",
    "gx": 42.3,
    "lane": 15.0,
    "sobe": 9.2,
    "crz": 202
  },
  "X10": {
    "alvo": "VF.−",
    "pc": "PC-1",
    "gx": 41.4,
    "lane": 14.0,
    "sobe": 11.8,
    "crz": 198
  },
  "X11": {
    "alvo": "PL-1.+1",
    "pc": "PC-1",
    "gx": 38.7,
    "lane": 8.0
  },
  "X11b": {
    "alvo": "PL-1.+2",
    "pc": "PC-1",
    "gx": 37.8,
    "lane": 7.0
  },
  "X11c": {
    "alvo": "PL-1.+3",
    "pc": "PC-1",
    "gx": 36.9,
    "lane": 6.0
  },
  "X11d": {
    "alvo": "PL-1.+4",
    "pc": "PC-1",
    "gx": 36.0,
    "lane": 5.0
  },
  "X11e": {
    "alvo": "PL-2.+1",
    "pc": "PC-1",
    "gx": 35.1,
    "lane": 4.0
  },
  "X11f": {
    "alvo": "PL-2.+2",
    "pc": "PC-1",
    "gx": 34.2,
    "lane": 3.0
  },
  "X11g": {
    "alvo": "PL-2.+3",
    "pc": "PC-1",
    "gx": 33.3,
    "lane": 2.0
  },
  "X11h": {
    "alvo": "PL-2.+4",
    "pc": "PC-1",
    "gx": 32.4,
    "lane": 1.0
  },
  "X13": {
    "alvo": "PL-1.r1",
    "pc": "PC-2",
    "gx": 156.1,
    "lane": 226.0,
    "sobe": 188.0,
    "crz": 102.5
  },
  "X13b": {
    "alvo": "PL-1.r2",
    "pc": "PC-2",
    "gx": 157.0,
    "lane": 227.2,
    "sobe": 189.6,
    "crz": 101.0
  },
  "X13c": {
    "alvo": "PL-1.r3",
    "pc": "PC-2",
    "gx": 157.9,
    "lane": 228.4,
    "sobe": 191.2,
    "crz": 99.5
  },
  "X13d": {
    "alvo": "PL-1.r4",
    "pc": "PC-2",
    "gx": 158.8,
    "lane": 229.6,
    "sobe": 192.8,
    "crz": 98.0
  },
  "X13e": {
    "alvo": "PL-2.r1",
    "pc": "PC-2",
    "gx": 159.7,
    "lane": 230.8,
    "sobe": 194.4,
    "crz": 96.5
  },
  "X13f": {
    "alvo": "PL-2.r2",
    "pc": "PC-2",
    "gx": 160.6,
    "lane": 232.0,
    "sobe": 196.0,
    "crz": 95.0
  },
  "X13g": {
    "alvo": "PL-2.r3",
    "pc": "PC-2",
    "gx": 161.5,
    "lane": 233.2,
    "sobe": 197.6,
    "crz": 93.5
  },
  "X13h": {
    "alvo": "PL-2.r4",
    "pc": "PC-2",
    "gx": 162.4,
    "lane": 234.4,
    "sobe": 199.2,
    "crz": 92.0
  },
  "X15": {
    "alvo": "SENS.VCC",
    "pc": "PC-2",
    "gx": 155.2,
    "lane": 224.4,
    "sobe": 186.0
  },
  "X16": {
    "alvo": "SENS.GND",
    "pc": "PC-2",
    "gx": 154.3,
    "lane": 223.1,
    "sobe": 184.0
  },
  "X17": {
    "alvo": "SENS.SDA",
    "pc": "PC-2",
    "gx": 153.4,
    "lane": 221.8,
    "sobe": 182.0
  },
  "X18": {
    "alvo": "SENS.SCL",
    "pc": "PC-2",
    "gx": 152.5,
    "lane": 220.5,
    "sobe": 180.0
  }
};
export const TAMPA3D=[
  {
    "id": "RAD",
    "nome": "2 coolers do radiador",
    "cor": "#e8590c",
    "bornes": [
      {
        "b": "+",
        "lado": "base",
        "t": 0.12
      },
      {
        "b": "−",
        "lado": "base",
        "t": 0.3
      },
      {
        "b": "RPM1",
        "lado": "base",
        "t": 0.72
      },
      {
        "b": "RPM2",
        "lado": "base",
        "t": 0.9
      }
    ],
    "diz": "Em paralelo nos dois primeiros; cada uma com o seu fio de RPM."
  },
  {
    "id": "DS18",
    "nome": "DS18B20 do radiador",
    "cor": "#f76707",
    "bornes": [
      {
        "b": "VCC",
        "lado": "base",
        "t": 0.2
      },
      {
        "b": "GND",
        "lado": "base",
        "t": 0.5
      },
      {
        "b": "DATA",
        "lado": "base",
        "t": 0.8
      }
    ],
    "diz": "Colado no dissipador com pasta térmica. Rabicho de 3 vias: vermelho +5 V, preto 0 V, amarelo (ou branco) DATA."
  }
];
export const TRAVESSIA=[
  {
    "pc": "PC-1",
    "g": "Potência",
    "n": 2,
    "o": "Peltier + e −",
    "de": "BTS #1",
    "mm": "1,5 mm²",
    "condutores": 12
  },
  {
    "pc": "PC-1",
    "g": "Ventilação",
    "n": 2,
    "o": "⭐ as 5 internas (4 de circulação + a do PTC, em paralelo)",
    "de": "KA3 · NO3 (+) e BD-0V · Z13 (−)",
    "mm": "0,5 mm²",
    "condutores": 12
  },
  {
    "pc": "PC-1",
    "g": "Potência",
    "n": 8,
    "o": "positivos das 8 posições (um por canal da placa F-P)",
    "de": "F-P · F-P1 a F-P8",
    "mm": "0,5 mm²",
    "condutores": 12,
    "nota": "12 condutores no arranjo modelado: 2 de 1,5 mm² da Peltier, 2 de 0,5 mm² das ventoinhas e 8 positivos das posições. O ramal do PTC não está contabilizado; recalcular o prensa-cabo após definir a arquitetura e os cabos reais."
  },
  {
    "pc": "PC-2",
    "g": "Ensaio",
    "n": 8,
    "o": "retornos das 8 posições, um por canal do módulo",
    "de": "N4AIC24 · I1 a I8",
    "mm": "0,5 mm²",
    "condutores": 12,
    "nota": "⚠️ 8 retornos de 0,5 mm² mais os 4 fios do AM2315C dão 9,5 mm de feixe com os 3 do DS18B20 e os 2 dos tacômetros. O PG9 aperta até 8 mm e não fecharia: este furo é PG11, no painel e na parede."
  },
  {
    "pc": "PC-2",
    "g": "Sinal",
    "n": 4,
    "o": "AM2315C (VCC GND SDA SCL)",
    "de": "Mega + BD-5V",
    "mm": "0,25 mm²",
    "condutores": 12
  }
];
export const UTIL={
  "x1": 285,
  "x2": 595,
  "y1": 129,
  "y2": 531
};
/* ⚠️ ATENÇÃO — ESTE ENVELOPE NÃO É O DA CÂMARA DO PROJETO.
   200 × 100 × 250 = 5,0 L. A câmara real tem 300 × 200 × 250 = 15,0 L
   (ver cad_corte/parametros_v11.py). Este envelope é herança de uma versão
   antiga de 5 L, e é por isso que as peças cabem aqui com folga e o desenho
   não bate com o CAD. Redesenhar a vista em escala é trabalho pendente:/n   exige reposicionar 12 peças, os 2 prensa-cabos e recalcular as 26 rotas.
   NÃO "conserte" o CAD para bater com isto — o CAD é a verdade. */
export const UTIL3D={
  "w": 200,
  "d": 100,
  "h": 250
};