# ETAPA 7 — Firmware (Arduino Mega + ESP32)

> Sétima etapa: o **software**. O Arduino Mega executa o controle em tempo real (PID, PWM 1 Hz, intertravamento, partida/emergência, monitoramento de RPM e log no SD). O ESP32 atua como gateway, publicando a telemetria em **MQTT** e recebendo comandos.
>
> Pré‑requisitos: ETAPAS 5 e 6 concluídas (alimentação e sinais).

---

## 7.1 Visão Geral do Loop de Controle (1 Hz)

```
Arduino (loop 1 Hz)
  ├── lê botões (START / STOP / EMERGÊNCIA)
  ├── lê sensores (DS18B20, AM2315C, RPM, IS dos BTS)
  ├── verifica segurança (RPM da fan, emergência)
  ├── calcula PID e seleciona modo (Frio/Quente) com intertravamento
  ├── aplica potência via PWM 1 Hz no BTS correspondente
  ├── grava 1 linha CSV no SD  ← sempre, com ou sem Wi-Fi
  └── envia JSON → ESP32 → MQTT  ← melhor esforço

ESP32
  ├── Wi-Fi OK  → publica MQTT em tempo real + escuta comandos
  └── Wi-Fi OFF → descarta (o Arduino já salvou no SD)
```

> **Offline‑first:** o log no SD é a fonte da verdade. A rede é "melhor esforço" — se cair, nada se perde.

---

## 7.2 Bibliotecas Necessárias (Arduino)

| Biblioteca | Uso |
|---|---|
| `OneWire` + `DallasTemperature` | DS18B20 (temperatura do centro) |
| `Adafruit_AM2315` (ou equivalente do AM2315C) | Umidade/temperatura |
| `Wire` | Barramento I²C |
| `RTClib` (Adafruit) | RTC DS3231 (timestamp) |
| `SD` | Cartão SD (log CSV) |
| `PID_v1` (Brett Beauregard) | Malha PID |

No ESP32: `WiFi.h` + `PubSubClient` (MQTT) + `ArduinoJson`.

---

## 7.3 Definição de Pinos (coerente com a ETAPA 6)

```cpp
// ---- Atuadores (BTS7960) ----
#define BTS1_RPWM   5   // Peltier (frio) - PWM
#define BTS1_REN    4   // Peltier enable
#define BTS1_IS     A0  // diagnóstico de corrente Peltier
#define BTS2_RPWM   6   // PTC (quente) - PWM
#define BTS2_REN    7   // PTC enable
#define BTS2_IS     A1  // diagnóstico de corrente PTC

// ---- Sensores ----
#define PINO_DS18B20 2  // 1-Wire (pull-up 4.7k -> 5V)
#define PINO_RPM    13  // tacômetro do cooler externo (INPUT_PULLUP)
// I2C: SDA=20, SCL=21  (AM2315C 0x38, DS3231 0x68)
#define SD_CS       53

// ---- Botões ----
#define BTN_START   22  // NA  - INPUT_PULLUP
#define BTN_STOP    23  // NF  - INPUT_PULLUP
#define BTN_EMERG   24  // contato 2 do cogumelo - INPUT_PULLUP

// ---- LEDs ----
#define LED_RUN     9   // verde
#define LED_COOL    10  // azul
#define LED_HEAT    11  // amarelo
#define LED_FAULT   12  // vermelho

// ---- Modos ----
enum Modo { PARADO, RESFRIAMENTO, AQUECIMENTO };
```

---

## 7.4 PID com PWM Lento (1 Hz)

O PWM nativo do Arduino é rápido demais para cargas térmicas e para a Peltier. Usa‑se um **PWM "por software" de 1 Hz**: a cada ciclo de 1 s, o atuador fica ligado por `pid_out`% do tempo.

