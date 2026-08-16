# CAMADA 1 · Doc 12 — Câmara Térmica: Isolamento, Porta e Vedação

> A "planta de processo" da fábrica. Aqui está o dimensionamento térmico com números — quanto calor entra, por onde entra, e o que fazer para reduzir. **Este é o documento que justifica tecnicamente cada escolha de material.**
>
> ✅ **Pré-requisito:** [Doc 10](10_base_e_chao_de_fabrica.md) e [Doc 11](11_subestacao_e_postes.md).
> 🖼️ **Desenho:** [Corte da câmara](../desenhos/07_camara_corte.svg)

---

## 🟢 Em palavras simples — uma geladeira que também sabe ser forno

A cabine é uma caixa de **5 litros** (do tamanho de uma caixa de sapato) que consegue **esfriar até abaixo de zero** e **esquentar até uns 50 °C**, sob comando.

Dentro dela ficam os dispositivos sendo testados, ligados e funcionando. O ensaio é isso: variar a temperatura e ver se eles aguentam.

### Como se faz frio sem compressor

A geladeira da sua casa usa gás e um compressor. A nossa usa uma **pastilha Peltier** — uma placa fina de cerâmica que tem uma propriedade estranha e útil:

> **Quando passa corrente por ela, um lado fica gelado e o outro fica quente.**

Não há gás, não há partes móveis, não faz barulho. O lado frio aponta para dentro da cabine; o lado quente fica do lado de fora, com um cooler soprando nele.

⚠️ **E aqui está o perigo dela.** A Peltier não "produz frio" — ela **transporta calor de um lado para o outro**. Se o lado quente não conseguir se livrar desse calor, ele volta atravessando a pastilha, o frio some, e ela **se destrói em menos de um minuto**.

> **É por isso que o projeto monitora a rotação dos coolers.** Se um cooler parar, o sistema desliga a Peltier na hora. Sem essa proteção, o componente mais caro do projeto queima antes de você perceber.

### Como se faz calor com segurança

Um aquecedor comum (resistência) tem um problema: se o controle travar ligado, ele esquenta até pegar fogo.

Usamos um **PTC**, que é uma resistência com um comportamento protetor embutido:

> **Quanto mais quente ela fica, MENOS corrente ela puxa.**

Ela se limita sozinha. Mesmo com o controle travado em 100 %, ela estabiliza numa temperatura e para de subir. É segurança que vem de fábrica, sem depender de software.

### Por onde o calor entra (e por que a porta é o vilão)

Isolar significa **atrasar** a entrada de calor — nunca impedir. E o cálculo deste documento mostra algo que surpreende:

| Por onde entra | % do calor total |
|---|---:|
| **A porta** (que é só 22 % da área) | **44 %** ⚠️ |
| Todas as paredes isoladas juntas | 32 % |
| Os ventiladores de dentro (motor esquenta) | 24 % |

> 🎯 **A porta é o elo fraco de qualquer câmara fria**, porque tem que ser transparente para você ver dentro — e transparente significa mal isolado. Por isso ela é **dupla, com ar entre os dois vidros**: o ar parado é um ótimo isolante, e é exatamente o mesmo princípio da janela de vidro duplo.

### O problema que quase ninguém prevê: água

Ar tem umidade. Quando o ar encosta numa superfície fria, essa umidade **vira água** — é o que acontece no copo de cerveja gelada.

Dentro da cabine, isso gera dois problemas:

| Problema | Consequência | Solução no projeto |
|---|---|---|
| Água escorrendo lá dentro | Pinga na eletrônica em ~1 h de operação | **Bandeja + dreno** para fora |
| Gelo na placa fria | Vira uma "manta" isolante e a câmara **para de esfriar** | **Ciclo de degelo** automático no firmware |
| Embaçamento **por fora** da porta | Você não vê nada durante a apresentação | **Porta dupla** — o cálculo prova que a simples embaça |

> 💡 **O cálculo de condensação da §12.2 é o melhor argumento técnico deste documento.** Ele prova, com números, que a porta simples **embaça por fora a 15,1 °C** (abaixo do ponto de orvalho de 18,2 °C) e a dupla não embaça (18,7 °C). Não é opinião — é conta.

### Dicionário rápido

