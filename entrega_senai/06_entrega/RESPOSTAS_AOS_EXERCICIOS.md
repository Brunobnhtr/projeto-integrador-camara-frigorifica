# Respostas aos exercícios dos cadernos do SENAI

> ⚠️ **Você tinha razão: havia perguntas que não estávamos respondendo.** Cada caderno da
> Biblioteca termina com um bloco de atividades ("Registro de Descobertas", "Redação
> Relâmpago", "Faça um roteiro"). Elas não são decorativas — são o rascunho que a banca espera
> ver por trás de cada entrega.
>
> Este documento responde **todas**, com o que o projeto já tem.

---

## 📕 Caderno **PESQUISA** — "Registro de Descobertas"

### 1 · Tecnologias encontradas — quais ferramentas ou métodos apareceram na pesquisa?

| Tecnologia / método | Onde já existe | O que fizemos com ela |
|---|---|---|
| **Controle PID de módulo Peltier com Arduino** | Kim *et al.* (2022); repositórios abertos | adotado — não reinventado |
| **Driver de potência BTS7960** | prática consolidada em automação | adotado pela saída `IS` de corrente, pelo driver de gate integrado e pelas proteções — ⚠️ **não** para inverter a pastilha, que neste projeto nunca inverte ([Doc 32](../../camada_3_eletrica/32_sinais_e_sensores.md)) |
| **Corrente contínua × PWM em TEC** | Texas Instruments SLUA979A (2020) | virou critério: PWM alto + filtro, não PWM lento |
| **Telemetria MQTT com ESP32** | padrão de IoT industrial | adotado para a supervisão remota |
| **Ensaio de burn-in com monitoramento de câmara** | KR102495025B1 (2023) | ⭐ é o mais próximo — mas vigia o ambiente, não os dispositivos |
| **Sensor de corrente por efeito Hall (WCS2702)** | componente comercial | ⭐ **é o que nos diferencia** — vira detector de dispositivo morto |
| **Registro com RTC + cartão SD** | prática comum em datalogger | adotado para a rastreabilidade |

### 2 · Diferencial da equipe — como a nossa solução se destaca do que já existe?

> **Controlar temperatura não é o nosso mérito** — a literatura já resolveu isso, e nós citamos
> quem resolveu. O nosso mérito é que **o ensaio deixa de ser cego**: cada posição tem um sensor
> de corrente, então o sistema diz **qual** dispositivo parou e **em que minuto** — e avisa sem
> ninguém estar diante da máquina. Nenhuma câmara do mercado faz isso, porque todas controlam o
> ambiente, não o que está dentro dele. Além disso, a solução **moderniza a cabine existente**
> por cerca de R$ 300, em vez de vender uma câmara nova de dezenas de milhares.

⭐ *O caderno diz que esta resposta "será a base da sua Justificativa no Resumo Expandido" — e é
exatamente o 2º parágrafo da nossa Introdução.*

### 3 · Palavras-chave — que termos técnicos novos apareceram e podem ser usados?

| Termo | O que significa | Onde usar |
|---|---|---|
| **Burn-in** | ensaio de vida acelerada, com o dispositivo energizado sob temperatura | pesquisa, pitch |
| **DUT** (*device under test*) | o dispositivo sob ensaio | documentação técnica |
| **Ciclagem térmica** | alternância controlada de calor e frio | resumo, banner |
| **Rastreabilidade** | poder reconstituir o que aconteceu, com data e hora | ⭐ palavra-chave do resumo |
| **Efeito Peltier** | refrigeração termoelétrica por junção semicondutora | resumo, pitch |
| **Retrofit** | modernizar equipamento existente em vez de substituir | canvas, pitch |
| **Ripple de corrente** | ondulação que degrada o rendimento do módulo TEC | justificativa técnica |
| **Fuga térmica** (*thermal runaway*) | o lado quente aquece, o ΔT some e a pastilha se destrói | segurança |
| **Categoria de parada** (ISO 13850) | 0, 1 ou 2 — como a máquina para | defesa do comando |

### 4 · Existe algo exatamente igual ao que vocês pensaram?

**Não.** A busca por classificação IPC (executada em 21/08/2026) mostrou:
`"burn-in board" + "failure detection" + "per device"` → **zero documentos**. Os mais próximos
estão tabelados em [`../01_pesquisa/02_anterioridade_e_similares.md`](../01_pesquisa/02_anterioridade_e_similares.md).

---

## 📗 Caderno **RESUMO EXPANDIDO** — "Redação Relâmpago"

### 1 · Qual problema real da indústria vocês identificaram?

> Ensaios térmicos de até cinquenta placas rodam sem supervisão e sem registro. Quando um
> dispositivo falha no meio do ciclo, ninguém percebe — a falha só aparece no fim, e aí não há
> como saber quando nem por quê. O ensaio inteiro é descartado.

✅ *Está no 1º parágrafo da Introdução.*

### 2 · Por que é importante resolver, e quais benefícios a solução trará?

> Três benefícios mensuráveis: o ensaio deixa de exigir presença física; cada evento passa a ter
> data e hora registradas; e a perda de um dispositivo é sinalizada em menos de um segundo,
> evitando o descarte de horas de ensaio.

✅ *Está no 2º parágrafo da Introdução.*

### 3 · O que vocês pretendem alcançar com este projeto? (objetivos)

✅ *Está no 1º parágrafo da Metodologia, e detalhado em objetivos SMART no
[Project Canvas](../03_canvas/PROJECT_CANVAS.md).*

### 4 · ⭐ Liste 3 competências técnicas do curso que estão sendo usadas

> **Esta era a pergunta que faltava.** É ela que faz do trabalho um Projeto **Integrador** —
> a integração entre unidades curriculares.

| # | Competência do Curso Técnico em Eletrotécnica | Onde ela aparece no protótipo |
|---|---|---|
| 1 | **Comandos Elétricos** — partida, selo, intertravamento e parada de emergência | a cadeia KM1 + botoeiras: o relé de selo se segura sozinho, e destravar o cogumelo não religa ([Doc 31](../../camada_3_eletrica/31_comando_e_protecoes.md)) |
| 2 | **Instalações Elétricas de Baixa Tensão** (NBR 5410 / NR-10) — dimensionamento de condutor, proteção, segregação e aterramento | a arquitetura 127 V CA → 24 V CC, os fusíveis por ramal, o ponto único de terra e a separação entre canaletas de potência e de sinal ([Docs 02 e 30](../../camada_3_eletrica/30_forca_e_distribuicao.md)) |
| 3 | **Automação e Controle de Processos** — malha fechada, sensores e atuadores | o PID com PWM de 20 kHz sobre a carga térmica, a leitura dos sensores e os intertravamentos em firmware ([Doc 40](../../camada_4_programacao/40_firmware_arduino.md)) |
| ➕ | *(bônus)* **Eletrônica e Microcontroladores** | ESP32 com MQTT, registro em cartão com RTC e a detecção de corrente por posição |

**E como o protótipo está sendo construído:** maquete funcional em escala reduzida, montada em
camadas — base e chão de fábrica, subestação e postes, câmara térmica, painel de comando,
fiação por etapas e comissionamento com ensaios de aceitação. Toda a documentação é gerada de
um modelo de dados, com validadores automáticos que conferem cada fio.

### 5 · Checklist ABNT — linguagem acadêmica, sem gírias e **sem primeira pessoa**

⚠️ **Este item pegou um erro real no nosso texto.** O resumo dizia *"Desenvolvemos uma
modernização…"* — primeira pessoa do plural, que o caderno proíbe. Já corrigido para
*"Foi desenvolvida uma modernização…"*.

✅ Verificação automática: **zero ocorrências** de primeira pessoa no corpo.

### 6 · Contagem prévia — quantas palavras já temos?

✅ **681 palavras** (limite: 600 a 700).

---

## 📘 Caderno **PITCH** — as 4 perguntas do roteiro

### 1 · O problema em uma frase, começando com algo impactante

> *"Uma placa eletrônica pode funcionar perfeitamente na bancada e falhar dentro de um caminhão
> a quarenta graus. É por isso que ela é testada no frio e no calor antes de ser vendida. Só que
> hoje, nesse teste, ninguém está olhando."*

✅ *É a abertura do roteiro (Cena 1).*

### 2 · A solução, explicada de forma simples

> *"A nossa solução não troca a máquina: ela dá visão a quem já tem uma."*

✅ *Cena 3.*

### 3 · O diferencial — por que é inovadora? O que ela tem que as outras não têm?

> Cada posição de ensaio tem um sensor de corrente. Se o dispositivo para de consumir, o sistema
> sabe **qual** parou — e avisa em menos de um segundo. As câmaras do mercado controlam o
> ambiente; nenhuma sabe o que aconteceu com o dispositivo lá dentro.

✅ *Cena 3, com reforço da segurança em hardware na Cena 4.*

### 4 · ⭐ Chamada — o que vocês querem que o espectador faça agora?

> **Faltava uma chamada de ação concreta.** A do roteiro era um fechamento, não um convite.
> Sugestão para a Cena 6:
>
> *"Venham ver o painel funcionando no laboratório da nossa unidade — e tragam uma placa para
> ensaiar. Em três minutos a gente mostra o sistema acusando qual posição falhou."*

📌 *Ajuste a Cena 6 do [roteiro](../04_pitch/ROTEIRO_PITCH.md) com esta chamada antes de gravar.*

---

## 📙 **GUIA PRÁTICO** — as 4 perguntas que todo protótipo precisa responder

| Pergunta (Guia §2.5) | Resposta do nosso protótipo |
|---|---|
| **Viabilidade de negócio** — o produto é financeiramente sustentável e tem mercado? | Sim: ~R$ 300 de material por máquina, contra o custo de um único ensaio descartado. Mercado: toda indústria de eletroeletrônicos que ensaia internamente |
| **Desempenho e estabilidade** — a solução funciona tecnicamente como deveria? | Malha fechada com banda morta de ±0,3 °C; validação automática de 105 condutores; ensaios de aceitação definidos no [Doc 50](../../camada_5_integracao/50_montagem_e_comissionamento.md) |
| **Aparência** — o design é adequado? | Painel em trilho DIN com identificação em cada borne, canaletas segregadas por classe e maquete cenográfica que explica a planta a quem nunca viu uma |
| **Usabilidade** — o usuário interage de forma intuitiva? | IHM local com estado do ensaio; botoeiras convencionais de painel (verde liga, preto para, cogumelo emergência); acompanhamento remoto pelo celular |

**Nível de prototipagem:** ⭐ **alta fidelidade** — protótipo funcional que opera muito próximo
ao produto real, com foco em teste técnico (categoria 3 do Guia).

---

## 📒 Caderno **CANVAS** — as perguntas de cada bloco

Todas respondidas em [`../03_canvas/`](../03_canvas/). As principais:

| Pergunta do caderno | Resposta curta |
|---|---|
| *Para quem estamos criando valor?* | indústrias de eletroeletrônicos que fazem ensaio térmico interno |
| *O que você está oferecendo?* | um ensaio que enxerga: diz qual dispositivo falhou e quando |
| *Por que os clientes comprarão de você e não dos concorrentes?* | os concorrentes vendem câmara nova; nós modernizamos a existente por ~R$ 300 |
| *Quais as principais atividades que a proposta exige?* | projeto elétrico, firmware, integração IoT, comissionamento |
| *Quais as atividades mais caras?* | horas de engenharia; o material é barato |
| *Quais as origens das receitas?* | venda do kit, instalação, manutenção anual e licenciamento didático |
| *Como os clientes pagarão?* | venda direta do kit + serviço; contrato anual opcional |
| *Como estamos atingindo atualmente?* | pela demanda cadastrada no SAGA e pela Mostra Inova Firjan SENAI |

---

## ✅ Situação final das perguntas

| Caderno | Perguntas | Respondidas |
|---|---|---|
| Pesquisa — Registro de Descobertas | 4 | ✅ 4 |
| Resumo Expandido — Redação Relâmpago | 6 | ✅ 6 *(a das competências estava faltando)* |
| Pitch — roteiro | 4 | ✅ 4 *(a chamada de ação estava fraca)* |
| Guia Prático — protótipo | 4 | ✅ 4 |
| Canvas — blocos | 9 + 5 | ✅ todos |

> 🎯 **Duas correções vieram desta conferência:** o resumo estava em **primeira pessoa** (o
> caderno proíbe) e faltava a resposta das **3 competências do curso** — que é justamente o que
> faz do trabalho um projeto *integrador*.
