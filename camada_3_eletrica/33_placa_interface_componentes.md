# CAMADA 3 · Doc 33 — Placa de Interface e Componentes Discretos

> **Este documento responde a uma pergunta específica:** *"se os módulos já vêm com proteção, por que ainda preciso pendurar resistor e capacitor neles?"*
>
> A resposta curta é: **você não está adicionando proteções que faltaram. Você está construindo a interface entre dois equipamentos** — e a interface nunca vem pronta, porque o fabricante não sabe a que você vai ligar o produto dele.
>
> A resposta longa é a §33.1. Depois dela, cada componente aparece com **função, justificativa, ligação perna por perna e ensaio de verificação**.

---

## 33.1 Por que um módulo pronto ainda precisa de componentes externos

### A sua intuição está certa — só está respondendo a outra pergunta

O BTS7960 realmente vem protegido. Ele traz, dentro do silício:

| O módulo **já** protege contra | Como |
|---|---|
| Sobrecorrente na carga | Limitação interna de corrente |
| Curto-circuito na saída | Desligamento por corrente excessiva |
| Superaquecimento | *Shutdown* térmico com histerese |
| Subtensão de alimentação | Bloqueia o acionamento abaixo do mínimo |

Tudo isso é verdade, e é por isso que o módulo é bom. **Mas repare no que essas quatro linhas têm em comum: todas são coisas que acontecem DENTRO do módulo.** O chip consegue se proteger porque consegue medir a si mesmo.

Agora observe o que ele **não tem como saber**:

| O módulo **não pode** saber | Por quê |
|---|---|
| Se o pino `R_EN` está solto ou está sendo comandado em nível baixo | Eletricamente, "solto" e "0 V" chegam parecidos. Ele não tem como distinguir "o controlador mandou desligar" de "o controlador não existe" |
| Quanto ruído o **seu** cabo vai captar entre ele e o **seu** Arduino | O cabo não é dele. O comprimento, o trajeto e a vizinhança são decisões suas |
| Qual tensão o **seu** microcontrolador aceita na entrada analógica | Ele entrega um sinal; quem o lê é problema do projeto |

**Essa é a divisão.** O fabricante entrega um equipamento que se protege. **A ligação entre equipamentos é projeto seu** — e ela tem componentes próprios, que não pertencem a nenhum dos dois lados.

### Os 5 papéis que esses componentes cumprem — nenhum deles é "proteção"

Este é o quadro para gravar. Cada componente discreto do projeto se encaixa em uma destas cinco categorias:

| # | Papel | Componente aqui | O que ele realmente faz |
|---|---|---|---|
| 1 | **Definir estado seguro** | 10 kΩ pull-down no `R_EN` | Responde à pergunta *"o que vale quando ninguém está comandando?"*. Sem ele, a resposta é "depende" — e "depende" não é resposta aceitável em segurança |
| 2 | **Condicionar sinal** | 100 nF nos pinos `IS` | Limpa o ruído que **o cabo** captou. Não protege nada — melhora uma medição |
| 3 | **Fazer parte do protocolo** | 4,7 kΩ do 1-Wire | O barramento 1-Wire é dreno aberto por definição: **o resistor É o barramento**. Sem ele não existe comunicação, nem com fio perfeito |
| 4 | **Adaptar escala de medição** | Divisor 22 kΩ / 4,7 kΩ | Transforma 24 V em 4,2 V para o Arduino conseguir ler. É um **instrumento de medida**, não uma proteção |
| 5 | **Definir ponto de operação** | 220 Ω dos LEDs da maquete | Um LED é um diodo: não tem resistência que limite a própria corrente. Quem escolhe o brilho escolhe o resistor |
| ~~1+5~~ | ~~**Adaptar nível de acionamento**~~ | ~~ULN2803A dos sinaleiros~~ | 🗑️ **Saiu do projeto.** Ele adaptava 5 V do pino a 24 V do sinaleiro — até alguém perguntar por que o sinaleiro não podia ser de 5 V. **Categoria que some quando os dois lados falam a mesma língua** ([§33.8](#338--decisão-revisada--sinaleiros-de-5-v-no-painel-leds-de-5-v-na-maquete)) |

### O paralelo industrial — isso é normal, não é gambiarra

A sensação de "estou sempre tendo que adicionar coisa" some quando você percebe que **um painel industrial de verdade faz exatamente o mesmo**, com equipamentos muito mais caros:

| No painel industrial | Papel | Categoria acima |
|---|---|---|
| **TP / TC** (transformador de potencial e de corrente) | O relé de proteção não lê 13,8 kV direto — o TP reduz para 115 V | 4 — adaptar escala |
| **Resistor de terminação** em rede Profibus / RS-485 | Sem ele o barramento reflete e a comunicação falha | 3 — parte do protocolo |
| **Relé de interposição** entre CLP e contator | A saída do CLP não aciona a bobina direto | 1 e 5 |
| **Snubber RC** no contator | Absorve o transitório do desligamento | 2 — condicionar |
| **Resistor de pré-carga** em barramento CC | Define o comportamento na energização | 1 — estado seguro |

Nenhum desses é "proteção que faltou no equipamento". Todos são **componentes da ligação**. Um CLP Siemens é um equipamento completo e mesmo assim exige TP, TC, terminação e relés de interposição.

> 🎓 **A frase para a defesa:** *"Os componentes discretos do painel não corrigem deficiência dos módulos. Eles definem a interface entre subsistemas — estado seguro, condicionamento de sinal, protocolo de barramento, escala de medição e ponto de operação. É a mesma função que TP, TC, resistor de terminação e relé de interposição cumprem em um painel de média tensão."*

### Por que não deixar nenhum deles solto no fio

Os componentes são necessários. Soldá-los no meio do cabo com fita isolante, não:

| Problema | Consequência |
|---|---|
| A solda no meio do fio é o ponto mecânico mais frágil do chicote | A maquete vai ser transportada. Emenda no ar quebra por fadiga, e o defeito é **intermitente** — o pior tipo de defeito para achar |
| Não dá para medir | No comissionamento você precisa medir cada um. Enterrado em fita isolante, não tem onde encostar a ponta de prova |
| Não dá para trocar | Errar o valor de um resistor é normal. Trocar um componente soldado no meio de um chicote já montado é remontar o chicote |
| Não dá para documentar | Ninguém consegue conferir o que não consegue ver |

**Solução adotada: cada componente vai para um dos dois lugares abaixo — nenhum fica no ar.**

| Onde | Quais | Motivo |
|---|---|---|
| **Placa de Interface (PI-1)** em caixa DIN, ao lado do Arduino | 6 componentes + 1 CI | Todos precisam estar eletricamente junto ao Arduino |
| **Soldado no próprio BTS7960** | 2 resistores de 10 kΩ | Precisam estar no terminal do driver, e a razão é de segurança (§33.4) |
| **Na base de cada poste de iluminação da maquete** | 4 resistores de 220 Ω | Ficam junto do LED que limitam, longe do painel (§33.2) |

---

## 33.2 Componente por componente — função, motivo e ligação perna a perna

> 📌 **Sobre polaridade:** **resistores e capacitores cerâmicos não têm polaridade** — podem ser montados em qualquer sentido. A distinção "perna A / perna B" abaixo serve para dizer **onde cada ponta vai**, não para indicar lado certo. Os únicos componentes com polaridade neste documento são os **LEDs** (perna longa = ânodo = positivo).

---

### C1 e C2 — Capacitor cerâmico 100 nF · filtro dos pinos IS

| | |
|---|---|
| **Categoria** | 2 — condicionar sinal |
| **Quantidade** | 2 (1 por BTS7960) |
| **Onde fica** | Placa PI-1 |

**O que o pino IS é:** o BTS7960 tem uma saída chamada `R_IS` que entrega uma corrente proporcional à corrente da carga. O Arduino lê isso no conversor A/D e usa para diagnosticar atuador desconectado ou queimado.

**Por que precisa do capacitor:** o sinal sai limpo do BTS. Ele percorre ~30 cm de cabo dentro de um painel onde dois drivers chaveiam corrente, e chega sujo no Arduino. O capacitor forma um filtro passa-baixas com a resistência do próprio cabo e devolve uma tensão estável ao A/D. **Sem ele, a leitura oscila e o firmware dispara alarme de falha com o sistema funcionando perfeitamente.**

**Por que o fabricante não colocou:** ele não sabe se o seu cabo tem 5 cm ou 3 m, nem o que passa do lado. O filtro depende do **seu** cabo.

```
   BTS #1 R_IS ──────────┬─────────────► Arduino A0
                         │
                       ══╪══  C1 · 100 nF
                         │
                         └─────────────► 0 V (BD-0V)

   ⚠️ O capacitor fica JUNTO AO ARDUINO, não junto ao BTS.
      Se ficar do lado do BTS, ele filtra o ruído do driver
      mas não o que o cabo captou no caminho — que é a maior parte.
```

| Componente | Perna | Vai para |
|---|---|---|
| **C1** (100 nF) | 1 | Nó **A0** — onde o fio vindo do `R_IS` do BTS #1 encontra o fio que vai ao pino A0 |
| | 2 | **0 V** (barramento BD-0V) |
| **C2** (100 nF) | 1 | Nó **A1** — `R_IS` do BTS #2 / pino A1 |
| | 2 | **0 V** (barramento BD-0V) |

**Ensaio:** com o sistema energizado e em repouso, ler A0 e A1 pelo monitor serial. O valor deve ficar estável dentro de ±2 contagens de A/D. Se pular dezenas de contagens, o capacitor está ausente, mal soldado ou do lado errado.

---

### R1 + R2 + C3 — Divisor de tensão 22 kΩ / 4,7 kΩ · realimentação do pino D25

| | |
|---|---|
| **Categoria** | 4 — adaptar escala de medição |
| **Quantidade** | 1 conjunto (2 resistores + 1 capacitor) |
| **Onde fica** | Placa PI-1 |

**O que faz:** informa ao Arduino se a potência de 24 V está realmente presente no BD-POT — ou seja, se o relé KA2 fechou e a emergência está liberada. É como o firmware sabe a diferença entre "eu mandei ligar" e "ligou de verdade".

**Por que precisa:** o pino D25 do Arduino suporta no máximo 5 V. O barramento a medir tem 24 V. **Ligar direto destrói a entrada.** O divisor reduz proporcionalmente:

```
V_D25 = 24 V × 4,7 kΩ / (22 kΩ + 4,7 kΩ) = 24 × 0,176 = 4,22 V   ✅ dentro dos 5 V
```

**A analogia que vale ponto na defesa:** isto é exatamente um **TP — transformador de potencial**. Numa subestação você não liga o voltímetro nos 13,8 kV; liga num TP que reduz para 115 V e mede lá. O divisor resistivo é o TP do Arduino. Mesma função, mesma razão, escala diferente.

> ⚠️ **Este divisor mudou com a adoção do Plano B.** Ele antes lia 12 V com 10 kΩ / 4,7 kΩ. Se você mantiver os valores antigos lendo 24 V, chegam **7,67 V** no pino D25 e a entrada do Arduino é danificada. **Confira os valores antes de soldar.**

```
   BD-POT (+24 V, depois do KA2)
        │
      ┌─┴─┐
      │R1 │  22 kΩ
      └─┬─┘
        ├──────────────────────────► Arduino D25   (4,22 V)
      ┌─┴─┐              │
      │R2 │  4,7 kΩ    ══╪══  C3 · 100 nF
      └─┬─┘              │
        └────────────────┴────────► 0 V
```

| Componente | Perna | Vai para |
|---|---|---|
| **R1** (22 kΩ) | 1 | **+24 V** do bloco **BD-POT** (o barramento comutado pelo KA2) |
| | 2 | Nó **D25** |
| **R2** (4,7 kΩ) | 1 | Nó **D25** |
| | 2 | **0 V** (BD-0V) |
| **C3** (100 nF) | 1 | Nó **D25** |
| | 2 | **0 V** (BD-0V) |
| — | — | Do nó **D25** sai **um** fio para o pino **D25** do Arduino |

**Por que o C3 (novo):** o nó D25 é um ponto de alta impedância (~3,9 kΩ equivalente) dentro de um painel com chaveamento. Sem o capacitor, ruído captado pode fazer o pino oscilar entre HIGH e LOW e o firmware enxergar a potência "piscando". Custa centavos e elimina a classe inteira de problema.

**Ensaio:** com o KA2 fechado, medir o nó D25 contra 0 V. Deve dar **4,2 V ± 0,3 V**. Com a emergência acionada, deve cair para **0 V**.

---

### R3 — Resistor 4,7 kΩ · pull-up do barramento 1-Wire

| | |
|---|---|
| **Categoria** | 3 — parte do protocolo |
| **Quantidade** | 1 |
| **Onde fica** | Placa PI-1 |

**Este é o caso mais claro de todos, e o melhor para entender a lógica inteira.**

O DS18B20 comunica pelo protocolo **1-Wire**, que é **dreno aberto**: o sensor só sabe fazer uma coisa — puxar a linha para 0 V. Ele **não tem** como levar a linha para nível alto. Quem faz isso é o resistor de pull-up.

**Ou seja: sem o resistor, não existe barramento.** Não é que a comunicação fique instável — ela simplesmente não acontece, mesmo com sensor perfeito, cabo perfeito e código perfeito. O resistor não é acessório do sensor: **ele é parte do meio de transmissão**, como o par trançado de uma rede.

**Por que a Maxim não colocou dentro do sensor:** porque o valor correto depende do **comprimento do cabo** e do **número de sensores** no barramento. Cabo curto e um sensor: 4,7 kΩ. Cabo longo ou vários sensores: valor menor. É uma decisão de projeto de rede, e o fabricante deixa nas suas mãos de propósito.

```
                    +5 V (BD-5V)
                       │
                     ┌─┴─┐
                     │R3 │  4,7 kΩ
                     └─┬─┘
   Arduino D2 ─────────┼──────────────► DATA do DS18B20 (na câmara)
                       │
              (o sensor só consegue PUXAR este nó para 0 V;
               quem o traz de volta para 5 V é o R3)
```

| Componente | Perna | Vai para |
|---|---|---|
| **R3** (4,7 kΩ) | 1 | **+5 V** (bloco BD-5V) |
| | 2 | Nó **D2** — onde se encontram o fio do pino D2 do Arduino e o fio **DATA** (amarelo) que vai ao DS18B20 |

**Ensaio:** com o Arduino **desligado** e o sensor conectado, medir a resistência entre D2 e +5 V — deve dar ~4,7 kΩ. Com o sistema ligado e em repouso, medir a tensão em D2: deve estar em ~5 V (linha em repouso alta).

---

### ~~CI1 — ULN2803A~~ · o driver que deixou de ser necessário

> 🗑️ **Ele saiu do projeto em 18/08/2026, e a razão é a melhor possível: o problema que ele
> resolvia deixou de existir.**

O CI estava aqui por **uma** diferença: o pino do Arduino entrega 5 V e o sinaleiro era de 24 V.
Alguém tinha que estar no meio — e o ULN2803A era a escolha certa entre as três possíveis
(transistor discreto, relé ou CI driver).

**A pergunta que mudou o projeto foi de um dos alunos:** *"e se o sinaleiro fosse de 5 V?"*

Aí não há o que adaptar. O pino aciona o sinaleiro direto, e com o CI saem também o soquete
DIP-18, **9 vias de borne** da PI-1, **10 dos 20 jumpers** e **5 fios** do painel. A placa
encolheu de 34 × 29 para 22 × 22 furos e a caixa DIN de 6 módulos virou uma de 4.

| | Antes (sinaleiro 24 V) | Agora (sinaleiro 5 V) |
|---|---|---|
| Peças entre o pino e a lâmpada | ULN2803A + soquete + 2 fios + positivo comum de 24 V | **nada** |
| Vias de borne na PI-1 | 19 | **10** |
| Jumpers na PI-1 | 20 | **10** |
| Caixa DIN | 6 módulos | **4 módulos** |
| Limite a respeitar | 500 mA por canal do CI | ⚠️ **20 mA por pino do Arduino** |

> ⚠️ **O limite mudou de lugar, não sumiu.** Quem sustenta a lâmpada agora é o pino, e o pino do
> Mega entrega 20 mA com folga e 40 mA no limite absoluto. Meça o sinaleiro com fonte de bancada
> antes de ligá-lo (passo A-02): se puxar mais que 20 mA, ele **não** pode ir direto no pino, e o
> ULN2803A volta.

> 🎓 **A lição que vale na defesa:** antes de projetar o adaptador entre dois lados, pergunte se
> os dois lados não podem falar a mesma língua. Metade desta placa existia por uma diferença de
> tensão que era escolha nossa, não imposição de ninguém.

---


### R4 a R7 — Resistor 220 Ω · limitador dos LEDs da maquete

| | |
|---|---|
| **Categoria** | 5 — definir ponto de operação |
| **Quantidade** | 4 (+ 2 reservas) |
| **Onde fica** | ⚠️ **NÃO vai na PI-1** — vão na maquete, dentro da base de cada poste de iluminação |

Os 220 Ω não sumiram do projeto: **mudaram de função**. Eles saíram dos sinaleiros do painel (que agora são de 24 V com driver) e foram para a **iluminação pública da maquete** — os 4 LEDs brancos de 3 mm das luminárias da rua e da guarita, que passaram a ser alimentados em **5 V**.

**Por que precisa:** um LED é um diodo. Acima da tensão de condução ele conduz praticamente sem limite e se destrói. **O LED não tem resistência interna que o limite** — isso não é falha do componente, é a física dele. O resistor define a corrente e, portanto, o brilho:

```
LED branco: Vf ≈ 3,1 V
I = (5 V − 3,1 V) / 220 Ω = 8,6 mA   ✅ brilho adequado para cenografia
```

> 💡 **8,6 mA é de propósito.** Para iluminação de maquete, LED em corrente baixa fica mais realista — um LED em 20 mA "estoura" na foto e ofusca a cena. E consome menos do ramal de comando.

| Componente | Perna | Vai para |
|---|---|---|
| **R4–R7** (220 Ω) | 1 | **+5 V** (vindo do BD-5V, por baixo da base) |
| | 2 | **Ânodo** do LED branco — **perna LONGA** |
| — | — | **Cátodo** (perna curta) → **0 V** |

⚠️ **Único componente polarizado do conjunto.** LED invertido não queima, simplesmente não acende — se um não acender no teste, inverta antes de suspeitar do resistor.

⚠️ **Estes resistores também não podem ficar no ar.** Monte cada um **dentro da base do poste de iluminação**, com termorretrátil, ou em uma mini placa ilhada escondida sob a base da maquete, junto com os outros três.

---

### R8 e R9 — Resistor 10 kΩ · pull-down dos pinos R_EN

| | |
|---|---|
| **Categoria** | 1 — definir estado seguro |
| **Quantidade** | 2 (1 por BTS7960) |
| **Onde fica** | ⚠️ **NÃO vai na placa** — vai soldado no próprio BTS7960 (§33.4) |

**É o componente mais importante deste documento.** Vale entender bem, porque é o que responde à sua pergunta original com mais precisão.

**O problema que ele resolve:** o pino `R_EN` do BTS7960 é a habilitação do driver. Nível alto = driver ligado. Nível baixo = desligado. Agora considere os momentos em que **o Arduino não está comandando esse pino**:

| Momento | Estado do pino D4 do Arduino | O que o `R_EN` "vê" |
|---|---|---|
| Fonte ligada, Arduino ainda dando boot (~2 s) | Entrada de alta impedância | **Indefinido** |
| Arduino travou e o watchdog resetou | Entrada de alta impedância | **Indefinido** |
| Fio Arduino → BTS rompeu ou soltou do borne | Desconectado | **Indefinido** |
| Alguém está com o Arduino fora do painel para gravar | Desconectado | **Indefinido** |

"Indefinido" significa que o pino flutua e assume o nível que o ruído ambiente determinar. **Em um painel com dois drivers chaveando, esse ruído existe.** O resistor de 10 kΩ elimina a dúvida: sem ninguém comandando, o pino é firmemente puxado para 0 V e **o driver fica desligado**.

**Por que o módulo não resolve isso sozinho:** porque, do ponto de vista do BTS7960, **não há falha nenhuma acontecendo**. As proteções dele disparam com sobrecorrente, curto ou calor. Um pino de habilitação flutuando não é nenhuma dessas coisas — o chip só vê um nível lógico e obedece. **Nenhuma proteção interna cobre "o meu controlador sumiu", porque o chip não tem como saber que sumiu.**

> 🔑 **É esta a diferença que responde à sua pergunta:** proteção interna cuida do que acontece **dentro** do equipamento. Estado seguro na ausência de comando é uma decisão de **sistema** — e sistema é você.

> 📌 **E se o chip tiver um pull-down interno fraco?** Mesmo que tenha, **não se baseia uma função de segurança em um pull-down interno fraco e não especificado no anúncio do módulo.** O resistor externo de 10 kΩ é determinístico, custa centavos e — o mais importante — **é mensurável com multímetro no comissionamento**. Segurança que não se consegue medir não é segurança, é esperança.

```
   Arduino D4 ──────────────┬──────────► BTS #1  R_EN
                            │
                          ┌─┴─┐
                          │R8 │  10 kΩ
                          └─┬─┘
                            │
                            └──────────► GND do BTS #1

   ⚠️ O resistor fica NO BTS, não na placa nem no meio do cabo.
      Assim, um rompimento em QUALQUER ponto do cabo ainda deixa
      o R_EN preso em 0 V — o driver desliga.
      Se o resistor ficasse na placa e o trecho placa→BTS rompesse,
      o R_EN voltaria a flutuar. O componente perderia a função
      exatamente na falha que ele existe para cobrir.
```

| Componente | Perna | Vai para |
|---|---|---|
| **R8** (10 kΩ) | 1 | Pino **`R_EN`** do **BTS #1** — que está ligado ao **`L_EN`** do mesmo módulo, então um resistor cobre os dois ([Doc 32 §32.3](32_sinais_e_sensores.md)) |
| | 2 | Pino **`GND`** do **mesmo** módulo BTS #1 |
| **R9** (10 kΩ) | 1 | Pino **`R_EN`** do **BTS #2** |
| | 2 | Pino **`GND`** do **mesmo** módulo BTS #2 |

**Ensaio (obrigatório, e antes de instalar as Peltier):**
1. Desligue o Arduino ou desconecte o fio D4.
2. Meça a resistência entre `R_EN` e `GND` do módulo: deve dar **~10 kΩ**.
3. Energize o painel com a saída dos BTS **desconectada** e meça a tensão em `R_EN`: deve ser **~0 V** em todo o boot.

---

### 🔧 O veto da potência NÃO mora nesta placa — e a história vale a leitura

Chegou a ser projetado aqui: um **MOSFET 2N7000** com resistor e diodo, dando ao firmware o poder de cortar os 24 V. Fazia sentido — é a placa que existe justamente para que nenhum componente fique pendurado no fio (§33.1).

**O `npm run valida` reprovou:**

```
  X C10 chega em PI1.J2-9 (borda baixo) usando a CH-topo — esse borne alcança CH-3x2
```

A PI-1 está no trilho 3 e o KA2 no trilho 1. Com o MOSFET na placa, o **circuito da bobina** teria de subir três trilhos e voltar — dois fios de bobina atravessando o painel, um deles pela canaleta de **sinal**, colado ao `IS` analógico e ao 1-Wire. É o contrário da regra de [§31.4](31_comando_e_protecoes.md), que foi quem decidiu em que trilho os relés moram.

✅ **A função virou o `KA3`**, um **módulo de relé de 1 canal, 5 V**, pronto, numa caixa DIN de 4 módulos no **trilho 2** — onde a canaleta de baixo (CH-2x1) já é de potência e serve o trilho 1 diretamente. Circuito completo em [Doc 31 §31.13](31_comando_e_protecoes.md).

> 🎓 **Duas lições que valem a defesa.** A primeira: **componente de ancoragem é de proximidade** — é a mesma razão pela qual os pull-downs de 10 kΩ do `R_EN` são soldados nos próprios BTS7960, logo acima. A segunda: um script de validação escrito por você mesmo reprovando uma decisão sua é o argumento mais forte que existe a favor de ter escrito o script.

---

## 33.3 ✂️ Uma placa de 9 × 15 cm vira as duas placas — e ainda sobra

As placas ilhadas compradas são de **9 × 15 cm** (34 × 58 furos). Dela saem as duas placas do
projeto, com sobra:

```
   ┌──────────────────┐  ← placa comprada, 34 × 58 furos (90 × 150 mm)
   │  PI-1   │ sobra  │     PI-1: 22 × 22 furos · 56 × 56 mm
   │ 22×22   │  →DUTs │     a sobra vira o corpo das 2 placas simuladoras
   ├ ─ ─ ─ ─ ┴ ─ ─ ─ ─┤  ← primeiro corte, entre as fileiras 29 e 30
   │                  │
   │      PI-2        │     34 × 29 furos  ·  86,4 × 73,7 mm
   │                  │
   └──────────────────┘
```

⭐ **A PI-1 encolheu pela metade** quando o ULN2803A saiu: ela tinha 34 × 29 furos e uma caixa DIN
de 6 módulos; hoje tem 22 × 22 e cabe numa de 4 módulos. A PI-2 não mudou.

### A altura é o teto; a largura é escolha

Uma caixa modular DIN aceita placa de até **~74 mm de altura**, seja ela de 4, 6 ou 12 módulos —
a altura é padronizada pelo trilho. A largura é que muda com o número de módulos.

| Placa | Furos | Tamanho | Caixa DIN |
|---|---|---|---|
| **PI-1** | 22 × 22 | 56 × 56 mm | **4 módulos** |
| **PI-2** | 34 × 29 | 86 × 74 mm | 6 módulos |

⭐ **A PI-1 tinha 34 × 29 e uma caixa de 6 módulos** — encolheu quando o ULN2803A e as 9 vias dos
sinaleiros saíram ([§33.8](#338--decisão-revisada--sinaleiros-de-5-v-no-painel-leds-de-5-v-na-maquete)).
Sobrou espaço no trilho 3, que é onde o módulo do sensor de tensão caberia se um dia o divisor do
D25 também sair da placa.


### Como cortar sem lascar

1. Marque a linha **entre as fileiras 29 e 30**
2. Risque com **estilete apoiado numa régua de metal**, na linha **entre** furos, nunca em cima deles
3. Risque dos **dois lados** da placa, 3 ou 4 passadas em cada
4. Quebre apoiando na **quina da bancada**, com a linha do risco na borda
5. Passe uma lixa fina na aresta

> 💡 **Guarde as sobras.** Elas servem de gabarito — encaixe os bornes nelas primeiro para conferir o espaçamento das vias antes de soldar na placa boa — e ainda viram o corpo das duas placas simuladoras de DUT.

> ⚠️ **Conte os furos quando a placa chegar.** Há versões de 9 × 15 cm com **35 × 59**. Se a sua vier assim, sobra uma coluna e uma fileira — o layout cabe igual. O `npm run valida:pi2` compara os dois números e reprova se não couber.

### 🔎 O desenho da placa está no aplicativo, e não aqui

Aba **🔧 Dentro do painel** → clique na PI-1 ou na PI-2. A tela mostra os **dois lados** da placa
(componentes em cima, fiação por baixo), cada **furo é clicável** e diz o que existe nele e a que
está ligado, e há uma caixa de conferido por jumper soldado. O endereço de cada furo segue a
convenção de planilha — coluna em letra, fileira em número, e o campo *"ir para célula"* aceita
`N6` direto.

**Por que não repetir o desenho aqui:** ele é gerado do `pi1_fisico.js` e do `pi2_fisico.js`, os
mesmos arquivos que os validadores conferem. Um desenho em ASCII neste documento seria uma segunda
versão da verdade — e, quando a placa mudasse, ele ficaria errado em silêncio. Foi exatamente o
que aconteceu com a versão anterior desta seção.


### 🔩 Qual borne comprar — e a armadilha dos 5,00 mm

**Borne KF301 (no Brasil, "KRE") de passo 5,08 mm.**

O número que importa é o **passo**, porque ele tem que ser múltiplo exato dos 2,54 mm da placa:

| Passo | Cai em quantos furos | Serve? |
|---|---|---|
| 2,54 mm | 1 furo | alinha, mas é apertado para parafusar |
| **5,08 mm** | **2 furos** | ✅ **é este** |
| 7,62 mm | 3 furos | alinha, mas ocupa espaço demais |
| 3,50 / 3,81 mm | não alinha | ❌ |
| **5,00 mm** | **quase 2 furos** | 🔥 **a armadilha** |

> 🔥 **5,00 mm e 5,08 mm são vendidos lado a lado e parecem idênticos.** A diferença é de 0,08 mm por via — some no primeiro pino e some no segundo. Mas ela **acumula**: num bloco de 11 vias, o último pino sai **0,8 mm** fora do furo, que é quase o diâmetro do furo inteiro. Ou não entra, ou entra torto e forçado.
>
> **Leia o passo no título do anúncio.** Tem que dizer **5.08**, não "5.0" nem "5mm".

### Eles se encaixam — não compre bloco grande

Os KF301 têm **rabo de andorinha nas laterais**: blocos de 2 e de 3 vias deslizam um no outro e viram um só. É assim que se fazem as contagens ímpares.

| Placa | Borne | Vias | Largura | Monta-se com |
|---|---|---:|---:|---|
| PI-1 | J1 | 11 | 55,9 mm | 3 × 3 vias + 1 × 2 vias |
| PI-1 | J2 | 8 | 40,6 mm | 2 × 3 vias + 1 × 2 vias |
| PI-2 | J1 | 4 | 20,3 mm | 2 × 2 vias |
| PI-2 | J2 | 2 | 10,2 mm | 1 × 2 vias |
| PI-2 | J3 | 7 | 35,6 mm | 1 × 3 vias + 2 × 2 vias |

**Total: 32 vias = 6 blocos de 3 + 7 blocos de 2.** Comprando com reserva: **10 de 3 vias e 12 de 2 vias**.

📐 Rode `node scripts/lista_bornes.mjs` para recalcular — o script lê os layouts, refaz a conta e confere se os bornes de cada borda cabem nos 61 mm da placa. A lista escrita à mão **já ficou errada uma vez** (pedia 2 bornes de 8 vias quando o projeto precisava de 32), e é por isso que ela agora é gerada.

⚠️ **Procure por:** `KF301-5.08 2P`, `KF301-5.08 3P`, ou no Brasil `borne KRE 5,08mm 2 vias`. Confira que o anúncio menciona **encaixável / splicable**, senão os blocos não deslizam um no outro.

📌 **Corrente:** o KF301-5.08 é de 10 A / 300 V e aceita fio de 0,13 a 1,5 mm². Os fios que chegam nele são de 0,25 a 0,5 mm² e a maior corrente é de dezenas de miliampères — sobra de tudo. O que decide aqui é a **geometria**, não a corrente.

## 33.4 A Placa de Interface PI-1 — construção

### Onde fica, e o que ela faz

Caixa modular DIN de **4 módulos**, no trilho 3, ao lado do Arduino. A placa tem
**22 × 22 furos** (56 × 56 mm) e faz **três** coisas — nenhuma delas é comandar potência:

| Circuito | O que faz | Peças |
|---|---|---|
| **Filtros de corrente** | Limpa o sinal `IS` dos dois BTS antes de entrar em A0 e A1 | C1, C2 |
| **Pull-up do 1-Wire** | Levanta a linha do DS18B20 — sem ele o sensor não responde | R3 |
| **Divisor do D25** | Transforma os 24 V do BD-POT em 4,22 V, para o Arduino vigiar a emergência | R1, R2, C3 |

> ⭐ **Havia um quarto circuito** — o driver dos 4 sinaleiros — e ele saiu inteiro quando os
> sinaleiros passaram para 5 V ([§33.8](#338--decisão-revisada--sinaleiros-de-5-v-no-painel-leds-de-5-v-na-maquete)).
> Com ele foram o ULN2803A, o soquete, 9 vias de borne, 10 jumpers e 5 fios do painel.

### Os dois bornes

| Borne | Via | Sinal | De onde vem / para onde vai |
|---|---:|---|---|
| **J1 · ENTRADAS** | 1 | `IS#1` | BTS7960 #1 · pino `R_IS` |
| | 2 | `IS#2` | BTS7960 #2 · pino `R_IS` |
| | 3 | `DATA` | DS18B20 do radiador · fio de dados |
| | 4 | `+5V` | BD-5V · saída 6 |
| | 5 | `0V` | BD-0V |
| | 6 | `24V-POT` ⚠️ | BD-POT · saída 3 — **comutado**, cai na emergência |
| **J2 · SAÍDAS** | 1 | `A0` | Arduino A0 — corrente do Peltier #1 |
| | 2 | `A1` | Arduino A1 — corrente do Peltier #2 |
| | 3 | `D2` | Arduino D2 — 1-Wire |
| | 4 | `D25` | Arduino D25 — vigia se o 24 V de potência caiu |

⚠️ **O borne tem que ser de passo 5,08 mm** (KF301). O de 5,00 mm parece igual no anúncio e não
encaixa na placa de 2,54 mm: a diferença acumula 0,4 mm a cada 5 vias e o último pino não entra.

### 🔌 O 0 V é ÚNICO no projeto inteiro

Os LM2596 **não são isolados**: o 0 V do 5 V, o do 12 V e o dos 24 V são o mesmo condutor. Por
isso existe **um** BD-0V, e por isso o barramento de 0 V da placa é uma linha reta de fio nu, a
primeira coisa que se solda. Não existe "terra da eletrônica" separado do "terra da potência"
neste projeto — inventar um cria laço de terra, que é a origem clássica de leitura instável.

### 🔎 O desenho furo a furo está no aplicativo

Aba **🔧 Dentro do painel** → clique na PI-1. Lá estão, gerados do `pi1_fisico.js`:

- os dois lados da placa (componentes em cima, fiação por baixo);
- cada furo clicável, dizendo o que existe nele e a que ele está ligado eletricamente;
- os **10 jumpers** com a rota de cada um e uma caixa de conferido por solda feita;
- os quatro **nós**, mostrando por que três pernas não entram no mesmo furo.

**A ordem de montagem, passo a passo, está na aba 🧾 Guia de montagem, fase B** — com o que pegar,
o que fazer e o que medir em cada etapa. Não repetimos aqui: lista de montagem em dois lugares é
lista que diverge.


## 33.5 A Placa de Interface PI-2 — construção

> 🔧 **Veja o desenho furo por furo** na aba **"Dentro do painel"** do aplicativo: clique na PI-2 e depois em **"Ver a placa e como soldar"**.

### O que muda em relação à PI-1

| | PI-1 | **PI-2** |
|---|---|---|
| Componente ativo | CI **nu** num soquete DIP-18 | **2 módulos prontos**, em barra de pinos fêmea |
| Discretos | 3 capacitores + 3 resistores | **2 shunts de 47 Ω** |
| Bornes | 2 (11 + 8 vias) | **3 (4 + 2 + 7 vias)** |
| Jumpers | 20 | **18** |
| Caixa | DIN 4 módulos | DIN 4 módulos, mesma medida |

⭐ **Você não solda o CD74HC4067 nem o INA219.** Solda a **barra de pinos fêmea**; os módulos entram depois e podem sair. Isso importa na hora de testar: dá para conferir a placa toda em continuidade com os módulos fora, sem risco de queimar nada.

### Os 3 bornes

| Borne | Vias | Borda | O que passa |
|---|---:|---|---|
| **J1** | 4 | cima | **Retornos** que voltam da câmara — RET-1 e RET-2 em uso, 2 de reserva |
| **J2** | 2 | baixo | 0 V e +5 V |
| **J3** | 7 | baixo | S0–S3, SIG, SDA, SCL — tudo que vai para o Arduino |

📐 J2 (10,2 mm) e J3 (35,6 mm) **dividem a borda de baixo**: 45,7 mm nos 61 disponíveis.

### 🔴 O caminho da corrente — leia isto antes de soldar

```
   posição 1:  J1-1 ──► INA219 VIN+ ─(por dentro)─► VIN− ──► nó RET-1 ──┐
                                                                  │      │
                                                       mux C0 ◄───┘   [R1 · 47 Ω]
                                                                         │
   posição 2:  J1-2 ─────────────────────────────────► nó RET-2 ──┐      │
                                                            │     │      │
                                                 mux C1 ◄───┘  [R2 · 47 Ω]
                                                                  │      │
                              barramento de 0 V ────────────────►─┴──────┘
                                        │
                                     J2-1 ──► BD-0V
```

**O que este desenho diz, em palavras:** a corrente da posição chega pelo retorno, atravessa o shunt e só então vira 0 V. A tensão que aparece **sobre o shunt** é a medição — e é o nó acima dele que o multiplexador lê.

⚠️ **O positivo NUNCA entra nesta placa.** Ele vai do porta-fusível direto para a câmara.

### 🔥 O jumper que não pode faltar

**Jumper 10 — o pino `EN` do multiplexador ao barramento de 0 V.**

O `EN` é ativo em nível **baixo**: em 0 V o mux funciona, em 5 V ele desliga todos os 16 canais. Como ele tem que ficar sempre ligado, o pino vai soldado direto no barramento — **não tem borne**, de propósito, para ninguém deixá-lo solto.

> ⚠️ **Entrada CMOS solta não é "nível baixo" — ela oscila com o ruído.** O mux ligaria e desligaria sozinho, e as leituras dariam zero na maior parte do tempo. O sintoma seria **"todos os dispositivos morreram ao mesmo tempo"**, que é justamente o alarme de sistema. É o erro mais fácil de cometer e o mais difícil de diagnosticar nesta placa.

O script `npm run valida:pi2` reprova o layout se este jumper não existir.

### Por que só a posição 1 tem INA219

Porque ele é o **instrumento de aferição**, não o método.

> ⭐ **É a prova para a banca.** Se o INA219 e o canal C0 do multiplexador dão o mesmo número na posição 1, está demonstrado que o multiplexador mede certo — e portanto que as outras 15 posições, que não têm INA219 nenhum, também estão. Um instrumento calibrado validando um método barato.

⚠️ A corrente passa **por dentro** do INA219, entre `VIN+` e `VIN−`. Não é um sensor que se encosta no fio: ele fica **no caminho**. Trocando VIN+ com VIN−, a leitura sai negativa.

### Ordem de montagem

1. Corte a placa em **24 × 29 furos** (≈ 61 × 74 mm) — mesma medida da PI-1
2. Solde o **barramento de 0 V**: fio nu esticado na linha 11
3. Solde os **três bornes**
4. Solde as **barras de pinos fêmea** — sem os módulos encaixados
5. Solde os dois **shunts em pé**: R1 em (2,6)→(2,11) e R2 em (7,6)→(7,11)
6. Solde as **pontes de nó** dos nós RET-1 e RET-2
7. ⚠️ Solde o **jumper 10** (EN → 0 V)
8. Solde os outros **17 jumpers** por baixo, com fio **isolado** de 0,25 mm²
9. Teste em continuidade **com os módulos fora**. Confira que RET-1 **não** tem continuidade com o 0 V se você tirar o R1
10. Encaixe os módulos
11. ⭐ **Afira:** com a posição 1 ligada, INA219 e canal C0 têm que dar a mesma corrente

### 🔎 A conferir quando os módulos chegarem

| O quê | Por quê |
|---|---|
| Comprimento da barra de 16 canais do mux | Reservei **16 furos (40,6 mm)** — de propósito generoso. Se o módulo vier menor, sobra espaço; se eu reservasse justo e viesse maior, a placa estaria errada |
| Se o INA219 traz `VIN+/VIN−` em **borne de parafuso** | A maioria dos GY-219 traz. Nesse caso os furos (14,8) e (17,8) viram os do borne |

---

## 33.6 Os 10 kΩ integrados ao BTS7960

Os dois pull-downs **não vão na placa PI-1**, pelo motivo explicado na §33.2: precisam estar no terminal do driver para cobrir também o rompimento do cabo.

**Procedimento:**

1. Com o módulo BTS7960 **fora do painel** e desenergizado, identifique no barra de pinos os terminais `R_EN` e `GND`.
2. Corte as pernas de um resistor de 10 kΩ deixando ~8 mm de cada lado.
3. Solde-o **pelo lado de baixo da placa do módulo**, ligando o pad de `R_EN` ao pad de `GND`. Pernas curtas e rentes.
4. Cubra com termorretrátil de Ø 2 mm ou uma gota de verniz.
5. **Meça:** entre `R_EN` e `GND` deve dar ~10 kΩ.
6. Repita no segundo módulo.
7. **Anote no diagrama e fotografe.** Um resistor invisível por baixo do módulo é uma armadilha para quem for dar manutenção depois — a foto no relatório resolve.

> 🔧 **Se você não quiser soldar no módulo:** monte o resistor dentro de um alojamento Dupont de 2 vias e encaixe-o direto no barra de pinos do BTS, entre `R_EN` e um `GND` adjacente. Funciona igual e é reversível. É um pouco menos robusto contra vibração — se optar por essa via, dê um ponto de cola quente no conector.

---

## 33.7 Componentes que NÃO precisam existir no painel

| Componente | Quantidade na BOM | Destino |
|---|---:|---|
| ~~Diodo 1N4007~~ | ~~4~~ | ⚠️ **CORRIGIDO — os diodos FICAM no projeto.** Esta linha supunha que os relés KA1/KA2 já trouxessem o roda-livre embutido. Quem traz são os **módulos de 5 V do KA3/KA4**; o KA1 e o KA2 são relés de 8 pinos em base PTF08A, e a base não tem componente nenhum. Monte o **`D1`** na bobina do KA2 e o **`D2`** nas ventoinhas do radiador — ver [Doc 31 §31.9](31_comando_e_protecoes.md) e o cadastro `painel_interativo/src/data/discretos.js`. Sobram 2 diodos de reserva |
| ~~Diodo Zener 5V6 / 13 V / 15 V~~ | ~~6~~ | 🗑️ Já eliminados na revisão do Plano B — proteção nativa do LM2596. Ver [Doc 02 §2.6](../camada_0_fundamentos/02_arquitetura_de_energia.md) |

> 💡 **Repare no padrão:** os componentes que saíram são justamente os da categoria "proteção" — e saíram porque **os módulos realmente já protegem**. Os que ficaram são todos de **interface**. A sua intuição sobre proteção estava correta; ela só não se aplicava a estes nove componentes, porque eles nunca foram proteção.

**Componentes discretos da maquete (fora do painel):** os 6 resistores de 2,2 kΩ dos LEDs da iluminação pública ([Doc 03 · M.4](../camada_0_fundamentos/03_lista_materiais.md)) seguem a mesma regra — **não podem ficar no ar**. Monte cada um dentro da base do poste de iluminação, com termorretrátil, ou numa mini placa ilhada escondida sob a base da maquete.

---

## 33.8 ✅ Decisão revisada — sinaleiros de 5 V no painel, LEDs de 5 V na maquete

**A versão anterior desta seção defendia sinaleiro de 24 V no painel**, com o argumento de que o
sinaleiro industrial de 22 mm é o que a banca reconhece, e que um LED de 5 mm espetado na porta
entrega a mensagem de "protótipo escolar".

**O argumento continua certo — e a solução ficou melhor:** existe sinaleiro 22 mm de 5 V. O corpo
metálico, o anel de 22 mm e o difusor são os mesmos; muda a tensão. Então dá para ter o
componente industrial **e** eliminar todo o circuito de adaptação.

| | Painel — sinaleiros 22 mm | Maquete — iluminação pública |
|---|---|---|
| Tensão | ⭐ **5 V** | 5 V |
| Quantidade | 4 (RUN, COOL, HEAT, FALHA) | 4 (3 da rua + 1 na guarita) |
| Acionamento | ⭐ **pino do Arduino, direto** (D9 a D12) | direto do BD-5V, sempre aceso |
| Limitação de corrente | interna ao sinaleiro | resistor de 220 Ω por LED |
| Alimentação | **BD-5V**, pelo próprio pino | **BD-5V** (ramal RM2) |
| Componentes no meio | ⭐ **nenhum** | R4–R7, na base de cada poste |

**O que essa decisão levou junto:**

- o **ULN2803A** e o soquete DIP-18 (§33.2);
- **9 vias de borne** da PI-1 — as 4 de comando, o 24 V permanente e as 4 de retorno;
- **10 jumpers** e o quarto circuito inteiro da placa;
- **5 fios** do painel: o positivo comum de 24 V, as três pontes entre sinaleiros e o COM do CI;
- **duas saídas do BD-24V**, que ficaram livres.

### ⚠️ O que passou a ser responsabilidade do pino

| Antes | Agora |
|---|---|
| O pino comandava; quem sustentava a lâmpada era o CI | **O pino sustenta a lâmpada** |
| Limite: 500 mA por canal do ULN | **Limite: 20 mA por pino** (40 mA absoluto) |
| Um curto no sinaleiro queimava o CI (R$ 3) | **Um curto no sinaleiro queima o pino do Mega** |

Por isso o passo **A-02** do guia manda medir a corrente do sinaleiro com fonte de bancada antes
de qualquer ligação, e por isso o retorno dos quatro vai para o **GND do próprio Mega**, e não
para o barramento: a corrente que sai do pino tem que voltar pela referência dele, ou ela desloca
a referência das medições analógicas do A0 e do A1 a cada lâmpada que acende.

### E o vermelho de FALHA na emergência?

Continua aceso — e agora por um motivo mais direto do que antes. Ele não depende de um barramento
permanente: depende do **Arduino estar vivo**, e o Arduino é alimentado pelo BD-5V, que não cai
com o cogumelo. Quem segura o pino em nível alto é o firmware, que continua rodando.

| Situação | Vermelho |
|---|---|
| Operando normal | apagado |
| Emergência socada | **aceso**, e apaga sozinho quando o cogumelo é destravado |
| Falha (sensor, potência, dissipador) | **aceso e fica** |
| Defeito corrigido, sem reconhecer | continua aceso |
| STOP segurado por 2 s | apaga — é o reconhecimento do alarme |


## 33.9 Checklist de aceitação do Doc 33

### Placa PI-1
- [ ] Placa de **22 × 22 furos** montada com os **6 componentes discretos** e os 2 bornes — **não há CI**
- [ ] Bornes identificados com etiqueta e anilhas nos cabos
- [ ] Continuidade conferida via por via, com o multímetro, antes de encaixar a placa
- [ ] Verniz de proteção aplicado no lado da solda
- [ ] Caixa DIN de **4 módulos** encaixada no trilho 3, ao lado do Arduino

### Sinaleiros do painel
- [ ] 4 sinaleiros **22 mm de 5 V** montados na porta
- [ ] ⚠️ **Corrente de cada um medida com fonte de bancada: ≤ 20 mA.** Acima disso não pode ir direto no pino
- [ ] Terminal **+** de cada um ligado ao seu pino: H1→D9, H2→D10, H3→D11, H4→D12
- [ ] Terminais **−** em ponte entre os quatro, com **um** retorno até o **GND2 do Mega** (não ao BD-0V)
- [ ] Teste: forçar cada saída em HIGH → sinaleiro acende
- [ ] ⭐ **Teste da emergência:** com o cogumelo acionado, **o sinaleiro vermelho continua aceso** — quem o segura é o Arduino, que vive no BD-5V permanente

### Nos BTS7960
- [ ] **10 kΩ soldado nos dois**, medindo ~10 kΩ entre `R_EN` e `GND`
- [ ] Com o Arduino desligado e o painel energizado, `R_EN` dos dois medindo **~0 V**
- [ ] Foto dos resistores soldados anexada ao relatório

### Demais verificações
- [ ] Divisor lendo **4,2 V ± 0,3 V** em D25 com o KA2 fechado, e **0 V** com a emergência acionada
- [ ] Pull-up do 1-Wire medindo ~4,7 kΩ entre D2 e +5 V
- [ ] **4× 220 Ω montados na base dos postes de iluminação da maquete**, com termorretrátil
- [ ] **Nenhum componente solto ou soldado no meio de cabo em todo o projeto**
- [ ] **`D1` montado nos bornes `A1`/`A2` do KA2** — ou o teste de diodo provando que o relé já tem o interno — e **`D2` montado junto às ventoinhas do radiador**, catodo no `+12 V`. Os outros 2 diodos ficam de reserva

---

📄 **Anterior:** [Doc 32 — Sinais e Sensores](32_sinais_e_sensores.md) · **Próximo:** [Doc 40 — Firmware Arduino](../camada_4_programacao/40_firmware_arduino.md)
🖼️ **Desenhos relacionados:** [Layout do painel](../desenhos/04_painel_layout.svg) · [Diagrama de comando](../desenhos/06_diagrama_comando.svg)
