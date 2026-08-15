# CAMADA 1 · Doc 11 — Subestação, Postes e Transformadores

> **A parte mais original do projeto.** Aqui você constrói a representação física do sistema elétrico de potência: uma subestação que recebe 127 V CA e entrega 24 V CC, uma linha de distribuição sobre três postes, e **um transformador em cada poste** reduzindo a tensão perto de cada carga.
>
> ✅ **Pré-requisito:** [Doc 10](10_base_e_chao_de_fabrica.md) concluído (base furada e pintada).
> 🖼️ **Desenhos:** [Detalhe do poste](../desenhos/03_poste_detalhe.svg) · [Planta baixa](../desenhos/01_maquete_planta.svg)

---

## 🟢 Em palavras simples — você vai construir a rua elétrica em miniatura

Olhe pela janela. Aqueles postes com fios e um "tambor" pendurado são a rede elétrica que abastece a sua casa. É **exatamente isso** que esta etapa constrói, em escala.

### O caminho da energia na vida real — e na maquete

| Na cidade | Na sua maquete | Peça física |
|---|---|---|
| A usina gera energia | A tomada da parede | Cabo de força |
| A **subestação** abaixa a tensão para distribuir | Caixa fechada com a fonte de 24 V | Caixa de MDF, 26 × 19 × 15 cm |
| Os fios correm de poste em poste, no alto | 4 fios sobre 3 postes | Tubo de alumínio Ø 8 mm |
| O **transformador do poste** abaixa para 127 V perto da sua casa | Conversores nos postes P2 e P3 | Tubo de PVC Ø 50 mm |
| O fio desce do poste e entra na sua casa | O fio desce por dentro do poste e vai ao painel | Fio flexível |

### Por que o poste P1 não tem transformador

Essa é a parte mais interessante para explicar na banca.

Repare: **nem todo mundo recebe um transformador de poste.** Uma casa recebe, porque precisa de 127 V. Mas uma **indústria grande** recebe a energia **na tensão alta mesmo** e monta a própria subestação lá dentro — porque ela consome tanto que compensa.

Na maquete acontece igual:

- **P2 e P3** têm transformador, porque o Arduino precisa de 5 V e os ventiladores de 12 V
- **P1 não tem**, porque a carga dele — as pastilhas Peltier e o aquecedor — **já trabalha em 24 V**, a mesma tensão da linha. Não há nada a transformar

> 🎓 **Frase para a defesa:** *"O P1 representa o consumidor industrial atendido em tensão primária. Ele não recebe transformador porque sua carga já opera na tensão da rede — exatamente como acontece com um grande consumidor real."*

### Por que os fios são encapados, se na rua são nus

Boa pergunta, e a resposta é técnica: **em corrente contínua, o arco elétrico não se apaga sozinho.**

Na rua, a corrente é alternada — ela passa por zero 120 vezes por segundo, e o arco morre nesses instantes. Em corrente contínua isso nunca acontece: se dois fios se tocam, o arco **continua queimando** até alguém desligar.

Como a maquete vai ser transportada e manuseada, dois fios nus a 3,5 cm de distância são um curto esperando acontecer. Por isso: **todos encapados, sem exceção.**

E há um bônus: a rede moderna de verdade também é assim. Chama-se **rede compacta protegida**, e está substituindo a rede nua justamente por segurança.

### Por que o fio azul é mais grosso que os outros

Os 3 fios de cima ("as fases") levam energia para os três caminhos. O fio azul embaixo é o **retorno** — por onde tudo volta.

Como tudo volta por ele, **ele conduz a soma das três correntes**. Por isso é o mais grosso: 1,5 mm² contra 1,0 e 0,5 mm² dos outros.

> 💡 **Aponte esse fio com o dedo na apresentação.** Numa rede trifásica de corrente alternada acontece o **contrário** — o neutro é o mais fino, porque as três fases se cancelam entre si. Em corrente contínua não existe esse cancelamento. É o detalhe que mostra que você entendeu, e não só copiou o visual.

### Dicionário rápido

| Termo | O que quer dizer |
|---|---|
| **Subestação** | Onde a tensão é transformada. Aqui: 127 V CA → 24 V CC |
| **Cruzeta** | A barra horizontal no topo do poste, que sustenta os fios afastados |
| **Isolador** | A peça (aqui, uma miçanga) que segura o fio sem deixá-lo tocar o metal |
| **Ramal** | Cada um dos 3 caminhos de energia |
| **Derivação** | Puxar um fio da linha **sem cortá-la** — o fio continua para o próximo poste |
| **Rede compacta protegida** | Rede com condutores cobertos, usada hoje por segurança |
| **Retorno / neutro** | O caminho de volta da corrente |
| **Flecha** | A barriguinha que o fio faz entre dois postes. Fio esticado demais arrebenta |

---

## 11.1 O que cada elemento representa

