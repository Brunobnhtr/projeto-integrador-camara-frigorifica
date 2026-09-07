# Defesa de Viabilidade do Projeto (Para Plataforma SAGA SENAI)

> **Objetivo:** Texto curto e direto para convencer a banca avaliadora no sistema SAGA de que o projeto da Câmara Climatizada é **viável** para execução e **aplica os conhecimentos do curso Técnico em Eletrotécnica**.

---

### Título do Projeto: Modernização e Supervisão Inteligente para Cabine Climatizada de Ensaios Térmicos

### 1. Viabilidade do Projeto
O projeto é totalmente viável de ser executado dentro do prazo e orçamento do curso técnico, pois baseia-se no conceito de **"Retrofit" (modernização)**. Não precisaremos construir uma câmara industrial do zero com compressores caros, mas sim criar um painel de comando e uma maquete funcional de baixo custo (usando pastilhas Peltier) para validar o conceito. 
Todos os componentes necessários (contatores, relés de interface, botões de emergência, módulos de sensor de corrente, microcontrolador ESP32 e fontes 24V) são amplamente comerciais, de baixo custo e facilmente encontrados no mercado nacional. Além disso, a montagem da planta didática usa extra-baixa tensão, garantindo a segurança dos alunos durante o desenvolvimento, com o custo total de material estimado abaixo de R$ 2.000,00.

### 2. Aderência ao Curso de Eletrotécnica
Este projeto não é apenas programação; ele exige a aplicação prática de diversas disciplinas fundamentais do curso de **Eletrotécnica**:

*   **Comandos Elétricos e Proteção:** O coração da segurança do projeto está na cadeia de comando em hardware. O acionamento e o corte de emergência são feitos por relés de selo, intertravamentos e proteções físicas, garantindo segurança mesmo em falha de software, de acordo com a NR-10 e NBR 5410.
*   **Projetos Elétricos:** O desenvolvimento inclui a criação de diagramas unifilares e de comando, além do layout mecânico e elétrico do painel (distribuição em trilho DIN, segregação de circuitos).
*   **Instalações Elétricas Industriais:** Dimensionamento correto de condutores, proteção térmica, dimensionamento da fonte de alimentação CC e especificação de sensores de corrente.
*   **Instrumentação e Automação Industrial:** Leitura de sensores (corrente, temperatura) e atuação sobre drivers de potência (PWM) e relés, aplicando os conceitos de malha fechada e leitura analógica de processos.

**Resumo:** O projeto entrega inovação em conectividade (IoT) ancorado inteiramente nas normas, segurança e montagem física ensinadas na eletrotécnica clássica.

### 3. Problema que o projeto resolve

A empresa realiza ensaios térmicos em até 50 dispositivos eletrônicos energizados simultaneamente. O sistema atual permite executar ciclos de aquecimento e resfriamento, porém possui pouca conectividade, registro limitado e não informa rapidamente qual dispositivo parou de funcionar durante o ensaio.

Quando uma unidade falha sem ser percebida, o problema pode ser identificado somente ao final do ciclo. Isso dificulta saber o momento da falha, aumenta o tempo de diagnóstico e pode causar o descarte de horas de ensaio. A proposta transforma esse processo em um ensaio monitorado, rastreável e mais seguro.

### 4. Como a solução funciona

O projeto é um **retrofit**: moderniza a infraestrutura existente sem exigir a construção de uma câmara industrial nova. O protótipo utiliza uma maquete funcional com pastilhas Peltier para representar o controle térmico e um painel didático para demonstrar a lógica elétrica e de automação.

O fluxo de funcionamento é:

1. O operador configura o ensaio pela interface local.
2. O controlador lê a temperatura e executa o ciclo em malha fechada.
3. Drivers de potência acionam as pastilhas Peltier por PWM.
4. Sensores de corrente acompanham individualmente as posições de ensaio. Uma alteração anormal pode indicar falha do dispositivo.
5. O sistema registra eventos com data e hora e pode transmitir dados por Wi-Fi/MQTT para uma futura dashboard.

