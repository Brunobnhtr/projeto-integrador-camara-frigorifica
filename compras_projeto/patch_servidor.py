from pathlib import Path
SERVER_PATH = Path("compras_projeto/servidor_compras.py")
text = SERVER_PATH.read_text(encoding="utf-8")

needle = 'parsed.path == "/api/receber_sku":'
idx = text.find(needle)
if idx != -1:
    end_try = text.find('return', idx)
    target = text[idx:end_try+6]
    
    replacement = """parsed.path == "/api/receber_sku":
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
            
    text = text[:idx] + replacement + text[end_try+6:]
    SERVER_PATH.write_text(text, encoding="utf-8")
    print("Atualizado com sucesso!")
else:
    print("Não encontrado!")

