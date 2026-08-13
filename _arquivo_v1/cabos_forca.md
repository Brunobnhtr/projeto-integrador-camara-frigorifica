# ETAPA 5 — Força e Alimentação (AC + Distribuição DC)

> Quinta etapa: levar energia ao sistema. Cobre a **entrada AC**, o **comando da fonte**, a **distribuição DC** (12 V / 5 V / GND), a **proteção**, o **star ground** e o **corte de emergência**.
>
> ## 📌 Decisão de projeto: comando e proteção da fonte
> **Esta versão NÃO usa disjuntor para proteger a fonte e NÃO usa chave/botão de seccionamento.** O único elemento de manobra do circuito AC é a **chave rotativa 0‑1 (botão rotativo)**, que liga e desliga a fonte principal (ATX).
>
> **O que protege o lado AC, então?**
> 1. O **fusível interno da própria fonte ATX** (toda fonte ATX tem um fusível de entrada, tipicamente 250 V / 5–8 A, mais OCP/OVP/SCP eletrônicas internas).
> 2. O **disjuntor do quadro/tomada da instalação** onde o projeto é ligado (já existente no local).
>
> **Por que isso é aceitável aqui:** trata‑se de um protótipo de bancada de baixa potência (a ATX puxa bem menos que o limite da tomada). A chave rotativa cumpre a função de **seccionamento e comando** (liga/desliga tudo). Sem disjuntor dedicado, a manobra fica concentrada em um único ponto, simples de operar.
>
> ⚠️ **Cuidados que isso exige:**
> - A **chave rotativa deve ser dimensionada para a corrente AC** da ATX (escolher modelo com corrente nominal ≥ 6 A AC e tensão compatível com 220 V).
> - Ela **secciona apenas a fase (L)**. O neutro e o terra vão direto à ATX.
> - O **terra (PE)** é obrigatório e nunca é interrompido.
> - A proteção contra curto/sobrecarga do lado AC depende do fusível interno da ATX + disjuntor do quadro — confira se a tomada usada tem disjuntor adequado.

---

## 5.1 Hierarquia de Força (AC → DC)

```
TOMADA 220 V (instalação — já tem disjuntor de quadro)
      │  Fase (L) / Neutro (N) / Terra (PE)
      │
 [CHAVE ROTATIVA 0‑1, 22 mm]  ← ÚNICO comando AC — secciona a FASE (liga/desliga a fonte)
      │
 [FONTE ATX 500 W]            ← proteção própria: fusível AC interno + OCP/OVP/SCP
      │   PS_ON ── [jumper fixo p/ GND]  → ATX liga sozinha ao receber 220 V
      │
  ┌───┴──────────────────────────────────────────┐
  │ 12 V ─[fusível 10 A DC]─► BTS #1 + BTS #2      │  ← proteção da CARGA (não da fonte)
  │                              │                 │
  │            [emergência NF] ──┘  (corta 12 V dos BTS, em hardware)
  │ 12 V ───────────────────► Fans / cooler externo
  │ 12 V ───────────────────► DNLCB30 + ESP32
  │ 5 V  ───────────────────► Arduino + Nextion
  └───────────────────────────────────────────────┘
```

> **Importante:** o **fusível de 10 A no ramal 12 V dos BTS** continua existindo. Ele **não protege a fonte** — protege o ramal de potência da Peltier/PTC contra curto na carga. É distinto do "disjuntor da fonte" que foi dispensado.
> A **emergência** corta os 12 V apenas dos BTS, em hardware. Arduino, ESP32 e Nextion **continuam alimentados** para registrar o evento.

---

## 5.2 Ligar a ATX sem PC (jumper PS_ON)

A ATX só liga quando o pino **PS_ON (verde)** é aterrado. Como não há PC, faz‑se um **jumper fixo**:

```
Conector ATX 24 pinos:
  Fio VERDE  (PS_ON, pino 16) ──┐
  Fio PRETO  (GND,   pino 15) ──┘  jumper fixo (fio 0.5 mm²)
```

Assim, ao girar a chave rotativa para "1", a ATX recebe 220 V e **liga automaticamente**.

