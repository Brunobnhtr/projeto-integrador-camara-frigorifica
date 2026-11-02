import fs from 'node:fs';
import * as model from '../src/data/painel_completo.js';
import * as wiring from '../src/data/fiacao.js';
const clone=structuredClone;
const cs=clone(model.COMPONENTES),fios=clone(wiring.FIOS),channels=clone(model.CANALETAS);
const c=id=>cs.find(c=>c.id===id);
Object.assign(channels.find(k=>k.id==='CV-ac'),{x:0,w:10});
Object.assign(channels.find(k=>k.id==='CH-ac'),{x:0,w:338});
for(const[n,z]of[['T2N','Z6'],['T3N','Z11']])fios.find(f=>f.n===n).para.via=z;
const ks=[...channels,...model.CANALETAS_PORTA];
const endpoint=(a,f)=>a.comp?model.canaletaDoGrupo(c(a.comp),c(a.comp).grupos.find(g=>g.pinos.some(p=>p.nome===a.via))):a.prensa?['CV-ac']:f.classe==='potencia'?['CH-base']:['CV-dir'];
const touch=(a,b)=>{
 if(a.id.startsWith('CP-')!==b.id.startsWith('CP-'))return model.CALHAS.some(k=>(a.id===k.daPlaca&&b.id===k.naPorta)||(b.id===k.daPlaca&&a.id===k.naPorta));
 return a.x<b.x+b.w&&b.x<a.x+a.w&&a.y<b.y+b.h&&b.y<a.y+a.h;
};
for(const f of fios){
 const ac=f.func==='ac'||f.func==='pe';
 const allowed=ks.filter(k=>ac?['CH-ac','CV-ac'].includes(k.id):!['CH-ac','CV-ac'].includes(k.id)&&(f.classe==='sinal'?k.tipo==='sinal':f.classe==='potencia'?k.tipo==='potencia':true));
 let queue=endpoint(f.de,f).filter(id=>allowed.some(k=>k.id===id)).map(id=>[id]);const ends=endpoint(f.para,f).filter(id=>allowed.some(k=>k.id===id));
 if(f.de.comp&&f.de.comp===f.para.comp){f.rota=[];continue;}
 const seen=new Set();let found;
 while(queue.length){const p=queue.shift(),id=p.at(-1);if(ends.includes(id)){found=p;break;}if(seen.has(id))continue;seen.add(id);const a=allowed.find(k=>k.id===id);for(const b of allowed)if(!seen.has(b.id)&&touch(a,b))queue.push([...p,b.id]);}
 if(!found)throw Error(`Sem rota ${f.n}`);f.rota=found;
}
for(const comp of cs)for(const g of comp.grupos)for(const p of g.pinos){delete p.usa;delete p.para;}
for(const f of fios)for(const[a,b]of[[f.de,f.para],[f.para,f.de]])if(a.comp){const p=c(a.comp)?.grupos.flatMap(g=>g.pinos).find(p=>p.nome===a.via);if(!p)throw Error(`Borne ausente ${f.n}`);p.usa=true;p.para=[p.para,b.comp?`${b.comp} · ${b.via}`:b.prensa?`entrada ${b.prensa}`:`${b.camara??b.tampa} · ${b.borne??''}`].filter(Boolean).join('; ');}
for(const comp of cs)for(const g of comp.grupos)for(const p of g.pinos)if(p.para)p.para=p.para.replaceAll('PI-1','módulos de interface');
let src='/** Painel autônomo. Modelo de montagem; medidas e proteções requerem validação das peças reais. */\n';
const data={...Object.fromEntries(Object.entries(model).filter(([,v])=>typeof v!=='function')),COMPONENTES:cs,CANALETAS:channels};
for(const[k,v]of Object.entries(data))src+=`export const ${k}=${JSON.stringify(v,null,2)};\n`;
src+=`export ${model.canaletaDoGrupo.toString()}\n`;
fs.writeFileSync(new URL('../src/data/painel_completo.js',import.meta.url),src);
fs.writeFileSync(new URL('../src/data/fiacao.js',import.meta.url),Object.entries({...wiring,FIOS:fios}).map(([k,v])=>`export const ${k}=${JSON.stringify(v,null,2)};`).join('\n'));
console.log('Rotas, retornos e terminais reconciliados.');
