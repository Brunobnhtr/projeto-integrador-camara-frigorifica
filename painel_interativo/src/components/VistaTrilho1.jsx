import { useState } from 'react';
import {
  PLACA_MONTAGEM, TRILHO, PLACA_PRENSA, PRENSA_CABOS, BLOCOS, PORTA, montarFios,
} from '../data/trilho1';

/* Painel visto de frente, com a porta aberta à direita.
   Tudo em milímetros — o SVG converte para pixels.        */

const FIOS = montarFios();
const alturaBloco = 62;

/* ── um bloco de distribuição DIN ──────────────────────────────────── */
function Bloco({ b, y, sel, onSel, onFio, apagado }) {
  const passo = b.largura / (b.vias + 0.6);
  const px = i => b.x + passo * (i + 0.8);
  const yTopo = y - alturaBloco;

  return (
    <g opacity={apagado ? 0.16 : 1}>
      {/* corpo */}
      <rect x={b.x} y={yTopo} width={b.largura} height={alturaBloco} rx={2}
            fill={b.ehBarra ? '#3a3f44' : '#2b3035'} stroke={b.cor} strokeWidth={sel ? 2 : 1}
            onClick={() => onSel(b)} style={{ cursor: 'pointer' }} />
      {/* faixa de cor da tensão */}
      <rect x={b.x} y={yTopo} width={b.largura} height={7} rx={2} fill={b.cor} />
      <text x={b.x + b.largura / 2} y={yTopo + 5.6} textAnchor="middle"
            fontSize={4.4} fontWeight="700" fill="#fff">{b.nome}</text>
      <text x={b.x + b.largura / 2} y={yTopo + 15} textAnchor="middle"
            fontSize={3.6} fill="#adb5bd">{b.subtitulo}</text>

      {/* terminal de ENTRADA — maior, no topo */}
      <g onClick={() => onSel(b)} style={{ cursor: 'pointer' }}>
        <rect x={b.x + 3} y={yTopo + 19} width={11} height={9} rx={1}
              fill="#c0c4c8" stroke="#7a7f84" strokeWidth={0.5} />
        <circle cx={b.x + 8.5} cy={yTopo + 23.5} r={3} fill="#9aa0a6" />
        <line x1={b.x + 6.4} y1={yTopo + 23.5} x2={b.x + 10.6} y2={yTopo + 23.5}
              stroke="#5a5f64" strokeWidth={0.8} />
        <text x={b.x + 16} y={yTopo + 25} fontSize={3.4} fill="#e9ecef">
          IN · {b.entrada.bitola}
        </text>
      </g>

      {/* terminais de SAÍDA, em fila */}
      {b.saidas.map((s, i) => {
        const fio = FIOS.find(f => f.de === `${b.id}:${s.ref}`);
        const ativo = fio && sel?.n === fio.n;
        return (
          <g key={s.ref} style={{ cursor: s.livre ? 'default' : 'pointer' }}
             onClick={() => !s.livre && fio && onFio(fio)}>
            <circle cx={px(i)} cy={y - 13} r={3.2}
                    fill={s.livre ? '#495057' : (ativo ? '#ffd43b' : '#c0c4c8')}
                    stroke="#5a5f64" strokeWidth={0.5} />
            <line x1={px(i) - 2} y1={y - 13} x2={px(i) + 2} y2={y - 13}
                  stroke="#5a5f64" strokeWidth={0.7} />
            <text x={px(i)} y={y - 4.5} textAnchor="middle" fontSize={2.8}
                  fill={s.livre ? '#6c757d' : '#e9ecef'} fontWeight={ativo ? 700 : 400}>
              {s.ref}
            </text>
          </g>
        );
      })}

      {b.alerta && !apagado && (
        <text x={b.x + b.largura / 2} y={yTopo - 3} textAnchor="middle"
              fontSize={3.2} fill="#c92a2a" fontWeight="700">⚠ {b.vias} vias</text>
      )}
    </g>
  );
}

