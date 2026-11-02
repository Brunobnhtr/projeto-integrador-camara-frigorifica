# Histórico de revisões — CAD da câmara e do painel

Registro do que mudou em cada versão dos desenhos de corte. A fonte única da
geometria, a partir da V8, é `cad_corte/parametros_v8.py`; este arquivo registra
**por que** ela mudou.

---

## V8 — 29/10/2026 · dutos **externos** restaurados

**Base:** correção de conceito pedida pelo usuário. A V7 havia internalizado os
dutos para fazer a flange da ventoinha caber; isso consumia 1,7 L do volume
refrigerado e **contrariava o desenho original do projeto**. A instrução foi
explícita: *"Não devemos alterar o conceito original apenas para acomodar os
dutos dentro da câmara."*

### Geometria

| Item | V7 | **V8** |
|---|---|---|
| Dutos | **internos**, 60 × 60 nos cantos traseiros | **externos**, 40 × 40 colados nas laterais |
| Câmara, interna bruta | 300 × 200 × 250 | **410 × 250 × 390** |
| Câmara, corpo externo | 310 × 205 × 260 | **420 × 260 × 400** |
| Volume interno | 15,00 L | **39,98 L** bruto / 39,26 L útil / 38,72 L livre |
| Largura total | 310 | **500** (420 + 40 + 40) |
| Área interna (6 faces) | 0,370 m² | **0,7198 m²** |
| Alojamento da ventoinha | não existia | **56 × 56 × 50**, flange D36 |
| Renovação de ar | não existia | **2 comportas** (teto e traseira baixa) |
| Painel | 600 × 800 × 250 | **600 × 800 × 250 (inalterado)** |
| Peças físicas (câmara) | 24 | **42** + 20 de isolamento |

### Mudanças de projeto

1. **Dutos voltam para fora.** Dois canais de 40 × 40 colados nas laterais,
   de Z 50 a Z 390, com tampa CAM-21 no topo, em Y 105..145. Eles **não captam ar
   ambiente**: fazem parte
   do circuito fechado de recirculação. A tomada inferior (Z 5..45) e a exaustão
   do teto (Z 340..380) só abrem no modo renovação, por comporta.
2. **Alojamento de 56 × 56 resolve o problema da ventoinha de 40.** Os quatro
   furos M3 de uma ventoinha de 40 mm estão em passo 32, ou seja raio 22,6 mm:
   dentro de um canal de 40 × 40 eles caem a 2,4 mm da borda — não existe aba
   para parafusar. A solução é um alojamento que cresce 16 mm para fora do duto,
   com furo **circular Ø36** e ligamento de 3,03 mm. Furo redondo, não quadrado,
   de propósito: o quadrado de 32 × 32 comeria os quatro furos.
3. **Isolamento passa a envolver os dutos.** As 8 peças ISO (EPS 1 mm) cobrem
   também os canais. Sem isso o duto viraria uma aleta de 0,32 m² trocando calor
   com o ambiente, e a câmara perderia exatamente o que o Peltier produz.
4. **Duas comportas de renovação.** Uma no teto e uma na traseira baixa, ambas
   separadas da recirculação. Antes a renovação de ar não estava resolvida em
   nenhuma versão.
5. **Porta única de 5 mm recessada em Y −5..0.** A V7 usava dupla com câmara de
   ar; a V8 voltou à porta simples para não gastar 10 mm dos 260 de
   profundidade. O batente de 15 mm ficou **dentro** da cavidade.

### Correções que a própria construção da V8 obrigou

| # | O que estava errado | Correção |
|---|---|---|
| 1 | `POSES` era dicionário, e um código com qtd 6 recebia **uma** colocação: o duto direito nunca era desenhado | `POSES` virou **lista de peças físicas**, uma linha por colocação |
| 2 | a porta estourava os 260 mm de profundidade | porta recessada em Y −5..0, batente para dentro, com `assert` de 260 mm |
| 3 | o batente saía com 15 mm de espessura em vez de 3 mm (passava `BATENTE_D` no lugar de `BATENTE_T`) | corrigido; sumiu a chapa fantasma `CHAPA_acrilico_branco_15mm` |
| 4 | o alojamento invadia a câmara (painéis de X −45 a 11) | `ALOJ_X_ESQ = −61` / `ALOJ_X_DIR = 415` com `assert`; **o validador pegou este erro** |
| 5 | a isométrica estourava a moldura e batia no título | `K_ISO = 0,58` e nota de escala paramétrica, em vez de imprimir 1:1 falso |
| 6 | o detalhe 3:1 da ventilação ficou ilegível | `DETALHE_VENTILACAO_V8` reescrito em `KD = 3,0` |
| 7 | **o duto não tinha tampa em cima** — 3 painéis e nada no topo, em Z 400, 5 mm acima do teto. O canal era uma chaminé aberta: a ventoinha empurrava o ar para o ambiente em vez de devolvê-lo à câmara pela boca superior | `DUTO_Z1` passou de 400 para `H_GROSS` (390) e entrou a **CAM-21, tampa do duto**, em Z 390..395, rente com o teto. `_checa()` exige `CAP_DUTO_Z1 == H_GROSS + ACR`, e o validador ganhou o 15º teste negativo: remove a tampa e exige que a falta seja detectada |

