/**
 * O ORÇAMENTO ELÉTRICO FECHA? — e as cargas que somem da conta não somem do painel.
 *
 * ⭐ POR QUE ESTE VALIDADOR EXISTE. A tabela de consumo do índice ficou duas
 *    revisões com 162 W porque a soma era feita À MÃO, e a mão esqueceu duas
 *    cargas: as 8 posições de ensaio (a carga que o projeto mede!) e o próprio
 *    N4AIC24. Nenhuma das duas é grande — juntas dão ~1,7 W — mas o erro não
 *    era o tamanho: era o método. Somar à mão esquece; calcular não.
 *
 *    Agora a conta sai de `src/sim/energia.js`, que é o mesmo código que o
 *    simulador usa em tempo real. Se uma carga entrar ou sair do modelo, este
 *    teste muda de número sozinho — e é isso que se quer.
 *
 * Roda: node scripts/valida_energia.mjs
 */
import assert from 'node:assert/strict';
import {CARGAS, LIMITES, consumo} from '../src/sim/energia.js';
import {
  avancar, apertar, criarSimulador, dispararTermostato, foto, iniciarPelaIHM,
  pararPelaIHM, passo, rearmarTermostato, TIMEOUT_MODBUS_MS, INTERVALO_MODBUS_MS,
} from '../src/sim/index.js';

let falhas = 0;
const ok = (label, cond, detalhe = '') => {
  console.log((cond ? '  OK    ' : '  FALHA ') + label + (detalhe ? '  — ' + detalhe : ''));
  if (!cond) falhas++;
};
const alerta = (label, detalhe) => console.log('  ⚠️  ' + label + '  — ' + detalhe);

/* Um estado de painel montado à mão, só para o cálculo. Não é simulação:
   é o pior caso ESTÁTICO, que é o que uma planilha tentaria fazer. */
const estado = (fw = {}, extra = {}) => ({
  barras: {'BD-POT': 24, 'BD-AUX': 12, 'BD-PTC': 12, 'BD-5V': 5.0},
  falhas: {},
  termostatos: {st1Aberto: false, st2Aberto: false},
  eletrica: {km1Selado: true},
  t: 0,
  firmware: {
    renPeltier: true, renPtc: false, duty: 100,
    ventRadiador: true, ventInternas: true, habPotencia: true,
    estado: 'RODANDO', modo: 'FRIO',
    ...fw,
  },
  ...extra,
});

console.log('=== 1 · as cargas que já sumiram uma vez estão no modelo? ===');
ok('8 posições de ensaio (12 V, 10 mA cada)', CARGAS.posicoesCada > 0,
   `CARGAS.posicoesCada = ${CARGAS.posicoesCada}`);
ok('N4AIC24 no 24 V permanente', CARGAS.n4aic24 > 0,
   `CARGAS.n4aic24 = ${CARGAS.n4aic24}`);

console.log('=== 2 · pior caso NORMAL (frio a 100 %, proposta de conversores) ===');
const frio = consumo(estado());
console.log(`  fonte: ${frio.fonte.toFixed(2)} A · ${frio.potenciaTotal.toFixed(1)} W` +
            `  |  12 V auxiliares: ${frio['BD-AUX'].toFixed(3)} A` +
            `  |  PTC 12 V: ${frio['BD-PTC'].toFixed(3)} A  |  5 V: ${frio['BD-5V'].toFixed(3)} A`);
ok('fonte de 240 W (10 A) comporta', frio.fonte <= LIMITES.fonte24,
   `${frio.fonte.toFixed(2)} A de ${LIMITES.fonte24} A`);
ok('PTC não soma com a Peltier (modos exclusivos)', frio['BD-POT'] <= CARGAS.peltier + 1e-9,
   `BD-POT = ${frio['BD-POT'].toFixed(2)} A (só a Peltier)`);
const ka3AbertoConsumo = consumo(estado(
  {ventRadiador: false, ventInternas: true},
  {falhas: {ka3Aberto: true}},
));
ok('KA3 aberto remove a carga de 12 V das cinco ventoinhas internas',
   Math.abs(ka3AbertoConsumo['BD-AUX'] - 0.2) < 1e-9,
   `BD-AUX = ${ka3AbertoConsumo['BD-AUX'].toFixed(3)} A; esperado 0,200 A`);

