/** Painel autônomo. Modelo de montagem; medidas e proteções requerem validação das peças reais. */
export const CAIXA={
  "largura": 700,
  "altura": 700,
  "profundidade": 250
};
export const CALHAS=[
  {
    "id": "CL-pot",
    "tipo": "potencia",
    "y": 660,
    "h": 24,
    "entraEm": 37,
    "nome": "calha de POTÊNCIA",
    "daPlaca": "CH-base",
    "naPorta": "CP-vpot",
    "diz": "Rente à CH-base, no canto de baixo. Leva a cadeia de comando de 24 V. Vai um pouco mais longe porque a vertical de potência é a de dentro."
  },
  {
    "id": "CL-sin",
    "tipo": "sinal",
    "y": 565,
    "h": 24,
    "entraEm": 13,
    "nome": "calha de SINAL E MEDIÇÃO",
    "daPlaca": "CV-dir",
    "naPorta": "CP-vsin",
    "diz": "Alinhada com a CH-2x1, e mais curta: morre na primeira vertical que encontra, a de sinal, na borda da dobradiça. Leva a tela, os botões de 5 V e a seletora."
  }
];
export const CANALETAS=[
  {
    "id": "CH-topo",
    "tipo": "sinal",
    "x": 14,
    "y": 22,
    "w": 672,
    "h": 30,
    "nome": "superior"
  },
  {
    "id": "CH-3x2",
    "tipo": "sinal",
    "x": 14,
    "y": 180,
    "w": 672,
    "h": 28,
    "nome": "entre os trilhos 3 e 2"
  },
  {
    "id": "CH-2x1",
    "tipo": "potencia",
    "x": 14,
    "y": 302,
    "w": 672,
    "h": 30,
    "nome": "entre os trilhos 2 e 1"
  },
  {
    "id": "CH-base",
    "tipo": "potencia",
    "x": 14,
    "y": 660,
    "w": 672,
    "h": 32,
    "nome": "inferior — entradas"
  },
  {
    "id": "CV-esq",
    "tipo": "potencia",
    "x": 14,
    "y": 22,
    "w": 26,
    "h": 668,
    "nome": "vertical esquerda",
    "vertical": true
  },
  {
    "id": "CV-dir",
    "tipo": "sinal",
    "x": 660,
    "y": 22,
    "w": 26,
    "h": 668,
    "nome": "vertical direita",
    "vertical": true
  },
  {
    "id": "CH-1x4",
    "tipo": "potencia",
    "x": 14,
    "y": 490,
    "w": 672,
    "h": 28,
    "nome": "distribuição e alimentação DC"
  },
  {
    "id": "CH-ac",
    "tipo": "potencia",
    "x": 0,
    "y": 510,
    "w": 338,
    "h": 12,
    "nome": "AC — corredor exclusivo, protegido"
  },
  {
    "id": "CV-ac",
    "tipo": "potencia",
    "x": 0,
    "y": 510,
    "w": 10,
    "h": 180,
    "vertical": true,
    "nome": "AC — entrada exclusiva"
  }
];
export const CANALETAS_PORTA=[
  {
    "id": "CP-topo",
    "tipo": "sinal",
    "x": 2,
    "y": 10,
    "w": 240,
    "h": 24,
    "nome": "superior"
  },
  {
    "id": "CP-1x2",
    "tipo": "sinal",
    "x": 2,
    "y": 136,
    "w": 240,
    "h": 26,
    "nome": "entre a tela e os sinaleiros"
  },
  {
    "id": "CP-2x3",
    "tipo": "sinal",
    "x": 2,
    "y": 214,
    "w": 240,
    "h": 26,
    "nome": "entre os sinaleiros e os comandos"
  },
  {
    "id": "CP-3x4",
    "tipo": "potencia",
    "x": 2,
    "y": 292,
    "w": 240,
    "h": 26,
    "nome": "entre os comandos e a emergência"
  },
  {
    "id": "CP-base",
    "tipo": "sinal",
    "x": 2,
    "y": 384,
    "w": 240,
    "h": 26,
    "nome": "inferior — o bloco de 5 V do cogumelo"
  },
  {
    "id": "CP-vsin",
    "tipo": "sinal",
    "x": 2,
    "y": 10,
    "w": 22,
    "h": 600,
    "nome": "vertical da DOBRADIÇA — sinal",
    "vertical": true,
    "dobradica": true
  },
  {
    "id": "CP-vpot",
    "tipo": "potencia",
    "x": 26,
    "y": 10,
    "w": 22,
    "h": 680,
    "nome": "vertical da DOBRADIÇA — potência",
    "vertical": true,
    "dobradica": true
  }
];
export const COMPONENTES=[
  {
    "id": "MEGA",
    "nome": "ARDUINO MEGA",
    "trilho": 3,
    "resumoFuncao": "Controla PID, intertravamentos e sensores. Serial1 D18/D19: ESP32; Serial2 D16/D17: IHM; Serial3 D14/D15 com D26 no DE/RE: MAX485 do módulo de medição. A0/A1: R_IS dos BTS. A2/A3 ficaram LIVRES quando o ACS712 saiu. USB D0/D1 livre para programação.",
    "x": 48,
    "largura": 134,
    "altura": 96,
    "cor": "#0ca678",
    "nota": "O Mega encaixa no meio da placa adaptadora e cada pino dele vira um borne de parafuso nas bordas. São 82 bornes em FILEIRA ÚNICA por borda, um ao lado do outro — é o que obriga a placa a ser comprida.",
    "aConferir": "Dimensões estimadas em 134 × 96 mm a partir dos 35 bornes da borda de cima. Meça a placa quando ela chegar.",
    "grupos": [
      {
        "ref": "TOPO",
        "lado": "cima",
        "legenda": "Borda de cima — 35 bornes",
        "pinos": [
          {
            "nome": "D30",
            "usa": true,
            "para": "KA123 · IN2"
          },
          {
            "nome": "D29",
            "usa": true,
            "para": "KA123 · IN3"
          },
          {
            "nome": "D28"
          },
          {
            "nome": "D27",
            "usa": true,
            "para": "KA123 · IN1"
          },
          {
            "nome": "D26",
            "usa": true,
            "para": "MAX485 · DE/RE"
          },
          {
            "nome": "D25"
          },
          {
            "nome": "D24",
            "usa": true,
            "para": "S0 · 22"
          },
          {
            "nome": "D23",
            "usa": true,
            "para": "S2 · 14"
          },
          {
            "nome": "D22"
          },
          {
            "nome": "+5V",
            "usa": true,
            "para": "BD-5V · O1"
          },
          {
            "nome": "D21",
            "usa": true,
            "para": "RTC · SCL"
          },
          {
            "nome": "D20",
            "usa": true,
            "para": "RTC · SDA"
          },
          {
            "nome": "D19",
            "usa": true,
            "para": "ESP32 · TX0"
          },
          {
            "nome": "D18",
            "usa": true,
            "para": "ESP32 · RX0"
          },
          {
            "nome": "D17",
            "usa": true,
            "para": "CONV · RXO"
          },
          {
            "nome": "D16",
            "usa": true,
            "para": "CONV · TXI"
          },
          {
            "nome": "D15",
            "usa": true,
            "para": "MAX485 · RO"
          },
          {
            "nome": "D14",
            "usa": true,
            "para": "MAX485 · DI"
          },
          {
            "nome": "D0"
          },
          {
            "nome": "D1"
          },
          {
            "nome": "D2",
            "usa": true,
            "para": "AD-1 · S"
          },
          {
            "nome": "D3",
            "usa": true,
            "para": "RAD · RPM1"
          },
          {
            "nome": "D4",
            "usa": true,
            "para": "BTS1 · R_EN"
          },
          {
            "nome": "D5",
            "usa": true,
            "para": "BTS1 · R_PWM"
          },
          {
            "nome": "D6",
            "usa": true,
            "para": "BTS2 · R_PWM"
          },
          {
            "nome": "D7",
            "usa": true,
            "para": "BTS2 · R_EN"
          },
          {
            "nome": "D8"
          },
          {
            "nome": "D9",
            "usa": true,
            "para": "H1 · +"
          },
          {
            "nome": "D10",
            "usa": true,
            "para": "H2 · +"
          },
          {
            "nome": "D11",
            "usa": true,
            "para": "H3 · +"
          },
          {
            "nome": "D12",
            "usa": true,
            "para": "H4 · +"
          },
          {
            "nome": "D13"
          },
          {
            "nome": "GND1"
          },
          {
            "nome": "D21/SCL"
          },
          {
            "nome": "D20/SDA"
          }
        ]
      },
      {
        "ref": "ESQ",
        "lado": "esquerda",
        "legenda": "Borda esquerda — 13 bornes (D31–D43)",
        "pinos": [
          {
            "nome": "D31"
          },
          {
            "nome": "D32"
          },
          {
            "nome": "D33"
          },
          {
            "nome": "D34"
          },
          {
            "nome": "D35"
          },
          {
            "nome": "D36"
          },
          {
            "nome": "D37"
          },
          {
            "nome": "D38"
          },
          {
            "nome": "D39"
          },
          {
            "nome": "D40"
          },
          {
            "nome": "D41"
          },
          {
            "nome": "D42"
          },
          {
            "nome": "D43"
          }
        ]
      },
      {
        "ref": "BASE",
        "lado": "baixo",
        "legenda": "Borda de baixo — 34 bornes",
        "pinos": [
          {
            "nome": "D44"
          },
          {
            "nome": "D45"
          },
          {
            "nome": "D46"
          },
          {
            "nome": "D47"
          },
          {
            "nome": "D48"
          },
          {
            "nome": "D49"
          },
          {
            "nome": "D50"
          },
          {
            "nome": "D51"
          },
          {
            "nome": "D52"
          },
          {
            "nome": "D53"
          },
          {
            "nome": "A15"
          },
          {
            "nome": "A14"
          },
          {
            "nome": "A13"
          },
          {
            "nome": "A12"
          },
          {
            "nome": "A11"
          },
          {
            "nome": "A10"
          },
          {
            "nome": "A9"
          },
          {
            "nome": "A8",
            "usa": true,
            "para": "RAD · RPM2"
          },
          {
            "nome": "A7"
          },
          {
            "nome": "A6"
          },
          {
            "nome": "A5"
          },
          {
            "nome": "A4"
          },
          {
            "nome": "A3"
          },
          {
            "nome": "A2"
          },
          {
            "nome": "A1",
            "usa": true,
            "para": "BTS2 · R_IS"
          },
          {
            "nome": "A0",
            "usa": true,
            "para": "BTS1 · R_IS"
          },
          {
            "nome": "GND2",
            "usa": true,
            "para": "H4 · −"
          },
          {
            "nome": "IOREF"
          },
          {
            "nome": "AREF"
          },
          {
            "nome": "RESET"
          },
          {
            "nome": "+3V3"
          },
          {
            "nome": "GND3",
            "usa": true,
            "para": "BD-0V · Z5"
          },
          {
            "nome": "+5V"
          },
          {
            "nome": "VIN"
          }
        ]
      }
    ],
    "avisos": [
      "✅ Pinagem conferida na foto do adaptador: 35 bornes em cima, 13 à esquerda e 34 embaixo. O D21/SCL e o D20/SDA aparecem DUAS vezes na borda de cima — é o mesmo pino, espelhado, como no Mega original. Use um dos dois, não os dois.",
      "⚠️ Há 3 bornes GND — GND1 no topo, GND2 junto do A0 e GND3 no bloco POWER — e 2 de +5V. Use o GND3, que fica ao lado do +5V: ida e volta no mesmo bloco. O projeto usa 1 de cada. Os outros servem para sensores, sem precisar de régua extra.",
      "📌 D50–D53 ficaram LIVRES quando o cartão SD mudou para a tela ES3C28P.",
      "Modbus no Mega: TX3 D14 → DI; RX3 D15 ← RO; D26 → DE e /RE. Firmware deve usar Serial3 e respeitar timeout sem bloquear as proteções.",
      "📌 A2 e A3 FICARAM LIVRES: eram as entradas do ACS712. Hoje as correntes E as tensões chegam por RS-485 — o N4AIC24 tem 22 canais de corrente e 2 de tensão — então o Mega não gasta entrada analógica com medição nenhuma. Sobram A2, A3, A4, A5, A6, A7, A9 a A15: 15 entradas de reserva."
    ]
  },
  {
    "id": "MAX485",
    "nome": "MAX485 — transceptor RS-485 do módulo de medição",
    "trilho": 3,
    "resumoFuncao": "🔎 O QUE ELE FAZ: é o tradutor entre o Serial3 do Mega (TTL, 5 V) e a linha diferencial que vai ao N4AIC24. O Mega não tem RS-485 dentro — o MAX485 é o chip que tem. RO leva ao RX, DI vem do TX, e DE/RE (amarrados num pino só) decidem se ele fala ou escuta. Um par trançado atende os 24 canais.",
    "x": 192,
    "largura": 32,
    "altura": 40,
    "cor": "#1971c2",
    "nota": "⭐ Módulo pronto com borne de parafuso, não o CI solto. DE e /RE já vêm amarrados: com o pino em 1 o módulo transmite, em 0 ele escuta. O firmware tem que SOLTAR o pino depois de perguntar — se ficar em 1, o módulo nunca responde. É o clássico \"fala mas não escuta\", e o sintoma é timeout em todos os canais.",
    "grupos": [
      {
        "ref": "TTL",
        "lado": "cima",
        "legenda": "Lado TTL — vai para o Mega (3)",
        "pinos": [
          {
            "nome": "RO",
            "usa": true,
            "para": "MEGA · D15"
          },
          {
            "nome": "DI",
            "usa": true,
            "para": "MEGA · D14"
          },
          {
            "nome": "DE/RE",
            "usa": true,
            "para": "MEGA · D26"
          }
        ]
      },
      {
        "ref": "ALIM",
        "lado": "baixo",
        "legenda": "Alimentação 5 V (2)",
        "pinos": [
          {
            "nome": "VCC",
            "usa": true,
            "para": "BD-5V · O8"
          },
          {
            "nome": "GND",
            "usa": true,
            "para": "BD-0V-B · Z17"
          }
        ]
      },
      {
        "ref": "LINHA",
        "lado": "baixo",
        "legenda": "Par diferencial para o módulo (2)",
        "pinos": [
          {
            "nome": "A",
            "usa": true,
            "para": "N4AIC24 · A"
          },
          {
            "nome": "B",
            "usa": true,
            "para": "N4AIC24 · B"
          }
        ]
      }
    ],
    "avisos": [
      "⚠️ A e B são um PAR TRANÇADO. Em dois fios paralelos o RS-485 ainda funciona na bancada e falha no dia da apresentação: ruído de modo comum não aparece em teste curto.",
      "⚠️ O MAX485 é de 5 V e NÃO é isolado. Aqui os dois lados compartilham o mesmo 0 V, então não há problema — mas se um dia o módulo for para outra fonte, o A/B precisa de isolador.",
      "📌 Terminação de 120 Ω entre A e B só se a linha passar de ~10 m. Dentro deste painel são menos de 40 cm: o resistor atrapalha mais do que ajuda.",
      "📌 O pino do DE/RE precisa de pull-down de 10 kΩ para o 0 V. Sem ele, entre o boot e a primeira linha de firmware o pino flutua e o módulo pode ver lixo no barramento."
    ]
  },
  {
    "id": "N4AIC24",
    "nome": "N4AIC24 — 22 correntes + 2 tensões (Modbus RTU)",
    "trilho": 3,
    "resumoFuncao": "🔎 O QUE ELE FAZ: é o INSTRUMENTO do painel. Mede 22 correntes de 0 a 20 mA — uma por posição de ensaio — e mais 2 tensões de 0 a 30 V, com resolução de 0,01 mA e 0,01 V, e entrega os 24 valores por RS-485 num par trançado. Hoje só 8 canais de corrente estão em uso (as 8 posições da placa de LED) e os 2 canais de tensão leem o 24 V comutado e o 12 V das posições. Aposentou o divisor do SV-1 e os dois ACS712: um módulo, uma resposta, e o Mega não gasta nenhuma entrada analógica.",
    "x": 300,
    "largura": 101,
    "altura": 82,
    "profundidade": 40,
    "cor": "#ae3ec9",
    "nota": "⭐ A CORRENTE ENTRA PELO RETORNO, não pelo positivo: o cátodo do LED chega no borne I_n, atravessa o shunt interno e sai pelo GND, que vai ao 0 V. Assim os 22 canais compartilham uma referência só, e o módulo mede 10 mA com a mesma calma com que mediria 20 mA. O positivo de cada posição continua sendo chaveado pelo bloco de fusíveis, do lado de cima.",
    "grupos": [
      {
        "ref": "I1-I11",
        "lado": "cima",
        "legenda": "Canais de corrente 1 a 11 — retorno das posições (11)",
        "pinos": [
          {
            "nome": "I1",
            "usa": true,
            "para": "PL-1 · r1"
          },
          {
            "nome": "I2",
            "usa": true,
            "para": "PL-1 · r2"
          },
          {
            "nome": "I3",
            "usa": true,
            "para": "PL-1 · r3"
          },
          {
            "nome": "I4",
            "usa": true,
            "para": "PL-1 · r4"
          },
          {
            "nome": "I5",
            "usa": true,
            "para": "PL-2 · r1"
          },
          {
            "nome": "I6",
            "usa": true,
            "para": "PL-2 · r2"
          },
          {
            "nome": "I7",
            "usa": true,
            "para": "PL-2 · r3"
          },
          {
            "nome": "I8",
            "usa": true,
            "para": "PL-2 · r4"
          },
          {
            "nome": "I9"
          },
          {
            "nome": "I10"
          },
          {
            "nome": "I11"
          }
        ]
      },
      {
        "ref": "I12-I22",
        "lado": "baixo",
        "legenda": "Canais de corrente 12 a 22 (11)",
        "pinos": [
          {
            "nome": "I12"
          },
          {
            "nome": "I13"
          },
          {
            "nome": "I14"
          },
          {
            "nome": "I15"
          },
          {
            "nome": "I16"
          },
          {
            "nome": "I17"
          },
          {
            "nome": "I18"
          },
          {
            "nome": "I19"
          },
          {
            "nome": "I20"
          },
          {
            "nome": "I21"
          },
          {
            "nome": "I22"
          }
        ]
      },
      {
        "ref": "TENSAO",
        "lado": "baixo",
        "legenda": "2 canais de tensão 0–30 V (2)",
        "pinos": [
          {
            "nome": "V1",
            "usa": true,
            "para": "BD-POT · O3"
          },
          {
            "nome": "V2",
            "usa": true,
            "para": "BD-12V · O3"
          }
        ]
      },
      {
        "ref": "485",
        "lado": "esquerda",
        "legenda": "Linha RS-485 (2)",
        "pinos": [
          {
            "nome": "A",
            "usa": true,
            "para": "MAX485 · A"
          },
          {
            "nome": "B",
            "usa": true,
            "para": "MAX485 · B"
          }
        ]
      },
      {
        "ref": "ALIM",
        "lado": "direita",
        "legenda": "Alimentação 7–25 V DC e retorno dos shunts (2)",
        "pinos": [
          {
            "nome": "V+",
            "usa": true,
            "para": "BD-24V · O3"
          },
          {
            "nome": "GND",
            "usa": true,
            "para": "BD-0V-B · Z22"
          }
        ]
      }
    ],
    "avisos": [
      "⭐ ALIMENTADO PELO 24 V PERMANENTE, MEDINDO O 24 V COMUTADO. É a diferença que importa em relação ao SV-1: o divisor antigo era alimentado pelo próprio BD-POT, então na emergência ele apagava junto e o D25 lia 0 — sem dizer se era \"sem tensão\" ou \"sem instrumento\". Este módulo continua de pé e responde \"V1 = 0,00 V\": agora a informação é a informação.",
      "⭐ 22 CANAIS, 8 EM USO. I1 a I8 são as 8 posições da placa de LED (2 placas de 4 canais). I9 a I22 ficam de reserva — se um dia a câmara ganhar mais posições, o borne já está lá e não se troca módulo nenhum.",
      "⭐ V1 E V2 SÃO O QUE DISPENSA O DIVISOR. Os 2 canais de tensão leem 0–30 V direto, sem resistor nenhum: V1 no BD-POT (o 24 V que morre na emergência) e V2 no BD-12V (o 12 V das posições). É por isso que A2 e A3 do Mega continuam livres.",
      "⚠️ A corrente não distingue \"chave aberta\" de \"LED queimado\": as duas dão 0 mA. Quem separa os dois é a tensão da barra: com a chave aberta o V2 continua em 12 V, e com o T3 caído ele desaba. Por posição não há como separar — e é justamente esse o exercício.",
      "⚠️ ALIMENTAÇÃO 7–25 V DC, E O PAINEL TEM 24 V. Cabe, mas sobra 1 V. O PS1 tem de ficar em 24,0 V e não acima — se alguém ajustar para 26 V \"para o Peltier render mais\", este módulo queima e o painel fica cego sem nenhum fusível estourar. Antes de energizar: multímetro no BD-24V, conferir 24,0 ± 0,5 V. ⭐ NÃO troque para o BD-12V \"por segurança\": este módulo mede a barra de 12 V no V2, e alimentá-lo da mesma barra que ele vigia apaga a diferença entre \"a posição queimou\" e \"a fonte de 12 V caiu\". Se o PS1 não segurar 24,0 V, aí sim vale mover um fio de V+ para BD-12V · O3 — e aceitar o diagnóstico pior.",
      "❓ O BORNE DE RETORNO É A ÚNICA COISA DESTE MÓDULO QUE AINDA NÃO ESTÁ PROVADA. A pinagem publicada do N4AIC24 é VIN, GND, I1..I22, V1+, V2+, A+ e B−: NÃO existe `COM`. O nó comum dos 22 shunts é o GND do módulo — `COM` é o nome lógico que este projeto usa para ele. ⚠️ A REGRA QUE NÃO PODE SER LIDA ERRADO: o cátodo do LED entra em I_n, SEMPRE. Ligar o cátodo direto no BD-0V-B desvia do shunt e aquele canal lê zero para sempre — o LED acende normal e o painel jura que não há corrente. O que muda entre os casos é o NOME do borne de retorno, não o caminho. ⭐ Verificação primária: injetar 12 V + 1 kΩ (~10 mA) num canal e conferir se o Modbus retorna 9–11 mA — a continuidade com o multímetro é secundária e pode ser enganada pelo próprio shunt.",
      "📐 GABINETE 101 × 82 × 40 mm (o modelo do app estava em 96 × 84, sem profundidade). No trilho 3 ele ocupa x 300..401 e o BD-0V-B começa em 410 — sobram 9 mm. Os 40 mm de profundidade entram nos 250 mm do painel com folga de sobra para a canaleta da porta.",
      "📌 Endereço Modbus 1, 9600 8N1, função 04, registradores a partir de 0x0000 — os 24 canais são consecutivos. Ler os 24 numa requisição só leva ~70 ms; ler um por vez leva ~0,5 s, e o laço do PID sente."
    ]
  },
  {
    "id": "AD-1",
    "nome": "AD-1 — adaptador do DS18B20 (com pull-up)",
    "trilho": 3,
    "resumoFuncao": "🔎 O QUE ELE FAZ: e a ponta do barramento 1-Wire. Traz o resistor de pull-up de 4,7 kΩ ja montado — aquele SEM O QUAL o sensor nao responde — e transforma os tres fios da sonda em tres bornes de parafuso.",
    "x": 236,
    "largura": 32,
    "altura": 30,
    "cor": "#0ca678",
    "nota": "⚠️ CONFIRA O PULL-UP AO RECEBER: ohmímetro entre DAT e VCC deve dar ~4,7 kΩ. Há adaptadores vendidos como \"com pull-up\" que vêm sem o resistor — e aí o sensor simplesmente não responde, sem nenhum outro sintoma.",
    "grupos": [
      {
        "ref": "SONDA",
        "lado": "cima",
        "legenda": "Vem da sonda (3)",
        "pinos": [
          {
            "nome": "DAT",
            "usa": true,
            "para": "DS18 · DATA"
          },
          {
            "nome": "VCC",
            "usa": true,
            "para": "DS18 · VCC"
          },
          {
            "nome": "GND",
            "usa": true,
            "para": "DS18 · GND"
          }
        ]
      },
      {
        "ref": "MEGA",
        "lado": "baixo",
        "legenda": "Vai para o painel (3)",
        "pinos": [
          {
            "nome": "S",
            "usa": true,
            "para": "MEGA · D2"
          },
          {
            "nome": "+",
            "usa": true,
            "para": "BD-5V · O6"
          },
          {
            "nome": "−",
            "usa": true,
            "para": "BD-0V-B · Z24"
          }
        ]
      }
    ]
  },
  {
    "id": "ESP32",
    "nome": "ESP32 + DNLCB30 — supervisão Wi-Fi / MQTT",
    "trilho": 2,
    "resumoFuncao": "Supervisão e comunicação remota. Troca telemetria com o Mega pela Serial1 do Mega. A leitura Modbus foi transferida para a Serial3 do Mega.",
    "x": 172,
    "largura": 96,
    "altura": 84,
    "cor": "#1971c2",
    "nota": "Os nomes são os da serigrafia da borda externa, exatamente como estão impressos na placa. Cada bloco tem 15 bornes em FILEIRA ÚNICA — o \"5V\" é o primeiro borne de cada um, não uma coluna à parte.",
    "grupos": [
      {
        "ref": "H1",
        "lado": "esquerda",
        "legenda": "Bloco esquerdo — 15 bornes",
        "pinos": [
          {
            "nome": "5V"
          },
          {
            "nome": "D15"
          },
          {
            "nome": "D4"
          },
          {
            "nome": "D16"
          },
          {
            "nome": "D17"
          },
          {
            "nome": "D5"
          },
          {
            "nome": "D18"
          },
          {
            "nome": "GND"
          },
          {
            "nome": "D19"
          },
          {
            "nome": "D21"
          },
          {
            "nome": "RX0",
            "usa": true,
            "para": "MEGA · D18"
          },
          {
            "nome": "TX0",
            "usa": true,
            "para": "MEGA · D19"
          },
          {
            "nome": "D22"
          },
          {
            "nome": "D23"
          },
          {
            "nome": "GND"
          }
        ]
      },
      {
        "ref": "H2",
        "lado": "direita",
        "legenda": "Bloco direito — 15 bornes",
        "pinos": [
          {
            "nome": "5V"
          },
          {
            "nome": "GND"
          },
          {
            "nome": "D13"
          },
          {
            "nome": "D14"
          },
          {
            "nome": "D27"
          },
          {
            "nome": "D26"
          },
          {
            "nome": "D25"
          },
          {
            "nome": "GND"
          },
          {
            "nome": "D33"
          },
          {
            "nome": "D32"
          },
          {
            "nome": "D35"
          },
          {
            "nome": "D34"
          },
          {
            "nome": "VN"
          },
          {
            "nome": "VP"
          },
          {
            "nome": "GND"
          }
        ]
      },
      {
        "ref": "PWR",
        "lado": "baixo",
        "legenda": "Alimentação DC 7–30 V (2)",
        "pinos": [
          {
            "nome": "+",
            "usa": true,
            "para": "BD-24V · O1"
          },
          {
            "nome": "−",
            "usa": true,
            "para": "BD-0V · Z7"
          }
        ]
      }
    ],
    "avisos": [
      "D16/D17 do ESP32 ficam livres. RS-485 A/B não se conecta diretamente a GPIO."
    ]
  },
  {
    "id": "F-P",
    "nome": "F-P — placa de distribuição de 8 posições com chave (trilho DIN)",
    "trilho": 2,
    "resumoFuncao": "🔎 O QUE ELA FAZ: simula os disjuntores de gaveta da indústria, um por posição de ensaio. São 8 canais independentes, cada um com a sua CHAVE liga/desliga, o seu porta-fusível de lâmina e o seu LED de canal ligado. É a chave que DEMONSTRA a detecção de falha: desliga a posição 3 e em < 1 s o canal I3 cai para 0,00 mA, o Modbus reporta e o alarme aparece no dashboard.",
    "x": 280,
    "largura": 150,
    "altura": 70,
    "cor": "#fab005",
    "nota": "⭐ O fusível está no POSITIVO, depois da chave, e o módulo mede o RETORNO. Caminho de uma posição: BD-12V → chave da posição → fusível → borne n+ → câmara (resistor + LED) → volta → borne I_n do módulo → shunt interno → GND → BD-0V. A chave antes do fusível é o certo: desligar tira a tensão do porta-fusível, e trocar o fusível com a chave aberta é seguro.",
    "grupos": [
      {
        "ref": "IN",
        "lado": "cima",
        "legenda": "Entrada da placa — VCC e GND (2)",
        "pinos": [
          {
            "nome": "VCC",
            "usa": true,
            "para": "BD-12V · O1"
          },
          {
            "nome": "GND",
            "usa": true,
            "para": "BD-0V-B · Z25"
          }
        ]
      },
      {
        "ref": "OUT",
        "lado": "baixo",
        "legenda": "Saída n+ de cada canal, depois do fusível (8)",
        "pinos": [
          {
            "nome": "F-P1",
            "usa": true,
            "para": "PL-1 · +1"
          },
          {
            "nome": "F-P2",
            "usa": true,
            "para": "PL-1 · +2"
          },
          {
            "nome": "F-P3",
            "usa": true,
            "para": "PL-1 · +3"
          },
          {
            "nome": "F-P4",
            "usa": true,
            "para": "PL-1 · +4"
          },
          {
            "nome": "F-P5",
            "usa": true,
            "para": "PL-2 · +1"
          },
          {
            "nome": "F-P6",
            "usa": true,
            "para": "PL-2 · +2"
          },
          {
            "nome": "F-P7",
            "usa": true,
            "para": "PL-2 · +3"
          },
          {
            "nome": "F-P8",
            "usa": true,
            "para": "PL-2 · +4"
          }
        ]
      }
    ],
    "avisos": [
      "⚠️ OS 8 BORNES n− FICAM VAZIOS, e isso é de propósito. A placa entrega um par por canal (1+/1−, 2+/2−, … 8+/8−), mas o retorno da posição NÃO pode voltar por aqui: ele tem que passar pelo borne I_n do módulo, senão a corrente desvia do shunt e o canal lê zero para sempre. O sintoma é \"acende tudo e não mede nada\".",
      "⚠️ O GND DA PLACA (entrada) NÃO É O RETORNO DAS POSIÇÕES. Ele alimenta só os 8 LEDs indicadores de canal (~4 mA cada). Por isso ele vai ao BD-0V-B em parafuso próprio, e o n− continua solto.",
      "⚠️ FUSÍVEL DE LÂMINA: a placa vem com 5 A de fábrica. A posição puxa ~10 mA, então troque por 1 A (o menor que existe em ATO/ATC) — ou 2 A, se não achar 1 A. Mesmo 1 A é 100× a carga: este fusível protege o CABO, não o LED. Quem protege o LED é o resistor de 1 kΩ em série, dentro da câmara.",
      "📌 ESPECIFICAÇÃO DA PLACA: 8 canais, 5–32 V AC/DC, 5 A por canal, entrada de 30 A por posição (borne 7,62 mm, 26–10 AWG), trilho DIN 35/32/15 mm, FR-4 dupla face. A chave é DPST por canal e o LED acende junto com ela — o público vê a posição apagar antes de olhar a tela.",
      "⭐ PARA A DEMONSTRAÇÃO: desligar a chave da posição 1 corta a corrente, o canal I1 cai para 0,00 mA, o V2 continua em 12 V (a barra está viva), o Modbus reporta e o alarme dispara. Ligar de novo restaura — e o registro fica com a hora do evento, porque o RTC está no mesmo barramento."
    ]
  },
  {
    "id": "BTS1",
    "nome": "BTS1 — driver de potência da PELTIER (frio)",
    "trilho": 2,
    "resumoFuncao": "🔎 O QUE ELE FAZ: e a CHAVE DE CONTROLE da Peltier. Recebe os 24 V do BD-POT e entrega a pastilha em PWM de 20 kHz, na potencia que o PID pedir. Quem manda e o Arduino (D5 = quanto, D4 = pode ou nao). Devolve pelo R_IS uma amostra da corrente. ⚠ Ele e a chave de CONTROLE, nao a de SEGURANCA — quem corta de verdade e o KM1.",
    "aConferir": "📐 NO DESENHO os 8 pinos de sinal aparecem em FILA ÚNICA, na borda. No módulo real eles são uma barra de 2 × 4. A ordem é a mesma; o que muda é só o desenho, para dar para ver qual fio entra em qual pino.",
    "x": 48,
    "largura": 50,
    "altura": 50,
    "cor": "#c92a2a",
    "grupos": [
      {
        "ref": "P1",
        "lado": "esquerda",
        "legenda": "Borne verde de potência (4 parafusos)",
        "pinos": [
          {
            "nome": "M−",
            "usa": true,
            "para": "PELT · −"
          },
          {
            "nome": "M+",
            "usa": true,
            "para": "PELT · +"
          },
          {
            "nome": "B+",
            "usa": true,
            "para": "BD-POT · O1"
          },
          {
            "nome": "B−",
            "usa": true,
            "para": "BD-0V · Z1"
          }
        ]
      },
      {
        "ref": "J1",
        "lado": "direita",
        "legenda": "Barra de sinal — no módulo é 2 × 4",
        "pinos": [
          {
            "nome": "R_PWM",
            "usa": true,
            "para": "MEGA · D5"
          },
          {
            "nome": "L_PWM",
            "usa": true,
            "para": "BTS1 · GND"
          },
          {
            "nome": "R_EN",
            "usa": true,
            "para": "MEGA · D4; BTS1 · L_EN"
          },
          {
            "nome": "L_EN",
            "usa": true,
            "para": "BTS1 · R_EN"
          },
          {
            "nome": "R_IS",
            "usa": true,
            "para": "MEGA · A0"
          },
          {
            "nome": "L_IS"
          },
          {
            "nome": "VCC",
            "usa": true,
            "para": "BD-5V · O4"
          },
          {
            "nome": "GND",
            "usa": true,
            "para": "BD-0V · Z3; BTS1 · L_PWM"
          }
        ]
      }
    ],
    "avisos": [
      "⚠️ Os 2 resistores de 10 kΩ de pull-down ficam soldados DENTRO deste módulo, entre R_EN/L_EN e GND — não na PI-1."
    ]
  },
  {
    "id": "BTS2",
    "nome": "BTS2 — driver de potência do PTC (quente)",
    "trilho": 2,
    "resumoFuncao": "⛔ Potência do BTS2 bloqueada na proposta atual. O PTC passa a 12 V/50 W, mas seu ramal separado, corte CC e proteção ainda não foram projetados. Não ligar B+ ao BD-POT nem diretamente ao T3.",
    "x": 110,
    "largura": 50,
    "altura": 50,
    "cor": "#c92a2a",
    "grupos": [
      {
        "ref": "P1",
        "lado": "esquerda",
        "legenda": "Borne verde de potência (4 parafusos)",
        "pinos": [
          {
            "nome": "M−",
            "para": "PTC · − (ligação bloqueada)"
          },
          {
            "nome": "M+",
            "para": "PTC · + (ligação bloqueada)"
          },
          {
            "nome": "B+",
            "para": "⛔ ramal 12 V independente a definir"
          },
          {
            "nome": "B−",
            "usa": true,
            "para": "BD-0V · Z2"
          }
        ]
      },
      {
        "ref": "J1",
        "lado": "direita",
        "legenda": "Barra de sinal — no módulo é 2 × 4",
        "pinos": [
          {
            "nome": "R_PWM",
            "usa": true,
            "para": "MEGA · D6"
          },
          {
            "nome": "L_PWM",
            "usa": true,
            "para": "BTS2 · GND"
          },
          {
            "nome": "R_EN",
            "usa": true,
            "para": "MEGA · D7; BTS2 · L_EN"
          },
          {
            "nome": "L_EN",
            "usa": true,
            "para": "BTS2 · R_EN"
          },
          {
            "nome": "R_IS",
            "usa": true,
            "para": "MEGA · A1"
          },
          {
            "nome": "L_IS"
          },
          {
            "nome": "VCC",
            "usa": true,
            "para": "BD-5V · O5"
          },
          {
            "nome": "GND",
            "usa": true,
            "para": "BD-0V · Z4; BTS2 · L_PWM"
          }
        ]
      }
    ]
  },
  {
    "id": "KM1",
    "nome": "KM1 — o único relé da cadeia: cai em tudo, religa no verde",
    "trilho": 1,
    "resumoFuncao": "🔎 O QUE ELE FAZ: e O rele da cadeia de comando — o unico — e e ele quem liga e desliga os 24 V dos BTS. Tem selo proprio: o botao VERDE o arma; o COGUMELO e o botao PRETO o derrubam, cada um pelo seu bloco NF, e ele NAO volta sozinho; e o KA1 pode derruba-lo tambem, quando o firmware detecta uma falha. ⚠ Contato de 10 A em corrente continua — ele pode abrir sob os 6 A da Peltier.",
    "x": 48,
    "largura": 34,
    "altura": 50,
    "cor": "#7048e8",
    "nota": "⚠️ Contato declarado em CORRENTE CONTÍNUA, mínimo 10 A.",
    "grupos": [
      {
        "ref": "CIMA",
        "lado": "cima",
        "legenda": "Fileira de cima · pinos 4 · 8 · 12 · 14",
        "pinos": [
          {
            "nome": "22",
            "pino": 4
          },
          {
            "nome": "24",
            "pino": 8,
            "usa": true,
            "para": "KM1 · A1"
          },
          {
            "nome": "21",
            "pino": 12,
            "usa": true,
            "para": "S1 · 13"
          },
          {
            "nome": "A2",
            "pino": 14,
            "usa": true,
            "para": "KA123 · COM1; KM1 · A1"
          }
        ]
      },
      {
        "ref": "BAIXO",
        "lado": "baixo",
        "legenda": "Fileira de baixo · pinos 1 · 5 · 9 · 13",
        "pinos": [
          {
            "nome": "12",
            "pino": 1
          },
          {
            "nome": "14",
            "pino": 5,
            "usa": true,
            "para": "BD-POT · IN"
          },
          {
            "nome": "11",
            "pino": 9,
            "usa": true,
            "para": "F-R · F1_OUT"
          },
          {
            "nome": "A1",
            "pino": 13,
            "usa": true,
            "para": "S1 · 14; KM1 · 24; KM1 · A2"
          }
        ]
      }
    ],
    "avisos": [
      "⭐ É O CIRCUITO CLÁSSICO DE PARTIDA-PARADA, e agora ele é o único do painel. O contato 21-24 realimenta a própria bobina; o S0 (cogumelo NF) e o S2 (STOP NF) estão em SÉRIE, um depois do outro; o S1 (LIGAR verde) está em PARALELO com o selo. Aperta qualquer uma das duas paradas UMA VEZ: a bobina cai, o selo abre junto, e nem soltando o botão ela volta. Só o verde religa. Memória sem uma linha de código.",
      "⭐ UM SELO SÓ — E ISSO APAGOU UM ERRO DE MONTAGEM INTEIRO. Enquanto havia dois selos (o do segundo relé, refeito pelo rearme azul, e este), trocá-los na montagem fazia o STOP exigir rearme e a emergência religar no verde. Com um selo só não há o que trocar: a resposta para \"como volta?\" é sempre o verde.",
      "⭐ A BOBINA DESTE RELÉ NÃO FECHA DIRETO NO 0 V. Entre o A2 e a barra está o CONTATO NA DO KA1, comandado pelo D27 do Mega. É o VETO DO FIRMWARE: ele pode DERRUBAR a potência (trip, STOP pela IHM, STOP remoto), mas não pode segurá-la contra o S0 nem contra o S2, que continuam a montante. Em série soma; em paralelo furaria. §31.13.",
      "🔥 MONTE O DIODO D1 (1N4007) DIRETO NESTES BORNES: catodo (faixa prateada) no A1, anodo no A2. SEM ELE o pico indutivo desta bobina abre arco NO CONTATO DO KA1, e um contato que pita acaba soldando — o veto do firmware perdido em silêncio. Se o relé já tiver diodo interno (teste de diodo entre A1 e A2 conduz num sentido só), o D1 externo é dispensável e o A1 é obrigatoriamente o positivo.",
      "⚠️ INVERTIDO, O D1 CURTO-CIRCUITA A BOBINA e derruba o F2 (2 A) assim que o verde for apertado. É um erro que se acha em 10 segundos e custa uma hora se você não desconfiar dele.",
      "🧪 O D1 COBRA UM PREÇO QUE VALE CONHECER: diodo puro na bobina atrasa o DESATRACAMENTO em 2 a 5 vezes, e contato que se separa devagar arca por mais tempo — justamente NESTE relé, que interrompe 6 A em corrente contínua. Quem quiser os dois lados troca por 1N4007 EM SÉRIE COM UM ZENER DE 24 a 33 V. Ver Doc 31 §31.15.",
      "⭐ TODO O CIRCUITO DE BOBINA DESTE RELÉ FICA NAS CANALETAS DE POTÊNCIA. O único fio de SINAL que chega perto é o do D27, e ele para no IN1 do módulo do KA1, no trilho 2 — nunca na bobina."
    ]
  },
  {
    "id": "KA123",
    "nome": "CMD-02 — Módulo de 8 Relés 5V optoacoplado para trilho DIN (KA1..KA3 + Sinaleiros H1..H4)",
    "trilho": 2,
    "resumoFuncao": "🔎 O QUE FAZEM: sao as tres maos do FIRMWARE no mundo fisico. KA1 (POTENCIA) fica em serie com a bobina do KM1 — abrindo, derruba o selo e os 24 V somem do BD-POT, e nao voltam ate alguem apertar o botao verde. KA2 (FAN DO RADIADOR) chaveia o +12 V dos 2 coolers externos com RPM. KA3 (FANS INTERNAS) chaveia o +12 V das 5 ventoinhas internas sem tacometro. ⭐ A confirmacao de BD-POT vem do N4AIC24 em V1 via Modbus; RPM cobre somente os dois coolers externos.",
    "x": 442,
    "largura": 105,
    "altura": 60,
    "cor": "#e8590c",
    "nota": "Módulo de 8 relés optoacoplados 5 Vcc para montagem em trilho DIN. Ch 1 (KA1 - Veto/Trip KM1), Ch 2 (KA2 - Cooler radiador Peltier), Ch 3 (KA3 - 5 coolers internos câmara), Ch 4 (H1 Verde 24V), Ch 5 (H2 Azul 24V), Ch 6 (H3 Amarelo 24V), Ch 7 (H4 Vermelho 24V), Ch 8 (Reserva técnica). Envelope real ~145 × 88 × 42 mm.",
    "grupos": [
      {
        "ref": "ALIM",
        "lado": "baixo",
        "legenda": "Alimentação dos três módulos (2)",
        "pinos": [
          {
            "nome": "+5V",
            "usa": true,
            "para": "BD-5V · O12"
          },
          {
            "nome": "0V",
            "usa": true,
            "para": "BD-0V-B · Z21"
          }
        ]
      },
      {
        "ref": "CMD",
        "lado": "cima",
        "legenda": "Gatilhos, vindos do Arduino (3)",
        "pinos": [
          {
            "nome": "IN1",
            "usa": true,
            "para": "MEGA · D27"
          },
          {
            "nome": "IN2",
            "usa": true,
            "para": "MEGA · D30"
          },
          {
            "nome": "IN3",
            "usa": true,
            "para": "MEGA · D29"
          }
        ]
      },
      {
        "ref": "KA1",
        "lado": "baixo",
        "legenda": "⚡ KA1 · POTÊNCIA — corta os 24 V dos BTS (2)",
        "pinos": [
          {
            "nome": "COM1",
            "usa": true,
            "para": "KM1 · A2"
          },
          {
            "nome": "NO1",
            "usa": true,
            "para": "BD-0V · Z12"
          }
        ]
      },
      {
        "ref": "KA2",
        "lado": "baixo",
        "legenda": "🌀 KA2 · FAN EXTERNA — ventoinhas do radiador (2)",
        "pinos": [
          {
            "nome": "COM2",
            "usa": true,
            "para": "BD-AUX · O2"
          },
          {
            "nome": "NC2",
            "usa": true,
            "para": "RAD · +"
          }
        ]
      },
      {
        "ref": "KA3",
        "lado": "baixo",
        "legenda": "🌀 KA3 · FANS INTERNAS — as 5 de dentro da câmara (2)",
        "pinos": [
          {
            "nome": "COM3",
            "usa": true,
            "para": "BD-AUX · O1"
          },
          {
            "nome": "NO3",
            "usa": true,
            "para": "VF · +"
          }
        ]
      }
    ],
    "avisos": [
      "⭐ OS TRÊS JUMPERS EM **H** (gatilho ALTO). Assim digitalWrite(pino, HIGH) fecha o relé, que é a convenção intuitiva e a mesma de todo o resto do painel. Em L a lógica inverte e o firmware vira uma armadilha de leitura.",
      "🔥 O KA1 USA COM + NO. NUNCA O NC. Módulo sem energia = contato aberto = potência cortada. Ligado no NC a lógica inverte e o fail-safe morre: um Arduino desligado passaria a ARMAR a potência.",
      "🔥 JÁ O KA2 USA COM + NC, E ISSO NÃO É DESCUIDO — É O CONTRÁRIO DO KA1 DE PROPÓSITO. Os dois têm estados seguros OPOSTOS: para o KA1, seguro é potência cortada; para o KA2, seguro é ventoinha GIRANDO, porque o dissipador quente é o que mata a pastilha. Com o NC, Arduino morto, fio do D30 rompido ou 5 V caído deixam as ventoinhas ligadas. No NO, a mesma falha parava a ventilação sem alarme nenhum — era o pior caso do projeto. Ver Doc 31 §31.14.",
      "⚠️ E POR ISSO A LÓGICA DO D30 É INVERTIDA EM RELAÇÃO À DO D27: HIGH fecha o relé, o NC abre e as ventoinhas PARAM. LOW ou pino solto = elas GIRAM. Existe UMA função no firmware que escreve neste pino, e a inversão mora só lá dentro — é assim que uma inversão deixa de ser armadilha (Doc 40 §40.10).",
      "⚠️ RESISTOR DE 10 kΩ ENTRE CADA IN E O 0 V. O anúncio promete tolerância a falha (\"linha de controle quebrada, o relé não funciona\") e o LED do optoacoplador de fato precisa de corrente para acender. O resistor torna isso determinístico em vez de confiado: pino solto = 0 V no IN = relé aberto, medível com multímetro.",
      "📌 A ISOLAÇÃO É NOMINAL, NÃO GALVÂNICA. O módulo tem só 3 bornes de entrada (DC+, DC−, IN), então o DC− É a referência do sinal — ele partilha o 0 V do Arduino. O optoacoplador entrega imunidade a ruído (a entrada é acionada por corrente, não por tensão), não separação de terras. Para isolação de verdade seria preciso a versão de 4 pinos, com JD-VCC e jumper removível.",
      "⚠️ CONFIRME QUE A BOBINA É DE 5 V. Estes anúncios vendem 5 / 12 / 24 V na mesma página e a FOTO costuma ser da versão de 24 V. Ao receber, leia o corpo do relé: tem de estar escrito 5VDC. Um módulo de 24 V não fecha com os 5 V do BD-5V.",
      "🔥 O KA3 USA COM + NO, COMO O KA1 — E PELO MOTIVO OPOSTO AO DO KA2. Ventoinha interna parada não queima nada: a Peltier tem o radiador dela (KA2, sempre no estado seguro LIGADO) e a proteção térmica do PTC foi proposta em ST-1/ST-2. A variante exata, capacidade CC, rearme manual e validação térmica continuam pendentes; não energizar o PTC até encerrar essas pendências. O estado seguro do KA3 é PARADA, e o NO entrega isso de graça. De quebra o firmware não muda: HIGH liga, igual ao módulo MOSFET que ele substituiu. A autorregulação do PTC não comprova proteção do acrílico.",
      "⭐ POR QUE RELÉ E NÃO O MÓDULO MOSFET (MV-1), QUE ESTAVA AQUI ATÉ AGORA. A única vantagem real de um MOSFET sobre um contato é MODULAR (PWM) ou comutar milhares de vezes por hora. O KA3 comuta UMA vez por ensaio, e o pino que o comanda — D29 — não é nem pino de PWM no Mega. Pagava-se R$ 43,51 por um módulo de 4 canais para usar 1 canal como interruptor. Ver Doc 31 §31.16.",
      "⚠️ O DIODO D3 (1N4007) VAI JUNTO DAS 5 INTERNAS, catodo no +12 V — mesma função do D2 no radiador. Ventoinha é carga indutiva; sem o diodo o pico volta para o contato do KA3 toda vez que o ensaio termina. Com o MOSFET esse diodo estava escondido dentro do módulo; com contato seco ele é peça de projeto.",
      "📌 65 mA CADA, do barramento de 5 V. O consumo total estimado fica próximo de 0,7 A, abaixo dos 5 A propostos para T2; o modelo, a faixa de entrada e a capacidade contínua ainda precisam ser confirmados.",
      "❓ \"O ARDUINO SÓ MANDA E NÃO RECEBE DOS RELÉS?\" — sim, e é de propósito. Ele não lê contato auxiliar nenhum. O resultado elétrico é medido pelo canal V1 do N4AIC24, alimentado pelo 24 V permanente e ligado ao BD-POT. A leitura chega ao Mega via Modbus RTU/RS-485; timeout ou valor inválido deve bloquear a partida e produzir falha retentiva durante o ensaio. A implementação do firmware real e o timeout de campo ainda precisam ser validados."
    ]
  },
  {
    "id": "BD-POT",
    "nome": "BD-POT — 24 V COMUTADO (morre na emergência)",
    "trilho": 1,
    "resumoFuncao": "🔎 O QUE ELE É: barra comutada de 24 V para a Peltier (BTS1) e medição V1. O BTS2/PTC foi removido desta barra: a proposta de 12 V ainda está bloqueada até definir corte e proteção independentes.",
    "x": 94,
    "largura": 36,
    "altura": 58,
    "cor": "#c92a2a",
    "nota": "COMUTADO pelo KM1 — cai na emergência.",
    "grupos": [
      {
        "ref": "IN",
        "lado": "cima",
        "legenda": "Entrada 4 mm² (1)",
        "pinos": [
          {
            "nome": "IN",
            "usa": true,
            "para": "KM1 · 14"
          }
        ]
      },
      {
        "ref": "OUT",
        "lado": "baixo",
        "legenda": "Saídas (4)",
        "pinos": [
          {
            "nome": "O1",
            "usa": true,
            "para": "BTS1 · B+"
          },
          {
            "nome": "O2",
            "para": "⛔ não usar para BTS2; ramal 12 V bloqueado"
          },
          {
            "nome": "O3",
            "usa": true,
            "para": "N4AIC24 · V1"
          },
          {
            "nome": "O4"
          }
        ]
      }
    ]
  },
  {
    "id": "BD-AUX",
    "nome": "BD-AUX — 12 V das ventoinhas (permanente)",
    "trilho": 1,
    "resumoFuncao": "🔎 O QUE ELE E: os 12 V das ventoinhas, tambem permanente. Ele nao passa pelo KM1 de proposito: e o que permite as ventoinhas do radiador continuarem resfriando o dissipador quente DEPOIS de alguem socar o cogumelo.",
    "x": 142,
    "largura": 36,
    "altura": 58,
    "cor": "#fab005",
    "grupos": [
      {
        "ref": "IN",
        "lado": "cima",
        "legenda": "Entrada 2,5 mm² (1)",
        "pinos": [
          {
            "nome": "IN",
            "usa": true,
            "para": "T3 · OUT+"
          }
        ]
      },
      {
        "ref": "OUT",
        "lado": "baixo",
        "legenda": "Saídas (4)",
        "pinos": [
          {
            "nome": "O1",
            "usa": true,
            "para": "KA123 · COM3"
          },
          {
            "nome": "O2",
            "usa": true,
            "para": "KA123 · COM2"
          },
          {
            "nome": "O3"
          },
          {
            "nome": "O4"
          }
        ]
      }
    ],
    "avisos": [
      "⭐ A SAÍDA O2 VAI AO COM2 DO MÓDULO DO KA2, e o NC2 dele é que segue para o fio X5. O contato chaveia o LADO POSITIVO das ventoinhas do radiador — nunca o negativo, que é a referência do tacômetro e foi o que quebrou na versão anterior. Doc 31 §31.14.",
      "🔥 É O NC (FECHADO EM REPOUSO), NÃO O NO. Com o módulo sem energia — Arduino morto, fio do D30 rompido, 5 V caído — as ventoinhas GIRAM. Este é o único ponto do painel em que o estado seguro é LIGADO.",
      "⭐ O BD-AUX NÃO PASSA PELO KM1 DE PROPÓSITO. Com o cogumelo socado e o dissipador a 60 °C, estes 12 V continuam de pé e as ventoinhas continuam girando — até o DS18B20 dizer que esfriou.",
      "⭐ O D2 (1N4007) É DE RODA-LIVRE DO MOTOR, catodo no +12 V, montado junto das ventoinhas. Ventoinha é carga indutiva e nada mais a grampeia."
    ],
    "nota": "Alimentação produzida e distribuída dentro do painel. Em emergência a lógica/ventilação permanece ativa; Q0 desliga a alimentação geral."
  },
  {
    "id": "BD-24V",
    "nome": "BD-24V — 24 V PERMANENTE (comando)",
    "trilho": 1,
    "resumoFuncao": "Distribuição permanente de 24 V protegidos por F2; alimenta lógica de comando, DUTs e ADC.",
    "x": 190,
    "largura": 45,
    "altura": 58,
    "cor": "#e8590c",
    "nota": "Alimentação produzida e distribuída dentro do painel. Em emergência a lógica/ventilação permanece ativa; Q0 desliga a alimentação geral.",
    "grupos": [
      {
        "ref": "IN",
        "lado": "cima",
        "legenda": "Entrada 2,5 mm² (1)",
        "pinos": [
          {
            "nome": "IN",
            "usa": true,
            "para": "F-R · F2_OUT"
          }
        ]
      },
      {
        "ref": "OUT",
        "lado": "baixo",
        "legenda": "Saídas (6)",
        "pinos": [
          {
            "nome": "O1",
            "usa": true,
            "para": "ESP32 · +"
          },
          {
            "nome": "O2",
            "usa": true,
            "para": "S0 · 11"
          },
          {
            "nome": "O3",
            "usa": true,
            "para": "N4AIC24 · V+"
          },
          {
            "nome": "O4"
          },
          {
            "nome": "O5"
          },
          {
            "nome": "O6"
          }
        ]
      }
    ]
  },
  {
    "id": "BD-5V",
    "nome": "BD-5V — 5,0 V propostos para a eletrônica (permanente)",
    "trilho": 1,
    "resumoFuncao": "Distribuição permanente de 5 V regulados por T2, incluindo o MAX485.",
    "x": 247,
    "largura": 87,
    "altura": 58,
    "cor": "#f08c00",
    "grupos": [
      {
        "ref": "IN",
        "lado": "cima",
        "legenda": "Entrada 2,5 mm² (1)",
        "pinos": [
          {
            "nome": "IN",
            "usa": true,
            "para": "T2 · OUT+"
          }
        ]
      },
      {
        "ref": "OUT",
        "lado": "baixo",
        "legenda": "Saídas (12) ⬆",
        "pinos": [
          {
            "nome": "O1",
            "usa": true,
            "para": "MEGA · +5V"
          },
          {
            "nome": "O2",
            "usa": true,
            "para": "HMI · VBUS"
          },
          {
            "nome": "O3",
            "usa": true,
            "para": "RTC · VCC"
          },
          {
            "nome": "O4",
            "usa": true,
            "para": "BTS1 · VCC"
          },
          {
            "nome": "O5",
            "usa": true,
            "para": "BTS2 · VCC"
          },
          {
            "nome": "O6",
            "usa": true,
            "para": "AD-1 · +"
          },
          {
            "nome": "O7",
            "usa": true,
            "para": "CONV · HV"
          },
          {
            "nome": "O8",
            "usa": true,
            "para": "MAX485 · VCC"
          },
          {
            "nome": "O9"
          },
          {
            "nome": "O10",
            "usa": true,
            "para": "SENS · VCC"
          },
          {
            "nome": "O11"
          },
          {
            "nome": "O12",
            "usa": true,
            "para": "KA123 · +5V"
          },
          {
            "nome": "O13"
          }
        ]
      }
    ],
    "avisos": [
      "📌 Cresceu de 10 para 12 pontos quando o AM2315C ganhou saída própria. A carga estimada é de cerca de 0,7 A; T2 está proposto em 5 A, mas o modelo e a capacidade contínua não foram confirmados."
    ],
    "nota": "Alimentação produzida e distribuída dentro do painel. Em emergência a lógica/ventilação permanece ativa; Q0 desliga a alimentação geral."
  },
  {
    "id": "BD-0V",
    "nome": "BD-0V — retorno único de tudo (star ground)",
    "trilho": 1,
    "resumoFuncao": "🔎 O QUE ELE E: o ponto onde TODO retorno do painel se encontra, um parafuso por dispositivo. ⭐ Estrela, nunca em cadeia: pendurar um retorno no outro faz a corrente de um virar erro de medicao do outro — e como os BTS chaveiam, esse erro PISCA no ritmo do PWM. Chama-se acoplamento por impedancia comum e e a causa numero 1 de medicao ruim em painel.",
    "x": 346,
    "largura": 84,
    "altura": 58,
    "cor": "#212529",
    "nota": "Alimentação produzida e distribuída dentro do painel. Em emergência a lógica/ventilação permanece ativa; Q0 desliga a alimentação geral.",
    "grupos": [
      {
        "ref": "IN",
        "lado": "cima",
        "legenda": "Entrada 10 mm² (1)",
        "pinos": [
          {
            "nome": "IN",
            "usa": true,
            "para": "PS1 · 0V"
          }
        ]
      },
      {
        "ref": "R",
        "lado": "baixo",
        "legenda": "Retornos do lado da potência (16)",
        "pinos": [
          {
            "nome": "Z1",
            "usa": true,
            "para": "BTS1 · B−"
          },
          {
            "nome": "Z2",
            "usa": true,
            "para": "BTS2 · B−"
          },
          {
            "nome": "Z3",
            "usa": true,
            "para": "BTS1 · GND"
          },
          {
            "nome": "Z4",
            "usa": true,
            "para": "BTS2 · GND"
          },
          {
            "nome": "Z5",
            "usa": true,
            "para": "MEGA · GND3"
          },
          {
            "nome": "Z6",
            "usa": true,
            "para": "T2 · IN-"
          },
          {
            "nome": "Z7",
            "usa": true,
            "para": "ESP32 · −"
          },
          {
            "nome": "Z8",
            "usa": true,
            "para": "RTC · GND"
          },
          {
            "nome": "Z9",
            "usa": true,
            "para": "HMI · GND-PWR"
          },
          {
            "nome": "Z10",
            "usa": true,
            "para": "CONV · GND-HV"
          },
          {
            "nome": "Z11",
            "usa": true,
            "para": "T3 · IN-"
          },
          {
            "nome": "Z12",
            "usa": true,
            "para": "KA123 · NO1"
          },
          {
            "nome": "Z13",
            "usa": true,
            "para": "VF · −"
          },
          {
            "nome": "Z14"
          },
          {
            "nome": "Z15",
            "usa": true,
            "para": "RAD · −"
          },
          {
            "nome": "Z16",
            "usa": true,
            "para": "BD-0V-B · PT"
          }
        ]
      }
    ],
    "avisos": [
      "🔥 É o componente mais fácil de subdimensionar. Chegam 18 retornos + a entrada. Um bloco comum de 8 saídas NÃO serve."
    ]
  },
  {
    "id": "BD-12V",
    "nome": "BD-12V — 12 V das posições de ensaio (permanente)",
    "trilho": 1,
    "resumoFuncao": "🔎 O QUE ELE É: barra proposta de 12 V permanentes para as posições de ensaio, proveniente de T3. A saída, a proteção própria e a distribuição ainda precisam de validação. F3 é o fusível legado da entrada de 24 V de T3 (2 A não foi aprovado e é insuficiente no modelo), não uma proteção confirmada desta saída. A barra não passa pelo KM1.",
    "x": 442,
    "largura": 45,
    "altura": 58,
    "cor": "#fab005",
    "nota": "⭐ POR QUE NÃO PENDURAR NO BD-AUX: a queda de tensão no fio das ventoinhas viraria erro de leitura — e pior, um erro que PISCA no ritmo da ventoinha. Um barramento de medição não pode dividir fio com uma carga chaveada.",
    "grupos": [
      {
        "ref": "IN",
        "lado": "cima",
        "legenda": "Entrada 2,5 mm² (1)",
        "pinos": [
          {
            "nome": "IN",
            "usa": true,
            "para": "T3 · OUT+2"
          }
        ]
      },
      {
        "ref": "OUT",
        "lado": "baixo",
        "legenda": "Saídas (6)",
        "pinos": [
          {
            "nome": "O1",
            "usa": true,
            "para": "F-P · VCC"
          },
          {
            "nome": "O2"
          },
          {
            "nome": "O3",
            "usa": true,
            "para": "N4AIC24 · V2"
          },
          {
            "nome": "O4"
          },
          {
            "nome": "O5"
          },
          {
            "nome": "O6"
          }
        ]
      }
    ],
    "avisos": [
      "⚠️ É 12 V PERMANENTE: a posição de ensaio fica energizada mesmo com o painel em emergência. É de propósito — mas quer dizer que os resistores de 1 kΩ estão sempre drenando. Com 8 posições são 0,8 W parados; desligue no seccionador geral quando guardar a maquete.",
      "⛔ F3 de 2 A é legado e não está aprovado: fica na entrada de 24 V do T3, e o modelo calcula corrente superior a 2 A nesse ramal. Dimensionar F3 e a proteção de saída de 12 V separadamente, conforme conversor e condutores reais.",
      "📌 O canal V2 do N4AIC24 mede esta barra. Se V2 cair, investigar T3, sua proteção e a distribuição; não atribuir automaticamente a falha às posições."
    ]
  },
  {
    "id": "BD-0V-B",
    "nome": "BD-0V-B — retornos da eletrônica (trilho 3)",
    "trilho": 3,
    "resumoFuncao": "🔎 O QUE ELE E: a segunda metade do MESMO 0 V, ligada a primeira por uma ponte de 4 mm². Ele existe porque a barra unica passou de 28 pontos e nao cabia mais no trilho 1 — e porque o retorno da eletronica fica melhor curto, perto de quem retorna: o Arduino, o MAX485 e o modulo de medicao. ⭐ E aqui que chega o GND do modulo de medicao: a corrente de cada LED volta por um borne so — o GND, nao um borne COM separado.",
    "x": 410,
    "largura": 63,
    "altura": 58,
    "cor": "#212529",
    "nota": "⭐ NÃO É UM SEGUNDO TERRA. É o mesmo nó, em dois blocos: a ponte de 4 mm² tem resistência desprezível perto das correntes que passam aqui (miliampères). O que não se pode fazer é pendurar um retorno no outro — cada um tem o seu parafuso.",
    "grupos": [
      {
        "ref": "PONTE",
        "lado": "cima",
        "legenda": "Ponte para o BD-0V (1)",
        "pinos": [
          {
            "nome": "PT",
            "usa": true,
            "para": "BD-0V · Z16"
          }
        ]
      },
      {
        "ref": "R",
        "lado": "baixo",
        "legenda": "Retornos da eletrônica (12)",
        "pinos": [
          {
            "nome": "Z17",
            "usa": true,
            "para": "MAX485 · GND"
          },
          {
            "nome": "Z18",
            "usa": true,
            "para": "S2 · 13"
          },
          {
            "nome": "Z19"
          },
          {
            "nome": "Z20"
          },
          {
            "nome": "Z21",
            "usa": true,
            "para": "KA123 · 0V"
          },
          {
            "nome": "Z22",
            "usa": true,
            "para": "N4AIC24 · GND"
          },
          {
            "nome": "Z23"
          },
          {
            "nome": "Z24",
            "usa": true,
            "para": "AD-1 · −"
          },
          {
            "nome": "Z25",
            "usa": true,
            "para": "F-P · GND"
          },
          {
            "nome": "Z26",
            "usa": true,
            "para": "SENS · GND"
          },
          {
            "nome": "Z27"
          },
          {
            "nome": "Z28"
          }
        ]
      }
    ],
    "avisos": [
      "⚠️ A PONTE É PARTE DO CIRCUITO, não um detalhe de montagem. Se ela ficar frouxa, os retornos da eletrônica passam a procurar caminho por onde não deviam — e o sintoma é leitura analógica errada, não falta de energia."
    ]
  },
  {
    "id": "RTC",
    "nome": "RTC DS3231 — data e hora reais para o log",
    "trilho": 3,
    "resumoFuncao": "🔎 O QUE ELE FAZ: guarda data e hora reais, com pilha propria, para que cada linha do log tenha carimbo de tempo verdadeiro mesmo depois de faltar energia. Sem ele o log comecaria em 1970 a cada boot, e a rastreabilidade do ensaio morreria.",
    "x": 485,
    "largura": 35,
    "altura": 40,
    "cor": "#0ca678",
    "nota": "⭐ Subiu para o trilho 3, ao lado do Arduino: o I²C fica curto e o módulo sai da canaleta de potência. Abriu espaço no trilho 1 para os dois relés, que precisam de canaleta de POTÊNCIA nas duas bordas — e no trilho 1 as duas vizinhas (CH-2x1 e CH-base) são exatamente isso.",
    "grupos": [
      {
        "ref": "RTC",
        "lado": "baixo",
        "legenda": "Pinos (6)",
        "pinos": [
          {
            "nome": "VCC",
            "usa": true,
            "para": "BD-5V · O3"
          },
          {
            "nome": "GND",
            "usa": true,
            "para": "BD-0V · Z8"
          },
          {
            "nome": "SDA",
            "usa": true,
            "para": "MEGA · D20; SENS · SDA"
          },
          {
            "nome": "SCL",
            "usa": true,
            "para": "MEGA · D21; SENS · SCL"
          },
          {
            "nome": "SQW"
          },
          {
            "nome": "32K"
          }
        ]
      }
    ]
  },
  {
    "id": "HMI",
    "nome": "IHM — configura o ciclo, INICIAR, e grava o log no SD",
    "porta": true,
    "resumoFuncao": "🔎 O QUE ELA FAZ: e por onde o operador trabalha. Configura o ciclo, aperta INICIAR, ve temperatura e estado, e grava o log no cartao SD. ⭐ O INICIAR dela liga o PID e o PWM — NAO arma a potencia. Quem arma e o botao verde da porta.",
    "x": 70,
    "y": 40,
    "largura": 50,
    "altura": 86,
    "cor": "#1971c2",
    "nota": "⚠️ Recorte da porta 47 × 61 mm, EM RETRATO. Reserve 25 mm livres atrás.",
    "grupos": [
      {
        "ref": "UART",
        "lado": "baixo",
        "legenda": "Conector UART (4)",
        "pinos": [
          {
            "nome": "5V"
          },
          {
            "nome": "GND-UART",
            "usa": true,
            "para": "CONV · GND-LV"
          },
          {
            "nome": "TXD · IO44",
            "usa": true,
            "para": "CONV · RXI"
          },
          {
            "nome": "RXD · IO43",
            "usa": true,
            "para": "CONV · TXO"
          }
        ]
      },
      {
        "ref": "I2C",
        "lado": "cima",
        "legenda": "Conector I²C (4)",
        "pinos": [
          {
            "nome": "3V3",
            "usa": true,
            "para": "CONV · LV"
          },
          {
            "nome": "GND-I2C"
          },
          {
            "nome": "SDA · IO16"
          },
          {
            "nome": "SCL · IO15"
          }
        ]
      },
      {
        "ref": "EXP",
        "lado": "cima",
        "legenda": "Expansão (4)",
        "pinos": [
          {
            "nome": "IO2"
          },
          {
            "nome": "IO3"
          },
          {
            "nome": "IO14"
          },
          {
            "nome": "IO21"
          }
        ]
      },
      {
        "ref": "BAT",
        "lado": "baixo",
        "legenda": "Bateria (2)",
        "pinos": [
          {
            "nome": "BAT+"
          },
          {
            "nome": "BAT−"
          }
        ]
      },
      {
        "ref": "USB",
        "lado": "esquerda",
        "legenda": "Type-C — o +5 V e o 0 V dele (2)",
        "parAlim": true,
        "pinos": [
          {
            "nome": "VBUS",
            "usa": true,
            "para": "BD-5V · O2"
          },
          {
            "nome": "GND-PWR",
            "usa": true,
            "para": "BD-0V · Z9"
          }
        ]
      }
    ],
    "avisos": [
      "🔥 NÃO ligue o pino 5 V do conector UART. A wiki lista só Type-C e bateria como entradas de alimentação — esse pino é provavelmente saída.",
      "🔋 Deixe o conector BAT vazio. Lítio dentro de painel fechado é risco sem contrapartida."
    ]
  },
  {
    "id": "CONV",
    "nome": "CONV — adapta 5 V ↔ 3,3 V entre o Mega e a IHM",
    "porta": true,
    "resumoFuncao": "🔎 O QUE ELE FAZ: o Mega fala em 5 V e a tela IHM so aguenta 3,3 V. Sem este tradutor no meio, o pino RXD da tela se degrada — e o pior e que parece funcionar no comeco, porque os diodos internos de protecao grampeiam a tensao.",
    "x": 134,
    "y": 44,
    "largura": 34,
    "altura": 22,
    "cor": "#7048e8",
    "escala": "ampliado — a placa real tem 14,7 × 12,7 mm",
    "nota": "Monta atrás da tela, em espaçadores de nylon. ⚠️ No desenho ele está ampliado: a placa real tem 14,7 × 12,7 mm e os pinos ficariam menores que a letra.",
    "grupos": [
      {
        "ref": "HV",
        "lado": "cima",
        "legenda": "Lado alto — 5 V (6)",
        "pinos": [
          {
            "nome": "TXI",
            "usa": true,
            "para": "MEGA · D16"
          },
          {
            "nome": "HV",
            "usa": true,
            "para": "BD-5V · O7"
          },
          {
            "nome": "GND-HV",
            "usa": true,
            "para": "BD-0V · Z10"
          },
          {
            "nome": "RXO",
            "usa": true,
            "para": "MEGA · D17"
          },
          {
            "nome": "TXI2"
          },
          {
            "nome": "RXO2"
          }
        ]
      },
      {
        "ref": "LV",
        "lado": "baixo",
        "legenda": "Lado baixo — 3,3 V (6)",
        "pinos": [
          {
            "nome": "TXO",
            "usa": true,
            "para": "HMI · RXD · IO43"
          },
          {
            "nome": "LV",
            "usa": true,
            "para": "HMI · 3V3"
          },
          {
            "nome": "GND-LV",
            "usa": true,
            "para": "HMI · GND-UART"
          },
          {
            "nome": "RXI",
            "usa": true,
            "para": "HMI · TXD · IO44"
          },
          {
            "nome": "TXO2"
          },
          {
            "nome": "RXI2"
          }
        ]
      }
    ],
    "avisos": [
      "⚠️ Cada canal é UNIDIRECIONAL. TXI→TXO leva de cima para baixo, RXI→RXO de baixo para cima. Trocar não queima, mas não comunica."
    ]
  },
  {
    "id": "H1",
    "nome": "Sinaleiro H1 — ENERGIZADO",
    "porta": true,
    "resumoFuncao": "🔎 O QUE ELE MOSTRA: ENERGIZADO. ⭐ Sao de 5 V e o pino do Arduino os acende DIRETO — nao ha CI, rele nem resistor no meio. O vermelho de FALHA continua aceso com a emergencia acionada porque o BD-5V nao cai: quem alimenta o Arduino sobrevive ao cogumelo, e e o Arduino que segura o pino em nivel alto.",
    "x": 52,
    "y": 175,
    "largura": 30,
    "altura": 30,
    "cor": "#2f9e44",
    "grupos": [
      {
        "ref": "LMP",
        "lado": "baixo",
        "legenda": "Sinaleiro 22 mm · 5 V (2)",
        "pinos": [
          {
            "nome": "+",
            "usa": true,
            "para": "MEGA · D9"
          },
          {
            "nome": "−",
            "usa": true,
            "para": "H2 · −"
          }
        ]
      }
    ],
    "avisos": [
      "⚠️ 20 mA é o limite recomendado do pino do Mega. Meça o sinaleiro com fonte de bancada antes de ligar (passo A-02): se puxar mais que isso, ele não pode ir direto no pino."
    ]
  },
  {
    "id": "H2",
    "nome": "Sinaleiro H2 — RESFRIANDO",
    "porta": true,
    "resumoFuncao": "🔎 O QUE ELE MOSTRA: RESFRIANDO. ⭐ Sao de 5 V e o pino do Arduino os acende DIRETO — nao ha CI, rele nem resistor no meio. O vermelho de FALHA continua aceso com a emergencia acionada porque o BD-5V nao cai: quem alimenta o Arduino sobrevive ao cogumelo, e e o Arduino que segura o pino em nivel alto.",
    "x": 94,
    "y": 175,
    "largura": 30,
    "altura": 30,
    "cor": "#1971c2",
    "grupos": [
      {
        "ref": "LMP",
        "lado": "baixo",
        "legenda": "Sinaleiro 22 mm · 5 V (2)",
        "pinos": [
          {
            "nome": "+",
            "usa": true,
            "para": "MEGA · D10"
          },
          {
            "nome": "−",
            "usa": true,
            "para": "H1 · −; H3 · −"
          }
        ]
      }
    ],
    "avisos": [
      "⚠️ 20 mA é o limite recomendado do pino do Mega. Meça o sinaleiro com fonte de bancada antes de ligar (passo A-02): se puxar mais que isso, ele não pode ir direto no pino."
    ]
  },
  {
    "id": "H3",
    "nome": "Sinaleiro H3 — AQUECENDO",
    "porta": true,
    "resumoFuncao": "🔎 O QUE ELE MOSTRA: AQUECENDO. ⭐ Sao de 5 V e o pino do Arduino os acende DIRETO — nao ha CI, rele nem resistor no meio. O vermelho de FALHA continua aceso com a emergencia acionada porque o BD-5V nao cai: quem alimenta o Arduino sobrevive ao cogumelo, e e o Arduino que segura o pino em nivel alto.",
    "x": 136,
    "y": 175,
    "largura": 30,
    "altura": 30,
    "cor": "#e8590c",
    "grupos": [
      {
        "ref": "LMP",
        "lado": "baixo",
        "legenda": "Sinaleiro 22 mm · 5 V (2)",
        "pinos": [
          {
            "nome": "+",
            "usa": true,
            "para": "MEGA · D11"
          },
          {
            "nome": "−",
            "usa": true,
            "para": "H2 · −; H4 · −"
          }
        ]
      }
    ],
    "avisos": [
      "⚠️ 20 mA é o limite recomendado do pino do Mega. Meça o sinaleiro com fonte de bancada antes de ligar (passo A-02): se puxar mais que isso, ele não pode ir direto no pino."
    ]
  },
  {
    "id": "H4",
    "nome": "Sinaleiro H4 — FALHA",
    "porta": true,
    "resumoFuncao": "🔎 O QUE ELE MOSTRA: FALHA. ⭐ Sao de 5 V e o pino do Arduino os acende DIRETO — nao ha CI, rele nem resistor no meio. O vermelho de FALHA continua aceso com a emergencia acionada porque o BD-5V nao cai: quem alimenta o Arduino sobrevive ao cogumelo, e e o Arduino que segura o pino em nivel alto.",
    "x": 178,
    "y": 175,
    "largura": 30,
    "altura": 30,
    "cor": "#c92a2a",
    "grupos": [
      {
        "ref": "LMP",
        "lado": "baixo",
        "legenda": "Sinaleiro 22 mm · 5 V (2)",
        "pinos": [
          {
            "nome": "+",
            "usa": true,
            "para": "MEGA · D12"
          },
          {
            "nome": "−",
            "usa": true,
            "para": "H3 · −; MEGA · GND2"
          }
        ]
      }
    ],
    "avisos": [
      "⚠️ 20 mA é o limite recomendado do pino do Mega. Meça o sinaleiro com fonte de bancada antes de ligar (passo A-02): se puxar mais que isso, ele não pode ir direto no pino."
    ]
  },
  {
    "id": "S1",
    "nome": "S1 · LIGAR (verde) — arma a potência, NÃO inicia o ensaio",
    "porta": true,
    "resumoFuncao": "🔎 O QUE ELE FAZ: ARMA A POTENCIA. Refaz o selo do KM1 e traz os 24 V de volta ao BD-POT — somente após o reconhecimento da falha e a liberação das travas aplicáveis. ⭐ Ele NAO inicia o ensaio — isso e o INICIAR da tela IHM. E o Arduino nem o le: nao ha fio dele ate pino nenhum. O firmware confirma a tensao pelo V1 do N4AIC24 via Modbus.",
    "x": 147,
    "y": 250,
    "largura": 30,
    "altura": 30,
    "cor": "#2f9e44",
    "nota": "⭐ Bloco de 24 V, na cadeia de comando — NÃO é um botão de sinal. Ele ARMA a potência refazendo o selo do KM1. O Arduino nem o lê.",
    "grupos": [
      {
        "ref": "NA24",
        "lado": "baixo",
        "legenda": "Bloco NA de 24 V — contatos 13-14",
        "pinos": [
          {
            "nome": "13",
            "usa": true,
            "para": "S2 · 12; KM1 · 21"
          },
          {
            "nome": "14",
            "usa": true,
            "para": "KM1 · A1"
          }
        ]
      }
    ],
    "avisos": [
      "⭐ ELE ARMA A POTÊNCIA, NÃO INICIA O ENSAIO. São duas coisas diferentes e com nomes parecidos: o VERDE traz os 24 V de volta ao BD-POT (hardware); o INICIAR da tela IHM liga o PID e o PWM (software). Etiquete-o como LIGAR para o operador não confundir.",
      "⭐ ELE TAMBÉM É O REARME DA EMERGÊNCIA, e é por isso que o botão azul deixou de existir. Destravar o cogumelo não religa nada — quem religa é este botão, e é ele o ato deliberado que a ISO 13850 exige. Um botão a menos e uma pergunta a menos: depois de QUALQUER parada, a resposta é sempre \"aperte o verde\".",
      "📌 UM BLOCO SÓ, e de 24 V. Diferente do S2, este botão não tem contato de 5 V: o Arduino confirma que a potência voltou pelo V1 do N4AIC24 via Modbus."
    ]
  },
  {
    "id": "S2",
    "nome": "S2 · STOP (preto) — corta a potência E avisa o Arduino",
    "porta": true,
    "resumoFuncao": "❓ E AQUI QUE O ARDUINO DESCOBRE QUE APERTARAM O STOP. O botao tem DOIS blocos de contato empilhados atras da mesma pastilha plastica, acionados pelo mesmo dedo — mas eletricamente SEPARADOS. O bloco de 24 V (11-12) derruba o selo do KM1 e corta a potencia sem o Arduino participar de nada. O bloco de 5 V (13-14) fecha para o 0 V no pino D23, e e SO por ele que o firmware fica sabendo. Um botao, dois circuitos que nao se tocam.",
    "x": 57,
    "y": 250,
    "largura": 30,
    "altura": 30,
    "cor": "#212529",
    "nota": "⭐ AQUI ESTÁ A RESPOSTA PARA \"como o Arduino sabe que apertaram o STOP?\". O botão tem DOIS blocos de contato, empilhados atrás do mesmo cogumelo plástico e acionados pelo mesmo dedo — mas eletricamente SEPARADOS. O de 24 V derruba o selo do KM1 (hardware, o Arduino nem participa); o de 5 V fecha para o 0 V no pino D23 e é por ele que o firmware fica sabendo. Um botão, dois circuitos que não se tocam.",
    "grupos": [
      {
        "ref": "NF24",
        "lado": "baixo",
        "legenda": "Bloco NF de 24 V — contatos 11-12",
        "pinos": [
          {
            "nome": "11",
            "usa": true,
            "para": "S0 · 12"
          },
          {
            "nome": "12",
            "usa": true,
            "para": "S1 · 13"
          }
        ]
      },
      {
        "ref": "NA5",
        "lado": "cima",
        "legenda": "Bloco NA de 5 V — contatos 13-14",
        "pinos": [
          {
            "nome": "13",
            "usa": true,
            "para": "BD-0V-B · Z18; S0 · 21"
          },
          {
            "nome": "14",
            "usa": true,
            "para": "MEGA · D23"
          }
        ]
      }
    ],
    "avisos": [
      "🔥 NÃO CONFUNDA OS DOIS BLOCOS. O de 24 V (11-12) é o que corta de verdade; o de 5 V (13-14) só avisa. Ligar o Arduino no bloco de 24 V queima o pino D23 na hora; ligar a cadeia no bloco de 5 V deixa o STOP sem efeito nenhum em hardware. É o erro nº 1 do Doc 31 §31.5.",
      "⚠️ O bloco chaveia para o 0 V, NÃO para o 5 V. Com INPUT_PULLUP o Arduino já segura o pino em 5 V por dentro — ligado ao 5 V o pino lê HIGH apertado ou não, e o STOP nunca acontece."
    ]
  },
  {
    "id": "S0",
    "nome": "S0 · EMERGÊNCIA — corta tudo em hardware e trava",
    "porta": true,
    "resumoFuncao": "🔎 O QUE ELE FAZ: derruba o selo do KM1 e, com ele, TUDO. Corta em hardware puro, sem uma linha de firmware no caminho, e TRAVA: destravar o cogumelo nao devolve energia nenhuma, porque o selo ja se perdeu e nada o refaz sozinho — so o LIGAR verde. O segundo bloco, de 5 V, avisa o pino D24 — mas so para o firmware registrar no log e mostrar na tela. Ele nao participa do corte.",
    "x": 142,
    "y": 330,
    "largura": 44,
    "altura": 44,
    "cor": "#c92a2a",
    "nota": "Cogumelo com trava. Dois blocos NF: um corta a potência, o outro avisa o Arduino.",
    "grupos": [
      {
        "ref": "NF24",
        "lado": "cima",
        "legenda": "Bloco NF de 24 V — contatos 11-12",
        "pinos": [
          {
            "nome": "11",
            "usa": true,
            "para": "BD-24V · O2"
          },
          {
            "nome": "12",
            "usa": true,
            "para": "S2 · 11"
          }
        ]
      },
      {
        "ref": "NF5",
        "lado": "baixo",
        "legenda": "Bloco NF de 5 V — contatos 21-22",
        "pinos": [
          {
            "nome": "21",
            "usa": true,
            "para": "S2 · 13"
          },
          {
            "nome": "22",
            "usa": true,
            "para": "MEGA · D24"
          }
        ]
      }
    ]
  },
  {
    "id": "Q0",
    "nome": "Q0 — seccionamento/proteção AC",
    "trilho": 4,
    "largura": 36,
    "altura": 80,
    "x": 48,
    "cor": "#426d82",
    "grupos": [
      {
        "ref": "ENTRADA AC",
        "lado": "esquerda",
        "legenda": "ENTRADA AC",
        "pinos": [
          {
            "nome": "L_IN",
            "usa": true,
            "para": "entrada AC-IN"
          },
          {
            "nome": "N_IN",
            "usa": true,
            "para": "entrada AC-IN"
          }
        ],
        "canais": [
          "CV-ac"
        ]
      },
      {
        "ref": "SAÍDA AC",
        "lado": "cima",
        "legenda": "SAÍDA AC",
        "pinos": [
          {
            "nome": "L_OUT",
            "usa": true,
            "para": "PS1 · L"
          },
          {
            "nome": "N_OUT",
            "usa": true,
            "para": "PS1 · N"
          }
        ],
        "canais": [
          "CH-ac"
        ]
      }
    ],
    "nota": "Proteção bipolar conforme tensão, corrente de entrada e inrush da fonte real. O antigo 2P C6 é referência preliminar, não dimensionamento final. Instalação AC por profissional habilitado; sem neutro presumido em rede 220 V fase-fase."
  },
  {
    "id": "PS1",
    "nome": "PS1 — fonte AC/DC 24 V · 10 A · 240 W",
    "trilho": 4,
    "largura": 240,
    "altura": 120,
    "x": 96,
    "cor": "#426d82",
    "grupos": [
      {
        "ref": "REDE / PE",
        "lado": "cima",
        "legenda": "REDE / PE",
        "pinos": [
          {
            "nome": "L",
            "usa": true,
            "para": "Q0 · L_OUT"
          },
          {
            "nome": "N",
            "usa": true,
            "para": "Q0 · N_OUT"
          },
          {
            "nome": "PE",
            "usa": true,
            "para": "PE · PS1"
          }
        ],
        "canais": [
          "CH-ac"
        ]
      },
      {
        "ref": "SAÍDA DC",
        "lado": "baixo",
        "legenda": "SAÍDA DC",
        "pinos": [
          {
            "nome": "+24V",
            "usa": true,
            "para": "F-R · F1_IN; F-R · F2_IN; F-R · F3_IN"
          },
          {
            "nome": "0V",
            "usa": true,
            "para": "BD-0V · IN"
          }
        ],
        "canais": [
          "CH-base"
        ]
      }
    ],
    "nota": "Fonte única de 24 V dentro do painel, com bornes AC protegidos e fixação adequada. Envelope reservado de 240 × 120 mm, confirmar na peça e manter folgas do fabricante. Não alimentar lógica em 24 V."
  },
  {
    "id": "F-R",
    "nome": "F1/F2/F3 — proteção dos três ramais DC",
    "trilho": 4,
    "largura": 54,
    "altura": 70,
    "x": 348,
    "cor": "#426d82",
    "grupos": [
      {
        "ref": "ENTRADAS 24 V",
        "lado": "baixo",
        "legenda": "ENTRADAS 24 V",
        "pinos": [
          {
            "nome": "F1_IN",
            "usa": true,
            "para": "PS1 · +24V"
          },
          {
            "nome": "F2_IN",
            "usa": true,
            "para": "PS1 · +24V"
          },
          {
            "nome": "F3_IN",
            "usa": true,
            "para": "PS1 · +24V"
          }
        ],
        "canais": [
          "CH-base"
        ]
      },
      {
        "ref": "SAÍDAS PROTEGIDAS",
        "lado": "cima",
        "legenda": "SAÍDAS PROTEGIDAS",
        "pinos": [
          {
            "nome": "F1_OUT",
            "usa": true,
            "para": "KM1 · 11"
          },
          {
            "nome": "F2_OUT",
            "usa": true,
            "para": "BD-24V · IN; T2 · IN+"
          },
          {
            "nome": "F3_OUT",
            "usa": true,
            "para": "T3 · IN+"
          }
        ],
        "canais": [
          "CH-1x4"
        ]
      }
    ],
    "nota": "F1: ramal 24 V da Peltier (10 A). F2: entrada T2 (5 A). F3: entrada T3 (15-20 A). Proteções dos ramais DC aprovadas."
  },
  {
    "id": "T2",
    "nome": "T2 — Conversor Step-Down 24 Vcc → 5,0 Vcc / 5 A (Lógica e Sensores)",
    "trilho": 4,
    "largura": 85,
    "altura": 60,
    "x": 414,
    "cor": "#426d82",
    "grupos": [
      {
        "ref": "ENTRADA DC",
        "lado": "cima",
        "legenda": "ENTRADA DC",
        "pinos": [
          {
            "nome": "IN+",
            "usa": true,
            "para": "F-R · F2_OUT"
          },
          {
            "nome": "IN-",
            "usa": true,
            "para": "BD-0V · Z6"
          }
        ],
        "canais": [
          "CH-1x4"
        ]
      },
      {
        "ref": "SAÍDA REGULADA",
        "lado": "baixo",
        "legenda": "SAÍDA REGULADA",
        "pinos": [
          {
            "nome": "OUT+",
            "usa": true,
            "para": "BD-5V · IN"
          },
          {
            "nome": "OUT-"
          }
        ],
        "canais": [
          "CH-base"
        ]
      }
    ],
    "nota": "Conversor Step-Down chaveado aprovado. Entrada 24 Vcc (PS1 via F2), saída 5,0 Vcc regulada / 5 A contínuos para barramento BD-5V (Arduino Mega, ESP32, Placa de 8 relés, IHM, RTC, MAX485 e sensores).",
    "avisos": [
      "Topologia de retorno depende do conversor escolhido; não presumir isolação nem pinagem antes de conferir a ficha."
    ]
  },
  {
    "id": "T3",
    "nome": "T3 — Conversor Step-Down 24 Vcc → 12,0 Vcc / 15–20 A (Cargas 12V e Ventilação)",
    "trilho": 4,
    "largura": 85,
    "altura": 60,
    "x": 511,
    "cor": "#426d82",
    "grupos": [
      {
        "ref": "ENTRADA DC",
        "lado": "cima",
        "legenda": "ENTRADA DC",
        "pinos": [
          {
            "nome": "IN+",
            "usa": true,
            "para": "F-R · F3_OUT"
          },
          {
            "nome": "IN-",
            "usa": true,
            "para": "BD-0V · Z11"
          }
        ],
        "canais": [
          "CH-1x4"
        ]
      },
      {
        "ref": "SAÍDA REGULADA",
        "lado": "baixo",
        "legenda": "SAÍDA REGULADA",
        "pinos": [
          {
            "nome": "OUT+",
            "usa": true,
            "para": "BD-AUX · IN"
          },
          {
            "nome": "OUT+2",
            "usa": true,
            "para": "BD-12V · IN"
          },
          {
            "nome": "OUT-"
          }
        ],
        "canais": [
          "CH-base"
        ]
      }
    ],
    "nota": "Proposta de conversor, sem modelo aprovado. Exigir ficha de corrente contínua, faixa de entrada, proteções e condições térmicas antes de comprar.",
    "avisos": [
      "Não presumir que entradas e saídas são isoladas ou que os bornes repetidos são equivalentes sem verificar a ficha do modelo.",
      "BD-AUX permanente continua para ventoinhas e serviços. O ramal do PTC deve ser separado, com corte DC e proteção definidos; não conectá-lo diretamente a esta saída."
    ]
  },
  {
    "id": "PE",
    "nome": "PE — barra de proteção",
    "trilho": 4,
    "largura": 30,
    "altura": 60,
    "x": 608,
    "cor": "#426d82",
    "grupos": [
      {
        "ref": "TERRA DE PROTEÇÃO",
        "lado": "cima",
        "legenda": "TERRA DE PROTEÇÃO",
        "pinos": [
          {
            "nome": "IN",
            "usa": true,
            "para": "entrada AC-IN"
          },
          {
            "nome": "PS1",
            "usa": true,
            "para": "PS1 · PE"
          },
          {
            "nome": "FRAME"
          },
          {
            "nome": "DOOR"
          }
        ],
        "canais": [
          "CH-ac"
        ]
      }
    ],
    "nota": "PE vindo da rede, ligado à carcaça da fonte e às partes metálicas acessíveis, inclusive porta por condutor flexível. Não é o barramento 0 V. Ligação PE/0 V somente se o projeto e fabricante a exigirem."
  }
];
export const FOLGA_LATERAL=8;
export const LATERAIS=[
  {
    "id": "ANT",
    "nome": "Antena Wi-Fi 3 dBi + conector SMA de painel",
    "face": "direita",
    "x": 100,
    "y": 430,
    "furo": 6.5,
    "cor": "#e8590c",
    "porque": "🔥 A caixa do painel é uma GAIOLA DE FARADAY. Com o ESP32 lá dentro e a antena junto dele, o sinal de Wi-Fi fica preso: o alcance despenca e o MQTT cai sozinho no meio do ensaio. A antena TEM que ficar do lado de fora.",
    "onde": "Lateral DIREITA, a 100 mm da traseira e 430 mm de altura — o mais alto possível, para não ser obstruída pela bancada nem pelas pessoas.",
    "avisos": [
      "⚠️ NA LATERAL, NUNCA NA PORTA. A porta articula, e o coaxial teria que dobrar a cada abertura. Cabo coaxial não suporta ciclos de flexão — ele rompe por dentro e o defeito fica intermitente.",
      "🔥 NUNCA PASSE O COAXIAL POR PRENSA-CABO. O pigtail IPEX é de 1,13 mm: o aperto esmaga o dielétrico, a impedância deixa de ser 50 Ω e o alcance despenca. O conector SMA de painel existe exatamente para isso — ele é preso mecanicamente na chapa e não faz esforço no cabo.",
      "📌 O ESP32 tem que ser o WROOM-32U, que traz conector IPEX. O WROOM-32 comum só tem antena de placa e NÃO aceita antena externa.",
      "⭐ O DNLCB30 está no trilho 2, do lado direito — o pigtail de 30 cm chega folgado."
    ]
  }
];
export const PLACA={
  "x": 12,
  "y": 14,
  "largura": 676,
  "altura": 672
};
export const REGRA_SEGREGACAO={
  "titulo": "Por que potência e sinal não podem dividir canaleta",
  "texto": "O PWM das cargas e a comutação das bobinas podem induzir ruído nas medições e nos barramentos. Separar rede AC, potência DC e sinais; cruzar trajetos somente quando necessário e manter o par A/B trançado. A frequência do PWM depende do firmware validado.",
  "quemSofre": [
    "IS dos BTS → entradas analógicas do Mega: manter longe da potência",
    "1-Wire do DS18B20: pulsos de microssegundos, corrompe fácil",
    "I²C do RTC e do sensor da câmara: o barramento trava se pegar ruído"
  ],
  "quemPolui": [
    "Saída dos BTS para a Peltier e o PTC: 6 A chaveados",
    "Entrada de 24 V dos BTS: a corrente vem em pulsos, não contínua",
    "Bobina do relé KM1: dá um pico ao desligar"
  ],
  "classes": [
    {
      "id": "potencia",
      "nome": "POLUI",
      "cor": "vermelha",
      "quem": "saída dos BTS, entrada de 24 V deles, bobinas dos relés",
      "onde": "só canaleta de potência"
    },
    {
      "id": "sinal",
      "nome": "SOFRE",
      "cor": "azul",
      "quem": "IS analógico, 1-Wire, I²C, saída digital do sensor de corrente",
      "onde": "só canaleta de sinal"
    },
    {
      "id": "alim",
      "nome": "NEM UM NEM OUTRO",
      "cor": "qualquer",
      "quem": "trilhos de 5 V e 12 V, amostras de 24 V para divisor, COM do ULN",
      "onde": "a canaleta que der o caminho mais curto — cruzando a 90° quando precisar trocar de lado"
    },
    {
      "id": "comum",
      "nome": "O 0 V",
      "cor": "qualquer",
      "quem": "todos os retornos",
      "onde": "por onde for mais curto — ele é único"
    }
  ],
  "regras": [
    "Canaleta VERMELHA só o que POLUI, canaleta AZUL só o que SOFRE.",
    "Alimentação limpa e o 0 V andam por qualquer uma — o que importa é não deixar o que polui ao lado do que sofre.",
    "Se um cabo de sinal precisar cruzar um de potência, cruze a 90°. Cruzamento perpendicular quase não acopla; paralelo lado a lado é o pior caso.",
    "Cabo de sinal longo e solto vira antena. Prenda-o na canaleta em vez de deixar sobra enrolada.",
    "O 0 V não separa: ele é único e vai por onde for mais curto."
  ]
};
export const TRILHOS=[
  {
    "n": 3,
    "y": 125,
    "nome": "TRILHO 3 — Controle e Medição"
  },
  {
    "n": 2,
    "y": 255,
    "nome": "TRILHO 2 — Potência"
  },
  {
    "n": 1,
    "y": 385,
    "nome": "TRILHO 1 — Distribuição"
  },
  {
    "n": 4,
    "y": 590,
    "nome": "TRILHO 4 — Alimentação interna e proteção"
  }
];
export const TRILHO_X0=42;
export const TRILHO_X1=658;
export function canaletaDoGrupo(comp,grupo){
 if(grupo.canais)return grupo.canais;
 const ks=(comp.porta?CANALETAS_PORTA:CANALETAS).filter(k=>!k.vertical&&!['CH-ac'].includes(k.id));
 const t=TRILHOS.find(x=>x.n===comp.trilho);const top=comp.porta?comp.y:t.y-comp.altura/2;const bottom=top+comp.altura;
 const up=ks.filter(k=>k.y+k.h<=top+1).sort((a,b)=>b.y-a.y)[0];const down=ks.filter(k=>k.y>=bottom-1).sort((a,b)=>a.y-b.y)[0];
 return(grupo.lado==='cima'?[up]:grupo.lado==='baixo'?[down]:[up,down]).filter(Boolean).map(k=>k.id);
}
