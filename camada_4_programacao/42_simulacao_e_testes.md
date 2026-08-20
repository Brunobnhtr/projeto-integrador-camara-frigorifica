# CAMADA 4 · Doc 42 — Simulação e Testes sem Hardware

> Como testar a lógica do projeto **antes de comprar ou montar qualquer coisa**. Serve para ajustar o PID, validar o modo ciclo, provar que a emergência não religa sozinha e estimar quanto tempo o ensaio vai durar.
>
> ⭐ **A ferramenta principal virou o simulador do aplicativo React** — ele roda a cadeia elétrica, o firmware e um modelo térmico juntos, e **confere o resultado contra a tabela de estados do [Doc 31](../camada_3_eletrica/31_comando_e_protecoes.md)**. Ver §42.0.
>
> 📁 Arquivos: [`painel_interativo/src/sim/`](../painel_interativo/src/sim/) · [`scripts/valida_simulador.mjs`](../painel_interativo/scripts/valida_simulador.mjs)

---

## 🟢 Em palavras simples — errar de graça, antes de comprar

Este é provavelmente **o documento que mais economiza tempo e dinheiro** do projeto inteiro, e o mais fácil de ignorar.

A ideia: você pode testar quase tudo **antes de ter o hardware na mão**. E é bom que teste, porque:

| Erro descoberto | Custo |
|---|---|
| No simulador, hoje | Trocar um número e rodar de novo |
| Na bancada, mês que vem | Algumas horas |
| Na maquete montada | Desmontar, ressoldar, remontar |
| Na apresentação | Não tem conserto |

### As ferramentas, e para que serve cada uma

| Ferramenta | Responde a que pergunta | Onde |
|---|---|---|
| ⭐ **Simulador do app** (`npm run simula`) | *"O STOP retém? A emergência trava? A ventoinha continua? O que acontece se o BTS colar em curto?"* | §42.0 |
| **Wokwi** (Arduino no navegador) | *"O código C++ compila e roda? A interrupção de RPM conta certo?"* | §42.3 |
| **Falstad** (circuito no navegador) | *"O desenho do selo está certo?"* — hoje redundante com o simulador | §42.4 |

---

## 42.0 ⭐ O simulador do aplicativo — a documentação virou teste

```bash
cd painel_interativo
npm run simula          # 107 verificações, ~3 segundos
npm run valida          # o simulador roda ANTES dos 8 validadores de fiação
```

Ele roda **três camadas juntas**, e a separação entre elas é o que torna a resposta confiável:

| Arquivo | O que modela | O que ele NÃO sabe |
|---|---|---|
| [`src/sim/eletrica.js`](../painel_interativo/src/sim/eletrica.js) | os dois selos, os barramentos, o contato do KA1 | **nada de firmware** — de propósito |
| [`src/sim/firmware.js`](../painel_interativo/src/sim/firmware.js) | espelho em JS da máquina de estados do [Doc 40 §40.10](40_firmware_arduino.md) | nada de eletricidade — só lê pinos |
| [`src/sim/index.js`](../painel_interativo/src/sim/index.js) | o laço de tempo, o modelo térmico de 2 massas e a injeção de falhas | — |

> 🎯 **A camada elétrica não pode enxergar o firmware, e é isso que dá valor ao resultado.** A pergunta que o projeto inteiro responde — *"a emergência funciona com o software morto?"* — só significa alguma coisa se der para respondê-la **sem olhar para o software**. Então o firmware entra ali como uma variável externa (o estado do KA1), exatamente como um dedo entra como o estado de um botão.

### O que ele prova, cenário por cenário

| # | Cenário | O que fica provado |
|---|---|---|
| 1–4 | Boot e o verde | O selo nasce aberto; **um toque no verde** arma a potência, e com o cogumelo socado ele não faz nada |
| **5** | ⭐ STOP preto | Aperta **uma vez e solta** → 0 V no BD-POT, **e permanece** |
| **6** | ⭐ Só o verde religa | A IHM tenta e recebe `APERTE_O_VERDE` |
| 7–8 | STOP pela IHM e por MQTT | Categoria 2 — a potência segue armada e a tela religa |
| 9–11 | Emergência | Destravar o cogumelo **não religa nada** — e o verde, depois de destravado, religa num toque só |
| 12 | Arduino morre | O KA1 abre, a potência cai **e não volta sozinha** |
| 13 | Fan travada | Trip com corte **físico e retentivo** |
| **14** | 🔥 **BTS7960 em curto** | A Peltier conduz ignorando o `R_EN` — **e o KA1 a mata assim mesmo** |
| 15–18 | Ventoinhas | As 4 linhas da regra única, o fail-safe do sensor solto, a sobrevivência à emergência |
| 19 | Intertravamento | 400 passos com inversão de modo, **nunca os dois `R_EN` juntos** |
| 20–21 | Chave geral e processo | Tudo morre junto; e a câmara chega a **6,9 °C** com setpoint de 5 |

