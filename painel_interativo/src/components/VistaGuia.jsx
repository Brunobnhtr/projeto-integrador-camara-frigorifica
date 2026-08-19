import { useState, useEffect } from 'react';
import { FASES, TODOS, discretosDo, CORES_FIO } from '../data/guia.js';
import FichaDiscreto from './FichaDiscreto';

/* ═══════════════════════════════════════════════════════════════════════
   O GUIA DE MONTAGEM
   ═══════════════════════════════════════════════════════════════════════
   ⭐ Cada passo é uma AÇÃO com uma prova: o que pegar, o que fazer, e o
      que o multímetro tem que mostrar quando terminar. Quem nunca mexeu
      com eletrônica não tem como saber sozinho se ficou certo — por isso
      a linha CONFIRA é obrigatória em todo passo.

   O que está feito fica salvo no navegador. O botão IMPRIMIR gera a
   versão de papel, para a bancada, com os desenhos junto.
   ═════════════════════════════════════════════════════════════════════ */

const C = { tinta: '#212529', fraco: '#6c757d', linha: '#dee2e6', fundo: '#eef1f5',
            papel: '#fff', destaque: '#e8590c', ok: '#2f9e44', perigo: '#c92a2a' };

const CHAVE = 'guia:feitos';

export default function VistaGuia() {
  const [fase, setFase] = useState('A');
  const [feitos, setFeitos] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CHAVE)) ?? []; } catch { return []; }
  });
  const [aberto, setAberto] = useState(null);

  useEffect(() => {
    try { localStorage.setItem(CHAVE, JSON.stringify(feitos)); } catch { /* cheio */ }
  }, [feitos]);

  const marca = id => setFeitos(f => f.includes(id) ? f.filter(x => x !== id) : [...f, id]);
  const passos = TODOS.filter(p => p.fase === fase);
  const prontosNa = f => TODOS.filter(p => p.fase === f && feitos.includes(p.id)).length;

  return (
    <div className="guia" style={{ background: C.fundo, minHeight: '100%', padding: 14,
                                   fontFamily: 'system-ui, sans-serif', color: C.tinta }}>

      <div className="nao-imprime" style={{ background: C.papel, border: `1px solid ${C.linha}`,
                    borderRadius: 8, padding: '12px 16px', marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'baseline', flexWrap: 'wrap' }}>
          <b style={{ fontSize: 15 }}>Guia de montagem</b>
          <span style={{ fontSize: 12.5, color: C.fraco }}>
            {TODOS.length} passos · <b>{feitos.length}</b> conferidos ·
            o que você marca fica salvo neste navegador
          </span>
          <button onClick={() => window.print()} style={{ marginLeft: 'auto', cursor: 'pointer',
                    border: `1px solid ${C.linha}`, background: '#fff', borderRadius: 6,
                    padding: '6px 12px', fontSize: 12.5 }}>
            🖨️ Imprimir esta fase
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          {FASES.map(f => {
            const total = TODOS.filter(p => p.fase === f.id).length;
            const ok = prontosNa(f.id);
            return (
              <button key={f.id} onClick={() => setFase(f.id)} title={f.resumo}
                style={{ cursor: 'pointer', borderRadius: 8, padding: '8px 13px', textAlign: 'left',
                         border: `2px solid ${fase === f.id ? C.destaque : C.linha}`,
                         background: fase === f.id ? '#fff4e6' : '#fff' }}>
                <div style={{ fontSize: 13, fontWeight: fase === f.id ? 700 : 500 }}>
                  {f.icone} {f.id} · {f.nome}
                </div>
                <div style={{ fontSize: 11, color: ok === total ? C.ok : C.fraco, marginTop: 2 }}>
                  {ok} de {total} {ok === total ? '✓' : ''}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ background: '#fff', border: `1px solid ${C.linha}`, borderRadius: 8,
                    padding: '10px 14px', marginBottom: 12, fontSize: 12.5, color: C.fraco }}>
        <b style={{ color: C.tinta }}>
          Fase {fase} · {FASES.find(f => f.id === fase)?.nome}
        </b>{' — '}{FASES.find(f => f.id === fase)?.resumo}
        {' '}<i>({FASES.find(f => f.id === fase)?.onde})</i>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {passos.map(p => (
          <Passo key={p.id} p={p} feito={feitos.includes(p.id)} onMarcar={() => marca(p.id)}
                 aberto={aberto === p.id} onAbrir={() => setAberto(aberto === p.id ? null : p.id)} />
        ))}
      </div>
    </div>
  );
}

/* ── um passo ────────────────────────────────────────────────────────── */
function Bloco({ rotulo, cor, children }) {
  if (!children) return null;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '86px 1fr', gap: 12,
                  padding: '8px 0', borderTop: '1px solid #f1f3f5' }}>
      <div style={{ fontFamily: 'monospace', fontSize: 10.5, letterSpacing: '.06em',
                    color: C.fraco, paddingTop: 2 }}>{rotulo}</div>
      <div style={{ fontSize: 13.5, color: cor ?? C.tinta, lineHeight: 1.55 }}>{children}</div>
    </div>
  );
}

