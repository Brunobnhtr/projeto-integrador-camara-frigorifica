# CAMADA 4 · Doc 40 — Firmware do Arduino Mega

> O software de controle em tempo real: máquina de estados, PID com PWM lento, intertravamento, START/STOP pelo botão ou pela IHM, watchdog, proteções e registro em SD.
>
> ✅ **Pré-requisito:** Camada 3 concluída e ensaiada. **Grave e teste o firmware em bancada antes de instalar tudo na maquete.**

---

## 🟢 Em palavras simples — como o programa decide o que fazer

O firmware faz três coisas, e só três:

1. **Lê** a temperatura de dentro da câmara
2. **Compara** com a temperatura que você pediu
3. **Decide** ligar o frio, o calor, ou nada — e com que intensidade

O resto do documento é o detalhamento disso.

### O que é um PID, sem matemática

Imagine dirigir mantendo 60 km/h. Você não pisa 100 % no acelerador nem tira o pé — você **dosa**. E dosa olhando três coisas:

| Você olha | No PID chama-se | O que faz |
|---|---|---|
| "Estou longe dos 60?" | **P** — Proporcional | Quanto mais longe, mais forte a correção |
| "Faz tempo que estou abaixo?" | **I** — Integral | Corrige o erro que insiste em ficar |
| "Estou acelerando rápido demais?" | **D** — Derivativo | Segura antes de passar do ponto |

O PID é isso. **É um motorista automático para temperatura**, e as letras são só três formas de olhar o mesmo erro.

### Por que o PWM é lento (1 vez por segundo)

**PWM** é a forma de entregar "meia potência" a algo que só sabe ligar e desligar: você liga e desliga muito rápido, e a média dá o valor intermediário. É como piscar uma lâmpada rápido demais para o olho ver — parece meia luz.

O Arduino faz isso naturalmente **490 vezes por segundo**. Para a nossa Peltier, isso é péssimo:

> Cada liga-desliga dá um pequeno **choque térmico** na pastilha. A 490 Hz são 490 choques por segundo — milhares de ciclos que a fadigam e descolam as junções internas. O fabricante recomenda corrente contínua ou chaveamento **muito lento**.

Então usamos **1 Hz**: um ciclo por segundo. Duty de 30 % significa "ligada 0,3 s, desligada 0,7 s, e repete". Como a câmara leva **minutos** para mudar de temperatura, ela nem percebe essa ondulação — mas a pastilha agradece.

### O que é uma máquina de estados

É uma forma de organizar o programa que impede uma classe inteira de bug. Em vez de várias variáveis soltas (`ligado?`, `emergência?`, `falhou?`) que podem se contradizer, o sistema está **sempre em exatamente um estado**:

```
   BOOT ──► AGUARDA_START ──► RODANDO
                  ▲              │
                  │              ▼
                  └────── FALHA / EMERGENCIA
```

E existe uma regra que atravessa tudo:

> ⚠️ **De FALHA ou EMERGENCIA só se sai para AGUARDA_START — nunca direto para RODANDO.**

É essa regra, e só ela, que impede a máquina de religar sozinha depois de um problema. **Não pode ser removida.**

### As 4 proteções do firmware, em ordem de importância

| # | Proteção | O que evita |
|---|---|---|
| 1 | **RPM dos coolers** | Peltier sem dissipação queima em < 1 min. Cooler parado = desliga na hora |
| 2 | **Intertravamento** | Peltier e PTC ligadas juntas — brigariam, gastando energia para nada |
| 3 | **Watchdog** | Programa travado. Se ele não "der sinal de vida" em 2 s, o processador reinicia |
| 4 | **Diagnóstico de corrente (IS)** | Atuador desconectado ou queimado — duty alto com corrente zero |

> 🎯 **O watchdog só funciona por causa de um resistor.** Quando o Arduino reinicia, os pinos viram entrada e ficam "soltos". Se não houvesse o resistor de pull-down puxando o `R_EN` para zero, o driver poderia ficar num estado indefinido justamente durante o reset. O software e o hardware se protegem **juntos** — ver [Doc 33](../camada_3_eletrica/33_placa_interface_componentes.md).

### Dicionário rápido

| Termo | O que quer dizer |
|---|---|
| **Firmware** | O programa que roda dentro do microcontrolador |
| **Setpoint (SP)** | A temperatura que você pediu |
| **PID** | O "motorista automático" que dosa a potência |
| **PWM** | Ligar e desligar rápido para simular potência intermediária |
| **Duty cycle** | A porcentagem de tempo ligado dentro de um ciclo |
| **Banda morta** | Faixa em volta do alvo onde o sistema não age, para não ficar corrigindo à toa |
| **Máquina de estados** | Organização do programa em situações bem definidas |
| **Watchdog** | Cão de guarda: reinicia o processador se o programa travar |
| **Trip** | Desligamento automático por falha |
| **Windup** | Defeito do PID quando o integrador "acumula" durante um bloqueio |
| **Degelo** | Aquecer de propósito, por pouco tempo, para derreter o gelo |
| **Interrupção (ISR)** | Trecho de código que roda imediatamente quando um sinal chega |

