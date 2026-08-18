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
| Água escorrendo lá dentro | Pinga na eletrônica em ~1 h de operação | **Bandeja removível + sílica gel** (§12.6) |
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
| ~~XPS~~ | Isopor de célula fechada. **Saiu do projeto** — o vão de 30 mm dele ficou com ar (§12.2) |
| **Barreira de radiação** | Superfície de baixa emissividade (a fita de alumínio, ε ≈ 0,05). ⚠️ **Só funciona de frente para um vão de ar** |
| **Emissividade** | O quanto uma superfície irradia calor. Acrílico ≈ 0,90 · alumínio polido ≈ 0,05 |
| **Qc** | Quanto calor a Peltier consegue bombear para fora |
| **Degelo** | Aquecer de leve, de propósito, para derreter o gelo acumulado |

---

## 12.1 Dimensões

| Medida | Valor |
|---|---|
| **Volume interno útil** | 200 × 100 × 250 mm = **5,0 litros** |
| **Envelope externo** | 🔧 **356** × 176 × 326 mm (a largura cresceu 20 mm com o duto de 40) |
| Parede estrutural | Acrílico transparente **5 mm** |
| Dutos externos de circulação | Acrílico **3 mm**, seção 🔧 **40 × 40 mm** (era 30 × 30) |
| **Isolamento** | 🔧 **Fita de alumínio colada direto no acrílico** (era XPS 30 mm — ver §12.2) |
| ~~Cobertura externa~~ | 🔧 **REMOVIDA.** A fita de alumínio passou a ser a superfície externa |
| Altura do plenum inferior | 30 mm |
| **Dimensão externa final** | 🔧 **290 × 110 × 260 mm** (era 336 × 176 × 326) |
| Altura total com os dissipadores das Peltier | ≈ **406 mm** (⚠️ conferir com os 2 conjuntos lado a lado) |

### Como se chega às dimensões externas

```
LARGURA:     200 (útil) + 2×5 (acrílico) + 2×40 (dutos) = 290 mm  🔧
PROFUNDIDADE: 100 (útil) + 2×5 (acrílico)              = 110 mm  🔧
ALTURA:       250 (útil) + 2×5 (acrílico)              = 260 mm  🔧

🔧 A CÂMARA ENCOLHEU MUITO. Saíram, em duas etapas, o XPS de 30 mm, o
   vão de ar que o substituiu e a cobertura branca de 3 mm — ou seja,
   66 mm de cada dimensão. A caixa foi de 356 × 176 × 326 para
   290 × 110 × 260 mm.

⚠️ ISSO AFETA O LAYOUT DA BASE DA MAQUETE. O Doc 10 desenha a área da
   câmara como 336 × 176 mm, e a demarcação amarela de piso segue esse
   contorno. Os dois precisam ser refeitos para 290 × 110 mm.
```

### Anatomia interna

