# CAMADA 1 · Doc 10 — Base da Maquete e Chão de Fábrica

> **Primeira coisa a construir.** Aqui se define o "terreno" da planta industrial: dimensões da base, divisão em zonas, rua externa, piso, demarcação de segurança e cenografia. Nada de eletrônica ainda.
>
> ✅ **Pré-requisito:** [Doc 02 — Arquitetura de Energia](../camada_0_fundamentos/02_arquitetura_de_energia.md) lido e entendido.
> 🖼️ **Desenhos:** [Planta baixa](../desenhos/01_maquete_planta.svg) · [Elevação](../desenhos/02_maquete_elevacao.svg)

---

## 10.1 O conceito: a energia caminha da esquerda para a direita

A maquete conta uma história em linha reta. Quem olha de frente lê o percurso da energia como se lesse um texto:

```
   ◄──────────────── FORA DA EMPRESA ────────────────►│◄────── DENTRO DA EMPRESA ──────►
                                                       │
  ┌────────────┐   ┌────┐   ┌────┐   ┌────┐            │   ┌──────────┐    ┌──────────┐
  │ SUBESTAÇÃO │───│ P1 │───│ P2 │───│ P3 │            │   │  PAINEL  │    │  CÂMARA  │
  │  127→24 V  │   │ P1 │   │ T2 │   │ T3 │            │   │  (CCM)   │    │   FRIA   │
  └────────────┘   └────┘   └────┘   └────┘            │   └──────────┘    └──────────┘
        ▲            ▲        ▲        ▲              MURO       ▲                 ▲
        │            └────────┴────────┴───────────────┼─────────┘                 │
        │                 ramal subterrâneo            │                           │
  ══════╪══════════════════════════════════════════════│═══════════════════════════╪══
        └──────────────── R  U  A ────────────────► PORTÃO      CHÃO DE FÁBRICA ───┘
           (carros, pessoas, iluminação pública)
```

> 🎯 **O muro com portão é o divisor narrativo.** À esquerda dele está a via pública: rua, carros, pessoas, iluminação pública e a rede de distribuição da concessionária. À direita está o interior da empresa: painel, chão de fábrica e câmara. O painel **já é** "dentro da empresa" — por isso a rua termina antes dele.

---

## 10.2 A base

| Característica | Especificação | Justificativa |
|---|---|---|
| **Dimensão** | **1500 × 500 mm** | Comporta o percurso completo em linha: rua + subestação + 3 postes + portão + painel + chão de fábrica + câmara |
| Material | MDF **12 mm** + travessas de reforço | 12 mm com reforço pesa menos que 15 mm maciço e fica igualmente rígido |
| **Travessas de reforço** | 3 tiras de MDF 15 × 40 mm, no sentido da largura, em X = 400, 750 e 1100 | Sem elas uma base de 1,5 m flexiona no meio |
| Moldura perimetral | Tira de MDF 15 mm × 40 mm de altura, nas 4 bordas | Enrijece, esconde a fiação e dá acabamento |
| **Vão livre inferior** | **40 mm** | ⚠️ **Essencial** — é por baixo que passa toda a fiação entre as zonas |
| Pés | 8 pés de borracha Ø 25 mm | 4 nos cantos + 4 alinhados com as travessas |
| Alças | 2 alças embutidas, nas laterais curtas | A maquete pesa ~18 kg montada |
| Acabamento | Fundo selador + pintura por zona (ver §10.5) | Asfalto na rua, cinza epóxi na fábrica |

> ⚠️ **Faça a moldura com o vão de 40 mm ANTES de qualquer outra coisa.** Se a base ficar maciça, não há por onde passar cabo nenhum, e os fios vão cruzar o chão de fábrica por cima.
>
> ⚠️ **As travessas não podem fechar o vão.** Recorte um entalhe de **20 × 25 mm** no meio de cada travessa para os chicotes passarem. Sem isso a base fica dividida em quatro compartimentos estanques e você não consegue levar cabo de uma ponta à outra.

### Versão modular (recomendada se o transporte for apertado)

