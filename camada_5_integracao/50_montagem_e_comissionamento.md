# CAMADA 5 · Doc 50 — Montagem Final, Comissionamento e Apresentação

> A última camada: juntar tudo sobre a base, energizar em sequência controlada, ensaiar cada subsistema e preparar a defesa.
>
> ✅ **Pré-requisito:** Camadas 0 a 4 concluídas, **com todos os checklists de aceitação marcados**.

---

## 🟢 Em palavras simples — a hora de juntar tudo, sem quebrar nada

**Comissionar** é uma palavra da indústria que significa: *colocar em funcionamento pela primeira vez, de forma controlada e comprovada.*

Não é "ligar e ver se funciona". É ligar **por partes**, medindo cada uma, com os valores anotados — para que, se algo der errado, você saiba exatamente onde.

### A regra que atravessa toda esta camada

> ⚠️ **Nunca energize tudo de uma vez na primeira vez.**

Se você ligar o sistema completo e ele não funcionar, o defeito pode estar em qualquer um dos 60 cabos, 15 componentes e 3 programas. Ligando por partes, o defeito está **sempre no pedaço que você acabou de acrescentar**.

```
   Ligar tudo de uma vez        Ligar por partes ✅
   ┌───────────────────┐        ┌───┐
   │  não funciona     │        │ ok│
   │                   │        └───┴───┐
   │ onde está o erro? │            │ ok│
   │  (60 candidatos)  │            └───┴───┐
   └───────────────────┘                │ ✗ │ ← está aqui
                                        └───┘
```

### A ordem de montagem, e por que ela é essa

| Ordem | O que | Por que antes do próximo |
|---|---|---|
| 1 | Maquete e painel montados **sem fio** | Furar e ajustar é fácil com tudo vazio |
| 2 | Força: 127 V → 24 V → conversores | Sem energia certa, nada mais faz sentido testar |
| 3 | Comando: relés, botoeiras, emergência | **A parada tem que funcionar antes de a máquina poder ligar** |
| 4 | Sinais e sensores | O controle precisa enxergar antes de agir |
| 5 | Firmware, ainda **sem Peltier** | Provar a lógica sem arriscar o componente caro |
| 6 | Peltier, PTC e câmara fechada | Só agora, com tudo o mais comprovado |

> 🎯 **Repare no item 3.** A emergência é testada **antes** de a máquina poder ligar. Testar o freio depois de dirigir é a ordem errada.

### O que anotar — e por que isso vale nota

Cada ensaio tem uma coluna **"medido"** em branco. Preencha à caneta, com o valor real.

Um relatório que diz *"os 24 V foram medidos em 24,1 V no poste P3, com queda de 0,18 V na linha"* é um relatório de engenharia. Um que diz *"funcionou"* é uma anotação. **A diferença aparece na nota.**

### As 3 demonstrações que mais valem na apresentação

| Demonstração | Por que impressiona |
|---|---|
| **Percorrer a cadeia de energia com o multímetro** | A teoria virando número na frente da banca: 127 V → 24 V → 5,10 V |
| **Socar a emergência com o sistema rodando** | Tudo para na hora e **não religa** ao destravar. É segurança visível |
| **Abrir o jumper de uma posição de ensaio** | O alarme aparece em 2 s dizendo **qual** posição morreu. É a melhoria que o edital pediu, acontecendo ao vivo |

> 💡 **Ensaie as três antes.** Demonstração que falha na hora custa mais caro do que não ter demonstrado.

### Dicionário rápido

| Termo | O que quer dizer |
|---|---|
| **Comissionamento** | Colocar em operação de forma controlada e documentada |
| **Ensaio** | Um teste com procedimento definido e resultado esperado |
| **Energizar** | Ligar a energia num trecho |
| **Setpoint** | A temperatura desejada |
| **Rastreabilidade** | Poder reconstruir depois o que aconteceu, com data e hora |
| **Aceite** | A conferência final que declara a etapa concluída |
| **Regime permanente** | Quando a temperatura estabilizou e parou de variar |
| **Plano de contingência** | O que fazer se algo quebrar no dia da apresentação |

---

