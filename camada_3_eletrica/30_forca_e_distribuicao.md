# CAMADA 3 · Doc 30 — Força e Distribuição

> Toda a fiação de energia: do plugue de 127 V até os blocos de distribuição de **24 V, 12 V, 5 V e 0 V** dentro do painel. Feito **por trechos**, energizando e medindo cada um antes de seguir.
>
> 🔄 **Atualizado para a arquitetura "Potência em 24 V".** O poste P1 não tem mais conversor — os 24 V passam direto até os BTS7960. Saíram os fusíveis F4/F5 e os três crowbars Zener. Ver [Doc 02](../camada_0_fundamentos/02_arquitetura_de_energia.md).
>
> ✅ **Pré-requisito:** Camadas 1 e 2 concluídas (maquete pronta, painel montado mecanicamente).
> 🖼️ **Desenho:** [Diagrama unifilar](../desenhos/05_diagrama_unifilar.svg)

---

## 🟢 Em palavras simples — agora os fios entram

Até aqui você construiu a maquete e montou o painel **sem um único fio ligado**. Nesta etapa a coisa é ligada.

E aqui está a regra que evita 90 % dos acidentes e das horas perdidas:

> ⚠️ **A maquete fica DESLIGADA DA TOMADA durante toda a montagem.** Só se energiza no fim de cada trecho, com o multímetro na mão, seguindo o roteiro da §30.8.

### Por que a lista de cabos é numerada

Este documento tem uma tabela com **mais de 60 cabos numerados**. Parece exagero. Não é — é o que separa um painel profissional de um emaranhado.

| Sem numeração | Com numeração |
|---|---|
| "aquele fio vermelho ali" | "cabo 34" |
| Achar um defeito = seguir fio com o dedo | Achar um defeito = olhar a tabela |
| Só quem montou entende | Qualquer pessoa entende |

Cada cabo ganha uma **anilha** (etiquetinha numerada) nas duas pontas. É exigência de norma em painel industrial, e é o que permite dar manutenção meses depois sem lembrar de nada.

### Como montar sem se perder: trecho por trecho

O documento divide a montagem em **5 trechos**, e a ordem não é aleatória — vai da fonte para a carga:

```
TRECHO 1   Fiação de 127 V dentro da subestação        ⚡ o único perigoso
    ▼
TRECHO 2   Saída de 24 V e a linha sobre os postes
    ▼
TRECHO 3   Derivações e conversores no topo dos postes
    ▼
TRECHO 4   Entrada no painel e distribuição
    ▼
TRECHO 5   Saídas do painel para a câmara
```

**Termine e teste um trecho antes de começar o próximo.** Se você ligar tudo e só então energizar, um erro em qualquer ponto se manifesta como "não funciona" — e você tem 60 cabos para investigar. Testando por trecho, o erro está sempre nos últimos cabos que você ligou.

### O que é um diagrama unifilar

É o "mapa do metrô" da instalação elétrica: mostra **por onde a energia passa e o que a protege**, sem desenhar cada fio individualmente. Um traço representa o caminho inteiro.

Serve para responder de relance: *"se eu desligar isto aqui, o que apaga?"*

### As duas regras de ouro da montagem

**1. Terminal tubular em toda ponta que entra em borne parafuso.**
Fio flexível é feito de muitos fiozinhos. Apertado direto no parafuso, alguns escapam, outros amassam — e daí a semanas você tem mau contato intermitente, o defeito mais difícil de achar que existe. O terminal (ilhós) prende todos juntos.

**2. Potência de um lado, sinal do outro, com 5 cm de separação.**
Quando precisarem se cruzar, cruze a **90°**. Cabos paralelos "conversam" por indução; perpendiculares, quase não.

### Dicionário rápido

| Termo | O que quer dizer |
|---|---|
| **Unifilar** | Diagrama que mostra o caminho da energia com um traço só |
| **Trecho** | Um pedaço da instalação que se monta e testa antes de seguir |
| **Anilha** | Etiqueta numerada no fio |
| **Terminal tubular / ilhós** | Ponteira crimpada na ponta do fio flexível |
| **Crimpar** | Amassar o terminal no fio com alicate próprio (não é apertar com alicate comum) |
| **Derivação em janela** | Abrir uma "janelinha" na capa do fio e soldar outro ali, **sem cortar** o original |
| **PE** | Fio terra (verde-amarelo) |
| **Star ground** | Todos os retornos indo a um único ponto, em estrela |
| **Prensa-cabo** | Passagem rosqueada do cabo pela parede do painel |
| **BD-alguma-coisa** | Bloco de Distribuição daquela tensão (BD-5V, BD-POT...) |

---

## ⚠️ Antes de começar

> **A maquete permanece DESLIGADA DA TOMADA durante 100 % desta etapa.**
> Só se energiza no fim de cada trecho, seguindo o roteiro da §30.8, sempre com o multímetro na mão.
>
> Ferramentas: multímetro, alicate de crimpar terminal tubular, alicate desencapador, estilete, ferro de solda, chave Philips 3 mm e uma **carga resistiva de teste** (§30.8).

---

## 30.1 Diagrama unifilar

