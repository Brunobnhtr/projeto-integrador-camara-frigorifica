# Doc 43 — O modelo térmico do simulador: onde ele é otimista, e quanto

> 📌 **Este documento é uma ANÁLISE, não uma correção.** Nada foi alterado no
> [`sim/index.js`](../painel_interativo/src/sim/index.js) nem nas tabelas do
> [Doc 40](40_firmware_arduino.md). Ele existe para que a decisão de corrigir — ou de não
> corrigir — seja **tomada** em vez de acontecer por descuido, e para que a conta esteja
> pronta se a banca perguntar.

---

## 43.1 O que está no código hoje

[`sim/index.js`](../painel_interativo/src/sim/index.js), na função `termico()`:

```js
const rendimento = Math.max(0, 1 - dtPastilha / TERMICO.DT_MAX);
qc = TERMICO.QC_MAX * d * rendimento;      // bombeado para FORA da câmara
qh = qc + TERMICO.P_ELETRICA * d;          // despejado no dissipador
```

Ou seja:

```
   Qc = Qc_max · duty · (1 − ΔT / ΔT_max)
```

**Esta equação está certa no essencial**, e a conclusão que ela sustenta — *mais duty pode
dar menos frio* — é verdadeira e importante. O limitador `tetoPorDissipador()` que nasceu
dela continua correto. O problema é de **grau**, não de sentido.

---

## 43.2 O problema: o `duty` multiplica um termo que não deveria

A equação física de uma pastilha Peltier tem **três** termos, e eles não escalam do mesmo
jeito:

| Termo | O que é | Escala com o duty? |
|---|---|---|
| `α · I · Tc` | **bombeamento Peltier** — o efeito útil | ✅ sim, é proporcional à corrente |
| `½ · I² · R` | **perda Joule** — o efeito parasita | ✅ sim, mas com o **quadrado** da corrente |
| `K · ΔT` | **condução** — calor atravessando a pastilha de volta | ❌ **não. Ela conduz o tempo todo** |

O modelo do simulador **multiplica os três pelo `duty`**, porque o `(1 − ΔT/ΔT_max)` já
carrega a condução dentro dele e o `· d` vem por fora. Na prática isso afirma que:

> com `duty = 0`, a pastilha **não conduz calor nenhum**.

Ela conduz. Uma pastilha desligada é uma ponte térmica entre um dissipador a 50 °C e uma
câmara a 5 °C. O próprio projeto sabe disso — existe a constante `FUGA_PELTIER_OFF: 0.5`
—, mas ela só é aplicada no ramo `else`, quando o duty é **exatamente** zero. Durante a
fração desligada de cada ciclo de PWM, ninguém a cobra.

A forma correta separa os termos:

```
   Qc = (bombeamento − Joule) · duty  −  K · ΔT
                                          ↑ fora do parêntese
```

---

## 43.3 Quanto muda, com os números do próprio projeto

Usando `QC_MAX = 114 W` e `DT_MAX = 65 K` do modelo, a condução implícita é
`K = 114 / 65 = 1,75 W/K` — coerente com o datasheet do TEC1-12706 (`Qmax/ΔTmax ≈ 0,78 W/K`
por módulo, dois em paralelo térmico ≈ 1,5 W/K).

Refazendo o regime permanente com a câmara segura em 5 °C, ambiente 25 °C e `UA = 4,0 W/K`:

| duty | Qc pelo modelo atual | Qc com a condução separada | dissipador |
|---:|---:|---:|---:|
| 100 % | 11,0 W | **11,0 W** — idêntico | 63,7 °C |
| 60 % | 19,5 W | **≈ 4 W** | 47,7 °C |
| 40 % | 18,3 W | **negativo** — a câmara ganha calor | ~42 °C |

Em `duty = 100 %` os dois modelos coincidem, por construção. **A divergência cresce à
medida que o duty cai** — exatamente na região onde o projeto concluiu que operar. O
"⭐ 60 % é 77 % mais frio que 100 %" da [§40.9](40_firmware_arduino.md) encolhe muito, e
pode inverter.

---

## 43.4 E aqui está o achado que vale mais que a correção

O modelo corrigido não diz *"recue menos"*. Ele diz **outra coisa**, e é uma coisa melhor:

> O problema nunca foi o duty ser alto demais. **O problema é picotar a corrente em vez de
> reduzi-la.**

A conta é curta e usa só números que já estão no projeto (`P_ELETRICA = 144 W` a
`24 V / 6 A`, logo `R = 4 Ω`):

```
   PWM a 60 % com 6 A:   I_rms = 6 · √0,6 = 4,65 A   →  P = 4,65² × 4 = 86,4 W
   Corrente contínua de 3,6 A (a MESMA corrente média) →  P = 3,6²  × 4 = 51,8 W
   ───────────────────────────────────────────────────────────────────────────
                                        34,6 W de perda Joule que não precisa existir
```

