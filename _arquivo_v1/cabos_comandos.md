# ETAPA 6 — Comando, Sensores e Sinais

> Sexta etapa: toda a **fiação de baixo nível (sinais)** — pinout do Arduino, drivers BTS7960, sensores (DS18B20, AM2315C, RTC, SD), comunicação serial, botões, LEDs e monitoramento de RPM. Use cabos finos (0.25 mm²) e **curtos** nas linhas sensíveis.
>
> Pré‑requisito: a [ETAPA 5 — Força](cabos_forca.md) já feita (bornes 5V/12V/GND e star ground prontos).

---

## 6.1 Pinout Completo — Arduino Mega 2560

### Comunicação serial

| UART | TX / RX | Destino | Baud | Obs |
|---|---|---|---|---|
| Serial 0 | D1 / D0 | USB (debug no PC) | — | Não usar para nada além de debug |
| **Serial 1** | D18 / D19 | DNLCB30 → ESP32 | 115200 | JSON de telemetria; conversão 5 V↔3.3 V automática na DNLCB30 |
| **Serial 2** | D16 / D17 | Nextion NX4024T032 | 9600 | Nextion aceita 5 V direto |

### BTS7960 #1 — Peltier (modo frio)

| Pino Mega | Pino BTS7960 | Função |
|---|---|---|
| D5 (PWM) | RPWM | Duty cycle do PID (PWM 1 Hz) |
| D4 | R_EN | Enable (HIGH = ativo) |
| GND | LPWM | Fixo em LOW |
| GND | L_EN | Fixo em LOW |
| A0 | R_IS | Diagnóstico de corrente (ADC) — **cap 100 nF p/ GND** |
| 5 V | VCC | Alimentação lógica do opto |

### BTS7960 #2 — PTC (modo quente)

| Pino Mega | Pino BTS7960 | Função |
|---|---|---|
| D6 (PWM) | RPWM | Duty cycle do PID (PWM 1 Hz) |
| D7 | R_EN | Enable |
| GND | LPWM | Fixo em LOW |
| GND | L_EN | Fixo em LOW |
| A1 | R_IS | Diagnóstico de corrente (ADC) — **cap 100 nF p/ GND** |
| 5 V | VCC | Alimentação lógica do opto |

> Os dois BTS usam só o lado **R** (RPWM/R_EN). LPWM/L_EN ficam em GND porque a carga é unidirecional (não precisa inverter).

### Sensores, SD, RTC e RPM

| Pino Mega | Dispositivo | Detalhe |
|---|---|---|
| D2 | **DS18B20** (1‑Wire) — centro da câmara | Pull‑up **4.7 kΩ** entre DATA e +5 V |
| D13 | **RPM do cooler externo** (fio amarelo) | `INPUT_PULLUP` — conta pulsos do tacômetro |
| D20 (SDA) | **AM2315C + DS3231** (I²C) | Barramento I²C compartilhado (endereços 0x38 e 0x68) |
| D21 (SCL) | **AM2315C + DS3231** (I²C) | Barramento I²C compartilhado |
| D50 (MISO) | Módulo Micro SD | SPI hardware |
| D51 (MOSI) | Módulo Micro SD | SPI hardware |
| D52 (SCK) | Módulo Micro SD | SPI hardware |
| D53 (SS/CS) | Módulo Micro SD | Chip Select |

### Botões e LEDs

| Pino Mega | Dispositivo | Detalhe |
|---|---|---|
| D22 | Botão START (NA) | `INPUT_PULLUP` — fecha p/ GND |
| D23 | Botão STOP (NF) | `INPUT_PULLUP` |
| D24 | Emergência (contato 2 do cogumelo) | `INPUT_PULLUP` — sinal de software |
| D9 | LED Verde (RUN) | resistor 220 Ω em série |
| D10 | LED Azul (COOL) | resistor 220 Ω em série |
| D11 | LED Amarelo (HEAT) | resistor 220 Ω em série |
| D12 | LED Vermelho (FAULT) | resistor 220 Ω em série |

---

## 6.2 Sinais BTS7960 → Arduino (fiação)

