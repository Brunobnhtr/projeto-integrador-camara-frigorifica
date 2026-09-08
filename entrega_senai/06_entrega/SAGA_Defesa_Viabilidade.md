# Defesa de Viabilidade do Projeto (Para Plataforma SAGA SENAI)

> **Objetivo:** Texto curto e direto para convencer a banca avaliadora no sistema SAGA de que o projeto da Câmara Climatizada é **viável** para execução e **aplica os conhecimentos do curso Técnico em Eletrotécnica**.

---

### Título do Projeto: Modernização e Supervisão Inteligente para Cabine Climatizada de Ensaios Térmicos

### 1. Viabilidade do Projeto

O projeto é totalmente viável de ser executado dentro do prazo e orçamento do curso técnico, pois baseia-se no conceito de **"Retrofit" (modernização)**. Não será necessário construir uma câmara industrial do zero com compressores industriais: o protótipo utiliza uma maquete funcional em extra-baixa tensão (24 Vcc SELV) com pastilhas Peltier para validar toda a lógica de controle, instrumentação e supervisão.

Todos os componentes necessários são amplamente comerciais e facilmente encontrados no mercado nacional: fonte chaveada 24 V, disjuntor bipolar, conversores step-down LM2596, Arduino Mega 2560 em adaptador DIN, módulo ESP32 com antena externa, tela IHM ES3C28P com SD integrado, drivers BTS7960, sensores de corrente ACS712-5A, módulo ADC Modbus RS-485, sensores de temperatura DS18B20 e AM2315C, relés de interface, botoeiras industriais 22 mm e sinaleiros LED de 5 V. O custo total do protótipo didático completo está estimado abaixo de **R$ 2.000,00**, e o kit de modernização por máquina na indústria fica em aproximadamente **R$ 300,00**.

### 2. Aderência ao Curso de Eletrotécnica

Este projeto não é apenas programação; ele exige a aplicação prática de diversas disciplinas fundamentais do curso de **Eletrotécnica**:

* **Comandos Elétricos e Proteção:** O coração da segurança do projeto está na cadeia de comando em hardware. O relé KM1 opera com selo elétrico retentivo: o botão LIGAR refaz o selo e o botão STOP ou o cogumelo de EMERGÊNCIA o derrubam fisicamente, cortando a potência mesmo com o firmware travado. A emergência possui dois blocos de contato (um que corta os 24 V da bobina em hardware e outro que sinaliza ao Arduino em 5 V), garantindo redundância. Os relés auxiliares KA1, KA2 e KA3 possuem resistores de pull-down de 10 kΩ nos gatilhos, assegurando estado seguro na ausência de sinal do Arduino (potência cortada e ventoinhas do radiador girando via contato NF).

* **Projetos Elétricos:** O desenvolvimento inclui diagramas unifilares e funcionais, layout mecânico do painel de comando (700 × 500 × 200 mm com 3 trilhos DIN, 6 canaletas segregadas entre sinal e potência), cotação de todos os componentes e identificação dos 126 fios por nomenclatura padronizada. Toda a documentação é verificável no aplicativo do painel interativo, onde se pode clicar em cada componente e conferir borne por borne.

* **Instalações Elétricas Industriais:** Dimensionamento correto de condutores (1,5 mm² no retorno, 1,0 mm² na potência, 0,5 mm² nos sinais), proteção com disjuntor bipolar 6 A curva C na entrada CA, 3 fusíveis de ramal com seletividade (F1 = 10 A, F2 e F3 = 2 A), cálculo de queda de tensão na linha dos postes (0,21 V / 0,86%) e verificação de folga da fonte de 240 W (fator de 1,36×).

* **Instrumentação e Automação Industrial:** Leitura de sensores de temperatura (DS18B20 via 1-Wire e AM2315C via I2C), monitoramento de corrente por efeito Hall (ACS712-5A digitalizados por módulo ADC Modbus RTU via barramento RS-485), controle térmico em malha fechada PID com PWM de 20 kHz nos drivers BTS7960, e supervisão remota via protocolo MQTT sobre Wi-Fi.

* **Redes de Comunicação Industrial:** O barramento RS-485 Modbus RTU conecta os sensores de corrente ao ESP32 (Mestre Modbus), demonstrando na prática o mesmo protocolo utilizado em CLPs e sistemas SCADA da indústria. A arquitetura foi documentada em escala (2 posições na maquete → 50 posições na fábrica) para provar que a solução é modular e industrialmente escalável.

