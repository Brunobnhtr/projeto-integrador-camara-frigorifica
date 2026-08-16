import { useState } from 'react';
import { CAIXA, UTIL, BASE_INT, COMPONENTES, EXTERNOS, TRAVESSIA } from '../data/camara';

/* Corte frontal da câmara. Mostra ONDE cada componente fica, POR QUE
   fica ali, e de qual borne do painel vem cada fio dele.            */

const u = CAIXA.cobertura + CAIXA.xps;
const DUTO_E = { x: CAIXA.x1 + u, y: UTIL.y1, w: CAIXA.duto, h: UTIL.y2 - UTIL.y1 };
const DUTO_D = { x: CAIXA.x2 - u - CAIXA.duto, y: UTIL.y1, w: CAIXA.duto, h: UTIL.y2 - UTIL.y1 };

/* setas do ar, por ciclo */
const AR = {
  frio: [
    { d: `M 440 215 L 440 ${BASE_INT - 8}`, cor: '#4dabf7' },
    { d: `M 400 ${BASE_INT + 20} L ${DUTO_E.x + 18} ${BASE_INT + 20} L ${DUTO_E.x + 18} ${UTIL.y1 + 20}`, cor: '#4dabf7' },
    { d: `M 480 ${BASE_INT + 20} L ${DUTO_D.x + 18} ${BASE_INT + 20} L ${DUTO_D.x + 18} ${UTIL.y1 + 20}`, cor: '#4dabf7' },
    { d: `M ${DUTO_E.x + 18} ${UTIL.y1 + 14} L 410 ${UTIL.y1 + 14}`, cor: '#4dabf7' },
    { d: `M ${DUTO_D.x + 18} ${UTIL.y1 + 14} L 470 ${UTIL.y1 + 14}`, cor: '#4dabf7' },
  ],
  quente: [
    { d: `M 440 392 L 440 ${UTIL.y1 + 22}`, cor: '#ff8787' },
    { d: `M 410 ${UTIL.y1 + 14} L ${DUTO_E.x + 18} ${UTIL.y1 + 14} L ${DUTO_E.x + 18} ${BASE_INT + 20}`, cor: '#ff8787' },
    { d: `M 470 ${UTIL.y1 + 14} L ${DUTO_D.x + 18} ${UTIL.y1 + 14} L ${DUTO_D.x + 18} ${BASE_INT + 20}`, cor: '#ff8787' },
    { d: `M ${DUTO_E.x + 18} ${BASE_INT + 20} L 400 ${BASE_INT + 20}`, cor: '#ff8787' },
    { d: `M ${DUTO_D.x + 18} ${BASE_INT + 20} L 480 ${BASE_INT + 20}`, cor: '#ff8787' },
  ],
};

/* os fios entram todos pelo mesmo canto, como na montagem real */
const ENTRADA = { x: CAIXA.x1, y: 250 };

