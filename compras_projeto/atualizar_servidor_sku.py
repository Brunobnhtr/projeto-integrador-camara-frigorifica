from pathlib import Path

SERVER_PATH = Path("compras_projeto/servidor_compras.py")
content = SERVER_PATH.read_text(encoding="utf-8")

old_code = """        if parsed.path == "/api/receber_sku":
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            try:
                data = json.loads(body.decode('utf-8'))
                preco = extrair_preco(str(data.get('preco', '')))
                data['preco'] = preco
                data['loja'] = "ALI" if "aliexpress" in data.get('url', '') else "ML" if "mercadolivre" in data.get('url', '') else "OUTRO"
                data['timestamp'] = time.time()
                ULTIMA_ESCOLHA_RECEBIDA = data
                print(f"?? SKU recebido do Brave: {data.get('variacao', '')} | Preo: R$ {data.get('preco', '')} | Foto: {'Sim' if data.get('foto') else 'No'}")"""

new_code = """        if parsed.path == "/api/receber_sku":
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
                print(f"📥 SKU recebido do Brave: '{variacao}' | R$ {preco} | Foto: {foto[:50]}...")"""

if old_code in content:
    content = content.replace(old_code, new_code)
    SERVER_PATH.write_text(content, encoding="utf-8")
    print("servidor_compras.py atualizado com sucesso!")
else:
    print("Aviso: Trecho não encontrado exatamente.")

