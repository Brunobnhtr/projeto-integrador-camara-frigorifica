import re
import urllib.parse
from pathlib import Path

HTML_FILE = Path("lista_compras_interativa.html").resolve()

print("Patching lista_compras_interativa.html...")
with open(HTML_FILE, "r", encoding="utf-8") as f:
    html = f.read()

# 1. Update Bookmarklet JS
js_code = """(function(){const u=window.location.href;let variacao='';const selTitleEl=document.querySelector('[class*="sku-item--title"],[class*="sku-title"],[class*="property-title"],[class*="sku-property--title"]');if(selTitleEl&&selTitleEl.innerText){variacao=selTitleEl.innerText.replace(/^(cor|color|tamanho|size):\\s*/i,'').replace(/Ver mais.*/is,'').replace(/\\n/g,' ').trim();}if(!variacao){const selSkuEl=document.querySelector('[class*="sku-item--selected"],[class*="sku-property-item--selected"],[class*="slider--active"],.ui-pdp-variations__selected-text');if(selSkuEl)variacao=selSkuEl.innerText.replace(/^(cor|color):\\s*/i,'').replace(/\\n/g,' ').trim();}const pEl=document.querySelector('[class*="price-default--current"],[class*="price--current"],[class*="product-price-current"],.product-price-value,.ui-pdp-price__second-line .andes-money-amount__fraction,.andes-money-amount__fraction');const centsEl=document.querySelector('.andes-money-amount__cents,.ui-pdp-price__second-line .andes-money-amount__cents');let preco=pEl?pEl.innerText.trim():'';if(centsEl&&!preco.includes(','))preco+=','+centsEl.innerText.trim();let foto='';const skuImg=document.querySelector('[class*="active"] img[src*="kf/"],[class*="selected"] img[src*="kf/"],[aria-checked="true"] img,[class*="sku-item--selected"] img,[class*="slider--active"] img,.ui-pdp-variations [aria-selected="true"] img');if(skuImg&&skuImg.src){foto=skuImg.src.replace(/_\\d+x\\d+[^.]*\\./,'_960x960q75.').replace(/\\.jpg_\\d+x\\d+.*$/i,'.jpg');}if(!foto){const mainImg=document.querySelector('img[class*="magnifier--image"],.gallery-preview-panel img,.ui-pdp-gallery__figure img,.product-img img');if(mainImg&&mainImg.src)foto=mainImg.src;}foto=foto.replace(/\\s+\\.jpg/,'.jpg').trim();fetch('http://localhost:8000/api/receber_sku',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:u,variacao:variacao,preco:preco,foto:foto,timestamp:Date.now()})}).then(r=>r.json()).then(d=>{alert('🎉 SKU CAPTURADO COM SUCESSO!\\n\\n• Variação: '+(variacao||'Identificada')+'\\n• Valor: R$ '+preco+'\\n• Item Vinculado: '+(d.itemId||'Detectado')+'\\n\\nVolte na aba da Lista de Compras para ver o card atualizado!');}).catch(e=>alert('⚠️ Servidor local na porta 8000 não respondeu. Certifique-se de que o servidor está rodando!'));})();"""

encoded_href = "javascript:" + urllib.parse.quote(js_code, safe="():;,=!/?'\"@+*&%$#[]")

# Substitui o href do bookmarklet
html = re.sub(
    r'<a href="javascript:[^"]*" class="btn"[^>]*title="Arraste este botão para a sua Barra de Favoritos no Brave">',
    lambda m: f'<a href="{encoded_href}" class="btn" style="background:#f97316; color:#fff; font-weight:700; font-size:13px; text-decoration:none; padding:9px 16px; border-radius:8px; box-shadow:0 3px 8px rgba(249,115,22,0.35); white-space:nowrap; display:inline-flex; align-items:center; gap:6px;" title="Arraste este botão para a sua Barra de Favoritos no Brave">',
    html
)

# 2. Update checarUltimaEscolhaServidor
new_checar = """async function checarUltimaEscolhaServidor() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/ultima_escolha', { cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json();
    if (!data || !data.timestamp || data.timestamp <= ultimoTimestampSkuRecebido) return;
    
    ultimoTimestampSkuRecebido = data.timestamp;
    
    let targetItem = itemEsperandoCaptura?.itemId || data.itemId;
    let targetOpt = itemEsperandoCaptura?.optId || data.optId;
    
    // Se o item não veio identificado, tenta encontrar pelo ID do link
    if (!targetItem) {
      function extrairIdUrl(url) {
        if (!url) return '';
        const ali = url.match(/\\/item\\/(\\d+)/);
        if (ali) return ali[1];
        const ml = url.match(/MLB-?(\\d+)/i);
        if (ml) return ml[1];
        return url.split('?')[0].replace(/.*\\//, '');
      }
      
      const linkId = extrairIdUrl(data.url);
      if (linkId) {
        for (const [itId, val] of Object.entries(store)) {
          const found = (val.opcoes || []).find(o => {
            if (!o.link) return false;
            return extrairIdUrl(o.link) === linkId || o.link.includes(linkId);
          });
          if (found) {
            targetItem = itId;
            targetOpt = found.id;
            break;
          }
        }
      }
    }
    
    // Se achou o item correspondente, aplica direto!
    if (targetItem && store[targetItem]) {
      let opt = null;
      if (targetOpt) {
        opt = store[targetItem].opcoes.find(o => o.id === targetOpt);
      }
      if (!opt && store[targetItem].opcoes.length > 0) {
        opt = store[targetItem].opcoes[0];
      }
      
      if (opt) {
        if (data.url) opt.link = data.url;
        if (data.preco != null && data.preco !== '') opt.preco = data.preco;
        if (data.variacao) opt.variacao = data.variacao;
        if (data.foto) opt.foto = data.foto;
        if (data.loja) opt.loja = data.loja;
        salvarStore();
        renderItens();
        atualizarKPIs();
        itemEsperandoCaptura = null;
        
        // Destaca visualmente o card com um brilho verde e rola até ele
        setTimeout(() => {
          const cardEl = document.getElementById('item-' + targetItem);
          if (cardEl) {
            cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            cardEl.style.transition = 'all 0.5s ease';
            cardEl.style.borderColor = '#16a34a';
            cardEl.style.boxShadow = '0 0 0 5px rgba(22, 163, 74, 0.4)';
            setTimeout(() => {
              cardEl.style.borderColor = '';
              cardEl.style.boxShadow = '';
            }, 4000);
          }
        }, 100);
        
        mostrarToast(`🎉 Sucesso! SKU '${data.variacao || 'Variação'}' (R$ ${data.preco}) aplicado no item ${targetItem}!`);
        return;
      }
    }
    
    // Notificação genérica
    mostrarToast(`📥 SKU recebido: ${data.variacao || 'Opção'} (R$ ${data.preco})`);
  } catch (e) {
    // Servidor offline ou silencioso
  }
}"""

html = re.sub(
    r'async function checarUltimaEscolhaServidor\(\)[\s\S]*?mostrarToast\(`📥 Novo SKU recebido do Brave:[^`]*`\);\s*\}\s*catch\s*\(e\)\s*\{\s*\}\s*\}',
    lambda m: new_checar,
    html
)

with open(HTML_FILE, "w", encoding="utf-8") as f:
    f.write(html)

print("lista_compras_interativa.html updated successfully!")
