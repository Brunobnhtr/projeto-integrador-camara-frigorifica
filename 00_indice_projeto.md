# Projeto Integrador — Planta Industrial Didática com Câmara Frigorífica

## Índice Geral · Estrutura em Camadas de Construção

> Uma maquete funcional que representa uma **planta industrial completa**: entrada de energia em 127 V AC na subestação, distribuição em **24 Vcc** sobre postes, transformadores reduzindo para 12 V / 5 V / 3,3 V, painel de comando industrial e uma câmara térmica com controle PID, IHM e IoT.

> ⚠️ **Status desta revisão:** a corrente simulada do PTC e a leitura BTS2 IS/A1 são estados separados. Se IS não sinaliza, o curto pode continuar sem alarme; se o contato de potência KM1 solda, o trip de firmware não retira BD-POT. A medição independente do BTS e um corte DC independente do KM1 permanecem requisitos de engenharia, sem componentes/topologia aprovados. Os trechos do Documento 40 foram alinhados para PWM por timer e duty aplicado, mas ainda não formam um `.ino` consolidado e compilado. O permissivo de ventilação é hipótese, não sinal instalado; o modelo não calcula temperatura superficial nem dispara ST-1/ST-2. O PTC segue não liberado para energização até validar proteções físicas, termostatos, ventilação e temperaturas do acrílico.
>
> ⛔ **Proposta elétrica bloqueada:** T2 24→5,0 V/5 A, T3 24→12 V/20 A e PTC 12 V/50 W ainda não têm modelos/fichas aprovados. Confirmar a tensão máxima/transientes de T2; definir corte DC independente, F3 e condutores do PTC; validar proteção térmica. KM1 não corta o novo ramal de 12 V. Não comprar nem energizar o PTC.
>
> 📊 A planilha [BOM_Projeto_Integrador.xlsx](BOM_Projeto_Integrador.xlsx) já existia com alterações locais e não foi regenerada nesta revisão. O parser da BOM foi conferido: itens explicitamente bloqueados de T2/T3/PTC ficam fora da lista de compra. A planilha não libera ST-1/ST-2 nem substitui as validações físicas da aba **Divergencias**.

---

## ⚡ A mudança desta versão

| Antes (v1) | Agora (v2) |
|---|---|
| Fonte ATX entregando 12 V e 5 V | **Fonte chaveada 24 Vcc + T2/T3 propostos**; modelos dos conversores ainda pendentes |
| Sem disjuntor, só chave rotativa | **Disjuntor 2P 6 A curva C (acumula proteção e chave geral) + 3 fusíveis de ramal com seletividade** |
| Liga/desliga só por software | **Emergência corta a energia em hardware** (relé de interface KM1, com selo), START/STOP por software — pelo botão do painel **ou** pela IHM |
| Câmara térmica com Arduino | **Planta industrial em miniatura** onde a câmara é a carga do processo |
| 8 etapas soltas | **5 camadas de construção**, cada uma com checklist de aceitação |
| Documentos por assunto | **Documentos na ordem em que se constrói** |

> 📌 **Por que trocamos a ATX:** ela **não possui trilho de 24 V** e seus trilhos compartilham o mesmo GND — não dá para associar dois de 12 V em série. Justificativa completa em [Doc 02 §2.1](camada_0_fundamentos/02_arquitetura_de_energia.md).

---

## 🗺️ Mapa da cadeia de energia