| Cabo | Seção | De → Para |
|---|---|---|
| BTS #1 RPWM | 0.25 mm² | Arduino D5 → BTS #1 RPWM |
| BTS #1 R_EN | 0.25 mm² | Arduino D4 → BTS #1 R_EN |
| BTS #1 LPWM | 0.25 mm² | Arduino GND → BTS #1 LPWM (fixo LOW) |
| BTS #1 L_EN | 0.25 mm² | Arduino GND → BTS #1 L_EN (fixo LOW) |
| BTS #1 R_IS | 0.25 mm² | BTS #1 R_IS → Arduino A0 + **cap 100 nF → GND** |
| BTS #1 VCC | 0.25 mm² | Borne 5V → BTS #1 VCC lógica |
| BTS #2 RPWM | 0.25 mm² | Arduino D6 → BTS #2 RPWM |
| BTS #2 R_EN | 0.25 mm² | Arduino D7 → BTS #2 R_EN |
| BTS #2 LPWM | 0.25 mm² | Arduino GND → BTS #2 LPWM (fixo LOW) |
| BTS #2 L_EN | 0.25 mm² | Arduino GND → BTS #2 L_EN (fixo LOW) |
| BTS #2 R_IS | 0.25 mm² | BTS #2 R_IS → Arduino A1 + **cap 100 nF → GND** |
| BTS #2 VCC | 0.25 mm² | Borne 5V → BTS #2 VCC lógica |

> **Filtro IS:** o capacitor de 100 nF entre o pino IS e GND (junto ao Arduino) suaviza o ruído de chaveamento antes do ADC, dando uma leitura de corrente estável.

---

## 6.3 Comunicação Serial (cabos curtos < 20 cm)

| Cabo | De → Para | Obs |
|---|---|---|
| TX1 | Arduino D18 → DNLCB30 RX | JSON 115200 |
| RX1 | Arduino D19 ← DNLCB30 TX | — |
| TX2 | Arduino D16 → Nextion RX (verde) | Nextion 9600 |
| RX2 | Arduino D17 ← Nextion TX (amarelo) | — |

> Mantenha o ESP32 (DNLCB30) **ao lado** do Arduino no trilho para o cabo Serial1 ficar curto e livre de interferência.

---

## 6.4 Botões e LEDs (fiação)

| Cabo | De → Para |
|---|---|
| START sinal | Arduino D22 → Botão START pino 1 |
| START retorno | Botão START pino 2 → Borne GND‑CENTRAL |
| STOP sinal | Arduino D23 → Botão STOP pino 1 |
| STOP retorno | Botão STOP pino 2 → Borne GND‑CENTRAL |
| EMERG feedback | Arduino D24 → Cogumelo contato 2 pino 1 |
| EMERG retorno | Cogumelo contato 2 pino 2 → Borne GND‑CENTRAL |
| LED verde | Arduino D9 → 220 Ω → LED → GND |
| LED azul | Arduino D10 → 220 Ω → LED → GND |
| LED amarelo | Arduino D11 → 220 Ω → LED → GND |
| LED vermelho | Arduino D12 → 220 Ω → LED → GND |

> Todos os botões usam `INPUT_PULLUP`: em repouso o pino lê HIGH; ao acionar, fecha para GND e lê LOW (exceto a emergência, cuja lógica está descrita na [ETAPA 7](firmware.md)).

---

## 6.5 Cabos Painel → Câmara (pela canaleta)

São **13 fios** — separe em 2 grupos na canaleta.

### Grupo A — Potência (fios grossos, lado esquerdo)

| Fio | Seção | Cor | De → Para |
|---|---|---|---|
| BTS #1 OUT+ | 1.5 mm² | Vermelho | BTS #1 saída M+ → Borne câmara **12V‑FRIO** |
| BTS #1 OUT− | 1.5 mm² | Preto | BTS #1 saída M− → Borne câmara **GND‑FRIO** |
| BTS #2 OUT+ | 1.5 mm² | Laranja | BTS #2 saída M+ → Borne câmara **12V‑QUENTE** |
| BTS #2 OUT− | 1.5 mm² | Preto | BTS #2 saída M− → Borne câmara **GND‑QUENTE** |
| Cooler ext 12 V | 0.5 mm² | Vermelho | Borne 12V‑FAN → cooler externo Peltier **+** |
| Cooler ext GND | 0.5 mm² | Preto | Borne GND‑CENTRAL → cooler externo Peltier **−** |
| Cooler ext RPM | 0.25 mm² | Amarelo | Cooler externo (tacômetro) → Arduino **D13** |

