# Análise de Viabilidade — Projeto Integrador 2026

> ⚠️ **Como usar:** este documento apresenta a análise de viabilidade das **duas demandas**
> cadastradas no SAGA (GP Inovação SENAI). Cada demanda é analisada de forma independente,
> com três pilares: **viabilidade técnica**, **viabilidade econômica** e **viabilidade
> operacional**. O formato segue o padrão das entregas do Projeto Integrador — linguagem
> impessoal, objetiva e com evidências.

---

# DEMANDA 1 — Cabine Climatizada de Ensaios Térmicos

> **SAGA GP Inovação:** Projeto Integrador 2026/01 6.01 03
> **Título:** Implementação de Sistema de Controle Inteligente com ESP32 para Cabine Climatizada
> **Empresa:** Ensaios & Controle Tech
> **Área:** Automação

---

## 1. Descrição da Demanda

A empresa realiza ensaios térmicos em dispositivos eletrônicos embarcados, submetendo até 50
unidades simultaneamente a ciclos de aquecimento e resfriamento em cabine climatizada, conforme
a série IEC 60068-2. O sistema atual opera com Arduino e acionamento manual, sem monitoramento
remoto, sem registro de dados e sem detecção individual de falha. Quando um dispositivo falha
durante o ciclo, a falha só é percebida ao final — sem rastreabilidade de quando nem por quê.
O ensaio inteiro é descartado.

### 1.1. O que é a IEC 60068-2?

A IEC 60068-2 é uma família de normas internacionais que padroniza os **ensaios ambientais**
para equipamentos eletroeletrônicos. De forma resumida e didática:

| Parâmetro | O que significa |
|---|---|
| **Objetivo** | Simular condições reais (calor, frio, umidade, vibração) para testar se o produto resiste ao uso real |
| **IEC 60068-2-1** | Ensaio de frio (baixa temperatura) |
| **IEC 60068-2-2** | Ensaio de calor seco (alta temperatura) |
| **IEC 60068-2-14** | Ensaio de ciclagem térmica — o mais relevante para este projeto |
| **Como funciona** | O dispositivo é submetido a ciclos repetidos entre uma temperatura mínima e uma máxima, com taxa de variação e tempo de permanência controlados |
| **O que revela** | Falhas por fadiga de solda, delaminação de camadas, degradação de vedações, instabilidade elétrica — defeitos que só aparecem sob estresse térmico repetido |
| **Quem define aprovação** | A norma padroniza o **método** de teste. Os critérios de aprovação/reprovação são definidos pela empresa ou pelo setor industrial |

Em resumo: a câmara de ensaio reproduz as condições que o produto vai enfrentar em campo.
Se ele sobrevive ao ciclo, é mais provável que sobreviva ao uso real.

### 1.2. Como funciona o ensaio na empresa?

Para facilitar o entendimento, o processo pode ser descrito em etapas:

1. **Carregamento** — Até 50 placas eletrônicas são posicionadas dentro da câmara, cada uma em um slot com alimentação elétrica própria.
2. **Energização** — Os dispositivos são ligados e operam em modo de simulação funcional (funcionam como se estivessem em campo).
3. **Ciclo térmico** — A câmara alterna entre aquecimento e resfriamento conforme o perfil programado (temperatura mínima, máxima, taxa de variação e tempo de permanência).
4. **Observação** — Durante o ciclo, espera-se que os dispositivos continuem funcionando normalmente. Se um falhar, significa que não resistiu ao estresse térmico.
5. **Resultado atual** — Como não há detecção individual, a falha só é percebida ao final. O ensaio é descartado e não se sabe qual dispositivo falhou, quando nem em qual temperatura.

---

## 2. Problema Identificado

O sistema atual apresenta restrições operacionais e elétricas que caracterizam claras
**oportunidades de melhoria**:

| Aspecto | Situação atual | Impacto |
|---|---|---|
| **Supervisão** | Presencial — exige operador durante todo o ciclo | Operador preso à máquina por até 8 horas |
| **Registro** | Baixa capacidade — sem data, hora ou histórico de falhas | Impossível rastrear o que aconteceu durante o ensaio |
| **Detecção de falha** | Cega — a falha só aparece no fim do ensaio | Ensaio inteiro descartado, mesmo que apenas 1 de 50 dispositivos falhe |
| **Conectividade** | Ausência de monitoramento remoto; interface limitada ao display local | Sem acesso externo às informações do teste |
| **Infraestrutura** | Organização elétrica passível de aprimoramento | Riscos elétricos e dificuldade de manutenção |

---

## 3. Solução Proposta

