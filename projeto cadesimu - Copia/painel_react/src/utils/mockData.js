/** Mock panel data for development (when pywebview is not available). */

const gc = { interno: { linhas: 4, colunas: 6 }, tampa: { linhas: 4, colunas: 4 }, externo: { linhas: 1, colunas: 3 } };
const W_INT = 60 + gc.interno.colunas * 100;  // 660
const H_INT = 30 * (gc.interno.linhas + 1) + gc.interno.linhas * 100;  // 550
const W_TMP = 30 + gc.tampa.colunas * 100;    // 430
const H_TMP = 30 * (gc.tampa.linhas + 1) + gc.tampa.linhas * 100;  // 550
const O_TMP_X = 50 + W_INT + 80;   // 790
const Y_EXT = 80 + H_INT + 60;     // 690

function gc_coords(zona, linha, coluna) {
  if (zona === 'externo') return [50 + 30 + coluna * 100 + 50, Y_EXT + 30 + linha * 130 + 50];
  const cx_base = zona === 'interno' ? 50 : 50 + W_INT + 80;
  return [cx_base + 30 + coluna * 100 + 50, 80 + 30 + linha * 130 + 50];
}

function makeNode(id, zona, linha, coluna, terminais, categoria) {
  const [cx, cy] = gc_coords(zona, linha, coluna);
  const nTerms = Object.keys(terminais).length;
  const nCol = Math.max(1, Math.ceil(nTerms / 2));
  const w = Math.max(60, nCol * 20 + 10);
  return {
    id,
    type: 'component',
    position: { x: cx - w / 2, y: cy - 30 },
    data: {
      nome: id,
      terminais,
      colunas: Object.keys(terminais).reduce((acc, t, i) => {
        if (i % 2 === 0) acc.push([t, Object.keys(terminais)[i + 1] || null]);
        return acc;
      }, []),
      categoria,
      zona, linha, coluna, w, cx, cy,
    },
    dragHandle: '.node-drag-handle',
  };
}

export const MOCK_DATA = {
  grid_config: gc,
  dims: { W_INT, H_INT, W_TMP, H_TMP, O_TMP_X, Y_EXT },
  net_selecionada_idx: -1,
  nets: [
    { nome: 'L1', terminais: ['QM1:1', 'KM1:1'] },
    { nome: 'L2', terminais: ['QM1:3', 'KM1:3'] },
    { nome: 'L3', terminais: ['QM1:5', 'KM1:5'] },
    { nome: 'U',  terminais: ['KM1:2', 'M1:U'] },
    { nome: 'A1-coil', terminais: ['KM1:A1', 'S1:3'] },
  ],
  nodes: [
    makeNode('QM1', 'interno', 0, 0, { '1':1,'2':1,'3':1,'4':1,'5':1,'6':1 }, 'disjuntor'),
    makeNode('KM1', 'interno', 1, 0, { '1':1,'2':1,'3':1,'4':1,'5':1,'6':1,'A1':1,'A2':1,'13':1,'14':1 }, 'contator_pot'),
    makeNode('S1',  'tampa',   0, 0, { '1':1,'2':1,'3':1,'4':1 }, 'botao'),
    makeNode('H1',  'tampa',   1, 0, { '1':1,'2':1 }, 'sinaleiro'),
    makeNode('M1',  'externo', 0, 0, { 'U':1,'V':1,'W':1,'PE':1 }, 'motor'),
  ],
  edges: [
    {
      id: 'e0', source: 'QM1', target: 'KM1', type: 'wire',
      data: {
        path: (() => { const [ux,uy]=gc_coords('interno',0,0); const [vx,vy]=gc_coords('interno',1,0); return [[ux-15,uy-30],[ux-15,80+30+15],[vx-15,80+30+15],[vx-15,vy-30]]; })(),
        cor: '#00e6b8', netIdx: 0, netNome: 'L1', segIdx: 0, u: 'QM1:1', v: 'KM1:1',
      },
    },
    {
      id: 'e1', source: 'KM1', target: 'M1', type: 'wire',
      data: {
        path: (() => { const [ux,uy]=gc_coords('interno',1,0); const [vx,vy]=gc_coords('externo',0,0); return [[ux-10,uy+30],[ux-10,80+H_INT+25],[65,80+H_INT+25],[65,Y_EXT-5],[vx,Y_EXT+25]]; })(),
        cor: '#e63366', netIdx: 3, netNome: 'U', segIdx: 1, u: 'KM1:2', v: 'M1:U',
      },
    },
  ],
};