O ESP32 foi escolhido pela conectividade Wi-Fi/Bluetooth e pela capacidade de processamento. A supervisão remota é complementar: o controle local deve continuar disponível mesmo sem conexão.

### 5. Viabilidade técnica, econômica e de prazo

A solução utiliza componentes comerciais disponíveis no mercado nacional: ESP32, sensores de temperatura e corrente por efeito Hall, fontes de 24 V, relés de interface, contatores, botoeiras, botão de emergência, drivers de potência e módulos de registro. Isso reduz a dependência de peças especiais e facilita a manutenção.

O desenvolvimento será feito por etapas: testes de bancada, elaboração dos diagramas e lista de materiais, montagem da maquete, integração do painel e validação dos ciclos. Essa sequência permite encontrar problemas cedo e preservar a continuidade operacional do sistema atual.

O custo estimado do kit de modernização por máquina é de aproximadamente **R$ 300,00**, sujeito à cotação e à configuração final. O protótipo didático completo, com painel, maquete, sensores, fontes e materiais de montagem, permanece estimado abaixo de **R$ 2.000,00**. O projeto cabe no prazo do curso por aproveitar materiais comerciais e módulos independentes.

### 6. Limites, riscos e validação

O protótipo não pretende reproduzir toda a capacidade térmica de uma câmara industrial. Ele valida a arquitetura, a lógica de controle, a medição individual e a integração entre painel, sensores e supervisão. A aplicação em uma cabine real exigirá nova verificação de potência, dissipação térmica, compatibilidade eletromagnética, calibração e aprovação dos responsáveis.

Os principais riscos são atraso na aquisição, leituras imprecisas, aquecimento excessivo no lado quente das pastilhas e falhas de comunicação. As respostas previstas são usar componentes equivalentes, calibrar os sensores, garantir dissipação adequada, aplicar intertravamentos térmicos e manter o controle local funcionando sem Wi-Fi.

Ao final, os testes deverão demonstrar um ciclo térmico controlado, acionamento protegido, identificação da posição que deixou de consumir corrente, registro do evento e apresentação do estado do ensaio.

### 7. Divisão da apresentação entre cinco integrantes

Cada fala pode durar aproximadamente **1 a 2 minutos**. Os nomes devem ser preenchidos pelo grupo. A divisão organiza as falas, mas não separa o conhecimento: todos devem estudar as sete respostas da seção 8.

#### Integrante 1 — Contexto, problema e objetivo

**Falar sobre:** demanda da empresa, ensaio de até 50 dispositivos, limitações atuais e objetivo do retrofit.

**Mensagem principal:** “O ensaio pode continuar por horas sem indicar qual dispositivo falhou nem em que momento. Nosso objetivo é modernizar a cabine para monitorar, registrar e tornar o processo mais confiável.”

**Deve saber responder:**

* **Por que o problema é relevante?** Porque até 50 dispositivos podem permanecer energizados durante horas. Se uma unidade falhar e ninguém perceber, o ensaio pode ser descartado e não será possível determinar com precisão quando a falha ocorreu.
* **Quem utiliza a solução?** A equipe responsável pelos ensaios térmicos de dispositivos eletrônicos. O operador configura e acompanha o ensaio, enquanto a manutenção utiliza os registros para investigar ocorrências.
* **Por que não trocar a cabine inteira?** Porque a estrutura térmica e a infraestrutura existente podem ser aproveitadas. O retrofit acrescenta monitoramento e supervisão com custo e risco menores do que construir uma câmara industrial nova.
* **Qual é o objetivo em uma frase?** Controlar o ciclo térmico e identificar, registrar e comunicar rapidamente quando uma posição de ensaio deixa de apresentar o consumo esperado.

#### Integrante 2 — Arquitetura elétrica e segurança

**Falar sobre:** alimentação, painel, proteções, relé de selo, intertravamentos, parada de emergência, contatores, segregação e aterramento.