> O **Arduino NÃO controla o PS_ON.** START/STOP atuam só sobre os BTS (potência dos atuadores), não sobre a fonte.

---

## 5.3 Mapeamento de Tensões (raíls da ATX)

| Raíl ATX | Tensão | Cabo nativo | Alimenta |
|---|---|---|---|
| Amarelo | 12 V | Molex / ATX24 | BTS #1, BTS #2, fans, cooler externo, DNLCB30 |
| Vermelho | 5 V | Molex / ATX24 | Arduino Mega, Nextion |
| Preto | GND | Todos | GND comum (star ground) |

> O **ESP32 é alimentado pela DNLCB30** (que regula 12 V → 3.3 V internamente). **Não** conectar 3.3 V da ATX no ESP32.
> A **Nextion** aceita 5 V (faixa 4.75–7 V) — alimenta junto com o Arduino no raíl de 5 V.

---

## 5.4 Cabos AC (entrada do painel)

> ⚠️ **Executar com o painel DESLIGADO da tomada.**

| Fio | Cor padrão BR | Seção | De → Para |
|---|---|---|---|
| Fase (L) | Preto ou marrom | 1.5 mm² | Tomada → **Chave rotativa** pino 1 |
| Fase (L) | Preto ou marrom | 1.5 mm² | **Chave rotativa** pino 2 → ATX entrada **L** |
| Neutro (N) | Azul | 1.5 mm² | Tomada → ATX entrada **N** (direto) |
| Terra (PE) | Verde/amarelo | 1.5 mm² | Tomada → ATX **terra** (direto, nunca seccionado) |

> Observe: a fase passa **somente pela chave rotativa** antes de chegar à ATX. **Não há disjuntor nem seccionadora nesse caminho.**

---

## 5.5 Distribuição DC — ATX para os Bornes

**12 V (amarelo Molex):**

| Cabo | Seção | De → Para | Proteção |
|---|---|---|---|
| 12 V ramal potência | 1.5 mm² | ATX Molex amarelo → **fusível 10 A** → Borne **12V‑POT** | Fusível 10 A (carga) |
| 12 V ramal fans | 0.75 mm² | ATX Molex amarelo → Borne **12V‑FAN** | OCP interna da ATX |
| 12 V ramal lógica | 0.75 mm² | ATX Molex amarelo → Borne **12V‑LOG** | OCP interna da ATX |

**5 V (vermelho Molex):**

| Cabo | Seção | De → Para |
|---|---|---|
| 5 V ramal lógica | 0.75 mm² | ATX Molex vermelho → Borne **5V** |

**GND (preto — star ground):**

| Cabo | Seção | De → Para |
|---|---|---|
| GND principal | 2.5 mm² | TODOS os pretos Molex → Borne **GND‑CENTRAL** |

> **Porta‑fusível:** mini automotivo em trilho DIN — busca: **"porta fusível mini automotivo trilho DIN"**.

---

## 5.6 Distribuição DC — Bornes para Componentes

**Potência dos BTS7960 (passa pela emergência):**

| Cabo | Seção | De → Para | Obs |
|---|---|---|---|
| 12 V BTS | 1.5 mm² | Borne 12V‑POT → **Emergência NF** (contato 1) entrada | Passa pela emergência |
| 12 V BTS | 1.5 mm² | Emergência (contato 1) saída → BTS #1 **B+** | — |
| 12 V BTS | 1.5 mm² | Emergência (contato 1) saída → BTS #2 **B+** | Em paralelo (nunca ligam juntos) |
| GND BTS | 1.5 mm² | Borne GND‑CENTRAL → BTS #1 **B‑** | — |
| GND BTS | 1.5 mm² | Borne GND‑CENTRAL → BTS #2 **B‑** | — |

**Alimentação da lógica:**

| Cabo | Seção | De → Para |
|---|---|---|
| 5 V Arduino | 0.5 mm² | Borne 5V → Arduino **VIN** (ou 5V) |
| GND Arduino | 0.5 mm² | Borne GND‑CENTRAL → Arduino GND |
| 12 V DNLCB30 | 0.5 mm² | Borne 12V‑LOG → DNLCB30 **VIN** |
| GND DNLCB30 | 0.5 mm² | Borne GND‑CENTRAL → DNLCB30 GND |
| 5 V Nextion | 0.5 mm² | Borne 5V → Nextion 5V (vermelho) |
| GND Nextion | 0.5 mm² | Borne GND‑CENTRAL → Nextion GND (preto) |

