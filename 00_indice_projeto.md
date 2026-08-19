# Projeto Integrador — Planta Industrial Didática com Câmara Frigorífica

## Índice Geral · Estrutura em Camadas de Construção

> Uma maquete funcional que representa uma **planta industrial completa**: entrada de energia em 127 V AC na subestação, distribuição em **24 Vcc** sobre postes, transformadores reduzindo para 12 V / 5 V / 3,3 V, painel de comando industrial e uma câmara térmica com controle PID, IHM e IoT.

---

## ⚡ A mudança desta versão

| Antes (v1) | Agora (v2) |
|---|---|
| Fonte ATX entregando 12 V e 5 V | **Fonte chaveada 24 Vcc + 3 conversores step-down** distribuídos na maquete |
| Sem disjuntor, só chave rotativa | **Disjuntor 2P 6 A curva C (acumula proteção e chave geral) + 3 fusíveis de ramal com seletividade** |
| Liga/desliga só por software | **Emergência corta a energia em hardware** (relé de interface KA1), START/STOP por software — pelo botão do painel **ou** pela IHM |
| Câmara térmica com Arduino | **Planta industrial em miniatura** onde a câmara é a carga do processo |
| 8 etapas soltas | **5 camadas de construção**, cada uma com checklist de aceitação |
| Documentos por assunto | **Documentos na ordem em que se constrói** |

> 📌 **Por que trocamos a ATX:** ela **não possui trilho de 24 V** e seus trilhos compartilham o mesmo GND — não dá para associar dois de 12 V em série. Justificativa completa em [Doc 02 §2.1](camada_0_fundamentos/02_arquitetura_de_energia.md).

---

## 🗺️ Mapa da cadeia de energia

```
127 V AC ─────[Q0 · 2P 6 A curva C]─────► FONTE 24 Vcc 240 W   ◄── SUBESTAÇÃO
                                            │                      (única parte com 127 V)
                    ┌───────────────────────┼───────────────────────┐
                 [F1 10A]                [F2 2A]                 [F3 2A]
                    │ RM1                    │ RM2                    │ RM3
    ════════════════╪═══════════════════════╪═══════════════════════╪═════  LINHA COMPACTA
                    │ vermelho 1,0          │ marrom 0,5            │ cinza  sobre 3 POSTES
                    │        0 V azul 1,5 mm², 40 mm abaixo         │       (encapada!)
                    ▼                       ▼                       ▼
          POSTE P1 · DERIVAÇÃO      POSTE P2 · T2           POSTE P3 · T3   ◄── 2 TRAFOS
             SEM CONVERSOR            LM2596 + display        LM2596 + display   + 1 DERIVAÇÃO
             24 V passante            24 V → 5,10 V           24 V → 12,0 V
                    │                       │                       │
              desce por dentro do poste e segue por baixo da base
                    │                       │                       │
                  [KA2]                     │                       │        ◄── 3 ENTRADAS
                    ▼                       ▼                       ▼             SEPARADAS
                 BD-POT                  BD-5V                   BD-AUX      ◄── BLOCOS DE
              BTS #1 → 2× Peltier    Arduino / tela           coolers / fans     DISTRIBUIÇÃO
              BTS #2 → PTC 24 V      SD / RTC / lógica        LEDs / ESP32
                                                                              ◄── PAINEL + CÂMARA
```

---

## 📚 Documentos, na ordem de construção

### CAMADA 0 — FUNDAMENTOS
*Entender e comprar. Nada é construído ainda.*

| Doc | Arquivo | Conteúdo |
|---|---|---|
| 01 | [Visão Geral](camada_0_fundamentos/01_visao_geral.md) | Objetivo, arquitetura de controle, princípios térmicos, os 8 cuidados críticos |
| **02** ⭐ | [**Arquitetura de Energia**](camada_0_fundamentos/02_arquitetura_de_energia.md) | **127 V → 24 V → 12/5/3,3 V**, dimensionamento de correntes, escolha dos conversores, bitolas, queda de tensão, proteção contra falha do buck |
| 03 | [Lista de Materiais](camada_0_fundamentos/03_lista_materiais.md) | BOM completa, organizada por camada e por lote de compra |

