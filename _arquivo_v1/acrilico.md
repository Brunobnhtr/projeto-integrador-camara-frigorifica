# ETAPA 3 — Estrutura Física: Câmara Térmica e Acrílico

> Terceira etapa: construir a **câmara térmica** — a parte que efetivamente esquenta/esfria. Inclui dimensões, lista de peças de acrílico para a gráfica (corte a laser), isolamento, dutos de circulação de ar, dreno de condensado e instruções de colagem.
>
> Esta etapa é **independente da parte elétrica** — pode ser fabricada em paralelo com o painel ([ETAPA 4](painel_interno.md)). A integração elétrica acontece nas ETAPAS 5 e 6.

---

## 3.1 Dimensões Gerais da Câmara

| Medida | Valor |
|---|---|
| Largura interna | 200 mm (20 cm) |
| Profundidade interna | 100 mm (10 cm) |
| Altura interna | 250 mm (25 cm) |
| Espessura parede (acrílico) | 5 mm |
| Espessura porta frontal (acrílico) | 10 mm |
| Espessura dutos (acrílico) | 3 mm |
| Espessura isolamento XPS | 20 mm |
| Altura do plenum (retorno de ar) | 30 mm (3 cm) |
| Seção do duto externo | 30 × 30 mm (3 × 3 cm) |
| Altura da abertura do duto | 210 mm (2 cm de margem em cima e embaixo) |

---

## 3.2 Anatomia da Câmara (zonas internas)

A **base interna** (plataforma do PTC) divide a câmara em duas zonas:

```
┌───────────────────────────┐ ← tampa topo (Peltier instalada aqui)
│                           │
│      ESPAÇO ÚTIL          │  ← onde fica o objeto (≈ 22 cm)
│      (220 mm)            │
│                           │
├───────────────────────────┤ ← base interna 19×9 cm (apoiada em 4 cubinhos)
│   PLENUM DE RETORNO 3cm   │  ← ar circula por baixo do PTC
└───────────────────────────┘ ← base externa (chão da câmara)
```

- **Abaixo da base interna:** plenum de retorno (3 cm) — o ar circula por baixo.
- **Acima da base interna:** espaço útil (~22 cm) — onde fica o objeto a ser climatizado.

---

## 3.3 Circulação de Ar (dutos)

```
MODO FRIO (BTS #1 ativo — Peltier):
  Peltier + fan ↓  → ar frio desce no centro
  → entra no plenum por baixo do PTC
  → sobe pelos dutos externos laterais
  → retorna pela abertura no topo, para a Peltier

MODO QUENTE (BTS #2 ativo — PTC):
  PTC + fan ↑  → ar quente sobe no centro
  → entra nos dutos pelo topo
  → desce pelos dutos externos laterais
  → retorna pelo plenum, para o PTC
```

**Vista de cima — posição dos dutos:**

```
[duto 3×3cm] │ parede 5mm │ espaço útil 20cm │ parede 5mm │ [duto 3×3cm]
             ↑                                            ↑
        colado por fora                            colado por fora
```

Cada duto tem **21 cm de altura**, alinhado com a abertura de 9×21 cm feita na parede lateral. Os 2 cm de margem (topo e base) ficam em parede sólida sem duto.

---

## 3.4 Lista de Peças de Acrílico para a Gráfica

> Levar esta lista para a gráfica. Solicitar **corte a laser** e **meia‑esquadria (chanfro) 45°** nas bordas indicadas. As bordas marcadas **90° reto** são coladas de topo (não chanfradas).

### 3.4.1 Acrílico transparente 5 mm — estrutura da câmara