```
127 V AC ─────[Q0]─────► PS1 24 Vcc / 10 A / 240 W
                              ├── BD-POT (24 V, comutado por KM1) ── BTS1 ── Peltier
                              ├── T2 proposto: 24→5,0 V / 5 A ── BD-5V (modelo pendente)
                              └── T3 proposto: 24→12 V / 20 A ── serviços 12 V
                                                                  └── PTC 12 V/50 W proposto
                                                                      corte DC/F3/fiação pendentes
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
| **04** ⭐ | [**Maquete vs. Indústria**](camada_0_fundamentos/04_maquete_vs_industria.md) | **Escalabilidade Tecnológica:** Como migrar do kit didático para as placas de chão de fábrica (ESP32-P4, Arduino Giga R1, Portenta) com RTC nativo, Ethernet, SD e TCs industriais. |
| 05 | [Estudo Comparativo e Catálogo de Componentes](camada_0_fundamentos/05_estudo_comparativo_componentes.md) | **Dossiê de Hardware:** Análise de alternativas de componentes (Arduino vs ESP32, TCs vs Efeito Hall, Radar vs Ultrassom) e registro de viabilidade comercial. |

### CAMADA 1 — MAQUETE
*A "obra civil". Cenário pronto, sem eletrônica.*

| Doc | Arquivo | Conteúdo |
|---|---|---|
| 10 | [Base e Chão de Fábrica](camada_1_maquete/10_base_e_chao_de_fabrica.md) | **Base 1500×500**, percurso linear da energia, **rua externa com carros e iluminação**, muro e portão, piso industrial, demarcação NR-10, roteamento por baixo |
| 11 | [Subestação e Postes](camada_1_maquete/11_subestacao_e_postes.md) | Caixa da subestação, pátio com brita e cerca, 3 postes com cruzeta e isoladores, 3 transformadores (um por poste) com leitor digital, rede compacta protegida |
| 12 | [Câmara Térmica](camada_1_maquete/12_camara_termica.md) | Cálculo de carga térmica, escolha do isolante, barreira de vapor, **porta dupla anticondensação**, dreno com sifão, 28 peças de acrílico |
| **13** ⭐ | [**Posições de Ensaio e Detecção de Falha**](camada_1_maquete/13_posicoes_de_ensaio.md) | **Os dispositivos energizados dentro da cabine, proteção por posição e detecção de dispositivo morto.** Dividido em duas escalas: a **Bancada (Maquete)** com 8 posições de LED em 12 V, módulo N4AIC24 em Modbus RS-485; e a **Planta Real (Indústria)** com sensores não-invasivos e laços de 4-20 mA para CLPs |
| **14** ⭐ | [**Escala e cabeamento**](camada_1_maquete/14_escala_e_cabeamento.md) | ⚠️ **Histórico.** O raciocínio original de cabeamento, mantido para consulta. A arquitetura de escala real hoje se resolve com barramentos RS-485 ([Doc 13](camada_1_maquete/13_posicoes_de_ensaio.md)) |

### CAMADA 2 — PAINEL
*Montagem mecânica. Nenhum fio ligado.*

| Doc | Arquivo | Conteúdo |
|---|---|---|
| 20 | [Painel de Comando](camada_2_painel/20_painel_projeto_e_layout.md) | Modelo React do painel 600×800×250; conferir medidas reais antes de fabricar |

### CAMADA 3 — ELÉTRICA
*A instalação. Energizado e medido, ainda sem firmware.*

| Doc | Arquivo | Conteúdo |
|---|---|---|
| 30 | [Força e Distribuição](camada_3_eletrica/30_forca_e_distribuicao.md) | Arquitetura e cabos; instruções antigas de T2/T3/PTC estão bloqueadas até seleção e dimensionamento |
| 31 | [Comando e Proteções](camada_3_eletrica/31_comando_e_protecoes.md) | **A cadeia de comando e o selo do KM1**, o que é hardware e o que é software, botoeiras, seletividade das proteções, aterramento, ensaios de segurança |
| 32 | [Sinais e Sensores](camada_3_eletrica/32_sinais_e_sensores.md) | Pinout completo do Mega, BTS7960, sensores, comunicação, **correção do pino de RPM**, ensaios de sinal |
| **33** 🔌 | [**Placa de Interface e Componentes Discretos**](camada_3_eletrica/33_placa_interface_componentes.md) | Componentes discretos atuais, seus pontos de ligação e ensaios; não há placas PI-1/PI-2 nem divisor D25 na arquitetura vigente |

### CAMADA 4 — PROGRAMAÇÃO
*Firmware gravado e testado em bancada.*

| Doc | Arquivo | Conteúdo |
|---|---|---|
| 40 | [Firmware Arduino](camada_4_programacao/40_firmware_arduino.md) | Máquina de estados, PID bipolar com **PWM de 20 kHz**, intertravamento, trip em hardware, diagnóstico de corrente, degelo, log em SD |
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
| Diagrama de comando ⭐ | [06_diagrama_comando.svg](desenhos/06_diagrama_comando.svg) | **A malha do selo: as duas paradas em série, o LIGAR em paralelo com o selo do KM1, o KA1 em série na bobina e o que o Arduino pode e não pode fazer** |
| **Ligação dos relés KM1–KA3** ⭐ | [11_reles_ligacao.svg](desenhos/11_reles_ligacao.svg) | **Os quatro relés borne por borne, e os componentes discretos pendurados neles** (D1, R10, R11, R12, D2, D3). No painel interativo, clique num relé → *Ver o borne e os componentes nele*. Gerado do `painel_completo.js` |
| Corte da câmara | [07_camara_corte.svg](desenhos/07_camara_corte.svg) | Camadas de isolamento e circulação de ar |
| **Circuito da PI-1 (norma IEC)** ⭐ | [10_placa_pi1_circuito.png](desenhos/10_placa_pi1_circuito.png) | **Esquema elétrico com símbolos normalizados. Editável no navegador pelo arquivo `.cddx`** |

> Abra os `.svg` no navegador ou direto no VS Code. Para imprimir, use o navegador (Ctrl+P) — o SVG é vetorial e imprime em qualquer escala sem perder qualidade.

### 📐 Pacote de corte — o que vai para a oficina

> [`cad_corte/`](cad_corte/LEIA-ME.md) não é desenho de apresentação: são os **arquivos
> de corte** da câmara (acrílico) e do painel (MDF), em DXF, **milímetro, escala 1:1**,
> com furos, recortes e identificação em camadas separadas (`CORTE` corta,
> `GRAVACAO` grava, o resto é desenho). Abre no Fusion 360 como sketch, no AutoCAD, no
> LibreCAD e no software da laser/router.

| | Câmara (V12) | Painel |
|---|---|---|
| Peças | **25 CAM + 9 ISO** em `cad_corte/camara/01_pecas/` — acrílico 2/3/5 mm, alumínio 1/2/3 mm, inox 1 mm, EPS 1 mm · 🔴 **CAM-15 e CAM-25 RETIRADAS** | **6** (MDF 15 mm) |
| Envelope | **390 × 210 × 260 mm** — corpo de **310** + 2 dutos externos de 40 · **422 mm** com os alojamentos das ventoinhas | **600 × 800 × 250 mm** |
| Volume interno | **15,00 L** bruto · **14,63 L** útil (EPS de 1 mm) · **14,01 L livre** (conjunto do PTC + dissipador) | — |
| Conferência | `npm run valida` → **8 validadores** · `python placa_leds/testa_berco.py` → geometria do berço · ⚠️ `cad_corte/valida_cad_v8.py` **não vale mais** (foi para `_obsoleto/`) | idem |

> 📐 Os números acima saem de `parametros_v12.resumo()` — a mesma função que o CAD usa.
> ⚠️ O `analise_termica_tec.py` ainda importa os parâmetros **V11** e por isso imprime
> **14,09 L** livres em vez de 14,01. A diferença (0,08 L, 0,5%) é o volume do conjunto
> do PTC, que mudou entre as duas versões — não afeta nenhuma conclusão térmica.

> ✅ **Os dutos ficam para fora da câmara, e isso vem da V8.** A V7 os havia
> internalizado para a flange da ventoinha caber; isso comia 1,7 L do volume
> refrigerado e contrariava o desenho original. Na câmara vigente os dois canais de
> **40 × 40** ficam colados nas laterais — **310 + 40 + 40 = 390 mm** de largura
> total (422 com os alojamentos das ventoinhas), sem consumir volume útil. O encaixe da
> ventoinha passou a ser resolvido por um **alojamento de 56 × 56 × 50** com flange de
> **furo circular Ø36** (num canal de 40 os furos M3 de passo 32 cairiam a 2,4 mm da
> borda), o canal é **fechado no topo pela CAM-21**, o isolamento virou **8 modelos**
> cobrindo também os dutos, e entraram **duas comportas de renovação** separadas da
> recirculação. Tudo em [`HISTORICO_REVISOES_CAD.md`](HISTORICO_REVISOES_CAD.md).

> ✅ **A pendência de largura da V4 está resolvida.** O painel de 600 mm dá **470 mm**
> de faixa útil entre as canaletas verticais; a fileira mais carregada (T1, com os seis
> bornes e o KM1) usa **376 mm**. Sobram 94 mm.

> 🔴 **O que ainda impede o corte definitivo:** (1) o **vão do kit Peltier na
> tampa técnica (CAM-05) está em branco** — sem ele a câmara não refrigera, e a medida
> do conjunto montado não foi confirmada; (2) o **suporte das 2 placas (CAM-26)** foi
> simplificado para **tiras de alumínio com espaçadores M3** (sem chapa maciça, ar 100% desobstruído),
> apoiadas nas cantoneiras CAM-24; (3) **o modelo do PTC ainda
> não foi comprado**: a potência está fechada (**80 W · 3,3 A**, ver abaixo), mas as
> dimensões **110 × 30 × 20 mm são de estudo**, e o escudo CAM-14 e o suporte CAM-13
> foram desenhados em volta delas — conferir no PTC recebido antes de cortar;
> (4) a **espessura do isolamento (1 mm) é decisão registrada**, e nenhum EPS/XPS é
> incombustível; (5) o **dissipador quente** precisa rejeitar **184 W a 43 °C** e o
> modelo real ainda não foi escolhido. Detalhe na §12.10 do
> [Doc 12](camada_1_maquete/12_camara_termica.md).

> 🟢 **A limitação térmica de 40 L NÃO EXISTE MAIS — ela era da V8.** O texto antigo
> dizia que com 1 mm de EPS em **39,3 L** as duas Peltier paravam em +8,1 °C a 30 °C
> e o alvo de 5 °C não era atendido. A câmara de hoje tem **15,00 L brutos** (14,09 L
> livres) e o número mudou de lado: a análise térmica dá **−5,3 °C a 25 °C** e
> **+0,4 °C a 30 °C** de ambiente — o alvo de 5 °C é atendido **nos dois casos**, com
> 4,6 K de folga no pior deles. Rode `python analise_termica_tec.py`; os cenários 1 e
> 2 são exatamente essa conta. O que continua valendo é o **dissipador quente de
> 184 W**, esse não mudou.
>
> ⚠️ **Modelo não é ensaio.** Os −5,3 °C saem de hipóteses que só a bancada fecha:
> eficiência do dissipador (0,10 a 0,15 K/W), contato térmico da Peltier, vedação e
> o EPS de 1 mm. Um contato ruim come 10 a 20 K e o modelo não vê. **Aprovar 5 °C
> exige termopar no centro, ciclo real e 30 min de regime** — até lá, o que existe é
> previsão favorável, não resultado.

> 🟢 **A base de 1500 × 500 não precisa crescer.** Margem 50 + painel 600 + folga 60 +
> câmara 500 = 1210 mm, com 290 mm de sobra à direita — mesmo com os dutos externos.
> Ver [Doc 10](camada_1_maquete/10_base_e_chao_de_fabrica.md).

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
npm run valida     # os 8 validadores — o mesmo que trava a publicação
```