```
                        TOMADA 127 V CA (2P+T)
                               │ cabo PP 3 × 1,5 mm²
   ╔═══════════════════════════╪══════════════════════════════════════════╗
   ║  SUBESTAÇÃO — única parte com 127 V CA (caixa fechada)                ║
   ║                           │                                           ║
   ║   PE ─────────────────────┼───────► BARRA DE TERRA ──► carcaça da fonte
   ║                           │                                           ║
   ║              ┌────────────┴────────────┐                              ║
   ║              │  Q0 · DISJUNTOR 2P 6A C │                              ║
   ║              └────────────┬────────────┘                              ║
   ║                      L ───┴─── N                                      ║
   ║              ┌────────────┴───┐                                       ║
   ║              │ S3 · CHAVE 0-1 │ (só a fase)                           ║
   ║              └────────────┬───┘                                       ║
   ║              ┌────────────┴────────────┐                              ║
   ║              │ G1 · FONTE 127VCA→24VCC │                              ║
   ║              │      10 A · 240 W       │                              ║
   ║              └──┬───────────────────┬──┘                              ║
   ║             +24 V                  0 V                                ║
   ║        ┌────────┼────────┐          │                                 ║
   ║     [F1 10A]  [F2 2A]  [F3 2A]      │                                 ║
   ╚════════╪════════╪════════╪══════════╪═════════════════════════════════╝
            │ RM1     │ RM2     │ RM3       │ 0 V
   ═════════╪════════╪════════╪══════════╪══════ LINHA COMPACTA PROTEGIDA
    vermelho│  marrom│   cinza│      azul│       sobre os postes P1, P2, P3
     1,0 mm²│ 0,5 mm²│ 0,5 mm²│   1,5 mm²│
            │        │        │          │
      ┌─────┴────────┼────────┼──────────┤   derivação em cada poste
      │              │        │          │   (positivo do ramal + 0 V)
      ▼              ▼        ▼          │
 ┌─────────┐   ┌─────────┐  ┌─────────┐  │
 │   P1    │   │ P2 · T2 │  │ P3 · T3 │  │
 │DERIVAÇÃO│   │ LM2596  │  │ LM2596  │  │
 │  bornes │   │24V→5,10V│  │24V→12,0V│  │
 │SEM conv.│   │ display │  │ display │  │
 └────┬────┘   └────┬────┘  └────┬────┘  │
      │ desce por dentro do poste e segue por baixo da base
      │ 24 V        │ 5,10 V     │ 12,0 V│
   ═══╪═════════════╪════════════╪═══════╪════ ENTRA NO PAINEL
      │             │            │       │      (3 prensa-cabos separados)
  ┌───┴────┐        │            │       │
  │  KA2   │        │            │       │   ⚡ relé de interface 24 V, contato 10 A
  │ 11→14  │        │            │       │      bobina: KA1 → STOP → KA2
  └───┬────┘        │            │       │
      ▼             ▼            ▼       ▼
 ┌─────────┐  ┌─────────┐  ┌─────────┐ ┌──────────┐
 │ BD-POT  │  │  BD-5V  │  │ BD-AUX  │ │  BD-0V   │  ⭐ star ground
 │  24 V   │  │ 5,10 V  │  │  12 V   │ │   0 V    │
 │comutado │  │ 6 saídas│  │ 4 saídas│ │ 8 saídas │
 │ 4 saídas│  │         │  │         │ │          │
 └────┬────┘  └────┬────┘  └────┬────┘ └────┬─────┘
  BTS #1 →      Arduino      2 coolers       │
  2× PELTIER    tela        externos        │
  BTS #2 →      SD/RTC       4 fans internas │
  PTC 24 V      lógica BTS   cooler BTS      │
                placa PI-1                   │
                LEDs da rua                  │
                                             ▼
                             todos os retornos convergem aqui

   ┌──────────────────────────────────────────────────────┐
   │ BD-24V (24 V PERMANENTE, não passa pelo KA2)         │
   │  ← ramal RM3, derivação no poste P3                   │
   │  → DNLCB30/ESP32 · cadeia de comando (KA1/KA2) ·     │
   │    (os sinaleiros saíram daqui: viraram de 5 V)      │
   │    NÃO cai com a emergência — de propósito: o        │
   │    sinaleiro de FALHA precisa continuar aceso        │
   └──────────────────────────────────────────────────────┘
```

> ⚠️ **Os dois barramentos de 24 V não são a mesma coisa.** O **BD-POT** vem do ramal RM1, passa pelo KA2 e **cai com a emergência**. O **BD-24V** vem do ramal RM3, é **permanente**, e é o que mantém o ESP32 vivo para publicar o evento. Anilhas de cores diferentes nos dois.

> 🔄 **Onde fica o corte de emergência:** entre o prensa-cabo de entrada e o bloco BD-POT.
>
> Quem corta é o **KA2**, um **relé de interface** de 24 V com contato de 10 A. A bobina dele é alimentada pelo **KA1** (o relé de habilitação, que tem selo e cai na emergência) através do **bloco NF do STOP**. Assim, **STOP e EMERGÊNCIA cortam os dois em hardware** — e só a emergência trava. Ver [Doc 31 §31.0](31_comando_e_protecoes.md).

> ⚠️ **Mudou o que o KA2 chaveia.** Antes eram 12 V / 6,3 A; agora são **24 V / 6,0 A**. A corrente é praticamente a mesma, mas **a tensão dobrou** — e corrente contínua em 24 V é mais difícil de interromper que em 12 V, porque o arco custa mais a extinguir. **Confirme que o contato do relé é declarado para 10 A em DC**, não só "10 A / 250 VAC": muitos modelos caem para 5 A ou menos em corrente contínua.

---

## 30.2 TRECHO 1 — Fiação AC dentro da subestação

> ⚠️ **Plugue fora da tomada. Sem exceção.**

| # | Cabo | Cor | Seção | De → Para |
|---|---|---|---|---|
| 1 | Terra (PE) | Verde/amarelo | 1,5 mm² | Plugue (pino central) → **barra de terra** |
| 2 | Terra (PE) | Verde/amarelo | 1,5 mm² | Barra de terra → **parafuso de aterramento da carcaça** da fonte |
| 3 | Fase (L) | Preto | 1,5 mm² | Plugue → **Q0, polo 1 entrada** |
| 4 | Neutro (N) | Azul | 1,5 mm² | Plugue → **Q0, polo 2 entrada** |
| 5 | Fase (L) | Preto | 1,5 mm² | Q0 polo 1 saída → **S3 chave rotativa, terminal 1** |
| 6 | Fase (L) | Preto | 1,5 mm² | S3 terminal 2 → **fonte, borne "L"** |
| 7 | Neutro (N) | Azul | 1,5 mm² | Q0 polo 2 saída → **fonte, borne "N"** |

| Regra | Motivo |
|---|---|
| **Terminal tubular (ilhós) em toda ponta** que entra em borne parafuso | Fio multifilar solto se desfia e faz mau contato |
| Deixar o **PE 20 mm mais longo** que L e N | Se o cabo for arrancado, o terra é o último a soltar |
| **Nenhum condutor AC exposto** com a tampa fechada | Use as tampas plásticas que vêm com a fonte |
| **Nunca inverter L e N na fonte** | A chave passaria a seccionar o neutro, deixando a fonte energizada pela fase |

> 🔎 **Identificar a fase:** chave de teste, ou multímetro em CA entre cada pino e o terra — a fase mostra ~127 V, o neutro ~0–5 V.

---

## 30.3 TRECHO 2 — Saída de 24 V e a linha sobre os postes

