import { useState, useRef, useEffect, useCallback } from 'react';
import {
  criarSimulador, passo, foto,
  iniciarPelaIHM, pararPelaIHM, pararPeloMQTT, iniciarPeloMQTT,
} from '../sim/index.js';
import { consumo, LIMITES } from '../sim/energia.js';
import { RECEITA_PADRAO } from '../sim/firmware.js';

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
    faixa: { ...sim.faixa },
    receita: sim.receita,
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
    const faixa = simRef.current?.faixa ?? { min: 4, max: 6 };
    simRef.current = criarSimulador({ tCamara: 25, faixa });
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
        <Receita s={s} onReceita={r => mexer(sim => { sim.receita = r; })} />
        <Camara s={s} />
        <Processo s={s} onFaixa={(min, max) => mexer(sim => { sim.faixa = { min, max }; })} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Vigilancia s={s} />
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


/* ═══ VIGILÂNCIA MÚTUA ═════════════════════════════════════════════
   ⭐ Os dois ESP32 escutam o JSON que o Mega publica a 1 Hz. Silêncio
     por 3 s = o Mega morreu, e os dois acusam INDEPENDENTEMENTE.

     O ponto sutil: eles CONTAM, não ATUAM. Quando o Mega morre, quem
     corta a potência é o pull-down no gate do KA3 — hardware, sem
     software nenhum no caminho. Dar poder de atuação aos ESP faria a
     história de segurança PIOR, não melhor: seriam três atores no
     mesmo circuito em vez de um.                                    */
function Vigilancia({ s }) {
  const cai = s.megaSumido;
  return (
    <Cartao titulo="Vigilância mútua" sub="os 3 processadores se escutam">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 7 }}>
        <Vigia nome="Arduino Mega" papel="controla" ok={!cai} />
        <Vigia nome="ESP32 · IHM" papel="mostra" ok={s.bd5v > 0} />
        <Vigia nome="ESP32 · IoT" papel="publica" ok={s.bd5v > 0} />
      </div>
      {cai && (
        <Aviso cor={ALERTA}>
          🔴 <b>ARDUINO SEM RESPOSTA há {s.silencioMega} s.</b> Os dois ESP32 pararam de
          receber o JSON de 1 Hz e concluíram isso sozinhos — sem fio novo e sem pino:
          basta cronometrar o silêncio. A IHM mostra e o dashboard publica.
          <br /><br />
          ⭐ <b>E repare que a potência já estava cortada.</b> Quem cortou foi o pull-down
          no gate do KA3, em hardware. Os ESP não agiram — eles <b>contaram</b>. É essa
          divisão que faz a vigilância não enfraquecer a segurança.
        </Aviso>
      )}
    </Cartao>
  );
}

