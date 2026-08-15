import { useState } from 'react';
import { PINAGENS } from '../data/pinagens';
import { TENSOES, paraOndeVai } from '../data/painel';

/* Desenha um módulo comprado a partir da pinagem tirada da foto.
   Tudo em milímetros; o SVG converte para pixels. */

function Marco({ m }) {
  const t = {
    ci:      { fill: '#2b2b2b', stroke: '#000',    fs: 2.4, cor: '#f1f3f5' },
    soquete: { fill: '#1a1a1a', stroke: '#555',    fs: 2.6, cor: '#adb5bd' },
    display: { fill: '#2b0000', stroke: '#800',    fs: 6.5, cor: '#ff4d4d' },
    bloco:   { fill: '#c9ced3', stroke: '#8a9096', fs: 3.4, cor: '#343a40' },
  }[m.tipo];

  if (m.tipo === 'furo')
    return <><circle cx={m.x} cy={m.y} r={1.6} fill="#e9ecef" stroke="#868e96" strokeWidth={0.3} />
             <circle cx={m.x} cy={m.y} r={0.9} fill="#495057" /></>;

  if (m.tipo === 'cap')
    return <><circle cx={m.x} cy={m.y} r={m.r} fill="#2b2b2b" stroke="#6b5b3e" strokeWidth={0.5} />
             <circle cx={m.x} cy={m.y} r={m.r * 0.45} fill="#4a4a4a" /></>;

  if (m.tipo === 'trim')
    return <><circle cx={m.x} cy={m.y} r={m.r} fill="#1864ab" stroke="#0b4a86" strokeWidth={0.4} />
             <line x1={m.x - m.r * 0.6} y1={m.y} x2={m.x + m.r * 0.6} y2={m.y}
                   stroke="#e9ecef" strokeWidth={0.7} />
             <text x={m.x} y={m.y - m.r - 1} textAnchor="middle" fontSize={2}
                   fill="#495057">{m.texto}</text></>;

  if (m.tipo === 'botao')
    return <><rect x={m.x - m.r} y={m.y - m.r} width={m.r * 2} height={m.r * 2} rx={0.5}
                   fill="#2b2b2b" /><circle cx={m.x} cy={m.y} r={m.r * 0.5} fill="#868e96" />
             <text x={m.x} y={m.y + m.r + 2.6} textAnchor="middle" fontSize={2}
                   fill="#495057">{m.texto}</text></>;

  if (m.tipo === 'fan')
    return (
      <g>
        <rect x={m.x - m.r} y={m.y - m.r} width={m.r * 2} height={m.r * 2} rx={1.5}
              fill="#2b2b2b" stroke="#111" strokeWidth={0.4} />
        <circle cx={m.x} cy={m.y} r={m.r * 0.82} fill="#3a3a3a" stroke="#555" strokeWidth={0.4} />
        {[0, 60, 120, 180, 240, 300].map(a => (
          <path key={a} d={`M ${m.x} ${m.y} L ${m.x + m.r * 0.78 * Math.cos(a * Math.PI / 180)} ${m.y + m.r * 0.78 * Math.sin(a * Math.PI / 180)}`}
                stroke="#555" strokeWidth={m.r * 0.22} strokeLinecap="round" />
        ))}
        <circle cx={m.x} cy={m.y} r={m.r * 0.28} fill="#1a1a1a" />
        <text x={m.x} y={m.y + m.r + 3.4} textAnchor="middle" fontSize={2.6}
              fill="#495057">{m.texto}</text>
      </g>
    );

  return (
    <g>
      <rect x={m.x} y={m.y} width={m.w} height={m.h} rx={0.8}
            fill={t.fill} stroke={t.stroke} strokeWidth={0.4} />
      <text x={m.x + m.w / 2} y={m.y + m.h / 2 + t.fs * 0.36} textAnchor="middle"
            fontSize={t.fs} fill={t.cor} fontWeight={m.tipo === 'display' ? 700 : 400}
            fontFamily={m.tipo === 'display' ? 'monospace' : 'inherit'}>
        {m.texto}
      </text>
    </g>
  );
}

