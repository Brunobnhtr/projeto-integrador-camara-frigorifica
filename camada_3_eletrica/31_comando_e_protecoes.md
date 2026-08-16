# CAMADA 3 · Doc 31 — Comando, Proteções e Aterramento

> O acionamento do processo em **dois estágios** (segurança com trava + processo sem trava), a emergência em hardware, o que fica em software, a seletividade das proteções e o aterramento. **É o documento com mais conteúdo puro de eletrotécnica do projeto.**
>
> ✅ **Pré-requisito:** [Doc 30](30_forca_e_distribuicao.md) — força energizada e medida.
> 🖼️ **Desenho:** [Diagrama de comando](../desenhos/06_diagrama_comando.svg)

---

## 🟢 Em palavras simples — como a máquina para quando precisa parar

Este documento responde a uma pergunta só, mas ela é a mais importante do projeto:

> **Se o programa travar com a Peltier ligada, como eu desligo?**

Se a resposta dependesse do software, o software seria o único ponto de falha do sistema. Então a resposta **não pode** depender dele.

### Dois botões que parecem iguais e são muito diferentes

| | **STOP** | **EMERGÊNCIA** (cogumelo vermelho) |
|---|---|---|
| Para a máquina? | Sim | Sim |
| Como volta? | Solta o botão e liga de novo | **Não volta sozinha.** Nem soltando o cogumelo |
| Precisa de quê para voltar | Um comando normal | Um **botão de REARME**, apertado por uma pessoa |
| Serve para | Parar a operação | Situação de risco |

**Por que a emergência trava?** Imagine que alguém aperta o cogumelo porque enfiou a mão onde não devia. Se destravar o botão religasse a máquina, ela voltaria a funcionar **com a pessoa ainda lá dentro**. A norma (ISO 13850) proíbe isso: destravar libera, mas quem religa é uma decisão consciente e separada.

### Como se faz uma máquina "lembrar" que foi ligada, sem software

Este é o truque mais bonito da eletrotécnica clássica, e chama-se **selo**.

O problema: o botão START é de pulso — você solta e ele abre. Como manter a máquina ligada depois de soltar?

A solução: **o relé segura a si mesmo.**

```
   1. Você aperta o START
             ▼
   2. O relé liga
             ▼
   3. Ao ligar, ele FECHA um contato próprio,
      ligado em PARALELO com o botão START
             ▼
   4. Você solta o botão — mas o contato dele
      mesmo continua alimentando a bobina
             ▼
   5. A máquina fica ligada "por memória"
```

E o melhor: **basta abrir a corrente em qualquer ponto do circuito** (emergência, STOP, falta de energia) que o relé solta, o contato abre, e o selo se perde. **Só um novo START religa.** Memória sem uma linha de código.

### Por que dois relés

Porque depois de um STOP normal eles precisam estar em **estados diferentes ao mesmo tempo**:

| | KA1 | KA2 |
|---|---|---|
| Depois de um **STOP** | continua ligado (a máquina segue habilitada) | desligado (o processo parou) |
| Depois de uma **EMERGÊNCIA** | desligado (perdeu o selo) | desligado |

Um relé só não consegue estar ligado e desligado ao mesmo tempo. É essa a razão, e é a única.

### Por que os botões de parada são "normalmente fechados"

Um contato **NF** deixa a corrente passar quando o botão está solto, e **corta** quando você aperta. Parece invertido, mas é proposital:

> **Se o fio arrebentar, o circuito abre — e a máquina para.**

Ou seja: **a falha leva ao estado seguro.** Se o botão fosse "normalmente aberto", um fio partido faria o botão simplesmente **não funcionar** — e ninguém descobriria até o dia em que precisasse dele.

O REARME é o contrário (NA), pelo mesmo raciocínio invertido: fio partido no rearme **impede a máquina de ligar**, que também é o estado seguro.

### A divisão que organiza tudo

> 🎯 **Tudo que envolve PARAR está em hardware. Só o que envolve LIGAR está em software.**

A máquina desliga por caminhos que não dependem de nada. Para ligar, ela depende de tudo estar certo.

### ⚡ Os dois caminhos — o relé NÃO está no caminho do comando

Esta é a confusão mais fácil de ter, e vale deixar explícita: **potência e comando são dois caminhos separados**, e eles só se encontram dentro do chip do BTS7960.

```
 CAMINHO DA POTÊNCIA (energia)          CAMINHO DO COMANDO (informação)
 ══════════════════════════════         ═══════════════════════════════

  FONTE 24 V                                    ARDUINO
      │                                            │
   [F1 10A]                                    D4 (enable)
      │                                        D5 (PWM 1 Hz)
   poste P1                                        │
      │                                            │  fios de 0,25 mm²
   [ KA2 ]  ◄── abre só na emergência/STOP         │
      │                                            │
   BD-POT ──────────────► B+ ┌──────────────┐ ◄────┘
                             │   BTS7960    │
                             │  (os MOSFETs)│
                             └──────┬───────┘
                                 M+ │ M−
                                    ▼
                              2× PELTIER
```

**O comando vai `Arduino → BTS → Peltier`.** Nunca `Arduino → relé → BTS`.

| | **KA2 (relé)** | **BTS7960** |
|---|---|---|
| Função | Chave de **segurança** | Chave de **controle** |
| Quem comanda | **As botoeiras**, em hardware | O Arduino, em software |
| Quantas vezes atua | **Dezenas**, na vida do projeto | **86.400 por dia** (1 Hz) |
| Se falhar | A emergência não corta ⚠️ | O processo não controla |

