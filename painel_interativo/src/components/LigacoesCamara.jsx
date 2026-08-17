import { useState } from 'react';
import { BLOCOS_LIGACAO } from '../data/camara_ligacoes';
import { FIOS } from '../data/fiacao';
import { ROTAS_CAMARA } from '../data/camara';
import { naCamara, naTampa } from '../lib/rota_camara';

/* A câmara lida de cima para baixo, como quem monta.

   ⭐ POR QUE SEPARAR EM BLOCOS: o desenho da câmara inteira mostra ONDE
   cada peça fica, mas não cabe nele a resposta de "qual fio entra em
   qual terminal desta peça". Aqui cada parte tem a sua página. */

const acha = n => FIOS.find(f => f.n === n);

/* ⭐ O NOME DO BORNE VEM DO DADO, não do texto. Enquanto a tabela dizia
   "fio VERMELHO da pastilha 1" e o desenho dizia "PELT · +", o aluno
   tinha de adivinhar que eram a mesma coisa. Agora a etiqueta é a
   MESMA dos dois lados, e sai do mesmo lugar. */
function borneDe(n) {
  const f = acha(n);
  if (!f) return null;
  const d = naCamara(f) ?? naTampa(f);
  return d ? `${d.camara ?? d.tampa} · ${d.borne}` : null;
}