Uma base de 1,5 m não entra no porta-malas da maioria dos carros. A solução é cortá-la **exatamente no muro**, em **X = 640 mm**:

| Módulo | Conteúdo | Dimensão |
|---|---|---|
| **A — Via pública** | Rua, subestação, 3 postes com transformadores | 640 × 500 mm |
| **B — Interior da empresa** | Portão, painel, chão de fábrica, câmara | 860 × 500 mm |

| Item | Especificação |
|---|---|
| União mecânica | 4 parafusos M6 com inserto, pelas travessas de topo dos dois módulos |
| **União elétrica** | **1 conector circular GX16 de 8 pinos** (macho no módulo A, fêmea no B) |
| O que atravessa | 6 fios: **24 V-POT** (+/−), 5 V (+/−), 12 V-AUX (+/−) — sobram 2 pinos de reserva |
| Alinhamento | 2 pinos-guia Ø 6 mm para os módulos casarem sem degrau |

> 💡 **Não é gambiarra — é como se faz.** Skids industriais e painéis grandes são montados em módulos e conectados em campo por conectores multipolares. Vale como argumento na apresentação: *"a maquete é modular porque a planta real também seria transportada em módulos"*.

---

## 10.3 Aberturas na base (fazer antes de pintar)

| Furo | Ø | Qtd | Posição (X, Y) | Função |
|---|---:|---:|---|---|
| Base dos postes de distribuição | 12 mm | 3 | (360, 265) · (475, 265) · (590, 265) | O tubo do poste é o eletroduto: os fios descem por dentro |
| Base dos postes de iluminação da rua | 8 mm | 3 | (150, 75) · (330, 75) · (510, 75) | Alimentação dos LEDs |
| Saída da subestação | 16 mm | 1 | (300, 330) | 3 ramais + retorno subindo para o P1 |
| **Entrada do painel — 24 V potência** | 12 mm | 1 | (740, 305) | Vem da **derivação do poste P1** (sem conversor) |
| **Entrada do painel — 5 V comando** | 10 mm | 1 | (800, 305) | Vem do T2 (poste P2) |
| **Entrada do painel — 12 V auxiliar + 24 V serviços** | 10 mm | 1 | (860, 305) | Vem do T3 e da derivação do poste P3 |
| Saída do painel → câmara | 20 mm | 1 | (1080, 330) | Chicote de potência e sinais (sobe para a eletrocalha) |
| Dreno da câmara | 10 mm | 1 | (1400, 330) | Tubo de silicone até o coletor |
| Fixação dos postes | 4 mm | 12 | 4 por poste | Insertos M4 |
| Fixação do painel | 5 mm | 4 | Cantos do painel | Insertos M5 |
| Entalhe nas travessas | 20 × 25 mm | 3 | Centro de cada travessa | Passagem dos chicotes |

> ⚠️ **Três entradas separadas no painel, não uma só.** Cada tensão entra pelo seu próprio prensa-cabo. Isso mantém a rastreabilidade (você sabe qual furo é qual sem abrir nada), evita chicote grosso demais no prensa-cabo, e separa fisicamente o cabo de **6,0 A em 24 V** dos cabos de sinal fraco.

---

## 10.4 Escala do projeto

Escala cenográfica **1:50**:

| Elemento | Tamanho na maquete | Equivalente real |
|---|---:|---|
| Postes de distribuição | 300 mm | 15 m |
| Postes de iluminação pública | 180 mm | 9 m |
| Largura da pista da rua | 150 mm | 7,5 m (duas faixas) |
| Calçada | 40 mm | 2,0 m |
| Muro da empresa | 50 mm de altura | 2,5 m |
| Portão | vão de 80 mm | 4,0 m |
| Figuras humanas | 35 mm | 1,75 m |
| Carro de passeio | 85 a 90 mm | ~4,3 m |
| Caminhão baú | 150 a 165 mm | ~8 m |
| **Painel, câmara e subestação** | **funcionais, tamanho real** | lidos como edificações |

