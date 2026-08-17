import { useState } from 'react';
import { PECAS, PASSOS, RESUMO, CAMADAS, PORTA, FIXACAO_PORTA, TESTE_PORTA } from '../data/montagem.js';

/* ═══════════════════════════════════════════════════════════════════
   MONTAGEM DA CÂMARA
   Duas abas: a LISTA DE CORTE (o que levar para a gráfica, em escala,
   com cotas) e a ORDEM DE MONTAGEM (o que fazer, na ordem, com o que
   conferir antes de passar cola).

   ⭐ A separação não é estética. Peça errada você troca; passo fora de
     ordem em acrílico colado você não desfaz.
   ══════════════════════════════════════════════════════════════════ */

const C = { fundo: '#f8f9fa', borda: '#dee2e6', texto: '#212529', fraco: '#868e96',
            acr: '#a5d8ff', acrB: '#1971c2', corte: '#e03131', cota: '#495057' };

export default function VistaMontagem() {
  const [aba, setAba] = useState('corte');
  return (
    <div style={{ background: C.fundo, minHeight: '100%', padding: 14,
                  fontFamily: 'system-ui, sans-serif', color: C.texto }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center',
                    flexWrap: 'wrap' }}>
        {[['corte', '📐 Lista de corte', `${PECAS.reduce((a, p) => a + p.qtd, 0)} peças`],
          ['camadas', '🥪 Onde fica cada camada', 'o corte da parede'],
          ['porta', '🚪 A porta', 'como monta e como veda'],
          ['ordem', '🔧 Ordem de montagem', `${PASSOS.length} passos`]].map(([id, nome, sub]) => (
          <button key={id} onClick={() => setAba(id)} style={{
            padding: '8px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13,
            fontWeight: aba === id ? 700 : 500,
            border: `1px solid ${aba === id ? C.acrB : C.borda}`,
            background: aba === id ? '#d0ebff' : '#fff' }}>
            {nome} <span style={{ color: C.fraco, fontWeight: 400 }}>· {sub}</span>
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 11.5, color: C.fraco }}>
          útil {RESUMO.volumeUtil} · externo {RESUMO.externo}
        </span>
      </div>
      {aba === 'corte' && <ListaCorte />}
      {aba === 'camadas' && <Camadas />}
      {aba === 'porta' && <Porta />}
      {aba === 'ordem' && <OrdemMontagem />}
    </div>
  );
}

/* ═══ LISTA DE CORTE ═══════════════════════════════════════════════ */
function ListaCorte() {
  return (
    <>
      <Nota>
        📐 <b>Tudo em milímetros, na escala de corte.</b> Os retângulos vermelhos são
        recortes internos e os círculos são furos passantes — leve esta tela para a gráfica.
        As peças estão desenhadas <b>na mesma escala entre si</b>, então dá para comparar
        tamanhos batendo o olho.
      </Nota>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: 12, marginTop: 12 }}>
        {PECAS.map(p => <Peca key={p.id} p={p} />)}
      </div>
    </>
  );
}