### Onde mora a verdade

| Arquivo | Guarda |
|---|---|
| `src/data/painel_completo.js` | Os componentes do painel e todos os terminais |
| `src/data/fiacao.js` | Os **133 condutores atualmente listados**, com as duas pontas, bitola, cor e rota |
| `src/data/pi1_fisico.js` · `pi2_fisico.js` | A geometria das placas, furo por furo |
| ⭐ `src/data/discretos.js` | **Todo componente que não é fio nem borne** — 23 registros, 29 peças, com pernas, polaridade, ensaio e passo |
| ⭐ `src/data/guia.js` | **A ordem de montagem**: fases, passos, ferramentas e conferências |

> ⚠️ **Número elétrico não se escreve em dois lugares.** Quando um valor está nos dados, o
> documento cita a decisão, não repete o número — foi assim que os 220 Ω dos postes acabaram
> virando 2,2 kΩ num documento e 220 Ω em outro. O `valida_discretos.mjs` agora vigia isso.

---


## 🎓 A entrega acadêmica — o que o SENAI cobra

> A pasta [`entrega_senai/`](entrega_senai/) guarda **as entregas do Projeto Integrador**, que
> são outra coisa do que a documentação técnica: resumo expandido, canvas, pitch, banner e a
> pesquisa formal. Comece pela [**TRILHA**](entrega_senai/00_TRILHA.md) — ela diz o que está
> pronto, o que falta e o que só você pode fazer.

