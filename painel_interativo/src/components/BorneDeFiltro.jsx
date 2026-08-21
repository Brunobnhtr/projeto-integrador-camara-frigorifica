import { FIOS } from '../data/fiacao';
import { porHost } from '../data/discretos';
import { COMPONENTES } from '../data/painel_completo';

/* ⭐ OS DOIS FILTROS DE CORRENTE — e por que eles moram no Arduino.
 *
 * O C1 e o C2 já tiveram três endereços: soldados na placa PI-1, depois
 * parafusados num bloco de bornes só deles (o BS-1), e hoje nos bornes
 * do próprio adaptador DIN do Mega.
 *
 * A última mudança veio de uma objeção de montagem, e ela estava certa:
 * num bloco de bornes, as duas pernas de cada capacitor caem em bornes
 * DIFERENTES, a 30 mm um do outro — o componente fica pendurado no ar.
 * No adaptador do Mega, o `A0` é VIZINHO do `GND2`: 3,9 mm, que é o
 * passo de perna de um cerâmico. E é eletricamente melhor, porque o
 * filtro passa a referenciar o mesmo terra que o conversor A/D usa.
 *
 * ⚠️ Os condutores vêm dos DADOS (FIOS e DISCRETOS). Se um fio mudar de
 * destino, o desenho muda junto — ele não pode mentir.
 */

const C = { tinta: '#212529', fraco: '#868e96', linha: '#dee2e6', azul: '#1971c2' };

/* quem chega e quem sai de um borne do Mega, direto da fiação */
const condutoresDe = via => FIOS
  .filter(f => (f.de.comp === 'MEGA' && f.de.via === via) ||
               (f.para.comp === 'MEGA' && f.para.via === via))
  .map(f => {
    const entra = f.para.comp === 'MEGA' && f.para.via === via;
    const outro = entra ? f.de : f.para;
    return {
      n: f.n, nome: f.nome ?? f.diz, mm2: f.mm2, cor: f.cor, corNome: f.corNome,
      entra, outro: `${outro.comp} · ${outro.via ?? outro.borne ?? ''}`.trim(),
    };
  });

const capsDe = via => porHost('MEGA').filter(d => d.pernas.some(p => p.vai.via === via));

function Secao({ titulo, sub, children }) {
  return (
    <section style={{ marginBottom: 26 }}>
      <h3 style={{ fontSize: 13.5, margin: '0 0 2px', color: C.azul, letterSpacing: 0.3 }}>{titulo}</h3>
      {sub && <p style={{ fontSize: 12, color: C.fraco, margin: '0 0 10px', lineHeight: 1.5 }}>{sub}</p>}
      {children}
    </section>
  );
}

/* ── 1 · A RÉGUA DE BORNES DO ADAPTADOR ──────────────────────────────
   O desenho que responde tudo de uma vez: a ordem dos bornes é a ordem
   dos pinos do Mega, e nela o A0 cai bem ao lado do GND2.             */
