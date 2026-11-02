# CAMADA 3 · Doc 31 — Comando, Proteções e Aterramento

> O acionamento do processo numa **cadeia única com um selo só**, a emergência em hardware, o que fica em software, a seletividade das proteções e o aterramento. **É o documento com mais conteúdo puro de eletrotécnica do projeto.**
>
> ✅ **Pré-requisito:** [Doc 30](30_forca_e_distribuicao.md) — força energizada e medida.
> 🖼️ **Desenho:** [Diagrama de comando](../desenhos/06_diagrama_comando.svg)

---

## 🔴 Intertravamento — o que é físico e o que é software

> Esta seção exigia três proteções que **não podem depender do firmware**. Por duas
> revisões ela ficou só no papel: **nenhuma das três existia no cadastro, na fiação
> nem na lista de compras.** O que está abaixo é o que foi efetivamente
> implementado, com o nome das peças — e o que ficou de fora, com o motivo.
>
> 📌 **Status:** ST-1 e ST-2 são uma **arquitetura proposta**, não aprovada para
> compra nem energização. Faltam modelos identificáveis com classificação CC
> documentada, rearme seguro, proteção ambiental e validação térmica do acrílico.
> Item **2 permanece em firmware**, com justificativa e risco residual declarados
> no fim. RPM1/RPM2 supervisionam somente os dois coolers externos do radiador.
> As cinco ventoinhas internas, inclusive a do PTC, têm dois fios e não têm
> tacômetro; falha de KA3 ou travamento da ventoinha do PTC não é necessariamente
> detectada pelo firmware. O simulador agora representa um permissivo de ventilação
> proposto e recusa rearme/partida sob as falhas injetadas, mas esse sinal não existe
> no circuito nem no firmware real. Até implementar supervisão física ou cumprir
> um procedimento de inspeção verificável, a causa da sobretemperatura não pode ser
> considerada corrigida. A proposta térmica também não é intertravamento de fluxo.
>
> O simulador também deriva uma corrente PTC idealizada do estado elétrico e dispara
> `DRIVER_PTC_COLADO` quando há corrente acima do limiar modelado com o comando do
> aquecedor desligado. A pinagem documenta BTS2 `IS`/A1, mas ainda falta validar em
> bancada se essa saída mede corretamente corrente durante a falha do driver e se o
> corte pelo KA1/KM1 interrompe esse modo de falha. Esse diagnóstico por firmware é
> complementar, não proteção independente; a medição real e o corte físico continuam
> pendentes de validação.
>
> O teste separa corrente real do ramal e leitura de `IS`: se A1 não sinalizar, o modelo
> permanece sem diagnóstico apesar de o PTC continuar conduzindo. Com a proposta de
> PTC em 12 V, a condição é mais crítica: o simulador mantém BD-PTC e a corrente do
> aquecedor após abrir KM1, inclusive em STOP/emergência, porque o barramento do T3 é
> permanente e o corte independente ainda não foi definido. Requer-se medição de
> corrente independente do BTS e meio de interrupção DC independente do KM1; componentes,
> topologia e dimensionamento ainda não foram selecionados nem validados. Não considerar
> o trip por software como proteção para esses modos combinados.

### 1. Proteção térmica do PTC — ⛔ PROPOSTA NÃO APROVADA PARA ENERGIZAÇÃO

> ⚠️ **O que isto é e o que NÃO é.** Isto é **proteção térmica** — detecta que a
> temperatura subiu demais e corta. **Não é intertravamento de ventilação**: não
> detecta "ventoinha parada" antes do aquecimento. Se a ventoinha não partir, o PTC
> ainda recebe energia até que uma proteção térmica validada abra. A distinção é
> importante: a proteção responde à **consequência** (calor),
> não à **causa** (falta de fluxo de ar). Um sensor de fluxo detectaria antes, mas
> acrescenta uma peça que pode falhar em silêncio (palheta presa aberta) e não
> cobre o BTS em curto — o termostato cobre todos os modos porque todos resultam
> em temperatura subindo.

O PTC fica na base da câmara de 15 L. Sem escoamento de ar, a carcaça e o acrílico
ao redor podem aquecer. Os limites dependem do material comprado e ainda precisam
ser confirmados; não energizar o PTC até encerrar as validações abaixo.

A proposta é usar contatos térmicos **NF** em série com o aquecedor, fora do
firmware. A topologia abaixo não comprova que os componentes selecionados
interrompem CC com segurança e não autoriza a ligação direta:

```
BD-POT ─► BTS2 · M+ ─► PG13-2 ─► ST-1 (90 °C, no corpo do PTC)
                                  └─► ST-2 (70 °C, na parede interna direita)
                                        └─► PTC +
```

| | Peça | Onde | Abre em | Rearme | Por quê |
|---|---|---|---|---|---|
| **ST-1** | Variante **NF** de rearme manual, modelo pendente | Preso no corpo do PTC, montagem térmica a validar | **90 °C nominal**, tolerância pendente | **Manual obrigatório** | Um disparo deve manter o aquecedor desligado até inspeção e rearme deliberado |
| **ST-2** | KSD301 manual é apenas candidato; modelo pendente | Parede interna direita, posição a validar | **70 °C nominal** é apenas proposta; tolerância pendente | **Manual** | Não aprovada até confirmar CC, temperatura, proteção ambiental e margem para o acrílico |

**Por que NF e não NA.** Com o fio rompido, um NF fica **aberto** e o PTC não
liga — a falha é segura. Um NA com o fio rompido ficaria fechado e a proteção
desapareceria sem ninguém notar.

> ⚠️ **A POSIÇÃO NO CIRCUITO NÃO DETERMINA A ORDEM DE ABERTURA.** ST-1 e ST-2
> respondem a temperaturas em **pontos diferentes** do sistema. Quem abre primeiro
> depende da montagem, da tolerância do termostato (±5 °C), do gradiente térmico
> e da inércia de cada ponto — não de quem vem primeiro no fio. A corrente
> atravessa os dois; qualquer um que abra corta o PTC.

> ⛔ **ST-1: rearme manual é requisito, não uma característica confirmada da
> peça citada.** O KSD9700-B anteriormente sugerido não está aprovado. Identificar
> uma variante exata e obter ficha técnica do fabricante que confirme temperatura
> e tolerância, rearme manual, proteção ambiental e capacidade de interrupção
> em 24 Vcc para a corrente do PTC. Se não existir peça adequada, projetar e
> validar uma trava externa de desligamento manual com elemento de corte DC-rated.
>
> ⛔ **ST-2: não comprar nem ligar diretamente em série com o PTC.** Não foi
> identificada uma variante manual específica de KSD301 com ficha técnica que
> comprove rating CC, temperatura/tolerância e proteção ambiental adequados.
> Uma classificação de 16 A em 250 Vca não comprova interrupção de 3,33 A em
> 24 Vcc. Se não houver componente que satisfaça todos os requisitos, projetar
> uma arquitetura alternativa de corte/trava com contatos DC-rated dimensionados
> para a carga, e validar o circuito antes da compra.

> 🔒 **ST-1 também exige parada travada até intervenção.** A temperatura do
> corpo do PTC não é medida pelo DS18B20, que acompanha o ar da câmara. Portanto,
> não se pode presumir que o firmware reconhecerá um disparo de ST-1. O projeto
> não aceitará auto-rearme de ST-1: a abertura deve impedir novo aquecimento
> mesmo depois de o termostato esfriar, até que a causa seja inspecionada e o
> operador rearme manualmente. A variante exata ou a arquitetura equivalente
> permanece pendente de identificação e validação.
>
> O simulador trata o disparo e o rearme como eventos explícitos dos contatos
> físicos. Ele não infere a temperatura do corpo do PTC a partir do DS18B20 nem
> calcula a temperatura local do PTC, o efeito térmico da perda da ventoinha ou
> o instante em que ST-1/ST-2 abririam. O permissivo de ventilação do simulador
> deriva das falhas injetadas e é uma proposta, não uma leitura física presente no
> painel. Os testes confirmam lógica modelada de bloqueio; não comprovam a dinâmica
> térmica, a detecção física do fluxo ou a proteção instalada.
>
> 🔒 O bloqueio retentivo após trip é um requisito de arquitetura, não uma função
> já demonstrada no painel: precisa interromper fisicamente a autorização/KM1,
> permanecer ativo após o rearme do contato ST e exigir reconhecimento,
> inspeção e nova ação deliberada no botão verde. O estado `bloqueioTermico` do
> simulador representa essa trava externa proposta; não comprova que ela exista
> na fiação nem autoriza energização.

> ⚠️ **VALIDAÇÃO DO ACRÍLICO AINDA PENDENTE.** PLEXIGLAS GS (fundido) tem
> temperatura máxima aproximada de serviço de 80 °C; PLEXIGLAS XT (extrudado),
> aproximadamente 70 °C. Com tolerância de ±5 °C, um dispositivo nominal de
> 70 °C pode abrir a 75 °C; atraso térmico e diferenças entre os pontos de
> medição e os pontos quentes reduzem ainda mais a margem. Identificar o tipo
> realmente comprado e, em ensaio controlado, medir vários pontos da parede,
> especialmente próximos ao PTC. Não aprovar o limite de 70 °C nem energizar
> antes de demonstrar margem abaixo do limite aplicável.
>
> ⚠️ **PROTEÇÃO AMBIENTAL PENDENTE.** Algumas variantes KSD301 são IP00 e a
> câmara pode ter condensação. Confirmar a classificação da variante exata e
> validar a proteção contra umidade da montagem; não assumir IP54 sem ficha técnica.