/* ── prensa-cabo com os fios que entram ────────────────────────────── */
function PrensaCabo({ pc, sel, onFio, apagado }) {
  const y = PLACA_PRENSA.y;
  return (
    <g opacity={apagado ? 0.16 : 1}>
      <rect x={pc.x - 9} y={y + 4} width={18} height={17} rx={2}
            fill="#6c757d" stroke="#495057" strokeWidth={0.6} />
      {[0, 1, 2].map(i => (
        <line key={i} x1={pc.x - 9} y1={y + 8 + i * 5} x2={pc.x + 9} y2={y + 8 + i * 5}
              stroke="#495057" strokeWidth={0.7} />
      ))}
      <text x={pc.x} y={y + 28} textAnchor="middle" fontSize={3.6}
            fontWeight="700" fill="#343a40">{pc.bitola}</text>

      {/* os cabos saindo por baixo, para fora do painel */}
      {pc.cabos.map((c, i) => {
        const ativo = sel?.n === c.n;
        const dx = (i - (pc.cabos.length - 1) / 2) * 5;
        return (
          <g key={c.n} onClick={() => onFio(FIOS.find(f => f.n === c.n))}
             style={{ cursor: 'pointer' }}>
            <path d={`M ${pc.x + dx} ${y + 21} L ${pc.x + dx * 2.2} ${y + 44}`}
                  stroke={c.cor} strokeWidth={ativo ? 3.2 : 1.9} strokeLinecap="round" />
            {ativo && (
              <text x={pc.x + dx * 2.2} y={y + 50} textAnchor="middle" fontSize={3.4}
                    fontWeight="700" fill={c.cor}>{c.sinal}</text>
            )}
          </g>
        );
      })}
    </g>
  );
}

/* ── a porta ───────────────────────────────────────────────────────── */
function Porta({ onItem, sel }) {
  const { x, largura, altura, itens } = PORTA;
  return (
    <g>
      <rect x={x} y={0} width={largura} height={altura} rx={4}
            fill="#e9ecef" stroke="#868e96" strokeWidth={1.5} />
      {/* dobradiças à esquerda, indicando que ela abre para a direita */}
      {[60, 235, 410].map(hy => (
        <rect key={hy} x={x - 4} y={hy} width={8} height={26} rx={2} fill="#adb5bd" />
      ))}
      <text x={x + largura / 2} y={20} textAnchor="middle" fontSize={7}
            fontWeight="700" fill="#495057">PORTA — vista de fora</text>

      {itens.map(it => {
        const ativo = sel?.ref === it.ref;
        const cx = x + it.x, cy = it.y;
        return (
          <g key={it.ref} onClick={() => onItem(it)} style={{ cursor: 'pointer' }}>
            {it.tipo === 'tela' && (
              <>
                <rect x={cx} y={cy} width={it.w} height={it.h} rx={3}
                      fill="#212529" stroke={ativo ? '#ffd43b' : '#495057'} strokeWidth={ativo ? 3 : 1.5} />
                <rect x={cx + 7} y={cy + 7} width={it.w - 14} height={it.h - 14} rx={1}
                      fill="#0b2e4a" />
                <text x={cx + it.w / 2} y={cy + it.h / 2 - 6} textAnchor="middle"
                      fontSize={9} fill="#4dabf7" fontFamily="monospace">-- °C</text>
                <text x={cx + it.w / 2} y={cy + it.h / 2 + 8} textAnchor="middle"
                      fontSize={6} fill="#74c0fc">CÂMARA</text>
                <text x={cx + it.w / 2} y={cy + it.h + 11} textAnchor="middle"
                      fontSize={6} fontWeight="700" fill="#495057">{it.nome}</text>
              </>
            )}
            {it.tipo === 'sinaleiro' && (
              <>
                <circle cx={cx} cy={cy} r={13} fill="#495057" />
                <circle cx={cx} cy={cy} r={10} fill={it.cor} opacity={ativo ? 1 : 0.5}
                        stroke={ativo ? '#ffd43b' : 'none'} strokeWidth={2.5} />
                <text x={cx} y={cy + 26} textAnchor="middle" fontSize={5}
                      fontWeight="700" fill="#495057">{it.nome}</text>
                <text x={cx} y={cy + 33} textAnchor="middle" fontSize={4.5} fill="#868e96">
                  22 mm · 24 V
                </text>
              </>
            )}
            {it.tipo === 'botao' && (
              <>
                <circle cx={cx} cy={cy} r={13} fill="#495057" />
                <circle cx={cx} cy={cy} r={10} fill={it.cor}
                        stroke={ativo ? '#ffd43b' : 'none'} strokeWidth={2.5} />
                <text x={cx} y={cy + 26} textAnchor="middle" fontSize={5}
                      fontWeight="700" fill="#495057">{it.nome}</text>
              </>
            )}
            {it.tipo === 'chave' && (
              <>
                <circle cx={cx} cy={cy} r={13} fill="#495057" />
                <circle cx={cx} cy={cy} r={10} fill="#212529"
                        stroke={ativo ? '#ffd43b' : '#adb5bd'} strokeWidth={2} />
                <line x1={cx} y1={cy} x2={cx + 7} y2={cy - 7} stroke="#e9ecef" strokeWidth={2.5} />
                <text x={cx} y={cy + 26} textAnchor="middle" fontSize={4.6}
                      fontWeight="700" fill="#495057">{it.nome}</text>
              </>
            )}
            {it.tipo === 'emergencia' && (
              <>
                <circle cx={cx} cy={cy} r={22} fill="#f1c40f" />
                <circle cx={cx} cy={cy} r={17} fill="#c92a2a"
                        stroke={ativo ? '#ffd43b' : '#8a1a1a'} strokeWidth={3} />
                <text x={cx} y={cy + 4} textAnchor="middle" fontSize={7}
                      fontWeight="700" fill="#fff">STOP</text>
                <text x={cx} y={cy + 36} textAnchor="middle" fontSize={5.5}
                      fontWeight="700" fill="#c92a2a">{it.nome}</text>
              </>
            )}
          </g>
        );
      })}
    </g>
  );
}

