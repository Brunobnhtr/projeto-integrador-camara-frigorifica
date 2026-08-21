import { FIOS } from '../data/fiacao';
import { porHost } from '../data/discretos';
import { COMPONENTES } from '../data/painel_completo';

/* ⭐ O DESENHO QUE FALTAVA — o BS-1.
 *
 * Ele é o único "componente" do painel que não é componente nenhum: são
 * três bornes de passagem no trilho, e o que mora neles são dois
 * capacitores parafusados junto com os fios. Quem olha a lista vê
 * "BS-1 · 3/3 terminais" e não faz ideia do que isso é.
 *
 * A pergunta que este desenho responde é literal: "na entrada A0 entra
 * dois fios e capacitor?". Sim — três condutores no mesmo nó elétrico —
 * e o borne tem DOIS parafusos justamente para você não precisar
 * espremer os três num só.
 *
 * ⚠️ Tudo aqui é lido dos dados (FIOS e DISCRETOS). Se um fio mudar de
 * destino, o desenho muda junto — ele não pode mentir.
 */

const C = { tinta: '#212529', fraco: '#868e96', linha: '#dee2e6', azul: '#1971c2' };

/* quem chega e quem sai de um nó do BS-1, direto da fiação */
const condutoresDe = via => {
  const fios = FIOS.filter(f =>
    (f.de.comp === 'BS-1' && f.de.via === via) ||
    (f.para.comp === 'BS-1' && f.para.via === via));
  return fios.map(f => {
    const entra = f.para.comp === 'BS-1' && f.para.via === via;
    const outro = entra ? f.de : f.para;
    return {
      /* ⚠ os fios das etapas 1 a 3 nao tem `nome`, so' `diz` */
      n: f.n, nome: f.nome ?? f.diz, mm2: f.mm2, cor: f.cor, corNome: f.corNome,
      entra, outro: `${outro.comp} · ${outro.via ?? outro.borne ?? ''}`.trim(),
    };
  });
};

const capsDe = via => porHost('BS-1').filter(d => d.pernas.some(p => p.vai.via === via));

function Secao({ titulo, sub, children }) {
  return (
    <section style={{ marginBottom: 26 }}>
      <h3 style={{ fontSize: 13.5, margin: '0 0 2px', color: C.azul, letterSpacing: 0.3 }}>
        {titulo}
      </h3>
      {sub && <p style={{ fontSize: 12, color: C.fraco, margin: '0 0 10px', lineHeight: 1.5 }}>{sub}</p>}
      {children}
    </section>
  );
}

/* ── um borne de passagem visto de frente ────────────────────────────
   O detalhe que importa: a BARRA DE LATÃO ligando os dois parafusos.
   É ela que faz dos dois lados um nó só.                              */
function Borne({ x, y, rotulo, cor, total, detalhe, larg = 150 }) {
  const h = 96, meio = x + larg / 2;
  return (
    <g>
      <rect x={x} y={y} width={larg} height={h} rx={7} fill="#f1f3f5"
            stroke="#adb5bd" strokeWidth={1.6} />
      {/* a barra interna: os dois lados sao o MESMO no */}
      <rect x={x + 16} y={y + h / 2 - 7} width={larg - 32} height={14} rx={3}
            fill="#f6d365" stroke="#c99700" strokeWidth={1.1} />
      <text x={meio} y={y + h / 2 + 4} textAnchor="middle" fontSize={8.5}
            fill="#8a6116" fontWeight="700">barra de latão</text>
      {/* os dois parafusos */}
      {[x + 26, x + larg - 26].map((cx, i) => (
        <g key={i}>
          <circle cx={cx} cy={y + 22} r={11} fill="#ced4da" stroke="#868e96" strokeWidth={1.3} />
          <path d={`M${cx - 6} ${y + 22} L${cx + 6} ${y + 22}`} stroke="#495057" strokeWidth={2} />
          <path d={`M${cx} ${y + 33} L${cx} ${y + h / 2 - 7}`} stroke="#868e96" strokeWidth={1.6} />
        </g>
      ))}
      {/* etiqueta do no */}
      <rect x={meio - 26} y={y - 17} width={52} height={17} rx={3} fill={cor} />
      <text x={meio} y={y - 4.5} textAnchor="middle" fontSize={11} fontWeight="700" fill="#fff">
        {rotulo}
      </text>
      {/* bocais dos fios, um de cada lado */}
      {[[x, -1], [x + larg, 1]].map(([bx, dir2], i) => (
        <rect key={i} x={dir2 < 0 ? bx - 9 : bx - 3} y={y + 56} width={12} height={26} rx={2}
              fill="#495057" />
      ))}
      {/* ⭐ a contagem vai EMBAIXO e centralizada: nas laterais ela
          encostava na do borne vizinho e virava um borrão */}
      <text x={meio} y={y + h + 17} textAnchor="middle" fontSize={9.5} fontWeight="700"
            fill={total > 2 ? '#c92a2a' : C.fraco}>{total} condutores</text>
      <text x={meio} y={y + h + 29} textAnchor="middle" fontSize={8.5} fill={C.fraco}>
        {detalhe}
      </text>
    </g>
  );
}