function Vigia({ nome, papel, ok }) {
  return (
    <div style={{ border: `1px solid ${ok ? '#8ce99a' : ALERTA}`, borderRadius: 6,
                  padding: '7px 8px', background: ok ? '#ebfbee' : '#fff5f5' }}>
      <div style={{ fontSize: 10.5, fontWeight: 700 }}>{ok ? '🟢' : '🔴'} {nome}</div>
      <div style={{ fontSize: 9.5, color: CX.fraco }}>{papel}</div>
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


/* ═══ A RECEITA DE ENSAIO ══════════════════════════════════════════
   ⭐ Três tipos, e o terceiro é o que vale nota. O ciclo alterna frio
     e quente com PATAMAR em cada extremo e COOLDOWN entre eles — e o
     cooldown não é enfeite: trocar direto significa disparar o PTC com
     o dissipador da Peltier a ~52 °C, jogando calor pela pastilha no
     sentido errado.                                                  */
const RECEITAS = [
  { tipo: 'FRIO', nome: '❄ Só resfriar', diz: 'busca a faixa fria e segura lá' },
  { tipo: 'QUENTE', nome: '🔥 Só aquecer', diz: 'busca a faixa quente e segura' },
  { tipo: 'CICLO', nome: '🔄 Ciclo térmico', diz: 'alterna frio ↔ quente N vezes' },
];

const FASE_NOME = {
  INDO_FRIO: 'descendo para a faixa fria', PATAMAR_FRIO: 'patamar frio',
  INDO_QUENTE: 'subindo para a faixa quente', PATAMAR_QUENTE: 'patamar quente',
  COOLDOWN: 'cooldown — tudo desligado', CONCLUIDO: 'ensaio concluído',
};

function Receita({ s, onReceita }) {
  const r = s.receita;
  const tipo = r?.tipo ?? 'LIVRE';
  const usar = (t) => onReceita(t === 'LIVRE' ? null : {
    ...RECEITA_PADRAO, tipo,
    faixaFria: { min: 8, max: 11 }, faixaQuente: { min: 38, max: 42 },
    patamarMs: 5 * 60 * 1000, cooldownMs: 2 * 60 * 1000, ciclos: 4,
    ...(t === 'LIVRE' ? {} : { tipo: t }),
  });
  return (
    <Cartao titulo="Receita de ensaio"
            sub={r ? `${tipo} · ciclo ${s.cicloAtual + 1} de ${r.ciclos}` : 'faixa livre'}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        <Botao cor={tipo === 'LIVRE' ? '#1971c2' : '#adb5bd'} onClick={() => usar('LIVRE')}>
          🎚 Faixa livre
        </Botao>
        {RECEITAS.map(x => (
          <Botao key={x.tipo} cor={tipo === x.tipo ? '#1971c2' : '#adb5bd'}
                 onClick={() => usar(x.tipo)}>{x.nome}</Botao>
        ))}
      </div>
      {r && (
        <>
          <div style={{ marginTop: 10, fontSize: 12, fontWeight: 700 }}>
            {FASE_NOME[s.fase] ?? s.fase}
          </div>
          <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
            {Array.from({ length: r.ciclos }).map((_, i) => (
              <div key={i} style={{ flex: 1, height: 6, borderRadius: 3,
                background: i < s.cicloAtual ? VIVO
                          : i === s.cicloAtual ? '#ffd43b' : '#e9ecef' }} />
            ))}
          </div>
          {s.fase === 'PATAMAR_FRIO' || s.fase === 'PATAMAR_QUENTE' ? (
            <Aviso cor={VIVO}>
              ⏱ Segurando na faixa há <b>{(s.tPatamar / 60000).toFixed(1)} min</b> de{' '}
              {(r.patamarMs / 60000).toFixed(0)} min. O patamar só conta com a câmara
              <b> dentro</b> da faixa.
            </Aviso>
          ) : null}
          {s.fase === 'COOLDOWN' && (
            <Aviso cor={ATENCAO}>
              ⏸ <b>Cooldown.</b> Os dois drivers estão fora e só as ventoinhas giram.
              Só avança quando o dissipador cair a <b>{r.cooldownDissipador} °C</b> —
              está em <b>{s.tDissipador.toFixed(0)} °C</b>. Sem isso, o PTC dispararia com
              a Peltier ainda a ~52 °C e o calor atravessaria a pastilha no sentido errado.
            </Aviso>
          )}
          {s.fase === 'CONCLUIDO' && (
            <Aviso cor={VIVO}>✅ <b>Ensaio concluído</b> — {r.ciclos} ciclos completos.</Aviso>
          )}
        </>
      )}
    </Cartao>
  );
}

/* ═══ A CÂMARA, DESENHADA — quem está girando e quem está trabalhando ═══
   ⭐ Um corte frontal com os componentes reais. Ventoinha girando gira
     mesmo (animação CSS), a Peltier fica azul quando bombeia e o PTC
     fica laranja quando aquece. A intensidade acompanha o duty.        */
function Camara({ s: f }) {
  const frio = f.renPeltier && f.duty > 0;
  const quente = f.renPtc && f.duty > 0;
  const i = Math.min(1, f.duty / 100);          // intensidade

  return (
    <Cartao titulo="A câmara por dentro"
            sub={frio ? `❄ resfriando · ${f.qcPeltier} W bombeados`
               : quente ? `🔥 aquecendo · ${f.duty} %` : 'parada'}>
      <svg viewBox="0 0 330 250" style={{ width: '100%' }}>
        <defs>
          <linearGradient id="gFrio" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4dabf7" stopOpacity={0.15 + 0.55 * i} />
            <stop offset="100%" stopColor="#4dabf7" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="gQuente" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#ff922b" stopOpacity={0.15 + 0.55 * i} />
            <stop offset="100%" stopColor="#ff922b" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* caixa */}
        <rect x="55" y="30" width="220" height="190" rx="3"
              fill="#f8f9fa" stroke="#adb5bd" strokeWidth="2" />
        {frio && <rect x="57" y="32" width="216" height="186" fill="url(#gFrio)" />}
        {quente && <rect x="57" y="32" width="216" height="186" fill="url(#gQuente)" />}

        {/* dutos laterais 40 mm */}
        {[[30, 'esq'], [275, 'dir']].map(([dx, id]) => (
          <rect key={id} x={dx} y="30" width="25" height="190" fill="#e9ecef"
                stroke="#adb5bd" strokeWidth="1.5" />
        ))}

        {/* ── PELTIER no topo, atravessando a tampa ─────────────── */}
        <rect x="105" y="14" width="120" height="16" rx="2"
              fill={frio ? '#1971c2' : '#ced4da'} />
        <text x="165" y="26" fontSize="9" fill="#fff" textAnchor="middle" fontWeight="700">
          {frio ? `PELTIER · GELANDO` : 'PELTIER'}
        </text>
        <Helice cx={128} cy={6} r={9} on={f.ventRadiador} cor="#495057" rapido />
        <Helice cx={202} cy={6} r={9} on={f.ventRadiador} cor="#495057" rapido />
        <text x="165" y="9" fontSize="7" fill={CX.fraco} textAnchor="middle">
          {f.ventRadiador ? 'radiador ↑' : 'radiador off'}
        </text>

        {/* blocos frios + ventoinhas internas soprando para baixo */}
        <rect x="118" y="30" width="40" height="12" fill={frio ? '#a5d8ff' : '#e9ecef'}
              stroke="#adb5bd" strokeWidth="0.8" />
        <rect x="172" y="30" width="40" height="12" fill={frio ? '#a5d8ff' : '#e9ecef'}
              stroke="#adb5bd" strokeWidth="0.8" />
        <Helice cx={138} cy={52} r={11} on={f.ventInternas} cor="#1971c2" />
        <Helice cx={192} cy={52} r={11} on={f.ventInternas} cor="#1971c2" />

        {/* setas do ar descendo pelo centro */}
        {f.ventInternas && [150, 165, 180].map(x => (
          <Fluxo key={x} x1={x} y1={70} x2={x} y2={150} />
        ))}

        {/* ── PTC na base ────────────────────────────────────────── */}
        <rect x="115" y="182" width="100" height="14" rx="2"
              fill={quente ? '#e8590c' : '#ced4da'} />
        <text x="165" y="192" fontSize="8.5" fill="#fff" textAnchor="middle" fontWeight="700">
          {quente ? 'PTC · AQUECENDO' : 'PTC'}
        </text>
        <Helice cx={165} cy={170} r={10} on={f.ventPtc ?? f.ventInternas} cor="#e8590c" />
        <text x="165" y="205" fontSize="7" fill={CX.fraco} textAnchor="middle">
          vent. do PTC
        </text>

        {/* ── VENTOINHAS DOS DUTOS, abaixo do PTC, soprando p/ as bocas ── */}
        <Helice cx={92} cy={205} r={10} on={f.ventInternas} cor="#0ca678" />
        <Helice cx={238} cy={205} r={10} on={f.ventInternas} cor="#0ca678" />
        {f.ventInternas && (
          <>
            <Fluxo x1={80} y1={205} x2={50} y2={205} horiz />
            <Fluxo x1={250} y1={205} x2={280} y2={205} horiz />
            <Fluxo x1={42} y1={195} x2={42} y2={60} />
            <Fluxo x1={288} y1={195} x2={288} y2={60} />
          </>
        )}
        <text x="165" y="228" fontSize="7" fill={CX.fraco} textAnchor="middle">
          as 2 dos dutos ficam AQUI, na boca — não dentro deles
        </text>

        {/* bandeja */}
        <rect x="118" y="212" width="94" height="6" fill="#dee2e6" stroke="#adb5bd"
              strokeWidth="0.8" />
        <text x="165" y="240" fontSize="7" fill={CX.fraco} textAnchor="middle">
          bandeja removível
        </text>
      </svg>
    </Cartao>
  );
}

/** Hélice que gira de verdade quando ligada. */
function Helice({ cx, cy, r, on, cor, rapido }) {
  const pas = [0, 60, 120, 180, 240, 300];
  return (
    <g opacity={on ? 1 : 0.32}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={cor} strokeWidth="1.2" />
      <g>
        {on && (
          <animateTransform attributeName="transform" type="rotate"
            from={`0 ${cx} ${cy}`} to={`360 ${cx} ${cy}`}
            dur={rapido ? '0.35s' : '0.6s'} repeatCount="indefinite" />
        )}
        {pas.map(a => (
          <line key={a} x1={cx} y1={cy}
                x2={cx + r * 0.82 * Math.cos(a * Math.PI / 180)}
                y2={cy + r * 0.82 * Math.sin(a * Math.PI / 180)}
                stroke={cor} strokeWidth="1.6" strokeLinecap="round" />
        ))}
      </g>
      <circle cx={cx} cy={cy} r="1.8" fill={cor} />
    </g>
  );
}

/** Seta de fluxo de ar, com o tracejado andando. */
function Fluxo({ x1, y1, x2, y2, horiz }) {
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#74c0fc" strokeWidth="1.6"
          strokeDasharray="4 4" opacity="0.85"
          markerEnd={undefined}>
      <animate attributeName="stroke-dashoffset" from="8" to="0"
               dur={horiz ? '0.5s' : '0.7s'} repeatCount="indefinite" />
    </line>
  );
}

