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
| 1+5 | **Adaptar nível de acionamento** | ULN2803A dos sinaleiros | Um pino de 5 V / 20 mA não aciona um sinaleiro de 24 V. É a mesma função do **relé de interposição** entre CLP e contator |

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

### CI1 — ULN2803A · driver dos 4 sinaleiros de 24 V

| | |
|---|---|
| **Categoria** | 1 e 5 — adaptar nível e definir ponto de operação |
| **Quantidade** | 1 (um CI cobre os 4 canais, e ainda sobram 4) |
| **Onde fica** | Placa PI-1 |
| **Substitui** | Os 4 resistores de 220 Ω da versão anterior desta placa |

**O problema:** os sinaleiros do painel são **módulos 22 mm de 24 V**, que é o padrão industrial e o que dá ao painel a aparência certa. Um pino do Arduino entrega **5 V e no máximo 20 mA** — ele não tem tensão nem corrente para acionar um sinaleiro de 24 V. Ligar direto não acende nada e, dependendo de como for ligado, **destrói o pino**.

**A solução:** um **ULN2803A** — um único CI de 18 pinos com **8 canais Darlington**, cada um capaz de chavear até 500 mA em até 50 V, **com os diodos de proteção já integrados**. O Arduino comanda a entrada em 5 V; o CI chaveia os 24 V.

> ⭐ **Repare no que aconteceu com a contagem de componentes.** Trocar os LEDs de 5 V por sinaleiros de 24 V parece "complicar", mas o resultado foi o oposto: **saíram 4 resistores e entrou 1 CI**. A placa ficou com **menos** peças, o painel ficou com aparência industrial de verdade, e ainda sobraram 4 canais livres para expansão.

**Como funciona (e por que o firmware não muda):** o ULN2803 é um **dreno** (open collector) — ele não fornece corrente, ele a puxa para o 0 V. O sinaleiro fica ligado permanentemente ao +24 V pelo lado positivo, e o CI **fecha o caminho para o 0 V** quando o Arduino manda. Como continua valendo **pino em nível alto = sinaleiro aceso**, o código do [Doc 40](../camada_4_programacao/40_firmware_arduino.md) **não muda nenhuma linha**.

```
                    +24 V PERMANENTE (BD-24V)
                       │
                       ├──────────────► terminal + do sinaleiro
                       │                        │
                       │                   (SINALEIRO 22 mm 24 V)
                       │                        │
                       │                        ▼ terminal −
       ┌───────────────┴──────────────────────────────────┐
       │  pino 10 (COM) ── diodos de proteção internos    │
       │                                                   │
   D9 ─┤ IN1 (pino 1)                    OUT1 (pino 18) ├──┘
  D10 ─┤ IN2 (pino 2)                    OUT2 (pino 17) ├── LED azul −
  D11 ─┤ IN3 (pino 3)                    OUT3 (pino 16) ├── LED amarelo −
  D12 ─┤ IN4 (pino 4)                    OUT4 (pino 15) ├── LED vermelho −
       │ IN5..IN8 (5,6,7,8)   RESERVA    OUT5..OUT8      │
       │  pino 9 (GND) ──────────────────────────────► 0 V
       └───────────────────────────────────────────────────┘
                     ULN2803A  ·  8 canais Darlington
```

| Pino do CI1 | Nome | Vai para |
|---|---|---|
| **1** | IN1 | Borne `D9` → Arduino **D9** (LED verde · RUN) |
| **2** | IN2 | Borne `D10` → Arduino **D10** (LED azul · COOL) |
| **3** | IN3 | Borne `D11` → Arduino **D11** (LED amarelo · HEAT) |
| **4** | IN4 | Borne `D12` → Arduino **D12** (LED vermelho · FAULT) |
| 5, 6, 7, 8 | IN5–IN8 | **Livres** — reserva de expansão, deixe sem ligação |
| **9** | **GND** | **0 V** (BD-0V) |
| **10** | **COM** | ⚠️ **+24 V do BD-24V** — é o retorno dos diodos de proteção internos |
| **18** | OUT1 | Borne `L1−` → terminal **negativo** do sinaleiro **verde** |
| **17** | OUT2 | Borne `L2−` → terminal negativo do sinaleiro **azul** |
| **16** | OUT3 | Borne `L3−` → terminal negativo do sinaleiro **amarelo** |
| **15** | OUT4 | Borne `L4−` → terminal negativo do sinaleiro **vermelho** |
| 14, 13, 12, 11 | OUT5–OUT8 | Livres |

> ⚠️ **O pino 10 (COM) não é opcional.** É por ele que os diodos internos de proteção se referenciam ao +24 V. Sem essa ligação os diodos não fazem nada, e o CI fica exposto a picos indutivos. Custa um fio.
>
> ⚠️ **Não existe resistor de entrada.** O ULN2803 já traz um resistor de 2,7 kΩ em série com a base de cada Darlington, dentro do chip — por isso ele aceita ser comandado direto por um pino de 5 V. **Acrescentar resistor por fora só reduz o brilho.**

