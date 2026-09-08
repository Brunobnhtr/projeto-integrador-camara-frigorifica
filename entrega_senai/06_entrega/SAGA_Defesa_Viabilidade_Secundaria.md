# Defesa de Viabilidade — Projeto Secundário (Para Plataforma SAGA SENAI)

> **Objetivo:** Texto curto e direto para convencer a banca avaliadora no sistema SAGA de que o projeto dos Silos Inteligentes é **viável** para execução e **aplica os conhecimentos do curso Técnico em Eletrotécnica**.
>
> **Demanda SAGA:** #13063 — Silos inteligentes para controle de volume de material (Gipsita)

---

### Título do Projeto: Sistema de Telemetria Inteligente para Medição de Nível em Silos de Gipsita

### 1. Viabilidade do Projeto

O projeto é totalmente viável de ser executado dentro do prazo e orçamento do curso técnico. O protótipo consiste em um painel elétrico compacto com sensor de distância sem contato, microcontrolador ESP32 e comunicação Wi-Fi/MQTT, montado sobre uma maquete de silo em escala reduzida (tubo PVC) para demonstrar a leitura de nível, o cálculo de volume e a transmissão dos dados em tempo real para um dashboard remoto.

Todos os componentes são comerciais e de fácil aquisição no mercado nacional: sensor radar mmWave para medição de distância (ex: Acconeer A121 ou DFRobot SEN0306), módulo ESP32, fonte chaveada 24 Vcc de trilho DIN, conversor step-down, disjuntores, bornes de passagem e quadro de proteção IP65. O custo total do protótipo didático (Nível 1) está estimado em aproximadamente **R$ 330,00**. Para a versão com radar industrial 80 GHz e saída 4-20 mA (Nível 2), o custo sobe para cerca de **R$ 1.300,00**.

### 2. Aderência ao Curso de Eletrotécnica

Este projeto exige a aplicação prática de diversas disciplinas fundamentais do curso de **Eletrotécnica**:

* **Instalações Elétricas Industriais:** Dimensionamento do quadro de comando com proteção (disjuntor bipolar na entrada CA, DPS Classe III contra surtos da rede elétrica da mineração), segregação entre a tensão de alimentação 127/220 Vca e a extra-baixa tensão dos circuitos eletrônicos (24 Vcc e 3,3 V), aterramento correto da blindagem dos cabos de sinal e escolha do grau de proteção do painel (IP65 conforme IEC 60529).

* **Instrumentação Industrial:** Aplicação de sensor de nível sem contato baseado em ondas eletromagnéticas (radar FMCW de 80 GHz), que atravessa a nuvem de poeira de gipsita sem atenuação — ao contrário dos sensores ultrassônicos (absorção acústica) e ópticos (obstrução da lente). Condicionamento do sinal analógico de **loop de corrente 4-20 mA** (padrão ISA) via conversor ADC de alta precisão (ADS1115 de 16 bits) para leitura pelo microcontrolador.

* **Projetos Elétricos:** Elaboração de diagrama unifilar do painel de leitura (Disjuntor → DPS → Fonte 24 V → Conversor ADC → ESP32 → Sensor 4-20 mA), layout mecânico do quadro IP65 com bornes de mola antivibração e lista de materiais cotada.

* **Automação e IoT:** Programação do ESP32 para converter a leitura de distância em volume (fórmula geométrica do silo cilíndrico-cônico), publicação em tempo real via protocolo MQTT sobre Wi-Fi da planta e visualização em dashboard centralizado (Grafana ou Node-RED).

* **Normas de Segurança (NR-10 e NR-35):** O sistema elimina a necessidade de um operador subir fisicamente no topo do silo para verificar o nível — reduzindo drasticamente o risco de acidentes em trabalho em altura.

**Resumo:** O projeto combina instrumentação industrial pesada (radar de nível e loop 4-20 mA) com conectividade IoT moderna (ESP32 e MQTT), entregando uma solução que melhora a segurança operacional e a logística da fábrica de gesso.

### 3. Problema que o projeto resolve

A empresa processa gipsita (matéria-prima do gesso) em uma planta com silos de armazenamento. O processo atual de verificação de nível é **manual**: um operador precisa subir até o topo do silo para estimar visualmente a quantidade de material. Isso gera três problemas críticos:

