# Projeto Integrador — Planta Industrial Didática com Câmara Frigorífica

Curso Técnico em Eletrotécnica · maquete funcional de uma **planta industrial completa**: da entrada de energia na subestação, passando pela rede de distribuição em postes, até o painel de comando que controla uma câmara térmica com PID, IHM e supervisão remota.

📖 **Comece por aqui: [`00_indice_projeto.md`](00_indice_projeto.md)** — índice completo, na ordem de construção.

🔩 **Vai montar?** Abra o aplicativo (`cd painel_interativo && npm run dev`) e consulte
**Guia de montagem** e **Componentes soltos**. O guia marca explicitamente os pontos
bloqueados: conversores T2/T3 e o ramal do PTC não estão liberados para compra ou
energização até validar modelos, proteções, corte DC e condutores.

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
| [`desenhos/`](desenhos/) | Desenhos técnicos em SVG (unifilar, painel, poste, câmara…) |
| [`painel_interativo/`](painel_interativo/) | ⭐ **O aplicativo**: os dados do projeto, os desenhos gerados deles, o **guia de montagem** e os validadores |
| [`entrega_senai/`](entrega_senai/) | 🎓 **As entregas do Projeto Integrador**: resumo expandido, canvas, roteiros dos vídeos, banner e a pesquisa formal — comece pela [TRILHA](entrega_senai/00_TRILHA.md) |
| [`referencias/`](referencias/) | Relatórios externos, guardados como fonte |

---

## Arquitetura de energia (resumo)

```
127 V AC ─[Q0]─► PS1: 24 Vcc / 10 A / 240 W
                    ├── BD-POT (24 V, comutado por KM1) ── BTS1 ── 2× Peltier
                    ├── T2 proposto: 24→5,0 V / 5 A ── BD-5V (modelo pendente)
                    └── T3 proposto: 24→12 V / 20 A ── serviços 12 V (modelo pendente)
                                                       └── ramal PTC 12 V/50 W
                                                           corte DC/F3/fiação pendentes
```

⚡ Os **127 V AC existem apenas dentro da casa de comando — fechada e aparafusada**, no pátio da subestação. Tudo que o público toca opera em **24 Vcc ou menos (SELV)**.

| Grandeza | Valor |
|---|---|
| Consumo do simulador | **estimativa do modelo**; rendimento dos conversores não confirmado |
| Refrigeração | 2× TEC1-12706 **em série** · 24 V · 144 W |
| Aquecimento | **Proposta** PTC 12 V · 50 W; sem aprovação para compra ou energização |
| Conversores | T2 5,0 V/5 A e T3 12 V/20 A propostos; modelos e fichas pendentes |
| Controle | Arduino Mega 2560 (PID, PWM 1 Hz) + ESP32 (MQTT) |

> ⛔ A proposta do PTC exige um ramal de 12 V separado das ventoinhas e um
> dispositivo de corte DC independente. KM1 corta BD-POT/24 V e **não** desliga
> esse novo ramal. Não comprar nem energizar até definir corte, F3, condutores e
> proteções e validar as fichas dos conversores.

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
| Abrir o aplicativo (desenhos, guia de montagem, simulador) | `cd painel_interativo && npm install && npm run dev` |
| Conferir o projeto inteiro antes de publicar | `cd painel_interativo && npm run valida` |

> `node_modules/` e a pasta `dist/` **não estão no repositório** (são regeneráveis). O `npm install` recria tudo.

---

## Extensões úteis do VS Code

| Extensão | Para quê |
|---|---|
| **Markdown Preview Enhanced** | Visualizar os documentos com as tabelas formatadas |
| **Markdown All in One** | Atalhos e índice automático |
| **SVG Preview** | Ver os desenhos técnicos sem sair do editor |
| **Draw.io Integration** | Editar diagramas, se quiser criar novos |