Modernização do sistema existente utilizando o ESP32, aproveitando sua maior capacidade de
processamento e conectividade (Wi-Fi/Bluetooth). A solução **preserva** o controle de
temperatura existente (via Arduino) e **acrescenta** inteligência com os seguintes
**benefícios esperados**:

| Benefício | Descrição |
|---|---|
| **Confiabilidade e Precisão** | Melhoria e maior confiabilidade no controle dos ciclos de temperatura |
| **Monitoramento e Integração** | Supervisão remota em tempo real, preparando o sistema para integração com ferramentas digitais (dashboard) |
| **Rastreabilidade** | Registro contínuo dos testes com data, hora, temperatura e identificação individual de falha por posição |
| **Diagnóstico Rápido** | Redução drástica do tempo de detecção — de "fim do ensaio" para menos de 1 segundo |
| **Segurança** | Redução de riscos elétricos por meio de melhorias na organização e infraestrutura do painel de comando |

---

## 4. Viabilidade Técnica

### 4.1. A tecnologia existe e está acessível?

Todos os componentes necessários — microcontroladores, sensores, drivers de potência, módulos
de comunicação e elementos de registro — são comerciais, de baixo custo e encontráveis no
mercado nacional. Nenhum exige fabricação sob encomenda ou importação especializada.

### 4.2. Como funciona cada tecnologia-chave?

Para facilitar o entendimento, as tecnologias centrais da solução são explicadas abaixo:

| Tecnologia | O que é | Para que serve neste projeto |
|---|---|---|
| **ESP32** | Microcontrolador com Wi-Fi e Bluetooth integrados, processamento dual-core | Conecta a câmara à internet, envia dados para a dashboard e permite controle remoto |
| **Sensor de efeito Hall (WCS2702)** | Sensor que mede corrente elétrica sem contato direto com o fio | Detecta se cada dispositivo está consumindo corrente (funcionando) ou não (falhou) — sem abrir o circuito |
| **MQTT** | Protocolo de comunicação leve, ideal para IoT | Transporta as leituras de temperatura e corrente do ESP32 até a dashboard no celular/computador |
| **Controle PID** | Algoritmo que ajusta automaticamente a potência de aquecimento/resfriamento | Mantém a temperatura da câmara no valor programado, compensando variações em tempo real |
| **RTC (DS3231)** | Relógio de tempo real com bateria própria | Registra data e hora exatas de cada evento, mesmo se o sistema for desligado |
| **PWM (20 kHz)** | Modulação por largura de pulso em alta frequência | Controla a potência entregue ao aquecedor e ao Peltier de forma suave, sem ligamentos abruptos |

### 4.3. A equipe domina as competências necessárias?

| Competência do curso | Onde aparece na solução |
|---|---|
| **Comandos Elétricos** | Cadeia de partida com relé de selo, botoeiras e parada de emergência em hardware |
| **Instalações Elétricas de Baixa Tensão** (NBR 5410 / NR-10) | Dimensionamento de condutor, proteção por fusível, aterramento e segregação potência × sinal |
| **Automação e Controle de Processos** | Malha fechada PID com PWM de 20 kHz, leitura de sensores e intertravamentos em firmware |
| **Eletrônica e Microcontroladores** | ESP32, MQTT, registro com RTC e detecção por posição |

**Conclusão:** a solução integra pelo menos **três unidades curriculares** obrigatórias do
curso técnico em eletrotécnica, atendendo ao requisito de projeto *integrador*.

### 4.4. A solução é nova ou já existe igual?

A análise aprofundada de classificações avançadas de patentes (como a `G01R31/2855` e `G01R31/2872`) revela que a medição de corrente individual dentro de câmaras climáticas **já existe e está bem documentada na indústria** — em processos conhecidos como *Burn-In* e *HTOL (High Temperature Operating Life)*. O mercado dispõe de sistemas focados em testes de larga escala (ex: *Aehr Test Systems*).

**Conclusão:** O diferencial técnico deste projeto não é o ineditismo global do conceito, mas sim a sua **escalabilidade e flexibilidade**. Através do uso de sensores não invasivos de Efeito Hall (WCS2702) e tecnologias IoT de código aberto (ESP32), a arquitetura desenvolvida pode ser adaptada para **empresas de diferentes portes e orçamentos**. Ela permite desde a adequação rápida (*retrofit*) de uma câmara de bancada para uma pequena empresa, até a replicação do sistema para demandas maiores, garantindo diagnóstico individualizado de forma acessível e modular.

---

## 5. Viabilidade Econômica

### 5.1. Quanto custa?

