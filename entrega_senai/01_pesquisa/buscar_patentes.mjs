/* BUSCA DE ANTERIORIDADE POR CLASSIFICAÇÃO — Google Patents
   ==========================================================
   Roda contra o endpoint de consulta do Google Patents, que indexa
   também os documentos brasileiros (BR) do INPI.

   ⭐ POR QUE ESTE SCRIPT EXISTE. Buscar patente por palavra solta devolve
   dezenas de milhares de documentos — foi o "aparece um monte de projeto
   e não dá para olhar todos". A saída é buscar por CLASSIFICAÇÃO
   (IPC/CPC), que é como o examinador trabalha: filtrando por classe, os
   milhares viram dezenas.

   As classes deste projeto:
     G01R 31/28  ensaio de circuitos eletrônicos   <- a mais precisa
     F25B 21/02  refrigeração por efeito Peltier
     G01N 25/00  investigação por meios térmicos
     G05D 23/19  controle automático de temperatura

   COMO RODAR (precisa de um navegador com porta de depuração aberta):
     1) inicie o Edge/Chrome:
        msedge --headless=new --remote-debugging-port=9222 about:blank
     2) node buscar_patentes.mjs

   Os resultados de 21/08/2026 estão registrados em
   02_anterioridade_e_similares.md, parte 4.
*/
const alvos = await (await fetch('http://127.0.0.1:9222/json/list')).json();
const ws = new WebSocket(alvos.find(a => a.type === 'page').webSocketDebuggerUrl);
let id = 0; const pend = new Map();
const cmd = (m, p = {}) => new Promise(r => { const n = ++id; pend.set(n, r); ws.send(JSON.stringify({ id: n, method: m, params: p })); });
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result); pend.delete(m.id); } });
await new Promise(r => ws.addEventListener('open', r));
await cmd('Runtime.enable'); await cmd('Page.enable');
const ev = async x => {
  const r = await cmd('Runtime.evaluate', { expression: x, returnByValue: true, awaitPromise: true });
  if (r?.exceptionDetails) return { erro: r.exceptionDetails.exception?.description?.split('\n')[0] };
  return r?.result?.value;
};
const espera = ms => new Promise(r => setTimeout(r, ms));

await cmd('Page.navigate', { url: 'https://patents.google.com/' });
await espera(4000);

const BUSCAS = [
  { rot: 'O NOSSO DIFERENCIAL · corrente por posicao de ensaio',
    q: 'q=%22burn-in%22+%22current+monitoring%22+%22individual+device%22' },
  { rot: 'O NOSSO DIFERENCIAL · detectar QUAL DUT falhou',
    q: 'q=(test+chamber)+(detect+failed+device)+(current+sensor)' },
  { rot: 'O NOSSO DIFERENCIAL · burn-in + falha individual',
    q: 'q=%22burn-in+board%22+%22failure+detection%22+%22per+device%22' },
  { rot: 'Retrofit · modernizar camara existente com IoT',
    q: 'q=(retrofit)+(environmental+chamber)+(IoT+monitoring)' },
  { rot: 'BR · monitoramento remoto ensaio + IoT',
    q: 'q=(monitoramento+remoto)+(ensaio)+(internet+das+coisas)&country=BR' },
];

for (const b of BUSCAS) {
  const r = await ev(`(async () => {
    const resp = await fetch('/xhr/query?url=' + encodeURIComponent('${b.q}') + '&exp=');
    if (!resp.ok) return 'HTTP ' + resp.status;
    const j = await resp.json();
    const c = j?.results?.cluster?.[0]?.result ?? [];
    const total = j?.results?.total_num_results ?? '?';
    return JSON.stringify({ total, itens: c.slice(0, 6).map(x => ({
      id: x.patent?.publication_number,
      t: (x.patent?.title || '').replace(/<[^>]+>/g, '').slice(0, 88),
      ano: (x.patent?.publication_date || '').slice(0, 4),
      quem: (x.patent?.assignee || '').slice(0, 40),
    })) });
  })()`);
  console.log('\n══', b.rot);
  if (typeof r === 'string' && r.startsWith('{')) {
    const o = JSON.parse(r);
    console.log('   total de resultados:', o.total);
    for (const i of o.itens) console.log(`   • ${i.id} (${i.ano}) ${i.quem ? '· ' + i.quem : ''}\n     ${i.t}`);
  } else {
    console.log('   ', JSON.stringify(r).slice(0, 200));
  }
  await espera(1200);
}
process.exit(0);
