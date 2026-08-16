import { useState, useMemo, useEffect } from 'react';
import DetalheCircuito from './DetalheCircuito';
import { rotear } from '../lib/roteador';

/* Desenha uma placa ilhada montada à mão, a partir do arquivo de layout
   físico dela (pi1_fisico.js ou pi2_fisico.js).

   ⭐ TRÊS DECISÕES DE PROJETO DESTA TELA:

   1. Os dois lados são desenhos SEPARADOS. Numa placa ilhada os
      componentes ficam em cima e TODA a fiação fica embaixo.
   2. O lado de baixo é ESPELHADO, porque é assim que você o vê ao virar
      a placa na mão.
   3. Os fios andam em ÂNGULO RETO, cada um no seu canal, e ganham uma
      lombada em arco onde passam por cima de outro.                   */

const PASSO = 2.54;

/* ── um lado da placa ──────────────────────────────────────────────── */
function Face({
  face, PLACA, BORNES, BARRAMENTO_0V, NOS, JUMPERS, DISCRETOS, CI, MODULOS,
  corDe, ativo, setSel, fio, setFio, feitos,
}) {
  const verso = face === 'verso';
  /* virando a placa, a coluna 1 vai para a direita */
  const M = c => (verso ? PLACA.colunas + 1 - c : c);
  const X = c => M(c) * PASSO;
  const Y = l => l * PASSO;

  /* o roteamento é feito já nas coordenadas deste lado */
  const fios = useMemo(() => {
    if (!verso) return [];
    return rotear(JUMPERS.map(j => ({
      ...j, de: [M(j.de[0]), j.de[1]], para: [M(j.para[0]), j.para[1]],
    })), PLACA);
  }, [verso, JUMPERS, PLACA]);

  const passantes = useMemo(() => {
    const s = new Set();
    DISCRETOS.forEach(c => c.furos.forEach(([a, b]) => s.add(`${a},${b}`)));
    if (CI) CI.pinos.forEach(p => s.add(`${p.col},${p.lin}`));
    MODULOS.forEach(m => m.pinos.forEach(p => s.add(`${p.col},${p.lin}`)));
    BORNES.forEach(b => b.vias.forEach(v => s.add(`${v.col},${b.linha}`)));
    return s;
  }, [DISCRETOS, CI, MODULOS, BORNES]);

  const larg = PLACA.colunas * PASSO, alt = PLACA.linhas * PASSO;
  /* bandas reservadas fora da placa para os rótulos dos bornes */
  const vb = { x: -5 * PASSO, y: -26, w: larg + 11 * PASSO, h: alt + 26 + 46 };

  const furos = [];
  for (let c = 1; c <= PLACA.colunas; c++)
    for (let l = 1; l <= PLACA.linhas; l++) {
      const usado = passantes.has(`${c},${l}`);
      furos.push(
        <g key={`${c},${l}`}>
          <circle cx={X(c)} cy={Y(l)} r={usado ? 1.05 : 0.8}
                  fill={usado ? '#e8b04b' : '#c4b183'} opacity={usado ? 1 : 0.3} />
          <circle cx={X(c)} cy={Y(l)} r={0.4} fill="#4a3c10"
                  opacity={usado ? 0.9 : 0.3} />
        </g>,
      );
    }

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        background: verso ? '#5f3dc4' : '#1d3557', color: '#fff',
        padding: '7px 12px', borderRadius: '7px 7px 0 0', fontSize: 12.5,
        fontWeight: 700, display: 'flex', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 6,
      }}>
        <span>{verso ? '🔻 LADO DA SOLDA' : '🔺 LADO DOS COMPONENTES'}</span>
        <span style={{ fontWeight: 400, opacity: 0.85, fontSize: 11 }}>
          {verso ? 'ESPELHADO — como você vê ao virar' : 'como você vê na bancada'}
        </span>
      </div>

      <svg width="100%" viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
           style={{ background: '#fff', borderRadius: '0 0 7px 7px',
                    boxShadow: '0 1px 6px #0002', display: 'block' }}>
        {/* corpo da placa — a borda passa MEIO furo fora da última coluna */}
        <rect x={PASSO * 0.5} y={PASSO * 0.5} width={larg} height={alt} rx={1.2}
              fill={verso ? '#c9b98c' : '#d8c9a3'} stroke="#a8946a" strokeWidth={0.5} />

        {/* ⭐ o marco do furo (1,1) — é ele que impede soldar espelhado errado */}
        <g>
          <path d={`M ${X(1) - 2.4} ${Y(1) - 2.4} l 3.2 0 l -3.2 3.2 z`} fill="#c92a2a" />
          <text x={X(1) + (verso ? 3.4 : -3.4)} y={Y(1) - 3.2}
                textAnchor={verso ? 'start' : 'end'} fontSize={2.0}
                fontWeight="700" fill="#c92a2a">1,1</text>
        </g>

        {furos}

        {/* ── LADO DE BAIXO: barramento, pontes e os fios roteados ── */}
        {verso && (
          <>
            <line x1={X(BARRAMENTO_0V.de)} y1={Y(BARRAMENTO_0V.linha)}
                  x2={X(BARRAMENTO_0V.ate)} y2={Y(BARRAMENTO_0V.linha)}
                  stroke="#212529" strokeWidth={1.8} strokeLinecap="round"
                  opacity={ativo(0) ? 1 : 0.1} />
            <text x={(X(BARRAMENTO_0V.de) + X(BARRAMENTO_0V.ate)) / 2}
                  y={Y(BARRAMENTO_0V.linha) - 2.2} textAnchor="middle"
                  fontSize={2.1} fontWeight="700" fill="#212529"
                  opacity={ativo(0) ? 1 : 0.15}>barramento de 0 V · fio NU</text>

            {NOS.map(n => (
              <g key={n.ref} opacity={ativo(n.circuito) ? 1 : 0.1}>
                <line x1={X(n.de)} y1={Y(n.linha)} x2={X(n.ate)} y2={Y(n.linha)}
                      stroke="#212529" strokeWidth={1.4} strokeLinecap="round" />
                <text x={(X(n.de) + X(n.ate)) / 2} y={Y(n.linha) - 1.9}
                      textAnchor="middle" fontSize={1.7} fontWeight="700"
                      fill="#212529">{n.ref}</text>
              </g>
            ))}

            {fios.map(f => {
              const so = fio != null;
              if (so && fio !== f.n) return null;
              const este = fio === f.n;
              const feito = feitos.includes(f.n);
              const op = ativo(f.circuito) ? (feito && !este ? 0.2 : 1) : 0.07;
              const [ex, ey] = f.pontos[f.pontos.length - 1];
              const rot = f.pontos[Math.floor(f.pontos.length / 2)];
              return (
                <g key={f.n} onClick={() => setFio(este ? null : f.n)}
                   style={{ cursor: 'pointer' }} opacity={op}>
                  <path d={f.d} fill="none" stroke="transparent" strokeWidth={3.5} />
                  <path d={f.d} fill="none" stroke={corDe(f.circuito)}
                        strokeWidth={este ? 1.3 : 0.75} strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray={feito && !este ? '1.4 1.2' : undefined} />
                  {/* ponto de solda nas duas pontas */}
                  <circle cx={f.pontos[0][0] * PASSO} cy={f.pontos[0][1] * PASSO}
                          r={este ? 1.4 : 0.95} fill={corDe(f.circuito)} />
                  <circle cx={ex * PASSO} cy={ey * PASSO}
                          r={este ? 1.4 : 0.95} fill={corDe(f.circuito)} />
                  {/* o número, no meio do percurso */}
                  <circle cx={rot[0] * PASSO} cy={rot[1] * PASSO} r={este ? 2.2 : 1.55}
                          fill="#fff" stroke={corDe(f.circuito)} strokeWidth={0.4} />
                  <text x={rot[0] * PASSO} y={rot[1] * PASSO + (este ? 0.8 : 0.55)}
                        textAnchor="middle" fontSize={este ? 2.3 : 1.6} fontWeight="700"
                        fill={corDe(f.circuito)}>{f.n}</text>
                </g>
              );
            })}
          </>
        )}

        {/* ── LADO DE CIMA: bornes, componentes, CI e módulos ── */}
        {!verso && (
          <>
            <line x1={X(BARRAMENTO_0V.de)} y1={Y(BARRAMENTO_0V.linha)}
                  x2={X(BARRAMENTO_0V.ate)} y2={Y(BARRAMENTO_0V.linha)}
                  stroke="#868e96" strokeWidth={0.8} strokeDasharray="1.2 1.2"
                  opacity={0.45} />
            <text x={X(BARRAMENTO_0V.ate) + 2} y={Y(BARRAMENTO_0V.linha) + 0.8}
                  fontSize={1.7} fill="#868e96">0 V (por baixo)</text>

            {DISCRETOS.map(c => {
              const [[c1, l1], [c2, l2]] = c.furos;
              const x1 = X(c1), y1 = Y(l1), x2 = X(c2), y2 = Y(l2);
              const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
              const cor = corDe(c.circuito), on = ativo(c.circuito);
              const ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
              const vert = Math.abs(x2 - x1) < 0.1;
              return (
                <g key={c.ref} onClick={() => setSel(c)} style={{ cursor: 'pointer' }}
                   opacity={on ? 1 : 0.18}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#8a8f94" strokeWidth={0.55} />
                  {c.tipo === 'capacitor' ? (
                    <ellipse cx={mx} cy={my} rx={2.5} ry={1.9} fill="#2d6cb5"
                             stroke={cor} strokeWidth={0.45} />
                  ) : (
                    <g transform={`translate(${mx} ${my}) rotate(${ang})`}>
                      <rect x={-3.2} y={-1.4} width={6.4} height={2.8} rx={1.1}
                            fill="#c9b28a" stroke={cor} strokeWidth={0.45} />
                      {[-1.6, -0.5, 0.6].map((d, i) => (
                        <rect key={i} x={d} y={-1.4} width={0.55} height={2.8}
                              fill={['#7a4b28', '#2b2b2b', '#b34a2f'][i]} opacity={0.8} />
                      ))}
                    </g>
                  )}
                  <text x={mx + (vert ? 4 : 0)} y={my + (vert ? -0.8 : -4)}
                        textAnchor={vert ? 'start' : 'middle'} fontSize={2.1}
                        fontWeight="700" fill={cor}>{c.ref}</text>
                  <text x={mx + (vert ? 4 : 0)} y={my + (vert ? 2 : 6.4)}
                        textAnchor={vert ? 'start' : 'middle'} fontSize={1.8}
                        fill="#495057">{c.valor}</text>
                </g>
              );
            })}

            {CI && (() => {
              const xs = [X(CI.colEsq), X(CI.colDir)];
              const x1 = Math.min(...xs) - PASSO / 2, x2 = Math.max(...xs) + PASSO / 2;
              const y1 = Y(CI.linhaTopo) - PASSO / 2, y2 = Y(CI.linhaBase) + PASSO / 2;
              const cor = corDe(4);
              return (
                <g onClick={() => setSel(CI)} style={{ cursor: 'pointer' }}
                   opacity={ativo(4) ? 1 : 0.18}>
                  <rect x={x1 - 0.8} y={y1 - 0.8} width={x2 - x1 + 1.6} height={y2 - y1 + 1.6}
                        rx={0.6} fill="#2b2b2b" stroke="#000" strokeWidth={0.3} />
                  <rect x={x1} y={y1} width={x2 - x1} height={y2 - y1} rx={0.5}
                        fill="#3a3a3a" stroke={cor} strokeWidth={0.5} />
                  <path d={`M ${x2} ${(y1 + y2) / 2 - 2.2} A 2.2 2.2 0 0 0 ${x2} ${(y1 + y2) / 2 + 2.2}`}
                        fill="#1a1a1a" stroke="#888" strokeWidth={0.3} />
                  <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 + 0.9} textAnchor="middle"
                        fontSize={2.4} fill="#f1f3f5" fontWeight="700">{CI.valor}</text>
                  {CI.pinos.map(p => (
                    <g key={p.n}>
                      <rect x={X(p.col) - 0.6} y={Y(p.lin) - 0.6} width={1.2} height={1.2}
                            rx={0.15} fill={p.livre ? '#868e96' : '#e9c46a'} />
                      <text x={X(p.col)}
                            y={p.lin === CI.linhaTopo ? Y(p.lin) - 2.0 : Y(p.lin) + 3.3}
                            textAnchor="middle" fontSize={1.45}
                            fill={p.livre ? '#adb5bd' : '#f8f9fa'}
                            fontWeight={p.livre ? 400 : 700}>{p.nome}</text>
                    </g>
                  ))}
                  <text x={(x1 + x2) / 2} y={y1 - 3.4} textAnchor="middle"
                        fontSize={2.1} fontWeight="700" fill={cor}>
                    {CI.ref} · chanfro à direita
                  </text>
                </g>
              );
            })()}

            {MODULOS.map(m => {
              const { colEsq, colDir, linTopo, linBase } = m.corpo;
              const xs = [X(colEsq), X(colDir)];
              const xa = Math.min(...xs) - PASSO / 2, xb = Math.max(...xs) + PASSO / 2;
              const y1 = Y(linTopo) - PASSO / 2, y2 = Y(linBase) + PASSO / 2;
              const linhas = [...new Set(m.pinos.map(p => p.lin))];
              return (
                <g key={m.ref} onClick={() => setSel(m)} style={{ cursor: 'pointer' }}
                   opacity={ativo(m.circuito) ? 1 : 0.18}>
                  <rect x={xa} y={y1} width={xb - xa} height={y2 - y1} rx={0.8}
                        fill="#1e5631" stroke={m.cor} strokeWidth={0.6} opacity={0.93} />
                  <text x={(xa + xb) / 2} y={(y1 + y2) / 2 - 0.4} textAnchor="middle"
                        fontSize={2.9} fill="#e6f4ea" fontWeight="700">{m.valor}</text>
                  <text x={(xa + xb) / 2} y={(y1 + y2) / 2 + 2.8} textAnchor="middle"
                        fontSize={1.9} fill="#a8d5b8">{m.descricao}</text>
                  {linhas.map(l => {
                    const px = m.pinos.filter(p => p.lin === l).map(p => X(p.col));
                    return (
                      <rect key={l} x={Math.min(...px) - 1.1} y={Y(l) - 1.25}
                            width={Math.max(...px) - Math.min(...px) + 2.2} height={2.5}
                            rx={0.3} fill="#111" />
                    );
                  })}
                  {m.pinos.map(p => (
                    <g key={p.n}>
                      <rect x={X(p.col) - 0.55} y={Y(p.lin) - 0.55} width={1.1} height={1.1}
                            rx={0.12}
                            fill={p.alerta ? '#ff6b6b' : (p.livre ? '#5c6b62' : '#e9c46a')} />
                      {!p.livre && (
                        <text x={X(p.col)} y={Y(p.lin) - 1.6} textAnchor="start"
                              fontSize={1.4} fontWeight="700"
                              transform={`rotate(-90 ${X(p.col)} ${Y(p.lin) - 1.6})`}
                              fill={p.alerta ? '#c92a2a' : '#343a40'}>{p.nome}</text>
                      )}
                    </g>
                  ))}
                  <text x={(xa + xb) / 2} y={y1 - 2.0} textAnchor="middle"
                        fontSize={2.0} fontWeight="700" fill={m.cor}>
                    {m.ref} · encaixa na barra fêmea
                  </text>
                </g>
              );
            })}
          </>
        )}

        {/* ── bornes — aparecem nos dois lados, porque atravessam a placa ── */}
        {BORNES.map(b => {
          const cols = b.vias.map(v => X(v.col));
          const x1 = Math.min(...cols) - PASSO, x2 = Math.max(...cols) + PASSO;
          const y1 = Y(b.corpo[0]), y2 = Y(b.corpo[1]);
          const emCima = b.linha < PLACA.linhas / 2;
          /* ⭐ os rótulos das vias saem na VERTICAL, numa faixa RESERVADA fora
             da placa — na diagonal eles se atropelavam com o título do borne */
          const yRot = emCima ? y1 - 2.6 : y2 + 2.6;
          const yTit = emCima ? y1 - 20 : y2 + 21;
          return (
            <g key={b.ref} opacity={verso ? 0.4 : 1}>
              <rect x={x1} y={y1} width={x2 - x1} height={y2 - y1} rx={1}
                    fill={verso ? '#8aa891' : '#2f6f3e'} stroke="#1c4526" strokeWidth={0.4} />
              <text x={(x1 + x2) / 2} y={yTit} textAnchor="middle"
                    fontSize={2.8} fontWeight="700" fill={b.cor}>
                {b.ref} — {b.papel}
              </text>
              {b.vias.map(v => (
                <g key={v.n} onClick={() => setSel({ ...v, ref: `${b.ref}-${v.n}`,
                                                     ehVia: true, borne: b })}
                   style={{ cursor: 'pointer' }}>
                  {!verso && (
                    <>
                      <circle cx={X(v.col)} cy={emCima ? y1 + 2.6 : y2 - 2.6} r={1.8}
                              fill="#c0c4c8" stroke="#7a7f84" strokeWidth={0.3} />
                      <line x1={X(v.col) - 1.1} y1={emCima ? y1 + 2.6 : y2 - 2.6}
                            x2={X(v.col) + 1.1} y2={emCima ? y1 + 2.6 : y2 - 2.6}
                            stroke="#5a5f64" strokeWidth={0.45} />
                    </>
                  )}
                  <rect x={X(v.col) - 0.55} y={Y(b.linha) - 0.55} width={1.1} height={1.1}
                        fill="#d9a441" />
                  <text x={X(v.col)} y={yRot} fontSize={1.95} fontWeight="700"
                        textAnchor={emCima ? 'start' : 'end'}
                        fill={v.alerta ? '#c92a2a' : (v.livre ? '#adb5bd' : '#212529')}
                        transform={`rotate(-90 ${X(v.col)} ${yRot})`}>
                    {b.ref}-{v.n} · {v.sinal}
                  </text>
                </g>
              ))}
            </g>
          );
        })}

        {/* régua de 50 mm, para conferir a impressão com uma régua de verdade */}
        <g transform={`translate(${PASSO} ${alt + 40})`}>
          <line x1={0} y1={0} x2={50} y2={0} stroke="#495057" strokeWidth={0.4} />
          <line x1={0} y1={-1.5} x2={0} y2={1.5} stroke="#495057" strokeWidth={0.4} />
          <line x1={50} y1={-1.5} x2={50} y2={1.5} stroke="#495057" strokeWidth={0.4} />
          <text x={25} y={-2.2} textAnchor="middle" fontSize={2.2} fill="#495057">
            50 mm reais
          </text>
        </g>
      </svg>
    </div>
  );
}

