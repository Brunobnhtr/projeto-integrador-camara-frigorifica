# CAMADA 0 · Doc 01 — Visão Geral do Projeto

> **Projeto Integrador 2026/01 · 6.01 03 — Implementação de Sistema de Controle Inteligente com ESP32 para Cabine Climatizada**
> SENAI Antônio Adolpho Lobbe · Empresa: **Ensaios & Controle Tech** · Área: Automação

---

## 🟢 Em palavras simples — o que estamos construindo, e por quê

**Imagine uma empresa que fabrica placas eletrônicas.** Antes de vender, ela precisa ter certeza de que a placa funciona tanto num galpão a 40 °C quanto numa madrugada fria. Como testar isso?

Ela coloca as placas dentro de uma **cabine climatizada** — uma caixa que esquenta e esfria sob comando —, **liga as placas** e vê se elas continuam funcionando enquanto a temperatura sobe e desce. É um *ensaio térmico*.

**O problema que a empresa tem hoje:**

| Situação atual | O que dá errado |
|---|---|
| Um Arduino controla a temperatura, e alguém liga tudo na mão | Se ninguém estiver na frente da máquina, ninguém sabe o que está acontecendo |
| Não há registro do que aconteceu durante o ensaio | Se uma placa falhou, não dá para saber **quando** nem **por quê** |
| Até 50 placas ligadas ao mesmo tempo | Se uma morre no meio do ensaio, **ninguém percebe** até o fim — e perdeu-se o teste inteiro |

**O que este projeto faz:** moderniza esse sistema. Sem desligar o que já funciona, acrescentamos um **ESP32** — um microcontrolador com Wi-Fi — que permite acompanhar o ensaio de qualquer lugar, registrar tudo que aconteceu e **detectar na hora quando uma placa para de funcionar**.

E como não podemos mexer na máquina real da empresa enquanto ela está produzindo, construímos uma **versão em escala reduzida** — uma maquete funcional que reproduz o sistema inteiro, do disjuntor de entrada até a cabine, e que serve de bancada de testes.

> 🎯 **Em uma frase:** *o projeto pega um sistema de ensaios térmicos que funciona "no escuro" e o torna visível, registrável e diagnosticável à distância — sem parar a produção.*

---

## 1.1 O que o projeto entrega

Cada item que o edital pede tem um lugar concreto no projeto:

| O que o edital pede | Como este projeto atende | Onde está |
|---|---|---|
| **Implementar o ESP32** com Wi-Fi/Bluetooth | ESP32 assume a **supervisão e o comando remoto**, em paralelo ao Arduino, sem parar o processo | [Doc 41](../camada_4_programacao/41_esp32_ihm_iot.md) |
| **Monitoramento remoto em tempo real** | Telemetria por MQTT a cada segundo · dashboard | [Doc 41](../camada_4_programacao/41_esp32_ihm_iot.md) |
| **Registro e rastreabilidade dos testes** | Log em cartão SD com data/hora do RTC · identificação de ensaio | [Doc 40](../camada_4_programacao/40_firmware_arduino.md) |
| **Controle e precisão dos ciclos de temperatura** | Malha fechada **PID** com PWM lento de 1 Hz, banda morta de ±0,3 °C | [Doc 40](../camada_4_programacao/40_firmware_arduino.md) |
| **Reduzir o tempo de diagnóstico de falhas** ⭐ | **Medição de corrente por posição de ensaio** — o sistema diz *qual* dispositivo falhou e *em que minuto* | [Doc 13](../camada_1_maquete/13_posicoes_de_ensaio.md) |
| **Reduzir riscos elétricos / melhorar a infraestrutura** ⭐ | Barramento **24 Vcc SELV**, proteção seletiva, emergência em hardware, aterramento em estrela | [Doc 02](02_arquitetura_de_energia.md) · [Doc 31](../camada_3_eletrica/31_comando_e_protecoes.md) |
| **Novos esquemas elétricos** | 7 desenhos técnicos + lista completa de cabos identificados | [`desenhos/`](../desenhos/) · [Doc 30](../camada_3_eletrica/30_forca_e_distribuicao.md) |
| **Manter a continuidade operacional** | O Arduino **não sai** — o ESP32 entra ao lado dele, com arbitragem Local/Remoto | [§1.3](#13-arquitetura-de-controle--dois-cérebros-uma-regra-clara) |
| **Conformidade com normas de segurança** | Emergência conforme ISO 13850 (trava e exige rearme) · demarcação NR-10 | [Doc 31](../camada_3_eletrica/31_comando_e_protecoes.md) |

### E por que a maquete tem subestação e postes?

Porque o edital pede **"otimizando a infraestrutura elétrica"** e **"reduzir riscos elétricos por meio de melhorias na infraestrutura"** — e infraestrutura elétrica é algo que precisa ser *mostrado* para ser avaliado.

A subestação e a linha de distribuição sobre postes representam, em escala, **de onde vem a energia que alimenta a cabine** e como ela é protegida e distribuída com seletividade. É a parte do projeto que responde "o que foi melhorado na instalação", e é o conteúdo de eletrotécnica que o curso cobra.

> 📌 **Mas a protagonista é a cabine.** A rede de distribuição é a infraestrutura que a atende — não o objetivo do projeto.

---

## 1.2 O processo controlado — a cabine climatizada

### 🟢 Em palavras simples

A cabine é uma **caixa isolada que sabe esquentar e esfriar sob comando**. Por dentro dela ficam os dispositivos sendo testados, ligados e funcionando.

Pense numa geladeira que também sabe ser forno, e que obedece a uma receita: *"suba até 50 °C, fique 20 minutos, desça até 5 °C, fique mais 20"*. Enquanto isso, quem está lá dentro tem que continuar funcionando — é isso que o ensaio verifica.

**O que faz o frio:** uma **pastilha Peltier**. É uma placa que, ao receber corrente, fica **gelada de um lado e quente do outro** — sem gás, sem compressor, sem partes móveis. O lado frio vai para dentro da cabine; o lado quente precisa de um cooler jogando o calor fora, senão ela se autodestrói.

**O que faz o calor:** um **aquecedor PTC**, que é uma resistência com uma propriedade útil — **quanto mais quente ela fica, menos corrente puxa**. Ela se limita sozinha, o que a torna muito mais segura que uma resistência comum.

---

Uma **mini câmara** capaz de **aquecer ou resfriar** um volume interno de forma controlada:

- **2× Célula Peltier TEC1-12706 ligadas em SÉRIE (24 V / 6 A / 144 W)** — resfria. Alimentadas **direto do barramento de 24 V** pelo BTS #1, sem conversor intermediário
- **Aquecedor PTC cerâmico de 24 V / 60 W** — aquece (autolimitado por natureza: a resistência sobe com a temperatura). Também **direto no barramento de 24 V**, pelo BTS #2
- **Controle PID com PWM lento (1 Hz)** — regula a potência entregue
- **Intertravamento por software** — Peltier e PTC **nunca** ligam juntas
- **Dreno de condensado** — obrigatório, item de segurança elétrica

> ⚠️ **As duas pastilhas ficam em SÉRIE, nunca em paralelo.** Em série, cada uma recebe 12 V (o nominal delas) e as duas compartilham a mesma corrente de 6 A. Em paralelo, cada pastilha receberia os 24 V inteiros — o dobro do nominal — e queima em segundos.

### Princípio térmico

| Modo | Atuador | Direção das fans internas | Caminho do ar |
|---|---|---|---|
| **Frio** | Peltier (BTS #1) | Sopram **↓** | Centro ↓ → plenum inferior → dutos laterais ↑ → retorno pelo topo |
| **Quente** | PTC (BTS #2) | Sopram **↑** | Centro ↑ → dutos pelo topo → laterais ↓ → retorno pelo plenum |

No modo quente a convecção natural **ajuda** (ar quente sobe); no modo frio ela **atrapalha** (ar frio desce e estagna), por isso a ventilação forçada é essencial nos dois casos.

---

## 1.2b ⭐ As posições de ensaio — o motivo da cabine existir

### 🟢 Em palavras simples

Uma cabine climatizada vazia não serve para nada. **O que importa é o que está dentro dela sendo testado.**

Na empresa são até **50 placas ligadas ao mesmo tempo**, todas em funcionamento, durante horas de ciclo térmico. E aí aparece o problema que ninguém resolveu:

> **Se uma dessas 50 placas morrer no meio do ensaio, como você fica sabendo?**

Hoje: não fica. Descobre no fim, quando vai conferir. Perdeu o ensaio inteiro e não sabe em que momento — nem em que temperatura — a placa parou. É justamente por isso que o edital pede *"reduzir o tempo de diagnóstico de falhas"*.

### Existem dois tipos de falha, e eles são bem diferentes

| Falha | O que acontece | Quem percebe hoje |
|---|---|---|
| **Curto-circuito** | A corrente dispara | ✅ O disjuntor abre — dá para ver |
| **O dispositivo "morre"** (abre, trava, queima uma trilha) | A corrente **cai a zero** | ❌ **Ninguém.** Nenhuma proteção atua, porque não há nada de errado do ponto de vista elétrico — simplesmente parou de consumir |

**O segundo caso é o caro.** Proteção nenhuma no mundo detecta "parou de funcionar", porque proteção existe para agir contra excesso, não contra ausência.

### A solução: medir a corrente de cada posição

Se cada posição tem a sua corrente medida o tempo todo, o sistema sabe na hora:

```
   +24 V ──[ fusível da posição ]──[ medidor ]──► DISPOSITIVO ──► 0 V
                    │                    │
              protege contra         mede a corrente
                 CURTO                     │
                                      ┌────┴─────┐
                                      │ 12 mA ✅ │ funcionando
                                      │  0 mA ❌ │ MORREU — alarme!
                                      └──────────┘
```

**Na maquete são 4 posições**, não 50 — número pequeno o bastante para caber e caber no orçamento, grande o bastante para demonstrar o problema real de *"qual delas falhou?"*.

| O que cada posição tem | Para quê |
|---|---|
| **Fusível individual** | Proteção contra curto — é o *"disjuntores para energização dos dispositivos"* do edital |
| **Sensor de corrente INA219** | Mede tensão e corrente. Detecta o dispositivo morto, que o fusível não pega |
| **Placa simuladora** (resistor + LED) | Consome corrente e gera calor: é o *"modo de simulação funcional"* do edital |

> 🎯 **O que o sistema passa a informar:** *"Posição 3 parou de consumir aos 47 min do ensaio, com a câmara a −2 °C."* Isso é rastreabilidade, e é o que transforma um ensaio "passou/não passou" em um diagnóstico.

> 📌 **Coerência com o resto do projeto:** isso não é uma ideia solta — o projeto **já faz exatamente isso com os atuadores**, pelos pinos `IS` dos BTS7960, que detectam Peltier ou PTC desconectados. As posições de ensaio estendem um princípio que já existe. Detalhes completos em [Doc 13](../camada_1_maquete/13_posicoes_de_ensaio.md).

---

## 1.3 Arquitetura de controle — dois cérebros, uma regra clara

### 🟢 Em palavras simples

Imagine um carro de autoescola: tem **dois volantes**. Um do aluno, outro do instrutor. Funciona porque existe uma regra combinada de **quem manda em cada momento** — sem essa regra, os dois puxando para lados diferentes causam acidente.

O nosso sistema é igual. Tem dois microcontroladores:

- O **Arduino** fica no painel, perto da máquina. É o "volante do aluno": controla a temperatura o tempo todo e obedece à IHM e às botoeiras.
- O **ESP32** está na rede Wi-Fi. É o "volante do instrutor": vê tudo de longe e pode assumir o comando — **mas só quando a chave permitir**.

Essa chave existe de verdade no painel, e se chama **seletora LOCAL / REMOTO**. É a peça que impede os dois de brigarem.

### Por que dois, e não um só

O edital tem uma restrição que decide isso:

> *"Manter a continuidade operacional do sistema atual durante o desenvolvimento"*

A empresa **não pode parar os ensaios** enquanto o projeto acontece. Arrancar o Arduino que já controla a cabine violaria essa restrição. Então o ESP32 **entra ao lado**, acrescentando o que faltava — rede, registro e diagnóstico — sem tocar no que já funciona.

| Unidade | Papel | Responsabilidades |
|---|---|---|
| **Arduino Mega 2560** | **Controle em tempo real e segurança** — nunca sai de cena | PID, leitura de sensores, PWM 1 Hz, monitoramento de RPM, intertravamento, trip, IHM Nextion, log em SD |
| **ESP32-WROOM-32U** (na base DNLCB30) | **Supervisão sempre · comando quando em REMOTO** | Wi-Fi, MQTT bidirecional, dashboard, envio de setpoint e comandos, alarmes remotos |

### A regra de arbitragem

| Chave em | Quem **comanda** | Quem **supervisiona** |
|---|---|---|
| **LOCAL** | Arduino — IHM e botoeiras do painel | ESP32 vê tudo, mas **comandos remotos são recusados** |
| **REMOTO** | ESP32 — dashboard e MQTT | Arduino executa, valida e continua vendo tudo |

**Três regras que valem nas duas posições, sem exceção:**

1. **EMERGÊNCIA e STOP nunca passam por software.** Cortam a energia em hardware, com a chave em qualquer posição. Nenhum comando remoto religa.
2. **PID, intertravamento e trip por RPM ficam sempre no Arduino.** É controle crítico — não pode depender de uma rede Wi-Fi que pode cair.
3. **O ESP32 nunca aciona atuador diretamente.** Ele pede; o Arduino valida e decide. Se o pedido for absurdo (setpoint fora de faixa, START sem potência armada), é recusado e o motivo volta pelo MQTT.

> 🎓 **Frase para a defesa:** *"A restrição de continuidade operacional nos impediu de substituir o controlador. Implementamos o ESP32 em paralelo, com arbitragem por chave Local/Remoto — a mesma solução que qualquer painel industrial usa para conviver com comando local e sistema supervisório."*

```
        ┌──────────── CHAVE LOCAL / REMOTO ────────────┐
        │                                               │
   LOCAL ▼                                       REMOTO ▼
 Botoeiras + IHM Nextion                    Dashboard + MQTT
        │                                               │
        └──────────────┐                 ┌──────────────┘
                       ▼                 ▼
 Sensores ────► ARDUINO MEGA 2560 ◄──Serial1──► ESP32 (DNLCB30)
 (DS18B20,      PID · PWM 1 Hz · SD · RTC        Wi-Fi · MQTT
  AM2315C,      intertravamento · trip           dashboard
  RPM×2, IS)              │
                          ▼
        BTS7960 #1 (Frio) ⊕ BTS7960 #2 (Quente)   ← intertravados
                          │
                          ▼
     CABINE CLIMATIZADA (2× Peltier em série + PTC 24 V + 4 fans)
                          │
                          ▼
     4 POSIÇÕES DE ENSAIO — dispositivos energizados e monitorados
        cada uma com fusível próprio + medição de corrente

     ⛔ EMERGÊNCIA e STOP cortam em HARDWARE, fora dos dois caminhos
```

---

## 1.4 Cadeia de energia (resumo — detalhes no Doc 02)

```
127 V AC ─[Disj. 2P 6A]─[Chave 0-1]─► FONTE 24 Vcc 240 W    (SUBESTAÇÃO)
                                            │
                    ┌───────────────────────┼───────────────────────┐
                 [F1 10A]                [F2 2A]                 [F3 2A]
                    │ R1                    │ R2                    │ R3
              ══════╪═══════════════════════╪═══════════════════════╪══════ POSTES
                    ▼                       ▼                       ▼
              P1 · DERIVAÇÃO           T2 · LM2596 📟          T3 · LM2596 📟
              24 V PASSANTE            24 V → 5,10 V           24 V → 12,0 V
              (sem conversor)          (comando)               (auxiliares)
                    │                       │                       │
              BTS #1 → 2× Peltier    Arduino / Nextion       fans internas
              BTS #2 → PTC 24 V      SD / RTC / lógica       coolers / LEDs
                                                             DNLCB30 → ESP32
```

> ⚡ **Regra de ouro de segurança do projeto:** os **127 V AC existem apenas dentro da caixa fechada da subestação**. Tudo que o público toca, vê e manipula durante a apresentação opera em **24 Vcc ou menos (SELV)**.

> 🔎 **Por que o poste P1 não tem transformador?** Porque a carga dele — as Peltier e o PTC — **já trabalha na tensão da linha (24 V)**. Isso reproduz exatamente o que acontece na rede real: consumidores pequenos recebem um transformador de poste que abaixa a tensão; **consumidores industriais de grande porte são atendidos na própria tensão primária** e montam a sua subestação. P1 é o poste de derivação desse "grande consumidor"; P2 e P3 são os transformadores de distribuição dos consumidores comuns.

---

## 1.5 Estratégia de controle

| Conceito | Implementação |
|---|---|
| Malha de controle | **PID** sobre a temperatura do centro da câmara (DS18B20) |
| Atuação | **PWM lento de 1 Hz** — adequado a cargas térmicas e à Peltier (chaveamento rápido degrada a pastilha) |
| Seleção de modo | `setpoint < temperatura` → **Frio**; `setpoint > temperatura` → **Quente**; banda morta de ±0,3 °C |
| Intertravamento | **Por software** — nunca os dois BTS ativos juntos |
| Tempo de troca de modo | **30 s** de espera entre Frio ↔ Quente (evita choque térmico) |
| Diagnóstico de carga | Pino **IS** de cada BTS7960 lido pelo ADC (detecta atuador desconectado/queimado) |
| Segurança da Peltier | **Monitoramento de RPM das 2 fans externas** — sem dissipação a pastilha queima em < 1 min. Com 2 pastilhas, são **2 conjuntos dissipador+cooler e 2 sinais de RPM** a vigiar |
| Emergência | Relé de interface **KA1** com a botoeira **em série com a bobina** — abre o **KA2**, que corta os **24 V de potência** em hardware, independente do firmware |
| START / STOP | Software — funcionam pelo **botão do painel ou pela IHM**, indiferentemente |
| Proteção contra travamento | **Watchdog de 2 s** + **pull-down de 10 kΩ** em cada `R_EN`: pino solto = driver desligado |

---

## 1.6 Os 8 cuidados críticos do projeto

| # | Cuidado | Consequência de ignorar | Onde está detalhado |
|---|---|---|---|
| 1 | **Ajustar os LM2596 antes de conectar carga** | 24 V no lugar de 5 V queima o Arduino na hora — e o display do módulo só serve se você olhar para ele **antes** de plugar o cabo | [Doc 02 §2.5](02_arquitetura_de_energia.md) |
| 2 | **As 2 pastilhas Peltier em SÉRIE — nunca em paralelo** | Em paralelo cada pastilha recebe os 24 V inteiros (o dobro do nominal) e queima em segundos | [Doc 02 §2.4](02_arquitetura_de_energia.md) |
| 3 | **Star ground (ponto único de aterramento)** | Ruído dos BTS corrompe leituras analógicas e serial | [Doc 32](../camada_3_eletrica/32_sinais_e_sensores.md) |
| 3b | **Pull-down de 10 kΩ em cada `R_EN`** | Sem ele, o Arduino resetado deixa os drivers em estado indefinido. **Ficou ainda mais crítico no Plano B**: os 24 V de potência estão presentes na entrada dos BTS desde que a fonte liga — ver [Doc 02 §2.9](02_arquitetura_de_energia.md) | [Doc 31 §31.0](../camada_3_eletrica/31_comando_e_protecoes.md) |
| 4 | **Monitorar RPM das 2 fans externas das Peltier** | Pastilha queima em menos de 1 minuto | [Doc 40](../camada_4_programacao/40_firmware_arduino.md) |
| 5 | **Dreno de condensado** | Água sobre a eletrônica em ~1 h de operação em frio | [Doc 12](../camada_1_maquete/12_camara_termica.md) |
| 6 | **Barreira de vapor no isolamento** | Umidade condensa dentro do isolante e ele perde eficiência para sempre | [Doc 12](../camada_1_maquete/12_camara_termica.md) |
| 7 | **Capacitor 100 nF nos pinos IS** | Leitura de corrente instável e falsos alarmes | [Doc 32](../camada_3_eletrica/32_sinais_e_sensores.md) |
| 8 | **Intervalo de 30 s na troca de modo** | Choque térmico e fadiga da pastilha Peltier | [Doc 40](../camada_4_programacao/40_firmware_arduino.md) |

---

## 1.7 Ordem de construção (as 5 camadas)

O projeto foi reorganizado em **camadas de construção** — você constrói de baixo para cima, e cada camada só começa quando a anterior está testada.

```
CAMADA 0 — FUNDAMENTOS          ← você está aqui
   Visão geral · Arquitetura de energia · Lista de materiais
   ⤷ Entregável: BOM fechada e todos os cálculos feitos

CAMADA 1 — MAQUETE (a obra civil)
   Base e chão de fábrica · Subestação e postes · Câmara térmica
   ⤷ Entregável: cenário pronto, pintado, sem eletrônica

CAMADA 2 — PAINEL (a montagem mecânica)
   Dimensionamento · Layout interno · Furação · Fixação nos trilhos
   ⤷ Entregável: painel montado, sem um único fio ligado

CAMADA 3 — ELÉTRICA (a instalação)
   Força e distribuição · Comando e proteções · Sinais e sensores
   ⤷ Entregável: sistema energizado e medido, sem firmware

CAMADA 4 — PROGRAMAÇÃO
   Firmware Arduino (PID) · ESP32 / IHM / IoT
   ⤷ Entregável: software gravado e testado em bancada

CAMADA 5 — INTEGRAÇÃO
   Montagem final · Comissionamento por etapas · Ensaios
   ⤷ Entregável: projeto funcionando e documentado
```

> **Por que esta ordem?** Porque erro em camada baixa custa caro. Furar o painel depois de cabeado é retrabalho; descobrir que a base é pequena demais depois de tudo colado é começar de novo. **Cada camada termina com um checklist de aceitação** — só avance se todos os itens estiverem marcados.

---

## 1.8 Índice completo dos documentos

| Camada | Documento | Conteúdo |
|---|---|---|
| **0** | [01 — Visão Geral](01_visao_geral.md) | Este documento |
| **0** | [02 — Arquitetura de Energia](02_arquitetura_de_energia.md) | ⭐ 127 V → 24 V → 12/5/3,3 V, dimensionamento, conversores |
| **0** | [03 — Lista de Materiais](03_lista_materiais.md) | BOM completa com especificação e link |
| **1** | [10 — Base e Chão de Fábrica](../camada_1_maquete/10_base_e_chao_de_fabrica.md) | Dimensões, setores, piso industrial, sinalização, escala |
| **1** | [11 — Subestação e Postes](../camada_1_maquete/11_subestacao_e_postes.md) | Caixa da subestação, postes, cruzetas, isoladores, transformadores |
| **1** | [12 — Câmara Térmica](../camada_1_maquete/12_camara_termica.md) | Acrílico, isolamento, porta dupla, vedação, dutos, dreno |
| **2** | [20 — Painel de Comando](../camada_2_painel/20_painel_projeto_e_layout.md) | Dimensionamento, layout interno cotado, furação, montagem |
| **3** | [30 — Força e Distribuição](../camada_3_eletrica/30_forca_e_distribuicao.md) | Fiação AC, barramento 24 V, conversores, distribuição |
| **3** | [31 — Comando e Proteções](../camada_3_eletrica/31_comando_e_protecoes.md) | Relé de interface, emergência em hardware, fusíveis, aterramento, seletividade |
| **3** | [32 — Sinais e Sensores](../camada_3_eletrica/32_sinais_e_sensores.md) | Pinout, BTS7960, sensores, comunicação, star ground |
| **4** | [40 — Firmware Arduino](../camada_4_programacao/40_firmware_arduino.md) | PID, PWM 1 Hz, intertravamento, segurança, log SD |
| **4** | [41 — ESP32, IHM e IoT](../camada_4_programacao/41_esp32_ihm_iot.md) | MQTT, telas Nextion, dashboard |
| **4** | [42 — Simulação e Testes](../camada_4_programacao/42_simulacao_e_testes.md) | Simulador Python, Wokwi, Falstad — testar sem hardware |
| **5** | [50 — Montagem e Comissionamento](../camada_5_integracao/50_montagem_e_comissionamento.md) | Integração final, ensaios, ajuste de PID, apresentação |

📁 **Desenhos técnicos:** [pasta `desenhos/`](../desenhos/)
📁 **Documentação anterior (histórico):** [pasta `_arquivo_v1/`](../_arquivo_v1/)
