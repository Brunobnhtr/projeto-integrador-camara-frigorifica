# CAMADA 4 · Doc 41 — ESP32, IHM e IoT

> ⭐ **É o documento que responde ao título do edital.** "Implementação de Sistema de Controle Inteligente com ESP32" é literalmente o que se constrói aqui: a IHM local, o **ESP32 como supervisor e comando remoto**, e o dashboard.
>
> ✅ **Pré-requisito:** [Doc 40](40_firmware_arduino.md) — firmware do Arduino funcionando em malha fechada.

---

## 🔄 DECISÃO DE ARQUITETURA — o projeto passou a ter TRÊS processadores

> ⚠️ **Este documento ainda descreve a IHM em Nextion na maior parte do texto.** A decisão abaixo foi tomada e vale; a reescrita das seções de firmware da tela acontece quando o modelo do módulo estiver definido. **Onde houver conflito, vale esta seção.**

A tela **Nextion saiu** e no lugar entrou um **módulo ESP32-S3 com display embutido**, que acumula IHM, cartão SD e — no futuro — assistente de voz.

| | Processador | Função | Fica em |
|---|---|---|---|
| 1 | **Arduino Mega** | Controle em tempo real: PWM, sensores, intertravamento | trilho 3 |
| 2 | **ESP32 + DNLCB30** | IoT: Wi-Fi, MQTT, comando remoto | trilho 3 |
| 3 | ⭐ **ESP32-S3 com tela** | **IHM: mostrar, configurar, iniciar** + gravar o log no SD | **porta** |

### Por que três, e não dois

Poderia parecer desperdício — o ESP32 de IoT já existe, por que não pôr a tela nele? Três motivos:

1. **Uma tela gráfica consome muito tempo de processador.** Redesenhar em LVGL trava a tarefa por dezenas de milissegundos. Se o mesmo chip cuidasse do MQTT, uma troca de tela poderia atrasar a publicação de um evento — inclusive o de emergência.
2. **Separar por responsabilidade é o padrão industrial.** IHM e supervisão são funções distintas, e um defeito numa não deve derrubar a outra. Se a tela travar, o ensaio continua e o MQTT segue publicando.
3. **Sobra caminho para a IA da Xiaozhi.** O plano é rodar o assistente de voz no S3, aproveitando que ele tem PSRAM e não carrega o MQTT nem o controle.

### O que some da lista

| Sai | Por quê |
|---|---|
| Tela Nextion 3.2" | O S3 desenha a própria tela |
| Módulo Micro SD avulso | O S3 já tem slot, ligado ao SPI dele |

**O DNLCB30 e o ESP32 de IoT continuam** exatamente onde estão. Esta mudança não os toca.

### As duas seriais do Arduino

O Mega tem 4 UARTs de hardware, então cada conversa fica na sua:

```
   Arduino Mega ──Serial1──► ESP32 (DNLCB30)  ·  Wi-Fi, MQTT
                └─Serial2──► ESP32-S3 + tela  ·  IHM e log no SD
```

⚠️ **A Serial2 precisa de um divisor resistivo** no sentido `Mega TX → S3 RX`: o Mega fala em 5 V e o S3 só aceita 3,3 V. Dois resistores (10 kΩ + 20 kΩ). O sentido contrário vai direto, porque 3,3 V já é nível alto para o Mega.

### O que ainda falta definir

- [ ] **Modelo exato do módulo** — os 5 requisitos estão no [Doc 03](../camada_0_fundamentos/03_lista_materiais.md)
- [ ] Numeração dos GPIOs livres para a Serial2
- [ ] Reescrever as seções de firmware da tela deste documento (hoje em linguagem Nextion, passarão a LVGL)
- [ ] Decidir se a Xiaozhi entra — muda a furação da porta (microfone e alto-falante)

---

## 🟢 Em palavras simples — como o ESP32 entra sem derrubar o que já funciona

O edital descreve o problema da empresa em uma frase:

