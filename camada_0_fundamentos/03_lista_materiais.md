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

# 🔌 SISTEMA DE ENERGIA (o coração da refatoração)

## E.1 — Subestação: entrada AC e fonte principal

| Item | Qtd | Especificação | Busca sugerida | Link |
|---|---:|---|---|---|
| **Fonte chaveada 24 Vcc** | 1 | **24 V / 10 A / 240 W**, bivolt 110-220 V (chave seletora ou auto-range). Modelo tipo **S-240-24** | `fonte chaveada 24v 10a 240w` | |
| **Disjuntor DIN 2P 6 A curva C** | 1 | Bipolar, 6 A, curva C (por causa do inrush da fonte), 3 kA | `disjuntor bipolar 6a curva c din` | |
| **Chave rotativa 0-1 22 mm** | 1 | ≥ 6 A / 250 V AC, 2 posições com retenção, fixação 22 mm | `chave seletora 2 posicoes 22mm` | |
| Cabo PP 3×1,5 mm² + plugue | 1,5 m | Cabo de entrada AC com plugue 2P+T 10 A | `cabo pp 3x1,5 com plugue` | |
| Prensa-cabo PG9 / PG13 | 3 | Entrada e saída de cabos da caixa da subestação | `prensa cabo pg9` | |
| Borne DIN 4 mm² | 6 | Distribuição 24 V e 0 V na subestação | `borne trilho din 4mm parafuso` | |
| **Cooler 60 mm 24 V** | 1 | Exaustão da caixa da subestação (~18 W de perda). ⚠️ **24 V** — é a única tensão que existe dentro da caixa. Alternativa: 2× de 12 V **em série** | `cooler 60mm 24v` | |
| Grade + filtro 60 mm | 1 | Veneziana de entrada de ar da subestação | `grade cooler 60mm com filtro` | |

> ⚠️ **A caixa da subestação deve ser fechada e aparafusada.** É o único lugar do projeto com 127 V AC. Sinalize com etiqueta **"PERIGO — 127 V CA"** na tampa.

## E.2 — Conversores de tensão (os "transformadores" da maquete)