> ⚠️ **Por que o relé não pode fazer o PWM:** um relé típico tem vida elétrica de ~100.000 operações. A 1 Hz são 86.400 por dia — **ele acabaria em cerca de 28 horas**. Chaveamento rápido é trabalho de semicondutor; relé é para abrir e fechar poucas vezes, com segurança.

> 🎯 **Repare que o Arduino não tem nenhum pino ligado ao KA1 ou ao KA2.** Ele só **lê** (pelo divisor no pino D25) se a potência chegou. Isso é intencional: se o Arduino pudesse religar o relé, a emergência dependeria do software — e aí não seria emergência.

### Dicionário rápido

| Termo | O que quer dizer |
|---|---|
| **Bobina** | O eletroímã do relé. Energizou, os contatos mudam de posição |
| **Contato NA** | Normalmente Aberto — fechado só quando a bobina está ligada |
| **Contato NF** | Normalmente Fechado — abre quando a bobina liga |
| **Reversível (CO)** | Um contato que tem NA e NF juntos, comutando entre eles |
| **Selo** | O contato do próprio relé que o mantém ligado depois de soltar o botão |
| **Relé de interface** | Relé pequeno que deixa um sinal fraco comandar uma carga forte |
| **Intertravamento** | Impedir que duas coisas aconteçam juntas (aqui: Peltier e PTC) |
| **Trip** | Desligamento automático por falha detectada |
| **Watchdog** | "Cão de guarda": se o programa travar, ele reinicia o processador |
| **Seletividade** | Só a proteção mais próxima da falha atua |
| **Fail-safe** | Projetado para que a falha leve ao estado seguro |

---

## 31.0 O acionamento em dois estágios

O acionamento precisa satisfazer quatro exigências **ao mesmo tempo**:

| # | Exigência | Consequência |
|---|---|---|
| 1 | **STOP corta a energia em hardware** | Não pode depender do firmware |
| 2 | **EMERGÊNCIA corta a energia em hardware** | Idem |
| 3 | **Ao soltar a emergência, a energia NÃO pode voltar sozinha** | Exige **trava (selo)** — e trava só se desfaz com um comando deliberado |
| 4 | **START e STOP normais funcionam pela IHM** | O operador não pode ser obrigado a ir ao painel a cada parada |

> ⚠️ **As exigências 3 e 4 se contradizem se você tentar resolver as duas com o mesmo circuito.** Se o STOP travar, o rearme tem que ser físico — e aí a exigência 4 morre. Se nada travar, a exigência 3 morre.
>
> **A saída é separar em dois estágios**, que é exatamente o que a norma de parada de emergência (ISO 13850) determina: a emergência **trava e exige rearme manual**; a parada normal **corta mas não trava**.

### Os dois estágios

```
╔═══ ESTÁGIO 1 · SEGURANÇA ══════ trava · só a emergência derruba ═══════════╗
║                                                                            ║
║   +24 V ──[ S0 · EMERGÊNCIA (NF) ]──┬──[ S3 · REARME (NA) ]──┐            ║
║                                      │                        │            ║
║                                      └── KA1 · contato SELO ──┤            ║
║                                                                │            ║
║                                                    A1 [ KA1 ] A2 ── 0 V    ║
╚════════════════════════════════════════════════════════════════════════════╝
                    │ KA1 · contato de saída
                    ▼
╔═══ ESTÁGIO 2 · PROCESSO ═══════ corta, mas não trava ═════════════════════╗
║                                                                            ║
║   KA1 ──[ S2 · STOP (NF) ]──────────────────► A1 [ KA2 ] A2 ── 0 V        ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
                    │ KA2 · contato de potência (≥ 10 A)
                    ▼
   P1 (24 V) ──► KA2 ──► BD-POT ──► BTS7960 #1 e #2
```

### O que acontece em cada situação

| Situação | KA1 | KA2 | 24 V nos BTS | Como volta |
|---|---|---|---|---|
| Operação normal | ✅ selado | ✅ | ✅ presente | — |
| **STOP pressionado** | ✅ segue selado | ❌ **abre** | ❌ **cortado em HW** | Soltar o STOP; **religa pela IHM** |
| **EMERGÊNCIA pressionada** | ❌ **selo perdido** | ❌ | ❌ **cortado em HW** | — |
| **Cogumelo destravado** | ❌ **continua caído** | ❌ | ❌ **continua cortado** | Só com o **botão REARME** |
| REARME pressionado | ✅ sela de novo | ❌ | ✅ disponível | Processo ainda parado; dar START |
| **Saída do Arduino travada ligada** | ✅ | depende | — | **STOP corta enquanto pressionado; EMERGÊNCIA corta e trava** |

> 🎯 **Resposta direta à sua pergunta "se a saída do Arduino travar, como desligo?"**
> O **STOP** corta enquanto você o mantém pressionado — é hardware puro, não passa por semicondutor nenhum. E se o problema for permanente, a **EMERGÊNCIA** corta **e trava**: mesmo soltando o cogumelo, a energia não volta. Só volta com o botão REARME, que é uma decisão consciente de uma pessoa.
>
> **É exatamente por isso que as duas botoeiras existem.** O STOP é comando de operação; a emergência é função de segurança, e por isso ela trava.

### Os três componentes