**Resumo:** O projeto entrega inovação em conectividade (IoT) e rastreabilidade de falhas, ancorado inteiramente nas normas, segurança e montagem física ensinadas na eletrotécnica clássica.

### 3. Problema que o projeto resolve

A empresa realiza ensaios térmicos em até 50 dispositivos eletrônicos energizados simultaneamente dentro de uma cabine climatizada. O sistema atual permite executar ciclos de aquecimento e resfriamento, porém possui pouca conectividade, registro limitado e não informa rapidamente **qual** dispositivo parou de funcionar durante o ensaio, nem **quando** isso aconteceu.

Quando uma unidade falha sem ser percebida, o problema pode ser identificado somente ao final do ciclo (que pode durar horas). Isso dificulta saber o momento exato da falha, aumenta o tempo de diagnóstico e pode causar o descarte de horas de ensaio. A proposta transforma esse processo em um ensaio **monitorado, rastreável e mais seguro**.

### 4. Como a solução funciona

O projeto é um **retrofit**: moderniza a infraestrutura existente sem exigir a construção de uma câmara industrial nova. O protótipo utiliza uma maquete funcional com pastilhas Peltier para representar o controle térmico e um painel didático industrial para demonstrar a lógica elétrica e de automação.

**Arquitetura de três processadores em estrela:**

* **Arduino Mega 2560 (centro):** Executa a malha fechada PID em tempo real, controla os drivers de potência BTS7960 por PWM de 20 kHz, lê os sensores críticos (temperatura, RPM dos coolers, corrente dos drivers) e gerencia todas as proteções e intertravamentos. É o árbitro central que decide quando ligar, desligar e disparar alarmes.

* **ESP32 + DNLCB30 (supervisão):** Gateway Wi-Fi e Mestre Modbus RTU. Interroga o módulo ADC RS-485 a cada 1 segundo para ler a corrente dos ACS712 nas posições de ensaio, publica telemetria JSON via MQTT a 1 Hz e recebe comandos remotos. Se a corrente de uma posição cai abaixo de 50 mA com o ensaio rodando, envia comando de intertravamento prioritário ao Arduino (`FALHA_DUT`).

* **ESP32-S3 com tela ES3C28P (IHM):** Interface gráfica local touchscreen onde o operador configura e inicia o ensaio. Grava o log completo de eventos no cartão microSD integrado com carimbo de tempo do RTC.

> ⛔ **Decisão de segurança:** O comando START por MQTT é bloqueado. Comandos remotos só podem levar a máquina ao estado seguro (STOP, mudança de setpoint). Para energizar, o operador precisa estar fisicamente na frente do equipamento.

**Fluxo de funcionamento:**

1. O operador configura o ensaio pela tela IHM touchscreen (setpoint, tempo).
2. O Arduino Mega executa o ciclo térmico em malha fechada PID.
3. Os drivers BTS7960 acionam as pastilhas Peltier (frio) ou o PTC (calor) por PWM de 20 kHz.
4. Os sensores ACS712 medem individualmente a corrente de cada posição de ensaio. Os dados são digitalizados pelo módulo ADC Modbus e lidos pelo ESP32 via RS-485.
5. Se a corrente de uma posição cai a zero (lâmpada queimada, fusível aberto, fio partido), o sistema gera alarme em menos de 2 segundos, identifica **qual** posição falhou e registra o evento com data/hora.
6. Todos os dados (temperatura, umidade, correntes, RPMs, alarmes, estado da máquina) são registrados localmente no SD e transmitidos via Wi-Fi/MQTT para dashboard remoto.

**Quatro níveis de proteção no firmware:**
1. **RPM dos coolers:** Se ventoinha do radiador cair abaixo de 400 RPM com resfriamento ativo, dispara trip imediato.
2. **Diagnóstico de corrente:** Se duty > 50% e corrente < 0,5 A → carga aberta. Se corrente > 8 A → sobrecorrente.
3. **Driver colado:** Se comando desligado mas há corrente > 0,5 A → MOSFET em curto (detecta antes que a temperatura fuja).
4. **Conferência de corte físico:** Após mandar cortar potência, confere o pino D25. Se 24 V ainda presentes → relé com contato soldado.

### 5. Viabilidade técnica, econômica e de prazo

