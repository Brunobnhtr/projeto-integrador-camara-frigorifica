/**
 * VALIDADOR DO COMPORTAMENTO
 * ==========================
 * Roda o simulador contra a TABELA DE ESTADOS do Doc 31 §31.0/§31.10 e
 * a sequência do §31.2, linha por linha.
 *
 * ⭐ O PONTO DESTE ARQUIVO: aqui a documentação deixa de ser uma
 *   promessa e vira uma asserção. Se alguém mexer no firmware e a
 *   emergência parar de travar, ou o STOP parar de reter, isto FALHA —
 *   e falha antes de o painel existir.
 *
 *   Os dois defeitos reais encontrados neste projeto (o desligarTudo()
 *   que não desligava as ventoinhas e a ordem invertida dos testes no
 *   RODANDO) seriam pegos aqui, sem bancada.
 *
 * Uso:  npm run simula
 */

import {
  criarSimulador, passo, apertar, avancar, foto,
  socarCogumelo, destravarCogumelo,
  iniciarPelaIHM, pararPelaIHM, pararPeloMQTT, iniciarPeloMQTT,
  ESTADO, MODO, FASE, RECEITA_PADRAO,
} from '../src/sim/index.js';
import { consumo, criarMedidor, medir, LIMITES } from '../src/sim/energia.js';

let falhas = 0, testes = 0;
const V = '\x1b[32m', X = '\x1b[31m', C = '\x1b[36m', D = '\x1b[2m', R = '\x1b[0m';

function cenario(nome) { console.log(`\n${C}=== ${nome} ===${R}`); }

function conferir(oQue, real, esperado) {
  testes++;
  const ok = real === esperado;
  if (!ok) falhas++;
  const val = typeof real === 'boolean' ? (real ? 'sim' : 'não') : real;
  const exp = typeof esperado === 'boolean' ? (esperado ? 'sim' : 'não') : esperado;
  console.log(ok ? `  ${V}✓${R} ${oQue} ${D}= ${val}${R}`
                 : `  ${X}✗ ${oQue} = ${val} — esperado ${exp}${R}`);
}

/** Painel energizado, autoteste feito, nada selado. */
function ligarPainel(opts) {
  const sim = criarSimulador(opts);
  avancar(sim, 200);
  return sim;
}

/** REARME azul + START verde: a máquina fica armada e parada. */
function armar(sim) {
  apertar(sim, 's3Rearme');
  apertar(sim, 's1Verde');
  avancar(sim, 200);
  return sim;
}

// ════════════════════════════════════════════════════════════════════
cenario('1 · Painel energizado — os dois selos nascem abertos');
{
  const f = foto(ligarPainel());
  conferir('KA1 selado', f.ka1, false);
  conferir('KA2 selado', f.ka2, false);
  conferir('24 V no BD-POT', f.bdPot, 0);
  conferir('5 V permanente vivo', f.bd5v, 5.1);
  conferir('estado', f.estado, ESTADO.AGUARDA_START);
  conferir('KA3 autorizado pelo autoteste', f.ka3, true);
}

cenario('2 · O verde sozinho não faz nada — o KA1 tem de estar selado antes');
{
  const sim = ligarPainel();
  apertar(sim, 's1Verde');
  const f = foto(sim);
  conferir('KA2 selado', f.ka2, false);
  conferir('24 V no BD-POT', f.bdPot, 0);
}

cenario('3 · REARME sozinho NÃO arma a potência (passo 4 do §31.2)');
{
  const sim = ligarPainel();
  apertar(sim, 's3Rearme');
  const f = foto(sim);
  conferir('KA1 selado', f.ka1, true);
  conferir('KA2 selado', f.ka2, false);
  conferir('24 V no BD-POT', f.bdPot, 0);
}

