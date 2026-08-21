import { Component } from 'react';

/* ⭐ POR QUE ESTE ARQUIVO EXISTE — a tela branca.
 *
 * Quando um componente React lança uma exceção durante o desenho, o React
 * DESMONTA a árvore inteira. O resultado é uma página em branco, sem
 * mensagem nenhuma: quem está usando não sabe se travou, se caiu a rede
 * ou se clicou errado, e quem for consertar não tem nem por onde começar.
 *
 * Foi o que aconteceu com os fios: clicar num cabo de dentro do painel
 * derrubava tudo, porque o balão da câmara tentava descrever um destino
 * que aquele fio não tem. O defeito foi corrigido — esta barreira existe
 * para que o PRÓXIMO não volte a ser mudo.
 *
 * Ela não conserta nada: só transforma "tela branca" em "eis o erro, eis
 * onde ele aconteceu, e aqui está o botão para voltar".
 */
export default class BarreiraDeErro extends Component {
  constructor(props) {
    super(props);
    this.state = { erro: null, pilha: null };
  }

  static getDerivedStateFromError(erro) {
    return { erro };
  }

  componentDidCatch(erro, info) {
    this.setState({ pilha: info?.componentStack });
    console.error('Barreira de erro pegou:', erro, info);
  }

  render() {
    const { erro, pilha } = this.state;
    if (!erro) return this.props.children;

    const caixa = {
      background: '#fff', border: '2px solid #c92a2a', borderRadius: 9,
      padding: '18px 22px', maxWidth: 760, margin: '40px auto',
      fontFamily: 'Segoe UI, Arial, sans-serif',
    };
    return (
      <div style={{ padding: 20, overflow: 'auto', height: '100%' }}>
        <div style={caixa}>
          <h2 style={{ margin: '0 0 6px', fontSize: 19, color: '#c92a2a' }}>
            Alguma coisa quebrou nesta tela
          </h2>
          <p style={{ fontSize: 13, color: '#495057', lineHeight: 1.55, marginTop: 0 }}>
            O desenho parou de responder, mas <b>nada do projeto se perdeu</b> — os dados
            estão nos arquivos, e esta é só a vista. Clique em <b>Voltar</b> para seguir
            usando o aplicativo.
          </p>
          <div style={{
            background: '#fff5f5', border: '1px solid #ffc9c9', borderRadius: 6,
            padding: '10px 12px', fontFamily: 'ui-monospace, monospace',
            fontSize: 12, color: '#a51111', whiteSpace: 'pre-wrap', marginBottom: 12,
          }}>
            {String(erro?.message || erro)}
          </div>
          {pilha && (
            <details style={{ fontSize: 12, color: '#868e96', marginBottom: 14 }}>
              <summary style={{ cursor: 'pointer' }}>onde aconteceu</summary>
              <pre style={{ whiteSpace: 'pre-wrap', fontSize: 11, lineHeight: 1.45 }}>
                {pilha.trim().split('\n').slice(0, 8).join('\n')}
              </pre>
            </details>
          )}
          <button onClick={() => this.setState({ erro: null, pilha: null })}
                  style={{
                    background: '#1d3557', color: '#fff', border: 'none',
                    borderRadius: 6, padding: '9px 18px', fontSize: 13, cursor: 'pointer',
                  }}>
            ↩ Voltar
          </button>
          <span style={{ fontSize: 11.5, color: '#868e96', marginLeft: 12 }}>
            Se voltar a acontecer, o texto vermelho acima é o que diz onde consertar.
          </span>
        </div>
      </div>
    );
  }
}
