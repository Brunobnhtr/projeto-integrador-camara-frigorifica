# Preparação para a Banca SENAI — Perguntas e Respostas (FAQ)

> 🎯 Este documento reúne as principais perguntas que a banca de avaliação do SENAI costuma fazer, focadas em viabilidade, inovação, custos, segurança e o uso das tecnologias. Estudem estas respostas para que todos da equipe saibam argumentar e defender a **escolha do projeto**.

---

### 1. Por que vocês escolheram este projeto? Qual é o problema real que ele resolve?
**Resposta:** Escolhemos este projeto porque ele resolve uma "dor" real da indústria de eletrônicos (como a Ensaios & Controle Tech): os ensaios térmicos hoje são cegos. Se uma placa falhar no começo do ensaio, ninguém percebe até o fim do dia, perdendo horas de máquina e descartando todo o lote. Nosso projeto permite **saber exatamente QUAL dispositivo falhou e QUANDO**, dando rastreabilidade e evitando o desperdício de tempo e energia.

### 2. A indústria já vende câmaras climáticas completas. O que o projeto de vocês tem de diferente ou de inovador?
**Resposta:** As câmaras comerciais são o estado da arte para controle ambiental, mas elas custam dezenas de milhares de reais e focam apenas na câmara, não na carga. A inovação do nosso projeto está no modelo de negócios (BM Canvas): nós propomos um **kit de modernização (retrofit) de baixo custo** (cerca de R$ 300) que adiciona supervisão IoT e sensores individuais à cabine que a empresa *já tem*. Além disso, nossa busca no INPI comprovou que a detecção de corrente *por posição de ensaio* em câmaras não é uma solução de prateleira atual.

### 3. Mas a câmara do cliente pode testar aparelhos de tomada (127V/220V CA) ou placas eletrônicas de corrente contínua (12V/24V CC). O painel de vocês serve para os dois?
**Resposta:** Sim. Identificamos essa necessidade durante a pesquisa técnica e projetamos a arquitetura do painel para ser **modular e universal**. O controlador (ESP32) recebe sinais padronizados dos sensores. Se o cliente for testar cargas em Corrente Alternada, usamos módulos de Transformadores de Corrente (TC) ou ACS712; se forem cargas em Corrente Contínua, usamos módulos Shunt (ex: INA219). A inteligência do sistema continua a mesma.

### 4. Vocês dizem que usam ESP32, mas a máquina do cliente pode testar 50 placas ao mesmo tempo. Como vão ligar 50 sensores analógicos num ESP32 que tem poucos pinos?
**Resposta:** Para escalar a solução industrialmente, utilizamos módulos de expansão, especificamente **multiplexadores analógicos (como o CD74HC4067) ou conversores A/D via I2C**. Com apenas 4 ou 5 pinos do ESP32, conseguimos ler, em milissegundos, o estado de todos os 50 canais de corrente de forma sequencial. O Arduino ou ESP32 na nossa topologia serve perfeitamente como mestre de barramento para isso.

### 5. Vocês estão misturando Internet das Coisas (IoT) com controle de potência e temperatura. O que acontece se o software do ESP32 travar no meio da madrugada?
**Resposta:** A câmara desliga com segurança. Aplicamos o princípio da **Segurança em Hardware**. Embora a inteligência esteja no firmware, a cadeia de comando (o relé de selo e o botão de emergência) é puramente física e segue a norma NR-10 e ISO 13850. Se o botão cogumelo for pressionado, ou se houver um travamento que acione o relé de veto (watchdog), a potência é cortada fisicamente. O firmware *só pode subtrair* energia, nunca forçar a máquina a operar contra o circuito de segurança.

### 6. Como vocês garantem que o histórico do ensaio não se perca se o Wi-Fi da fábrica cair?
**Resposta:** A telemetria via MQTT/Wi-Fi é apenas para o monitoramento em tempo real do operador. O projeto industrial (Parte 3 da nossa pesquisa) prevê um **Módulo RTC (Real Time Clock)** com bateria própria e um **leitor de Cartão SD** ligados ao ESP32. Assim, cada evento de temperatura e falha é gravado fisicamente em um arquivo `.csv` com a data e hora corretas. Quando o Wi-Fi voltar, o log de auditoria continua seguro no equipamento.

### 7. Por que vocês optaram por usar Corrente Contínua pulsada (PWM de alta frequência + filtro) em vez de um controle simples liga-desliga ou PWM lento para a pastilha Peltier?
**Resposta:** Pesquisamos as notas de aplicação de fabricantes como a Texas Instruments e a Ferrotec. A literatura comprova que o ripple (ondulação) de corrente degrada o delta de temperatura e reduz drasticamente a vida útil dos semicondutores Peltier. Um ripple menor que 10% é o ideal. Por isso, nosso controle usa frequência alta combinada a um filtro passa-baixa, o que mantém a pastilha operando no seu ponto ótimo.

### 8. Pelo relatório de vocês, notamos o uso de Inteligência Artificial para estruturar parte da pesquisa e da documentação. Como vocês justificam o uso de IA perante as regras do SENAI?
**Resposta:** Utilizamos a IA exatamente como o Guia Prático do SENAI recomenda: como um suporte e ferramenta de produtividade, e não como substituto do conhecimento. A IA ajudou a estruturar os dados e os desenhos em SVG, mas todas as **decisões técnicas** (como a escolha de relés em vez de MOSFETs na segurança, ou a modularidade CA/CC) foram nossas. Além disso, criamos validadores automáticos no código que conferem os limites elétricos reais do projeto, aplicando o conceito de "validação humana" e mitigando qualquer risco de alucinação da ferramenta.

