# CAMADA 4 · Doc 40 — Firmware do Arduino Mega

> O software de controle em tempo real: máquina de estados, PID com PWM de 20 kHz, intertravamento, START/STOP pelo botão ou pela IHM, watchdog, proteções e registro em SD.
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

Então chaveamos em **20 kHz** — rápido o bastante para a pastilha ver corrente constante, acima da audição e dentro do limite do BTS7960. ⚠️ **A versão anterior usava 1 Hz, e estava errada:** 1 Hz é justamente a velocidade que faz a junção da pastilha ciclar termicamente. O porquê está na §40.5.

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
| 9 | **Acionamento em cadeia única** | STOP e EMERGÊNCIA cortam em **hardware** e derrubam o mesmo selo; o STOP normal também funciona **pela IHM**. Religar a potência é sempre o botão verde S1, que o firmware nem lê |
| 10 | **Watchdog habilitado** | Sem ele, um travamento deixaria a Peltier ligada. Com ele, o Mega reseta em 2 s e os pull-downs desligam os drivers |
| 11 | **Pull-down de 10 kΩ em cada `R_EN`** | Garante que **pino flutuante = driver desligado**. É o que torna o watchdog realmente eficaz |

### 🔧 Revisão de agosto/2026 — quatro correções nascidas de duas perguntas

| # | Correção | O que estava errado |
|---|---|---|
| **12** | ⭐ **`HAB_POTENCIA` (D27) → KA1 → bobina do KM1** | O firmware **não tinha como cortar a potência**, só como desabilitar drivers. Um BTS com MOSFET em curto ficava fora do alcance de qualquer trip. E o STOP não retinha ao ser solto — o KM1 apenas copiava o botão ([Doc 31 §31.13](../camada_3_eletrica/31_comando_e_protecoes.md)) |
| **13** | ⭐ **`pedidoDeStop()` testado ANTES de `potenciaDisponivel()`** | Na ordem antiga, apertar o STOP físico caía em **`FALHA`** com log `POTENCIA_PERDIDA`, e exigia segurar o botão 2 s para reconhecer. A queda de potência causada pelo próprio comando estava sendo classificada como defeito |
| **14** | ⭐ **`gerenciarVentoinhas()` — os pinos das ventoinhas passaram a ser escritos** | Estavam **apenas `#define`ados**. Sem `pinMode`, sem um `digitalWrite` sequer. **As cinco ventoinhas internas nunca giravam** |
| **16** | 🔧 **Simplificação: 3 pinos a menos** | O `D22` (leitura do START), o `D26` (seletora LOCAL/REMOTO) e o `D28` (comando separado da ventoinha do PTC) foram eliminados. O `INICIAR` passou para a IHM; a seletora era a segunda camada de uma regra que a primeira já garante; e as internas ganharam **uma condição só**, então cabem num comando só |
| **17** | 🔧 **O `D29` trocou de destino: MV-1 → KA3** | O módulo MOSFET saiu do painel. **Nenhuma linha de código mudou** — jumper em `H` e contato `NO` mantêm `HIGH` = ligada. Muda o comentário do `#define` e nada mais ([Doc 31 §31.16](../camada_3_eletrica/31_comando_e_protecoes.md)) |
| **17** | ⭐ **O KM1 ganhou selo próprio, e o botão verde voltou como comando de 24 V** | O STOP passou a cortar **e reter** em hardware — circuito clássico de partida-parada. O botão verde entrou na cadeia de 24 V (não é lido por pino nenhum) e o `KA1` passou a **autorizar** em vez de armar. Como o selo não se refaz sozinho, **o trip do firmware virou retentivo de graça** |
| **18** | ⭐ **Três paradas com categorias diferentes** | Botão preto = Cat. 1, retém, exige o verde. IHM/MQTT = Cat. 2, potência segue armada, a tela religa. Trip = Cat. 1, retém, exige reconhecimento **e** o verde |
| **15** | 🔧 **O comentário do `dispararTrip()`** | Dizia *"agora o firmware abre um relé, e o corte é físico"*. Não abria: a função só mexia em pinos de sinal. A correção 12 é o que torna a frase verdadeira |

> 🎓 **Vale contar essa origem na defesa.** As correções 12 e 13 produziam **o mesmo sintoma** — "o STOP parece que precisa ser segurado" — por causas totalmente diferentes, uma elétrica e uma de software. É o exemplo perfeito de por que se depura um sintoma até o fim em vez de parar na primeira explicação plausível.

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
#define BTS1_RPWM     5    // 2x PELTIER EM SERIE (FRIO)  24 V / 6,0 A - PWM 20 kHz (Timer3)
#define BTS1_REN      4    // Peltier  enable
#define BTS1_IS      A0    // Peltier  diagnóstico de corrente (cap 100 nF na PI-1)
#define BTS2_RPWM     6    // PTC 24 V (QUENTE)            24 V / 3,3 A - PWM 20 kHz (Timer4)
#define BTS2_REN      7    // PTC      enable
#define BTS2_IS      A1    // PTC      diagnóstico de corrente (cap 100 nF na PI-1)

// ---------- SENSORES ----------
#define PINO_DS18B20  2    // 1-Wire (pull-up 4,7k -> +5V, na placa PI-1)
#define PINO_RPM1     3    // cooler da Peltier #1. D3 = INT1. NAO usar D13 no Mega!
#define PINO_RPM2    A8    // cooler da Peltier #2 -> PCINT16 (PCINT2 / porta K)
// #define SD_CS     53    // O cartao SD saiu do Arduino: agora e da tela ES3C28P.
//                            D50-D53 ficaram LIVRES.
// I2C: SDA=20, SCL=21 -> AM2315C (0x38) + DS3231 (0x68)

// ---------- COMANDO ----------
#define BTN_STOP     23    // bloco NA  -> LOW = pressionado
#define BTN_EMERG    24    // bloco NF  -> HIGH = EMERGENCIA ACIONADA
#define POTENCIA_OK  25    // divisor 22k/4k7 do BD-POT -> HIGH = 24 V presente
// D22 e D26 ficaram LIVRES:
//   D22 era o botao START verde -- o START passou para a IHM.
//   D26 era a seletora LOCAL/REMOTO -- removida. A regra que dava
//   seguranca sempre foi "START nunca por MQTT", nao a chave.

// ── VENTOINHAS: 3 grupos comandados ─────────────────────────────────
// ⭐ UM canal so para TODAS as internas: 2 frias da Peltier, 2 do duto
//   e a do PTC. Todas tem a mesma condicao -- ligam com o ensaio
//   rodando, em qualquer modo, e param junto com ele.
#define VENT_INTERNAS 29   // -> IN3 do KA3 -> as 5 ventoinhas internas
// D28 ficou LIVRE: a ventoinha do PTC entrou no mesmo comando das outras.
// * O KA3 e um modulo de rele, nao um canal de MOSFET. Contato NO e jumper
//   em H: HIGH liga, igual ao que havia antes. Doc 31 §31.16.

