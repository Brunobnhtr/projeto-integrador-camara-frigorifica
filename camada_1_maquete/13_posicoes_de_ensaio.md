# CAMADA 1 · Doc 13 — Posições de Ensaio e Detecção de Falha (8 posições de LED · Modbus RTU)

> ✅ **Documento reescrito em 31/10/2026.** A versão anterior descrevia **2 lâmpadas
> W5W de 24 V + 2 ACS712 nas entradas A2/A3**. Essa arquitetura **não existe mais**:
> a lâmpada saiu do projeto, o ACS712 saiu da lista de compras e A2/A3 estão livres.
> O que está aqui é o que se monta.
>
> 👉 **A fonte da verdade elétrica é [`../placa_leds/PLACA_LEDS.md`](../placa_leds/PLACA_LEDS.md)**,
> inclusive o §9, que responde "qual é o caminho da lâmpada?".

> ⭐ **Este documento cobre o coração do problema descrito no edital:** os dispositivos que ficam energizados dentro da cabine durante o ensaio térmico, e como o sistema descobre — **na hora** — que um deles parou de funcionar.
>
> ✅ **Pré-requisito:** [Doc 12](12_camara_termica.md) — câmara construída.

> 🔄 **Geometria vigente.** Câmara de **300 × 200 × 250 mm internos (15,00 L)**,
> **14,09 L livres** depois dos dois dutos de 40 × 40 e do dissipador frio.
> As 8 posições **não ficam soltas no volume**: elas moram em duas placas de
> 95 × 75 mm, sustentadas por duas tiras de alumínio e espaçadores M3 em Z 110. O volume
> que sobra para o ar é o que o projeto chama de útil — e ele é medido, não estimado.

---

## 🟢 Em palavras simples

Uma cabine climatizada vazia não testa nada. O que dá sentido a ela é **o que está lá dentro, ligado, sendo submetido a frio e calor**.

Na empresa real, são até **50 placas ao mesmo tempo**. E aí está o problema que o projeto resolve: se uma delas morrer (ou o conector soltar) no meio de um ensaio de 4 horas, **ninguém percebe**. Descobre-se no fim, e não se sabe em que momento nem em que temperatura a falha ocorreu. O ensaio inteiro se perde.

A solução é o monitoramento contínuo: **se cada posição tiver a sua corrente medida o tempo todo e reportada ao controlador, o sistema sabe na hora quem parou.**

A maquete faz isso com **8 posições de LED em 12 V**, em duas placas de 95 × 75 mm, e **um** módulo de aquisição em Modbus RS-485. O número de posições é didático; a arquitetura é a mesma da planta de 50.

---

## 13.1 O abismo entre bancada e indústria — e como ele encolheu

### Como é a aplicação real na empresa
- **Carga:** até 50 equipamentos (DUTs) consumindo energia pesada.
- **Corrente:** alternada (127 V ou 220 V), na ordem de 0,5 A a 5 A por posição.
- **Proteção:** 50 minidisjuntores termomagnéticos DIN (curva B ou C, 2 A a 6 A).
- **Distância:** o quadro de força pode estar a dezenas de metros do painel de monitoramento.

### Como a maquete reproduz
- **Carga:** 8 posições de **LED de 5 mm em 12 V** com resistor de 1 kΩ, ~10 mA cada. Não são 50, e não são 208 mA.
- **Proteção:** não existe minidisjuntor comercial de 10 mA para trilho DIN. Usa-se **porta-fusível seccionável DIN com fusível de vidro de 1 A** por posição — a gavetinha abre o circuito e serve de "simular falha" no ensaio.
- **Distância:** tudo dentro de um painel de 700 × 700 mm.
- **Comunicação:** ⭐ **RS-485 Modbus RTU, a mesma da planta.**

> 🎓 **O que mudou nesta revisão, e é o argumento mais forte para a banca:** antes, a
> bancada lia em analógico (A2/A3) e a indústria em Modbus — o "abismo" era grande e
> a defesa era "no protótipo não vale a pena". **Agora a bancada já fala Modbus.** A
> diferença entre a maquete e a planta deixou de ser o protocolo e passou a ser só
> **quantidade**: 1 módulo com 8 canais em uso, contra 7 módulos com 50. O que se
> ensina na maquete é exatamente o que se instala na fábrica.

