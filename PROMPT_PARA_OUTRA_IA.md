# PROMPT DE VALIDAÇÃO EXTERNA — Projeto Integrador SENAI (câmara térmica didática)

> **Como usar:** copie tudo abaixo da linha e cole como primeira mensagem para a
> outra IA, junto com o acesso à pasta do projeto. Não é necessário resumir nada —
> o texto é autossuficiente.

---

## PAPEL

Você é engenheiro de projeto responsável pela **revisão final** de uma maquete
didática industrial. Sua tarefa tem quatro partes, nesta ordem de prioridade:

1. **Validar** todo o projeto e **encontrar erros e falhas** — elétricos,
   mecânicos, dimensionamento, documentação e dados.
2. **Atualizar** o que estiver desatualizado em: **câmara**, **painel**,
   **lista de compras** e **documentação**.
3. **Excluir** arquivos antigos e obsoletos, deixando só o que está vigente.
4. **Entregar um relatório** com o que encontrou, o que corrigiu e o que sobrou.

Não peça permissão para cada passo. Trabalhe, e relate no fim. Peça confirmação
**apenas** antes de apagar algo que não esteja claramente listado neste prompt
como descartável.

---

## 1. O QUE É O PROJETO

Maquete de planta industrial em escala, para o Projeto Integrador do curso
técnico do SENAI. Ela tem:

- uma **câmara térmica** com Peltier (refrigera) e PTC (aquece), controlada por
  PID, com HMI e IoT;
- um **painel elétrico** de 600 × 800 × 250 mm em MDF, com trilho DIN;
- uma **subestação/postes** em escala que representa a rede de 127 V;
- **8 posições de ensaio** dentro da câmara, que são o "produto sob teste" e o
  coração didático do projeto: cada posição tem a sua chave, o seu fusível e o
  seu canal de medição de corrente, e o sistema avisa quando uma morre.

### Arquitetura elétrica em 12 linhas

```
127 V AC ─► PS1 24 V / 240 W ─┬─► Peltier 2× em série (24 V, 5,2 A) via BTS7960
                              ├─► PTC 24 V via BTS7960
                              ├─► T2 LM2596 → 5,10 V (Mega, ESP32, relés, sinaleiros)
                              ├─► T3 LM2596 → 12,0 V (ventoinhas, posições de ensaio)
                              └─► N4AIC24 (24 V permanente) · Modbus RS-485
```

- Barramentos: `BD-POT` (24 V comutado), `BD-AUX` (12 V permanente),
  `BD-24V`, `BD-5V`, `BD-0V`, `BD-0V-B`, `BD-12V`.
- **N4AIC24**: 22 canais de corrente 0–20 mA (resolução 0,01 mA) + 2 canais de
  tensão 0–30 V. Modbus RTU 9600 8N1, ID 1, função 04. Alimentado em 24 V
  **permanente**. Os canais `V1`/`V2` medem o 24 V e o 12 V **sem divisor
  externo** — foi isso que aposentou o sensor de tensão POT-02.
- **MAX485** no `Serial3` do Mega: `RO→D15`, `DI→D14`, `DE/RE→D26` com
  pull-down de 10 kΩ.
- **8 posições de ensaio**: `T3 12 V → BD-12V → bloco de 8 porta-fusíveis
  seccionáveis (1 A por posição) → prensa-cabo PC-1 → placa PL-1/PL-2 →
  LED 5 mm + resistor 1 kΩ → prensa-cabo PC-2 → canal I1..I8 do N4AIC24 →
  COM → BD-0V-B`.
- ⚠️ **O retorno NÃO vai ao 0 V.** Ele atravessa o shunt interno do módulo — é
  essa passagem que produz a medida. Ligado direto na barra, a posição acende e
  o painel lê zero para sempre. Este é o erro mais fácil de cometer no projeto.
- Os 8 terminais `n−` do bloco de fusíveis ficam **vazios de propósito**.

---

