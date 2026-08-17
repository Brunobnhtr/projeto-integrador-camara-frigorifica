/* Confere o caminho do fio DENTRO da câmara.

   O desenho antes parava no prensa-cabo: a etapa 6 dizia "vai para a
   pastilha" e o risco morria na parede. Agora cada fio tem waypoints em
   milímetros, e é isso que este script põe à prova — porque um caminho
   desenhado à mão erra em quatro lugares e nenhum deles salta aos olhos:

     · o fio passa POR DENTRO de uma peça (na montagem, não passa);
     · dois fios correm no mesmo corredor (viram um risco só na tela);
     · dois fios se cruzam onde dava para não cruzar;
     · o fio entra na câmara por um furo de classe diferente da que
       usou para sair do painel — e aí a segregação se perde no meio.  */

import {
  PECAS3D, TAMPA3D, PRENSAS3D, UTIL3D, ROTAS_CAMARA, EMENDAS_CAMARA,
} from '../src/data/camara.js';
import { FIOS } from '../src/data/fiacao.js';
import {
  caminhoCamara, cruzamentos, BORNES_CAMARA, BORNES_TAMPA, naCamara, naTampa,
} from '../src/lib/rota_camara.js';

let erros = 0, avisos = 0;
const err = m => { console.log('  X ' + m); erros++; };
const avi = m => { console.log('  ! ' + m); avisos++; };
const ok  = m => console.log('  . ' + m);
const EPS = 0.4;                            // mm de tolerância de encosto

const seis = FIOS.filter(f => f.etapa === 6);
const fio = n => seis.find(f => f.n === n);

/* ── 1. todo destino de fora do painel tem borne com nome ──────────── */
console.log('\n=== todo fio chega num borne que existe? ===');
for (const f of seis) {
  const c = naCamara(f), t = naTampa(f);
  if (!c && !t) { err(`${f.n} está na etapa 6 mas não vai para câmara nem tampa`); continue; }
  const k = c ? `${c.camara}.${c.borne}` : `${t.tampa}.${t.borne}`;
  if (c && !BORNES_CAMARA.has(k)) err(`${f.n} → ${k}: esse borne não existe na peça`);
  if (t && !BORNES_TAMPA.has(k)) err(`${f.n} → ${k}: esse borne não existe na tampa`);
}
const emendado = new Set(EMENDAS_CAMARA.flatMap(
  e => [`${e.de.p}.${e.de.b}`, `${e.para.p}.${e.para.b}`]));
for (const k of [...BORNES_CAMARA.keys(), ...BORNES_TAMPA.keys()]) {
  const temFio = seis.some(f => {
    const a = naCamara(f) ?? naTampa(f);
    return `${a.camara ?? a.tampa}.${a.borne}` === k;
  });
  if (!temFio && !emendado.has(k)) err(`o borne ${k} existe mas nenhum fio chega nele`);
  else if (!temFio) ok(`${k}: vem de emenda interna, não tem fio próprio do painel`);
}
ok(`${seis.length} fios, ${BORNES_CAMARA.size + BORNES_TAMPA.size} bornes declarados`);

/* ── 2. quem atravessa a parede tem rota; quem não atravessa, não ──── */
console.log('\n=== quem atravessa a parede tem caminho desenhado? ===');
for (const f of seis) {
  const tem = !!ROTAS_CAMARA[f.n];
  if (naCamara(f) && !tem) err(`${f.n} entra na câmara mas não tem rota em ROTAS_CAMARA`);
  if (naTampa(f) && tem) err(`${f.n} é do lado quente da tampa e não deveria furar parede`);
}
for (const [n, r] of Object.entries(ROTAS_CAMARA)) {
  if (!fio(n)) err(`ROTAS_CAMARA tem ${n}, que não é fio da etapa 6`);
  if (!PRENSAS3D.some(p => p.id === r.pc)) err(`${n} entra por ${r.pc}, que não existe`);
  const d = fio(n) && naCamara(fio(n));
  if (d && r.alvo !== `${d.camara}.${d.borne}`)
    err(`${n}: a rota vai para ${r.alvo} mas a etapa 6 diz ${d.camara}.${d.borne}`);
}
for (const pr of PRENSAS3D) {
  const ns = Object.entries(ROTAS_CAMARA).filter(([, r]) => r.pc === pr.id).map(([n]) => n);
  ok(`${pr.id} (${pr.nome}): ${ns.length} condutores — ${ns.join(', ')}`);
}
ok(`tampa, sem furar parede: ${seis.filter(naTampa).map(f => f.n).join(', ')}`);

