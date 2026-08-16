import { useState, useMemo } from 'react';
import { CAIXA, PLACA, TRILHOS, COMPONENTES } from '../data/painel_completo';

/* O painel visto de frente, com a porta aberta ao lado.
   Cada terminal é um quadrado com o ID dentro, na borda onde ele fica
   de verdade no componente. Tudo em milímetros.                        */

const PASSO_MIN = 3.6;   // mm entre centros de terminais
const LADO_T = 3.0;      // mm do quadradinho

/* Distribui os terminais de um grupo ao longo da borda que ele ocupa. */
function posicoes(c, g) {
  const n = g.pinos.length;
  const linhas = g.linhas ?? 1;
  const porLinha = Math.ceil(n / linhas);
  const vert = g.lado === 'esquerda' || g.lado === 'direita';
  const compr = vert ? c.altura : c.largura;
  const passo = Math.max(1.9, Math.min(PASSO_MIN, (compr - 4) / porLinha));
  const inicio = (compr - (porLinha - 1) * passo) / 2;

  return g.pinos.map((p, i) => {
    const lin = Math.floor(i / porLinha);
    const col = i % porLinha;
    const desl = inicio + col * passo;
    const rec = 3.4 + lin * 4.2;           // recuo por linha, para dentro
    if (g.lado === 'cima')     return { ...p, x: c.x + desl, y: c.y + rec, passo };
    if (g.lado === 'baixo')    return { ...p, x: c.x + desl, y: c.y + c.altura - rec, passo };
    if (g.lado === 'esquerda') return { ...p, x: c.x + rec, y: c.y + desl, passo };
    return { ...p, x: c.x + c.largura - rec, y: c.y + desl, passo };
  });
}

