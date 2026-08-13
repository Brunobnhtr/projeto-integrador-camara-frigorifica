/* ═══════════════════════════════════════════════════════════════════════
   PROJETO INTEGRADOR — CÂMARA FRIGORÍFICA
   Firmware de bancada para simulação no Wokwi (wokwi.com)

   Roda a MESMA lógica do firmware final (Doc 40): máquina de estados,
   PID bipolar, PWM lento de 1 Hz, intertravamento, proteção de RPM,
   modo ciclo e trip por falha.

   O que muda em relação ao firmware real:
     · os BTS7960 viram LEDs (dá para ver o PWM lento piscando)
     · a temperatura vem do DS18B20 do Wokwi (ajustável com o mouse)
     · a fan do dissipador é simulada: o pino D30 gera os pulsos do
       tacômetro e é ligado por fio ao D3, que é o pino real do projeto
     · a Nextion vira o Monitor Serial
     · KA1/KA2 viram uma chave deslizante no D25 ("potência disponível")

   O PID é escrito à mão de propósito: assim o sketch compila no Wokwi
   sem depender de nenhuma biblioteca além de OneWire/DallasTemperature.
   ═══════════════════════════════════════════════════════════════════════ */

#include <OneWire.h>
#include <DallasTemperature.h>
#include <avr/wdt.h>

// ─────────────────────────── PINAGEM (Doc 32) ───────────────────────────
#define BTS1_REN      4    // habilita o driver do FRIO   (LED verde)
#define BTS1_RPWM     5    // PWM lento do FRIO           (LED azul)
#define BTS2_REN      7    // habilita o driver do QUENTE
#define BTS2_RPWM     6    // PWM lento do QUENTE         (LED vermelho)

#define PINO_DS18B20  2    // 1-Wire
#define PINO_RPM      3    // ⚠ INT1 — D13 NÃO é interrupção no Mega
#define SIM_TACOMETRO 30   // só na simulação: liga por fio no D3

#define BTN_START    22    // NA  → LOW = pressionado
#define BTN_STOP     23    // NA  → LOW = pressionado
#define BTN_EMERG    24    // NF  → HIGH = emergência acionada
#define POTENCIA_OK  25    // chave: HIGH = KA1/KA2 fechados, 24 V presentes

#define LED_RUN       9
#define LED_COOL     10
#define LED_HEAT     11
#define LED_FAULT    12

// ────────────────────────── PARÂMETROS (Doc 40) ─────────────────────────
const unsigned long JANELA_PWM_MS      = 1000;
const unsigned long INTERVALO_TROCA_MS = 30000;
const double        BANDA_MORTA        = 5.0;
const double        DUTY_MAXIMO        = 95.0;
const int           RPM_MINIMA         = 400;
const unsigned long TEMPO_PARTIDA_FAN  = 5000;
const unsigned long TIMEOUT_RAMPA_MS   = 45UL * 60 * 1000;

// ──────────────────────────── MODO CICLO ────────────────────────────────
struct Receita {
  double        spFrio          = 5.0;
  double        spQuente        = 40.0;
  unsigned long patamarFrioMs   = 60UL * 1000;   // 1 min na simulação
  unsigned long patamarQuenteMs = 60UL * 1000;
  int           totalCiclos     = 2;
  double        tolerancia      = 0.5;
} receita;

enum ModoOperacao { MANUAL, CICLO };
enum FaseCiclo { RAMPA_FRIO, PATAMAR_FRIO, ESPERA_Q, RAMPA_QUENTE, PATAMAR_QUENTE, ESPERA_F, CONCLUIDO };
enum Estado { BOOT, AGUARDA_START, RODANDO, EMERGENCIA, FALHA };
enum Modo   { PARADO, FRIO, QUENTE };

ModoOperacao modoOperacao = CICLO;     // troque para MANUAL se quiser setpoint fixo
FaseCiclo    fase         = RAMPA_FRIO;
Estado       estado       = BOOT;
Modo         modo         = PARADO;

int  cicloAtual = 0;
char alerta[24] = "";

unsigned long inicioPatamar = 0, inicioFase = 0, inicioFrio = 0;
unsigned long inicioJanela  = 0, ultimaTroca = 0;

// ──────────────────────────────── PID ───────────────────────────────────
double setpoint = 5.0, entrada = 25.0, saidaPID = 0.0;
double Kp = 8.0, Ki = 0.2, Kd = 1.0;
double integral = 0.0, erroAnterior = 0.0;

double calcularPID(double dt) {
  double erro = setpoint - entrada;
  integral += erro * dt;
  if (Ki > 0) {                                  // anti-windup
    double lim = 100.0 / Ki;
    integral = constrain(integral, -lim, lim);
  }
  double derivada = (dt > 0) ? (erro - erroAnterior) / dt : 0.0;
  erroAnterior = erro;
  return constrain(Kp * erro + Ki * integral + Kd * derivada, -100.0, 100.0);
}

