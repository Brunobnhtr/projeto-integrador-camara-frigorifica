"""Varredura Completa de Melhores Ofertas do AliExpress para o Projeto Integrador.

Executa buscas para todos os componentes do projeto, seleciona a melhor oferta
com base em custo total (preço + frete), volume de vendas e reputação,
atualiza o dados.json, sincroniza o lista_compras_interativa.html e gera
o relatório executivo em Markdown.
"""
from __future__ import annotations

import datetime as dt
import json
import re
import sys
import time
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
RELATORIO_MD = BASE_DIR / "RELATORIO_OFERTAS_ALIEXPRESS.md"

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36")


def extrair_preco(texto: str) -> float | None:
    if not texto:
        return None
    low = texto.lower()
    if any(ign in low for ign in ["parcela", "economi", "poupe", "off extra", "desconto", "cupom", "poupar"]):
        return None
    m = re.search(r'R\$\s*([\d\.\,]+)', texto)
    if m:
        val_str = m.group(1).replace('.', '').replace(',', '.')
        try:
            return float(val_str)
        except ValueError:
            return None
    return None


def estimar_min_price(item: dict) -> float:
    """Define piso inteligente de preço para evitar 'iscas' de R$ 1,00/parafusos."""
    item_lower = (item['item'] + " " + item.get('espec', '')).lower()
    if any(k in item_lower for k in ["fonte", "n4aic", "ndr-240", "240w", "aquisição"]):
        return 40.0
    if any(k in item_lower for k in ["mega", "display", "ihm", "es3c28p", "peltier", "driver", "bts7960", "ptc"]):
        return 15.0
    if any(k in item_lower for k in ["esp32", "relé", "rele", "hh64p", "disjuntor", "sensor", "am2315c"]):
        return 8.0
    if any(k in item_lower for k in ["cooler", "ventoinha", "rtc", "ds3231", "antena", "bloco fusível"]):
        return 5.0
    return 3.0