> 📌 **Como justificar na defesa:** "É um **diorama didático de escala mista**. O cenário urbano e industrial está em 1:50 para dar a leitura de uma planta vista de cima; os subsistemas funcionais estão em tamanho real porque contêm componentes industriais verdadeiros."
>
> 💡 **Se só encontrar miniaturas 1:64** (Hot Wheels, Majorette), pode usar: um carro 1:64 tem 68 mm contra 88 mm do 1:50. A diferença existe, mas não incomoda no conjunto. **Não misture** 1:64 e 1:50 na mesma cena.

---

## 10.5 Planta baixa — coordenadas

**Origem no canto frontal esquerdo.** X cresce para a direita (0–1500), Y cresce para o fundo (0–500).

```
Y=500 ┌────────────────────────────────────────────────────────────────────────────────────┐
      │▓▓▓▓▓▓▓▓▓▓▓▓▓▓                                    ┌───────────────┐  ┌─────────────┐ │
      │▓ SUBESTAÇÃO ▓                                    │               │  │   CÂMARA    │ │
Y=400 │▓ ┌────────┐ ▓                                    │    PAINEL     │  │  FRIGORÍF.  │ │
      │▓ │FONTE   │ ▓                                    │  DE COMANDO   │  │             │ │
      │▓ │24V 240W│ ▓                                    │   400 × 200   │  │  336 × 176  │ │
Y=300 │▓ └────────┘ ▓                                    └───────────────┘  └─────────────┘ │
      │▓▓▓▓▓▓▓▓▓▓▓▓▓▓                                  ▒▓▒▓▒▓▒▓▒▓▒▓▒▓▒▓▒▓ zebrado NR-10    │
      │      ═══════════●━━━━━━━●━━━━━━━●              ║                                    │
Y=250 │  ── calçada ── P1      P2      P3   ── calçada ║░                                   │
      │              (deriv.)  (T2)    (T3)            ║░ guarita                           │
      │  ┌──────────────────────────────────────────┐  ║░                                   │
Y=180 │  │  🚚          faixa de pedestres          │  ║▓ ← MURO             CHÃO DE        │
      │  │- - - - - - - -║║║- - - - - - - - - - - - │  ║░   PORTÃO            FÁBRICA       │
Y=120 │  │        🚗                                │  ║▓                                   │
      │  └──────────────────────────────────────────┘  ║░                                   │
Y=80  │  ── calçada ──────────────────────────────────  ║                                   │
      │   ▮ poste    ▮ poste       ▮ poste               │                                   │
Y=0   └────────────────────────────────────────────────────────────────────────────────────┘
      X=0     200    400     600  │  800    1000    1200    1400  X=1500
                                MURO (X=640)
```

### Coordenadas exatas

| Zona | Elemento | X (mm) | Y (mm) | Altura |
|---|---|---|---|---:|
| **Externa** | Calçada superior (postes de distribuição) | 10 → 630 | 245 → 285 | — |
| **Externa** | **Pista da rua** | 10 → 630 | 95 → 245 | — |
| **Externa** | Calçada inferior (iluminação pública) | 10 → 630 | 55 → 95 | — |
| **Externa** | Pátio da subestação (cercado, com brita) | 10 → 300 | 285 → 490 | cerca 60 |
| **Externa** | Caixa da subestação | 25 → 285 | 295 → 485 | 150 |
| **Externa** | **Poste P1 + caixa de DERIVAÇÃO** (24 V potência, sem trafo) | 360 | 265 | 300 |
| **Externa** | **Poste P2 + transformador T2** (5 V comando) | 475 | 265 | 300 |
| **Externa** | **Poste P3 + transformador T3** (12 V auxiliar + 24 V serviços) | 590 | 265 | 300 |
| **Externa** | Postes de iluminação pública (3×) | 150 · 330 · 510 | 75 | 180 |
| **Externa** | Faixa de pedestres | 250 → 300 | 95 → 245 | — |
| **Limite** | **Muro da empresa** | 640 → 652 | 0 → 290 | 50 |
| **Limite** | **Portão corrediço** (vão aberto) | 640 → 652 | 120 → 200 | 50 |
| **Limite** | Guarita | 660 → 705 | 200 → 245 | 55 |
| **Interna** | **Painel de comando** | 690 → 1090 | 300 → 500 | 500 |
| **Interna** | Faixa zebrada NR-10 | 670 → 1110 | 270 → 300 | — |
| **Interna** | **Câmara frigorífica** | 1130 → 1466 | 310 → 486 | 326 (+80 do cooler) |
| **Interna** | Eletrocalha aérea (painel → câmara) | 1090 → 1180 | 380 → 400 | 180 |
| **Interna** | **Chão de fábrica** (área livre) | 670 → 1480 | 0 → 265 | — |

