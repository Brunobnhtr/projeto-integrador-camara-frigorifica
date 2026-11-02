import json
import re
from pathlib import Path

DADOS_FILE = Path("compras_projeto/dados.json").resolve()
HTML_FILE = Path("lista_compras_interativa.html").resolve()

# 1. Update dados.json
with open(DADOS_FILE, "r", encoding="utf-8") as f:
    dados = json.load(f)

for it in dados.get("itens", []):
    if it.get("id") == "ELE-04":
        it["item"] = "Placa ilhada 7 × 9 cm (90 × 70 mm) pronta — 2 unidades"
        it["qtd"] = "2 placas (ou kit com 5)"
        it["espec"] = "Duas placas ilhadas comerciais padrão 7 × 9 cm (90 × 70 mm) prontas de fábrica, sem necessidade de corte. Cada placa recebe 4 canais de LED + resistor de 1 kΩ + bornes KF301."
        it["conferir"] = "Comprar a variação '7x9' (ou '7*9 cm'). Não precisa cortar nada! Passo padrão 2,54 mm com furos M3 prontos nos 4 cantos."
        it["busca_ml"] = "placa ilhada 7x9 cm prototipo"
        it["busca_ali"] = "7x9 perfboard prototype PCB 70x90mm"
        if it.get("opcoes"):
            it["opcoes"][0]["obs"] = "Selecionar a variação '7x9' (ou '7*9 cm'). Vem pronta de fábrica com furos M3 nos cantos, sem necessidade de corte."

with open(DADOS_FILE, "w", encoding="utf-8") as f:
    json.dump(dados, f, indent=2, ensure_ascii=False)

print("dados.json updated!")

# 2. Update lista_compras_interativa.html (const ITENS)
with open(HTML_FILE, "r", encoding="utf-8") as f:
    html = f.read()

# Replace in const ITENS
html = html.replace(
    '"item": "Placa ilhada 10 × 15 cm — corta em 2 de 95 × 75 mm"',
    '"item": "Placa ilhada 7 × 9 cm (90 × 70 mm) pronta — 2 unidades"'
)
html = html.replace(
    'Placa ilhada 10 × 15 cm — corta em 2 de 95 × 75 mm',
    'Placa ilhada 7 × 9 cm (90 × 70 mm) pronta — 2 unidades'
)
html = html.replace(
    'Uma placa de 10 × 15 cm é cortada em duas de 95 × 75 mm, que são as 2 placas PL-1 do projeto (8 canais). 150 / 75 = 2 e sobram 5 mm de refilo no lado de 100 mm.',
    'Duas placas ilhadas comerciais padrão 7 × 9 cm (90 × 70 mm) prontas de fábrica, sem necessidade de corte. Cada placa recebe 4 canais de LED + resistor de 1 kΩ + bornes KF301.'
)
html = html.replace(
    'Face simples, passo 2,54 mm. Desenho 1:1 em placa_leds/ (SVG e DXF). Alternativa: PCB sob medida 95×75, 5 peças.',
    'Comprar a variação \'7x9\' (ou \'7*9 cm\'). Não precisa cortar nada! Passo padrão 2,54 mm com furos M3 prontos nos 4 cantos.'
)

with open(HTML_FILE, "w", encoding="utf-8") as f:
    f.write(html)

print("lista_compras_interativa.html updated!")

