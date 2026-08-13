# Tutoriais em Vídeo — Projeto Integrador

Sistema de produção dos vídeos-tutorial do projeto. Cada documento da
documentação vira uma aula em vídeo, com **narração em português do Brasil** e
**legenda sincronizada palavra a palavra**.

Feito para alunos do ensino médio: o vídeo mostra o passo, a cota, o motivo e o
erro que costuma acontecer — sem exigir que ninguém leia 300 linhas de markdown
antes de pegar a serra.

---

## Por que Remotion e não IA generativa de vídeo

A skill `ai-video-generation` (Veo, Seedance, HappyHorse) foi instalada e
avaliada. **Ela não serve para este projeto**, e é importante entender o porquê:

| Critério | IA generativa (Veo/Seedance) | Remotion |
|---|---|---|
| Precisão das cotas | ❌ Inventa números e desenhos | ✅ Os 1500 × 500 mm são exatamente 1500 × 500 |
| Consistência entre as 12 aulas | ❌ Cada clipe sai diferente | ✅ Mesmo design system em todas |
| Corrigir um detalhe | ❌ Regerar tudo e torcer | ✅ Muda uma linha e renderiza de novo |
| Custo | ❌ Pago por clipe, requer login | ✅ Gratuito, roda local |
| Texto na tela | ❌ Sai deformado/ilegível | ✅ Texto real, nítido |

Vídeo generativo é ótimo para uma vinheta de abertura ou uma imagem de fundo.
Para tutorial técnico com medidas, é a ferramenta errada.

---

## Como funciona

```
roteiros/<aula>.json          texto da narração, cena por cena
        │
        ▼  python scripts/gerar_narracao.py <aula>
        │  (edge-tts — vozes neurais pt-BR, grátis, sem chave de API)
        │
        ├──► public/audio/<aula>/*.mp3        áudio de cada trecho
        └──► src/narracao/<aula>.gen.json     duração + timing de cada palavra
                     │
                     ▼
              src/Root.tsx  ─ liga cada trecho à sua cena visual
                     │
                     ▼  npx remotion render
                     │
              out/<aula>.mp4
```

**A duração de cada cena é a duração real do áudio.** Ninguém precisa cronometrar
nada: mudou o texto do roteiro, rodou o gerador, o vídeo se reajusta sozinho.

---

## Pré-requisitos

```powershell
# Node (já instalado) e as dependências do projeto
npm install

# Narração — Python 3 + edge-tts
python -m pip install edge-tts certifi

# ffmpeg (para medir a duração exata dos MP3)
winget install Gyan.FFmpeg
```

> ⚠️ **Erro de certificado SSL no edge-tts?** O script já aponta o `SSL_CERT_FILE`
> para o pacote `certifi` automaticamente. Se ainda falhar, rode:
> `$env:SSL_CERT_FILE = python -c "import certifi;print(certifi.where())"`

---

## Uso

```powershell
# 1. Gerar/atualizar a narração de uma aula
python scripts/gerar_narracao.py camada1-doc10

# 2. Ver no navegador, com timeline e edição ao vivo
npx remotion studio

# 3. Renderizar o MP4 final
npx remotion render Camada1-Doc10-Base "out/Camada1-Doc10.mp4" --codec=h264 --crf=20

# Conferir uma cena isolada sem renderizar tudo
npx remotion still Camada1-Doc10-Base out/teste.png --frame=3250 --scale=0.5
```

---

## Estrutura

```
tutoriais_video/
├── roteiros/
│   └── camada1-doc10.json          ← o texto falado (edite aqui)
├── scripts/
│   └── gerar_narracao.py           ← TTS + legendas palavra a palavra
├── public/audio/<aula>/*.mp3       ← gerado
├── src/
│   ├── design.ts                   ← paleta, fontes, dimensões
│   ├── Root.tsx                    ← registra as composições
│   ├── TutorialCamada.tsx          ← monta as cenas na linha do tempo
│   ├── narracao/*.gen.json         ← gerado
│   ├── components/
│   │   ├── Palco.tsx               ← fundo, barra superior, área da cena
│   │   ├── Legenda.tsx             ← legenda karaokê
│   │   ├── Elementos.tsx           ← avisos, cartões, cotas, checklist, Quadro
│   │   └── PlantaMaquete.tsx       ← a planta da maquete, animável
│   └── cenas/
│       └── camada1doc10.tsx        ← as 12 cenas desta aula
└── out/                            ← vídeos e frames renderizados
```