```
    REALIDADE                                MAQUETE
──────────────────────────────────────────────────────────────────────────
 Concessionária                     ──►   Tomada 127 V CA
 Subestação abaixadora              ──►   CAIXA DA SUBESTAÇÃO
   · transformador de força                · Fonte chaveada 127 VCA → 24 VCC
   · disjuntor geral                       · Disjuntor 2P 6 A curva C
   · chaves fusíveis dos ramais            · Porta-fusíveis F1 / F2 / F3
──────────────────────────────────────────────────────────────────────────
 Rede compacta protegida            ──►   LINHA SOBRE 3 POSTES
   · 3 fases na cruzeta                    · 3 ramais de +24 V (R1, R2, R3)
   · neutro logo abaixo das fases          · Retorno comum 0 V
   · condutores COBERTOS                   · Fio rígido COM CAPA (nunca nu)
   · conector perfurante na derivação      · Derivação soldada e isolada
──────────────────────────────────────────────────────────────────────────
 Transformador de distribuição      ──►   T2 e T3 (nos postes P2 e P3)
 Consumidor em tensão primária      ──►   P1 — derivação direta, SEM trafo
 Ramal de entrada subterrâneo       ──►   Cabo desce por dentro do poste
                                           e segue por baixo da base
──────────────────────────────────────────────────────────────────────────
 Quadro do consumidor               ──►   PAINEL DE COMANDO
```

> ⚡ **Ponto forte da apresentação:** você percorre a maquete mostrando **24,0 V** na linha, **24,0 V passando direto** pelo P1 (com a corrente das Peltier ao vivo no amperímetro), **5,10 V** saindo do T2 e **12,0 V** saindo do T3. E os **displays vermelhos dos LM2596**, visíveis pelas janelas de acrílico, mostram isso o tempo todo, de longe, sem multímetro.

---

## 11.2 ⚠️ Mudança importante: a linha NÃO usa condutor nu

A versão anterior deste documento previa fio de cobre **nu** na linha, imitando a rede convencional. **Isso foi corrigido.**

### Por quê

> Em corrente contínua, **qualquer objeto metálico que encoste em dois condutores ao mesmo tempo é um curto-circuito franco**. Não existe passagem por zero de corrente como em CA, então o arco elétrico, uma vez aberto, **se sustenta** — é justamente por isso que seccionar CC é mais difícil que seccionar CA.
>
> Numa maquete que vai ser transportada, montada, apontada com o dedo e cutucada por gente curiosa numa banca, deixar quatro condutores nus a 35 mm um do outro é procurar problema. Um clipe de papel, a ponta de uma chave de fenda, um pedaço de arame da cerca — qualquer um desses derruba um ramal.

### A solução (que é tecnicamente melhor e igualmente realista)

**Rede compacta protegida.** É o padrão moderno da distribuição urbana: condutores **cobertos** (não isolados plenos, mas com camada protetora) montados em espaçadores, justamente para eliminar faltas por contato acidental — galho de árvore, pipa, animal.

| Antes (v1) | Agora (v2) |
|---|---|
| Fio de cobre nu | **Fio rígido com capa**, colorido |
| "Rede convencional nua" | **"Rede compacta protegida"** |
| Risco de curto ao toque | Curto só com dano à capa |
| Sem código de cores | **Código de cores didático** |

> 📌 **Como responder se perguntarem:** *"Optamos por rede compacta protegida em vez de rede nua convencional. É o padrão adotado nas redes urbanas modernas justamente para reduzir faltas por contato, e em corrente contínua essa proteção é ainda mais importante, porque a extinção do arco é mais difícil que em corrente alternada."*

### Código de cores da linha

| Posição | Condutor | Bitola | Corrente | **Cor da capa** | Analogia |
|---|---|---|---:|---|---|
| Cruzeta, esquerda | **R1 — potência** (P1, direto) | **1,00 mm²** rígido | **6,00 A** | **Vermelho** | fase R |
| Cruzeta, centro | **R2 — comando** (T2) | 0,50 mm² rígido | 0,19 A | **Marrom** | fase S |
| Cruzeta, direita | **R3 — auxiliares** (T3) | 0,50 mm² rígido | 0,75 A | **Cinza** | fase T |
| **40 mm abaixo da cruzeta** | **0 V — retorno comum** | **1,50 mm² rígido** | **6,9 A** | **Azul claro** | neutro |

> 📐 **Por que o retorno é o mais grosso?** Porque ele conduz a **soma** das correntes dos três ramais (**6,9 A**), enquanto o ramal mais carregado conduz 6,0 A. Em CC não existe o cancelamento vetorial que ocorre entre fases equilibradas em CA. **É o detalhe que separa quem entendeu de quem só copiou o visual.**
>
> 🎯 **A diferença ficou visível a olho nu:** com o retorno em 1,50 mm² e as "fases" em 1,00 e 0,50 mm², dá para apontar o cabo azul com o dedo durante a defesa e dizer por que ele é mais grosso. Em uma rede trifásica CA equilibrada seria o contrário — o neutro é o mais fino.
>
> 📐 **Por que o retorno fica abaixo da cruzeta?** Mesma razão da rede real: o neutro fica na posição mais baixa da estrutura, abaixo das fases, para facilitar a manutenção e as derivações. Aqui ele fica **40 mm abaixo** — visível e claramente separado.

