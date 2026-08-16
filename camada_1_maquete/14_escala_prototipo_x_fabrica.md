# CAMADA 1 · Doc 14 — Do protótipo às 50 posições

> ⭐ **Este documento responde à pergunta mais difícil que a banca pode fazer:** *"tudo bem na bancada com 2 posições, mas e na empresa, com 50?"*
>
> ✅ **Pré-requisito:** [Doc 13](13_posicoes_de_ensaio.md) — as posições de ensaio da bancada.

---

## 🟢 Em palavras simples

A bancada mede a corrente de **2 dispositivos** com **2 sensores INA219**. Um sensor por dispositivo.

Se a empresa tem **50 dispositivos**, a conta parece dar 50 sensores — e aí o projeto não escala. Este documento mostra que **a arquitetura muda de forma**, e não de tamanho.

E há uma boa notícia que muda tudo:

> 🏭 **A empresa já usa Arduino como padrão de fábrica.**

Isso significa que **não é preciso propor um CLP**. A solução para 50 posições cabe no mesmo ecossistema que os técnicos de lá já sabem manter — o que costuma valer mais que qualquer ganho técnico de trocar de plataforma.

---

## 14.1 O que muda, lado a lado

| | **Bancada — 2 posições** | **Fábrica — 50 posições** |
|---|---|---|
| Sensor | 2 × INA219 | 50 × resistor *shunt* |
| Medição | um circuito por canal | **um circuito para 16 canais** |
| Como escolhe o canal | endereço I²C | **multiplexador** |
| Conversor A/D | dentro do INA219 | o do próprio Arduino |
| Pinos usados | 2 (o I²C que já existia) | **8** para 64 canais |
| Custo por canal | ~R$ 15 | **~R$ 2** |
| Fios até o controlador | 2 (I²C) | 2 (RS-485), com suportes |

**Repare que o que não muda:** o princípio. Nos dois casos você mede a corrente de cada posição e compara com o normal dela. Muda só **como o mesmo circuito de medição atende muitos canais**.

---

## 14.2 Por que 50 INA219 não é o caminho

Não é o preço — R$ 750 numa fábrica não é obstáculo. São três problemas técnicos:

**1. O barramento I²C não aguenta.** Cada módulo acrescenta capacitância nos fios. O I²C tolera cerca de 400 pF no total; com 50 módulos e a fiação, passa disso e o barramento simplesmente para de responder.

**2. Endereços acabam.** O INA219 tem **16 endereços** (0x40 a 0x4F). Cinquenta não cabem, e resolver com multiplexador de I²C só empilha complexidade.

**3. Manutenção.** Cinquenta plaquinhas, cada uma com um jumper de endereço diferente. Trocar uma exige saber qual endereço ela tinha. É o tipo de sistema que ninguém quer herdar.

---

## 14.3 ⭐ A solução para 50 canais com Arduino

### A peça central: multiplexador analógico

> **Modelo para pesquisar: `CD74HC4067`**
> Busque por **"modulo multiplexador analogico 16 canais CD74HC4067"**. Custa cerca de **R$ 6** e vem em plaquinha pronta.

Um multiplexador é uma **chave rotativa eletrônica**: ele conecta **um** de 16 pontos à mesma saída, e o Arduino escolhe qual através de 4 pinos digitais.

```
   posição 1  ──┐
   posição 2  ──┤
   posição 3  ──┤     ┌──────────────┐
      ...       ├────►│ CD74HC4067   │───► uma entrada
   posição 16 ──┘     │  16 → 1      │     analógica
                      └──────┬───────┘
                             ▲
                   S0 S1 S2 S3 — 4 pinos digitais
                   escolhem o canal (0000 a 1111)
```

### ⚠️ O shunt fica no RETORNO — e isso muda a fiação

Antes de tudo, é preciso saber **onde** o resistor de medição entra no circuito, porque isso decide quantos fios vão para a câmara.

```
   BD-24V ──[fusível]──────────────────────────────► DUT 1 ──┐
                        (o positivo NÃO passa                │
                         pela placa de medição)              │
                                                             │
   BD-0V ◄──[shunt 4,7 Ω]◄─────────────────────────── retorno┘
              ▲
         é aqui que se mede
```

