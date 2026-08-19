# Plano de refatoração — do "documento que explica" para o "guia que se monta"

> **A frase que originou este plano:** *"o cabo que sai do Arduino e vai para o contator, antes
> de chegar lá, passa por algum componente em série? em paralelo? ou liga direto no borne do
> relé, e no borne entra um diodo com o catodo no borne X e a outra ponta no borne Y?"*
>
> Hoje o projeto **responde isso**, mas a resposta está espalhada em quatro arquivos diferentes,
> em prosa. O plano abaixo faz o projeto responder isso **desenhado, num lugar só, e em ordem
> de montagem**.

---

## 0. Resposta curta à pergunta do exemplo (para provar que dá)

O fio que sai do **Arduino D27** e chega no relé que arma a potência:

| O que acontece com esse fio | Resposta |
|---|---|
| Passa por algum componente **em série**? | **Não.** O `D27` vai direto ao borne `IN` do módulo do KA3. Um fio, dois parafusos. |
| Tem componente **em paralelo**? | **Sim, um:** o **R10 · 10 kΩ**, com uma perna no borne `IN` e a outra no borne `DC−` (0 V) do **próprio módulo**. Ele não fica no meio do cabo — fica pendurado nos parafusos do módulo. |
| E no relé lá na frente? | A bobina do **KA2** (bornes `A1` e `A2`) leva o **D1 · 1N4007** em **antiparalelo**: uma perna em `A1`, outra em `A2`, **faixa prateada (catodo) do lado do `A1`**. Invertido, ele curto-circuita a bobina e derruba o fusível F2. |
| Quantos parafusos são apertados no total | 6: `D27`→`IN`, R10 em `IN` e `DC−`, D1 em `A1` e `A2`, e o retorno `NO`→0 V. |

**É esse nível de resposta — com desenho do parafuso — que precisa existir para os 23 registros
(29 peças) do projeto, e não só para este.**

---

## 1. Sim, há componentes discretos em mais lugares. São **cinco**.

| # | Onde ficam | O que fica lá | Desenho hoje |
|---|---|---|---|
| 1 | **Placa PI-1** (caixa DIN, ao lado do Arduino) | C1, C2 (100 nF) · R1 (22 kΩ) · R2 (4,7 kΩ) · C3 (100 nF) · R3 (4,7 kΩ) · CI1 (ULN2803A) | ✅ furo a furo, no app |
| 2 | **Placa PI-2** (mesma caixa) | R1, R2 (shunt 47 Ω 1 %) · mux CD74HC4067 · INA219 | ✅ furo a furo, no app |
| 3 | **Nos bornes dos relés** (nada de placa) | D1 (1N4007 na bobina do KA2) · R10 e R11 (10 kΩ nos `IN` do KA3 e do KA4) · as pontes de selo `24→A1` | ✅ parafuso a parafuso, no app |
| 4 | **Soldados por baixo do módulo BTS7960** | R8 e R9 (10 kΩ entre `R_EN` e `GND`, um em cada driver) | ❌ **só texto** |
| 5 | **Fora do painel, na maquete e na câmara** | R4–R7 (220 Ω na base de cada poste) · D2 (1N4007 nas ventoinhas do radiador) · os 2 simuladores de DUT (LED + resistor + jumper de falha) | ❌ **só texto** |

**Duas das cinco famílias não têm desenho nenhum** — e são justamente as que ficam longe do
painel, onde ninguém vai lembrar delas na hora da montagem.

---

## 2. Por que ficou confuso — quatro causas, todas corrigíveis

### 2.1 "Componente discreto" não existe como coisa no modelo de dados

O app é movido por dados (`painel_interativo/src/data/*.js`) e por isso desenha o que desenha.
Mas lá dentro só existem dois tipos: **fio** e **borne**. Um componente não é nem um nem outro —
então cada um foi encaixado à força num lugar diferente:

| Componente | Onde ele mora no código hoje | Consequência |
|---|---|---|
| C1, C2, R1, R2, R3, C3 | `pi1_fisico.js`, como peça de placa | ✅ funciona |
| shunts, mux, INA219 | `pi2_fisico.js` | ✅ funciona |
| D1, R10, R11 | `reles_fisico.js`, num campo `discretos` | ✅ funciona, mas é um segundo cadastro |
| **D1 outra vez** | `fiacao_etapa2.js`, **declarado como se fosse um fio** (`C12`) | 🔴 o mesmo diodo cadastrado duas vezes, em formatos diferentes |
| R8, R9, R4–R7, D2, DUTs | **em lugar nenhum** — só em parágrafos de `.md` | 🔴 nenhum validador vê, nenhum desenho mostra |

### 2.2 Três verdades paralelas: 13.291 linhas de `.md`, ~5.000 de dados e 11 SVGs

Quando as três discordam, ninguém sabe qual obedecer. E elas **já discordam** — estas são
divergências reais, achadas hoje:

| # | Contradição | Onde | Risco na bancada |
|---|---|---|---|
| 1 | LEDs dos postes: **220 Ω** vs **2,2 kΩ** | `33...md:278` e `03...md:307` dizem 220 Ω · `11_subestacao_e_postes.md:525` e `:573` dizem 2,2 kΩ | Compra o valor errado, ou o LED fica 10× mais fraco |
| 2 | Diodo D1: **"sai do painel, é sobressalente"** vs **"monte nos bornes A1/A2"** | `33...md:1069` diz que sai · `31...md:281`, `fiacao_etapa2.js:163`, `reles_fisico.js:73` e o SVG dos relés mandam montar | Monta ou não monta? Se não montar, o contato do KA3 solda com o tempo |
| 3 | DUT: **"sem carga térmica, 0,37 W"** vs **"~6 W dentro da câmara"** vs **"220 Ω / 5 W, ~3 W cada"** | `13...md:88`, `13...md:118` e `03...md:901` | O cálculo de carga térmica muda, e a lista de compras também |
| 4 | Peltier em **PWM 1 Hz** | firmware (doc 40) vs o relatório técnico que está solto na raiz do repo | Perde rendimento e reduz a vida da pastilha |

### 2.3 O que existe é documentação de projeto, não instrução de montagem

O doc 50 tem **ordem de integração e ensaios** — que é outra coisa. Nada no repositório diz
*"passo 14: pegue o fio vermelho de 0,5 mm², descasque 8 mm, aperte no A1 do KA2 e no 14 do KA1;
confira: multímetro em continuidade entre os dois deve apitar"*. Para quem nunca mexeu com
eletrônica, essa é a única forma que funciona.

### 2.4 O desenho para na porta do painel

A maquete inteira (postes, câmara, DUTs) tem componente elétrico, e **nenhum** deles aparece
desenhado com seus terminais.

---

## 3. O plano — seis blocos

### Bloco A · Um cadastro único: `src/data/discretos.js`

Todo componente que não é fio nem borne passa a existir num arquivo só, com este formato:

```js
{
  ref: 'D1',
  peca: 'Diodo 1N4007',
  onde: { tipo: 'borne', host: 'KA2' },   // ou 'placa' | 'modulo' | 'maquete' | 'camara'
  ligacao: 'antiparalelo',                // serie | paralelo | antiparalelo | pendurado
  pernas: [
    { perna: 'catodo (faixa prateada)', vai: { comp: 'KA2', via: 'A1' } },
    { perna: 'anodo',                   vai: { comp: 'KA2', via: 'A2' } },
  ],
  polaridade: true,
  comoIdentificar: 'A faixa prateada impressa no corpo marca o CATODO.',
  porque: 'Grampeia o pico da bobina para o contato do KA3 não abrir arco.',
  seInverter: 'Curto-circuito na bobina: o F2 (2 A) desarma assim que o KA1 selar.',
  ensaio: 'Multímetro em teste de diodo entre A1 e A2 → conduz num sentido só.',
  passo: 'C-07',                          // em que passo do guia ele entra
}
```

Efeitos imediatos:

- **`pi1_fisico.js`, `pi2_fisico.js` e `reles_fisico.js` passam a importar daqui** em vez de
  cadastrar de novo. O D1 deixa de existir em dois lugares.
- O `C12` sai da lista de fios da etapa 2 — diodo não é fio.
- R8, R9, R4–R7, D2 e os DUTs **passam a existir**, e com isso entram nos desenhos, nos
  validadores, no guia e na lista de compras automaticamente.

### Bloco B · Ficha desenhada para os cinco lugares

Um componente React reaproveitável (`FichaDiscreto`), no mesmo estilo do `ConjuntoRele` que já
funciona: **o host desenhado em escala + o componente no lugar exato + as pernas chegando nos
terminais nomeados**. Faltam quatro hosts novos:

| Host novo a desenhar | Para mostrar |
|---|---|
| Barra de pinos do **BTS7960**, visto por baixo | R8 / R9 entre `R_EN` e `GND`, e a alternativa do conector Dupont |
| **Base do poste** de iluminação, aberta | R4–R7 em série com o LED, a perna longa (ânodo) e o termorretrátil |
| **Ventoinha do radiador** | D2 em antiparalelo, catodo no `+12 V`, e por que ele não vai no painel |
| **Placa do DUT** (posições 1 e 2) | LED + resistor + jumper de simulação de falha |

Cada ficha mostra: desenho, as pernas com destino, a polaridade em destaque, o que medir para
provar que está certo e o que acontece se inverter.

### Bloco C · A aba que falta: **"Guia de montagem"**

Gerada dos dados (não escrita à mão), em fases, cada passo com o mesmo cabeçalho:

```
PASSO C-07 · Diodo D1 na bobina do KA2                          ⏱ 3 min
─────────────────────────────────────────────────────────────────────
PEGUE       1× diodo 1N4007 · chave de fenda 3 mm · alicate de corte
ANTES       O KA2 já está encaixado na base, painel DESENERGIZADO
FAÇA        1. Dobre as pernas do diodo em U, com 25 mm entre elas
            2. Faixa prateada (catodo) → parafuso A1
            3. Outra perna → parafuso A2      [desenho aqui]
            4. Aperte os dois parafusos
CONFIRA     Multímetro em teste de diodo, ponta vermelha em A2:
            deve marcar ~0,55 V. Invertendo as pontas: OL / nada.
SE ERRAR    Invertido, o F2 desarma no primeiro START. Só isso — não
            queima nada — mas você vai procurar no lugar errado.
```

Com: caixa de conferido que persiste (já existe esse padrão na PI-1), filtro por fase, e uma
**versão de impressão** (`@media print`) para levar em papel para a bancada — porque na hora de
soldar ninguém quer ficar mexendo em tela.

Fases: **1 bancada** (o que se prepara fora do painel: soldar R8/R9, montar as duas PIs, montar
os postes e os DUTs) → **2 mecânica** → **3 fiação** (as etapas 1–6 que já existem nos dados) →
**4 energização por trechos** → **5 ensaios**.

### Bloco D · Auditoria e correção das contradições

As quatro da tabela §2.2, mais uma varredura completa: para cada valor que aparece em mais de um
arquivo (resistores, bitolas, correntes, pinos), conferir e deixar **um** valor. Depois disso, o
número mora nos dados e os `.md` passam a citar de lá.

### Bloco E · Enxugar

| Sai | Por quê |
|---|---|
| `desenhos/08_placa_pi1_esquema.svg`, `09_placa_pi1_montagem.svg`, `10_placa_pi1_circuito.{svg,png,cddx}` | **Cinco arquivos** desenham a PI-1 à mão, e o app já a desenha furo a furo a partir dos dados. Desenho à mão desatualiza calado |
| `__pycache__/` versionado | Regenerável |
| Referências a `simulacao/` e `tutoriais_video/` no README e no índice | **As pastas não existem mais.** O README manda rodar `python simulacao/simulador.py` e isso falha |
| `BOM_Projeto_Integrador.xlsx` versionado | É saída do `gerar_planilha_bom.py`, que lê o doc 03. Fica o gerador, sai o binário |
| `compass_artifact_wf-....md` (na raiz) | As conclusões úteis (PWM do Peltier, dead-time, soft-start, watchdog da ventoinha) vão para o doc 40/43; o relatório bruto vai para `referencias/` |
| Trechos de "aula" repetidos em 3 e 4 documentos | A explicação fica **uma vez**, no doc dono do assunto; os outros linkam |