// ⭐ RADIADOR (lado quente da Peltier) -- 2 ventoinhas de 3 fios.
//   NAO chaveia o negativo delas: o tacometro e referenciado nesse
//   negativo, e corta-lo estragava a leitura de RPM e injetava
//   corrente no D3. Quem chaveia e o CONTATO do KA2,
//   e um contato seco nao tem lado alto nem lado baixo -- basta poe-lo
//   no fio POSITIVO. O preto fica em 0 V de verdade, sempre.
//
//   ⭐ E O CONTATO E O NF, AO CONTRARIO DO KA1. O estado seguro deste
//     lado e VENTILANDO: rele solto (Arduino morto, fio rompido, 5 V
//     caido) tem de deixar as ventoinhas GIRANDO, porque o dissipador
//     quente e o que mata a pastilha. Como o rele atraca para DESLIGAR,
//     a logica deste pino e INVERTIDA em relacao a de todos os outros.
//     Ver Doc 31 §31.14.
#define VENT_RADIADOR 30   // gatilho do KA2 (modulo de rele, IN2)
//   ⚠ HIGH  = bobina atracada = contato NF ABERTO  = ventoinhas PARADAS
//     LOW   = bobina solta     = contato NF FECHADO = ventoinhas GIRANDO
//   Existe UMA funcao para escrever neste pino, e e por ela que a
//   inversao passa. Nenhum outro ponto do firmware o toca direto.
inline void radiador(bool ligar) { digitalWrite(VENT_RADIADOR, ligar ? LOW : HIGH); }

// ⭐ AUTORIZACAO DA POTENCIA -- o "veto" do firmware sobre o KM1.
//   Comanda o KA1 (modulo de rele, caixa DIN no trilho 2), em SERIE
//   com a bobina do KM1. HIGH = "estou saudavel, a potencia PODE ser
//   armada". ⚠ JUMPER DO MODULO EM "H" -- assim HIGH fecha o contato.
//   ⚠ CONTATO NO: modulo sem energia = potencia cortada.
//   Quem ARMA e o operador, no botao verde -- sao duas chaves e as
//   duas precisam concordar. LOW derruba o SELO do KM1, e como o selo
//   nao se refaz sozinho, o corte e RETENTIVO: so o verde religa.
//   Ver Doc 31 §31.13.
//   Pull-down de 10k no IN do modulo: Arduino resetado ou ausente = potencia
//   cortada. O D27 vagou quando o radiador saiu do modulo MOSFET.
#define HAB_POTENCIA  27
// D26 ficou LIVRE (era o rele K0)

// ⚠ R_EN e L_EN de cada modulo vao JUNTOS no mesmo pino do Arduino.
//   O IBT-2 e UMA ponte H: a corrente sai por M+ e VOLTA por M-, entao
//   a metade L precisa estar habilitada para o retorno passar pelo
//   MOSFET. Com L_EN aterrado, o retorno vai pelo diodo de corpo e
//   dissipa ~5 W a mais por driver. Ver Doc 32 §32.3.
//
// ⚠ Cada R_EN/L_EN precisa de um resistor de 10 kΩ para 0 V (pull-down
//   externo), SOLDADO NO PRÓPRIO BTS7960 — não na placa PI-1.
//   Assim, quando o Arduino reseta e os pinos viram entrada, OU quando o cabo
//   se solta, os drivers ficam DESABILITADOS. É isso que torna o watchdog
//   realmente eficaz. Ver Doc 33 §33.4.

// ---------- SINALIZAÇÃO ----------
#define LED_RUN       9    // verde
#define LED_COOL     10    // azul
#define LED_HEAT     11    // amarelo
#define LED_FAULT    12    // vermelho

// Desabilita os dois drivers imediatamente. É o corte de potência do software.
// BTS1_REN comanda R_EN E L_EN do modulo 1 (ligados no mesmo pino).
// Nivel baixo desabilita as DUAS metades da ponte -> nenhuma corrente.
inline void desabilitarDrivers() {
    digitalWrite(BTS1_REN, LOW);   digitalWrite(BTS1_RPWM, LOW);
    digitalWrite(BTS2_REN, LOW);   digitalWrite(BTS2_RPWM, LOW);
}

// ⭐ Corte FISICO e RETENTIVO. Abre o KA1 -> a bobina do KM1 perde o
//   retorno -> o contato de SELO abre junto -> 0 V no BD-POT.
//   Um pulso de 50 ms basta: mesmo que o KA1 feche de novo, o selo ja se
//   perdeu e a potencia NAO retorna. So o botao verde religa.
//   Funciona ate com um MOSFET do BTS7960 colado em curto, porque quem
//   abre e um contato de rele a montante dele.
inline void cortarPotencia()    { digitalWrite(HAB_POTENCIA, LOW);
                                  tCorte = millis(); conferirCorte = true; }

// AUTORIZA -- nao arma. Depois disto o operador ainda precisa apertar
// o botao verde para o KM1 selar.
inline void autorizarPotencia() { digitalWrite(HAB_POTENCIA, HIGH); }

// ---------- PARÂMETROS DE PROCESSO ----------
const uint16_t      PWM_TOP            = 799;           // 20 kHz nos Timers 3 e 4
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

> ### ⭐ Por que `LOW` = REMOTO na seletora
>
> Com `INPUT_PULLUP`, um pino **sem nada ligado lê `HIGH`**. Então a pergunta a fazer é: se o fio da seletora romper, em que modo o sistema deve cair?
>
> | Se o fio romper | Se fosse `HIGH` = REMOTO | **Como está: `LOW` = REMOTO** |
> |---|---|---|
> | O sistema entende | REMOTO ⚠️ | **LOCAL** ✅ |
> | Quem pode ligar a máquina | qualquer um, pela internet | **só quem está na frente dela** |
>
> **Um fio rompido não pode abrir a máquina para o mundo.** Por isso o contato da seletora fecha para o 0 V na posição REMOTO — a falha cai sempre para o lado de quem está presente e enxerga a câmara.
>
> Basta **um bloco NA e um pino**: aberto = LOCAL, fechado = REMOTO.

