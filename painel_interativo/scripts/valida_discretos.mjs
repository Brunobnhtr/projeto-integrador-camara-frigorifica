/**
 * Confere o CADASTRO ÚNICO DE COMPONENTES DISCRETOS.
 *
 * A regra que mais importa: NENHUM COMPONENTE PODE EXISTIR SÓ EM PROSA.
 * Se ele está no cadastro, tem que ter host de verdade, pernas apontando
 * para parafusos que existem, um porquê, um ensaio e um passo de montagem.
 * E o contrário também vale: componente desenhado numa placa ou pendurado
 * num relé tem que ter registro aqui — senão o guia de montagem o esquece.
 *
 * Os avisos (·) não reprovam. Os erros (X) reprovam e travam a publicação.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DISCRETOS, HOSTS, ARRANJOS, TOTAL_PECAS, FATOS_VIGIADOS } from '../src/data/discretos.js';
import { COMPONENTES } from '../src/data/painel_completo.js';
import { RELES } from '../src/data/reles_fisico.js';
import { TODOS as PASSOS_GUIA, FASES } from '../src/data/guia.js';

const erros = [], avisos = [];

/* ── 1. o que cada lugar aceita como "via" ─────────────────────────── */

/** vias de um componente do painel: todos os pinos declarados nos grupos */
const viasDoPainel = new Map(
  COMPONENTES.map(c => [c.id, new Set((c.grupos ?? []).flatMap(g => g.pinos.map(p => p.nome)))]),
);

/* ⭐ NÃO HÁ MAIS PLACA ILHADA NO PROJETO. A PI-2 saiu com a medição
   analógica e a PI-1 com os módulos comprados (19/08/2026): todo
   componente discreto mora agora em BORNE ou dentro de módulo. */
const viasPlaca = {};

const hostPorId = new Map(HOSTS.map(h => [h.id, h]));

/* ── 2. cada host aponta para algo que existe ──────────────────────── */
for (const h of HOSTS) {
  if (h.compPainel && !viasDoPainel.has(h.compPainel))
    erros.push(`host ${h.id}: compPainel "${h.compPainel}" não existe no painel_completo.js`);
  if (!h.compPainel && !(h.terminais?.length))
    erros.push(`host ${h.id}: está fora do painel e não declara terminais — não há como validar as pernas`);
}

/* ── 3. cada componente, campo por campo ───────────────────────────── */
const OBRIGATORIOS = ['ref', 'peca', 'tipo', 'host', 'arranjo', 'papel', 'porque', 'ensaio', 'passo'];
/* o tipo escolhe o SÍMBOLO do desenho — inventar um tipo novo deixaria a ficha sem figura */
const TIPOS = ['resistor', 'capacitor', 'diodo', 'led', 'ci', 'chave', 'modulo'];
const vistos = new Set();

for (const d of DISCRETOS) {
  const eu = d.id ?? '(sem id)';

  if (!d.id) erros.push('há um componente sem id');
  else if (vistos.has(d.id)) erros.push(`id repetido: ${d.id}`);
  else vistos.add(d.id);

  for (const campo of OBRIGATORIOS)
    if (!d[campo]) erros.push(`${eu}: falta o campo "${campo}"`);

  if (d.tipo && !TIPOS.includes(d.tipo))
    erros.push(`${eu}: tipo "${d.tipo}" não tem símbolo de desenho (use ${TIPOS.join(', ')})`);

  if (d.arranjo && !ARRANJOS[d.arranjo])
    erros.push(`${eu}: arranjo "${d.arranjo}" não existe (use ${Object.keys(ARRANJOS).join(', ')})`);

  /* polaridade exige as duas frases que evitam o erro de montagem */
  if (d.polaridade) {
    if (!d.comoIdentificar) erros.push(`${eu}: tem polaridade e não diz COMO identificá-la`);
    if (!d.seInverter)      erros.push(`${eu}: tem polaridade e não diz o que acontece se inverter`);
  }

  /* pernas */
  const pernas = d.pernas ?? [];
  if (pernas.length < 2) {
    erros.push(`${eu}: precisa de pelo menos 2 pernas declaradas`);
    continue;
  }

  const h = hostPorId.get(d.host);
  if (!h) { erros.push(`${eu}: host "${d.host}" não existe`); continue; }

  for (const p of pernas) {
    if (!p.nome)  erros.push(`${eu}: perna sem nome`);
    if (!p.vai?.comp || !p.vai?.via) { erros.push(`${eu}: perna "${p.nome}" sem destino`); continue; }

    const { comp, via } = p.vai;

    if (viasPlaca[comp]) {                                    // placa ilhada
      if (!viasPlaca[comp].has(via))
        erros.push(`${eu}: perna "${p.nome}" vai para ${comp}/${via}, que não existe na placa`);
    } else if (viasDoPainel.has(comp)) {                       // componente do painel
      if (!viasDoPainel.get(comp).has(via))
        erros.push(`${eu}: perna "${p.nome}" vai para ${comp}/${via} — o ${comp} não tem esse terminal`);
    } else if (hostPorId.has(comp)) {                          // host externo ao painel
      const alvo = hostPorId.get(comp);
      if (!alvo.terminais?.includes(via))
        erros.push(`${eu}: perna "${p.nome}" vai para ${comp}/${via}, que não está nos terminais do host`);
    } else {
      erros.push(`${eu}: perna "${p.nome}" aponta para "${comp}", que não é placa, nem componente do painel, nem host`);
    }
  }
}

