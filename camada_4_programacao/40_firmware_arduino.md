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

### 🔧 Revisão de agosto/2026 — quatro correções nascidas de duas perguntas

| # | Correção | O que estava errado |
|---|---|---|
| **12** | ⭐ **`HAB_POTENCIA` (D27) → KA3 → bobina do KA2** | O firmware **não tinha como cortar a potência**, só como desabilitar drivers. Um BTS com MOSFET em curto ficava fora do alcance de qualquer trip. E o STOP não retinha ao ser solto — o KA2 apenas copiava o botão ([Doc 31 §31.13](../camada_3_eletrica/31_comando_e_protecoes.md)) |
| **13** | ⭐ **`pedidoDeStop()` testado ANTES de `potenciaDisponivel()`** | Na ordem antiga, apertar o STOP físico caía em **`FALHA`** com log `POTENCIA_PERDIDA`, e exigia segurar o botão 2 s para reconhecer. A queda de potência causada pelo próprio comando estava sendo classificada como defeito |
| **14** | ⭐ **`gerenciarVentoinhas()` — os pinos das ventoinhas passaram a ser escritos** | Estavam **apenas `#define`ados**. Sem `pinMode`, sem um `digitalWrite` sequer. **As cinco ventoinhas internas nunca giravam** |
| **16** | 🔧 **Simplificação: 3 pinos e 1 canal do MV-1 a menos** | O `D22` (leitura do START), o `D26` (seletora LOCAL/REMOTO) e o `D28` (canal separado da ventoinha do PTC) foram eliminados. O `INICIAR` passou para a IHM; a seletora era a segunda camada de uma regra que a primeira já garante; e as internas ganharam **uma condição só**, então cabem num canal só |
| **17** | ⭐ **O KA2 ganhou selo próprio, e o botão verde voltou como comando de 24 V** | O STOP passou a cortar **e reter** em hardware — circuito clássico de partida-parada. O botão verde entrou na cadeia de 24 V (não é lido por pino nenhum) e o `KA3` passou a **autorizar** em vez de armar. Como o selo não se refaz sozinho, **o trip do firmware virou retentivo de graça** |
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
#define BTS1_RPWM     5    // 2x PELTIER EM SERIE (FRIO)  24 V / 6,0 A - PWM lento
#define BTS1_REN      4    // Peltier  enable
#define BTS1_IS      A0    // Peltier  diagnóstico de corrente (cap 100 nF na PI-1)
#define BTS2_RPWM     6    // PTC 24 V (QUENTE)            24 V / 3,3 A - PWM lento
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
#define VENT_INTERNAS 29   // MV-1 canal 3 -> as 5 ventoinhas internas
// D28 (MV-1 canal 2) ficou LIVRE: a ventoinha do PTC entrou no canal 3.

// ⭐ RADIADOR (lado quente da Peltier) -- 2 ventoinhas de 3 fios.
//   NAO chaveia o negativo delas: o tacometro e referenciado nesse
//   negativo, e corta-lo estragava a leitura de RPM e injetava
//   corrente no D3. Quem chaveia e o CONTATO do KA4,
//   e um contato seco nao tem lado alto nem lado baixo -- basta poe-lo
//   no fio POSITIVO. O preto fica em 0 V de verdade, sempre.
//   Ver Doc 31 §31.14.
#define VENT_RADIADOR 30   // gatilho do KA4 (modulo de rele)

// ⭐ AUTORIZACAO DA POTENCIA -- o "veto" do firmware sobre o KA2.
//   Comanda o KA3 (modulo de rele, caixa DIN no trilho 2), em SERIE
//   com a bobina do KA2. HIGH = "estou saudavel, a potencia PODE ser
//   armada". ⚠ JUMPER DO MODULO EM "H" -- assim HIGH fecha o contato e
//   a logica do firmware fica natural, sem inversao.
//   Quem ARMA e o operador, no botao verde -- sao duas chaves e as
//   duas precisam concordar. LOW derruba o SELO do KA2, e como o selo
//   nao se refaz sozinho, o corte e RETENTIVO: so o verde religa.
//   Ver Doc 31 §31.13.
//   Pull-down de 10k no gate: Arduino resetado ou ausente = potencia
//   cortada. O D27 vagou quando o radiador saiu do MV-1.
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