---

## 13.2 A carga de ensaio — 8 posições de LED em 12 V

Cada posição é **um LED de 5 mm difuso em série com um resistor de 1 kΩ**, alimentada por 12 V:

```
12 V ──► 1 kΩ ──► LED ──► retorno (medido)
(12 − 2) / 1000 = 10 mA
```

**Por que 10 mA é suficiente agora, e 208 mA era necessário antes.** Esta é a
pergunta que a banca vai fazer, e a resposta é a diferença entre os dois
instrumentos:

| | ACS712-5A (arquitetura antiga) | N4AIC24 (arquitetura vigente) |
|---|---|---|
| Fundo de escala | 5 A | 0,020 A (20 mA) |
| Resolução | ~185 mV/A num ADC de 10 bits → **~26 mA por contagem** | **0,01 mA** |
| Ruído de fundo | ~100 mA | ~0,02 mA |
| Corrente da carga | 208 mA (5 W / 24 V) — **precisava ser grande para o sensor enxergar** | 10 mA — **1.000 contagens acima do zero** |

O ACS712 era um sensor de 5 A tentando medir 0,2 A: gastava 4% da escala e vivia
dentro do ruído. O módulo atual mede **0–20 mA** com resolução de 0,01 mA, então
10 mA cai no **meio da escala**, com três ordens de grandeza de folga sobre o
ruído. A carga ficou 20× menor e a medição ficou **muito melhor**.

**As duas placas.** 8 canais não cabem numa placa só que entre na câmara: duas de
150 mm lado a lado dariam 300 mm exatos, que é a cavidade inteira. São **2 placas
de 95 × 75 mm**, 4 canais cada, em passo de 19 mm — e o corte sai de **uma** placa
ilhada de 10 × 15 cm (`150 / 75 = 2`, 5 mm de refilo). Desenho 1:1 em
[`../placa_leds/placa_leds.svg`](../placa_leds/placa_leds.svg).

**Onde elas ficam.** Apoiadas em duas tiras de alumínio (**CAM-26**) parafusadas
nas cantoneiras CAM-24 em Z 110 mm, com **espaçadores roscados M3 de 8 a 10 mm**.
As placas ficam viradas para a porta transparente, garantindo visão direta dos 8 LEDs
e deixando a convecção de ar vertical 100% desobstruída (o ar circula livremente
pela frente, laterais e por baixo das placas).

**Quanto calor elas somam.** 8 × 0,12 W = **~1 W**, contra os 10 W das duas W5W.
A penalidade no ensaio de frio caiu de **+3,2 K para +0,3 K** — praticamente
desapareceu, e agora o ensaio de frio pode rodar com as posições acesas, que é o
caso real. (`python analise_termica_tec.py`, cenário 4.)

---

## 13.3 A cadeia de medição

O ponto que mais gente erra neste projeto: **a corrente não é medida no positivo,
é medida no retorno.**

```
        BD-12V
           │
    ┌──────▼───────┐
    │  F-Pn        │  porta-fusível DIN seccionável, 1 A
    │  (chave +    │  a gavetinha abre o circuito: é o "simular falha"
    │   fusível)   │
    └──────┬───────┘
           │  +12 V (0,5 mm²)          PC-1 · PG13,5
    ═══════╪══════════ parede da câmara ═══════════════════
           │
    ┌──────▼───────┐
    │  borne +k    │  PL-1 / PL-2, borda de baixo
    │      │       │
    │   1 kΩ       │
    │      │       │
    │    LED       │  ← o DUT
    │      │       │
    │  borne rk    │  PL-1 / PL-2, borda de cima
    └──────┬───────┘
           │  retorno (0,5 mm²)        PC-2 · PG11
    ═══════╪══════════ parede da câmara ═══════════════════
           │
    ┌──────▼───────┐
    │  I_n         │  N4AIC24 — o shunt interno está AQUI
    │   │          │
    │  GND         │  ← o retorno atravessa o shunt e sai por aqui
    └──────┬───────┘
           │
        BD-0V-B · Z22
           │
      MAX485 ◄── par trançado ──► A / B ──► Mega (Serial3)
```

