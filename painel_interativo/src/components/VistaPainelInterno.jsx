import { useState, useMemo, useRef } from 'react';
import PlacaIlhada from './PlacaIlhada';
import PlacaReal from './PlacaReal';
import * as PI1 from '../data/pi1_fisico';
import * as PI2 from '../data/pi2_fisico';
import { PINAGENS } from '../data/pinagens';
import { PRENSAS_PAINEL, FIOS, ETAPAS } from '../data/fiacao';

/* onde a passagem flexível cruza da placa para a porta, por classe */
const PASSAGEM = { potencia: 311, sinal: 194 };

/* Quais componentes do painel têm desenho de placa, e qual.
   'ilhada' = placa que VOCÊ monta furo por furo.
   'real'   = módulo comprado, desenhado a partir da foto.        */
const PLACAS = {
  PI1:  { tipo: 'ilhada', dados: PI1, titulo: 'Placa PI-1',
          rotulo: 'a placa que você vai montar — 20 jumpers, 3 circuitos' },
  'PI-2': { tipo: 'ilhada', dados: PI2, titulo: 'Placa PI-2',
          rotulo: 'a placa que você vai montar — shunts, mux e INA219' },
  BTS1: { tipo: 'real', chave: 'BTS1', rotulo: 'módulo comprado — pinagem tirada da foto' },
  BTS2: { tipo: 'real', chave: 'BTS1', rotulo: 'módulo comprado — igual ao BTS #1' },
  ESP32:{ tipo: 'real', chave: 'ESP32', rotulo: 'placa DNLCB30 — 32 bornes de parafuso' },
  HMI:  { tipo: 'real', chave: 'HMI',  rotulo: 'tela ES3C28P — conectores e área útil' },
  CONV: { tipo: 'real', chave: 'CONV', rotulo: 'conversor de nível — 2 canais' },
};
import {
  CAIXA, PLACA, TRILHOS, COMPONENTES, CANALETAS, CANALETAS_PORTA, LATERAIS,
  REGRA_SEGREGACAO,
} from '../data/painel_completo';

/* O painel visto de frente, com a porta aberta ao lado.
   Cada terminal é um quadrado com o ID dentro, na borda onde ele fica
   de verdade no componente. Tudo em milímetros.                        */

const PASSO_MIN = 4.6;   // mm entre centros de terminais
const LADO_T = 4.0;      // mm do quadradinho — grande o bastante para o ID caber

/* Distribui os terminais de um grupo ao longo da borda que ele ocupa. */
function posicoes(c, g) {
  const n = g.pinos.length;
  const linhas = g.linhas ?? 1;
  const porLinha = Math.ceil(n / linhas);
  const vert = g.lado === 'esquerda' || g.lado === 'direita';
  const compr = vert ? c.altura : c.largura;
  const passo = Math.max(2.6, Math.min(PASSO_MIN, (compr - 3) / porLinha));
  const inicio = (compr - (porLinha - 1) * passo) / 2;

  return g.pinos.map((p, i) => {
    /* Os dados vêm INTERCALADOS — [5V, sinal, 5V, sinal, ...] — porque é
       assim que o borne é: um par por linha. Então a coluna avança a cada
       `linhas` pinos, e não na metade da lista. Dividir a lista ao meio
       colocaria metade dos pares numa coluna e metade na outra. */
    const lin = linhas > 1 ? i % linhas : 0;
    const col = linhas > 1 ? Math.floor(i / linhas) : i;
    const desl = inicio + col * passo;
    const rec = 3.0 + lin * 11.0;          // recuo, para dentro da placa
    if (g.lado === 'cima')     return { ...p, x: c.x + desl, y: c.y + rec, passo };
    if (g.lado === 'baixo')    return { ...p, x: c.x + desl, y: c.y + c.altura - rec, passo };
    if (g.lado === 'esquerda') return { ...p, x: c.x + rec, y: c.y + desl, passo };
    return { ...p, x: c.x + c.largura - rec, y: c.y + desl, passo };
  });
}