### Validação

`python cad_corte/valida_cad_v8.py` → **2001 verificações, 15 testes negativos
(15 detectados), 0 erros, 1 aviso**. O aviso é a limitação térmica da seção
seguinte, registrada de propósito.

Três testes negativos passaram batido na primeira tentativa e foram consertados —
o que importa registrar porque mostra que o teste também pode estar errado:

- **"furo fora"** chamava `f_furo_dentro(pastas, pecas)` com `[]` em `pastas`;
  o laço nunca rodava. Passou a iterar `pecas` direto.
- **"lâmpada"** foi movida só em X, depois só em Z — e nenhum dos dois eixos
  colide, porque a lâmpada está 16 mm acima da plataforma e em X 25..65 contra
  X 130..280 da plataforma. Só colide movendo **X +110, Y +50 e Z −23 juntos**.
- **verificações por peça órfãs**: `f_furo_dentro`, `f_recorte_dentro` e
  `f_duplicado` existiam mas nunca eram chamadas. Com o `pecas_v8.json` e a seção
  `3b. PECAS`, a contagem subiu de 475 para 1977 (2001 depois da tampa do duto).

### Térmico — e a limitação que precisa ficar escrita

O modelo acoplado (`cad_corte/termica.py`, agora importando `parametros_v8`)
roda 8 cenários. O resultado, sem maquiagem:

| Ambiente | Rth do dissipador quente | Temperatura do ar | Alvo 5 °C |
|---|---|---|---|
| 25 °C | 0,10 K/W | **+3,6 °C** | atende |
| 25 °C | 0,15 K/W | **+4,8 °C** | atende |
| 30 °C | 0,10 K/W | **+8,1 °C** | **não atende** |
| 30 °C | 0,15 K/W | **+9,3 °C** | **não atende** |

**Com 1 mm de isolante, 40 L e dois Peltier, a câmara não sustenta 5 °C a 30 °C
de ambiente.** O isolante de 1 mm foi mantido por decisão do usuário, contra a
recomendação de 10 mm. As saídas, com números:

- **5 mm** → 36,5 L úteis, **+4,9 °C** a 30 °C
- **10 mm** → 33,2 L úteis, **+0,9 °C** a 30 °C
- **4 Peltier com 1 mm** → 39,3 L úteis, **−0,8 °C** a 30 °C, mas **319 W** a rejeitar

Isto é **limitação registrada do projeto, não erro de cálculo.** O gargalo
também não é só o isolamento: o dissipador quente precisa rejeitar **184 W a
43 °C**, 3,1× a carga de parede. Cada Peltier puxa 62 W (5,2 A a 12 V), total
**124 W elétricos**.

### Pendências que continuam

O vão do kit Peltier na CAM-05, o alojamento do soquete na CAM-15, a medida real
do PTC (CAM-12/13/14/16) e o modelo do dissipador quente.
**A V8 não está liberada para corte.**

---

## V7 — 29/10/2026 · câmara compacta

**Base:** decisão do usuário de reduzir a câmara ao menor volume prático. O
diagnóstico que motivou a mudança veio da própria V6: com 40,8 L e duas Peltier, a
câmara **não chegava a 5 °C** (estabilizava em 9–11 °C).

### Geometria

| Item | V6 | **V7** |
|---|---|---|
| Câmara, interna bruta | 410 × 255 × 390 | **300 × 200 × 250** |
| Câmara, corpo externo | 420 × 260 × 400 | **310 × 205 × 260** |
| Volume interno | 40,8 L | **15,00 L** (14,63 L útil, 12,60 L livre) |
| Área interna (6 faces) | 0,73 m² | **0,370 m²** |
| Dutos | 45 × 45 nos cantos | **60 × 60 nos cantos traseiros, internos** |
| Painel | 600 × 800 × 250 | **600 × 800 × 250 (inalterado)** |
| Base | 1500 × 500 | **1500 × 500 (inalterada)** |

### Mudanças de projeto

1. **Isolamento como camada independente.** Seis peças próprias (ISO-01..06), com
   espessura em `ESPESSURA_ISOLANTE_MM`. O valor pedido (1 mm) **foi mantido**; os
   cenários de 1 / 5 / 10 mm estão calculados em `analise_termica_tec.py`.
