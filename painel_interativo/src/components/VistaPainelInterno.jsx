import { useState, useMemo, useRef } from 'react';
import ConjuntoRele from './ConjuntoRele';
import BorneDeFiltro from './BorneDeFiltro';
import PlacaReal from './PlacaReal';
import { PINAGENS } from '../data/pinagens';
import { PRENSAS_PAINEL, FIOS, ETAPAS, CORES } from '../data/fiacao';
import CamaraNoPainel from './CamaraNoPainel';
import { ROTAS_CAMARA, COMPONENTES as PECAS_CAMARA, TAMPA3D } from '../data/camara';
import { SUBIDAS, naTampa } from '../lib/rota_camara';
import {
  geoTerminal, posicoes, comporPainel, foraDoPainel, tracarFio, setaEm,
  LADO_T, COMP_T,
} from '../lib/geometria_painel';
import { conferePrensa } from '../lib/prensas';

/* Quais componentes do painel têm desenho de placa, e qual.
   'ilhada' = placa que VOCÊ monta furo por furo.
   'real'   = módulo comprado, desenhado a partir da foto.        */
const PLACAS = {
  BTS1: { tipo: 'real', chave: 'BTS1', rotulo: 'módulo comprado — pinagem tirada da foto' },
  BTS2: { tipo: 'real', chave: 'BTS1', rotulo: 'módulo comprado — igual ao BTS #1' },
  ESP32:{ tipo: 'real', chave: 'ESP32', rotulo: 'placa DNLCB30 — 32 bornes de parafuso' },
  HMI:  { tipo: 'real', chave: 'HMI',  rotulo: 'tela ES3C28P — conectores e área útil' },
  CONV: { tipo: 'real', chave: 'CONV', rotulo: 'conversor de nível — 2 canais' },
  /* ⭐ 'rele' = não é placa nem módulo comprado: é um borne com componente
     pendurado nele. O D1 e os pull-downs não apareciam em vista nenhuma
     do painel, porque a vista do painel só sabe desenhar FIO. */
  KM1:  { tipo: 'rele', comp: 'KM1',  rotulo: 'a base, o selo e o diodo D1 da bobina' },
  KA123: { tipo: 'rele', comp: 'KA123', rotulo: 'os 3 canais, os pull-downs R10/R11/R12 e os diodos D2 e D3' },
  /* ⭐ 'borne' = três bornes de passagem e dois capacitores parafusados
     neles. Não é placa nem módulo comprado, e era o único item da lista
     que ninguém conseguia imaginar olhando "BS-1 · 3/3 terminais". */
  'BS-1': { tipo: 'borne', comp: 'BS-1',
            rotulo: 'os 3 bornes, os 2 capacitores e quem entra em cada parafuso' },
};
import {
  CAIXA, PLACA, TRILHOS, COMPONENTES, CANALETAS, CANALETAS_PORTA, LATERAIS,
  REGRA_SEGREGACAO, TRILHO_X0, TRILHO_X1, CALHAS,
} from '../data/painel_completo';

/* O painel visto de frente, com a porta aberta ao lado.
   Cada terminal é um quadrado com o ID dentro, na borda onde ele fica
   de verdade no componente. Tudo em milímetros.                        */

/* ⭐ A geometria saiu daqui para src/lib/geometria_painel.js — o
   desenho e os validadores precisam responder a mesma coisa quando
   perguntados "onde termina este fio?". */

