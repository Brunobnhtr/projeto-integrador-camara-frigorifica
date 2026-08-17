import {
  CAIXA, PLACA, TRILHOS, COMPONENTES, CANALETAS, CANALETAS_PORTA, CALHAS,
} from '../data/painel_completo.js';
import { PRENSAS_PAINEL, FIOS } from '../data/fiacao.js';

/* A geometria do painel: onde cada componente cai no trilho, onde cada
   borne encosta, e onde a ponta de um fio termina.

   ⭐ ESTE ARQUIVO EXISTE PORQUE O DESENHO ESTAVA SOZINHO. Enquanto essas
   contas moravam dentro do componente React, nenhum script conseguia
   perguntar "esse fio chega mesmo em algum lugar?" — e 21 fios da etapa
   6 ficaram com as duas pontas no ar sem ninguém perceber: o dado dizia
   que existiam, a tela simplesmente não os desenhava.                  */

export const PASSO_MIN = 5.4;   // mm entre centros de terminais
export const LADO_T = 4.6;      // mm do lado estreito do terminal
export const GAP_GRUPO = 4;     // mm entre dois blocos de borne da MESMA borda
export const COMP_T = 11.0;     // mm do lado comprido — é nele que a legenda cabe

/* ⭐ A geometria do terminal em UM lugar só. O desenho do retângulo e o
   fim do fio precisam dar exatamente o mesmo ponto — quando cada um
   calculava o seu, o fio parava a milímetros do borne. */
export function geoTerminal(c, g, p) {
  const vert = g.lado === 'esquerda' || g.lado === 'direita';
  const curto = Math.min(LADO_T, p.passo - 0.6);
  const teto = (vert ? c.largura : c.altura) / 2 - 2;
  const comp = Math.max(curto, Math.min(COMP_T, teto));
  const dentro = g.lado === 'cima' ? 1 : g.lado === 'baixo' ? -1 : 0;
  const dx = vert ? (g.lado === 'esquerda' ? comp / 2 - curto / 2 : curto / 2 - comp / 2) : 0;
  return {
    vert, curto, comp, dentro,
    cx: p.x + dx,
    cy: p.y + dentro * (comp - curto) / 2,
    rw: vert ? comp : curto,
    rh: vert ? curto : comp,
  };
}

