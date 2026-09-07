# CAMADA 1 · Doc 13 — Posições de Ensaio e Detecção de Falha (Retrofit Modbus RS-485)

> ⭐ **Este documento cobre o coração do problema descrito no edital:** os dispositivos que ficam energizados dentro da cabine durante o ensaio térmico, e como o sistema descobre — **na hora** — que um deles parou de funcionar.
>
> ✅ **Pré-requisito:** [Doc 12](12_camara_termica.md) — câmara construída.

---

## 🟢 Em palavras simples

Uma cabine climatizada vazia não testa nada. O que dá sentido a ela é **o que está lá dentro, ligado, sendo submetido a frio e calor**.

Na empresa real, são até **50 placas ao mesmo tempo**. E aí está o problema que o projeto resolve: se uma delas morrer (ou o conector soltar) no meio de um ensaio de 4 horas, **ninguém percebe**. Descobre-se no fim, e não se sabe em que momento nem em que temperatura a falha ocorreu. O ensaio inteiro se perde.

A solução é o monitoramento contínuo: **se cada posição tiver a sua corrente medida o tempo todo e transmitida para um painel de monitoramento, o sistema sabe na hora quem parou.** 

Mas para demonstrar isso à banca, nós dividimos o projeto em duas escalas de arquitetura:
1. **A Bancada (Nossa Maquete):** Onde simulamos o defeito de forma segura com Corrente Contínua (24V).
2. **A Indústria (Planta Real):** Como nossa prova de conceito seria instalada em um chão de fábrica de verdade, lidando com 50 disjuntores em Corrente Alternada (127V/220V).

Ambos usam o mesmo "idioma": **o barramento RS-485 rodando protocolo Modbus RTU**.

---

## 13.1 O Abismo Entre Bancada e Indústria

### Como é a aplicação real na empresa (Indústria)
- **Carga:** Até 50 equipamentos (DUTs - Devices Under Test) consumindo energia pesada.
- **Corrente:** Alternada (AC), 127V ou 220V. Correntes na ordem de 0,5 A a 5 A por posição.
- **Proteção:** 50 minidisjuntores termomagnéticos padrão DIN (ex: curva B ou C, 2 A a 6 A).
- **Distância:** O quadro de força (disjuntores) pode estar a dezenas de metros do painel de monitoramento.

### Como nós reproduzimos na demonstração (Bancada/Maquete)
- **Carga:** Precisamos de *cargas simuladoras* que caibam no painel e não queimem a maquete de calor. Em vez de 50, usamos **apenas 2 posições**. 
- **Corrente:** Contínua (DC), 24V. Correntes na ordem de miliamperes (~200 mA por posição).
- **Proteção:** Não existem "minidisjuntores" comerciais de 200 mA para trilho DIN. Então usamos um truque: **porta-fusíveis seccionáveis de trilho DIN**. Eles parecem disjuntores, abrem e fecham o circuito com uma gavetinha, mas dentro carregam um fusível de vidro (500 mA).
- **Distância:** Tudo fica dentro do mesmo painel de 400x500 mm.

---

## 13.2 A Carga Simuladora da Bancada (O "DUT")

A maquete usa **Lâmpadas Automotivas 24V (W5W "Pingo", 5 Watts)**. 

Por que lâmpadas automotivas, e não apenas LEDs com resistores?
Porque o sensor analógico (ACS712) precisa de uma corrente palpável para detectar a passagem com precisão e fugir do ruído de fundo (~100 mA). Um LED comum consumiria 17 miliamperes, forçando-nos a usar gambiarras (como dar 10 voltas com o fio no sensor).

A lâmpada W5W ligada no barramento de 24V resolve tudo de uma vez:
- **Corrente excelente:** Consome `5W / 24V = 208 mA`. (Perfeitamente mensurável pelo ACS712-5A).
- **Zero resistores limitadores:** Como ela já é feita para 24V, a ligamos diretamente no 24V e no GND. Não tem dissipador esquentando à toa.
- **Segurança Térmica:** 2 lâmpadas dissipam um total de 10 W de calor. É perfeitamente absorvido pela margem de sobra da fonte de 240W do projeto, e não vai derreter a câmara acrílica.
- **Feedback Visual Brilhante:** O filamento aceso confirma visualmente que a posição de ensaio está "viva".

---

## 13.3 A Cadeia de Medição (Do Sensor ao Modbus)

É aqui que a mágica industrial acontece. Na maquete, não vamos ligar sinais analógicos diretamente nos pinos do Arduino (isso é amadorismo e sujeito a interferências terríveis). Vamos digitalizar perto da fonte e usar um barramento industrial de longa distância.

### Arquitetura na Maquete (2 posições)