---

## 40.1 O que mudou em relação à versão anterior

| # | Mudança | Motivo |
|---|---|---|
| 1 | **RPM migrou de D13 para D3** | D13 **não é pino de interrupção** no Mega — a proteção nunca funcionou ([Doc 32 §32.1](../camada_3_eletrica/32_sinais_e_sensores.md)) |
| 1b | ⭐ **Segundo canal de RPM em A8 (PCINT16)** | Com **2 Peltier em série** são 2 dissipadores e 2 coolers. Como só o D3 sobrou entre as interrupções externas, o 2º tacômetro entra por interrupção de mudança de pino (§40.7) |
| 1c | ⭐ **Divisor do D25 mudou para 22 k / 4,7 k** | O BD-POT passou de 12 V para **24 V**. Com os resistores antigos chegariam **7,67 V** no pino e a entrada seria danificada ([Doc 33](../camada_3_eletrica/33_placa_interface_componentes.md)) |
| 2 | **Corte de potência pelo `R_EN` + pull-down + watchdog** | O firmware desabilita os drivers, e o pull-down garante que um Arduino resetado deixe tudo desligado |
| 3 | **Novo pino D25 ← realimentação do K1** | O firmware passa a **saber** se a potência está realmente armada |
| 4 | **STOP passa a ser lido como NA** | A versão anterior declarava NF mas testava `LOW` como "pressionado" — logicamente inconsistente |
| 5 | **PID com saída bipolar (−100 a +100)** | Uma única malha resolve frio e quente; o sinal da saída escolhe o atuador |
| 6 | **Ciclo de degelo** | Sem ele, o gelo na placa fria degrada a refrigeração ao longo da operação |
| 7 | **Máquina de estados explícita** | A versão anterior usava flags soltas (`processoAtivo`, `estadoEmergencia`), difíceis de auditar |
| 8 | **Leitura do IS sincronizada com o PWM** | Ler a corrente enquanto o PWM está desligado sempre retorna zero |
| 9 | **Acionamento em dois estágios** | STOP e EMERGÊNCIA cortam em **hardware**; START e STOP normais funcionam **pelo botão físico ou pela IHM**. O rearme após emergência é o botão azul S3, que o firmware nem lê |
| 10 | **Watchdog habilitado** | Sem ele, um travamento deixaria a Peltier ligada. Com ele, o Mega reseta em 2 s e os pull-downs desligam os drivers |
| 11 | **Pull-down de 10 kΩ em cada `R_EN`** | Garante que **pino flutuante = driver desligado**. É o que torna o watchdog realmente eficaz |

---

## 40.2 Bibliotecas

| Biblioteca | Uso |
|---|---|
| `OneWire` + `DallasTemperature` | DS18B20 |
| `Wire` | Barramento I²C |
| `Adafruit_AHTX0` (ou equivalente do AM2315C) | Umidade e temperatura |
| `RTClib` | RTC DS3231 |
| `SD` | Log em cartão |
| `PID_v1` (Brett Beauregard) | Malha de controle |

---

## 40.3 Definições e pinagem

