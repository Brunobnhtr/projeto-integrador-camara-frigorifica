# Painel Interativo — Projeto Integrador CF-01

Visualização navegável do painel de comando: componentes, terminais e **para onde cada fio vai**.

## Rodar

```bash
cd painel_interativo
npm install
npm run dev
```

Abre em `http://localhost:5173`.

## Como usar

| Ação | O que acontece |
|---|---|
| **Clicar num componente** | Abre o painel lateral com todos os terminais dele |
| **Clicar num destino** no painel lateral | Navega até o componente do outro lado do fio, com zoom |
| **Clicar numa tensão** no topo | Filtra e mostra só os cabos daquele barramento |
| **Clicar na placa PI-1** | Mostra também os 7 componentes soldados dentro dela |

Com um componente selecionado, os cabos ligados a ele ficam **destacados** e os
outros esmaecem — e cada cabo mostra `terminal de origem → terminal de destino`.

## Onde ficam os dados

**`src/data/painel.js`** é a fonte da verdade da tela. Três conceitos:

| Conceito | O que é |
|---|---|
| `COMPONENTES` | Equipamentos, com terminais nomeados e em qual trilho ficam |
| `CABOS` | Cada fio: de qual terminal sai, para qual vai, bitola, cor e número |
| `PI1_INTERNO` | O que há soldado dentro da placa de interface |

Os dados vêm do [Doc 30](../camada_3_eletrica/30_forca_e_distribuicao.md) (lista de cabos),
[Doc 31](../camada_3_eletrica/31_comando_e_protecoes.md) (comando) e
[Doc 33](../camada_3_eletrica/33_placa_interface_componentes.md) (placa PI-1).

> ⚠️ **Mudou a fiação nos documentos? Mude aqui também.** Este arquivo não é gerado
> automaticamente a partir deles — ainda.

## Stack

React 19 · Vite · [React Flow](https://reactflow.dev) (`@xyflow/react`)