**Não sai:** nenhum dado, nenhum validador, nenhuma justificativa técnica que sustente uma
decisão de projeto na defesa.

### Bloco F · Validadores que impedem o problema de voltar

Um `valida_discretos.mjs` novo, rodando no `npm run valida` (que já bloqueia o deploy):

1. Toda perna de todo discreto aponta para um borne/pino/nó **que existe** no modelo do painel.
2. Todo discreto tem `porque`, `ensaio` e `passo` preenchidos — sem isso não entra no guia.
3. Todo discreto com `polaridade: true` declara `comoIdentificar` e `seInverter`.
4. Toda referência do tipo `R7`, `C3`, `D2` citada em qualquer `.md` **existe no cadastro** —
   é o que teria pego a divergência dos 220 Ω / 2,2 kΩ.
5. Todo passo do guia tem componente, ferramenta e conferência.

---

## 4. Ordem de execução

| Etapa | O que entrega | Já dá para usar? |
|---|---|---|
| 1 ✅ | `discretos.js` + `valida_discretos.mjs`, com os 23 registros (29 peças) cadastrados | A lista completa, conferida por máquina |
| 2 ✅ | Correção das contradições da §2.2 | Sim — a lista de compras fica confiável |
| 3 ✅ | `FichaDiscreto` + os hosts novos desenhados | **Pronto** — aba "Componentes soltos" |
| 4 ✅ | Aba **Guia de montagem** | **Pronto** — as 5 fases, 31 passos |
| 5 ✅ | Fiação gerada dos dados + impressão | **Pronto** — 126 fios em 6 etapas, com versão de papel |
| 6 ◐ | Enxugar e reescrever índice/README | **Parcial** — feito o que apontava para arquivo inexistente; falta o corte de redundância dentro dos documentos |

---

## 5. Critérios de aceite

- [x] Nenhum componente do projeto existe só em prosa — os 23 registros (29 peças) estão no cadastro
- [x] Clicando em qualquer um deles, aparece **o desenho de onde ele vai**, com os terminais nomeados
- [x] O guia cobre da bancada ao ensaio final, e **cada passo diz o que medir para provar que ficou certo**
- [x] O guia imprime em papel sem perder desenho
- [x] `npm run valida` reprova se alguém citar um componente que não existe, ou esquecer o ensaio
- [x] Nenhum valor elétrico aparece com dois números diferentes em dois arquivos *(os quatro fatos vigiados; a varredura completa vem na etapa 6)*
- [x] README e índice só apontam para coisas que existem

---

## 6. Decisões tomadas (18/08/2026)

| Decisão | Escolha |
|---|---|
| Onde o guia vive | **Aba no app + botão de imprimir.** O desenho fica junto do passo, e o papel sai da mesma fonte |
| LED dos postes | **220 Ω** (LED de 5 V). O 2,2 kΩ era da versão de 24 V |
| Diodo D1 | **Montado**, com o teste de diodo antes para ver se o KA2 já traz o interno. O D2 é sempre obrigatório |
| DUT | **Sem carga térmica** — LED + resistor de ½ W, 0,37 W e 0,21 W. Os 220 Ω / 5 W saem da lista |
| Documentos | **Corte de verdade**: cada explicação fica uma vez, no documento dono do assunto, e os números vêm dos dados |

---

## 7. O que já está pronto

### Etapa 1 ✅ — o cadastro e o validador

- **`painel_interativo/src/data/discretos.js`** — 23 registros, 29 peças físicas, 10 lugares.
  Cada um com: onde mora · como liga (série · paralelo · antiparalelo · derivação) · cada perna
  com seu destino · polaridade e como identificá-la · o porquê · o que acontece se faltar ou
  inverter · o ensaio com multímetro · o passo do guia.
