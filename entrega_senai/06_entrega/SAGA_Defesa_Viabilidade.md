# Defesa de Viabilidade — Câmara Climatizada (Plataforma SAGA SENAI)

---

### Título do Projeto
**Modernização e Supervisão Inteligente para Cabine Climatizada de Ensaios Térmicos**

---

### 1. Qual é a demanda da empresa?

A empresa realiza testes térmicos em dispositivos eletrônicos. Ela coloca até **50 aparelhos** dentro de uma cabine climatizada, liga tudo e espera horas enquanto a câmara esquenta e esfria em ciclos programados.

O problema é que, durante esse tempo todo, **ninguém sabe se um dos aparelhos parou de funcionar**. Se um dispositivo queima no meio do teste, o operador só descobre no final — às vezes depois de 8 horas. Aí não dá para saber **qual** aparelho falhou, **quando** falhou, e o teste inteiro pode ser descartado.

A empresa quer uma solução que:
- Controle a temperatura automaticamente (sem depender de alguém ajustando manualmente).
- **Monitore cada aparelho individualmente** e avise imediatamente se algum parar de funcionar.
- Registre tudo com data e hora, para ter um histórico confiável.
- Permita acompanhar o teste à distância, pelo computador ou celular.

---

### 2. Por que escolhemos essa demanda?

Escolhemos essa demanda porque ela encaixa perfeitamente no que aprendemos no curso de **Eletrotécnica**:

- **Comandos elétricos:** O projeto usa relés, botão de emergência e selo elétrico — exatamente o que estudamos em aula. A segurança é feita em hardware: se o programa travar, a máquina desliga sozinha.
- **Instalações elétricas:** Precisamos dimensionar fios, disjuntores, fusíveis e fontes de alimentação. O painel tem 3 trilhos DIN com separação entre potência e sinal, como num quadro industrial de verdade.
- **Instrumentação:** Usamos sensores de temperatura e de corrente elétrica. O sensor de corrente é o que permite saber se cada aparelho está funcionando ou não.
- **Automação:** O controle de temperatura funciona em malha fechada (PID) — o sistema mede, compara com o valor desejado e ajusta sozinho.
- **Redes industriais:** Os sensores de corrente se comunicam por **RS-485**, que é o mesmo barramento usado nas fábricas. Isso prova que o projeto não é só escolar: ele usa a mesma tecnologia da indústria.

Em resumo: não é um projeto só de programação. É um projeto de **eletrotécnica com programação**, que é exatamente o perfil do nosso curso.

---

### 3. Como funciona a nossa solução?

A ideia é simples: colocamos um **sensor de corrente** em cada posição de teste. Se o aparelho está funcionando, passa corrente. Se parou, a corrente cai para zero. Quando isso acontece, o sistema avisa na hora.

**Na maquete (o que vamos construir):**
- Em vez de uma cabine industrial gigante, usamos uma **caixinha de acrílico isolada** com pastilhas Peltier (aquelas "pedrinhas" que esfriam de um lado e esquentam do outro). Ela é pequena, mas funciona igualzinho: esfria, esquenta e controla a temperatura.
- No lugar dos 50 aparelhos, usamos **2 lâmpadas automotivas** como carga de teste. Se a lâmpada queima ou se puxamos o fusível, o sensor detecta que a corrente sumiu e dispara o alarme.
- O painel de comando é de verdade: trilho DIN, canaletas, relés, botão de emergência, sinaleiros — tudo como num painel industrial.

**O que acontece passo a passo:**
1. O operador configura o teste na tela touchscreen (temperatura desejada, tempo).
2. O Arduino controla a temperatura automaticamente, esquentando ou esfriando conforme necessário.
3. Os sensores de corrente monitoram as lâmpadas o tempo todo.
4. Se uma lâmpada apaga, o sistema identifica **qual** posição falhou e **quando**, grava no cartão de memória e manda um aviso pelo Wi-Fi.
5. O operador pode acompanhar tudo pelo computador, sem precisar ficar na frente do painel.

---

### 4. É viável? Dá pra fazer?

**Sim, e por 3 motivos:**

1. **Custo baixo:** Todos os componentes são vendidos no Brasil e custam pouco. O protótipo inteiro (maquete + painel + câmara + sensores) fica abaixo de **R$ 2.000,00**. Na indústria, o kit de modernização por máquina fica em torno de **R$ 300,00**.

