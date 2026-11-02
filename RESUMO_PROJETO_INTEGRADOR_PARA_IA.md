# 📘 DOSSIÊ E RESUMO TÉCNICO COMPLETO DO PROJETO INTEGRADOR
**Câmara Térmica Didática e Planta Industrial em Escala**  
*Curso Técnico em Eletrotécnica — SENAI*  
*Data de Consolidação: 01 de Novembro de 2026*  
*Objetivo deste documento: Servir de base autossuficiente para análise, auditoria técnica e propostas de melhoria por inteligências artificiais ou engenheiros de revisão.*

---

## 1. VISÃO GERAL E CONCEITO DIDÁTICO

### 1.1 O que é o Projeto?
O projeto consiste na concepção, cálculo, fabricação em corte CAD/laser, montagem eletromecânica, fiação industrial e automação de uma **Planta Industrial Didática em Escala**. Diferente de projetos convencionais baseados em bancadas soltas, esta planta simula fielmente a infraestrutura de uma indústria moderna com:
1. **Subestação de Entrada (127 V AC)**: Pátio em escala com brita, cerca perimetral, transformadores, chave geral e distribuição aérea em 24 Vcc sobre postes industriais com cruzetas e isoladores.
2. **Painel Elétrico Industrial (600 × 800 × 250 mm)**: Quadro metálico/MDF montado conforme normas **NR-10 e NR-12**, com trilhos DIN, canaletas vazadas, bornes seccionáveis com fusíveis, relé de segurança/interface (KM1), conversores Buck chaveados e IHM digital.
3. **Câmara Frigorífica / Térmica (15,0 Litros úteis)**: Estrutura acrílica de paredes duplas com isolamento térmico EPS, dutos de circulação forçada e sistema bivalente de controle térmico:
   - **Refrigeração**: Conjunto Duplo Peltier (2× pastilhas termoelétricas TEC1-12706 ligadas em série operando em 24 Vcc com radiador aletado duplo e coolers).
   - **Aquecimento**: Elemento de cerâmica semicondutora PTC operando em 24 Vcc.
4. **O Coração Didático — 8 Posições de Ensaio de Produto**:
   - Dentro da câmara térmica, operam 8 dispositivos sob teste contínuo em 12 Vcc (em duas placas ilhadas de 95 × 75 mm sustentadas por tiras de alumínio CAM-26 e espaçadores M3).
   - Cada posição possui proteção individual por fusível seccionável de 1 A e sua corrente é medida em tempo real por um módulo industrial de aquisição analógica de 22 canais (**N4AIC24**, comunicação **Modbus RTU RS-485**).
   - O sistema detecta individualmente quando uma posição queima ou entra em fuga, alertando no painel e via nuvem (IoT).

---

## 2. ARQUITETURA ELÉTRICA, ENERGIA E SEGURANÇA

### 2.1 Diagrama Unifilar e Distribuição de Potência
```text
Rede 127 V AC 
   │
   ├─► Disjuntor Bipolar Q0 (Curva C, 6 A) ─► Chave Geral
   │
   └─► Fonte Chaveada Industrial PS1 (24 Vcc / 10 A / 240 W)
          │
          ├─► [KM1 - Relé de Interface / Selo de Emergência em Hardware]
          │      │
          │      ├─► BD-POT (Barramento 24 V Comutado)
          │      │      ├─► BTS7960 (Ponte H 1) ──► Peltier Duplo 2× TEC1-12706 em série (24 V, 5,2 A)
          │      │      └─► BTS7960 (Ponte H 2) ──► Aquecedor PTC 12 V / 50 W (Ligação direta via PWM, autolimitante)
          │      │
          │      ├─► T2 (Step-Down LM2596 / XL4015) ──► BD-5V (5,10 Vcc / 3 A)
          │      │      └─► Arduino Mega 2560, ESP32, Lógica da Placa de 8 Relés (Sinaleiros 24 V alimentados pelo BD-24V via relés Ch4-Ch7)
          │      │
          │      └─► T3 (Step-Down XL4016 / LM2596) ──► BD-12V (12,0 Vcc / 5 A)
          │             ├─► Ventiladores internos dos dutos e coolers
          │             └─► 8 Posições de Ensaio sob Teste (12 V, via porta-fusíveis)
          │
          └─► BD-24V (24 Vcc Permanente / Não Comutado)
                 └─► Módulo Analógico N4AIC24 (Alimentação contínua para manter telemetria)
```