> *"O processo atual realiza ensaios térmicos... **mas carece de monitoramento em tempo real e registro de dados**."*

Ou seja: **a máquina funciona, mas trabalha no escuro.** Ninguém sabe o que está acontecendo lá dentro sem ir até ela, e nada fica registrado.

E há uma restrição que decide toda a arquitetura:

> *"Manter a continuidade operacional do sistema atual durante o desenvolvimento."*

Traduzindo: **a empresa não pode parar os ensaios enquanto o projeto acontece.** Não dá para arrancar o Arduino que já controla a cabine e substituí-lo. Então o ESP32 **entra ao lado**, acrescentando o que faltava.

### A analogia do carro de autoescola

Um carro de autoescola tem **dois volantes**: o do aluno e o do instrutor. Funciona porque existe uma regra combinada de quem manda em cada momento — sem essa regra, os dois puxando para lados diferentes causam acidente.

O nosso sistema é igual:

| | **Arduino** (o volante do aluno) | **ESP32** (o volante do instrutor) |
|---|---|---|
| Onde está | No painel, colado na máquina | Na rede Wi-Fi, em qualquer lugar |
| O que faz sempre | Controla a temperatura, executa as proteções | Observa tudo e publica |
| O que pode comandar | **tudo** — é ele quem executa | ⭐ **só o que leva ao estado seguro** |

⭐ **Não há chave seletora, e é de propósito.** Quem arbitra é a natureza do comando, não uma posição de contato.

### As três regras que nunca mudam

1. **A EMERGÊNCIA não passa por software.** Corta em hardware, trava, e nenhum comando pela internet a desfaz.
2. **O controle crítico fica sempre no Arduino.** PID, intertravamento e proteção de RPM não podem depender de uma rede Wi-Fi que pode cair no meio do ensaio.
3. **O ESP32 nunca aciona atuador diretamente.** Ele *pede*; o Arduino valida e decide. Pedido absurdo — setpoint fora de faixa, START sem potência armada — é recusado, e o motivo volta pelo MQTT.

> 🎓 **Frase para a defesa:** *"A restrição de continuidade operacional nos impediu de substituir o controlador. Implementamos o ESP32 em paralelo, e a arbitragem entre local e remoto é feita pela **classe do comando**: o que leva ao estado seguro pode vir de qualquer lugar, o que leva ao estado energizado só da IHM, na frente da máquina."*

### O que é MQTT, e por que não é "só mandar pela internet"

MQTT é um jeito de trocar mensagens pensado para equipamentos, não para sites. Ele funciona como um **mural de avisos**:

- Quem tem informação **publica** num assunto (chamado *tópico*)
- Quem quer saber **assina** aquele assunto
- Ninguém precisa saber quem é o outro, nem estar ligado ao mesmo tempo

```
   ESP32 ──publica──►  camara/telemetria  ──►  dashboard
                                           ──►  celular
   dashboard ──publica──►  camara/comando  ──►  ESP32 ──► Arduino
```

**Por que não HTTP:** uma mensagem MQTT tem poucos bytes e a conexão fica aberta. Fazer uma requisição HTTP a cada segundo gastaria muito mais rede e bateria, e é o motivo de a indústria ter adotado MQTT para telemetria.

### Por que o log fica no cartão SD, e não só na nuvem

Porque **Wi-Fi cai**. Se o registro dependesse só da rede, uma queda de 10 minutos abriria um buraco no histórico — justamente do tipo que atrapalha quando você está investigando uma falha.

O SD grava sempre, localmente. A nuvem é conveniência; o SD é a **fonte da verdade**. Isso se chama arquitetura **offline-first**, e é o que garante a *"rastreabilidade dos testes"* que o edital pede.

### Dicionário rápido

