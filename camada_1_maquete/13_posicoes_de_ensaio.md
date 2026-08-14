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

## 13.2 Por que 4 posições, e não 50

| | Sistema real da empresa | **Maquete (bancada de validação)** |
|---|---:|---:|
| Posições de ensaio | até 50 | **4** |
| Proteção individual | disjuntores | **porta-fusível DIN + fusível 500 mA** |
| Medição de corrente | não existe (é a melhoria proposta) | **INA219 por posição** |

**4 é o número certo por três motivos:**

1. **Demonstra o problema.** Com 1 posição, "qual delas falhou?" não faz sentido — a pergunta só existe quando há várias.
2. **O INA219 tem exatamente 4 endereços I²C selecionáveis** (0x40, 0x41, 0x44, 0x45). Quatro sensores no mesmo barramento de dois fios, sem nenhum multiplexador. É a solução mais limpa possível.
3. **Cabe no espaço e no orçamento** — ~R$ 120 no total.

> 📌 **Como defender o número na banca:** *"a bancada reproduz o princípio com 4 posições porque a arquitetura é idêntica para 50 — muda a quantidade de canais, não o método. Com 50 posições usaríamos multiplexadores I²C ou módulos de aquisição em rede, que é o passo natural de escala."*

---

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

> 💡 **Um detalhe que vale ponto:** as 4 placas somam **~12 W dentro da câmara**. Isso mais que dobra a carga térmica calculada no [Doc 12](12_camara_termica.md) (9,5 W → ~21,5 W). **A margem de refrigeração das 2 Peltier (≈ 60 W) absorve isso com folga** — mas o cálculo precisa mostrar que você considerou, porque é exatamente o tipo de coisa que uma banca pergunta.

> ⚠️ **Simular a falha é parte do ensaio.** Coloque em cada placa um **jumper ou micro-chave** que abre o circuito. Assim você demonstra a detecção ao vivo na apresentação: tira o jumper da posição 3, e em menos de 2 segundos o alarme aparece na IHM e no dashboard. **É a melhor demonstração do projeto inteiro** — vale ensaiar antes.

---

## 13.4 O sensor INA219 — o que ele faz e por que este

| | |
|---|---|
| **O que é** | Sensor de corrente e tensão com interface I²C |
| **Como mede** | Um resistor *shunt* de 0,1 Ω em série com a carga; ele lê a queda de tensão sobre esse resistor e converte em corrente |
| **Faixa** | ±3,2 A com resolução de 0,8 mA — muito mais do que precisamos |
| **Endereços** | **4 selecionáveis** por jumpers: 0x40, 0x41, 0x44, 0x45 |
| **Ligação** | 2 fios de dados (SDA/SCL) compartilhados + alimentação |

**Por que o INA219 e não um ACS712:** o ACS712 é analógico — cada sensor ocuparia **um pino de entrada analógica** do Arduino e traria ruído pelo cabo. O INA219 é digital: **4 sensores no mesmo par de fios**, sem consumir pino nenhum além do I²C que o projeto já usa para o AM2315C e o RTC.

> 📌 **O barramento I²C já existe no projeto** (D20/D21). Acrescentar os 4 INA219 não exige nenhum pino novo — só derivar o mesmo par de fios. É por isso que essa escolha "custa barato" em termos de projeto.

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
| **P-3** | F-P3 · 500 mA | **0x44** | — | ponte |
| **P-4** | F-P4 · 500 mA | **0x45** | ponte | ponte |

> ⚠️ **Configure os endereços ANTES de montar.** Dois sensores com o mesmo endereço no barramento fazem os dois responderem juntos e a leitura vira lixo — e o sintoma (valores que pulam sem sentido) leva horas para ser diagnosticado se você não desconfiar do endereço.
>
> **Teste de aceitação:** rode um *scanner* I²C. Devem aparecer **6 endereços**: 0x38 (AM2315C), 0x68 (DS3231) e os quatro dos INA219. Se aparecerem menos, há endereço repetido ou ligação errada.

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
| **Sensor INA219** (módulo I²C) | 4 | Corrente/tensão, ±3,2 A, endereço selecionável | R$ 60 |
| Porta-fusível mini automotivo DIN | 4 | Trilho DIN 35 mm — **F-P1 a F-P4** | R$ 40 |
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

- [ ] 4 posições montadas, cada uma com **fusível próprio** de 500 mA
- [ ] Os 4 INA219 com **endereços diferentes** (0x40 / 0x41 / 0x44 / 0x45), configurados antes da montagem
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