> ### ⭐ As ventoinhas não ligam todas juntas — e nem desligam juntas
>
> Cada grupo tem uma condição diferente, e a diferença não é economia: é térmica.
>
> | Grupo | Pino | Liga quando | Desliga quando |
> |---|---|---|---|
> | **RADIADOR** (2, lado quente) | ⭐ **D30** | a Peltier está resfriando **ou** o dissipador está quente | o **DS18B20** dizer que voltou perto da ambiente |
> | **PTC** (1, no aquecedor) | D28 | está **aquecendo** ou em degelo | **2 min** depois de parar de aquecer |
> | **CIRCULAÇÃO** (2 frias + 2 do duto) | D29 | ensaio rodando, **frio ou quente** | fim do ensaio, na hora |
>
> ⚠️ **Os três comportamentos só existem a partir da revisão de §40.10.** Antes, os pinos D28 e D29 estavam apenas `#define`ados e nenhuma linha do firmware escrevia neles — **as ventoinhas comandadas não giravam nunca** — e o radiador não tinha pino algum: girava sem parar enquanto o painel estivesse energizado.
>
> ### 🔧 Correção — o radiador perdeu o comando, e por um motivo elétrico
>
> Este documento dizia: *"com a Peltier desligada, o dissipador externo não tem calor para jogar fora — ele só vira um ralo por onde o calor da câmara escapa. Ventilá-lo naquele momento atrapalha o aquecimento e gasta energia."* O raciocínio térmico continua certo. **O problema é que a ventoinha não podia ser comandada por aquele canal.**
>
> O MV-1 é um módulo de MOSFET canal N: ele chaveia o **negativo**. E o terceiro fio da ventoinha — o tacômetro — é um transistor em coletor aberto cujo emissor está ligado a esse mesmo negativo. Com o canal desligado, o preto da ventoinha sobe para perto de 12 V e empurra corrente pelo diodo de proteção do pino `D3` do Mega. E antes disso, a leitura já mentia: **canal desligado = "ventoinha parada"**, que é exatamente o alarme que existe para salvar a pastilha.
>
> **Elas ficaram permanentemente ligadas, direto no BD-AUX.** O custo é o que este documento apontava: uns 5 W a mais e um pouco de fuga térmica enquanto o PTC trabalha. A conta: a pastilha desligada conduz ~0,5 W/K, e ventilar o dissipador muda a diferença de temperatura em uns 5 K — **uns 2,5 W de fuga a mais, contra um PTC de dezenas de watts.** Atrasa o aquecimento em alguma coisa; não impede.
>
> Em troca: os dois tacômetros passam a ter uma referência que nunca se mexe, o lado quente continua ventilado **até depois da emergência** (o BD-AUX não passa pelo KM1), e o firmware tem um modo de falha a menos.
>
> 🎁 **Se um dia quiser o comando de volta:** ventoinha de **4 fios (PWM)**. Nela o preto é 0 V de verdade, o tacômetro tem referência fixa, e o controle entra por um quarto fio — aí sim de um pino PWM do Mega, sem tocar no circuito de potência.
>
> **⭐ Por que a ventoinha não desliga junto com a carga: a PÓS-VENTILAÇÃO.** Quando o ensaio acaba, o dissipador ainda está cheio de calor armazenado. Cortar a ventoinha ali deixa esse calor voltar por condução — no caso da Peltier, atravessando a própria pastilha no sentido errado, que é o que mais encurta a vida dela. Então a ventoinha continua girando até o dissipador esfriar.
>
> 🔧 **A implementação está em [§40.10 · gerenciarVentoinhas()](#-as-ventoinhas--quem-liga-quem-para-e-quem-nunca-para), e mudou de critério.** A versão anterior desta nota trazia uma `precisaPosVentilar()` que comparava a temperatura do dissipador com a ambiente — mas **a função nunca foi chamada por ninguém**, e ela pressupunha um *"segundo DS18B20"* que não existe: o [Doc 32 §32.1](../camada_3_eletrica/32_sinais_e_sensores.md) usa o **único** DS18B20 do projeto no dissipador do lado quente da Peltier, e não há sensor nas aletas do PTC.
>
> Como a única ventoinha que ainda precisa de pós-ventilação comandada é a do PTC — e ela não tem sensor —, **a pós-ventilação passou a ser por tempo: 2 minutos.** Some o sensor inexistente, some a rede de segurança `POS_VENT_MAX` que existia só para tapar o travamento desse sensor, e some um modo de falha.
>
> **O DS18B20 do dissipador continua útil**, só que para outra coisa: acender o aviso *"DISSIPADOR QUENTE — NÃO DESLIGUE A CHAVE GERAL"* na tela.
>
> ✅ **A pós-ventilação sobrevive à emergência**, e isso foi de graça: os 12 V das ventoinhas vêm do **BD-AUX** e o Arduino do **BD-5V** — os dois são barramentos permanentes, que não caem com o KM1. Ou seja, alguém pode socar o cogumelo com a câmara a 60 °C e as ventoinhas continuam tirando o calor.


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

## 40.5 PID e PWM de 20 kHz

### Por que 20 kHz — e por que 1 Hz estava errado

> ⚠️ **Esta seção foi corrigida em 18/08/2026.** O projeto usava PWM de **1 Hz**, com a
> justificativa de que cada liga-desliga daria um choque térmico na pastilha, e que a 490 Hz
> seriam 490 choques por segundo. **A justificativa estava invertida** — a análise completa está
> no [Doc 43 §43.5](43_analise_modelo_termico.md).

O raciocínio certo tem duas partes, e elas respondem a perguntas diferentes:

| Pergunta | Resposta | O que resolve |
|---|---|---|
| **Com que frequência chavear?** | **Alta** — acima da constante de tempo térmica da junção, para que ela veja corrente constante | a **fadiga** da pastilha |
| **Chavear ou reduzir a corrente?** | Reduzir seria melhor, mas custa um filtro LC de 6 A | o **rendimento** (COP) |

A 1 Hz a junção da pastilha **cicla termicamente de verdade**: 1 s é da ordem da constante de
tempo dela, então ela esquenta e esfria a cada ciclo. As juntas internas são soldadas com BiSn a
138 °C, e a ciclagem térmica é o principal modo de falha citado pelos fabricantes. A 20 kHz a
massa térmica filtra completamente — a junção vê corrente eficaz constante e **não cicla**.

**O que subir a frequência NÃO resolve:** enquanto a corrente for onda quadrada, a perda Joule
continua proporcional ao valor eficaz, e o quadrado da média é sempre menor que a média dos
quadrados. São ~34 W de perda a mais em 60 % de duty ([Doc 43 §43.4](43_analise_modelo_termico.md)).
Resolver isso exige **corrente contínua**: filtro LC dimensionado para 6 A, ou fonte de corrente.

> 📌 **Decisão registrada:** adotamos **20 kHz** (etapa 1 da escada do Doc 43 §43.5), que custa
> zero componente e elimina a ciclagem térmica. A etapa 2 — o filtro LC — **não foi adotada**: um
> indutor que aguente 6 A contínuos sem saturar é caro, grande, e seria mais um componente solto
> num projeto que está indo na direção contrária. O ganho de rendimento fica documentado como
> trabalho futuro, com a conta pronta.

### Por que exatamente 20 kHz

| Limite | Valor | Por quê |
|---|---|---|
| Piso | ~18 kHz | **acima da audição** — a maquete é apresentada numa sala silenciosa, e chiado de PWM em 8 kHz é o tipo de coisa que a banca ouve antes de ver |
| Teto | 25 kHz | limite de chaveamento do **BTS7960**; acima disso as perdas de comutação do próprio driver crescem |

20 kHz fica no meio, e sai exato de um timer de 16 bits do Mega: `16 MHz / 20 kHz = 800`.

### Configuração dos timers

Os pinos de PWM dos dois drivers são o **D5** (Timer3) e o **D6** (Timer4) — dois timers de 16
bits, cada um com o seu driver, e **nenhum deles é o Timer0**, que é do `millis()`.

```cpp
/* PWM de 20 kHz nos dois BTS7960.
   Fast PWM com TOP em ICR (modo 14): f = F_CPU / (N x (1 + TOP))
   16.000.000 / (1 x 800) = 20.000 Hz   ·   resolucao de 800 passos

   ATENCAO: nao use analogWrite() nestes pinos depois disto — ela
   reescreve o modo do timer e derruba a frequencia para 490 Hz. */
const uint16_t PWM_TOP = 799;          // 800 passos, contando o zero

void setupPWM20kHz() {
    pinMode(BTS1_RPWM, OUTPUT);        // D5 · OC3A · Timer3
    pinMode(BTS2_RPWM, OUTPUT);        // D6 · OC4A · Timer4

    // Timer3 — canal A, nao-invertido, Fast PWM com TOP = ICR3
    TCCR3A = _BV(COM3A1) | _BV(WGM31);
    TCCR3B = _BV(WGM33)  | _BV(WGM32) | _BV(CS30);   // prescaler 1
    ICR3   = PWM_TOP;
    OCR3A  = 0;

    // Timer4 — idem
    TCCR4A = _BV(COM4A1) | _BV(WGM41);
    TCCR4B = _BV(WGM43)  | _BV(WGM42) | _BV(CS40);
    ICR4   = PWM_TOP;
    OCR4A  = 0;
}

/* duty em 0..100 % -> contagem do timer, com RAMPA.
   A rampa nao e estetica: partida em degrau num par de Peltier em serie
   puxa o pico de corrente inteiro de uma vez, e e esse pico que o
   fusivel F1 enxerga. Subir em passos de 5 % espalha isso no tempo. */
const uint8_t PASSO_RAMPA = 5;         // % por atualizacao
uint8_t dutyAtual[2] = { 0, 0 };

void aplicarDuty(uint8_t canal, uint8_t alvo) {
    uint8_t &atual = dutyAtual[canal];
    if      (alvo > atual) atual = min(alvo, (uint8_t)(atual + PASSO_RAMPA));
    else if (alvo < atual) atual = (atual > PASSO_RAMPA) ? atual - PASSO_RAMPA : 0;

    uint16_t conta = (uint32_t)atual * PWM_TOP / 100;
    if (canal == 0) OCR3A = conta;     // Peltier
    else            OCR4A = conta;     // PTC
}
```

### O que isso mudou na leitura de corrente

O `IS` de cada BTS7960 entrega uma corrente proporcional à da carga, e o módulo IBT-2 já traz
~1 kΩ nesse pino. Com o **100 nF** da PI-1 (C1 e C2), o filtro corta em
`1 / (2π × 1 kΩ × 100 nF) ≈ 1,6 kHz` — doze vezes abaixo da portadora.

| | PWM de 1 Hz | PWM de 20 kHz |
|---|---|---|
| O que o A0 lia | o valor **instantâneo**, e só valia dentro do tempo ligado | a **média** da corrente |
| Papel do capacitor | filtrar ruído captado pelo cabo | ⭐ **integrar a corrente picotada** — virou parte da medição |
| Cuidado no firmware | amostrar sincronizado com a janela | nenhum: pode ler a qualquer momento |

> ⭐ **O C1 e o C2 ficaram mais importantes com esta mudança, não menos.** Sem eles, a 20 kHz o
> A/D lê um pedaço qualquer da onda e o diagnóstico de corrente vira ruído.

### Código do PID

```cpp
double setpoint = 5.0;     // °C — vem da tela ou do MQTT
double entrada  = 0.0;     // °C — DS18B20
double saidaPID = 0.0;     // -100 (frio maximo) .. +100 (quente maximo)

double Kp = 8.0, Ki = 0.2, Kd = 1.0;
PID meuPID(&entrada, &saidaPID, &setpoint, Kp, Ki, Kd, DIRECT);

void setupPID() {
    meuPID.SetOutputLimits(-100, 100);   // saida BIPOLAR
    meuPID.SetSampleTime(1000);          // recalcula a 1 Hz — o processo e lento
    meuPID.SetMode(AUTOMATIC);
}
```

> 💡 **O PID continua recalculando a 1 Hz, e isso está certo:** a constante de tempo da câmara é
> de minutos. O que era 1 Hz e virou 20 kHz é o **chaveamento**, não o cálculo. São duas coisas
> diferentes que a versão anterior deste documento misturava.

> 💡 **Saída bipolar:** como o PID está em modo `DIRECT`, a saída fica **positiva quando falta
> calor** (temperatura abaixo do setpoint) e **negativa quando sobra**. Uma única malha resolve os
> dois modos, e o **sinal da saída escolhe o atuador**.


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

    // ⭐ Todas as internas param junto com o ensaio.
    //   O PTC nao precisa de pos-ventilacao: ele e AUTO-LIMITADO -- sem
    //   fluxo de ar a resistencia sobe e ele corta a propria potencia.
    //   Quem continua ventilando e so o RADIADOR, pelo KA2, enquanto o
    //   DS18B20 disser que o dissipador esta quente.
    digitalWrite(VENT_INTERNAS, LOW);
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

    // ⭐ A VIGILÂNCIA SEGUE O RADIADOR, NÃO O MODO. Enquanto o firmware
    //   mandar ventilar, ele confere se está ventilando — e isso inclui
    //   a PÓS-VENTILAÇÃO, que antes ficava sem ninguém olhando.
    //   O tempo de partida conta do COMANDO do radiador, não do início
    //   do resfriamento: é a ventoinha que precisa acelerar.
    if (!radiadorLigado || estado == EMERGENCIA) return;
    if (millis() - inicioRadiador < TEMPO_PARTIDA_FAN) return;

    bool parada1 = (rpmAtual1 < RPM_MINIMA);
    bool parada2 = (rpmAtual2 < RPM_MINIMA);
    if (!parada1 && !parada2) return;

    if (modo == RESFRIAMENTO && estado == RODANDO) {
        // A pastilha está gerando calor AGORA: corta.
        if (parada1) dispararTrip("FAN1_PARADA");
        if (parada2) dispararTrip("FAN2_PARADA");
    } else {
        // ⭐ PÓS-VENTILAÇÃO: não há o que cortar — a potência já caiu.
        //   Mas o dissipador está quente e o calor está voltando pela
        //   pastilha desligada. Isso é ALARME, e tem de aparecer.
        strncpy(alerta, parada1 ? "FAN1_POSVENT" : "FAN2_POSVENT",
                sizeof(alerta) - 1);
        digitalWrite(LED_FAULT, HIGH);
    }
}
```

> 📌 **Identifique QUAL fan parou no alarme.** `FAN1_PARADA` e `FAN2_PARADA` como motivos distintos economizam muito tempo de diagnóstico — e aparecem na tela e no log do SD, o que é ótimo material para o relatório de ensaios.

### O trip: cortar a potência em HARDWARE

```cpp
void dispararTrip(const char* motivo) {
    desabilitarDrivers();              // 1º — corta o comando dos dois drivers
    cortarPotencia();                  // 2º — ⚡ e ABRE O KM1: corte FÍSICO
                                       //      ⭐ e agenda a CONFERÊNCIA pelo D25
    desligarTudo();
    digitalWrite(LED_RUN, LOW);
    digitalWrite(LED_FAULT, HIGH);
    strncpy(alerta, motivo, sizeof(alerta) - 1);
    estado = FALHA;
    meuPID.SetMode(MANUAL);            // congela o integrador (evita windup)
    saidaPID = 0;
}
```

> ### ⭐ E o corte agora é CONFERIDO, não suposto

Mandar cortar e acreditar que cortou são coisas diferentes — e o painel já tinha
o fio que responde: o **`D25`** lê se os 24 V continuam no BD-POT. Ele era usado
só como pré-condição do START; passa a fechar a malha também no corte.

```cpp
unsigned long tCorte = 0;
bool          conferirCorte = false;

