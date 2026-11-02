# Projeto Integrador — Revisão 15 | Proposta de corte independente do PTC 12 V / 50 W

**Status: PROPOSTA NÃO APROVADA PARA MONTAGEM OU ENERGIZAÇÃO.** 01/11/2026. Nenhum relé/contator, fusível, condutor ou dispositivo térmico foi selecionado ou ensaiado. A simulação não mede temperatura do corpo do PTC/acrílico nem substitui um projeto de segurança funcional.

## 1. Decisão de arquitetura

Preservar a fonte 24 Vcc / 10 A / 240 W como **candidata** (dimensionamento de todos os picos ainda pendente). Conversores propostos: **T2 24→5 V/5 A** (o anúncio termina em 24 V de entrada, portanto não está aprovado) e **T3 24→12 V/20 A** (20 A são capacidade máxima anunciada, não corrente consumida). Aquecedor **12 V / 50 W**, I nominal **4,17 A**; o PTC pode variar ±25% de potência nominal anunciada, e a corrente/potência de partida precisam ser medidas.

**A distribuição do T3 se divide em dois caminhos distintos:**

```
FONTE 24 Vcc / 240 W
  ├── F1 / KM1 / BTS #1  --> 2× Peltier em série, 24 V (modelo atual)
  ├── F2 / T2 (5,0 V)   --> Arduino, IHM, lógica, relés
  └── F3 (a dimensionar) / T3 (12 V)
        ├── proteção auxiliar -> BD-AUX -> ventoinhas e serviços
        │     (permanece energizado durante EMERGÊNCIA enquanto Q0 estiver ligado)
        └── proteção PTC independente (a dimensionar) -> KPTC-S NO -> KPTC-E NO
              -> BD-PTC -> BTS #2 -> ST-1/ST-2* -> elemento PTC

* A posição dos dispositivos térmicos no circuito de potência ou em um circuito
  de disparo depende das capacidades DC dos dispositivos escolhidos, ainda
  NÃO aprovadas. Desenho de arquitetura, NÃO instrução de ligação.
```

**KPTC-S:** contato de potência CC normalmente aberto comandado por uma cadeia **física** de autorização de segurança vinculada a emergência/STOP, não ao estado do contato de potência do KM1 que pode soldar. **KPTC-E:** um segundo contato CC NO controlado por habilitação independente do aquecimento, em série com KPTC-S; a saída de controle de KPTC-E **não** recebe PWM de 20 kHz — PWM permanece apenas no BTS7960. Ambos devem cair na ausência de autorização. As bobinas precisam de drivers e supressão adequados e de análise de falhas de modo comum. A arquitetura ainda precisa da decisão de como alimentar e monitorar estes atuadores e como impedir reenergização inesperada. Não usar contato auxiliar de sinal como contato de potência.

O circuito fica **sem PTC energizado** quando só um dos dois contatos abre, mesmo que o BTS #2 esteja em curto. No simulador, o contato KPTC-S segue `km1Selado` e a cadeia de segurança física; KPTC-E segue `renPtc && duty>0 && MCU vivo`. Se KM1 soldar, o selo cai mas o contato de 24 V continua vivo; o segundo caminho de 12 V do PTC desliga no modelo. Esta é somente uma **hipótese de topologia a validar**. Soldagem simultânea de KPTC-S e KPTC-E (mais BTS em curto) mantém o aquecedor energizado no modelo: a topologia não foi certificada como tolerante a falhas de causa comum, PL ou SIL.

## 2. Modos de falha que devem permanecer testáveis

| Falha | Instalação provisória sem KPTC (atual) | Modelo de KPTC-S+KPTC-E em série |
|---|---|---|
| BTS2 soldado com processo parado | PTC pode receber 12 V | KPTC-E aberto: 0 V |
| IHM STOP com BTS2 soldado | PTC continua energizado | KPTC-E abre: 0 V |
| Emergência com BTS2 soldado | `BD-PTC` continua em 12 V | KPTC-S e KPTC-E abrem: 0 V |
| KM1 contato soldado + emergência | `BD-POT` pode permanecer 24 V; PTC continua energizado | PTC abre por KPTC, mas **Peltier segue em risco** |
| Um KPTC soldado + BTS2 soldado | Não há KPTC | Outro KPTC abre na emergência |
| Dois KPTC soldados + BTS2 soldado | Não há KPTC | **Falha residual: PTC permanece aquecendo** |
| ST-1/ST-2 acionados | São hipóteses de modelo | Devem cortar independentemente, se realmente especificados/instalados |
| Fonte/conversor de 12 V defeituoso | Não coberto | Exige avaliação separada, fusíveis e proteção por ramal |