function Peca({ p }) {
  const ESC = 0.62;                       // px por mm — igual para todas
  const M = 34;                           // margem para as cotas
  const w = p.l * ESC, h = p.a * ESC;
  return (
    <div style={{ background: '#fff', border: `1px solid ${C.borda}`, borderRadius: 8,
                  padding: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <b style={{ fontSize: 12.5 }}>{p.nome}</b>
        <span style={{ fontSize: 11, color: C.fraco }}>×{p.qtd}</span>
      </div>
      <div style={{ fontSize: 10.5, color: C.fraco, marginBottom: 7 }}>
        {p.mat} · <b>{p.esp} mm</b> · {p.l} × {p.a} mm
      </div>

      <svg viewBox={`0 0 ${w + M * 2} ${h + M * 2}`} style={{ width: '100%', maxHeight: 230 }}>
        <rect x={M} y={M} width={w} height={h} fill={C.acr} fillOpacity="0.35"
              stroke={C.acrB} strokeWidth="1.6" />
        {(p.recortes ?? []).map((r, i) => (
          <g key={i}>
            <rect x={M + r.x * ESC} y={M + r.y * ESC} width={r.l * ESC} height={r.a * ESC}
                  fill="#fff" stroke={C.corte} strokeWidth="1.4" strokeDasharray="4 2" />
            <text x={M + (r.x + r.l / 2) * ESC} y={M + (r.y + r.a / 2) * ESC + 3}
                  fontSize="8" fill={C.corte} textAnchor="middle">{r.l}×{r.a}</text>
          </g>
        ))}
        {(p.furos ?? []).map((f, i) => (
          <g key={i}>
            <circle cx={M + f.x * ESC} cy={M + f.y * ESC} r={Math.max(3, f.d * ESC / 2)}
                    fill="#fff" stroke={C.corte} strokeWidth="1.4" />
            <text x={M + f.x * ESC} y={M + f.y * ESC - 7} fontSize="7.5"
                  fill={C.corte} textAnchor="middle">Ø{f.d}</text>
          </g>
        ))}
        {/* cotas */}
        <Cota x1={M} y1={M + h + 13} x2={M + w} y2={M + h + 13} txt={`${p.l}`} />
        <Cota x1={M - 13} y1={M} x2={M - 13} y2={M + h} txt={`${p.a}`} vert />
      </svg>

      {p.borda && <Linha ic="📏" txt={<>Bordas: <b>{p.borda}</b></>} />}
      {(p.furos ?? []).map((f, i) => <Linha key={i} ic="⊙" txt={f.nome} />)}
      {(p.recortes ?? []).map((r, i) => <Linha key={i} ic="▢" txt={r.nome} />)}
      {p.porque && <Linha ic="💡" txt={p.porque} />}
      {p.cuidado && <Alerta>{p.cuidado}</Alerta>}
    </div>
  );
}

function Cota({ x1, y1, x2, y2, txt, vert }) {
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.cota} strokeWidth="0.8" />
      <line x1={x1} y1={vert ? y1 : y1 - 3} x2={vert ? x1 + 3 : x1} y2={vert ? y1 : y1 + 3}
            stroke={C.cota} strokeWidth="0.8" />
      <line x1={vert ? x2 : x2} y1={vert ? y2 : y2 - 3} x2={vert ? x2 + 3 : x2}
            y2={vert ? y2 : y2 + 3} stroke={C.cota} strokeWidth="0.8" />
      <text x={vert ? x1 - 4 : (x1 + x2) / 2} y={vert ? (y1 + y2) / 2 : y1 + 10}
            fontSize="9" fill={C.cota} textAnchor="middle"
            transform={vert ? `rotate(-90 ${x1 - 4} ${(y1 + y2) / 2})` : undefined}>{txt}</text>
    </g>
  );
}

