import { useMemo, useState } from 'react';
import { construirRede, tracar, nomeDoNo } from '../lib/rede';

/* "Siga o sinal": escolha um borne e veja o caminho elétrico dele até
   o fim, sem geometria nenhuma no meio.

   ⭐ O que este desenho ensina e o da placa não ensina: FIO NÃO É
   COMPONENTE. Um fio funde dois pontos num só; um componente separa
   dois pontos. Por isso J1-2 e J2-2 aparecem DENTRO DA MESMA CAIXA —
   eles são o mesmo ponto elétrico — e o capacitor sai de lado, para
   o 0 V, em vez de ficar no meio do caminho.                        */

const ICONE = { via: '🔌', no: '⬤', bus: '⏚', perna: '┤', pino: '▪' };

function Elemento({ e }) {
  const cor = e.tipo === 'capacitor' ? '#2d6cb5'
            : e.tipo === 'chip' ? '#ae3ec9' : '#c9772a';
  return (
    <div style={{ display: 'flex', alignItems: 'stretch', gap: 8, margin: '2px 0 2px 22px' }}>
      <div style={{ width: 2, background: cor, borderRadius: 1 }} />
      <div style={{ padding: '5px 0' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: cor }}>
          {e.tipo === 'capacitor' ? '⊣⊢' : e.tipo === 'resistor' ? '▭' : '▷'}{' '}
          {e.ref}{e.valor && e.tipo !== 'chip' ? ` · ${e.valor}` : ''}
        </div>
        {e.papel && (
          <div style={{ fontSize: 11, color: '#868e96', maxWidth: 300, lineHeight: 1.4 }}>
            {e.papel}
          </div>
        )}
      </div>
    </div>
  );
}

function No({ nn, nivel }) {
  const nome = nomeDoNo(nn);
  const vias = nn.membros.filter(m => m.tipo === 'via');
  const pinos = nn.membros.filter(m => m.tipo === 'pino');
  const pernas = nn.membros.filter(m => m.tipo === 'perna');
  const cor = nn.ehBus ? '#212529' : (vias.length ? '#1971c2' : '#5f3dc4');

  return (
    <div style={{ marginLeft: nivel ? 22 : 0 }}>
      <div style={{
        border: `2px solid ${cor}`, borderRadius: 8, background: '#fff',
        padding: '9px 12px', maxWidth: 430,
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: cor, marginBottom: 4 }}>
          {ICONE[nn.ehBus ? 'bus' : 'no']} {nome}
          {nn.ehBus && (
            <span style={{ fontWeight: 400, fontSize: 11, color: '#868e96' }}>
              {' '}— fim do caminho
            </span>
          )}
        </div>

        {/* ⭐ tudo o que está nesta caixa é o MESMO ponto elétrico */}
        {(vias.length + pinos.length + pernas.length) > 1 && (
          <div style={{ fontSize: 10.5, color: '#e8590c', marginBottom: 5 }}>
            ⭐ os {vias.length + pinos.length + pernas.length} pontos abaixo são{' '}
            <b>o mesmo ponto elétrico</b>
          </div>
        )}

        {vias.map((v, i) => (
          <div key={i} style={{ fontSize: 11.5, lineHeight: 1.5, marginBottom: 2 }}>
            <b style={{ fontFamily: 'monospace' }}>{v.rotulo}</b>{' '}
            <span style={{ color: '#495057' }}>{v.sinal}</span>
            {v.liga && (
              <div style={{ fontSize: 10.5, color: '#868e96', marginLeft: 10 }}>
                {v.entrada ? '⬅ vem de' : '➡ vai para'} {v.liga}
              </div>
            )}
          </div>
        ))}
        {pinos.filter(p => !p.livre).map((p, i) => (
          <div key={i} style={{ fontSize: 11.5, color: '#495057' }}>
            ▪ <b style={{ fontFamily: 'monospace' }}>{p.rotulo}</b>
          </div>
        ))}
        {pernas.map((p, i) => (
          <div key={i} style={{ fontSize: 11, color: '#868e96' }}>
            ┤ {p.rotulo} ({p.sinal})
          </div>
        ))}

        {(nn.fios.length > 0 || nn.pontes.length > 0) && (
          <div style={{ fontSize: 10.5, color: '#868e96', marginTop: 6, paddingTop: 5,
                        borderTop: '1px solid #f1f3f5' }}>
            unidos por{' '}
            {nn.fios.map(f => `fio ${f.n}`).concat(
              nn.pontes.map(p => `ponte do ${p.ref}`)).join(' · ') || '—'}
          </div>
        )}
      </div>

      {nn.saidas.map((s, i) => (
        <div key={i}>
          <Elemento e={s.elemento} />
          {s.alvo && <No nn={s.alvo} nivel={nivel + 1} />}
        </div>
      ))}
    </div>
  );
}

