# Anterioridade e Similares — o que já existe, e onde está a nossa diferença

> 🎯 O objetivo deste documento é o que o caderno da Biblioteca chama de **"inovação
> consciente"**: mostrar que sabemos o que já existe e **não estamos reinventando a roda** —
> e, a partir daí, dizer com precisão qual é a nossa contribuição.

---

## Parte 1 · O que a literatura já resolveu (e que vamos citar, não refazer)

| Já está resolvido na literatura | Fonte | O que fazemos com isso |
|---|---|---|
| **Controle PID de pastilha Peltier com Arduino** | Kim *et al.* (2022), *Case Studies in Thermal Engineering* | ✅ **usamos o método pronto.** Não vamos "descobrir" PID — vamos aplicar e citar |
| **Corrente contínua supera PWM em módulos TEC** | Texas Instruments, SLUA979A (2020) | ✅ é a base da decisão de PWM alto + filtro, em vez do PWM de 1 Hz original |
| **Ripple de corrente < 10 % degrada ΔT em < 1 %** | Ferrotec; Marlow Industries | ✅ vira critério de projeto verificável |
| **Ensaio térmico de eletrônicos: método e severidades** | IEC 60068-2 | ✅ é o que a máquina do cliente executa — dá contexto normativo ao projeto |
| **Segurança de comando: parada de emergência não depende de software** | NR-10; ABNT NBR 5410; ISO 13850 | ✅ é a razão do relé de selo em hardware |

> 📌 **Esta tabela é a prova de que não reinventamos a roda.** Cada linha é um problema que
> alguém já resolveu, e que nós **usamos como base** em vez de tentar resolver de novo.

---

## Parte 2 · Similares no mercado — câmaras climáticas

| O que existe | Quem | Diferença para o nosso caso |
|---|---|---|
| **Câmaras climáticas industriais** (compressor, faixa ampla, conformidade IEC 60068) | Weiss Technik, Espec, Thermotron, Ethik | ⚠️ São o **estado da arte** e fazem tudo — mas custam dezenas de milhares de reais e **não é o que a empresa quer**: ela já tem a cabine e quer **modernizar** |
| **Laboratórios de ensaio como serviço** | INDT e outros | Alternativa ao equipamento próprio: terceirizar o ensaio |
| **Câmaras Peltier de bancada** | diversos fabricantes | Mesma tecnologia da nossa, em produto fechado — **sem acesso aos dados** e sem detecção por posição |
| **Data loggers avulsos** | Testo, Novus, Elitech | Registram temperatura, mas **não sabem se o dispositivo sob ensaio parou de funcionar** |
| **Projetos didáticos abertos** (Arduino + TEC1-12706 + PID) | repositórios públicos e trabalhos acadêmicos | Provam a viabilidade do controle; **nenhum trata rastreabilidade nem falha por posição** |

---

## Parte 3 · ⭐ Onde está a nossa diferença

Nenhum dos similares acima resolve o problema **específico** da demanda. A diferença não está
em controlar temperatura — isso é commodity. Está em três pontos:

| # | Diferencial | Por que ninguém do mercado entrega isso |
|---|---|---|
| 1 | **Saber QUAL dispositivo falhou e QUANDO** | as câmaras controlam o ambiente, não o que está dentro dele. Nossa detecção de corrente por posição diz *"a placa da posição 1 parou às 03h12"* |
| 2 | **Modernizar sem substituir** | o mercado vende câmara nova; nós acrescentamos supervisão à que já existe, por cerca de R$ 300 |
| 3 | **Segurança em eletrotécnica clássica, inteligência em software** | soluções de IoT costumam pôr o corte de emergência no microcontrolador. Aqui o cogumelo derruba o selo em hardware, e o firmware **só pode subtrair** |

> 🎓 **A frase para a banca:** *"controlar a temperatura não é o nosso mérito — isso a
> literatura já resolveu e nós citamos. O nosso mérito é que o ensaio deixa de ser cego: ele
> passa a dizer qual dispositivo morreu, em que minuto, e a avisar sem ninguém estar na
> frente da máquina."*

---

## Parte 4 · ⬜ A busca de anterioridade — o que VOCÊ precisa executar

⚠️ **Obrigatória e só você pode fazer** (exige acesso ao INPI).

### Onde buscar

1. **INPI** — https://busca.inpi.gov.br/pePI/ · Patentes → Pesquisa básica
2. **Google Patents** — https://patents.google.com (em inglês)
3. **SAGA SENAI** — https://gpinovacao.senai.br (soluções de outros grupos)

### Termos prontos para colar

**Em português (INPI):**

```
câmara climática AND monitoramento
ensaio térmico AND placa eletrônica
controle de temperatura AND Peltier
detecção de falha AND ensaio
câmara térmica AND rastreabilidade
```

**Em inglês (Google Patents):**

```
thermal test chamber remote monitoring
thermoelectric climate chamber PID control
device under test failure detection thermal cycling
environmental chamber data logging IoT
```

### Como registrar o resultado

Preencha esta tabela — ela vira evidência para a banca:

| Base | Data da busca | Termo usado | Nº de resultados | Documento mais próximo | Por que o nosso difere |
|---|---|---|---|---|---|
| INPI | ___/___/2026 | | | | |
| INPI | ___/___/2026 | | | | |
| Google Patents | ___/___/2026 | | | | |
| SAGA SENAI | ___/___/2026 | | | | |

> 💡 **Não tem problema encontrar coisas parecidas** — é até esperado. O que a banca quer ver
> é que você **procurou** e sabe explicar a diferença. Um projeto que diz "não achei nada"
> normalmente só procurou mal.