| Entrega | Regra que não se quebra | Onde |
|---|---|---|
| **Resumo Expandido** | 600–700 palavras · Times 12 · sem figura no corpo | [`02_resumo_expandido/`](entrega_senai/02_resumo_expandido/) — ✅ **680 palavras**, e o `.docx` já sai do modelo oficial |
| **Canvas** | um dos dois, preenchido | [`03_canvas/`](entrega_senai/03_canvas/) — ✅ os dois prontos |
| **Vídeo Pitch** | 2–3 min · YouTube não listado · legendado | [`04_pitch/`](entrega_senai/04_pitch/) — roteiro cena a cena |
| **Vídeo do protótipo** | até 1 min 30 · narração + legendas | [`04_pitch/`](entrega_senai/04_pitch/) — ⚠️ é um **segundo** vídeo |
| **Banner** | 90 × 120 cm · lona com tubete | [`05_banner/`](entrega_senai/05_banner/) — textos prontos |
| **Pesquisa** | anterioridade (INPI) + similares + ABNT | [`01_pesquisa/`](entrega_senai/01_pesquisa/) |


## 🔤 Como as coisas se chamam

⭐ **Um nome, um dono.** Até 18/08/2026 o projeto chamava três coisas diferentes de `R1`: um
resistor da PI-1, um ramal de energia e um ponto de retorno do BD-0V. Na bancada, "meça o R12"
podia significar duas peças diferentes. Ficou assim:

| Prefixo | O que é | Exemplos |
|---|---|---|
| `R`, `C`, `D` | **Componente discreto** — resistor, capacitor, diodo | `R1` 22 kΩ da PI-1 · `C3` 100 nF · `D1` na bobina do KM1 |
| ~~`RS`~~ | ~~Shunt de medição~~ | 🗑️ os 47 Ω saíram com a medição analógica — o prefixo fica reservado |
| `RM` | **Ramal** de energia, na saída de cada fusível | `RM1` (potência) · `RM2` (5 V) · `RM3` (12 V) |
| `Z` | **Ponto de retorno** no BD-0V, um parafuso por dispositivo | `Z1` … `Z21` |
| `KM` | **Relé de POTÊNCIA** — quem chaveia a carga | `KM1` (6,0 A dos BTS + o selo) |
| `KA` | **Relé AUXILIAR** — comando e sinalização | `KA1` (veto) · `KA2` (fans do radiador) · `KA3` (fans internas) |
| `H` | Sinaleiro | `H1` … `H4` |
| `S` | Botoeira | `S0` (emergência) · `S1` · `S2` · `S3` |
| `BD-` | Bloco de distribuição | `BD-24V` · `BD-POT` · `BD-5V` · `BD-AUX` · `BD-0V` |
| `J` | Borne de módulo ou de placa | hoje só nos módulos comprados |
| ~~`PI-`~~ | ~~Placa de interface~~ | 🗑️ não há mais placa: os componentes moram em borne ou dentro de módulo |