## 2. HIERARQUIA DE VERDADE — leia antes de corrigir qualquer coisa

Quando dois arquivos discordarem, a ordem é:

1. **`cad_corte/parametros_v11.py` e `parametros_v12.py`** — as cotas reais da
   câmara, em milímetro. É a fonte da verdade geométrica.
2. **`placa_leds/gera_placa.py` e `gera_berco.py`** — geram DXF 1:1. O que está
   no DXF é o que se corta.
3. **`painel_interativo/src/data/*.js`** — o modelo elétrico (fios, bornes,
   rotas). É o que os validadores conferem.
4. **Os `.md` das camadas** — a narrativa didática. É o que mais atrasa.
5. **A vista da câmara no app** — é **esquemática**, NÃO está em escala.
   A parede desenhada tem 200 mm; a real tem 300. Não "conserte" o CAD para
   bater com o desenho do app.

**Dimensões da câmara (decore):** corpo 310 × 210 × 260 · **cavidade interna
300 × 200 × 250** (15,0 L) · isolamento EPS 1 mm · 2 dutos externos 40 × 40.

⚠️ Qualquer documento que fale em câmara de **410 × 390** ou **410 × 250 × 390**
está errado — esse tamanho não existe. Já foi corrigido em `PLACA_LEDS.md`, mas
pode ter sobrado em outro lugar.

---

## 3. ESTADO ATUAL (31/10/2026) — não redescubra o que já foi feito

O que mudou nas últimas revisões, e que você deve **assumir como correto**:

- A lâmpada automotiva **W5W saiu do projeto**. O dispositivo sob ensaio são
  **8 posições de LED em 12 V**, em 2 placas de **95 × 75 mm** (não 150 × 50 —
  duas de 150 lado a lado dariam 300 mm exatos e não entrariam na cavidade).
- As 2 placas ficam **penduradas** num berço de chapa (**CAM-26**), planificação
  **210 × 180**, uma dobra a 90° em y = 90 **para baixo**, pé de 210 × 90 com
  janela de 150 × 50, parafusado nas 4 cantoneiras **CAM-24** que já existiam.
  ⚠️ A dobra é para baixo porque a versão que subia (Z 115..190) atravessava o
  escudo do PTC em Z 185 — o berço fica em Y 115, dentro do Y 55..145 do escudo.
  `python placa_leds/gera_berco.py` imprime uma linha `OK —` ou aborta se colidir.
- **CAM-25 (bandeja das lâmpadas) e CAM-15 (suporte no teto) estão RETIRADAS.**
  Não reciclar esses códigos.
- Prensa-cabos: **PC-1 em PG13,5** (14 condutores, feixe 10,6 mm) e **PC-2 em
  PG11** (17 condutores, feixe 9,5 mm — um PG9 não fecha).
- Os 4 sinaleiros (ENERGIZADO, RESFRIANDO, AQUECENDO, **FALHA**) são de **5 V**,
  nos pinos `D9..D12`, com retorno comum no `GND` do Mega.
- Números vigentes: **15 componentes · 136 fios · 219 terminais com fio**.

### Comandos de validação (rode todos, em `painel_interativo/`)

```bash
npm run valida        # 8 validadores: autônomo, simulador, fiação, discretos,
                      # painel, câmara, rotas da câmara, desenho
npm run audita        # cruza componente × lugar × ensaio × passo × terminal
npm run valida:maquete
npx vite build        # tem que compilar
```

Estado de partida: **tudo verde**. Se algo falhar antes de você tocar em nada,
isso já é um achado — registre.

### Onde está o histórico das decisões

Antes de julgar qualquer coisa, leia o diário do projeto:

```
.workbuddy-ai/memory/2026-10-31.md    ← as decisões mais recentes
.workbuddy-ai/memory/2026-10-29.md
.workbuddy-ai/memory/2026-10-30.md
```

