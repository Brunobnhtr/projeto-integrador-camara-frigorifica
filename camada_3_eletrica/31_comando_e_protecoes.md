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

### 🔧 Na prática, o selo é um pedacinho de fio de 4 cm

No esquema o selo é uma linha bonita. Na base do relé ele é a coisa mais simples que existe: **um jumper entre dois parafusos do próprio KA1.**

| Fio | De | Para | O que é |
|---|---|---|---|
| **C6** ⭐ | KA1 · **24** (fileira de cima, pino 8) | KA1 · **A1** (fileira de baixo, pino 13) | **o selo** — o contato NA realimentando a própria bobina |
| C5 | KA1 · **11** (baixo, pino 9) | KA1 · **21** (cima, pino 12) | ponte do nó CMD, o comum dos dois contatos |

⚠️ **Os dois vão de uma fileira à outra, então o jumper contorna o relé por fora.** Não passe o fio por baixo do corpo dele nem por trás da base: além de não caber, você não consegue mais conferir se está no parafuso certo. Corte uns 4 cm, faça as duas pontas com terminal ilhós, e deixe a barriga do fio para fora do lado direito.

> 📐 **No aplicativo** as pontes são desenhadas contornando o componente, e não em linha reta pelo meio dele. Isso não é enfeite: **desenhadas retas, elas ficavam escondidas atrás do relé**, e o KA1 aparecia com os bornes 21 e 24 amarelos e aparentemente soltos — inclusive o 24, que é justamente o selo. Hoje o `npm run valida` reprova qualquer fio que passe por dentro de um componente, incluindo o próprio.

### Por que dois relés

Porque eles têm **naturezas diferentes**, e misturá-las num componente só apagaria a fronteira mais importante do painel:

| | **KA1 — segurança** | **KA2 — processo** |
|---|---|---|
| Quem o comanda | **botoeiras**: S0 derruba, S3 sela | botoeiras (S2 derruba, S1 sela) **+ o firmware, pelo KA3** |
| O Arduino alcança? | ❌ **nunca** — nem um fio | ✅ pelo `D27`, e **só em série** |
| Quando cai | emergência | trip, STOP, fim de ensaio |
| Quantas vezes por ensaio | zero ou uma | algumas |
| O que ele protege | **a pessoa** | **a pastilha** |

> 🎯 **Um relé só significaria dar ao software um caminho até a cadeia de emergência.** Com dois, o KA1 fica inteiramente fora do alcance do Arduino, e o KA2 é a única coisa que o firmware pode derrubar. **A separação física é o que torna a frase "o software não fura a emergência" verificável com um multímetro**, em vez de ser uma promessa de código.

