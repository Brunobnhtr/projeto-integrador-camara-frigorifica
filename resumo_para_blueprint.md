# Resumo do projeto para o Blueprint.io

> **Para que serve este arquivo.** O [blueprint.io](https://www.blueprint.io/) é uma ferramenta de IA que transforma uma descrição em texto em **diagrama de ligações, lista de materiais com links de compra, um 3D estrutural e um guia de montagem**. Suporta mais de 720 placas, incluindo Arduino Mega e ESP32.
>
> ⚠️ **Onde ele NÃO ajuda:** ele **não gera firmware**, e o 3D sai como um esboço em arame, não um modelo acabado.

---

## 🎯 Antes de colar: onde ele realmente pode ajudar

Vale ser honesto sobre isso, porque muda o que faz sentido pedir.

**O ponto forte do Blueprint é o começo de um projeto** — "tenho uma ideia, quais peças eu preciso e como ligo?". **Este projeto está no fim**: as peças estão escolhidas, os 270 terminais estão contados, o painel está dimensionado e cada ligação já tem origem e destino.

Ou seja, o que ele produz de melhor — BOM e diagrama de ligações — **nós já temos, e com mais detalhe**, porque foi conferido contra fotos, esquemáticos e medidas reais.

**Então o que pedir a ele?** Três coisas, nesta ordem de utilidade:

| # | Peça isto | Por que vale |
|---|---|---|
| 1 | Um **projeto independente**, só a partir dos requisitos | Se ele chegar na mesma arquitetura, é validação forte para a defesa. Se divergir, vale investigar o porquê |
| 2 | Uma **crítica** ao que já está decidido | Ele pode ver algo que passou |
| 3 | O **3D estrutural** da câmara e do painel | É a única coisa que o projeto ainda não tem |

📌 **Não peça firmware nem o layout da placa PI-1.** Ele não faz o primeiro, e o segundo é específico demais.

---

## PARTE 1 — Só os requisitos

> **Use esta parte sozinha** se quiser que ele projete do zero, sem ser influenciado pelas nossas decisões. É o teste mais útil.

### O problema

Uma empresa faz **ensaios térmicos** em placas eletrônicas. As placas ficam dentro de uma cabine climatizada, **ligadas e funcionando**, enquanto a temperatura varia. Um ensaio dura cerca de 4 horas.

**O problema que ninguém resolveu:** se uma das placas parar de funcionar no meio do ensaio, **ninguém percebe**. Descobre-se no fim, sem saber em que momento nem em que temperatura ela parou. O ensaio inteiro se perde.

### O que o sistema precisa fazer

1. Controlar a temperatura de uma câmara entre **5 °C e 60 °C**, com ciclos alternados de frio e calor
2. Manter **2 dispositivos energizados** dentro da câmara durante o ensaio — cada um alimentado com **24 V contínuos, ~130 mA**, com fusível individual de 500 mA. ⚠️ **Não há 127 V dentro da câmara nem nos dispositivos**
3. **Detectar, na hora, se um deles parar de funcionar** — e saber qual
4. Registrar temperatura, umidade e o estado de cada dispositivo, com data e hora
5. Permitir acompanhamento remoto e comando à distância
6. Ter parada de emergência

### As restrições

- **Um Arduino Mega já controla a cabine hoje e não pode ser substituído.** O sistema novo entra ao lado dele
- Alimentação da rede: **127 V CA**
- Tudo depois da fonte deve ser **tensão segura ao toque** (24 V ou menos)
- É um **projeto escolar de curso técnico em Eletrotécnica** — precisa parecer e funcionar como instalação industrial, com painel em trilho DIN, e ser montável por alunos
- Orçamento apertado; componentes comprados em Mercado Livre e AliExpress

### A pergunta

> Como você projetaria isso? Quais componentes, como ligá-los, e como o sistema detecta um dispositivo que morreu?

---

## PARTE 2 — O que já está decidido

> Use esta parte para pedir **crítica**, depois de ver o que ele propôs sozinho.

### Arquitetura de energia

```
127 V CA ──[disjuntor 2P 6 A curva C]──► FONTE 24 Vcc / 240 W
                                              │
                     ┌────────────────────────┼────────────────────────┐
                  [F1 10 A]               [F2 2 A]                 [F3 2 A]
                  ramal R1                ramal R2                 ramal R3
                  24 V direto          24 V → conversor          24 V → conversor
                  (potência)              → 5,10 V                  → 12,0 V
```

Os três ramais e o retorno viajam por uma **rede aérea em postes** (é uma maquete didática que simula a distribuição elétrica real). Dois deles chegam ao painel ainda em 24 V; os outros dois chegam já convertidos.

**Consumo total: ~169 W · 7,1 A.**

⭐ **Existe um único 0 V no projeto inteiro** (*star ground*), porque os conversores buck não são isolados: o negativo atravessa por dentro deles. Por isso, do conversor sai só o positivo.

### Cargas térmicas

| Carga | Especificação | Acionamento |
|---|---|---|
| **Resfriamento** | 2 × Peltier TEC1-12706 **em série** = 24 V · 6,0 A · 144 W | driver BTS7960, PWM lento de 1 Hz |
| **Aquecimento** | PTC cerâmico 24 V · 80 W · 3,3 A | segundo BTS7960 |
| **Ventilação** | 7 ventoinhas de 12 V em 3 grupos | módulo MOSFET de 4 canais |

### Os três processadores

| | Função | Onde |
|---|---|---|
| **Arduino Mega 2560** | controle em tempo real, PWM, sensores, intertravamento | trilho DIN |
| **ESP32** (base DNLCB30) | Wi-Fi, MQTT, comando remoto | trilho DIN |
| **ESP32-S3 com tela 2,8"** | IHM, cartão SD do log, futuro assistente de voz | porta do painel |

O Arduino é a **única fonte de verdade**: em modo remoto o ESP32 manda um *setpoint*, mas quem executa e quem relata continua sendo ele.

### ⭐ Como o sistema detecta um dispositivo morto

Esta é a parte central do projeto, e vale explicar o raciocínio:

> **Proteção detecta excesso, nunca ausência.** Nenhum fusível ou disjuntor percebe um dispositivo que simplesmente parou — do ponto de vista elétrico, não consumir não é defeito.

A solução: **um sensor de corrente INA219 por posição de ensaio** (são 2), medindo o tempo todo. Se a corrente cai a zero sem que ninguém tenha mandado desligar, aquele dispositivo morreu. Os 2 INA219 têm endereços I²C diferentes (0x40 e 0x41) e convivem no mesmo par de fios.

Cada posição tem também um **porta-fusível com interruptor**, para simular a falha ao vivo durante a apresentação.

### Sensores

- **AM2315C** (I²C) dentro da câmara — temperatura **e** umidade
- **DS18B20** (1-Wire) colado no dissipador quente — diz quando a pós-ventilação pode parar
- **RPM das ventoinhas do radiador** — se uma parar com a Peltier ligada, a pastilha queima em menos de um minuto

### Segurança

- Comando em **duas etapas**: relé de selo (KA1) + relé de potência (KA2)
- Dois barramentos de 24 V: um **comutado** (cai na emergência) e um **permanente** (mantém a supervisão viva para avisar o que houve)
- Seletora LOCAL/REMOTO com falha para o lado seguro: fio rompido cai em LOCAL
- Painel com **canaletas separadas para potência e sinal**, porque os BTS chaveiam 6 A por segundo

### Painel

Caixa **500 × 500 × 200 mm**, 3 trilhos DIN, 5 blocos de distribuição, 16 componentes internos e 11 na porta. **Cerca de 270 terminais**, dos quais 160 em uso.

### Câmara

Acrílico, aproximadamente **336 × 176 × 326 mm**, com dutos de 40 mm e fluxo de ar em sentido único.

---

## PARTE 3 — O que perguntar a ele

Depois de ver a proposta independente dele, vale perguntar:

1. **Você chegou na mesma arquitetura de potência?** Se não, por quê?
2. **Como você detectaria um dispositivo que parou de funcionar?** Chegou no sensor de corrente ou pensou em outra coisa?
3. **Ligaria as Peltier em série para 24 V, ou em paralelo para 12 V?** Qual a vantagem de cada um?
4. **Que peça você acha que vai dar problema na montagem?**
5. **Faltou alguma proteção?**
6. **Gere o 3D estrutural** da câmara e do painel — é o que ainda não temos

---

## 📋 Versão em inglês, pronta para colar

> A ferramenta é em inglês. Este bloco é a Parte 1 traduzida — cole-o direto no site.

```text
Design a thermal test chamber for a technical school project (industrial
electrical course).

THE PROBLEM
A company runs 4-hour thermal tests on electronic boards. The boards sit
inside a climate chamber, powered on and running, while temperature
cycles. If one board dies mid-test, nobody notices until the end — and
the whole test is wasted because you don't know when or at what
temperature it failed.

REQUIREMENTS
1. Control chamber temperature from 5 C to 60 C, alternating cool/heat cycles
2. Keep 2 devices powered inside the chamber during the test
3. Detect immediately when one of them stops working, and identify WHICH one
4. Log temperature, humidity and each device's state with timestamp
5. Remote monitoring and remote commands
6. Emergency stop

CONSTRAINTS
- An Arduino Mega already controls the chamber and CANNOT be replaced.
  New hardware must work alongside it.
- Mains input is 127 V AC
- Everything after the power supply must be touch-safe (24 V or less)
- The 2 devices under test are powered with 24 V DC, ~130 mA each, with
  an individual 500 mA fuse. There is NO mains voltage inside the chamber.
- Must be built on DIN rail like a real industrial panel, assembled by students
- Low budget; parts sourced from AliExpress

QUESTIONS
- What is your component list and wiring?
- How would you detect a device that simply stopped drawing current?
- Would you wire two Peltier modules in series for 24 V, or parallel for 12 V?
- What is most likely to go wrong during assembly?
```

---

## 🔍 Como avaliar a resposta dele

Não aceite de primeira. Três coisas para conferir:

**1. Ele resolveu a detecção de falha?** Se propuser fusível ou disjuntor para isso, **está errado** — proteção não detecta ausência. A resposta certa passa por medir corrente.

**2. As contas fecham?** Confira a corrente das Peltier, a potência da fonte e a bitola dos fios. Ferramenta de IA erra conta com frequência.

**3. Ele leu a tensão certa?** Na primeira rodada ele perguntou como comutar *"127 V AC para os 4 dispositivos"* — premissa errada, os dispositivos são de **24 V CC**. Vale ler as perguntas dele com o mesmo cuidado com que se lê a resposta.

**4. Ele considerou o que acontece quando algo falha?** Ventoinha travada, sensor mentindo, fio rompido. Um projeto que só descreve o funcionamento normal está pela metade.

---

## 📎 Para saber mais sobre a ferramenta

- [Blueprint — página oficial](https://www.blueprint.io/)
- [Review prático, com pontos fracos](https://fabscene.medium.com/can-ai-build-hardware-a-hands-on-review-of-blueprint-the-online-hardware-design-tool-21f07d6694e7)
- [Descrição das funcionalidades](https://moge.ai/product/blueprint)