### Fio rígido, não flexível

| Vantagem do rígido (sólido) | Por quê |
|---|---|
| **Autossustentável** | Mantém a catenária entre os postes sem cabo mensageiro |
| Aceita ser moldado | Você "penteia" a flecha de 3–5 mm com a mão e ela fica |
| Termina bem no isolador | Não se desfia como o multifilar |

Compre **fio rígido 750 V** nas quatro cores. É o mesmo fio de instalação predial, vendido a metro.

---

## 11.3 SUBESTAÇÃO — pátio aberto + casa de comando

### 🟢 Em palavras simples — por que a subestação é aberta

Uma subestação de verdade **não é uma caixa**. É um **pátio ao tempo, cercado**, com os equipamentos à vista: transformadores, chaves, barramentos. E dentro desse pátio existe um prediozinho fechado — a **casa de comando** — onde ficam os painéis de proteção e os serviços auxiliares.

A maquete reproduz exatamente isso:

```
        PÁTIO ABERTO (cercado, com brita)          CASA DE COMANDO
   ┌─────────────────────────────────────┐        ┌──────────────┐
   │  estrutura metálica treliçada       │        │ ⚡ 127 V     │
   │  bloco de fusíveis F1/F2/F3 (24 V)  │◄───────┤  fonte       │
   │  bornes de 24 V                     │  24 V  │  disjuntor   │
   │  ┌── a linha sobe para os postes    │        │  chave       │
   └──┼──────────────────────────────────┘        └──────────────┘
      │     tudo aqui é 24 V = SELV                  FECHADA e
      ▼     pode ser tocado                          APARAFUSADA
```

> 🎯 **Ganho didático:** os fusíveis F1/F2/F3 ficam **visíveis no pátio**, como as chaves fusíveis de uma subestação real. Antes estavam escondidos dentro de uma caixa. Eles são de **24 V** — seguros ao toque.

### ⚠️ Regra de segurança inegociável

> **A CASA DE COMANDO é o único lugar da maquete com tensão perigosa.** Ela deve ser:
> - **Fechada e aparafusada** com 4 parafusos (nada de tampa de encaixe ou fecho rápido)
> - **Opaca** (nada de acrílico transparente mostrando os 127 V)
> - **Etiquetada:** "⚡ PERIGO — 127 V CA — ABRIR SOMENTE DESENERGIZADO"
> - **Aberta somente com o plugue fora da tomada**
>
> Da casa de comando para fora **só sai 24 V CC**. Todo o resto da maquete — pátio, estruturas, postes, painel — é **SELV** e pode ser tocado com segurança.

### O que fica dentro e o que fica fora

| Fica **DENTRO** da casa de comando (127 V) | Fica **NO PÁTIO**, à vista (24 V) |
|---|---|
| Plugue de entrada e prensa-cabo AC | Bloco de fusíveis **F1, F2, F3** |
| **Q0** — disjuntor 2P 6 A curva C | Bornes de distribuição de 24 V e 0 V |
| **S3** — chave rotativa 0-1 | Estrutura treliçada de saída da linha |
| **Fonte chaveada 24 V / 240 W** | Cerca, brita, placas de sinalização |
| Barra de terra (PE) | |

> 🔧 **O disjuntor e a chave montam NA PAREDE da casinha** — corpo e terminais por dentro, manopla por fora. É assim que todo painel industrial funciona: você opera sem abrir nada. Furo de 22 mm para a chave rotativa; recorte retangular para a manopla do disjuntor.

### Dimensões e posição

| Item | Especificação |
|---|---|
| **Casa de comando** | **250 × 150 × 90 mm** (L × P × A) — encolheu, porque os fusíveis saíram |
| **Orientação** | Face de operação voltada para a **rua** (chave e disjuntor acessíveis) |
| Material | MDF 9 mm ou acrílico **opaco** 4 mm |
| Tampa | Superior, removível, **4 parafusos M3 com inserto** |
| Acabamento | Cinza claro fosco + etiquetas de perigo |
| **Pátio aberto** | Cercado com brita, X 10 → 300 · Y 285 → 490 |
| **Cerca** | ⚠️ **Funcional, não decorativa** — ver abaixo |

> 📏 **MEÇA SUA FONTE ANTES DE CORTAR.** Fontes de 240 W variam entre 199 × 98 × 38 mm e 215 × 115 × 50 mm. A casinha foi dimensionada para a maior, com folga de ventilação.

> ⚠️ **A ventilação virou crítica.** A fonte dissipa ~29 W, e agora numa caixa **menor** que antes. O **cooler de 60 mm de 24 V + a grade de entrada de ar deixaram de ser opcionais**. Sem eles a fonte trabalha quente, envelhece rápido e pode desarmar por temperatura no meio da apresentação.