```cpp
// ============================================================
//  MINI CÂMARA FRIGORÍFICA — PROJETO INTEGRADOR
//  Arduino Mega 2560 · Controle PID · Intertravamento · IoT
// ============================================================

#include <OneWire.h>
#include <DallasTemperature.h>
#include <Wire.h>
#include <RTClib.h>
#include <SD.h>
#include <PID_v1.h>

// ---------- ATUADORES (BTS7960) — ALIMENTADOS EM 24 V ----------
#define BTS1_RPWM     5    // 2x PELTIER EM SERIE (FRIO)  24 V / 6,0 A - PWM lento
#define BTS1_REN      4    // Peltier  enable
#define BTS1_IS      A0    // Peltier  diagnóstico de corrente (cap 100 nF na PI-1)
#define BTS2_RPWM     6    // PTC 24 V (QUENTE)            24 V / 2,5 A - PWM lento
#define BTS2_REN      7    // PTC      enable
#define BTS2_IS      A1    // PTC      diagnóstico de corrente (cap 100 nF na PI-1)

// ---------- SENSORES ----------
#define PINO_DS18B20  2    // 1-Wire (pull-up 4,7k -> +5V, na placa PI-1)
#define PINO_RPM1     3    // cooler da Peltier #1. D3 = INT1. NAO usar D13 no Mega!
#define PINO_RPM2    A8    // cooler da Peltier #2 -> PCINT16 (PCINT2 / porta K)
#define SD_CS        53    // SPI chip select
// I2C: SDA=20, SCL=21 -> AM2315C (0x38) + DS3231 (0x68)

// ---------- COMANDO ----------
#define BTN_START    22    // bloco NA  -> LOW = pressionado
#define BTN_STOP     23    // bloco NA  -> LOW = pressionado
#define BTN_EMERG    24    // bloco NF  -> HIGH = EMERGÊNCIA ACIONADA
#define POTENCIA_OK  25    // divisor 22k/4k7 do BD-POT -> HIGH = 24 V presente
// D26 ficou LIVRE (era o comando do antigo relé K0)

// ⚠ Cada R_EN precisa de um resistor de 10 kΩ para 0 V (pull-down externo),
//   SOLDADO NO PRÓPRIO BTS7960 entre R_EN e GND — não na placa PI-1.
//   Assim, quando o Arduino reseta e os pinos viram entrada, OU quando o cabo
//   se solta, os drivers ficam DESABILITADOS. É isso que torna o watchdog
//   realmente eficaz. Ver Doc 33 §33.4.

// ---------- SINALIZAÇÃO ----------
#define LED_RUN       9    // verde
#define LED_COOL     10    // azul
#define LED_HEAT     11    // amarelo
#define LED_FAULT    12    // vermelho

// Desabilita os dois drivers imediatamente. É o corte de potência do software.
inline void desabilitarDrivers() {
    digitalWrite(BTS1_REN, LOW);   digitalWrite(BTS1_RPWM, LOW);
    digitalWrite(BTS2_REN, LOW);   digitalWrite(BTS2_RPWM, LOW);
}

// ---------- PARÂMETROS DE PROCESSO ----------
const unsigned long JANELA_PWM_MS      = 1000;          // PWM lento de 1 Hz
const unsigned long INTERVALO_TROCA_MS = 30000;         // 30 s entre frio<->quente
const double        BANDA_MORTA        = 5.0;           // % de duty (~0,6 °C com Kp=8)
const double        DUTY_MAXIMO        = 95.0;          // limite de segurança
const int           RPM_MINIMA         = 400;           // abaixo disso = fan parada
const unsigned long TEMPO_PARTIDA_FAN  = 5000;          // 5 s para a fan acelerar

// Degelo
const unsigned long DEGELO_INTERVALO_MS = 2UL*60*60*1000;  // a cada 2 h de frio
const unsigned long DEGELO_DURACAO_MS   =    3UL*60*1000;  // por 3 min
const double        DEGELO_DUTY         = 20.0;            // PTC em 20 %
```

---

## 40.4 Máquina de estados

```
                    ┌─────────┐
    energiza ──────►│  BOOT   │ autoteste dos sensores e do SD
                    └────┬────┘
                         │ autoteste ok
                         ▼
                ┌────────────────┐
       ┌───────►│ AGUARDA_START  │◄────────┐
       │        └────────┬───────┘         │
       │                 │ START + K1 armado
       │                 ▼                 │
       │        ┌────────────────┐         │ STOP
       │        │    RODANDO     ├─────────┘
       │        └───┬────────┬───┘
       │            │        │ falha detectada (RPM=0, IS anômalo)
       │  EMERGÊNCIA│        ▼
       │            │   ┌─────────┐
       │            │   │  FALHA  │  R_EN dos dois em nível baixo
       │            │   └────┬────┘
       │            ▼        │
       │      ┌───────────┐  │
       └──────┤EMERGENCIA │◄─┘  (cogumelo destravado / falha reconhecida)
              └───────────┘
```

```cpp
enum Estado  { BOOT, AGUARDA_START, RODANDO, EMERGENCIA, FALHA };
enum Modo    { PARADO, RESFRIAMENTO, AQUECIMENTO, DEGELO };

Estado estado = BOOT;
Modo   modo   = PARADO;
char   alerta[24] = "";
```

> 🎯 **Regra que atravessa toda a máquina de estados:** de `EMERGENCIA` ou `FALHA` **só se sai para `AGUARDA_START`** — nunca direto para `RODANDO`. É esta regra, e só ela, que impede a máquina de religar sozinha. Como não há mais selo em hardware, **ela não pode ser removida.**

---

## 40.5 PID e PWM lento

### Por que PWM de 1 Hz

O PWM nativo do Arduino roda a ~490 Hz ou ~980 Hz. Isso é **péssimo** para os dois atuadores:

| Atuador | Problema com PWM rápido |
|---|---|
| **Peltier** | Cada ciclo liga/desliga provoca um micro-choque térmico na junção. Milhares de ciclos por segundo causam **fadiga mecânica e descolamento** da pastilha. Fabricantes recomendam corrente contínua ou chaveamento **muito lento** |
| **PTC** | A constante de tempo térmica é de vários segundos — chavear a 1 kHz não muda nada, só gera EMI |

Com **1 Hz**, cada ciclo dura 1 s: a Peltier fica ligada por `duty%` de cada segundo. A inércia térmica da câmara (constante de tempo de minutos) filtra completamente essa ondulação.

### Código

