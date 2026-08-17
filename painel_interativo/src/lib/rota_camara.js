import { PECAS3D, TAMPA3D, PRENSAS3D, ROTAS_CAMARA } from '../data/camara.js';

/* O caminho do fio dentro da câmara, em milímetros.

   ⭐ ESTE ARQUIVO EXISTE PARA O DESENHO E O VALIDADOR NÃO DISCORDAREM.
   Enquanto cada um montava o caminho por conta própria, a tela mostrava
   um fio bonito e o script conferia outro. Agora os dois chamam a mesma
   função: se o desenho está errado, o script falha junto.              */

/* a escala do desenho da câmara mora aqui para o painel poder mirar
   nos mesmos furos — era isso que faltava: o feixe saía do painel e
   morria na borda, porque o painel não sabia onde ficava o PC-1. */
export const E_CAM = 1.35;      // px por mm
export const MARG_CAM = 26;     // parede + isolamento, em px
export const pxCamara = (x0, y0, altura) => ({
  cx: v => x0 + MARG_CAM + v * E_CAM,
  cy: v => y0 + altura - MARG_CAM - v * E_CAM,
});

/* ⭐ ONDE O FEIXE DO PAINEL ENCONTRA O DESENHO DA CÂMARA.
   São quatro subidas, e é isto que separa o que estava embolado num
   canto só: cada uma sobe pelo seu lado, na sua altura.

     PC-1  · potência  — sobe rente à ESQUERDA e entra pela parede
     PC-2  · medição   — sobe rente à DIREITA e entra pela parede
     tampaE · os 2 fios das ventoinhas do radiador, por FORA, à esquerda
     tampaD · os 3 fios de sinal do lado quente, por FORA, à direita   */
export const SUBIDAS = (x0, y0, largura, altura) => {
  const { cy } = pxCamara(x0, y0, altura);
  const g = id => PRENSAS3D.find(p => p.id === id);
  return {
    'PC-1':  { x: x0 - 16, y: cy(g('PC-1').z), borda: x0, lado: 'esq' },
    'PC-2':  { x: x0 + largura + 16, y: cy(g('PC-2').z),
               borda: x0 + largura, lado: 'dir' },
    tampaE:  { x: x0 - 33, y: y0 + altura, lado: 'esq' },
    tampaD:  { x: x0 + largura + 36, y: y0 + altura, lado: 'dir' },
  };
};

/* onde o borne encosta na peça, e para que lado ele aponta */
export function pontoBorne(caixa, bo) {
  const [x0, , z0, x1, , z1] = caixa;
  if (bo.lado === 'esq')  return { x: x0, z: z0 + bo.t * (z1 - z0), ax: -1, az: 0 };
  if (bo.lado === 'dir')  return { x: x1, z: z0 + bo.t * (z1 - z0), ax:  1, az: 0 };
  if (bo.lado === 'topo') return { x: x0 + bo.t * (x1 - x0), z: z1, ax: 0, az:  1 };
  return { x: x0 + bo.t * (x1 - x0), z: z0, ax: 0, az: -1 };
}

/* todo borne de dentro, achável por 'PEÇA.borne' */
export const BORNES_CAMARA = new Map();
for (const p of PECAS3D)
  for (const bo of p.bornes ?? [])
    BORNES_CAMARA.set(`${p.id}.${bo.b}`, { peca: p, bo, ...pontoBorne(p.caixa, bo) });

export const BORNES_TAMPA = new Map();
for (const p of TAMPA3D)
  for (const bo of p.bornes ?? []) BORNES_TAMPA.set(`${p.id}.${bo.b}`, { peca: p, bo });

export const naCamara = f => [f.de, f.para].find(a => a.camara);
export const naTampa  = f => [f.de, f.para].find(a => a.tampa);
/* o sentido conta: quem sai do painel é ida, quem entra nele é retorno */
export const eRetorno = f => !!(f.de.camara || f.de.tampa);

/**
 * Waypoints em mm, do furo até o borne. O PRIMEIRO trecho é o leque:
 * sai do furo na diagonal e abre o feixe. Todo o resto é ortogonal.
 *
 *   sem `sobe` → corre pelo piso e sobe direto no borne
 *   com `sobe` → corre pelo piso, ganha altura rente à parede em `sobe`,
 *                e atravessa até a peça na altura `crz`
 */
export function caminhoCamara(n) {
  const r = ROTAS_CAMARA[n];
  if (!r) return null;
  const g = PRENSAS3D.find(p => p.id === r.pc);
  const b = BORNES_CAMARA.get(r.alvo);
  if (!g || !b) return null;

  const p = [[g.x, g.z], [r.gx, r.lane]];          // o leque
  if (r.sobe !== undefined) {
    const crz = r.crz ?? b.z;
    p.push([r.sobe, r.lane], [r.sobe, crz], [b.x, crz]);
  } else {
    p.push([b.x, r.lane]);
  }
  p.push([b.x, b.z]);
  return { pontos: p.filter((q, i) => i === 0
    || q[0] !== p[i - 1][0] || q[1] !== p[i - 1][1]), borne: b, prensa: g };
}

/** Onde um fio cruza outro: `h` é o horizontal, `v` o vertical.
 *  Quem desenha o pulinho é quem chama — a regra do projeto é que a
 *  MEDIÇÃO passa por cima, porque é ela que tem de atravessar a
 *  potência em 90° e nunca correr junto. */
export function cruzamentos(caminhos) {
  const seg = [];
  for (const [n, c] of caminhos)
    for (let i = 2; i < c.pontos.length; i++)     // pula o leque
      seg.push({ n, a: c.pontos[i - 1], b: c.pontos[i] });
  const eH = s => Math.abs(s.a[1] - s.b[1]) < 0.4;
  const out = [];
  for (const s of seg) for (const t of seg) {
    if (s.n === t.n || !eH(s) || eH(t)) continue;
    const x = t.a[0], z = s.a[1];
    const [x0, x1] = [s.a[0], s.b[0]].sort((a, c) => a - c);
    const [z0, z1] = [t.a[1], t.b[1]].sort((a, c) => a - c);
    if (x > x0 + 0.4 && x < x1 - 0.4 && z > z0 + 0.4 && z < z1 - 0.4)
      out.push({ h: s.n, v: t.n, x, z });
  }
  return out;
}