| Peça | Dimensão | Qtd | Bordas 45° | Bordas 90° reto | Recorte interno |
|---|---|---:|---|---|---|
| Parede lateral ESQ | 11 × 25 cm | 1 | Traseira + Topo + Base | Frontal (porta encosta) | 9 × 21 cm (duto) |
| Parede lateral DIR | 11 × 25 cm | 1 | Traseira + Topo + Base | Frontal (porta encosta) | 9 × 21 cm (duto) |
| Parede traseira | 21 × 25 cm | 1 | Esq + Dir + Topo + Base | — | — |
| Tampa topo | 21 × 11 cm | 1 | Todas as 4 | — | Peltier + prensa‑cabo |
| Base externa (chão) | 21 × 11 cm | 1 | Todas as 4 | — | — |
| Base interna (PTC) | 19 × 9 cm | 1 | — | Todas as 4 (encaixa nos cubinhos) | — |

**Total 5 mm: 6 peças.**

### 3.4.2 Acrílico transparente 10 mm — porta frontal

| Peça | Dimensão | Qtd | Bordas |
|---|---|---:|---|
| Porta frontal | 21 × 25 cm | 1 | Todas as 4 a 90° (peça solta) |

**Total 10 mm: 1 peça.**

### 3.4.3 Acrílico transparente 3 mm — dutos externos (×2)

| Peça | Dimensão | Qtd | Bordas 45° | Bordas 90° reto |
|---|---|---:|---|---|
| Frente duto ESQ | 3 × 21 cm | 1 | Esq + Dir + Topo + Base | — |
| Frente duto DIR | 3 × 21 cm | 1 | Esq + Dir + Topo + Base | — |
| Lateral duto ESQ | 3 × 21 cm | 2 | Frontal + Topo + Base | Traseira (cola na câmara) |
| Lateral duto DIR | 3 × 21 cm | 2 | Frontal + Topo + Base | Traseira (cola na câmara) |
| Tampa topo duto ESQ | 3 × 3 cm | 1 | Frontal + Esq + Dir | Traseira (cola na câmara) |
| Tampa topo duto DIR | 3 × 3 cm | 1 | Frontal + Esq + Dir | Traseira (cola na câmara) |
| Tampa base duto ESQ | 3 × 3 cm | 1 | Frontal + Esq + Dir | Traseira (cola na câmara) |
| Tampa base duto DIR | 3 × 3 cm | 1 | Frontal + Esq + Dir | Traseira (cola na câmara) |

**Total 3 mm transparente: 10 peças.**

### 3.4.4 Acrílico preto/cinza 3 mm — cobertura externa do XPS

| Peça | Dimensão | Qtd | Bordas |
|---|---|---:|---|
| Cobertura traseira | 21 × 25 cm | 1 | Todas 90° (cola no XPS) |
| Cobertura lateral ESQ | 17 × 25 cm | 1 | Todas 90° (cola no XPS) |
| Cobertura lateral DIR | 17 × 25 cm | 1 | Todas 90° (cola no XPS) |
| Cobertura topo | 27 × 17 cm | 1 | Todas 90° (cola no XPS) |
| Cobertura base | 27 × 17 cm | 1 | Todas 90° (cola no XPS) |

**Total 3 mm preto: 5 peças.**

### 3.4.5 Resumo para a gráfica

| Espessura | Cor | Peças | Observação |
|---|---|---:|---|
| 5 mm | Transparente | 6 | Meia‑esquadria 45° conforme tabela |
| 10 mm | Transparente | 1 | Todas as bordas 90° |
| 3 mm | Transparente | 10 | Meia‑esquadria 45° conforme tabela |
| 3 mm | Preto/cinza | 5 | Todas as bordas 90° |
| **Total** | | **22 peças** | |

> Recorte da parede lateral: abertura **9 × 21 cm** para o duto (2 cm de margem topo/base).
> Recorte da tampa topo: tamanho da **Peltier + prensa‑cabo** para passagem dos fios.
> Cubinhos de apoio **2×2×3 cm** (×4): cortados da sobra do material, todos a 90°.

---

## 3.5 Isolamento Térmico (XPS) e Cobertura

| Face | Estrutura interna | Isolamento | Cobertura externa |
|---|---|---|---|
| Paredes laterais | Acrílico 5 mm | XPS 20 mm por fora | Acrílico preto 3 mm |
| Parede traseira | Acrílico 5 mm | XPS 20 mm por fora | Acrílico preto 3 mm |
| Tampa topo | Acrílico 5 mm | XPS 20 mm por fora | Acrílico preto 3 mm |
| Base externa | Acrílico 5 mm | XPS 20 mm por fora | Acrílico preto 3 mm |
| **Porta frontal** | **Acrílico 10 mm** | **Sem XPS** | **Transparente** (para ver dentro) |