- **`painel_interativo/scripts/valida_discretos.mjs`**, já dentro do `npm run valida` (que trava a
  publicação). Ele reprova quando: uma perna aponta para um parafuso que não existe; um componente
  fica sem ensaio, sem porquê ou sem passo; um componente com polaridade não diz como identificá-la;
  ou quando um componente desenhado na placa/no relé não está no cadastro.
- **`FATOS_VIGIADOS`** — as decisões acima viraram regra: o validador varre os 22 documentos e avisa
  quem ainda diz o contrário.

### Etapa 2 ✅ — as contradições corrigidas

| Onde | O que dizia | O que diz agora |
|---|---|---|
| `11_subestacao_e_postes.md:525` e `:573` | LED do poste com 2,2 kΩ, do ramal RM3 | **220 Ω**, do **BD-5V (ramal RM2 · saída O7)** |
| `03_lista_materiais.md:901` | Resistor 220 Ω / 5 W como carga térmica do simulador | Linha removida; a peça foi para a tabela do que saiu |
| `03_lista_materiais.md:902` | 4× 1,2 kΩ ¼ W para os dois DUTs | **2× 1,2 kΩ ½ W** (posição 1) e **2× 2,2 kΩ ½ W** (posição 2) |
| `03_lista_materiais.md:755` e `:924` | 1N4007 como sobressalente que não vai no painel | **2 usos + 2 reservas**, com o teste de diodo antes de montar o D1 |
| `33_placa_interface_componentes.md:1069` e `:1129` | "Sai do painel" | Corrigido: quem tem roda-livre embutido são os módulos de 5 V do KA3/KA4, não os relés de base |

### Achado novo, aguardando decisão

O projeto usa **as mesmas letras para três coisas diferentes**: `R1`, `R2`, `R3` são resistores da
PI-1 **e** ramais de energia **e** — de `R1` a `R21` — pontos do barramento BD-0V. Além disso, as
duas placas repetem `R1` e `R2` para componentes de valores diferentes (22 kΩ × 47 Ω).

Proposta: os discretos ganham prefixo do lugar onde moram — `PI1-R1`, `PI2-R1` — que é como o
cadastro já os identifica internamente. Fica a decidir se os documentos passam a usar essa forma.

### Etapas 3, 4 e 5 ✅ — o que dá para abrir agora

`cd painel_interativo && npm run dev`, e duas abas novas:

**🔩 Componentes soltos** — os 23 registros agrupados pelos 5 lugares onde moram. Clicando em
qualquer um: o desenho da ligação (em série o fio atravessa; de lado o desenho mostra o fio do
circuito passando por cima e a peça pendurada embaixo), os parafusos com nome, o lado certo, o
que acontece se inverter, e o que medir.

**🧾 Guia de montagem** — 31 passos em 5 fases: bancada · as duas placas · painel e fiação ·
energização por trechos · ensaios. Todo passo traz PEGUE, ANTES, FAÇA, **CONFIRA** e SE ERRAR.
Os 6 passos de fiação são gerados do `fiacao.js` (126 fios, com as duas pontas, bitola e cor),
e os passos de componente trazem a ficha desenhada dentro do próprio passo. O que está feito
fica salvo no navegador, e o botão imprimir gera a versão de papel para a bancada.

### Etapa 6 ◐ — o que já saiu, e o que falta

**Saiu:** os comandos do `simulador.py` e a pasta `simulacao/wokwi/` do Doc 42 (removidos do
repositório há vários commits, mas ainda ensinados) · a seção de tutoriais em vídeo do índice ·
as referências do README a `simulacao/` e `tutoriais_video/` · a pasta `_arquivo_v1/` citada e
inexistente · os desenhos `08` e `09` da PI-1 feitos à mão · 3 links relativos quebrados.

**Fica:** a planilha `.xlsx` continua versionada — ela foi atualizada no meio deste trabalho, e
o gerador lê o Doc 03, então ela não é fonte duplicada de verdade.

