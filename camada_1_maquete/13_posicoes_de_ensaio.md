# CAMADA 1 · Doc 13 — Posições de Ensaio e Detecção de Falha

> ⭐ **Este documento cobre o coração do problema descrito no edital:** os dispositivos que ficam energizados dentro da cabine durante o ensaio térmico, e como o sistema descobre — **na hora** — que um deles parou de funcionar.
>
> ✅ **Pré-requisito:** [Doc 12](12_camara_termica.md) — câmara construída.

---

## 🟢 Em palavras simples

Uma cabine climatizada vazia não testa nada. O que dá sentido a ela é **o que está lá dentro, ligado, sendo submetido a frio e calor**.

Na empresa são até **50 placas ao mesmo tempo**. E aí está o problema que ninguém resolveu: se uma delas morrer no meio de um ensaio de 4 horas, **ninguém percebe**. Descobre-se no fim, e não se sabe em que momento nem em que temperatura parou. O ensaio inteiro se perde.

Este documento resolve isso com uma ideia simples: **se cada posição tiver a sua corrente medida o tempo todo, o sistema sabe na hora quem parou.**

Uma analogia: é a diferença entre um disjuntor e um monitor cardíaco. **O disjuntor grita quando algo consome demais.** O monitor cardíaco percebe quando **para de bater**. Nenhum disjuntor do mundo detecta um dispositivo que simplesmente morreu — porque, eletricamente, não há nada de errado. Só há ausência.

---

## 13.1 Os dois modos de falha — e por que só um deles é detectado hoje

| | **Curto-circuito** | **Dispositivo morto** |
|---|---|---|
| O que acontece | A corrente **dispara** | A corrente **cai a zero** |
| Causa típica | Trilha em curto, componente furado, umidade | Solda fria abrindo com o frio, componente queimado, firmware travado |
| Quem detecta hoje | ✅ O fusível abre | ❌ **Ninguém** |
| Por quê | Excesso de corrente é exatamente o que a proteção existe para ver | Proteção nenhuma detecta ausência. Do ponto de vista elétrico, "não consumir" não é defeito |
| Consequência | Ensaio interrompido, mas você sabe o que houve | **Ensaio continua rodando com uma placa morta dentro.** Perdem-se horas de câmara |

> 🎯 **É o segundo caso que custa caro à empresa** — e é ele que o edital tem em mente ao pedir *"reduzir o tempo de diagnóstico de falhas"*.

> 🌡️ **E há um agravante térmico:** boa parte das falhas em ensaio de temperatura é **intermitente** — a solda fria abre a −5 °C e volta a fechar quando esquenta. Sem medição contínua, essa falha **desaparece antes de você chegar perto do equipamento**. Com medição a cada segundo, ela fica registrada no log com data, hora e temperatura.

---

## 13.2 Por que poucas posições, e não 50

| | Sistema real da empresa | **Maquete (bancada de validação)** |
|---|---:|---:|
| Posições de ensaio | até 50 | **4** |
| Proteção individual | disjuntores | **porta-fusível DIN + fusível 100 mA** |
| Medição de corrente | não existe (é a melhoria proposta) | **INA219 por posição** |

**4 é o número certo por três motivos:**

