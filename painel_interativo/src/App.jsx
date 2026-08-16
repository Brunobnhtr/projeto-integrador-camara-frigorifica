import { useState } from 'react';
import VistaMaquete from './components/VistaMaquete';
import VistaPainelInterno from './components/VistaPainelInterno';
import MapaComponentes from './components/MapaComponentes';

/* A casca do aplicativo. Cada aba é uma forma diferente de olhar o mesmo
   projeto — da vista mais geral (a maquete inteira) para a mais detalhada
   (componente por componente). */

const ABAS = [
  { id: 'maquete', nome: 'A maquete de cima', icone: '🗺️',
    dica: 'Por onde a energia entra e como ela chega até a câmara' },
  { id: 'painel',  nome: 'Dentro do painel',  icone: '🔧',
    dica: 'Todos os componentes e seus terminais, em escala real' },
  { id: 'mapa',    nome: 'Mapa de ligações',  icone: '🔌',
    dica: 'Todos os componentes e cabos, para consultar uma conexão' },
];

export default function App() {
  const [aba, setAba] = useState('maquete');

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex',
                  flexDirection: 'column', background: '#eef1f5' }}>

      <header style={{ background: '#1d3557', color: '#fff', padding: '9px 16px',
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
        {aba === 'mapa'    && <MapaComponentes />}
      </div>
    </div>
  );
}
