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
| Proteção individual | disjuntores | **porta-fusível DIN + fusível 500 mA** |
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

   +24 V ──┬──[ R1 · 1,2 kΩ ]──┤▶├── LED ──┐   ← indica "estou vivo"
           │                                │
           └──[ R2 · 220 Ω / 5 W ]──────────┤   ← consome e aquece
                                            │
   0 V ─────────────────────────────────────┘

   Corrente total: ~130 mA    ·    Potência: ~3 W
```

| Elemento | Função no ensaio |
|---|---|
| **LED** | Sinal visual de que a posição está energizada e funcionando — visível pela porta transparente da câmara |
| **Resistor de potência** | Dissipa ~3 W, simulando o calor que uma placa real gera. **Isso é importante:** a carga térmica dos dispositivos afeta o comportamento da câmara, e um ensaio com a cabine vazia não representa a realidade |
| **Corrente definida** | Dá ao sistema um valor de referência: se cair fora da faixa, algo mudou |

> 💡 **Um detalhe que vale ponto:** as 2 placas somam **~6 W dentro da câmara**. Isso soma à carga térmica calculada no [Doc 12](12_camara_termica.md) (9,5 W → ~15,5 W). **A margem de refrigeração das 2 Peltier (≈ 60 W) absorve isso com folga** — mas o cálculo precisa mostrar que você considerou, porque é exatamente o tipo de coisa que uma banca pergunta.

> ⚠️ **Simular a falha é parte do ensaio.** Coloque em cada placa um **jumper ou micro-chave** que abre o circuito. Assim você demonstra a detecção ao vivo na apresentação: tira o jumper da posição 3, e em menos de 2 segundos o alarme aparece na IHM e no dashboard. **É a melhor demonstração do projeto inteiro** — vale ensaiar antes.

---

## 13.3b ❓ "Se é só um LED, por que 24 V e não 5 V?"

Porque **o LED não é a carga** — ele é só a lâmpada que mostra que a posição está viva. Quem faz o trabalho é o **resistor de potência**, e é ele que decide a tensão.

### O que o DUT precisa fazer

| Parte | Consome | Para quê |
|---|---:|---|
| LED + 1,2 kΩ | ~18 mA · 0,4 W | mostrar que está energizado |
| **Resistor de potência** | **~109 mA · 2,6 W** | **simular o calor de uma placa real** |

Um ensaio térmico com a câmara vazia não representa nada: numa cabine real, as próprias placas aquecem, e esse calor muda o comportamento do controle. Por isso o simulador **tem que esquentar**.

### E aí a conta muda tudo

Para dissipar os mesmos **2,6 W**:

| | **24 V** | 5 V |
|---|---:|---:|
| Corrente | **109 mA** | **524 mA** |
| Resistor | 220 Ω / 5 W | 9,5 Ω / 5 W |
| Duas posições somam | **218 mA** | **1,05 A** |

> ⚡ **Mesma potência, quase cinco vezes menos corrente.** É `P = V × I`: subindo a tensão, a corrente desce na mesma proporção. É exatamente por isso que a rede elétrica transmite em alta tensão.

### 🔥 E o problema que mata a ideia dos 5 V: o shunt

Nossa medição usa um resistor shunt de **4,7 Ω**. Veja o que acontece com ele em cada tensão:

| | 24 V · 109 mA | 5 V · 524 mA |
|---|---:|---:|
| Queda no shunt | 0,51 V | **2,46 V** |
| Percentual da alimentação | **2,1%** — irrelevante | **49%** — inviável |

Em 5 V, o resistor de medição comeria **metade da tensão** antes de ela chegar ao dispositivo. Para evitar isso, o shunt teria que cair para ~0,24 Ω — e aí a leitura desabaria de 123 contagens do ADC para **26**, com perda de resolução de cinco vezes. Voltaríamos a precisar de amplificador.

### E ainda haveria a conta do ramal de 5 V

O barramento de 5 V já alimenta Arduino, tela, RTC, lógica dos BTS e os LEDs da maquete — cerca de **310 mA**. Somar 1,05 A das duas posições levaria o LM2596 a **1,35 A**, esquentando sem necessidade. Nos 24 V, os mesmos 218 mA passam despercebidos.

### 🎓 A regra que fica

> **Carga que dissipa potência vai na tensão mais alta disponível; lógica vai na mais baixa.** É o mesmo motivo pelo qual as Peltier foram ligadas em série para 24 V em vez de paralelo em 12 V.

📌 **Se o DUT fosse mesmo só um LED**, sem carga térmica, 5 V seria a escolha certa. Mas aí o ensaio testaria uma câmara vazia — e o edital pede o contrário.

---

## 13.4 O sensor INA219 — o que ele faz e por que este

| | |
|---|---|
| **O que é** | Sensor de corrente e tensão com interface I²C |
| **Como mede** | Um resistor *shunt* de 0,1 Ω em série com a carga; ele lê a queda de tensão sobre esse resistor e converte em corrente |
| **Faixa** | ±3,2 A com resolução de 0,8 mA — muito mais do que precisamos |
| **Endereços** | **4 selecionáveis** por jumpers: 0x40 e 0x41 |
| **Ligação** | 2 fios de dados (SDA/SCL) compartilhados + alimentação |

**Por que o INA219 e não um ACS712:** o ACS712 é analógico — cada sensor ocuparia **um pino de entrada analógica** do Arduino e traria ruído pelo cabo. O INA219 é digital: **4 sensores no mesmo par de fios**, sem consumir pino nenhum além do I²C que o projeto já usa para o AM2315C e o RTC.

> 📌 **O barramento I²C já existe no projeto** (D20/D21). Acrescentar os 2 INA219 não exige nenhum pino novo — só derivar o mesmo par de fios. É por isso que essa escolha "custa barato" em termos de projeto.

---

## 13.5 Esquema elétrico de uma posição

```
                         ┌─── porta-fusível DIN ───┐
   BD-24V ───────────────┤  F-P1 · fusível 500 mA  ├──────┐
   (24 V permanente)     └─────────────────────────┘      │
                                                           │
                        ┌──────────────────────────────────┴──┐
                        │  INA219  ·  endereço 0x40           │
                        │  VIN+ ──[ shunt 0,1 Ω ]── VIN−      │
                        └────┬──────────────────────────┬─────┘
                             │ SDA · SCL                │
                             │ (para o Arduino)          ▼
                             │                    PLACA SIMULADORA
                             │                     (dentro da câmara)
                             │                           │
   BD-0V ────────────────────┴───────────────────────────┘
