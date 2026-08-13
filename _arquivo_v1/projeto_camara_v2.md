# Projeto Integrador: Sistema de Controle Inteligente para Mini Câmara Frigorífica

> **Versão 3.1** — BOM final limpa: relé slim e level shifter removidos; fan externa com monitoramento de RPM; DNLCB30 confirmada como base ESP32 com conversão integrada.
>
> **Mudança v3.1 — proteção/comando AC:** removido o **disjuntor** e qualquer **chave de seccionamento**. O único comando do circuito AC é a **chave rotativa 0‑1**, que liga/desliga a fonte (ATX). A proteção AC passa a ser o **fusível interno da própria ATX** + o disjuntor do quadro da instalação. O fusível 10 A do ramal DC dos BTS é mantido (protege a carga, não a fonte).
>
> 📌 **Este é o documento mestre/histórico.** A versão organizada em etapas está em [00_indice_projeto.md](00_indice_projeto.md) (etapas 1 a 8).

---

## 1. Visão Geral do Projeto

**Objetivo:** Desenvolver uma mini câmara térmica (incubadora/frigorífica) utilizando célula Peltier e aquecedor PTC, com controle PID via PWM lento (1 Hz), conectividade IoT e IHM local.

**Arquitetura de Controle:**
- **Arduino Mega 2560 (CLP Central):** Gerencia o PID, leitura dos sensores, monitoramento de RPM da fan externa, IHM Nextion e envio de telemetria.
- **ESP32-WROOM (Gateway IoT):** Alojado na base DNLCB30 (com conversão de nível integrada). Recebe JSON do Arduino via Serial e publica via Wi-Fi.

---

## 2. Dinâmica de Fluidos e Termodinâmica

- **Modo Aquecimento:** Ventoinhas internas empurram o ar **para cima** → ar quente gerado pelo PTC sobe naturalmente.
- **Modo Resfriamento:** Ventoinhas internas empurram o ar **para baixo** → ar frio da Peltier desce por convecção forçada.
- **Cooler externo (lado quente Peltier):** Sempre ligado em 100%, com monitoramento de RPM. Falha → sistema desliga imediatamente.

> **Condensação:** Bandeja de alumínio inferior + tubo de dreno externo. Obrigatório — sem dreno, em ~1h de resfriamento já há água acumulada sobre eletrônicos.

---

## 3. Lista de Materiais (BOM) — Versão Final

### 3.1 Lógica, Interface e Rede

