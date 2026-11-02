import json
import base64
from pathlib import Path

BASE_DIR = Path("compras_projeto")
HTML_FILE = Path("lista_compras_interativa.html")

# 1. Carrega Base64 da foto do CAM-01
foto_cam01_path = BASE_DIR / "fotos" / "CAM-01_variacao.jpg"
with open(foto_cam01_path, "rb") as f:
    b64_img = base64.b64encode(f.read()).decode("utf-8")
cam01_data_uri = f"data:image/jpeg;base64,{b64_img}"

html_content = HTML_FILE.read_text(encoding="utf-8")

# 2. Injeta <meta name="referrer" content="no-referrer"> se não existir
if '<meta name="referrer" content="no-referrer">' not in html_content:
    html_content = html_content.replace(
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <meta name="referrer" content="no-referrer">'
    )

# 3. CSS para exibição em tela (antes do @media print)
css_screen_thumbs = """
    /* Layout do Corpo da Opção e Miniatura da Foto */
    .option-card-body {
      display: flex;
      gap: 16px;
      align-items: flex-start;
      margin-top: 10px;
    }
    @media (max-width: 680px) {
      .option-card-body {
        flex-direction: column;
        align-items: center;
      }
    }
    .product-thumb-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      width: 110px;
      flex-shrink: 0;
    }
    .product-thumb-box {
      width: 110px;
      height: 110px;
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
      background: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      transition: all 0.2s ease;
      cursor: pointer;
    }
    .product-thumb-box:hover {
      transform: scale(1.04);
      border-color: var(--primary);
      box-shadow: 0 4px 10px rgba(0,0,0,0.12);
    }
    .product-thumb-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .product-thumb-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #94a3b8;
      font-size: 11px;
      text-align: center;
      padding: 4px;
    }
    .product-thumb-link {
      font-size: 11px;
      color: #2563eb;
      text-decoration: none;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 3px;
    }
    .product-thumb-link:hover {
      text-decoration: underline;
    }
"""

if '.option-card-body {' not in html_content:
    html_content = html_content.replace(
        '/* Single Purchase Option Card */',
        css_screen_thumbs + '\n    /* Single Purchase Option Card */'
    )

# 4. Substitui a foto do CAM-01 para a data URI segura
old_cam01_foto = '"foto": "compras_projeto/fotos/CAM-01_variacao.jpg"'
new_cam01_foto = f'"foto": "{cam01_data_uri}"'
if old_cam01_foto in html_content:
    html_content = html_content.replace(old_cam01_foto, new_cam01_foto)

# 5. Adiciona botão de sincronização no cabeçalho se não existir
btn_sinc = '<button type="button" class="btn btn-outline" onclick="forcarSincronizarBanco()" title="Sincroniza e recarrega fotos e dados oficiais recomendados">🔄 Sincronizar Fotos e Banco</button>'
if 'forcarSincronizarBanco()' not in html_content:
    html_content = html_content.replace(
        '<button class="btn btn-outline" onclick="exportarBackup()">💾 Exportar Dados</button>',
        btn_sinc + '\n      <button class="btn btn-outline" onclick="exportarBackup()">💾 Exportar Dados</button>'
    )

# 6. Atualiza a função init() e adiciona forcarSincronizarBanco()
old_init = """function init() {
  // Inicializa automaticamente o store com as opções pré-cadastradas em ITENS (se não houver edição manual salva)
  ITENS.forEach(it => {
    if (!store[it.id] && it.opcoes && it.opcoes.length > 0) {
      store[it.id] = {
        opcoes: it.opcoes.map((o, idx) => ({
          id: 'opt_seed_' + it.id + '_' + idx,
          loja: o.loja || 'ALI',
          link: o.link || '',
          preco: (o.preco != null) ? o.preco : '',
          freteGratis: (o.frete === 0 || o.frete === 0.0),
          freteValor: (o.frete && o.frete > 0) ? o.frete : '',
          escolhida: (it.escolha === idx || (it.escolha == null && idx === 0)),
          variacao: o.variacao || '',
          obs: o.obs || '',
          foto: o.foto || ''
        }))
      };
    }
  });

  renderItens();
  atualizarKPIs();
}"""