> ⭐ **POR QUE `KM` E `KA` SÃO PREFIXOS DIFERENTES.** Os quatro são relés, mas fazem coisas de
> naturezas diferentes, e o nome diz qual: o **KM1** é o único que **chaveia potência** (6,0 A em
> 24 Vcc), tem **bobina de 24 V comandada pelas botoeiras** e **dois contatos** — um para a carga e
> um para o selo. Os **KA** são auxiliares de 5 V, acionados por um pino do Arduino, com **um**
> contato cada. É a mesma divisão de um painel industrial, onde `KM` é o contator e `KA` o relé
> auxiliar. Ver [Doc 31 §31.17](camada_3_eletrica/31_comando_e_protecoes.md).
>
> 🔧 **A numeração mudou** (o painel começava em `KA2`, porque o `KA1` original saiu da cascata):
> `KA2 → KM1` · `KA3 → KA1` · `KA4 → KA2` · `KA5 → KA3`.

> 🔎 **Onde conferir:** o cadastro `painel_interativo/src/data/discretos.js` usa a forma
> `BS1-C1` / `SV1-MODULO` como identificador interno, para que dois componentes nunca disputem o
> mesmo nome nem por acidente. O `valida_discretos.mjs` avisa se uma ref voltar a ser usada por
> dois componentes.

---

## 🔢 Números do projeto (para o relatório)

