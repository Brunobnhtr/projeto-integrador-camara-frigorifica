# Cargas de ensaio em LED — 8 posições em 12 V

> **Decisão:** as lâmpadas automotivas W5W saem de vez, junto com o ramal de 24 V
> que as alimentava. Entram **8 LEDs em 12 V**, distribuídos em **2 placas de
> 4 canais**, medidos por **um módulo N4AIC24** (8 canais de corrente) em RS-485.
>
> O 12 V vem do **T3**, que já existe no painel para as ventoinhas.
>
> **Por que 8 e não 22:** 22 posições exigiam 22 porta-fusíveis seccionáveis de
> trilho DIN — a peça mais cara do projeto, e vinte e duas vezes. Com 8, o bloco
> de fusíveis vira **uma peça só** e o módulo cai de 24 para 8 canais. O ensaio
> continua idêntico: cada posição tem a sua chave, o seu canal e o seu alarme.

---

## 1. O que muda em relação ao projeto original

| | Antes (Doc 13) | Agora |
|---|---|---|
| Carga | 2 lâmpadas W5W 24 V / 5 W | 8 LEDs 5 mm em 12 V |
| Corrente por posição | 208 mA | 10 mA |
| Instrumento | 2× ACS712-5A em A2/A3 | 1× N4AIC24 em RS-485 |
| Tensão das barras | divisor do SV-1 → D25 | 2 canais do próprio módulo (V1/V2) |
| Alimentação da carga | ramal de 24 V | **ramal de 12 V (T3)** |
| Posições de ensaio | 2 | 8 |
| Calor dentro da câmara | 10 W | 0,8 W |
| Fios atravessando a parede | 4 | 16 |

## 2. Por que 12 V agora (e por que não era antes)

Com **2** canais, a diferença entre 24 V e 12 V era irrelevante: 0,88 W contra
0,32 W. Com **8**, o resistor já é o maior consumidor da placa:

| Alimentação | Resistor | Corrente | Calor nos 8 resistores | Ar a 25 °C |
|---|---|---|---|---|
| 24 V | 1,8 kΩ | 12 mA | **1,2 W** | 0,4 °C |
| **12 V** | **1 kΩ** | **10 mA** | **0,66 W** | **0,2 °C** |
| 12 V, resistor fora da câmara | 1 kΩ | 10 mA | 0 (fica no painel) | 0,1 °C |

A migração para 12 V economiza **0,2 K** — e agora é quase irrelevante, mas
continua sendo de graça, porque o T3 já está lá. O consumo total do ramal
(8 × 10 mA = **80 mA**) é ruído para um LM2596 que já alimenta cinco ventoinhas.

> 📌 **Com 8 posições o calor deixou de ser assunto.** O número que importa agora
> é outro: **80 mA** num único fio de 1,5 mm² — e é isso que permite a barra de
> entrada do bloco de fusíveis ser uma só.

## 3. O resistor pode ficar dentro da câmara?

**Sim. O calor não é o problema — a condensação é.**

### O calor, com número

Cada resistor dissipa **83 mW** (0,083 W). Num resistor de 1/4 W isso é um terço
da carga nominal: o corpo sobe uns 10–15 °C acima do ar. Dentro da câmara a 5 °C
ele fica por volta de 20 °C; no ensaio de 50 °C, uns 65 °C. A temperatura máxima
do componente é 155 °C. Não há risco, e a variação de valor (100 ppm/°C) muda a
corrente em menos de 0,5 %.

Os 8 resistores somam 0,66 W, e o efeito no equilíbrio térmico é **0,2 K**:

| | 25 °C | 30 °C |
|---|---|---|
| 2 lâmpadas (10 W) | 6,0 °C | 10,4 °C |
| 8 LEDs, resistor dentro (0,8 W) | **4,0 °C** | 8,4 °C |
| 8 LEDs, resistor fora (0,14 W) | 3,8 °C | 8,2 °C |

Dois décimos de kelvin não pagam 8 pares de fio a mais atravessando a parede.
**O resistor fica na placa, dentro.**

### O problema de verdade: água

A câmara trabalha a 5 °C com umidade. Toda superfície dentro dela vai condensar
— inclusive a placa. E aí a conta muda de escala: o módulo resolve **0,01 mA**, e
uma película de água entre duas trilhas de 12 V gera correntes de fuga de
microampères que aparecem na leitura como **corrente de carga**.

Sintomas que isso causa: canal marcando 1–2 mA com o LED apagado; leitura que
sobe depois de um degelo; canal que "morre" e volta sozinho.

**Mitigação obrigatória:**