# Procura a versão existente do init()
import re
new_init_and_sync = """function init() {
  // Inicializa ou sincroniza automaticamente o store com as fotos e dados pré-cadastrados em ITENS
  ITENS.forEach(it => {
    if (!store[it.id]) {
      if (it.opcoes && it.opcoes.length > 0) {
        store[it.id] = {
          opcoes: it.opcoes.map((o, idx) => ({
            id: 'opt_seed_' + it.id + '_' + idx,
            loja: o.loja || 'ALI',
            link: o.link || '',
            preco: (o.preco != null) ? o.preco : '',
            freteGratis: (o.frete === 0 || o.frete === 0.0),
            freteValor: (o.frete && o.frete > 0) ? o.frete : '',
            escolhida: (it.escolha === idx || (it.escolha == null && idx === 0)),
            variacao: o.variacao || '',
            obs: o.obs || '',
            foto: o.foto || ''
          }))
        };
      }
    } else {
      // Sincroniza fotos e variações do banco caso estejam vazias no cache do navegador
      if (store[it.id].opcoes && it.opcoes) {
        it.opcoes.forEach((seed, idx) => {
          let opt = store[it.id].opcoes[idx];
          if (!opt) {
            store[it.id].opcoes.push({
              id: 'opt_seed_' + it.id + '_' + idx,
              loja: seed.loja || 'ALI',
              link: seed.link || '',
              preco: (seed.preco != null) ? seed.preco : '',
              freteGratis: (seed.frete === 0 || seed.frete === 0.0),
              freteValor: (seed.frete && seed.frete > 0) ? seed.frete : '',
              escolhida: (it.escolha === idx || (it.escolha == null && idx === 0)),
              variacao: seed.variacao || '',
              obs: seed.obs || '',
              foto: seed.foto || ''
            });
          } else {
            if (seed.foto && (!opt.foto || opt.foto.trim() === '')) {
              opt.foto = seed.foto;
            }
            if (seed.variacao && (!opt.variacao || opt.variacao.trim() === '')) {
              opt.variacao = seed.variacao;
            }
            if (seed.link && (!opt.link || opt.link.trim() === '')) {
              opt.link = seed.link;
            }
            if ((opt.preco === '' || opt.preco == null) && seed.preco != null) {
              opt.preco = seed.preco;
            }
          }
        });
      }
    }
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  renderItens();
  atualizarKPIs();
}

function forcarSincronizarBanco() {
  if (confirm("Deseja sincronizar todas as fotos e especificações oficiais de variantes com o banco de dados?")) {
    ITENS.forEach(it => {
      if (it.opcoes && it.opcoes.length > 0) {
        if (!store[it.id]) {
          store[it.id] = { opcoes: [] };
        }
        it.opcoes.forEach((seed, idx) => {
          let opt = store[it.id].opcoes[idx];
          if (!opt) {
            store[it.id].opcoes.push({
              id: 'opt_seed_' + it.id + '_' + idx,
              loja: seed.loja || 'ALI',
              link: seed.link || '',
              preco: (seed.preco != null) ? seed.preco : '',
              freteGratis: (seed.frete === 0 || seed.frete === 0.0),
              freteValor: (seed.frete && seed.frete > 0) ? seed.frete : '',
              escolhida: (it.escolha === idx || (it.escolha == null && idx === 0)),
              variacao: seed.variacao || '',
              obs: seed.obs || '',
              foto: seed.foto || ''
            });
          } else {
            if (seed.foto) opt.foto = seed.foto;
            if (seed.variacao) opt.variacao = seed.variacao;
            if (seed.link && (!opt.link || opt.link.includes('aliexpress.com/item/'))) opt.link = seed.link;
            if (seed.preco != null) opt.preco = seed.preco;
            if (seed.obs && !opt.obs) opt.obs = seed.obs;
          }
        });
      }
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    renderItens();
    atualizarKPIs();
    mostrarToast("✅ Fotos e variantes sincronizadas com sucesso!");
  }
}"""

init_pattern = re.compile(r'function init\(\)\s*\{[\s\S]*?atualizarKPIs\(\);\s*\}', re.MULTILINE)
if init_pattern.search(html_content):
    html_content = init_pattern.sub(new_init_and_sync, html_content)
    print("Substituído init() com sucesso!")
else:
    print("AVISO: Padrão init() não encontrado diretamente.")

HTML_FILE.write_text(html_content, encoding="utf-8")
print("HTML atualizado com sucesso!")

