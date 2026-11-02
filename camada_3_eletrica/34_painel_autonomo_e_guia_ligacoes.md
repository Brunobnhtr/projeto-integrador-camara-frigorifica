# Painel autônomo - guia de ligações

> 🔴 **DOCUMENTO PARCIALMENTE OBSOLETO — leia a tabela antes de usar qualquer número daqui.**
>
> Este guia foi escrito quando o painel media corrente com **dois ACS712** e tinha
> **700 × 700 × 250 mm**. Nenhuma das duas coisas é verdade hoje:
>
> | O que este documento diz | O que vale hoje | Onde está o vigente |
> |---|---|---|
> | Sensores **ACS712** de 5 A em A2/A3 | **N4AIC24** — 22 canais 0–20 mA + 2 de tensão, **Modbus RS-485** | [Doc 13](../camada_1_maquete/13_posicoes_de_ensaio.md) |
> | "Sem barramento RS-485" | **Com** RS-485: MAX485 no trilho 3, par trançado até o Mega | [Doc 32](32_sinais_e_sensores.md) |
> | Painel **700 × 700 × 250** | **600 × 800 × 250**, **4 trilhos DIN** | [Doc 20](../camada_2_painel/20_painel_projeto_e_layout.md) |
> | Fonte "preliminar" | **24 V / 10 A / 240 W** confirmada, folga **1,41×** | [Doc 02 §2.4](../camada_0_fundamentos/02_arquitetura_de_energia.md) |
> | Tabela **D1…D28** (Etapa 3) | **133 condutores** atualmente listados | `painel_interativo/src/data/fiacao.js` + `npm run valida` |
> | `D24b → BD-0V-B.Z20` e demais | **`Z20` está reserva**; o retorno do N4AIC24 é `GND → Z22` | [Doc 13](../camada_1_maquete/13_posicoes_de_ensaio.md) |
> | LM2596, saída de 5,10 V e PTC 24 V pelo BTS2 | **Propostas substituídas**: T2 5,0 V/5 A, T3 12 V/20 A e PTC 12 V/50 W, todos ainda bloqueados | [Doc 30](30_forca_e_distribuicao.md) |
>
> ✅ **O que continua válido:** apenas princípios gerais de segurança e conferência.
> As etapas abaixo contêm instruções antigas de montagem, fusíveis, conversores e
> fiação; não as execute. Para ligações aprovadas, consulte o guia do painel
> interativo. O PTC segue sem circuito físico definido e não pode ser energizado.
>
> ⚠️ **As tabelas das etapas são históricas.** Além das referências antigas a
> ACS712 e `D24b → Z20`, as instruções de T2/T3 e BTS2/PTC não correspondem à
> proposta elétrica vigente. **Não passe cabos nem energize por este roteiro.**

Revisão 23/10/2026. Fonte: dados ativos do painel interativo. Sem subestação ou ambientação. Base de pinus.

Registro antigo: painel 700 × 700 × 250 mm, ACS712 e LM2596. Não usar estes valores como especificação vigente; verifique envelope, conversores e proteções na documentação atual antes de fabricar.

ACS712 mede corrente e fornece sinal analógico 0–5 V direto aos pinos A2 e A3 do Arduino Mega, com capacitores de filtro 100 nF. Sem barramento RS-485 ou módulo ADC externo no painel. ESP32 mantém Wi-Fi/MQTT pela Serial1 e IHM capacitiva pela Serial2.

## A-01 | Conferir as peças e o espaço do painel

- Escopo: painel, câmara e base de pinus; não instalar subestação, postes ou ambientação.
- O painel 700 × 700 × 250 mm é proposta de envelope. Medir a fonte, os suportes e os conversores; respeitar folgas térmicas e a abertura da porta antes de fabricar.
- Sensores ACS712 de 5 A alimentados em 5 V com saída direta para as entradas analógicas A2 e A3 do Mega. Sem conversor RS-485 ou módulo ADC externo no painel.

Conferir: Peças e medidas reais conferidas. Nenhuma placa solta ou encostada na chapa.


Se falhar: Não avançar se a conferência falhar: desenergizar, localizar a divergência e repetir a medição.

## A-02 | Montar trilhos, canaletas e proteção dos bornes AC

