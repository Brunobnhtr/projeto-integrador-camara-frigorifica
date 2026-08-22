# Análise técnica do acionamento de cargas — Câmara Frigorífica (Projeto Integrador do Bruno)

> ## ⚠️ DOCUMENTO HISTÓRICO — um ponto foi SUPERADO pelo projeto
>
> Esta análise é de **agosto/2026** e foi escrita quando o **aquecimento ainda seria feito pela
> própria pastilha**, invertendo a polaridade. **Isso mudou:** quem aquece hoje é o **PTC de
> 24 V / 80 W**, num segundo BTS7960. A Peltier **só resfria** — o `L_PWM` dos dois módulos
> está preso em **0 V** por um jumper (fios `S311` e `S312`), e a ponte H trabalha como
> **chave unidirecional**.
>
> **Portanto, leia com ressalva todo trecho que diga que o BTS7960 foi escolhido por
> "permitir inverter a polaridade".** Tecnicamente ele permite; **este projeto não usa.**
> A justificativa válida para a banca está em
> [Doc 32 §"Por que o BTS7960, se a pastilha nunca inverte"](../camada_3_eletrica/32_sinais_e_sensores.md):
> a saída `IS` de corrente, o driver de gate para o PWM de 20 kHz e as proteções internas.
>
> O resto do documento — ripple, COP, fadiga térmica do TEC, inrush do PTC, dimensionamento —
> **continua válido e é a base de várias decisões do projeto.**

## TL;DR
- **O projeto já acerta no essencial de hardware** (aciona Peltier e PTC por driver em ponte-H BTS7960/IBT-2, sem contato mecânico, num sistema 24 Vcc SELV), mas **erra no ponto mais crítico do firmware: o "PWM 1 Hz" no Peltier** — isso é praticamente liga/desliga a cada segundo, arruína o COP (perda Joule ∝ I²) e provoca fadiga termomecânica que mata o TEC precocemente.
- **A correção de maior impacto e menor custo** é trocar o controle de 1 Hz por **corrente quase-contínua** (PWM alto ≥1–20 kHz + filtro LC para ripple <10 %, ou fonte de corrente/buck), com **histerese, dead-time entre aquecer/resfriar, soft-start e watchdog do ventilador do lado quente** — tudo em software não-bloqueante com `millis()`.
- **As três cargas do projeto são todas 24 Vcc**, então SSR/TRIAC/MOC3041 não são necessários para elas (só para os 127 V AC da "subestação"); o que falta é instrumentação/proteção que impressiona banca: leitura de tacômetro do fan, log em SD/RTC, e justificativa de engenharia (NR-10/NBR 5410) das escolhas.

## Key Findings

1. **O repositório existe e é público.** É um "Projeto Integrador — Planta Industrial Didática com Câmara Frigorífica", organizado em camadas (camada_0 a camada_5), com README, BOM em `.xlsx`, desenhos SVG, simulador Python e projeto Wokwi. Não é câmara com compressor: é uma câmara térmica **termoelétrica** (Peltier) didática.

2. **Arquitetura elétrica confirmada pelo README** (não foi possível ler o código-fonte `.ino/.cpp` verbatim — ver *Caveats*): sistema **24 Vcc / fonte de 240 W**, distribuição por fusíveis F1 10 A / F2 2 A / F3 2 A, com dois conversores **LM2596** (24→5/10 V para lógica; 24→12 V para fans/coolers/LEDs/ESP32).

3. **Acionamento das cargas de potência: dois drivers "BTS" (BTS7960/IBT-2, ponte-H).** "BTS #1" aciona **2× TEC1-12706 em série** (24 V, 144 W); "BTS #2" aciona o **PTC cerâmico 24 V, 80 W**. Controle por **Arduino Mega 2560 (PID, PWM 1 Hz)** + **ESP32 (MQTT)**. Consumo calculado ≈166 W / 6,9 A @ 24 V.

4. **Diagnóstico:** a escolha do BTS7960 é boa (sem contato mecânico, suporta a corrente com folga, permite inverter polaridade para aquecer/resfriar — ⚠️ **este último ponto não vale mais: ver o aviso no topo, quem aquece é o PTC**). **O problema grave está no "PWM 1 Hz"**: a 1 Hz o Peltier vê 100 % de ripple de corrente (liga/desliga total), o que (a) reduz drasticamente o COP e o ΔT alcançável e (b) submete as juntas de solda internas do TEC a ciclagem térmica que causa falha por fadiga.

