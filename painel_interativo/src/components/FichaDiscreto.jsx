import { HOSTS, ARRANJOS } from '../data/discretos.js';

/* ═══════════════════════════════════════════════════════════════════════
   A FICHA DE UM COMPONENTE DISCRETO
   ═══════════════════════════════════════════════════════════════════════
   ⭐ O QUE ELA RESPONDE. "O fio passa por ele em série? Ele fica de lado?
      Qual perna vai em qual parafuso? Que lado é o certo?" — perguntas de
      quem nunca mexeu com eletrônica, e que nenhum parágrafo responde tão
      bem quanto um desenho com os terminais nomeados.

   O desenho é GERADO DOS DADOS: os nomes dos parafusos saem das pernas
   cadastradas, e o arranjo escolhe a forma do desenho. Componente que
   entra no cadastro aparece aqui sozinho, sem ninguém desenhar nada.
   ═════════════════════════════════════════════════════════════════════ */

const C = {
  tinta: '#212529', fraco: '#6c757d', linha: '#ced4da', fundo: '#f8f9fa',
  papel: '#fff', destaque: '#e8590c', ok: '#2f9e44', perigo: '#c92a2a',
  fio: '#495057', azul: '#1971c2',
};

/* ── símbolos, no padrão IEC ─────────────────────────────────────────── */
function Simbolo({ tipo, x, y, giro = 0 }) {
  const g = `translate(${x} ${y}) rotate(${giro})`;
  const traco = { fill: 'none', stroke: C.tinta, strokeWidth: 2, strokeLinecap: 'round' };
  switch (tipo) {
    case 'resistor':
      return (
        <g transform={g}>
          <rect x={-26} y={-9} width={52} height={18} rx={1.5} fill={C.papel} {...traco} />
          <path d="M -44 0 H -26 M 26 0 H 44" {...traco} />
        </g>
      );
    case 'capacitor':
      return (
        <g transform={g}>
          <path d="M -6 -14 V 14 M 6 -14 V 14" {...traco} strokeWidth={3} />
          <path d="M -44 0 H -6 M 6 0 H 44" {...traco} />
        </g>
      );
    case 'diodo':
    case 'led':
      return (
        <g transform={g}>
          {/* o triângulo aponta para o CATODO, que é a barra grossa */}
          <path d="M -14 -13 L -14 13 L 12 0 Z" fill={C.tinta} />
          <path d="M 12 -14 V 14" {...traco} strokeWidth={3.4} />
          <path d="M -44 0 H -14 M 12 0 H 44" {...traco} />
          {tipo === 'led' && (
            <g {...traco} strokeWidth={1.5}>
              <path d="M -2 -18 L 8 -28 M 4 -28 H 9 V -23" />
              <path d="M 6 -14 L 16 -24 M 12 -24 H 17 V -19" />
            </g>
          )}
        </g>
      );
    case 'chave':
      return (
        <g transform={g}>
          <path d="M -44 0 H -18" {...traco} />
          <path d="M -18 0 L 14 -13" {...traco} />
          <circle cx={-18} cy={0} r={3} fill={C.tinta} />
          <circle cx={18} cy={0} r={3} fill={C.tinta} />
          <path d="M 18 0 H 44" {...traco} />
        </g>
      );
    case 'ci':
      return (
        <g transform={g}>
          <rect x={-46} y={-24} width={92} height={48} rx={3} fill={C.papel} {...traco} />
          <path d="M -46 -8 A 8 8 0 0 0 -46 8" {...traco} strokeWidth={1.6} />
          <text x={0} y={5} textAnchor="middle" fontSize={12} fontFamily="monospace" fill={C.tinta}>
            ULN2803A
          </text>
        </g>
      );
    default:
      return null;
  }
}