// ⭐ Corte FISICO e RETENTIVO. Abre o KA3 -> a bobina do KA2 perde o
//   retorno -> o contato de SELO abre junto -> 0 V no BD-POT.
//   Um pulso de 50 ms basta: mesmo que o KA3 feche de novo, o selo ja se
//   perdeu e a potencia NAO retorna. So o botao verde religa.
//   Funciona ate com um MOSFET do BTS7960 colado em curto, porque quem
//   abre e um contato de rele a montante dele.
inline void cortarPotencia()    { digitalWrite(HAB_POTENCIA, LOW);  }

// AUTORIZA -- nao arma. Depois disto o operador ainda precisa apertar
// o botao verde para o KA2 selar.
inline void autorizarPotencia() { digitalWrite(HAB_POTENCIA, HIGH); }

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
> Em troca: os dois tacômetros passam a ter uma referência que nunca se mexe, o lado quente continua ventilado **até depois da emergência** (o BD-AUX não passa pelo KA2), e o firmware tem um modo de falha a menos.
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
> ✅ **A pós-ventilação sobrevive à emergência**, e isso foi de graça: o MV-1 é alimentado pelo **BD-AUX** e o Arduino pelo **BD-5V** — os dois são barramentos permanentes, que não caem com o KA2. Ou seja, alguém pode socar o cogumelo com a câmara a 60 °C e as ventoinhas continuam tirando o calor.


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
double setpoint = 5.0;     // °C — vem da tela ou do MQTT
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

    // ⭐ Todas as internas param junto com o ensaio.
    //   O PTC nao precisa de pos-ventilacao: ele e AUTO-LIMITADO -- sem
    //   fluxo de ar a resistencia sobe e ele corta a propria potencia.
    //   Quem continua ventilando e so o RADIADOR, pelo KA4, enquanto o
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

    // Só protege quando as Peltier estão ativas há tempo suficiente
    // para as fans já terem acelerado (evita falso trip na partida)
    if (modo == RESFRIAMENTO && estado == RODANDO &&
        (millis() - inicioModoFrio > TEMPO_PARTIDA_FAN)) {

        if (rpmAtual1 < RPM_MINIMA) dispararTrip("FAN1_PARADA");
        if (rpmAtual2 < RPM_MINIMA) dispararTrip("FAN2_PARADA");
    }
}
```

> 📌 **Identifique QUAL fan parou no alarme.** `FAN1_PARADA` e `FAN2_PARADA` como motivos distintos economizam muito tempo de diagnóstico — e aparecem na tela e no log do SD, o que é ótimo material para o relatório de ensaios.

### O trip: cortar a potência em HARDWARE

```cpp
void dispararTrip(const char* motivo) {
    desabilitarDrivers();              // 1º — corta o comando dos dois drivers
    cortarPotencia();                  // 2º — ⚡ e ABRE O KA2: corte FÍSICO
    desligarTudo();
    digitalWrite(LED_RUN, LOW);
    digitalWrite(LED_FAULT, HIGH);
    strncpy(alerta, motivo, sizeof(alerta) - 1);
    estado = FALHA;
    meuPID.SetMode(MANUAL);            // congela o integrador (evita windup)
    saidaPID = 0;
}
```

> ### 🔧 Correção — este comentário prometia um relé que não existia
>
> A versão anterior dizia: *"Agora o firmware **abre um relé**, e o corte é físico."* **Era falso.** A função chamava `desabilitarDrivers()` e `desligarTudo()`, e as duas só fazem `digitalWrite` em pinos de sinal. **O firmware não tinha relé nenhum sob comando** — o KA1 e o KA2 respondiam apenas às botoeiras.
>
> Na prática, um trip por fan parada baixava o `R_EN` e nada mais. **Se o BTS7960 tivesse um MOSFET em curto** — que é o modo de falha típico de MOSFET de potência — a Peltier continuaria a 100 % com o LED de falha aceso, e só o STOP físico ou o cogumelo a parariam.
>
> O `cortarPotencia()` acima torna a frase verdadeira: ele abre o **KA3**, a bobina do **KA2** perde o retorno e o **contato de potência** do KA2 abre — junto com o selo, que é o que torna o corte retentivo. O corte é galvânico e acontece **a montante do BTS** — então independe de o driver estar são. Ver [Doc 31 §31.13](../camada_3_eletrica/31_comando_e_protecoes.md).
>
> 📌 **A ordem importa:** desabilitar os drivers **antes** de abrir o KA2 faz o contato interromper uma corrente já próxima de zero. Abrir sob 6 A queimaria o contato em poucas dezenas de operações.

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
// hardware (refaz o selo do KA2) e o firmware descobre pelo D25 —
// exatamente como já ignora o REARME azul.
bool pedidoDeStop()  { return digitalRead(BTN_STOP)  == LOW || pedidoStop;  }

void maquinaDeEstados() {

    // EMERGÊNCIA tem prioridade absoluta, em qualquer estado
    if (emergenciaAtiva() && estado != EMERGENCIA) {
        desabilitarDrivers();
        cortarPotencia();      // redundante (o KA1 já caiu) — e é de propósito
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
                // O selo do KA2 está aberto — só um dedo no verde o refaz
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
> **Apertar o STOP físico dispara as duas condições.** O botão tem dois blocos mecanicamente ligados: o NF de 24 V corta a bobina do KA2 (e o BD-POT cai, derrubando o `D25`), e o NA de 5 V avisa o `D23`. Tipicamente o NF abre uns 2 ms antes de o NA fechar, mas o relé leva ~10 ms para desatracar — e o `loop()` carrega PID, sensores, SD e três seriais, então seu período é bem maior que isso. **Quando a máquina de estados finalmente roda, as duas já são verdadeiras.** E aí quem está escrito primeiro vence.
>
> | | Comportamento antigo | Corrigido |
> |---|---|---|
> | Apertar o STOP | cai em **`FALHA`**, LED vermelho, log `POTENCIA_PERDIDA` | `AGUARDA_START`, sem alarme |
> | Para voltar | **segurar o STOP por 2 s** (reconhecimento de falha) | um START |
>
> 🎯 **Era o segundo motivo, puramente de software, para o STOP "precisar ser segurado".** O primeiro era o estágio 2 não ter selo — resolvido devolvendo o selo ao KA2. Os dois se somavam e produziam o mesmo sintoma, o que torna esse tipo de defeito difícil de diagnosticar na bancada.
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
> Seria tentador dar ao ESP32 o poder de cortar a potência quando o Mega morre. **Seria pior.** Quando o Mega morre, quem corta já é o **pull-down no gate do KA3** — hardware, sem software nenhum no caminho, sem depender de o ESP estar vivo ou de a rede estar de pé.
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

> 📌 **Os 50 ms entre desabilitar o driver e abrir o KA2 são a única sutileza aqui.** O contato do relé precisa interromper uma corrente já em zero: abrir sob 6 A em corrente contínua gera arco, e corrente contínua não tem passagem por zero para ajudar a extinguir. É o que come contato de relé.
>
> 🔧 **Aqui havia uma `pararCategoria1()` com rampa de duty de 250 ms**, que descia a saída antes de abrir o KA2. **Ela perdeu o cliente:** esta função não abre relé nenhum — parar pela IHM é Categoria 2 e a potência segue armada. E quando o KA2 *é* aberto, quem o abre é o **botão preto**, em hardware, onde nenhuma rampa de software chegaria a tempo. **Saiu a função, saiu o laço com `wdt_reset()` dentro, saiu a variável de rampa.**
>
> ⚠️ **Um detalhe que a rampa cobria e que agora é do hardware:** o contato do KA2 pode abrir sob os 6 A da Peltier quando alguém soca o botão preto. É por isso que o **KA2 é declarado para ≥ 10 A em corrente contínua** ([Doc 31 §31.0](../camada_3_eletrica/31_comando_e_protecoes.md)) — corrente contínua não tem passagem por zero para extinguir o arco, e um contato subdimensionado solda depois de algumas dezenas de paradas.

### 🌀 As ventoinhas — e a regra única que governa o radiador

```cpp
const float         MARGEM_AMBIENTE = 5.0;       // °C acima da ambiente
bool                dissipadorQuente = false;
bool                radiadorLigado   = false;    // estado comandado, p/ o trip
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
    radiadorLigado    = peltierAtiva || dissipadorQuente;
    digitalWrite(VENT_RADIADOR, radiadorLigado ? HIGH : LOW);

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