1. **Verniz de proteção (conformal coating)** nas duas faces das placas, depois
   de soldadas e testadas. É o item que resolve a maior parte do problema.
2. Placas **na corrente de ar**, não encostadas na parede nem no piso.
3. Solda limpa, sem fluxo residual — fluxo iônico + umidade = fuga.
4. Os sachês de sílica continuam valendo, mas não substituem o verniz.

> ⚠️ Isto não existia no projeto com lâmpadas: o soquete T10 ficava no alto, longe
> do piso, e a lâmpada aquecia o próprio contato. Com placas frias e expostas,
> a condensação passa a ser um item de projeto, não um acidente.

## 4. O módulo: N4AIC24 — 22 correntes + 2 tensões

O **N4AIC24** (eletechsup) traz **22 canais de 4–20 mA / 0–20 mA** e **2 canais
de tensão 0–30 V** no mesmo módulo, com um endereço Modbus só e um par RS-485 só.
Resolução de **0,01 mA** e **0,01 V**.

**Só 8 dos 22 canais de corrente são usados** — as 8 posições da placa de LED. Os
outros 14 ficam de borne vazio, prontos para o dia em que a câmara ganhar mais
posições. Não se paga por eles duas vezes: o módulo é o mesmo.

| | N4AIA08 (8 correntes) | **N4AIC24 (22 + 2 tensões)** |
|---|---|---|
| Canais de corrente | 8 (todos usados) | **22 (8 em uso)** |
| Canais de tensão | nenhum | **2 (0–30 V)** |
| Tensão das barras | precisaria de divisor externo | **direto no borne, sem resistor** |
| Endereços Modbus | 1 | **1** |
| Par RS-485 | um | **um** |
| ADC do Mega | 2 pinos gastos | **nenhum** |

### Os 2 canais de tensão são o que dispensa o divisor

V1 lê o **BD-POT** (os 24 V que morrem na emergência) e V2 lê o **BD-12V** (o 12 V
das posições). Os dois medem 0–30 V direto, sem resistor nenhum, com duas casas
decimais — e como ficam no painel, não acrescentam condutor nenhum atravessando a
parede da câmara.

> ⭐ **Isto é melhor do que um divisor, e não só mais barato.** Um divisor de
> 100 kΩ / 18 kΩ no pino A2 mediria a tensão com 32 mV por passo e ainda deixaria
> o ADC exposto a 28 V se um fio encostasse em outro. O canal do módulo é isolado
> do Mega, tem fundo de escala de 30 V e resolve 0,01 V. E o Mega continua com as
> 15 entradas analógicas livres.

> ⚠️ **O mapa de registradores que você levantou é do N4AIA08.** O N4AIC24 tem 24
> canais, então a leitura não pode ser "8 registradores a partir de `0x0000`". A
> estrutura é parecida, mas a quantidade muda. Peça o mapa ao vendedor antes de
> escrever o firmware — e confirme se os 22 de corrente vêm primeiro ou se os 2 de
> tensão estão intercalados.

## 5. As placas: 2 × 95 × 75 mm

8 canais em **2 placas de 4** — sem posição de reserva, então a reposição de um
LED queimado é dessoldar e trocar na própria placa (é um LED de 5 mm, não uma
placa nova).

Desenho 1:1 em [`placa_leds.svg`](placa_leds.svg) e [`placa_leds.dxf`](placa_leds.dxf)
(camadas `CONTORNO`, `FUROS`, `COBRE`, `GRAVACAO`, em milímetro).

**Por que 95 × 75, e não 150 × 50.** Esta é a correção de geometria desta
revisão, e ela vem de conferir a câmara de verdade em vez de supor:

| Tentativa | Conta | Veredito |
|---|---|---|
| 2 × 150 lado a lado | 150 + 150 = **300** = a cavidade inteira | ❌ não entra, nem sobra folga para instalar |
| 2 × 150 deitadas na bandeja | 300 > **210** da bandeja | ❌ |
| 2 × 150 em pé, empilhadas | 50 + 10 + 50 = **110** entre a bandeja (Z110) e a base do PTC (Z225) | ❌ o PTC desce 20 mm abaixo da base |
| 2 × 95 em pé, **subindo** de Z 115 a Z 190 | cabe na conta de altura, mas o berço fica em Y 115 — dentro do escudo do PTC (Y 55..145) | ❌ atravessa a chapa do escudo em Z 185 |
| **2 × 95 lado a lado, penduradas para baixo** | 95 + 10 + 95 = **200** dentro dos 210 da chapa · 75 de altura entre **Z 27,5 e Z 102,5**, abaixo do pé em Z 110 | ✅ nada acima do pé e nada no caminho até o piso |