/* ── um parafuso de borne, com a fenda ───────────────────────────────── */
function Parafuso({ x, y, nome, sub }) {
  return (
    <g>
      <circle cx={x} cy={y} r={11} fill={C.papel} stroke={C.tinta} strokeWidth={1.6} />
      <path d={`M ${x - 6} ${y} H ${x + 6}`} stroke={C.tinta} strokeWidth={1.6} />
      {/* o nome vai SEMPRE acima: embaixo ele bateria no fio que desce */}
      {sub && (
        <text x={x} y={y - 34} textAnchor="middle" fontSize={10.5} fill={C.fraco}>{sub}</text>
      )}
      <text x={x} y={y - 19} textAnchor="middle" fontSize={13} fontWeight={700}
            fontFamily="monospace" fill={C.tinta}>{nome}</text>
    </g>
  );
}

/* ── quem tem mais de duas pernas não cabe no desenho de dois terminais:
      o CI aparece inteiro, com cada grupo de pinos saindo para o seu lado */
function Muitas({ d }) {
  const meio = Math.ceil(d.pernas.length / 2);
  return (
    <svg viewBox="0 0 640 230" style={{ width: '100%', height: 'auto' }}
         role="img" aria-label={`Ligações do ${d.ref}`}>
      <text x={320} y={26} textAnchor="middle" fontSize={12.5} fill={C.destaque} fontWeight={700}>
        {d.pernas.length} ligações — o chanfro do corpo diz para que lado ele entra
      </text>
      <Simbolo tipo={d.tipo} x={320} y={125} />
      {d.pernas.map((p, i) => {
        const esq = i < meio;
        const y = 80 + (esq ? i : i - meio) * 46;
        const x1 = esq ? 274 : 366, x2 = esq ? 150 : 490;
        return (
          <g key={i}>
            <path d={`M ${x1} 125 L ${x1} ${y} L ${x2} ${y}`} fill="none"
                  stroke={C.fio} strokeWidth={2} />
            <text x={esq ? x2 - 6 : x2 + 6} y={y + 4} textAnchor={esq ? 'end' : 'start'}
                  fontSize={11.5} fontFamily="monospace" fill={C.tinta}>{p.vai.via}</text>
            <text x={esq ? x2 - 6 : x2 + 6} y={y + 18} textAnchor={esq ? 'end' : 'start'}
                  fontSize={10} fill={C.fraco}>{p.nome}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ── o desenho principal: o componente entre dois terminais ──────────── */
function Arranjo({ d }) {
  if (d.pernas.length > 2) return <Muitas d={d} />;
  const [p1, p2] = d.pernas;
  const emSerie = d.arranjo === 'serie';
  const via = p => `${p.vai.comp} · ${p.vai.via}`;
  /* No antiparalelo o símbolo aponta ao contrário da tensão normal — é
     literalmente isso que a palavra quer dizer, e o desenho mostra. */
  const giro = d.arranjo === 'antiparalelo' ? 180 : 0;

  return (
    <svg viewBox="0 0 640 230" style={{ width: '100%', height: 'auto' }}
         role="img" aria-label={`Ligação do ${d.ref}`}>
      {emSerie ? (
        <>
          <text x={320} y={26} textAnchor="middle" fontSize={12.5} fill={C.destaque}
                fontWeight={700}>EM SÉRIE — a corrente atravessa o componente</text>
          <path d="M 100 120 H 560" fill="none" stroke={C.fio} strokeWidth={2.4} />
          <Simbolo tipo={d.tipo} x={330} y={120} giro={giro} />
          <Parafuso x={100} y={120} nome={p1.vai.via} sub={p1.vai.comp} />
          <Parafuso x={560} y={120} nome={p2.vai.via} sub={p2.vai.comp} />
          <text x={225} y={104} textAnchor="middle" fontSize={11.5} fill={C.fraco}>{p1.nome}</text>
          <text x={455} y={104} textAnchor="middle" fontSize={11.5} fill={C.fraco}>{p2.nome}</text>
        </>
      ) : (
        <>
          <text x={320} y={26} textAnchor="middle" fontSize={12.5} fill={C.destaque}
                fontWeight={700}>
            {d.arranjo === 'antiparalelo'
              ? 'EM ANTIPARALELO — de lado, e virado ao contrário da tensão'
              : 'DE LADO — o circuito continua sem passar por dentro dele'}
          </text>
          {/* o caminho que já existe */}
          <path d="M 100 96 H 560" fill="none" stroke={C.fio} strokeWidth={2.4} />
          <text x={320} y={84} textAnchor="middle" fontSize={11} fill={C.fraco}>
            o fio do circuito passa aqui
          </text>
          {/* as duas descidas até o componente */}
          <path d="M 100 96 V 162 M 560 96 V 162" fill="none" stroke={C.fio}
                strokeWidth={2.4} strokeDasharray="none" />
          <path d="M 100 162 H 560" fill="none" stroke={C.fio} strokeWidth={2.4} />
          <circle cx={100} cy={96} r={4} fill={C.tinta} />
          <circle cx={560} cy={96} r={4} fill={C.tinta} />
          <Simbolo tipo={d.tipo} x={330} y={162} giro={giro} />
          <Parafuso x={100} y={96} nome={p1.vai.via} sub={p1.vai.comp} />
          <Parafuso x={560} y={96} nome={p2.vai.via} sub={p2.vai.comp} />
          <text x={196} y={154} textAnchor="middle" fontSize={11.5} fill={C.fraco}>{p1.nome}</text>
          <text x={470} y={154} textAnchor="middle" fontSize={11.5} fill={C.fraco}>{p2.nome}</text>
        </>
      )}
      {d.polaridade && (
        <text x={320} y={206} textAnchor="middle" fontSize={12} fill={C.perigo} fontWeight={700}>
          ⚠️ tem lado certo — {d.tipo === 'led' ? 'perna longa = ânodo' : 'a faixa marca o catodo'}
        </text>
      )}
      <title>{`${d.ref}: ${via(p1)} e ${via(p2)}`}</title>
    </svg>
  );
}

/* ── o desenho do LUGAR onde ele mora ────────────────────────────────── */
function Lugar({ host }) {
  const t = { fontSize: 11, fill: C.fraco, fontFamily: 'system-ui' };
  const traco = { fill: C.fundo, stroke: C.tinta, strokeWidth: 1.6 };

  if (host.tipo === 'modulo') return (              /* BTS7960 visto por baixo */
    <svg viewBox="0 0 320 130" style={{ width: '100%', height: 'auto' }}>
      <rect x={14} y={16} width={292} height={80} rx={4} {...traco} />
      <text x={26} y={34} {...t}>módulo comprado, visto por baixo</text>
      <rect x={40} y={46} width={240} height={22} rx={2} fill="#fff" stroke={C.tinta} />
      {['RPWM', 'LPWM', 'R_EN', 'L_EN', 'R_IS', 'GND'].map((n, i) => (
        <g key={n}>
          <rect x={52 + i * 39} y={50} width={14} height={14} rx={2}
                fill={n === 'R_EN' || n === 'GND' ? C.destaque : '#fff'} stroke={C.tinta} />
          <text x={59 + i * 39} y={82} textAnchor="middle" fontSize={9} fill={C.tinta}>{n}</text>
        </g>
      ))}
      <path d="M 59 100 H 254" stroke={C.destaque} strokeWidth={2} fill="none" />
      <text x={156} y={118} textAnchor="middle" {...t}>o resistor é soldado nos dois pads laranja</text>
    </svg>
  );

  if (host.id === 'POSTE-IL') return (              /* base do poste, aberta */
    <svg viewBox="0 0 320 130" style={{ width: '100%', height: 'auto' }}>
      <path d="M 150 108 V 30 h 34" fill="none" stroke={C.tinta} strokeWidth={3} />
      <circle cx={190} cy={34} r={7} fill="#ffe066" stroke={C.tinta} strokeWidth={1.4} />
      <rect x={112} y={104} width={76} height={20} rx={3} {...traco} />
      <text x={150} y={118} textAnchor="middle" fontSize={10} fill={C.tinta}>base do poste</text>
      <rect x={214} y={62} width={92} height={46} rx={3} fill="#fff" stroke={C.linha} strokeDasharray="4 3" />
      <text x={222} y={78} {...t}>dentro da base:</text>
      <text x={222} y={94} {...t}>resistor + emenda</text>
      <text x={222} y={106} {...t}>com termorretrátil</text>
    </svg>
  );

  if (host.id === 'VENT-RAD') return (              /* ventoinha do radiador */
    <svg viewBox="0 0 320 130" style={{ width: '100%', height: 'auto' }}>
      <rect x={90} y={20} width={92} height={92} rx={6} {...traco} />
      <circle cx={136} cy={66} r={32} fill="#fff" stroke={C.tinta} strokeWidth={1.4} />
      {[0, 90, 180, 270].map(a => (
        <path key={a} d="M 136 66 q 20 -8 26 -22" fill="none" stroke={C.tinta} strokeWidth={1.4}
              transform={`rotate(${a} 136 66)`} />
      ))}
      <path d="M 182 50 H 232 M 182 84 H 232" fill="none" stroke={C.fio} strokeWidth={2} />
      <text x={238} y={54} {...t}>+12 V</text>
      <text x={238} y={88} {...t}>0 V</text>
      <text x={90} y={126} {...t}>fora da câmara, no dissipador do lado quente</text>
    </svg>
  );

  if (host.tipo === 'camara') return (              /* placa simuladora do DUT */
    <svg viewBox="0 0 320 130" style={{ width: '100%', height: 'auto' }}>
      <rect x={40} y={26} width={240} height={74} rx={4} {...traco} />
      <text x={52} y={44} {...t}>placa ~30 × 40 mm, dentro da câmara</text>
      <rect x={64} y={58} width={40} height={14} rx={1.5} fill="#fff" stroke={C.tinta} />
      <text x={84} y={86} textAnchor="middle" fontSize={9.5} fill={C.fraco}>resistor</text>
      <circle cx={150} cy={65} r={9} fill="#ffa8a8" stroke={C.tinta} strokeWidth={1.4} />
      <text x={150} y={86} textAnchor="middle" fontSize={9.5} fill={C.fraco}>LED</text>
      <path d="M 196 65 h 20" stroke={C.tinta} strokeWidth={1.6} />
      <path d="M 216 65 l 16 -8" stroke={C.tinta} strokeWidth={1.6} />
      <text x={222} y={86} textAnchor="middle" fontSize={9.5} fill={C.fraco}>jumper</text>
    </svg>
  );

  if (host.tipo === 'borne') return (               /* base de relé, dois parafusos */
    <svg viewBox="0 0 320 130" style={{ width: '100%', height: 'auto' }}>
      <rect x={54} y={30} width={212} height={66} rx={4} {...traco} />
      <text x={66} y={48} {...t}>borne de parafuso, sem placa nenhuma</text>
      {[110, 210].map(x => (
        <g key={x}>
          <circle cx={x} cy={74} r={10} fill="#fff" stroke={C.tinta} strokeWidth={1.4} />
          <path d={`M ${x - 5} 74 H ${x + 5}`} stroke={C.tinta} strokeWidth={1.4} />
        </g>
      ))}
      <path d="M 110 74 q 50 -22 100 0" fill="none" stroke={C.destaque} strokeWidth={2} />
      <text x={160} y={112} textAnchor="middle" {...t}>as pernas dobradas em U entram nos parafusos</text>
    </svg>
  );

  return (                                           /* placa ilhada */
    <svg viewBox="0 0 320 130" style={{ width: '100%', height: 'auto' }}>
      <rect x={40} y={20} width={240} height={92} rx={3} fill="#f6e7c8" stroke={C.tinta} strokeWidth={1.6} />
      {Array.from({ length: 9 }, (_, c) => Array.from({ length: 4 }, (_, l) => (
        <circle key={`${c}-${l}`} cx={64 + c * 24} cy={40 + l * 20} r={2.6}
                fill="#fff" stroke="#b08968" strokeWidth={0.8} />
      )))}
      <text x={40} y={126} {...t}>placa ilhada — nenhum furo vem ligado de fábrica</text>
    </svg>
  );
}

/* uma linha do verbete: só aparece se o campo existir no cadastro */
function Linha({ rotulo, children, cor }) {
  if (!children) return null;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '112px 1fr', gap: 12,
                  padding: '9px 0', borderTop: `1px solid ${C.linha}` }}>
      <div style={{ fontSize: 10.5, letterSpacing: '.06em', color: C.fraco,
                    fontFamily: 'monospace', paddingTop: 2 }}>{rotulo}</div>
      <div style={{ fontSize: 13.5, color: cor ?? C.tinta, lineHeight: 1.5 }}>{children}</div>
    </div>
  );
}

/* ── a ficha ─────────────────────────────────────────────────────────── */
export default function FichaDiscreto({ d, onFechar }) {
  const host = HOSTS.find(h => h.id === d.host);

  return (
    <div style={{ background: C.papel, border: `1px solid ${C.linha}`, borderRadius: 8,
                  overflow: 'hidden', boxShadow: '0 6px 20px -14px rgba(0,0,0,.5)' }}>

      <header style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap',
                       padding: '12px 16px', background: C.fundo,
                       borderBottom: `1px solid ${C.linha}` }}>
        <b style={{ fontSize: 17, fontFamily: 'monospace' }}>{d.ref}</b>
        <span style={{ fontSize: 14 }}>{d.peca}</span>
        {d.qtd > 1 && (
          <span style={{ fontSize: 11.5, background: '#e7f5ff', color: C.azul,
                         borderRadius: 999, padding: '2px 9px' }}>{d.qtd} unidades</span>
        )}
        <span style={{ fontSize: 11.5, background: '#fff4e6', color: C.destaque,
                       borderRadius: 999, padding: '2px 9px' }}>
          {ARRANJOS[d.arranjo]?.nome}
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 11.5, color: C.fraco }}>
          passo {d.passo}
        </span>
        {onFechar && (
          <button onClick={onFechar} style={{ border: `1px solid ${C.linha}`, background: '#fff',
                    borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12 }}>
            fechar
          </button>
        )}
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.35fr) minmax(240px, 1fr)',
                    gap: 0, borderBottom: `1px solid ${C.linha}` }}>
        <div style={{ padding: '4px 10px 10px' }}>
          <Arranjo d={d} />
          <div style={{ fontSize: 12, color: C.fraco, lineHeight: 1.45, padding: '0 6px' }}>
            {ARRANJOS[d.arranjo]?.diz}
          </div>
        </div>
        <div style={{ padding: '12px 14px', borderLeft: `1px solid ${C.linha}`, background: C.fundo }}>
          <div style={{ fontSize: 10.5, letterSpacing: '.06em', color: C.fraco,
                        fontFamily: 'monospace', marginBottom: 6 }}>ONDE ELE MORA</div>
          <b style={{ fontSize: 13.5 }}>{host?.nome}</b>
          <div style={{ fontSize: 12.5, color: C.fraco, margin: '2px 0 8px' }}>{host?.onde}</div>
          <Lugar host={host} />
          {host?.diz && (
            <div style={{ fontSize: 12, color: C.fraco, marginTop: 8, lineHeight: 1.45 }}>{host.diz}</div>
          )}
        </div>
      </div>

      <div style={{ padding: '4px 16px 14px' }}>
        <Linha rotulo="AS PERNAS">
          {d.pernas.map((p, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
              <b>{p.nome}</b> →
              <span style={{ fontFamily: 'monospace', background: '#f1f3f5',
                             borderRadius: 3, padding: '0 6px' }}>
                {p.vai.comp} · {p.vai.via}
              </span>
            </div>
          ))}
        </Linha>
        <Linha rotulo="LADO CERTO" cor={C.perigo}>{d.comoIdentificar}</Linha>
        <Linha rotulo="SE INVERTER" cor={C.perigo}>{d.seInverter}</Linha>
        <Linha rotulo="PARA QUE É">{d.papel}</Linha>
        <Linha rotulo="POR QUÊ">{d.porque}</Linha>
        <Linha rotulo="SE FALTAR">{d.seFaltar}</Linha>
        <Linha rotulo="ANTES">{d.antesDeMontar}</Linha>
        <Linha rotulo="MONTAGEM">{d.montagem}</Linha>
        <Linha rotulo="CONFERIR" cor={C.ok}>{d.ensaio}</Linha>
        <Linha rotulo="ATENÇÃO" cor={C.destaque}>{d.aviso}</Linha>
        <Linha rotulo="FONTE">{d.fonte}</Linha>
      </div>
    </div>
  );
}