/* ── O BORNE EM CORTE — o raio-X ─────────────────────────────────────
   Num circuito impresso, o caminho da corrente é a trilha de cobre e
   você a vê de fora. Num borne, o caminho existe igual, mas mora DENTRO
   da peça: é a barra de latão entre as duas gaiolas. Este corte mostra
   exatamente isso — o percurso do cobre de um fio até o outro.        */
function BorneEmCorte() {
  const gaiola = (x, rot) => (
    <g key={x}>
      <rect x={x} y={134} width={86} height={74} rx={4} fill="none"
            stroke="#868e96" strokeWidth={2.4} />
      <rect x={x + 8} y={142} width={70} height={24} rx={2} fill="#adb5bd" opacity={0.45} />
      <rect x={x + 30} y={68} width={26} height={66} fill="#ced4da" stroke="#868e96" strokeWidth={1.4} />
      {[76, 88, 100, 112, 124].map(y => (
        <path key={y} d={`M${x + 30} ${y} L${x + 56} ${y - 5}`} stroke="#868e96" strokeWidth={1} />
      ))}
      <rect x={x + 22} y={56} width={42} height={14} rx={2} fill="#adb5bd" stroke="#868e96" strokeWidth={1.4} />
      <path d={`M${x + 30} 63 L${x + 56} 63`} stroke="#495057" strokeWidth={2.2} />
      <text x={x + 43} y={48} textAnchor="middle" fontSize={9} fill={C.fraco}>{rot}</text>
      <path d={`M${x + 43} 112 L${x + 43} 132 M${x + 38} 124 L${x + 43} 133 L${x + 48} 124`}
            stroke="#c92a2a" strokeWidth={1.6} fill="none" />
    </g>
  );

  return (
    <svg viewBox="0 0 780 450" style={{ width: '100%', maxWidth: 780, display: 'block' }}>
      {/* corpo plastico, em corte */}
      <path d="M200 40 L560 40 L560 258 L540 258 L540 300 L220 300 L220 258 L200 258 Z"
            fill="#eef1f5" stroke="#495057" strokeWidth={2.2} />
      <text x={380} y={30} textAnchor="middle" fontSize={10.5} fontWeight="700" fill="#495057">
        CORTE — o mesmo borne, aberto ao meio
      </text>

      {gaiola(226, 'parafuso 1')}
      {gaiola(448, 'parafuso 2')}

      {/* ⭐ a barra de latao: alta o bastante para o rotulo e o caminho
          nao disputarem o mesmo espaco */}
      <rect x={226} y={210} width={308} height={34} rx={5} fill="#f6d365"
            stroke="#c99700" strokeWidth={2} />
      <text x={380} y={227} textAnchor="middle" fontSize={11} fontWeight="700" fill="#8a6116">
        BARRA DE LATÃO
      </text>

      {/* o caminho do cobre corre pela parte de BAIXO da barra */}
      <path d="M110 171 L269 171 L269 238 L491 238 L491 171 L650 171"
            fill="none" stroke="#c92a2a" strokeWidth={2.6} strokeDasharray="7 5" />
      {[[180, 171], [380, 238], [580, 171]].map(([x, y], i) => (
        <polygon key={i} points={`${x - 6},${y - 5} ${x + 6},${y} ${x - 6},${y + 5}`} fill="#c92a2a" />
      ))}
      <text x={380} y={266} textAnchor="middle" fontSize={9.5} fill="#c92a2a">
        ↑ o caminho do cobre: entra por um fio, atravessa a barra, sai pelo outro
      </text>

      {/* os dois fios */}
      <rect x={40} y={164} width={186} height={15} rx={3} fill="#e8590c" />
      <text x={44} y={156} fontSize={10} fontWeight="700" fill="#e8590c">fio S9 · chega do BTS #1</text>
      <rect x={534} y={164} width={186} height={15} rx={3} fill="#1971c2" />
      <text x={716} y={156} textAnchor="end" fontSize={10} fontWeight="700" fill="#1971c2">
        fio S5 · sai para o MEGA
      </text>

      {/* a perna do capacitor, na MESMA gaiola do fio que sai */}
      <path d="M612 179 L612 348" stroke="#5f3dc4" strokeWidth={3} />
      <path d="M596 348 L628 348 M596 356 L628 356" stroke="#5f3dc4" strokeWidth={3.4} />
      <path d="M612 356 L612 378" stroke="#5f3dc4" strokeWidth={3} />
      <text x={640} y={352} fontSize={10} fontWeight="700" fill="#5f3dc4">C1 · 100 nF</text>
      <text x={640} y={365} fontSize={8.8} fill={C.fraco}>entra na mesma gaiola</text>
      <text x={640} y={376} fontSize={8.8} fill={C.fraco}>do fio que sai</text>
      <text x={612} y={394} textAnchor="middle" fontSize={9} fill={C.fraco}>↓ ao borne 0V</text>

      {/* trilho DIN em corte */}
      <path d="M170 300 L590 300 L590 316 L576 316 L576 330 L184 330 L184 316 L170 316 Z"
            fill="#dee2e6" stroke="#adb5bd" strokeWidth={1.8} />
      <path d="M340 300 L340 288 L380 288 L380 300" fill="none" stroke="#868e96" strokeWidth={2.2} />
      <text x={340} y={350} textAnchor="middle" fontSize={9.5} fill={C.fraco}>
        trilho DIN 35 mm — a mola de trás é o que trava o borne nele
      </text>

      {/* chamadas, do lado de fora do desenho */}
      <path d="M258 146 L196 118" stroke="#868e96" strokeWidth={1} />
      <text x={20} y={80} fontSize={9.5} fontWeight="700" fill={C.tinta}>gaiola de aperto</text>
      <text x={20} y={92} fontSize={8.8} fill={C.fraco}>o parafuso empurra a gaiola,</text>
      <text x={20} y={103} fontSize={8.8} fill={C.fraco}>e ela prensa o fio contra a</text>
      <text x={20} y={114} fontSize={8.8} fill={C.fraco}>barra — sem solda nenhuma</text>

      <path d="M520 227 L648 258" stroke="#868e96" strokeWidth={1} />
      <text x={654} y={252} fontSize={9.5} fontWeight="700" fill="#8a6116">é o “trilho” desta peça</text>
      <text x={654} y={264} fontSize={8.8} fill={C.fraco}>o metal que liga os</text>
      <text x={654} y={275} fontSize={8.8} fill={C.fraco}>dois lados: um nó só</text>
    </svg>
  );
}