⭐ **O corte continua saindo de UMA placa ilhada de 10 × 15 cm, sem sobra:**
`150 / 75 = 2` placas e `100 − 95 = 5 mm` de refilo. Nada de encomendar PCB sob
medida antes de o projeto estar fechado.

| Item | Quantidade |
|---|---|
| LED 5 mm difuso | 8 |
| Resistor 1 kΩ 1/4 W | 8 |
| Borne 2 vias 5,08 mm | 8 (4 por placa) — cada bloco é **partido em dois bornes de 1 via**, um em cima e um embaixo |
| Placa ilhada 10 × 15 cm | 1 |
| Verniz isolante (conformal coating) | 1 frasco |

**Por que duas placas e suporte em tiras de alumínio com espaçadores:**
O ar desta câmara desce pelo centro e sobe pelos dois dutos laterais de 40 × 40 mm. Uma chapa maciça dobrada (antigo conceito do berço CAM-26) funcionava como uma barreira/vela que bloqueava a convecção forçada vertical. Por isso, a fixação foi otimizada para **duas tiras horizontais de alumínio (210 × 20 mm)** apoiadas nas 4 cantoneiras CAM-24, com as PCBs parafusadas sobre **espaçadores roscados M3 de 8 a 10 mm**:
1. O ar desce livremente por toda a cavidade (pelo vão de 10 mm entre as placas, pelas laterais de 50 mm e pelo vão aberto entre as tiras).
2. Os espaçadores mantêm o verso das placas afastado do metal, garantindo isolamento elétrico absoluto das soldas e permitindo ventilação direta nos resistores.
3. Não há necessidade de corte a laser especial nem dobra de precisão: duas barras chatas de alumínio cortadas e furadas diretamente na oficina do SENAI.

### Arranjo dentro da câmara

As duas placas de 95 × 75 mm ficam montadas nas travessas de alumínio parafusadas nas 4 cantoneiras CAM-24 (Z = 110 mm), com afastamento por espaçadores M3:

```
 vista de frente (parede do fundo, 300 × 250)
 ┌──────────────────────────────────────────────┐
 │  ·                                           │  Z 250
 │            PTC + base  (Z 225..230)          │
 │                                              │
 │        escudo do PTC (Z 185..186)  ← livre   │
 │                                              │
 │  ═══ TIRA SUPERIOR DE ALUMÍNIO (Z 110) ════  │  ◄── parafusada nas cantoneiras CAM-24
 │      ┌──────────┐  10  ┌──────────┐          │
 │      │   PL-1   │  mm  │   PL-2   │          │  ◄── fixadas com espaçadores M3
 │      │  95×75   │      │  95×75   │          │      (ar passa pela frente e por trás)
 │      └──────────┘      └──────────┘          │
 │  ═══ TIRA INFERIOR DE ALUMÍNIO ════════════  │  ◄── ar desce 100% desobstruído
 └──────────────────────────────────────────────┘  Z 0
   0                    150                    300
```

⭐ **E é onde as lâmpadas ficavam.** A bandeja antiga punha os dois soquetes W5W em Z 110. As novas placas ocupam a mesma faixa de visão pela porta transparente, agora com 8 posições em LED, zero lâmpadas e aerodinâmica desobstruída.

As placas ficam centradas: X 50..145 e X 155..250, com 50 mm de folga em cada
lado para o ar descer até os dutos.

## 6. Ligação

### O caminho completo de uma posição

```
BD-12V ─► F-P (chave + fusível) ─► parede ─► resistor 1 kΩ ─► LED ─► parede ─► I_n ─► GND ─► BD-0V-B
          painel                  PG13-2      dentro da câmara            PG9-3   módulo   painel
```

⭐ **O positivo é chaveado; o retorno é medido.** A chave fica antes do fusível,
então desligar tira a tensão dos dois — e trocar o fusível com a chave aberta é
seguro. E o retorno não vai ao 0 V: ele atravessa o shunt interno do módulo — é
essa passagem que produz o número. Ligado direto na barra, a posição acende e o
painel lê zero para sempre.

### A placa de 8 canais entrega 2 bornes por canal — e um deles fica vazio

A placa de distribuição tem, por canal, um par **n+ / n−**. Só o **n+** é usado.

| Borne da placa | Liga em | Por quê |
|---|---|---|
| `VCC` (entrada) | BD-12V · O1 | alimenta as 8 chaves |
| `GND` (entrada) | BD-0V-B · Z25 | ⚠️ só fecha o circuito dos 8 LEDs indicadores (~4 mA cada) |
| `n+` (saída 1…8) | borne `+12 V` da posição, na câmara | é o positivo chaveado e fusívelado |
| `n−` (saída 1…8) | **VAZIO** | ⚠️ se o retorno voltar por aqui, a corrente desvia do shunt do módulo e o canal lê zero para sempre |

