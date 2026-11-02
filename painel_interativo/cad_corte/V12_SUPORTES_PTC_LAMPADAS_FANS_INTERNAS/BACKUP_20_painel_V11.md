# Doc 20 — Painel elétrico V11: posicionamento e cabeamento

**Dimensão vigente:** 600 × 800 × 250 mm (MDF 15 mm); quatro trilhos DIN e duas canaletas verticais, cinco horizontais. A posição exata e os suportes de cada módulo são **de estudo**, pois o equipamento de cada fornecedor pode não ter fixação DIN.

## Trilhos e componentes propostos (coordenadas Y da PNL-01)

| Trilho | Y | Componentes indicativos (referência do desenho) |
|---|---:|---|
| Superior T1 | 655 | blocos de distribuição BD-POT, BD-AUX, BD-24V, BD-5V, BD-0V, KM1 |
| T2 | 485 | dois drivers BTS7960 em suportes próprios, interface de intertravamento e proteção, ESP32 |
| T3 | 315 | Arduino Mega, ACS712 lâmpada 1, ACS712 lâmpada 2, RTC |
| Inferior T4 | 145 | bornes da câmara, bornes de sensores, área de expansão |

As medidas desenhadas são envelopes provisórios. Os sensores de corrente **ACS712 ficam no painel**, com o circuito de carga passando por eles; jamais pendurar a placa diretamente pelo fio, e nunca tratar um ACS712 de 5 A como apropriado para correntes maiores sem confirmar a variante. Retirar ou adaptar os módulos conforme especificação real.

## Entradas/saídas previstas na BASE PNL-05

| Ref | Centro X,Y na peça de 600×250 | Serviço |
|---|---|---|
| G1 | 70,125 | entrada de rede AC, zona isolada de baixa tensão |
| G2 | 165,125 | circuitos de potência 24 V |
| G3 | 265,125 | circuitos das duas lâmpadas em 12 V |
| G4 | 365,125 | alimentação/monitoramento das ventoinhas |
| G5 | 465,125 | sensores, I²C/1-Wire, baixa tensão |
| G6 | 550,125 | reserva, somente se necessária |

**PNL-05 contém apenas GRAVACAO dos centros dos prensa-cabos**: os diâmetros Ø20,5 / Ø15,5 / Ø12,5 são referências de estudo, e devem ser dimensionados conforme o produto. O trajeto final precisa de borrachas, vedação, ferragem, raio de curvatura, bornes e alívio de tração.

A fonte da arquitetura pode ficar na subestação conforme o Doc 30: o desenho do painel não equivale a mudar seu lugar. G1 só deve ser utilizado como entrada AC quando realmente houver rede na caixa; não introduzir AC em uma caixa exclusivamente 24V.

## Separação dos percursos

- Rede AC, se aplicável, por setor físico próprio. Dimensionar isolação, PE, fusíveis e proteção por profissional qualificado.
- 24V/12V de potência separados dos sinais de temperatura/I²C/1-Wire, respeitando recomendações dos fabricantes.
- Dois pares separados de alimentação das W5W para medição individual: L1+/- e L2+/-. Roteamento por bornes TB-L1, TB-L2 e retorno comum apenas onde permitido pelo esquema real.
- Quatro fans possíveis: 2 do kit frio e 2 dos dutos; separar saídas e tach individual se as fans efetivamente tiverem terceiro fio. As ventoinhas quentes externas do kit ficam fora da câmara e precisam da alimentação prevista.
- Proteção das Peltier por monitoramento de dissipador quente e ventilação externa. O BTS7960 não é relé com bobina; a parada de segurança não depende somente de PWM/enable.

## Porta e manutenção

PNL-06 indica em GRAVACAO posição de IHM, LIGAR, RESFRIAR, AQUECER, FALHA e STOP. NÃO cortar antes de medir o equipamento, definir distância do trilho, dobradiças e validar a função do botão de parada; uma tecla de interface não substitui parada elétrica de segurança.

## Status

Trilhos e canaletas são desenho de estudo, não plano de ligação aprovado. **Furos novos de prensa-cabos e botões permanecem pendentes.** Conferir cargas, fios, relés, bornes e intertravamento antes de montar/energizar.