| | **KA1 — habilitação** | **KA2 — processo** | **S3 — rearme** |
|---|---|---|---|
| **O que é** | Relé de interface, trilho DIN | Relé de interface, trilho DIN | Botoeira 22 mm **azul** |
| **Bobina** | 24 Vcc | 24 Vcc | — |
| **Contatos** | **2 reversíveis**, 6 A basta | **1 reversível, ≥ 10 A** ⚠️ | 1 bloco NA |
| **Corrente que passa** | mA (selo + bobina do KA2) | **6,0 A em 24 Vcc** (a carga) | mA |
| **Busca no ML** | `relé de interface 24vdc 2 contatos din` | `relé de interface 24vdc 10a trilho din` | `botão pulsador azul 22mm` |
| **Preço** | R$ 40–60 | R$ 40–60 | R$ 18 |

> ⚠️ **Só o KA2 precisa de 10 A.** O KA1 conduz apenas o próprio selo e a bobina do KA2 — corrente de miliampères. Um relé de interface comum de 6 A serve, e é mais barato.
>
> **Opções premium:** Finder **55.32.9.024.0040** (2 CO) para o KA1 e Finder **46.61.9.024.0040** (16 A) + base **95.05** para o KA2.

### Por que dois relés e não um

Porque eles precisam estar em **estados diferentes ao mesmo tempo**. Depois de um STOP normal:

- **KA1 continua ligado** — a máquina segue habilitada, ninguém precisa rearmar nada
- **KA2 está desligado** — o processo parou

Um relé só não consegue estar ligado e desligado ao mesmo tempo. É essa a razão, e é a única.

### Por que o botão REARME existe

A norma de parada de emergência exige que **destravar o cogumelo não religue a máquina** — o rearme tem que ser um ato separado e deliberado. Um botão azul de REARME é a forma padrão de fazer isso em painel industrial.

> 💡 **Dá para economizar o botão** usando o próprio START como rearme (o primeiro toque rearma, o segundo inicia). Funciona, mas fica ambíguo para quem opera, e um botão de R$ 18 resolve. **Recomendo o botão dedicado.**

### O papel do Arduino

O Arduino **não comanda relé nenhum**. Ele liga e desliga o processo pelo **`R_EN` dos BTS7960** — o pino de habilitação dos drivers:

| Ação | Como o Arduino faz |
|---|---|
| START (botão físico ou IHM) | Habilita o `R_EN` do driver do modo escolhido |
| STOP (botão físico ou IHM) | `R_EN` dos dois em nível baixo |
| Trip por fan parada / sobrecorrente | `R_EN` dos dois em nível baixo + LED FAULT + registro |

Para esse canal ser confiável, dois reforços de R$ 0,20:

| Reforço | Por quê |
|---|---|
| **Pull-down de 10 kΩ** entre cada `R_EN` e 0 V | Arduino resetado → pinos viram entrada → **pino solto = driver desabilitado** |
| **Watchdog de 2 s** no firmware | Programa travado → Mega reseta → pull-down age → drivers desligam |

> 📌 **Note a divisão de responsabilidades:** o Arduino cuida do **processo** (ligar, desligar, controlar). Os relés cuidam da **segurança** (emergência e parada). As duas coisas não se misturam, e nenhuma depende da outra.

---

## 31.1 O que é hardware e o que é software

| Função | Onde vive | Funciona com o Arduino morto? |
|---|---|---|
| **EMERGÊNCIA corta a energia** | **Hardware** — S0 em série com a bobina do KA1 | ✅ **Sim** |
| **EMERGÊNCIA não religa sozinha** | **Hardware** — o selo do KA1 se perde | ✅ **Sim** |
| **STOP corta a energia** | **Hardware** — S2 em série com a bobina do KA2 | ✅ **Sim** |
| **REARME** | **Hardware** — S3 refaz o selo do KA1 | ✅ **Sim** |
| START do processo | Software (`R_EN`) | ❌ Não (e não precisa) |
| Escolha entre frio e quente | Software | ❌ Não |
| Trip por fan parada | Software + pull-down + watchdog | ⚠️ Parcial |
| Intertravamento Peltier ⊕ PTC | Software | ❌ Não |

> 🎯 **Tudo o que envolve PARAR está em hardware. Só o que envolve LIGAR está em software.** É a assimetria correta: a máquina desliga por caminhos que não dependem de nada; para ligar, ela depende de tudo estar certo.

---

## 31.2 O circuito completo

```
   +24 V (BD-24V, protegido pelo F3)
     │
     │  S0 · EMERGÊNCIA (cogumelo com trava)
     │  ┌────────┐
     ├──┤   NF   ├──────┬──────────────────────────────┐
     │  └────────┘      │                              │
     │                  │  S3 · REARME (azul)          │
     │                  │  ┌────────┐                  │
     │                  ├──┤   NA   ├──────────────────┤
     │                  │  └────────┘                  │
     │                  │                              │
     │                  │  KA1 · contato de SELO       │
     │                  │  ┌────────┐                  │
     │                  └──┤   NA   ├──────────────────┤
     │                     └────────┘                  │
     │                                        A1 ──────┴───── A2
     │                                          [ KA1 · 24 V ]
     │                                              │
     ├──────────────────────────────────────────────┴────────── 0 V
     │
     │  KA1 · contato de SAÍDA        S2 · STOP
     │  ┌────────┐                    ┌────────┐
     └──┤   NA   ├────────────────────┤   NF   ├───── A1 [ KA2 · 24 V ] A2 ── 0 V
        └────────┘                    └────────┘


   POTÊNCIA:
   P1 (derivação 24 V) ──► PG9 ──► KA2 (11→14) ──► BD-POT ──► BTS #1 e #2
```

### Sequência completa

