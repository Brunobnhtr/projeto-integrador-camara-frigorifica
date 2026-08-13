# Projeto Integrador — Planta Industrial Didática com Câmara Frigorífica

Curso Técnico em Eletrotécnica · maquete funcional de uma **planta industrial completa**: da entrada de energia na subestação, passando pela rede de distribuição em postes, até o painel de comando que controla uma câmara térmica com PID, IHM e supervisão remota.

📖 **Comece por aqui: [`00_indice_projeto.md`](00_indice_projeto.md)** — índice completo, na ordem de construção.

---

## Estrutura

| Pasta | Conteúdo |
|---|---|
| [`camada_0_fundamentos/`](camada_0_fundamentos/) | Visão geral · **Arquitetura de energia** · Lista de materiais |
| [`camada_1_maquete/`](camada_1_maquete/) | Base e chão de fábrica · Subestação e postes · Câmara térmica |
| [`camada_2_painel/`](camada_2_painel/) | Dimensionamento e layout do painel de comando |
| [`camada_3_eletrica/`](camada_3_eletrica/) | Força e distribuição · Comando e proteções · Sinais · Placa de interface |
| [`camada_4_programacao/`](camada_4_programacao/) | Firmware Arduino · ESP32/IHM/IoT · Simulação |
| [`camada_5_integracao/`](camada_5_integracao/) | Montagem final e comissionamento |
| [`desenhos/`](desenhos/) | 7 desenhos técnicos em SVG (unifilar, painel, poste, câmara…) |
| [`simulacao/`](simulacao/) | Simulador Python + projeto Wokwi |
| [`tutoriais_video/`](tutoriais_video/) | Aulas em vídeo geradas com Remotion |

---

## Arquitetura de energia (resumo)

```
127 V AC ─[Disj. 2P 6A]─[Chave 0-1]─► FONTE 24 Vcc 240 W    (SUBESTAÇÃO)
                    ┌───────────────────┼───────────────────┐
                 [F1 10A]            [F2 2A]             [F3 2A]
                    ▼                   ▼                   ▼
              P1 · DERIVAÇÃO       T2 · LM2596 📟      T3 · LM2596 📟
              24 V PASSANTE        24 V → 5,10 V       24 V → 12,0 V
                    │                   │                   │
        BTS #1 → 2× Peltier série  Arduino/Nextion     fans · coolers
        BTS #2 → PTC 24 V          SD/RTC/PI-1         LEDs · ESP32
```

⚡ Os **127 V AC existem apenas dentro da caixa fechada da subestação**. Tudo que o público toca opera em **24 Vcc ou menos (SELV)**.

| Grandeza | Valor |
|---|---|
| Consumo calculado | ≈ 166 W · 6,9 A @ 24 V |
| Refrigeração | 2× TEC1-12706 **em série** · 24 V · 144 W |
| Aquecimento | PTC cerâmico 24 V · 60 W |
| Controle | Arduino Mega 2560 (PID, PWM 1 Hz) + ESP32 (MQTT) |

---

## Trabalhando em outro computador

### Só ler / editar a documentação (não precisa instalar nada)

Abra o repositório no GitHub e tecle **`.`** (ponto) — abre o **github.dev**, um VS Code completo no navegador. Funciona em PC com restrição de instalação.

### Ambiente completo

```bash
git clone https://github.com/Brunobnhtr/projeto-integrador-camara-frigorifica.git
cd projeto-integrador-camara-frigorifica
```

Ao terminar de trabalhar:

```bash
git add -A
git commit -m "descrição do que mudou"
git push
```

E no outro computador, antes de começar:

```bash
git pull
```

### Dependências (só se for mexer nessas partes)

| Para | Comando |
|---|---|
| Gerar a planilha de compras | `pip install openpyxl` → `python gerar_planilha_bom.py` |
| Rodar o simulador térmico | `python simulacao/simulador.py` |
| Editar os vídeos | `cd tutoriais_video && npm install && npm run dev` |

> `node_modules/` e as saídas de render **não estão no repositório** (são regeneráveis e somam 665 MB). O `npm install` recria tudo.

---

## Extensões úteis do VS Code

| Extensão | Para quê |
|---|---|
| **Markdown Preview Enhanced** | Visualizar os documentos com as tabelas formatadas |
| **Markdown All in One** | Atalhos e índice automático |
| **SVG Preview** | Ver os desenhos técnicos sem sair do editor |
| **Draw.io Integration** | Editar diagramas, se quiser criar novos |
