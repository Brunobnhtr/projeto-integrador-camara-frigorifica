# CAMADA 0 · Doc 03 — Lista de Materiais (BOM)

> A BOM está organizada **na ordem de construção (por camada)**, não por tipo de peça. Assim você compra o que precisa quando precisa, e não fica com R$ 800 em componentes parados esperando a maquete ficar pronta.
>
> 🔄 **Mudanças em relação à versão anterior:** a **fonte ATX saiu** (não tem 24 V — ver [Doc 02 §2.1](02_arquitetura_de_energia.md)); entraram a **fonte chaveada de 24 V**, os **conversores step-down**, o **disjuntor**, os **relés de interface KA1/KA2** e todo o material de cenografia da maquete.
>
> ✅ **Revisão "Potência em 24 V" (Plano B) — o que mudou nesta BOM:**
>
> | Saiu | Entrou |
> |---|---|
> | ~~1× XL4016 (T1)~~ + ~~2× XL4015~~ | **1× kit com 2 módulos LM2596 com display** (T2 e T3) |
> | ~~6× Diodo Zener (5V6 / 13 V / 15 V)~~ | **nada** — proteção nativa no CI do LM2596 |
> | ~~2× porta-fusível (F4/F5)~~ + ~~fusíveis de saída~~ | **nada** — F1/F2/F3 continuam |
> | ~~2× voltímetro 3 fios~~ (T2 e T3) | **nada** — display já vem no módulo |
> | ~~Tubo PVC Ø 63 mm + tampas~~ + ~~cooler 30 mm do T1~~ | **Janelas de acrílico** nos tubos dos postes |
> | ~~1× Peltier~~ · ~~1× PTC 12 V~~ · ~~1× cooler 80 mm~~ | **2× Peltier (série)** · **1× PTC 24 V** · **2× cooler 80 mm** |
>
> **Efeito líquido no orçamento: praticamente neutro.** O que se gasta a mais nas Peltier e nos coolers, economiza-se nos conversores, voltímetros e componentes de proteção.

---

## 🟢 Em palavras simples — como usar esta lista sem se perder

Esta é a **lista de compras** do projeto. Ela é longa, e isso assusta. Mas há três coisas que tornam ela fácil de usar:

**1. Ela está na ordem em que você vai construir, não por tipo de peça.**
Não procure "todos os resistores" — eles estão espalhados de propósito, cada um perto da etapa em que é usado. Você compra o que precisa quando precisa.

**2. Você não compra tudo de uma vez.** São 5 lotes:

| Lote | Quando | Por quê |
|---|---|---|
| **A** | Agora | Coisas que demoram a chegar. Se atrasar, atrasa o projeto inteiro |
| **B** | Agora também | Acrílico e MDF — a gráfica leva de 5 a 10 dias para cortar |
| **C** | Ao começar o painel | Não adianta ter borne com a caixa do painel ainda por fazer |
| **D** | Ao começar a fiação | Cabos e terminais |
| **E** | No fim | Tinta, figuras, acabamento |

**3. As colunas querem dizer isto:**

| Coluna | O que é |
|---|---|
| **Item** | O nome pelo qual procurar |
| **Qtd** | Quantos comprar — já inclui reservas onde faz sentido |
| **Especificação** | Os detalhes que **não podem** estar errados. É aqui que mora o motivo de o item ser aquele e não outro |
| **Link** | Deixado em branco de propósito, para você colar o anúncio escolhido |

> ⚠️ **Leia a coluna Especificação antes de comprar, sempre.** Muitos itens deste projeto têm um "sósia" mais barato que **não serve**. Exemplos reais: relé de 10 A que só vale 5 A em corrente contínua; PTC de 12 V no lugar do de 24 V; fusível de 6 A onde precisa de 10 A. Todos parecem certos no anúncio.

### Os 6 erros de compra mais fáceis de cometer

Se você já tinha uma lista antiga em mãos, **confira estes seis antes de fechar o pedido**:

| ⚠️ | Item | O erro |
|---|---|---|
| 1 | **Peltier** | Comprar 1. São **3** (2 em uso + 1 reserva), do mesmo lote |
| 2 | **PTC** | Comprar o de 12 V. Tem que ser **24 V** — e é o item mais difícil de achar |
| 3 | **Cooler externo 80 mm** | Comprar 1. São **2**, e os dois com **3 fios** |
| 4 | **Fusível F1** | Comprar 6 A. Tem que ser **10 A** |
| 5 | **Fio rígido** | Comprar fino. **Vermelho 1,00 mm²** e **azul 1,50 mm²** |
| 6 | **Fonte** | Comprar a de 150 W. **Só a de 240 W atende** |

### Dicionário rápido de compras

| Termo no anúncio | O que quer dizer |
|---|---|
| **Trilho DIN** | Barra metálica padrão onde os componentes do painel encaixam. Tudo "DIN" encaixa nela |
| **Borne** | Peça onde o fio é preso com parafuso. Organiza e permite desmontar |
| **Step-down** | Abaixa a tensão |
| **CC / CV** | Corrente Constante / Tensão Constante — modos de ajuste de um conversor |
| **NA / NF** | Contato Normalmente Aberto / Normalmente Fechado |
| **Bivolt / auto-range** | Funciona em 110 e 220 V sem chavinha |
| **Terminal tubular (ilhós)** | Ponteira que se crimpa na ponta do fio antes de parafusar. **Obrigatório** em painel |
| **3 fios** (num cooler) | Tem o fio extra que informa a rotação. O projeto **depende** disso |

---

## Índice de compras por prioridade

| Lote | Quando comprar | Itens | Custo estimado |
|---|---|---|---|
| **Lote A** | Agora — prazo longo de entrega | Eletrônica importada, kit LM2596, fonte 240 W, **3× Peltier**, ⚠️ **PTC de 24 V** (item mais difícil de achar) | ~R$ 700 |
| **Lote B** | Junto com o A | Estrutura da maquete e acrílico (gráfica leva 5–10 dias) | ~R$ 450 |
| **Lote C** | Ao iniciar a Camada 2 | Painel, trilho DIN, bornes, botoeiras | ~R$ 350 |
| **Lote D** | Ao iniciar a Camada 3 | Cabos, terminais, canaleta, fusíveis | ~R$ 200 |
| **Lote E** | Por último | Cenografia, tintas, figuras, acabamento | ~R$ 200 |

> Valores são ordem de grandeza para orçamento (Mercado Livre / lojas de material elétrico, 2026). Preencha a coluna **Link** com o anúncio escolhido.

---

## 🌏 Comprando no AliExpress — o que muda no planejamento

A planilha gerada tem uma coluna **🌏 AliExpress** com busca pronta **em inglês** (termo em português não acha quase nada por lá). Mas importar muda três coisas no projeto, e a mais perigosa não é o preço.

### 1. ⏱️ O prazo é o risco real — não o preço

| Origem | Prazo típico |
|---|---|
| Mercado Livre / loja local | 2 a 7 dias |
| **AliExpress** | **20 a 60 dias** |
| AliExpress com "Envio do Brasil" | 5 a 15 dias (mais caro, estoque limitado) |

> ⚠️ **Um pedido feito hoje pode chegar depois da entrega do projeto.** Faça a conta ao contrário: **data da apresentação − 60 dias = último dia para pedir.** Se essa data já passou, compre nacional e pare de discutir preço.

### 2. 🔁 Não existe devolução prática — compre reserva

Se um componente chegar morto, errado ou nunca chegar, **você não recebe outro a tempo**. Isso muda a lógica de quantidades:

| Componente | Reserva | Por quê |
|---|---|---|
| Peltier | **+1** (já na lista: 3) | É o que mais queima, e queima por erro de montagem |
| LM2596 | **+1 kit** | São os únicos conversores do projeto |
| BTS7960 | **+1** | Sem ele não há acionamento |
| ULN2803 | **+1** (já na lista: 2) | Custa centavos |
| DS18B20 | **+1** | É o sensor que fecha a malha de controle |
| ESP32 | **+1** | É o protagonista do edital |
| Arduino Mega | **+1** (já na lista: 2) | Roda o PID, o intertravamento e as proteções |

> 💡 **A regra:** se o item **para o projeto** quando falha, e vem do exterior, compre dois. A diferença de custo é de poucos reais; a diferença de risco é o projeto inteiro.

### 3. 💰 O preço do anúncio não é o preço final

Importação para pessoa física tem **imposto**, e as regras mudam com frequência. Trate o valor anunciado como **base**, não como total, e **confira as regras vigentes** antes de fechar o pedido.

> 📌 **Regra prática de orçamento:** reserve **+40 % sobre o valor do anúncio** para imposto e frete. Se sobrar, ótimo. Se você orçar pelo preço do anúncio, vai faltar.

### 4. ⚡ O que NÃO importar — e este é um argumento de norma

O edital exige *"garantir conformidade com normas de segurança elétrica"*. Componentes que fazem parte da **cadeia de proteção** precisam ser certificados, e produto de importação direta não traz certificação INMETRO.

| Comprar **NACIONAL** (certificado) | Por quê |
|---|---|
| **Disjuntor 2P 6 A curva C** | É a proteção da entrada em 127 V. Certificação não é detalhe |
| **Fonte chaveada 24 V / 240 W** | Faz a barreira entre 127 V e a parte SELV. Além disso é pesada — frete inviabiliza |
| **Relés KA1 e KA2** | Aqui você **vê o produto, tem nota fiscal e consegue trocar** se vier errado. Importado, um relé sem marca chega em 40 dias e sem recurso — e relé é peça de segurança, no caminho crítico da montagem |
| **Porta-fusíveis, trilho DIN, canaleta, bornes** | Baratos aqui, volumosos para importar |
| **Cabos e terminais** | Peso e volume |
| **MDF, acrílico, tintas, cenografia** | Óbvio |

| Comprar **IMPORTADO** (vale muito a pena) | Economia típica |
|---|---|
| Peltier, PTC de 24 V, INA219, ULN2803, LM2596, BTS7960 | 3× a 5× mais barato |
| ESP32, Arduino, tela ES3C28P, sensores, módulo RTC | 2× a 4× |
| Coolers, dissipadores, botoeiras 22 mm, sinaleiros | 2× a 3× |

> ✅ **A planilha já faz essa separação sozinha:** o link do AliExpress só aparece nos itens que faz sentido importar. **Item sem link de AliExpress é recomendação de compra nacional, não falha do gerador.**

### 5. 📦 Estratégia de pedido

1. **Divida em 2 pedidos** com vendedores diferentes. Se um travar na alfândega ou sumir, você não fica sem nada.
2. **Priorize o que tem prazo longo E é insubstituível**: PTC de 24 V, Peltier, LM2596.
3. **Prefira vendedores com muitas vendas e avaliação alta**, mesmo custando um pouco mais.
4. **Tire foto de tudo ao abrir** — é a sua única prova se algo vier errado.
5. **Teste cada componente assim que chegar**, ainda dentro do prazo de reclamação. Não deixe para descobrir na montagem que o módulo veio morto.

