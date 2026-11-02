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
        viewport={'width': 1400, 'height': 900},
        locale='pt-BR'
    )
    page = ctx.pages[0] if ctx.pages else ctx.new_page()
    page.goto('https://pt.aliexpress.com/item/1005012812450659.html', wait_until='domcontentloaded')
    page.wait_for_timeout(4000)

    res = page.evaluate("""() => {
        const buttons = Array.from(document.querySelectorAll('[role="radio"], [class*="sku"], [class*="property--item"], [class*="item--"]'));
        return buttons.map(b => ({
            tag: b.tagName,
            cls: b.className,
            text: b.innerText,
            img: b.querySelector('img')?.src
        })).filter(x => x.img || x.text).slice(0, 30);
    }""")
    print('Buttons count:', len(res))
    for r in res[:10]:
        print(r)
    ctx.close()

