# CAD V11 — Peltier duplo e quatro rotas de cabeamento

## Versão e geometria

- Câmara **310 × 210 × 260 mm** corpo, 15,000 L interno bruto (300×200×250).
- Isolamento interno **EPS 1 mm provisório**, volume antes dos equipamentos 14,633 L; fita aluminio não é proteção anti-incêndio.
- 2 dutos externos de 40×40 mm, mais 2 alojamentos inferiores de 56×56 mm com fans 40×40.
- 2 fans FRIAS do kit Peltier 40×40×10 mm lado a lado na parede traseira superior, além das 2 fans de duto. Ventoinhas QUENTES externas permanecem fora.
- **A distância entre os dois centros de ventoinha fria (50 mm no desenho) é SOMENTE HIPÓTESE, não valor encontrado para o kit do usuário.** O conjunto comparável DISSIPATEC informa duas fans de 40 mm, dissipadores frios 40×25×70, dissipador externo 104×25×200 (pode ser montagem diferente).
- CAM-05 e ISO-09 são BLANK: apenas contorno externo na camada CORTE. Furos do kit, tubulação, suportes e fixação estão em GRAVACAO.

## Onde passam sensores e fios

A traseira fixa **CAM-04** possui quatro marcas independentes (sem furos de corte): P1 PTC 24V (35,96), P2 fans 12V (35,28), P3 duas lâmpadas 12V (265,28), P4 sensores baixa tensão (265,96). O isolamento correspondente ISO-04 tem os mesmos centros gravados. A rede 127/220V não entra na câmara.

No painel **PNL-05**, estão gravados G1 rede AC se aplicável, G2 potência 24V, G3 W5W 12V, G4 ventiladores e tach, G5 sensores, G6 reserva. Não cortar PG sem medir prensa-cabos, espessura MDF e conectores. PNL-01 inclui referência visual do espaço dos componentes nos quatro trilhos. PNL-06 inclui botões e display apenas como referências.

Sensores: S1 ar central X150,Y65,Z115; S2 retorno X278,Y135,Z210; S3 limite térmico zona PTC X150,Y125,Z150; sensor quente externo. Sensor AM2315C / DS18B20 e chicote exatos dependem de identificação do hardware, pois há inconsistências em versões antigas do Doc32. O termostato de proteção independente não é substituído por software.

## Arquivos

- `parametros_v11.py` todos os parâmetros, inclusive distância referencial das fans e centros de cabos.
- `gerar_cad_v11.py`, `cad_lib.py` geram DXF e prévias PNG 1:1.
- `valida_cad_v11.py` e `validar_integracao_v11.py` verificações geométricas e de integração.
- `camara/01_pecas/` CAM-01..CAM-22, ISO-01..ISO-09.
- `camara/02_chapas/`, `painel/02_chapas/`: chapas por material.
- `camara/03_montagem/DETALHE_FANS_FRIAS_V11.dxf`, `DETALHE_ENTRADAS_CABOS_V11.dxf`, `LAYOUT_PAINEL_DETALHADO_V11.dxf`.
- `previas/*V11.png` e `LISTA_CABOS_E_PASSAGENS_V11.csv`.
- `12_camara_termica_V11.md`, `20_painel_projeto_e_layout_V11.md`, `32_mapa_cabos_sensores_V11.md`, `STATUS_CORTE_V11.md`.

## Segurança e pendências

Não cortar kit, prensa-cabos, botões, soquetes ou PTC sem medidas reais; não aprovar 5–50°C sem testes térmicos. A calha CAM-17 tem de ser testada com água, conexão e dreno da parede medidos. A fita de alumínio não torna o EPS incombustível. Panel elétrica 600×800×250 e fluxo forçado de duas ventoinhas de duto permanecem.

## Referências públicas

Fonte comparável, NÃO o produto escolhido: https://www.dissipatec.com.br/dissipadores-termoeletrico/refrigerador-termoeletrico-dissipador-com-2-peltier-12v-cooler-duplo
Anúncio indicado pelo usuário, dimensões do kit não verificadas: https://pt.aliexpress.com/item/1005010752595372.html