```cpp
#include <PID_v1.h>

double setpoint = 5.0;      // °C desejado (vem da Nextion / MQTT)
double entrada  = 0.0;      // temperatura medida (DS18B20)
double saidaPID = 0.0;      // 0..100 (% de duty)

// Ganhos iniciais (ajustar na prática)
double Kp = 8.0, Ki = 0.2, Kd = 1.0;
PID meuPID(&entrada, &saidaPID, &setpoint, Kp, Ki, Kd, DIRECT);

const unsigned long JANELA_MS = 1000;   // 1 Hz
unsigned long inicioJanela = 0;

void setupPID() {
    meuPID.SetOutputLimits(0, 100);
    meuPID.SetMode(AUTOMATIC);
    inicioJanela = millis();
}

// Liga/desliga o pino do BTS conforme o duty dentro da janela de 1 s
void aplicarPWMlento(int pinoPWM, double duty /*0..100*/) {
    unsigned long agora = millis();
    if (agora - inicioJanela >= JANELA_MS) inicioJanela += JANELA_MS;
    unsigned long tempoLigado = (duty / 100.0) * JANELA_MS;
    digitalWrite(pinoPWM, (agora - inicioJanela < tempoLigado) ? HIGH : LOW);
}
```

> **Seleção de modo pelo erro:** se a temperatura medida está **acima** do setpoint → precisa **resfriar**; se está **abaixo** → precisa **aquecer**. A direção do PID e o BTS escolhido seguem essa lógica (ver 7.5).

---

## 7.5 Intertravamento por Software (Peltier ⊕ PTC)

**Regra de ouro: Peltier e PTC NUNCA ligam ao mesmo tempo.** Garantido em software, sem relé:

```cpp
Modo modo = PARADO;

void selecionarModo() {
    double erro = setpoint - entrada;
    if      (erro < -0.3) modo = RESFRIAMENTO;  // está quente demais → esfria
    else if (erro >  0.3) modo = AQUECIMENTO;   // está frio demais → aquece
    // banda morta de ±0.3 °C evita ficar trocando de modo
}

void aplicarPotencia() {
    if (modo == RESFRIAMENTO) {
        digitalWrite(BTS2_REN, LOW);   // PTC garantidamente desligado
        digitalWrite(BTS1_REN, HIGH);  // habilita Peltier
        aplicarPWMlento(BTS1_RPWM, saidaPID);
        digitalWrite(BTS2_RPWM, LOW);
        sinalizar(LED_COOL);
    }
    else if (modo == AQUECIMENTO) {
        digitalWrite(BTS1_REN, LOW);   // Peltier garantidamente desligada
        digitalWrite(BTS2_REN, HIGH);  // habilita PTC
        aplicarPWMlento(BTS2_RPWM, saidaPID);
        digitalWrite(BTS1_RPWM, LOW);
        sinalizar(LED_HEAT);
    }
    else { // PARADO
        digitalWrite(BTS1_REN, LOW);
        digitalWrite(BTS2_REN, LOW);
        digitalWrite(BTS1_RPWM, LOW);
        digitalWrite(BTS2_RPWM, LOW);
    }
}
```

> **Intervalo de troca de modo:** ao mudar de Frio↔Quente, aguardar **30 s** antes de energizar o novo atuador, evitando choque térmico. Implementar com um carimbo de tempo (`millis()`) que bloqueia a troca enquanto não passar o intervalo.

---

## 7.6 Partida, Parada e Emergência

```cpp
bool processoAtivo    = false;
bool estadoEmergencia = false;

void verificarBotoes() {
    // EMERGÊNCIA — prioridade máxima
    if (digitalRead(BTN_EMERG) == HIGH) {       // cogumelo acionado
        if (!estadoEmergencia) {
            estadoEmergencia = true;
            processoAtivo    = false;
            desligarTudo();                       // BTS1/BTS2 OFF (software)
            digitalWrite(LED_FAULT, HIGH);
            Serial1.println("{\"alerta\":\"EMERGENCIA\",\"processo\":false}");
            Serial2.println("alerta.txt=\"EMERGENCIA\"");
        }
        return;                                   // ignora START/STOP
    }

    // EMERGÊNCIA LIBERADA (cogumelo destravado)
    if (estadoEmergencia && digitalRead(BTN_EMERG) == LOW) {
        estadoEmergencia = false;
        digitalWrite(LED_FAULT, LOW);
        // NÃO reinicia sozinho — exige START manual (boa prática NR-12)
        Serial1.println("{\"alerta\":null,\"aguardando\":\"START\"}");
        Serial2.println("alerta.txt=\"Aguard. START\"");
    }

    // START (só sem emergência ativa)
    if (digitalRead(BTN_START) == LOW && !processoAtivo && !estadoEmergencia) {
        processoAtivo = true;
        digitalWrite(LED_RUN, HIGH);
        Serial1.println("{\"processo\":true}");
        Serial2.println("status.txt=\"RODANDO\"");
    }

    // STOP normal
    if (digitalRead(BTN_STOP) == LOW && processoAtivo) {
        processoAtivo = false;
        desligarTudo();
        digitalWrite(LED_RUN, LOW);
        Serial1.println("{\"processo\":false}");
        Serial2.println("status.txt=\"PARADO\"");
    }
}
```

