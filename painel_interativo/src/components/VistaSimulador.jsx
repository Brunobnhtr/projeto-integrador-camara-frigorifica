import { useState, useRef, useEffect, useCallback } from 'react';
import {
  criarSimulador, passo, foto,
  iniciarPelaIHM, pararPelaIHM, pararPeloMQTT, iniciarPeloMQTT,
} from '../sim/index.js';
import { consumo, LIMITES } from '../sim/energia.js';

/* ═══════════════════════════════════════════════════════════════════
   O PAINEL OPERÁVEL
   Aqui o desenho deixa de ser desenho. Os quatro botões funcionam, os
   dois selos selam de verdade, e a temperatura responde ao que a
   Peltier está fazendo.

   ⭐ Nada nesta tela decide coisa nenhuma: ela só desenha o que
     src/sim/ calculou. É a mesma lógica que o `npm run simula` valida
     contra a tabela de estados do Doc 31 — então o que você vê aqui é
     exatamente o que os 107 testes provam.
   ══════════════════════════════════════════════════════════════════ */

const VIVO = '#40c057', MORTO = '#adb5bd', ALERTA = '#fa5252', ATENCAO = '#fab005';
const CX = { fundo: '#f8f9fa', borda: '#dee2e6', texto: '#212529', fraco: '#868e96' };

/**
 * Tudo o que a tela precisa, congelado num objeto simples.
 * ⭐ O simulador MUTÁVEL vive fora do React, num ref. A tela só enxerga
 *   este instantâneo — então o render é uma função pura, e é literalmente
 *   verdade que nada aqui decide coisa nenhuma.
 */
function instantaneo(sim) {
  return {
    ...foto(sim),
    consumo: consumo(sim),
    botoes: { ...sim.botoes },
    falhas: { ...sim.falhas },
    setpoint: sim.setpoint,
    duty: sim.firmware.duty,
    t: sim.t,
  };
}

export default function VistaSimulador() {
  const simRef = useRef(null);
  const [s, setS] = useState(null);
  const [rodando, setRodando] = useState(true);
  const [veloc, setVeloc] = useState(10);
  const [log, setLog] = useState([]);
  const ultimo = useRef({});

  /* ── nasce dentro de um efeito, nunca durante o render ──────────── */
  useEffect(() => {
    simRef.current = criarSimulador({ tCamara: 25, setpoint: 5 });
    setS(instantaneo(simRef.current));
  }, []);

  /* ── o diário de bordo: registra só o que MUDA ──────────────────── */
  const registrar = useCallback((novo) => {
    const u = ultimo.current, ev = [];
    const marca = (k, texto, cor) => {
      if (u[k] !== novo[k]) { ev.push({ texto, cor, t: (novo.t / 1000).toFixed(0) }); u[k] = novo[k]; }
    };
    marca('estado', `estado → ${novo.estado}${novo.alerta ? ` (${novo.alerta})` : ''}`,
      novo.estado === 'EMERGENCIA' || novo.estado === 'FALHA' ? ALERTA : CX.texto);
    marca('ka1', `selo do KA1 ${novo.ka1 ? 'FEITO' : 'PERDIDO'}`, novo.ka1 ? VIVO : ALERTA);
    marca('ka2', `selo do KA2 ${novo.ka2 ? 'FEITO' : 'PERDIDO'}`, novo.ka2 ? VIVO : ALERTA);
    marca('bdPot', `BD-POT → ${novo.bdPot} V`, novo.bdPot ? VIVO : ALERTA);
    marca('ventRadiador', `ventoinha do radiador ${novo.ventRadiador ? 'ligada' : 'desligada'}`, CX.fraco);
    if (ev.length) setLog(l => [...ev, ...l].slice(0, 40));
  }, []);

  /* ── o relógio ─────────────────────────────────────────────────── */
  useEffect(() => {
    if (!rodando) return;
    const id = setInterval(() => {
      const sim = simRef.current;
      if (!sim) return;
      for (let i = 0; i < veloc; i++) passo(sim, 100);
      const novo = instantaneo(sim);
      setS(novo); registrar(novo);
    }, 100);
    return () => clearInterval(id);
  }, [rodando, veloc, registrar]);

  /* ── ações: mexem no simulador e devolvem um instantâneo novo ────── */
  const mexer = useCallback((fn) => {
    const sim = simRef.current;
    if (!sim) return;
    fn(sim);
    const novo = instantaneo(sim);
    setS(novo); registrar(novo);
  }, [registrar]);

  const pulso = useCallback((b) => mexer(sim => {
    sim.botoes[b] = true; passo(sim, 60);
    sim.botoes[b] = false; passo(sim, 60);
  }), [mexer]);

  const alternar = useCallback((onde, chave) => mexer(sim => {
    sim[onde][chave] = !sim[onde][chave];
    passo(sim, 60);
  }), [mexer]);

  const reiniciar = useCallback(() => {
    const alvo = simRef.current?.setpoint ?? 5;
    simRef.current = criarSimulador({ tCamara: 25, setpoint: alvo });
    ultimo.current = {}; setLog([]);
    setS(instantaneo(simRef.current));
  }, []);

  if (!s) return <div style={{ padding: 30, color: CX.fraco }}>iniciando o simulador…</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(430px,1.15fr) minmax(360px,1fr)',
                  gap: 14, padding: 14, alignItems: 'start', background: CX.fundo,
                  fontFamily: 'system-ui, sans-serif', color: CX.texto }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Guia s={s} />
        <Cadeia s={s} />
        <Barramentos s={s} />
        <Processo s={s} onSetpoint={v => mexer(sim => { sim.setpoint = v; })} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Relogio {...{ s, rodando, setRodando, veloc, setVeloc, reiniciar }} />
        <Botoeiras s={s} pulso={pulso} alternar={alternar} />
        <Comandos s={s} mexer={mexer} />
        <Falhas s={s} alternar={alternar} />
        <Diario log={log} />
      </div>
    </div>
  );
}