> ⚠️ **O erro mais fácil de cometer neste projeto.** O par n+/n− parece pedir um
> fio de ida e um de volta — e é justamente o que NÃO se faz. O n− é o mesmo 0 V da
> placa, e usá-lo como retorno curto-circuita o shunt do módulo. O sintoma é
> "acende tudo e não mede nada", e não há nada queimado para encontrar.

### Condutores que atravessam a parede

| Condutor | Quantidade | Por onde |
|---|---|---|
| +12 V de cada posição (positivo chaveado) | 8 | PG13-2 (potência) |
| Retorno de cada posição (para o canal `I_n`) | 8 | PG9-3 (sinal) |
| **Total** | **16** | |

⚠️ **A conta mudou em relação ao rascunho de 22 posições, e mudou para muito
melhor.** Eram 44 condutores e um DB25 com furo de 20 mm. Agora são **16**, e
eles continuam passando em **dois** prensa-cabos — mas o de sinal precisa crescer.

A conta é a do projeto (`src/lib/prensas.js`): diâmetro equivalente pela raiz da
soma dos quadrados dos diâmetros externos, mais 15% porque cabo redondo não se
empacota perfeito. Condutor flexível: 1,5 mm² = 3,0 mm · 0,5 mm² = 2,2 mm ·
0,25 mm² = 1,8 mm.

| Prensa-cabo | O que passa | Feixe | Rosca |
|---|---|---:|---|
| **PC-1 / PG13-2** | 4×1,5 mm² (Peltier ±, PTC ±) + 2×0,5 mm² (internas ±) + **8 positivos de 0,5 mm²** = 14 condutores | **10,6 mm** | **PG13,5** (6–12 mm) ✓ sobra 1,4 mm |
| **PC-2 / PG9-3** | **8 retornos de 0,5 mm²** + 4 do AM2315C + 3 do DS18B20 + 2 dos tacômetros = 17 condutores | **9,5 mm** | **PG11** (5–10 mm) ✓ |

🔴 **O PG9 NÃO DÁ CONTA — e essa é a correção desta revisão.** O PG9 aperta até
8 mm. Com os 8 retornos o feixe vai a 9,5 mm em 0,5 mm² e a 8,5 mm mesmo que os
retornos desçam para 0,25 mm². Nos dois casos o furo fica aberto, e furo aberto
numa câmara que condensa é água no shunt. **O PC-2 na parede e o PG9-3 no painel
sobem para PG11** (o mesmo feixe, dos dois lados do cabo).

📌 **Nenhum furo novo.** O DB25 e a broca de 20 mm continuam fora da lista de
compras e do CAD: são dois furos, como antes — só o de sinal é maior (18,6 mm em
vez de 15,2 mm). A parede é acrílico e o furo é feito na hora de montar, então
não há peça a refazer.

### Como desligar a câmara do painel (sem desparafusar 16 bornes)

Duas **réguas de borne plugável de 8 vias** (5,08 mm) fixadas na chapa, uma para
os positivos e uma para os retornos, do lado de dentro dos prensa-cabos. O chicote
da câmara vira um plugue; a maquete desmonta em dois movimentos.

⚠️ As duas réguas são **separadas** de propósito: a de positivos é potência
(chaveada, 12 V) e a de retornos é medida (0 V do shunt). Juntar as duas num
borne só é o caminho mais curto para medir a corrente no lugar errado.

### Na placa (cada uma das 2)

**8 bornes de 1 via, e a placa não tem barramento nenhum.** Cada canal é uma
reta vertical independente: entra 12 V embaixo, sai retorno em cima. Não existe
`J1`, nem barra de +12 V, nem barra de 0 V — e é isso que faz cada posição ser
medida separadamente.

| Borne | Onde fica | Liga em |
|---|---|---|
| `+1` … `+4` | borda de **baixo** | `n+` da chave-fusível daquela posição (12 V chaveado) |
| `r1` … `r4` | borda de **cima** | `I1` … `I4` do N4AIC24 (o retorno, pelo shunt) |

⚠️ **O que NÃO existe mais nesta placa:** a barra de +12 V e a barra de 0 V com
os conectores `J1`/`J2` do desenho anterior. Elas faziam sentido quando as 8
posições dividiam um fusível só. Com um fusível por posição, uma barra comum
curto-circuitaria as 4 posições da placa entre si — e o painel leria a soma,
não cada uma.

