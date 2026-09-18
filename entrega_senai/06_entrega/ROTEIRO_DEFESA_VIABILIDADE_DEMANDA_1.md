# ROTEIRO DE DEFESA DE VIABILIDADE — DEMANDA 1
## Cabine Climatizada de Ensaios Térmicos
### SAGA GP Inovação · Projeto Integrador 2026/01 6.01 03

> **Orientações ao apresentador:**
> - Linguagem impessoal e técnica (sem "eu", "nós", "a gente").
> - Tempo estimado: 10 a 15 minutos.
> - Este roteiro foi desenhado para seguir EXATAMENTE a estrutura da Demanda Inicial cadastrada, respondendo o que a empresa pediu, como faremos e comprovando a viabilidade.
> - Acompanhe os slides conforme indicação em cada seção.

---

## Slide 1: Capa (≈ 1 minuto)

**[Exibir Slide 1 - Projeto Integrador 2026/01 6.01 03]**

> "Boa tarde. A apresentação a seguir trata da análise da demanda principal do nosso Projeto Integrador, cadastrada sob o código 6.01 03.
>
> O desafio proposto pela empresa Ensaios & Controle Tech, da área de Automação, é a modernização e implementação de um sistema de controle inteligente para cabines climatizadas."

---

## Slide 2: O Processo Atual na Empresa (≈ 1,5 minuto)

**[Exibir Slide 2 - O Cenário: Ensaios Térmicos]**

> "Para entendermos a demanda, primeiro analisamos o processo atual. A empresa realiza ensaios térmicos rigorosos para validar dispositivos eletrônicos.
>
> Na prática, até 50 placas são submetidas simultaneamente a ciclos de aquecimento e resfriamento dentro de uma cabine. Durante todo o teste, as placas ficam energizadas operando em modo de simulação funcional.
>
> Atualmente, esse processo é operado por um microcontrolador básico e possui uma infraestrutura elétrica com disjuntores e acionamento manual através de um display local na máquina."

---

## Slide 3: O Problema na Empresa (≈ 1,5 minuto)

**[Exibir Slide 3 - Oportunidades de Melhoria (O Gargalo)]**

> "Apesar de funcional, o sistema possui gargalos que geram prejuízos, listados na demanda como oportunidades de melhoria.
>
> O maior problema é a baixa capacidade de registro de dados e o sistema cego. Hoje, se uma placa falhar de madrugada, ninguém percebe. O operador não possui monitoramento remoto, exigindo supervisão constante e presencial.
>
> E a pior consequência: não sabemos *qual* placa falhou, nem a *qual temperatura*. Ao fim das horas de ensaio, a empresa é obrigada a pegar todo o lote de placas e enviar a um setor específico para re-testar uma a uma, apenas para descobrir qual ainda funciona, gerando um imenso retrabalho."

---

## Slide 4: A Proposta - O Método de Resolução (≈ 1,5 minuto)

**[Exibir Slide 4 - A Proposta do Projeto]**

> "A nossa proposta para resolver essa dor foca na modernização do equipamento existente. 
>
> O método de resolução central consiste na implementação de um microcontrolador ESP32. Aproveitaremos seu alto poder de processamento e sua conectividade Wi-Fi para dar visão à máquina.
>
> Com a nova arquitetura, implementaremos uma detecção individual de falhas. O sistema avisará exatamente qual placa parou e quando. Tudo isso integrado a um Dashboard moderno, permitindo ao operador monitorar os gráficos e alarmes em tempo real tanto pela tela do computador quanto pelo celular."

---

## Slide 5: O Que a Empresa Espera Resolver (≈ 1 minuto)

**[Exibir Slide 5 - Benefícios Esperados]**

> "Com a aplicação desse método, entregaremos exatamente os benefícios esperados listados pela empresa na demanda inicial:
>
> Primeiramente, a redução drástica no tempo de diagnóstico de falhas, eliminando o retrabalho dos lotes. 
> Em segundo lugar, a rastreabilidade total do processo através de registros confiáveis. E, finalmente, o ganho de liberdade da equipe técnica por meio do monitoramento remoto, garantindo ensaios mais precisos, confiáveis e uma infraestrutura elétrica modernizada e segura."

---

## Slide 6: As Restrições da Demanda (≈ 1,5 minuto)

**[Exibir Slide 6 - Restrições da Demanda]**

> "Um projeto viável precisa também respeitar o que NÃO pode ser feito.
>
> A empresa deixou claro que não podemos parar a continuidade operacional da fábrica para desenvolver o sistema, e que a nossa solução precisa ser compatível com a infraestrutura elétrica atual.
>
> Portanto, o projeto foi pensado para ser um módulo paralelo. Ele complementa o sistema que já existe. Além disso, seguindo a restrição da demanda, a validação inicial será restrita a um ambiente de testes, sem comprometer a segurança da empresa ou desrespeitar as normas elétricas."

---

## Slide 7: Etapas de Desenvolvimento (≈ 1 minuto)

**[Exibir Slide 7 - Como Vamos Fazer]**

> "Para atender a tudo isso com segurança, o projeto seguirá quatro etapas de desenvolvimento.
>
> 1. Iniciaremos com testes de bancada utilizando o ESP32.
> 2. Passaremos para o desenvolvimento de novos esquemas elétricos atualizados e otimizados.
> 3. Construiremos um protótipo físico em escala, em formato de maquete, já que não podemos testar direto na máquina da empresa.
> 4. E realizaremos a validação final dos ensaios em cima deste protótipo, comprovando o funcionamento."

---

## Slide 8: Parecer de Viabilidade (≈ 1 minuto)

**[Exibir Slide 8 - Parecer de Viabilidade]**

> "Senhores da banca, conclui-se que o projeto é totalmente viável do ponto de vista técnico e econômico. O método proposto endereça todos os problemas relatados pela empresa, cumpre todos os benefícios esperados e respeita rigorosamente as restrições operacionais exigidas na plataforma SAGA.
>
> Por isso, declaramos o projeto viável e pedimos formalmente a aprovação desta banca para darmos início às etapas de desenvolvimento do nosso protótipo.
>
> O espaço está aberto para dúvidas e perguntas. Obrigado."