| Termo | O que quer dizer |
|---|---|
| **IHM** | Interface Homem-Máquina — a tela por onde a pessoa opera |
| **Nextion** | Tela que já tem processador próprio: você desenha nela e ela cuida do resto |
| **MQTT** | Protocolo de mensagens por assunto, feito para equipamentos |
| **Broker** | O servidor que recebe e distribui as mensagens MQTT |
| **Tópico** | O "assunto" da mensagem (ex.: `camara/telemetria`) |
| **Publicar / Assinar** | Mandar informação / pedir para receber informação de um tópico |
| **JSON** | Formato de texto para organizar dados, legível por pessoas e máquinas |
| **Telemetria** | Medições enviadas automaticamente e continuamente |
| **Dashboard** | Painel visual com os dados em tempo real |
| **Gateway** | Equipamento que liga dois mundos diferentes (aqui: serial ↔ Wi-Fi) |
| **Offline-first** | Projetado para continuar funcionando sem rede |
| **QoS** | "Qualidade de serviço": o quanto o MQTT insiste para a mensagem chegar |

---

## 41.1 Arquitetura de comunicação

```
   ┌──────────────────┐  Serial2 (9600)   ┌──────────────────┐
   │                  │◄─────────────────►│  NEXTION 3.2"    │  IHM local
   │                  │  comandos ASCII   │  (na porta)      │  (sempre funciona)
   │  ARDUINO MEGA    │                   └──────────────────┘
   │                  │
   │  ● PID           │  Serial1 (115200) ┌──────────────────┐
   │  ● Segurança     │◄─────────────────►│  DNLCB30 + ESP32 │
   │  ● Log SD        │  JSON             │  alimentado 24 V │
   └──────────────────┘                   └────────┬─────────┘
                                                   │ Wi-Fi
                                          ┌────────▼─────────┐
                                          │  BROKER MQTT     │
                                          └────────┬─────────┘
                                                   │
                                    ┌──────────────┴──────────────┐
                                    │                             │
                            ┌───────▼────────┐          ┌─────────▼────────┐
                            │   DASHBOARD    │          │  CELULAR / APP   │
                            └────────────────┘          └──────────────────┘
```

> 🛡️ **Princípio de projeto (offline-first):** o Arduino **nunca** depende do ESP32 nem da rede. Se o Wi-Fi cair, o controle continua, a IHM continua e o log no SD continua. A telemetria é "melhor esforço". Isso é o oposto de um projeto IoT amador, em que tudo para quando o Wi-Fi some.

### Por que a DNLCB30 recebe 24 V

| Item | Valor |
|---|---|
| Faixa de entrada da DNLCB30 | **7 – 35 V** |
| Alimentação escolhida | **24 V direto do barramento** |
| Saída interna | 3,3 V regulado para o ESP32 |
| Conversão de nível | 3,3 ↔ 5 V automática em todos os pinos |

✅ **É por isso que o projeto não precisa de um quarto conversor para 3,3 V.** A DNLCB30 já faz esse papel, e ainda resolve a adaptação de níveis lógicos entre o Mega (5 V) e o ESP32 (3,3 V) — sem level shifter externo.

> ⚠️ **Nunca ligue o pino de 3,3 V do ESP32 em nenhuma fonte externa.** Ele é uma **saída** do regulador da DNLCB30.

---

## 41.2 Protocolo Arduino → ESP32 (JSON)

Uma linha por segundo, terminada em `\n`:

```json
{"ts":"2026-08-12T14:32:05","temp":5.2,"umid":65.2,"temp_am":5.0,"sp":5.0,
 "modo":"COOL","duty":67,"i_pelt":5.21,"i_ptc":0.00,"rpm":1850,
 "estado":"RODANDO","pot":true,"alerta":null}
```