2. **Componentes prontos:** Não estamos inventando nada do zero. Usamos Arduino, ESP32, sensores e módulos que já existem prontos no mercado. É só montar e programar.

3. **Construção por etapas:** O projeto é dividido em 5 camadas (Fundamentos → Maquete → Painel → Elétrica → Integração). Se der problema numa etapa, não perde o que já fez. Dá para testar cada pedaço separado antes de juntar tudo.

**E escala para a fábrica?**
Sim. Na fábrica real, em vez de 2 lâmpadas seriam 50 equipamentos. Em vez de sensores de corrente com fio cortado (ACS712), usariam sensores tipo "alicate" que abraçam o cabo por fora (sem cortar nada). Em vez de módulos de 2 canais, usariam módulos de 8 ou 16 canais. Mas a lógica, o software e o protocolo de comunicação são **exatamente os mesmos**. Documentamos essa migração componente por componente no projeto.

---

### 5. Quais são os riscos?

| E se... | O que fazemos |
|---|---|
| Um componente atrasa para chegar? | O projeto é modular: dá para testar as outras partes enquanto espera. |
| O sensor erra a leitura? | Calibramos em bancada e colocamos filtros no software para ignorar leituras absurdas. |
| O dissipador esquenta demais? | Os coolers têm sensores de rotação. Se parar de girar, o sistema desliga a Peltier na hora. |
| O Wi-Fi cai? | O controle continua funcionando sozinho. O log fica gravado no cartão de memória. Quando o Wi-Fi volta, os dados são reenviados. |

---

### 6. Qual é o diferencial?

Câmaras climatizadas comuns controlam só a temperatura. A nossa proposta vai além: **monitora cada aparelho individualmente**. Se um dos 50 dispositivos morre no meio do teste, o operador sabe na hora qual foi e em que momento — em vez de descobrir 8 horas depois, quando o teste já acabou.

Isso é **rastreabilidade**, e é o que transforma um ensaio genérico em um processo controlado e confiável.

---

### 7. Divisão da apresentação (5 integrantes, ~2 min cada)

| Quem | Fala sobre | Frase-chave |
|---|---|---|
| **Integrante 1** | O problema da empresa e por que ele importa | "O operador não sabe qual aparelho falhou nem quando. Nosso projeto resolve isso." |
| **Integrante 2** | A parte elétrica: painel, emergência, proteções | "A segurança é em hardware. Se o programa travar, a máquina desliga sozinha." |
| **Integrante 3** | O controle de temperatura e os sensores | "A temperatura é controlada automaticamente, e a corrente de cada aparelho é vigiada o tempo todo." |
| **Integrante 4** | O software, a tela, o Wi-Fi e os dados | "Tudo é registrado com data e hora. Se a rede cair, o sistema continua funcionando sozinho." |
| **Integrante 5** | Custos, viabilidade e escalabilidade | "O protótipo custa menos de R$ 2.000. E documentamos como escalar para a fábrica real." |

---

### 8. O que todo mundo do grupo precisa saber responder

1. **Qual é o problema?** O teste térmico roda por horas e ninguém sabe se um aparelho parou de funcionar no meio.
2. **Qual é a solução?** Um painel com sensores de corrente que monitora cada posição individualmente e avisa na hora se algo falhar.
3. **É seguro?** Sim. O botão de emergência e as proteções funcionam em hardware, sem depender do programa.
4. **Quanto custa?** Menos de R$ 2.000 o protótipo completo. Cerca de R$ 300 o kit por máquina na indústria.
5. **Escala pra fábrica?** Sim. A comunicação RS-485 é a mesma da indústria. Só troca os sensores por versões maiores.
6. **Qual é o diferencial?** Saber **qual** aparelho falhou e **quando**, com registro automático — e não só controlar a temperatura.

---

### 9. Encerramento sugerido

"Concluímos que o projeto é viável porque usa componentes baratos e comerciais, a montagem é por etapas e a segurança não depende de software. Ele aplica na prática o que aprendemos em comandos elétricos, instalações, instrumentação e automação. E o mais importante: resolve um problema real da empresa — saber na hora quando um dispositivo falha, em vez de descobrir horas depois."