**Por que embaixo e não em cima:** a tensão sobre o shunt precisa estar referenciada ao 0 V para o multiplexador e o ADC conseguirem lê-la. Se o shunt ficasse no positivo, os 0,6 V estariam empoleirados sobre 24 V — e aí seria preciso um amplificador diferencial por canal, que é justamente o custo que se quer evitar.

**Consequência prática, e ela importa:**

> 🔌 **São 4 fios para a câmara, não 3.** Dois positivos, que vão do fusível direto para os dispositivos, e **dois retornos individuais**, que voltam para a placa de medição.

Os retornos **não podem ser comuns**. Se as duas voltas se juntassem antes do shunt, as correntes se somariam e não haveria como separar quem é quem — que é exatamente o que o projeto precisa saber.

📌 **Isso escala junto:** com 50 posições são 100 fios até as câmaras. É mais um motivo para o suporte instrumentado ficar **junto dos dispositivos** e não no painel: o par de cada posição fica curto, e o que atravessa a fábrica é só o barramento digital.

### ⭐ Como o sistema sabe QUAL parou

Esta é a dúvida natural: se os 16 canais entram numa entrada só, como distinguir um do outro?

**Porque o multiplexador não mistura — ele escolhe.** Ele é uma chave, não um somador. Num instante só existe um canal ligado à saída.

```
   S0 S1 S2 S3 = 0 0 0 0   →  SIG traz a corrente da POSIÇÃO 1
   S0 S1 S2 S3 = 1 0 0 0   →  SIG traz a corrente da POSIÇÃO 2
   S0 S1 S2 S3 = 0 1 0 0   →  SIG traz a corrente da POSIÇÃO 3
```

**Quem escolheu foi o Arduino.** Então, quando ele lê 0 V na entrada, ele sabe exatamente de quem é aquele zero — porque foi ele que acabou de selecionar o canal.

```cpp
for (uint8_t canal = 0; canal < 16; canal++) {
    selecionarCanal(canal);          // escreve os 4 bits em S0–S3
    delayMicroseconds(50);           // deixa acomodar
    corrente[canal] = analogRead(A2) * FATOR_mA;
    // se corrente[canal] cair a zero, o dispositivo do canal `canal` morreu
}
```

💡 **A analogia:** é um multímetro com uma chave seletora. Você não precisa de 16 multímetros — precisa de um e girar o botão. O Arduino gira o botão 16 vezes por varredura, e sabe em que posição ele estava a cada leitura.

### Como medir a corrente sem amplificador

Aqui há um truque que simplifica muito: **use um shunt grande**.

Num medidor de precisão o shunt é pequeno (0,1 Ω) para não atrapalhar a carga, e aí a tensão sai em milivolts e precisa de amplificador. Mas o nosso DUT consome pouco e não se importa em perder meio volt:

| | Conta | Resultado |
|---|---|---|
| Shunt | **4,7 Ω · 1% · 1/4 W** | — |
| Tensão com 127 mA | 0,127 × 4,7 | **0,60 V** |
| Leitura no Arduino (10 bits, 5 V) | 0,60 ÷ 0,00488 | **123 contagens** |
| Resolução | — | **~1 mA** |
| Calor no resistor | 0,127² × 4,7 | **0,076 W** — nem esquenta |
| Perda para o DUT | 0,60 de 24 V | **2,5%** — irrelevante |

**Sem amplificador, sem INA219, sem I²C.** Um resistor de centavos e a entrada analógica que o Arduino já tem.

### O conjunto completo

```
  50 posições
      │
      ├── 50 shunts de 4,7 Ω (lado do retorno)
      │
      ├──►[ CD74HC4067 #1 ]──► A2  ┐
      ├──►[ CD74HC4067 #2 ]──► A3  │  S0–S3 compartilhados
      ├──►[ CD74HC4067 #3 ]──► A4  │  entre os quatro
      └──►[ CD74HC4067 #4 ]──► A5  ┘
                                      = 8 pinos para 64 canais
```

| Item | Qtd | Preço aprox. |
|---|---:|---:|
| Módulo CD74HC4067 | 4 | R$ 24 |
| Resistor 4,7 Ω 1% | 50 | R$ 15 |
| Bornes e placa | — | R$ 60 |
| | **Total** | **~R$ 100** |