```cpp
double setpoint = 5.0;     // °C — vem da Nextion ou do MQTT
double entrada  = 0.0;     // °C — DS18B20
double saidaPID = 0.0;     // −100 (frio máximo) .. +100 (quente máximo)

double Kp = 8.0, Ki = 0.2, Kd = 1.0;
PID meuPID(&entrada, &saidaPID, &setpoint, Kp, Ki, Kd, DIRECT);

unsigned long inicioJanela = 0;

void setupPID() {
    meuPID.SetOutputLimits(-100, 100);   // saída BIPOLAR
    meuPID.SetSampleTime(1000);          // recalcula a 1 Hz
    meuPID.SetMode(AUTOMATIC);
    inicioJanela = millis();
}

// Mantém a janela de 1 s alinhada, sem acumular deriva
void atualizarJanelaPWM() {
    unsigned long agora = millis();
    while (agora - inicioJanela >= JANELA_PWM_MS) inicioJanela += JANELA_PWM_MS;
}

// true enquanto estivermos dentro do tempo ligado da janela atual
bool pwmLentoAtivo(double duty) {
    if (duty <= 0)   return false;
    if (duty >= 100) return true;
    unsigned long tOn = (unsigned long)((duty / 100.0) * JANELA_PWM_MS);
    return (millis() - inicioJanela) < tOn;
}
```

> 💡 **Saída bipolar:** como o PID está em modo `DIRECT`, a saída fica **positiva quando falta calor** (temperatura abaixo do setpoint → aquecer) e **negativa quando sobra** (→ resfriar). Uma única malha resolve os dois modos, e o **sinal da saída escolhe o atuador**. É mais simples e mais estável do que manter dois PIDs separados.

---

## 40.6 Intertravamento e seleção de modo

```cpp
Modo          modoDesejado    = PARADO;
unsigned long ultimaTrocaModo = 0;

void selecionarModo() {
    Modo alvo;
    if      (saidaPID >  BANDA_MORTA) alvo = AQUECIMENTO;
    else if (saidaPID < -BANDA_MORTA) alvo = RESFRIAMENTO;
    else                              alvo = PARADO;

    if (alvo == modo) return;                       // nada a fazer

    // Ir para PARADO é sempre permitido e imediato
    if (alvo == PARADO) { modo = PARADO; return; }

    // Troca direta FRIO <-> QUENTE exige intervalo de 30 s
    bool trocaDireta = (modo == RESFRIAMENTO && alvo == AQUECIMENTO) ||
                       (modo == AQUECIMENTO  && alvo == RESFRIAMENTO);

    if (trocaDireta && (millis() - ultimaTrocaModo < INTERVALO_TROCA_MS)) {
        modo = PARADO;        // aguarda com os dois atuadores desligados
        return;
    }

    modo = alvo;
    ultimaTrocaModo = millis();
}

void desligarTudo() {
    digitalWrite(BTS1_REN, LOW);   digitalWrite(BTS1_RPWM, LOW);
    digitalWrite(BTS2_REN, LOW);   digitalWrite(BTS2_RPWM, LOW);
    digitalWrite(LED_COOL, LOW);   digitalWrite(LED_HEAT, LOW);
}

void aplicarPotencia() {
    atualizarJanelaPWM();
    double duty = min(fabs(saidaPID), DUTY_MAXIMO);

    switch (modo) {

      case RESFRIAMENTO:
        digitalWrite(BTS2_REN, LOW);      // ⚠ PTC desabilitado PRIMEIRO
        digitalWrite(BTS2_RPWM, LOW);
        digitalWrite(BTS1_REN, HIGH);
        digitalWrite(BTS1_RPWM, pwmLentoAtivo(duty));
        digitalWrite(LED_COOL, HIGH);  digitalWrite(LED_HEAT, LOW);
        break;

      case AQUECIMENTO:
        digitalWrite(BTS1_REN, LOW);      // ⚠ Peltier desabilitada PRIMEIRO
        digitalWrite(BTS1_RPWM, LOW);
        digitalWrite(BTS2_REN, HIGH);
        digitalWrite(BTS2_RPWM, pwmLentoAtivo(duty));
        digitalWrite(LED_HEAT, HIGH);  digitalWrite(LED_COOL, LOW);
        break;

      case DEGELO:
        digitalWrite(BTS1_REN, LOW);
        digitalWrite(BTS1_RPWM, LOW);
        digitalWrite(BTS2_REN, HIGH);
        digitalWrite(BTS2_RPWM, pwmLentoAtivo(DEGELO_DUTY));
        digitalWrite(LED_HEAT, HIGH);  digitalWrite(LED_COOL, HIGH);  // ambos = degelo
        break;

      default:
        desligarTudo();
        break;
    }
}
```

> ⚠️ **A ordem das instruções é a garantia do intertravamento.** Em todos os casos, o driver que vai desligar é desabilitado **antes** de o outro ser habilitado. Se a ordem fosse invertida, existiria uma janela de alguns microssegundos com os dois ativos ao mesmo tempo.

---

## 40.7 Proteção de RPM (a mais crítica)

> 🔄 **Agora são DOIS coolers a vigiar.** Com duas pastilhas Peltier, cada uma tem o seu dissipador e o seu cooler — e **a parada de qualquer um dos dois já é motivo de trip**. Uma pastilha sem dissipação queima em menos de um minuto, e o firmware não tem como saber qual delas ficou sem ar se monitorar só um sinal.

