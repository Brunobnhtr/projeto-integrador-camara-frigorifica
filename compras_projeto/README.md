# Compras do projeto — câmara térmica + painel

Registro de tudo que precisa ser comprado: link, loja, valor, frete, foto do
anúncio e o ponto a conferir em cada peça.

> **Bloqueio de compra:** o PTC 12 V/50 W e os conversores T2 (5 V/5 A) e T3
> (12 V/20 A) são propostas sem modelos/fichas aprovados. Não comprar nem
> energizar. F3, a proteção da saída de 12 V, o corte DC independente do PTC
> e os condutores ainda precisam de dimensionamento. A lista registra o
> estado do projeto; não é autorização de compra.

## Fora da lista (o SENAI fornece)

Cabos de alimentação e de sinal · trilho DIN 35 mm · canaletas 30×30 e 25×25 ·
parafusos, porcas e arruelas · gabinete/painel · chapa de acrílico da câmara ·
bornes internos de distribuição (BD-24V, BD-POT, BD-5V, BD-AUX, BD-0V).

> ⚠️ Os **dispositivos que montam no trilho** continuam na lista (disjuntor,
> porta-fusíveis, barra PE, relé KM1 com base, suportes SPCI4) — o SENAI dá o
> trilho, não o que vai preso nele. Confirmar isso com o instrutor.

## Os 52 itens, em 9 blocos

| Bloco | O que é | Itens |
|---|---|---|
| 1 | Núcleo térmico da câmara | Peltier, dissipador, PTC, ventoinha de duto, AM2315C |
| 2 | Vedação e montagem | cola, silicone, fita de alumínio, EPDM, dobradiça, fechos, sílica, bandeja, respiro, pasta térmica, PG9, EPS |
| 3 | Elétrico da câmara | lâmpada W5W 24 V, soquete T10 |
| 4 | Controle e interface | Mega, adaptador DIN, ESP32, DNLCB30, IHM ES3C28P, microSD, conversor de nível, RTC, CR2032 |
| 5 | Sensores e potência | ACS712 ×2, sensor de tensão, DS18B20, BTS7960 ×2, suportes |
| 6 | Comando e proteção | KM1, módulos relé, botoeiras, sinaleiros, disjuntor, porta-fusíveis, fusíveis, barra PE |
| 7 | Alimentação | fonte 24 V 240 W, propostas T2 5 V/5 A e T3 12 V/20 A (bloqueadas) |
| 8 | Comunicação | antena 2,4 GHz, pigtail |
| 9 | Passivos | 100 nF, 10 kΩ, 1N4007 |

## Como registrar um link

```bash
# link do Mercado Livre com o preço que aparece no anúncio
python compras_projeto/compras.py add --id CAM-01 --loja ML \
    --link "https://produto.mercadolivre.com.br/MLB-..." --preco 189.90

# a mesma peça no AliExpress, para comparar
python compras_projeto/compras.py add --id CAM-01 --loja ALI \
    --link "https://www.aliexpress.com/item/....html" --preco 96.40 --frete 18.00

# decidir qual fica
python compras_projeto/compras.py escolher --id CAM-01 --loja ALI

# anexar print do anúncio (quando a foto não baixar sozinha)
python compras_projeto/compras.py print --id CAM-01 --loja ML --arquivo print.png
```

Depois de qualquer alteração, `LISTA_COMPRAS.md` e `catalogo_compras.html` são
regerados automaticamente.

## Por que o preço é digitado à mão

Mercado Livre e AliExpress bloqueiam leitura automática: a API do ML devolve 403,
a página de produto devolve tela de login ("negative_traffic") e o AliExpress
devolve HTML sem título nem `og:image`. O script tenta ler o preço do HTML e, se
não conseguir, avisa e espera `--preco`. A foto é baixada quando a URL da imagem
é conhecida (`--img`) ou vem de um print (`--print`).

## Estados

| Situação | Significado |
|---|---|
| a procurar | nenhum link salvo |
| link salvo | tem opção, falta decidir |
| ✅ escolhido | é a opção que vai para o carrinho |
| crítico | muda desenho ou desempenho — decidir antes de cortar o acrílico |

## O que trava o corte

Três itens do bloco 1 são pré-requisito do CAD: o **vão do kit Peltier na tampa
(CAM-05)** está em branco porque a medida do conjunto montado nunca foi
confirmada; o **dissipador quente** precisa rejeitar 184 W a 43 °C; e a
especificação física e elétrica do PTC ainda não foi fechada. Não comprar o
PTC nem cortar a montagem para ele até a arquitetura de potência, as proteções
e as dimensões serem aprovadas.

## Captura unificada (preço + frete + SKU)

Toda extração usa um único arquivo: `extrator_pagina.js`. O favorito do Brave, a extração em
segundo plano (`/api/extrair`) e a janela robô (`/api/escolher_ao_vivo`) rodam o mesmo código.

1. `python compras_projeto/servidor_compras.py` e abra `http://localhost:8000/lista_compras_interativa.html`.
2. Arraste **⭐ Capturar no Brave** para a barra de favoritos (refaça sempre que o extrator mudar;
   o link é gerado pelo servidor em `/api/bookmarklet`).
3. No card, clique em **📥 Capturar preço + frete + SKU**: o anúncio abre, o servidor pré-preenche
   só os campos vazios, e você escolhe a variação e clica no favorito — o que vier do favorito vale.

Frete: `frete = null` quando o anúncio não mostra o valor (por exemplo, sem CEP informado); nesse
caso o campo do card não é alterado. Limiares como "frete grátis acima de R$ 79" são ignorados.
