# Roteiro para Criação dos Slides - Apresentação de Demanda e Viabilidade

**Objetivo:** Obter a aprovação da banca para iniciar o projeto, seguindo rigorosamente a estrutura da Demanda Inicial cadastrada no sistema.
**Regra de Ouro:** Não aprofundar na arquitetura detalhada, diagramas elétricos ou código — isso será a "surpresa" da entrega final.

**Diretrizes de Design:**
* **Tema Principal:** Fundo CLARO (branco ou tons pasteis) para um aspecto limpo e profissional.
* **Composição:** Usar BASTANTE IMAGEM (fotos reais de indústria, laboratórios e eletrônica). Pouco texto nos slides.

---

## Slide 1: Capa (A Demanda)
* **Título:** Projeto Integrador 2026/01 6.01 03
* **Subtítulo:** Implementação de Sistema de Controle Inteligente para Cabine Climatizada
* **Tópicos:**
  * Empresa Parceira: Ensaios & Controle Tech (Área: Automação)
  * Escola SENAI Antônio Adolpho Lobbe
* **Visual Sugerido:** Tema claro. Imagem de fundo institucional, logotipo do SENAI e da empresa fictícia.

## Slide 2: O Processo Atual na Empresa
* **Título:** O Cenário: Ensaios Térmicos
* **Tópicos:**
  * Submissão de até 50 dispositivos simultaneamente a ciclos de aquecimento e resfriamento.
  * Dispositivos permanecem energizados e operando em "simulação funcional".
  * **Composição do Sistema Atual:** Microcontrolador de temperatura, display local, climatização, disjuntores e infraestrutura elétrica.
* **Visual Sugerido:** Tema claro. Fotografia de uma grande câmara térmica industrial e placas eletrônicas em uma bancada de testes.

## Slide 3: O Problema na Empresa
* **Título:** Oportunidades de Melhoria (O Gargalo)
* **Tópicos:**
  * **Ausência de monitoramento remoto:** O processo atual é manual e presencial.
  * **Baixa capacidade de registro:** Se houver falhas, não sabemos *qual* placa falhou, nem a *qual temperatura* ou *quando*.
  * **Retrabalho:** O lote todo precisa ser re-testado um a um em outro setor para achar os defeituosos.
  * Interface limitada e organização elétrica passível de aprimoramento.
* **Visual Sugerido:** Tema claro. Fotos que remetam a retrabalho: um técnico medindo placas uma a uma com um multímetro, ou um operador exausto em frente à máquina.

## Slide 4: A Proposta (O Método de Resolução)
* **Título:** A Proposta do Projeto
* **Tópicos:**
  * Modernizar o sistema sem descartar o maquinário atual.
  * **Implementação do ESP32:** Aproveitar a capacidade de processamento e conectividade (Wi-Fi/Bluetooth).
  * **Integração Digital:** Criação de um Dashboard para monitoramento remoto em tempo real (na tela do PC e no celular) e registro contínuo dos dados.
  * **Detecção Individual:** O grande diferencial para identificar na hora qual posição parou de funcionar.
* **Visual Sugerido:** Tema claro. Composição de um celular e um monitor exibindo um painel de controle (dashboard) sobrepostos a uma placa eletrônica moderna.

## Slide 5: O que a Empresa Espera que Vamos Resolver
* **Título:** Benefícios Esperados
* **Tópicos:**
  * Reduzir o tempo de diagnóstico de falhas.
  * Possibilitar registro e rastreabilidade dos testes.
  * Permitir monitoramento remoto em tempo real.
  * Aumentar a confiabilidade dos ensaios e melhorar o controle térmico.
  * Reduzir riscos por meio da otimização da infraestrutura elétrica.
* **Visual Sugerido:** Tema claro. Gráfico de crescimento ou ícones visuais fortes de "checklist de sucesso" ao lado da imagem de um processo produtivo eficiente e fluido.

## Slide 6: As Regras do Jogo (O que a solução NÃO pode ter)
* **Título:** Restrições da Demanda
* **Tópicos:**
  * **Continuidade Operacional:** O desenvolvimento não pode parar os testes que a empresa já faz.
  * **Compatibilidade:** O projeto precisa integrar-se à infraestrutura elétrica existente.
  * **Ambiente de Testes:** A implementação inicial deve ser feita em um protótipo (maquete), não direto na máquina real.
  * Garantir total conformidade com as normas de segurança elétrica.
* **Visual Sugerido:** Tema claro. Ícone ou fotografia de conformidade (selo de qualidade, placa de segurança elétrica NR-10) ao lado de um painel bem organizado.

## Slide 7: Etapas de Desenvolvimento
* **Título:** Como Vamos Fazer (Plano de Ação)
* **Tópicos:**
  1. Realização de testes de bancada com o ESP32.
  2. Desenvolvimento de novos esquemas elétricos atualizados.
  3. Construção de um protótipo físico / impressão 3D em escala.
  4. Testes rigorosos e validação da solução no protótipo.
* **Visual Sugerido:** Tema claro. Um "roadmap" visual com setas ou caminhos ligando uma foto de componentes soltos na bancada até a foto de uma maquete funcional.

## Slide 8: Conclusão
* **Título:** Parecer de Viabilidade
* **Tópicos:**
  * O projeto atende exatamente a todas as necessidades, benefícios e restrições exigidos pela empresa.
  * A solução é viável tecnicamente, financeiramente (baixo custo de retrofit) e operacionalmente.
  * **Pedido Formal:** Solicitação de aprovação da banca para início das etapas descritas.
* **Visual Sugerido:** Tema claro. Imagem de engenheiros/técnicos concordando ou "aperto de mãos", transmitindo confiança e parceria, com contato da equipe.