cenario('4 · REARME + VERDE = potência armada, processo ainda parado');
{
  const f = foto(armar(ligarPainel()));
  conferir('KA1 selado', f.ka1, true);
  conferir('KA2 selado', f.ka2, true);
  conferir('24 V no BD-POT', f.bdPot, 24);
  conferir('estado', f.estado, ESTADO.AGUARDA_START);
  conferir('R_EN da Peltier', f.renPeltier, false);
  conferir('R_EN do PTC', f.renPtc, false);
}

// ════════════════════════════════════════════════════════════════════
cenario('5 · ⭐ O STOP preto RETÉM — aperta uma vez, solta, e não volta');
{
  const sim = armar(ligarPainel());
  iniciarPelaIHM(sim); avancar(sim, 500);
  conferir('rodando antes', foto(sim).estado, ESTADO.RODANDO);

  apertar(sim, 's2Stop');          // aperta E SOLTA
  avancar(sim, 1000);              // deixa um segundo passar
  const f = foto(sim);
  conferir('KA1 continua selado', f.ka1, true);
  conferir('KA2 perdeu o selo', f.ka2, false);
  conferir('24 V no BD-POT', f.bdPot, 0);
  conferir('⭐ NÃO caiu em FALHA', f.estado, ESTADO.AGUARDA_START);
  conferir('sem alerta espúrio', f.alerta, '');
}

cenario('6 · ⭐ Depois do STOP preto, só o VERDE religa — a IHM não consegue');
{
  const sim = armar(ligarPainel());
  iniciarPelaIHM(sim); avancar(sim, 500);
  apertar(sim, 's2Stop'); avancar(sim, 500);

  iniciarPelaIHM(sim); avancar(sim, 200);
  let f = foto(sim);
  conferir('a IHM não conseguiu armar', f.bdPot, 0);
  conferir('a tela pede o verde', f.alerta, 'APERTE_O_VERDE');

  apertar(sim, 's1Verde'); avancar(sim, 200);
  iniciarPelaIHM(sim); avancar(sim, 200);
  f = foto(sim);
  conferir('com o verde, a potência volta', f.bdPot, 24);
  conferir('e o ensaio reinicia', f.estado, ESTADO.RODANDO);
  conferir('sem tocar no REARME azul', f.ka1, true);
}

cenario('7 · STOP pela IHM é Categoria 2 — a potência SEGUE armada');
{
  const sim = armar(ligarPainel());
  iniciarPelaIHM(sim); avancar(sim, 500);
  pararPelaIHM(sim); avancar(sim, 500);
  let f = foto(sim);
  conferir('KA2 continua selado', f.ka2, true);
  conferir('24 V ainda presentes', f.bdPot, 24);
  conferir('mas o processo parou', f.estado, ESTADO.AGUARDA_START);
  conferir('drivers desabilitados', f.renPeltier || f.renPtc, false);

  iniciarPelaIHM(sim); avancar(sim, 200);
  conferir('e a própria IHM religa', foto(sim).estado, ESTADO.RODANDO);
}

cenario('8 · STOP remoto para; START remoto é RECUSADO');
{
  const sim = armar(ligarPainel());
  iniciarPelaIHM(sim); avancar(sim, 500);
  pararPeloMQTT(sim); avancar(sim, 200);
  conferir('o remoto parou', foto(sim).estado, ESTADO.AGUARDA_START);

  const r = iniciarPeloMQTT(sim); avancar(sim, 200);
  conferir('⛔ o remoto NÃO inicia', r.recusado, 'START_SO_NA_IHM');
  conferir('e continua parado', foto(sim).estado, ESTADO.AGUARDA_START);
}

// ════════════════════════════════════════════════════════════════════
cenario('9 · EMERGÊNCIA derruba tudo, em hardware');
{
  const sim = armar(ligarPainel());
  iniciarPelaIHM(sim); avancar(sim, 500);
  socarCogumelo(sim); avancar(sim, 200);
  const f = foto(sim);
  conferir('KA1 perdeu o selo', f.ka1, false);
  conferir('KA2 caiu junto', f.ka2, false);
  conferir('24 V cortados', f.bdPot, 0);
  conferir('estado', f.estado, ESTADO.EMERGENCIA);
}

