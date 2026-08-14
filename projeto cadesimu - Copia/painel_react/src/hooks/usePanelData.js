import { useState, useCallback, useRef } from 'react';
import { MOCK_DATA } from '../utils/mockData';

const isPywebview = () => typeof window !== 'undefined' && window.pywebview?.api;

async function callApi(method, ...args) {
  if (isPywebview()) {
    try {
      const result = await window.pywebview.api[method](...args);
      if (result === null || result === undefined) return { ...MOCK_DATA, log: [] };
      return typeof result === 'string' ? JSON.parse(result) : result;
    } catch (e) {
      console.warn(`[PanelApi] ${method} error:`, e);
      // Return current mock shape with error in log
      return { ...MOCK_DATA, log: [`✗ Erro na API: ${e}`] };
    }
  }
  // Dev fallback
  if (method === 'get_log') return [];
  return { ...MOCK_DATA, log: [] };
}

export function usePanelData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const logBuffer = useRef([]);

  const _merge = useCallback((panelData, extraLog = []) => {
    const combined = [...(panelData?.log ?? []), ...extraLog];
    logBuffer.current = combined.length ? combined : logBuffer.current;
    setData({ ...panelData, log: logBuffer.current });
  }, []);

  const _withLog = useCallback(async (method, ...args) => {
    setLoading(true);
    try {
      const d = await callApi(method, ...args);
      // Fetch fresh log after the operation
      let log = logBuffer.current;
      if (isPywebview()) {
        try {
          log = await window.pywebview.api.get_log();
          if (typeof log === 'string') log = JSON.parse(log);
          logBuffer.current = log;
        } catch { /* keep old log */ }
      }
      setData({ ...d, log });
    } catch (e) {
      console.error(`[PanelApi] ${method} failed:`, e);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => _withLog('get_panel_data'), [_withLog]);

  // Silent position update on drag — does NOT update React state (avoids re-render)
  const moveComponentSilent = useCallback((nome, cx, cy) => {
    if (isPywebview()) {
      window.pywebview.api.move_component_xy(nome, cx, cy).catch(() => {});
    }
  }, []);

  return {
    data,
    loading,
    refresh,
    moveComponentSilent,
    gerarRotas:          () => _withLog('gerar_rotas'),
    autoPositionar:      () => _withLog('auto_posicionar'),
    gerarSaidas:         () => _withLog('gerar_saidas_oficiais'),
    browseAndLoadCad:    () => _withLog('browse_and_load_cad'),
    moveComponent:       (nome, zona, linha, coluna) => _withLog('move_component', nome, zona, linha, coluna),
    selectNet:           (idx) => _withLog('set_net_selecionada', idx),
    novaNet:             () => _withLog('nova_net'),
    excluirNet:          (idx) => _withLog('excluir_net', idx),
    addTerminal:         (netIdx, terminal) => _withLog('add_terminal_na_net', netIdx, terminal),
    removerTerminal:     (netIdx, terminal) => _withLog('remover_terminal_da_net', netIdx, terminal),
    salvar:              () => _withLog('salvar_projeto'),
    setComponentProperties: (nome, props) => _withLog('set_component_properties', nome, props),
    clearLog:            async () => {
      if (isPywebview()) {
        try { await window.pywebview.api.clear_log(); } catch { /* */ }
      }
      logBuffer.current = [];
      setData(prev => prev ? { ...prev, log: [] } : prev);
    },
  };
}