> ### ⚡ O trip por RPM continua coerente — e ganhou uma guarda
>
> A ventoinha agora pode estar legitimamente parada, e o alarme `FAN_PARADA` existe para detectar exatamente "parada". Sem cuidado, o novo controle criaria alarme falso.
>
> Só que os dois casos não se cruzam: o trip só arma em `modo == RESFRIAMENTO`, e em `RESFRIAMENTO` a regra acima **sempre** liga o radiador. Mesmo assim, vale explicitar em vez de depender da coincidência:
>
> ```cpp
> // Em medirRPM(), na condição de trip:
> if (radiadorLigado && modo == RESFRIAMENTO && estado == RODANDO &&
>     (millis() - inicioModoFrio > TEMPO_PARTIDA_FAN)) {
>     if (rpmAtual1 < RPM_MINIMA) dispararTrip("FAN1_PARADA");
>     if (rpmAtual2 < RPM_MINIMA) dispararTrip("FAN2_PARADA");
> }
> ```
>
> 📌 **`radiadorLigado` é o estado COMANDADO, não o medido.** A diferença é toda a função do alarme: comparar "mandei ligar" com "está girando" é o que detecta a ventoinha travada. Se a condição usasse a própria RPM, o alarme provaria a si mesmo e nunca dispararia.

