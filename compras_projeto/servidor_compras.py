"""Servidor local para a Lista de Compras Interativa com Suporte a Brave Browser.

Recursos:
1. Serve a interface web lista_compras_interativa.html em http://localhost:8000
2. Abre o BRAVE BROWSER oficial visível na tela para clicar no SKU e capturar a foto exata da variação!
3. Endpoint POST /api/receber_sku (Recebe SKUs enviados pelo Bookmarklet diretamente do seu Brave!)
4. Endpoint GET /api/ultima_escolha (Entrega para a Lista de Compras os dados capturados)
5. Endpoint GET /api/extrair?url=... (Auto-resgate em segundo plano)
"""
from __future__ import annotations

import json
import re
import sys
import time
import urllib.parse
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

# Garante saída UTF-8 no Windows
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from playwright.sync_api import sync_playwright

BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent
DADOS_FILE = BASE_DIR / "dados.json"
ULTIMA_ESCOLHA_FILE = BASE_DIR / "ultima_escolha.json"

BRAVE_EXE = Path(r"C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe")
CHROME_EXE = Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe")

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36")


def obter_navegador_executavel() -> tuple[str | None, str]:
    if BRAVE_EXE.exists():
        return str(BRAVE_EXE), "Brave Browser"
    if CHROME_EXE.exists():
        return str(CHROME_EXE), "Google Chrome"
    return None, "Chromium"


def criar_navegador(p, headless=False):
    """Inicia o Brave (ou Chrome) com flags anti-detecção e sem conflitos de perfil."""
    exe_path, nome = obter_navegador_executavel()
    print(f"🚀 Iniciando {nome} ({'headless' if headless else 'visível na tela'})...")
    
    args = [
        "--disable-blink-features=AutomationControlled",
        "--no-sandbox",
        "--disable-infobars"
    ]
    if not headless:
        args.extend([
            "--start-maximized",
            "--window-position=50,50"
        ])

    if exe_path:
        try:
            return p.chromium.launch(
                executable_path=exe_path,
                headless=headless,
                ignore_default_args=["--enable-automation"],
                args=args
            )
        except Exception as e:
            print(f"Aviso: Não foi possível abrir com {nome} ({e}). Usando Chromium padrão...")

    return p.chromium.launch(
        headless=headless,
        ignore_default_args=["--enable-automation"],
        args=args
    )


def extrair_preco(texto: str) -> float | None:
    if not texto:
        return None
    texto = str(texto).strip()
    low = texto.lower()
    if any(ign in low for ign in ["parcela", "economi", "poupe", "off extra", "desconto", "cupom", "poupar"]):
        return None
    m = re.search(r'(?:R\$\s*)?([\d]+[\.\,\d]*)', texto)
    if m:
        val_str = m.group(1).replace('.', '').replace(',', '.')
        try:
            return float(val_str)
        except ValueError:
            return None
    return None


EXTRATOR_JS = (BASE_DIR / "extrator_pagina.js").read_text(encoding="utf-8")


def loja_da_url(url: str) -> str:
    u = url.lower()
    if "aliexpress" in u:
        return "ALI"
    if "mercadolivre" in u or "mercadolibre" in u:
        return "ML"
    if "shopee" in u:
        return "SHOPEE"
    return "OUTRO"


def normalizar_captura(data: dict) -> dict:
    """Padroniza o que vier do extrator (bookmarklet, headless ou janela robô)."""
    preco = data.get("preco")
    if not isinstance(preco, (int, float)):
        preco = extrair_preco(str(preco or ""))
    frete = data.get("frete")
    if frete is not None and not isinstance(frete, (int, float)):
        frete = extrair_preco(str(frete))
    frete_gratis = data.get("freteGratis")
    if frete_gratis is True:
        frete = 0.0
    url = str(data.get("url", ""))
    return {
        "url": url,
        "loja": data.get("loja") if data.get("loja") not in (None, "", "OUTRO") else loja_da_url(url),
        "titulo": str(data.get("titulo", "")).strip(),
        "variacao": str(data.get("variacao", "")).strip(),
        "preco": round(preco, 2) if preco else None,
        "frete": round(frete, 2) if frete is not None else None,      # None = não informado na página
        "freteGratis": frete_gratis if isinstance(frete_gratis, bool) else None,
        "freteTexto": str(data.get("freteTexto", ""))[:160],
        "foto": str(data.get("foto", "")).replace(" .jpg", ".jpg").strip(),
        "timestamp": time.time(),
    }