⚠️ O pino 0 V do J1 existir na placa e ficar vazio é de propósito: ele serve para
testar a placa na bancada, com uma fonte de 12 V, antes de instalar. Ligado ao
chicote, ele curto-circuita o shunt e zera a leitura de todos os canais daquela
placa — e o sintoma é "a placa acende e não mede".

### No módulo N4AIC24 (trilho 3 do painel)

| Terminal | Liga em | Por quê |
|---|---|---|
| `I1` … `I8` | retorno de cada posição | é o shunt de cada canal |
| `I9` … `I22` | — | livres, de reserva para posições futuras |
| `V1` | BD-POT · O3 | mede o 24 V **comutado** (o antigo fio do D25) |
| `V2` | BD-12V · O3 | mede o 12 V das posições |
| `V+` | BD-24V · O3 | ⭐ **permanente** — o instrumento não pode morrer junto com o que ele mede |
| `GND` | BD-0V-B · Z22 | ⭐ **o único retorno**: fecha os 22 shunts **e** a alimentação, num parafuso só |
| `A` / `B` | MAX485 · A / B | par trançado |

> ⚠️ **Não existe borne `COM` neste módulo.** Revisões anteriores desta tabela
> listavam `COM → Z20` **e** `GND → Z22` como dois retornos, e a fiação chegou a
> ter dois fios (`M2` e `M5`). A pinagem publicada é `VIN, GND, I1..I22, V1+, V2+,
> A+, B−` — **um** nó comum. Hoje há **um** fio (`GND → Z22`) e o **`Z20` está
> reserva**. Um fio a menos, e o desenho deixou de inventar um borne.

### No MAX485 (trilho 3, ao lado do Mega)

| Terminal | Liga em |
|---|---|
| `RO` | Mega · D15 (RX3) |
| `DI` | Mega · D14 (TX3) |
| `DE/RE` | Mega · D26 — com R13 de 10 kΩ para o 0 V |
| `VCC` / `GND` | BD-5V · O8 / BD-0V-B · Z17 |
| `A` / `B` | par trançado até o módulo |

> O módulo usa **um** MAX485. Com um único endereço, não há colisão de barramento
> para resolver. E o Mega não gasta **nenhuma** entrada analógica: A2 e A3, que
> eram do ACS712, continuam livres.

## 7. O berço e o que muda no CAD

### 7.1 O berço (desenho pronto em `berco_placas.svg` e `berco_placas.dxf`)

Uma chapa de **alumínio 5052 de 1,0 mm**, cortada a laser e dobrada em **L**. É
ela que segura as duas placas dentro da câmara — e ela **substitui a bandeja das
lâmpadas W5W (CAM-25), que saiu do projeto**.

| | |
|---|---|
| **Planificação** | **210 × 180 mm** (pé 90 + pendurado 90) |
| **Dobra** | 1 linha, em y = 90, **90° para baixo** — as placas ficam penduradas |
| **Pé** | 210 × 90 mm, com **janela de 150 × 50** para o ar passar |
| **Furos do pé** | **4 × Ø4,5** (M4) — nos mesmos furos da bandeja, que batem nas 4 cantoneiras **CAM-24** |
| **Furos das placas** | **8 × Ø3,2** (M3), a 4 mm do canto de cada PCB |
| **Parafusos das placas** | 8 × M3 × 8 mm + porca, ou M3 auto-atarraxante em spacer de nylon |
| **Distanciadores de nylon** | **não são mais necessários** — o afastamento agora é o próprio pé dobrado |

```
   planificação (210 × 180) — o que se manda cortar
   ┌──────────────────────────────────────────────┐
   │   ┌──────────┐   10   ┌──────────┐           │  pendurado
   │   │   PL-1   │        │   PL-2   │           │  (desce 90)
   │   └──────────┘        └──────────┘           │
   ├──────────────────────────────────────────────┤  ← dobra 90° AQUI, para baixo
   │ o                                            │
   │        ┌────────────────────────┐            │  pé
   │        │   janela 150 × 50      │            │  (90 de fundo)
   │        └────────────────────────┘            │
   │ o                                            o│
   └──────────────────────────────────────────────┘
      ← 210 →    4 furos M4 nas cantoneiras
```

⚠️ **O SENTIDO DA DOBRA FAZ PARTE DO PROJETO.** Dobrada para cima, a chapa sobe
até Z 200 e atravessa o escudo do PTC em Z 185 — a peça fica inutilizável e o
erro só aparece na montagem, com a câmara fechada. O gerador
([`gera_berco.py`](gera_berco.py)) tem uma `conferencia()` que lê as cotas de
`parametros_v12.py` e **se recusa a gravar o desenho** se o berço colidir com o
escudo, o suporte do PTC, o PTC, a plataforma CAM-12 ou a calha CAM-17. Rode
`python placa_leds/gera_berco.py` e confira a linha `OK —` antes de mandar cortar.