/* ═══ O GUIA — sem ele, apertar botão "não faz nada" ═══════════════
   ⭐ Este painel tem uma SEQUÊNCIA, e ela é a coisa mais importante do
     projeto: azul → verde → INICIAR. Apertar fora de ordem não faz
     nada, e isso é o comportamento CORRETO — os dois selos existem
     justamente para impedir atalho.

     Mas "correto e silencioso" é indistinguível de "quebrado" para
     quem está olhando. Então a tela diz, a cada momento, qual é o
     próximo passo e por que os outros não funcionam ainda.        */
function Guia({ s }) {
  const b = s.botoes;
  let passo, porque, cor = '#1971c2';

  if (s.falhas.geralDesligada) {
    passo = 'Ligue a chave geral'; porque = 'Sem ela não há tensão em lugar nenhum.'; cor = ALERTA;
  } else if (b.s0Emergencia) {
    passo = '1. Destrave o cogumelo';
    porque = 'Ele está socado e TRAVADO. Destravar não religa nada — é só o primeiro de três passos.';
    cor = ALERTA;
  } else if (!s.ka1) {
    passo = '2. Aperte o REARME (azul)';
    porque = 'O selo do KA1 está aberto, então a cadeia de comando está morta. O verde não faz nada enquanto isso.';
  } else if (!s.ka2) {
    passo = '3. Aperte o LIGAR (verde)';
    porque = 'O KA1 já está selado, mas a potência ainda não foi armada — o BD-POT está em 0 V. O INICIAR da IHM vai recusar.';
  } else if (s.estado === 'FALHA') {
    passo = 'Reconheça o alarme: aperte o STOP';
    porque = `Trip por ${s.alerta}. Depois de reconhecer, ainda será preciso o verde para rearmar a potência.`;
    cor = ALERTA;
  } else if (s.estado !== 'RODANDO') {
    passo = '4. Aperte INICIAR na IHM';
    porque = 'A potência está armada (24 V no BD-POT) e a máquina está pronta. Agora sim o ensaio começa.';
    cor = '#2f9e44';
  } else {
    passo = '▶ Rodando';
    porque = 'Experimente: soque o cogumelo, marque "BTS7960 em curto" ou trave a ventoinha, e veja o que acontece.';
    cor = '#2f9e44';
  }

  return (
    <div style={{ background: `${cor}12`, border: `2px solid ${cor}`, borderRadius: 8,
                  padding: '11px 13px' }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: cor }}>{passo}</div>
      <div style={{ fontSize: 11.5, color: CX.texto, marginTop: 4, lineHeight: 1.5 }}>{porque}</div>
    </div>
  );
}