- Instalar os quatro trilhos somente após validar o desenho e as dimensões das peças reais. A montagem de T2/T3 e das proteções permanece bloqueada até a seleção dos modelos e o dimensionamento.
- Manter entrada AC em corredor exclusivo, protegido contra toque e separado dos sinais. A instrução antiga de montagem do LM2596 não vale para os conversores propostos.
- Passar os chicotes móveis da porta com folga: sinal por CL-sin e comando por CL-pot. A antena fica na lateral, sem dobrar o coaxial na porta.

Conferir: Acesso aos bornes, ventilação e fechamento da porta verificados.


Se falhar: Não avançar se a conferência falhar: desenergizar, localizar a divergência e repetir a medição.

## A-03 | Montar os passivos em uso

- C1/C2: 100 nF entre A0/A1 e GND2 do Mega (diagnóstico dos BTS). C3/C4: 100 nF entre A2/A3 e GND2 do Mega (filtro dos sensores ACS712).
- R8/R9: pull-down dos BTS. R10/R11/R12: pull-down dos três relés.
- D1: supressão da bobina do KM1, se não houver proteção interna apropriada. D2/D3: junto aos dois grupos de ventoinhas; conferir polaridade.

Conferir: Valores, polaridades e conexões conferidos. Sem RS-485 ou resistores de terminação.


Se falhar: Não avançar se a conferência falhar: desenergizar, localizar a divergência e repetir a medição.

## B-01 | Ligar PE, entrada AC, Q0 e PS1

- Profissional habilitado define proteção Q0 e cabo pela rede, corrente de entrada, inrush e fonte real. Não tratar C6 como dimensionamento já aprovado.
- Com a alimentação desligada e ausência de tensão verificada, ligar PE da rede à barra PE; dela à carcaça da fonte, gabinete metálico e porta por ligação flexível. PE não é 0 V.
- Ligar os dois condutores ativos aos dois polos de Q0 e destes aos bornes L/N da fonte. Em 220 V fase-fase, não presumir neutro. Conferir seletor da fonte, se existir.

Conferir: Continuidade de proteção, torque e proteção contra toque inspecionados.


Se falhar: Não fazer ligações de rede usando apenas uma foto ou um rótulo genérico.

## B-02 | Medir os 24 V e proteger os ramais

- Manter lógica, conversores e cargas desconectados. Após inspeção, energizar somente PS1 e medir +24V contra 0V.
- Ajustar nominal de 24,0 V conforme a fonte. 25 V não é o nominal do projeto.
- Não instalar F1/F2/F3 a partir dos valores antigos deste guia. Dimensionar cada proteção pela carga, pelos condutores, pelo conversor selecionado e pela capacidade DC documentada.

Conferir: 24 Vcc medidos e polaridade correta; proteção dos ramais validada.


Se falhar: Não avançar se a conferência falhar: desenergizar, localizar a divergência e repetir a medição.

## B-03 | Ajustar T2 e T3 sem eletrônica conectada

- A proposta é T2 24→5,0 V/5 A e T3 24→12 V/20 A; não instalar nem energizar antes de identificar os modelos e confirmar fichas, tensão máxima de entrada e capacidade contínua/térmica.
- A alimentação direta do pino 5V do Mega não está autorizada por esta proposta; validar a placa e a topologia de alimentação.
- Dimensionar F3 e o ramal separado do PTC, com corte DC independente de KM1, antes de emitir instruções de ligação.

Conferir: Saídas reguladas e novamente medidas sob carga.


Se falhar: 24 V no pino 5 V do Mega, sensores ou IHM danifica as placas.

## C-00 | Preparar terminais e conferir cada condutor

- Seguir as seis tabelas abaixo. A anilha identifica o fio; a cor identifica sua função.
- Cortar com folga, identificar as duas pontas, crimpar o terminal adequado e apertar conforme o borne real.
- Testar continuidade ponta a ponta antes de marcar. Seções do modelo e roteamento devem ser validados na instalação.

Conferir: Fios identificados, sem cobre exposto e sem retornos comprimidos em borne incompatível.


Se falhar: Não avançar se a conferência falhar: desenergizar, localizar a divergência e repetir a medição.

## D-01 | Ligar sensores ACS712 aos pinos A2 e A3 do Mega