1. **Risco de acidentes:** Escalar silos de vários metros de altura, em ambiente com poeira densa, representa risco real de queda e inalação — contrariando as normas NR-35 (Trabalho em Altura) e NR-09 (Agentes Nocivos).
2. **Falta de previsibilidade logística:** Sem saber em tempo real quanto material resta, a fábrica pode ter paradas inesperadas por falta de gipsita nos fornos ou perdas por transbordo nos silos.
3. **Dificuldade com sensores convencionais:** O alto nível de particulado (poeira de gesso em suspensão) inviabiliza sensores ultrassônicos (o som é absorvido) e ópticos/laser (a lente suja em horas), frustrando tentativas anteriores de automação.

### 4. Como a solução funciona

O sistema instala um sensor de nível **sem contato** no topo de cada silo, conectado a um painel elétrico compacto que transmite os dados por Wi-Fi para uma tela centralizada na sala de controle.

**Por que radar e não ultrassom?**
A poeira de gipsita em suspensão absorve o som e causa falsos ecos nos sensores ultrassônicos. Ondas eletromagnéticas de alta frequência (80 GHz, comprimento de onda de 3,75 mm) **atravessam a nuvem de poeira** sem sofrer atenuação significativa. Além disso, antenas encapsuladas em PTFE (Teflon) evitam o acúmulo de material na face do sensor, eliminando a necessidade de limpeza diária.

**Fluxo de funcionamento:**

1. **Leitura:** O radar 80 GHz dispara uma onda eletromagnética do topo do silo. O sinal reflete na superfície da gipsita e retorna. O tempo de voo é convertido pelo sensor em um sinal de corrente de **4 a 20 mA** (4 mA = silo vazio, 20 mA = silo cheio).
2. **Conversão:** O fio do sensor chega ao painel elétrico IP65 e passa por um módulo conversor de corrente para tensão (4-20 mA → 0-3,3 V) ou um ADC I2C de 16 bits (ADS1115), transformando o sinal analógico em dado digital.
3. **Processamento:** O ESP32 aplica a fórmula de volume do silo (cilindro + tronco de cone inferior) para converter a distância medida em **metros cúbicos** ou **percentual de lotação**.
4. **Transmissão:** Via Wi-Fi da planta, o ESP32 publica as leituras por protocolo MQTT a cada 10 segundos.
5. **Dashboard:** Os operadores visualizam na sala de controle o nível gráfico (0 a 100%) de cada silo em um painel Grafana ou Node-RED, sem precisar subir no silo. Se o nível cair abaixo de um limiar, o sistema pode emitir alarme automático.

**Resiliência a falhas de rede:** Se o Wi-Fi cair, o ESP32 armazena as leituras localmente em buffer (ou cartão SD) até a conexão ser restabelecida, garantindo que nenhum dado de nível seja perdido.

### 5. Viabilidade técnica, econômica e de prazo

A solução é modular e pode ser construída em três níveis de investimento:

| Nível | Sensor | Custo Total Estimado | Quando usar |
|---|---|---|---|
| **Nível 1 (Protótipo para Maquete)** | Radar mmWave de distância (Acconeer A121 ou DFRobot SEN0306) via I2C/UART | **≈ R$ 330,00** | Bancada e apresentação da banca SENAI |
| **Nível 2 (Protótipo Industrial)** | Radar industrial 80 GHz com saída 4-20 mA (fabricantes asiáticos) | **≈ R$ 1.300,00** | Se o orçamento do grupo permitir |
| **Nível 3 (Retrofit Real na Fábrica)** | Radar FMCW 80 GHz industrial homologado (Holykell HR80G, VEGA, Endress+Hauser) com saída 4-20 mA / HART | **R$ 3.000 a R$ 8.000 por silo** | Proposta documentada para a empresa |

**Detalhamento do custo do Nível 1 (maquete didática):**

| Item | Custo |
|---|---|
| Sensor radar mmWave de distância | R$ 70 a R$ 150 |
| Quadro IP65, disjuntores, bornes, fonte DIN | ≈ R$ 150 |
| Módulo ESP32 com antena externa | ≈ R$ 60 |
| Materiais da maquete (tubo PVC, gipsita moída) | ≈ R$ 50 |