5. **Pontos a confirmar no código** (não legíveis remotamente): pinos exatos, biblioteca PID (provável `PID_v1` de Brett Beauregard), presença de histerese, dead-time entre inverter polaridade, soft-start, watchdog de fan, uso de `delay()` vs `millis()`, e sensores (DS18B20? NTC?).

## Details

### 1) Peltier (TEC1-12706) — o ponto mais crítico

**Corrente e por que "relé de 10 A" seria marginal.** Segundo o datasheet da Hebei I.T. (Shanghai), Rev 2.03, o TEC1-12706 tem (a Th = 25 °C / 50 °C): **Qmax 50 / 57 W, ΔTmax 66 / 75 °C, Imax 6,4 A, Vmax 14,4 / 16,4 V, resistência de módulo 1,98 / 2,30 Ω**. Na prática, a 12 V puxa **~4,3–4,6 A** em regime (a corrente cai conforme o ΔT aumenta). No projeto do Bruno há **dois em série a 24 V**: a resistência total fica ~4 Ω e a corrente do par a 24 V fica **≈6 A**, ou seja, cada módulo vê ~12 V/6 A — no limite do Imax. Um módulo de relé chinês de "10 A" comutando isso repetidamente sofreria com a corrente de partida e com a natureza reativa da carga+cabos, além de que **relé não pode modular** — por isso o BTS7960 é a escolha certa.

**Por que PWM cru degrada o COP (a física).** A capacidade de bombear calor do TEC é Qc = α·Tc·I − ½·I²·R − K·ΔT. O **efeito Peltier (útil) é proporcional a I**, mas o **efeito Joule (parasita) é proporcional a I²**. Como a média de I² de um sinal PWM é sempre maior que o quadrado da média (I²_RMS > I²_média), a mesma corrente média entregue por PWM gera **mais aquecimento Joule** do que se fosse contínua — o calor extra é subtraído do frio líquido. **Aumentar a frequência de PWM não resolve** o penalty de RMS: o módulo responde à forma de onda real da corrente. A Texas Instruments quantificou isso no Application Report **SLUA979A** (Mellin & Muret, 2020): o acionamento por **corrente contínua entregou ΔT 8,1 °C maior e foi 39,2 % mais eficiente** que o PWM, concluindo textualmente que *"constant current drive is definitively preferred over PWM drive"*.

**Recomendação da literatura/fabricantes sobre ripple.** Ferrotec, Marlow, RMT, Same Sky/CUI e Meerstetter convergem: **TEC exige corrente DC suave; ripple <10 % causa <1 % de degradação no ΔT** (Ferrotec recomenda ≤10 %, preferindo <5 %). A Marlow é explícita: *"Thermoelectric coolers require smooth DC current for optimum operation. A ripple factor of less than 10% will result in less than 1% degradation in ∆T. […] Marlow does not recommend an ON/OFF control."* A Same Sky (ex-CUI Devices), no guia *"How to Design a Peltier Module System"*, recomenda filtrar a saída do estágio PWM para **ripple <5 %** (*"filtered so it exhibits less than about 5% ripple"*). A Meerstetter mediu, num teste comparativo (alvo 10 °C, ambiente 24,5 °C, carga 1 W), que o controlador **PWM consumiu mais de seis vezes mais energia — 56 W contra 9 W do controlador DC** — e por isso *"Meerstetter only sells DC driven TEC controllers."* Solução prática de baixo custo para o Bruno: **PWM alto (≥1 kHz, idealmente 20 kHz) + filtro LC** para alisar a corrente, ou **conversor buck em modo corrente controlada**.

**Fadiga por ciclagem térmica.** O TEC é feito de pastilhas semicondutoras soldadas entre cerâmicas com solda de baixo ponto (**BiSn, 138 °C**, conforme datasheet Hebei). A diferença de coeficiente de expansão térmica (CTE) gera tensão mecânica; ligar/desligar rápido inicia e propaga trincas na solda das juntas (a corrente a 1 Hz faz exatamente isso). Fabricantes (Ferrotec, Same Sky/CUI, Z-MAX) apontam a ciclagem térmica como o principal modo de falha e recomendam **operação contínua ou em ciclos longos, com histerese**, e montagem por compressão (não colagem rígida). O datasheet da Hebei cita *"Life expectancy: 200,000 hours"* e *"Failure rate based on long time testings: 0.2%"* — números válidos só para operação em regime estável, **não** para liga/desliga a cada segundo.