Ali estão registradas as decisões e **o motivo** delas (por que o PG9 subiu para
PG11, por que a PCB mudou de 150 × 50 para 95 × 75, por que o LED virou de
cabeça para baixo). Se você achar que uma dessas decisões está errada, discorde
com argumento — mas não a reverta por não entender.

---

## 4. O QUE VALIDAR (checklist)

### 4.1 Elétrica

- [ ] **Continuidade lógica**: todo fio com duas pontas em bornes que existem;
      todo borne usado com fio; nenhum nó com um ponto só.
- [ ] **Segregação**: potência e sinal não correm juntos; a medição cruza a
      potência em 90°.
- [ ] **O 0 V**: um ponto de 0 V por fio. O N4AIC24 tem **um único** borne de
      retorno, o `GND` (pinagem publicada: `VIN, GND, I1..I22, V1+, V2+, A+, B−`).
      **Não existe borne `COM`** — se algum desenho ou guia mostrar dois
      retornos no módulo, o desenho está errado. Ver Doc 13.
- [ ] **Corrente por canal**: 12 V com 1 kΩ → 9–11 mA. Confira se o resistor é
      1/4 W e se a dissipação (`I²R` ≈ 0,1 W) está folgada.
- [ ] **Bitola**: ramal das Peltier 24 V/6 A em 1,5 mm²; posições em 0,5 mm²;
      sinal em 0,25 mm².
- [ ] **Orçamento de carga**: 24 V = **170,6 W / 7,11 A**; 12 V = 15,9 W / **1,325 A**;
      5 V = 3,5 W / **0,695 A**. Confira rodando `npm run valida:energia` — a conta
      não é para ser refeita à mão.
- [ ] **Os dois ⚠️ do orçamento**: o T2 está a **99 % do cabo declarado** (0,695 A
      de 0,70 A) e o T3 a **88 % da corrente segura do LM2596**. Os dois são
      limites **declarados**, não físicos — medir corrente e temperatura dos
      dissipadores antes de fechar o painel (Doc 02 §2.4 e §2.7).
- [ ] **O caso que a fonte NÃO cobre**: BTS em curto + PTC comandado pede **9,30 A no
      F1** (que não abre — está abaixo dos 10 A) e **10,41 A na fonte**. ⚠️ **Não
      afirme que a fonte protege**: o comportamento dela em sobrecarga não foi
      medido. Quem encerra o cenário é a **cadeia térmica ST-1/ST-2**, que remove o
      PTC e devolve o ramal a 6,0 A. Ver Doc 02 §2.4 e §2.6.
- [ ] **A cadeia térmica do PTC existe de verdade?** ST-1 (KSD9700 NF 90 °C no
      corpo do PTC) e ST-2 (KSD9700 NF 70 °C na parede interna), **em série** com o
      aquecedor, dentro do chicote do PG13-2. Nenhum dos dois depende do Arduino.
      `npm run valida:seguranca` reprova se alguém tirar um deles.
- [ ] **Fusíveis**: 1 A por posição (protege o cabo de 0,5 mm², não o LED);
      F1 = 10 A, F2 = 2 A, F3 = 2 A.
- [ ] **Polaridade do LED na PCB**: o `+12 V` entra pela borda de baixo, então
      **ânodo embaixo, cátodo em cima**. Verifique no `gera_placa.py` e no DXF.

### 4.2 Câmara (mecânica)

- [ ] **Envelope**: o berço (Z 110..200, X 45..255) cabe sem bater na base do
      PTC (Z 225..230), na calha (Z 148..156, Y 130..200) nem no Peltier
      (Z 160..235, Y 155..200)? Refaça essa checagem do zero.
- [ ] **Fluxo de ar**: as placas não podem tapar a descida central nem as bocas
      dos dutos. A janela do pé do berço resolve? O sensor S1 (X150, Y145, Z95)
      está fora da sombra do berço?
- [ ] **Furação**: nenhum furo novo no acrílico além dos 2 prensa-cabos
      (20,5 e 18,6 mm). O pé do berço usa os 4 furos das cantoneiras CAM-24.
