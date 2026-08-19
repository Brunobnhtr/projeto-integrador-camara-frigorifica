/* ═══════════════════════════════════════════════════════════════════════
   DETECTOR DE DISPOSITIVO MORTO — protótipo de 1 canal
   Projeto Integrador CF-01 · Arduino Mega 2560
   ═══════════════════════════════════════════════════════════════════════

   O QUE ELE FAZ
   Vigia UMA posição de ensaio e responde a uma pergunta só:
   "ainda passa corrente por este equipamento?"

   Corrente passando  → o equipamento está vivo.
   Corrente zerada    → ou ele queimou, ou o disjuntor/fusível abriu,
                        ou alguém desligou a chave. Para o sistema, os
                        três casos são a MESMA coisa: aquela posição
                        parou de ensaiar, e isso precisa aparecer.

   ⭐ POR QUE DIGITAL, E NÃO MEDIÇÃO ANALÓGICA
   A pergunta é binária. Medir 17,6 mA com precisão exigia shunt de 1 %,
   multiplexador, conversor A/D e uma placa inteira — para no fim decidir
   entre "tem corrente" e "não tem". O sensor entrega essa decisão pronta,
   num fio, e o pino digital do Mega lê direto. Menos peça, menos solda,
   menos coisa para calibrar.

   ⚠️ ESTE É O PROTÓTIPO DE UM CANAL. Na planta real são 50 posições —
      leia o comentário "EXPANSÃO PARA 50 CANAIS" no fim do arquivo antes
      de multiplicar por 50: o Mega não tem 50 pinos sobrando neste
      projeto, e a solução não é comprar outro Mega.

   ═══════════════════════════════════════════════════════════════════════
   OS DOIS SENSORES ACEITOS
   ═══════════════════════════════════════════════════════════════════════

   ┌─ WCS2702 (efeito Hall) ─── para equipamento em CORRENTE CONTÍNUA ──┐
   │ O condutor passa POR DENTRO do furo do módulo. Ele tem saída       │
   │ analógica (que este código ignora) e uma saída digital DOUT, cujo  │
   │ limiar se ajusta no trimpot da própria placa.                      │
   │ Alimentação: 5 V do Arduino · GND comum · DOUT no pino digital.    │
   │ ⚠️ A POLARIDADE DO DOUT VARIA ENTRE FABRICANTES. Confira na        │
   │    bancada e ajuste NIVEL_COM_CORRENTE lá embaixo.                 │
   └────────────────────────────────────────────────────────────────────┘

   ┌─ SZC23 (chave de corrente) ── para equipamento em CORRENTE ALTERNADA ┐
   │ Não-invasiva: o cabo passa pela janela, sem abrir o circuito. Ela   │
   │ se alimenta do próprio campo do cabo (self-powered) e entrega um    │
   │ CONTATO SECO — dois fios, sem polaridade e sem alimentação.         │
   │ Um fio no pino digital, o outro no GND do Arduino.                  │
   │ ⭐ O contato seco é isolado da rede: é ele que mantém os 127 V       │
   │    longe do Arduino. Não substitua por "um fio no vivo".            │
   └─────────────────────────────────────────────────────────────────────┘

   Nos dois casos o pino fica em INPUT_PULLUP, então o estado de repouso
   (sensor sem corrente, ou fio arrancado) é NÍVEL ALTO. Isso é de
   propósito: fio partido cai do lado do alarme, não do lado do silêncio.
   ═══════════════════════════════════════════════════════════════════════ */


/* ── CONFIGURAÇÃO ──────────────────────────────────────────────────── */

const uint8_t PINO_SENSOR = 22;   // D22 — livre no projeto. Ver "EXPANSÃO".

/* Que nível o pino mostra QUANDO HÁ CORRENTE no equipamento.
     SZC23 (contato seco para o GND) ......... LOW
     WCS2702, DOUT que aterra com corrente ... LOW
     WCS2702, DOUT que sobe com corrente ..... HIGH
   ⚠️ Descubra na bancada (procedimento no fim do arquivo) antes de
      confiar no alarme. Um sinal invertido acusa falha com tudo certo. */
const uint8_t NIVEL_COM_CORRENTE = LOW;

/* Tempo sem NENHUMA amostra de corrente para declarar falha.
   ⭐ Em AC a corrente cruza o zero 120 vezes por segundo, e a chave pode
      abrir por instantes a cada cruzamento. Sem este tempo de confirmação
      o sistema alarmaria sozinho, com o equipamento funcionando. */
const uint16_t MS_PARA_FALHA = 1000;   // ⚠️ o Doc 13 exige alarme em < 2 s

/* Tempo com corrente estável para declarar recuperação. Curto de
   propósito: religar é boa notícia, e boa notícia pode chegar rápido. */
const uint16_t MS_PARA_VOLTAR = 200;

const uint16_t MS_ENTRE_LEITURAS = 5;      // amostra 200 vezes por segundo
const uint32_t MS_ENTRE_RELATOS  = 5000;   // "continuo vivo" no serial


/* ── ESTADO ────────────────────────────────────────────────────────── */

bool     equipamentoOk    = false;   // começa em falha até provar o contrário
uint32_t ultimaCorrente   = 0;       // millis() da última amostra COM corrente
uint32_t primeiraCorrente = 0;       // desde quando a corrente está de volta
uint32_t ultimaLeitura    = 0;
uint32_t ultimoRelato     = 0;


