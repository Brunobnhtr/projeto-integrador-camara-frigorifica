from pathlib import Path
import sys

HTML_PATH = Path("lista_compras_interativa.html")
content = HTML_PATH.read_text(encoding="utf-8")

needle = 'Link do Produto (URL):'
pos = content.find(needle)
if pos == -1:
    print("ERRO: needle não encontrado!")
    sys.exit(1)

# Acha o <div class="field-group" anterior
start_idx = content.rfind('<div class="field-group"', 0, pos)
# Acha o próximo <div class="field-group">
end_idx = content.find('<div class="field-group">', pos)

print(f"Substituindo de {start_idx} até {end_idx}")

novo_bloco = """<div class="field-group" style="grid-column: span 2;">
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

                      <button type="button" class="btn btn-sm" style="background:#f97316; color:#fff; font-weight:700; padding:8px 13px; border:none; border-radius:6px; white-space:nowrap; display:inline-flex; align-items:center; gap:5px; box-shadow:0 2px 5px rgba(249,115,22,0.3); font-size:12px;" title="Se você já está com o anúncio aberto em outra aba do Brave, clique aqui e aperte o favorito no Brave!" onclick="ativarEsperaCaptura('${item.id}', '${opt.id}')">
                        🦁 Capturar do Brave
                      </button>

                      <button type="button" class="btn btn-sm btn-outline" style="white-space:nowrap; padding:7px 11px; font-size:11.5px; font-weight:600;" title="Resgata dados em segundo plano" onclick="autoResgatarLink('${item.id}', '${opt.id}')">
                        ⚡ Auto-Resgatar
                      </button>

                      <button type="button" class="btn btn-sm btn-outline" style="white-space:nowrap; padding:7px 11px; font-size:11.5px; color:#475569;" title="Abre o navegador na tela com banner para você confirmar a escolha" onclick="escolherSkuAoVivo('${item.id}', '${opt.id}')">
                        🖥️ Janela Robô
                      </button>
                    </div>
                  </div>

                  """

novo_conteudo = content[:start_idx] + novo_bloco + content[end_idx:]
HTML_PATH.write_text(novo_conteudo, encoding="utf-8")
print("SUBSTITUÍDO COM SUCESSO ABSOLUTO!")