> A **emergência também corta os 12 V dos BTS em hardware** (bloco 1 do cogumelo — ver [ETAPA 5](cabos_forca.md)). O software apenas registra/trava; a segurança física não depende dele.

---

## 7.7 Segurança: Monitoramento de RPM da Fan Externa

Se o cooler do lado quente da Peltier parar com a Peltier ligada, a pastilha **queima em < 1 min**.

```cpp
volatile unsigned long pulsos = 0;
unsigned long ultimaMedidaRPM = 0;
int rpmAtual = 0;

void isrRPM() { pulsos++; }   // interrupção no pino D13

void setupRPM() {
    pinMode(PINO_RPM, INPUT_PULLUP);
    attachInterrupt(digitalPinToInterrupt(PINO_RPM), isrRPM, FALLING);
}

void medirRPM() {
    if (millis() - ultimaMedidaRPM >= 1000) {
        noInterrupts();
        unsigned long p = pulsos; pulsos = 0;
        interrupts();
        rpmAtual = (p * 60) / 2;        // 2 pulsos por rotação (típico)
        ultimaMedidaRPM = millis();

        // FALHA: Peltier ativa e fan parada → desliga tudo
        if (modo == RESFRIAMENTO && processoAtivo && rpmAtual == 0) {
            desligarTudo();
            processoAtivo = false;
            digitalWrite(LED_FAULT, HIGH);
            Serial1.println("{\"alerta\":\"FAN_PARADA\",\"processo\":false}");
            Serial2.println("alerta.txt=\"FALHA FAN\"");
        }
    }
}
```

---

## 7.8 Diagnóstico de Corrente (pino IS)

O pino **IS** de cada BTS entrega uma corrente proporcional à da carga. Lendo via ADC, dá para detectar atuador desconectado/queimado.

```cpp
float lerCorrente(int pinoIS) {
    int adc = analogRead(pinoIS);          // 0..1023
    // conversão depende do resistor de medida do módulo — calibrar na prática
    return adc * FATOR_CORRENTE;           // resultado em A (aprox.)
}
// Ex.: se modo == RESFRIAMENTO e saidaPID > 50% mas corrente ~0 → Peltier desconectada
```

> Adicionar o **capacitor 100 nF** entre o pino IS e GND (ETAPA 6) para estabilizar a leitura.

---

## 7.9 Log Local — SD Card + RTC DS3231

Arquivo `LOG_AAAAMMDD.CSV` — um por dia, criado automaticamente.

```
timestamp,temp_camara,umidade,temp_am2315c,modo,pid_out,i_peltier,i_ptc,rpm,alerta
2026-06-09T14:32:05,5.2,65.2,5.0,COOL,67,5.2,0.0,1850,
```

```cpp
#include <SD.h>
#include <RTClib.h>
RTC_DS3231 rtc;

void setupSDRTC() {
    rtc.begin();
    // Descomentar UMA vez para acertar a hora pela do PC:
    // rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
    SD.begin(SD_CS);
}

void gravarLog(float temp, float umid, float tempAm, const char* modoStr,
               int pidOut, float iPeltier, float iPtc, int rpm, const char* alerta) {
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
    if (f.size() == 0)
        f.println("timestamp,temp_camara,umidade,temp_am2315c,modo,pid_out,i_peltier,i_ptc,rpm,alerta");

    f.print(ts);       f.print(',');
    f.print(temp);     f.print(',');
    f.print(umid);     f.print(',');
    f.print(tempAm);   f.print(',');
    f.print(modoStr);  f.print(',');
    f.print(pidOut);   f.print(',');
    f.print(iPeltier); f.print(',');
    f.print(iPtc);     f.print(',');
    f.print(rpm);      f.print(',');
    f.println(alerta); // vazio em operação normal
    f.close();
}
```