### CAMADA 1 — MAQUETE
*A "obra civil". Cenário pronto, sem eletrônica.*

| Doc | Arquivo | Conteúdo |
|---|---|---|
| 10 | [Base e Chão de Fábrica](camada_1_maquete/10_base_e_chao_de_fabrica.md) | **Base 1500×500**, percurso linear da energia, **rua externa com carros e iluminação**, muro e portão, piso industrial, demarcação NR-10, roteamento por baixo |
| 11 | [Subestação e Postes](camada_1_maquete/11_subestacao_e_postes.md) | Caixa da subestação, pátio com brita e cerca, 3 postes com cruzeta e isoladores, 3 transformadores (um por poste) com leitor digital, rede compacta protegida |
| 12 | [Câmara Térmica](camada_1_maquete/12_camara_termica.md) | Cálculo de carga térmica, escolha do isolante, barreira de vapor, **porta dupla anticondensação**, dreno com sifão, 28 peças de acrílico |
| **13** ⭐ | [**Posições de Ensaio e Detecção de Falha**](camada_1_maquete/13_posicoes_de_ensaio.md) | **Os dispositivos energizados dentro da cabine, proteção individual por posição e detecção de dispositivo morto por medição de corrente (INA219)** |
| **14** ⭐ | [**Escala e cabeamento**](camada_1_maquete/14_escala_e_cabeamento.md) | **Quantos cabos entram no painel com 50 posições** — a resposta é 9, não 100. Quantos multiplexadores, onde a placa fica, e quando o RS-485 passa a ser necessário |

### CAMADA 2 — PAINEL
*Montagem mecânica. Nenhum fio ligado.*

| Doc | Arquivo | Conteúdo |
|---|---|---|
| 20 | [Painel de Comando](camada_2_painel/20_painel_projeto_e_layout.md) | Dimensionamento 400×500×200, layout dos 3 trilhos DIN cotado, layout da porta, furação, canaletas, ventilação |

### CAMADA 3 — ELÉTRICA
*A instalação. Energizado e medido, ainda sem firmware.*

| Doc | Arquivo | Conteúdo |
|---|---|---|
| 30 | [Força e Distribuição](camada_3_eletrica/30_forca_e_distribuicao.md) | Diagrama unifilar, 57 cabos identificados, distribuição no painel, roteiro de energização por trechos |
| 31 | [Comando e Proteções](camada_3_eletrica/31_comando_e_protecoes.md) | **Relé de interface KA1**, o que é hardware e o que é software, botoeiras, seletividade das proteções, aterramento, ensaios de segurança |
| 32 | [Sinais e Sensores](camada_3_eletrica/32_sinais_e_sensores.md) | Pinout completo do Mega, BTS7960, sensores, comunicação, **correção do pino de RPM**, ensaios de sinal |
| **33** 🔌 | [**Placa de Interface e Componentes Discretos**](camada_3_eletrica/33_placa_interface_componentes.md) | **Por que módulos prontos ainda exigem resistor e capacitor externos**, os 5 papéis desses componentes, ligação **perna por perna** de cada um, construção da placa PI-1 em caixa DIN, ensaios de verificação |

### CAMADA 4 — PROGRAMAÇÃO
*Firmware gravado e testado em bancada.*

| Doc | Arquivo | Conteúdo |
|---|---|---|
| 40 | [Firmware Arduino](camada_4_programacao/40_firmware_arduino.md) | Máquina de estados, PID bipolar com PWM lento, intertravamento, trip em hardware, diagnóstico de corrente, degelo, log em SD |
| 41 | [ESP32, IHM e IoT](camada_4_programacao/41_esp32_ihm_iot.md) | Protocolo JSON, gateway MQTT, telas da IHM, dashboard, segurança de rede |
| **42** 🧪 | [**Simulação e Testes sem Hardware**](camada_4_programacao/42_simulacao_e_testes.md) | **Simulador de bancada em Python, projeto Wokwi rodando o código real, Falstad para o circuito de comando** |

