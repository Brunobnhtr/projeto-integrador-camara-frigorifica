# CAD V12 — suportes do PTC, cantoneiras, berço das placas e fans internas

## Versão vigente

**V12** é a versão atual. As pastas V9, V10 e V11 saíram de `cad_corte/` e estão em
`../_obsoleto/` — não use nenhuma delas para cortar. O que é vigente:

| Onde | O que |
|---|---|
| `camara/01_pecas/` | CAM-01 a CAM-24, CAM-26 e ISO-01 a ISO-09 — **CAM-03 atualizada** (fans internas), **CAM-23, CAM-24 e CAM-26 novas** |
| `camara/02_chapas/`, `painel/02_chapas/` | chapas separadas por material |
| `camara/03_montagem/` | detalhes de montagem, incluindo `DETALHE_APOIOS_PTC_V12` e `DETALHE_FANS_INTERNAS_V12`. ⚠️ Os **13 pranchas `*_V8.dxf`** saíram daqui em 31/10/2026 e foram para `../../_obsoleto/CAD_V8_MONTAGEM/` — eram da câmara de 40 L |
| `V12_SUPORTES_PTC_LAMPADAS_FANS_INTERNAS/` | pacote da entrega V12: zip, PNGs, `RELATORIO_V12.md`, `STATUS_CORTE_V12.md` |
| `../placa_leds/` | as 2 PCBs de LED (`placa_leds.dxf`) e o **berço das placas** (`berco_placas.dxf`) |

## O que a V12 acrescenta

- **CAM-23** — apoio do PTC.
- **CAM-24** — 4 cantoneiras de 90 × 25 × 2, dobradas 90° em X25. **Continua valendo.**
- **CAM-26** — **berço das duas placas de LED**: chapa de alumínio 5052 de 1,0 mm,
  planificação **210 × 180**, uma dobra a 90° em y = 90, pé de 210 × 90 com janela
  de 150 × 50. Parafusa nas mesmas 4 cantoneiras CAM-24. Gerado por
  `../placa_leds/gera_berco.py` → `../placa_leds/berco_placas.dxf`.
- **CAM-03** — refeita para as fans internas.

## 🔴 Peças RETIRADAS — não cortar

| Código | O que era | Por quê saiu |
|---|---|---|
| **CAM-15** | suporte de lâmpada no teto (V11) | a V12 tirou as lâmpadas do teto; **não reutilizar o código** |
| **CAM-25** | bandeja removível 210 × 90 com as marcas dos 2 soquetes W5W | as lâmpadas W5W saíram do projeto: o DUT são **8 posições de LED**. O berço **CAM-26** ocupa o mesmo lugar, no mesmo Z e nos mesmos 4 furos |

⚠️ Os arquivos `CAM-24_cantoneiras_lampadas.dxf`, `CAM-25_bandeja_lampadas.dxf` e
`DETALHE_BANDEJA_LAMPADAS_V12.dxf` do pacote V12 ficaram como **registro
histórico**. Se forem mandar cortar, mande só a lista da seção "Peças vigentes".

## O que foi arquivado nesta revisão (31/10/2026)

| De | Para | Por quê |
|---|---|---|
| `camara/03_montagem/*_V8.dxf` (13 pranchas) | `../../_obsoleto/CAD_V8_MONTAGEM/` | vistas da câmara de 40 L; a vigente tem 15 L |
| `../../camada_3_eletrica/32_mapa_cabos_sensores_V11.md` | `../../_obsoleto/` | documento V11 na pasta ativa |

⚠️ **`V12_SUPORTES.../validar_integracao_v12.py` NÃO FUNCIONA** e não é por causa dos
checks: ele procura os DXF na pasta errada e lê um `pecas_v12.json` que nunca foi
gerado. O aviso está no cabeçalho do próprio arquivo. Os checks que valem rodam em
`../painel_interativo` (`npm run valida`, `npm run audita`).

## Geometria da câmara (herdada da V11, ainda válida)

- Câmara **310 × 210 × 260 mm** corpo, 15,000 L interno bruto (300×200×250).
- Isolamento interno **EPS 1 mm provisório**, volume antes dos equipamentos 14,633 L;
  fita alumínio não é proteção anti-incêndio.
- 2 dutos externos de 40×40 mm, mais 2 alojamentos inferiores de 56×56 mm com fans 40×40.
- 2 fans FRIAS do kit Peltier 40×40×10 mm lado a lado na parede traseira superior, além
  das 2 fans de duto. Ventoinhas QUENTES externas permanecem fora.
- **A distância entre os dois centros de ventoinha fria (50 mm no desenho) é SOMENTE
  HIPÓTESE**, não valor encontrado para o kit do usuário.
- CAM-05 e ISO-09 são BLANK: apenas contorno externo na camada CORTE.

## Onde passam sensores e fios

A traseira fixa **CAM-04** tem marcas independentes (sem furos de corte): P1 PTC 24 V,
P2 fans 12 V, P4 sensores de baixa tensão. ⚠️ A marca **P3 LÂMPADAS 12 V não vale
mais** — no lugar dela entram os 8 positivos e os 8 retornos das posições de ensaio.
O isolamento ISO-04 tem os mesmos centros gravados. A rede 127/220 V não entra na câmara.

⚠️ **Os prensa-cabos da câmara subiram de bitola:** PC-1 em **PG13,5** e PC-2 em
**PG11** (era PG9). Com as 8 posições de ensaio o feixe do PC-2 vai a 9,5 mm, e um PG9
aperta só até 8 mm. Furos de 20,5 e 18,6 mm — **medir o prensa-cabo real antes de furar**.

No painel **PNL-05** estão gravados G1 rede AC, G2 potência 24 V, G3 posições 12 V,
G4 ventiladores e tach, G5 sensores, G6 reserva. Não cortar PG sem medir prensa-cabos,
espessura do MDF e conectores.

## Arquivos

- `parametros_v11.py` — todos os parâmetros (a V12 não mudou a geometria base).
- `gerar_cad_v11.py`, `cad_lib.py` — geram DXF e prévias PNG 1:1.
- `valida_cad_v11.py`, `validar_integracao_v11.py` — verificações geométricas.

> ⚠️ **O nome dos geradores ainda diz v11, e isso é dívida consciente.** A geometria
> da V12 está em `V12_SUPORTES_PTC_LAMPADAS_FANS_INTERNAS/parametros_v12.py` e
> `gerar_cad_v12.py`; os arquivos da raiz são a base herdada. Renomear agora quebraria
> os imports e os validadores; renomeie na próxima mudança real de geometria.
- `lista_corte_camara.csv`, `lista_corte_painel.csv` — listas de corte vigentes.

## Segurança e pendências

Não cortar kit, prensa-cabos, botões ou PTC sem medidas reais; não aprovar
5–50 °C sem testes térmicos. A calha CAM-17 tem de ser testada com água, conexão e dreno
medidos. A fita de alumínio não torna o EPS incombustível. Painel elétrico 600×800×250 e
fluxo forçado de duas ventoinhas de duto permanecem.

## Referências públicas

Fonte comparável, NÃO o produto escolhido: https://www.dissipatec.com.br/dissipadores-termoeletrico/refrigerador-termoeletrico-dissipador-com-2-peltier-12v-cooler-duplo
Anúncio indicado pelo usuário, dimensões do kit não verificadas: https://pt.aliexpress.com/item/1005010752595372.html