- OUT do ACS712 #1 → entrada analógica A2 do Mega; OUT do ACS712 #2 → entrada A3. Os sensores medem corrente e fornecem tensão analógica 0–5 V.
- Alimentar os ACS712 com +5 V do BD-5V e 0 V do BD-0V-B. Manter fios de sinal curtos na canaleta de sinais.
- Confirmar os capacitores de filtro C3 e C4 instalados entre os pinos analógicos e o GND2 do Mega.

Conferir: Entradas A2 e A3 recebendo sinais dos sensores; alimentação 5 V estável.


Se falhar: Não avançar se a conferência falhar: desenergizar, localizar a divergência e repetir a medição.

## D-02 | Calibrar leitura de repouso e com carga nos DUTs

- Medir offset do ACS712 sem corrente (gavetas F-P abertas): tensão esperada em A2/A3 ~2,50 V (contagem ADC ~512). Registrar offsets individuais.
- Inserir fusível da posição 1 e ligar a lâmpada W5W (24 V / 5 W): verificar elevação de ~38 mV na tensão (~208 mA medidos). Repetir para a posição 2.
- Confirmar que a leitura analógica no código é estável e não oscila mais que ±2 contagens do conversor A/D.

Conferir: Offsets de repouso calibrados; degrau de corrente comprovado ao acender cada lâmpada.


Se falhar: Serial1 D18/D19 continua no ESP32; Serial2 D16/D17 continua na IHM.

## D-03 | Testar lógica de detecção de falha e alarme

- Com a lâmpada 1 acesa, abrir a gaveta do fusível F-P1: comprovar que a leitura cai para repouso e o alarme FALHA_DUT1 dispara em menos de 1 s.
- Repetir o teste para a posição 2 (F-P2), validando independência total entre os dois canais de ensaio.
- Verificar que a queda de corrente nos DUTs é transmitida pela Serial1 ao ESP32 e exibida na IHM.

Conferir: Identificação imediata de qual carga falhou, sem dependência de barramento serial ou timeout.


Se falhar: Não avançar se a conferência falhar: desenergizar, localizar a divergência e repetir a medição.

## E-01 | Testar comando e estado seguro antes das cargas térmicas

- Testar LIGAR, STOP, emergência e veto do KA1. Soltar a emergência não pode refazer o selo KM1.
- Em emergência, potência térmica cai, mas lógica e ventilação de segurança permanecem vivas. Q0 desliga a alimentação geral.
- Reiniciar o Mega. Conferir que não há partida automática nem perda dos intertravamentos.

Conferir: Corte em hardware e comportamento de boot comprovados.


Se falhar: Não avançar se a conferência falhar: desenergizar, localizar a divergência e repetir a medição.

## E-02 | Conectar a câmara e executar ensaios supervisionados

- Conferir Peltier em série, polaridade, montagem térmica e os dois sinais de RPM do radiador.
- Conferir a tensão de todas as fans incluídas nos kits, especialmente a do PTC. Não ligar uma fan 24 V ao grupo 12 V por suposição.
- Conectar as cargas uma a uma; medir corrente e temperatura da fonte/conversores. Testar alarmes térmicos, pós-ventilação e perda de fan.
- Registrar medições, fotos e alterações de montagem antes de liberar a apresentação.

Conferir: Conjunto validado com as peças reais e resultados registrados.


Se falhar: Não avançar se a conferência falhar: desenergizar, localizar a divergência e repetir a medição.

## Etapa 1 | Alimentação interna

| Fio | Origem | Destino | mm² | Canaletas |
|---|---|---|---|---|
| AC1 | AC-IN · L/F1 | Q0.L_IN | 1.5 | CV-ac |
| AC2 | AC-IN · N/F2 | Q0.N_IN | 1.5 | CV-ac |
| PE1 | AC-IN · PE | PE.IN | 1.5 | CV-ac → CH-ac |
| AC3 | Q0.L_OUT | PS1.L | 1.5 | CH-ac |
| AC4 | Q0.N_OUT | PS1.N | 1.5 | CH-ac |
| PE2 | PE.PS1 | PS1.PE | 1.5 | CH-ac |
| E2 | PS1.0V | BD-0V.IN | 1.5 | CH-base → CV-esq → CH-2x1 |
| F1A | PS1.+24V | F-R.F1_IN | 1.5 | CH-base |
| F2A | PS1.+24V | F-R.F2_IN | 0.75 | CH-base |
| F3A | PS1.+24V | F-R.F3_IN | 0.75 | CH-base |
| E1 | F-R.F1_OUT | KM1.11 | 1.5 | CH-1x4 |
| E5 | F-R.F2_OUT | BD-24V.IN | 0.75 | CH-1x4 → CV-esq → CH-2x1 |
| T2A | F-R.F2_OUT | T2.IN+ | 0.75 | CH-1x4 |
| T3A | F-R.F3_OUT | T3.IN+ | 0.75 | CH-1x4 |
| T2N | T2.IN- | BD-0V.Z6 | 0.75 | CH-1x4 |
| T3N | T3.IN- | BD-0V.Z11 | 0.75 | CH-1x4 |
| E3 | T2.OUT+ | BD-5V.IN | 0.75 | CH-base → CV-esq → CH-2x1 |
| E4 | T3.OUT+ | BD-AUX.IN | 0.75 | CH-base → CV-esq → CH-2x1 |