### 2. PTC e Peltier não podem estar ligados juntos — ⚠️ PERMANECE EM FIRMWARE

A V7 pedia exclusão mútua por hardware (o contato NF de um abrindo a bobina do
outro). **Isso não foi implementado**, e a razão é honesta: os dois são acionados
por **BTS7960**, que não tem bobina — tem `R_EN`, `L_EN` e `PWM`. Fazer exclusão
mútua por hardware exigiria mais um módulo de relé só para espelhar o estado de um
dos canais, e o ganho seria pequeno:

| Se os dois ligarem juntos | Consequência | Quem limita |
|---|---|---|
| Firmware travado com `renPtc` e `renPeltier` verdadeiros | 9,30 A no ramal de potência · 10,42 A na fonte | A cadeia térmica foi proposta para interromper o PTC, mas **não está aprovada nem validada**; não energizar |
| Câmara aquecendo com a Peltier tentando resfriar | energia desperdiçada; resultado térmico depende do ensaio real | ST-2 ainda não foi validado contra o acrílico |

📌 **A exclusão mútua continua no firmware** (camada 7 do [Doc 02 §2.6](../camada_0_fundamentos/02_arquitetura_de_energia.md)), e o **watchdog de 2 s** derruba as duas saídas se o programa travar. A cadeia térmica não pode ser considerada proteção efetiva até que os componentes CC-rated, a trava manual e o desempenho térmico sejam identificados e validados. O modelo elétrico só prova as consequências lógicas dos contatos abertos; não prova o desempenho do hardware.

### 3. Sobretemperatura da câmara — ⛔ PENDENTE DE COMPONENTE E VALIDAÇÃO (ST-2)

É a função pretendida para ST-2: cortar o PTC se a parede aquecer demais,
independentemente do DS18B20 e do PID. **Ainda não está demonstrado** que um
termostato de 70 °C com a tolerância proposta proteja o tipo real de acrílico;
ver requisitos de compra e ensaio do item 1.

> ⚠️ **Sobre o BTS7960:** ele é um **driver de MOSFET**, não um relé. Tem pinos
> `R_EN`, `L_EN` e `PWM` — **não tem bobina**. Qualquer texto deste repositório que
> fale em "bobina do BTS7960" está errado. O intertravamento nele é feito
> **puxando os dois `EN` para o nível inativo por um contato NF**, além do corte
> físico no ramal de potência.

---

## 🟢 Em palavras simples — como a máquina para quando precisa parar

Este documento responde a uma pergunta só, mas ela é a mais importante do projeto:

> **Se o programa travar com a Peltier ligada, como eu desligo?**

Se a resposta dependesse do software, o software seria o único ponto de falha do sistema. Então a resposta **não pode** depender dele.

### Dois botões que parecem iguais e são muito diferentes

| | **STOP** | **EMERGÊNCIA** (cogumelo vermelho) |
|---|---|---|
| Para a máquina? | Sim | Sim |
| Como volta? | Aperta o **LIGAR** verde | **Não volta sozinha.** Nem soltando o cogumelo |
| Precisa de quê para voltar | Um comando normal | **Destravar o cogumelo** e *depois* apertar o LIGAR |
| Serve para | Parar a operação | Situação de risco |

**Por que a emergência trava?** Imagine que alguém aperta o cogumelo porque enfiou a mão onde não devia. Se destravar o botão religasse a máquina, ela voltaria a funcionar **com a pessoa ainda lá dentro**. A norma (ISO 13850) proíbe isso: destravar libera, mas quem religa é uma decisão consciente e separada.

> ### ⭐ Destravar e religar são dois atos — mas não precisam de dois botões
>
> Este painel já teve um **botão azul de REARME** só para refazer a trava da emergência, e depois dele ainda era preciso apertar o verde. Eram dois botões e três passos para sair de uma emergência.
>
> **A norma não pede um botão de rearme dedicado.** A ISO 13850 pede duas coisas: que soltar o atuador **não** religue a máquina, e que religar seja um comando deliberado e separado. Destravar o cogumelo aqui devolve tensão à malha e **nada mais** — o selo já se perdeu e não se refaz sozinho. O comando deliberado é o **LIGAR verde**, o mesmo que já era exigido depois de qualquer outra parada.
>
> 🎯 **O ganho não é só uma botoeira a menos: é uma pergunta a menos.** Depois de qualquer parada — cogumelo, botão preto, trip do firmware, queda de energia — a resposta é sempre a mesma: **aperte o verde**.

### Como se faz uma máquina "lembrar" que foi ligada, sem software

Este é o truque mais bonito da eletrotécnica clássica, e chama-se **selo**.

O problema: o botão START é de pulso — você solta e ele abre. Como manter a máquina ligada depois de soltar?

A solução: **o relé segura a si mesmo.**

```
   1. Você aperta o START
             ▼
   2. O relé liga
             ▼
   3. Ao ligar, ele FECHA um contato próprio,
      ligado em PARALELO com o botão START
             ▼
   4. Você solta o botão — mas o contato dele
      mesmo continua alimentando a bobina
             ▼
   5. A máquina fica ligada "por memória"
```

E o melhor: **basta abrir a corrente em qualquer ponto do circuito** (emergência, STOP, falta de energia) que o relé solta, o contato abre, e o selo se perde. **Só um novo START religa.** Memória sem uma linha de código.

### 🔧 Na prática, o selo é um pedacinho de fio de 4 cm

No esquema o selo é uma linha bonita. Na base do relé ele é a coisa mais simples que existe: **um jumper entre dois parafusos do próprio KM1.**

| Fio | De | Para | O que é |
|---|---|---|---|
| **C6** ⭐ | KM1 · **24** (fileira de cima, pino 8) | KM1 · **A1** (fileira de baixo, pino 13) | **o selo** — o contato NA realimentando a própria bobina |
| C4 | S1 · **13** (o nó depois das duas paradas) | KM1 · **21** (cima, pino 12) | o comum do contato de selo — vem da porta, não é ponte |

⚠️ **Os dois vão de uma fileira à outra, então o jumper contorna o relé por fora.** Não passe o fio por baixo do corpo dele nem por trás da base: além de não caber, você não consegue mais conferir se está no parafuso certo. Corte uns 4 cm, faça as duas pontas com terminal ilhós, e deixe a barriga do fio para fora do lado direito.

> 📐 **No aplicativo** as pontes são desenhadas contornando o componente, e não em linha reta pelo meio dele. Isso não é enfeite: **desenhadas retas, elas ficavam escondidas atrás do relé**, e o relé aparecia com os bornes 21 e 24 amarelos e aparentemente soltos — inclusive o 24, que é justamente o selo. Hoje o `npm run valida` reprova qualquer fio que passe por dentro de um componente, incluindo o próprio.

### Por que UM relé — e o que mudou quando o segundo saiu

Este painel já teve **dois** relés na cadeia: um **segundo relé de selo**, que só a emergência derrubava e só o rearme azul refazia, e o `KM1`, do processo. A fronteira entre eles era **quem os comanda**.

**Essa fronteira desapareceu no dia em que o LIGAR verde passou a refazer os dois selos.** Um relé cujo selo é feito pelo mesmo botão, na mesma hora, pelo mesmo dedo, não é um estágio: é uma cópia. E uma cópia em série com a original não protege ninguém — só dá mais um contato para dar defeito, mais seis fios para errar e mais um passo para o operador.

> 🎯 **A pergunta certa não é "quantos relés?", é "onde o software pode estar?"** A resposta continua idêntica, e é ela que sustenta o projeto inteiro:
>
> | | Onde fica | O que consegue fazer |
> |---|---|---|
> | **S0 · cogumelo (NF)** | **a montante** de tudo, em série com a bobina | Derruba, sempre. Nada a jusante o contradiz |
> | **S2 · STOP (NF)** | logo depois do cogumelo, na mesma malha | Derruba, sempre |
> | **KA1 · o firmware** | **a jusante**, no retorno da bobina, **em série** | ⭐ **Só pode derrubar.** Jamais segurar contra uma botoeira |
>
> **Em série, o software só sabe subtrair.** Para o firmware furar a emergência, o contato do KA1 teria de estar em **paralelo** com o cogumelo — e não está, não pode estar, e o desenho mostra isso num relance.

