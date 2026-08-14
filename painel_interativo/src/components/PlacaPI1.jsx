import { useState, useMemo } from 'react';
import {
  PASSO, PLACA, BORNES, BARRAMENTO_0V, COMPONENTES_PI1, CI1, NOS, JUMPERS,
  CIRCUITOS, ORDEM_MONTAGEM,
} from '../data/pi1_fisico';

/* Tudo aqui é desenhado em MILÍMETROS. O SVG faz a conversão para pixels,
   então o desenho é dimensionalmente verdadeiro em qualquer zoom. */
const X = c => c * PASSO;
const Y = l => l * PASSO;
const corDe = id => CIRCUITOS.find(c => c.id === id)?.cor ?? '#868e96';

/* ── furos ─────────────────────────────────────────────────────────── */
function Furos({ ocupados }) {
  const furos = [];
  for (let c = 1; c <= PLACA.colunas; c++) {
    for (let l = 1; l <= PLACA.linhas; l++) {
      const k = `${c},${l}`;
      const usado = ocupados.has(k);
      furos.push(
        <g key={k}>
          {/* ilha de cobre — na placa ILHADA cada furo é isolado dos outros */}
          <circle cx={X(c)} cy={Y(l)} r={0.95}
                  fill={usado ? '#e8b04b' : '#c9a227'} opacity={usado ? 1 : 0.33} />
          <circle cx={X(c)} cy={Y(l)} r={0.45} fill="#4a3c10" opacity={0.85} />
        </g>,
      );
    }
  }
  return <g>{furos}</g>;
}

/* ── componentes discretos ─────────────────────────────────────────── */
function Resistor({ c, ativo, onClick }) {
  const [[c1, l1], [c2, l2]] = c.furos;
  const x1 = X(c1), y1 = Y(l1), x2 = X(c2), y2 = Y(l2);
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  const comp = Math.hypot(x2 - x1, y2 - y1);
  const corpo = Math.min(6.5, comp - 3);
  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }} opacity={ativo ? 1 : 0.35}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#adb5bd" strokeWidth={0.55} />
      <g transform={`translate(${mx} ${my}) rotate(${ang})`}>
        <rect x={-corpo / 2} y={-1.35} width={corpo} height={2.7} rx={1.1}
              fill="#c9b28a" stroke={ativo ? corDe(c.circuito) : '#8d7c5e'}
              strokeWidth={ativo ? 0.5 : 0.3} />
        {/* faixas de código de cores — decorativas; o valor real está no rótulo */}
        {[-1.5, -0.4, 0.7].map((d, i) => (
          <rect key={i} x={d} y={-1.35} width={0.55} height={2.7}
                fill={['#7a4b28', '#2b2b2b', '#b34a2f'][i]} opacity={0.8} />
        ))}
      </g>
      <text x={mx} y={my - 2.6} textAnchor="middle" fontSize={2.1}
            fontWeight="700" fill={corDe(c.circuito)}>{c.ref}</text>
      <text x={mx} y={my + 4.3} textAnchor="middle" fontSize={1.85} fill="#495057">
        {c.valor}
      </text>
    </g>
  );
}

function Capacitor({ c, ativo, onClick }) {
  const [[c1, l1], [c2, l2]] = c.furos;
  const x1 = X(c1), y1 = Y(l1), x2 = X(c2), y2 = Y(l2);
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }} opacity={ativo ? 1 : 0.35}>
      <line x1={x1} y1={y1} x2={mx} y2={my} stroke="#adb5bd" strokeWidth={0.55} />
      <line x1={x2} y1={y2} x2={mx} y2={my} stroke="#adb5bd" strokeWidth={0.55} />
      {/* cerâmico de disco visto de lado */}
      <ellipse cx={mx} cy={my} rx={2.5} ry={1.9} fill="#2d6cb5"
               stroke={ativo ? corDe(c.circuito) : '#1e4a7d'}
               strokeWidth={ativo ? 0.5 : 0.3} />
      <text x={mx} y={my + 0.65} textAnchor="middle" fontSize={1.5}
            fill="#fff" fontWeight="700">104</text>
      <text x={mx + 3.4} y={my - 1.2} fontSize={2.1} fontWeight="700"
            fill={corDe(c.circuito)}>{c.ref}</text>
      <text x={mx + 3.4} y={my + 1.4} fontSize={1.8} fill="#495057">{c.valor}</text>
    </g>
  );
}

