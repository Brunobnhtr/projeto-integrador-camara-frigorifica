from pathlib import Path
import re

HTML_PATH = Path("lista_compras_interativa.html")
content = HTML_PATH.read_text(encoding="utf-8")

old_pattern = re.compile(
    r'<div class="field-group" style="grid-column: span 2;">\s*<label class="field-label">Link do Produto \(URL\):</label>[\s\S]*?</div>\s*</div>\s*</div>\s*<div class="field-group">',
    re.MULTILINE
)

new_block = """<div class="field-group" style="grid-column: span 2;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                      <label class="field-label" style="font-weight:700; color:#1e293b; margin-bottom:0;">Link do Produto (URL):</label>
                      ${opt.link ? `
                        <a href="${opt.link}" target="_blank" style="color:#2563eb; font-weight:700; text-decoration:none; font-size:12px; display:inline-flex; align-items:center; gap:4px;" title="Abrir link em nova aba">
                          🔗 Abrir Anúncio em Nova Aba ↗
                        </a>
                      ` : ''}
                    </div>

                    <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                      <input type="url" class="input-box" style="flex:1; min-width:260px;" placeholder="https://pt.aliexpress.com/item/..." value="${opt.link || ''}" onchange="atualizarCampoOpcao('${item.id}', '${opt.id}', 'link', this.value)">
                      
                      ${opt.link ? `
                        <a href="${opt.link}" target="_blank" class="btn btn-sm" style="background:#2563eb; color:#fff; font-weight:700; padding:7px 14px; text-decoration:none; border-radius:6px; white-space:nowrap; display:inline-flex; align-items:center; gap:6px; box-shadow:0 2px 5px rgba(37,99,235,0.3); font-size:12px;" title="Abre o produto em uma nova aba do seu navegador">
                          🔗 Abrir Anúncio ↗
                        </a>
                      ` : `
                        <button type="button" class="btn btn-sm btn-outline" style="opacity:0.5; cursor:not-allowed; padding:7px 12px; font-size:12px;" title="Insira um link primeiro">🔗 Abrir Anúncio ↗</button>
                      `}

                      <button type="button" class="btn btn-sm" style="background:#f97316; color:#fff; font-weight:700; padding:7px 12px; border:none; border-radius:6px; white-space:nowrap; display:inline-flex; align-items:center; gap:5px; box-shadow:0 2px 5px rgba(249,115,22,0.3); font-size:12px;" title="Se o anúncio já está aberto na outra aba, clique aqui e aperte o favorito no Brave!" onclick="ativarEsperaCaptura('${item.id}', '${opt.id}')">
                        🦁 Capturar do Brave
                      </button>

                      <button type="button" class="btn btn-sm btn-outline" style="white-space:nowrap; padding:6px 10px; font-size:11.5px; font-weight:600;" title="Resgata dados em segundo plano" onclick="autoResgatarLink('${item.id}', '${opt.id}')">
                        ⚡ Auto-Resgatar
                      </button>

                      <button type="button" class="btn btn-sm btn-outline" style="white-space:nowrap; padding:6px 10px; font-size:11.5px; color:#475569;" title="Abre o Brave na tela com banner para confirmar" onclick="escolherSkuAoVivo('${item.id}', '${opt.id}')">
                        🖥️ Janela Robô
                      </button>
                    </div>
                  </div>

                  <div class="field-group">"""

content = old_pattern.sub(new_block, content)
HTML_PATH.write_text(content, encoding="utf-8")
print("Botão Abrir Anúncio restabelecido com destaque máximo!")