| Termo | O que quer dizer |
|---|---|
| **Peltier (TEC)** | Placa que esfria de um lado e esquenta do outro quando recebe corrente |
| **PTC** | Aquecedor que puxa menos corrente conforme esquenta — se autolimita |
| **Carga térmica** | Quanto calor entra na câmara por segundo. É o que a Peltier precisa vencer |
| **ΔT (delta T)** | Diferença de temperatura entre dentro e fora |
| **Ponto de orvalho** | Temperatura em que o ar "solta" a água que carrega. Abaixo dela, condensa |
| **Barreira de vapor** | Camada que impede a umidade de entrar no isolante e estragá-lo |
| **Plenum** | O espaço vazio por onde o ar circula, embaixo do piso interno |
| **XPS** | Isopor de célula fechada. Não absorve água, corta limpo |
| **Qc** | Quanto calor a Peltier consegue bombear para fora |
| **Degelo** | Aquecer de leve, de propósito, para derreter o gelo acumulado |

---

## 12.1 Dimensões

| Medida | Valor |
|---|---|
| **Volume interno útil** | 200 × 100 × 250 mm = **5,0 litros** |
| Parede estrutural | Acrílico transparente **5 mm** |
| Dutos externos de circulação | Acrílico **3 mm**, seção 30 × 30 mm |
| **Isolamento** | **XPS 30 mm** (era 20 mm — ver §12.3) |
| Cobertura externa | Acrílico **branco 3 mm** (visual de painel PIR de câmara fria) |
| Altura do plenum inferior | 30 mm |
| **Dimensão externa final** | **336 × 176 × 326 mm** |
| Altura total com os dissipadores das Peltier | ≈ **406 mm** (⚠️ conferir com os 2 conjuntos lado a lado) |

### Como se chega às dimensões externas

```
LARGURA:     200 (útil) + 2×5 (acrílico) + 2×30 (dutos) + 2×30 (XPS) + 2×3 (cobertura) = 336 mm
PROFUNDIDADE: 100 (útil) + 2×5 (acrílico)              + 2×30 (XPS) + 2×3 (cobertura) = 176 mm
ALTURA:       250 (útil) + 2×5 (acrílico)              + 2×30 (XPS) + 2×3 (cobertura) = 326 mm
```

### Anatomia interna

```
       ┌─────────────────────────────┐  ← tampa topo (2× Peltier + dissipadores)
       │  ╔═══════════════════════╗  │
  ║    │  ║                       ║  │    ║   ← dutos laterais de retorno
  ║dut │  ║    ESPAÇO ÚTIL        ║  │ dut║      (30 × 30 mm, altura 210 mm)
  ║o   │  ║      220 mm           ║  │ o  ║
  ║    │  ║                       ║  │    ║
       │  ╠═══════════════════════╣  │  ← base interna 190×90 (sobre 4 cubinhos)
       │  ║  PLENUM 30 mm         ║  │  ← ar circula por baixo do PTC
       └──╨───────────────────────╨──┘  ← base externa + bandeja de condensado
```

---

## 12.2 Cálculo de carga térmica (a parte que vale nota)

### Áreas de troca

| Superfície | Área |
|---|---:|
| Paredes laterais (2×) | 0,050 m² |
| Parede traseira | 0,050 m² |
| Topo + base | 0,040 m² |
| Superfície extra dos dutos | 0,041 m² |
| **Subtotal — faces isoladas** | **0,181 m²** |
| **Porta (visor)** | **0,050 m²** |

### Condição de projeto

| Parâmetro | Valor |
|---|---|
| Temperatura ambiente | 25 °C |
| Umidade relativa ambiente | 65 % |
| **Ponto de orvalho do ambiente** | **18,2 °C** |
| Setpoint interno de projeto | 5 °C |
| **ΔT de projeto** | **20 K** |

### Resistência térmica das faces isoladas

| Camada | Espessura | k (W/m·K) | R (m²·K/W) |
|---|---:|---:|---:|
| Filme de ar interno (com ventilação forçada) | — | — | 0,08 |
| Acrílico | 5 mm | 0,19 | 0,026 |
| **XPS** | **30 mm** | **0,033** | **0,909** |
| Acrílico branco (cobertura) | 3 mm | 0,19 | 0,016 |
| Filme de ar externo | — | — | 0,13 |
| **R total** | | | **1,161** |
| **U = 1/R** | | | **0,86 W/m²·K** |

```
Q_paredes = U × A × ΔT = 0,86 × 0,181 × 20 = 3,1 W
```

### A porta: o elo fraco

| Configuração | R total | U (W/m²·K) | **Q (W)** | % da perda total |
|---|---:|---:|---:|---:|
| **Porta simples, acrílico 10 mm** | 0,263 | 3,80 | **3,8 W** | **55 %** |
| **Porta dupla, 2×5 mm + 10 mm de ar** | 0,413 | 2,42 | **2,4 W** | **44 %** |

> ⚠️ **Descoberta importante do dimensionamento:** a porta ocupa apenas **22 % da área** da câmara, mas responde por **mais da metade de todo o calor que entra**. Investir na porta rende muito mais que aumentar o isolamento das paredes.

