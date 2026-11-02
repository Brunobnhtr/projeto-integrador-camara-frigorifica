import sys
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('http://localhost:8000/lista_compras_interativa.html')
    page.wait_for_timeout(1000)
    
    first_btn = page.locator('a.btn:has-text("Abrir Anúncio")').first
    print('Blue button href:', first_btn.get_attribute('href'))
    print('Blue button text:', first_btn.inner_text())
    print('Blue button visible:', first_btn.is_visible())
    browser.close()