> ⚠️ **Por que o segundo tacômetro não usa `attachInterrupt`:** no Mega, as interrupções externas ficam em D2, D3, D18, D19, D20 e D21. D2 é o 1-Wire, D18/D19 são a Serial1 (ESP32) e D20/D21 são o I²C. **Sobra só o D3.** O segundo cooler entra por **interrupção de mudança de pino (PCINT)**, que o Mega oferece nas portas B, J e K — usamos **A8 (PCINT16)**.

```cpp
volatile unsigned long pulsosRPM1  = 0;   // cooler da Peltier #1  (D3, INT1)
volatile unsigned long pulsosRPM2  = 0;   // cooler da Peltier #2  (A8, PCINT16)
unsigned long ultimaMedidaRPM      = 0;
unsigned long inicioModoFrio       = 0;
int rpmAtual1 = 0, rpmAtual2 = 0;

void isrRPM1() { pulsosRPM1++; }

// PCINT2 cobre a porta K (A8..A15). Conta apenas as bordas de descida.
ISR(PCINT2_vect) {
    static uint8_t anterior = 0xFF;
    uint8_t agora = PINK;
    if ((anterior & _BV(PK0)) && !(agora & _BV(PK0))) pulsosRPM2++;
    anterior = agora;
}

void setupRPM() {
    pinMode(PINO_RPM1, INPUT_PULLUP);
    attachInterrupt(digitalPinToInterrupt(PINO_RPM1), isrRPM1, FALLING);

    pinMode(PINO_RPM2, INPUT_PULLUP);
    PCICR  |= _BV(PCIE2);      // habilita o grupo PCINT16..23 (porta K)
    PCMSK2 |= _BV(PCINT16);    // habilita especificamente o A8
}

void medirRPM() {
    if (millis() - ultimaMedidaRPM < 1000) return;
    ultimaMedidaRPM = millis();

    noInterrupts();
    unsigned long p1 = pulsosRPM1;  pulsosRPM1 = 0;
    unsigned long p2 = pulsosRPM2;  pulsosRPM2 = 0;
    interrupts();

    rpmAtual1 = (p1 * 60) / 2;    // 2 pulsos por rotação
    rpmAtual2 = (p2 * 60) / 2;

    // Só protege quando as Peltier estão ativas há tempo suficiente
    // para as fans já terem acelerado (evita falso trip na partida)
    if (modo == RESFRIAMENTO && estado == RODANDO &&
        (millis() - inicioModoFrio > TEMPO_PARTIDA_FAN)) {

        if (rpmAtual1 < RPM_MINIMA) dispararTrip("FAN1_PARADA");
        if (rpmAtual2 < RPM_MINIMA) dispararTrip("FAN2_PARADA");
    }
}
```

> 📌 **Identifique QUAL fan parou no alarme.** `FAN1_PARADA` e `FAN2_PARADA` como motivos distintos economizam muito tempo de diagnóstico — e aparecem na Nextion e no log do SD, o que é ótimo material para o relatório de ensaios.

### O trip: cortar a potência em HARDWARE

```cpp
void dispararTrip(const char* motivo) {
    desabilitarDrivers();              // ⚡ corta a saída dos dois drivers
    desligarTudo();
    digitalWrite(LED_RUN, LOW);
    digitalWrite(LED_FAULT, HIGH);
    strncpy(alerta, motivo, sizeof(alerta) - 1);
    estado = FALHA;
    meuPID.SetMode(MANUAL);            // congela o integrador (evita windup)
    saidaPID = 0;
}
```

> 🎯 **Esta é a diferença entre a versão anterior e esta.** Antes, o trip apenas colocava `R_EN = LOW` — se o pino travasse em nível alto, a Peltier continuaria ligada. Agora o firmware **abre um relé**, e o corte é físico. O software participa da segurança, mas a segurança não depende dele.

---

## 40.8 Diagnóstico de corrente (pino IS)

### Como converter a leitura do ADC em ampères

O pino `IS` do BTS7960 é uma **saída de corrente espelhada**: `I_IS = I_carga / 8500`. O módulo traz um resistor de medida de 1 kΩ para o terra, então:

```
V_IS   = (I_carga / 8500) × 1000 Ω = I_carga × 0,1176 V/A
ADC    = V_IS × (1023 / 5 V)       = I_carga × 24,1 contagens/A

  →  FATOR_CORRENTE = 1 / 24,1 = 0,0415 A por contagem

Verificação: a 6 A → 145 contagens → resolução de ~0,04 A. Adequado.
```

```cpp
const float FATOR_CORRENTE = 0.0415;   // A/contagem — CALIBRAR na prática

// ⚠️ Só faz sentido ler enquanto o PWM está LIGADO.
// Lendo durante o tempo desligado, o resultado é sempre zero.
float lerCorrente(int pinoIS, int pinoPWM) {
    if (digitalRead(pinoPWM) == LOW) return -1.0;   // −1 = "não medido agora"
    long soma = 0;
    for (int i = 0; i < 8; i++) soma += analogRead(pinoIS);   // média de 8 amostras
    return (soma / 8.0) * FATOR_CORRENTE;
}
```

### Detecção de falha de carga