export default function VistaPainelInterno() {
  const [sel, setSel] = useState(null);      // componente
  const [pino, setPino] = useState(null);    // terminal
  const [zoom, setZoom] = useState(2.2);
  const [soUsados, setSoUsados] = useState(false);

  /* posiciona cada componente no seu trilho */
  const comps = useMemo(() => COMPONENTES.map(c => {
    const t = TRILHOS.find(x => x.n === c.trilho);
    const y = c.porta ? c.y : t.y - c.altura / 2;
    const x = c.porta ? CAIXA.largura + 40 + c.x : PLACA.x + c.x;
    return { ...c, x, y };
  }), []);

  const larguraTotal = CAIXA.largura + 40 + 250;

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflow: 'auto', padding: 14, background: '#eef1f5' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10,
                      background: '#fff', padding: '8px 13px', borderRadius: 7,
                      flexWrap: 'wrap' }}>
          <b style={{ fontSize: 13 }}>Painel por dentro · {CAIXA.largura} × {CAIXA.altura} mm</b>
          <label style={{ fontSize: 11.5, color: '#495057', display: 'flex', gap: 5 }}>
            <input type="checkbox" checked={soUsados}
                   onChange={e => setSoUsados(e.target.checked)} />
            só os terminais usados
          </label>
          <input type="range" min={1.2} max={6} step={0.1} value={zoom}
                 onChange={e => setZoom(+e.target.value)}
                 style={{ flex: 1, minWidth: 110, maxWidth: 260 }} />
          <span style={{ fontSize: 11, color: '#868e96' }}>
            zoom {zoom.toFixed(1)}× — aumente para ler os IDs
          </span>
        </div>

        <svg width={larguraTotal * zoom}
             viewBox={`-14 -14 ${larguraTotal + 28} ${CAIXA.altura + 42}`}
             style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 6px #0002' }}>

          {/* caixa e placa de montagem */}
          <rect x={0} y={0} width={CAIXA.largura} height={CAIXA.altura} rx={4}
                fill="#dee2e6" stroke="#868e96" strokeWidth={2} />
          <rect x={PLACA.x} y={PLACA.y} width={PLACA.largura} height={PLACA.altura}
                rx={2} fill="#e9ecef" stroke="#ced4da" strokeWidth={1} />

          {/* trilhos DIN */}
          {TRILHOS.map(t => (
            <g key={t.n}>
              <rect x={PLACA.x + 4} y={t.y - 5} width={PLACA.largura - 8} height={10}
                    rx={1} fill="#b8bcc0" stroke="#868e96" strokeWidth={0.6} />
              <text x={PLACA.x + 6} y={t.y - 38} fontSize={7} fontWeight="700" fill="#8895a6">
                {t.nome}
              </text>
            </g>
          ))}

          {/* porta */}
          <rect x={CAIXA.largura + 40} y={0} width={250} height={CAIXA.altura} rx={4}
                fill="#e9ecef" stroke="#868e96" strokeWidth={2} />
          {[70, 240, 410].map(hy => (
            <rect key={hy} x={CAIXA.largura + 36} y={hy} width={8} height={26} rx={2}
                  fill="#adb5bd" />
          ))}
          <text x={CAIXA.largura + 165} y={14} textAnchor="middle" fontSize={8}
                fontWeight="700" fill="#495057">PORTA — vista de dentro</text>

          {/* componentes */}
          {comps.map(c => {
            const ativo = sel?.id === c.id;
            return (
              <g key={c.id}>
                <rect x={c.x} y={c.y} width={c.largura} height={c.altura} rx={2}
                      fill="#2b3035" stroke={ativo ? '#ffd43b' : c.cor}
                      strokeWidth={ativo ? 2.2 : 1}
                      onClick={() => { setSel(c); setPino(null); }}
                      style={{ cursor: 'pointer' }} />
                <rect x={c.x} y={c.y} width={c.largura} height={5} fill={c.cor} />
                <text x={c.x + c.largura / 2} y={c.y + c.altura / 2 + 2}
                      textAnchor="middle" fontSize={5} fontWeight="700" fill="#e9ecef"
                      onClick={() => { setSel(c); setPino(null); }}
                      style={{ cursor: 'pointer', pointerEvents: 'none' }}>
                  {c.id}
                </text>

                {/* terminais: quadrado com o ID dentro */}
                {c.grupos.flatMap(g => posicoes(c, g).map(p => {
                  if (soUsados && !p.usa) return null;
                  const k = `${c.id}.${g.ref}.${p.nome}`;
                  const on = pino === k;
                  const l = Math.min(LADO_T, p.passo - 0.5);
                  return (
                    <g key={k} onClick={e => { e.stopPropagation(); setSel(c); setPino(k); }}
                       style={{ cursor: 'pointer' }}>
                      <rect x={p.x - l / 2} y={p.y - l / 2} width={l} height={l} rx={0.3}
                            fill={on ? '#ffd43b' : (p.usa ? '#e9c46a' : '#5c6268')}
                            stroke={on ? '#e8590c' : '#1a1d20'} strokeWidth={on ? 0.7 : 0.25} />
                      <text x={p.x} y={p.y + l * 0.33} textAnchor="middle"
                            fontSize={l * 0.62} fontWeight="700"
                            fill={p.usa || on ? '#1a1d20' : '#9aa0a6'}
                            style={{ pointerEvents: 'none' }}>
                        {p.nome.replace(/^(GPIO|GPI)\s*/, '').replace(/ ·.*$/, '')}
                      </text>
                    </g>
                  );
                }))}
              </g>
            );
          })}
        </svg>

        <p style={{ fontSize: 11.5, color: '#868e96', marginTop: 9 }}>
          Quadrado <b style={{ color: '#c9a227' }}>amarelo</b> = terminal usado pelo
          projeto · <b style={{ color: '#5c6268' }}>cinza</b> = existe no componente e
          está livre. Clique num quadrado para ver onde ele vai.
        </p>
      </div>

      <aside style={{ width: 380, background: '#fff', borderLeft: '1px solid #dee2e6',
                      overflowY: 'auto', flexShrink: 0 }}>
        {!sel && (
          <div style={{ padding: 16 }}>
            <h3 style={{ fontSize: 12, margin: '0 0 10px', color: '#868e96',
                         letterSpacing: 0.4 }}>INVENTÁRIO DE TERMINAIS</h3>
            {TRILHOS.map(t => {
              const cs = COMPONENTES.filter(c => c.trilho === t.n);
              const larg = cs.reduce((s, c) => s + c.largura, 0);
              return (
                <div key={t.n} style={{ marginBottom: 13 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1d3557' }}>
                    {t.nome}
                  </div>
                  <div style={{ fontSize: 11, color: '#868e96', marginBottom: 4 }}>
                    {larg} de 360 mm · sobram {360 - larg} mm
                  </div>
                  {cs.map(c => {
                    const ps = c.grupos.flatMap(g => g.pinos);
                    const u = ps.filter(p => p.usa).length;
                    return (
                      <div key={c.id} onClick={() => setSel(c)} style={{
                        fontSize: 11.5, padding: '4px 8px', marginBottom: 2,
                        borderRadius: 4, cursor: 'pointer', background: '#f8f9fa',
                        borderLeft: `3px solid ${c.cor}`, display: 'flex',
                        justifyContent: 'space-between',
                      }}>
                        <span>{c.id}</span>
                        <span style={{ color: u === ps.length ? '#c92a2a' : '#868e96' }}>
                          {u}/{ps.length}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1d3557' }}>PORTA</div>
            {COMPONENTES.filter(c => c.porta).map(c => {
              const ps = c.grupos.flatMap(g => g.pinos);
              return (
                <div key={c.id} onClick={() => setSel(c)} style={{
                  fontSize: 11.5, padding: '4px 8px', marginBottom: 2, borderRadius: 4,
                  cursor: 'pointer', background: '#f8f9fa',
                  borderLeft: `3px solid ${c.cor}`, display: 'flex',
                  justifyContent: 'space-between',
                }}>
                  <span>{c.id}</span>
                  <span style={{ color: '#868e96' }}>
                    {ps.filter(p => p.usa).length}/{ps.length}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {sel && (
          <>
            <div style={{ background: sel.cor, color: '#fff', padding: '13px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <b style={{ fontSize: 15 }}>{sel.nome}</b>
                <button onClick={() => { setSel(null); setPino(null); }} style={{
                  background: '#ffffff33', color: '#fff', border: 'none', borderRadius: 5,
                  width: 25, height: 25, cursor: 'pointer' }}>×</button>
              </div>
              <div style={{ fontSize: 11, opacity: 0.9, marginTop: 3 }}>
                {sel.largura} × {sel.altura} mm ·{' '}
                {sel.grupos.flatMap(g => g.pinos).filter(p => p.usa).length} de{' '}
                {sel.grupos.flatMap(g => g.pinos).length} terminais em uso
              </div>
            </div>
            <div style={{ padding: '12px 16px' }}>
              {sel.nota && (
                <div style={{ fontSize: 12, color: '#495057', lineHeight: 1.55,
                              marginBottom: 12 }}>{sel.nota}</div>
              )}
              {sel.grupos.map(g => (
                <div key={g.ref} style={{ marginBottom: 13 }}>
                  <div style={{ fontSize: 11, color: '#868e96', marginBottom: 5 }}>
                    <b style={{ color: '#212529' }}>{g.ref}</b> · {g.legenda} ·{' '}
                    borda {g.lado}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    {g.pinos.map((p, i) => {
                      const k = `${sel.id}.${g.ref}.${p.nome}`;
                      const on = pino === k;
                      return (
                        <button key={i} onClick={() => setPino(on ? null : k)}
                          title={p.para ?? 'livre'}
                          style={{
                            fontSize: 10, padding: '3px 5px', borderRadius: 3,
                            cursor: 'pointer', fontFamily: 'monospace',
                            border: `1px solid ${on ? '#e8590c' : '#ced4da'}`,
                            background: on ? '#ffd43b' : (p.usa ? '#fff3bf' : '#f1f3f5'),
                            color: p.usa ? '#212529' : '#adb5bd',
                            fontWeight: p.usa ? 700 : 400,
                          }}>{p.nome}</button>
                      );
                    })}
                  </div>
                  {g.pinos.some(p => pino === `${sel.id}.${g.ref}.${p.nome}`) && (() => {
                    const p = g.pinos.find(x => pino === `${sel.id}.${g.ref}.${x.nome}`);
                    return (
                      <div style={{ marginTop: 7, padding: '8px 10px', borderRadius: 5,
                                    background: p.usa ? '#fff9db' : '#f1f3f5',
                                    border: `1px solid ${p.usa ? '#ffe066' : '#dee2e6'}`,
                                    fontSize: 11.5, lineHeight: 1.5 }}>
                        <b>{p.nome}</b>{' '}
                        {p.usa
                          ? <>→ <span style={{ color: '#7a5c00' }}>{p.para}</span></>
                          : <span style={{ color: '#868e96' }}>— livre, sem uso no projeto</span>}
                      </div>
                    );
                  })()}
                </div>
              ))}
              {sel.avisos?.map((a, i) => (
                <div key={i} style={{ fontSize: 11.5, lineHeight: 1.55, padding: '9px 11px',
                                      borderRadius: 6, marginBottom: 7,
                                      background: a.startsWith('🔥') || a.startsWith('⚠️')
                                        ? '#fff5f5' : '#f8f9fa',
                                      color: a.startsWith('🔥') || a.startsWith('⚠️')
                                        ? '#c92a2a' : '#343a40' }}>{a}</div>
              ))}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
