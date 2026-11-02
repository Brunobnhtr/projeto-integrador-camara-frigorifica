import re
from pathlib import Path

HTML_PATH = Path("lista_compras_interativa.html")
content = HTML_PATH.read_text(encoding="utf-8")

# 1. Adiciona o Banner do Brave no topo
banner_brave = """  <!-- Brave Bookmarklet Banner -->
  <div style="background:#fff7ed; border-left:5px solid #f97316; padding:14px 18px; border-radius:8px; margin-bottom:20px; font-size:13.5px; color:#9a3412; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px; box-shadow:0 2px 5px rgba(249,115,22,0.08);">
    <div style="max-width:850px;">
      <div style="font-weight:700; color:#c2410c; display:flex; align-items:center; gap:8px; font-size:14.5px;">
        <span style="font-size:20px;">🦁</span> <span>Atalho de Captura Direta no seu Brave Browser:</span>
      </div>
      <div style="font-size:12.5px; color:#7c2d12; margin-top:3px; line-height:1.4;">
        Para não precisar abrir janelas extras: arraste o botão laranja ao lado para a <b>Barra de Favoritos do seu Brave</b> (ou pressione <code>Ctrl + Shift + O</code>). Quando estiver em qualquer anúncio no AliExpress, clique no modelo desejado e aperte o favorito — a foto da variação, o preço e o link caem direto nesta lista!
      </div>
    </div>
    <div>
      <a href="javascript:(function(){const u=window.location.href;const selSkuEl=document.querySelector('[class*=%22sku-item--selected%22],[class*=%22sku-property-item--selected%22],[class*=%22slider--active%22],[class*=%22sku-item--title%22],.ui-pdp-variations__selected-text');const variacao=selSkuEl?selSkuEl.innerText.replace(/\\n/g,' ').trim():'';const pEl=document.querySelector('[class*=%22price-default--current%22],[class*=%22price--current%22],[class*=%22product-price-current%22],.product-price-value,.andes-money-amount__fraction');const centsEl=document.querySelector('.andes-money-amount__cents');let preco=pEl?pEl.innerText.trim():'';if(centsEl)preco+=','+centsEl.innerText.trim();const skuImg=document.querySelector('[class*=%22active%22] img[src*=%22kf/%22],[class*=%22selected%22] img[src*=%22kf/%22],[aria-checked=%22true%22] img,[class*=%22sku-item--selected%22] img,[class*=%22slider--active%22] img,.ui-pdp-variations [aria-selected=%22true%22] img');let foto=skuImg?skuImg.src.replace(/_\\d+x\\d+[^.]*\\./,'_960x960q75.').replace(/\\.jpg_\\d+x\\d+.*$/,' .jpg'):'';if(!foto){const mainImg=document.querySelector('img[class*=%22magnifier--image%22],.gallery-preview-panel img,.ui-pdp-gallery__figure img,.product-img img');if(mainImg)foto=mainImg.src;}fetch('http://localhost:8000/api/receber_sku',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:u,variacao:variacao,preco:preco,foto:foto,timestamp:Date.now()})}).then(r=>r.json()).then(d=>alert('✅ SKU CAPTURADO COM SUCESSO!\\n\\n• Variação: '+(variacao||'Padrão')+'\\n• Valor: R$ '+preco+'\\n• Foto da variação capturada!\\n\\nJá transferido para a sua Lista de Compras!')).catch(e=>alert('⚠️ Servidor local (porta 8000) não respondeu. Certifique-se de que o servidor está rodando!'));})();"
         class="btn" style="background:#f97316; color:#fff; font-weight:700; font-size:13px; text-decoration:none; padding:9px 16px; border-radius:8px; box-shadow:0 3px 8px rgba(249,115,22,0.35); white-space:nowrap; display:inline-flex; align-items:center; gap:6px;"
         title="Arraste este botão para a sua Barra de Favoritos no Brave">
        ⭐ ⚡ Capturar SKU no Brave
      </a>
    </div>
  </div>
"""

if '🦁 Atalho de Captura Direta no seu Brave Browser' not in content:
    content = content.replace(
        '<!-- SENAI Notice -->',
        banner_brave + '\n  <!-- SENAI Notice -->'
    )

