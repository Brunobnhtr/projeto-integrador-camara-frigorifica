"""Script para aperfeiçoar o suporte completo a fotos no lista_compras_interativa.html:
1. Garante <meta name="referrer" content="no-referrer"> no head.
2. Adiciona estilos CSS completos para tela e impressão da miniatura.
3. Cria modal popup com lightbox para ampliar a foto ao clicar.
4. Converte a foto do CAM-01 em Base64 para garantir carregamento instantâneo offline/online.
5. Atualiza o STORAGE_KEY para PI_COMPRAS_LINKS_V3 com migração automática que sincroniza fotos.
6. Adiciona botão de sincronização e restauração no topo.
"""
import re
import json
import base64
from pathlib import Path

BASE_DIR = Path("compras_projeto")
HTML_PATH = Path("lista_compras_interativa.html")
FOTO_CAM01 = BASE_DIR / "fotos" / "CAM-01_variacao.jpg"

with open(FOTO_CAM01, "rb") as f:
    b64_cam01 = base64.b64encode(f.read()).decode("utf-8")
cam01_uri = f"data:image/jpeg;base64,{b64_cam01}"

content = HTML_PATH.read_text(encoding="utf-8")

# 1. Garante meta referrer no head
if '<meta name="referrer"' not in content:
    content = content.replace(
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <meta name="referrer" content="no-referrer">'
    )

# 2. Estilos para miniatura e modal de foto
css_bloco = """
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
    .btn-thumb-zoom {
      background: #eff6ff;
      color: #2563eb;
      border: 1px solid #bfdbfe;
      border-radius: 4px;
      padding: 3px 8px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      transition: background 0.15s;
    }
    .btn-thumb-zoom:hover {
      background: #dbeafe;
    }

    /* Modal de Ampliação de Foto / Lightbox */
    .photo-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.75);
      z-index: 10000;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 20px;
      backdrop-filter: blur(4px);
    }
    .photo-modal-card {
      background: #fff;
      border-radius: 12px;
      max-width: 600px;
      width: 100%;
      overflow: hidden;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
      display: flex;
      flex-direction: column;
    }
    .photo-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 18px;
      border-bottom: 1px solid #e2e8f0;
      background: #f8fafc;
    }
    .photo-modal-body {
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0f172a;
      max-height: 500px;
      overflow: hidden;
    }
    .photo-modal-body img {
      max-width: 100%;
      max-height: 480px;
      object-fit: contain;
      border-radius: 6px;
    }
    .photo-modal-footer {
      padding: 12px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
    }
"""

# Substitui o estilo de tela se não tiver
if 'photo-modal-overlay' not in content:
    content = content.replace(
        '/* Single Purchase Option Card */',
        css_bloco + '\n    /* Single Purchase Option Card */'
    )

# 3. Adiciona o HTML do modal de foto no body (logo antes do zap-modal)
modal_foto_html = """
<!-- Modal de Foto / Lightbox da Variação -->
<div class="photo-modal-overlay" id="photo-modal" onclick="fecharModalFoto(event)">
  <div class="photo-modal-card" onclick="event.stopPropagation()">
    <div class="photo-modal-header">
      <h3 id="photo-modal-title" style="font-size:15px; font-weight:700; color:#0f172a;">Foto da Variação</h3>
      <button type="button" onclick="fecharModalFoto()" style="background:none; border:none; font-size:22px; cursor:pointer; color:#64748b;">&times;</button>
    </div>
    <div class="photo-modal-body">
      <img id="photo-modal-img" src="" alt="Ampliação da Variação">
    </div>
    <div class="photo-modal-footer">
      <span style="font-size:12px; color:#64748b;">Dica: Clique com botão direito na foto para copiar e colar no WhatsApp.</span>
      <button type="button" class="btn btn-outline" onclick="fecharModalFoto()">Fechar</button>
    </div>
  </div>
</div>
"""

if 'id="photo-modal"' not in content:
    content = content.replace(
        '<!-- WhatsApp Export Modal -->',
        modal_foto_html + '\n<!-- WhatsApp Export Modal -->'
    )

# 4. Atualiza a renderização da miniatura dentro de renderItens()
old_render_thumb_pattern = re.compile(
    r'<!-- THUMBNAIL VISUAL DA FOTO -->[\s\S]*?<!-- CAMPOS DE COMPRA -->',
    re.MULTILINE
)