function Grupo({ g, compId, sel, onSel }) {
  const vert = g.lado === 'esquerda' || g.lado === 'direita';
  const fora = g.lado === 'direita' ? 1 : g.lado === 'esquerda' ? -1 : 1;

  const pos = (i) => {
    if (g.colunas === 2) {                      // barra de pinos 2 × N
      const lin = Math.floor(i / 2), col = i % 2;
      return [g.x + col * g.passo, g.y + lin * g.passo];
    }
    return vert ? [g.x, g.y + i * g.passo] : [g.x + i * g.passo, g.y];
  };

  return (
    <g>
      {/* corpo do conector */}
      {g.tipo === 'borne' && (
        <rect
          x={vert ? g.x - 3.4 : g.x - 3} y={vert ? g.y - 3 : g.y - 3.4}
          width={vert ? 6.8 : (g.pinos.length - 1) * g.passo + 6}
          height={vert ? (g.pinos.length - 1) * g.passo + 6 : 6.8}
          rx={0.8} fill={g.cor} stroke="#1c4526" strokeWidth={0.4} opacity={0.9} />
      )}

      {g.pinos.map((p, i) => {
        const [x, y] = pos(i);
        const ativo = sel === `${g.ref}.${p.n}`;
        const lig = compId ? paraOndeVai(`${compId}:${p.nome}`) : [];
        const rot = vert ? 0 : -55;
        const lx = vert ? x + fora * 7.5 : x;
        const ly = vert ? y + 0.9 : y + (g.lado === 'baixo' ? 9 : -7);

        return (
          <g key={p.n} onClick={() => onSel(ativo ? null : { ...p, grupo: g })}
             style={{ cursor: 'pointer' }}>
            {g.tipo === 'fios' ? (
              <>
                <path d={`M ${x} ${y - 8} Q ${x + 4} ${y} ${x} ${y + 7}`} fill="none"
                      stroke={ativo ? '#e8590c' : (p.alerta ? '#c92a2a' : '#212529')}
                      strokeWidth={ativo ? 2.2 : 1.4} strokeLinecap="round" />
                <path d={`M ${x + 2.5} ${y - 8} Q ${x + 6.5} ${y} ${x + 2.5} ${y + 7}`}
                      fill="none" stroke={ativo ? '#e8590c' : '#c92a2a'}
                      strokeWidth={ativo ? 2.2 : 1.4} strokeLinecap="round" />
              </>
            ) : (
              <>
                <circle cx={x} cy={y} r={ativo ? 2.4 : 1.7}
                        fill={ativo ? '#e8590c' : (p.usa ? '#e9c46a' : '#adb5bd')}
                        stroke="#343a40" strokeWidth={0.35} />
                {g.tipo === 'borne' && (
                  <line x1={x - 1.1} y1={y} x2={x + 1.1} y2={y}
                        stroke="#495057" strokeWidth={0.45} />
                )}
              </>
            )}
            <text x={lx} y={ly}
                  textAnchor={vert ? (fora > 0 ? 'start' : 'end') : 'middle'}
                  fontSize={2.5} fontWeight={p.usa ? 700 : 400}
                  fill={ativo ? '#e8590c' : (p.alerta ? '#c92a2a' : (p.usa ? '#212529' : '#adb5bd'))}
                  transform={rot ? `rotate(${rot} ${lx} ${ly})` : undefined}>
              {p.nome}{lig.length ? ' ●' : ''}
            </text>
          </g>
        );
      })}
    </g>
  );
}