cenario('10 · ⭐ Destravar o cogumelo NÃO religa nada (o ensaio nº 4)');
{
  const sim = armar(ligarPainel());
  iniciarPelaIHM(sim); avancar(sim, 500);
  socarCogumelo(sim); avancar(sim, 200);
  destravarCogumelo(sim); avancar(sim, 1000);
  const f = foto(sim);
  conferir('KA1 continua caído', f.ka1, false);
  conferir('24 V continuam cortados', f.bdPot, 0);

  apertar(sim, 's1Verde'); avancar(sim, 200);
  conferir('⭐ nem o verde religa sem o azul', foto(sim).bdPot, 0);
}

cenario('11 · Depois da emergência: azul sela o KA1, verde arma a potência');
{
  const sim = armar(ligarPainel());
  socarCogumelo(sim); destravarCogumelo(sim); avancar(sim, 200);

  apertar(sim, 's3Rearme'); avancar(sim, 200);
  let f = foto(sim);
  conferir('KA1 selado de novo', f.ka1, true);
  conferir('mas ainda sem potência', f.bdPot, 0);

  apertar(sim, 's1Verde'); avancar(sim, 200);
  f = foto(sim);
  conferir('agora sim, 24 V', f.bdPot, 24);
  conferir('e o processo continua PARADO', f.estado, ESTADO.AGUARDA_START);
}

// ════════════════════════════════════════════════════════════════════
cenario('12 · Arduino morre → o KA3 abre → a potência cai e NÃO volta');
{
  const sim = armar(ligarPainel());
  iniciarPelaIHM(sim); avancar(sim, 500);
  sim.falhas.arduinoMorto = true; avancar(sim, 500);
  let f = foto(sim);
  conferir('KA1 intacto (não depende do software)', f.ka1, true);
  conferir('KA2 caiu — o pull-down abriu o KA3', f.ka2, false);
  conferir('24 V cortados', f.bdPot, 0);

  sim.falhas.arduinoMorto = false; avancar(sim, 500);
  conferir('⭐ e não volta sozinha quando ele revive', foto(sim).bdPot, 0);
  apertar(sim, 's1Verde'); avancar(sim, 200);
  conferir('só com o verde', foto(sim).bdPot, 24);
}

cenario('13 · ⭐ Fan travada → trip → corte FÍSICO e retentivo');
{
  const sim = armar(ligarPainel({ tCamara: 25, setpoint: 5 }));
  iniciarPelaIHM(sim); avancar(sim, 1000);
  conferir('resfriando', foto(sim).renPeltier, true);

  sim.falhas.fanTravada = true;
  avancar(sim, 8000);              // passa do TEMPO_PARTIDA_FAN
  const f = foto(sim);
  conferir('estado', f.estado, ESTADO.FALHA);
  conferir('motivo', f.alerta, 'FAN1_PARADA');
  conferir('⭐ 24 V CORTADOS, não só o R_EN', f.bdPot, 0);
  conferir('KA2 perdeu o selo', f.ka2, false);

  sim.falhas.fanTravada = false;
  apertar(sim, 's2Stop'); avancar(sim, 500);   // reconhece o alarme
  conferir('alarme reconhecido', foto(sim).estado, ESTADO.AGUARDA_START);
  conferir('mas a potência continua fora', foto(sim).bdPot, 0);
  apertar(sim, 's1Verde'); avancar(sim, 200);
  conferir('e exige o verde', foto(sim).bdPot, 24);
}