A solução utiliza componentes comerciais disponíveis no mercado nacional: Arduino Mega 2560, ESP32, sensores de temperatura (DS18B20 e AM2315C), sensores de corrente por efeito Hall (ACS712-5A), módulo ADC Modbus 2CH, conversores MAX485, fonte chaveada 24 V 240 W, conversores step-down LM2596, relés de interface, drivers de potência BTS7960, botoeiras industriais 22 mm, cogumelo de emergência, tela IHM ES3C28P com SD integrado e módulo RTC DS3231. Isso reduz a dependência de peças especiais e facilita a manutenção.

O desenvolvimento foi dividido em **5 camadas de construção** (Fundamentos → Maquete → Painel → Elétrica → Programação → Integração), permitindo encontrar problemas cedo e preservar a continuidade operacional do sistema atual.

O custo estimado do kit de modernização por máquina é de aproximadamente **R$ 300,00**, sujeito à cotação e à configuração final. O protótipo didático completo, com painel, maquete, câmara térmica, sensores, fontes e materiais de montagem, permanece estimado abaixo de **R$ 2.000,00**. O projeto cabe no prazo do curso por aproveitar materiais comerciais e módulos independentes.

**Escalabilidade documentada:** O documento técnico "Maquete vs. Indústria" (Doc 04) demonstra componente por componente como o protótipo didático migra para uma planta industrial real, substituindo módulos genéricos por equivalentes industriais robustos (Arduino Portenta Machine Control, TCs Split-Core, fontes Phoenix Contact QUINT, IHMs WEG MT8000, painéis Rittal IP65) sem alterar a arquitetura lógica nem o firmware.

### 6. Limites, riscos e validação

O protótipo não pretende reproduzir toda a capacidade térmica de uma câmara industrial. Ele valida a arquitetura, a lógica de controle, a medição individual por posição e a integração entre painel, sensores e supervisão. A aplicação em uma cabine real exigirá nova verificação de potência, dissipação térmica, compatibilidade eletromagnética, calibração e aprovação dos responsáveis.

Os principais riscos e suas mitigações são:

| Risco | Mitigação |
|---|---|
| Atraso na aquisição de componentes | Usar componentes equivalentes; projeto modular permite testes parciais |
| Leituras imprecisas dos sensores | Calibração em bancada, filtros de software e limites de plausibilidade |
| Aquecimento excessivo no dissipador | Monitoramento de RPM dos coolers com trip automático; contato NF do KA2 (fail-safe) |
| Falha de comunicação Wi-Fi | Filosofia offline-first: controle local, log em SD e proteções continuam sem rede |
| Relé com contato soldado | Conferência automática de corte via pino D25 após comando de desligamento |
| Falso alarme de dispositivo morto | Validação de faixa e variação das leituras; diferencia parada solicitada de perda inesperada |

Ao final, os testes deverão demonstrar: um ciclo térmico controlado em malha fechada, acionamento protegido com selo e emergência em hardware, identificação da posição que deixou de consumir corrente, registro do evento com carimbo de tempo e apresentação do estado do ensaio na IHM local e no dashboard remoto.

### 7. Divisão da apresentação entre cinco integrantes

Cada fala pode durar aproximadamente **1 a 2 minutos**. Os nomes devem ser preenchidos pelo grupo. A divisão organiza as falas, mas não separa o conhecimento: todos devem estudar as sete respostas da seção 9.

#### Integrante 1 — Contexto, problema e objetivo

**Falar sobre:** demanda da empresa, ensaio de até 50 dispositivos, limitações atuais e objetivo do retrofit.

**Mensagem principal:** "O ensaio pode continuar por horas sem indicar qual dispositivo falhou nem em que momento. Nosso objetivo é modernizar a cabine para monitorar individualmente cada posição, registrar os eventos e tornar o processo rastreável."

**Deve saber responder:**

* **Por que o problema é relevante?** Porque até 50 dispositivos podem permanecer energizados durante horas. Se uma unidade falhar e ninguém perceber, o ensaio pode ser descartado e não será possível determinar com precisão quando a falha ocorreu.
* **Quem utiliza a solução?** A equipe responsável pelos ensaios térmicos de dispositivos eletrônicos. O operador configura e acompanha o ensaio pela IHM touchscreen, enquanto a manutenção utiliza os registros no SD e no dashboard MQTT para investigar ocorrências.
* **Por que não trocar a cabine inteira?** Porque a estrutura térmica e a infraestrutura existente podem ser aproveitadas. O retrofit acrescenta monitoramento e supervisão com custo e risco menores do que construir uma câmara industrial nova.
* **Qual é o objetivo em uma frase?** Controlar o ciclo térmico e identificar, registrar e comunicar rapidamente quando uma posição de ensaio deixa de apresentar o consumo esperado.