## Etapa 2 | Comando e emergência

| Fio | Origem | Destino | mm² | Canaletas |
|---|---|---|---|---|
| C1 | BD-24V.O2 | S0.11 | 0.5 | CH-1x4 → CV-esq → CH-base → CP-vpot → CP-3x4 |
| C2 | S0.12 | S2.11 | 0.5 | CP-3x4 |
| C3 | S2.12 | S1.13 | 0.5 | CP-3x4 |
| C4 | S1.13 | KM1.21 | 0.5 | CP-3x4 → CP-vpot → CH-base → CV-esq → CH-2x1 |
| C5 | S1.14 | KM1.A1 | 0.5 | CP-3x4 → CP-vpot → CH-base → CV-esq → CH-1x4 |
| C6 | KM1.24 | KM1.A1 | 0.5 |  |
| C7 | KM1.A2 | KA.COM1 | 0.5 | CH-2x1 |
| C8 | KA.NO1 | BD-0V.Z12 | 0.5 | CH-2x1 → CV-esq → CH-1x4 |
| C9 | KM1.A1 | KM1.A2 | 0.5 |  |
| C10 | KM1.14 | BD-POT.IN | 1.5 | CH-1x4 → CV-esq → CH-2x1 |

## Etapa 3 | Distribuição e aquisição

