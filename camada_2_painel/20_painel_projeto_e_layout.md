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
          │ ●   ● ● ● ● ● ●      │──► tela
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
| **STOP (preto)** | Para o processo **e retém**: derruba o selo do KA2, em hardware |
| ⭐ **START / LIGAR (verde)** | **Arma a potência** refazendo o selo do KA2. Não inicia o ensaio — isso é o `INICIAR` da tela |
| **REARME (azul)** | Destrava depois de uma emergência: refaz o selo do KA1 |
| **4 sinaleiros** | Verde = rodando · Azul = esfriando · Amarelo = aquecendo · Vermelho = falha |
| **Tela ES3C28P** | Mostra temperatura, setpoint e estado — e ⭐ **é onde fica o INICIAR** |

> 🔧 **A porta tem QUATRO botoeiras.** Saiu apenas a **seletora LOCAL/REMOTO** — era a segunda camada de uma regra que a primeira já garante (o START nunca é aceito por MQTT). Um furo a menos, 2 fios a menos pela dobradiça e o pino D26 devolvido.
>
> 🔥 **Etiquete o verde como `LIGAR` e o da tela como `INICIAR ENSAIO`.** Chamar os dois de start garante que alguém aperte o verde e fique esperando a temperatura mudar — ele arma a potência, não começa o ciclo.

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
> 🔄 **Revisão "Potência em 24 V":** saíram do **trilho 1** os porta-fusíveis **F4/F5** e a **placa de proteção Zener** (91 mm liberados — o crowbar foi eliminado, ver [Doc 02 §2.6](../camada_0_fundamentos/02_arquitetura_de_energia.md)). Entrou no **trilho 3** a **placa de interface PI-1** (**70 mm**, caixa de 4 módulos), que recolhe os 9 componentes discretos que antes ficariam soltos no chicote — ver [Doc 33](../camada_3_eletrica/33_placa_interface_componentes.md).

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

### 📐 Uma convenção do desenho: todo borne na borda, em fila única

O BTS7960 tem os 8 pinos de sinal numa **barra de 2 × 4**. O desenho **endireita** isso: mostra os oito em fila única, na borda direita.

> ⭐ **Por quê:** um pino da segunda fila fica no **meio** do componente — e não há como desenhar o fio entrando nele sem que ele suma atrás da peça. O objetivo desta vista é mostrar **qual fio entra em qual pino**, e fila dupla impede exatamente isso.

**A ordem é a mesma; muda só o desenho.** Na hora de montar, conte os pinos na barra real do módulo — a sequência bate.

| Componente | No módulo | No desenho |
|---|---|---|
| BTS7960 #1 e #2 | barra de sinal 2 × 4 | 8 bornes na borda direita |
| BD-0V | barra de 20 pontos em 2 fileiras | 20 na borda de baixo |

📐 O `npm run valida:painel` reprova qualquer grupo em fila dupla e avisa quando o passo entre bornes cai abaixo de 2,6 mm. Hoje os três mais apertados são `MEGA.TOPO` (3,7 mm), `MEGA.BASE` (3,9) e `BD-0V.R` (4,8) — todos legíveis.

---

### ↔️ Folga lateral: os componentes que têm borne nos lados

Nem todo componente recebe fio só por cima e por baixo. **Seis deles têm borne na lateral:**

| Componente | Lados | O que entra por ali |
|---|---|---|
| **BTS7960 #1 e #2** | esquerda **e** direita | potência (B+, B−, M+, M−) de um lado, lógica do outro |
| **MV-1** | esquerda e direita | jumpers H/L de um lado, VIN de 12 V do outro |
| **DNLCB30** | esquerda e direita | os dois blocos de 15 bornes do ESP32 |
| Arduino Mega | esquerda | D31–D43 |
| Tela ES3C28P | lateral | conectores |

> ⭐ **O fio de um borne lateral contorna o componente por fora antes de entrar no parafuso.** Ele não pode subir rente à borda — sumiria atrás da peça, e na bancada ficaria prensado entre dois componentes.

**Folga adotada: 8 mm entre vizinhos no trilho 2**, que é onde estão os BTS, o MV-1 e o DNLCB30. Com 358 mm de componentes e 6 folgas, o trilho fecha em 406 dos 420 mm úteis.

```
   34    84  92   142 150  180 188  218 226      292 300  336 344       440
   ├─BTS1─┤ 8 ├─BTS2─┤ 8 ├KA1┤ 8 ├KA2┤ 8 ├──MV-1──┤ 8 ├F-P┤ 8 ├─DNLCB30─┤
      ↕        ↕                        ↕                      ↕
   laterais  laterais                laterais              laterais
```

📐 O script `npm run valida:painel` reprova se um componente com borne lateral ficar a menos de 8 mm do vizinho daquele lado.