export default function VistaPainelInterno() {
  const [sel, setSel] = useState(null);      // componente
  const [pino, setPino] = useState(null);    // terminal
  const [zoom, setZoom] = useState(3.0);
  const [soUsados, setSoUsados] = useState(false);
  const [placa, setPlaca] = useState(null);   // desenho da placa em tela cheia
  const [verFiacao, setVerFiacao] = useState(true);
  const [tampaFechada, setTampa] = useState(false);
  const [pecaCam, setPecaCam] = useState(null);
  const [fio, setFio] = useState(null);
  const [etapa, setEtapa] = useState(0);   // 0 = todas
  const rolagem = useRef(null);
  const desenho = useRef(null);   // o <svg>, para saber onde um ponto caiu na tela
  const arrasto = useRef(null);   // pan com o botao do meio

  /* ⭐ O BOTAO DO MEIO ARRASTA O DESENHO — e, mais importante, DEIXA DE
     ligar o auto-scroll do Windows. Sem o preventDefault aqui, apertar a
     rodinha abre aquele alvo de setas que rola a pagina sozinha: com o
     desenho em 3x, dentro de um container que rola, isso vira bagunca
     imediata. Aqui a rodinha vira uma ferramenta: segura e arrasta. */
  const aoApertar = e => {
    if (e.button !== 1) return;
    e.preventDefault();
    const el = rolagem.current;
    if (!el) return;
    arrasto.current = { x: e.clientX, y: e.clientY, sl: el.scrollLeft, st: el.scrollTop };
    el.style.cursor = 'grabbing';
  };
  const aoMover = e => {
    const a = arrasto.current, el = rolagem.current;
    if (!a || !el) return;
    el.scrollLeft = a.sl - (e.clientX - a.x);
    el.scrollTop  = a.st - (e.clientY - a.y);
  };
  const aoSoltar = () => {
    arrasto.current = null;
    if (rolagem.current) rolagem.current.style.cursor = '';
  };

  /* posiciona cada componente no seu trilho */
  const comps = useMemo(() => comporPainel(CAIXA.largura + 40), []);

  /* ⭐ O caminho de cada fio, andando pela LINHA DE CENTRO das canaletas
     da rota. Horizontal manda no Y, vertical manda no X.

     A porta é outro plano: as canaletas dela têm coordenadas próprias,
     e o pulo de um plano para o outro é a PASSAGEM FLEXÍVEL — desenhada
     como um laço, que é como o chicote fica de verdade. */
  const PORTA_X0 = CAIXA.largura + 40;
  const tracados = useMemo(
    () => FIOS.map((f, i) => tracarFio(f, comps, i, PORTA_X0)), [comps, PORTA_X0]);

  /* ⭐ CLICAR NUM FIO TEM DE MOSTRAR O FIO. Com zoom de 3x o desenho tem
     ~3700 px de largura para uma janela de ~1200: dois tercos dele estao
     fora da vista. Selecionar um fio apaga todos os outros — se o
     escolhido estava fora da tela, o que sobra na tela e' um retangulo
     vazio, e parece que o aplicativo quebrou. Entao a vista vai ate ele. */
  const centralizaFio = n => {
    const t = tracados.find(x => x.n === n);
    const el = rolagem.current, svg = desenho.current;
    if (!t?.pts?.length || !el || !svg) return;

    const xs = t.pts.map(p => p[0]), ys = t.pts.map(p => p[1]);
    let xa = Math.min(...xs), xb = Math.max(...xs);
    let ya = Math.min(...ys), yb = Math.max(...ys);

    /* ⭐ FIO QUE ATRAVESSA A PAREDE: o enquadramento inclui a CÂMARA.
       Um cabo da etapa 6 só se entende vendo as duas pontas — o borne no
       painel e a peça lá dentro. Enquadrar só o trecho do painel deixava
       a metade que interessa fora da tela, e a câmara acesa sem ninguém
       para ver. Aqui a vista abre até caber o conjunto. */
    const atravessa = t.saiDoPainel || t.entraNoPainel;
    if (atravessa) {
      xb = Math.max(xb, CAM_X + CAM_W);
      ya = Math.min(ya, CAM_Y);
      yb = Math.max(yb, CAM_Y + CAM_H);
    }

    const larg = xb - xa + 90, alt = yb - ya + 90;
    const cabe = Math.min(el.clientWidth / larg, el.clientHeight / alt);
    /* só AFASTA para caber; nunca aproxima sozinho por cima da escolha
       de quem está olhando */
    const novoZoom = Math.max(1.2, Math.min(zoom, cabe));
    if (novoZoom !== zoom) setZoom(novoZoom);

    const cx = (xa + xb) / 2, cy = (ya + yb) / 2;
    const irPara = () => {
      const r = svg.getBoundingClientRect(), c = el.getBoundingClientRect();
      /* a escala real sai do proprio desenho: o viewBox comeca em
         (-14, -52) e tem (larguraTotal + 34) de largura */
      const escala = r.width / (larguraTotal + 34);
      el.scrollBy({
        left: (r.left + (cx + 14) * escala) - (c.left + c.width / 2),
        top:  (r.top + (cy + 52) * escala) - (c.top + c.height / 2),
        behavior: 'smooth',
      });
    };
    requestAnimationFrame(() => requestAnimationFrame(irPara));
  };

  /* um lugar so' para escolher fio: o desenho, a lista e a camara usam este */
  const escolheFio = n => {
    setFio(n);
    setSel(null);
    if (n != null) requestAnimationFrame(() => centralizaFio(n));
  };

  /* ⭐ CLICAR NUM TERMINAL É CLICAR NO FIO QUE SAI DELE.
     Antes o clique num borne abria a ficha do COMPONENTE, e quem queria
     saber "para onde vai este terminal?" tinha de achar o fio no meio do
     desenho. Agora o terminal acende o proprio trajeto.
     ⚠ Terminal com mais de um fio (ponte, barramento) CICLA entre eles a
     cada clique; terminal sem fio nenhum volta a abrir o componente. */
  const aoClicarTerminal = (c, g, p, k) => {
    const doPino = FIOS.filter(f =>
      (f.de.comp === c.id && f.de.via === p.nome) ||
      (f.para.comp === c.id && f.para.via === p.nome));
    if (!doPino.length) { setFio(null); setSel(c); setPino(k); return; }
    const atual = doPino.findIndex(f => f.n === fio);
    escolheFio(doPino[(atual + 1) % doPino.length].n);
  };

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

  const PORTA_X = CAIXA.largura + 40, PORTA_W = 250;
  /* ⭐ Com a tampa FECHADA a porta some do desenho e a câmara encosta
     no painel — que é como a bancada fica de verdade. */
  const CAM_X = tampaFechada ? CAIXA.largura + 90 : PORTA_X + PORTA_W + 60;
  const CAM_W = 330, CAM_Y = 26, CAM_H = 420;
  const larguraTotal = CAM_X + CAM_W + 56;

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <div ref={rolagem} onWheel={aoRolar}
           onMouseDown={aoApertar} onMouseMove={aoMover}
           onMouseUp={aoSoltar} onMouseLeave={aoSoltar}
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
          {/* ⭐ "etapa 6" não dizia nada. O nome da etapa está no dado —
              é só usá-lo, e aí o botão vira uma pergunta que o aluno
              tem: "o que vai para a câmara?" */}
          {verFiacao && ETAPAS.filter(e => e.feito).map(e => {
            const n = FIOS.filter(f => f.etapa === e.n).length;
            return (
              <button key={e.n} title={`${e.nome} · ${n} fios`}
                onClick={() => setEtapa(etapa === e.n ? 0 : e.n)} style={{
                  background: etapa === e.n ? '#f59f00' : '#fff',
                  color: etapa === e.n ? '#fff' : '#8a5a00', border: '2px solid #f59f00',
                  borderRadius: 6, padding: '5px 9px', cursor: 'pointer',
                  fontSize: 11, fontWeight: 700 }}>
                {e.n === 6 ? '❄️ câmara' : `${e.n}. ${e.nome.split(' —')[0].toLowerCase()}`}
                <span style={{ opacity: 0.6, marginLeft: 4 }}>{n}</span>
              </button>
            );
          })}
          <button onClick={() => setTampa(!tampaFechada)} style={{
            background: tampaFechada ? '#212529' : '#fff',
            color: tampaFechada ? '#fff' : '#212529', border: '2px solid #212529',
            borderRadius: 6, padding: '5px 11px', cursor: 'pointer',
            fontSize: 11.5, fontWeight: 700 }}>
            {tampaFechada ? '🚪 Abrir a tampa' : '🚪 Fechar a tampa'}
          </button>
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
            {zoom.toFixed(1)}× · 🖱️ role para o zoom · arraste com o botão do meio
          </span>
        </div>

        <svg ref={desenho} width={larguraTotal * zoom}
             viewBox={`-14 -52 ${larguraTotal + 34} ${CAIXA.altura + 190}`}
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

          {/* trilhos DIN */}
          {TRILHOS.map(t => (
            <g key={t.n}>
              <rect x={TRILHO_X0} y={t.y - 5} width={TRILHO_X1 - TRILHO_X0} height={10}
                    rx={1} fill="#b8bcc0" stroke="#868e96" strokeWidth={0.6} />
              <text x={TRILHO_X0 + 2} y={t.y - 38} fontSize={7} fontWeight="700" fill="#8895a6">
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


          {/* ⭐ AS CALHAS DE TRAVESSIA, entre a placa e a porta */}
          {CALHAS.map(k => {
            const pot = k.tipo === 'potencia';
            /* ⭐ cada calha morre DENTRO da sua vertical na porta, e não
               num ponto comum: quem manda é o `entraEm` da própria calha */
            const x0 = CAIXA.largura - 14, x1 = PORTA_X + k.entraEm;
            return (
              <g key={k.id}>
                <rect x={x0} y={k.y} width={x1 - x0} height={k.h} rx={5}
                      fill={pot ? '#ffe3e3' : '#e7f5ff'}
                      stroke={pot ? '#e03131' : '#1971c2'} strokeWidth={1.4} />
                {Array.from({ length: Math.floor((x1 - x0) / 8) }, (_, i) => (
                  <path key={i} d={`M ${x0 + 5 + i * 8} ${k.y + 2}
                                    q 3 ${k.h / 2} 0 ${k.h - 4}`}
                        fill="none" stroke={pot ? '#ffa8a8' : '#a5d8ff'}
                        strokeWidth={1} />
                ))}
                <text x={(x0 + x1) / 2} y={k.y - 3} textAnchor="middle" fontSize={6}
                      fontWeight="700" fill={pot ? '#e03131' : '#1971c2'}>
                  {k.id} · {k.nome}
                </text>
                <text x={(x0 + x1) / 2} y={k.y + k.h + 7} textAnchor="middle"
                      fontSize={5} fill="#868e96">
                  espiral · folga de 60 mm · {k.daPlaca} ↔ {k.naPorta}
                </text>
              </g>
            );
          })}

          {/* ⭐ A ANTENA, colada no ALTO da lateral direita do próprio
              painel — não numa faixa separada. É onde ela fica de verdade. */}
          {LATERAIS.map(a => {
            const ax = CAIXA.largura, ay = CAIXA.altura - a.y;
            const on = sel?.id === a.id;
            return (
              <g key={a.id} onClick={() => { setSel(a); setPino(null); }}
                 style={{ cursor: 'pointer' }}>
                <line x1={ax} y1={ay} x2={ax + 44} y2={ay - 60} stroke={a.cor}
                      strokeWidth={on ? 5.5 : 3.6} strokeLinecap="round" />
                <circle cx={ax + 44} cy={ay - 60} r={3.4} fill={a.cor} />
                <circle cx={ax} cy={ay} r={on ? 8 : 6.5} fill="#495057"
                        stroke={on ? '#ffd43b' : a.cor} strokeWidth={on ? 2.4 : 1.5} />
                <circle cx={ax} cy={ay} r={2.4} fill="#e9ecef" />
                <text x={ax + 50} y={ay - 62} fontSize={6.5} fontWeight="700"
                      fill={a.cor}>ANTENA 3 dBi</text>
                <text x={ax + 50} y={ay - 53} fontSize={5.4} fill="#868e96">
                  SMA de painel Ø {a.furo} mm · Y = {a.y} mm
                </text>
                <text x={ax + 50} y={ay - 45} fontSize={5.4} fill="#e8590c">
                  do lado de FORA da gaiola de Faraday
                </text>
                <path d={`M ${ax} ${ay} L ${ax - 24} ${ay} L ${ax - 24} 258`}
                      fill="none" stroke={a.cor} strokeWidth={1.5}
                      strokeDasharray="4 3" opacity={0.8} />
                <text x={ax - 22} y={ay - 5} fontSize={5} fill={a.cor}>
                  pigtail IPEX→SMA 30 cm, por dentro
                </text>
              </g>
            );
          })}

          {/* ── ⭐ A CÂMARA FRIA, e os cabos indo até ela por BAIXO ── */}
          <CamaraNoPainel x0={CAM_X} y0={CAM_Y} largura={CAM_W} altura={CAM_H}
                          sel={pecaCam} onSel={setPecaCam}
                          fio={fio} onFio={escolheFio}
                          apagado={!!etapa && etapa !== 6} temFioEscolhido={!!fio} />
          {/* ── ⭐ OS CORREDORES SOB A BANCADA ────────────────────────
                 Estavam em quatro linhas de 18 px com as legendas se
                 cobrindo. Agora cada prensa-cabo tem um TRONCO só, largo
                 e numa faixa própria, que só se divide em dois quando já
                 chegou na câmara: o que ENTRA pela parede e o que sobe
                 POR FORA até a tampa.

                 ⚠️ O CRUZAMENTO NO MEIO NÃO TEM COMO SUMIR. O furo de
                 potência fica à esquerda (X=230) e sobe do lado ESQUERDO
                 da câmara; o de sinal fica à direita (X=470) e sobe do
                 lado DIREITO. Um passa pelo outro, e pronto. O que dá
                 para escolher é COMO: os dois se cruzam em 90°, nunca
                 correm lado a lado, e quem passa por cima é a medição —
                 a mesma regra de dentro da câmara.                   ── */}
          {(() => {
            const sub = SUBIDAS(CAM_X, CAM_Y, CAM_W, CAM_H);
            const seis = FIOS.filter(f => f.etapa === 6);
            /* o de sinal corre na faixa de CIMA e o de potência na de
               baixo: assim o tronco da potência não cruza a descida do
               sinal, e sobra um cruzamento só em vez de quatro */
            const feixes = [
              { pid: 'PG9-3', pc: 'PC-2', cor: '#1971c2', fundo: '#e7f5ff',
                lane: CAIXA.altura + 56, tampa: 'tampaD', pulaEm: [] },
              { pid: 'PG13-2', pc: 'PC-1', cor: '#c92a2a', fundo: '#fff5f5',
                lane: CAIXA.altura + 104, tampa: 'tampaE', pulaEm: [] },
            ];
            /* a medição salta por cima das duas subidas da potência */
            feixes[0].pulaEm = [sub.tampaE.x, sub['PC-1'].x];
            const HOP = 5;
            return feixes.map(fx => {
              const pr = PRENSAS_PAINEL.find(p => p.id === fx.pid);
              const su = sub[fx.pc], st = sub[fx.tampa];
              const nPc = Object.values(ROTAS_CAMARA).filter(r => r.pc === fx.pc).length;
              const naT = seis.filter(f => naTampa(f) && f.prensa === fx.pid);
              const dir = Math.sign(su.x - pr.x) || 1;

              /* o tronco, com o pulinho onde ele passa por cima de outro */
              let tronco = `M ${pr.x} ${CAIXA.altura + 3} L ${pr.x} ${fx.lane}`;
              for (const hx of [...fx.pulaEm].sort((a, b) => (a - b) * dir)) {
                tronco += ` L ${hx - HOP * dir} ${fx.lane}`
                        + ` A ${HOP} ${HOP} 0 0 ${dir > 0 ? 0 : 1} `
                        + `${hx + HOP * dir} ${fx.lane}`;
              }
              tronco += ` L ${su.x} ${fx.lane}`;
              const dPc = `M ${su.x} ${fx.lane} L ${su.x} ${su.y} L ${su.borda} ${su.y}`;
              const dT = `M ${su.x} ${fx.lane} L ${st.x} ${fx.lane} `
                       + `L ${st.x} ${st.y + 6}`;
              return (
                <g key={fx.pid}>
                  {/* a faixa é a bancada vista de lado: o cabo corre por
                      baixo dela, e não solto no ar */}
                  <rect x={Math.min(pr.x, st.x) - 24} y={fx.lane - 15}
                        width={Math.abs(st.x - pr.x) + 48} height={30} rx={4}
                        fill={fx.fundo} stroke={fx.cor} strokeWidth={0.7}
                        strokeDasharray="4 3" opacity={0.8} />
                  <text x={pr.x - 20} y={fx.lane - 6} fontSize={6.6} fontWeight="700"
                        fill={fx.cor}>{fx.pid} · POR BAIXO DA BANCADA</text>

                  {[tronco, dPc, dT].map((d, i) => (
                    <g key={i}>
                      <path d={d} fill="none" stroke="#fff"
                            strokeWidth={i === 2 ? 6 : 8}
                            strokeLinejoin="round" strokeLinecap="round" />
                      <path d={d} fill="none"
                            stroke={i === 2 ? '#e8590c' : fx.cor}
                            strokeWidth={i === 2 ? 2.8 : 4.5}
                            strokeLinejoin="round" strokeLinecap="round" />
                    </g>
                  ))}

                  <text x={(pr.x + su.x) / 2} y={fx.lane - 5} textAnchor="middle"
                        fontSize={7.4} fontWeight="700" fill={fx.cor}>
                    {nPc} fios ──► entram pelo {fx.pc}
                  </text>
                  <text x={(su.x + st.x) / 2} y={fx.lane + 11} textAnchor="middle"
                        fontSize={6.2} fontWeight="700" fill="#e8590c">
                    {naT.map(f => f.n).join(' ')} ▲ por FORA, até a tampa
                  </text>
                </g>
              );
            });
          })()}

          {/* ── a tampa fechada, vista de fora ── */}
          {tampaFechada && (
            <g>
              <rect x={-3} y={-3} width={CAIXA.largura + 6} height={CAIXA.altura + 6}
                    rx={5} fill="#dee2e6" stroke="#495057" strokeWidth={3} />
              {COMPONENTES.filter(c => c.porta).map(c => (
                <g key={c.id}>
                  <rect x={CAIXA.largura - c.x - c.largura} y={c.y} width={c.largura}
                        height={c.altura} rx={c.id === 'S0' ? 22 : 4}
                        fill={c.cor} stroke="#212529" strokeWidth={1.2} opacity={0.9} />
                  <text x={CAIXA.largura - c.x - c.largura / 2} y={c.y + c.altura + 8}
                        textAnchor="middle" fontSize={6} fill="#212529">{c.id}</text>
                </g>
              ))}
              <text x={CAIXA.largura / 2} y={20} textAnchor="middle" fontSize={11}
                    fontWeight="700" fill="#212529">TAMPA FECHADA — vista de fora</text>
              <text x={CAIXA.largura / 2} y={CAIXA.altura - 8} textAnchor="middle"
                    fontSize={6.5} fill="#495057">
                espelhada em relação à vista de dentro: a dobradiça continua à direita
              </text>
            </g>
          )}

          {/* ⭐ A FIAÇÃO, por etapas. Fica depois da porta e da câmara para
              não ser encoberta por elas, e antes dos componentes para
              morrer atrás deles, nos terminais. */}
          {verFiacao && tracados
            .filter(t => t.pts.length && (!etapa || t.etapa === etapa))
            .filter(t => !tampaFechada || ![t.de.comp, t.para.comp]
              .some(c => COMPONENTES.find(x => x.id === c)?.porta))
            .map(t => {
            const on = !fio || fio === t.n;
            const pts = t.pts.map(p => p.join(',')).join(' ');
            const m = t.pts[Math.floor(t.pts.length / 2)];
            return (
              /* ⭐ COM UM FIO ESCOLHIDO, OS OUTROS SOMEM — nao ficam
                 esmaecidos. Com 108 fios sobrepostos, "meio transparente"
                 ainda e' um emaranhado: o unico jeito de LER um trajeto e'
                 a tela ficar so' com ele. E fio invisivel nao pode roubar
                 clique, dai o pointerEvents. */
              <g key={t.n} onClick={() => escolheFio(fio === t.n ? null : t.n)}
                 style={{ cursor: 'pointer' }} opacity={on ? 1 : 0}
                 pointerEvents={on ? 'auto' : 'none'}>
                <polyline points={pts} fill="none" stroke="transparent" strokeWidth={6} />
                <polyline points={pts} fill="none" stroke="#fff"
                          strokeWidth={fio === t.n ? 3.4 : 2.2}
                          strokeLinejoin="round" strokeLinecap="round" opacity={0.85} />
                <polyline points={pts} fill="none" stroke={t.cor}
                          strokeWidth={fio === t.n ? 2.0 : 1.1}
                          strokeLinejoin="round" strokeLinecap="round" />
                {/* ⭐ SETA SÓ NO QUE ATRAVESSA A PAREDE: é aí que "ida" e
                    "volta" querem dizer alguma coisa. Ela aponta no
                    sentido em que o fio anda, do painel para a câmara ou
                    da câmara para o painel. */}
                {(t.saiDoPainel || t.entraNoPainel) && [0.35, 0.72].map(fr => {
                  const a = setaEm(t.pts, fr);
                  return a && (
                    <polygon key={fr} points="-2.6,-1.9 2.8,0 -2.6,1.9" fill={t.cor}
                             stroke="#fff" strokeWidth={0.35}
                             transform={`translate(${a.x} ${a.y}) rotate(${a.ang})`} />
                  );
                })}
                {fio === t.n ? (
                  <g>
                    <rect x={m[0] - 9} y={m[1] - 5.5} width={18} height={11} rx={2}
                          fill="#fff" stroke={t.cor} strokeWidth={1.2} />
                    <text x={m[0]} y={m[1] + 3.2} textAnchor="middle" fontSize={7}
                          fontWeight="700" fill={t.cor}>{t.n}</text>
                  </g>
                ) : (
                  <circle cx={m[0]} cy={m[1]} r={1.6} fill={t.cor}
                          stroke="#fff" strokeWidth={0.6} />
                )}
              </g>
            );
          })}
          {/* ── ⭐ OS PRENSA-CABOS, que é por onde o painel conversa com o
                 mundo. Antes eram só uma bolinha por fio, empilhada no mesmo
                 ponto: não dava para contar quantos passavam nem para ver
                 quem sai e quem volta. Agora cada furo é uma porta, com o
                 leque de fios entrando nela e a conta do feixe. ── */}
          {verFiacao && PRENSAS_PAINEL.filter(p => p.face === 'base').map(pr => {
            const fs = FIOS.filter(f => f.prensa === pr.id
              || f.de.prensa === pr.id || f.para.prensa === pr.id);
            const sai = fs.filter(f => foraDoPainel(f.para)).length;
            const entra = fs.filter(f => foraDoPainel(f.de)).length;
            const c = conferePrensa(pr.tipo, fs);
            const larg = Math.max(14, (fs.length - 1) * 2.4 + 7);
            const cor = pr.classe === 'sinal' ? '#1971c2' : '#c92a2a';
            const seta = sai && entra ? '↕' : entra ? '↑' : '↓';
            return (
              <g key={pr.id}>
                {/* a porca sextavada vista de frente, na chapa da base */}
                <rect x={pr.x - larg / 2 - 2.5} y={CAIXA.altura - 1.5}
                      width={larg + 5} height={5} rx={1} fill="#adb5bd" />
                <rect x={pr.x - larg / 2} y={CAIXA.altura + 1} width={larg} height={7}
                      rx={2} fill="#495057" stroke={cor} strokeWidth={1.2} />
                <text x={pr.x} y={CAIXA.altura + 6.4} textAnchor="middle" fontSize={4.6}
                      fontWeight="700" fill="#fff">{seta} {fs.length}</text>
                <text x={pr.x} y={CAIXA.altura + 15} textAnchor="middle" fontSize={5.6}
                      fontWeight="700" fill={cor}>{pr.id}</text>
                <text x={pr.x} y={CAIXA.altura + 21} textAnchor="middle" fontSize={4.4}
                      fill="#868e96">{pr.tipo} · feixe {c.d.toFixed(1)} mm</text>
                <text x={pr.x} y={CAIXA.altura + 26.5} textAnchor="middle" fontSize={4.4}
                      fill={c.ok ? '#2f9e44' : '#e8590c'}>
                  {sai ? `${sai} saem` : ''}{sai && entra ? ' · ' : ''}
                  {entra ? `${entra} voltam` : ''}
                </text>
                <text x={pr.x} y={CAIXA.altura + 32.5} textAnchor="middle" fontSize={4.6}
                      fontWeight="700" fill={cor}>{pr.liga}</text>
              </g>
            );
          })}

          {/* componentes */}
          {comps.filter(c => !(tampaFechada && c.porta)).map(c => {
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
                  const t = geoTerminal(c, g, p);
                  const { vert, curto, comp, dentro, rw, rh } = t;
                  /* a legenda corre ao longo do lado COMPRIDO, sempre —
                     é o único jeito de "J1-11" ou "24V-SRV" caberem dentro */
                  const rot = vert ? 0 : (dentro > 0 ? 90 : -90);
                  return (
                    <g key={k} onClick={e => { e.stopPropagation(); aoClicarTerminal(c, g, p, k); }}
                       style={{ cursor: 'pointer' }}>
                      <rect x={t.cx - rw / 2} y={t.cy - rh / 2}
                            width={rw} height={rh} rx={0.4}
                            fill={on ? '#ffd43b' : (p.usa ? '#e9c46a' : '#5c6268')}
                            stroke={on ? '#e8590c' : '#1a1d20'} strokeWidth={on ? 0.7 : 0.25} />
                      {(() => {
                        const cx = t.cx, cy = t.cy;
                        const txt = p.pino
                          ? `${p.nome}·${p.pino}`
                          : p.nome.replace(/^(GPIO|GPI)\s*/, '').replace(/ ·.*$/, '');
                        return (
                          <text x={cx} y={cy} textAnchor="middle"
                                dominantBaseline="central"
                                fontSize={Math.min(2.7, curto * 0.72,
                                                   comp / (txt.length * 0.62))}
                                fontWeight="700"
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

        <p style={{ fontSize: 11.5, color: '#868e96', marginTop: 9, lineHeight: 1.6 }}>
          Quadrado <b style={{ color: '#c9a227' }}>amarelo</b> = terminal usado pelo
          projeto · <b style={{ color: '#5c6268' }}>cinza</b> = existe no componente e
          está livre. Clique num quadrado para ver onde ele vai.
          <br />
          ▶ <b>A setinha só aparece no fio que atravessa a parede</b>, e aponta no
          sentido em que ele anda: do borne do componente até o prensa-cabo e a câmara
          na <b>ida</b>, e da peça de volta ao componente no <b>retorno</b>. Clique no
          fio em qualquer ponto — ele acende inteiro, dos dois lados da parede.
        </p>
      </div>

      <aside style={{ width: 380, background: '#fff', borderLeft: '1px solid #dee2e6',
                      overflowY: 'auto', flexShrink: 0 }}>
        {/* ⭐ O INVENTÁRIO SAI DE CENA QUANDO UM FIO É ESCOLHIDO. A ficha do
            fio já existia, mas era desenhada DEPOIS do inventário inteiro:
            para ler o trajeto era preciso rolar a lateral ate' o fim, e
            quem clicava num cabo achava que nada tinha acontecido. */}
        {!sel && !fio && (
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
                    {larg} de {TRILHO_X1 - TRILHO_X0} mm · sobram{' '}
                    <b style={{ color: TRILHO_X1 - TRILHO_X0 - larg < 0 ? '#c92a2a' : '#868e96' }}>
                      {TRILHO_X1 - TRILHO_X0 - larg} mm
                    </b>
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
            <div style={{ fontSize: 11, color: '#495057', lineHeight: 1.55,
                          marginBottom: 6 }}>
              <b>Cor = função, anilha = fio.</b> Num painel não existem 24 cores de fio:
              a cor diz que circuito é, o número diz qual fio daquele circuito.
            </div>
            <div style={{ marginBottom: 9 }}>
              {Object.entries(CORES).filter(([k]) =>
                FIOS.some(f => f.func === k)).map(([k, c]) => (
                <div key={k} style={{ display: 'flex', gap: 6, alignItems: 'center',
                                      fontSize: 10.5, marginBottom: 2 }}>
                  <span style={{ width: 16, height: 4, background: c.hex,
                                 borderRadius: 2, flexShrink: 0 }} />
                  <b style={{ minWidth: 62 }}>{c.nome}</b>
                  <span style={{ color: '#868e96' }}>{c.diz}</span>
                </div>
              ))}
            </div>
            {FIOS.filter(f => !etapa || f.etapa === etapa).map(f => {
              const on = fio === f.n;
              return (
                <div key={f.n} onClick={() => escolheFio(on ? null : f.n)} style={{
                  display: 'flex', gap: 7, alignItems: 'center', cursor: 'pointer',
                  padding: '5px 8px', marginBottom: 3, borderRadius: 4,
                  background: on ? '#fff3bf' : '#f8f9fa',
                  borderLeft: `4px solid ${f.cor}` }}
                  title={CORES[f.func].diz}>
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
                  <b>{f.nome ?? f.diz}</b> · {f.corNome}
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

        {fio && !sel && (() => {
          const f = FIOS.find(x => x.n === fio);
          const t = tracados.find(x => x.n === fio);
          const ponta = a => {
            if (a.prensa) {
              const pr = PRENSAS_PAINEL.find(x => x.id === a.prensa);
              return pr ? { titulo: pr.id, sub: pr.nome, det: pr.diz }
                        : { titulo: a.prensa, sub: 'prensa-cabo' };
            }
            /* ⭐ A PONTA PODE NÃO SER DO PAINEL. Os fios da etapa 6 morrem
               DENTRO da câmara (ou em cima da tampa), e lá o terminal se
               chama `borne`, não `via`. Sem este ramo a ficha mostrava
               "undefined · undefined" justamente nos cabos que atravessam a
               parede — os que mais gente clica para entender o trajeto. */
            if (a.camara || a.tampa) {
              const naTampa = !!a.tampa;
              const id = a.camara || a.tampa;
              const pc = naTampa ? TAMPA3D.find(x => x.id === id)
                                 : PECAS_CAMARA.find(x => x.id === id);
              return {
                titulo: `${id} · ${a.borne ?? a.via ?? ''}`.trim(),
                sub: pc?.nome ?? 'peça da câmara',
                det: pc?.diz ?? pc?.onde,
                onde: naTampa ? 'em cima da TAMPA (lado quente)' : 'DENTRO da câmara',
              };
            }
            const c = COMPONENTES.find(x => x.id === a.comp);
            const p = c?.grupos.flatMap(g => g.pinos).find(x => x.nome === a.via);
            const g = c?.grupos.find(gg => gg.pinos.some(x => x.nome === a.via));
            return {
              titulo: `${a.comp} · ${a.via ?? a.borne ?? ''}${p?.pino ? ` (pino ${p.pino})` : ''}`,
              sub: c?.nome, det: p?.para,
              onde: c?.porta ? 'na PORTA' : `trilho ${c?.trilho} · borda ${g?.lado}`,
            };
          };
          const A = ponta(f.de), B = ponta(f.para);
          const mm = t?.pts.length
            ? t.pts.slice(1).reduce((s, p, i) =>
                s + Math.hypot(p[0] - t.pts[i][0], p[1] - t.pts[i][1]), 0) : 0;
          return (
            <>
              <div style={{ background: f.cor, color: '#fff', padding: '13px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <b style={{ fontSize: 16 }}>Fio {f.n} · {f.nome ?? f.diz}</b>
                  <button onClick={() => setFio(null)} style={{
                    background: '#ffffff33', color: '#fff', border: 'none',
                    borderRadius: 5, width: 25, height: 25, cursor: 'pointer' }}>×</button>
                </div>
                <div style={{ fontSize: 11, opacity: 0.92, marginTop: 3 }}>
                  {f.mm2} mm² · {f.corNome} · etapa {f.etapa} ·{' '}
                  {mm ? `≈ ${(mm + 40).toFixed(0)} mm de fio` : 'ponte curta'}
                </div>
              </div>
              <div style={{ padding: '12px 16px' }}>
                {[['⬅ SAI DE', A, '#2f9e44'], ['➡ CHEGA EM', B, '#c92a2a']].map(
                  ([rot, P, cor]) => (
                  <div key={rot} style={{ border: `2px solid ${cor}`, borderRadius: 7,
                                          padding: '9px 11px', marginBottom: 9 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: cor,
                                  letterSpacing: 0.5 }}>{rot}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'monospace',
                                  marginTop: 2 }}>{P.titulo}</div>
                    <div style={{ fontSize: 11.5, color: '#495057' }}>{P.sub}</div>
                    {P.onde && (
                      <div style={{ fontSize: 10.5, color: '#868e96' }}>{P.onde}</div>
                    )}
                    {P.det && (
                      <div style={{ fontSize: 11, color: '#1971c2', marginTop: 4,
                                    lineHeight: 1.45 }}>↳ {P.det}</div>
                    )}
                  </div>
                ))}
                <div style={{ fontSize: 11, color: '#868e96', letterSpacing: 0.4,
                              marginBottom: 3 }}>POR ONDE PASSA</div>
                <div style={{ fontSize: 11.5, fontFamily: 'monospace', background: '#f1f3f5',
                              borderRadius: 5, padding: '7px 9px', marginBottom: 10 }}>
                  {f.rota.length ? f.rota.join(' → ') : 'ponte curta na própria base'}
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.55, color: '#495057' }}>{f.diz}</div>
                {f.porque && (
                  <div style={{ fontSize: 11.5, background: '#e7f5ff', borderRadius: 5,
                                padding: 9, marginTop: 8, lineHeight: 1.5 }}>{f.porque}</div>
                )}
                {f.aviso && (
                  <div style={{ fontSize: 11.5, background: '#fff5f5', borderRadius: 5,
                                padding: 9, marginTop: 8, lineHeight: 1.5,
                                color: '#c92a2a' }}>{f.aviso}</div>
                )}
              </div>
            </>
          );
        })()}

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
              {sel.resumoFuncao && (
                <div style={{ fontSize: 12.5, color: '#0b5563', background: '#e3fafc',
                              border: '2px solid #66d9e8', borderRadius: 6,
                              padding: '10px 12px', marginBottom: 11, lineHeight: 1.55 }}>
                  {sel.resumoFuncao}
                </div>
              )}
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
                  background: PLACAS[sel.id].tipo === 'ilhada' ? '#5f3dc4'
                    : PLACAS[sel.id].tipo === 'rele' ? '#c2410c'
                    : PLACAS[sel.id].tipo === 'borne' ? '#1971c2' : '#1d3557',
                  color: '#fff', border: 'none', borderRadius: 7, padding: '11px 12px',
                  textAlign: 'left',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>
                    {PLACAS[sel.id].tipo === 'ilhada' ? '🔧 Ver a placa e como soldar'
                      : PLACAS[sel.id].tipo === 'rele' ? '🔌 Ver o borne e os componentes nele'
                      : PLACAS[sel.id].tipo === 'borne' ? '🔎 Ver como é o borne e o que entra em cada parafuso'
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
          ) : placa.tipo === 'rele' ? (
            <ConjuntoRele compId={placa.comp} onFechar={() => setPlaca(null)} />
          ) : placa.tipo === 'borne' ? (
            <BorneDeFiltro onFechar={() => setPlaca(null)} />
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