| Sintoma | Causa provável | Ação |
|---|---|---|
| Duty > 50 % e corrente ≈ 0 A | Atuador desconectado ou queimado; **fusível F1 aberto** ou ligação em série das Peltier interrompida | Trip `CARGA_ABERTA` |
| Corrente > 8 A | Curto no atuador ou no cabo | Trip `SOBRECORRENTE` |
| Corrente 30 % abaixo do esperado | Peltier degradada, mau contato | Alerta (sem trip) |

```cpp
void verificarCarga(float i, double duty) {
    if (i < 0) return;                                  // não medido nesta janela
    if (duty > 50.0 && i < 0.5)  dispararTrip("CARGA_ABERTA");
    if (i > 8.0)                 dispararTrip("SOBRECORRENTE");
}
```

> 🔧 **Calibração do `FATOR_CORRENTE`:** ligue a Peltier em 100 % de duty, meça a corrente real com um alicate amperímetro (ou um multímetro em série) e compare com a leitura do ADC. Ajuste o fator até bater. Anote o valor calibrado no relatório.

---

## 40.9 Ciclo de degelo

```cpp
unsigned long tempoAcumuladoFrio = 0;
unsigned long ultimoTickFrio     = 0;
unsigned long inicioDegelo       = 0;

void gerenciarDegelo() {
    // Acumula tempo de operação em frio
    if (modo == RESFRIAMENTO) {
        if (ultimoTickFrio) tempoAcumuladoFrio += millis() - ultimoTickFrio;
        ultimoTickFrio = millis();
    } else {
        ultimoTickFrio = 0;
    }

    // Entra em degelo
    if (modo == RESFRIAMENTO && tempoAcumuladoFrio > DEGELO_INTERVALO_MS) {
        modo = DEGELO;
        inicioDegelo = millis();
        meuPID.SetMode(MANUAL);
        strncpy(alerta, "DEGELO", sizeof(alerta) - 1);
    }

    // Sai do degelo
    if (modo == DEGELO && millis() - inicioDegelo > DEGELO_DURACAO_MS) {
        modo = PARADO;
        tempoAcumuladoFrio = 0;
        ultimaTrocaModo = millis();   // respeita o intervalo de 30 s antes de voltar ao frio
        meuPID.SetMode(AUTOMATIC);
        alerta[0] = '\0';
    }
}
```

> ❄️ **Por que o degelo importa:** a umidade da câmara condensa e congela na placa fria da Peltier. O gelo é isolante e bloqueia as aletas — a capacidade de refrigeração cai progressivamente ao longo da operação. Aquecer levemente por 3 minutos derrete o gelo, que escorre para a bandeja e sai pelo dreno. **As fans continuam ligadas durante o degelo**, para distribuir o calor e ajudar a derreter.

---

## 40.10 Botões e transições de estado

```cpp
// Pedidos vindos da IHM ou do MQTT (§41.3). O botão físico é lido direto.
bool pedidoStart = false;
bool pedidoStop  = false;

bool emergenciaAtiva()    { return digitalRead(BTN_EMERG) == HIGH; }  // NF aberto
bool potenciaDisponivel() { return digitalRead(POTENCIA_OK) == HIGH; }

// START e STOP: botão FÍSICO **ou** IHM — exatamente equivalentes
bool pedidoDeStart() { return digitalRead(BTN_START) == LOW || pedidoStart; }
bool pedidoDeStop()  { return digitalRead(BTN_STOP)  == LOW || pedidoStop;  }

void maquinaDeEstados() {

    // EMERGÊNCIA tem prioridade absoluta, em qualquer estado
    if (emergenciaAtiva() && estado != EMERGENCIA) {
        desabilitarDrivers();
        desligarTudo();
        digitalWrite(LED_RUN, LOW);
        digitalWrite(LED_FAULT, HIGH);
        strncpy(alerta, "EMERGENCIA", sizeof(alerta) - 1);
        meuPID.SetMode(MANUAL);
        estado = EMERGENCIA;
        return;
    }

    switch (estado) {

      case BOOT:
        if (autoTesteOK()) estado = AGUARDA_START;
        break;

      case AGUARDA_START:
        digitalWrite(LED_FAULT, LOW);
        // START pode vir do botão FÍSICO ou da IHM — os dois são equivalentes
        if (pedidoDeStart()) {
            delay(50);                            // debounce
            if (!potenciaDisponivel()) {          // 12 V não chegou aos BTS
                strncpy(alerta, "SEM_POTENCIA", sizeof(alerta) - 1);
                break;                             // não inicia; provável fusível ou emergência
            }
            meuPID.SetMode(AUTOMATIC);
            digitalWrite(LED_RUN, HIGH);
            alerta[0] = '\0';
            pedidoStart = false;
            estado = RODANDO;
        }
        break;

      case RODANDO:
        // A emergência derrubou o KA1 sem passar pelo bloco de 5 V? (fio solto)
        if (!potenciaDisponivel()) { dispararTrip("POTENCIA_PERDIDA"); break; }

        // STOP pode vir do botão FÍSICO ou da IHM
        if (pedidoDeStop()) {
            desabilitarDrivers();
            desligarTudo();
            digitalWrite(LED_RUN, LOW);
            meuPID.SetMode(MANUAL);
            pedidoStop = false;
            estado = AGUARDA_START;
        }
        break;

      case EMERGENCIA:
        if (!emergenciaAtiva()) {                 // cogumelo destravado
            digitalWrite(LED_FAULT, LOW);
            alerta[0] = '\0';
            pedidoStart = false;                  // descarta START pendente
            estado = AGUARDA_START;               // ⚠ NÃO religa sozinho
        }
        break;

      case FALHA:
        // Só sai por reconhecimento: STOP pressionado por 2 s
        static unsigned long tSegurandoStop = 0;
        if (stopPressionado()) {
            if (!tSegurandoStop) tSegurandoStop = millis();
            if (millis() - tSegurandoStop > 2000) {
                digitalWrite(LED_FAULT, LOW);
                alerta[0] = '\0';
                tSegurandoStop = 0;
                estado = AGUARDA_START;
            }
        } else tSegurandoStop = 0;
        break;
    }
}
```