O custo é **por câmara modernizada** (a máquina inteira, não por dispositivo dentro dela).
O microcontrolador ESP32 é de baixo custo em qualquer cenário — o que diferencia o
investimento é o **nível dos sensores** utilizados:

| Cenário | Sensores | Estimativa por câmara |
|---|---|---|
| **Protótipo didático (maquete)** | Sensores de prototipagem para ambiente acadêmico | ~R$ 1.900 (inclui maquete, painel e cenografia) |
| **Pequenas e médias empresas** | Sensores comerciais de nível básico — atendem a maioria das aplicações | ~R$ 300 a R$ 800 por câmara |
| **Grandes empresas / linhas críticas** | Sensores de grau industrial — maior precisão, durabilidade e certificação, com integração ao supervisório existente | A partir de R$ 2.000 por câmara |

Em todos os casos, **não há substituição de máquina** — é um retrofit que preserva a
câmara já instalada. O investimento é proporcional ao nível de exigência dos sensores,
não ao microcontrolador.

### 5.2. Qual o retorno?

| Etapa | O que acontece | Benefício |
|---|---|---|
| **Detecção imediata** | O sensor de corrente identifica qual dispositivo parou de consumir, em menos de 1 segundo | O ensaio não é descartado — os demais dispositivos continuam o ciclo |
| **Registro da condição de falha** | O sistema grava a temperatura exata e o instante em que a falha ocorreu | Rastreabilidade completa: sabe-se em qual condição térmica o dispositivo falhou |
| **Envio para análise** | A placa com falha é retirada e encaminhada ao setor de eletrônica para testes detalhados | A engenharia identifica qual componente falhou e em quais condições |
| **Melhoria do produto** | Com os dados acumulados de múltiplos ensaios, a empresa detecta padrões de falha | O fabricante pode melhorar o projeto, trocar fornecedor de componente ou ajustar o processo |

**Conclusão:** o retorno vai além de salvar um ensaio. A detecção por posição com registro
de condição cria um **ciclo de melhoria contínua** — da falha detectada ao produto
aperfeiçoado. O investimento se paga na primeira falha detectada a tempo.

---

## 6. Viabilidade Operacional

### 6.1. A solução pode ser implantada sem parar a produção?

Sim, porém a implantação exige um trabalho de integração com o sistema existente:

| Etapa de implantação | O que envolve |
|---|---|
| **Análise do firmware atual** | O Arduino da empresa já possui sua própria programação de controle de ciclos térmicos. É necessário estudar esse código para entender o protocolo de comunicação, os pinos disponíveis e a lógica de controle existente |
| **Integração ESP32 ↔ Arduino** | O ESP32 não substitui o Arduino — ele se comunica com ele. O ESP32 recebe dados do Arduino (temperatura, estado do ciclo) e envia comandos (parada remota, ajuste de parâmetros). A comunicação pode ser feita via porta serial (UART) ou protocolo I2C |
| **Camada de supervisão** | O ESP32 acrescenta a leitura dos sensores de corrente por posição, o registro com data e hora, e a transmissão via Wi-Fi/MQTT para a dashboard. Essas funções são independentes e não interferem no controle do Arduino |
| **Parada remota** | Na maquete, foi implementada e demonstrada a parada remota via ESP32 — o operador pode interromper o ensaio pelo celular. Na empresa, essa função é integrada respeitando a cadeia de segurança existente |

A modernização é acrescentada **em paralelo** ao sistema atual. O controle do Arduino
continua funcionando de forma independente. A programação da maquete é diferente da
programação da empresa, mas a **arquitetura de integração é a mesma**: o ESP32 se conecta
ao Arduino, coleta informações e acrescenta a camada de inteligência e supervisão remota.

### 6.2. O operador precisa de treinamento especial?

Não. A interface utiliza botoeiras convencionais de painel industrial (verde liga, preto para,
cogumelo de emergência) e IHM local com estado do ensaio. O acompanhamento remoto é feito pelo
celular, sem software especial.

### 6.3. A segurança está garantida?

| Requisito | Como é atendido |
|---|---|
| Parada de emergência | Funciona **mesmo com o firmware travado** — cadeia em hardware com relé de selo |
| Proteção elétrica | Fusíveis por ramal, disjuntor na entrada, ponto único de terra |
| Segregação de tensão | Canaletas separadas para potência e sinal (NBR 5410) |
| Categoria de parada (ISO 13850) | Categoria 0 — corte direto da potência |

**Conclusão:** a operação é segura, intuitiva e não exige parada de produção para instalação.

### 6.4. Quais as etapas previstas para execução?

