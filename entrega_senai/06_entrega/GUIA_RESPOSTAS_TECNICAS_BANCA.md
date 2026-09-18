# GUIA DE BOLSO TÉCNICO — PREPARAÇÃO PARA A BANCA
> **Objetivo:** Nivelar o conhecimento técnico de todos os membros do grupo. Se a banca fizer perguntas aprofundadas sobre como as tecnologias do nosso projeto funcionam, qualquer integrante deve ser capaz de responder usando os conceitos e analogias deste documento.

---

## 1. NORMAS E ENSAIOS

### O que é a IEC?
**IEC** significa *International Electrotechnical Commission* (Comissão Eletrotécnica Internacional). É a organização mundial responsável por criar as normas internacionais para tudo que envolve eletricidade, eletrônica e tecnologias relacionadas. 
* **Analogia:** Assim como a ABNT cria regras para o Brasil, a IEC cria as regras globais.

### O que diz a norma IEC 60068-2 (e a 60068-2-14)?
A família **IEC 60068-2** padroniza como testar equipamentos eletrônicos contra condições ambientais extremas (calor, frio, umidade, vibração).
A sub-norma do nosso projeto é a **IEC 60068-2-14**, que trata de **Ciclagem Térmica** (mudanças rápidas ou graduais entre frio e calor). 
* **Por que importa:** Ela garante que os testes feitos na nossa cabine sigam um padrão mundial, simulando o envelhecimento e o estresse que a placa vai sofrer na vida real. Descobre falhas como solda trincando (fadiga) ou componentes descolando.

### O que é "Burn-in" e "HTOL"?
São termos industriais da área de fiabilidade. 
* **Burn-in** (Envelhecimento Precoce) significa colocar a placa para funcionar sob estresse térmico na fábrica para forçar os componentes defeituosos a quebrarem antes de irem para o cliente. É o foco da nossa câmara.
* **HTOL** (*High Temperature Operating Life*) é o teste contínuo no limite de temperatura (ex: 125ºC) por milhares de horas com o componente energizado (Norma JESD22).

### O que é "Thermal Runaway" (Fuga Térmica)?
Semicondutores muito quentes geram "corrente de fuga". Essa corrente extra gera calor extra (Efeito Joule), que por sua vez gera ainda mais corrente. É um ciclo que derrete a placa. 
* **Por que importa:** Se a nossa câmara não retirar ativamente o calor que a *própria placa sob teste* está gerando, a placa entra em fuga térmica e é destruída por nossa culpa. É por isso que a câmara não apenas aquece, mas também **resfria ativamente**.

---

## 2. REDES E COMUNICAÇÃO INDUSTRIAL

### O que é RS-485?
É um padrão **FÍSICO** (elétrico) de comunicação serial. Ele usa dois fios (A e B) transmitindo o mesmo sinal de forma invertida (sinal diferencial).
* **Vantagem:** É extremamente resistente a ruídos e interferências eletromagnéticas (comum em chãos de fábrica) e alcança longas distâncias (até 1.200 metros).

### O que é Modbus?
É um **PROTOCOLO** de comunicação. É a linguagem, a regra de como os dados são organizados (quem é o Mestre, quem são os Escravos, como perguntar a temperatura, como responder).

### Modbus e RS-485 são a mesma coisa? (PERGUNTA CLÁSSICA DE BANCA)
**NÃO!** Eles trabalham juntos, mas são coisas diferentes.
* **Analogia:** Pense numa ligação telefônica. 
  * O **RS-485** é o **telefone e o cabo de cobre** (o meio físico por onde o som viaja).
  * O **Modbus** é o **idioma Português** (a regra de quem fala, quem escuta e como as frases são formadas).
  * Você pode falar Modbus através de um cabo RS-485 (Modbus RTU) ou através de um cabo de rede de internet (Modbus TCP/IP).

### O que é MQTT?
*Message Queuing Telemetry Transport*. É um protocolo de comunicação extremamente leve, criado para **Internet das Coisas (IoT)**. 
Ele não liga equipamentos diretamente um ao outro; ele usa um "Corretor" (Broker). O ESP32 *publica* a temperatura no Broker, e a Dashboard *assina* para receber essa informação.
* **Por que no nosso projeto?** Porque permite monitoramento em tempo real pelo celular/internet gastando pouquíssima banda de rede.

---

## 3. CONTROLE E AUTOMAÇÃO