### CAMADA 5 — INTEGRAÇÃO
*Juntar tudo, comissionar e apresentar.*

| Doc | Arquivo | Conteúdo |
|---|---|---|
| 50 | [Montagem e Comissionamento](camada_5_integracao/50_montagem_e_comissionamento.md) | Ordem de integração, instalação na câmara, comissionamento em 6 ensaios, ensaios de desempenho, roteiro de apresentação, plano de contingência |

---

## 🖼️ Desenhos técnicos

| Desenho | Arquivo | Mostra |
|---|---|---|
| Planta baixa da maquete | [01_maquete_planta.svg](desenhos/01_maquete_planta.svg) | Vista de cima cotada, com todos os setores |
| Elevação da maquete | [02_maquete_elevacao.svg](desenhos/02_maquete_elevacao.svg) | Vista frontal com alturas |
| Detalhe do poste | [03_poste_detalhe.svg](desenhos/03_poste_detalhe.svg) | Cruzeta, isoladores, transformador, cotas |
| Layout do painel | [04_painel_layout.svg](desenhos/04_painel_layout.svg) | Backplate e porta, cotados |
| Diagrama unifilar | [05_diagrama_unifilar.svg](desenhos/05_diagrama_unifilar.svg) | Toda a cadeia de energia e proteções |
| Diagrama de comando ⭐ | [06_diagrama_comando.svg](desenhos/06_diagrama_comando.svg) | **Os dois selos (KA1 e KA2), o KA3 em série na bobina do KA2 e o que o Arduino pode e não pode fazer** |
| **Ligação dos relés KA1–KA4** ⭐ | [11_reles_ligacao.svg](desenhos/11_reles_ligacao.svg) | **Os quatro relés borne por borne, e os componentes discretos pendurados neles** (D1, R10, R11, D2). No painel interativo, clique num relé → *Ver o borne e os componentes nele*. Gerado do `painel_completo.js` |
| Corte da câmara | [07_camara_corte.svg](desenhos/07_camara_corte.svg) | Camadas de isolamento e circulação de ar |
| **Circuito da PI-1 (norma IEC)** ⭐ | [10_placa_pi1_circuito.png](desenhos/10_placa_pi1_circuito.png) | **Esquema elétrico com símbolos normalizados. Editável no navegador pelo arquivo `.cddx`** |

> Abra os `.svg` no navegador ou direto no VS Code. Para imprimir, use o navegador (Ctrl+P) — o SVG é vetorial e imprime em qualquer escala sem perder qualidade.

---

## 🖥️ O aplicativo do painel

O que era desenho parado virou aplicativo: `painel_interativo/` (React + Vite). Cada aba é uma
forma diferente de olhar o mesmo projeto, e **todas saem dos mesmos dados** — mudou o dado,
mudaram o desenho, o guia e a validação juntos.

| Aba | Responde |
|---|---|
| 🗺️ **A maquete de cima** | Por onde a energia entra e como chega até a câmara |
| 🔧 **Dentro do painel** | Todos os componentes e terminais em escala real; clicar num relé ou numa placa abre o desenho parafuso a parafuso |
| 🔩 **Componentes soltos** ⭐ | **Cada resistor, diodo e LED do projeto: onde ele mora, em que perna, se é em série ou de lado, e o que medir para provar que ficou certo** |
| 🧾 **Guia de montagem** ⭐ | **31 passos, da bancada ao ensaio final. Com o que pegar, o que fazer, o que conferir — e botão de imprimir para levar em papel** |
| 📐 **Montar a câmara** | Lista de corte em escala e a ordem de montagem do acrílico |
| ▶️ **Simulador** | Opere o painel: aperte os botões, injete falhas e veja o que acontece |

```powershell
cd painel_interativo
npm install
npm run dev        # abre em http://localhost:5173
npm run valida     # os 10 validadores — o mesmo que trava a publicação
```