function Regua({ nos }) {
  const B = ['A2', 'A1', 'A0', 'GND2', 'IOREF'];
  const x0 = 70, passo = 100, larg = 78, topo = 100, alt = 84;
  const cx = i => x0 + i * passo + larg / 2;
  const usado = n => n === 'A0' || n === 'A1' || n === 'GND2';
  return (
    <svg viewBox="0 0 640 320" style={{ width: '100%', maxWidth: 640, display: 'block' }}>
      <rect x={30} y={74} width={580} height={136} rx={6} fill="#e7f5ff"
            stroke="#1971c2" strokeWidth={1.8} />
      <text x={44} y={44} fontSize={11} fontWeight="700" fill="#1864ab">
        ADAPTADOR DIN DO MEGA — borda de BAIXO
      </text>

      {B.map((n, i) => (
        <g key={n}>
          <rect x={x0 + i * passo} y={topo} width={larg} height={alt} rx={4}
                fill={usado(n) ? '#fff' : '#f1f3f5'}
                stroke={usado(n) ? '#1971c2' : '#adb5bd'} strokeWidth={usado(n) ? 2 : 1.2} />
          <circle cx={cx(i)} cy={topo + 26} r={12} fill="#ced4da" stroke="#868e96" strokeWidth={1.3} />
          <path fill="none" d={`M${cx(i) - 7} ${topo + 26} L${cx(i) + 7} ${topo + 26}`}
                stroke="#495057" strokeWidth={2.2} />
          <text x={cx(i)} y={topo + alt - 12} textAnchor="middle" fontSize={13} fontWeight="700"
                fontFamily="monospace" fill={usado(n) ? '#1864ab' : C.fraco}>{n}</text>
        </g>
      ))}

      {/* C1 entre A0 e GND2 — vizinhos */}
      <path fill="none" d={`M${cx(2)} ${topo + 40} L${cx(2)} 238 M${cx(3)} ${topo + 40} L${cx(3)} 238`}
            stroke="#5f3dc4" strokeWidth={2.6} />
      <path fill="none" d={`M${cx(2)} 238 L${cx(3)} 238`} stroke="#5f3dc4" strokeWidth={2.6} />
      <rect x={cx(2) + 24} y={230} width={42} height={17} rx={3} fill="#5f3dc4" />
      <text x={cx(2) + 45} y={243} textAnchor="middle" fontSize={11} fontWeight="700" fill="#fff">C1</text>
      <text x={cx(2) + 45} y={262} textAnchor="middle" fontSize={9.5} fontWeight="700" fill="#5f3dc4">
        VIZINHOS · ~3,9 mm
      </text>

      {/* C2 entre A1 e o mesmo GND2 */}
      <path fill="none" d={`M${cx(1)} ${topo + 40} L${cx(1)} 286 M${cx(3)} 238 L${cx(3)} 286`}
            stroke="#9775fa" strokeWidth={2.4} />
      <path fill="none" d={`M${cx(1)} 286 L${cx(3)} 286`} stroke="#9775fa" strokeWidth={2.4} />
      <rect x={cx(2) - 21} y={278} width={42} height={17} rx={3} fill="#9775fa" />
      <text x={cx(2)} y={291} textAnchor="middle" fontSize={11} fontWeight="700" fill="#fff">C2</text>
      <text x={cx(1) + 4} y={310} textAnchor="middle" fontSize={9.5} fill="#7048e8">
        dois bornes · ~7,8 mm
      </text>

      {/* os fios que chegam de fora */}
      {[[2, 'IS do BTS #1'], [1, 'IS do BTS #2']].map(([i, rot]) => (
        <g key={rot}>
          <path fill="none" d={`M${cx(i)} ${topo} L${cx(i)} ${topo - 24}`} stroke="#40c057" strokeWidth={3} />
          <text x={cx(i)} y={topo - 30} textAnchor="middle" fontSize={9} fontWeight="700" fill="#2b8a3e">
            {rot}
          </text>
        </g>
      ))}
      <text x={cx(3)} y={topo - 30} textAnchor="middle" fontSize={9} fill={C.fraco}>terra do A/D</text>

      {nos && (
        <text x={320} y={20} textAnchor="middle" fontSize={10} fill={C.fraco}>
          {nos.map(n => `${n.via}: ${n.fios.length + n.caps.length} cond.`).join('   ·   ')}
        </text>
      )}
    </svg>
  );
}

/* ── 2 · UM BORNE DO ADAPTADOR EM CORTE ────────────────────────────
   O caminho da corrente: entra pelo fio, atravessa a barra de latão e
   desce para o pino do Arduino. Num circuito impresso isso seria a
   trilha de cobre; aqui mora dentro da peça.                         */