**Falta:**

| O quê | Por quê |
|---|---|
| O corte de redundância dentro dos documentos | A decisão foi "corte de verdade": cada explicação fica uma vez, no documento dono do assunto. São 13 mil linhas com repetição entre os docs 30, 31, 32 e 33 |
| Decidir o **PWM de 1 Hz** na Peltier | O relatório em `referencias/` mostra que 1 Hz é praticamente liga/desliga: derruba o rendimento e encurta a vida da pastilha. A correção (frequência alta com filtro, ou corrente contínua controlada) muda o Doc 40 e talvez a BOM |
| Renomear as refs que colidem | `R1`, `R2`, `R3` são resistores **e** ramais de energia **e** pontos do BD-0V; e as duas placas repetem `R1`/`R2` com valores diferentes. O cadastro já usa `PI1-R1` / `PI2-R1` por dentro |

---

## 8. As três decisões de 18/08/2026, e a pergunta que mudou o hardware

### ⚡ PWM da Peltier: 1 Hz → 20 kHz ✅

O Doc 43 já tinha provado que a justificativa do PWM lento estava invertida — a 1 Hz é que a
junção da pastilha cicla termicamente. Agora o código mudou: Timer3 (D5) e Timer4 (D6) em Fast PWM
com TOP em ICR, 20 kHz exatos, mais uma rampa de 5 % por atualização para a partida não puxar o
pico inteiro de uma vez. **O filtro LC não foi adotado** (valeria ~17 W de frio, mas exige um
indutor de 6 A) e fica documentado como trabalho futuro.

### 🔤 Nomes: um nome, um dono ✅

`R1`, `R2`, `R3` eram resistores, ramais de energia **e** pontos do BD-0V ao mesmo tempo. Agora:
shunts são `RS1`/`RS2`, ramais são `RM1`–`RM3`, retornos do BD-0V são `Z1`–`Z21`, e `R` sobrou só
para resistor. A tabela de convenção está no índice.

### ✂️ Explicação repetida ✅ (primeiro passe)

A varredura mostrou que **não havia texto copiado entre documentos** — nenhuma linha longa
idêntica em dois arquivos. A duplicação estava dentro do doc 33, que tinha três seções repetidas.
Doc 33: 1134 → 718 linhas. Documentação: 11.397 → 10.755.

### 🔩 A pergunta do grupo que eliminou um circuito inteiro

> *"Por que não usamos LED de 5 V, em vez de relé e circuito integrado?"*

Porque o ULN2803A existia por **uma** diferença: pino de 5 V, sinaleiro de 24 V. Com sinaleiro de
5 V (existe em 22 mm, mesmo corpo industrial), o pino aciona direto.

| | Antes | Agora |
|---|---|---|
| Entre o pino e a lâmpada | ULN2803A + soquete + positivo comum de 24 V | **nada** |
| Vias de borne na PI-1 | 19 | **10** |
| Jumpers na PI-1 | 20 | **10** |
| Tamanho da placa | 34 × 29 furos, caixa 6M | **22 × 22, caixa 4M** |
| Limite a respeitar | 500 mA por canal do CI | ⚠️ **20 mA por pino do Arduino** |

⚠️ **O limite mudou de lugar, não sumiu:** o passo A-02 do guia manda medir a corrente do
sinaleiro antes de ligar, e o retorno dos quatro vai ao GND do Mega, não ao BD-0V.

### O que continua na fila

| O quê | Por quê |
|---|---|
| Segundo passe de corte nos documentos | O doc 40 tem 1.391 linhas e o doc 03, 1.014. Ainda não foram revisados linha a linha |
| Módulos prontos no lugar do que sobrou na PI-1 | Divisor do D25 → módulo sensor de tensão; pull-up → adaptador do DS18B20. Sobrariam 2 capacitores, que dá para parafusar em borne. **Depende da sua decisão** |
| Rever o trilho 3 | Com a PI-1 em 4 módulos sobrou espaço; o DNLCB30 tinha descido para o trilho 2 por falta dele |
