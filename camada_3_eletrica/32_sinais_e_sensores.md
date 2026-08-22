# CAMADA 3 · Doc 32 — Sinais, Sensores e Comunicação

> Toda a fiação de baixo nível: pinout do Arduino Mega, drivers BTS7960, sensores, comunicação serial/I²C/SPI/1-Wire e monitoramento de RPM.
>
> ✅ **Pré-requisito:** [Doc 30](30_forca_e_distribuicao.md) e [Doc 31](31_comando_e_protecoes.md).

---

## 🟢 Em palavras simples — os sentidos e os nervos da máquina

Se o Doc 30 foi o "sistema circulatório" (a energia), este é o **sistema nervoso**: os fios finos que levam informação, não força.

| Tipo de fio | O que carrega | Bitola |
|---|---|---|
| **Potência** (Doc 30) | Energia para fazer trabalho | 1,5 mm² |
| **Sinal** (este documento) | Informação | 0,25 mm² |

### O que a máquina "sente"

| Sentido | Sensor | Para quê |
|---|---|---|
| Temperatura da câmara | **DS18B20** | É a variável que o PID controla |
| Umidade | **AM2315C** | Prever condensação e gelo |
| Rotação dos coolers | **fio de tacômetro** | ⚠️ Proteção crítica — cooler parado = Peltier queimada |
| Corrente dos atuadores | **pino IS dos BTS7960** | Detectar atuador desconectado ou queimado |
| Hora certa | **RTC DS3231** | Carimbar o log com data e hora reais |

### Por que fio de sinal é tão sensível a ruído

Um driver de potência liga e desliga 6 ampères. Cada vez que isso acontece, ele gera um "estalo" eletromagnético — como o chiado no rádio quando alguém liga a furadeira.

Os fios de sinal trabalham com **milivolts**. Se correrem junto dos cabos de potência, captam esse estalo, e a leitura do sensor começa a pular sem motivo. O sistema dispara alarmes com tudo funcionando bem.

**As três defesas do projeto:**

| Defesa | Como funciona |
|---|---|
| **Separar fisicamente** | Potência de um lado da canaleta, sinal do outro. Cruzar só a 90° |
| **Blindar** | Os fios mais sensíveis andam dentro de uma malha metálica aterrada, que funciona como guarda-chuva |
| **Filtrar** | Capacitores de 100 nF junto ao Arduino "amortecem" o que passou |

> ⚠️ **A blindagem é aterrada em UM ponto só, no painel.** Aterrar nas duas pontas cria um caminho de corrente pela malha — chama-se *loop de terra*, e transforma a proteção em antena.

### Os erros de pino que este documento corrige

Duas armadilhas do Arduino Mega estão documentadas aqui, e as duas eram silenciosas — o código compila, roda, e a proteção simplesmente não existe:

| Erro | Por que acontece | Correção |
|---|---|---|
| RPM no pino **D13** | D13 **não é pino de interrupção** no Mega. `attachInterrupt` é ignorado sem aviso, e a contagem nunca acontece | Foi para o **D3** |
| Segundo RPM sem pino | As interrupções externas acabaram (D2 é 1-Wire, D18-21 são Serial e I²C) | Foi para o **A8**, por interrupção de mudança de pino |

> 🎯 **A lição:** *"compilou e rodou" não significa "funciona".* Uma proteção que não dispara é pior que proteção nenhuma, porque você confia nela.

### Dicionário rápido

| Termo | O que quer dizer |
|---|---|
| **Pinout** | O mapa de qual pino faz o quê |
| **Interrupção** | Recurso que faz o processador largar tudo para atender um sinal na hora |
| **Pull-up / pull-down** | Resistor que define o nível de um pino quando ninguém o comanda |
| **1-Wire** | Protocolo que usa **um fio só** para dados. Precisa de um resistor para funcionar |
| **I²C** | Protocolo de 2 fios onde vários sensores convivem, cada um com um endereço |
| **SPI** | Protocolo rápido de 4 fios. Usado pelo cartão SD |
| **UART / Serial** | Comunicação de 2 fios entre dois processadores |
| **Tacômetro** | O fio do cooler que emite pulsos conforme ele gira |
| **ADC** | Conversor que transforma tensão em número para o programa ler |
| **Blindagem** | Malha metálica em volta do fio, que protege de ruído |
| **Loop de terra** | Erro clássico: aterrar a blindagem nas 2 pontas e criar circulação de corrente |

---

## 32.1 🔧 Correção importante em relação à versão anterior

> ### O sinal de RPM não pode ficar no pino D13
>
> A documentação anterior colocava o tacômetro do cooler no **D13** e usava `attachInterrupt(digitalPinToInterrupt(13), ...)`.
>
> **Isso não funciona no Arduino Mega 2560.** As interrupções externas do Mega estão disponíveis apenas em:
>
> | Interrupção | Pino |
> |---|---|
> | INT0 | **D2** |
> | INT1 | **D3** |
> | INT2 | D21 (usado pelo I²C — SCL) |
> | INT3 | D20 (usado pelo I²C — SDA) |
> | INT4 | D19 (usado pela Serial1 — RX) |
> | INT5 | D18 (usado pela Serial1 — TX) |
>
> `digitalPinToInterrupt(13)` retorna `NOT_AN_INTERRUPT` e a chamada é silenciosamente ignorada — **a contagem de RPM nunca acontece, e a proteção mais crítica do projeto fica desativada sem nenhum aviso.**
>
> ✅ **Correção adotada: o sinal de RPM vai para o D3 (INT1).** O DS18B20 fica no D2, onde não precisa de interrupção.
>
> ### ⭐ E agora são DOIS tacômetros
>
> Com a arquitetura de potência em 24 V, são **2 pastilhas Peltier em série**, cada uma com o seu dissipador e o seu cooler — e a parada de **qualquer um dos dois** já é motivo de trip.
>
> Olhando a tabela acima, **não sobra uma segunda interrupção externa**: D2 é o 1-Wire, D18/D19 são a Serial1 do ESP32, D20/D21 são o I²C. **O D3 é o último livre.**
>
> ✅ **Solução: o segundo tacômetro entra no A8, por interrupção de mudança de pino (PCINT16).** O Mega oferece PCINT nas portas B, J e K — o A8 é o primeiro pino da porta K e está livre. Implementação em [Doc 40 §40.7](../camada_4_programacao/40_firmware_arduino.md).
>
> ⚠️ **PCINT dispara nas duas bordas** (subida e descida), diferente do `attachInterrupt(..., FALLING)`. O tratador precisa comparar com o estado anterior e contar **só as descidas**, senão a leitura sai com o dobro da RPM real.

---

## 32.2 Pinout completo do Arduino Mega 2560

### Comunicação

| UART | TX / RX | Destino | Baud | Observação |
|---|---|---|---|---|
| Serial0 | D1 / D0 | USB (debug no PC) | 115200 | Só para depuração |
| **Serial1** | D18 / D19 | DNLCB30 → ESP32 | 115200 | JSON de telemetria; conversão 5 ↔ 3,3 V automática |
| **Serial2** | D16 / D17 | Tela **ES3C28P** (ESP32-S3) | 115200 | ⚠️ **exige conversor de nível** |