| Passo | O que acontece |
|---|---|
| **1. Painel energizado** | KA1 desligado (o selo nasce aberto). **Sem 24 V nos BTS** |
| **2. Operador aperta REARME** | KA1 sela. O contato de saída fecha |
| **3. STOP solto** | KA2 energiza → **24 V disponíveis nos BTS** |
| **4. Arduino boota** | `R_EN` dos dois em nível baixo. Nada aciona ainda |
| **5. Configura o ciclo** | Pela IHM (tela ES3C28P) |
| **6. START** | Botão físico **ou** IHM → o firmware habilita o `R_EN` do modo escolhido |
| **7. STOP** | Botão físico → **KA2 abre, corta em hardware**. IHM → o firmware baixa o `R_EN` |
| **8. Novo START** | **Pela IHM ou pelo painel.** O KA1 nunca caiu, então nada precisa ser rearmado |
| **9. EMERGÊNCIA** | KA1 perde o selo → KA2 cai → **24 V cortados**. O 2º bloco avisa o Arduino |
| **10. Cogumelo destravado** | **Nada acontece.** O KA1 continua caído, a energia continua cortada |
| **11. REARME** | KA1 sela de novo → energia disponível. **O processo continua parado** — exige START |

> ⚠️ **O passo 10 é o coração do requisito:** destravar o cogumelo **não** devolve a energia. Isso está garantido pelo selo, em hardware — não por uma variável do firmware.

---

## 31.3 🔌 As duas fileiras da base PTF08A

Os 8 terminais de um relé de base não ficam todos de um lado: são **duas fileiras de 4**.

No projeto a divisão não é estética — ela segue por onde o fio precisa sair:

| | KA1 | KA2 |
|---|---|---|
| **Fileira de BAIXO**<br>(de frente para a CH-2x1, potência) | `A1` `A2` `11` `24` | `A1` `A2` `11` `14` |
| **Fileira de CIMA** | `12` `14` `21` `22` | `12` `21` `22` `24` |

> ⭐ **Na fileira de baixo ficam os terminais que recebem FIO EXTERNO.** O trilho 2 tem a canaleta de potência embaixo (CH-2x1) e a de sinal em cima (CH-3x2) — e a cadeia de comando é potência. Se um terminal com fio externo estivesse em cima, o fio teria que atravessar o corpo do relé para chegar na canaleta certa.

**Em cima ficam os que só levam ponte curta na própria base:**

- `KA1-14 → KA1-A1` — **o selo**, atravessando o soquete de uma fileira à outra
- `KA1-11 → KA1-21` — a ponte que leva o nó CMD aos dois contatos
- `12` e `22` — os NF que o projeto não usa

📌 **Confira a serigrafia da sua base.** A distribuição dos números nas duas fileiras varia de fabricante; o que não varia é a lógica: `A1`/`A2` são a bobina, o dígito **1** é o comum, o **2** é o NF e o **4** é o NA.

---

## 31.4 🔩 A numeração dos contatos — e três erros que ela evita

Todo bloco de contato de botoeira industrial vem com o número **gravado no próprio corpo**. A convenção é a mesma no mundo inteiro:

| Bloco | Terminais | Como identificar |
|---|---|---|
| **NF** (normalmente fechado) | **11 – 12** | termina em **1 e 2** |
| **NA** (normalmente aberto) | **13 – 14** | termina em **3 e 4** |
| 2º bloco NF | 21 – 22 | o primeiro dígito é o número do bloco |
| 2º bloco NA | 23 – 24 | idem |

> ⭐ **Use esses números no desenho e na anilha.** Escrever "S2 pino 1" não ajuda ninguém: **não existe pino 1** no bloco. Escrever "S2-11" faz a pessoa achar o terminal em dois segundos, porque o número está impresso ali.

### 🔥 Os três erros que a montagem deste circuito permite

**1. Trocar os dois blocos do STOP.** O S2 tem dois blocos: o **NF de 24 V (11-12)**, que corta a bobina do KA2 de verdade, e o **NA de 5 V (13-14)**, que só avisa o Arduino.

| Se você… | O que acontece |
|---|---|
| ligar o Arduino no bloco de 24 V | **queima o pino D23** na hora |
| ligar a cadeia no bloco de 5 V | o STOP **não corta nada em hardware** — vira um botão de software, e o painel deixa de ter parada segura |

**2. Trocar os dois 24 V vermelhos.** O `E1` (potência, vai ao KA2) e o `E5` (serviços, vai ao BD-24V) são os dois vermelhos e entram por prensa-cabos diferentes. Trocados: a **potência fica permanente** e a **supervisão morre na emergência** — exatamente o inverso do projeto. Anile os dois na entrada, antes de puxar.

**3. Esquecer o fio do selo (C6).** É a ponte curta `KA1-14 → KA1-A1`, e é o único fio do painel cuja falta **não causa erro nenhum aparente**: tudo liga normalmente enquanto o dedo está no rearme, e desliga sozinho quando você solta. Quem não conhece o circuito procura defeito no relé.

### ✅ Teste do circuito de comando, antes de energizar a potência

Faça **com o barramento BD-POT desligado**. Só a cadeia de comando alimentada.

- [ ] Aperte o **REARME** → o KA1 deve fechar e **continuar fechado** ao soltar (é o selo)
- [ ] Aperte o **STOP** → o KA2 solta; solte o STOP → o KA2 volta, mas o **KA1 continua selado**
- [ ] Soque o **cogumelo** → **os dois** soltam
- [ ] **Destrave o cogumelo** → nada pode voltar sozinho. Se o KA1 religar sozinho, o cogumelo está ligado como NA — refaça
- [ ] Só o **REARME** religa
- [ ] Com um multímetro, confirme **24 V entre KA2-14 e o 0 V** só depois do rearme

