# Roteiro do Vídeo do Protótipo — 1 min 25 s

> ⚠️ **São DOIS vídeos, não um.** O caderno de Pitch é explícito: além do pitch, *"grave um
> vídeo específico sobre o funcionamento do protótipo"*, com **até 1 min 30 s**, **narração** e
> **legendas**. É onde entra o detalhe técnico que não coube no pitch.
>
> 🎯 *"Aproveite para mostrar o que não deu tempo de aparecer no Pitch."*

---

## Antes de gravar

- [ ] Painel **energizado e funcionando** — este vídeo é sobre a coisa acontecendo
- [ ] Bancada limpa, iluminação boa, celular na horizontal
- [ ] Ter em mãos: multímetro, o dispositivo de ensaio e a chave do porta-fusível
- [ ] Narração gravada depois (fica mais limpa que falar durante a filmagem)

---

## Roteiro

### 🎬 1 · O conjunto · 0:00 – 0:12

**Imagem:** plano geral da maquete — subestação, postes, painel e câmara.

> "Esta é a planta completa em escala reduzida: a energia entra pela subestação, atravessa a
> rede de postes e chega ao painel de comando, que controla a câmara térmica."

---

### 🎬 2 · Por dentro do painel · 0:12 – 0:32

**Imagem:** painel aberto. Percorrer devagar: trilho 1 (distribuição), trilho 2 (potência), trilho 3 (controle).

> "Por dentro, três trilhos. Embaixo, a distribuição: vinte e quatro volts, doze e cinco. No
> meio, a potência: os dois drivers das cargas térmicas e os relés de comando. Em cima, o
> controle: o Arduino Mega, os sensores e o ESP32.
>
> Toda a fiação foi conferida por um validador automático: cento e cinco fios, cada um com
> origem e destino confirmados."

---

### 🎬 3 · O ensaio rodando · 0:32 – 0:52

**Imagem:** IHM mostrando a temperatura; depois a câmara por dentro com as ventoinhas girando; depois o celular com a telemetria.

> "Com o ensaio iniciado, o controle PID leva a câmara ao ponto pedido e mantém a temperatura
> dentro da banda. As ventoinhas internas circulam o ar para não estratificar. E o mesmo dado
> que aparece na tela do painel chega ao celular pela rede."

---

### 🎬 4 · ⭐ A detecção de falha · 0:52 – 1:10

**Imagem:** close no porta-fusível com interruptor. Desligar a chave. Cortar para o alarme aparecendo.

> "Esta é a parte principal. Cada posição de ensaio tem um sensor de corrente. Vou simular uma
> falha desligando a chave desta posição — como se o dispositivo tivesse morrido.
>
> Menos de um segundo: o sistema acusa qual posição parou, e registra a hora."

⏱️ *Esta é a cena mais importante do vídeo. Grave quantas vezes precisar.*

---

### 🎬 5 · A emergência em hardware · 1:10 – 1:25

**Imagem:** soco no cogumelo. Mostrar o painel apagando e o LED de potência caindo.

> "E a segurança não depende do programa: quando o cogumelo é acionado, quem corta é o relé de
> selo. Destravar não religa nada — só o botão verde religa, e isso é o que a norma pede."

---

## ⏱️ Fechamento

| Cena | Duração |
|---|---|
| 1 · Conjunto | 12 s |
| 2 · Painel por dentro | 20 s |
| 3 · Ensaio rodando | 20 s |
| 4 · Detecção de falha | 18 s |
| 5 · Emergência | 15 s |
| **TOTAL** | **1 min 25 s** ✅ dentro de 1 min 30 |

---

## Depois de gravar

- [ ] Narração + **legendas** (obrigatórias)
- [ ] Publicar no YouTube como **não listado**
- [ ] Colar o link no **ANEXO 1**, junto com o do pitch
- [ ] 💡 Gerar o **QR code** dos dois vídeos — o caderno sugere, e facilita a vida da banca