function Passo({ p, feito, onMarcar, aberto, onAbrir }) {
  const pecas = discretosDo(p);

  return (
    <div className="passo-card" style={{ background: C.papel, borderRadius: 8,
              border: `1px solid ${feito ? '#b2f2bb' : C.linha}`,
              borderLeft: `4px solid ${feito ? C.ok : C.destaque}`, overflow: 'hidden' }}>

      <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
                       background: feito ? '#ebfbee' : '#f8f9fa',
                       borderBottom: `1px solid ${C.linha}`, flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input type="checkbox" checked={feito} onChange={onMarcar} style={{ width: 17, height: 17 }} />
          <b style={{ fontFamily: 'monospace', fontSize: 14 }}>{p.id}</b>
        </label>
        <b style={{ fontSize: 14.5, textDecoration: feito ? 'line-through' : 'none',
                    color: feito ? C.fraco : C.tinta }}>{p.titulo}</b>
        <span style={{ fontSize: 11.5, color: C.fraco, marginLeft: 'auto' }}>⏱ {p.tempo}</span>
      </header>

      <div style={{ padding: '4px 14px 12px' }}>
        {p.diz && (
          <div style={{ fontSize: 13, color: C.fraco, padding: '8px 0 2px' }}>{p.diz}</div>
        )}
        <Bloco rotulo="PEGUE">{p.pegue?.join(' · ')}</Bloco>
        <Bloco rotulo="ANTES">{p.antes}</Bloco>
        <Bloco rotulo="FAÇA">
          <ol style={{ margin: 0, paddingLeft: 18 }}>
            {p.faca.map((f, i) => <li key={i} style={{ marginBottom: 3 }}>{f}</li>)}
          </ol>
        </Bloco>

        {/* os componentes deste passo, com o desenho de onde cada um vai */}
        {pecas.length > 0 && (
          <div style={{ padding: '10px 0 2px', borderTop: `1px solid #f1f3f5` }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'monospace', fontSize: 10.5, letterSpacing: '.06em',
                             color: C.fraco }}>PEÇAS</span>
              {pecas.map(d => (
                <span key={d.id} style={{ fontFamily: 'monospace', fontSize: 12.5,
                          background: '#fff4e6', color: C.destaque, borderRadius: 5,
                          padding: '2px 8px' }}>{d.ref} · {d.valor}</span>
              ))}
              <button className="nao-imprime" onClick={onAbrir}
                style={{ marginLeft: 'auto', cursor: 'pointer', border: `1px solid ${C.linha}`,
                         background: '#fff', borderRadius: 6, padding: '4px 10px', fontSize: 12 }}>
                {aberto ? 'esconder os desenhos' : '🔍 ver onde cada peça vai'}
              </button>
            </div>
            <div className={aberto ? '' : 'so-impresso'}
                 style={{ display: aberto ? 'grid' : undefined, gap: 12, marginTop: 12 }}>
              {pecas.map(d => <FichaDiscreto key={d.id} d={d} />)}
            </div>
          </div>
        )}

        {/* os fios deste passo */}
        {p.fios?.length > 0 && <TabelaFios fios={p.fios} />}

        <Bloco rotulo="CONFIRA" cor={C.ok}>{p.confira}</Bloco>
        <Bloco rotulo="SE ERRAR" cor={C.perigo}>{p.seErrar}</Bloco>
      </div>
    </div>
  );
}

