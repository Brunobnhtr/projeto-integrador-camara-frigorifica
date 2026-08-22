# Resumo Expandido — texto para o modelo oficial

> ⚠️ **Como usar:** o texto abaixo vai para o modelo `Resumo Expandido_modelo.docx` do SENAI.
> **Times New Roman 12 · justificado · espaçamento 1,5 · sem negrito, itálico, tabela, gráfico
> ou figura no corpo.** ⚠️ E **sem primeira pessoa** — o caderno da Biblioteca exige
> linguagem impessoal: escreva "foi desenvolvida", nunca "desenvolvemos". Os títulos das seções (INTRODUÇÃO, METODOLOGIA, RESULTADOS, CONCLUSÃO)
> já vêm formatados no modelo.
>
> 📊 **Contagem: 680 palavras** (limite 600–700, sem contar título, autores, palavras-chave,
> agradecimentos e referências). Confira com `Revisão → Contar palavras` selecionando só o corpo.

---

## TÍTULO

**IMPLEMENTAÇÃO DE SISTEMA DE CONTROLE INTELIGENTE COM ESP32 PARA CABINE CLIMATIZADA DE ENSAIOS TÉRMICOS**

⚠️ *Cuidado, como avisa o caderno da Biblioteca: o título do PROJETO não é o título da
DEMANDA. Este é o do projeto.*

---

## AUTORES

Bruno Garro Alves
_[nome do 2º integrante]_
_[nome do 3º integrante]_
_[nome do 4º integrante]_
_[nome do instrutor orientador]_

**Nota de rodapé da 1ª página** (o modelo já tem o espaço):

> Formando do Curso Técnico em Eletrotécnica da Firjan SENAI _[unidade]_ – RJ, brunogarroalves01@gmail.com;
> _(repetir uma linha por integrante)_
> Instrutor(a) Orientador(a): _[titulação]_, _[instituição]_ – RJ, _[e-mail]_.

---

## INTRODUÇÃO

O projeto resolve a ausência de supervisão, registro e diagnóstico em ensaios térmicos de
placas eletrônicas. O fabricante precisa comprovar que o produto funciona sob
calor e sob frio, e para isso submete as placas a ciclos de temperatura em cabine climatizada,
conforme a série de normas IEC 60068-2. Na situação encontrada, um controlador local mantinha
a temperatura, mas o ensaio ocorria sem acompanhamento remoto e sem registro. Com até
cinquenta dispositivos energizados ao mesmo tempo, a falha de um passava despercebida até o
fim do ciclo, quando já não era possível determinar quando nem por que ele parou. O resultado
era o descarte do ensaio inteiro.

Foi desenvolvida uma modernização que preserva o controle existente e acrescenta supervisão
remota, rastreabilidade e detecção imediata de falha. A relevância está em três benefícios
mensuráveis: o ensaio deixa de exigir presença física, pois a telemetria chega ao operador em
tempo real; cada evento passa a ter data e hora registradas, permitindo reconstituir o
histórico; e a perda de um dispositivo é sinalizada em menos de um segundo, evitando que horas
de ensaio sejam descartadas. A solução alinha-se ao Objetivo de Desenvolvimento Sustentável
nove, ao promover infraestrutura industrial resiliente por meio de inovação acessível.

## METODOLOGIA

O objetivo geral foi implementar um sistema de controle inteligente com ESP32 para cabine
climatizada, capaz de operar em malha fechada, registrar os ensaios e comunicar-se
remotamente. Os objetivos específicos foram controlar a temperatura com precisão adequada,
garantir que a parada de emergência atuasse em hardware, identificar o dispositivo que falha
durante o ciclo e documentar a instalação segundo as normas aplicáveis.