**O bombeamento Peltier é idêntico nos dois casos**, porque ele é proporcional à corrente
*média* — e as duas têm a mesma média. O que muda é a perda Joule, que é proporcional ao
**quadrado**, e o quadrado da média é sempre menor que a média dos quadrados.

Desses 34,6 W:

- **metade aparece na face fria**, trabalhando contra o resfriamento → ~17 W de frio líquido recuperados;
- **os 34,6 W somem do dissipador** → com `UA = 4,0 W/K`, ele esfria **~8,7 K**;
- dissipador mais frio → `ΔT` menor → `Qc` sobe de novo, pelo termo que o modelo já representa bem.

Num sistema cujo `Qc` total no ponto de operação é da ordem de 20 W, isso não é um ajuste
fino. **É a maior alavanca do projeto inteiro**, e ela não custa componente de potência
nenhum — custa a forma de onda.

> 🎓 É o mesmo resultado que a Texas Instruments mediu no *Application Report* **SLUA979A**:
> acionamento por corrente contínua entregou **ΔT 8,1 °C maior** e foi **39,2 % mais
> eficiente** que o mesmo módulo em PWM. E é por isso que Ferrotec, Marlow e Same Sky/CUI
> pedem ripple de corrente abaixo de 10 % — a Marlow escreve, textualmente, que *não*
> recomenda controle liga/desliga.

---

## 43.5 O que isso implica sobre o PWM de 1 Hz

O [Doc 40 §40.5](40_firmware_arduino.md) justifica o PWM lento assim: *"cada liga-desliga dá
um pequeno choque térmico na pastilha; a 490 Hz são 490 choques por segundo"*.

⚠️ **Essa justificativa está invertida, e vale corrigir o texto mesmo que o código não
mude.** A 490 Hz a massa térmica da pastilha filtra completamente a ondulação — a junção vê
corrente eficaz constante e **não cicla**. Quem faz a pastilha ciclar termicamente é
justamente **1 Hz**, que está dentro da constante de tempo dela. A recomendação dos
fabricantes não é *"chaveie devagar"*, é **"use corrente contínua"**.

Só que — e é isto que fecha o raciocínio — **subir a frequência sozinho não resolve a
eficiência.** Enquanto a corrente for uma onda quadrada, a penalidade de `I²` é a mesma a
1 Hz e a 20 kHz. Subir a frequência resolve a **fadiga**; reduzir a corrente resolve o
**COP**. São dois problemas diferentes com duas soluções diferentes.

### Escada honesta de melhoria

| Etapa | O que fazer | Ganha | Custa |
|---|---|---|---|
| 1 ✅ | **ADOTADA em 18/08/2026** — 20 kHz nos Timers 3 e 4 ([Doc 40 §40.5](40_firmware_arduino.md)) | acaba a ciclagem térmica da pastilha | nada em componente. A leitura do `IS` deixou de ser instantânea e virou média — o RC já existia na PI-1 (1 kΩ interno do IBT-2 + 100 nF), e corta em 1,6 kHz |
| 2 | **Filtro LC** na saída do BTS7960 — a meia-ponte com indutor e capacitor **é** um buck síncrono | os ~17 W de frio e o dissipador 8,7 K mais frio | um indutor que aguente 6 A contínuos sem saturar; recalcular L e C para ripple < 10 % |
| 3 | Corrigir o modelo desta análise **antes** dos dois | o simulador passa a ser a evidência disso na defesa, em vez de contradizê-la | uma tarde |

---

## 43.6 O que NÃO muda com esta análise

Vale dizer explicitamente, porque é fácil ler isto como se derrubasse mais coisa do que
derruba:

- ✅ **O limitador `tetoPorDissipador()` continua certo.** A realimentação positiva que ele
  combate é real; o modelo corrigido a mantém.
- ✅ **O controle por faixa continua certo**, e a lógica de "desistir com honestidade"
  também.
- ✅ **O `DISSIPADOR_ALVO` de 52 °C continua um ponto de operação razoável** — com corrente
  contínua ele passa a ser atingido com folga, em vez de ser um teto que aperta.
- ✅ **Nada disso afeta o KA3, o KA4 nem a cadeia de segurança.** É análise de eficiência
  térmica, não de proteção.

> 📌 **A decisão de projeto, registrada:** a etapa 1 foi adotada (o PWM subiu de 1 Hz para
> 20 kHz). O **modelo do simulador** continua como está por enquanto, com esta análise ao lado. O número da tabela do §40.9 é otimista em duty baixo e isso está
> documentado aqui. Se a bancada medir o `Qc` real e ele não bater com a tabela, **esta é a
> primeira coisa a olhar** — e a explicação já está escrita.

---

📄 **Anterior:** [Doc 42 — Simulação e Testes](42_simulacao_e_testes.md)