**Por que o retorno, e não o positivo.** O shunt do módulo fica entre o borne `I_n`
e o `GND`. A corrente precisa **atravessar** esse shunt para virar número. Se o
retorno fosse direto ao 0 V, a posição acenderia e o painel leria zero para sempre
— sem nada queimado para encontrar. É o erro mais fácil de cometer no projeto, e
está detalhado em [`PLACA_LEDS.md` §6](../placa_leds/PLACA_LEDS.md).

**Os 22 canais compartilham uma referência.** `GND` é **um** borne, e vai ao
`BD-0V-B · Z22` — um fio só, num parafuso só. É o que permite medir 8 correntes
com um instrumento.

> 🔴 **A pinagem publicada do N4AIC24 NÃO TEM `COM`.** O fabricante lista
> **`VIN`, `GND`, `I1..I22`, `V1+`, `V2+`, `A+`, `B−`**. O nó comum dos 22 shunts
> **é o `GND` do módulo**, e não um borne separado.
>
> ⚠️ **Revisões anteriores deste documento chamavam esse nó de `COM`** e chegavam
> a registrar **dois** bornes de retorno (`GND` e `COM`) e **dois** fios
> (`M2 → Z22` e `M5 → Z20`). Isso foi corrigido na fiação, no guia do painel e nos
> desenhos: hoje existe **um** retorno (`GND → Z22`) e o **`Z20` está reserva**.
> Se você encontrar `COM` em qualquer desenho antigo, o desenho é que está errado.
>
> ⚠️ **E daqui sai a regra que não pode ser lida errado.** O cátodo do LED tem de
> entrar em **`I_n`**, sempre. O que sai do módulo é o `GND`. **Ligar o cátodo
> direto no `BD-0V-B` desvia do shunt e aquele canal lê zero para sempre** — é o
> mesmo erro descrito no §13.3, e ele não queima nada, só mente.

**O caminho obrigatório da corrente, e o que é proibido:**

```
CERTO    +12 V → 1 kΩ → LED → borne rk → I_n → [shunt interno] → GND → BD-0V-B
                                              └── é AQUI que a corrente vira número

ERRADO   +12 V → 1 kΩ → LED → borne rk → BD-0V-B
                                          └── shunt desviado: o canal lê 0 mA
                                              para sempre, e o LED acende normal
```

| Se o módulo recebido tiver… | Como se liga |
|---|---|
| **`I1..I22` + `GND`** (a pinagem publicada) | cátodo → `I_n` · `GND` → `BD-0V-B`. ⭐ **É o caso deste projeto** |
| **par `I_n+` / `I_n−` por canal** | cátodo → `I_n+` · `I_n−` → `BD-0V-B`. O shunt fica **entre** os dois |
| `COM` separado do `GND` (módulo de *outro* fabricante) | cátodo → `I_n` · `COM` → `BD-0V-B` · `GND` → `BD-0V-B`, no **mesmo** ponto de 0 V |

> ⚠️ **A terceira linha não descreve o N4AIC24.** Ela existe para o caso de o módulo
> entregue não ser o da pinagem publicada. Se aparecer `COM` impresso na placa,
> **não decida pela resistência entre `GND` e os bornes `I_n`**: um shunt de 10 a
> 250 Ω pode soar como "curto" num multímetro de continuidade sem ser um nó comum.
> A verificação primária é **injetar uma corrente conhecida** (ex.: 10 mA de uma
> fonte calibrada com resistor de 1 kΩ em 12 V) num canal e comparar a leitura
> Modbus — se o valor retornar dentro da tolerância, o caminho está fechado pelo
> `GND` e a primeira linha vale. Se a leitura vier zerada com o LED aceso, o
> retorno está desviado — o erro do §13.3.

📌 **Nos três casos a regra é a mesma:** o cátodo entra em `I_n` e **só** o borne de
retorno do módulo vai ao 0 V. O que muda é o **nome** do borne de retorno, não o
caminho. Por isso a troca não é "um fio a menos" — é **um fio no lugar certo**.

