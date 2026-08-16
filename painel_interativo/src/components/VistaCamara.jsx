import { useState } from 'react';
import { CAIXA, UTIL, BASE_INT, COMPONENTES, EXTERNOS, TRAVESSIA, PRENSAS }
  from '../data/camara';

/* Corte frontal da câmara. Mostra ONDE cada componente fica, POR QUE
   fica ali, e de qual borne do painel vem cada fio dele.

   ⚠️ O circuito de ar é UM SÓ e não inverte — ventoinha DC não gira ao
   contrário. O que muda entre resfriar e aquecer é qual fonte está
   energizada, não o caminho do ar.                                   */

const u = CAIXA.cobertura + CAIXA.xps;
const DUTO_E = { x: CAIXA.x1 + u, y: UTIL.y1, w: CAIXA.duto, h: UTIL.y2 - UTIL.y1 };
const DUTO_D = { x: CAIXA.x2 - u - CAIXA.duto, y: UTIL.y1, w: CAIXA.duto, h: UTIL.y2 - UTIL.y1 };
const eE = DUTO_E.x + 18, eD = DUTO_D.x + 18;
const PLEN = BASE_INT + 22, TOPO = UTIL.y1 + 14;

/* o mesmo caminho nos dois modos: desce pelo centro, sobe pelos dutos */
const CIRCUITO = [
  `M 440 214 L 440 ${PLEN - 6}`,
  `M 436 ${PLEN} L ${eE} ${PLEN} L ${eE} ${TOPO} L 414 ${TOPO}`,
  `M 444 ${PLEN} L ${eD} ${PLEN} L ${eD} ${TOPO} L 466 ${TOPO}`,
];

const MODOS = {
  frio:   { nome: '❄️ Resfriando', cor: '#1971c2', ar: '#4dabf7', fonte: 'PELT',
            ligados: ['VF', 'VD1', 'VD2'] },
  quente: { nome: '🔥 Aquecendo',  cor: '#e03131', ar: '#ff8787', fonte: 'PTC',
            ligados: ['VF', 'VD1', 'VD2', 'VP'] },
};