> 🎯 **Se todos os seis passarem, o circuito de segurança está correto** — e ele não depende de uma linha de firmware para funcionar.

---

## 31.5 As botoeiras

| Botão | Cor | Blocos | Ligação |
|---|---|---|---|
| **S0 — EMERGÊNCIA** (cogumelo com trava) | Vermelho, fundo amarelo | **2 NF** | Bloco 1 (**11-12**) em **24 V**: série com a bobina do KA1 · Bloco 2 (**21-22**) em **5 V**: pino **D24** |
| **S1 — START** | Verde | **1 NA** (13-14) | Pino **D22**, `INPUT_PULLUP` |
| **S2 — STOP** | **Preto** | **1 NF + 1 NA** | Bloco NF (**11-12**) em **24 V**: série com a bobina do KA2 · Bloco NA (**13-14**) em **5 V**: pino **D23** |
| **S3 — REARME** | **Azul** | **1 NA** (13-14) | Só em **24 V**: refaz o selo do KA1. O Arduino nem precisa saber |

### Lógica de leitura no Arduino (todos com `INPUT_PULLUP`)

| Pino | Contato | Repouso | Acionado | No código |
|---|---|---|---|---|
| D22 (START) | NA | HIGH | **LOW** | `LOW` = pressionado |
| D23 (STOP) | NA | HIGH | **LOW** | `LOW` = pressionado |
| **D24 (EMERG)** | **NF** | **LOW** | **HIGH** | `HIGH` = **emergência acionada** |
| **D25 (24 V presente)** | divisor **22 k / 4,7 k** | LOW | **HIGH** | `HIGH` = **potência disponível** |

### ⚠️ Por que EMERGÊNCIA e STOP são NF

**Princípio à prova de falhas.** Se o fio romper, o terminal soltar ou o contato oxidar, o circuito **abre** — e a máquina **para**. A falha leva ao estado seguro.

Se fossem NA, um fio partido significaria que apertar o botão **não faria nada** — e ninguém perceberia até o dia em que precisasse dele.

O REARME é NA justamente pelo motivo inverso: **um fio partido no rearme impede a máquina de ligar**, que também é o estado seguro.

### Realimentação: o Arduino sabe se há energia

```
   BD-POT (24 V) ──[ 22 kΩ ]──┬──► Arduino D25
                               │
                            [ 4,7 kΩ ]    ══╪══ 100 nF
                               │             │
   0 V ───────────────────────┴─────────────┴──

   Com 24 V:  D25 lê 24 × 4,7/26,7 = 4,22 V  →  HIGH  ✅
   Sem 24 V:  D25 puxado a 0 V               →  LOW
```

> ⚠️ **Os valores mudaram com a adoção do Plano B.** O BD-POT passou de 12 V para **24 V**; com o divisor antigo de 10 k / 4,7 k chegariam **7,67 V** no pino D25 e a entrada do Arduino seria danificada. Montagem detalhada, perna por perna, em [Doc 33 §33.2](33_placa_interface_componentes.md).

Com isso o firmware **sabe** quando a energia foi cortada por hardware — e registra no log qual foi o motivo, mesmo sem ter causado o corte.

---


## 31.6 Tabela de proteções e seletividade

| Nível | Dispositivo | Ajuste | Protege contra | Tempo de atuação |
|---:|---|---|---|---|
| 0 | Disjuntor do quadro da instalação | 20 A (existente no local) | Falha geral da rede | — |
| 1 | **Q0 — Disjuntor 2P** | **6 A curva C** | Curto/sobrecarga na entrada AC e na fonte | 5–10× In instantâneo |
| 2 | **OCP/OVP/SCP interna da fonte** | ~11 A @ 24 V | Sobrecarga da própria fonte | eletrônica, ~µs |
| 3 | **F1** | **10 A** | Curto no ramal R1 — **linha, derivação do P1 e todo o caminho de potência até os BTS** | I²t do fusível |
| 3 | **F2** | 2 A | Curto no ramal R2 (linha, T2, comando) | idem |
| 3 | **F3** | 2 A | Curto no ramal R3 (linha, T3, auxiliares) | idem |
| 4 | **Proteção interna do LM2596 (T2)** | ~3,6 A típ. + shutdown térmico | Sobrecarga e curto no barramento de 5 V | eletrônica, ciclo a ciclo |
| 4 | **Proteção interna do LM2596 (T3)** | idem | Sobrecarga e curto no 12 V auxiliar | idem |
| 4 | **Proteção interna do BTS7960** | limitação de corrente + shutdown térmico | Curto na Peltier ou no PTC | eletrônica |
| ~~5~~ | ~~F4 / F5~~ | — | **Eliminados** — eram os fusíveis de saída do crowbar. O caminho de potência é protegido pelo **F1** | — |
| ~~6~~ | ~~Crowbars Zener~~ | — | **Eliminados** — proteção nativa no CI do LM2596. Ver [Doc 02 §2.6](../camada_0_fundamentos/02_arquitetura_de_energia.md) | — |
| 5 | **KA1 + KA2 + botoeiras** | — | Comando e parada de emergência **em hardware** | ~15 ms |
| 5 | **Pull-down de 10 kΩ no `R_EN`** | — | Acionamento indevido com o Arduino ausente ou resetado | imediato |
| 8 | **Monitoramento de RPM** | rpm = 0 | Fan do dissipador parada → Peltier queima | 1 s |
| 8 | **Diagnóstico IS dos BTS** | limiar calibrado | Atuador desconectado ou em curto | 1 s |
| 9 | **Intertravamento por software** | — | Peltier e PTC ligadas juntas | imediato |

