# ETAPA 1 — Visão Geral, Arquitetura e Princípios Técnicos

> **Projeto Integrador — Sistema de Controle Inteligente para Mini Câmara Frigorífica**
> Esta é a primeira etapa do projeto: entender **o que** será construído, **como** o sistema funciona e **quais princípios** físicos e elétricos estão envolvidos. Leia esta etapa antes de comprar materiais (ETAPA 2) ou montar qualquer parte.
>
> 📌 **Decisão de projeto desta versão:** a proteção e o comando da fonte foram simplificados. **Não há disjuntor** dedicado para proteger a fonte, **nem chave/botão de seccionamento**. O único elemento de comando do circuito AC é a **chave rotativa 0‑1** (botão rotativo), que liga e desliga a fonte principal (ATX). Ver detalhes e justificativa na [ETAPA 5 — Força](cabos_forca.md).

---

## 1.1 Objetivo do Projeto

Desenvolver uma **mini câmara térmica** (funciona como incubadora ou como mini frigorífico) capaz de **aquecer ou resfriar** um pequeno volume interno de forma controlada, usando:

- **Célula Peltier (TEC1‑12706)** para resfriar;
- **Aquecedor PTC cerâmico** para aquecer;
- **Controle PID** com **PWM lento (1 Hz)** para regular a potência;
- **Conectividade IoT** (Wi‑Fi / MQTT) para monitoramento remoto;
- **IHM local** (tela Nextion) e **registro de dados** em cartão SD.

O sistema mantém a temperatura interna em um valor de referência (*setpoint*) definido pelo usuário, registra tudo e publica a telemetria na nuvem.

---

## 1.2 Arquitetura de Controle (dois cérebros)

O projeto usa uma arquitetura distribuída com **dois microcontroladores**, cada um com um papel:

| Unidade | Papel | Responsabilidades |
|---|---|---|
| **Arduino Mega 2560** | CLP central (tempo real) | Executa o PID, lê os sensores, gera o PWM 1 Hz dos atuadores, monitora a RPM da fan externa, controla a IHM Nextion, grava o log no SD e monta o JSON de telemetria. |
| **ESP32‑WROOM‑32U** | Gateway IoT | Recebe o JSON do Arduino pela Serial, conecta no Wi‑Fi e publica via **MQTT** (controle bidirecional: também recebe comandos da nuvem). Fica alojado na base **DNLCB30**, que faz a conversão automática de nível 5 V ↔ 3,3 V. |

> **Por que separar?** O Arduino Mega cuida do controle crítico em tempo real (não pode travar nunca, pois comanda Peltier/PTC). O ESP32 cuida da rede, que é "melhor esforço" — se o Wi‑Fi cair, o controle continua funcionando e o log no SD garante que nenhum dado se perca (arquitetura **offline‑first**).

```
        ┌──────────────────────────┐         ┌─────────────────────┐
Sensores│      ARDUINO MEGA 2560    │ Serial1 │   DNLCB30 + ESP32   │  Wi-Fi   ┌──────────┐
───────►│  PID · PWM 1Hz · SD · RTC │────────►│  Gateway MQTT       │─────────►│  Nuvem   │
        │  IHM Nextion (Serial2)    │  JSON   │  (5V↔3.3V auto)     │◄─────────│  MQTT    │
        └──────────────────────────┘ 115200  └─────────────────────┘ comandos └──────────┘
                 │ PWM/EN
                 ▼
        BTS7960 #1 (Frio) · BTS7960 #2 (Quente)
```

---

## 1.3 Princípio Térmico — Como a câmara aquece e resfria

### Modo Resfriamento (Peltier)
A pastilha Peltier (efeito termoelétrico) bombeia calor de um lado para o outro quando recebe corrente DC. O **lado frio** fica voltado para dentro da câmara; o **lado quente** é dissipado por um **cooler externo** que precisa estar **sempre ligado** quando a Peltier está energizada.

- Ventoinhas internas **empurram o ar frio para baixo** (convecção forçada).
- O ar frio desce no centro, retorna pelo plenum inferior e sobe pelos dutos laterais.

### Modo Aquecimento (PTC)
O aquecedor **PTC cerâmico** é autolimitado: sua resistência sobe com a temperatura, evitando sobreaquecimento descontrolado.

- Ventoinhas internas **empurram o ar quente para cima** (o ar quente já tende a subir → convecção a favor).
- O ar quente sobe no centro, entra nos dutos pelo topo e desce pelas laterais.

> Os dois modos **nunca operam ao mesmo tempo**. A troca entre Frio↔Quente respeita um intervalo de **30 s** para evitar choque térmico nos atuadores (ver ETAPA 7 — Firmware).

---

## 1.4 Dinâmica de Fluidos (circulação de ar)

