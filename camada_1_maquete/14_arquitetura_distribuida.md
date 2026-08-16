# CAMADA 1 · Doc 14 — Arquitetura distribuída: RS-485 e os módulos de ensaio

> ⭐ **Este documento define a solução que será entregue à empresa** — 50 dispositivos monitorados individualmente, com dois fios de dados atravessando a instalação.
>
> ✅ **Pré-requisito:** [Doc 13](13_posicoes_de_ensaio.md) — por que medir corrente detecta o que nenhuma proteção detecta.

---

## 🟢 Em palavras simples

A empresa energiza até **50 dispositivos** dentro da câmara e precisa saber, **na hora**, se um deles parou — e **qual**.

A tentação é ligar tudo ao painel: 50 sensores, 50 fusíveis, 100 fios. Isso não se sustenta.

A solução industrial inverte a lógica:

> **Em vez de trazer 50 sinais até o cérebro, leve pequenos cérebros até os 50 sinais.**

Quatro **módulos de ensaio** ficam junto dos dispositivos. Cada um cuida de 16 posições: distribui a energia, protege, mede a corrente e decide sozinho se alguma parou. Ao painel, todos eles mandam a mesma coisa por **dois fios**: a resposta.

---

## 14.1 A arquitetura em uma figura

```
        PAINEL DE COMANDO                        JUNTO DA CÂMARA
   ┌──────────────────────────┐
   │                          │      24 V ─┬──────┬──────┬──────┐
   │   Arduino Mega           │       0 V ─┼──────┼──────┼──────┤
   │        │ Serial3         │            │      │      │      │
   │   ┌────┴─────┐           │        ┌───┴──┐┌──┴───┐┌─┴────┐┌┴─────┐
   │   │ MB-1     │  A ───────┼────────┤ MPE-1││ MPE-2││ MPE-3││ MPE-4│
   │   │ RS-485   │  B ───────┼────────┤      ││      ││      ││      │
   │   └──────────┘           │        │ 16   ││ 16   ││ 16   ││ 16   │
   │                          │        │ pos. ││ pos. ││ pos. ││ pos. │
   └──────────────────────────┘        └──┬───┘└──┬───┘└──┬──┘└──┬───┘
                                          │       │       │      │
     4 FIOS SAEM DO PAINEL              [DUTs]  [DUTs]  [DUTs] [DUTs]
     24 V · 0 V · A · B                              = 64 posições
```

**Do painel saem quatro fios.** Não importa se são 16 dispositivos ou 64 — continuam sendo quatro, porque os módulos são ligados **em cadeia** (um puxa do outro).

---

## 14.2 Por que RS-485 e não outra coisa

| | I²C | **RS-485** | Ethernet |
|---|---|---|---|
| Distância | ~1 m | **1200 m** | 100 m |
| Fios | 2 + terra | **2** | 8 |
| Nós | ~8 na prática | **32** (256 com repetidor) | muitos |
| Imunidade a ruído | baixa | **alta — sinal diferencial** | alta |
| Custo por nó | — | **~R$ 8** | ~R$ 60 |
| Padrão em indústria | não | **sim** | sim |

### ⭐ O que torna o RS-485 imune ao ruído

Ele não transmite um sinal contra o terra. Transmite **a diferença entre dois fios**.

```
   ruído entra nos DOIS fios igualmente
            ↓        ↓
   A ────────────────────────
   B ────────────────────────
            ↑
   o receptor lê A menos B — e o ruído,
   que entrou igual nos dois, se cancela
```

É por isso que ele atravessa uma fábrica ao lado de motores e chega inteiro, enquanto um sinal analógico não sobrevive a vinte metros. **E os dois fios devem ser um par trançado**, justamente para que o ruído pegue os dois do mesmo jeito.

---

## 14.3 O MPE — Módulo de Posições de Ensaio

Cada módulo é um subsistema completo. Não é "uma placa de sensores": ele **distribui, protege, mede e decide**.

```
   ┌──────────────── MPE — 16 posições ────────────────┐
   │                                                    │
   │  24 V ●──┬──[polyfuse]──● POS-1 +                 │
   │          ├──[polyfuse]──● POS-2 +                 │
   │          └── ... 16 ...                            │
   │                                                    │
   │  POS-1 − ●──[shunt 4,7 Ω]──┐                      │
   │  POS-2 − ●──[shunt 4,7 Ω]──┤                      │
   │      ...                    ├──►[ CD74HC4067 ]    │
   │  POS-16 − ●─[shunt 4,7 Ω]──┘         │            │
   │                                       ▼            │
   │                              [ Arduino Nano ]      │
   │                                       │            │
   │                              [ MAX485 ]            │
   │                                  │  │              │
   │  0 V ●                           A  B ●●           │
   └────────────────────────────────────────────────────┘
```

