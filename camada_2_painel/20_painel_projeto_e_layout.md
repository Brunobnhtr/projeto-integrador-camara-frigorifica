# Painel elétrico V12 — integração dos suportes e ventiladores

Permanece o gabinete **600×800×250 mm**, quatro trilhos DIN. A V12 muda os suportes internos das lâmpadas e a posição das duas fans dos dutos. A especificação elétrica de potência foi revisada desde esta versão e segue provisória: não comprar nem energizar o ramal do PTC.

## Mapa das saídas a verificar

- G2/P1: PTC proposto 12 V/50 W, **bloqueado** até definir fonte T3, corte DC independente, proteção, condutores e validação térmica; circuitos Peltier conforme dimensionamento vigente.
- G3/P3: 8 posições de ensaio em LED 12 V (9 a 11 mA cada) **independentes**, com o retorno passando pelo módulo de aquisição N4AIC24 (22 canais de corrente + 2 de tensão, Modbus RTU) montado no painel — só 8 canais de corrente em uso. O positivo de cada posição vem do BD-12V pela sua chave no bloco de 8 porta-fusíveis seccionáveis (F-P). As tensões das barras de 24 V e 12 V entram nos canais V1 e V2 do próprio módulo, sem divisor externo.
- G4/P2: **duas fans internas dos dutos** + **duas fans frias do conjunto Peltier**, além das ventoinhas quentes externas, cada qual com proteção/fonte de tensão nominal e opcional tacômetro conforme hardware.
- G5/P4: sensores de temperatura, umidade e sobretemperatura; cabeamento de baixa tensão segregado dos atuadores.

A furação de G1..G6 em PNL-05 permanece apenas em GRAVACAO. T2 24→5,0 V/5 A e T3 24→12 V/20 A também são propostas, não itens aprovados: confirmar modelos, fichas, entrada máxima/transientes, capacidade contínua e térmica. Não energizar nem adaptar bitola/fusível sem medir corrente nominal, capacidade dos conectores e componentes. A interface elétrica do gabinete com a câmara ainda depende da documentação de sensores e do dimensionamento de cabos. Desenhos anteriores V11 preservados.