| Campo | Tipo | Descrição |
|---|---|---|
| `ts` | string | Timestamp ISO 8601 vindo do RTC |
| `temp` | float | Temperatura de controle (DS18B20, centro da câmara) |
| `umid` | float | Umidade relativa (AM2315C) |
| `temp_am` | float | Temperatura de referência (AM2315C) |
| `sp` | float | Setpoint atual |
| `modo` | string | `COOL` · `HEAT` · `IDLE` · `DEFROST` |
| `duty` | int | 0–100 % aplicado ao atuador |
| `i_pelt` / `i_ptc` | float | Corrente medida pelos pinos IS (−1 = não medido nesta janela) |
| `rpm1` | int | RPM do cooler do dissipador da **Peltier #1** |
| `rpm2` | int | RPM do cooler do dissipador da **Peltier #2** |
| `estado` | string | `BOOT` · `AGUARDA_START` · `RODANDO` · `EMERGENCIA` · `FALHA` |
| `pot` | bool | **24 V** presentes no BD-POT (divisor 22k/4k7 no pino D25). `false` = emergência acionada ou fusível aberto |
| `alerta` | string/null | `FAN_PARADA`, `SOBRECORRENTE`, `CARGA_ABERTA`, `EMERGENCIA`, `DEGELO` |

```cpp
// No Arduino — montar sem a biblioteca ArduinoJson (economiza RAM no Mega)
void enviarJSON() {
    Serial1.print(F("{\"ts\":\""));      Serial1.print(timestampAtual);
    Serial1.print(F("\",\"temp\":"));    Serial1.print(entrada, 2);
    Serial1.print(F(",\"umid\":"));      Serial1.print(umidade, 1);
    Serial1.print(F(",\"temp_am\":"));   Serial1.print(tempAm, 2);
    Serial1.print(F(",\"sp\":"));        Serial1.print(setpoint, 1);
    Serial1.print(F(",\"modo\":\""));    Serial1.print(nomeModo());
    Serial1.print(F("\",\"duty\":"));    Serial1.print((int)fabs(saidaPID));
    Serial1.print(F(",\"i_pelt\":"));    Serial1.print(iPeltier, 2);
    Serial1.print(F(",\"i_ptc\":"));     Serial1.print(iPtc, 2);
    Serial1.print(F(",\"rpm\":"));       Serial1.print(rpmAtual);
    Serial1.print(F(",\"estado\":\""));  Serial1.print(nomeEstado());
    Serial1.print(F("\",\"pot\":"));     Serial1.print(potenciaDisponivel() ? "true" : "false");
    Serial1.print(F(",\"alerta\":"));
    if (alerta[0]) { Serial1.print('"'); Serial1.print(alerta); Serial1.print('"'); }
    else             Serial1.print(F("null"));
    Serial1.println('}');
}
```

---

## 41.3 Protocolo ESP32 → Arduino (comandos)

O ESP32 repassa pela mesma serial, em formato simples e curto:

| Comando | Efeito | Segurança |
|---|---|---|
| `SP:7.5\n` | Altera o setpoint para 7,5 °C | ✅ Permitido — só muda uma referência |
| `STOP\n` | ⭐ Para o processo **e corta os 24 V** (parada Categoria 1) | ✅ Permitido — comando **para o estado seguro** |
| `ACK\n` | Reconhece um alerta (sai de `FALHA`) | ⚠️ Permitido, mas registrado no log |
| ~~`START`~~ **por MQTT** | — | ⛔ **BLOQUEADO** |

> ### ⭐ Por que o STOP remoto é Categoria 2, e não corta a energia
>
> Parece uma fraqueza e é o contrário. Com o **selo do KA2** ([Doc 31 §31.0](../camada_3_eletrica/31_comando_e_protecoes.md)), qualquer corte físico da potência **retém** — e só o **botão verde**, no painel, o desfaz.
>
> Se o `STOP` remoto derrubasse o selo, quem parasse a máquina do celular condenaria alguém a **caminhar até o painel** para religá-la. O comando remoto viraria uma armadilha.
>
> | Origem | O que cai | Como volta |
> |---|---|---|
> | **MQTT / IHM** | só o `R_EN` — Categoria 2 | pela própria tela |
> | **Botão preto** (porta) | o selo do KA2, em hardware — Cat. 1 | botão verde, na porta |
> | **Trip** do firmware | o selo do KA2, pelo KA3 — Cat. 1 | reconhecimento **+** botão verde |
>
> 🎯 **A regra por trás: quem para de longe, religa de longe. Quem para de perto ou por falha, exige alguém de perto.** A parada por **falha** é a que precisa de um humano olhando a máquina — e é justamente a que retém.
>
> ⚠️ **E o corte físico continua a um toque de distância para quem estiver lá:** o botão preto e o cogumelo não passam por software em ponto nenhum.