// ⚠ CHAMADA EM TODO LOOP. O KA1 desatraca em ~10 ms e o KM1 em ~20 ms;
//   150 ms é folga generosa para os dois, sem travar nada esperando.
void conferirCortePotencia() {
    if (!conferirCorte || millis() - tCorte < 150) return;
    conferirCorte = false;

    if (potenciaDisponivel()) {          // ⛔ mandei cortar e a energia FICOU
        strncpy(alerta, "CORTE_FALHOU", sizeof(alerta) - 1);
        digitalWrite(LED_FAULT, HIGH);
        // Nao ha segundo canal: o firmware ja fez tudo o que podia.
        // O que ele pode e MANDAR ALGUEM SOCAR O COGUMELO.
    }
}
```

> 🎯 **O que isso detecta que nada mais detectava.** O contato do KA1 soldado, o
> contato do KM1 soldado, um borne solto na malha da bobina — os três fazem o veto
> do firmware desaparecer **em silêncio**. O pior deles é o par: um BTS7960 com
> MOSFET em curto (que é o que disparou o trip) mais um KA1 colado. Sem esta
> conferência, a Peltier fica a 100 %, a tela mostra `FALHA` e o firmware acredita
> que cortou.
>
> 🎓 **E a distinção vale ponto na banca:** o firmware não ganhou **tolerância** a
> falha — ele ganhou **detecção** de falha. Tolerar exigiria um segundo canal de
> corte, que este painel não tem e nem precisa ter. Detectar custa oito linhas e
> um fio que já estava lá. É essa a diferença que a ISO 13849 cobra quando fala em
> *diagnostic coverage*.
>
> 🧪 **Ensaie no simulador antes da bancada:** marque `Contato do KA1 soldado` com
> o ensaio rodando e force um trip. Sem esta função o painel mente; com ela, o
> alerta `CORTE_FALHOU` aparece em 150 ms.

---

### 🔧 Correção — este comentário prometia um relé que não existia
>
> A versão anterior dizia: *"Agora o firmware **abre um relé**, e o corte é físico."* **Era falso.** A função chamava `desabilitarDrivers()` e `desligarTudo()`, e as duas só fazem `digitalWrite` em pinos de sinal. **O firmware não tinha relé nenhum sob comando** — o KM1 respondia apenas às botoeiras.
>
> Na prática, um trip por fan parada baixava o `R_EN` e nada mais. **Se o BTS7960 tivesse um MOSFET em curto** — que é o modo de falha típico de MOSFET de potência — a Peltier continuaria a 100 % com o LED de falha aceso, e só o STOP físico ou o cogumelo a parariam.
>
> O `cortarPotencia()` acima torna a frase verdadeira: ele abre o **KA1**, a bobina do **KM1** perde o retorno e o **contato de potência** do KM1 abre — junto com o selo, que é o que torna o corte retentivo. O corte é galvânico e acontece **a montante do BTS** — então independe de o driver estar são. Ver [Doc 31 §31.13](../camada_3_eletrica/31_comando_e_protecoes.md).
>
> 📌 **A ordem importa:** desabilitar os drivers **antes** de abrir o KM1 faz o contato interromper uma corrente já próxima de zero. Abrir sob 6 A queimaria o contato em poucas dezenas de operações.

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

// START: só pela IHM (§41.3). STOP: botão da porta, IHM ou MQTT.
bool pedidoDeStart() { return pedidoStart; }   // ⭐ INICIAR: só pela IHM.
// O botão VERDE não é lido por pino nenhum: ele arma a potência em
// hardware (refaz o selo do KM1) e o firmware descobre pelo D25 —
// e não por um contato auxiliar de relé.
bool pedidoDeStop()  { return digitalRead(BTN_STOP)  == LOW || pedidoStop;  }

void maquinaDeEstados() {

    // EMERGÊNCIA tem prioridade absoluta, em qualquer estado
    if (emergenciaAtiva() && estado != EMERGENCIA) {
        desabilitarDrivers();
        cortarPotencia();      // redundante (o selo já caiu) — e é de propósito
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
        if (autoTesteOK()) {
            autorizarPotencia();   // ⭐ "estou saudável" — o verde já pode armar
            estado = AGUARDA_START;
        }
        break;

      case AGUARDA_START:
        digitalWrite(LED_FAULT, LOW);
        // ⭐ INICIAR vem da IHM. O botão verde não é lido: ele arma a
        //    potência em hardware, e o firmware descobe pelo D25.
        if (pedidoDeStart()) {
            if (!potenciaDisponivel()) {
                // O selo do KM1 está aberto — só um dedo no verde o refaz
                strncpy(alerta, "APERTE_O_VERDE", sizeof(alerta) - 1);
                pedidoStart = false;
                break;
            }
            meuPID.SetMode(AUTOMATIC);
            digitalWrite(LED_RUN, HIGH);
            alerta[0] = '';
            pedidoStart = false;
            estado = RODANDO;
        }
        break;

      case RODANDO:
        // ⚠ O STOP vem PRIMEIRO. A queda de potência que o botão preto
        //   causa não é defeito — e o teste de potência, se viesse antes,
        //   classificaria toda parada normal como FALHA.
        if (pedidoDeStop()) { pararProcesso(); break; }

        // Potência que sumiu sem ninguém ter pedido = fusível, borne solto,
        // ou a emergência com o bloco de 5 V rompido.
        if (!potenciaDisponivel()) { dispararTrip("POTENCIA_PERDIDA"); break; }
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

> ### 🔧 Correção — a ordem dos dois testes do `RODANDO` transformava STOP em FALHA
>
> A versão anterior testava assim:
>
> ```cpp
> if (!potenciaDisponivel()) { dispararTrip("POTENCIA_PERDIDA"); break; }   // ← antes
> if (pedidoDeStop())        { ... estado = AGUARDA_START; }                // ← depois
> ```
>
> **Apertar o STOP físico dispara as duas condições.** O botão tem dois blocos mecanicamente ligados: o NF de 24 V corta a bobina do KM1 (e o BD-POT cai, derrubando o `D25`), e o NA de 5 V avisa o `D23`. Tipicamente o NF abre uns 2 ms antes de o NA fechar, mas o relé leva ~10 ms para desatracar — e o `loop()` carrega PID, sensores, SD e três seriais, então seu período é bem maior que isso. **Quando a máquina de estados finalmente roda, as duas já são verdadeiras.** E aí quem está escrito primeiro vence.
>
> | | Comportamento antigo | Corrigido |
> |---|---|---|
> | Apertar o STOP | cai em **`FALHA`**, LED vermelho, log `POTENCIA_PERDIDA` | `AGUARDA_START`, sem alarme |
> | Para voltar | **segurar o STOP por 2 s** (reconhecimento de falha) | um START |
>
> 🎯 **Era o segundo motivo, puramente de software, para o STOP "precisar ser segurado".** O primeiro era o estágio 2 não ter selo — resolvido devolvendo o selo ao KM1. Os dois se somavam e produziam o mesmo sintoma, o que torna esse tipo de defeito difícil de diagnosticar na bancada.
>
> **A regra geral:** um efeito colateral previsto do comando que o operador acabou de dar **não é falha**. O teste do comando vem sempre antes do teste do sintoma.

### ⭐ O alvo é uma FAIXA, e o duty é limitado pelo DISSIPADOR

> Isto substituiu o setpoint de ponto único, e resolve o defeito que todo mundo já viu num ar-condicionado: **a máquina que não chega na temperatura e fica ligada direto.**

```cpp
struct Faixa { float min; float max; };     // o operador pede "entre 10 e 12"