1. **Demonstra o problema.** Com 1 posição, "qual delas falhou?" não faz sentido — a pergunta só existe quando há várias.
2. **O INA219 tem 16 endereços I²C possíveis**, de 0x40 a 0x4F — os módulos prontos expõem 4 deles por jumper de solda. As duas posições usam **0x40 e 0x41**, no mesmo par de fios, sem multiplexador nenhum. É a solução mais limpa possível nessa escala. ⭐ Como isso escala para as 50 placas da empresa está em [§13.9](#139--e-na-empresa-com-50-placas--a-pergunta-da-escala).
3. **Cabe no espaço e no orçamento** — ~R$ 120 no total.

> 📌 **Como defender o número na banca:** *"a bancada reproduz o princípio com 2 posições porque a arquitetura é idêntica para 50 — muda a quantidade de canais, não o método. Com 50 posições usaríamos multiplexadores I²C ou módulos de aquisição em rede, que é o passo natural de escala."*

---

> ### 🔄 De quatro posições para duas
>
> O ensaio passou a ter **2 posições**, não 4. A pergunta óbvia é se isso não enfraquece a demonstração — e não enfraquece, porque **o que precisa ser provado é a capacidade de distinguir**, não a quantidade.
>
> | | 1 posição | **2 posições** | 4 posições |
> |---|---|---|---|
> | Detecta que algo parou | ✅ | ✅ | ✅ |
> | Diz **qual** parou | ❌ não faz sentido | ✅ | ✅ |
> | Mostra que o outro **continua** normal | ❌ | ✅ | ✅ |
>
> Com duas, você desliga a chave de uma e mostra as duas curvas na tela: uma cai a zero, a outra segue. É exatamente a demonstração que interessa, com metade das peças.
>
> **O que muda no projeto:** 2 INA219 em vez de 4, 1 porta-fusível de 2 vias em vez de 2, e a carga térmica dentro da câmara cai de ~12 W para ~6 W. Os endereços 0x44 e 0x45 ficam livres, então voltar a 4 posições depois é só acrescentar módulos.

## 13.3 O que é uma "placa simuladora de DUT"

**DUT** = *Device Under Test*, dispositivo sob teste. É como se chama, em laboratório, a peça que está sendo ensaiada.

O edital diz que os dispositivos ficam *"energizados e operando em modo de simulação funcional"*. Na maquete não temos as placas reais da empresa, então construímos **simuladores**: pequenas placas que fazem o que interessa para o ensaio — **consomem uma corrente conhecida e dissipam calor**.

```
            PLACA SIMULADORA DE DUT  (uma por posição)

   +24 V ──[ R · resistor ]──┤▶├── LED ──┐
                                          │
                                          └──► retorno, para o shunt na PI-2

   POSIÇÃO 1 · LED vermelho · R = 1,2 kΩ  →  17,6 mA
   POSIÇÃO 2 · LED verde    · R = 2,2 kΩ  →   9,8 mA
```

| Elemento | Função no ensaio |
|---|---|
| **LED** | Sinal visual de que a posição está energizada e funcionando — visível pela porta transparente da câmara |
| **Resistor em série** | Fixa a corrente que a posição consome. É esse valor constante que o sistema aprende como "normal" — e cuja ausência denuncia a falha |
| **Corrente definida** | Dá ao sistema um valor de referência: se cair fora da faixa, algo mudou |

> 💡 **Um detalhe que vale ponto:** as 2 placas somam **~6 W dentro da câmara**. Isso soma à carga térmica calculada no [Doc 12](12_camara_termica.md) (9,5 W → ~15,5 W). **A margem de refrigeração das 2 Peltier (≈ 60 W) absorve isso com folga** — mas o cálculo precisa mostrar que você considerou, porque é exatamente o tipo de coisa que uma banca pergunta.

> ⚠️ **Simular a falha é parte do ensaio.** Coloque em cada placa um **jumper ou micro-chave** que abre o circuito. Assim você demonstra a detecção ao vivo na apresentação: tira o jumper da posição 3, e em menos de 2 segundos o alarme aparece na IHM e no dashboard. **É a melhor demonstração do projeto inteiro** — vale ensaiar antes.

---

## 13.3b ❓ Sem carga térmica — o DUT é só LED e resistor

**Decisão tomada:** o simulador **não** vai reproduzir o calor de uma placa real. Ele existe para uma coisa só — **consumir uma corrente conhecida e estável**, para que o sistema possa perceber quando ela some.

```
   +24 V ──[ R ]──┤▶├── LED ──► retorno
```

| | Posição 1 | Posição 2 |
|---|---|---|
| LED | vermelho | verde |
| Resistor | **1,2 kΩ · 1/2 W** | **2,2 kΩ · 1/2 W** |
| Corrente | **17,6 mA** | **9,8 mA** |
| Calor gerado | 0,37 W | 0,21 W |

**As correntes são propositalmente diferentes.** Com dois valores distintos, fica provado que o sistema compara cada posição **com o normal dela** — e não com um limiar único. Numa fábrica, as 50 placas nunca consomem igual.

### ~~E isso obriga a mudar o shunt~~ — não obriga mais

Esta seção dimensionava o shunt de 47 Ω para que 17,6 mA virassem 0,83 V legíveis pelo conversor
A/D. **Com a detecção digital não há shunt nenhum:** ninguém precisa saber que a corrente é
17,6 mA, só que ela não é zero. Ver [§13.4](#134--a-detecção-virou-digital--o-que-mudou-e-por-quê).

⚠️ O que a corrente do DUT ainda decide é **outra coisa**: se o sensor consegue enxergá-la. É por
isso que o fio dá 10 voltas no furo do WCS2702.

### Por que continua em 24 V, e não 12 V

Os dois funcionariam. O que decide é **de onde vem cada barramento**:

| | BD-24V | BD-AUX (12 V) |
|---|---|---|
| O que mais alimenta | ESP32, sinaleiros, comando | **as ventoinhas** |
| Qualidade da tensão | estável | oscila quando as ventoinhas partem |

⚠️ **Ventoinha travada puxa corrente de rotor bloqueado**, e isso afunda o barramento por um instante. Se os DUTs estivessem no mesmo 12 V, aquele afundamento mudaria a corrente deles — e o sistema acusaria falha onde não há.

**Os 0,24 W a mais desperdiçados nos resistores valem muito menos que um alarme falso.**

### O que se perde sem a carga térmica

Vale registrar, porque a banca pode perguntar: os simuladores geram 0,6 W no total, então **a câmara vai se comportar como se estivesse vazia**. Na cabine real, as placas ajudam a aquecer e atrapalham a resfriar.

Isso **não invalida a demonstração** — o que está sendo provado é a detecção de falha, não o desempenho térmico. Mas convém dizer na apresentação que, com placas reais dentro, o ciclo de resfriamento seria um pouco mais lento.


## 13.4 ⭐ A detecção virou digital — o que mudou, e por quê

> 📌 **Decisão de 19/08/2026.** A versão anterior media a corrente de cada posição com shunt de
> 47 Ω, multiplexador CD74HC4067 e um INA219 de referência, tudo numa placa própria (a PI-2). Isso
> **saiu inteiro**. Em lugar dele entra um sensor de corrente com **saída digital**, lido por um
> pino do Arduino.

### A pergunta sempre foi de um bit

O ensaio precisa saber uma coisa só: **aquela posição ainda está funcionando?**

| Resposta | O que aconteceu |
|---|---|
| Passa corrente | o dispositivo está vivo |
| Corrente zero | ou ele queimou, ou o fusível/disjuntor abriu, ou alguém desligou a chave |

Para o registro do ensaio, os três casos da segunda linha são a mesma coisa: **aquela posição
parou de ensaiar, e isso tem que aparecer**. Medir 17,6 mA com 1 % de precisão para no fim
comparar com zero era um caminho longo para uma resposta binária.

### O que saiu, e o que entrou

| | Antes | Agora |
|---|---|---|
| Peças | 2 shunts 47 Ω 1 % · mux CD74HC4067 · INA219 · placa PI-2 inteira | **1 sensor com saída digital** |
| Pinos do Mega | 4 bits de seleção + 1 entrada analógica + I²C | **1 pino digital** |
| Fios no painel | 6 (4 bits, o analógico e o par I²C) | **1** |
| O que o firmware faz | escolhe canal, lê A/D, converte, compara com faixa | `digitalRead()` |
| Onde mora a decisão | no software, depois de converter | **no sensor, ajustado por trimpot** |

### Os dois sensores, e onde cada um serve

| | **WCS2702** (efeito Hall) | **SZC23** (chave de corrente) |
|---|---|---|
| Para | equipamento em **corrente contínua** | equipamento em **corrente alternada** |
| Como lê | o fio passa por dentro do furo | o cabo passa pela janela, sem abrir o circuito |
| Alimentação | 5 V do Arduino | **nenhuma** — ela se alimenta do campo do próprio cabo |
| Saída | `DOUT`, ajustável no trimpot | **contato seco**, isolado da rede |
| Sensibilidade | 1,0 mV/mA | fecha a partir de **0,5 ± 0,2 A** |

> ⚠️ **A SZC23 não enxerga o DUT desta maquete.** O simulador de posição consome 17,6 mA, e o
> mínimo dela é 0,5 A — **trinta vezes mais**. Ela é o sensor da planta real, onde os equipamentos
> puxam amperes de 127 V. Para o protótipo de bancada, o sensor é o WCS2702.

### ⭐ E o truque que faz o WCS2702 enxergar 17,6 mA

Com 1,0 mV/mA, 17,6 mA produzem **17,6 mV** — dentro do ruído e da deriva térmica do próprio
sensor. A saída não é trocar o sensor: é **dar voltas no furo**.

```
    fio do +24 V, vindo do fusível
              │
              │   ╭───────────╮
              ╰──▶│ ()()()()  │  10 voltas pelo mesmo furo,
                  │  WCS2702  │  TODAS no mesmo sentido
              ╭───│           │
              │   ╰───────────╯
              ▼
       para a posição de ensaio, na câmara

    o sensor enxerga  10 × 17,6 mA = 176 mA  →  176 mV
```

O campo magnético é proporcional ao produto **corrente × número de espiras**. É o mesmo princípio
de um transformador de corrente com relação de espiras — só que aqui a relação é feita à mão, com
o fio que já ia passar por ali.

⚠️ **Todas as voltas no mesmo sentido.** Uma volta invertida cancela outra, e o sensor passa a ver
menos corrente do que existe.

---

## 13.5 Esquema elétrico — passo a passo da fiação

> 🧾 **Este é o roteiro de bancada.** A versão com caixa de conferido está na aba
> **Guia de montagem → fase A → passo A-06** do aplicativo.

### A · Circuito de força da posição (o que se liga primeiro)

| # | De | Para | Fio | Cuidado |
|---:|---|---|---|---|
| 1 | **BD-24V · saída 4** | entrada `V+` do porta-fusível **F-P** | 0,5 mm² vermelho | ⭐ 24 V **permanente**: a posição continua energizada na emergência, e é isso que permite registrar o que aconteceu |
| 2 | **F-P · F-P1** (saída, depois do fusível de 100 mA e da chave) | **10 voltas no furo do SC-1** | 0,5 mm² vermelho | ⚠️ todas no mesmo sentido |
| 3 | saída das voltas | borne **+24 V** da posição, dentro da câmara | 0,5 mm² vermelho | sai pelo prensa-cabo PG13-2 |
| 4 | borne **retorno** da posição | **BD-0V · Z22** | 0,5 mm² azul | parafuso **próprio** na barra — retorno pendurado no do vizinho vira erro de medição do vizinho |

### B · Circuito de sinal (o que diz ao Arduino)

| # | De | Para | Fio | Cuidado |
|---:|---|---|---|---|
| 5 | **BD-5V · saída 8** | `VCC` do SC-1 | 0,25 mm² violeta | o módulo aceita 3 a 12 V; aqui são 5 V |
| 6 | **BD-0V · Z17** | `GND` do SC-1 | 0,25 mm² azul | |
| 7 | `DOUT` do SC-1 | **Mega · D22** | 0,25 mm² cinza | ⭐ **nada no meio**: sem resistor, sem divisor. O pino usa o pull-up interno |

### C · Ajuste e prova (com o firmware já gravado)

1. Grave `firmware/detector_corrente/detector_corrente.ino` e abra o monitor serial em **115200**.
2. Ligue a chave do porta-fusível. O LED da posição acende.
3. Gire o **trimpot** do sensor devagar até o serial dizer `Equipamento em funcionamento`.
4. **Desligue a chave.** Em menos de 1 s: `FALHA: Corrente Zero detectada`.
5. **Religue.** Em 0,2 s volta para `Equipamento em funcionamento`.
6. ⭐ **Teste do fio partido:** com tudo ligado, desconecte o fio do `D22`. Tem que dar **FALHA**.
   Se disser "funcionando", o pull-up não está ativo ou a polaridade está trocada — e o sistema
   ficaria cego justamente quando um cabo se soltasse.

### D · Se o equipamento for de corrente alternada (a planta real)

A SZC23 é **não-invasiva e sem alimentação**: o cabo de fase passa pela janela e ela entrega um
contato seco.

| # | Ligação | Cuidado |
|---:|---|---|
| 1 | Passe **apenas a fase** pela janela da SZC23 | ⚠️ Fase e neutro juntos = campo se cancela = ela nunca fecha |
| 2 | Um fio do contato seco no **pino digital** do Arduino | sem polaridade |
| 3 | O outro fio do contato seco no **GND** do Arduino | |
| 4 | Ajuste o potenciômetro dela para a corrente do equipamento | faixa 0,2 a 30 A |

> 🔥 **É o contato seco que mantém os 127 V longe do Arduino.** Ele é galvanicamente isolado do
> cabo medido. Nunca substitua essa ligação por "um fio no vivo com divisor de tensão": em AC,
> divisor não isola, e o que chega no pino é a rede com outra amplitude.

> ⚡ **Segurança na bancada com AC:** trabalhe desenergizado, monte a SZC23 antes de energizar, e
> mantenha o cabo de 127 V dentro da caixa fechada. O painel deste projeto foi desenhado com os
> 127 V confinados na subestação justamente para que a bancada inteira seja SELV.

---

## 13.6 Como o firmware detecta a falha

O código completo, comentado, está em
[`firmware/detector_corrente/detector_corrente.ino`](../firmware/detector_corrente/detector_corrente.ino).
A lógica cabe em cinco linhas de descrição:

| Passo | O que faz | Por quê |
|---|---|---|
| `pinMode(D22, INPUT_PULLUP)` | liga o resistor interno | ⭐ pino solto vira nível ALTO = FALHA. O defeito cai do lado do alarme |
| amostra a cada 5 ms | 200 leituras por segundo | barato, e dá margem para o filtro |
| guarda **quando viu corrente pela última vez** | | em AC a corrente cruza o zero 120×/s: sem isso, o sistema alarmaria sozinho |
| **1 s sem nenhuma amostra com corrente** → FALHA | tempo de confirmação | o Doc 13 exige alarme em menos de 2 s |
| **0,2 s com corrente** → volta a funcionar | | religar é boa notícia, e pode chegar rápido |

### O que vai para o registro

Cada mudança de estado é impressa com o instante em que ocorreu, e a mesma informação alimenta o
log em SD e o JSON do ESP32 — que já existiam. **A detecção mudou; o que se faz com ela, não.**


## 13.7 Lista de materiais desta camada

| Item | Qtd | Especificação | Custo aprox. |
|---|---:|---|---:|
| ⭐ **Sensor de corrente WCS2702** | 1 | Hall, ±2 A, 1,0 mV/mA, saída digital com trimpot | R$ 25 |
| **Porta-fusível DIN 1 via com interruptor** | 1 | Trilho DIN 35 mm — o `F-P` | R$ 15 |
| Fusível tubular 5×20 mm · 100 mA | 4 | 1 uso + 3 reservas | R$ 6 |
| Placa ilhada pequena | 2 | ~30 × 40 mm — corpo da placa simuladora (sai das sobras da PI-1) | R$ 4 |
| Resistor 1,2 kΩ · 1/2 W | 2 | Limitador do LED da posição | R$ 2 |
| LED 5 mm difuso vermelho | 2 | Indicação visual "posição viva" | R$ 2 |
| Micro-chave ou jumper | 2 | **Simulação de falha** para a demonstração | R$ 4 |
| Borne DIN 2,5 mm² | 4 | Entrada e retorno da posição | R$ 8 |
| **Total** | | | **~R$ 66** |

| 🗑️ Saiu da lista | Por quê |
|---|---|
| ~~2 × INA219~~ (R$ 60) | Media a corrente que ninguém mais precisa medir |
| ~~Multiplexador CD74HC4067~~ | Existia para levar 16 canais analógicos a uma entrada A/D |
| ~~2 × shunt 47 Ω 1 %~~ | Convertia corrente em tensão para o A/D ler |
| ~~Placa PI-2 inteira~~ | Era a casa dos três acima |
| ~~1 fusível e 1 posição de ensaio~~ | O protótipo passou a ter **um** canal de teste |

> 💰 **A troca economizou ~R$ 88 e uma placa inteira** — mas o que mais pesa não é o dinheiro: são
> 6 fios, 5 pinos do Arduino e uma placa a menos para soldar e depurar.

---

## 13.8 ✅ Checklist de aceitação

- [ ] 1 posição de ensaio montada, com **fusível de 100 mA e chave** no `F-P`
- [ ] ⭐ **10 voltas** do fio de +24 V pelo furo do WCS2702, todas no mesmo sentido
- [ ] Sensor alimentado com 5 V (BD-5V saída 8) e GND no BD-0V · Z17
- [ ] `DOUT` do sensor no **D22** do Mega, **sem nada no meio**
- [ ] Retorno da posição no **BD-0V · Z22**, com parafuso próprio
- [ ] Posição alimentada pelo **BD-24V permanente** — continua energizada com a emergência acionada
- [ ] Trimpot ajustado: com o equipamento ligado o serial diz `Equipamento em funcionamento`
- [ ] **Ensaio de detecção:** desligar a chave → `FALHA: Corrente Zero detectada` em **menos de 1 s**
- [ ] **Ensaio de recuperação:** religar → volta a `Equipamento em funcionamento` em 0,2 s
- [ ] ⭐ **Ensaio do fio partido:** com tudo ligado, desconectar o fio do `D22` → tem que dar **FALHA**
- [ ] LED da posição aceso com a alimentação ligada
- [ ] Log em SD registrando a mudança de estado com a hora do RTC

---

📄 **Anterior:** [Doc 12 — Câmara Térmica](12_camara_termica.md) · **Próximo:** [Doc 20 — Painel de Comando](../camada_2_painel/20_painel_projeto_e_layout.md)

---

## 13.9 ⭐ E na empresa, com 50 placas? — a pergunta da escala

Esta seção existe porque a banca vai perguntar, e porque a resposta é o que separa um protótipo escolar de um projeto de engenharia: **a bancada tem 1 posição, mas a empresa tem 50.**

> 📌 **A mudança para detecção digital muda a resposta desta seção, e para melhor.** O que vem
> abaixo foi escrito quando cada posição era MEDIDA por um INA219 — e a discussão era como
> multiplexar 50 medições. Com um bit por posição, o problema deixa de ser de instrumentação e
> vira de **entrada digital**, que é bem mais barato de escalar:
>
> | Como | Pinos gastos | Canais |
> |---|---|---|
> | Direto no Mega | 1 por canal | ~29 sobrando neste projeto |
> | 74HC165 (registrador de deslocamento) | 3 no total | 8 por CI |
> | **MCP23017 (expansor I²C)** | **2 no total** | **16 por CI** |
>
> ⭐ **Quatro MCP23017 no mesmo par I²C que já existe** (por causa do RTC) dão **64 canais com 2
> pinos**. E o cálculo de tempo de varredura abaixo continua valendo — a falha continua sem pressa.
>
> O texto original fica porque a **lógica de escala** que ele ensina (a unidade não é o sensor, é
> o suporte instrumentado) não mudou, e porque mostra o caminho percorrido.

### Primeiro, um acerto: o INA219 tem 16 endereços, não 4

Os módulos prontos trazem **dois jumpers** de solda, que dão 4 combinações — daí vem a ideia de que são 4 endereços. Mas o **chip** tem dois pinos de endereço (A0 e A1) e cada um aceita **quatro** ligações diferentes: GND, V+, SDA ou SCL.

`4 × 4 = 16 endereços`, de **0x40 a 0x4F**.

Então, no barramento, o limite não são 4 sensores — são **16**. Para chegar a 50, ainda falta, mas o problema real aparece antes disso.

### O problema não é o endereço. É o módulo.

Mesmo que houvesse 50 endereços, **50 plaquinhas dentro de um painel** seriam:

- 50 × 4 fios de I²C para derivar
- 50 pontos de solda de jumper de endereço, todos diferentes
- um barramento I²C com capacitância alta demais para funcionar
- e um painel impossível de manter

**Pensar em "um módulo por canal" é pensar como maker.** A indústria não faz isso — e não porque seja cara, mas porque existe um jeito melhor.

### Como a indústria resolve: multiplexação

A ideia central é separar duas coisas que o módulo pronto junta:

| | O que é | Quantos precisam |
|---|---|---|
| **Ponto de medição** | um resistor *shunt* em série com a carga | **um por canal** — 50 |
| **Circuito de medição** | o amplificador e o conversor A/D | **um só**, que visita os 50 |

Um **multiplexador analógico** é uma chave eletrônica que conecta um de vários pontos à mesma entrada. Um CD74HC4067 tem 16 canais e custa alguns reais; quatro deles dão 64 canais.

```
   shunt 1 ──┐
   shunt 2 ──┤
   shunt 3 ──┤──►[ MULTIPLEXADOR ]──►[ amplificador ]──►[ ADC ]──► leitura
      ...    ┤          ▲
   shunt 50 ─┘     o firmware escolhe
                    qual canal ler
```

### ⭐ Por que isso funciona aqui: a falha não tem pressa

Multiplexar significa **não medir todos ao mesmo tempo** — você lê um, depois o outro. Em muitos sistemas isso seria inaceitável. Aqui, não:

> **Um dispositivo morto continua morto.** Ele não volta a funcionar enquanto você olha para o vizinho.

O ensaio dura **4 horas**. Detectar a falha em 5 segundos ou em 5 milissegundos dá exatamente no mesmo. Com um ADC lendo 100 canais por segundo, cada uma das 50 posições é visitada **duas vezes por segundo** — folgado.

**É a natureza da falha que autoriza a simplificação.** Se o problema fosse detectar um pico de corrente de microssegundos, a multiplexação não serviria e cada canal precisaria do seu circuito.

### E na prática, numa fábrica?

Existe o caminho do **CLP**, com cartões de entrada analógica de 8 ou 16 canais num bastidor. É o padrão da indústria pesada, e funciona.

> 🏭 **Mas neste caso específico ele não é a melhor resposta:** a empresa **já usa Arduino como padrão de fábrica**. Propor CLP significaria trocar de plataforma, de ferramenta de programação e de peça de reposição — e treinar de novo quem faz manutenção. O ganho técnico não paga esse custo.
>
> **A solução para 50 posições cabe no Arduino**, e está detalhada no [Doc 14](14_escala_e_cabeamento.md): multiplexadores CD74HC4067 e shunts, ~R$ 100 no total.

| Escala | Solução | Observação |
|---|---:|---|
| 2 posições | **2 × INA219** no I²C | é o nosso protótipo |
| até 16 | INA219 direto | usando os 16 endereços do chip |
| até 64 | shunt + multiplexador + 1 ADC | ~R$ 150 em componentes |
| 50+ industrial | **4 cartões analógicos de 16 canais em CLP** | ou I/O remoto em Modbus RTU |

Um bastidor de CLP com quatro cartões de entrada analógica é **absolutamente banal** numa fábrica. O que parecia um problema insolúvel — "50 sensores!" — é, na verdade, o caso de uso normal de um equipamento que existe há décadas.

📌 **I/O remoto merece nota.** Em vez de puxar 50 pares de fios analógicos até o painel, colocam-se módulos **junto das câmaras**, e eles conversam com o CLP por **Modbus RTU sobre RS-485** — dois fios para todos. Sinal analógico longo é sinal ruim; digitalizar perto da fonte é a regra.

### 🔌 E no nosso protótipo, o que entra nas duas posições?

Duas **placas simuladoras de DUT** — as mesmas descritas em §13.3: um LED em série com um resistor, consumindo uma corrente conhecida e estável.

💡 **Vale montar as duas DIFERENTES**, e isso não é capricho:

| | Posição 1 | Posição 2 |
|---|---|---|
| Resistor | 1,2 kΩ · 1/2 W | 2,2 kΩ · 1/2 W |
| Corrente | **17,6 mA** | **9,8 mA** |
| Leitura no shunt de 47 Ω | 0,83 V · 170 contagens | 0,46 V · 94 contagens |

**Por quê:** com correntes diferentes, você prova que o sistema **não usa um limiar único**. Cada posição aprende a corrente normal dela e compara consigo mesma. Isso é o que acontece na empresa, onde as 50 placas nunca são idênticas — e com duas placas iguais essa qualidade do projeto fica invisível.

📌 **Qualquer coisa que consuma uma corrente estável serve como DUT.** Não precisa ser uma placa de verdade: o que o sistema mede é corrente, não função. Se um dia quiser ensaiar uma placa real, é só ligá-la no lugar do simulador.

---

### 🏭 E o CLP? Seriam 50 entradas?

**Não. E é aqui que a resposta muda de forma.**

Ligar 50 entradas analógicas no CLP funcionaria, mas é a solução cara e trabalhosa:

- 4 cartões de entrada analógica, e cartão analógico é caro
- **100 fios** (par por canal) atravessando a fábrica até o painel
- 100 pontos de mau contato para procurar quando algo falhar
- sinal analógico percorrendo dezenas de metros ao lado de motores

### A unidade de escala não é o sensor. É o suporte instrumentado.

Em ensaio térmico de verdade, os dispositivos não ficam soltos — eles são encaixados numa **placa de suporte** (*burn-in board*). E é ela que carrega a medição:

```
   ┌─────────── SUPORTE INSTRUMENTADO — 16 posições ───────────┐
   │                                                            │
   │  [DUT][DUT][DUT]...[DUT]     ← 16 soquetes                │
   │    │    │    │       │                                     │
   │   shunt shunt shunt shunt    ← 16 resistores de medição   │
   │    └────┴────┴───────┘                                     │
   │              ▼                                             │
   │      [ mux ]─►[ ADC ]─►[ microcontrolador ]                │
   │                              │                             │
   └──────────────────────────────┼─────────────────────────────┘
                                  ▼
                        RS-485 · dois fios
                                  │
                        outros suportes ─┤
                                  ▼
                              [ CLP ]
```

**50 dispositivos = 4 suportes de 16.** No CLP entram **dois fios**, não cem.

### ⭐ E o CLP não precisa ver 50 valores

Este é o ponto que mais economiza. Pergunte-se o que o CLP realmente precisa saber:

> Não é *"qual a corrente da posição 23"*. É **"alguma posição caiu?"** — e, se caiu, qual.

Então o microcontrolador de cada suporte faz a comparação **localmente**, onde o sinal está limpo e curto, e manda ao CLP uma **palavra de alarme**: 16 bits, um por posição. Quatro suportes cabem em **4 palavras de 16 bits** — 8 bytes para o sistema inteiro.

O valor bruto da corrente continua sendo lido e gravado, mas por quem está perto dele. **Manda-se a conclusão, não o dado cru.**

| | 50 entradas no CLP | 4 suportes instrumentados |
|---|---|---|
| Fios até o painel | ~100 | **2** |
| Cartões no CLP | 4 analógicos | **1 porta serial** |
| Onde o sinal viaja longe | analógico ⚠️ | **digital** ✅ |
| Acrescentar 16 posições | mais um cartão + 32 fios | **mais um suporte no mesmo par** |
| Trocar um suporte defeituoso | desconectar 32 fios | **um conector** |

### 🎓 A regra por trás disso

> **Digitalize perto da fonte.** Sinal analógico é frágil: ele degrada com distância, capta ruído e não avisa quando erra. Bit não degrada — ou chega certo, ou não chega.

É o mesmo princípio que já aplicamos no painel, na separação de canaletas de potência e sinal. Aqui ele aparece em escala maior: em vez de proteger o sinal analógico ao longo de 30 metros, **elimina-se o percurso analógico**.

📌 **Repare que a nossa PI-2 já é um suporte instrumentado em miniatura** — 2 posições, medição junto da carga, e só o resultado saindo por um barramento digital (o I²C). A arquitetura da bancada e a da fábrica são a mesma; muda a contagem.


### 🤔 E a alternativa mais barata de todas: perguntar à placa

Existe um caminho que dispensa medir corrente: **a própria placa avisar que está viva.**

As placas sob ensaio são eletrônicas — muitas têm porta serial ou um pino livre. Um *heartbeat* — um pulso a cada segundo — detecta a falha sem nenhum sensor.

| | Medir corrente | Heartbeat da placa |
|---|---|---|
| Custo por canal | shunt + canal de ADC | um fio |
| Funciona com **qualquer** dispositivo | ✅ | ❌ só se ele cooperar |
| Detecta placa **travada mas consumindo** | ❌ | ✅ |
| Detecta placa **morta** | ✅ | ✅ |
| Exige mudar o firmware do DUT | ❌ | ✅ |

**Os dois se complementam, e é assim que se faz quando o ensaio é sério:** a corrente diz se há vida elétrica, o heartbeat diz se há vida lógica. Uma placa pode consumir corrente normal e estar com o firmware travado — só o heartbeat pega isso.

🎓 **Para a defesa:** medir corrente é a escolha certa **para o protótipo**, porque funciona com qualquer dispositivo, sem exigir nada dele. Numa implantação real, valeria propor os dois — e saber explicar por quê é o que mostra domínio do problema.