**Mensagem principal:** “A segurança foi projetada em hardware. O comando de emergência interrompe o acionamento mesmo se houver falha no programa ou na comunicação.”

**Deve saber responder:**

* **Qual é a diferença entre força e comando?** O circuito de força conduz a energia das cargas, como drivers, Peltier e PTC. O circuito de comando usa sinais e 24 V CC para decidir quando a potência pode ser habilitada, sem transportar a corrente principal das cargas.
* **Como funciona o selo?** O operador pressiona o botão LIGAR. O KM1 energiza e fecha um contato auxiliar em paralelo com o botão, mantendo a bobina alimentada depois que o botão é solto. Ao pressionar STOP ou EMERGÊNCIA, a bobina cai, o selo abre e a máquina só volta com um novo comando LIGAR.
* **Por que a emergência não depende do ESP32 ou do Arduino?** O cogumelo e o STOP ficam em série com a bobina do KM1. Ao abrir essa cadeia, a potência é interrompida mesmo que o firmware esteja travado ou a rede esteja indisponível. O software pode solicitar uma parada, mas não consegue manter a máquina ligada contra a cadeia física.
* **Qual é a função da fonte de 24 V CC?** Alimentar o comando, as bobinas e os elementos de interface com uma tensão adequada ao painel didático, separando essa função da alimentação das cargas de potência.
* **Como as normas entram no projeto?** A NR-10 orienta os procedimentos e a autorização para trabalho com eletricidade. A NBR 5410 orienta a instalação de baixa tensão, incluindo proteção, condutores, separação e aterramento. A aplicação real ainda precisa ser conferida por profissional responsável.

#### Integrante 3 — Controle térmico e instrumentação

**Falar sobre:** pastilhas Peltier, sensores de temperatura, sensores de corrente, drivers, PWM e malha fechada.

**Mensagem principal:** “A temperatura é controlada por realimentação, enquanto a corrente revela se cada dispositivo continua operando.”

**Deve saber responder:**

* **Por que usar Peltier na maquete?** Porque permite demonstrar aquecimento e resfriamento em escala reduzida, sem compressores industriais. Ela valida a lógica do controle e da instrumentação, mas não representa automaticamente a capacidade térmica de uma cabine real.
* **O que o PWM faz?** O PWM liga e desliga o semicondutor em alta frequência para controlar a potência média entregue à carga. Neste projeto é usado PWM de 20 kHz; o BTS7960 faz o chaveamento de potência e o microcontrolador define o comando.
* **Por que o lado quente precisa de dissipação e cooler?** A Peltier transfere calor e também produz calor próprio. Sem dissipador e ventilação, a temperatura do lado quente sobe, o rendimento cai e o módulo pode ser danificado. Por isso o firmware monitora os tacômetros e desliga em caso de cooler parado.
* **Como a corrente revela uma falha?** O sinal IS dos drivers permite comparar a corrente medida com o estado esperado. Se o comando está ativo, mas a corrente permanece muito baixa ou desaparece, pode haver dispositivo desconectado, atuador queimado ou falha no circuito.
* **Quais sensores medem o quê?** O AM2315C mede temperatura e umidade dentro da câmara. Os DS18B20 ficam associados ao dissipador do lado quente para controlar a pós-ventilação. Os sinais de RPM verificam a rotação dos coolers e os sinais IS verificam a corrente dos atuadores.

#### Integrante 4 — Firmware, conectividade e dados

**Falar sobre:** ESP32, interface local, alarmes, RTC, cartão SD, Wi-Fi/MQTT e futura dashboard.

**Mensagem principal:** “O ESP32 coordena sensores e atuadores, registra os eventos e permite supervisão remota, sem tornar a comunicação um ponto único de falha.”

**Deve saber responder:**