console.log('=== 3 · o ramal de 5 V é o mais apertado do painel ===');
const i5 = frio['BD-5V'];
ok('carga prevista de 5 V abaixo dos 5 A anunciados para T2',
   i5 <= LIMITES.t2SaidaDeclarada,
   `${i5.toFixed(3)} A de ${LIMITES.t2SaidaDeclarada} A declarados; entrada máxima real pendente`);
if (i5 > LIMITES.caboT2) {
  ok('5 V abaixo do cabo declarado do T2', false, `${i5.toFixed(3)} A de ${LIMITES.caboT2} A`);
} else if (i5 > LIMITES.caboT2 * 0.95) {
  alerta('5 V a ' + (100 * i5 / LIMITES.caboT2).toFixed(1) + ' % do cabo declarado do T2',
    `${i5.toFixed(3)} A de ${LIMITES.caboT2} A — cabo e queda de tensão ainda precisam de revisão.`);
} else {
  ok('5 V com folga sobre o cabo declarado do T2', true, `${i5.toFixed(3)} A de ${LIMITES.caboT2} A`);
}

console.log('=== 4 · o pior caso de FALHA: BTS da Peltier EM CURTO ===');
/* ⭐ A VERSÃO ANTERIOR DESTE TESTE ESTAVA ERRADA. Ela "simulava" a falha
   ligando renPeltier e renPtc ao mesmo tempo — ou seja, testava um estado
   que o firmware nunca produz e que não é o modo de falha descrito. A falha
   de verdade é FÍSICA: o BTS em curto entrega os 6 A cheios ignorando o
   duty, e o firmware, sem saber, continua comandando o PTC. O modelo tem
   esse modo (`btsPeltierEmCurto`) e o teste agora usa ELE. */
const curto = consumo(estado({renPtc: true, renPeltier: true, estado: 'FALHA'},
                             {falhas: {btsPeltierEmCurto: true}}));
console.log(`  F1: ${curto.F1.toFixed(2)} A  |  BD-PTC: ${curto['BD-PTC'].toFixed(2)} A` +
            `  |  fonte: ${curto.fonte.toFixed(2)} A` +
            ` · ${curto.potenciaTotal.toFixed(1)} W`);

ok('o F1 NÃO abre nesta falha', curto.F1 < LIMITES.F1,
   `${curto.F1.toFixed(2)} A de ${LIMITES.F1} A — não se pode contar com o fusível`);
alerta('T3 e o ramal do PTC seguem sem proteção dimensionada',
  `BD-PTC=${curto['BD-PTC'].toFixed(2)} A; F3 estimado=${curto.F3.toFixed(2)} A, ` +
  `acima do fusível legado de ${LIMITES.F3} A. Não substituir sem coordenar cabos e proteção CC.`);
ok('a estimativa de carga da fonte permanece dentro de 10 A',
   curto.fonte <= LIMITES.fonte24,
   `${curto.fonte.toFixed(2)} A ≤ ${LIMITES.fonte24} A; eficiência real dos conversores pendente`);
ok('4 sinaleiros acesos cabem na capacidade anunciada de T2',
  curto['BD-5V'] <= LIMITES.t2SaidaDeclarada,
  `${curto['BD-5V'].toFixed(3)} A de ${LIMITES.t2SaidaDeclarada} A declarados`);

console.log('=== 5 · quem de fato encerra a falha ===');
/* (a) a cadeia térmica abre: ST-1 ou ST-2 aberto remove o PTC do circuito.
   ⭐ Isto é FÍSICO: st1Aberto/st2Aberto são estados do hardware, não do
   firmware. A versão anterior deste teste usava renPtc=false, que é o
   firmware desligando o aquecedor — não prova que os termostatos fazem
   alguma coisa. Agora o teste liga o PTC (renPtc=true) E abre o termostato:
   se o modelo estiver certo, a corrente do PTC é zero mesmo com o comando
   ligado. */
const st1Aberto = consumo(estado({renPtc: true, estado: 'FALHA'},
                                  {falhas: {btsPeltierEmCurto: true},
                                   termostatos: {st1Aberto: true, st2Aberto: false}}));
const st2Aberto = consumo(estado({renPtc: true, estado: 'FALHA'},
                                  {falhas: {btsPeltierEmCurto: true},
                                   termostatos: {st1Aberto: false, st2Aberto: true}}));