O desenvolvimento partiu de uma maquete funcional em escala reduzida, que permitiu ensaiar a
solução sem interromper a produção. A planta reproduz a cadeia de energia, da entrada em
corrente alternada aos barramentos em corrente contínua, e alimenta uma câmara termoelétrica
com duas pastilhas Peltier em série e um aquecedor cerâmico. O acionamento das
cargas térmicas emprega drivers de potência com saída de diagnóstico de corrente, comandados
por modulação por largura de pulso em vinte quilohertz, escolha fundamentada na literatura, que demonstra perda de
eficiência quando pastilhas termoelétricas operam sob corrente pulsada. A cadeia de comando
foi construída em eletrotécnica clássica, com relé de selo e botoeiras, de modo que a
emergência funcione mesmo com o firmware travado. A documentação foi estruturada em camadas e
convertida em modelo de dados, do qual são gerados os desenhos técnicos e a lista de
materiais, com validadores que reprovam qualquer inconsistência.

## RESULTADOS

Do ponto de vista técnico, a solução mostrou-se viável com recursos acessíveis:
microcontroladores de baixo custo, sensores digitais de temperatura e umidade, sensor de
corrente por efeito Hall para detectar dispositivo inoperante, relógio de tempo real e cartão
de memória para o registro. A verificação automática confirma a consistência de cento e cinco
condutores, cada um com origem e destino conferidos, além da coerência entre o comportamento
simulado e a documentação de comando. Os ensaios previstos incluem a estabilidade da leitura
analógica, a atuação da emergência com o controlador desligado e a sinalização de falha em
menos de um segundo.

Quanto à viabilidade econômica, o protótipo didático completo foi orçado em aproximadamente
mil e novecentos reais, incluindo maquete, estrutura e cenografia. Aplicada a uma máquina já
existente, a modernização exige apenas o módulo de comunicação, os sensores e a interface,
cerca de trezentos reais por equipamento. Como um único ensaio descartado consome horas de
máquina e de mão de obra, o retorno ocorre já na primeira falha detectada a tempo, o que
confere à proposta relação custo-benefício favorável e potencial de replicação.

## CONCLUSÃO

O projeto atende ao desafio inicial ao transformar um ensaio que ocorria sem testemunha em um
processo observável, registrado e diagnosticável à distância. Os requisitos foram cumpridos
sem substituir o controle existente, o que reduz o custo de adoção e preserva o investimento
já realizado. A contribuição profissional está na integração entre eletrotécnica clássica e
automação moderna, evidenciando que a segurança permanece em hardware enquanto a inteligência
é acrescentada em software. Como evolução futura, prevê-se ampliar o número de posições
monitoradas, exportar relatórios de ensaio automaticamente e integrar o sistema a supervisórios
industriais.

**Palavras-chave:** Ensaio térmico, Automação industrial, Internet das coisas, Rastreabilidade,
Refrigeração termoelétrica.

---

## AGRADECIMENTOS

_(elemento opcional, máximo 50 palavras — sugestão para adaptar)_

Agradecemos aos instrutores da Firjan SENAI pela orientação técnica, à equipe da Biblioteca
pelo apoio na pesquisa e à empresa parceira pela disponibilidade em detalhar a demanda que
originou este trabalho.

---

## REFERÊNCIAS

👉 Estão em [`../01_pesquisa/03_referencias_abnt.md`](../01_pesquisa/03_referencias_abnt.md),
já no formato ABNT NBR 6023. Copie para o final do documento **apenas as que você realmente
citar** no texto.

---

## ANEXOS (páginas depois das referências)

| Anexo | Conteúdo | Situação |
|---|---|---|
| **ANEXO 1** | Pitch e vídeo do protótipo — link do YouTube (+ QR code, se quiser) | ⬜ depende da gravação |
| **ANEXO 2** | BM Canvas **ou** Project Canvas — imagem | ✅ conteúdo em [`../03_canvas/`](../03_canvas/) |
| **ANEXO 3** | Banner — imagem em A4 | ✅ conteúdo em [`../05_banner/`](../05_banner/) |
| **ANEXO 4** | Imagens do protótipo *(opcional)* | ✅ use os desenhos gerados em [`../../desenhos/`](../../desenhos/) |