### ⚠️ Verificação de condensação na face externa da porta

Este cálculo é o que decide entre porta simples e porta dupla:

```
Fluxo de calor:            q = U × ΔT
Temperatura da face externa: T_sup = T_ambiente − q × R_filme_externo

PORTA SIMPLES (10 mm):
  q     = 3,80 × 20 = 76,0 W/m²
  T_sup = 25 − 76,0 × 0,13 = 15,1 °C
  Ponto de orvalho = 18,2 °C
  → 15,1 °C < 18,2 °C  →  ❌ CONDENSA NA FACE EXTERNA

PORTA DUPLA (5 + ar 10 + 5 mm):
  q     = 2,42 × 20 = 48,4 W/m²
  T_sup = 25 − 48,4 × 0,13 = 18,7 °C
  → 18,7 °C > 18,2 °C  →  ✅ NÃO CONDENSA
```

> 🎯 **Este é o argumento decisivo.** Com porta simples, a face externa **embaça e escorre água** durante a apresentação — a câmara fica opaca, você não mostra nada e ainda pinga água na maquete. Com porta dupla, o visor fica **limpo e transparente**. É exatamente por isso que os expositores refrigerados de supermercado usam vidro duplo ou triplo.

### Balanço térmico total

| Fonte de calor | Carga |
|---|---:|
| Transmissão pelas paredes isoladas | 3,1 W |
| Transmissão pela porta dupla | 2,4 W |
| **Dissipação das 2 fans internas** (todo o trabalho elétrico vira calor **dentro**) | 3,0 W |
| Sensores e cabos | 0,2 W |
| Infiltração média (aberturas de porta) | ~0,8 W |
| **CARGA TÉRMICA TOTAL (câmara vazia)** | **≈ 9,5 W** |
| **2 posições de ensaio energizadas** (0,37 + 0,21 W) | **+0,6 W** |
| **CARGA TÉRMICA TOTAL COM DISPOSITIVOS** | **≈ 10,1 W** |

> 📌 **Os simuladores praticamente não aquecem, e isso é uma decisão consciente.** Eles existem para consumir uma corrente conhecida — o que se está provando é a **detecção de falha**, não o desempenho térmico. Ver [Doc 13 §13.3b](13_posicoes_de_ensaio.md).
>
> ⚠️ **Diga isto na apresentação:** numa cabine real as placas sob ensaio dissipariam dezenas de watts, e o ciclo de resfriamento seria mais lento do que o demonstrado aqui. A margem das Peltier (≈ 60 W a ΔT = 20 K contra 10,1 W) mostra que o dimensionamento **suportaria** essa carga extra — a maquete só não a reproduz.

### As Peltier dão conta?

> 🔄 **A refrigeração dobrou com a arquitetura "Potência em 24 V".** São **2 pastilhas TEC1-12706 ligadas EM SÉRIE**, formando uma carga de 24 V / 6,0 A / 144 W que se alimenta direto do barramento, sem conversor. Cada pastilha continua vendo os seus 12 V nominais.

| Parâmetro | 1 pastilha | **2 em série (adotado)** |
|---|---:|---:|
| Tensão / corrente | 12 V · 6,0 A | **24 V · 6,0 A** |
| Potência elétrica | 72 W | **144 W** |
| Qc máximo (ΔT = 0) | ~57 W | ~114 W |
| **Qc estimado a ΔT = 20 K** | ~30 W | **~60 W** |
| Carga térmica a vencer | 9,5 W | 9,5 W |
| **Margem** | 3,2× | **6,3×** |

✅ **Sobra muita capacidade.** Com 9,5 W de carga contra ~60 W disponíveis, o sistema alcança setpoints bem abaixo de 0 °C. Na prática o limite deixa de ser a capacidade de bombeamento e passa a ser a **formação de gelo** (§12.7) e a qualidade da dissipação do lado quente.

> 💡 **Por que dobrar, se uma já sobrava?** Não foi para ganhar capacidade — foi consequência da arquitetura. Duas pastilhas em série formam naturalmente uma carga de **24 V**, que é a tensão que o barramento já tem, e isso permitiu **eliminar o conversor T1** do projeto. A refrigeração extra veio de brinde. Ver [Doc 02 §2.10](../camada_0_fundamentos/02_arquitetura_de_energia.md).
>
> 🎯 **Use a margem para descer o setpoint, não para acelerar.** Com 6,3× de folga, é melhor operar as pastilhas em duty parcial (mais eficientes, menos ΔT, menos gelo) do que em 100 %.

### ⚠️ O gargalo real: a dissipação do lado quente — que também dobrou

