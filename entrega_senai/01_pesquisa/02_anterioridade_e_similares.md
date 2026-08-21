# Anterioridade e Similares — o que já existe, e onde está a nossa diferença

> 🎯 O objetivo deste documento é o que o caderno da Biblioteca chama de **"inovação
> consciente"**: mostrar que sabemos o que já existe e **não estamos reinventando a roda** —
> e, a partir daí, dizer com precisão qual é a nossa contribuição.

---

## Parte 1 · O que a literatura já resolveu (e que vamos citar, não refazer)

| Já está resolvido na literatura | Fonte | O que fazemos com isso |
|---|---|---|
| **Controle PID de pastilha Peltier com Arduino** | Kim *et al.* (2022), *Case Studies in Thermal Engineering* | ✅ **usamos o método pronto.** Não vamos "descobrir" PID — vamos aplicar e citar |
| **Corrente contínua supera PWM em módulos TEC** | Texas Instruments, SLUA979A (2020) | ✅ é a base da decisão de PWM alto + filtro, em vez do PWM de 1 Hz original |
| **Ripple de corrente < 10 % degrada ΔT em < 1 %** | Ferrotec; Marlow Industries | ✅ vira critério de projeto verificável |
| **Ensaio térmico de eletrônicos: método e severidades** | IEC 60068-2 | ✅ é o que a máquina do cliente executa — dá contexto normativo ao projeto |
| **Segurança de comando: parada de emergência não depende de software** | NR-10; ABNT NBR 5410; ISO 13850 | ✅ é a razão do relé de selo em hardware |

> 📌 **Esta tabela é a prova de que não reinventamos a roda.** Cada linha é um problema que
> alguém já resolveu, e que nós **usamos como base** em vez de tentar resolver de novo.

---

## Parte 2 · Similares no mercado — câmaras climáticas

| O que existe | Quem | Diferença para o nosso caso |
|---|---|---|
| **Câmaras climáticas industriais** (compressor, faixa ampla, conformidade IEC 60068) | Weiss Technik, Espec, Thermotron, Ethik | ⚠️ São o **estado da arte** e fazem tudo — mas custam dezenas de milhares de reais e **não é o que a empresa quer**: ela já tem a cabine e quer **modernizar** |
| **Laboratórios de ensaio como serviço** | INDT e outros | Alternativa ao equipamento próprio: terceirizar o ensaio |
| **Câmaras Peltier de bancada** | diversos fabricantes | Mesma tecnologia da nossa, em produto fechado — **sem acesso aos dados** e sem detecção por posição |
| **Data loggers avulsos** | Testo, Novus, Elitech | Registram temperatura, mas **não sabem se o dispositivo sob ensaio parou de funcionar** |
| **Projetos didáticos abertos** (Arduino + TEC1-12706 + PID) | repositórios públicos e trabalhos acadêmicos | Provam a viabilidade do controle; **nenhum trata rastreabilidade nem falha por posição** |

---

## Parte 3 · ⭐ Onde está a nossa diferença

Nenhum dos similares acima resolve o problema **específico** da demanda. A diferença não está
em controlar temperatura — isso é commodity. Está em três pontos:

| # | Diferencial | Por que ninguém do mercado entrega isso |
|---|---|---|
| 1 | **Saber QUAL dispositivo falhou e QUANDO** | as câmaras controlam o ambiente, não o que está dentro dele. Nossa detecção de corrente por posição diz *"a placa da posição 1 parou às 03h12"* |
| 2 | **Modernizar sem substituir** | o mercado vende câmara nova; nós acrescentamos supervisão à que já existe, por cerca de R$ 300 |
| 3 | **Segurança em eletrotécnica clássica, inteligência em software** | soluções de IoT costumam pôr o corte de emergência no microcontrolador. Aqui o cogumelo derruba o selo em hardware, e o firmware **só pode subtrair** |

> 🎓 **A frase para a banca:** *"controlar a temperatura não é o nosso mérito — isso a
> literatura já resolveu e nós citamos. O nosso mérito é que o ensaio deixa de ser cego: ele
> passa a dizer qual dispositivo morreu, em que minuto, e a avisar sem ninguém estar na
> frente da máquina."*

---

## Parte 4 · ⭐ A busca de anterioridade — EXECUTADA em 21/08/2026

> 🔎 **O problema que você levantou:** *"no INPI aparece um monte de projeto e não dá para
> olhar por todos"*. Ele é real, e a causa é o **método de busca**: procurar por palavra solta
> devolve milhares de documentos de áreas que nada têm a ver com o nosso.
>
> ✅ **A solução é buscar por CLASSIFICAÇÃO** — é assim que examinador de patente trabalha.
> Toda patente do mundo é classificada por assunto (IPC/CPC). Filtrando por classe, os
> milhares viram dezenas.

---

### As classes que interessam ao nosso projeto

| Código | O que cobre | Por que é a nossa |
|---|---|---|
| **G01R 31/28** | Ensaio de circuitos eletrônicos | ⭐ **a mais precisa** — é o que a máquina faz: testar placa |
| **F25B 21/02** | Refrigeração por **efeito Peltier** | a nossa câmara é termoelétrica |
| **G01N 25/00** | Investigação de materiais por meios térmicos | ensaio térmico em geral |
| **G05D 23/19** | Controle automático de temperatura | a malha PID |

