/**
 * Gera a §20.3 do Doc 20 a partir do painel_completo.js.
 *
 * ⭐ Existe porque a §20.3 tinha derivado: falava em K0/K1, punha o KA1 e o
 *    KA2 no trilho 2 e não conhecia o KA3/KA4. Tabela escrita à mão sobre um
 *    modelo que os validadores conferem sempre acaba mentindo. Esta não pode.
 *
 *    Uso:  node scripts/gera_trilhos.mjs        (confere e avisa se mudou)
 *          node scripts/gera_trilhos.mjs --escreve   (reescreve a §20.3)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { COMPONENTES, TRILHOS, CAIXA } from '../src/data/painel_completo.js';

const DOC = new URL('../../camada_2_painel/20_painel_projeto_e_layout.md', import.meta.url);

const NOMES_TRILHO = {
  1: 'TRILHO 1 — Distribuição e proteção',
  2: 'TRILHO 2 — Potência e comando',
  3: 'TRILHO 3 — Controle',
};

const linhas = ['## 20.3 Ocupação de cada trilho', '',
  '> 🤖 **Esta seção é GERADA** por `npm run trilhos` a partir de',
  '> [`painel_completo.js`](../painel_interativo/src/data/painel_completo.js), que é o',
  '> mesmo modelo que o `npm run valida` confere. **Não edite à mão** — edite o modelo',
  '> e rode o gerador. Ela existe assim porque a versão escrita à mão tinha derivado:',
  '> falava em `K0`/`K1`, punha o KA1 e o KA2 no trilho errado e não conhecia o KA3',
  '> nem o KA4.', ''];

for (const tr of [1, 2, 3]) {
  const comps = COMPONENTES.filter((c) => c.trilho === tr).sort((a, b) => a.x - b.x);
  if (!comps.length) continue;
  const y = TRILHOS?.find?.((t) => t.n === tr)?.y;

  linhas.push(`### ${NOMES_TRILHO[tr]}${y ? ` (Y = ${y})` : ''}`, '');
  linhas.push('| # | Componente | X | Largura | Termina em |');
  linhas.push('|---:|---|---:|---:|---:|');

  let i = 0, fim = 0;
  for (const c of comps) {
    // o `nome` do modelo ja comeca com o id ("KA3 - VETO DO..."): tira a
    // repeticao para a tabela nao ficar "**KA3** - KA3 - ..."
    const nome = c.nome.replace(new RegExp('^' + c.id + '\\s*[—-]\\s*'), '')
      .replace(/\|/g, '\|');
    linhas.push(`| ${++i} | **${c.id}** — ${nome} | ${c.x} | ${c.largura} mm | ${c.x + c.largura} |`);
    fim = Math.max(fim, c.x + c.largura);
  }
  const util = CAIXA.largura - 42;   // fim útil do trilho, como no valida_painel
  linhas.push(`| | **Ocupação total** | | **${fim - comps[0].x} mm** | livre até ${util} — sobram **${util - fim} mm** |`);
  linhas.push('');
}

const novo = linhas.join('\n');
/* CRLF x LF: estes arquivos sao escritos com LF, mas num checkout Windows o
   git pode entrega-los com CRLF. Comparar byte a byte reprovaria o deploy
   por um motivo que nada tem a ver com o projeto. */
const lf = (s) => s.split(String.fromCharCode(13)).join('');

const doc = lf(readFileSync(DOC, 'utf8'));
const ini = doc.indexOf('## 20.3 Ocupação de cada trilho');
const prox = doc.indexOf('\n## 20.4', ini);
if (ini < 0 || prox < 0) { console.error('não achei os limites da §20.3'); process.exit(1); }

const atual = doc.slice(ini, prox).trimEnd();
if (atual === novo.trimEnd()) { console.log('§20.3 já está em dia'); process.exit(0); }

if (!process.argv.includes('--escreve')) {
  console.log('⚠️  a §20.3 está diferente do modelo. Rode com --escreve para atualizar.');
  process.exit(1);
}
writeFileSync(DOC, doc.slice(0, ini) + novo + '\n' + doc.slice(prox + 1), 'utf8');
console.log('§20.3 regenerada a partir do modelo');