cenario('14 · 🔥 BTS7960 com MOSFET em curto — o cenário que criou o KA3');
{
  const sim = armar(ligarPainel({ tCamara: 25, setpoint: 5 }));
  sim.falhas.btsPeltierEmCurto = true;
  iniciarPelaIHM(sim); avancar(sim, 1000);
  const antes = sim.tCamara;
  avancar(sim, 60000);
  conferir('a Peltier conduz ignorando o R_EN', sim.tCamara < antes - 0.3, true);

  sim.falhas.fanTravada = true;
  avancar(sim, 8000);
  const f = foto(sim);
  conferir('o trip disparou', f.estado, ESTADO.FALHA);
  conferir('⭐ e o corte a montante funcionou', f.bdPot, 0);
  const t1 = sim.tCamara; avancar(sim, 60000);
  conferir('⭐ a câmara parou de esfriar', sim.tCamara > t1, true);
}

// ════════════════════════════════════════════════════════════════════
cenario('15 · 🌀 Ventoinha do radiador — as quatro linhas da regra única');
{
  const sim = armar(ligarPainel({ tCamara: 25, setpoint: 5, tDissipador: 25 }));
  iniciarPelaIHM(sim); avancar(sim, 1000);
  conferir('resfriando → ligada', foto(sim).ventRadiador, true);

  sim.faixa = { min: 44, max: 46 }; avancar(sim, 2000);      // vira aquecimento
  sim.tDissipador = 25;                        // dissipador na ambiente
  avancar(sim, 200);
  conferir('aquecendo e dissipador frio → DESLIGADA', foto(sim).ventRadiador, false);

  sim.tDissipador = 60; avancar(sim, 200);
  conferir('dissipador quente → LIGADA', foto(sim).ventRadiador, true);

  pararPelaIHM(sim); sim.tDissipador = 26; avancar(sim, 200);
  conferir('parado e frio → DESLIGADA', foto(sim).ventRadiador, false);
}

cenario('16 · ⭐ DS18B20 solto conta como QUENTE (fail-safe)');
{
  const sim = armar(ligarPainel({ tDissipador: 25 }));
  avancar(sim, 200);
  conferir('desligada com o sensor bom', foto(sim).ventRadiador, false);
  sim.falhas.ds18Solto = true; avancar(sim, 200);
  conferir('⭐ sensor solto → LIGA', foto(sim).ventRadiador, true);
}

cenario('17 · ⭐ A pós-ventilação sobrevive à EMERGÊNCIA');
{
  const sim = armar(ligarPainel({ tDissipador: 60 }));
  iniciarPelaIHM(sim); avancar(sim, 500);
  socarCogumelo(sim); avancar(sim, 500);
  const f = foto(sim);
  conferir('24 V cortados', f.bdPot, 0);
  conferir('⭐ mas o BD-AUX continua vivo', f.bdAux, 12);
  conferir('⭐ e o radiador continua girando', f.ventRadiador, true);
  conferir('as internas param', f.ventInternas, false);
}

cenario('18 · As 5 ventoinhas internas param junto com o ensaio');
{
  const sim = armar(ligarPainel());
  iniciarPelaIHM(sim); avancar(sim, 500);
  conferir('rodando → ligadas', foto(sim).ventInternas, true);
  pararPelaIHM(sim); avancar(sim, 200);
  conferir('parou → desligadas', foto(sim).ventInternas, false);
}

// ════════════════════════════════════════════════════════════════════
cenario('19 · Intertravamento: NUNCA os dois atuadores juntos');
{
  const sim = armar(ligarPainel({ tCamara: 25, setpoint: 5 }));
  iniciarPelaIHM(sim);
  let juntos = false;
  for (let i = 0; i < 400; i++) {
    passo(sim, 50);
    if (sim.firmware.renPeltier && sim.firmware.renPtc) juntos = true;
    if (i === 150) sim.faixa = { min: 44, max: 46 };    // força a inversão de modo
  }
  conferir('Peltier e PTC habilitados ao mesmo tempo', juntos, false);
}