```
       ┌─────────────────────────────┐  ← tampa topo (2× Peltier + dissipadores)
       │  ╔═══════════════════════╗  │
  ║    │  ║                       ║  │    ║   ← dutos laterais de retorno
  ║dut │  ║    ESPAÇO ÚTIL        ║  │ dut║      (40 × 40 mm, altura 210 mm)
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
| ~~XPS 30 mm~~ | ~~30 mm~~ | ~~0,033~~ | ~~0,909~~ |
| ~~Vão de ar 30 mm~~ | — | — | 🔧 **removido junto com a cobertura** |
| ~~Acrílico branco (cobertura)~~ | — | — | 🔧 **removida** |
| 🔧 **Filme de ar externo, superfície ALUMINIZADA** | — | ε ≈ 0,05 | **0,31** (era 0,13 com acrílico nu) |
| **R total** | | | 🔧 **0,416** |
| **U = 1/R** | | | 🔧 **2,40 W/m²·K** |

```
Q_paredes = U × A × ΔT = 2,40 × 0,181 × 20 = 8,7 W   (3,1 W com XPS · 4,8 W com vão de ar)
```

### 🔧 Revisão — a fita de alumínio no lugar do XPS, e o que ela realmente faz

**Primeiro a parte desconfortável: fita de alumínio não é isolante.** Ela tem 0,05 mm e o alumínio conduz a 205 W/m·K — a resistência térmica dela é, para efeito prático, **zero**. O que ela é de verdade é uma **barreira de radiação**: a emissividade cai de ~0,90 (acrílico) para ~0,05.

E barreira de radiação **só funciona de frente para um vão de ar**. Colada camada sobre camada direto no acrílico, as camadas se tocam, o calor atravessa por condução pelo próprio alumínio, e o ganho é quase nada.

**Mas o simulador respondeu quanto custa, e a resposta é boa:**

| Isolamento | tempo até 10 °C | **duty médio em regime** | fuga a 5 °C |
|---|---:|---:|---:|
| **XPS 30 mm** (projeto original) | 12,5 min | **41 %** | 5,5 W |
| ⭐ **Fita alu + vão de ar de 30 mm** | 12,8 min | **44 %** | 7,2 W |
| **Fita alu colada, sem vão** | 13,4 min | **51 %** | 11,0 W |
| Acrílico nu, sem nada | 14,9 min | 66 % | 19,4 W |

> 🎯 **Três leituras que valem o relatório:**
>
> **1. Todos funcionam.** Até o acrílico nu chega aos 5 °C, a 66 % de duty. O projeto tem folga, e agora isso é um número e não uma esperança.
>
> **2. O isolamento quase não muda o tempo de descida** (12,5 → 14,9 min). A descida é limitada pela massa térmica e pela potência da Peltier, não pela fuga. **O isolamento decide o esforço para MANTER, não a velocidade para CHEGAR.**
>
> **3. O vão de ar vale 7 pontos de duty, de graça.** É a diferença entre usar a fita como barreira de radiação (com vão) e como enfeite (colada).

#### 🔧 E depois a cobertura externa também saiu

A recomendação anterior era **tirar o XPS mas deixar o vão de ar**, com a cobertura branca fazendo a segunda parede. **A cobertura foi removida do projeto**, e com ela o vão. Sobrou a fita colada direto no acrílico — a terceira linha da tabela.

**Isso não zera o ganho da fita**, e vale entender por quê. Mesmo de frente para o ar da sala, uma superfície com ε ≈ 0,05 troca muito menos calor por **radiação** que uma de ε ≈ 0,90:

```
   Superfície comum (acrílico):   h_conv 3,0 + h_rad 4,6 = 7,6 W/m²K → R = 0,13
   Superfície aluminizada:        h_conv 3,0 + h_rad 0,3 = 3,3 W/m²K → R = 0,31
