import { useState, useEffect } from 'react';
import VistaMaquete from './components/VistaMaquete';
import VistaPainelInterno from './components/VistaPainelInterno';
import VistaSimulador from './components/VistaSimulador';
import VistaMontagem from './components/VistaMontagem';
import VistaComponentes from './components/VistaComponentes';
import VistaGuia from './components/VistaGuia';

/* A casca do aplicativo. Cada aba é uma forma diferente de olhar o mesmo
   projeto — da vista mais geral (a maquete inteira) para a mais detalhada
   (componente por componente). */

const ABAS = [
  { id: 'maquete', nome: 'A maquete de cima', icone: '🗺️',
    dica: 'Por onde a energia entra e como ela chega até a câmara' },
  { id: 'painel',  nome: 'Dentro do painel',  icone: '🔧',
    dica: 'Todos os componentes e seus terminais, em escala real' },
  { id: 'componentes', nome: 'Componentes soltos', icone: '🔩',
    dica: 'Cada resistor, diodo e LED: onde ele vai, em que perna e o que medir' },
  { id: 'guia', nome: 'Guia de montagem', icone: '🧾',
    dica: 'Passo a passo, da bancada ao ensaio final — com o que medir em cada etapa' },
  { id: 'montagem', nome: 'Montar a câmara', icone: '📐',
    dica: 'Lista de corte em escala e a ordem de montagem, passo a passo' },
  { id: 'simulador', nome: 'Simulador', icone: '▶️',
    dica: 'Opere o painel: aperte os botões, injete falhas e veja o que acontece' },
];

export default function App() {
  const [aba, setAba] = useState('maquete');

  /* ⭐ O BOTÃO DO MEIO NÃO LIGA MAIS O AUTO-SCROLL DO WINDOWS.
     Apertar a rodinha sobre qualquer área que rola abre aquele alvo de
     setas e a página passa a correr sozinha atrás do ponteiro — com o
     desenho do painel em 3x, dentro de um container que já rola nos dois
     eixos, o resultado é perder a posição e não saber mais onde se
     estava. Barrar aqui vale para TODAS as abas.
     ⚠ Só o auto-scroll morre: `auxclick` continua disparando, então
     abrir link em nova aba com a rodinha segue funcionando. */
  useEffect(() => {
    const semAutoScroll = e => { if (e.button === 1) e.preventDefault(); };
    document.addEventListener('mousedown', semAutoScroll);
    return () => document.removeEventListener('mousedown', semAutoScroll);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex',
                  flexDirection: 'column', background: '#eef1f5' }}>

      <header className="nao-imprime" style={{ background: '#1d3557', color: '#fff', padding: '9px 16px',
                       display: 'flex', alignItems: 'center', gap: 18,
                       flexWrap: 'wrap', flexShrink: 0 }}>
        <div>
          <b style={{ fontSize: 15 }}>Projeto Integrador CF-01</b>
          <span style={{ fontSize: 11.5, opacity: 0.7, marginLeft: 9 }}>
            Cabine climatizada com ESP32
          </span>
        </div>
        <nav style={{ display: 'flex', gap: 7, marginLeft: 'auto', flexWrap: 'wrap' }}>
          {ABAS.map(a => (
            <button key={a.id} onClick={() => setAba(a.id)} title={a.dica}
              style={{
                background: aba === a.id ? '#fff' : '#ffffff1a',
                color: aba === a.id ? '#1d3557' : '#fff',
                border: '1px solid #ffffff3d', borderRadius: 6,
                padding: '6px 13px', cursor: 'pointer', fontSize: 12.5,
                fontWeight: aba === a.id ? 700 : 500,
              }}>
              {a.icone} {a.nome}
            </button>
          ))}
        </nav>
      </header>

      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        {aba === 'maquete' && <VistaMaquete onIrPara={setAba} />}
        {aba === 'painel'  && <VistaPainelInterno />}
        {aba === 'componentes' && (
          <div style={{ position: 'absolute', inset: 0, overflow: 'auto' }}>
            <VistaComponentes />
          </div>
        )}
        {aba === 'guia' && (
          <div style={{ position: 'absolute', inset: 0, overflow: 'auto' }}>
            <VistaGuia />
          </div>
        )}
        {aba === 'montagem' && (
          <div style={{ position: 'absolute', inset: 0, overflow: 'auto' }}>
            <VistaMontagem />
          </div>
        )}
        {aba === 'simulador' && (
          <div style={{ position: 'absolute', inset: 0, overflow: 'auto' }}>
            <VistaSimulador />
          </div>
        )}
      </div>
    </div>
  );
}