### 🚧 A cerca agora é proteção, não cenografia

Em subestação real, a cerca é a barreira que impede aproximação de equipamento energizado. Na maquete ela passa a cumprir a mesma função: **delimita a área do pátio e impede que alguém encoste nos componentes por reflexo**.

Ela continua sendo tela de aço com malha de 3 mm, mas agora vale mencioná-la na apresentação como item de segurança, com as placas "PERIGO ALTA TENSÃO" fixadas nela — exatamente como no original.

### ⚡ Aterramento das estruturas metálicas

Se você usar **estruturas metálicas treliçadas** no pátio (latão, alumínio ou aço), elas precisam ser **ligadas à barra de terra (PE)** por um fio verde-amarelo.

**Por quê:** torre de transmissão real é aterrada — é o caminho de escoamento do para-raios e o que garante que a estrutura nunca fique com potencial diferente do solo. Chama-se **equipotencialização**, e é conteúdo direto de eletrotécnica.

> 🎓 **Vale ponto na defesa.** Custa um fio e permite responder à pergunta *"e se um condutor encostar na estrutura?"* — com a estrutura aterrada, a proteção enxerga a falta e atua; com ela isolada, o defeito ficaria escondido esperando alguém tocar.

> 💡 **Latão solda; alumínio não.** Se a intenção é montar treliças soldando barra por barra, **use arame ou barra de latão** — ele aceita solda de estanho com ferro comum. O alumínio exige processo e material específicos, e é por isso que os postes do projeto são tubo montado com cinta, não soldado.

### Layout interno (vista superior, tampa removida)

```
 ┌───────────────────────────────────────────────────────────────┐ ← fundo (Y=485)
 │  [prensa-cabo AC]                          [prensa-cabo 24 V] │
 │        │                                            ▲          │
 │   ┌────▼───────────────────────────────────────┐   │          │
 │   │       FONTE CHAVEADA 24 Vcc · 240 W         │   │          │
 │   │   L   N   PE  │  −V  −V  +V  +V             │   │          │
 │   └───▲───▲───▲───┴───┬───┬───┬───┬─────────────┘   │          │
 │       │   │   │       └───┴───┴───┴─────────────────┤          │
 │       │   │   └──► BARRA DE TERRA (PE)               │          │
 │  ═════╪═══╪═══════════════════════════  TRILHO DIN 35 × 170    │
 │   ┌───┴───┴──┐ ┌────┐ ┌────┐ ┌────┐ ┌──────┐ ┌──────┐         │
 │   │ Q0 DISJ. │ │ F1 │ │ F2 │ │ F3 │ │BORNE │ │BORNE │         │
 │   │ 2P 6A C  │ │ 6A │ │ 2A │ │ 2A │ │ +24V │ │  0V  │         │
 │   └──────────┘ └────┘ └────┘ └────┘ └──────┘ └──────┘         │
 │                                                                │
 │  [grade de ar 60 mm]                    [cooler 60 mm 24 V]   │
 └───────────────────────────────────────────────────────────────┘ ← frente (Y=295)
        ▲                                          ▲
   [CHAVE ROTATIVA 0-1]                    [LED 24 V ON]
     (face frontal, voltada para a rua)
```

### Sequência elétrica

```
Plugue 127 V ─► prensa-cabo ─┬─ PE (verde/amarelo) ──► barra de terra ──► carcaça da fonte
                             ├─ N (azul) ───► Q0 polo 2 ──────────────► fonte "N"
                             └─ L (preto) ──► Q0 polo 1 ──► S3 chave ─► fonte "L"

Fonte +V ─► BORNE +24V ─┬─ [F1 6 A] ─► R1 ─┐
                        ├─ [F2 2 A] ─► R2 ─┼── sobem pelo poste P1
                        └─ [F3 2 A] ─► R3 ─┤
Fonte −V ─► BORNE 0V ─────────────► 0 V ───┘
```

> 🔧 **Por que o disjuntor vem antes da chave rotativa?** O disjuntor é **proteção** (atua em falha); a chave é **manobra** (operação normal). A proteção sempre fica a montante, para que a própria chave também esteja protegida. O disjuntor bipolar ainda secciona fase **e** neutro — importante em rede 127 V, onde nem sempre se sabe qual pino da tomada é a fase.

### Ventilação

A fonte dissipa ~18 W. Sem ventilação a caixa passa de 60 °C e a vida dos capacitores despenca (**cada 10 °C a mais reduz a vida pela metade**).

| Elemento | Especificação | Posição |
|---|---|---|
| Entrada de ar | Grade 60 mm com filtro | Face frontal esquerda, **parte baixa** |
| Exaustão | **Cooler 60 mm de 24 V CC** | Face frontal direita, **parte alta** |

> ⚠️ O cooler é de **24 V** porque é a única tensão que existe dentro da caixa. Se só encontrar de 12 V, ligue **dois em série**. **Nunca** um de 12 V direto em 24 V.

### Pátio da subestação