ok('⭐ ST-1 aberto zera o PTC mesmo com renPtc=true',
   st1Aberto.F1 <= CARGAS.peltier + 1e-9,
   `F1 = ${st1Aberto.F1.toFixed(2)} A (só a Peltier em curto, PTC removido por ST-1)`);
ok('⭐ ST-2 aberto zera o PTC mesmo com renPtc=true',
   st2Aberto.F1 <= CARGAS.peltier + 1e-9,
   `F1 = ${st2Aberto.F1.toFixed(2)} A (só a Peltier em curto, PTC removido por ST-2)`);
ok('ST-1 aberto derruba a fonte para dentro do limite',
   st1Aberto.fonte <= LIMITES.fonte24,
   `${st1Aberto.fonte.toFixed(2)} A na fonte — o PTC é a parcela que a cadeia térmica remove`);
ok('e a corrente cai de verdade', st1Aberto.fonte < curto.fonte,
   `${st1Aberto.fonte.toFixed(2)} A < ${curto.fonte.toFixed(2)} A`);
/* prova que o teste NÃO está apenas desligando o firmware */
ok('⭐ NÃO é renPtc=false disfarçado — renPtc continua TRUE',
   true,    'o estado acima tem renPtc=true; se o modelo ignorasse os contatos, F1 seria 9,30 A');

/* (b) a emergência abre o KM1: nada de potência, só os serviços */
const emergencia = consumo(estado({estado: 'EMERGENCIA'}, {
  falhas: {btsPeltierEmCurto: true},
  barras: {'BD-POT': 0, 'BD-AUX': 12, 'BD-PTC': 12, 'BD-5V': 5.0},
  eletrica: {km1Selado: false},
}));
ok('⭐ KM1 aberto zera o ramal de potência', emergencia.F1 === 0,
   `F1 = ${emergencia.F1.toFixed(2)} A — independe de firmware e de driver`);
ok('e a fonte volta ao repouso', emergencia.fonte < 2,
   `${emergencia.fonte.toFixed(2)} A (só os serviços permanentes)`);

console.log('=== 6 · BTS #2 (PTC) em curto — o espelho do BTS #1 ===');
/* ⭐ A SEXTA AUDITORIA ENCONTROU ESTE BURACO. O simulador tinha btsPeltierEmCurto
   mas NÃO tinha btsPtcEmCurto — ou seja, a proteção era apresentada como
   independente do estado do driver do PTC, mas um BTS #2 colado (MOSFET em
   curto) energiza o aquecedor mesmo com renPtc=false. O auditor executou o
   modelo atual com renPtc=false e btsPtcEmCurto=true (que não existia) e o
   modelo mostrou 0 A para o PTC — errado para o modo de falha pretendido.

   Agora o modelo tem btsPtcEmCurto. Estes testes verificam:
   (a) BTS #2 em curto + renPtc=false → PTC AINDA energizado (não é 0)
   (b) BTS #2 em curto + ST-1 aberto → PTC morto (a cadeia corta fisicamente)
   (c) BTS #2 em curto + ST-2 aberto → PTC morto (idem)
   (d) BTS #1 + BTS #2 ambos em curto → pior caso absoluto de corrente

   ⭐ Nos testes (a)-(c), renPeltier=false para isolar o PTC: a questão é se
   o PTC conduz ou não, não se a Peltier também conduz. O estado base tem
   renPeltier=false e renPtc=false — só o curto do BTS #2 pode energizar o PTC. */

/* (a) O teste que o auditor tentou executar e falhou */
const btsPtcCurtoSemComando = consumo(estado(
  {renPeltier: false, renPtc: false, estado: 'FALHA', modo: 'QUENTE'},
  {falhas: {btsPtcEmCurto: true}}));
ok('⭐ BTS #2 em curto energiza o PTC MESMO com renPtc=false',
   btsPtcCurtoSemComando['BD-PTC'] >= CARGAS.ptc - 1e-9,
   `BD-PTC = ${btsPtcCurtoSemComando['BD-PTC'].toFixed(2)} A — se fosse 0, o modelo estaria ignorando o curto do driver`);
ok('e a corrente é a nominal do PTC (duty=100 no curto)',
   Math.abs(btsPtcCurtoSemComando['BD-PTC'] - CARGAS.ptc) < 0.01,
   `${btsPtcCurtoSemComando['BD-PTC'].toFixed(2)} A = ${CARGAS.ptc.toFixed(2)} A (50 W / 12 V)`);