/* ── 4. refs repetidas em hosts diferentes ─────────────────────────── */
const porRef = new Map();
DISCRETOS.forEach(d => porRef.set(d.ref, [...(porRef.get(d.ref) ?? []), d]));
for (const [ref, lista] of porRef)
  if (lista.length > 1)
    avisos.push(`a ref "${ref}" é usada por ${lista.length} componentes diferentes `
      + `(${lista.map(d => `${d.id} = ${d.valor}`).join(' · ')}) — renomear evitaria confusão na bancada`);

/* ── 5. nada pode existir só nos cadastros antigos ─────────────────── */
const idsPorRefHost = new Map(DISCRETOS.map(d => [`${d.host}:${d.ref}`, d]));


/* os discretos pendurados nos relés — o D2 é o caso especial: o verbete do
   relé já avisa que ele NÃO fica lá, então o cadastro tem que confirmar isso */
for (const [chave, rele] of Object.entries(RELES))
  for (const c of (rele.discretos ?? [])) {
    const daqui = DISCRETOS.find(d => d.ref === c.ref);
    if (!daqui) { erros.push(`${chave}: o ${c.ref} está em reles_fisico.js e não está no cadastro`); continue; }
    const moraNoRele = daqui.host === rele.comp || daqui.host === chave;
    const dizQueNaoFicaAqui = /NÃO fica aqui/i.test(c.onde ?? '');
    if (!moraNoRele && !dizQueNaoFicaAqui)
      erros.push(`${c.ref}: reles_fisico diz que fica no ${chave}, o cadastro diz host "${daqui.host}"`);
    if (moraNoRele && dizQueNaoFicaAqui)
      erros.push(`${c.ref}: reles_fisico diz que NÃO fica no relé, mas o cadastro põe ele lá`);
  }

/* ── 5b. o guia: todo passo citado existe, e todo passo se prova ───── */
const passos = new Map(PASSOS_GUIA.map(p => [p.id, p]));
for (const d of DISCRETOS)
  if (d.passo && !passos.has(d.passo))
    erros.push(`${d.id}: aponta para o passo "${d.passo}", que não existe no guia`);

for (const p of PASSOS_GUIA) {
  if (!FASES.some(f => f.id === p.fase)) erros.push(`passo ${p.id}: fase "${p.fase}" não existe`);
  for (const campo of ['titulo', 'tempo', 'antes', 'confira', 'seErrar'])
    if (!p[campo]) erros.push(`passo ${p.id}: falta "${campo}" — passo sem isso não guia ninguém`);
  if (!p.faca?.length) erros.push(`passo ${p.id}: não diz o que fazer`);
  if (!p.pegue?.length && !p.fios?.length)
    erros.push(`passo ${p.id}: não diz o que pegar antes de começar`);
  for (const id of (p.discretos ?? []))
    if (!DISCRETOS.some(d => d.id === id))
      erros.push(`passo ${p.id}: cita o componente "${id}", que não está no cadastro`);
}