### 🐛 Os dois defeitos que ELE encontrou, na primeira execução

Nenhum dos dois era do projeto — os dois eram do **modelo**. E é por isso que valem a leitura:

**1. "Arduino revive e a potência não volta nem com o verde."** O modelo mantinha o estado durante a morte e retomava de onde parou. **Microcontrolador não pausa — ele morre e RENASCE**, pelo watchdog ou pelo religamento. Corrigido: a transição morto→vivo agora reinicia o firmware inteiro, e aí o `BOOT` autoriza a potência de novo.

**2. "A câmara estabiliza em 8,2 °C com setpoint de 5."** Não era o modelo térmico: era o controlador. Eu tinha escrito um **P puro**, e P puro precisa de erro para gerar saída — então o erro nunca vai a zero. A conta fecha exatamente em 8,16 °C.

> 🎓 **O segundo é um resultado de sala de aula que apareceu sozinho.** O simulador reproduziu o *offset de regime permanente* de um controlador proporcional, com o número certo, sem ninguém procurar por isso. **É a melhor justificativa possível para o `I` do PID estar no projeto** — e vale mais que qualquer parágrafo explicando a teoria.

### ▶️ E a aba "Simulador" — o painel operável

```bash
npm run dev        # e abra a última aba
```

O mesmo motor, agora com botões que funcionam:

| O que você vê | O que ele mostra |
|---|---|
| **A cadeia de comando** desenhada | verde onde há tensão, cinza onde está morto — e os dois selos abrindo e fechando ao vivo |
| **Barramentos** | tensão **e corrente** de cada um, com barra de ocupação contra o limite de projeto |
| **Processo** | temperatura da câmara e do dissipador, setpoint arrastável, duty, e o estado de cada ventoinha |
| **Botoeiras** | os quatro botões, **em pulso** — aperta e solta, como na vida real |
| **IHM e MQTT** | os quatro comandos, com o `MQTT · iniciar` recusando de propósito |
| **Injeção de falhas** | sete caixas de seleção: Arduino morto, BTS em curto, ventoinha travada, DS18B20 solto, contatos soldados, chave geral |
| **Diário de bordo** | registra só o que **muda**, com carimbo de tempo |

E um controle de velocidade de **1× / 10× / 60×** — um ensaio de 25 minutos passa em 25 segundos.

> 🎓 **A demonstração de 30 segundos para a banca:** aperte o cogumelo e mostre a cadeia inteira ficando cinza. Destrave — **nada volta**. Aperte o verde — **continua nada**. Aperte o azul, depois o verde — a potência volta. É o ensaio nº 4 do §31.11 acontecendo na tela, e ninguém precisa acreditar em você.
>
> 📌 **Marque a caixa "🔥 BTS7960 em curto"** com o ensaio rodando e depois "ventoinha travada": o trip dispara, o BD-POT vai a 0 V e a câmara **para de esfriar** — que é o argumento inteiro do KA1 em uma imagem.

> ⭐ **A tela não decide nada.** Ela recebe um instantâneo de `src/sim/` e desenha — o render é uma função pura. É a mesma lógica que o `npm run simula` valida contra a tabela de estados, então **o que você vê na aba é exatamente o que os 107 testes provam**.

### ⚠️ O limite honesto desta ferramenta

O firmware existe **duas vezes**: em C++ no [Doc 40](40_firmware_arduino.md) e em JavaScript no simulador. **Eles podem divergir.** As defesas:

- toda função JS tem **o mesmo nome** da função C++ correspondente, para que o diff seja óbvio
- o modelo é deliberadamente pequeno: só as decisões que decidem ligar, parar, reter e travar
- **em caso de discordância, o C++ é a verdade** — o simulador é o modelo, não o contrário