// As três zonas
//   T > faixa.max      URGENTE   esfria com o teto cheio
//   dentro da faixa    AJUSTE    esfria devagar, buscando a MÍNIMA
//   T <= faixa.min     PRONTO    desliga e deixa a inércia trabalhar
const float HISTERESE = 0.4;                // impede o liga-desliga picotado
```

**Trabalha para a mínima, mas a máxima já conta como sucesso.** É a segunda metade que importa: é ela que impede a máquina de perseguir um número exato que talvez não exista naquele ambiente.

#### 🔥 E o duty NÃO é limitado por corrente — é pela temperatura do dissipador

Esta é a parte que surpreende, e o simulador mediu:

```
   Câmara segura em 5 °C, ambiente 25 °C, regime permanente:

   duty    Qc (frio)   dissipador
   100 %    11,0 W      63,7 °C
    70 %    18,6 W      54,8 °C
    60 %    19,5 W      51,5 °C   ⭐ 77 % MAIS FRIO que a 100 %
    40 %    18,3 W      44,0 °C
```

**A 60 % ela esfria quase o dobro do que a 100 %.** A razão é a equação da pastilha:

```
   Qc = Qc_max · duty · (1 − ΔT / ΔT_max)
```

Mais duty joga mais calor no dissipador; dissipador mais quente aumenta o ΔT; ΔT maior derruba o Qc. **É realimentação positiva no sentido errado.** Passado o ponto ótimo, insistir dá menos frio — exatamente o que o ar-condicionado que "não dá conta" está fazendo.

```cpp
// ⭐ O limitador. O DS18B20 do dissipador já existia para a
//    pós-ventilação; agora ele também decide o teto de duty.
const float DISSIPADOR_ALVO = 52;   // °C — onde o Qc é máximo
const float DISSIPADOR_TETO = 62;   // °C — aqui o duty já caiu ao mínimo

