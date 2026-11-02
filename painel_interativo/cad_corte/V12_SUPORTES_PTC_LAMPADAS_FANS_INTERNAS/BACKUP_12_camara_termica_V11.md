# Doc 12 — Câmara térmica compacta V11: Peltier duplo, sensores e passagens

**Revisão 29/10/2026 — estudo CAD, sem autorização de corte final.** Substitui o manual V10; V10 mantida como histórico.

## Dimensões

- Cavidade interna bruta: **300 × 200 × 250 mm = 15 L**.
- Corpo de acrílico de 5 mm: **310 × 210 × 260 mm**.
- EPS provisório de 1 mm: **298 × 198 × 248 mm ≈ 14,633 L**, antes de descontar os equipamentos.
- Dois dutos externos 40×40 mm: 390 mm de largura total; 422 mm incluindo os alojamentos inferiores de 56 mm.
- Painel elétrico separado 600×800×250 mm, quatro fileiras DIN. Nenhum BTS7960, Mega, ESP32, relé ou fonte vai dentro da câmara.

## Conjunto Peltier — duas ventoinhas frias de 40×40 mm

- Posição: parede **traseira superior**, tampa técnica removível **CAM-05 300×130×5 mm**.
- Duas ventoinhas do lado frio de **40×40×10 mm**, soprando para o interior. Ambas devem ser representadas individualmente.
- Pesquisa: o kit brasileiro DISSIPATEC COOLER DUPLO publica **2 ventoinhas 40×40×10 mm**, **2 dissipadores frios 40×25×70 mm**, dissipador quente **104×25×200 mm**. É um **modelo comparável**, NÃO comprova as medidas do kit AliExpress ID 1005010752595372.
- A **distância entre centros não foi publicada/confirmada** para o kit escolhido. No desenho, a distância provisória entre centros é **50 mm (lacuna 10 mm)**. É apenas estudo, NÃO um valor de corte.
- Se os dois ventiladores estiverem lado a lado, o passo centro-centro tem de ser pelo menos 40 mm para não se sobreporem. O dissipador, moldura, fiação e parafusos podem exigir mais.
- Projeção referencial de trabalho dentro da tampa: X 95..205, Z 160..235 mm; não equivale ao contorno real do kit. Se o conjunto real ocupar 200×104 mm na traseira, a altura disponível de 130 mm deixa somente 13 mm nominais em cada extremidade: conferir vedação/estrutura antes de cortar.
- **CAM-05 e ISO-09: somente o perímetro externo em CORTE. NENHUM furo/recorte Peltier liberado.** Ventoinhas e fixações em GRAVACAO.
- Lado quente e ventoinhas de dissipação quentes fora da câmara, com espaço livre ao redor; planejar rejeição térmica Qc+Pelétrica.

## Calha e dreno (preservados da V10)

- CAM-17: inox 1 mm, blank 150×70 mm, abas de 8 mm dobradas e cantos estanques, base inclinada; posição nominal X 75..225, Y 130..200, Z 148 mm.
- CAM-22: duas cantoneiras de apoio; passagem pela traseira por espigão/mangueira, totalmente independente das passagens elétricas.
- Dreno nominal Ø8 mm/parede Ø12 mm somente gravados na CAM-05: medir conexão e testar vedação/fecho hidráulico antes de furar.
- A calha definitiva deve abranger TODAS as superfícies frias sujeitas a condensação, não apenas as duas ventoinhas. Revisar a calha quando o kit real for medido.

## Entradas dos cabos — parte FIXA da traseira CAM-04

Coordenadas **X,Z em milímetros no quadro interno bruto** (X 0..300; Z 0..120):

| Ref | Centro X,Z | Diâmetro desenhado | Função | Status |
|---|---|---|---|---|
| P1 | (35, 96) | Ø16 | PTC 24V e proteção térmica | Só gravado |
| P2 | (35, 28) | Ø16 | 2 fans de duto + 2 fans frias; tach somente se 3 fios | Só gravado |
| P3 | (265, 28) | Ø12,5 | lâmpadas W5W 12V: dois circuitos de medição individual | Só gravado |
| P4 | (265, 96) | Ø12,5 | sensores de temperatura/umidade, baixa tensão | Só gravado |

