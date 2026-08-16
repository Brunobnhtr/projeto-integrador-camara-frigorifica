import { useState, useRef, useMemo } from 'react';
import { UTIL3D, PRENSAS3D, PECAS3D } from '../data/camara';

/* Câmara em 3D, girável com o mouse.

   Projeção ortográfica feita à mão — sem biblioteca 3D. Para uma caixa
   com caixinhas dentro é o suficiente, e ortográfica é melhor que
   perspectiva num desenho técnico: as medidas não encolhem com a
   distância.

   ⭐ O QUE ESTA VISTA EXISTE PARA MOSTRAR: todos os cabos entram pelo
   FUNDO. A porta abre, e as laterais têm os dutos de circulação — não
   sobra outra parede. São dois prensa-cabos em cantos opostos, um de
   potência e um de sinal.                                             */

const C = { x: UTIL3D.w / 2, y: UTIL3D.d / 2, z: UTIL3D.h / 2 };

const proj = (p, A, E) => {
  const x = p[0] - C.x, y = p[1] - C.y, z = p[2] - C.z;
  const x1 = x * Math.cos(A) - y * Math.sin(A);
  const y1 = x * Math.sin(A) + y * Math.cos(A);
  return { x: x1, y: y1 * Math.sin(E) - z * Math.cos(E),
           d: y1 * Math.cos(E) + z * Math.sin(E) };
};

/* as 6 faces de uma caixa [x0,y0,z0,x1,y1,z1] */
function faces([a, b, c, d, e, f]) {
  const V = (x, y, z) => [x, y, z];
  return [
    { id: 'frente', pts: [V(a, b, c), V(d, b, c), V(d, b, f), V(a, b, f)], luz: 1.00 },
    { id: 'fundo',  pts: [V(a, e, c), V(d, e, c), V(d, e, f), V(a, e, f)], luz: 0.74 },
    { id: 'esq',    pts: [V(a, b, c), V(a, e, c), V(a, e, f), V(a, b, f)], luz: 0.86 },
    { id: 'dir',    pts: [V(d, b, c), V(d, e, c), V(d, e, f), V(d, b, f)], luz: 0.86 },
    { id: 'base',   pts: [V(a, b, c), V(d, b, c), V(d, e, c), V(a, e, c)], luz: 0.66 },
    { id: 'topo',   pts: [V(a, b, f), V(d, b, f), V(d, e, f), V(a, e, f)], luz: 1.12 },
  ];
}

const tom = (hex, f) => {
  const n = parseInt(hex.slice(1), 16);
  const cl = v => Math.max(0, Math.min(255, Math.round(v * f)));
  return `rgb(${cl(n >> 16)},${cl((n >> 8) & 255)},${cl(n & 255)})`;
};

const VISTAS = {
  iso:    { A: -0.62, E: 0.36, nome: '📐 Isométrica' },
  fundo:  { A: 3.14,  E: 0.06, nome: '🔌 De trás — os prensa-cabos' },
  frente: { A: 0,     E: 0.05, nome: '🚪 De frente — a porta' },
  cima:   { A: -0.3,  E: 1.35, nome: '⬇ De cima' },
};