// ─────────────────────────────── RPM ────────────────────────────────────
volatile unsigned long pulsosRPM = 0;
unsigned long ultimaMedidaRPM = 0;
int rpmAtual = 0;
bool fanSimuladaOK = true;                       // troque pelo botão do Wokwi

void isrRPM() { pulsosRPM++; }

// ───────────────────────────── SENSOR ───────────────────────────────────
OneWire barramento(PINO_DS18B20);
DallasTemperature sensores(&barramento);

// ═════════════════════════════ FUNÇÕES ══════════════════════════════════

inline void desabilitarDrivers() {
  digitalWrite(BTS1_REN, LOW);  digitalWrite(BTS1_RPWM, LOW);
  digitalWrite(BTS2_REN, LOW);  digitalWrite(BTS2_RPWM, LOW);
  digitalWrite(LED_COOL, LOW);  digitalWrite(LED_HEAT, LOW);
}

void dispararTrip(const char* motivo) {
  desabilitarDrivers();
  digitalWrite(LED_RUN, LOW);
  digitalWrite(LED_FAULT, HIGH);
  strncpy(alerta, motivo, sizeof(alerta) - 1);
  estado = FALHA;
  saidaPID = 0;
  Serial.print(F("\n*** TRIP: ")); Serial.print(motivo); Serial.println(F(" ***\n"));
}

bool potenciaDisponivel() { return digitalRead(POTENCIA_OK) == HIGH; }
bool emergenciaAtiva()    { return digitalRead(BTN_EMERG) == HIGH; }
bool startPressionado()   { return digitalRead(BTN_START) == LOW; }
bool stopPressionado()    { return digitalRead(BTN_STOP)  == LOW; }

void atualizarJanelaPWM() {
  unsigned long agora = millis();
  while (agora - inicioJanela >= JANELA_PWM_MS) inicioJanela += JANELA_PWM_MS;
}

bool pwmLentoAtivo(double duty) {
  if (duty <= 0)   return false;
  if (duty >= 100) return true;
  return (millis() - inicioJanela) < (unsigned long)((duty / 100.0) * JANELA_PWM_MS);
}

// ───────────────────────────── CICLO ────────────────────────────────────
void iniciarCiclo() {
  fase = RAMPA_FRIO;  cicloAtual = 1;
  setpoint = receita.spFrio;  inicioFase = millis();  integral = 0;
}

void gerenciarCiclo() {
  if (modoOperacao != CICLO || estado != RODANDO) return;
  bool chegou = fabs(entrada - setpoint) <= receita.tolerancia;

  switch (fase) {
    case RAMPA_FRIO:
    case RAMPA_QUENTE:
      if (chegou) {
        inicioPatamar = millis();
        fase = (fase == RAMPA_FRIO) ? PATAMAR_FRIO : PATAMAR_QUENTE;
      } else if (millis() - inicioFase > TIMEOUT_RAMPA_MS) {
        dispararTrip("SETPOINT_INATINGIVEL");
      }
      break;

    case PATAMAR_FRIO:
      if (millis() - inicioPatamar >= receita.patamarFrioMs) {
        fase = ESPERA_Q;  inicioFase = millis();
      }
      break;

    case PATAMAR_QUENTE:
      if (millis() - inicioPatamar >= receita.patamarQuenteMs) {
        if (receita.totalCiclos > 0 && cicloAtual >= receita.totalCiclos) {
          fase = CONCLUIDO;  estado = AGUARDA_START;  modo = PARADO;
          desabilitarDrivers();  digitalWrite(LED_RUN, LOW);
          strncpy(alerta, "CICLO_CONCLUIDO", sizeof(alerta) - 1);
          Serial.println(F("\n=== ENSAIO CONCLUIDO ===\n"));
        } else {
          cicloAtual++;  fase = ESPERA_F;  inicioFase = millis();
        }
      }
      break;

    case ESPERA_Q:
    case ESPERA_F:
      desabilitarDrivers();  modo = PARADO;
      if (millis() - inicioFase >= INTERVALO_TROCA_MS) {
        setpoint = (fase == ESPERA_Q) ? receita.spQuente : receita.spFrio;
        fase     = (fase == ESPERA_Q) ? RAMPA_QUENTE     : RAMPA_FRIO;
        inicioFase = millis();  integral = 0;
      }
      break;

    default: break;
  }
}