| O que tem dentro | Quantos | Papel |
|---|---:|---|
| Fusível rearmável (polyfuse) 500 mA | 16 | protege cada posição, e **rearma sozinho** |
| Resistor shunt 4,7 Ω 1% | 16 | transforma corrente em tensão |
| CD74HC4067 | 1 | escolhe qual canal medir |
| Arduino Nano | 1 | varre, compara e responde |
| MAX485 | 1 | fala RS-485 |

### 💡 Por que polyfuse e não fusível de vidro

Com 50 posições, trocar fusível vira rotina. O **polyfuse** (PPTC) abre com a sobrecorrente e **volta sozinho** quando esfria — ninguém precisa abrir o módulo. Numa instalação com dezenas de posições, isso deixa de ser conforto e passa a ser viabilidade.

### O que o Nano faz sozinho

1. Varre os 16 canais — **13 ms** para o ciclo completo
2. Compara cada um com a **corrente normal daquela posição**, aprendida no início do ensaio
3. Marca o bit de alarme de quem saiu da faixa
4. Responde ao painel quando perguntado

**Ele não manda nada por conta própria.** Quem pergunta é o painel — é assim que um barramento com vários nós não vira bagunça.

---

## 14.4 O mapa Modbus de cada módulo

**Modbus RTU** é o protocolo. Ele existe desde 1979, roda em qualquer CLP e tem biblioteca pronta para Arduino — é o "português" da automação industrial.

| Endereço | Registrador | Conteúdo |
|---|---|---|
| `0x0000`–`0x000F` | corrente de cada posição | em mA |
| `0x0010` | **palavra de alarme** | bit *n* = posição *n* falhou |
| `0x0011` | status do módulo | temperatura interna, contagem de erros |
| `0x0020`–`0x002F` | corrente de referência | o "normal" aprendido de cada posição |

**O painel lê dois registradores por módulo e já sabe tudo:** a palavra de alarme diz *se* e *quem*; as correntes dizem *quanto*.

📌 **Endereço de cada módulo por chave DIP**, não por firmware. Assim um módulo de reposição sai da prateleira, recebe o endereço na chave e entra em operação — sem computador, sem gravar nada.

---

## 14.5 O que muda no painel

| Sai | Entra |
|---|---|
| ~~PI-2 — multiplexador no painel~~ | **MB-1** — módulo RS-485 (MAX485) |
| ~~Porta-fusíveis das posições~~ | (foram para dentro dos MPE) |
| ~~4 fios para a câmara~~ | **4 fios para o barramento** |

O painel deixa de medir corrente. Ele passa a **perguntar** — e isso é uma simplificação enorme: some a fiação analógica, somem os fusíveis, some a placa de medição.

**Pinos do Arduino Mega:**

| Pino | Função |
|---|---|
| **D14** (TX3) | Serial3 → MAX485 |
| **D15** (RX3) | Serial3 ← MAX485 |
| **D30** | DE/RE — chaveia entre falar e ouvir |

E ficam **livres** os pinos que o multiplexador usava: D31–D34 e A2.

---

## 14.5b O MB-1 por dentro

O MB-1 é pequeno — uma caixa DIN de 2 módulos — mas tem quatro coisas dentro, e **duas delas são as que costumam faltar**.

```
   ┌──────────────── MB-1 ────────────────┐
   │                                       │
   │   +5V ─────┬──[680 Ω]──┐              │
   │            │           │              │
   │        ┌───┴────────┐  ├──● A ────────┼──► para o MPE-1
   │        │  MAX485    │  │  │           │
   │  DI ───┤ DI      A ├──┘ [120 Ω]      │
   │  RO ───┤ RO      B ├──┐  │           │
   │ DE/RE ─┤ DE/RE     │  ├──● B ────────┼──► para o MPE-1
   │        └────────────┘  │              │
   │            ┌───────────┘              │
   │   0V ──────┴──[680 Ω]                 │
   └───────────────────────────────────────┘
```

| Componente | Qtd | Para que serve |
|---|---:|---|
| **Módulo MAX485** | 1 | traduz o TTL do Arduino para o par diferencial |
| **Resistor 120 Ω** | 1 | terminação — o painel é uma das **pontas** da linha |
| **Resistor 680 Ω** de A para +5 V | 1 | polarização de repouso |
| **Resistor 680 Ω** de B para 0 V | 1 | polarização de repouso |
| TVS SM712 *(opcional)* | 2 | protege A e B contra surto |

