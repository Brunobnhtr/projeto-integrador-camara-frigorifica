# ETAPA 8 — Montagem Final e Comissionamento

> Oitava e última etapa: **juntar tudo** sobre a base da maquete e **energizar com segurança**, em uma sequência de testes que valida cada subsistema antes do funcionamento completo.
>
> Pré‑requisitos: ETAPAS 3 a 7 concluídas (câmara, painel, força, sinais e firmware).
>
> 📌 Lembrete: o único comando AC é a **chave rotativa 0‑1**. Não há disjuntor nem seccionadora — a energização começa girando essa chave. Ver [ETAPA 5](cabos_forca.md).

---

## 8.1 Base da Maquete

| Item | Especificação |
|---|---|
| Material | MDF 18 mm |
| Dimensão | 65 × 30 cm |
| Acabamento | Tinta preta fosca spray |
| Pés | Borracha autoadesiva nos 4 cantos |

### Layout geral (vista de cima)

```
←─────────────────── 65 cm ──────────────────→
┌──────────┬──────────────┬─────────────────┐
│          │              │ [duto][câmara]  │
│  ATX     │   PAINEL     │       [duto]    │
│ escondida│   DIN        │                 │
│  atrás   │  (frente)    │                 │
└──────────┴──────────────┴─────────────────┘
←─ 20 cm ─→←── 18 cm ───→←───── 27 cm ──────→
   ATX          painel        câmara + dutos
```

### Fixações na base

| Componente | Fixação |
|---|---|
| Painel | 4 parafusos M5×20 mm pelo fundo da base |
| Câmara | Silicone neutro na base + 4 parafusos M4 |
| ATX | Parafusos M4 pelo fundo (atrás do painel, escondida) |

> Os cabos da ATX passam **por baixo da base** e entram no painel pela traseira inferior — invisíveis pela frente. A canaleta painel→câmara corre pela base, da lateral direita do painel até a lateral esquerda da câmara.

---

## 8.2 Ordem Recomendada de Montagem (visão macro)

```
1. Câmara térmica (ETAPA 3) ── pode ser feita em paralelo ──┐
2. Painel mecânico (ETAPA 4) ──────────────────────────────┤
                                                            ▼
3. Força/alimentação no painel (ETAPA 5)
4. Sinais/sensores no painel (ETAPA 6)
5. Gravar firmware (ETAPA 7) — bancada, antes de instalar tudo
6. Fixar painel, câmara e ATX na base (8.1)
7. Cabos painel → câmara pela canaleta
8. Instalar atuadores/sensores DENTRO da câmara (8.3)
9. Comissionamento — energização por etapas (8.4)
```

---

## 8.3 Instalação dos Componentes Dentro da Câmara