| | Por pastilha | **Total (2 pastilhas)** |
|---|---:|---:|
| Potência elétrica | 72 W | 144 W |
| Calor bombeado (Qc) | ~30 W | ~60 W |
| **A rejeitar no lado quente** | **~100 W** | **~200 W** |

**São 2 conjuntos dissipador + cooler de 80 mm, um para cada pastilha** — não um dissipador maior para as duas. Se o lado quente saturar, o ΔT da pastilha aumenta, a capacidade de refrigeração despenca e a pastilha cozinha.

> ⚠️ **Este é o único ponto em que o Plano B ficou mais trabalhoso.** Reserve o espaço atrás/acima da câmara no projeto mecânico **antes** de cortar o acrílico, e confirme que a tampa do topo comporta as duas pastilhas com folga entre elas (a ponte térmica entre dissipadores encostados anula a separação).

> 💡 **Solução prática e barata: use 2 coolers de CPU recuperados** (soquete LGA775, AM3, etc.). São projetados para 65–95 W — exatamente a faixa de cada pastilha —, já vêm com base de cobre e **fan de 3 fios com sinal de RPM**, que é o que o projeto precisa para a proteção. Custam R$ 20–30 cada em loja de peças usadas e resolvem o problema mais crítico do projeto.
>
> ⚠️ **Os DOIS sinais de RPM vão para o Arduino**, e a parada de qualquer um dos dois já é motivo de bloqueio da refrigeração. Ver [Doc 32](../camada_3_eletrica/32_sinais_e_sensores.md) e [Doc 40](../camada_4_programacao/40_firmware_arduino.md).

### ⚠️ SÉRIE, nunca paralelo

Em série, cada pastilha recebe 12 V e as duas compartilham os mesmos 6 A. **Em paralelo, cada uma receberia os 24 V inteiros — o dobro do nominal — e as duas queimam em segundos.**

**Antes de energizar, meça a resistência do conjunto com o multímetro: deve dar o DOBRO da resistência de uma pastilha isolada.** Se der metade, a ligação está em paralelo. Compre as duas do mesmo lote e vendedor — em série elas conduzem a mesma corrente, e pastilhas descasadas trabalham desequilibradas.

---

## 12.3 Escolha do isolante — comparativo

| Material | k (W/m·K) | Espessura | R | Custo | Veredito |
|---|---:|---:|---:|---|---|
| EPS (isopor) | 0,037 | 30 mm | 0,81 | R$ | ❌ Célula aberta: absorve umidade e perde desempenho. Esfarela ao cortar |
| **XPS (poliestireno extrudado)** | **0,033** | **30 mm** | **0,91** | **R$$** | ✅ **ESCOLHIDO** — célula fechada, não absorve água, corta limpo com estilete |
| PIR / PU rígido (com face de alumínio) | 0,022 | 30 mm | 1,36 | R$$$ | ⭐ Melhor desempenho (**+50 %**). Use se encontrar sobra de obra |
| Espuma elastomérica (tipo Armaflex) | 0,036 | 19 mm | 0,53 | R$$$ | ✅ Não como isolante principal, mas **excelente para cantos, arestas e passagens** — é autoadesiva e é uma barreira de vapor por si só |
| Lã de rocha / lã de vidro | 0,040 | 30 mm | 0,75 | R$$ | ❌ Absorve umidade, solta fibras, precisa de barreira dos dois lados |
| Aerogel | 0,015 | 10 mm | 0,67 | R$$$$$ | ❌ Caríssimo e desnecessário nesta escala |
| Painel a vácuo (VIP) | 0,005 | 10 mm | 2,00 | R$$$$$ | ❌ Não pode ser furado nem cortado — inviável aqui |

### Por que 30 mm e não 20 mm?

| Espessura de XPS | U das paredes | Q das paredes | Ganho |
|---|---:|---:|---|
| 20 mm | 1,17 W/m²·K | 4,2 W | — |
| **30 mm** | **0,86 W/m²·K** | **3,1 W** | **−26 % de perda** |
| 40 mm | 0,68 W/m²·K | 2,5 W | −40 % (mas a câmara fica 20 mm maior em cada direção) |

**30 mm é o ponto de equilíbrio:** reduz 26 % da perda por um custo desprezível (a placa de XPS é vendida em espessuras de 20/30/40 mm pelo mesmo preço por m²) e mantém a câmara em um tamanho compatível com a maquete.

---

## 12.4 ⚠️ Barreira de vapor — o item que quase todo mundo esquece

Este é o conceito que separa um isolamento que funciona de um que degrada em um mês.

### O problema

