# CAMADA 0 · Doc 02 — Arquitetura de Energia (127 V AC → 24 V → 12 V / 5 V / 3,3 V)

> ⛔ **REVISÃO PROVISÓRIA — NÃO MONTAR NEM COMPRAR OS ITENS DE POTÊNCIA.** A proposta
> atual substitui o PTC de 24 V/80 W por um PTC de 12 V/50 W, T2 por 24→5 V/5 A
> e T3 por 24→12 V/20 A. Os dados e procedimentos legados abaixo não descrevem essa
> topologia. Use a nova especificação em [§2.12](#212-proposta-provisoria-t2-t3-e-ptc-12-v).
> A faixa real de entrada de T2, o modelo exato dos conversores, F3/cabos e o corte
> CC independente do PTC ainda não foram validados.
>
> **Não use as tabelas, cálculos, desenhos ou procedimentos históricos abaixo para
> fabricar, comprar ou energizar.** A proposta de §2.12 não é uma aprovação elétrica:
> aguarde fichas técnicas, dimensionamento e validação independente do corte/proteções.

> Este arquivo preserva cálculos e decisões de uma arquitetura anterior para rastreabilidade.
> Ele não substitui os documentos atuais de painel, proteções e dimensionamento, nem autoriza
> a montagem da proposta provisória.

> 📜 **Histórico — "Potência em 24 V" (antigo Plano B), superado pela revisão provisória §2.12.** A tabela registra a arquitetura anterior; não é especificação vigente:
>
> | Mudança | Consequência |
> |---|---|
> | **2× Peltier em série** e **PTC de 24 V** ligam **direto no barramento de 24 V** | A potência térmica não passa por conversor nenhum |
> | **T1 (XL4016 de 8 A) foi ELIMINADO** | Um módulo a menos, ~10 W a menos de calor, um ponto de falha a menos |
> | **P1 vira poste de DERIVAÇÃO** (bornes + medidor), não mais de transformação | Ganha uma analogia nova: consumidor industrial atendido em tensão primária |
> | **T2 e T3 = módulos LM2596 com display** | Tensão de saída **visível ao público** e proteções (térmica + curto) **nativas no chip** |
> | **Crowbar de Zener + fusíveis de saída ELIMINADOS** | As proteções internas do LM2596 assumem o papel — menos componentes soltos, menos solda, menos coisa para dar errado |
>
> O histórico da decisão (o que era o "Plano A" e por que foi abandonado) está em [§2.10](#210-o-que-mudou-em-relação-ao-plano-a--histórico-da-decisão).

---

## 🟢 Em palavras simples — a energia é como água encanada

Este documento inteiro fica fácil se você aceitar uma comparação: **eletricidade se comporta como água em canos.**

| Na água | Na eletricidade | O que significa |
|---|---|---|
| **Pressão** | **Tensão** (volt) | O quanto "empurra" |
| **Vazão** | **Corrente** (ampère) | O quanto "passa" |
| **Diâmetro do cano** | **Bitola do fio** (mm²) | O quanto cabe passar sem forçar |
| Cano fino com muita vazão esquenta e perde pressão | Fio fino com muita corrente esquenta e perde tensão | Por isso existe cálculo de bitola |

Agora a pergunta central do projeto:

> **Como levar bastante energia de um ponto ao outro sem usar cabo grosso?**

**Resposta: aumentando a pressão.** Se você dobra a pressão, entrega a mesma quantidade de água com **metade da vazão** — e aí um cano fino resolve.

Na eletricidade é idêntico. O nosso sistema precisa entregar **171 W**. Podia fazer isso de dois jeitos:

| | Com 12 V | Com **24 V** |
|---|---:|---:|
| Corrente necessária | 14 A | **7 A** |
| Fio necessário | grosso | **fino** |
| Perda de tensão no caminho | 3,4 % ❌ | **0,86 %** ✅ |

**É exatamente por isso que a rede elétrica da rua transmite em alta tensão** e só abaixa perto da sua casa, no transformador do poste. Nós fazemos a mesma coisa em miniatura — e essa é a lição de eletrotécnica que a maquete demonstra.

### Por que 24 V e não 127 V, então?

Porque a partir de certo ponto a pressão passa a ser perigosa. **Acima de 60 V em corrente contínua, a eletricidade atravessa a pele e pode matar.** Abaixo disso, ela é considerada segura e recebe o nome de **SELV** — *Extra Baixa Tensão de Segurança*.

Os 24 V são o meio-termo que a indústria adotou: **alto o bastante para ser eficiente, baixo o bastante para ninguém tomar choque.**

> ⚡ **A regra de ouro do projeto:** os 127 V da tomada existem **só dentro da casa de comando — fechada e aparafusada**, dentro do pátio da subestação. Tudo que o público toca, vê e manipula durante a apresentação está em 24 V ou menos.

### O caminho da energia, em 4 passos

```
1. TOMADA          127 V da parede — perigoso, fica na casa de comando
        ▼
2. FONTE           transforma em 24 V — daqui pra frente é seguro
        ▼
3. POSTES          leva os 24 V pela maquete, em 3 caminhos separados
        ▼
4. CONSUMO         cada equipamento recebe a tensão de que precisa
```

E os "3 caminhos separados" existem por um motivo prático: **se der problema em um, os outros continuam funcionando.** Isso se chama **seletividade**, e é o que impede que um curto na ventilação desligue o computador de bordo.

### Dicionário rápido deste documento

| Termo | O que quer dizer, sem enrolação |
|---|---|
| **Barramento** | Um "cano principal" de energia, do qual vários equipamentos se servem |
| **Ramal** | Uma derivação do barramento, com proteção própria |
| **Conversor step-down** | Aparelho que **abaixa** a tensão (de 24 V para 5 V, por exemplo) |
| **SELV** | Faixa de tensão considerada segura ao toque (até 60 V em CC) |
| **Seletividade** | Quando dá problema, só a proteção mais perto dele desliga — o resto continua |
| **Queda de tensão** | A "pressão" que se perde no caminho por causa da resistência do fio |
| **Rendimento (η)** | Quanto da energia que entra realmente sai útil. O resto vira calor |
| **Inrush** | O "tranco" de corrente no instante em que se liga um equipamento |
| **Derivação** | Puxar um fio de uma linha sem cortá-la |

---

## 2.1 As três perguntas que originaram esta arquitetura

### ❌ "A fonte ATX consegue entregar 24 V?"

**Não.** Uma fonte ATX entrega apenas:

| Trilho | Tensão | Corrente típica (500 W) |
|---|---|---|
| Amarelo | +12 V | 18–25 A |
| Vermelho | +5 V | 15–20 A |
| Laranja | +3,3 V | 15–20 A |
| Azul | −12 V | 0,3–0,8 A |
| Roxo | +5 VSB | 2 A |

**Não existe trilho de 24 V.** E não dá para somar dois trilhos de 12 V em série, porque **todos compartilham o mesmo GND (preto)** — ligar o +12 V de um "canal" no GND de outro é literalmente um curto-circuito na própria fonte.

> O único par que dá 24 V de diferença é **+12 V contra −12 V**, mas o trilho −12 V entrega no máximo ~0,5 A. Serve para nada além de um LED.

**Conclusão:** para ter um barramento de 24 V, é obrigatório trocar a fonte.

---

### ✅ "12 V ou 24 V é o padrão industrial?"

**24 Vcc**, sem discussão. Em qualquer painel industrial real:

| Elemento | Tensão padrão |
|---|---|
| Alimentação de CLP (Siemens S7, Delta, WEG) | 24 Vcc |
| Sensores indutivos, capacitivos, fotoelétricos | 24 Vcc (PNP/NPN) |
| Bobina de relés de interface e mini contatores | 24 Vcc |
| Sinalização de painel (colunas, LEDs DIN) | 24 Vcc |
| Entradas/saídas digitais de CLP | 24 Vcc |
| Fontes chaveadas de painel (Phoenix, WEG, Mean Well) | saída 24 Vcc |

**Por que 24 V e não 12 V?** Para a **mesma potência**, 24 V puxa **metade da corrente** → cabo mais fino, menos queda de tensão, menos perda no cobre (a perda cai com o quadrado da corrente: I²R). E ainda fica bem abaixo do limite de **Extra Baixa Tensão de Segurança (SELV: ≤ 60 Vcc)**, ou seja, não oferece risco de choque.

> 📌 **É exatamente o mesmo motivo pelo qual a rede elétrica transmite em alta tensão e reduz perto do consumidor.** A sua maquete vai demonstrar esse princípio na prática — esse é o coração didático do projeto.

---

### ✅ "Dá pra ter 3 'fases' de 24 V, uma por regulador?"

Em corrente contínua **não existe fase** (fase é um conceito de corrente alternada — defasagem de 120° entre senoides). Mas a sua intuição está **tecnicamente correta** traduzida para CC:

| O que você imaginou | Nome correto em CC | Está certo? |
|---|---|---|
| 3 linhas de fase de 24 V | **3 ramais (circuitos) independentes** de +24 V | ✅ Sim |
| Neutro comum | **Retorno comum (0 V)** | ✅ Sim |
| Cada regulador puxa de 1 fase | Cada conversor **ou carga direta** é alimentado por 1 ramal com **fusível próprio** | ✅ Sim, e é boa prática |

> 📌 **Nota da arquitetura adotada:** dos 3 ramais, apenas **R2 e R3 terminam em conversor**. O **R1 entrega os 24 V direto à carga** (Peltier e PTC, via BTS7960) — é o ramal de maior corrente e o único sem transformação. Isso não é uma exceção improvisada: é exatamente o desenho de uma rede real, onde só existe transformador onde há necessidade de mudar de tensão.

Na maquete, 3 condutores de +24 V na cruzeta + 1 condutor de 0 V embaixo fica **visualmente idêntico a uma linha de distribuição trifásica com neutro**. E eletricamente é a prática industrial correta: **seletividade** — um curto no ramal da ventilação abre só o fusível dele, sem derrubar o comando.

> ⚠️ **Diferença que você precisa saber para a defesa:** em uma linha trifásica AC equilibrada, o neutro conduz corrente ~zero (as três fases se cancelam). Em CC **isso não acontece** — o retorno comum conduz a **soma** de todas as correntes dos ramais. Por isso o condutor de 0 V é **mais grosso** que os de +24 V.

---

## 2.2 Arquitetura adotada — visão em camadas

```
┌─────────────────────────────────────────────────────────────────────────┐
│ NÍVEL 1 — GERAÇÃO / ENTRADA                    (dentro da SUBESTAÇÃO)   │
│                                                                          │
│  Tomada 127 V AC ─────────► [Disjuntor 2P 6 A curva C · Q0]             │
│                                    │                                     │
│                                    ▼                                     │
│                     [FONTE CHAVEADA 24 Vcc / 10 A / 240 W]              │
│                        (analogia: transformador da subestação)          │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │ 24 Vcc  ── FIM DO 127 V ──
                                  │ ⚠ daqui pra frente TUDO é SELV (≤60 V)
┌─────────────────────────────────▼───────────────────────────────────────┐
│ NÍVEL 2 — TRANSMISSÃO                              (POSTES da maquete)  │
│                                                                          │
│  [F1 10A]─► R1 +24 V ──┐  vermelho 1,00 mm²  (ramal de POTÊNCIA)        │
│  [F2 2A] ─► R2 +24 V ──┼── marrom  0,50 mm²  } 3 condutores COBERTOS    │
│  [F3 2A] ─► R3 +24 V ──┘  cinza    0,50 mm²    na CRUZETA (as "fases")  │
│             0 V   ─────── azul claro 1,50 mm², 40 mm abaixo ("neutro")  │
└──────┬──────────────┬──────────────┬────────────────────────────────────┘
       │              │              │
┌──────▼──────┐┌──────▼──────┐┌──────▼──────┐
│ NÍVEL 3 — DERIVAÇÃO E TRANSFORMAÇÃO                (topo dos POSTES)    │
│                                                                          │
│ P1 · DERIVAÇÃO││ T2 · POSTE P2││ T3 · POSTE P3                           │
│ SEM CONVERSOR ││ LM2596+DISP. ││ LM2596+DISPLAY                          │
│ 24 V passante ││ 24 V → 5,10 V││ 24 V → 12,0 V                           │
│ bornes + 📟V/A││ (comando) 📟 ││ (auxiliares) 📟                         │
└──────┬────────┘└──────┬───────┘└──────┬───────┘
       │ 24 V           │ 5,10 V        │ 12,0 V
┌──────▼────────────────▼───────────────▼─────────────────────────────────┐
│ NÍVEL 4 — CONSUMO                                    (PAINEL + CÂMARA)  │
│                                                                          │
│ 24 V POT ─[KM1]─► BTS #1 ─► 2× PELTIER EM SÉRIE   (6,0 A · 144 W)       │
│                   BTS #2 ─► PTC CERÂMICO 24 V     (3,3 A · 80 W)        │
│                             ⤷ intertravados por software: nunca juntos  │
│                                                                          │
│  5 V ──► Arduino · tela ES3C28P · RTC · lógica dos BTS · LEDs da rua    │
│                                                                          │
│ 12 V AUX ──► 2× cooler externo das Peltier · 4 fans internas            │
│              cooler dos BTS7960                                          │
│                                                                          │
│ 24 V SERV ─► DNLCB30 ─► ESP32 3,3 V · bobina do KM1 · N4AIC24           │
│        (serviços permanentes: sobrevivem ao cogumelo de emergência)     │
└──────────────────────────────────────────────────────────────────────────┘
```

**Leitura do diagrama em uma frase:** a energia só é transformada onde a tensão precisa mudar. O ramal pesado (R1) atravessa a maquete inteira em 24 V e chega **na tensão de trabalho da carga**; os ramais leves (R2 e R3) passam por um LM2596 no topo do poste, que é o "transformador de distribuição" da analogia.

### Os dois barramentos de 24 V no painel — não confundir

| Barramento | Origem | Passa pelo KM1? | Alimenta |
|---|---|---|---|
| **BD-POT** — 24 V de **potência** | Ramal R1 (P1) | ✅ **Sim** — cai com a emergência | Entrada VCC dos 2 BTS7960 |
| **BD-24V** — 24 V de **serviços** | Ramal R3 | ❌ Não — permanente | DNLCB30/ESP32, bobina do KM1, **N4AIC24** (o instrumento) |

> Essa separação é o que permite a emergência **derrubar a potência sem derrubar a supervisão**: com o botão socado, os atuadores morrem em hardware, mas o ESP32 continua ligado e publica o evento por MQTT. É exatamente o comportamento de um painel industrial de verdade.

---

## 2.3 Analogia com o Sistema Elétrico de Potência real

Esta é a tabela para colocar no relatório e usar na defesa. **É o que transforma a maquete em um projeto de eletrotécnica, e não em um "arduino numa caixa".**

| Sistema elétrico real | Na maquete | Elemento físico |
|---|---|---|
| Usina geradora | Concessionária / tomada | Cabo de força 127 V AC |
| Subestação elevadora/abaixadora | **Subestação da maquete** | Caixa fechada com disjuntor + fonte 24 V |
| Transformador de força (138 kV → 13,8 kV) | Fonte chaveada 127 V AC → 24 Vcc | Fonte S-240-24 |
| **Rede compacta protegida** — distribuição primária (13,8 kV) | **Barramento de 24 V nos postes** | 3 condutores **encapados** (rede compacta protegida) + retorno azul |
| Estrutura de sustentação | **Postes com cruzeta e isoladores** | Tubo de alumínio Ø 8 mm |
| Chave fusível de proteção do ramal | **Porta-fusível DIN de cada ramal** | F1 / F2 / F3 |
| Transformador de distribuição de poste (13,8 kV → 220/127 V) | **T2 e T3** — nos postes P2 e P3, dentro do "trafo" cilíndrico | Módulo **LM2596 com display** |
| **Consumidor industrial atendido em tensão primária** — entra com a tensão da linha e não usa trafo da concessionária | **P1 — poste de DERIVAÇÃO, sem transformador.** A carga térmica já opera em 24 V | Caixa de derivação com bornes + medidor V/A |
| Medidor de faturamento / display de leitura no poste | **Display vermelho do LM2596 visível pela janela de acrílico** | Janela ~20 × 12 mm no tubo de PVC |
| Ramal de entrada subterrâneo | Saída de cada poste desce **por dentro do tubo** e segue por baixo da base | Fio flexível |
| Ramal de entrada do consumidor | Cabos 12 V / 5 V que entram no painel | Cabo flexível |
| Quadro/CCM do consumidor | **Painel de comando** | Painel 400×500 mm |
| Carga da instalação (motores, processo) | **Câmara frigorífica** (Peltier, PTC, fans) | A câmara de acrílico |

---

## 2.4 Levantamento de cargas (dimensionamento)

### Ramal R1 — Potência térmica (**24 V direto, sem conversor**)

| Carga | V | I | P | Observação |
|---|---:|---:|---:|---|
| **2× Peltier TEC1-12706 em SÉRIE** | 24 | 6,0 A | **144 W** | Cada pastilha vê 12 V e as duas compartilham a **mesma** corrente de 6 A. Máximo, com ΔT baixo |
| **PTC cerâmico 24 V / 80 W** | 24 | 3,3 A | 80 W | **nunca junto com as Peltier** (intertravamento por software) |
| **Pior caso do ramal** | **24** | **6,0 A** | **144 W** | modo FRIO em 100 % de duty |

> ⚠️ **SÉRIE, não paralelo.** Duas TEC1-12706 em série formam uma carga de 24 V nominais: a corrente é a mesma de uma só pastilha (6 A), e a potência dobra porque a tensão dobrou. **Em paralelo cada pastilha receberia 24 V** — o dobro do nominal — e as duas queimam em segundos. Marque a polaridade e confira a ligação com o multímetro (deve medir ~2× a resistência de uma pastilha isolada) **antes** de energizar.

> 📌 **As 4 fans internas saíram deste ramal.** Elas continuam sendo de 12 V, então migraram para o **R3**, que agora é o único ramal de 12 V do projeto. O R1 ficou puro: só carga de 24 V, só potência térmica.

### Ramal R2 — Comando / lógica (T2 · LM2596: 24 V → 5,10 V)

| Carga | V | I | P |
|---|---:|---:|---:|
| Arduino Mega 2560 + shield | 5 | 0,20 A | 1,0 W |
| Tela **ES3C28P** (ESP32-S3 + backlight) | 5 | **0,14 A** típico · 0,25 A com alto-falante | 0,70 W · 1,25 W no pico |
| Módulo SD + RTC DS3231 | 5 | 0,06 A | 0,3 W |
| Lógica (VCC) dos 2 BTS7960 | 5 | 0,02 A | 0,1 W |
| **4 LEDs da iluminação da maquete** (branco 3 mm, 220 Ω) | 5 | 0,04 A | 0,2 W |
| ⭐ **KA1 + KA2 + KA3 — módulos de relé** | 5 | **0,195 A** (0,065 cada, só com o relé atracado) | 1,0 W |
| ⭐ **H1…H4 — 4 sinaleiros de 5 V** | 5 | **0,08 A** (0,020 cada, só o aceso) | 0,4 W |
| **Total do ramal** | **5** | **0,695 A** no ensaio · **0,735 A** no pior caso | **3,5 W** |

> 🔄 **Os LEDs sinalizadores voltaram para cá — e essa é a versão final.** Eles já moraram em três barramentos: eram **5 V** no projeto original, foram para **24 V** com um ULN2803 na fase do Plano B, e hoje são **5 V de novo**, cada um saindo direto de um pino do Mega. A razão é simples: **um LED de 20 mA não precisa de driver nenhum**, e o ULN2803 era um CI inteiro para acender quatro LEDs. Quem paga a conta agora é o ramal de 5 V — 80 mA com os quatro acesos —, e o limite real passou a ser o **pino do Mega** (20 mA por pino, dentro do absoluto de 40 mA).
>
> **A iluminação da maquete também migrou** — eram 12 V, hoje são **5 V** (LED branco tem Vf ≈ 3,1 V e trabalha melhor a partir de 5 V que de 12 V, com resistor menor e menos calor dissipado à toa).
>
> Resultado: o R2 fechou em **0,695 A** no ensaio, **0,735 A** no pior caso — **46 % a 49 % da corrente contínua segura do LM2596** (1,5 A com dissipador). Ainda sobra mais da metade do conversor.
>
> 🔧 **E já subiu de propósito uma vez:** o **KA3** — terceiro módulo de relé — entrou no lugar do módulo MOSFET que ligava as 5 ventoinhas internas, e um relé custa **65 mA de bobina** onde o MOSFET custava ~10 mA de LED. **É o preço da troca, e ele cabia:** em troca vieram R$ 43,51 de economia, o chaveamento do lado **positivo** e uma família de componente a menos no painel ([Doc 31 §31.16](../camada_3_eletrica/31_comando_e_protecoes.md)).

> ### ⚠️ O ramal mais apertado do painel não é o de potência — é este
>
> O F1 conduz 6,0 A e tem 10 A de fusível: sobra 67 %. O T3 conduz 1,325 A de 1,5 A. **O T2 é o único que chega perto de um limite declarado:** 0,695 A contra os **0,70 A** que o [§2.7](#27-bitolas-e-queda-de-tensão) atribui ao cabo de 0,50 mm² da saída do T2 — **99,3 %**.
>
> 📌 **E o limite é declarado, não físico.** 0,50 mm² de cobre conduz muito mais que 0,7 A; o número do §2.7 foi escrito quando o ramal puxava 0,57 A e virou restrição por hábito, não por cálculo. O que **não** se pode é descobrir isso com o painel fechado.
>
> **Providência obrigatória antes da montagem final** — três medidas, dez minutos:
> 1. Corrente real no fio de 5 V com tudo ligado, incluindo os quatro sinaleiros acesos e a IHM no pico do alto-falante;
> 2. Temperatura do dissipador do LM2596 depois de 20 min no pior caso;
> 3. Se a corrente passar de **0,9 A** ou o dissipador passar de **70 °C**, trocar o cabo do T2 por **0,75 mm²** e atualizar o §2.7 — é um fio, não um redesenho.
>
> ✅ **O que já está garantido:** o `npm run valida:energia` reprova sozinho se alguém acrescentar carga a este ramal sem revisar o cabo. A verificação deixou de depender de alguém lembrar.

### Ramal R3 — Serviços auxiliares (T3 · LM2596: 24 V → 12,0 V) + cargas diretas em 24 V

| Carga | V | I | P | Observação |
|---|---:|---:|---:|---|
| Cooler externo da Peltier **#1** (80 mm, 3 fios) | 12 | 0,25 A | 3,0 W | |
| Cooler externo da Peltier **#2** (80 mm, 3 fios) | 12 | 0,25 A | 3,0 W | **novo** — cada pastilha tem o seu dissipador |
| ⭐ **5 ventoinhas INTERNAS** (2 frias + 2 dos dutos + a do PTC) | 12 | **0,63 A** | 7,5 W | 🔧 **eram "2 ativas por modo"** — hoje as cinco dividem o contato do **KA3** e ligam JUNTAS |
| Cooler 40 mm dos BTS7960 | 12 | 0,12 A | 1,5 W | sem comando |
| ⭐ **As 8 posições de ensaio** (LED 5 mm + 1 kΩ) | 12 | **0,08 A** (0,010 cada) | 1,0 W | 🔧 **estavam fora do orçamento** — são a carga que o projeto mede |
| ~~Cooler 40 mm do próprio T1~~ | — | — | — | **eliminado junto com o T1** |
| ~~Iluminação da maquete~~ | — | — | — | **migrou para o 5 V (R2)** |
| **Subtotal em 12 V** | **12** | 🔧 **1,325 A** | **15,9 W** | pior caso medido pelo simulador |
| DNLCB30 + ESP32 (**direto em 24 V**) | 24 | 0,100 A | 2,4 W | |
| Bobina do relé **KM1** (**direto em 24 V**) | 24 | 0,037 A | 0,9 W | só com o selo fechado |
| ⭐ **N4AIC24 — módulo de aquisição** (**direto em 24 V**) | 24 | **0,030 A** | 0,7 W | 🔧 **novo na conta** — e ele nunca desliga |
| ~~4 sinaleiros LED 22 mm de 24 V~~ | ~~24~~ | — | — | 🗑️ **migraram para o BD-5V**: viraram de 5 V e são acesos direto pelo pino |
| **Subtotal direto em 24 V** | **24** | 🔧 **0,167 A** | **4,0 W** | |

> ### 🔧 Correção — este ramal estava subestimado, e quem apontou foi o simulador
>
> A linha anterior somava *"2 fans internas ativas · 0,25 A"*, o que fazia sentido quando elas eram comutadas **por modo** — só as duas frias no resfriamento, só as do duto no aquecimento. **Isso deixou de ser verdade** quando as cinco (as 2 frias, as 2 dos dutos e a do PTC) passaram a dividir um comando só — hoje o contato do **KA3** — e a ligar juntas, com uma condição só: ensaio rodando.
>
> **Ninguém releu esta tabela depois daquela simplificação.** O `npm run simula` releu: ele mede o consumo do estado real a cada passo e guarda o pico, então o pior caso deixou de ser o que alguém imaginou e passou a ser o maior valor que de fato aconteceu.
>
> | | Antes (estimado) | **Medido** |
> |---|---|---|
> | Subtotal em 12 V | 0,87 A | **1,325 A** |
> | % da corrente segura do LM2596 | 58 % | ⚠️ **88 %** |
> | Cabo T3 → painel (0,75 mm²) | declarava 1,0 A | **1,325 A** — a bitola aguenta, o número é que estava velho |
>
> **A segunda correção foi a pior das duas, e ela veio de fora.** O simulador já havia acusado as cinco ventoinhas juntas; faltava ainda a carga que o projeto **existe para medir** — as **8 posições de ensaio**, 10 mA cada. Elas ficavam de fora de todo orçamento de consumo porque "são só LEDs". São 80 mA, o que parece nada — e é, no total —, mas um orçamento que esquece a carga principal é o tipo de erro que só aparece na auditoria. Com elas, o subtotal de 12 V vai a **1,325 A**, e o T3 passa a operar a **88 % da corrente segura**.
>
> ⚠️ **O dissipador colado no LM2596 do T3 deixou de ser recomendação e virou obrigação.** A 88 % da corrente segura, sem dissipador o módulo passa dos 100 °C e entra em proteção térmica no meio da apresentação. Com o dissipador, o CI trabalha na faixa para a qual foi especificado — mas é o item do painel com **menos folga térmica** e deve ser o primeiro a ser medido no comissionamento.
>
> 💡 **Se quiser folga de volta, há uma saída barata:** as duas ventoinhas dos dutos não precisam girar durante o resfriamento com a mesma vazão do aquecimento. Um **quarto módulo de relé** (KA6, R$ 3,40, e a caixa de 6M ainda tem lugar) separaria os grupos e devolveria ~0,25 A. **Não fiz** — é complexidade nova para resolver um problema que ainda cabe na folga.

> 📌 **Os sinaleiros ficam no BD-5V permanente, nunca no BD-POT comutado.** É de propósito: **o sinaleiro vermelho de FALHA precisa continuar aceso com a emergência acionada.** Se estivesse no barramento comutado, apertar o cogumelo apagaria justamente a luz que informa que há um problema.

> ### 📌 Por que o N4AIC24 fica no 24 V **permanente**, e não no 12 V que ele mede
>
> O módulo tem dois bornes de tensão, e um deles (`V2`) **mede o barramento de 12 V**. A tentação é alimentá-lo do próprio 12 V — a folga do T3 melhoraria e a fiação ficaria mais curta. **Não.**
>
> Um instrumento que se alimenta do barramento que vigia perde a capacidade de distinguir **"a posição queimou"** de **"a fonte de 12 V caiu"**: nos dois casos ele para de responder, e o operador vê a mesma tela. Alimentado pelo `BD-24V`, ele continua medindo 0 V em `V2` e **denunciando** o barramento morto — que é exatamente o diagnóstico cruzado que o painel existe para ensinar.
>
> **E não custa disponibilidade:** o `BD-24V` é o barramento que **sobrevive à emergência**. O caminho é fonte → F-R → `BD-24V` → pino 11 do KM1 → pino 14 → `BD-POT`. O KM1 comuta **depois** do `BD-24V`, então apertar o cogumelo derruba a potência e **mantém** a supervisão.
>
> 💡 **Se algum dia a folga do 12 V apertar de verdade**, a saída é um fio: mover o `V+` do módulo para `BD-12V · O3`. Fica documentado aqui, e **não** recomendado — o custo é perder o diagnóstico cruzado.

> 💡 **Alívio opcional (se quiser folga extra no T3):** troque os 2 coolers externos de 80 mm por modelos de **24 V** e ligue-os direto no barramento. O T3 cai para **0,825 A** — de 88 % para 55 % da corrente segura. Custa a mesma coisa; só é preciso conferir que o modelo de 24 V também tenha os **3 fios** (sinal de RPM), que é obrigatório para a proteção da Peltier.

### Corrente refletida no barramento de 24 V

Para os ramais com conversor, `I₂₄ = P_saída / (η × 24 V)`. Para o **R1 não há conversão** — a corrente da carga *é* a corrente do barramento:

| Ramal | P saída | η típico | P entrada | **I @ 24 V** | Fusível |
|---|---:|---:|---:|---:|---:|
| **R1 — potência (24 V direto)** | 144,0 W | **1,00** ⭐ | 144,0 W | **6,00 A** | **10 A** |
| R2 — comando (T2 · LM2596) | 3,5 W | 0,78 | 4,5 W | **0,19 A** | **2 A** |
| R3 — auxiliares (T3 · LM2596 + 24 V direto) | 15,9 W + 4,0 W | 0,88 | 22,1 W | **0,92 A** | **2 A** |
| **TOTAL** | | | **170,6 W** | **7,11 A** | |

> ### 📌 De onde vêm estes números — e por que não são mais somados à mão
>
> **Eles saem de [`src/sim/energia.js`](../../painel_interativo/src/sim/energia.js)**, que calcula o consumo do estado real do painel a cada passo e guarda o **maior valor que de fato aconteceu**. O `npm run valida:energia` compara esse pior caso contra os limites de cada ramal e **reprova sozinho** se alguém acrescentar carga sem revisar a fiação.
>
> A soma à mão errou duas vezes, e as duas vezes para baixo: primeiro esqueceu que as cinco ventoinhas internas passaram a ligar juntas; depois esqueceu **as 8 posições de ensaio** — a carga que o projeto existe para medir — e o **próprio N4AIC24**, que nunca desliga. Somar carga de memória é o que produz planilha de 162 W num painel que pede 171 W.
>
> | | Soma à mão (estimativa antiga) | **Modelo (vigente)** | Δ |
> |---|---:|---:|---:|
> | R1 — potência | 144,0 W | 144,0 W | — |
> | R2 — 5 V | 3,7 W | 4,5 W | +0,8 W (4 sinaleiros) |
> | R3 — 12 V | 18,6 W | 18,1 W | −0,5 W |
> | R3 — 24 V direto | 6,7 W | 4,0 W | −2,7 W (a linha antiga somava 0,28 A sem que as parcelas fechassem) |
> | N4AIC24 | — | 0,7 W | +0,7 W |
> | 8 posições | — | 1,1 W | +1,1 W |
> | **TOTAL** | **166 W / 6,9 A** | **170,6 W / 7,11 A** | **+4,3 W** |
>
> ⚠️ **A diferença de 4,3 W não é ruído: é o custo de ter esquecido a carga principal.** E o efeito não é no total — 4 W em 240 W não muda a escolha da fonte —, é na **folga de cada ramal**, onde 80 mA sobre 1,25 A valem 6 pontos percentuais.

> 📌 **A troca dos LEDs mexeu pouco no total e muito na distribuição.** Os sinaleiros andaram de barramento duas vezes (5 V → 24 V → **5 V**) e a iluminação da maquete desceu de 12 V para **5 V**. O consumo do conjunto quase não mudou; o que mudou é que **cada carga passou a estar no barramento certo para a função que cumpre** — e o 24 V permanente ficou com o que de fato precisa sobreviver à emergência.

> ⭐ **O `η = 1,00` do R1 é o argumento central do Plano B.** No arranjo anterior, os 75 W térmicos atravessavam o XL4016 e **10 W viravam calor** dentro do poste P1. Agora a potência térmica vai da fonte à carga **sem nenhum estágio de conversão no meio** — o único caminho de energia do projeto com rendimento 100 % de barramento a carga.

> 📌 **F1 subiu de 6 A para 10 A.** O ramal RM1 passou a conduzir 6,0 A contínuos; um fusível de 6 A abriria em operação normal. Fusível mini automotivo de **10 A** (≈ 1,7× a corrente nominal) é a escolha correta — e é ele, sozinho, que protege todo o caminho de potência, já que os fusíveis de saída (F4/F5) deixaram de existir.

### Dimensionamento da fonte principal

| Critério | Valor |
|---|---|
| Consumo calculado (pior caso normal) | **170,6 W / 7,11 A @ 24 V** |
| Margem de projeto recomendada (≥ 30 %) | **222 W / 9,2 A** |
| **Fonte especificada** | **24 Vcc / 10 A / 240 W** (ex.: S-240-24) |
| Folga real | **1,41×** (41 % acima do consumo) |

> ⚠️ **Mudou o significado da fonte de 240 W.** No arranjo anterior ela tinha 2,4× de folga e era quase um exagero confortável. Com as duas Peltier, o consumo saltou de **101 W para 171 W** e a folga caiu para **1,41×** — a fonte de 240 W deixou de ser luxo e virou **o mínimo correto**.
>
> 🚫 **Uma fonte de 150 W (6,5 A) NÃO atende mais.** Ela ficaria em **110 %** da capacidade no modo frio e desligaria por sobrecarga. Se você já tinha cotado a de 150 W, **descarte**: é o único item cujo dimensionamento o Plano B tornou mais exigente, e não há como contornar.

> ### 🔴 O caso que a folga de 1,41× **não** cobre — e uma correção que este documento precisou receber
>
> Todos os números acima supõem o painel **funcionando**. Existe um estado em que ele não funciona: o **BTS7960 da Peltier falhando em curto** com o PTC ainda comandado. O BTS em curto entrega os **6,0 A** cheios ignorando o duty, o firmware não vê motivo para desligar o aquecimento, e o ramal de potência pede **9,30 A** — **10,41 A** na fonte.
>
> **Uma versão anterior deste documento afirmava que a fonte resolvia esse caso**: "entra em limitação de corrente, a tensão cai e o aquecimento cessa". ⚠️ **Essa afirmação foi retirada. Ela não estava demonstrada.**
>
> O que se pode afirmar e o que não se pode:
>
> | | Situação |
> |---|---|
> | **F1 abre?** | ❌ **Não.** 9,30 A não abre um fusível de 10 A — e não se deve contar com isso |
> | **A fonte limita?** | ⚠️ **Provavelmente, mas não está demonstrado.** Fontes chaveadas respondem à sobrecarga de formas diferentes: *hiccup* (desliga e tenta de novo), travamento, *foldback* ou corrente constante com tensão reduzida. **Nas duas últimas o aquecimento continua** — só que mais devagar. A S-240-24 só se comporta de um jeito depois de medida |
> | **KM1 abre?** | ✅ **Sim, e zera.** Modelado: **0 A** no ramal de potência e **1,07 A** na fonte (só os serviços permanentes) |
> | **ST-1 / ST-2 abrem?** | ✅ **Sim no modelo elétrico com contatos idealizados.** Capacidade real dos componentes e corte físico ainda não estão validados |
>
> ### ⚠️ O que o modelo mostra — e o que ainda não foi provado
>
> O PTC requer corte térmico independente do Arduino. **ST-1 e ST-2 são a arquitetura proposta**, mas nenhum componente exato ou ensaio confirmou ainda que ela interrompa CC e proteja o acrílico. Não energizar o PTC até encerrar os requisitos de compra e validação em [§2.6](#26-proteções-do-sistema--quem-protege-o-quê) e no [Doc 31 §31.0](../camada_3_eletrica/31_comando_e_protecoes.md).
>
> Como cálculo idealizado, o modelo prevê que, **se um contato realmente abrir**, a corrente do PTC some:
>
> ```
> falha completa     Peltier em curto 6,0 A + PTC 3,3 A = 9,30 A no F1 · 10,42 A na fonte
> ST-1 aberto        Peltier em curto 6,0 A + PTC 0,0 A = 6,00 A no F1 ·  7,11 A na fonte
> ```
>
> 📌 Esse resultado demonstra somente a lógica elétrica do simulador com um contato ideal aberto. **Não demonstra** que um termostato real abre, interrompe 3,3 A em 24 Vcc ou limita as temperaturas da câmara.
>
> ⚠️ **Cuidado com a leitura dos dois números.** O F1 vê só o ramal de potência (9,30 → 6,00 A); a **fonte** vê isso mais os dois conversores e os serviços permanentes (10,42 → 7,11 A). Dizer "cai para 6 A" sem dizer de qual ponto de medida é o tipo de número que a banca derruba.
>
> ### ⛔ Validação pendente — não tratar como risco aceito
>
> O comportamento da fonte e a atuação térmica ainda não foram caracterizados.
> **Não energizar o PTC** nem aceitar a janela de sobrecorrente como protegida até
> selecionar componentes e definir ensaios seguros. A validação deve ser feita em
> bancada controlada, com fonte limitada/proteções independentes, instrumentação
> adequada e supervisão qualificada:
>
> 1. Registrar o comportamento da fonte usando carga de teste apropriada e limitada;
> 2. Confirmar abertura e rearme manual de cada proteção sem induzir curto no driver
>    nem superaquecimento no conjunto montado;
> 3. Medir a temperatura em vários pontos do acrílico e do PTC sob condições
>    controladas, considerando tolerância e atraso térmico.
>
> Pull-downs de 10 kΩ em cada `R_EN` e intertravamento no firmware reduzem riscos
> durante operação normal, mas não evitam um BTS travado em curto. O ensaio de
> comissionamento deve verificar os drivers com as cargas desconectadas; não
> substitui a validação de ST-1/ST-2 nem autoriza energizar o PTC.

### Corrente no lado AC (127 V)

```
I_AC = P_total / (V × FP × η_fonte) = 170,6 / (127 × 0,65 × 0,85) ≈ 2,43 A
```

| Item | Especificação | Justificativa |
|---|---|---|
| Disjuntor de entrada | **2P, 6 A, curva C** | Corrente nominal de 2,43 A, mas o disjuntor de 6 A **continua correto** (2,5× a corrente de operação). Curva C porque fonte chaveada tem **corrente de inrush** alta (carga dos capacitores) — um curva B de 2 A dispararia toda vez que ligasse |
| Cabo AC | 1,5 mm² (PP 3×1,5 mm²) | Mínimo normativo para circuitos de força; sobra folga para os 2,5 A |

> ### ❓ "6 A é pouco para uma fonte de 10 A?"
>
> É a dúvida mais comum do projeto, e a resposta é: **os 10 A não estão onde você pensa.**
>
> | Lado | Conta | Corrente |
> |---|---|---:|
> | **Saída, 24 V** | é onde estão os 10 A | **10 A** |
> | **Entrada, 127 V** | 24 × 10 = 240 W ÷ 127 V ÷ 0,8 | **≈ 2,4 A** |
>
> **O que atravessa a fonte é a POTÊNCIA, não a corrente.** Como a tensão de entrada é cinco vezes maior que a de saída, a corrente de entrada é cerca de cinco vezes menor. O disjuntor de 6 A fica com mais que o dobro de folga sobre os 2,4 A reais.
>
> **Por que curva C e não B:** quando a fonte liga, os capacitores de entrada dela puxam dezenas de ampères por alguns milissegundos — é o *inrush*. Um disjuntor curva B dispara entre 3 e 5 vezes a corrente nominal e desarmaria toda vez que você ligasse a maquete. O curva C só dispara entre 5 e 10 vezes, e deixa o tranco passar.
>
> ⚠️ **Com a chave rotativa removida, o disjuntor virou também a chave geral.** A alavanca dele precisa ficar **acessível por fora** da casa de comando — monte-o atrás de uma tampa com recorte, como num quadro de luz de casa. Abrir a caixa toda vez para ligar a maquete significaria abrir uma caixa com 127 V dentro.
| ~~Chave rotativa 0-1~~ | — | **Removida.** O próprio disjuntor acumula a função de chave geral — ver a nota abaixo |

---

## 2.5 Os conversores — módulo LM2596 com display

### O módulo adotado

**Kit 2× Módulo Regulador Step Down LM2596 com Display Ajustável** — Mercado Livre:
<https://www.mercadolivre.com.br/kit-2-modulo-regulador-de-tensao-lm2596-display-ajustavel/up/MLBU4063333801>

Um kit fecha as duas necessidades do projeto: **um módulo vira o T2 (5,10 V) e o outro vira o T3 (12,0 V)**.

### Por que o LM2596 agora serve — e antes não servia

A versão anterior deste documento descartava o LM2596 com a nota "❌ fraco demais". **Aquela avaliação estava certa para aquela arquitetura e ficou errada para esta** — e vale explicar o porquê, porque é justamente o efeito de segunda ordem que o Plano B produziu:

| | Arquitetura anterior | Arquitetura adotada |
|---|---|---|
| Maior corrente que um conversor precisa entregar | **6,3 A** (ramal da Peltier) | **1,325 A** (ramal auxiliar) |
| Conversor necessário | XL4016 de 8 A | **LM2596 de 3 A com folga de 2,3×** |

> 💡 **Tirar a potência de cima dos conversores não simplificou só o T1 — simplificou os três.** Quando o ramal pesado passou a ser alimentado direto em 24 V, a maior carga restante caiu de **6,3 A para 1,3 A**, e a família inteira de conversores pôde ser rebaixada para o CI mais barato, mais comum e mais bem documentado do mercado. **É esse tipo de consequência em cadeia que se espera que você mostre na defesa:** uma decisão de arquitetura bem tomada não resolve um problema, resolve vários de uma vez.

### Comparativo dos módulos

| Módulo | CI | I nominal | I contínua **real** (com dissipador colado) | Display | Uso no projeto |
|---|---|---:|---:|:---:|---|
| **LM2596 com display** ⭐ | LM2596S-ADJ | **3 A** | **~1,5 A** | ✅ | ✅ **T2 (5,10 V) e T3 (12,0 V)** |
| XL4015 | XL4015 | 5 A | ~3 A | ❌ | Descartado — sem display, e não é mais necessária a corrente |
| XL4016 | XL4016 | 8 A | ~6 A | ❌ | **Eliminado junto com o T1** |

Carga real de cada conversor: **T2 = 0,695 A (46 % do limite seguro)** · **T3 = 1,325 A (88 % ⚠️ do limite seguro)**.

> ⚠️ **O T3 virou o ponto quente do painel.** Ele não é o ramal de maior potência — o R1 é, e sobra folga nele —, mas é o que mais se aproxima do **limite do próprio CI**. A 88 % da corrente contínua segura, o LM2596 do T3 **não funciona sem dissipador**: passa dos 100 °C e entra em proteção térmica. O dissipador colado deixou de ser boa prática e passou a ser item de lista de materiais.
>
> 📌 **Por que não trocar o T3 por um XL4015 de 5 A?** Poderia — sobraria folga. Mas custaria **perder o display**, que é a razão didática da escolha (§2.5), e acrescentaria um CI que não existe no projeto. Um dissipador de R$ 1,50 resolve o mesmo problema sem mudar a arquitetura. **A conta é essa, e ela está aberta:** se no comissionamento a temperatura passar de 70 °C, a decisão muda e o XL4015 volta — com display externo.

### Especificação real do LM2596 (datasheet, não o anúncio)

| Parâmetro | Datasheet (TI/ON LM2596-ADJ) | Comentário |
|---|---|---|
| Tensão de entrada | **até 40 V** (versão HV: 60 V) | 24 V bem dentro da faixa ✔ |
| Tensão de saída | 1,23 – 37 V ajustável | 5,10 V e 12,0 V ✔ |
| Corrente máxima | **3 A**, com limite interno típico de ~3,6 A | Derate para **1,5 A contínuos** com o dissipador do módulo |
| Frequência de chaveamento | 150 kHz | Buck **não-síncrono** (usa diodo Schottky) |
| **Proteções internas** | ⭐ **Limite de corrente ciclo a ciclo + shutdown térmico (~150 °C)** | **É o que dispensou o crowbar** — ver §2.6 |
| Rendimento | ~88 % em 24 → 12 V · ~78 % em 24 → 5 V | Menor rendimento em 5 V é normal: a razão de conversão é mais agressiva |

**Regra de ouro do conversor buck:** `Vin ≥ Vout + 2 V` (tensão de dropout).
- 24 → 12 V ✔ (folga de 12 V)
- 24 → 5 V ✔ (folga de 19 V)

### ⭐ O display — o motivo real da escolha

O módulo traz um **display LED vermelho de 3 dígitos** soldado na própria placa. No projeto ele deixa de ser enfeite e vira **instrumento de demonstração**:

```
                 TUBO DE PVC Ø 50 mm ("transformador" do poste)
              ┌────────────────────────────────┐
              │  ┌──────────────────────────┐  │
   24 V ──────┼─►│  LM2596 + DISPLAY        │  │
   (da linha) │  │  ┌────────┐              │──┼──► 5,10 V (ou 12,0 V)
              │  │  │ 5.10 ▐ │◄─ display    │  │    para o painel
              │  │  └────────┘   vermelho   │  │
              │  └──────┬───────────────────┘  │
              │     JANELA DE ACRÍLICO 1 mm    │
              │      (recorte ~20 × 12 mm)     │
              └────────────────────────────────┘
                      ▲ visível da posição do público
```

| Vantagem | Por que importa na apresentação |
|---|---|
| **Tensão de saída visível em tempo real** | O público **lê** a transformação acontecendo: 24,0 V entram na linha, 5,10 V saem do transformador de poste. Não é preciso acreditar no que você diz — está no display |
| **Botão IN/OUT** (presente na maioria das versões) | Um toque alterna a leitura entre entrada e saída **no mesmo display**. É a demonstração inteira da transformação em um único gesto |
| **Diagnóstico instantâneo** | Se algo não liga, o primeiro olhar já responde "o conversor está entregando tensão?" — sem multímetro, sem abrir nada |
| **Realismo** | Reproduz o medidor/telemetria que equipamentos de rede modernos têm no próprio poste |

> 🔧 **Execução da janela:** recorte o retângulo no tubo de PVC **antes** de montar o módulo, cole por dentro uma lâmina de acrílico transparente de 1 mm com cola instantânea gel (só nas bordas, para não manchar), e posicione a placa com o display encostado na janela. Deixe a janela **voltada para o lado da rua** — é de onde o público olha a maquete. Furos de ventilação de Ø 3 mm nas costas do tubo, longe da janela.

### Ajustes de cada conversor

| Conversor | Poste | Tensão alvo | Carga | Ocupação do limite |
|---|---|---:|---:|---:|
| **T2 · LM2596** | **P2** | **5,10 V** | 0,695 A | 46 % |
| **T3 · LM2596** | **P3** | **12,0 V** | 1,325 A | ⚠️ **88 %** |

> 🔧 **Procedimento obrigatório de ajuste (fazer ANTES de conectar qualquer carga):**
> 1. Alimente o módulo com 24 V **sem nada na saída**.
> 2. Gire o potenciômetro multivoltas até o display marcar a tensão alvo. **Confira com o multímetro** — o display do módulo tem precisão de ~±0,05 V e serve para demonstração, não para calibração.
> 3. **5,10 V e não 5,00 V:** os ~0,1 V a mais compensam a queda no cabo até o painel, e o Arduino aceita tranquilamente até 5,5 V no pino 5 V.
> 4. Só então conecte a carga. **Meça de novo com carga** — a tensão cai um pouco quando o consumo entra.
> 5. Marque a posição do potenciômetro com esmalte/tinta para não desregular com vibração.
>
> ⚠️ **O erro que queima o projeto:** ligar o cabo de 5 V no painel **antes** de ajustar o T2. O módulo sai de fábrica com o potenciômetro em posição arbitrária e pode entregar 20 V direto no Arduino. **Ajuste com a saída no ar, sempre.**
>
> 📌 **Se o seu módulo tiver dois potenciômetros** (versão CC+CV, que alguns vendedores enviam), o segundo é o limite de corrente: ajuste-o para **1,5 A** em ambos, curto-circuitando a saída através do amperímetro. Se tiver só um (o caso do kit do link), o limite de corrente fica por conta da proteção interna do CI.

---

## 2.6 Proteções do sistema — quem protege o quê

A proteção do projeto não está em um componente, está em **camadas**. Cada uma cobre um tipo de falha, e cada uma atua sem depender da anterior:

| # | Camada | Elemento | Protege contra | Onde fica |
|---|---|---|---|---|
| 1 | AC | **Disjuntor 2P 6 A curva C** | Curto e sobrecarga no lado 127 V | Subestação |
| 2 | Fonte | **Proteções da fonte chaveada** (OCP / OVP / OTP) | Curto franco no barramento de 24 V | Interna à S-240-24 |
| 3 | Ramais | **F1 (10 A) · F2 (2 A) · F3 (2 A)** | Curto em um ramal, com **seletividade**: cai só o ramal defeituoso | Trilho DIN da subestação |
| 4 | Conversores | ⭐ **Limite de corrente + shutdown térmico do LM2596** | Sobrecarga, curto na saída e superaquecimento de T2 e T3 | Nativo no chip |
| 5 | Comando | **KM1 com selo e a emergência em série com a bobina** | Corta os **24 V de potência em hardware**, independente do firmware | Painel |
| 5b | ⭐ **Térmica — pendente** | Proposta: ST-1 no corpo do PTC + ST-2 na parede, em série; modelos, capacidade CC, rearme manual e proteção ambiental ainda não comprovados | Pretende interromper falhas térmicas; eficácia ainda não demonstrada | **Câmara** — topologia proposta no chicote do PG13-2 |
| 6 | Drivers | **Pull-down de 10 kΩ em cada `R_EN`** | Pino solto ou Arduino resetado = driver **desligado** | Painel |
| 7 | Firmware | **Intertravamento Peltier/PTC + watchdog de 2 s** | As duas cargas juntas; travamento do programa | Arduino |
| 8 | Firmware | **Monitoramento de RPM dos 2 coolers externos** | Peltier operando sem dissipação | Arduino |

> ### ⭐ Por que a camada 5b foi proposta, e por que ela **não** pode depender do firmware
>
> As camadas 7 e 8 já olham ventilação e intertravamento — **mas olham pelo Arduino**. Se o que falha é o próprio Arduino, ou o BTS que ele comanda, nenhuma das duas vê nada. O PTC é a única carga do painel que pode **fugir sozinha**: 80 W num corpo pequeno, sem fluxo de ar, sem dissipador.
>
> A arquitetura proposta é um corte **físico, em série com a resistência**, e não uma condição de software:
>
> ```
> BD-POT ─► BTS2 · M+ ─► PG13-2 ─► ST-1 (90 °C, no corpo do PTC)
>                                    └─► ST-2 (70 °C, na parede interna)
>                                          └─► PTC +
> ```
>
> Quando os componentes e a ligação forem selecionados e validados, os contatos de corte não dependerão de 5 V, firmware, RS-485 ou do Arduino estar vivo. **Isso ainda não está comprovado no projeto atual**: a topologia no diagrama não demonstra a capacidade de interrupção dos contatos nem o desempenho térmico.
>
> ⚠️ **Os dois são NF (normalmente fechados) — e isso é o ponto.** Um termostato NF com o fio rompido fica **aberto** e o PTC não liga: a falha é segura. Um NA com o fio rompido ficaria fechado e a proteção desapareceria sem ninguém notar.
>
> ⛔ **Não comprar nem energizar o PTC ainda.** KSD9700-B e KSD301 são apenas sugestões de família; não há variante exata aprovada. Para ST-1 e ST-2, a ficha técnica do fabricante precisa comprovar temperatura e tolerância, rearme manual e capacidade de interrupção em **24 Vcc** para a corrente do PTC. Rating de 16 A em 250 Vca não demonstra interrupção em CC. Confirmar também proteção ambiental adequada à condensação.
>
> 🔒 **Qualquer disparo de ST-1 deve exigir parada travada e rearme manual**, independentemente do DS18B20: este mede o ar da câmara, não a temperatura do corpo do PTC. A variante manual ou uma trava externa equivalente ainda precisa ser identificada e validada.
>
> ⚠️ O limite proposto de ST-2 (70 °C ±5 °C) não foi validado contra o acrílico real. PLEXIGLAS GS fundido tem temperatura máxima aproximada de serviço de 80 °C; PLEXIGLAS XT extrudado, aproximadamente 70 °C. Identificar o material comprado e, em ensaio controlado, medir vários pontos da parede — especialmente próximos ao PTC — considerando tolerância, atraso e gradiente térmico. Não aprovar a temperatura de corte nem energizar o PTC antes de demonstrar margem segura.

### Por que o crowbar (Zener + fusível de saída) saiu do projeto

A versão anterior exigia um **circuito crowbar** — Zener de 5V6/13 V/15 V mais fusível — na saída de cada conversor, para o caso do buck falhar em curto e jogar os 24 V no barramento de 5 V. Com a mudança de módulo, esse arranjo deixou de se justificar:

| Motivo | Detalhe |
|---|---|
| **O CI já protege** | O LM2596 traz **limite de corrente ciclo a ciclo e desligamento térmico** dentro do próprio silício, especificados em datasheet de fabricante de primeira linha (TI/ON) — não em folha de clone. Sobrecarga e curto na saída, que eram os casos mais prováveis, são tratados sem nenhum componente externo |
| **Sumiu o barramento mais perigoso** | O crowbar de 15 V protegia a saída do **T1**, que não existe mais. E o antigo fusível **F5 de 10 A** protegia o 12 V de potência — hoje esse caminho é o próprio R1, já coberto pelo **F1** |
| **Menos solda = menos falha** | Zener de 5 W é um componente grande, que esquenta, montado no ar em fio volante. Em uma maquete que vai ser transportada e manuseada, **cada emenda solta é um defeito esperando acontecer** — e o crowbar acrescentava seis delas |
| **Didática mais honesta** | Proteção que já vem no componente é como a indústria realmente resolve isso hoje. Fonte de painel, driver, inversor: todos trazem OCP/OTP integrados. Empilhar Zener por fora é solução de bancada, não de projeto |

**Componentes eliminados:** 2× Zener 5V6/5 W · 2× Zener 13 V/5 W · 2× Zener 15 V/5 W · fusíveis **F4** e **F5** e seus 2 porta-fusíveis.

**Componentes mantidos:** **F1, F2 e F3** — os fusíveis de **entrada** de cada ramal. Eles não têm nada a ver com o crowbar: são a seletividade da rede de distribuição, o equivalente à chave fusível do poste, e continuam obrigatórios.

### ⚠️ Honestidade técnica: o que a proteção interna não cobre

O limite de corrente e o shutdown térmico do LM2596 cobrem sobrecarga, curto e superaquecimento. **Não cobrem o caso raro do transistor interno falhar em curto**, em que a entrada apareceria na saída — e o F2 de 2 A não necessariamente abriria antes de a eletrônica de 5 V sofrer, porque um Arduino sendo destruído por sobretensão pode consumir menos que 2 A. **Esse risco residual está sendo aceito conscientemente**, em troca de um sistema com muito menos componentes soltos e a favor de um CI cujo modo de falha é bem documentado. Quem quiser eliminá-lo mesmo assim, basta um Zener 5V6/5 W no barramento de 5 V, na entrada do painel — a decisão de projeto é não usá-lo.

> 📌 **Ponto novo de atenção do Plano B:** sem o T1, os **24 V de potência ficam presentes na entrada dos BTS7960 desde o instante em que a fonte liga** — antes, o tempo de partida do conversor funcionava como um atraso natural. Quem garante que nada acione nesse intervalo são as camadas **5 e 6** da tabela (KM1 aberto + pull-down nos `R_EN`). **Confira os dois no comissionamento antes de montar as Peltier** — ver [Doc 31 §31.0](../camada_3_eletrica/31_comando_e_protecoes.md).

---

## 2.7 Bitolas e queda de tensão

### Cálculo da queda no barramento de 24 V (o trecho dos postes)

Trecho crítico: ramal RM1, **1,2 m** de ida (subestação → P1) e 1,2 m de retorno pelo 0 V.

```
R_ida   = ρ × L / S = 0,0172 × 1,2 / 1,00 = 0,0206 Ω
R_volta = 0,0172 × 1,2 / 1,50             = 0,0138 Ω
R_total = 0,0344 Ω

ΔV = R × I = 0,0344 × 6,00 A = 0,21 V   →   0,86 % de queda
```

✅ Confortavelmente abaixo do limite prático de **3 %**, mesmo com a corrente do ramal tendo quase dobrado (3,55 A → 6,00 A). Foi preciso subir o R1 de 0,75 para **1,00 mm²** e o retorno de 1,00 para **1,50 mm²** para chegar nesse número.

> 💡 **A comparação ficou ainda mais forte com o Plano B.** Se o barramento fosse de 12 V, os mesmos 144 W exigiriam **12 A** → ΔV = 0,41 V, o que sobre 12 V dá **3,4 %**: **acima** do limite de 3 %. Ou seja, com a carga térmica dobrada, um barramento de 12 V **reprovaria no critério de queda de tensão** com esta mesma fiação — só passaria engrossando os condutores. Esse é o cálculo para colocar no relatório: ele não apenas justifica os 24 V, ele mostra que a alternativa **não atenderia**.

### Tabela de bitolas do projeto

| Circuito | Tensão | Corrente | **Bitola** | Tipo de cabo |
|---|---:|---:|---|---|
| Entrada AC (L / N / PE) | 127 V AC | 2,5 A | **1,5 mm²** | PP 3×1,5 mm² |
| **Ramal R1 nos postes (+24 V)** | 24 V | **6,0 A** | **1,00 mm²** ⬆ | Rígido **encapado vermelho** |
| Ramais R2 e R3 nos postes (+24 V) | 24 V | ≤ 0,95 A | **0,50 mm²** | Rígido **encapado marrom / cinza** |
| **Retorno comum 0 V nos postes** | — | **7,11 A (soma)** | **1,50 mm²** ⬆ | Rígido **encapado azul claro** |
| **Saída P1 → painel (24 V potência)** | 24 V | 6,0 A | **1,50 mm²** | Flexível vermelho/preto |
| ⚠️ Saída T2 → painel (5 V) | 5 V | **0,695 A** — limite **declarado** de 0,70 A | **0,50 mm²** | Flexível |
| ⚠️ Saída T3 → painel (12 V aux) | 12 V | **1,325 A** | **0,75 mm²** ⬆ | Flexível |
| Retorno geral 0 V painel → subestação | — | 7,11 A | **1,5 mm²** | Flexível preto |
| Sinais, sensores, botões | 5 V | < 0,05 A | **0,25 mm²** | Flexível colorido |

> ⬆ **Três bitolas subiram** por causa do aumento de corrente do Plano B: R1, o retorno comum e a saída do T3. Atualize a lista de compras antes de encomendar o fio rígido — a diferença de preço é de poucos reais, mas trocar depois significa desmontar a cruzeta inteira.

> ### ⚠️ Os dois ⚠️ da tabela são limites **declarados**, não limites físicos
>
> Nenhuma das duas linhas está errada — e nenhuma das duas é confortável. As duas merecem uma frase de honestidade, porque a diferença importa para quem for montar:
>
> | Ramal | Corrente do modelo | Limite da tabela | Situação |
> |---|---:|---:|---|
> | **5 V (T2)** | 0,695 A | 0,70 A | **99,3 %** — o fio de 0,50 mm² conduz muito mais que isso; o número foi escrito quando o ramal puxava 0,57 A |
> | **12 V (T3)** | 1,325 A | 1,0 A | **132 %** — o 0,75 mm² também aguenta; o que **não** aguenta é o LM2596 **sem dissipador** |
>
> 📌 **O que é limitação real e o que é número velho.** A ampacidade de um condutor de 0,50 mm² em ar livre, em trecho curto de painel, é da ordem de **3 A** — não 0,7 A. O que aperta de verdade é o **conversor**: 1,325 A de 1,5 A deixa o LM2596 do T3 a **88 %**, e aí o dissipador colado deixa de ser recomendação e vira item obrigatório de montagem.
>
> **Duas providências, nesta ordem:**
> 1. **Medir antes de fechar o painel** — corrente real nos dois ramais e temperatura dos dois dissipadores após 20 min no pior caso;
> 2. **Se a medida confirmar o modelo**, atualizar esta tabela para 0,75 mm² nos dois (é um fio cada) e registrar a data. **Não deixar um ⚠️ envelhecer no documento**: um limite que ninguém revê vira limite que ninguém respeita.
>
> ✅ **O `npm run valida:energia` já reprova sozinho** se alguma carga nova estourar estes números — a tabela pode estar otimista, mas o validador não deixa ela ficar silenciosamente errada.
>
> 🎯 **Bônus didático:** o retorno azul de 1,50 mm² agora é **visivelmente mais grosso** que os três condutores de "fase" na cruzeta. Isso é o oposto do que acontece em uma rede trifásica AC equilibrada, onde o neutro é mais fino — e é exatamente o ponto explicado em [§2.1](#-dá-pra-ter-3-fases-de-24-v-uma-por-regulador). Em CC o retorno conduz a **soma** de todas as correntes. Vale apontar o cabo com o dedo durante a defesa.

---

## 2.8 Balanço térmico — quanto calor fica dentro da maquete

| Elemento | Perda | Onde vai o calor | Solução |
|---|---:|---|---|
| Fonte 24 V (η ≈ 85 %) | **~29 W** ⬆ | Dentro da subestação | **Venezianas + cooler 60 mm** na caixa da subestação — agora **obrigatório**, não opcional |
| ~~T1 / XL4016~~ | **0 W** ⭐ (era ~10 W) | — | **Eliminado** — ganho direto do Plano B |
| T2 / LM2596 (η ≈ 78 %) | ~1,0 W | Dentro do "trafo" do poste P2 | Dissipador colado no CI + furos de Ø 3 mm |
| T3 / LM2596 (η ≈ 88 %) | ~1,4 W | Dentro do "trafo" do poste P3 | Dissipador colado no CI + furos — **obrigatório** (ver cálculo abaixo) |
| BTS7960 (×2) | ~4 W | Dentro do painel | Cooler 40 mm soprando neles. ⚠️ **Só vale com `L_EN` habilitado** — com ele aterrado o retorno passa pelo diodo de corpo e a dissipação triplica ([Doc 32 §32.3](../camada_3_eletrica/32_sinais_e_sensores.md)) |
| **Total dissipado (conversão)** | **~36 W** | | |

**Verificação térmica do T3 (o mais carregado):** 1,4 W em um LM2596S (encapsulamento TO-263) na plaquinha nua tem θJA de ~55 °C/W → **88 °C acima do ambiente**, o que estoura o limite dentro de um tubo fechado. Com um dissipador pequeno colado (θJA ~28 °C/W) a elevação cai para **~45 °C** — aceitável com os furos de ventilação. **Por isso o dissipador do T3 não é opcional.**

### O fluxo térmico que não aparece na tabela

As duas Peltier são o maior movimento de calor do projeto e **não entram na conta acima**, porque esse calor não fica dentro da maquete — é justamente o que os coolers externos jogam fora:

| | Valor |
|---|---:|
| Potência elétrica consumida pelas 2 pastilhas | 144 W |
| Calor bombeado do interior da câmara (Qc) | até ~40 W |
| **Total a dissipar no lado quente** | **até ~185 W** |

> ⚠️ **É por isso que são 2 conjuntos dissipador + cooler de 80 mm, e não um só.** Cada pastilha carrega ~90 W no lado quente — mais do que um dissipador de 80 mm dá conta sozinho. Se o lado quente saturar, o ΔT despenca, a câmara para de esfriar e a pastilha cozinha. **Dobrar a Peltier obriga a dobrar a dissipação**: é o custo real do Plano B, e a única coisa que ele tornou mais trabalhosa.

> ⚠️ **Honestidade técnica para a defesa:** converter 127 V → 24 V e só então transformar nos postes tem rendimento **menor** que uma fonte entregando 12 V direto. **Isso é uma escolha consciente**, e a justificativa é a mesma do sistema elétrico real: transmitir em tensão mais alta e transformar perto da carga **reduz perdas na linha e permite atender cargas de tensões diferentes com seletividade**. Diga isso na apresentação antes que o professor pergunte — vira ponto a favor, não contra.
>
> ✅ **E agora há uma resposta melhor ainda:** o Plano B **removeu o segundo estágio de conversão do caminho de maior potência**. Os 144 W térmicos, que são 86 % de toda a energia do projeto, vão da fonte à carga **sem nenhuma perda de conversão**. Só os 16 W de comando e auxiliares passam por conversor. A objeção do rendimento, que era o ponto fraco da arquitetura anterior, praticamente deixou de existir.

---

## 2.9 Sequência de energização

```
1. Disjuntor 2P ON            → só energiza a entrada da subestação
2. Liga o disjuntor Q0        → fonte 24 V liga
3. Fonte estabiliza (~0,5 s)  → 24 V nos 3 ramais, até o CONTATO do KM1
                                 ⛔ BD-POT e BTS ainda em 0 V (KM1 é NA)
4. T2 parte                   → 5,10 V → Arduino boota, tela inicializa
                                 os pull-downs seguram R_EN = 0 durante o boot
5. T3 parte                   → 12,0 V aux → 2 coolers externos e fans giram
6. Cogumelo destravado + LIGAR → o KM1 sela → 24 V chegam ao BD-POT
7. Operador dá START          → botão do painel OU IHM
8. Firmware confere RPM > 0   → nos DOIS coolers externos das Peltier
9. Arduino habilita R_EN      → processo em malha fechada
```

> Os passos 4 e 5 acontecem quase simultaneamente. **A ordem lógica continua sendo: comando → auxiliares → potência.**

> ### ⚡ Ao ligar o painel, os BTS7960 recebem 24 V?
>
> **Não.** O KM1 usa um **contato NA (normalmente aberto)**, e ele está no meio do caminho:
>
> ```
> FONTE 24 V → F1 → poste P1 → prensa-cabo → KM1 (terminal 11)
>                                               │
>                                        ⛔ CONTATO ABERTO
>                                               │
>                                     (terminal 14) → BD-POT → BTS B+
> ```
>
> | Ponto do circuito | Ao ligar o painel |
> |---|---|
> | Entrada do painel · KM1 terminal 11 | **24 V** ✅ |
> | KM1 terminal 14 · **BD-POT** · **BTS `B+`** | **0 V** ⛔ |
>
> Os BTS só recebem tensão no **passo 6**: cogumelo destravado → **LIGAR verde** → a bobina do KM1 energiza pelos dois blocos NF em série → o contato 11-14 fecha. **Antes disso eles estão eletricamente mortos.**
>
> ✅ **E a ordem ajuda:** o Arduino boota no passo 4, **antes** de a potência existir. Quando os 24 V chegam, os pinos já estão sob controle do firmware.

> ⚠️ **O que realmente mudou com a eliminação do T1.** Antes havia **duas barreiras em série** entre a fonte e os BTS: o tempo de partida do conversor T1 **e** o KM1. Hoje só existe uma — **o KM1**. Os 24 V chegam ao contato dele imediatamente, sem o atraso do conversor.
>
> Isso não torna o sistema inseguro, mas concentra a responsabilidade:
>
> 1. **KM1** — se o contato dele soldar fechado, os BTS passam a receber 24 V permanentemente, e a emergência deixa de cortar. É por isso que o contato tem que ter folga sobre os 6,0 A ([Doc 03](03_lista_materiais.md))
> 2. **Pull-downs de 10 kΩ** nos `R_EN` — mantêm a saída desligada mesmo com o `B+` energizado, durante um reset ou travamento do Arduino
>
> **Nenhuma das duas é opcional.** Ensaio obrigatório antes de instalar as Peltier: energize com a saída dos BTS **desconectada** e confirme **0 V no BD-POT antes do LIGAR** e **24 V depois dele**.

> O firmware deve esperar os **dois** coolers externos estarem girando (RPM > 0) antes de liberar as Peltier — com 2 pastilhas são 2 sinais de tacômetro a monitorar, e a falha de qualquer um dos dois já é motivo de bloqueio. Ver [Camada 4](../camada_4_programacao/40_firmware_arduino.md).

---

## 2.10 O que mudou em relação ao Plano A — histórico da decisão

Esta seção existe para a **defesa**. Uma banca costuma perguntar "por que você fez assim?", e a melhor resposta é mostrar que houve uma alternativa avaliada, comparada e descartada por critério.

O **Plano A** era a arquitetura original: um conversor em cada um dos três postes, sendo o do poste P1 um **XL4016 de 8 A** que abaixava 24 V → 12 V para alimentar uma Peltier e um PTC de 12 V.

### Comparação lado a lado

| Critério | Plano A (descartado) | **Plano B (adotado)** |
|---|---|---|
| Conversores | 3 (XL4016 + 2× XL4015) | **2 (2× LM2596 com display)** |
| Caminho da potência térmica | Fonte → **XL4016** → BTS → carga | Fonte → BTS → carga **(sem conversor)** |
| Perda no caminho de potência | ~10 W | **0 W** |
| Capacidade de refrigeração | 1 Peltier — 72 W | **2 Peltier — 144 W** |
| Proteção dos barramentos | 6 Zener + 2 fusíveis de saída, em fio volante | **Nativa no CI dos conversores** |
| Componentes soltos para soldar | 6 Zener + 2 porta-fusíveis | **nenhum** |
| Leitura de tensão para o público | 3 voltímetros comprados à parte | **display integrado ao conversor** |
| Consumo total | 101 W / 4,2 A | **170,6 W / 7,11 A** |
| Folga da fonte de 240 W | 2,4× | **1,41×** |
| Dissipação externa da Peltier | 1 conjunto dissipador+cooler | **2 conjuntos** |
| Calor de conversão na maquete | ~34 W | **~36 W** (mas ~29 W disso é a fonte, que tem exaustão própria) |

### Por que o Plano B venceu

1. **Eliminou o componente mais crítico do projeto.** O XL4016 era o único item operando perto do seu limite (6,3 A de uma capacidade real de ~6 A), dentro de um tubo fechado, com cooler dedicado. Era, disparado, o candidato número 1 a falhar no dia da apresentação.
2. **Dobrou a capacidade de refrigeração sem acrescentar nenhum estágio.** As duas pastilhas em série formam naturalmente uma carga de 24 V — a tensão que o barramento já tem.
3. **Simplificou a proteção em vez de complicá-la.** Saíram 8 componentes; entrou uma característica que o CI já tinha.
4. **Tornou o projeto mais legível para quem olha de fora.** Menos fio volante, menos gambiarra, mais coisa comprada pronta e funcionando dentro da especificação.

### O que o Plano B custou (as duas desvantagens reais)

| Custo | Mitigação |
|---|---|
| **Dobrou a dissipação externa** — 2 conjuntos dissipador + cooler de 80 mm em vez de 1 | Está previsto na BOM; ocupa mais espaço atrás da câmara |
| **A folga da fonte caiu de 2,4× para 1,41×** | Ainda acima dos 30 % recomendados, mas **fecha a porta** para a fonte de 150 W e reduz o espaço para cargas futuras |
| *(logístico)* PTC de **24 V** é menos comum nas lojas que o de 12 V | Comprar cedo, no **Lote A**; existe como resistência de ar quente 24 V para incubadora/impressora 3D |

> 🎓 **Frase pronta para a defesa:** *"Nós tínhamos uma arquitetura com três conversores, e um deles operava em 95 % da capacidade real para alimentar uma carga que já poderia funcionar na tensão do barramento. Eliminamos esse conversor ligando duas pastilhas em série. O resultado foi dobrar a refrigeração, zerar a perda no caminho de maior potência e remover oito componentes de proteção que só existiam por causa dele."*

---

## 2.11 Resumo executivo das decisões

| # | Decisão | Justificativa |
|---|---|---|
| 1 | **Fonte ATX foi eliminada** | Não possui trilho de 24 V e não permite associação em série |
| 2 | **Fonte chaveada 24 Vcc / 10 A / 240 W** | Padrão industrial, 2,4× de folga, bivolt |
| 3 | **Barramento de 24 V em 3 ramais + retorno comum** | Seletividade por fusível; equivale visualmente a 3 fases + neutro |
| 4 | **Toda a parte visível da maquete é SELV (24 V)** | 127 V AC fica confinado dentro da subestação fechada — segurança na apresentação |
| 5 | ⭐ **Potência térmica ligada DIRETO em 24 V** — 2× Peltier em série + PTC de 24 V | Elimina o conversor mais crítico do projeto, zera a perda no caminho de maior potência e dobra a capacidade de refrigeração |
| 6 | ⭐ **T1 (XL4016) ELIMINADO — P1 vira poste de derivação** | Não há tensão a transformar nesse ramal. Ganha a analogia do consumidor industrial atendido em tensão primária |
| 7 | ⭐ **T2 e T3 = LM2596 com display** | A maior carga restante é de **1,325 A** (12 V, com as 8 posições): o LM2596 de 3 A sobra, mas o de T3 opera a **88 %** da corrente segura — **dissipador obrigatório**. Traz **display integrado** (didática) e **proteção térmica + curto nativas** (segurança) |
| 8 | ⭐ **Crowbar (Zener + fusíveis F4/F5) ELIMINADO** | As proteções internas do LM2596 cobrem sobrecarga, curto e temperatura. Menos 8 componentes soltos em fio volante — ver [§2.6](#26-proteções-do-sistema--quem-protege-o-quê) |
| 9 | **F1 subiu para 10 A; F2 e F3 seguem em 2 A** | O ramal RM1 passou a conduzir 6,0 A contínuos. Os fusíveis de entrada dos ramais são a seletividade da rede e continuam obrigatórios |
| 10 | **Fonte 24 V / 10 A / 240 W confirmada como mínimo** | Com **170,6 W** de consumo, a folga é de **1,41×**. **A fonte de 150 W foi descartada** |
| 11 | **ESP32 alimentado pela DNLCB30 em 24 V** | A DNLCB30 aceita 7–35 V e já gera 3,3 V regulado — não precisa de um 3º conversor |
| 12 | **Volta o disjuntor 2P 6 A curva C** | Ambiente industrial exige proteção de entrada; curva C por causa do inrush da fonte. Continua adequado com os 2,4 A do novo consumo |
| 13 | **KM1** com selo, e a emergência em série com a bobina | Só a emergência precisa ser hardware; o **KM1 chaveia os 24 V de potência**. START/STOP viram software e funcionam pela IHM também — ver [Doc 31 §31.0](../camada_3_eletrica/31_comando_e_protecoes.md) |
| 14 | **Linha com condutores encapados**, nunca nus | Em CC qualquer ponte metálica é curto franco, e o arco não se extingue sozinho |
| 15 | **Blocos de distribuição por tensão** no painel, com **BD-POT e BD-24V separados** | Uma entrada, várias saídas. A separação permite a emergência derrubar a potência sem derrubar a supervisão |

## 2.12 Proposta provisória: T2, T3 e PTC 12 V

Esta seção é a referência provisória para revisar o orçamento. Ela **não aprova
compra, instalação ou energização**: ainda faltam fichas dos modelos exatos e um
projeto de proteção/corte CC para o ramal do PTC.

| Identificação | Proposta | Estado |
|---|---|---|
| T2 | 24 V → 5,0 V / 5 A (25 W) | Confirmar faixa máxima de entrada com a tensão máxima real da fonte e transientes; saída de 5,0 V não é alimentação direta aprovada do pino 5V do Mega |
| T3 | 24 V → 12 V / 20 A (240 W) | Corrente anunciada não valida operação contínua, dissipação nem proteções do modelo exato |
| PTC | 12 V / 50 W ≈ **4,17 A** | Proposta; identificar elemento, temperatura, ventilação e ficha antes de comprar |
| BD-AUX | 12 V permanente para ventoinhas e serviços | Permanece separado do ramal comutado do aquecedor |
| Ramal PTC 12 V | Saída do T3, carga independente das ventoinhas | Topologia de corte DC, proteção, condutores e retorno ainda por dimensionar; F3 legado de 2 A não foi validado |

### Orçamento provisório de 12 V

| Carga | Corrente estimada |
|---|---:|
| Ventoinhas, cooler e posições de ensaio (BD-AUX) | 1,325 A |
| PTC 12 V / 50 W | 4,17 A |
| **T3 no pior caso simultâneo** | **≈ 5,49 A / 65,9 W** |

O conversor de 20 A anunciado teria margem aritmética para 5,49 A, mas essa
comparação não substitui verificação de corrente contínua, temperatura, proteção,
cabos ou capacidade da fonte. Com rendimento de 88 % usado apenas como estimativa,
T3 demandaria cerca de 3,12 A no lado de 24 V; portanto o F3 legado de 2 A e a
bitola antiga do ramal não podem ser mantidos como aprovados. **Não trocar F3 por
um valor arbitrário nem por 20 A.** Coordenar primeiro conversor, proteção DC,
condutores, conectores e corrente de partida.

### Falha do driver e corte independente

Como o T3 e o BD-AUX permanecem alimentados quando o KM1 abre, um BTS2 em curto
pode manter o PTC energizado apesar de `renPtc=false`, STOP pela IHM, trip ou
emergência. O corte do KM1 interrompe a Peltier de 24 V, mas **não é o corte do
ramal do PTC em 12 V**. A medição de corrente é diagnóstico; não substitui um
dispositivo DC em série, independente do BTS, com classificação documentada e
adequada à carga. A escolha e a lógica desse dispositivo permanecem pendentes.

O simulador representa esta lacuna deliberadamente: com BTS2 em curto, mostra
≈4,17 A no BD-PTC mesmo após abrir KM1. Os testes provam apenas a aritmética e a
lógica modeladas, não a capacidade real de T2/T3, F3, termostatos, fusíveis ou
contatos. O PTC segue **sem aprovação para energização física**.

---

📄 **Próximo:** [Doc 03 — Lista de Materiais](03_lista_materiais.md)
🖼️ **Desenho relacionado:** [Diagrama Unifilar](../desenhos/05_diagrama_unifilar.svg)