## 50.1 Ordem de integração

```
 1. Base 1500 × 500 pintada, com rua, muro e portão             (Camada 1)
 2. Subestação fixada, cabeada e testada — 24,0 V na saída      (Camada 1 + 3)
 3. Postes instalados, linha esticada, 24,0 V medidos no P3     (Camada 1 + 3)
 4. T2 e T3 ajustados na bancada e instalados; P1 com bornes    (Camada 1 + 3)
 5. Painel montado mecanicamente e fixado na base               (Camada 2)
 6. Fiação de força do painel — testes 0 a 5 do Doc 30          (Camada 3)
 7. Fiação de comando e ensaios de segurança do Doc 31          (Camada 3)
 8. Fiação de sinais e ensaios do Doc 32                        (Camada 3)
 9. Firmware gravado e validado EM BANCADA                      (Camada 4)
10. Câmara térmica montada, vedada e testada                    (Camada 1)
11. Atuadores e sensores instalados DENTRO da câmara            ◄── aqui
12. Eletrocalha aérea e chicote painel → câmara                 ◄── aqui
13. Cenografia final (figuras, placas, brita, iluminação)       ◄── aqui
14. Comissionamento completo (§50.4)                            ◄── aqui
15. Ensaio de desempenho e curva de PID (§50.5)                 ◄── aqui
```

> ⚠️ **Não pule a etapa 9.** Gravar e validar o firmware com o Arduino na bancada (alimentado por USB, com LEDs no lugar dos BTS) evita descobrir um erro de lógica **depois** que tudo está fechado dentro do painel.

---

## 50.2 Instalação dos componentes dentro da câmara