### 2.2 Cadeia Crítica de Segurança em Hardware (Independente de Microcontrolador)
O projeto obedece ao princípio de que **segurança de vida e proteção contra incêndio NUNCA dependem exclusivamente de código/software**:
1. **Botão de Emergência (Cogumelo com Trava)**: Corta a bobina do relé KM1 desfazendo o selo físico. Ao ser acionado, desenergiza imediatamente o barramento `BD-POT`, derrubando o Peltier e o PTC instantaneamente.
2. **Controle Direto do Aquecedor PTC**:
   - O elemento cerâmico PTC opera em 12 Vcc / 50 W e possui **propriedade física autolimitante de temperatura** (a resistência ôhmica cresce exponencialmente com a temperatura, estabilizando-se naturalmente).
   - Ligação direta à saída da **Ponte H 2 (BTS7960)** com controle proporcional PWM pelo Arduino, sem necessidade de termostatos bimetálicos em série (ST-1/ST-2 eliminados).
3. **Cuidado Vital do Retorno de Medição (N4AIC24)**:
   - ⚠️ **O retorno das 8 posições de ensaio NÃO é ligado na barra de 0 V comum.**
   - O cabo de retorno entra no respectivo canal `I1..I8` do N4AIC24, passa pelo **shunt interno do módulo** e sai pelo terminal `GND` para o barramento `BD-0V-B`. Se for ligado diretamente na barra de 0 V, o LED acende mas a medição fica zerada eternamente.

---

## 3. MECÂNICA, CAD E CÂMARA TÉRMICA

### 3.1 Fonte da Verdade Geométrica
* **Códigos Geradores Ativos**: `cad_corte/parametros_v11.py` e `parametros_v12.py`.
* **Dimensões Reais da Câmara**:
  - Externo: 310 × 210 × 260 mm.
  - Cavidade Interna Útil: **300 × 200 × 250 mm** (Volume: **15,0 Litros**).
  - Isolamento Térmico: Placas EPS de alta densidade revestidas com barreira de vapor aluminizada.
  - Circulação: 2 dutos verticais externos de 40 × 40 mm interligando o plenum inferior ao teto.
* **Suporte das Posições de Ensaio (`CAM-26`)**:
  - Duas tiras/travessas de barra chata de alumínio (210 × 20 mm) parafusadas nas 4 cantoneiras CAM-24 das laterais de acrílico em Z = 110 mm.
  - Substitui a antiga chapa maciça dobrada, eliminando o bloqueio aerodinâmico e deixando a convecção forçada vertical 100% livre.
  - Sustenta duas placas ilhadas de **95 × 75 mm** fixadas por **8 espaçadores roscados M3 de 8–10 mm**, garantindo isolamento elétrico das soldas e ventilação por baixo das placas.
* **Prensa-Cabos da Parede da Câmara**:
  - `PC-1` (Alimentação e sensores): **PG13,5** (furo 20,5 mm, feixe 10,6 mm).
  - `PC-2` (Retorno das 8 posições): **PG11** (furo 18,6 mm, feixe 9,5 mm — PG9 reprovado por esmagar cabos).

---

## 4. SISTEMA DE AUTOMAÇÃO, CONTROLE E FIRMWARE

### 4.1 Arquitetura Hierárquica em Duplo Microcontrolador
1. **Arduino Mega 2560 (Controle de Processo em Tempo Real)**:
   - **Algoritmo PID Bipolar**: Chaveia suavemente entre refrigeração (Peltier) e aquecimento (PTC).
   - **Frequência de PWM**: Timer configurado para **20 kHz** (ultrassônico) para acionamento dos módulos BTS7960, eliminando ruído acústico audível e perdas por chaveamento nas pastilhas termoelétricas.
   - **Comunicação RS-485 / Modbus RTU**: Master na `Serial3` (via transceptor MAX485 em D14/D15/D26) lendo ciclicamente as correntes das 8 posições no escravo N4AIC24.
   - **Proteção contra travamento**: Watchdog timer e intertravamento de software impedindo o acionamento simultâneo de Peltier e PTC.
2. **ESP32 (IHM Touchscreen, Gateway e IoT)**:
   - Interface Homem-Máquina com display TFT / Nextion.
   - Comunicação com o Arduino Mega via canal Serial UART dedicado usando payloads estruturados em JSON.
   - Conexão Wi-Fi com cliente MQTT publicando telemetria (temperatura interna, setpoint, PWM aplicado, correntes individuais I1..I8, status de falha) e recebendo comandos remotos de setpoint e acionamento.

---

## 5. SUBSISTEMA DE COMPRAS E SCRAPING INTELIGENTE (`compras_projeto/`)