E o que ele **não** simula: temporização em microssegundos, ruído elétrico, queda de tensão nos cabos, o comportamento real de um contato ao abrir sob carga. Para isso não há substituto para a bancada.

### Por que ajustar o PID no simulador antes

Ajustar PID no hardware é lento e frustrante: cada tentativa leva **minutos**, porque a câmara demora a responder. No simulador cada tentativa leva **segundos**.

A estratégia certa:

1. Encontre ganhos que funcionem **no simulador**
2. Leve-os para o hardware como **ponto de partida**
3. Faça o ajuste fino no real

Você não vai começar do zero olhando para uma câmara que não esfria.

> ⚠️ **Simulação não é realidade.** O modelo usa valores de catálogo; a sua câmara real terá vazamentos de calor, uma vedação que não é perfeita e uma Peltier que talvez não seja exatamente igual à do datasheet. **O simulador te dá o ponto de partida certo, não o número final.**

### A ordem de testes recomendada

```
1. Simulador Python      → o processo faz sentido? PID aproximado?
2. Falstad               → o circuito de comando trava na emergência?
3. Wokwi                 → o código compila e a lógica funciona?
4. Bancada com LEDs      → Arduino real, LEDs no lugar dos drivers
5. Bancada com drivers   → drivers reais, ainda sem Peltier
6. Câmara montada        → só agora as Peltier e o PTC entram
```

> 🎯 **Repare que a Peltier só aparece no passo 6.** Ela é o componente mais caro e mais fácil de queimar. Tudo que puder ser descoberto antes dela entrar, descubra antes.

### Dicionário rápido

| Termo | O que quer dizer |
|---|---|
| **Simulação** | Um programa que imita o comportamento do sistema real |
| **Modelo térmico** | As contas que descrevem como a temperatura sobe e desce |
| **Wokwi** | Site que roda código de Arduino num circuito virtual |
| **Falstad** | Site que simula circuitos elétricos, mostrando a corrente andando |
| **Sintonia de PID** | Achar os valores de Kp, Ki e Kd que fazem o controle se comportar bem |
| **Overshoot** | Passar do alvo antes de estabilizar |
| **Constante de tempo** | Quanto o sistema demora para reagir. Aqui: minutos |
| **Bancada** | Testar com o hardware real, mas fora da montagem final |

---

## 42.1 Qual ferramenta para qual coisa

Nenhuma ferramenta simula tudo. Cada uma resolve uma parte:

| O que você quer testar | Ferramenta | Custo |
|---|---|---|
| **Ajustar Kp, Ki, Kd** e ver a curva de temperatura | **Simulador do aplicativo** — aba ▶️ Simulador, ou `npm run simula` | grátis |
| Validar o **modo ciclo**, tempos e nº de ciclos | Simulador do aplicativo, cenário de ciclagem | grátis |
| Estimar a **duração real do ensaio** | Simulador do aplicativo | grátis |
| **Rodar o código C++ de verdade** (o mesmo que vai para o Mega) | **Wokwi** — extensão do VS Code (já instalada) ou [wokwi.com](https://wokwi.com) | grátis |
| Testar botões, máquina de estados e interrupção de RPM | Wokwi | grátis |
| Simular o **circuito de comando** (KM1, selo, emergência) | **Falstad** — [falstad.com/circuit](https://www.falstad.com/circuit/) | grátis |
| Simular relés, transistores e o lado **eletrônico analógico** | **SimulIDE** (desktop) | grátis |
| Simulação completa com **BTS7960, motores e cargas reais** | **Proteus** (Labcenter) | pago |

> 📌 **Comece pelo simulador do aplicativo** (§42.0). Ele responde a pergunta mais cara do projeto — "meus ganhos de PID estão bons?" — em segundos, sem hardware nenhum, e ainda confere o resultado contra a tabela de estados do Doc 31.

---

## 42.2 ~~O simulador de bancada (`simulador.py`)~~ — substituído

> 🔧 **Este simulador em Python foi removido do projeto.** Ele modelava só a parte térmica e não sabia nada dos selos, dos relés nem da máquina de estados — respondia *"quanto tempo leva para esfriar"* e mais nada.
>
> **O simulador do §42.0 faz tudo o que ele fazia e mais**, roda com um comando dentro do próprio aplicativo, e — o que o Python nunca fez — **compara o resultado com a documentação**. A seção fica abaixo como registro do modelo físico, que continua válido e foi reaproveitado.

### O modelo físico que foi reaproveitado

⚠️ **Os comandos `python simulador.py ...` saíram junto com o arquivo.** O modelo físico
abaixo continua valendo — ele foi reaproveitado no simulador do aplicativo — mas quem quiser
rodar um cenário hoje usa a aba **▶️ Simulador** ou `npm run simula` dentro de
`painel_interativo/`.

### O modelo físico

Usa exatamente os números calculados no [Doc 12](../camada_1_maquete/12_camara_termica.md):

| Parâmetro | Valor | De onde vem |
|---|---|---|
| `UA` (perda pelo envelope) | 0,30 W/K | Doc 12 §12.2 — paredes + porta dupla + infiltração |
| `C` (capacidade térmica) | 600 J/K | ar + acrílico + bandeja |
| Peltier | **2× em série: 144 W elétricos · Qc = 114 W a ΔT=0** · ΔTmax = 66 K | 2× TEC1-12706 em 24 V |
| Dissipador | 4 W/K com a fan girando · **0,45 W/K com ela parada** | cooler de CPU |
| PTC | **80 W** (24 V · 3,3 A) | Doc 03 |
| Fans internas | +3 W **dentro** da câmara | o trabalho elétrico vira calor |

> 🔬 **O acoplamento da Peltier é resolvido por iteração.** Ela bombeia menos calor conforme o lado quente sobe — e o lado quente sobe justamente porque ela está bombeando. O simulador resolve esse laço a cada passo, que é por isso que ele consegue mostrar o efeito da fan parada de forma realista.

### O que a saída mostra

```
  27.0 │
  25.8 │-
  24.5 │ o
  ...
   5.8 │ ·················oo··········---·····oooooo···oooooooooooooooooooo
   4.6 │                    ooo    ---              ooo
       └───────────────────────────────────────────────────────────────────
       0 min                                              60 min

  Legenda:  o = resfriando   ^ = aquecendo   - = parado   · = setpoint

  MÉTRICAS
   Tempo até atingir o setpoint (±0,5 °C) : 10.2 min
   Erro em regime permanente              : 0.01 °C
   Sobressinal (overshoot)                : 2.17 °C
   Duty médio                             : 40.0 %
   Lado quente da Peltier no fim          : 32.1 °C
   Carga térmica implícita no duty médio  : ≈ 11.5 W
```

> ✅ **A última linha é a mais valiosa.** O Doc 12 calculou a carga térmica em **9,5 W** por teoria. O simulador, partindo do duty médio, chega a **≈ 11,5 W**. Bater na mesma ordem de grandeza por dois caminhos independentes é uma validação forte do dimensionamento — e é exatamente o tipo de coisa que se coloca no relatório.

### Três descobertas do simulador

| Descoberta | O que fazer |
|---|---|
| **O aquecimento passa mais do setpoint que o resfriamento** (overshoot de ~4,6 °C no patamar quente contra ~2,2 °C no frio) | O PTC de 80 W é muito mais forte, em relação à carga, do que a Peltier. Vale usar **ganhos diferentes** para cada modo, ou limitar o duty do quente a ~60 % |
| **Com a fan parada, o lado quente dispara** e o Qc vai a zero — a câmara para de esfriar antes mesmo de a pastilha queimar | Confirma que o trip por RPM tem que atuar rápido: aos 5 s já não adianta mais insistir |
| **2 ciclos completos levam ~57 min** com patamares de 5 min | Para a apresentação, use patamares de 2 min. O ensaio "de verdade" (10 min × 3) leva ~2 h 30 e tem que ser feito antes |

---

## 42.3 Wokwi — rodando o código C++ de verdade

O `simulador.py` testa a **lógica**. O Wokwi testa o **código que vai para o Mega**, compilado de verdade, com as interrupções e o tempo reais.

### ⚠️ A pasta `simulacao/wokwi/` saiu do repositório

Ela existia com o `sketch.ino`, o `diagram.json` e o script de compilação. Saiu junto com o
`simulador.py`, quando o simulador do aplicativo passou a cobrir o que ela cobria — e o que
**ela** fazia de diferente (rodar o C++ compilado) continua possível pelo navegador, sem
instalar nada, com o firmware do [Doc 40](40_firmware_arduino.md).

### Caminho B — navegador, sem instalar nada

1. Entre em **[wokwi.com](https://wokwi.com)** e crie um projeto novo para **Arduino Mega**.
2. Cole o firmware do [Doc 40](40_firmware_arduino.md) na aba do código.
3. Monte o circuito arrastando as peças da tabela **O que está montado**, logo abaixo — são 7 peças.
4. Clique em **▶ Play**.

> No navegador o Wokwi compila sozinho — não precisa do `arduino-cli` nem de licença. É o caminho mais rápido para os alunos que vão só olhar.

### O que está montado

| Componente real | No Wokwi | Como usar |
|---|---|---|
| DS18B20 (centro da câmara) | DS18B20 | **Clique nele e arraste a temperatura** para simular a câmara esquentando ou esfriando |
| Botão START / STOP / EMERGÊNCIA | Pushbuttons | Clique |
| KM1 (**24 V** presentes) | Chave deslizante no D25 | Desligue para simular a emergência cortando em hardware |
| BTS7960 #1 e #2 | LEDs ciano e laranja | ⚠️ **Com o PWM em 20 kHz o LED não pisca — ele varia de brilho.** Para ver o duty no Wokwi, olhe o valor impresso no Serial |
| LEDs RUN / FRIO / QUENTE / FALHA | LEDs | Iguais aos do painel |
| Fan do dissipador | Pino D30 ligado por fio ao D3 | O sketch gera os pulsos do tacômetro — **testa a interrupção de verdade** |
| Tela ES3C28P | Monitor Serial | Mostra estado, fase, ciclo, duty e RPM a cada segundo |

### Os 6 testes que valem a pena fazer no Wokwi

| # | Teste | Como | O que tem que acontecer |
|---:|---|---|---|
| 1 | **Interrupção de RPM** | Rode e olhe o `rpm1=` / `rpm2=` no Serial | ~2400 RPM nos dois. Se um ficar em 0, o `attachInterrupt` (D3) ou o PCINT (A8) está no pino errado |
| 2 | **PWM** | Dê START com a temperatura em 25 °C | O LED ciano acende com brilho proporcional ao duty. ⚠️ Ele NÃO pisca: a 20 kHz o olho integra. Antes, a 1 Hz, ele piscava com o tempo aceso proporcional ao duty |
| 3 | **Intertravamento** | Force um modo e olhe os dois LEDs | **Nunca** os dois acesos ao mesmo tempo |
| 4 | **Intervalo de 30 s** | Passe rapidamente a temperatura de 30 °C para 0 °C | Os dois LEDs ficam apagados por 30 s antes de trocar de modo |
| 5 | **START recusado sem potência** | Desligue a chave do D25 e aperte START | Serial: `START recusado: 24 V ausentes` |
| 6 | **Emergência não religa** | Aperte a emergência, solte, e **não** aperte START | Fica em `AGUARDA_START`. **Não pode voltar a rodar sozinho** |

> ⚠️ **Se uma peça não existir com esse nome** na sua versão do Wokwi, arraste uma equivalente — as ligações estão descritas na tabela acima.

### O que o Wokwi NÃO simula

| Não tem | O que fazer |
|---|---|
| **BTS7960** | Substituído por LEDs. O comportamento do driver é trivial (liga/desliga o que entra) |
| **Tela ES3C28P** | Substituída pelo Monitor Serial. Teste a IHM depois, com a placa na mão |
| **AM2315C** | Não é crítico — é sensor de referência, não de controle |
| **Comportamento térmico** | O DS18B20 é ajustado à mão. Para a dinâmica térmica, use o simulador do aplicativo (§42.0) |
| **ESP32 + MQTT junto com o Mega** | O Wokwi simula ESP32, mas não dois microcontroladores conversando. Teste separado |

---

## 42.4 Falstad — o circuito de comando

O [Falstad Circuit Simulator](https://www.falstad.com/circuit/) é ideal para provar a **malha do selo** ([Doc 31 §31.0](../camada_3_eletrica/31_comando_e_protecoes.md)) antes de comprar o relé.

### Como montar (leva 10 minutos)

1. Abra o simulador e apague o circuito de exemplo (`Circuits → Blank Circuit`).
2. Fonte de 24 V: `Draw → Inputs and Sources → Voltage Source (two-terminal)`.
3. Botões: `Draw → Switches → SPST Switch` (um para cada: emergência, stop, ligar).
4. Relé: `Draw → Passive Components → Relay`. Configure a corrente de acionamento.
5. Monte a **malha**: fonte → emergência (fechada) → stop (fechado) → nó → (botão LIGAR **em paralelo com** o contato de selo do KM1) → bobina do KM1 → terra.
6. Uma lâmpada no outro contato do KM1 representa a carga.

⚠️ **Os dois botões de parada são SPST fechados** (emergência e stop) e o LIGAR é SPST **aberto**. Trocar isso é o erro que faz o circuito "funcionar ao contrário" na tela.

### Os 4 comportamentos a verificar

| Ação no simulador | Esperado |
|---|---|
| Ligar a fonte, sem tocar em nada | Lâmpada **apagada** — o selo nasce aberto |
| Clicar em LIGAR e soltar | O KM1 sela, **a lâmpada acende e FICA acesa** |
| Clicar em STOP e soltar | Lâmpada apaga e **NÃO volta** ao soltar. Só o LIGAR religa |
| Clicar em EMERGÊNCIA e soltar | Idêntico ao STOP — é a mesma malha, aberta em outro ponto |

> 🎯 **O segundo teste é o que valida todo o desenho.** Se a lâmpada apagar quando você solta o botão LIGAR, o contato de selo não está em paralelo com ele. E se, ao soltar a emergência, a lâmpada acender sozinha, o selo ficou **antes** do botão em vez de depois.

---

## 42.5 Ordem recomendada

```
1. simulador.py --cenario degrau     → ajuste Kp, Ki, Kd até a curva ficar boa
2. simulador.py --cenario ciclo      → confira os tempos e a duração do ensaio
3. simulador.py --cenario falha-fan  → veja a proteção atuar
4. Falstad                            → prove o circuito de comando dos 2 estágios
5. Wokwi                              → rode o código C++ real, teste botões e IHM
6. Bancada com o Arduino de verdade   → LEDs no lugar dos BTS, sem Peltier ainda
7. Bancada com os BTS e carga resistiva (lâmpada automotiva)
8. Só então: as **2 Peltier em série**, o **PTC de 24 V** e a câmara montada
```

> ⚠️ **Não pule o passo 6.** Gravar o firmware num Mega solto, com LEDs no lugar dos drivers, custa 20 minutos e pega a maior parte dos erros de lógica — antes de qualquer risco de queimar uma Peltier.

---

## 42.6 ✅ Checklist

- [ ] ⭐ **`npm run simula` passando** — as 83 verificações da tabela de estados
- [ ] ⭐ **`npm run valida` passando** — o simulador roda **antes** dos validadores de fiação
- [ ] Se você mudar o `.ino`, o espelho JS em `src/sim/firmware.js` mudou junto?

- [ ] `simulador.py` rodado nos 6 cenários
- [ ] Ganhos do PID escolhidos com base na curva do `--cenario degrau`
- [ ] Overshoot do patamar quente avaliado (é maior que o do frio)
- [ ] Duração do ensaio de ciclagem estimada e compatível com o tempo da apresentação
- [ ] CSV exportado e gráfico feito no Excel para o relatório
- [ ] Licença gratuita do Wokwi ativada no VS Code (`F1 → Wokwi: Request a New License`)
- [ ] `.\compilar.ps1` rodando sem erro
- [ ] Projeto Wokwi rodando, com os 6 testes da §42.3 aprovados
- [ ] **Teste 6 do Wokwi aprovado**: a emergência liberada não religa sozinha
- [ ] Circuito de dois estágios verificado no Falstad
- [ ] Firmware testado em bancada com LEDs antes de qualquer atuador real

---

📄 **Anterior:** [Doc 41 — ESP32, IHM e IoT](41_esp32_ihm_iot.md) · **Próximo:** [Doc 50 — Montagem e Comissionamento](../camada_5_integracao/50_montagem_e_comissionamento.md)