```

**A resistência de superfície mais que dobra.** É por isso que a fita sozinha ainda entrega 51 % de duty, contra 66 % do acrílico nu.

| | duty de regime | fuga a 5 °C |
|---|---:|---:|
| XPS 30 mm | 41 % | 5,5 W |
| Fita + vão de ar | 44 % | 7,2 W |
| ⭐ **Fita colada — o projeto atual** | **51 %** | **11,0 W** |
| Acrílico nu, sem fita | 66 % | 19,4 W |

> ⚠️ **Dois custos de deixar a fita exposta**, que não são térmicos e valem a decisão consciente:
>
> **1. Ela é frágil.** São 0,05 mm de alumínio. Ponta solta engancha e rasga, e a borda corta o dedo. Passe a unha dobrando as rebarbas antes de a câmara ir para a mesa.
>
> **2. Some o visual de painel de câmara fria.** Era a função estética da cobertura branca. Numa apresentação avaliada, isso conta — e a cobertura custava 5 chapas de 3 mm e 8 cubinhos.
>
> 💡 **Se um dia ela voltar**, o ganho de 51 % → 44 % vem junto de graça: basta manter os espaçadores de 30 mm e aluminizar a face interna dela.

#### ✅ E o que a fita faz de melhor não é térmico

Você citou a razão certa: **vedar as frestas do acrílico colado**. Isso vale mais do que o ganho térmico, e ainda mais agora que o dreno saiu:

| Função | Por quê importa |
|---|---|
| **Barreira de vapor** | Acrílico colado tem microfrestas na junta. Fita de alumínio é praticamente impermeável a vapor |
| **Menos vapor entrando** | ⭐ É exatamente o que a estratégia de **sílica sem dreno** precisa: quanto menos vapor entra, mais tempo a sílica dura e menos gelo se forma |
| **Barreira de radiação** | Com vão de ar, os 7 pontos de duty acima |

> 🎯 **A fita e a sílica se reforçam.** Menos vapor entrando → menos condensação → a sílica dá conta → o dreno não faz falta. **É uma decisão coerente, não um atalho** — e é assim que ela deve ser defendida.

### A porta: o elo fraco

| Configuração | R total | U (W/m²·K) | **Q (W)** | Carga total | % da perda |
|---|---:|---:|---:|---:|---:|
| **Porta simples, acrílico 10 mm** | 0,263 | 3,80 | **3,8 W** | 12,5 W | **30 %** |
| **Porta dupla, 2×5 mm + 10 mm de ar** | 0,413 | 2,42 | **2,4 W** | **11,1 W** | 🔧 **22 %** |

> ### 🔧 Correção — a porta deixou de ser "mais da metade"
>
> A versão anterior dizia: *"a porta ocupa 22 % da área mas responde por mais da metade de todo o calor que entra."* **Era verdade com o XPS**, quando as paredes deixavam entrar só 3,1 W. Sem o XPS, sem o vão e sem a cobertura, as paredes passaram a **8,7 W** e a porta caiu para **22 %** — exatamente a fração da área que ela ocupa.
>
> ⚠️ **É o tipo de número que envelhece calado.** A frase continuava impressionante e continuava errada — quem a repetisse na banca seria corrigido com uma conta de duas linhas.
>
> ✅ **A conclusão prática, porém, não muda:** a porta dupla economiza **1,4 W** por duas chapas de acrílico e quatro tiras. Ainda é o melhor retorno por real gasto da câmara — só não é mais "metade da perda".
>
> 📌 **Carga total pelas superfícies: 11,1 W.** Confere com o simulador, que usa `UA = 0,555 W/K × 20 K = 11,1 W` — e ele chegou lá por outro caminho, somando o consumo passo a passo.
>
> 🎯 **E a conclusão inverteu:** a porta deixou de ser desproporcional. Ela ocupa 22 % da área e responde por 22 % da perda. **Agora quem manda são as paredes** — se um dia faltar capacidade, é lá que se mexe, não na porta.

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

### ⭐ Onde fica cada componente, e por quê

```
        ╔═══ dissipadores + coolers (LADO QUENTE, fora) ═══╗
   ┌────╨──────────────────────────────────────────────╨────┐
   │  ░░░░░░░░░░░░░ XPS 30 mm ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
   │  ░  ┌──────────────────────────────────────────┐    ░  │
   │  ░  │        [ 2× PELTIER em série ]           │    ░  │
   │  ░d │        [ 2 ventoinhas ] ▼ ▼              │  d ░  │
   │  ░u │                                          │  u ░  │
   │  ░t │              🌡️ AM2315C                  │  t ░  │
   │  ░o │           (centro geométrico)            │  o ░  │
   │  ░▲ │                                          │  ▲ ░  │
   │  ░  │              [ vent. PTC ] ▲             │    ░  │
   │  ░  │  [DUT 1]     [   PTC 24 V  ]    [DUT 2]  │    ░  │
   │  ░  ├──────────────────────────────────────────┤    ░  │
   │  ░  │          PLENUM 30 mm                    │    ░  │
   │  ░  └──────────────────────────────────────────┘    ░  │
   └─────────────────────────────────────────────────────────┘