> 🔌 **De onde vêm os 24 V dos sinaleiros: do BD-24V (permanente), NÃO do BD-POT.** Isso é intencional e importante: **o sinaleiro vermelho de FALHA precisa continuar aceso com a emergência acionada.** Se os sinaleiros fossem alimentados pelo barramento comutado, apertar o cogumelo apagaria justamente a luz que informa que algo está errado.

**Ensaio:** no comissionamento, forçar cada saída em HIGH pelo firmware de teste e confirmar o acendimento. Com o canal ligado, medir do terminal negativo do sinaleiro ao 0 V: deve dar **~0,9 a 1,1 V** (a queda de saturação do Darlington). Se der 24 V, o canal não está conduzindo; se der 0 V exato, desconfie de curto.

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

## 33.3 ✂️ Da placa de 7 × 9 cm até a placa do painel

As placas ilhadas compradas são de **7 × 9 cm**. As duas placas do projeto — PI-1 e PI-2 — saem cada uma de uma delas, com **um corte reto só**.

### A largura já vem certa

| | Placa comprada | Precisamos | Sobra |
|---|---:|---:|---:|
| Colunas | **24** | 24 | **0** |
| Fileiras | **36** | 29 | **7** |

⭐ **Isso é sorte útil:** 24 colunas × 2,54 = **60,96 mm**, que é exatamente o que cabe nos 61 mm úteis da caixa DIN de 4 módulos. Não é preciso cortar a largura — **só a altura**, e num corte reto ao longo de uma fileira de furos. Nada de recorte em L, nada de canto.

> ⚠️ **Conte os furos quando a placa chegar.** Há versões de 7 × 9 cm com **25 × 35** furos em vez de 24 × 36. Se a sua vier assim, o layout ainda cabe (sobra uma coluna), mas confira antes de cortar. O script `npm run valida:pi2` compara os dois números e reprova se o layout não couber.

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

### Como cortar sem lascar

1. Marque a **fileira 30** — a primeira que sai
2. Risque com **estilete apoiado numa régua de metal**, na linha **entre** furos, nunca em cima deles
3. Risque dos **dois lados** da placa, 3 ou 4 passadas em cada
4. Quebre apoiando na **quina da bancada**, com a linha do risco na borda
5. Passe uma lixa fina na aresta

> 💡 **Guarde a tira que sai** (24 × 7 furos). Ela serve de **gabarito**: encaixe os bornes nela primeiro para conferir o espaçamento das vias antes de soldar na placa boa. Errar o passo do borne na sobra não custa nada.

### 🔎 O que os desenhos do aplicativo mostram

Na aba **"Dentro do painel"**, clicando na PI-1 ou na PI-2 e depois em **"Ver a placa e como soldar"**, aparecem os **dois lados separados**:

| Lado | O que tem | Como é desenhado |
|---|---|---|
| 🔺 **Componentes** (cima) | bornes, resistores, capacitores, CI ou módulos | como você vê na bancada |
| 🔻 **Solda** (baixo) | barramento de 0 V, pontes de nó, **todos os fios** | ⚠️ **ESPELHADO** |

> 🔥 **Por que o lado de baixo é espelhado.** Porque é assim que você o enxerga quando **vira a placa na mão**: a coluna 1, que estava à esquerda, passa para a direita. Um desenho não espelhado obriga você a fazer essa inversão de cabeça a cada fio — e é a **causa número um de fio soldado no furo errado**.
>
> Os dois desenhos trazem um **marco vermelho no furo (1,1)**. Confira esse marco antes de soldar cada fio: em cima ele fica à esquerda, embaixo à direita. Se os dois estiverem do mesmo lado na sua cabeça, pare.

📋 A lateral traz a **lista dos fios** com o comprimento a cortar (distância entre furos + 15 mm para descascar e sobrar folga) e uma **caixa para riscar** conforme você solda. As marcações ficam salvas no navegador — dá para fechar e voltar no dia seguinte.

---

## 33.4 A Placa de Interface PI-1 — construção

### Onde fica no painel

| | |
|---|---|
| **Trilho** | **3 (controle)**, imediatamente ao lado do Arduino |
| **Posição** | X = 310 mm (no espaço livre atual do trilho) |
| **Invólucro** | **Caixa modular DIN de 4 módulos (70 mm)** |
| **Placa interna** | Ilhada, **24 × 29 furos** = 61 × 74 mm |
| **Bornes** | Tipo **KF301 (passo 5,08 mm)** — todos os fios são de 0,25 mm² |

> ⚠️ **Por que 4 módulos e não 3.** O borne J1 tem **11 vias**. Em passo de 5,08 mm isso dá `11 × 5,08 = 55,9 mm`, e uma caixa de 3 módulos oferece só ~45 mm úteis — **não cabe**. A caixa de 4 módulos dá 61 mm de placa, com 5 mm de folga.

> ⚠️ **A placa precisa dos ~52 mm que hoje estão livres no trilho 3.** Para caber, zere os vãos de 5 mm entre o Arduino, a DNLCB30 e o módulo SD/RTC. Se preferir uma placa mais folgada, o **trilho 1 tem ~86 mm livres** desde que a placa Zener e os porta-fusíveis F4/F5 saíram do projeto — mas aí o cabo SPI do SD fica mais longo, o que é pior. **Recomendação: 3M no trilho 3.**

