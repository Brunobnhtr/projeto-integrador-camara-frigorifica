import { useState, useRef, useEffect } from 'react';

const S = {
  sidebar: { width: 280, background: '#12141a', borderRight: '1px solid #1e2230', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', flexShrink: 0 },
  section: { borderBottom: '1px solid #1e2230', padding: '8px 10px' },
  title: { fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  btn: (color = '#3b82f6', disabled) => ({
    display: 'block', width: '100%', padding: '5px 8px', margin: '2px 0',
    background: color + '1a', border: `1px solid ${color}55`, borderRadius: 4,
    color: disabled ? '#4b5563' : '#e5e7eb', fontSize: 12, cursor: disabled ? 'not-allowed' : 'pointer',
    textAlign: 'left', opacity: disabled ? 0.5 : 1, transition: 'background 0.1s',
  }),
  input: { width: '100%', background: '#1e2230', border: '1px solid #374151', borderRadius: 4, color: '#e5e7eb', fontSize: 12, padding: '3px 6px', marginTop: 2 },
  tag: (color) => ({ display: 'inline-block', padding: '1px 5px', borderRadius: 3, fontSize: 10, background: color + '22', border: `1px solid ${color}55`, color: color, marginRight: 3, marginBottom: 2 }),
};

export default function Sidebar({ data, loading, selectedNet, playing, onAction }) {
  const [netAberta, setNetAberta] = useState(null);
  const [novoTerminal, setNovoTerminal] = useState('');
  const logRef = useRef(null);

  const nets = data?.nets ?? [];
  const comps = data?.nodes?.filter(n => n.type === 'component') ?? [];
  const log = data?.log ?? [];

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  const btn = (label, action, color, disabled) => (
    <button style={S.btn(color, disabled || loading)} onClick={() => !disabled && !loading && onAction(action)}>
      {label}
    </button>
  );

  return (
    <div style={S.sidebar}>
      {/* CAD Files */}
      <div style={S.section}>
        <div style={S.title}>Arquivo</div>
        {btn('📂 Abrir CAD...', 'browse_cad', '#3b82f6')}
        {btn('💾 Salvar Painel', 'salvar', '#6b7280')}
        {data?.cads_abertos?.length > 0 && (
          <div style={{ fontSize: 10, color: '#4b5563', marginTop: 4, wordBreak: 'break-all' }}>
            {data.cads_abertos.map(p => p.split(/[\\/]/).pop()).join(', ')}
          </div>
        )}
      </div>

      {/* Layout */}
      <div style={S.section}>
        <div style={S.title}>Componentes</div>
        {btn('⚡ Auto-Posicionar do CAD', 'auto_posicionar', '#8b5cf6')}
        {btn('🗺 Testar Roteamento', 'rotear', '#22c55e')}
        {btn('📄 Gerar Saídas Oficiais', 'gerar_saidas', '#f59e0b', !data?.cads_abertos?.length)}
        <div style={{ fontSize: 10, color: '#4b5563', marginTop: 4 }}>
          {comps.length} componentes no painel
        </div>
      </div>

      {/* Networks */}
      <div style={{ ...S.section, flex: '0 0 auto', maxHeight: 280, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={S.title}>Redes ({nets.length})</span>
          <button style={{ ...S.btn('#22c55e'), width: 'auto', padding: '2px 8px', margin: 0 }}
            onClick={() => onAction('nova_net')}>+ Nova</button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {nets.map((net, i) => (
            <div key={i}>
              <div
                onClick={() => {
                  const opening = netAberta !== i;
                  setNetAberta(opening ? i : null);
                  onAction('select_net', i);
                  onAction('isolate_net', opening ? i : -1);
                }}
                style={{
                  padding: '4px 6px', marginBottom: 2, borderRadius: 4, cursor: 'pointer',
                  background: netAberta === i
                    ? (net.tipo === 'terra' ? '#1a2f0f' : '#1e3a5f')
                    : (net.tipo === 'terra' ? '#111a08' : '#1a1d26'),
                  border: `1px solid ${netAberta === i
                    ? (net.tipo === 'terra' ? '#4d9e00' : '#3b82f6')
                    : (net.tipo === 'terra' ? '#2a3a10' : '#2a2d3a')}`,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}
              >
                <span style={{ fontSize: 12, color: net.tipo === 'terra' ? '#84cc16' : '#e5e7eb', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {net.tipo === 'terra' && <span title="Terra / PE">⏚</span>}
                  {net.cor && <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: net.cor, flexShrink: 0 }} />}
                  {net.nome || `Rede ${i + 1}`}
                  <span style={{ color: '#4b5563', fontSize: 10, marginLeft: 2 }}>({net.terminais.length}T)</span>
                </span>
                <button
                  onClick={e => { e.stopPropagation(); onAction('excluir_net', i); }}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 12, padding: '0 2px' }}
                >×</button>
              </div>

              {netAberta === i && (
                <div style={{ padding: '4px 8px', background: '#0f172a', borderRadius: 4, marginBottom: 4, border: '1px solid #1e3a5f' }}>
                  {/* Simulate this network */}
                  <button
                    style={{
                      ...S.btn('#22c55e'), width: '100%', margin: '0 0 6px 0',
                      textAlign: 'center', fontSize: 11,
                    }}
                    onClick={() => playing ? onAction('stop') : onAction('play_net', i)}
                  >
                    {playing && selectedNet === i ? '⏹ Parar Simulação' : '▶ Simular esta Rede'}
                  </button>
                  <div style={{ marginBottom: 4, flexWrap: 'wrap' }}>
                    {net.terminais.map(t => (
                      <span key={t} style={S.tag('#60a5fa')}>
                        {t}
                        <span style={{ marginLeft: 3, cursor: 'pointer', color: '#ef4444' }}
                          onClick={() => onAction('remover_terminal', i, t)}>×</span>
                      </span>
                    ))}
                    {net.terminais.length === 0 && <span style={{ color: '#4b5563', fontSize: 10 }}>Sem terminais</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <input
                      style={{ ...S.input, marginTop: 0, flex: 1 }}
                      placeholder="COMP:TERM (ex: KM1:A1)"
                      value={novoTerminal}
                      onChange={e => setNovoTerminal(e.target.value.toUpperCase())}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && novoTerminal.includes(':')) {
                          onAction('add_terminal', i, novoTerminal);
                          setNovoTerminal('');
                        }
                      }}
                    />
                    <button
                      style={{ ...S.btn('#22c55e'), width: 'auto', padding: '3px 8px', margin: 0 }}
                      onClick={() => {
                        if (novoTerminal.includes(':')) {
                          onAction('add_terminal', i, novoTerminal);
                          setNovoTerminal('');
                        }
                      }}
                    >+</button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {nets.length === 0 && (
            <div style={{ color: '#4b5563', fontSize: 11, textAlign: 'center', padding: 8 }}>
              Carregue um CAD para detectar redes
            </div>
          )}
        </div>
      </div>

      {/* Log console */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ ...S.section, borderBottom: 'none', paddingBottom: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={S.title}>Log</span>
          <button style={{ ...S.btn('#4b5563'), width: 'auto', padding: '1px 6px', margin: 0, fontSize: 10 }}
            onClick={() => onAction('clear_log')}>Limpar</button>
        </div>
        <div ref={logRef} style={{
          flex: 1, overflowY: 'auto', background: '#0a0c10', padding: '6px 8px',
          fontFamily: 'Consolas, monospace', fontSize: 10, color: '#00cc88',
          lineHeight: 1.5, minHeight: 0,
        }}>
          {log.length === 0
            ? <span style={{ color: '#2a2d3a' }}>Sem mensagens</span>
            : log.map((l, i) => <div key={i} style={{ color: l.startsWith('✗') ? '#f87171' : l.startsWith('✓') ? '#4ade80' : '#00cc88' }}>{l}</div>)
          }
          {loading && <div style={{ color: '#fbbf24' }}>Processando…</div>}
        </div>
      </div>
    </div>
  );
}
