"""Buscador e Scraper de Melhores Ofertas do AliExpress via Playwright.

Permite buscar componentes individuais ou em lote para o Projeto Integrador,
extraindo preços reais em BRL, frete, avaliações e gerando links diretos.
Pode salvar as opções encontradas diretamente em dados.json e sincronizar
a Lista de Compras Interativa.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import re
import sys
import urllib.parse
from pathlib import Path
from playwright.sync_api import sync_playwright

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

BASE_DIR = Path(__file__).resolve().parent
DADOS_FILE = BASE_DIR / "dados.json"
HTML_INTERATIVO = BASE_DIR.parent / "lista_compras_interativa.html"
HTML_CATALOGO = BASE_DIR / "catalogo_compras.html"

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36")


def extrair_preco(texto: str) -> float | None:
    if not texto:
        return None
    # Ignora linhas de parcelas, economia ou cupons
    low = texto.lower()
    if any(ign in low for ign in ["parcela", "economi", "poupe", "off extra", "desconto", "cupom"]):
        return None

    # Procura padrões como R$ 12,87 ou R$12.87
    m = re.search(r'R\$\s*([\d\.\,]+)', texto)
    if m:
        val_str = m.group(1).replace('.', '').replace(',', '.')
        try:
            return float(val_str)
        except ValueError:
            return None
    return None


def buscar_aliexpress(termo: str, min_price: float = 6.0, limite: int = 5) -> list[dict]:
    termo_limpo = termo.strip()
    encoded = urllib.parse.quote(termo_limpo)
    url = f"https://pt.aliexpress.com/w/wholesale-{encoded}.html?sortType=price_asc"

    print(f"\n🔍 Buscando no AliExpress: '{termo_limpo}'...")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent=UA,
            locale="pt-BR"
        )
        page = context.new_page()
        try:
            page.goto(url, timeout=35000, wait_until="domcontentloaded")
            page.wait_for_timeout(3500)
        except Exception as e:
            print(f"❌ Erro ao acessar URL: {e}")
            browser.close()
            return []

        raw_items = page.evaluate("""() => {
            const list = [];
            const links = Array.from(document.querySelectorAll('a[href*="/item/"]'));
            const seen = new Set();
            for (const a of links) {
                let href = a.href.split('?')[0];
                if (seen.has(href)) continue;
                seen.add(href);
                
                const img = a.querySelector('img');
                const imgSrc = img ? (img.src || img.getAttribute('data-src') || '') : '';
                
                list.push({
                    url: href,
                    text: a.innerText || '',
                    img: imgSrc
                });
            }
            return list;
        }""")

        browser.close()

    ofertas = []
    for item in raw_items:
        linhas = [l.strip() for l in item['text'].split('\n') if l.strip()]
        if not linhas:
            continue

        titulo = max(linhas[:4], key=len) if len(linhas) >= 4 else linhas[0]

        precos = []
        frete_gratis = False
        frete_val = 0.0
        vendas = ""
        avaliacao = ""

        for l in linhas:
            low = l.lower()
            if "frete grátis" in low or "frete gratis" in low:
                frete_gratis = True
            if "frete:" in low or "envio:" in low:
                f = extrair_preco(l)
                if f:
                    frete_val = f
            if "vendido" in low:
                vendas = l
            if re.match(r'^\d\.\d$', l):
                avaliacao = l

            p_val = extrair_preco(l)
            if p_val and p_val >= min_price:
                precos.append(p_val)

        if not precos:
            continue

        # O primeiro preço válido pós-filtragem é o preço de vitrine à vista
        preco = precos[0]
        total = preco + (0.0 if frete_gratis else frete_val)

        ofertas.append({
            "titulo": titulo,
            "preco": preco,
            "frete_gratis": frete_gratis,
            "frete": frete_val,
            "total": total,
            "vendas": vendas,
            "avaliacao": avaliacao,
            "link": item['url'],
            "img": item['img']
        })

    ofertas.sort(key=lambda x: x['total'])
    return ofertas[:limite]


def exibir_ofertas(ofertas: list[dict], termo: str) -> None:
    if not ofertas:
        print(f"⚠️ Nenhuma oferta válida encontrada para '{termo}'.")
        return

    print(f"\n=======================================================")
    print(f"🏆 TOP {len(ofertas)} MELHORES OFERTAS NO ALIEXPRESS")
    print(f"=======================================================")
    for idx, o in enumerate(ofertas, 1):
        frete_str = "🟢 Frete Grátis" if o['frete_gratis'] else f"Frete: R$ {o['frete']:.2f}"
        extra_str = f" | {o['vendas']}" if o['vendas'] else ""
        if o['avaliacao']:
            extra_str += f" | ★ {o['avaliacao']}"

        print(f"\n[{idx}] R$ {o['preco']:.2f} ({frete_str}) -> TOTAL: R$ {o['total']:.2f}{extra_str}")
        print(f"    Título: {o['titulo']}")
        print(f"    Link:   {o['link']}")


def salvar_em_dados(item_id: str, oferta: dict) -> bool:
    if not DADOS_FILE.exists():
        print(f"❌ Arquivo {DADOS_FILE} não encontrado.")
        return False

    with open(DADOS_FILE, "r", encoding="utf-8") as f:
        dados = json.load(f)

    alvo = None
    for it in dados.get("itens", []):
        if it["id"].upper() == item_id.upper():
            alvo = it
            break

    if not alvo:
        print(f"❌ Item com ID '{item_id}' não encontrado em dados.json.")
        return False

    if "opcoes" not in alvo:
        alvo["opcoes"] = []

    link_existente = False
    for op in alvo["opcoes"]:
        if op.get("link") == oferta["link"]:
            op["preco"] = round(oferta["preco"], 2)
            op["frete"] = round(oferta["frete"], 2) if not oferta["frete_gratis"] else 0.0
            link_existente = True
            break

    if not link_existente:
        vend_str = "AliExpress"
        if oferta.get("vendas") or oferta.get("avaliacao"):
            vend_str += f" ({oferta.get('vendas', '')} {oferta.get('avaliacao', '')}★)".strip()

        nova_opcao = {
            "loja": "ALI",
            "loja_nome": "AliExpress",
            "link": oferta["link"],
            "preco": round(oferta["preco"], 2),
            "frete": round(oferta["frete"], 2) if not oferta["frete_gratis"] else 0.0,
            "vendedor": vend_str,
            "foto": oferta.get("img") or None,
            "data": dt.date.today().isoformat(),
            "obs": oferta["titulo"][:120]
        }
        alvo["opcoes"].append(nova_opcao)

    if alvo.get("escolha") is None or alvo["escolha"] >= len(alvo["opcoes"]):
        alvo["escolha"] = len(alvo["opcoes"]) - 1

    with open(DADOS_FILE, "w", encoding="utf-8") as f:
        json.dump(dados, f, indent=2, ensure_ascii=False)

    print(f"✅ Opção gravada com sucesso no item {item_id} (Preço: R$ {oferta['preco']:.2f})!")
    return True


def sincronizar_html_interativo() -> None:
    if not DADOS_FILE.exists() or not HTML_INTERATIVO.exists():
        return

    with open(DADOS_FILE, "r", encoding="utf-8") as f:
        dados = json.load(f)

    with open(HTML_INTERATIVO, "r", encoding="utf-8") as f:
        html = f.read()

    novo_json = json.dumps(dados["itens"], indent=2, ensure_ascii=False)
    padrao = r'(const ITENS = )\[.*?\];(\s*const SENAI_ITENS)'
    novo_html, count = re.subn(padrao, r'\1' + novo_json.replace('\\', '\\\\') + r';\2', html, flags=re.DOTALL)

    if count > 0:
        with open(HTML_INTERATIVO, "w", encoding="utf-8") as f:
            f.write(novo_html)
        print("✅ lista_compras_interativa.html sincronizado com novos preços!")
    else:
        print("⚠️ Não foi possível sincronizar automaticamente lista_compras_interativa.html.")


def main():
    parser = argparse.ArgumentParser(description="Buscador de Ofertas AliExpress do Projeto")
    parser.add_argument("--busca", help="Termo de busca livre (ex: 'rele hh64p 24vdc ptf14a')")
    parser.add_argument("--id", help="ID do item em dados.json (ex: CAM-01, CMD-01)")
    parser.add_argument("--min-price", type=float, default=6.0, help="Preço mínimo para filtrar acessórios e iscas (default: 6.0)")
    parser.add_argument("--limite", type=int, default=5, help="Quantidade de ofertas a exibir (default: 5)")
    parser.add_argument("--adicionar", action="store_true", help="Salva a melhor oferta encontrada no item em dados.json")
    parser.add_argument("--criticos", action="store_true", help="Busca automaticamente ofertas para todos os itens críticos pendentes")
    parser.add_argument("--sync", action="store_true", help="Sincroniza dados.json com lista_compras_interativa.html")

    args = parser.parse_args()

    if args.sync:
        sincronizar_html_interativo()
        return

    if args.id:
        if not DADOS_FILE.exists():
            print(f"❌ Arquivo {DADOS_FILE} não existe.")
            return

        with open(DADOS_FILE, "r", encoding="utf-8") as f:
            dados = json.load(f)

        item = next((x for x in dados.get("itens", []) if x["id"].upper() == args.id.upper()), None)
        if not item:
            print(f"❌ Item {args.id} não encontrado.")
            return

        termo = item.get("busca_ali") or item.get("busca_ml") or item["item"]
        print(f"📦 Item [{item['id']}]: {item['item']}")
        ofertas = buscar_aliexpress(termo, min_price=args.min_price, limite=args.limite)
        exibir_ofertas(ofertas, termo)

        if args.adicionar and ofertas:
            escolha = ofertas[0]
            for o in ofertas:
                if "vendido" in o.get("vendas", "") and o["total"] <= ofertas[0]["total"] * 1.5:
                    escolha = o
                    break
            salvar_em_dados(item["id"], escolha)
            sincronizar_html_interativo()
        return

    if args.busca:
        ofertas = buscar_aliexpress(args.busca, min_price=args.min_price, limite=args.limite)
        exibir_ofertas(ofertas, args.busca)
        return

    if args.criticos:
        if not DADOS_FILE.exists():
            print(f"❌ Arquivo {DADOS_FILE} não existe.")
            return

        with open(DADOS_FILE, "r", encoding="utf-8") as f:
            dados = json.load(f)

        criticos = [x for x in dados.get("itens", []) if x.get("critico") and not x.get("opcoes")]
        print(f"🚀 Buscando ofertas para {len(criticos)} itens críticos pendentes...")

        for it in criticos:
            termo = it.get("busca_ali") or it.get("busca_ml") or it["item"]
            ofertas = buscar_aliexpress(termo, min_price=args.min_price, limite=3)
            exibir_ofertas(ofertas, termo)
            if args.adicionar and ofertas:
                salvar_em_dados(it["id"], ofertas[0])

        if args.adicionar:
            sincronizar_html_interativo()
        return

    parser.print_help()


if __name__ == "__main__":
    main()