**Inverter polaridade (resfriar↔aquecer).** ⚠️ *[Não adotado — ver o aviso no topo. Fica registrado como reserva de projeto, caso o PTC saia.]* O BTS7960 já é uma ponte-H, então a reversão é possível — mas **nunca inverter abruptamente**: é preciso **dead-time** (desligar, esperar a corrente zerar/estabilizar temperatura, só então inverter) para evitar shoot-through no driver e choque térmico no módulo. Alternativas de ponte-H de potência: **BTS7960/IBT-2** (já usado), **DRV8871**, **VNH5019**.

**MOSFET, se fosse acionamento simples (12 V, ~6–15 A).** Para um único TEC a 12 V, um MOSFET canal-N **logic-level** resolve. O **IRLZ44N** (Infineon: VDS 55 V, ID 47 A a 25 °C, VGS(th) 1–2 V, Ptot 83 W) é encontrável no Brasil. Atenção à RDS(on): o valor "22 mΩ" do datasheet é especificado **a VGS = 10 V**; **a 4,5 V (nível lógico) a RDS(on) máxima sobe para ~35 mΩ**. Dissipação P = I²·RDS(on): a 6 A com 35 mΩ → ≈1,3 W (dissipador pequeno basta); a 15 A → ≈8 W (dissipador obrigatório). **O IRF540N NÃO é logic-level** e não satura com 5 V no gate — não usar. Em PWM alta, um **gate driver dedicado** (ex.: TC4420/IR2104) reduz perdas de chaveamento; o BTS7960 já tem driver interno.

**Dissipador+fan do lado quente = vital.** Sem dissipação no lado quente o TEC entra em **fuga térmica** (o lado quente sobe, o ΔT some, o frio some, e o módulo pode passar de 80 °C em segundos, danificando-se). Por isso o **watchdog do fan é feature de segurança, não luxo**.

### 2) PTC — as duas hipóteses

**Hipótese A (a do projeto): PTC 24 Vcc, 80 W.** Ponto essencial: o **inrush**. Frio, o PTC tem resistência baixa (Rmin), então na energização a corrente é bem maior que a nominal em regime — relatos práticos de PTC 24 V mostram **pico de ~9 A caindo para ~3 A** de regime em poucos segundos (o material aquece, a resistência sobe e a corrente se auto-limita). Isso significa: dimensione a chave e o fusível para o **pico**, não para o regime. O BTS7960 (43 A) tem folga enorme; se fosse MOSFET, escolher com boa margem e usar **soft-start** (rampa de PWM) para suavizar o inrush. Controle **liga/desliga com histerese** basta para resistência (ao contrário do Peltier, resistência tolera ciclagem); PWM só compensa se quiser modular potência finamente. Fabricantes de PTC (ex.: DBK) recomendam **fusível retardado** justamente por causa do inrush recorrente a cada partida.

**Hipótese B (genérica): PTC 110/220 V AC.** Aqui **não se usa relé mecânico modulando** (erro grave e comum) nem MOSFET. Usa-se **SSR zero-cross** ou **TRIAC + optotriac zero-cross MOC3041** (IFT 15 mA) acionando um **BTA16** (com snubber 39 Ω/0,01 µF para cargas indutivas), aplicando **derating 3–5×** e dissipador no TRIAC. O zero-cross reduz surto e EMI e é ideal para carga resistiva. Como o PTC do Bruno é 24 Vcc, essa via não se aplica ao acionamento dele — fica como conteúdo didático e para o chaveamento dos 127 V AC da "subestação".

### 3) Fan — acionamento, controle e watchdog