> 🎯 **O item mais crítico para pedir cedo é o PTC de 24 V.** No mercado nacional ele é raro; no AliExpress é comum, mas com o prazo longo. **Ele define a sua data-limite de pedido.**

---

# 🔌 SISTEMA DE ENERGIA (o coração da refatoração)

## E.1 — Subestação: entrada AC e fonte principal

| Item | Qtd | Especificação | Busca sugerida | Link |
|---|---:|---|---|---|
| **Fonte chaveada 24 Vcc** | 1 | **24 V / 10 A / 240 W**, bivolt 110-220 V (chave seletora ou auto-range). Modelo tipo **S-240-24** | `fonte chaveada 24v 10a 240w` | |
| **Disjuntor DIN 2P 6 A curva C** | 1 | Bipolar, 6 A, curva C (por causa do inrush da fonte), 3 kA | `disjuntor bipolar 6a curva c din` | |
| ~~Chave rotativa 0-1 22 mm~~ | ~~1~~ | **REMOVIDA do projeto.** O disjuntor Q0 acumula proteção e chave geral. ⚠️ Por isso ele precisa ficar **acessível por fora** da casa de comando: monte atrás de uma tampa com recorte, como num quadro de luz | `chave seletora 2 posicoes 22mm` | |
| Cabo PP 3×1,5 mm² + plugue | 1,5 m | Cabo de entrada AC com plugue 2P+T 10 A | `cabo pp 3x1,5 com plugue` | |
| Prensa-cabo PG9 / PG13 | 3 | Entrada e saída de cabos da caixa da subestação | `prensa cabo pg9` | |
| Borne DIN 4 mm² | 6 | Distribuição 24 V e 0 V na subestação | `borne trilho din 4mm parafuso` | |
| **Cooler 60 mm 24 V** | 1 | Exaustão da **casa de comando** (~29 W de perda da fonte). ⚠️ **Obrigatório, não opcional** — a casinha encolheu para 250 × 150 × 90 mm e a fonte continua dissipando o mesmo. ⚠️ **24 V**: é a única tensão de saída disponível. Alternativa: 2× de 12 V **em série** | `cooler 60mm 24v` | |
| Grade + filtro 60 mm | 1 | Veneziana de entrada de ar da subestação | `grade cooler 60mm com filtro` | |

> ⚠️ **A CASA DE COMANDO deve ser fechada e aparafusada.** É o único lugar do projeto com 127 V AC. Sinalize com etiqueta **"PERIGO — 127 V CA"** na tampa.
>
> 🔄 **A subestação é um PÁTIO ABERTO** (cercado, com brita), com uma **casa de comando** fechada dentro dele — como numa subestação real ao tempo. Só a fonte, o disjuntor e a chave ficam trancados; os fusíveis de 24 V ficam **visíveis no pátio**. Ver [Doc 11 §11.3](../camada_1_maquete/11_subestacao_e_postes.md).

## E.2 — Conversores de tensão (os "transformadores" da maquete)