void setup() {
    Serial.begin(115200);

    /* ⭐ INPUT_PULLUP, e não INPUT: sem o resistor interno, um pino solto
       fica alto-impedante e lê qualquer coisa — ruído vira "equipamento
       funcionando", que é o pior erro possível neste sistema. */
    pinMode(PINO_SENSOR, INPUT_PULLUP);

    delay(50);   // deixa o pull-up estabilizar antes da primeira leitura

    Serial.println(F("=================================================="));
    Serial.println(F(" DETECTOR DE DISPOSITIVO MORTO - 1 canal"));
    Serial.print  (F(" Pino: D"));       Serial.println(PINO_SENSOR);
    Serial.print  (F(" Corrente presente = nivel "));
    Serial.println(NIVEL_COM_CORRENTE == LOW ? F("BAIXO") : F("ALTO"));
    Serial.println(F("=================================================="));

    /* Autoteste: diz em que estado o canal nasceu. Se ele nasce em falha
       com o equipamento ligado, o problema é de ligação ou de polaridade
       — e é melhor saber disso agora do que no meio do ensaio. */
    if (digitalRead(PINO_SENSOR) == NIVEL_COM_CORRENTE) {
        equipamentoOk    = true;
        ultimaCorrente   = millis();
        primeiraCorrente = millis();
        Serial.println(F("Autoteste: corrente detectada. Equipamento em funcionamento."));
    } else {
        Serial.println(F("Autoteste: sem corrente. Ligue o equipamento ou confira a ligacao."));
    }
}


void loop() {
    const uint32_t agora = millis();

    /* ── amostragem ────────────────────────────────────────────────── */
    if (agora - ultimaLeitura >= MS_ENTRE_LEITURAS) {
        ultimaLeitura = agora;

        const bool temCorrente = (digitalRead(PINO_SENSOR) == NIVEL_COM_CORRENTE);

        if (temCorrente) {
            ultimaCorrente = agora;
            if (primeiraCorrente == 0) primeiraCorrente = agora;
        } else {
            primeiraCorrente = 0;      // a contagem de recuperação recomeça
        }
    }

    /* ── decisão ───────────────────────────────────────────────────── */
    if (equipamentoOk) {
        /* só declara falha depois de MS_PARA_FALHA inteiros sem corrente */
        if (agora - ultimaCorrente >= MS_PARA_FALHA) {
            equipamentoOk = false;
            Serial.print(F("["));  Serial.print(agora / 1000);  Serial.print(F("s] "));
            Serial.println(F("FALHA: Corrente Zero detectada"));
            Serial.println(F("       -> equipamento queimado, disjuntor aberto ou chave desligada"));
        }
    } else {
        /* e só declara recuperação com corrente estável por MS_PARA_VOLTAR */
        if (primeiraCorrente != 0 && agora - primeiraCorrente >= MS_PARA_VOLTAR) {
            equipamentoOk = true;
            Serial.print(F("["));  Serial.print(agora / 1000);  Serial.print(F("s] "));
            Serial.println(F("Equipamento em funcionamento"));
        }
    }

    /* ── relato periódico ──────────────────────────────────────────── */
    if (agora - ultimoRelato >= MS_ENTRE_RELATOS) {
        ultimoRelato = agora;
        Serial.print(F("["));  Serial.print(agora / 1000);  Serial.print(F("s] "));
        Serial.println(equipamentoOk ? F("Equipamento em funcionamento")
                                     : F("FALHA: Corrente Zero detectada"));
    }
}


/* ═══════════════════════════════════════════════════════════════════════
   COMO DESCOBRIR A POLARIDADE DO SENSOR (faça isto ANTES de confiar nele)
   ═══════════════════════════════════════════════════════════════════════
   1. Monte tudo, abra o Monitor Serial em 115200.
   2. Com o equipamento LIGADO, veja o que aparece.
        · "Equipamento em funcionamento"  → NIVEL_COM_CORRENTE está certo.
        · "FALHA: Corrente Zero"          → inverta NIVEL_COM_CORRENTE e
                                            grave de novo.
   3. Desligue a chave do equipamento. Em até 1 segundo tem que aparecer
      "FALHA: Corrente Zero detectada".
   4. Religue. Em até 0,2 segundo volta "Equipamento em funcionamento".
   5. ⭐ TESTE DO FIO PARTIDO: com tudo ligado, desconecte o fio de sinal
      do sensor. Tem que dar FALHA — nunca "funcionando". Se der
      "funcionando", o pull-up não está ativo ou a polaridade está trocada,
      e o sistema ficaria cego justamente quando o cabo se soltasse.

   ═══════════════════════════════════════════════════════════════════════
   EXPANSÃO PARA 50 CANAIS (a planta real)
   ═══════════════════════════════════════════════════════════════════════
   O Mega tem 54 pinos digitais, mas este projeto já usa cerca de 25 entre
   drivers, relés, botoeiras, sinaleiros, sensores e comunicação. Sobram
   ~29 — não dá para 50 canais diretos, e a saída não é um segundo Mega:

   | Como                         | Pinos gastos | Canais    |
   |------------------------------|--------------|-----------|
   | Direto no Mega               | 1 por canal  | ~29 no máx|
   | 74HC165 (registrador serial) | 3 no total   | 8 por CI  |
   | MCP23017 (expansor I2C)      | 2 no total   | 16 por CI |

   ⭐ Com quatro MCP23017 no MESMO par I2C que já existe no projeto dá 64
      canais usando 2 pinos — e o barramento I2C já está lá por causa do
      RTC. É a rota natural quando as 50 posições saírem do papel.

   A LÓGICA DESTE ARQUIVO NÃO MUDA: continua sendo "vi corrente / não vi
   corrente" com tempo de confirmação. O que muda é de onde vem o bit.
   ═══════════════════════════════════════════════════════════════════════ */