Para mitigar riscos, a execução do projeto foi dividida nas seguintes etapas:
1. **Testes de bancada:** Validação prévia da conectividade Wi-Fi/Bluetooth e leitura de sensores utilizando o ESP32.
2. **Desenvolvimento de esquemas elétricos:** Revisão da infraestrutura e criação de nova documentação elétrica focada em reduzir os riscos atuais e melhorar a organização do painel.
3. **Prototipagem:** Construção da maquete funcional em escala reduzida, incluindo possível impressão 3D para suportes mecânicos de integração.
4. **Validação de testes:** Ensaios de aceitação técnica (simulando falhas, acionando a emergência e conferindo a leitura remota no dashboard) antes da implementação final na cabine da empresa.

---

## 7. Parecer Final — Demanda 1

| Pilar | Resultado |
|---|---|
| Viabilidade Técnica | ✅ **Viável** — componentes acessíveis, competências dominadas, diferencial comprovado |
| Viabilidade Econômica | ✅ **Viável** — R$ 300 por máquina, retorno na primeira falha detectada |
| Viabilidade Operacional | ✅ **Viável** — sem parada de produção, interface convencional, segurança em hardware |

> **A demanda é viável e foi selecionada como demanda principal do Projeto Integrador.**

---
---

# DEMANDA 2 — Silos Inteligentes para Controle de Volume de Gipsita

> **SAGA GP Inovação:** Demanda #13063
> **Título:** Silos Inteligentes para Controle de Volume de Material (Gipsita)
> **Empresa:** Indústria de gesso (fábrica com operação de britagem)
> **Área:** Automação / Instrumentação

---

## 1. Descrição da Demanda

A empresa opera silos de armazenamento de gipsita (matéria-prima do gesso) na etapa de
britagem. O controle de nível dos silos é feito **manualmente** — um operador precisa subir
na estrutura para verificar visualmente a quantidade de material. Não há informação em tempo
real sobre o volume armazenado, gerando problemas logísticos (paradas por falta de material
ou transbordamento) e **risco de acidente** por trabalho em altura.

## 2. Problema Identificado

| Aspecto | Situação atual |
|---|---|
| Medição de nível | Manual — operador sobe no silo para verificar visualmente |
| Segurança | Risco de queda — trabalho em altura (NR-35) |
| Informação logística | "Achismo" — sem dados em tempo real |
| Resultado | Paradas não planejadas ou excesso de material |

## 3. Solução Proposta

Sistema de telemetria sem contato utilizando **sensor radar de onda contínua (FMCW de 80 GHz)**,
que atravessa a nuvem de poeira de gipsita sem perda de sinal. O sensor é instalado no topo do
silo e mede a distância até a superfície do material. Um ESP32 converte essa leitura em volume
(metros cúbicos) ou percentual de capacidade, e transmite os dados via Wi-Fi/MQTT para uma
dashboard de supervisão acessível na sala de controle.

## 4. Viabilidade Técnica

### 4.1. Por que radar e não ultrassom ou laser?

| Tecnologia | Funciona com poeira de gipsita? | Justificativa |
|---|---|---|
| Ultrassom | ❌ Não | O som é absorvido e refratado pela nuvem de poeira — falsos ecos |
| Laser | ❌ Não | A poeira suja a lente e bloqueia o feixe — exige limpeza diária |
| **Radar FMCW 80 GHz** | ✅ **Sim** | Ondas eletromagnéticas de alta frequência atravessam a poeira; antena encapsulada em PTFE evita acúmulo |

**Conclusão:** o radar é a única tecnologia viável para esse ambiente. A escolha é sustentada
por catálogos de fabricantes industriais (VEGA, Endress+Hauser, Siemens).

### 4.2. Os componentes estão acessíveis?

Todos os componentes necessários — sensor radar, microcontrolador, conversor de sinal, painel
elétrico e fonte de alimentação — são comerciais e encontráveis no mercado nacional. Existem
opções em diferentes faixas de preço, desde módulos didáticos de baixo custo para a maquete
até instrumentação industrial para aplicação em planta real.

### 4.3. A equipe domina as competências necessárias?

| Competência do curso | Onde aparece na solução |
|---|---|
| **Instalações Elétricas de Baixa Tensão** (NBR 5410 / NR-10) | Painel IP65, segregação CA × extra-baixa tensão, aterramento da blindagem do cabo de sinal |
| **Automação e Controle de Processos** | Leitura do sinal 4-20 mA, conversão para volume, transmissão MQTT |
| **Eletrônica e Microcontroladores** | ESP32, ADC de 16 bits, calibração matemática (geometria do silo) |

