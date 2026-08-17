import {
  PECAS3D, TAMPA3D, PRENSAS3D, UTIL3D, ROTAS_CAMARA, EMENDAS_CAMARA,
} from '../data/camara';
import { FIOS } from '../data/fiacao';
import {
  caminhoCamara, cruzamentos, pontoBorne, BORNES_CAMARA, pxCamara,
  E_CAM, MARG_CAM, naCamara, naTampa, eRetorno,
} from '../lib/rota_camara';
import { setaEm } from '../lib/geometria_painel';

/* A câmara desenhada ao lado do painel, em elevação frontal.
   Aqui o fio não morre na parede: ele entra pelo furo, corre pelo piso,
   sobe rente à parede e termina DENTRO de um borne que tem nome.

   ⭐ POR QUE ESTA VISTA É HONESTA: a parede do fundo é exatamente o
   plano deste desenho, então o x e o z dos prensa-cabos são os do
   projeto, sem licença nenhuma. O que não se vê é a profundidade — o
   cabo sai da parede na sua direção, e por isso o furo é um alvo.      */

const E = E_CAM;
const MARG = MARG_CAM;
const R_BORNE = 2.7;                  // raio do borne, em px
const R_HOP = 3.4;                    // raio do pulinho, em px

const acha = n => FIOS.find(f => f.n === n);
const bornesDe = p => p.bornes ?? [];

/* ⭐ A SELEÇÃO DO FIO É A MESMA DO PAINEL. Enquanto cada vista guardava
   a sua, clicar no X9 dentro da câmara não acendia o mesmo X9 saindo do
   MV-1 — e era justamente esse pedaço, o meio do caminho, que ninguém
   conseguia enxergar. Agora um clique acende o fio inteiro: do borne do
   componente, pela canaleta, pelo prensa-cabo, até a peça lá dentro. */
