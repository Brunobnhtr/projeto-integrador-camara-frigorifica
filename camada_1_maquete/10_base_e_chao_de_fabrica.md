# CAMADA 1 · Doc 10 — Base da Maquete e Chão de Fábrica (V8)

> **Status: a base de 1500 × 500 continua valendo.** Ao contrário do que a revisão
> anterior deste documento dizia, **não é preciso aumentar a base** — é preciso
> **reposicionar** o painel e a câmara. Ver §10.2.
>
> A versão anterior está em
> [`historico/10_base_V4.md`](../historico/10_base_V4.md).

---

## 10.1 A base

**1500 × 500 mm** de chapa, como no projeto original. Nada muda na madeira.

O que muda é o que fica em cima dela: o painel passou de 400 para **600 mm** de largura.

## 10.2 🟢 A conta que resolve — e desfaz um alarme falso

| Item | Largura |
|---|---:|
| Margem à esquerda | 50 mm |
| Painel | 600 mm |
| Folga entre painel e câmara | 60 mm |
| Câmara V8 (500 mm **com os dois dutos externos**; 260 de profundidade) | 500 mm |
| Margem à direita | 290 mm |
| **Total** | **1500 mm** |

Cabe em **1500 mm** com 340 mm de sobra à direita. **A base não precisa crescer**,
mesmo com a câmara de 40 L: os dutos externos somam 80 mm de largura, mas o
painel ficou 50 mm da borda em vez de 690.

O que aconteceu foi outra coisa: a planta da V5 posicionou o painel em X = 690, deixando
690 mm vazios à esquerda. Daí a conclusão de que precisaria de 1950 mm. Era um problema
de **posição**, não de tamanho.

### Layout corrigido (origem no canto inferior esquerdo)

| Elemento | X | Y | Ocupa |
|---|---|---|---|
| Margem | 0–50 | — | — |
| **Painel** | 50–650 | 125–375 | 600 × 250 |
| **Folga de serviço** | 650–710 | — | 60 mm |
| **Câmara** | **710–1210** | **120–380** | **500 × 260** |
| Margem | 1210–1500 | — | 290 mm |

> A câmara de 500 mm **inclui os dois dutos externos** de 40 mm. O corpo tem
> 420 mm (X 750–1170) e cada duto avança 40 mm para fora. Em Y ela ocupa 260 mm,
> centrada: (500 − 260) / 2 = 120.
>
> Sobram 290 mm à direita — espaço para a bandeja de condensado e para a área de
> circulação.

## 10.3 O que NÃO mudou

- Dimensões da chapa: **1500 × 500**.
- Divisão em zonas, rua externa, piso, demarcação de segurança.
- Posição dos postes P1, P2, P3 e da subestação.
- Furação da base para os pés dos painéis.

## 10.4 O que muda na furação

O painel mudou de 400 × 500 para 600 × 800. A pegada no chão continua sendo
**600 × 250** (é a profundidade que apoia, não a altura), mas mudou de lugar:

- **Antes:** X = 690–1090.
- **Agora:** X = **50–650**.

Os quatro furos de fixação do gabinete vão na **base do painel** (PNL-05), em
(30, 25), (540, 25), (30, 210) e (540, 210) — coordenadas locais da peça. Marque-os na
chapa com o gabinete montado, não antes.

> ⚠️ **Não fure a chapa antes de montar o gabinete.** A base do painel é MDF 15 mm e
> pode empenar; furar com o gabinete apoiado garante o alinhamento.

## 10.5 Pendências

| # | Pendência | Efeito |
|---|---|---|
| 1 | ~~Volume final da câmara~~ — **fechado na V8: 39,98 L, 500 × 260 × 400** | resolvido |
| 2 | Peso total do conjunto | conferir se a chapa de 15 mm aguenta sem reforço |
| 3 | Furação dos pés do painel | só depois do gabinete montado |
| 4 | Trajeto dos cabos painel → câmara | 60 mm de folga é pouco para o feixe de 5,2 A |

Detalhe completo em
[`RELATORIO_AUDITORIA_CAD_ATUALIZADO.md`](../RELATORIO_AUDITORIA_CAD_ATUALIZADO.md).