```
        24 V (permanente)
             │
      [ Porta Fusível DIN ] ──► Gavetinha para "Desligar/Simular Falha"
             │                  (Fusível de vidro 500mA)
             ▼
      ┌──────────────┐     
      │  ACS712-5A   │ ──► Sensor lê a passagem da corrente contínua 
      └──────┬───────┘     Saída analógica: 0V a 5V (2,5V no repouso)
             │                                   │
             ▼                                   ▼ Vout (0~5V)
      ┌──────────────┐                 ╔═════════════════════╗
      │ Lâmpada W5W  │                 ║ MÓDULO ADC 2 CANAIS ║ 
      │   (24V 5W)   │                 ║  Modbus RTU RS-485  ║ 
      ╚══════╦═══════╝                 ╚══════════════╦══════╝
             │                                        │
           0 V                                  RS-485 (A / B)
                                                      │ (até 1200 metros)
                                                      ▼
                                              [ MAX485 + ESP32 ]
```

1. **O Sensor (ACS712-5A):** Mede a corrente que passa para a lâmpada. Com 208 mA, a variação de tensão na saída dele é pequena (cerca de 38 mV acima dos 2,5V de repouso, mas o ADC capta perfeitamente após estabilização e média de amostras no software Modbus).
2. **A Digitalização (Módulo ADC):** O módulo analógico-digital de 2 canais capta a variação na casa dos milivolts (0 a 5V) e a transforma em um dado digital serial empacotado no protocolo *Modbus RTU*.
3. **O Ônibus de Comunicação (RS-485):** O par trançado blindado transporta o dado do Módulo Modbus até o ESP32 (que é o Mestre Modbus) através do adaptador MAX485.

> 🔥 **A Grande Jogada de Engenharia:** Quando houver um fio partido, alguém puxar a gaveta do fusível, ou a lâmpada queimar, a corrente vai a ZERO (o ACS712 volta a emitir 2,5V cravados). O Módulo ADC lê isso, o ESP32 pergunta via Modbus, detecta a queda abrupta da corrente, e o software entra em **ESTADO DE FALHA DE DUT**.

---

## 13.4 Escalonamento para a Indústria (50 Posições)

A arquitetura da nossa maquete não muda para suportar as 50 placas da empresa; ela **apenas se multiplica**.

Na planta real, a corrente é **Alternada (AC)** e muito mais forte. Portanto:
- Saem as lâmpadas Pingo, entram os Equipamentos Reais das esteiras.
- Sai o `Porta-Fusível DIN`, entram `Minidisjuntores Curva C`.
- Sai o sensor invasivo ACS712 (que precisa ser decapitado e parafusado), entra o **Transformador de Corrente (TC) não-invasivo tipo Split-Core** (abotoado no fio) ou o sensor AC **SZC23**.
- Sai o módulo ADC de 2 Canais, e entram **Vários Módulos 8AI (8 Analógicas In)** ou até 16AI espalhados pelos trilhos do quadro de disjuntores.

### Duas formas de vender a solução para o chão de fábrica:

**Solução Híbrida (Custo-Benefício):**
- Acoplam-se TCs Split-Core com saída condicionada de `0-5V` ou `0-10V` nas 50 posições.
- A cada 8 posições, um "Módulo ADC 8 Canais Modbus RTU RS-485" (como os da Waveshare ou Ebyte) recebe os cabos locais curtos e digitaliza tudo.
- Os 7 módulos 8AI formam uma *daisy-chain* RS-485 (com endereços Modbus do ID 1 ao ID 7).
- Um único cabo par trançado de dois fios sai do quadro de 50 disjuntores e viaja dezenas de metros até o painel central, onde um ESP32 (ou a tela IHM) capta todos os dados e joga no Dashboard MQTT da fábrica.

**Solução CLP Profissional (Industrial Pura):**
- TCs industriais com saída de loop **4-20 mA**.
- Ligados aos cartões de expansão analógica (AI) do CLP (Controlador Lógico Programável) já existente na empresa. O software Ladder no CLP cuida do monitoramento.
- Alternativamente: Medidores Multimedidores de Energia de trilho DIN com comunicação Modbus nativa em cada disjuntor (muito mais caro, porém prático).

> 🎓 **O que deve ser explicado na Banca:** *"A beleza deste projeto não está em usar o ESP32 para monitorar duas lâmpadas; está em arquitetar a comunicação por RS-485. Numa fábrica, o ruído eletromagnético dos compressores da câmara frigorífica destruiria qualquer sinal de 5V ou I2C que tentasse viajar os 10 metros entre os disjuntores e a sala de controle. O protocolo Modbus RTU por diferencial de tensão no RS-485 é a barreira imune a ruído, permitindo que a solução inteira seja modular."*