### Verificação de seletividade

> **Seletividade** significa: em uma falha, atua **apenas** o dispositivo mais próximo dela, sem derrubar o resto do sistema.

| Falha simulada | Quem deve atuar | Quem NÃO pode atuar | Verificado? |
|---|---|---|---|
| Curto na saída de 5 V (barramento do Arduino) | **Proteção interna do T2** (limita e/ou desliga por temperatura) | F2, F1, Q0 | ☐ |
| Curto na saída de 12 V auxiliar | **Proteção interna do T3** | F3, F1, Q0 | ☐ |
| Curto na saída de um BTS (Peltier/PTC) | **Proteção interna do BTS**, depois **F1 (10 A)** | F2, F3, Q0 | ☐ |
| Curto entre R1 e 0 V na linha dos postes | **F1 (10 A)** | Q0, OCP da fonte | ☐ |
| Curto entre R2 e 0 V na linha | **F2 (2 A)** | F1, F3, Q0 | ☐ |
| Curto na entrada AC da fonte | **Q0 (6 A curva C)** | Disjuntor do quadro | ☐ |

> ✅ **A seletividade funciona aqui porque as correntes de cada nível são bem separadas:** **10 A no R1** (que conduz 6,0 A), 2 A nos ramais leves (que conduzem menos de 0,8 A), e 6 A curva C na entrada AC (≈ 60 A de disparo instantâneo, contra 2,4 A de operação). Uma falha em um ramal de 2 A jamais chega perto de disparar o Q0.
>
> 📌 **A hierarquia ficou mais curta com a revisão do Plano B, e isso é bom.** Antes havia 5 níveis entre a fonte e a carga térmica (F1 → limite CC do T1 → F5 → crowbar → KA2). Hoje são 3 (**F1 → proteção interna do BTS → KA2**). **Menos níveis significa seletividade mais fácil de provar** — e cada nível a menos é um componente a menos que pode falhar sem ninguém perceber.
>
> 📋 **Coloque esta tabela no relatório com a coluna "Verificado" preenchida.** Testar seletividade é um ensaio real de comissionamento de painel — e demonstra que você entendeu a hierarquia de proteção, não só copiou uma lista de fusíveis.

---

## 31.7 ⚡ Pode pendurar um 0 V no outro? — a conta que decide

**Depende de duas coisas: quanta corrente passa e se aquele fio é referência de alguma medição.** E nas duas o projeto tem casos dos dois tipos.

### A conta

Fio de cobre de **0,5 mm²** tem **0,035 Ω por metro**. Um rabicho de 20 cm pendurando um retorno no outro:

```
   R = 0,035 × 0,20 = 0,007 Ω
   Se por esse trecho passarem os 6 A do BTS:
   V = 6 × 0,007 = 42 mV
```

**42 mV não somem — eles reaparecem como erro em quem dividir aquele fio.**

| Onde esses 42 mV caem | Leitura correta | Erro |
|---|---:|---:|
| Shunt da posição 1 (PI-2) | 0,83 V | **5,1 %** |
| Shunt da posição 2 | 0,46 V | **9,1 %** |
| ADC de 10 bits do Arduino | 4,88 mV/passo | **8,6 contagens** |

> 🔥 **E o pior nem é o tamanho do erro: é que ele PISCA.** Os 42 mV só existem quando a Peltier está conduzindo. Como o BTS chaveia, a leitura da posição sobe e desce no ritmo do PWM. O sistema aprende uma referência errada e passa a ver "variação" onde não há.
>
> Isso se chama **acoplamento por impedância comum**, e é a causa nº 1 de medição ruim em painel.

### A regra

> **Estrela para quem carrega corrente ou serve de referência. Pendurar só entre contatos de lógica, onde alguns milivolts não mudam nada.**

| Retorno | Corrente | Pode pendurar? |
|---|---|---|
| BTS `B−` (×2) | **6 A e 2 A chaveados** | 🔥 **nunca** — é o poluidor |
| BTS `GND` lógica | mA | ❌ é a referência do sinal IS |
| `PI-2 · 0V` | 27 mA **medidos** | 🔥 **nunca** — é a referência da medição |
| Mega `GND3` | ~100 mA | ❌ é a referência do ADC |
| `PI-1 · J1-9` | mA | ❌ referência do divisor e do 1-Wire |
| RTC, DNLCB30, MV-1 | mA | ⚠️ daria, mas há ponto sobrando — não economize |
| **Botões da porta** | µA | ✅ **sim** — e é assim que está feito |

### Por que os botões podem

O limiar lógico do Arduino fica em torno de **2,5 V**. Um deslocamento de 42 mV representa **1,7 %** desse limiar — o pino continua lendo LOW quando tem que ler LOW. Além disso os botões não conduzem corrente contínua: fecham um contato que o pull-up interno de 20 kΩ alimenta com **0,25 mA**.

Por isso os quatro comandos da porta (S0-21, S1-13, S2-13 e SA1-13) dividem **um** fio de 0 V que cruza a dobradiça e é pontelhado entre os blocos. **Quatro travessias de dobradiça economizadas, sem custo nenhum de precisão.**

### 📐 E não há motivo para economizar

A barra **BD-0V tem 20 pontos** e hoje chegam **13 retornos** declarados. O script `npm run valida:fiacao` reprova se dois fios pedirem o mesmo parafuso — justamente para que a economia não aconteça por descuido.