```

| Componente | Onde | **Por que ali** |
|---|---|---|
| **2× Peltier** | tampa, centro | O ar frio **desce sozinho**. Embaixo, o frio empoçaria no fundo |
| 2 ventoinhas frias | sob a Peltier, soprando ↓ | Sem elas o frio fica colado na pastilha e a câmara estratifica |
| **🌡️ AM2315C** | **centro geométrico, suspenso** | 🔥 **O ponto mais importante da montagem** — ver abaixo |
| **PTC 24 V** | base, centro, sobre o plenum | O ar quente **sobe sozinho** — o oposto da Peltier |
| Ventoinha do PTC | sobre o PTC, soprando ↑ | Canal próprio no MV-1: intertravada com o aquecedor |
| **DUT 1 e DUT 2** | base, um de cada lado | Com folga das paredes, para o ar circular em volta |
| 2 vent. de duto | dentro dos dutos laterais | Fecham o circuito de ar, e ficam **fora** do volume útil |

> 🔥 **Por que o sensor tem que ficar no centro, longe dos dois.** Encostado na Peltier ele lê **a pastilha**, não o ar: o controle enxerga −10 °C quando a câmara está a +5 °C, desliga cedo e o setpoint nunca chega. Perto do PTC acontece o mesmo ao contrário. **No centro, ele lê o que o dispositivo sob ensaio realmente sente** — que é a única temperatura que interessa.
>
> ⚠️ Suspenso por fio de nylon ou haste fina. **Nada de parafusar na parede** — o acrílico conduz a temperatura da parede direto para o corpo do sensor.

📐 **O posicionamento continua verificado por script**, mesmo depois de a aba "Dentro da câmara" sair do aplicativo: o `npm run valida:camara` cobra que nenhum componente invada a parede, que nenhum encoste no outro, que o sensor esteja mesmo no centro geométrico e que **todo fio que a câmara recebe tenha borne de verdade no painel**.

---

### Balanço térmico total

| Fonte de calor | Antes (XPS) | 🔧 **Agora (vão de ar)** |
|---|---:|---:|
| Transmissão pelas paredes | 3,1 W | 🔧 **8,7 W** |
| Transmissão pela porta dupla | 2,4 W | 2,4 W |
| 🔧 **Dissipação das ventoinhas internas** — todo o trabalho elétrico vira calor **dentro** | 3,0 W (2 fans) | **6,0 W** (⭐ são **5**, e ligam juntas) |
| Sensores e cabos | 0,2 W | 0,2 W |
| Infiltração média (aberturas de porta) | ~0,8 W | ~0,8 W |
| **CARGA TÉRMICA TOTAL (câmara vazia)** | ≈ 9,5 W | **≈ 18,1 W** |
| **2 posições de ensaio energizadas** | +0,6 W | +0,6 W |
| **CARGA TÉRMICA TOTAL COM DISPOSITIVOS** | ≈ 10,1 W | 🔧 **≈ 18,7 W** |

> ### 🔧 Duas linhas mudaram, e a segunda é a que surpreende
>
> A das paredes já era esperada — foi a troca do XPS pelo vão de ar (§12.2).
>
> **A das ventoinhas não era.** A tabela somava *"2 fans internas"* porque elas eram comutadas por modo. Hoje são **cinco** (2 frias + 2 dos dutos + a do PTC) e ligam **todas juntas**, num canal só do MV-1. **Todo watt elétrico que uma ventoinha interna consome vira calor dentro da câmara** — ela não tem para onde mandar. São 6 W, e agora são a **maior fonte isolada de carga térmica**, maior que as paredes.
>
> 📌 **É o mesmo erro que o simulador achou no Doc 02**, aparecendo pela segunda vez em outro documento: ninguém releu as contas depois de a simplificação juntar as cinco ventoinhas num canal só.
>
> ✅ **E continua cabendo:** 18,7 W contra os ~60 W que as duas Peltier bombeiam a ΔT = 20 K. **Margem de 3,2×** — era 4× com o vão de ar.
>
> 💡 **Se um dia faltar capacidade, é aqui que se corta:** separar as ventoinhas dos dutos num segundo canal do MV-1 (o canal 2 está livre) devolveria ~2,4 W de carga e ~0,25 A no ramal de 12 V.

> 📌 **Os simuladores praticamente não aquecem, e isso é uma decisão consciente.** Eles existem para consumir uma corrente conhecida — o que se está provando é a **detecção de falha**, não o desempenho térmico. Ver [Doc 13 §13.3b](13_posicoes_de_ensaio.md).
>
> ⚠️ **Diga isto na apresentação:** numa cabine real as placas sob ensaio dissipariam dezenas de watts, e o ciclo de resfriamento seria mais lento do que o demonstrado aqui. A margem das Peltier (≈ 60 W a ΔT = 20 K contra 18,7 W) mostra que o dimensionamento **suportaria** essa carga extra — a maquete só não a reproduz.

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

## 12.6 Condensado: bandeja, sílica e respiro

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

> 🔧 **Solução no firmware — ciclo de degelo:** a cada 2 h de operação contínua em frio (ou quando a corrente do IS indicar queda de desempenho), desligar a Peltier e ligar o PTC em duty baixo (~20 %) por 3 minutos, mantendo as fans ligadas. **A água escorre para a bandeja**, que você esvazia depois do ensaio. Implementação em [Doc 40](../camada_4_programacao/40_firmware_arduino.md).

### 🔧 Revisão — sai o dreno, entra bandeja removível + sílica + respiro

**A conta acima é que decide.** ~1 grama de água numa apresentação inteira não justifica furar a base, passar tubo de silicone, montar sifão, selar com PU e embutir frasco coletor. Para algumas gotas, isso é canhão para matar mosca.

| Sai | Entra |
|---|---|
| Furo Ø 6 mm na base + selagem PU | — |
| Tubo de silicone, sifão e frasco coletor | — |
| Bandeja fixa e inclinada 3° | **Bandeja de alumínio REMOVÍVEL**, sem furo — você a puxa e esvazia |
| — | **3 sachês de sílica gel indicadora** |
| — | ⚠️ **Tubo de respiro** — ver abaixo |

> ⚠️ **A sílica sozinha NÃO resolve, e vale saber por quê.** Ela baixa a umidade **do ar**; ela não recolhe a água que **já condensou na placa fria** — e é lá que a água vai, porque a condensação sempre acontece na superfície mais fria. Quando o ciclo de degelo derreter o gelo, aquilo escorre. **A sílica reduz quanto se forma; a bandeja recolhe o que se formou.** As duas coisas, não uma.

### ⚠️ O respiro — a função do sifão que você NÃO pode jogar fora

O sifão fazia três coisas. Duas somem sem problema. A terceira é física e não negocia:

```
   Resfriar de 25 °C para 5 °C contrai o ar em 6,7 %
   Numa câmara BEM vedada:   ΔP ≈ 6,7 kPa
   Na porta de 200 × 250 mm (0,05 m²):   335 N   ≈   34 kgf