**As roscas e diâmetros de perfuração dependem do prensa-cabo real.** Essas quatro aberturas são na **CAM-04** para que o cabeamento permaneça instalado quando a CAM-05 for retirada. O isolamento da parte fixa (ISO-04) recebeu apenas marcas correspondentes. Os furos anteriores da V10 não devem ser reutilizados como se fossem definitivos.

- Levar chicotes externos pelo lado traseiro, com curvas para pingos (alça abaixo da entrada), abraçadeiras e alívio de tração.
- Distinguir chicote 24V PTC, 12V ventoinhas, 12V W5W e sinais de sensores.
- Fazer conectores de manutenção no **lado seco externo**, fora da trajetória do condensado e do dissipador quente. Identificar P1..P4 nas duas extremidades.
- Dentro: fixar cabos em guias laterais afastadas do PTC, dissipador frio, calha e hélices, sem perfurar acrílico desnecessariamente. Evitar pressionar isolante com parafusos.
- **Não levar rede 127/220 VAC para o interior da câmara.**

## Sensores — pontos de estudo, ainda sem furos específicos

| Sensor | Referência X,Y,Z (mm) | Objetivo |
|---|---|---|
| S1 AM2315C ou sensor do projeto confirmado | (150, 65, 115) | medir ar no volume de ensaio, fora dos jatos diretos |
| S2 retorno lateral / DS18B20 opcional | (278, 135, 210) | observar estratificação e falha de circulação |
| S3 limite de aquecimento | (150, 125, 150) | monitoramento adicional junto à região quente; montagem térmica real a conferir |
| Sensor do dissipador quente | **fora da câmara** | sobretemperatura do Peltier, com cabo separado |

O documento antigo Doc 32 cita DS18B20 e AM2315C em revisões diferentes. **Verificar modelo real e protocolo antes de concluir os conectores**. O termostato bimetálico de corte do PTC deve ser um dispositivo de segurança independente, instalado no lugar apropriado conforme ficha técnica e ensaio, não substituído por um sensor de software.

## PTC, dutos e ensaio

- PTC provisório 110×30×20 mm com saída de ar para BAIXO; proteção contra contato com EPS/acrílico por defletor e barreira térmica apropriados; corte térmico independente.
- Duas W5W 12V/5W, cada uma com circuito de medição próprio (ACS712 no painel; não dentro da câmara).
- Uma fan inferior em cada duto, soprando para cima; recirculação fechada; duas fans frias no Peltier são adicionais.
- O XPS/EPS e fita alumínio NÃO são incombustíveis. Classe do EPS e espessura real pendentes; fita de aluminio nao e barreira anti-incendio.
- A meta 5..50°C não foi demonstrada; validar com kit e isolamento adquiridos, calor das lâmpadas e dissipação quente.

## Status de corte

**Não fabricar** o recorte Peltier CAM-05/ISO-09, os quatro prensa-cabos CAM-04/ISO-04, os furos dos soquetes, acessórios de PTC e o dreno, até medir os componentes. As peças existentes só podem ser orçadas como estudo. Não confundir verificação de desenhos com validação estrutural/térmica.

## Fontes externas consultadas

- Kit de comparação (não o produto AliExpress): https://www.dissipatec.com.br/dissipadores-termoeletrico/refrigerador-termoeletrico-dissipador-com-2-peltier-12v-cooler-duplo
- Especificação típica TEC1-12706 40×40: https://www.tinytronics.nl/product_files/006495_Data_Sheet_of_TEC1-12706_Peltier_Element.pdf
- Anúncio escolhido, sem ficha dimensional confiável obtida: https://pt.aliexpress.com/item/1005010752595372.html