> ### 🔧 O que se perdeu, declarado
>
> | Você ganha | Você paga |
> |---|---|
> | Uma botoeira, um relé, um bloco de contato e **6 fios** a menos | ⚠️ O corte da emergência passa a depender de **um contato só** (o do KM1), e não de dois em cascata |
> | Depois de QUALQUER parada, um botão só religa | O bloco NF do cogumelo agora está **em série com o do STOP**: um curto interno no bloco do STOP não afeta a emergência, mas um fio solto entre os dois derruba tudo (⚠️ que é o estado seguro) |
> | Some o erro de montagem mais caro do painel: **trocar os dois selos entre si** | O **segundo relé** sai da lista de material — quem já comprou fica com uma reserva |
>
> 📌 **A cascata que se perdeu era menos do que parecia.** O contato do **segundo relé** alimentava o do `KM1`, mas quem entrega os 24 V à carga sempre foi **só o contato 11-14 do KM1**. Um contato do KM1 soldado já derrotava o cogumelo antes, com dois relés ou com um ([§31.0](#310-o-acionamento-em-uma-cadeia)). O que a cascata cobria era o caso de a **bobina** do KM1 ficar presa — e para isso o selo já não se refaz sozinho.

> ### ⭐ O selo — o truque mais bonito da eletrotécnica clássica
>
> O problema: o botão é de pulso. Você solta e ele abre. Como manter a máquina ligada?
>
> A solução: **o relé segura a si mesmo.**
>
> ```
>   +24 V ──[ S0 · EMERG NF ]──[ S2 · STOP NF ]──┬──[ S1 · LIGAR NA ]──┐
>                                                 └──── KM1 · SELO ────┤
>                                                    A1 [ KM1 ] A2 ──► 0 V
> ```
>
> Aperta o **verde** → o KM1 liga → ao ligar, fecha um contato próprio em **paralelo** com o botão → você solta e ele continua se alimentando sozinho.
>
> Aperta o **preto** (ou soca o **cogumelo**) → um NF abre → a bobina cai → **o contato de selo abre junto** → você solta, mas o selo já está aberto e o verde também. **Fica caído.** Só um novo LIGAR religa.
>
> 🎯 **O "apertar uma vez" não é propriedade do botão: é o selo que se perde e não se refaz sozinho.** Memória sem uma linha de código.
>
> ⚠️ **E é por isso que o botão verde é obrigatório.** Uma parada em hardware que **retém** exige um selo, e um selo exige um botão físico para ser refeito. **Os dois andam sempre juntos** — não existe metade desse circuito.

> ### ⚖️ O preço, declarado
>
> | Você ganha | Você paga |
> |---|---|
> | STOP e emergência que cortam **e retêm** em hardware, com o firmware em qualquer estado | O botão verde é indispensável: +1 botoeira, +1 bloco, +3 fios |
> | Um caminho de parada independente do software, sem usar o cogumelo | ⛔ **A IHM não rearma a potência.** Depois de um STOP no botão preto, alguém tem de apertar o verde |
> | O trip do firmware também **retém** (§31.13) | Volta o risco de trocar os dois blocos do S2 (§31.5) |
>
> 📌 **A IHM continua parando e reiniciando o ensaio normalmente** — ela só não refaz o selo do KM1. Uma parada pela tela é **Categoria 2**: derruba o `R_EN` e mantém a potência armada, então o `INICIAR` da tela volta a rodar sem ninguém sair do lugar.

### Por que os botões de parada são "normalmente fechados"

Um contato **NF** deixa a corrente passar quando o botão está solto, e **corta** quando você aperta. Parece invertido, mas é proposital:

> **Se o fio arrebentar, o circuito abre — e a máquina para.**

Ou seja: **a falha leva ao estado seguro.** Se o botão fosse "normalmente aberto", um fio partido faria o botão simplesmente **não funcionar** — e ninguém descobriria até o dia em que precisasse dele.

O **LIGAR verde** é o contrário (NA), pelo mesmo raciocínio invertido: fio partido no verde **impede a máquina de armar a potência**, que também é o estado seguro. Se ele fosse NF, um fio partido armaria tudo sozinho.

### A divisão que organiza tudo

> 🎯 **Tudo que envolve PARAR está em hardware. Só o que envolve LIGAR está em software.**

A máquina desliga por caminhos que não dependem de nada. Para ligar, ela depende de tudo estar certo.

### ⚡ Os dois caminhos — o relé NÃO está no caminho do comando

Esta é a confusão mais fácil de ter, e vale deixar explícita: **potência e comando são dois caminhos separados**, e eles só se encontram dentro do chip do BTS7960.

```
 CAMINHO DA POTÊNCIA (energia)          CAMINHO DO COMANDO (informação)
 ══════════════════════════════         ═══════════════════════════════

  FONTE 24 V                                    ARDUINO
      │                                            │
   [F1 10A]                                    D4 (enable)
      │                                        D5 (PWM 1 Hz)
   poste P1                                        │
      │                                            │  fios de 0,25 mm²
   [ KM1 ]  ◄── abre só na emergência/STOP         │
      │                                            │
   BD-POT ──────────────► B+ ┌──────────────┐ ◄────┘
                             │   BTS7960    │
                             │  (os MOSFETs)│
                             └──────┬───────┘
                                 M+ │ M−
                                    ▼
                              2× PELTIER
```

**O comando vai `Arduino → BTS → Peltier`.** Nunca `Arduino → relé → BTS`.

| | **KM1 (relé)** | **BTS7960** |
|---|---|---|
| Função | Chave de **segurança** | Chave de **controle** |
| Quem comanda | **As botoeiras**, em hardware | O Arduino, em software |
| Quantas vezes atua | **Dezenas**, na vida do projeto | **86.400 por dia** (1 Hz) |
| Se falhar | A emergência não corta ⚠️ | O processo não controla |

> ⚠️ **Por que o relé não pode fazer o PWM:** um relé típico tem vida elétrica de ~100.000 operações. A 1 Hz são 86.400 por dia — **ele acabaria em cerca de 28 horas**. Chaveamento rápido é trabalho de semicondutor; relé é para abrir e fechar poucas vezes, com segurança.

> 🎯 **O Arduino não tem nenhum pino capaz de FECHAR a cadeia** — e essa é a regra que não se negocia. Se o software pudesse refazer o selo, a emergência dependeria dele, e aí não seria emergência. Não há um único fio do Arduino entre o BD-24V e a bobina do KM1.
>
> 🔧 **O que ele tem é um pino no RETORNO da bobina, e apenas em série:** o `D27` comanda o **KA1**, um módulo de relé depois do `A2` ([§31.13](#3113--o-veto-do-firmware-sobre-a-potência-ka1)). Isso lhe dá poder de **derrubar** a potência, nunca de segurá-la contra uma botoeira. A confirmação de potência é a leitura `V1` do N4AIC24 via Modbus RTU/RS-485. Leitura fora da faixa válida, ausente ou expirada deve bloquear a partida; em operação, a perda de comunicação deve produzir falha retentiva, sem religamento automático. O timeout e os limites numéricos do simulador são hipóteses até serem confirmados no mapa/ciclo do firmware real.

### Dicionário rápido

| Termo | O que quer dizer |
|---|---|
| **Bobina** | O eletroímã do relé. Energizou, os contatos mudam de posição |
| **Contato NA** | Normalmente Aberto — fechado só quando a bobina está ligada |
| **Contato NF** | Normalmente Fechado — abre quando a bobina liga |
| **Reversível (CO)** | Um contato que tem NA e NF juntos, comutando entre eles |
| **Selo** | O contato do próprio relé que o mantém ligado depois de soltar o botão |
| **Relé de interface** | Relé pequeno que deixa um sinal fraco comandar uma carga forte |
| **Intertravamento** | Impedir que duas coisas aconteçam juntas (aqui: Peltier e PTC) |
| **Trip** | Desligamento automático por falha detectada |
| **Watchdog** | "Cão de guarda": se o programa travar, ele reinicia o processador |
| **Seletividade** | Só a proteção mais próxima da falha atua |
| **Fail-safe** | Projetado para que a falha leve ao estado seguro |

---

## 31.0 O acionamento em uma cadeia

O acionamento precisa satisfazer quatro exigências **ao mesmo tempo**:

| # | Exigência | Consequência |
|---|---|---|
| 1 | **STOP corta a energia em hardware** | Não pode depender do firmware |
| 2 | **EMERGÊNCIA corta a energia em hardware** | Idem |
| 3 | **Ao soltar a emergência, a energia NÃO pode voltar sozinha** | Exige **trava (selo)** — e trava só se desfaz com um comando deliberado |
| 4 | **START e STOP normais funcionam pela IHM** | O operador não pode ser obrigado a ir ao painel a cada parada |

> ⚠️ **As exigências 3 e 4 parecem se contradizer, e não se contradizem.** O que as separa não é um segundo relé: é o fato de a parada pela IHM ser uma **coisa diferente** da parada em hardware. A tela derruba o `R_EN` dos drivers e não toca no selo (Categoria 2); as botoeiras derrubam o selo (Categoria 0/1). Quem para pela tela religa pela tela; quem para no painel religa no painel.
>
> **A trava que a ISO 13850 exige mora no selo**, e ele é um só: destravar o cogumelo não o refaz, e nenhum comando de software o refaz.

### A cadeia

```
╔═══ A MALHA DO SELO ═════ as duas paradas em SÉRIE · o LIGAR em PARALELO ═══╗
║                                                                            ║
║  +24 V ──[ S0 · EMERG NF ]──[ S2 · STOP NF ]──┬──[ S1 · LIGAR NA ]──┐      ║
║                                                └──── KM1 · SELO ────┤      ║
║                                          A1 [ KM1 ] A2 ──[ KA1 ]── 0 V     ║
║                                                             ▲              ║
║                                                  Mega · D27 ─┘  o veto     ║
╚════════════════════════════════════════════════════════════════════════════╝
                    │ KM1 · contatos de potência independentes (HH64P / LY4NJ 14 pinos · 10 A)
                    ▼
   P1 (24 V) ──► KM1 (Polo 1: 9→5)   ──► BD-POT ──► BTS #1 (Peltier)
   P2 (12 V) ──► KM1 (Polo 2: 10→6)  ──► BD-PTC ──► BTS #2 (PTC)
   Selo      ──► KM1 (Polo 3: 11→7)  ──► A1 (auto-retenção)
   Reserva   ──► KM1 (Polo 4: 12→8)  ──► livre / sinal auxiliar
```

⭐ **Leia a malha de cima para baixo e o projeto inteiro cabe em três frases.** Os dois blocos NF estão em série: qualquer um aberto derruba a bobina. O selo está em paralelo com o verde: solto o botão, o relé se segura sozinho. O KA1 está em série no retorno: o firmware pode derrubar, nunca segurar.

### O que acontece em cada situação

| Situação | Selo do KM1 | 24 V nos BTS | Como volta |
|---|---|---|---|
| Operação normal | ✅ selado | ✅ presente | — |
| **STOP no botão preto** | ❌ **perdido, em HW** | ❌ **cortado** | ⭐ **botão VERDE** |
| **STOP pela IHM / MQTT** | ✅ segue selado | ✅ presente | **pela IHM** — parada Categoria 2 |
| **Trip** (fan parada, sobrecorrente) | ❌ o **KA1** derruba o selo | ❌ **cortado** | Reconhecer + **botão VERDE** |
| **EMERGÊNCIA** | ❌ **perdido, em HW** | ❌ **cortado em HW** | — |
| **Cogumelo destravado** | ❌ **continua perdido** | ❌ **continua cortado** | Destravar **e** apertar o VERDE |
| **Arduino morre ou reseta** | ❌ o pull-down abre o KA1 | ❌ **cortado** | **botão VERDE**, depois de ele voltar |

> ### ⭐ Um selo, e uma pergunta só: como volta?
>
> Olhe a última coluna da tabela: **a resposta é sempre o botão verde**, exceto na linha da IHM, que é a única parada que não derruba o selo.
>
> | | **O que derruba o selo** | **O que NÃO derruba** |
> |---|---|---|
> | Em hardware | cogumelo · STOP preto · falta de energia | — |
> | Em software | o trip, **pelo KA1 em série** | o STOP da IHM (Categoria 2) |
> | Refeito por | **o LIGAR verde, e só ele** | — |
>
> 🔥 **O painel tinha DOIS selos e um erro de montagem que custava caro:** trocá-los entre si fazia o STOP exigir rearme e a emergência religar no verde — o inverso da norma. **Com um selo só, não há o que trocar.**

> ### 🎯 As três paradas, e por que elas são diferentes de propósito
>
> | Origem | O que cai | Categoria | Como volta |
> |---|---|---|---|
> | **Botão preto** (porta) | O selo do KM1, **em hardware** | 1 | Botão verde, na porta |
> | **IHM / MQTT** | Só o `R_EN`. A potência segue armada | 2 | Pela própria IHM |
> | **Trip** | O KA1 derruba o selo do KM1 | 1 | Botão verde + reconhecimento |
>
> **Não é inconsistência, é a norma.** Uma parada operacional pela tela não precisa obrigar ninguém a caminhar até o painel; uma parada por **falha**, sim — é o que garante que alguém olhe a máquina antes de religá-la. E o botão físico corta em hardware porque é o único que precisa funcionar com o firmware em qualquer estado.

> 📐 **O desenho de ligação dos quatro relés** — borne por borne, com os componentes
> discretos que ficam pendurados neles — está em
> [`desenhos/11_reles_ligacao.svg`](../desenhos/11_reles_ligacao.svg). Ele é **gerado** do
> `painel_completo.js`, então não pode divergir do que os validadores conferem.

## 31.13 ⭐ O veto do firmware sobre a potência (KA1)

O firmware **não tinha como cortar a potência** — só como desabilitar os drivers pelo `R_EN`. Um BTS7960 com o MOSFET colado em curto ficava fora do alcance de qualquer trip. O **KA1** resolve isso com um contato em **série no retorno da bobina** do KM1: o firmware pode **derrubar** o selo, e nunca segurá-lo contra uma botoeira.

> 🔧 **O título desta seção tinha sumido numa edição anterior** — o texto continuava aqui, mas os vários links `§31.13` espalhados pelo projeto não tinham onde aterrissar. Está de volta.

### O componente: um módulo de relé pronto

Nada de soldar. **Módulo de relé de 1 canal, 5 V, com optoacoplador e jumper de nível** — a placa azul de R$ 10 que todo mundo usa com Arduino, e que aqui faz um serviço industrial de verdade.

| Ref | Peça | Onde | Preço |
|---|---|---|---|
| **KA1** | Módulo relé 1 canal **5 V**, optoacoplado, jumper H/L, contato 10 A | caixa DIN **6M**, **trilho 2** | R$ 3,40 |
| **R10** | Resistor **10 kΩ** entre o `IN` e o 0 V | no borne do próprio módulo | R$ 0,10 |
| **D1** | Diodo **1N4007** sobre a bobina do KM1 | nos bornes `A1`/`A2` | R$ 0,20 |

**Buscar:** `modulo rele 1 canal 5v optoacoplador` — e prefira o anúncio que oferece **jumper de gatilho alto/baixo**.

> ### ⚙️ As quatro coisas que precisam estar certas
>
> | # | O quê | Por quê |
> |---|---|---|
> | 1 | **Jumper em `H`** (gatilho alto) | `digitalWrite(pino, HIGH)` fecha o relé — mesma convenção dos três módulos e do resto do painel. Em `L` a lógica inverte e o firmware vira armadilha |
> | 2 | **Contato `COM` + `NO`**, nunca o `NC` | Módulo sem energia = contato aberto = potência cortada. No `NC` um Arduino desligado **armaria** a potência |
> | 3 | **Resistor de 10 kΩ do `IN` ao 0 V** | O anúncio promete tolerância a falha, e o LED do optoacoplador de fato precisa de corrente. O resistor torna isso **medível** em vez de confiado |
> | 4 | **Bobina de 5 V**, confirmada no corpo do relé | Estes anúncios vendem 5 / 12 / 24 V na mesma página e **a foto costuma ser da versão de 24 V** |
>
> 🔎 **Ensaio obrigatório, 30 segundos:** módulo alimentado, **fio do Arduino desconectado** → relé desligado, LED vermelho apagado, sem clique. Se fechar, o painel arma a potência sozinho no boot.

> ### 📌 A isolação é nominal, não galvânica — e vale saber a diferença
>
> O módulo tem **três bornes de entrada**: `DC+`, `DC−` e `IN`. Com só três, o `DC−` **é** a referência do sinal — ele partilha o 0 V do Arduino. O optoacoplador está lá e é real, mas o que ele entrega é **imunidade a ruído** (a entrada é acionada por *corrente* através de um LED, não por tensão num pino de transistor), **não separação de terras**.
>
> Isolação de verdade exigiria a versão de **4 pinos**, com `JD-VCC` e jumper removível, e duas fontes separadas. **Aqui não faz falta:** o painel tem um ponto único de terra por projeto (§31.8), então não há diferença de potencial para isolar.
>
> 🎓 **Diga isso na defesa em vez de repetir o anúncio.** Saber que "tem optoacoplador" não é o mesmo que "está isolado" é exatamente o tipo de leitura crítica de folha de dados que a banca procura.

### Por que um relé e não o MOSFET discreto

Foi a alternativa considerada — **2N7000 + resistor + diodo, R$ 1,10**, montado num conjunto termorretrátil no próprio KM1. Tecnicamente é melhor: não desgasta, não consome corrente e fica a 3 cm da bobina.

| | Módulo de relé | 2N7000 discreto |
|---|---|---|
| Preço | R$ 10 | **R$ 1,10** |
| Solda | **nenhuma** | 3 componentes |
| Consumo no 5 V | 65 mA | **~0** |
| Desgaste | contato mecânico | **nenhum** |
| Estado visível | **LED vermelho** | multímetro |
| Chaveia lado alto? | **sim, é contato seco** | não, precisa de canal P |

**O módulo venceu por três razões práticas:** zero solda, o LED que mostra o veto sem instrumento, e — decisiva para o KA2 — **um contato seco não tem lado alto nem lado baixo**, o que apaga um problema inteiro de projeto.

> ⚠️ **E o desgaste não é objeção aqui:** o KA1 atua num trip, num boot e pouco mais — talvez cinco vezes por dia. A vida elétrica típica é de **100.000 operações**. São décadas. Se ele fosse chavear o PWM, como o KM1 não pode, a conta seria outra (§31.0).

### Cálculo — só para o relatório

```
   Corrente que o contato do KA1 conduz:
      I = 24 V / 650 Ω (bobina do KM1) = 37 mA
      Contato nominal: 10 A em 30 Vcc  →  usa 0,37 % da capacidade ✅

   Corrente que o pino D27 fornece:
      5 mA para o LED do optoacoplador  (limite do Mega: 40 mA) ✅

   Consumo dos TRÊS módulos no barramento de 5 V:
      3 × 65 mA = 195 mA          (KA1, KA2 e KA3)
      ⚠ Some com o Arduino, a tela e o ESP32 antes de fechar o Doc 02.
      → Consumo estimado no 5 V: cerca de 0,7 A, abaixo dos 5 A propostos para T2.
        Modelo, capacidade contínua, faixa de entrada e transientes ainda precisam
        ser confirmados; esta conta não libera a compra ou a ligação.
```

### O que muda no comportamento

| Situação | Antes | Depois |
|---|---|---|
| **STOP apertado e solto** | 24 V voltam; a parada vira responsabilidade do `R_EN` | ⭐ **24 V continuam cortados** até um START |
| Para religar depois do STOP | novo START (mas o barramento já estava armado) | novo START **no painel** — a IHM não refaz o selo |
| STOP pela IHM / MQTT | só desabilitava drivers | ⭐ **corta os 24 V de verdade** |
| Trip por fan parada | `R_EN = LOW` | ⭐ `R_EN = LOW` **+ KM1 abre** |
| BTS com MOSFET em curto | ⚠️ só o cogumelo resolvia | ⭐ **o firmware resolve** |
| Barramento armado | do primeiro LIGAR até o fim do dia | ⭐ **só durante o ensaio** |
| Parada da IEC 60204-1 | Categoria 2 | ⭐ **Categoria 1** (rampa, depois corte) |
| **EMERGÊNCIA** | corta e trava em hardware | **idêntica — o KA1 não a toca** |

### ⚠️ O modo degradado, e por que ele é aceitável

Dois fios novos podem falhar. Vale saber para onde cada falha leva:

| Falha | Consequência | Gravidade |
|---|---|---|
| **Fio do `D23` rompido** (bloco NA do STOP) | O firmware não vê o toque e não para o PID. **Mas o bloco NF de 24 V continua derrubando o selo do KM1** — a potência cai igual | ⚠️ degrada, não fica perigoso |
| **Fio do `D27` rompido** ou **Arduino desligado** | O R10 leva o `IN` a 0 V → KA1 aberto → a potência **nunca é armada** | ✅ **fail-safe** — a máquina não liga |
| **Contato do KA1 soldado** (falha de relé) | O veto do firmware some. O STOP, o cogumelo e o selo do KM1 continuam intactos | ⚠️ volta ao painel sem KA1, que já era aceitável |
| **D1 invertido** | Curto na bobina, **F2 (2 A) abre** | ✅ detectado na montagem |
| **Emergência** | Nenhuma dessas falhas a afeta — o S0 está **a montante** de tudo isto, em série com a bobina | ✅ **intacta** |

> 🎯 **A propriedade que fecha o argumento:** nenhuma falha do KA1 deixa o painel **pior** do que ele era antes de o KA1 existir. As falhas ou levam ao estado seguro, ou degradam para o circuito original — que já era aceitável. **É essa a assinatura de uma melhoria bem colocada em segurança:** ela só pode somar.

### 🔎 Comissionamento do KA1 — 3 minutos, antes de energizar a potência

Com o BD-POT **desconectado** e só a cadeia de comando alimentada:

- [ ] **Jumper em `H`** nos dois módulos · fio do KA1 no **`NO`** ⚠ **e o do KA2 no `NC`**
- [ ] **Sem o Arduino ligado**, medir o `IN` contra o 0 V → **0 V** (o R10 trabalhando), relé **aberto**
- [ ] Medir entre `IN` e 0 V com o ohmímetro → **~10 kΩ**
- [ ] Ligar o Arduino e forçar `digitalWrite(27, HIGH)` → **clique, LED vermelho acende**
- [ ] Com o cogumelo destravado e o STOP solto, apertar o **verde** → o KM1 atraca
- [ ] Forçar `digitalWrite(27, LOW)` → o KM1 solta **e não volta** quando o pino voltar a HIGH ⭐ *(é o selo do KM1 trabalhando — só o verde religa)*
- [ ] ⭐ **E a tela acusa `CORTE_FALHOU`?** Com o contato do KA1 em ponte, confirmar a permanência de tensão em BD-POT pela leitura V1 do N4AIC24 via Modbus. O prazo de detecção depende do ciclo de leitura e do timeout definidos e medidos no firmware real; os valores do simulador são hipóteses de teste, não parâmetros aprovados.
- [ ] Teste de diodo entre `A1` e `A2` do KM1: conduz num sentido só

> 📋 **Filme o ensaio 6d.** Apertar o STOP uma vez, soltar, e mostrar o multímetro cravado em 0 V no BD-POT é a demonstração mais direta de que o painel tem selo — e é o tipo de evidência que vale mais que três páginas de texto na apresentação.

---

## 31.14 ⭐ O KA2 — chavear o lado certo da ventoinha

> Mesma família de problema do §31.13, e **o mesmo componente resolve**. Lá o firmware não conseguia *cortar* a potência; aqui não conseguia *desligar* a ventoinha do radiador.

### O problema em uma frase

**O MV-1 — o módulo MOSFET que ficava neste trilho — chaveia o negativo, e o tacômetro da ventoinha é referenciado nesse mesmo negativo.** Corte o canal e o preto sobe para perto de 12 V, empurrando corrente pelo diodo de proteção do `D3` do Mega. Pior: antes de estragar nada, a leitura já mente — canal desligado lê "ventoinha parada", que é exatamente o alarme que existe para salvar a pastilha.

A decisão anterior foi tirar o comando e deixá-las **sempre ligadas**. Seguro, e com dois custos:

| Custo | Quanto |
|---|---|
| Ventilação sem ninguém para resfriar | **~5 W** girando o dia inteiro com o painel energizado |
| **Fuga térmica durante o aquecimento** | **~2,5 W** — o dissipador ventilado puxa calor da câmara **através da pastilha desligada**, contra o próprio PTC |

### A correção: chavear o positivo

```
                          ⭐ NC, não NO — fechado com o módulo SEM energia
                                │
   BD-AUX · O2 ──► COM │ KA2 │ NC ──► X5 ──► ventoinhas do radiador +
      (+12 V)          └──┬──┘                (2 em paralelo, 0,36 A)
                          │ gatilho
                   Mega · D30 ──[ R11 · 10 kΩ ]── 0 V

   X6 ── ventoinhas − ──► BD-0V · Z15      ⭐ NUNCA chaveado
```

> ### 🔥 O contato é o NC, e essa é a diferença mais importante entre o KA2 e o KA1
>
> A primeira versão deste comando mandava usar o `NO`, copiando a regra do §31.13.
> **Estava errada**, e o erro era de sinal — os dois relés têm estados seguros **opostos**:
>
> | | Desenergizado significa | É o estado seguro? |
> |---|---|---|
> | **KA1** | contato `NO` aberto → potência cortada | ✅ |
> | **KA2 no `NO`** *(como estava)* | contato abre → **ventoinha para com o dissipador a 60 °C** | ❌ |
> | **KA2 no `NC`** *(como ficou)* | contato fecha → **ventoinha gira** | ✅ |
>
> Com o `NC`, **Arduino morto, fio do `D30` rompido, R11 solto ou BD-5V caído** deixam as
> ventoinhas do radiador **girando** — que é exatamente o que um dissipador quente
> precisa. E o KA1, no mesmo instante, já cortou a potência: **primeiro para de gerar
> calor, depois continua tirando o que sobrou.** É a ordem certa, e ela sai de graça.
>
> 🎯 **O argumento que fecha é o mesmo do §31.13, virado do avesso.** Lá: nenhuma falha
> do KA1 deixa o painel pior do que era antes de ele existir. Aqui: com o `NC`, o **pior
> caso vira o comportamento antigo do projeto** — ventoinha sempre ligada, que custava
> ~5 W e nunca custou uma pastilha. Uma correção que troca o pior caso pelo estado que
> você já aceitava não tem contra.
>
> ⚠️ **A lógica do `D30` fica invertida em relação à do `D27`, e isso é deliberado:**
> `HIGH` fecha o relé, o `NC` abre e as ventoinhas **param**. Existe **uma única função**
> no firmware que escreve neste pino, e a inversão mora só lá dentro
> ([Doc 40 §40.10](../camada_4_programacao/40_firmware_arduino.md)). Nenhum outro ponto do
> código toca o `D30` direto — é assim que uma inversão deixa de ser armadilha.

> ### 🎯 Um contato seco não tem lado alto nem lado baixo
>
> **É essa frase que apaga o problema inteiro.** O MV-1 é um MOSFET canal N: ele só sabe puxar para 0 V, e por isso era obrigado a chavear o negativo. Um contato de relé não tem essa restrição — ele apenas abre e fecha, e você escolhe em que fio pô-lo.
>
> | | Chaveando o **NEGATIVO** (o que quebrou) | **Contato do KA2 no POSITIVO** |
> |---|---|---|
> | O preto da ventoinha, desligada | sobe para ~12 V 🔥 | **fica em 0 V** ✅ |
> | Referência do tacômetro | se mexe | **fixa, sempre** |
> | Sinal no `D3` com ela parada | injeta corrente pelo diodo de proteção | transistor do tacômetro sem alimentação → **coletor aberto** → o pull-up leva o pino a HIGH. Inofensivo |
> | Ventoinha necessária | — | **as de 3 fios que já estão na lista** |
>
> 🔧 **Foi considerado um P-MOSFET (IRF9540N) com um canal do MV-1 servindo de inversor de nível.** Funcionava, custava R$ 3,50 e exigia entender por que um canal P liga com o gate *abaixo* da fonte. **O relé faz o mesmo sem inversor nenhum.**
>
> 📌 **E o argumento acabou valendo para o módulo inteiro.** O MV-1 sobrou com 3 dos 4 canais livres, foi ficando caro para o serviço que prestava, e saiu do projeto: as 5 ventoinhas internas passaram para o **KA3**, um terceiro módulo de relé na mesma caixa deste aqui. Ver [§31.16](#3116--o-ka3--por-que-relé-e-não-mosfet-e-a-regra-que-decide).

### Os componentes

| Ref | Peça | Onde | Preço |
|---|---|---|---|
| **KA2** | Módulo relé 1 canal **5 V**, optoacoplado, jumper H/L | mesma caixa DIN **6M** do KA1, **trilho 2** | R$ 3,40 |
| **R11** | Resistor **10 kΩ** entre o `IN` e o 0 V | no borne do módulo | R$ 0,10 |
| **D2** | Diodo **1N4007** sobre as ventoinhas, catodo no **+** | junto às ventoinhas | R$ 0,20 |

⭐ **Das quatro regras do §31.13, três valem igual e UMA se inverte:**

| # | §31.13 (KA1) | **§31.14 (KA2)** |
|---|---|---|
| 1 | jumper em `H` | igual |
| 2 | contato **`COM`+`NO`** | 🔥 **`COM`+`NC`** — estado seguro oposto |
| 3 | pull-down de 10 kΩ no `IN` | igual (R11) |
| 4 | bobina de **5 V** confirmada no corpo | igual |

> 📌 **Os módulos moram todos na mesma caixa DIN**, no trilho 2, com o `DC+` e o `DC−` pontelhados entre eles lá dentro — sai **um** par de fios para o BD-5V e o BD-0V. São 51 × 25,5 mm cada.
>
> 🔧 **A caixa passou de 4M para 6M quando o KA3 chegou** ([§31.16](#3116--o-ka3--por-que-relé-e-não-mosfet-e-a-regra-que-decide)): três módulos somam 76,5 mm e não cabem nos 70 mm de uma caixa de 4 módulos. Mesmo assim o trilho 2 ficou **mais folgado**, porque o módulo MOSFET que saiu media 66 mm.

### Comportamento resultante

```
   ligado  ⟺  a Peltier está resfriando  OU  o dissipador ainda está quente
```

| Situação | Peltier ativa? | Dissipador quente? | Ventoinha |
|---|---|---|---|
| Resfriando | ✅ | — | 🟢 **100 %** |
| Aquecendo com o PTC | ❌ | ❌ | ⚫ **desligada** — acaba a fuga de 2,5 W |
| Pós-ventilação | ❌ | ✅ | 🟢 **100 %** até esfriar |
| Parado e já frio | ❌ | ❌ | ⚫ **desligada** |
| **DS18B20 com o fio solto** | — | ⚠️ **conta como quente** | 🟢 **ligada** — fail-safe |

> 🎯 **A regra só permite desligar quando o sensor confirma que não há calor a tirar.** Não existe estado da máquina — `FALHA`, `EMERGENCIA`, cogumelo socado — em que a ventoinha pare com o dissipador quente. **A condição é sobre temperatura, não sobre estado**, e é daí que vem a segurança.

### 🔎 Comissionamento do KA2

⚠️ **Repare que as duas primeiras linhas são o INVERSO das do KA1** — e é esse contraste que prova o contato NC.

- [ ] O fio do BD-AUX · O2 está no **`COM`** e o do X5 no **`NC`** — **não no `NO`**
- [ ] ⭐ **Com o Arduino DESLIGADO e o LED do KA2 apagado, as ventoinhas GIRAM.** Se estiverem paradas, o fio está no `NO` — volte e troque, porque é o fail-safe inteiro que está invertido
- [ ] Forçar `digitalWrite(30, HIGH)` num sketch → clique, LED aceso, e elas **PARAM**
- [ ] Forçar `LOW` → **voltam a girar**, e o **preto delas continua em 0 V** — é o ensaio que prova o chaveamento pelo positivo
- [ ] Puxar o fio do `D30` com o ensaio rodando → **elas continuam girando** (o R11 trabalhando)
- [ ] Com elas paradas, medir o `D3` e o `A8` → **~5 V, estáveis**. Tensão no preto significa que o contato está no fio errado
- [ ] Desconectar o DS18B20 com o sistema parado e frio → **as ventoinhas devem LIGAR** ⭐

---

## 31.15 ⭐ O diodo da bobina do KM1 — e o preço escondido que ele cobra

> Seção curta, e ela existe porque o **D1 protege um componente prejudicando outro**. Saber disso é exatamente o tipo de leitura que separa montar de projetar.

### O que o D1 faz de bom

O **D1** (1N4007, catodo no `A1`) fica em antiparalelo com a bobina do KM1. Quando o contato do KA1 abre, o campo magnético da bobina colapsa e induz uma tensão reversa de **centenas de volts**. Sem o diodo, esse pico aparece **no contato do KA1** e abre arco. Contato que arca, pita; contato que pita, solda — e um KA1 soldado é o veto do firmware perdido em silêncio. O diodo grampeia o pico em ~24,7 V e o contato interrompe limpo.

**Isso está certo e o D1 fica.** O que segue é o outro lado da conta.

### O que ele cobra em troca

Um diodo puro em antiparalelo faz a corrente da bobina circular em roda-livre por um caminho de resistência quase nula. O campo **demora a colapsar** — e o tempo de desatracamento do relé sobe tipicamente de **2 a 5 vezes**.

```
   sem diodo   →  ~8 ms para desatracar   · pico de centenas de V no KA1
   com diodo   →  ~25 ms                  · pico limitado a ~24,7 V
```

Relé que desatraca devagar tem **contato que se separa devagar**. E contato que se separa devagar **arca por mais tempo**.

> 🔥 **E aqui isso importa mais do que o normal, porque o KM1 interrompe 6 A em CORRENTE CONTÍNUA.** Em CA o arco se apaga sozinho na passagem por zero, 120 vezes por segundo. Em CC não há passagem por zero: o arco só morre quando o entreferro fica grande o bastante. É o mesmo motivo pelo qual o [Doc 30 §30.2](30_forca_e_distribuicao.md) exige o contato do KM1 declarado **em CC**, e não só os "10 A / 250 VAC" do anúncio.

### A saída, se você quiser os dois lados

Trocar o D1 por **1N4007 em série com um zener de 24 a 33 V**, o conjunto em antiparalelo com a bobina:

| | D1 sozinho | **D1 + zener 27 V** |
|---|---|---|
| Pico no contato do KA1 | ~24,7 V ✅ | ~52 V — ainda longíssimo dos 250 V do contato ✅ |
| Desatracamento do KM1 | ~25 ms ⚠️ | ⭐ **~10 ms** |
| Arco no contato de 6 A CC | mais longo | ⭐ **mais curto** |
| Custo | R$ 0,20 | R$ 0,50 |

**Como funciona:** a tensão de grampeamento passa de 0,7 V para ~27,7 V, e a energia armazenada na bobina se dissipa numa tensão 40 vezes maior — ou seja, num tempo 40 vezes menor. O contato do KA1 continua protegido (52 V não abre arco), e o KM1 volta a desatracar depressa.

> 📌 **Vale a pena aqui?** Honestamente: **provavelmente não é obrigatório.** O KM1 abre sob 6 A poucas dezenas de vezes na vida deste projeto, e o contato de 10 A aguenta isso mesmo desatracando devagar. **Mas é uma decisão de projeto que vale ser TOMADA em vez de ignorada**, e explicá-la mostra que você entendeu o que o diodo faz — e não só que "tem de pôr um diodo na bobina".
>
> 🎓 **Se a banca perguntar por que há um diodo ali**, a resposta completa é: *"para proteger o contato do KA1 do pico indutivo — e o preço é um desatracamento mais lento do KM1, que eu aceitei porque ele interrompe 6 A poucas dezenas de vezes; num equipamento que partisse o dia inteiro, eu teria posto um zener em série."*
>
> ⚠️ **Isto vale só para o KM1.** Os módulos do KA1, do KA2 e do KA3 já trazem o roda-livre embutido, e a bobina deles é de 5 V — o pico é pequeno e quem ele ameaçaria é o transistor de dentro do próprio módulo, que já veio protegido de fábrica.


---

## 31.16 ⭐ O KA3 — por que relé e não MOSFET, e a regra que decide

> 🎯 **A pergunta que abriu esta seção foi de projeto, não de defeito:** *"um MOSFET só para ligar e desligar as ventoinhas internas não é exagero? Não dava para usar um relé igual ao da ventoinha do radiador?"*
>
> Dava. E era melhor. Esta seção é a resposta completa — porque **a banca vai perguntar por que o componente X e não o Y**, e "por que sim" não é resposta.

### O que estava lá, e o que ele fazia

| | |
|---|---|
| Peça | **MV-1** — módulo MOSFET 4 canais, LR7843, optoacoplado, **R$ 43,51** |
| Canais que o projeto usava | **1 de 4** (o canal 3) |
| Carga | as **5 ventoinhas internas** — 2 frias, 2 dos dutos e a do PTC — **12 V · 0,63 A · 7,5 W** |
| Comando | `digitalWrite(VENT_INTERNAS, estado == RODANDO ? HIGH : LOW)` |
| Regra | **uma condição só:** ensaio rodando ([Doc 40 §40.10](../camada_4_programacao/40_firmware_arduino.md)) |

⭐ **E o detalhe que fecha o caso: o `D29` não é pino de PWM no Mega.** No ATmega2560 os pinos com PWM por hardware são `D2`–`D13` e `D44`–`D46`. O projeto pagou R$ 43,51 por um dispositivo cuja única vantagem real é **modular**, e ligou o comando dele num pino que **não sabe modular**. O MV-1 estava sendo usado como interruptor.

### A regra que decide — e que vale para o projeto inteiro

> | Use **MOSFET** (ou driver) quando… | Use **contato de relé** quando… |
> |---|---|
> | precisa **modular** a carga (PWM) | é **liga/desliga**, e só |
> | comuta **milhares de vezes por hora** | comuta poucas vezes por dia |
> | não pode fazer ruído nem vibrar | um clique por ensaio não incomoda ninguém |
> | a carga é sinal, ou corrente muito pequena | ⭐ o que se chaveia é o **lado positivo** |
> | | ⭐ o estado seguro precisa existir **com o Arduino morto** |
>
> 🎯 **No painel a regra já estava aplicada, e o MV-1 era a exceção sem motivo:** os **BTS7960 modulam** (Peltier e PTC, a 20 kHz) e **KM1, KA1, KA2 e KA3 apenas abrem e fecham**. A aula de chaveamento estático do projeto continua inteira — ela está na carga que realmente precisa dela.

### As três dúvidas que o MOSFET deixava, respondidas com número

**1 · "Ele trabalha no negativo."** Está certo, e é a maior objeção — não a menor. Canal N só sabe puxar para 0 V, então é **obrigado** a chavear o negativo. Isso já custou **duas correções documentadas** neste projeto ([§31.14](31_comando_e_protecoes.md) e [Doc 32](32_sinais_e_sensores.md)): as ventoinhas do radiador subiam o preto para ~12 V ao desligar, e o tacômetro delas passava a mentir *"parada"* — justamente o alarme que existe para salvar a pastilha.

Nas cinco internas isso **não quebrava nada hoje**, porque elas são de 2 fios e não têm tacômetro. Mas era mina enterrada: **no dia em que uma delas virasse de 3 fios, o mesmo defeito voltava.** Com o KA3 no positivo, o preto das internas é 0 V de verdade — ligadas ou paradas.

**2 · "O MOSFET pode ser usado mais vezes que o relé."** Verdade absoluta, e irrelevante *aqui*:

| | Vida | Ciclos neste uso | Dá para |
|---|---|---|---|
| Contato do módulo de relé | ~100.000 operações | 1 por ensaio · ~10/dia ≈ 3.650/ano | **27 anos** |
| MOSFET | praticamente ilimitado | idem | ∞ |

🎓 **Onde essa vantagem seria decisiva: PWM.** A 20 kHz o MOSFET comuta 20.000 vezes por segundo — um relé gastaria as 100.000 operações **em 5 segundos**. É exatamente por isso que os BTS7960 não são relés, e é a versão curta da regra da tabela acima.

**3 · "A questão da tensão do MOSFET."** É o **V_DS** — a tensão que ele aguenta entre dreno e source **quando está bloqueado**. É o equivalente eletrônico da rigidez do ar entre dois contatos abertos.

| | MOSFET LR7843 (o do MV-1) | Contato do módulo de relé |
|---|---|---|
| Limite | **30 V** | **10 A / 30 Vcc** (e 250 V CA) |
| O projeto usa | 12 V — mas o pico indutivo da ventoinha ao desligar come margem | 12 V · **0,63 A = 6 % da capacidade** |
| Se as ventoinhas virassem 24 V | ⚠️ **não serviria mais** — era condição escrita na lista de materiais | continua servindo |

### Os componentes

| Ref | Peça | Onde | Preço |
|---|---|---|---|
| **KA3** | Módulo relé 1 canal **5 V**, optoacoplado, jumper H/L | **mesma caixa DIN** do KA1 e do KA2, trilho 2 | R$ 3,40 (vem no par de R$ 6,79) |
| **R12** | Resistor **10 kΩ** entre o `IN3` e o 0 V | no borne do módulo | R$ 0,10 |
| **D3** | Diodo **1N4007** sobre as 5 internas, catodo no **+12 V** | dentro da câmara, na emenda | R$ 0,20 |
| 🔄 **Caixa DIN** | passa de **4 módulos (70 mm)** para **6 módulos (105 mm)** | trilho 2 | ~R$ 10 |

> ⚠️ **A caixa TINHA de crescer, e é o único custo mecânico da troca.** Três módulos de 25,5 mm somam **76,5 mm** e não cabem nos 70 mm de uma caixa de 4M. Mesmo assim **o trilho 2 ganhou espaço**, porque o MV-1 media 66 mm:
>
> | Trilho 2 | Antes | **Depois** |
> |---|---:|---:|
> | Componentes | 358 mm | **327 mm** |
> | Livre | 58 mm | ⭐ **89 mm** |

### As quatro regras do §31.13, aplicadas ao KA3

| # | KA1 | KA2 | **KA3** |
|---|---|---|---|
| 1 | jumper em `H` | igual | **igual** — `HIGH` liga, como o MOSFET fazia |
| 2 | contato `COM`+`NO` | 🔥 `COM`+`NC` | **`COM`+`NO`** — como o KA1 |
| 3 | pull-down 10 kΩ no `IN` | igual (R11) | **igual (R12)** |
| 4 | bobina de **5 V** confirmada no corpo | igual | **igual** |

> ### 🎯 Por que o KA3 usa o `NO`, se o KA2 usa o `NC`
>
> Porque **o estado seguro de cada um é diferente, e a diferença é térmica**:
>
> | Se o Arduino morrer | KA2 · radiador | **KA3 · internas** |
> |---|---|---|
> | O que acontece | ventoinhas **giram** | ventoinhas **param** |
> | Por que está certo | dissipador quente **mata a pastilha em menos de 1 min** | ⭐ ventoinha interna parada **não queima nada** |
> | Quem cobre o resto | — | O corte térmico de ST-1 foi proposto, mas ainda não está validado; não tratar como proteção efetiva nem energizar o PTC |
>
> ⚠️ **Limite de diagnóstico:** o alarme de RPM só cobre os dois coolers do radiador. As cinco ventoinhas internas (incluindo a do PTC) são de dois fios, sem tacômetro; a tela pode mostrar o comando do KA3, mas isso não prova rotação nem fluxo de ar. Falha de KA3 ou travamento da ventoinha do PTC pode permanecer sem alarme.
>
> 📌 **E há um ganho de graça:** com o `NO` e o jumper em `H`, `HIGH` continua ligando as ventoinhas — **o firmware não muda uma linha**. Nenhuma inversão nova entra no código, ao contrário do que o `D30` teve de carregar.

### O que a troca custa — o lado honesto

| Custo | Tamanho | Cabe? |
|---|---|---|
| Consumo no BD-5V | +65 mA (bobina + LED). Estimativa total próxima de **0,7 A** | Abaixo dos **5 A propostos** para T2; modelo e capacidade contínua pendentes |
| Clique mecânico | 1 por ensaio | ✅ |
| **Diodo D3 obrigatório** | o MOSFET trazia o roda-livre dentro da placa comprada; contato seco não protege nada sozinho | ✅ já havia 2 reservas de 1N4007 |
| Caixa DIN maior | 70 → 105 mm | ✅ e ainda sobra trilho |

💰 **Saldo:** **−R$ 43,51** no carrinho, uma família de componente a menos no painel, e três acionamentos com a mesma peça, o mesmo jumper e a mesma regra de ensaio.

### 🔎 Comissionamento do KA3 — 2 minutos

- [ ] **`5VDC` escrito no corpo do relé** e **jumper em `H`** — os três módulos iguais
- [ ] Ohmímetro entre `IN3` e 0 V → **~10 kΩ** (é o R12)
- [ ] Fio no **`NO3`**, não no `NC3` ⚠️ é o contato oposto ao do vizinho KA2
- [ ] Teste de diodo no chicote das internas desconectado → **conduz num sentido só** (é o D3)
- [ ] **Painel energizado, Arduino desligado:** as 5 internas **PARADAS** e o LED do KA3 apagado. Se girarem, o fio está no `NC`
- [ ] Com o ensaio rodando: as 5 girando, e o preto delas medindo **0 V contra a barra** — é o ensaio que prova que o problema do lado baixo acabou

> 🎓 **O que dizer na defesa, em uma frase:** *"troquei o módulo MOSFET por um relé porque a única vantagem de um MOSFET aqui seria modular ou comutar milhares de vezes por hora, e esta carga liga uma vez por ensaio — num pino que nem PWM tem. O contato seco ainda me deixou escolher chavear o positivo, que é o que o tacômetro exige, e custou um terço do preço."*


---

## 31.17 ⭐ A identificação dos relés — `KM` e `KA`, e por que não um módulo de 4 canais

### A numeração mudou, e o motivo é honesto

O painel começava no **`KA2`**. Não porque existisse um `KA1`, mas porque ele **existiu e saiu** — era o segundo relé de selo, refeito pelo rearme azul, eliminado em [*Por que UM relé*](#por-que-um-relé--e-o-que-mudou-quando-o-segundo-saiu). Sobrou um buraco na numeração, e buraco em identificação de painel é convite a erro de montagem: quem procura o `KA1` na régua fica achando que falta peça.

| Era | **Virou** | O que faz |
|---|---|---|
| `KA2` | ⭐ **`KM1`** | Chaveia os **6,0 A** dos BTS + carrega o **selo**. Bobina de 24 V, comandada pelas **botoeiras** |
| `KA3` | **`KA1`** | Veto do firmware sobre a potência — contato `NO` |
| `KA4` | **`KA2`** | Ventoinhas do radiador — contato `NC` |
| `KA5` | **`KA3`** | As 5 ventoinhas internas — contato `NO` |

### Por que o primeiro virou `KM` e não `KA`

Porque **ele não é a mesma coisa que os outros três**, e o nome passa a dizer isso sozinho:

| | **KM1** | KA1 · KA2 · KA3 |
|---|---|---|
| Bobina | **24 V**, na malha das botoeiras | 5 V, num pino do Arduino |
| Quem o comanda | ⭐ **o cogumelo, o STOP e o verde** — nenhum fio do Arduino o toca | o firmware, por optoacoplador |
| Contatos | **dois**: `11-14` para a carga e `21-24` para o **selo** | **um** cada |
| O que chaveia | **6,0 A em 24 Vcc** — potência de verdade | 37 mA (bobina) e 0,36 / 0,63 A (ventoinhas) |
| Construção | 8 pinos em **base PTF08A** — troca-se puxando, sem desfazer fio | módulo com borne KRE |
| Preço | R$ 39 o conjunto | R$ 3,40 cada |

> 🎓 **É a divisão clássica de painel industrial:** `KM` para o contator (quem entrega energia à carga), `KA` para o relé auxiliar (quem comanda e sinaliza). O KM1 é um relé de 8 pinos, não um contator — mas exerce **a função de contator**, e num painel de verdade este lugar seria de um contator de 9 A com bloco auxiliar NA, a R$ 60–90.
>
> 🎯 **E responde de graça a pergunta que a banca faz:** *"por que este relé é diferente dos outros três?"* — o prefixo já disse.

### 📌 O que fazer se você tem a versão anterior impressa

Nada é ambíguo: **`KA3`, `KA4` e `KA5` deixaram de existir.** Se um texto, uma etiqueta ou um vídeo antigo citar um deles, subtraia 2 do número — e, se for o `KA2`, é o `KM1`.

---

### 🔧 Atualização de Arquitetura: Adoção da Placa de 8 Relés Optoacoplada (5 V)

Originalmente, o projeto previa módulos de relé individuais de 1 canal. No entanto, para aproveitar os **sinaleiros industriais de 22 mm 24 Vcc fornecidos pelo SENAI** (custo R$ 0,00 na lista de compras) e manter total isolamento elétrico entre a lógica de 5 V dos microcontroladores e a tensão de 24 Vcc do painel, foi adotada uma **placa integrada de 8 relés de 5 V com optoacopladores**.

Essa solução reúne todas as saídas a relé em um único ponto organizado no trilho DIN:

| Canal | Tag | Função | Contato | Pino Arduino | Lógica de Acionamento | Carga Acionada |
|:---:|:---:|---|:---:|:---:|:---:|---|
| **Ch 1** | `KA1` | Veto de firmware da potência | `NO` | `D27` | `LOW` = Autoriza potência<br>`HIGH`/Solto = Corta KM1 | Bobina de KM1 (retorno A2 ao 0 V) |
| **Ch 2** | `KA2` | Intertravamento coolers radiador | `NC` | `D30` | `LOW` = Desliga coolers<br>`HIGH`/Solto = Coolers girando | 2× Coolers 12 Vcc do radiador Peltier |
| **Ch 3** | `KA3` | Ventiladores internos da câmara | `NO` | `D29` | `LOW` = Liga ventiladores<br>`HIGH`/Solto = Ventiladores parados | 5× Mini ventiladores 12 Vcc da câmara |
| **Ch 4** | `H1` | Sinaleiro VERDE (Painel Energizado) | `NO` | `D9` | `LOW` = Aceso<br>`HIGH`/Solto = Apagado | Sinaleiro industrial LED 22 mm 24 Vcc |
| **Ch 5** | `H2` | Sinaleiro AZUL (Ciclo Resfriamento) | `NO` | `D10` | `LOW` = Aceso<br>`HIGH`/Solto = Apagado | Sinaleiro industrial LED 22 mm 24 Vcc |
| **Ch 6** | `H3` | Sinaleiro AMARELO (Ciclo Aquecimento)| `NO` | `D11` | `LOW` = Aceso<br>`HIGH`/Solto = Apagado | Sinaleiro industrial LED 22 mm 24 Vcc |
| **Ch 7** | `H4` | Sinaleiro VERMELHO (Falha / Alarme)  | `NO` | `D12` | `LOW` = Aceso<br>`HIGH`/Solto = Apagado | Sinaleiro industrial LED 22 mm 24 Vcc |
| **Ch 8** | `RES` | Reserva técnica | - | Livre | - | Disponível para expansão futura |

---

### 🛡️ Análise de Segurança e Fail-Safe (Placa Active-LOW)

As placas comerciais de 8 relés com optoacoplador utilizam lógica **Active-LOW** (nível baixo ativo): o anodo do LED interno do optoacoplador é alimentado pelo VCC (+5 V) e o catodo é levado ao pino de entrada `IN`. Quando o pino do Arduino vai para `LOW` (0 V), a corrente flui pelo LED interno, disparando o relé.

Essa característica atende perfeitamente aos requisitos de segurança do projeto:

1. **Com o Arduino desligado, sem alimentação ou durante o boot**:
   - Os pinos do Mega ficam em alta impedância (`INPUT` tri-state).
   - Não há corrente no LED do optoacoplador; portanto, **todos os 8 relés permanecem desenergizados**.
2. **Comportamento em Fail-Safe**:
   - **`KA1` (Veto KM1)**: Utiliza contato normalmente aberto (`NO`). Relé desenergizado = contato aberto. O circuito de selo de KM1 fica fisicamente interrompido. A potência só pode ser atracada se o firmware inicializar com sucesso e colocar conscientemente `digitalWrite(D27, LOW)`. Se o firmware travar, reiniciar ou sofrer trip por watchdog, o pino sobe para `HIGH`/alta impedância e KM1 cai imediatamente.
   - **`KA2` (Radiador Peltier)**: Utiliza contato normalmente fechado (`NC`). Relé desenergizado = contato fechado. Se o microcontrolador queimar ou travar, as ventoinhas do dissipador da Peltier recebem alimentação direta de 12 Vcc, evitando superaquecimento do lado quente.
   - **`KA3` (Ventilação da câmara)**: Contato `NO`. Relé desenergizado = ventiladores internos desligados.
   - **`H1` a `H4` (Sinaleiros 24 V)**: Contatos `NO`. Relés desenergizados = sinaleiros apagados.

---

### 💡 Esquema de Ligação dos Sinaleiros 24 Vcc (Canais 4 a 7)

A alimentação de potência dos sinaleiros é derivada do barramento **`BD-24V`** da fonte industrial, eliminando qualquer drenagem de corrente dos pinos do microcontrolador e garantindo imunidade galvânica total contra ruídos:

```
BARRAMENTO 24 Vcc (BD-24V)
      │
      ├───► COM4 ──[ Jumper ]──► COM5 ──[ Jumper ]──► COM6 ──[ Jumper ]──► COM7
                                                                             │
PLACA 8 RELÉS (Contatos NO):                                                 │
  NO4 ──────────────── Chicote da Porta ───────────────► H1.X1 (Verde)       │
  NO5 ──────────────── Chicote da Porta ───────────────► H2.X1 (Azul)        │
  NO6 ──────────────── Chicote da Porta ───────────────► H3.X1 (Amarelo)     │
  NO7 ──────────────── Chicote da Porta ───────────────► H4.X1 (Vermelho)    │
                                                                             │
RETORNO DOS SINALEIROS NA PORTA:                                             │
  H1.X2 ──[ Jumper Porta ]── H2.X2 ──[ Jumper Porta ]── H3.X2 ──[ Jumper ]── H4.X2
                                                                             │
  H4.X2 ────────────── Chicote da Porta ───────────────► BD-0V (0 Vcc Fonte 24V)
```

- **Economia gerada**: R$ 23,20 economizados nos sinaleiros (fornecidos pelo SENAI) e fiação padronizada em bornes industriais.
- **Isolação**: O terra de potência dos sinaleiros (`BD-0V`) não se mistura com o terra de sinal analógico/sensores do Arduino, evitando loops de terra.
---

📄 **Anterior:** [Doc 30 — Força e Distribuição](30_forca_e_distribuicao.md) · **Próximo:** [Doc 32 — Sinais e Sensores](32_sinais_e_sensores.md)
