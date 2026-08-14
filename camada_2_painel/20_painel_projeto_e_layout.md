# CAMADA 2 · Doc 20 — Painel de Comando: Projeto e Layout

> A montagem **mecânica** do painel: dimensões, layout do fundo (backplate), layout da porta, furação e fixação nos trilhos DIN. **Nenhum fio é ligado nesta camada** — cabeamento é a Camada 3.
>
> ✅ **Pré-requisito:** Camada 1 concluída (maquete pronta, com o espaço do painel definido e furado).
> 🖼️ **Desenho:** [Layout do painel](../desenhos/04_painel_layout.svg)

---

## 🟢 Em palavras simples — o painel é o "quadro de luz" da máquina

Você já viu o quadro de disjuntores da sua casa. O painel de comando é a mesma ideia, mas para uma máquina: **uma caixa onde mora toda a inteligência e toda a proteção**, com os botões do lado de fora.

Esta camada é só **montagem mecânica**. Nenhum fio é ligado aqui — isso é a Camada 3. Aqui você fura, parafusa e encaixa.

> 🎯 **A regra que faz esta etapa existir:** é infinitamente mais fácil furar uma caixa vazia do que uma caixa com 60 cabos dentro. Por isso separamos: primeiro tudo mecânico, depois tudo elétrico.

### As 3 peças que organizam um painel

**1. O trilho DIN** — uma barra de metal com um formato padrão, parafusada no fundo. Todo componente industrial tem um encaixe que "estala" nela.

```
      componente
         ↓ estala
    ═══╤═══╤═══╤═══     ← trilho DIN
```

Por que isso importa: você **encaixa e desencaixa sem parafuso**. Se um relé queimar às vésperas da apresentação, troca em 10 segundos.

**2. A canaleta** — um "corredor" plástico com tampa, onde os fios correm escondidos. Os fios entram pelos rasgos laterais e saem perto do componente.

Sem canaleta, os fios ficam soltos: feio, frágil e impossível de dar manutenção. Com canaleta, você fecha a tampa e o painel fica limpo.

**3. O bloco de distribuição** — resolve um problema chato. Os 5 V precisam chegar em 6 lugares diferentes. Sem bloco, você faria "rabichos" ligando borne em borne, num emaranhado. O bloco tem **uma entrada grossa e várias saídas**, todas ligadas por dentro.

```
              BLOCO DE DISTRIBUIÇÃO
   entrada                    saídas
   5 V ──►┌──────────────────────┐──► Arduino
          │ ●   ● ● ● ● ● ●      │──► Nextion
          │ └───┴─┴─┴─┴─┴─┘      │──► SD/RTC
          │  (ligados por dentro) │──► ...
          └──────────────────────┘
```

### Por que três trilhos, e não um só

Porque **potência e sinal não se dão bem**. Os drivers chaveiam 6 ampères; os sensores trabalham com milivolts. Se os cabos correrem juntos, o ruído da potência corrompe a leitura dos sensores — a temperatura fica pulando sem motivo.

Então separamos por altura:

| Trilho | O que fica | Por quê |
|---|---|---|
| **1 (em cima)** | Distribuição — os blocos de tensão | Tudo se serve daqui |
| **2 (no meio)** | Potência — drivers e relés | Fonte de ruído, fica isolado |
| **3 (embaixo)** | Controle — Arduino, ESP32, SD/RTC, placa PI-1 | Sensível a ruído, fica longe |

E a regra que acompanha: quando um cabo de potência precisar cruzar um de sinal, **cruze a 90°**. Paralelos, eles "conversam"; perpendiculares, quase não.

### O que vai na porta, e por quê

A porta tem só o que a pessoa precisa **tocar ou ver**:

| Peça | Função |
|---|---|
| **Botão cogumelo vermelho** | Emergência. Grande e vermelho por norma — para ser achado sem pensar |
| **START / STOP** | Liga e para o processo |
| **REARME (azul)** | Destrava depois de uma emergência |
| **Seletora LOCAL/REMOTO** | Define quem manda: o painel ou o dashboard |
| **4 sinaleiros** | Verde = rodando · Azul = esfriando · Amarelo = aquecendo · Vermelho = falha |
| **Tela Nextion** | Mostra temperatura, setpoint e estado |

> ⚠️ **Uma armadilha real desta etapa:** o botão de emergência com 2 blocos de contato ocupa **7 cm atrás da chapa**. Confira se ele não bate no trilho antes de furar — está detalhado na §20.6, e é o erro que obriga a refazer a porta.

### Dicionário rápido

