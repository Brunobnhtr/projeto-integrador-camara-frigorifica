import json
import os
import re
import urllib.request
from pathlib import Path

BASE_DIR = Path("compras_projeto").resolve()
HTML_FILE = Path("lista_compras_interativa.html").resolve()
SERVER_FILE = BASE_DIR / "servidor_compras.py"

print("1. Patching servidor_compras.py...")
with open(SERVER_FILE, "r", encoding="utf-8") as f:
    srv_code = f.read()

# Make sure ULTIMA_ESCOLHA_FILE is defined
if "ULTIMA_ESCOLHA_FILE" not in srv_code:
    srv_code = srv_code.replace(
        'DADOS_FILE = BASE_DIR / "dados.json"',
        'DADOS_FILE = BASE_DIR / "dados.json"\nULTIMA_ESCOLHA_FILE = BASE_DIR / "ultima_escolha.json"'
    )

# Add helper function to update dados.json and download photo
helper_fn = '''
def sincronizar_sku_com_dados(data: dict) -> tuple[str | None, str | None]:
    """Localiza o item correspondente em dados.json, atualiza os dados e baixa a foto."""
    if not DADOS_FILE.exists():
        return None, None
    try:
        with open(DADOS_FILE, "r", encoding="utf-8") as f:
            banco = json.load(f)
        
        target_url = data.get("url", "")
        # Extrai ID numérico do anúncio (AliExpress ou Mercado Livre)
        ali_match = re.search(r"/item/(\\d+)", target_url)
        ml_match = re.search(r"MLB-?(\\d+)", target_url, re.IGNORECASE)
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
'''

if "def sincronizar_sku_com_dados" not in srv_code:
    # Insere antes de ComprasRequestHandler
    srv_code = srv_code.replace("class ComprasRequestHandler", helper_fn + "\nclass ComprasRequestHandler")

# Update end_headers to include Private Network Access header
old_headers = """    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()"""

new_headers = """    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Request-Private-Network')
        self.send_header('Access-Control-Allow-Private-Network', 'true')
        super().end_headers()"""

srv_code = srv_code.replace(old_headers, new_headers)

# Update do_POST /api/receber_sku to call sincronizar_sku_com_dados and persist to ultima_escolha.json
old_do_post = """        # Endpoint para receber dados do Bookmarklet rodando no Brave pessoal
        if parsed.path == "/api/receber_sku":
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            try:
                data = json.loads(body.decode('utf-8'))
                preco = extrair_preco(str(data.get('preco', '')))
                data['preco'] = preco
                foto = str(data.get('foto', '')).replace(' .jpg', '.jpg').strip()
                data['foto'] = foto
                variacao = str(data.get('variacao', '')).strip()
                data['variacao'] = variacao
                data['loja'] = "ALI" if "aliexpress" in data.get('url', '') else "ML" if "mercadolivre" in data.get('url', '') else "OUTRO"
                data['timestamp'] = time.time()
                ULTIMA_ESCOLHA_RECEBIDA = data
                print(f"📥 SKU recebido do Brave: '{variacao}' | R$ {preco} | Foto: {foto[:50]}...")
                
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(b'{"status": "ok", "mensagem": "SKU recebido com sucesso no servidor!"}')
            except Exception as e:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"erro": str(e)}).encode('utf-8'))
            return"""

new_do_post = """        # Endpoint para receber dados do Bookmarklet rodando no Brave pessoal
        if parsed.path == "/api/receber_sku":
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            try:
                data = json.loads(body.decode('utf-8'))
                preco = extrair_preco(str(data.get('preco', '')))
                data['preco'] = preco
                foto = str(data.get('foto', '')).replace(' .jpg', '.jpg').strip()
                data['foto'] = foto
                variacao = str(data.get('variacao', '')).strip()
                data['variacao'] = variacao
                data['loja'] = "ALI" if "aliexpress" in data.get('url', '') else "ML" if "mercadolivre" in data.get('url', '') else "OUTRO"
                data['timestamp'] = time.time()
                
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
                
                print(f"📥 SKU recebido do Brave: '{variacao}' | R$ {preco} | Item: {item_id or 'Auto'} | Foto: {foto[:50]}...")
                
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
            return"""

srv_code = srv_code.replace(old_do_post, new_do_post)

# Also in do_GET /api/ultima_escolha, load from disk if memory is empty
old_get_escolha = """        # 3. Consulta última escolha enviada via Bookmarklet
        if parsed.path == "/api/ultima_escolha":
            global ULTIMA_ESCOLHA_RECEBIDA
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps(ULTIMA_ESCOLHA_RECEBIDA, ensure_ascii=False).encode('utf-8'))
            return"""

new_get_escolha = """        # 3. Consulta última escolha enviada via Bookmarklet
        if parsed.path == "/api/ultima_escolha":
            global ULTIMA_ESCOLHA_RECEBIDA
            if not ULTIMA_ESCOLHA_RECEBIDA and ULTIMA_ESCOLHA_FILE.exists():
                try:
                    with open(ULTIMA_ESCOLHA_FILE, "r", encoding="utf-8") as uf:
                        ULTIMA_ESCOLHA_RECEBIDA = json.load(uf)
                except Exception:
                    pass
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps(ULTIMA_ESCOLHA_RECEBIDA, ensure_ascii=False).encode('utf-8'))
            return"""

srv_code = srv_code.replace(old_get_escolha, new_get_escolha)

with open(SERVER_FILE, "w", encoding="utf-8") as f:
    f.write(srv_code)

print("servidor_compras.py updated successfully!")

