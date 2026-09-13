# Estudo Comparativo e Catálogo de Componentes

Este documento é o **Dossiê de Hardware** do projeto. Ele arquiva a pesquisa detalhada de todos os componentes avaliados (tanto os escolhidos quanto os descartados) para embasar as decisões técnicas e comprovar à banca que a arquitetura adotada é a mais eficiente, segura e adequada para a transição entre a maquete didática e a indústria pesada.

---

## 1. Microcontroladores e Processamento (O Cérebro)

Como a fábrica já utiliza o Arduino como padrão para o controle da câmara, o objetivo não é simplesmente descartá-lo, mas sim **adicionar conectividade (IoT)**. Estruturamos esta análise em duas partes: as arquiteturas possíveis e a escolha exata do chip de comunicação.

### 1.1. Arquiteturas Possíveis para Adicionar Conectividade

| Solução | Controle | Conectividade | Arquitetura | Complexidade | Quando usar |
|---|---|---|---|---|---|
| **Opção A: Arduino + ESP32 externo** | Arduino Legado | ESP32 | 2 MCUs | Média | Modernizar sistema existente sem mexer na placa atual. |
| **Opção B: Arduino UNO R4 WiFi** | RA4M1 (32-bit) | ESP32-S3 | Integrada | Baixa | ⭐ Melhor evolução natural do ecossistema UNO. |
| **Opção C: Arduino Nano ESP32** | ESP32-S3 | ESP32-S3 | Integrada | Baixa | Projetos compactos (O ESP32 é o MCU principal). |
| **Opção D: Arduino GIGA R1 WiFi** | STM32H747 | Wi-Fi / BLE | Integrada | Média | Quando exige alto processamento (IHM avançada, IA). |
| **Opção E: Arduino Portenta H7** | STM32H747 | Wi-Fi / BLE | Industrial Edge | Alta | Gateway industrial, integração com sistemas corporativos. |
| **Opção F: Arduino Opta** | STM32H747 | Ethernet / Wi-Fi | CLP | Alta | Automação industrial pesada pura. |

**Vias de Solução Recomendadas:**
- **Caminho 1 (Menor alteração):** *Arduino atual + ESP32 externo.* Mantém o padrão de controle já utilizado pela empresa e adiciona uma camada independente de conectividade.
- **Caminho 2 (Solução integrada otimizada):** *Arduino UNO R4 WiFi.* Integramos o microcontrolador Arduino e um ESP32-S3 na mesma plataforma, reduzindo componentes, cabeamento e pontos de falha.
- **Caminho 3 (ESP32 como plataforma principal):** *Arduino Nano ESP32.* Simplifica o projeto rodando tudo direto no chip da Espressif, mantendo a linguagem do Arduino.
- *(Nota sobre o Opta: Não foi selecionado como primeira via porque a empresa não utiliza arquitetura baseada em CLP hoje. Sua inclusão serve como referência para evolução futura).*

### 1.2. Comparativo da Família ESP32 (Escolhendo o Gateway)

Se seguirmos pelo "Caminho 1" ou precisarmos justificar o chip embutido do "Caminho 2", é preciso entender que **não existe apenas "o ESP32"**. Existem várias gerações, e algumas são muito mais adequadas para IoT industrial.

| Critério | ESP32-WROOM-32 | ESP32-C3 | ESP32-S3 | ESP32-C6 |
|---|---|---|---|---|
| **Wi-Fi** | ✅ Wi-Fi 4 | ✅ Wi-Fi 4 | ✅ Wi-Fi 4 | ✅ Wi-Fi 6 |
| **Bluetooth** | BT + BLE | BLE 5 | BLE 5 | BLE 5 |
| **CPU** | Dual-core | Single-core | Dual-core | Single-core |
| **Arquitetura** | Xtensa | RISC-V | Xtensa | RISC-V |
| **USB Nativo** | ❌ Não | ✅ Sim | ✅ Sim | ✅ Sim |
| **IA / ML** | Limitado | Limitado | Excelente | Bom |
| **802.15.4 (Zigbee)**| ❌ Não | ❌ Não | ❌ Não | ✅ Sim |
| **Recomendação** | Clássico (Boa) | Econômica | ⭐ **Principal** | Avançada |

**O Veredito do Gateway:** 🥇 **ESP32-S3**. 
É a nossa escolha principal para conectividade. Tem Dual-core veloz, USB nativo, suporte a IA local (Machine Learning) e é exatamente o chip que a própria Arduino escolheu embutir no UNO R4 WiFi e no Nano ESP32. O clássico WROOM-32 fica como backup de baixo custo (Caminho 1 original), o C3 é excelente para baixo consumo em baterias, e o C6 sobra como excesso tecnológico (Wi-Fi 6) para a demanda atual.