> ### 🔥 Correção — as duas ventoinhas comandadas nunca ligavam
>
> Os pinos das ventoinhas estavam **apenas `#define`ados**. Não havia `pinMode()`, não havia um único `digitalWrite()` em lugar nenhum do firmware. E a `precisaPosVentilar()` estava escrita numa nota lateral, **sem ninguém chamá-la**.
>
> Na prática: os canais 2 e 3 do MV-1 nunca eram acionados, a ventoinha do PTC e as quatro de circulação **nunca giravam**, e o ensaio rodava com o ar parado dentro da câmara. É o tipo de coisa que só aparece na bancada, quando a temperatura não homogeneíza e ninguém entende por quê.
>
> 📌 **A ventoinha do PTC não tem mais pós-ventilação, e não precisa.** Ela entrou no mesmo canal das outras internas e para junto com o ensaio — **o PTC é auto-limitado**: sem fluxo de ar a resistência dele sobe e ele corta a própria potência. Somem um pino, um canal do MV-1, um temporizador e um modo de falha. O **DS18B20 continua útil**, comandando a pós-ventilação do **radiador**, que é onde ela realmente importa.

### ⚠️ Quem para quando, e quem sobrevive à emergência

| Grupo | Pino | Para no STOP? | Para na EMERGÊNCIA? | O que a desliga |
|---|---|---|---|---|
| **2× radiador** (lado quente da Peltier) | **D30** | ❌ não — **só quando esfriar** | ❌ **não** | o **DS18B20** do dissipador |
| 1× ventoinha do PTC | D28 | não na hora — **2 min de pós-ventilação** | idem | o tempo |
| 4× circulação (2 frias + 2 do duto) | D29 | ✅ sim, na hora | ✅ sim | `desligarTudo()` |

**Nenhuma das três passa pelo KA2.** Todas vêm do BD-AUX, alimentado pelo ramal auxiliar T3 ([Doc 30](../camada_3_eletrica/30_forca_e_distribuicao.md)), e o Arduino vem do BD-5V — os dois são barramentos permanentes. Então:

> 🎯 **Alguém pode socar o cogumelo com o dissipador a 60 °C e as ventoinhas do radiador continuam girando** — e continuam até o DS18B20 dizer que o dissipador voltou para perto da ambiente. Uma Peltier desligada com o lado quente sem ventilação deixa o calor voltar **através dela**, no sentido inverso, e é isso que mais encurta a vida dela.