export default function VistaCamara() {
  const [sel, setSel] = useState(null);
  const [modo, setModo] = useState('frio');
  const [verFios, setVerFios] = useState(true);

  const M = MODOS[modo];
  const porPrensa = id => TRAVESSIA.filter(t => t.pc === id).reduce((a, t) => a + t.n, 0);

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflow: 'auto', padding: 16, background: '#eef1f5' }}>

        <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          {Object.entries(MODOS).map(([id, m]) => (
            <button key={id} onClick={() => setModo(id)} style={{
              background: modo === id ? m.cor : '#fff', color: modo === id ? '#fff' : m.cor,
              border: `2px solid ${m.cor}`, borderRadius: 7, padding: '7px 14px',
              cursor: 'pointer', fontSize: 12.5, fontWeight: 700 }}>{m.nome}</button>
          ))}
          <button onClick={() => setVerFios(!verFios)} style={{
            background: verFios ? '#495057' : '#fff', color: verFios ? '#fff' : '#495057',
            border: '2px solid #495057', borderRadius: 7, padding: '7px 14px',
            cursor: 'pointer', fontSize: 12.5, fontWeight: 700 }}>
            🔌 Fios que atravessam a parede
          </button>
        </div>

        <div style={{ background: '#fff3bf', borderRadius: 6, padding: '8px 11px',
                      fontSize: 12, marginBottom: 10, lineHeight: 1.5 }}>
          ⚠️ <b>O ar corre sempre no mesmo sentido nos dois modos</b> — desce pelo centro e
          sobe pelos dutos. Uma ventoinha DC não gira ao contrário, e as 2 do duto dividem
          um canal só. O que muda é <b>qual fonte está energizada</b>.
        </div>

        <svg viewBox="0 0 780 660" style={{ width: '100%', background: '#fff',
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
          {[DUTO_E, DUTO_D].map((d, i) => (
            <rect key={i} x={d.x} y={d.y} width={d.w} height={d.h} fill="#d0ebff"
                  stroke="#4dabf7" strokeWidth={0.8} strokeDasharray="3 2" />
          ))}
          <rect x={UTIL.x1} y={UTIL.y1} width={UTIL.x2 - UTIL.x1}
                height={UTIL.y2 - UTIL.y1} fill="#fff" stroke="#495057" strokeWidth={1.6} />
          <line x1={UTIL.x1} y1={BASE_INT} x2={UTIL.x2} y2={BASE_INT}
                stroke="#868e96" strokeWidth={2} strokeDasharray="9 4" />
          <text x={UTIL.x1 + 6} y={BASE_INT + 42} fontSize={8.5} fill="#868e96">
            PLENUM 30 mm — base vazada, sobre 4 cubinhos
          </text>

          <text x={CAIXA.x1} y={CAIXA.y1 - 22} fontSize={13} fontWeight="700" fill="#1d3557">
            CÂMARA — corte frontal · 336 × 326 mm
          </text>
          <text x={CAIXA.x1} y={CAIXA.y1 - 8} fontSize={9.5} fill="#868e96">
            acrílico branco 3 mm · XPS 30 mm · duto 30 mm · acrílico 5 mm · útil 200 × 250 mm
          </text>

          {/* ── o circuito de ar, sempre o mesmo ────────────────────── */}
          {CIRCUITO.map((d, i) => (
            <path key={i} d={d} fill="none" stroke={M.ar} strokeWidth={2.4}
                  strokeDasharray="7 5" opacity={0.9} color={M.ar}
                  markerEnd="url(#setaAr)">
              <animate attributeName="stroke-dashoffset" from="24" to="0" dur="1.1s"
                       repeatCount="indefinite" />
            </path>
          ))}

          {/* ── o lado quente, fora da tampa ────────────────────────── */}
          {EXTERNOS.map(e => (
            <g key={e.id} opacity={modo === 'frio' ? 1 : 0.35}>
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
          <text x={522} y={90} fontSize={9.5} fontWeight="700" fill="#e8590c">
            ← lado QUENTE, fora
          </text>
          <text x={522} y={102} fontSize={8.5} fill="#e8590c">
            2 dissipadores + coolers
          </text>
          <text x={522} y={113} fontSize={8.5} fill="#e8590c">
            (MV-1 · O1 — RPM vigiado)
          </text>

          {/* ── os DOIS prensa-cabos ────────────────────────────────── */}
          {verFios && PRENSAS.map(pr => {
            const alvos = COMPONENTES.filter(c => c.pc === pr.id);
            return (
              <g key={pr.id}>
                <path d={`M 30 ${pr.y} L ${CAIXA.x1 - 11} ${pr.y}`} stroke={pr.cor}
                      strokeWidth={10} strokeLinecap="round" opacity={0.75} />
                <text x={32} y={pr.y - 13} fontSize={10} fontWeight="700" fill={pr.cor}>
                  {pr.id} · {pr.nome}
                </text>
                <text x={32} y={pr.y + 22} fontSize={9} fill="#868e96">
                  {porPrensa(pr.id)} condutores
                </text>
                <circle cx={CAIXA.x1} cy={pr.y} r={11} fill={pr.cor} />
                <circle cx={CAIXA.x1} cy={pr.y} r={5} fill="#fff" />
                {alvos.map(c => (
                  <path key={c.id}
                        d={`M ${CAIXA.x1} ${pr.y} L ${CAIXA.x1 + 16} ${pr.y}
                            L ${CAIXA.x1 + 16} ${c.y + c.h / 2} L ${c.x} ${c.y + c.h / 2}`}
                        fill="none" stroke={pr.cor}
                        strokeWidth={sel?.id === c.id ? 3 : 1.2}
                        opacity={sel ? (sel.id === c.id ? 1 : 0.12) : 0.4}
                        strokeLinejoin="round" />
                ))}
              </g>
            );
          })}
          {verFios && (
            <>
              <path d={`M ${CAIXA.x1 - 30} ${PRENSAS[0].y + 16}
                        L ${CAIXA.x1 - 30} ${PRENSAS[1].y - 16}`}
                    stroke="#868e96" strokeWidth={1} strokeDasharray="3 3" />
              <text x={CAIXA.x1 - 34} y={(PRENSAS[0].y + PRENSAS[1].y) / 2}
                    textAnchor="end" fontSize={9} fontWeight="700" fill="#495057">
                ≥ 100 mm
              </text>
              <text x={CAIXA.x1 - 34} y={(PRENSAS[0].y + PRENSAS[1].y) / 2 + 12}
                    textAnchor="end" fontSize={8} fill="#868e96">
                de separação
              </text>
            </>
          )}

          {/* ── os componentes ──────────────────────────────────────── */}
          {COMPONENTES.map(c => {
            const on = sel?.id === c.id;
            const ativo = c.id === M.fonte || M.ligados.includes(c.id);
            const apagado = (c.tipo === 'frio' || c.tipo === 'quente' || c.tipo === 'ar')
                            && !ativo;
            return (
              <g key={c.id} onClick={() => setSel(on ? null : c)}
                 style={{ cursor: 'pointer' }} opacity={apagado ? 0.3 : 1}>
                {c.id === M.fonte && (
                  <rect x={c.x - 5} y={c.y - 5} width={c.w + 10} height={c.h + 10} rx={5}
                        fill="none" stroke={M.cor} strokeWidth={2.5} strokeDasharray="5 3">
                    <animate attributeName="stroke-opacity" values="1;0.25;1" dur="1.6s"
                             repeatCount="indefinite" />
                  </rect>
                )}
                <rect x={c.x} y={c.y} width={c.w} height={c.h} rx={3}
                      fill={on ? c.cor : '#fff'} stroke={c.cor}
                      strokeWidth={on ? 3 : 1.6} />

                {c.id === 'PELT' && (
                  <line x1={c.x + c.w / 2} y1={c.y} x2={c.x + c.w / 2} y2={c.y + c.h}
                        stroke={on ? '#fff' : c.cor} strokeWidth={1.2} />
                )}
                {c.tipo === 'ar' && !on && (
                  <text x={c.x + c.w / 2} y={c.y + c.h / 2 + 5} textAnchor="middle"
                        fontSize={14} fill={c.cor}>
                    {c.sopra === 'baixo' ? '▼' : '▲'}
                  </text>
                )}
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

          {/* por que todas as setas apontam para baixo */}
          <g>
            <path d="M 500 415 L 478 409" stroke="#868e96" strokeWidth={1}
                  strokeDasharray="3 2" />
            <rect x={502} y={388} width={196} height={44} rx={4} fill="#f1f3f5"
                  stroke="#adb5bd" strokeWidth={1} />
            <text x={510} y={403} fontSize={8.8} fontWeight="700" fill="#495057">
              A ventoinha do PTC também sopra ▼
            </text>
            <text x={510} y={415} fontSize={8.2} fill="#868e96">
              Empurra o ar sobre o PTC e para o plenum,
            </text>
            <text x={510} y={426} fontSize={8.2} fill="#868e96">
              de onde ele sobe pelos dutos. Mesmo circuito.
            </text>
          </g>
        </svg>

        {/* ── a conta dos condutores, por prensa-cabo ────────────────── */}
        {PRENSAS.map(pr => (
          <div key={pr.id} style={{ background: '#fff', borderRadius: 8, padding: 14,
                        marginTop: 12, boxShadow: '0 1px 6px #0002',
                        borderLeft: `4px solid ${pr.cor}` }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: pr.cor }}>
              🔌 {pr.id} · {pr.nome} — {porPrensa(pr.id)} condutores
            </div>
            <div style={{ fontSize: 11.5, color: '#868e96', margin: '2px 0 8px' }}>
              {pr.onde}
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5 }}>
              <tbody>
                {TRAVESSIA.filter(t => t.pc === pr.id).map((t, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f3f5' }}>
                    <td style={{ padding: '4px 6px', fontWeight: 700, width: 28 }}>{t.n}</td>
                    <td style={{ padding: '4px 6px' }}>{t.o}</td>
                    <td style={{ padding: '4px 6px', fontFamily: 'monospace',
                                 fontSize: 10.5, color: '#495057' }}>{t.de}</td>
                    <td style={{ padding: '4px 6px', color: '#868e96',
                                 textAlign: 'right' }}>{t.mm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: 8, fontSize: 11.5, lineHeight: 1.5,
                          color: '#495057' }}>{pr.diz}</div>
          </div>
        ))}

        <div style={{ background: '#fff3bf', borderRadius: 6, padding: 11, marginTop: 12,
                      fontSize: 11.5, lineHeight: 1.55 }}>
          ⚠️ <b>Por que os dois não podem vir no mesmo cabo.</b> Os BTS chaveiam 6 A: cada
          corte gera um transiente que se acopla por indutância mútua em qualquer condutor
          paralelo. Do lado sensível estão os <b>retornos das posições</b>, que carregam os
          17,6 mA que estão sendo medidos, e o <b>I²C</b>, com pulsos de microssegundos.
          Um transiente induzido vira leitura errada ou sensor travado.
          <br /><br />
          📐 Dentro do PC-2, <b>trance cada par</b> — o positivo de cada posição com o seu
          próprio retorno, e SDA com SCL. Par trançado tem área de laço quase nula, e o que
          se induz numa volta se cancela na seguinte.
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
              ❄️ A <b>Peltier em cima</b>, no início do caminho do ar.<br />
              🔥 O <b>PTC embaixo</b>, logo antes do plenum.<br />
              🌡️ O <b>sensor no centro</b>, longe dos dois, para ler o ar e não a fonte.<br />
              🔴 As <b>duas posições na base</b>, com folga das paredes.
            </div>
            <div style={{ background: '#fff4e6', borderLeft: '3px solid #f76707',
                          padding: 10, borderRadius: 4, fontSize: 12, lineHeight: 1.6,
                          marginTop: 10 }}>
              <b>Um circuito de ar só.</b> Ele desce pelo centro e sobe pelos dutos, sempre.
              O controle escolhe se energiza a Peltier ou o PTC — o ar não muda de caminho.
              É assim que funciona câmara climática de verdade: um circuito fixo, com o
              aquecedor e o evaporador no mesmo trajeto.
            </div>
            <div style={{ background: '#f8f9fa', borderLeft: '3px solid #495057',
                          padding: 10, borderRadius: 4, fontSize: 12, lineHeight: 1.6,
                          marginTop: 10 }}>
              <b>Peltier, PTC e as 2 posições recebem 24 V.</b> Só as ventoinhas são de 12 V,
              e é por isso que elas têm barramento separado — ventoinha partindo afunda a
              tensão, e as posições não podem sentir isso.
            </div>
          </>
        )}

        {sel && (
          <>
            <button onClick={() => setSel(null)} style={{ background: '#f1f3f5',
              border: '1px solid #ced4da', borderRadius: 5, padding: '4px 10px',
              cursor: 'pointer', fontSize: 11, marginBottom: 10 }}>← voltar</button>
            <h3 style={{ margin: '0 0 6px', fontSize: 15, color: sel.cor }}>{sel.nome}</h3>
            {sel.pc && (
              <div style={{ display: 'inline-block', background: '#f1f3f5',
                            borderRadius: 4, padding: '2px 7px', fontSize: 10.5,
                            marginBottom: 8, color: '#495057' }}>
                entra pelo <b>{sel.pc}</b>
              </div>
            )}

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