> 🔥 **Esta linha mudou de sentido e é a mais perigosa do documento.** A Nextion **aceitava 5 V direto** — era um dos motivos de tê-la escolhido. A ES3C28P **não aceita**: os pinos `TXD (IO43)` e `RXD (IO44)` são do ESP32-S3 e o máximo absoluto é **3,6 V**.
>
> Os 5 V que aparecem no conector UART da placa são **alimentação**, não nível lógico. Ligar o `D16` do Mega direto no `RXD` degrada o pino — e o pior é que *parece funcionar* no começo, porque os diodos internos de proteção grampeiam a tensão.
>
> **Passe por um conversor de nível de 4 canais** — ligação pino a pino no [Doc 03](../camada_0_fundamentos/03_lista_materiais.md).
| I²C | D20 (SDA) / D21 (SCL) | AM2315C (0x38) + DS3231 (0x68) | 100 kHz | Barramento compartilhado |
| ~~SPI~~ | ~~D50–D53~~ | 🔧 **LIVRES** — o cartão saiu do Mega e foi para o slot da tela. Ver a correção abaixo | — | — |

### Atuadores

| Pino | Destino | Função |
|---|---|---|
| **D4** | BTS #1 `R_EN` | Enable do driver da Peltier |
| **D5** | BTS #1 `RPWM` | **PWM de 20 kHz** (frio) — Timer3 |
| **D6** | BTS #2 `RPWM` | **PWM de 20 kHz** (quente) — Timer4 |
| **D7** | BTS #2 `R_EN` | Enable do driver do PTC |
| **A0** | BTS #1 `R_IS` | Diagnóstico de corrente — **capacitor 100 nF para 0 V** |
| **A1** | BTS #2 `R_IS` | Diagnóstico de corrente — **capacitor 100 nF para 0 V** |
| GND | `LPWM` dos dois | Fixo em nível baixo (carga unidirecional) |
| **D4 / D7** | `L_EN` dos dois, **junto com o `R_EN`** | ⚠️ **NÃO aterrar** — a corrente volta pela metade L. Ver §32.3 |

### Sensores e armazenamento

| Pino | Destino | Detalhe |
|---|---|---|
| **D2** | DS18B20 (1-Wire) — **no dissipador do lado quente**, fora da câmara | Pull-up de **4,7 kΩ** entre DATA e +5 V |

> ### 🔄 Quem mede a câmara agora é o AM2315C
>
> O DS18B20 saiu de dentro da câmara. Quem mede lá dentro é o **AM2315C**, que já estava no barramento I²C e entrega **temperatura e umidade no mesmo sensor** — e a umidade importa: ensaio térmico com condensação não vale.
>
> O DS18B20 foi para o **dissipador do lado quente**, onde ele tem uma função que nenhum outro sensor faz: dizer quando a pós-ventilação pode parar.
>
> | Sensor | Onde | Mede | Serve para |
> |---|---|---|---|
> | **AM2315C** | dentro da câmara | temperatura **e umidade** | o controle do ensaio |
> | **DS18B20** | colado no dissipador | temperatura | saber quando desligar a ventoinha |
>
> ⚠️ **Isso deixa o controle com UM sensor só, e isso é um risco.** Se o AM2315C travar lendo um valor plausível mas errado, o sistema aquece ou resfria sem perceber. O firmware tem que desconfiar dele:
>
> - **Faixa:** leitura fora de −10 a +80 °C é defeito, não medição
> - **Velocidade:** temperatura que muda mais de 5 °C em 1 s é impossível numa câmara — é ruído ou sensor solto
> - **Silêncio:** se o I²C não responder por 3 leituras seguidas, é falha
> - **Coerência:** com a Peltier ligada há 5 minutos e a temperatura sem cair nada, algo está errado — ou o sensor, ou a refrigeração
>
> Qualquer um desses casos deve levar ao estado de FALHA com a potência cortada. Um sensor mentindo é pior que um sensor ausente, porque o sistema age com confiança sobre um dado falso.

> ⭐ **O segundo DS18B20 não custa pino.** O 1-Wire é um barramento: cada sensor tem um endereço de 64 bits gravado de fábrica, então vários convivem no mesmo par de fios. Colando um deles no dissipador do lado quente, o firmware passa a saber quando pode desligar a ventoinha — sem gastar entrada nenhuma do Arduino.
| **D3** | **RPM do cooler externo #1 (INT1)** ⚠️ *corrigido* | `INPUT_PULLUP` + interrupção `FALLING` |
| **A8** | **RPM do cooler externo #2 (PCINT16)** ⭐ *novo — 2ª Peltier* | `INPUT_PULLUP` + interrupção de mudança de pino. As interrupções externas do Mega acabaram: D2 é 1-Wire, D18/19 Serial1, D20/21 I²C |
| D20 / D21 | AM2315C + DS3231 | I²C em 5 V — 2 dispositivos no mesmo par de fios. ⚠️ Eram 4: os dois INA219 saíram com a detecção digital |
| ~~D50–D53~~ | 🔧 **LIVRES** — o log passou para o microSD da ES3C28P | — |

> ### 🔧 Correção — o cartão SD saiu do Arduino
>
> A [lista de materiais](../camada_0_fundamentos/03_lista_materiais.md) já dizia que a **ES3C28P substituiu a Nextion *e* o módulo de cartão SD** — a tela traz um slot microSD ligado ao ESP32-S3 por interface SDMMC dedicada. Este documento não tinha sido atualizado e continuava gastando **quatro pinos do Mega** (`D50`–`D53`) com um módulo que não existe mais.
>
> **Como o log passa a ser gravado:**
>
> ```
>   RTC DS3231 ──I²C──► Mega ──Serial2──► conversor ──► ES3C28P ──► microSD
>    (data/hora)        (monta o registro)   (5→3,3 V)     (grava)
> ```
>
> O carimbo de tempo continua vindo do **DS3231 no Mega** — quem sabe a hora é quem manda o registro, não quem grava. A tela só recebe a linha pronta e escreve.
>
> ⚠️ **Consequência para o protocolo da IHM:** o link serial deixou de ser só "mostrar na tela" e passou a carregar **registro de ensaio**. O [Doc 41](../camada_4_programacao/41_esp32_ihm_iot.md) precisa de um quadro de log com confirmação de gravação — sem o "gravei", o Mega não tem como saber que o ensaio ficou registrado. 📌 Fica junto da reescrita do Doc 41 para LVGL.
>
> 🎁 **Os quatro pinos ficaram livres** (`D50`–`D53`), e são justamente os do SPI por hardware — se um dia entrar um módulo que precise de SPI rápido, o barramento está inteiro e desocupado.

### Comando e sinalização