// ───────────────────────── APLICAR POTÊNCIA ─────────────────────────────
void aplicarPotencia() {
  atualizarJanelaPWM();
  double duty = min(fabs(saidaPID), DUTY_MAXIMO);

  if (modo == FRIO) {
    digitalWrite(BTS2_REN, LOW);  digitalWrite(BTS2_RPWM, LOW);   // ⚠ desliga o outro PRIMEIRO
    digitalWrite(BTS1_REN, HIGH);
    digitalWrite(BTS1_RPWM, pwmLentoAtivo(duty));
    digitalWrite(LED_COOL, pwmLentoAtivo(duty));  digitalWrite(LED_HEAT, LOW);
  } else if (modo == QUENTE) {
    digitalWrite(BTS1_REN, LOW);  digitalWrite(BTS1_RPWM, LOW);
    digitalWrite(BTS2_REN, HIGH);
    digitalWrite(BTS2_RPWM, pwmLentoAtivo(duty));
    digitalWrite(LED_HEAT, pwmLentoAtivo(duty));  digitalWrite(LED_COOL, LOW);
  } else {
    desabilitarDrivers();
  }
}

void selecionarModo() {
  Modo alvo = (saidaPID >  BANDA_MORTA) ? QUENTE
            : (saidaPID < -BANDA_MORTA) ? FRIO : PARADO;
  if (alvo == modo) return;
  if (alvo == PARADO) { modo = PARADO; return; }

  bool trocaDireta = (modo == FRIO && alvo == QUENTE) || (modo == QUENTE && alvo == FRIO);
  if (trocaDireta && millis() - ultimaTroca < INTERVALO_TROCA_MS) { modo = PARADO; return; }

  modo = alvo;  ultimaTroca = millis();
  if (alvo == FRIO) inicioFrio = millis();
}

// ─────────────────────── MÁQUINA DE ESTADOS ─────────────────────────────
void maquinaDeEstados() {
  if (emergenciaAtiva() && estado != EMERGENCIA) {
    desabilitarDrivers();
    digitalWrite(LED_RUN, LOW);  digitalWrite(LED_FAULT, HIGH);
    strncpy(alerta, "EMERGENCIA", sizeof(alerta) - 1);
    estado = EMERGENCIA;
    Serial.println(F("\n*** EMERGENCIA ***\n"));
    return;
  }

  switch (estado) {
    case BOOT:
      estado = AGUARDA_START;
      break;

    case AGUARDA_START:
      digitalWrite(LED_FAULT, LOW);
      if (startPressionado()) {
        delay(50);
        if (!startPressionado()) break;
        if (!potenciaDisponivel()) {
          strncpy(alerta, "SEM_POTENCIA", sizeof(alerta) - 1);
          Serial.println(F("!! START recusado: 24 V ausentes (KA1/KA2 abertos)"));
          break;
        }
        alerta[0] = '\0';
        digitalWrite(LED_RUN, HIGH);
        estado = RODANDO;
        if (modoOperacao == CICLO) iniciarCiclo();
        Serial.println(F("\n>>> PROCESSO INICIADO\n"));
      }
      break;

    case RODANDO:
      if (!potenciaDisponivel()) { dispararTrip("POTENCIA_PERDIDA"); break; }
      if (stopPressionado()) {
        desabilitarDrivers();  digitalWrite(LED_RUN, LOW);
        modo = PARADO;  estado = AGUARDA_START;
        Serial.println(F("\n>>> PARADO pelo operador\n"));
      }
      break;

    case EMERGENCIA:
      if (!emergenciaAtiva()) {
        digitalWrite(LED_FAULT, LOW);  alerta[0] = '\0';
        estado = AGUARDA_START;        // ⚠ NÃO religa sozinho
        Serial.println(F(">>> Emergencia liberada. Aguardando START."));
      }
      break;

    case FALHA: {
      static unsigned long tStop = 0;
      if (stopPressionado()) {
        if (!tStop) tStop = millis();
        if (millis() - tStop > 2000) {
          digitalWrite(LED_FAULT, LOW);  alerta[0] = '\0';
          tStop = 0;  estado = AGUARDA_START;
          Serial.println(F(">>> Falha reconhecida. Aguardando START."));
        }
      } else tStop = 0;
      break;
    }
  }
}

// ─────────────────────────── RPM / FAN ──────────────────────────────────
void simularTacometro() {
  // 2 pulsos por rotação · 2400 RPM = 80 pulsos/s = alterna a cada 6,25 ms
  static unsigned long ultimo = 0;
  static bool nivel = false;
  if (!fanSimuladaOK) { digitalWrite(SIM_TACOMETRO, HIGH); return; }
  if (micros() - ultimo >= 6250) {
    ultimo = micros();
    nivel = !nivel;
    digitalWrite(SIM_TACOMETRO, nivel);
  }
}

void medirRPM() {
  if (millis() - ultimaMedidaRPM < 1000) return;
  ultimaMedidaRPM = millis();
  noInterrupts();
  unsigned long p = pulsosRPM;  pulsosRPM = 0;
  interrupts();
  rpmAtual = (p * 60) / 2;

  if (modo == FRIO && estado == RODANDO &&
      millis() - inicioFrio > TEMPO_PARTIDA_FAN && rpmAtual < RPM_MINIMA) {
    dispararTrip("FAN_PARADA");
  }
}

