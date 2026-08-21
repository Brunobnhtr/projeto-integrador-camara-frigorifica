# Business Model Canvas — preenchido

> 📎 Modelo oficial: `BM Canvas_Business Model Canvas_modelo.pptx` (caixas "Digite aqui seu texto").
> Cole cada bloco abaixo na caixa correspondente, exporte como imagem e anexe no **ANEXO 2**.
>
> 🎯 O Guia (§2.3) resume o que o Canvas faz: *"o projeto deixa de ser apenas um protótipo
> técnico e passa a ser compreendido como uma unidade econômica viável"*.

---

## 1 · Parceiros-chave

- **Firjan SENAI** — laboratório, FabLab, orientação técnica e biblioteca
- **Ensaios & Controle Tech** — empresa que propôs a demanda e valida o resultado
- **Fornecedores de componentes** — distribuidores nacionais de automação e eletrônica
- **Laboratórios de ensaio** (INDT e similares) — referência de método e severidade de ensaio
- **Comunidade de código aberto** — bibliotecas de PID, MQTT e 1-Wire

## 2 · Atividades-chave

- Projeto elétrico do painel e da cadeia de comando
- Desenvolvimento do firmware (controle PID, intertravamentos, registro)
- Integração ESP32 e publicação da telemetria por MQTT
- Montagem e comissionamento com ensaios de aceitação
- Documentação técnica e treinamento do operador

## 3 · Recursos-chave

- **Físicos:** painel montado, câmara termoelétrica, bancada de ensaio
- **Intelectuais:** o modelo de dados que gera desenhos e lista de materiais, com validadores automáticos
- **Humanos:** equipe formada em eletrotécnica, com apoio dos instrutores
- **Tecnológicos:** Arduino Mega, ESP32, sensores digitais, registro em cartão com relógio de tempo real

## 4 · Proposta de valor

> **O ensaio térmico deixa de ser cego.**

- **Diz qual dispositivo falhou e em que minuto** — não só que "algo deu errado"
- **Acompanhamento remoto em tempo real** — não é preciso ficar ao lado da máquina
- **Registro com data e hora** de cada evento: o ensaio passa a ter histórico auditável
- **Moderniza sem substituir**: aproveita a cabine que a empresa já tem
- **Segurança em hardware**: o cogumelo derruba a potência mesmo com o software travado

## 5 · Relacionamento com o cliente

- Levantamento da demanda junto à empresa e validação do protótipo com ela
- Entrega assistida: comissionamento acompanhado, com os ensaios de aceitação executados juntos
- Suporte técnico e atualização de firmware
- Documentação viva: o cliente recebe os desenhos e o guia de montagem gerados dos dados

## 6 · Segmentos de clientes

- **Principal:** indústrias de eletroeletrônicos que fazem ensaio térmico interno
- Laboratórios de ensaio e calibração de pequeno porte
- Instituições de ensino técnico — o mesmo conjunto serve como bancada didática
- Integradores de automação que queiram revender a modernização

## 7 · Canais

- Contato direto com a indústria, a partir da demanda do SENAI
- Mostra Inova Firjan SENAI, feiras e eventos de inovação
- Plataforma SAGA SENAI
- Repositório público do projeto, com documentação e desenhos abertos

## 8 · Estrutura de custos

| Item | Valor |
|---|---|
| Protótipo didático completo (maquete, painel, cenografia) | ~R$ 1.900 |
| **Kit de modernização por máquina** (ESP32, sensores, IHM, relés) | **~R$ 300** |
| Horas de engenharia (projeto e firmware) | mão de obra da equipe |
| Custos recorrentes | energia e hospedagem do broker MQTT — desprezíveis |

## 9 · Fluxo de receitas

- **Venda do kit de modernização** — estimativa de R$ 800 a R$ 1.200 por máquina, com margem sobre os ~R$ 300 de material
- **Serviço de instalação e comissionamento** — cobrado por equipamento
- **Contrato de manutenção e atualização** — anual, opcional
- **Licenciamento da versão didática** para instituições de ensino
- **Economia gerada no cliente** (argumento de venda): cada ensaio salvo evita horas de máquina e de mão de obra perdidas

---

## 💡 As quatro premissas, respondidas

| Premissa | Resposta em uma linha |
|---|---|
| **Como fazer?** | acrescentando supervisão a uma cabine existente, sem trocar o controle |
| **O que fazer?** | um kit que enxerga o ensaio: mede, registra e avisa qual dispositivo caiu |
| **Para quem fazer?** | indústria que ensaia eletrônicos e hoje descobre a falha só no fim |
| **Quanto custará?** | ~R$ 300 de material por máquina; venda entre R$ 800 e R$ 1.200 |
