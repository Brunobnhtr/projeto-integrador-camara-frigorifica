import { useEffect, useState, useCallback, useRef } from 'react';
import {
  ReactFlow, Background, Controls, MiniMap,
  useNodesState, useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import ComponentNode from './components/ComponentNode';
import WireEdge from './components/WireEdge';
import ZoneNode from './components/ZoneNode';
import Sidebar from './components/Sidebar';
import ComponentInfoModal from './components/ComponentInfoModal';
import { usePanelData } from './hooks/usePanelData';
import { PanelContext } from './context/PanelContext';

const nodeTypes = {
  component: ComponentNode,
  zone: ({ data }) => <ZoneNode data={data} />,
};
const edgeTypes = { wire: WireEdge };

export default function App() {
  const {
    data, loading, refresh,
    gerarRotas, autoPositionar, gerarSaidas,
    browseAndLoadCad,
    selectNet, novaNet, excluirNet,
    addTerminal, removerTerminal,
    salvar, clearLog,
    moveComponentSilent,
    setComponentProperties,
  } = usePanelData();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [playing, setPlaying] = useState(false);
  const [playPhase, setPlayPhase] = useState('idle'); // 'idle' | 'montagem' | 'energia'
  const [selectedNet, setSelectedNet] = useState(-1);
  // totalSeconds: total time for the full reveal sequence (user-configurable)
  const [totalSeconds, setTotalSeconds] = useState(5);
  const [infoComp, setInfoComp] = useState(null); // node being inspected (double-click)
  const [isolatedNetIdx, setIsolatedNetIdx] = useState(-1); // -1 = show all
  const [editMode, setEditMode] = useState(false);
  const playTimers = useRef([]);
  // Ref to always call the latest handlePlay (avoids stale closures in setTimeout)
  const handlePlayRef = useRef(null);

  // Load on mount and on pywebview ready
  useEffect(() => {
    const load = () => refresh().catch(console.error);
    if (window.pywebview?.api) {
      load();
    } else {
      if (!window.pywebview) load();
      window.addEventListener('pywebviewready', () => { setTimeout(load, 100); }, { once: true });
    }
  }, [refresh]);

  // Sync ReactFlow state when Python data changes
  useEffect(() => {
    if (!data) return;

    const zoneNode = {
      id: '__zone__',
      type: 'zone',
      position: { x: 0, y: 0 },
      data: { dims: data.dims, grid_config: data.grid_config },
      selectable: false,
      draggable: false,
      focusable: false,
      zIndex: -1,
    };

    setNodes([zoneNode, ...(data.nodes || []).map(n => ({ ...n, selected: false, data: { ...n.data, flowing: false } }))]);

    const netIdx = data.net_selecionada_idx ?? selectedNet;
    setEdges((data.edges || []).map(e => ({
      ...e,
      data: {
        ...e.data,
        highlighted: netIdx >= 0 && e.data.netIdx === netIdx,
        hidden: false,
        flowing: false,
        revealing: false,
      },
    })));
    // Reset isolation whenever new data loads
    setIsolatedNetIdx(-1);
  }, [data]);

  // ── Node drag → update Python backend silently (no re-render) ──────────────
  const handleNodeDragStop = useCallback((_evt, node) => {
    if (node.type !== 'component') return;
    const w = node.data?.w ?? 70;
    const cx = node.position.x + w / 2;
    const cy = node.position.y + 40; // node height=80, center at +40
    moveComponentSilent(node.data.nome, cx, cy);
  }, [moveComponentSilent]);

  // ── Double-click → open component info modal ────────────────────────────────
  const handleNodeDoubleClick = useCallback((_evt, node) => {
    if (node.type !== 'component') return;
    setInfoComp(node);
  }, []);

  const handleSaveCompProps = useCallback(async (nome, props) => {
    await setComponentProperties(nome, props);
    // Refresh the infoComp with updated data from nodes state
    setInfoComp(prev => prev && prev.data.nome === nome
      ? { ...prev, data: { ...prev.data, propriedades: props } }
      : prev);
  }, [setComponentProperties]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const stopAllTimers = useCallback(() => {
    playTimers.current.forEach(clearTimeout);
    playTimers.current = [];
  }, []);

  const showAllWires = useCallback(() => {
    setIsolatedNetIdx(-1);
    setEdges(prev => prev.map(e =>
      e.type === 'wire'
        ? { ...e, data: { ...e.data, hidden: false, revealing: false, flowing: false } }
        : e
    ));
    setNodes(prev => prev.map(n =>
      n.type === 'component'
        ? { ...n, data: { ...n.data, flowing: false } }
        : n
    ));
  }, []);

  // ── Isolate a net: hide all wires except those of netIdx ───────────────────
  const isolateNet = useCallback((netIdx) => {
    if (netIdx < 0) {
      setIsolatedNetIdx(-1);
      setEdges(prev => prev.map(e =>
        e.type === 'wire' ? { ...e, data: { ...e.data, hidden: false } } : e
      ));
      return;
    }
    setIsolatedNetIdx(netIdx);
    setEdges(prev => prev.map(e =>
      e.type === 'wire'
        ? { ...e, data: { ...e.data, hidden: e.data?.netIdx !== netIdx, revealing: false, flowing: false } }
        : e
    ));
    setNodes(prev => prev.map(n =>
      n.type === 'component' ? { ...n, data: { ...n.data, flowing: false } } : n
    ));
  }, []);

  // ── Click on wire edge → isolate that net (click again or on background to undo)
  const handleEdgeClick = useCallback((_evt, edge) => {
    if (edge.type !== 'wire') return;
    const netIdx = edge.data?.netIdx ?? -1;
    // Second click on same isolated net → restore all
    if (isolatedNetIdx === netIdx) {
      isolateNet(-1);
    } else {
      isolateNet(netIdx);
    }
  }, [isolatedNetIdx, isolateNet]);

  // ── Click on node → isolate all wires of that component (toggle on/off) ───
  const handleNodeClick = useCallback((_evt, node) => {
    if (node.type !== 'component') return;
    // Toggle off if already isolated (net isolation ≥0, component isolation = -2)
    if (isolatedNetIdx !== -1) {
      isolateNet(-1);
      return;
    }
    // Show only wires connected to this component; use sentinel -2 to distinguish from net isolation
    setIsolatedNetIdx(-2);
    setEdges(prev => prev.map(e => {
      if (e.type !== 'wire') return e;
      const visible = e.source === node.id || e.target === node.id;
      return { ...e, data: { ...e.data, hidden: !visible, revealing: false, flowing: false } };
    }));
    setNodes(prev => prev.map(n =>
      n.type === 'component' ? { ...n, data: { ...n.data, flowing: false } } : n
    ));
  }, [isolatedNetIdx, isolateNet]);

  // ── Click on terminal square (read mode) → isolate that terminal's net ──────
  const handleTerminalClick = useCallback((compNome, termNome) => {
    if (playing) return;
    const fullTerm = `${compNome}:${termNome}`;
    // 1) Try to find net from data.nets (fastest path)
    const netIdx = data?.nets?.findIndex(net =>
      net.terminais?.some(t => t === fullTerm)
    ) ?? -1;
    if (netIdx >= 0) {
      if (isolatedNetIdx === netIdx) {
        isolateNet(-1); // second click on same net → restore all
      } else {
        isolateNet(netIdx);
      }
      return;
    }
    // 2) Fallback: match via edge u/v fields
    setEdges(prev => {
      const match = prev.find(e => e.type === 'wire' &&
        (e.data?.u === fullTerm || e.data?.v === fullTerm));
      if (!match) return prev;
      const ni = match.data?.netIdx ?? -1;
      if (ni < 0) return prev;
      if (isolatedNetIdx === ni) { isolateNet(-1); return prev; }
      isolateNet(ni);
      return prev;
    });
  }, [data, playing, isolatedNetIdx, isolateNet]);

  // ── Play animation ──────────────────────────────────────────────────────────
  const handlePlay = useCallback(() => {
    stopAllTimers();
    setIsolatedNetIdx(-1); // clear any isolation before playing

    // Snapshot current edges via a ref-like approach: use a one-shot
    // functional updater that reads state, then schedules all timers.
    // We collect the wireEdges and start timers synchronously here.
    // NOTE: setEdges functional updater must stay pure (no side effects),
    // so we do a two-pass: first snapshot, then set.
    let wireEdgesSnapshot = [];
    setEdges(prev => {
      wireEdgesSnapshot = prev.filter(e =>
        e.type === 'wire' && (selectedNet < 0 || e.data?.netIdx === selectedNet)
      );
      // Hide all wires (pure computation — no side effects)
      return prev.map(e => ({
        ...e,
        data: { ...e.data, hidden: true, revealing: false, flowing: false },
      }));
    });

    // After the updater runs synchronously, wireEdgesSnapshot is populated
    // (setEdges updater is called synchronously during the same event handler)
    if (wireEdgesSnapshot.length === 0) {
      setPlaying(false);
      setPlayPhase('idle');
      return;
    }

    setPlaying(true);
    setPlayPhase('montagem');
    setNodes(prev => prev.map(n =>
      n.type === 'component' ? { ...n, data: { ...n.data, flowing: false } } : n
    ));

    const perDelay = Math.max(100, (totalSeconds * 1000) / wireEdgesSnapshot.length);
    const revealDur = Math.min(1.5, Math.max(0.15, (perDelay * 0.9) / 1000));

    // Phase 1 — Montagem: reveal wires one by one
    wireEdgesSnapshot.forEach((edge, i) => {
      const t = setTimeout(() => {
        setEdges(cur => cur.map(e =>
          e.id === edge.id
            ? { ...e, data: { ...e.data, hidden: false, revealing: true, revealDur } }
            : e
        ));
      }, (i + 1) * perDelay); // +1 so first reveal is AFTER the "hide all" frame
      playTimers.current.push(t);
    });

    // Phase 2 — Energia: after all revealed, switch to flowing
    const energiaAt = (wireEdgesSnapshot.length + 1) * perDelay + 400;
    const wireIds = new Set(wireEdgesSnapshot.map(e => e.id));
    const flowingNodeIds = new Set(wireEdgesSnapshot.flatMap(e => [e.source, e.target]));
    const tEnergy = setTimeout(() => {
      setPlayPhase('energia');
      setEdges(cur => cur.map(e =>
        wireIds.has(e.id)
          ? { ...e, data: { ...e.data, hidden: false, revealing: false, flowing: true } }
          : e
      ));
      setNodes(cur => cur.map(n =>
        flowingNodeIds.has(n.id)
          ? { ...n, data: { ...n.data, flowing: true } }
          : n
      ));
    }, energiaAt);
    playTimers.current.push(tEnergy);
  }, [selectedNet, totalSeconds, stopAllTimers]);

  // Keep ref always pointing to latest handlePlay (used by play_net setTimeout)
  useEffect(() => { handlePlayRef.current = handlePlay; }, [handlePlay]);

  const handleStop = useCallback(() => {
    stopAllTimers();
    setPlaying(false);
    setPlayPhase('idle');
    showAllWires();
  }, [stopAllTimers, showAllWires]);

  // ── Sidebar action dispatcher ───────────────────────────────────────────────
  const handleSidebarAction = useCallback(async (action, ...args) => {
    switch (action) {
      case 'browse_cad':      await browseAndLoadCad(); break;
      case 'salvar':          await salvar(); break;
      case 'auto_posicionar': await autoPositionar(); break;
      case 'rotear':          await gerarRotas(); break;
      case 'gerar_saidas':    await gerarSaidas(); break;
      case 'nova_net':        await novaNet(); break;
      case 'excluir_net':     await excluirNet(args[0]); break;
      case 'select_net':      setSelectedNet(args[0]); await selectNet(args[0]); break;
      case 'isolate_net':    isolateNet(args[0]); break;
      case 'add_terminal':    await addTerminal(args[0], args[1]); break;
      case 'remover_terminal':await removerTerminal(args[0], args[1]); break;
      case 'clear_log':       await clearLog(); break;
      case 'play':            handlePlay(); break;
      case 'stop':            handleStop(); break;
      case 'play_net':
        setSelectedNet(args[0]);
        await selectNet(args[0]);
        // Use ref so we always call the latest handlePlay with fresh edges/selectedNet
        setTimeout(() => handlePlayRef.current?.(), 80);
        break;
    }
  }, [browseAndLoadCad, salvar, autoPositionar, gerarRotas, gerarSaidas,
      novaNet, excluirNet, selectNet, addTerminal, removerTerminal, clearLog,
      handlePlay, handleStop, isolateNet]);

  const netLabel = selectedNet >= 0 && data?.nets?.[selectedNet]
    ? (data.nets[selectedNet].nome || `Rede ${selectedNet + 1}`)
    : null;

  const wireCount = selectedNet >= 0
    ? (data?.edges?.filter(e => e.data?.netIdx === selectedNet).length ?? 0)
    : (data?.edges?.length ?? 0);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#181a20' }}>
      {/* Top bar */}
      <div style={{
        background: '#0d0f14', borderBottom: '1px solid #1e2230',
        display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px',
        boxShadow: '0 2px 8px #00000066', flexShrink: 0,
      }}>
        <span style={{ color: '#60a5fa', fontWeight: 700, fontSize: 14, marginRight: 4 }}>CadeSIMU</span>
        <div style={{ width: 1, height: 18, background: '#2a2d3a' }} />

        {/* Network indicator */}
        {netLabel && (
          <>
            <span style={{
              fontSize: 11, color: '#60a5fa',
              background: '#1e3a5f', border: '1px solid #3b82f655',
              borderRadius: 3, padding: '2px 7px',
            }}>◉ {netLabel}</span>
            <button onClick={() => { setSelectedNet(-1); selectNet(-1); }}
              style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 11, padding: '0 2px' }}>
              ×
            </button>
            <div style={{ width: 1, height: 18, background: '#2a2d3a' }} />
          </>
        )}

        {/* Play / Stop */}
        {!playing ? (
          <BtnTop
            onClick={handlePlay}
            disabled={loading || !wireCount}
            color="#22c55e"
          >
            ▶ {netLabel ? `Simular "${netLabel}"` : 'Simular Tudo'}
            {wireCount > 0 && <span style={{ opacity: 0.6, marginLeft: 4, fontSize: 10 }}>({wireCount} fios)</span>}
          </BtnTop>
        ) : (
          <>
            <span style={{
              fontSize: 11,
              color: playPhase === 'energia' ? '#22c55e' : '#fbbf24',
              background: (playPhase === 'energia' ? '#22c55e' : '#fbbf24') + '11',
              border: `1px solid ${playPhase === 'energia' ? '#22c55e' : '#fbbf24'}44`,
              borderRadius: 3, padding: '2px 8px',
            }}>
              {playPhase === 'montagem' ? '🔌 Montagem…' : '⚡ Energia passando'}
            </span>
            <BtnTop onClick={handleStop} color="#ef4444">⏹ Parar</BtnTop>
          </>
        )}

        {/* Duration input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 4 }}>
          <span style={{ fontSize: 10, color: '#4b5563', whiteSpace: 'nowrap' }}>Duração total:</span>
          <input
            type="number"
            min={1} max={300} step={1}
            value={totalSeconds}
            onChange={e => setTotalSeconds(Math.max(1, Math.min(300, Number(e.target.value) || 1)))}
            disabled={playing}
            style={{
              width: 46, background: '#1e2230', border: '1px solid #374151',
              color: '#e5e7eb', fontSize: 11, borderRadius: 3, padding: '2px 4px',
              textAlign: 'center', opacity: playing ? 0.4 : 1,
            }}
          />
          <span style={{ fontSize: 10, color: '#4b5563' }}>s</span>
        </div>

        {/* Isolation indicator */}
        {isolatedNetIdx !== -1 && !playing && (
          <>
            <div style={{ width: 1, height: 18, background: '#2a2d3a' }} />
            <span style={{
              fontSize: 11, color: '#fbbf24',
              background: '#fbbf2411', border: '1px solid #fbbf2444',
              borderRadius: 3, padding: '2px 7px',
            }}>
              ⬡ {isolatedNetIdx >= 0
                ? (data?.nets?.[isolatedNetIdx]?.nome ?? `Rede ${isolatedNetIdx + 1}`)
                : 'Componente'}
            </span>
            <button onClick={() => isolateNet(-1)}
              style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 11, padding: '0 2px' }}>
              ×
            </button>
          </>
        )}

        <div style={{ width: 1, height: 18, background: '#2a2d3a', marginLeft: 2 }} />

        <span style={{ color: '#6b7280', fontSize: 11 }}>
          {(data?.edges?.length ?? 0)} fios · {(data?.nodes?.filter(n => n.type === 'component').length ?? 0)} comps
        </span>

        {/* Edit mode toggle — far right */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          {loading && <span style={{ color: '#fbbf24', fontSize: 11 }}>⟳ Carregando…</span>}
          <div style={{ width: 1, height: 18, background: '#2a2d3a' }} />
          <button
            onClick={() => setEditMode(m => !m)}
            disabled={playing}
            style={{
              background: editMode ? '#22c55e22' : '#1e2230',
              border: `1px solid ${editMode ? '#22c55e' : '#374151'}`,
              color: editMode ? '#4ade80' : '#6b7280',
              borderRadius: 4, padding: '3px 10px', fontSize: 11,
              cursor: playing ? 'not-allowed' : 'pointer',
              opacity: playing ? 0.4 : 1,
              display: 'flex', alignItems: 'center', gap: 4,
            }}
            title={editMode ? 'Sair do modo edição' : 'Entrar no modo edição para criar/mover fios'}
          >
            {editMode ? '✏️ Modo Edição' : '🔒 Modo Leitura'}
          </button>
        </div>
      </div>

      {/* Main layout: sidebar + canvas */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Sidebar
          data={data}
          loading={loading}
          selectedNet={selectedNet}
          playing={playing}
          onAction={handleSidebarAction}
        />

        <PanelContext.Provider value={{ onTerminalClick: handleTerminalClick, editMode }}>
        <div style={{ flex: 1, position: 'relative' }} className={editMode ? 'panel-edit' : 'panel-readonly'}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeDragStop={handleNodeDragStop}
            onNodeDoubleClick={handleNodeDoubleClick}
            onNodeClick={!playing ? handleNodeClick : undefined}
            onEdgeClick={!playing ? handleEdgeClick : undefined}
            onPaneClick={isolatedNetIdx !== -1 ? () => isolateNet(-1) : undefined}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            nodesConnectable={editMode}
            edgesReconnectable={editMode}
            fitView
            fitViewOptions={{ padding: 0.1 }}
            minZoom={0.15}
            maxZoom={3}
            deleteKeyCode={null}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#2a2d3a" gap={32} size={1} />
            <Controls style={{ background: '#1e2230', border: '1px solid #2a2d3a' }} />
            <MiniMap
              style={{ background: '#12141a', border: '1px solid #2a2d3a' }}
              nodeColor={n => n.type === 'component' ? '#3b82f6' : '#1e2230'}
            />
          </ReactFlow>
        </div>
        </PanelContext.Provider>
      </div>

      {/* Component info modal (double-click) */}
      {infoComp && (
        <ComponentInfoModal
          comp={infoComp}
          edges={edges}
          onClose={() => setInfoComp(null)}
          onSaveProps={handleSaveCompProps}
        />
      )}
    </div>
  );
}

function BtnTop({ children, onClick, disabled, color = '#4b5563' }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: color + '22', border: `1px solid ${color}`, color: '#e5e7eb',
      borderRadius: 4, padding: '3px 10px', fontSize: 12,
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
      display: 'flex', alignItems: 'center', gap: 2,
    }}>
      {children}
    </button>
  );
}