```

| Posição | Fusível | Endereço INA219 | Jumper A0 | Jumper A1 |
|---|---|---|---|---|
| **P-1** | F-P1 · 500 mA | **0x40** | — | — |
| **P-2** | F-P2 · 500 mA | **0x41** | ponte | — |
| ~~P-3~~ | ~~F-P3~~ | ~~0x44~~ | — | **reserva** — endereço livre para crescer |
| ~~P-4~~ | ~~F-P4~~ | ~~0x45~~ | — | **reserva** |

> ⚠️ **Configure os endereços ANTES de montar.** Dois sensores com o mesmo endereço no barramento fazem os dois responderem juntos e a leitura vira lixo — e o sintoma (valores que pulam sem sentido) leva horas para ser diagnosticado se você não desconfiar do endereço.
>
> **Teste de aceitação:** rode um *scanner* I²C. Devem aparecer **4 endereços**: 0x38 (AM2315C), 0x68 (DS3231) e os dois dos INA219. Se aparecerem menos, há endereço repetido ou ligação errada.

> 🔌 **Por que as posições vêm do BD-24V permanente, e não do BD-POT:** os dispositivos sob ensaio devem continuar energizados mesmo quando a climatização é interrompida. Se a emergência derrubasse também os DUTs, você perderia o estado do ensaio — e o registro de qual deles já havia falhado.

---

## 13.6 Como o firmware detecta a falha

A lógica é deliberadamente simples — e a simplicidade é o que a torna confiável:

| Corrente lida | Interpretação | Ação |
|---|---|---|
| **110 – 150 mA** | Normal | Nada |
| **< 20 mA** por mais de 2 s | **Dispositivo morto ou fusível aberto** | Alarme `DUT_n_MORTO` · registra no SD · publica por MQTT · LED FAULT |
| **> 300 mA** | Consumo anormal (pré-falha) | Alerta `DUT_n_SOBRECARGA` |
| **0 mA em TODAS as posições** | Provavelmente o barramento caiu, não 4 falhas simultâneas | Alarme de **sistema**, não de dispositivo |

> 💡 **A última linha é o tipo de detalhe que separa um projeto pensado de um projeto copiado.** Se todas as posições zeram ao mesmo tempo, a causa quase certamente é comum — fusível geral, cabo solto, fonte. Reportar "4 dispositivos falharam" seria tecnicamente verdade e praticamente inútil.

**O atraso de 2 segundos é proposital:** evita alarme falso por ruído de leitura ou por transitório no momento em que a Peltier chaveia.

### O que vai para o registro

```
2026-08-13 14:32:07 | ENSAIO #14 | T=-2.1C | SP=-2.0 | DUT1=128mA DUT2=131mA
                                            DUT3=0mA ** FALHA ** DUT4=127mA