| # | Cabo | Cor | Seção | De → Para |
|---|---|---|---|---|
| 8 | +24 V | Vermelho | 1,5 mm² | Fonte `+V` → **borne +24V** da subestação |
| 9 | 0 V | Preto | 1,5 mm² | Fonte `−V` → **borne 0V** da subestação |
| 10 | +24 V | Vermelho | **1,00 mm²** | Borne +24V → **F1 (10 A)** entrada |
| 11 | +24 V | Vermelho | 0,5 mm² | Borne +24V → **F2 (2 A)** entrada |
| 12 | +24 V | Vermelho | 0,5 mm² | Borne +24V → **F3 (2 A)** entrada |
| 13 | **Ramal R1** | **Vermelho rígido** | **1,00 mm²** ⬆ | F1 saída → prensa-cabo → sobe no P1 → **cruzeta, posição ESQ** |
| 14 | **Ramal R2** | **Marrom rígido** | 0,50 mm² | F2 saída → sobe no P1 → **cruzeta, posição CENTRO** |
| 15 | **Ramal R3** | **Cinza rígido** | 0,50 mm² | F3 saída → sobe no P1 → **cruzeta, posição DIR** |
| 16 | **Retorno 0 V** | **Azul claro rígido** | **1,50 mm²** ⬆ | Borne 0V → sobe no P1 → **suporte a 220 mm** (40 mm abaixo da cruzeta) |

> ⬆ **Duas bitolas subiram** com a arquitetura de potência em 24 V: o **R1** passou a conduzir **6,0 A** (era 3,55 A) e o **retorno 0 V** conduz a soma dos três ramais, **6,9 A** (era 4,2 A). Usar os valores antigos reprova no critério de queda de tensão.

> ⚠️ **Todos os quatro condutores da linha são COM CAPA.** Em corrente contínua, dois condutores nus a 35 mm um do outro é um curto esperando acontecer — e o arco em CC não se extingue sozinho. Justificativa completa em [Doc 11 §11.2](../camada_1_maquete/11_subestacao_e_postes.md).
>
> Dentro do tubo do P1, a emenda entre o fio flexível (que vem da subestação) e o fio rígido (da linha) é feita com **solda + termorretrátil**.

### A linha continua de poste a poste

| Trecho | Condutores |
|---|---|
| P1 → P2 | R1, R2, R3 na cruzeta + 0 V abaixo |
| P2 → P3 | R1, R2, R3 na cruzeta + 0 V abaixo |

Cada condutor é **uma peça única e contínua** de P1 até P3 — as derivações são feitas em janela, sem cortar (§30.4).

---

## 30.4 TRECHO 3 — Derivações e transformadores

Em cada poste, tira-se **dois fios** da linha: o positivo daquele ramal e o retorno comum.

### P1 — DERIVAÇÃO · 24 V passante (potência) — **sem conversor**

| # | Cabo | Seção | De → Para |
|---|---|---|---|
| 17 | Derivação R1 | **1,00 mm² flex** | Janela no condutor **vermelho** → **borne de emenda** dentro do tubo do P1 |
| 18 | Derivação 0 V | **1,50 mm² flex** | Janela no condutor **azul** → **borne de emenda** dentro do tubo |
| 19 | Alimentação do leitor | 0,25 mm² | Derivação +24 V e 0 V → VCC/GND do **voltímetro-amperímetro** |
| 20 | **Saída 24 V POT** | **1,5 mm²** | Borne de emenda → desce por dentro do tubo → base → **PG9 do painel** |
| 21 | **Retorno POT** | **1,5 mm²** | Borne de emenda → desce pelo tubo → base → painel |

> ⭐ **O P1 não transforma nada — ele apenas deriva e distribui.** Os 24 V entram e saem com a mesma tensão, porque a carga (2× Peltier em série e PTC de 24 V) já opera nessa tensão. Dentro do tubo há apenas **bornes de emenda e o medidor**, não um conversor.
>
> 📌 **O shunt do amperímetro fica no P1**, e é o que faz o display mostrar a **corrente das Peltier ao vivo** durante a apresentação — o instrumento mais interessante da maquete. Passe o cabo #20 **através** do shunt do medidor, conforme o esquema que acompanha o instrumento.

### P2 — T2 · LM2596 · 24 V → 5,10 V (comando)

| # | Cabo | Seção | De → Para |
|---|---|---|---|
| 22 | Derivação R2 | 0,5 mm² flex | Janela no condutor **marrom** → **T2 IN+** |
| 23 | Derivação 0 V | 0,5 mm² flex | Janela no condutor **azul** → **T2 IN−** |
| ~~24~~ | ~~Alimentação do leitor~~ | — | **Não existe mais** — o display é integrado ao LM2596 e é alimentado pelo próprio módulo |
| 25 | **Saída 5 V** | 0,5 mm² | **T2 OUT+** → desce pelo tubo → base → **PG7 do painel** |
| 26 | **Retorno 5 V** | 0,5 mm² | **T2 OUT−** → desce pelo tubo → base → painel |

### P3 — T3 · LM2596 · 24 V → 12,0 V (auxiliar)

| # | Cabo | Seção | De → Para |
|---|---|---|---|
| 27 | Derivação R3 | 0,5 mm² flex | Janela no condutor **cinza** → **T3 IN+** |
| 28 | Derivação 0 V | 0,5 mm² flex | Janela no condutor **azul** → **T3 IN−** |
| ~~29~~ | ~~Alimentação do leitor~~ | — | **Não existe mais** — display integrado ao LM2596 |
| 30 | **Saída 12 V AUX** | **0,75 mm²** ⬆ | **T3 OUT+** → desce pelo tubo → base → **PG7 do painel** |
| 31 | **Retorno AUX** | **0,75 mm²** ⬆ | **T3 OUT−** → desce pelo tubo → base → painel |
| 32 | **+24 V serviços** | 0,5 mm² | Derivação R3 no P3 → desce pelo tubo → painel (**DNLCB30 e bobinas KA1/KA2**) |
| 33 | **Retorno do 24 V** | 0,5 mm² | Derivação 0 V no P3 → painel |

> ⬆ **A saída do T3 subiu para 0,75 mm²:** o ramal auxiliar passou de 0,59 A para **0,87 A**, porque herdou as 4 fans internas do antigo ramal de 12 V e ganhou o segundo cooler externo da Peltier.

> ⚠️ **O cabo #32 é fácil de esquecer.** A DNLCB30 (que alimenta o ESP32) e as bobinas dos relés **KA1 e KA2** trabalham em **24 V**, não em 12 nem em 5. Esse par de fios desce junto com a saída do T3, pelo mesmo tubo do poste P3.

