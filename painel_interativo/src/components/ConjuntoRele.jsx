import { useMemo } from 'react';
import { COMPONENTES } from '../data/painel_completo';
import { RELES, BASE_8P } from '../data/reles_fisico';

/* O RELÉ POR DENTRO
 * =================
 * O equivalente da PlacaIlhada, mas para relé: mostra o borne físico e —
 * o que faltava no painel — os COMPONENTES DISCRETOS que ficam pendurados
 * nele. Um diodo nos bornes A1/A2 não é fio nenhum e não é placa nenhuma,
 * então não aparecia em vista alguma do projeto.
 *
 * Os bornes vêm do painel_completo.js; só o resto vem do reles_fisico.js.
 */

const semEmoji = (s) => String(s).replace(/[\p{Extended_Pictographic}️]/gu, '').trim();

function Secao({ titulo, children, sub }) {
  return (
    <section style={{ marginBottom: 26 }}>
      <h3 style={{ margin: '0 0 3px', fontSize: 13, letterSpacing: '.07em',
                   textTransform: 'uppercase', color: '#868e96', fontWeight: 700 }}>
        {titulo}
      </h3>
      {sub && <p style={{ margin: '0 0 11px', fontSize: 12.5, color: '#868e96' }}>{sub}</p>}
      {children}
    </section>
  );
}

/* ── a base de 8 pinos, vista de cima ───────────────────────────────── */
function Base8({ usados, cor }) {
  const Parafuso = ({ nome, dir }) => {
    const usado = usados.has(nome);
    const c = usado ? cor : '#ced4da';
    return (
      <div style={{ display: 'flex', flexDirection: dir < 0 ? 'column-reverse' : 'column',
                    alignItems: 'center', gap: 5, minWidth: 0, flex: 1 }}>
        <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                      border: `${usado ? 2.5 : 1.5}px solid ${c}`,
                      background: usado ? `${cor}18` : '#f8f9fa',
                      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 17, height: 2.5, background: c, borderRadius: 2 }} />
        </div>
        <div style={{ textAlign: 'center', lineHeight: 1.3 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: c,
                        fontFamily: 'ui-monospace, monospace' }}>{nome}</div>
          <div style={{ fontSize: 10, color: '#adb5bd' }}>gravado {BASE_8P.gravado[nome]}</div>
          <div style={{ fontSize: 10.5, color: usado ? '#495057' : '#ced4da', marginTop: 3,
                        maxWidth: 132, overflowWrap: 'anywhere' }}>
            {usado ? semEmoji(usados.get(nome)).split(/\s+—\s+/)[0]
                   : `livre · ${BASE_8P.papel[nome]}`}
          </div>
        </div>
      </div>
    );
  };
  return (
    <div style={{ background: '#f1f3f5', border: '1px solid #dee2e6', borderRadius: 6,
                  padding: '16px 14px' }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        {BASE_8P.cima.map((n) => <Parafuso key={n} nome={n} dir={-1} />)}
      </div>
      <div style={{ margin: '12px 0', padding: '9px 12px', background: '#fff',
                    border: '1px dashed #adb5bd', borderRadius: 4, textAlign: 'center' }}>
        <b style={{ fontSize: 12.5, color: '#495057' }}>BASE PTF08A · trilho DIN</b>
        <div style={{ fontSize: 11, color: '#868e96', marginTop: 2 }}>
          o relé encaixa por cima e sai puxando · a base fica parafusada no trilho
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        {BASE_8P.baixo.map((n) => <Parafuso key={n} nome={n} dir={+1} />)}
      </div>
      <p style={{ margin: '14px 0 0', fontSize: 11.5, color: '#c2410c', lineHeight: 1.5 }}>
        ⚠️ <b>O número gravado e o nome do desenho são coisas diferentes.</b> O diagrama diz
        <code style={{ margin: '0 4px' }}>14</code>; o parafuso onde você encosta a chave tem
        gravado <code style={{ margin: '0 4px' }}>5</code>. É o erro de montagem mais comum
        com relé de 8 pinos, e só aparece quando nada funciona.
      </p>
    </div>
  );
}