```

**Trinta e quatro quilos puxando a porta para dentro.** Isso empena acrílico, arrebenta vedação e trinca junta colada.

Na prática o acrílico não é hermético e equaliza pelas frestas — mas aí você tem **entrada descontrolada de ar úmido**, que é justamente o que gera o gelo. **Vedar bem sem dar caminho de equalização é trocar um problema pelo outro.**

> ✅ **A solução, e ela custa dois reais:** um **tubo de silicone Ø 4 mm × 300 mm**, enrolado em espiral dentro da câmara, com uma ponta saindo pela parede traseira. Equaliza a pressão, e o caminho longo e estreito corta quase toda a difusão de vapor.
>
> **Sem água para encher, sem o que entornar, sem frasco.** Faz o trabalho do sifão sem ser um sifão.

### Sílica gel

| Onde | Quantidade | Função |
|---|---|---|
| Dentro da câmara, em sachê perfurado | 2 sachês | Reduz a umidade residual do ar interno |
| **Dentro da câmara de ar da porta dupla** | 2 g | Impede o embaçamento entre os dois vidros |

Troque quando a sílica indicadora mudar de cor (azul → rosa). Pode ser regenerada no forno a 120 °C por 2 h.

---

## 12.7 Dutos e circulação de ar

> 🔥 **CORREÇÃO DE PROJETO.** A versão anterior deste documento dizia que o ar **invertia
> o sentido** entre resfriar e aquecer. **Isso não é executável**, e a razão é simples:
>
> - **Uma ventoinha DC não gira ao contrário.** Invertendo a polaridade ela não parte — a
>   eletrônica interna de comutação não trabalha em reverso. E mesmo que partisse, a pá é
>   assimétrica e moveria quase nada de ar para trás.
> - **As 2 ventoinhas do duto dividem um canal só** (MV-1 · O3). Não existe comando que
>   faça uma soprar para cima e depois para baixo.
>
> **O circuito de ar é ÚNICO e fixo.** O que o controle escolhe é qual fonte energizar.

### O circuito de ar — sempre o mesmo

```
              ┌──────── retorno pelo topo ────────┐
              │                                   │
              ▼          [ PELTIER ]              │
              │          [ ventoinhas ▼ ]         │
              │                                   │
   duto  ▲    │            🌡️ sensor              │    ▲  duto
   esq.  ▲    ▼                                   │    ▲  dir.
         ▲    │          [ vent. PTC ▼ ]          │    ▲
         ▲    │   [DUT1]  [  PTC  ]  [DUT2]       │    ▲
         ▲    └──────────── plenum ───────────────┘    ▲
         └────────────────────────────────────────────┘