/* componente que não entra em passo nenhum some da montagem */
for (const d of DISCRETOS)
  if (!PASSOS_GUIA.some(p => (p.discretos ?? []).includes(d.id)))
    avisos.push(`${d.id} (${d.ref}) não aparece em nenhum passo do guia — quem monta não vai vê-lo`);

/* ── 6. os documentos não podem discordar dos fatos já decididos ───── */
const RAIZ = fileURLToPath(new URL('../../', import.meta.url));
const mds = [];
const varre = (dir) => {
  for (const nome of readdirSync(dir)) {
    if (nome.startsWith('.') || nome === 'node_modules' || nome === 'painel_interativo') continue;
    const cheio = join(dir, nome);
    if (statSync(cheio).isDirectory()) varre(cheio);
    /* o plano de refatoração e as referências externas CITAM o que os documentos
       diziam antes — varrê-los acusaria a própria descrição da correção */
    else if (nome.endsWith('.md') && !/PLANO_REFATORACAO|referencias/.test(cheio)) mds.push(cheio);
  }
};
try { varre(RAIZ); } catch { avisos.push('nao consegui varrer os .md a partir de ' + RAIZ); }

const UNIDADES = { '\u03a9': 1, 'k\u03a9': 1e3, 'M\u03a9': 1e6, nF: 1, '\u00b5F': 1e3, uF: 1e3 };
const numero = (txt, uni) => Number(txt.replace(/\./g, '').replace(',', '.')) * UNIDADES[uni];
const curto = a => a.split(/[\\/]/).slice(-2).join('/');

for (const arquivo of mds) {
  const linhas = readFileSync(arquivo, 'utf8').split(/\r?\n/);
  for (const f of FATOS_VIGIADOS) {
    if (f.arquivos && !f.arquivos.test(arquivo)) continue;
    linhas.forEach((linha, i) => {
      if (f.ignoraLinha?.test(linha)) return;   // menção histórica, não contradição
      /* fato de VALOR: a linha fala do assunto e traz um numero fora da lista */
      const falaDoAssunto = [f.linha].flat().filter(Boolean).every(r => r.test(linha));
      if (f.unidade && falaDoAssunto) {
        const uni = f.unidade === '\u03a9' ? 'k\u03a9|M\u03a9|\u03a9' : f.unidade;
        const achados = [...linha.matchAll(new RegExp(`([\\d.,]+)\\s*(${uni})`, 'g'))]
          .map(m => ({ n: numero(m[1], m[2]), txt: m[0] }));
        const fora = achados.filter(a => !f.aceitos.some(ok => Math.abs(a.n - ok) < ok * 0.02));
        if (achados.length && fora.length)
          avisos.push(`${curto(arquivo)}:${i + 1} contraria "${f.id}" — diz `
            + `${fora.map(a => a.txt).join(' / ')}, e a decisao e ${f.diz}`);
      }
      /* fato de TEXTO: a linha fala do assunto e usa uma palavra ja aposentada */
      if (f.texto && f.texto.test(linha) && f.proibido?.test(linha))
        avisos.push(`${curto(arquivo)}:${i + 1} contraria "${f.id}" — ${f.diz}`);
    });
  }
}

/* ── saída ─────────────────────────────────────────────────────────── */
const porHost = HOSTS.map(h => `${h.id}:${DISCRETOS.filter(d => d.host === h.id).length}`).join(' ');
console.log(`discretos: ${DISCRETOS.length} registros · ${TOTAL_PECAS} peças físicas · ${HOSTS.length} lugares`);
console.log(`  . por lugar: ${porHost}`);
console.log(`  . guia: ${PASSOS_GUIA.length} passos em ${FASES.length} fases`);
console.log(`  . documentos varridos: ${mds.length} · fatos vigiados: ${FATOS_VIGIADOS.length}`);
avisos.forEach(a => console.log('  . ' + a));
if (erros.length) {
  console.log('\nERROS:');
  erros.forEach(e => console.log('  X ' + e));
  process.exit(1);
}
console.log('\nOK - todo componente tem lugar, pernas em terminais que existem, ensaio e passo');
