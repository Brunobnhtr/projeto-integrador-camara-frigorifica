from pathlib import Path

HTML_PATH = Path("lista_compras_interativa.html")
content = HTML_PATH.read_text(encoding="utf-8")

# Localiza onde está o campo de link
alvo_antigo = """                  <div class="field-group" style="grid-column: span 2;">
                    <label class="field-label">Link do Produto (URL):</label>
                    <div style="display:flex; gap:6px;">
                      <div style="display:flex; gap:6px; align-items:center;">
          <input type="url" class="input-box" style="flex:1;" placeholder="https://..." value="${opt.link || ''}" onchange="atualizarCampoOpcao('${item.id}', '${opt.id}', 'link', this.value)">
          <button type="button" class="btn btn-sm btn-outline" style="white-space:nowrap; padding:5px 8px; font-size:11px;" title="Resgata os dados em segundo plano" onclick="autoResgatarLink('${item.id}', '${opt.id}')">⚡ Auto-Resgatar</button>
          <button type="button" class="btn btn-sm" style="white-space:nowrap; padding:5px 9px; font-size:11px; background:#fb923c; color:#fff; border:none; font-weight:700;" title="Abre o Brave visível na tela com banner para você confirmar a escolha" onclick="escolherSkuAoVivo('${item.id}', '${opt.id}')">🦁 Escolher SKU no Brave</button>
          <button type="button" class="btn btn-sm" style="white-space:nowrap; padding:5px 8px; font-size:11px; background:#fff7ed; color:#c2410c; border:1px solid #fed7aa; font-weight:600;" title="Se você já está com o anúncio aberto em outra aba do Brave, clique aqui e aperte o favorito na aba do anúncio!" onclick="ativarEsperaCaptura('${item.id}', '${opt.id}')">⚡ Capturar da aba aberta</button>
        </div>
                      ${opt.link ? `<a href="${opt.link}" target="_blank" class="btn btn-outline" style="padding:6px 10px; font-size:12px; white-space:nowrap;" title="Abrir anúncio">🔗 Abrir ↗</a>` : ''}
                    </div>
                  </div>"""

# Se tiver caracteres corrompidos, busca de forma flexível
import re
padrao_flexivel = re.compile(
    r'<div class="field-group" style="grid-column: span 2;">[\s\S]*?<label class="field-label">Link do Produto \(URL\):</label>[\s\S]*?</div>\s*</div>\s*</div>\s*(?=\s*<div class="field-group">)',
    re.MULTILINE
)

substituto = """                  <div class="field-group" style="grid-column: span 2;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                      <label class="field-label" style="font-weight:700; color:#0f172a; margin-bottom:0; font-size:12.5px;">Link do Produto (URL):</label>
                      ${opt.link ? `
                        <a href="${opt.link}" target="_blank" style="color:#2563eb; font-weight:700; text-decoration:none; font-size:12px; display:inline-flex; align-items:center; gap:4px;" title="Clique para abrir em nova aba">
                          🔗 Abrir Anúncio em Nova Aba ↗
                        </a>
                      ` : ''}
                    </div>

                    <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                      <input type="url" class="input-box" style="flex:1; min-width:240px; padding:8px 12px; font-size:13px;" placeholder="https://pt.aliexpress.com/item/..." value="${opt.link || ''}" onchange="atualizarCampoOpcao('${item.id}', '${opt.id}', 'link', this.value)">
                      
                      ${opt.link ? `
                        <a href="${opt.link}" target="_blank" class="btn" style="background:#2563eb; color:#fff; font-weight:700; padding:8px 16px; text-decoration:none; border-radius:6px; white-space:nowrap; display:inline-flex; align-items:center; gap:6px; font-size:13px; box-shadow:0 2px 6px rgba(37,99,235,0.35);" title="Clique aqui para abrir a página do produto no seu navegador">
                          🔗 Abrir Anúncio ↗
                        </a>
                      ` : `
                        <button type="button" class="btn btn-outline" style="opacity:0.5; cursor:not-allowed; padding:8px 14px; font-size:12.5px;" title="Cole o link no campo ao lado primeiro">🔗 Abrir Anúncio ↗</button>
                      `}

                      <button type="button" class="btn btn-sm" style="background:#f97316; color:#fff; font-weight:700; padding:7px 12px; border:none; border-radius:6px; white-space:nowrap; display:inline-flex; align-items:center; gap:5px; box-shadow:0 2px 5px rgba(249,115,22,0.3); font-size:11.5px;" title="Se você já está com o anúncio aberto em outra aba do Brave, clique aqui e aperte o favorito no Brave!" onclick="ativarEsperaCaptura('${item.id}', '${opt.id}')">
                        🦁 Capturar do Brave
                      </button>

                      <button type="button" class="btn btn-sm btn-outline" style="white-space:nowrap; padding:6px 10px; font-size:11.5px; font-weight:600;" title="Resgata dados em segundo plano" onclick="autoResgatarLink('${item.id}', '${opt.id}')">
                        ⚡ Auto-Resgatar
                      </button>

                      <button type="button" class="btn btn-sm btn-outline" style="white-space:nowrap; padding:6px 10px; font-size:11.5px; color:#475569;" title="Abre o navegador na tela com banner para você confirmar a escolha" onclick="escolherSkuAoVivo('${item.id}', '${opt.id}')">
                        🖥️ Janela Robô
                      </button>
                    </div>
                  </div>"""

novo_conteudo, count = padrao_flexivel.subn(substituto, content, count=1)
if count > 0:
    HTML_PATH.write_text(novo_conteudo, encoding="utf-8")
    print(f"Sucesso! Bloco de links e botão 'Abrir Anúncio' substituído ({count} substituição).")
else:
    print("ERRO: Padrão flexível não encontrado.")