// ──────────────────────────── RELATÓRIO ─────────────────────────────────
const char* nomeEstado() {
  switch (estado) {
    case BOOT: return "BOOT"; case AGUARDA_START: return "AGUARDA_START";
    case RODANDO: return "RODANDO"; case EMERGENCIA: return "EMERGENCIA";
    default: return "FALHA";
  }
}
const char* nomeFase() {
  switch (fase) {
    case RAMPA_FRIO: return "RAMPA_FRIO";   case PATAMAR_FRIO: return "PATAMAR_FRIO";
    case ESPERA_Q: case ESPERA_F: return "ESPERA";
    case RAMPA_QUENTE: return "RAMPA_QUENTE"; case PATAMAR_QUENTE: return "PATAMAR_QUENTE";
    default: return "CONCLUIDO";
  }
}
const char* nomeModo() {
  return modo == FRIO ? "FRIO" : modo == QUENTE ? "QUENTE" : "PARADO";
}

void relatar() {
  static unsigned long ultimo = 0;
  if (millis() - ultimo < 1000) return;
  ultimo = millis();

  Serial.print(F("T=")); Serial.print(entrada, 1);
  Serial.print(F("C  SP=")); Serial.print(setpoint, 1);
  Serial.print(F("  ")); Serial.print(nomeEstado());
  if (modoOperacao == CICLO) {
    Serial.print(F("  ")); Serial.print(nomeFase());
    Serial.print(F("  ciclo ")); Serial.print(cicloAtual);
    Serial.print('/'); Serial.print(receita.totalCiclos);
  }
  Serial.print(F("  ")); Serial.print(nomeModo());
  Serial.print(F("  duty=")); Serial.print((int)fabs(saidaPID));
  Serial.print(F("%  rpm=")); Serial.print(rpmAtual);
  Serial.print(F("  24V=")); Serial.print(potenciaDisponivel() ? "OK" : "--");
  if (alerta[0]) { Serial.print(F("  [")); Serial.print(alerta); Serial.print(']'); }
  Serial.println();
}

// ═════════════════════════════ SETUP ════════════════════════════════════
void setup() {
  // ⚠ PRIMEIRA COISA: drivers desabilitados
  pinMode(BTS1_REN, OUTPUT);  digitalWrite(BTS1_REN, LOW);
  pinMode(BTS2_REN, OUTPUT);  digitalWrite(BTS2_REN, LOW);
  pinMode(BTS1_RPWM, OUTPUT); digitalWrite(BTS1_RPWM, LOW);
  pinMode(BTS2_RPWM, OUTPUT); digitalWrite(BTS2_RPWM, LOW);

  wdt_disable();

  Serial.begin(115200);
  Serial.println(F("\n=== CAMARA FRIGORIFICA — SIMULACAO WOKWI ==="));
  Serial.println(F("START=D22  STOP=D23  EMERG=D24  POTENCIA=D25"));
  Serial.println(F("Ajuste a temperatura clicando no DS18B20.\n"));

  pinMode(LED_RUN, OUTPUT);  pinMode(LED_COOL, OUTPUT);
  pinMode(LED_HEAT, OUTPUT); pinMode(LED_FAULT, OUTPUT);

  pinMode(BTN_START, INPUT_PULLUP);
  pinMode(BTN_STOP,  INPUT_PULLUP);
  pinMode(BTN_EMERG, INPUT_PULLUP);
  pinMode(POTENCIA_OK, INPUT_PULLUP);

  pinMode(SIM_TACOMETRO, OUTPUT);
  pinMode(PINO_RPM, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(PINO_RPM), isrRPM, FALLING);

  sensores.begin();
  inicioJanela = millis();

  wdt_enable(WDTO_2S);      // ⚡ travou? o Mega reseta e os pull-downs desligam tudo
}

// ═════════════════════════════ LOOP ═════════════════════════════════════
void loop() {
  wdt_reset();
  simularTacometro();
  maquinaDeEstados();
  medirRPM();

  // leitura do sensor a cada 1 s (o DS18B20 é lento)
  static unsigned long ultimaLeitura = 0;
  if (millis() - ultimaLeitura >= 1000) {
    ultimaLeitura = millis();
    sensores.requestTemperatures();
    float t = sensores.getTempCByIndex(0);
    if (t > -50 && t < 120) entrada = t;

    if (estado == RODANDO) {
      gerenciarCiclo();
      if (estado == RODANDO) {
        saidaPID = calcularPID(1.0);
        selecionarModo();
      }
    } else {
      saidaPID = 0;
    }
    relatar();
  }

  if (estado == RODANDO) aplicarPotencia();
  else                   desabilitarDrivers();
}