🔧 **O `GND` carrega as duas correntes.** Como o nó comum dos shunts é o mesmo
`GND` que fecha a alimentação do módulo, esse fio conduz **80 mA** (as 8 posições)
**+ ~60 mA** do próprio módulo ≈ **150 mA**. Condutor de 0,5 mm² sobra; o que não
pode é ele faltar ou ir para um parafuso diferente do `BD-0V-B`.

⚠️ **Verificação primária — injeção de corrente conhecida, não teste de
continuidade:** alimente uma posição com **12 V e resistor de 1 kΩ** (corrente
esperada ≈ 10 mA), leia o canal correspondente pela Modbus e confira se o valor
retorna entre **9 e 11 mA**. Só depois disso confira com o multímetro, módulo
desenergizado, se `GND` e o ponto comum dos `I_n` são o mesmo nó — mas a
continuidade é **secundária**: o que prova que o circuito está certo é a leitura
Modbus concordando com a corrente injetada.

**A alimentação do instrumento é permanente.** `V+` vem do **BD-24V**, não do
BD-POT. O módulo continua de pé quando o KM1 abre, e responde `V1 = 0,00 V` — que
é informação, ao contrário do divisor antigo, que apagava junto e deixava o Mega
lendo 0 sem dizer se era "sem tensão" ou "sem instrumento". ⚠️ O datasheet dá
**7–25 V DC** de alimentação: 24 V cabe com 1 V de margem, então o PS1 não pode
ser ajustado acima de 24,0 V. ⭐ **E não troque para o `BD-12V`** para ganhar
margem: este módulo mede a barra de 12 V no `V2`, e alimentá-lo da mesma barra que
ele vigia apaga a diferença entre *"a posição queimou"* e *"a fonte de 12 V caiu"*.
Se o PS1 não segurar 24,0 V, aí a troca se justifica — e o diagnóstico piora.

---

## 13.4 Escalonamento para a indústria (50 posições)

Quando a planta precisa monitorar 50 posições distribuídas pelo galpão, o que muda
não é o protocolo — é a topologia:

- Acoplam-se **TCs split-core** com saída condicionada nas 50 posições, ou módulos
  de aquisição com entrada de corrente, como o da maquete.
- A cada 8 posições, um **módulo de aquisição Modbus RTU** de trilho DIN recebe os
  cabos locais curtos e digitaliza as leituras.
- Os módulos formam uma *daisy-chain* RS-485, com endereços Modbus distintos
  (o da maquete é o **ID 1**).
- Um único par trançado percorre o galpão até a sala de controle / CLP.

> 🎓 **O que explicar na banca:** *"A maquete já usa o barramento da planta —
> RS-485 Modbus RTU, 9600 8N1, função 04, ID 1. A diferença entre o protótipo e a
> fábrica é o número de módulos, não a arquitetura. O que se aprende aqui é o que
> se instala lá: um instrumento por grupo de canais, um par trançado, um endereço."*

---

## 13.5 Conexões físicas no painel

### A. Circuito de força (12 V, por posição)
1. Do **BD-12V**, um condutor de 0,5 mm² até a entrada do porta-fusível `F-Pn`.
2. Da saída do porta-fusível, 0,5 mm² até o borne `+n` da placa, atravessando a
   parede pelo **PC-1 (PG13,5)**.
3. O retorno sai do borne `rn`, atravessa a parede pelo **PC-2 (PG11)** e vai ao
   borne **`I_n`** do módulo — **nunca direto ao 0 V**.
4. Do borne de retorno do módulo (**`GND`**) ao **BD-0V-B · Z22**. Esse fio conduz
   ~150 mA: as 8 correntes medidas mais a alimentação do próprio módulo.

⚠️ **Os bornes `n−` da placa de distribuição ficam VAZIOS.** O par `n+`/`n−` parece
pedir ida e volta, e é justamente o que não se faz: o `n−` é o mesmo 0 V da placa, e
usá-lo como retorno curto-circuita o shunt do módulo.

### B. Circuito de comunicação
1. **MAX485** no trilho 3: `VCC` no BD-5V · O8, `GND` no BD-0V-B · Z17.
2. `RO` → Mega **D15** (RX3) · `DI` → Mega **D14** (TX3) · `DE/RE` → Mega **D26**,
   com **R13 de 10 kΩ** para o 0 V (sem ela o barramento fica solto no boot).
