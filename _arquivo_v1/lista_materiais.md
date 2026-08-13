# ETAPA 2 — Lista de Materiais (BOM Completa)

> Segunda etapa: **comprar tudo**. Esta lista está organizada por subsistema, com **quantidade**, **especificação** e uma coluna de **link de compra** para você preencher.
>
> 📌 **Proteção/comando AC desta versão:** **não há disjuntor** e **não há chave de seccionamento**. O único comando do circuito AC é a **chave rotativa 0‑1**. Por isso a antiga linha "Disjuntor termomagnético" foi **removida** da BOM. A proteção do lado AC fica por conta do **fusível interno da própria fonte ATX** e do disjuntor já existente do quadro/tomada da instalação. Justificativa completa na [ETAPA 5 — Força](cabos_forca.md).

---

## 2.1 Lógica, Interface e Rede

| Item | Qtd | Especificação | Link de compra |
|---|---:|---|---|
| Arduino Mega 2560 R3 | 1 | ATmega2560, 54 GPIO, 4 UARTs nativas | |
| Shield expansão Mega (bornes DIN) | 1 | Sensor Shield V2.0 com bornes parafuso | |
| Tela Nextion Basic 3.2" | 1 | NX4024T032 (400×240, TTL 5 V) | |
| ESP32‑WROOM‑32U | 1 | 30 pinos, antena IPEX externa | |
| **DNLCB30** — base DIN p/ ESP32 | 1 | Conversão 3.3 V↔5 V bidirecional automática, entrada 7–35 V, trilho DIN. **Não inclui o ESP32** | |
| Antena 2.4 GHz IPEX→SMA | 1 | Pigtail IPEX + antena 3 dBi para painel | |

> **Nota DNLCB30:** comprar o ESP32 separado e encaixar. A conversão de nível 5 V↔3.3 V é automática em todos os pinos — **elimina a necessidade de level shifter externo**.

---

## 2.2 Potência e Atuadores Térmicos (12 V)

| Item | Qtd | Especificação | Link de compra |
|---|---:|---|---|
| Fonte ATX 12 V | 1 | 500 W reais mínimo, linha 12 V ≥ 20 A (pode reaproveitar fonte de PC) | |
| Pastilha Peltier TEC1‑12706 | 1 | 60 W, ~6 A @ 12 V | |
| Aquecedor PTC cerâmico | 1 | 12 V, 50–100 W, com aletas | |
| Fan 60×60 mm 12 V | 2 | Lado PTC: 1 integrada (sopra ↑) + 1 extra (sopra ↓) | |
| Fan 40×40 mm 12 V | 2 | Lado Peltier: 1 do kit (sopra ↓) + 1 extra (sopra ↑) | |
| Cooler externo lado quente Peltier (3 pinos) | 1 | 12 V com sinal de **RPM** (fio amarelo) — sempre ligado | |
| Dissipador + pasta térmica p/ Peltier | 1 | Dissipador aletado lado quente + pasta térmica | |

> **Ventoinhas internas: 4 no total** (2 já vêm nos kits Peltier/PTC + 2 compradas à parte).

| Fan | Tamanho | Direção fixa | Controlada por |
|---|---|---|---|
| Integrada PTC | 60×60 | Sopra ↑ | BTS #2 — modo quente |
| Extra lado PTC | 60×60 | Sopra ↓ | BTS #1 — modo frio |
| Integrada kit Peltier | 40×40 | Sopra ↓ | BTS #1 — modo frio |
| Extra lado Peltier | 40×40 | Sopra ↑ | BTS #2 — modo quente |

---

## 2.3 Drivers e Acionamento

| Item | Qtd | Especificação | Link de compra |
|---|---:|---|---|
| Driver ponte‑H BTS7960 | 2 | 43 A contínuos, pino **IS** (diagnóstico de corrente) | |
| Suporte SPCI4 trilho DIN | 2 | ABS, fixa PCI 100×79 mm, DIN 35 mm | |
| Cooler 40 mm 12 V p/ os BTS (opcional) | 1 | Refrigeração extra dos drivers em uso contínuo >5 A | |
| Botão de Emergência cogumelo 22 mm | 1 | NF, com trava, **2 blocos de contato empilháveis** (1 corta 12 V dos BTS, 1 sinaliza o Arduino) | |
| Botão START 22 mm | 1 | Verde, momentâneo **NA** | |
| Botão STOP 22 mm | 1 | Preto, momentâneo **NF** | |
| Módulo Micro SD (SPI) | 1 | 5 V, compatível Arduino — logging local | |
| Módulo RTC DS3231 | 1 | I²C, precisão ±2 ppm | |
| Bateria CR2032 | 1 | Backup do RTC DS3231 | |

> **Sem relé slim:** o intertravamento entre BTS #1 (Peltier) e BTS #2 (PTC) é **por software** — os dois nunca ficam ativos ao mesmo tempo.

---

## 2.4 Sensoriamento