### Onde mora a verdade

| Arquivo | Guarda |
|---|---|
| `src/data/painel_completo.js` | Os componentes do painel e todos os terminais |
| `src/data/fiacao*.js` | Os 126 fios, com as duas pontas, bitola, cor e rota |
| `src/data/pi1_fisico.js` · `pi2_fisico.js` | A geometria das placas, furo por furo |
| ⭐ `src/data/discretos.js` | **Todo componente que não é fio nem borne** — 23 registros, 29 peças, com pernas, polaridade, ensaio e passo |
| ⭐ `src/data/guia.js` | **A ordem de montagem**: fases, passos, ferramentas e conferências |

> ⚠️ **Número elétrico não se escreve em dois lugares.** Quando um valor está nos dados, o
> documento cita a decisão, não repete o número — foi assim que os 220 Ω dos postes acabaram
> virando 2,2 kΩ num documento e 220 Ω em outro. O `valida_discretos.mjs` agora vigia isso.

---


## 🔤 Como as coisas se chamam

⭐ **Um nome, um dono.** Até 18/08/2026 o projeto chamava três coisas diferentes de `R1`: um
resistor da PI-1, um ramal de energia e um ponto de retorno do BD-0V. Na bancada, "meça o R12"
podia significar duas peças diferentes. Ficou assim:

| Prefixo | O que é | Exemplos |
|---|---|---|
| `R`, `C`, `D` | **Componente discreto** — resistor, capacitor, diodo | `R1` 22 kΩ da PI-1 · `C3` 100 nF · `D1` na bobina do KA2 |
| `RS` | **Shunt** de medição de corrente | `RS1`, `RS2` — os 47 Ω da PI-2 |
| `RM` | **Ramal** de energia, na saída de cada fusível | `RM1` (potência) · `RM2` (5 V) · `RM3` (12 V) |
| `Z` | **Ponto de retorno** no BD-0V, um parafuso por dispositivo | `Z1` … `Z21` |
| `KA` | Relé | `KA1`, `KA2`, `KA3`, `KA4` |
| `H` | Sinaleiro | `H1` … `H4` |
| `S` | Botoeira | `S0` (emergência) · `S1` · `S2` · `S3` |
| `BD-` | Bloco de distribuição | `BD-24V` · `BD-POT` · `BD-5V` · `BD-AUX` · `BD-0V` |
| `J` | Borne de placa | `J1`, `J2` na PI-1 · `J1`–`J3` na PI-2 |
| `PI-` | Placa de interface | `PI-1`, `PI-2` |

> 🔎 **Onde conferir:** o cadastro `painel_interativo/src/data/discretos.js` usa a forma
> `PI1-R1` / `PI2-RS1` como identificador interno, para que dois componentes nunca disputem o
> mesmo nome nem por acidente. O `valida_discretos.mjs` avisa se uma ref voltar a ser usada por
> dois componentes.

---

## 🔢 Números do projeto (para o relatório)