- **Fan 2 fios:** MOSFET low-side (IRLZ44N) com **PWM >20 kHz** (acima da audição) na linha 12 V. Não corrompe nada porque não há tacômetro.
- **Fan 3 fios:** PWM na alimentação **corrompe o tacômetro** (o Hall interno compartilha a alimentação). Se precisar de RPM, controle a tensão de forma linear ou aceite PWM só para on/off.
- **Fan 4 fios (recomendado para o lado quente):** entrada PWM dedicada de **25 kHz** ligada direto a um pino do Arduino, e **fio tach (open-collector) com pull-up** lido por interrupção. Assim você controla a velocidade **e** mede o RPM simultaneamente (o padrão de mercado, ex. Noctua, é 2 pulsos por rotação).
- **Watchdog do fan (feature que valoriza o TCC):** conte os pulsos do tach por janela de tempo; se o RPM cair abaixo de um limiar (fan travado/queimado), **desligue o Peltier automaticamente** e sinalize alarme. Como o fan do lado quente é o que impede a fuga térmica, essa proteção é justificativa de engenharia forte diante da banca.

### 4) Firmware — melhorias concretas

**a) Frequência de PWM no ATmega2560 (sair dos 490/980 Hz do `analogWrite`).** O PWM depende do prescaler no registrador TCCRnB. Para o Mega, tabela prática (clock 16 MHz):

| Timer / pinos | Registrador | Prescalers | Frequências aprox. |
|---|---|---|---|
| Timer0 (D4, D13) | TCCR0B | 1 / 8 / 64 / 256 / 1024 | 62,5 kHz / 7,8 kHz / **976 Hz** / 244 Hz / 61 Hz |
| Timer1 (D11, D12) | TCCR1B | 1 / 8 / 64 / 256 / 1024 | 31,4 kHz / 3,9 kHz / **490 Hz** / 122 Hz / 30 Hz |
| Timer2 (D9, D10) | TCCR2B | 1 / 8 / 32 / 64 / 128 / 256 / 1024 | 31,4 kHz / 3,9 kHz / … / **490 Hz** / … |
| Timer3/4/5 (Mega) | TCCRnB | idem Timer1 | até 31,4 kHz |

> **Não use Timer0** para o PWM (ele controla `millis()`/`delay()`). Para 25 kHz reais com boa resolução, use **Timer1/3/4/5 em Fast PWM modo 14 (TOP=ICRn)**: `F = 16 MHz / (prescaler × (1+TOP))`. Ex.: prescaler 1, ICR=639 → **25,0 kHz** com 640 níveis de duty. Exemplo:
```c
// Timer1, Fast PWM modo 14, 25 kHz em OC1A (D11) — ideal p/ fan 4 fios ou PWM alto do TEC
void setupPWM25k() {
  pinMode(11, OUTPUT);
  TCCR1A = _BV(COM1A1) | _BV(WGM11);
  TCCR1B = _BV(WGM13) | _BV(WGM12) | _BV(CS10); // prescaler 1
  ICR1 = 639;         // TOP -> 25 kHz
  OCR1A = 0;          // duty 0..639
}
void setDuty(uint16_t d){ OCR1A = constrain(d,0,639); }
```

**b) Substituir "PWM 1 Hz" por corrente quase-contínua + controle não-bloqueante.** Em vez de janela de 1 s (que é o mesmo que liga/desliga), rode o PWM do TEC em ≥1 kHz (idealmente 20 kHz) atrás de um filtro LC, e deixe o PID mexer no duty. Estrutura não-bloqueante:
```c
unsigned long tPID = 0, tLog = 0;
const unsigned long PID_MS = 500, LOG_MS = 2000;
void loop() {
  unsigned long now = millis();
  if (now - tPID >= PID_MS) { tPID = now; controleTermico(); }
  if (now - tLog >= LOG_MS) { tLog = now; logSD(); }
  watchdogFan();       // sempre, a cada volta
}
```

**c) Histerese + dead-time entre aquecer/resfriar (evita "gangorra" e choque térmico):**
```c
enum Modo { OFF, RESFRIA, AQUECE };
Modo modo = OFF, modoAlvo = OFF;
float setpoint = 5.0, hist = 1.0;          // banda morta ±1 °C
unsigned long tTroca = 0; const unsigned long DEADTIME = 5000; // 5 s

void controleTermico() {
  float T = lerTemperatura();
  if (T > setpoint + hist)        modoAlvo = RESFRIA;
  else if (T < setpoint - hist)   modoAlvo = AQUECE;
  else                            modoAlvo = OFF;      // dentro da histerese: desliga

  if (modoAlvo != modo) {                 // vai inverter polaridade -> dead-time
    pararPonteH();                        // duty 0 nos dois lados do BTS7960
    if (millis() - tTroca < DEADTIME) return;
    tTroca = millis(); modo = modoAlvo;
  }
  aplicaSaida(modo);                      // com soft-start (rampa de duty)
}
```