| Elemento | Como fazer |
|---|---|
| **Brita** | Pedrisco de aquário colado com PVA diluído (1:3). É assim na realidade: a brita é isolante e reduz a tensão de passo |
| **Cerca** | Tela metálica malha 3 mm, 60 mm de altura, em postes de arame 1,5 mm a cada 50 mm |
| **Portão** | Trecho de 40 mm da cerca, semiaberto |
| **Placas** | "⚡ PERIGO ALTA TENSÃO" nas 4 faces |
| **Malha de terra** | Fio de cobre nu 1 mm² descendo da caixa até a brita, com uma "haste" (prego de cobre) |

> 💡 Explicar a brita e a malha de terra vale ponto: são medidas contra **tensão de passo e de toque**, conteúdo direto de NR-10 e NBR 14039. (É o único lugar da maquete onde cobre nu é correto — ele está aterrado de propósito.)

---

## 11.4 POSTES DE DISTRIBUIÇÃO

### Especificação

| Item | Valor |
|---|---|
| Material | Tubo de alumínio **Ø 8 mm**, parede 1 mm |
| Comprimento total | **350 mm** (300 visíveis + 50 de encaixe) |
| Quantidade | 3 (P1, P2, P3) |
| **Posição** | **P1 (360, 265) · P2 (475, 265) · P3 (590, 265)** — na calçada do fundo |
| Vão entre postes | **115 mm** (≈ 5,7 m em escala 1:50) |
| Acabamento | Spray cinza concreto fosco, mais escuro na base |
| Função extra | **O tubo é o eletroduto do ramal de saída** do transformador |

### Elevação do poste (cotado)

```
              ◄──── 90 mm ────►
          ┌─────────────────────┐  ← topo
          │   ●      ●      ●   │  ← 3 ISOLADORES (contas Ø 6 mm)
   260 ══╪═══════╪══════╪═══════   ← CRUZETA (barra chata 12 × 2 mm)
   mm     │  R1     R2     R3      ← +24 V · vermelho / marrom / cinza
          ║           espaçamento 35 mm
   220 ──╫────────●───────────      ← ISOLADOR do RETORNO (suporte 30 mm)
   mm     ║        0 V              ← retorno comum · AZUL CLARO
          ║        ↑ 40 mm abaixo da cruzeta
          ║   ╭╌╌╌╌┴╌╌╌╌╮
          ║   ╎ derivação ╎         ← 2 fios descem por FORA do tubo
   165 ──╫──[ TRAFO / DERIV. ]      ← DERIVAÇÃO (P1) · T2 (P2) · T3 (P3)
   mm     ║   ╎  ┌───────┐ ╎
          ║   ╎  │ 5.10V │ ╎        ← DISPLAY do LM2596, pela janela de
          ║   ╎  └───────┘ ╎          acrílico (no P1, medidor V/A)
          ║   ╰╌╌│───────│╌╯
          ║      └───┬───┘
          ║          │ saída desce por DENTRO do tubo
          ║          ▼
     0 ══╩═══════════════════       ← NÍVEL DO PISO (calçada)
        ┌─┴─┐ flange M3 (4 furos)
        └───┘
   ────────────── base MDF ──────────────
          ║ ← 50 mm dentro do vão
          ▼ o fio sai aqui e segue por baixo até o painel
```

### Passo a passo

1. **Cortar** o tubo em 350 mm; **rebarbar as duas pontas** (rebarba corta a capa do fio que passa por dentro).
2. **Furar** o tubo:
   - Ø 3 mm a **260 mm** → passagem da cruzeta
   - Ø 3 mm a **220 mm** → suporte do retorno
   - Ø 4 mm a **175 mm** → entrada da saída do transformador no tubo
   - Ø 4 mm a **20 mm** → saída do fio para dentro da base
3. **Cruzeta:** barra chata de 90 mm, 3 furos Ø 2 mm em **−35, 0 e +35 mm** do centro, e um furo central Ø 3 mm.
4. **Fixar a cruzeta** com um parafuso M3 passante + gota de epóxi.
5. **Suporte do retorno:** barra chata de 30 mm com 1 furo, a 220 mm.
6. **Isoladores:** colar as contas Ø 6 mm sobre os furos com epóxi.
7. **Pintar** o conjunto de cinza concreto (mascarar os isoladores).
8. **Flange de base:** MDF 6 mm com furo central Ø 8,5 mm e 4 furos Ø 3 mm.
9. **Instalar:** passar o tubo pelo furo da base, deixar 300 mm acima do piso, parafusar a flange nos insertos M4 e travar com epóxi por baixo.

### Amarração nos isoladores

```
        condutor com capa
    ────────●────────
           ╱│╲          ← amarração em fio de cobre 0,2 mm, em forma de 8
          ( ● )         ← isolador (conta Ø 6 mm)
           ╲│╱
            ║           ← cruzeta
```