---

### 🚪 A porta também tem canaletas

A porta carrega **11 componentes**: a tela, o conversor de nível, 4 sinaleiros, 3 botões, a seletora e o cogumelo. São dezenas de fios — e sem canaleta eles viram um chumaço solto que **fica preso na dobradiça** na primeira vez que alguém fecha o painel com pressa.

| Canaleta | Onde | Tipo |
|---|---|---|
| `CP-topo` | acima da tela | sinal |
| `CP-1x2` | entre a tela e os sinaleiros | sinal |
| `CP-2x3` | entre os sinaleiros e os comandos | sinal |
| `CP-3x4` | entre os comandos e a emergência | **potência** |
| `CP-base` | abaixo da emergência | **potência** |
| ⭐ `CP-vert` | **vertical, na borda da DOBRADIÇA** | sinal |

📐 Na porta a canaleta é de **25 × 25 mm**, e não de 30 × 30 como na placa: passa menos fio e a porta não pode ficar pesada — peso na porta força a dobradiça e ela desalinha.

### ⭐ As DUAS calhas de travessia — o ponto que mais falha em painel

Os fios da porta cruzam para a placa **num ponto só de cada classe**, e esse trecho é o único do painel inteiro que **se move**. As duas calhas ficam no **canto inferior direito**, uma acima da outra:

```
   PLACA DE MONTAGEM                     PORTA (vista de dentro)
   ┌────────────────────┐          ┌─┬─┬──────────────────┐
   │                    │          │s│p│                  │
   │           CV-dir ══╪═ CL-sin ═╡ │p│                  │  y = 380
   │           (sinal)  │  ∿∿∿∿∿   │i│o│                  │   ← a mais CURTA
   │                    │          │n│t│                  │
   │                    │          │a│ │                  │
   │          CH-base ══╪═ CL-pot ═╪═╡ │                  │  y = 444
   │         (potência) │  ∿∿∿∿∿∿  │ └─┘                  │   ← passa mais fundo
   └────────────────────┘          └────────────────────  ┘
                                    ▲ ▲
                            CP-vsin ┘ └ CP-vpot
```

⭐ **Repare no comprimento diferente das duas.** A `CL-sin` **morre na primeira vertical que encontra** — a de sinal, que fica na borda da dobradiça. A `CL-pot` precisa ir mais fundo, até a de potência.

**E é por isso que a de sinal está na borda.** Se fosse o contrário, a calha de sinal teria que passar por cima da vertical de potência para chegar ao seu destino — misturando as duas classes justamente no ponto mais crítico. Do jeito que está, a `CL-pot` cruza aquele trecho **na altura em que a vertical de sinal já acabou** (ela vai até y=410; a calha de potência está em 444).

📐 O `npm run valida:painel` confere as três coisas: que cada calha **entra dentro** da sua vertical (nem antes nem depois), que **encosta nela em altura**, e que **não passa por cima** da vertical da outra classe.

| Calha | Sai da placa por | Chega na porta em | Leva |
|---|---|---|---|
| **CL-pot** | `CH-base` | `CP-vpot` | a cadeia de comando de 24 V — 5 fios |
| **CL-sin** | `CV-dir` | `CP-vsin` | tela, botões de 5 V e seletora — etapa 5 |

📌 **46 mm entre as duas.** Elas partem de canaletas diferentes da placa e chegam em canaletas diferentes da porta — a segregação se mantém do começo ao fim, inclusive no único trecho que flexiona.

> ⭐ **E foi a calha que decidiu um detalhe do relé.** Como a `CL-pot` sai da `CH-base`, todos os fios externos da cadeia precisam estar na **fileira de baixo** do KA1. Por isso o **selo usa o contato 2** (`21`→`24`, fileira de cima, só pontes curtas) e a **saída usa o contato 1** (`11`→`14`, fileira de baixo, onde saem os fios). Os dois contatos são NA e eletricamente idênticos — o que decidiu foi a fileira.

| Regra | Por quê |
|---|---|
| **Espiral organizador** Ø 12 mm | mantém o chicote junto e protege o isolamento do atrito |
| **Folga de 60 mm** além da distância reta | com a porta aberta a 120°, o caminho é mais longo que com ela fechada. Sem folga, o fio traciona e arranca do borne |
| **Laço em U**, nunca esticado | o fio tem que dobrar sempre no mesmo sentido; um laço frouxo distribui a flexão por vários centímetros em vez de concentrar num ponto |
| Cruzar pela **CV-dir (sinal)** | a porta leva quase só sinal — tela, botões, sinaleiros. A potência da porta é o cogumelo, que vai pela `CP-3x4` |