### 🔥 Os dois resistores de 680 Ω — o detalhe que ninguém lembra

Quando **nenhum** nó está transmitindo, o par A/B fica **flutuando**. Um receptor com entrada flutuante não lê "silêncio" — ele lê **lixo**, e o painel acha que está recebendo mensagem quando não está.

Os dois resistores resolvem: um puxa o A para cima, o outro puxa o B para baixo, e o repouso passa a ter um valor definido — o valor que significa "linha ociosa".

⚠️ **A maioria dos módulos MAX485 baratos NÃO traz esses resistores.** É a causa número um de barramento RS-485 que "funciona no teste da bancada e enlouquece na instalação": na bancada há sempre alguém falando; na instalação existem silêncios.

### Por que 120 Ω só nas pontas

O cabo tem uma impedância característica de ~120 Ω. Se a linha termina "no vazio", o sinal **reflete** na ponta e volta, somando-se ao que vem chegando — e corrompe os bits.

O resistor de 120 Ω imita um cabo infinito: o sinal chega, entrega a energia nele e não volta.

```
   [MB-1]════════[MPE-1]════════[MPE-2]════════[MPE-3]════════[MPE-4]
     ▲                                                            ▲
   120 Ω          (nada)         (nada)         (nada)          120 Ω
```

**Só nas duas pontas.** Um resistor a mais no meio carrega a linha e o sinal enfraquece.

---

## 14.5c ⚠️ Não é Uno — é Nano, e ele NÃO fica no painel

Vale desfazer uma confusão possível: **continuam existindo o Arduino Mega no painel e mais um Arduino por módulo de ensaio.** Eles fazem coisas diferentes e ficam em lugares diferentes.

| | **Arduino Mega** | **Arduino Nano** |
|---|---|---|
| Onde fica | dentro do painel | dentro de cada MPE, **junto da câmara** |
| Quantos | 1 | 1 por módulo (2 na entrega, 4 na fábrica) |
| Faz o quê | controla a câmara, PWM, sensores, intertravamento | varre 16 canais e compara com a referência |
| No Modbus | **mestre** — pergunta | **escravo** — responde |
| Custo | ~R$ 120 | ~R$ 25 |

### Por que não deixar o Mega ler os shunts direto?

Porque aí os **100 fios analógicos** teriam que atravessar a fábrica até o painel — que é exatamente o problema que a arquitetura existe para resolver.

> O Nano não está lá para "ter outro Arduino". Ele está lá para **digitalizar perto da carga**, de modo que o que viaje pela instalação seja um bit e não um milivolt.

### Por que Nano e não outro Mega

O Nano precisa de pouquíssimo: 4 pinos para escolher o canal do mux, 1 entrada analógica, 2 da serial e mais uns poucos. Um Mega ali seria cinco vezes o preço para usar 8 dos 70 pinos.

---

## 14.5d O que sai do painel

Somando tudo, saem **26 fios** do painel — e só **4 deles** são do sistema de ensaio, por causa do barramento.

| Vai para | O que leva | Fios |
|---|---|---:|
| ⭐ **Barramento de ensaio** | 24 V · 0 V · A · B | **4** |
| Peltier (dissipador, fora da câmara) | M+ e M− do BTS #1 | 2 |
| PTC (dentro da câmara) | M+ e M− do BTS #2 | 2 |
| Ventoinhas do radiador | + e − do MV-1 canal 1 | 2 |
| Ventoinha do PTC | + e − do MV-1 canal 2 | 2 |
| Ventoinhas de circulação | + e − do MV-1 canal 3 | 2 |
| RPM das 2 ventoinhas do radiador | 2 sinais + comum | 3 |
| AM2315C (dentro da câmara) | VCC · GND · SDA · SCL | 4 |
| DS18B20 (no dissipador) | DATA · VCC · GND | 3 |
| Iluminação da maquete | + e − | 2 |
| | **Total** | **26** |

### E o que atravessa a PAREDE da câmara

Repare que nem tudo que sai do painel entra na câmara:

| Entra na câmara | Não entra |
|---|---|
| PTC e sua ventoinha | ventoinhas do radiador (lado quente) |
| Ventoinhas de circulação | DS18B20 (fica no dissipador) |
| AM2315C | os módulos MPE (ficam do lado de fora) |
| Fios dos DUTs, vindos do MPE | |

