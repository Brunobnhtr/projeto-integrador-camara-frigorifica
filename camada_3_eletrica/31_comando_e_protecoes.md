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
> 🔧 **No KA2 ele tem, e apenas em série:** o `D27` comanda o **KA3**, um módulo de relé no caminho da bobina ([§31.13](#3113--o-veto-do-firmware-sobre-a-potência-ka3)). Isso lhe dá poder de **derrubar** a potência, nunca de segurá-la contra uma botoeira. Ele continua **lendo** pelo `D25` se a potência chegou.

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

### O componente: um módulo de relé pronto

Nada de soldar. **Módulo de relé de 1 canal, 5 V, com optoacoplador e jumper de nível** — a placa azul de R$ 10 que todo mundo usa com Arduino, e que aqui faz um serviço industrial de verdade.

| Ref | Peça | Onde | Preço |
|---|---|---|---|
| **KA3** | Módulo relé 1 canal **5 V**, optoacoplado, jumper H/L, contato 10 A | caixa DIN 4M, **trilho 2** | R$ 10–15 |
| **R10** | Resistor **10 kΩ** entre o `IN` e o 0 V | no borne do próprio módulo | R$ 0,10 |
| **D1** | Diodo **1N4007** sobre a bobina do KA2 | nos bornes `A1`/`A2` | R$ 0,20 |

**Buscar:** `modulo rele 1 canal 5v optoacoplador` — e prefira o anúncio que oferece **jumper de gatilho alto/baixo**.

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

### Por que um relé e não o MOSFET discreto

Foi a alternativa considerada — **2N7000 + resistor + diodo, R$ 1,10**, montado num conjunto termorretrátil no próprio KA2. Tecnicamente é melhor: não desgasta, não consome corrente e fica a 3 cm da bobina.

| | Módulo de relé | 2N7000 discreto |
|---|---|---|
| Preço | R$ 10 | **R$ 1,10** |
| Solda | **nenhuma** | 3 componentes |
| Consumo no 5 V | 65 mA | **~0** |
| Desgaste | contato mecânico | **nenhum** |
| Estado visível | **LED vermelho** | multímetro |
| Chaveia lado alto? | **sim, é contato seco** | não, precisa de canal P |

**O módulo venceu por três razões práticas:** zero solda, o LED que mostra o veto sem instrumento, e — decisiva para o KA4 — **um contato seco não tem lado alto nem lado baixo**, o que apaga um problema inteiro de projeto.

> ⚠️ **E o desgaste não é objeção aqui:** o KA3 atua num trip, num boot e pouco mais — talvez cinco vezes por dia. A vida elétrica típica é de **100.000 operações**. São décadas. Se ele fosse chavear o PWM, como o KA2 não pode, a conta seria outra (§31.0).

### Cálculo — só para o relatório

```
   Corrente que o contato do KA3 conduz:
      I = 24 V / 650 Ω (bobina do KA2) = 37 mA
      Contato nominal: 10 A em 30 Vcc  →  usa 0,37 % da capacidade ✅

   Corrente que o pino D27 fornece:
      5 mA para o LED do optoacoplador  (limite do Mega: 40 mA) ✅

   Consumo dos DOIS módulos no barramento de 5 V:
      2 × 65 mA = 130 mA
      ⚠ Some com o Arduino, a tela e o ESP32 antes de fechar o Doc 02.
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

- [ ] **Jumper em `H`** nos dois módulos, e o fio no **`NO`** — não no `NC`
- [ ] **Sem o Arduino ligado**, medir o `IN` contra o 0 V → **0 V** (o R10 trabalhando), relé **aberto**
- [ ] Medir entre `IN` e 0 V com o ohmímetro → **~10 kΩ**
- [ ] Ligar o Arduino e forçar `digitalWrite(27, HIGH)` → **clique, LED vermelho acende**
- [ ] Com o KA1 selado e o STOP solto, apertar o **verde** → o KA2 atraca
- [ ] Forçar `digitalWrite(27, LOW)` → o KA2 solta **e não volta** quando o pino voltar a HIGH ⭐ *(é o selo do KA2 trabalhando — só o verde religa)*
- [ ] Teste de diodo entre `A1` e `A2` do KA2: conduz num sentido só

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

### A correção: chavear o positivo

```
   BD-AUX · O2 ──► COM │ KA4 │ NO ──► X5 ──► ventoinhas do radiador +
      (+12 V)          └──┬──┘                (2 em paralelo, 0,36 A)
                          │ gatilho
                   Mega · D30 ──[ R11 · 10 kΩ ]── 0 V

   X6 ── ventoinhas − ──► BD-0V · R20      ⭐ NUNCA chaveado
```

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
| **KA4** | Módulo relé 1 canal **5 V**, optoacoplado, jumper H/L | mesma caixa DIN 4M do KA3, **trilho 2** | R$ 10–15 |
| **R11** | Resistor **10 kΩ** entre o `IN` e o 0 V | no borne do módulo | R$ 0,10 |
| **D2** | Diodo **1N4007** sobre as ventoinhas, catodo no **+** | junto às ventoinhas | R$ 0,20 |

⚠️ **Valem as mesmas quatro regras do §31.13:** jumper em `H`, contato `COM`+`NO`, pull-down de 10 kΩ, bobina de 5 V confirmada no corpo do relé.

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

- [ ] Com o Arduino desligado, o LED vermelho do KA4 **apagado** e as ventoinhas **paradas**
- [ ] Forçar `digitalWrite(30, HIGH)` num sketch → clique, LED aceso, as duas **partem**
- [ ] Forçar `LOW` → **param**, e o **preto delas continua em 0 V** — é o ensaio que prova a correção
- [ ] Com elas paradas, medir o `D3` e o `A8` → **~5 V, estáveis**. Tensão no preto significa que o contato está no fio errado
- [ ] Desconectar o DS18B20 com o sistema parado e frio → **as ventoinhas devem LIGAR** ⭐

---

📄 **Anterior:** [Doc 30 — Força e Distribuição](30_forca_e_distribuicao.md) · **Próximo:** [Doc 32 — Sinais e Sensores](32_sinais_e_sensores.md)