**Conclusão:** a solução exige competências já trabalhadas no curso e reforça a integração
curricular.

### 4.4. Existe algo igual?

Sistemas de medição de nível por radar são utilizados na indústria. O diferencial desta
proposta é a **integração de IoT de baixo custo** (ESP32 + MQTT + dashboard) sobre
instrumentação industrial, tornando a telemetria acessível para fábricas de pequeno e médio
porte que não possuem sistema supervisório.

---

## 5. Viabilidade Econômica

### 5.1. Quanto custa?

O protótipo didático para a maquete utiliza componentes de baixo custo, totalizando
aproximadamente **R$ 330**. Para aplicação na planta real, existem opções de instrumentação
industrial em diferentes faixas de investimento, todas inferiores ao custo de **uma única
parada não planejada** por falta de material nos fornos.

### 5.3. Qual o retorno?

| Benefício | Impacto |
|---|---|
| Eliminação de subida ao silo | Redução de risco de acidente (NR-35) — ganho imensurável |
| Informação 24/7 do estoque | Planejamento logístico evita paradas e excesso |
| Centralização em dashboard | Operador na sala de controle, sem deslocamento |

**Conclusão:** o retorno é tanto financeiro (evitar paradas) quanto de segurança (eliminar
trabalho em altura). O investimento se justifica em qualquer dos três níveis.

---

## 6. Viabilidade Operacional

### 6.1. A solução pode ser implantada sem parar a produção?

Sim. O sensor é instalado no **topo** do silo (acesso externo), o painel é fixado na base e
o cabeamento segue em conduíte. A instalação não interfere no fluxo de material.

### 6.2. O operador precisa de treinamento especial?

Não. A informação chega em uma dashboard gráfica (Grafana ou Node-RED) com indicação visual
de 0 a 100% — leitura intuitiva. O operador não precisa mais subir no silo.

### 6.3. O ambiente impõe restrições especiais?

| Restrição | Como é tratada |
|---|---|
| Poeira densa de gipsita | Radar FMCW — imune; antena em PTFE |
| Painel exposto ao ambiente | Grau IP65 — vedado contra poeira e jatos d'água |
| Vibração fabril | Bornes tipo mola, fixação mecânica reforçada |
| Risco de poeira explosiva? | Gipsita (sulfato de cálcio) é inerte — risco inexistente, mas a verificação consta na documentação por prudência da engenharia |
| Surtos na rede elétrica da mineração | DPS Classe III na entrada do painel |

**Conclusão:** a operação é segura, dispensa trabalho em altura e utiliza interface intuitiva.

---

## 7. Parecer Final — Demanda 2

| Pilar | Resultado |
|---|---|
| Viabilidade Técnica | ✅ **Viável** — radar FMCW é a solução consagrada para poeira; IoT de baixo custo é acessível |
| Viabilidade Econômica | ✅ **Viável** — protótipo a partir de R$ 330; retorno em segurança e logística |
| Viabilidade Operacional | ✅ **Viável** — instalação sem parada, elimina trabalho em altura, interface gráfica |

> **A demanda é viável e foi selecionada como demanda secundária do Projeto Integrador.**

---
---

# Quadro Comparativo — As Duas Demandas

| Critério | Demanda 1 — Cabine Climatizada | Demanda 2 — Silos de Gipsita |
|---|---|---|
| **Problema central** | Ensaio térmico sem supervisão e sem registro | Medição manual de nível com risco de acidente |
| **Tipo de solução** | Retrofit — modernização do existente | Instrumentação nova — telemetria sem contato |
| **Tecnologia-chave** | Sensor de corrente por posição (efeito Hall) | Radar FMCW 80 GHz (imune à poeira) |
| **Custo** | Baixo — componentes acessíveis, retrofit econômico | Baixo a moderado — depende do nível de instrumentação |
| **Retorno principal** | Primeira falha detectada a tempo paga o investimento | Elimina trabalho em altura + evita parada logística |
| **Competências do curso** | Comandos, Instalações, Automação, Eletrônica | Instalações, Automação, Eletrônica |
| **Base tecnológica comum** | ESP32 + MQTT + telemetria IoT | ESP32 + MQTT + telemetria IoT |
| **Diferencial** | Nenhuma câmara do mercado detecta falha individual por posição | IoT acessível sobre instrumentação industrial pesada |

---

> 🎯 **Ambas as demandas são viáveis e complementares.** Compartilham a mesma base tecnológica
> (ESP32 + MQTT), mas atacam problemas distintos de setores diferentes — o que demonstra a
> versatilidade da formação em eletrotécnica e fortalece o caráter integrador do projeto.