/* ═══ ONDE FICA CADA CAMADA ════════════════════════════════════════ */
function Camadas() {
  const ESC = 3.2, H = 210;
  // acumula a posição sem reatribuir variável externa (o compilador do
  // React reclama disso, com razão: efeito colateral durante o render)
  const desenhos = CAMADAS.reduce((acc, c) => {
    const larg = c.esp === null ? 90 : Math.max(6, c.esp * ESC);
    const x = acc.length ? acc[acc.length - 1].x + acc[acc.length - 1].larg + 2 : 40;
    return [...acc, { ...c, x, larg }];
  }, []);
  const fim = desenhos[desenhos.length - 1];
  const x = fim.x + fim.larg;
  return (
    <>
      <Nota>
        🥪 <b>Um corte horizontal pela parede lateral</b>, do ar de dentro até o mundo lá
        fora. É este desenho que responde <i>&quot;onde fica a placa branca?&quot;</i> — ela é
        a última camada, a pele externa, afastada 30 mm da parede pelos espaçadores.
      </Nota>
      <div style={{ background: '#fff', border: `1px solid ${C.borda}`, borderRadius: 8,
                    padding: 14, marginTop: 12, overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${x + 40} ${H + 78}`} style={{ width: '100%', minWidth: 640 }}>
          <text x="40" y="16" fontSize="10" fill={C.fraco}>◄ DENTRO da câmara</text>
          <text x={x - 10} y="16" fontSize="10" fill={C.fraco} textAnchor="end">FORA ►</text>
          {desenhos.map((c, i) => (
            <g key={i}>
              <rect x={c.x} y={26} width={c.larg} height={H}
                    fill={c.cor} stroke={c.tipo === 'vao' ? C.corte : C.acrB}
                    strokeWidth={c.tipo === 'vao' ? 1.8 : 1.2}
                    strokeDasharray={c.tipo === 'vao' ? '5 3' : undefined} />
              <text x={c.x + c.larg / 2} y={H + 44} fontSize="9" fill={C.cota}
                    textAnchor="end" transform={`rotate(-40 ${c.x + c.larg / 2} ${H + 44})`}>
                {c.nome}
              </text>
              {c.esp !== null && (
                <text x={c.x + c.larg / 2} y={20} fontSize="8.5" fill={C.cota}
                      textAnchor="middle">{c.esp} mm</text>
              )}
            </g>
          ))}
        </svg>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))',
                    gap: 10, marginTop: 12 }}>
        {CAMADAS.map((c, i) => (
          <div key={i} style={{ background: '#fff', border: `1px solid ${C.borda}`,
                                borderLeft: `5px solid ${c.tipo === 'vao' ? C.corte : C.acrB}`,
                                borderRadius: 7, padding: '10px 12px' }}>
            <b style={{ fontSize: 12.5 }}>{c.nome}</b>
            {c.esp !== null && <span style={{ fontSize: 11, color: C.fraco }}> · {c.esp} mm</span>}
            <div style={{ fontSize: 11.5, marginTop: 4, lineHeight: 1.55 }}>{c.diz}</div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ═══ A PORTA ══════════════════════════════════════════════════════ */
function Porta() {
  const ESC = 0.95;
  const cam = PORTA.reduce((acc, p) => {
    const w = Math.max(14, p.esp * 3.4);
    const x = acc.length ? acc[acc.length - 1].x + acc[acc.length - 1].w + 26 : 30;
    return [...acc, { ...p, x, w }];
  }, []);
  const ult = cam[cam.length - 1];
  const x = ult.x + ult.w;
  return (
    <>
      <Nota>
        🚪 <b>A porta é uma janela de vidro duplo.</b> Dois acrílicos com <b>ar preso</b>
        entre eles — e é o ar parado que isola, não o acrílico. Abaixo, a vista explodida
        (as peças afastadas para você ver a ordem) e o que cada uma faz.
      </Nota>

      <div style={{ background: '#fff', border: `1px solid ${C.borda}`, borderRadius: 8,
                    padding: 14, marginTop: 12, overflowX: 'auto' }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, marginBottom: 8 }}>
          Vista explodida — de fora para dentro
        </div>
        <svg viewBox={`0 0 ${x + 20} 310`} style={{ width: '100%', minWidth: 560 }}>
          <text x="30" y="14" fontSize="10" fill={C.fraco}>◄ FORA</text>
          <text x={x - 10} y="14" fontSize="10" fill={C.fraco} textAnchor="end">
            DENTRO da câmara ►
          </text>
          {cam.map((p, i) => (
            <g key={i}>
              <rect x={p.x} y={30} width={p.w} height={p.a * ESC}
                    fill={p.cor} stroke={C.acrB} strokeWidth="1.3"
                    strokeDasharray={p.nome === 'Câmara de ar' ? '5 3' : undefined} />
              <text x={p.x + p.w / 2} y={26} fontSize="8.5" fill={C.cota}
                    textAnchor="middle">{p.esp} mm</text>
              <text x={p.x + p.w / 2} y={p.a * ESC + 46} fontSize="9" fill={C.cota}
                    textAnchor="end"
                    transform={`rotate(-35 ${p.x + p.w / 2} ${p.a * ESC + 46})`}>
                {p.nome}
              </text>
              <text x={p.x + p.w / 2} y={p.a * ESC + 22} fontSize="8" fill={C.fraco}
                    textAnchor="middle">{p.l}×{p.a}</text>
            </g>
          ))}
        </svg>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))',
                    gap: 10, marginTop: 12 }}>
        {PORTA.map((p, i) => (
          <div key={i} style={{ background: '#fff', border: `1px solid ${C.borda}`,
                                borderLeft: `5px solid ${C.acrB}`, borderRadius: 7,
                                padding: '10px 12px' }}>
            <b style={{ fontSize: 12.5 }}>{i + 1}. {p.nome}</b>
            <div style={{ fontSize: 11, color: C.fraco }}>{p.l} × {p.a} mm · {p.esp} mm</div>
            <div style={{ fontSize: 11.5, marginTop: 4, lineHeight: 1.55 }}>{p.diz}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 13, fontWeight: 700, margin: '18px 0 8px' }}>
        Como ela prende e como ela veda
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {FIXACAO_PORTA.map((f, i) => (
          <div key={i} style={{ background: '#fff', border: `1px solid ${C.borda}`,
                                borderRadius: 7, padding: '10px 12px' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
              <b style={{ fontSize: 12.5 }}>{f.peca}</b>
              <span style={{ fontSize: 10.5, color: C.fraco }}>{f.onde} · {f.med}</span>
            </div>
            <div style={{ fontSize: 11.5, marginTop: 4, lineHeight: 1.55 }}>{f.diz}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12, background: '#fff5f5', border: '1px solid #ffc9c9',
                    borderRadius: 7, padding: '11px 13px' }}>
        <b style={{ fontSize: 12.5, color: '#c92a2a' }}>✔ {TESTE_PORTA.nome}</b>
        <Linha ic="▸" txt={<><b>Como:</b> {TESTE_PORTA.como}</>} />
        <Linha ic="▸" txt={<><b>Esperado:</b> {TESTE_PORTA.esperado}</>} />
        <Linha ic="▸" txt={<><b>Se falhar:</b> {TESTE_PORTA.ajuste}</>} />
      </div>
    </>
  );
}

/* ═══ ORDEM DE MONTAGEM ════════════════════════════════════════════ */
function OrdemMontagem() {
  const [feitos, setFeitos] = useState({});
  const alterna = n => setFeitos(f => ({ ...f, [n]: !f[n] }));
  const prontos = Object.values(feitos).filter(Boolean).length;

  return (
    <>
      <Nota>
        🔧 <b>A ordem importa mais do que parece.</b> Acrílico se cola por capilaridade e
        cura em segundos — os passos marcados como <b style={{ color: C.corte }}>sem volta</b>{' '}
        não se desfazem. Confira o que cada um pede <i>antes</i> de passar cola.
      </Nota>
      <div style={{ margin: '12px 0 10px', fontSize: 12, color: C.fraco }}>
        {prontos} de {PASSOS.length} concluídos
        <div style={{ height: 5, background: '#e9ecef', borderRadius: 3, marginTop: 4 }}>
          <div style={{ height: '100%', width: `${100 * prontos / PASSOS.length}%`,
                        background: '#40c057', borderRadius: 3 }} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {PASSOS.map(p => {
          const ok = !!feitos[p.n];
          return (
            <div key={p.n} style={{
              background: '#fff', borderRadius: 8, padding: '11px 13px',
              border: `1px solid ${ok ? '#8ce99a' : C.borda}`, opacity: ok ? 0.62 : 1 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <input type="checkbox" checked={ok} onChange={() => alterna(p.n)}
                       style={{ marginTop: 3, cursor: 'pointer', width: 16, height: 16 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'baseline',
                                flexWrap: 'wrap' }}>
                    <b style={{ fontSize: 13 }}>{p.n}. {p.titulo}</b>
                    {p.irreversivel && (
                      <span style={{ fontSize: 9.5, fontWeight: 700, padding: '2px 7px',
                                     borderRadius: 9, background: '#ffe3e3', color: C.corte }}>
                        SEM VOLTA
                      </span>)}
                    {p.pecas.length > 0 && (
                      <span style={{ fontSize: 10, color: C.fraco }}>
                        peças: {p.pecas.join(' · ')}
                      </span>)}
                  </div>
                  <div style={{ fontSize: 12, marginTop: 5, lineHeight: 1.55 }}>{p.faz}</div>
                  <Linha ic="✔" txt={<><b>Confira:</b> {p.confira}</>} />
                  {p.porque && <Linha ic="💡" txt={p.porque} />}
                  {p.cuidado && <Alerta>{p.cuidado}</Alerta>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ═══ PEÇAS DE INTERFACE ═══════════════════════════════════════════ */
function Linha({ ic, txt }) {
  return (
    <div style={{ display: 'flex', gap: 6, fontSize: 11, color: C.fraco,
                  marginTop: 5, lineHeight: 1.5 }}>
      <span style={{ flexShrink: 0 }}>{ic}</span><span>{txt}</span>
    </div>
  );
}

function Alerta({ children }) {
  return (
    <div style={{ marginTop: 7, fontSize: 11, lineHeight: 1.5, padding: '7px 9px',
                  borderRadius: 5, background: '#fff5f5', border: '1px solid #ffc9c9',
                  color: '#c92a2a' }}>{children}</div>
  );
}

function Nota({ children }) {
  return (
    <div style={{ fontSize: 12, lineHeight: 1.6, padding: '10px 12px', borderRadius: 7,
                  background: '#e7f5ff', border: '1px solid #a5d8ff', color: C.texto }}>
      {children}
    </div>
  );
}