| Item | Modelo / Specs | Brasil | AliExpress |
|---|---|---|---|
| Arduino Mega 2560 R3 | ATmega2560, 54 GPIO, 4 UARTs nativas | [Mercado Livre](https://lista.mercadolivre.com.br/arduino-mega-2560-r3) | [AliExpress](https://pt.aliexpress.com/w/wholesale-arduino-mega-2560-r3.html) |
| Shield expansão Mega (bornes DIN) | Sensor Shield V2.0 com bornes parafuso | [Mercado Livre](https://lista.mercadolivre.com.br/sensor-shield-mega-2560) | [AliExpress](https://pt.aliexpress.com/w/wholesale-mega-sensor-shield.html) |
| Tela Nextion Basic 3.2" | NX4024T032 (400×240, TTL 5V) | [Mercado Livre](https://lista.mercadolivre.com.br/nextion-nx4024t032-32) | [AliExpress](https://pt.aliexpress.com/w/wholesale-nextion-nx4024t032.html) |
| ESP32-WROOM-32U | 30 pinos, antena IPEX externa | [Mercado Livre](https://lista.mercadolivre.com.br/esp32-wroom-32u) | [AliExpress](https://pt.aliexpress.com/w/wholesale-esp32-wroom-32u.html) |
| **DNLCB30** — Base DIN ESP32 c/ conversão integrada | 30 pinos, 3.3V↔5V bidirecional automático, 7–35V in, trilho DIN | [AliExpress (link direto)](https://a.aliexpress.com/_mKerrb1) | [AliExpress busca](https://pt.aliexpress.com/w/wholesale-DNLCB30.html) |
| Antena 2.4GHz IPEX→SMA | Cabo pigtail IPEX + antena 3 dBi para painel | [Mercado Livre](https://lista.mercadolivre.com.br/antena-2.4ghz-ipex-sma-painel) | [AliExpress](https://pt.aliexpress.com/w/wholesale-ipex-to-sma-antenna.html) |

> **Nota DNLCB30:** A placa **não inclui o ESP32**. Comprar separado e encaixar. A conversão de nível 5V↔3.3V é automática em todos os pinos — elimina a necessidade de level shifter externo.

### 3.2 Potência e Atuadores Térmicos (12V)

| Item | Modelo / Specs | Brasil | AliExpress |
|---|---|---|---|
| Fonte ATX 12V | 500W reais mínimo, linha 12V ≥ 20A | Reutilizar fonte de PC | — |
| **Chave rotativa 0‑1 (22mm)** | Único comando AC — liga/desliga a fonte (≥6A AC). **Sem disjuntor/seccionadora** | — (compra local) | [AliExpress](https://pt.aliexpress.com/w/wholesale-rotary-switch-22mm.html) |
| Pastilha Peltier | TEC1-12706 (60W, ~6A @ 12V) | [Mercado Livre](https://lista.mercadolivre.com.br/pastilha-peltier-tec1-12706) | [AliExpress](https://pt.aliexpress.com/w/wholesale-tec1-12706.html) |
| Aquecedor PTC cerâmico | 12V, 50–100W, com aletas | [Mercado Livre](https://lista.mercadolivre.com.br/aquecedor-ptc-12v-100w) | [AliExpress](https://pt.aliexpress.com/w/wholesale-ptc-heater-12v-100w.html) |
| Fan extra lado PTC **60×60mm** (×1) | 2 pinos, 12V — orientada ↓, acionada pelo BTS#1 no modo frio | [Mercado Livre](https://lista.mercadolivre.com.br/cooler-12v-60mm) | [AliExpress](https://pt.aliexpress.com/w/wholesale-12v-60mm-brushless-fan.html) |
| Fan extra lado Peltier **40×40mm** (×1) | 2 pinos, 12V — orientada ↑, acionada pelo BTS#2 no modo quente | [Mercado Livre](https://lista.mercadolivre.com.br/cooler-12v-40mm) | [AliExpress](https://pt.aliexpress.com/w/wholesale-12v-40mm-brushless-fan.html) |

> **Total de fans internas: 4 (2 incluídas nos kits + 2 a comprar)**
>
> | Fan | Tamanho | Direção fixa | Controlada por |
> |---|---|---|---|
> | Fan integrada PTC | 60×60 | Sopra ↑ | BTS#2 — modo quente |
> | Fan extra lado PTC | 60×60 | Sopra ↓ | BTS#1 — modo frio |
> | Fan integrada kit Peltier | 40×40 | Sopra ↓ | BTS#1 — modo frio |
> | Fan extra lado Peltier | 40×40 | Sopra ↑ | BTS#2 — modo quente |
>
> **Modo quente:** Fan PTC ↑ + Fan extra Peltier ↑ → ar quente sobe → entra nos dutos laterais → sai em cima.
> **Modo frio:** Fan Peltier ↓ + Fan extra PTC ↓ → ar frio desce → entra nos dutos laterais → sai em cima.


### 3.3 Drivers e Acionamento

| Item | Modelo / Specs | Brasil | AliExpress |
|---|---|---|---|
| **BTS7960 Driver (×2)** | Dupla ponte-H, 43A contínuos, pino IS (diagnóstico de corrente) | [Mercado Livre ~R$40](https://produto.mercadolivre.com.br/MLB-1024499311-modulo-driver-ponte-h-43a-bts7960-_JM) / [RoboCore](https://www.robocore.net/driver-motor/modulo-driver-ponte-h-bts7960-43a) | [AliExpress ~US$4](https://www.aliexpress.com/item/32215648796.html) |
| **Suporte SPCI4 trilho DIN (×2)** | ABS, fixa PCI 100×79mm, DIN 35mm | [Automatizar Soluções](https://automatizarsolucoes.com.br/produtos/suporte-placa-de-circuito-impresso-base-pcb-trilho-din/) | [AliExpress](https://pt.aliexpress.com/w/wholesale-pcb-din-rail-bracket.html) |
| Botão de Emergência cogumelo | NF, 22mm, com trava | [Mercado Livre](https://lista.mercadolivre.com.br/botao-emergencia-cogumelo-22mm) | [AliExpress](https://pt.aliexpress.com/w/wholesale-emergency-stop-button-22mm.html) |
| **Módulo Micro SD** | SPI, 5V, compatível Arduino | — | [AliExpress](https://www.aliexpress.com/w/wholesale-micro-sd-card-module-arduino.html) |
| **Módulo RTC DS3231** | I²C, bateria CR2032, precisão ±2ppm | — | [AliExpress](https://www.aliexpress.com/w/wholesale-rtc-ds3231-module.html) |
| Bateria CR2032 | Para o DS3231 (backup RTC) | Farmácia / papelaria local | — |

> **Sem relé slim:** o intertravamento entre BTS7960 #1 (Peltier) e BTS7960 #2 (PTC) é garantido por software. Os dois nunca ficam ativos simultaneamente.

### 3.4 Sensoriamento

| Item | Modelo / Specs | Brasil | AliExpress |
|---|---|---|---|
| Sensor temperatura DS18B20 (×1) | Digital, 1-Wire, ±0.5°C, à prova d'água — centro da câmara | [Mercado Livre](https://lista.mercadolivre.com.br/ds18b20-prova-dagua) | [AliExpress](https://pt.aliexpress.com/w/wholesale-ds18b20-waterproof.html) |
| Resistor pull-up 4.7kΩ | 1/4W (para barramento 1-Wire) | Kit de resistores local | — |
| Sensor umidade/temp | AM2315C (I²C, ±0.3°C / ±2% UR, carcaça fechada) | [Mercado Livre](https://lista.mercadolivre.com.br/AM2315C) | [AliExpress](https://pt.aliexpress.com/w/wholesale-AM2315C.html) |

### 3.5 Painel (Mecânico / Sinalização)

| Item | Modelo / Specs | Onde |
|---|---|---|
| Trilho DIN 35mm | 1m, aço galvanizado | Loja elétrica local |
| Bornes parafuso DIN (×10) | 2.5mm², ~32A | Loja elétrica local |
| LEDs sinalizadores 22mm (×4) | Verde / Azul / Amarelo / Vermelho, 12V | [Mercado Livre](https://lista.mercadolivre.com.br/sinaleiro-led-22mm-12v) |
| Cabo flexível 2.5mm² (vm + pt) | Potência 12V | Local |
| Cabo flexível 0.5mm² | Sinais / sensores | Local |

---

## 4. Topologia de Controle — BTS7960 (sem relé)

| Driver | Carga | Corrente máx | Modo |
|---|---|---|---|
| BTS7960 #1 | Peltier + fan kit Peltier 40×40 ↓ + fan extra PTC 60×60 ↓ | ~6.5A | Frio |
| BTS7960 #2 | PTC (fan integrada 60×60 ↑) + fan extra Peltier 40×40 ↑ | ~5A | Quente |
| Linha 12V direta | Fan externa grande (kit Peltier, lado quente) | ~0.3A | Sempre ligado |

**Intertravamento por software:**
```cpp
if (modo == RESFRIAMENTO) {
    bts2_PTC.set(0);           // PTC garantidamente desligado
    bts1_PELTIER.set(pid_out); // Peltier controlada pelo PID (PWM 1Hz)
} else {
    bts1_PELTIER.set(0);       // Peltier garantidamente desligada
    bts2_PTC.set(pid_out);     // PTC controlada pelo PID (PWM 1Hz)
}
```

**Proteção por corrente (BTS7960 pino IS):**
O pino IS de cada BTS7960 entrega uma corrente proporcional à carga. Se a corrente cair abaixo do esperado em modo ativo, pode indicar falha no atuador. Leitura via ADC no Mega (A0 e A1).
```

---

## 5. Pinout Arduino Mega 2560 — Completo

### Comunicação Serial

| UART | TX/RX | Destino | Obs |
|---|---|---|---|
| Serial 0 | D1 / D0 | USB (debug) | — |
| Serial 1 | D18 / D19 | DNLCB30 → ESP32 | Conversão 5V↔3.3V automática na DNLCB30 |
| Serial 2 | D16 / D17 | Nextion NX4024T032 | Nextion aceita 5V direto |

### BTS7960 #1 (Peltier — modo frio)

| Pino Mega | Pino BTS7960 | Função |
|---|---|---|
| D5 (PWM) | RPWM | Duty cycle do PID |
| D4 | R_EN | Enable (HIGH = ativo) |
| GND | LPWM | Fixo em LOW |
| GND | L_EN | Fixo em LOW |
| A0 | R_IS | Diagnóstico de corrente (ADC) |
| 5V | VCC | Alimentação lógica opto |

### BTS7960 #2 (PTC — modo quente)

| Pino Mega | Pino BTS7960 | Função |
|---|---|---|
| D6 (PWM) | RPWM | Duty cycle do PID |
| D7 | R_EN | Enable |
| GND | LPWM | Fixo em LOW |
| GND | L_EN | Fixo em LOW |
| A1 | R_IS | Diagnóstico de corrente (ADC) |
| 5V | VCC | Alimentação lógica opto |

### Sensores e Saídas

| Pino Mega | Dispositivo | Detalhe |
|---|---|---|
| D2 | DS18B20 ×1 (1-Wire) — centro da câmara | Pull-up 4.7kΩ entre dado e +5V |
| D20 (SDA) | AM2315C + DS3231 (I²C) | Barramento I²C compartilhado — endereços distintos (0x38 e 0x68) |
| D21 (SCL) | AM2315C + DS3231 (I²C) | Barramento I²C compartilhado |
| D50 (MISO) | Módulo Micro SD | SPI hardware Mega |
| D51 (MOSI) | Módulo Micro SD | SPI hardware Mega |
| D52 (SCK) | Módulo Micro SD | SPI hardware Mega |
| D53 (SS/CS) | Módulo Micro SD | Chip Select |
| D9 | LED Verde (RUN) | 220Ω série |
| D10 | LED Azul (COOL) | 220Ω série |
| D11 | LED Amarelo (HEAT) | 220Ω série |
| D12 | LED Vermelho (FAULT) | 220Ω série |

---

## 6. Comunicação Serial — Mapeamento Final

| Serial | Pinos | Destino | Protocolo |
|---|---|---|---|
| Serial 0 | D0/D1 | USB PC (debug) | — |
| Serial 1 | D18/D19 | DNLCB30 → ESP32 | JSON, 115200 baud |
| Serial 2 | D16/D17 | Nextion | Protocolo Nextion, 9600 baud |

**JSON de telemetria (Serial1 → ESP32 → MQTT):**
```json
{
  "ts": "2025-05-29T14:32:05",
  "temp_camara": 22.5,
  "umidade": 65.2,
  "temp_am2315c": 22.3,
  "modo": "COOL",
  "pid_out": 67,
  "corrente_peltier": 5.2,
  "corrente_ptc": 0.0,
  "rpm_fan": 1850,
  "alerta": null
}
```

> O campo `"ts"` vem do RTC DS3231 lido pelo Arduino. O ESP32 publica em MQTT e aguarda comandos no tópico de retorno (controle bidirecional).

---

## 6.1 Logging Local — SD Card + RTC DS3231

### Arquitetura offline-first

```
Arduino (loop 1Hz)
  ├── lê sensores + PID
  ├── grava linha CSV no SD  ← sempre, com ou sem WiFi
  └── envia JSON → ESP32 → MQTT  ← melhor esforço

ESP32
  ├── WiFi OK  → publica MQTT em tempo real
  └── WiFi OFF → descarta (Arduino já salvou no SD)
```

### Formato do arquivo CSV no SD

Arquivo: `LOG_AAAAMMDD.CSV` — um arquivo por dia, criado automaticamente.

```
timestamp,temp_camara,umidade,temp_am2315c,modo,pid_out,i_peltier,i_ptc,rpm,alerta
2025-05-29T14:32:05,22.5,65.2,22.3,COOL,67,5.2,0.0,1850,
2025-05-29T14:32:06,22.4,65.3,22.2,COOL,68,5.3,0.0,1851,
```

### Firmware — trecho de logging

```cpp
#include <SD.h>
#include <RTClib.h>   // biblioteca RTClib (Adafruit)

RTC_DS3231 rtc;
#define SD_CS 53

void setupSDRTC() {
    rtc.begin();
    // Descomentar UMA VEZ para acertar o horário:
    // rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
    SD.begin(SD_CS);
}

void gravarLog(float temp, float umid, float tempAm, String modo,
               int pidOut, float iPeltier, float iPtc, int rpm) {
    DateTime now = rtc.now();

    char ts[20];
    snprintf(ts, sizeof(ts), "%04d-%02d-%02dT%02d:%02d:%02d",
             now.year(), now.month(), now.day(),
             now.hour(), now.minute(), now.second());

    char nome[16];
    snprintf(nome, sizeof(nome), "LOG_%04d%02d%02d.CSV",
             now.year(), now.month(), now.day());

    File f = SD.open(nome, FILE_WRITE);
    if (!f) return;

    // Cabeçalho só na primeira linha do arquivo
    if (f.size() == 0)
        f.println("timestamp,temp_camara,umidade,temp_am2315c,modo,pid_out,i_peltier,i_ptc,rpm,alerta");

    f.print(ts);       f.print(",");
    f.print(temp);     f.print(",");
    f.print(umid);     f.print(",");
    f.print(tempAm);   f.print(",");
    f.print(modo);     f.print(",");
    f.print(pidOut);   f.print(",");
    f.print(iPeltier); f.print(",");
    f.print(iPtc);     f.print(",");
    f.print(rpm);      f.print(",");
    f.println();       // campo alerta vazio em operação normal
    f.close();
}
```

> `gravarLog()` é chamada a cada ciclo PID (1 Hz). Um dia de log gera ~86 KB — cartão de 1 GB aguenta anos de operação.

---

## 7. Cuidados Críticos de Montagem

1. **Star Ground:** todos os GNDs (Arduino, BTS7960 ×2, DNLCB30, ATX) convergem para **um único ponto** no borne GND principal. Sem isso, o ruído de chaveamento corrompe leituras analógicas.
2. **Fan externa 3 pinos:** o fio amarelo (RPM) vai ao D13 do Mega com `INPUT_PULLUP`. Sem esse monitoramento, a Peltier queima em menos de 1 minuto com a fan parada.
3. **Filtro RC no pino IS do BTS7960:** adicionar capacitor 100nF entre IS e GND antes de chegar no ADC do Mega, reduz ruído de leitura de corrente.
4. **Dissipador nos BTS7960:** o módulo já vem com dissipador integrado. Para operação contínua acima de 5A, adicionar um cooler 40mm soprando sobre eles.
5. **DNLCB30 alimentada pela linha 12V da ATX:** a placa aceita 7–35V e gera os 3.3V e 5V internamente para o ESP32.
6. **Sequência de troca de modo:** aguardar 30s antes de alternar Frio↔Quente, evitando choque térmico entre os atuadores.
7. **Dreno de condensação:** tubo de silicone saindo da bandeja inferior da câmara para fora do painel. Sem isso, a câmara acumula água.

---

## 8. Roadmap de Montagem

- [ ] 1. Painel mecânico — trilho DIN, chave rotativa (lateral), botão emergência, ATX, bornes
- [ ] 2. BTS7960 ×2 nos suportes SPCI4 no trilho
- [ ] 3. Arduino Mega + Shield no trilho inferior
- [ ] 4. DNLCB30 + ESP32-WROOM-32U + antena IPEX no trilho
- [ ] 5. LEDs sinalizadores
- [ ] 6. Módulo SD + RTC DS3231 (fixados junto ao Arduino Mega)
- [ ] 7. Câmara mecânica — isolamento, bandeja, dreno
- [ ] 8. Peltier + dissipador + cooler externo 3 pinos
- [ ] 9. PTC heater + ventoinhas internas (4×)
- [ ] 10. DS18B20 (centro da câmara) + AM2315C (ao lado)
- [ ] 11. Firmware Arduino (PID + PWM 1Hz + RPM + JSON + log SD)
- [ ] 12. Firmware ESP32 (recebe JSON → publica MQTT bidirecional)
- [ ] 13. Dashboard IoT com gêmeo digital (ThingsBoard / Node-RED + Three.js)

---

## 9. Alimentação — Fonte ATX e Distribuição de Cabos

### 9.1 Mapeamento de Tensões

| Raíl ATX | Tensão | Cabo nativo | Alimenta |
|---|---|---|---|
| Amarelo | 12V | Molex / ATX24 | BTS#1, BTS#2, fans, DNLCB30 |
| Vermelho | 5V | Molex / ATX24 | Arduino Mega, Nextion |
| Preto | GND | Todos | GND comum (star ground) |

> ESP32 alimentado pela DNLCB30 que regula 12V→3.3V internamente. Não conectar 3.3V da ATX no ESP32.
> Nextion NX4024T032 aceita 5V (faixa 4.75V–7V) — alimenta junto com Arduino no raíl de 5V.

### 9.2 Ramais de Cabos (Molex ATX)

```
ATX MOLEX #1 ──► BTS#1 (12V + GND)
ATX MOLEX #2 ──► BTS#2 (12V + GND)  ← pode compartilhar com #1 (nunca ligam juntos)
ATX MOLEX #3 ──► Fans 12V (todos em paralelo)
ATX MOLEX #4 ──► DNLCB30/ESP32 (12V) + Arduino (5V) + Nextion (5V)
```

### 9.3 Fusível (1 fusível — ramal de potência)

| Ramal | Fusível | Corrente real | Tipo |
|---|---|---|---|
| BTS#1 + BTS#2 (12V) | **10A** | ~6.5A pior caso | Mini automotivo trilho DIN |

> Demais ramais (fans, lógica, 5V) protegidos pela OCP da ATX. Ramal de potência dos BTS mantém fusível por ser o único com corrente significativa e risco de curto na carga. **Não há disjuntor AC** — a proteção do lado AC é o fusível interno da própria ATX + o disjuntor do quadro da instalação.

Busca ML: **"porta fusível mini automotivo trilho DIN"** — R$ 12–20.

### 9.4 Star Ground (obrigatório)

Todos os GNDs convergem para um único borne central antes de retornar à ATX:

```
BTS#1 GND ─────┐
BTS#2 GND ─────┤
Fans GND  ─────┼──► BORNE GND CENTRAL ──► ATX GND (fio preto 2.5mm²)
Arduino GND ───┤
ESP32 GND ─────┤
Nextion GND ───┘
```

Sem star ground, o ruído de chaveamento dos BTS contamina leituras analógicas e comunicação serial.

### 9.5 Ligar ATX sem PC (jumper PS_ON)

```
Conector ATX 24 pinos:
Fio VERDE (PS_ON pino 16) ──┐
Fio PRETO (GND pino 15)  ───┘ jumper direto
```

Busca ML: **"jumper liga fonte ATX sem PC"** — R$ 5. Ou faça com fio 0.5mm².

---

## 10. Proteção e Partida — Esquema Completo

### 10.1 Diagrama de Proteção DC

```
TOMADA AC 220V (instalação já tem disjuntor de quadro)
      │
  [CHAVE ROTATIVA 0-1] ← único comando AC (liga/desliga a fonte). Sem disjuntor dedicado
      │
  [FONTE ATX 500W]  ← proteção própria: fusível AC interno + OCP/OVP/SCP
      │
  ┌───┴──────────────────────────┐
  │ 12V ──[fusível 10A]──► BTS#1 + BTS#2
  │                              │
  │         [emergência NF] ─────┘ (corta 12V dos BTS, hardware)
  │
  │ 12V ──────────────────► Fans
  │ 12V ──────────────────► DNLCB30 + ESP32
  │ 5V  ──────────────────► Arduino + Nextion
  └─────────────────────────────
```

> Arduino, ESP32 e Nextion **não são cortados pela emergência** — sistema continua monitorando e registrando o evento.

### 10.2 Botões do Painel

| Botão | Tipo | Pino Arduino | Função |
|---|---|---|---|
| START | Verde, momentâneo NA, 22mm | D22 INPUT_PULLUP | Inicia processo |
| STOP | Preto, momentâneo NF, 22mm | D23 INPUT_PULLUP | Para processo normalmente |
| EMERGÊNCIA | Cogumelo vermelho, trava, 22mm | D24 INPUT_PULLUP (contato 2) | Para processo + corta BTS hardware |

> Botão cogumelo usa **2 blocos de contato empilhados:**
> - Bloco 1 (NF): corta 12V dos BTS (hardware)
> - Bloco 2 (NF): sinal para Arduino D24 (software)
> Busca ML: **"bloco contato NF 22mm empilhável"** — R$ 8–15

### 10.3 Firmware — Lógica de Partida e Emergência

```cpp
#define BTN_START  22  // INPUT_PULLUP
#define BTN_STOP   23  // INPUT_PULLUP
#define BTN_EMERG  24  // INPUT_PULLUP — contato 2 do cogumelo
#define LED_FAULT  12

bool processoAtivo    = false;
bool estadoEmergencia = false;

void verificarBotoes() {

    // EMERGÊNCIA — prioridade máxima
    if (digitalRead(BTN_EMERG) == HIGH) {
        if (!estadoEmergencia) {
            estadoEmergencia = true;
            processoAtivo    = false;
            bts1.set(0);
            bts2.set(0);
            digitalWrite(LED_FAULT, HIGH);
            Serial1.println("{\"alerta\":\"EMERGENCIA\",\"processo\":false}");
            Serial2.println("alerta.txt=\"EMERGENCIA\"");
        }
        return; // ignora START/STOP enquanto emergência ativa
    }

    // EMERGÊNCIA LIBERADA (cogumelo destravado)
    if (estadoEmergencia && digitalRead(BTN_EMERG) == LOW) {
        estadoEmergencia = false;
        digitalWrite(LED_FAULT, LOW);
        // NÃO reinicia sozinho — exige START manual (NR-12)
        Serial1.println("{\"alerta\":null,\"aguardando\":\"START\"}");
        Serial2.println("alerta.txt=\"Aguard. START\"");
    }

    // START (só funciona sem emergência ativa)
    if (digitalRead(BTN_START) == LOW && !processoAtivo && !estadoEmergencia) {
        processoAtivo = true;
        Serial1.println("{\"processo\":true}");
        Serial2.println("status.txt=\"RODANDO\"");
    }

    // STOP normal
    if (digitalRead(BTN_STOP) == LOW && processoAtivo) {
        processoAtivo = false;
        bts1.set(0);
        bts2.set(0);
        Serial1.println("{\"processo\":false}");
        Serial2.println("status.txt=\"PARADO\"");
    }
}

void loop() {
    verificarBotoes();

    // PID só executa se processo ativo e sem emergência
    if (processoAtivo && !estadoEmergencia) {
        calcularPID();
        aplicarPotencia();
    }
}
```

### 10.4 Tabela de Estados do Sistema

| Evento | BTS | Arduino | Nextion | Dashboard IoT |
|---|---|---|---|---|
| Ligou (boot) | Desabilitado | Inicializando | "Aguard. START" | boot: true |
| START pressionado | Habilitado | processoAtivo=true | "RODANDO" | processo: true |
| STOP pressionado | Desabilitado | processoAtivo=false | "PARADO" | processo: false |
| Emergência acionada | **Cortado HW** | estadoEmergencia=true | "EMERGENCIA" | alerta: EMERGENCIA |
| Cogumelo liberado | Ainda cortado | estadoEmergencia=false | "Aguard. START" | aguardando: START |
| START após emergência | Reabilitado | processoAtivo=true | "RODANDO" | processo: true |

---

## 11. Layout Final do Painel (vista frontal)

### 11.1 Dimensões do Painel (backplate DIN)

| Dimensão | Valor | Como foi calculado |
|---|---|---|
| **Largura** | **300mm** | Definida pelo layout da base (seção 15.1) |
| **Altura** | **370mm** | Ver cálculo abaixo |
| **Profundidade disponível** | **180mm** | Definida pelo layout da base (seção 15.2) |

**Cálculo da altura — pilha vertical de baixo para cima:**

```
┌─────────────────────────────────────────────┐  ← topo do painel
│  margem superior                    30mm    │
│  zona botões + Nextion             100mm    │  Nextion 76mm altura + botões 22mm
│  canaleta horizontal                40mm    │
│  trilho DIN 1 + componentes         85mm    │  SPCI4+BTS7960 ~80mm + trilho DIN 7.5mm
│  canaleta horizontal                40mm    │
│  trilho DIN 2 + componentes         85mm    │  Arduino Mega+Shield ~80mm + trilho DIN 7.5mm
│  canaleta base                      40mm    │
│  margem inferior (entrada cabos)    30mm    │
└─────────────────────────────────────────────┘  ← base do painel
                                    TOTAL 450mm  → usar 450mm com folga
```

> Arredondar para **450mm** de altura para garantir folga de manuseio e passagem de cabos. Verificar com régua quando os componentes chegarem antes de furar o MDF.

### 11.2 Resumo das dimensões para compra do MDF do painel

| Peça | Dimensão | Material |
|---|---|---|
| Backplate (fundo do painel) | 300mm × 450mm | MDF 18mm ou chapa de aço 1.5mm |
| Tampa frontal (dobradiça ou parafuso) | 300mm × 450mm | MDF 12mm ou acrílico 5mm |
| Laterais | 180mm × 450mm (×2) | MDF 18mm |
| Topo e base | 300mm × 180mm (×2) | MDF 18mm |

> Se optar por caixa fechada, as dimensões internas são 300×450×180mm. Caixas de comando plásticas ou metálicas nessa faixa existem em lojas de material elétrico — busca: **"caixa de comando 300x450 trilho DIN"**.

### 11.3 Layout visual (vista frontal)

```
←──────────── 300mm ────────────→
┌──────────────────────────────────────────┐  ↑
│  [Emergência]  [START]  [STOP]           │  │ 30mm margem
│  [Nextion 3.2" — 98×57mm]               │  │ 100mm
├──────────────────────────────────────────┤  │ 40mm canaleta
│ ══ TRILHO DIN 1 ═══════════════════════ ║  │
│  [fusível 10A] [BTS7960 #1] [BTS7960 #2]│  │ 85mm
├──────────────────────────────────────────┤  │ 40mm canaleta
│ ══ TRILHO DIN 2 ═══════════════════════ ║  │
│  [Arduino Mega + Shield] [DNLCB30+ESP32] │  │ 85mm
│  [SD+RTC]  [Bornes DIN]                 │  │
│ ══ canaleta base ══════════════════════ ║  │ 40mm
│  entrada cabos câmara + saída ATX        │  │ 30mm
└──────────────────────────────────────────┘  ↓ 450mm total
```

> ESP32 (DNLCB30) ao lado do Arduino Mega no mesmo trilho — cabo Serial1 curto (<20cm) evita interferência.

---

## 12. Esquema de Força — Entrada AC e Controle da ATX

### 12.1 Hierarquia de Força

```
TOMADA 220V (empresa)
      │
  [CHAVE ROTATIVA 22mm] ← lateral do painel — liga/desliga TUDO (único comando AC)
      │                    ATX liga automaticamente (PS_ON em jumper fixo)
      │                    Secciona apenas a FASE; neutro e terra vão direto à ATX
  [FONTE ATX 500W]       ← proteção própria: fusível AC interno + OCP/OVP/SCP
      │
  PS_ON ──[jumper fixo GND] ← ATX liga sozinha ao receber 220V
```

> Arduino NÃO controla o PS_ON. A ATX liga junto com a chave rotativa.
> START/STOP controlam apenas os BTS7960 — não desligam a fonte.

### 12.2 Posição dos Controles no Painel

| Elemento | Face | Tipo | Função |
|---|---|---|---|
| Chave rotativa 0-1 | **Lateral** | Rotativa 22mm | Força geral — liga ATX |
| Emergência | **Frente** | Cogumelo 22mm NF | Corta BTS (hardware) |
| START | **Frente** | Botão verde 22mm NA | Inicia processo |
| STOP | **Frente** | Botão preto 22mm NF | Para processo |
| Nextion | **Frente** | Recorte 98×57mm | IHM configuração |

---

## 13. Mapeamento Completo de Cabos

### 13.1 Cabos AC (entrada no painel)

| Fio | Cor padrão BR | Seção | De → Para |
|---|---|---|---|
| Fase (L) | Preto ou marrom | 1.5mm² | Tomada → Chave rotativa pino 1 |
| Fase (L) | Preto ou marrom | 1.5mm² | Chave rotativa pino 2 → ATX entrada L |
| Neutro (N) | Azul | 1.5mm² | Tomada → ATX entrada N (direto) |
| Terra (PE) | Verde/amarelo | 1.5mm² | Tomada → ATX terra |

### 13.2 Cabos DC — ATX para Bornes (dentro do painel)

**12V (amarelo Molex):**

| Cabo | Seção | De → Para | Fusível |
|---|---|---|---|
| 12V ramal potência | 1.5mm² | ATX Molex #1 amarelo → fusível 10A → Borne 12V-POT | **10A** |
| 12V ramal fans | 0.75mm² | ATX Molex #2 amarelo → Borne 12V-FAN | — |
| 12V ramal lógica | 0.75mm² | ATX Molex #3 amarelo → Borne 12V-LOG | — |

**5V (vermelho Molex):**

| Cabo | Seção | De → Para | Fusível |
|---|---|---|---|
| 5V ramal lógica | 0.75mm² | ATX Molex #4 vermelho → Borne 5V | — |

**GND (preto — star ground):**

| Cabo | Seção | De → Para |
|---|---|---|
| GND principal | 2.5mm² | ATX Molex todos pretos → Borne GND-CENTRAL |

> **Regra star ground:** TODOS os GNDs do painel chegam primeiro ao Borne GND-CENTRAL antes de qualquer outro ponto. Nunca conectar GND de dois dispositivos entre si sem passar pelo borne central.

### 13.3 Cabos DC — Bornes para Componentes (dentro do painel)

**Potência BTS7960 (12V ramal potência):**

| Cabo | Seção | De → Para | Obs |
|---|---|---|---|
| 12V BTS | 1.5mm² | Borne 12V-POT → Emergência NF contato 1 entrada | Passa pela emergência |
| 12V BTS | 1.5mm² | Emergência NF contato 1 saída → BTS#1 pino B+ | Peltier mode |
| 12V BTS | 1.5mm² | Emergência NF contato 1 saída → BTS#2 pino B+ | PTC mode (paralelo) |
| GND BTS | 1.5mm² | Borne GND-CENTRAL → BTS#1 pino B- | |
| GND BTS | 1.5mm² | Borne GND-CENTRAL → BTS#2 pino B- | |

**Lógica BTS7960 → Arduino (sinal 5V):**

| Cabo | Seção | De → Para |
|---|---|---|
| BTS#1 RPWM | 0.25mm² | Arduino D5 → BTS#1 RPWM |
| BTS#1 R_EN | 0.25mm² | Arduino D4 → BTS#1 R_EN |
| BTS#1 LPWM | 0.25mm² | Arduino GND → BTS#1 LPWM (fixo LOW) |
| BTS#1 L_EN | 0.25mm² | Arduino GND → BTS#1 L_EN (fixo LOW) |
| BTS#1 R_IS | 0.25mm² | BTS#1 R_IS → Arduino A0 + cap 100nF→GND |
| BTS#1 VCC | 0.25mm² | Borne 5V → BTS#1 VCC lógica |
| BTS#2 RPWM | 0.25mm² | Arduino D6 → BTS#2 RPWM |
| BTS#2 R_EN | 0.25mm² | Arduino D7 → BTS#2 R_EN |
| BTS#2 LPWM | 0.25mm² | Arduino GND → BTS#2 LPWM (fixo LOW) |
| BTS#2 L_EN | 0.25mm² | Arduino GND → BTS#2 L_EN (fixo LOW) |
| BTS#2 R_IS | 0.25mm² | BTS#2 R_IS → Arduino A1 + cap 100nF→GND |
| BTS#2 VCC | 0.25mm² | Borne 5V → BTS#2 VCC lógica |

**Arduino alimentação:**

| Cabo | Seção | De → Para |
|---|---|---|
| 5V Arduino | 0.5mm² | Borne 5V → Arduino pino VIN |
| GND Arduino | 0.5mm² | Borne GND-CENTRAL → Arduino GND |

**DNLCB30 + ESP32 alimentação:**

| Cabo | Seção | De → Para |
|---|---|---|
| 12V DNLCB30 | 0.5mm² | Borne 12V-LOG → DNLCB30 VIN |
| GND DNLCB30 | 0.5mm² | Borne GND-CENTRAL → DNLCB30 GND |

**Nextion alimentação:**

| Cabo | Seção | De → Para |
|---|---|---|
| 5V Nextion | 0.5mm² | Borne 5V → Nextion pino 5V (vermelho) |
| GND Nextion | 0.5mm² | Borne GND-CENTRAL → Nextion GND (preto) |

**Serial — comunicação:**

| Cabo | Seção | De → Para | Obs |
|---|---|---|---|
| TX1 | 0.25mm² | Arduino D18 → DNLCB30 RX | Cabo curto <20cm |
| RX1 | 0.25mm² | Arduino D19 ← DNLCB30 TX | Cabo curto <20cm |
| TX2 | 0.25mm² | Arduino D16 → Nextion RX (verde) | |
| RX2 | 0.25mm² | Arduino D17 ← Nextion TX (amarelo) | |

**Botões e LEDs:**

| Cabo | Seção | De → Para |
|---|---|---|
| START sinal | 0.25mm² | Arduino D22 → Botão START pino 1 |
| START retorno | 0.25mm² | Botão START pino 2 → Borne GND-CENTRAL |
| STOP sinal | 0.25mm² | Arduino D23 → Botão STOP pino 1 |
| STOP retorno | 0.25mm² | Botão STOP pino 2 → Borne GND-CENTRAL |
| EMERG feedback | 0.25mm² | Arduino D24 → Cogumelo contato 2 pino 1 |
| EMERG retorno | 0.25mm² | Cogumelo contato 2 pino 2 → Borne GND-CENTRAL |
| LED verde D9 | 0.25mm² | Arduino D9 → resistor 220Ω → LED → GND |
| LED azul D10 | 0.25mm² | Arduino D10 → resistor 220Ω → LED → GND |
| LED amarelo D11 | 0.25mm² | Arduino D11 → resistor 220Ω → LED → GND |
| LED vermelho D12 | 0.25mm² | Arduino D12 → resistor 220Ω → LED → GND |

### 13.4 Cabos Painel → Câmara (pela canaleta)

**Total: 13 fios — separar em 2 grupos na canaleta:**

**Grupo A — Potência (fios grossos, lado esquerdo da canaleta):**

| Fio | Seção | Cor | De → Para |
|---|---|---|---|
| BTS#1 OUT+ | 1.5mm² | Vermelho | BTS#1 saída M+ → Borne câmara 12V-FRIO |
| BTS#1 OUT- | 1.5mm² | Preto | BTS#1 saída M- → Borne câmara GND-FRIO |
| BTS#2 OUT+ | 1.5mm² | Laranja | BTS#2 saída M+ → Borne câmara 12V-QUENTE |
| BTS#2 OUT- | 1.5mm² | Preto | BTS#2 saída M- → Borne câmara GND-QUENTE |
| Cooler ext 12V | 0.5mm² | Vermelho | Borne 12V-FAN → cooler externo Peltier + |
| Cooler ext GND | 0.5mm² | Preto | Borne GND-CENTRAL → cooler externo Peltier - |

**Grupo B — Sinais (fios finos, lado direito da canaleta):**

| Fio | Seção | Cor | De → Para |
|---|---|---|---|
| 1-Wire VCC | 0.25mm² | Vermelho | Borne 5V → DS18B20 VCC |
| 1-Wire DATA | 0.25mm² | Amarelo | Arduino D2 → DS18B20 DATA + pullup 4.7kΩ→VCC |
| 1-Wire GND | 0.25mm² | Preto | Borne GND → DS18B20 GND |
| I²C VCC | 0.25mm² | Vermelho | Borne 3.3V DNLCB30 → AM2315C VCC + DS3231 VCC (paralelo) |
| I²C SDA | 0.25mm² | Azul | Arduino D20 → AM2315C SDA + DS3231 SDA (paralelo) |
| I²C SCL | 0.25mm² | Verde | Arduino D21 → AM2315C SCL + DS3231 SCL (paralelo) |
| I²C GND | 0.25mm² | Preto | Borne GND → AM2315C GND + DS3231 GND (paralelo) |
| SD VCC | 0.25mm² | Vermelho | Borne 5V → Módulo SD VCC |
| SD GND | 0.25mm² | Preto | Borne GND → Módulo SD GND |
| SD MISO | 0.25mm² | Branco | Arduino D50 → Módulo SD MISO |
| SD MOSI | 0.25mm² | Laranja | Arduino D51 → Módulo SD MOSI |
| SD SCK | 0.25mm² | Amarelo | Arduino D52 → Módulo SD SCK |
| SD CS | 0.25mm² | Verde | Arduino D53 → Módulo SD CS |

---

## 14. Passo a Passo de Montagem dos Cabos

### ETAPA 1 — Preparar o painel (mecânico)
- [ ] Fixar trilho DIN 1 e DIN 2 com parafusos M5×10mm
- [ ] Fixar canaletas horizontais entre e ao redor dos trilhos
- [ ] Fazer recorte para Nextion (98×57mm) na tampa frontal
- [ ] Fazer furo 22mm para cada botão e chave rotativa
- [ ] Fazer entrada de cabos no fundo do painel (furo + prensa-cabo PG)

### ETAPA 2 — Instalar componentes nos trilhos (sem cabos)
- [ ] BTS7960 #1 + suporte SPCI4 → trilho DIN 1 (esquerda)
- [ ] BTS7960 #2 + suporte SPCI4 → trilho DIN 1 (centro)
- [ ] 1× porta-fusível 10A → trilho DIN 1 (ramal BTS)
- [ ] Arduino Mega + Shield → trilho DIN 2 (esquerda)
- [ ] DNLCB30 + ESP32 → trilho DIN 2 (centro, ao lado do Arduino)
- [ ] Bornes de distribuição → trilho DIN 2 (direita)
- [ ] Nextion → recorte da tampa (parafusos M3)
- [ ] Botões e chave → furos da tampa

### ETAPA 3 — Cabos AC (220V) — PAINEL DESLIGADO DA TOMADA
- [ ] Tomada → Chave rotativa pino 1 (fase L, 1.5mm² preto)
- [ ] Chave rotativa pino 2 → ATX entrada L (fase L) — sem disjuntor no caminho
- [ ] Tomada → ATX entrada N direto (neutro azul)
- [ ] Tomada → ATX terra (verde/amarelo)
- [ ] PS_ON (verde ATX) jumpar com GND (preto) no conector 24 pinos

### ETAPA 4 — Bornes de distribuição (instalar antes de qualquer cabo DC)
- [ ] Identificar bornes com etiqueta: 12V-POT, 12V-FAN, 12V-LOG, 5V, GND-CENTRAL
- [ ] GND-CENTRAL: borne maior (ponto de convergência de todos os GNDs)

### ETAPA 5 — Cabos DC da ATX para bornes
- [ ] ATX Molex #1 amarelo → porta-fusível 10A → Borne 12V-POT
- [ ] ATX Molex #2 amarelo → Borne 12V-FAN (direto)
- [ ] ATX Molex #3 amarelo → Borne 12V-LOG (direto)
- [ ] ATX Molex #4 vermelho → Borne 5V (direto)
- [ ] TODOS os pretos Molex → Borne GND-CENTRAL (star ground)

### ETAPA 6 — Alimentação dos componentes de controle
- [ ] Borne 5V → Arduino VIN
- [ ] Borne GND-CENTRAL → Arduino GND
- [ ] Borne 12V-LOG → DNLCB30 VIN
- [ ] Borne GND-CENTRAL → DNLCB30 GND
- [ ] Borne 5V → Nextion vermelho (5V)
- [ ] Borne GND-CENTRAL → Nextion preto (GND)

### ETAPA 7 — Potência dos BTS7960
- [ ] Borne 12V-POT → Emergência NF contato 1 entrada
- [ ] Emergência saída → BTS#1 B+ e BTS#2 B+ (paralelo)
- [ ] Borne GND-CENTRAL → BTS#1 B- e BTS#2 B- (paralelo)
- [ ] Borne 12V-FAN → cooler externo Peltier + (direto, sem BTS)
- [ ] Borne GND-CENTRAL → cooler externo Peltier -

### ETAPA 8 — Sinais BTS7960 → Arduino
- [ ] BTS#1: RPWM→D5, R_EN→D4, LPWM→GND, L_EN→GND, R_IS→A0, VCC→5V, GND→GND
- [ ] BTS#2: RPWM→D6, R_EN→D7, LPWM→GND, L_EN→GND, R_IS→A1, VCC→5V, GND→GND
- [ ] Capacitor 100nF entre A0 e GND (filtro IS do BTS#1)
- [ ] Capacitor 100nF entre A1 e GND (filtro IS do BTS#2)

### ETAPA 9 — Comunicação serial (cabos curtos <20cm)
- [ ] Arduino D18 (TX1) → DNLCB30 RX
- [ ] Arduino D19 (RX1) → DNLCB30 TX
- [ ] Arduino D16 (TX2) → Nextion verde (RX)
- [ ] Arduino D17 (RX2) → Nextion amarelo (TX)

### ETAPA 10 — Botões e LEDs
- [ ] START: D22 → botão → GND
- [ ] STOP: D23 → botão → GND
- [ ] Emergência feedback: D24 → contato 2 cogumelo → GND
- [ ] LED verde (RUN): D9 → 220Ω → LED → GND
- [ ] LED azul (COOL): D10 → 220Ω → LED → GND
- [ ] LED amarelo (HEAT): D11 → 220Ω → LED → GND
- [ ] LED vermelho (FAULT): D12 → 220Ω → LED → GND

### ETAPA 11 — Cabos painel → câmara (pela canaleta)
- [ ] Passar grupo A (potência) pelo lado esquerdo da canaleta
- [ ] Passar grupo B (sinais) pelo lado direito da canaleta
- [ ] BTS#1 OUT M+ e M- → bornes da câmara (12V-FRIO e GND-FRIO)
- [ ] BTS#2 OUT M+ e M- → bornes da câmara (12V-QUENTE e GND-QUENTE)
- [ ] 1-Wire: VCC→5V, DATA→D2, GND→GND (DS18B20 centro câmara)
- [ ] I²C: VCC→3.3V DNLCB30, SDA→D20, SCL→D21, GND→GND

### ETAPA 12 — Câmara: distribuição interna das cargas
- [ ] Borne 12V-FRIO → Peltier + (polo positivo)
- [ ] Borne GND-FRIO → Peltier - (polo negativo)
- [ ] Borne 12V-FRIO → Fan 40×40 kit Peltier + (em paralelo)
- [ ] Borne GND-FRIO → Fan 40×40 kit Peltier -
- [ ] Borne 12V-QUENTE → PTC + e Fan extra 60×60 + (em paralelo)
- [ ] Borne GND-QUENTE → PTC - e Fan extra 60×60 -
- [ ] Cooler externo: direto no cabo do painel (sem borne intermediário)

### ETAPA 13 — Verificação antes de ligar
- [ ] Medir resistência 12V-POT → GND com multímetro (não deve ser zero)
- [ ] Medir resistência 5V → GND (não deve ser zero)
- [ ] Confirmar jumper PS_ON na ATX
- [ ] Confirmar pullup 4.7kΩ no 1-Wire instalado
- [ ] Confirmar capacitores 100nF nos pinos IS
- [ ] Ligar chave rotativa → ATX deve ligar (ventoinha girar)
- [ ] Arduino deve bootar → Nextion deve inicializar

---

## 15. Estrutura Física — Câmara, Base e Layout

### 15.1 Layout Geral (Vista Frontal)

```
←──── 30cm ────→←── 5cm ──→←──── 27cm ────→
┌───────────────┐           ┌───────────────┐
│  [Nextion]    │           │░░░░░░░░░░░░░░░│
│               │           │░░ XPS preto ░░│
│  [Emerg ⛔]   │           │░░░░░░░░░░░░░░░│
│  [START🟢]    │           ├───────────────┤
│  [STOP ⚫]    │           │               │
│  [Chave 0-1]  │           │  PORTA        │
│               │           │  ACRÍLICO     │
│               │           │  TRANSPARENTE │
│               │           │  (vê dentro)  │
│               │           │               │
└───────────────┘           └───────────────┘
[████████████████████████████████████████████]
              BASE MDF 18mm preta
←──────────────────── 65cm ─────────────────→
```

> ATX completamente escondida atrás do painel — invisível pela vista frontal.

### 15.2 Vista de Cima

```
←─────────────────── 65cm ──────────────────→
┌──────────┬──────────────┬─────────────────┐
│          │              │ [duto][câmara]  │
│  ATX     │   PAINEL     │       [duto]    │
│ escondida│   DIN        │                 │
│ atrás    │   (frente)   │                 │
│          │              │                 │
└──────────┴──────────────┴─────────────────┘
←── 20cm ──→←── 18cm ───→←───── 27cm ──────→
   ATX           painel        câmara+dutos
```

### 15.3 Vista Lateral

```
FRENTE                                    ATRÁS
   │  PAINEL  │    BASE    │    ATX    │
   │  30cm    │            │  escondida│
   │          │            │  atrás    │
   └──────────┴────────────┴───────────┘
   [████████████  MDF 18mm  ████████████]
```

> Cabos da ATX passam por baixo da base e entram no painel pela parte traseira — invisíveis pela vista frontal.

---

## 16. Câmara Térmica — Dimensões e Construção

### 16.1 Dimensões Gerais

| Medida | Valor |
|---|---|
| Largura interna | 20cm |
| Profundidade interna | 10cm |
| Altura interna | 25cm |
| Espessura parede acrílico | 5mm |
| Espessura isolamento XPS | 20mm |
| Altura plenum (retorno ar) | 3cm |
| Largura duto externo | 3cm |
| Profundidade duto externo | 3cm |
| Abertura interna do duto | 21cm (2cm margem cima e baixo) |

### 16.2 Base Interna (plataforma do PTC)

```
Base interna: 19cm × 9cm × 5mm (acrílico transparente)
Apoio: 4 cubinhos 2×2×3cm nos cantos internos (colados com S-320)
Vedação: silicone neutro em toda a borda, por cima e por baixo
```

> A base interna divide a câmara em 2 zonas:
> - **Abaixo:** plenum de retorno (3cm) — ar circula por baixo do PTC
> - **Acima:** espaço útil (22cm) — onde o objeto fica

### 16.3 Circulação de Ar

```
MODO FRIO (BTS#1 ativo):
Peltier + fan ↓ → ar frio desce no centro
→ entra no plenum por baixo do PTC
→ sobe pelos dutos externos laterais
→ retorna pela abertura no topo para a Peltier

MODO QUENTE (BTS#2 ativo):
PTC + fan ↑ → ar quente sobe no centro
→ entra nos dutos pelo topo
→ desce pelos dutos externos laterais
→ retorna pelo plenum para o PTC
```

### 16.4 Dutos Externos

```
VISTA DE CIMA:

[duto 3×3cm] │ parede 5mm │ espaço útil 20cm │ parede 5mm │ [duto 3×3cm]
             ↑                                             ↑
         colado por fora                             colado por fora
```

Cada duto é formado por 3 peças de acrílico 3mm coladas com S-320:
- Face externa: 11cm × 25cm
- Tampa frontal: 3cm × 25cm
- Tampa traseira: 3cm × 25cm
- Tampa topo: 11cm × 3cm
- Tampa base: 11cm × 3cm

### 16.5 Vedação e Isolamento

| Face | Estrutura | Isolamento | Cobertura externa |
|---|---|---|---|
| Paredes laterais | Acrílico 5mm | XPS 20mm por fora | Acrílico preto 3mm |
| Parede traseira | Acrílico 5mm | XPS 20mm por fora | Acrílico preto 3mm |
| Tampa topo | Acrílico 5mm | XPS 20mm por fora | Acrílico preto 3mm |
| Base externa | Acrílico 5mm | XPS 20mm por fora | Acrílico preto 3mm |
| **Porta frontal** | **Acrílico 10mm** | **Sem XPS** | **Transparente** |

---

## 17. Lista Completa de Peças de Acrílico (para gráfica)

### 17.1 Acrílico transparente 5mm — estrutura câmara

| Peça | Dimensão | Qtd | Bordas 45° | Bordas 90° reto |
|---|---|---|---|---|
| Parede lateral ESQ | 11cm × 25cm | 1 | TRASEIRA + TOPO + BASE | FRONTAL (porta encosta aqui) |
| Parede lateral DIR | 11cm × 25cm | 1 | TRASEIRA + TOPO + BASE | FRONTAL (porta encosta aqui) |
| Parede traseira | 21cm × 25cm | 1 | ESQ + DIR + TOPO + BASE | — |
| Tampa topo | 21cm × 11cm | 1 | Todas as 4 bordas | — |
| Base externa (chão) | 21cm × 11cm | 1 | Todas as 4 bordas | — |
| Base interna (PTC) | 19cm × 9cm | 1 | — | Todas (encaixa nos cubinhos) |

> Recorte parede lateral: abertura 9cm × 21cm para o duto (2cm margem topo e base).
> Recorte tampa topo: tamanho da Peltier + prensa-cabo para os fios.
> Cubinhos 2×2×3cm: cortados da sobra do material, todos a 90°.

### 17.2 Acrílico transparente 10mm — porta frontal

| Peça | Dimensão | Qtd | Bordas 45° | Bordas 90° reto |
|---|---|---|---|---|
| Porta frontal | 21cm × 25cm | 1 | — | Todas as 4 bordas (peça solta) |

### 17.3 Acrílico transparente 3mm — dutos externos (×2)

| Peça | Dimensão | Qtd por duto | Qtd total | Bordas 45° | Bordas 90° reto |
|---|---|---|---|---|---|
| Frente | 3cm × 21cm | 1 | 2 | ESQ + DIR + TOPO + BASE | — |
| Lateral | 3cm × 21cm | 2 | 4 | FRONTAL + TOPO + BASE | TRASEIRA (cola na câmara) |
| Tampa topo | 3cm × 3cm | 1 | 2 | FRONTAL + ESQ + DIR | TRASEIRA (cola na câmara) |
| Tampa base | 3cm × 3cm | 1 | 2 | FRONTAL + ESQ + DIR | TRASEIRA (cola na câmara) |

> **Emendas entre as 5 peças do duto: todas a 45°**
> **Borda traseira de todas as peças: 90° reto** — cola diretamente na parede lateral da câmara.
> Duto tem **21cm de altura** — alinhado com a abertura. Os 2cm de margem (topo e base) ficam na parede sólida da câmara sem duto colado.

### 17.4 Acrílico preto/cinza 3mm — cobertura externa XPS

| Peça | Dimensão | Qtd |
|---|---|---|
| Cobertura traseira | 21cm × 25cm | 1 |
| Cobertura lateral | 17cm × 25cm | 2 |
| Cobertura topo | 27cm × 11cm | 1 |
| Cobertura base | 27cm × 11cm | 1 |

---

## 18. Base da Maquete

### 18.1 Especificação

| Item | Especificação |
|---|---|
| Material | MDF 18mm |
| Dimensão | 65cm × 30cm |
| Acabamento | Tinta preta fosca spray |
| Pés | Borracha autoadesiva 4 cantos |

### 18.2 Fixações na base

| Componente | Fixação |
|---|---|
| Painel industrial | 4 parafusos M5×20mm pelo fundo da base |
| Câmara térmica | Silicone neutro na base externa + 4 parafusos M4 |
| ATX | Parafusos M4 pelo fundo da base (atrás do painel) |

### 18.3 Roteamento de cabos na base

```
ATX (atrás) → cabos passam por baixo da base
            → entram no painel pela parte traseira inferior
            → invisíveis pela vista frontal

Painel → câmara: canaleta passa pela base
                 lateral direita do painel
                 até lateral esquerda da câmara
```

### 18.4 Lista de compras da base

| Item | Busca ML | Preço aprox |
|---|---|---|
| MDF 18mm cortado | madeireira local | R$ 20–35 |
| Tinta preta fosca spray | ferragem local | R$ 15–20 |
| Pés borracha autoadesivos | *"pé borracha autoadesivo"* | R$ 8–12 |
| Parafusos M5×20mm | *"parafuso M5 20mm"* | R$ 8–12 |
| Parafusos M4×15mm | *"parafuso M4 15mm"* | R$ 8–12 |
| Cantoneiras alumínio L | *"cantoneira alumínio L"* | R$ 10–20 |

---

## 19. Lista Consolidada Final — Acrílico para Gráfica

> Levar essa lista para a gráfica. Solicitar **corte a laser** e **meia-esquadria 45°** nas bordas indicadas.

### Acrílico transparente 5mm — câmara principal

| Peça | Dimensão | Qtd | Bordas 45° | Bordas 90° | Recorte interno |
|---|---|---|---|---|---|
| Parede lateral ESQ | 11cm × 25cm | 1 | TRASEIRA + TOPO + BASE | FRONTAL | 9cm × 21cm (duto) |
| Parede lateral DIR | 11cm × 25cm | 1 | TRASEIRA + TOPO + BASE | FRONTAL | 9cm × 21cm (duto) |
| Parede traseira | 21cm × 25cm | 1 | ESQ + DIR + TOPO + BASE | — | — |
| Tampa topo | 21cm × 11cm | 1 | Todas as 4 | — | Peltier + prensa-cabo |
| Base externa (chão) | 21cm × 11cm | 1 | Todas as 4 | — | — |
| Base interna (PTC) | 19cm × 9cm | 1 | — | Todas as 4 | — |

**Total 5mm: 6 peças**

---

### Acrílico transparente 10mm — porta frontal

| Peça | Dimensão | Qtd | Bordas 45° | Bordas 90° |
|---|---|---|---|---|
| Porta frontal | 21cm × 25cm | 1 | — | Todas as 4 (peça solta) |

**Total 10mm: 1 peça**

---

### Acrílico transparente 3mm — dutos externos

| Peça | Dimensão | Qtd | Bordas 45° | Bordas 90° |
|---|---|---|---|---|
| Frente duto ESQ | 3cm × 21cm | 1 | ESQ + DIR + TOPO + BASE | — |
| Frente duto DIR | 3cm × 21cm | 1 | ESQ + DIR + TOPO + BASE | — |
| Lateral duto ESQ (×2) | 3cm × 21cm | 2 | FRONTAL + TOPO + BASE | TRASEIRA |
| Lateral duto DIR (×2) | 3cm × 21cm | 2 | FRONTAL + TOPO + BASE | TRASEIRA |
| Tampa topo duto ESQ | 3cm × 3cm | 1 | FRONTAL + ESQ + DIR | TRASEIRA |
| Tampa topo duto DIR | 3cm × 3cm | 1 | FRONTAL + ESQ + DIR | TRASEIRA |
| Tampa base duto ESQ | 3cm × 3cm | 1 | FRONTAL + ESQ + DIR | TRASEIRA |
| Tampa base duto DIR | 3cm × 3cm | 1 | FRONTAL + ESQ + DIR | TRASEIRA |

**Total 3mm transparente: 10 peças**

---

### Acrílico preto/cinza 3mm — cobertura externa XPS

| Peça | Dimensão | Qtd | Bordas |
|---|---|---|---|
| Cobertura traseira | 21cm × 25cm | 1 | Todas 90° (cola no XPS) |
| Cobertura lateral ESQ | 17cm × 25cm | 1 | Todas 90° (cola no XPS) |
| Cobertura lateral DIR | 17cm × 25cm | 1 | Todas 90° (cola no XPS) |
| Cobertura topo | 27cm × 17cm | 1 | Todas 90° (cola no XPS) |
| Cobertura base | 27cm × 17cm | 1 | Todas 90° (cola no XPS) |

**Total 3mm preto: 5 peças**

---

### Resumo para a gráfica

| Espessura | Cor | Peças | Observação |
|---|---|---|---|
| 5mm | Transparente | 6 | Meia-esquadria 45° conforme tabela |
| 10mm | Transparente | 1 | Todas as bordas 90° |
| 3mm | Transparente | 10 | Meia-esquadria 45° conforme tabela |
| 3mm | Preto/cinza | 5 | Todas as bordas 90° |
| **Total** | | **22 peças** | |

---

### Outros materiais de construção da câmara

| Item | Especificação | Onde |
|---|---|---|
| XPS 20mm | ~50cm × 50cm | Loja construção |
| Cola S-320 Sinteglas | 250ml ou 1L | ML: *"cola sinteglas s-320"* |
| Silicone neutro transparente | 1 bisnaga | Ferragem local |
| Perfil EPDM autoadesivo 5mm | 1 metro | ML: *"perfil EPDM 5mm"* |
| Dobradiça piano alumínio | 75cm (corta para 25cm) | ML: *"dobradiça piano alumínio"* |
| Fecho pressão para caixa (×2) | inox | ML: *"fecho para caixa inox"* |
| Parafusos M3×8mm inox kit | para dobradiça | ML: *"parafuso M3 8mm inox"* |
| Sílica gel indicadora | 2 sachês 50g | ML: *"sílica gel indicador azul"* |
| Prensa-cabo PG9 (×4) | para fios sensores | ML: *"prensa cabo PG9"* |