def gerar_bookmarklet(porta: int = 8000) -> str:
    """Gera o favorito 'Capturar no Brave' a partir do mesmo extrator_pagina.js."""
    js = (
        "(function(){try{const d=(" + EXTRATOR_JS + ")();"
        f"fetch('http://localhost:{porta}/api/receber_sku',{{method:'POST',"
        "headers:{'Content-Type':'application/json'},body:JSON.stringify(d)})"
        ".then(r=>r.json()).then(r=>{const x=r.dados||d;"
        "const fr=x.freteGratis?'Grátis':(x.frete!=null?'R$ '+x.frete.toFixed(2):'NÃO ENCONTRADO (informe CEP / preencha à mão)');"
        "alert('✅ CAPTURADO'+(r.itemId?' → '+r.itemId:'')+'\\n\\n• Variação: '+(x.variacao||'—')"
        "+'\\n• Preço: '+(x.preco!=null?'R$ '+x.preco.toFixed(2):'não encontrado')+'\\n• Frete: '+fr"
        "+'\\n\\nVolte à aba da Lista de Compras.');})"
        ".catch(e=>alert('⚠️ Servidor local (porta " + str(porta) + ") não respondeu. Rode: python compras_projeto/servidor_compras.py'));"
        "}catch(e){alert('Erro no extrator: '+e.message);}})();"
    )
    # Remove comentários de linha do extrator (quebrariam o javascript: em uma linha só)
    js = re.sub(r"(?m)^\s*//.*$", "", js)
    return "javascript:" + urllib.parse.quote(js, safe="")


def extrair_headless(url: str) -> dict:
    """Extração rápida em segundo plano (pega a variação padrão do anúncio)."""
    with sync_playwright() as p:
        browser = criar_navegador(p, headless=True)
        try:
            page = browser.new_context(user_agent=UA, locale="pt-BR").new_page()
            page.goto(url, timeout=30000, wait_until="domcontentloaded")
            page.wait_for_timeout(3500)  # bloco de frete carrega depois do preço
            return normalizar_captura(page.evaluate(EXTRATOR_JS))
        except Exception as e:
            return {"url": url, "loja": loja_da_url(url), "erro": str(e)}
        finally:
            browser.close()


def abrir_seletor_ao_vivo(url: str) -> dict:
    """Janela visível: o usuário escolhe o SKU e clica em CONFIRMAR no banner injetado."""
    print(f"🌐 Abrindo navegador ao vivo para: {url}")
    with sync_playwright() as p:
        browser = criar_navegador(p, headless=False)
        page = browser.new_context(user_agent=UA, locale="pt-BR", no_viewport=True).new_page()
        try:
            page.goto(url, timeout=45000, wait_until="domcontentloaded")
            page.bring_to_front()
            page.wait_for_timeout(2000)
            page.evaluate("""() => {
                const b = document.createElement('div');
                b.style.cssText = 'position:fixed;top:0;left:0;width:100%;z-index:2147483647;background:#0f172a;color:#fff;' +
                  'padding:12px 24px;display:flex;align-items:center;justify-content:space-between;font:14px system-ui;box-shadow:0 4px 25px rgba(0,0,0,.6)';
                b.innerHTML = '<span><b style="color:#fb923c">SELETOR DE SKU</b> — escolha a variação e confira o frete; depois confirme:</span>' +
                  '<button id="pi-ok" style="background:#10b981;color:#fff;border:0;padding:10px 24px;border-radius:8px;font-weight:700;cursor:pointer">✅ CONFIRMAR</button>';
                document.body.appendChild(b);
                document.getElementById('pi-ok').onclick = () => {
                    b.remove();
                    window.__PI_CONFIRMADO__ = true;
                };
            }""")
            page.wait_for_function("() => window.__PI_CONFIRMADO__ === true", timeout=300000)
            escolha = normalizar_captura(page.evaluate(EXTRATOR_JS))
            time.sleep(1)
            return escolha
        except Exception as e:
            return {"erro": f"Janela fechada ou tempo esgotado: {e}"}
        finally:
            browser.close()