| Fio | Origem | Destino | mm² | Canaletas |
|---|---|---|---|---|
| D1 | BD-POT.O1 | BTS1.B+ | 1.5 | CH-1x4 → CV-esq → CH-2x1 |
| D2 | BD-POT.O2 | BTS2.B+ | 1.5 | CH-1x4 → CV-esq → CH-2x1 |
| D3 | BD-POT.O3 | SV-1.VCC | 0.5 | CH-1x4 → CV-esq → CH-topo |
| D4 | BD-24V.O1 | ESP32.+ | 0.5 | CH-1x4 → CV-esq → CH-2x1 |
| D7 | BD-5V.O1 | MEGA.+5V | 0.5 | CH-1x4 → CV-esq → CH-topo |
| D8 | BD-5V.O3 | RTC.VCC | 0.5 | CH-1x4 → CV-esq → CH-3x2 |
| D9 | BD-5V.O4 | BTS1.VCC | 0.5 | CH-1x4 → CV-esq → CH-3x2 |
| D10 | BD-5V.O5 | BTS2.VCC | 0.5 | CH-1x4 → CV-esq → CH-3x2 |
| D11 | BD-5V.O6 | AD-1.+ | 0.5 | CH-1x4 → CV-esq → CH-3x2 |
| D12 | BD-5V.O8 | ACS712-1.VCC | 0.5 | CH-1x4 → CV-esq → CH-topo |
| D12b | BD-5V.O11 | ACS712-2.VCC | 0.5 | CH-1x4 → CV-esq → CH-topo |
| D14 | BD-AUX.O1 | KA.COM3 | 0.75 | CH-1x4 → CV-esq → CH-2x1 |
| D15 | BTS1.B− | BD-0V.Z1 | 1.5 | CH-3x2 → CV-esq → CH-1x4 |
| D16 | BTS2.B− | BD-0V.Z2 | 1.5 | CH-3x2 → CV-esq → CH-1x4 |
| D17 | BTS1.GND | BD-0V.Z3 | 0.5 | CH-3x2 → CV-esq → CH-1x4 |
| D18 | BTS2.GND | BD-0V.Z4 | 0.5 | CH-3x2 → CV-esq → CH-1x4 |
| D19 | MEGA.GND3 | BD-0V.Z5 | 0.5 | CH-3x2 → CV-esq → CH-1x4 |
| D7b | BD-5V.O12 | KA.VCC | 0.5 | CH-1x4 → CV-esq → CH-2x1 |
| D20b | KA.GND | BD-0V-B.Z21 | 0.5 | CH-2x1 → CV-esq → CH-3x2 |
| D6b | BD-AUX.O2 | KA.COM2 | 0.5 | CH-1x4 → CV-esq → CH-2x1 |
| D14b | BD-24V.O3 | KA.COM4 | 0.5 | CH-1x4 → CV-esq → CH-2x1 |
| D14c | KA.COM4 | KA.COM5 | 0.5 | Ponte borne a borne placa 8 relés |
| D14d | KA.COM5 | KA.COM6 | 0.5 | Ponte borne a borne placa 8 relés |
| D14e | KA.COM6 | KA.COM7 | 0.5 | Ponte borne a borne placa 8 relés |
| D21 | ESP32.− | BD-0V.Z7 | 0.5 | CH-2x1 → CV-esq → CH-1x4 |
| D22 | RTC.GND | BD-0V.Z8 | 0.5 | CH-3x2 → CV-esq → CH-1x4 |
| D24 | ACS712-1.GND | BD-0V-B.Z17 | 0.5 | CH-3x2 |
| D24b | ACS712-2.GND | BD-0V-B.Z20 | 0.5 | CH-3x2 |
| D25b | SV-1.GND | BD-0V-B.Z25 | 0.25 | CH-topo → CV-esq → CH-3x2 |
| D25c | SV-1.− | BD-0V-B.Z23 | 0.25 | CH-3x2 |
| D26b | AD-1.− | BD-0V-B.Z24 | 0.25 | CH-3x2 |
| D27b | BD-0V.Z16 | BD-0V-B.PT | 4 | CH-1x4 → CV-esq → CH-topo |
| D28b | BD-24V.O4 | F-P.F-P1 IN | 0.5 | CH-1x4 → CV-esq → CH-3x2 |
| D28c | BD-24V.O5 | F-P.F-P2 IN | 0.5 | CH-1x4 → CV-esq → CH-3x2 |
| D28d | F-P.F-P1 OUT | ACS712-1.IP+ | 0.5 | CH-2x1 → CV-esq → CH-topo |
| D28e | F-P.F-P2 OUT | ACS712-2.IP+ | 0.5 | CH-2x1 → CV-esq → CH-topo |
| D28f | ACS712-1.OUT | MEGA.A2 | 0.25 | CH-3x2 |
| D28g | ACS712-2.OUT | MEGA.A3 | 0.25 | CH-3x2 |

## Etapa 4 | Sinais e supervisão no Mega

| Fio | Origem | Destino | mm² | Canaletas |
|---|---|---|---|---|
| S1 | MEGA.D9 | KA.IN4 | 0.25 | CH-topo → CV-dir → CH-2x1 |
| S2 | MEGA.D10 | KA.IN5 | 0.25 | CH-topo → CV-dir → CH-2x1 |
| S3 | MEGA.D11 | KA.IN6 | 0.25 | CH-topo → CV-dir → CH-2x1 |
| S4 | MEGA.D12 | KA.IN7 | 0.25 | CH-topo → CV-dir → CH-2x1 |
| S4b | MEGA.D27 | KA.IN1 | 0.25 | CH-topo → CV-dir → CH-2x1 |
| S4c | MEGA.D30 | KA.IN2 | 0.25 | CH-topo → CV-dir → CH-2x1 |
| S7 | AD-1.S | MEGA.D2 | 0.25 | CH-3x2 → CV-dir → CH-topo |
| S8 | SV-1.S | MEGA.D25 | 0.25 | CH-3x2 → CV-dir → CH-topo |
| S9 | BTS1.R_IS | MEGA.A0 | 0.25 | CH-3x2 |
| S10 | BTS2.R_IS | MEGA.A1 | 0.25 | CH-3x2 |
| S11 | MEGA.D5 | BTS1.R_PWM | 0.25 | CH-topo → CV-dir → CH-3x2 |
| S12 | MEGA.D4 | BTS1.R_EN | 0.25 | CH-topo → CV-dir → CH-3x2 |
| S311 | BTS1.L_PWM | BTS1.GND | 0.25 |  |
| S312 | BTS2.L_PWM | BTS2.GND | 0.25 |  |
| S13 | BTS1.R_EN | BTS1.L_EN | 0.25 |  |
| S14 | MEGA.D6 | BTS2.R_PWM | 0.25 | CH-topo → CV-dir → CH-3x2 |
| S15 | MEGA.D7 | BTS2.R_EN | 0.25 | CH-topo → CV-dir → CH-3x2 |
| S16 | BTS2.R_EN | BTS2.L_EN | 0.25 |  |
| S19 | MEGA.D29 | KA.IN3 | 0.25 | CH-topo → CV-dir → CH-3x2 |
| S25 | MEGA.D20 | RTC.SDA | 0.25 | CH-topo → CV-dir → CH-3x2 |
| S26 | MEGA.D21 | RTC.SCL | 0.25 | CH-topo → CV-dir → CH-3x2 |
| S29 | MEGA.D18 | ESP32.RX0 | 0.25 | CH-topo → CV-dir → CH-3x2 |
| S30 | ESP32.TX0 | MEGA.D19 | 0.25 | CH-3x2 → CV-dir → CH-topo |