- [ ] **Dobras**: raio de dobra compatível com chapa de 1,0 mm de alumínio 5052.
- [ ] **Peças retiradas**: confirme que CAM-15 e CAM-25 não aparecem em nenhuma
      lista de corte vigente.

### 4.3 Painel

- [ ] **Trilhos**: todo componente tem lugar, e nenhum está em cima de canaleta.
- [ ] **Borne alcança a borda** e tem folga lateral.
- [ ] **Comprimento de canaleta** e ocupação dos trilhos.
- [ ] **Etiquetas gravadas**: G1 rede AC, G2 potência 24 V, G3 posições 12 V,
      G4 ventiladores/tacômetros, G5 sensores, G6 reserva. ⚠️ Se ainda houver
      "G3 lâmpadas 12 V" ou "P3 LÂMPADAS", está desatualizado.
- [ ] **Dissipação**: 184 W a 43 °C no lado quente. O espaço atrás do painel
      aguenta? As ventoinhas externas estão dimensionadas para isso?

### 4.4 Lista de compras (`compras_projeto/dados.json` → `python compras.py build`)

- [ ] Nenhum item de lâmpada, soquete T10, W5W ou ACS712 sobrando como compra
      ativa. O que saiu deve estar marcado com o padrão do arquivo (🗑️ NÃO COMPRE).
- [ ] Quantidades batem com o projeto: 8 LEDs, 8 resistores de 1 kΩ, **8 bornes
      de 2 vias** (4 por placa, cada bloco partido em dois de 1 via), 1 placa
      ilhada 10 × 15 cm, chapa 250 × 200, 4 parafusos M4, 8 conjuntos M3.
- [ ] Todo item crítico tem o campo `conferir` preenchido com o que medir antes
      de comprar.
- [ ] Preços e links: os campos `opcoes`/`escolha` estão vazios. Se houver link,
      ele abre? O produto corresponde à especificação?
- [ ] Rode `python compras.py build` e confirme que `LISTA_COMPRAS.md` e
      `catalogo_compras.html` regeneram sem erro.

### 4.5 Documentação

- [ ] `00_indice_projeto.md` é o índice: todo link abre? Todo documento citado
      existe? Todo documento existente está citado?
- [ ] Cada `.md` das camadas 0..5: os números batem com o CAD e com o app?
- [ ] **Contradições conhecidas** (verifique uma por uma — algumas já foram
      corrigidas, outras não):

| Onde | O que pode estar errado |
|---|---|
| `camada_1_maquete/13_posicoes_de_ensaio.md` | Recebeu um aviso no topo, mas **o corpo inteiro ainda descreve W5W + ACS712 em A2/A3**. Decida: reescrever o corpo ou reduzir a um registro histórico |
| `camada_3_eletrica/32_mapa_cabos_sensores_V11.md` | Arquivo **V11** vivendo na pasta ativa. Pertence a `_obsoleto/` |
| `cad_corte/V12_.../12_camara_termica_V12.md` e `20_painel_projeto_e_layout_V12.md` | São cópias do pacote de entrega e **ainda falam de lâmpadas W5W** |
| `cad_corte/gerar_cad_v11.py`, `parametros_v11.py`, `valida_cad_v11.py` | São os geradores **ativos**, mas o nome diz v11 enquanto a geometria é V12. Dívida consciente: renomear quebra imports. Documente ou renomeie com cuidado |
| `cad_corte/parametros_v12.py` | Os **comentários** citam Z 371/366/319, de uma câmara de 390 mm que não existe. O **código** está certo (usa `H_NET`) |
| `cad_corte/parametros_v12.py` | As constantes `LAMP_*` (bandeja, soquete, cantoneiras) continuam lá descrevendo peça retirada |
| `placa_leds/PLACA_LEDS.md` §6 | Os feixes dos prensa-cabos foram calculados com o cabeamento antigo. Refaça a conta com o caminho novo (mais curto) |
| `00_indice_projeto.md` | Consumo sai de `src/sim/energia.js` (170,6 W, `npm run valida:energia`); carga térmica, de `analise_termica_tec.py` (10,5 W). Confira rodando os dois |
| Toda a documentação | A **potência do PTC não está definida** (100 W é hipótese). Isso contamina o ramal de 24 V, a fonte e a análise térmica. Aponte todos os lugares afetados |