> 1 Hz de log gera ~86 KB/dia — um cartão de 1 GB guarda **anos** de operação.

---

## 7.10 Telemetria JSON (Arduino → ESP32)

```json
{
  "ts": "2026-06-09T14:32:05",
  "temp_camara": 5.2,
  "umidade": 65.2,
  "temp_am2315c": 5.0,
  "modo": "COOL",
  "setpoint": 5.0,
  "pid_out": 67,
  "corrente_peltier": 5.2,
  "corrente_ptc": 0.0,
  "rpm_fan": 1850,
  "processo": true,
  "alerta": null
}
```

> O campo `"ts"` vem do RTC. O ESP32 publica no MQTT e escuta um tópico de retorno para receber `setpoint`, START/STOP remoto etc. (controle bidirecional).

---

## 7.11 Esqueleto do `loop()` (Arduino)

```cpp
void loop() {
    verificarBotoes();
    medirRPM();
    lerSensores();                 // entrada (DS18B20), umidade (AM2315C), correntes (IS)

    if (processoAtivo && !estadoEmergencia) {
        selecionarModo();          // Frio/Quente com banda morta + intervalo 30s
        meuPID.Compute();          // atualiza saidaPID (0..100)
        aplicarPotencia();         // intertravamento + PWM 1 Hz
    } else {
        desligarTudo();
    }

    static unsigned long t1Hz = 0;
    if (millis() - t1Hz >= 1000) { // tarefas de 1 Hz
        t1Hz = millis();
        gravarLog(/*...*/);
        enviarJSON();              // Serial1 → ESP32
        atualizarNextion();        // Serial2
    }
}
```

---

## 7.12 ESP32 — Gateway MQTT (resumo)

```cpp
// Pseudo-fluxo
setup():
  WiFi.begin(SSID, SENHA);
  mqtt.setServer(BROKER, 1883);
  mqtt.setCallback(aoReceberComando);  // tópico de comando (setpoint, start/stop)

loop():
  if (!mqtt.connected()) reconectar();
  mqtt.loop();
  if (Serial.available()) {
      String json = Serial.readStringUntil('\n');   // recebe do Arduino
      mqtt.publish("camara/telemetria", json.c_str());
  }
```

> Tópicos sugeridos: `camara/telemetria` (publish) e `camara/comando` (subscribe). O comando recebido é repassado ao Arduino pela mesma Serial.

---

## 7.13 Tabela de Estados do Sistema

| Evento | BTS (12 V) | Arduino | Nextion | Dashboard |
|---|---|---|---|---|
| Boot | Habilitado, modo PARADO | Inicializando | "Aguard. START" | boot: true |
| START | Habilitado | processoAtivo=true | "RODANDO" | processo: true |
| STOP | Software OFF | processoAtivo=false | "PARADO" | processo: false |
| Emergência | **Cortado em HW** | estadoEmergencia=true | "EMERGENCIA" | alerta: EMERGENCIA |
| Cogumelo liberado | Ainda cortado (HW) | estadoEmergencia=false | "Aguard. START" | aguardando: START |
| START pós‑emergência | Reabilitado | processoAtivo=true | "RODANDO" | processo: true |
| Fan parada (frio) | Software OFF | processoAtivo=false | "FALHA FAN" | alerta: FAN_PARADA |

---

## 7.14 Checklist da ETAPA 7

- [ ] Bibliotecas instaladas (PID, OneWire/Dallas, AM2315, RTClib, SD)
- [ ] Pinos definidos conforme [ETAPA 6](cabos_comandos.md)
- [ ] RTC acertado uma vez (`rtc.adjust`) e comentado de volta
- [ ] PID com PWM 1 Hz funcionando (testar duty manual primeiro)
- [ ] Intertravamento validado (nunca os 2 BTS juntos)
- [ ] Intervalo de 30 s na troca de modo
- [ ] START/STOP/EMERGÊNCIA conforme 7.6
- [ ] Proteção de RPM testada (desligar fan manualmente → sistema para)
- [ ] Log CSV sendo gravado no SD a 1 Hz
- [ ] JSON chegando ao ESP32 e publicando no MQTT

> Próxima etapa: [ETAPA 8 — Montagem e Comissionamento](montagem_comissionamento.md).