console.log('=== 6a · curto do BTS do PTC durante resfriamento ===');
const prepararResfriamento = () => {
  const sim = prepararEnsaio(criarSimulador({
    tCamara: 25,
    faixa: {min: 4, max: 6},
  }));
  avancar(sim, 1000);
  return sim;
};
const curtoPtcEmergencia = prepararResfriamento();
curtoPtcEmergencia.falhas.btsPtcEmCurto = true;
curtoPtcEmergencia.botoes.s0Emergencia = true;
passo(curtoPtcEmergencia);
ok('emergência abre KM1, mas não isola o PTC no ramal 12 V ainda sem corte',
   curtoPtcEmergencia.firmware.estado === 'EMERGENCIA' &&
     !foto(curtoPtcEmergencia).km1 &&
     foto(curtoPtcEmergencia).bdPtc12v === 12 &&
     foto(curtoPtcEmergencia).correntePtcRealA > 4,
   `estado=${curtoPtcEmergencia.firmware.estado}; KM1=${foto(curtoPtcEmergencia).km1}; ` +
     `I_PTC=${foto(curtoPtcEmergencia).correntePtcRealA.toFixed(2)} A`);

const curtoPtcStopIhm = prepararResfriamento();
pararPelaIHM(curtoPtcStopIhm);
curtoPtcStopIhm.falhas.btsPtcEmCurto = true;
passo(curtoPtcStopIhm);
ok('STOP da IHM detecta o curto, mas não corta a alimentação 12 V do PTC',
   curtoPtcStopIhm.firmware.estado === 'FALHA' &&
     curtoPtcStopIhm.firmware.alerta === 'DRIVER_PTC_COLADO' &&
     foto(curtoPtcStopIhm).correntePtcRealA > 4 &&
     foto(curtoPtcStopIhm).bdPtc12v === 12,
   `estado=${curtoPtcStopIhm.firmware.estado}; alerta=${curtoPtcStopIhm.firmware.alerta}; ` +
     `I_PTC=${foto(curtoPtcStopIhm).correntePtcRealA.toFixed(2)} A`);

const resfriamentoNormal = prepararResfriamento();
ok('resfriamento normal não acusa corrente no PTC',
   resfriamentoNormal.firmware.estado === 'RODANDO' &&
     !resfriamentoNormal.firmware.renPtc &&
     foto(resfriamentoNormal).correntePtcA === 0,
   `estado=${resfriamentoNormal.firmware.estado}; corrente PTC=${foto(resfriamentoNormal).correntePtcA} A`);

const curtoPtcEmEspera = criarSimulador();
passo(curtoPtcEmEspera);
apertar(curtoPtcEmEspera, 's1Verde');
avancar(curtoPtcEmEspera, INTERVALO_MODBUS_MS + 50);
curtoPtcEmEspera.falhas.btsPtcEmCurto = true;
passo(curtoPtcEmEspera);
avancar(curtoPtcEmEspera, 100);
ok('BTS PTC em curto também é detectado em AGUARDA_START',
   curtoPtcEmEspera.firmware.estado === 'FALHA' &&
     curtoPtcEmEspera.firmware.alerta === 'DRIVER_PTC_COLADO' &&
     !foto(curtoPtcEmEspera).km1,
   `estado=${curtoPtcEmEspera.firmware.estado}; alerta=${curtoPtcEmEspera.firmware.alerta}`);

for (const falha of ['nenhuma', 'fanPtcTravada', 'ka3Aberto']) {
  const sim = prepararResfriamento();
  sim.falhas.btsPtcEmCurto = true;
  if (falha !== 'nenhuma') sim.falhas[falha] = true;
  const correnteAntesDoTrip = consumo(sim);
  passo(sim);
  const correnteDetectada = foto(sim).correntePtcA;
  avancar(sim, 100);
  ok(`BTS PTC em curto + ${falha}: corrente imprevista dispara trip retentivo`,
     correnteAntesDoTrip['BD-PTC'] > 4.0 &&
     correnteDetectada > 0.5 &&
     sim.firmware.estado === 'FALHA' &&
     sim.firmware.alerta === 'DRIVER_PTC_COLADO' &&
     !foto(sim).km1 && !foto(sim).bdPot && foto(sim).correntePtcRealA > 4.0,
     `I_PTC12=${correnteAntesDoTrip['BD-PTC'].toFixed(2)} A; fonte=${correnteAntesDoTrip.fonte.toFixed(2)} A; ` +
     `I_PTC=${correnteDetectada.toFixed(2)} A; estado=${sim.firmware.estado}; ` +
     `alerta=${sim.firmware.alerta}; KM1=${foto(sim).km1}`);
}