| Termo | O que quer dizer |
|---|---|
| **Backplate** | A chapa do fundo do painel, onde tudo é parafusado |
| **Trilho DIN** | Barra padrão de encaixe. "35 mm" é a medida universal |
| **Canaleta** | Corredor plástico com tampa por onde os fios correm |
| **Bloco de distribuição** | 1 entrada, várias saídas da mesma tensão |
| **Trava-fim** | Peça que impede os componentes de deslizarem no trilho |
| **Prensa-cabo** | Peça rosqueada por onde o cabo entra na caixa sem se machucar |
| **Anilha** | Etiqueta numerada no fio. **Exigida em painel industrial** |
| **Star ground** | Todos os retornos convergindo a **um único ponto**, para não criar ruído |
| **22 mm** | O diâmetro padrão de furo para botões industriais |

---

## 20.1 Dimensionamento

| Dimensão | Valor | Origem |
|---|---|---|
| **Largura** | **400 mm** | Comprimento útil de trilho necessário (§20.3) |
| **Altura** | **500 mm** | Pilha de 3 trilhos + canaletas (§20.2) |
| **Profundidade** | **200 mm** | Altura dos componentes (85 mm) + espaço para cabos (60 mm) + folga |
| Posição na maquete | **X 690 → 1090 · Y 300 → 500** | [Doc 10 §10.5](../camada_1_maquete/10_base_e_chao_de_fabrica.md) — logo depois do muro/portão |

### Peças do gabinete

| Peça | Dimensão | Material |
|---|---|---|
| Backplate (fundo) | 400 × 500 mm | MDF 15 mm (ou chapa de aço 1,5 mm) |
| Porta frontal | 400 × 500 mm | MDF 12 mm **ou acrílico fumê 5 mm** |
| Laterais (×2) | 200 × 500 mm | MDF 15 mm |
| Topo e base (×2) | 400 × 200 mm | MDF 15 mm |
| Dobradiça da porta | 500 mm, lado esquerdo | Dobradiça piano |
| Fecho | 1 | Fecho de painel com trava (ou 2 fechos de pressão) |

> 💡 **Porta de acrílico fumê:** deixa os LEDs de status dos módulos visíveis com o painel fechado, e o interior aparece "sombreado" — visual muito bom na apresentação. Se o professor cobrar realismo industrial estrito, use MDF pintado de cinza RAL 7035 (a cor padrão de painel elétrico).

> 🔄 **O que mudou em relação à versão anterior:** o painel cresceu de 300 × 450 para **400 × 500 mm** e ganhou um **terceiro trilho DIN**, para acomodar os blocos de distribuição. A fonte saiu do painel (foi para a subestação).
>
> 🔄 **Revisão "Potência em 24 V":** saíram do **trilho 1** os porta-fusíveis **F4/F5** e a **placa de proteção Zener** (91 mm liberados — o crowbar foi eliminado, ver [Doc 02 §2.6](../camada_0_fundamentos/02_arquitetura_de_energia.md)). Entrou no **trilho 3** a **placa de interface PI-1** (52,5 mm), que recolhe os 9 componentes discretos que antes ficariam soltos no chicote — ver [Doc 33](../camada_3_eletrica/33_placa_interface_componentes.md).

---

## 20.2 Layout do backplate (vista interna, painel aberto)

