# ETAPA 4 — Painel de Comando (Montagem Mecânica)

> Quarta etapa: montar o **painel industrial** — a estrutura que abriga a eletrônica, os trilhos DIN, os botões, a IHM Nextion e a fonte ATX. Aqui tratamos só da **parte mecânica** (dimensões, furação, fixação dos componentes nos trilhos). O cabeamento de força entra na [ETAPA 5](cabos_forca.md) e o de comando na [ETAPA 6](cabos_comandos.md).
>
> 📌 **Comando AC desta versão:** o único elemento de manobra do circuito AC é a **chave rotativa 0‑1**, instalada na **lateral** do painel. **Não há disjuntor** nem chave de seccionamento no painel.

---

## 4.1 Dimensões do Painel (backplate)

| Dimensão | Valor | Origem |
|---|---|---|
| **Largura** | **300 mm** | Definida pelo layout da base da maquete |
| **Altura** | **450 mm** | Pilha vertical de componentes (cálculo abaixo) |
| **Profundidade disponível** | **180 mm** | Definida pelo layout da base |

**Cálculo da altura (pilha de baixo para cima):**

```
┌─────────────────────────────────────────────┐  ← topo
│  margem superior                    30 mm   │
│  zona botões + Nextion             100 mm   │  Nextion 76 mm + botões 22 mm
│  canaleta horizontal                40 mm   │
│  trilho DIN 1 + componentes         85 mm   │  SPCI4 + BTS7960 ~80 mm + trilho 7.5 mm
│  canaleta horizontal                40 mm   │
│  trilho DIN 2 + componentes         85 mm   │  Arduino Mega + Shield ~80 mm + trilho
│  canaleta base                      40 mm   │
│  margem inferior (entrada cabos)    30 mm   │
└─────────────────────────────────────────────┘  ← base
                                   TOTAL 450 mm
```

> **Confirme com régua** quando os componentes chegarem, antes de furar o MDF.

### Peças do gabinete

| Peça | Dimensão | Material |
|---|---|---|
| Backplate (fundo) | 300 × 450 mm | MDF 18 mm ou chapa de aço 1.5 mm |
| Tampa frontal | 300 × 450 mm | MDF 12 mm ou acrílico 5 mm |
| Laterais (×2) | 180 × 450 mm | MDF 18 mm |
| Topo e base (×2) | 300 × 180 mm | MDF 18 mm |

> Caixa fechada: dimensões internas **300 × 450 × 180 mm**. Alternativa: comprar caixa de comando pronta — busca: **"caixa de comando 300x450 trilho DIN"**.

---

## 4.2 Layout Frontal (vista de frente)

```
←──────────── 300 mm ────────────→
┌──────────────────────────────────────────┐  ↑
│  [Emergência]  [START]  [STOP]           │  │ 30 mm margem
│  [Nextion 3.2" — 98×57 mm]               │  │ 100 mm
├──────────────────────────────────────────┤  │ 40 mm canaleta
│ ══ TRILHO DIN 1 ═══════════════════════ ║  │
│  [fusível 10A DC] [BTS7960 #1] [BTS #2]  │  │ 85 mm
├──────────────────────────────────────────┤  │ 40 mm canaleta
│ ══ TRILHO DIN 2 ═══════════════════════ ║  │
│  [Arduino Mega + Shield] [DNLCB30+ESP32] │  │ 85 mm
│  [SD+RTC]  [Bornes DIN]                  │  │
│ ══ canaleta base ══════════════════════ ║  │ 40 mm
│  entrada cabos câmara + saída ATX        │  │ 30 mm
└──────────────────────────────────────────┘  ↓ 450 mm total
```

> A **chave rotativa 0‑1** fica na **lateral** do painel (não na face frontal) — ver 4.4.
> ESP32 (DNLCB30) ao lado do Arduino Mega no mesmo trilho, para deixar o cabo Serial1 curto (<20 cm) e evitar interferência.

---

## 4.3 Disposição nos Trilhos DIN

| Trilho | Componentes (da esquerda p/ direita) |
|---|---|
| **DIN 1** (superior) | Porta‑fusível 10 A (DC) · BTS7960 #1 (no SPCI4) · BTS7960 #2 (no SPCI4) |
| **DIN 2** (inferior) | Arduino Mega + Shield · DNLCB30 + ESP32 · Módulo SD + RTC · Bornes de distribuição (12V‑POT, 12V‑FAN, 12V‑LOG, 5V, GND‑CENTRAL) |