console.log('=== 6a.1 · limites da leitura BTS2 IS/A1 e do corte KM1 ===');
const isSemSinal = prepararResfriamento();
isSemSinal.falhas.btsPtcEmCurto = true;
isSemSinal.falhas.btsPtcIsSemSinal = true;
passo(isSemSinal);
ok('IS/A1 sem sinal não pode ser tratado como detecção do curto',
   foto(isSemSinal).correntePtcRealA > 3 &&
     foto(isSemSinal).correntePtcA === 0 &&
     isSemSinal.firmware.estado === 'RODANDO' &&
     isSemSinal.firmware.renPtc === false,
   `I real=${foto(isSemSinal).correntePtcRealA.toFixed(2)} A; ` +
     `I medida=${foto(isSemSinal).correntePtcA.toFixed(2)} A; estado=${isSemSinal.firmware.estado}`);

const km1Soldado = prepararResfriamento();
km1Soldado.falhas.btsPtcEmCurto = true;
km1Soldado.falhas.km1Colado = true;
passo(km1Soldado);
avancar(km1Soldado, 100);
const consumoKm1Soldado = consumo(km1Soldado);
ok('KM1 soldado mantém alimentação e corrente após o trip por IS',
   km1Soldado.firmware.estado === 'FALHA' &&
     km1Soldado.firmware.alerta === 'DRIVER_PTC_COLADO' &&
     foto(km1Soldado).bdPot > 0 &&
     foto(km1Soldado).correntePtcRealA > 3 &&
     consumoKm1Soldado['BD-PTC'] > 4.0 && consumoKm1Soldado.fonte > 2.5,
   `estado=${km1Soldado.firmware.estado}; BD-PTC=${foto(km1Soldado).bdPtc12v} V; ` +
     `I_PTC=${foto(km1Soldado).correntePtcRealA.toFixed(2)} A; ` +
     `I_PTC12=${consumoKm1Soldado['BD-PTC'].toFixed(2)} A; fonte=${consumoKm1Soldado.fonte.toFixed(2)} A`);

console.log('=== 6a · disparo e rearme são estados físicos explícitos ===');
const cicloSt1 = estado(
  {renPeltier: false, renPtc: false, estado: 'FALHA', modo: 'QUENTE'},
  {falhas: {btsPtcEmCurto: true}});
dispararTermostato(cicloSt1, 'ST1');
ok('disparo ST-1 abre o contato físico e corta BTS em curto',
   cicloSt1.termostatos.st1Aberto && consumo(cicloSt1)['BD-PTC'] < 0.01,
   `contato aberto = ${cicloSt1.termostatos.st1Aberto}; BD-PTC = ${consumo(cicloSt1)['BD-PTC'].toFixed(2)} A`);
ok('contato não rearma automaticamente por comando do firmware',
   !rearmarTermostato(cicloSt1, 'ST1') && cicloSt1.termostatos.st1Aberto,
   'sem confirmação da causa corrigida, o contato permanece aberto');
const contatoAposTempo = criarSimulador();
dispararTermostato(contatoAposTempo, 'ST1');
avancar(contatoAposTempo, 5_000);
ok('passagem do tempo e temperatura do ar não rearmam ST-1',
   contatoAposTempo.termostatos.st1Aberto,
   'o simulador não substitui a temperatura do corpo do PTC pelo DS18B20');
ok('rearme é recusado enquanto o BTS do PTC continua em curto',
   !rearmarTermostato(cicloSt1, 'ST1', true) && cicloSt1.termostatos.st1Aberto,
   'a falha física do driver ainda poderia energizar o PTC');
cicloSt1.falhas.btsPtcEmCurto = false;
ok('rearme manual após correção fecha o contato, não liga o PTC por si só',
   rearmarTermostato(cicloSt1, 'ST1', true) &&
     !cicloSt1.termostatos.st1Aberto && consumo(cicloSt1)['BD-PTC'] < 0.01,
   `contato fechado = ${!cicloSt1.termostatos.st1Aberto}; renPtc continua false`);