export default function Camara3D() {
  const [ang, setAng] = useState({ A: VISTAS.iso.A, E: VISTAS.iso.E });
  const [sel, setSel] = useState(null);
  const [prensa, setPrensa] = useState(null);
  const [verCabos, setVerCabos] = useState(true);
  const arrasta = useRef(null);

  const P = p => proj(p, ang.A, ang.E);
  const pol = pts => pts.map(p => { const q = P(p); return `${q.x},${q.y}`; }).join(' ');
  const prof = pts => pts.reduce((s, p) => s + P(p).d, 0) / pts.length;

  /* ── o caminho de cada cabo: do prensa-cabo, colado no fundo ──────── */
  const cabos = useMemo(() => PECAS3D.map(pc => {
    const pr = PRENSAS3D.find(x => x.id === pc.pc);
    const [x0, , z0, x1, y1, z1] = pc.caixa;
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    const D = UTIL3D.d;
    return {
      peca: pc.id, cor: pr.cor, pc: pr.id,
      pts: [[pr.x, D + 14, pr.z], [pr.x, D - 6, pr.z], [pr.x, D - 6, cz],
            [cx, D - 6, cz], [cx, Math.min(y1, D - 6), cz]],
    };
  }), []);

  const aoDescer = e => { arrasta.current = { x: e.clientX, y: e.clientY, ...ang }; };
  const aoMover = e => {
    if (!arrasta.current) return;
    const d = arrasta.current;
    setAng({
      A: d.A + (e.clientX - d.x) * 0.008,
      E: Math.max(-1.45, Math.min(1.45, d.E + (e.clientY - d.y) * 0.006)),
    });
  };
  const aoSoltar = () => { arrasta.current = null; };

  /* ── tudo o que vai para a tela, ordenado do fundo para a frente ─── */
  const desenhos = [];
  const casca = faces([-38, -8, -8, UTIL3D.w + 38, UTIL3D.d + 8, UTIL3D.h + 8]);
  const util = faces([0, 0, 0, UTIL3D.w, UTIL3D.d, UTIL3D.h]);

  casca.forEach(f => desenhos.push({ tipo: 'casca', f, d: prof(f.pts) }));
  util.forEach(f => desenhos.push({ tipo: 'util', f, d: prof(f.pts) }));
  PECAS3D.forEach(p => faces(p.caixa).forEach(f =>
    desenhos.push({ tipo: 'peca', peca: p, f, d: prof(f.pts) })));
  if (verCabos) cabos.forEach(c => desenhos.push({ tipo: 'cabo', c, d: prof(c.pts) + 400 }));
  PRENSAS3D.forEach(pr => desenhos.push({
    tipo: 'prensa', pr, d: proj([pr.x, UTIL3D.d + 14, pr.z], ang.A, ang.E).d + 900 }));
  desenhos.sort((a, b) => b.d - a.d);

  /* nada selecionado = tudo aceso; peça selecionada = só ela;
     prensa-cabo selecionado = tudo o que passa por ele */
  const aceso = id => {
    if (sel) return id === sel;
    if (prensa) return PECAS3D.find(p => p.id === id)?.pc === prensa;
    return true;
  };

  const info = sel ? PECAS3D.find(p => p.id === sel) : null;
  const infoPr = prensa ? PRENSAS3D.find(p => p.id === prensa) : null;

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflow: 'auto', padding: 16, background: '#eef1f5' }}>
        <div style={{ display: 'flex', gap: 7, marginBottom: 10, flexWrap: 'wrap' }}>
          {Object.entries(VISTAS).map(([id, v]) => (
            <button key={id} onClick={() => setAng({ A: v.A, E: v.E })} style={{
              background: '#fff', color: '#1d3557', border: '2px solid #1d3557',
              borderRadius: 7, padding: '7px 12px', cursor: 'pointer',
              fontSize: 12, fontWeight: 700 }}>{v.nome}</button>
          ))}
          <button onClick={() => setVerCabos(!verCabos)} style={{
            background: verCabos ? '#495057' : '#fff',
            color: verCabos ? '#fff' : '#495057', border: '2px solid #495057',
            borderRadius: 7, padding: '7px 12px', cursor: 'pointer',
            fontSize: 12, fontWeight: 700 }}>🔌 Cabos</button>
          {(sel || prensa) && (
            <button onClick={() => { setSel(null); setPrensa(null); }} style={{
              background: '#fff3bf', border: '2px solid #f59f00', borderRadius: 7,
              padding: '7px 12px', cursor: 'pointer', fontSize: 12,
              fontWeight: 700 }}>ver tudo</button>
          )}
        </div>

        <div style={{ background: '#fff3bf', borderRadius: 6, padding: '8px 11px',
                      fontSize: 12, marginBottom: 10, lineHeight: 1.5 }}>
          🖱️ <b>Arraste para girar.</b> Todos os cabos entram pelo <b>fundo</b> — a porta
          abre e as laterais têm os dutos de circulação, então não sobra outra parede.
        </div>

        <svg viewBox="-260 -230 520 460"
             onMouseDown={aoDescer} onMouseMove={aoMover}
             onMouseUp={aoSoltar} onMouseLeave={aoSoltar}
             style={{ width: '100%', background: '#fff', borderRadius: 8,
                      boxShadow: '0 1px 6px #0002',
                      cursor: arrasta.current ? 'grabbing' : 'grab',
                      userSelect: 'none' }}>
          {desenhos.map((o, i) => {
            if (o.tipo === 'casca')
              return <polygon key={i} points={pol(o.f.pts)} fill="#adb5bd"
                              fillOpacity={0.07} stroke="#868e96" strokeWidth={0.7}
                              strokeDasharray="5 4" />;
            if (o.tipo === 'util')
              return <polygon key={i} points={pol(o.f.pts)}
                              fill={o.f.id === 'fundo' ? '#dbe4ff' : '#e7f5ff'}
                              fillOpacity={o.f.id === 'fundo' ? 0.62 : 0.24}
                              stroke="#4dabf7" strokeWidth={1.1} />;
            if (o.tipo === 'peca') {
              const on = aceso(o.peca.id);
              return (
                <polygon key={i} points={pol(o.f.pts)}
                         onClick={() => setSel(sel === o.peca.id ? null : o.peca.id)}
                         fill={tom(o.peca.cor, o.f.luz)} fillOpacity={on ? 0.95 : 0.1}
                         stroke={on ? '#212529' : 'none'} strokeWidth={0.5}
                         style={{ cursor: 'pointer' }} />
              );
            }
            if (o.tipo === 'cabo') {
              const on = aceso(o.c.peca);
              return (
                <polyline key={i} points={pol(o.c.pts)} fill="none" stroke={o.c.cor}
                          strokeWidth={on ? 2.4 : 1} strokeLinejoin="round"
                          strokeLinecap="round" opacity={on ? 0.95 : 0.1} />
              );
            }
            const q = P([o.pr.x, UTIL3D.d + 14, o.pr.z]);
            const on = !prensa || prensa === o.pr.id;
            return (
              <g key={i} onClick={() => { setPrensa(prensa === o.pr.id ? null : o.pr.id);
                                          setSel(null); }}
                 style={{ cursor: 'pointer' }} opacity={on ? 1 : 0.25}>
                <circle cx={q.x} cy={q.y} r={9} fill={o.pr.cor} />
                <circle cx={q.x} cy={q.y} r={4} fill="#fff" />
                <text x={q.x} y={q.y - 13} textAnchor="middle" fontSize={10}
                      fontWeight="700" fill={o.pr.cor}>{o.pr.id}</text>
                <text x={q.x} y={q.y + 22} textAnchor="middle" fontSize={8.5}
                      fill={o.pr.cor}>{o.pr.nome}</text>
              </g>
            );
          })}
        </svg>
      </div>

      <div style={{ width: 320, borderLeft: '1px solid #dee2e6', background: '#fff',
                    overflow: 'auto', padding: 16 }}>
        {!info && !infoPr && (
          <>
            <h3 style={{ margin: '0 0 9px', fontSize: 15, color: '#1d3557' }}>
              A câmara por fora e por dentro
            </h3>
            <p style={{ fontSize: 12.5, lineHeight: 1.6, color: '#495057' }}>
              Arraste para girar. Clique numa peça ou num prensa-cabo para isolar o que
              passa por ele.
            </p>
            {PRENSAS3D.map(pr => (
              <button key={pr.id} onClick={() => setPrensa(pr.id)} style={{
                display: 'block', width: '100%', textAlign: 'left', marginBottom: 7,
                background: '#fff', border: `2px solid ${pr.cor}`, borderRadius: 7,
                padding: '9px 11px', cursor: 'pointer' }}>
                <b style={{ fontSize: 12.5, color: pr.cor }}>{pr.id} · {pr.nome}</b>
                <div style={{ fontSize: 11, color: '#495057', marginTop: 3,
                              lineHeight: 1.45 }}>{pr.diz}</div>
              </button>
            ))}
            <div style={{ background: '#f8f9fa', borderLeft: '3px solid #495057',
                          padding: 10, borderRadius: 4, fontSize: 11.5, lineHeight: 1.55,
                          marginTop: 4 }}>
              <b>Por que tudo entra pelo fundo:</b> a <b>frente</b> é a porta e precisa
              abrir; as <b>laterais</b> são os dutos de circulação de 30 mm; o <b>topo</b>
              {' '}tem as Peltier e os dissipadores; a <b>base</b> tem o dreno de
              condensado. Sobra o fundo — e é lá que ficam os dois prensa-cabos, em cantos
              opostos.
            </div>
          </>
        )}

        {infoPr && (
          <>
            <button onClick={() => setPrensa(null)} style={{ background: '#f1f3f5',
              border: '1px solid #ced4da', borderRadius: 5, padding: '4px 10px',
              cursor: 'pointer', fontSize: 11, marginBottom: 10 }}>← voltar</button>
            <h3 style={{ margin: '0 0 6px', fontSize: 15, color: infoPr.cor }}>
              {infoPr.id} · {infoPr.nome}
            </h3>
            <p style={{ fontSize: 12, lineHeight: 1.55, color: '#495057' }}>{infoPr.diz}</p>
            <div style={{ fontSize: 11, color: '#868e96', margin: '12px 0 5px',
                          letterSpacing: 0.4 }}>ALIMENTA</div>
            {PECAS3D.filter(p => p.pc === infoPr.id).map(p => (
              <div key={p.id} onClick={() => { setSel(p.id); setPrensa(null); }}
                   style={{ fontSize: 12, padding: '5px 8px', marginBottom: 3,
                            borderRadius: 4, cursor: 'pointer', background: '#f8f9fa',
                            borderLeft: `3px solid ${p.cor}` }}>{p.nome}</div>
            ))}
          </>
        )}

        {info && (
          <>
            <button onClick={() => setSel(null)} style={{ background: '#f1f3f5',
              border: '1px solid #ced4da', borderRadius: 5, padding: '4px 10px',
              cursor: 'pointer', fontSize: 11, marginBottom: 10 }}>← voltar</button>
            <h3 style={{ margin: '0 0 6px', fontSize: 15, color: info.cor }}>{info.nome}</h3>
            <p style={{ fontSize: 12.5, lineHeight: 1.55, color: '#495057' }}>{info.diz}</p>
            <div style={{ fontSize: 11.5, background: '#f8f9fa', borderRadius: 5,
                          padding: 9, marginTop: 8, lineHeight: 1.6 }}>
              <b>Cabo entra pelo:</b>{' '}
              <span style={{ color: PRENSAS3D.find(p => p.id === info.pc).cor,
                             fontWeight: 700 }}>{info.pc}</span>
              <br />
              <b>Ocupa:</b> {info.caixa[3] - info.caixa[0]} ×{' '}
              {info.caixa[4] - info.caixa[1]} × {info.caixa[5] - info.caixa[2]} mm
              <br />
              <b>Altura da base:</b> {info.caixa[2]} mm
              {info.fora && (
                <><br /><b style={{ color: '#e8590c' }}>Fica FORA do volume útil</b>,
                dentro do duto lateral.</>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