⭐ **POR QUE O PÉ E A JANELA:** o ar do circuito desce pelo centro e volta pelos
dutos laterais. O pé é uma chapa horizontal no meio do caminho — sem a janela
ele viraria um anteparo e a placa de baixo ficaria numa zona morta. A janela
também tira metade do peso e deixa a peça com cara de peça, não de sobra.

⭐ **POR QUE A DOBRA E NÃO DISTANCIADOR:** a versão anterior deste desenho
afastava a chapa da parede com 4 distanciadores de nylon. Não precisa: a dobra
já dá os 90 mm de pé que apoiam no lugar da bandeja, e as cantoneiras CAM-24
continuam fazendo o papel de fixação na parede. **Nenhum furo novo no acrílico.**

📐 **AS COTAS ESTÃO SÓ NO SVG.** O `berco_placas.svg` sai com a cadeia de cotas
(90 / 90 e 210 × 180) para conferir na tela; o `berco_placas.dxf` fica **limpo**,
só com as camadas `CONTORNO`, `DOBRA`, `FUROS` e `GRAVACAO`, porque está em 1:1
e cota dentro de DXF de corte é linha que alguém acaba cortando.

⚠️ **A chapa é o lado de TRÁS.** Os bornes e os LEDs ficam na face da frente da
PCB, virada para a porta — quem olha pela porta vê os 8 LEDs, não a chapa.

### 7.2 O que muda no CAD da câmara

1. **CAM-25 (bandeja das lâmpadas) está RETIRADA.** O berço toma o lugar dela:
   mesmo pé de 210 × 90, mesmos 4 furos M4, mesmas 4 cantoneiras **CAM-24**, em
   Z = 110. A peça nova é a **CAM-26**.
2. **Nenhum furo novo no acrílico.** As cantoneiras CAM-24 continuam onde estão
   (paredes laterais, Y = 35 e Y = 105, Z = 110) e o pé do berço parafusa nelas.
3. **Nenhum furo novo para os cabos, mas um furo maior.** Continuam **dois**
   prensa-cabos: o PC-1 (potência) fica em PG13,5 e o PC-2 (sinal e medição)
   sobe de PG9 para **PG11** — com os 8 retornos o feixe dele vai a 9,5 mm, e o
   PG9 aperta só até 8 mm. O mesmo vale para o PG9-3 no painel.
4. **Duas réguas de borne plugável de 8 vias** na chapa, do lado de dentro dos
   prensa-cabos — uma para positivos, uma para retornos.
5. **Conferir o envelope**: o berço ocupa **Z 20..110** (pé em Z 110, chapa
   pendurada até Z 20) em X 45..255 e Y 25..115; as placas ficam em **Z 27,5..
   102,5**. Isso deixa **75 mm livres até o escudo do PTC** (Z 185) e 85 mm até a
   parede do fundo. O sensor AM2315C fica em X150, Y145, Z95 — **atrás** do
   plano das placas (Y 114..115), e não no meio do fluxo delas.

## 8. Pendências que só a bancada resolve

> 🔴 **A lista abaixo é para ser respondida ANTES de passar cabo na câmara.** As
> quatro primeiras são de borne: se alguma estiver errada, o desenho da placa
> não muda, mas o borne de destino muda — e descobrir isso com 16 fios já
> crimpados custa uma tarde.

**1. Qual é o borne de retorno?** — 🔴 **a única coisa deste módulo que ainda não
está provada.** A pinagem publicada do N4AIC24 é **`VIN`, `GND`, `I1..I22`, `V1+`,
`V2+`, `A+`, `B−`**: **não existe `COM`**. O nó comum dos 22 shunts é o **`GND`**
do módulo. O projeto usou o nome `COM` para esse nó durante duas revisões e chegou
a registrar **dois** retornos na fiação — isso foi corrigido: hoje é **um** fio,
`GND → BD-0V-B · Z22`, e o `Z20` ficou reserva.

⚠️ **A regra que não pode ser lida errado:** o cátodo do LED entra em **`I_n`**,
sempre. **Ligar o cátodo direto no `BD-0V-B` desvia do shunt e aquele canal lê
zero para sempre** — o LED acende normal e o painel jura que não há corrente.

```
CERTO    +12 V -> 1 kOhm -> LED -> borne rk -> I_n -> [shunt] -> GND -> BD-0V-B

ERRADO   +12 V -> 1 kOhm -> LED -> borne rk -> BD-0V-B   <- shunt desviado, canal cego
```

