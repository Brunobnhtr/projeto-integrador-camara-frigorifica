# Projeto Integrador — V12: suportes físicos e duas fans internas

**Data:** 29/10/2026 · **Status:** geometria de estudo validada, NÃO liberada para fabricação definitiva.

## Dimensões preservadas

- Corpo em acrílico: **310 × 210 × 260 mm**, estrutura de 5 mm.
- Cavidade bruta: **300 × 200 × 250 mm, 15,000 L**.
- EPS interno de **1 mm provisório**, com fita aluminizada de vedação: volume geométrico antes dos equipamentos de aproximadamente **14,633 L**. Fita não torna o poliestireno incombustível.
- Dutos laterais **externos** 40 × 40 mm; largura incluindo dutos 390 mm; com plenums inferiores de 56 mm, largura máxima **422 mm**.

## 1. Duas ventoinhas de circulação dentro da câmara

**EXATAMENTE DUAS 40 × 40 × 10 mm para os dutos**, além das duas ventoinhas frias do Peltier. Cada uma é presa **na face INTERNA da parede lateral CAM-03**, junto da base, com rotor apontando lateralmente para o respectivo plenum externo. O ar sai pelos dutos de baixo para cima. As duas ventoinhas não ficam dentro dos plenums externos.

- Centro funcional de cada ventilador na lateral: **Y = 100 mm, Z = 29 mm** no sistema interno.
- Boca de entrada do duto: **circular Ø34 mm em CORTE na CAM-03**, com 4 furos Ø3,5 mm ao redor, passo entre centros 32 mm, sujeitos a gaxeta e ferragens reais.
- Corpo da fan de 40 mm ocupa aproximadamente Z = 9..49 mm e X próximo à face interna de cada lateral; evitar contato com o revestimento e o piso.
- A conexão fan-lateral exige vedação e acesso para retirar e limpar. Os **alojamentos externos de 56 × 56 mm são plenums de transição sem ventoinha**.
- Boca superior do duto permanece 40 × 40 mm, devolvendo o ar à câmara. Não existe troca intencional com o ar ambiente nesse circuito.

## 2. Base superior do PTC — CAM-12 + CAM-23

A orientação original **PTC soprando PARA BAIXO** foi preservada. Por segurança, a base fica suspensa na zona alta, em vez de apoiar um aquecedor sobre o piso com isopor.

- **CAM-12**: plataforma removível em acrílico **230 × 120 × 5 mm**, X = 35..265, Y = 20..140, Z = 225..230 mm.
- **CAM-23**: **16 placas 25 × 25 × 5 mm** que compõem **4 blocos de 25 × 25 × 20 mm**. Centro de cada pilha coincide com um tirante M4 de ROD_X/ROD_Y.
- Cada bloco deve ser mecanicamente atravessado por tirante, com arruelas e folga isolante apropriadas. **Não confiar somente em colagem ou EPS como suporte estrutural.**
- **CAM-13**: chapa metálica existente 160 × 90 × 2 mm; **CAM-14**: escudo existente 180 × 90 × 1 mm; grampos CAM-16.
- O PTC nominal de 110 × 30 × 20 mm só tem dimensão de estudo. O jato quente não pode atingir EPS/acrílico sem proteção apropriada. Verificar a proteção térmica independente do controle eletrônico.

## 3. Base das lâmpadas — CAM-24 e CAM-25

- **CAM-24:** quatro cantoneiras de alumínio, chapa plana **90 × 25 × 2 mm**, dobra 90° em X25; duas peças por lateral e **dois pontos M4 na parede por cantoneira**, além de um ponto M4 na bandeja. Raio de dobra não conferido.
- Fixação lateral: centros em Y = **35 e 105 mm** e Z = **110 mm**, dois furos de parede por suporte com afastamento de 12 mm no eixo de profundidade. Ver CAM-03 e ISO-03 no DXF.
- **CAM-25:** bandeja removível de alumínio **210 × 90 × 2 mm**, origem X45,Y25 e Z110; quatro furos M4 de fixação e quatro rasgos retangulares **20 × 4 mm**, para futura fixação de adaptadores de soquete.
- Marcas circulares dos **dois soquetes W5W de 12 V / 5 W** estão SOMENTE em GRAVACAO. Não perfurar alojamentos até conhecer os soquetes reais. Cada posição tem alimentação e medição de corrente independentes (ACS no painel).
- O antigo CAM-15 de suporte de lâmpada no teto está **retirado da revisão ativa**. CAM-07 continua sendo a porta; CAM-18/19 continuam sendo as peças das comportas. Não reutilizar códigos.

## 4. Peltier, calha, cabos e sensores

- Peltier duplo superior traseiro; duas fans frias 40 × 40 mm (adicionais às fans dos dutos). Distância centro-centro **50 mm só como referência**, não medição do kit.
- **CAM-05 e ISO-09 continuam BLANK**, somente perímetro em CORTE. Nunca furar o kit antes de medir.
- CAM-17 calha inox e CAM-22 apoios preservados, dreno traseiro pendente de adaptação medida.
- Passagens **P1 PTC**, **P2 fans**, **P3 lâmpadas** e **P4 sensores** na parte traseira fixa CAM-04: apenas GRAVACAO, sem furos definitivos.
- Sensor S1 foi deslocado para **X150,Y145,Z95**, fora da projeção metálica da bandeja. S2 e S3 permanecem pontos preliminares, ver `parametros_v12.py`.
- Painel preservado **600 × 800 × 250 mm** com quatro trilhos, ACS712 no painel, não na câmara; fontes, fusíveis, relés e BTS7960 externos ao volume térmico.

## 5. Corte e segurança

**Ainda NÃO liberar para fabricação definitiva:** kit Peltier e sua tampa, passagem real do dreno, suporte real do PTC/grampos e temperaturas locais, alojamento dos soquetes, fixação real das fans, prensa-cabos, dobra das cantoneiras, dobra da calha e desempenho 5–50 °C. Abertura circular lateral e M3 das ventoinhas V12 são dimensões nominais típicas: conferir o fan adquirido, para evitar trincas/folgas no acrílico.

Validar disponibilidade de EPS 1 mm e ficha de reação ao fogo; não considerar fita de alumínio como isolamento térmico contra contato com o PTC. A temperatura do ar a 50°C não limita o ponto mais quente do PTC.