### Grupo B — Sinais (fios finos, lado direito)

| Fio | Seção | Cor | De → Para |
|---|---|---|---|
| 1‑Wire VCC | 0.25 mm² | Vermelho | Borne 5V → DS18B20 VCC |
| 1‑Wire DATA | 0.25 mm² | Amarelo | Arduino D2 → DS18B20 DATA + **pull‑up 4.7 kΩ → 5V** |
| 1‑Wire GND | 0.25 mm² | Preto | Borne GND → DS18B20 GND |
| I²C VCC | 0.25 mm² | Vermelho | Borne **5V** → AM2315C VCC + DS3231 VCC (paralelo) |
| I²C SDA | 0.25 mm² | Azul | Arduino D20 → AM2315C SDA + DS3231 SDA (paralelo) |
| I²C SCL | 0.25 mm² | Verde | Arduino D21 → AM2315C SCL + DS3231 SCL (paralelo) |
| I²C GND | 0.25 mm² | Preto | Borne GND → AM2315C GND + DS3231 GND (paralelo) |

> 🔧 **Nota de engenharia (diferença em relação ao mestre v2):** os módulos I²C aqui são alimentados em **5 V**, não 3.3 V. O barramento I²C do Mega é de **5 V**, e os módulos AM2315C/DS3231 são tolerantes a 5 V e já têm pull‑ups internos. Alimentar em 5 V mantém os níveis do barramento coerentes e evita instabilidade. (O RTC e o SD ficam fixados junto ao Arduino no painel; apenas o AM2315C e o DS18B20 vão para dentro da câmara.)

> **Posição dos sensores na câmara:** DS18B20 no **centro** (mede a temperatura de controle); AM2315C ao lado (umidade/temperatura de referência).

---

## 6.6 Monitoramento de RPM (proteção da Peltier)

O cooler externo do lado quente da Peltier **precisa estar girando** sempre que a Peltier estiver energizada. Se parar, a pastilha queima em **menos de 1 minuto**.

- O fio **amarelo (tacômetro)** do cooler vai ao **D13** (`INPUT_PULLUP`).
- O firmware conta os pulsos e calcula a RPM. **RPM = 0 com Peltier ativa → desliga tudo e sinaliza FALHA** (LED vermelho + alerta no JSON).
- Lógica detalhada na [ETAPA 7 — Firmware](firmware.md).

---

## 6.7 Boas Práticas de Cabeamento de Sinais

- Linhas de **UART/Serial** e **I²C**: cabos **curtos** (< 20 cm quando possível).
- **Separar** fisicamente sinais de potência (canaleta/lado oposto).
- Usar **par trançado** em linhas sensíveis (1‑Wire longo, I²C) se houver ruído.
- **Star ground** já garantido na [ETAPA 5](cabos_forca.md) — não criar laços de terra.
- Capacitores de 100 nF nos pinos IS **junto ao Arduino**, não junto ao BTS.

---

## 6.8 Checklist da ETAPA 6

- [ ] Serial1 (D18/D19) → DNLCB30 e Serial2 (D16/D17) → Nextion
- [ ] BTS #1: D5/D4/A0 + VCC 5V + LPWM/L_EN em GND
- [ ] BTS #2: D6/D7/A1 + VCC 5V + LPWM/L_EN em GND
- [ ] Capacitores 100 nF em A0 e A1
- [ ] DS18B20 em D2 com pull‑up 4.7 kΩ → 5V
- [ ] I²C (AM2315C + DS3231) em D20/D21, VCC 5V
- [ ] SD em D50–D53
- [ ] RPM do cooler externo em D13 (`INPUT_PULLUP`)
- [ ] START D22, STOP D23, EMERG(2) D24 (todos p/ GND)
- [ ] LEDs D9–D12 com 220 Ω
- [ ] Grupos A e B passados em lados opostos da canaleta

> Próxima etapa: [ETAPA 7 — Firmware](firmware.md).