O ar externo (25 °C, 65 % UR) tem **pressão de vapor maior** que o ar interno frio. Essa diferença empurra o vapor d'água **para dentro do isolamento**. Ao atravessar o XPS, o vapor encontra temperaturas cada vez mais baixas até cruzar o ponto de orvalho — e **condensa dentro do material**.

```
    EXTERNO 25 °C / 65 % UR                    INTERNO 5 °C
    pressão de vapor ALTA        ──────►       pressão de vapor BAIXA

    ┌──────────┬────────────────────┬──────────┐
    │ cobertura│       XPS          │ acrílico │
    │  branca  │      30 mm         │   5 mm   │
    └──────────┴────────────────────┴──────────┘
         ▲              ▲
         │              └── se o vapor chega até aqui, CONDENSA e vira água/gelo
         │                  → o XPS molhado tem k até 5× pior, PARA SEMPRE
         │
      BARREIRA DE VAPOR aqui  ← fita de alumínio, do lado QUENTE (externo)
```

### A regra

> 📌 **A barreira de vapor vai sempre do lado QUENTE do isolamento.**
> Em câmara **fria**, o lado quente é o **externo** → a fita de alumínio vai **por fora do XPS**, antes da cobertura branca.
> (Em uma estufa/incubadora seria o contrário. Como esta câmara faz os dois, priorize o modo frio, que é o crítico — no modo quente não há risco de condensação interna.)

### Execução

1. Cortar e colar o XPS nas 5 faces (tudo menos a porta).
2. **Fitar TODAS as juntas** com fita de alumínio de 50 mm, com 25 mm de sobreposição em cada lado.
3. Fitar também **todo o perímetro** de cada face (onde o XPS encontra o acrílico).
4. **Selar cada passagem de cabo** com espuma PU + silicone neutro por cima. As passagens são o caminho de menor resistência para o vapor.
5. Só então colar a cobertura de acrílico branco.

> 💡 **Como o acrílico interno (5 mm) também é praticamente impermeável ao vapor**, o XPS fica entre duas barreiras. Isso é aceitável **desde que você monte em dia seco** e sele bem: nada entra, nada fica preso dentro. Se montar em dia chuvoso, deixe as peças de XPS 24 h em ambiente seco antes de fechar.

---

## 12.5 A porta — projeto detalhado

### Conceito: porta dupla com câmara de ar selada

```
      CORTE HORIZONTAL DA PORTA (20 mm de espessura)

      externo                                    interno
         │                                          │
    ┌────┴─────────────────────────────────────┬────┴───┐
    │  ACRÍLICO 5 mm                           │        │
    ├──────────────────────────────────────────┤        │
    │  ░░░░░ CÂMARA DE AR SELADA 10 mm ░░░░░   │  ← 2 g de sílica gel
    │  ░░░░░  (moldura espaçadora 10 mm) ░░░░  │     dentro da câmara
    ├──────────────────────────────────────────┤        │
    │  ACRÍLICO 5 mm                           │        │
    └──────────────────────────────────────────┴────────┘
                                          ▓▓▓  ← EPDM tubular 9×6 mm
                                          ▓▓▓     (no perímetro da face interna)
                                     ┌────────┐
                                     │BATENTE │  ← moldura de acrílico 3 mm
                                     └────────┘     colada na face frontal
```

### Peças da porta

| Peça | Material | Dimensão | Qtd |
|---|---|---|---:|
| Vidro externo | Acrílico transparente 5 mm | 250 × 290 mm | 1 |
| Vidro interno | Acrílico transparente 5 mm | 250 × 290 mm | 1 |
| Moldura espaçadora (topo/base) | Acrílico transparente 10 mm | 250 × 10 mm | 2 |
| Moldura espaçadora (laterais) | Acrílico transparente 10 mm | 270 × 10 mm | 2 |
| **Batente** (moldura frontal da câmara) | Acrílico branco 3 mm | 336 × 326 mm, vazado 200 × 240 mm | 1 |

### Montagem da porta

1. Colar as 4 tiras espaçadoras de 10 mm no perímetro do vidro externo (cola S-320).
2. **Colocar 2 g de sílica gel indicadora** dentro da câmara de ar, presa em um cantinho com um pingo de cola. ⚠️ **Não pule isso:** sem sílica, a umidade presa na câmara de ar condensa entre os dois vidros no primeiro ciclo de frio e **você nunca mais consegue limpar**.
3. Colar o vidro interno por cima, fechando a câmara.
4. **Selar todo o perímetro externo** da junta com silicone neutro transparente — a câmara de ar tem que ser hermética.
5. Deixar curar 24 h.
6. Colar o perfil **EPDM tubular 9 × 6 mm** no perímetro da face interna da porta.
7. Instalar a dobradiça piano (250 mm) na lateral esquerda.
8. Instalar os **2 fechos de pressão** na lateral direita, ajustados para comprimir o EPDM em ~40 % da altura.