/* A ponta de um fio nem sempre é um borne do painel: pode ser um
   prensa-cabo, um ponto da maquete, ou um borne dentro da câmara. */
function ponta(p) {
  if (p.comp)    return `${p.comp} · ${p.via}`;
  if (p.prensa)  return `prensa ${p.prensa}`;
  if (p.maquete) return `maquete · ${p.maquete}${p.borne ? ' · ' + p.borne : ''}`;
  if (p.camara)  return `câmara · ${p.camara}${p.borne ? ' · ' + p.borne : ''}`;
  if (p.tampa)   return `tampa · ${p.tampa}`;
  return Object.values(p).join(' · ');
}

/* ── a lista de fios de uma etapa ────────────────────────────────────── */
function TabelaFios({ fios }) {
  const [feitos, setFeitos] = useState(() => {
    try { return JSON.parse(localStorage.getItem('guia:fios')) ?? []; } catch { return []; }
  });
  useEffect(() => {
    try { localStorage.setItem('guia:fios', JSON.stringify(feitos)); } catch { /* cheio */ }
  }, [feitos]);
  const marca = n => setFeitos(f => f.includes(n) ? f.filter(x => x !== n) : [...f, n]);
  const faltam = fios.filter(f => !feitos.includes(f.n)).length;

  return (
    <div style={{ padding: '10px 0 2px', borderTop: `1px solid #f1f3f5` }}>
      <div style={{ fontFamily: 'monospace', fontSize: 10.5, letterSpacing: '.06em',
                    color: C.fraco, marginBottom: 6 }}>
        OS FIOS — {fios.length} nesta etapa{faltam ? `, ${faltam} por passar` : ', todos passados ✓'}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 12.5 }}>
          <thead>
            <tr style={{ color: C.fraco, textAlign: 'left' }}>
              <th style={{ padding: '4px 6px', width: 28 }}>✓</th>
              <th style={{ padding: '4px 6px' }}>fio</th>
              <th style={{ padding: '4px 6px' }}>sai de</th>
              <th style={{ padding: '4px 6px' }}>chega em</th>
              <th style={{ padding: '4px 6px' }}>bitola</th>
              <th style={{ padding: '4px 6px' }}>cor / função</th>
            </tr>
          </thead>
          <tbody>
            {fios.map(f => {
              const cor = CORES_FIO[f.func];
              const ok = feitos.includes(f.n);
              return (
                <tr key={f.n} style={{ borderTop: '1px solid #f1f3f5',
                                       background: ok ? '#f4fbf5' : undefined }}>
                  <td style={{ padding: '4px 6px' }}>
                    <input type="checkbox" checked={ok} onChange={() => marca(f.n)} />
                  </td>
                  <td style={{ padding: '4px 6px', fontFamily: 'monospace' }}>
                    <b>{f.n}</b>
                    <div style={{ color: C.fraco, fontFamily: 'system-ui', fontSize: 11.5 }}>
                      {f.nome}
                    </div>
                  </td>
                  <td style={{ padding: '4px 6px', fontFamily: 'monospace' }}>{ponta(f.de)}</td>
                  <td style={{ padding: '4px 6px', fontFamily: 'monospace' }}>{ponta(f.para)}</td>
                  <td style={{ padding: '4px 6px' }}>{f.mm2} mm²</td>
                  <td style={{ padding: '4px 6px' }}>
                    <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2,
                                   background: cor?.hex, marginRight: 6,
                                   border: '1px solid #0002', verticalAlign: 'middle' }} />
                    {cor?.nome}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