---

## 13.5 Esquema Elétrico das 2 Posições (A Maquete)

### A. Circuito de Força (24V Permanente)
1. Do **BD-24V**, puxar 2 fios vermelhos (0,5 mm²) até a entrada de potência dos dois **Porta-fusíveis DIN**.
2. Da saída do porta-fusível, plugar no pino `IP+` do sensor ACS712-5A.
3. Sair do pino `IP-` do ACS712 e ir para o polo positivo da Lâmpada W5W (soquete T10).
4. O fio de saída do soquete vai direto para o **BD-0V**.

### B. Circuito de Sinal Analógico (Curtíssimo)
1. Alimente o pino `VCC` de ambos os ACS712 puxando 5V do **BD-5V**. `GND` ao **BD-0V**.
2. O pino `VOUT` do ACS712 #1 vai para o canal `IN_0` (ou AIN1) do Módulo ADC Modbus.
3. O pino `VOUT` do ACS712 #2 vai para o canal `IN_1` (ou AIN2) do Módulo ADC Modbus.

### C. Barramento RS-485 (Comando Longo)
1. Alimente o Módulo ADC Modbus (geralmente eles suportam entre 7 a 36V, use os 24V do **BD-24V**).
2. Ligue o Terminal `A` do Módulo Modbus no pino `A` do MAX485 (que fica espetado no ESP32).
3. Ligue o Terminal `B` do Módulo Modbus no pino `B` do MAX485.
4. **IMPORTANTE:** Coloque um resistor de 120 ohms unindo A e B no módulo MAX485 e outro resistor de 120 ohms unindo A e B no borne do Módulo ADC Modbus (isso elimina a reflexão de onda).

---

## 13.6 Lógica do Firmware (Modbus Master no ESP32)

No cenário clássico, faríamos `analogRead()` no pino do ESP32. Como estamos rodando **Modbus RTU**, o código muda drasticamente para incorporar a biblioteca Mestre. (O código completo vai no `Doc 41`).

```cpp
#include <ModbusMaster.h>

ModbusMaster node;

void setup() {
  Serial2.begin(9600, SERIAL_8N1, RX_PIN, TX_PIN); // Comunicação com o MAX485
  node.begin(1, Serial2); // O Módulo ADC foi configurado fisicamente como ID = 1
}

void loop() {
  uint8_t result;
  uint16_t valor_bruto_canal1 = 0;
  
  // Pergunta ao escravo ID=1 o conteúdo de 2 registradores de entrada
  result = node.readInputRegisters(0x0000, 2);
  
  if (result == node.ku8MBSuccess) {
    valor_bruto_canal1 = node.getResponseBuffer(0); // Valor ADC canal 1
    
    // Converte ADC para Volts (0-4095 -> 0-5V)
    float tensao = (valor_bruto_canal1 * 5.0) / 4096.0;
    
    // Converte Volts para Amperes (ACS712-5A: 2.5V no zero, 185mV por A)
    float corrente = (tensao - 2.5) / 0.185;
    
    if (corrente < 0.05) { // Caiu de 208 mA para praticamente 0
       triggerAlarm("DISPOSITIVO MORTO NO DUT 1");
    }
  }
  delay(1000); // Polling industrial a cada 1 segundo
}
```

**Resumo da Ópera:** O ESP32 grita "Ei, Modbus Escravo ID 1, me dê os registradores analógicos". O módulo 485 processa, responde no protocolo, e o ESP32 faz o balanço matemático. Caiu pra zero amperes por mais de 1 segundo? É **Dispositivo Morto**.

---

## 13.7 Checklist de Aceitação

- [ ] Lâmpadas Pingo W5W acendendo quando as gavetas dos porta-fusíveis são empurradas.
- [ ] ESP32 interrogando o módulo Modbus via Serial2 (Leds de RX/TX do MAX485 piscando).
- [ ] Sem carga, o ADC Modbus reportando um registrador que se traduz para ~2.5V.
- [ ] Com carga, a conversão batendo perto dos `~208 mA`.
- [ ] **Ensaio de Detecção:** Abrir a gavetinha do fusível; o ESP32 deve reportar "Dispositivo Morto" em menos de 2 segundos.
- [ ] **Ensaio de Tolerância a Falha:** Se o fio do RS-485 for partido, o Modbus dará *Timeout* (falta de resposta). O ESP32 deve interpretar timeout contínuo como **Perda de Comunicação / Alarme Crítico do Monitoramento**, não como funcionamento normal!

---

📄 **Anterior:** [Doc 12 — Câmara Térmica](12_camara_termica.md) · **Próximo:** [Doc 20 — Painel de Comando](../camada_2_painel/20_painel_projeto_e_layout.md)