cenario('20 · Chave geral corta tudo, inclusive a eletrônica');
{
  const sim = armar(ligarPainel());
  iniciarPelaIHM(sim); avancar(sim, 500);
  sim.falhas.geralDesligada = true; avancar(sim, 200);
  const f = foto(sim);
  conferir('BD-POT', f.bdPot, 0);
  conferir('BD-AUX', f.bdAux, 0);
  conferir('BD-5V', f.bd5v, 0);
  conferir('os dois selos caíram', f.ka1 || f.ka2, false);
}

cenario('21 · O processo funciona, e ele mira a MÍNIMA da faixa');
{
  const sim = armar(ligarPainel({ tCamara: 25, faixa: { min: 4, max: 6 } }));
  iniciarPelaIHM(sim);
  avancar(sim, 60 * 60 * 1000, 200);
  const f = foto(sim);
  console.log(`  ${D}camara ${f.tCamara} C · dissipador ${f.tDissipador} C · duty ${f.duty} %${R}`);
  conferir('entrou na faixa', f.naFaixa, true);
  conferir('e parou perto da MINIMA, nao da maxima', f.tCamara < 5.2, true);
  conferir('o dissipador esquentou', f.tDissipador > 35, true);
  conferir('nao declarou inalcancavel', f.inalcancavel, false);
}

cenario('22 · ⭐ Faixa alta: menos esforco, mesmo resultado');
{
  const sim = armar(ligarPainel({ tCamara: 25, faixa: { min: 10, max: 12 } }));
  iniciarPelaIHM(sim);
  avancar(sim, 60 * 60 * 1000, 200);
  const f = foto(sim);
  console.log(`  ${D}camara ${f.tCamara} C · duty ${f.duty} % · dissipador ${f.tDissipador} C${R}`);
  conferir('entrou na faixa', f.naFaixa, true);
  conferir('mirou a minima', f.tCamara < 11, true);
  conferir('⭐ e com duty baixo — nao fica armado a toa', f.duty < 30, true);
}

cenario('23 · 🔥 FAIXA IMPOSSIVEL — o ar-condicionado que nunca chega');
{
  const sim = armar(ligarPainel({ tCamara: 25, faixa: { min: -10, max: -8 } }));
  iniciarPelaIHM(sim);
  avancar(sim, 60 * 60 * 1000, 200);
  const f = foto(sim);
  console.log(`  ${D}camara ${f.tCamara} C · duty ${f.duty} % · dissipador ${f.tDissipador} C${R}`);
  conferir('⭐ o firmware DECLAROU inalcancavel', f.inalcancavel, true);
  conferir('⭐ e RECUOU em vez de forcar o teto', f.duty <= 60, true);
  conferir('nao caiu em FALHA — nao e defeito, e o ambiente', f.estado, ESTADO.RODANDO);
  conferir('e estabilizou num ponto real', f.tCamara < 12, true);
}

cenario('24 · 🔥 A PROVA: mais duty da MENOS frio');
{
  const medir = (duty) => {
    const s = criarSimulador({ tCamara: 5, tCamaraFixa: 5, dutyForcado: duty, tDissipador: 25 });
    avancar(s, 200); apertar(s, 's3Rearme'); apertar(s, 's1Verde'); avancar(s, 200);
    iniciarPelaIHM(s); avancar(s, 40 * 60 * 1000, 200);
    return { qc: s.qcPeltier, td: s.tDissipador };
  };
  const cheio = medir(100), otimo = medir(60);
  console.log(`  ${D}100 %: ${cheio.qc.toFixed(1)} W de frio, dissipador ${cheio.td.toFixed(1)} C${R}`);
  console.log(`  ${D} 60 %: ${otimo.qc.toFixed(1)} W de frio, dissipador ${otimo.td.toFixed(1)} C${R}`);
  conferir('⭐ 60 % esfria MAIS que 100 %', otimo.qc > cheio.qc, true);
  conferir('e por muito — mais de 50 %', otimo.qc > cheio.qc * 1.5, true);
  conferir('porque o dissipador fica bem mais frio', cheio.td - otimo.td > 8, true);
  console.log('  [2m→ e por isso que o limitador olha o DISSIPADOR, e nao a corrente.[0m');
}