> 📏 **Confirme estas posições com os componentes reais em mãos** antes de furar. Apoie tudo sobre a base já pintada, ajuste até ficar bom, marque a lápis, **só então** fure.

---

## 10.6 A rua (zona externa)

A rua não é só decoração: ela é o que explica **de onde a energia vem**. Sem ela, a subestação e os postes ficam "flutuando" no nada.

### Estrutura

| Elemento | Especificação | Como fazer |
|---|---|---|
| **Pista** | 150 mm de largura (7,5 m) | Pintar de **cinza-asfalto escuro fosco** |
| **Faixa central** | Tracejado branco: traços de 12 mm com vãos de 12 mm | Fita branca 2 mm cortada, ou caneta posca |
| **Faixa de bordo** | Linha branca contínua, 2 mm, junto ao meio-fio | Fita ou posca |
| **Meio-fio (guia)** | Tira de MDF 3 mm × 4 mm de altura, pintada de branco | Colada na borda da calçada |
| **Calçadas** | 40 mm de largura, cinza claro, com risco de junta a cada 25 mm | Linha fina a lápis 2H antes do verniz |
| **Faixa de pedestres** | 6 faixas brancas de 8 mm, atravessando a pista | Fita branca |
| **Bueiro** | 2 retângulos 10 × 5 mm cinza escuro no meio-fio | Caneta |

### Elementos vivos da rua

| Elemento | Qtd | Posição sugerida (X, Y) |
|---|---:|---|
| Carro de passeio | 2 | (200, 140) e (430, 200) — sentidos opostos |
| Caminhão / van de entrega | 1 | (330, 195), entrando pelo portão |
| Pessoas na calçada | 3 | (180, 75) · (280, 265) · (520, 78) |
| **Postes de iluminação pública** | 3 | (150, 75) · (330, 75) · (510, 75) |
| Placa "PARE" | 1 | (245, 88) |
| Ponto de ônibus / abrigo | 1 | (100, 70) — opcional |
| Árvores | 3 | Ao longo da calçada inferior |
| Lixeira urbana | 1 | (400, 78) |

> ⚠️ **Os postes de iluminação pública são DIFERENTES dos postes de distribuição.** Iluminação: mais fino (Ø 5 mm), 180 mm, com braço curvo e luminária na ponta, na calçada da frente. Distribuição: Ø 8 mm, 300 mm, com cruzeta e isoladores, na calçada do fundo. Confundir os dois é o erro mais comum — e um professor de eletrotécnica percebe na hora.

### O muro, o portão e a guarita

| Elemento | Especificação |
|---|---|
| **Muro** | MDF 4 mm, 50 mm de altura, de Y = 0 a Y = 290, em X = 640. Pintado de cinza claro, com friso superior |
| **Portão corrediço** | Vão de 80 mm (4 m), aberto. Feito de arame 0,8 mm soldado/colado em grade, pintado de azul industrial |
| **Guarita** | Caixinha 45 × 45 × 55 mm, com janela recortada e luz interna (LED 3 mm branco) |
| **Placa da empresa** | Sobre o muro, ao lado do portão: nome fictício da planta |
| **Sinalização** | "VELOCIDADE MÁXIMA 10 km/h" e "USO OBRIGATÓRIO DE EPI A PARTIR DAQUI" logo depois do portão |

> 🎬 **É o portão que fecha a narrativa.** Na apresentação: *"aqui é a via pública, com a rede da concessionária; a partir deste portão começa a instalação do consumidor, e é ela que o nosso painel comanda."*