> ✅ **Pela IHM Nextion o START é PERMITIDO.** A diferença é a distância: quem toca a tela está **na frente da máquina** e enxerga a câmara — é um comando local, igual ao botão do painel. Já o MQTT vem de qualquer lugar do mundo, sem ninguém olhando. Por isso a IHM tem botão INICIAR e o dashboard não.

> ### ⛔ Por que o START por MQTT é proibido
>
> Ligar uma máquina pela internet, sem ninguém olhando para ela, viola o princípio básico de segurança de máquinas: **a partida deve ser um ato local e deliberado, com o operador vendo a zona de risco.**
>
> Pela IHM isso está satisfeito — quem toca a tela está na frente da câmara. Pelo celular, não.
>
> Comandos **para o estado seguro** (STOP) podem ser remotos. Comandos **para o estado energizado** (START) não.
>
> 📌 Diga isso na apresentação. É o tipo de decisão que mostra maturidade de projeto — e se a banca perguntar "por que não dá para ligar pelo celular?", você tem a resposta pronta.

### ⭐ Quem manda em cada momento — sem chave nenhuma

> ### 🔧 A seletora LOCAL / REMOTO foi removida
>
> Ela existia para responder *"quando o remoto pode comandar?"*. Mas olhe a tabela que ela governava:
>
> | Comando remoto | Com a chave em LOCAL | Com a chave em REMOTO |
> |---|---|---|
> | `START` | ⛔ bloqueado | ⛔ **bloqueado igual** |
> | `STOP` | ✅ aceito | ✅ **aceito igual** |
> | `SP:` / `ACK` | ⛔ recusado | ✅ aceito |
>
> **Nas duas linhas que importam para a segurança, a chave não mudava nada** — o `START` já era bloqueado sempre e o `STOP` já era aceito sempre. Ela só arbitrava o setpoint e o reconhecimento de alarme, que **não levam a máquina ao estado energizado**: um setpoint fora de faixa é recusado pela validação, e um `ACK` remoto vai para o log.
>
> 🎯 **A regra de segurança real nunca foi a chave — foi a classe do comando.** Ela continua inteira, e agora é a única:
>
> > **Comando que leva ao estado SEGURO pode vir de qualquer lugar. Comando que leva ao estado ENERGIZADO só da IHM, na frente da máquina.**
>
> **Saem:** uma seletora de 22 mm, um bloco de contato, dois fios pela dobradiça, o pino **D26**, a função `modoRemoto()` e o caminho de recusa `MODO_LOCAL`. **Não sai nenhuma proteção.**

```cpp
void processarComandoRemoto() {
    // ...
    if (cmd == "STOP") {              // ✅ sempre — leva ao estado seguro
        pararProcesso();
        registrarEvento("STOP_REMOTO");
        return;
    }
    if (cmd == "START") {             // ⛔ nunca — leva ao estado energizado
        Serial1.println(F("{\"nak\":\"START_SO_NA_IHM\"}"));
        registrarEvento("START_REMOTO_RECUSADO");
        return;
    }
    // SP: e ACK seguem, com validação de faixa
}
```

> 💡 **Devolva sempre o motivo da recusa.** O `{"nak":"START_SO_NA_IHM"}` faz o dashboard mostrar *"iniciar só é possível na tela do painel"* em vez de simplesmente não acontecer nada. Comando que falha em silêncio é a origem de metade das reclamações de sistema supervisório.