> ⚠️ **Perfil tubular, não perfil chato.** O EPDM chato de 5 mm comprime mal e deixa frestas nos cantos. O tubular de 9 × 6 mm se deforma e acompanha pequenos desalinhamentos — é o mesmo princípio da guarnição de geladeira.

### Teste de vedação da porta

> **Teste da folha de papel:** feche a porta prendendo uma folha de papel comum. Puxe. Ela deve **oferecer resistência clara** em qualquer ponto do perímetro. Se sair fácil em algum ponto, o EPDM não está comprimindo ali — ajuste o fecho ou acrescente uma segunda camada de perfil naquele trecho.
>
> Repita o teste em **8 pontos** (4 cantos + meio de cada lado).

---

## 12.6 Condensado e dreno

### Quanta água realmente se forma?

Sendo honesto com os números (a estimativa da versão anterior era exagerada):

```
Massa de ar na câmara: 0,005 m³ × 1,2 kg/m³ = 0,006 kg
Umidade absoluta a 25 °C / 65 % UR = 12,9 g/kg
Umidade absoluta saturada a 5 °C    =  5,4 g/kg
Água condensada por troca completa de ar = 0,006 × (12,9 − 5,4) ≈ 0,045 g
```

Ou seja: **cada abertura de porta gera ~0,05 g de água.** Em uma apresentação com 20 aberturas, ~1 g. **Não é uma inundação** — mas o problema real é outro:

### O problema real é o GELO, não a água

Toda essa umidade condensa **na superfície mais fria**, que são as placas frias das Peltier. Abaixo de 0 °C ela vira **gelo**, e o gelo:

| Efeito | Consequência |
|---|---|
| É isolante térmico (k ≈ 2,2, mas com ar aprisionado cai muito) | Bloqueia a troca de calor — a capacidade de refrigeração cai progressivamente |
| Bloqueia a passagem de ar entre as aletas | A circulação forçada perde eficiência |
| Ao degelar, escorre tudo de uma vez | **Aí sim** você tem água sobre a eletrônica |

> 🔧 **Solução no firmware — ciclo de degelo:** a cada 2 h de operação contínua em frio (ou quando a corrente do IS indicar queda de desempenho), desligar a Peltier e ligar o PTC em duty baixo (~20 %) por 3 minutos, mantendo as fans ligadas. A água escorre para a bandeja e sai pelo dreno. Implementação em [Doc 40](../camada_4_programacao/40_firmware_arduino.md).

### Projeto do dreno

```
        interior da câmara
              │
     ┌────────▼─────────┐
     │ bandeja alumínio │  ← inclinada 3° para um canto
     └────────┬─────────┘
              │ furo Ø 6 mm no ponto mais baixo
     ═════════╪═══════════  base + XPS (selar com PU + silicone)
              │
              │ tubo de silicone Ø 6 mm
              │
              ╰──╮      ← ⚠️ SIFÃO (curva em U com ~15 mm de coluna d'água)
                 ╰──╮
                    ╰────────► frasco coletor, embutido na maquete
```

### ⚠️ O sifão não é opcional — ele tem 3 funções

| Função | Explicação |
|---|---|
| **1. Bloqueia a entrada de ar** | Um tubo de dreno aberto é um furo direto para o ambiente. Sem sifão, você tem **infiltração contínua de ar quente e úmido** — o equivalente a deixar a porta entreaberta. A carga térmica dispara e o gelo se forma sem parar |
| **2. Bloqueia a entrada de vapor** | Mesma coisa, para a difusão de vapor |
| **3. Equaliza a pressão** | Ao resfriar de 25 °C para 5 °C, o ar interno contrai ~7 %. Numa câmara perfeitamente selada isso criaria uma depressão de vários kPa (dezenas de kgf puxando a porta para dentro). O sifão cede sob pequena diferença de pressão e equaliza, sem deixar o ar entrar livremente |

> Faça o sifão simplesmente **amarrando o tubo de silicone em um laço** fixo com abraçadeira. Encha-o com água uma vez antes do primeiro ensaio.

### Sílica gel

| Onde | Quantidade | Função |
|---|---|---|
| Dentro da câmara, em sachê perfurado | 2 sachês | Reduz a umidade residual do ar interno |
| **Dentro da câmara de ar da porta dupla** | 2 g | Impede o embaçamento entre os dois vidros |

Troque quando a sílica indicadora mudar de cor (azul → rosa). Pode ser regenerada no forno a 120 °C por 2 h.