# 2. Adiciona botão "🦁 Capturar da aba aberta" ao lado de "Escolher SKU ao Vivo"
btn_capturar_aba = """<button type="button" class="btn btn-sm" style="white-space:nowrap; padding:5px 9px; font-size:11px; background:#fb923c; color:#fff; border:none; font-weight:700;" title="Abre o Brave visível na tela com banner para você confirmar a escolha" onclick="escolherSkuAoVivo('${item.id}', '${opt.id}')">🦁 Escolher SKU no Brave</button>
          <button type="button" class="btn btn-sm" style="white-space:nowrap; padding:5px 8px; font-size:11px; background:#fff7ed; color:#c2410c; border:1px solid #fed7aa; font-weight:600;" title="Se você já está com o anúncio aberto em outra aba do Brave, clique aqui e aperte o favorito na aba do anúncio!" onclick="ativarEsperaCaptura('${item.id}', '${opt.id}')">⚡ Capturar da aba aberta</button>"""

content = re.sub(
    r'<button type="button" class="btn btn-sm"[^>]*onclick="escolherSkuAoVivo\(\'\$\{item\.id\}\', \'\$\{opt\.id\}\'\)"[^>]*>.*?</button>',
    btn_capturar_aba,
    content
)

# 3. Adiciona código JS de polling e ativação de espera
js_polling = """
let ultimoTimestampSkuRecebido = 0;
let itemEsperandoCaptura = null;

function ativarEsperaCaptura(itemId, optId) {
  itemEsperandoCaptura = { itemId, optId };
  mostrarToast(`🦁 Aguardando captura para ${itemId}! Vá na aba do anúncio no seu Brave e clique no favorito '⭐ Capturar SKU no Brave'!`);
}

async function checarUltimaEscolhaServidor() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/ultima_escolha', { cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json();
    if (!data || !data.timestamp || data.timestamp <= ultimoTimestampSkuRecebido) return;
    
    ultimoTimestampSkuRecebido = data.timestamp;
    
    let targetItem = itemEsperandoCaptura?.itemId;
    let targetOpt = itemEsperandoCaptura?.optId;
    
    // Se o usuário não clicou especificamente em 'Aguardando', tenta encontrar automaticamente pelo link
    if (!targetItem) {
      for (const [itId, val] of Object.entries(store)) {
        const found = (val.opcoes || []).find(o => {
          if (!o.link || !data.url) return false;
          const clean1 = o.link.split('?')[0].replace(/.*\/item\//, '');
          const clean2 = data.url.split('?')[0].replace(/.*\/item\//, '');
          return clean1 && clean2 && (clean1 === clean2 || clean1.includes(clean2) || clean2.includes(clean1));
        });
        if (found) {
          targetItem = itId;
          targetOpt = found.id;
          break;
        }
      }
    }
    
    // Se achou o item correspondente, aplica direto!
    if (targetItem && targetOpt && store[targetItem]) {
      const opt = store[targetItem].opcoes.find(o => o.id === targetOpt);
      if (opt) {
        if (data.url) opt.link = data.url;
        if (data.preco != null) opt.preco = data.preco;
        if (data.variacao) opt.variacao = data.variacao;
        if (data.foto) opt.foto = data.foto;
        if (data.loja) opt.loja = data.loja;
        salvarStore();
        renderItens();
        atualizarKPIs();
        itemEsperandoCaptura = null;
        mostrarToast(`🎉 Sucesso! SKU '${data.variacao}' (R$ ${data.preco}) e foto aplicados em ${targetItem}!`);
        return;
      }
    }
    
    // Caso contrário, mostra notificação genérica
    mostrarToast(`📥 Novo SKU recebido do Brave: ${data.variacao || 'Opção'} (R$ ${data.preco})!`);
  } catch (e) {
    // Servidor offline ou silencioso
  }
}

// Inicia verificação contínua do Brave a cada 1.5s
setInterval(checarUltimaEscolhaServidor, 1500);
"""

if 'function checarUltimaEscolhaServidor()' not in content:
    content = content.replace(
        'async function escolherSkuAoVivo(itemId, optId) {',
        js_polling + '\nasync function escolherSkuAoVivo(itemId, optId) {'
    )

HTML_PATH.write_text(content, encoding="utf-8")
print("HTML atualizado com suporte completo ao Brave e Bookmarklet!")