/* ── 3. o caminho é ortogonal e cabe no volume útil ────────────────── */
console.log('\n=== o caminho é ortogonal e cabe dentro? ===');
const caminhos = new Map();
for (const n of Object.keys(ROTAS_CAMARA)) {
  const c = caminhoCamara(n);
  if (!c) { err(`${n}: não consegui montar o caminho`); continue; }
  caminhos.set(n, c);
  /* o trecho 1 é o leque saindo do furo: um feixe só, sai na diagonal */
  for (let i = 2; i < c.pontos.length; i++) {
    const [ax, az] = c.pontos[i - 1], [bx, bz] = c.pontos[i];
    if (Math.abs(ax - bx) > EPS && Math.abs(az - bz) > EPS)
      err(`${n}: trecho ${i} sai na diagonal (${ax},${az})→(${bx},${bz})`);
  }
  for (const [x, z] of c.pontos)
    if (x < -EPS || x > UTIL3D.w + EPS || z < -EPS || z > UTIL3D.h + EPS)
      err(`${n}: o ponto (${x},${z}) cai fora do volume útil ${UTIL3D.w}×${UTIL3D.h}`);
}
ok(`${caminhos.size} caminhos, ortogonais depois do leque e dentro do volume`);

/* ── 4. nenhum fio atravessa uma peça ──────────────────────────────── */
console.log('\n=== algum fio passa por dentro de uma peça? ===');
let furos = 0;
for (const [n, c] of caminhos)
  for (let i = 1; i < c.pontos.length; i++) {
    const [ax, az] = c.pontos[i - 1], [bx, bz] = c.pontos[i];
    const sx0 = Math.min(ax, bx), sx1 = Math.max(ax, bx);
    const sz0 = Math.min(az, bz), sz1 = Math.max(az, bz);
    for (const pe of PECAS3D) {
      const [x0, , z0, x1, , z1] = pe.caixa;
      /* interior estrito: encostar na borda é o que o borne faz */
      if (sx1 > x0 + EPS && sx0 < x1 - EPS && sz1 > z0 + EPS && sz0 < z1 - EPS) {
        err(`${n} trecho ${i} atravessa ${pe.id} (${x0}..${x1} × ${z0}..${z1})`); furos++;
      }
    }
  }
if (!furos) ok('nenhum — todo fio contorna as peças e só encosta no borne');

/* ── 5. dois fios no mesmo corredor ────────────────────────────────── */
console.log('\n=== dois fios correm colados? ===');
const seg = [];
for (const [n, c] of caminhos)
  for (let i = 2; i < c.pontos.length; i++)          // o leque é feixe mesmo
    seg.push({ n, a: c.pontos[i - 1], b: c.pontos[i] });
const eH = s => Math.abs(s.a[1] - s.b[1]) <= EPS;
const faixa = (s, e) => [Math.min(s.a[e], s.b[e]), Math.max(s.a[e], s.b[e])];
let sobre = 0;
for (let i = 0; i < seg.length; i++) for (let j = i + 1; j < seg.length; j++) {
  const s = seg[i], t = seg[j];
  if (s.n === t.n || eH(s) !== eH(t)) continue;
  const e = eH(s) ? 1 : 0, o = 1 - e;
  if (Math.abs(s.a[e] - t.a[e]) > EPS) continue;
  const [p0, p1] = faixa(s, o), [q0, q1] = faixa(t, o);
  const ov = Math.min(p1, q1) - Math.max(p0, q0);
  if (ov > 1.5) { err(`${s.n} e ${t.n} correm ${ov.toFixed(1)} mm no MESMO corredor`); sobre++; }
}
if (!sobre) ok('nenhum — cada fio tem o corredor e a coluna dele');

/* ── 6. quem cruza quem, e se o cruzamento se justifica ────────────── */
console.log('\n=== os cruzamentos que sobraram são os inevitáveis? ===');
const cru = cruzamentos(caminhos);
if (!cru.length) ok('nenhum cruzamento');
for (const c of cru) {
  const a = fio(c.h), b = fio(c.v);
  const classes = [a.classe, b.classe].sort().join('+');
  if (classes === 'potencia+sinal' || classes === 'alim+sinal')
    ok(`${c.h} × ${c.v} em (${c.x}, ${c.z}): medição cruzando potência em 90° — `
     + 'é o jeito certo de cruzar, e o desenho mostra o pulinho');
  else
    avi(`${c.h} × ${c.v} em (${c.x}, ${c.z}): ${classes} — dá para desviar?`);
}

/* ── 7. o furo da câmara combina com o prensa-cabo do painel ───────── */
console.log('\n=== o fio muda de classe no meio do caminho? ===');
let trocou = 0;
for (const f of seis) {
  const r = ROTAS_CAMARA[f.n];
  if (!r) continue;
  const par = { 'PG9-2': 'PC-1', 'PG9-3': 'PC-2' }[f.prensa];
  if (par !== r.pc) {
    err(`${f.n} sai do painel pelo ${f.prensa} mas entra na câmara pelo ${r.pc} — `
      + 'potência e medição trocariam de duto no meio do caminho'); trocou++;
  }
}
if (!trocou) ok('não — cada fio entra na câmara pelo furo da própria classe');

console.log(erros ? `\nFALHOU — ${erros} erro(s), ${avisos} aviso(s)`
                  : `\nOK — o fio sai do painel e chega no borne (${avisos} aviso(s))`);
process.exit(erros ? 1 : 0);
