import { useMemo, useState, useCallback } from 'react';
import {
  ReactFlow, Background, Controls, MiniMap, Handle, Position, useReactFlow, ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { COMPONENTES, CABOS, TENSOES, PI1_INTERNO, paraOndeVai } from './data/painel';
import ZoomComponente from './components/ZoomComponente';
import VistaTrilho1 from './components/VistaTrilho1';

/* ── posição de cada trilho na tela ───────────────────────────────── */
const LINHA_Y = { 1: 60, 2: 300, 3: 540, porta: 800 };
const TITULO_TRILHO = {
  1: 'TRILHO 1 — Distribuição',
  2: 'TRILHO 2 — Potência',
  3: 'TRILHO 3 — Controle',
  porta: 'PORTA DO PAINEL',
};
const ESCALA_X = 2.6;

/* ── nó de componente ─────────────────────────────────────────────── */
function NoComponente({ data, selected }) {
  const t = TENSOES[data.tensao] ?? TENSOES.SINAL;
  const nTerm = Object.keys(data.terminais).length;
  return (
    <div
      style={{
        minWidth: Math.max(120, data.largura * ESCALA_X),
        border: `3px solid ${t.cor}`,
        borderRadius: 8,
        background: selected ? '#fff8e1' : '#ffffff',
        boxShadow: selected ? `0 0 0 4px ${t.cor}44` : '0 1px 4px #0002',
        overflow: 'hidden',
        cursor: 'pointer',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <div style={{ background: t.cor, color: '#fff', padding: '5px 9px', fontSize: 13, fontWeight: 700 }}>
        {data.nome}
      </div>
      <div style={{ padding: '7px 9px', fontSize: 11, color: '#444', lineHeight: 1.35 }}>
        {data.descricao}
        <div style={{ marginTop: 5, color: '#888', fontSize: 10 }}>
          {nTerm} terminais · clique para ver
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
}
const nodeTypes = { comp: NoComponente };

/* ── painel lateral de detalhe ────────────────────────────────────── */
function Detalhe({ comp, onIrPara, onFechar, onAbrirZoom }) {
  if (!comp) return null;
  const t = TENSOES[comp.tensao] ?? TENSOES.SINAL;
  return (
    <aside style={{
      position: 'absolute', right: 0, top: 0, bottom: 0, width: 420, zIndex: 10,
      background: '#fff', borderLeft: `5px solid ${t.cor}`, overflowY: 'auto',
      boxShadow: '-4px 0 16px #0002',
    }}>
      <div style={{ background: t.cor, color: '#fff', padding: '14px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <div>
            <div style={{ fontSize: 19, fontWeight: 700 }}>{comp.nome}</div>
            <div style={{ fontSize: 12, opacity: 0.9, marginTop: 3 }}>{comp.descricao}</div>
          </div>
          <button onClick={onFechar} style={{
            background: '#ffffff33', color: '#fff', border: 'none', borderRadius: 6,
            width: 28, height: 28, cursor: 'pointer', fontSize: 16, flexShrink: 0,
          }}>×</button>
        </div>
      </div>

      <button onClick={() => onAbrirZoom(comp)} style={{
        display: 'block', width: 'calc(100% - 32px)', margin: '12px 16px 0',
        background: '#f08c00', color: '#fff', border: 'none', borderRadius: 6,
        padding: '9px 12px', cursor: 'pointer', fontSize: 12.5, fontWeight: 700,
      }}>
        🔍 {comp.ehPlaca ? 'Abrir a placa furo por furo' : 'Ver a pinagem em detalhe'}
      </button>

      {comp.detalhe && (
        <div style={{ padding: '12px 16px', background: '#f8f9fa', fontSize: 12.5,
                      color: '#333', lineHeight: 1.5, borderBottom: '1px solid #eee' }}>
          {comp.detalhe}
        </div>
      )}

      <div style={{ padding: '14px 16px' }}>
        <h3 style={{ fontSize: 13, margin: '0 0 10px', color: '#666', letterSpacing: 0.4 }}>
          TERMINAIS — clique num fio para segui-lo
        </h3>
        {Object.entries(comp.terminais).map(([term, desc]) => {
          const ligacoes = paraOndeVai(`${comp.id}:${term}`);
          return (
            <div key={term} style={{ marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                <code style={{ background: '#eef2f7', padding: '2px 7px', borderRadius: 4,
                               fontWeight: 700, fontSize: 12.5, color: '#0b4a86' }}>{term}</code>
                <span style={{ fontSize: 11.5, color: '#777' }}>{desc}</span>
              </div>
              {ligacoes.length === 0 && (
                <div style={{ fontSize: 11, color: '#bbb', marginTop: 4, marginLeft: 4 }}>
                  sem cabo mapeado
                </div>
              )}
              {ligacoes.map(({ cabo, destino }) => {
                const ct = TENSOES[cabo.tensao] ?? TENSOES.SINAL;
                const [compDest] = destino.split(':');
                return (
                  <button key={cabo.n + destino} onClick={() => onIrPara(compDest)}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left', marginTop: 5,
                      background: '#fafbfc', border: `1px solid ${ct.cor}55`,
                      borderLeft: `4px solid ${ct.cor}`, borderRadius: 5,
                      padding: '6px 9px', cursor: 'pointer', fontSize: 11.5,
                    }}>
                    <span style={{ color: ct.cor, fontWeight: 700 }}>→ {destino}</span>
                    <span style={{ color: '#999', marginLeft: 6 }}>
                      cabo {cabo.n} · {cabo.bitola} · {cabo.cor}
                    </span>
                    {cabo.nota && (
                      <div style={{ color: '#a06000', marginTop: 3, fontSize: 11 }}>{cabo.nota}</div>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}

        {comp.ehPlaca && (
          <div style={{ marginTop: 6, padding: 12, background: '#fffbe6',
                        border: '2px solid #f5a524', borderRadius: 8 }}>
            <h3 style={{ fontSize: 13, margin: '0 0 8px', color: '#8a5a00' }}>
              O QUE HÁ SOLDADO DENTRO DA PLACA
            </h3>
            {PI1_INTERNO.componentes.map(c => (
              <div key={c.ref} style={{ marginBottom: 9, fontSize: 11.5, lineHeight: 1.45 }}>
                <b style={{ color: '#8a5a00' }}>{c.ref}</b>
                <span style={{ color: '#666' }}> · {c.valor}</span>
                <div style={{ color: '#555' }}>entre <code>{c.entre[0]}</code> e <code>{c.entre[1]}</code></div>
                <div style={{ color: '#777', fontStyle: 'italic' }}>{c.papel}</div>
              </div>
            ))}
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #f5a52455',
                          fontSize: 11, color: '#8a5a00' }}>
              ⚠️ {PI1_INTERNO.nota}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

/* ── app ──────────────────────────────────────────────────────────── */
function Painel() {
  const [selId, setSelId] = useState(null);
  const [filtro, setFiltro] = useState(null);
  const [zoom, setZoom] = useState(null);
  const [vista, setVista] = useState('mapa');
  const { setCenter } = useReactFlow();

  const nodes = useMemo(() => {
    const grupos = COMPONENTES.map(c => ({
      id: c.id,
      type: 'comp',
      position: { x: c.x * ESCALA_X, y: LINHA_Y[c.trilho] },
      data: c,
      selected: c.id === selId,
    }));
    const titulos = Object.entries(LINHA_Y).map(([k, y]) => ({
      id: `t-${k}`, type: 'default', draggable: false, selectable: false,
      position: { x: 0, y: y - 42 },
      data: { label: TITULO_TRILHO[k] },
      style: {
        background: 'transparent', border: 'none', fontSize: 15, fontWeight: 700,
        color: '#8895a6', width: 320, textAlign: 'left',
      },
    }));
    return [...titulos, ...grupos];
  }, [selId]);

  const edges = useMemo(() => CABOS
    .filter(c => {
      const [a] = c.de.split(':'), [b] = c.para.split(':');
      return COMPONENTES.some(x => x.id === a) && COMPONENTES.some(x => x.id === b);
    })
    .filter(c => !filtro || c.tensao === filtro)
    .map(c => {
      const [a, ta] = c.de.split(':'), [b, tb] = c.para.split(':');
      const t = TENSOES[c.tensao] ?? TENSOES.SINAL;
      const aceso = selId && (a === selId || b === selId);
      return {
        id: `c${c.n}-${ta}-${tb}`, source: a, target: b, type: 'smoothstep',
        label: aceso ? `${ta} → ${tb}` : undefined,
        labelStyle: { fontSize: 10, fill: t.cor, fontWeight: 700 },
        labelBgStyle: { fill: '#fff', fillOpacity: 0.9 },
        style: {
          stroke: t.cor,
          strokeWidth: aceso ? 3.5 : 1.6,
          opacity: selId ? (aceso ? 1 : 0.13) : 0.75,
        },
      };
    }), [selId, filtro]);

  const irPara = useCallback((id) => {
    const c = COMPONENTES.find(x => x.id === id);
    if (!c) return;
    setSelId(id);
    setCenter(c.x * ESCALA_X + 100, LINHA_Y[c.trilho] + 50, { zoom: 1.1, duration: 600 });
  }, [setCenter]);

  const sel = COMPONENTES.find(c => c.id === selId);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#eef1f5' }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 5, padding: '10px 16px',
        background: '#1d3557', color: '#fff', display: 'flex', gap: 14, alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        <b style={{ fontSize: 15 }}>PAINEL DE COMANDO — Projeto Integrador CF-01</b>
        <span style={{ fontSize: 11.5, opacity: 0.75 }}>
          clique para ver os terminais · duplo clique abre o componente em detalhe
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {Object.entries(TENSOES).map(([k, t]) => (
            <button key={k} onClick={() => setFiltro(filtro === k ? null : k)}
              title={t.nota ?? ''}
              style={{
                background: filtro === k ? t.cor : '#ffffff1f',
                color: '#fff', border: `1.5px solid ${t.cor}`, borderRadius: 5,
                padding: '3px 9px', fontSize: 11, cursor: 'pointer', fontWeight: 600,
              }}>{t.label}</button>
          ))}
          <button onClick={() => setVista(vista === 'trilho1' ? 'mapa' : 'trilho1')}
            style={{
              background: vista === 'trilho1' ? '#ffd43b' : '#ffffff1f',
              color: vista === 'trilho1' ? '#212529' : '#fff',
              border: '1.5px solid #ffd43b', borderRadius: 5,
              padding: '3px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 700,
            }}>🔧 Painel real — Trilho 1</button>
          <span style={{ width: 1, height: 20, background: '#ffffff33', margin: '0 2px' }} />
          {[['LM2596', 'LM2596'], ['PELTIER', 'Kit Peltier']].map(([k, txt]) => (
            <button key={k} title="Peça fora do painel — abre o desenho da peça real"
              onClick={() => setZoom({
                id: k, pinagem: k, nome: txt, terminais: {},
                descricao: 'peça fora do painel',
              })}
              style={{
                background: '#ffffff1f', color: '#fff', border: '1.5px solid #adb5bd',
                borderRadius: 5, padding: '3px 9px', fontSize: 11, cursor: 'pointer',
              }}>📷 {txt}</button>
          ))}
          {(filtro || selId) && (
            <button onClick={() => { setFiltro(null); setSelId(null); }}
              style={{ background: '#ffffff2f', color: '#fff', border: '1.5px solid #fff6',
                       borderRadius: 5, padding: '3px 9px', fontSize: 11, cursor: 'pointer' }}>
              limpar
            </button>
          )}
        </div>
      </div>

      {vista === 'trilho1' ? (
        <div style={{ position: 'absolute', top: 46, left: 0, right: 0, bottom: 0 }}>
          <VistaTrilho1 />
        </div>
      ) : (
      <ReactFlow
        nodes={nodes} edges={edges} nodeTypes={nodeTypes}
        onNodeClick={(_, n) => !n.id.startsWith('t-') && setSelId(n.id)}
        onNodeDoubleClick={(_, n) => {
          const c = COMPONENTES.find(x => x.id === n.id);
          if (c) setZoom(c);
        }}
        onPaneClick={() => setSelId(null)}
        fitView fitViewOptions={{ padding: 0.12 }}
        minZoom={0.2} maxZoom={2.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={26} color="#d6dce4" />
        <Controls />
        <MiniMap pannable zoomable nodeColor={n => (TENSOES[n.data?.tensao]?.cor ?? '#ccc')} />
      </ReactFlow>
      )}

      <Detalhe comp={sel} onIrPara={irPara} onFechar={() => setSelId(null)}
               onAbrirZoom={setZoom} />
      <ZoomComponente comp={zoom} onFechar={() => setZoom(null)} />
    </div>
  );
}

export default function App() {
  return <ReactFlowProvider><Painel /></ReactFlowProvider>;
}
