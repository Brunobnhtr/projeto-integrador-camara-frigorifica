# Plano de Pesquisa — os três eixos que o SENAI exige

> 📎 Base: *Guia Prático* §2.2 (p. 12-13) e o caderno **Projeto Integrador Pesquisa 2026**
> da Biblioteca SENAI SESI Três Rios.
>
> 🎯 A frase que resume a cobrança: *"a pesquisa evita o 'eu acho' e traz dados reais para o
> projeto"* — e *"permite identificar se a solução é realmente nova ou se já existem
> tecnologias similares"*.

---

## Por que este documento existe

Nosso projeto tem **muita engenharia justificada e pouca fonte citável**. Cada decisão técnica
está explicada nos documentos das camadas — mas explicada por raciocínio próprio. A banca vai
perguntar *"em que você se baseou?"*, e a resposta precisa ter autor, ano e página.

⚠️ **Risco concreto que o caderno da Biblioteca aponta:** *"é muito importante guardar todas as
referências. Se isso não acontecer, o aluno corre o risco de ser acusado de plágio."*

---

## Eixo 1 · Pesquisa geral

**O que é:** levantamento bibliográfico, visitas técnicas e entrevistas — o arcabouço teórico
que sustenta a ideia.

**Onde pesquisar** (as fontes que o SENAI aceita):

| Fonte | Para quê, no nosso caso |
|---|---|
| **Google Acadêmico** | controle PID aplicado a Peltier; câmaras climáticas didáticas |
| **SciELO** | automação industrial e instrumentação em português |
| **Pergamum** (Biblioteca Firjan) | livros técnicos de comandos elétricos e instalações |
| **Portal CAPES** | artigos de refrigeração termoelétrica |
| **Normas** (ABNT/IEC) | IEC 60068-2, NBR 5410, NR-10 |
| **Notas de aplicação de fabricante** | Texas Instruments, Infineon, Ferrotec, Marlow |

**O que já temos:** o arquivo [`../../referencias/2026-08_analise_acionamento_peltier.md`](../../referencias/2026-08_analise_acionamento_peltier.md)
reúne datasheets, notas de aplicação e recomendações de fabricantes sobre acionamento de
Peltier. É material bruto de boa qualidade — o que faltava era **formato citável**, e isso
está resolvido em [`03_referencias_abnt.md`](03_referencias_abnt.md).

**O que falta você fazer:**

- [ ] **Visita técnica ou entrevista** com a empresa da demanda. O Guia trata isso como parte
      do eixo 1: *"o diálogo direto com a indústria que propôs o desafio"*. Anote data,
      pessoa entrevistada e o que foi dito — isso vira fonte.
- [ ] Passar na **Biblioteca da unidade** e pedir mediação do bibliotecário. O caderno diz
      textualmente que essa mediação é esperada.

---

## Eixo 2 · Pesquisa de anterioridade

**O que é:** verificar se a ideia **já foi patenteada**. É o eixo mais formal, e o SENAI o
trata como obrigatório.

**Onde:** **INPI** (obrigatório no Brasil) e **Google Patents** (visão internacional, em inglês).

👉 Os termos de busca prontos estão em [`02_anterioridade_e_similares.md`](02_anterioridade_e_similares.md).

⚠️ **Isto só você pode fazer** — a busca no INPI exige acesso pela plataforma deles.

---

## Eixo 3 · Pesquisa de similares

**O que é:** mapeamento de mercado — *"identificar se soluções análogas à proposta já foram
implantadas, permitindo que o estudante diferencie sua inovação frente ao que já está
disponível comercialmente"*.

👉 Levantamento já feito em [`02_anterioridade_e_similares.md`](02_anterioridade_e_similares.md).

**Fonte adicional que o caderno exige:** consultar o **próprio SAGA SENAI** para ver
*"as soluções que já foram cadastradas por outros grupos"*.

- [ ] Buscar no SAGA por: câmara climática, ensaio térmico, Peltier, monitoramento IoT.

---

## 🤖 Sobre usar IA na pesquisa — o que o SENAI diz

O caderno tem uma página inteira sobre isso, e é importante porque **este projeto usou IA**:

| Regra do SENAI | Como estamos cumprindo |
|---|---|
| *"Suporte, não substituto"* | a IA estruturou documentação e desenhos; as decisões técnicas foram discutidas e revisadas |
| *"Use de forma ética: evite o plágio, transforme o conteúdo em algo original"* | o texto é sobre um projeto próprio, com dados próprios |
| *"Validação humana: sempre conferir os dados gerados por IA em fontes confiáveis"* | ⚠️ **é o que este documento faz** — cada afirmação técnica ganha fonte verificável |
| *"Desenvolva pensamento crítico"* | as decisões revistas (MOSFET → relé, BS-1 → bornes do Mega) são registro disso |

> 🎓 **Se a banca perguntar se usou IA:** a resposta honesta é sim, como ferramenta de
> documentação e verificação — e o projeto tem **validadores automáticos** que conferem cada
> fio e cada terminal, justamente para que nada dependa de "achar que está certo". Isso é
> exatamente o que o caderno chama de validação humana.

---

## Ferramentas que o próprio SENAI recomenda

| Para | Ferramenta sugerida no caderno |
|---|---|
| Pesquisa com fontes citadas | **Perplexity AI** |
| Encontrar artigos científicos | **Consensus** |
| Edição e legendagem do vídeo | **CapCut** |