---

## 10.7 O chão de fábrica (zona interna)

### Acabamento do piso

1. **Lixar** o MDF (180 → 320) e remover todo o pó.
2. **Selar** com fundo/primer branco spray (2 demãos leves). MDF é poroso: sem selador a tinta mancha.
3. **Mascarar** a zona externa e pintar o chão de fábrica de **cinza claro fosco** (2–3 demãos, 15 min entre elas).
4. **Mascarar** a zona interna e pintar a rua de **cinza-asfalto escuro fosco**.
5. **Demarcar** com as fitas (tabela abaixo), só depois de 24 h de secagem.
6. **Envelhecer** (opcional): esponja quase seca com cinza escuro nas áreas de circulação.
7. **Verniz fosco** por cima de tudo (2 demãos leves).

> ⚠️ **Verniz fosco, nunca brilhante.** Piso brilhante reflete a luz do auditório e arruína as fotos.

### Demarcação de segurança (conteúdo técnico, não decoração)

| Cor / padrão | Onde aplicar | Significado normativo |
|---|---|---|
| **Amarelo/preto zebrado** 20 mm | Faixa de 30 mm à frente do painel, em toda a largura dele | **NR-10** — zona controlada de trabalho com eletricidade |
| **Amarelo contínuo** 10 mm | Contorno da área da câmara e do pátio da subestação | **NR-12 / NBR 7195** — delimitação de área de equipamento |
| **Amarelo contínuo**, duas faixas com 60 mm entre elas | Corredor do portão até a câmara | Corredor de tráfego de pessoas e empilhadeira |
| **Verde** 10 mm + setas | Do centro da fábrica até a borda frontal | Rota de fuga |
| **Vermelho** (quadrado 30 × 30 mm) | Sob o extintor | Equipamento de combate a incêndio — não obstruir |
| **Azul** 10 mm | Contorno da área de EPI, junto ao portão | Sinalização de ação obrigatória |

```
Demarcação em frente ao painel:

     ┌──────────────────────────────────────┐
     │          PAINEL DE COMANDO           │
     └──────────────────────────────────────┘
     ▓▒▓▒▓▒▓▒▓▒▓▒▓▒▓▒▓▒▓▒▓▒▓▒▓▒▓▒▓▒▓▒▓▒▓▒▓▒   ← zebrado (NR-10)
     ══════════════════════════════════════   ← 60 mm de corredor livre
     ──────────────────────────────────────   ← faixa amarela: limite do corredor
```

### Elementos do chão de fábrica

| Elemento | Como fazer | Posição (X, Y) |
|---|---|---|
| **Pallets** (3) | Tiras de palito de sorvete coladas, pintadas de bege | (760, 90) · (820, 60) · (900, 110) |
| **Empilhadeira** | Miniatura 1:50 ou bloco de MDF pintado de laranja | (950, 150) |
| **Tambores** (4) | Tarugo Ø 12 mm cortado em 20 mm, azul e vermelho | (1180, 80) |
| **Figuras com EPI** (4) | 1:50, capacete amarelo (operação) e branco (engenharia) | espalhadas |
| **Extintor + placa** | Cilindro vermelho Ø 4 × 12 mm sobre marcação vermelha | (700, 240) |
| **Eletrocalha aérea** | Perfil U de alumínio 15 mm sobre 3 mãos-francesas, a **180 mm** | (1090 → 1180, Y ≈ 390) |
| **Leito de cabo no chão** | Tela metálica fina pintada de cinza | Do painel até a borda |
| **Bancada de manutenção** | Bloco de MDF 60 × 25 × 20 mm | (1300, 120) |
| **Placas de sinalização** | Papel adesivo em haste de arame | ver §10.6 |

---

## 10.8 Roteamento da fiação por baixo da base