**Cooler externo da Peltier (sempre ligado, sem passar pelo BTS):**

| Cabo | Seção | De → Para |
|---|---|---|
| Cooler ext 12 V | 0.5 mm² | Borne 12V‑FAN → cooler externo **+** |
| Cooler ext GND | 0.5 mm² | Borne GND‑CENTRAL → cooler externo **‑** |

> O **fio de RPM** (amarelo) do cooler externo vai ao Arduino — ver [ETAPA 6](cabos_comandos.md).

---

## 5.7 Star Ground (obrigatório)

Todos os GNDs convergem para **um único borne central** antes de retornar à ATX:

```
BTS #1 GND ───┐
BTS #2 GND ───┤
Fans GND   ───┼──► BORNE GND‑CENTRAL ──► ATX GND (fio preto 2.5 mm²)
Arduino GND ──┤
ESP32 GND  ───┤
Nextion GND ──┘
```

> **Regra:** nunca conectar o GND de dois dispositivos diretamente entre si — todos passam **primeiro** pelo borne GND‑CENTRAL. Sem star ground, o ruído de chaveamento dos BTS contamina as leituras analógicas (pinos IS, sensores) e a comunicação serial.

---

## 5.8 Corte de Emergência (hardware)

O botão cogumelo usa **2 blocos de contato NF empilhados**:

| Bloco | Função |
|---|---|
| Bloco 1 (NF) | **Corta os 12 V dos BTS** (hardware) — Peltier e PTC desligam fisicamente |
| Bloco 2 (NF) | **Sinaliza o Arduino** (pino D24) — software registra e trava o processo |

> Busca: **"bloco contato NF 22 mm empilhável"**.
> Após destravar o cogumelo, o sistema **não reinicia sozinho** — exige novo START manual (boa prática de segurança, alinhada à NR‑12). A lógica está na [ETAPA 7 — Firmware](firmware.md).

---

## 5.9 Tabela de Proteções do Sistema

| Onde | Dispositivo | Protege contra |
|---|---|---|
| Quadro/tomada da instalação | Disjuntor existente do local | Curto/sobrecarga geral da rede |
| Entrada da ATX | **Fusível interno da ATX** + OCP/OVP/SCP eletrônicas | Curto/sobrecarga na própria fonte |
| Comando AC | **Chave rotativa 0‑1** | Seccionamento/desligamento manual de tudo |
| Ramal 12 V dos BTS | **Fusível 10 A DC** | Curto na carga (Peltier/PTC), ~6.5 A pior caso |
| Atuadores | **Botão de emergência** (corta 12 V BTS) | Parada imediata em hardware |
| Demais ramais DC | OCP interna da ATX | Sobrecorrente em fans/lógica |
| Todo o sistema | **Star ground** | Ruído e referência de GND |

---

## 5.10 Verificações antes de Energizar

- [ ] **Painel desconectado da tomada** durante toda a fiação.
- [ ] Continuidade do **terra (PE)** da tomada até o chassi da ATX.
- [ ] Chave rotativa secciona **só a fase**; neutro e terra diretos à ATX.
- [ ] **Jumper PS_ON** (verde ↔ preto) instalado no conector 24 pinos.
- [ ] **Fusível 10 A** instalado no porta‑fusível do ramal BTS.
- [ ] Medir **resistência 12V‑POT → GND** (não pode ser ~0 Ω = curto).
- [ ] Medir **resistência 5V → GND** (não pode ser ~0 Ω).
- [ ] Todos os GNDs no **borne GND‑CENTRAL** (star ground).
- [ ] Primeiro teste: girar a chave → a **ventoinha da ATX deve girar** e as tensões 12 V/5 V aparecerem nos bornes (medir com multímetro). Detalhes na [ETAPA 8](montagem_comissionamento.md).

> Próxima etapa: [ETAPA 6 — Comando, Sensores e Sinais](cabos_comandos.md).