| Componente | Posição | Ligação |
|---|---|---|
| Peltier + dissipador + cooler externo | Tampa topo (recorte) | 12V‑FRIO (BTS #1); cooler externo direto na 12V‑FAN + RPM no D13 |
| PTC + fan integrada 60×60 (↑) | Base interna / centro | 12V‑QUENTE (BTS #2) |
| Fan extra 60×60 (↓) lado PTC | Junto ao PTC | 12V‑FRIO (BTS #1) |
| Fan kit Peltier 40×40 (↓) | Lado Peltier | 12V‑FRIO (BTS #1) |
| Fan extra 40×40 (↑) lado Peltier | Lado Peltier | 12V‑QUENTE (BTS #2) |
| DS18B20 | Centro da câmara | D2 + pull‑up 4.7 kΩ |
| AM2315C | Ao lado do DS18B20 | I²C (5 V) |
| Bandeja de alumínio + dreno | Fundo | tubo de silicone para fora |

**Distribuição nos bornes da câmara:**

- `12V‑FRIO` / `GND‑FRIO` → Peltier + fan 40×40 kit + fan extra 60×60 (paralelo).
- `12V‑QUENTE` / `GND‑QUENTE` → PTC + fan integrada 60×60 + fan extra 40×40 (paralelo).
- Cooler externo: direto no cabo do painel (sem borne intermediário).

> ⚠️ Confira a **orientação das fans** (setas no corpo): frio sopra ↓, quente sopra ↑. Errar a direção quebra a circulação de ar (ver [ETAPA 1](informacoes_tecnicas.md) e [ETAPA 3](acrilico.md)).

---

## 8.4 Comissionamento — Energização por Etapas

> 🔌 **Regra de ouro:** energize **por partes**, medindo a cada passo. Nunca ligue tudo de uma vez na primeira vez.

### Teste 0 — Inspeção a frio (sem energia)

- [ ] Painel **desconectado da tomada**.
- [ ] Conferir **terra (PE)** contínuo até o chassi da ATX.
- [ ] Conferir **jumper PS_ON** (verde↔preto) no conector 24 pinos.
- [ ] Conferir **fusível 10 A** no porta‑fusível do ramal BTS.
- [ ] Multímetro: resistência **12V‑POT → GND** e **5V → GND** não podem ser ~0 Ω (curto).
- [ ] Confirmar **pull‑up 4.7 kΩ** no 1‑Wire e **capacitores 100 nF** em A0/A1.
- [ ] Confirmar **star ground** (todos os GND no borne central).

### Teste 1 — Energizar a fonte

- [ ] Ligar o painel na tomada e **girar a chave rotativa para "1"**.
- [ ] A **ventoinha da ATX deve girar** (PS_ON em jumper).
- [ ] Medir nos bornes: **12 V** (±5 %) e **5 V** (±5 %).
- [ ] Girar a chave para "0": tudo deve desligar. Repita para confirmar o comando.

### Teste 2 — Lógica (sem atuadores de potência)

- [ ] Com a chave em "1", o **Arduino deve bootar** e a **Nextion inicializar**.
- [ ] LEDs de sinalização respondem (RUN apaga, etc.).
- [ ] DS18B20 e AM2315C retornam leituras coerentes (ver no debug Serial0).
- [ ] RTC com hora correta; SD criando o arquivo de log.
- [ ] ESP32 conecta no Wi‑Fi e publica MQTT.

### Teste 3 — Atuadores em baixa potência

- [ ] Com `R_EN` habilitado, comandar **duty baixo (~20 %)** no BTS #1 (Peltier).
- [ ] Confirmar a **fan externa girando** e RPM sendo lida no D13.
- [ ] Sentir o **lado frio** da Peltier esfriando.
- [ ] Repetir para o BTS #2 (PTC) em duty baixo → aquece.
- [ ] **Verificar intertravamento:** ao forçar modo frio, o PTC fica OFF, e vice‑versa.

### Teste 4 — Segurança

- [ ] Com a Peltier ativa, **parar a fan externa** manualmente → o sistema deve **desligar tudo** e mostrar "FALHA FAN" (proteção de RPM).
- [ ] Acionar o **botão de emergência** → 12 V dos BTS cortados em hardware + "EMERGENCIA" na Nextion.
- [ ] Destravar o cogumelo → estado "Aguard. START" (não reinicia sozinho).
- [ ] **START** → volta a "RODANDO".

### Teste 5 — Operação completa (malha fechada)

- [ ] Definir um **setpoint** (ex.: 5 °C) e deixar o PID atuar.
- [ ] Acompanhar a curva de temperatura até estabilizar (ajustar Kp/Ki/Kd se oscilar).
- [ ] Confirmar **dreno** funcionando após ~1 h de frio (sem água sobre a eletrônica).
- [ ] Conferir o **CSV no SD** e a **telemetria MQTT** consistentes.

---

## 8.5 Ajuste do PID (dica rápida)

1. Comece com **Ki = 0, Kd = 0** e suba **Kp** até a temperatura responder sem oscilar muito.
2. Acrescente **Ki** pequeno para eliminar o erro em regime (desvio fixo do setpoint).
3. Use **Kd** moderado só se houver overshoot. Cargas térmicas são lentas — valores altos de Kd costumam atrapalhar.
4. Registre os ganhos que funcionaram (no log e no relatório do projeto).

---

## 8.6 Checklist Final do Projeto

- [ ] Câmara montada, vedada, isolada e com dreno (ETAPA 3)
- [ ] Painel mecânico completo, chave rotativa na lateral (ETAPA 4)
- [ ] Força ok: AC só pela chave rotativa, DC distribuído, star ground (ETAPA 5)
- [ ] Sinais e sensores ligados conforme pinout (ETAPA 6)
- [ ] Firmware gravado e validado (ETAPA 7)
- [ ] Base da maquete com painel, câmara e ATX fixados (8.1)
- [ ] Comissionamento Testes 0 a 5 aprovados (8.4)
- [ ] Documentação/relatório atualizados (planilha BOM, fotos, curvas de PID)

> 🎓 Concluídas as 8 etapas, o sistema está pronto para apresentação. Para a defesa, vale mostrar: o **diagrama de força** (destacando a decisão de usar só a chave rotativa), a **arquitetura de controle** (Arduino + ESP32), a **proteção em camadas** (fusível interno da ATX + fusível DC + emergência + RPM) e a **telemetria** no dashboard.