---

### O que a busca devolveu — números reais

Feita em **21/08/2026**, na base do **Google Patents**, que **indexa os documentos brasileiros
(BR) do INPI** e permite filtrar por país e por classificação.

| Base | Filtro usado | Resultados | O que apareceu |
|---|---|---:|---|
| BR | `G01R31/28` | **217** | teste de circuito integrado, memória, cadeia de varredura — IBM, Intel, Qualcomm |
| BR | `G01R31/28` + temperatura | **35** | rastreamento de tensão e temperatura em chip; nada sobre câmara de ensaio |
| BR | `F25B21/02` (Peltier) | **96** | secagem de granulado, módulo óptico, ar-condicionado, estabilização térmica |
| BR | `"câmara climática"` | **273** | agroquímicos, incubação de aves, adesivos, vidros — ⚠️ a expressão é usada em outras áreas |
| BR | `"câmara térmica"` + ensaio | **12** | polipropileno, retardante de chama, vidraça |
| Mundo | `"burn-in"` + câmara + DUT + monitoring | dezenas | ⭐ **os mais próximos, abaixo** |
| Mundo | `"burn-in board"` + `"failure detection"` + `"per device"` | **0** | ⭐ **nenhum documento** |

---

### ⭐ Os documentos mais próximos que existem

| Documento | Ano | Titular | O que faz | Onde difere do nosso |
|---|---|---|---|---|
| **KR102495025B1** | 2023 | 주식회사디아이 (DI Co.) | Monitora a **uniformidade de temperatura** dentro de uma câmara de burn-in | Vigia o **ambiente**, não os dispositivos. Não diz qual placa parou |
| **CN115327267B** | 2025 | Hangzhou Sanhai Electronic | Método e sistema de **ciclagem térmica de alta e baixa temperatura** | Foca no ciclo térmico; a supervisão é do processo, não da carga individual |
| **US11913989B2** | 2024 | Microchip Technology | **Placa de burn-in** com soquete e aquecimento integrado | Aquece o dispositivo na própria placa; não é câmara nem detecta falha por posição |
| **US10935486B2** | 2021 | — | **Câmara de ensaio ambiental** (construção da câmara) | É o equipamento; não trata de rastreabilidade nem de falha individual |
| **US5006796A** | 1991 | — | Instrumento de **controle de temperatura de componentes sob ensaio** | Antecessor clássico: controla a temperatura do componente. Não monitora consumo nem avisa remotamente |

---

### 🎯 A conclusão da busca, em uma frase

**A câmara existe. O controle PID existe. O burn-in monitorado existe. O que não aparece é a
combinação que a nossa demanda pede:** vigiar **cada dispositivo individualmente pela corrente
que ele consome**, dizer **qual** parou e **em que minuto**, e fazer isso como **modernização
de uma cabine que já existe**.

A busca por `"burn-in board" + "failure detection" + "per device"` retornou **zero** documentos.

> ⚠️ **Isto não é declaração de novidade absoluta** — busca em base pública não substitui exame
> do INPI, e a redação de patente usa termos que a nossa busca pode não ter alcançado. É o que
> se espera de uma pesquisa de anterioridade de projeto técnico: **mostrar que procuramos com
> método, e que sabemos o que já existe.**

---

### 📋 Como REFAZER esta busca no INPI (o passo a passo que resolve o "monte de projeto")

O INPI tem busca por classificação, e é isso que corta o ruído.

1. Acesse **https://busca.inpi.gov.br/pePI/** → *Patentes* → **Pesquisa Avançada**
   *(a consulta é pública; o login só é preciso para peticionar)*
2. No campo **Classificação IPC**, digite uma das classes da tabela acima — comece por
   **`G01R31/28`**
3. Cruze com uma palavra no campo **Resumo** — por exemplo `temperatura` ou `câmara`
4. Anote na tabela abaixo: data, filtro, quantidade e o documento mais próximo

| Data | Base | Filtro (classe + termo) | Resultados | Documento mais próximo | Diferença para o nosso |
|---|---|---|---|---|---|
| 21/08/2026 | Google Patents (BR) | `G01R31/28` + temperatura | 35 | — | nada sobre câmara de ensaio |
| 21/08/2026 | Google Patents (BR) | `F25B21/02` | 96 | — | Peltier em outras aplicações |
| 21/08/2026 | Google Patents (mundo) | `"burn-in board"` + falha por dispositivo | **0** | — | — |
| ___/___/2026 | **INPI** | | | | |
| ___/___/2026 | **INPI** | | | | |
| ___/___/2026 | **SAGA SENAI** | | | | |

> 💡 **Por que ainda vale você fazer a do INPI:** a busca aqui foi feita numa base que
> *indexa* o INPI, mas a banca pode pedir o print da consulta **na base oficial**. São dez
> minutos, e o filtro por classificação já está pronto.

---

### 🔧 Ferramenta para repetir a busca

O script que executou estas consultas ficou em
[`buscar_patentes.mjs`](buscar_patentes.mjs). Ele consulta o Google Patents por classificação
e imprime os resultados. Para rodar de novo com outros termos, edite a lista `BUSCAS` no topo
do arquivo.