```
   ◄────────────────────── 400 mm ──────────────────────►
 ┌──────────────────────────────────────────────────────────┐  ▲
 │                    margem superior 30                     │  │  30
 ├──┬────────────────────────────────────────────────────┬──┤  │
 │  │ ══════════ CANALETA HORIZONTAL 30×30 ═══════════   │  │  │  40
 │  ├────────────────────────────────────────────────────┤  │  │
 │ C│ ▓▓▓▓▓▓▓▓▓▓ TRILHO DIN 1 — DISTRIBUIÇÃO ▓▓▓▓▓▓▓▓▓▓  │C │  │
 │ A│ [BD-POT][BD-AUX][BD-5V][BD-24V] [BD-0V]     (livre)  │A │  90
 │ N│   blocos de distribuição: 1 entrada → várias saídas │N │  │
 │ A├────────────────────────────────────────────────────┤A │  │
 │ L│ ══════════ CANALETA HORIZONTAL 30×30 ═══════════   │L │  │  40
 │ E├────────────────────────────────────────────────────┤E │  │
 │ T│ ▓▓▓▓▓▓▓▓▓▓ TRILHO DIN 2 — POTÊNCIA ▓▓▓▓▓▓▓▓▓▓▓▓▓   │T │  │
 │ A│  [BTS7960 #1]  [BTS7960 #2]  [KA1][KA2]  (livre)   │A │  │  90
 │  │        ▲ cooler 40 mm soprando aqui                 │  │  │
 │ V├────────────────────────────────────────────────────┤V │  │
 │ E│ ══════════ CANALETA HORIZONTAL 30×30 ═══════════   │E │  │  40
 │ R├────────────────────────────────────────────────────┤R │  │
 │ T│ ▓▓▓▓▓▓▓▓▓▓ TRILHO DIN 3 — CONTROLE ▓▓▓▓▓▓▓▓▓▓▓▓▓   │T │  │
 │  │  [ARDUINO MEGA + SHIELD] [DNLCB30+ESP32] [SD+RTC]  │  │  │  90
 │ 30│                                                    │30│  │
 │  ├────────────────────────────────────────────────────┤  │  │
 │  │ ══════════ CANALETA BASE 30×30 ════════════════    │  │  │  40
 ├──┴────────────────────────────────────────────────────┴──┤  │
 │  [PG9] [PG7] [PG7]           [PG9]        [PG9]           │  │  40
 └──────────────────────────────────────────────────────────┘  ▼
    ▲     ▲     ▲                ▲            ▲
   12V   5V   12V             saída de      saída de
   POT   COM   AUX            potência       sinais
   (T1)  (T2)  (T3)          → câmara      → câmara
```

> ⚠️ **Cada tensão entra pelo seu próprio prensa-cabo.** São três cabos vindos de três postes diferentes — juntá-los num furo só significa perder a rastreabilidade, apertar demais o prensa-cabo (o que amassa a capa) e colocar o cabo de **6,0 A** encostado nos de sinal.

### 📡 Posição da antena Wi-Fi — LATERAL DIREITA, PARTE ALTA

```
        VISTA DA LATERAL DIREITA (200 × 500 mm)

     ┌──────────────────────┐  ▲ Y=500
     │        ╱             │  │
     │       ╱  ANTENA      │  │   ⊙ conector SMA fêmea de painel
     │      ╱   3 dBi       │  │      (bulkhead) — X = 100, Y = 430
     │  ═══⊙════════════    │  │
     │      ▲               │  │
     │      │ pigtail IPEX→SMA  │   ← por dentro, até o ESP32
     │      │ (30 cm)       │  │
     │      ▼               │  │
     │   [DNLCB30+ESP32]    │  │
     │   trilho 3           │  │
     └──────────────────────┘  ▼ Y=0
```

| Parâmetro | Especificação |
|---|---|
| **Face** | **Lateral DIREITA** (o ESP32 está no lado direito do trilho 3) |
| **Posição** | X = 100 mm da traseira · **Y = 430 mm** (parte alta) |
| **Furo** | **Ø 6,5 mm** |
| **Fixação** | **Conector SMA fêmea de painel (bulkhead)** — atravessa a chapa e é preso por porca e arruela de pressão, com anel de vedação |
| Ligação interna | Pigtail **IPEX (u.FL) → SMA macho**, 20–30 cm, do ESP32 até o conector |
| Antena | SMA macho 3 dBi articulável, rosqueada por fora |

### Por que conector de painel e não prensa-cabo

> ⚠️ **Nunca passe o cabo da antena por um prensa-cabo.** O pigtail IPEX é **coaxial de 1,13 mm**, extremamente frágil: um aperto de prensa-cabo esmaga o dielétrico, muda a impedância característica (deixa de ser 50 Ω) e o alcance do Wi-Fi despenca. Pior: o cabo se rompe internamente com o tempo, e o defeito é intermitente — impossível de diagnosticar no dia da apresentação.
>
> ✅ **O conector SMA de painel resolve tudo de uma vez:** o cabo termina no conector, o conector é preso mecanicamente na chapa, e a antena rosqueia por fora. Sem esforço no cabo, sem passagem de umidade, e a antena pode ser removida para transportar a maquete. É a solução usada em qualquer equipamento industrial com rádio.

### Por que na parte ALTA e na LATERAL

| Motivo | Explicação |
|---|---|
| **Altura** | Quanto mais alta a antena, menos obstruída por bancadas, pessoas e pela própria maquete. Ganho real de alcance |
| **Lateral, não frente** | A porta é articulada — se a antena estivesse na porta, o cabo teria que dobrar toda vez que ela abre, e o coaxial não suporta ciclos de flexão |
| **Lateral, não base** | Na base a antena fica a 40 mm do MDF: a base reflete e absorve o sinal, e a antena vira um obstáculo por onde alguém tropeça no cabo |
| **Lado direito** | É onde está a DNLCB30 no trilho 3 — pigtail curto, menos perda no cabo |
| **Afastada dos BTS** | Os drivers chaveando são fonte de ruído de banda larga; manter a antena no extremo oposto reduz o piso de ruído |