| Modo | Atuador térmico | Direção das fans internas | Caminho do ar |
|---|---|---|---|
| **Frio** | Peltier (BTS #1) | Sopram **para baixo ↓** | Centro ↓ → plenum inferior → dutos laterais ↑ → retorno ao topo |
| **Quente** | PTC (BTS #2) | Sopram **para cima ↑** | Centro ↑ → dutos pelo topo → laterais ↓ → retorno pelo plenum |

São **4 ventoinhas internas** no total (2 vêm nos kits + 2 compradas à parte). A combinação de tamanho e direção está detalhada na [ETAPA 3 — Câmara](acrilico.md) e na [ETAPA 6 — Comando](cabos_comandos.md).

---

## 1.5 Condensação e Dreno (item obrigatório)

No modo resfriamento, a umidade do ar condensa nas superfícies frias. **Sem dreno, em cerca de 1 hora de operação já há água acumulada sobre a eletrônica.**

- **Bandeja de alumínio** na parte inferior da câmara coleta a água.
- **Tubo de silicone (dreno)** conduz a água para fora do painel.
- **Sílica gel indicadora** ajuda a controlar a umidade residual.

> ⚠️ O dreno não é opcional — é um requisito de segurança elétrica. Água + eletrônica energizada = curto e risco de choque.

---

## 1.6 Estratégia de Controle (resumo)

| Conceito | Implementação |
|---|---|
| Malha de controle | **PID** (Proporcional‑Integral‑Derivativo) sobre a temperatura do centro da câmara (DS18B20) |
| Atuação | **PWM lento de 1 Hz** — adequado para cargas térmicas lentas e para a Peltier (evita chaveamento rápido prejudicial) |
| Seleção de modo | Se `setpoint < temperatura` → **Frio** (BTS #1). Se `setpoint > temperatura` → **Quente** (BTS #2) |
| Intertravamento | **Por software** — Peltier e PTC nunca ligam juntas. Garante segurança sem relé físico |
| Diagnóstico de carga | Pino **IS** de cada BTS7960 lido pelo ADC do Arduino (detecta atuador desconectado/queimado) |
| Segurança da Peltier | Monitoramento de **RPM da fan externa**: se a fan parar, o sistema desliga imediatamente (a Peltier queima em <1 min sem dissipação) |

---

## 1.7 Cuidados Críticos (visão geral — detalhados nas etapas)

1. **Star ground:** todos os GNDs convergem para **um único borne central** antes de retornar à fonte. Sem isso, o ruído de chaveamento dos BTS corrompe as leituras analógicas e a comunicação serial. → [ETAPA 5](cabos_forca.md)
2. **Monitoramento da fan externa da Peltier:** o fio de RPM vai ao Arduino (`INPUT_PULLUP`). Fan parada + Peltier ligada = pastilha queimada em menos de 1 minuto. → [ETAPA 6](cabos_comandos.md)
3. **Filtro nos pinos IS:** capacitor 100 nF entre cada pino IS e GND antes do ADC, para reduzir ruído na leitura de corrente. → [ETAPA 6](cabos_comandos.md)
4. **Dissipação dos BTS7960:** para operação contínua acima de ~5 A, acrescentar um cooler 40 mm soprando sobre os módulos. → [ETAPA 4](painel_interno.md)
5. **Intervalo de troca de modo:** aguardar **30 s** antes de alternar Frio↔Quente. → [ETAPA 7](firmware.md)
6. **Dreno de condensação:** obrigatório (ver 1.5). → [ETAPA 3](acrilico.md)

---

## 1.8 Mapa das Etapas do Projeto

| Etapa | Arquivo | Conteúdo |
|---|---|---|
| **1. Visão geral** | `informacoes_tecnicas.md` (este) | Arquitetura, princípios térmicos, estratégia de controle |
| **2. Materiais** | [lista_materiais.md](lista_materiais.md) | BOM completa com quantidades, specs e links |
| **3. Câmara / acrílico** | [acrilico.md](acrilico.md) | Dimensões, peças de acrílico, isolamento, dutos, colagem, dreno |
| **4. Painel de comando** | [painel_interno.md](painel_interno.md) | Layout, dimensões, furação e montagem mecânica do painel |
| **5. Força e alimentação** | [cabos_forca.md](cabos_forca.md) | Entrada AC (só chave rotativa), ATX, distribuição DC, proteção, star ground, emergência |
| **6. Comando e sinais** | [cabos_comandos.md](cabos_comandos.md) | Pinout completo, sensores, comunicação serial/I²C/SPI, botões e LEDs |
| **7. Firmware** | [firmware.md](firmware.md) | Arduino (PID, PWM 1 Hz, partida/emergência, log SD) + ESP32 (MQTT) |
| **8. Montagem / comissionamento** | [montagem_comissionamento.md](montagem_comissionamento.md) | Sequência de montagem e testes de energização |
| **Índice** | [00_indice_projeto.md](00_indice_projeto.md) | Mapa geral e ordem recomendada de execução |

> O arquivo [projeto_camara_v2.md](projeto_camara_v2.md) é o **documento mestre original** (referência histórica e detalhada). As etapas acima são a versão **organizada e atualizada** (já com a decisão de "só chave rotativa, sem disjuntor").
