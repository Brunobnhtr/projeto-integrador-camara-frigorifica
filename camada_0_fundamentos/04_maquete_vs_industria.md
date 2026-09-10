# 04. Escalabilidade: Maquete vs. Indústria

> "Como provar que um projeto didático de bancada realmente se aplica a um chão de fábrica?"

Para fins didáticos e de custos, nossa **Maquete** utiliza componentes compactos (como Arduino Mega, ESP32 e sensores ACS712). Porém, a arquitetura foi desenhada desde o início para ser idêntica à de uma **Planta Industrial**, mudando apenas os hardwares (instrumentos) utilizados.

A fábrica já possui um ecossistema padronizado, muitas vezes utilizando o próprio padrão Arduino em hardwares de nível industrial (PLCs e Controladores Pro robustos). 

Abaixo, documentamos o comparativo exato entre o que está montado na **Maquete (Didático)** e o que será comprado/instalado na **Indústria (Planta Real)**.

---

## 1. O Controlador Principal e IoT

Na maquete, nós dividimos as tarefas em três placas isoladas que precisam conversar entre si: o **Arduino Mega 2560** (Controle PID e lógica), o **ESP32** (Rede Wi-Fi, Modbus, MQTT e IHM) e um módulo **RTC DS3231** avulso para segurar a hora.

Na **Indústria**, manter módulos separados gera pontos de falha (fios soltos, ruído em I2C, falha de solda). A solução profissional unifica tudo numa única placa robusta, já padronizada no chão de fábrica:

| Função | Na Maquete (Didático) | Na Indústria (Planta Real) |
|---|---|---|
| **Cérebro e I/O** | Arduino Mega 2560 | **Arduino Portenta Machine Control** (ou **Arduino GIGA R1 WiFi** / **Arduino Opta WiFi**) |
| **Conectividade (IoT)** | Módulo ESP32 + MAX485 | **Nativo na placa** (Ethernet / Wi-Fi / RS-485 embutidos) |
| **Relógio (RTC)** | Módulo DS3231 externo | **Nativo na placa** (RTC de hardware interno com bateria backup tipo botão CR2032) |
| **Armazenamento (Log)**| Módulo SD Card SPI | **Nativo na placa** (Entrada microSD e/ou Flash nativa de alta capacidade) |
| **Interface USB** | USB Tipo-B (Serial) | **USB Tipo-C** / **USB Host** nativo |
| **Confiabilidade** | Fios Jumper Dupont | **Bornes industriais de mola ou parafuso direto na placa** |

> 📌 **A Evolução Industrial:** Placas da linha **Arduino Pro** (como o *Portenta Machine Control* ou a linha *Opta*) reúnem todo o poder do Arduino, combinam co-processadores de rede e já entregam portas RS-485 e Ethernet de fábrica num trilho DIN, sem jumpers. Se o cliente exige uma placa estilo devboard de altíssimo poder, o **ESP32-P4** (com expansões Ethernet PHY) ou o **Arduino GIGA R1 WiFi** (que tem o tamanho do Mega, mas tem RTC, USB-C e co-processador Wi-Fi) cumprem essa função magistralmente numa única peça.
>
> 🔄 **Evolução intermediária: Arduino UNO R4 WiFi.** Para quem já usa Arduino e quer dar o primeiro passo sem trocar toda a plataforma, o **UNO R4 WiFi** reúne processador Renesas (Arm Cortex-M4), co-processador **ESP32-S3** embutido (Wi-Fi + Bluetooth), **RTC interno** e USB-C — tudo numa única placa, programável na mesma IDE Arduino. Ele substitui o Arduino Mega + ESP32 + RTC DS3231 por uma peça só, mantendo compatibilidade com o código existente e reduzindo pontos de falha.

---

## 2. Monitoramento das 50 Posições de Ensaio

O desafio principal é monitorar 50 disjuntores de cargas sem poluir o quadro com 100 fios analógicos correndo por dezenas de metros até o controlador. A arquitetura de rede **Modbus RTU via RS-485** é a mesma em ambos os mundos. O que muda é como medimos.

