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

## 3. Base das lâmpadas — CAM-24 e CAM-25 — e o berço que tomou o lugar delas

> 🔴 **REVISÃO DE 31/10/2026 — as lâmpadas saíram do projeto.** O dispositivo
> sob ensaio não é mais 2 × W5W: são **8 posições de LED em 12 V**, em duas
> placas de 95 × 75 mm. Toda a parte de soquete e de lâmpada desta seção está
> **retirada**; o que fica é a cantoneira CAM-24, reaproveitada como apoio do
> berço das placas. O caminho completo está em
> [`../placa_leds/PLACA_LEDS.md`](../placa_leds/PLACA_LEDS.md) §9.

- **CAM-24 (mantida):** quatro cantoneiras de alumínio, chapa plana **90 × 25 × 2 mm**, dobra 90° em X25; duas peças por lateral e **dois pontos M4 na parede por cantoneira**. Fixação lateral: centros em Y = **35 e 105 mm** e Z = **110 mm**, dois furos de parede por suporte com afastamento de 12 mm no eixo de profundidade. Ver CAM-03 e ISO-03 no DXF.
- **CAM-26 (otimizada — tiras aerodinâmicas):** suporte das duas placas de ensaio em **duas tiras/barras chatas de alumínio (210 × 20 mm)**, substituindo a antiga chapa maciça dobrada. As tiras são parafusadas nas **quatro cantoneiras CAM-24** (furos Ø4,5 mm para M4 a 10 e 200 mm de X), e as duas placas de 95 × 75 mm são fixadas com **espaçadores roscados M3 de 8 a 10 mm**.
  ⭐ **Passagem de ar 100% desobstruída:** A antiga chapa dobrada atuava como uma barreira física que bloqueava o fluxo de ar vertical descendo em direção às bocas dos dutos. Com as duas tiras finas e espaçadores M3:
  1. O ar de convecção forçada circula livremente pela frente, pelas laterais e por trás das placas, refrigerando os resistores e eliminando qualquer risco de zonas mortas de temperatura.
  2. Os espaçadores mantêm o verso das PCBs isolado das barras condutoras (zero risco de curto nas soldas).
  3. Elimina a necessidade de corte a laser especial e dobra em prensa: duas barras chatas cortadas com serra e furadas em bancada na própria oficina do SENAI.
- **CAM-25 (retirada):** antiga bandeja de lâmpadas. Não cortar. O suporte por tiras CAM-26 ocupa o vão no mesmo Z (110 mm) com fixação direta nas cantoneiras CAM-24.
- **CAM-15 (retirada na V12):** suporte de lâmpada no teto, da V11. **Não reutilizar o código.** CAM-07 continua sendo a porta; CAM-18/19 continuam sendo as peças das comportas.
- Passagens **P1 PTC**, **P2 fans** e **P4 sensores** na parte traseira fixa CAM-04: apenas GRAVACAO, sem furos definitivos. ⚠️ A gravação **P3 LÂMPADAS** não vale mais — o que atravessa a parede agora são **8 positivos** (PG13,5) e **8 retornos** (PG11), e não dois pares de lâmpada.

## 4. Peltier, calha, cabos e sensores

- Peltier duplo superior traseiro; duas fans frias 40 × 40 mm (adicionais às fans dos dutos). Distância centro-centro **50 mm só como referência**, não medição do kit.
- **CAM-05 e ISO-09 continuam BLANK**, somente perímetro em CORTE. Nunca furar o kit antes de medir.
- CAM-17 calha inox e CAM-22 apoios preservados, dreno traseiro pendente de adaptação medida.
- Passagens **P1 PTC**, **P2 fans** e **P4 sensores** na parte traseira fixa CAM-04: apenas GRAVACAO, sem furos definitivos.
- Sensor S1 foi deslocado para **X150,Y145,Z95**, fora da projeção metálica da bandeja e **abaixo do pé do berço** (que fica em Z 110). S2 e S3 permanecem pontos preliminares, ver `parametros_v12.py`.
- Painel preservado **600 × 800 × 250 mm** com quatro trilhos, ACS712 no painel, não na câmara; fontes, fusíveis, relés e BTS7960 externos ao volume térmico.

## 5. Corte e segurança

**Ainda NÃO liberar para fabricação definitiva:** kit Peltier e sua tampa, passagem real do dreno, suporte real do PTC/grampos e temperaturas locais, alojamento dos soquetes, fixação real das fans, prensa-cabos, dobra das cantoneiras, dobra da calha e desempenho 5–50 °C. Abertura circular lateral e M3 das ventoinhas V12 são dimensões nominais típicas: conferir o fan adquirido, para evitar trincas/folgas no acrílico.

Validar disponibilidade de EPS 1 mm e ficha de reação ao fogo; não considerar fita de alumínio como isolamento térmico contra contato com o PTC. A temperatura do ar a 50°C não limita o ponto mais quente do PTC.