function BorneEmCorte() {
  return (
    <svg viewBox="0 0 700 390" style={{ width: '100%', maxWidth: 700, display: 'block' }}>
      <path d="M190 44 L520 44 L520 252 L500 252 L500 298 L210 298 L210 252 L190 252 Z"
            fill="#eef1f5" stroke="#495057" strokeWidth={2.2} />
      <text x={355} y={34} textAnchor="middle" fontSize={10.5} fontWeight="700" fill="#495057">
        CORTE — o borne A0 do adaptador, aberto ao meio
      </text>

      {/* gaiola + parafuso */}
      <rect x={250} y={134} width={200} height={76} rx={4} fill="none" stroke="#868e96" strokeWidth={2.4} />
      <rect x={330} y={68} width={30} height={66} fill="#ced4da" stroke="#868e96" strokeWidth={1.4} />
      {[76, 88, 100, 112, 124].map(y => (
        <path fill="none" key={y} d={`M330 ${y} L360 ${y - 5}`} stroke="#868e96" strokeWidth={1} />
      ))}
      <rect x={322} y={56} width={46} height={14} rx={2} fill="#adb5bd" stroke="#868e96" strokeWidth={1.4} />
      <path fill="none" d="M330 63 L360 63" stroke="#495057" strokeWidth={2.2} />
      <path d="M345 114 L345 132 M340 124 L345 133 L350 124" stroke="#c92a2a" strokeWidth={1.6} fill="none" />
      <text x={378} y={62} fontSize={9} fill={C.fraco}>parafuso do borne</text>

      {/* condutor 1 · o fio do IS */}
      <rect x={40} y={152} width={210} height={14} rx={3} fill="#40c057" />
      <text x={44} y={144} fontSize={10} fontWeight="700" fill="#2b8a3e">fio S9 · IS do BTS #1</text>

      {/* condutor 2 · a perna do capacitor, no MESMO parafuso */}
      <path fill="none" d="M268 210 L268 306" stroke="#5f3dc4" strokeWidth={3} />
      <path fill="none" d="M252 306 L284 306 M252 314 L284 314" stroke="#5f3dc4" strokeWidth={3.4} />
      <path fill="none" d="M268 314 L268 344 L556 344" stroke="#5f3dc4" strokeWidth={3} />
      <text x={296} y={310} fontSize={10} fontWeight="700" fill="#5f3dc4">C1 · 100 nF</text>
      <text x={296} y={323} fontSize={8.8} fill={C.fraco}>a outra perna vai ao borne AO LADO</text>
      <text x={562} y={348} fontSize={11} fontWeight="700" fontFamily="monospace" fill="#5f3dc4">GND2</text>

      {/* a barra de latão e o caminho ate o pino */}
      <rect x={250} y={206} width={200} height={32} rx={4} fill="#f6d365"
            stroke="#c99700" strokeWidth={2} />
      <text x={350} y={220} textAnchor="middle" fontSize={10} fontWeight="700" fill="#8a6116">
        barra de latão
      </text>
      <path d="M150 159 L250 159 L250 231 L470 231 L470 366"
            fill="none" stroke="#c92a2a" strokeWidth={2.6} strokeDasharray="7 5" />
      {[[200, 159], [360, 231]].map(([x, y], i) => (
        <polygon key={i} points={`${x - 6},${y - 5} ${x + 6},${y} ${x - 6},${y + 5}`} fill="#c92a2a" />
      ))}
      <polygon points="465,358 475,358 470,370" fill="#c92a2a" />
      <text x={492} y={280} fontSize={9.5} fill="#c92a2a">↓ e daqui para o</text>
      <text x={492} y={292} fontSize={9.5} fontWeight="700" fill="#c92a2a">PINO A0 do Arduino</text>

      {/* a placa do Mega, embaixo */}
      <rect x={210} y={356} width={330} height={20} rx={3} fill="#1864ab" opacity={0.85} />
      <text x={375} y={370} textAnchor="middle" fontSize={9.5} fill="#fff">
        placa do Mega, encaixada no adaptador
      </text>

      <path fill="none" d="M262 150 L170 100" stroke="#868e96" strokeWidth={1} />
      <text x={20} y={80} fontSize={9.5} fontWeight="700" fill={C.tinta}>gaiola de aperto</text>
      <text x={20} y={92} fontSize={8.8} fill={C.fraco}>o parafuso prensa o fio E a</text>
      <text x={20} y={103} fontSize={8.8} fill={C.fraco}>perna do capacitor contra a</text>
      <text x={20} y={114} fontSize={8.8} fill={C.fraco}>barra — sem solda nenhuma</text>
    </svg>
  );
}