def main():
    print("=" * 70)
    print("🚀 INICIANDO VARREDURA COMPLETA DE OFERTAS NO ALIEXPRESS")
    print(f"Data: {dt.datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    print("=" * 70)

    if not DADOS_FILE.exists():
        print(f"❌ Arquivo {DADOS_FILE} não encontrado.")
        return

    with open(DADOS_FILE, "r", encoding="utf-8") as f:
        dados = json.load(f)

    itens = dados.get("itens", [])
    total_itens = len(itens)
    print(f"Total de itens cadastrados no projeto: {total_itens}\n")

    relatorio_linhas = []
    relatorio_linhas.append("# Relatório de Varredura de Preços e Ofertas no AliExpress")
    relatorio_linhas.append(f"**Data da Varredura:** {dt.datetime.now().strftime('%d/%m/%Y %H:%M')}")
    relatorio_linhas.append(f"**Projeto:** Câmara Térmica + Painel de Controle Integrador\n")
    relatorio_linhas.append("| ID | Componente | Menor Preço (R$) | Frete | Total (R$) | Avaliação / Vendas | Link da Oferta |")
    relatorio_linhas.append("| :--- | :--- | :---: | :---: | :---: | :--- | :--- |")

    atualizados_com_sucesso = 0
    t0 = time.time()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(user_agent=UA, locale="pt-BR")
        page = context.new_page()

        for idx, it in enumerate(itens, 1):
            item_id = it["id"]
            nome = it["item"]
            termo = it.get("busca_ali") or it.get("busca_ml") or nome
            min_p = estimar_min_price(it)

            print(f"[{idx:02d}/{total_itens}] {item_id:<7} Buscando: '{termo[:45]}' (min R$ {min_p:.0f})...", end="", flush=True)

            encoded = urllib.parse.quote(termo)
            url = f"https://pt.aliexpress.com/w/wholesale-{encoded}.html?sortType=price_asc"

            try:
                page.goto(url, timeout=30000, wait_until="domcontentloaded")
                page.wait_for_timeout(2300)
            except Exception as e:
                print(f" ❌ Erro de navegação: {e}")
                continue

            # Extração dos cards
            raw_cards = page.evaluate("""() => {
                const list = [];
                const links = Array.from(document.querySelectorAll('a[href*="/item/"]'));
                const seen = new Set();
                for (const a of links) {
                    let href = a.href.split('?')[0];
                    if (seen.has(href)) continue;
                    seen.add(href);
                    const img = a.querySelector('img');
                    const imgSrc = img ? (img.src || img.getAttribute('data-src') || '') : '';
                    list.push({ url: href, text: a.innerText || '', img: imgSrc });
                }
                return list;
            }""")

            ofertas = []
            for c in raw_cards:
                linhas = [l.strip() for l in c['text'].split('\n') if l.strip()]
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
                    if "frete grátis" in low or "frete gratis" in low or "envio grátis" in low:
                        frete_gratis = True
                    if "frete:" in low or "envio:" in low:
                        f_val = extrair_preco(l)
                        if f_val:
                            frete_val = f_val
                    if "vendido" in low:
                        vendas = l
                    if re.match(r'^\d(\.\d)?$', l):
                        avaliacao = l

                    p_val = extrair_preco(l)
                    if p_val and p_val >= min_p:
                        precos.append(p_val)

                if not precos:
                    continue

                preco_base = precos[0]
                total_custo = preco_base + (0.0 if frete_gratis else frete_val)

                ofertas.append({
                    "titulo": titulo,
                    "preco": preco_base,
                    "frete_gratis": frete_gratis,
                    "frete": frete_val,
                    "total": total_custo,
                    "vendas": vendas,
                    "avaliacao": avaliacao,
                    "link": c['url'],
                    "img": c['img']
                })

            if not ofertas:
                print(" ⚠️ Nenhuma oferta acima do piso.")
                continue

            # Ordena por custo total
            ofertas.sort(key=lambda x: x['total'])
            
            # Prioriza a que tem vendas confirmadas se a diferença for pequena
            melhor = ofertas[0]
            for o in ofertas[:3]:
                if "vendido" in o.get("vendas", "") and o["total"] <= ofertas[0]["total"] * 1.3:
                    melhor = o
                    break

            frete_desc = "Grátis" if melhor['frete_gratis'] else f"R$ {melhor['frete']:.2f}"
            stats = f"{melhor['vendas']} {melhor['avaliacao']}★".strip() or "Novo"
            print(f" -> R$ {melhor['preco']:.2f} ({frete_desc}) = R$ {melhor['total']:.2f} [{stats}]")

            # Salva no item em dados.json
            if "opcoes" not in it:
                it["opcoes"] = []

            # Verifica se já existe essa loja/link
            link_ja_existe = False
            for op in it["opcoes"]:
                if op.get("link") == melhor["link"]:
                    op["preco"] = round(melhor["preco"], 2)
                    op["frete"] = round(melhor["frete"], 2) if not melhor["frete_gratis"] else 0.0
                    link_ja_existe = True
                    break

            if not link_ja_existe:
                it["opcoes"].append({
                    "loja": "ALI",
                    "loja_nome": "AliExpress",
                    "link": melhor["link"],
                    "preco": round(melhor["preco"], 2),
                    "frete": round(melhor["frete"], 2) if not melhor["frete_gratis"] else 0.0,
                    "vendedor": f"AliExpress ({stats})",
                    "foto": melhor.get("img") or None,
                    "data": dt.date.today().isoformat(),
                    "obs": melhor["titulo"][:110]
                })

            if it.get("escolha") is None or it["escolha"] >= len(it["opcoes"]):
                it["escolha"] = len(it["opcoes"]) - 1

            atualizados_com_sucesso += 1

            # Adiciona ao relatório Markdown
            titulo_resumido = (melhor['titulo'][:38] + "..") if len(melhor['titulo']) > 40 else melhor['titulo']
            relatorio_linhas.append(
                f"| `{item_id}` | {nome[:32]} | R$ {melhor['preco']:.2f} | {frete_desc} | **R$ {melhor['total']:.2f}** | {stats} | [Abrir Anúncio]({melhor['link']}) |"
            )

        browser.close()

    tempo_total = time.time() - t0
    print("\n" + "=" * 70)
    print(f"✨ VARREDURA CONCLUÍDA EM {tempo_total:.1f}s ({tempo_total/60:.1f} min)")
    print(f"Itens atualizados com sucesso: {atualizados_com_sucesso}/{total_itens}")
    print("=" * 70)

    # 1. Salva dados.json
    with open(DADOS_FILE, "w", encoding="utf-8") as f:
        json.dump(dados, f, indent=2, ensure_ascii=False)
    print(f"💾 {DADOS_FILE.name} salvo com as novas opções!")

    # 2. Sincroniza lista_compras_interativa.html
    if HTML_INTERATIVO.exists():
        with open(HTML_INTERATIVO, "r", encoding="utf-8") as f:
            html = f.read()
        novo_json = json.dumps(dados["itens"], indent=2, ensure_ascii=False)
        padrao = r'(const ITENS = )\[.*?\];(\s*const SENAI_ITENS)'
        novo_html, count = re.subn(padrao, r'\1' + novo_json.replace('\\', '\\\\') + r';\2', html, flags=re.DOTALL)
        if count > 0:
            with open(HTML_INTERATIVO, "w", encoding="utf-8") as f:
                f.write(novo_html)
            print(f"🌐 {HTML_INTERATIVO.name} sincronizado com sucesso!")

    # 3. Salva RELATORIO_OFERTAS_ALIEXPRESS.md
    with open(RELATORIO_MD, "w", encoding="utf-8") as f:
        f.write("\n".join(relatorio_linhas))
    print(f"📄 Relatório gerado em: {RELATORIO_MD.name}")


if __name__ == "__main__":
    main()

