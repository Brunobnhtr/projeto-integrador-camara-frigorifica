/* Recebe o layout físico da placa por prop (`dados`), para servir tanto
   à PI-1, que tem um CI nu, quanto à PI-2, que tem módulos encaixados. */

/* Vista ampliada de UM circuito, para responder à pergunta que o desenho
   da placa inteira não responde: "o fio entra em qual perna?"           */

const P = 26;                              // px por furo, bem ampliado
const cx = c => 60 + c * P;
const cy = l => 40 + l * P;

/* ── corte lateral: o que acontece embaixo da placa ─────────────────── */
function CorteLateral() {
  return (
    <svg viewBox="0 0 470 190" style={{ width: '100%', maxWidth: 470 }}>
      <text x={10} y={16} fontSize={12.5} fontWeight="700" fill="#212529">
        Corte lateral — a placa vista de lado
      </text>

      {/* corpo do capacitor */}
      <ellipse cx={150} cy={52} rx={26} ry={20} fill="#2d6cb5" stroke="#1e4a7d" strokeWidth={2} />
      <text x={150} y={57} textAnchor="middle" fontSize={13} fill="#fff" fontWeight="700">104</text>
      <text x={150} y={22} textAnchor="middle" fontSize={11.5} fill="#1971c2" fontWeight="700">
        C1 — em cima da placa
      </text>

      {/* pernas */}
      <line x1={132} y1={70} x2={124} y2={104} stroke="#adb5bd" strokeWidth={3} />
      <line x1={168} y1={70} x2={176} y2={104} stroke="#adb5bd" strokeWidth={3} />

      {/* placa */}
      <rect x={20} y={104} width={430} height={16} fill="#d8c9a3" stroke="#a8946a" strokeWidth={1.5} />
      <text x={30} y={116} fontSize={10.5} fill="#8a7a52">a placa (1,6 mm)</text>

      {/* ilhas de cobre */}
      {[124, 176, 300].map(x => (
        <rect key={x} x={x - 11} y={118} width={22} height={4} fill="#c9a227" />
      ))}

      {/* solda */}
      {[124, 176].map(x => (
        <path key={x} d={`M ${x - 12} 122 Q ${x} 140 ${x + 12} 122 Z`} fill="#9aa0a6" />
      ))}
      <text x={124} y={158} textAnchor="middle" fontSize={10.5} fill="#495057">solda</text>
      <text x={176} y={158} textAnchor="middle" fontSize={10.5} fill="#495057">solda</text>

      {/* jumper soldado NA MESMA ilha */}
      <path d="M 124 132 Q 70 172 24 150" fill="none" stroke="#1971c2" strokeWidth={3.5}
            strokeLinecap="round" />
      <text x={20} y={142} textAnchor="start" fontSize={11} fill="#1971c2" fontWeight="700">
        fio que vem de J1-1
      </text>

      {/* barramento */}
      <path d="M 176 132 L 300 132" stroke="#212529" strokeWidth={4} strokeLinecap="round" />
      <circle cx={300} cy={132} r={4} fill="#212529" />
      <text x={310} y={136} fontSize={11} fill="#212529" fontWeight="700">
        barramento de 0 V
      </text>

      <text x={20} y={182} fontSize={11} fill="#c92a2a" fontWeight="700">
        ⬅ Repare: o fio NÃO passa por dentro do capacitor. Ele solda no mesmo
        ponto de solda da perna.
      </text>
    </svg>
  );
}