# Buffer em memória para SKUs recebidos via Bookmarklet
ULTIMA_ESCOLHA_RECEBIDA = {}



def sincronizar_sku_com_dados(data: dict) -> tuple[str | None, str | None]:
    """Localiza o item correspondente em dados.json, atualiza os dados e baixa a foto."""
    if not DADOS_FILE.exists():
        return None, None
    try:
        with open(DADOS_FILE, "r", encoding="utf-8") as f:
            banco = json.load(f)
        
        target_url = data.get("url", "")
        # Extrai ID numérico do anúncio (AliExpress ou Mercado Livre)
        ali_match = re.search(r"/item/(\d+)", target_url)
        ml_match = re.search(r"MLB-?(\d+)", target_url, re.IGNORECASE)
        match_id = ali_match.group(1) if ali_match else (ml_match.group(1) if ml_match else "")
        
        item_id = None
        opt_id = None
        
        for it in banco.get("itens", []):
            for idx, opt in enumerate(it.get("opcoes", [])):
                opt_link = opt.get("link", "")
                if match_id and match_id in opt_link:
                    item_id = it["id"]
                    opt_id = opt.get("id", f"opt_seed_{item_id}_{idx}")
                    # Atualiza os dados
                    if data.get("preco") is not None:
                        opt["preco"] = data["preco"]
                    if data.get("variacao"):
                        opt["variacao"] = data["variacao"]
                    if data.get("foto"):
                        opt["foto"] = data["foto"]
                    if data.get("frete") is not None:
                        opt["frete"] = data["frete"]
                        opt["frete_gratis"] = bool(data.get("freteGratis"))
                    opt["link"] = target_url
                    it["escolha"] = idx
                    break
            if item_id:
                break
        
        if item_id:
            # Baixa a foto em alta resolução localmente se for URL externa
            foto_url = data.get("foto", "")
            if foto_url.startswith("http"):
                try:
                    fotos_dir = BASE_DIR / "fotos"
                    fotos_dir.mkdir(parents=True, exist_ok=True)
                    foto_path = fotos_dir / f"{item_id}_capturado.jpg"
                    req = urllib.request.Request(foto_url, headers={"User-Agent": "Mozilla/5.0"})
                    with urllib.request.urlopen(req, timeout=10) as resp, open(foto_path, "wb") as out_f:
                        out_f.write(resp.read())
                    print(f"📸 Foto de alta resolução salva em: {foto_path.name}")
                    # Atualiza referência para a foto local
                    for it in banco.get("itens", []):
                        if it["id"] == item_id:
                            for opt in it.get("opcoes", []):
                                if opt.get("link") == target_url:
                                    opt["foto"] = f"compras_projeto/fotos/{foto_path.name}"
                except Exception as ex_foto:
                    print(f"⚠️ Aviso ao baixar foto local: {ex_foto}")
            
            with open(DADOS_FILE, "w", encoding="utf-8") as f:
                json.dump(banco, f, indent=2, ensure_ascii=False)
            print(f"💾 Item {item_id} sincronizado com sucesso em dados.json!")
            return item_id, opt_id
    except Exception as e:
        print(f"⚠️ Erro ao sincronizar dados.json: {e}")
    return None, None

class ComprasRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(PROJECT_DIR), **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Request-Private-Network')
        self.send_header('Access-Control-Allow-Private-Network', 'true')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_POST(self):
        global ULTIMA_ESCOLHA_RECEBIDA
        parsed = urllib.parse.urlparse(self.path)
        
        # Endpoint para receber dados do Bookmarklet rodando no Brave pessoal
        if parsed.path == "/api/receber_sku":
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            try:
                data = normalizar_captura(json.loads(body.decode('utf-8')))
                preco, variacao, foto = data['preco'], data['variacao'], data['foto']

                # Sincroniza diretamente com o banco de dados e baixa foto
                item_id, opt_id = sincronizar_sku_com_dados(data)
                if item_id:
                    data['itemId'] = item_id
                if opt_id:
                    data['optId'] = opt_id
                    
                ULTIMA_ESCOLHA_RECEBIDA = data
                
                # Salva em arquivo para persistência
                try:
                    with open(ULTIMA_ESCOLHA_FILE, "w", encoding="utf-8") as uf:
                        json.dump(data, uf, indent=2, ensure_ascii=False)
                except Exception:
                    pass
                
                print(f"📥 SKU recebido do Brave: '{variacao}' | R$ {preco} | frete {data['frete']} | Item: {item_id or 'Auto'} | Foto: {foto[:50]}...")
                
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                resp_payload = {"status": "ok", "mensagem": "SKU recebido e salvo!", "itemId": item_id, "optId": opt_id, "dados": data}
                self.wfile.write(json.dumps(resp_payload, ensure_ascii=False).encode('utf-8'))
            except Exception as e:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"erro": str(e)}).encode('utf-8'))
            return

        self.send_response(404)
        self.end_headers()

    def do_GET(self):
        global ULTIMA_ESCOLHA_RECEBIDA
        parsed = urllib.parse.urlparse(self.path)

        # 1. Seletor de SKU ao Vivo (Navegador com Banner Flutuante)
        if parsed.path == "/api/escolher_ao_vivo":
            query = urllib.parse.parse_qs(parsed.query)
            target_url = query.get("url", [""])[0]
            if not target_url:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(b'{"erro": "Parametro url e obrigatorio"}')
                return
                
            print(f"🎯 Iniciando Seletor ao Vivo para: {target_url}")
            res = abrir_seletor_ao_vivo(target_url)
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps(res, ensure_ascii=False).encode('utf-8'))
            return

        # 2. Extração Automática em Segundo Plano
        if parsed.path == "/api/extrair":
            query = urllib.parse.parse_qs(parsed.query)
            target_url = query.get("url", [""])[0]
            if not target_url:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(b'{"erro": "Parametro url e obrigatorio"}')
                return
                
            print(f"⚡ Recebida requisição de extração: {target_url}")
            info = extrair_headless(target_url)
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps(info, ensure_ascii=False).encode('utf-8'))
            return

        # Favorito sempre gerado a partir do extrator_pagina.js atual
        if parsed.path == "/api/bookmarklet":
            self.send_response(200)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.end_headers()
            self.wfile.write(gerar_bookmarklet(self.server.server_address[1]).encode("utf-8"))
            return

        # 3. Consulta última escolha enviada via Bookmarklet
        if parsed.path == "/api/ultima_escolha":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps(ULTIMA_ESCOLHA_RECEBIDA, ensure_ascii=False).encode('utf-8'))
            return
            
        super().do_GET()


def main():
    porta = 8000
    exe_path, nome = obter_navegador_executavel()
    print("=" * 65)
    print(f"🚀 SERVIDOR DE COMPRAS PRONTO NA PORTA {porta}")
    print(f"🌐 Acesse: http://localhost:{porta}/lista_compras_interativa.html")
    print(f"🦁 Navegador Padrão Detectado: {nome} ({exe_path})")
    print(f"📸 Captura Dinâmica de Foto por SKU Ativada")
    print(f"📥 Endpoint de Bookmarklet Ativo: POST /api/receber_sku")
    print("=" * 65)
    
    server = ThreadingHTTPServer(("0.0.0.0", porta), ComprasRequestHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor encerrado pelo usuário.")
        server.server_close()


if __name__ == "__main__":
    main()