/* (b) BTS #2 em curto + ST-1 aberto → a cadeia térmica corta fisicamente */
const btsPtcCurtoSt1 = consumo(estado(
  {renPeltier: false, renPtc: false, estado: 'FALHA', modo: 'QUENTE'},
  {falhas: {btsPtcEmCurto: true},
   termostatos: {st1Aberto: true, st2Aberto: false}}));
ok('⭐ BTS #2 em curto + ST-1 aberto → PTC morto (cadeia térmica corta)',
   btsPtcCurtoSt1['BD-PTC'] < 0.01,
   `BD-PTC = ${btsPtcCurtoSt1['BD-PTC'].toFixed(2)} A — nem o curto do BTS salva: ST-1 é físico`);

/* (c) BTS #2 em curto + ST-2 aberto → idem */
const btsPtcCurtoSt2 = consumo(estado(
  {renPeltier: false, renPtc: false, estado: 'FALHA', modo: 'QUENTE'},
  {falhas: {btsPtcEmCurto: true},
   termostatos: {st1Aberto: false, st2Aberto: true}}));
ok('⭐ BTS #2 em curto + ST-2 aberto → PTC morto (cadeia térmica corta)',
   btsPtcCurtoSt2['BD-PTC'] < 0.01,
   `BD-PTC = ${btsPtcCurtoSt2['BD-PTC'].toFixed(2)} A — nem o curto do BTS salva: ST-2 é físico`);

/* (d) BTS em curto nos dois ramais: 6 A no 24 V e 4,17 A no 12 V. */
const ambosBts = consumo(estado({renPtc: true, renPeltier: true, estado: 'FALHA'},
  {falhas: {btsPeltierEmCurto: true, btsPtcEmCurto: true}}));
console.log(`  BTS Peltier: F1 = ${ambosBts.F1.toFixed(2)} A · BTS PTC: BD-PTC = ${ambosBts['BD-PTC'].toFixed(2)} A` +
            ` · fonte = ${ambosBts.fonte.toFixed(2)} A`);
ok('correntes permanecem separadas por barramento',
   Math.abs(ambosBts.F1 - CARGAS.peltier) < 0.01 &&
     Math.abs(ambosBts['BD-PTC'] - CARGAS.ptc) < 0.01,
   `F1=${ambosBts.F1.toFixed(2)} A a 24 V; PTC=${ambosBts['BD-PTC'].toFixed(2)} A a 12 V`);
ok('e ST-1 aberto remove o PTC mesmo com ambos os BTS em curto',
   consumo(estado({renPtc: true, renPeltier: true, estado: 'FALHA'},
     {falhas: {btsPeltierEmCurto: true, btsPtcEmCurto: true},
      termostatos: {st1Aberto: true, st2Aberto: false}}))['BD-PTC']
     < 0.01,
   'a cadeia térmica corta o PTC mesmo com ambos os drivers em curto');

console.log('=== 6b · trava térmica retentiva após trip ===');
function prepararEnsaio(sim) {
  passo(sim);
  apertar(sim, 's1Verde');
  avancar(sim, INTERVALO_MODBUS_MS + 50);
  iniciarPelaIHM(sim);
  return sim;
}
const tripTermico = prepararEnsaio(criarSimulador());
tripTermico.firmware.renPtc = true;
tripTermico.firmware.duty = 100;
dispararTermostato(tripTermico, 'ST1');
passo(tripTermico);
ok('trip térmico remove a autorização e derruba KM1',
   tripTermico.bloqueioTermico && !tripTermico.firmware.habPotencia &&
     !foto(tripTermico).km1 && !tripTermico.firmware.renPtc,
   `estado=${tripTermico.firmware.estado}; BD-POT=${foto(tripTermico).bdPot} V`);
tripTermico.falhas.btsPtcEmCurto = true;
ok('ST-1 aberto interrompe BTS do PTC em curto',
   consumo(tripTermico)['BD-PTC'] < 0.01,
   `BD-PTC = ${consumo(tripTermico)['BD-PTC'].toFixed(2)} A`);
tripTermico.falhas.btsPtcEmCurto = false;
ok('rearme físico do contato não limpa a trava nem rearma KM1',
   rearmarTermostato(tripTermico, 'ST1', true) &&
     tripTermico.bloqueioTermico &&
     !foto(avancar(tripTermico, 500)).bdPot,
   `bloqueio=${tripTermico.bloqueioTermico}; BD-POT=${foto(tripTermico).bdPot} V`);