1. Assentar o condutor na "gola" do isolador.
2. Dar 4–5 voltas de fio fino 0,2 mm em forma de 8, em volta do condutor e do isolador.
3. Torcer as pontas, cortar rente, travar com uma gota de cola instantânea.

**Flecha (catenária):** deixe **3 a 5 mm** de barriga no meio do vão. Esticado demais parece arame; frouxo parece defeito.

---

## 11.5 A DERIVAÇÃO — como cada poste tira sua energia da linha

Em cada poste você tira **dois fios da linha**: o **positivo do seu ramal** e o **retorno 0 V**. Esses dois alimentam o transformador daquele poste.

| Poste | Tira da linha | Alimenta |
|---|---|---|
| **P1** | **R1 (vermelho)** + 0 V (azul) | **Derivação** → 24 V potência (sem conversor) |
| **P2** | **R2 (marrom)** + 0 V (azul) | **T2** → 5,10 V comando |
| **P3** | **R3 (cinza)** + 0 V (azul) | **T3** → 12 V auxiliar **+ 24 V de serviços** |

### Como fazer a derivação (simulando o conector perfurante)

```
   condutor da linha (com capa)
   ═══════════════════╗═══════════════════
                      ║ ← 1. Descascar uma "janela" de 5 mm com estilete,
                      ║      girando a lâmina. NÃO corte o condutor.
                      ║
                      ╠══► 2. Enrolar o fio de derivação (flexível 0,5 mm²)
                      ║      na janela e SOLDAR.
                      ║
                     ▓▓▓ ← 3. Cobrir com termorretrátil 6 mm.
                      ║      Fica igual a um conector perfurante real.
                      ▼
                 [ TRANSFORMADOR ]
```

> ⚠️ **Não corte a linha para derivar.** O condutor tem que continuar íntegro até o próximo poste — é uma linha de distribuição, não três ligações separadas. Se você cortar o R1 no P1, os postes seguintes ficam sem aquele ramal (o que, aliás, não faria diferença para o R1, mas faria para o 0 V, que todos usam).
>
> ⚠️ **O 0 V é derivado nos três postes.** É o retorno comum — todo transformador precisa dele.

### O caminho da saída

| Trecho | Como |
|---|---|
| Linha → transformador | Fio flexível 0,5 mm², **por fora** do poste (como o ramal aéreo real) |
| Transformador → base | Fio flexível, **por dentro** do tubo de alumínio |
| Base → painel | Por baixo da base, até o prensa-cabo próprio daquela tensão |

> ⚠️ **Dentro do tubo passam fios e o tubo é de ALUMÍNIO (condutor).** Use fio **com capa** e, se possível, passe um canudo plástico como luva. **O tubo não faz parte de nenhum circuito.**

---

## 11.6 O TOPO DOS POSTES — 2 transformadores e 1 derivação

### Distribuição

| Poste | Equipamento | Módulo | Entrada | **Saída** | Carga |
|---|---|---|---:|---:|---|
| **P1** | ⭐ **DERIVAÇÃO** — sem conversor | Bornes de emenda + medidor V/A | 24 V | **24 V passante** | 2× Peltier em série, PTC 24 V (via BTS7960) |
| **P2** | **T2** — transformador | **LM2596 com display** | 24 V | **5,10 V** | Arduino, tela ES3C28P, RTC, lógica, placa PI-1 |
| **P3** | **T3** — transformador | **LM2596 com display** | 24 V | **12,0 V** | Coolers, fans internas, iluminação da maquete |

> ⭐ **Por que o P1 não tem transformador — e por que isso é MELHOR para a defesa.**
>
> A carga do ramal R1 (duas pastilhas Peltier em série e um PTC de 24 V) **já opera na tensão da linha**. Não há nada a transformar. E isso reproduz exatamente uma situação real da rede de distribuição:
>
> | Na rede real | Na maquete |
> |---|---|
> | Consumidor residencial/comercial recebe um **transformador de poste** que abaixa 13,8 kV → 220/127 V | **P2 e P3** — transformadores de distribuição |
> | **Consumidor industrial de grande porte** é atendido **na tensão primária** e monta a própria subestação | **P1** — poste de derivação, sem trafo |
>
> Antes o P1 era só "o poste do conversor maior". Agora ele conta uma história que existe na norma e na prática: **quem consome muito entra em tensão mais alta**. É o tipo de detalhe que a banca reconhece.

> 🔧 **O ramal R1 continua no P1, o poste mais próximo da subestação.** Não é acaso: é o ramal de maior corrente (**6,0 A**), e encurtar o trecho de linha reduz a queda de tensão. Na prática real também é assim — a carga pesada fica perto da fonte.

### Corpo dos três equipamentos

**Os três agora têm o mesmo diâmetro**, porque não existe mais o conversor grande do P1:

| | **P1 (derivação)** | **T2 e T3 (transformadores)** |
|---|---|---|
| Corpo | Tubo PVC **Ø 50 mm × 60 mm** | Tubo PVC **Ø 50 mm × 70 mm** |
| Conteúdo | Bornes de emenda + medidor V/A | **LM2596 + dissipador colado no CI** |
| Dissipação | ~0 W | T2 ~1,0 W · **T3 ~1,6 W** |
| Ventilação | 4 furos Ø 3 mm | **8 furos Ø 3 mm — obrigatórios no T3** |
| Instrumento | **Voltímetro + amperímetro** (comprado à parte) | **Display integrado ao próprio LM2596** |
| Altura de montagem | 165 mm (centro) | 165 mm (centro) |

> ⚠️ **O dissipador do T3 não é opcional.** Ele dissipa 1,6 W dentro de um tubo fechado; sem dissipador colado no CI, a elevação de temperatura passa de 85 °C e o LM2596 entra em proteção térmica no meio da apresentação. Cálculo em [Doc 02 §2.8](../camada_0_fundamentos/02_arquitetura_de_energia.md).

```
        VISTA FRONTAL (voltada para a rua)

    P2 / P3 — TRANSFORMADOR          P1 — DERIVAÇÃO
    bucha de alta (entrada 24 V)     entrada 24 V da linha
           ▼   ▼                          ▼   ▼
     ┌────●───●────┐                ┌────●───●────┐
     │             │                │             │
     │  ╔═══════╗  │                │  ┌───────┐  │
     │  ║LM2596 ║  │ ← na vertical  │  │bornes │  │ ← só emenda,
70mm │  ╚═══════╝  │                │  └───────┘  │   sem conversor
     │ ┌─────────┐ │                │ ┌─────────┐ │
     │ │  5.10V  │ │ ← DISPLAY DO   │ │24.0V 6.0A│ │ ← medidor V/A
     │ └─────────┘ │   PRÓPRIO      │ └─────────┘ │   (comprado à parte)
     │  ∘ ∘ ∘ ∘ ∘  │   MÓDULO       │  ∘ ∘ ∘ ∘ ∘  │
     └──●───●──────┘   (janela      └──●───●──────┘
     ◄─── Ø 50 mm ──►   22 × 12 mm)  ◄─── Ø 50 mm ──►
```

### ⭐ A janela de acrílico — o instrumento da apresentação

O LM2596 traz um **display LED vermelho de 3 dígitos soldado na própria placa**. Ele deixa de ser detalhe do módulo e vira o instrumento de demonstração da maquete:

| Vantagem | Na apresentação |
|---|---|
| Tensão de saída **visível em tempo real** | O público **lê** a transformação: 24,0 V na linha, 5,10 V saindo do trafo de poste. Não precisa acreditar no que você diz |
| **Botão IN/OUT** (presente na maioria das versões) | Um toque alterna entre entrada e saída no mesmo display — a demonstração inteira em um gesto |
| Diagnóstico instantâneo | "O conversor está entregando tensão?" se responde de longe, sem multímetro |

**Execução:** recorte a janela de **22 × 12 mm** antes de montar o módulo, cole por dentro uma lâmina de acrílico transparente de 1 mm com cola instantânea em gel (só nas bordas, para não manchar) e posicione a placa com o display encostado na janela. **Janela voltada para a rua; furos de ventilação nas costas do tubo.**

### Montagem

1. Cortar o tubo de PVC no comprimento e **lixar as bordas**.
2. **Recortar a janela** (22 × 12 mm nos três) na face que vai ficar **voltada para a rua**.
3. **Furos de ventilação:** 8 na tampa superior e 8 na inferior nos T2/T3 (4+4 no P1).
4. **T2 e T3:** colar o dissipador no CI LM2596S com fita térmica e fixar o módulo na vertical, com o display encostado na janela.
5. **P1:** fixar os bornes de emenda e o medidor V/A. ⚠️ **O cabo de saída passa pelo shunt do amperímetro** — é o que faz o display mostrar a corrente das Peltier ao vivo.
6. Colar a lâmina de acrílico de 1 mm por trás da janela.
7. **Buchas:** 2 pinos no topo (alta) e 2 na lateral inferior (baixa) — pedaços de palito pintados de marrom.
8. Fixar no poste com **cinta de alumínio 10 mm + 2 parafusos M3**, centro a 165 mm do piso.
9. Pintar de cinza médio (deixar a janela mascarada).
10. Etiquetar: **"P1 — DERIVAÇÃO 24 V"**, **"T2 — 24/5 V"**, **"T3 — 24/12 V"**.

### Ligação do medidor do P1

É o **único instrumento comprado à parte** — nos postes P2 e P3 o display já vem no conversor. Use módulo de **3 fios** (alimentação separada da medição):

```
   +24 V (da derivação) ──► VCC do medidor (fio vermelho)
   0 V                  ──► GND do medidor (fio preto)
   Saída para o painel  ──► ATRAVÉS do shunt (mede tensão E corrente)
```

| Poste | Instrumento | Mostra |
|---|---|---|
| **P1** | Voltímetro **+ amperímetro** com shunt | **24,0 V e a corrente das Peltier ao vivo** |
| **T2** | Display integrado ao LM2596 | 5,10 V |
| **T3** | Display integrado ao LM2596 | 12,0 V |

