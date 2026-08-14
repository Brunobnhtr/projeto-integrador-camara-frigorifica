/**
 * Non-interactive background node that renders a panel zone (interno/tampa/externo)
 * including ducts as SVG rectangles. Positioned at canvas coordinate (0,0) with
 * width/height matching the full panel layout.
 */
export default function ZoneNode({ data }) {
  const { dims, grid_config: gc } = data;
  if (!dims || !gc) return null;

  const { W_INT, H_INT, W_TMP, H_TMP, W_EXT, H_EXT, O_TMP_X, Y_EXT } = dims;
  const RS = dims.ROW_STEP ?? 160;  // row step (Python sends this now)
  const DH = dims.DUCT_H  ?? 30;   // duct height
  const { interno: int_cfg, tampa: tmp_cfg, externo: ext_cfg } = gc;
  const cor_canal = '#1e2a1e';
  const totalW = O_TMP_X + W_TMP + 40;
  const totalH = Math.max(80 + H_INT + 20, Y_EXT + H_EXT + 20) + 20;

  const ducts = [];

  // Interno vertical ducts
  ducts.push({ x: 50, y: 80, w: 30, h: H_INT });
  ducts.push({ x: 50 + W_INT - 30, y: 80, w: 30, h: H_INT });
  // Interno horizontal ducts
  for (let l = 0; l <= int_cfg.linhas; l++) {
    ducts.push({ x: 80, y: 80 + l * RS, w: W_INT - 60, h: DH });
  }
  // Tampa left duct
  ducts.push({ x: O_TMP_X, y: 80, w: 30, h: H_TMP });
  // Tampa horizontal ducts
  for (let l = 0; l <= tmp_cfg.linhas; l++) {
    ducts.push({ x: O_TMP_X + 30, y: 80 + l * RS, w: W_TMP - 30, h: DH });
  }
  // Externo ducts
  ducts.push({ x: 50, y: Y_EXT, w: 30, h: H_EXT });
  ducts.push({ x: 50 + W_EXT - 30, y: Y_EXT, w: 30, h: H_EXT });
  for (let l = 0; l <= ext_cfg.linhas; l++) {
    ducts.push({ x: 80, y: Y_EXT + l * RS, w: W_EXT - 60, h: DH });
  }

  return (
    <svg
      width={totalW}
      height={totalH}
      style={{ overflow: 'visible', pointerEvents: 'none', userSelect: 'none' }}
    >
      {/* Zone backgrounds */}
      <rect x={30} y={40} width={W_INT + 40} height={H_INT + 40} rx={4}
        fill="#242830" stroke="#4b5563" strokeWidth={1.5} />
      <rect x={O_TMP_X - 20} y={40} width={W_TMP + 40} height={H_TMP + 40} rx={4}
        fill="#262830" stroke="#4b5563" strokeWidth={1.5} />
      <rect x={30} y={Y_EXT - 20} width={W_EXT + 40} height={H_EXT + 40} rx={4}
        fill="#1e2820" stroke="#3f6b30" strokeWidth={1.5} />

      {/* Zone labels */}
      <text x={50} y={63} fontSize={11} fontWeight="bold" fill="#6b7280" fontFamily="Segoe UI, sans-serif">
        CHAPA DE MONTAGEM (INTERNO)
      </text>
      <text x={O_TMP_X} y={63} fontSize={11} fontWeight="bold" fill="#6b7280" fontFamily="Segoe UI, sans-serif">
        PORTA DO PAINEL (TAMPA)
      </text>
      <text x={50} y={Y_EXT - 3} fontSize={11} fontWeight="bold" fill="#4a6b40" fontFamily="Segoe UI, sans-serif">
        ÁREA EXTERNA (MOTORES / CARGA)
      </text>

      {/* Ducts */}
      {ducts.map((r, i) => (
        <g key={i}>
          <rect x={r.x} y={r.y} width={r.w} height={r.h}
            fill={cor_canal} stroke="#111" strokeWidth={0.5} />
          {/* Subtle duct texture lines */}
          {r.w > 40 && Array.from({ length: Math.floor(r.w / 20) }, (_, k) => (
            <line key={k}
              x1={r.x + (k + 1) * 20} y1={r.y + 4}
              x2={r.x + (k + 1) * 20} y2={r.y + r.h - 4}
              stroke="#333" strokeWidth={0.5} />
          ))}
        </g>
      ))}

      {/* Chicote: internal → tampa hinge connection */}
      <path
        d={`M ${50 + W_INT - 15} ${80 + H_INT} L ${50 + W_INT - 15} ${80 + H_INT + 50} L ${O_TMP_X + 15} ${80 + H_TMP + 50} L ${O_TMP_X + 15} ${80 + H_TMP}`}
        stroke="#222" strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round"
      />
      {/* Left duct vertical cable exit to externo */}
      <line x1={65} y1={80 + H_INT} x2={65} y2={Y_EXT} stroke="#1a1a1a" strokeWidth={4} strokeDasharray="10 4" />
    </svg>
  );
}