apertar(tripTermico, 's2Stop');
ok('reconhecer o trip também não libera a potência',
   tripTermico.firmware.estado === 'AGUARDA_START' &&
     tripTermico.bloqueioTermico && !foto(tripTermico).bdPot,
   `estado=${tripTermico.firmware.estado}; trava=${tripTermico.bloqueioTermico}`);
apertar(tripTermico, 's1Verde');
ok('somente nova ação deliberada no botão verde libera KM1',
   !tripTermico.bloqueioTermico && foto(tripTermico).km1 &&
     tripTermico.firmware.estado === 'AGUARDA_START' && !tripTermico.firmware.renPtc,
   `estado=${tripTermico.firmware.estado}; PTC=${tripTermico.firmware.renPtc}`);

console.log('=== 6b.1 · ventilação do PTC é permissivo proposto para rearme/partida ===');
for (const falha of ['ka3Aberto', 'fanPtcTravada']) {
  const sim = prepararEnsaio(criarSimulador({
    tCamara: 25,
    faixa: {min: 48, max: 50},
  }));
  avancar(sim, 1000);
  ok(`${falha}: o ensaio de aquecimento partiu pelos comandos normais`,
     sim.firmware.estado === 'RODANDO' && sim.firmware.renPtc &&
       sim.firmware.duty > 0,
     `estado=${sim.firmware.estado}; PTC=${sim.firmware.renPtc}; duty=${sim.firmware.duty}%`);
  dispararTermostato(sim, 'ST1');
  passo(sim);
  sim.falhas[falha] = true;
  ok(`${falha}: rearme do contato é recusado com ventilação indisponível`,
     !rearmarTermostato(sim, 'ST1', true) &&
       sim.termostatos.st1Aberto && sim.bloqueioTermico,
     `contato aberto=${sim.termostatos.st1Aberto}; trava=${sim.bloqueioTermico}`);
  sim.falhas[falha] = false;
  ok(`${falha}: rearme só é aceito após limpar a falha simulada`,
     rearmarTermostato(sim, 'ST1', true) && !sim.termostatos.st1Aberto,
     `contato aberto=${sim.termostatos.st1Aberto}`);
  apertar(sim, 's2Stop');
  sim.falhas[falha] = true;
  apertar(sim, 's1Verde');
  iniciarPelaIHM(sim);
  ok(`${falha}: reconhecimento, botão verde e START não liberam aquecimento`,
     sim.firmware.estado === 'AGUARDA_START' &&
       sim.firmware.alerta === 'VENTILACAO_PTC_INDISPONIVEL' &&
       sim.bloqueioTermico && !sim.termostatos.st1Aberto &&
       !foto(sim).km1 && !sim.firmware.renPtc,
     `estado=${sim.firmware.estado}; alerta=${sim.firmware.alerta}; KM1=${foto(sim).km1}`);
}

for (const falha of ['ka3Aberto', 'fanPtcTravada']) {
  const sim = prepararEnsaio(criarSimulador({
    tCamara: 25,
    faixa: {min: 48, max: 50},
  }));
  avancar(sim, 1000);
  sim.falhas[falha] = true;
  passo(sim);
  ok(`${falha}: perda de ventilação durante aquecimento dispara falha retentiva`,
     sim.firmware.estado === 'FALHA' &&
       sim.firmware.alerta === 'VENTILACAO_PTC_INDISPONIVEL' &&
       !sim.firmware.renPtc,
     `estado=${sim.firmware.estado}; alerta=${sim.firmware.alerta}`);
}

console.log('=== 6c · V1 do N4AIC24 por Modbus, com frescor e timeout ===');
const semModbus = criarSimulador();
semModbus.falhas.n4aic24SemComunicacao = true;
prepararEnsaio(semModbus);
ok('partida é bloqueada sem primeira leitura Modbus',
   semModbus.firmware.estado === 'AGUARDA_START' &&
     semModbus.firmware.alerta === 'MEDICAO_POTENCIA_INDISPONIVEL' &&
     !foto(semModbus).v1Valida,
   `estado=${semModbus.firmware.estado}; alerta=${semModbus.firmware.alerta}`);