> 🔥 **É por isso que a antena NÃO pode ficar na porta.** Fio comum aguenta milhares de ciclos de flexão se tiver folga. **Coaxial não.** O dielétrico do pigtail IPEX de 1,13 mm racha, a impedância deixa de ser 50 Ω, e o alcance cai — de forma intermitente, que é o pior modo de falhar.

---

### 🕳️ Por onde os cabos saem — três furos no FUNDO

Os cabos que alimentam a câmara **descem pelo fundo do painel** e correm por baixo da bancada até ela. A posição de cada furo não é arbitrária:

| Furo | Rosca | X | O que sai | Por que ali |
|---|---|---:|---|---|
| **PG13-2** | **PG13,5** | **230 mm** | 12 fios de POTÊNCIA — Peltier, PTC, ventoinhas | **À esquerda**, longe do canto de sinal. É por aqui que passam os 6 A chaveados |
| **PG9-3** | PG9 | **470 mm** | 9 fios de SINAL — retornos das posições, I²C, DS18B20, RPM | **No canto direito**, bem embaixo da `CV-dir`. Os fios descem pela canaleta de sinal e caem direto no furo, sem nunca passar perto dos de potência |
| **PG7-3** | PG7 | **300 mm** | 2 fios de 5 V para os **LEDs dos postes** | Não vai para a câmara: vai para a maquete. Sai sozinho porque 0,25 mm² de 5 V não tem o que fazer dentro do feixe dos 6 A chaveados |

#### ⚠️ Por que o furo da potência é PG13,5 e não PG9

O projeto declarava um **PG9** ali, com "capacidade: 14 fios" escrito à mão. Refeita a conta, não fecha:

| | |
|---|---|
| 4 condutores de 1,5 mm² | Ø externo ≈ **3,0 mm** cada |
| 8 condutores de 0,5 mm² | Ø externo ≈ **2,2 mm** cada |
| **Diâmetro do feixe** | `1,15 × √(4×3,0² + 8×2,2²)` = **9,9 mm** |
| **PG9 aperta** | 4 a **8 mm** |
| **PG13,5 aperta** | 6 a **12 mm** ✅ |

🔥 **Não é "apertado": não fecha.** Com o feixe maior que a faixa de aperto, a vedação de borracha não morde o cabo. O furo fica aberto — e um furo aberto no fundo de um painel é por onde entram poeira e umidade, exatamente onde estão os 6 A chaveados.

> ⭐ **A regra vale para os dois lados da parede.** O `PC-1`, o furo correspondente na câmara, recebe 10 condutores (9,3 mm de feixe) e também é PG13,5. O `PC-2` recebe 6 e continua PG9.

> 📌 **Os dois PG7 ficam abaixo da faixa mínima** (2,5 e 2,9 mm contra os 3,0 mm da rosca). Nesse sentido a correção é a fácil: use a **vedação redutora** que vem na embalagem do prensa-cabo. O script avisa, mas não reprova.

**Quem confere isso agora é o `npm run valida`**, com a conta do feixe, e não um número digitado.

```
   ┌──────────────────────── PAINEL ────────────────────────┐
   │                                                   CV-  │
   │                                                   dir  │  ← canaleta
   │                                                   ║║║  │    de sinal
   │            CH-base (potência)                     ║║║  │
   └──────────────●─────────────────────────────────────●───┘
               PG13-2                                 PG9-3
              (potência)                          (sinal/medição)
                  │                                    │
                  └──────── por baixo da bancada ──────┴──► CÂMARA
```

> ⭐ **O PG9-3 está embaixo da canaleta vertical de sinal de propósito.** O retorno das posições carrega os 17,6 mA que estão sendo medidos: ele desce pela `CV-dir`, atravessa o furo e vai embora — **sem entrar em nenhuma canaleta de potência em momento algum**. A segregação vale do borne da PI-2 até dentro da câmara.

📐 **Veja no aplicativo:** aba "Dentro do painel". Botão **"🚪 Fechar a tampa"** encosta a câmara no painel e mostra os dois chicotes saindo pelo fundo e correndo por baixo até ela.

---

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
     │   trilho 2           │  │
     └──────────────────────┘  ▼ Y=0