/* ── o CI no soquete ───────────────────────────────────────────────── */
function CircuitoIntegrado({ ativo, onClick }) {
  const x1 = X(CI1.colEsq) - PASSO / 2, x2 = X(CI1.colDir) + PASSO / 2;
  const y1 = Y(CI1.linhaTopo) - PASSO / 2, y2 = Y(CI1.linhaBase) + PASSO / 2;
  const cor = corDe(4);
  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }} opacity={ativo ? 1 : 0.35}>
      {/* soquete */}
      <rect x={x1 - 0.8} y={y1 - 0.8} width={x2 - x1 + 1.6} height={y2 - y1 + 1.6}
            rx={0.6} fill="#2b2b2b" stroke="#000" strokeWidth={0.3} />
      {/* corpo do chip */}
      <rect x={x1} y={y1} width={x2 - x1} height={y2 - y1} rx={0.5}
            fill="#3a3a3a" stroke={ativo ? cor : '#111'} strokeWidth={ativo ? 0.6 : 0.3} />
      {/* CHANFRO — à direita nesta montagem */}
      <path d={`M ${x2} ${(y1 + y2) / 2 - 2.2} A 2.2 2.2 0 0 0 ${x2} ${(y1 + y2) / 2 + 2.2}`}
            fill="#1a1a1a" stroke="#666" strokeWidth={0.25} />
      <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 + 0.8} textAnchor="middle"
            fontSize={2.4} fill="#f1f3f5" fontWeight="700">ULN2803A</text>
      {/* pinos */}
      {CI1.pinos.map(p => (
        <g key={p.n}>
          <rect x={X(p.col) - 0.62} y={Y(p.lin) - 0.62} width={1.24} height={1.24}
                fill={p.livre ? '#868e96' : '#e9c46a'} rx={0.15} />
          <text x={X(p.col)} y={p.lin === CI1.linhaTopo ? Y(p.lin) - 2.0 : Y(p.lin) + 3.3}
                textAnchor="middle" fontSize={1.5}
                fill={p.livre ? '#adb5bd' : '#f8f9fa'} fontWeight={p.livre ? 400 : 700}>
            {p.nome}
          </text>
        </g>
      ))}
      <text x={x1 - 1.5} y={y1 - 3.2} fontSize={2.1} fontWeight="700" fill={cor}>
        CI1 · chanfro →
      </text>
    </g>
  );
}

/* ── bornes ────────────────────────────────────────────────────────── */
function Borne({ b, ativo, onVia }) {
  const primeira = b.vias[0].col, ultima = b.vias[b.vias.length - 1].col;
  const x1 = X(primeira) - PASSO, x2 = X(ultima) + PASSO;
  const y1 = Y(b.corpo[0]), y2 = Y(b.corpo[1]);
  const emCima = b.linha < PLACA.linhas / 2;
  return (
    <g opacity={ativo ? 1 : 0.4}>
      <rect x={x1} y={y1} width={x2 - x1} height={y2 - y1} rx={1}
            fill="#2f6f3e" stroke="#1c4526" strokeWidth={0.4}
            style={{ filter: 'saturate(0.85)' }} />
      <text x={(x1 + x2) / 2} y={emCima ? y1 - 5.5 : y2 + 8.2}
            textAnchor="middle" fontSize={3.4} fontWeight="700" fill={b.cor}>
        {b.ref} — {b.papel}
      </text>
      {b.vias.map(v => (
        <g key={v.n} onClick={() => onVia(b, v)} style={{ cursor: 'pointer' }}>
          {/* parafuso de aperto */}
          <circle cx={X(v.col)} cy={emCima ? y1 + 2.6 : y2 - 2.6} r={1.8}
                  fill="#c0c4c8" stroke="#7a7f84" strokeWidth={0.3} />
          <line x1={X(v.col) - 1.1} y1={emCima ? y1 + 2.6 : y2 - 2.6}
                x2={X(v.col) + 1.1} y2={emCima ? y1 + 2.6 : y2 - 2.6}
                stroke="#5a5f64" strokeWidth={0.45} />
          <rect x={X(v.col) - 0.5} y={Y(b.linha) - 0.5} width={1} height={1} fill="#d9a441" />
          {/* rótulo girado, senão não cabe entre vias de 5,08 mm */}
          <text x={X(v.col)} y={emCima ? y1 - 1.6 : y2 + 2.2}
                textAnchor={emCima ? 'start' : 'end'} fontSize={1.95} fontWeight="700"
                fill={v.alerta ? '#c92a2a' : '#212529'}
                transform={`rotate(-62 ${X(v.col)} ${emCima ? y1 - 1.6 : y2 + 2.2})`}>
            {b.ref}-{v.n} {v.sinal}
          </text>
        </g>
      ))}
    </g>
  );
}