| Grandeza | Valor |
|---|---|
| Tensão de entrada | 127 V AC |
| **Barramento de distribuição** | **24 Vcc** (SELV) |
| Potência instalada | 240 W (fonte) |
| Consumo calculado pelo simulador (resfriamento) | **≈ 170,2 W / 7,09 A @ 24 V**; estimativa dependente dos rendimentos ainda não confirmados de T2/T3 |
| Folga teórica da fonte de 240 W | **≈ 1,41×**; não substitui confirmar conversores, proteções e condições térmicas |
| Ramal 5 V | Carga estimada de **≈0,7 A**; T2 proposto em 5 A, modelo e capacidade contínua pendentes |
| Ramal 12 V | Ventoinhas/serviços estimados em **1,325 A**; PTC proposto em 4,17 A adicionais. T3 20 A é apenas valor declarado, sem modelo/ficha aprovados; F3 legado de 2 A não foi dimensionado para esse conjunto |
| Ponto de operação real | a Peltier puxa **119 W / 4,96 A**, não os 144 W da placa — o modelo térmico devolve `Qh − Qc`. A folga no frio é **2,0×** |
| Pior caso de **falha** | O modelo pode manter o PTC energizado por falha do BTS2 mesmo após STOP/KM1. A corrente simulada não valida a proteção física; o corte DC, F3 e caminho térmico ainda não foram aprovados |
| Corrente AC de entrada | 2,50 A — **entrada máxima da fonte**, não o consumo calculado |
| Queda de tensão na linha dos postes | **0,21 V (0,86 %)** |
| Conversores | **T2 24→5,0 V/5 A e T3 24→12 V/20 A propostos**, sem modelos aprovados |
| Tensões derivadas | **24,0 V (potência da Peltier)** · 12 V e 5,0 V propostos, pendentes de validação · 3,3 V (ESP32) |
| Fusíveis dos ramais | **F1 = 10 A legado da Peltier**; F2/F3 e proteção de saída/corte DC do PTC precisam de dimensionamento |
| Níveis de proteção | **5** (do disjuntor ao intertravamento por software) |
| Acionamento | **4 relés** — KM1 (o selo e a potência, relé de 8 pinos) + KA1 (veto do firmware, NA) + KA2 (ventoinhas do radiador, **NF**) + KA3 (as 5 ventoinhas internas, NA), os três últimos módulos de 5 V numa caixa DIN 6M — emergência em hardware. 🗑️ **Nenhum módulo MOSFET no painel:** quem modula são os BTS7960 |
| Volume da câmara | **15,00 L bruto** · 14,63 L com o EPS de 1 mm · **14,01 L livres** (conjunto do PTC + dissipador, `parametros_v12.resumo()`) |
| Carga térmica calculada | **≈ 10,5 W** (9,5 W de base + 1 W dissipado pelas 8 posições de LED) |
| Refrigeração | **2× TEC1-12706 em SÉRIE** · 24 V · **6,0 A / 144 W na placa** (dimensiona cabo e fusível) · **4,96 A / 119 W no ponto de operação** (dimensiona a fonte) |
| Capacidade das Peltier a ΔT = 20 K | **~60 W** (margem de ~5,7× sobre 10,5 W) |
| Aquecimento | **PTC cerâmico de 24 V** · 80 W · 3,3 A |
| Componentes discretos | **16 registros / 22 peças, nenhuma soldada em placa** — 2 capacitores em borne, 3 nos bornes dos relés, 2 dentro dos BTS7960, 8 na maquete e na câmara, 3 módulos comprados (Doc 33) |
| Sinalização | **4 sinaleiros 22 mm de 5 V** no painel, acesos direto pelo pino do Arduino · **4 LEDs brancos de 5 V** na iluminação da maquete |
| Isolamento | **EPS 1 mm + acrílico 5 mm** (decisão registrada) · **U = 3,57 W/m²·K** — calculado por `analise_termica_tec.py` |
| Porta | **Acrílico de 5 mm** (CAM-07), uma chapa só · mesma U das paredes. ⚠️ Não é porta dupla |
| Base da maquete | **1500 × 500 mm** · escala cenográfica 1:50 · rua externa + muro em X = 640 |
| Painel | 600 × 800 × 250 mm · 4 trilhos DIN |

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
- [ ] Peças cortadas conforme `cad_corte/` (21 da câmara + 6 do painel)

### Camada 2 — Painel
- [ ] Gabinete montado, furado e pintado
- [ ] 4 trilhos, canaletas e todos os componentes encaixados

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
├── camada_0_fundamentos/             01 · 02 ⭐ · 03 · 04 ⭐
├── camada_1_maquete/                 10 · 11 · 12 · 13 · 14
├── camada_2_painel/                  20
├── camada_3_eletrica/                30 · 31 · 32 · 33
├── camada_4_programacao/             40 · 41 · 42 · 43 + firmware/ (código .ino)
├── camada_5_integracao/              50
├── painel_interativo/                ⭐ o aplicativo: dados, desenhos, guia e validadores
├── desenhos/                         desenhos técnicos em SVG
├── cad_corte/                        ⭐ DXF 1:1 para a área de corte (câmara + painel)
├── referencias/                      relatórios externos, guardados como fonte
├── imagens/                          fotos dos componentes comprados
├── gerar_planilha_bom.py             gera o Excel de compras a partir da BOM
└── BOM_Projeto_Integrador.xlsx       planilha gerada
```

> 📊 A planilha não se atualiza automaticamente. Depois de alterar o [Doc 03](camada_0_fundamentos/03_lista_materiais.md) ou o inventário React, rode `python gerar_planilha_bom.py` e confira a data de geração, a lista e a aba **Divergencias**. Preserve os links e preços manuais ao regenerar. A lista reconciliada continua contendo itens bloqueados que não podem ser comprados.