| Pino | Destino | Modo | Lógica |
|---|---|---|---|
| **D23** | Botão STOP — bloco NA de 5 V | `INPUT_PULLUP` | `LOW` = pressionado |
| **D24** | Emergência — bloco **NF** de 5 V | `INPUT_PULLUP` | `HIGH` = **acionada** |
| **D25** | Presença dos **24 V** no BD-POT (divisor **22 k / 4,7 k** + 100 nF) | `INPUT` (**sem** pull-up) | `HIGH` = **potência disponível** |
| **D27** | ⭐ **`HAB_POTENCIA`** → `IN1` do **KA1** → bobina do **KM1** | `OUTPUT` | `HIGH` = potência **autorizada** · `LOW` = **selo do KM1 cai, 0 V no BD-POT**. Usa o contato **`NO`** — o oposto do KA2, de propósito |
| **D29** | ⭐ `IN3` do **KA3** → **as 5 ventoinhas internas** (2 frias + 2 do duto + PTC) | `OUTPUT` | `HIGH` = ligadas. Chaveia o **positivo**, e usa o **`NO`** — como o KA1, e ao contrário do KA2. Ver [§31.16](31_comando_e_protecoes.md) |
| **D30** | ⭐ `IN2` do **KA2** → **ventoinhas do radiador** | `OUTPUT` | 🔥 **LÓGICA INVERTIDA:** `HIGH` fecha o relé, o contato **`NC`** abre e as ventoinhas **PARAM**. `LOW` ou Hi-Z = elas **GIRAM**. Chaveia o **positivo**, e usa o **`NC`** — ver §31.14 |

> ### 🔧 Simplificação — três pinos devolvidos
>
> | Pino | Era | Por que saiu |
> |---|---|---|
> | **D22** | leitura do botão START | O botão verde **voltou**, mas como comando de **24 V** na cadeia do selo do KM1 — ele não precisa de pino. O firmware descobre que a potência foi armada pelo divisor no `D25` |
> | **D26** | seletora LOCAL / REMOTO | Era a **segunda** camada de uma regra que a primeira já garante: o `START` nunca é aceito por MQTT. Ver [Doc 41 §41.3](../camada_4_programacao/41_esp32_ihm_iot.md) |
> | **D28** | canal próprio da ventoinha do PTC | A ventoinha do PTC e as de circulação passaram a ter **a mesma condição** — ensaio rodando —, então cabem **num comando só** |
>
> **Também saiu o bloco NF de 24 V do STOP.** O S2 ficou com um bloco só (NA, 5 V → `D23`), e com isso sumiu o fio dele até a bobina do KM1 — e sumiu **um dos três erros de montagem catalogados em [§31.5](31_comando_e_protecoes.md)**, o de trocar os blocos e queimar o `D23`.
>
> 🎯 **Sobrou 1 pino de comando para as cinco ventoinhas internas** (o `D29`, hoje no gatilho do KA3) e o Mega tem `D22`, `D26`, `D28` e `D50–D53` livres.
| ~~D31–D34~~ | 🗑️ **livres** — eram os 4 bits de seleção do multiplexador | — | Ver [Doc 13 §13.4](../camada_1_maquete/13_posicoes_de_ensaio.md) |
| ⭐ **D22** | **SC-1 · DOUT** — detecção de dispositivo morto | `INPUT_PULLUP` | 1 bit: nível BAIXO enquanto houver corrente. Fio partido = ALTO = falha |
| ~~A2~~ | 🗑️ **livre** — era a entrada analógica dos 16 canais do mux | — | |

#### 🔥 Correção — as ventoinhas do radiador saíram do MV-1 (e depois o MV-1 saiu inteiro)

Este documento colocava as duas no **canal 1 do MV-1** (`D27`). Estava errado, e o erro tinha duas caras.

**O MV-1 chaveia o NEGATIVO.** É um módulo de MOSFET canal N: o `O1+` é só o 12 V passando, e quem abre e fecha é o `O1−`. Então o fio preto da ventoinha **não é 0 V** — é o dreno do MOSFET.

**E o tacômetro dela é referenciado nesse mesmo preto.** O terceiro fio de uma ventoinha é a saída de um transistor em coletor aberto, cujo emissor está ligado ao negativo da própria ventoinha.

```
        +12 V ───────────────► vermelho
                                          ┌── amarelo (RPM) ──► D3 do Mega
        ventoinha                         │        (INPUT_PULLUP para 5 V)
                                     ────┴────  transistor do tacômetro
        preto ──────────────────────────┬───
                                        │
                              O1− do MV-1 (o MOSFET)
                                        │
                                       0 V
```

| Canal 1 | O que acontece |
|---|---|
| **Ligado** | preto ≈ 0 V, o tacômetro pulsa, o D3 lê certo |
| **Desligado** | preto sobe para perto de **12 V**. 🔥 Os 12 V empurram corrente pelo diodo de proteção do D3 para dentro do trilho de 5 V |

⚠️ **E mesmo antes de estragar alguma coisa, a leitura já mentia:** com o canal desligado o firmware leria "ventoinha parada" — que é exatamente o alarme que deveria salvar a pastilha. O sinal que existe para detectar falha passaria a *inventar* falha.

**Primeira correção adotada: as duas ficaram permanentemente ligadas, direto no BD-AUX.** Resolvia o defeito elétrico, e garantia o que o [Doc 30](30_forca_e_distribuicao.md) já mandava:

- o lado quente precisa continuar sendo resfriado **depois** que tudo desliga, porque o calor que já está no dissipador não some junto com o comando;
- o BD-AUX vem direto do prensa-cabo e não passa pelo KM1, então elas **sobrevivem até à emergência**;
- o preto vai à barra de 0 V, em ponto próprio (`R20`), e aí os dois tacômetros passam a ter uma referência que nunca se mexe.

📌 **E o canal 1 continuou livre.** Chegou a ser projetado um P-MOSFET comandado por ele, para devolver o controle das ventoinhas do radiador chaveando o lado positivo — mas **um contato de relé faz o mesmo sem inversor de nível nenhum**, e o KA2 assumiu o serviço ([Doc 31 §31.14](31_comando_e_protecoes.md)).

📌 **E o módulo acabou saindo do projeto.** Sobrando com 3 dos 4 canais livres, o MV-1 custava R$ 43,51 para prestar UM serviço de liga/desliga — num pino que nem PWM tem. As cinco internas passaram para o **KA3**, um terceiro módulo de relé na mesma caixa DIN do KA1 e do KA2, também no lado **positivo**. Ver [Doc 31 §31.16](31_comando_e_protecoes.md).

> ⭐ **A mesma frase resolve os dois grupos, e agora sem exceção:** *um contato seco não tem lado alto nem lado baixo.* O preto das ventoinhas — das de fora e das de dentro — é 0 V de verdade, ligadas ou paradas. Se um dia uma ventoinha interna virar de 3 fios, o tacômetro dela já tem referência firme para nascer.

#### ⭐ E o `D27` foi reaproveitado: ele virou o veto do firmware sobre a potência

O pino que vagou aqui é o mesmo que resolve o maior buraco do projeto: o firmware não tinha como **cortar** a potência, só como desabilitar os drivers. Hoje ele comanda o **KA1**, um módulo de relé em série com a bobina do KM1 ([Doc 31 §31.13](31_comando_e_protecoes.md)).

```
   TRILHO 3                     TRILHO 2                   TRILHO 1
   ─────────                    ─────────                  ─────────
   MEGA · D27 ──── sinal ─────► IN  ┌───────┐              bobina do KM1
        │                           │  KA1  │  COM ──────► A2
   [ R10 · 10 kΩ ]                  └───────┘  NO  ──────► BD-0V · Z12
        │
       0 V           (jumper do módulo em "H": HIGH fecha o contato)
```

