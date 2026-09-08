# Defesa de Viabilidade — Silos de Gipsita (Plataforma SAGA SENAI)

> **Demanda SAGA:** #13063 — Silos inteligentes para controle de volume de material (Gipsita)

---

### Título do Projeto
**Sistema de Telemetria Inteligente para Medição de Nível em Silos de Gipsita**

---

### 1. Qual é a demanda da empresa?

A empresa fabrica gesso a partir de um mineral chamado **gipsita**. Essa gipsita fica armazenada em silos grandes (tipo "caixas d'água" gigantes de metal). O problema é que, para saber quanto material ainda tem dentro do silo, **alguém precisa subir lá em cima e olhar**.

Isso causa 3 problemas sérios:

- **Risco de acidente:** Subir num silo de vários metros de altura, num ambiente cheio de pó de gesso, é perigoso. Pode cair, pode respirar poeira demais.
- **Falta de controle:** Sem saber em tempo real quanto material tem, a fábrica pode parar porque acabou a gipsita no silo — ou pode transbordar porque encheu demais.
- **Sensores comuns não funcionam:** A empresa já tentou usar sensores de nível, mas a poeira dentro do silo é tão densa que os sensores normais (que usam som ou laser) perdem o sinal e dão leituras erradas.

A empresa quer uma solução que:
- Meça o nível de gipsita **sem precisar de alguém subir no silo**.
- Funcione **mesmo com muita poeira** dentro do silo.
- Mostre os dados **em tempo real** num painel na sala de controle.

---

### 2. Por que escolhemos essa demanda?

Escolhemos porque ela é um problema real de uma empresa real, e a solução usa exatamente o que aprendemos no curso de **Eletrotécnica**:

- **Instalações elétricas:** Precisamos montar um painel elétrico protegido contra poeira e água (IP65), com disjuntor, proteção contra surtos e fonte de alimentação. Tudo dimensionado corretamente.
- **Instrumentação industrial:** Usamos um sensor de nível por radar e um sinal de corrente de **4 a 20 mA** — que é o padrão da indústria para transmitir medições por fios longos sem perder precisão.
- **Automação e IoT:** O microcontrolador ESP32 recebe o sinal do sensor, calcula o volume do silo e envia os dados pela rede Wi-Fi para um painel que os gestores podem ver no computador.
- **Segurança no trabalho:** O projeto elimina a necessidade de subir no silo, reduzindo o risco de acidentes em altura (NR-35).

Em resumo: é um projeto de **eletrotécnica aplicada à instrumentação industrial**, com um bônus de segurança no trabalho.

---

### 3. Por que radar e não outro sensor?

Essa é a parte mais importante de explicar. Dentro de um silo de gipsita, durante o enchimento, o ar fica cheio de uma nuvem densa de pó de gesso:

- **Sensor de ultrassom** (que usa som): O som bate na nuvem de poeira e volta antes de chegar no material. Resultado: leitura errada.
- **Sensor a laser** (que usa luz): A poeira suja a lente em poucas horas e bloqueia o feixe. Resultado: precisa limpar todo dia.
- **Sensor de radar** (que usa ondas de rádio): As ondas de rádio de alta frequência **atravessam a poeira** como se ela não existisse. A antena do sensor é revestida de Teflon (PTFE), então o pó não gruda. Resultado: funciona sem manutenção.

Por isso, a indústria de silos e mineração no mundo inteiro usa radares. É a tecnologia certa para o problema certo.

---

### 4. Como funciona a nossa solução?

A ideia é bem simples:

1. **O sensor fica no topo do silo**, apontando para baixo. Ele dispara uma onda de rádio que bate na gipsita e volta. Pela velocidade da onda, ele calcula a **distância** até a superfície do material.
2. Essa distância é convertida num sinal elétrico de **4 a 20 mA** (um padrão industrial que não perde precisão mesmo com cabos longos).
3. O fio chega num **painelzinho elétrico** na base do silo, onde um módulo conversor transforma esse sinal em número digital.
4. O **ESP32** (microcontrolador com Wi-Fi) pega esse número, faz a conta de volume do silo (considerando o formato cilíndrico/cônico) e transforma em **porcentagem de lotação**.
5. Esse dado é enviado pela rede Wi-Fi para um **painel na tela do computador** na sala de controle, onde o gestor vê em tempo real: "Silo 1: 73%", "Silo 2: 28%", etc.
6. Se o nível ficar muito baixo (risco de parar a produção) ou muito alto (risco de transbordar), o sistema **avisa automaticamente**.

