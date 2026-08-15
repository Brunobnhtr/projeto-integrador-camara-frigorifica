import { useState } from 'react';
import {
  TELA, AREAS, FONTE, FUSIVEIS, POSTES, ENTRADAS_PAINEL, FIOS, SAIDAS_CAMARA, LEGENDA,
  NIVEIS,
} from '../data/maquete';

/* A maquete vista de cima. Clique num fio e ele fica sozinho na tela,
   com a trajetória inteira contada ao lado.                           */

const traco = pts => pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' ');

export default function VistaMaquete({ onIrPara }) {
  const [sel, setSel] = useState(null);        // fio selecionado
  const [hover, setHover] = useState(null);
  const [alvo, setAlvo] = useState(null);      // poste/área clicada

  const isolando = !!sel;
  const visivel = f => !isolando || sel.id === f.id;

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflow: 'auto', padding: 16, background: '#eef1f5' }}>

        {isolando ? (
          <div style={{ background: sel.cor, color: '#fff', padding: '8px 14px',
                        borderRadius: 7, marginBottom: 10, display: 'flex',
                        justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13 }}>
              Seguindo <b>{sel.nome}</b> — os outros fios estão ocultos
            </span>
            <button onClick={() => setSel(null)} style={{
              background: '#ffffff33', color: '#fff', border: '1px solid #fff8',
              borderRadius: 5, padding: '3px 11px', cursor: 'pointer', fontSize: 12 }}>
              mostrar todos
            </button>
          </div>
        ) : (
          <div style={{ background: '#fff', padding: '9px 14px', borderRadius: 7,
                        marginBottom: 10, fontSize: 12.5, color: '#495057' }}>
            👆 <b>Clique num fio</b> para segui-lo do começo ao fim. Clique num
            <b> poste</b> ou na <b>fonte</b> para entender o que eles fazem.
          </div>
        )}

        <svg viewBox={`-10 -10 ${TELA.largura + 20} ${TELA.altura + 20}`}
             style={{ width: '100%', background: '#fff', borderRadius: 8,
                      boxShadow: '0 1px 6px #0002' }}>

          {/* ── o tabuleiro ── */}
          <rect x={0} y={0} width={TELA.largura} height={TELA.altura} rx={6}
                fill="#f1f3f5" stroke="#ced4da" strokeWidth={2} />
          <text x={14} y={26} fontSize={15} fontWeight="700" fill="#868e96">
            MAQUETE VISTA DE CIMA — 1,20 × 0,60 m
          </text>

          {/* a rua */}
          <rect x={285} y={330} width={480} height={70} fill="#e9ecef" />
          <text x={525} y={372} textAnchor="middle" fontSize={13} fill="#adb5bd"
                letterSpacing={4}>R U A</text>

          {/* faixa do subterrâneo */}
          <rect x={0} y={415} width={TELA.largura} height={TELA.altura - 415}
                fill="#e3dcc9" opacity={0.55} />
          <line x1={0} y1={415} x2={TELA.largura} y2={415} stroke="#c9bda0"
                strokeWidth={2} strokeDasharray="8 5" />
          <text x={16} y={TELA.altura - 14} fontSize={12} fill="#9c8f70">
            ⌄ POR BAIXO DO TABULEIRO — cada ramal desce no seu poste e corre escondido até o painel
          </text>

          {/* ── áreas ── */}
          {AREAS.map(a => (
            <g key={a.id} onClick={() => { setAlvo(a); setSel(null); }}
               style={{ cursor: 'pointer' }}>
              <rect x={a.x} y={a.y} width={a.w} height={a.h} rx={5}
                    fill="#fff" stroke={a.cor} strokeWidth={alvo?.id === a.id ? 3 : 1.5}
                    strokeDasharray="7 4" opacity={0.95} />
              <text x={a.x + 10} y={a.y + 20} fontSize={13} fontWeight="700" fill={a.cor}>
                {a.nome}
              </text>
              <text x={a.x + 10} y={a.y + 36} fontSize={11} fill="#868e96">
                {a.legenda}
              </text>
            </g>
          ))}

          {/* ── a fonte ── */}
          <g onClick={() => { setAlvo({ tipo: 'fonte' }); setSel(null); }}
             style={{ cursor: 'pointer' }}>
            <rect x={FONTE.x} y={FONTE.y} width={FONTE.w} height={FONTE.h} rx={4}
                  fill="#495057" stroke="#212529" strokeWidth={1.5} />
            <text x={FONTE.x + FONTE.w / 2} y={FONTE.y + 20} textAnchor="middle"
                  fontSize={11.5} fontWeight="700" fill="#fff">FONTE 24 V</text>
            <text x={FONTE.x + FONTE.w / 2} y={FONTE.y + 34} textAnchor="middle"
                  fontSize={10} fill="#adb5bd">240 W</text>
            {/* bornes de entrada 127 V */}
            {FONTE.entrada.bornes.map((b, i) => (
              <g key={b.ref}>
                <rect x={FONTE.x - 7} y={FONTE.y + 48 + i * 16} width={7} height={11}
                      fill={b.cor} />
                <text x={FONTE.x - 11} y={FONTE.y + 57 + i * 16} textAnchor="end"
                      fontSize={9} fill="#495057">{b.ref}</text>
              </g>
            ))}
            {/* saídas + */}
            {FONTE.saidas.positivas.map((t, i) => (
              <g key={t}>
                <rect x={FONTE.x + FONTE.w} y={FONTE.y + 19 + i * 30} width={8} height={12}
                      fill="#c92a2a" />
                <text x={FONTE.x + FONTE.w + 12} y={FONTE.y + 29 + i * 30}
                      fontSize={9} fill="#c92a2a" fontWeight="700">{t}</text>
              </g>
            ))}
            {/* saídas − */}
            {FONTE.saidas.negativas.map((t, i) => (
              <g key={t}>
                <rect x={FONTE.x + FONTE.w} y={FONTE.y + 112 + i * 14} width={8} height={10}
                      fill="#212529" />
                <text x={FONTE.x + FONTE.w + 12} y={FONTE.y + 121 + i * 14}
                      fontSize={8.5} fill="#495057">{t}</text>
              </g>
            ))}
          </g>

          {/* ── fusíveis ── */}
          {FUSIVEIS.map(f => (
            <g key={f.ref}>
              <rect x={f.x - 8} y={f.y - 9} width={17} height={18} rx={2}
                    fill="#fff" stroke={f.cor} strokeWidth={2} />
              <text x={f.x} y={f.y + 4} textAnchor="middle" fontSize={8.5}
                    fontWeight="700" fill={f.cor}>{f.ref}</text>
              <text x={f.x} y={f.y - 13} textAnchor="middle" fontSize={8}
                    fill="#868e96">{f.a}</text>
            </g>
          ))}

          {/* ── FIOS ── */}
          {FIOS.map(f => {
            const on = visivel(f);
            const forte = sel?.id === f.id || hover === f.id;
            return (
              <g key={f.id} style={{ cursor: 'pointer' }}
                 onClick={() => { setSel(sel?.id === f.id ? null : f); setAlvo(null); }}
                 onMouseEnter={() => setHover(f.id)} onMouseLeave={() => setHover(null)}>
                {/* área invisível mais grossa, para facilitar o clique */}
                <path d={traco(f.caminho)} fill="none" stroke="transparent" strokeWidth={16} />
                <path d={traco(f.caminho)} fill="none" stroke={f.cor}
                      strokeWidth={forte ? 6 : 3.2}
                      strokeDasharray={f.tracejado ? '9 5' : (f.subterraneo ? '13 6' : undefined)}
                      opacity={on ? 1 : 0.06}
                      strokeLinecap="round" strokeLinejoin="round" />
                {f.derivacoes?.map((d, i) => (
                  <path key={i} d={traco(d)} fill="none" stroke={f.cor}
                        strokeWidth={forte ? 4.5 : 2.4} opacity={on ? 1 : 0.06}
                        strokeLinecap="round" strokeLinejoin="round" />
                ))}
                {forte && f.caminho.map((p, i) => (
                  <circle key={i} cx={p[0]} cy={p[1]} r={4} fill="#fff"
                          stroke={f.cor} strokeWidth={2} />
                ))}
              </g>
            );
          })}

          {/* ── postes ── */}
          {POSTES.map(p => (
            <g key={p.ref} onClick={() => { setAlvo({ tipo: 'poste', ...p }); setSel(null); }}
               style={{ cursor: 'pointer' }}>
              {/* mastro. O P4 e vazado: desenhado como tubo */}
              {p.vazado ? (
                <>
                  <rect x={p.x - 6} y={NIVEIS.GND - 12} width={12} height={p.base - NIVEIS.GND + 12}
                        fill="#e9ecef" stroke="#6c757d" strokeWidth={2} rx={2} />
                  <line x1={p.x} y1={NIVEIS.GND - 6} x2={p.x} y2={p.base}
                        stroke="#adb5bd" strokeWidth={1} strokeDasharray="4 3" />
                </>
              ) : (
                <line x1={p.x} y1={NIVEIS.R1 - 14} x2={p.x} y2={p.base}
                      stroke="#8a6d3b" strokeWidth={7} strokeLinecap="round" />
              )}
              {/* cruzeta: a barra que segura os 4 condutores */}
              <line x1={p.x - 15} y1={NIVEIS.R1 - 8} x2={p.x + 15} y2={NIVEIS.R1 - 8}
                    stroke="#8a6d3b" strokeWidth={4} strokeLinecap="round" />
              <circle cx={p.x} cy={p.base} r={11} fill="#adb5bd" stroke="#6c757d"
                      strokeWidth={1.5} />
              <text x={p.x} y={p.base + 4} textAnchor="middle" fontSize={10}
                    fontWeight="700" fill="#212529">{p.ref}</text>
              <text x={p.x} y={p.base + 26} textAnchor="middle" fontSize={8.5}
                    fill="#868e96">↓ {p.desce}</text>
              {p.vazado && (
                <text x={p.x} y={p.base + 38} textAnchor="middle" fontSize={8}
                      fontWeight="700" fill="#1971c2">padrão de entrada</text>
              )}
              {p.equipa && (
                <>
                  <rect x={p.x - 21} y={176} width={42} height={22} rx={3}
                        fill="#1971c2" stroke="#0b4a86" strokeWidth={1.5} />
                  <text x={p.x} y={185} textAnchor="middle" fontSize={9}
                        fontWeight="700" fill="#fff">{p.equipa.ref}</text>
                  <text x={p.x} y={194} textAnchor="middle" fontSize={8}
                        fill="#a5d8ff">{p.equipa.para}</text>
                </>
              )}
            </g>
          ))}

          {/* ── entradas do painel ── */}
          {ENTRADAS_PAINEL.map(e => (
            <g key={e.ref}>
              <rect x={e.x - 9} y={298} width={18} height={14} rx={2}
                    fill="#6c757d" stroke="#495057" strokeWidth={1} />
              <text x={e.x} y={293} textAnchor="middle" fontSize={8.5}
                    fill="#495057" fontWeight="700">{e.ref}</text>
            </g>
          ))}

          {/* ── painel → câmara ── */}
          {SAIDAS_CAMARA.map(s => (
            <g key={s.nome} opacity={isolando ? 0.12 : 0.85}>
              <path d={`M 1065 ${s.y} L 1105 ${s.y}`} stroke={s.cor} strokeWidth={3}
                    strokeLinecap="round" />
              <text x={1085} y={s.y - 6} textAnchor="middle" fontSize={8.5}
                    fill={s.cor}>{s.nome.split(' ')[0]}</text>
            </g>
          ))}
        </svg>

        {/* legenda */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 10,
                      background: '#fff', padding: '9px 14px', borderRadius: 7 }}>
          {LEGENDA.map(l => (
            <div key={l.txt} style={{ display: 'flex', alignItems: 'center', gap: 6,
                                      fontSize: 11.5, color: '#495057' }}>
              <span style={{ width: 20, height: 4, background: l.cor, borderRadius: 2 }} />
              {l.txt}
            </div>
          ))}
        </div>
      </div>

      {/* ── painel lateral ── */}
      <aside style={{ width: 390, background: '#fff', borderLeft: '1px solid #dee2e6',
                      overflowY: 'auto', flexShrink: 0 }}>

        {sel && (
          <>
            <div style={{ background: sel.cor, color: '#fff', padding: '14px 16px' }}>
              <div style={{ fontSize: 17, fontWeight: 700 }}>{sel.nome}</div>
              <div style={{ fontSize: 12, opacity: 0.92, marginTop: 4, lineHeight: 1.5 }}>
                {sel.resumo}
              </div>
              <div style={{ fontSize: 11, opacity: 0.8, marginTop: 7 }}>
                {sel.bitola}{sel.corrente ? ` · ${sel.corrente}` : ''}
              </div>
            </div>
            <div style={{ padding: '14px 16px' }}>
              <h3 style={{ fontSize: 11.5, margin: '0 0 12px', color: '#868e96',
                           letterSpacing: 0.5 }}>
                O CAMINHO DELE, DO COMEÇO AO FIM
              </h3>
              {sel.passos.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: 11, marginBottom: 14 }}>
                  <div style={{ flexShrink: 0, width: 24, height: 24, borderRadius: 12,
                                background: sel.cor, color: '#fff', fontSize: 12,
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'center', fontWeight: 700 }}>
                    {i + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: '#212529' }}>
                      {p.onde}
                    </div>
                    <div style={{ fontSize: 12, color: '#495057', lineHeight: 1.55,
                                  marginTop: 2 }}>{p.diz}</div>
                  </div>
                </div>
              ))}
              {sel.atencao && (
                <div style={{ marginTop: 6, padding: 12, background: '#fff5f5',
                              border: '2px solid #ffc9c9', borderRadius: 7,
                              fontSize: 12, color: '#c92a2a', lineHeight: 1.55 }}>
                  {sel.atencao}
                </div>
              )}
            </div>
          </>
        )}

        {alvo?.tipo === 'poste' && (
          <div style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#1971c2' }}>
              {alvo.nome}
            </div>
            {alvo.equipa && (
              <div style={{ marginTop: 10, padding: 11, background: '#e7f5ff',
                            borderRadius: 7, fontSize: 12.5, color: '#0b4a86' }}>
                <b>{alvo.equipa.ref}</b> · {alvo.equipa.modelo}
                <div style={{ marginTop: 4, fontSize: 15, fontWeight: 700 }}>
                  {alvo.equipa.de} → {alvo.equipa.para}
                </div>
              </div>
            )}
            <div style={{ fontSize: 12.5, color: '#343a40', marginTop: 11,
                          lineHeight: 1.6 }}>{alvo.faz}</div>
            {alvo.desce && (
              <div style={{ marginTop: 9, fontSize: 12, color: '#495057' }}>
                <b>Desce deste poste:</b> {alvo.desce}
              </div>
            )}
            {alvo.porqueUmSo && (
              <div style={{ marginTop: 11, padding: 11, background: '#fff9db',
                            border: '2px solid #ffe066', borderRadius: 7,
                            fontSize: 12, color: '#7a5c00', lineHeight: 1.6 }}>
                {alvo.porqueUmSo}
              </div>
            )}
            <div style={{ marginTop: 11, padding: 11, background: '#f8f9fa',
                          borderRadius: 7, fontSize: 12, color: '#495057',
                          lineHeight: 1.6, fontStyle: 'italic' }}>
              💡 {alvo.analogia}
            </div>
          </div>
        )}

        {alvo?.tipo === 'fonte' && (
          <div style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#c92a2a' }}>
              {FONTE.nome}
            </div>
            <div style={{ marginTop: 12, padding: 11, background: '#fff5f5',
                          border: '2px solid #ffc9c9', borderRadius: 7, fontSize: 12,
                          color: '#c92a2a', lineHeight: 1.55 }}>
              <b>Entrada — {FONTE.entrada.nome}</b>
              <div style={{ marginTop: 5 }}>{FONTE.entrada.nota}</div>
              <div style={{ marginTop: 7 }}>
                {FONTE.entrada.bornes.map(b => (
                  <span key={b.ref} style={{ marginRight: 12 }}>
                    <span style={{ display: 'inline-block', width: 9, height: 9,
                                   background: b.cor, borderRadius: 2,
                                   marginRight: 4 }} />
                    {b.ref} · {b.nome}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 11, padding: 11, background: '#f8f9fa',
                          borderRadius: 7, fontSize: 12, color: '#343a40',
                          lineHeight: 1.6 }}>
              <b>Saídas — 3 positivas e 3 negativas</b>
              <div style={{ marginTop: 5 }}>{FONTE.saidas.nota}</div>
            </div>
          </div>
        )}

        {alvo && !alvo.tipo && (
          <div style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: alvo.cor }}>{alvo.nome}</div>
            <div style={{ fontSize: 12.5, color: '#495057', marginTop: 6 }}>
              {alvo.legenda}
            </div>
            {alvo.id === 'painel' && onIrPara && (
              <button onClick={() => onIrPara('painel')} style={{
                display: 'block', width: '100%', marginTop: 12, background: '#1971c2',
                color: '#fff', border: 'none', borderRadius: 6, padding: '10px 12px',
                cursor: 'pointer', fontSize: 12.5, fontWeight: 700,
              }}>🔧 Abrir o painel por dentro</button>
            )}
          </div>
        )}

        {!sel && !alvo && (
          <div style={{ padding: '16px' }}>
            <h3 style={{ fontSize: 11.5, margin: '0 0 10px', color: '#868e96',
                         letterSpacing: 0.5 }}>A HISTÓRIA EM QUATRO PASSOS</h3>
            {[
              ['1', 'SUBESTAÇÃO', 'A tomada entrega 127 V alternados. A fonte transforma '
                  + 'em 24 V contínuos e os três fusíveis dividem a saída em três ramais.',
                '#c92a2a'],
              ['2', 'A REDE AÉREA', 'Quatro condutores viajam pelo alto: os três '
                  + 'positivos em cima e o 0 V um pouco abaixo. Nos postes 2 e 3 estão '
                  + 'os conversores, que fazem o papel dos transformadores de rua.',
                '#f08c00'],
              ['3', 'AS DESCIDAS', 'Cada ramal desce no SEU poste e corre por baixo do '
                  + 'tabuleiro até o painel. O 0 V é o único que atravessa tudo sem '
                  + 'parar, e desce no poste 4 — o padrão de entrada.', '#1971c2'],
              ['4', 'A CÂMARA', 'O painel decide e aciona. As pastilhas esfriam, o PTC '
                  + 'aquece, e os sensores contam de volta o que está acontecendo.',
                '#0ca678'],
            ].map(([n, t, d, c]) => (
              <div key={n} style={{ display: 'flex', gap: 11, marginBottom: 14 }}>
                <div style={{ flexShrink: 0, width: 26, height: 26, borderRadius: 13,
                              background: c, color: '#fff', fontSize: 13,
                              display: 'flex', alignItems: 'center',
                              justifyContent: 'center', fontWeight: 700 }}>{n}</div>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: c }}>{t}</div>
                  <div style={{ fontSize: 12, color: '#495057', lineHeight: 1.55,
                                marginTop: 2 }}>{d}</div>
                </div>
              </div>
            ))}
            <div style={{ padding: 12, background: '#e7f5ff', borderRadius: 7,
                          fontSize: 12, color: '#0b4a86', lineHeight: 1.6,
                          marginBottom: 9 }}>
              <b>⭐ Por que a maquete tem postes?</b>
              <div style={{ marginTop: 5 }}>
                Porque o projeto não é só a câmara — é a <b>rede que a alimenta</b>.
                Os postes mostram, em miniatura, o mesmo caminho que a energia faz da
                usina até a fábrica: gera, protege, transporta, transforma e entrega.
              </div>
            </div>
            <div style={{ padding: 12, background: '#fff9db', borderRadius: 7,
                          border: '2px solid #ffe066',
                          fontSize: 12, color: '#7a5c00', lineHeight: 1.6 }}>
              <b>⭐ Repare no que NÃO sai dos transformadores</b>
              <div style={{ marginTop: 5 }}>
                Entram dois fios em cada um (24 V e 0 V) e sai <b>um só</b>: o positivo.
                O 0 V não precisa voltar porque é o <b>mesmo condutor</b> dos dois lados —
                os conversores não isolam nada. É por isso que existe um único 0 V no
                projeto inteiro, e é o que deixa a fiação da maquete tão simples.
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