> 🔧 **Use placa ILHADA, não a de barramento.** Na placa ilhada cada furo é uma ilha isolada, e você define as ligações com as próprias pernas dos componentes e fios de cobre por baixo. Na de barramento, faixas inteiras já vêm ligadas e você acaba tendo que cortar trilha — que é justamente onde nascem os curtos difíceis de achar.

### Bornes — o que entra e o que sai

```
        ┌─────────── BORNE SUPERIOR · lado ARDUINO ───────────┐
        │  A0   A1   D2   D25   D9   D10  D11  D12  +5V   0V  │
        └──┬────┬────┬─────┬─────┬────┬────┬────┬────┬─────┬──┘
           │    │    │     │     │    │    │    │    │     │
        ┌──┴────┴────┴─────┴─────┴────┴────┴────┴────┴─────┴──┐
        │                                                      │
        │   C1   C2      R1  R2  C3      R3                    │
        │  100n 100n    22k 4k7 100n    4k7                    │
        │                        ╔══════════════════╗          │
        │                        ║    CI1           ║          │
        │                        ║   ULN2803A       ║          │
        │                        ╚══════════════════╝          │
        │             PI-1 · PLACA DE INTERFACE                │
        └──┬────┬─────┬──────┬─────┬────┬────┬────┬────┬──────┘
           │    │     │      │     │    │    │    │    │
        ┌──┴────┴─────┴──────┴─────┴────┴────┴────┴────┴──────┐
        │IS#1 IS#2  24V-POT 24V-SRV DATA  L1−  L2−  L3−  L4−  │
        └────────── BORNE INFERIOR · lado CAMPO ──────────────┘
```

| Borne | Via | Sinal | Vai para |
|---|---|---|---|
| **Superior** (lado Arduino) | 1 | A0 | Arduino pino A0 |
| | 2 | A1 | Arduino pino A1 |
| | 3 | D2 | Arduino pino D2 |
| | 4 | D25 | Arduino pino D25 |
| | 5–8 | D9 · D10 · D11 · D12 | Arduino → entradas IN1–IN4 do ULN2803 |
| | 9 | +5 V | Bloco **BD-5V** (só o pull-up do 1-Wire) |
| | 10 | 0 V | Bloco **BD-0V** |
| **Inferior** (lado campo) | 1 | IS #1 | `R_IS` do BTS7960 #1 |
| | 2 | IS #2 | `R_IS` do BTS7960 #2 |
| | 3 | **24V-POT** ⚠️ | Bloco **BD-POT** (comutado) → braço superior do divisor |
| | 4 | **24V-SRV** ⚠️ | Bloco **BD-24V** (permanente) → pino **COM** do ULN2803 |
| | 5 | DATA | DS18B20 na câmara (fio amarelo) |
| | 6–9 | L1− · L2− · L3− · L4− | Terminal **negativo** dos 4 sinaleiros da porta |

> ⚠️ **São DUAS vias de 24 V, de origens diferentes, e trocá-las quebra o projeto.**
>
> | Via | Origem | Se você trocar |
> |---|---|---|
> | **24V-POT** | BD-POT — **cai com a emergência** | O Arduino passa a achar que a potência está sempre presente e aceita dar START sem energia |
> | **24V-SRV** | BD-24V — **permanente** | O sinaleiro vermelho de FALHA apaga justamente quando a emergência é acionada |
>
> **Anilhas de cores diferentes nas duas**, e as duas nas extremidades do borne, longe das vias de sinal. É onde 24 V convive com lógica de 5 V — um fio solto ali leva o Arduino junto.

> 📌 **O terminal POSITIVO dos 4 sinaleiros não passa pela placa.** Vai direto do **BD-24V** para os sinaleiros na porta. Só o negativo volta para a PI-1, onde o ULN2803 o puxa para 0 V. Isso economiza 4 vias de borne e deixa a fiação da porta mais limpa.

### 📐 Esquema elétrico — 4 circuitos independentes