2. **PTC apontado para baixo, pendurado no teto.** Pilha de 4 tirantes M4 com
   tubos cerâmicos de 18 / 25 / 12 mm, escudo metálico com vão de 114 × 34 e
   2 grampos de inox. Antes a orientação não estava definida.
3. **Dutos de 45 × 45 → 60 × 60.** Com 45 a flange da ventoinha (56 mm) não
   entrava no canal. Era o defeito nº 2 da V6.
4. **Abertura da ventoinha circular Ø36.** No quadrado de 32 × 32 os quatro furos
   de passo 32 caem exatamente nos cantos: o vão comia os furos e a ventoinha não
   podia ser parafusada. Ligamento agora de 3,03 mm.
5. **Bandeja das lâmpadas eliminada.** Era uma prateleira de 180 mm atravessada no
   meio da câmara, no caminho do fluxo de ar. Virou 2 suportes individuais no teto.
6. **Lâmpadas fixadas em 12 V.** A V6 tinha contradição interna (+24 V em um
   trecho, "duas de 12 V em série" em outro). Decisão: **2× W5W 12 V / 5 W em
   paralelo**, no ramal de 12 V.
7. **Chapa de 5 mm de 1900 × 1050 para 1150 × 700.** Passou a caber na chapa
   comercial de 2000 × 1000 — a correção nº 3 da V6 fica fechada.

### Correções que a própria construção da V7 obrigou

Ao montar a geometria, o validador e a planta não fechavam em cinco pontos. Todos
foram corrigidos **antes** de gerar o pacote:

| # | O que estava errado | Correção |
|---|---|---|
| 1 | o suporte do PTC tinha 8 furos, mas só 4 eram os tirantes; a comparação de padrão falhava | o validador filtra o subconjunto dos tirantes antes de comparar |
| 2 | a plataforma do PTC ia de X 85 a 235 mas as cantoneiras estavam previstas nas paredes laterais | a plataforma passou a pender do **teto**, por 4 tirantes |
| 3 | o escudo a 100 mm de profundidade ficava a 5 mm do duto | escudo reduzido para 90 mm de profundidade (folga 10 mm) |
| 4 | o suporte da lâmpada da direita ficava a 5 mm da plataforma | suportes movidos para X 15 e X 245 (folgas 30 e 10 mm) |
| 5 | os detalhes em corte usavam a face superior como origem do retângulo | passaram a usar a face inferior (o PTC aparecia acima do suporte) |

### Validação

`python cad_corte/valida_cad.py` → **519 verificações, 13 testes negativos (13
detectados), 0 erros, 0 avisos**. Os testes negativos inserem erros de propósito
(dimensão trocada, furo fora da peça, furo dentro de recorte, furo duplicado,
abertura comendo os furos M3, flange maior que o canal, porta menor que o batente,
soma de alturas errada, padrão M4 deslocado, chapa grande demais, peças encostadas,
componente atravessando a parede, quantidade errada) e cada um tem também o
controle positivo.

### Térmico

Modelo acoplado (`cad_corte/termica.py`), 7 cenários obrigatórios em
`analise_termica_tec.py`: **−5,4 °C** a 25 °C de ambiente, **−1,1 °C** a 30 °C,
dissipador quente rejeitando **165 W**, **119 W** elétricos nas 2 Peltier.

### Pendências que continuam

O vão do kit Peltier na CAM-06, o alojamento do soquete na CAM-17, a potência do
PTC, a espessura definitiva do isolamento e o modelo do dissipador quente.
**A V7 não está liberada para corte.**

---

## V6 — 29/10/2026 · integração e auditoria da V5

**Base:** pacote CAD V5 do GPT-6, auditado com `cad_corte/audita_v5.py` e integrado ao
repositório do projeto.

### Geometria

| Item | V4 (repo) | V6 (= V5 auditada) |
|---|---|---|
| Câmara, corpo | 210 × 110 × 260 | **420 × 260 × 400** |
| Câmara, com dutos | 290 × 110 × 260 | **500 × 260 × 400** |
| Volume interno | 5,25 L | **40,8 L** |
| Painel | 400 × 500 × 200 | **600 × 800 × 250** |
| Trilhos DIN | 3 | **4** |
| Base da maquete | 1500 × 500 | **1950 × 600** (proposta) |
| Modelos de peça (câmara) | 17 | **24** |
| Peças físicas (câmara) | 21 | **59** |

### Correções aplicadas sobre a V5

1. **Porta 420 × 390 → 420 × 400.** O batente tem 400 mm; a porta curta deixava 10 mm
   do quadro de EPDM sem compressão. O espaçador CAM-09 foi de 370 para 380 mm.
