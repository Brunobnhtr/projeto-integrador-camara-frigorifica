export default function Toolbar({ onOpenCad, onRoute, onPlay, onStopPlay, playing, loading, netCount, selectedNet, onSelectNet }) {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
      background: '#12141a', borderBottom: '1px solid #2a2d3a',
      display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px',
      boxShadow: '0 2px 8px #00000066',
    }}>
      <span style={{ color: '#60a5fa', fontWeight: 700, fontSize: 14, marginRight: 8, letterSpacing: 0.5 }}>
        CadeSIMU
      </span>

      <Btn onClick={onOpenCad} disabled={loading} color="#4b5563">
        📂 Abrir CAD
      </Btn>
      <Btn onClick={onRoute} disabled={loading} color="#3b82f6">
        ⚡ Rotear
      </Btn>

      <div style={{ width: 1, height: 20, background: '#2a2d3a', margin: '0 4px' }} />

      {playing ? (
        <Btn onClick={onStopPlay} color="#ef4444">⏹ Parar</Btn>
      ) : (
        <Btn onClick={onPlay} disabled={loading} color="#22c55e">▶ Play Fios</Btn>
      )}

      <div style={{ width: 1, height: 20, background: '#2a2d3a', margin: '0 4px' }} />

      {/* Net selector */}
      <span style={{ color: '#6b7280', fontSize: 12 }}>Rede:</span>
      <select
        value={selectedNet}
        onChange={e => onSelectNet(parseInt(e.target.value))}
        style={{
          background: '#1e2230', color: '#e5e7eb', border: '1px solid #374151',
          borderRadius: 4, padding: '2px 6px', fontSize: 12, maxWidth: 160,
        }}
      >
        <option value={-1}>Todas</option>
        {Array.from({ length: netCount }, (_, i) => (
          <option key={i} value={i}>Net {i}</option>
        ))}
      </select>

      {loading && (
        <span style={{ color: '#fbbf24', fontSize: 11, marginLeft: 8 }}>Carregando…</span>
      )}
    </div>
  );
}

function Btn({ children, onClick, disabled, color = '#4b5563' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: color + '22',
        border: `1px solid ${color}`,
        color: '#e5e7eb',
        borderRadius: 4,
        padding: '3px 10px',
        fontSize: 12,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background 0.15s',
      }}
    >
      {children}
    </button>
  );
}