> 🖼️ **Três desenhos, com finalidades diferentes:**
> - [**Circuito em norma IEC**](../desenhos/10_placa_pi1_circuito.png) ⭐ — esquema elétrico com símbolos normalizados. **Arquivo editável:** [`10_placa_pi1_circuito.cddx`](../desenhos/10_placa_pi1_circuito.cddx)
> - [**Diagrama de ligação**](../desenhos/09_placa_pi1_montagem.svg) — a placa vista de cima, com o caminho físico de cada fio
> - [**Esquema em blocos**](../desenhos/08_placa_pi1_esquema.svg) — os 4 circuitos separados, com explicação
>
> 💡 **Para editar o `.cddx`:** abra o [editor web do Circuit Diagram](https://www.circuit-diagram.org/editor) (gratuito, roda no navegador, não instala nada) e arraste o arquivo para dentro. Dá para mover peças, mudar valores e exportar de novo.
>
> ⚙️ **Como o desenho foi gerado:** o `.cddx` é um formato aberto (ZIP com XML). Ele foi escrito por script e renderizado com a `circuit-diagram-cli` oficial. Se você mudar o circuito, dá para regerar a imagem sem abrir editor nenhum.
>
> 📌 Os capacitores aparecem como **100000 pF**, que é a mesma coisa que **100 nF** — é só a notação que a ferramenta escolhe.

### Como ler o desenho do circuito

**A linha horizontal grossa embaixo é o barramento de 0 V.** Os pontinhos cheios sobre ela são **nós** — onde os fios realmente se juntam. Repare que C1, C2, R2 e C3 descem todos até ela: é o mesmo 0 V para todos, e por isso existe **um único borne "0 V"**.

**Os quatro circuitos de cima não se tocam entre si** — só se encontram no barramento. Da esquerda para a direita:

| Circuito | O que faz |
|---|---|
| **C1** entre `J1·A0` e o 0 V | Filtra o ruído do pino IS do BTS #1 |
| **C2** entre `J1·A1` e o 0 V | Idem, BTS #2 |
| **R3** entre `J2·+5V` e `J1·D2` | Pull-up do sensor. **Não desce ao 0 V** |
| **R1 + R2 + C3** | Divisor: os 24 V entram por `J2·24V-POT`, viram 4,2 V no nó e saem por `J1·D25` |

**No ULN2803, cada pino mostra o número real do CI e para onde vai o fio.** Confira contra o chip físico: o pino 1 fica ao lado do chanfro.

| Pino | Liga em |
|---|---|
| 1 · IN1 · 2 · IN2 · 3 · IN3 · 4 · IN4 | `J1·D9` · `D10` · `D11` · `D12` |
| **9 · GND** | Barramento de 0 V |
| **10 · COM** | `J2·24V-SRV` (24 V permanente) |
| 18 · OUT1 · 17 · OUT2 · 16 · OUT3 · 15 · OUT4 | `J2·L1−` · `L2−` · `L3−` · `L4−` |

⚠️ **Repare na numeração:** entradas e saídas ficam **frente a frente** — IN1 em cima à esquerda, OUT1 em cima à direita. Os pinos 5 a 8 e 11 a 14 ficam sem uso.

> 🖼️ **Detalhamento adicional:**
> - [**Esquema elétrico**](../desenhos/08_placa_pi1_esquema.svg) — mostra **como funciona** (os 4 circuitos separados)
> - [**Diagrama de ligação**](../desenhos/09_placa_pi1_montagem.svg) ⭐ — mostra **onde cada fio vai**. **É este que você usa para montar**

### ⭐ J1 = ENTRADAS · J2 = SAÍDAS

**O fluxo é sempre o mesmo:** o fio chega em **J1**, atravessa o componente eletrônico, e sai por **J2** para o destino.

```
   vem de algum lugar ──► J1 ──► [componente] ──► J2 ──► vai para algum lugar
```

#### J1 — ENTRADAS (11 vias) · de onde vem cada fio

| Via | Sinal | **Vem de** | Cor |
|---|---|---|---|
| 1 | `IS#1` | **BTS7960 #1**, pino `R_IS` | amarelo |
| 2 | `IS#2` | **BTS7960 #2**, pino `R_IS` | amarelo |
| 3 | `DATA` | **DS18B20** na câmara (fio de dados) | amarelo |
| 4 | `24V-POT` | **BD-POT** — 24 V comutado pelo KA2 | vermelho ⚠️ |
| 5 | `D9` | **Arduino** pino D9 | azul |
| 6 | `D10` | **Arduino** pino D10 | azul |
| 7 | `D11` | **Arduino** pino D11 | azul |
| 8 | `D12` | **Arduino** pino D12 | azul |
| 9 | `0V` | **BD-0V** — o star ground | preto |
| 10 | `24V-SRV` | **BD-24V** — 24 V permanente | vermelho ⚠️ |
| 11 | `+5V` | **BD-5V** | vermelho |

#### J2 — SAÍDAS (8 vias) · para onde vai cada fio

| Via | Sinal | **Vai para** | Cor |
|---|---|---|---|
| 1 | `A0` | **Arduino** pino A0 (sinal já filtrado) | amarelo |
| 2 | `A1` | **Arduino** pino A1 (sinal já filtrado) | amarelo |
| 3 | `D2` | **Arduino** pino D2 (com pull-up aplicado) | amarelo |
| 4 | `D25` | **Arduino** pino D25 (24 V reduzidos a 4,2 V) | azul |
| 5 | `L1−` | Sinaleiro **verde** (RUN) — terminal negativo | preto |
| 6 | `L2−` | Sinaleiro **azul** (COOL) | preto |
| 7 | `L3−` | Sinaleiro **amarelo** (HEAT) | preto |
| 8 | `L4−` | Sinaleiro **vermelho** (FAULT) | preto |

> ⚠️ **As duas vias de 24 V têm origens diferentes e não podem ser trocadas.** `24V-POT` vem do barramento **comutado** (cai na emergência) e serve só para **medir**; `24V-SRV` vem do **permanente** e alimenta o CI, para o sinaleiro de FALHA continuar aceso quando a emergência for acionada. **Anilhas de cores diferentes nas duas.**

> 📌 **O positivo dos sinaleiros não passa pela placa.** Vai direto do BD-24V às lâmpadas; só o negativo volta para a PI-1, onde o ULN2803 o puxa para o 0 V.

### 🔌 O 0 V é ÚNICO no projeto inteiro

Dúvida comum: *"são 3 neutros — o do 24 V, o do 12 V e o do 5 V?"* **Não.**

Os **LM2596 são conversores NÃO ISOLADOS**: o 0 V da entrada e o da saída são o **mesmo condutor**, ligado por dentro do módulo.

```
   FONTE 24 V
    +24 ──────────────► [LM2596] ──────► +5,10 V
      0 ────────────────────┴───────────────┴──── 0 V
                        ▲ é o MESMO fio, atravessa reto
```

**E tem que ser único, não é só conveniência:** o Arduino mede o pino A0 **em relação ao 0 V dele**. Se o 0 V do BTS fosse outro ponto, a leitura não significaria nada. Sinal só tem sentido contra uma referência comum.

> ⚠️ **A confusão vem de pensar em corrente alternada**, onde cada secundário de transformador tem o seu neutro isolado. Em CC com conversor buck, **o negativo passa direto**.

Por isso existe **um único bloco BD-0V**, e o nome dele é **star ground**: todos os retornos convergem para um ponto só. Se você emendasse um retorno no outro, a corrente de uma carga criaria queda de tensão que a seguinte enxergaria como ruído.

### 📐 Esquema elétrico — 4 circuitos independentes

> 🖼️ **Três desenhos, com finalidades diferentes:**
> - [**Circuito em norma IEC**](../desenhos/10_placa_pi1_circuito.png) ⭐ — esquema elétrico com símbolos normalizados. **Arquivo editável:** [`10_placa_pi1_circuito.cddx`](../desenhos/10_placa_pi1_circuito.cddx)
> - [**Diagrama de ligação**](../desenhos/09_placa_pi1_montagem.svg) — a placa vista de cima, com o caminho físico de cada fio
> - [**Esquema em blocos**](../desenhos/08_placa_pi1_esquema.svg) — os 4 circuitos separados, com explicação
>
> 💡 **Para editar o `.cddx`:** abra o [editor web do Circuit Diagram](https://www.circuit-diagram.org/editor) (gratuito, roda no navegador, não instala nada) e arraste o arquivo para dentro. Dá para mover peças, mudar valores e exportar de novo.
>
> ⚙️ **Como o desenho foi gerado:** o `.cddx` é um formato aberto (ZIP com XML). Ele foi escrito por script e renderizado com a `circuit-diagram-cli` oficial. Se você mudar o circuito, dá para regerar a imagem sem abrir editor nenhum.
>
> 📌 Os capacitores aparecem como **100000 pF**, que é a mesma coisa que **100 nF** — é só a notação que a ferramenta escolhe.

### Como ler o desenho do circuito

**A linha horizontal grossa embaixo é o barramento de 0 V.** Os pontinhos cheios sobre ela são **nós** — onde os fios realmente se juntam. Repare que C1, C2, R2 e C3 descem todos até ela: é o mesmo 0 V para todos, e por isso existe **um único borne "0 V"**.

**Os quatro circuitos de cima não se tocam entre si** — só se encontram no barramento. Da esquerda para a direita:

| Circuito | O que faz |
|---|---|
| **C1** entre `J1·A0` e o 0 V | Filtra o ruído do pino IS do BTS #1 |
| **C2** entre `J1·A1` e o 0 V | Idem, BTS #2 |
| **R3** entre `J2·+5V` e `J1·D2` | Pull-up do sensor. **Não desce ao 0 V** |
| **R1 + R2 + C3** | Divisor: os 24 V entram por `J2·24V-POT`, viram 4,2 V no nó e saem por `J1·D25` |

**No ULN2803, cada pino mostra o número real do CI e para onde vai o fio.** Confira contra o chip físico: o pino 1 fica ao lado do chanfro.

| Pino | Liga em |
|---|---|
| 1 · IN1 · 2 · IN2 · 3 · IN3 · 4 · IN4 | `J1·D9` · `D10` · `D11` · `D12` |
| **9 · GND** | Barramento de 0 V |
| **10 · COM** | `J2·24V-SRV` (24 V permanente) |
| 18 · OUT1 · 17 · OUT2 · 16 · OUT3 · 15 · OUT4 | `J2·L1−` · `L2−` · `L3−` · `L4−` |

⚠️ **Repare na numeração:** entradas e saídas ficam **frente a frente** — IN1 em cima à esquerda, OUT1 em cima à direita. Os pinos 5 a 8 e 11 a 14 ficam sem uso.

> 🖼️ **Detalhamento adicional:**
> - [**Esquema elétrico**](../desenhos/08_placa_pi1_esquema.svg) — mostra **como funciona** (os 4 circuitos separados)
> - [**Diagrama de ligação**](../desenhos/09_placa_pi1_montagem.svg) ⭐ — mostra **onde cada fio vai**. **É este que você usa para montar**

### ⚠️ Os bornes NÃO são "entrada" e "saída"

Confusão comum, e a nomenclatura anterior tinha culpa. Eles são divididos por **para onde o fio vai fisicamente**:

| Borne | Regra, sem exceção |
|---|---|
| **J1** (borda de cima) | **Só ENTRA.** 11 vias. Nada sai por aqui. |
| **J2** (borda de baixo) | **Só SAI.** 8 vias. Nada entra por aqui. |

**O fluxo é sempre o mesmo, de cima para baixo:**

```
   vem de algum lugar ──► J1 ──► [componente] ──► J2 ──► vai para algum lugar
```

Isso vale até para os sinais que a placa apenas *atravessa*. O IS#1 entra por `J1-1`, encosta no capacitor e sai por `J2-1` já chamado de `A0`. **O sinal muda de nome ao atravessar a placa**, e isso é proposital: o nome diz em que ponto do caminho ele está.

| Via | O que é |
|---|---|
| `J1-5` · D9 | Arduino **→** placa |
| `J1-11` · 24V-POT | Painel **→** placa (só para ser medido) |
| `J2-1` · A0 | Placa **→** Arduino, já filtrado |
| `J2-4` · L1− | Placa **→** sinaleiro |

📌 **As duas vias de 24 V ficam nas pontas de J1** (`J1-10` = 24V-SRV, `J1-11` = 24V-POT), longe das vias de sinal — é ali que 24 V convive com lógica de 5 V, e um fio solto leva o Arduino junto. **Anilhas de cores diferentes nas duas.**

**A chave para não se perder:** os 4 circuitos da placa **não se tocam** — a única coisa que compartilham é o barramento de 0 V. Estude um de cada vez.

#### Bloco A — Filtro dos pinos IS (são 2, idênticos)

```
   J1-1 (IS#1) ──●──► J2-1 (A0)     J1-2 (IS#2) ──●──► J2-2 (A1)
                  │                                 │
                ══╪══ C1 · 100 nF                  ══╪══ C2 · 100 nF
                  │                                 │
                 ─┴─ 0 V                           ─┴─ 0 V
```

#### Bloco B — Divisor que lê os 24 V

```
   J1-11 (24V-POT) ──┤ R1 · 22 kΩ ├──●──────────► J2-8 (D25)
                                     │
                           ┌─────────┴─────────┐
                           │                   │
                     ┤ R2 · 4,7 kΩ ├         ══╪══ C3 · 100 nF
                           │                   │
                          ─┴─ 0 V             ─┴─ 0 V
```

⚠️ **R2 e C3 ficam em PARALELO**, os dois ligados do **nó D25** ao 0 V. O C3 não tem relação nenhuma com os pinos dos sinaleiros.

#### Bloco C — Pull-up do sensor de temperatura

```
   J1-4 (+5V) ───┤ R3 · 4,7 kΩ ├───●───► J2-3 (D2)
                                    │
                            J1-3 (DATA, vem do sensor)
```

Um resistor entre dois pontos. **Não toca no 0 V.**

#### Bloco D — Driver dos sinaleiros

```
                    ┌──────────────────────┐
    J1-5 (D9)  ─────┤ 1  IN1      OUT1  18 ├─────► J2-4 (L1−)
    J1-6 (D10) ─────┤ 2  IN2      OUT2  17 ├─────► J2-5 (L2−)
    J1-7 (D11) ─────┤ 3  IN3      OUT3  16 ├─────► J2-6 (L3−)
    J1-8 (D12) ─────┤ 4  IN4      OUT4  15 ├─────► J2-7 (L4−)
                    │ 5..8  IN5-8  OUT5-8 11..14│  (livres)
           0 V ─────┤ 9  GND      COM   10 ├───── J1-10 (24V-SRV)
                    └──────────────────────┘
                            ULN2803A
```

### Lista de ligações — confira uma a uma

| # | De | Para | Componente |
|---|---|---|---|
| 1 | nó **A0** | barramento 0 V | **C1** (100 nF) |
| 2 | nó **A1** | barramento 0 V | **C2** (100 nF) |
| 3 | **J1-4** (+5V) | nó **1-Wire** | **R3** (4,7 kΩ) |
| 4 | **J1-11** (24V-POT) | nó **D25** | **R1** (22 kΩ) |
| 5 | nó **D25** | barramento 0 V | **R2** (4,7 kΩ) |
| 6 | nó **D25** | barramento 0 V | **C3** (100 nF) |
| 7 | **J1-1** (IS#1) → nó A0 → **J2-1** | — | 2 fios |
| 8 | **J1-2** (IS#2) → nó A1 → **J2-2** | — | 2 fios |
| 9 | **J1-3** (DATA) → nó 1-Wire → **J2-3** | — | 2 fios |
| 10 | nó **D25** | **J2-8** (D25) | fio |
| 11–14 | **J1-5..8** (D9..D12) | soquete **pinos 1 · 2 · 3 · 4** | fio |
| 15 | soquete **pino 9** (GND) | barramento 0 V | fio |
| 16 | soquete **pino 10** (COM) | **J1-10** (24V-SRV) | fio |
| 17–20 | soquete **pinos 18 · 17 · 16 · 15** | **J2-4..7** (L1−..L4−) | fio |
| 21 | **J1-9** (0V) | barramento 0 V | fio |

**21 ligações · 7 componentes · 1 barramento · 1 ponte de nó.**

> 🖥️ **Confira no simulador antes de soldar.** O painel interativo desenha esta placa **furo por furo, em escala real**: [`painel_interativo/`](../painel_interativo/). Dê duplo clique na PI-1 e use o filtro dos 4 circuitos para estudar um de cada vez. O comando `npm run valida` confere sozinho se dois componentes disputam o mesmo furo.

### ⚠️ O passo do borne tem que ser 5,08 mm

| Passo | Casa com a placa ilhada? |
|---|---|
| 3,5 mm (KF350) | ❌ **Não** — a placa tem furos a cada 2,54 mm |
| **5,08 mm (KF301 / KRE)** | ✅ **Sim — é exatamente 2 furos** |

| Borne | Vias | Largura | Cabe nos 61 mm? |
|---|---|---|---|
| **J1** (entradas) | 11 | `11 × 5,08 = 55,9 mm` | ✅ com 5 mm de folga |
| **J2** (saídas) | 8 | `8 × 5,08 = 40,6 mm` | ✅ com folga |

Os pinos caem sempre em **coluna par** — via 1 na coluna 2, via 2 na coluna 4, e assim por diante. É isso que torna o desenho previsível na hora de montar.

### O barramento de 0 V

Um **fio de cobre nu** soldado numa fileira reta de furos, atravessando a placa. Todos os retornos se ligam a ele pelo furo mais próximo, em vez de correrem individualmente até o borne.

```
   ══════●═══●═══●═══●═══●══════
         │   │   │   │   │
        C1  C2  R2  C3  pino 9
```

**Solde o fio nu primeiro**, bem esticado, antes de qualquer componente.

### Roteiro de montagem

1. **Corte a placa ilhada** em **24 × 29 furos** (≈ 61 × 74 mm) com estilete e régua (risque dos dois lados e quebre) ou com serra de joalheiro. **Conte os furos em vez de medir com régua** — é mais confiável.
2. **Faça a montagem a seco primeiro:** posicione os 6 componentes discretos, o CI e os 2 bornes sem soldar, e confira que tudo cabe dentro da caixa DIN fechada.
3. **Solde os bornes primeiro**, nas duas bordas. São o que define a geometria.
4. **Solde um soquete DIP de 18 pinos** para o ULN2803 — não solde o CI direto. Assim você troca o chip sem dessoldar nada se ele queimar.
5. **Solde os componentes na ordem:** primeiro os resistores deitados, depois os capacitores.
6. **Faça as interligações por baixo com fio ISOLADO** de 0,25 mm² (não use "sobra de perna" em trechos longos — ela oxida e não é isolada).

> ⚠️ **Fio isolado nos jumpers, fio nu só no barramento.** São 20 jumpers, e vários precisam **cruzar por cima do barramento de 0 V** para alcançar o borne do outro lado. Se forem de fio nu, cada cruzamento vira um curto para o 0 V — e é o tipo de defeito que só aparece com tudo já montado. O **único** condutor nu da placa é o próprio barramento.
7. ⚠️ **Confira a orientação do CI:** o **chanfro / meia-lua** do ULN2803 fica do lado dos pinos 1 e 18. Inserir o CI girado 180° liga os 24 V do COM na entrada IN e destrói tanto o chip quanto o pino do Arduino.
8. **Confira com multímetro em modo continuidade, ANTES de energizar** (com o CI **fora** do soquete):
   - [ ] Não há continuidade entre **24V-POT** e **24V-SRV** — são circuitos diferentes
   - [ ] Não há continuidade entre nenhuma via de 24 V e nenhuma via de sinal
   - [ ] Não há continuidade entre **+5 V** e **0 V**
   - [ ] Resistência de D25 para 0 V ≈ 4,7 kΩ
   - [ ] Resistência de D2 para +5 V ≈ 4,7 kΩ
   - [ ] Continuidade de cada borne `Dx` até o respectivo pino de entrada do soquete
   - [ ] Continuidade de cada borne `Lx−` até o respectivo pino de saída do soquete
9. **Só então encaixe o ULN2803 no soquete.**
10. **Aplique verniz protetor** (spray para PCI ou esmalte incolor) no lado da solda, evitando os bornes e o soquete.
11. **Etiquete a frente da caixa** com uma impressão em papel adesivo: nome de cada via e a identificação **PI-1**.

> 🎯 **A etiqueta não é enfeite — é o que torna a placa auditável.** Um painel industrial identifica cada borne por norma, justamente para que outra pessoa consiga dar manutenção sem o projetista do lado.

---

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
| **Diodo 1N4007** | 4 | 🗑️ **Sai do painel.** Ele existiria como diodo de roda-livre das bobinas dos relés — mas **KA1 e KA2 são relés de interface com o roda-livre já embutido no módulo**. Os 4 diodos vão para o saquinho de sobressalentes, não para o projeto |
| ~~Diodo Zener 5V6 / 13 V / 15 V~~ | ~~6~~ | 🗑️ Já eliminados na revisão do Plano B — proteção nativa do LM2596. Ver [Doc 02 §2.6](../camada_0_fundamentos/02_arquitetura_de_energia.md) |

> 💡 **Repare no padrão:** os componentes que saíram são justamente os da categoria "proteção" — e saíram porque **os módulos realmente já protegem**. Os que ficaram são todos de **interface**. A sua intuição sobre proteção estava correta; ela só não se aplicava a estes nove componentes, porque eles nunca foram proteção.

**Componentes discretos da maquete (fora do painel):** os 6 resistores de 2,2 kΩ dos LEDs da iluminação pública ([Doc 03 · M.4](../camada_0_fundamentos/03_lista_materiais.md)) seguem a mesma regra — **não podem ficar no ar**. Monte cada um dentro da base do poste de iluminação, com termorretrátil, ou numa mini placa ilhada escondida sob a base da maquete.

---

## 33.8 ✅ Decisão tomada — sinaleiros de 24 V no painel, LEDs de 5 V na maquete

A dúvida sobre a tensão dos LEDs está resolvida, e a divisão é por **onde** o LED fica:

| | **Painel — sinaleiros 22 mm** | **Maquete — iluminação pública** |
|---|---|---|
| Tensão | ⭐ **24 V** | ⭐ **5 V** (LED branco, Vf ≈ 3,1 V) |
| Quantidade | 4 (RUN, COOL, HEAT, FAULT) | 4 (3 luminárias da rua + 1 guarita) |
| Acionamento | **ULN2803A** na placa PI-1 | Direto do BD-5V, **sempre aceso** |
| Limitação de corrente | Interna ao sinaleiro de 24 V | **Resistor de 220 Ω** por LED |
| Alimentação | **BD-24V** (permanente) | **BD-5V** (ramal R2) |
| Onde ficam os componentes | CI1 na PI-1 | R4–R7 na base de cada poste |

**Por que essa divisão faz sentido:**

- **No painel**, o sinaleiro de 24 V é o componente industrial de verdade — corpo metálico, anel de 22 mm, difusor. Um LED de 5 mm espetado na porta entrega a mensagem de "protótipo escolar", e é a primeira coisa que a banca vê.
- **Na maquete**, o que se quer é um ponto de luz pequeno e discreto dentro de uma luminária de 180 mm de altura. Um LED de 3 mm em 5 V com 8,6 mA é exatamente isso; um sinaleiro de 24 V não caberia nem faria sentido cenográfico.

> ⭐ **E o balanço de componentes melhorou:** saíram **4 resistores** da placa e entrou **1 CI**. Os 220 Ω não foram descartados — foram realocados para a maquete, onde agora fazem falta.

---

## 33.9 Checklist de aceitação do Doc 33

### Placa PI-1
- [ ] Placa montada com os **6 componentes discretos + 1 CI** e os 2 bornes
- [ ] **ULN2803 em soquete DIP de 18 pinos**, com o chanfro do lado dos pinos 1 e 18
- [ ] Pino **10 (COM) ligado ao 24V-SRV** — sem ele os diodos internos não protegem nada
- [ ] Bornes identificados com etiqueta e anilhas nos cabos
- [ ] ⚠️ **As duas vias de 24 V nas extremidades do borne, com anilhas de cores DIFERENTES:** `24V-POT` (comutado, do BD-POT) e `24V-SRV` (permanente, do BD-24V)
- [ ] Ensaios de continuidade da §33.3 item 8, **todos** conferidos com o CI fora do soquete
- [ ] Verniz de proteção aplicado no lado da solda
- [ ] Caixa DIN de 3M encaixada no trilho 3, ao lado do Arduino

### Sinaleiros do painel
- [ ] 4 sinaleiros **22 mm de 24 V** montados na porta
- [ ] Terminal **positivo** dos 4 ligado direto ao **BD-24V** (não passa pela PI-1)
- [ ] Terminal **negativo** de cada um chegando ao respectivo borne `Lx−` da PI-1
- [ ] Teste: forçar cada saída em HIGH → sinaleiro acende; medir ~1 V do terminal negativo ao 0 V
- [ ] ⭐ **Teste da emergência:** com o cogumelo acionado, **o sinaleiro vermelho continua aceso**. Se apagar, os sinaleiros foram ligados no BD-POT em vez do BD-24V

### Nos BTS7960
- [ ] **10 kΩ soldado nos dois**, medindo ~10 kΩ entre `R_EN` e `GND`
- [ ] Com o Arduino desligado e o painel energizado, `R_EN` dos dois medindo **~0 V**
- [ ] Foto dos resistores soldados anexada ao relatório

### Demais verificações
- [ ] Divisor lendo **4,2 V ± 0,3 V** em D25 com o KA2 fechado, e **0 V** com a emergência acionada
- [ ] Pull-up do 1-Wire medindo ~4,7 kΩ entre D2 e +5 V
- [ ] **4× 220 Ω montados na base dos postes de iluminação da maquete**, com termorretrátil
- [ ] **Nenhum componente solto ou soldado no meio de cabo em todo o projeto**
- [ ] 4× 1N4007 guardados como sobressalentes, fora do painel

---

📄 **Anterior:** [Doc 32 — Sinais e Sensores](32_sinais_e_sensores.md) · **Próximo:** [Doc 40 — Firmware Arduino](../camada_4_programacao/40_firmware_arduino.md)
🖼️ **Desenhos relacionados:** [Layout do painel](../desenhos/04_painel_layout.svg) · [Diagrama de comando](../desenhos/06_diagrama_comando.svg)