```

| Modo | O que é energizado | Ventoinhas | Caminho do ar |
|---|---|---|---|
| **Frio** | 2× Peltier (topo) | circulação (O3) | **sempre o mesmo:** centro ↓ → plenum → dutos ↑ → topo |
| **Quente** | PTC de 24 V (base) | circulação (O3) **+ a do PTC (O2)** | **idem** |

> ⭐ **E é assim que câmara climática de verdade funciona:** um circuito de ar fixo, com o
> aquecedor e o evaporador **no mesmo trajeto**. O controlador decide o que ligar; o
> ventilador nunca muda de sentido.

⚠️ **Consequência prática:** a **ventoinha do PTC sopra para BAIXO**, igual às de cima. Ela
empurra o ar sobre o aquecedor e para dentro do plenum, de onde ele sobe pelos dutos e
volta pelo topo. O ar aquecido **atravessa todo o volume** — só entra pelas laterais em vez
de pelo centro.

### 🔌 Como as duas Peltier se ligam EM SÉRIE

Esta é a ligação que mais gera dúvida, porque o par forma **uma carga só** de 24 V — e não duas de 12 V.

```
   do painel                                          de volta ao painel
   BTS #1 · M+                                             BTS #1 · M−
       │                                                        │
       ▼                                                        │
   ┌───────────┐        fio de ligação        ┌───────────┐     │
   │ PASTILHA 1│  −  ────────────────────  +  │ PASTILHA 2│  −  ┘
   │  vermelho │                              │           │
   └───────────┘                              └───────────┘
        12 V                    +                  12 V     =  24 V
```

| Passo | O que fazer |
|---|---|
| 1 | O fio **vermelho** da pastilha 1 recebe o `M+` que vem do painel |
| 2 | O fio **preto** da pastilha 1 vai no **vermelho** da pastilha 2 — é a EMENDA DA SÉRIE, e ela fica dentro da câmara |
| 3 | O fio **preto** da pastilha 2 volta ao painel, no `M−` do BTS #1 |

> ⭐ **Só DOIS fios atravessam a parede**, não quatro. A emenda entre as pastilhas é feita ali mesmo, no topo, com terminal isolado ou solda com termorretrátil.

⚠️ **A polaridade decide qual lado esfria.** Invertendo o par, a face que deveria ficar fria vira a quente — e como o dissipador está do outro lado, a pastilha cozinha em menos de um minuto. **Antes de parafusar, energize por 10 segundos e sinta com a mão qual face esfriou.**

📌 **As duas pastilhas têm que ser do mesmo modelo e do mesmo lote.** Em série passa a MESMA corrente pelas duas; se uma tiver resistência diferente, ela recebe tensão diferente e trabalha fora do ponto.

### 🌀 E as ventoinhas do lado frio, que são duas

Elas **não** se ligam na pastilha — vêm do painel, pelo canal 3 do MV-1, e são de **12 V**:

```
   MV-1 · O3+ ──┬── ventoinha fria 1 (+)     ┬── ventoinha do duto 1 (+)
                └── ventoinha fria 2 (+)     └── ventoinha do duto 2 (+)
   MV-1 · O3− ──── os quatro negativos juntos