O desenvolvimento será feito em 4 fases sequenciais: (1) pesquisa e especificação, (2) montagem do quadro e teste de bancada, (3) programação do ESP32 + MQTT + dashboard e (4) teste na maquete do silo e validação final. O projeto cabe no prazo do curso por utilizar componentes prontos e firmware relativamente simples (leitura, cálculo e publicação MQTT).

### 6. Limites, riscos e validação

O protótipo de maquete não pretende reproduzir um silo industrial de 10 metros de altura nem a poeira real de uma planta em operação. Ele valida a arquitetura de medição, o cálculo de volume, a comunicação IoT e a visualização em dashboard. A aplicação real exigirá:

* Validação do alcance e da precisão do radar com poeira em suspensão real.
* Verificação se a gipsita possui risco de atmosfera explosiva (NR-20). Embora o sulfato de cálcio seja geralmente inerte, a justificativa deve constar no relatório.
* Dimensionamento definitivo do cabeamento entre o topo do silo e o painel na base.
* Avaliação de alternativas ao Wi-Fi em caso de alcance insuficiente (rádios LoRa ou cabo CAT6 em conduíte galvanizado).
* Homologação do sensor e aprovação dos responsáveis pela instalação.

| Risco | Mitigação |
|---|---|
| Queda de Wi-Fi interrompendo a telemetria | Armazenamento local em buffer/SD até a rede voltar |
| Superaquecimento do painel por exposição solar | Instalar o quadro IP65 com proteção anti-UV ou sob cobertura |
| Poeira que excede a faixa do radar didático | Documentar limitação e apresentar especificação do radar industrial Nível 3 |
| Imprecisão na medição de volume (ângulo de repouso irregular) | Calibração com medida manual de referência e margem de tolerância no software |

Os testes de aceitação deverão demonstrar: leitura estável de distância pelo radar, cálculo correto de volume para diferentes alturas de material, publicação dos dados via MQTT, atualização do dashboard em tempo real e geração de alarme quando o nível ultrapassar os limiares configurados.

### 7. Divisão da apresentação entre cinco integrantes

Cada fala pode durar aproximadamente **1 a 2 minutos**. A divisão organiza as falas, mas não separa o conhecimento: todos devem estudar as sete respostas da seção 9.

#### Integrante 1 — Contexto, problema e objetivo