---

## 12.7 Dutos e circulação de ar

| Modo | Atuador | Fans internas | Caminho do ar |
|---|---|---|---|
| **Frio** | 2× Peltier em série (topo) | Sopram **↓** | Centro ↓ → plenum inferior → dutos laterais ↑ → retorno pelo topo |
| **Quente** | PTC de 24 V (base) | Sopram **↑** | Centro ↑ → dutos pelo topo → laterais ↓ → retorno pelo plenum |

### Verificação da velocidade do ar

```
Vazão de 2 fans de 40 mm:  ≈ 10 CFM = 0,0047 m³/s
Seção de 2 dutos:          2 × (30 × 30) = 1800 mm² = 0,0018 m²
Velocidade nos dutos:      0,0047 / 0,0018 = 2,6 m/s      ✅ adequado
Trocas de ar por segundo:  0,0047 / 0,005 = ~0,94          ✅ ~1 troca/s, excelente
```

> ✅ Velocidade entre 2 e 4 m/s é a faixa ideal: abaixo disso a mistura é ruim (estratificação térmica), acima disso o ruído e a perda de carga aumentam sem ganho.

### ⚠️ Os dutos ficam DENTRO do envelope isolante

Erro comum: isolar só a caixa central e deixar os dutos expostos. Como os dutos conduzem **ar já condicionado**, deixá-los para fora do isolamento é como isolar a casa e deixar a tubulação de água gelada passando pelo sol.

```
   ERRADO                              CERTO
 ┌──────────────┐                 ┌────────────────────┐
 │███ XPS ██████│                 │████████ XPS ███████│
 │█ ┌────────┐ █│                 │█ ┌──┐┌────────┐┌──┐│
 │█ │ câmara │ █│  ║duto║         │█ │du││ câmara ││du││
 │█ └────────┘ █│  exposto        │█ │to│└────────┘│to││
 │██████████████│  ao ambiente    │█ └──┘          └──┘│
 └──────────────┘                 └────────────────────┘
```

---

## 12.8 Lista definitiva de acrílico (levar para a gráfica)

> Solicitar **corte a laser**. Bordas marcadas 45° recebem **meia-esquadria** (chanfro); as marcadas 90° são coladas de topo.

### Acrílico transparente 5 mm

| Peça | Dimensão | Qtd | Bordas 45° | Recorte |
|---|---|---:|---|---|
| Parede lateral ESQ / DIR | 110 × 250 mm | 2 | Traseira + Topo + Base | **90 × 210 mm** (abertura do duto) |
| Parede traseira | 210 × 250 mm | 1 | Esq + Dir + Topo + Base | — |
| Tampa topo | 210 × 110 mm | 1 | Todas as 4 | Recorte das **2 Peltier** + prensa-cabo |
| Base externa | 210 × 110 mm | 1 | Todas as 4 | Furo Ø 6 mm do dreno |
| Base interna (apoio do PTC) | 190 × 90 mm | 1 | — (todas 90°) | — |
| **Porta — vidro externo** | 250 × 290 mm | 1 | todas 90° | — |
| **Porta — vidro interno** | 250 × 290 mm | 1 | todas 90° | — |
| **Subtotal 5 mm** | | **8 peças** | | |

### Acrílico transparente 10 mm

| Peça | Dimensão | Qtd |
|---|---|---:|
| Espaçador da porta — topo/base | 250 × 10 mm | 2 |
| Espaçador da porta — laterais | 270 × 10 mm | 2 |
| **Subtotal 10 mm** | | **4 peças** |

### Acrílico transparente 3 mm — dutos (2 conjuntos)

| Peça | Dimensão | Qtd | Bordas 45° | Borda 90° |
|---|---|---:|---|---|
| Face frontal do duto | 30 × 210 mm | 2 | Esq + Dir + Topo + Base | — |
| Faces laterais do duto | 30 × 210 mm | 4 | Frontal + Topo + Base | Traseira (cola na parede) |
| Tampas topo do duto | 30 × 30 mm | 2 | Frontal + Esq + Dir | Traseira |
| Tampas base do duto | 30 × 30 mm | 2 | Frontal + Esq + Dir | Traseira |
| **Subtotal 3 mm transparente** | | **10 peças** | | |

### Acrílico BRANCO 3 mm — cobertura externa e batente

| Peça | Dimensão | Qtd |
|---|---|---:|
| Cobertura traseira | 330 × 320 mm | 1 |
| Cobertura lateral ESQ / DIR | 170 × 320 mm | 2 |
| Cobertura topo | 336 × 176 mm | 1 |
| Cobertura base | 336 × 176 mm | 1 |
| **Batente frontal** (moldura) | 336 × 326 mm, **vazado 200 × 240 mm** | 1 |
| **Subtotal branco 3 mm** | | **6 peças** |