/* ═══ A CADEIA DE COMANDO, ao vivo ═════════════════════════════════ */
function Cadeia({ s: f }) {
  const b = f.botoes;
  const vivoAte = {
    entrada: f.bd5v > 0,
    posEmerg: f.bd5v > 0 && !b.s0Emergencia,
    ka1: f.ka1,
    posStop: f.ka1 && !b.s2Stop,
    ka2: f.ka2,
  };
  const fio = (ok) => ({ stroke: ok ? VIVO : MORTO, strokeWidth: ok ? 3.5 : 2 });

  return (
    <Cartao titulo="A cadeia de comando" sub="verde = tem tensão · cinza = morto">
      <svg viewBox="0 0 430 210" style={{ width: '100%' }}>
        <text x="6" y="14" fontSize="9" fill={CX.fraco}>ESTÁGIO 1 · SEGURANÇA</text>
        <line x1="12" y1="42" x2="60" y2="42" {...fio(vivoAte.entrada)} />
        <text x="12" y="34" fontSize="8" fill={CX.fraco}>BD-24V</text>
        <Contato x={60} y={42} on={!b.s0Emergencia} rot="S0 · NF" cor={b.s0Emergencia ? ALERTA : VIVO} />
        <line x1="100" y1="42" x2="150" y2="42" {...fio(vivoAte.posEmerg)} />
        <Contato x={150} y={42} on={b.s3Rearme} rot="S3 · NA" cor={b.s3Rearme ? VIVO : MORTO} />
        <Contato x={150} y={72} on={f.ka1} rot="SELO KA1" cor={f.ka1 ? VIVO : MORTO} />
        <line x1="150" y1="42" x2="150" y2="72" {...fio(vivoAte.posEmerg)} />
        <line x1="190" y1="42" x2="230" y2="42" {...fio(vivoAte.ka1)} />
        <line x1="190" y1="72" x2="230" y2="72" {...fio(vivoAte.ka1)} />
        <line x1="230" y1="42" x2="230" y2="72" {...fio(vivoAte.ka1)} />
        <Bobina x={230} y={42} nome="KA1" on={f.ka1} />

        <text x="6" y="118" fontSize="9" fill={CX.fraco}>ESTÁGIO 2 · PROCESSO</text>
        <line x1="12" y1="146" x2="60" y2="146" {...fio(vivoAte.ka1)} />
        <text x="12" y="138" fontSize="8" fill={CX.fraco}>KA1 · 14</text>
        <Contato x={60} y={146} on={!b.s2Stop} rot="S2 · NF" cor={b.s2Stop ? ALERTA : VIVO} />
        <line x1="100" y1="146" x2="150" y2="146" {...fio(vivoAte.posStop)} />
        <Contato x={150} y={146} on={b.s1Verde} rot="S1 · NA" cor={b.s1Verde ? VIVO : MORTO} />
        <Contato x={150} y={176} on={f.ka2} rot="SELO KA2" cor={f.ka2 ? VIVO : MORTO} />
        <line x1="150" y1="146" x2="150" y2="176" {...fio(vivoAte.posStop)} />
        <line x1="190" y1="146" x2="230" y2="146" {...fio(vivoAte.ka2)} />
        <line x1="190" y1="176" x2="230" y2="176" {...fio(vivoAte.ka2)} />
        <line x1="230" y1="146" x2="230" y2="176" {...fio(vivoAte.ka2)} />
        <Bobina x={230} y={146} nome="KA2" on={f.ka2} />
        <line x1="272" y1="161" x2="310" y2="161" {...fio(vivoAte.ka2)} />
        <Contato x={310} y={161} on={f.ka3} rot="KA3 · firmware" cor={f.ka3 ? VIVO : ALERTA} />
        <line x1="350" y1="161" x2="400" y2="161" {...fio(vivoAte.ka2)} />
        <text x="356" y="153" fontSize="8" fill={CX.fraco}>0 V</text>
      </svg>
      <p style={{ margin: '2px 4px 0', fontSize: 11, color: CX.fraco, lineHeight: 1.5 }}>
        O <b>KA3</b> está <b>em série</b> com a bobina do KA2 — em série ele só pode
        derrubar, nunca segurar contra uma botoeira.
      </p>
    </Cartao>
  );
}

