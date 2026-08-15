import { useState } from 'react';
import { TENSOES, paraOndeVai } from '../data/painel';
import { PINAGENS } from '../data/pinagens';
import PlacaPI1 from './PlacaPI1';
import PlacaReal from './PlacaReal';

/* Pinagem genérica: desenha a placa como um retângulo com os pinos
   distribuídos nas duas laterais, cada um clicável. Funciona para
   qualquer componente, porque é gerada a partir do mapa `terminais`. */
function PinagemGenerica({ comp }) {
  const [pino, setPino] = useState(null);
  const t = TENSOES[comp.tensao] ?? TENSOES.SINAL;
  const nomes = Object.keys(comp.terminais);
  const meio = Math.ceil(nomes.length / 2);
  const esq = nomes.slice(0, meio);
  const dir = nomes.slice(meio);

  const PASSO = 26;
  const alturaPlaca = Math.max(esq.length, dir.length) * PASSO + 34;
  const L = 250, X0 = 190;

  const Pino = ({ nome, i, lado }) => {
    const y = 34 + i * PASSO;
    const x = lado === 'esq' ? X0 : X0 + L;
    const dx = lado === 'esq' ? -1 : 1;
    const lig = paraOndeVai(`${comp.id}:${nome}`);
    const sel = pino === nome;
    return (
      <g onClick={() => setPino(sel ? null : nome)} style={{ cursor: 'pointer' }}>
        <line x1={x} y1={y} x2={x + dx * 22} y2={y}
              stroke={sel ? '#e8590c' : '#adb5bd'} strokeWidth={sel ? 3.5 : 2} />
        <rect x={x - 6} y={y - 6} width={12} height={12} rx={2}
              fill={lig.length ? (sel ? '#e8590c' : '#e9c46a') : '#ced4da'}
              stroke="#495057" strokeWidth={1} />
        <text x={x + dx * 27} y={y + 4} textAnchor={lado === 'esq' ? 'end' : 'start'}
              fontSize={12.5} fontWeight={sel ? 700 : 600}
              fill={sel ? '#e8590c' : '#212529'}>{nome}</text>
        <text x={x + dx * 27} y={y + 16} textAnchor={lado === 'esq' ? 'end' : 'start'}
              fontSize={10} fill="#868e96">{comp.terminais[nome]}</text>
      </g>
    );
  };

  const ligacoes = pino ? paraOndeVai(`${comp.id}:${pino}`) : [];

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflow: 'auto', padding: 20, background: '#eef1f5' }}>
        <svg width="100%" viewBox={`0 0 830 ${alturaPlaca + 30}`}
             style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 6px #0002' }}>
          <rect x={X0} y={14} width={L} height={alturaPlaca} rx={7}
                fill="#1b5e3f" stroke="#0d3d28" strokeWidth={2} />
          <text x={X0 + L / 2} y={alturaPlaca / 2 + 6} textAnchor="middle"
                fontSize={17} fontWeight="700" fill="#e9ecef" opacity={0.9}>
            {comp.nome}
          </text>
          <text x={X0 + L / 2} y={alturaPlaca / 2 + 24} textAnchor="middle"
                fontSize={11} fill={t.cor === '#111111' ? '#adb5bd' : t.cor}>
            {t.label}
          </text>
          {esq.map((n, i) => <Pino key={n} nome={n} i={i} lado="esq" />)}
          {dir.map((n, i) => <Pino key={n} nome={n} i={i} lado="dir" />)}
        </svg>
        <p style={{ fontSize: 11.5, color: '#868e96', marginTop: 10 }}>
          Desenho esquemático da pinagem — as posições dos pinos são lógicas, não a
          silhueta real do módulo. Quadrado <b style={{ color: '#c9a227' }}>amarelo</b> =
          pino com cabo mapeado no projeto; <b>cinza</b> = pino sem uso.
        </p>
      </div>

      <aside style={{ width: 340, background: '#fff', borderLeft: '1px solid #dee2e6',
                      overflowY: 'auto', flexShrink: 0, padding: '14px 16px' }}>
        {comp.detalhe && (
          <div style={{ fontSize: 12, color: '#495057', lineHeight: 1.55,
                        paddingBottom: 12, borderBottom: '1px solid #eee' }}>
            {comp.detalhe}
          </div>
        )}
        <div style={{ fontSize: 11, color: '#868e96', margin: '12px 0 8px',
                      letterSpacing: 0.4 }}>
          {pino ? `PINO ${pino}` : 'CLIQUE NUM PINO DO DESENHO'}
        </div>
        {pino && ligacoes.length === 0 && (
          <div style={{ fontSize: 12, color: '#adb5bd' }}>
            Sem cabo mapeado para este pino.
          </div>
        )}
        {ligacoes.map(({ cabo, destino }) => {
          const ct = TENSOES[cabo.tensao] ?? TENSOES.SINAL;
          return (
            <div key={cabo.n + destino} style={{
              background: '#f8f9fa', borderLeft: `4px solid ${ct.cor}`,
              borderRadius: 5, padding: '8px 10px', marginBottom: 7, fontSize: 11.5,
            }}>
              <div style={{ color: ct.cor, fontWeight: 700 }}>→ {destino}</div>
              <div style={{ color: '#868e96', marginTop: 2 }}>
                cabo {cabo.n} · {cabo.bitola} · {cabo.cor}
              </div>
              {cabo.nota && (
                <div style={{ color: '#a06000', marginTop: 4 }}>{cabo.nota}</div>
              )}
            </div>
          );
        })}
      </aside>
    </div>
  );
}

export default function ZoomComponente({ comp, onFechar }) {
  const [aba, setAba] = useState('real');
  if (!comp) return null;
  const temReal = !comp.ehPlaca && !!PINAGENS[comp.pinagem ?? comp.id];
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100, background: '#00000088',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 22,
    }} onClick={onFechar}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 10, width: '100%', maxWidth: 1280,
        height: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 12px 48px #0006',
      }}>
        {!comp.ehPlaca && (
          <div style={{ background: '#1d3557', color: '#fff', padding: '12px 16px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <b style={{ fontSize: 16 }}>{comp.nome}</b>
              <span style={{ fontSize: 11.5, opacity: 0.8, marginLeft: 10 }}>
                {comp.descricao}
              </span>
            </div>
            <button onClick={onFechar} style={{
              background: '#ffffff33', color: '#fff', border: 'none', borderRadius: 5,
              width: 28, height: 28, cursor: 'pointer', fontSize: 16 }}>×</button>
          </div>
        )}
        {temReal && (
          <div style={{ display: 'flex', gap: 6, padding: '8px 16px',
                        borderBottom: '1px solid #dee2e6', background: '#f8f9fa' }}>
            {[['real', '📷 A placa como ela é'], ['logica', '🔌 Só a lista de ligações']]
              .map(([k, txt]) => (
                <button key={k} onClick={() => setAba(k)} style={{
                  background: aba === k ? '#1d3557' : '#fff',
                  color: aba === k ? '#fff' : '#495057',
                  border: '1px solid #ced4da', borderRadius: 5,
                  padding: '5px 11px', cursor: 'pointer', fontSize: 12,
                  fontWeight: aba === k ? 700 : 400,
                }}>{txt}</button>
              ))}
          </div>
        )}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {comp.ehPlaca
            ? <PlacaPI1 onFechar={onFechar} />
            : (temReal && aba === 'real')
              ? <PlacaReal chave={comp.pinagem ?? comp.id} compId={comp.id} />
              : <PinagemGenerica comp={comp} />}
        </div>
      </div>
    </div>
  );
}