| Se o módulo recebido tiver… | Como se liga |
|---|---|
| **`I1..I22` + `GND`** (a pinagem publicada) | cátodo → `I_n` · `GND` → `BD-0V-B` ⭐ **é o caso deste projeto** |
| **par `I_n+` / `I_n−`** | cátodo → `I_n+` · `I_n−` → `BD-0V-B` (o shunt fica entre os dois) |
| **`COM` separado do `GND`** (módulo de *outro* fabricante) | cátodo → `I_n` · `COM` → `BD-0V-B` · `GND` → `BD-0V-B`, no **mesmo** ponto de 0 V |

> ⚠️ **A terceira linha não descreve o N4AIC24** — ela existe só para o caso de o
> módulo recebido não ser o da pinagem publicada. Se você abrir a caixa e encontrar
> `COM` impresso na placa, então o fabricante mudou o produto: **não decida pela
> continuidade** `GND` ↔ comum dos `I_n` — um shunt de 10 a 250 Ω pode soar como
> "curto" num multímetro sem ser um nó comum. **Injete uma corrente conhecida**
> (12 V + 1 kΩ → ~10 mA) num canal e leia o Modbus: se retornar entre 9 e 11 mA,
> o `GND` é o nó comum e a primeira linha vale. **Não copie a terceira linha por
> precaução** — é assim que nasceu o segundo retorno.

⭐ **O que muda entre os casos é o NOME do borne de retorno, não o caminho.** Em
todos, o cátodo entra em `I_n` e só o retorno do módulo vai ao 0 V. Por isso a
pendência **não bloqueia o corte** da placa nem o do berço — bloqueia a hora de
passar cabo.

🔧 **O `GND` conduz ~150 mA**, não 80: ele fecha as 8 correntes medidas
(8 × 10 mA) **e** a alimentação do próprio módulo (~60 mA). 0,5 mm² sobra.

⚠️ **Verificação primária — injeção de corrente conhecida:** alimente uma posição
com **12 V e resistor de 1 kΩ** (corrente esperada ≈ 10 mA), leia o canal pela
Modbus e confira se o valor retorna entre **9 e 11 mA**. A continuidade com o
multímetro (módulo desenergizado) é **secundária**: o que prova que o circuito
está certo é a leitura Modbus concordando com a corrente injetada, não um teste
de resistência que pode ser enganado pelo próprio shunt.

**2. A alimentação cabe nos 7–25 V?** — ⚠️ o datasheet dá **7–25 V DC** (o modelo
do app dizia 9–30 V; corrigido). O painel alimenta em **BD-24V**, então cabe com
**1 V de margem**. Isso é pouco, e a pergunta certa é: **por que não mudar para os
12 V do T3, que dariam 13 V de margem?**

| | `BD-24V` (escolhido) | `BD-12V` (T3) |
|---|---|---|
| Margem de tensão | **1 V** — exige PS1 em 24,0 V | **13 V** — folgado |
| Se o T3 cair | ⭐ **o instrumento sobrevive** e o `V2` diz "12 V = 0,00" | o instrumento morre junto: "sem resposta" e "sem 12 V" viram o mesmo sintoma |
| Se o PS1 subir | queima o módulo **sem estourar fusível** | nada acontece |

⭐ **Fica no 24 V de propósito.** O módulo mede a barra de 12 V no canal `V2` — é
assim que o painel distingue *"a posição queimou"* de *"a fonte de 12 V caiu"*.
Alimentar o instrumento **da mesma barra que ele vigia** apaga essa distinção, que
é a razão de o módulo existir. Um voltímetro ligado na própria bateria não mede
nada. As duas barras são permanentes (o KM1 chaveia **depois** do `BD-24V`, para o
`BD-POT`), então o 24 V não perde em disponibilidade.

⚠️ **A contrapartida é disciplina de ajuste, e ela é obrigatória:** medir o
`BD-24V` com o multímetro **antes** de ligar o módulo e conferir **24,0 ± 0,5 V**.
O trimpot do PS1 vai de 22 a 26 V — quem girar "para o Peltier render mais" queima
este módulo e **nenhum fusível estoura**. O painel fica cego sem sintoma elétrico.

🔁 **Se o PS1 não segurar 24,0 V**, aí sim: mover **um fio** de `V+` para
`BD-12V · O3` e aceitar a perda do diagnóstico cruzado. É a única troca do projeto
que vale a pena reverter se a fonte for ruim.