| Item | Qtd | Especificação | Link de compra |
|---|---:|---|---|
| Sensor de temperatura DS18B20 | 1 | Digital 1‑Wire, ±0.5 °C, à prova d'água — centro da câmara | |
| Resistor pull‑up 4.7 kΩ | 1 | 1/4 W — barramento 1‑Wire | |
| Sensor umidade/temperatura AM2315C | 1 | I²C, ±0.3 °C / ±2 % UR, carcaça fechada | |

---

## 2.5 Comando AC e Painel (mecânico / sinalização)

| Item | Qtd | Especificação | Link de compra |
|---|---:|---|---|
| **Chave rotativa 0‑1 22 mm** | 1 | **Único comando do circuito AC** — liga/desliga a fonte. Corrente nominal ≥ 6 A AC, fixação 22 mm na lateral do painel | |
| Porta‑fusível p/ trilho DIN | 1 | Para o ramal de potência DC dos BTS | |
| Fusível mini automotivo 10 A | 1 | Ramal de potência 12 V dos BTS (proteção da **carga**, não da fonte) | |
| Trilho DIN 35 mm | 1 | 1 m, aço galvanizado (cortar conforme necessidade) | |
| Bornes parafuso DIN 2.5 mm² | 10 | Distribuição 12 V / 5 V / GND (incl. borne GND‑CENTRAL maior) | |
| LEDs sinalizadores 22 mm | 4 | Verde (RUN) / Azul (COOL) / Amarelo (HEAT) / Vermelho (FAULT) | |
| Prensa‑cabo PG9 | 4 | Entrada/saída de cabos no painel | |

> ⚠️ A chave rotativa **secciona apenas a fase (L)** que alimenta a ATX. Não existe outro dispositivo de manobra AC no painel.

---

## 2.6 Cabos

| Item | Qtd | Especificação | Link de compra |
|---|---:|---|---|
| Cabo flexível 1.5 mm² (preto + vermelho) | ~3 m | AC de entrada e potência 12 V dos BTS | |
| Cabo flexível 2.5 mm² (preto) | ~1 m | GND principal (star ground) ATX → borne central | |
| Cabo flexível 0.75 mm² | ~3 m | Ramais 12 V de fans e lógica, 5 V | |
| Cabo flexível 0.5 mm² | ~3 m | Alimentação de periféricos, cooler externo | |
| Cabo 0.25 mm² (várias cores) | ~5 m | Sinais, sensores, botões, comunicação | |

---

## 2.7 Estrutura Física — Câmara e Base

| Item | Qtd | Especificação | Link de compra |
|---|---:|---|---|
| Acrílico transparente 5 mm | 6 peças | Paredes/tampas/base da câmara (ver [ETAPA 3](acrilico.md)) | |
| Acrílico transparente 10 mm | 1 peça | Porta frontal | |
| Acrílico transparente 3 mm | 10 peças | Dutos externos | |
| Acrílico preto/cinza 3 mm | 5 peças | Cobertura externa do isolamento | |
| XPS 20 mm | ~50×50 cm | Isolamento térmico | |
| Bandeja de alumínio | 1 | Coleta de condensado (fundo da câmara) | |
| Tubo de silicone (dreno) | ~30 cm | Dreno do condensado para fora do painel | |
| MDF 18 mm | 1 | Backplate do painel + base da maquete (65×30 cm) | |
| Cola S‑320 Sinteglas | 1 | 250 ml ou 1 L — colagem de acrílico | |
| Silicone neutro transparente | 1 | Vedação de bordas | |
| Perfil EPDM autoadesivo 5 mm | 1 m | Vedação da porta | |
| Dobradiça piano alumínio | 1 | 75 cm (cortar para 25 cm) — porta frontal | |
| Fecho de pressão p/ caixa (inox) | 2 | Fechamento da porta | |
| Sílica gel indicadora | 2 sachês | Controle de umidade interna | |
| Tinta preta fosca spray | 1 | Acabamento da base/painel MDF | |
| Pés de borracha autoadesivos | 4 | Cantos da base | |
| Parafusos M3 / M4 / M5 (kits) | — | Fixações gerais (trilho, painel, câmara, dobradiça) | |

---

## 2.8 Resumo de Quantidades (conferência rápida)

| Grupo | Itens‑chave |
|---|---|
| Controle | 1× Arduino Mega, 1× ESP32, 1× DNLCB30, 1× Nextion 3.2" |
| Potência | 1× ATX, 1× Peltier, 1× PTC, 2× BTS7960 |
| Ventilação | 4× fans internas (2×60 mm + 2×40 mm) + 1× cooler externo 3 pinos |
| Sensores | 1× DS18B20, 1× AM2315C, 1× RTC DS3231, 1× módulo SD |
| Comando AC | **1× chave rotativa 0‑1** (sem disjuntor, sem seccionadora) |
| Proteção DC | 1× porta‑fusível DIN + 1× fusível 10 A (ramal BTS) |
| Comando do processo | 1× emergência cogumelo (2 contatos), 1× START, 1× STOP |
| Sinalização | 4× LED 22 mm |

> 💡 Os links do Mercado Livre / AliExpress podem ser colados na última coluna. Os scripts `gerar_excel_materiais.py` e `gerar_excel_completo.py` geram uma planilha a partir desta lista — eles também já tiveram a linha do disjuntor removida para ficar coerente com esta versão.