**Na maquete (o que vamos construir):**
- Um tubo de PVC simulando o silo, com gipsita moída dentro.
- Um sensor radar pequeno no topo (versão didática, que custa uns R$ 100).
- O ESP32 calculando o volume e mostrando num dashboard no computador.
- A mesma lógica que seria usada na fábrica real, só que em escala reduzida.

---

### 5. É viável? Dá pra fazer?

**Sim, e é mais simples do que parece:**

1. **Custo baixo:** O protótipo de maquete inteiro custa cerca de **R$ 330,00** (sensor + ESP32 + painel + materiais). Se o grupo conseguir mais orçamento, dá para usar um radar industrial de verdade por uns R$ 1.300,00.

2. **Componentes prontos:** Sensores radar para medir distância já existem prontos no mercado. O ESP32 é um módulo que já vem com Wi-Fi. O software para o dashboard (Grafana ou Node-RED) é gratuito.

3. **Construção rápida:** O projeto tem 4 fases:
   - Fase 1: Pesquisar e comprar os componentes.
   - Fase 2: Montar o painel e testar o sensor na bancada.
   - Fase 3: Programar o ESP32 e o dashboard.
   - Fase 4: Testar na maquete do silo e validar.

**E na fábrica real?**
Na fábrica, em vez do sensor didático de R$ 100, usaria um radar industrial de 80 GHz (R$ 3.000 a R$ 8.000 por silo), homologado para ambientes com poeira. Mas a lógica do ESP32, o protocolo MQTT e o dashboard seriam **exatamente os mesmos**. Só troca o sensor.

---

### 6. Quais são os riscos?

| E se... | O que fazemos |
|---|---|
| O Wi-Fi da fábrica não chegar até o silo? | Usamos cabo de rede em conduíte metálico ou rádio LoRa de longo alcance. |
| O sol esquentar demais o painel? | O painel fica num local coberto ou com proteção anti-UV. |
| O sensor didático não tiver a mesma precisão do industrial? | Documentamos a limitação e apresentamos a especificação do sensor real que seria usado na fábrica. |
| A conta de volume der errada? | Calibramos com medição manual de referência e colocamos margem de tolerância no software. |

---

### 7. Qual é o diferencial?

A maioria das fábricas de gesso ainda mede o nível dos silos **na mão**, com alguém subindo lá em cima. As que tentaram automatizar falharam porque usaram sensores errados (ultrassom e laser), que não funcionam com poeira.

Nosso projeto propõe a tecnologia certa (radar) com o custo mais baixo possível (ESP32 + Wi-Fi + MQTT), entregando:
- **Segurança:** ninguém mais precisa subir no silo.
- **Controle:** o gestor vê em tempo real quanto material tem.
- **Previsibilidade:** alarmes automáticos avisam antes de faltar ou transbordar.

---

### 8. Divisão da apresentação (5 integrantes, ~2 min cada)

| Quem | Fala sobre | Frase-chave |
|---|---|---|
| **Integrante 1** | O problema da empresa e por que importa | "O operador precisa subir no silo para ver o nível. É perigoso e impreciso. Nosso projeto resolve isso." |
| **Integrante 2** | Por que radar e não ultrassom ou laser | "A poeira engana o ultrassom e suja o laser. Só o radar atravessa a nuvem de pó sem problema." |
| **Integrante 3** | O painel elétrico e a infraestrutura | "Montamos um painel IP65 protegido contra poeira e água, com proteção contra surtos elétricos." |
| **Integrante 4** | O software, o cálculo de volume e o dashboard | "O ESP32 transforma a distância em volume e manda para o computador da sala de controle em tempo real." |
| **Integrante 5** | Custos, viabilidade e escalabilidade | "O protótipo custa R$ 330. Na fábrica, troca só o sensor. A lógica e o software são os mesmos." |