#### Integrante 2 — Arquitetura elétrica e segurança

**Falar sobre:** alimentação 24 Vcc, 3 ramais com fusíveis seletivos, painel de 700 mm com 3 trilhos DIN, proteções, relé de selo KM1, intertravamentos em hardware, parada de emergência, resistores de pull-down nos enables e segregação de potência e sinal.

**Mensagem principal:** "A segurança foi projetada em hardware. O comando de emergência interrompe o acionamento mesmo se houver falha no programa ou na comunicação. Cada componente crítico possui uma proteção que não depende de software."

**Deve saber responder:**

* **Qual é a diferença entre força e comando?** O circuito de força conduz a energia das cargas (drivers BTS7960, Peltier, PTC). O circuito de comando usa sinais de 5 V e 24 Vcc para decidir quando a potência pode ser habilitada, sem transportar a corrente principal das cargas.
* **Como funciona o selo?** O operador pressiona o botão LIGAR. O KM1 energiza e fecha um contato auxiliar em paralelo com o botão, mantendo a bobina alimentada depois que o botão é solto. Ao pressionar STOP ou EMERGÊNCIA, a bobina cai, o selo abre e a máquina só volta com um novo comando LIGAR.
* **Por que a emergência não depende do ESP32 ou do Arduino?** O cogumelo S0 e o STOP S2 ficam em série com a bobina do KM1. Ao abrir essa cadeia, a potência é interrompida mesmo que o firmware esteja travado ou a rede esteja indisponível. O software pode solicitar uma parada via KA1, mas não consegue manter a máquina ligada contra a cadeia física.
* **O que acontece se o Arduino perder energia ou travar?** Os resistores de pull-down de 10 kΩ nos enables dos BTS7960 e nos gatilhos dos módulos de relé garantem que, sem sinal ativo do Arduino, a potência é cortada (KA1 abre) e as ventoinhas do radiador continuam girando (KA2 é NF). O watchdog de 2 segundos reinicia o microcontrolador automaticamente.
* **Como as normas entram no projeto?** A NR-10 orienta os procedimentos e a autorização para trabalho com eletricidade. A NBR 5410 orienta a instalação de baixa tensão, incluindo proteção, condutores, separação e aterramento. A aplicação real ainda precisa ser conferida por profissional responsável.

#### Integrante 3 — Controle térmico e instrumentação

**Falar sobre:** pastilhas Peltier em série a 24 V, sensores de temperatura, sensores de corrente ACS712, módulo ADC Modbus RS-485, drivers BTS7960, PWM de 20 kHz e malha fechada PID.

**Mensagem principal:** "A temperatura é controlada por realimentação PID, enquanto os sensores de corrente ACS712 revelam se cada dispositivo continua operando. O dado viaja por RS-485, o mesmo barramento usado na indústria."

**Deve saber responder:**

* **Por que usar Peltier na maquete?** Porque permite demonstrar aquecimento e resfriamento em escala reduzida, sem compressores industriais. Ela valida a lógica do controle e da instrumentação, mas não representa automaticamente a capacidade térmica de uma cabine real.
* **Por que as duas Peltier estão em série?** Porque a fonte é de 24 V. Em série, cada pastilha recebe 12 V (sua tensão nominal). Em paralelo, cada uma puxaria 6 A e o circuito precisaria de 12 A, inviável para os fios e fusíveis dimensionados.
* **O que o PWM de 20 kHz faz?** O PWM liga e desliga o semicondutor em alta frequência para controlar a potência média entregue à carga. Os 20 kHz eliminam a fadiga microtérmica nas junções da Peltier (que ocorreria com PWM lento de 490 Hz) e são inaudíveis ao ouvido humano.
* **Por que o lado quente precisa de dissipação e cooler?** A Peltier transfere calor e também produz calor próprio. Sem dissipador e ventilação, a temperatura do lado quente sobe, o rendimento cai e o módulo pode ser danificado. Por isso o firmware monitora os tacômetros de 3 fios e desliga em caso de cooler parado.
* **Como a corrente revela uma falha no dispositivo sob teste?** Os sensores ACS712-5A medem a corrente que passa pela lâmpada W5W de cada posição. O módulo ADC Modbus digitaliza essa leitura e o ESP32 interroga via RS-485 a cada 1 segundo. Se a corrente cai de 208 mA para zero (fusível aberto, fio partido ou lâmpada queimada), o ESP32 detecta e dispara alarme `FALHA_DUT`, identificando qual posição falhou e em que instante.
* **Quais sensores medem o quê?** O AM2315C (I2C) mede temperatura e umidade dentro da câmara. O DS18B20 (1-Wire) fica no dissipador do lado quente para monitorar a pós-ventilação. Os sinais de RPM (tacômetros de 3 fios em D3/A8) verificam a rotação dos coolers. Os ACS712 verificam a corrente das posições de ensaio via ADC Modbus RS-485. Os pinos IS dos BTS7960 (A0/A1) medem a corrente dos atuadores térmicos.

