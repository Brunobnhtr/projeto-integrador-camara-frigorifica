/**
 * Experimentos R15: topologia candidata de DOIS contatos em série no PTC.
 * NÃO é aprovação elétrica, nem comprova conformidade física.
 * Conserva baseline original sem corte por padrão.
 * Executar: node scripts/teste_corte_ptc_conceitual.mjs
 */
import assert from 'node:assert/strict';
import {criarSimulador, passo, avancar, apertar, iniciarPelaIHM, pararPelaIHM,
        socarCogumelo, foto, ESTADO} from '../src/sim/index.js';
import {consumo} from '../src/sim/energia.js';
let n=0;
function check(nome, sim, p) {
  const f=foto(sim), c=consumo(sim);
  try {
    assert.ok(p(f,c),JSON.stringify({estado:f.estado,KM1:f.km1,bdPTC:f.bdPtc12v,
      correntePTC:f.correntePtcRealA,fan:f.ventPtcGirando,contatoSeg:f.contatoKptcSeguranca,
      contatoCmd:f.contatoKptcAquecimento}));
    console.log('OK | '+nome);n++;
  } catch(e){console.error('FALHA | '+nome+' | '+e.message);process.exitCode=1}
}
function criar(proposta, aquecimento=false) {
  const s=criarSimulador({cortePtcConceitual:proposta,tCamara:25,faixa:{min:48,max:50}});
  avancar(s,200);
  if (aquecimento) {apertar(s,'s1Verde');iniciarPelaIHM(s);avancar(s,1800)}
  return s;
}
const base=criar(false);base.falhas.btsPtcEmCurto=true;avancar(base,200);
check('baseline preservado: continua perigoso, sem corte físico',base,f=>
  f.bdPtc12v===12&&f.correntePtcRealA>4&&f.estado===ESTADO.FALHA);
const antes=criar(true);antes.falhas.btsPtcEmCurto=true;avancar(antes,200);
check('candidata: sem START, BTS curto não alimenta PTC',antes,f=>
  f.bdPtc12v===0&&f.correntePtcRealA===0&&f.estado===ESTADO.AGUARDA_START);
const aquecer=criar(true,true);
check('candidata: aquecimento legítimo libera os dois contatos',aquecer,f=>
  f.estado===ESTADO.RODANDO&&f.bdPtc12v===12&&f.correntePtcRealA>0);
pararPelaIHM(aquecer);avancar(aquecer,200);aquecer.falhas.btsPtcEmCurto=true;avancar(aquecer,100);
check('candidata: STOP IHM desliga aquecedor mesmo com BTS curto',aquecer,f=>
  f.bdPtc12v===0&&f.correntePtcRealA===0&&f.km1===true);
const emerg=criar(true,true);emerg.falhas.btsPtcEmCurto=true;
socarCogumelo(emerg);avancar(emerg,200);
check('candidata: emergência corta o PTC com BTS curto',emerg,f=>
  f.estado===ESTADO.EMERGENCIA&&f.bdPtc12v===0&&f.correntePtcRealA===0);
const soldadoKm1=criar(true,true);soldadoKm1.falhas.btsPtcEmCurto=true;
soldadoKm1.falhas.km1Colado=true;socarCogumelo(soldadoKm1);avancar(soldadoKm1,200);
check('candidata: KM1 soldado não impede corte do PTC',soldadoKm1,f=>
  f.bdPot===24&&f.bdPtc12v===0&&f.correntePtcRealA===0);
const soldadoS=criar(true,true);soldadoS.falhas.kptcSegurancaColado=true;
soldadoS.falhas.btsPtcEmCurto=true;socarCogumelo(soldadoS);avancar(soldadoS,200);
check('candidata: um contato segurança soldado não impede corte',soldadoS,f=>
  f.contatoKptcSeguranca&& !f.contatoKptcAquecimento&&f.correntePtcRealA===0);
const soldadoE=criar(true,true);soldadoE.falhas.kptcAquecimentoColado=true;
soldadoE.falhas.btsPtcEmCurto=true;socarCogumelo(soldadoE);avancar(soldadoE,200);
check('candidata: um contato comando soldado não impede corte',soldadoE,f=>
  f.contatoKptcAquecimento&&!f.contatoKptcSeguranca&&f.correntePtcRealA===0);
const duplo=criar(true,true);duplo.falhas.kptcSegurancaColado=true;
duplo.falhas.kptcAquecimentoColado=true;duplo.falhas.btsPtcEmCurto=true;
socarCogumelo(duplo);avancar(duplo,200);
check('candidata: dupla soldagem permanece insegura (limite explícito)',duplo,f=>
  f.bdPtc12v===12&&f.correntePtcRealA>4&&f.estado===ESTADO.EMERGENCIA);
// Testes complementares: calor residual não modelado; ventoinha continua KA3.
const limite=criar(true,true);pararPelaIHM(limite);avancar(limite,200);
check('limitação: STOP IHM desliga fan do PTC; cooldown permanece pendente',limite,f=>
  f.ventPtcGirando===false&&f.correntePtcRealA===0);
console.log(`${n} verificações do circuito conceitual passaram; os defeitos remanescentes são documentados.`);