> Os BTS7960 vão fixados nos **suportes SPCI4** (encaixam no trilho DIN). Para uso contínuo acima de ~5 A, posicionar o **cooler 40 mm** soprando sobre eles.

---

## 4.4 Posição dos Controles

| Elemento | Face | Tipo | Função |
|---|---|---|---|
| **Chave rotativa 0‑1** | **Lateral** | Rotativa 22 mm | **Força geral AC** — liga/desliga a fonte ATX (único comando AC) |
| Emergência | Frente | Cogumelo 22 mm, NF, trava | Corta os 12 V dos BTS (hardware) + sinaliza o Arduino |
| START | Frente | Botão verde 22 mm, NA | Inicia o processo |
| STOP | Frente | Botão preto 22 mm, NF | Para o processo |
| Nextion | Frente | Recorte 98 × 57 mm | IHM / configuração |
| LEDs (×4) | Frente | Sinaleiros 22 mm | RUN / COOL / HEAT / FAULT |

---

## 4.5 Furação e Recortes (gabarito)

| Furo / recorte | Medida | Quantidade | Onde |
|---|---|---:|---|
| Furo para botão/LED/chave | Ø 22 mm | 8 | Frente: emergência, START, STOP, 4 LEDs · Lateral: chave rotativa |
| Recorte Nextion | 98 × 57 mm | 1 | Frente (tampa) |
| Furo fixação trilho DIN | Ø 5 mm (M5) | conforme trilho | Backplate |
| Entrada de cabos (prensa‑cabo PG9) | Ø ~15 mm | 2–4 | Fundo/traseira inferior |

> Sequência segura: **marcar → furar com broca‑guia → alargar para 22 mm com escareador/serra‑copo**. Lixar rebarbas antes de instalar os componentes.

---

## 4.6 Passo a Passo da Montagem Mecânica

1. **Cortar/furar o backplate** conforme 4.1 e 4.5 (ainda sem componentes).
2. **Fixar os 2 trilhos DIN** com parafusos M5×10 mm.
3. **Fixar as canaletas** horizontais entre e ao redor dos trilhos.
4. **Recorte da Nextion** (98×57 mm) e furos de 22 mm na tampa frontal.
5. **Furo de 22 mm na lateral** para a chave rotativa.
6. **Entrada de cabos:** furos + prensa‑cabos PG9 no fundo/traseira.
7. **Encaixar nos trilhos** (sem cabos ainda):
   - BTS7960 #1 + SPCI4 → DIN 1 (esquerda)
   - BTS7960 #2 + SPCI4 → DIN 1 (centro)
   - Porta‑fusível 10 A DC → DIN 1
   - Arduino Mega + Shield → DIN 2 (esquerda)
   - DNLCB30 + ESP32 → DIN 2 (centro, ao lado do Arduino)
   - Módulo SD + RTC → DIN 2 (junto ao Arduino)
   - Bornes de distribuição → DIN 2 (direita)
8. **Instalar na tampa/lateral:** Nextion (parafusos M3), botões, LEDs e a chave rotativa.
9. **Posicionar a ATX** atrás do painel (será fixada na base na [ETAPA 8](montagem_comissionamento.md)).

---

## 4.7 Canaletas e Separação de Cabos

- **Separe fisicamente** os cabos de **potência** (grossos) dos de **sinal** (finos) em lados/canaletas diferentes — reduz interferência.
- A canaleta inferior leva os cabos do painel para a **câmara** e os da **ATX**.
- Deixe folga e identifique cada cabo com etiqueta antes de fechar a tampa.

---

## 4.8 Checklist da ETAPA 4

- [ ] Backplate cortado e furado (trilhos, botões, Nextion, chave lateral, entrada de cabos)
- [ ] 2 trilhos DIN fixados (M5)
- [ ] Canaletas instaladas
- [ ] BTS #1, BTS #2 (em SPCI4) e porta‑fusível no DIN 1
- [ ] Arduino+Shield, DNLCB30+ESP32, SD+RTC e bornes no DIN 2
- [ ] Nextion, botões, LEDs montados na frente
- [ ] **Chave rotativa 0‑1** montada na lateral
- [ ] Prensa‑cabos instalados
- [ ] ATX posicionada atrás do painel

> Próxima etapa: [ETAPA 5 — Força e Alimentação](cabos_forca.md).