### 📍 Onde fica o MPE: fora da câmara, encostado nela

```
     ┌─────── CÂMARA ───────┐
     │                       │   ┌─────────┐
     │  [DUT] [DUT] [DUT]    │   │  MPE-1  │
     │    │     │     │      │   │         │
     │    └─────┴─────┴──────┼───┤ 30 cm   │
     │      2 fios cada      │   │         │
     └───────────────────────┘   └────┬────┘
                                       │ 4 fios
                                       ▼ painel
```

**Por que fora e não dentro:** a câmara vai a 60 °C e desce a 5 °C, e nos 5 °C **forma condensação**. Água em placa energizada é o fim dela. Encostado na parede de fora, o MPE mantém os fios dos DUTs curtos — 30 cm em vez de 3 cm, mas 30 cm continuam sendo nada perto dos 20 m que seriam até o painel.

📌 **Os fios dos DUTs passam por um prensa-cabo na parede da câmara.** Com 16 posições são 32 fios; nesse volume, vale um **conector multivias** na parede em vez de fios soltos — assim o suporte inteiro se desconecta de uma vez para manutenção.

---

## 14.6 O que montar para a entrega

Não é preciso construir 50 posições para provar que a solução funciona. Mas **um módulo só também não prova**.

> 🎯 **Monte DOIS módulos.** Com um, você prova que a medição funciona. Com dois, você prova que **o barramento funciona** — endereçamento, múltiplos nós, e o painel distinguindo de qual módulo veio o alarme.
>
> **O risco a eliminar é o barramento, e barramento com um nó só não é barramento.**

| | Para a entrega | Na fábrica |
|---|---|---|
| Módulos MPE | **2** | 4 |
| Posições cabeadas | 16 de 32 | 50 de 64 |
| DUTs montados | 4 | 50 reais |
| Fios saindo do painel | **4** | **4** |

Passar de 2 para 4 módulos é **acrescentar módulo na cadeia e mudar a chave DIP**. Nenhuma alteração no painel, no firmware do Mega ou na fiação existente.

---

## 14.7 A demonstração

Com dois módulos e quatro DUTs, dá para mostrar exatamente o que a empresa pediu:

1. **Ensaio rodando** — a tela mostra as 4 correntes, todas normais
2. **Desliga a chave de um DUT** no módulo 2
3. **Em menos de 2 segundos** o sistema aponta: *"MPE-2, posição 3, sem corrente"*
4. **Os outros três continuam** sendo medidos normalmente
5. **O log registra** o instante, a temperatura da câmara naquele momento e qual posição caiu

O passo 5 é o que resolve a dor da empresa: hoje eles descobrem no fim do ensaio que algo morreu, **sem saber quando nem a que temperatura**.

---

## 14.8 Custo

| Item | Qtd | Unit. | Total |
|---|---:|---:|---:|
| Arduino Nano | 2 | R$ 25 | R$ 50 |
| Módulo MAX485 | 3 | R$ 8 | R$ 24 |
| Módulo CD74HC4067 | 2 | R$ 3,40 | R$ 7 |
| Resistor shunt 4,7 Ω 1% | 32 | R$ 0,30 | R$ 10 |
| Polyfuse 500 mA | 32 | R$ 1,00 | R$ 32 |
| Caixa, placa e bornes | 2 | R$ 45 | R$ 90 |
| Cabo par trançado blindado | 10 m | R$ 4/m | R$ 40 |
| | | **Total** | **~R$ 253** |

Para as 50 posições da fábrica, acrescentam-se 2 módulos: **~R$ 130**.

> 💰 Contra **~R$ 750 só em INA219** na solução ingênua — que ainda por cima não funcionaria, porque o I²C não atravessa a fábrica.

---

## ⚠️ Cuidados de montagem

- [ ] **Par trançado** nos fios A e B. Sem trançar, o cancelamento de ruído não acontece e o RS-485 perde a razão de existir
- [ ] **Resistor de 120 Ω** nas duas pontas do barramento — só nas pontas. É o casamento de impedância; sem ele o sinal reflete e corrompe
- [ ] **Endereço por chave DIP**, um diferente por módulo. Dois módulos com o mesmo endereço respondem juntos e o barramento trava
- [ ] O **0 V do barramento** acompanha o par. RS-485 é diferencial, mas os nós ainda precisam de referência comum
- [ ] **Ligação em cadeia**, nunca em estrela. Barramento é uma linha; ramificações criam reflexões
- [ ] Aprender a corrente de referência **com a câmara em temperatura ambiente**, antes do ensaio começar