## 3. Ventoinha embutida do PTC — pendência distinta

O simulador contabiliza cinco ventoinhas internas, incluindo a do PTC, no KA3. **Ao parar o processo, KA3 desliga as cinco imediatamente**. O corte de corrente do PTC não elimina o calor residual: separar a alimentação do ventilador integrado (somente se o modelo escolhido oferecer fios separados) e definir uma pós-ventilação normal com base em medição real de temperatura do corpo. Em uma emergência, nunca exigir manutenção de energia para retardar o corte seguro. Sem tacômetro/fluxostato no ventilador, o permissivo de ventilação atual é apenas falha injetada na simulação.

## 4. Dimensionamento elétrico a confirmar

- Carga 12 V: 50 W / 12 V = **4,17 A** PTC + **1,325 A** serviços = **5,49 A** na saída T3, sujeito à verificação do ventilador embutido (sem duplicidade).
- Exemplo de tolerância do anúncio: 62,5 W / 12 V = **5,21 A** para o PTC, +1,325 A = **6,53 A**. A partida a frio real pode divergir.
- Com eficiência **hipotética** de T3 η=0,88: entrada T3 nominal ≈ (5,49 A × 12 V)/(0,88 × 24 V) = **3,12 A**, maior que o F3 legado de 2 A. **Não selecionar fusível novo sem curva, corrente de partida, seletividade e bitola.**
- Os relés KPTC-S/E precisam de capacidade para interromper **12 Vcc** e a corrente real máxima/inrush em carga PTC, com margem, ambiente, vida elétrica, defeitos de contato e condução em curto. Um número declarado em A para AC **não** vale automaticamente para DC.
- A fonte 24 V/240 W pode suportar cenários normais; a falha conjunta Peltier+PTC reduz ou elimina sua margem. Corrente nominal do conversor 12 V/20 A **não** é consumo obrigatório de 20 A. Não contar com a limitação da fonte ou do BTS como proteção de desligamento.
- T2 de 5 V com faixa `12–24 V` no anúncio está **no limite de entrada** na fonte nominal de 24 V: exigir ficha verificável com tensão máxima real e transientes. Conferir método de alimentação de 5 V do Arduino Mega, quedas de cabo e correntes da IHM.
- F3/ramais de saída/retorno de 12 V e separação de 0 V ainda precisam de cálculo de curto, seletividade, seções, terminais, proteção DC e verificação de polaridade.

## 5. Bloqueios de liberação de montagem

**Não energizar o PTC** até: (a) escolha e ficha de peças específicas para os dois contatos DC e respectivos circuitos de bobina, (b) solução de proteção térmica independente, (c) validação da ventilação integrada e temperatura superficial do PTC/acrílico, (d) validação de F3 e proteções de saída do T3, (e) ensaios supervisionados de perda de comando, falha de contato e interrupção, (f) integração a esquema unifilar e diagrama de comando finais.

Os arquivos JS da revisão 15 **não alteram a montagem real**. Por padrão `criarSimulador()` conserva a arquitetura atual e seu risco (`cortePtcConceitual=false`); a função `criarSimulador({cortePtcConceitual:true})` apenas simula a hipótese de KPTC-S/KPTC-E. Nenhum firmware compilável `.ino` foi gerado.

## 6. Como reproduzir

Na pasta `painel_interativo`, executar:

```
node scripts/valida_simulador.mjs
node scripts/valida_energia.mjs
node scripts/teste_corte_ptc_conceitual.mjs
```

Esperado para a cópia auditada de 01/11/2026: 166 verificações originais aprovadas, validador de energia aprovado e 10 novos testes aprovados. **O resultado não aprova eletricamente o circuito de potência.**