export default function CaminhoSinal({ dados, titulo, onFechar }) {
  const rede = useMemo(() => construirRede(dados), [dados]);
  const { BORNES } = dados;
  const [alvo, setAlvo] = useState(() => {
    const b = BORNES[0], v = b.vias.find(x => !x.livre) ?? b.vias[0];
    return { borne: b.ref, via: v.n, ponto: `${v.col},${b.linha}` };
  });

  const arvore = useMemo(() => tracar(rede, alvo.ponto), [rede, alvo]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 260, background: '#000000b0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: 22 }}>
      <div style={{ background: '#f8f9fa', borderRadius: 10, width: '100%',
                    maxWidth: 1000, maxHeight: '92vh', display: 'flex',
                    flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ background: '#1d3557', color: '#fff', padding: '13px 17px',
                      display: 'flex', justifyContent: 'space-between' }}>
          <b style={{ fontSize: 16 }}>🔎 Siga o sinal — {titulo}</b>
          <button onClick={onFechar} style={{ background: '#ffffff33', color: '#fff',
            border: 'none', borderRadius: 5, width: 26, height: 26,
            cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ padding: '11px 17px', background: '#fff',
                      borderBottom: '1px solid #dee2e6' }}>
          <div style={{ fontSize: 11, color: '#868e96', marginBottom: 6,
                        letterSpacing: 0.4 }}>
            ESCOLHA UM BORNE — o caminho sai dele
          </div>
          {BORNES.map(b => (
            <div key={b.ref} style={{ display: 'flex', gap: 4, flexWrap: 'wrap',
                                      marginBottom: 5, alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: b.cor,
                             minWidth: 26 }}>{b.ref}</span>
              {b.vias.map(v => {
                const on = alvo.borne === b.ref && alvo.via === v.n;
                return (
                  <button key={v.n} disabled={v.livre}
                    onClick={() => setAlvo({ borne: b.ref, via: v.n,
                                             ponto: `${v.col},${b.linha}` })}
                    style={{
                      fontSize: 10.5, fontFamily: 'monospace', padding: '3px 7px',
                      borderRadius: 4, cursor: v.livre ? 'default' : 'pointer',
                      border: `1px solid ${on ? b.cor : '#ced4da'}`,
                      background: on ? b.cor : (v.livre ? '#f1f3f5' : '#fff'),
                      color: on ? '#fff' : (v.livre ? '#adb5bd' : '#212529'),
                      fontWeight: on ? 700 : 400,
                    }}>{v.sinal}</button>
                );
              })}
            </div>
          ))}
        </div>

        <div style={{ padding: 17, overflowY: 'auto', flex: 1 }}>
          <div style={{ background: '#e7f5ff', borderLeft: '3px solid #1971c2',
                        borderRadius: 5, padding: '9px 12px', fontSize: 11.5,
                        lineHeight: 1.55, marginBottom: 14, maxWidth: 620 }}>
            ⭐ <b>Cada caixa é UM ponto elétrico.</b> Tudo o que está dentro dela é o mesmo
            ponto — os fios apenas fundem os furos, eles não são componentes.
            <br />
            Os <b>componentes ficam ENTRE as caixas</b>, porque é isso que um componente
            faz: separa dois pontos. Repare que num filtro o borne de entrada e o de saída
            caem na <b>mesma caixa</b>, e o capacitor <b>sai de lado</b> — ele não está no
            caminho do sinal.
          </div>
          {arvore
            ? <No nn={arvore} nivel={0} />
            : <div style={{ color: '#868e96' }}>Este borne ainda não tem fio ligado.</div>}
        </div>
      </div>
    </div>
  );
}
