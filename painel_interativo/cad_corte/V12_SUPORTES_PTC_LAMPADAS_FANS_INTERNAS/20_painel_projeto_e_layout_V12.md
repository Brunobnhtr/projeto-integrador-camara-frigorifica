# Painel elétrico V12 — integração dos suportes e ventiladores

Permanece o gabinete **600×800×250 mm**, quatro trilhos DIN. A V12 muda os suportes internos das lâmpadas e a posição das duas fans dos dutos, **não** a quantidade de drivers, a fonte ou a topologia da potência.

## Mapa das saídas a verificar

- G2/P1: PTC 24V (com proteção térmica independente do software), circuitos Peltier conforme dimensionamento existente.
- G3/P3: W5W 12V/5W **independentes**, com ACS712 para cada lâmpada montado no painel e as passagens de corrente adequadas.
- G4/P2: **duas fans internas dos dutos** + **duas fans frias do conjunto Peltier**, além das ventoinhas quentes externas, cada qual com proteção/fonte de tensão nominal e opcional tacômetro conforme hardware.
- G5/P4: sensores de temperatura, umidade e sobretemperatura; cabeamento de baixa tensão segregado dos atuadores.

A furação de G1..G6 em PNL-05 permanece apenas em GRAVACAO. Não energizar nem adaptar bitola/fusível sem medir corrente nominal, capacidade dos conectores e componentes. A interface elétrica do gabinete com a câmara ainda depende da documentação de sensores e do dimensionamento de cabos. Desenhos anteriores V11 preservados.