```

> 🔥 **NUNCA ligue a ventoinha na saída da Peltier.** A saída do BTS é PWM de 24 V; a ventoinha é de 12 V contínuos. Além de queimar, ela pararia sempre que o controle reduzisse o duty — exatamente quando o ar mais precisa circular.

**Quatro ventoinhas em paralelo, dois fios atravessando a parede.** Elas formam um circuito de ar só, então ligam e desligam juntas.

---

### 🧊 Por que TUDO entra pelo fundo

Não é preferência — é a única parede que sobra:

| Parede | Por que não serve |
|---|---|
| **Frente** | é a porta, e ela abre |
| **Laterais** | são os dutos de circulação de 40 mm |
| **Topo** | tem as Peltier e os dissipadores |
| **Base** | é onde a bandeja de condensado desliza |
| ✅ **Fundo** | **livre — é por aqui** |

🔧 **A vista 3D girável saiu do aplicativo** na enxugada de agosto/2026, junto com as abas "Dentro da câmara" e "Detecção de falha". **Os dados e os validadores ficaram**: `npm run valida:camara` e `valida:camara:rotas` continuam provando que os dois prensa-cabos estão em cantos opostos, que nenhum componente invade a parede e que todo fio que entra na câmara tem borne de verdade no painel. O que se perdeu foi a ilustração, não a verificação.

---

### 🔌 Dois prensa-cabos na parede, e não um

São **16 condutores** entrando na câmara, divididos em dois grupos que **não podem dividir o mesmo furo**:

| | **PC-1 · POTÊNCIA** | **PC-2 · MEDIÇÃO E SINAL** |
|---|---|---|
| Fios | **8** | **8** |
| O quê | Peltier ± e PTC ± (1,5 mm²)<br>ventoinhas O2 e O3 (0,5 mm²) | positivos e retornos das 2 posições (0,5 mm²)<br>AM2315C: VCC GND SDA SCL (0,25 mm²) |
| Característica | **6 A chaveados pelos BTS** | 17,6 mA medidos · pulsos de I²C |
| Onde | canto inferior da parede traseira | canto superior, **≥ 100 mm** do PC-1 |

> 🔥 **Por que não pode ser um só.** Cada corte de 6 A nos BTS gera um transiente que se acopla **por indutância mútua** em qualquer condutor que corra paralelo. Do outro lado estão justamente os dois sinais mais frágeis do projeto: o **retorno das posições**, que carrega a corrente que está sendo medida, e o **I²C**, com pulsos de microssegundos. Um transiente induzido ali vira **leitura errada** ou **sensor travado** — e o pior é que a falha é intermitente, aparecendo só quando a Peltier chaveia.
>
> 📐 **Dentro do PC-2, trance cada par:** o positivo de cada posição com o **seu próprio** retorno, e SDA com SCL. Par trançado tem área de laço quase nula — o que se induz numa volta se cancela na seguinte.

📌 É a mesma lógica das canaletas segregadas dentro do painel, aplicada à travessia da parede. Não adianta separar potência e sinal no painel inteiro e depois juntar tudo num furo só.

---

📐 **O que continua valendo:** o PTC fica embaixo e a Peltier em cima. Não é mais pelo
sentido do ar forçado, e sim porque **cada fonte fica no início do trajeto que a favorece** —
e porque, com tudo desligado, a convecção natural ainda ajuda em vez de atrapalhar.

### Verificação da velocidade do ar

```
Vazão de 2 fans de 40 mm:  ≈ 10 CFM = 0,0047 m³/s
Seção de 2 dutos:          2 × (40 × 40) = 3200 mm² = 0,0032 m²
Velocidade nos dutos:      0,0047 / 0,0032 = 1,5 m/s
Trocas de ar por segundo:  0,0047 / 0,005 = ~0,94          ✅ ~1 troca/s, excelente
```

> ### 🔧 Correção — o duto passou de 30 × 30 para 40 × 40 mm
>
> **A causa é a mudança das ventoinhas.** Enquanto elas ficavam *dentro* do duto, 30 × 30 já era apertado para um corpo de 40 mm. Agora que elas ficam **na boca**, soprando para dentro, um duto de 30 × 30 seria um **estrangulamento na saída da ventoinha**: 1600 mm² de hélice descarregando em 900 mm² de duto. A ventoinha trabalharia contra a própria restrição, com ruído e vazão real bem abaixo da nominal.
>
> **Casando a seção do duto com a da ventoinha (40 × 40), a descarga é direta.**
>
> | | 30 × 30 | **40 × 40** |
> |---|---:|---:|
> | Seção dos 2 dutos | 1800 mm² | **3200 mm²** |
> | Velocidade | 2,6 m/s | **1,5 m/s** |
> | Restrição na saída da fan | 🔥 44 % de estrangulamento | ✅ nenhuma |
> | Largura externa da câmara | 336 mm | 🔧 **356 mm** |
>
> ⚠️ **1,5 m/s fica abaixo da faixa de 2–4 m/s que eu chamei de "ideal" acima**, e é justo apontar. Mas aquela faixa é regra de bolso para dutos de ar-condicionado, onde o que se otimiza é atrito por metro de duto. **Aqui o duto tem 21 cm.** O atrito é irrelevante e o que importa é a vazão total — que é a mesma, e dá ~1 troca de ar por segundo. **Menos velocidade com a mesma vazão é melhor:** menos ruído, menos perda de carga, e a ventoinha entregando o que promete em vez de lutar contra um estrangulamento.

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
| Parede traseira | 210 × 250 mm | 1 | Esq + Dir + Topo + Base | 2 furos Ø 16 (prensa-cabos) + ⭐ **Ø 6 do respiro** |
| Tampa topo | 210 × 110 mm | 1 | Todas as 4 | Recorte das **2 Peltier** + prensa-cabo |
| Base externa | 210 × 110 mm | 1 | Todas as 4 | 🔧 **nenhum furo** |
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
| Tampas topo do duto | 🔧 **40 × 40 mm** | 2 | Frontal + Esq + Dir | Traseira |
| ⚠️ ~~Tampas base do duto~~ | — | — | — | **NÃO EXISTEM: é a boca por onde a ventoinha sopra** |
| **Subtotal 3 mm transparente** | | **10 peças** | | |

### Acrílico BRANCO 3 mm — só o batente

| Peça | Dimensão | Qtd |
|---|---|---:|
| ~~Cobertura traseira, laterais, topo e base~~ | — | 🔧 **REMOVIDAS** |
| **Batente frontal** (moldura) | 🔧 **290 × 260 mm**, vazado 200 × 240 mm | 1 |
| **Subtotal branco 3 mm** | | 🔧 **1 peça** (eram 6) |

> 🔧 **As 5 faces de cobertura saíram do projeto**, e com elas os 8 espaçadores de 30 mm. A fita de alumínio passou a ser a superfície externa da câmara — ver §12.2 para o que isso custa em duty (44 % → 51 %) e para os dois custos não-térmicos.
>
> ⭐ **O batente frontal fica.** Ele não era cobertura: é a moldura onde o perfil EPDM se apoia e onde a porta comprime. Sem ele a porta não tem contra o que vedar. A medida acompanhou o encolhimento da caixa.

### Sobras

| Peça | Dimensão | Qtd | Origem |
|---|---|---:|---|
| Cubinhos de apoio da base interna | 20 × 20 × 30 mm | 4 | Sobra de 5 mm colada — ⭐ **estes ficam**: são o vão onde a bandeja desliza, não os espaçadores da cobertura |

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
 8. Encaixar a bandeja de alumínio REMOVÍVEL no vão (sem furo, sem tubo, sem sifão)
 9. ⭐ FITA DE ALUMÍNIO em TODA a superfície externa da caixa e em TODA a face
    interna da cobertura branca — sobrepor 10 mm nas emendas
10. ⭐ Montar o RESPIRO: tubo Ø 4 mm × 300 mm enrolado dentro, saindo pelo furo
    de 6 mm da traseira
11. Selar todas as passagens de cabo com espuma PU + silicone
12. Colar os 8 espaçadores de 30 mm e, sobre eles, a cobertura BRANCA 3 mm
    ⚠️ o vão de 30 mm fica VAZIO — é ele que substituiu o XPS
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