```
VISTA INFERIOR (esquemática — X cresce para a direita)

┌──────────────────────────────────────────────────────────────────────────────┐
│  [SUBESTAÇÃO]                                        [PAINEL]      [CÂMARA]  │
│       │                                                 ▲ ▲ ▲         ▲      │
│       │ 3 ramais + retorno                              │ │ │         │      │
│       └──►── sobe no P1 ──── P2 ──── P3                 │ │ │         │      │
│                  │            │       │                 │ │ │         │      │
│              P1 desce     T2 desce  T3 desce            │ │ │         │      │
│                  └────────────┼───────┼─────────────────┘ │ │         │      │
│                               └───────┼───────────────────┘ │         │      │
│                                       └─────────────────────┘         │      │
│                                                          └────────────┘      │
│   ▌travessa X=400      ▌travessa X=750      ▌travessa X=1100                 │
│   (entalhe 20×25)      (entalhe 20×25)      (entalhe 20×25)                  │
└──────────────────────────────────────────────────────────────────────────────┘

── Grupo POTÊNCIA (1,5 mm²) — corre pelo lado do FUNDO
·· Grupo SINAIS (0,25 mm²) — corre pelo lado da FRENTE, ≥ 50 mm separado
```

| Regra | Motivo |
|---|---|
| Fixar os cabos com abraçadeiras em presilhas adesivas a cada 80 mm | Cabo solto encosta na mesa e desgasta |
| **Separar ≥ 50 mm** potência de sinal | Reduz o acoplamento do chaveamento dos BTS |
| Cruzamentos sempre a **90°** | Minimiza a área de acoplamento |
| **Anilha de identificação nas duas pontas** | Manutenção — e é norma de painel |
| Deixar **50 mm de folga** em cada terminação | Permite refazer um terminal sem trocar o cabo |
| Cada saída de poste com **cor própria** | **24 V-POT vermelho** · 5 V laranja · 12 V-AUX amarelo |

---

## 10.9 Ordem de execução

```
 1. Cortar o MDF 1500 × 500 (ou os 2 módulos de 640 e 860 mm)
 2. Cortar a moldura e as 3 travessas de reforço, com os entalhes de 20 × 25 mm
 3. Marcar TODOS os furos da §10.3 com a planta na mão   ← antes de montar!
 4. Furar (broca-guia Ø 3 mm → alargar)
 5. Instalar os insertos rosqueados M4 / M5
 6. Montar moldura + travessas (cola PVA + parafusos) → vão de 40 mm confirmado
 7. Lixar, selar
 8. Mascarar e pintar: chão de fábrica cinza claro / rua cinza-asfalto
 9. Meio-fio, faixa central, faixa de pedestres e demarcações NR-10
10. Envelhecer (opcional) e envernizar
11. Colar a brita do pátio da subestação (cola PVA diluída 1:3)
12. Montar muro, portão e guarita
13. Instalar pés e alças
```

---

## 10.10 ✅ Checklist de aceitação

- [ ] Base 1500 × 500 mm cortada e esquadrejada (diagonais ± 2 mm)
- [ ] 3 travessas de reforço instaladas, **com entalhe de passagem**
- [ ] Moldura montada com **vão livre de 40 mm** confirmado com paquímetro nos 4 lados
- [ ] Todos os furos da §10.3 executados **antes** da pintura
- [ ] **3 entradas separadas** para o painel (**24 V-POT**, 5 V, 12 V-AUX)
- [ ] Insertos M4 / M5 instalados e testados com parafuso
- [ ] Rua pintada em cinza-asfalto, chão de fábrica em cinza claro, sem vazamento na máscara
- [ ] Meio-fio, faixa central tracejada e faixa de pedestres aplicados
- [ ] Faixa **zebrada NR-10** à frente do painel
- [ ] Corredor e rota de fuga demarcados
- [ ] Muro em X = 640 com portão de 80 mm e guarita
- [ ] Verniz fosco aplicado e curado
- [ ] 8 pés e 2 alças instalados; a maquete apoia sem balançar
- [ ] **Teste final:** passar um cabo de ponta a ponta por baixo da base, atravessando as 3 travessas, sem esforço

---

📄 **Anterior:** [Doc 03 — Lista de Materiais](../camada_0_fundamentos/03_lista_materiais.md) · **Próximo:** [Doc 11 — Subestação e Postes](11_subestacao_e_postes.md)