function Bloco({ b, aberto, alternar }) {
  return (
    <div style={{ border: `2px solid ${b.cor}`, borderRadius: 9, marginBottom: 10,
                  background: '#fff', overflow: 'hidden' }}>
      <button onClick={alternar} style={{
        width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
        background: aberto ? b.cor : '#fff', color: aberto ? '#fff' : '#212529',
        padding: '11px 14px',
      }}>
        <div style={{ fontSize: 10, letterSpacing: 0.5,
                      opacity: aberto ? 0.85 : 0.6 }}>{b.zona}</div>
        <div style={{ fontSize: 14.5, fontWeight: 700, marginTop: 2 }}>
          {aberto ? '▾' : '▸'} {b.titulo}
        </div>
        <div style={{ fontSize: 11.5, marginTop: 3,
                      opacity: aberto ? 0.92 : 0.7 }}>{b.diz}</div>
      </button>

      {aberto && (
        <div style={{ padding: '12px 14px' }}>
          {b.desenho && (
            <pre style={{ background: '#f8f9fa', border: '1px solid #dee2e6',
                          borderRadius: 6, padding: '9px 11px', fontSize: 11.5,
                          lineHeight: 1.6, margin: '0 0 11px', overflowX: 'auto' }}>
              {b.desenho.join('\n')}
            </pre>
          )}

          <div style={{ fontSize: 10.5, color: '#868e96', letterSpacing: 0.5,
                        marginBottom: 5 }}>
            O QUE CHEGA DO PAINEL — <b>a coluna do meio é o nome do borne no desenho</b>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12,
                          marginBottom: 12 }}>
            <tbody>
              {b.externo.map((e, i) => {
                const f = acha(e.fio);
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f3f5' }}>
                    <td style={{ padding: '5px 6px', width: 40 }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700,
                                     fontSize: 11, padding: '2px 6px', borderRadius: 4,
                                     background: f?.cor ?? '#adb5bd', color: '#fff' }}>
                        {e.fio}
                      </span>
                    </td>
                    <td style={{ padding: '5px 6px', fontFamily: 'monospace',
                                 whiteSpace: 'nowrap' }}>{e.o}</td>
                    <td style={{ padding: '5px 6px', color: '#495057' }}>→ {e.para}</td>
                    <td style={{ padding: '5px 6px', whiteSpace: 'nowrap' }}>
                      {borneDe(e.fio) && (
                        <span style={{ fontFamily: 'monospace', fontSize: 10.5,
                                       fontWeight: 700, padding: '2px 5px',
                                       borderRadius: 4, border: `1px solid ${b.cor}66`,
                                       color: b.cor }}>{borneDe(e.fio)}</span>
                      )}
                    </td>
                    <td style={{ padding: '5px 6px', color: '#868e96', fontSize: 10.5,
                                 whiteSpace: 'nowrap' }}>
                      {f ? `${f.mm2} mm² ${f.corNome}` : ''}
                      {ROTAS_CAMARA[e.fio] ? ` · ${ROTAS_CAMARA[e.fio].pc}` : ' · por fora'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div style={{ fontSize: 10.5, color: '#868e96', letterSpacing: 0.5,
                        marginBottom: 5 }}>O QUE SE LIGA A QUÊ, ALI DENTRO</div>
          {b.interno.map((t, i) => (
            <div key={i} style={{ fontSize: 12, lineHeight: 1.55, marginBottom: 6,
                                  paddingLeft: 12, borderLeft: `3px solid ${b.cor}44` }}>
              {t}
            </div>
          ))}

          {b.aviso && (
            <div style={{ marginTop: 10, background: '#fff5f5', border: '1px solid #ffc9c9',
                          borderRadius: 6, padding: '9px 11px', fontSize: 11.5,
                          lineHeight: 1.55, color: '#c92a2a' }}>{b.aviso}</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function LigacoesCamara() {
  const [abertos, setAbertos] = useState(() => new Set(['B2']));
  const alternar = id => setAbertos(s => {
    const n = new Set(s);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  const usados = new Set(BLOCOS_LIGACAO.flatMap(b => b.externo.map(e => e.fio)));
  const daEtapa6 = FIOS.filter(f => f.etapa === 6).map(f => f.n);
  const orfaos = daEtapa6.filter(n => !usados.has(n));
  const contaPc = pc => Object.values(ROTAS_CAMARA).filter(r => r.pc === pc).length;
  const nPC1 = contaPc('PC-1'), nPC2 = contaPc('PC-2');
  const naTampaN = daEtapa6.filter(n => !ROTAS_CAMARA[n]);

  return (
    <div style={{ height: '100%', overflow: 'auto', padding: 16, background: '#eef1f5' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <button onClick={() => setAbertos(new Set(BLOCOS_LIGACAO.map(b => b.id)))}
            style={{ background: '#1971c2', color: '#fff', border: 'none',
                     borderRadius: 7, padding: '7px 13px', cursor: 'pointer',
                     fontSize: 12.5, fontWeight: 700 }}>abrir todos</button>
          <button onClick={() => setAbertos(new Set())}
            style={{ background: '#fff', color: '#1971c2', border: '2px solid #1971c2',
                     borderRadius: 7, padding: '7px 13px', cursor: 'pointer',
                     fontSize: 12.5, fontWeight: 700 }}>fechar todos</button>
          <div style={{ fontSize: 11.5, color: '#495057', alignSelf: 'center' }}>
            {usados.size} dos {daEtapa6.length} fios da etapa 6 aparecem aqui
            {orfaos.length > 0 && <b style={{ color: '#c92a2a' }}> · faltam {orfaos.join(', ')}</b>}
          </div>
        </div>

        <div style={{ background: '#fff3bf', borderRadius: 7, padding: '10px 13px',
                      fontSize: 12, marginBottom: 14, lineHeight: 1.55 }}>
          📖 <b>Lido de cima para baixo, na ordem em que se monta.</b> Cada bloco diz
          três coisas: o que <b>chega do painel</b> (com o número do fio, que é o mesmo
          da etapa 6 da fiação), o que <b>se liga a quê ali dentro</b>, e o erro que
          aquela parte permite.
        </div>

        {BLOCOS_LIGACAO.map(b => (
          <Bloco key={b.id} b={b} aberto={abertos.has(b.id)}
                 alternar={() => alternar(b.id)} />
        ))}

        {/* ⭐ esta conta era escrita à mão e estava errada: contava os fios
            do lado quente como se furassem a parede. Agora sai dos dados. */}
        <div style={{ background: '#e7f5ff', borderLeft: '3px solid #1971c2',
                      borderRadius: 6, padding: '10px 13px', fontSize: 11.5,
                      lineHeight: 1.6, marginTop: 6 }}>
          <b>Um resumo do que atravessa a parede:</b> {nPC1} condutores pelo prensa-cabo
          de potência (<b>PC-1</b>) e {nPC2} pelo de sinal (<b>PC-2</b>). O lado quente
          da tampa — {naTampaN.join(', ')}: ventoinhas do radiador, DS18B20 e os dois
          RPM — <b>não atravessa parede nenhuma</b>: fica no ar ambiente, em cima, e
          sobe por fora do acrílico.
        </div>
      </div>
    </div>
  );
}