/* ── a tela ────────────────────────────────────────────────────────── */
export default function PlacaIlhada({ dados, titulo, onFechar }) {
  const { PLACA, BORNES, BARRAMENTO_0V, NOS, JUMPERS, CIRCUITOS, ORDEM_MONTAGEM } = dados;
  const DISCRETOS = dados.COMPONENTES_PI1 ?? dados.COMPONENTES_PI2 ?? [];
  const CI = dados.CI1 ?? null;
  const MODULOS = dados.MODULOS ?? [];

  const [modo, setModo] = useState('ambos');
  const [circuito, setCircuito] = useState(null);
  const [sel, setSel] = useState(null);
  const [fio, setFio] = useState(null);
  const [detalhe, setDetalhe] = useState(null);
  const chaveLS = `soldado:${titulo}`;
  const [feitos, setFeitos] = useState(() => {
    try { return JSON.parse(localStorage.getItem(chaveLS)) ?? []; } catch { return []; }
  });
  useEffect(() => {
    try { localStorage.setItem(chaveLS, JSON.stringify(feitos)); } catch { /* sem espaço */ }
  }, [feitos, chaveLS]);

  const ativo = id => circuito === null || circuito === id;
  const corDe = id => CIRCUITOS.find(c => c.id === id)?.cor ?? '#868e96';
  const marca = n => setFeitos(f => f.includes(n) ? f.filter(x => x !== n) : [...f, n]);

  /* o comprimento vem do caminho roteado, não da linha reta —
     é ele que diz quanto fio cortar de verdade */
  const roteados = useMemo(() => rotear(JUMPERS, PLACA), [JUMPERS, PLACA]);
  const porN = useMemo(() => new Map(roteados.map(f => [f.n, f])), [roteados]);
  const totalHops = roteados.reduce((a, f) => a + f.hops.length, 0);

  const props = {
    PLACA, BORNES, BARRAMENTO_0V, NOS, JUMPERS, DISCRETOS, CI, MODULOS,
    corDe, ativo, setSel, fio, setFio, feitos,
  };
  const faltam = JUMPERS.filter(j => !feitos.includes(j.n)).length;

  return (
    <div style={{ display: 'flex', height: '100%', background: '#eef1f5', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
        <div style={{ display: 'flex', gap: 7, marginBottom: 12, flexWrap: 'wrap' }}>
          {[['ambos', '⇄ Os dois lados'], ['topo', '🔺 Só os componentes'],
            ['verso', '🔻 Só a fiação']].map(([id, txt]) => (
            <button key={id} onClick={() => setModo(id)} style={{
              background: modo === id ? '#1d3557' : '#fff',
              color: modo === id ? '#fff' : '#1d3557',
              border: '2px solid #1d3557', borderRadius: 7, padding: '7px 13px',
              cursor: 'pointer', fontSize: 12.5, fontWeight: 700 }}>{txt}</button>
          ))}
          {fio != null && (
            <button onClick={() => setFio(null)} style={{
              background: '#fff3bf', border: '2px solid #f59f00', borderRadius: 7,
              padding: '7px 13px', cursor: 'pointer', fontSize: 12.5, fontWeight: 700 }}>
              mostrando só o fio {fio} — ver todos
            </button>
          )}
        </div>

        <div style={{ background: '#fff3bf', borderRadius: 6, padding: '9px 12px',
                      fontSize: 12, marginBottom: 12, lineHeight: 1.55 }}>
          ⚠️ <b>O lado da solda é desenhado espelhado</b>, porque é assim que você o vê ao
          virar a placa. Confira o <b style={{ color: '#c92a2a' }}>marco vermelho do furo
          1,1</b> antes de soldar cada fio: em cima ele fica à esquerda, embaixo à direita.
          <br />
          🌉 Onde um fio <b>passa por cima de outro</b>, ele ganha uma <b>lombada em arco</b>.
          Quem tem a lombada vai por cima; quem passa reto fica embaixo.
          {totalHops > 0 && <> Nesta placa são <b>{totalHops} cruzamentos</b>.</>}
        </div>

        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          {(modo === 'ambos' || modo === 'topo') && <Face face="topo" {...props} />}
          {(modo === 'ambos' || modo === 'verso') && <Face face="verso" {...props} />}
        </div>
      </div>

      {/* ── lateral ── */}
      <aside style={{ width: 360, background: '#fff', borderLeft: '1px solid #dee2e6',
                      overflowY: 'auto', flexShrink: 0 }}>
        <div style={{ background: '#1d3557', color: '#fff', padding: '13px 15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <b style={{ fontSize: 16 }}>{titulo}</b>
            {onFechar && <button onClick={onFechar} style={{
              background: '#ffffff33', color: '#fff', border: 'none', borderRadius: 5,
              width: 26, height: 26, cursor: 'pointer' }}>×</button>}
          </div>
          <div style={{ fontSize: 11.5, opacity: 0.85, marginTop: 4 }}>
            {PLACA.colunas} × {PLACA.linhas} furos ·{' '}
            {PLACA.larguraMm.toFixed(0)} × {PLACA.alturaMm.toFixed(0)} mm · passo 2,54 mm
          </div>
        </div>

        {PLACA.bruta && (
          <div style={{ padding: '11px 15px', background: '#e7f5ff',
                        borderBottom: '1px solid #a5d8ff', fontSize: 11.5, lineHeight: 1.55 }}>
            <b style={{ color: '#1971c2' }}>✂️ Da placa comprada até esta</b>
            <div style={{ marginTop: 4 }}>
              {PLACA.bruta.nome} — {PLACA.bruta.colunas} × {PLACA.bruta.linhas} furos
            </div>
            <div style={{ marginTop: 5 }}>{PLACA.bruta.corte}</div>
            <div style={{ marginTop: 5, color: '#1864ab' }}>{PLACA.bruta.sobra}</div>
          </div>
        )}

        <div style={{ padding: '11px 15px', borderBottom: '1px solid #eee' }}>
          <div style={{ fontSize: 11, color: '#868e96', marginBottom: 7, letterSpacing: 0.4 }}>
            OS {CIRCUITOS.length} CIRCUITOS — clique para isolar um
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
          <button onClick={() => setDetalhe(circuito ?? 1)} style={{
            display: 'block', width: '100%', marginTop: 6, background: '#f08c00',
            color: '#fff', border: 'none', borderRadius: 6, padding: '9px 10px',
            cursor: 'pointer', fontSize: 12.5, fontWeight: 700,
          }}>
            🔬 Como cada perna é ligada — vista ampliada
          </button>
        </div>

        {/* ⭐ a lista de fios, para riscar enquanto solda */}
        <div style={{ padding: '11px 15px', borderBottom: '1px solid #eee' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between',
                        alignItems: 'baseline', marginBottom: 7 }}>
            <span style={{ fontSize: 11, color: '#868e96', letterSpacing: 0.4 }}>
              OS {JUMPERS.length} FIOS — risque enquanto solda
            </span>
            <span style={{ fontSize: 11, fontWeight: 700,
                           color: faltam ? '#e8590c' : '#2f9e44' }}>
              {faltam ? `faltam ${faltam}` : 'todos ✓'}
            </span>
          </div>
          {feitos.length > 0 && (
            <button onClick={() => setFeitos([])} style={{
              fontSize: 10.5, background: '#f1f3f5', border: '1px solid #ced4da',
              borderRadius: 4, padding: '3px 8px', cursor: 'pointer', marginBottom: 7 }}>
              limpar as marcações
            </button>
          )}
          {JUMPERS.filter(j => ativo(j.circuito)).map(j => {
            const feito = feitos.includes(j.n);
            const este = fio === j.n;
            const r = porN.get(j.n);
            const mm = r?.comprimento ?? 0;
            return (
              <div key={j.n} onClick={() => { setFio(este ? null : j.n); setModo('verso'); }}
                style={{
                  display: 'flex', gap: 7, alignItems: 'flex-start', cursor: 'pointer',
                  padding: '5px 7px', borderRadius: 5, marginBottom: 2,
                  background: este ? '#fff3bf' : (feito ? '#f8f9fa' : '#fff'),
                  border: `1px solid ${este ? '#f59f00' : '#f1f3f5'}`,
                  opacity: feito && !este ? 0.55 : 1,
                }}>
                <input type="checkbox" checked={feito} onClick={e => e.stopPropagation()}
                       onChange={() => marca(j.n)} style={{ marginTop: 2 }} />
                <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700,
                               color: corDe(j.circuito), minWidth: 16 }}>{j.n}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11.5,
                                textDecoration: feito ? 'line-through' : 'none' }}>
                    {j.sinal}
                  </div>
                  <div style={{ fontSize: 10, color: '#868e96', fontFamily: 'monospace' }}>
                    ({j.de[0]},{j.de[1]}) → ({j.para[0]},{j.para[1]}) ·{' '}
                    corte {(mm + 15).toFixed(0)} mm
                    {r?.hops.length > 0 && ` · 🌉 ${r.hops.length}`}
                  </div>
                  {j.alerta && (
                    <div style={{ fontSize: 10, color: '#c92a2a', fontWeight: 700 }}>
                      ⚠️ confira este antes de energizar
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div style={{ marginTop: 8, padding: 9, background: '#f1f3f5', borderRadius: 5,
                        fontSize: 10.5, color: '#495057', lineHeight: 1.5 }}>
            📐 O <b>corte</b> é o comprimento do caminho em ângulo reto mais 15 mm para
            descascar as pontas e sobrar folga — <b>não</b> a linha reta entre os furos.
            Fio <b>isolado</b> de 0,25 mm²; só o barramento de 0 V é nu.
            <br />🌉 = quantas vezes este fio passa por cima de outro.
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
              </div>
            )}
            {sel.papel && (
              <div style={{ fontSize: 11.5, marginTop: 6, lineHeight: 1.5 }}>
                {sel.papel}
                {sel.porque && (
                  <div style={{ marginTop: 6, paddingTop: 6,
                                borderTop: '1px solid #f5a52444' }}>
                    <b>Por que existe:</b> {sel.porque}
                  </div>
                )}
                {sel.ligacao && (
                  <div style={{ marginTop: 6, paddingTop: 6,
                                borderTop: '1px solid #f5a52444' }}>
                    <b>Como ligar:</b> {sel.ligacao}
                  </div>
                )}
                {sel.aviso && (
                  <div style={{ marginTop: 6, color: '#c92a2a' }}>⚠️ {sel.aviso}</div>
                )}
                {sel.aConferir && (
                  <div style={{ marginTop: 6, color: '#7a5c00' }}>🔎 {sel.aConferir}</div>
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
          <div style={{ marginTop: 11, padding: 10, background: '#fff5f5', borderRadius: 6,
                        fontSize: 11, color: '#c92a2a', lineHeight: 1.5 }}>
            <b>Caixa:</b> {PLACA.caixa}.<br />{PLACA.nota}
          </div>
        </div>
      </aside>

      {detalhe != null && (
        <DetalheCircuito dados={dados} circuito={detalhe} onFechar={() => setDetalhe(null)} />
      )}
    </div>
  );
}