function Contato({ x, y, on, rot, cor }) {
  return (
    <g>
      <line x1={x} y1={y} x2={x + 8} y2={y} stroke={cor} strokeWidth="2.5" />
      <line x1={x + 8} y1={y} x2={x + 32} y2={on ? y : y - 9} stroke={cor} strokeWidth="2.5" />
      <line x1={x + 32} y1={y} x2={x + 40} y2={y} stroke={cor} strokeWidth="2.5" />
      <circle cx={x + 8} cy={y} r="2.5" fill={cor} />
      <circle cx={x + 32} cy={y} r="2.5" fill={cor} />
      <text x={x + 20} y={y + 17} fontSize="7.5" fill={CX.fraco} textAnchor="middle">{rot}</text>
    </g>
  );
}

function Bobina({ x, y, nome, on }) {
  return (
    <g>
      <rect x={x} y={y} width="42" height="30" rx="4"
            fill={on ? '#d3f9d8' : '#f1f3f5'} stroke={on ? VIVO : MORTO} strokeWidth="2" />
      <text x={x + 21} y={y + 19} fontSize="11" fontWeight="700" textAnchor="middle"
            fill={on ? '#2b8a3e' : CX.fraco}>{nome}</text>
    </g>
  );
}

/* ═══ BARRAMENTOS + CONSUMO ════════════════════════════════════════ */
function Barramentos({ s: f }) {
  const c = f.consumo;
  const linhas = [
    ['BD-POT', f.bdPot, c['BD-POT'], LIMITES.F1, '⚡ comutado — morre na emergência'],
    ['BD-AUX', f.bdAux, c['BD-AUX'], LIMITES.caboT3, 'permanente — ventoinhas'],
    ['BD-5V', f.bd5v, c['BD-5V'], LIMITES.caboT2, 'permanente — eletrônica'],
  ];
  return (
    <Cartao titulo="Barramentos" sub={`fonte: ${c.fonte.toFixed(2)} A de ${LIMITES.fonte24} A · ${c.potenciaTotal.toFixed(0)} W`}>
      {linhas.map(([nome, v, i, lim, obs]) => {
        const pct = Math.min(100, 100 * i / lim);
        return (
          <div key={nome} style={{ marginBottom: 9 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5 }}>
              <span><b style={{ color: v > 0 ? '#2b8a3e' : CX.fraco }}>{nome}</b>
                <span style={{ color: CX.fraco, marginLeft: 6 }}>{obs}</span></span>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                <b style={{ color: v > 0 ? '#2b8a3e' : ALERTA }}>{v.toFixed(1)} V</b>
                <span style={{ color: CX.fraco }}> · {i.toFixed(2)} A</span>
              </span>
            </div>
            <div style={{ height: 5, background: '#e9ecef', borderRadius: 3, marginTop: 3 }}>
              <div style={{ height: '100%', width: `${pct}%`, borderRadius: 3,
                            background: pct > 90 ? ALERTA : pct > 75 ? ATENCAO : VIVO }} />
            </div>
          </div>
        );
      })}
    </Cartao>
  );
}

/* ═══ PROCESSO ═════════════════════════════════════════════════════ */
function Processo({ s: f, onSetpoint }) {
  const cores = { RESFRIAMENTO: '#1971c2', AQUECIMENTO: '#e8590c', PARADO: CX.fraco, DEGELO: '#7048e8' };
  return (
    <Cartao titulo="Processo" sub={`${f.estado}${f.alerta ? ` · ${f.alerta}` : ''}`}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
        <Numero rot="câmara" val={`${f.tCamara.toFixed(1)} °C`} cor={cores[f.modo]} />
        <Numero rot="setpoint" val={`${f.setpoint.toFixed(0)} °C`} />
        <Numero rot="dissipador" val={`${f.tDissipador.toFixed(0)} °C`}
                cor={f.tDissipador > 55 ? ALERTA : undefined} />
      </div>
      <input type="range" min="-5" max="60" value={f.setpoint} style={{ width: '100%' }}
             onChange={e => onSetpoint(+e.target.value)} />
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
        <Selo on={f.renPeltier} txt="R_EN Peltier" />
        <Selo on={f.renPtc} txt="R_EN PTC" />
        <Selo on={f.ventRadiador} txt="🌀 radiador" />
        <Selo on={f.ventInternas} txt="🌀 5 internas" />
        <Selo on={f.modo !== 'PARADO'} txt={`duty ${f.duty.toFixed(0)} %`} />
      </div>
    </Cartao>
  );
}