/* ── vista de cima dos furos de um nó ───────────────────────────────── */
function VistaDoNo({ no, discretos, BARRAMENTO_0V }) {
  const comps = discretos.filter(c => c.circuito === no.circuito);
  const cols = [];
  for (let c = no.de; c <= no.ate; c++) cols.push(c);

  const larg = cx(no.ate) + 200;
  const alt = cy(BARRAMENTO_0V.linha) + 90;

  return (
    <svg viewBox={`0 ${cy(no.linha) - 130} ${larg} ${alt - cy(no.linha) + 190}`}
         style={{ width: '100%', background: '#fff', borderRadius: 8 }}>
      {/* ponte de fio nu = o nó */}
      <line x1={cx(no.de)} y1={cy(no.linha)} x2={cx(no.ate)} y2={cy(no.linha)}
            stroke="#212529" strokeWidth={7} strokeLinecap="round" />
      <text x={(cx(no.de) + cx(no.ate)) / 2} y={cy(no.linha) - 52}
            textAnchor="middle" fontSize={15} fontWeight="700" fill="#212529">
        {no.ref}
      </text>
      <text x={(cx(no.de) + cx(no.ate)) / 2} y={cy(no.linha) - 34}
            textAnchor="middle" fontSize={11.5} fill="#868e96">
        ponte de fio nu unindo os furos — daqui tudo está ligado a tudo
      </text>

      {/* furos do nó */}
      {cols.map(c => {
        const desc = no.furos?.[c];
        return (
          <g key={c}>
            <circle cx={cx(c)} cy={cy(no.linha)} r={11} fill="#e8b04b" stroke="#8a6d1a" strokeWidth={1.5} />
            <circle cx={cx(c)} cy={cy(no.linha)} r={4.5} fill="#4a3c10" />
            <text x={cx(c)} y={cy(no.linha) - 16} textAnchor="middle" fontSize={10} fill="#868e96">
              furo {c},{no.linha}
            </text>
            {desc && (
              <text x={cx(c)} y={cy(no.linha) + 30} textAnchor="middle" fontSize={11}
                    fill="#212529" fontWeight="600">
                {desc.split(' ').reduce((ls, w) => {
                  const last = ls[ls.length - 1];
                  if ((last + ' ' + w).length > 16) ls.push(w); else ls[ls.length - 1] = last + ' ' + w;
                  return ls;
                }, ['']).map((linha, i) => (
                  <tspan key={i} x={cx(c)} dy={i ? 12 : 0}>{linha}</tspan>
                ))}
              </text>
            )}
          </g>
        );
      })}

      {/* componentes que descem do nó até o barramento */}
      {comps.filter(k => k.furos.some(([c, l]) => l === no.linha && c >= no.de && c <= no.ate))
        .map(k => {
          const [[c1, l1], [c2, l2]] = k.furos;
          const dentro = l1 === no.linha ? 0 : 1;
          const cc = k.furos[dentro][0], outroL = k.furos[1 - dentro][1];
          const y1 = cy(no.linha), y2 = cy(outroL);
          const meio = (y1 + y2) / 2;
          return (
            <g key={k.ref}>
              <line x1={cx(cc)} y1={y1} x2={cx(cc)} y2={y2}
                    stroke="#adb5bd" strokeWidth={3} />
              {k.tipo === 'capacitor' ? (
                <>
                  <ellipse cx={cx(cc)} cy={meio} rx={19} ry={15}
                           fill="#2d6cb5" stroke="#1e4a7d" strokeWidth={1.5} />
                  <text x={cx(cc)} y={meio + 4} textAnchor="middle" fontSize={11}
                        fill="#fff" fontWeight="700">104</text>
                </>
              ) : (
                <rect x={cx(cc) - 9} y={meio - 20} width={18} height={40} rx={7}
                      fill="#c9b28a" stroke="#8d7c5e" strokeWidth={1.5} />
              )}
              <text x={cx(cc) + 26} y={meio - 2} fontSize={13} fontWeight="700" fill="#1971c2">
                {k.ref}
              </text>
              <text x={cx(cc) + 26} y={meio + 13} fontSize={11} fill="#495057">{k.valor}</text>
              {k.polaridade === false && (
                <text x={cx(cc) + 26} y={meio + 28} fontSize={11} fill="#2f9e44" fontWeight="700">
                  sem polaridade
                </text>
              )}
              {/* furo de baixo */}
              <circle cx={cx(cc)} cy={y2} r={11} fill="#e8b04b" stroke="#8a6d1a" strokeWidth={1.5} />
              <circle cx={cx(cc)} cy={y2} r={4.5} fill="#4a3c10" />
              <text x={cx(cc)} y={y2 + 27} textAnchor="middle" fontSize={10} fill="#868e96">
                furo {cc},{outroL}
              </text>
            </g>
          );
        })}

      {/* barramento de 0 V */}
      <line x1={cx(no.de) - 34} y1={cy(BARRAMENTO_0V.linha)}
            x2={cx(no.ate) + 60} y2={cy(BARRAMENTO_0V.linha)}
            stroke="#212529" strokeWidth={7} strokeLinecap="round" />
      <text x={cx(no.ate) + 68} y={cy(BARRAMENTO_0V.linha) + 5} fontSize={13}
            fontWeight="700" fill="#212529">0 V</text>
    </svg>
  );
}