export default function PlacaReal({ chave, compId }) {
  const [sel, setSel] = useState(null);
  const p = PINAGENS[chave];
  if (!p) return null;

  const M = 30; // margem para os rótulos
  const lig = sel && compId ? paraOndeVai(`${compId}:${sel.nome}`) : [];

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflow: 'auto', padding: 20, background: '#eef1f5' }}>
        <svg width="100%" viewBox={`${-M} ${-M} ${p.larguraMm + M * 2} ${p.alturaMm + M * 2}`}
             style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 6px #0002',
                      maxHeight: '68vh' }}>
          <rect x={0} y={0} width={p.larguraMm} height={p.alturaMm} rx={2}
                fill={p.pcb} stroke="#000" strokeWidth={0.5} opacity={p.ehMecanico ? 0.55 : 1} />
          {p.marcos?.map((m, i) => <Marco key={i} m={m} />)}
          {p.grupos.map(g => (
            <Grupo key={g.ref} g={g} compId={compId}
                   sel={sel ? `${sel.grupo.ref}.${sel.n}` : null} onSel={setSel} />
          ))}
          {/* régua */}
          <g transform={`translate(0 ${p.alturaMm + 14})`}>
            <line x1={0} y1={0} x2={20} y2={0} stroke="#495057" strokeWidth={0.4} />
            <line x1={0} y1={-1.4} x2={0} y2={1.4} stroke="#495057" strokeWidth={0.4} />
            <line x1={20} y1={-1.4} x2={20} y2={1.4} stroke="#495057" strokeWidth={0.4} />
            <text x={10} y={-2.2} textAnchor="middle" fontSize={2.6} fill="#495057">20 mm</text>
          </g>
        </svg>
        <p style={{ fontSize: 11.5, color: '#868e96', marginTop: 9, lineHeight: 1.5 }}>
          Desenhado a partir da foto em <code>imagens/</code>. A <b>ordem e o nome dos
          pinos</b> vêm da serigrafia e são exatos; o <b>contorno da placa</b> é
          aproximado. Confie para ligar o fio certo, não para furar chapa.
          {' '}Bolinha <b style={{ color: '#c9a227' }}>amarela</b> = pino usado no projeto;
          {' '}<b>●</b> ao lado do nome = tem cabo mapeado.
        </p>
      </div>

      <aside style={{ width: 340, background: '#fff', borderLeft: '1px solid #dee2e6',
                      overflowY: 'auto', flexShrink: 0, padding: '14px 16px' }}>
        <div style={{ fontSize: 12, color: '#495057', lineHeight: 1.55 }}>{p.nota}</div>

        {sel && (
          <div style={{ marginTop: 12, padding: 11, background: '#fffbe6',
                        border: '2px solid #f5a524', borderRadius: 7 }}>
            <b style={{ fontSize: 14, color: '#8a5a00' }}>{sel.nome}</b>
            <div style={{ fontSize: 11, color: '#868e96', marginTop: 2 }}>
              {sel.grupo.legenda}
            </div>
            {sel.papel && (
              <div style={{ fontSize: 11.5, marginTop: 6, lineHeight: 1.5, color: '#343a40' }}>
                {sel.papel}
              </div>
            )}
            {lig.map(({ cabo, destino }) => {
              const ct = TENSOES[cabo.tensao] ?? TENSOES.SINAL;
              return (
                <div key={cabo.n + destino} style={{
                  marginTop: 6, paddingLeft: 8, borderLeft: `3px solid ${ct.cor}`,
                  fontSize: 11.5,
                }}>
                  <span style={{ color: ct.cor, fontWeight: 700 }}>→ {destino}</span>
                  <span style={{ color: '#868e96' }}> · cabo {cabo.n} · {cabo.cor}</span>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: 13 }}>
          {p.avisos?.map((a, i) => {
            const forte = a.startsWith('⚠️') || a.startsWith('⭐');
            const num = /^[1-9]️⃣/.test(a);
            return (
              <div key={i} style={{
                fontSize: 11.5, lineHeight: 1.55, marginBottom: 8, padding: '8px 10px',
                borderRadius: 6, marginLeft: num ? 10 : 0,
                background: forte ? '#fff5f5' : (num ? '#f1f3f5' : '#f8f9fa'),
                color: forte ? '#c92a2a' : '#343a40',
                fontWeight: a.startsWith('⭐') ? 700 : 400,
              }}>{a}</div>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