**3. A resistência do shunt** — medir a queda entre `I1` e o borne de retorno
(`GND`) com um canal ligado. Com 12 V e 1 kΩ a corrente
esperada é **9–11 mA**; se o shunt for alto, ela cai. De quebra, a queda em mV
dividida por 10 mA **é** a resistência do shunt — anote, porque o firmware precisa
dela se um dia quiser converter em mV.

**4. As entradas são isoladas?** — se não forem, o `GND` do módulo tem de ser o
mesmo 0 V do painel (é o que o desenho já faz: `GND` → `BD-0V-B · Z22`).

**5. Leitura abaixo de 4 mA** — confirmar no módulo recebido. Se ele só aceitar
4–20 mA, 10 mA ainda está dentro da faixa, mas o zero vira 4 mA e o firmware
precisa subtrair.

**6. Condensação** — depois do verniz, fazer um ciclo frio de 30 min e conferir se
algum canal marca corrente com os LEDs apagados.

## 9. "Qual é o caminho da lâmpada?" — a resposta, e o que sobrou dela

Esta pergunta apareceu três vezes no projeto com três respostas diferentes, e
vale separar de uma vez, porque só **uma** das três continua valendo.

### As três "lâmpadas" do projeto

| # | O que era | Onde estava | Situação |
|---|---|---|---|
| 1 | **2 × W5W 12 V / 5 W** — o dispositivo sob ensaio | bandeja CAM-25, dentro da câmara, Z = 110 | 🔴 **RETIRADA.** O DUT agora são as 8 posições de LED |
| 2 | **4 sinaleiros** ENERGIZADO · RESFRIANDO · AQUECENDO · FALHA | porta do painel | 🟢 **ATIVA e já modelada** |
| 3 | **2 × lâmpada 12 V 55 W em série** | fora da maquete, na bancada | 🟢 ativa, mas **é carga de teste**, não vai na câmara |

### 1. A lâmpada da câmara — não existe mais caminho

Era o dispositivo ensaiado: ligava em 12 V, a corrente passava pelo ACS712 no
painel e o firmware detectava a lâmpada queimada. Quando o DUT virou **8 posições
de LED em 12 V**, a lâmpada saiu — e com ela saíram o soquete T10, a bandeja
CAM-25 e o furo P3_LAMP_12V gravado na parede.

**O caminho que existe hoje é o da posição de ensaio, não o da lâmpada:**

```
T3 · 12 V ─► BD-12V ─► F-Pn (chave + fusível 1 A) ─► PC-1 · PG13,5
                                                        │
                                        ┌───────────────┘
                                        ▼
                              PL-1/PL-2 · borne +k   (borda de baixo)
                                        │
                                  LED 5 mm → 1 kΩ
                                        │
                              PL-1/PL-2 · borne rk   (borda de cima)
                                        │
                                        ▼
                              PC-2 · PG11 ─► N4AIC24 · Ik ─► GND ─► BD-0V-B
```

É esse o desenho que está no painel interativo: 8 fios `X11…X11h` de ida e 8
`X13…X13h` de volta, 16 condutores, dois prensa-cabos.

⚠️ **O que ficou para trás e precisa sair de qualquer lista:** soquete T10,
lâmpada W5W, a linha "12 V · 2× lâmpada W5W · 10 W · 0,83 A" do orçamento de
carga, a gravação `P3_LAMP_12V` na parede e a gravação `G3_12V · lâmpadas 1 e 2`
na porta do painel. Todos foram corrigidos nesta revisão.

### 2. O sinaleiro de FALHA — esse caminho existe e está desenhado

Não é lâmpada de câmara: é **sinaleiro de painel**, 5 V, ~20 mA, e é o que avisa
que uma posição morreu. Ele já está no `fiacao.js` com os outros três:

| Sinaleiro | Pino do Mega | Corrente |
|---|---|---|
| ENERGIZADO | `D9` | ~20 mA |
| RESFRIANDO | `D10` | ~20 mA |
| AQUECENDO | `D11` | ~20 mA |
| **FALHA** | **`D12`** | **~20 mA** |

O retorno dos quatro é **um fio só**, no `GND` do Mega — e não no `BD-0V`. É a
mesma referência do pino que acende; fechar em outro ponto faria 80 mA de LED
atravessarem o barramento e sujarem as leituras analógicas.

### 3. As lâmpadas de 12 V em série — carga de teste, não de maquete

Servem para provar o ramal de 24 V antes de ligar as Peltier: duas de 12 V em
série dão 24 V e ~4,6 A, que é a corrente real do par. Ficam na bancada, ligadas
com garrão, e são desligadas no fim do ensaio. **Não entram no CAD, não entram na
câmara e não entram na lista de compras do projeto** — são item de bancada.