### O que é PID?
**P**roporcional, **I**ntegral, **D**erivativo. É um **algoritmo matemático de controle** (software).
Ele calcula o *erro* (a diferença entre a temperatura que queremos e a temperatura que está agora) e decide quanta potência aplicar para corrigir isso sem passar do ponto.
* **P (Proporcional):** Dá um empurrão forte se o erro for grande.
* **I (Integral):** Corrige aquele errinho pequeno que sobra e não quer ir embora.
* **D (Derivativo):** Puxa o freio se a temperatura estiver mudando rápido demais, evitando o "overshoot" (passar do alvo).

### O que é PWM?
*Pulse Width Modulation* (Modulação por Largura de Pulso). É uma técnica de **hardware/eletrônica**. 
Como o Arduino só sabe ligar (5V) ou desligar (0V), não tem como ele mandar "meia potência". O PWM resolve isso ligando e desligando o pino muito rápido. Se ficar ligado 50% do tempo e desligado 50% do tempo de forma ultrarrápida (20 mil vezes por segundo no nosso projeto), a pastilha Peltier "enxerga" isso como 50% da potência.

### PWM e PID são a mesma coisa? (OUTRA PERGUNTA CLÁSSICA)
**NÃO!** Um é o cérebro, o outro é o músculo.
* **O PID é quem PENSA:** "A temperatura está 5 graus abaixo do alvo, preciso de 60% de potência para corrigir."
* **O PWM é quem EXECUTA:** "Recebi a ordem de 60%, vou piscar o circuito de potência numa proporção de 60% do tempo ligado e 40% desligado."

---

## 4. COMANDOS ELÉTRICOS E PROTEÇÕES

### Por que os botões de emergência e parada são "NF" (Normalmente Fechados)?
Parece contraintuitivo o botão dar passagem de corrente quando está solto e cortar quando apertado. Mas isso é um conceito chamado **Fail-Safe** (Falha Segura).
* **Explicação:** Se o fio do botão arrebentar com o tempo, o circuito abre (como se alguém tivesse apertado o botão) e a máquina para. A falha leva ao estado seguro. Se ele fosse NA (Normalmente Aberto), um fio partido não faria nada, e a máquina não pararia no dia em que alguém precisasse bater no botão.

### O que é "Intertravamento"?
É uma regra (física ou de software) que impede que duas ações conflitantes aconteçam ao mesmo tempo. 
* **No nosso projeto:** Temos intertravamento entre a Pastilha Peltier (frio) e o PTC (calor). Eles nunca podem ligar juntos, senão brigariam, gastando energia à toa e podendo danificar o sistema.

### Qual a diferença entre Contator (KM1) e Relé de Interface?
Ambos são chaves eletromagnéticas (uma bobina que puxa um contato), mas têm propósitos diferentes:
* **Relé de Interface:** É pequeno, lida com correntes baixas. Serve para o Arduino (que é fraco, 5V) conseguir comandar algo de 24V sem queimar a placa. É uma "ponte" entre o mundo microcontrolado e o mundo industrial.
* **Contator (KM1):** É robusto, aguenta correntes altas e os picos de partida (no nosso caso, as cargas pesadas de 24V). É ele que corta a energia real de todo o painel quando a emergência é acionada.

---

## 5. CONCEITOS DO NOSSO HARDWARE

### Como funciona o Sensor de Efeito Hall (WCS2702)?
O diferencial do nosso projeto é detectar se a placa falhou, e fazemos isso medindo a corrente. O Sensor Hall mede o **campo magnético** gerado pelo fio da placa. 
* **Vantagem:** Não precisamos cortar o fio nem desencapar (não invasivo). A corrente passa e o sensor acusa "tem corrente" (placa viva) ou "corrente zero" (placa morreu).

### O que é um "Watchdog"?
Traduzindo: Cão de Guarda. É um temporizador de hardware dentro do Arduino. 
* **Para que serve:** Se o código do Arduino travar (entrar num loop infinito ou bugar), ele para de avisar o Watchdog. Se o Watchdog ficar 2 segundos sem receber sinal de vida do código, ele **reseta o Arduino fisicamente**. Isso impede que a máquina fique ligada aquecendo eternamente por culpa de um travamento.

### Por que usamos "Relé de Selo" e botoeiras físicas em vez de só software?
Porque é a exigência da **Norma NR-12** (Segurança de Máquinas). Um botão de emergência **nunca** pode depender de software (pois o software pode travar). O relé de selo é um circuito de **hardware puro**: se bater na emergência, ou se faltar luz, o relé abre fisicamente e desliga a energia da potência. A máquina não volta a ligar sozinha; requer que um operador aperte o botão verde de novo.