| Grandeza | Valor |
|---|---|
| Tensão de entrada | 127 V AC |
| **Barramento de distribuição** | **24 Vcc** (SELV) |
| Potência instalada | 240 W (fonte) |
| Consumo calculado | **≈ 166 W / 6,9 A @ 24 V** |
| Folga da fonte de 240 W | **1,44×** — a fonte de 150 W não atende |
| Corrente AC de entrada | 2,37 A |
| Queda de tensão na linha dos postes | **0,21 V (0,86 %)** |
| Conversores | **2× LM2596 com display** (T2 e T3) · **P1 é derivação direta, sem conversor** |
| Tensões derivadas | **24,0 V (potência, direto)** · 12,0 V (auxiliar) · 5,10 V (comando) · 3,3 V (ESP32) |
| Fusíveis dos ramais | **F1 = 10 A · F2 = 2 A · F3 = 2 A** (sem F4/F5, sem crowbar) |
| Níveis de proteção | **5** (do disjuntor ao intertravamento por software) |
| Acionamento | **4 relés de 8 pinos, um modelo só** — KA1 (selo/emergência) + KA2 (potência) + KA3 (veto do firmware, NA) + KA4 (ventoinhas do radiador, **NF**) — emergência em hardware |
| Volume útil da câmara | 5,0 litros |
| Carga térmica calculada | **≈ 9,5 W** |
| Refrigeração | **2× TEC1-12706 em SÉRIE** · 24 V · 6,0 A · 144 W |
| Capacidade das Peltier a ΔT = 20 K | **~60 W** (margem de 6,3×) |
| Aquecimento | **PTC cerâmico de 24 V** · 80 W · 3,3 A |
| Componentes discretos | **6 + 1 CI (ULN2803) na placa PI-1** · 2 soldados nos BTS7960 · 4 nos postes da maquete (Doc 33) |
| Sinalização | **4 sinaleiros 22 mm de 24 V** no painel (via ULN2803, em barramento permanente) · **4 LEDs brancos de 5 V** na iluminação da maquete |
| Isolamento | XPS 30 mm + barreira de vapor · U = 0,86 W/m²·K |
| Porta | Dupla, U = 2,42 W/m²·K (não condensa) |
| Base da maquete | **1500 × 500 mm** · escala cenográfica 1:50 · rua externa + muro em X = 640 |
| Painel | 400 × 500 × 200 mm · 3 trilhos DIN |

---

## ✅ Progresso

### Camada 0 — Fundamentos
- [ ] Doc 01 lido e entendido
- [ ] Doc 02 lido — **arquitetura de energia entendida** (é o documento-chave)
- [ ] BOM fechada e Lotes A e B comprados

### Camada 1 — Maquete
- [ ] Base cortada, furada, pintada e demarcada
- [ ] Subestação montada e entregando 24,0 V
- [ ] Postes, linha e transformadores instalados e ajustados
- [ ] Câmara térmica montada, isolada e vedada

### Camada 2 — Painel
- [ ] Gabinete montado, furado e pintado
- [ ] 3 trilhos, canaletas e todos os componentes encaixados

### Camada 3 — Elétrica
- [ ] Força cabeada e testes 0–5 aprovados
- [ ] Comando cabeado e 10 ensaios de segurança aprovados
- [ ] Sinais cabeados e 10 ensaios de sinal aprovados

### Camada 4 — Programação
- [ ] Firmware do Arduino validado em bancada
- [ ] ESP32, tela ES3C28P e dashboard funcionando

### Camada 5 — Integração
- [ ] Comissionamento completo (ensaios A–F)
- [ ] 5 ensaios de desempenho com gráficos
- [ ] Apresentação ensaiada

---

## 📁 Estrutura de pastas

```
projeto integrador/
├── 00_indice_projeto.md              ← você está aqui
├── PLANO_REFATORACAO.md              o que está sendo refeito, e por quê
├── camada_0_fundamentos/             01 · 02 ⭐ · 03
├── camada_1_maquete/                 10 · 11 · 12 · 13 · 14
├── camada_2_painel/                  20
├── camada_3_eletrica/                30 · 31 · 32 · 33
├── camada_4_programacao/             40 · 41 · 42 · 43
├── camada_5_integracao/              50
├── painel_interativo/                ⭐ o aplicativo: dados, desenhos, guia e validadores
├── desenhos/                         desenhos técnicos em SVG
├── referencias/                      relatórios externos, guardados como fonte
├── imagens/                          fotos dos componentes comprados
├── gerar_planilha_bom.py             gera o Excel de compras a partir da BOM
└── BOM_Projeto_Integrador.xlsx       planilha gerada
```

> 📊 A planilha de compras é **gerada a partir do markdown**, não escrita à mão: editou a BOM no [Doc 03](camada_0_fundamentos/03_lista_materiais.md), rodou `python gerar_planilha_bom.py`, a planilha está atualizada. Não existe lista duplicada para sair de sincronia.