export default function BorneDeFiltro({ onFechar }) {
  const comp = COMPONENTES.find(c => c.id === 'MEGA');
  const nos = ['A0', 'A1'].map(via => ({ via, fios: condutoresDe(via), caps: capsDe(via) }));
  const zero = { via: 'GND2', fios: condutoresDe('GND2'), caps: porHost('MEGA') };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column',
                  fontFamily: 'Segoe UI, Arial, sans-serif' }}>
      <div style={{ background: C.azul, color: '#fff', padding: '12px 18px', flexShrink: 0,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <b style={{ fontSize: 15 }}>C1 e C2 — os filtros de corrente, nos bornes do Mega</b>
          <div style={{ fontSize: 11.5, opacity: 0.9, marginTop: 2 }}>
            adaptador DIN do Arduino · trilho 3 · o A0 é borne VIZINHO do GND2 ·
            {' '}sem placa e sem solda: a perna entra no parafuso
          </div>
        </div>
        <button onClick={onFechar} style={{
          background: '#ffffff33', color: '#fff', border: 'none', borderRadius: 5,
          width: 26, height: 26, cursor: 'pointer' }}>×</button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '20px 22px 60px', background: '#fff' }}>

        <Secao titulo="1 · ONDE ELES MORAM"
               sub="Na borda de BAIXO do adaptador DIN, onde cada pino do Arduino vira um borne de parafuso. A ordem dos bornes é a ordem dos pinos do Mega — e nela o A0 cai bem ao lado do GND2.">
          <Regua nos={[...nos, zero]} />
        </Secao>

        <Secao titulo="2 · POR DENTRO DE UM BORNE"
               sub="O parafuso empurra uma gaiola que prensa o fio E a perna do capacitor contra uma barra de latão — e é essa barra que leva a corrente até o pino do Arduino. Num circuito impresso esse caminho seria a trilha de cobre; aqui ele mora dentro da peça.">
          <BorneEmCorte />
        </Secao>

        <Secao titulo="3 · POR QUE NÃO NUM BLOCO DE BORNES SEPARADO"
               sub="Foi assim por um tempo — três bornes no trilho, só para os capacitores (o BS-1). A objeção que derrubou esse arranjo é de montagem, e o número explica sozinho.">
          <table style={{ width: '100%', maxWidth: 660, borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr style={{ background: '#f1f3f5', textAlign: 'left' }}>
                <th style={{ padding: '7px 9px' }} />
                <th style={{ padding: '7px 9px' }}>Bloco de bornes (o antigo BS-1)</th>
                <th style={{ padding: '7px 9px' }}>⭐ Bornes do Mega</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Distância entre as duas pernas', '~30 mm, em bornes diferentes', '~3,9 mm — bornes vizinhos'],
                ['Como o capacitor fica', 'pendurado no ar, atravessado sobre o trilho', 'assentado, sem esticar perna'],
                ['Retorno do capacitor', '~30 cm de fio até a barra de 0 V', 'o GND2 do próprio Arduino'],
                ['Referência do conversor A/D', 'o GND do Arduino — outro ponto', 'o MESMO GND2'],
                ['Peças e fios no painel', '3 bornes + 3 fios (S5, S6, D20)', 'nenhum'],
              ].map(([o, a, b]) => (
                <tr key={o} style={{ borderTop: `1px solid ${C.linha}` }}>
                  <td style={{ padding: '7px 9px', color: '#495057' }}>{o}</td>
                  <td style={{ padding: '7px 9px', color: '#a51111' }}>{a}</td>
                  <td style={{ padding: '7px 9px', color: '#2b8a3e', fontWeight: 600 }}>{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Secao>

        <Secao titulo="4 · POR QUE O CAPACITOR FICA NO ARDUINO, E NÃO NO BTS"
               sub="Duas razões, e as duas apontam para o mesmo lugar.">
          <pre style={{ background: '#f8f9fa', border: `1px solid ${C.linha}`, borderRadius: 6,
                        padding: '12px 14px', fontSize: 12, lineHeight: 1.6, margin: 0,
                        overflowX: 'auto' }}>{
`   BTS #1 · R_IS ──[ resistência do próprio cabo ]──┬──► borne A0 ──► pino A0
                                                     │
                                              C1 ──┴──  100 nF
                                                     │
                                                    GND2   (o borne AO LADO)`
          }</pre>
          <ul style={{ fontSize: 12.5, lineHeight: 1.7, color: '#495057', paddingLeft: 20, marginTop: 10 }}>
            <li><b>Onde o ruído entra:</b> o sinal sai limpo do driver e suja ao longo dos ~30 cm de
                cabo, dentro de um painel que chaveia 6 A a 20 kHz. O filtro tem de estar na OUTRA
                ponta — com a resistência do próprio cabo, ele forma o passa-baixas.</li>
            <li><b>Onde ele se refere:</b> um filtro de entrada analógica precisa referenciar o mesmo
                terra que o conversor usa para medir. Entre o <code>GND2</code> e o A/D não há fio
                nenhum — e fio, em alta frequência, é indutor.</li>
          </ul>
        </Secao>

        <Secao titulo="5 · CADA CONDUTOR, BORNE POR BORNE"
               sub="Gerado da fiação do projeto — se um fio mudar de destino, esta tabela muda junto.">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#f1f3f5', textAlign: 'left' }}>
                <th style={{ padding: '7px 9px' }}>Borne</th>
                <th style={{ padding: '7px 9px' }}>Condutor</th>
                <th style={{ padding: '7px 9px' }}>O que é</th>
                <th style={{ padding: '7px 9px' }}>Bitola</th>
              </tr>
            </thead>
            <tbody>
              {[...nos, zero].map(no => {
                const linhas = [
                  ...no.fios.map(f => ({
                    k: f.n, tipo: f.entra ? `⬅ chega de ${f.outro}` : `➡ sai para ${f.outro}`,
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
          <p style={{ fontSize: 11.5, color: C.fraco, lineHeight: 1.55, marginTop: 8 }}>
            ⭐ O <code>GND2</code> junta as duas pernas de baixo e ainda é o retorno dos sinaleiros da
            porta. Ele não precisa de fio próprio até a barra: o 0 V do Arduino já vai ao{' '}
            <code>BD-0V</code> pelo <code>GND3</code>.
          </p>
        </Secao>

        <Secao titulo="6 · COMO CONFERIR QUE FICOU CERTO">
          <ul style={{ fontSize: 12.5, lineHeight: 1.75, color: '#495057', paddingLeft: 20, margin: 0 }}>
            <li><b>Antes de energizar:</b> ohmímetro entre <code>A0</code> e <code>GND2</code> →
                resistência alta, nunca zero. Zero é capacitor furado ou perna encostando onde não devia.</li>
            <li><b>O capacitor:</b> num capacímetro, <b>~100 nF</b>. Sem capacímetro, no teste de
                diodo ele carrega e para.</li>
            <li><b>Puxe o fio e a perna</b> depois do aperto. São dois condutores no mesmo parafuso —
                apertar em dois tempos deixa um deles solto, e perna frouxa é o defeito que só
                aparece depois do transporte.</li>
            <li><b>Energizado e em repouso:</b> a leitura de <code>A0</code> fica estável dentro de
                <b> ±2 contagens</b> de A/D. Se oscilar dezenas, confira se a perna do capacitor está
                mesmo no <code>GND2</code> e não num borne vizinho parecido.</li>
          </ul>
        </Secao>

        {comp?.avisos?.slice(0, 2).map((a, i) => (
          <div key={i} style={{ fontSize: 12, background: '#fff5f5', border: '1px solid #ffc9c9',
                                borderRadius: 6, padding: '10px 12px', lineHeight: 1.55,
                                color: '#a51111', marginTop: 10 }}>{a}</div>
        ))}
      </div>
    </div>
  );
}