> ⭐ **Por que os módulos ficam no trilho 2, e não junto do KM1.** O circuito da bobina precisa de canaleta de **potência** nas duas pontas ([§31.4](31_comando_e_protecoes.md)) — e o trilho 2 tem a **CH-2x1** logo abaixo, que é justamente a canaleta de potência que serve o trilho 1. **O circuito da bobina nunca sobe até o trilho 3**, onde correm o `IS` analógico e o 1-Wire; só o fio de gatilho faz esse caminho, e ele não conduz corrente nenhuma.
>
> 🔧 **A alternativa descartada** era um MOSFET 2N7000 soldado no próprio KM1 (R$ 1,10). Tecnicamente melhor — não desgasta, não consome —, mas exigia solda e não tinha LED de estado. **E, decisiva para o KA2: um contato seco não tem lado alto nem lado baixo**, o que apagou um problema inteiro de projeto.

| Se o D27… | O KM1 | O BD-POT |
|---|---|---|
| `HIGH` | **autoriza** — a bobina pode energizar quando alguém apertar o botão verde | 24 V, **depois do verde** |
| `LOW` | **cai** | **0 V** |
| Arduino resetado / ausente (pino em alta impedância) | **cai** — o R10 puxa o `IN` a 0 V | **0 V** ✅ fail-safe |

> 🎁 **Se um dia quiser controlar a rotação delas:** o caminho é **ventoinha de 4 fios (PWM)**. Nela o preto é 0 V de verdade, o tacômetro tem referência fixa, e o controle entra por um quarto fio de comando — que aí sim pode sair de um pino PWM do Mega, sem mexer no circuito de potência.

> 🗑️ ~~Cinco pinos para dezesseis canais~~ — a economia do multiplexador deixou de fazer sentido: com a detecção digital cada posição custa **um bit**, e a escala se resolve com expansores de porta ([Doc 13 §13.9](../camada_1_maquete/13_posicoes_de_ensaio.md)). O texto original dizia que a economia não muda quando o número de posições cresce. Quatro placas de multiplexador atendem 64 canais com 8 pinos, porque os S0–S3 são compartilhados entre elas.
>
> 🗑️ **O dimensionamento do shunt saiu daqui.** Ele explicava por que 47 Ω e não 0,1 Ω para ler 17,6 mA no A/D. Com a detecção digital não há shunt nem leitura analógica — o sensor entrega a decisão pronta num pino. A regra continua válida para quem for medir corrente algum dia, e está no histórico do Git.

> ### ⭐ Por que `LOW` = REMOTO, e não o contrário
>
> Com `INPUT_PULLUP`, um pino **sem nada ligado lê `HIGH`**. Então a pergunta é: se o fio da seletora romper, em que modo o sistema deve cair?
>
> | Se o fio romper | Com `HIGH` = REMOTO | **Com `LOW` = REMOTO** |
> |---|---|---|
> | O sistema entende | REMOTO ⚠️ | **LOCAL** ✅ |
> | Quem pode ligar a máquina | qualquer um, pela internet | **só quem está na frente dela** |
>
> **Um fio rompido não pode abrir a máquina para o mundo.** Por isso o contato fecha para o 0 V na posição REMOTO: a falha cai sempre para o lado de quem está presente e enxerga a câmara.
>
> 📌 **Basta UM bloco NA e UM pino.** Aberto = LOCAL, fechado = REMOTO. Não precisa de dois blocos.
| **D9** | Sinaleiro verde — RUN | `OUTPUT` | → **terminal + do sinaleiro H1** (5 V, direto) |
| **D10** | Sinaleiro azul — COOL | `OUTPUT` | → **terminal + do H2** |
| **D11** | Sinaleiro amarelo — HEAT | `OUTPUT` | → **terminal + do H3** |
| **D12** | Sinaleiro vermelho — FAULT | `OUTPUT` | → **terminal + do H4** |

### Mapa visual

```
ARDUINO MEGA 2560
├─ D0/D1   ── USB (debug)
├─ D2      ── DS18B20 (1-Wire) ────────────► câmara
├─ D3      ── RPM do cooler #1 (INT1) ⚠ ───► dissipador da Peltier #1
├─ A8      ── RPM do cooler #2 (PCINT16) ──► dissipador da Peltier #2
├─ D4      ── BTS #1 R_EN
├─ D5      ── BTS #1 RPWM  (frio)
├─ D6      ── BTS #2 RPWM  (quente)
├─ D7      ── BTS #2 R_EN
├─ D9..D12 ─────────────► 4 SINALEIROS 22 mm de 5 V (RUN/COOL/HEAT/FALHA)
├─ D16/D17 ── Serial2 ──[conversor de nível]──► tela ES3C28P
├─ D18/D19 ── Serial1 ────────────────────► DNLCB30 → ESP32
├─ D20/D21 ── I²C ────────────────────────► AM2315C · DS3231
│                                            (o I²C tem 2 dispositivos: RTC e AM2315C)
├─ D22     ── START (NA)
├─ D23     ── STOP (NA)
├─ D24     ── EMERGÊNCIA (NF)
├─ D25     ── divisor 22k/4k7 do BD-POT (24 V presente?)
├─ D26     ── LIVRE
├─ D50..53 ── LIVRES (o cartão foi para a tela)
├─ A0      ── BTS #1 IS  + cap 100 nF
└─ A1      ── BTS #2 IS  + cap 100 nF
```

---

## 32.3 Fiação dos BTS7960

| Cabo | Seção | De → Para |
|---|---|---|
| BTS #1 RPWM | 0,25 mm² | Arduino D5 → BTS #1 `RPWM` |
| BTS #1 R_EN | 0,25 mm² | Arduino D4 → BTS #1 `R_EN` **+ pull-down 10 kΩ → 0 V** |
| BTS #1 LPWM | 0,25 mm² | 0 V → BTS #1 `LPWM` |
| BTS #1 L_EN | 0,25 mm² | ⚠️ **Arduino D4 → BTS #1 `L_EN`** (mesmo nó do `R_EN`) — **corrigido, ver nota** |
| BTS #1 R_IS | 0,25 mm² | BTS #1 `R_IS` → Arduino A0 **+ cap 100 nF → 0 V** |
| BTS #1 VCC | 0,25 mm² | Régua +5V → BTS #1 `VCC` (lógica) |
| BTS #1 GND lógica | 0,25 mm² | Bloco BD-0V → BTS #1 `GND` |
| BTS #2 RPWM | 0,25 mm² | Arduino D6 → BTS #2 `RPWM` |
| BTS #2 R_EN | 0,25 mm² | Arduino D7 → BTS #2 `R_EN` **+ pull-down 10 kΩ → 0 V** |
| BTS #2 LPWM | 0,25 mm² | 0 V → BTS #2 `LPWM` |
| BTS #2 L_EN | 0,25 mm² | ⚠️ **Arduino D7 → BTS #2 `L_EN`** (mesmo nó do `R_EN`) — **corrigido, ver nota** |
| BTS #2 R_IS | 0,25 mm² | BTS #2 `R_IS` → Arduino A1 **+ cap 100 nF → 0 V** |
| BTS #2 VCC | 0,25 mm² | Régua +5V → BTS #2 `VCC` |
| BTS #2 GND lógica | 0,25 mm² | Bloco BD-0V → BTS #2 `GND` |