| Item | Na Maquete (2 posições) | Na Indústria (50 posições) |
|---|---|---|
| **A Carga do Teste** | Lâmpadas Automotivas W5W Pingo (24V 5W) gerando calor e corrente. | Equipamentos Reais sob ensaio nas esteiras (cargas AC pesadas). |
| **Proteção de Ramal** | Porta-Fusíveis Seccionáveis DIN (Fusível de Vidro 500mA). | Minidisjuntores Curva C de força. |
| **O Sensor de Corrente**| **Módulo Efeito Hall Não-Invasivo** com furo de passagem (ex: WCS2702). Permite medir DC sem cortar o fio. *(Se a carga de teste na maquete for AC, basta usar um TC miniatura tipo ZMCT103C)*. | **Transformador de Corrente (TC) Split-Core** ou **Sensor SZC23**: Não invasivo (abotoado por fora do cabo). Mede AC pesada. |
| **Digitalização do Sinal**| **Módulo ADC 2 Canais** (ADC = *Analog-to-Digital Converter*, converte o sinal contínuo 0-5V do sensor para um número digital Modbus RTU). | **Módulos ADC 8AI (ou 16AI) Industriais** de trilho DIN. Cada módulo concentra 8 TCs locais e despacha tudo via rede RS-485. |

### Por que a arquitetura Modbus é a prova da maturidade do projeto?
Num chão de fábrica, tentar levar 50 fios analógicos de tensão (0 a 5V) por 20 metros resultaria em leituras completamente malucas devido à interferência magnética de motores e compressores. 

**E por que não usar o padrão industrial 4-20 mA?**
O sinal 4-20 mA é imune a ruídos e viaja longas distâncias, mas se a empresa fosse utilizar transmissores 4-20 mA para monitorar 50 aparelhos, o custo seria altíssimo. Seriam 50 sensores caros e a necessidade de puxar 50 cabos independentes cruzando todo o galpão até chegar no painel do controlador principal (CLP/Arduino).

A nossa arquitetura resolve isso com o **RS-485**. Nós mantemos os sensores puros e baratos (TCs normais) instalados perto das cargas, e digitalizamos o sinal ali mesmo através de Módulos ADC **locais** de trilho DIN. Esses módulos empacotam as informações e cospem um sinal serial diferencial (**RS-485**), que é totalmente cego a ruídos elétricos.
O resultado? A informação de todos os 50 aparelhos varre a fábrica inteira através de **um único par trançado de fios (A e B)**. A empresa economiza milhares de reais em sensores caros e em quilômetros de cabeamento de cobre, mantendo a confiabilidade industrial. 

---

## 3. Comutação de Potência e Controle Térmico

| Função | Na Maquete (Didático) | Na Indústria (Planta Real) |
|---|---|---|
| **Geração de Frio** | Pastilhas Termoelétricas (Peltier) | Compressores Frigoríficos, Válvulas de Expansão |
| **Geração de Calor** | Resistor Cerâmico PTC (80W) | Resistências Tubulares Blindadas |
| **Controle de Carga (PID)** | Drivers de motor DC **BTS7960** modulando PWM. | **Controladores de Potência Tiristorizados (SCR)** com entrada 4-20mA ou **Inversores de Frequência**. |
| **Relés Auxiliares (Sinal)** | Módulos de relé 5V genéricos (optoacoplados). | **Relés de Interface Slim 24V** (ex: Finder Série 39, Phoenix Contact PLC-RSC). |
| **Relé Principal (Força)** | Módulo de relé 5V (usado no KM1). | **Contator Industrial 24V DC** (ex: Siemens Sirius) ou Relé de Estado Sólido (SSR) de alta potência. |
| **Sensores de Temperatura**| Sonda DS18B20 (1-Wire) e AM2315C (I2C). | Sondas **PT100/PT1000** ligadas a Transmissores de Temperatura (saída 4-20mA ou Modbus). |

---

## 4. Infraestrutura, Energia e Painel (HMI)

Para garantir que o equipamento sobreviva ao ambiente fabril (poeira, umidade, vibração e ruído elétrico), a infraestrutura de montagem muda drasticamente.