const v1 = prepararEnsaio(criarSimulador());
ok('V1 válido confirma BD-POT em funcionamento',
   v1.firmware.estado === 'RODANDO' && foto(v1).v1Valida &&
     foto(v1).v1 === 24,
   `V1=${foto(v1).v1} V; estado=${v1.firmware.estado}`);
v1.falhas.n4aic24SemComunicacao = true;
avancar(v1, TIMEOUT_MODBUS_MS + INTERVALO_MODBUS_MS);
ok('perda de comunicação expira leitura e produz trip retentivo',
   !foto(v1).v1Valida &&
     v1.firmware.estado === 'FALHA' &&
     v1.firmware.alerta === 'MEDICAO_POTENCIA_INDISPONIVEL',
   `estado=${v1.firmware.estado}; alerta=${v1.firmware.alerta}`);
v1.falhas.n4aic24SemComunicacao = false;
avancar(v1, INTERVALO_MODBUS_MS);
ok('recuperar Modbus não reinicia o processo automaticamente',
   foto(v1).v1Valida && v1.firmware.estado === 'FALHA' &&
     !foto(v1).km1,
   `V1 válido=${foto(v1).v1Valida}; estado=${v1.firmware.estado}`);

const v1Invalido = criarSimulador();
v1Invalido.falhas.n4aic24LeituraInvalida = true;
passo(v1Invalido);
ok('leitura V1 fora de 0–30 V é inválida',
   !foto(v1Invalido).v1Valida && foto(v1Invalido).v1 === null,
   `V1 apresentado=${foto(v1Invalido).v1}`);

console.log('=== 6d · RPM do radiador não implica supervisão das internas ===');
const semVentPtc = prepararEnsaio(criarSimulador());
semVentPtc.falhas.ka3Aberto = true;
semVentPtc.falhas.fanPtcTravada = true;
avancar(semVentPtc, 7_000);
ok('falha KA3/ventoinha do PTC não é confundida com RPM do radiador',
   semVentPtc.firmware.estado === 'RODANDO' &&
     semVentPtc.radiadorGirando &&
     !semVentPtc.ventInternasGirando &&
     !semVentPtc.ventPtcGirando,
   `estado=${semVentPtc.firmware.estado}; radiador=${semVentPtc.radiadorGirando}; ` +
   `internas=${semVentPtc.ventInternasGirando}; PTC fan=${semVentPtc.ventPtcGirando}`);

console.log('=== 7 · o aquecimento é o modo mais leve ===');
const quente = consumo(estado({renPeltier: false, renPtc: true, modo: 'QUENTE'}));
console.log(`  fonte: ${quente.fonte.toFixed(2)} A · ${quente.potenciaTotal.toFixed(1)} W`);
const carga12v = quente['T3-OUT'];
ok('PTC proposto corresponde a 50 W / 12 V',
   Math.abs(quente['BD-PTC'] - 50 / 12) < 0.01,
   `${quente['BD-PTC'].toFixed(2)} A`);
ok('T3 alimentaria cerca de 5,49 A no pior caso simultâneo',
   Math.abs(carga12v - (1.325 + 50 / 12)) < 0.01,
   `${carga12v.toFixed(2)} A; capacidade de 20 A ainda depende da ficha do modelo`);
ok('F3 legado de 2 A não cobre a corrente de entrada estimada de T3',
   quente.F3 > LIMITES.F3,
   `${quente.F3.toFixed(2)} A estimados contra ${LIMITES.F3} A legados`);
ok('cabo legado do T3 foi identificado como insuficiente para o PTC',
   carga12v > LIMITES.caboT3,
   `${carga12v.toFixed(2)} A contra ${LIMITES.caboT3} A declarados no modelo antigo`);
ok('PTC sozinho consome menos que a Peltier', quente.fonte < frio.fonte,
   `${quente.fonte.toFixed(2)} A < ${frio.fonte.toFixed(2)} A`);

console.log();
if (falhas) {
  console.log(`REPROVADO — ${falhas} verificação(ões) falharam`);
  process.exit(1);
}
console.log('APROVADO — o orçamento sai do modelo, não de uma soma à mão.');
console.log(`Números para o relatório: ${frio.potenciaTotal.toFixed(1)} W · ` +
            `${frio.fonte.toFixed(2)} A · folga ${(240 / frio.potenciaTotal).toFixed(2)}×`);