function Numero({ rot, val, cor }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${CX.borda}`, borderRadius: 6, padding: '7px 9px' }}>
      <div style={{ fontSize: 9.5, color: CX.fraco, textTransform: 'uppercase' }}>{rot}</div>
      <div style={{ fontSize: 19, fontWeight: 700, color: cor ?? CX.texto,
                    fontVariantNumeric: 'tabular-nums' }}>{val}</div>
    </div>
  );
}

function Selo({ on, txt }) {
  return (
    <span style={{ fontSize: 10.5, padding: '3px 8px', borderRadius: 11, fontWeight: 600,
                   background: on ? '#d3f9d8' : '#f1f3f5', color: on ? '#2b8a3e' : CX.fraco,
                   border: `1px solid ${on ? '#8ce99a' : CX.borda}` }}>{txt}</span>
  );
}

/* ═══ CONTROLES ════════════════════════════════════════════════════ */
function Relogio({ s, rodando, setRodando, veloc, setVeloc, reiniciar }) {
  const min = Math.floor(s.t / 60000), seg = Math.floor((s.t % 60000) / 1000);
  return (
    <Cartao titulo="Tempo" sub={`${min}:${String(seg).padStart(2, '0')} de ensaio`}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <Botao cor={rodando ? ATENCAO : VIVO} onClick={() => setRodando(r => !r)}>
          {rodando ? '⏸ pausar' : '▶ rodar'}
        </Botao>
        {[1, 10, 60].map(v => (
          <button key={v} onClick={() => setVeloc(v)} style={{
            padding: '6px 10px', fontSize: 11.5, cursor: 'pointer', borderRadius: 5,
            border: `1px solid ${veloc === v ? '#1971c2' : CX.borda}`, fontWeight: 600,
            background: veloc === v ? '#d0ebff' : '#fff', color: CX.texto }}>{v}×</button>
        ))}
        <Botao cor="#868e96" onClick={reiniciar}>↺ reiniciar</Botao>
      </div>
    </Cartao>
  );
}

function Botoeiras({ s: f, pulso, alternar }) {
  const emerg = f.botoes.s0Emergencia;
  return (
    <Cartao titulo="Botoeiras da porta" sub="pulso — aperta e solta, como na vida real">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
        <Botao cor="#2f9e44" pisca={f.ka1 && !f.ka2 && !emerg}
               onClick={() => pulso('s1Verde')}>S1 · LIGAR (verde)</Botao>
        <Botao cor="#212529" onClick={() => pulso('s2Stop')}>S2 · STOP (preto)</Botao>
        <Botao cor="#1971c2" pisca={!f.ka1 && !emerg}
               onClick={() => pulso('s3Rearme')}>S3 · REARME (azul)</Botao>
        <Botao cor={emerg ? '#e03131' : '#c92a2a'}
               onClick={() => alternar('botoes', 's0Emergencia')}>
          {emerg ? '↻ destravar cogumelo' : '⛔ S0 · EMERGÊNCIA'}
        </Botao>
      </div>
      {emerg && (
        <Aviso cor={ALERTA}>
          Cogumelo <b>socado e travado</b>. Destravar não religa nada — só o REARME azul
          refaz o selo do KA1, e depois ainda falta o verde.
        </Aviso>
      )}
      {!f.ka2 && f.ka1 && !emerg && (
        <Aviso cor={ATENCAO}>
          Selo do KA2 perdido. <b>Só o botão verde</b> traz os 24 V de volta — a IHM não consegue.
        </Aviso>
      )}
    </Cartao>
  );
}

function Comandos({ s: f, mexer }) {
  const podeIniciar = f.estado === 'AGUARDA_START';
  return (
    <Cartao titulo="IHM e dashboard remoto" sub="quem pode o quê">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
        <Botao cor={podeIniciar ? '#2f9e44' : '#ced4da'} pisca={podeIniciar && f.bdPot > 0}
               onClick={() => mexer(iniciarPelaIHM)}>
          IHM · INICIAR
        </Botao>
        <Botao cor="#495057" onClick={() => mexer(pararPelaIHM)}>IHM · PARAR</Botao>
        <Botao cor="#adb5bd" onClick={() => mexer(sim => iniciarPeloMQTT(sim))}>
          MQTT · iniciar ⛔
        </Botao>
        <Botao cor="#495057" onClick={() => mexer(pararPeloMQTT)}>MQTT · parar</Botao>
      </div>
      <Aviso cor="#1971c2">
        O <b>MQTT nunca inicia</b>: comando que leva ao estado energizado exige alguém na
        frente da máquina. Parar, qualquer um pode, de qualquer lugar.
      </Aviso>
    </Cartao>
  );
}

const FALHAS = [
  ['arduinoMorto', 'Arduino morre', 'o KA3 abre e a potência cai — e não volta sozinha'],
  ['btsPeltierEmCurto', '🔥 BTS7960 em curto', 'conduz ignorando o R_EN. Só o KA3 ou as botoeiras param'],
  ['fanTravada', 'Ventoinha travada', 'RPM = 0 → trip em 5 s, com corte físico'],
  ['ds18Solto', 'DS18B20 solto', 'lê −127 °C → conta como QUENTE e a ventoinha LIGA'],
  ['ka3Colado', 'Contato do KA3 soldado', 'o veto do firmware some; as botoeiras seguem'],
  ['ka2Colado', '🔥 Contato do KA2 soldado', 'nem o STOP nem a emergência cortam. Só a chave geral'],
  ['geralDesligada', 'Chave geral desligada', 'tudo morre, inclusive a eletrônica'],
];

function Falhas({ s, alternar }) {
  const algumaAtiva = Object.values(s.falhas).some(Boolean);
  return (
    <Cartao titulo="Injeção de falhas" sub={algumaAtiva ? '⚠️ há falha ativa' : 'tudo são'}>
      {FALHAS.map(([k, nome, efeito]) => (
        <label key={k} style={{ display: 'flex', gap: 8, alignItems: 'flex-start',
                                padding: '4px 0', cursor: 'pointer', fontSize: 11.5 }}>
          <input type="checkbox" checked={s.falhas[k]} style={{ marginTop: 2 }}
                 onChange={() => alternar('falhas', k)} />
          <span><b>{nome}</b><br /><span style={{ color: CX.fraco }}>{efeito}</span></span>
        </label>
      ))}
    </Cartao>
  );
}

function Diario({ log }) {
  return (
    <Cartao titulo="Diário de bordo" sub="só o que mudou">
      <div style={{ maxHeight: 190, overflowY: 'auto', fontSize: 11,
                    fontFamily: 'ui-monospace, monospace' }}>
        {log.length === 0 && <div style={{ color: CX.fraco }}>nada aconteceu ainda</div>}
        {log.map((e, i) => (
          <div key={i} style={{ padding: '2px 0', color: e.cor }}>
            <span style={{ color: CX.fraco }}>{String(e.t).padStart(4)}s </span>{e.texto}
          </div>
        ))}
      </div>
    </Cartao>
  );
}

/* ═══ PEÇAS DE INTERFACE ═══════════════════════════════════════════ */
function Cartao({ titulo, sub, children }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${CX.borda}`, borderRadius: 8,
                  padding: '11px 13px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                    marginBottom: 9 }}>
        <b style={{ fontSize: 13 }}>{titulo}</b>
        <span style={{ fontSize: 10.5, color: CX.fraco }}>{sub}</span>
      </div>
      {children}
    </div>
  );
}

function Botao({ cor, onClick, children, pisca }) {
  return (
    <button onClick={onClick} style={{
      padding: '9px 10px', fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
      borderRadius: 6, background: cor, color: '#fff',
      border: pisca ? '3px solid #ffd43b' : '3px solid transparent',
      boxShadow: pisca ? '0 0 0 3px #ffd43b55' : 'none' }}>{children}</button>
  );
}

function Aviso({ cor, children }) {
  return (
    <div style={{ marginTop: 9, fontSize: 11, lineHeight: 1.5, padding: '7px 9px',
                  borderRadius: 5, background: `${cor}14`, border: `1px solid ${cor}55`,
                  color: CX.texto }}>{children}</div>
  );
}