### 4.6 Aplicativo (`painel_interativo/`)

- [ ] `npm run valida` verde, `npm run audita` verde, `npx vite build` compila.
- [ ] A vista da câmara é **esquemática** e agora diz isso na tela. Confirme que
      o aviso aparece e que o comentário do código não mente.
- [ ] Todo texto de componente que cite dimensão confere com o CAD (as placas
      citam 95 × 75 mm).
- [ ] Nada de `150 × 50`, `380 × 60`, `340` ou "distanciador de nylon" sobrando.

---

## 5. LIMPEZA DE ARQUIVOS — o que apagar e o que arquivar

**Regra de ouro:** *apagar* só o que é **recriável ou lixo**. *Arquivar* (mover
para `_obsoleto/`) tudo que é **trabalho humano irreversível** — CAD, desenho,
relatório, planilha preenchida à mão.

### 5.1 Apagar (lixo ou recriável)

| Item | Onde | Por quê |
|---|---|---|
| `desktop.ini` | **335 arquivos** espalhados por todas as pastas | lixo do Windows |
| `node_modules/`, `dist/` | `painel_interativo/` | recriáveis por `npm i` / `npm run build` |
| `__pycache__/`, `*.pyc` | qualquer pasta | recriáveis |
| `camada_0_fundamentos/*.pdf` | `04_maquete_vs_industria.pdf`, `05_estudo_comparativo_componentes.pdf` | gerados a partir do `.md` ao lado — confirme antes que ninguém depende deles impressos |
| `output/*.xlsx` com data no nome | `Componentes_SENAI_Escopo_Corrigido_2026-10-27.xlsx` | saída de script, datada e superada |
| `cad_corte/previas/*_V8.png` (**13 prévias**) | recriáveis pelo gerador |
| `BOM_Projeto_Integrador.xlsx` | raiz (já deletado, recuperável no git) | foi substituído pela lista de compras |

### 5.2 Arquivar em `_obsoleto/` (não apagar)

| Item | Por quê |
|---|---|
| `cad_corte/camara/03_montagem/*_V8.dxf` (**13 arquivos**: `VISTA_*`, `DETALHE_*`, `CORTE_INTERNO`, `EXPLODIDA`, `CIRCULACAO_DE_AR`, `CONFERENCIA_ISOMETRICA`) | desenho é irreversível |
| `cad_corte/camara/03_montagem/DETALHE_LAMPADA_V8.dxf`, `DETALHE_BANDEJA_LAMPADAS_V12.dxf` | peças retiradas — ficam como registro |
| `camada_3_eletrica/32_mapa_cabos_sensores_V11.md` | documento V11 na pasta ativa |
| `CAM-24_cantoneiras_lampadas.dxf`, `CAM-25_bandeja_lampadas.dxf` (pacote V12) | peça retirada |

⚠️ **Não apague `_obsoleto/`** — ela existe de propósito e tem `LEIA-ME.md`
explicando quando pode ir fora. Quem decide isso é o usuário, depois da montagem.

⚠️ **Não apague a pasta `2026 - KIT PROJETO INTEGRADOR - ALUNO-...` (195 MB).**
É o material que o SENAI forneceu, não é artefato do projeto.

⚠️ **Não apague `.workbuddy-ai/`** — guarda o histórico do projeto.

### 5.3 O Drive é um espelho — atenção

O projeto está sincronizado com esta pasta do Google Drive:

```
https://drive.google.com/drive/folders/1wPMP0RPdfn__m8Z0eT-ySMG4p7s5o-mv?usp=sharing
```