---

## 2. Sensores de Corrente (Monitoramento das Cargas)

A escolha do sensor de corrente para este projeto foi dividida criteriosamente. Não existe um "sensor universal" perfeito: há sensores para maquetes, para equipamentos profissionais e para a indústria pesada. 

Primeiro, estabelecemos uma separação fundamental:
- 🔴 **Invasivo:** O sensor fica eletricamente no caminho da corrente (Fonte → SENSOR → Carga). Exige interromper o condutor, o que em alta potência é um ponto de falha e risco térmico.
- 🟢 **Não-Invasivo:** O sensor mede o campo magnético sem interromper o circuito de potência (o cabo apenas passa por dentro do sensor ou alicate). É o padrão ouro para retrofit na indústria pesada.

### 2.1. Tabela Mestre de Sensores de Corrente

Catalogamos as principais famílias de sensores do mercado, da prototipagem à indústria pesada, para embasar nossa decisão arquitetural:

| Sensor / Família | AC | DC | Invasivo | Não-Invasivo | Faixa Típica | Tecnologia | Nível de Aplicação |
|---|---|---|---|---|---|---|---|
| **ACS712** | ✅ | ✅ | ✅ | ❌ | 5A / 20A / 30A | Efeito Hall | 🟢 Maquete / Protótipo |
| **ACS724** | ✅ | ✅ | ✅ | ❌ | 2,5A a 50A | Efeito Hall | 🟢 Maquete / 🟡 Funcional |
| **ACS758** | ✅ | ✅ | ✅ | ❌ | 50A a 200A | Efeito Hall | 🟡 Funcional / 🟠 Profissional |
| **ACS772** | ✅ | ✅ | ✅ | ❌ | 50A a 400A | Efeito Hall | 🔴 Industrial Pesado |
| **INA219/226***| ❌ | ✅ | ✅ | ❌ | Depende do shunt | Shunt (I²C) | 🟢 Maquete / 🟠 Profissional |
| **WCS1800** | ✅ | ✅ | ❌ | ✅ | DC 35A / AC 25A | Efeito Hall | 🟢 Maquete |
| **LEM HXN** | ✅ | ✅ | ❌ | ✅ | 5A a 50A | Efeito Hall | 🟠 Equip. Profissional |
| **LEM HO** | ✅ | ✅ | ❌ | ✅ | 6A a 250A | Efeito Hall | 🔴 Industrial |
| **Tamura L07P** | ✅ | ✅ | ❌ | ✅ | 3A a 30A | Efeito Hall | 🟠 Equip. Profissional |
| **Tamura L01Z/L34S**| ✅ | ✅ | ❌ | ✅ | 50A a 1500A | Efeito Hall | 🔴 Industrial Pesado |
| **ZMCT103C** | ✅ | ❌ | ✅ | ❌ | ~5A | TC Miniatura | 🟢 Maquete (Placa PCB) |
| **SCT-013** | ✅ | ❌ | ❌ | ✅ | 5A a 100A | TC Split-Core| 🟢 Maquete / 🟡 Funcional |
| **AcuCT** | ✅ | ❌ | ❌ | ✅ | 50A a 600+A | TC Industrial| 🔴 Industrial Pesado |
| **Yokogawa CT1000S**| ✅ | ✅ | ❌ | ✅ | Até 1000A | Fluxgate | 🔴 Industrial Pesado |

*(Nota técnica: INA219/226 leem corrente via queda de tensão em um resistor shunt, não oferecendo o isolamento galvânico puro de um sensor Hall).*

### 2.2. A Escolha para o NOSSO Projeto

Ao invés de tentar encontrar um único sensor para todos os cenários, adotamos duas escolhas diferentes para provar a tese tecnológica, mantendo a **mesma arquitetura de leitura e comunicação**.

🔵 **Para a Maquete (Cargas 24V DC)**
- **Selecionado:** `WCS1800` (ou WCS2702).
- **Justificativa:** É não-invasivo (o fio apenas passa pelo furo), mede DC perfeitamente na faixa de 0 a 35A, possui isolamento seguro e é simples de integrar com o Arduino. O ACS712 foi sumariamente descartado por ser invasivo e gerar ruído excessivo nas trilhas.

🟠 **Para a Prova de Conceito em AC (Cargas 220V)**
- **Selecionado:** `SCT-013`.
- **Justificativa:** É um TC de núcleo dividido (alicate). Permite instalação simples sem interromper o condutor, simulando com exatidão o procedimento de campo (retrofit). Ideal para provar a lógica de aquisição AC.

