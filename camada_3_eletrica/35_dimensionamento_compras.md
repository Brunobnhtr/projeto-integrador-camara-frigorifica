# Dimensionamento para compra - revisão 23/10/2026

> ⚠️ **DOCUMENTO HISTÓRICO — não usar como lista de compra.**
> Esta página foi calculada sobre a **câmara V4** (290 × 110 × 260 mm) e uma base de
> **1400 × 600**, nenhuma das duas existe mais. A geometria vigente é a da V7:
> câmara de **300 × 200 × 250 internos (15,0 L)**, corpo de 310 × 205 × 260, base de
> **1500 × 500**, painel de 600 × 800 × 250.
>
> As listas de compra válidas hoje são
> [`cad_corte/LISTA_FERRAGENS_E_MATERIAIS_V7.md`](../cad_corte/LISTA_FERRAGENS_E_MATERIAIS_V7.md)
> (materiais e ferragens) e o [Doc 30](30_forca_e_distribuicao.md) (potência).
> As tabelas de cabo abaixo continuam úteis como **referência de seção por função**,
> mas os comprimentos foram medidos em outra planta.

Base de pinus proposta: 1400 × 600 × 18 mm, apoiada em bancada. Câmara de acrílico: 290 × 110 × 260 mm (sem kit externo). Painel: 700 × 700 × 250 mm (proposto).

50 margem + 700 painel + 150 separação + 400 envelope reservado para câmara e acessórios + 100 margem = 1400 mm. Profundidade: 100 frente + 300 envelope reservado + 200 traseira = 600 mm. Pinus 18 mm sobre bancada; validar rigidez e ancoragem do painel vertical, não constitui mesa com pés dimensionada.

## Premissas

- Estimativa de compra, não lista de corte definitiva. Rotas do desenho em mm; não usar posições em pixels da vista antiga da câmara.
- Somar 0,20 m por condutor para terminações, 0,50 m para cada ligação à porta e 15% de margem coletiva. Arredondar compra por seção/função ao metro superior.
- Para cada condutor painel-câmara: 1,00 m de percurso externo reservado + rota interna modelada (ou 0,40 m para tampa). Confirmar após posicionar as peças.
- Cabo AC de entrada: proposta 3 m de cabo 3 vias, seção a dimensionar. A/B: comprar 2 m de cabo de um par trançado blindado, não dois fios avulsos.
- Não inclui fios já internos aos kits, nem duplicação de cabos de fans. Acrescentar 2 m de 0,75 mm² por cor para derivações internas de ventiladores e dois vínculos PE de 0,8 m cada; seção PE a definir.

## Cabos por seção e função

| Seção mm² | Função | Condutores | Cortes somados m | Comprar m |
|---|---|---|---|---|
| 1.5 | ac | 2 | 0.79 | 2 |
| 1.5 | pe | 1 | 0.65 | 1 |
| 1.5 | zero | 3 | 3.3 | 4 |
| 1.5 | srv24 | 2 | 1.07 | 2 |
| 0.75 | srv24 | 5 | 2.73 | 4 |
| 0.75 | zero | 2 | 0.93 | 4 |
| 0.75 | log5 | 1 | 1.38 | 2 |
| 0.75 | aux12 | 2 | 2.39 | 5 |
| 0.5 | srv24 | 14 | 20.68 | 24 |
| 0.5 | zero | 22 | 29.04 | 34 |
| 1.5 | pot24 | 7 | 10.46 | 13 |
| 0.5 | pot24 | 1 | 1.13 | 2 |
| 0.5 | log5 | 10 | 13.45 | 16 |
| 0.5 | aux12 | 3 | 6.35 | 8 |
| 0.25 | zero | 9 | 13.08 | 16 |
| 4 | zero | 1 | 1.73 | 2 |
| 0.25 | medida | 4 | 1.49 | 2 |
| 0.25 | srv24 | 1 | 1.17 | 2 |
| 0.25 | digital | 37 | 55.62 | 64 |
| 0.25 | log5 | 3 | 7 | 9 |

Cabo AC externo: 3 m de 3 vias, seção a definir. Cabo RS-485: 2 m de um par. PE gabinete/porta: mais 2 m, seção a dimensionar. Não somar os condutores internos de um cabo como metros de capa.

A caixa modular dos KA foi retirada. Montagem direta no trilho DIN, com peças mecanicamente compatíveis; envelope de reserva mantido até conferência real.

Fonte reproduzível: `painel_interativo/scripts/dimensiona_compras.mjs`, que lê os fios e os percursos ativos; detalhamento fio a fio em `tmp/pdfs/dimensionamento_compras.json`.

AC interno: arredondamento por cor comercial, 1 m de cada condutor ativo (2 m). Trilho: uma barra contínua de 3 m ou duas de 2 m; não três de 1 m.