---

### 9. O que todo mundo do grupo precisa saber responder

1. **Qual é o problema?** A fábrica não sabe quanto material tem nos silos sem mandar alguém subir lá.
2. **Por que sensores normais não servem?** A poeira de gipsita engana o som e suja o laser. Só radar funciona.
3. **Como funciona?** O radar mede a distância, o ESP32 calcula o volume e envia por Wi-Fi para um painel no computador.
4. **É seguro?** Sim. Painel IP65, proteção contra surtos, e ninguém mais precisa subir no silo.
5. **Quanto custa?** R$ 330 a maquete. R$ 1.300 com radar industrial. R$ 3.000–8.000 por silo na fábrica real.
6. **Escala pra fábrica?** Sim. Troca só o sensor pelo industrial. O ESP32, o software e o dashboard ficam iguais.
7. **Qual é o diferencial?** Medir o nível sem contato, sem subir no silo, imune à poeira, com dados em tempo real.

---

### 10. Perguntas "Pegadinha" que a banca pode fazer (e como responder)

Como esse é um projeto industrial voltado para o setor de mineração/gesso, a banca fará perguntas para testar se a solução para em pé na vida real.

**Pergunta 1: "O silo é uma estrutura de metal gigante que funciona como Gaiola de Faraday, além do ambiente ser cheio de poeira. Como o Wi-Fi do ESP32 vai chegar na sala de controle?"**
*Como responder:* "Na maquete nós usamos Wi-Fi, mas na fábrica nós documentamos opções mais robustas. O painel ficaria na base do silo (do lado de fora), ou usaríamos uma antena Wi-Fi externa apontada para um roteador industrial próximo. Se o Wi-Fi não for viável, a arquitetura permite trocar o módulo Wi-Fi por um Rádio LoRa (915 MHz, que atravessa obstáculos muito melhor) ou simplesmente passar um cabo de rede blindado até o switch mais próximo."

**Pergunta 2: "Um radar industrial custa de R$ 3.000 a R$ 8.000. Vocês acham que a empresa vai pagar isso só para evitar que o operador suba uma escada?"**
*Como responder:* "Com certeza. Primeiro, porque uma queda de altura (NR-35) pode ser fatal, e isso tem um custo humano imensurável, além de processos milionários. Segundo, o silo ficar vazio significa que os fornos da fábrica param. Uma hora de fábrica parada custa muito mais que 8 mil reais. O sensor se paga na primeira vez que evita a interrupção da produção."

**Pergunta 3: "O sensor industrial envia o sinal em 4 a 20 mA. Mas o ESP32 só lê tensão de 0 a 3.3V. Na indústria isso liga direto no CLP, mas como vocês vão ligar no ESP32 sem queimar a placa?"**
*Como responder:* "Temos duas opções. A mais profissional é usar um **Módulo Conversor 4-20mA para Tensão** (como o HW-685). Ele recebe os fios industriais 24V/20mA de um lado e entrega 3.3V seguros para o ESP do outro. Mas, se precisarmos fazer na raça, usamos a **Lei de Ohm** ($V = R \times I$): colocamos um resistor de precisão (shunt) de 165 ohms em paralelo com a entrada do ESP32 ligada ao GND. Quando o sensor manda a corrente máxima de 20 mA ($0.02 A$), a tensão gerada sobre o resistor será de exatamente $3.3V$ ($165 \times 0.02$), que é o limite seguro do pino do ESP32."

---

### 11. Encerramento sugerido

"Concluímos que o projeto é viável porque usa uma tecnologia comprovada na indústria — o radar — combinada com IoT de baixo custo. Ele resolve um problema real de segurança e logística da empresa, aplica os conhecimentos de instalações elétricas, instrumentação e automação do nosso curso, e pode ser validado com uma maquete de R$ 330 que funciona com a mesma lógica da planta real."