**d) Soft-start do Peltier/PTC** (rampa de duty ao ligar, suaviza inrush do PTC e choque no TEC) e **watchdog do fan** (desliga TEC se RPM cair):
```c
volatile unsigned long pulsosTach = 0;
void isrTach(){ pulsosTach++; }
void watchdogFan(){
  static unsigned long t0=0; static unsigned long p0=0;
  if (millis()-t0 >= 1000){
    unsigned long rpm = (pulsosTach - p0) * 30; // 2 pulsos/rev -> *60/2
    p0 = pulsosTach; t0 = millis();
    if (modo==RESFRIA && rpm < 500){ pararPonteH(); alarme("FAN LADO QUENTE"); }
  }
}
```

### 5) Fonte de alimentação
- **Dimensionamento:** Peltier ~144 W + PTC ~80 W + fans/lógica; mas **Peltier e PTC nunca operam juntos** (um resfria, outro aquece). O pior caso é Peltier (≈6 A a 24 V ≈ 144 W) + fans + lógica. A fonte de 240 W / 24 V do projeto dá margem correta (~166 W calculados). **Alimentar tudo pelo USB do Arduino é inviável** — o USB entrega ~500 mA a 5 V (2,5 W); o TEC sozinho pede ~144 W.
- **GND de potência separado do GND de sinal**, unidos em um único ponto (star ground) para não injetar ruído do chaveamento nos sensores.
- **Capacitores de desacoplamento**: eletrolítico volumoso (1000 µF+) na entrada de cada driver + cerâmico 100 nF junto ao CI, para absorver os transientes de corrente do PWM.

### 6) Aspectos que impressionam banca
- **Proteção:** fusível retardado dimensionado pelo inrush do PTC; dead-time; watchdog do fan; corte por sobretemperatura do lado quente (NTC no dissipador).
- **Instrumentação e log:** DS18B20 (digital 1-Wire, ±0,5 °C na faixa −10…+85 °C, vários no mesmo pino) para câmara e lado quente; RTC (DS3231) + SD para datalog; IHM com setpoint/histerese ajustáveis; supervisão MQTT via ESP32 (já previsto).
- **Segurança elétrica/normas:** os 127 V AC confinados em painel fechado (SELV para o público) já seguem boa prática; citar **NR-10** (segurança em instalações elétricas) e **NBR 5410** (instalações elétricas de baixa tensão) como fundamentação; separação física ≥3 mm entre trilhas de 127 V e lógica; nunca montar 127 V em protoboard.

## Recommendations

**Etapa 1 — correção crítica (baixo custo, alto impacto):**
1. **Eliminar o "PWM 1 Hz" no Peltier.** Reprogramar o BTS7960 do TEC para PWM ≥1 kHz (idealmente 20 kHz) e adicionar **filtro LC** na saída para ripple <10 % (meta <5 %, como recomenda a Same Sky/CUI). *Benchmark:* medir a corrente com osciloscópio/alicate e confirmar ripple <10 %; se o ΔT da câmara melhorar e o dissipador do lado quente esquentar menos para o mesmo frio, a correção funcionou (a TI mediu ΔT +8,1 °C e +39,2 % de eficiência com corrente contínua).
2. **Implementar histerese (±1 °C) e dead-time (≥5 s)** na inversão de polaridade.
3. **Watchdog do fan do lado quente** com corte automático do TEC.

**Etapa 2 — robustez de firmware:**
4. Migrar todo o laço para **`millis()` não-bloqueante**; remover `delay()`.
5. **Soft-start** (rampa de duty) para Peltier e PTC.
6. Datalog em SD + RTC; expor RPM, temperaturas e estado no MQTT.

**Etapa 3 — se quiser nota máxima:**
7. Trocar o PWM+LC por **fonte de corrente/buck controlado** para o TEC (corrente DC verdadeira → COP máximo; foi o que rendeu 56 W→9 W no teste da Meerstetter).
8. NTC de sobretemperatura no dissipador do lado quente com corte independente do software (proteção redundante em hardware).

**Gatilhos que mudam a recomendação:** se medir que a corrente do TEC já tem ripple <10 % (improvável com 1 Hz), a Etapa 1.1 vira só ajuste fino. Se o fan do lado quente for de 2 fios, o watchdog exige acrescentar um sensor Hall externo ou trocar por fan de 4 fios.