---

## 31.8 Aterramento

### Os três "terras" do projeto (não confundir)

| Nome | Símbolo | O que é | Onde |
|---|---|---|---|
| **Terra de proteção (PE)** | ⏚ | Condutor verde/amarelo do plugue. Leva corrente de falta ao disjuntor | Só na subestação |
| **Terra funcional / 0 V** | ⏛ | O retorno comum do sistema de 24 V | Toda a maquete |
| **Blindagem** | — | Malha dos cabos de sinal | Câmara → painel |

### Ligação equipotencial (o ponto único)

```
                     PLUGUE (pino terra)
                            │
                  ┌─────────▼──────────┐
                  │  BARRA DE TERRA    │   (dentro da subestação)
                  │        (PE)        │
                  └──┬──────────────┬──┘
                     │              │
      carcaça da ────┘              └──── ⚡ PONTO ÚNICO DE EQUIPOTENCIALIZAÇÃO
      fonte 24 V                            │
                                            │  fio verde/amarelo 1,5 mm²
                                            │
                                     ┌──────▼──────┐
                                     │  BORNE 0 V  │  (saída da fonte)
                                     └──────┬──────┘
                                            │
                                    ═══════ ▼ ═══════ retorno comum da maquete
                                            │
                                     ┌──────▼───────────┐
                                     │ BLOCO  BD-0V     │  (painel — star ground)
                                     └──────────────────┘
```

### ⚠️ Por que ligar o 0 V ao PE — e por que em UM SÓ ponto

**Por que ligar:**

| Motivo | Explicação |
|---|---|
| **Segurança** | Se a isolação interna da fonte falhar, os 127 V apareceriam no barramento de 24 V. Com o 0 V aterrado, essa falta vira uma **corrente de curto que dispara o Q0** em vez de energizar toda a maquete |
| **Referência definida** | Um sistema flutuante pode assumir qualquer potencial em relação ao ambiente por acoplamento capacitivo — ruído e leituras erráticas |
| **Descarga eletrostática** | Dá caminho para a ESD que a pessoa acumula ao andar sobre a sala e descarrega ao tocar a maquete |

**Por que apenas um ponto:**

Se o 0 V for ligado ao PE em dois lugares, cria-se um **laço de terra**: uma espira fechada de área grande que capta campo magnético e injeta corrente circulante no retorno dos sinais. O resultado prático são leituras de temperatura oscilando, I²C travando e a serial corrompendo. **Um único ponto de ligação, na subestação. Nada mais.**

### Star ground dentro do painel

```
   BTS #1 0V ────┐
   BTS #2 0V ────┤
   Fans 0V    ───┤
   Arduino GND ──┼──►  BLOCO BD-0V (entrada 10 mm²)  ──►  0 V da subestação
   ESP32 GND  ───┤            (ponto único)
     tela GND ──┤
   SD/RTC GND ───┤
   Sensores GND ─┘
```

| Regra | Motivo |
|---|---|
| **Nunca** ligar o 0 V de dois dispositivos diretamente entre si | Cada um deve ter seu próprio caminho até o ponto central |
| O bloco BD-0V tem entrada de **10 mm²** e 8 saídas | Ele conduz a soma de todas as correntes de retorno, e cada dispositivo tem sua própria saída |
| Cabos de retorno de potência (BTS) em **1,5 mm²** | A corrente de 6,0 A precisa de caminho de baixa impedância |
| Retorno de sinal separado do retorno de potência **até o BD-0V** | O retorno dos BTS carrega os pulsos de chaveamento; se compartilhar o fio com o retorno dos sensores, esses pulsos aparecem como ruído na medição |

### Blindagem dos cabos de sinal

| Cabo | Blindagem aterrada em... | Nunca |
|---|---|---|
| I²C (AM2315C) câmara → painel | **Só no painel**, no BD-0V | Nos dois lados |
| 1-Wire (DS18B20) câmara → painel | **Só no painel** | Nos dois lados |
| Sinal de RPM do cooler | Não precisa de blindagem (é digital e robusto) | — |

> Blindagem aterrada nas duas pontas = laço de terra pela malha. Aterrada em uma ponta só = ela funciona como escudo eletrostático sem fechar espira.

---

## 31.9 Tabela de estados do sistema

| Evento | KA1 | KA2 | 24 V nos BTS | `R_EN` | Tela | LED |
|---|---|---|---|---|---|---|
| Painel energizado, antes do REARME | ❌ | ❌ | ❌ ausente | ❌ | "REARMAR" | — |
| **REARME pressionado** | ✅ sela | ✅ | ✅ presente | ❌ | "AGUARD. START" | — |
| **START** (botão ou IHM) | ✅ | ✅ | ✅ | ✅ do modo ativo | "RODANDO" | 🟢 RUN |
| Modo frio ativo | ✅ | ✅ | ✅ | ✅ BTS #1 | "FRIO — 5,2 °C" | 🟢 + 🔵 |
| Modo quente ativo | ✅ | ✅ | ✅ | ✅ BTS #2 | "QUENTE — 38 °C" | 🟢 + 🟡 |
| **STOP físico** | ✅ segue selado | ❌ **abre em HW** | ❌ **cortado em HW** | ❌ | "PARADO" | — |
| STOP solto | ✅ | ✅ volta | ✅ volta | ❌ (firmware trava) | "AGUARD. START" | — |
| **STOP pela IHM** | ✅ | ✅ | ✅ | ❌ os dois baixos | "PARADO" | — |
| **EMERGÊNCIA acionada** | ❌ **selo perdido** | ❌ | ❌ **cortado em HW** | ❌ | "EMERGENCIA" | 🔴 FAULT |
| **Cogumelo destravado** | ❌ **continua caído** | ❌ | ❌ **continua cortado** | ❌ | "REARMAR" | 🔴 FAULT |
| **REARME após emergência** | ✅ sela | ✅ | ✅ volta | ❌ | "AGUARD. START" | — |
| **Trip por RPM = 0** | ✅ | ✅ | ✅ | ❌ **cortado** | "FALHA FAN" | 🔴 FAULT |
| **Arduino trava** | ✅ | ✅ | ✅ | ❌ (watchdog + pull-down) | reinicia | — |
| **Saída do Arduino travada** | ✅ | STOP corta enquanto pressionado | — | travado | — | — |
| **↳ solução definitiva** | ❌ **EMERGÊNCIA trava tudo** | ❌ | ❌ | ❌ | "EMERGENCIA" | 🔴 |

