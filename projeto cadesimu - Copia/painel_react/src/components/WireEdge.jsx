/**
 * Custom ReactFlow edge that renders pre-computed duct-following wire paths.
 * Supports three animation states controlled by data props:
 *   hidden    — wire is invisible (play sequence not yet reached this wire)
 *   revealing — wire draws itself progressively (montagem phase)
 *   flowing   — wire has animated dashes (energia phase)
 */
export default function WireEdge({ data, selected }) {
  if (!data?.path || data.path.length < 2) return null;

  const pts = data.path;
  const d = 'M ' + pts.map(([x, y]) => `${x} ${y}`).join(' L ');
  const cor = data.cor || '#00e6b8';
  const isSelected = selected || data.highlighted;

  // Estimate path length for the reveal dash animation
  const pathLen = pts.reduce((acc, p, i) => {
    if (i === 0) return acc;
    const dx = p[0] - pts[i - 1][0];
    const dy = p[1] - pts[i - 1][1];
    return acc + Math.sqrt(dx * dx + dy * dy);
  }, 0) + 20;

  const strokeW = isSelected ? 3.5 : 2.5;
  const hidden = !!data.hidden;

  // Arrowhead at last segment
  const last = pts[pts.length - 1];
  const prev = pts[pts.length - 2];
  const dx = last[0] - prev[0];
  const dy = last[1] - prev[1];
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  // Build reveal style: set --wire-len so @keyframes uses the real path length
  const revealStyle = data.revealing ? {
    '--wire-len': `${pathLen}px`,
    strokeDasharray: pathLen,
    strokeDashoffset: pathLen,
    animationDuration: `${data.revealDur ?? 0.6}s`,
    animationTimingFunction: 'ease-out',
    animationFillMode: 'forwards',
    animationName: 'wire-reveal',
  } : {};

  return (
    // Keep same g structure always — only toggle opacity so React never
    // unmounts/remounts children (avoids CSS animation restart edge-cases).
    <g style={{ opacity: hidden ? 0 : 1, pointerEvents: hidden ? 'none' : 'auto' }}>
      {/* Glow halo for selected/highlighted wires */}
      {isSelected && !hidden && (
        <path
          d={d}
          stroke={cor}
          strokeWidth={10}
          fill="none"
          strokeOpacity={0.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {/* Main wire path */}
      <path
        d={d}
        stroke={cor}
        strokeWidth={strokeW}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={data.flowing ? 'wire-animated' : data.revealing ? 'wire-reveal' : ''}
        style={revealStyle}
      />

      {/* Arrowhead */}
      <polygon
        points="-6,-3 0,0 -6,3"
        transform={`translate(${last[0]},${last[1]}) rotate(${angle})`}
        fill={cor}
        opacity={data.revealing ? 0 : 1}
      />
    </g>
  );
}
