import { useState, useEffect } from 'react';

const CAT_LABELS = {
  contator_pot: 'Contator de Potência',
  disjuntor:    'Disjuntor',
  rele_termico: 'Relé Térmico',
  fusivel:      'Fusível',
  botao:        'Botão',
  seletor:      'Seletor',
  sinaleiro:    'Sinaleiro',
  motor:        'Motor',
  bobina:       'Bobina',
  rele:         'Relé',
  entrada:      'Bloco de Terminais',
  fonte_dc:     'Fonte DC',
  temporizador: 'Temporizador',
  sensor:       'Sensor',
  outro:        'Outro',
};

const PROP_FIELDS = [
  { key: 'voltagem',       label: 'Tensão',         placeholder: 'ex: 220V, 24VDC' },
  { key: 'corrente',       label: 'Corrente',        placeholder: 'ex: 10A' },
  { key: 'potencia',       label: 'Potência',        placeholder: 'ex: 2.2kW' },
  { key: 'temporizacao',   label: 'Temporização',    placeholder: 'ex: 5s, 30s' },
  { key: 'ajuste_termico', label: 'Ajuste Térmico',  placeholder: 'ex: 4-6A' },
  { key: 'fabricante',     label: 'Fabricante',      placeholder: 'ex: Schneider' },
  { key: 'modelo',         label: 'Modelo/Ref.',     placeholder: 'ex: LC1D09' },
  { key: 'notas',          label: 'Notas',           placeholder: 'Observações...' },
];

export default function ComponentInfoModal({ comp, edges, onClose, onSaveProps }) {
  const [props, setProps] = useState({});

  useEffect(() => {
    setProps(comp?.data?.propriedades ?? {});
  }, [comp]);

  if (!comp) return null;

  const { nome, categoria, terminais } = comp.data;
  const allTerminals = Object.keys(terminais || {});

  // Build connection map from edges
  const termConns = {};
  for (const edge of (edges || [])) {
    if (!edge.data?.u || !edge.data?.v) continue;
    const [cu, tu] = edge.data.u.split(':');
    const [cv, tv] = edge.data.v.split(':');
    const net = edge.data.netNome || `Net${edge.data.netIdx}`;
    const cor  = edge.data.cor || '#60a5fa';
    if (cu === nome) {
      (termConns[tu] ??= []).push({ comp: cv, term: tv, net, cor });
    }
    if (cv === nome) {
      (termConns[tv] ??= []).push({ comp: cu, term: tu, net, cor });
    }
  }

  const handleSave = () => {
    onSaveProps(nome, props);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: '#00000090', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Segoe UI', sans-serif",
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#1a1d26', border: '1px solid #2a2d3a',
        borderRadius: 10, width: 540, maxHeight: '82vh',
        boxShadow: '0 12px 48px #000d', display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* ── Header ── */}
        <div style={{
          background: '#0d0f14', padding: '11px 16px',
          borderBottom: '1px solid #2a2d3a',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: '#e5e7eb', fontWeight: 800, fontSize: 15 }}>{nome}</span>
            <span style={{
              color: '#9ca3af', fontSize: 10, background: '#1e2230',
              border: '1px solid #374151', borderRadius: 3, padding: '1px 7px',
            }}>
              {CAT_LABELS[categoria] || categoria}
            </span>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: '#6b7280',
            cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '0 4px',
          }}>×</button>
        </div>

        {/* ── Body ── */}
        <div style={{ overflow: 'auto', flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Terminals + Connections */}
          <section>
            <div style={{ color: '#6b7280', fontSize: 10, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Terminais e Conexões
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {allTerminals.map(term => {
                const conns = termConns[term] || [];
                return (
                  <div key={term} style={{
                    background: '#12141a', borderRadius: 5, padding: '6px 10px',
                    border: '1px solid #1e2230',
                    display: 'flex', alignItems: 'flex-start', gap: 8,
                  }}>
                    <span style={{
                      color: '#93c5fd', fontSize: 10, fontWeight: 800,
                      minWidth: 26, background: '#1e3354',
                      border: '1px solid #2563eb44',
                      borderRadius: 3, padding: '2px 5px', textAlign: 'center',
                    }}>{term}</span>
                    <div style={{ flex: 1 }}>
                      {conns.length === 0
                        ? <span style={{ color: '#374151', fontSize: 11 }}>— sem conexão</span>
                        : conns.map((c, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, lineHeight: 1.7 }}>
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.cor, flexShrink: 0 }} />
                            <span style={{ color: '#fbbf24', fontSize: 11, fontWeight: 600 }}>{c.comp}</span>
                            <span style={{ color: '#6b7280', fontSize: 11 }}>terminal</span>
                            <span style={{ color: '#93c5fd', fontSize: 11, fontWeight: 600 }}>{c.term}</span>
                            <span style={{ color: '#374151', fontSize: 10 }}>via {c.net}</span>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Properties */}
          <section>
            <div style={{ color: '#6b7280', fontSize: 10, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Propriedades do Componente
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px' }}>
              {PROP_FIELDS.map(({ key, label, placeholder }) => (
                <label key={key} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span style={{ color: '#6b7280', fontSize: 10 }}>{label}</span>
                  <input
                    type="text"
                    value={props[key] || ''}
                    onChange={e => setProps(p => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder}
                    style={{
                      background: '#0d0f14', border: '1px solid #2a2d3a',
                      color: '#e5e7eb', fontSize: 12, borderRadius: 4, padding: '5px 8px',
                      outline: 'none',
                    }}
                  />
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* ── Footer ── */}
        <div style={{
          borderTop: '1px solid #2a2d3a', padding: '10px 16px',
          display: 'flex', justifyContent: 'flex-end', gap: 8,
          background: '#0d0f14',
        }}>
          <button onClick={onClose} style={{
            background: '#1e2230', border: '1px solid #374151',
            color: '#9ca3af', borderRadius: 4, padding: '5px 14px',
            fontSize: 12, cursor: 'pointer',
          }}>Fechar</button>
          <button onClick={handleSave} style={{
            background: '#1e3a5f', border: '1px solid #3b82f6',
            color: '#e5e7eb', borderRadius: 4, padding: '5px 14px',
            fontSize: 12, cursor: 'pointer', fontWeight: 600,
          }}>Salvar</button>
        </div>
      </div>
    </div>
  );
}