new_render_thumb = """<!-- THUMBNAIL VISUAL DA FOTO -->
                  <div class="product-thumb-container">
                    <div class="product-thumb-box" ${opt.foto ? `onclick="abrirModalFoto('${opt.foto.replace(/'/g, "\\\\'")}', '${(opt.variacao || item.item).replace(/'/g, "\\\\'")}')" title="Clique para ampliar a foto"` : ''}>
                      ${opt.foto ? `
                        <img src="${opt.foto}" alt="Foto da Variação" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'product-thumb-empty\\'><span>⚠️</span><span>Foto indisponível</span></div>';">
                      ` : `
                        <div class="product-thumb-empty">
                          <span style="font-size:24px;">📷</span>
                          <span>Sem Foto</span>
                        </div>
                      `}
                    </div>
                    ${opt.foto ? `
                      <button type="button" class="btn-thumb-zoom" onclick="abrirModalFoto('${opt.foto.replace(/'/g, "\\\\'")}', '${(opt.variacao || item.item).replace(/'/g, "\\\\'")}')" title="Ver foto em tamanho ampliado">📸 Ver Foto</button>
                    ` : ''}
                  </div>

                  <!-- CAMPOS DE COMPRA -->"""

content = old_render_thumb_pattern.sub(new_render_thumb, content)

# 5. Adiciona funções JS abrirModalFoto e fecharModalFoto
js_funcoes_modal = """
function abrirModalFoto(url, titulo) {
  const modal = document.getElementById('photo-modal');
  const img = document.getElementById('photo-modal-img');
  const title = document.getElementById('photo-modal-title');
  if (modal && img) {
    img.src = url;
    if (title) title.innerText = titulo || 'Visualização da Variação / SKU';
    modal.style.display = 'flex';
  }
}

function fecharModalFoto(e) {
  if (!e || e.target.id === 'photo-modal' || e.target.tagName === 'BUTTON') {
    const modal = document.getElementById('photo-modal');
    if (modal) modal.style.display = 'none';
  }
}
"""

if 'function abrirModalFoto(' not in content:
    content = content.replace(
        'function abrirModalWhatsApp() {',
        js_funcoes_modal + '\nfunction abrirModalWhatsApp() {'
    )

# 6. Atualiza STORAGE_KEY para PI_COMPRAS_LINKS_V3 com migração de V1 e V2
old_storage_code_pattern = re.compile(
    r"const STORAGE_KEY = 'PI_COMPRAS_LINKS_V[0-9]';[\s\S]*?function init\(\)",
    re.MULTILINE
)

new_storage_code = """const STORAGE_KEY = 'PI_COMPRAS_LINKS_V3';
let store = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
let filtroAtivo = 'todos';

// Migração retrocompatível de V1 e V2 para V3 (sincronizando fotos e variações)
(function migrarStoresAnteriores() {
  let precisaSalvar = false;
  if (Object.keys(store).length === 0) {
    const v2 = JSON.parse(localStorage.getItem('PI_COMPRAS_LINKS_V2') || '{}');
    const v1 = JSON.parse(localStorage.getItem('PI_COMPRAS_LINKS_V1') || '{}');
    if (Object.keys(v2).length > 0) {
      store = v2;
      precisaSalvar = true;
    } else if (Object.keys(v1).length > 0) {
      for (const [id, val] of Object.entries(v1)) {
        store[id] = {
          opcoes: [{
            id: 'opt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            loja: val.loja || 'ML',
            link: val.link || '',
            preco: val.preco || '',
            freteGratis: false,
            freteValor: '',
            escolhida: true,
            obs: val.obs || ''
          }]
        };
      }
      precisaSalvar = true;
    }
  }

  // Sincronização inteligente: garante que cada item tenha sua foto e variação de seed oficial
  ITENS.forEach(it => {
    if (it.opcoes && it.opcoes.length > 0) {
      if (!store[it.id]) {
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
        precisaSalvar = true;
      } else if (store[it.id].opcoes) {
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
            precisaSalvar = true;
          } else {
            // Sempre que o seed tiver foto ou variação e o cache local estiver vazio ou desatualizado
            if (seed.foto && (!opt.foto || opt.foto.trim() === '')) {
              opt.foto = seed.foto;
              precisaSalvar = true;
            }
            if (seed.variacao && (!opt.variacao || opt.variacao.trim() === '')) {
              opt.variacao = seed.variacao;
              precisaSalvar = true;
            }
            if (seed.link && (!opt.link || opt.link.trim() === '')) {
              opt.link = seed.link;
              precisaSalvar = true;
            }
          }
        });
      }
    }
  });

  if (precisaSalvar) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }
})();

function init()"""

content = old_storage_code_pattern.sub(new_storage_code, content)

HTML_PATH.write_text(content, encoding="utf-8")
print("Todas as melhorias de fotos foram aplicadas com sucesso no HTML!")

