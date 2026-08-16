/**
 * A REDE ELÉTRICA da placa, montada a partir do layout físico.
 *
 * O desenho da placa responde "onde fica cada coisa". Ele NÃO responde
 * "de onde vem e para onde vai este sinal" — e é essa a pergunta que
 * importa na hora de entender o circuito.
 *
 * Aqui a placa é lida como o que ela é eletricamente: um punhado de
 * NÓS (pontos que são o mesmo ponto) ligados por ELEMENTOS (resistor,
 * capacitor, o transistor dentro do chip).
 *
 * ⭐ A distinção que confunde todo mundo:
 *   · um FIO não é um elemento — ele funde dois pontos num só nó;
 *   · um COMPONENTE é um elemento — ele separa dois nós.
 * É por isso que J1-2 e J2-2 são o MESMO ponto elétrico, e o capacitor
 * que fica ali no meio não está "no caminho" de nada.
 */

const k = (c, l) => `${c},${l}`;

export function construirRede(dados) {
  const { BORNES, BARRAMENTO_0V, NOS, JUMPERS } = dados;
  const DISCRETOS = dados.COMPONENTES_PI1 ?? dados.COMPONENTES_PI2 ?? [];
  const CHIPS = [...(dados.CI1 ? [dados.CI1] : []), ...(dados.MODULOS ?? [])];

  /* ── união-busca: quem é o mesmo ponto que quem ─────────────────── */
  const pai = new Map();
  const acha = a => {
    if (!pai.has(a)) pai.set(a, a);
    while (pai.get(a) !== a) { pai.set(a, pai.get(pai.get(a))); a = pai.get(a); }
    return a;
  };
  const une = (a, b) => { const x = acha(a), y = acha(b); if (x !== y) pai.set(x, y); };

  /* fio = funde dois pontos */
  JUMPERS.forEach(j => une(k(...j.de), k(...j.para)));
  /* ponte de nó = funde a fileira inteira do nó */
  NOS.forEach(nn => {
    for (let c = nn.de; c < nn.ate; c++) une(k(c, nn.linha), k(c + 1, nn.linha));
  });
  /* o barramento também é um fio, só que comprido */
  for (let c = BARRAMENTO_0V.de; c < BARRAMENTO_0V.ate; c++)
    une(k(c, BARRAMENTO_0V.linha), k(c + 1, BARRAMENTO_0V.linha));

  /* ── o que existe em cada ponto ─────────────────────────────────── */
  const terminais = new Map();          // "c,l" -> [descrições]
  const põe = (c, l, t) => {
    const key = k(c, l);
    terminais.set(key, [...(terminais.get(key) ?? []), t]);
  };

  BORNES.forEach(b => b.vias.forEach(v => põe(v.col, b.linha, {
    tipo: 'via', rotulo: `${b.ref}-${v.n}`, sinal: v.sinal, cor: b.cor,
    liga: v.de ?? v.para, entrada: !!v.de, livre: !!v.livre,
  })));
  NOS.forEach(nn => {
    for (let c = nn.de; c <= nn.ate; c++)
      põe(c, nn.linha, { tipo: 'no', rotulo: nn.ref, sinal: nn.furos?.[c], oculto: c !== nn.de });
  });
  for (let c = BARRAMENTO_0V.de; c <= BARRAMENTO_0V.ate; c++)
    põe(c, BARRAMENTO_0V.linha, {
      tipo: 'bus', rotulo: 'barramento de 0 V', oculto: c !== BARRAMENTO_0V.de });
  DISCRETOS.forEach(x => x.furos.forEach(([c, l], i) => põe(c, l, {
    tipo: 'perna', rotulo: `${x.ref} · ${x.valor}`, sinal: i === 0 ? 'perna 1' : 'perna 2' })));
  CHIPS.forEach(ch => ch.pinos.forEach(p => põe(p.col, p.lin, {
    tipo: 'pino', rotulo: `${ch.ref} · ${p.nome}`, chip: ch.ref, pino: p.nome,
    livre: !!p.livre })));

  /* ── elementos: o que SEPARA dois nós ───────────────────────────── */
  const elementos = [];
  DISCRETOS.forEach(x => elementos.push({
    tipo: x.tipo, ref: x.ref, valor: x.valor, papel: x.papel, porque: x.porque,
    a: acha(k(...x.furos[0])), b: acha(k(...x.furos[1])),
  }));
  CHIPS.forEach(ch => (ch.interno ?? []).forEach(li => {
    const pa = ch.pinos.find(p => p.nome === li.de);
    const pb = ch.pinos.find(p => p.nome === li.para);
    if (!pa || !pb) return;
    elementos.push({
      tipo: 'chip', ref: `${ch.ref} · ${li.de} → ${li.para}`, valor: ch.valor,
      papel: li.via, porque: ch.papel,
      a: acha(k(pa.col, pa.lin)), b: acha(k(pb.col, pb.lin)),
    });
  }));

  /* ── agrupa os pontos em nós ────────────────────────────────────── */
  const nos = new Map();                // raiz -> { membros, fios, ehBus }
  for (const [ponto, ts] of terminais) {
    const r = acha(ponto);
    if (!nos.has(r)) nos.set(r, { raiz: r, membros: [], fios: [], pontes: [] });
    nos.get(r).membros.push(...ts.filter(t => !t.oculto).map(t => ({ ...t, ponto })));
  }
  JUMPERS.forEach(j => {
    const r = acha(k(...j.de));
    if (nos.has(r)) nos.get(r).fios.push(j);
  });
  NOS.forEach(nn => {
    const r = acha(k(nn.de, nn.linha));
    if (nos.has(r)) nos.get(r).pontes.push(nn);
  });
  for (const nn of nos.values())
    nn.ehBus = nn.membros.some(m => m.tipo === 'bus');

  return { acha, nos, elementos, k };
}

/**
 * Segue o sinal a partir de um ponto, em largura, atravessando
 * elementos. O barramento de 0 V é ponto final: expandi-lo arrastaria
 * a placa inteira e não explicaria nada.
 */
export function tracar(rede, pontoInicial, limite = 6) {
  const { acha, nos, elementos } = rede;
  const raiz = acha(pontoInicial);
  if (!nos.has(raiz)) return null;

  const visto = new Set([raiz]);
  const monta = (r, nivel) => {
    const nn = nos.get(r);
    const saidas = [];
    if (!nn.ehBus && nivel < limite)
      for (const e of elementos) {
        const outro = e.a === r ? e.b : (e.b === r ? e.a : null);
        if (outro === null || visto.has(outro) || !nos.has(outro)) continue;
        visto.add(outro);
        saidas.push({ elemento: e, alvo: monta(outro, nivel + 1) });
      }
    return { ...nn, saidas };
  };
  return monta(raiz, 0);
}

/** Um nome curto e honesto para o nó. */
export function nomeDoNo(nn) {
  const no = nn.membros.find(m => m.tipo === 'no');
  if (no) return no.rotulo;
  if (nn.ehBus) return 'barramento de 0 V';
  const via = nn.membros.find(m => m.tipo === 'via');
  if (via) return `${via.rotulo} · ${via.sinal}`;
  const pino = nn.membros.find(m => m.tipo === 'pino');
  if (pino) return pino.rotulo;
  return nn.raiz;
}
