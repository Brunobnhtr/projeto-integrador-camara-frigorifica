import { useState } from 'react';
import { DISCRETOS, HOSTS, TOTAL_PECAS } from '../data/discretos.js';
import FichaDiscreto from './FichaDiscreto';

/* ═══════════════════════════════════════════════════════════════════════
   OS COMPONENTES SOLTOS — todos eles, e onde cada um vai
   ═══════════════════════════════════════════════════════════════════════
   ⭐ A pergunta que esta tela responde é "vai componente discreto em mais
      algum lugar?". Vai: em CINCO famílias de lugares, e dois deles ficam
      longe do painel — é onde a montagem esquece.

      A lista sai inteira do cadastro. Componente novo aparece aqui sem
      ninguém mexer nesta tela.
   ═════════════════════════════════════════════════════════════════════ */

const C = { tinta: '#212529', fraco: '#6c757d', linha: '#dee2e6', fundo: '#eef1f5',
            papel: '#fff', destaque: '#e8590c', azul: '#1971c2' };

/* as cinco famílias, na ordem em que se monta: primeiro o que se prepara
   na bancada, por último o que fica dentro da câmara */
const FAMILIAS = [
  { id: 'placa',  nome: 'Nas placas de interface', icone: '🟫',
    diz: 'Placa ilhada em caixa DIN, ao lado do Arduino. Cada perna tem furo próprio.' },
  { id: 'borne',  nome: 'Nos bornes dos relés', icone: '🔩',
    diz: 'Sem placa nenhuma: as pernas dobradas em U entram direto no parafuso.' },
  { id: 'modulo', nome: 'Soldados dentro de módulo comprado', icone: '🔧',
    diz: '⚠️ Ficam invisíveis depois de montado — fotografe antes de fechar.' },
  { id: 'maquete', nome: 'Fora do painel, na maquete', icone: '🏙️',
    diz: 'Escondidos dentro da base do poste, com termorretrátil.' },
  { id: 'camara', nome: 'Fora do painel, na câmara', icone: '❄️',
    diz: 'Dentro da câmara e no dissipador do lado quente.' },
];

export default function VistaComponentes() {
  const [sel, setSel] = useState(DISCRETOS[0]);
  const [soFora, setSoFora] = useState(false);

  const hostsDa = fam => HOSTS.filter(h => h.tipo === fam
    && DISCRETOS.some(d => d.host === h.id)
    && (!soFora || h.tipo === 'maquete' || h.tipo === 'camara' || h.tipo === 'modulo'));

  const familias = FAMILIAS.filter(f => hostsDa(f.id).length);
  const fora = DISCRETOS.filter(d => ['modulo', 'maquete', 'camara']
    .includes(HOSTS.find(h => h.id === d.host)?.tipo)).length;

  return (
    <div style={{ background: C.fundo, minHeight: '100%', padding: 14,
                  fontFamily: 'system-ui, sans-serif', color: C.tinta }}>

      <div style={{ background: C.papel, border: `1px solid ${C.linha}`, borderRadius: 8,
                    padding: '12px 16px', marginBottom: 14, display: 'flex',
                    gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <b style={{ fontSize: 15 }}>Todo componente que não é fio nem borne</b>
          <div style={{ fontSize: 12.5, color: C.fraco, marginTop: 2 }}>
            <b>{DISCRETOS.length}</b> registros · <b>{TOTAL_PECAS}</b> peças ·
            {' '}<b>{familias.length}</b> famílias de lugar ·
            {' '}<b style={{ color: C.destaque }}>{fora}</b> deles ficam fora do painel
          </div>
        </div>
        <label style={{ marginLeft: 'auto', fontSize: 12.5, display: 'flex',
                        alignItems: 'center', gap: 7, cursor: 'pointer' }}>
          <input type="checkbox" checked={soFora} onChange={e => setSoFora(e.target.checked)} />
          Mostrar só os que ficam fora do painel
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 340px) 1fr',
                    gap: 14, alignItems: 'start' }}>

        {/* ── a lista, agrupada pelo lugar ── */}
        <div style={{ display: 'grid', gap: 10 }}>
          {familias.map(f => (
            <div key={f.id} style={{ background: C.papel, border: `1px solid ${C.linha}`,
                                     borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ padding: '9px 12px', background: '#f8f9fa',
                            borderBottom: `1px solid ${C.linha}` }}>
                <b style={{ fontSize: 13.5 }}>{f.icone} {f.nome}</b>
                <div style={{ fontSize: 11.5, color: C.fraco, marginTop: 2 }}>{f.diz}</div>
              </div>
              {hostsDa(f.id).map(h => (
                <div key={h.id} style={{ padding: '9px 12px', borderTop: `1px solid #f1f3f5` }}>
                  <div style={{ fontSize: 12, color: C.fraco, marginBottom: 6 }}>{h.nome}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {DISCRETOS.filter(d => d.host === h.id).map(d => (
                      <button key={d.id} onClick={() => setSel(d)} title={d.papel}
                        style={{ fontFamily: 'monospace', fontSize: 12.5, cursor: 'pointer',
                                 borderRadius: 6, padding: '4px 9px',
                                 border: `1.5px solid ${sel?.id === d.id ? C.destaque : C.linha}`,
                                 background: sel?.id === d.id ? '#fff4e6' : '#fff',
                                 fontWeight: sel?.id === d.id ? 700 : 400 }}>
                        {d.ref}
                        <span style={{ color: C.fraco, fontWeight: 400 }}> · {d.valor}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* ── a ficha do escolhido ── */}
        <div style={{ position: 'sticky', top: 14 }}>
          {sel && <FichaDiscreto d={sel} />}
        </div>
      </div>
    </div>
  );
}