> 📊 **O estado da máquina vai na telemetria** (campo `estado`), para que o dashboard mostre se há ensaio rodando antes de alguém tentar comandar.

```cpp
// No Arduino
void processarComandoRemoto() {
    if (!Serial1.available()) return;
    String cmd = Serial1.readStringUntil('\n');
    cmd.trim();

    if (cmd.startsWith("SP:")) {
        double novo = cmd.substring(3).toFloat();
        if (novo >= -10.0 && novo <= 60.0) {     // ⚠ sempre validar a faixa
            setpoint = novo;
            registrarEvento("SETPOINT_REMOTO");
        }
    }
    else if (cmd == "STOP") {
        desligarTudo();
        estado = AGUARDA_START;
        registrarEvento("STOP_REMOTO");
    }
    // START por MQTT NÃO é implementado — por decisão de projeto.
    // (pela IHM Nextion o START existe: ver lerNextion(), §41.5)
}
```

---

## 41.4 Firmware do ESP32

```cpp
#include <WiFi.h>
#include <PubSubClient.h>

const char* SSID    = "SUA_REDE";
const char* SENHA   = "SUA_SENHA";
const char* BROKER  = "broker.hivemq.com";   // ou um broker local/privado
const int   PORTA   = 1883;

const char* TOPICO_PUB = "camarafrigorifica/telemetria";
const char* TOPICO_SUB = "camarafrigorifica/comando";

WiFiClient   wifi;
PubSubClient mqtt(wifi);

void aoReceberComando(char* topico, byte* payload, unsigned int tam) {
    String cmd;
    for (unsigned int i = 0; i < tam; i++) cmd += (char)payload[i];
    cmd.trim();

    // Repassa apenas os comandos permitidos
    if (cmd.startsWith("SP:") || cmd == "STOP" || cmd == "ACK") {
        Serial.println(cmd);          // vai para o Arduino pela Serial1
    }
}

void reconectar() {
    static unsigned long ultimaTentativa = 0;
    if (mqtt.connected() || millis() - ultimaTentativa < 5000) return;
    ultimaTentativa = millis();

    String id = "camara-" + String((uint32_t)ESP.getEfuseMac(), HEX);
    if (mqtt.connect(id.c_str())) {
        mqtt.subscribe(TOPICO_SUB);
        mqtt.publish("camarafrigorifica/status", "online", true);   // retained
    }
}

void setup() {
    Serial.begin(115200);             // ligado ao Serial1 do Mega pela DNLCB30
    WiFi.mode(WIFI_STA);
    WiFi.begin(SSID, SENHA);
    mqtt.setServer(BROKER, PORTA);
    mqtt.setCallback(aoReceberComando);
    mqtt.setBufferSize(512);          // ⚠ o JSON passa dos 256 B padrão
}

void loop() {
    if (WiFi.status() != WL_CONNECTED) { WiFi.reconnect(); delay(500); return; }
    reconectar();
    mqtt.loop();

    if (Serial.available()) {
        String json = Serial.readStringUntil('\n');
        json.trim();
        if (json.length() > 10 && mqtt.connected())
            mqtt.publish(TOPICO_PUB, json.c_str());
        // Se o MQTT estiver fora do ar, simplesmente descarta:
        // o Arduino já gravou tudo no cartão SD.
    }
}
```

### Detalhes que costumam dar problema

| Detalhe | Por quê |
|---|---|
| `mqtt.setBufferSize(512)` | O buffer padrão do PubSubClient é de 256 bytes. O JSON tem ~230 e cresce com os alertas — sem isso, as mensagens são **silenciosamente descartadas** |
| Reconexão **não bloqueante** | Um `while (!mqtt.connected())` trava o loop e faz o buffer da serial estourar, perdendo telemetria |
| `WiFi.mode(WIFI_STA)` | Sem isso o ESP32 pode subir em modo AP+STA e consumir mais energia sem necessidade |
| **Antena externa** | O ESP32-WROOM-32U **não tem antena embutida** — sem a antena IPEX conectada, o alcance é de poucos centímetros |
| Mensagem `retained` de status | O dashboard sabe imediatamente se o dispositivo está online ao se conectar |