## Etapa 5 | Porta

| Fio | Origem | Destino | mm² | Canaletas |
|---|---|---|---|---|
| P1b | KA.NO4 | H1.X1 | 0.5 | CH-2x1 → CV-dir → CP-vsin → CP-2x3 (H1 Verde +24V) |
| P2b | KA.NO5 | H2.X1 | 0.5 | CH-2x1 → CV-dir → CP-vsin → CP-2x3 (H2 Azul +24V) |
| P3b | KA.NO6 | H3.X1 | 0.5 | CH-2x1 → CV-dir → CP-vsin → CP-2x3 (H3 Amarelo +24V) |
| P4b | KA.NO7 | H4.X1 | 0.5 | CH-2x1 → CV-dir → CP-vsin → CP-2x3 (H4 Vermelho +24V) |
| P5 | H1.X2 | H2.X2 | 0.5 | CP-2x3 (Ponte 0V sinaleiros) |
| P6 | H2.X2 | H3.X2 | 0.5 | CP-2x3 (Ponte 0V sinaleiros) |
| P7 | H3.X2 | H4.X2 | 0.5 | CP-2x3 (Ponte 0V sinaleiros) |
| P8 | H4.X2 | BD-0V.Z11 | 0.5 | CP-2x3 → CP-vsin → CV-dir → CH-1x4 (Retorno 0V 24Vcc) |
| P10 | BD-5V.O2 | HMI.VBUS | 0.5 | CH-1x4 → CV-dir → CP-vsin → CP-topo |
| P11 | HMI.GND-PWR | BD-0V.Z9 | 0.5 | CP-topo → CP-vsin → CV-dir → CH-1x4 |
| P12 | MEGA.D16 | CONV.TXI | 0.25 | CH-topo → CV-dir → CP-vsin → CP-topo |
| P13 | CONV.RXO | MEGA.D17 | 0.25 | CP-topo → CP-vsin → CV-dir → CH-topo |
| P14 | BD-5V.O7 | CONV.HV | 0.25 | CH-1x4 → CV-dir → CP-vsin → CP-topo |
| P15 | CONV.GND-HV | BD-0V.Z10 | 0.25 | CP-topo → CP-vsin → CV-dir → CH-1x4 |
| P16 | CONV.LV | HMI.3V3 | 0.25 | CP-1x2 → CP-vsin → CP-topo |
| P17 | CONV.TXO | HMI.RXD · IO43 | 0.25 | CP-1x2 |
| P18 | HMI.TXD · IO44 | CONV.RXI | 0.25 | CP-1x2 |
| P19 | HMI.GND-UART | CONV.GND-LV | 0.25 | CP-1x2 |
| P20 | BD-0V-B.Z18 | S2.13 | 0.25 | CH-3x2 → CV-dir → CP-vsin → CP-2x3 |
| P23 | S2.13 | S0.21 | 0.25 | CP-2x3 → CP-vsin → CP-base |
| P25 | S2.14 | MEGA.D23 | 0.25 | CP-2x3 → CP-vsin → CV-dir → CH-topo |
| P26 | S0.22 | MEGA.D24 | 0.25 | CP-base → CP-vsin → CV-dir → CH-topo |

