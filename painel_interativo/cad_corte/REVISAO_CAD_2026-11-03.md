# Auditoria de sincronizacao CAD × painel 2D × maquete 3D — 03/11/2026

**Status: EM RECONCILIACAO. NAO LIBERADO PARA CORTE OU ENERGIZACAO.**

## Objetivo
Evitar que desenhos historicos (V8/V11/V12) sejam interpretados como cotas atuais do projeto interativo. Este relatorio nao substitui medicao das pecas comerciais, desenho de engenharia liberado ou validacao de seguranca.

## Fontes inspecionadas
- `painel_interativo/src/data/painel_completo.js` (caixa e layout atuais)
- `painel_interativo/src/data/camara.js` (circuito de ar, componentes e sensoriamento)
- `painel_interativo/src/data/fiacao.js` (133 ligacoes)
- `painel_interativo/cad_corte/LEIA-ME.md`, `parametros_v11.py`, `V12_SUPORTES_PTC_LAMPADAS_FANS_INTERNAS/`
- `placa_leds/berco_placas.dxf`, `placa_leds/placa_leds.dxf`, `placa_leds/PLACA_LEDS.md`

## Achados e decisoes por identificador

| Item | Fontes divergentes | Tratamento |
| --- | --- | --- |
| **CAM-26** | Guia antigo menciona chapa dobrada 210×180; documentacao atual descreve **DUAS barras chatas 210×20×1,5 mm**, sem dobra e com vao central | O DXF ativo `camara/01_pecas/CAM-26.dxf` foi COPIADO, sem alterar geometria, de `placa_leds/berco_placas.dxf`, que desenha os dois contornos 210×20 e furos. **ATENCAO:** o DXF nao codifica a espessura 1,5 mm; confirmar material antes do corte. |
| **CAM-25** | Bandeja antiga para lampadas W5W | Obsoleta; existe como historico em `camara/01_pecas/CAM-25.dxf`, mas NAO cortar nem comprar pelo CSV antigo |
| **CAM-15** | Suporte antigo de lampadas W5W | Obsoleto; excluir das ordens de corte |
| **CAM-24** | Quatro cantoneiras 90×25×2 com dobra | Mantidas, mas confirmar furo e tolerancia das barras CAM-26 na montagem |
| **Placas PL-1 e PL-2** | `PLACA_LEDS.md`: 95×75 mm; `placa_leds.dxf`: 90×70 mm (contorno de corte) | **BLOQUEIO**: definir dimensao final e padrao de furos das 8 fixacoes M3 antes de fabricar |
| **Painel PNL-01..06** | `lista_corte_painel.csv`: MDF 600×800×250; `painel_completo.js`: 700×700×250 | **BLOQUEIO**: revisar dimensoes, porta, canaletas, trilhos e furação antes de gerar novos PNL |
| **Lista da camara** | `lista_corte_camara.csv` ainda contem geometria de **420 mm de largura, 390 mm de altura**, historica da camara ~40 L | **OBSOLETA: NAO CORTAR.** Regenerar de parametros vigentes apos reconciliacao das pecas |
| **CAM-03** | Versao V12 inclui furos inferiores redondos para ventiladores laterais; gerador V11 de raiz contem recortes antigos | A geometria V12 deve ser ponto de partida, NAO reexecutar `gerar_cad_v11.py` sobre os DXFs vigentes |
| **CAM-05 / ISO-09** | Kit Peltier, dreno e passo das fans sujeitos a medicao | Manter BLANK. Nao transformar marcacoes de referencia em furos definitivos |
| **PC-1/PC-2** | PG13,5 e PG11 descritos no projeto atualizado | Conferir prensa-cabo comprado e montagem antes de furar; registros CAD antigos ainda falam em passagens P1..P4 e W5W |
| **PTC** | Dados atuais do painel e da camara nao sao uniformes quanto a liberacao | Nao atribuir status aprovado para corte/energizacao; confirmar corte CC independente, protecoes termicas, afastamento do acrilico e fabricante |

## Integridade do novo CAM-26.dxf
- Copia textual exata do arquivo de referencia `placa_leds/berco_placas.dxf`.
- Unidades DXF: `$INSUNITS = 4` (milimetros).
- 2 contornos 210×20 mm (8 entidades LINE).
- 12 circulos de furo: 4 × diametro 4,5 mm nas pontas e 8 × diametro 3,2 mm para espacadores M3.
- Cada tira permanece separada (em coordenadas Y 0..20 e 35..55). Nao ha dobra.
- **Pendencia geometrica:** reconciliar 90×70 vs 95×75 mm da PCB e conferir alinhamento, espessura e folgas com CAM-24.

## Lista atual de materiais estruturais confirmados apenas como PROPOSTA
- Corpo da camara: 310×210×260 mm (acrilico estrutural de 5 mm), cavidade bruta 300×200×250 mm.
- Dutos laterais externos: 40×40 mm.
- CAM-26: 2 tiras aluminio de 210×20×1,5 mm; 8 espacadores M3 de 8–10 mm; 2 PCBs com 4 posicoes por placa (dimensoes da PCB pendentes).
- Painel interativo: 700×700×250 mm; **nao corresponde** aos PNL de MDF no CSV existente.

## Proxima revisao de engenharia
1. **Congelar baseline dimensional:** painel 700×700×250 ou alterar o codigo 2D/3D para o painel real; medir caixa e porta.
2. **Aprovar dimensoes das PCBs**, furacao M3 e suporte CAM-26 em prototipo.
3. **Atualizar parametros/gerador CAD**, sem sobrescrever geradores historicos; incluir CAM-26 e remover CAM-15/CAM-25 das listas vigentes.
4. **Gerar nova lista de corte** com rastreabilidade de cada item e validar relacao DXF ↔ codigo de peca ↔ material ↔ espessura ↔ quantidade.
5. **Revalidar 2D/3D/CAD em conjunto:** sem cortes em referencias BLANK; conferir tolerancias, folgas e interferencias.

> Atualizacao documental/geométrica de estudo; nao se trata de aprovacao de fabricacao.