float tetoPorDissipador(float tDis) {
    if (tDis <= DISSIPADOR_ALVO) return DUTY_MAXIMO;
    if (tDis >= DISSIPADOR_TETO) return 35;
    float f = (tDis - DISSIPADOR_ALVO) / (DISSIPADOR_TETO - DISSIPADOR_ALVO);
    return DUTY_MAXIMO - f * (DUTY_MAXIMO - 35);
}
```

> 🎯 **Repare que o sensor que já estava lá passou a ganhar o salário.** Ele foi instalado no dissipador só para saber quando parar a pós-ventilação. Agora ele fecha a malha de eficiência da Peltier — sem componente novo, sem fio novo, sem pino novo.

#### ⭐ E desistir com honestidade

```cpp
const unsigned long AVAL_MS = 5UL * 60 * 1000;   // observa por 5 min
const float MELHORA_MINIMA = 0.4;                // °C de ganho que vale a pena
```

Se em 5 minutos no teto o ganho for menor que 0,4 °C, **a faixa é inalcançável naquele ambiente**. O firmware então:

1. **Para de forçar** e recua para o duty de maior Qc (60 %)
2. **Estabiliza** no melhor ponto real
3. **Avisa na tela**: *"FAIXA INALCANÇÁVEL — segurando 8,3 °C"*

> ⚠️ **E não dispara trip.** Não é defeito do equipamento: é o ambiente. Um dia quente, uma porta aberta demais, uma carga maior que a prevista. **Transformar isso em FALHA obrigaria o operador a reconhecer um alarme que não é alarme** — e ensinaria a ignorar alarmes, que é o pior hábito que uma máquina pode ensinar.
>
> 📌 O ensaio continua, com o número **verdadeiro** na tela e no log.

### ⭐ Vigilância mútua entre os três processadores

O Mega publica um JSON por segundo nas duas seriais. **Os dois ESP32 podem detectar a morte dele só cronometrando o silêncio** — sem fio novo, sem pino, sem hardware:

```cpp
// Nos DOIS ESP32, independentemente:
const unsigned long TIMEOUT_MEGA = 3000;   // tolera 2 perdas do JSON de 1 Hz

if (millis() - ultimoJson > TIMEOUT_MEGA) {
    // IHM:       mostra "ARDUINO SEM RESPOSTA"
    // Dashboard: publica camara/alarme {"mega":"offline"}
}
```

> ### 🎯 Eles CONTAM. Eles não ATUAM — e essa distinção é o projeto inteiro
>
> Seria tentador dar ao ESP32 o poder de cortar a potência quando o Mega morre. **Seria pior.** Quando o Mega morre, quem corta já é o **pull-down no `IN` do KA1** — hardware, sem software nenhum no caminho, sem depender de o ESP estar vivo ou de a rede estar de pé.
>
> Dar poder de atuação ao ESP colocaria **três atores de software** no mesmo circuito de segurança em vez de um. Mais caminhos, mais modos de falha, e a pergunta *"quem desligou?"* deixaria de ter resposta única.
>
> ✅ **O que faltava não era um atuador a mais: era alguém para CONTAR.** Antes, um Mega morto derrubava a potência em silêncio e o operador ficava olhando uma tela congelada sem entender. Agora a tela diz, e o dashboard avisa quem está longe.
>
> 📌 **Custo total: zero.** É um `millis()` e um `if` em cada ESP.

### ⭐ A parada — uma função, três origens

```cpp
// Botão da porta, IHM ou MQTT chegam todos aqui. São o MESMO comando.
void pararProcesso() {
    desabilitarDrivers();          // R_EN dos dois em nível baixo
    // ⭐ NÃO chama cortarPotencia(). Parar pela IHM é Categoria 2: a
    //    potência segue armada e o INICIAR da tela religa sem ninguém
    //    sair do lugar. Quem derruba o selo é o botão preto (hardware)
    //    ou um TRIP (dispararTrip). São coisas diferentes de propósito.
    desligarTudo();
    digitalWrite(LED_RUN, LOW);
    meuPID.SetMode(MANUAL);
    pedidoStop = false;
    registrarEvento("STOP_IHM");
    estado = AGUARDA_START;
}
```

> 📌 **Os 50 ms entre desabilitar o driver e abrir o KM1 são a única sutileza aqui.** O contato do relé precisa interromper uma corrente já em zero: abrir sob 6 A em corrente contínua gera arco, e corrente contínua não tem passagem por zero para ajudar a extinguir. É o que come contato de relé.
>
> 🔧 **Aqui havia uma `pararCategoria1()` com rampa de duty de 250 ms**, que descia a saída antes de abrir o KM1. **Ela perdeu o cliente:** esta função não abre relé nenhum — parar pela IHM é Categoria 2 e a potência segue armada. E quando o KM1 *é* aberto, quem o abre é o **botão preto**, em hardware, onde nenhuma rampa de software chegaria a tempo. **Saiu a função, saiu o laço com `wdt_reset()` dentro, saiu a variável de rampa.**
>
> ⚠️ **Um detalhe que a rampa cobria e que agora é do hardware:** o contato do KM1 pode abrir sob os 6 A da Peltier quando alguém soca o botão preto. É por isso que o **KM1 é declarado para ≥ 10 A em corrente contínua** ([Doc 31 §31.0](../camada_3_eletrica/31_comando_e_protecoes.md)) — corrente contínua não tem passagem por zero para extinguir o arco, e um contato subdimensionado solda depois de algumas dezenas de paradas.

### 🌀 As ventoinhas — e a regra única que governa o radiador

```cpp
const float         MARGEM_AMBIENTE = 5.0;       // °C acima da ambiente
bool                dissipadorQuente = false;
bool                radiadorLigado   = false;    // estado comandado, p/ o trip
unsigned long       inicioRadiador   = 0;        // ⭐ quando ele foi mandado ligar
```

```cpp
// ⚠ CHAMADA EM TODO LOOP, EM QUALQUER ESTADO — inclusive EMERGENCIA.
//   A pós-ventilação do radiador não pode viver dentro do
//   if (estado == RODANDO).
void gerenciarVentoinhas(float tDissipador, float tAmbiente) {

    // ── ⭐ RADIADOR (lado quente da Peltier) — UMA regra, quatro casos ──
    //
    //   ligado  ⟺  a Peltier está trabalhando
    //              OU o dissipador ainda está quente
    //
    //   ⚠ SENSOR COM DEFEITO CONTA COMO QUENTE. O DS18B20 devolve
    //     DEVICE_DISCONNECTED_C (−127 °C) quando o fio se solta, e −127
    //     é "frio" para qualquer comparação — o que desligaria a
    //     ventilação exatamente quando ninguém está medindo nada.
    bool sensorOK  = (tDissipador > -100.0 && tDissipador < 150.0);
    dissipadorQuente = !sensorOK || (tDissipador > tAmbiente + MARGEM_AMBIENTE);

    bool peltierAtiva = (estado == RODANDO && modo == RESFRIAMENTO);
    bool antes        = radiadorLigado;
    radiadorLigado    = peltierAtiva || dissipadorQuente;

    // ⭐ Marca QUANDO o radiador foi mandado ligar. E deste instante,
    //   e nao do inicio do resfriamento, que a vigilancia de RPM conta
    //   o tempo de partida da ventoinha.
    if (radiadorLigado && !antes) inicioRadiador = millis();

    radiador(radiadorLigado);   // ⚠ a inversao do KA2 mora la dentro

    // ── ⭐ INTERNAS (2 frias + 2 do duto + a do PTC) — uma condição só ──
    //   Ensaio rodando, em qualquer modo. Param junto com ele.
    digitalWrite(VENT_INTERNAS, estado == RODANDO ? HIGH : LOW);
}
```

> ### ⭐ Uma regra só resolve a tabela inteira
>
> O comportamento pedido para o radiador tem quatro linhas, e todas caem da mesma condição:
>
> | Situação | Peltier ativa? | Dissipador quente? | **Resultado** |
> |---|---|---|---|
> | Resfriando | ✅ | (irrelevante) | 🟢 **ligado** |
> | Aquecendo com o PTC | ❌ | ❌ — a pastilha está desligada, o dissipador está na ambiente | ⚫ **desligado** |
> | Pós-ventilação | ❌ | ✅ | 🟢 **ligado** |
> | Parado e já frio | ❌ | ❌ | ⚫ **desligado** |
>
> 🎯 **E a regra é auto-protetora:** a ventoinha **só pode desligar quando o sensor confirma que não há calor para tirar**. Não existe combinação de estados em que ela pare com o dissipador quente — nem em `FALHA`, nem em `EMERGENCIA`, nem com o cogumelo socado. Isso não é uma coincidência feliz: é o motivo de a condição ser sobre **temperatura**, e não sobre o estado da máquina.
>
> ⚠️ **A linha do sensor com defeito é a mais importante do bloco.** `DallasTemperature` devolve **−127 °C** quando o sensor some do barramento, e −127 é menor que qualquer ambiente — a comparação ingênua concluiria "está frio, pode desligar" **justamente quando o firmware perdeu a capacidade de saber**. Fio solto num sensor **nunca** pode autorizar o desligamento de uma proteção térmica. Por isso o `!sensorOK` entra com **OU**, forçando "quente".

> ### ⭐ E a vigilância de RPM passou a seguir o RADIADOR, não o modo
>
> A versão anterior só vigiava em `modo == RESFRIAMENTO`. Parecia suficiente — é quando a pastilha gera calor. **Mas deixava a pós-ventilação inteira sem ninguém olhando**, e a pós-ventilação é exatamente a fase em que o dissipador está a 60 °C e o calor volta **através da pastilha desligada** — o que este documento chama, quatro parágrafos abaixo, de "o que mais encurta a vida dela".
>
> A condição certa é **`radiadorLigado`**: enquanto o firmware mandar ventilar, ele confere se está ventilando. E o tempo de partida passa a contar do **comando do radiador**, não do início do resfriamento — quem precisa acelerar é a ventoinha.
>
> | Fase | Ventoinha parada → | Por quê |
> |---|---|---|
> | `RESFRIAMENTO` rodando | ⚡ **trip** — corta a potência | a pastilha está gerando calor agora |
> | **Pós-ventilação** | 🟡 **alarme** `FANn_POSVENT` | não há o que cortar, a potência já caiu — mas alguém precisa saber |
> | `EMERGENCIA` | — | o cogumelo já é o alarme |
>
> 📌 **`radiadorLigado` é o estado COMANDADO, não o medido.** A diferença é toda a função do alarme: comparar "mandei ligar" com "está girando" é o que detecta a ventoinha travada. Se a condição usasse a própria RPM, o alarme provaria a si mesmo e nunca dispararia.

> ### 🔥 Correção — as duas ventoinhas comandadas nunca ligavam
>
> Os pinos das ventoinhas estavam **apenas `#define`ados**. Não havia `pinMode()`, não havia um único `digitalWrite()` em lugar nenhum do firmware. E a `precisaPosVentilar()` estava escrita numa nota lateral, **sem ninguém chamá-la**.
>
> Na prática: os dois comandos de ventoinha interna nunca eram acionados, a ventoinha do PTC e as quatro de circulação **nunca giravam**, e o ensaio rodava com o ar parado dentro da câmara. É o tipo de coisa que só aparece na bancada, quando a temperatura não homogeneíza e ninguém entende por quê.
>
> 📌 **A ventoinha do PTC não tem mais pós-ventilação, e não precisa.** Ela entrou no mesmo canal das outras internas e para junto com o ensaio — **o PTC é auto-limitado**: sem fluxo de ar a resistência dele sobe e ele corta a própria potência. Somem um pino, um canal de acionamento, um temporizador e um modo de falha. O **DS18B20 continua útil**, comandando a pós-ventilação do **radiador**, que é onde ela realmente importa.