## Etapa 6 | Câmara e radiador

| Fio | Origem | Destino | mm² | Canaletas |
|---|---|---|---|---|
| X1 | BTS1.M+ | PELT · + | 1.5 | CH-2x1 → CV-esq → CH-base |
| X2 | BTS1.M− | PELT · − | 1.5 | CH-2x1 → CV-esq → CH-base |
| ~~X3~~ | ~~BTS2.M+~~ | ~~PTC · +~~ | — | ⛔ Ligação removida; não conectar ao PTC proposto de 12 V |
| ~~X4~~ | ~~BTS2.M−~~ | ~~PTC · −~~ | — | ⛔ Retorno e circuito de corte DC ainda não definidos |
| X5 | KA.NC2 | RAD · + | 0.5 | CH-2x1 → CV-dir |
| X6 | RAD · − | BD-0V.Z15 | 0.5 | CV-dir → CH-1x4 |
| X9 | KA.NO3 | VF · + | 0.5 | CH-2x1 → CV-dir |
| X10 | VF · − | BD-0V.Z13 | 0.5 | CV-dir → CH-1x4 |
| X11 | ACS712-1.IP- | DUT1 · +24 V | 0.5 | CH-topo → CV-dir |
| X11b | ACS712-2.IP- | DUT2 · +24 V | 0.5 | CH-topo → CV-dir |
| X13 | DUT1 · retorno | BD-0V-B.Z22 | 0.5 | CV-dir → CH-3x2 |
| X13b | DUT2 · retorno | BD-0V-B.Z23 | 0.5 | CV-dir → CH-3x2 |
| X15 | BD-5V.O10 | SENS · VCC | 0.25 | CH-1x4 → CV-dir |
| X16 | SENS · GND | BD-0V-B.Z26 | 0.25 | CV-dir → CH-3x2 |
| X17 | RTC.SDA | SENS · SDA | 0.25 | CH-3x2 → CV-dir |
| X18 | RTC.SCL | SENS · SCL | 0.25 | CH-3x2 → CV-dir |
| X19 | DS18 · DATA | AD-1.DAT | 0.25 | CV-dir → CH-topo |
| X20 | RAD · RPM1 | MEGA.D3 | 0.25 | CV-dir → CH-topo |
| X21 | RAD · RPM2 | MEGA.A8 | 0.25 | CV-dir → CH-3x2 |
| X22 | DS18 · VCC | AD-1.VCC | 0.25 | CV-dir → CH-topo |
| X23 | DS18 · GND | AD-1.GND | 0.25 | CV-dir → CH-topo |

## Alternativas industriais

Protótipo atual: Rede AC → PS1 24 Vcc → LM2596 T2: 5 V · T3: 12 V. Mantém as placas já escolhidas, instaladas em suporte isolante ventilado. Verificar estabilidade, corrente real e temperatura; não assumir 3 A contínuos.

Conversores DC/DC industriais DIN: Barramento 24 Vcc → Uma saída regulada por tensão necessária. Exemplos: MEAN WELL DDR-15G-5 (5 V / 3 A) e DDR-30G-12 (12 V / 2,5 A), entrada 9–36 Vcc. São referências para cotação após calcular a carga, não substituições já aprovadas.

Fontes AC/DC separadas: Rede AC com proteção de cada circuito → Fonte 24 V + fonte 5 V e/ou fonte 12 V. Também é possível. Escolher por potência, espaço, custo e manutenção. Não ligar saídas em paralelo. Definir as referências 0 V e a proteção de cada fonte.

Equipamentos nativos em 24 V: 24 Vcc industrial → Tensão nominal do próprio equipamento. Quando sensores, I/O, IHM e ventiladores aceitarem 24 V, elimina conversores desnecessários. Arduino, ACS712 e lógica de 5 V continuam exigindo alimentação adequada.

- [MEAN WELL — conversores DDR para trilho DIN](https://www.meanwell.com/Upload/PDF/DIN_s.pdf)
- [MEAN WELL — instalação DDR](https://www.meanwell.com/Upload/PDF/DDR%20DIN%20rail%20power%20supply.pdf)
- [Arduino Mega — quatro UARTs](https://docs.arduino.cc/hardware/mega-2560/)