### Cotas verticais (medidas a partir da base do backplate)

| Elemento | Y inicial | Y final | Altura |
|---|---:|---:|---:|
| Margem inferior / prensa-cabos | 0 | 40 | 40 |
| Canaleta base | 40 | 80 | 40 |
| **TRILHO DIN 3 — controle** (eixo do trilho em Y = 125) | 80 | 170 | 90 |
| Canaleta | 170 | 210 | 40 |
| **TRILHO DIN 2 — potência** (eixo em Y = 255) | 210 | 300 | 90 |
| Canaleta | 300 | 340 | 40 |
| **TRILHO DIN 1 — distribuição** (eixo em Y = 385) | 340 | 430 | 90 |
| Canaleta topo | 430 | 470 | 40 |
| Margem superior | 470 | 500 | 30 |

### Cotas horizontais

| Elemento | X inicial | X final |
|---|---:|---:|
| Canaleta vertical esquerda | 0 | 30 |
| **Área útil dos trilhos** | **40** | **360** |
| Canaleta vertical direita | 370 | 400 |

> **Comprimento útil de trilho: 320 mm por trilho.** As canaletas verticais levam os cabos entre os três trilhos sem cruzar a área dos componentes.

---

## 20.3 Ocupação de cada trilho

### TRILHO 1 — Distribuição e proteção (Y = 385)

| Ordem | Componente | Largura | X inicial |
|---:|---|---:|---:|
| 1 | **BD-POT** — bloco de distribuição **24 V de potência** (comutado pelo KA2) · 1 entrada + **4 saídas** | 36 mm | 40 |
| 2 | **BD-AUX** — bloco de distribuição 12 V auxiliar · 1 entrada + **4 saídas** | 36 mm | 76 |
| 3 | **BD-5V** — bloco de distribuição 5 V · 1 entrada + **6 saídas** | 36 mm | 112 |
| 4 | **BD-24V** — bloco de distribuição **24 V permanente** (serviços) · 1 entrada + **4 saídas** | 36 mm | 148 |
| 5 | Separador | 5 mm | 184 |
| 6 | **BD-0V** — bloco de distribuição do retorno (**star ground**) · 1 entrada 10 mm² + **8 saídas** | 46 mm | 189 |
| 7 | Trava-fim de trilho | 10 mm | 235 |
| | **Ocupação total** | **~205 mm** | **livre até 360 — sobram 125 mm** |

> 🔄 **O trilho 1 encolheu 91 mm** com a revisão "Potência em 24 V": saíram os porta-fusíveis **F4** e **F5** e a **placa de proteção Zener**, que existiam por causa do circuito crowbar. Os fusíveis de ramal **F1, F2 e F3 continuam na subestação**, não no painel. Ver [Doc 02 §2.6](../camada_0_fundamentos/02_arquitetura_de_energia.md).
>
> ⚠️ **BD-POT e BD-24V são os dois barramentos de 24 V, e não são a mesma coisa.** O **BD-POT** vem do ramal R1 e **passa pelo KA2** — cai com a emergência. O **BD-24V** vem do ramal R3 e é **permanente** — é ele que mantém o ESP32 vivo para publicar o evento de emergência por MQTT. **Identifique os dois com anilhas de cores diferentes**, porque trocá-los faz a emergência deixar de derrubar a potência.

### 📌 Blocos de distribuição — por que não usar bornes soltos

Você precisa puxar **vários fios da mesma tensão** dentro do painel: os 5 V vão para o Arduino, a Nextion, o SD/RTC, a lógica dos dois BTS e os LEDs. Se cada um desses for um borne separado, você acaba com um emaranhado de "rabichos" ligando borne em borne — feio, frágil e impossível de manter.

**O bloco de distribuição resolve:** é um componente DIN com **uma entrada grossa e várias saídas finas**, internamente todas ligadas entre si.

```
                   BD-5V
      entrada          saídas
    ──────►┌────────────────────────┐
     5,10 V│ ●   ● ● ● ● ● ●        │──► Arduino
           │ │   │ │ │ │ │ │        │──► Nextion
           │ └───┴─┴─┴─┴─┴─┘        │──► SD + RTC
           │   (barramento interno)  │──► lógica BTS #1
           └────────────────────────┘──► lógica BTS #2
                                      ──► LEDs
```