---

## 41.5 IHM Nextion

### Telas

| Tela | Conteúdo | Navegação |
|---|---|---|
| **T0 — Principal** | Temperatura grande, setpoint, modo, estado, **botões INICIAR e PARAR**, ícone de Wi-Fi | Padrão ao ligar |
| **T1 — Ajuste** | Setpoint com botões `+` / `−`, passo de 0,5 °C | Botão "AJUSTE" na T0 |
| **T2 — Diagnóstico** | Umidade, correntes, RPM, duty, tempo de operação | Botão "DIAG" na T0 |
| **T3 — Alarme** | Fundo vermelho, mensagem do alerta, instrução de rearme | Automática ao entrar em `FALHA`/`EMERGENCIA` |

### Comandos do Arduino para a Nextion

O protocolo da Nextion é texto seguido de **três bytes 0xFF**:

```cpp
void nexEnviar(const char* cmd) {
    Serial2.print(cmd);
    Serial2.write(0xFF); Serial2.write(0xFF); Serial2.write(0xFF);
}

void atualizarNextion() {
    char buf[48];

    snprintf(buf, sizeof(buf), "t_temp.txt=\"%.1f\"", entrada);        nexEnviar(buf);
    snprintf(buf, sizeof(buf), "t_sp.txt=\"%.1f\"",   setpoint);       nexEnviar(buf);
    snprintf(buf, sizeof(buf), "t_modo.txt=\"%s\"",   nomeModo());     nexEnviar(buf);
    snprintf(buf, sizeof(buf), "t_est.txt=\"%s\"",    nomeEstado());   nexEnviar(buf);
    snprintf(buf, sizeof(buf), "j_duty.val=%d",  (int)fabs(saidaPID)); nexEnviar(buf);

    if (alerta[0]) {                                   // vai para a tela de alarme
        nexEnviar("page 3");
        snprintf(buf, sizeof(buf), "t_alarme.txt=\"%s\"", alerta);  nexEnviar(buf);
    }
}
```

### Recebendo o setpoint da tela

Na Nextion, programe os botões `+` e `−` para enviar um evento:

```
// No Editor Nextion, evento "Touch Release" do botão "+":
printh 53 50 2B      // envia os bytes ASCII "SP+"
```

```cpp
// No Arduino
void lerNextion() {
    if (!Serial2.available()) return;
    String r = Serial2.readStringUntil('\n');

    // ---- ajuste de setpoint ----
    if      (r.indexOf("SP+") >= 0) setpoint = min(setpoint + 0.5, 60.0);
    else if (r.indexOf("SP-") >= 0) setpoint = max(setpoint - 0.5, -10.0);

    // ---- START e STOP pela tela ----
    // Exatamente equivalentes aos botões do painel: apenas levantam a flag,
    // e a máquina de estados decide se pode ou não iniciar.
    else if (r.indexOf("GO")   >= 0) pedidoStart = true;
    else if (r.indexOf("HALT") >= 0) pedidoStop  = true;
}
```

> ⚠️ **Sempre limite a faixa do setpoint** (`-10 °C` a `+60 °C`). Sem isso, um toque acidental pode pedir −50 °C, e o PID vai manter as Peltier em 100 % indefinidamente, cozinhando os dissipadores.

---

## 41.6 Dashboard

Opções, da mais simples à mais completa:

| Opção | Esforço | Resultado |
|---|---|---|
| **MQTT Explorer** (desktop) | Nenhum | Mostra as mensagens cruas — bom para depurar, ruim para apresentar |
| **App IoT MQTT Panel** (Android) | Baixo | Painel no celular com mostradores e gráfico. **Melhor custo-benefício para a defesa** |
| **Node-RED + dashboard** | Médio | Gráficos históricos, alarmes, automações. Roda no PC ou num Raspberry Pi |
| **Página HTML com MQTT over WebSocket** | Médio | Roda no navegador, sem instalar nada — impressiona na apresentação |

### Sugestão de layout do dashboard

```
┌───────────────────────────────────────────────────────────┐
│  CÂMARA FRIGORÍFICA CF-01                    ● ONLINE     │
├───────────────────────┬───────────────────────────────────┤
│                       │  Setpoint    5,0 °C   [−] [+]     │
│      5,2 °C           │  Umidade    65,2 %                │
│      ▼ RESFRIANDO     │  Duty          67 %               │
│                       │  RPM fan 1/2 1850 / 1820          │
│                       │  Corrente    5,21 A               │
├───────────────────────┴───────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐  │
│  │        gráfico temperatura × tempo (24 h)           │  │
│  │  ---- setpoint    ——— temperatura medida            │  │
│  └─────────────────────────────────────────────────────┘  │
├───────────────────────────────────────────────────────────┤
│  Estado: RODANDO    K1: ARMADO    Alerta: —    [ STOP ]   │
└───────────────────────────────────────────────────────────┘
```

> ⚠️ **O dashboard tem botão STOP, mas não tem botão START** — pelo motivo explicado na §41.3. Na **IHM Nextion**, os dois existem.

---

## 41.7 Segurança de rede (pergunta provável da banca)

| Risco | Mitigação adotada |
|---|---|
| Broker público (`broker.hivemq.com`) é aberto — qualquer um pode publicar no tópico | Usar tópicos com sufixo aleatório, ou **broker local com usuário e senha** (Mosquitto no PC da apresentação) |
| Comando malicioso ligando a máquina | **START remoto não existe.** O pior que um atacante consegue é parar o processo |
| Setpoint absurdo | Validação de faixa no Arduino (`−10 a +60 °C`) |
| Perda de conexão | Irrelevante para o controle — arquitetura offline-first |
| Credenciais de Wi-Fi no código | Usar um arquivo `credenciais.h` fora do repositório; nunca mostrar a senha no slide |

---

## 41.8 ✅ Checklist de aceitação

- [ ] DNLCB30 alimentada com **24 V** (não 5 V); ESP32 recebendo 3,3 V dela
- [ ] **Antena IPEX conectada** ao ESP32-WROOM-32U
- [ ] Serial1 do Mega ↔ Serial do ESP32 trocando dados (teste com texto simples)
- [ ] `mqtt.setBufferSize(512)` aplicado
- [ ] JSON publicado a 1 Hz e visível no MQTT Explorer
- [ ] Comando `SP:` funcionando e validado por faixa
- [ ] Comando `STOP` remoto funcionando
- [ ] **START por MQTT confirmadamente ausente** do código
- [ ] **START pela IHM funcionando**, equivalente ao botão físico
- [ ] Reconexão testada: derrubar o Wi-Fi por 1 min → o controle e o log **não** param, e o MQTT volta sozinho
- [ ] 4 telas da Nextion criadas e navegáveis
- [ ] Setpoint ajustável pela IHM, com limite de faixa
- [ ] Tela de alarme abrindo automaticamente em `FALHA` / `EMERGENCIA`
- [ ] Dashboard montado e testado no ambiente da apresentação (**teste o Wi-Fi do local antes!**)

> 💡 **Plano B para a apresentação:** o Wi-Fi de escola/auditório costuma bloquear a porta 1883. **Leve um roteador portátil ou use o hotspot do celular**, e tenha o broker Mosquitto rodando no seu notebook. Teste tudo no local antes.

---

📄 **Anterior:** [Doc 40 — Firmware Arduino](40_firmware_arduino.md) · **Próximo:** [Doc 42 — Simulação e Testes](42_simulacao_e_testes.md)