### ⚠️ Quem para quando, e quem sobrevive à emergência

| Grupo | Pino | Para no STOP? | Para na EMERGÊNCIA? | O que a desliga |
|---|---|---|---|---|
| **2× radiador** (lado quente da Peltier) | **D30** | ❌ não — **só quando esfriar** | ❌ **não** | o **DS18B20** do dissipador |
| 1× ventoinha do PTC | D28 | não na hora — **2 min de pós-ventilação** | idem | o tempo |
| 4× circulação (2 frias + 2 do duto) | D29 | ✅ sim, na hora | ✅ sim | `desligarTudo()` |

**Nenhuma das três passa pelo KM1.** Todas vêm do BD-AUX, alimentado pelo ramal auxiliar T3 ([Doc 30](../camada_3_eletrica/30_forca_e_distribuicao.md)), e o Arduino vem do BD-5V — os dois são barramentos permanentes. Então:

> 🎯 **Alguém pode socar o cogumelo com o dissipador a 60 °C e as ventoinhas do radiador continuam girando** — e continuam até o DS18B20 dizer que o dissipador voltou para perto da ambiente. Uma Peltier desligada com o lado quente sem ventilação deixa o calor voltar **através dela**, no sentido inverso, e é isso que mais encurta a vida dela.

> ### 🔧 Revisão — o radiador recuperou o comando, e o MV-1 acabou saindo do painel
>
> Este documento dizia que as ventoinhas do radiador **não tinham pino e nunca desligavam**. Funcionava, e era seguro, mas cobrava dois preços: **~5 W girando o dia inteiro** com o painel energizado, e **~2,5 W de fuga térmica durante o aquecimento** — o dissipador ventilado puxando calor da câmara através da pastilha desligada, contra o próprio PTC.
>
> **A causa nunca foi térmica, foi topológica:** o MV-1 chaveia o **negativo**, e o tacômetro da ventoinha é referenciado nesse mesmo negativo. Cortar o canal levantava o preto para perto de 12 V, injetava corrente no diodo de proteção do `D3` e, antes disso, já fazia a leitura mentir — canal desligado lia "ventoinha parada", que é justamente o alarme que existe para salvar a pastilha.
>
> ✅ **A correção não é trocar a ventoinha: é trocar o lado que se chaveia.** O **contato NC do KA2** — um módulo de relé de 1 canal — corta o **positivo** dos 12 V. O preto das ventoinhas fica em **0 V de verdade, permanentemente**:
>
> | | Chaveando o NEGATIVO (o que quebrou) | **Contato do KA2 no POSITIVO** |
> |---|---|---|
> | O preto da ventoinha, desligada | sobe para ~12 V 🔥 | **fica em 0 V** ✅ |
> | Referência do tacômetro | se mexe | **fixa, sempre** |
> | Sinal no `D3` com ela off | injeta corrente pelo diodo de proteção | coletor aberto → o pull-up leva o pino a HIGH. Inofensivo |
> | Ventoinha necessária | — | **as de 3 fios que já estão na lista** |
>
> 🎯 **Um contato seco não tem lado alto nem lado baixo — e é essa frase que apaga o problema inteiro.** O MV-1 é um MOSFET canal N: ele só sabe puxar para 0 V, e por isso era obrigado a chavear o negativo. Um relé apenas abre e fecha, e **você escolhe em que fio pô-lo**.
>
> 📌 **E o argumento acabou valendo para as cinco internas também.** Elas ficaram sendo o único serviço do MV-1 — um módulo de 4 canais, R$ 43,51, usado como interruptor num pino sem PWM. Passaram para o **KA3**, terceiro módulo de relé na mesma caixa DIN, e o MV-1 saiu do projeto. **O código não mudou**: `HIGH` continua ligando ([Doc 31 §31.16](../camada_3_eletrica/31_comando_e_protecoes.md)).
>
> ⚡ **E o custo do comando de volta são três componentes:** o módulo do KA2, um resistor de 10 kΩ e um diodo de roda-livre — cerca de **R$ 13**. Montagem em [Doc 31 §31.14](../camada_3_eletrica/31_comando_e_protecoes.md).

