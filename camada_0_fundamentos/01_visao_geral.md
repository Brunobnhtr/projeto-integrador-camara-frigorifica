# CAMADA 0 · Doc 01 — Visão Geral do Projeto

> **Projeto Integrador — Planta Industrial Didática com Câmara Frigorífica Automatizada**
>
> Uma maquete que representa, em escala, uma **planta industrial completa**: da entrada de energia na subestação, passando pela rede de distribuição em postes, até o painel de comando que controla o processo — uma câmara térmica com controle PID, IHM e supervisão remota (IoT).

---

## 1.1 O que o projeto demonstra

O projeto integra, em uma única maquete funcional, os quatro grandes blocos do curso técnico em eletrotécnica:

| Bloco | O que é demonstrado | Onde está |
|---|---|---|
| **Geração e distribuição** | Transformação de tensão, transmissão em tensão mais alta, transformadores de distribuição, seletividade de proteção | Subestação + postes + transformadores |
| **Instalações e comandos elétricos** | Painel, trilho DIN, disjuntor, fusíveis, relé de interface, botoeiras, emergência, aterramento | Painel de comando |
| **Automação e controle** | Malha fechada PID, atuadores, intertravamento, sensores, IHM | Arduino Mega + BTS7960 + Nextion |
| **Indústria 4.0 / IoT** | Telemetria, MQTT, dashboard, log de dados | ESP32 + cartão SD |

> **A diferença desta versão para a anterior:** antes o projeto era "uma câmara térmica com Arduino". Agora é **uma planta industrial em miniatura** onde a câmara é apenas a carga do processo. O sistema elétrico virou protagonista — que é o que se espera de um projeto de eletrotécnica.

---

## 1.2 O processo controlado — a câmara térmica

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

## 1.3 Arquitetura de controle (dois processadores)

| Unidade | Papel | Responsabilidades |
|---|---|---|
| **Arduino Mega 2560** | CLP central (tempo real) | PID, leitura de sensores, PWM 1 Hz, monitoramento de RPM, IHM Nextion, log em SD, montagem do JSON |
| **ESP32-WROOM-32U** (na base DNLCB30) | Gateway IoT | Wi-Fi + MQTT bidirecional. Alimentado em 24 V pela DNLCB30, que também converte os níveis 5 V ↔ 3,3 V automaticamente |

**Por que separar?** O Arduino cuida do controle crítico (não pode travar — comanda Peltier e PTC). O ESP32 cuida da rede, que é "melhor esforço": se o Wi-Fi cair, o controle continua e o log no SD garante que nenhum dado se perca. É a arquitetura **offline-first**.

```
 Sensores (DS18B20, AM2315C, RPM, IS)
        │
        ▼
 ARDUINO MEGA 2560 ──Serial2──► Nextion 3.2" (IHM)
  PID · PWM 1 Hz · SD · RTC
        │  PWM/EN        └──Serial1 (JSON)──► DNLCB30 + ESP32 ──MQTT──► Nuvem
        ▼
 BTS7960 #1 (Frio) ⊕ BTS7960 #2 (Quente)     ← intertravados por software
        │
        ▼
 CÂMARA TÉRMICA (2× Peltier em série + PTC 24 V + 4 fans + dutos + dreno)
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
