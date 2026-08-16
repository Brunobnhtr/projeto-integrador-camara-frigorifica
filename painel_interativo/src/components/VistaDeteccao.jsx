import { useState } from 'react';

/* O circuito completo da detecção de falha, do barramento até o
   Arduino. É o desenho que responde "quais são os 4 fios que saem
   do painel" e "onde entra o multiplexador".                        */

const PAREDE = 430;

/* ── os 4 fios que atravessam a parede da câmara ─────────────────── */
const FIOS = [
  { id: 'P1+', nome: 'Positivo da posição 1', cor: '#c92a2a', grupo: 'ida',
    d: 'M 196 96 L 300 96 L 300 118 L 520 118',
    de: 'F-P via 1 (depois do fusível e da chave)', para: 'DUT 1 · terminal +',
    leva: '24 V · ~127 mA',
    nota: 'Sai do porta-fusível já protegido. Vai direto para a câmara — NÃO passa pela PI-2.' },
  { id: 'P2+', nome: 'Positivo da posição 2', cor: '#e8590c', grupo: 'ida',
    d: 'M 196 118 L 286 118 L 286 262 L 520 262',
    de: 'F-P via 2', para: 'DUT 2 · terminal +',
    leva: '24 V · ~92 mA',
    nota: 'Mesma coisa da posição 1, pelo segundo fusível.' },
  { id: 'R1−', nome: 'Retorno da posição 1', cor: '#1971c2', grupo: 'volta',
    d: 'M 520 176 L 340 176 L 340 320 L 196 320',
    de: 'DUT 1 · terminal −', para: 'PI-2 · borne RET-1',
    leva: 'a mesma corrente que foi, voltando',
    nota: '⚠️ Este fio NÃO é o 0 V. Ele só vira 0 V depois de atravessar o resistor '
        + 'shunt dentro da PI-2 — e é justamente essa travessia que a gente mede.' },
  { id: 'R2−', nome: 'Retorno da posição 2', cor: '#0ca678', grupo: 'volta',
    d: 'M 520 320 L 360 320 L 360 344 L 196 344',
    de: 'DUT 2 · terminal −', para: 'PI-2 · borne RET-2',
    leva: 'a corrente da posição 2',
    nota: '⚠️ Os dois retornos são SEPARADOS. Se fossem um só, as correntes se somariam '
        + 'antes do shunt e não daria para saber qual posição parou.' },
];

/* ── o que existe dentro de cada caixa ───────────────────────────── */
const BLOCOS = [
  { id: 'BD24', nome: 'BD-24V', x: 20, y: 74, w: 56, h: 40, cor: '#e8590c',
    sub: '24 V permanente',
    diz: 'O barramento de serviços. Ele NÃO cai na emergência — os dispositivos sob '
       + 'ensaio continuam energizados e o sistema continua registrando.' },
  { id: 'FP', nome: 'F-P', x: 120, y: 74, w: 76, h: 64, cor: '#fab005',
    sub: '2 fusíveis + 2 chaves',
    diz: 'Porta-fusível de 2 vias com interruptor. O fusível de 500 mA protege contra '
       + 'curto; a chave permite DESLIGAR a posição na frente da banca e mostrar o '
       + 'sistema detectando a falha.' },
  { id: 'PI2', nome: 'PI-2', x: 120, y: 290, w: 76, h: 108, cor: '#ae3ec9',
    sub: 'mux + shunts + INA219',
    diz: 'A placa que mede. Recebe os retornos, faz cada um atravessar um resistor '
       + 'shunt, e o multiplexador escolhe qual dessas tensões entregar ao Arduino.' },
  { id: 'MEGA', nome: 'Arduino Mega', x: 20, y: 440, w: 176, h: 44, cor: '#0ca678',
    sub: 'A2 + D31–D34',
    diz: 'Escolhe o canal pelos 4 pinos de seleção e lê a tensão em A2. Como foi ele '
       + 'que escolheu, ele sabe de qual posição é a leitura.' },
  { id: 'DUT1', nome: 'DUT 1', x: 520, y: 96, w: 130, h: 80, cor: '#1971c2',
    sub: 'placa simuladora', ehDut: true,
    diz: 'Um LED que mostra "estou viva" e um resistor de potência que consome e '
       + 'aquece. Consome ~127 mA em 24 V.',
    nota: '❓ Por que 24 V se é só um LED? Porque o LED NÃO é a carga — ele gasta 18 mA. '
        + 'Quem trabalha é o resistor de potência, que precisa dissipar ~2,6 W para '
        + 'simular o calor de uma placa real. Em 5 V, os mesmos 2,6 W custariam 524 mA, '
        + 'e o shunt de 4,7 Ω comeria METADE da alimentação. Ver Doc 13 §13.3b.' },
  { id: 'DUT2', nome: 'DUT 2', x: 520, y: 240, w: 130, h: 80, cor: '#0ca678',
    sub: 'resistor diferente', ehDut: true,
    diz: 'Igual ao DUT 1, mas com resistor de 330 Ω — consome ~92 mA. Correntes '
       + 'diferentes provam que o sistema não usa um limiar único: cada posição é '
       + 'comparada com o normal dela.' },
];