---

## 40.11 Log em cartão SD

Arquivo `LOG_AAAAMMDD.CSV`, um por dia, criado automaticamente.

```
timestamp,temp,umid,temp_am,setpoint,modo,duty,i_peltier,i_ptc,rpm,estado,alerta
2026-08-12T14:32:05,5.2,65.2,5.0,5.0,COOL,67,5.21,0.00,1850,RODANDO,
```

```cpp
RTC_DS3231 rtc;

void gravarLog(float temp, float umid, float tempAm, const char* modoStr,
               int duty, float iPelt, float iPtc, int rpm, const char* estadoStr) {
    DateTime now = rtc.now();
    char ts[20], nome[16];
    snprintf(ts,   sizeof(ts),   "%04d-%02d-%02dT%02d:%02d:%02d",
             now.year(), now.month(), now.day(),
             now.hour(), now.minute(), now.second());
    snprintf(nome, sizeof(nome), "LOG_%04d%02d%02d.CSV",
             now.year(), now.month(), now.day());

    File f = SD.open(nome, FILE_WRITE);
    if (!f) return;
    if (f.size() == 0)
        f.println(F("timestamp,temp,umid,temp_am,setpoint,modo,duty,"
                    "i_peltier,i_ptc,rpm,estado,alerta"));

    f.print(ts);        f.print(',');
    f.print(temp, 2);   f.print(',');
    f.print(umid, 1);   f.print(',');
    f.print(tempAm, 2); f.print(',');
    f.print(setpoint,1);f.print(',');
    f.print(modoStr);   f.print(',');
    f.print(duty);      f.print(',');
    f.print(iPelt, 2);  f.print(',');
    f.print(iPtc, 2);   f.print(',');
    f.print(rpm);       f.print(',');
    f.print(estadoStr); f.print(',');
    f.println(alerta);
    f.close();
}
```

> 1 registro por segundo ≈ **90 KB por dia**. Um cartão de 8 GB guarda mais de 200 anos de operação. O log é a **fonte da verdade** do sistema: mesmo sem Wi-Fi, nada se perde (arquitetura *offline-first*).

---

## 40.12 O `loop()` principal

```cpp
#include <avr/wdt.h>

void setup() {
    // ⚠ PRIMEIRA COISA: garantir os drivers desabilitados antes de qualquer outra
    //   inicialização. Com os pull-downs de 10 kΩ, os pinos já nascem em 0 V.
    pinMode(BTS1_REN, OUTPUT);  digitalWrite(BTS1_REN, LOW);
    pinMode(BTS2_REN, OUTPUT);  digitalWrite(BTS2_REN, LOW);
    pinMode(BTS1_RPWM, OUTPUT); digitalWrite(BTS1_RPWM, LOW);
    pinMode(BTS2_RPWM, OUTPUT); digitalWrite(BTS2_RPWM, LOW);

    wdt_disable();             // desarma antes de configurar (evita loop de reset)

    Serial.begin(115200);      // debug
    Serial1.begin(115200);     // ESP32
    Serial2.begin(9600);       // Nextion

    pinMode(LED_RUN, OUTPUT);   pinMode(LED_COOL, OUTPUT);
    pinMode(LED_HEAT, OUTPUT);  pinMode(LED_FAULT, OUTPUT);

    pinMode(BTN_START,   INPUT_PULLUP);
    pinMode(BTN_STOP,    INPUT_PULLUP);
    pinMode(BTN_EMERG,   INPUT_PULLUP);
    pinMode(POTENCIA_OK, INPUT);       // divisor resistivo — sem pull-up!

    desligarTudo();
    setupRPM();
    setupPID();
    sensores.begin();
    Wire.begin();
    rtc.begin();
    SD.begin(SD_CS);

    // ⚡ Watchdog: se o loop travar por mais de 2 s, o Mega reseta.
    //   No reset os pinos viram entrada, os pull-downs de 10 kΩ levam
    //   os R_EN a 0 V e os drivers desligam sozinhos.
    wdt_enable(WDTO_2S);
}

void loop() {
    wdt_reset();                       // ⚡ "estou vivo" — some daqui e o Mega reseta
    processarComandoRemoto();          // START/STOP/receita vindos da IHM
    maquinaDeEstados();
    medirRPM();
    lerSensores();                         // entrada, umidade, temperatura de referência

    if (estado == RODANDO) {
        gerenciarDegelo();
        if (modo != DEGELO) {
            meuPID.Compute();
            selecionarModo();
        }
        aplicarPotencia();

        float iPelt = lerCorrente(BTS1_IS, BTS1_RPWM);
        float iPtc  = lerCorrente(BTS2_IS, BTS2_RPWM);
        if (modo == RESFRIAMENTO) verificarCarga(iPelt, fabs(saidaPID));
        if (modo == AQUECIMENTO)  verificarCarga(iPtc,  fabs(saidaPID));
    } else {
        desligarTudo();
    }

    // Tarefas de 1 Hz
    static unsigned long t1Hz = 0;
    if (millis() - t1Hz >= 1000) {
        t1Hz = millis();
        gravarLog(/* ... */);
        enviarJSON();          // Serial1 → ESP32
        atualizarNextion();    // Serial2
    }
}
```

