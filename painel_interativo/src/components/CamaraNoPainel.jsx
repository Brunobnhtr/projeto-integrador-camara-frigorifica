import { PECAS3D, PRENSAS3D, UTIL3D } from '../data/camara';
import { FIOS } from '../data/fiacao';

/* A câmara desenhada ao lado do painel, em elevação frontal, só para
   mostrar ONDE cada fio que sai do painel vai parar.

   ⭐ Os prensa-cabos ficam na parede do FUNDO — aqui eles aparecem na
   borda esquerda porque é de lá que o cabo chega. É a única licença que
   o desenho toma, e está escrita na figura.                          */

const E = 1.35;                       // px por mm da câmara
const MARG = 26;                      // parede + isolamento, em px

export default function CamaraNoPainel({ x0, y0, largura, altura, sel, onSel }) {
  const cx = v => x0 + MARG + v * E;
  const cy = v => y0 + altura - MARG - v * E;

  const prensa = { 'PC-1': { y: 60, cor: '#c92a2a' }, 'PC-2': { y: 210, cor: '#1971c2' } };
  const doPc = id => FIOS.filter(f => f.etapa === 6
    && (id === 'PC-1' ? f.prensa === 'PG9-2' : f.prensa === 'PG9-3'));

  return (
    <g>
      {/* casca externa e isolamento */}
      <rect x={x0} y={y0} width={largura} height={altura} rx={5}
            fill="#f1f3f5" stroke="#868e96" strokeWidth={2} />
      <rect x={x0 + 8} y={y0 + 8} width={largura - 16} height={altura - 16}
            fill="#fff9db" stroke="#ffd43b" strokeWidth={1} />
      <rect x={x0 + MARG} y={y0 + MARG} width={largura - 2 * MARG}
            height={altura - 2 * MARG} fill="#e7f5ff" stroke="#4dabf7" strokeWidth={1.4} />
      <text x={x0 + largura / 2} y={y0 - 5} textAnchor="middle" fontSize={8}
            fontWeight="700" fill="#1971c2">CÂMARA FRIA — 336 × 326 mm</text>

      {/* o lado quente, em cima da tampa */}
      <rect x={cx(60)} y={y0 - 2} width={80 * E} height={MARG - 2} rx={2}
            fill="#ffe8cc" stroke="#e8590c" strokeWidth={1} />
      <text x={cx(100)} y={y0 + 13} textAnchor="middle" fontSize={6}
            fontWeight="700" fill="#e8590c">dissipadores + coolers</text>

      {/* as peças */}
      {PECAS3D.filter(p => !p.fora).map(p => {
        const [px0, , pz0, px1, , pz1] = p.caixa;
        const on = sel === p.id;
        return (
          <g key={p.id} onClick={() => onSel(on ? null : p.id)}
             style={{ cursor: 'pointer' }}>
            <rect x={cx(px0)} y={cy(pz1)} width={(px1 - px0) * E} height={(pz1 - pz0) * E}
                  rx={2} fill={on ? p.cor : '#fff'} stroke={p.cor}
                  strokeWidth={on ? 2.4 : 1.3} />
            <text x={cx((px0 + px1) / 2)} y={cy(pz0) - (pz1 - pz0) * E / 2 + 3}
                  textAnchor="middle" fontSize={6.5} fontWeight="700"
                  fill={on ? '#fff' : p.cor}>{p.id}</text>
          </g>
        );
      })}

      {/* os dutos laterais */}
      {[[-30, 'esq'], [UTIL3D.w + 4, 'dir']].map(([dx, id]) => (
        <rect key={id} x={cx(dx)} y={cy(230)} width={26 * E} height={200 * E}
              fill="#d0ebff" stroke="#4dabf7" strokeWidth={0.7} strokeDasharray="3 2" />
      ))}

      {/* os dois prensa-cabos, na borda por onde o cabo chega */}
      {PRENSAS3D.map(pr => {
        const p = prensa[pr.id];
        const fs = doPc(pr.id);
        return (
          <g key={pr.id}>
            <circle cx={x0} cy={y0 + p.y} r={7} fill={p.cor} />
            <circle cx={x0} cy={y0 + p.y} r={3} fill="#fff" />
            <text x={x0 + 11} y={y0 + p.y - 4} fontSize={6.5} fontWeight="700"
                  fill={p.cor}>{pr.id}</text>
            <text x={x0 + 11} y={y0 + p.y + 5} fontSize={5.5} fill="#868e96">
              {fs.length} fios · {pr.nome}
            </text>
          </g>
        );
      })}
      <text x={x0 + 4} y={y0 + altura - 5} fontSize={5} fill="#868e96">
        ⚠️ os prensa-cabos ficam na parede do FUNDO — aqui aparecem de lado
      </text>
    </g>
  );
}