export default function VistaCamara() {
  const [sel, setSel] = useState(null);
  const [ciclo, setCiclo] = useState('frio');
  const [verFios, setVerFios] = useState(true);

  const total = TRAVESSIA.reduce((a, t) => a + t.n, 0);

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflow: 'auto', padding: 16, background: '#eef1f5' }}>

        <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          {[['frio', '❄️ Ciclo de frio', '#1971c2'], ['quente', '🔥 Ciclo de calor', '#e03131']]
            .map(([id, txt, cor]) => (
            <button key={id} onClick={() => setCiclo(id)} style={{
              background: ciclo === id ? cor : '#fff', color: ciclo === id ? '#fff' : cor,
              border: `2px solid ${cor}`, borderRadius: 7, padding: '7px 14px',
              cursor: 'pointer', fontSize: 12.5, fontWeight: 700 }}>{txt}</button>
          ))}
          <button onClick={() => setVerFios(!verFios)} style={{
            background: verFios ? '#495057' : '#fff', color: verFios ? '#fff' : '#495057',
            border: '2px solid #495057', borderRadius: 7, padding: '7px 14px',
            cursor: 'pointer', fontSize: 12.5, fontWeight: 700 }}>
            🔌 Fios que atravessam a parede
          </button>
        </div>

        <svg viewBox="0 0 780 640" style={{ width: '100%', background: '#fff',
             borderRadius: 8, boxShadow: '0 1px 6px #0002' }}>
          <defs>
            <marker id="setaAr" markerWidth="7" markerHeight="7" refX="5" refY="3"
                    orient="auto">
              <path d="M0,0 L6,3 L0,6 z" fill="currentColor" />
            </marker>
            <pattern id="hachXPS" width="7" height="7" patternTransform="rotate(45)"
                     patternUnits="userSpaceOnUse">
              <rect width="7" height="7" fill="#fff9db" />
              <line x1="0" y1="0" x2="0" y2="7" stroke="#ffe066" strokeWidth="2.5" />
            </pattern>
          </defs>

          {/* ── as camadas da parede ────────────────────────────────── */}
          <rect x={CAIXA.x1} y={CAIXA.y1} width={CAIXA.x2 - CAIXA.x1}
                height={CAIXA.y2 - CAIXA.y1} rx={4} fill="#f8f9fa"
                stroke="#adb5bd" strokeWidth={1.5} />
          <rect x={CAIXA.x1 + CAIXA.cobertura} y={CAIXA.y1 + CAIXA.cobertura}
                width={CAIXA.x2 - CAIXA.x1 - 2 * CAIXA.cobertura}
                height={CAIXA.y2 - CAIXA.y1 - 2 * CAIXA.cobertura}
                fill="url(#hachXPS)" stroke="#ffd43b" strokeWidth={0.8} />
          <rect x={CAIXA.x1 + u} y={CAIXA.y1 + u}
                width={CAIXA.x2 - CAIXA.x1 - 2 * u} height={CAIXA.y2 - CAIXA.y1 - 2 * u}
                fill="#e7f5ff" stroke="#74c0fc" strokeWidth={1} />
          {/* dutos laterais */}
          {[DUTO_E, DUTO_D].map((d, i) => (
            <rect key={i} x={d.x} y={d.y} width={d.w} height={d.h} fill="#d0ebff"
                  stroke="#4dabf7" strokeWidth={0.8} strokeDasharray="3 2" />
          ))}
          {/* volume útil */}
          <rect x={UTIL.x1} y={UTIL.y1} width={UTIL.x2 - UTIL.x1}
                height={UTIL.y2 - UTIL.y1} fill="#fff" stroke="#495057" strokeWidth={1.6} />
          {/* base interna sobre o plenum */}
          <line x1={UTIL.x1} y1={BASE_INT} x2={UTIL.x2} y2={BASE_INT}
                stroke="#868e96" strokeWidth={2} />
          <text x={UTIL.x1 + 8} y={BASE_INT + 28} fontSize={9} fill="#868e96">
            PLENUM 30 mm — o ar passa por baixo do PTC
          </text>

          {/* legendas das camadas */}
          <text x={CAIXA.x1} y={CAIXA.y1 - 22} fontSize={13} fontWeight="700" fill="#1d3557">
            CÂMARA — corte frontal · 336 × 326 mm
          </text>
          <text x={CAIXA.x1} y={CAIXA.y1 - 8} fontSize={9.5} fill="#868e96">
            acrílico branco 3 mm · XPS 30 mm · duto 30 mm · acrílico 5 mm · útil 200 × 250 mm
          </text>

          {/* ── o ar ────────────────────────────────────────────────── */}
          {AR[ciclo].map((a, i) => (
            <path key={i} d={a.d} fill="none" stroke={a.cor} strokeWidth={2.4}
                  strokeDasharray="7 5" opacity={0.85} color={a.cor}
                  markerEnd="url(#setaAr)">
              <animate attributeName="stroke-dashoffset" from="24" to="0" dur="1.1s"
                       repeatCount="indefinite" />
            </path>
          ))}

          {/* ── o lado quente, fora da tampa ────────────────────────── */}
          {EXTERNOS.map(e => (
            <g key={e.id}>
              <rect x={e.x} y={e.y} width={e.w} height={e.h} rx={3} fill="#ffe8cc"
                    stroke="#e8590c" strokeWidth={1.2} />
              {[...Array(6)].map((_, i) => (
                <line key={i} x1={e.x + 6 + i * 10} y1={e.y + 4}
                      x2={e.x + 6 + i * 10} y2={e.y + 30} stroke="#e8590c"
                      strokeWidth={1.6} opacity={0.5} />
              ))}
              <circle cx={e.x + e.w / 2} cy={e.y + 38} r={8} fill="#fff"
                      stroke="#e8590c" strokeWidth={1.2} />
              <text x={e.x + e.w / 2} y={e.y + 41} textAnchor="middle" fontSize={8}
                    fill="#e8590c">✳</text>
            </g>
          ))}
          <text x={520} y={92} fontSize={9.5} fontWeight="700" fill="#e8590c">
            ← lado QUENTE, fora
          </text>
          <text x={520} y={104} fontSize={8.5} fill="#e8590c">
            2 dissipadores + coolers
          </text>
          <text x={520} y={115} fontSize={8.5} fill="#e8590c">
            (MV-1 · O1 — RPM vigiado)
          </text>

          {/* ── os fios entrando pelo prensa-cabo ───────────────────── */}
          {verFios && (
            <g>
              <circle cx={ENTRADA.x} cy={ENTRADA.y} r={11} fill="#495057" />
              <circle cx={ENTRADA.x} cy={ENTRADA.y} r={5} fill="#fff" />
              <text x={ENTRADA.x - 16} y={ENTRADA.y - 16} textAnchor="middle" fontSize={9}
                    fontWeight="700" fill="#495057">prensa-cabo</text>
              <text x={ENTRADA.x - 16} y={ENTRADA.y - 5} textAnchor="middle" fontSize={8}
                    fill="#868e96">{total} condutores</text>
              <path d={`M 40 ${ENTRADA.y} L ${ENTRADA.x - 11} ${ENTRADA.y}`}
                    stroke="#495057" strokeWidth={9} strokeLinecap="round" />
              <text x={44} y={ENTRADA.y - 12} fontSize={10} fontWeight="700" fill="#1d3557">
                DO PAINEL
              </text>
              {COMPONENTES.map(c => (
                <path key={c.id}
                      d={`M ${ENTRADA.x} ${ENTRADA.y} L ${ENTRADA.x + 22} ${ENTRADA.y}
                          L ${ENTRADA.x + 22} ${c.y + c.h / 2} L ${c.x} ${c.y + c.h / 2}`}
                      fill="none" stroke={c.cor} strokeWidth={sel?.id === c.id ? 3 : 1.2}
                      opacity={sel ? (sel.id === c.id ? 1 : 0.15) : 0.45}
                      strokeLinejoin="round" />
              ))}
            </g>
          )}

          {/* ── os componentes ──────────────────────────────────────── */}
          {COMPONENTES.map(c => {
            const on = sel?.id === c.id;
            return (
              <g key={c.id} onClick={() => setSel(on ? null : c)}
                 style={{ cursor: 'pointer' }}>
                <rect x={c.x} y={c.y} width={c.w} height={c.h} rx={3}
                      fill={on ? c.cor : '#fff'} stroke={c.cor}
                      strokeWidth={on ? 3 : 1.6} />

                {/* a Peltier é um par de pastilhas */}
                {c.id === 'PELT' && (
                  <line x1={c.x + c.w / 2} y1={c.y} x2={c.x + c.w / 2} y2={c.y + c.h}
                        stroke={on ? '#fff' : c.cor} strokeWidth={1.2} />
                )}
                {/* ventoinha: uma hélice */}
                {c.tipo === 'ar' && !on && (
                  <text x={c.x + c.w / 2} y={c.y + c.h / 2 + 4} textAnchor="middle"
                        fontSize={13} fill={c.cor}>
                    {c.sopra === 'baixo' ? '▼' : '▲'}
                  </text>
                )}
                {/* DUT: LED + resistor */}
                {c.tipo === 'dut' && !on && (
                  <>
                    <rect x={c.x + 8} y={c.y + 30} width={20} height={8} rx={1}
                          fill="#c9b28a" stroke="#8d7c5e" strokeWidth={0.6} />
                    <circle cx={c.x + 46} cy={c.y + 34} r={6} fill={c.cor} />
                    <text x={c.x + c.w / 2} y={c.y + 50} textAnchor="middle" fontSize={7.5}
                          fill="#868e96">
                      {c.dut === 1 ? '1,2 kΩ · 17,6 mA' : '2,2 kΩ · 9,8 mA'}
                    </text>
                  </>
                )}
                {c.tipo === 'sensor' && !on && (
                  <text x={c.x + c.w / 2} y={c.y + 30} textAnchor="middle" fontSize={15}>🌡️</text>
                )}

                <text x={c.x + c.w / 2} y={c.y - 5} textAnchor="middle" fontSize={9}
                      fontWeight="700" fill={c.cor}>
                  {c.pequeno ? c.id : c.nome.split(' — ')[0]}
                </text>
              </g>
            );
          })}

          {/* nota do sensor, que é o ponto crítico */}
          {!sel && (
            <g>
              <path d="M 560 330 L 484 330" stroke="#f76707" strokeWidth={1.2}
                    strokeDasharray="3 2" />
              <rect x={562} y={306} width={200} height={48} rx={4} fill="#fff4e6"
                    stroke="#f76707" strokeWidth={1} />
              <text x={570} y={321} fontSize={9} fontWeight="700" fill="#d9480f">
                ⭐ O sensor fica no CENTRO
              </text>
              <text x={570} y={334} fontSize={8.5} fill="#7f4400">
                Encostado na Peltier ele lê a pastilha,
              </text>
              <text x={570} y={346} fontSize={8.5} fill="#7f4400">
                não o ar — e o ensaio inteiro erra.
              </text>
            </g>
          )}
        </svg>

        {/* ── a conta dos condutores ─────────────────────────────────── */}
        <div style={{ background: '#fff', borderRadius: 8, padding: 14, marginTop: 12,
                      boxShadow: '0 1px 6px #0002' }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: '#1d3557' }}>
            🔌 O que atravessa a parede — {total} condutores num único prensa-cabo
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5 }}>
            <thead><tr style={{ background: '#f1f3f5' }}>
              {['Grupo', 'Fios', 'O quê', 'Vem de', 'Bitola'].map(h => (
                <th key={h} style={{ padding: '5px 7px', textAlign: 'left',
                                     borderBottom: '1px solid #dee2e6' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {TRAVESSIA.map((t, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f3f5' }}>
                  <td style={{ padding: '5px 7px', color: '#868e96' }}>{t.g}</td>
                  <td style={{ padding: '5px 7px', fontWeight: 700 }}>{t.n}</td>
                  <td style={{ padding: '5px 7px' }}>{t.o}</td>
                  <td style={{ padding: '5px 7px', fontFamily: 'monospace',
                               fontSize: 10.5 }}>{t.de}</td>
                  <td style={{ padding: '5px 7px', color: '#868e96' }}>{t.mm}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 10, padding: 9, background: '#fff3bf', borderRadius: 5,
                        fontSize: 11.5, lineHeight: 1.5 }}>
            ⚠️ <b>Os de potência e os de sinal não podem vir no mesmo cabo.</b> Os 4 fios de
            1,5 mm² chaveiam 6 A pelos BTS; os 4 fios do AM2315C carregam pulsos de I²C.
            São <b>dois prensa-cabos</b>, um em cada canto, com pelo menos 100 mm entre eles.
          </div>
        </div>
      </div>

      {/* ── painel lateral ───────────────────────────────────────────── */}
      <div style={{ width: 340, borderLeft: '1px solid #dee2e6', background: '#fff',
                    overflow: 'auto', padding: 16 }}>
        {!sel && (
          <>
            <h3 style={{ margin: '0 0 10px', fontSize: 15, color: '#1d3557' }}>
              Dentro da câmara
            </h3>
            <p style={{ fontSize: 12.5, lineHeight: 1.6, color: '#495057' }}>
              Clique em qualquer componente para ver <b>onde ele fica</b>, <b>por que ali</b>,
              e <b>de qual borne do painel</b> vem cada fio dele.
            </p>
            <div style={{ background: '#e7f5ff', borderLeft: '3px solid #1971c2',
                          padding: 10, borderRadius: 4, fontSize: 12, lineHeight: 1.6,
                          marginTop: 12 }}>
              <b>A lógica da posição de cada um:</b><br />
              ❄️ A <b>Peltier em cima</b>, porque o ar frio desce sozinho.<br />
              🔥 O <b>PTC embaixo</b>, porque o ar quente sobe sozinho.<br />
              🌡️ O <b>sensor no centro</b>, longe dos dois, para ler o ar e não a fonte.<br />
              🔴 As <b>duas posições na base</b>, com folga das paredes.
            </div>
            <div style={{ background: '#fff4e6', borderLeft: '3px solid #f76707',
                          padding: 10, borderRadius: 4, fontSize: 12, lineHeight: 1.6,
                          marginTop: 10 }}>
              <b>Só as ventoinhas de circulação e a do PTC são de 12 V.</b> Peltier, PTC e as
              duas posições de ensaio recebem <b>24 V</b> — todas ligadas ao barramento sem
              conversor nenhum no meio.
            </div>
          </>
        )}

        {sel && (
          <>
            <button onClick={() => setSel(null)} style={{ background: '#f1f3f5',
              border: '1px solid #ced4da', borderRadius: 5, padding: '4px 10px',
              cursor: 'pointer', fontSize: 11, marginBottom: 10 }}>← voltar</button>
            <h3 style={{ margin: '0 0 4px', fontSize: 15, color: sel.cor }}>{sel.nome}</h3>

            <div style={{ fontSize: 12, color: '#495057', marginBottom: 4 }}>
              <b>Onde:</b> {sel.onde}
            </div>
            <div style={{ background: '#f8f9fa', padding: 9, borderRadius: 4,
                          fontSize: 12, lineHeight: 1.55, color: '#495057' }}>
              <b>Por que ali:</b> {sel.porque}
            </div>

            <div style={{ fontWeight: 700, fontSize: 12.5, margin: '14px 0 6px',
                          color: '#1d3557' }}>Ligações</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5 }}>
              <tbody>
                {sel.terminais.map((t, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f3f5' }}>
                    <td style={{ padding: '5px 6px', fontWeight: 700, fontFamily: 'monospace',
                                 whiteSpace: 'nowrap' }}>{t.t}</td>
                    <td style={{ padding: '5px 6px' }}>
                      {t.de}
                      <div style={{ fontSize: 10, color: '#868e96' }}>{t.fio}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {sel.avisos.map((a, i) => (
              <div key={i} style={{ background: '#fff9db', borderLeft: '3px solid #fab005',
                                    padding: 9, borderRadius: 4, fontSize: 11.5,
                                    lineHeight: 1.55, marginTop: 8 }}>{a}</div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
