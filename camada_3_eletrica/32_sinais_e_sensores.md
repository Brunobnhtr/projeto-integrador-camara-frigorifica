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
| SPI | D50–D53 | Módulo Micro SD | — | D53 = CS |

### Atuadores

| Pino | Destino | Função |
|---|---|---|
| **D4** | BTS #1 `R_EN` | Enable do driver da Peltier |
| **D5** | BTS #1 `RPWM` | PWM lento de 1 Hz (frio) |
| **D6** | BTS #2 `RPWM` | PWM lento de 1 Hz (quente) |
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
| D20 / D21 | AM2315C + DS3231 + **2× INA219** | I²C em 5 V — 4 dispositivos no mesmo par de fios |
| D50–D53 | Módulo Micro SD | SPI por hardware |

### Comando e sinalização

| Pino | Destino | Modo | Lógica |
|---|---|---|---|
| **D22** | Botão START — bloco NA de 5 V | `INPUT_PULLUP` | `LOW` = pressionado |
| **D23** | Botão STOP — bloco NA de 5 V | `INPUT_PULLUP` | `LOW` = pressionado |
| **D24** | Emergência — bloco **NF** de 5 V | `INPUT_PULLUP` | `HIGH` = **acionada** |
| **D25** | Presença dos **24 V** no BD-POT (divisor **22 k / 4,7 k** + 100 nF) | `INPUT` (**sem** pull-up) | `HIGH` = **potência disponível** |
| **D26** | ⭐ **Seletora LOCAL / REMOTO (SA1)** — bloco NA de 5 V na porta | `INPUT_PULLUP` | `LOW` = **REMOTO** · `HIGH` = LOCAL |
| **D27** | ⭐ MV-1 canal 1 → **2 ventoinhas do RADIADOR** | `OUTPUT` | `HIGH` = ligadas |
| **D28** | ⭐ MV-1 canal 2 → **ventoinha do PTC** | `OUTPUT` | `HIGH` = ligada |
| **D29** | ⭐ MV-1 canal 3 → **circulação** (2 frias + 2 do duto) | `OUTPUT` | `HIGH` = ligadas |

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
| **D9** | Sinaleiro verde — RUN | `OUTPUT` | → **IN1 do ULN2803** (placa PI-1) |
| **D10** | Sinaleiro azul — COOL | `OUTPUT` | → **IN2 do ULN2803** |
| **D11** | Sinaleiro amarelo — HEAT | `OUTPUT` | → **IN3 do ULN2803** |
| **D12** | Sinaleiro vermelho — FAULT | `OUTPUT` | → **IN4 do ULN2803** |

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
├─ D9..D12 ── ULN2803 ─► 4 SINALEIROS 22 mm de 24 V (RUN/COOL/HEAT/FAULT)
├─ D16/D17 ── Serial2 ──[conversor de nível]──► tela ES3C28P
├─ D18/D19 ── Serial1 ────────────────────► DNLCB30 → ESP32
├─ D20/D21 ── I²C ────────────────────────► AM2315C · DS3231
│                                            └─► 2× INA219 (posições de ensaio)
├─ D22     ── START (NA)
├─ D23     ── STOP (NA)
├─ D24     ── EMERGÊNCIA (NF)
├─ D25     ── divisor 22k/4k7 do BD-POT (24 V presente?)
├─ D26     ── LIVRE
├─ D50..53 ── SPI ────────────────────────► cartão SD
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

> **Alternativa igualmente válida:** ligar a carga entre `M+` e `B−`, deixando o `M−` sem uso. Aí só a metade R participa, o `L_EN` pode ficar aterrado e a corrente atravessa um único MOSFET. Funciona e dissipa um pouco menos — mas foge da ligação padrão do módulo, cujos bornes são rotulados como par `M+`/`M−`.

### O filtro do pino IS

```
   BTS7960 R_IS ──────────────┬──────────► Arduino A0
                              │
                            ──┴──  100 nF cerâmico
                              │
                            ──┴──  0 V

   ⚠️ O capacitor vai JUNTO AO ARDUINO, não junto ao BTS.
```

**Por quê:** o objetivo é filtrar o ruído captado **ao longo do cabo**, não só o gerado no driver. Colocando o capacitor na ponta do Arduino, ele forma um filtro passa-baixas com a resistência do próprio cabo e entrega uma tensão limpa ao conversor A/D.

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
- [ ] ⭐ **2× INA219 no mesmo barramento I²C**, endereços 0x40/0x41/0x44/0x45 — scanner deve achar **6 dispositivos** ([Doc 13](13_posicoes_de_ensaio.md))
- [ ] SD nos pinos D50–D53
- [ ] START D22 (NA), STOP D23 (NA), EMERG D24 (**NF**)
- [ ] Divisor **22 kΩ / 4,7 kΩ** do BD-POT para o pino D25 (medir **~4,2 V** com potência presente)
- [ ] **Pull-down de 10 kΩ em cada `R_EN`** dos BTS7960 — com o Arduino desligado, medir ~0 V
- [ ] **D9–D12 nas entradas IN1–IN4 do ULN2803** da placa PI-1 — ⚠️ **sem resistor externo**, o CI já tem 2,7 kΩ interno em cada entrada
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