cenario('25 · Contato do KA3 SOLDADO — o veto do firmware some');
{
  const sim = armar(ligarPainel({ tCamara: 25, setpoint: 5 }));
  sim.falhas.ka3Colado = true;
  iniciarPelaIHM(sim); avancar(sim, 1000);
  sim.falhas.fanTravada = true; avancar(sim, 8000);
  conferir('o trip ainda dispara', foto(sim).estado, ESTADO.FALHA);
  conferir('mas a potencia NAO cai — o veto morreu', foto(sim).bdPot, 24);

  apertar(sim, 's2Stop'); avancar(sim, 500);
  conferir('o botao preto continua cortando', foto(sim).bdPot, 0);
  socarCogumelo(sim); avancar(sim, 200);
  conferir('e a emergencia tambem', foto(sim).ka1, false);
}

cenario('26 · 🔥 Contato do KA2 SOLDADO — o unico defeito que o painel NAO cobre');
{
  const sim = armar(ligarPainel());
  sim.falhas.ka2Colado = true;
  iniciarPelaIHM(sim); avancar(sim, 500);

  apertar(sim, 's2Stop'); avancar(sim, 500);
  conferir('a bobina do KA2 desenergizou', foto(sim).ka2, false);
  conferir('⚠ mas o contato soldado segue conduzindo', foto(sim).bdPot, 24);

  socarCogumelo(sim); avancar(sim, 500);
  conferir('o KA1 caiu', foto(sim).ka1, false);
  conferir('⚠ e a EMERGENCIA tambem nao corta', foto(sim).bdPot, 24);

  sim.falhas.geralDesligada = true; avancar(sim, 200);
  conferir('⭐ so a chave geral resolve', foto(sim).bdPot, 0);
}

cenario('27 · O caminho do AQUECIMENTO tambem funciona');
{
  const sim = armar(ligarPainel({ tCamara: 20, setpoint: 45 }));
  iniciarPelaIHM(sim); avancar(sim, 2000);
  const f = foto(sim);
  conferir('modo', f.modo, MODO.AQUECIMENTO);
  conferir('PTC habilitado', f.renPtc, true);
  conferir('Peltier desabilitada', f.renPeltier, false);
  conferir('as internas giram aquecendo tambem', f.ventInternas, true);
  conferir('radiador desligado (nao ha calor a tirar)', f.ventRadiador, false);
  avancar(sim, 20 * 60 * 1000, 100);
  console.log(`  ${D}camara ${sim.tCamara.toFixed(1)} C${R}`);
  conferir('a camara aqueceu ate perto do setpoint', Math.abs(sim.tCamara - 45) < 2.5, true);
}

cenario('28 · ENERGIA — o pior caso REAL, medido em vez de estimado');
{
  const med = criarMedidor();
  const sim = armar(ligarPainel({ tCamara: 30, setpoint: 5 }));
  iniciarPelaIHM(sim);
  for (let i = 0; i < 12000; i++) { passo(sim, 100); medir(med, sim); }
  sim.faixa = { min: 49, max: 51 };
  for (let i = 0; i < 12000; i++) { passo(sim, 100); medir(med, sim); }

  const p = med.picos;
  const linha = (n, v, lim) => console.log(
    `  ${D}${n.padEnd(8)} pico ${v.toFixed(2)} A  (${(100 * v / lim).toFixed(0)} % de ${lim} A)` +
    `  em ${med.quando[n]}${R}`);
  linha('BD-POT', p['BD-POT'], LIMITES.F1);
  linha('BD-AUX', p['BD-AUX'], LIMITES.caboT3);
  linha('BD-5V', p['BD-5V'], LIMITES.caboT2);
  linha('fonte', p.fonte, LIMITES.fonte24);

  conferir('F1 (10 A) nao abre', p.F1 < LIMITES.F1, true);
  conferir('F2 (2 A) nao abre', p.F2 < LIMITES.F2, true);
  conferir('F3 (2 A) nao abre', p.F3 < LIMITES.F3, true);
  conferir('a fonte de 10 A da conta', p.fonte < LIMITES.fonte24, true);
  conferir('o LM2596 do 12 V fica na faixa segura', p['BD-AUX'] < LIMITES.lm2596Seguro, true);
  conferir('o cabo do 5 V aguenta os 2 modulos de rele', p['BD-5V'] <= LIMITES.caboT2, true);
  conferir('o cabo do 12 V aguenta as 5 internas juntas', p['BD-AUX'] <= LIMITES.caboT3, true);
}