> ### ⭐ O contato NF, e por que o KA2 é o oposto do KA1
>
> A primeira versão deste comando usava o **NA**, copiando a regra do KA1. Estava errada, e o erro era de sinal: **os dois relés têm estados seguros opostos.**
>
> | | Desenergizado significa | Isso é seguro? |
> |---|---|---|
> | **KA1** | contato NA abre → potência cortada | ✅ |
> | **KA2 no NA** *(como estava)* | contato abre → **ventoinha para com o dissipador quente** | ❌ |
> | **KA2 no NF** *(como ficou)* | contato fecha → **ventoinha gira** | ✅ |
>
> Trocar `NA` por `NF` e inverter uma linha do firmware muda todos os modos de falha de lado:
>
> | Falha | Antes (NA) | **Agora (NF)** |
> |---|---|---|
> | **Firmware trava** | 2 s sem ventilação até o watchdog resetar | ⭐ **o pino vai a Hi-Z no reset → ventila durante o reset inteiro** |
> | **Arduino morre de vez** | sem ventilação | ⭐ **ventila, e continua ventilando.** O KA1 já cortou a potência: para de gerar calor e segue tirando o que sobrou |
> | **Fio do `D30` rompido** | sem ventilação, sem alarme | ⭐ **ventila** (o R11 solta a bobina) |
> | **BD-5V cai** | sem ventilação | ⭐ **ventila** — o BD-AUX é outro ramal e sobrevive |
> | **DS18B20 solta o fio** | ventila (o `!sensorOK` força "quente") | igual — ✅ |
> | **Contato falha ABERTO** | 🔥 sem ventilação e sem alarme — **o pior caso do projeto** | agora ele é o único caso ruim que sobrou, e o **alarme de RPM na pós-ventilação** passou a cobri-lo |
> | **Contato falha FECHADO** | ventoinha nunca desliga | idem — **e era o comportamento anterior do projeto, que já se considerava seguro** |
>
> 🎯 **A propriedade que fecha o argumento é a mesma do §31.13, aplicada ao contrário.** Lá, nenhuma falha do KA1 deixa o painel pior do que era antes de ele existir. Aqui, com o NF, o **pior caso vira o comportamento antigo** — ventoinha sempre ligada, que custava 5 W e nunca custou uma pastilha. Uma correção que troca o pior caso pelo estado que você já aceitava é uma correção de graça.
>
> ⚠️ **O preço, e ele é pequeno:** a bobina do KA2 fica atracada sempre que as ventoinhas estão **desligadas** — ou seja, a maior parte do tempo. São ~37 mA contínuos no BD-24V. É o custo de ter o fail-safe apontando para o lado certo.
>
> 🧪 **Dá para provar no simulador:** o cenário 34 mata o Arduino com o ensaio rodando e confere que o BD-POT vai a zero **e** que o radiador continua girando. O cenário 33 abre o contato do KA2 e mostra o trip por RPM acusando — uma falha que, até esta revisão, o simulador nem sabia representar.

> ### ⛔ O único caso em que o resfriamento realmente para: a chave geral
>
> Corte a chave rotativa (ou falte energia) com o dissipador quente e **tudo** para — ventoinhas incluídas. Não há projeto que resolva isso sem bateria, e não vale a pena aqui. Resolve-se por procedimento, e o firmware ajuda:
>
> ```cpp
> // Em atualizarTela(), quando o ensaio não está rodando:
> if (estado != RODANDO && dissipadorQuente)
>     mostrar("DISSIPADOR QUENTE - NAO DESLIGUE A CHAVE GERAL");
> ```
>
> 📋 **Vai para o procedimento operacional:** ao terminar o ensaio, espere a tela liberar antes de desligar a chave geral. É exatamente a instrução que existe em compressor, em turbo e no radiador de carro que você citou — e pela mesma razão física.

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
    Serial2.begin(115200);     // tela ES3C28P (via conversor de nível)

    pinMode(LED_RUN, OUTPUT);   pinMode(LED_COOL, OUTPUT);
    pinMode(LED_HEAT, OUTPUT);  pinMode(LED_FAULT, OUTPUT);

    pinMode(BTN_STOP,    INPUT_PULLUP);
    pinMode(BTN_EMERG,   INPUT_PULLUP);
    pinMode(POTENCIA_OK, INPUT);       // divisor resistivo — sem pull-up!

    // ⭐ Habilitação da potência: SAÍDA e LOW **antes de tudo**.
    //   O pull-down de 10 kOhm no IN ja garantia isso durante o boot;
    //   aqui a garantia passa a ser ativa. O painel nasce sem 24 V nos BTS.
    pinMode(HAB_POTENCIA, OUTPUT);
    digitalWrite(HAB_POTENCIA, LOW);

    // ⭐ Ventoinhas comandadas (jumpers dos modulos em H: HIGH = ligada)
    pinMode(VENT_INTERNAS, OUTPUT); digitalWrite(VENT_INTERNAS, LOW);
    // ⚠ O radiador NASCE LIGADO. Enquanto o primeiro lerSensores() nao
    //   rodar nao ha leitura do dissipador, e "nao sei" tem que valer
    //   como "pode estar quente". Sao ~2 s de ventilacao a mais no boot.
    pinMode(VENT_RADIADOR, OUTPUT); radiador(true);   // ⭐ ventila desde o boot

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
    conferirCortePotencia();           // ⭐ mandei cortar — caiu mesmo? (D25)
    medirRPM();
    lerSensores();                         // entrada, umidade, temperatura de referência

    // ⭐ FORA do if abaixo, de propósito: a pós-ventilação do PTC e o aviso
    //    de dissipador quente precisam continuar em AGUARDA_START, em FALHA
    //    e em EMERGENCIA. Só param quando a chave geral cair.
    gerenciarVentoinhas(tDissipador, tAmbiente);

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
        atualizarTela();       // Serial2
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
- [ ] Após o LIGAR verde, a energia volta mas **o processo continua parado**
- [ ] Divisor do `POTENCIA_OK` medido: ~3,8 V com o KM1 selado, ~0 V com a emergência acionada
- [ ] PWM verificado com osciloscópio: **20 kHz ± 5 %** nos dois pinos, com duty variável. Sem osciloscópio: **não pode haver chiado audível**, e o LED do driver não pode piscar
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