> ⚠️ **Nunca use `delay()` no `loop()`** (exceto os 50 ms de debounce). Um `delay(1000)` congelaria a leitura da emergência e da RPM por um segundo inteiro — tempo mais que suficiente para danificar a Peltier.

---

## 40.13 Ajuste do PID

| Passo | O que fazer |
|---|---|
| 1 | Comece com **Ki = 0, Kd = 0**. Suba o **Kp** até a temperatura responder rápido e começar a oscilar levemente |
| 2 | Reduza o Kp para ~60 % desse valor |
| 3 | Acrescente **Ki pequeno** (0,05 a 0,3) para eliminar o erro em regime permanente |
| 4 | Use **Kd** com moderação (0 a 2). Cargas térmicas são lentas: Kd alto amplifica o ruído do sensor e faz a saída "tremer" |
| 5 | Registre os ganhos finais **e a curva de resposta** (exporte o CSV do SD e faça o gráfico no Excel) |

| Sintoma | Causa | Correção |
|---|---|---|
| Oscila em torno do setpoint | Kp alto demais | Reduzir Kp |
| Nunca chega ao setpoint (erro fixo) | Falta ação integral | Aumentar Ki |
| Ultrapassa muito e volta (overshoot) | Ki alto ou Kd baixo | Reduzir Ki, aumentar Kd |
| Duty oscilando rapidamente | Kd alto amplificando ruído | Reduzir Kd; verificar aterramento |
| Fica trocando frio↔quente | Banda morta pequena | Aumentar `BANDA_MORTA` |

> 📊 **A curva de resposta do PID (temperatura × tempo, com o setpoint marcado) é o gráfico mais importante do relatório.** Exporte do CSV do SD.

---

## 40.14 ✅ Checklist de aceitação

- [ ] Bibliotecas instaladas e compilando sem avisos
- [ ] **RPM no D3** com interrupção confirmada (sketch de teste contando pulsos)
- [ ] **Pull-down de 10 kΩ** instalado em cada `R_EN` — com o Arduino DESLIGADO, medir ~0 V nos dois
- [ ] **Watchdog testado**: gravar um sketch com `while(1);` proposital e confirmar o reset em ~2 s
- [ ] **START funciona pelo botão físico E pela IHM**
- [ ] **STOP funciona pelo botão físico E pela IHM**
- [ ] Após a emergência ser destravada, **a energia não volta** (é hardware — medir 0 V no BD-POT)
- [ ] Após o REARME, a energia volta mas **o processo continua parado**
- [ ] Divisor do `POTENCIA_OK` medido: ~3,8 V com o KA1 fechado, ~0 V com a emergência acionada
- [ ] PWM lento verificado com osciloscópio ou LED: 1 Hz, duty variável
- [ ] **Intertravamento validado:** com o osciloscópio nos dois `RPWM`, nunca há sobreposição
- [ ] Intervalo de 30 s na troca de modo verificado com cronômetro
- [ ] `FATOR_CORRENTE` calibrado com medição real e anotado
- [ ] Trip de RPM testado: parar a fan → K1 cai fisicamente (medir 0 V no bloco BD-POT)
- [ ] Trip de carga aberta testado: desconectar a Peltier com o sistema rodando
- [ ] Emergência: acionar → não religa ao destravar → só volta com START
- [ ] Ciclo de degelo testado (reduza `DEGELO_INTERVALO_MS` para 2 min durante o teste)
- [ ] Log CSV gravando a 1 Hz com timestamp correto do RTC
- [ ] JSON chegando ao ESP32
- [ ] Ganhos do PID ajustados e curva de resposta exportada

---

📄 **Anterior:** [Doc 32 — Sinais e Sensores](../camada_3_eletrica/32_sinais_e_sensores.md) · **Próximo:** [Doc 41 — ESP32, IHM e IoT](41_esp32_ihm_iot.md)