cenario('29 · O pior caso de corrente e uma FALHA, nao a operacao normal');
{
  const sim = armar(ligarPainel({ tCamara: 6, setpoint: 5 }));
  iniciarPelaIHM(sim); avancar(sim, 2000);
  const normal = consumo(sim)['BD-POT'];
  sim.falhas.btsPeltierEmCurto = true; avancar(sim, 200);
  const emCurto = consumo(sim)['BD-POT'];
  console.log(`  ${D}duty de regime: ${normal.toFixed(2)} A · BTS em curto: ${emCurto.toFixed(2)} A${R}`);
  conferir('o curto puxa muito mais que a operacao', emCurto > normal * 2, true);
  conferir('e mesmo assim o F1 de 10 A NAO abre', emCurto < LIMITES.F1, true);
}

cenario('30 · ⭐ VIGILANCIA MUTUA — os ESP32 acusam a morte do Mega');
{
  const sim = armar(ligarPainel({ tCamara: 25 }));
  iniciarPelaIHM(sim); avancar(sim, 2000);
  conferir('rodando, ninguem sumiu', foto(sim).megaSumido, false);

  sim.falhas.arduinoMorto = true;
  avancar(sim, 1000);
  conferir('1 s de silencio: ainda dentro da tolerancia', foto(sim).megaSumido, false);

  avancar(sim, 3000);
  const f = foto(sim);
  conferir('⭐ 4 s: os ESP concluem que o Mega morreu', f.megaSumido, true);
  conferir('e a potencia JA estava cortada, por hardware', f.bdPot, 0);
  conferir('o BD-5V segue vivo — e por isso eles podem avisar', f.bd5v, 5.1);
  console.log('  [2m→ os ESP CONTAM, nao ATUAM. Quem cortou foi o pull-down no');
  console.log('    gate do KA3. A vigilancia nao da poder novo a ninguem.[0m');

  sim.falhas.arduinoMorto = false; avancar(sim, 1000);
  conferir('Mega voltou: o alarme limpa sozinho', foto(sim).megaSumido, false);
  conferir('mas a potencia NAO volta sozinha', foto(sim).bdPot, 0);
}