### Sobras

| Peça | Dimensão | Qtd | Origem |
|---|---|---:|---|
| Cubinhos de apoio da base interna | 20 × 20 × 30 mm | 4 | Sobra de 5 mm colada |

### 📋 Resumo para a gráfica

| Espessura | Cor | Peças |
|---|---|---:|
| 5 mm | Transparente | 8 |
| 10 mm | Transparente | 4 |
| 3 mm | Transparente | 10 |
| 3 mm | **Branco** | 6 |
| **TOTAL** | | **28 peças** |

---

## 12.9 Sequência de montagem

```
 1. Limpar todas as peças (álcool isopropílico) e remover o filme só das faces a colar
 2. Colar os 4 cubinhos 20×20×30 nos cantos do chão interno
 3. Colar a estrutura principal: traseira + 2 laterais + base externa (usar esquadro!)
 4. Apoiar a base interna 190×90 sobre os cubinhos (NÃO colar — tem que ser removível
    para limpeza e para acessar a bandeja de condensado)
 5. Recortes das **2 Peltier** na tampa topo + prensa-cabo → colar a tampa
 6. Montar os 2 dutos (5 peças cada) e colar por fora das paredes laterais,
    alinhados com a abertura de 90 × 210 mm
 7. Silicone neutro em TODAS as juntas internas → curar 24 h
 8. Instalar a bandeja de alumínio, o furo e o tubo de dreno com sifão
 9. Colar o XPS 30 mm nas 5 faces (contornando os dutos)
10. ⚠️ FITA DE ALUMÍNIO em todas as juntas e no perímetro (barreira de vapor)
11. Selar todas as passagens de cabo com espuma PU + silicone
12. Colar a cobertura de acrílico BRANCO 3 mm
13. Colar o batente frontal (moldura vazada 200 × 240)
14. Montar a porta dupla (§12.5), com a sílica dentro → curar 24 h
15. Instalar dobradiça, EPDM tubular e os 2 fechos de pressão
16. Teste da folha de papel em 8 pontos do perímetro
```

> ⚠️ **Cola S-320 e silicone NEUTRO.** Silicone acético (o de cheiro de vinagre, mais barato) **ataca o acrílico** e provoca microfissuras (*crazing*) que deixam a peça leitosa e frágil. Confira no tubo: tem que estar escrito "neutro" ou "antifungo neutro".

---

## 12.10 ✅ Checklist de aceitação

- [ ] 28 peças de acrílico recebidas e conferidas (dimensões e chanfros)
- [ ] Estrutura principal colada e **esquadrejada** (diagonais iguais ±1 mm)
- [ ] Base interna **removível** apoiada nos 4 cubinhos, plenum de 30 mm confirmado
- [ ] 2 dutos colados e alinhados com as aberturas de 90 × 210 mm
- [ ] Todas as juntas internas com silicone **neutro**, curadas 24 h
- [ ] Bandeja de alumínio inclinada, furo no ponto baixo
- [ ] **Sifão** no dreno montado e preenchido com água
- [ ] XPS 30 mm colado nas 5 faces, **envolvendo os dutos**
- [ ] **Fita de alumínio em 100 % das juntas** (barreira de vapor) — nenhuma fresta visível
- [ ] Passagens de cabo seladas com PU + silicone
- [ ] Cobertura de acrílico branco colada
- [ ] Porta dupla montada, **com sílica gel dentro da câmara de ar**, perímetro selado
- [ ] EPDM tubular no perímetro; 2 fechos comprimindo ~40 %
- [ ] **Teste da folha de papel aprovado nos 8 pontos**
- [ ] **Teste de estanqueidade:** fechar a câmara com um secador soprando ar quente por 30 s numa fresta e verificar (com a mão ou fumaça de incenso) se há vazamento em algum ponto
- [ ] **2 dissipadores** do lado quente, cada um para ≥ 100 W (coolers de CPU), com os **2 sinais de RPM** ligados
- [ ] **As 2 Peltier em SÉRIE** — resistência do conjunto = 2× a de uma pastilha isolada
- [ ] **PTC de 24 V** (não o de 12 V), ligado direto no BTS #2
- [ ] **As 4 fans internas são de 12 V** e vêm do BD-AUX — nunca do borne de 24 V

---

📄 **Anterior:** [Doc 11 — Subestação e Postes](11_subestacao_e_postes.md) · **Próximo:** [Doc 20 — Painel de Comando](../camada_2_painel/20_painel_projeto_e_layout.md)