| Bloco | Tensão | Entrada | Saídas | Alimenta |
|---|---|---|---:|---|
| **BD-POT** | **24 V potência** (comutado pelo KA2) | 4 mm² | 4 | BTS #1 (B+), BTS #2 (B+), realimentação D25 (via PI-1), reserva |
| **BD-AUX** | 12 V auxiliar | 2,5 mm² | 4 | cooler dos BTS, **2× cooler externo das Peltier**, fans internas, iluminação |
| **BD-5V** | 5,10 V | 2,5 mm² | 6 | Arduino, Nextion, SD+RTC, lógica BTS ×2, **placa PI-1** |
| **BD-24V** | **24 V permanente** (serviços) | 2,5 mm² | 4 | DNLCB30/ESP32 · cadeia de comando (S0 → KA1 → KA2) · **positivo comum dos 4 sinaleiros** · 1 reserva |
| **BD-0V** | retorno 0 V | **10 mm²** | **8** | ⭐ **star ground** — todos os retornos convergem aqui |

> 💡 **Alternativa mais barata:** bornes comuns de 2,5 mm² lado a lado + uma **ponte de interligação (pente)** encaixada por cima, que liga todos internamente. Funciona igual, custa menos e é igualmente industrial. Só é menos prático para trocar depois.
>
> ⚠️ **O BD-0V não é "mais um bloco".** Ele **é** o ponto único de aterramento do projeto (star ground). Por isso a entrada é de 10 mm²: ele conduz a soma de todas as correntes de retorno. Ver [Doc 31 §31.5](../camada_3_eletrica/31_comando_e_protecoes.md).

### TRILHO 2 — Potência (Y = 255)

| Ordem | Componente | Largura | X inicial |
|---:|---|---:|---:|
| 1 | **BTS7960 #1** (Peltier / frio) no suporte SPCI4 | 105 mm | 40 |
| 2 | **BTS7960 #2** (PTC / quente) no suporte SPCI4 | 105 mm | 150 |
| 3 | **KA1** — relé de interface 24 Vcc, 2 contatos (selo) | 16 mm | 260 |
| 4 | **KA2** — relé de interface 24 Vcc, contato de 10 A | 16 mm | 280 |
| 5 | Espaço livre para expansão | 44 mm | 300 |
| | **Ocupação total** | **~244 mm** | sobra espaço para expansão |

> 🌬️ **Cooler de 40 mm** fixado na canaleta logo abaixo, soprando **para cima** contra os dois BTS7960. Alimentado pelo ramal 12 V auxiliar (T3), **sempre ligado** enquanto o painel estiver energizado.

### TRILHO 3 — Controle (Y = 125)

| Ordem | Componente | Largura | X inicial |
|---:|---|---:|---:|
| 1 | **Arduino Mega 2560 + Sensor Shield** em suporte DIN | 110 mm | 40 |
| 2 | ⭐ **Placa de Interface PI-1** em caixa modular DIN de 3M | **52,5 mm** | **150** |
| 3 | **DNLCB30 + ESP32** | 90 mm | 203 |
| 4 | **Módulo Micro SD + RTC DS3231** em suporte DIN | 60 mm | 293 |
| | **Ocupação total** | **~313 mm** | livre até 360 |

> ⭐ **A PI-1 fica encostada no Arduino, e a posição não é arbitrária.** Ela concentra os 9 componentes discretos do projeto — filtros dos pinos IS, divisor de realimentação, pull-up do 1-Wire e limitadores dos LEDs — e **todos eles precisam estar eletricamente junto ao Arduino** para cumprirem a função. Montagem detalhada, borne por borne, no [Doc 33 §33.3](../camada_3_eletrica/33_placa_interface_componentes.md).
>
> ⚠️ **Os vãos de 5 mm entre componentes foram zerados neste trilho** para abrir os 52,5 mm da PI-1. Encaixe tudo justo e trave com as travas-fim nas duas pontas.
>
> 📌 **Os 2 resistores de 10 kΩ de pull-down NÃO ficam na PI-1** — vão soldados dentro dos próprios BTS7960, no trilho 2. Motivo em [Doc 33 §33.4](../camada_3_eletrica/33_placa_interface_componentes.md).

> 📡 **O ESP32 fica ao lado do Arduino** para que o cabo Serial1 tenha menos de 150 mm. Cabo de UART longo dentro de um painel com dois BTS chaveando = comunicação corrompida.

---

## 20.4 Layout da porta (vista externa)