cenario('31 · ⭐ CICLO TERMICO — frio, patamar, cooldown, quente, repete');
{
  const receita = {
    tipo: 'CICLO', faixaFria: { min: 8, max: 11 }, faixaQuente: { min: 38, max: 42 },
    patamarMs: 5 * 60 * 1000, cooldownMs: 2 * 60 * 1000,
    cooldownDissipador: 35, ciclos: 4,
  };
  const sim = armar(ligarPainel({ tCamara: 25, receita }));
  iniciarPelaIHM(sim);

  const visto = [];
  let dissipNoDisparoDoPTC = null, ambosLigados = false, ant = '';
  for (let i = 0; i < 120 * 60 * 10; i++) {
    passo(sim, 100);
    const f = sim.firmware;
    if (f.fase !== ant) { visto.push(f.fase); ant = f.fase; }
    if (f.renPeltier && f.renPtc) ambosLigados = true;
    if (f.renPtc && dissipNoDisparoDoPTC === null) dissipNoDisparoDoPTC = sim.tDissipador;
  }
  console.log(`  ${D}${visto.length} transicoes em ${(sim.t / 60000).toFixed(0)} min · ` +
              `dissipador ao disparar o PTC: ${dissipNoDisparoDoPTC.toFixed(0)} C${R}`);

  conferir('passou pelo patamar frio', visto.includes(FASE.PATAMAR_FRIO), true);
  conferir('fez cooldown entre as fases', visto.includes(FASE.COOLDOWN), true);
  conferir('passou pelo patamar quente', visto.includes(FASE.PATAMAR_QUENTE), true);
  conferir('terminou os 4 ciclos', sim.firmware.fase, FASE.CONCLUIDO);
  conferir('⭐ o PTC so disparou com o dissipador ja frio',
    dissipNoDisparoDoPTC < 40, true);
  conferir('e NUNCA os dois atuadores juntos', ambosLigados, false);
  console.log('  [2m→ sem o cooldown, o PTC dispararia com o dissipador a ~52 C e o');
  console.log('    calor atravessaria a pastilha no sentido errado.[0m');
}

cenario('32 · Receita SO FRIO e SO QUENTE nao alternam');
{
  const so = (tipo, faixa) => {
    const r = { ...RECEITA_PADRAO, tipo, faixaFria: faixa, faixaQuente: faixa, ciclos: 1 };
    const sim = armar(ligarPainel({ tCamara: 25, receita: r }));
    iniciarPelaIHM(sim); avancar(sim, 50 * 60 * 1000, 200);
    return foto(sim);
  };
  const frio = so('FRIO', { min: 8, max: 11 });
  conferir('SO FRIO fica na fase de frio', frio.fase, FASE.INDO_FRIO);
  conferir('e entrou na faixa', frio.naFaixa, true);

  const quente = so('QUENTE', { min: 38, max: 42 });
  conferir('SO QUENTE fica na fase de quente', quente.fase, FASE.INDO_QUENTE);
  conferir('e o PTC e quem trabalha', quente.renPtc || quente.naFaixa, true);
}

cenario('33 · 🔥 Contato do KA4 ABERTO — o pior caso, agora simulável');
{
  const sim = armar(ligarPainel({ tCamara: 25 }));
  sim.falhas.ka4Aberto = true;
  iniciarPelaIHM(sim); avancar(sim, 2000);
  conferir('o firmware MANDOU ventilar', foto(sim).ventRadiador, true);
  conferir('⭐ mas nada gira — o contato não fecha', foto(sim).radiadorGirando, false);
  avancar(sim, 20000, 200);
  const f = foto(sim);
  conferir('⭐ e quem acusa é o trip por RPM', f.estado, ESTADO.FALHA);
  conferir('com a potencia cortada de verdade', f.bdPot, 0);
}

cenario('34 · ⭐ Arduino morto: o KA3 abre a potencia E o KA4 FECHA a ventoinha');
{
  const sim = armar(ligarPainel({ tCamara: 25 }));
  iniciarPelaIHM(sim); avancar(sim, 60000, 200);
  sim.falhas.arduinoMorto = true; avancar(sim, 1000);
  const f = foto(sim);
  conferir('a potencia caiu', f.bdPot, 0);
  conferir('⭐ e o radiador CONTINUA GIRANDO — e o NF do KA4', f.radiadorGirando, true);
  conferir('o BD-AUX nao passa pelo KA2, por isso ele pode', f.bdAux, 12);
}


// ════════════════════════════════════════════════════════════════════
console.log(`\n${'═'.repeat(62)}`);
if (falhas === 0) {
  console.log(`${V}OK — ${testes} verificações, o painel se comporta como o Doc 31 descreve${R}\n`);
} else {
  console.log(`${X}FALHOU — ${falhas} de ${testes} verificações não bateram com a documentação${R}\n`);
  process.exit(1);
}