/* ── placa ─────────────────────────────────────────────────────────── */
export default function PlacaPI1({ onFechar }) {
  const [circuito, setCircuito] = useState(null);   // filtro por circuito
  const [sel, setSel] = useState(null);             // item clicado
  const [verJumpers, setVerJumpers] = useState(true);
  const [escala, setEscala] = useState(7);          // px por mm

  const ativo = id => circuito === null || circuito === id;

  const ocupados = useMemo(() => {
    const s = new Set();
    COMPONENTES_PI1.forEach(c => c.furos.forEach(([a, b]) => s.add(`${a},${b}`)));
    CI1.pinos.forEach(p => s.add(`${p.col},${p.lin}`));
    BORNES.forEach(b => b.vias.forEach(v => s.add(`${v.col},${b.linha}`)));
    for (let c = BARRAMENTO_0V.de; c <= BARRAMENTO_0V.ate; c++) s.add(`${c},${BARRAMENTO_0V.linha}`);
    return s;
  }, []);

  const larg = X(PLACA.colunas + 0.5), alt = Y(PLACA.linhas + 0.5);

  return (
    <div style={{ display: 'flex', height: '100%', background: '#eef1f5', overflow: 'hidden' }}>
      {/* ── desenho ── */}
      <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
        <svg width={(larg + 34) * escala / 3.2} viewBox={`-15 -13 ${larg + 32} ${alt + 26}`}
             style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 6px #0002' }}>
          {/* corpo da placa */}
          <rect x={X(0.5)} y={Y(0.5)} width={X(PLACA.colunas)} height={Y(PLACA.linhas)}
                rx={1.2} fill="#d8c9a3" stroke="#a8946a" strokeWidth={0.5} />

          {/* jumpers — ficam por BAIXO da placa, por isso tracejados */}
          {verJumpers && JUMPERS.map((j, i) => {
            const [x1, y1] = [X(j.de[0]), Y(j.de[1])];
            const [x2, y2] = [X(j.para[0]), Y(j.para[1])];
            const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
            const lado = i % 2 ? 1 : -1;
            const cx = (x1 + x2) / 2 + (-dy / len) * len * 0.13 * lado;
            const cy = (y1 + y2) / 2 + (dx / len) * len * 0.13 * lado;
            return (
              <path key={j.n} d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
                    fill="none" stroke={corDe(j.circuito)} strokeWidth={0.72}
                    strokeDasharray="1.6 1.1" opacity={ativo(j.circuito) ? 0.9 : 0.1}
                    strokeLinecap="round" />
            );
          })}

          <Furos ocupados={ocupados} />

          {/* barramento de 0 V — fio NU, o único da placa */}
          <line x1={X(BARRAMENTO_0V.de)} y1={Y(BARRAMENTO_0V.linha)}
                x2={X(BARRAMENTO_0V.ate)} y2={Y(BARRAMENTO_0V.linha)}
                stroke="#212529" strokeWidth={1.5} strokeLinecap="round"
                opacity={ativo(0) ? 1 : 0.15} />
          <text x={X(BARRAMENTO_0V.ate) + 2} y={Y(BARRAMENTO_0V.linha) + 0.8}
                fontSize={2.3} fontWeight="700" fill="#212529"
                opacity={ativo(0) ? 1 : 0.2}>0 V</text>

          {/* pontes de nó */}
          {NOS.map(n => (
            <line key={n.ref} x1={X(n.de)} y1={Y(n.linha)} x2={X(n.ate)} y2={Y(n.linha)}
                  stroke="#212529" strokeWidth={1.1} strokeLinecap="round"
                  opacity={ativo(3) ? 0.9 : 0.12} />
          ))}

          {COMPONENTES_PI1.map(c => (
            c.tipo === 'resistor'
              ? <Resistor key={c.ref} c={c} ativo={ativo(c.circuito)} onClick={() => setSel(c)} />
              : <Capacitor key={c.ref} c={c} ativo={ativo(c.circuito)} onClick={() => setSel(c)} />
          ))}

          <CircuitoIntegrado ativo={ativo(4)} onClick={() => setSel(CI1)} />

          {BORNES.map(b => (
            <Borne key={b.ref} b={b} ativo={circuito === null}
                   onVia={(bb, v) => setSel({ ...v, ref: `${bb.ref}-${v.n}`, ehVia: true, borne: bb })} />
          ))}

          {/* régua de 50 mm para conferir a escala com uma régua de verdade */}
          <g transform={`translate(${X(1)} ${alt + 9})`}>
            <line x1={0} y1={0} x2={50} y2={0} stroke="#495057" strokeWidth={0.4} />
            <line x1={0} y1={-1.5} x2={0} y2={1.5} stroke="#495057" strokeWidth={0.4} />
            <line x1={50} y1={-1.5} x2={50} y2={1.5} stroke="#495057" strokeWidth={0.4} />
            <text x={25} y={-2.4} textAnchor="middle" fontSize={2.2} fill="#495057">
              50 mm reais
            </text>
          </g>
        </svg>
      </div>

      {/* ── lateral ── */}
      <aside style={{ width: 350, background: '#fff', borderLeft: '1px solid #dee2e6',
                      overflowY: 'auto', flexShrink: 0 }}>
        <div style={{ background: '#1d3557', color: '#fff', padding: '13px 15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <b style={{ fontSize: 16 }}>Placa PI-1 · lado dos componentes</b>
            {onFechar && <button onClick={onFechar} style={{
              background: '#ffffff33', color: '#fff', border: 'none', borderRadius: 5,
              width: 26, height: 26, cursor: 'pointer' }}>×</button>}
          </div>
          <div style={{ fontSize: 11.5, opacity: 0.85, marginTop: 4 }}>
            {PLACA.colunas} × {PLACA.linhas} furos ·{' '}
            {PLACA.larguraMm.toFixed(0)} × {PLACA.alturaMm.toFixed(0)} mm · passo 2,54 mm
          </div>
        </div>

        <div style={{ padding: '10px 15px', borderBottom: '1px solid #eee',
                      display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center' }}>
          <label style={{ fontSize: 11.5, color: '#495057', display: 'flex', gap: 5 }}>
            <input type="checkbox" checked={verJumpers}
                   onChange={e => setVerJumpers(e.target.checked)} />
            fios por baixo
          </label>
          <input type="range" min={4} max={16} step={0.5} value={escala}
                 onChange={e => setEscala(+e.target.value)} style={{ flex: 1, minWidth: 90 }} />
          <span style={{ fontSize: 11, color: '#868e96' }}>zoom</span>
        </div>

        <div style={{ padding: '11px 15px', borderBottom: '1px solid #eee' }}>
          <div style={{ fontSize: 11, color: '#868e96', marginBottom: 7, letterSpacing: 0.4 }}>
            OS 4 CIRCUITOS — clique para isolar um
          </div>
          {CIRCUITOS.map(c => (
            <button key={c.id} onClick={() => setCircuito(circuito === c.id ? null : c.id)}
              style={{
                display: 'block', width: '100%', textAlign: 'left', marginBottom: 4,
                background: circuito === c.id ? c.cor : '#f8f9fa',
                color: circuito === c.id ? '#fff' : '#212529',
                border: `1.5px solid ${c.cor}`, borderRadius: 5,
                padding: '5px 9px', cursor: 'pointer', fontSize: 11.5,
              }}>
              <b>{c.nome}</b>
              <div style={{ fontSize: 10.5, opacity: circuito === c.id ? 0.9 : 0.65,
                            marginTop: 1 }}>{c.resumo}</div>
            </button>
          ))}
          <div style={{ fontSize: 11, color: '#f08c00', marginTop: 7, lineHeight: 1.45 }}>
            💡 Eles <b>não se tocam</b>. A única coisa que compartilham é o barramento de
            0 V. Isole um de cada vez e a placa deixa de ser confusa.
          </div>
        </div>

        {sel && (
          <div style={{ padding: '12px 15px', background: '#fffbe6',
                        borderBottom: '2px solid #f5a524' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <b style={{ fontSize: 14, color: '#8a5a00' }}>
                {sel.ref} {sel.valor ? `· ${sel.valor}` : ''}
              </b>
              <button onClick={() => setSel(null)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#8a5a00', fontSize: 15 }}>×</button>
            </div>
            {sel.ehVia && (
              <div style={{ fontSize: 11.5, marginTop: 6, lineHeight: 1.5 }}>
                <div><b>Sinal:</b> {sel.sinal}</div>
                <div style={{ marginTop: 3 }}>
                  <b>{sel.de ? 'Vem de:' : 'Vai para:'}</b> {sel.de ?? sel.para}
                </div>
                <div style={{ marginTop: 3, color: '#666' }}>
                  Coluna {sel.col} · linha {sel.borne.linha}
                </div>
                {sel.alerta && (
                  <div style={{ marginTop: 5, color: '#c92a2a' }}>
                    ⚠️ Via de 24 V. Anilha de cor diferente da outra — trocar as duas
                    muda o comportamento na emergência.
                  </div>
                )}
              </div>
            )}
            {sel.papel && (
              <div style={{ fontSize: 11.5, marginTop: 6, lineHeight: 1.5 }}>
                {sel.papel}
                {sel.porque && (
                  <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid #f5a52444' }}>
                    <b>Por que existe:</b> {sel.porque}
                  </div>
                )}
                {sel.aviso && (
                  <div style={{ marginTop: 6, color: '#c92a2a' }}>⚠️ {sel.aviso}</div>
                )}
                {sel.furos && (
                  <div style={{ marginTop: 6, color: '#666' }}>
                    Furos: {sel.furos.map(([c, l]) => `(col ${c}, lin ${l})`).join(' e ')}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div style={{ padding: '12px 15px' }}>
          <div style={{ fontSize: 11, color: '#868e96', marginBottom: 7, letterSpacing: 0.4 }}>
            ORDEM DE MONTAGEM
          </div>
          <ol style={{ margin: 0, paddingLeft: 18, fontSize: 11.5, lineHeight: 1.55,
                       color: '#343a40' }}>
            {ORDEM_MONTAGEM.map((p, i) => <li key={i} style={{ marginBottom: 4 }}>{p}</li>)}
          </ol>
          <div style={{ marginTop: 11, padding: 10, background: '#f1f3f5', borderRadius: 6,
                        fontSize: 11, color: '#495057', lineHeight: 1.5 }}>
            <b>Por que os fios aparecem tracejados:</b> eles ficam do lado da solda, por
            baixo. Como são <b>isolados</b>, podem cruzar o barramento de 0 V sem encostar.
            O único fio <b>nu</b> da placa é o próprio barramento.
          </div>
          <div style={{ marginTop: 9, padding: 10, background: '#fff5f5', borderRadius: 6,
                        fontSize: 11, color: '#c92a2a', lineHeight: 1.5 }}>
            <b>Caixa:</b> {PLACA.caixa}.<br />{PLACA.nota}
          </div>
        </div>
      </aside>
    </div>
  );
}
