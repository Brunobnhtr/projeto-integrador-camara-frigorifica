import { Handle, Position } from '@xyflow/react';
import { usePanelContext } from '../context/PanelContext';

function tipoColuna(top, bot) {
  for (const t of [top, bot].filter(Boolean)) {
    const u = t.toUpperCase();
    if (/^[AB][12]$/.test(u)) return 'forca';
    if (/^\d$/.test(u) && +u >= 1 && +u <= 6) return 'forca';
    if (['PE','N','U','V','W','R','S','T'].includes(u)) return 'forca';
    if (/^[LT][1-3]$/.test(u)) return 'forca';
    if (/^X[12]$/.test(u)) return 'forca';
  }
  return 'aux';
}

const CATEGORIA_COLORS = {
  contator_pot: { border: '#3b82f6', accent: '#60a5fa', bg: '#0d1829' },
  disjuntor:    { border: '#8b5cf6', accent: '#a78bfa', bg: '#10101e' },
  rele_termico: { border: '#ef4444', accent: '#f87171', bg: '#180e0e' },
  fusivel:      { border: '#f59e0b', accent: '#fbbf24', bg: '#18160a' },
  botao:        { border: '#22c55e', accent: '#4ade80', bg: '#0b160d' },
  seletor:      { border: '#16a34a', accent: '#4ade80', bg: '#0b160d' },
  sinaleiro:    { border: '#ec4899', accent: '#f472b6', bg: '#180b13' },
  motor:        { border: '#14b8a6', accent: '#2dd4bf', bg: '#0a1616' },
  bobina:       { border: '#6366f1', accent: '#818cf8', bg: '#0e0e1e' },
  rele:         { border: '#6366f1', accent: '#818cf8', bg: '#0e0e1e' },
  entrada:      { border: '#6b7280', accent: '#9ca3af', bg: '#111113' },
  fonte_dc:     { border: '#0ea5e9', accent: '#38bdf8', bg: '#0a1218' },
  temporizador: { border: '#f59e0b', accent: '#fcd34d', bg: '#161408' },
  sensor:       { border: '#d946ef', accent: '#e879f9', bg: '#160b18' },
  outro:        { border: '#4b5563', accent: '#6b7280', bg: '#0f0f0f' },
};

// Node = 80px height. Python: terminal a EXT=8px fora da borda (y1-8 / y2+8).
// Handle center em y = -(8 + 3.5) = -11.5 do topo → top: -12
// Quadrado: 16px alto, flush com a borda do node (top:-16 vai de y=-16 a y=0)
const NODE_H   = 80;
const SQ_H     = 16;   // altura do quadrado do terminal
const H_TOP    = -(SQ_H / 2 + 4);  // top do Handle: centro em y = -SQ_H/2 - 4 + 3.5
// = -8 - 4 + 3.5 = -8.5 ≈ -8.5 fora da borda — ok para EXT=8

// ── Terminal square: quadrado com o número + Handle invisível ─────────────────
function TerminalSquare({ nome, term, side, lx, tipo, flowing, borderColor }) {
  const { onTerminalClick, editMode } = usePanelContext();
  const clickable = !editMode && !flowing && !!onTerminalClick;

  const isForca = tipo === 'forca';
  const sqBorder = flowing  ? '#facc15'
                 : isForca ? borderColor
                 :           '#3f3f46';
  const sqBg     = flowing  ? '#2d2500'
                 : isForca ? '#0a1428'
                 :           '#18181b';
  const txtColor = flowing  ? '#fde68a'
                 : isForca ? '#93c5fd'
                 :           '#a1a1aa';
  const glow     = flowing  ? `0 0 6px #facc15aa` : 'none';

  const posStyle = side === 'top' ? { top: -SQ_H } : { bottom: -SQ_H };
  const handlePos = side === 'top'
    ? { top:    -SQ_H / 2 - 4 }
    : { bottom: -SQ_H / 2 - 4 };

  const handleClick = clickable
    ? (e) => { e.stopPropagation(); onTerminalClick(nome, term); }
    : undefined;

  return (
    <>
      {/* Quadrado do terminal */}
      <div
        onClick={handleClick}
        style={{
          position: 'absolute',
          left: lx,
          transform: 'translateX(-50%)',
          ...posStyle,
          height: SQ_H,
          minWidth: SQ_H,
          padding: '0 3px',
          background: sqBg,
          border: `1.5px solid ${sqBorder}`,
          borderRadius: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: glow,
          zIndex: 8,
          // No modo leitura: pointer-events auto para capturar cliques
          // No modo edição: none para deixar passar ao Handle abaixo
          pointerEvents: clickable ? 'auto' : 'none',
          cursor: clickable ? 'pointer' : 'default',
          transition: 'border-color 0.3s, box-shadow 0.3s',
          boxSizing: 'border-box',
        }}
        title={clickable ? `${nome}:${term} — clique para isolar rede` : undefined}
      >
        <span style={{
          fontSize: 6.5, fontWeight: 700,
          color: txtColor, lineHeight: 1,
          whiteSpace: 'nowrap',
          textShadow: flowing ? '0 0 4px #fbbf24' : 'none',
          userSelect: 'none',
        }}>{term}</span>
      </div>

      {/* Handle ReactFlow — invisível, posicionado no centro do quadrado */}
      <Handle
        type={side === 'top' ? 'target' : 'source'}
        position={side === 'top' ? Position.Top : Position.Bottom}
        id={`${nome}:${term}`}
        style={{
          position: 'absolute',
          left: lx,
          ...handlePos,
          width: 1, height: 1,
          background: 'transparent',
          border: 'none',
          transform: 'translateX(-50%)',
          zIndex: 9,
          opacity: 0,
        }}
      />
    </>
  );
}