> ⚠️ Em **todos** os casos de desligamento, é obrigatório um **novo START manual**. O sistema nunca religa sozinho.

---

## 31.10 Ensaios de segurança (obrigatórios antes da apresentação)

| # | Ensaio | Procedimento | Resultado esperado |
|---:|---|---|---|
| 1 | **START pela IHM** | Configurar e apertar INICIAR na tela | O processo começa sem tocar no painel |
| 2 | **STOP nos dois lugares** | Parar pelo botão físico; reiniciar; parar pela IHM | Os dois funcionam igual |
| 3 | **Emergência em carga** | Com a Peltier em 100 %, socar o cogumelo | Desliga instantaneamente; medir **0 V no BD-POT** |
| 4 | **Não religamento (o ensaio mais importante)** | Acionar a emergência, depois **destravar o cogumelo** e medir o BD-POT | **0 V.** A energia NÃO pode voltar ao destravar |
| 5 | **Rearme** | Apertar o botão azul **REARME** | O KA1 sela, o **24 V** volta — mas o processo **continua parado** |
| 5b | **Rearme não inicia** | Após o REARME, medir o `R_EN` dos dois drivers | Continua em 0 V até alguém dar START |
| 6 | **Fio partido (fail-safe)** | Desconectar um fio do bloco NF de 24 V da **emergência** | O KA1 abre e a potência cai |
| 6b | **STOP em hardware** | Com o Arduino DESLIGADO e o KA1 selado, apertar o STOP | O KA2 abre e o BD-POT vai a 0 V |
| 6c | **Saída travada** | Forçar `R_EN = HIGH` num sketch de teste e apertar STOP | A potência cai mesmo com a saída travada |
| 7 | **Trip do software** | Com a Peltier ligada, parar a fan externa com o dedo (cuidado!) | Desliga em ≤ 2 s, LED FAULT acende |
| 7b | **Watchdog** | Gravar um sketch com um `while(1);` proposital dentro do loop | O Mega reseta em ~2 s e a saída cai |
| 7c | **Pull-down do `R_EN`** | Com o Arduino DESLIGADO, medir a tensão em cada `R_EN` | Deve ser ~0 V, nunca flutuante |
| 8 | **Queda de energia** | Desligar a chave rotativa e religar | Sistema volta em "AGUARD. START", **não** rodando |
| 9 | **Continuidade do PE** | Multímetro: pino terra do plugue → carcaça da fonte | < 1 Ω |
| 10 | **Ligação única 0 V–PE** | Medir resistência 0 V → PE no painel e desligar o jumper da subestação | Deve subir para MΩ (prova que só existe uma ligação) |

> 📋 **Registre os 10 ensaios com foto ou vídeo.** É material excelente para a apresentação e comprova que o projeto foi comissionado, não só montado.

---

## 31.11 ✅ Checklist de aceitação

- [ ] **KA1 · relé de interface 24 Vcc, 2 contatos** instalado (selo + saída)
- [ ] **KA2 · relé de interface 24 Vcc, contato de ≥ 10 A** instalado
- [ ] Emergência (bloco NF de 24 V) **em série com a bobina do KA1**
- [ ] REARME (NA) e contato de selo do KA1 **em paralelo**
- [ ] STOP (bloco NF de 24 V) **em série com a bobina do KA2**
- [ ] Contato do KA2 entre o prensa-cabo de entrada (24 V do P1) e o BD-POT
- [ ] **Botão azul de REARME** instalado e etiquetado
- [ ] S0 com **2 blocos NF** · S1 com **1 NA** · S2 com **1 NF + 1 NA** · S3 com **1 NA**
- [ ] **Pull-down de 10 kΩ** em cada `R_EN` dos BTS7960
- [ ] Divisor **22 k / 4,7 k** do BD-POT (24 V) para o pino D25 — medir **4,2 V**. ⚠️ Os resistores ficam na **placa PI-1**, não no meio do cabo ([Doc 33](33_placa_interface_componentes.md))
- [ ] **Watchdog habilitado** no firmware e testado
- [ ] Ligação **única** 0 V ↔ PE, na subestação
- [ ] Bloco **BD-0V** instalado (entrada 10 mm², 8 saídas); todos os retornos convergindo nele
- [ ] Blindagens aterradas **só no painel**
- [ ] Tabela de seletividade (§31.4) preenchida e verificada
- [ ] **10 ensaios de segurança (§31.7) aprovados e registrados**

---

📄 **Anterior:** [Doc 30 — Força e Distribuição](30_forca_e_distribuicao.md) · **Próximo:** [Doc 32 — Sinais e Sensores](32_sinais_e_sensores.md)