### Tabela "como está → problema → o que trocar → sugestão"
| Carga | Como está | Problema | O que fazer | Componente (Brasil) |
|---|---|---|---|---|
| Peltier (2× TEC1-12706 série) | BTS7960, PWM 1 Hz | Liga/desliga arruína COP e causa fadiga térmica | PWM ≥1–20 kHz + filtro LC (ripple <10 %) ou buck de corrente; histerese + dead-time + soft-start | Manter BTS7960/IBT-2; indutor 100 µH/10 A + cap 1000 µF; DS18B20 |
| PTC 24 V 80 W | BTS7960 (BTS #2) | Inrush frio subdimensionaria chave menor; PWM 1 Hz desnecessário | Liga/desliga com histerese + soft-start; fusível pelo pico | Manter BTS7960; fusível retardado |
| Fan lado quente | 12 V (linha LM2596) | Sem monitoramento; falha = fuga térmica do TEC | Fan 4 fios: PWM 25 kHz + leitura de tach; watchdog | Fan 4 fios 12 V; pull-up 10 k |
| Controle | Arduino Mega, PID, "PWM 1 Hz", possível `delay()` | 1 Hz ≈ on/off; laço bloqueante | Laço `millis()`; PID sobre duty de PWM alto | — |

### BOM incremental (encontrável no Brasil — Mercado Livre, Baú da Eletrônica, UsinaInfo, Sallêncio)
| Item | Uso | Preço aprox. (R$) |
|---|---|---|
| Módulo BTS7960/IBT-2 43 A | driver TEC/PTC (já no projeto) | 35–55 |
| IRLZ44N (logic-level) | opção MOSFET p/ fan/carga DC | 4–9 |
| DS18B20 (sonda à prova d'água) | câmara e lado quente | 12–25 |
| Indutor 100 µH ≥10 A + cap eletrolítico 1000 µF/35 V | filtro LC do TEC | 15–30 |
| Fan 12 V 4 fios (PWM+tach) | lado quente c/ watchdog | 30–70 |
| MOC3041 + BTA16 + snubber | só se comutar 127 V AC | 10–20 |
| Módulo RTC DS3231 + módulo SD | datalog | 20–40 |

### Esquema textual proposto (cargas 24 Vcc)
```
FONTE 24V/240W ── F1 10A ─┬─ BTS #1 (ponte-H) ── [filtro LC] ── 2× TEC1-12706 (série)
                          │        ▲ PWM ≥1–20kHz + dir (Arduino Mega)
                          └─ F2 ── BTS #2 (ponte-H/half) ── PTC 24V 80W
                                   ▲ on/off + soft-start
        LM2596 24→12V ── Fan lado quente (4 fios): PWM 25kHz + TACH→INT (watchdog)
        LM2596 24→5V  ── Arduino Mega + DS18B20 (câmara/lado quente) + RTC/SD + ESP32(MQTT)
   GND potência ●───────────────● GND sinal  (unidos em 1 ponto / star ground)
```

## Caveats
- **Não foi possível ler o código-fonte `.ino/.cpp` verbatim.** As URLs `raw.githubusercontent.com`, a API de árvore do GitHub e as páginas de subpasta foram bloqueadas pela ferramenta de fetch (o repositório tem 0 stars e não está indexado em buscadores). Toda a arquitetura de hardware citada (BTS7960 acionando 2× TEC1-12706 em série e PTC 24 V; Arduino Mega 2560 com PID e "PWM 1 Hz"; ESP32/MQTT; fonte 24 V) vem do **README real** do repositório e é confiável; já **pinos exatos, biblioteca de PID, presença de histerese/dead-time/soft-start/watchdog e tipo de sensor precisam ser confirmados abrindo os arquivos** (via `git clone` ou o editor web do GitHub — tecle `.` no repositório para abrir o github.dev).
- O "144 W" do README (24 V × 6 A) é a potência elétrica no limite de Imax; 2× TEC1-12706 têm ~120 W nominais (2×60 W) — a diferença é normal (operação perto do Imax).
- Os valores de corrente do TEC1-12706 variam por fabricante (Imax 6,0–6,4 A); use o datasheet do módulo efetivamente comprado.
- Preços em R$ são estimativas de varejo (ago/2026) e variam por loja/quantidade.