---

## Criar a aula da próxima camada

1. **Copie o roteiro:** `roteiros/camada1-doc11.json`, com um `beat` por cena.
   Escreva os números por extenso ("cento e vinte e sete volts") — o TTS lê melhor.
2. **Gere a narração:** `python scripts/gerar_narracao.py camada1-doc11`
3. **Crie as cenas:** `src/cenas/camada1doc11.tsx`, uma função por `beat.id`.
   Reaproveite `TituloCena`, `Aviso`, `Cartao`, `CotaH/CotaV`, `ItemChecklist` e `Quadro`.
4. **Registre em `Root.tsx`:** novo mapa de cenas + nova `<Composition>`.
5. **Renderize.**

### Vídeos planejados

| # | Aula | Documento | Situação |
|---|---|---|---|
| 1 | Base e Chão de Fábrica | Doc 10 | ✅ pronto |
| 2 | Subestação e Postes | Doc 11 | ⬜ |
| 3 | Câmara Térmica | Doc 12 | ⬜ |
| 4 | Painel de Comando | Doc 20 | ⬜ |
| 5 | Força e Distribuição | Doc 30 | ⬜ |
| 6 | Comando e Proteções | Doc 31 | ⬜ |
| 7 | Sinais e Sensores | Doc 32 | ⬜ |
| 8 | Firmware Arduino | Doc 40 | ⬜ |
| 9 | ESP32, IHM e IoT | Doc 41 | ⬜ |
| 10 | Montagem e Comissionamento | Doc 50 | ⬜ |
| 11 | Arquitetura de Energia | Doc 02 | ⬜ |
| 12 | Visão Geral do Projeto | Doc 01 | ⬜ |

---

## Vozes disponíveis

Trocar no campo `"voz"` do roteiro:

| Voz | Estilo |
|---|---|
| `pt-BR-AntonioNeural` | Masculina, clara — **em uso** |
| `pt-BR-FranciscaNeural` | Feminina, calorosa |
| `pt-BR-ThalitaMultilingualNeural` | Feminina, mais moderna |

O campo `"taxa"` controla a velocidade (`"-6%"` deixa o ritmo mais didático).

---

## Regras de estilo do vídeo

Vindas da skill `remotion-best-practices` e da experiência do primeiro vídeo:

| Regra | Motivo |
|---|---|
| **Nunca usar transições CSS ou `animation`** | Não renderizam. Anime com `useCurrentFrame()` + `interpolate()` |
| **SVG sempre dentro de `<Quadro>`** | `height: 100%` num item flex sem altura definida vira `auto` e o desenho invade a legenda |
| **Nunca chamar hook dentro de `.map()`** | Use o componente `<Aparecer>` |
| **Componentes não vão em `defaultProps`** | O Remotion serializa as defaultProps em JSON; componentes somem e o vídeo sai vazio |
| Título de cena ≥ 64 px, corpo ≥ 26 px, legenda 46 px | Legibilidade em projetor e em celular |
| Uma ideia por cena | A narração dura ~18 s: dá para uma ideia, não três |
| Todo passo crítico ganha um `<Aviso tipo="erro">` | É o que o aluno mais precisa saber |

---

## Melhorias possíveis

| Ideia | Ganho | Esforço |
|---|---|---|
| **Fotos reais da montagem** intercaladas com os desenhos | Enorme — o aluno vê a peça de verdade | Baixo (tirar as fotos e usar `<Img>`) |
| Vinheta de abertura gerada com IA (Veo) | Estético | Baixo, mas é pago |
| Trilha sonora de fundo em volume baixo | Prende mais a atenção | Baixo |
| Efeito sonoro nos avisos e nos checks | Ritmo | Baixo |
| Versão vertical 1080×1920 para celular | Alunos assistem no celular | Médio (relayout das cenas) |
| Legenda em `.srt` exportada à parte | Acessibilidade no YouTube | Baixo (os dados já existem no `.gen.json`) |
| Zoom/pan (efeito Ken Burns) sobre a planta | Dirige o olhar do aluno | Médio |
| Uma pessoa gravando a voz no lugar do TTS | Conexão humana | Médio |