> 🗑️ **Os cabos 24 e 29 foram eliminados.** Eles alimentavam os voltímetros avulsos que ficavam na frente de T2 e T3. Com o **LM2596 de display integrado**, o instrumento é o próprio conversor — e o que se vê pela janela de acrílico é o display dele. Sobrou **um** medidor comprado à parte, o do P1 (cabo #19), que mostra tensão **e corrente**.

### Como fazer a derivação sem cortar a linha

```
   condutor da linha (com capa)
   ═══════════════════╗═══════════════════
                      ║ 1. Janela de 5 mm feita com estilete, girando a lâmina.
                      ║    NÃO corte o condutor — ele continua até o próximo poste.
                      ╠═► 2. Enrolar o fio de derivação na janela e SOLDAR.
                     ▓▓▓  3. Cobrir com termorretrátil 6 mm.
                      ▼      (é a versão maquete do conector perfurante real)
                 [TRANSFORMADOR]
```

---

## 30.5 TRECHO 4 — Entrada no painel e distribuição

## 30.0 🎨 As cores dos fios — por FUNÇÃO, não por fio

Num painel de verdade **não existem 24 cores de fio**. A cor diz **que circuito é**; a **anilha** diz qual fio daquele circuito. Ter dois vermelhos parecidos para "24 V que cai" e "24 V que não cai" é pior do que não ter cor nenhuma.

| Cor | Função | Onde aparece |
|---|---|---|
| 🔴 **vermelho** | +24 V de **POTÊNCIA** | entra pelo PG9-1, passa pelo KA2, alimenta o BD-POT e os dois BTS. **Cai na emergência** |
| 🟠 **laranja** | +24 V de **SERVIÇOS** | cadeia de comando, DNLCB30, sinaleiros, posições de ensaio. **Permanece energizado** |
| 🟡 amarelo | +12 V auxiliar | do T3 até o MV-1 |
| 🟣 violeta | +5 V de lógica | Arduino, tela, RTC, PI-1, sensor de corrente, lado de comando do MV-1 |
| 🔵 azul escuro | 0 V comum | todos os retornos |
| 🟢 verde | analógico e medição | IS dos BTS, SIG do mux, retornos das posições |
| ⚫ cinza | sinal digital | Arduino ↔ módulos |

> ⭐ **Por que laranja para o permanente, e não outro vermelho.** A **IEC 60204-1** reserva o laranja exatamente para os circuitos que **continuam energizados com o seccionamento aberto**. É o caso do BD-24V: ele não cai quando alguém soca o cogumelo. Usar a cor normativa avisa quem abrir o painel amanhã que aquele fio pode estar vivo mesmo com tudo "desligado".
>
> 🔥 **É a troca mais perigosa da montagem.** O vermelho e o laranja são os dois 24 V, entram por prensa-cabos diferentes e vão parar em barramentos de comportamento oposto. Trocados: a potência fica permanente e a supervisão morre na emergência.

📐 No aplicativo a cor de cada fio é **derivada da função** — nenhum fio escolhe a sua. Foi assim que se descobriu que havia dois vermelhos quase iguais no desenho.

---

### Entradas — 5 condutores em 3 prensa-cabos

📐 **Confira desenhado:** aba "🔧 Dentro do painel", botão **"🔌 Fiação · etapa 1"**. Cada fio aparece traçado pelas canaletas de verdade, com a anilha no meio do percurso. Clique num deles para isolá-lo.

| Prensa-cabo | X | O que passa |
|---|---:|---|
| **PG9-1** | 50 mm | 24 V de potência + 0 V (os dois de 1,5 mm²) |
| **PG7-1** | 110 mm | 5 V |
| **PG7-2** | 170 mm | 12 V auxiliar + 24 V de serviços |

### Saídas — 23 condutores em 3 prensa-cabos

| Prensa-cabo | Rosca | X | O que sai | Feixe |
|---|---|---:|---|---:|
| **PG13-2** | PG13,5 | 230 mm | 12 fios de potência para a câmara | 9,9 mm |
| **PG9-3** | PG9 | 470 mm | 9 fios de sinal e medição — **6 deles são RETORNO**, entrando no painel | 6,5 mm |
| **PG7-3** | PG7 | 300 mm | 2 fios de 5 V para os LEDs da maquete | 2,9 mm |

> ⭐ **O PG9-3 é o único furo de mão dupla.** Três fios saem (5 V do sensor, SDA, SCL) e seis voltam (os dois retornos das posições, o GND do sensor, o DS18B20 do radiador e os dois RPM). É o que faz dele o furo mais sensível do painel: o retorno das posições carrega a corrente que está sendo medida.

⭐ **Todos entram pela BASE e sobem pela mesma rota:** `CH-base → CV-esq → CH-2x1`. As três são canaletas de **potência**, então não há mistura com sinal em nenhum trecho. O script `npm run valida:fiacao` confere isso — inclusive que as canaletas da rota realmente se tocam.


> 🔥 **CORREÇÃO — os "retornos" 36, 38 e 40 não existem.** Esta tabela vinha de antes da
> decisão do **0 V único**, e listava um retorno por tensão. Isso contradiz o que a maquete
> faz: *"do transformador sai SÓ O POSITIVO"*. Os LM2596 dos postes **não são isolados** —
> o negativo deles é fisicamente o mesmo cobre. Puxar quatro retornos não daria quatro
> circuitos: daria **quatro caminhos para a mesma corrente**, formando malhas de terra.
>
> **Entram 5 condutores no painel, não 8.** Os números 36, 38 e 40 ficam vagos, como já
> aconteceu com o 43 e o 44, para não invalidar anilhas.

| # | Cabo | Cor | Seção | De → Para |
|---|---|---|---|---|
| 34 | **24 V potência** | Vermelho | 1,5 mm² | PG9-1 (X=50) → **KA2 · contato 11** (comum) |
| 35 | **24 V potência comandado** | Vermelho | 1,5 mm² | **KA2 · contato 14** (NA) → **BD-POT** entrada |
| ⭐ **36** | **0 V comum — o único** | **Azul claro** | **1,5 mm²** | PG9-1 (X=50) → **BD-0V** entrada. Conduz a soma de tudo: **6,9 A** no pior caso |
| 37 | 5 V | Laranja | 0,5 mm² | PG7-1 (X=110) → **BD-5V** entrada (direto, sem fusível) |
| ~~38~~ | — | — | — | **vago** — era o "retorno 5 V" |
| 39 | 12 V auxiliar | Amarelo | **0,75 mm²** | PG7-2 (X=170) → **BD-AUX** entrada |
| ~~40~~ | — | — | — | **vago** — era o "retorno auxiliar" |
| 41 | **+24 V serviços** | Vermelho | 0,5 mm² | 🔄 **Agora vem do ramal RM2, pelo poste P4** (padrão de entrada) → **BD-24V** entrada |

> 🔄 **Mudou de ramal: o 24 V de serviços sai do R2, não do R3.** Os dois funcionariam, mas o R2 é bem mais folgado — ele alimenta só o transformador de 5 V, e toda a eletrônica consome cerca de **75 mA** vistos do lado de 24 V. O R3 alimenta as ventoinhas e puxa uns **265 mA**.
>
> ⚠️ **E há um motivo de segurança que pesa mais que a folga.** Ventoinha é a peça que mais trava mecanicamente, e uma travada puxa corrente de rotor bloqueado. Se o barramento de serviços dividisse fusível com elas, **uma ventoinha travada poderia queimar o F3 e levar junto o ESP32 e a lâmpada de FALHA** — exatamente quem deveria avisar do problema.
>
> 📌 **Consequência na maquete:** o R3 **termina** no transformador T3, no poste 3. Só o R1 e o R2 chegam ao poste 4, e descem lá junto com o 0 V — três entradas lado a lado no padrão de entrada.
| ~~42~~ | — | — | — | **vago** — era o "retorno 24 V" |
| ~~43, 44~~ | — | — | **Números vagos.** Eram a entrada e a saída dos fusíveis F4/F5, eliminados junto com o crowbar. Os números seguintes foram mantidos para não invalidar as anilhas já impressas |

> 🗑️ **F4 e F5 saíram do painel, e nada os substitui — de propósito.** Eles eram os fusíveis de **saída** do circuito crowbar. Hoje:
>
> | Barramento | Quem protege |
> |---|---|
> | **24 V de potência** (BD-POT) | **F1 (10 A)**, lá na subestação, na entrada do ramal RM1 — protege o caminho inteiro |
> | **5 V** (BD-5V) | **F2 (2 A)** na entrada do R2 + **limite de corrente e shutdown térmico internos do LM2596** |
> | **12 V auxiliar** (BD-AUX) | **F3 (2 A)** na entrada do R3 + proteções internas do LM2596 |
>
> Os fusíveis de **entrada dos ramais** (F1, F2, F3) continuam obrigatórios: são a seletividade da rede de distribuição, o equivalente à chave fusível do poste. Justificativa completa, incluindo o risco residual aceito, em [Doc 02 §2.6](../camada_0_fundamentos/02_arquitetura_de_energia.md).

### 🗑️ Proteção de sobretensão (crowbar) — **eliminada do projeto**

Esta seção descrevia uma placa com três diodos Zener (5V6 / 13 V / 15 V) que sacrificava um fusível para salvar a eletrônica caso o conversor falhasse em curto. **Ela não existe mais**, por três motivos:

1. O **LM2596 traz limite de corrente ciclo a ciclo e desligamento térmico no próprio CI**, cobrindo sobrecarga, curto e superaquecimento — que eram os casos prováveis.
2. O crowbar de 15 V protegia a saída do **T1**, que deixou de existir.
3. Eram **6 Zener de 5 W montados em fio volante** dentro de uma maquete que vai ser transportada. Cada emenda no ar é um defeito intermitente esperando acontecer.

**Nada precisa ser montado no lugar.** O trilho 1 ficou 91 mm mais livre.

### Saídas dos blocos de distribuição

| # | Cabo | Seção | De → Para |
|---|---|---|---|
| 45 | **24 V BTS #1** | 1,5 mm² | **BD-POT** saída 1 → BTS #1 `B+` |
| 46 | **24 V BTS #2** | 1,5 mm² | **BD-POT** saída 2 → BTS #2 `B+` |
| 47 | 0 V BTS #1 | 1,5 mm² | **BD-0V** → BTS #1 `B−` |
| 48 | 0 V BTS #2 | 1,5 mm² | **BD-0V** → BTS #2 `B−` |
| 49 | 5 V Arduino | 0,5 mm² | **BD-5V** saída 1 → Arduino pino `5V` (⚠️ **não** no VIN) |
| 50 | 5 V da tela | 0,5 mm² | **BD-5V** saída 2 → conector **UART** da ES3C28P (pino 5 V) |
| 51 | 5 V SD + RTC | 0,25 mm² | **BD-5V** saída 3 → VCC dos módulos |
| 52 | 5 V lógica BTS #1 | 0,25 mm² | **BD-5V** saída 4 → BTS #1 `VCC` |
| 53 | 5 V lógica BTS #2 | 0,25 mm² | **BD-5V** saída 5 → BTS #2 `VCC` |
| 54 | **5 V da placa PI-1** | 0,25 mm² | **BD-5V** saída 6 → borne `+5V` da **placa de interface PI-1** (pull-up do 1-Wire) — ver [Doc 33](33_placa_interface_componentes.md) |
| **54b** | **5 V da iluminação da maquete** | 0,25 mm² | **BD-5V** saída **7** → 4 LEDs brancos dos postes de iluminação, cada um com **220 Ω** em série na base do poste. ⚠️ Sempre acesos |
| 55 | 12 V cooler dos BTS | 0,25 mm² | **BD-AUX** saída 1 → cooler 40 mm |
| 56 | **24 V DNLCB30** | 0,5 mm² | **BD-24V** saída 1 → DNLCB30 `VIN` |
| 57 | 24 V para a emergência | 0,5 mm² | **BD-24V** saída 2 → **S0 bloco NF de 24 V** entrada |
| **57m** | **Posição de ensaio** | 0,5 mm² | **BD-24V** saída 4 → **F-P1** (fusível de 100 mA com chave) → 10 voltas no sensor **SC-1** → borne `+24 V` da posição, na câmara |
| **57g** | **24 V dos sinaleiros** | 0,5 mm² | **BD-24V** saída 3 → **positivo comum dos 4 sinaleiros** na porta ⚠️ permanente, não cai com a emergência |

> ⚠️ **Duas saídas estavam duplicadas e isso mudaria a compra.** O cabo 54b dividia a saída 6 do BD-5V com o cabo 54, e o 57h dividia a saída 3 do BD-24V com o 57g. Corrigido: cada carga tem a **sua** saída. Com isso o **BD-5V precisa de 8 saídas** (7 cargas + reserva) e o **BD-24V de 6** (5 cargas + reserva) — ver a tabela de conferência no [Doc 03](../camada_0_fundamentos/03_lista_materiais.md).
>
> 🔌 **A saída 4 do BD-24V alimenta os 4 porta-fusíveis das posições de ensaio com UM fio só.** Isso só funciona se o porta-fusível for de **4 vias com barramento de entrada comum** (ou 4 individuais unidos por um **pente**). Se você comprar 4 porta-fusíveis avulsos sem pente, precisará de **4 saídas** no BD-24V em vez de 1 — ou seja, um bloco de **9 saídas**.
| ~~57i–57l~~ | ~~Negativo dos 4 sinaleiros~~ | — | 🗑️ **saíram:** o sinaleiro virou de 5 V e o pino do Arduino o acende direto. Sobrou um retorno só, do último sinaleiro ao `GND2` do Mega |
| 57b | Cadeia do selo | 0,5 mm² | **S0 saída** → **S3 REARME (NA)** e **KA1 contato de selo (NA)**, em paralelo → **KA1 · A1** |
| 57d | Retorno da bobina do KA1 | 0,5 mm² | **KA1 · A2** → **BD-0V** |
| 57e | Saída do KA1 → STOP | 0,5 mm² | **KA1 contato de saída (NA)** → **S2 bloco NF de 24 V** |
| 57f | Bobina do KA2 | 0,5 mm² | **S2 saída** → **KA2 · A1**. O A2 vai ao **BD-0V** |
| 57c | Realimentação D25 | 0,25 mm² | **BD-POT (24 V)** → borne `+24V` da **placa PI-1** (divisor **22 kΩ / 4,7 kΩ**) → borne `D25` → **Arduino D25**. ⚠️ Os resistores ficam **na PI-1**, não no meio do cabo — ver [Doc 33 §33.2](33_placa_interface_componentes.md) |
| 58 | 0 V (todos os módulos) | 0,25–0,5 mm² | **BD-0V** → GND de Arduino, tela ES3C28P, RTC, DNLCB30, cooler |

> ⚠️ **Item 49 — alimente o Arduino pelo pino `5V`, não pelo `VIN`.** O VIN passa pelo regulador linear de bordo, que precisa de 7–12 V. Injetando 5 V no VIN, o Arduino recebe ~3,5 V e não funciona direito.
>
> ⚠️ **Item 56 — a DNLCB30 recebe 24 V, não 5 V.** Ela aceita 7–35 V e gera os 3,3 V do ESP32 internamente. É por isso que o projeto **não precisa de um quarto conversor**.

---

## 30.6 TRECHO 5 — Saídas para a câmara

| # | Cabo | Cor | Seção | De → Para |
|---|---|---|---|---|
| 59 | BTS #1 M+ | Vermelho | 1,5 mm² | BTS #1 saída → borne da câmara `24V-FRIO` |
| 60 | BTS #1 M− | Preto | 1,5 mm² | BTS #1 saída → borne `0V-FRIO` |
| 61 | BTS #2 M+ | Laranja | 1,5 mm² | BTS #2 saída → borne `24V-QUENTE` |
| 62 | BTS #2 M− | Preto | 1,5 mm² | BTS #2 saída → borne `0V-QUENTE` |
| 63 (X5) | Coolers do radiador **+** | Amarelo | 0,5 mm² | **BD-AUX** saída 2 → **os DOIS positivos**, em paralelo |
| 64 (X6) | Coolers do radiador **−** | Azul escuro | 0,5 mm² | os dois negativos → **BD-0V · Z20** |
| **64d** (X20) | RPM cooler #1 | Cinza | 0,25 mm² | Tacômetro do cooler #1 → **Arduino D3** (INT1) |
| **64e** (X21) | RPM cooler #2 | Cinza | 0,25 mm² | Tacômetro do cooler #2 → **Arduino A8** (PCINT16) |
| **64f** (X22) | DS18B20 do radiador · **VCC** | Violeta | 0,25 mm² | **BD-5V** saída 11 → fio vermelho do sensor |
| **64g** (X23) | DS18B20 do radiador · **GND** | Azul escuro | 0,25 mm² | fio preto do sensor → **BD-0V · Z19** |
| **64h** (X19) | DS18B20 do radiador · **DATA** | Cinza | 0,25 mm² | fio amarelo → **PI-1 · J1-3** (pull-up de 4,7 kΩ na placa) |

> 🔧 **Correção — os itens 64b e 64c foram removidos.** A tabela dava um par de alimentação para cada cooler. Um par só, com os dois em paralelo, faz o mesmo serviço: **quem identifica qual dos dois parou é o RPM, que já é individual.** É a mesma lógica dos retornos das posições de ensaio — lá o retorno é a medição, então ele é individual; aqui a medição é o tacômetro, então é ele que precisa ser. Dois condutores a menos atravessando o prensa-cabo.

> 🔥 **Correção — o DS18B20 é de TRÊS fios, e a tabela listava um.** Faltavam o VCC e o GND (itens 64f e 64g). Sem o VCC o sensor não liga; sem o GND o barramento 1-Wire não tem referência e a leitura sai lixo — quando sai. A versão de dois fios existe (alimentação parasita) mas **não é a usada aqui**.

> 🔥 **Correção — os coolers do radiador NÃO passam pelo MV-1.** Este documento já dizia que eles ficam sempre ligados (ver a nota logo abaixo), mas o [Doc 32](32_sinais_e_sensores.md) os tinha posto no canal 1 do MV-1, e a fiação seguiu o Doc 32. O canal 1 chaveia o **negativo** — e o tacômetro da ventoinha tem o emissor referenciado nesse mesmo negativo. Com o canal desligado o preto sobe para perto de 12 V e empurra corrente pelo diodo de proteção do pino D3. **O canal 1 do MV-1 e o D27 do Mega ficaram livres.**

> ⚠️ **Duas Peltier significam dois coolers e dois sinais de RPM.** O pino D2 já é do 1-Wire, então o **segundo tacômetro precisa de outro pino de interrupção**. No Mega, as interrupções externas ficam em D2, D3, D18, D19, D20 e D21 — e D18–D21 já estão ocupados por Serial1 e I²C. **Use D3 (INT1) para o cooler #1 e uma interrupção por mudança de pino (PCINT) para o cooler #2**, ou realoque a Serial1. 📌 **Definir em [Doc 32](32_sinais_e_sensores.md) e [Doc 40](../camada_4_programacao/40_firmware_arduino.md) antes de fechar a fiação.**

> ⚠️ **Os coolers externos das Peltier NÃO passam pelos BTS.** Vêm do ramal auxiliar, então **sobrevivem ao STOP e à emergência** — se dependessem do BTS, ao desligar a Peltier os dissipadores parariam de ser ventilados justamente quando ainda estão cheios de calor.
>
> 🔧 **Mas eles já não ficam ligados o tempo todo.** A revisão de [Doc 31 §31.14](31_comando_e_protecoes.md) devolveu o comando: o **contato NF do KA4** (relé de 8 pinos, igual ao KA1/KA2) chaveia o **lado positivo** dos 12 V — nunca o negativo, que é a referência do tacômetro e foi o que quebrou antes. A regra é uma só: **ligados enquanto a Peltier resfria OU enquanto o DS18B20 disser que o dissipador está quente.** Eles param apenas depois de a pós-ventilação terminar, e o `!sensorOK` conta sensor com defeito como *quente*. Economiza ~5 W de marcha lenta e os ~2,5 W de fuga térmica que atrapalhavam o PTC.

### Distribuição dentro da câmara

| Borne | Alimenta | Modo |
|---|---|---|
| `24V-FRIO` / `0V-FRIO` | **2× Peltier EM SÉRIE** (24 V / 6,0 A) | Frio (BTS #1) |
| `24V-QUENTE` / `0V-QUENTE` | **PTC cerâmico de 24 V** (2,5 A) | Quente (BTS #2) |
| **`12V-FANS` / `0V-FANS`** | **As 4 fans internas** — vêm do **BD-AUX**, não do BTS | Comutadas por modo no firmware |
| Direto do painel | 2× cooler externo dos dissipadores (3 fios cada) | Sempre |

> ⚠️ **As fans internas mudaram de alimentação.** Elas são de **12 V** e antes vinham do mesmo barramento da carga térmica. Com a potência agora em 24 V, elas passaram para o **ramal auxiliar (BD-AUX)**. **Não ligue fan de 12 V no borne de 24 V** — some em segundos.

> ⚠️ **As duas Peltier ficam em SÉRIE.** Meça a resistência do conjunto antes de energizar: deve dar **o dobro** da resistência de uma pastilha isolada. Se der metade, estão em paralelo e cada uma receberá 24 V — o dobro do nominal.

> ⚠️ **Confira a seta de fluxo no corpo de cada fan antes de instalar.** Fan invertida quebra a circulação projetada e é quase impossível perceber sem teste de fumaça.

---

## 30.7 Bitolas do projeto

| Circuito | Tensão | Corrente | Bitola | Tipo |
|---|---:|---:|---|---|
| Entrada AC (L / N / PE) | 127 V CA | **2,4 A** | 1,5 mm² | PP 3 × 1,5 |
| **Ramal R1 na linha** | 24 V | **6,0 A** | **1,00 mm²** ⬆ | **Rígido vermelho** |
| Ramais R2 e R3 na linha | 24 V | ≤ 0,8 A | 0,50 mm² | **Rígido marrom / cinza** |
| **Retorno 0 V na linha** | — | **6,9 A** | **1,50 mm²** ⬆ | **Rígido azul claro** |
| **Saída do P1 → painel (24 V POT)** | 24 V | 6,0 A | **1,5 mm²** | Flexível vermelho/preto |
| Saída do T2 → painel | 5 V | 0,7 A | 0,50 mm² | Flexível laranja/preto |
| **Saída do T3 → painel** | 12 V | **1,0 A** | **0,75 mm²** ⬆ | Flexível amarelo/preto |
| +24 V serviços do P3 → painel | 24 V | 0,20 A | 0,50 mm² | Flexível vermelho/preto |
| Entrada do BD-0V | — | **6,9 A** | **10 mm²** (borne) | Flexível preto 1,5 mm² |
| Sinais e sensores | 5 V | < 0,05 A | 0,25 mm² | Flexível colorido |

> ⬆ **Três bitolas subiram** com a arquitetura de potência em 24 V. Confira antes de comprar o fio rígido: trocar depois significa desmontar a cruzeta inteira. Cálculo de queda de tensão em [Doc 02 §2.7](../camada_0_fundamentos/02_arquitetura_de_energia.md) — dá **0,86 %**, contra o limite prático de 3 %.

---

## 30.8 Roteiro de energização por trechos

> 🔌 **Energize um trecho por vez, medindo antes de seguir.** Nunca ligue tudo de uma vez na primeira vez.

### Carga de teste

| Ramal | Carga | Corrente esperada |
|---|---|---|
| **R1 (24 V direto)** | 2 lâmpadas automotivas 12 V 55 W **em série**, ou resistor 4,7 Ω 100 W | ~4,6 A |
| T2 (5 V) | Resistor 10 Ω 10 W | 0,5 A |
| T3 (12 V) | Lâmpada automotiva 12 V 21 W | ~1,0 A |

> 💡 **A carga de teste do R1 mudou junto com a arquitetura.** Como o ramal agora é de 24 V, **duas lâmpadas de 12 V em série** formam a carga de teste ideal — e de quebra reproduzem exatamente o arranjo das duas Peltier em série, servindo de ensaio da própria ligação.

### Teste 0 — Inspeção a frio

- [ ] Plugue **fora da tomada**
- [ ] Continuidade do **PE**: pino terra do plugue → carcaça da fonte (< 1 Ω)
- [ ] Isolação: resistência **L–PE** e **N–PE** → alta (MΩ)
- [ ] Resistência **+24 V ↔ 0 V** na subestação → **não pode ser ~0 Ω**
- [ ] **F1 (10 A)**, F2 (2 A), F3 (2 A) instalados — ⚠️ o F1 **não** é mais de 6 A
- [ ] Chave rotativa em "0", disjuntor desligado
- [ ] **Nenhum condutor da linha encostando em outro**; capas íntegras
- [ ] Derivações soldadas e cobertas com termorretrátil

### Teste 1 — Fonte de 24 V (sem carga)

- [ ] Plugue na tomada, **Q0 → ON**, chave rotativa → **1**
- [ ] Medir nos bornes da subestação: **24,0 V ± 0,5 V**
- [ ] Medir na ponta de cada ramal, **no poste P3**: 24,0 V nos três
- [ ] **Queda de tensão** subestação → P3 deve ser **< 0,3 V**
- [ ] Medir **entre cada par de condutores da linha** (R1-R2, R1-R3, R2-R3) → deve dar **0 V** (mesmo potencial). Se der 24 V, um ramal está invertido
- [ ] Chave → "0": tudo desliga. Repetir 3×
- [ ] 10 min ligada sem carga; a fonte não pode esquentar anormalmente

### Teste 2 — Conversores e derivação, com carga resistiva

⚠️ **Ajuste a tensão de saída de T2 e T3 com a saída NO AR, antes de conectar qualquer carga.** O LM2596 sai de fábrica com o potenciômetro em posição arbitrária e pode entregar 20 V. Procedimento em [Doc 02 §2.5](../camada_0_fundamentos/02_arquitetura_de_energia.md).

Um de cada vez, com o respectivo ramal energizado:

- [ ] **T2 (P2)**: com resistor de 10 Ω → **5,10 V ± 0,05 V** e 0,5 A
- [ ] **T3 (P3)**: com lâmpada de 21 W → **12,0 V ± 0,1 V** e ~1,0 A
- [ ] **T3 carregado por 30 minutos**; o corpo do LM2596 deve ficar **abaixo de 80 °C**. É o conversor mais carregado do projeto (65 % do limite) — se passar disso, o dissipador não foi colado ou faltam os furos de ventilação no tubo
- [ ] **P1 (derivação)**: com as 2 lâmpadas em série → **24,0 V ± 0,3 V** e ~4,6 A. ⚠️ Aqui **não há tensão para ajustar** — é passagem direta. Se a tensão cair muito, o problema é bitola ou mau contato na derivação
- [ ] Os **displays dos LM2596** marcando 5,10 V e 12,0 V, visíveis pelas janelas de acrílico
- [ ] O **medidor do P1** marcando 24,0 V e a corrente da carga de teste

### Teste 3 — ~~Crowbars~~ · **eliminado**

Não há mais crowbar no projeto. Em substituição, confirme as proteções que ficaram:

- [ ] **F1 (10 A)**, F2 (2 A) e F3 (2 A) presentes e com os valores corretos
- [ ] Ensaio de curto controlado na saída do **T2**, com a carga de teste: o LM2596 deve **limitar a corrente e/ou desligar por temperatura**, e voltar sozinho ao normal quando o curto for removido

### Teste 4 — Distribuição no painel (sem eletrônica)

> Retire fisicamente Arduino, ESP32, tela ES3C28P, RTC **e a placa PI-1** dos suportes antes deste teste.

- [ ] **BD-POT**: **24,0 V** (após apertar o REARME; os LEDs do KA1 e do KA2 acendem)
- [ ] **BD-5V**: 5,10 V
- [ ] **BD-AUX**: 12,0 V
- [ ] **BD-24V**: 24,0 V
- [ ] ⚠️ **Confirmar que BD-POT e BD-24V são circuitos diferentes:** acione a emergência. O **BD-POT deve cair para 0 V** e o **BD-24V deve continuar em 24,0 V**. Se os dois caírem, você ligou os dois na mesma origem e o ESP32 vai morrer junto com a potência — perdendo justamente o registro do evento
- [ ] Medir **cada bloco contra o BD-0V** — nenhum pode estar invertido
- [ ] ⚠️ **Medir BD-5V contra BD-POT**: deve dar ~**19 V** (24 − 5). Se der 0 V, você trocou os cabos e vai queimar o Arduino
- [ ] Medir **todas as saídas de cada bloco** — todas devem ter a mesma tensão da entrada

### Teste 4b — Placa de interface PI-1 e pull-downs dos BTS

- [ ] Ensaios de continuidade da PI-1 aprovados **antes** de encaixá-la ([Doc 33 §33.3](33_placa_interface_componentes.md))
- [ ] Com o KA2 fechado, medir o borne `D25` da PI-1: **4,2 V ± 0,3 V**. Com a emergência acionada: **0 V**
- [ ] Com o Arduino fora, medir `R_EN` de cada BTS7960 contra o `GND` dele: **~0 V** com o painel energizado, e **~10 kΩ** de resistência

### Teste 5 — Eletrônica

Recoloque os módulos **um de cada vez**, medindo os 5 V antes de cada inserção.

- [ ] Arduino: LED de power acende, boota
- [ ] Tela ES3C28P acende
- [ ] DNLCB30 + ESP32: LED de power aceso, **3,3 V medidos**
- [ ] SD + RTC: reconhecidos no debug serial

---

## 30.9 ✅ Checklist de aceitação

- [ ] Todos os cabos com **terminal tubular** crimpado nas duas pontas
- [ ] Todos os cabos com **anilha de identificação** nas duas pontas
- [ ] PE contínuo do plugue até a carcaça da fonte
- [ ] Nenhum condutor de 127 V acessível com a subestação fechada
- [ ] **Linha inteiramente com condutores encapados**, nas 4 cores
- [ ] Derivações em janela, **sem cortar a linha**, soldadas e isoladas
- [ ] **F1 (10 A), F2 (2 A) e F3 (2 A)** instalados com os valores corretos — **F4 e F5 não existem mais**
- [ ] ~~3 crowbars Zener~~ — **eliminados do projeto**; nada foi montado no lugar
- [ ] **5 entradas separadas** no painel, uma por tensão
- [ ] **5 blocos de distribuição** ligados e conferidos saída por saída
- [ ] ⭐ **BD-POT e BD-24V confirmados como circuitos independentes** (teste da emergência, §30.8 Teste 4)
- [ ] **KA1** (2 contatos) com selo, emergência em série com a bobina
- [ ] **KA2** cortando os **24 V** (contatos 11 → 14), STOP em série com a bobina
- [ ] Contato do KA2 confirmado como **≥ 10 A em DC** (a carga é 6,0 A em 24 Vcc)
- [ ] Botão azul de **REARME** ligado em paralelo com o contato de selo do KA1
- [ ] ⭐ **Placa PI-1 montada e ensaiada**; **10 kΩ soldados nos 2 BTS7960** — [Doc 33](33_placa_interface_componentes.md)
- [ ] ⭐ **As 2 Peltier em SÉRIE** — resistência do conjunto = 2× a de uma pastilha isolada
- [ ] ⭐ **As 4 fans internas alimentadas pelo BD-AUX (12 V)**, nunca pelo borne de 24 V
- [ ] ⭐ **2 coolers externos** instalados, com os 2 sinais de RPM chegando ao Arduino
- [ ] Testes 0 a 5 aprovados, com **valores medidos anotados**
- [ ] Queda de tensão na linha < 0,3 V
- [ ] Temperatura do **T3** sob carga < 80 °C após 30 min (é o conversor mais carregado)
- [ ] Canaletas fechadas, potência e sinal separados
- [ ] Trimpots dos **2** conversores marcados com esmalte

> 📋 **Anote todos os valores medidos.** Um relatório com tabela de "valor projetado × valor medido" vale muito mais que um só com valores teóricos.

---

📄 **Anterior:** [Doc 20 — Painel](../camada_2_painel/20_painel_projeto_e_layout.md) · **Próximo:** [Doc 31 — Comando e Proteções](31_comando_e_protecoes.md)