#### Integrante 4 — Firmware, conectividade e dados

**Falar sobre:** arquitetura de 3 processadores, máquina de estados do Arduino, Mestre Modbus RTU no ESP32, IHM touchscreen, RTC, cartão SD, Wi-Fi/MQTT, filosofia offline-first e decisão de bloquear START remoto.

**Mensagem principal:** "O Arduino controla o PID em tempo real, o ESP32 cuida da rede e do Modbus, e a tela grava o log. Se a rede cair, tudo continua funcionando localmente. E o START remoto é bloqueado por decisão de projeto: para ligar, alguém precisa estar na frente da máquina."

**Deve saber responder:**

* **Por que três processadores separados?** Porque cada um tem uma responsabilidade diferente e um tempo de resposta diferente. O Arduino precisa manter o PID a 1 Hz sem ser interrompido pelo Wi-Fi. O ESP32 precisa gerenciar conexão MQTT e Modbus sem prejudicar o controle. E a tela ES3C28P precisa renderizar a interface gráfica e gravar no SD sem travar.
* **O que ocorre sem Wi-Fi?** O controle local, os sensores, os intertravamentos e as paradas continuam funcionando normalmente. O log continua sendo gravado no SD da IHM. A comunicação remota fica indisponível, mas a falha de rede nunca deixa a Peltier ligada nem impede uma parada segura.
* **Quais dados são registrados?** Data e hora do RTC (DS3231), estado do ensaio, temperatura e umidade da câmara, setpoint, modo de operação, duty cycle do PWM, correntes dos atuadores e das posições de ensaio, RPMs dos coolers, alarmes e transições de estado.
* **Qual é a função da máquina de estados?** Garantir que o sistema esteja sempre em um estado definido: `BOOT → AGUARDA_START ↔ RODANDO → FALHA / EMERGENCIA`. Depois de falha ou emergência, ele volta obrigatoriamente para `AGUARDA_START` e nunca religa diretamente.
* **Por que o START por MQTT é proibido?** Porque comandos que levam a máquina ao estado energizado devem ser dados localmente, com o operador na frente do equipamento, podendo verificar que não há ninguém dentro da câmara ou perto dos atuadores. Comandos remotos só podem levar ao estado seguro (STOP, mudança de setpoint, reconhecimento de alarme).

#### Integrante 5 — Viabilidade, escalabilidade, testes e conclusão

**Falar sobre:** custos, prazo, etapas em 5 camadas, testes de aceitação, escalabilidade industrial (Doc 04), limites, riscos e diferencial.

**Mensagem principal:** "A proposta é viável porque usa componentes comerciais, começa em bancada, preserva o sistema existente e valida o conceito antes de uma aplicação industrial. E documentamos componente por componente como a maquete migra para a fábrica real."

**Deve saber responder:**

* **Qual é a diferença entre os custos?** O kit de modernização por máquina está estimado em aproximadamente R$ 300,00, sujeito à configuração e cotação. O protótipo didático completo inclui maquete, painel, câmara, sensores, fontes e materiais de montagem, por isso a estimativa total fica abaixo de R$ 2.000,00.
* **Como o projeto escala para 50 posições na fábrica?** Substituem-se os ACS712 invasivos por TCs Split-Core não invasivos, o módulo ADC de 2 canais por módulos industriais de 8 ou 16 canais em daisy-chain RS-485, e o Arduino Mega por um controlador unificado como o Arduino Portenta Machine Control (com RTC, Ethernet, RS-485 e SD nativos). A arquitetura Modbus e o firmware permanecem idênticos.
* **Como os testes comprovarão o resultado?** Serão verificados: acionamento e desligamento com selo, resposta dos sensores, ciclo térmico PID, intertravamentos, parada de emergência em hardware, detecção de cooler parado, simulação de dispositivo morto (retirada do fusível ou da lâmpada), registro do evento com carimbo de tempo e publicação no dashboard MQTT.
* **Quais pontos dependem de validação industrial?** Potência real, dissipação, dimensionamento definitivo de cabos e proteções, compatibilidade eletromagnética, calibração dos TCs industriais, adequação à cabine existente e aprovação dos responsáveis pela instalação.
* **Qual é o principal risco do projeto?** Confundir uma leitura incorreta com uma falha real ou permitir aquecimento excessivo. Por isso são necessários testes de bancada, calibração, limites de plausibilidade, monitoramento dos coolers e desligamento seguro por hardware.
* **Qual é o diferencial?** Câmaras convencionais controlam apenas a temperatura ambiente. Esta proposta acrescenta medição individual da corrente por posição de ensaio via barramento industrial RS-485, permitindo indicar qual dispositivo falhou e em que momento o evento foi registrado — com rastreabilidade completa no log.