| Item | Qtd | Especificação | Ajuste | Link |
|---|---:|---|---|---|
| ⭐ **Kit 2× Módulo LM2596 com display** | 1 kit | Step-down **3 A**, Vin até 40 V, saída ajustável, **display LED vermelho de 3 dígitos** integrado. Um módulo vira o **T2**, o outro vira o **T3** | ver abaixo | [Mercado Livre](https://www.mercadolivre.com.br/kit-2-modulo-regulador-de-tensao-lm2596-display-ajustavel/up/MLBU4063333801) |
| → **T2** (poste P2, comando) | — | 1º módulo do kit — alimenta Arduino, tela ES3C28P, RTC, lógica dos BTS, placa PI-1 e **os LEDs da iluminação da maquete** | **5,10 V** | |
| → **T3** (poste P3, auxiliares) | — | 2º módulo do kit — alimenta as fans internas e os coolers | **12,0 V** | |
| Kit LM2596 reserva | 1 kit | **Opcional mas recomendado.** São os únicos conversores do projeto; queimar um na véspera sem reserva significa não apresentar | — | |
| **Dissipador de alumínio ~20 × 15 × 10 mm** | 2 | ⚠️ **Obrigatório**, colado no CI LM2596S de cada módulo. Sem ele o T3 passa dos 100 °C dentro do tubo — ver [Doc 02 §2.8](02_arquitetura_de_energia.md) | — | |
| Fita térmica dupla face | 1 | Fixação dos dissipadores | — | |
| **Acrílico transparente 1 mm** | 1 lâmina | **Janelas de visualização** nos 3 tubos dos postes (~20 × 12 mm cada) — protege o display e mantém o visual fechado | — | |
| **Voltímetro + amperímetro digital 3 fios** | 1 | **Único medidor comprado à parte** — vai na caixa de derivação do **P1**, mostrando os 24,0 V do barramento e **a corrente das Peltier ao vivo**. Faixa: 0-100 V / 10 A | — | |

> ⭐ **Por que o LM2596 com display, e não os XL4015/XL4016 da versão anterior:** com a potência térmica ligada direto em 24 V, a maior carga que sobrou para um conversor é de **0,87 A** — o LM2596 de 3 A sobra. E ele traz duas coisas que os XL não têm: **display integrado** (a tensão de saída fica visível ao público em tempo real) e **proteção térmica + limite de corrente nativos no chip**, que foi o que permitiu eliminar todo o circuito crowbar. Ver [Doc 02 §2.5](02_arquitetura_de_energia.md).

> 💡 **Dica de apresentação — a janela de acrílico:** recorte uma janelinha de ~20 × 12 mm no tubo de PVC de cada "transformador" e cole por dentro a lâmina de acrílico transparente. O **display vermelho do LM2596 fica visível de longe**, marcando 5,10 V no poste P2 e 12,0 V no P3, enquanto o medidor do P1 mostra os 24,0 V da linha. A transformação de tensão deixa de ser um argumento e vira uma coisa que o público **lê**. Vire as janelas para o lado da rua e ponha os furos de ventilação nas costas do tubo.
>
> A maioria das versões desse módulo tem um **botãozinho que alterna o display entre tensão de entrada e de saída** — se o seu tiver, é a demonstração inteira em um toque: 24,0 V → aperta → 5,10 V.

## E.3 — Proteção do sistema de energia

| Item | Qtd | Especificação | Aplicação | Link |
|---|---:|---|---|---|
| Porta-fusível mini automotivo | 3 | **Fusível de LÂMINA (automotivo)**, não de vidro. Trilho DIN 35 mm **ou** bloco parafusado — ver nota abaixo | **F1, F2, F3** — entrada dos 3 ramais, **na subestação** | |
| *Alternativa:* **bloco de 3 posições para fusível lâmina** | 1 | Substitui os 3 suportes acima. ⚠️ Conferir: **fusível lâmina** · **≥ 10 A por posição** · **≥ 32 Vdc** · preferir **entrada comum** (1 entrada + 3 saídas). Parafusa na parede da caixa — dispensa trilho DIN na subestação | idem | |
| **Fusível mini automotivo 10 A** | 2 | 1 uso + 1 reserva | **F1** — ramal R1 (potência 24 V, 6,0 A) | |
| Fusível mini automotivo 2 A | 4 | 2 usos + 2 reservas | **F2** (comando) e **F3** (auxiliares) | |
| Terminal olhal M4 amarelo | 10 | Aterramento e barramento de 0 V | — | |

> ⚠️ **F1 subiu de 6 A para 10 A.** O ramal de potência agora conduz 6,0 A contínuos em 24 V; um fusível de 6 A abriria em operação normal. **Confira antes de comprar** — é o erro mais fácil de cometer copiando a lista antiga.

> ### ⚠️ Os 3 ramais são TODOS de 24 V — confusão comum
>
> É natural olhar "3 ramais" e pensar "24 V, 12 V e 5 V". **Não é isso.** No ponto onde ficam os fusíveis, os três conduzem **24 V**:
>
> ```
> FONTE 24 V
>     ├──[F1 10A]──► R1 · 24 V ──► poste P1 ──► 24 V DIRETO ──► BTS/Peltier
>     ├──[F2  2A]──► R2 · 24 V ──► poste P2 ──► [LM2596] ──► 5,10 V
>     └──[F3  2A]──► R3 · 24 V ──► poste P3 ──► [LM2596] ──► 12,0 V
>          ▲                                       ▲
>     tudo 24 V aqui                  é AQUI que a tensão muda
> ```
>
> **O que difere entre os ramais é a CORRENTE, não a tensão.** O R1 leva 6,0 A (as duas Peltier); R2 e R3 levam menos de 1 A cada. Por isso F1 é de 10 A e os outros de 2 A.
>
> ### 📍 E eles ficam na SUBESTAÇÃO, não no painel
>
> Na saída da fonte de 24 V, dentro da caixa fechada. O motivo é a função: eles protegem **a linha que atravessa a maquete pelos postes**. Se ficassem no painel, justamente o trecho mais longo e mais exposto do projeto ficaria sem proteção.
>
> É o mesmo princípio da chave fusível real: ela fica **no poste, na origem do ramal** — não na casa do consumidor.

> ### 🔩 Lâmina ou vidro? Use LÂMINA
>
> | Tipo | Corrente do suporte | Serve para o F1 (10 A)? |
> |---|---|---|
> | **Lâmina (automotivo)** ✅ | ~30 A por posição | **Sim, com folga** |
> | Vidro 5 × 20 mm | 5 A ou 6,3 A | ❌ **Não** |
> | Vidro/cerâmico 6 × 30 mm | 15–20 A | Sim, mas ver abaixo |
>
> **Três motivos para a lâmina, além da corrente:**
> 1. **É projetada para corrente contínua de 12 a 32 V** — exatamente o nosso barramento de 24 Vdc. Fusível de vidro é pensado para 250 V **AC**; funciona aqui, mas fora da aplicação natural.
> 2. **2 A e 10 A são valores padrão de linha** — acha em qualquer auto peças.
> 3. **O corpo é translúcido**: dá para ver o elemento queimado sem instrumento. Num projeto didático isso vale ponto na apresentação.

> 🗑️ **Os 6 diodos Zener e os fusíveis F4/F5 saíram do projeto.** O circuito *crowbar* existia para proteger contra a falha do conversor em curto; o LM2596 já traz **limite de corrente e desligamento térmico no próprio CI**, e o barramento que mais preocupava (os 12 V de potência do T1) deixou de existir. Resultado: **8 componentes a menos**, nenhum deles em fio volante. O raciocínio completo está em [Doc 02 §2.6](02_arquitetura_de_energia.md), inclusive o risco residual que se está aceitando.
>
> ✅ **O que NÃO saiu:** os fusíveis de **entrada** dos ramais (F1, F2, F3). Eles nunca foram parte do crowbar — são a seletividade da rede de distribuição, o equivalente à chave fusível do poste, e continuam obrigatórios.

---

# 🏭 CAMADA 1 — MAQUETE

## M.1 — Base e estrutura

| Item | Qtd | Especificação | Link |
|---|---:|---|---|
| MDF 12 mm | 1 chapa | **1500 × 500 mm** — tampo da base | |
| MDF 15 mm | — | Moldura perimetral 40 mm de altura (4 tiras) | |
| MDF 15 mm | 3 tiras | **Travessas de reforço** 15 × 40 mm, com entalhe de 20 × 25 mm no centro | |
| Pés de borracha antiderrapante | 8 | Autoadesivos, Ø 25 mm — a base tem 1,5 m e pesa ~18 kg | |
| **Conector circular GX16 8 pinos** | 1 par | **Opcional** — só na versão modular (união elétrica entre os 2 módulos) | |
| Pinos-guia Ø 6 mm + buchas | 2 | **Opcional** — alinhamento dos módulos | |
| Alças de transporte | 2 | Alça embutida de baú/case, laterais | |
| Parafusos M5×20, M4×16, M3×12 | kits | Fixações gerais | |
| Insertos rosqueados M4/M5 p/ MDF | 20 | Evita espanar a rosca no MDF | |

## M.2 — Subestação (caixa)

| Item | Qtd | Especificação | Link |
|---|---:|---|---|
| MDF 9 mm ou acrílico opaco 4 mm | — | **CASA DE COMANDO 250 × 150 × 90 mm** (L×P×A), face de operação voltada para a rua. Abriga **apenas** fonte, disjuntor e chave — os fusíveis de 24 V ficam no pátio aberto | |
| **Fio verde-amarelo 0,75 mm²** | 1 m | ⚡ **Aterramento das estruturas metálicas do pátio** à barra de terra (equipotencialização). Torre real é aterrada — vale ponto na defesa | |
| *Opcional:* **arame / barra de latão 1,5–2 mm** | 2 m | Estruturas treliçadas do pátio. ⚠️ **Latão aceita solda de estanho; alumínio não** — se quiser treliça soldada, é latão | |
| Dobradiça pequena + fecho | 1 jogo | Tampa de manutenção | |
| Tela metálica / alambrado miniatura | 1 | Cerca do pátio (tela de aço, malha 3 mm). ⚠️ **Funcional, não decorativa**: com o pátio aberto, é ela que delimita a área e impede aproximação — mesma função da cerca de uma subestação real | |
| Pedrisco / brita fina (aquário) | 500 g | Piso do pátio da subestação — como nas subestações reais | |
| Placa "PERIGO ALTA TENSÃO" | 2 | Impressa em papel adesivo, ~15 × 10 mm | |

## M.3 — Postes e linha de distribuição

| Item | Qtd | Especificação | Link |
|---|---:|---|---|
| **Tubo de alumínio Ø 8 mm** | 1,5 m | Cortar em 3 postes de **350 mm** (300 mm visíveis + 50 mm de encaixe) | |
| Barra chata de alumínio 12 × 2 mm | 40 cm | **Cruzetas** — 3 peças de 90 mm + 3 de 60 mm | |
| **Fio rígido ENCAPADO 1,00 mm² VERMELHO** ⬆ | 2 m | Ramal **R1** (potência, **6,0 A**). ⚠️ Subiu de 0,75 para 1,00 mm² por causa da corrente das 2 Peltier. **Nunca condutor nu** — em CC qualquer ponte metálica é curto franco | |
| **Fio rígido ENCAPADO 0,50 mm² MARROM** | 2 m | Ramal **R2** (comando) | |
| **Fio rígido ENCAPADO 0,50 mm² CINZA** | 2 m | Ramal **R3** (auxiliares) | |
| **Fio rígido ENCAPADO 1,50 mm² AZUL CLARO** ⬆ | 2 m | **Retorno comum 0 V** — o "neutro" da linha, 40 mm abaixo da cruzeta. Subiu de 1,00 para 1,50 mm²: conduz a **soma** dos 3 ramais (6,9 A) | |
| Contas/miçangas marrom ou branca Ø 6 mm | 20 | **Isoladores** de pino da cruzeta | |
| **Tubo de PVC Ø 50 mm** | 24 cm | Corpos dos 3 postes — 8 cm cada: **T2** (P2), **T3** (P3) e a **caixa de derivação** (P1). Agora os três têm o mesmo diâmetro, porque o P1 deixou de ter conversor | |
| Tampa/cap PVC Ø 50 mm | 6 | Tampas dos 3 corpos | |
| Cinta de alumínio 10 mm | 1 m | Fixação dos transformadores e da caixa de derivação nos postes | |
| **Bornes de emenda pequenos (2 ou 3 vias)** | 2 | Dentro da **caixa de derivação do P1** — ali os 24 V só se distribuem, não se transformam | |
| Flange/base de fixação dos postes | 3 | Podem ser feitas com sobra de MDF + insertos M4 | |
| Etiquetas adesivas impressas | 3 | Identificação dos corpos: **"P1 — DERIVAÇÃO 24 V"**, **"T2 — 24/5 V"**, **"T3 — 24/12 V"** | |

> 🔎 **O poste P1 não tem transformador — e isso é proposital.** Como as Peltier e o PTC já operam em 24 V, não há tensão a transformar naquele ramal: o corpo do P1 é apenas uma **caixa de derivação** com bornes e o medidor de tensão/corrente. Vale a etiqueta e vale explicar na defesa, porque é a analogia mais bonita que a maquete ganhou: **consumidor industrial de grande porte é atendido na tensão primária da rede e monta a própria subestação**, enquanto os consumidores comuns recebem o transformador de poste. P1 é o grande consumidor; P2 e P3 são os transformadores de distribuição.

## M.4 — Rua e entrada da empresa (zona externa)

| Item | Qtd | Especificação | Link |
|---|---:|---|---|
| Tinta spray **cinza-asfalto escuro fosco** | 1 | Pista da rua | |
| **Tubo de alumínio Ø 5 mm** | 60 cm | 3 postes de **iluminação pública** de 180 mm — ⚠️ diferentes dos postes de distribuição | |
| Arame 1,5 mm | 1 m | Braço curvo das luminárias e estrutura do portão | |
| **LED 3 mm branco quente** | 4 | 3 luminárias da rua + 1 na guarita. **Alimentados em 5 V** (BD-5V), com 220 Ω em série, sempre acesos. Vf ≈ 3,1 V | |
| **Resistor 220 Ω 1/4 W** | — | Limitador dos LEDs da rua — **já contabilizado na lista L.4**, não compre de novo. ⚠️ Valor dimensionado para **5 V**: `(5 − 3,1)/220 = 8,6 mA`. Monte cada um **dentro da base do poste**, com termorretrátil | |
| **Carro de passeio miniatura 1:50** | 2 | ~88 mm. Se só achar 1:64 (68 mm), pode usar — mas não misture escalas | |
| **Caminhão / van 1:50** | 1 | ~150 mm, entrando pelo portão | |
| Tira de MDF 3 mm | 1,5 m | **Meio-fio (guia)**, 4 mm de altura, pintado de branco | |
| Fita branca 2 mm ou caneta posca branca | 1 | Faixa central tracejada, faixa de bordo e faixa de pedestres | |
| MDF 4 mm | — | **Muro da empresa**: 50 mm de altura × 290 mm, em X = 640 | |
| MDF 4 mm | — | **Guarita** 45 × 45 × 55 mm, com janela recortada | |
| Tinta azul industrial | 1 | Portão corrediço | |
| Árvores de maquete | 3 | Escala 1:50, na calçada da frente | |
| Placas de trânsito miniatura | 2 | "PARE" e "VELOCIDADE MÁXIMA 10 km/h" | |
| Lixeira urbana + abrigo de ônibus | 1 cada | Opcional — enriquece a cena | |

> 🎬 **A rua é o que explica de onde vem a energia.** Sem ela, a subestação e os postes ficam "flutuando no nada". E o **muro com portão** marca o limite: à esquerda, via pública e rede da concessionária; à direita, a instalação do consumidor — que é o que o painel comanda.

## M.5 — Chão de fábrica (cenografia)

| Item | Qtd | Especificação | Link |
|---|---:|---|---|
| Tinta spray cinza claro fosco | 2 | Piso industrial (epóxi) | |
| Tinta spray preto fosco | 1 | Estruturas e acabamento | |
| Verniz fosco spray | 1 | Proteção final do piso pintado | |
| **Fita adesiva amarela 10 mm** | 1 rolo | Demarcação de corredores e áreas | |
| **Fita zebrada amarelo/preto 20 mm** | 1 rolo | Faixa de segurança em frente ao painel (**exigência NR-10** — zona de trabalho) | |
| Fita adesiva verde 10 mm | 1 rolo | Rota de fuga | |
| Figuras de maquete escala **1:50** | 10 | (4 na fábrica, 3 na rua, 3 reservas) Pessoas com EPI (loja de maquetaria/arquitetura) | |
| Miniaturas: empilhadeira, pallets, tambores | — | Ambientação do chão de fábrica | |
| Extintor miniatura + placa | 2 | Sinalização de segurança | |
| Placas de sinalização impressas | 1 folha | "RISCO ELÉTRICO", "USO OBRIGATÓRIO DE EPI", "SAÍDA" — papel adesivo | |
| **Eletrocalha / perfilado aéreo** | 60 cm | Canaleta de acrílico ou perfil U de alumínio — leva os cabos do painel à câmara **por cima**, como na indústria | |
| Suportes/mãos-francesas da eletrocalha | 4 | Cantoneira de alumínio | |
| EVA ou MDF 6 mm | — | Bases de máquinas fictícias e plataformas | |

---

# ❄️ CAMADA 1 — CÂMARA TÉRMICA

## C.1 — Acrílico (levar a lista para a gráfica — corte a laser)

| Peça | Espessura | Dimensão | Qtd | Observação |
|---|---|---|---:|---|
| Parede lateral ESQ / DIR | 5 mm transp. | 110 × 250 mm | 2 | Recorte 90 × 210 mm (duto), bordas 45° |
| Parede traseira | 5 mm transp. | 210 × 250 mm | 1 | Bordas 45° |
| Tampa topo | 5 mm transp. | 210 × 110 mm | 1 | Recorte da Peltier + prensa-cabo |
| Base externa | 5 mm transp. | 210 × 110 mm | 1 | Furo do dreno |
| Base interna (apoio do PTC) | 5 mm transp. | 190 × 90 mm | 1 | Bordas 90° |
| **Porta — vidro externo** | 5 mm transp. | 210 × 250 mm | 1 | **Porta dupla (ver §C.3)** |
| **Porta — vidro interno** | 5 mm transp. | 190 × 230 mm | 1 | **Porta dupla** |
| **Porta — moldura espaçadora** | 10 mm transp. | tiras 10 mm | 4 | Perímetro da porta, cria a câmara de ar |
| Dutos: frente | 3 mm transp. | 30 × 210 mm | 2 | Bordas 45° |
| Dutos: laterais | 3 mm transp. | 30 × 210 mm | 4 | Borda traseira 90° |
| Dutos: tampas topo/base | 3 mm transp. | 30 × 30 mm | 4 | Borda traseira 90° |
| Cobertura externa | 3 mm **branco** | conforme §C.2 | 5 | **Branco** = visual de painel PIR de câmara frigorífica real |
| Cubinhos de apoio | sobra 5 mm | 20 × 20 × 30 mm | 4 | Sustentam a base interna (plenum de 30 mm) |

> 🎨 **Mudança de acabamento:** a cobertura externa passou de **preto** para **branco**. Câmaras frigoríficas reais são feitas de painel sanduíche PIR com face de aço branco — o visual fica imediatamente reconhecível como "câmara fria" dentro da fábrica.

## C.2 — Isolamento térmico

| Item | Qtd | Especificação | Link |
|---|---:|---|---|
| **XPS 30 mm** (poliestireno extrudado) | 1 m² | Isolante principal — k ≈ 0,033 W/m·K. **30 mm, não 20 mm** (ver [Doc 12](../camada_1_maquete/12_camara_termica.md)) | |
| **Fita adesiva de alumínio 50 mm** | 1 rolo | ⚠️ **Barreira de vapor** — obrigatória em todas as juntas do XPS, pelo lado externo (quente) | |
| Manta elastomérica autoadesiva 6 mm | 1 m² | Tipo Armaflex — cantos, arestas e ao redor das passagens de cabo | |
| Espuma expansiva PU (mini) | 1 | Selagem de passagens de cabo e dreno | |

## C.3 — Vedação, porta e dreno

| Item | Qtd | Especificação | Link |
|---|---:|---|---|
| **Perfil EPDM tubular autoadesivo 9 × 6 mm** | 2 m | Vedação da porta — perfil **tubular** comprime muito melhor que o chato de 5 mm | |
| Dobradiça piano de alumínio | 1 | 250 mm (cortar de uma barra de 75 cm) | |
| **Fecho de pressão (borboleta) inox** | 2 | Comprime a vedação — tipo fecho de baú | |
| Puxador de câmara fria (miniatura) | 1 | Estética — pode ser um puxador de móvel pequeno | |
| Cola S-320 Sinteglas | 250 ml | Colagem de acrílico por capilaridade | |
| Silicone neutro transparente | 1 tubo | Vedação de juntas (⚠️ **neutro**, o acético ataca o acrílico) | |
| Bandeja de alumínio | 1 | ~190 × 90 mm — coleta de condensado | |
| Tubo de silicone Ø 6 mm | 40 cm | Dreno até o recipiente externo | |
| Sílica gel indicadora | 3 sachês | 2 na câmara + **1 dentro da câmara de ar da porta dupla** | |
| Recipiente coletor de condensado | 1 | Frasco pequeno, embutido na maquete | |

---

# ⚡ CAMADA 2 — PAINEL DE COMANDO

| Item | Qtd | Especificação | Link |
|---|---:|---|---|
| Caixa de comando ou MDF | 1 | **400 × 500 × 200 mm** — comprada pronta ou feita em MDF 15 mm | |
| Porta do painel | 1 | MDF 12 mm ou acrílico fumê 5 mm (fica bonito ver os LEDs) | |
| **Trilho DIN 35 mm** | 1,5 m | Aço galvanizado — 3 trilhos de ~360 mm | |
| **Canaleta perfurada 30 × 30 mm** | 2 m | Com tampa — organização profissional dos cabos | |
| **Bloco de distribuição DIN** — 1 entrada 4 mm² + **4 saídas** | 1 | **BD-POT** — 24 V de potência comutados pelo KA2 → BTS #1, BTS #2, medição do D25 e 1 reserva. ⚠️ Cai com a emergência | |
| **Bloco de distribuição DIN** — 1 entrada 2,5 mm² + **4 saídas** | 1 | **BD-AUX** — 12 V auxiliar (do T3): cooler dos BTS + 2 coolers das Peltier + 1 reserva | |
| **Bloco de distribuição DIN** — 1 entrada 2,5 mm² + **6 saídas** ⬆ | 1 | **BD-24V** — 24 V permanentes. ⚠️ **Subiu de 4 para 6:** são **5 cargas** (DNLCB30/ESP32, cadeia de comando, positivo comum dos sinaleiros, COM do ULN2803 na PI-1, e a alimentação das 4 posições de ensaio) + 1 reserva. **Não confundir com o BD-POT** — este não cai com a emergência | |
| **Bloco de distribuição DIN** — 1 entrada 2,5 mm² + **8 saídas** ⬆ | 1 | **BD-5V** — ⚠️ **Subiu de 6 para 8:** são **7 cargas** (Arduino, tela ES3C28P, RTC, lógica do BTS #1, lógica do BTS #2, placa PI-1 e os LEDs da maquete) + 1 reserva | |
| ⭐ **Barra de distribuição / régua com pente — mín. 20 pontos** ⬆⬆ | 1 | **BD-0V** — o **star ground** do projeto. ⚠️ **Um bloco de 8 saídas NÃO serve:** aqui convergem **4 entradas + ~16 retornos**. Use uma **barra de neutro/terra de 16–20 furos** em suporte DIN, ou **dois blocos de 1×8 interligados** por ponte de 4 mm². Entrada de **10 mm²** | |

> ### ⚠️ Conferência de saídas — feita cabo a cabo no [Doc 30](../camada_3_eletrica/30_forca_e_distribuicao.md)
>
> | Bloco | Cargas reais | Comprar | Antes |
> |---|---:|---:|---:|
> | BD-POT | 3 | **4** | 4 ✅ |
> | BD-AUX | 3 | **4** | 4 ✅ |
> | BD-24V | **5** | **6** | 4 ❌ faltava |
> | BD-5V | **7** | **8** | 6 ❌ faltava |
> | BD-0V | **~20** | **20** | 8 ❌❌ faltava muito |
>
> **Por que o BD-0V é tão maior que os outros:** ele é o único bloco por onde passa **tudo**. Cada carga do projeto tem um positivo (que sai de um bloco diferente conforme a tensão) mas **todas dividem o mesmo retorno**. Somando as 4 entradas e os retornos de BTS, relés, Arduino, ESP32, tela ES3C28P, RTC, PI-1, três coolers, LEDs e posições de ensaio, passa de 20 pontos.
>
> ✅ **A troca da tela já está contabilizada.** A ES3C28P substituiu a Nextion **e** o módulo de cartão SD, mas ocupa a mesma saída de 5 V que a Nextion ocupava — e o RTC continua existindo. **O BD-5V segue com 7 cargas e o BD-24V com 5.** O DNLCB30 e o ESP32 de IoT permanecem.
| Bornes DIN parafuso 2,5 mm² | 6 | Passagem e reservas | |
| Separadores/tampas de borne | 4 | Acabamento das réguas | |
| **Alternativa mais barata:** bornes comuns + **ponte de interligação (pente)** | — | Funciona igual aos blocos, custa menos, menos prático para alterar depois | |
| Identificadores de borne e de cabo | 1 kit | Anilhas numeradas — **exigido em painel industrial** | |
| Trava-fim de trilho DIN | 8 | Impede os componentes de deslizarem | |
| **Botão de Emergência cogumelo 22 mm** | 1 | Com trava (girar p/ destravar) — **2 blocos NF** (1 para o comando 24 V, 1 para a leitura do Arduino) | |
| **Botão START 22 mm** | 1 | Verde, momentâneo — **1 bloco NA** (só informa o Arduino) | |
| **Botão STOP 22 mm** | 1 | Vermelho, momentâneo — **1 NF (corta o KA2 em 24 V) + 1 NA (avisa o Arduino)** | |
| **Botão REARME 22 mm** | 1 | **AZUL**, momentâneo — **1 bloco NA**. Refaz o selo do KA1 após a emergência. Buscar `botão pulsador azul 22mm` | |
| **Blocos de contato 22 mm avulsos** | 4 | **3 NF + 1 NA**: emergência (2 NF), STOP (1 NF + 1 NA). Ver [Doc 31 §31.3](../camada_3_eletrica/31_comando_e_protecoes.md) | |
| **Chave seccionadora 24 V no painel** | 1 | Rotativa 2 posições 22 mm — chave geral local da máquina | |
| **Sinaleiros LED 22 mm 24 V** | 4 | Verde (RUN), Azul (COOL), Amarelo (HEAT), Vermelho (FAULT). ⚠️ **24 V confirmado** — acionados pelo **ULN2803 da placa PI-1**, alimentados pelo **BD-24V permanente** (o vermelho de FALHA precisa continuar aceso com a emergência acionada). ~20 mA cada, resistor interno já incluso | |
| **Prensa-cabo PG9** | 3 | Entrada **24 V de potência** (vindo do P1) · saída de potência para a câmara · saída de sinais | |
| **Prensa-cabo PG7** | 2 | Entrada 5 V (do T2) e entrada 12 V auxiliar + 24 V (do T3) | |
| Bolsa porta-documentos p/ porta | 1 | Guarda o diagrama elétrico — **padrão em painel industrial** | |

---

# 🧠 CAMADA 2/3 — ELETRÔNICA E COMANDO

## L.1 — Controle e interface

| Item | Qtd | Especificação | Link |
|---|---:|---|---|
| Arduino Mega 2560 R3 | **2** | ATmega2560, 54 GPIO, 4 UARTs. **1 uso + 1 reserva** — ele roda o PID e as proteções; se morrer, o projeto para. ⚙️ **Versão: CH340 + USB Type-C.** O chip USB não é o processador (o ATmega2560 é o mesmo nas três versões) — muda só a ponte USB↔serial, que só serve para gravar e depurar. ⚠️ **CH340 pode exigir driver no Windows** (site `wch.cn`): se for gravar em PC de escola sem permissão de instalar, prefira a versão com **ATmega16U2** (anunciada como "sem CH340"), que é nativa. ⚠️ **Type-C: use cabo A-para-C** — algumas placas baratas omitem os resistores de 5,1 kΩ nos pinos CC e não são reconhecidas por cabo C-para-C | |
| Shield de expansão Mega (bornes parafuso) | 1 | Sensor Shield V2.0 | |
| Suporte DIN para Arduino Mega | 1 | Ou SPCI4/adaptador | |
| ~~Tela Nextion Basic 3.2"~~ | ~~1~~ | ~~NX4024T032~~ — **substituída pelo módulo ESP32-S3 com tela** (ver abaixo) | |
| ⭐ **ES3C28P** — ESP32-**S3** 2,8" toque capacitivo, microSD, microfone (LCDWIKI) | 1 | **A IHM do projeto.** Substitui a tela Nextion **e** o módulo de cartão SD. **8 MB de PSRAM** → a Xiaozhi roda. ILI9341V 240×320, toque capacitivo FT6336G, 5 V / 140 mA, **−30 a 80 °C**. Vem com alto-falante. ⚠️ Comprar a versão **ES3C28P** (com toque) — a `ES3N28P` é sem toque | |

> ### ✅ O módulo de tela — modelo confirmado e pinagem levantada
>
> A placa escolhida é a **ES3C28P**, da LCDWIKI. Tem wiki oficial e um pacote de suporte no GitHub, o que para um projeto escolar vale muito.
>
> ### ⭐ Ela tem PSRAM — e o anúncio não diz
>
> A descrição do vendedor lista só `384 KB ROM + 512 KB SRAM + 16 KB RTC SRAM + 16 MB Flash`. **Faltou a informação mais importante:** a wiki oficial e o pacote de suporte no GitHub confirmam **8 MB de PSRAM OPI**.
>
> É isso que separa esta placa da ESP32-2432S028R (*Cheap Yellow Display*), que foi a primeira candidata: **sem PSRAM a Xiaozhi não roda de jeito nenhum**; com 8 MB, roda. O próprio anúncio já promete *"suporte ao chat de voz Xiaozhi AI"*, o que só faz sentido por causa dela.
>
> | Ponto | Resultado |
> |---|---|
> | Processador | ✅ **ESP32-S3** dual-core LX7 |
> | **PSRAM** | ✅ **8 MB OPI** — confirmada na wiki e no BSP |
> | Flash | ✅ 16 MB |
> | Slot microSD | ✅ em interface **SDMMC dedicada** (CLK IO38, CMD IO40, DATA IO39/41/48/47) |
> | Alimentação | ✅ **5 V** · 140 mA só com a tela |
> | Toque | ✅ **capacitivo** (FT6336G, por I²C) — dedo, sem caneta |
> | Microfone e alto-falante | ✅ mic embutido, alto-falante **vem na caixa** |
> | Temperatura de operação | ✅ **−30 a 80 °C** |
> | Documentação | ✅ wiki oficial + BSP no GitHub |
>
> #### 🔌 A ligação com o Arduino — os pinos que sobram
>
> A CYD usa quase tudo no display. Sobram só três, em dois conectores JST de 1,25 mm:
>
> ### 🔌 Os conectores — e por que some o improviso do cabo USB cortado
>
> | Conector | Pinos | Uso no projeto |
> |---|---|---|
> | ⭐ **UART** | 5 V ⚠️ · **GND · TXD (IO44) · RXD (IO43)** | **serial** — usar só 3 fios, ver abaixo |
> | I²C | 3,3 V · GND · SDA (IO16) · SCL (IO15) | livre — compartilhado com o toque |
> | Expansão | IO2 · IO3 · IO14 · IO21 | 4 GPIOs livres de verdade |
> | Speaker | — | alto-falante que vem na caixa |
> | BAT | — | ⚠️ **não usar** — ver abaixo |
>
> ### ⚠️ O pino de 5 V do conector UART é provavelmente SAÍDA — não ligue nele
>
> A wiki oficial lista **apenas duas** entradas de alimentação: o **Type-C** e o **conector de bateria**. O conector UART é descrito só como *"depuração, download e comunicação — requer um módulo USB-serial externo"*.
>
> Ou seja, aquele pino de 5 V provavelmente existe para **alimentar o adaptador USB-serial** que se plugaria ali — é saída, não entrada.
>
> 🔥 **Ligá-lo no BD-5V seria ruim:** os 5,10 V do painel encontrariam os 5 V da placa, um empurrando o outro, com corrente circulando por onde não deve.
>
> **Regra segura: alimente pelo Type-C e use só 3 fios do cabo UART** — GND, TXD e RXD. Isole a ponta do quarto fio.
>
> #### 🔎 Como tirar a dúvida com multímetro, sem energizar
>
> Com a placa **desligada e sem nada conectado**, meça continuidade entre o pino de 5 V do conector UART e o **VBUS do Type-C** (ou o positivo do capacitor grande perto do USB):
>
> | Leitura | Significa |
> |---|---|
> | ~0 Ω nos dois sentidos | é a mesma rede → **pode alimentar por ali** |
> | queda de diodo só num sentido | protegido / unidirecional → **só saída** |
> | aberto | redes independentes → não alimenta |
>
> ### ⚠️ E o TXD/RXD são 3,3 V — o conversor continua obrigatório
>
> Não é suposição. São o `IO43` e o `IO44` do ESP32-S3, e três fontes batem: o **BSP no GitHub** mapeia `TX = GPIO44` e `RX = GPIO43`; a ficha declara **"tensão de operação 3,0~3,6 V"** para o módulo; e a wiki fala em *"módulo USB-serial externo"*, que para ESP32 é de 3,3 V. **Nenhuma documentação menciona conversor de nível a bordo.**
>
> ### ⚠️ O UART é o UART0 — o mesmo do log de boot
>
> Os pinos IO43/IO44 são o **UART0** do ESP32-S3, por onde o bootloader imprime o log a cada reinício. **O Arduino vai receber ~500 bytes de texto toda vez que a tela reiniciar.** Não faz mal, mas o parser do Arduino precisa **ignorar linhas que não sigam o protocolo** — o que é boa prática de qualquer jeito.
>
> Duas saídas se incomodar:
> 1. **No ESP-IDF**, apontar o console para o USB-Serial-JTAG em vez do UART0. O log some do conector e o UART0 fica limpo.
> 2. **Usar o conector de expansão** (IO2/IO3) para uma UART1 dedicada, deixando o conector UART só para os 5 V. Custa um segundo cabo.
>
> ### 🔋 Não instale bateria
>
> A placa aceita Li-Po e traz circuito de carga. **Não use.** Dentro de um painel elétrico fechado, uma bateria de lítio é risco de incêndio sem contrapartida — o painel já tem 24 V permanente pelo BD-24V, que é o que mantém a supervisão viva. Deixe o conector BAT vazio.
>
> ### 🔌 O conversor de nível — ligação pino a pino
>
> O modelo de **6 pinos por lado** é o de **4 canais**: alimentação + terra + 4 vias. Usamos 2.
>
> | Tela | Conversor | Arduino Mega |
> |---|---|---|
> | 3,3 V (conector **I²C**) | `LV` | — |
> | GND | `GND` (dos **dois** lados) | BD-0V |
> | **RXD · IO43** (conector UART) | `LV1` ↔ `HV1` | **pino 16** (TX2) |
> | **TXD · IO44** (conector UART) | `LV2` ↔ `HV2` | **pino 17** (RX2) |
> | — (o `HV` vem do Arduino) | `HV` | **5 V** do BD-5V |
> | *alimentação da tela* | — | **Type-C**, cabo à parte |
>
> Os canais 3 e 4 ficam livres para uma expansão futura.
>
> ### 🎁 O que ela habilita que o Nextion não habilitava
>
> | Recurso | Uso no projeto |
> |---|---|
> | **Alto-falante** (vem na caixa) | ⭐ **alarme sonoro** quando um DUT morre — hoje o projeto só avisa pelo sinaleiro FALHA, que ninguém vê de costas |
> | **Microfone + 8 MB PSRAM** | a **Xiaozhi** no futuro, como você planejou |
> | **LED RGB** (IO42) | um segundo indicador de estado, sem gastar sinaleiro |
> | **4 GPIOs de expansão** | espaço para crescer, coisa que a CYD não tinha |
>
> ### 🤔 O único ponto em que o toque capacitivo perde
>
> Toque **capacitivo não funciona com luva grossa**; o resistivo funciona. Numa fábrica de verdade isso pesa a favor do resistivo — e é um bom detalhe para citar na defesa, mostrando que a escolha foi consciente. Para esta bancada, o capacitivo ganha por ser muito mais agradável de usar e não exigir caneta.
>
> ### ⭐ O módulo de tela — exigências que motivaram a escolha
>
> Estas foram as cinco exigências levantadas para escolher a placa. Ficam registradas porque explicam **por que a ES3C28P foi escolhida** e servem de critério caso seja preciso trocar de modelo:
>
> | # | Exigência | Por quê |
> |---|---|---|
> | 1 | **PSRAM** (8 MB de preferência) | Sem PSRAM não roda LVGL com folga, e **a IA da Xiaozhi não roda de jeito nenhum** |
> | 2 | **Slot microSD ligado ao ESP32** | É o que substitui o módulo de cartão. Confirmar que o SD é do ESP32 e não só do display |
> | 3 | **2 GPIOs livres** para UART | É por eles que o Arduino conversa com a tela. Nessas placas quase tudo vai para o display |
> | 4 | **Entrada de 5 V** que não seja só o USB | O painel alimenta pelo BD-5V; depender de conector USB dentro de um painel é frágil |
> | 5 | **I²S livre + mic e alto-falante** | Só se a Xiaozhi entrar no plano. Decidir agora evita furar a porta duas vezes |
>
> ⚠️ **Não é o slot SD do Nextion.** No Nextion o cartão só grava o firmware da tela; aqui ele é **armazenamento de verdade**, no barramento SPI do próprio ESP32. É essa diferença que permite o módulo acumular as duas funções.
>
> ### 🔥 O item que é fácil esquecer e queima a placa
>
> | Item | Qtd | Por quê |
> |---|---|---|
> | **Conversor de nível lógico bidirecional 4 canais** (3,3 V ↔ 5 V) | 1 | ⚠️ **Obrigatório.** O GPIO do ESP32 aceita no máximo **3,6 V** e o Arduino Mega transmite em **5 V**. Buscar `conversor nivel logico bidirecional 4 canais` |
>
> ### ⚠️ "Mas eu alimento a placa com 5 V — ela não fala em 5 V?"
>
> **Não.** Os 5 V não chegam ao ESP32: eles entram num **regulador na própria placa**, que os converte em 3,3 V. O chip e os pinos dele trabalham em 3,3 V.
>
> ```
>    5 V  ──►  [regulador da placa]  ──►  3,3 V  ──►  ESP32
>                                                      ▲
>                                           os GPIOs vivem AQUI
> ```
>
> O projeto já tem esse mesmo arranjo: a **DNLCB30 recebe 24 V** e o ESP32 dentro dela segue em 3,3 V. **Alimentação e nível lógico são grandezas diferentes** — uma é a comida, a outra é o idioma.
>
> **Só um sentido precisa de conversão:**
>
> | Sentido | Precisa? | Por quê |
> |---|---|---|
> | Arduino TX (5 V) → tela RXD | ❌ **precisa** | 5 V num pino de 3,6 V no máximo |
> | Tela TXD (3,3 V) → Arduino RX | ✅ vai direto | o Mega lê acima de 3,0 V como nível alto |
>
> ### 🤔 "E a DNLCB30, que já tem conversor? Não dá para aproveitar?"
>
> **Não, e o motivo é a topologia dela.** O conversor da DNLCB30 fica *entre o soquete do ESP32 e o borne*:
>
> ```
>    borne parafuso ──[conversor]── pino do soquete ── ESP32
>         5 V                            3,3 V
> ```
>
> O lado de 5 V é o borne, acessível. O lado de **3,3 V termina no pino do soquete**, onde o ESP32 está encaixado — não existe borne para ele. Para o sinal chegar na tela, o ESP32 teria que **repassá-lo por software**, que é a arquitetura em cadeia já descartada (a tela cega se o ESP32 reiniciar).
>
> Grampear um fio no pino do soquete resolveria no papel, mas traz três problemas — e o terceiro é sério:
>
> 1. **O GPIO do ESP32 fica exposto** ao sinal. Se o firmware um dia configurar aquele pino como saída, dois circuitos disputam a mesma linha.
> 2. **É fio soldado em header dentro de painel** — falha por vibração, e meses depois.
> 3. ⚠️ **Retroalimentação.** No módulo dedicado, o lado `LV` é alimentado pelos **3,3 V da própria tela**: se a tela desliga, o lado baixo morre junto e nada é injetado nela. Grampeando a DNLCB30, o sinal fica vivo sempre que o **ESP32 de IoT** estiver ligado — injetando 3,3 V numa placa sem alimentação, pelos diodos de proteção dela. É o mesmo mecanismo de dano, por outro caminho.
>
> **Os R$ 5 do módulo compram o direito de não pensar mais nisso.**

> 🎁 **O módulo resolve dois problemas com um.** Os conversores baseados em BSS138 já trazem **pull-up de 10 kΩ nos dois lados de cada canal** — ou seja, ele também resolve o GPIO35 sem pull-up. Com resistores avulsos você resolveria só a conversão, e ainda ficaria com componente solto no meio do fio, contra a regra que motivou a placa PI-1.
>
> **Ligação:**
>
> | Conversor | Liga em |
> |---|---|
> | **LV** | ES3C28P · 3,3 V (conector **I²C**) |
> | **HV** | Arduino · 5 V |
> | **GND** (os dois lados) | BD-0V |
> | **LV1 ↔ HV1** | **RXD (IO43)** ↔ Mega **pino 16** (TX2) |
> | **LV2 ↔ HV2** | **TXD (IO44)** ↔ Mega **pino 17** (RX2) |

> **O perigo é que ligar direto *parece* funcionar.** O ESP32 tem diodos internos de proteção que grampeiam a tensão, então a comunicação estabelece e tudo aparenta estar certo. Mas passa corrente por esses diodos continuamente, e o pino degrada em semanas. Quando falhar, vai parecer defeito de fábrica do módulo.
>
> Quem faz essa adaptação para o **outro** ESP32 é a própria **DNLCB30** (está na serigrafia dela: *3.3V to 5V level*). O módulo de tela não tem — por isso o conversor entra na lista.
>
> ### 🔌 Alimentar o módulo de tela pelo cabo Type-C cortado
>
> É a saída prática, já que essas placas raramente têm borne. Três cuidados:
>
> 1. **Cabo comum serve.** A ficha da CYD declara **115 mA**, não os ~500 mA que eu havia estimado. Mesmo 1 m de cabo barato (28 AWG) derruba só ~80 mV, e nos picos de transmissão Wi-Fi (~300 mA) não passa de 210 mV. Chega folgado acima de 4,8 V. Só evite emendas e cabos de mais de 2 m.
> 2. ⚠️ **Nunca plugar o USB do PC com o painel energizado.** As duas entradas de alimentação da placa costumam ser paralelas por dentro: o painel empurra 5,10 V contra os 5,00 V do PC, com risco de retroalimentar a porta USB. **Desligue o BD-5V antes de gravar firmware.**
> 3. **Procure primeiro um pino de 5 V.** Os conectores de 4 pinos 1,25 mm (`IO1`/`IO2 estendido`) normalmente trazem 5 V e GND — bem mais firme que conector USB, que não foi feito para vibração.
>
> Os **5,10 V do BD-5V** estão dentro da faixa USB (4,75–5,25 V), sem problema.

> 🔌 **Vai precisar de um divisor resistivo.** O Arduino Mega transmite em **5 V** e o ESP32-S3 só aceita **3,3 V** no pino de entrada. Quem fazia essa adaptação para o outro ESP32 era a DNLCB30 — o módulo de tela não tem isso. São 2 resistores (10 kΩ + 20 kΩ) na linha `Mega TX → S3 RX`. O caminho contrário (`S3 TX → Mega RX`) funciona direto, porque o Mega já reconhece 3,3 V como nível alto.
| ESP32-WROOM-32U | 1 | 30 pinos, conector de antena IPEX | |
| **DNLCB30** — base DIN para ESP32 | 1 | Entrada **7–35 V** (alimentada direto do barramento 24 V), conversão 3,3 ↔ 5 V automática. **Não inclui o ESP32** | |
| Pigtail **IPEX (u.FL) → SMA macho**, 20–30 cm | 1 | Liga o ESP32 ao conector de painel | |
| **Conector SMA fêmea de painel (bulkhead)** | 1 | Rosca de painel Ø 6,5 mm, com porca e arruela de pressão. ⚠️ **Nunca** passar o coaxial por prensa-cabo | |
| Antena 2,4 GHz SMA macho 3 dBi articulável | 1 | Rosqueada por fora, na **lateral direita, parte alta** do painel | |
| Módulo Micro SD (SPI) | 1 | 5 V, com regulador e level shifter | |
| Cartão Micro SD | 1 | 8–16 GB, Classe 10 | |
| Módulo RTC DS3231 | 1 | I²C, ±2 ppm | |
| Bateria CR2032 | 1 | Backup do RTC | |

## L.2 — Potência e acionamento

| Item | Qtd | Especificação | Link |
|---|---:|---|---|
| Driver ponte-H **BTS7960** | 2 | 43 A, pino IS de diagnóstico | |
| Suporte SPCI4 trilho DIN | 2 | Fixa PCI 100 × 79 mm | |
| Cooler 40 mm 12 V | 1 | Refrigeração dos BTS | |
| **KA1 e KA2 — Relé 8 pinos 24 Vcc + base DIN** | **3** | ⭐ **UM MODELO SÓ para os dois relés** — 2 em uso + 1 reserva. Relé eletromecânico **8 pinos, bobina 24 Vcc, 2 contatos reversíveis (2 NA + 2 NF) de 10 A cada**, com **base para trilho DIN inclusa**. Buscar `relé 8 pinos 24v 10a base din` · `JQX-13F 24v` · `LY2N 24vdc`. ~R$ 39 o conjunto. **KA1** usa os 2 contatos (selo + saída para o KA2); **KA2** usa 1 contato para os 6,0 A e sobra o outro | |
| *Alternativa premium (só se sobrar orçamento)* | — | **Finder 46.61 24VDC** (1 reversível **16 A**) + base **95.05** para o KA2, ~R$ 80–110. Vale se você quiser folga grande sobre os 6,0 A e datasheet publicado | |
| **Resistor 10 kΩ 1/4 W** | 4 | **Pull-down** em cada `R_EN` dos BTS7960 (2) + reservas. ⚠️ Garante que **pino solto = driver desligado** — ficou ainda mais crítico com os 24 V permanentes na entrada dos BTS | |
| **Resistor 22 kΩ 1/4 W** ⬆ | 2 | **Braço superior** do divisor de realimentação de tensão para o pino D25 | |
| **Resistor 4,7 kΩ 1/4 W** | 2 | **Braço inferior** do mesmo divisor | |

> ### 🛒 Decisão de compra dos relés — por que o genérico e não o Finder
>
> Comparação real de dois anúncios avaliados:
>
> | | Finder 49.52 · R$ 58 | **Genérico 8 pinos · R$ 39** |
> |---|---|---|
> | Contatos | 2 reversíveis · **8 A** | 2 reversíveis · **10 A** |
> | Serve para o **KA1**? | ✅ | ✅ |
> | Serve para o **KA2** (6,0 A)? | ❌ **8 A é abaixo do mínimo** | ⚠️ Sim, no limite aceitável |
> | Base inclusa? | ⚠️ Não informado | ✅ Relé **+ base** |
> | Custo para resolver os 2 relés | R$ 58 + outro modelo para o KA2 | **R$ 78** (2 iguais) |
>
> ✅ **Escolhido: o genérico de 8 pinos.** O Finder é melhor relé, mas 8 A não atende o KA2 — você compraria o Finder e ainda precisaria de um segundo modelo diferente para a potência.
>
> **A ressalva do genérico, e por que ela é aceitável aqui:** sem marca, não há datasheet para conferir a corrente em DC. Mas **desgaste de contato é cumulativo — depende de quantas VEZES ele interrompe corrente**, não de quanto tempo fica ligado. O KA2 só abre com 6 A quando alguém aperta STOP ou a emergência: ao longo da vida do projeto, algumas dezenas de vezes. Um contato de 10 A aguenta isso com folga. O risco seria real num equipamento industrial partindo o dia inteiro — não é o caso.
>
> ⚠️ **Se optar pelo Finder mesmo assim, confira duas coisas:** o anúncio informa *"Tipo de montagem: Circuito impresso"* — se for literal, é relé de **soldar em placa** e não encaixa no trilho. E ele **não menciona a base**, que pode custar mais R$ 20–30.
>
> 📌 **Ignore os campos absurdos dos anúncios** ("Potência 1,2 kW", "Tipo de motor: Bobina Helicoidal"). É preenchimento automático do Mercado Livre, não especificação.
>
> ### ✅ Conferir ao receber
> - Bobina **24 Vcc** (não Vca) — meça a resistência: ~600 a 1500 Ω
> - 8 pinos, e a base encaixando no trilho DIN
> - 2 NA + 2 NF (= 2 reversíveis)
> - Alimente a bobina com 24 V e confira a comutação com o multímetro em continuidade **antes de instalar**

> ### 🇧🇷 A palavra que destrava a busca no Brasil: **relé ACOPLADOR**
>
> Procurar "relé de interface" no Mercado Livre quase não retorna nada. O termo comercial usado aqui é **relé acoplador** (ou *acoplador a relé*).
>
> | Busca que funciona |
> |---|
> | `relé acoplador 24vcc` |
> | `relé acoplador 2 contatos reversíveis 24v` |
> | `relé 8 pinos 24vdc base trilho din` |
> | `relé 24v trilho din` |
>
> ⚠️ **Descoberta importante da pesquisa de mercado:** praticamente **todo relé acoplador vendido no Brasil é de 6 a 8 A**. Isso resolve o **KA1** (que conduz miliampères) mas **não resolve o KA2** (6,0 A de carga = 100 % da capacidade, sem margem nenhuma).
>
> **Para o KA2, o caminho prático é o relé de 8 pinos + base** — o arranjo clássico de painel brasileiro, com 2 contatos de 10 A, barato e disponível em qualquer lugar. E como ele também atende o KA1, dá para padronizar: **2 iguais + 1 reserva**.

> ### 🛒 Como ler um anúncio de relé — o vocabulário que engana
>
> "Reversível" vira outra palavra em inglês, e o anúncio quase nunca usa a que você espera:
>
> | Português | No anúncio | Serve? |
> |---|---|---|
> | 1 contato **NA** só | `SPST-NO` · `1A` · `1 Form A` | ❌ Não serve para o KA1 |
> | **1 reversível** | `SPDT` · **`1CO`** · `1Z` · `1 Form C` | ✅ KA2 |
> | **2 reversíveis** | `DPDT` · **`2CO`** · `2Z` · `2 Form C` | ✅ **KA1** |
>
> 🔑 **"CO" = changeover = reversível.** Buscar `2CO 24VDC relay` já filtra quase tudo que não serve.
>
> ⚠️ **Muitos anúncios escrevem só "24V".** Tem que ser **24VDC** — bobina de 24VAC não funciona no nosso barramento.
>
> ⚠️ **Módulo pronto ou relé avulso?** `interface relay module` / `relay with socket` vem com base DIN, LED e diodo. Só `relay` vem sem a base.
>
> ⚠️ **Confirme "with LED and diode"** (ou *freewheeling diode*). A documentação assume que o módulo já traz o diodo de roda-livre — foi por isso que os 4× 1N4007 saíram do painel. **Se o seu não tiver, o diodo volta**, em antiparalelo com a bobina.
>
> 📌 **Sobre importar:** a recomendação de comprar nacional existe por causa do **datasheet com a corrente em DC**, que anúncio genérico não fornece. Isso não impede importar — impede comprar **sem marca**. Um Omron, Finder ou Hongfa com número de modelo você consulta antes de clicar; um "24V 10A Relay Module" sem fabricante, não.

> ⚠️ **O divisor de realimentação mudou de escala.** Ele antes lia os 12 V do T1 (10 kΩ + 4,7 kΩ → 3,84 V no ADC). Agora precisa ler o **barramento de 24 V**, e com os resistores antigos entregaria **7,67 V no pino D25 — o suficiente para danificar a entrada do Arduino**. Com **22 kΩ + 4,7 kΩ** a leitura fica em `24 × 4,7/26,7 = 4,22 V`, dentro da faixa segura e com margem para o barramento oscilar. 📌 **Sinalizar em [Doc 32](../camada_3_eletrica/32_sinais_e_sensores.md):** o esquema do divisor e a constante de conversão do firmware precisam ser atualizados junto.
| Diodo 1N4007 | 4 | ⚠️ **Sobressalente, não vai no painel.** Os relés de interface KA1/KA2 já trazem o diodo de roda-livre embutido. Guarde no saquinho de reposição — ver [Doc 33 §33.5](../camada_3_eletrica/33_placa_interface_componentes.md) | |

## L.3 — Atuadores térmicos e ventilação

| Item | Qtd | Especificação | Link |
|---|---:|---|---|
| ⭐ **Kit duplo de refrigeração Peltier** (2× TEC1-12706) | 1 | **Adotado — kit já conferido por foto** ([`imagens/peltir.avif`](../imagens/peltir.avif)): 2 conjuntos lado a lado, **cada pastilha com seu par de fios** e **cada ventoinha com cabo próprio**, o que viabiliza as modificações 1 e 2 sem cortar nada. Traz **2 pastilhas + radiador + 2 blocos frios + ventoinhas + montagem térmica pronta**. Anunciado como **12 V / 15 A**, ou seja, **vem ligado em PARALELO** — ⚠️ **religar em SÉRIE** para 24 V / 6,0 A (ver as 3 modificações abaixo). ~200 × 115 × 85 mm. Buscar `kit peltier duplo TEC1-12706 refrigeração` | |
| Pastilha Peltier TEC1-12706 avulsa | 1 | **Reserva.** ⚠️ Trocar uma pastilha do kit exige desmontar a junta térmica — tenha a peça, mas conte com o trabalho | |
| **Aquecedor PTC cerâmico 24 V / 80 W** | 1 | Com aletas e ventilador, **versão de 24 V** (~3,3 A) para ligar direto no barramento. ⚠️ **60 W não existe no mercado brasileiro** — as versões reais são **80 W, 100 W e 150 W**. Use a de **80 W**: fica bem equilibrada contra os ~60 W de capacidade de refrigeração das 2 Peltier, e mantém a corrente em 3,3 A (metade da Peltier). A de 150 W passaria a ser o pior caso do ramal (6,25 A) e desequilibra o controle. Buscar `aquecedor ptc 24v ventilador` | |
| ⚠️ **Ventoinha de reposição do RADIADOR — 3 fios** | 2 | ⭐ **A troca mais importante do kit.** As originais são de **2 fios** e não informam rotação. Têm que ser **as do radiador (lado quente)** — se elas param, a Peltier queima em < 1 min. As dos **blocos frios** podem continuar de 2 fios. Medir o tamanho no kit antes de comprar | |
| Pasta térmica | 1 | Seringa 5 g. **O kit já vem com a junta térmica montada** — a pasta é só para retrabalho, se você abrir para trocar uma pastilha | |
| Fan 60 × 60 mm 12 V | 2 | Internas — lado PTC (1 sopra ↑, 1 sopra ↓) | |
| Fan 40 × 40 mm 12 V | 2 | Internas — lado Peltier (1 sopra ↓, 1 sopra ↑) | |

> ### ⭐ Kit duplo de Peltier — as 3 modificações obrigatórias
>
> O kit pronto foi adotado porque entrega a **montagem mecânica e térmica já feita** — radiador, blocos frios, fixação e a junta com pasta, que é justamente a parte mais fácil de errar. Mas ele vem configurado para 12 V e precisa de três mudanças:
>
> **1. Religar as pastilhas em SÉRIE**
>
> O anúncio de **12 V / 15 A** denuncia o paralelo. A conta:
>
> | Ligação | Tensão | Corrente |
> |---|---:|---:|
> | 2 em **paralelo** (como vem) | 12 V | ~12 A |
> | 2 em **série** (o que queremos) | **24 V** | **~6 A** |
>
> Ligue **(+) de uma no (−) da outra**; as pontas que sobram viram o par de 24 V.
>
> ✅ **A foto do kit recebido confirma que dá para fazer isso.** Em [`imagens/peltir.avif`](../imagens/peltir.avif) vê-se que **cada pastilha tem o seu próprio par de fios** (vermelho e preto) saindo do chicote. Ou seja, elas **não vêm ligadas entre si de fábrica** — basta unir um (−) a um (+) para ter a série, sem cortar nada que já esteja soldado.
>
> **2. 🔥 Separar as ventoinhas das pastilhas — o erro que queima o kit**
>
> Kits assim costumam ter **uma entrada de 12 V só**, alimentando pastilhas e ventoinhas juntas. **Ligar 24 V nessa entrada única queima todas as ventoinhas na hora.**
>
> ✅ **A foto também resolve esta.** Cada ventoinha do kit tem **cabo próprio e independente** — não há uma entrada única de 12 V compartilhada. Isso torna a modificação 2 trivial: é só **não** juntar os chicotes. Leve os fios das pastilhas ao BD-POT (24 V) e os das ventoinhas ao BD-AUX (12 V).
>
> ```
> Peltier 1 ──série── Peltier 2  ────► 24 V   (BTS #1, via BD-POT)
> Ventoinhas (todas)  ────────────────► 12 V   (BD-AUX)
> ```
>
> **3. Trocar as ventoinhas do RADIADOR por modelos de 3 fios**
>
> | Ventoinha | Se parar | Precisa de RPM? |
> |---|---|---|
> | **Do radiador** (lado quente) | ⚠️ **Peltier queima em < 1 min** | ✅ **SIM** |
> | Dos blocos frios (lado frio) | O ar não circula bem — não destrói nada | ❌ Não |
>
> ⚠️ **Troque as do radiador, não as dos blocos frios.** É um erro fácil de cometer e ele anula a proteção nº 1 do projeto.
>
> ### 💡 Possível economia: 2 ventoinhas internas a menos
>
> As **2 ventoinhas dos blocos frios já sopram para dentro da câmara**. Elas podem assumir o papel das 2 ventoinhas de 40 mm que o projeto previa no lado Peltier. **Decida na montagem**, ao ver a geometria real — se aproveitar, são 2 peças a menos e menos coisa dentro da câmara.
>
> ### ⚠️ Dois pontos a verificar no comissionamento
>
> | Verificação | Por quê |
> |---|---|
> | **Temperatura do radiador** com as 2 pastilhas em 100 % | O radiador do kit é dimensionado para ~120 W, e o lado quente rejeita até ~200 W no *pull-down*. Se passar de **60 °C**, o ΔT despenca e a câmara para de esfriar. Em regime (duty ~40 %) não deve ser problema |
> | **Corrente total das ventoinhas** do kit | O ramal de 12 V (T3) está em 0,87 A, ou seja **58 % do limite seguro do LM2596**. Há folga, mas não é infinita — meça antes de fechar |

> ⚠️ **As duas Peltier ficam em SÉRIE, nunca em paralelo.** Em série cada pastilha recebe 12 V (o nominal dela) e as duas compartilham os mesmos 6 A. **Em paralelo cada uma receberia os 24 V inteiros e queima em segundos.** Antes de energizar, meça a resistência do conjunto com o multímetro: deve dar **o dobro** da resistência de uma pastilha isolada. Se der metade, a ligação está em paralelo — corrija.

> 🔥 **Dobrar a Peltier obriga a dobrar a dissipação.** Cada pastilha joga ~90 W no lado quente (a potência elétrica dela mais o calor bombeado). Um único dissipador de 80 mm não dá conta dos dois — e se o lado quente saturar, o ΔT despenca, a câmara para de esfriar e a pastilha cozinha. **São 2 conjuntos completos, e é o único ponto em que o Plano B ficou mais trabalhoso que o anterior.** Reserve o espaço atrás da câmara no projeto mecânico.

## L.4 — Sensores

| Item | Qtd | Especificação | Link |
|---|---:|---|---|
| Sensor DS18B20 à prova d'água | 1 | 1-Wire, ±0,5 °C — centro da câmara | |
| Resistor 4,7 kΩ 1/4 W | 2 | Pull-up do barramento 1-Wire | |
| Sensor AM2315C | 1 | I²C, umidade + temperatura, carcaça selada | |
| Capacitor cerâmico 100 nF | **6** | Filtro dos pinos IS dos BTS (2) + filtro do divisor D25 (1) + reservas | |
| Resistor 220 Ω 1/4 W | 6 | 4 usos + 2 reservas — **série dos LEDs brancos da iluminação da maquete (5 V)**. ⚠️ Não são mais dos sinaleiros do painel, que agora são de 24 V | |

## L.4b — Posições de ensaio (dispositivos sob teste)

> ⭐ **É o núcleo do problema descrito no edital.** Detalhamento completo, com esquema e ensaios, em [Doc 13](../camada_1_maquete/13_posicoes_de_ensaio.md).

| Item | Qtd | Especificação | Link |
|---|---:|---|---|
| **Sensor INA219** (módulo I²C) | 4 | Mede tensão e corrente, ±3,2 A. ⚠️ **4 endereços selecionáveis** (0x40/0x41/0x44/0x45) — um por posição, todos no mesmo par de fios | |
| Porta-fusível mini automotivo DIN | 4 | **F-P1 a F-P4** — proteção individual de cada posição de ensaio | |
| Fusível mini automotivo 500 mA | 8 | 4 usos + 4 reservas | |
| Placa ilhada pequena | 4 | ~30 × 40 mm — corpo de cada placa simuladora de dispositivo | |
| Resistor 220 Ω / **5 W** | 4 | Carga térmica de cada simulador (~3 W). ⚠️ **5 W**, não 1/4 W | |
| Resistor 1,2 kΩ 1/4 W | 4 | Limitador do LED indicador de cada posição | |
| LED 5 mm difuso | 4 | Indica "posição viva", visível pela porta da câmara | |
| **Micro-chave ou jumper** | 4 | ⭐ **Simula a falha do dispositivo** — é o que permite demonstrar a detecção ao vivo na apresentação | |
| Borne DIN 2,5 mm² | 8 | Entrada e saída de cada posição | |

> 💡 **O item mais importante desta tabela é o jumper.** Sem ele você não consegue demonstrar a detecção de falha — que é justamente a melhoria que o edital pede.

## L.5 — Placa de Interface PI-1 (onde os componentes discretos moram)

> ⭐ **Nenhum resistor ou capacitor deste projeto fica pendurado no fio.** Nove deles vão para uma placa em caixa DIN ao lado do Arduino, e dois vão soldados nos próprios BTS7960. O documento com a ligação **perna por perna** de cada componente, e o motivo de cada um existir, é o [Doc 33](../camada_3_eletrica/33_placa_interface_componentes.md).

| Item | Qtd | Especificação | Link |
|---|---:|---|---|
| **Placa ilhada (padrão furos isolados)** | 1 | ~5 × 7 cm. ⚠️ **Ilhada, não de barramento** — na de barramento você acaba tendo que cortar trilha, e é dali que saem os curtos difíceis de achar | |
| **Caixa modular para trilho DIN — 4 módulos (70 mm)** | 1 | Invólucro da PI-1. Fica ao lado do Arduino no trilho 3. ⚠️ **Precisa ser 4 módulos, não 3:** o borne J1 tem 11 vias × 5,08 mm = 55,9 mm e não cabe nos ~45 mm úteis de uma caixa de 3M. Buscar `caixa para trilho din 4m modular` | |
| **Borne KF301 / KRE passo 5,08 mm — 8 vias** | 2 | Um borne superior (lado Arduino) e um inferior (lado campo). ⚠️ **Passo 5,08 mm, não 3,5 mm** — 5,08 é exatamente **2 furos** da placa ilhada (2,54 mm); o de 3,5 mm não encaixa em furo nenhum | |
| **CI ULN2803A** (DIP 18 pinos) | 2 | **Driver dos 4 sinaleiros de 24 V** — 8 canais Darlington, 500 mA/50 V, com diodos de proteção internos. 1 uso + 1 reserva (o CI é barato e é o único ponto onde 24 V encosta na lógica) | |
| **Soquete DIP 18 pinos** | 1 | ⚠️ **Solde o soquete, não o CI.** Permite trocar o chip sem dessoldar nada | |
| Fio rígido 0,25 mm² para interligação | 1 m | Ligações por baixo da placa. ⚠️ Não usar "sobra de perna" de componente em trecho longo — oxida e não é isolada | |
| Verniz spray para PCI (ou esmalte incolor) | 1 | Proteção do lado da solda contra umidade e oxidação | |
| Termorretrátil Ø 2 mm | 30 cm | Isolação dos 2 resistores de 10 kΩ soldados nos BTS7960 | |
| Etiqueta impressa em papel adesivo | 1 | Identificação das 20 vias na frente da caixa — **é o que torna a placa auditável** | |

> 📌 **Componentes que vão NA placa PI-1:** 2× 100 nF (filtro IS) · 1× 22 kΩ + 1× 4,7 kΩ + 1× 100 nF (divisor D25) · 1× 4,7 kΩ (pull-up 1-Wire) · **1× ULN2803A** (driver dos sinaleiros). Os passivos já estão nas listas L.2 e L.4 — não compre de novo.
>
> 📌 **Os 4× 220 Ω NÃO vão mais na PI-1.** Eles mudaram de função: agora limitam a corrente dos **LEDs brancos da iluminação pública da maquete**, que passaram a ser de **5 V**. Montam-se dentro da base de cada poste de iluminação (seção M.4).
>
> 📌 **Componentes que NÃO vão na placa:** os 2× 10 kΩ de pull-down são soldados **no próprio BTS7960**, entre `R_EN` e `GND`. Não é preciosismo — é o único ponto em que um rompimento de cabo ainda deixa o driver desligado. A explicação completa está no [Doc 33 §33.4](../camada_3_eletrica/33_placa_interface_componentes.md).

---

# 🔧 CAMADA 3 — CABOS E ACESSÓRIOS

| Item | Qtd | Especificação | Aplicação |
|---|---:|---|---|
| Cabo flexível 1,5 mm² preto | 3 m | 750 V | Retorno geral 0 V (6,9 A — soma dos 3 ramais) |
| Cabo flexível 1,5 mm² vermelho | 2 m | 750 V | **24 V de potência** — P1 → painel → BTS (6,0 A) |
| Cabo flexível 0,75 mm² vermelho/preto | 3 m | 750 V | Barramento 24 V (trechos internos) e **saída de 12 V do T3** (1,0 A) |
| Cabo flexível 0,5 mm² (5 cores) | 10 m | 750 V | 5 V e derivações do 12 V auxiliar |
| Cabo flexível 0,25 mm² (8 cores) | 15 m | Sinais | Sensores, botões, comunicação |
| Cabo par trançado blindado 2×0,25 mm² | 2 m | Blindado, malha aterrada em **um** ponto | I²C e 1-Wire (trecho câmara → painel) |
| Terminal tubular (ilhós) 0,25 / 0,5 / 1,5 mm² | 1 kit | Com colarinho colorido | **Obrigatório** em todo borne parafuso |
| Alicate de crimpar terminal tubular | 1 | Tipo quadrado/hexagonal | Ferramenta |
| Terminal olhal M4 | 10 | Amarelo/vermelho | Aterramento |
| Espaguete termorretrátil (kit) | 1 | Diversas bitolas | Isolação de emendas |
| Abraçadeiras de nylon 100 mm | 100 | — | Amarração |
| Anilhas de identificação de cabo | 1 kit | Numeradas 0–9 | Identificação (norma de painel) |
| Espiral organizador Ø 8 mm | 2 m | — | Chicote painel → câmara |

---

## Resumo de conferência rápida

| Grupo | Itens-chave |
|---|---|
| **Energia** | 1× fonte 24 V/10 A ⚠️ **240 W é o mínimo** · 1× disjuntor 2P 6 A · **1× kit 2 LM2596 com display** · 3× porta-fusível |
| **Proteção** | fusíveis **10 A (F1)** e 2 A (F2/F3) · **KA1 (2 contatos) + KA2 (10 A em DC)** · botão de REARME · **sem Zener, sem crowbar** |
| **Controle** | 1× Arduino Mega · 1× ESP32 · 1× DNLCB30 · 1× tela ES3C28P · 1× RTC · **1× placa PI-1 com ULN2803** |
| **Potência** | 2× BTS7960 · **2× Peltier EM SÉRIE** (+1 reserva) · **1× PTC 24 V 80 W** · 4× fan interna · **2× cooler externo 3 fios** |
| **Sensores** | 1× DS18B20 · 1× AM2315C |
| **Maquete** | 3× poste Ø 8 mm · ~8 m de fio rígido ENCAPADO (4 cores, **R1 e 0 V mais grossos**) · 2× "transformador" + **1× caixa de derivação** · 3× janela de acrílico · 1× caixa de subestação |
| **Comando** | 1× emergência (2 NF) · 1× START · 1× STOP (NF+NA) · 1× **REARME azul** · 1× seccionadora · **4× sinaleiro 22 mm de 24 V** |

### ✅ Checklist de compra dos 6 itens que o Plano B mudou

Se você já tinha uma lista antiga em mãos, confira **estes seis** antes de fechar o pedido — são os erros mais fáceis de cometer copiando a versão anterior:

- [ ] **Peltier: 3 unidades** (2 em uso + 1 reserva), do mesmo lote
- [ ] **PTC de 24 V**, não de 12 V ⚠️ *item de prazo longo — comprar no Lote A*
- [ ] **Cooler externo 80 mm de 3 fios: 2 unidades**, não 1
- [ ] **Fusível F1 de 10 A**, não de 6 A
- [ ] **Fio rígido vermelho 1,00 mm²** e **azul claro 1,50 mm²** (ambos subiram)
- [ ] **Fonte de 240 W** — a de 150 W não atende mais
- [ ] **2× CI ULN2803A + 1 soquete DIP 18** (driver dos sinaleiros de 24 V)
- [ ] **Resistores de 220 Ω** (não 2,2 kΩ) para os LEDs da maquete, que agora são de 5 V

---

## ⚠️ Itens que NÃO existem mais nesta versão

| Item removido | Motivo |
|---|---|
| ~~Fonte ATX 500 W~~ | Não possui trilho de 24 V; substituída pela fonte chaveada de 24 V |
| ~~Jumper PS_ON (verde-preto)~~ | Era específico da ATX |
| ~~Módulo XL4016 (T1)~~ | **Plano B:** a potência térmica ligou direto em 24 V — não há tensão a transformar no ramal R1 |
| ~~2× Módulo XL4015 (T2, T3)~~ | Substituídos pelos **LM2596 com display**: mesma função, mais barato, com leitura visível e proteções nativas |
| ~~6× Diodo Zener (5V6 / 13 V / 15 V)~~ | Crowbar dispensado — o LM2596 traz limite de corrente e desligamento térmico no CI |
| ~~Fusíveis F4 e F5 + 2 porta-fusíveis~~ | Eram os fusíveis de **saída** do crowbar. Os de **entrada** dos ramais (F1/F2/F3) continuam |
| ~~2× Voltímetro digital 3 fios~~ | O display já vem integrado ao LM2596 |
| ~~Tubo PVC Ø 63 mm + 2 tampas~~ | Era o corpo maior do T1; hoje os 3 postes usam Ø 50 mm |
| ~~Cooler 30 mm 12 V~~ | Ventilava o XL4016 dentro do T1 |
| ~~Fusível 6 A~~ | **F1 subiu para 10 A** (ramal R1 conduz 6,0 A contínuos) |
| ~~Aquecedor PTC de 12 V~~ | Trocado pela **versão de 24 V**, alimentada direto do barramento |
| ~~Resistor 2,2 kΩ (LEDs da maquete em 24 V)~~ | A iluminação da maquete passou para **5 V** — o limitador virou **220 Ω** |
| ~~4× resistor 220 Ω nos sinaleiros do painel~~ | Os sinaleiros viraram **módulos de 24 V** com **ULN2803**. Os 220 Ω não foram descartados: **migraram para os LEDs da maquete** |
| ~~Acrílico preto 3 mm (cobertura)~~ | Trocado por **branco**, visual de câmara frigorífica real |
| ~~Porta simples de acrílico 10 mm~~ | Trocada por **porta dupla com câmara de ar** (metade da perda térmica) |
| ~~XPS 20 mm~~ | Aumentado para **30 mm** |

> 📊 O script [`gerar_planilha_bom.py`](../gerar_planilha_bom.py) gera a planilha de compras a partir desta lista — **precisa ser atualizado** para refletir esta BOM. A planilha `BOM_Projeto_Integrador.xlsx` ainda está na versão anterior (com XL4016, XL4015, Zener e 1 Peltier): **regere antes de usá-la para comprar.**

---

📄 **Anterior:** [Doc 02 — Arquitetura de Energia](02_arquitetura_de_energia.md) · **Próximo:** [Doc 10 — Base e Chão de Fábrica](../camada_1_maquete/10_base_e_chao_de_fabrica.md)