/* ═══ PROCESSO — a faixa, e não mais um ponto ══════════════════════ */
function Processo({ s: f, onFaixa }) {
  const cores = { RESFRIAMENTO: '#1971c2', AQUECIMENTO: '#e8590c',
                  PARADO: CX.fraco, DEGELO: '#7048e8' };
  const zonaCor = { URGENTE: ALERTA, AJUSTE: '#1971c2', PRONTO: VIVO };
  return (
    <Cartao titulo="Processo"
            sub={`${f.estado}${f.alerta ? ` · ${f.alerta}` : ''}`}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr 1fr', gap: 8,
                    marginBottom: 10 }}>
        <Numero rot="câmara" val={`${f.tCamara.toFixed(1)} °C`}
                cor={f.naFaixa ? VIVO : cores[f.modo]} />
        <Numero rot="faixa pedida" val={`${f.faixa.min} a ${f.faixa.max}`} />
        <Numero rot="dissipador" val={`${f.tDissipador.toFixed(0)} °C`}
                cor={f.tDissipador > 55 ? ALERTA : undefined} />
      </div>

      {/* a régua da faixa */}
      <Regua f={f} />

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '10px 0 4px' }}>
        <span style={{ fontSize: 10.5, color: CX.fraco, width: 26 }}>mín</span>
        <input type="range" min="-15" max="55" value={f.faixa.min} style={{ flex: 1 }}
               onChange={e => onFaixa(+e.target.value, Math.max(+e.target.value + 1, f.faixa.max))} />
        <b style={{ fontSize: 11, width: 34, textAlign: 'right' }}>{f.faixa.min} °C</b>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 10.5, color: CX.fraco, width: 26 }}>máx</span>
        <input type="range" min="-14" max="60" value={f.faixa.max} style={{ flex: 1 }}
               onChange={e => onFaixa(Math.min(f.faixa.min, +e.target.value - 1), +e.target.value)} />
        <b style={{ fontSize: 11, width: 34, textAlign: 'right' }}>{f.faixa.max} °C</b>
      </div>

      {f.inalcancavel && (
        <Aviso cor={ATENCAO}>
          ⚠️ <b>Faixa inalcançável neste ambiente.</b> O firmware parou de forçar e
          recuou para <b>{f.duty} %</b> — na Peltier, insistir daria <i>menos</i> frio,
          porque o dissipador esquenta e o ΔT come o bombeamento. Ele está segurando o
          melhor ponto real. <b>Não é falha</b>, e o ensaio continua com o número verdadeiro.
        </Aviso>
      )}

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
        <span style={{ fontSize: 10.5, padding: '3px 8px', borderRadius: 11,
                       fontWeight: 700, background: `${zonaCor[f.zona] ?? CX.fraco}22`,
                       color: zonaCor[f.zona] ?? CX.fraco }}>{f.zona}</span>
        <Selo on={f.renPeltier} txt="R_EN Peltier" />
        <Selo on={f.renPtc} txt="R_EN PTC" />
        <Selo on={f.ventRadiador} txt="🌀 radiador" />
        <Selo on={f.ventInternas} txt="🌀 5 internas" />
        <Selo on={f.duty > 0} txt={`duty ${f.duty} % de ${f.dutyTeto} %`} />
      </div>
      {f.dutyTeto < 90 && f.renPeltier && (
        <Aviso cor="#1971c2">
          🌡️ <b>Limitador térmico atuando.</b> O dissipador está a {f.tDissipador.toFixed(0)} °C,
          então o teto de duty caiu para <b>{f.dutyTeto} %</b>. Isso <b>aumenta</b> o frio
          entregue: a Peltier bombeia menos quanto maior o ΔT dela.
        </Aviso>
      )}
    </Cartao>
  );
}

/** Régua com a faixa marcada e a temperatura atual em cima. */
function Regua({ f }) {
  const min = -15, max = 60, L = x => ((x - min) / (max - min)) * 100;
  return (
    <div style={{ position: 'relative', height: 26, marginTop: 2 }}>
      <div style={{ position: 'absolute', top: 10, left: 0, right: 0, height: 6,
                    background: 'linear-gradient(90deg,#4dabf7,#e9ecef 45%,#ff922b)',
                    borderRadius: 3 }} />
      <div style={{ position: 'absolute', top: 8, height: 10, borderRadius: 2,
                    left: `${L(f.faixa.min)}%`, width: `${L(f.faixa.max) - L(f.faixa.min)}%`,
                    background: '#40c05755', border: `1.5px solid ${VIVO}` }} />
      <div style={{ position: 'absolute', top: 3, left: `calc(${L(f.tCamara)}% - 1px)`,
                    width: 2, height: 20, background: f.naFaixa ? VIVO : ALERTA }} />
      <div style={{ position: 'absolute', top: -1, fontSize: 8.5, color: CX.fraco,
                    left: `calc(${L(f.tCamara)}% - 12px)` }}>
        {f.tCamara.toFixed(1)}
      </div>
    </div>
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