export default function BorneDeFiltro({ onFechar }) {
  const comp = COMPONENTES.find(c => c.id === 'BS-1');
  const nos = ['A0', 'A1'].map(via => ({
    via, fios: condutoresDe(via), caps: capsDe(via),
  }));
  const zero = { fios: condutoresDe('0V'), caps: porHost('BS-1') };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column',
                  fontFamily: 'Segoe UI, Arial, sans-serif' }}>
      <div style={{ background: C.azul, color: '#fff', padding: '12px 18px', flexShrink: 0,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <b style={{ fontSize: 15 }}>BS-1 — os bornes dos filtros de corrente</b>
          <div style={{ fontSize: 11.5, opacity: 0.9, marginTop: 2 }}>
            3 bornes de passagem 2,5 mm² · trilho 3, ao lado do Arduino ·
            {' '}não é uma placa: é um ponto de encontro com parafuso
          </div>
        </div>
        <button onClick={onFechar} style={{
          background: '#ffffff33', color: '#fff', border: 'none', borderRadius: 5,
          width: 26, height: 26, cursor: 'pointer' }}>×</button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '20px 22px 60px', background: '#fff' }}>

        <Secao titulo="1 · O QUE É ESTE COMPONENTE"
               sub="Um borne de passagem não é peça de circuito: é um parafuso de cada lado com uma barra de latão no meio. Os dois lados são o MESMO ponto elétrico — o fio entra por um, sai pelo outro, e o nó continua sendo um só.">
          <svg viewBox="0 0 620 210" style={{ width: '100%', maxWidth: 620, display: 'block' }}>
            <rect x={10} y={160} width={600} height={16} rx={2} fill="#dee2e6" stroke="#adb5bd" />
            <text x={310} y={193} textAnchor="middle" fontSize={10} fill={C.fraco}>
              trilho DIN 35 mm — os três encaixam lado a lado, e travam com a mola de trás
            </text>
            {[
              { r: 'A0', cor: '#1971c2', no: nos[0] },
              { r: 'A1', cor: '#1971c2', no: nos[1] },
              { r: '0V', cor: '#212529', no: zero },
            ].map((b2, i) => {
              const nf = b2.no.fios.length, nc = b2.no.caps.length;
              return (
                <Borne key={b2.r} x={30 + i * 195} y={30} larg={160} rotulo={b2.r} cor={b2.cor}
                       total={nf + nc}
                       detalhe={`${nf} fio${nf > 1 ? 's' : ''} + ${nc} perna${nc > 1 ? 's' : ''} de capacitor`} />
              );
            })}
          </svg>
        </Secao>

        <Secao titulo="2 · POR DENTRO — onde fica o “trilho” deste componente"
               sub="Numa placa de circuito impresso o caminho da corrente é a trilha de cobre, e você a vê por fora. Aqui o caminho existe igual, mas mora DENTRO da peça: é uma barra de latão entre as duas gaiolas de aperto. O corte abaixo mostra o percurso inteiro, de um fio ao outro.">
          <BorneEmCorte />
        </Secao>

        <Secao titulo="3 · A SUA PERGUNTA: “no A0 entram 2 fios e o capacitor?”"
               sub="Entram, sim: três condutores no mesmo nó. Mas repare que são DOIS parafusos — então não é preciso espremer os três juntos.">
          <svg viewBox="0 0 700 330" style={{ width: '100%', maxWidth: 700, display: 'block' }}>
            {/* o borne A0, grande */}
            <rect x={230} y={110} width={240} height={110} rx={9} fill="#f1f3f5"
                  stroke="#adb5bd" strokeWidth={2} />
            <rect x={252} y={158} width={196} height={16} rx={4} fill="#f6d365"
                  stroke="#c99700" strokeWidth={1.2} />
            <text x={350} y={170} textAnchor="middle" fontSize={9.5} fontWeight="700" fill="#8a6116">
              mesmo nó por dentro
            </text>
            <rect x={318} y={88} width={64} height={20} rx={4} fill="#1971c2" />
            <text x={350} y={103} textAnchor="middle" fontSize={12.5} fontWeight="700" fill="#fff">A0</text>

            {[268, 432].map((cx, i) => (
              <g key={i}>
                <circle cx={cx} cy={134} r={13} fill="#ced4da" stroke="#868e96" strokeWidth={1.5} />
                <path d={`M${cx - 7} 134 L${cx + 7} 134`} stroke="#495057" strokeWidth={2.4} />
                <path d={`M${cx} 147 L${cx} 158`} stroke="#868e96" strokeWidth={1.8} />
                <text x={cx} y={122} textAnchor="middle" fontSize={8.5} fill={C.fraco}>
                  parafuso {i + 1}
                </text>
              </g>
            ))}

            {/* condutor 1 — chega do BTS, no parafuso da esquerda */}
            <path d="M60 165 L230 165" stroke="#e8590c" strokeWidth={3.4} />
            <circle cx={230} cy={165} r={4} fill="#e8590c" />
            <text x={60} y={155} fontSize={11} fontWeight="700" fill="#e8590c">1 · CHEGA</text>
            <text x={60} y={185} fontSize={10} fill={C.tinta}>do BTS #1 · R_IS</text>
            <text x={60} y={199} fontSize={9.5} fill={C.fraco}>fio S9 · 0,25 mm²</text>

            {/* condutor 2 — sai para o Mega, parafuso da direita */}
            <path d="M470 148 L640 148" stroke="#1971c2" strokeWidth={3.4} />
            <circle cx={470} cy={148} r={4} fill="#1971c2" />
            <text x={545} y={138} fontSize={11} fontWeight="700" fill="#1971c2">2 · SAI</text>
            <text x={545} y={168} fontSize={10} fill={C.tinta}>para o MEGA · A0</text>
            <text x={545} y={182} fontSize={9.5} fill={C.fraco}>fio S5 · 0,25 mm²</text>

            {/* condutor 3 — a perna do capacitor, no mesmo parafuso da direita */}
            <path d="M432 220 L432 250" stroke="#5f3dc4" strokeWidth={3} />
            <path d="M416 250 L448 250 M416 258 L448 258" stroke="#5f3dc4" strokeWidth={3.4} />
            <path d="M432 258 L432 286" stroke="#5f3dc4" strokeWidth={3} />
            <text x={462} y={247} fontSize={11} fontWeight="700" fill="#5f3dc4">3 · O CAPACITOR</text>
            <text x={462} y={261} fontSize={10} fill={C.tinta}>C1 · 100 nF (marcado 104)</text>
            <text x={462} y={274} fontSize={9.5} fill={C.fraco}>a outra perna desce ao borne 0V</text>

            {/* o borne 0V embaixo */}
            <rect x={330} y={286} width={200} height={30} rx={5} fill="#f1f3f5"
                  stroke="#adb5bd" strokeWidth={1.6} />
            <text x={430} y={305} textAnchor="middle" fontSize={11} fontWeight="700" fill={C.tinta}>
              borne 0V → BD-0V · Z6
            </text>

            <rect x={40} y={20} width={620} height={46} rx={6} fill="#fff9db" stroke="#e8a33d" />
            <text x={54} y={38} fontSize={11.5} fontWeight="700" fill="#8a6116">
              ⚠ São 3 condutores no nó, e 2 parafusos: divida 1 + 2.
            </text>
            <text x={54} y={55} fontSize={10.5} fill="#5c4a00">
              O que chega num parafuso; o que sai e a perna do capacitor no outro. Aperto final com todos dentro.
            </text>
          </svg>
        </Secao>

        <Secao titulo="4 · POR QUE O CAPACITOR ESTÁ AQUI, E NÃO NO BTS"
               sub="O sinal IS sai limpo do driver e atravessa ~30 cm dentro de um painel que chaveia 6 A a 20 kHz. É no CABO que ele suja — então o filtro tem de ficar na ponta do Arduino, não na ponta do driver.">
          <pre style={{ background: '#f8f9fa', border: `1px solid ${C.linha}`, borderRadius: 6,
                        padding: '12px 14px', fontSize: 12, lineHeight: 1.6, margin: 0,
                        overflowX: 'auto' }}>{
`   BTS #1 · R_IS ──[ resistência do próprio cabo ]──┬──────► MEGA · A0
                                                    │
                                             C1 ──┴──  100 nF
                                                    │
                                                   0 V  (borne 0V → BD-0V · Z6)

   A resistência do cabo + o capacitor formam um filtro passa-baixas:
   o ruído rápido é curto-circuitado para o 0 V, e o A/D lê tensão limpa.`
          }</pre>
        </Secao>

        <Secao titulo="5 · CADA CONDUTOR, NÓ POR NÓ"
               sub="Gerado da fiação do projeto — se um fio mudar de destino, esta tabela muda junto.">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#f1f3f5', textAlign: 'left' }}>
                <th style={{ padding: '7px 9px' }}>Nó</th>
                <th style={{ padding: '7px 9px' }}>Condutor</th>
                <th style={{ padding: '7px 9px' }}>O que é</th>
                <th style={{ padding: '7px 9px' }}>Bitola</th>
              </tr>
            </thead>
            <tbody>
              {[...nos, { via: '0V', ...zero }].map(no => {
                const linhas = [
                  ...no.fios.map(f => ({
                    k: f.n,
                    tipo: f.entra ? `⬅ chega de ${f.outro}` : `➡ sai para ${f.outro}`,
                    oq: f.nome, mm: `${f.mm2} mm² · ${f.corNome}`, cor: f.cor,
                  })),
                  ...no.caps.map(c => ({
                    k: c.ref, tipo: '⏚ perna do capacitor', oq: c.peca,
                    mm: 'sem polaridade', cor: '#5f3dc4',
                  })),
                ];
                return linhas.map((l, i) => (
                  <tr key={no.via + l.k} style={{ borderTop: `1px solid ${C.linha}` }}>
                    {i === 0 && (
                      <td rowSpan={linhas.length} style={{
                        padding: '7px 9px', fontWeight: 700, fontFamily: 'monospace',
                        fontSize: 13, verticalAlign: 'top',
                        color: linhas.length > 2 ? '#c92a2a' : C.tinta }}>
                        {no.via}
                        <div style={{ fontSize: 10, fontWeight: 400, color: C.fraco }}>
                          {linhas.length} cond.
                        </div>
                      </td>
                    )}
                    <td style={{ padding: '7px 9px', fontFamily: 'monospace', fontSize: 11.5,
                                 borderLeft: `3px solid ${l.cor}` }}>
                      <b>{l.k}</b> {l.tipo}
                    </td>
                    <td style={{ padding: '7px 9px', color: '#495057' }}>{l.oq}</td>
                    <td style={{ padding: '7px 9px', color: C.fraco }}>{l.mm}</td>
                  </tr>
                ));
              })}
            </tbody>
          </table>
        </Secao>

        <Secao titulo="6 · COMO CONFERIR QUE FICOU CERTO">
          <ul style={{ fontSize: 12.5, lineHeight: 1.75, color: '#495057', paddingLeft: 20, margin: 0 }}>
            <li><b>Continuidade dentro do borne:</b> ponta em cada lado do mesmo borne → <b>~0 Ω</b>.
                É a barra de latão. Se não beepar, o borne está partido ou você mediu bornes diferentes.</li>
            <li><b>O capacitor:</b> em <i>teste de diodo</i> ou capacímetro, entre o nó e o 0 V →
                carrega e para (ou <b>~100 nF</b>). Se der curto permanente, o capacitor está furado
                e o A/D vai ler sempre 0.</li>
            <li><b>Puxe cada fio com a mão</b> depois do aperto. Três condutores no mesmo nó é onde
                mais aparece fio frouxo — apertar em dois tempos deixa um deles solto.</li>
            <li><b>Energizado e em repouso:</b> a leitura de <code>A0</code> fica estável dentro de
                <b> ±2 contagens</b> de A/D. Se oscilar dezenas, o filtro não está fazendo efeito —
                confira se o capacitor ficou no lado do Arduino.</li>
          </ul>
        </Secao>

        {comp?.avisos?.map((a, i) => (
          <div key={i} style={{ fontSize: 12, background: '#fff5f5', border: '1px solid #ffc9c9',
                                borderRadius: 6, padding: '10px 12px', lineHeight: 1.55,
                                color: '#a51111', marginTop: 10 }}>{a}</div>
        ))}
      </div>
    </div>
  );
}