🔴 **A Evolução Definitiva para a Indústria (Chão de Fábrica Real)**
- **Definição de Engenharia:** Não usaremos o SCT-013 de plástico numa indústria pesada. O SCT-013 serviu para **validar o princípio de medição e a arquitetura de software/Modbus**. Para a instalação definitiva no maquinário real, a especificação técnica determina a substituição direta pelo **AcuCT** (TC Split-core Industrial Classe 0.2) ou por transdutores **LEM HO / Tamura** (caso o cliente exija leitura simultânea AC/DC).
- **Vantagem:** O código do controlador, os módulos RS-485 e o painel continuam *exatamente os mesmos*. Apenas o elemento físico de leitura na ponta do cabo é trocado pelo sensor de Nível 4 (Industrial Pesado).

---

## 3. Módulos de Potência e Drivers (Para Peltier e PTC)

Como o Arduino manda apenas sinais de controle (5V, poucos miliamperes), precisamos de "músculos" (drivers) para chavear as pesadas cargas térmicas (Peltier e PTC, que puxam de 5A a 10A). É obrigatório que os módulos aceitem *PWM* (sinal pulsado do PID) para variar a potência de forma proporcional.

Uma premissa arquitetural mudou a nossa análise: **não precisaremos inverter a polaridade da Peltier**. Ela será usada exclusivamente para resfriar, enquanto o aquecimento é feito pelo PTC (ou pela inércia térmica). Logo, a função do driver é ser apenas um interruptor rápido unidirecional, tornando pontes H bidirecionais (como o BTS7960) um excesso estrutural, embora ainda úteis pela disponibilidade.

### 3.1. Análise de Alternativas de Potência

| Driver | Tipo | 24V | PWM | Reversão | Complexidade | Minha Avaliação |
|---|---|---|---|---|---|---|
| **BTS7960 / IBT-2** | Ponte H | ✅ | ✅ | ✅ | Baixa | ⭐⭐⭐⭐⭐ |
| **Módulo IRLZ44N** | MOSFET Logic-Level | ✅ | ✅ | ❌ | Muito baixa | ⭐⭐⭐⭐⭐ |
| **Módulo FQP30N06L**| MOSFET Logic-Level | ✅ | ✅ | ❌ | Muito baixa | ⭐⭐⭐⭐⭐ |
| **Cytron MD30C** | Ponte H Profissional | ✅ | ✅ | ✅ | Baixa | ⭐⭐⭐⭐ |
| **BTN8982TA** | Half-Bridge Industrial | ✅ | ✅ | ❌*| Alta | ⭐⭐⭐⭐ |
| **Pololu VNH5019** | Ponte H | ⚠️ (Limite)| ✅ | ✅ | Baixa | ⭐⭐⭐ |
| **TI DRV8876** | Ponte H Integrada | ✅ | ✅ | ✅ | Média | ⭐⭐⭐ (Pico 3.5A)|
| **Módulo IRF520** | MOSFET Standard | ⚠️ | ✅ | ❌ | Baixa | ⭐ (Esquenta) |
| **Relé Eletromecânico**| Relé Físico | ✅ | ❌ | ❌ | Baixa | ⭐ |
| **Relé Sólido (SSR)**| Chaveamento Óptico | Depende | ⚠️ | ❌ | Baixa | ⭐⭐ |

*(Nota: * Um único BTN8982TA atua como meia-ponte. SSRs são ótimos para AC, mas em DC de alta corrente com PWM rápido sofrem com aquecimento e ineficiência de corte).*

### 3.2. A Hierarquia de Escolha para o Projeto

🥇 **1º — BTS7960 (A escolha do Protótipo Atual)**
Apesar de ser uma Ponte H (podendo inverter corrente), é a nossa escolha número um simplesmente porque **já possuímos o módulo e ele é extremamente robusto**. Ele suporta os 24V e a corrente com folga, aceita o PWM e já está validado. A desvantagem é que estamos usando uma ponte H para uma carga que só gira (ou esfria) para um lado.

🥈 **2º — Módulo MOSFET IRLZ44N (A evolução limpa)**
Seria a escolha perfeita para uma segunda versão do projeto. O **IRLZ44N é um MOSFET *Logic-Level***. Ele foi feito para abrir totalmente a "torneira" de corrente com apenas 4V a 5V no Gate, reduzindo drasticamente o RDS(on) e a dissipação de calor. O FQP30N06L é um candidato direto pelo mesmo motivo. Arquitetura super limpa: `Arduino -> IRLZ44N -> Peltier -> Resfriamento` (Unidirecional puro).