export default function VistaDeteccao() {
  const [sel, setSel] = useState(null);
  const [seguir, setSeguir] = useState(null);

  const aceso = f => !seguir || seguir === f.id ||
    (seguir === 'loop1' && (f.id === 'P1+' || f.id === 'R1−'));

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflow: 'auto', padding: 16, background: '#eef1f5' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          <button onClick={() => setSeguir(seguir === 'loop1' ? null : 'loop1')}
            style={{
              background: seguir === 'loop1' ? '#1971c2' : '#fff',
              color: seguir === 'loop1' ? '#fff' : '#1971c2',
              border: '2px solid #1971c2', borderRadius: 7, padding: '7px 14px',
              cursor: 'pointer', fontSize: 12.5, fontWeight: 700,
            }}>
            ⚡ Seguir a corrente da posição 1
          </button>
          {seguir && (
            <button onClick={() => setSeguir(null)} style={{
              background: '#f1f3f5', border: '1px solid #ced4da', borderRadius: 7,
              padding: '7px 12px', cursor: 'pointer', fontSize: 12 }}>mostrar tudo</button>
          )}
        </div>

        <svg viewBox="0 0 780 520" style={{ width: '100%', background: '#fff',
             borderRadius: 8, boxShadow: '0 1px 6px #0002' }}>

          {/* áreas */}
          <rect x={8} y={40} width={400} height={468} rx={6} fill="#f8f9fa"
                stroke="#adb5bd" strokeWidth={1.5} strokeDasharray="6 4" />
          <text x={16} y={30} fontSize={13} fontWeight="700" fill="#495057">
            PAINEL DE COMANDO
          </text>

          <rect x={452} y={40} width={318} height={468} rx={6} fill="#e7f5ff"
                stroke="#74c0fc" strokeWidth={1.5} strokeDasharray="6 4" />
          <text x={460} y={30} fontSize={13} fontWeight="700" fill="#1971c2">
            CÂMARA
          </text>

          {/* a parede, com os 4 fios atravessando */}
          <rect x={PAREDE - 6} y={40} width={12} height={468} fill="#ced4da" />
          <text x={PAREDE} y={30} textAnchor="middle" fontSize={11} fontWeight="700"
                fill="#868e96">PAREDE</text>
          <text x={PAREDE} y={500} textAnchor="middle" fontSize={10} fill="#868e96">
            prensa-cabo
          </text>

          {/* fios */}
          {FIOS.map(f => (
            <g key={f.id} onClick={() => { setSel(f); setSeguir(null); }}
               style={{ cursor: 'pointer' }}>
              <path d={f.d} fill="none" stroke="transparent" strokeWidth={16} />
              <path d={f.d} fill="none" stroke={f.cor}
                    strokeWidth={sel?.id === f.id || seguir ? 4 : 2.6}
                    opacity={aceso(f) ? 1 : 0.12}
                    strokeLinecap="round" strokeLinejoin="round" />
              {/* seta indicando o sentido */}
              <circle r={4} fill={f.cor} opacity={aceso(f) ? 1 : 0.12}>
                <animateMotion dur="3s" repeatCount="indefinite" path={f.d} />
              </circle>
            </g>
          ))}

          {/* dentro da PI-2 */}
          <g opacity={0.95}>
            <rect x={210} y={290} width={190} height={108} rx={5} fill="#f8f0ff"
                  stroke="#ae3ec9" strokeWidth={1.2} strokeDasharray="4 3" />
            <text x={305} y={306} textAnchor="middle" fontSize={9.5} fontWeight="700"
                  fill="#862e9c">DENTRO DA PI-2</text>
            {/* shunt 1 */}
            <rect x={222} y={314} width={30} height={12} rx={2} fill="#c9b28a"
                  stroke="#8d7c5e" strokeWidth={0.8} />
            <text x={237} y={311} textAnchor="middle" fontSize={7.5} fill="#495057">
              shunt 4,7 Ω
            </text>
            <line x1={196} y1={320} x2={222} y2={320} stroke="#1971c2" strokeWidth={2} />
            <line x1={252} y1={320} x2={276} y2={320} stroke="#212529" strokeWidth={2} />
            <text x={288} y={323} fontSize={8} fill="#212529">0 V</text>
            <line x1={237} y1={314} x2={237} y2={356} stroke="#ae3ec9" strokeWidth={1.6} />
            {/* shunt 2 */}
            <rect x={222} y={338} width={30} height={12} rx={2} fill="#c9b28a"
                  stroke="#8d7c5e" strokeWidth={0.8} />
            <line x1={196} y1={344} x2={222} y2={344} stroke="#0ca678" strokeWidth={2} />
            <line x1={252} y1={344} x2={276} y2={344} stroke="#212529" strokeWidth={2} />
            <line x1={247} y1={344} x2={247} y2={358} stroke="#ae3ec9" strokeWidth={1.6} />
            {/* mux */}
            <rect x={310} y={352} width={74} height={34} rx={3} fill="#ae3ec9" />
            <text x={347} y={366} textAnchor="middle" fontSize={9} fontWeight="700"
                  fill="#fff">CD74HC4067</text>
            <text x={347} y={378} textAnchor="middle" fontSize={8} fill="#e5dbff">
              16 canais → 1
            </text>
            <path d="M 237 356 L 300 356 L 300 362 L 310 362" fill="none"
                  stroke="#ae3ec9" strokeWidth={1.6} />
            <path d="M 247 358 L 296 358 L 296 372 L 310 372" fill="none"
                  stroke="#ae3ec9" strokeWidth={1.6} />
            {/* INA219 */}
            <rect x={222} y={366} width="46" height={16} rx={2} fill="#5f3dc4" />
            <text x={245} y={377} textAnchor="middle" fontSize={7.5} fill="#fff">
              INA219 ref.
            </text>
          </g>

          {/* mux -> arduino */}
          <path d="M 384 369 L 400 369 L 400 420 L 108 420 L 108 440" fill="none"
                stroke="#ae3ec9" strokeWidth={2.4} />
          <text x={250} y={415} textAnchor="middle" fontSize={9} fontWeight="700"
                fill="#862e9c">SIG → Arduino A2</text>
          <path d="M 60 440 L 60 410 L 330 410 L 330 386" fill="none"
                stroke="#868e96" strokeWidth={1.8} strokeDasharray="4 3" />
          <text x={150} y={404} fontSize={8.5} fill="#868e96">
            S0–S3 · o Arduino escolhe o canal
          </text>

          {/* blocos */}
          {BLOCOS.map(b => (
            <g key={b.id} onClick={() => { setSel(b); setSeguir(null); }}
               style={{ cursor: 'pointer' }}>
              <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={4}
                    fill="#fff" stroke={b.cor}
                    strokeWidth={sel?.id === b.id ? 3 : 1.8} />
              <rect x={b.x} y={b.y} width={b.w} height={15} rx={4} fill={b.cor} />
              <text x={b.x + b.w / 2} y={b.y + 11} textAnchor="middle" fontSize={9.5}
                    fontWeight="700" fill="#fff">{b.nome}</text>
              <text x={b.x + b.w / 2} y={b.y + 28} textAnchor="middle" fontSize={8}
                    fill="#868e96">{b.sub}</text>

              {/* o circuito do DUT, desenhado por dentro */}
              {b.ehDut && (
                <>
                  <line x1={b.x} y1={b.y + 22} x2={b.x + 16} y2={b.y + 22}
                        stroke="#495057" strokeWidth={1.4} />
                  <text x={b.x - 4} y={b.y + 25} textAnchor="end" fontSize={8}
                        fontWeight="700" fill="#c92a2a">+</text>
                  <rect x={b.x + 24} y={b.y + 36} width={20} height={8} rx={1}
                        fill="#c9b28a" stroke="#8d7c5e" strokeWidth={0.6} />
                  <text x={b.x + 34} y={b.y + 34} textAnchor="middle" fontSize={7}
                        fill="#495057">1,2 k</text>
                  <circle cx={b.x + 58} cy={b.y + 40} r={5} fill="#40c057" />
                  <text x={b.x + 70} y={b.y + 43} fontSize={7.5} fill="#495057">LED</text>
                  <rect x={b.x + 24} y={b.y + 58} width={26} height={9} rx={1}
                        fill="#c9b28a" stroke="#8d7c5e" strokeWidth={0.6} />
                  <text x={b.x + 37} y={b.y + 56} textAnchor="middle" fontSize={7}
                        fill="#495057">{b.id === 'DUT1' ? '220 Ω 5 W' : '330 Ω 5 W'}</text>
                  <line x1={b.x + 16} y1={b.y + 22} x2={b.x + 16} y2={b.y + 62}
                        stroke="#495057" strokeWidth={1.2} />
                  <line x1={b.x + 16} y1={b.y + 40} x2={b.x + 24} y2={b.y + 40}
                        stroke="#495057" strokeWidth={1.2} />
                  <line x1={b.x + 16} y1={b.y + 62} x2={b.x + 24} y2={b.y + 62}
                        stroke="#495057" strokeWidth={1.2} />
                  <line x1={b.x + 50} y1={b.y + 62} x2={b.x + 92} y2={b.y + 62}
                        stroke="#495057" strokeWidth={1.2} />
                  <line x1={b.x + 63} y1={b.y + 40} x2={b.x + 92} y2={b.y + 40}
                        stroke="#495057" strokeWidth={1.2} />
                  <line x1={b.x + 92} y1={b.y + 40} x2={b.x + 92} y2={b.y + 80}
                        stroke="#495057" strokeWidth={1.4} />
                  <line x1={b.x} y1={b.y + 80} x2={b.x + 92} y2={b.y + 80}
                        stroke="#495057" strokeWidth={1.4} />
                  <text x={b.x - 4} y={b.y + 83} textAnchor="end" fontSize={8}
                        fontWeight="700" fill="#1971c2">−</text>
                </>
              )}
            </g>
          ))}

          {/* contagem dos fios na parede */}
          <rect x={PAREDE - 44} y={430} width={88} height={30} rx={4} fill="#fff3bf"
                stroke="#f59f00" strokeWidth={1.2} />
          <text x={PAREDE} y={444} textAnchor="middle" fontSize={10} fontWeight="700"
                fill="#a26200">4 FIOS</text>
          <text x={PAREDE} y={455} textAnchor="middle" fontSize={8} fill="#a26200">
            2 idas + 2 voltas
          </text>
        </svg>
      </div>

      <aside style={{ width: 370, background: '#fff', borderLeft: '1px solid #dee2e6',
                      overflowY: 'auto', padding: '14px 16px', flexShrink: 0 }}>
        {!sel && (
          <>
            <h3 style={{ fontSize: 13, margin: '0 0 10px', color: '#868e96',
                         letterSpacing: 0.4 }}>OS 4 FIOS QUE SAEM DO PAINEL</h3>
            {FIOS.map(f => (
              <div key={f.id} onClick={() => setSel(f)} style={{
                fontSize: 11.5, padding: '7px 10px', marginBottom: 5, borderRadius: 5,
                cursor: 'pointer', background: '#f8f9fa',
                borderLeft: `4px solid ${f.cor}`,
              }}>
                <b>{f.nome}</b>
                <div style={{ color: '#868e96', marginTop: 2 }}>{f.de} → {f.para}</div>
              </div>
            ))}
            <div style={{ marginTop: 12, padding: 12, background: '#fff5f5',
                          border: '2px solid #ffc9c9', borderRadius: 7, fontSize: 12,
                          color: '#c92a2a', lineHeight: 1.55 }}>
              <b>⚠️ Nenhum dos 4 é o 0 V.</b>
              <div style={{ marginTop: 5 }}>
                Dois levam 24 V para os dispositivos e dois trazem a corrente de volta.
                O <b>retorno só vira 0 V depois de atravessar o shunt</b>, já dentro
                da PI-2 — e é essa travessia que a medição enxerga.
              </div>
            </div>
            <div style={{ marginTop: 10, padding: 12, background: '#e7f5ff',
                          borderRadius: 7, fontSize: 12, color: '#0b4a86',
                          lineHeight: 1.55 }}>
              <b>⭐ Por que 2 retornos e não 1</b>
              <div style={{ marginTop: 5 }}>
                Se os dois dispositivos dividissem o mesmo fio de volta, as correntes
                se somariam antes do shunt. O sistema veria "caiu 127 mA" sem saber de
                quem — e a pergunta que o projeto existe para responder é justamente
                <b> qual</b> parou.
              </div>
            </div>
          </>
        )}

        {sel && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between',
                          alignItems: 'start' }}>
              <b style={{ fontSize: 15.5, color: sel.cor }}>{sel.nome}</b>
              <button onClick={() => setSel(null)} style={{
                background: '#f1f3f5', border: 'none', borderRadius: 5, width: 24,
                height: 24, cursor: 'pointer' }}>×</button>
            </div>
            {sel.de && (
              <table style={{ width: '100%', fontSize: 11.5, marginTop: 9 }}>
                <tbody>
                  <tr><td style={{ color: '#868e96', paddingRight: 8 }}>De</td>
                      <td style={{ fontWeight: 600 }}>{sel.de}</td></tr>
                  <tr><td style={{ color: '#868e96' }}>Para</td>
                      <td style={{ fontWeight: 600 }}>{sel.para}</td></tr>
                  <tr><td style={{ color: '#868e96' }}>Leva</td>
                      <td>{sel.leva}</td></tr>
                </tbody>
              </table>
            )}
            <div style={{ fontSize: 12, color: '#343a40', marginTop: 10,
                          lineHeight: 1.6 }}>{sel.diz ?? sel.nota}</div>
            {sel.diz && sel.nota && (
              <div style={{ fontSize: 12, color: '#a06000', marginTop: 8 }}>{sel.nota}</div>
            )}
          </>
        )}
      </aside>
    </div>
  );
}