Contra **~R$ 750** em 50 INA219 — e usando **8 pinos** em vez de estourar o barramento.

### Quanto tempo leva para varrer tudo

Uma leitura analógica no Arduino leva cerca de 110 µs, e o multiplexador precisa de alguns microssegundos para estabilizar. Arredondando para **200 µs por canal**:

`64 canais × 200 µs = 12,8 ms`

**A varredura completa leva 13 milissegundos.** Rodando uma vez por segundo, sobra 98,7% do tempo do processador para o resto. E como um dispositivo morto continua morto, uma varredura por segundo é generosa.

---

## 14.4 ⭐ "Então com 50 seriam 50 fios de retorno?"

**Sim — e é aqui que a arquitetura mostra por que ela funciona.**

Cada dispositivo precisa do seu próprio caminho de volta, senão as correntes se somam e a medição perde o sentido. Isso é inescapável: **medição individual exige retorno individual**.

A pergunta certa não é *"como evitar os 50 retornos"*, é **"onde eles ficam"**.

### O erro seria trazer os 50 até o painel

```
   ❌  50 câmaras/posições ─── 100 fios de 20 m ───► painel
```

Cem fios atravessando a fábrica, cem pontos de mau contato, e sinal de milivolts viajando ao lado de motores. Inviável.

### O certo: a medição vai até os dispositivos

```
   ✅  ┌─── SUPORTE (dentro do rack, junto dos DUTs) ───┐
       │                                                 │
       │   soquete 1 ──┐                                 │
       │   soquete 2 ──┤ retornos de 3 cm,               │
       │      ...      ├ em TRILHA DE PLACA,             │
       │   soquete 16 ─┘ não em fio                      │
       │        │                                        │
       │     16 shunts → mux → Arduino Nano              │
       └──────────────────────┬──────────────────────────┘
                              │  2 fios · RS-485
                              ▼  para o painel
```

### 🔑 O detalhe que resolve tudo: **os retornos viram trilha, não fio**

Numa placa de suporte, os dispositivos **encaixam em soquetes**. O caminho de volta de cada um é uma **trilha de cobre de poucos centímetros** até o shunt que já está ali na mesma placa.

> **Não existem 50 fios. Existem 50 trilhas** — e trilha não tem mau contato, não capta ruído e não custa nada além do cobre que já está na placa.

| | Retornos até o painel | Retornos no suporte |
|---|---|---|
| O que são | 50 fios de 20 m | **50 trilhas de 3 cm** |
| Custo | cabo + prensa-cabo + tempo | **zero** — já vem na placa |
| Ruído captado | muito | **quase nenhum** |
| Pontos de falha | 100 conexões | **os soquetes, que já existiriam** |
| O que chega no painel | 100 fios | **2** |

### E no nosso protótipo, com 2?

Aqui os retornos **são fios mesmo** — dois, saindo da câmara até a PI-2 no painel. Com dois, isso não é problema nenhum.

📌 **A regra que fica:** *o número de retornos acompanha o número de dispositivos, sempre. O que a arquitetura escolhe é o comprimento deles.*

> 🎓 **Para a defesa:** *"medir cada dispositivo exige um retorno por dispositivo — não tem como fugir disso. O que a solução industrial faz é encurtar esses retornos de vinte metros para três centímetros, colocando a medição junto dos soquetes. Com isso, o que atravessa a fábrica deixa de ser cem fios analógicos e passa a ser um par digital."*

---

## 14.4 Como isso se organiza fisicamente

Não se coloca 50 shunts dentro do painel de comando. A montagem industrial agrupa:

```
   ┌──── SUPORTE INSTRUMENTADO — 16 posições ────┐
   │  16 soquetes + 16 shunts + 1 CD74HC4067     │
   │  + 1 Arduino Nano                            │
   └──────────────────┬───────────────────────────┘
                      │  RS-485 · 2 fios
   ┌────────┬─────────┼─────────┬────────┐
   sup. 1   sup. 2   sup. 3   sup. 4    │
                                         ▼
                              Arduino Mega do painel
```

**Cada suporte tem seu próprio Arduino Nano** (R$ 25) que varre os 16 canais, compara cada um com o valor normal dele e manda ao painel apenas o que interessa: **uma palavra de 16 bits** dizendo quais posições caíram.

