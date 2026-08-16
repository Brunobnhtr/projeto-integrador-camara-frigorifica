# CAMADA 1 · Doc 14 — Escala e cabeamento: das 2 posições às 50

> ⭐ **Responde a pergunta que a banca vai fazer:** *"com 50 dispositivos, quantos cabos entram no painel?"*
>
> ✅ **Pré-requisito:** [Doc 13](13_posicoes_de_ensaio.md) — por que medir corrente detecta o que nenhuma proteção detecta.

---

## 🟢 A resposta curta

**Não, os 50 cabos não entram no painel.** Eles param antes, numa placa que fica **junto da câmara** — e do painel até ela vão **nove fios**, não cem.

E a placa que faz isso é **a mesma PI-2** que você vai montar com 2 posições. Muda o número de canais ligados e o lugar onde ela é parafusada. **O projeto dela é o mesmo.**

---

## 14.1 Quantos multiplexadores

Cada CD74HC4067 atende **16 canais**.

`50 posições ÷ 16 = 3,1  →  4 multiplexadores`

| | Canais | Usados | Livres |
|---|---:|---:|---:|
| 4 × CD74HC4067 | **64** | 50 | 14 |

📌 **As 14 sobras não são desperdício, são projeto.** A empresa vai querer acrescentar posições, e nesse dia é só ligar fio — sem placa nova, sem pino novo no Arduino, sem mexer no firmware além de aumentar o contador do laço.

---

## 14.2 ⭐ Onde os 100 fios ficam

Cada posição precisa de **dois** fios: o positivo e o retorno individual. São 100 no total, e isso não tem como diminuir — medição individual exige caminho individual.

A pergunta não é *como ter menos fios*. É **onde eles ficam curtos**.

### ❌ O jeito errado

```
   CÂMARA ──────── 100 fios de 3 m ────────► PAINEL
                                              (100 bornes!)
```

Cem fios chegando no painel significa cem bornes, um chicote impossível de rastrear e uma placa que não caberia no trilho.

### ✅ O jeito certo

```
   ┌── CÂMARA ──┐   fios curtos    ┌─────────────┐
   │            │   de 30 cm       │  4 placas   │      9 fios
   │  50 DUTs   ├══════════════════┤  de medição ├──────────────► PAINEL
   │            │   100 fios       │  (16 pos.)  │
   └────────────┘                  └─────────────┘
                                    parafusadas na
                                    parede externa
```

**Os 100 fios existem, mas têm 30 cm e ficam todos na mesma parede.** Ao painel só volta o resultado.

---

## 14.3 Os 9 fios que chegam no painel

| Fio | Quantos | O que leva |
|---|---:|---|
| `SIG` | **4** | a leitura de cada multiplexador — um por placa |
| `S0`–`S3` | **4** | a seleção do canal, **compartilhada** pelas 4 placas |
| `0V` | **1** | a referência comum |
| | **9** | |

Mais dois de alimentação (24 V e 0 V para os DUTs) = **11 condutores**, que cabem num único cabo multivias.

### Por que os S0–S3 são compartilhados

Porque **todos os multiplexadores olham para o mesmo canal ao mesmo tempo**. Quando o Arduino escreve `0011`, as quatro placas selecionam o canal 3 — e as quatro entregam sua leitura, cada uma no seu fio `SIG`.

```cpp
for (uint8_t canal = 0; canal < 16; canal++) {
    selecionarCanal(canal);              // vale para as 4 placas de uma vez
    delayMicroseconds(50);
    corrente[ 0 + canal] = ler(A2);      // placa 1 → posições  1–16
    corrente[16 + canal] = ler(A3);      // placa 2 → posições 17–32
    corrente[32 + canal] = ler(A4);      // placa 3 → posições 33–48
    corrente[48 + canal] = ler(A5);      // placa 4 → posições 49–64
}
```

**64 posições lidas em 16 voltas do laço**, porque as quatro placas trabalham em paralelo. O ciclo completo leva cerca de **13 ms**.

---

## 14.4 Por que 4 placas e não uma de 50

Poderia-se fazer uma placa só com os 4 multiplexadores. Não se faz, por três motivos práticos:

**1. Não caberia.** Cem bornes de parafuso, com passo de 5,08 mm, em duas fileiras, dariam **254 mm de placa**. Em quatro placas de 16 posições, cada uma tem 32 bornes — **81 mm por fileira**, um tamanho normal.

**2. Manutenção.** Com quatro, um defeito derruba 16 posições e não 50. E a troca é desconectar um conector, não cem fios.

**3. Distribuição física.** Os dispositivos ficam espalhados na câmara. Quatro placas se posicionam perto de cada grupo, mantendo os fios curtos — que é a razão de tudo isso.

---

## 14.5 A tabela da escala

| | **Sua entrega** | **A empresa** |
|---|---:|---:|
| Posições | 2 | 50 |
| Multiplexadores | **1** (14 canais livres) | **4** |
| Placas de medição | **1 — a PI-2** | 4, mesmo projeto |
| Onde ela fica | **no painel** | na parede da câmara |
| Fios painel ↔ medição | **4** (2 pos. × 2) | **9** |
| Pinos do Arduino | 5 | **8** |

📌 **Repare na linha dos pinos:** 5 para 2 posições, 8 para 50. Não é engano — os `S0–S3` são compartilhados, então crescer custa **um pino analógico a cada 16 posições**.

---

## 14.6 Quando isto deixa de bastar

A solução acima assume que **o painel fica perto da câmara** — poucos metros. Se um dia isso mudar, o sinal analógico passa a ser o elo fraco.

| Situação | O que fazer |
|---|---|
| Uma câmara, painel ao lado | **o que está aqui** |
| Câmara a mais de 10 m | trocar os `SIG` analógicos por um barramento digital |
| Mais de uma câmara | idem |
| Ambiente com inversores grandes | idem |

### O caminho de crescimento: RS-485

Acrescenta-se um **Arduino Nano e um MAX485** em cada placa de medição. Ela passa a varrer sozinha, comparar com a referência e responder ao painel por **dois fios** em Modbus RTU — em vez de mandar tensão analógica.

| | Analógico direto | RS-485 |
|---|---:|---:|
| Fios ao painel | 9 | **4** |
| Distância | ~10 m | **1200 m** |
| Custo extra | — | ~R$ 33 por placa |

🎓 **E é isso que se responde se perguntarem sobre distância:** *"para uma câmara ao lado do painel, o sinal analógico chega inteiro em nove fios e não há motivo para complicar. Se a instalação crescer para várias câmaras ou distâncias maiores, acrescenta-se um Nano e um transceptor em cada placa e ela passa a falar Modbus — sem trocar nem os shunts, nem os multiplexadores, nem a lógica."*

**A arquitetura não muda. Só quem carrega o número até o painel.**

---

## ✅ Checklist para as 50 posições

- [ ] 4 placas de 16 canais, parafusadas na **parede externa** da câmara — nunca dentro, por causa da condensação a 5 °C
- [ ] Fios dos DUTs atravessando a parede por **conector multivias**, não fios soltos: com 32 por placa, um conector permite desconectar tudo de uma vez
- [ ] `S0`–`S3` em **cadeia** entre as quatro placas
- [ ] Cada `SIG` num par **blindado**, com a malha aterrada **só no lado do painel**
- [ ] Corrente de referência aprendida **por posição**, com a câmara em temperatura ambiente
- [ ] Deixar as 14 posições livres **cabeadas até o borne** — o custo é o borne, e evita reabrir a placa depois