🏭 **3º — Cytron MD30C / BTN8982TA (A referência)**
Para apresentar como evolução industrial. O Cytron entrega 30A contínuos com uma construção blindada. O chip BTN8982TA é automotivo, com diagnósticos e proteção de temperatura no próprio silício (ideal se fôssemos desenhar a PCB do zero).

❌ **O Erro Comum: Módulo IRF520**
O módulo IRF520 foi **rebaixado e descartado**. O problema dele não é a falta de PWM. O problema é que o VGS (Tensão de Gate) necessário para saturá-lo bem é de 10V. Com os 5V/3.3V do Arduino/ESP32, ele não abre totalmente a passagem da corrente. Isso faz com que a resistência interna dele fique altíssima, o módulo ferva dissipando potência como calor, e não entregue a energia que a Peltier precisa.

### 3.3. Veredito de Potência (Conclusão do Dossiê)

Para o acionamento da Peltier, a solução **BTS7960 / IBT-2** apresenta elevada capacidade de corrente, controle por PWM e ampla disponibilidade, sendo adequada ao protótipo já existente. Entretanto, como a Peltier será utilizada exclusivamente para resfriamento na nossa câmara térmica, não existe necessidade funcional de inversão de polaridade. 

Dessa forma, módulos baseados em MOSFET canal N *Logic-Level*, como o **IRLZ44N** e **FQP30N06L**, apresentam uma arquitetura muito mais simples e potencialmente mais eficiente para o acionamento unidirecional da carga. O clássico **IRF520**, apesar de possuir dezenas de módulos comerciais baratos, não é recomendado como primeira opção devido à sua inadequação para operação eficiente quando acionado diretamente por sinais lógicos de baixa tensão, o que aumenta a dissipação térmica. Para aplicações de maior robustez, drivers como o **Cytron MD30C** também podem ser considerados, embora a ponte H embutida continue desnecessária quando não há reversão térmica.

---

## 4. Concentradores de Dados e Comunicação (Arquitetura 50 Posições)

Para ler os 50 aparelhos sem puxar 50 cabos analógicos pela fábrica.

- **Expansores I2C (PCF8574 ou ADS1115):** 
  - *Uso:* O ADS1115 é um ADC maravilhoso de 16 bits.
  - *Problema:* O barramento I2C foi feito para distâncias de centímetros (dentro da mesma placa). Em cabos de metros, a capacitância destrói o sinal.
- **Módulo Modbus RTU ADC 8 Canais (ex: DAM-8041, WP8027AD):**
  - *Uso:* Converte 8 canais analógicos e envia o pacote via RS-485.
  - *Vantagem:* Usa apenas 2 fios que podem cruzar até 1.200 metros de fábrica imunes a ruídos. É a tecnologia universal da automação.
  - *Veredito:* **A Escolha Matadora do Projeto.**

---

## 5. Sensores de Nível (Demanda Secundária - Silos de Gipsita)

Para resolver o problema de medir o nível de pó sem subir no silo.

| Tecnologia | Como funciona | Comportamento com Poeira de Gesso | Veredito |
|---|---|---|---|
| **Ultrassom (HC-SR04 ou Industriais IP67)** | Emite pulso sonoro | A nuvem de pó reflete ou absorve a onda sonora antes dela bater no material real. Dá leitura falsa de silo cheio. | **Descartado.** Falha catastrófica em mineração. |
| **Laser / ToF (Time of Flight)** | Emite feixe de luz | O pó suja a lente em 2 dias e bloqueia a luz. Exige limpeza constante. | **Descartado.** Exige intervenção humana constante. |
| **Radar FMCW (80 GHz)** | Emite onda de rádio de alta frequência | A onda de rádio ignora a suspensão de ar e poeira, refletindo apenas no material sólido. A antena de Teflon impede aderência. | **Escolhido.** É o padrão ouro do setor de cimento e gesso. |

### Comunicação 4-20mA no ESP32 (Silos)
O sensor radar industrial transmite o nível no formato de corrente de loop de 4 a 20 mA.
- **Solução Pobre (Resistor Shunt):** Usar um resistor de 165 Ohms no GND. Pela Lei de Ohm, 20mA viram 3.3V no ESP32. É funcional, mas vulnerável a surtos do silo.
- **Solução Rica (Módulo HW-685 / XY-IT0V):** Um chip conversor 4-20mA para Tensão isolado opticamente. Garante que qualquer raio ou surto magnético no silo queime apenas o módulo de 10 reais, salvando o processador principal. **(Recomendado na Defesa).**

