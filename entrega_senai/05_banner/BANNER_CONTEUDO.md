# Banner — conteúdo pronto para o modelo

> 📎 Modelo: `Banner Projeto Integrador SENAI.pptx` · **90 cm × 1,20 m** · lona fosca com
> tubete e barbante · **uma cópia em A4 vai anexada ao Resumo Expandido (ANEXO 3)**.
>
> 🎯 Regra do caderno: *"os textos são formados por resumos da escrita do Resumo Expandido.
> Cada parte deve conter apenas 1 parágrafo"* · *"menos é mais"* · *"equilíbrio visual: use
> imagens do protótipo"*.

---

## Cabeçalho

| Campo | Conteúdo |
|---|---|
| **Título** | IMPLEMENTAÇÃO DE SISTEMA DE CONTROLE INTELIGENTE COM ESP32 PARA CABINE CLIMATIZADA DE ENSAIOS TÉRMICOS |
| **Integrantes** | Bruno Garro Alves · _[2º]_ · _[3º]_ · _[4º]_ |
| **Instrutor** | _[nome do instrutor orientador]_ |
| **Curso** | Curso Técnico em Eletrotécnica — Firjan SENAI _[unidade]_ |

---

## 1 · INTRODUÇÃO *(um parágrafo)*

> Antes de ser vendida, uma placa eletrônica precisa provar que funciona no calor e no frio, e
> para isso é submetida a ciclos de temperatura em cabine climatizada. Na empresa parceira esse
> ensaio roda sem supervisão e sem registro: com até cinquenta dispositivos energizados ao mesmo
> tempo, a falha de um passa despercebida até o fim do ciclo — e o ensaio inteiro é descartado.
> Este projeto moderniza a cabine existente, acrescentando supervisão remota, rastreabilidade e
> detecção imediata de falha.

**Ícones sugeridos ao lado** (o modelo tem três espaços):

| Ícone | Rótulo |
|---|---|
| 🏭 | **50 dispositivos** por ensaio |
| ⏱️ | falha percebida **só no fim** |
| 💸 | **ensaio inteiro** descartado |

---

## 2 · METODOLOGIA *(um parágrafo)*

> Foi construída uma planta industrial em escala reduzida, da entrada de energia até a câmara
> térmica, o que permitiu ensaiar a solução sem parar a produção. A câmara usa duas pastilhas
> Peltier em série e um aquecedor cerâmico, acionados por drivers de potência com PWM de
> 20 kHz. O controle é feito por Arduino Mega em malha fechada, com ESP32 publicando a
> telemetria por MQTT, IHM local e registro em cartão com relógio de tempo real. A cadeia de
> comando foi construída em eletrotécnica clássica, com relé de selo e botoeiras, de modo que a
> emergência atue mesmo com o firmware travado.

**Destaque visual:** o desenho [`04_painel_layout.svg`](../../desenhos/04_painel_layout.svg) ou
[`06_diagrama_comando.svg`](../../desenhos/06_diagrama_comando.svg) — ambos gerados do modelo de dados.

---

## 3 · RESULTADOS *(um parágrafo)*

> A documentação foi convertida em modelo de dados, do qual são gerados os desenhos técnicos e a
> lista de materiais, com validadores automáticos que conferem cada condutor: 105 fios, todos com
> origem e destino verificados. Os ensaios de aceitação previstos são a estabilidade da leitura
> analógica, a atuação da emergência com o controlador desligado e a sinalização de dispositivo
> inoperante em menos de um segundo. O protótipo didático completo custou cerca de R$ 1.900, e a
> modernização aplicada a uma máquina existente exige cerca de R$ 300 por equipamento.

**Números para destacar em caixas** (o banner é visual — estes quatro dizem tudo):

| Número | Legenda |
|---|---|
| **105** | fios validados automaticamente |
| **< 1 s** | para acusar dispositivo em falha |
| **±0,3 °C** | banda morta do controle |
| **~R$ 300** | por máquina modernizada |

---

## 4 · CONCLUSÃO *(um parágrafo)*

> O projeto transforma um ensaio que ocorria sem testemunha em um processo observável,
> registrado e diagnosticável à distância, sem substituir o controle já existente — o que reduz
> o custo de adoção e preserva o investimento da empresa. A contribuição está na integração
> entre eletrotécnica clássica e automação moderna: a segurança permanece em hardware, enquanto
> a inteligência é acrescentada em software. Como evolução, prevê-se ampliar o número de
> posições monitoradas e integrar o sistema a supervisórios industriais.

**Dois selos finais:**

| Selo | Texto |
|---|---|
| 🛡️ **PRÁTICA** | emergência em hardware, independente de software |
| 📈 **RESULTADO** | o ensaio passa a dizer qual dispositivo falhou e quando |

---

## ✅ Checklist do banner

- [ ] Título, integrantes, instrutor e curso no cabeçalho
- [ ] Um parágrafo por bloco — **sem blocos densos de texto**
- [ ] Pelo menos uma **foto do protótipo real** (não só desenho)
- [ ] Logo Firjan SENAI conforme o modelo
- [ ] Exportar em **alta resolução** (300 dpi) antes de mandar para a gráfica
- [ ] Gerar também a versão **A4** para anexar ao Resumo Expandido
