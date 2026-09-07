# Arquitetura e Componentes: Silos Inteligentes para Gipsita

> **Demanda:** #13063 - Silos inteligentes para controle de volume de material (Gipsita)
> **Objetivo:** Medir nível/volume sem contato em um ambiente com muita poeira e enviar dados em tempo real.

---

## 1. O Desafio do Ambiente (Poeira Agressiva)
A gipsita (matéria-prima do gesso) na etapa de britagem gera uma quantidade massiva de poeira fina em suspensão dentro do silo. 
* ❌ **Sensores Ultrassônicos:** O som é absorvido e refratado pela nuvem de poeira, causando falsos ecos e perda de sinal.
* ❌ **Sensores a Laser:** A poeira suja a lente rapidamente e bloqueia o feixe de luz, exigindo limpeza diária.
* ✅ **A Solução Ideal:** **Sensor Radar de Onda Contínua (FMCW de 80 GHz)**. As ondas eletromagnéticas de alta frequência atravessam a nuvem de poeira de gipsita sem sofrer atenuação. Além disso, antenas encapsuladas em PTFE (Teflon) evitam o acúmulo de material.

---

## 2. Especificação de Componentes (Hardware)

### 2.1. Instrumentação (O Sensor)
No mundo real, radares industriais europeus (VEGA, Siemens) custam mais de R$ 5.000,00. Como a exigência é manter **fidelidade técnica total**, dividimos a solução em 3 níveis:

*   **Nível 1 (Protótipo Econômico para Maquete - R$ 50 a R$ 150):** 
    Utilizar um **Radar mmWave voltado para distância**. 
    *⚠️ Atenção:* Não usar radares de presença humana como o HLK-LD2410. Para medir nível, precisamos de módulos que meçam distância absoluta da superfície, como o **Acconeer A121** (excelente custo-benefício, ~R$ 70) ou o **DFRobot SEN0306** (24 GHz). Eles ignoram a poeira e o ESP32 consegue calcular o nível do silo a partir da distância lida via I2C/UART.
*   **Nível 2 (Protótipo Industrial Avançado - R$ 1.000 a R$ 1.500):** 
    Se o grupo conseguir maior orçamento, pode utilizar na maquete um transmissor radar 80 GHz com saída **4-20 mA** de fabricantes asiáticos vendidos no Brasil. Isso permite conectar o sensor a um CLP/IHM, criando uma arquitetura 100% idêntica ao chão de fábrica real.
*   **Nível 3 (Retrofit na Planta Real da Indústria):** 
    Proposta final a ser apresentada na documentação para a fábrica real. Utiliza-se um Radar 80 GHz (FMCW) ou 76-81 GHz industrial explícito para ambientes com poeira (ex: Holykell HR80G ou marcas consagradas), garantindo integração via 4-20mA / HART com o sistema existente.

### 2.2. Controle e Telemetria (IoT)
Para manter o projeto financeiramente viável e alinhado com a proposta de IoT, usaremos a base já dominada de microcontroladores:
* **Microcontrolador:** ESP32 (Módulo com antena externa para melhor alcance de Wi-Fi no ambiente fabril).
* **Conversor de Sinal (Analógico para Digital):** Módulo conversor de Corrente para Tensão (4-20mA para 0-3.3V) ou um ADC I2C (ex: ADS1115 de 16-bits) para ler o sinal do radar com altíssima precisão.
* **Conectividade:** O ESP32 publicará os dados via protocolo **MQTT** no broker da empresa.

### 2.3. Infraestrutura Elétrica e Painel de Comando
* **Quadro Elétrico:** Painel de policarbonato ou chapa metálica com vedação de borracha (Grau IP65 mínimo) para impedir a entrada do pó de gesso nos componentes eletrônicos.
* **Fonte de Alimentação:** Fonte chaveada industrial 24VCC para montagem em trilho DIN (alimenta tanto o loop 4-20mA do radar quanto os conversores step-down para 5V/3.3V do ESP32).
* **Proteção Elétrica:** 
  * Disjuntores termomagnéticos bipolares para proteção do circuito CA de entrada.
  * DPS (Dispositivo de Proteção contra Surtos) Classe III para proteger a eletrônica fina contra surtos da rede elétrica da mineração.
  * Bornes de passagem (tipo mola) para conexões firmes que suportam vibração fabril.

---

## 3. Topologia do Sistema (Como vai funcionar)

1. **Leitura:** O Radar 80 GHz dispara a onda no topo do silo, o sinal bate na gipsita e retorna. O tempo de voo é convertido em um sinal de corrente de 4 a 20 mA. (Ex: silo vazio = 4 mA, silo cheio = 20 mA).
2. **Conversão:** O fio do radar chega no painel, passa pelo módulo conversor, que transforma a corrente num sinal elétrico legível pelo ESP32.
3. **Processamento:** O ESP32 aplica uma fórmula matemática (calibração baseada na geometria do silo) para transformar essa leitura elétrica em **Toneladas** ou **Metros Cúbicos**.
4. **Transmissão:** Via Wi-Fi da planta, o ESP32 envia as informações para um servidor.
5. **Dashboard:** Os operadores visualizam na sala de controle o nível gráfico (0 a 100%) através de um painel como Grafana, Node-RED ou plataforma própria, sem precisar subir no silo.

