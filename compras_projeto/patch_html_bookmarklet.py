from pathlib import Path
import re

HTML_PATH = Path("lista_compras_interativa.html")
content = HTML_PATH.read_text(encoding="utf-8")

bookmarklet_js = (
    "javascript:(function(){"
    "const u=window.location.href;"
    "let variacao='';"
    "const selTitleEl=document.querySelector('[class*=%22sku-item--title%22],[class*=%22sku-title%22],[class*=%22property-title%22],[class*=%22sku-property--title%22]');"
    "if(selTitleEl&&selTitleEl.innerText){variacao=selTitleEl.innerText.replace(/^(cor|color|tamanho|size):\\s*/i,'').replace(/Ver mais.*/is,'').replace(/\\n/g,' ').trim();}"
    "if(!variacao){const selSkuEl=document.querySelector('[class*=%22sku-item--selected%22],[class*=%22sku-property-item--selected%22],[class*=%22slider--active%22],.ui-pdp-variations__selected-text');if(selSkuEl)variacao=selSkuEl.innerText.replace(/^(cor|color):\\s*/i,'').replace(/\\n/g,' ').trim();}"
    "const pEl=document.querySelector('[class*=%22price-default--current%22],[class*=%22price--current%22],[class*=%22product-price-current%22],.product-price-value,.ui-pdp-price__second-line .andes-money-amount__fraction,.andes-money-amount__fraction');"
    "const centsEl=document.querySelector('.andes-money-amount__cents,.ui-pdp-price__second-line .andes-money-amount__cents');"
    "let preco=pEl?pEl.innerText.trim():'';"
    "if(centsEl&&!preco.includes(','))preco+=','+centsEl.innerText.trim();"
    "let foto='';"
    "const skuImg=document.querySelector('[class*=%22active%22] img[src*=%22kf/%22],[class*=%22selected%22] img[src*=%22kf/%22],[aria-checked=%22true%22] img,[class*=%22sku-item--selected%22] img,[class*=%22slider--active%22] img,.ui-pdp-variations [aria-selected=%22true%22] img');"
    "if(skuImg&&skuImg.src){foto=skuImg.src.replace(/_\\d+x\\d+[^.]*\\./,'_960x960q75.').replace(/\\.jpg_\\d+x\\d+.*$/,' .jpg');}"
    "if(!foto){const mainImg=document.querySelector('img[class*=%22magnifier--image%22],.gallery-preview-panel img,.ui-pdp-gallery__figure img,.product-img img');if(mainImg&&mainImg.src)foto=mainImg.src;}"
    "foto=foto.replace(/\\s+\\.jpg/,'.jpg').trim();"
    "fetch('http://localhost:8000/api/receber_sku',{"
    "method:'POST',headers:{'Content-Type':'application/json'},"
    "body:JSON.stringify({url:u,variacao:variacao,preco:preco,foto:foto,timestamp:Date.now()})"
    "}).then(r=>r.json()).then(d=>{"
    "alert('🎉 SKU CAPTURADO COM SUCESSO!\\n\\n• Variação: '+(variacao||'Identificada')+'\\n• Valor: R$ '+preco+'\\n• Foto em Alta Resolução capturada!\\n\\nVolte na aba da Lista de Compras para ver o card atualizado!');"
    "}).catch(e=>alert('⚠️ Servidor local na porta 8000 não respondeu. Certifique-se de que o servidor está rodando!'));"
    "})();"
)

# Substituição exata de substring
target_prefix = '<a href="javascript:(function(){'
target_suffix = 'class="btn"'
start_pos = content.find(target_prefix)
if start_pos != -1:
    end_pos = content.find(target_suffix, start_pos)
    if end_pos != -1:
        content = content[:start_pos] + f'<a href="{bookmarklet_js}" ' + content[end_pos:]
        print("Bookmarklet JS atualizado com sucesso!")

# Atualiza a foto do CAM-01 no store se necessário
cam01_foto = "https://ae-pic-a1.aliexpress-media.com/kf/Sb9de6a83c7c046029fde8d9508e84166P.jpg"
pos_cam01 = content.find('"id": "CAM-01"')
if pos_cam01 != -1:
    pos_foto = content.find('"foto":', pos_cam01)
    if pos_foto != -1:
        end_quote = content.find('\n', pos_foto)
        content = content[:pos_foto] + f'"foto": "{cam01_foto}",' + content[end_quote+1:]
        print("Foto oficial do CAM-01 atualizada no banco ITENS!")

HTML_PATH.write_text(content, encoding="utf-8")
print("Tudo concluído com sucesso!")