/* ── os canais de módulo (hoje três: KA1, KA2 e KA3) ────────────────── */
function Modulos({ dados, usados, cor }) {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {dados.canais.map((ch) => {
        const n = ch.id.slice(-1);
        const bornes = [
          ['IN' + n, 'gatilho · Mega ' + ch.gatilho],
          ['COM' + n, 'comum do contato'],
          [ch.contato + n, ch.contato === 'NC' ? '⭐ NC — fechado em repouso' : 'NO — aberto em repouso'],
        ];
        return (
          <div key={ch.id} style={{ background: '#e7f5ff', border: '1.5px solid #4dabf7',
                                    borderRadius: 6, padding: '13px 15px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 9, flexWrap: 'wrap' }}>
              <b style={{ fontSize: 16, color: cor }}>{ch.id}</b>
              <span style={{ fontSize: 12.5, color: '#495057' }}>{ch.papel}</span>
              <span style={{ marginLeft: 'auto', fontSize: 11, fontFamily: 'ui-monospace, monospace',
                             background: '#fff', border: '1px solid #a5d8ff', borderRadius: 3,
                             padding: '2px 7px', color: '#1864ab' }}>
                usa o contato {ch.contato}
              </span>
            </div>
            <div style={{ display: 'grid', gap: 1, background: '#c5e4fb', marginTop: 10,
                          border: '1px solid #c5e4fb', borderRadius: 4, overflow: 'hidden' }}>
              {bornes.map(([b, papel]) => (
                <div key={b} style={{ background: '#fff', display: 'grid',
                                      gridTemplateColumns: '62px 1fr', gap: 10,
                                      padding: '7px 10px', alignItems: 'baseline' }}>
                  <code style={{ fontSize: 12.5, fontWeight: 700, color: cor }}>{b}</code>
                  <div style={{ fontSize: 12, color: '#343a40', lineHeight: 1.45 }}>
                    {usados.has(b) ? semEmoji(usados.get(b)).split(/\s+—\s+/)[0] : '—'}
                    <div style={{ fontSize: 10.5, color: '#868e96' }}>{papel}</div>
                  </div>
                </div>
              ))}
            </div>
            <p style={{ margin: '10px 0 0', fontSize: 11.5, lineHeight: 1.5,
                        color: ch.contato === 'NC' ? '#c2410c' : '#495057' }}>
              {ch.regra}
            </p>
          </div>
        );
      })}
      <div style={{ fontSize: 11.5, color: '#868e96', lineHeight: 1.5 }}>
        Os dois módulos moram na <b>mesma caixa DIN de 4 módulos</b>, empilhados. O
        <code style={{ margin: '0 4px' }}>DC+</code> e o
        <code style={{ margin: '0 4px' }}>DC−</code> são pontelhados entre eles lá dentro —
        sai <b>um</b> par de fios para o BD-5V e o BD-0V.
      </div>
    </div>
  );
}

/* ── o cartão de um componente discreto ─────────────────────────────── */
function Discreto({ d }) {
  return (
    <div style={{ border: '1px solid #ffd8a8', background: '#fff9db', borderRadius: 6,
                  padding: '13px 15px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 9, flexWrap: 'wrap' }}>
        <b style={{ fontSize: 16, color: '#8a6116', fontFamily: 'ui-monospace, monospace' }}>{d.ref}</b>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#5c4a00' }}>{d.peca}</span>
        {d.preco && (
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#8a6116' }}>{d.preco}</span>
        )}
      </div>
      <div style={{ fontSize: 12.5, color: '#5c4a00', marginTop: 6 }}>
        <b>Onde:</b> {d.onde}
      </div>
      {d.orientacao && (
        <div style={{ fontSize: 12.5, color: '#5c4a00', marginTop: 3 }}>
          <b>Orientação:</b> {d.orientacao}
        </div>
      )}
      <p style={{ margin: '9px 0 0', fontSize: 12, color: '#495057', lineHeight: 1.55 }}>
        {d.porque}
      </p>
      {d.cuidado && (
        <p style={{ margin: '8px 0 0', fontSize: 11.5, color: '#c92a2a', lineHeight: 1.5 }}>
          {d.cuidado}
        </p>
      )}
      {d.dispensavel && (
        <p style={{ margin: '7px 0 0', fontSize: 11.5, color: '#2b8a3e', lineHeight: 1.5 }}>
          {d.dispensavel}
        </p>
      )}
    </div>
  );
}

export default function ConjuntoRele({ compId, onFechar }) {
  const dados = RELES[compId];
  const usados = useMemo(() => {
    const m = new Map();
    const c = COMPONENTES.find((k) => k.id === dados?.comp);
    if (c) for (const g of c.grupos) for (const p of g.pinos) if (p.usa) m.set(p.nome, p.para);
    return m;
  }, [dados]);

  if (!dados) return null;
  const cor = dados.cor;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column',
                  background: '#eef1f5' }}>
      <header style={{ background: cor, color: '#fff', padding: '12px 18px', flexShrink: 0,
                       display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                       gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <b style={{ fontSize: 15 }}>{dados.titulo}</b>
          <div style={{ fontSize: 11.5, opacity: 0.88, marginTop: 2 }}>{dados.peca}</div>
        </div>
        <button onClick={onFechar} aria-label="Fechar" style={{
          background: '#ffffff33', color: '#fff', border: 'none', borderRadius: 5,
          width: 28, height: 28, cursor: 'pointer', flexShrink: 0, fontSize: 16 }}>×</button>
      </header>

      <div style={{ flex: 1, overflow: 'auto', padding: '22px 18px 60px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>

          <p style={{ margin: '0 0 8px', fontSize: 13.5, color: '#343a40', lineHeight: 1.6 }}>
            {dados.oQueE}
          </p>
          <p style={{ margin: '0 0 26px', fontSize: 12.5, color: '#868e96', lineHeight: 1.55 }}>
            <b style={{ color: '#495057' }}>Quanto ele conduz:</b> {dados.conduz}
          </p>

          <Secao titulo="O borne físico"
                 sub={dados.tipo === 'rele8'
                   ? 'Vista de cima da base. Os bornes vêm do modelo do painel — não são digitados aqui.'
                   : `Os ${dados.canais.length} canais, com o contato que cada um usa.`}>
            {dados.tipo === 'rele8'
              ? <Base8 usados={usados} cor={cor} />
              : <Modulos dados={dados} usados={usados} cor={cor} />}
          </Secao>

          <Secao titulo={`Componentes discretos (${dados.discretos.length})`}
                 sub={dados.discretos.length
                   ? 'Não vão em placa nenhuma. Vão parafusados ou soldados NO BORNE — é por isso que não apareciam na vista do painel, onde só há fio.'
                   : null}>
            {dados.discretos.length ? (
              <div style={{ display: 'grid', gap: 12 }}>
                {dados.discretos.map((d) => <Discreto key={d.ref} d={d} />)}
              </div>
            ) : (
              <div style={{ background: '#fff', border: '1px solid #dee2e6', borderRadius: 6,
                            padding: '14px 16px', fontSize: 12.5, color: '#868e96',
                            lineHeight: 1.55 }}>
                <b style={{ color: '#495057' }}>Nenhum.</b> Só fio nos parafusos e as pontes
                curtas da própria base. Este relé não tem um único componente eletrônico
                pendurado nele.
              </div>
            )}
          </Secao>

          {dados.pontes?.length > 0 && (
            <Secao titulo={`Pontes na própria base (${dados.pontes.length})`}
                   sub="Pedaços curtos de fio que não saem do componente. Se faltarem, o relé não se segura — e é um defeito que não aparece em nenhuma lista de fiação.">
              <div style={{ display: 'grid', gap: 1, background: '#dee2e6',
                            border: '1px solid #dee2e6', borderRadius: 6, overflow: 'hidden' }}>
                {dados.pontes.map((p, i) => (
                  <div key={i} style={{ background: '#fff', padding: '11px 14px' }}>
                    <code style={{ fontSize: 12.5, fontWeight: 700, color: cor }}>
                      {p.de} → {p.para}
                    </code>
                    <div style={{ fontSize: 12, color: '#495057', marginTop: 4, lineHeight: 1.5 }}>
                      {p.diz}
                    </div>
                  </div>
                ))}
              </div>
            </Secao>
          )}

          <Secao titulo="Como provar que está certo"
                 sub="Cada linha leva menos de um minuto, e pega o erro que custa uma tarde.">
            <ul style={{ margin: 0, paddingLeft: 20, display: 'grid', gap: 8 }}>
              {dados.ensaios.map((e, i) => (
                <li key={i} style={{ fontSize: 12.5, color: '#343a40', lineHeight: 1.55 }}>{e}</li>
              ))}
            </ul>
          </Secao>

          {dados.naoConfundir && (
            <div style={{ background: '#fff5f5', border: '1px solid #ffc9c9', borderRadius: 6,
                          padding: '13px 16px', fontSize: 12.5, color: '#7a0b0b',
                          lineHeight: 1.6 }}>
              <b>Não confunda:</b> {dados.naoConfundir}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