```

Cada linha traz **o instante, a temperatura da câmara e a corrente de cada posição**. É isso que permite responder, depois do ensaio: *"a posição 3 parou aos 47 minutos, quando a câmara passava por −2 °C descendo"* — que é uma informação de engenharia, não um "deu erro".

---

## 13.7 Lista de materiais desta camada

| Item | Qtd | Especificação | Custo aprox. |
|---|---:|---|---:|
| **Sensor INA219** (módulo I²C) | **2** ⬇ | Corrente/tensão, ±3,2 A, endereço selecionável | R$ 60 |
| **Porta-fusível DIN 2 vias com interruptor** | 1 | Trilho DIN 35 mm — **F-P1 e F-P2** | R$ 25 |
| Fusível mini automotivo 500 mA | 8 | 4 usos + 4 reservas | R$ 10 |
| Placa ilhada pequena | 4 | ~30 × 40 mm — placas simuladoras de DUT | R$ 8 |
| Resistor 220 Ω / 5 W | 4 | Carga térmica de cada simulador (~3 W) | R$ 8 |
| Resistor 1,2 kΩ 1/4 W | 4 | Limitador do LED indicador | R$ 2 |
| LED 5 mm difuso | 4 | Indicação visual "posição viva" | R$ 2 |
| Micro-chave ou jumper | 4 | **Simulação de falha** para a demonstração | R$ 8 |
| Borne DIN 2,5 mm² | 8 | Entrada/saída de cada posição | R$ 16 |
| **Total** | | | **~R$ 154** |

---

## 13.8 ✅ Checklist de aceitação

- [ ] 2 posições montadas, cada uma com **fusível próprio** de 500 mA
- [ ] Os 2 INA219 com **endereços diferentes** (0x40 e 0x41 — o 0x44 e o 0x45 ficam de reserva), configurados antes da montagem
- [ ] Scanner I²C encontra **6 dispositivos** no barramento
- [ ] Cada placa simuladora consome **130 mA ± 20 mA** medidos com multímetro
- [ ] LED de cada posição aceso com a alimentação ligada
- [ ] Posições alimentadas pelo **BD-24V permanente** — continuam energizadas com a emergência acionada
- [ ] **Ensaio de detecção:** abrir o jumper de cada posição, uma por vez, e confirmar o alarme em **menos de 3 s** na IHM e no dashboard
- [ ] **Ensaio de falha comum:** retirar o fusível geral e confirmar que o sistema reporta **falha de sistema**, não 4 falhas de dispositivo
- [ ] Log em SD registrando corrente de todas as posições a cada ciclo
- [ ] Carga térmica adicional (~12 W) incluída no balanço do [Doc 12](12_camara_termica.md)

---

📄 **Anterior:** [Doc 12 — Câmara Térmica](12_camara_termica.md) · **Próximo:** [Doc 20 — Painel de Comando](../camada_2_painel/20_painel_projeto_e_layout.md)

---

## 13.9 ⭐ E na empresa, com 50 placas? — a pergunta da escala

Esta seção existe porque a banca vai perguntar, e porque a resposta é o que separa um protótipo escolar de um projeto de engenharia: **a bancada tem 2 posições, mas a empresa tem 50.** Ninguém coloca 50 módulos INA219 dentro de um painel.

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

Duas **placas simuladoras de DUT** — as mesmas descritas em §13.3: um LED que mostra "estou viva" e um resistor de potência que consome e aquece.

💡 **Vale montar as duas DIFERENTES**, e isso não é capricho:

| | Posição 1 | Posição 2 |
|---|---|---|
| Resistor | 220 Ω / 5 W | 330 Ω / 5 W |
| Corrente | ~127 mA | ~92 mA |
| Calor | ~2,6 W | ~1,7 W |

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

