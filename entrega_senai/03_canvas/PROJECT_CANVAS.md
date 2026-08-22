# Project Model Canvas — preenchido

> 📎 Modelo oficial: `Project Canvas_modelo.pptx`. O Guia (§2.4) lista os **5 pilares**:
> Por quê · O quê · Quem · Como · Quando e Quanto.
>
> ⚖️ **Escolha um dos dois Canvas para anexar.** O BM Canvas mostra o **negócio**; o Project
> Canvas mostra a **execução**. Para uma banca técnica de eletrotécnica, o **Project Canvas
> costuma defender melhor** — ele fala de escopo, riscos e prazos, que é o que se pergunta a
> um técnico. O BM Canvas fica como reserva, caso perguntem de viabilidade econômica.

---

## POR QUÊ?

### Justificativa (o passado — o que dói hoje)

Ensaios térmicos de até 50 dispositivos rodam sem supervisão e sem registro. Quando um
dispositivo falha no meio do ciclo, ninguém percebe: a falha só aparece no fim, e aí não há
como saber **quando** nem **por quê**. O ensaio inteiro é descartado e repetido — horas de
máquina e de mão de obra perdidas.

### Objetivos SMART

| # | Objetivo | Como se mede |
|---|---|---|
| 1 | Controlar a temperatura em malha fechada com banda morta de **±0,3 °C** | leitura do sensor durante ciclo completo |
| 2 | Sinalizar dispositivo inoperante em **menos de 1 segundo** | ensaio com a chave do porta-fusível: desligar e cronometrar |
| 3 | Registrar **100 %** dos eventos com data e hora | conferir o arquivo do cartão contra o ocorrido |
| 4 | Garantir que a emergência corte a potência **com o controlador desligado** | ensaio de aceitação com o Arduino sem alimentação |
| 5 | Entregar o protótipo funcional até o fim do período letivo de 2026 | cronograma abaixo |

### Benefícios (o futuro)

- Fim do ensaio perdido por falha não percebida
- Rastreabilidade: histórico auditável de cada ciclo
- Operação sem presença física, com alarme remoto
- Modernização de baixo custo, sem trocar o equipamento existente

---

## O QUÊ?

### Produto

Sistema de controle e supervisão para cabine climatizada de ensaios térmicos, entregue como
**maquete funcional em escala reduzida** — planta industrial didática completa, da entrada de
energia ao painel de comando e à câmara.

### Requisitos

- Controle PID de aquecimento (PTC 24 V / 80 W) e resfriamento (2× Peltier TEC1-12706 em série)
- Acionamento por driver de potência com PWM de 20 kHz e saída de diagnóstico de corrente (`IS`)
- Supervisão remota por Wi-Fi/MQTT e IHM local
- Registro em cartão de memória com relógio de tempo real
- Detecção de dispositivo inoperante por sensor de corrente, por posição de ensaio
- Cadeia de comando em hardware: relé de selo, botoeira de emergência e STOP
- Documentação técnica completa e desenhos gerados do modelo de dados

---

## QUEM?

### Stakeholders externos

- **Ensaios & Controle Tech** — cliente e dono da demanda
- **Firjan SENAI** — instituição, laboratório e avaliação
- **Banca avaliadora** — validação final
- **Fornecedores** — prazo de entrega é fator externo crítico

### Equipe

| Papel | Responsável |
|---|---|
| Projeto elétrico e painel | Bruno Garro Alves |
| Firmware e integração | _[integrante]_ |
| Montagem mecânica e maquete | _[integrante]_ |
| Documentação e apresentação | _[integrante]_ |
| Orientação | _[instrutor]_ |

---

## COMO?

### Premissas

- A cabine da empresa continua em produção — a validação é feita na maquete
- O controle existente é preservado; a supervisão é acrescentada em paralelo
- Todo componente é comercial e encontrável no mercado nacional
- Nada é soldado dentro do painel: componente discreto mora em borne

### Grupos de entrega

1. **Camada 0-1** — fundamentos, arquitetura de energia e maquete
2. **Camada 2-3** — painel, força, comando, proteções e sinais
3. **Camada 4** — firmware, ESP32/IHM e simulação
4. **Camada 5** — montagem final e comissionamento
5. **Entrega acadêmica** — resumo, canvas, pitch, banner

### Restrições

- Orçamento de material limitado (~R$ 1.900)
- Prazo do período letivo
- Tensão de trabalho restrita a extra-baixa tensão nas partes acessíveis (SELV)
- Sem acesso à máquina real durante a produção

---

## QUANDO E QUANTO?

### Riscos

| Risco | Impacto | O que fazemos |
|---|---|---|
| **PTC de 24 V difícil de achar** no mercado nacional | alto — trava a câmara | comprar no primeiro lote, com folga de prazo |
| Ventoinha do lado quente parar | crítico — queima a pastilha em < 1 min | watchdog de RPM em firmware + relé com estado seguro "ligado" |
| Driver de potência falhar em curto | alto | relé de veto em série com a bobina do selo: o firmware corta a potência de verdade |
| Ruído do chaveamento corromper a leitura analógica | médio | segregação de canaletas + filtro nos bornes do próprio Arduino |
| Atraso de entrega de componente importado | médio | lotes de compra escalonados por camada |

### Linha do tempo

| Fase | Quando |
|---|---|
| Pesquisa e definição da demanda | ✅ concluído |
| Projeto elétrico e documentação | ✅ concluído (6 camadas, validadores verdes) |
| Compra de material | 🟡 em curso — lotes A a E |
| Montagem do painel e da maquete | ⬜ próximo |
| Comissionamento e ensaios de aceitação | ⬜ |
| Entregas acadêmicas (resumo, pitch, banner) | 🟡 em curso |
| Apresentação à banca | ⬜ |

### Custo

| Item | Valor |
|---|---|
| Lote A — eletrônica, fonte, Peltier, PTC | ~R$ 700 |
| Lote B — estrutura da maquete e acrílico | ~R$ 450 |
| Lote C — painel, trilho, bornes, botoeiras | ~R$ 350 |
| Lote D — cabos, terminais, canaleta, fusíveis | ~R$ 200 |
| Lote E — cenografia e acabamento | ~R$ 200 |
| **Total do protótipo** | **~R$ 1.900** |
| *Kit de modernização aplicado a uma máquina real* | *~R$ 300* |
