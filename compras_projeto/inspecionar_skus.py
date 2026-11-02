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
    page.wait_for_timeout(4000)

    data = page.evaluate("""() => {
        // Find text containing "cor:" or "color:"
        const allTextEls = Array.from(document.querySelectorAll('div, span, p'));
        const corEls = allTextEls.filter(e => e.innerText && e.innerText.trim().toLowerCase().startsWith('cor:') && e.children.length === 0);
        
        // Find all clickable image tiles or options
        const allImgs = Array.from(document.querySelectorAll('img'));
        const smallImgs = allImgs
            .filter(i => i.src && (i.src.includes('kf/') || i.src.includes('aliexpress-media.com')) && (i.width < 120 || i.className.includes('sku') || i.parentElement?.className.includes('sku') || i.parentElement?.className.includes('item')))
            .map(i => ({
                src: i.src,
                alt: i.alt,
                w: i.width,
                h: i.height,
                parentTag: i.parentElement?.tagName,
                parentClass: i.parentElement?.className,
                grandParentClass: i.parentElement?.parentElement?.className
            }));

        return {
            corText: corEls.map(e => e.innerText),
            smallImgsCount: smallImgs.length,
            smallImgsSample: smallImgs.slice(0, 10)
        };
    }""")
    print('Data:', data)
    ctx.close()