export default function CamaraNoPainel({
  x0, y0, largura, altura, sel, onSel, fio, onFio, apagado,
}) {
  const fioSel = fio;
  const setFioSel = onFio;
  const { cx, cy } = pxCamara(x0, y0, altura);

  const daCamara = FIOS.filter(f => f.etapa === 6 && naCamara(f));
  const daTampa  = FIOS.filter(f => f.etapa === 6 && naTampa(f));

  const caminhos = new Map();
  for (const f of daCamara) {
    const c = caminhoCamara(f.n);
    if (c) caminhos.set(f.n, c);
  }
  /* quem cruza é sempre a medição: ela atravessa a potência em 90° */
  const hops = new Map();
  for (const c of cruzamentos(caminhos))
    (hops.get(c.h) ?? hops.set(c.h, []).get(c.h)).push([c.x, c.z]);

  /* ── waypoints em mm viram `d` de SVG, com pulinho onde cruza ─────── */
  function paraD(pontos, meus = []) {
    const P = pontos.map(([X, Z]) => [cx(X), cy(Z)]);
    const H = meus.map(([X, Z]) => [cx(X), cy(Z)]);
    let d = `M ${P[0][0]},${P[0][1]}`;
    for (let i = 1; i < P.length; i++) {
      const [ax, ay] = P[i - 1], [bx, by] = P[i];
      const horiz = Math.abs(ay - by) < 0.6;
      const sg = Math.sign((horiz ? bx - ax : by - ay)) || 1;
      const nos = H
        .filter(h => horiz
          ? Math.abs(h[1] - ay) < 1.2 && (h[0] - ax) * sg > 0 && (bx - h[0]) * sg > 0
          : Math.abs(h[0] - ax) < 1.2 && (h[1] - ay) * sg > 0 && (by - h[1]) * sg > 0)
        .sort((p, q) => (horiz ? (p[0] - q[0]) * sg : (p[1] - q[1]) * sg));
      for (const [hx, hy] of nos) {
        if (horiz) {
          d += ` L ${hx - R_HOP * sg},${hy}`
             + ` A ${R_HOP} ${R_HOP} 0 0 ${sg > 0 ? 0 : 1} ${hx + R_HOP * sg},${hy}`;
        } else {
          d += ` L ${hx},${hy - R_HOP * sg}`
             + ` A ${R_HOP} ${R_HOP} 0 0 ${sg > 0 ? 1 : 0} ${hx},${hy + R_HOP * sg}`;
        }
      }
      d += ` L ${bx},${by}`;
    }
    return d;
  }

  /* ── o lado quente: sobe por fora, não fura parede ─────────────────── */
  const TAMPA_CX = { RAD: [18, 116], DS18: [128, 182] };   // mm, dentro da tampa
  function dTampa(f, k) {
    const d = naTampa(f);
    const pe = TAMPA3D.find(p => p.id === d.tampa);
    const bo = bornesDe(pe).find(x => x.b === d.borne);
    if (!bo) return null;
    const [a, b] = TAMPA_CX[pe.id];
    const bx = cx(a + bo.t * (b - a));
    const yb = y0 - 21 + k * 1.7;                    // faixa acima da câmara
    const xv = x0 - 4 - k * 1.9;                     // subida rente à lateral
    return `M ${xv},${y0 + altura - 6} L ${xv},${yb} L ${bx},${yb} L ${bx},${y0 - 2}`;
  }

  /* ── um risco de fio, com área de clique folgada ───────────────────── */
  const Fio = ({ f, d, pontos }) => {
    const on = fioSel === f.n;
    const volta = eRetorno(f);
    return (
      <g onClick={e => { e.stopPropagation(); setFioSel(on ? null : f.n); }}
         style={{ cursor: 'pointer' }}
         opacity={apagado ? 0.12 : fioSel && !on ? 0.2 : 1}>
        <path d={d} fill="none" stroke="transparent" strokeWidth={7} />
        <path d={d} fill="none" stroke={f.cor} strokeWidth={on ? 2.4 : 1.1}
              strokeLinejoin="round" strokeLinecap="round" />
        {/* a seta anda no sentido do fio: para a peça na ida, para o
            furo na volta */}
        {pontos && [0.45, 0.8].map(fr => {
          const px = pontos.map(([X, Z]) => [cx(X), cy(Z)]);
          const a = setaEm(volta ? [...px].reverse() : px, fr);
          return a && (
            <polygon key={fr} points="-2.2,-1.6 2.4,0 -2.2,1.6" fill={f.cor}
                     stroke="#fff" strokeWidth={0.3}
                     transform={`translate(${a.x} ${a.y}) rotate(${a.ang})`} />
          );
        })}
      </g>
    );
  };

  const info = fioSel && acha(fioSel);

  return (
    <g onClick={() => setFioSel(null)}>
      {/* casca externa e isolamento */}
      <rect x={x0} y={y0} width={largura} height={altura} rx={5}
            fill="#f1f3f5" stroke="#868e96" strokeWidth={2} />
      <rect x={x0 + 8} y={y0 + 8} width={largura - 16} height={altura - 16}
            fill="#fff9db" stroke="#ffd43b" strokeWidth={1} />
      <rect x={x0 + MARG} y={y0 + MARG} width={largura - 2 * MARG}
            height={altura - 2 * MARG} fill="#e7f5ff" stroke="#4dabf7" strokeWidth={1.4} />

      {/* o lado quente, em cima da tampa */}
      {TAMPA3D.map(p => {
        const [a, b] = TAMPA_CX[p.id];
        return (
          <g key={p.id}>
            <rect x={cx(a)} y={y0 - 2} width={(b - a) * E} height={MARG - 3} rx={2}
                  fill="#ffe8cc" stroke={p.cor} strokeWidth={1.1} />
            <text x={cx((a + b) / 2)} y={y0 + 12} textAnchor="middle" fontSize={6}
                  fontWeight="700" fill={p.cor}>{p.id}</text>
            {bornesDe(p).map(bo => (
              <g key={bo.b}>
                <circle cx={cx(a + bo.t * (b - a))} cy={y0 - 2} r={R_BORNE}
                        fill="#fff" stroke={p.cor} strokeWidth={1.2} />
                <text x={cx(a + bo.t * (b - a))} y={y0 + 20} textAnchor="middle"
                      fontSize={4.6} fontWeight="600" fill={p.cor}>{bo.b}</text>
              </g>
            ))}
          </g>
        );
      })}
      <text x={cx(100)} y={y0 - 26} textAnchor="middle" fontSize={5.6} fill="#e8590c">
        ▲ lado quente, do lado de FORA — estes {daTampa.length} fios sobem por fora e não furam parede
      </text>

      {/* os dutos laterais, onde ficam as ventoinhas de retorno */}
      {[[-30, 'esq'], [UTIL3D.w + 4, 'dir']].map(([dx, id]) => (
        <rect key={id} x={cx(dx)} y={cy(230)} width={26 * E} height={200 * E}
              fill="#d0ebff" stroke="#4dabf7" strokeWidth={0.7} strokeDasharray="3 2" />
      ))}

      {/* ⭐ os fios ANTES das peças: o borne fica por cima e sempre visível */}
      {daTampa.map((f, k) => {
        const d = dTampa(f, k);
        return d && <Fio key={f.n} f={f} d={d} />;
      })}
      {[...caminhos].map(([n, c]) => (
        <Fio key={n} f={acha(n)} d={paraD(c.pontos, hops.get(n) ?? [])}
             pontos={c.pontos} />
      ))}
      {/* as emendas feitas ali dentro, que não vêm do painel */}
      {EMENDAS_CAMARA.map((e, i) => {
        const a = BORNES_CAMARA.get(`${e.de.p}.${e.de.b}`);
        const b = BORNES_CAMARA.get(`${e.para.p}.${e.para.b}`);
        if (!a || !b) return null;
        return (
          <polyline key={i} fill="none" stroke="#f59f00" strokeWidth={0.9}
                    strokeDasharray="2 2"
                    points={`${cx(a.x)},${cy(a.z)} ${cx(a.x)},${cy(b.z + 6)} `
                          + `${cx(b.x)},${cy(b.z + 6)} ${cx(b.x)},${cy(b.z)}`} />
        );
      })}

      {/* as peças, com os bornes na borda */}
      {PECAS3D.map(p => {
        const [px0, , pz0, px1, , pz1] = p.caixa;
        const on = sel === p.id;
        return (
          <g key={p.id} onClick={e => { e.stopPropagation(); onSel(on ? null : p.id); }}
             style={{ cursor: 'pointer' }}>
            <rect x={cx(px0)} y={cy(pz1)} width={(px1 - px0) * E} height={(pz1 - pz0) * E}
                  rx={2} fill={on ? p.cor : '#fff'} stroke={p.cor}
                  strokeWidth={on ? 2.4 : 1.3} />
            <text x={cx((px0 + px1) / 2)} y={cy((pz0 + pz1) / 2) + 2.4}
                  textAnchor="middle" fontSize={6.5} fontWeight="700"
                  fill={on ? '#fff' : p.cor}>{p.id}</text>
            {bornesDe(p).map(bo => {
              const q = pontoBorne(p.caixa, bo);
              return (
                <g key={bo.b}>
                  <circle cx={cx(q.x)} cy={cy(q.z)} r={R_BORNE} fill="#fff"
                          stroke={p.cor} strokeWidth={1.2} />
                  <text x={cx(q.x) + q.ax * 5.5} y={cy(q.z) - q.az * 6.5 + 1.7}
                        textAnchor={q.ax < 0 ? 'end' : q.ax > 0 ? 'start' : 'middle'}
                        fontSize={4.6} fontWeight="600" fill={p.cor}>{bo.b}</text>
                </g>
              );
            })}
          </g>
        );
      })}

      {/* os dois furos da parede do fundo */}
      {PRENSAS3D.map(pr => {
        const n = Object.values(ROTAS_CAMARA).filter(r => r.pc === pr.id).length;
        const X = cx(pr.x), Y = cy(pr.z);
        return (
          <g key={pr.id}>
            <circle cx={X} cy={Y} r={9} fill="none" stroke={pr.cor}
                    strokeWidth={0.8} strokeDasharray="2 2" />
            <circle cx={X} cy={Y} r={5} fill="#fff" stroke={pr.cor} strokeWidth={1.8} />
            <circle cx={X} cy={Y} r={1.8} fill={pr.cor} />
            <text x={X} y={Y - 12} textAnchor="middle" fontSize={6} fontWeight="700"
                  fill={pr.cor}>{pr.id} · {n} fios</text>
          </g>
        );
      })}

      <text x={x0 + largura / 2} y={y0 + altura + 10} textAnchor="middle" fontSize={5.4}
            fill="#868e96">
        os 2 furos ficam na parede do FUNDO — o cabo sai deles na sua direção
      </text>
      <text x={x0 + largura / 2} y={y0 + altura + 18} textAnchor="middle" fontSize={5.4}
            fill="#f59f00">
        ─ ─ laranja tracejado = emenda feita ALI DENTRO · ⌒ = medição cruzando potência em 90°
      </text>

      {/* de onde vem e para onde vai o fio clicado */}
      {info && (() => {
        const d = naCamara(info) ?? naTampa(info);
        const alvo = `${d.camara ?? d.tampa} · ${d.borne}`;
        const lado = info.de.comp ? info.de : info.para;
        const volta = eRetorno(info);
        return (
          <g pointerEvents="none">
            <rect x={x0 + 8} y={y0 + altura - 76} width={largura - 16} height={64} rx={5}
                  fill="#fff" stroke={info.cor} strokeWidth={1.6} opacity={0.97} />
            <text x={x0 + 15} y={y0 + altura - 63} fontSize={8} fontWeight="700"
                  fill={info.cor}>{info.n} · {info.nome}</text>
            <text x={x0 + 15} y={y0 + altura - 52} fontSize={6.8} fontWeight="600"
                  fill="#212529">
              {volta ? `◄── VOLTA:  ${alvo}   para o painel em   ${lado.comp} · ${lado.via}`
                     : `──► IDA:  painel ${lado.comp} · ${lado.via}   até   ${alvo}`}
            </text>
            <text x={x0 + 15} y={y0 + altura - 42} fontSize={6.2} fill="#495057">
              {info.mm2} mm² {info.corNome} · sai do painel pelo {info.prensa}
              {ROTAS_CAMARA[info.n] ? ` · fura a parede no ${ROTAS_CAMARA[info.n].pc}`
                                    : ' · não fura parede, sobe por fora'}
            </text>
            <text x={x0 + 15} y={y0 + altura - 32} fontSize={6} fill="#868e96">
              {(info.diz ?? '').slice(0, 96)}
            </text>
            <text x={x0 + 15} y={y0 + altura - 21} fontSize={5.6} fill="#adb5bd">
              clique em outro fio para trocar · clique no fundo para fechar
            </text>
          </g>
        );
      })()}
      {!info && (
        <text x={x0 + largura / 2} y={y0 + altura - 8} textAnchor="middle" fontSize={6.4}
              fontWeight="700" fill="#1971c2">
          clique num fio para ver a ida e a volta dele
        </text>
      )}
    </g>
  );
}