```

| Parâmetro | Especificação |
|---|---|
| **Face** | **Lateral DIREITA** (o DNLCB30 está no lado direito do trilho 2) |
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

> 🤖 **Esta seção é GERADA** por `npm run trilhos` a partir de
> [`painel_completo.js`](../painel_interativo/src/data/painel_completo.js), que é o
> mesmo modelo que o `npm run valida` confere. **Não edite à mão** — edite o modelo
> e rode o gerador. Ela existe assim porque a versão escrita à mão tinha derivado:
> falava em `K0`/`K1`, punha o KA1 e o KA2 no trilho errado e não conhecia o KA3
> nem o KA4.

### TRILHO 1 — Distribuição e proteção (Y = 385)

| # | Componente | X | Largura | Termina em |
|---:|---|---:|---:|---:|
| 1 | **BD-POT** — 24 V COMUTADO (morre na emergência) | 30 | 36 mm | 66 |
| 2 | **BD-AUX** — 12 V das ventoinhas (permanente) | 72 | 36 mm | 108 |
| 3 | **BD-24V** — 24 V PERMANENTE (comando) | 114 | 45 mm | 159 |
| 4 | **BD-5V** — 5,10 V da eletrônica (permanente) | 165 | 87 mm | 252 |
| 5 | **BD-0V** — retorno único de tudo (star ground) | 258 | 105 mm | 363 |
| 6 | **KA1** — SEGURANÇA: cai na emergência, rearme azul | 362 | 34 mm | 396 |
| 7 | **KA2** — PROCESSO: cai no STOP, religa no verde | 402 | 34 mm | 436 |
| | **Ocupação total** | | **406 mm** | livre até 458 — sobram **22 mm** |

### TRILHO 2 — Potência e comando (Y = 255)

| # | Componente | X | Largura | Termina em |
|---:|---|---:|---:|---:|
| 1 | **BTS1** — driver de potência da PELTIER (frio) | 34 | 50 mm | 84 |
| 2 | **BTS2** — driver de potência do PTC (quente) | 92 | 50 mm | 142 |
| 3 | **MV-1** — liga as 5 ventoinhas INTERNAS da câmara | 150 | 66 mm | 216 |
| 4 | **F-P** — fusível e chave da posição de ensaio | 224 | 26 mm | 250 |
| 5 | **ESP32** — Wi-Fi, MQTT e dashboard remoto | 268 | 96 mm | 364 |
| 6 | **KA34** — KA3 (POTÊNCIA) + KA4 (FAN EXTERNA DA PELTIER) — módulos de relé | 374 | 70 mm | 444 |
| | **Ocupação total** | | **410 mm** | livre até 458 — sobram **14 mm** |

### TRILHO 3 — Controle (Y = 125)

| # | Componente | X | Largura | Termina em |
|---:|---|---:|---:|---:|
| 1 | **MEGA** — o cérebro: PID, proteções e intertravamento | 32 | 134 mm | 166 |
| 2 | **PI1** — PI-1 — filtros, divisor e pull-up | 176 | 70 mm | 246 |
| 3 | **SC-1** — sensor de corrente da posição de ensaio | 291 | 40 mm | 331 |
| 4 | **RTC** — RTC DS3231 — data e hora reais para o log | 402 | 35 mm | 437 |
| | **Ocupação total** | | **405 mm** | livre até 458 — sobram **21 mm** |

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
 │              │  TELA ES3C28P 2,8"  │                    │  │
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
| Recorte da tela **ES3C28P** ⬆ | **47 × 61** (retrato) | 176 → 223 | 345 → 406 |
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
| Recorte da tela **ES3C28P** | **47 × 61 mm** | 1 | Porta | IHM |

> ⚠️ **O recorte MUDOU de tamanho e de orientação.** A Nextion 3.2" era **paisagem**, 98 × 57 mm. A ES3C28P é **retrato**: o módulo mede 50 × 86 × 10,6 mm e a janela visível do toque é 45,2 × 59,45 mm. O recorte fica **47 × 61 mm em pé**.
>
> 🚨 **Não fure a porta antes de a placa chegar.** Meça a janela real do módulo em mãos — 2 mm de erro num recorte retangular não têm conserto, e a placa é presa por trás.
>
> 📏 **A placa é mais funda:** 10,6 mm contra ~9 mm da Nextion, mais o conector JST e o cabo saindo por trás. Reserve **25 mm livres** atrás do recorte antes de posicionar qualquer coisa na contraporta.
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
| Arduino + ESP32 + tela + módulos | ~3 W |
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
12. Montar na porta: tela ES3C28P, seccionadora, emergência, START, STOP,
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
- [ ] Tela **ES3C28P** instalada e alinhada no recorte (retrato), com 25 mm livres atrás
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
- [ ] Todas as etiquetas aplicadas (Q0 geral, S0, S1 `LIGAR`, S2, S3, H1–H4)
- [ ] Bolsa porta-documentos instalada
- [ ] Painel fixado na base da maquete e alinhado com a faixa zebrada
- [ ] Porta abre e fecha sem esforço, sem tocar em nenhum componente

---

📄 **Anterior:** [Doc 12 — Câmara Térmica](../camada_1_maquete/12_camara_termica.md) · **Próximo:** [Doc 30 — Força e Distribuição](../camada_3_eletrica/30_forca_e_distribuicao.md)