| Item | Qtd | Especificação | Ajuste | Link |
|---|---:|---|---|---|
| ⭐ **Kit 2× Módulo LM2596 com display** | 1 kit | Step-down **3 A**, Vin até 40 V, saída ajustável, **display LED vermelho de 3 dígitos** integrado. Um módulo vira o **T2**, o outro vira o **T3** | ver abaixo | [Mercado Livre](https://www.mercadolivre.com.br/kit-2-modulo-regulador-de-tensao-lm2596-display-ajustavel/up/MLBU4063333801) |
| → **T2** (poste P2, comando) | — | 1º módulo do kit — alimenta Arduino, Nextion, SD/RTC, lógica dos BTS, placa PI-1 e **os LEDs da iluminação da maquete** | **5,10 V** | |
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
| Porta-fusível mini automotivo DIN | 3 | Trilho DIN 35 mm | **F1, F2, F3** — entrada dos 3 ramais | |
| **Fusível mini automotivo 10 A** | 2 | 1 uso + 1 reserva | **F1** — ramal R1 (potência 24 V, 6,0 A) | |
| Fusível mini automotivo 2 A | 4 | 2 usos + 2 reservas | **F2** (comando) e **F3** (auxiliares) | |
| Terminal olhal M4 amarelo | 10 | Aterramento e barramento de 0 V | — | |

> ⚠️ **F1 subiu de 6 A para 10 A.** O ramal de potência agora conduz 6,0 A contínuos em 24 V; um fusível de 6 A abriria em operação normal. **Confira antes de comprar** — é o erro mais fácil de cometer copiando a lista antiga.

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
| MDF 9 mm ou acrílico opaco 4 mm | — | Caixa **260 × 190 × 150 mm** (L×P×A), frente voltada para a rua | |
| Dobradiça pequena + fecho | 1 jogo | Tampa de manutenção | |
| Tela metálica / alambrado miniatura | 1 | Cerca do pátio da subestação (tela de aço, malha 3 mm) | |
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
| **Bloco de distribuição DIN** — 1 entrada 4 mm² + 4 saídas | 1 | **BD-POT** — **24 V de potência comutados pelo KA2** → BTS #1, BTS #2 e reservas. ⚠️ Cai com a emergência | |
| **Bloco de distribuição DIN** — 1 entrada 2,5 mm² + 4 saídas | 2 | **BD-AUX** (12 V auxiliar, do T3) e **BD-24V** (**24 V permanentes**: DNLCB30/ESP32, cadeia de comando e **o positivo comum dos 4 sinaleiros**). ⚠️ **Não confundir com o BD-POT** — este **não** cai com a emergência, é o que mantém a supervisão viva para publicar o evento por MQTT | |
| **Bloco de distribuição DIN** — 1 entrada 2,5 mm² + 6 saídas | 1 | **BD-5V** — Arduino, Nextion, SD/RTC, lógica dos 2 BTS, LEDs | |
| **Bloco de distribuição DIN** — 1 entrada 10 mm² + 8 saídas | 1 | **BD-0V** — ⭐ o star ground do projeto. Todos os retornos convergem aqui | |
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
| Arduino Mega 2560 R3 | 1 | ATmega2560, 54 GPIO, 4 UARTs | |
| Shield de expansão Mega (bornes parafuso) | 1 | Sensor Shield V2.0 | |
| Suporte DIN para Arduino Mega | 1 | Ou SPCI4/adaptador | |
| Tela Nextion Basic 3.2" | 1 | NX4024T032, 400×240, TTL 5 V | |
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
| **KA1 — Relé de interface 24 Vcc, 2 contatos** | 1 | Faz o **selo** (habilitação) e alimenta a bobina do KA2. Conduz só miliampères — **6 A basta**. Buscar `relé de interface 24vdc 2 contatos din`. Premium: Finder **55.32.9.024.0040** | |
| **KA2 — Relé de interface 24 Vcc, contato ≥ 10 A** | 1 | É ele que chaveia os **24 V / 6,0 A** de potência dos BTS. ⚠️ **Confirme os 10 A no anúncio** — a maioria dos slim é de 6 A — **e confirme que a corrente é declarada em DC**: muito relé de 10 A/250 VAC cai para 5 A ou menos em 24 Vcc, porque corrente contínua não tem passagem por zero e o arco custa mais a extinguir. Buscar `relé de interface 24vdc 10a trilho din`. Premium: Finder **46.61.9.024.0040** + base **95.05** (16 A) | |
| **Resistor 10 kΩ 1/4 W** | 4 | **Pull-down** em cada `R_EN` dos BTS7960 (2) + reservas. ⚠️ Garante que **pino solto = driver desligado** — ficou ainda mais crítico com os 24 V permanentes na entrada dos BTS | |
| **Resistor 22 kΩ 1/4 W** ⬆ | 2 | **Braço superior** do divisor de realimentação de tensão para o pino D25 | |
| **Resistor 4,7 kΩ 1/4 W** | 2 | **Braço inferior** do mesmo divisor | |

> ⚠️ **O divisor de realimentação mudou de escala.** Ele antes lia os 12 V do T1 (10 kΩ + 4,7 kΩ → 3,84 V no ADC). Agora precisa ler o **barramento de 24 V**, e com os resistores antigos entregaria **7,67 V no pino D25 — o suficiente para danificar a entrada do Arduino**. Com **22 kΩ + 4,7 kΩ** a leitura fica em `24 × 4,7/26,7 = 4,22 V`, dentro da faixa segura e com margem para o barramento oscilar. 📌 **Sinalizar em [Doc 32](../camada_3_eletrica/32_sinais_e_sensores.md):** o esquema do divisor e a constante de conversão do firmware precisam ser atualizados junto.
| Diodo 1N4007 | 4 | ⚠️ **Sobressalente, não vai no painel.** Os relés de interface KA1/KA2 já trazem o diodo de roda-livre embutido. Guarde no saquinho de reposição — ver [Doc 33 §33.5](../camada_3_eletrica/33_placa_interface_componentes.md) | |

## L.3 — Atuadores térmicos e ventilação

| Item | Qtd | Especificação | Link |
|---|---:|---|---|
| **Pastilha Peltier TEC1-12706** | **3** | 12 V / ~6 A / 60 W cada. **2 em uso, ligadas EM SÉRIE** (24 V / 6,0 A / 144 W) + 1 reserva. ⚠️ **Comprar do mesmo lote/vendedor** — em série as duas conduzem a mesma corrente, e pastilhas descasadas trabalham desequilibradas | |
| **Aquecedor PTC cerâmico 24 V / 60 W** | 1 | Com aletas, **versão de 24 V** (2,5 A) para ligar direto no barramento. **60 W, não 100 W** — equilibra as duas potências. ⚠️ Menos comum que o de 12 V: **comprar cedo, no Lote A**. Buscar também como `aquecedor ar quente ptc 24v` (incubadora / impressora 3D) | |
| **Dissipador + cooler 80 mm p/ lado quente da Peltier** | **2** | **Um para cada pastilha.** ⚠️ **3 fios (com sinal de RPM)** nos dois — o firmware monitora os **dois** tacômetros e bloqueia a refrigeração se qualquer um parar | |
| Pasta térmica | 1 | Seringa 5 g — dá para os 2 conjuntos | |
| Fan 60 × 60 mm 12 V | 2 | Internas — lado PTC (1 sopra ↑, 1 sopra ↓) | |
| Fan 40 × 40 mm 12 V | 2 | Internas — lado Peltier (1 sopra ↓, 1 sopra ↑) | |

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

## L.5 — Placa de Interface PI-1 (onde os componentes discretos moram)

> ⭐ **Nenhum resistor ou capacitor deste projeto fica pendurado no fio.** Nove deles vão para uma placa em caixa DIN ao lado do Arduino, e dois vão soldados nos próprios BTS7960. O documento com a ligação **perna por perna** de cada componente, e o motivo de cada um existir, é o [Doc 33](../camada_3_eletrica/33_placa_interface_componentes.md).

| Item | Qtd | Especificação | Link |
|---|---:|---|---|
| **Placa ilhada (padrão furos isolados)** | 1 | ~5 × 7 cm. ⚠️ **Ilhada, não de barramento** — na de barramento você acaba tendo que cortar trilha, e é dali que saem os curtos difíceis de achar | |
| **Caixa modular para trilho DIN — 3 módulos (52,5 mm)** | 1 | Invólucro da PI-1. Cabe no espaço livre do trilho 3, ao lado do Arduino. Buscar `caixa para trilho din 3m modular` | |
| **Borne KF350 / KRE passo 3,5 mm — 10 vias** | 2 | Um borne superior (lado Arduino) e um inferior (lado campo). Passo de 3,5 mm porque todos os cabos são de 0,25 mm² | |
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
| **Controle** | 1× Arduino Mega · 1× ESP32 · 1× DNLCB30 · 1× Nextion 3.2" · 1× SD · 1× RTC · **1× placa PI-1 com ULN2803** |
| **Potência** | 2× BTS7960 · **2× Peltier EM SÉRIE** (+1 reserva) · **1× PTC 24 V 60 W** · 4× fan interna · **2× cooler externo 3 fios** |
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