export default function DetalheCircuito({ dados, circuito, onFechar }) {
  const { NOS, JUMPERS, BORNES, BARRAMENTO_0V, CIRCUITOS, DUVIDAS } = dados;
  const discretos = dados.COMPONENTES_PI1 ?? dados.COMPONENTES_PI2 ?? [];
  const CI1 = dados.CI1 ?? null;
  const MODULOS = dados.MODULOS ?? [];

  const info = CIRCUITOS.find(c => c.id === circuito);
  const nos = NOS.filter(n => n.circuito === circuito);
  const jumps = JUMPERS.filter(j => j.circuito === circuito);
  const comps = discretos.filter(c => c.circuito === circuito);
  const duvidas = DUVIDAS[circuito];

  const viaDe = (col, lin) => {
    for (const b of BORNES)
      if (b.linha === lin) {
        const v = b.vias.find(x => x.col === col);
        if (v) return `${b.ref}-${v.n} (${v.sinal})`;
      }
    if (lin === BARRAMENTO_0V.linha) return 'barramento de 0 V';
    const p = CI1?.pinos.find(x => x.col === col && x.lin === lin);
    if (p) return `CI pino ${p.n} (${p.nome})`;
    for (const m of MODULOS) {
      const mp = m.pinos.find(x => x.col === col && x.lin === lin);
      if (mp) return `${m.ref} · ${m.valor} — pino ${mp.nome}`;
    }
    const n = NOS.find(x => x.linha === lin && col >= x.de && col <= x.ate);
    if (n) return n.ref;
    return `furo ${col},${lin}`;
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: '#000000aa',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
         onClick={onFechar}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 10, width: '100%', maxWidth: 1180,
        height: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{ background: info.cor, color: '#fff', padding: '13px 18px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <b style={{ fontSize: 17 }}>{info.nome}</b>
            <div style={{ fontSize: 12, opacity: 0.9, marginTop: 2 }}>{info.resumo}</div>
          </div>
          <button onClick={onFechar} style={{
            background: '#ffffff33', color: '#fff', border: 'none', borderRadius: 5,
            width: 30, height: 30, cursor: 'pointer', fontSize: 17 }}>×</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 18, background: '#f8f9fa' }}>

          {duvidas && (
            <div style={{ marginBottom: 18 }}>
              {duvidas.map((d, i) => (
                <div key={i} style={{
                  background: '#fff', border: '2px solid #f5a524', borderRadius: 8,
                  padding: '11px 14px', marginBottom: 8,
                }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#8a5a00' }}>
                    ❓ {d.p}
                  </div>
                  <div style={{ fontSize: 12.5, color: '#343a40', marginTop: 5, lineHeight: 1.55 }}>
                    {d.r}
                  </div>
                </div>
              ))}
            </div>
          )}

          {nos.map(no => (
            <div key={no.ref} style={{ background: '#fff', borderRadius: 8, padding: 14,
                                       marginBottom: 14, border: '1px solid #dee2e6' }}>
              <VistaDoNo no={no} discretos={discretos} BARRAMENTO_0V={BARRAMENTO_0V} />
              <div style={{ fontSize: 12, color: '#495057', marginTop: 6, lineHeight: 1.5 }}>
                {no.nota}
              </div>
            </div>
          ))}

          {circuito === 1 && (
            <div style={{ background: '#fff', borderRadius: 8, padding: 14, marginBottom: 14,
                          border: '1px solid #dee2e6' }}>
              <CorteLateral />
            </div>
          )}

          <div style={{ background: '#fff', borderRadius: 8, padding: 14,
                        border: '1px solid #dee2e6' }}>
            <h3 style={{ fontSize: 13, margin: '0 0 10px', color: '#868e96', letterSpacing: 0.4 }}>
              PASSO A PASSO DESTE CIRCUITO
            </h3>
            <ol style={{ margin: 0, paddingLeft: 20, fontSize: 12.5, lineHeight: 1.7,
                         color: '#343a40' }}>
              {nos.map(no => (
                <li key={no.ref}>
                  Solde a <b>ponte de fio nu</b> do {no.ref}, unindo os furos{' '}
                  <b>{no.de} a {no.ate}</b> da linha <b>{no.linha}</b>.
                </li>
              ))}
              {comps.map(c => (
                <li key={c.ref}>
                  <b>{c.ref}</b> ({c.valor}): {c.ligacao}
                  {c.polaridade === false && (
                    <b style={{ color: '#2f9e44' }}> Não tem polaridade — tanto faz o lado.</b>
                  )}
                </li>
              ))}
              {jumps.map(j => (
                <li key={j.n}>
                  <b>Fio {j.n}</b> ({j.sinal}): de <b>{viaDe(...j.de)}</b>, furo ({j.de.join(',')}),
                  até <b>{viaDe(...j.para)}</b>, furo ({j.para.join(',')}).
                  {j.cruzaBus && (
                    <span style={{ color: '#c92a2a' }}> ⚠️ cruza o barramento de 0 V —
                      tem que ser fio ISOLADO.</span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