> ### 🔧 Revisão — a razão antiga não vale mais, e é importante saber por quê
>
> Este documento dizia: *"eles precisam estar em estados diferentes ao mesmo tempo — com o STOP apertado, o KA1 continua ligado e o KA2 desligado."* Era verdade **enquanto o bloco NF de 24 V do STOP estava em série com a bobina do KA2**.
>
> **Esse bloco foi removido.** O STOP passou a ser um comando de software puro: um bloco NA de 5 V que avisa o `D23`, e nada mais. Com isso o KA2 deixou de responder a qualquer botoeira — e, por um instante, ficou sem função própria, apenas copiando o KA1.
>
> **Hoje a divisão é por QUEM COMANDA**, e não por *quem fica ligado quando*: o KA1 responde só à emergência e ao rearme; o KA2 responde ao STOP, ao START verde **e ao firmware, através do KA3** ([§31.13](#3113--o-veto-do-firmware-sobre-a-potência-ka3)). É uma fronteira mais limpa que a anterior, e mais fácil de defender.
>
> 📌 **O KA3 é o único ponto em que o software toca a potência, e ele está em SÉRIE.** Em série ele só pode derrubar; jamais segurar contra uma botoeira.

> ### ⭐ O selo — o truque mais bonito da eletrotécnica clássica, agora nos DOIS relés
>
> O problema: o botão é de pulso. Você solta e ele abre. Como manter a máquina ligada?
>
> A solução: **o relé segura a si mesmo.**
>
> ```
>   KA1 ──[ S2 · STOP NF ]──┬──[ S1 · START NA ]──┐
>                            └──── KA2 · SELO ─────┤
>                                        A1 [ KA2 ] A2 ──► 0 V
> ```
>
> Aperta o **verde** → o KA2 liga → ao ligar, fecha um contato próprio em **paralelo** com o botão → você solta e ele continua se alimentando sozinho.
>
> Aperta o **preto** → o NF abre → a bobina cai → **o contato de selo abre junto** → você solta, mas o selo já está aberto e o verde também. **Fica caído.** Só um novo START religa.
>
> 🎯 **O "apertar uma vez" não é propriedade do botão: é o selo que se perde e não se refaz sozinho.** Memória sem uma linha de código.
>
> ⚠️ **E é por isso que o botão verde teve de voltar.** Um STOP em hardware que **retém** exige um selo, e um selo exige um START físico para ser refeito. **Os dois andam sempre juntos** — não existe metade desse circuito. Foi essa dependência que fez a versão sem botão verde ter um STOP que só cortava enquanto pressionado.

> ### ⚖️ O preço, declarado
>
> | Você ganha | Você paga |
> |---|---|
> | STOP que corta **e retém** em hardware, com o firmware em qualquer estado | O botão verde volta: +1 botoeira, +1 bloco, +3 fios |
> | Um caminho de parada independente do software, sem usar o cogumelo | ⛔ **A IHM não rearma a potência.** Depois de um STOP no botão preto, alguém tem de apertar o verde |
> | O trip do firmware também passa a **reter** (§31.13) | Volta o risco de trocar os dois blocos do S2 (§31.5) |
>
> 📌 **A IHM continua parando e reiniciando o ensaio normalmente** — ela só não refaz o selo do KA2. Uma parada pela tela é **Categoria 2**: derruba o `R_EN` e mantém a potência armada, então o `INICIAR` da tela volta a rodar sem ninguém sair do lugar.

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

> 🎯 **O Arduino não tem nenhum pino ligado ao KA1** — e essa é a regra que não se negocia. Se o software pudesse refazer o selo, a emergência dependeria dele, e aí não seria emergência.
>
> 🔧 **No KA2 ele tem, e apenas em série:** o `D27` comanda o **KA3**, um relé de 8 pinos no caminho da bobina ([§31.13](#3113--o-veto-do-firmware-sobre-a-potência-ka3)). Isso lhe dá poder de **derrubar** a potência, nunca de segurá-la contra uma botoeira. Ele continua **lendo** pelo `D25` se a potência chegou.

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
╔═══ ESTÁGIO 2 · PROCESSO ═════ selo próprio · STOP retém · START verde ═════╗
║                                                                            ║
║   KA1 ──[ S2 · STOP NF ]──┬──[ S1 · START NA ]──┐                          ║
║                            └──── KA2 · SELO ─────┤                         ║
║                                       A1 [ KA2 ] A2 ──[ KA3 ]── 0 V        ║
║                                                          ▲                 ║
║                                               Mega · D27 ─┘  o veto        ║
╚════════════════════════════════════════════════════════════════════════════╝
                    │ KA2 · contato de potência (≥ 10 A)
                    ▼
   P1 (24 V) ──► KA2 ──► BD-POT ──► BTS7960 #1 e #2
```

### O que acontece em cada situação

| Situação | KA1 | KA2 | 24 V nos BTS | Como volta |
|---|---|---|---|---|
| Operação normal | ✅ selado | ✅ selado | ✅ presente | — |
| **STOP no botão preto** | ✅ segue selado | ❌ **selo perdido, em HW** | ❌ **cortado** | ⭐ **botão VERDE** |
| **STOP pela IHM / MQTT** | ✅ | ✅ segue selado | ✅ presente | **pela IHM** — parada Categoria 2 |
| **Trip** (fan parada, sobrecorrente) | ✅ | ❌ o **KA3** derruba o selo | ❌ **cortado** | Reconhecer + **botão VERDE** |
| **EMERGÊNCIA** | ❌ **selo perdido** | ❌ | ❌ **cortado em HW** | — |
| **Cogumelo destravado** | ❌ **continua caído** | ❌ | ❌ **continua cortado** | **REARME azul**, depois o verde |
| **Arduino morre ou reseta** | ✅ | ❌ o pull-down abre o KA3 | ❌ **cortado** | **botão VERDE**, depois de ele voltar |

> ### ⭐ Dois selos, duas botoeiras de rearme — e eles não são intercambiáveis
>
> | | **Selo do KA1** | **Selo do KA2** |
> |---|---|---|
> | Cai com | **EMERGÊNCIA** | **STOP** |
> | Refeito por | **REARME azul** | **START verde** |
> | O que protege | a pessoa | o processo |
> | Categoria IEC 60204-1 | **0** — corte imediato | **1** — parada controlada |
>
> 🔥 **Trocar os dois na montagem é o erro mais caro possível neste painel:** o STOP passaria a exigir rearme e **a emergência religaria com o botão verde**. Confira a etiqueta de cada fio antes de energizar.

> ### 🎯 As três paradas, e por que elas são diferentes de propósito
>
> | Origem | O que cai | Categoria | Como volta |
> |---|---|---|---|
> | **Botão preto** (porta) | O selo do KA2, **em hardware** | 1 | Botão verde, na porta |
> | **IHM / MQTT** | Só o `R_EN`. A potência segue armada | 2 | Pela própria IHM |
> | **Trip** | O KA3 derruba o selo do KA2 | 1 | Botão verde + reconhecimento |
>
> **Não é inconsistência, é a norma.** Uma parada operacional pela tela não precisa obrigar ninguém a caminhar até o painel; uma parada por **falha**, sim — é o que garante que alguém olhe a máquina antes de religá-la. E o botão físico corta em hardware porque é o único que precisa funcionar com o firmware em qualquer estado.

### O componente: o mesmo relé do resto do painel

⭐ **O MESMO RELÉ DO KA1 E DO KA2** — 8 pinos, bobina **24 Vcc**, base PTF08A no trilho DIN. Não é módulo de Arduino, não é placa azul, não fica pendurado em canto nenhum: é relé de painel, parafusado no trilho, do lado do KA2.

| Ref | Peça | Onde | Preço |
|---|---|---|---|
| **KA3** | Relé **8 pinos, bobina 24 Vcc**, 2 contatos reversíveis 10 A + base PTF08A | trilho 2, ao lado do KA4 | ~R$ 20 |
| **Q3** | MOSFET **2N7000** — o driver, entre o `A2` da bobina e o 0 V | termorretrátil na própria base | R$ 0,60 |
| **R10** | Resistor **10 kΩ** do gate do Q3 ao 0 V | dentro do mesmo termorretrátil | R$ 0,10 |
| **D3** | Diodo **1N4007** sobre a bobina do KA3 — catodo no `A1` | nos bornes `A1`/`A2` | R$ 0,20 |
| **D1** | Diodo **1N4007** sobre a bobina do **KA2** | nos bornes `A1`/`A2` do KA2 | R$ 0,20 |

**Buscar:** `relé 8 pinos 24v 10a base din` · `JQX-13F 24VDC` · `LY2N 24VDC` — exatamente o mesmo anúncio do KA1/KA2.

> ### 🔄 Por que saiu o módulo azul de 5 V
>
> A primeira versão usava um **módulo de relé de 1 canal, 5 V, optoacoplado**, dentro de uma caixa DIN de 4 módulos. Funcionava, e o argumento era bom: zero solda e um LED que mostra o veto sem instrumento. Cinco coisas mudaram a conta:
>
> | | Módulo azul de 5 V | **Relé de 8 pinos (escolhido)** |
> |---|---|---|
> | Modelos de relé no painel | **dois** (8 pinos + módulo) | ⭐ **um só** — uma reserva cobre os quatro |
> | Contatos disponíveis | 1 reversível | ⭐ **2 reversíveis** — e é o segundo que dá o `NF` ao KA4 |
> | Consumo | **130 mA no BD-5V** (os dois) | ~37 mA cada no BD-24V, que tinha folga |
> | Montagem | caixa de plástico de 70 mm no trilho 2 | ⭐ direto no trilho, como o resto do painel |
> | Solda | nenhuma | 3 peças num termorretrátil por relé |
> | Estado visível | LED vermelho | o clique e o próprio KA2 — ou um sinaleiro no contato de reserva |
>
> 🎯 **O que decidiu foi o segundo contato.** O KA4 precisa de um `NF` para que o Arduino morto deixe a ventoinha do radiador **girando** (§31.14), e o módulo de 1 canal só tem um contato — gastá-lo no `NF` deixaria o relé sem reserva nenhuma. O de 8 pinos resolve os dois e ainda sobra.
>
> 📌 **E a padronização vale mais do que parece numa maquete que viaja.** Um único relé sobressalente na caixa de ferramentas cobre KA1, KA2, KA3 e KA4. Com dois modelos diferentes, são duas reservas — e a que faltar é sempre a do relé que queimou.

> ### ⚙️ As quatro coisas que precisam estar certas
>
> | # | O quê | Por quê |
> |---|---|---|
> | 1 | **Contato `11`→`14` (NA)**, nunca o `12` (NF) | Relé solto = contato aberto = potência cortada. No `NF` um Arduino desligado **armaria** a potência. ⚠ **O KA4 faz o contrário de propósito** — §31.14 |
> | 2 | **R10 (10 kΩ) colado ao gate**, dentro do termorretrátil | Fio do `D27` rompido → gate em 0 V → potência cortada. Fosse o R10 na PI-1, este trecho ficaria alto-impedante e o KA3 poderia atracar por ruído |
> | 3 | **D3 na bobina, catodo no `A1`** | Sem ele o Q3 morre no primeiro desligamento: 650 Ω de bobina jogam centenas de volts no dreno, contra os 60 V do 2N7000 |
> | 4 | **Bobina de 24 V**, confirmada no corpo do relé | O mesmo anúncio vende 12 e 24 V. Um de 12 V atraca nos 24 V do BD-24V e queima a bobina em minutos |
>
> 🔎 **Ensaio obrigatório, 30 segundos:** painel de comando alimentado, **fio do `D27` desconectado** → KA3 desatracado, sem clique, e continuidade **aberta** entre `11` e `14`. Se estiver fechado, o painel arma a potência sozinha no boot.

> ### 📌 Não há isolação galânica aqui — e não precisa haver
>
> Com o módulo azul dava para dizer "tem optoacoplador", e valia a ressalva de que optoacoplador não é isolação quando o `DC−` partilha o 0 V do Arduino. Com o 2N7000 a conversa fica mais honesta: **a fonte do Q3 está no mesmo 0 V do Mega, e ponto**. O gate é comandado por tensão, referenciada nesse 0 V.
>
> **E isso não é perda nenhuma**, porque a isolação de verdade já estava do outro lado: **o contato do KA3 é seco**. Entre o circuito do Arduino e a bobina de 24 V do KA2 há um entreferro de ar, que é melhor isolação do que qualquer optoacoplador de R$ 0,80. O painel tem um ponto único de terra por projeto (§31.5), então do lado do sinal não há diferença de potencial para isolar.
>
> 🎓 **Diga isso na defesa.** "Onde está a isolação do seu comando?" — no contato do relé, não no driver. Saber apontar a barreira certa é o que separa quem projetou de quem copiou.

> ### ⚙️ As quatro coisas que precisam estar certas
>
> | # | O quê | Por quê |
> |---|---|---|
> | 1 | **Jumper em `H`** (gatilho alto) | `digitalWrite(pino, HIGH)` fecha o relé — mesma convenção dos jumpers do MV-1. Em `L` a lógica inverte e o firmware vira armadilha |
> | 2 | **Contato `COM` + `NO`**, nunca o `NC` | Módulo sem energia = contato aberto = potência cortada. No `NC` um Arduino desligado **armaria** a potência |
> | 3 | **Resistor de 10 kΩ do `IN` ao 0 V** | O anúncio promete tolerância a falha, e o LED do optoacoplador de fato precisa de corrente. O resistor torna isso **medível** em vez de confiado |
> | 4 | **Bobina de 5 V**, confirmada no corpo do relé | Estes anúncios vendem 5 / 12 / 24 V na mesma página e **a foto costuma ser da versão de 24 V** |
>
> 🔎 **Ensaio obrigatório, 30 segundos:** módulo alimentado, **fio do Arduino desconectado** → relé desligado, LED vermelho apagado, sem clique. Se fechar, o painel arma a potência sozinho no boot.

> ### 📌 A isolação é nominal, não galvânica — e vale saber a diferença
>
> O módulo tem **três bornes de entrada**: `DC+`, `DC−` e `IN`. Com só três, o `DC−` **é** a referência do sinal — ele partilha o 0 V do Arduino. O optoacoplador está lá e é real, mas o que ele entrega é **imunidade a ruído** (a entrada é acionada por *corrente* através de um LED, não por tensão num pino de transistor), **não separação de terras**.
>
> Isolação de verdade exigiria a versão de **4 pinos**, com `JD-VCC` e jumper removível, e duas fontes separadas. **Aqui não faz falta:** o painel tem um ponto único de terra por projeto (§31.8), então não há diferença de potencial para isolar.
>
> 🎓 **Diga isso na defesa em vez de repetir o anúncio.** Saber que "tem optoacoplador" não é o mesmo que "está isolado" é exatamente o tipo de leitura crítica de folha de dados que a banca procura.

### Por que relé **e** MOSFET, e não um ou outro

Esta é a pergunta que a banca faz, e a resposta é que os dois fazem serviços diferentes — não competem.

| | O que o **Q3** faz | O que o **KA3** faz |
|---|---|---|
| Papel | adapta nível: 5 V do Mega → bobina de 24 V | isola e chaveia sem lado alto/baixo |
| Corrente | 37 mA, contínuos | 37 mA no contato (0,37 % dos 10 A) |
| Desgaste | nenhum | contato mecânico — e ver a nota abaixo |
| Podia fazer o serviço do outro? | ❌ não chaveia lado alto sem canal P | ❌ não pode ser comandado direto por um pino de 5 V |

**Um pino do Mega não aciona uma bobina de 24 V** — são 37 mA em 24 V contra um pino que dá 20 mA em 5 V. Alguma coisa tem de estar no meio, e essa é a função clássica do **relé de interposição** entre CLP e contator: o Q3 é a versão de três centavos dela.

E o contato do relé tem duas propriedades que nenhum semicondutor barato entrega:

1. **Não tem lado alto nem lado baixo.** Um MOSFET canal N só sabe puxar para 0 V. É por isso que o MV-1 não podia comandar as ventoinhas do radiador (§31.14) e por isso que o KA4 existe. O contato do KA3, do mesmo jeito, pode ficar em qualquer perna da bobina do KA2.
2. **Falha aberto, e não em curto.** O modo de falha típico de MOSFET de potência é dreno-fonte em curto — exatamente o que acontece com o BTS7960 e o motivo de o KA3 existir. Pendurar o veto num segundo semicondutor seria repetir o problema que ele foi criado para resolver.

> ⚠️ **E o desgaste não é objeção aqui:** o KA3 atua num trip, num boot e pouco mais — talvez cinco vezes por dia. A vida elétrica típica é de **100.000 operações**. São décadas. E o contato dele conduz **37 mA**, não 10 A: nessa corrente não há erosão de contato para falar. Se ele fosse chavear o PWM, como o KA2 não pode, a conta seria outra (§31.0).

> 📌 **O Q3 chaveia o lado do 0 V da bobina, e isso é de propósito.** Canal N só sabe fazer isso, e aqui não custa nada: a bobina do KA3 é um circuito nosso, criado agora, sem tacômetro nem referência pendurada nela. O caso em que chavear o negativo quebra alguma coisa é o das ventoinhas de 3 fios — e é justamente lá que entra o **contato** do KA4, não um MOSFET.

### Cálculo — só para o relatório

```
   Corrente que o contato do KA3 conduz:
      I = 24 V / 650 Ω (bobina do KA2) = 37 mA
      Contato nominal: 10 A em 30 Vcc  →  usa 0,37 % da capacidade ✅

   Corrente que o pino D27 fornece:
      ~0 — gate de MOSFET é capacitivo, só pede pico de carga  ✅
      (era 5 mA no LED do optoacoplador do módulo antigo)

   Corrente que o Q3 chaveia (a bobina do próprio KA3):
      I = 24 V / 650 Ω = 37 mA   ·  2N7000 aguenta 200 mA  ✅
      Rds(on) ~5 Ω a Vgs=5 V  →  queda de 0,19 V, nada de calor

   Consumo dos DOIS relés, agora no barramento de 24 V:
      2 × 37 mA = 74 mA no BD-24V
      ⭐ e 130 mA SAÍRAM do BD-5V, que ganhou a primeira reserva real
```

### O que muda no comportamento

| Situação | Antes | Depois |
|---|---|---|
| **STOP apertado e solto** | 24 V voltam; a parada vira responsabilidade do `R_EN` | ⭐ **24 V continuam cortados** até um START |
| Para religar depois do STOP | novo START (mas o barramento já estava armado) | novo START, painel **ou** IHM — **sem rearme** |
| STOP pela IHM / MQTT | só desabilitava drivers | ⭐ **corta os 24 V de verdade** |
| Trip por fan parada | `R_EN = LOW` | ⭐ `R_EN = LOW` **+ KA2 abre** |
| BTS com MOSFET em curto | ⚠️ só o cogumelo resolvia | ⭐ **o firmware resolve** |
| Barramento armado | do REARME até o fim do dia | ⭐ **só durante o ensaio** |
| Parada da IEC 60204-1 | Categoria 2 | ⭐ **Categoria 1** (rampa, depois corte) |
| **EMERGÊNCIA** | corta e trava em hardware | **idêntica — o KA3 não a toca** |

### ⚠️ O modo degradado, e por que ele é aceitável

Dois fios novos podem falhar. Vale saber para onde cada falha leva:

| Falha | Consequência | Gravidade |
|---|---|---|
| **Fio do `D23` rompido** (bloco NA do STOP) | O firmware não vê o toque e não para o PID. **Mas o bloco NF de 24 V continua derrubando o selo do KA2** — a potência cai igual | ⚠️ degrada, não fica perigoso |
| **Fio do `D27` rompido** ou **Arduino desligado** | O R10 leva o `IN` a 0 V → KA3 aberto → a potência **nunca é armada** | ✅ **fail-safe** — a máquina não liga |
| **Contato do KA3 soldado** (falha de relé) | O veto do firmware some. O STOP, o cogumelo e o selo do KA2 continuam intactos | ⚠️ volta ao painel sem KA3, que já era aceitável |
| **D1 invertido** | Curto na bobina, **F2 (2 A) abre** | ✅ detectado na montagem |
| **Emergência** | Nenhuma dessas falhas a afeta — o KA1 e o S0 estão fora deste circuito | ✅ **intacta** |

> 🎯 **A propriedade que fecha o argumento:** nenhuma falha do KA3 deixa o painel **pior** do que ele era antes de o KA3 existir. As falhas ou levam ao estado seguro, ou degradam para o circuito original — que já era aceitável. **É essa a assinatura de uma melhoria bem colocada em segurança:** ela só pode somar.

### 🔎 Comissionamento do KA3 — 3 minutos, antes de energizar a potência

Com o BD-POT **desconectado** e só a cadeia de comando alimentada:

- [ ] O fio do KA2 · `A2` está no **`11`** do KA3 e o do BD-0V no **`14` (NA)** — não no `12`
- [ ] O corpo do relé diz **24VDC** (o mesmo anúncio vende 12 V)
- [ ] **Sem o Arduino ligado**, medir o gate do Q3 contra o 0 V → **0 V** (o R10 trabalhando)
- [ ] Ohmímetro entre o gate e o 0 V → **~10 kΩ**
- [ ] **Sem o Arduino**, continuidade entre `11` e `14` → **aberta**, relé mudo
- [ ] Ligar o Arduino e forçar `digitalWrite(27, HIGH)` → **clique**, e `11`–`14` fecha
- [ ] Com o KA1 selado e o STOP solto, apertar o **verde** → o KA2 atraca
- [ ] Forçar `digitalWrite(27, LOW)` → o KA2 solta **e não volta** quando o pino voltar a HIGH ⭐ *(é o selo do KA2 trabalhando — só o verde religa)*
- [ ] ⭐ **E a tela acusa `CORTE_FALHOU`?** Forçar `LOW` com o KA3 propositalmente em curto (uma ponte entre `11` e `14`) tem de fazer o alerta aparecer em ~150 ms. É o ensaio da conferência pelo `D25` ([Doc 40 §40.7](../camada_4_programacao/40_firmware_arduino.md))
- [ ] Teste de diodo entre `A1` e `A2` do **KA2** e do **KA3**: conduz num sentido só

> 📋 **Filme o ensaio 6d.** Apertar o STOP uma vez, soltar, e mostrar o multímetro cravado em 0 V no BD-POT é a demonstração mais direta de que o painel tem selo — e é o tipo de evidência que vale mais que três páginas de texto na apresentação.

---

## 31.14 ⭐ O KA4 — chavear o lado certo da ventoinha

> Mesma família de problema do §31.13, e **o mesmo componente resolve**. Lá o firmware não conseguia *cortar* a potência; aqui não conseguia *desligar* a ventoinha do radiador.

### O problema em uma frase

**O MV-1 chaveia o negativo, e o tacômetro da ventoinha é referenciado nesse mesmo negativo.** Corte o canal e o preto sobe para perto de 12 V, empurrando corrente pelo diodo de proteção do `D3` do Mega. Pior: antes de estragar nada, a leitura já mente — canal desligado lê "ventoinha parada", que é exatamente o alarme que existe para salvar a pastilha.

A decisão anterior foi tirar o comando e deixá-las **sempre ligadas**. Seguro, e com dois custos:

| Custo | Quanto |
|---|---|
| Ventilação sem ninguém para resfriar | **~5 W** girando o dia inteiro com o painel energizado |
| **Fuga térmica durante o aquecimento** | **~2,5 W** — o dissipador ventilado puxa calor da câmara **através da pastilha desligada**, contra o próprio PTC |

### A correção: chavear o positivo — e pelo contato **NF**

```
                      ⭐ NF (12), não NA — fechado com a bobina SOLTA
                            │
   BD-AUX · O2 ──► 11 │ KA4 │ 12 ──► X5 ──► ventoinhas do radiador +
      (+12 V)             └──┬──┘               (2 em paralelo, 0,36 A)
                             │
          BD-24V · O6 ──► A1 [bobina 24 V] A2 ──► dreno do Q4
                             │  └─ D4 (1N4007), catodo no A1
                       Mega · D30 ──► gate do Q4 (2N7000)
                                        └─[ R11 · 10 kΩ ]── 0 V

   X6 ── ventoinhas − ──► BD-0V · R20      ⭐ NUNCA chaveado
```

> ### 🔥 O contato é o NF, e essa é a diferença mais importante entre o KA4 e o KA3
>
> A primeira versão deste comando mandava usar o `NO`, copiando a regra do §31.13. **Estava errada**, e o erro era de sinal — os dois relés têm estados seguros **opostos**:
>
> | | Desenergizado significa | É o estado seguro? |
> |---|---|---|
> | **KA3** | contato `NA` abre → potência cortada | ✅ |
> | **KA4 no `NA`** *(como estava)* | contato abre → **ventoinha para com o dissipador a 60 °C** | ❌ |
> | **KA4 no `NF`** *(como ficou)* | contato fecha → **ventoinha gira** | ✅ |
>
> Com o `NF`, **Arduino morto, fio do `D30` rompido, R11 solto ou BD-5V caído** deixam as ventoinhas do radiador **girando** — que é exatamente o que um dissipador quente precisa. E o KA3, no mesmo instante, já cortou a potência: **primeiro para de gerar calor, depois continua tirando o que sobrou.** É a ordem certa, e ela sai de graça.
>
> 🎯 **O argumento que fecha é o mesmo do §31.13, virado do avesso.** Lá: nenhuma falha do KA3 deixa o painel pior do que era antes de ele existir. Aqui: com o `NF`, o **pior caso vira o comportamento antigo do projeto** — ventoinha sempre ligada, que custava ~5 W e nunca custou uma pastilha. Uma correção que troca o pior caso pelo estado que você já aceitava não tem contra.
>
> ⚠️ **A lógica do `D30` fica invertida em relação à do `D27`, e isso é deliberado:** `HIGH` atraca a bobina, o `NF` abre e as ventoinhas **param**. Existe **uma única função** no firmware que escreve neste pino, e a inversão mora só lá dentro ([Doc 40 §40.10](../camada_4_programacao/40_firmware_arduino.md)). Nenhum outro ponto do código toca o `D30` direto — é assim que uma inversão deixa de ser armadilha.
>
> 💸 **O preço, e ele é pequeno:** a bobina fica atracada sempre que as ventoinhas estão **desligadas**, que é a maior parte do tempo. São ~37 mA contínuos no BD-24V.

> ### 🎯 Um contato seco não tem lado alto nem lado baixo
>
> **É essa frase que apaga o problema inteiro.** O MV-1 é um MOSFET canal N: ele só sabe puxar para 0 V, e por isso era obrigado a chavear o negativo. Um contato de relé não tem essa restrição — ele apenas abre e fecha, e você escolhe em que fio pô-lo.
>
> | | Chaveando o **NEGATIVO** (o que quebrou) | **Contato do KA4 no POSITIVO** |
> |---|---|---|
> | O preto da ventoinha, desligada | sobe para ~12 V 🔥 | **fica em 0 V** ✅ |
> | Referência do tacômetro | se mexe | **fixa, sempre** |
> | Sinal no `D3` com ela parada | injeta corrente pelo diodo de proteção | transistor do tacômetro sem alimentação → **coletor aberto** → o pull-up leva o pino a HIGH. Inofensivo |
> | Ventoinha necessária | — | **as de 3 fios que já estão na lista** |
>
> 🔧 **Foi considerado um P-MOSFET (IRF9540N) com o canal 1 do MV-1 servindo de inversor de nível.** Funcionava, custava R$ 3,50 e exigia entender por que um canal P liga com o gate *abaixo* da fonte. **O relé faz o mesmo sem inversor nenhum** — e o canal 1 do MV-1 voltou a ficar livre.

### Os componentes

| Ref | Peça | Onde | Preço |
|---|---|---|---|
| **KA4** | Relé **8 pinos, bobina 24 Vcc** + base PTF08A — **o mesmo do KA1/KA2/KA3** | trilho 2, ao lado do KA3 | ~R$ 20 |
| **Q4** | MOSFET **2N7000** entre o `A2` da bobina e o 0 V | termorretrátil na própria base | R$ 0,60 |
| **R11** | Resistor **10 kΩ** do gate do Q4 ao 0 V | dentro do mesmo termorretrátil | R$ 0,10 |
| **D4** | Diodo **1N4007** sobre a **bobina do KA4** — catodo no `A1` | nos bornes `A1`/`A2` | R$ 0,20 |
| **D2** | Diodo **1N4007** sobre as **ventoinhas**, catodo no **+** | junto às ventoinhas | R$ 0,20 |

⚠️ **NÃO CONFUNDA O D2 COM O D4.** Os dois são 1N4007 e têm funções diferentes: o **D2** grampeia o motor das ventoinhas (carga indutiva, nada mais a segura) e mora lá na câmara; o **D4** grampeia a bobina do relé e mora nos bornes dele, protegendo o Q4.

⭐ **Das quatro regras do §31.13, três valem igual e UMA se inverte:**

| # | §31.13 (KA3) | **§31.14 (KA4)** |
|---|---|---|
| 1 | contato **`NA`** (`11`→`14`) | 🔥 **`NF`** (`11`→`12`) — estado seguro oposto |
| 2 | R10 de 10 kΩ colado ao gate | igual (R11) |
| 3 | diodo na bobina, catodo no `A1` | igual (D4) |
| 4 | bobina de **24 V** confirmada no corpo | igual |

📌 **Os dois relés ficam lado a lado no trilho 2**, e o `A1` de um faz ponte curta até o `A1` do outro: sai **um** fio do BD-24V · O6 para as duas bobinas, e **um** fio da fonte dos dois MOSFET até o BD-0V · R21.

> 📌 **Os dois módulos moram na mesma caixa DIN de 4 módulos**, no trilho 2, com o `DC+` e o `DC−` pontelhados entre eles lá dentro — sai **um** par de fios para o BD-5V e o BD-0V. São 51 × 25,5 mm cada; empilhados cabem nos 70 mm da caixa, e o trilho 2 tinha 94 mm livres.

### Comportamento resultante

```
   ligado  ⟺  a Peltier está resfriando  OU  o dissipador ainda está quente
```

| Situação | Peltier ativa? | Dissipador quente? | Ventoinha |
|---|---|---|---|
| Resfriando | ✅ | — | 🟢 **100 %** |
| Aquecendo com o PTC | ❌ | ❌ | ⚫ **desligada** — acaba a fuga de 2,5 W |
| Pós-ventilação | ❌ | ✅ | 🟢 **100 %** até esfriar |
| Parado e já frio | ❌ | ❌ | ⚫ **desligada** |
| **DS18B20 com o fio solto** | — | ⚠️ **conta como quente** | 🟢 **ligada** — fail-safe |

> 🎯 **A regra só permite desligar quando o sensor confirma que não há calor a tirar.** Não existe estado da máquina — `FALHA`, `EMERGENCIA`, cogumelo socado — em que a ventoinha pare com o dissipador quente. **A condição é sobre temperatura, não sobre estado**, e é daí que vem a segurança.

### 🔎 Comissionamento do KA4

⚠️ **Repare que a primeira linha é o INVERSO da do KA3** — e é esse o ensaio que prova o contato NF.

- [ ] O fio do BD-AUX · O2 está no **`11`** e o do X5 no **`12` (NF)** — **não no `14`**
- [ ] O corpo do relé diz **24VDC**
- [ ] ⭐ **Com o Arduino DESLIGADO, as ventoinhas do radiador GIRAM.** Se estiverem paradas, o fio está no `14` — volte e troque, porque é o fail-safe inteiro que está invertido
- [ ] Ligar o Arduino e forçar `digitalWrite(30, HIGH)` → **clique, e elas PARAM**
- [ ] Forçar `LOW` → **voltam a girar**, e o **preto delas continua em 0 V** — é o ensaio que prova o chaveamento pelo positivo
- [ ] Com elas paradas, medir o `D3` e o `A8` → **~5 V, estáveis**. Tensão no preto significa que o contato está no fio errado
- [ ] Desconectar o DS18B20 com o sistema parado e frio → **as ventoinhas devem LIGAR** ⭐
- [ ] Puxar o fio do `D30` com o ensaio rodando → **elas continuam girando** (o R11 solta a bobina)
- [ ] Teste de diodo entre `A1` e `A2` do KA4: conduz num sentido só

---

## 31.15 ⭐ O diodo da bobina do KA2 — e o preço escondido que ele cobra

> Seção curta, e ela existe porque o **D1 protege um componente prejudicando outro**. Saber disso é exatamente o tipo de leitura que separa montar de projetar.

### O que o D1 faz de bom

O **D1** (1N4007, catodo no `A1`) fica em antiparalelo com a bobina do KA2. Quando o contato do KA3 abre, o campo magnético da bobina colapsa e induz uma tensão reversa de **centenas de volts**. Sem o diodo, esse pico aparece **no contato do KA3** e abre arco. Contato que arca, pita; contato que pita, solda — e um KA3 soldado é o veto do firmware perdido em silêncio ([§31.13](#3113--o-veto-do-firmware-sobre-a-potência-ka3)). O diodo grampeia o pico em ~24,7 V e o contato interrompe limpo.

**Isso está certo e o D1 fica.** O que segue é o outro lado da conta.

### O que ele cobra em troca

Um diodo puro em antiparalelo faz a corrente da bobina circular em roda-livre por um caminho de resistência quase nula. O campo **demora a colapsar** — e o tempo de desatracamento do relé sobe tipicamente de **2 a 5 vezes**.

```
   sem diodo   →  ~8 ms para desatracar   · pico de centenas de V no KA3
   com diodo   →  ~25 ms                  · pico limitado a ~24,7 V
```

Relé que desatraca devagar tem **contato que se separa devagar**. E contato que se separa devagar **arca por mais tempo**.

> 🔥 **E aqui isso importa mais do que o normal, porque o KA2 interrompe 6 A em CORRENTE CONTÍNUA.** Em CA o arco se apaga sozinho na passagem por zero, 120 vezes por segundo. Em CC não há passagem por zero: o arco só morre quando o entreferro fica grande o bastante. É o mesmo motivo pelo qual o [Doc 30 §30.2](30_forca_e_distribuicao.md) exige o contato do KA2 declarado **em CC**, e não só os "10 A / 250 VAC" do anúncio.

### A saída, se você quiser os dois lados

Trocar o D1 por **1N4007 em série com um zener de 24 a 33 V**, o conjunto em antiparalelo com a bobina:

```
      A1 ──┬────────────────────┐
            │                      │
        [ bobina KA2 ]      ▲ 1N4007  (catodo no A1)
            │                 │
            │              ▼ zener 27 V
            │                 │
      A2 ───┴────────────────────┘
```

| | D1 sozinho | **D1 + zener 27 V** |
|---|---|---|
| Pico no contato do KA3 | ~24,7 V ✅ | ~52 V — ainda longíssimo dos 250 V do contato ✅ |
| Desatracamento do KA2 | ~25 ms ⚠️ | ⭐ **~10 ms** |
| Arco no contato de 6 A CC | mais longo | ⭐ **mais curto** |
| Custo | R$ 0,20 | R$ 0,50 |

**Como funciona:** a tensão de grampeamento passa de 0,7 V para ~27,7 V, e a energia armazenada na bobina se dissipa numa tensão 40 vezes maior — ou seja, num tempo 40 vezes menor. O contato do KA3 continua protegido (52 V não abre arco), e o KA2 volta a desatracar depressa.

> 📌 **Vale a pena aqui?** Honestamente: **provavelmente não é obrigatório.** O KA2 abre sob 6 A poucas dezenas de vezes na vida deste projeto ([Doc 03](../camada_0_fundamentos/03_lista_materiais.md) faz essa conta), e o contato de 10 A aguenta isso mesmo desatracando devagar. **Mas é uma decisão de projeto que vale ser TOMADA em vez de ignorada**, e explicá-la mostra que você entendeu o que o diodo faz — e não só que "tem de pôr um diodo na bobina".
>
> 🎓 **Se a banca perguntar por que há um diodo ali**, a resposta completa é: *"para proteger o contato do KA3 do pico indutivo — e o preço é um desatracamento mais lento do KA2, que eu aceitei porque ele interrompe 6 A poucas dezenas de vezes; num equipamento que partisse o dia inteiro, eu teria posto um zener em série."*
>
> ⚠️ **Isto vale só para o KA2.** Nas bobinas do KA3 e do KA4 o diodo puro basta e sobra: quem elas comandam é um contato conduzindo 37 mA e 0,36 A, correntes em que arco não é assunto. E lá o diodo protege um MOSFET de 60 V, que precisa mesmo do grampeamento baixo.

---

📄 **Anterior:** [Doc 30 — Força e Distribuição](30_forca_e_distribuicao.md) · **Próximo:** [Doc 32 — Sinais e Sensores](32_sinais_e_sensores.md)