* **O que ocorre sem Wi-Fi?** O controle local, os sensores, os intertravamentos e as paradas continuam funcionando. A comunicação remota fica indisponível, mas a falha de rede não deve deixar a Peltier ligada nem impedir uma parada segura.
* **Quais dados são registrados?** O sistema pode registrar data e hora do RTC, estado do ensaio, temperatura, umidade, comandos, alarmes, corrente, RPM e transições para falha ou emergência.
* **Como o sistema reduz falsos alarmes?** O firmware valida faixa e variação das leituras, verifica a comunicação dos sensores e avalia a corrente de acordo com o momento do PWM. Também diferencia uma parada solicitada pelo operador de uma perda inesperada de potência.
* **Qual é a função da máquina de estados?** Garantir que o sistema esteja em um estado definido, como BOOT, AGUARDA_START, RODANDO ou FALHA. Depois de falha ou emergência, ele volta para AGUARDA_START e não diretamente para RODANDO.
* **O que o watchdog protege?** Se o programa travar e deixar de responder, o watchdog reinicia o microcontrolador. Pull-downs nos enables dos drivers mantêm as saídas desligadas durante o reset, evitando que a proteção dependa apenas do código.

#### Integrante 5 — Viabilidade, testes e conclusão

**Falar sobre:** custos, prazo, etapas, testes de aceitação, limites, riscos e diferencial.

**Mensagem principal:** “A proposta é viável porque usa componentes comerciais, começa em bancada, preserva o sistema existente e valida o conceito antes de uma aplicação industrial.”

**Deve saber responder:**

* **Qual é a diferença entre os custos?** O kit de modernização por máquina está estimado em aproximadamente R$ 300,00, sujeito à configuração e cotação. O protótipo didático completo inclui maquete, painel, sensores, fontes e materiais de montagem, por isso a estimativa total fica abaixo de R$ 2.000,00.
* **Como os testes comprovarão o resultado?** Serão verificados o acionamento e desligamento, a resposta dos sensores, o controle do ciclo térmico, o funcionamento dos intertravamentos, a parada de emergência, a detecção de cooler parado, a simulação de dispositivo sem consumo e o registro do evento.
* **Quais pontos dependem de validação industrial?** Potência real, dissipação, dimensionamento definitivo de cabos e proteções, compatibilidade eletromagnética, calibração, adequação à cabine existente e aprovação dos responsáveis pela instalação.
* **Qual é o principal risco do projeto?** Confundir uma leitura incorreta com uma falha real ou permitir aquecimento excessivo. Por isso são necessários testes de bancada, calibração, limites de plausibilidade, monitoramento dos coolers e desligamento seguro.
* **Qual é o diferencial?** Câmaras convencionais controlam principalmente o ambiente. Esta proposta acrescenta medição individual da corrente, permitindo indicar qual posição deixou de operar e em que momento o evento foi registrado.

### 8. Conhecimento mínimo comum aos cinco integrantes

Antes da apresentação, cada integrante deve conseguir explicar sem consultar o texto:

1. **Problema:** ensaio térmico sem identificação rápida e rastreável da falha por posição.
2. **Solução:** retrofit com painel, ESP32, controle térmico e sensores individuais de corrente.
3. **Fluxo:** configurar, medir, controlar, detectar, registrar e comunicar.
4. **Segurança:** parada de emergência e intertravamentos físicos não dependem somente do firmware.
5. **Custos:** aproximadamente R$ 300,00 para o kit de modernização e abaixo de R$ 2.000,00 para o protótipo completo.
6. **Limite:** a maquete valida o conceito, mas a cabine real exige dimensionamento e aprovação específicos.
7. **Diferencial:** informar qual dispositivo falhou e quando, e não apenas controlar a temperatura interna.

### 9. Encerramento sugerido

“Concluímos que o projeto é viável técnica e economicamente porque moderniza uma estrutura existente, utiliza componentes comerciais e pode ser validado por etapas. Ele integra comandos elétricos, proteção, instalações, instrumentação, automação e programação. O resultado esperado é um ensaio térmico mais seguro, rastreável e capaz de indicar rapidamente qual dispositivo apresentou falha.”