> A porta fica **transparente e sem isolamento** propositalmente: é a "janela" da maquete. As demais faces são isoladas com XPS e cobertas com acrílico preto para acabamento.

---

## 3.6 Dreno de Condensação (obrigatório)

No modo frio a umidade condensa. Sem dreno, a água acumula sobre a eletrônica em ~1 h.

- **Bandeja de alumínio** no fundo interno, levemente inclinada para um canto.
- **Furo** no ponto mais baixo da bandeja + **prensa‑cabo/passagem** na base externa.
- **Tubo de silicone** conduz a água para **fora do painel**, em um recipiente coletor.
- **Sílica gel indicadora** (2 sachês) reduz a umidade residual; troque quando saturar (muda de cor).

```
[bandeja alumínio inclinada] → furo no ponto baixo → tubo silicone → fora do painel
```

---

## 3.7 Montagem e Colagem (passo a passo)

> **Cola:** S‑320 Sinteglas (cola de capilaridade para acrílico). **Vedação:** silicone neutro transparente.

1. **Limpar** todas as peças (álcool isopropílico) e remover o filme protetor só das faces que serão coladas.
2. **Base interna:** colar os **4 cubinhos 2×2×3 cm** nos cantos internos do chão (S‑320). Apoiar a base interna 19×9 cm sobre eles — define o plenum de 3 cm.
3. **Estrutura principal:** colar parede traseira + 2 laterais + base externa formando a "caixa" aberta na frente e no topo. Usar esquadro; as bordas 45° encaixam em meia‑esquadria.
4. **Tampa topo:** fazer o recorte da Peltier (se a gráfica não fez) e colar. Instalar **prensa‑cabo** para os fios da Peltier/fan.
5. **Dutos externos:** montar cada duto com suas 5 peças (todas as emendas a 45°; borda traseira 90° cola na parede). Colar os 2 dutos por fora das paredes laterais, alinhados com a abertura 9×21 cm.
6. **Vedação:** passar **silicone neutro** em todas as juntas internas (por cima e por baixo das bordas) para estanqueidade.
7. **Isolamento:** colar **XPS 20 mm** nas faces externas (exceto porta) e, por cima, as **coberturas de acrílico preto 3 mm**.
8. **Porta frontal:** fixar a **dobradiça piano** (cortada para 25 cm) na lateral; aplicar **perfil EPDM 5 mm** autoadesivo na borda para vedação; instalar **2 fechos de pressão** inox.
9. **Dreno:** instalar bandeja de alumínio + furo + tubo de silicone (ver 3.6).
10. **Cura:** deixar a cola/silicone curar 24 h antes de energizar.

---

## 3.8 Checklist da ETAPA 3

- [ ] 22 peças de acrílico recebidas da gráfica e conferidas (dimensões e chanfros)
- [ ] Base interna apoiada nos 4 cubinhos (plenum 3 cm confirmado)
- [ ] Estrutura principal colada e esquadrejada
- [ ] Tampa topo com recorte da Peltier + prensa‑cabo
- [ ] 2 dutos externos colados e alinhados com a abertura
- [ ] Vedação com silicone em todas as juntas
- [ ] XPS + cobertura preta aplicados (exceto porta)
- [ ] Porta com dobradiça, EPDM e fechos
- [ ] Bandeja de alumínio + dreno instalados
- [ ] 24 h de cura antes de seguir para integração elétrica

> Próxima etapa: [ETAPA 4 — Painel de Comando](painel_interno.md). A instalação dos atuadores (Peltier, PTC, fans, sensores DS18B20/AM2315C) dentro da câmara é feita na fase de cabeamento — ver [ETAPA 6](cabos_comandos.md) e [ETAPA 8](montagem_comissionamento.md).