**Falar sobre:** demanda da empresa de gesso (#13063), processo atual de medição manual, riscos de acidentes em altura (NR-35), falta de previsibilidade logística e objetivo do sistema de telemetria.

**Mensagem principal:** "Hoje o operador precisa subir no silo para ver quanto material tem. Nosso projeto elimina esse risco instalando um sensor que enxerga através da poeira e envia o nível em tempo real para a sala de controle."

**Deve saber responder:**

* **Por que o problema é relevante?** Porque o operador corre risco de queda ao escalar o silo, a poeira compromete sua saúde respiratória, e a falta de informação em tempo real causa paradas inesperadas nos fornos e possíveis transbordos.
* **Por que sensores comuns não funcionam?** Ultrassônicos perdem o eco na poeira densa (absorção acústica). Lasers e ópticos têm a lente obstruída em horas. Só ondas eletromagnéticas de alta frequência (radar) atravessam a nuvem de gipsita sem atenuação.
* **Qual o objetivo em uma frase?** Medir o nível de gipsita nos silos sem contato e sem risco humano, transmitindo os dados em tempo real para a gestão logística da fábrica.

#### Integrante 2 — Instrumentação e o sensor radar

**Falar sobre:** por que radar 80 GHz, como funciona o FMCW (Frequency Modulated Continuous Wave), como a onda eletromagnética ignora a poeira, antena PTFE contra acúmulo, sinal 4-20 mA (padrão ISA) e os 3 níveis de sensor.

**Mensagem principal:** "O radar de 80 GHz emite uma onda de rádio que atravessa a poeira, bate na gipsita e volta. O tempo de voo é convertido em corrente de 4 a 20 mA — o mesmo padrão que a indústria inteira utiliza."

**Deve saber responder:**

* **O que é FMCW?** É uma modulação contínua de frequência. O radar emite uma onda cuja frequência varia linearmente no tempo. A diferença de frequência entre o sinal emitido e o retornado é proporcional à distância até a superfície do material.
* **Por que 4-20 mA e não tensão (0-10 V)?** Porque a corrente não sofre queda em cabos longos (dezenas de metros entre o topo do silo e o painel na base). Uma transmissão em tensão perderia precisão com a resistência do condutor. Além disso, 4 mA como zero vivo permite detectar fio partido (leitura de 0 mA = falha, não "silo vazio").
* **O que é o PTFE na antena?** É Teflon. A face do radar é encapsulada em PTFE, que é antiaderente. A poeira de gipsita não gruda, eliminando manutenção diária de limpeza.

#### Integrante 3 — Painel elétrico e infraestrutura

**Falar sobre:** quadro IP65, disjuntor de entrada, DPS Classe III, fonte 24 Vcc DIN, conversor step-down, bornes de mola antivibração, aterramento e segregação entre CA e extra-baixa tensão.

**Mensagem principal:** "O painel foi especificado para sobreviver ao ambiente da mineração: vedação IP65 contra poeira e jatos d'água, proteção contra surtos da rede elétrica e bornes de mola que não afrouxam com a vibração."

**Deve saber responder:**

* **O que significa IP65?** O primeiro dígito (6) é proteção total contra poeira. O segundo dígito (5) é proteção contra jatos d'água de qualquer direção. É o mínimo para equipamentos em ambiente industrial com poeira.
* **Para que serve o DPS Classe III?** Para proteger a eletrônica fina (ESP32, ADC) contra surtos e transientes da rede elétrica da mineração, que são comuns em ambientes com motores pesados e seccionamentos de carga.
* **Por que bornes de mola (push-in)?** Porque em ambiente com vibração (mineração, britadores), bornes a parafuso podem afrouxar com o tempo. Bornes de mola mantêm contato firme sem necessidade de reaperto.
* **Quais normas se aplicam?** NR-10 (segurança em instalações elétricas), NR-35 (trabalho em altura — reduzido pela automação), NBR 5410 (instalação de baixa tensão, aterramento), IEC 60529 (grau IP).

#### Integrante 4 — Programação, IoT e dashboard

**Falar sobre:** ESP32, leitura do ADC, fórmula de volume (cilindro + tronco de cone), protocolo MQTT, dashboard Grafana/Node-RED, alarmes de nível baixo e resiliência offline.

**Mensagem principal:** "O ESP32 recebe a leitura do radar, calcula o volume do silo usando a geometria real e publica o resultado via MQTT. O dashboard mostra a lotação de cada silo em tempo real, sem ninguém subir lá."

**Deve saber responder:**

* **Como converter distância em volume?** O radar mede a distância do topo do silo até a superfície do material. Subtraindo essa distância da altura total do silo, obtemos a altura de produto. Com a geometria do silo (cilindro + cone inferior), aplicamos a fórmula do volume para calcular metros cúbicos ou toneladas.
* **O que é MQTT?** É um protocolo leve de mensageria em modelo Publish/Subscribe. O ESP32 publica os dados em um tópico (ex: `silos/silo1/nivel`) e qualquer cliente inscrito (Grafana, Node-RED, aplicativo) recebe automaticamente.
* **O que acontece se o Wi-Fi cair?** O ESP32 armazena as leituras localmente e as reenvia quando a conexão é restabelecida. O sensor continua medindo independentemente da rede.
* **Como funciona o alarme?** Se o nível de gipsita cai abaixo de um limiar configurado (ex: 15%), o dashboard exibe alerta visual e sonoro. Se sobe acima de 95%, alerta de risco de transbordo. Isso permite ação preventiva.

#### Integrante 5 — Viabilidade, custos e conclusão

**Falar sobre:** os 3 níveis de custo, prazo em 4 fases, limites do protótipo vs. aplicação real, riscos e diferenciais.

**Mensagem principal:** "O protótipo de bancada custa R$ 330 e valida toda a arquitetura. A mesma lógica e o mesmo software escalam para os silos reais apenas trocando o sensor didático pelo radar industrial."

**Deve saber responder:**

* **Qual é a diferença entre os 3 níveis?** Nível 1 (R$ 330): radar mmWave didático, para a maquete. Nível 2 (R$ 1.300): radar industrial chinês 80 GHz com saída 4-20 mA, se o orçamento permitir. Nível 3 (R$ 3.000 a R$ 8.000 por silo): radar industrial homologado europeu para a fábrica real.
* **Quais testes comprovarão o resultado?** Leitura estável de distância, cálculo correto de volume para diferentes alturas, publicação MQTT em tempo real, atualização do dashboard e geração de alarmes nos limiares.
* **O que o protótipo não faz?** Não reproduz um silo de 10 metros nem a poeira real em suspensão. Ele valida a arquitetura de comunicação, o cálculo de volume e a visualização em dashboard. A aplicação real exigirá verificação de alcance, calibração e homologação.
* **Qual é o diferencial?** A maioria das fábricas de gesso ainda mede nível manualmente. Este projeto propõe uma solução IoT de baixo custo que elimina o trabalho em altura, dá previsibilidade logística e usa instrumentação imune à poeira — aplicando o padrão industrial 4-20 mA e RS-485 ensinados no curso de eletrotécnica.

### 8. Números-chave do projeto (referência rápida)

| Grandeza | Valor |
|---|---|
| Demanda SAGA | #13063 — Silos inteligentes para controle de volume (Gipsita) |
| Frequência do radar | 80 GHz (FMCW) — comprimento de onda 3,75 mm |
| Sinal do sensor | Loop de corrente 4-20 mA (padrão ISA) |
| Resolução do ADC | 16 bits (ADS1115 I2C) |
| Microcontrolador | ESP32-WROOM com antena externa |
| Protocolo de transmissão | MQTT sobre Wi-Fi (Publish/Subscribe) |
| Taxa de atualização | ≤ 10 segundos |
| Proteção do painel | IP65 (poeira + jatos d'água) |
| Proteção elétrica | Disjuntor bipolar + DPS Classe III |
| Custo Nível 1 (maquete) | ≈ R$ 330,00 |
| Custo Nível 2 (radar industrial didático) | ≈ R$ 1.300,00 |
| Custo Nível 3 (por silo na fábrica real) | R$ 3.000 a R$ 8.000 |
| Normas aplicáveis | NR-10, NR-35, NBR 5410, IEC 60529 |

### 9. Conhecimento mínimo comum aos cinco integrantes

Antes da apresentação, cada integrante deve conseguir explicar sem consultar o texto:

1. **Problema:** medição manual de nível nos silos de gipsita gera risco de acidente em altura, falta de previsibilidade logística e impossibilidade de usar sensores convencionais (ultrassom e laser) por causa da poeira.
2. **Solução:** sensor radar de 80 GHz (que atravessa a poeira) com saída 4-20 mA, lido por um ESP32 que calcula o volume e publica via MQTT em um dashboard remoto.
3. **Fluxo:** radar mede distância → conversor digitaliza o sinal 4-20 mA → ESP32 calcula volume → MQTT transmite → dashboard exibe em tempo real.
4. **Segurança:** painel IP65, DPS contra surtos, segregação elétrica, aterramento da blindagem e eliminação do trabalho em altura (NR-35).
5. **Custos:** R$ 330 para o protótipo didático, R$ 1.300 para versão com radar industrial e R$ 3.000 a R$ 8.000 por silo na fábrica real.
6. **Limite:** a maquete valida a arquitetura e o software, mas a aplicação real exige verificação de alcance, calibração com poeira e homologação do sensor.
7. **Diferencial:** medir nível sem contato, imune à poeira, eliminando trabalho em altura e dando previsibilidade logística em tempo real — usando instrumentação industrial padrão (4-20 mA) com IoT de baixo custo.

### 10. Encerramento sugerido

"Concluímos que o projeto é viável técnica e economicamente porque resolve um problema real de segurança e logística utilizando instrumentação industrial comprovada (radar FMCW e loop 4-20 mA) combinada com IoT de baixo custo (ESP32 e MQTT). Ele integra instalações elétricas, instrumentação, normas de segurança, automação e programação embarcada. O resultado esperado é a eliminação do risco de trabalho em altura nos silos, com informação de nível em tempo real para a gestão da fábrica — utilizando uma tecnologia que já é padrão na indústria pesada mundial."
