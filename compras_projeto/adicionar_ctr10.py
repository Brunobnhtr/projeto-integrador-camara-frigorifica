import json
import re
from pathlib import Path

DADOS_FILE = Path("compras_projeto/dados.json").resolve()
HTML_FILE = Path("lista_compras_interativa.html").resolve()

novo_item = {
  "id": "CTR-10",
  "bloco": "4 · Controle e interface",
  "item": "Barra de pinos fêmea 1×40 vias 2,54 mm (soquete do RTC e Level Shifter)",
  "qtd": "1 barra (ou kit com 5)",
  "espec": "Barra de pinos fêmea passo padrão 2,54 mm destacável. Utilizada como soquete na placa de interface para encaixar o módulo RTC DS3231 e o Conversor Bidirecional, permitindo manutenção rápida sem solda direta.",
  "conferir": "Passo padrão 2,54 mm (padrão Arduino/módulos), conector fêmea simples (1 fileira x 40 pinos). Pode ser cortada com alicate na quantidade exata de vias.",
  "busca_ml": "barra de pinos femea 1x40 2.54mm",
  "busca_ali": "female pin header strip 1x40 2.54mm straight single row",
  "opcoes": [
    {
      "loja": "ALI",
      "loja_nome": "AliExpress",
      "link": "https://pt.aliexpress.com/w/wholesale-female-pin-header-1x40-2.54mm.html",
      "preco": 3.80,
      "frete": 0.0,
      "variacao": "1x40P Fêmea (1 fileira, reta)",
      "vendedor": "AliExpress Componentes",
      "foto": "",
      "data": "2026-11-01",
      "obs": "Barra de pinos fêmea reta 2.54mm simples 1x40 pinos para Arduino e soquetes PCB"
    }
  ],
  "escolha": 0,
  "critico": False
}

# 1. Inserir em dados.json se ainda não existir
with open(DADOS_FILE, "r", encoding="utf-8") as f:
    dados = json.load(f)

existente = any(it.get("id") == "CTR-10" for it in dados.get("itens", []))
if not existente:
    # Insere logo após CTR-09
    idx_ctr09 = -1
    for idx, it in enumerate(dados.get("itens", [])):
        if it.get("id") == "CTR-09":
            idx_ctr09 = idx
            break
    if idx_ctr09 >= 0:
        dados["itens"].insert(idx_ctr09 + 1, novo_item)
    else:
        dados["itens"].append(novo_item)
        
    with open(DADOS_FILE, "w", encoding="utf-8") as f:
        json.dump(dados, f, indent=2, ensure_ascii=False)
    print("CTR-10 inserido em dados.json com sucesso!")
else:
    print("CTR-10 já existia em dados.json.")

# 2. Inserir em lista_compras_interativa.html
with open(HTML_FILE, "r", encoding="utf-8") as f:
    html = f.read()

if '"id": "CTR-10"' not in html:
    novo_json_str = ",\n  " + json.dumps(novo_item, indent=4, ensure_ascii=False)
    # Procura o final do objeto CTR-09
    match = re.search(r'("id":\s*"CTR-09"[\s\S]*?\n  \},)', html)
    if match:
        target = match.group(1)
        replacement = target + novo_json_str
        html = html.replace(target, replacement, 1)
        with open(HTML_FILE, "w", encoding="utf-8") as f:
            f.write(html)
        print("CTR-10 inserido em lista_compras_interativa.html com sucesso!")
    else:
        print("Aviso: Não encontrou bloco CTR-09 no HTML.")
else:
    print("CTR-10 já existia no HTML.")