export default function VistaPainelInterno() {
  const [sel, setSel] = useState(null);      // componente
  const [pino, setPino] = useState(null);    // terminal
  const [zoom, setZoom] = useState(3.0);
  const [soUsados, setSoUsados] = useState(false);
  const [placa, setPlaca] = useState(null);   // desenho da placa em tela cheia
  const [verFiacao, setVerFiacao] = useState(true);
  const [fio, setFio] = useState(null);
  const [etapa, setEtapa] = useState(0);   // 0 = todas
  const rolagem = useRef(null);

  /* scroll do mouse dá zoom, mantendo sob o cursor o que estava sob ele */
  const aoRolar = e => {
    if (!e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey) {
      const el = rolagem.current;
      if (!el) return;
      e.preventDefault();
      const fator = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      const novo = Math.min(10, Math.max(1.2, zoom * fator));
      const rx = (el.scrollLeft + e.nativeEvent.offsetX) / zoom;
      const ry = (el.scrollTop + e.nativeEvent.offsetY) / zoom;
      setZoom(novo);
      requestAnimationFrame(() => {
        el.scrollLeft = rx * novo - e.nativeEvent.offsetX;
        el.scrollTop = ry * novo - e.nativeEvent.offsetY;
      });
    }
  };

  /* posiciona cada componente no seu trilho */
  const comps = useMemo(() => {
    return COMPONENTES.map(c => {
      const t = TRILHOS.find(x => x.n === c.trilho);
      const y = c.porta ? c.y : t.y - c.altura / 2;
      const x = c.porta ? CAIXA.largura + 40 + c.x : PLACA.x + c.x;
      return { ...c, x, y };
    });
  }, []);

  /* ⭐ O caminho de cada fio, andando pela LINHA DE CENTRO das canaletas
     da rota. Horizontal manda no Y, vertical manda no X.

     A porta é outro plano: as canaletas dela têm coordenadas próprias,
     e o pulo de um plano para o outro é a PASSAGEM FLEXÍVEL — desenhada
     como um laço, que é como o chicote fica de verdade. */
  const PORTA_X0 = CAIXA.largura + 40;
  const tracados = useMemo(() => {
    const rect = id => {
      const k = [...CANALETAS, ...CANALETAS_PORTA].find(x => x.id === id);
      if (!k) return null;
      return k.id.startsWith('CP-') ? { ...k, x: k.x + PORTA_X0 } : k;
    };
    const ponta = (alvo, i) => {
      if (alvo.prensa) {
        const pr = PRENSAS_PAINEL.find(x => x.id === alvo.prensa);
        return { p: [pr.x, CAIXA.altura + 2], pr };
      }
      const c = comps.find(x => x.id === alvo.comp);
      if (!c) return { p: null };
      const g = c.grupos.find(gg => gg.pinos.some(pp => pp.nome === alvo.via));
      const pino = g && posicoes(c, g).find(pp => pp.nome === alvo.via);
      void i;
      return { p: pino ? [pino.x, pino.y] : null };
    };

    return FIOS.map((f, idx) => {
      const desvio = ((idx % 7) - 3) * 3.0;
      const a = ponta(f.de, 0), b = ponta(f.para, 1);
      if (!a.p || !b.p) return { ...f, pts: [], prensa: a.pr };

      const pts = [a.p.slice()];
      let cur = a.p.slice();
      let planoAnt = null;
      for (const id of f.rota) {
        const k = rect(id);
        if (!k) continue;
        const plano = id.startsWith('CP-') ? 'porta' : 'placa';
        if (planoAnt && plano !== planoAnt) {
          /* o laço da passagem flexível, na altura da classe do fio */
          const yP = PASSAGEM[f.classe === 'comum' ? 'potencia' : f.classe];
          pts.push([cur[0], yP]);
          pts.push([plano === 'porta' ? PORTA_X0 + 30 : PLACA.x + PLACA.largura - 8, yP]);
          cur = [pts[pts.length - 1][0], yP];
        }
        if (k.vertical) cur = [k.x + k.w / 2 + desvio, cur[1]];
        else cur = [cur[0], k.y + k.h / 2 + desvio];
        pts.push([...cur]);
        planoAnt = plano;
      }
      pts.push([b.p[0], cur[1]]);
      pts.push(b.p.slice());
      return { ...f, pts, prensa: a.pr };
    });
  }, [comps]);

  const PORTA_X = CAIXA.largura + 40, PORTA_W = 250;
  const LAT_X = PORTA_X + PORTA_W + 40, LAT_W = 200;
  const larguraTotal = LAT_X + LAT_W;

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <div ref={rolagem} onWheel={aoRolar}
           style={{ flex: 1, overflow: 'auto', padding: 14, background: '#eef1f5' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10,
                      background: '#fff', padding: '8px 13px', borderRadius: 7,
                      flexWrap: 'wrap' }}>
          <b style={{ fontSize: 13 }}>Painel por dentro · {CAIXA.largura} × {CAIXA.altura} mm</b>
          <label style={{ fontSize: 11.5, color: '#495057', display: 'flex', gap: 5 }}>
            <input type="checkbox" checked={soUsados}
                   onChange={e => setSoUsados(e.target.checked)} />
            só os terminais usados
          </label>
          {verFiacao && ETAPAS.filter(e => e.feito).map(e => (
            <button key={e.n} onClick={() => setEtapa(etapa === e.n ? 0 : e.n)} style={{
              background: etapa === e.n ? '#f59f00' : '#fff',
              color: etapa === e.n ? '#fff' : '#8a5a00', border: '2px solid #f59f00',
              borderRadius: 6, padding: '5px 9px', cursor: 'pointer',
              fontSize: 11, fontWeight: 700 }}>etapa {e.n}</button>
          ))}
          <button onClick={() => { setVerFiacao(!verFiacao); setFio(null); }} style={{
            background: verFiacao ? '#1971c2' : '#fff',
            color: verFiacao ? '#fff' : '#1971c2', border: '2px solid #1971c2',
            borderRadius: 6, padding: '5px 11px', cursor: 'pointer',
            fontSize: 11.5, fontWeight: 700 }}>
            🔌 Fiação
          </button>
          <input type="range" min={1.2} max={10} step={0.1} value={zoom}
                 onChange={e => setZoom(+e.target.value)}
                 style={{ flex: 1, minWidth: 110, maxWidth: 240 }} />
          <span style={{ fontSize: 11, color: '#868e96' }}>
            {zoom.toFixed(1)}× · 🖱️ role o mouse sobre o desenho
          </span>
        </div>

        <svg width={larguraTotal * zoom}
             viewBox={`-14 -14 ${larguraTotal + 28} ${CAIXA.altura + 74}`}
             style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 6px #0002' }}>

          {/* caixa e placa de montagem */}
          <rect x={0} y={0} width={CAIXA.largura} height={CAIXA.altura} rx={4}
                fill="#dee2e6" stroke="#868e96" strokeWidth={2} />
          <rect x={PLACA.x} y={PLACA.y} width={PLACA.largura}
                height={PLACA.altura} rx={2} fill="#e9ecef" stroke="#ced4da"
                strokeWidth={1} />

          {/* canaletas — o caminho dos fios */}
          {CANALETAS.map(k => {
            const pot = k.tipo === 'potencia';
            return (
              <g key={k.id}>
                <rect x={k.vertical && k.id === 'CV-dir' ? k.x : k.x}
                      y={k.y} width={k.vertical ? k.w : k.w} height={k.h} rx={1.5}
                      fill={pot ? '#ffe3e3' : '#e7f5ff'}
                      stroke={pot ? '#ffa8a8' : '#a5d8ff'} strokeWidth={0.8} />
                {/* dentes da canaleta */}
                {Array.from({ length: Math.floor((k.vertical ? k.h : k.w) / 7) }, (_, i) => (
                  k.vertical
                    ? <line key={i} x1={k.x + 1.5} y1={k.y + 4 + i * 7}
                            x2={k.x + k.w - 1.5} y2={k.y + 4 + i * 7}
                            stroke={pot ? '#ffc9c9' : '#c5e4fb'} strokeWidth={0.5} />
                    : <line key={i} x1={k.x + 4 + i * 7} y1={k.y + 1.5}
                            x2={k.x + 4 + i * 7} y2={k.y + k.h - 1.5}
                            stroke={pot ? '#ffc9c9' : '#c5e4fb'} strokeWidth={0.5} />
                ))}
                {!k.vertical && (
                  <text x={k.x + k.w - 3} y={k.y + k.h / 2 + 2} textAnchor="end"
                        fontSize={4.5} fontWeight="700"
                        fill={pot ? '#e03131' : '#1971c2'}>
                    {pot ? 'POTÊNCIA' : 'SINAL'}
                  </text>
                )}
                {k.vertical && (
                  <text x={k.x + k.w / 2} y={k.y + 12} textAnchor="middle"
                        fontSize={4.5} fontWeight="700"
                        fill={pot ? '#e03131' : '#1971c2'}
                        transform={`rotate(-90 ${k.x + k.w / 2} ${k.y + 12})`}>
                    {pot ? 'POTÊNCIA' : 'SINAL'}
                  </text>
                )}
              </g>
            );
          })}

          {/* ⭐ ETAPA 1 DA FIAÇÃO — o que entra pela base */}
          {verFiacao && tracados.filter(t => t.pts.length &&
                                       (!etapa || t.etapa === etapa)).map(t => {
            const on = !fio || fio === t.n;
            return (
              <g key={t.n} onClick={() => setFio(fio === t.n ? null : t.n)}
                 style={{ cursor: 'pointer' }} opacity={on ? 1 : 0.12}>
                <polyline points={t.pts.map(p => p.join(',')).join(' ')} fill="none"
                          stroke="transparent" strokeWidth={9} />
                <polyline points={t.pts.map(p => p.join(',')).join(' ')} fill="none"
                          stroke="#fff" strokeWidth={fio === t.n ? 6.5 : 4.6}
                          strokeLinejoin="round" strokeLinecap="round" opacity={0.85} />
                <polyline points={t.pts.map(p => p.join(',')).join(' ')} fill="none"
                          stroke={t.cor} strokeWidth={fio === t.n ? 4.2 : 2.6}
                          strokeLinejoin="round" strokeLinecap="round" />
                {t.prensa && (<>
                  <circle cx={t.prensa.x} cy={CAIXA.altura + 2} r={6.5} fill="#495057" />
                  <circle cx={t.prensa.x} cy={CAIXA.altura + 2} r={3} fill={t.cor} />
                </>)}
                {/* a anilha, no meio do percurso */}
                {(() => {
                  const m = t.pts[Math.floor(t.pts.length / 2)];
                  return (
                    <g>
                      <rect x={m[0] - 8} y={m[1] - 5} width={16} height={10} rx={2}
                            fill="#fff" stroke={t.cor} strokeWidth={1} />
                      <text x={m[0]} y={m[1] + 3.4} textAnchor="middle" fontSize={6.5}
                            fontWeight="700" fill={t.cor}>{t.n}</text>
                    </g>
                  );
                })()}
              </g>
            );
          })}
          {verFiacao && PRENSAS_PAINEL.map(pr => (
            <text key={pr.id} x={pr.x} y={CAIXA.altura + 26} textAnchor="middle"
                  fontSize={5.5} fontWeight="700" fill="#495057">{pr.id}</text>
          ))}

          {/* trilhos DIN */}
          {TRILHOS.map(t => (
            <g key={t.n}>
              <rect x={PLACA.x + 4} y={t.y - 5} width={PLACA.largura - 8} height={10}
                    rx={1} fill="#b8bcc0" stroke="#868e96" strokeWidth={0.6} />
              <text x={PLACA.x + 6} y={t.y - 38} fontSize={7} fontWeight="700" fill="#8895a6">
                {t.nome}
              </text>
            </g>
          ))}

          {/* porta */}
          <rect x={CAIXA.largura + 40} y={0} width={250} height={CAIXA.altura} rx={4}
                fill="#e9ecef" stroke="#868e96" strokeWidth={2} />
          {[70, 240, 410].map(hy => (
            <rect key={hy} x={CAIXA.largura + 36} y={hy} width={8} height={26} rx={2}
                  fill="#adb5bd" />
          ))}
          <text x={PORTA_X + PORTA_W / 2} y={-4} textAnchor="middle" fontSize={8}
                fontWeight="700" fill="#495057">PORTA — vista de dentro</text>

          {/* canaletas da porta — mesmas regras da placa de montagem */}
          {CANALETAS_PORTA.map(k => {
            const pot = k.tipo === 'potencia';
            return (
              <g key={k.id}>
                <rect x={PORTA_X + k.x} y={k.y} width={k.w} height={k.h} rx={1.5}
                      fill={pot ? '#ffe3e3' : '#e7f5ff'}
                      stroke={pot ? '#ffa8a8' : '#a5d8ff'} strokeWidth={0.8} />
                {Array.from({ length: Math.floor((k.vertical ? k.h : k.w) / 7) }, (_, i) => (
                  k.vertical
                    ? <line key={i} x1={PORTA_X + k.x + 1.5} y1={k.y + 4 + i * 7}
                            x2={PORTA_X + k.x + k.w - 1.5} y2={k.y + 4 + i * 7}
                            stroke={pot ? '#ffc9c9' : '#c5e4fb'} strokeWidth={0.5} />
                    : <line key={i} x1={PORTA_X + k.x + 4 + i * 7} y1={k.y + 1.5}
                            x2={PORTA_X + k.x + 4 + i * 7} y2={k.y + k.h - 1.5}
                            stroke={pot ? '#ffc9c9' : '#c5e4fb'} strokeWidth={0.5} />
                ))}
                {!k.vertical && (
                  <text x={PORTA_X + k.x + k.w - 3} y={k.y + k.h / 2 + 2} textAnchor="end"
                        fontSize={4.2} fontWeight="700"
                        fill={pot ? '#e03131' : '#1971c2'}>
                    {pot ? 'POTÊNCIA' : 'SINAL'}
                  </text>
                )}
                {k.dobradica && (
                  <text x={PORTA_X + k.x + k.w / 2} y={k.y + 120} textAnchor="middle"
                        fontSize={4.6} fontWeight="700" fill="#e8590c"
                        transform={`rotate(-90 ${PORTA_X + k.x + k.w / 2} ${k.y + 120})`}>
                    DOBRADIÇA — todos os fios cruzam por aqui
                  </text>
                )}
              </g>
            );
          })}

          {/* ⭐ a passagem flexível: onde os fios saltam da placa para a porta */}
          <path d={`M ${PLACA.x + PLACA.largura - 14} 240
                    C ${PORTA_X - 40} 200, ${PORTA_X - 30} 280, ${PORTA_X + 16} 240`}
                fill="none" stroke="#e8590c" strokeWidth={4} strokeLinecap="round"
                opacity={0.75} />
          <text x={(PLACA.x + PLACA.largura + PORTA_X) / 2} y={196} textAnchor="middle"
                fontSize={6} fontWeight="700" fill="#e8590c">passagem flexível</text>
          <text x={(PLACA.x + PLACA.largura + PORTA_X) / 2} y={205} textAnchor="middle"
                fontSize={5} fill="#e8590c">espiral + folga de 60 mm</text>

          {/* ── a lateral direita, com a antena ── */}
          <rect x={LAT_X} y={0} width={LAT_W} height={CAIXA.altura} rx={4}
                fill="#f1f3f5" stroke="#868e96" strokeWidth={2} />
          <text x={LAT_X + LAT_W / 2} y={-4} textAnchor="middle" fontSize={8}
                fontWeight="700" fill="#495057">
            LATERAL DIREITA — {CAIXA.profundidade} × {CAIXA.altura} mm
          </text>
          <text x={LAT_X + 6} y={CAIXA.altura - 8} fontSize={5} fill="#868e96">
            ← traseira · frente →
          </text>
          {LATERAIS.map(a => {
            const cx = LAT_X + a.x, cy = CAIXA.altura - a.y;
            const on = sel?.id === a.id;
            return (
              <g key={a.id} onClick={() => { setSel(a); setPino(null); }}
                 style={{ cursor: 'pointer' }}>
                {/* a antena, articulada para cima */}
                <line x1={cx} y1={cy} x2={cx + 40} y2={cy - 58} stroke={a.cor}
                      strokeWidth={on ? 5 : 3.4} strokeLinecap="round" />
                <circle cx={cx + 40} cy={cy - 58} r={3} fill={a.cor} />
                <circle cx={cx} cy={cy} r={on ? 8 : 6.5} fill="#495057"
                        stroke={on ? '#ffd43b' : a.cor} strokeWidth={on ? 2.2 : 1.4} />
                <circle cx={cx} cy={cy} r={2.4} fill="#e9ecef" />
                <text x={cx} y={cy + 15} textAnchor="middle" fontSize={5.5}
                      fontWeight="700" fill={a.cor}>SMA Ø{a.furo} mm</text>
                <text x={cx} y={cy + 22} textAnchor="middle" fontSize={4.6} fill="#868e96">
                  X={a.x} · Y={a.y} mm
                </text>
                {/* o pigtail entrando e descendo até o DNLCB30 */}
                <path d={`M ${cx} ${cy} L ${cx - 60} ${cy} L ${cx - 60} ${CAIXA.altura - 150}`}
                      fill="none" stroke={a.cor} strokeWidth={1.6}
                      strokeDasharray="4 3" opacity={0.8} />
                <text x={cx - 58} y={cy - 6} fontSize={4.6} fill={a.cor}>
                  pigtail IPEX→SMA 30 cm
                </text>
              </g>
            );
          })}

          {/* componentes */}
          {comps.map(c => {
            const ativo = sel?.id === c.id;
            return (
              <g key={c.id}>
                <rect x={c.x} y={c.y} width={c.largura} height={c.altura} rx={2}
                      fill="#2b3035" stroke={ativo ? '#ffd43b' : c.cor}
                      strokeWidth={ativo ? 2.2 : 1}
                      onClick={() => { setSel(c); setPino(null); }}
                      style={{ cursor: 'pointer' }} />
                <rect x={c.x} y={c.y} width={c.largura} height={5} fill={c.cor} />
                <text x={c.x + c.largura / 2} y={c.y + c.altura / 2 + 2}
                      textAnchor="middle" fontSize={5} fontWeight="700" fill="#e9ecef"
                      onClick={() => { setSel(c); setPino(null); }}
                      style={{ cursor: 'pointer', pointerEvents: 'none' }}>
                  {c.id}
                </text>

                {/* terminais: quadrado com o ID dentro */}
                {c.grupos.flatMap(g => posicoes(c, g).map(p => {
                  if (soUsados && !p.usa) return null;
                  const k = `${c.id}.${g.ref}.${p.nome}`;
                  const on = pino === k;
                  /* O terminal é um RETÂNGULO com o lado comprido entrando na
                     placa — igual à faixa de identificação de um borne real.
                     Assim o ID cabe em pé mesmo com passo apertado. */
                  const vert = g.lado === 'esquerda' || g.lado === 'direita';
                  const estreito = p.passo < 4.4;
                  const curto = Math.min(LADO_T, p.passo - 0.5);
                  const comp = estreito ? 9.5 : curto;    // o lado que entra na placa
                  const rw = vert ? comp : curto;
                  const rh = vert ? curto : comp;
                  const dentro = g.lado === 'cima' ? 1 : g.lado === 'baixo' ? -1 : 0;
                  const dx = vert ? (g.lado === 'esquerda' ? comp / 2 - curto / 2 : curto / 2 - comp / 2) : 0;
                  const rot = estreito && !vert ? (dentro > 0 ? 90 : -90) : 0;
                  return (
                    <g key={k} onClick={e => { e.stopPropagation(); setSel(c); setPino(k); }}
                       style={{ cursor: 'pointer' }}>
                      <rect x={p.x + dx - rw / 2} y={p.y + dentro * (comp - curto) / 2 - rh / 2}
                            width={rw} height={rh} rx={0.4}
                            fill={on ? '#ffd43b' : (p.usa ? '#e9c46a' : '#5c6268')}
                            stroke={on ? '#e8590c' : '#1a1d20'} strokeWidth={on ? 0.7 : 0.25} />
                      {(() => {
                        const cx = p.x + dx;
                        const cy = p.y + dentro * (comp - curto) / 2;
                        const txt = p.nome.replace(/^(GPIO|GPI)\s*/, '').replace(/ ·.*$/, '');
                        return (
                          <text x={cx} y={cy + (rot ? 0 : curto * 0.32)}
                                textAnchor="middle" dominantBaseline={rot ? 'central' : undefined}
                                fontSize={estreito ? 2.6 : curto * 0.58} fontWeight="700"
                                fill={p.usa || on ? '#1a1d20' : '#9aa0a6'}
                                transform={rot ? `rotate(${rot} ${cx} ${cy})` : undefined}
                                style={{ pointerEvents: 'none' }}>
                            {txt}
                          </text>
                        );
                      })()}
                    </g>
                  );
                }))}
              </g>
            );
          })}
        </svg>

        <p style={{ fontSize: 11.5, color: '#868e96', marginTop: 9 }}>
          Quadrado <b style={{ color: '#c9a227' }}>amarelo</b> = terminal usado pelo
          projeto · <b style={{ color: '#5c6268' }}>cinza</b> = existe no componente e
          está livre. Clique num quadrado para ver onde ele vai.
        </p>
      </div>

      <aside style={{ width: 380, background: '#fff', borderLeft: '1px solid #dee2e6',
                      overflowY: 'auto', flexShrink: 0 }}>
        {!sel && (
          <div style={{ padding: 16 }}>
            <h3 style={{ fontSize: 12, margin: '0 0 10px', color: '#868e96',
                         letterSpacing: 0.4 }}>INVENTÁRIO DE TERMINAIS</h3>
            {TRILHOS.map(t => {
              const cs = COMPONENTES.filter(c => c.trilho === t.n);
              const larg = cs.reduce((s, c) => s + c.largura, 0);
              return (
                <div key={t.n} style={{ marginBottom: 13 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1d3557' }}>
                    {t.nome}
                  </div>
                  <div style={{ fontSize: 11, color: '#868e96', marginBottom: 4 }}>
                    {larg} de 360 mm · sobram {360 - larg} mm
                  </div>
                  {cs.map(c => {
                    const ps = c.grupos.flatMap(g => g.pinos);
                    const u = ps.filter(p => p.usa).length;
                    return (
                      <div key={c.id} onClick={() => setSel(c)} style={{
                        fontSize: 11.5, padding: '4px 8px', marginBottom: 2,
                        borderRadius: 4, cursor: 'pointer', background: '#f8f9fa',
                        borderLeft: `3px solid ${c.cor}`, display: 'flex',
                        justifyContent: 'space-between',
                      }}>
                        <span>{c.id}</span>
                        <span style={{ color: u === ps.length ? '#c92a2a' : '#868e96' }}>
                          {u}/{ps.length}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
            <div style={{ padding: 12, background: '#fff5f5', border: '2px solid #ffc9c9',
                          borderRadius: 7, marginBottom: 14 }}>
              <b style={{ fontSize: 12.5, color: '#c92a2a' }}>
                ⚡ {REGRA_SEGREGACAO.titulo}
              </b>
              <div style={{ fontSize: 11.5, color: '#495057', marginTop: 6,
                            lineHeight: 1.55 }}>{REGRA_SEGREGACAO.texto}</div>
              <div style={{ fontSize: 11, marginTop: 8 }}>
                <b style={{ color: '#1971c2' }}>Quem sofre (canaleta azul)</b>
                <ul style={{ margin: '3px 0 0', paddingLeft: 16, color: '#495057',
                             lineHeight: 1.5 }}>
                  {REGRA_SEGREGACAO.quemSofre.map(t => <li key={t}>{t}</li>)}
                </ul>
              </div>
              <div style={{ fontSize: 11, marginTop: 7 }}>
                <b style={{ color: '#e03131' }}>Quem polui (canaleta vermelha)</b>
                <ul style={{ margin: '3px 0 0', paddingLeft: 16, color: '#495057',
                             lineHeight: 1.5 }}>
                  {REGRA_SEGREGACAO.quemPolui.map(t => <li key={t}>{t}</li>)}
                </ul>
              </div>
              <ul style={{ margin: '8px 0 0', paddingLeft: 16, fontSize: 11,
                           color: '#343a40', lineHeight: 1.55 }}>
                {REGRA_SEGREGACAO.regras.map(t => <li key={t}>{t}</li>)}
              </ul>
            </div>

            <div style={{ fontSize: 12, fontWeight: 700, color: '#1d3557',
                          marginBottom: 5 }}>
              🔌 FIAÇÃO — {FIOS.length} FIOS
            </div>
            <div style={{ fontSize: 11, color: '#495057', lineHeight: 1.5,
                          marginBottom: 7 }}>
              Cinco condutores entram pela <b>base</b>, todos pela canaleta de
              potência: <code>CH-base → CV-esq → CH-2x1</code>.
            </div>
            {FIOS.filter(f => !etapa || f.etapa === etapa).map(f => {
              const on = fio === f.n;
              return (
                <div key={f.n} onClick={() => setFio(on ? null : f.n)} style={{
                  display: 'flex', gap: 7, alignItems: 'center', cursor: 'pointer',
                  padding: '5px 8px', marginBottom: 3, borderRadius: 4,
                  background: on ? '#fff3bf' : '#f8f9fa',
                  borderLeft: `4px solid ${f.cor}` }}>
                  <b style={{ fontSize: 11, fontFamily: 'monospace',
                              minWidth: 18 }}>{f.n}</b>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 600 }}>{f.nome}</div>
                    <div style={{ fontSize: 10, color: '#868e96',
                                  fontFamily: 'monospace' }}>
                      {f.de.prensa ?? `${f.de.comp}.${f.de.via}`} →{' '}
                      {f.para.comp}.{f.para.via} · {f.mm2} mm²
                    </div>
                  </div>
                </div>
              );
            })}
            {fio && (() => {
              const f = FIOS.find(x => x.n === fio);
              return (
                <div style={{ background: '#fffbe6', border: '1px solid #f5a524',
                              borderRadius: 5, padding: 9, marginBottom: 10,
                              fontSize: 11.5, lineHeight: 1.55 }}>
                  <b>{f.nome}</b> · {f.corNome}
                  <div style={{ marginTop: 4 }}>{f.diz}</div>
                  <div style={{ marginTop: 5, paddingTop: 5,
                                borderTop: '1px solid #f5a52444' }}>{f.porque}</div>
                  {f.aviso && (
                    <div style={{ marginTop: 5, color: '#c92a2a' }}>{f.aviso}</div>
                  )}
                  <div style={{ marginTop: 5, fontFamily: 'monospace', fontSize: 10,
                                color: '#495057' }}>{f.rota.join(' → ')}</div>
                </div>
              );
            })()}
            <div style={{ fontSize: 10.5, color: '#868e96', marginBottom: 13 }}>
              próximas etapas: {ETAPAS.filter(e => !e.feito).map(e => e.nome).join(' · ')}
            </div>

            <div style={{ fontSize: 12, fontWeight: 700, color: '#1d3557' }}>PORTA</div>
            {COMPONENTES.filter(c => c.porta).map(c => {
              const ps = c.grupos.flatMap(g => g.pinos);
              return (
                <div key={c.id} onClick={() => setSel(c)} style={{
                  fontSize: 11.5, padding: '4px 8px', marginBottom: 2, borderRadius: 4,
                  cursor: 'pointer', background: '#f8f9fa',
                  borderLeft: `3px solid ${c.cor}`, display: 'flex',
                  justifyContent: 'space-between',
                }}>
                  <span>{c.id}</span>
                  <span style={{ color: '#868e96' }}>
                    {ps.filter(p => p.usa).length}/{ps.length}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {sel && (
          <>
            <div style={{ background: sel.cor, color: '#fff', padding: '13px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <b style={{ fontSize: 15 }}>{sel.nome}</b>
                <button onClick={() => { setSel(null); setPino(null); }} style={{
                  background: '#ffffff33', color: '#fff', border: 'none', borderRadius: 5,
                  width: 25, height: 25, cursor: 'pointer' }}>×</button>
              </div>
              <div style={{ fontSize: 11, opacity: 0.9, marginTop: 3 }}>
                {sel.grupos
                  ? <>{sel.largura} × {sel.altura} mm ·{' '}
                      {sel.grupos.flatMap(g => g.pinos).filter(p => p.usa).length} de{' '}
                      {sel.grupos.flatMap(g => g.pinos).length} terminais em uso</>
                  : `lateral ${sel.face} · furo Ø ${sel.furo} mm`}
              </div>
            </div>
            <div style={{ padding: '12px 16px' }}>
              {sel.aConferir && (
                <div style={{ fontSize: 11.5, color: '#7a5c00', background: '#fff9db',
                              border: '2px solid #ffe066', borderRadius: 6,
                              padding: '9px 11px', marginBottom: 11, lineHeight: 1.5 }}>
                  🔎 <b>A conferir:</b> {sel.aConferir}
                </div>
              )}
              {sel.nota && (
                <div style={{ fontSize: 12, color: '#495057', lineHeight: 1.55,
                              marginBottom: 12 }}>{sel.nota}</div>
              )}
              {sel.interno && (
                <div style={{ fontSize: 11.5, color: '#5f3dc4', background: '#f3f0ff',
                              border: '1px solid #d0bfff', borderRadius: 6,
                              padding: '9px 11px', marginBottom: 12, lineHeight: 1.5 }}>
                  🔧 <b>Soldado dentro da placa</b> — não tem borne:<br />{sel.interno}
                </div>
              )}
              {PLACAS[sel.id] && (
                <button onClick={() => setPlaca(PLACAS[sel.id])} style={{
                  display: 'block', width: '100%', marginBottom: 13, cursor: 'pointer',
                  background: PLACAS[sel.id].tipo === 'ilhada' ? '#5f3dc4' : '#1d3557',
                  color: '#fff', border: 'none', borderRadius: 7, padding: '11px 12px',
                  textAlign: 'left',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>
                    {PLACAS[sel.id].tipo === 'ilhada'
                      ? '🔧 Ver a placa e como soldar'
                      : '🔍 Ver o módulo e a pinagem real'}
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.82, marginTop: 2 }}>
                    {PLACAS[sel.id].rotulo}
                  </div>
                </button>
              )}
              {sel.onde && (
                <div style={{ fontSize: 12, color: '#495057', lineHeight: 1.55,
                              marginBottom: 10 }}>
                  <b>Onde:</b> {sel.onde}
                </div>
              )}
              {sel.porque && (
                <div style={{ fontSize: 12, background: '#fff5f5', border: '1px solid #ffc9c9',
                              borderRadius: 6, padding: '9px 11px', marginBottom: 12,
                              lineHeight: 1.55, color: '#c92a2a' }}>{sel.porque}</div>
              )}
              {(sel.grupos ?? []).map(g => (
                <div key={g.ref} style={{ marginBottom: 13 }}>
                  <div style={{ fontSize: 11, color: '#868e96', marginBottom: 5 }}>
                    <b style={{ color: '#212529' }}>{g.ref}</b> · {g.legenda} ·{' '}
                    borda {g.lado}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    {g.pinos.map((p, i) => {
                      const k = `${sel.id}.${g.ref}.${p.nome}`;
                      const on = pino === k;
                      return (
                        <button key={i} onClick={() => setPino(on ? null : k)}
                          title={p.para ?? 'livre'}
                          style={{
                            fontSize: 10, padding: '3px 5px', borderRadius: 3,
                            cursor: 'pointer', fontFamily: 'monospace',
                            border: `1px solid ${on ? '#e8590c' : '#ced4da'}`,
                            background: on ? '#ffd43b' : (p.usa ? '#fff3bf' : '#f1f3f5'),
                            color: p.usa ? '#212529' : '#adb5bd',
                            fontWeight: p.usa ? 700 : 400,
                          }}>{p.nome}</button>
                      );
                    })}
                  </div>
                  {g.pinos.some(p => pino === `${sel.id}.${g.ref}.${p.nome}`) && (() => {
                    const p = g.pinos.find(x => pino === `${sel.id}.${g.ref}.${x.nome}`);
                    return (
                      <div style={{ marginTop: 7, padding: '8px 10px', borderRadius: 5,
                                    background: p.usa ? '#fff9db' : '#f1f3f5',
                                    border: `1px solid ${p.usa ? '#ffe066' : '#dee2e6'}`,
                                    fontSize: 11.5, lineHeight: 1.5 }}>
                        <b>{p.nome}</b>{' '}
                        {p.usa
                          ? <>→ <span style={{ color: '#7a5c00' }}>{p.para}</span></>
                          : <span style={{ color: '#868e96' }}>— livre, sem uso no projeto</span>}
                      </div>
                    );
                  })()}
                </div>
              ))}
              {sel.avisos?.map((a, i) => (
                <div key={i} style={{ fontSize: 11.5, lineHeight: 1.55, padding: '9px 11px',
                                      borderRadius: 6, marginBottom: 7,
                                      background: a.startsWith('🔥') || a.startsWith('⚠️')
                                        ? '#fff5f5' : '#f8f9fa',
                                      color: a.startsWith('🔥') || a.startsWith('⚠️')
                                        ? '#c92a2a' : '#343a40' }}>{a}</div>
              ))}
            </div>
          </>
        )}
      </aside>

      {/* ── a placa, em tela cheia ── */}
      {placa && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 150, background: '#eef1f5' }}>
          {placa.tipo === 'ilhada' ? (
            <PlacaIlhada dados={placa.dados} titulo={placa.titulo}
                         onFechar={() => setPlaca(null)} />
          ) : (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ background: '#1d3557', color: '#fff', padding: '12px 16px',
                            display: 'flex', justifyContent: 'space-between',
                            alignItems: 'center', flexShrink: 0 }}>
                <b style={{ fontSize: 15 }}>
                  {PINAGENS[placa.chave]?.nome ?? placa.chave} · módulo comprado
                </b>
                <button onClick={() => setPlaca(null)} style={{
                  background: '#ffffff33', color: '#fff', border: 'none', borderRadius: 5,
                  width: 26, height: 26, cursor: 'pointer' }}>×</button>
              </div>
              <div style={{ flex: 1, overflow: 'auto' }}>
                <PlacaReal chave={placa.chave} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