```
   ◄────────────────────── 400 mm ──────────────────────►
 ┌──────────────────────────────────────────────────────────┐  ▲ Y=500
 │                                                          │  │
 │   ⊙ SECCIONADORA              ⚠ RISCO ELÉTRICO           │  │ 60
 │      0 ─ 1                       (etiqueta)              │  │
 ├──────────────────────────────────────────────────────────┤  │ Y=440
 │                                                          │  │
 │              ┌──────────────────────┐                    │  │
 │              │                      │                    │  │ 130
 │              │   NEXTION 3.2"       │                    │  │
 │              │   recorte 98 × 57    │                    │  │
 │              └──────────────────────┘                    │  │
 ├──────────────────────────────────────────────────────────┤  │ Y=310
 │                                                          │  │
 │     ○ RUN      ○ COOL      ○ HEAT      ○ FAULT           │  │ 70
 │    (verde)     (azul)     (amarelo)   (vermelho)         │  │
 ├──────────────────────────────────────────────────────────┤  │ Y=240
 │                                                          │  │
 │      ◉                ⬤                 ⬤                │  │ 90
 │  EMERGÊNCIA         START              STOP              │  │
 │  (cogumelo)        (verde)          (vermelho)           │  │
 ├──────────────────────────────────────────────────────────┤  │ Y=150
 │                                                          │  │
 │      ┌────────────────────────────────────┐              │  │ 150
 │      │  BOLSA PORTA-DOCUMENTOS            │              │  │
 │      │  (diagrama elétrico do painel)     │              │  │
 │      └────────────────────────────────────┘              │  │
 └──────────────────────────────────────────────────────────┘  ▼ Y=0
```

### Coordenadas de furação da porta (origem: canto inferior esquerdo)

| Elemento | Furo | X (mm) | Y (mm) |
|---|---|---:|---:|
| Seccionadora 0-1 | Ø 22 | 60 | 470 |
| Recorte Nextion | 98 × 57 | 151 → 249 | 347 → 404 |
| LED RUN (verde) | Ø 22 | 90 | 275 |
| LED COOL (azul) | Ø 22 | 165 | 275 |
| LED HEAT (amarelo) | Ø 22 | 240 | 275 |
| LED FAULT (vermelho) | Ø 22 | 315 | 275 |
| **Emergência (cogumelo)** | Ø 22 | 70 | 195 |
| START (verde) | Ø 22 | 170 | 195 |
| STOP (vermelho) | Ø 22 | 250 | 195 |
| **REARME (azul)** | Ø 22 | 330 | 195 |

> ⚠️ **Verifique a profundidade atrás da porta.** O botão cogumelo com **2 blocos de contato empilhados** ocupa ~70 mm atrás da chapa. Confirme que ele não colide com o trilho DIN 2 (que está a Y = 210–300 no backplate — exatamente atrás da emergência em Y = 195). **Se colidir, desloque a emergência para X = 60** (fora da área ocupada do trilho) ou aumente a profundidade do painel.

### Identificação obrigatória

Painel industrial sem identificação é painel reprovado. Aplique etiquetas gravadas ou impressas em papel adesivo transparente:

| Elemento | Etiqueta |
|---|---|
| Seccionadora | `Q1 — GERAL 24 V` · `0 = DESL / 1 = LIG` |
| Emergência | `S0 — EMERGÊNCIA` |
| START | `S1 — LIGA` |
| STOP | `S2 — DESLIGA` |
| REARME | `S3 — REARME` |
| LEDs | `H1 RUN` · `H2 FRIO` · `H3 QUENTE` · `H4 FALHA` |
| Porta (canto superior) | `⚠ RISCO ELÉTRICO — PAINEL DE COMANDO CF-01` |
| Porta (canto inferior) | `Alimentação: 24 Vcc · Consumo: 105 W` |

---

## 20.5 Furação e entradas de cabo

| Furo / recorte | Medida | Qtd | Face | Função |
|---|---|---:|---|---|
| Botões, LEDs e seccionadora | Ø 22 mm | **9** | Porta | Ver §20.4 — inclui o REARME azul |
| Recorte da Nextion | 98 × 57 mm | 1 | Porta | IHM |
| Fixação do trilho DIN | Ø 5 mm | 12 | Backplate | 4 por trilho (M5) |
| Fixação das canaletas | Ø 4 mm | 16 | Backplate | M4 |
| **Prensa-cabo PG9** — entrada **24 V potência** | Ø 15,5 mm | 1 | Base, X = 50 | Vem da caixa de derivação do poste P1 |
| **Prensa-cabo PG7** — entrada 5 V comando (T2) | Ø 12,5 mm | 1 | Base, X = 110 | Vem do poste P2 |
| **Prensa-cabo PG7** — entrada 12 V auxiliar (T3) | Ø 12,5 mm | 1 | Base, X = 170 | Vem do poste P3 |
| **Prensa-cabo PG9** — saída de potência | Ø 15,5 mm | 1 | Base, X = 260 | BTS → câmara |
| **Prensa-cabo PG9** — saída de sinais | Ø 15,5 mm | 1 | Base, X = 330 | Sensores da câmara |
| **Conector SMA fêmea de painel** | **Ø 6,5 mm** | 1 | **Lateral DIREITA — X = 100, Y = 430** | Antena Wi-Fi externa (**não usar prensa-cabo**) |
| Fixação do painel na base | Ø 5 mm | 4 | Fundo da caixa | M5 por baixo da maquete |
| Passagem do dreno (opcional) | Ø 8 mm | 1 | Base | Se o coletor ficar sob o painel |

