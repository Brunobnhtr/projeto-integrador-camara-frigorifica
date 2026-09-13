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

A escolha do sensor depende do tipo de tensão (AC ou DC) e de ser Invasivo (precisa cortar o fio e parafusar no módulo) ou Não-Invasivo (o fio apenas passa por dentro de um furo ou alicate, garantindo isolamento total).

### 2.1. Invasivos (Contato Direto)
- **Módulo ACS712 (5A/20A/30A):** 
  - *Tecnologia:* Efeito Hall.
  - *Vantagem:* Muito barato, lê DC e AC.
  - *Desvantagem:* Exige cortar o cabo de potência para passar na plaquinha. As trilhas finas esquentam e dão muito ruído magnético na leitura (instabilidade).
  - *Veredito:* **Descartado.** 

### 2.2. Não-Invasivos (Isolamento Galvânico)
- **Módulo WCS1800 / WCS2702 (Corrente Contínua - DC):**
  - *Tecnologia:* Efeito Hall com Furo de Passagem.
  - *Vantagem:* O fio da carga passa por dentro de um anel. Não há contato físico. Ideal para a maquete que usa Lâmpadas Automotivas 24V DC. 
  - *Desvantagem:* Um pouco maior e mais caro que o ACS.
  - *Veredito:* **Escolhido para a Maquete DC.**

- **Sensores ZMCT103C / SCT-013 (Corrente Alternada - AC):**
  - *Tecnologia:* Transformador de Corrente (TC Miniatura / Split-Core).
  - *Vantagem:* Extrema precisão em AC, isolamento perfeito, o SCT-013 abre como um alicate para abraçar o fio pronto.
  - *Desvantagem:* **Não funciona em DC** (A física do transformador exige variação magnética alternada).
  - *Veredito:* **Escolhido para a Fábrica (Cargas AC 220V).**

- **Transdutor Industrial SZC23:**
  - *Tecnologia:* Chave de Corrente ajustável.
  - *Vantagem:* Em vez de mandar um sinal variável analógico, ele fecha um contato seco ("Ligou / Desligou") quando a corrente passa de um limite ajustável.
  - *Veredito:* Opção de backup industrial caso a empresa só queira saber se "queimou" (0/1) sem precisar medir valores absolutos.

---

## 3. Módulos de Potência e Drivers (Para Peltier e PTC)

Como o Arduino manda apenas sinais de controle (5V, poucos miliamperes), precisamos de "músculos" (drivers) para chavear as pesadas cargas térmicas (Peltier e PTC, que puxam 5A a 10A). E precisamos que aceitem *PWM* (sinal pulsado do PID) para variar a potência.

| Driver | O que é | Aceita PWM de alta freq? | Vantagens | Desvantagens | Veredito |
|---|---|---|---|---|---|
| **Relé Eletromecânico** | Bobina e contato de metal | **NÃO** | Barato, fácil de usar. | Faz "click-click", os contatos desgastam, não serve para PID porque a inércia mecânica não acompanha pulsos rápidos. | **Descartado.** |
| **Relé de Estado Sólido (SSR)** | Chaveamento óptico com Triac | Baixa freq (Zero-cross) | Zero desgaste, silencioso, excelente para cargas AC pesadas. | Esquenta muito, exige dissipador. Ruim para controle PWM fino em DC. | **Opção para o Aquecedor PTC da Fábrica (220V AC).** |
| **MOSFET (IRF520 / LR7843)** | Transistor de Efeito de Campo | **SIM (Perfeito)** | Chaveia milhares de vezes por segundo silenciosamente, sem desgaste. O LR7843 suporta até 30V e correntes altíssimas. | Só serve para DC. Exige diodo de roda-livre em cargas indutivas. | **Escolhido para a Maquete (Peltier/PTC em 24V DC).** |
| **Ponte H (BTS7960)** | Driver Completo Bidirecional (43A) | **SIM** | Permite inverter a polaridade (fazer a Peltier esquentar e esfriar). Tem proteções térmicas embutidas. | Caro. Como no projeto usamos PTC para aquecer e Peltier só para esfriar, usar uma Ponte H gigante é matar mosca com bazuca. | **Descartado (Oversized).** |

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

