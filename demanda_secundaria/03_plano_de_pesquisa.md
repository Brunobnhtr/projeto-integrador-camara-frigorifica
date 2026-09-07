# Plano de Pesquisa: Silos Inteligentes para Controle de Volume (Gipsita)

Este documento define as diretrizes de pesquisa técnica, visitas e validações que a equipe de eletrotécnica precisa executar para garantir que a solução proposta atenda à demanda #13063 com rigor técnico.

---

## 1. Pesquisa Teórica e Instrumentação Industrial
O principal obstáculo desta demanda é a **poeira em suspensão** causada pela gipsita. Para defender nossa arquitetura, devemos documentar a física dos sensores industriais:

*   **Comportamento de Ondas Sonoras (Ultrassom):** Investigar catálogos de fabricantes (como Endress+Hauser e Vega) para demonstrar como o som perde eco em poeira densa (efeito de amortecimento acústico). 
*   **Comportamento de Ondas Eletromagnéticas (Radar FMCW 80 GHz):** Coletar materiais que provam a viabilidade do radar, pois o comprimento de onda muito curto penetra a camada de poeira sem sofrer difração severa, além do feixe ser extremamente estreito (foco diretivo), evitando que as paredes do cone do silo atrapalhem a leitura.
*   **Loop de Corrente (4-20mA):** Pesquisar as normas da ISA (International Society of Automation) sobre a imunidade a ruídos eletromagnéticos do padrão 4-20mA, justificando por que ele foi escolhido em vez de transmitir uma simples variação de tensão (0-10V) desde o topo do silo até o painel.

## 2. Modelagem Matemática (Cálculo de Volume)
O sensor radar mede a **distância** do sensor até o topo da gipsita. No entanto, o cliente quer saber o **volume** ou a **capacidade percentual**. A equipe precisa pesquisar:
*   As fórmulas geométricas do silo (Volume do Cilindro e Volume do Tronco de Cone inferior).
*   A equação que o ESP32 executará: `Distância Lida` $\rightarrow$ `Altura de Produto` $\rightarrow$ `Volume em Metros Cúbicos`.

## 3. Segurança e Normas Elétricas
Devemos fundamentar as especificações do Painel Elétrico:
*   **NR-10 (Segurança em Instalações e Serviços em Eletricidade):** Justificar a segregação (separação física) entre a tensão de alimentação CA (127V/220V) e a extra-baixa tensão do microcontrolador (24V e 3.3V) dentro do quadro.
*   **NBR 5410:** Critérios para o aterramento correto da blindagem do cabo de sinal do radar (para evitar loops de terra).
*   **Grau de Proteção (Código IP):** Pesquisar a norma IEC 60529 para justificar a escolha de um painel IP65 (totalmente protegido contra poeira e jatos d'água).
*   **Atmosferas Explosivas (NR-20 e poeiras combustíveis):** Pesquisar se o pó de gipsita possui risco de explosão. Caso sim, justificar a necessidade de sensores Ex (intrinsecamente seguros). Como a gipsita (Sulfato de Cálcio) geralmente é inerte, a justificativa deve constar no relatório para mostrar prudência da engenharia.

## 4. Estruturação IoT e Telemetria
Pesquisar a melhor abordagem para enviar o dado do ESP32 até a supervisão:
*   A viabilidade do uso do protocolo **MQTT** sobre o Wi-Fi da empresa (arquitetura Publish/Subscribe).
*   Alternativas caso o Wi-Fi industrial seja fraco na área dos silos (ex: rádios LoRa ou cabo de rede CAT6 em conduíte metálico galvanizado).

---

## 5. Próximos Passos (Checklist)
- [ ] Ler manuais de aplicação de Radares 80 GHz para granéis sólidos.
- [ ] Calcular a equação de linearização do volume de um silo cônico padrão.
- [ ] Esboçar o diagrama unifilar do painel de leitura (Disjuntor -> Fonte 24V -> Conversor ADC -> ESP32 -> Sensor 4-20mA).
- [ ] Modelar a interface web (Dashboard Grafana/Node-RED) de forma amigável para os gestores industriais.