> ### ⚠️ Correção: `L_EN` vai JUNTO com o `R_EN`, não ao 0 V
>
> A versão anterior mandava aterrar o `L_EN`. **Isso gera ~5 W de calor desnecessário por driver**, e a razão é sutil.
>
> **O módulo IBT-2 é UMA ponte H, não dois canais.** As metades R e L compartilham o mesmo par de saída (`M+` / `M−`):
>
> ```
>              B+ (24 V)
>         ┌──────┴──────┐
>       [R alta]     [L alta]
>         │             │
>        M+ ─── CARGA ── M−        ← só existe UM par de saída
>         │             │
>       [R baixa]   [L baixa]
>         └──────┬──────┘
>              B−
> ```
>
> A corrente percorre: `B+ → R alta → M+ → carga → M− → L baixa → B−`. **Ela precisa atravessar a metade L para voltar.**
>
> Com `L_EN` aterrado, a metade L fica desabilitada e a corrente volta pelo **diodo de corpo** do MOSFET inferior — o diodo parasita que existe dentro de todo MOSFET:
>
> | Caminho de retorno | Queda | Perda a 6,0 A |
> |---|---:|---:|
> | Diodo de corpo (errado) | ~0,9 V | **~5,4 W** 🔥 |
> | MOSFET conduzindo (correto) | ~0,1 V | **~0,6 W** ✅ |
>
> ✅ **Ligação correta para carga unidirecional:**
> - **`R_EN` e `L_EN` juntos**, no mesmo pino do Arduino (D4 no BTS #1, D7 no BTS #2), **com o mesmo resistor de pull-down de 10 kΩ** cobrindo os dois
> - **`RPWM`** recebe o PWM · **`LPWM`** fica em 0 V
>
> Assim a metade L mantém o MOSFET inferior conduzindo, e o retorno passa por silício de baixa resistência em vez de por um diodo.
>
> 📌 **A segurança não muda:** com o pino do Arduino em nível baixo, as **duas** metades ficam desabilitadas e nenhuma corrente circula. O pull-down continua garantindo que pino solto = driver desligado.
>
> 🔍 **Confirme no comissionamento:** com a carga a 100 % de duty por 5 minutos, os dois chips do módulo devem estar em temperatura **parecida**. Se um estiver bem mais quente que o outro, o `L_EN` daquele módulo ainda está aterrado.

> ### ⭐ Por que o BTS7960, se a pastilha nunca inverte — e por que não um MOSFET
>
> 🎯 **A pergunta é justa e a objeção está certa:** a Peltier deste projeto **só resfria**. Quem
> aquece é o PTC. A pastilha nunca troca de sentido, e o desenho acima prova isso — o `LPWM`
> está amarrado em 0 V, dentro do próprio módulo. **A ponte H opera como chave unidirecional.**
>
> Então a justificativa "usamos ponte H para inverter a polaridade e aquecer com a Peltier"
> **não vale para este projeto** e não deve ser dita na defesa. Ela vem da análise inicial, de
> quando o aquecimento ainda seria feito pela própria pastilha. O PTC assumiu esse papel e a
> inversão perdeu a função.
>
> **O BTS7960 continua sendo a escolha certa — mas por outros quatro motivos.**
>
> #### 1 · O pino `IS` é o que alimenta a nossa medição de corrente
>
> Esta é a razão que sozinha decide. O BTS7960 tem uma **saída espelho de corrente**: ele
> devolve, em tensão, quanto está passando pela carga. É dela que saem os fios `S9` e `S10` para
> os pinos `A0` e `A1` do Mega.
>
> Sem essa saída, para medir a corrente da Peltier seria preciso acrescentar **um sensor por
> carga** — mais peça, mais fio, mais um ponto de falha. O driver já entrega isso de fábrica.
>
> #### 2 · Ele aceita o PWM do Arduino direto, sem circuito de gate
>
> A 20 kHz, o gate de um MOSFET de potência precisa ser carregado e descarregado 20 mil vezes
> por segundo. Um pino de Arduino não dá conta disso sozinho: precisaria de um **driver de
> gate** (TC4420, IR2104 ou equivalente) e do circuito em volta. O BTS7960 já traz o driver
> dentro do encapsulamento — o pino do Arduino só manda o sinal.
>
> #### 3 · Ele se protege sozinho
>
> Sobrecorrente, sobretemperatura e subtensão são tratadas **dentro do chip**. Um MOSFET
> discreto não tem nada disso: quem protege é o projetista, com mais componentes.
>
> #### 4 · A conta fecha a favor dele
>
> | Caminho | O que precisaria | Preço |
> |---|---|---:|
> | **BTS7960 (adotado)** | módulo pronto, com bornes, dissipador e `IS` | **R$ 20,96 o par** |
> | MOSFET discreto | 2× IRLZ44N (~R$ 12) + 2 gate drivers (~R$ 20) + 2 sensores de corrente (~R$ 35) + dissipador, placa e solda | **~R$ 67 + solda** |
>
> ⚠️ E a solda é proibida dentro deste painel por decisão de projeto ([Doc 33](33_placa_interface_componentes.md)):
> todo componente mora em borne.
>
> #### O que NÃO serviria, e por quê
>
> | Alternativa | Por que não |
> |---|---|
> | **Relé** | a carga é comandada por **PWM a 20 kHz**. Um contato duraria segundos — é a mesma regra do [§31.16](31_comando_e_protecoes.md): contato para liga/desliga, semicondutor para modular |
> | **SSR de corrente contínua** | serve para liga/desliga, não para modular com resolução; e custa mais que o BTS para 6 A |
> | **Driver dedicado de TEC** (LT8722, MAX1968) | é o ideal técnico — fonte de corrente de verdade, sem ripple. Mas é componente SMD, caro e sem módulo pronto no mercado nacional |
> | **Meio-ponte genérica** (módulo IRF3205) | resolveria o chaveamento, mas **não tem a saída `IS`** — perderíamos a detecção de corrente |
>
> #### 📌 O que se paga por usar uma ponte H como chave unidirecional
>
> Metade do módulo fica ociosa. É um desperdício **declarado**, e ele custa R$ 10 — menos que
> qualquer alternativa que entregue `IS` e driver de gate juntos.
>
> 🎁 **E sobra uma reserva de projeto:** o hardware já suporta inverter a pastilha. Se um dia o
> PTC sair do projeto, basta ligar o `LPWM` a um pino de PWM do Mega e programar o dead-time —
> nenhuma peça precisa ser trocada.
>
> ⚠️ **Se fizer isso, três cuidados obrigatórios:** dead-time entre os sentidos (para não haver
> curto de braço), rampa de partida, e respeitar que inverter uma pastilha submete as juntas de
> solda interna à fadiga térmica — que é o principal modo de falha de um TEC.
>
> 🎓 **A frase para a banca:** *"o BTS7960 não está ali para inverter a pastilha — ela nunca
> inverte neste projeto. Ele está ali porque entrega, num módulo de dez reais, três coisas que
> eu teria de montar separadas: o driver de gate para o PWM de 20 kHz, as proteções e a saída de
> corrente que alimenta o meu diagnóstico."*

> **Alternativa igualmente válida:** ligar a carga entre `M+` e `B−`, deixando o `M−` sem uso. Aí só a metade R participa, o `L_EN` pode ficar aterrado e a corrente atravessa um único MOSFET. Funciona e dissipa um pouco menos — mas foge da ligação padrão do módulo, cujos bornes são rotulados como par `M+`/`M−`.

> ### ❓ "Quem faz o PWM é o BTS? Só ele consegue?"
>
> **Não. Quem faz o PWM é o Arduino.** O trem de pulsos nasce num *timer* do ATmega2560 e sai
> pelo pino `D5` ou `D6`. O BTS7960 **obedece**: ele copia aquele sinal de 5 V para os 24 V da
> carga, com corrente que o pino do Arduino jamais entregaria.
>
> Modular por PWM **qualquer chave semicondutora faz** — um MOSFET solto, um IGBT, um driver
> qualquer. Não é privilégio do BTS. O que o BTS acrescenta é o **pacote**: o driver de gate que
> o pino sozinho não tem, as proteções e o `IS`.
>
> 🎓 **Na defesa, esta distinção conta ponto:** *"o PWM é gerado no timer do microcontrolador; o
> driver é só o músculo que repete aquele sinal na tensão e na corrente da carga."*
>
> ---
>
> ### ❓ "O módulo tem duas metades. Por que não UM só, com a Peltier no `RPWM` e o PTC no `LPWM`?"
>
> 🎯 **A ideia é boa e funciona eletricamente.** Vale explicar por que, mesmo assim, ficaram dois.
>
> Primeiro, o que ela exigiria — porque `RPWM` e `LPWM` **não são saídas de potência**, são
> entradas de comando. A potência sai só por `M+` e `M−`. Então a montagem seria:
>
> ```
>    B+ (24 V) ──┬─[metade R]─ M+ ──── PELTIER ──┐
>                │                               │
>                └─[metade L]─ M− ──── PTC ──────┤
>                                                │
>    B− (0 V) ───────────────────────────────────┘
> ```
>
> Cada metade viraria uma **chave de lado alto** para a sua carga, com o retorno indo direto ao
> `B−`. É a mesma "alternativa igualmente válida" que já está registrada acima — aplicada duas
> vezes, uma por metade. E funcionaria de verdade:
>
> | O que a proposta precisa | Existe? |
> |---|---|
> | Comando independente por metade | ✅ `R_PWM`/`R_EN` e `L_PWM`/`L_EN` são separados |
> | Medição de corrente separada | ✅ o módulo tem **`R_IS` e `L_IS`** — hoje o `L_IS` está sem uso |
> | Caminho de retorno ao desligar | ✅ o diodo de corpo do MOSFET inferior do mesmo braço |
> | Corrente somada nos bornes `B+`/`B−` | ✅ **nunca soma** — Peltier e PTC são intertravados e jamais ligam juntos |
> | Economia | R$ 10,48 (um módulo a menos) |
>
> #### Então por que dois?
>
> **Porque o módulo passaria a ser um ponto único de falha para as duas cargas térmicas.**
>
> Um borne solto no `B+`, um fio de 5 V caído, um chip queimado — e o ensaio perde **aquecimento
> e resfriamento ao mesmo tempo**. Com dois módulos, cada falha derruba **uma** carga, e o
> firmware ainda consegue distinguir qual: o diagnóstico continua funcionando porque a outra
> metade do sistema está viva para contar a história.
>
> ⚠️ **Isso pesa mais neste projeto do que pesaria em outro.** O propósito da máquina é
> justamente **não perder ensaio**: um sistema que existe para detectar falha não pode ter um
> componente cuja falha apaga as duas saídas de uma vez.
>
> | | Um módulo (proposto) | **Dois módulos (adotado)** |
> |---|---|---|
> | Custo | R$ 10,48 | R$ 20,96 |
> | Falha do módulo | perde **aquecer e resfriar** | perde **uma** função; a outra continua |
> | Ligação | carga entre `M+` e `B−` — **foge do padrão** do módulo, que é rotulado como par `M+`/`M−` | ligação padrão, igual à do manual |
> | Manutenção | quem for trocar precisa entender a topologia não convencional | troca direta, sem estudo |
> | `IS` | `R_IS` e `L_IS`, um por carga | um `IS` por módulo, por carga |
>
> 📌 **Dez reais é o preço de não ter as duas cargas dependendo da mesma peça.** É a mesma
> lógica que separou os três módulos de relé em vez de um de 4 canais ([§31.17](31_comando_e_protecoes.md)):
> quando a peça é barata, redundância física sai mais em conta que economia.
>
> 🎓 **A resposta curta para a banca:** *"cabe num módulo só, sim — cada metade viraria uma
> chave de lado alto, e o módulo até tem uma saída de corrente por metade. Mas aí uma peça
> queimada tira o aquecimento e o resfriamento juntos. Como o sistema existe para não perder
> ensaio, preferi pagar dez reais e separar."*

> ### ❓ "Como o projeto detecta que o BTS7960 falhou?"
>
> 🎯 **Por quatro caminhos independentes, e cada um pega um modo de falha diferente.**
> Vale conhecer os quatro, porque a banca pode perguntar *qual deles* pega *qual* falha.
>
> #### 1 · O `IS` — a corrente contra o comando (pega **carga aberta** e **curto na carga**)
>
> O pino `IS` devolve, em tensão, a corrente que está passando. O firmware compara com o duty
> que ele próprio mandou ([Doc 40 · `verificarCarga()`](../camada_4_programacao/40_firmware_arduino.md)):
>
> | O que o firmware vê | O que isso significa | Ação |
> |---|---|---|
> | Duty > 50 % e corrente ≈ 0 A | driver morto, fusível `F1` aberto, borne solto, série das Peltier interrompida | trip `CARGA_ABERTA` |
> | Corrente > 8 A | curto no atuador ou no cabo | trip `SOBRECORRENTE` |
> | Corrente 30 % abaixo do esperado | Peltier degradada, mau contato | alerta, sem trip |
>
> #### 2 · O `D25` — a conferência de que a potência **caiu mesmo** (pega **contato colado**)
>
> Quando o firmware manda cortar, ele **não acredita em si mesmo**: 150 ms depois lê o divisor
> `D25` no `BD-POT` e pergunta se os 24 V realmente sumiram. Se ainda estão lá, sobe
> `CORTE_FALHOU` e acende o `LED_FAULT`. É isso que pega o contato do `KA1` soldado, o contato
> do `KM1` soldado e o borne solto na malha da bobina — três falhas que, sem esta conferência,
> apagariam o veto **em silêncio**.
>
> #### 3 · O `KA1` em série com a bobina do `KM1` — o corte que **não depende do BTS**
>
> Este é o que responde à falha mais feia: **MOSFET do BTS colado em curto.** Baixar o `R_EN`
> não adianta nada num MOSFET em curto — a Peltier continua a 100 %. Por isso o corte real não
> passa pelo driver: o `KA1` abre, a bobina do `KM1` perde o retorno, e o **contato de potência
> do `KM1`** tira os 24 V do barramento inteiro. O BTS pode estar destruído; a carga desliga
> assim mesmo.
>
> #### 4 · O watchdog de RPM — o que **dispara** o corte antes do estrago
>
> A ventoinha do lado quente parada queima a pastilha em menos de um minuto. O tacômetro é lido
> continuamente e a queda de RPM dispara o trip — que então executa os itens 3 e 2, nessa ordem.
>
> 📌 **A ordem importa:** o firmware **primeiro** baixa os `R_EN` (a corrente cai a quase zero),
> **depois** abre o `KM1`. Abrir o contato sob 6 A queimaria o contato em poucas manobras.
>
> ---
>
> #### ⚠️ O buraco que sobra — e vale dizer na defesa antes que perguntem
>
> **Um MOSFET colado em curto só é descoberto depois que alguma outra coisa dispara o corte.**
> O motivo está numa linha do `lerCorrente()`: se o pino de PWM está em nível baixo, a função
> devolve `−1` — *"não medido agora"* — e o `verificarCarga()` sai sem conferir nada.
>
> Ou seja: o firmware confere corrente **quando mandou ligar**, nunca **quando mandou desligar**.
> Um MOSFET em curto com o comando em zero deixa a Peltier a 100 % e **nenhum dos quatro
> caminhos acima acusa** — até a temperatura fugir para baixo, ou o RPM cair, ou o operador
> perceber.
>
> 🔧 **Fecha com quatro linhas**, e o `IS` já está ligado no `A0`/`A1` para isso:
>
> ```cpp
> // Corrente com o comando DESLIGADO = MOSFET colado em curto.
> // Le o IS ignorando o estado do PWM — este e o unico teste que
> // enxerga a falha ANTES de ela virar temperatura errada.
> if (duty < 5.0 && lerCorrenteSempre(BTS1_IS) > 0.5) dispararTrip("DRIVER_COLADO");
> ```
>
> 🎓 **A frase para a banca:** *"a corrente do `IS` diz se a carga responde ao comando; o `D25`
> diz se o corte aconteceu de verdade; e o `KA1` corta por fora do driver, porque um MOSFET em
> curto não obedece mais a nenhum sinal. O que o sistema tem é **detecção** de falha, não
> tolerância — tolerar exigiria um segundo canal de corte, que esta máquina não precisa ter."*

### O filtro do pino IS

```
   BTS7960 R_IS ──────────────┬──────────►  borne A0  do adaptador do Mega
                              │
                            ──┴──  C1 · 100 nF cerâmico
                              │
                              └──────────►  borne GND2 — o VIZINHO, ~3,9 mm ao lado

   ⚠️ O capacitor vai JUNTO AO ARDUINO, não junto ao BTS.
   ⭐ E o retorno dele é o GND2 do próprio Arduino — não um fio até a barra.
```

**Por quê (onde o ruído entra):** o objetivo é filtrar o ruído captado **ao longo do cabo**, não só o gerado no driver. Colocando o capacitor na ponta do Arduino, ele forma um filtro passa-baixas com a resistência do próprio cabo e entrega uma tensão limpa ao conversor A/D.

**Por quê (onde ele se refere):** um filtro de entrada analógica tem de referenciar **o mesmo terra que o conversor usa para medir**. O `C1` chegou a ficar num bloco de bornes no trilho, com o retorno indo por ~30 cm de fio até o BD-0V — e fio, em alta frequência, é indutor: parte do ruído desviado voltava pela malha que sobrava. Nos bornes do adaptador, entre o capacitor e o A/D não há fio nenhum ([Doc 33 §33.10](33_placa_interface_componentes.md)).

---

## 32.4 Cabos painel → câmara

São **13 condutores**. Separe fisicamente em 2 grupos dentro da eletrocalha aérea.

### Grupo A — Potência (lado esquerdo da eletrocalha)

| Fio | Seção | Cor | De → Para |
|---|---|---|---|
| BTS #1 M+ | 1,5 mm² | Vermelho | BTS #1 saída → borne **`24V-FRIO`** (2× Peltier em série) |
| BTS #1 M− | 1,5 mm² | Preto | BTS #1 saída → borne `0V-FRIO` |
| BTS #2 M+ | 1,5 mm² | Laranja | BTS #2 saída → borne **`24V-QUENTE`** (PTC de 24 V) |
| BTS #2 M− | 1,5 mm² | Preto | BTS #2 saída → borne `0V-QUENTE` |
| Cooler externo **#1** + | 0,5 mm² | Vermelho | Régua 12V-AUX → cooler #1 + |
| Cooler externo **#1** − | 0,5 mm² | Preto | Bloco BD-0V → cooler #1 − |
| Cooler externo **#2** + | 0,5 mm² | Vermelho | Régua 12V-AUX → cooler #2 + |
| Cooler externo **#2** − | 0,5 mm² | Preto | Bloco BD-0V → cooler #2 − |
| **Fans internas** + | 0,5 mm² | Amarelo | Régua **12V-AUX** → borne `12V-FANS` ⚠️ **as fans são de 12 V, não de 24 V** |
| **Fans internas** − | 0,5 mm² | Preto | Bloco BD-0V → borne `0V-FANS` |

### Grupo B — Sinais (lado direito, com blindagem)

| Fio | Seção | Cor | De → Para |
|---|---|---|---|
| Cooler externo #1 RPM | 0,25 mm² | Amarelo | Tacômetro do cooler #1 → **Arduino D3** |
| Cooler externo #2 RPM | 0,25 mm² | Amarelo | Tacômetro do cooler #2 → **Arduino A8** |
| 1-Wire VCC | 0,25 mm² | Vermelho | Régua +5V → DS18B20 VCC |
| 1-Wire DATA | 0,25 mm² | Amarelo | Arduino D2 → DS18B20 DATA **+ pull-up 4,7 kΩ → +5 V** |
| 1-Wire GND | 0,25 mm² | Preto | Bloco BD-0V → DS18B20 GND |
| I²C VCC | 0,25 mm² | Vermelho | Régua **+5V** → AM2315C VCC |
| I²C SDA | 0,25 mm² | Azul | Arduino D20 → AM2315C SDA |
| I²C SCL | 0,25 mm² | Verde | Arduino D21 → AM2315C SCL |
| I²C GND | 0,25 mm² | Preto | Bloco BD-0V → AM2315C GND |
| **Blindagem** | malha | — | Bloco BD-0V — **só no lado do painel** |

> 🔧 **Nota de engenharia — I²C em 5 V, não 3,3 V:** o barramento I²C do Mega opera em 5 V. Tanto o AM2315C quanto o DS3231 são tolerantes a 5 V e já trazem resistores de pull-up embarcados. Alimentar em 5 V mantém os níveis lógicos coerentes com o mestre e evita o comportamento errático típico de misturar 3,3 V e 5 V no mesmo barramento.

### ⚠️ Passagem pela parede da câmara

Cada furo na parede isolada é um **ponto de infiltração de vapor e uma ponte térmica**:

1. Passe todos os fios de sinal por **um único prensa-cabo** (não faça um furo por fio).
2. Preencha o interior do prensa-cabo com **espuma PU** ou massa de vedação.
3. Aplique **silicone neutro** por fora e por dentro.
4. Cubra a região com **manta elastomérica** de 6 mm pelo lado externo.

---

## 32.5 Monitoramento de RPM — a proteção mais crítica

Se o cooler do lado quente da Peltier parar com a pastilha energizada, o calor bombeado não tem para onde ir. A junção interna passa dos 150 °C e a pastilha **se descola/queima em menos de 1 minuto**.

### Ligação

```
   Cooler de 3 fios (padrão de CPU):
     Vermelho  ──► 12 V auxiliar (régua 12V-AUX)
     Preto     ──► 0 V (borne central)
     Amarelo   ──► Arduino D3 (cooler #1, INT1) e A8 (cooler #2, PCINT16)
```

> O fio de tacômetro é uma saída **coletor aberto**: ele apenas puxa para 0 V. O `INPUT_PULLUP` interno do Arduino faz o papel do resistor de subida. Se a leitura ficar instável, adicione um pull-up externo de 10 kΩ para +5 V.

### Conversão

```
Fans padrão geram 2 pulsos por rotação:

    RPM = (pulsos_contados_em_1_segundo × 60) / 2
```

| Situação | RPM típica | Ação |
|---|---|---|
| Fan de CPU normal | 1200 – 2500 | Operação liberada |
| Fan travada/obstruída | 0 | ⛔ **Trip: `R_EN` dos dois drivers em nível baixo** |
| Fan em fim de vida | < 600 | ⚠️ Alerta na IHM e no MQTT |

> A implementação está no [Doc 40 §40.6](../camada_4_programacao/40_firmware_arduino.md).

---

## 32.6 Boas práticas de cabeamento de sinal

| Prática | Motivo |
|---|---|
| UART e I²C com **cabos < 200 mm** dentro do painel | Acima disso a capacitância do cabo degrada o sinal e a imunidade a ruído |
| Sinal e seu retorno **entrançados** (par trançado) | A área da espira cai quase a zero → não capta campo magnético |
| Grupos A e B em **canaletas opostas** | Separação física entre a fonte de ruído e o receptor |
| Cruzamentos sempre a **90°** | Minimiza o acoplamento |
| Capacitores de 100 nF **junto ao Arduino** | Filtram o ruído do cabo inteiro |
| Blindagem aterrada em **uma ponta só** | Evita laço de terra |
| Retorno de sinal separado do retorno de potência até o **BD-0V** | Impede que os pulsos dos BTS apareçam como ruído nas medições |
| Deixar **50 mm de folga** em cada terminação | Permite refazer um terminal sem trocar o cabo |

---

## 32.7 Ensaios de sinal

| # | Ensaio | Como fazer | Resultado esperado |
|---:|---|---|---|
| 1 | Continuidade de cada sinal | Multímetro em beep, ponta a ponta | Beep em todos os 13 fios |
| 2 | Ausência de curto entre sinais adjacentes | Multímetro entre cada par | Circuito aberto |
| 3 | Pull-up do 1-Wire | Medir D2 → +5 V com o Arduino desligado | ~4,7 kΩ |
| 4 | Varredura I²C | Sketch `i2c_scanner` | Encontrar **0x38** e **0x68** |
| 5 | DS18B20 | Ler a temperatura | Valor coerente com o ambiente (±1 °C) |
| 6 | RPM | Sketch de contagem no D3 **e no A8** | 1200–2500 RPM em **cada** fan girando |
| 7 | **Imunidade a ruído** | Ler a temperatura com os BTS em 100 % de duty | A leitura **não pode** oscilar mais de ±0,3 °C |
| 8 | IS dos BTS | Ler A0/A1 com carga conhecida | Valor estável, proporcional à corrente |
| 9 | Serial1 | Enviar texto do Arduino, ler no ESP32 | Texto íntegro |
| 10 | Serial2 | Enviar comando para a tela | A tela responde |

> ⚠️ **O ensaio 7 é o mais importante.** Se a leitura de temperatura oscilar quando os BTS estiverem chaveando, o problema é de aterramento ou de separação de cabos — **não adianta tentar resolver por software com médias móveis.** Volte e verifique: star ground, separação de canaletas, capacitores nos IS e blindagem aterrada em uma ponta só.

---

## 32.8 ✅ Checklist de aceitação

- [ ] **RPM do cooler #1 no D3 (INT1)**, não no D13
- [ ] **RPM do cooler #2 no A8 (PCINT16)** — com 2 Peltier, são 2 tacômetros a monitorar
- [ ] Serial1 (D18/D19) → DNLCB30 · Serial2 (D16/D17) → tela ES3C28P, cabos < 200 mm
- [ ] BTS #1: D5 / D4 / A0 · BTS #2: D6 / D7 / A1 · **`LPWM` em 0 V** nos dois
- [ ] ⚠️ **`L_EN` ligado JUNTO com o `R_EN`** nos dois módulos — **não** ao 0 V. Teste: 5 min a 100 % de duty, os 2 chips do módulo em temperatura parecida
- [ ] Capacitores de 100 nF em A0 e A1, **junto ao Arduino**
- [ ] DS18B20 no D2 com pull-up de 4,7 kΩ para +5 V
- [ ] AM2315C e DS3231 no I²C em **5 V**
- [ ] ⭐ **Scanner I²C encontra 2 dispositivos**: o RTC (0x68) e o AM2315C (0x5C). Eram 4 — os dois INA219 saíram com a detecção digital. Antes o scanner achava **6 dispositivos** ([Doc 13](../camada_1_maquete/13_posicoes_de_ensaio.md))
- [ ] START D22 (NA), STOP D23 (NA), EMERG D24 (**NF**)
- [ ] Divisor **22 kΩ / 4,7 kΩ** do BD-POT para o pino D25 (medir **~4,2 V** com potência presente)
- [ ] **Pull-down de 10 kΩ em cada `R_EN`** dos BTS7960 — com o Arduino desligado, medir ~0 V
- [ ] **D9–D12 direto no terminal + de cada sinaleiro** — ⚠️ **sem CI, sem relé e sem resistor externo**: o sinaleiro de 5 V já traz o resistor dentro. Meça a corrente antes (passo A-02): acima de 20 mA ele não pode ir direto no pino
- [ ] Sinaleiros de 24 V com o **positivo no BD-24V permanente** e o negativo nas saídas OUT1–OUT4
- [ ] **Teste da emergência: o sinaleiro vermelho continua aceso** com o cogumelo acionado
- [ ] Grupos A e B em canaletas opostas
- [ ] Blindagem aterrada **só no painel**
- [ ] Passagem na parede da câmara vedada com PU + silicone + manta
- [ ] **10 ensaios da §32.7 aprovados**, especialmente o de imunidade a ruído
- [ ] ⭐ **Todos os componentes discretos montados na placa PI-1 ou no próprio BTS** — nenhum solto no chicote. Ver [Doc 33](33_placa_interface_componentes.md)

---

> 📌 **Onde cada componente discreto fica fisicamente, perna por perna, e por que ele existe:** [Doc 33 — Placa de Interface e Componentes Discretos](33_placa_interface_componentes.md). Este documento define **o que liga em quê**; o Doc 33 define **como isso é montado sem ficar pendurado no fio**.

---

📄 **Anterior:** [Doc 31 — Comando e Proteções](31_comando_e_protecoes.md) · **Próximo:** [Doc 33 — Placa de Interface](33_placa_interface_componentes.md)