| Componente | Posição | Alimentação | Cuidado |
|---|---|---|---|
| **2× Peltier EM SÉRIE + 2 dissipadores + 2 coolers de CPU** | Recortes da tampa superior, com folga entre elas | `24V-FRIO` (BTS #1); os 2 coolers direto na 12V-AUX; **RPM #1 no D3, RPM #2 em PCINT** | Pasta térmica nos **dois** lados de cada pastilha; lado frio para dentro. ⚠️ **Medir a resistência do conjunto: deve ser 2× a de uma pastilha** |
| **PTC de 24 V + fan integrada 60 mm (sopra ↑)** | Sobre a base interna, ao centro | PTC em `24V-QUENTE` (BTS #2); **a fan de 12 V vai no `12V-FANS` (BD-AUX)** | Não encostar no acrílico — use espaçadores. ⚠️ **Fan de 12 V nunca no borne de 24 V** |
| Fan extra 60 mm (sopra ↓) | Ao lado do PTC | `12V-FANS` (BD-AUX, comutada por firmware) | Conferir a seta de fluxo |
| Fan 40 mm (sopra ↓) | Sob as Peltier | `12V-FANS` (BD-AUX) | Conferir a seta |
| Fan extra 40 mm (sopra ↑) | Ao lado das Peltier | `12V-FANS` (BD-AUX) | Conferir a seta |
| **DS18B20** | **Centro geométrico** do espaço útil, suspenso | D2 + pull-up 4,7 kΩ | Não encostar em nenhuma parede — mediria a parede, não o ar |
| **AM2315C** | Ao lado do DS18B20 | I²C em 5 V | — |
| Bandeja de alumínio + dreno com sifão | Fundo | — | Inclinação de 3° para o furo |

### ⚠️ Montagem da Peltier — o erro que queima a pastilha

```
     ┌──────────────────────────────┐
     │   COOLER DE CPU (fan 3 fios) │  ← rejeita ~100 W
     ├──────────────────────────────┤
     │   dissipador (base de cobre) │
     ├──────────────────────────────┤  ← pasta térmica (camada FINA)
     │ ▓▓▓ PELTIER TEC1-12706 ▓▓▓   │  ← lado quente para CIMA (para fora)
     ├──────────────────────────────┤  ← pasta térmica (camada FINA)
     │   placa fria de alumínio     │
     ├──────────────────────────────┤
     │   ░░ isolamento ao redor ░░  │  ← ⚠ vedar a folga em volta da pastilha
     └──────────────────────────────┘
              ▼ ar frio para dentro da câmara
```

| Erro | Consequência |
|---|---|
| Pasta térmica em excesso | Aumenta a resistência térmica — o oposto do pretendido. Camada fina e uniforme |
| Pastilha ao contrário | A câmara **aquece** em vez de esfriar. O lado frio é o que tem a inscrição/fio saindo pelo lado quente — **teste com uma fonte de bancada em 5 V antes de colar** |
| Folga sem vedar ao redor da pastilha | O ar quente do dissipador circula para dentro da câmara pelas laterais da pastilha, anulando o efeito |
| Aperto irregular do dissipador | Trinca a cerâmica. Aperte os 4 parafusos **em cruz, gradualmente** |
| Ligar sem o cooler funcionando | **Queima em menos de 1 minuto** |

---

## 50.3 Eletrocalha e chicote painel → câmara

```
        PAINEL                                        CÂMARA
     ┌──────────┐        eletrocalha aérea         ┌────────────┐
     │          │  ┌───────────────────────────┐   │            │
     │        ▲ │  │ ═══════════════════════   │   │  ▲         │
     │        │ │  │  A: potência (esquerda)   │   │  │         │
     │        │ │  │  B: sinais (direita)      │   │  │         │
     │        └─┼──┴───────────────────────────┴───┼──┘         │
     │          │      180 mm acima do piso        │            │
     └──────────┘                                  └────────────┘
       mãos-francesas a cada 60 mm
```

| Regra | Motivo |
|---|---|
| Grupos A e B em **lados opostos** da calha | Separação entre potência e sinal |
| Prever **15 % de folga** no comprimento | Permite abrir a porta do painel e mover a câmara para manutenção |
| Espiral organizador nos trechos aparentes | Acabamento profissional |
| Anilhas de identificação **nas duas pontas** | Manutenção |
| Fixar a calha nas mãos-francesas com parafuso, não com cola | Vai ser desmontada pelo menos uma vez |

---

## 50.4 Comissionamento — sequência completa

> 🔌 **Regra de ouro: energize por partes, medindo a cada passo.** Já foram feitos os testes das Camadas 3 e 4. Aqui o sistema é validado **como um todo**.

### Ensaio A — Inspeção final a frio

- [ ] Plugue fora da tomada
- [ ] Todos os parafusos de borne reapertados (o cobre acomoda — **reaperto é obrigatório**)
- [ ] Nenhum fio solto, nenhum condutor exposto
- [ ] Canaletas fechadas, tampa da subestação parafusada
- [ ] Fusíveis **F1 (10 A), F2 (2 A) e F3 (2 A)** conferidos — **F4 e F5 não existem mais**
- [ ] Sifão do dreno preenchido com água
- [ ] Porta da câmara vedando (teste da folha de papel)
- [ ] Cartão SD inserido e formatado em FAT32

### Ensaio B — Energização e níveis de tensão

| # | Medição | Valor esperado | Medido |
|---:|---|---|---|
| 1 | Saída da fonte na subestação | 24,0 V ± 0,5 V | ______ |
| 2 | Ramal R1 (vermelho) no fim da linha, poste P3 | ≥ 23,7 V | ______ |
| 3 | Ramal R2 (marrom) no fim da linha, poste P3 | ≥ 23,8 V | ______ |
| 4 | Ramal R3 (cinza) no fim da linha, poste P3 | ≥ 23,8 V | ______ |
| 5 | Saída da derivação (poste P1) — **24 V potência** | **24,0 V ± 0,3 V** | ______ |
| 6 | Saída do T2 (poste P2) — 5 V comando | 5,10 V ± 0,05 V | ______ |
| 7 | Saída do T3 (poste P3) — 12 V auxiliar | 12,0 V ± 0,1 V | ______ |
| 8 | 3,3 V do ESP32 (na DNLCB30) | 3,3 V ± 0,1 V | ______ |

> 📋 **Preencha a coluna "Medido" e leve esta tabela para o relatório.** Comparar valor projetado × medido é o que caracteriza um comissionamento.

### Ensaio C — Comando e segurança (os 10 ensaios do Doc 31)

- [ ] START funciona pelo **botão físico** e pela **IHM**
- [ ] STOP funciona pelo **botão físico** e pela **IHM**
- [ ] Emergência corta em carga → 0 V medidos no bloco BD-POT
- [ ] Ao destravar o cogumelo **e apertar o REARME**, os **24 V** voltam mas **o processo não reinicia sozinho**
- [ ] ⭐ **Com a emergência acionada, o sinaleiro vermelho de FALHA continua aceso** — se apagar, os sinaleiros foram ligados no BD-POT em vez do BD-24V permanente
- [ ] Rearme com novo START (painel ou IHM)
- [ ] **Watchdog testado** e **pull-down dos `R_EN` medido** com o Arduino desligado
- [ ] Fio partido no NF do STOP → sistema desliga
- [ ] Trip por RPM funciona
- [ ] Queda de energia → volta em `AGUARDA_START`
- [ ] PE contínuo (< 1 Ω)
- [ ] Ligação 0 V ↔ PE única

### Ensaio D — Atuadores em baixa potência

- [ ] Duty de ~20 % no BTS #1: a fan do dissipador gira, RPM lida entre 1200 e 2500
- [ ] Lado frio das **duas** Peltier esfriando ao toque em ~30 s — se só uma esfriar, a ligação em série está com mau contato
- [ ] Duty de ~20 % no BTS #2: o PTC aquece
- [ ] **Intertravamento:** forçar modo frio → o PTC fica em 0 V (medir); e vice-versa
- [ ] Intervalo de 30 s entre trocas de modo confirmado com cronômetro

### Ensaio E — Malha fechada

- [ ] Setpoint em 15 °C → o sistema estabiliza
- [ ] Setpoint em 5 °C → acompanhar a curva de descida
- [ ] Setpoint em 35 °C → o sistema troca de modo respeitando os 30 s
- [ ] Erro em regime permanente < 0,5 °C
- [ ] Sem oscilação sustentada
- [ ] Log CSV gravando corretamente
- [ ] Telemetria MQTT chegando ao dashboard

### Ensaio F — Operação contínua (mínimo 3 horas)

- [ ] Setpoint em 5 °C, porta fechada
- [ ] Registrar a temperatura a cada 15 min
- [ ] **Medir a temperatura do corpo do T3 (LM2596)** → < 80 °C
- [ ] **Medir a temperatura dos 2 dissipadores das Peltier** → < 60 °C cada
- [ ] Verificar a caixa da subestação → < 55 °C internos
- [ ] Após 2 h, confirmar o **ciclo de degelo** disparando sozinho
- [ ] Confirmar água acumulada no frasco coletor (o dreno está funcionando)
- [ ] **Nenhuma condensação na face externa da porta** (validação do cálculo do Doc 12)

---

## 50.5 Ensaios de desempenho (para o relatório)

Estes são os ensaios que geram os **gráficos e números** do trabalho.

### Ensaio 1 — Curva de resfriamento (pull-down)

| Procedimento | Registro |
|---|---|
| Partir da temperatura ambiente, setpoint em 5 °C, duty máximo | Temperatura a cada 30 s por 60 min |

**Gráfico:** temperatura × tempo. **Extrair:**
- Tempo até atingir o setpoint
- Temperatura mínima alcançável (deixe rodando até estabilizar em duty 100 %)
- Constante de tempo térmica τ (tempo para percorrer 63 % da variação total)

### Ensaio 2 — Curva de resposta do PID

| Procedimento | Registro |
|---|---|
| Com o sistema estável em 15 °C, mudar o setpoint para 5 °C (degrau) | Temperatura, setpoint e duty a cada 5 s |

**Extrair:** tempo de subida, sobressinal (overshoot) em %, tempo de acomodação, erro em regime.

### Ensaio 3 — Validação da carga térmica calculada

| Procedimento | Registro |
|---|---|
| Com o sistema estável em 5 °C, medir o **duty médio** durante 30 min | Duty médio (%) |

```
Potência elétrica média entregue = duty_médio × 72 W
Capacidade de bombeamento correspondente ≈ 40 % dessa potência (COP típico a ΔT=20 K)

Comparar com a carga térmica CALCULADA no Doc 12: ≈ 9,5 W
```

> 🎯 **Este é o ensaio mais valioso do trabalho:** ele fecha o ciclo entre o **dimensionamento teórico** (Doc 12) e o **resultado medido**. Se o duty médio ficar em torno de 30 %, a carga real está próxima dos 9,5 W calculados — e você demonstrou que o dimensionamento estava correto.

### Ensaio 4 — Rendimento da cadeia de conversão

| Ponto de medição | V | I | P |
|---|---|---|---|
| Entrada AC (127 V) | | | |
| Saída da fonte (24 V) | | | |
| Saída da derivação, no poste P1 (24 V) | | | |

```
η_fonte  = P_24V  / P_AC
η_R1     = 1,00  (não há conversao no ramal de potencia — ver Doc 02 §2.4)
η_global = P_24V / P_AC
```

> 📊 Um diagrama de Sankey mostrando onde a energia se perde (fonte, conversores, cabos, carga) impressiona muito em apresentação de eletrotécnica.

### Ensaio 5 — Queda de tensão na linha

| Ponto | Tensão | Corrente | Queda |
|---|---|---|---|
| Saída da subestação | | | — |
| Poste P1 (ramal R1, derivação direta) | | | |
| Poste P3 (fim da linha) | | | |

Comparar com o **valor calculado no Doc 02 §2.7: 0,17 V (0,71 %)**.

---

## 50.6 Preparação da apresentação

### Roteiro sugerido (12 a 15 minutos)

| Tempo | Tema | O que mostrar |
|---|---|---|
| 0–2 min | **O problema** | Por que controlar temperatura importa (alimentos, fármacos, processos) |
| 2–5 min | **A cadeia de energia** ⭐ | Percorra a maquete: 127 V na entrada → 24 V no poste → **24 V passando direto pelo P1** (com a corrente das Peltier no amperímetro) → **5,10 V e 12,0 V nos displays dos LM2596**. **É o momento mais forte da apresentação** — e agora os valores estão visíveis de longe, sem multímetro |
| 5–7 min | **Proteção e comando** | Diagrama unifilar, tabela de seletividade, o relé de interface KA1. Acione a emergência ao vivo e mostre os 0 V no BD-POT |
| 7–10 min | **Controle** | PID, intertravamento, proteção de RPM. Mostre a curva do ensaio 2 |
| 10–12 min | **IoT** | Dashboard no celular, mude o setpoint remotamente, mostre o STOP remoto |
| 12–15 min | **Resultados** | Tabela projetado × medido, curvas, rendimento |

### As 10 perguntas que a banca provavelmente vai fazer

| # | Pergunta | Onde está a resposta |
|---:|---|---|
| 1 | Por que 24 V e não 12 V? | [Doc 02 §2.1](../camada_0_fundamentos/02_arquitetura_de_energia.md) — metade da corrente, ¼ da perda, padrão industrial |
| 2 | Por que não usou a fonte ATX? | Doc 02 §2.1 — ATX não tem trilho de 24 V nem permite associação em série |
| 3 | Em corrente contínua existe fase? | Doc 02 §2.1 — não; são 3 **ramais** com retorno comum |
| 4 | Por que o retorno é mais grosso que os ramais? | Doc 02 §2.1 — conduz a **soma** das correntes; em CC não há cancelamento vetorial |
| 5 | Converter duas vezes não é menos eficiente? | Doc 02 §2.8 — sim, ~13 % a mais de perda. É escolha consciente: seletividade, tensões múltiplas e demonstração do princípio real de transmissão |
| 6 | Por que curva C e não B no disjuntor? | Doc 02 §2.4 — corrente de inrush da fonte chaveada |
| 7 | Por que a emergência não pode ser só por software? | [Doc 31 §31.1](../camada_3_eletrica/31_comando_e_protecoes.md) — ela precisa funcionar com o Arduino travado, queimado ou desligado |
| 8 | Por que STOP e emergência usam contato NF? | Doc 31 §31.3 — princípio fail-safe: fio partido leva ao estado seguro |
| 9 | Por que dá para ligar pela IHM mas não pelo celular? | [Doc 41 §41.3](../camada_4_programacao/41_esp32_ihm_iot.md) — quem toca a tela está na frente da máquina; pelo MQTT, não |
| 10 | Por que a porta é dupla? | [Doc 12 §12.2](../camada_1_maquete/12_camara_termica.md) — porta simples condensa: face externa a 15,1 °C contra orvalho de 18,2 °C |

### Material de apoio

- [ ] Diagrama unifilar impresso em A3 (ou na bolsa porta-documentos do painel)
- [ ] Diagrama de comando impresso
- [ ] Tabela de projetado × medido
- [ ] Gráficos: curva de pull-down, resposta ao degrau, temperatura de 3 h
- [ ] Planilha de BOM com custos
- [ ] Vídeo curto do ensaio de emergência (caso não dê para repetir ao vivo)
- [ ] **Fusíveis reserva** (6 A, 2 A, 10 A) no bolso — a lei de Murphy é real
- [ ] Multímetro para as demonstrações
- [ ] Roteador portátil ou hotspot para o MQTT

---

## 50.7 Plano de contingência

| Problema no dia | Solução imediata |
|---|---|
| Wi-Fi bloqueado no local | Hotspot do celular + broker local no notebook |
| Fusível queima | Reservas no bolso; identifique **por que** queimou antes de repor |
| Peltier não esfria | Confira os **2** coolers girando, o duty, e **a ligação em série** (resistência = 2× a de uma pastilha); tenha a 3ª Peltier reserva já com pasta |
| Nextion não inicializa | Verifique 5 V e os fios TX/RX (invertidos é o erro clássico) |
| Condensação na porta | Se a porta dupla foi feita, não vai acontecer. Se acontecer, aponte um ventilador pequeno para a face externa |
| Temperatura não estabiliza | Deixe rodando desde o início da banca; o pull-down leva ~30 min |
| Alguém encosta na linha dos postes | Tudo é 24 V SELV — sem risco. **Aproveite para explicar isso**, vira ponto positivo |

---

## 50.8 ✅ Checklist final do projeto

### Documentação
- [ ] Todos os checklists de aceitação das Camadas 0 a 4 marcados
- [ ] Tabela de valores projetados × medidos preenchida
- [ ] 5 ensaios de desempenho executados e graficados
- [ ] Diagrama unifilar e de comando impressos e no painel
- [ ] Planilha de BOM com custos reais

### Segurança
- [ ] 127 V confinado dentro da subestação fechada e etiquetada
- [ ] Toda a parte acessível em **SELV (24 V ou menos)**
- [ ] 10 ensaios de segurança do Doc 31 aprovados e registrados
- [ ] PE contínuo, ligação 0 V ↔ PE única
- [ ] Nenhum condutor exposto com risco

### Funcionamento
- [ ] Cadeia completa 127 V → 24 V → 12/5/3,3 V medida e conferida
- [ ] Malha fechada estabilizando com erro < 0,5 °C
- [ ] Intertravamento, degelo e proteção de RPM validados
- [ ] Log em SD e telemetria MQTT funcionando
- [ ] Ensaio contínuo de 3 h sem falhas nem sobreaquecimento

### Apresentação
- [ ] Maquete limpa, cenografia completa, iluminação funcionando
- [ ] Roteiro ensaiado dentro do tempo
- [ ] Respostas das 10 perguntas prováveis preparadas
- [ ] Material de apoio e peças reserva separados

---

🎓 **Concluídas as 5 camadas, o projeto está pronto.** O diferencial dele não está no Arduino nem na Peltier — está na **cadeia elétrica completa**, do disjuntor de entrada ao ponto de consumo, com dimensionamento calculado, proteção seletiva, comando em hardware e medição comprovando a teoria. É isso que caracteriza um projeto de eletrotécnica.

---

📄 **Anterior:** [Doc 41 — ESP32, IHM e IoT](../camada_4_programacao/41_esp32_ihm_iot.md) · **Índice:** [00_indice_projeto.md](../00_indice_projeto.md)