Desenvolvido para sanar o principal gargalo de montagem: a aquisição de componentes comerciais em plataformas como **AliExpress** e **Mercado Livre**.

```text
┌─────────────────────────────────┐
│       Brave Browser Pessoal     │
│ (Usuário escolhe variação/SKU)  │
└────────────────┬────────────────┘
                 │ Clique no Bookmarklet
                 ▼
┌─────────────────────────────────┐       POST /api/receber_sku       ┌────────────────────────────────┐
│   JavaScript Bookmarklet Injetor├──────────────────────────────────►│     servidor_compras.py        │
│ • Captura Título exato da var.  │                                   │ • Valida e sanitiza preços     │
│ • Captura Preço atualizado      │                                   │ • Mapeia URL para ID (ex:CAM-01│
│ • Captura Foto em Alta Resolução│                                   │ • Baixa foto local para disk   │
└─────────────────────────────────┘                                   │ • Grava em dados.json          │
                                                                      └───────────────┬────────────────┘
                                                                                      │
                                 Polling contínuo GET /api/ultima_escolha (1.5s)      │
┌─────────────────────────────────────────────────────────────────────────────────────▼┐
│                          lista_compras_interativa.html                               │
│ • Rola suavemente até o card atualizado e acende borda verde pulsante                │
│ • Exibe miniatura cristalina com Lightbox/Zoom e previne "Bait-and-Switch"           │
│ • Emite relatório impresso oficial SENAI (@media print) e orçamento WhatsApp         │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

### 5.1 O Problema do "Bait-and-Switch" (Variações Falsas)
Em anúncios do AliExpress, vendedores ofertam kits complexos (ex: Kit Peltier Duplo) por preços irrisórios como R$ 15,00. Na prática, esse valor corresponde apenas a uma cantoneira ou graxa térmica. Quando o usuário clica na variação real ("12V DC Upg TEC12706"), o preço salta para R$ 171,31 e a foto muda.
* **Solução Implementada**:
  - O sistema interativo não confia no preço base do crawler.
  - O usuário abre o anúncio real em seu **Brave Browser**, clica na variação física desejada e aperta o atalho **`⭐ ⚡ Capturar SKU no Brave`**.
  - O script injetado captura dinamicamente a foto da variação (`_960x960q75.jpg`), o título exato (`sku-item--title`) e o valor centesimal, transferindo via API HTTP local para a planilha e o banco de dados.

---

## 6. MATRIZ DE COMPONENTES E MATERIAIS PRINCIPAIS (BOM RESUMIDA)

| Código | Descrição Técnica | Função no Projeto | Tensão / Potência | Status |
|---|---|---|---|---|
| **CAM-01** | Kit Peltier Duplo 2× TEC1-12706 montado com dissipador aletado duplo e coolers | Refrigeração da câmara | 24 Vcc / 120 W (5,2 A) | Mapeado (AliExpress R$ 171,31) |
| **CAM-02** | Elemento cerâmico de aquecimento PTC com aletas de alumínio | Aquecimento da câmara | 24 Vcc / ~50–100 W | Requer validação térmica |
| **CAM-03/04** | Ventoinhas axiais 40×40×10 mm (2 fios, sem tacômetro) | Circulação forçada nos dutos | 12 Vcc / 0,15 A | Mapeado |
| **CAM-26** | Tiras de alumínio 210 × 20 mm + 8 espaçadores M3 | Suporte aerodinâmico das posições de ensaio | Mecânico | Mapeado (oficina SENAI) |
| **ELE-01** | Fonte chaveada industrial tipo colmeia (gradeada) | Fonte primária do sistema | 127 VAC → 24 Vcc / 10 A (240W) | Mapeado |
| **ELE-02** | Disjuntor termomagnético bipolar Q0 curva C | Proteção geral de entrada | 127 VAC / 6 A | Mapeado |
| **ELE-03** | Módulo relé de potência / contator auxiliar KM1 | Selo de segurança e corte de emergência | Bobina 24 Vcc ou 12 Vcc | Mapeado |
| **ELE-04** | Dupla Ponte H BTS7960 (43 A) | Controle PWM do Peltier e do PTC | 24 Vcc / PWM 20 kHz | 2 unidades mapeadas |
| **ELE-05** | Módulo de Aquisição Analógica N4AIC24 | Medição das 8 posições + 2 tensões | Modbus RS-485 / 24 Vcc | Mapeado |
| **CTR-01** | Placa microcontroladora Arduino Mega 2560 R3 + WiFi integrado | Controle PID e máquina de estados (versão WiFi escolhida para upgrade) | 5 Vcc (via T2) | Kit Aluno / Mapeado |
| **CTR-02** | Módulo microcontrolador ESP32 NodeMCU-32S | IHM e Gateway IoT MQTT | 5 Vcc / 3,3 Vcc | Kit Aluno / Mapeado |
| **CTR-03** | Transceptor MAX485 (TTL para RS-485) | Comunicação Mega ↔ N4AIC24 | 5 Vcc | Mapeado |
| **CTR-04** | Sensores digitais de temperatura DS18B20 (à prova d'água) | Termometria interna da câmara e dissipador | 1-Wire / 5 Vcc | Mapeado |

---

## 7. PRINCIPAIS DECISÕES HISTÓRICAS E DÍVIDAS TÉCNICAS

1. **Eliminação das Lâmpadas Automotivas W5W e dos Shunts ACS712**:
   - *Motivo*: As lâmpadas geravam calor espúrio excessivo dentro da câmara (prejudicando a dinâmica do teste térmico de refrigeração) e o sensor ACS712 possui deriva térmica severa e ruído em baixas correntes. Foram substituídas por **8 posições com LEDs de 5 mm e resistores de 1 kΩ alimentados em 12 V**, gerando corrente estável de 9 a 11 mA medida com altíssima precisão pelo módulo industrial **N4AIC24**.
2. **Eliminação da Fonte ATX de PC**:
   - *Motivo*: Fontes ATX comuns não possuem barramento de 24 Vcc e todos os trilhos compartilham o mesmo terra elétrico (impossibilitando ligação em série de duas saídas de 12 V). Foi adotada **fonte industrial única de 24 Vcc / 10 A**, utilizando conversores chaveados Step-Down (T2 e T3) para derivar 5 V e 12 V.
3. **Liberação Definitiva do PTC**:
   - O Aquecedor Cerâmico PTC 12 V / 50 W está **100% LIBERADO e APROVADO**, conectado diretamente à Ponte H BTS2 comandada pelo Arduino. A proteção contra superaquecimento é garantida pela característica física intrínseca do elemento cerâmico PTC e pelo corte de emergência geral via KM1.

---

## 8. DIRETRIZES PARA A PRÓXIMA IA: O QUE ANALISAR E PROPOR DE MELHORIAS?

A inteligência artificial que assumir a revisão deste projeto deve priorizar os seguintes tópicos de alto impacto:

### 🎯 1. Otimização do Firmware Consolidado (Arduino Mega + ESP32)
* **Desafio**: Integrar as rotinas do PID bipolar de 20 kHz, a leitura Modbus RTU dos 8 canais de corrente e a máquina de estados de segurança num arquivo `.ino` limpo, não bloqueante e com tratamento rigoroso de timeouts de comunicação.
* **Proposta esperada**: Estruturar o código com FreeRTOS (no ESP32) e arquitetura baseada em eventos com millis()/Timers (no Mega), com intertravamento anti-windup no PID.

### 🎯 2. Refinamento Térmico e Algoritmo de Degelo
* **Desafio**: A câmara térmica de 15 L com paredes de acrílico atinge temperaturas baixas (~5 °C), o que provoca condensação e eventual formação de orvalho/gelo no dissipador interno do Peltier.
* **Proposta esperada**: Projetar a lógica automática de ciclo de degelo temporizado ou por saturação de temperatura, além de validar a dissipação traseira do painel elétrico (184 W dissipados no lado quente a plena carga).

### 🎯 3. Validação Elétrica e Orçamento de Carga dos Conversores T2 e T3
* **Desafio**: O conversor T2 (24 V → 5 V) opera próximo de 70% de capacidade nos picos de transmissão Wi-Fi do ESP32 e acionamento de relés; o conversor T3 (24 V → 12 V) atende ventoinhas e posições de ensaio.
* **Proposta esperada**: Especificar modelos industriais definitivos com proteção contra sobretensão na saída (crowbar / diodo Zener com fusível), impedindo que a queima do transistor buck jogue 24 V diretamente nos microcontroladores.

### 🎯 4. Automação de Compras e Fechamento da Lista de Materiais
* **Desafio**: Dos 60 componentes, garantir que todos os links comerciais do AliExpress e Mercado Livre estejam vinculados a anúncios ativos, sem *bait-and-switch*, com custos de frete calculados e dentro do orçamento estipulado pelo grupo de alunos do SENAI.
* **Proposta esperada**: Usar as rotinas de extração automática já criadas para auditar os itens restantes e validar a geração da planilha orçamentária final.