/* Distribui os terminais de um grupo ao longo da borda que ele ocupa. */
export function posicoes(c, g) {
  const n = g.pinos.length;
  const linhas = g.linhas ?? 1;
  const porLinha = Math.ceil(n / linhas);
  const vert = g.lado === 'esquerda' || g.lado === 'direita';
  const compr = vert ? c.altura : c.largura;

  /* ⭐ DOIS BLOCOS PODEM DIVIDIR A MESMA BORDA. A PI-2 tem o J2 e o J3
     os dois embaixo. Calculando cada grupo centrado na largura inteira,
     eles se sobrepunham — os bornes do J2 caíam em cima dos do J3. Aqui
     a borda é REPARTIDA entre os blocos, proporcional ao nº de vias. */
  const irmaos = c.grupos.filter(x => x.lado === g.lado);
  const idx = irmaos.indexOf(g);
  const porBloco = x => Math.ceil(x.pinos.length / (x.linhas ?? 1));
  const totalPinos = irmaos.reduce((a, x) => a + porBloco(x), 0);
  const antes = irmaos.slice(0, idx).reduce((a, x) => a + porBloco(x), 0);
  const util = compr - 3 - GAP_GRUPO * (irmaos.length - 1);
  const meu = util * (porLinha / totalPinos);
  const base = 1.5 + util * (antes / totalPinos) + GAP_GRUPO * idx;

  const passo = Math.max(2.6, Math.min(PASSO_MIN, meu / porLinha));
  const inicio = base + (meu - (porLinha - 1) * passo) / 2;

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

/* Cada componente no seu trilho — a porta é outro plano, ao lado. */
export function comporPainel(portaX0 = CAIXA.largura + 40) {
  return COMPONENTES.map(c => {
    const t = TRILHOS.find(x => x.n === c.trilho);
    return {
      ...c,
      y: c.porta ? c.y : t.y - c.altura / 2,
      x: c.porta ? portaX0 + c.x : PLACA.x + c.x,
    };
  });
}

/* ── o prensa-cabo como DESTINO de um fio ──────────────────────────────
   ⭐ O QUE FALTAVA: um fio que vai para a câmara tem uma ponta que não é
   componente nenhum — é o furo na base do painel. Sem isso o desenho
   não tinha onde terminar o risco e simplesmente não desenhava nada.

   Os fios se abrem em leque dentro do furo, um ao lado do outro, para
   dar para contar quantos passam por ali e conferir na montagem.      */
export const Y_PRENSA = CAIXA.altura + 2;
const PASSO_PRENSA = 2.4;                 // mm entre fios dentro do furo

/** Ordem de cada fio dentro do prensa-cabo dele, para o leque. */
export const ORDEM_NA_PRENSA = (() => {
  const m = new Map(), conta = new Map();
  for (const f of FIOS) {
    if (!f.prensa) continue;
    const k = conta.get(f.prensa) ?? 0;
    m.set(f.n, k); conta.set(f.prensa, k + 1);
  }
  return { ordem: m, total: conta };
})();

/* os três destinos que não são componente do painel: a câmara, a tampa
   dela e a maquete dos postes. Todos terminam num prensa-cabo. */
export const foraDoPainel = alvo =>
  !!(alvo.camara || alvo.tampa || alvo.maquete || alvo.prensa);

/**
 * Onde a ponta de um fio encosta, em mm do desenho do painel.
 * Devolve `{ p: null }` quando não há onde encostar — e é justamente
 * isso que o validador procura.
 */
export function pontaDoFio(fio, alvo, comps) {
  if (foraDoPainel(alvo)) {
    const id = alvo.prensa ?? fio.prensa;
    const pr = PRENSAS_PAINEL.find(x => x.id === id);
    if (!pr) return { p: null, motivo: `prensa-cabo ${id ?? '(nenhum)'} não existe` };
    const n = ORDEM_NA_PRENSA.total.get(id) ?? 1;
    const k = ORDEM_NA_PRENSA.ordem.get(fio.n) ?? 0;
    const dx = (k - (n - 1) / 2) * PASSO_PRENSA;
    return { p: [pr.x + dx, Y_PRENSA], pr, leque: true };
  }
  const c = comps.find(x => x.id === alvo.comp);
  if (!c) return { p: null, motivo: `componente ${alvo.comp} não existe` };
  const g = c.grupos.find(gg => gg.pinos.some(pp => pp.nome === alvo.via));
  if (!g) return { p: null, motivo: `${alvo.comp} não tem borne chamado ${alvo.via}` };
  const pino = posicoes(c, g).find(pp => pp.nome === alvo.via);
  if (!pino) return { p: null, motivo: `${alvo.comp}.${alvo.via} sem posição` };
  const t = geoTerminal(c, g, pino);
  /* encosta na PONTA do terminal virada para fora, que é onde o
     parafuso fica */
  const fora = t.dentro
    ? [t.cx, t.cy - t.dentro * t.comp / 2]
    : [t.cx + (g.lado === 'esquerda' ? -t.comp / 2 : t.comp / 2), t.cy];
  return { p: fora, lateral: !t.dentro, lado: g.lado, comp: c, grupo: g };
}

/* ── o traçado inteiro, da ponta até a ponta ───────────────────────────
   ⭐ Estava dentro do componente React, e por isso nenhum script podia
   perguntar "esse risco passa por baixo de algum componente?" — que é
   exatamente o erro que some no meio de 120 fios. Agora pergunta.

   O fio anda pela LINHA DE CENTRO das canaletas da rota. Horizontal
   manda no Y, vertical manda no X. A porta é outro plano: as canaletas
   dela têm coordenadas próprias, e o pulo de um plano para o outro é a
   PASSAGEM FLEXÍVEL — desenhada como um laço, que é como o chicote
   fica de verdade.                                                    */

/* ⭐ A travessia acontece DENTRO de uma calha, e a altura sai dela.
   'alim' e 'comum' pegam carona na de potência, que é a mais baixa. */
export const calhaDe = classe =>
  CALHAS.find(k => k.tipo === (classe === 'sinal' ? 'sinal' : 'potencia'));

export function tracarFio(f, comps, idx, portaX0 = CAIXA.largura + 40) {
  const rect = id => {
    const k = [...CANALETAS, ...CANALETAS_PORTA].find(x => x.id === id);
    if (!k) return null;
    return k.id.startsWith('CP-') ? { ...k, x: k.x + portaX0 } : k;
  };
  const desvio = ((idx % 7) - 3) * 3.0;
  const a = pontaDoFio(f, f.de, comps), b = pontaDoFio(f, f.para, comps);
  if (!a.p || !b.p) return { ...f, pts: [], a, b };

  /* a saída de um borne lateral também sai contornando */
  const saiLat = a.lateral ? [a.p[0] + (a.lado === 'esquerda' ? -7 : 7), a.p[1]] : null;
  const pts = [a.p.slice()];
  if (saiLat) pts.push(saiLat);
  let cur = (saiLat ?? a.p).slice();
  let planoAnt = null;
  for (const id of f.rota) {
    const k = rect(id);
    if (!k) continue;
    const plano = id.startsWith('CP-') ? 'porta' : 'placa';
    if (planoAnt && plano !== planoAnt) {
      const cl = calhaDe(f.classe);
      const yP = cl.y + cl.h / 2;
      pts.push([cur[0], yP]);
      pts.push([plano === 'porta' ? portaX0 + 30 : PLACA.x + PLACA.largura - 8, yP]);
      cur = [pts[pts.length - 1][0], yP];
    }
    cur = k.vertical ? [k.x + k.w / 2 + desvio, cur[1]] : [cur[0], k.y + k.h / 2 + desvio];
    pts.push([...cur]);
    planoAnt = plano;
  }
  /* ⭐ A ÚLTIMA PERNA DEPENDE DA BORDA DO BORNE. Borne de cima/baixo se
     aproxima na vertical. Borne de LATERAL se aproxima na horizontal,
     contornando o componente por fora — senão o fio sobe rente à borda
     e some atrás dele. */
  if (b.lateral) {
    const foraX = b.p[0] + (b.lado === 'esquerda' ? -7 : 7);
    pts.push([foraX, cur[1]]);
    pts.push([foraX, b.p[1]]);
  } else {
    pts.push([b.p[0], cur[1]]);
  }
  pts.push(b.p.slice());
  return { ...f, pts, a, b, prensa: a.pr ?? b.pr,
           saiDoPainel: !!b.pr, entraNoPainel: !!a.pr };
}

/** Um ponto a `frac` do caminho, com o ângulo de quem está andando ali.
    ⭐ É o que responde "esse fio está indo ou voltando?" sem precisar
    clicar: a seta aponta do painel para a câmara na ida e ao contrário
    na volta. */
export function setaEm(pts, frac) {
  const seg = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    seg.push(d); total += d;
  }
  if (!total) return null;
  let alvo = total * frac, i = 0;
  while (i < seg.length - 1 && alvo > seg[i]) { alvo -= seg[i]; i++; }
  const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
  const t = seg[i] ? alvo / seg[i] : 0;
  return {
    x: ax + (bx - ax) * t, y: ay + (by - ay) * t,
    ang: Math.atan2(by - ay, bx - ax) * 180 / Math.PI,
  };
}
