/** Discretos em uso no painel autônomo. */
export const HOSTS=[
  {
    "id": "MEGA",
    "tipo": "borne",
    "nome": "Bornes do adaptador DIN do Mega",
    "onde": "trilho 3 — a borda de BAIXO do adaptador, entre os pinos analógicos",
    "compPainel": "MEGA",
    "diz": "⭐ AQUI HAVIA UMA PLACA, E DEPOIS TRÊS BORNES. A PI-1 tinha 6 peças soldadas; o divisor e o pull-up viraram módulos comprados, e sobraram dois capacitores. Eles chegaram a morar num bloco próprio de bornes (o BS-1) — mas ali as duas pernas de cada capacitor ficavam a 30 mm uma da outra, penduradas no ar entre bornes diferentes. No adaptador do Mega o `A0` é VIZINHO do `GND2`: passo de ~3,9 mm, que é o passo da perna de um cerâmico. O capacitor deixou de ficar no ar."
  },
  {
    "id": "KM1",
    "tipo": "borne",
    "nome": "Base PTF08A do KM1",
    "onde": "trilho 1 do painel",
    "compPainel": "KM1",
    "diz": "Componente parafusado direto no borne da base, sem placa nenhuma. Dobre as pernas em U e aperte cada uma no seu parafuso."
  },
  {
    "id": "KA123",
    "tipo": "borne",
    "nome": "Bornes dos módulos KA1, KA2 e KA3",
    "onde": "caixa DIN de 6M, trilho 2",
    "compPainel": "KA123",
    "diz": "Os três módulos dividem a mesma caixa. Os resistores entram nos bornes de parafuso do próprio módulo. 🔧 A caixa era de 4M com dois módulos; o KA3 entrou no lugar do MV-1 e ela passou para 6M."
  },
  {
    "id": "BTS1",
    "tipo": "modulo",
    "nome": "Driver BTS7960 #1 (Peltier)",
    "onde": "trilho 2 do painel, sobre dissipador",
    "compPainel": "BTS1",
    "diz": "⚠️ O componente é soldado POR BAIXO do módulo comprado — fica invisível depois de montado. Fotografe antes de fechar."
  },
  {
    "id": "BTS2",
    "tipo": "modulo",
    "nome": "Driver BTS7960 #2 (PTC)",
    "onde": "trilho 2 do painel",
    "compPainel": "BTS2",
    "diz": "Idem ao BTS #1."
  },
  {
    "id": "VENT-RAD",
    "tipo": "camara",
    "nome": "Ventoinhas do radiador (lado quente)",
    "onde": "fora da câmara, no dissipador quente das Peltier",
    "terminais": [
      "+12V",
      "0V"
    ],
    "diz": "O diodo vai junto das ventoinhas, e não no painel: o pico tem que ser grampeado onde ele nasce."
  },
  {
    "id": "VENT-INT",
    "tipo": "camara",
    "nome": "As 5 ventoinhas internas (2 frias, 2 dos dutos e a do PTC)",
    "onde": "dentro da câmara, todas em paralelo no par X9 / X10",
    "terminais": [
      "+12V",
      "0V"
    ],
    "diz": "⭐ HOST NOVO, E ELE NASCEU DE UMA TROCA DE COMPONENTE. Enquanto quem ligava estas cinco era um módulo MOSFET (o MV-1), o diodo de roda-livre vinha escondido dentro da placa comprada. Com o KA3 — contato seco — ele volta a ser peça de projeto, e vai onde o pico nasce: junto dos motores."
  },
  {
    "id": "MAX485",
    "tipo": "modulo",
    "nome": "Transceptor RS-485 (MAX485 em módulo)",
    "onde": "trilho 3 do painel, ao lado do Mega",
    "compPainel": "MAX485",
    "diz": "⭐ É a peça que o projeto NÃO TINHA até a medição virar Modbus. Sem ele o Mega conversa TTL e o módulo de campo conversa diferencial — dois idiomas. O resistor de pull-down do DE/RE mora nos bornes dele."
  },
  {
    "id": "N4AIC24",
    "tipo": "modulo",
    "nome": "Módulo de aquisição N4AIC24 (22 correntes + 2 tensões)",
    "onde": "trilho 3 do painel, entre o AD-1 e o BD-0V-B",
    "compPainel": "N4AIC24",
    "diz": "Caixa DIN, bornes de parafuso. Substituiu o divisor do SV-1 e os dois ACS712 de uma vez: um instrumento, uma resposta, um par trançado."
  },
  {
    "id": "AD-1",
    "tipo": "modulo",
    "nome": "Adaptador do DS18B20",
    "onde": "trilho 3 do painel",
    "compPainel": "AD-1",
    "diz": "Traz o pull-up do 1-Wire montado de fábrica e três bornes de parafuso para a sonda."
  },
  {
    "id": "PL-1",
    "tipo": "camara",
    "nome": "Placa PL-1 — 4 posições de ensaio",
    "onde": "dentro da câmara, nas tiras de alumínio com espaçadores M3",
    "terminais": [
      "+1",
      "+2",
      "+3",
      "+4",
      "r1",
      "r2",
      "r3",
      "r4"
    ],
    "diz": "PCB de 95 x 75 mm com 4 canais de LED. Cada canal consome 9 a 11 mA (12 V sobre 1 kOhm), para o sistema perceber quando a chave da posição abre. Os 4 retornos passam, um a um, pelo shunt do módulo de medição."
  },
  {
    "id": "PL-2",
    "tipo": "camara",
    "nome": "Placa PL-2 — 4 posições de ensaio",
    "onde": "dentro da câmara, nas tiras de alumínio com espaçadores M3",
    "terminais": [
      "+1",
      "+2",
      "+3",
      "+4",
      "r1",
      "r2",
      "r3",
      "r4"
    ],
    "diz": "PCB de 95 x 75 mm com 4 canais de LED. Cada canal consome 9 a 11 mA (12 V sobre 1 kOhm), para o sistema perceber quando a chave da posição abre. Os 4 retornos passam, um a um, pelo shunt do módulo de medição."
  }
];
export const ARRANJOS={
  "serie": {
    "nome": "em série",
    "diz": "A corrente ATRAVESSA o componente. Se ele sair, o circuito abre."
  },
  "paralelo": {
    "nome": "em paralelo",
    "diz": "Ele fica DE LADO, entre dois pontos que já se ligam por fio. Se ele sair, o circuito continua fechado — só perde a função dele."
  },
  "antiparalelo": {
    "nome": "em antiparalelo",
    "diz": "Em paralelo, mas com polaridade invertida em relação à tensão normal: no dia a dia ele não conduz nada, e só entra em ação no pico."
  },
  "passagem": {
    "nome": "por passagem",
    "diz": "O condutor ATRAVESSA o componente sem encostar nele — quem passa de um lado para o outro é o campo magnético, não a corrente. É assim que se mede sem abrir o circuito."
  },
  "derivacao": {
    "nome": "em derivação para o 0 V",
    "diz": "Uma perna encosta no caminho do sinal, a outra desce para o 0 V. O sinal NÃO passa por dentro dele."
  }
};
export const DISCRETOS=[
  {
    "id": "PI1-C1",
    "ref": "C1",
    "peca": "Capacitor cerâmico 100 nF (marcado 104)",
    "tipo": "capacitor",
    "valor": "100 nF",
    "qtd": 1,
    "host": "MEGA",
    "arranjo": "derivacao",
    "polaridade": false,
    "pernas": [
      {
        "nome": "perna 1",
        "vai": {
          "comp": "MEGA",
          "via": "A0"
        }
      },
      {
        "nome": "perna 2",
        "vai": {
          "comp": "MEGA",
          "via": "GND2"
        }
      }
    ],
    "papel": "Filtra o ruído que o cabo do BTS #1 pegou no caminho até o Arduino",
    "porque": "O sinal IS sai limpo do driver e percorre 30 cm dentro de um painel que chaveia corrente. Sem o filtro, a leitura de A0 oscila e o firmware dispara alarme de falha com o sistema funcionando bem.",
    "seFaltar": "A leitura de A0 pula dezenas de contagens e o diagnóstico de corrente vira ruído.",
    "ensaio": "Sistema energizado e em repouso: A0 estável dentro de ±2 contagens de A/D. ⚠ Antes de energizar: o capacitor entre A0 e GND2 (bornes VIZINHOS) sem esticar perna.",
    "passo": "A-03",
    "fonte": "Doc 33 §33.2"
  },
  {
    "id": "PI1-C2",
    "ref": "C2",
    "peca": "Capacitor cerâmico 100 nF (marcado 104)",
    "tipo": "capacitor",
    "valor": "100 nF",
    "qtd": 1,
    "host": "MEGA",
    "arranjo": "derivacao",
    "polaridade": false,
    "pernas": [
      {
        "nome": "perna 1",
        "vai": {
          "comp": "MEGA",
          "via": "A1"
        }
      },
      {
        "nome": "perna 2",
        "vai": {
          "comp": "MEGA",
          "via": "GND2"
        }
      }
    ],
    "papel": "O mesmo do C1, para o BTS #2",
    "porque": "Mesma razão do C1 — o cabo é outro, o problema é igual.",
    "seFaltar": "A leitura de A1 fica instável.",
    "ensaio": "A1 estável dentro de ±2 contagens de A/D com o sistema em repouso.",
    "passo": "A-03",
    "fonte": "Doc 33 §33.2"
  },
  {
    "id": "MAX-R13",
    "ref": "R13",
    "peca": "Resistor 10 kΩ (marrom-preto-laranja)",
    "tipo": "resistor",
    "valor": "10 kΩ",
    "qtd": 1,
    "host": "MAX485",
    "arranjo": "derivacao",
    "polaridade": false,
    "pernas": [
      {
        "nome": "perna 1",
        "vai": {
          "comp": "MAX485",
          "via": "DE/RE"
        }
      },
      {
        "nome": "perna 2",
        "vai": {
          "comp": "MEGA",
          "via": "GND2"
        }
      }
    ],
    "papel": "Mantém o DE/RE do MAX485 em nível BAIXO — escutando — enquanto o Mega não manda nada",
    "porque": "⭐ Entre o reset e a primeira linha do setup, o pino do Arduino é ENTRADA e flutua. Flutuando, o DE pode ficar em 1 e o MAX485 transmite lixo no par — o módulo vê colisão e às vezes trava o barramento até o próximo ciclo de energia. O resistor resolve por 1 centavo.",
    "seFaltar": "O barramento RS-485 fica instável no boot: às vezes responde, às vezes não, e o defeito some quando se mede com o multímetro na mão.",
    "ensaio": "Com o Mega recém-ligado e o firmware ainda não rodando: medir D26 contra GND2 → 0 V, não 2,5 V.",
    "montagem": "Uma perna no borne do DE/RE, a outra no GND2 do adaptador do Mega. Não precisa de placa.",
    "passo": "D-01",
    "fonte": "Doc 13 §13.2"
  },
  {
    "id": "KM1-D1",
    "ref": "D1",
    "peca": "Diodo 1N4007",
    "tipo": "diodo",
    "valor": "1N4007",
    "qtd": 1,
    "host": "KM1",
    "arranjo": "antiparalelo",
    "polaridade": true,
    "comoIdentificar": "⭐ A faixa prateada impressa no corpo marca o CATODO. Ela vai no A1.",
    "seInverter": "🔥 Invertido ele curto-circuita a bobina e derruba o fusível F2 (2 A) assim que o verde for apertado. Não queima nada — mas você vai procurar o defeito no lugar errado.",
    "pernas": [
      {
        "nome": "catodo (faixa prateada)",
        "vai": {
          "comp": "KM1",
          "via": "A1"
        }
      },
      {
        "nome": "anodo",
        "vai": {
          "comp": "KM1",
          "via": "A2"
        }
      }
    ],
    "papel": "Roda-livre da bobina do KM1",
    "porque": "Quando o contato do KA1 abre, o campo da bobina colapsa e induz centenas de volts. Sem o diodo esse pico aparece NO CONTATO DO KA1 e abre arco — contato que pita acaba soldando, e um KA1 soldado é o veto do firmware perdido em silêncio.",
    "seFaltar": "O contato do KA1 se degrada a cada desligamento e um dia solda fechado.",
    "ensaio": "Multímetro em TESTE DE DIODO entre A1 e A2 → conduz num sentido só (~0,55 V com a ponta vermelha no A2, nada no sentido inverso).",
    "antesDeMontar": "🔎 Faça o teste de diodo no KM1 ANTES: se ele já conduzir num sentido só, o relé tem diodo interno e o D1 é dispensável. Se conduzir nos dois, monte o D1.",
    "passo": "A-03",
    "fonte": "Doc 31 §31.9"
  },
  {
    "id": "KA1-R10",
    "ref": "R10",
    "peca": "Resistor 10 kΩ · ¼ W",
    "tipo": "resistor",
    "valor": "10 kΩ",
    "qtd": 1,
    "host": "KA123",
    "arranjo": "paralelo",
    "polaridade": false,
    "pernas": [
      {
        "nome": "perna 1",
        "vai": {
          "comp": "KA123",
          "via": "IN1"
        }
      },
      {
        "nome": "perna 2",
        "vai": {
          "comp": "KA123",
          "via": "0V"
        }
      }
    ],
    "papel": "Pull-down do gatilho do KA1 — define o estado com o Arduino ausente",
    "porque": "Fio do D27 rompido ou Arduino desligado → o resistor leva o IN a 0 V → relé aberto → a potência nunca é armada. Ele torna MEDÍVEL o que antes era confiado.",
    "seFaltar": "⚠️ O IN fica alto-impedante e o módulo pode fechar por ruído — potência autorizada sem ninguém mandar.",
    "ensaio": "Ohmímetro entre o IN1 e o 0 V → ~10 kΩ. Com o painel energizado e o Arduino desligado, o IN1 deve medir ~0 V.",
    "passo": "A-03",
    "fonte": "Doc 31 §31.13"
  },
  {
    "id": "KA2-R11",
    "ref": "R11",
    "peca": "Resistor 10 kΩ · ¼ W",
    "tipo": "resistor",
    "valor": "10 kΩ",
    "qtd": 1,
    "host": "KA123",
    "arranjo": "paralelo",
    "polaridade": false,
    "pernas": [
      {
        "nome": "perna 1",
        "vai": {
          "comp": "KA123",
          "via": "IN2"
        }
      },
      {
        "nome": "perna 2",
        "vai": {
          "comp": "KA123",
          "via": "0V"
        }
      }
    ],
    "papel": "Pull-down do gatilho do KA2 — e aqui o resultado é o oposto, de propósito",
    "porque": "⭐ O KA2 usa o contato NC: relé solto significa ventoinha do radiador GIRANDO. É o R11 que garante que um Arduino morto ventile.",
    "seFaltar": "A ventoinha do lado quente pode parar sozinha por ruído — e o lado quente sem ventilação leva a Peltier à fuga térmica.",
    "ensaio": "Ohmímetro entre o IN2 e o 0 V → ~10 kΩ. Puxar o fio do D30 com o ensaio rodando: as ventoinhas CONTINUAM girando.",
    "passo": "A-03",
    "fonte": "Doc 31 §31.14"
  },
  {
    "id": "KA3-R12",
    "ref": "R12",
    "peca": "Resistor 10 kΩ · ¼ W",
    "tipo": "resistor",
    "valor": "10 kΩ",
    "qtd": 1,
    "host": "KA123",
    "arranjo": "paralelo",
    "polaridade": false,
    "pernas": [
      {
        "nome": "perna 1",
        "vai": {
          "comp": "KA123",
          "via": "IN3"
        }
      },
      {
        "nome": "perna 2",
        "vai": {
          "comp": "KA123",
          "via": "0V"
        }
      }
    ],
    "papel": "Pull-down do gatilho do KA3 — as 5 ventoinhas internas",
    "porque": "Mesma regra do R10: pino solto ou Arduino ausente → IN em 0 V → contato aberto → ventoinhas paradas. Sem Arduino, o KA1 deve cortar a potência. A proteção térmica do PTC ainda não foi aprovada: se o KA1 soldar fechado, não considerar ST-1 como corte efetivo até identificar a peça, comprovar rating CC e validar o rearme manual.",
    "seFaltar": "O IN fica alto-impedante e as ventoinhas internas podem partir sozinhas por ruído, com o painel parado.",
    "ensaio": "Ohmímetro entre o IN3 e o 0 V → ~10 kΩ. Com o Arduino desligado, as 5 internas ficam paradas e o LED do KA3 apagado.",
    "passo": "A-03",
    "fonte": "Doc 31 §31.16"
  },
  {
    "id": "BTS1-R8",
    "ref": "R8",
    "peca": "Resistor 10 kΩ · ¼ W",
    "tipo": "resistor",
    "valor": "10 kΩ",
    "qtd": 1,
    "host": "BTS1",
    "arranjo": "paralelo",
    "polaridade": false,
    "pernas": [
      {
        "nome": "perna 1",
        "vai": {
          "comp": "BTS1",
          "via": "R_EN"
        }
      },
      {
        "nome": "perna 2",
        "vai": {
          "comp": "BTS1",
          "via": "GND"
        }
      }
    ],
    "papel": "Pull-down do R_EN — define o estado seguro do driver de potência",
    "porque": "⭐ Fica NO TERMINAL DO DRIVER, e não na PI-1, porque assim ele cobre também o rompimento do cabo: com o Arduino desligado OU com o fio partido, o R_EN vai a 0 V e o driver não pode acordar sozinho. Um pull-down na placa protegeria só o primeiro caso.",
    "seFaltar": "🔥 R_EN solto: o driver pode habilitar por ruído e acionar a Peltier sem comando.",
    "ensaio": "Ohmímetro entre R_EN e GND → ~10 kΩ. Com o painel energizado e o Arduino desligado, R_EN medindo ~0 V.",
    "montagem": "Soldar pelo lado de BAIXO do módulo, ligando o pad do R_EN ao pad do GND, pernas curtas e rentes, e cobrir com termorretrátil de Ø 2 mm. Alternativa sem solda: montar o resistor dentro de um alojamento Dupont de 2 vias e encaixar no barra de pinos, com um ponto de cola quente.",
    "passo": "A-03",
    "fonte": "Doc 33 §33.6",
    "aviso": "📷 Fotografe antes de fechar: resistor invisível embaixo de um módulo é armadilha para quem for dar manutenção."
  },
  {
    "id": "BTS2-R9",
    "ref": "R9",
    "peca": "Resistor 10 kΩ · ¼ W",
    "tipo": "resistor",
    "valor": "10 kΩ",
    "qtd": 1,
    "host": "BTS2",
    "arranjo": "paralelo",
    "polaridade": false,
    "pernas": [
      {
        "nome": "perna 1",
        "vai": {
          "comp": "BTS2",
          "via": "R_EN"
        }
      },
      {
        "nome": "perna 2",
        "vai": {
          "comp": "BTS2",
          "via": "GND"
        }
      }
    ],
    "papel": "O mesmo do R8, no driver do PTC",
    "porque": "Mesma razão do R8. O R_EN do módulo está ligado ao L_EN, então um resistor cobre os dois.",
    "seFaltar": "🔥 O driver do aquecedor pode habilitar sozinho.",
    "ensaio": "Ohmímetro entre R_EN e GND → ~10 kΩ.",
    "montagem": "Idem ao R8.",
    "passo": "A-03",
    "fonte": "Doc 33 §33.6"
  },
  {
  "id": "MAX485-MODULO",
  "ref": "MAX485",
  "peca": "Módulo transceptor RS-485 com MAX485",
  "tipo": "modulo",
  "valor": "5 V · até 2,5 Mbps",
  "qtd": 1,
  "host": "MAX485",
  "arranjo": "serie",
  "polaridade": true,
  "comoIdentificar": "⭐ Os bornes estão serigrafados na placa: VCC, GND, RO, DI, DE, RE de um lado; A e B do outro. Em alguns módulos o DE e o RE já vêm unidos por uma trilha e saem num pino só — é o caso deste projeto.",
  "seInverter": "Trocar VCC com GND queima o chip na hora. Inverter A com B não queima nada: o barramento simplesmente fica mudo, e o sintoma é timeout em todos os canais.",
  "pernas": [
    {
      "nome": "VCC",
      "vai": {
        "comp": "MAX485",
        "via": "VCC"
      }
    },
    {
      "nome": "GND",
      "vai": {
        "comp": "MAX485",
        "via": "GND"
      }
    },
    {
      "nome": "RO",
      "vai": {
        "comp": "MAX485",
        "via": "RO"
      }
    },
    {
      "nome": "DI",
      "vai": {
        "comp": "MAX485",
        "via": "DI"
      }
    },
    {
      "nome": "DE/RE",
      "vai": {
        "comp": "MAX485",
        "via": "DE/RE"
      }
    },
    {
      "nome": "A",
      "vai": {
        "comp": "MAX485",
        "via": "A"
      }
    },
    {
      "nome": "B",
      "vai": {
        "comp": "MAX485",
        "via": "B"
      }
    }
  ],
  "papel": "Traduz o Serial3 do Mega (TTL, 5 V) para o par diferencial que vai ao módulo de medição",
  "porque": "⭐ O Mega não tem RS-485 dentro. E RS-485 não é luxo: são 24 canais a 9600 bps descendo por um par trançado, dentro de um painel onde dois BTS chaveiam 6 A em PWM de 20 kHz. Um fio TTL atravessando esse ambiente perderia leitura toda vez que a Peltier ligasse.",
  "seFaltar": "Sem ele não há medição nenhuma: o painel fica cego para as 8 posições de ensaio.",
  "ensaio": "Com o Mega enviando uma leitura, medir A contra B → deve haver diferença de ~1 a 2 V entre os dois (o par está trabalhando). Iguais, o driver não está transmitindo.",
  "passo": "D-01",
  "fonte": "Doc 13 §13.2"
},
    {
    "id": "N4AIC24-MODULO",
    "ref": "N4AIC24",
    "peca": "Módulo de aquisição 22 correntes + 2 tensões, Modbus RTU",
    "tipo": "modulo",
    "valor": "0–20 mA / 0–30 V · 0,01 de resolução",
    "qtd": 1,
    "host": "N4AIC24",
    "arranjo": "serie",
    "polaridade": true,
    "comoIdentificar": "⭐ Alimentação 9–30 V em V+ e GND, com polaridade marcada. Os canais de corrente são os bornes I1 a I22, e o retorno comum é o COM. Os dois canais de tensão são V1 e V2, e o RS-485 sai em A e B.",
    "seInverter": "Inverter V+ com GND queima o módulo. Inverter A com B não queima: o barramento fica mudo até alguém trocar os dois fios.",
    "pernas": [
      {
        "nome": "V+",
        "vai": {
          "comp": "N4AIC24",
          "via": "V+"
        }
      },
      {
        "nome": "GND",
        "vai": {
          "comp": "N4AIC24",
          "via": "GND"
        }
      },
      {
        "nome": "V1",
        "vai": {
          "comp": "N4AIC24",
          "via": "V1"
        }
      },
      {
        "nome": "V2",
        "vai": {
          "comp": "N4AIC24",
          "via": "V2"
        }
      },
      {
        "nome": "A",
        "vai": {
          "comp": "N4AIC24",
          "via": "A"
        }
      },
      {
        "nome": "B",
        "vai": {
          "comp": "N4AIC24",
          "via": "B"
        }
      },
      {
        "nome": "I1",
        "vai": {
          "comp": "N4AIC24",
          "via": "I1"
        }
      },
      {
        "nome": "I2",
        "vai": {
          "comp": "N4AIC24",
          "via": "I2"
        }
      }
    ],
    "papel": "É o instrumento do painel: mede as 8 correntes das posições de ensaio (de 22 canais disponíveis) e as duas tensões do sistema",
    "porque": "⭐ Aposentou três peças de uma vez. O divisor do SV-1 media 24 V com uma casa e entregava um bit; o ACS712 não enxergava os 10 mA de um LED (185 mV/A × 0,010 A = 1,85 mV, contra 4,88 mV por passo do ADC). Este módulo mede 0,01 mA e 0,01 V, e ainda devolve tudo por um par de fios — com 14 canais de corrente sobrando para o futuro.",
    "seFaltar": "O painel volta a ser cego: nenhuma posição é supervisionada e a queda dos 24 V não é percebida.",
    "ensaio": "Com as duas posições desenhadas acesas, ler os registradores 0x0000 em diante: I1 e I2 devem dar 9 a 11 mA, V1 ≈ 24,0 V e V2 ≈ 12,0 V.",
    "passo": "D-02",
    "fonte": "Doc 13 §13.2"
  },
  {
    "id": "VENT-D2",
    "ref": "D2",
    "peca": "Diodo 1N4007",
    "tipo": "diodo",
    "valor": "1N4007",
    "qtd": 1,
    "host": "VENT-RAD",
    "arranjo": "antiparalelo",
    "polaridade": true,
    "comoIdentificar": "⭐ Faixa prateada = catodo, e ela vai no +12 V.",
    "seInverter": "🔥 Invertido, ele curto-circuita a alimentação de 12 V das ventoinhas.",
    "pernas": [
      {
        "nome": "catodo (faixa prateada)",
        "vai": {
          "comp": "VENT-RAD",
          "via": "+12V"
        }
      },
      {
        "nome": "anodo",
        "vai": {
          "comp": "VENT-RAD",
          "via": "0V"
        }
      }
    ],
    "papel": "Roda-livre do motor das ventoinhas do lado quente",
    "porque": "Ventoinha é carga indutiva e nada mais a grampeia. Sem ele o pico aparece no contato do KA2 toda vez que a pós-ventilação termina.",
    "seFaltar": "O contato do KA2 se degrada a cada parada da ventoinha.",
    "ensaio": "Teste de diodo entre os terminais da ventoinha, com ela desconectada → conduz num sentido só.",
    "montagem": "⚠️ NÃO fica no painel: vai junto das ventoinhas, onde o pico nasce.",
    "passo": "A-03",
    "fonte": "Doc 31 §31.14",
    "aviso": "⚠️ Não confunda com o D1: mesmo componente, funções e lugares diferentes."
  },
  {
    "id": "VENT-D3",
    "ref": "D3",
    "peca": "Diodo 1N4007",
    "tipo": "diodo",
    "valor": "1N4007",
    "qtd": 1,
    "host": "VENT-INT",
    "arranjo": "antiparalelo",
    "polaridade": true,
    "comoIdentificar": "⭐ Faixa prateada = catodo, e ela vai no +12 V.",
    "seInverter": "🔥 Invertido, ele curto-circuita a alimentação de 12 V das ventoinhas.",
    "pernas": [
      {
        "nome": "catodo (faixa prateada)",
        "vai": {
          "comp": "VENT-INT",
          "via": "+12V"
        }
      },
      {
        "nome": "anodo",
        "vai": {
          "comp": "VENT-INT",
          "via": "0V"
        }
      }
    ],
    "papel": "Roda-livre dos 5 motores das ventoinhas internas",
    "porque": "⭐ ELE APARECEU QUANDO O MOSFET SAIU. O MV-1 trazia a proteção dentro da placa comprada; o KA3 é um contato seco e não protege nada sozinho. São cinco motores em paralelo desligando ao mesmo tempo no fim de cada ensaio — o pico soma.",
    "seFaltar": "O contato do KA3 abre arco a cada fim de ensaio e vai se degradando. É o modo de falha clássico de relé em carga indutiva CC, onde não há passagem por zero.",
    "ensaio": "Teste de diodo entre os dois fios do chicote das internas, desconectado do painel → conduz num sentido só.",
    "montagem": "⚠️ NÃO fica no painel: vai dentro da câmara, na emenda onde os cinco positivos e os cinco negativos se juntam. Um diodo só serve as cinco — elas estão em paralelo.",
    "passo": "A-03",
    "fonte": "Doc 31 §31.16",
    "aviso": "⚠️ D1, D2 e D3 são o MESMO componente (1N4007) em três lugares diferentes: bobina do KM1, ventoinhas do radiador e ventoinhas internas."
  },
{
    "id": "PL-1-L",
    "ref": "L-PL1",
    "peca": "Placa PL-1 — 4 canais de LED 12 V com resistor de 1 kΩ em série",
    "tipo": "modulo",
    "valor": "12 V / 7 a 9 mA por canal",
    "qtd": 1,
    "host": "PL-1",
    "arranjo": "serie",
    "polaridade": false,
    "pernas": [
      {
        "nome": "+1",
        "vai": {
          "comp": "PL-1",
          "via": "+1"
        }
      },
      {
        "nome": "+2",
        "vai": {
          "comp": "PL-1",
          "via": "+2"
        }
      },
      {
        "nome": "+3",
        "vai": {
          "comp": "PL-1",
          "via": "+3"
        }
      },
      {
        "nome": "+4",
        "vai": {
          "comp": "PL-1",
          "via": "+4"
        }
      },
      {
        "nome": "r1",
        "vai": {
          "comp": "PL-1",
          "via": "r1"
        }
      },
      {
        "nome": "r2",
        "vai": {
          "comp": "PL-1",
          "via": "r2"
        }
      },
      {
        "nome": "r3",
        "vai": {
          "comp": "PL-1",
          "via": "r3"
        }
      },
      {
        "nome": "r4",
        "vai": {
          "comp": "PL-1",
          "via": "r4"
        }
      }
    ],
    "papel": "Quatro cargas reais de 12 V na mesma PCB — 7 a 9 mA cada, o bastante para o módulo de medição ler com folga e para aquecer levemente a câmara",
    "porque": "⭐ A TROCA DE SENSOR É O QUE PERMITE O LED. Com o ACS712 (185 mV/A), 7 mA davam 1,3 mV — um quarto de passo do ADC, invisível. O N4AIC24 lê 0,01 mA: os mesmos 7 mA aparecem como 700 contagens. A carga ficou 25 vezes menor e a leitura ficou 100 vezes melhor.",
    "seFaltar": "O sistema lê corrente zero nos 4 canais da placa e dispara alarme de posição morta — que é exatamente o que se quer demonstrar.",
    "ensaio": "Abrir a chave da posição 1 na placa F-P → o canal I1 cai a 0,00 mA e o alarme daquela posição dispara, sem mexer nos outros três canais desta placa.",
    "passo": "A-03",
    "fonte": "Estudo de Cargas Simuladoras"
  },
  {
    "id": "PL-2-L",
    "ref": "L-PL2",
    "peca": "Placa PL-2 — 4 canais de LED 12 V com resistor de 1 kΩ em série",
    "tipo": "modulo",
    "valor": "12 V / 7 a 9 mA por canal",
    "qtd": 1,
    "host": "PL-2",
    "arranjo": "serie",
    "polaridade": false,
    "pernas": [
      {
        "nome": "+1",
        "vai": {
          "comp": "PL-2",
          "via": "+1"
        }
      },
      {
        "nome": "+2",
        "vai": {
          "comp": "PL-2",
          "via": "+2"
        }
      },
      {
        "nome": "+3",
        "vai": {
          "comp": "PL-2",
          "via": "+3"
        }
      },
      {
        "nome": "+4",
        "vai": {
          "comp": "PL-2",
          "via": "+4"
        }
      },
      {
        "nome": "r1",
        "vai": {
          "comp": "PL-2",
          "via": "r1"
        }
      },
      {
        "nome": "r2",
        "vai": {
          "comp": "PL-2",
          "via": "r2"
        }
      },
      {
        "nome": "r3",
        "vai": {
          "comp": "PL-2",
          "via": "r3"
        }
      },
      {
        "nome": "r4",
        "vai": {
          "comp": "PL-2",
          "via": "r4"
        }
      }
    ],
    "papel": "Quatro cargas reais de 12 V na mesma PCB — 7 a 9 mA cada, o bastante para o módulo de medição ler com folga e para aquecer levemente a câmara",
    "porque": "⭐ A TROCA DE SENSOR É O QUE PERMITE O LED. Com o ACS712 (185 mV/A), 7 mA davam 1,3 mV — um quarto de passo do ADC, invisível. O N4AIC24 lê 0,01 mA: os mesmos 7 mA aparecem como 700 contagens. A carga ficou 25 vezes menor e a leitura ficou 100 vezes melhor.",
    "seFaltar": "O sistema lê corrente zero nos 4 canais da placa e dispara alarme de posição morta — que é exatamente o que se quer demonstrar.",
    "ensaio": "Abrir a chave da posição 5 na placa F-P → o canal I5 cai a 0,00 mA e o alarme daquela posição dispara, sem mexer nos outros três canais desta placa.",
    "passo": "A-03",
    "fonte": "Estudo de Cargas Simuladoras"
  }
];
export const FATOS_VIGIADOS=[];
export const TOTAL_PECAS=DISCRETOS.reduce((s,d)=>s+(d.qtd??1),0);
export const porHost=id=>DISCRETOS.filter(d=>d.host===id);
export const porPasso=passo=>DISCRETOS.filter(d=>d.passo===passo);
export const host=id=>HOSTS.find(h=>h.id===id);