> ⚠️ **Ajuste os dois conversores na bancada ANTES de fechar dentro do tubo, com a saída NO AR.** O LM2596 sai de fábrica com o potenciômetro em posição arbitrária e pode entregar 20 V direto no Arduino. Depois de montado no poste, mexer no potenciômetro é um pesadelo. Procedimento completo em [Doc 02 §2.5](../camada_0_fundamentos/02_arquitetura_de_energia.md). **Marque a posição final do trimpot com um risco de esmalte** — vibração desregula trimpot.

---

## 11.7 POSTES DE ILUMINAÇÃO PÚBLICA (na rua)

**São outra coisa.** Não confunda com os postes de distribuição.

| Item | Poste de distribuição | **Poste de iluminação pública** |
|---|---|---|
| Diâmetro | Ø 8 mm | **Ø 5 mm** |
| Altura | 300 mm (15 m) | **180 mm (9 m)** |
| Posição | Calçada do fundo (Y = 265) | **Calçada da frente (Y = 75)** |
| Topo | Cruzeta com 3 isoladores | **Braço curvo com luminária** |
| Quantidade | 3 | 3 — em X = 150, 330 e 510 |
| Alimentação | — | LED 3 mm branco quente + resistor 2,2 kΩ, do ramal R3 |

```
Cálculo do resistor:  R = (24 − 3,1) / 0,0095 ≈ 2200 Ω
Potência:             P = 2200 × 0,0095² ≈ 0,2 W  →  resistor de 1/4 W serve
```

O braço curvo se faz com **arame de 1,5 mm** dobrado em curva suave, 25 mm de avanço sobre a pista, com o LED na ponta dentro de uma "luminária" feita com meia conta.

> 💡 Apresentar a maquete com as luzes da rua acesas e a sala escurecida muda completamente a percepção do trabalho. Vale os R$ 5 de LEDs.

---

## 11.8 ✅ Checklist de aceitação

### Subestação
- [ ] Caixa montada, **opaca**, com tampa de 4 parafusos e etiqueta de perigo
- [ ] Q0, chave rotativa, fonte e 3 porta-fusíveis instalados e cabeados
- [ ] Grade de entrada + cooler 60 mm **de 24 V** instalados
- [ ] Barra de terra ligada à carcaça da fonte
- [ ] **Teste:** plugue na tomada, chave em "1" → medir **24,0 V ± 0,5 V** nos bornes
- [ ] **Teste:** continuidade entre o pino terra do plugue e a carcaça da fonte (< 1 Ω)
- [ ] Pátio com brita, cerca, portão e placas

### Postes e linha
- [ ] 3 postes cortados, furados, com cruzeta e isoladores, pintados e fixados
- [ ] Postes na vertical (esquadro nos dois eixos)
- [ ] **4 condutores COM CAPA** instalados, nas cores corretas
- [ ] **Retorno azul 40 mm abaixo da cruzeta**
- [ ] Amarrações feitas, flecha de 3–5 mm em cada vão
- [ ] **Nenhum condutor nu na linha** (só na malha de terra da subestação)
- [ ] **Teste da linha:** 24,0 V medidos na ponta de cada ramal, no poste P3

### Topo dos postes
- [ ] **P1 = caixa de DERIVAÇÃO** (Ø 50, bornes de emenda + medidor V/A, **sem conversor**)
- [ ] **T2 no P2** e **T3 no P3** — LM2596 com display, tubos Ø 50
- [ ] Os **dois conversores ajustados na bancada, com a saída no ar**, e trimpots marcados com esmalte
- [ ] **Dissipador colado no CI dos dois LM2596** — obrigatório, principalmente no T3
- [ ] Derivações soldadas e isoladas com termorretrátil, **sem cortar a linha**
- [ ] Saídas descendo por **dentro** do tubo, com fio encapado
- [ ] **Janelas de acrílico** nos 3 tubos, displays legíveis a 2 m, voltadas para a rua
- [ ] Cabo de saída do P1 passando **através do shunt** do amperímetro
- [ ] **Teste de carga:** T3 com carga resistiva por 30 min; corpo do LM2596 **abaixo de 80 °C**
- [ ] Cada saída chegando ao painel pelo **seu próprio prensa-cabo**
- [ ] Etiquetas coladas: **"P1 — DERIVAÇÃO 24 V"** · **"T2 — 24/5 V"** · **"T3 — 24/12 V"**

### Rua
- [ ] 3 postes de iluminação pública (Ø 5 mm, 180 mm) na calçada da frente
- [ ] LEDs acendendo com resistor de 2,2 kΩ
- [ ] Não há como confundir poste de iluminação com poste de distribuição

---

📄 **Anterior:** [Doc 10 — Base e Chão de Fábrica](10_base_e_chao_de_fabrica.md) · **Próximo:** [Doc 12 — Câmara Térmica](12_camara_termica.md)