3. `A` / `B` em **par trançado** até o módulo.
4. O Mega não gasta **nenhuma** entrada analógica: A2 e A3, que eram do ACS712,
   continuam livres.

---

## 13.6 Lógica do firmware no Arduino Mega

A leitura agora é **uma requisição Modbus para 24 registradores**, e não 16
`analogRead` por canal:

```cpp
// N4AIC24: ID 1, 9600 8N1, função 04, 24 registradores a partir de 0x0000
//   0..21  -> correntes I1..I22, em 0,01 mA
//   22..23 -> tensões V1, V2, em 0,01 V
const uint8_t  MODBUS_ID   = 1;
const uint16_t REG_INICIAL = 0x0000;
const uint16_t N_REGS      = 24;

uint16_t regs[N_REGS];

// Limiar de "posição viva". 10 mA nominais; abaixo de 3 mA é falha.
const uint16_t LIMIAR_MA10 = 300;      // 300 x 0,01 mA = 3,00 mA

bool lerModulo() {
  // uma requisição só, ~70 ms. Ler canal por canal levaria ~0,5 s e o PID sente.
  return modbusLeRegistradores(MODBUS_ID, REG_INICIAL, N_REGS, regs);
}

// A posição k (1..8) usa o registrador k-1.
bool posicaoViva(uint8_t k) {
  return regs[k - 1] >= LIMIAR_MA10;
}

void loopDUTs() {
  static unsigned long ultimoCheck = 0;
  if (millis() - ultimoCheck >= 500) {      // 2 vezes por segundo
    ultimoCheck = millis();

    if (!lerModulo()) {                     // sem resposta = instrumento fora
      dispararAlertaDUT(0, "MODULO N4AIC24 SEM RESPOSTA");
      return;
    }

    for (uint8_t k = 1; k <= 8; k++) {
      if (!posicaoViva(k)) {
        dispararAlertaDUT(k, "POSICAO MORTA / FUSIVEL ABERTO");
      }
    }
  }
}
```

> ⚠️ **A limitação que o firmware não resolve, e o relatório tem de dizer.**
> Corrente zero significa **três coisas diferentes**: chave aberta, fusível aberto
> ou LED queimado. Por posição, não há como separar. Quem separa é a **tensão**:
> com a chave aberta o `V2` continua em 12 V; com o T3 caído ele desaba. E é
> justamente esse o exercício que a maquete propõe.

> 📌 **Um detalhe que muda o código:** se o módulo só aceitar a faixa **4–20 mA**, o
> zero vira 4 mA e o firmware precisa subtrair o offset. Conferir no módulo recebido
> antes de fechar o limiar.

---

## 13.7 Checklist de aceitação

- [ ] As 8 posições acendem quando as gavetas dos porta-fusíveis são fechadas.
- [ ] Cada posição consome **9 a 11 mA** (medir com o multímetro em série, não com o módulo — primeiro o instrumento, depois a confiança nele).
- [ ] Com todas acesas, o módulo reporta **8 correntes entre 900 e 1100** (em 0,01 mA).
- [ ] `V1` lê o 24 V comutado e `V2` lê os 12 V das posições, **sem divisor**.
- [ ] **Ensaio de detecção:** abrir a gavetinha de um fusível; o Mega acusa "posição morta" em menos de 1 segundo, e a IHM mostra o alarme.
- [ ] **Ensaio de instrumento:** desconectar o par `A`/`B`; o Mega acusa "módulo sem resposta" — e **não** confunde com "8 posições mortas". São falhas diferentes.
- [ ] Os bornes `n−` da placa de distribuição estão **vazios**, conferidos um a um.
- [ ] **Injeção de corrente conhecida** em pelo menos um canal (12 V + 1 kΩ → ~10 mA): leitura Modbus retorna entre 9 e 11 mA. ⭐ É a verificação primária — a continuidade `GND` ↔ `I_n` com o multímetro é secundária e não conclusiva por si só.
- [ ] Nenhum cátodo de LED ligado direto no `BD-0V-B`: os 8 passam por `I1..I8`, conferido um a um.
- [ ] Verniz isolante aplicado nas duas placas, e um ciclo de frio de 30 min sem nenhum canal marcando corrente com os LEDs apagados.
