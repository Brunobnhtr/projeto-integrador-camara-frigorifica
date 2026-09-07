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

---

## 2. Monitoramento das 50 Posições de Ensaio

O desafio principal é monitorar 50 disjuntores de cargas sem poluir o quadro com 100 fios analógicos correndo por dezenas de metros até o controlador. A arquitetura de rede **Modbus RTU via RS-485** é a mesma em ambos os mundos. O que muda é como medimos.

| Item | Na Maquete (2 posições) | Na Indústria (50 posições) |
|---|---|---|
| **A Carga do Teste** | Lâmpadas Automotivas W5W Pingo (24V 5W) gerando calor e corrente. | Equipamentos Reais sob ensaio nas esteiras (cargas AC pesadas). |
| **Proteção de Ramal** | Porta-Fusíveis Seccionáveis DIN (Fusível de Vidro 500mA). | Minidisjuntores Curva C de força. |
| **O Sensor de Corrente**| **ACS712-5A**: Invasivo (precisa cortar o fio de força e parafusar no módulo). Escala 0-5A DC. | **Transformador de Corrente (TC) Split-Core** ou **Sensor SZC23**: Não invasivo (abotoado por fora do cabo). Mede AC pesada. |
| **Digitalização do Sinal**| **Módulo ADC 2 Canais** (Conversor A/D 0-5V para Modbus RTU). | **Módulos ADC 8AI (ou 16AI) Industriais** de trilho DIN. Cada módulo concentra 8 TCs locais e despacha tudo via rede RS-485. |

### Por que a arquitetura Modbus é a prova da maturidade do projeto?
Num chão de fábrica, tentar levar 50 fios analógicos de tensão (0 a 5V) por 20 metros resultaria em leituras completamente malucas devido à interferência magnética de motores e compressores.
Ao usar Módulos ADC **locais** (espalhados no quadro de disjuntores) que digitalizam o sinal e cospem um sinal serial diferencial (**RS-485**), a comunicação se torna cega a ruídos elétricos, permitindo apenas um par trançado de fios (A e B) varrer a fábrica inteira. 

---

## 3. Comutação de Potência e Controle Térmico

| Função | Na Maquete (Didático) | Na Indústria (Planta Real) |
|---|---|---|
| **Geração de Frio** | Pastilhas Termoelétricas (Peltier) | Compressores Frigoríficos, Válvulas de Expansão |
| **Geração de Calor** | Resistor Cerâmico PTC | Resistências Tubulares Blindadas |
| **Controle de Carga** | Drivers DC **BTS7960** modulando PWM. | Inversores de Frequência e Contatores de Estado Sólido (SSR). |
| **Relés de Comando** | Módulos de relé 5V com optoacoplador. | Relés de Interface industriais Slim de 24V. |

---

## Conclusão de Engenharia
A maquete foi desenhada para **provar o conceito lógico e arquitetural**. O código (Firmware), o protocolo de comunicação (Modbus/MQTT) e a topologia elétrica de segurança (Intertravamentos, Selo de Emergência) rodam exatamente da mesma maneira na Indústria. Apenas trocamos o "Tijolo Didático" pelo "Tijolo Industrial", mantendo a planta viva, altamente tecnológica e 100% aderente às normas.

---
⬅️ **Anterior:** [Doc 03 - Lista de Materiais](03_lista_materiais.md) | ➡️ **Próximo:** [Doc 10 - Base e Chão de Fábrica](../camada_1_maquete/10_base_e_chao_de_fabrica.md)
