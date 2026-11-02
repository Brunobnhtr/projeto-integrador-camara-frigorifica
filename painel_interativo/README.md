# Painel Interativo - CF-01

Revisao: 01/11/2026. Painel autonomo e camara termica sobre base de pinus, sem subestacao ou ambientacao. T2/T3 e o ramal do PTC seguem bloqueados para compra e energizacao.

## Executar

```sh
npm install
npm run dev
```

Abrir http://localhost:5173. As abas Sistema e alimentacao, Dentro do painel e Guia de montagem mostram a proposta vigente. Guia: 18 passos e 133 condutores atualmente listados. PTC 12 V/50 W, conversores T2 5,0 V/5 A e T3 12 V/20 A, F3 e corte DC ainda requerem modelos, fichas e dimensionamento; nao energizar o PTC.

## Dados e verificacao

- `src/data/painel_completo.js`: equipamentos, terminais, trilhos e canaletas.
- `src/data/fiacao.js`: lista canonica de fios, alimentacao AC/DC e Modbus.
- `src/data/guia_painel_atual.js`: sequencia de montagem, derivada dos mesmos fios.
- `src/data/alimentacao_industrial.js`: alternativas industriais e referencias oficiais.
- `npm run valida`: arquitetura, simulador, fiacao, passivos, painel, camara e desenho.
- `npm run build` e `npm run lint`: verificacoes do aplicativo.

Os arquivos `fiacao_etapa*.js` e a maquete representam estudos anteriores e nao alimentam a fiacao ativa. O validador historico continua em `npm run valida:maquete`.

## Alimentacao e comunicacao

Rede AC + PE -> Q0 -> PS1 24 V. T2 24->5,0 V/5 A e T3 24->12 V/20 A sao propostas sem modelo aprovado. Confirmar faixa maxima/transientes de entrada do T2 e capacidade continua/termica do T3. O PTC proposto precisa de ramal separado, corte DC independente de KM1, F3 e condutores dimensionados.

N4AIC24 -> Modbus RTU/RS-485 -> MAX485 -> Mega Serial3 (D14/D15), D26 para DE e /RE. ESP32 permanece na Serial1; IHM na Serial2. A medicao pelo BTS IS/A1 nao comprova um curto se a saida IS deixar de sinalizar.

O gabinete 600 x 800 x 250 mm e as protecoes sao proposta para conferir com pecas reais, nao liberacao de fabricacao. Firmware Modbus depende do mapa de registradores; simulacao nao substitui teste fisico. KM1 corta BD-POT/24 V, nao o novo ramal permanente de 12 V do PTC.

[Guia completo de ligacoes](../camada_3_eletrica/34_painel_autonomo_e_guia_ligacoes.md)