### 8. Números-chave do projeto (referência rápida)

| Grandeza | Valor |
|---|---|
| Tensão de distribuição | **24 Vcc (SELV — extra-baixa tensão)** |
| Potência da fonte | 240 W / 10 A |
| Consumo calculado | ≈ 176 W / 7,3 A (incluindo as 2 lâmpadas W5W) |
| Folga da fonte | 1,36× |
| Proteção geral AC | Disjuntor bipolar 6 A curva C |
| Fusíveis dos ramais | F1 = 10 A (potência) · F2 = 2 A (comando) · F3 = 2 A (auxiliar) |
| Queda de tensão na linha | 0,21 V (0,86%) |
| Refrigeração | 2× TEC1-12706 em série · 24 V · 6 A |
| Aquecimento | PTC cerâmico 24 V · 80 W |
| PWM | 20 kHz (Timer3 e Timer4 do Mega, 800 passos) |
| Controle PID | Kp = 8,0 · Ki = 0,2 · Kd = 1,0 · Loop de 1 Hz |
| Proteções em firmware | 4 níveis (RPM, corrente, driver colado, conferência de corte) |
| Comunicação RS-485 | Modbus RTU, polling a 1 Hz |
| Fios identificados | 126 |
| Componentes discretos | 16 registros / 22 peças, nenhuma soldada em placa |
| Painel | 700 × 500 × 200 mm · 3 trilhos DIN |
| Volume útil da câmara | 5,0 litros |
| Custo protótipo | < R$ 2.000,00 |
| Custo retrofit por máquina | ≈ R$ 300,00 |

### 9. Conhecimento mínimo comum aos cinco integrantes

Antes da apresentação, cada integrante deve conseguir explicar sem consultar o texto:

1. **Problema:** ensaio térmico de até 50 dispositivos sem identificação rápida e rastreável de qual posição falhou, nem quando.
2. **Solução:** retrofit com painel industrial, 3 processadores em estrela (Arduino PID + ESP32 Modbus/MQTT + IHM touchscreen), controle térmico PID e sensores individuais de corrente via RS-485.
3. **Fluxo:** configurar na IHM → medir → controlar em malha fechada → detectar falha por queda de corrente → registrar com carimbo de tempo → comunicar via MQTT.
4. **Segurança:** parada de emergência e intertravamentos físicos (selo KM1, pull-downs, contato NF) não dependem do firmware. START remoto é bloqueado.
5. **Custos:** aproximadamente R$ 300,00 para o kit de modernização e abaixo de R$ 2.000,00 para o protótipo completo.
6. **Escalabilidade:** a arquitetura Modbus RS-485 permite expandir de 2 para 50 posições trocando apenas os sensores (ACS712 → TC Split-Core) e os módulos ADC (2CH → 8AI industrial). A documentação Doc 04 mapeia cada componente didático ao seu equivalente industrial.
7. **Diferencial:** informar **qual** dispositivo falhou e **quando**, com rastreabilidade completa — e não apenas controlar a temperatura interna.

### 10. Encerramento sugerido

"Concluímos que o projeto é viável técnica e economicamente porque moderniza uma estrutura existente, utiliza componentes comerciais e pode ser validado por etapas. Ele integra comandos elétricos, proteção, instalações, instrumentação, automação, redes industriais e programação embarcada. O resultado esperado é um ensaio térmico mais seguro, rastreável e capaz de indicar rapidamente qual dispositivo apresentou falha — com uma arquitetura que já está documentada para escalar da maquete didática até o chão de fábrica real."
