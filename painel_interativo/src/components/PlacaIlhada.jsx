import { useState, useMemo, useEffect } from 'react';
import { rotear } from '../lib/roteador';
import { construirRede } from '../lib/rede';
import { letra, cel } from '../lib/celula';

/* Placa ilhada endereçada como uma planilha: coluna em LETRA, fileira
   em NÚMERO. O furo da coluna 11, fileira 6, é a célula K6.

   ⭐ POR QUE ISSO RESOLVE O PROBLEMA: "furo 11,6" e "furo 6,11" se
   trocam sozinhos na cabeça de quem está soldando. "K6" não. E o
   endereço é do FURO, não da vista — K6 é o mesmo furo olhando por
   cima ou por baixo, só muda o lado da tela em que ele aparece.

   Clique em qualquer furo, letra ou número e o painel diz exatamente o
   que existe ali e a que aquilo está ligado.                         */

const PASSO = 2.54;
const kp = ([c, l]) => `${c},${l}`;

/* ── um lado da placa ──────────────────────────────────────────────── */
function Face({
  face, PLACA, BORNES, BARRAMENTO_0V, NOS, JUMPERS, DISCRETOS, CI, MODULOS,
  corDe, ativo, alvo, setAlvo, fio, setFio, feitos, escala, umLado,
}) {
  const verso = face === 'verso';
  const M = c => (verso ? PLACA.colunas + 1 - c : c);
  const X = c => M(c) * PASSO;
  const Y = l => l * PASSO;

  const fios = useMemo(() => {
    if (!verso) return [];
    return rotear(JUMPERS.map(j => ({
      ...j, de: [M(j.de[0]), j.de[1]], para: [M(j.para[0]), j.para[1]],
    })), PLACA);
  }, [verso, JUMPERS, PLACA]);

  const ocupados = useMemo(() => {
    const m = new Map();
    const põe = (c, l, q) => m.set(`${c},${l}`, [...(m.get(`${c},${l}`) ?? []), q]);
    DISCRETOS.forEach(x => x.furos.forEach(([c, l]) => põe(c, l, x.ref)));
    if (CI) CI.pinos.forEach(p => põe(p.col, p.lin, `${CI.ref}.${p.nome}`));
    MODULOS.forEach(x => x.pinos.forEach(p => põe(p.col, p.lin, `${x.ref}.${p.nome}`)));
    BORNES.forEach(b => b.vias.forEach(v => põe(v.col, b.linha, `${b.ref}-${v.n}`)));
    return m;
  }, [DISCRETOS, CI, MODULOS, BORNES]);

  const larg = PLACA.colunas * PASSO, alt = PLACA.linhas * PASSO;
  const vb = { x: -8 * PASSO, y: -34, w: larg + 15 * PASSO, h: alt + 34 + 42 };

  const marcado = (c, l) =>
    (alvo?.tipo === 'cel' && alvo.col === c && alvo.lin === l) ||
    (alvo?.tipo === 'lin' && alvo.lin === l) ||
    (alvo?.tipo === 'col' && alvo.col === c);

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
          {verso ? 'ESPELHADO — as letras correm ao contrário' : 'como você vê na bancada'}
        </span>
      </div>

      <div style={{ overflow: 'auto', background: '#fff',
                    borderRadius: '0 0 7px 7px', boxShadow: '0 1px 6px #0002' }}>
      <svg width={vb.w * escala * (umLado ? 1 : 0.62)}
           viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
           style={{ display: 'block', minWidth: '100%' }}>

        {/* faixa da linha / coluna escolhida, por baixo de tudo */}
        {alvo?.tipo === 'lin' && (
          <rect x={PASSO * 0.5} y={Y(alvo.lin) - PASSO / 2} width={larg} height={PASSO}
                fill="#ffd43b" opacity={0.45} />
        )}
        {alvo?.tipo === 'col' && (
          <rect x={X(alvo.col) - PASSO / 2} y={PASSO * 0.5} width={PASSO} height={alt}
                fill="#ffd43b" opacity={0.45} />
        )}

        <rect x={PASSO * 0.5} y={PASSO * 0.5} width={larg} height={alt} rx={1.2}
              fill={verso ? '#c9b98c' : '#d8c9a3'} stroke="#a8946a" strokeWidth={0.5}
              opacity={0.92} />

        {/* ── cabeçalho de LETRAS, em cima ── */}
        {Array.from({ length: PLACA.colunas }, (_, i) => i + 1).map(c => {
          const on = alvo?.tipo === 'col' && alvo.col === c;
          return (
            <g key={`h${c}`} onClick={() => setAlvo(on ? null : { tipo: 'col', col: c })}
               style={{ cursor: 'pointer' }}>
              <rect x={X(c) - PASSO / 2} y={-5.6} width={PASSO} height={4.4}
                    fill={on ? '#f59f00' : (c % 5 === 0 ? '#dee2e6' : '#f1f3f5')}
                    stroke="#ced4da" strokeWidth={0.12} />
              <text x={X(c)} y={-2.4} textAnchor="middle" fontSize={2.0}
                    fontWeight={on || c % 5 === 0 ? 700 : 400}
                    fill={on ? '#fff' : '#495057'}>{letra(c)}</text>
            </g>
          );
        })}

        {/* ── cabeçalho de NÚMEROS, nos dois lados ── */}
        {Array.from({ length: PLACA.linhas }, (_, i) => i + 1).map(l => {
          const on = alvo?.tipo === 'lin' && alvo.lin === l;
          return [-1, 1].map(lado => (
            <g key={`v${l}${lado}`} onClick={() => setAlvo(on ? null : { tipo: 'lin', lin: l })}
               style={{ cursor: 'pointer' }}>
              <rect x={lado < 0 ? -5.4 : larg + 1.4} y={Y(l) - PASSO / 2}
                    width={4.4} height={PASSO}
                    fill={on ? '#f59f00' : (l % 5 === 0 ? '#dee2e6' : '#f1f3f5')}
                    stroke="#ced4da" strokeWidth={0.12} />
              <text x={lado < 0 ? -3.2 : larg + 3.6} y={Y(l) + 0.75} textAnchor="middle"
                    fontSize={1.9} fontWeight={on || l % 5 === 0 ? 700 : 400}
                    fill={on ? '#fff' : '#495057'}>{l}</text>
            </g>
          ));
        })}

        {/* ── os furos, todos clicáveis ── */}
        {Array.from({ length: PLACA.colunas }, (_, i) => i + 1).flatMap(c =>
          Array.from({ length: PLACA.linhas }, (_, j) => j + 1).map(l => {
            const usado = ocupados.has(`${c},${l}`);
            const mk = marcado(c, l);
            return (
              <g key={`${c},${l}`} onClick={() => setAlvo({ tipo: 'cel', col: c, lin: l })}
                 style={{ cursor: 'pointer' }}>
                <circle cx={X(c)} cy={Y(l)} r={1.25} fill="transparent" />
                {mk && alvo?.tipo === 'cel' && (
                  <circle cx={X(c)} cy={Y(l)} r={2.1} fill="none" stroke="#e8590c"
                          strokeWidth={0.55} />
                )}
                <circle cx={X(c)} cy={Y(l)} r={usado ? 1.05 : 0.8}
                        fill={usado ? '#e8b04b' : '#c4b183'}
                        opacity={usado ? 1 : (mk ? 0.7 : 0.28)} />
                <circle cx={X(c)} cy={Y(l)} r={0.4} fill="#4a3c10"
                        opacity={usado ? 0.9 : 0.3} />
              </g>
            );
          }))}

        {/* ── LADO DE BAIXO ── */}
        {verso && (
          <>
            <line x1={X(BARRAMENTO_0V.de)} y1={Y(BARRAMENTO_0V.linha)}
                  x2={X(BARRAMENTO_0V.ate)} y2={Y(BARRAMENTO_0V.linha)}
                  stroke="#212529" strokeWidth={1.8} strokeLinecap="round"
                  opacity={ativo(0) ? 1 : 0.1} />
            <text x={(X(BARRAMENTO_0V.de) + X(BARRAMENTO_0V.ate)) / 2}
                  y={Y(BARRAMENTO_0V.linha) - 2.2} textAnchor="middle"
                  fontSize={2.1} fontWeight="700" fill="#212529"
                  opacity={ativo(0) ? 1 : 0.15}>
              barramento de 0 V · fio NU · {cel(BARRAMENTO_0V.de, BARRAMENTO_0V.linha)}
              {' → '}{cel(BARRAMENTO_0V.ate, BARRAMENTO_0V.linha)}
            </text>

            {NOS.map(n => (
              <g key={n.ref} opacity={ativo(n.circuito) ? 1 : 0.1}>
                <line x1={X(n.de)} y1={Y(n.linha)} x2={X(n.ate)} y2={Y(n.linha)}
                      stroke="#212529" strokeWidth={1.4} strokeLinecap="round" />
                <text x={(X(n.de) + X(n.ate)) / 2} y={Y(n.linha) - 1.9}
                      textAnchor="middle" fontSize={1.7} fontWeight="700" fill="#212529">
                  {n.ref} · {cel(n.de, n.linha)}–{cel(n.ate, n.linha)}
                </text>
              </g>
            ))}

            {fios.map(f => {
              if (fio != null && fio !== f.n) return null;
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
                  <circle cx={f.pontos[0][0] * PASSO} cy={f.pontos[0][1] * PASSO}
                          r={este ? 1.4 : 0.95} fill={corDe(f.circuito)} />
                  <circle cx={ex * PASSO} cy={ey * PASSO}
                          r={este ? 1.4 : 0.95} fill={corDe(f.circuito)} />
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

        {/* ── LADO DE CIMA ── */}
        {!verso && (
          <>
            <line x1={X(BARRAMENTO_0V.de)} y1={Y(BARRAMENTO_0V.linha)}
                  x2={X(BARRAMENTO_0V.ate)} y2={Y(BARRAMENTO_0V.linha)}
                  stroke="#868e96" strokeWidth={0.8} strokeDasharray="1.2 1.2"
                  opacity={0.45} />

            {DISCRETOS.map(c => {
              const [[c1, l1], [c2, l2]] = c.furos;
              const x1 = X(c1), y1 = Y(l1), x2 = X(c2), y2 = Y(l2);
              const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
              const cor = corDe(c.circuito);
              const ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
              const vert = Math.abs(x2 - x1) < 0.1;
              return (
                <g key={c.ref} onClick={() => setAlvo({ tipo: 'cel', col: c1, lin: l1 })}
                   style={{ cursor: 'pointer' }} opacity={ativo(c.circuito) ? 1 : 0.18}>
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
                        fontWeight="700" fill={cor}>{c.ref} · {c.valor}</text>
                  <text x={mx + (vert ? 4 : 0)} y={my + (vert ? 2 : 6.4)}
                        textAnchor={vert ? 'start' : 'middle'} fontSize={1.75}
                        fill="#868e96">{cel(c1, l1)} ↔ {cel(c2, l2)}</text>
                </g>
              );
            })}

            {CI && (() => {
              const xs = [X(CI.colEsq), X(CI.colDir)];
              const x1 = Math.min(...xs) - PASSO / 2, x2 = Math.max(...xs) + PASSO / 2;
              const y1 = Y(CI.linhaTopo) - PASSO / 2, y2 = Y(CI.linhaBase) + PASSO / 2;
              const cor = corDe(4);
              return (
                <g onClick={() => setAlvo({ tipo: 'cel', col: CI.pinos[0].col,
                                            lin: CI.pinos[0].lin })}
                   style={{ cursor: 'pointer' }} opacity={ativo(4) ? 1 : 0.18}>
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
                            textAnchor="middle" fontSize={1.4}
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
                <g key={m.ref} onClick={() => setAlvo({ tipo: 'cel', col: m.pinos[0].col,
                                                        lin: m.pinos[0].lin })}
                   style={{ cursor: 'pointer' }} opacity={ativo(m.circuito) ? 1 : 0.18}>
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

        {/* ── bornes ── */}
        {BORNES.map(b => {
          const cols = b.vias.map(v => X(v.col));
          const x1 = Math.min(...cols) - PASSO, x2 = Math.max(...cols) + PASSO;
          const y1 = Y(b.corpo[0]), y2 = Y(b.corpo[1]);
          const emCima = b.linha < PLACA.linhas / 2;
          const yRot = emCima ? y1 - 7.5 : y2 + 7.5;
          const yTit = emCima ? y1 - 27 : y2 + 27;
          return (
            <g key={b.ref} opacity={verso ? 0.4 : 1}>
              <rect x={x1} y={y1} width={x2 - x1} height={y2 - y1} rx={1}
                    fill={verso ? '#8aa891' : '#2f6f3e'} stroke="#1c4526" strokeWidth={0.4} />
              <text x={(x1 + x2) / 2} y={yTit} textAnchor="middle"
                    fontSize={2.8} fontWeight="700" fill={b.cor}>
                {b.ref} — {b.papel}
              </text>
              {b.vias.map(v => (
                <g key={v.n} onClick={() => setAlvo({ tipo: 'cel', col: v.col, lin: b.linha })}
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
                    {cel(v.col, b.linha)} · {b.ref}-{v.n} {v.sinal}
                  </text>
                </g>
              ))}
            </g>
          );
        })}
      </svg>
      </div>
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
  const [alvo, setAlvo] = useState(null);     // { tipo:'cel'|'lin'|'col', col, lin }
  const [fio, setFio] = useState(null);
  const [escala, setEscala] = useState(6);
  const chaveLS = `soldado:${titulo}`;
  const [feitos, setFeitos] = useState(() => {
    try { return JSON.parse(localStorage.getItem(chaveLS)) ?? []; } catch { return []; }
  });
  useEffect(() => {
    try { localStorage.setItem(chaveLS, JSON.stringify(feitos)); } catch { /* cheio */ }
  }, [feitos, chaveLS]);

  const ativo = id => circuito === null || circuito === id;
  const corDe = id => CIRCUITOS.find(c => c.id === id)?.cor ?? '#868e96';
  const marca = n => setFeitos(f => f.includes(n) ? f.filter(x => x !== n) : [...f, n]);

  const rede = useMemo(() => construirRede(dados), [dados]);
  const roteados = useMemo(() => rotear(JUMPERS, PLACA), [JUMPERS, PLACA]);
  const porN = useMemo(() => new Map(roteados.map(f => [f.n, f])), [roteados]);

  /* ⭐ tudo o que existe numa célula, e a que ela está ligada */
  const info = useMemo(() => {
    if (alvo?.tipo !== 'cel') return null;
    const { col, lin } = alvo;
    const ponto = `${col},${lin}`;
    const raiz = rede.acha(ponto);
    const nn = rede.nos.get(raiz);
    const aqui = (nn?.membros ?? []).filter(m => m.ponto === ponto);
    const junto = (nn?.membros ?? []).filter(m => m.ponto !== ponto);
    const chegam = JUMPERS.filter(j => kp(j.de) === ponto || kp(j.para) === ponto)
      .map(j => ({ ...j, outraPonta: kp(j.de) === ponto ? j.para : j.de }));
    const pontes = (nn?.pontes ?? []);
    const atraves = rede.elementos
      .filter(e => e.a === raiz || e.b === raiz)
      .map(e => ({ e, outro: rede.nos.get(e.a === raiz ? e.b : e.a) }));
    return { col, lin, nn, aqui, junto, chegam, pontes, atraves, vazia: !nn };
  }, [alvo, rede, JUMPERS]);

  /* o que existe numa fileira ou coluna inteira */
  const lista = useMemo(() => {
    if (alvo?.tipo !== 'lin' && alvo?.tipo !== 'col') return null;
    const itens = [];
    for (const [ponto, ] of rede.nos) { void ponto; }
    for (const nn of rede.nos.values())
      for (const m of nn.membros) {
        const [c, l] = m.ponto.split(',').map(Number);
        if (alvo.tipo === 'lin' ? l === alvo.lin : c === alvo.col)
          itens.push({ ...m, c, l });
      }
    return itens.sort((a, b) => (alvo.tipo === 'lin' ? a.c - b.c : a.l - b.l));
  }, [alvo, rede]);

  const props = {
    PLACA, BORNES, BARRAMENTO_0V, NOS, JUMPERS, DISCRETOS, CI, MODULOS,
    corDe, ativo, alvo, setAlvo, fio, setFio, feitos, escala,
    umLado: modo !== 'ambos',
  };
  const faltam = JUMPERS.filter(j => !feitos.includes(j.n)).length;

  const Cel = ({ c, l }) => (
    <button onClick={() => setAlvo({ tipo: 'cel', col: c, lin: l })} style={{
      fontFamily: 'monospace', fontWeight: 700, fontSize: 11, background: '#f1f3f5',
      border: '1px solid #ced4da', borderRadius: 3, padding: '1px 5px',
      cursor: 'pointer', color: '#1971c2' }}>{cel(c, l)}</button>
  );

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff',
                        border: '2px solid #adb5bd', borderRadius: 7, padding: '4px 11px' }}>
            <button onClick={() => setEscala(e => Math.max(3, e - 1.5))} style={{
              border: 'none', background: 'none', cursor: 'pointer', fontSize: 16,
              fontWeight: 700, color: '#495057', lineHeight: 1 }}>−</button>
            <input type="range" min={3} max={26} step={0.5} value={escala}
                   onChange={e => setEscala(+e.target.value)} style={{ width: 110 }} />
            <button onClick={() => setEscala(e => Math.min(26, e + 1.5))} style={{
              border: 'none', background: 'none', cursor: 'pointer', fontSize: 16,
              fontWeight: 700, color: '#495057', lineHeight: 1 }}>+</button>
          </div>
          {(fio != null || alvo) && (
            <button onClick={() => { setFio(null); setAlvo(null); }} style={{
              background: '#fff3bf', border: '2px solid #f59f00', borderRadius: 7,
              padding: '7px 13px', cursor: 'pointer', fontSize: 12.5, fontWeight: 700 }}>
              limpar seleção
            </button>
          )}
        </div>

        <div style={{ background: '#fff3bf', borderRadius: 6, padding: '9px 12px',
                      fontSize: 12, marginBottom: 12, lineHeight: 1.55 }}>
          🔤 <b>Cada furo tem endereço, como numa planilha:</b> coluna em letra, fileira em
          número. O furo da coluna 11, fileira 6, é a célula <b>K6</b>. Clique num
          <b> furo</b>, numa <b>letra</b> ou num <b>número</b> para ver o que existe ali.
          <br />
          ⚠️ O endereço é do <b>furo</b>, não da vista: <b>K6 é o mesmo furo</b> nos dois
          desenhos. No lado da solda as letras é que correm ao contrário.
        </div>

        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          {(modo === 'ambos' || modo === 'topo') && <Face face="topo" {...props} />}
          {(modo === 'ambos' || modo === 'verso') && <Face face="verso" {...props} />}
        </div>
      </div>

      {/* ── lateral ── */}
      <aside style={{ width: 372, background: '#fff', borderLeft: '1px solid #dee2e6',
                      overflowY: 'auto', flexShrink: 0 }}>
        <div style={{ background: '#1d3557', color: '#fff', padding: '13px 15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <b style={{ fontSize: 16 }}>{titulo}</b>
            {onFechar && <button onClick={onFechar} style={{
              background: '#ffffff33', color: '#fff', border: 'none', borderRadius: 5,
              width: 26, height: 26, cursor: 'pointer' }}>×</button>}
          </div>
          <div style={{ fontSize: 11.5, opacity: 0.85, marginTop: 4 }}>
            A1 até {cel(PLACA.colunas, PLACA.linhas)} ·{' '}
            {PLACA.larguraMm.toFixed(0)} × {PLACA.alturaMm.toFixed(0)} mm · passo 2,54 mm
          </div>
        </div>

        {/* ⭐ o inspetor da célula */}
        {info && (
          <div style={{ padding: '13px 15px', background: '#fffbe6',
                        borderBottom: '3px solid #f5a524' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between',
                          alignItems: 'baseline' }}>
              <b style={{ fontSize: 20, color: '#8a5a00', fontFamily: 'monospace' }}>
                {cel(info.col, info.lin)}
              </b>
              <span style={{ fontSize: 10.5, color: '#868e96' }}>
                coluna {letra(info.col)} ({info.col}) · fileira {info.lin}
              </span>
            </div>

            {info.vazia ? (
              <div style={{ fontSize: 12, color: '#868e96', marginTop: 6 }}>
                Furo livre — não há nada soldado aqui.
              </div>
            ) : (
              <>
                <div style={{ fontSize: 11, color: '#868e96', margin: '9px 0 3px',
                              letterSpacing: 0.4 }}>O QUE TEM NESTE FURO</div>
                {info.aqui.length ? info.aqui.map((m, i) => (
                  <div key={i} style={{ fontSize: 12.5, lineHeight: 1.5 }}>
                    <b>{m.rotulo}</b>{m.sinal ? ` · ${m.sinal}` : ''}
                    {m.liga && (
                      <div style={{ fontSize: 11, color: '#495057', marginLeft: 9 }}>
                        {m.entrada ? '⬅ vem de' : '➡ vai para'} {m.liga}
                      </div>
                    )}
                  </div>
                )) : <div style={{ fontSize: 12, color: '#868e96' }}>nada — só passa fio</div>}

                {info.chegam.length > 0 && (
                  <>
                    <div style={{ fontSize: 11, color: '#868e96', margin: '10px 0 3px',
                                  letterSpacing: 0.4 }}>FIOS QUE CHEGAM AQUI</div>
                    {info.chegam.map(j => (
                      <div key={j.n} style={{ fontSize: 12, lineHeight: 1.6 }}>
                        <button onClick={() => setFio(fio === j.n ? null : j.n)} style={{
                          fontSize: 10.5, fontWeight: 700, borderRadius: 3, padding: '1px 6px',
                          border: `1px solid ${corDe(j.circuito)}`, cursor: 'pointer',
                          background: fio === j.n ? corDe(j.circuito) : '#fff',
                          color: fio === j.n ? '#fff' : corDe(j.circuito),
                        }}>fio {j.n}</button>{' '}
                        vai até <Cel c={j.outraPonta[0]} l={j.outraPonta[1]} />{' '}
                        <span style={{ color: '#868e96' }}>— {j.sinal}</span>
                      </div>
                    ))}
                  </>
                )}

                {info.pontes.length > 0 && (
                  <div style={{ fontSize: 11.5, marginTop: 8, color: '#495057' }}>
                    🔗 ponte de fio nu do <b>{info.pontes[0].ref}</b>, unindo{' '}
                    {cel(info.pontes[0].de, info.pontes[0].linha)} a{' '}
                    {cel(info.pontes[0].ate, info.pontes[0].linha)}
                  </div>
                )}

                {info.junto.length > 0 && (
                  <>
                    <div style={{ fontSize: 11, color: '#868e96', margin: '10px 0 3px',
                                  letterSpacing: 0.4 }}>
                      É O MESMO PONTO ELÉTRICO QUE
                    </div>
                    <div style={{ background: '#e7f5ff', borderRadius: 5, padding: '7px 9px' }}>
                      {info.junto.map((m, i) => {
                        const [c, l] = m.ponto.split(',').map(Number);
                        return (
                          <div key={i} style={{ fontSize: 12, lineHeight: 1.7 }}>
                            <Cel c={c} l={l} /> <b>{m.rotulo}</b>
                            {m.sinal ? ` · ${m.sinal}` : ''}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {info.atraves.length > 0 && (
                  <>
                    <div style={{ fontSize: 11, color: '#868e96', margin: '10px 0 3px',
                                  letterSpacing: 0.4 }}>ATRAVESSANDO UM COMPONENTE, CHEGA EM</div>
                    {info.atraves.map((a, i) => (
                      <div key={i} style={{ fontSize: 12, lineHeight: 1.6,
                                            marginBottom: 4 }}>
                        <b style={{ color: '#c9772a' }}>{a.e.ref}</b>
                        {a.e.valor && a.e.tipo !== 'chip' ? ` · ${a.e.valor}` : ''} →{' '}
                        {a.outro
                          ? (a.outro.ehBus ? <b>barramento de 0 V</b>
                            : a.outro.membros.slice(0, 2).map((m, j) => {
                                const [c, l] = m.ponto.split(',').map(Number);
                                return <span key={j}><Cel c={c} l={l} /> {m.rotulo} </span>;
                              }))
                          : '—'}
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        )}

        {lista && (
          <div style={{ padding: '13px 15px', background: '#fffbe6',
                        borderBottom: '3px solid #f5a524' }}>
            <b style={{ fontSize: 15, color: '#8a5a00' }}>
              {alvo.tipo === 'lin' ? `Fileira ${alvo.lin}` : `Coluna ${letra(alvo.col)}`}
              {' '}— {lista.length} ponto(s)
            </b>
            <div style={{ marginTop: 7 }}>
              {lista.map((m, i) => (
                <div key={i} style={{ fontSize: 12, lineHeight: 1.75 }}>
                  <Cel c={m.c} l={m.l} /> <b>{m.rotulo}</b>
                  {m.sinal ? <span style={{ color: '#495057' }}> · {m.sinal}</span> : ''}
                </div>
              ))}
              {!lista.length && (
                <div style={{ fontSize: 12, color: '#868e96' }}>
                  Nada soldado nesta {alvo.tipo === 'lin' ? 'fileira' : 'coluna'}.
                </div>
              )}
            </div>
          </div>
        )}

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
        </div>

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
            const mm = porN.get(j.n)?.comprimento ?? 0;
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
                  <div style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 700,
                                textDecoration: feito ? 'line-through' : 'none' }}>
                    {cel(...j.de)} → {cel(...j.para)}
                  </div>
                  <div style={{ fontSize: 11, color: '#495057' }}>{j.sinal}</div>
                  <div style={{ fontSize: 10, color: '#868e96' }}>
                    corte {(mm + 15).toFixed(0)} mm
                  </div>
                </div>
              </div>
            );
          })}
        </div>

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
    </div>
  );
}