| Função | Na Maquete (Didático) | Na Indústria (Planta Real) |
|---|---|---|
| **Fonte de Alimentação** | Fonte chaveada genérica "Colmeia" (24V 10A). | **Fontes Industriais de Trilho DIN** (ex: Mean Well NDR/EDR, Phoenix Contact QUINT) com PFC ativo e proteção robusta. |
| **Redutores de Tensão** | Módulos Step-Down LM2596 (sem proteção). | **Conversores DC/DC Industriais DIN** isolados galvanicamente. |
| **Gabinete (Painel)** | Caixa de acrílico ou quadro de sobrepor plástico. | **Painéis Rittal / Steck IP55 ou IP65** (chapa de aço ou policarbonato) com ventilação forçada e filtros de ar. |
| **Botões e Sinalização** | Botões push-button 22mm genéricos e LEDs simples. | **Linha Industrial 22mm** (ex: Schneider Harmony XB4/XB5, WEG CEW) com blocos de contato independentes e vedação pesada. |
| **Tela / IHM** | Display genérico ES3C28P SPI/I2C acoplado ao ESP32. | **IHM Industrial Touchscreen** (ex: WEG MT8000, Delta, Siemens KTP) comunicando via Ethernet ou RS-485 Modbus direto com o Arduino Portenta. |
| **Distribuição Elétrica** | Blocos de barramento impressos em 3D ou parafusos simples. | **Bornes Sak/Sindal de Passagem** de trilho DIN (ex: Phoenix Contact PT, WAGO) com molas *Push-in* antivibração. |

---

## 4. Infraestrutura: O Painel e a Imunidade a Ruídos (EMI)

Um dos erros mais comuns de quem migra do Arduino para a indústria é montar o painel elétrico colocando cabos de potência ("Força") colados nos cabos de sensores e microcontroladores ("Comando"). A potência gera Interferência Eletromagnética (EMI), que trava o Arduino e bagunça as leituras analógicas. 

Na indústria, a regra absoluta é a **separação física e eletromagnética**. E o nosso projeto foi desenhado respeitando isso desde o protótipo:

| Regra de Ouro | Como é na Indústria | Como fizemos no nosso Painel |
|---|---|---|
| **Separação de Rotas** | Canaletas cinzas exclusivas para cabos grossos de força. Canaletas azuis exclusivas para sinais de 24V e dados. | O painel possui 3 trilhos DIN. Os fios de Força (alimentação principal, Peltiers, resistores PTC, consumindo quase 10A) correm em **canaletas separadas** dos fios finos de Comando (Arduino, ESP32, sensores). |
| **Isolamento de Sinal** | Uso de CLPs e fontes com acopladores óticos e filtros de linha potentes. | Adotamos módulos com **isolamento galvânico**, comunicação RS-485 (cega a ruídos graças à leitura diferencial de tensão) e mantemos o Arduino o mais longe possível das chaves contatoras de potência. |
| **Proteção de Pinos (Pull-down)**| Entradas de CLP nunca ficam "flutuando", elas têm resistores internos para garantir sinal seguro se um fio arrebentar. | Adicionamos **resistores de pull-down** no hardware. O *pull-down* força a tensão do pino para 0V fisicamente caso o fio solte ou o Arduino trave, desligando as cargas perigosas imediatamente. |

---

## Conclusão de Engenharia
A maquete foi desenhada para **provar o conceito lógico e arquitetural**. O código (Firmware), o protocolo de comunicação (Modbus/MQTT) e a topologia elétrica de segurança (Intertravamentos, Selo de Emergência) rodam exatamente da mesma maneira na Indústria. Apenas trocamos o "Tijolo Didático" pelo "Tijolo Industrial", mantendo a planta viva, altamente tecnológica e 100% aderente às normas.

---
⬅️ **Anterior:** [Doc 03 - Lista de Materiais](03_lista_materiais.md) | ➡️ **Próximo:** [Doc 10 - Base e Chão de Fábrica](../camada_1_maquete/10_base_e_chao_de_fabrica.md)

