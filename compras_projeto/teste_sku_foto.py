from pathlib import Path
from playwright.sync_api import sync_playwright

clean_profile = Path.home() / '.compras_chrome_perfil'

with sync_playwright() as p:
    ctx = p.chromium.launch_persistent_context(
        user_data_dir=str(clean_profile),
        channel='chrome',
        headless=True,
        ignore_default_args=['--enable-automation'],
        args=['--disable-blink-features=AutomationControlled'],
        locale='pt-BR'
    )
    page = ctx.pages[0] if ctx.pages else ctx.new_page()
    page.goto('https://pt.aliexpress.com/item/1005012812450659.html', wait_until='domcontentloaded')
    page.wait_for_timeout(3000)

    # Inspeciona os elementos
    res = page.evaluate("""() => {
        const skuBtns = Array.from(document.querySelectorAll('[class*="sku-item"], [class*="sku-property-item"]'));
        const initialMainImg = document.querySelector('img[class*="magnifier--image"], .gallery-preview-panel img, .product-img img')?.src;
        
        let clickedSkuImg = null;
        let clickedText = null;
        if (skuBtns.length > 5) {
            skuBtns[5].click();
            clickedSkuImg = skuBtns[5].querySelector('img')?.src;
            clickedText = skuBtns[5].innerText;
        }
        
        return {
            totalSku: skuBtns.length,
            initialMainImg: initialMainImg,
            clickedSkuImg: clickedSkuImg,
            clickedText: clickedText
        };
    }""")
    print('Initial res:', res)
    page.wait_for_timeout(2000)
    
    after = page.evaluate("""() => {
        const selSku = document.querySelector('[class*="sku-item--selected"], [class*="sku-property-item--selected"], [class*="sku-item"][class*="selected"], [class*="selected"]');
        const selSkuImg = selSku ? selSku.querySelector('img')?.src : null;
        const mainImg = document.querySelector('img[class*="magnifier--image"], .gallery-preview-panel img, .product-img img, .image-view--previewBox img')?.src;
        const selText = selSku ? selSku.innerText.trim() : null;
        
        // Also check if any sku image URL can be un-thumbnailed (removed _50x50 or _100x100)
        let unthumbnailed = selSkuImg;
        if (unthumbnailed) {
            unthumbnailed = unthumbnailed.replace(/_\\d+x\\d+[^.]*\\./, '_480x480.').replace(/\\.jpg_\\d+x\\d+.*$/, '.jpg');
        }

        return {
            selSkuImg: selSkuImg,
            unthumbnailed: unthumbnailed,
            mainImg: mainImg,
            selText: selText
        };
    }""")
    print('After click:', after)
    ctx.close()