2. **CAM-14 com qtd 4 → 2.** A base CAM-01 é corrida sob os dutos e já é o piso do
   canal; só o topo precisa de tampa. Duas peças eram fantasma na lista.
3. **Chapa de 5 mm declarada em 1900 × 1050.** Não cabe na chapa comercial de
   2000 × 1000 — exigir 2050 × 1250 passou a estar escrito na lista e no `LEIA-ME`.

### Novidades

- `audita_v5.py` — auditor independente, que foi o que encontrou o defeito da porta.
- `valida_cad.py` reescrito: confere invariantes físicos (fechamento da caixa,
  alinhamento entre peças irmãs, quantidade × função, chapa comercial, orçamento
  térmico) em vez de comparar DXF contra CSV.
- `PLANTA_BASE_1950x600_V6_ESTUDO.dxf` — a base nova em coordenadas reais.
- `DETALHE_SUPORTES_V6_ESTUDO.dxf` — apoios, PTC e bandeja das lâmpadas em 1:1.

### Pendências abertas (não resolvidas nesta revisão)

1. Kit Peltier duplo sem dimensões confirmadas — furos só em gravação.
2. **Nenhuma ventoinha tem alojamento** (canal 34 × 34, abertura 32 × 32, ventoinha 40 mm).
3. Margem térmica de 3 W a 20 K — setpoint realista ~15 K.
4. Soquetes e PTC reais não medidos.
5. Alturas 12 / 25 mm dos isoladores sem ensaio térmico.
6. Base 1950 × 600 sem projeto estrutural.

---

## V5 — 29/10/2026 · apoios do PTC e das lâmpadas *(pacote do GPT-6)*

- 24 modelos / 61 peças físicas (a V6 corrige para 59 ao remover 2 tampas fantasma).
- CAM-22: 24 quadradinhos de 30 × 30 × 5 → 4 blocos de 30 mm.
- CAM-23: suporte metálico do PTC, 160 × 80 × 2.
- CAM-24: escudo térmico, 180 × 100 × 1.
- CAM-18: 4 cantoneiras de 60 × 35 × 2, dobradas a 90°.
- CAM-19: bandeja de alumínio 390 × 180 × 2.
- Furação das lâmpadas alinhada em 95 / 195 mm — corrige o desencontro de 100 vs 155 mm
  da V4 do GPT-6.
- Validação declarada: 508 verificações, 0 erros. **A validação não pegou o defeito da
  porta** porque comparava o DXF com as definições que o geraram.

---

## V4 — 29/10/2026 · Peltier duplo *(pacote do GPT-6)*

- Peltier sai do teto e vai para a traseira superior, em tampa técnica removível.
- Câmara 420 × 260 × 400; painel 600 × 800 × 250.
- 21 modelos / 33 peças físicas.

> ⚠️ **Não confundir com a V4 deste repositório**, que era a câmara de 5,25 L
> (210 × 110 × 260, painel 400 × 500 × 200, 17 modelos). São duas linhagens paralelas.
> A V4 do repositório está preservada em `BACKUP_ANTES_ATUALIZACAO_CAD_V5/`.

---

## V4 (repositório) — 29/10/2026 · pacote de corte original

- Primeiro pacote DXF do projeto: 17 modelos, 21 peças de acrílico, painel 400 × 500 × 200.
- 17 divergências resolvidas entre as listas dos Docs 12/20 e a geometria real.
- Pendência deixada aberta e sinalizada: o trilho 1 pedia 376 mm de ocupação contra
  320 mm disponíveis. **Resolvida na V6** com o painel de 600 mm (faixa útil 470 mm).

---

## V3 — 29/10/2026 · Peltier traseira *(pacote do GPT-6)*

- Primeira tentativa de tirar o Peltier do teto, por causa do risco de condensado cair
  sobre o PTC.
- Sem apoios modelados.

---

## Como propor uma nova revisão

1. Mude a cota **no `cad_corte/parametros_v8.py`**, nunca no DXF. O bloco
   `_checa()` recusa carregar geometria incoerente — se ele reclamar, a cota
   está errada, não a checagem.
2. Rode `python cad_corte/gerar_cad_v8.py` e `python cad_corte/gerar_ferragens_v8.py`.
3. Rode `python cad_corte/valida_cad_v8.py` — tem de dar **0 erro**.
4. Rode `python analise_termica_tec.py` — qualquer mudança de volume, espessura
   ou número de Peltier muda o veredito térmico.
5. Se o validador acusar, a geometria não fecha: conserte a cota, não o validador.
6. Registre aqui o que mudou e por quê.
7. Se a mudança afetar dimensão externa, atualize os Docs 10, 12, 20 e o índice.