### Sequência de furação segura

```
1. Marcar TODOS os furos com o gabarito impresso em escala 1:1
2. Puncionar o centro (evita a broca "passear")
3. Broca-guia Ø 3 mm em todos
4. Alargar: Ø 5 mm com broca comum; Ø 22 mm com serra-copo em baixa rotação
5. Lixar rebarbas dos dois lados
6. Só depois pintar / aplicar etiquetas
```

> 🎯 **Imprima um gabarito 1:1 da porta em papel A3**, cole com fita sobre o MDF e fure através dele. É a maneira mais rápida de acertar as 8 posições de Ø 22 mm com precisão.

---

## 20.6 Canaletas e separação de circuitos

O painel tem 4 níveis de tensão convivendo. A separação física não é estética — é o que impede que o chaveamento dos BTS corrompa as leituras dos sensores.

| Grupo | Tensão / tipo | Bitola | Canaleta |
|---|---|---|---|
| **A — Potência** | **24 V até 6,0 A** (BTS → câmara) | 1,5 mm² | **Canaleta vertical ESQUERDA** |
| **B — Alimentação** | 24 V, 12 V aux, 5 V | 0,5–0,75 mm² | Canaletas horizontais |
| **C — Sinais** | 0–5 V, UART, I²C, 1-Wire | 0,25 mm² | **Canaleta vertical DIREITA** |
| **D — Comando** | 24 V bobina do K1, botoeiras | 0,5 mm² | Canaletas horizontais |

| Regra | Motivo |
|---|---|
| Grupos **A** e **C** em **canaletas opostas** | Máxima separação física entre a fonte de ruído e o receptor sensível |
| Cruzamentos entre A e C sempre a **90°** | Minimiza a área de acoplamento indutivo |
| Cabos de sinal **entrançados aos pares** (sinal + retorno) | Cancela o campo captado |
| **Blindagem** no trecho câmara → painel (I²C e 1-Wire), aterrada **só no painel** | Blindagem aterrada nas duas pontas cria laço de terra |
| Preencher a canaleta no máximo até **60 %** | Permite manutenção e dissipação |
| **Anilha de identificação nas duas pontas** de cada cabo | Norma de painel — e você vai agradecer no comissionamento |

---

## 20.7 Ventilação do painel

| Carga térmica | Valor |
|---|---:|
| 2× BTS7960 (a 6,0 A em 24 V) | ~4 W |
| Arduino + ESP32 + Nextion + módulos | ~3 W |
| **Total** | **~7 W** |

```
Área externa do gabinete: 2(0,4×0,5) + 2(0,4×0,2) + 2(0,5×0,2) = 0,76 m²
U do gabinete de MDF 15 mm ≈ 2,8 W/m²·K
Elevação de temperatura: ΔT = 7 / (2,8 × 0,76) ≈ 3,3 K
```

✅ **Não há problema térmico global.** O painel fica ~3 °C acima do ambiente.

⚠️ **Mas há um ponto quente local:** os dois BTS7960, com seus dissipadores pequenos. Por isso o **cooler de 40 mm é obrigatório**, soprando de baixo para cima contra eles. Ele não resfria o painel — resfria os drivers.

| Item | Especificação |
|---|---|
| Cooler dos BTS | 40 × 40 mm, 12 V, fixado na canaleta abaixo do trilho 2, soprando **para cima** |
| Alimentação | Ramal 12 V auxiliar (T3) — **sempre ligado**, nunca comandado pelo Arduino |
| Veneziana (opcional) | Grade Ø 40 mm na base esquerda e no topo direito, com tela anti-inseto |

---

## 20.8 Passo a passo da montagem mecânica