Ela contém **a mesma árvore** (inclusive `_obsoleto`, `.git` e as camadas).
Portanto **tudo que você apagar aqui desaparece lá também**. Antes de qualquer
exclusão em lote, confirme que o que você está apagando está na lista acima.

---

## 6. REGRAS DE TRABALHO

1. **Commit antes de apagar.** O repositório git está com **62 arquivos
   modificados não commitados** (o último commit é `9208b19`). Faça um commit do
   estado atual primeiro, para que qualquer exclusão seja reversível. Não use
   `git reset --hard` nem `git checkout --` para "limpar" — isso apaga trabalho.
2. **Nunca invente medida.** Se não dá para saber a cota de uma peça comprada
   (Peltier, soquete, PTC, prensa-cabo), escreva **"MEDIR"** e marque como
   pendência. O projeto inteiro segue a convenção de não furar nada antes de ter
   a peça na mão.
3. **Ao corrigir um número, corrija em todos os lugares.** Um valor aparece no
   CAD, no `.js` do app, no `.md` e no `dados.json`. Mudar um só cria a
   contradição que você está tentando eliminar. Use `grep` para achar todos.
4. **Depois de mexer em dados do app, rode os validadores.** Se um validador
   falhar, o problema é o seu dado, não o validador — a não ser que o validador
   esteja testando uma arquitetura que já morreu (aí corrija o validador e diga
   por quê).
5. **Nada de exclusão recursiva ampla.** Sem `rm -rf`, sem `del /S /Q`, sem
   wildcard em pasta pessoal. Apague arquivo por arquivo ou por lista explícita.
6. **Preserve o tom didático.** Os documentos explicam *por que*, não só *o quê*.
   Ao reescrever, mantenha a explicação do erro que aquilo evita — é o que dá
   nota no projeto.

---

## 7. O QUE ENTREGAR

Um relatório em Markdown, com:

### 7.1 Tabela de achados

| # | Severidade | Área | Arquivo:linha | O que está errado | Corrigido? |
|---|---|---|---|---|---|
| 1 | 🔴 crítico / 🟡 médio / 🟢 cosmético | elétrica / câmara / painel / compras / docs / app | caminho | descrição objetiva | sim / não / pendente de medição |

**Critério de severidade:**
- 🔴 **crítico** — queima componente, não cabe, não mede, ou induz a montar errado.
- 🟡 **médio** — número errado que confunde, documento que contradiz outro.
- 🟢 **cosmético** — texto, formatação, nome de arquivo.

### 7.2 O que foi atualizado

Lista de arquivos alterados, com uma linha explicando cada mudança.

### 7.3 O que foi apagado e o que foi arquivado

Duas listas separadas, com a contagem e o tamanho liberado.

### 7.4 O que sobrou e por quê

Pendências que dependem de peça física, de decisão do usuário ou de medição.
Seja específico: "a potência do PTC não foi definida, então o ramal de 24 V está
subdimensionado por definição" é útil; "faltam ajustes" não é.

### 7.5 Estado final

```
npm run valida      → 8/8 OK
npm run audita      → 15 componentes · 136 fios · 219 terminais
npm run valida:maquete → OK
npx vite build      → OK
```

Se algum número mudou, diga qual e por quê.

---

## 8. O QUE **NÃO** FAZER

- Não redesenhe a câmara do app em escala. É trabalho separado, já mapeado:
  reposicionar 12 peças, 2 prensa-cabos e recalcular 26 rotas. Se quiser propor,
  proponha — mas não faça pela metade.
- Não troque o N4AIC24 por outro módulo, nem o Modbus por I²C/analógico.
- Não reintroduza lâmpada, ACS712, ULN2803, divisor de tensão ou DB25.
- Não "conserte" o CAD para bater com o desenho esquemático do app.
- Não mexa em `_obsoleto/` além de receber arquivos.
- Não apague o kit do SENAI nem `.workbuddy-ai/`.
- Não invente links, preços ou disponibilidade de produto. Se não verificou,
  escreva "não verificado".