/* ── vista principal ───────────────────────────────────────────────── */
export default function VistaTrilho1() {
  const [fio, setFio] = useState(null);      // fio isolado
  const [bloco, setBloco] = useState(null);  // bloco selecionado
  const [item, setItem] = useState(null);    // item da porta

  const isolando = !!fio;
  const largura = PORTA.x + PORTA.largura + 20;

  const escolherFio = f => { setFio(f); setBloco(null); setItem(null); };

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflow: 'auto', padding: 16, background: '#eef1f5' }}>
        {isolando && (
          <div style={{ background: '#ffd43b', padding: '7px 12px', borderRadius: 6,
                        marginBottom: 10, fontSize: 12.5, display: 'flex',
                        justifyContent: 'space-between', alignItems: 'center' }}>
            <span>🔍 Mostrando <b>só o cabo {fio.n}</b> — o resto está oculto</span>
            <button onClick={() => setFio(null)} style={{
              background: '#212529', color: '#fff', border: 'none', borderRadius: 5,
              padding: '3px 10px', cursor: 'pointer', fontSize: 11.5 }}>
              mostrar tudo
            </button>
          </div>
        )}

        <svg viewBox={`-14 -14 ${largura + 28} ${PLACA_MONTAGEM.altura + 76}`}
             style={{ width: '100%', background: '#fff', borderRadius: 8,
                      boxShadow: '0 1px 6px #0002' }}>
          {/* placa de montagem */}
          <rect x={0} y={0} width={PLACA_MONTAGEM.largura} height={PLACA_MONTAGEM.altura}
                rx={3} fill="#dee2e6" stroke="#adb5bd" strokeWidth={1.5} />
          <text x={6} y={13} fontSize={7} fontWeight="700" fill="#868e96">
            PLACA DE MONTAGEM — {PLACA_MONTAGEM.largura} × {PLACA_MONTAGEM.altura} mm
          </text>

          {/* trilhos 2 e 3, só indicados */}
          {[{ y: 125, t: 'TRILHO 3 — controle' }, { y: 255, t: 'TRILHO 2 — potência' }]
            .map(t => (
              <g key={t.y} opacity={0.35}>
                <rect x={14} y={t.y - 6} width={370} height={12} rx={1}
                      fill="#ced4da" stroke="#adb5bd" strokeWidth={0.5} />
                <text x={18} y={t.y - 10} fontSize={5.5} fill="#868e96">{t.t}</text>
              </g>
            ))}

          {/* TRILHO 1 */}
          <rect x={14} y={TRILHO.y - 6} width={370} height={12} rx={1}
                fill="#b8bcc0" stroke="#868e96" strokeWidth={0.7} />
          <text x={18} y={TRILHO.y - 72} fontSize={7} fontWeight="700" fill="#1d3557">
            TRILHO 1 — DISTRIBUIÇÃO
          </text>

          {/* placa de prensa-cabos */}
          <rect x={14} y={PLACA_PRENSA.y} width={370} height={PLACA_PRENSA.altura} rx={2}
                fill="#ced4da" stroke="#868e96" strokeWidth={0.8} />
          <text x={300} y={PLACA_PRENSA.y + 18} fontSize={5.5} fill="#495057">
            placa de prensa-cabos
          </text>

          {/* fios de entrada → destino */}
          {PRENSA_CABOS.map(pc => pc.cabos.map(c => {
            const f = FIOS.find(x => x.n === c.n);
            const oculto = isolando && fio.n !== c.n;
            if (oculto) return null;
            const alvo = BLOCOS.find(b => c.para.startsWith(b.id));
            const ax = alvo ? alvo.x + 8.5 : 60;
            const ay = alvo ? TRILHO.y - alturaBloco + 23 : TRILHO.y;
            const dest = c.para.startsWith('KA2') ? { x: 300, y: 255 } : { x: ax, y: ay };
            return (
              <path key={c.n}
                    d={`M ${pc.x} ${PLACA_PRENSA.y + 4} C ${pc.x} ${dest.y + 60},
                        ${dest.x} ${dest.y + 70}, ${dest.x} ${dest.y}`}
                    fill="none" stroke={c.cor}
                    strokeWidth={fio?.n === c.n ? 3.4 : 1.7}
                    opacity={fio?.n === c.n ? 1 : 0.75}
                    onClick={() => escolherFio(f)} style={{ cursor: 'pointer' }} />
            );
          }))}

          {BLOCOS.map(b => (
            <Bloco key={b.id} b={b} y={TRILHO.y} sel={fio} apagado={isolando && !
              FIOS.some(f => f.n === fio.n && (f.de?.startsWith(b.id) || f.para?.startsWith(b.id)))}
              onSel={bb => { setBloco(bb); setFio(null); setItem(null); }}
              onFio={escolherFio} />
          ))}

          {PRENSA_CABOS.map(pc => (
            <PrensaCabo key={pc.ref} pc={pc} sel={fio} onFio={escolherFio}
                        apagado={isolando && !pc.cabos.some(c => c.n === fio.n)} />
          ))}

          <Porta onItem={it => { setItem(it); setFio(null); setBloco(null); }} sel={item} />
        </svg>
      </div>

      {/* ── lateral ── */}
      <aside style={{ width: 370, background: '#fff', borderLeft: '1px solid #dee2e6',
                      overflowY: 'auto', flexShrink: 0 }}>
        <div style={{ background: '#1d3557', color: '#fff', padding: '12px 15px' }}>
          <b style={{ fontSize: 15 }}>Trilho 1 — Distribuição</b>
          <div style={{ fontSize: 11.5, opacity: 0.85, marginTop: 3 }}>
            Clique num <b>fio</b> para isolá-lo · num <b>bloco</b> para ver as vias ·
            num item da <b>porta</b> para os detalhes
          </div>
        </div>

        {fio && (
          <div style={{ padding: '13px 15px', background: '#fffbe6',
                        borderBottom: '2px solid #f5a524' }}>
            <b style={{ fontSize: 14.5, color: '#8a5a00' }}>Cabo {fio.n} · {fio.sinal}</b>
            <table style={{ width: '100%', fontSize: 11.5, marginTop: 8,
                            borderCollapse: 'collapse' }}>
              <tbody>
                {[['De', fio.de], ['Para', fio.para], ['Bitola', fio.bitola],
                  ['Vem de', fio.vindo], ['Protegido por', fio.protegido]]
                  .filter(([, v]) => v).map(([k, v]) => (
                    <tr key={k}>
                      <td style={{ color: '#868e96', padding: '3px 8px 3px 0',
                                   verticalAlign: 'top', whiteSpace: 'nowrap' }}>{k}</td>
                      <td style={{ color: '#212529', fontWeight: 600 }}>{v}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {fio.aviso && (
              <div style={{ marginTop: 8, fontSize: 11.5, color: '#c92a2a' }}>⚠️ {fio.aviso}</div>
            )}
          </div>
        )}

        {bloco && (
          <div style={{ padding: '13px 15px', borderBottom: '1px solid #eee' }}>
            <b style={{ fontSize: 15, color: bloco.cor }}>{bloco.nome}</b>
            <div style={{ fontSize: 11.5, color: '#868e96' }}>{bloco.subtitulo}</div>
            {bloco.nota && (
              <div style={{ fontSize: 11.5, color: '#343a40', marginTop: 6 }}>{bloco.nota}</div>
            )}
            {bloco.alerta && (
              <div style={{ fontSize: 11.5, color: '#c92a2a', marginTop: 6, padding: 8,
                            background: '#fff5f5', borderRadius: 5 }}>⚠️ {bloco.alerta}</div>
            )}
            <div style={{ marginTop: 10, fontSize: 11, color: '#868e96', letterSpacing: 0.3 }}>
              COMPRAR: 1 entrada {bloco.entrada.bitola} + <b>{bloco.vias} saídas</b>
            </div>
            <div style={{ fontSize: 11.5, marginTop: 8, padding: '6px 9px',
                          background: '#f1f3f5', borderRadius: 5 }}>
              <b>IN</b> ← {bloco.entrada.vem}
            </div>
            {bloco.saidas.map(s => (
              <div key={s.ref} onClick={() => {
                const f = FIOS.find(x => x.de === `${bloco.id}:${s.ref}`);
                if (f) escolherFio(f);
              }} style={{
                fontSize: 11.5, marginTop: 4, padding: '6px 9px', borderRadius: 5,
                background: s.livre ? '#f8f9fa' : '#fff',
                border: `1px solid ${s.livre ? '#e9ecef' : bloco.cor + '55'}`,
                borderLeft: `4px solid ${s.livre ? '#dee2e6' : bloco.cor}`,
                cursor: s.livre ? 'default' : 'pointer',
                color: s.livre ? '#adb5bd' : '#212529',
              }}>
                <b>{s.ref}</b> → {s.vai}
                {s.bitola && <span style={{ color: '#868e96' }}> · {s.bitola}</span>}
                {s.aviso && (
                  <div style={{ color: '#c92a2a', marginTop: 3 }}>⚠️ {s.aviso}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {item && (
          <div style={{ padding: '13px 15px', borderBottom: '1px solid #eee' }}>
            <b style={{ fontSize: 15 }}>{item.nome}</b>
            <div style={{ fontSize: 11.5, color: '#868e96' }}>{item.ref} · na porta</div>
            <div style={{ fontSize: 12, color: '#343a40', marginTop: 7, lineHeight: 1.55 }}>
              {item.detalhe}
            </div>
          </div>
        )}

        {!fio && !bloco && !item && (
          <div style={{ padding: '14px 15px' }}>
            <div style={{ padding: 12, background: '#e7f5ff', borderRadius: 7,
                          fontSize: 12, lineHeight: 1.6, color: '#0b4a86' }}>
              <b>⭐ Entram DOIS cabos de 24 V, e não um.</b>
              <div style={{ marginTop: 6 }}>
                Um pelo <b>PG9</b> (potência, 1,5 mm², do poste P1) e outro pelo
                {' '}<b>PG7b</b> (serviços, 0,5 mm², do poste P3). Eles <b>não</b> se
                derivam um do outro dentro do painel.
              </div>
              <div style={{ marginTop: 6 }}>
                <b>Por quê:</b> cada um vem de um ramal com <b>fusível diferente</b> —
                F1 de 10 A na potência, F3 de 2 A nos serviços. Se saíssem do mesmo
                fusível de 10 A, um curto no fio fino de 0,5 mm² teria que crescer até
                10 A para a proteção agir. O fio pegaria fogo antes.
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