```
 1. Cortar as 6 peças do gabinete (backplate, porta, 2 laterais, topo, base)
 2. Montar a caixa (cola + parafusos), conferindo o esquadro
 3. Marcar e furar o BACKPLATE: trilhos (12×Ø5) e canaletas (16×Ø4)
 4. Marcar e furar a BASE: 3× PG9 + 2× PG7 (5 entradas separadas) + 4× fixação na maquete
 5. Furar a LATERAL DIREITA: Ø 6,5 mm em X=100 / Y=430 (parte alta) para o conector SMA de painel
 6. Imprimir o gabarito 1:1 e furar a PORTA (8× Ø22 + recorte 98×57)
 7. Lixar e pintar tudo (cinza RAL 7035 ou a cor escolhida)
 8. Fixar os 3 trilhos DIN (M5×10) nas alturas Y = 125 / 255 / 385
 9. Fixar as canaletas horizontais e as 2 verticais
10. Encaixar os componentes nos trilhos (SEM CABOS AINDA):
      Trilho 1: BD-POT, BD-AUX, BD-5V, BD-24V, BD-0V
      Trilho 2: BTS #1, BTS #2 (JÁ COM os 10 kΩ soldados), KA1, KA2
      Trilho 3: Arduino+Shield, PI-1, DNLCB30+ESP32, SD+RTC
11. Instalar as travas-fim de trilho nas duas pontas de cada trilho
12. Montar na porta: Nextion (M3), seccionadora, emergência, START, STOP,
      4 sinaleiros 22 mm de 24 V
13. Instalar os 3 prensa-cabos na base e o **conector SMA de painel na lateral direita**
    (porca + arruela de pressão por dentro; não force — é latão e espana fácil)
14. Fixar o cooler de 40 mm na canaleta sob o trilho 2
15. Instalar a bolsa porta-documentos na face interna da porta
16. Aplicar todas as etiquetas de identificação
17. Fixar o painel na base da maquete (4× M5 por baixo)
```

---

## 20.9 ✅ Checklist de aceitação

- [ ] Gabinete 400 × 500 × 200 mm montado e esquadrejado
- [ ] Backplate furado nas cotas da §20.2, trilhos em Y = 125 / 255 / 385
- [ ] 3 trilhos DIN fixados, nivelados e com travas-fim
- [ ] Canaletas horizontais (4) e verticais (2) instaladas
- [ ] Todos os componentes encaixados nos trilhos, **sem um único cabo ligado**
- [ ] **Conferido:** a emergência (2 blocos) não colide com o trilho 2
- [ ] Porta furada conforme o gabarito, sem rebarbas
- [ ] Nextion instalada e alinhada no recorte
- [ ] Seccionadora, emergência, START, STOP e **4 sinaleiros de 24 V** montados
- [ ] **5 prensa-cabos na base**: 3× PG9 e 2× PG7 — uma entrada separada por tensão
- [ ] **5 blocos de distribuição** instalados (BD-POT, BD-AUX, BD-5V, BD-24V, BD-0V)
- [ ] **BD-POT e BD-24V identificados com anilhas de cores diferentes** — os dois são de 24 V, mas só o BD-POT cai com a emergência
- [ ] BD-0V com entrada de **10 mm²** — é o star ground do projeto
- [ ] ⭐ **Placa PI-1 montada, ensaiada e encaixada no trilho 3**, ao lado do Arduino — ver [Doc 33](../camada_3_eletrica/33_placa_interface_componentes.md)
- [ ] ⭐ **10 kΩ soldados nos dois BTS7960 ANTES de encaixá-los no trilho** (medir ~10 kΩ entre `R_EN` e `GND`) — é muito mais difícil fazer isso com o módulo já cabeado
- [ ] **Conector SMA de painel na LATERAL DIREITA, parte alta (Y = 430)** — nunca em prensa-cabo
- [ ] Pigtail IPEX→SMA ligado ao ESP32 **sem dobras fechadas** (raio mínimo de curvatura: 10 mm)
- [ ] Antena rosqueada por fora e articulada para a vertical
- [ ] Cooler de 40 mm apontado para os BTS7960
- [ ] Todas as etiquetas aplicadas (Q1, S0, S1, S2, H1–H4)
- [ ] Bolsa porta-documentos instalada
- [ ] Painel fixado na base da maquete e alinhado com a faixa zebrada
- [ ] Porta abre e fecha sem esforço, sem tocar em nenhum componente

---

📄 **Anterior:** [Doc 12 — Câmara Térmica](../camada_1_maquete/12_camara_termica.md) · **Próximo:** [Doc 30 — Força e Distribuição](../camada_3_eletrica/30_forca_e_distribuicao.md)