> ### 🔧 Revisão — o radiador recuperou o comando, e o canal 1 do MV-1 voltou a existir
>
> Este documento dizia que as ventoinhas do radiador **não tinham pino e nunca desligavam**. Funcionava, e era seguro, mas cobrava dois preços: **~5 W girando o dia inteiro** com o painel energizado, e **~2,5 W de fuga térmica durante o aquecimento** — o dissipador ventilado puxando calor da câmara através da pastilha desligada, contra o próprio PTC.
>
> **A causa nunca foi térmica, foi topológica:** o MV-1 chaveia o **negativo**, e o tacômetro da ventoinha é referenciado nesse mesmo negativo. Cortar o canal levantava o preto para perto de 12 V, injetava corrente no diodo de proteção do `D3` e, antes disso, já fazia a leitura mentir — canal desligado lia "ventoinha parada", que é justamente o alarme que existe para salvar a pastilha.
>
> ✅ **A correção não é trocar a ventoinha: é trocar o lado que se chaveia.** O **contato do KA4** — um módulo de relé de 1 canal — corta o **positivo** dos 12 V. O preto das ventoinhas fica em **0 V de verdade, permanentemente**:
>
> | | Chaveando o NEGATIVO (o que quebrou) | **Contato do KA4 no POSITIVO** |
> |---|---|---|
> | O preto da ventoinha, desligada | sobe para ~12 V 🔥 | **fica em 0 V** ✅ |
> | Referência do tacômetro | se mexe | **fixa, sempre** |
> | Sinal no `D3` com ela off | injeta corrente pelo diodo de proteção | coletor aberto → o pull-up leva o pino a HIGH. Inofensivo |
> | Ventoinha necessária | — | **as de 3 fios que já estão na lista** |
>
> 🎯 **Um contato seco não tem lado alto nem lado baixo — e é essa frase que apaga o problema inteiro.** O MV-1 é um MOSFET canal N: ele só sabe puxar para 0 V, e por isso era obrigado a chavear o negativo. Um relé apenas abre e fecha, e **você escolhe em que fio pô-lo**. O canal 1 do MV-1 continua livre.
>
> ⚡ **E o custo do comando de volta são três componentes:** o KA4, um resistor de 10 kΩ e um diodo de roda-livre — cerca de **R$ 3,50**. Montagem em [Doc 31 §31.14](../camada_3_eletrica/31_comando_e_protecoes.md).

> ### ⚠️ O que se perde, e por que é aceitável
>
> Antes, as ventoinhas do radiador giravam **mesmo com o Arduino morto**. Agora dependem dele. Vale encarar isso de frente:
>
> | Falha | O que acontece |
> |---|---|
> | **Firmware trava** | O watchdog reseta em 2 s e o `setup()` liga o radiador antes de qualquer outra coisa. **2 segundos sem ventilação** — irrelevante para a inércia de um dissipador de alumínio |
> | **Arduino morre de vez** | Sem ventilação. **Mas também sem Peltier:** o `R_EN` cai pelos pull-downs e o **KA3** corta os 24 V. Não há geração de calor, só o residual, que se dissipa por convecção natural |
> | **DS18B20 solta o fio** | ⭐ **A ventoinha LIGA e fica ligada.** O `!sensorOK` força "quente" |
> | **Contato do KA4 falha aberto** | Sem ventilação — e sem alarme. É o pior caso, e é o que o **trip por RPM = 0** já detectava antes de tudo isso existir |
>
> 📌 **A dependência do Arduino não é nova, é a mesma de sempre.** Ele já era o único que sabia parar a Peltier por RPM. O que mudou foi a ventilação passar a depender dele também — e como as duas dependem do mesmo componente, uma falha dele derruba as duas juntas, que é a ordem correta: **primeiro para de gerar calor, depois para de tirar.**

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
    //   O pull-down de 10 kΩ no gate já garantia isso durante o boot;
    //   aqui a garantia passa a ser ativa. O painel nasce sem 24 V nos BTS.
    pinMode(HAB_POTENCIA, OUTPUT);
    digitalWrite(HAB_POTENCIA, LOW);

    // ⭐ Ventoinhas comandadas (jumpers do MV-1 em H: HIGH = ligada)
    pinMode(VENT_INTERNAS, OUTPUT); digitalWrite(VENT_INTERNAS, LOW);
    // ⚠ O radiador NASCE LIGADO. Enquanto o primeiro lerSensores() nao
    //   rodar nao ha leitura do dissipador, e "nao sei" tem que valer
    //   como "pode estar quente". Sao ~2 s de ventilacao a mais no boot.
    pinMode(VENT_RADIADOR, OUTPUT); digitalWrite(VENT_RADIADOR, HIGH);

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