📌 **Por que um Nano por suporte, e não fios longos até o Mega:** sinal analógico degrada com distância e capta ruído. Digitalizando junto da carga, o que viaja pela fábrica é um bit — e bit ou chega certo, ou não chega.

Vale notar que isso mantém o padrão de fábrica: **é tudo Arduino**, do suporte ao painel.

---

## 14.5 ⭐ A bancada usa o MUX — e o motivo é o mais importante do projeto

Seria tentador deixar a bancada com 2 INA219: para dois canais eles medem melhor, gastam menos pinos e não desperdiçam 14 entradas.

**Mas isso seria testar uma coisa e entregar outra.**

> O desafio é apresentar a solução **para a empresa**. Ela não vai comprar 50 INA219. Se a bancada valida uma arquitetura e a fábrica recebe outra, **o protótipo não provou nada** sobre o que vai ser implantado.

Um protótipo existe para **tirar risco do que vem depois**. O risco não está em saber se o INA219 funciona — está em saber se **o multiplexador dá conta**: se a leitura é estável, se o tempo de acomodação basta, se o ruído do painel atrapalha. Só se descobre isso montando.

### 🔬 Como provar que o mux funciona: um instrumento de referência

Fica **um INA219 medindo a MESMA posição 1** que o mux mede.

```
   DUT 1 ──►[ INA219 ]──►[ shunt 4,7 Ω ]──► 0 V
                │                │
            referência        canal 0 do mux
                └────── as duas leituras têm que bater ──────┘
```

**Sem um instrumento de referência, "funcionou" é opinião.** Com ele, você tem número: registre as duas leituras lado a lado durante um ensaio inteiro e mostre o gráfico. Se o mux acompanhar o INA219 dentro de poucos miliampères ao longo de 4 horas e de 5 a 60 °C, a arquitetura está validada — **para as 50 também**.

### O que se perde, e por que é aceitável

| | INA219 | Mux + shunt |
|---|---|---|
| Resolução | 16 bits | 10 bits (~1 mA) |
| Mede tensão também | ✅ | ❌ |
| Distingue *fusível aberto* de *placa morta* | ✅ | ❌ |

A terceira linha é a perda real. O INA219 sabe dizer se a corrente zerou porque o dispositivo morreu (24 V presentes) ou porque o fusível abriu (0 V); com shunt puro, os dois casos são idênticos.

**Como recuperar isso sem voltar atrás:** um dos 16 canais do mux mede a **tensão do barramento depois do fusível**, através de um divisor. Custa um canal e dois resistores — e a distinção volta, para todas as posições.

🎓 **Frase para a defesa:** *"escolhemos medir com multiplexador mesmo tendo apenas duas posições, porque é o que a empresa vai usar com cinquenta. O protótipo serve para tirar risco da implantação, não para ficar bonito na bancada."*

---

## 14.6 Resumo para a banca

| Pergunta | Resposta curta |
|---|---|
| Escala para 50? | Sim, trocando **um sensor por canal** por **um circuito para 16 canais** |
| Precisa de CLP? | **Não.** A empresa já usa Arduino, e a solução cabe nele |
| Quanto custa? | ~R$ 100 em multiplexadores e shunts, contra ~R$ 750 em sensores |
| Quantos pinos? | **8** para 64 canais |
| Fica lento? | A varredura completa leva **13 ms** |
| O que muda no conceito? | **Nada.** Continua sendo medir a corrente e comparar com o normal |

---

## ✅ Checklist se um dia for implantar

- [ ] Medir a corrente normal de **cada** posição e gravar como referência — as placas não são idênticas
- [ ] Definir o limiar em **percentual** do normal de cada uma, não um valor fixo para todas
- [ ] Prever o caso do **suporte inteiro mudo** (Nano travado) — o painel precisa distinguir "nenhuma falha" de "não recebi resposta"
- [ ] Deixar **canais sobrando** em cada suporte: crescer é acrescentar shunt, não trocar placa
- [ ] Considerar o **heartbeat** das placas em paralelo, para pegar a que trava consumindo normal ([Doc 13 §13.9](13_posicoes_de_ensaio.md))