export default function ComponentNode({ data, selected }) {
  const { nome, colunas, categoria, w, flowing } = data;
  const colors = CATEGORIA_COLORS[categoria] || CATEGORIA_COLORS.outro;

  const nodeWidth = Math.max(60, w ?? 60);
  const cols    = colunas ?? [];
  const nCols   = Math.max(1, cols.length);
  const colStep = nodeWidth / (nCols + 1);
  const tipos   = cols.map(([top, bot]) => tipoColuna(top, bot));

  // Stub: linha da borda do node até o centro do quadrado (SQ_H/2 de altura)
  const stubs = cols.flatMap(([topTerm, botTerm], i) => {
    const lx = colStep * (i + 1);
    const tipo = tipos[i];
    const stubClr = flowing ? '#facc1555'
                  : tipo === 'forca' ? `${colors.border}66` : '#3f3f4666';
    const els = [];
    if (topTerm) els.push(
      <div key={`stT-${i}`} style={{
        position: 'absolute', left: lx - 0.5, width: 1,
        top: -SQ_H, height: SQ_H + 1,  // da borda do quadrado até dentro do node
        background: stubClr, pointerEvents: 'none', zIndex: 2,
      }} />
    );
    if (botTerm) els.push(
      <div key={`stB-${i}`} style={{
        position: 'absolute', left: lx - 0.5, width: 1,
        bottom: -SQ_H, height: SQ_H + 1,
        background: stubClr, pointerEvents: 'none', zIndex: 2,
      }} />
    );
    return els;
  });

  const terminals = cols.flatMap(([topTerm, botTerm], i) => {
    const lx   = colStep * (i + 1);
    const tipo = tipos[i];
    const els  = [];
    if (topTerm) els.push(
      <TerminalSquare key={`top-${i}`}
        nome={nome} term={topTerm} side="top"
        lx={lx} tipo={tipo} flowing={flowing} borderColor={colors.border}
      />
    );
    if (botTerm) els.push(
      <TerminalSquare key={`bot-${i}`}
        nome={nome} term={botTerm} side="bot"
        lx={lx} tipo={tipo} flowing={flowing} borderColor={colors.border}
      />
    );
    return els;
  });

  return (
    <div
      className="node-drag-handle select-none"
      style={{
        width: nodeWidth, height: NODE_H,
        background: colors.bg,
        border: `2px solid ${selected ? '#facc15' : flowing ? colors.accent : colors.border}`,
        borderRadius: 7,
        boxShadow: selected
          ? `0 0 16px ${colors.border}aa`
          : flowing
            ? `0 0 20px ${colors.accent}88, 0 0 40px ${colors.accent}33`
            : '0 2px 12px #00000088',
        position: 'relative',
        overflow: 'visible',
        cursor: 'grab',
        fontFamily: "'Segoe UI', sans-serif",
        transition: 'box-shadow 0.4s, border-color 0.4s',
      }}
    >
      {/* Faixa decorativa topo — onde saem os terminais */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, transparent, ${colors.border}88, transparent)`,
        borderRadius: '5px 5px 0 0', pointerEvents: 'none',
      }} />
      {/* Faixa decorativa base */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, transparent, ${colors.border}88, transparent)`,
        borderRadius: '0 0 5px 5px', pointerEvents: 'none',
      }} />

      {/* Stubs: linha vertical borda→quadrado */}
      {stubs}

      {/* Nome — centro limpo */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none', zIndex: 4,
      }}>
        <span style={{
          fontSize: 11, fontWeight: 900,
          color: flowing ? '#fde68a' : colors.accent,
          letterSpacing: 0.8,
          textShadow: flowing
            ? `0 0 10px ${colors.accent}, 0 0 20px ${colors.accent}88`
            : `0 1px 6px #000e`,
          transition: 'color 0.4s, text-shadow 0.4s',
          whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: '95%',
          textAlign: 'center',
        }}>{nome}</span>
      </div>

      {/* Quadrados dos terminais + Handles */}
      {terminals}
    </div>
  );
}
