#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gera a planilha de compras do Projeto Integrador a partir da BOM em markdown.

A lista de compras parte da BOM em Markdown e recebe uma conferencia cruzada
com os dados renderizados pelo React nas abas de inventario, fiacao e
divergencias.

Este script le as tabelas daquele documento, monta a lista principal e registra
as decisoes que ainda precisam ser reconciliadas entre BOM e React.

    pip install openpyxl
    python gerar_planilha_bom.py

Substitui os antigos gerar_excel_materiais.py e gerar_excel_completo.py, que
tinham a lista escrita na mão e ainda continham a fonte ATX e o disjuntor
removidos na refatoração para 24 V.
"""

from __future__ import annotations

import re
import os
import sys
import tempfile
from datetime import datetime
from pathlib import Path

try:
    from openpyxl import Workbook, load_workbook
    from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
    from openpyxl.utils import get_column_letter
except ImportError:
    sys.exit("Falta a biblioteca openpyxl. Instale com:  pip install openpyxl")

RAIZ = Path(__file__).resolve().parent
BOM_MD = RAIZ / "camada_0_fundamentos" / "03_lista_materiais.md"
SAIDA = RAIZ / "BOM_Projeto_Integrador.xlsx"

# ── paleta (mesma identidade dos desenhos e dos vídeos) ────────────────────
AZUL_ESCURO = "1D3557"
AMBAR = "F5A524"
CINZA_CLARO = "EFF2F5"
CINZA_LINHA = "D6DCE4"
VERDE = "2B8A3E"

FINA = Side(style="thin", color=CINZA_LINHA)
BORDA = Border(left=FINA, right=FINA, top=FINA, bottom=FINA)

# Seções da BOM que descrevem o que SAIU do projeto — nunca viram compra.
SECAO_REMOVIDOS = re.compile(r"n[ãa]o existem mais|removid", re.IGNORECASE)
SECAO_COMPRA = re.compile(r"^(?:E\.\d|M\.\d|C\.\d|L\.\d|CAMADA [23])", re.IGNORECASE)
ITEM_BLOQUEADO = re.compile(
    r"n[aã]o comprar|n[aã]o comprar/energizar|compra bloqueada|"
    r"compra pendente|bloquead[oa] para compra",
    re.IGNORECASE,
)


def limpar(texto: str) -> str:
    """Tira a formatação markdown, deixando o texto puro para a planilha."""
    texto = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", texto)  # [rótulo](link) -> rótulo
    texto = texto.replace("**", "").replace("`", "")
    texto = texto.replace("~~", "")
    texto = re.sub(r"\s+", " ", texto)
    return texto.strip()


# ── links de busca ─────────────────────────────────────────────────────────
#
# Por que links de BUSCA e não links de anúncio: anúncio do Mercado Livre sai
# do ar, muda de vendedor e muda de preço. Um link de busca continua válido
# para sempre e sempre mostra o que existe HOJE. A coluna "Link escolhido"
# fica ao lado, para você colar o anúncio depois de decidir.

# Palavras que não ajudam a achar o produto — poluem a busca.
RUIDO = {
    "de", "da", "do", "das", "dos", "para", "com", "sem", "e", "ou", "a", "o",
    "as", "os", "em", "no", "na", "por", "cada", "tipo", "opcional",
}
ACENTOS = str.maketrans("áàâãäéèêëíìîïóòôõöúùûüçÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ",
                        "aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUC")


def termo_de_busca(item: str) -> str:
    """Transforma o nome do item num termo de busca utilizável numa loja.

    Devolve "" para linhas que não são itens de compra — as que começam com
    "→" detalham o item da linha anterior (ex.: "→ T2 (poste P2)") e gerariam
    uma busca inútil por "t2".
    """
    if item.lstrip().startswith(("→", "->")):
        return ""
    texto = item.translate(ACENTOS).lower()
    texto = re.sub(r"\(.*?\)", " ", texto)          # tira parênteses explicativos

    def palavras_de(t: str) -> list[str]:
        t = re.sub(r"[^a-z0-9,\s]", " ", t)
        return [p for p in t.split() if p not in RUIDO]

    # Normalmente o que interessa está ANTES do travessão ("Fonte — 24 V ...").
    # Mas em itens como "KM1 — Relé de interface 24 Vcc" o rótulo do projeto
    # vem antes e o nome do produto vem depois. Se o começo render menos de
    # 2 palavras úteis, ele é rótulo: usa-se o nome completo.
    palavras = palavras_de(texto.split("—")[0].split("·")[0])
    if len(palavras) < 2:
        palavras = palavras_de(texto.replace("—", " ").replace("·", " "))
        # "KM1", "T2", "F1" são identificadores do projeto, não do produto.
        # Numa busca em loja eles só atrapalham.
        while palavras and re.fullmatch(r"[a-z]{1,3}\d{1,2}", palavras[0]):
            palavras.pop(0)

    return " ".join(palavras[:7])                    # 7 palavras já é específico


def url_mercadolivre(termo: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", termo.lower()).strip("-")
    return f"https://lista.mercadolivre.com.br/{slug}" if slug else ""


def url_amazon(termo: str) -> str:
    from urllib.parse import quote_plus
    return f"https://www.amazon.com.br/s?k={quote_plus(termo)}" if termo else ""


# ── AliExpress ─────────────────────────────────────────────────────────────
#
# Duas diferenças em relação às lojas nacionais:
#
# 1. A busca precisa ser em INGLÊS. Termo em português não acha quase nada.
# 2. Nem todo item DEVE ser importado. Componentes que fazem parte da
#    segurança elétrica (disjuntor, relés, fonte) devem ser nacionais e
#    certificados — o edital exige "conformidade com normas de segurança
#    elétrica", e produto sem INMETRO não sustenta essa afirmação.
#
# Por isso a lista abaixo é CURADA: só aparece link de AliExpress no item
# que faz sentido importar. Ausência de link aqui é recomendação, não falha.
BUSCA_ALIEXPRESS = {
    # Reles: so entram com MARCA e MODELO. O criterio nao e "importado e
    # ruim" - e que o datasheet precisa declarar a corrente em DC, e
    # anuncio generico ("24V 10A Relay Module") nao declara.
    "km1":                       "HH64P LY4NJ 24VDC relay 10A 14 pin PTF14A socket",
    "kit duplo de refrigera":     "dual TEC1-12706 peltier cooler kit 12V",
    "peltier tec1-12706":        "TEC1-12706 peltier module",
    "ventoinha de reposi":       "80mm fan 12V 3 pin PWM tachometer",
    "aquecedor ptc":             "12V 50W PTC heater element with fan",
    "sensor ina219":             "INA219 current sensor module",
    "uln2803":                   "ULN2803A DIP18 darlington",
    "soquete dip":               "DIP18 IC socket",
    "conversor 24 v → 5 v":    "24V to 5V 5A buck converter datasheet",
    "conversor 24 v → 12 v":   "24V to 12V 20A buck converter datasheet",
    "bts7960":                   "BTS7960 43A motor driver module",
    "esp32-wroom":               "ESP32 WROOM 32U",
    "arduino mega":              "Arduino Mega 2560 R3",
    "nextion":                   "Nextion NX4024T032 3.2 inch HMI",
    "ds18b20":                   "DS18B20 waterproof temperature sensor",
    "am2315c":                   "AM2315C temperature humidity sensor",
    "rtc ds3231":                "DS3231 RTC module",
    "micro sd":                  "micro SD card module SPI arduino",
    "cartão micro sd":           "micro SD card 16GB class 10",
    "dissipador + cooler 80":    "80mm heatsink fan CPU cooler 3pin",
    "dissipador de alumínio":    "aluminum heatsink small",
    "cooler 60 mm":              "60mm fan 24V DC",
    "cooler 40":                 "40mm fan 12V DC",
    "fan 60":                    "60mm fan 12V DC",
    "fan 40":                    "40mm fan 12V DC",
    "pasta térmica":             "thermal paste syringe",
    "fita térmica":              "thermal adhesive tape double sided",
    "placa ilhada":              "perfboard prototype PCB",
    "borne kf350":               "KF350 3.5mm PCB screw terminal block",
    "espaguete termorretrátil":  "heat shrink tubing kit",
    "termorretrátil":            "heat shrink tubing kit",
    "sinaleiros led 22":         "22mm LED pilot indicator lamp 24V",
    "botão de emergência":       "22mm emergency stop mushroom button",
    "botão start":               "22mm push button switch green",
    "botão stop":                "22mm push button switch black",
    "blocos de contato":         "22mm push button contact block NO NC",
    "voltímetro + amperímetro":  "DC voltmeter ammeter 100V 10A digital",
    "pigtail":                   "IPEX u.FL to SMA pigtail cable",
    "antena 2,4":                "2.4GHz SMA antenna 3dBi",
    "conector sma":              "SMA bulkhead panel connector female",
    "conector circular gx16":    "GX16 8 pin aviation connector",
    "resistor":                  "1/4W resistor kit assorted",
    "capacitor cerâmico":        "100nF ceramic capacitor",
    "diodo 1n4007":              "1N4007 diode",
    "led 3 mm":                  "3mm warm white LED",
    "led 5 mm":                  "5mm diffused LED",
    "micro-chave":               "SPDT micro switch small",
}


# Acessórios que CITAM o componente principal no nome mas são outra coisa.
# Sem isto, "Suporte DIN para Arduino Mega" cai na busca de "Arduino Mega".
ACESSORIO = re.compile(r"^\s*(suporte|base|flange|tampa|grade|cinta)\b", re.I)


def busca_aliexpress(item: str) -> str:
    """Devolve o termo em inglês se o item valer a pena importar."""
    if ACESSORIO.match(item.translate(ACENTOS)):
        return ""
    chave = item.translate(ACENTOS).lower()
    alvo = {k.translate(ACENTOS): v for k, v in BUSCA_ALIEXPRESS.items()}
    for fragmento, termo_en in alvo.items():
        if fragmento in chave:
            return termo_en
    return ""


def url_aliexpress(termo_en: str) -> str:
    if not termo_en:
        return ""
    slug = re.sub(r"[^a-z0-9]+", "-", termo_en.lower()).strip("-")
    return f"https://pt.aliexpress.com/w/wholesale-{slug}.html"


def linha_de_tabela(linha: str) -> list[str] | None:
    linha = linha.strip()
    if not linha.startswith("|") or not linha.endswith("|"):
        return None
    return [c.strip() for c in linha[1:-1].split("|")]


def eh_separador(celulas: list[str]) -> bool:
    return all(re.fullmatch(r":?-{2,}:?", c) for c in celulas if c)


def ler_bom(caminho: Path) -> list[dict]:
    """Extrai as tabelas de materiais, guardando a seção de cada uma."""
    if not caminho.exists():
        sys.exit(f"BOM não encontrada: {caminho}")

    itens: list[dict] = []
    secao = "Geral"
    cabecalho: list[str] | None = None

    for linha in caminho.read_text(encoding="utf-8").splitlines():
        titulo = re.match(r"^#{1,3}\s+(.*)", linha)
        if titulo:
            secao = limpar(titulo.group(1))
            cabecalho = None
            continue

        celulas = linha_de_tabela(linha)
        if celulas is None:
            cabecalho = None
            continue
        if eh_separador(celulas):
            continue

        # primeira linha de uma tabela = cabeçalho
        if cabecalho is None:
            cabecalho = [limpar(c) for c in celulas]
            continue

        # Só entram as seções de materiais. Tabelas do carrinho, exemplos,
        # resumos e histórico não são listas de compra.
        if not cabecalho or "Item" not in cabecalho[0]:
            continue

        # ⚠️ A tabela "Itens que NÃO existem mais" também tem "Item" no
        #    cabeçalho ("Item removido"). Sem este filtro, componentes já
        #    eliminados do projeto — XL4016, Zener, cooler do T1 — voltam
        #    para a lista de compras.
        if SECAO_REMOVIDOS.search(secao):
            continue
        if not SECAO_COMPRA.search(secao):
            continue

        brutos = dict(zip(cabecalho, celulas))
        valores = dict(zip(cabecalho, [limpar(c) for c in celulas]))
        item = valores.get(cabecalho[0], "")

        # O tachado (~~item~~) marca o que saiu do projeto. A checagem é feita
        # na célula BRUTA porque limpar() remove os "~~" antes de chegar aqui.
        if not item or "~~" in brutos.get(cabecalho[0], ""):
            continue
        if any(ITEM_BLOQUEADO.search(valor) for valor in valores.values()):
            continue

        # a 4ª coluna muda de nome conforme a tabela (Busca / Ajuste / Aplicação)
        extras = [
            valores.get(k, "")
            for k in cabecalho[3:]
            if k.lower() not in ("link", "link de compra")
        ]

        # "Busca sugerida" da BOM tem prioridade sobre o nome do item, porque
        # foi escrita pensando em como o produto é anunciado, não em como ele
        # é chamado no projeto.
        termo = valores.get("Busca sugerida", "") or termo_de_busca(item)

        itens.append(
            {
                "secao": secao,
                "item": item,
                "qtd": valores.get("Qtd", ""),
                "espec": valores.get("Especificação", ""),
                "obs": " · ".join(x for x in extras if x),
                "link_manual": limpar(brutos.get("Link", "")),
                "busca_ml": url_mercadolivre(termo),
                "busca_amz": url_amazon(termo),
                "termo": termo,
                "termo_en": busca_aliexpress(item),
                "busca_ali": url_aliexpress(busca_aliexpress(item)),
            }
        )

    return itens


# Inventário confrontado com o modelo React atual; não é aprovação para energizar.
REACT_INVENTARIO = [
    ("Painel", "Caixa do painel", 1, "700 x 700 x 250 mm; conferir medidas e furação antes de fabricar", "painel_interativo/src/data/painel_completo.js"),
    ("Painel", "BD-POT", 1, "24 V comutados pelo KM1 para o BTS da Peltier; o PTC proposto não pertence a este barramento", "painel_interativo/src/data/painel_completo.js"),
    ("Painel", "BD-AUX", 1, "12 V auxiliar para ventoinhas; não é corte de emergência nem alimentação aprovada do PTC", "painel_interativo/src/data/painel_completo.js"),
    ("Bloqueado", "BD-PTC / ramal do aquecedor", 1, "12 V permanente proposto via T3; sem corte DC independente definido. BTS do PTC em curto pode manter 4,17 A na emergência enquanto a ventoinha para. NÃO MONTAR NEM ENERGIZAR.", "painel_interativo/src/sim/energia.js"),
    ("Bloqueado", "T2 — conversor proposto", 1, "24 V para 5,0 V / 5 A; modelo, ficha, tensão máxima de entrada e transientes pendentes", "painel_interativo/src/data/painel_completo.js"),
    ("Bloqueado", "T3 — conversor proposto", 1, "24 V para 12 V / 20 A; modelo, ficha e capacidade contínua/térmica pendentes", "painel_interativo/src/data/painel_completo.js"),
    ("Painel", "BD-24V", 1, "24 V permanente para comando e N4AIC24", "painel_interativo/src/data/painel_completo.js"),
    ("Painel", "BD-5V", 1, "5 V de lógica, IHM e sinaleiros", "painel_interativo/src/data/painel_completo.js"),
    ("Painel", "BD-0V / BD-0V-B", 2, "Retornos separados conforme a topologia; conferir quantidade de terminais no modelo", "painel_interativo/src/data/painel_completo.js"),
    ("Painel", "BTS7960", 2, "Um para Peltier; outro para PTC proposto. Falha em curto pode energizar o PTC sem comando; não é dispositivo de corte independente.", "painel_interativo/src/data/painel_completo.js"),
    ("Painel", "Rele KM1 14 pinos + base DIN", 2, "1 em uso + 1 reserva; HH64P / LY4NJ 24 Vcc 10 A com base PTF14A; 4 contatos (corta 24 V Peltier, 12 V PTC e SELO)", "painel_interativo/src/data/reles_fisico.js"),
    ("Painel", "Modulos rele 1 canal 5 V", 3, "KA1 NO, KA2 NC e KA3 NO; montagem DIN conforme o modelo atual", "painel_interativo/src/data/reles_fisico.js"),
    ("Painel", "Arduino Mega 2560", 1, "Controlador principal", "painel_interativo/src/data/painel_completo.js"),
    ("Painel", "N4AIC24", 1, "V1 mede BD-POT; aquisição de tensão/corrente via Modbus RTU RS-485", "painel_interativo/src/data/painel_completo.js"),
    ("Painel", "MAX485", 1, "Transceptor RS-485 entre Serial3 do Mega e N4AIC24", "painel_interativo/src/data/painel_completo.js"),
    ("Painel", "DNLCB30 + ESP32-WROOM-32U", 1, "Supervisão Wi-Fi/MQTT; não autoriza partida", "painel_interativo/src/data/painel_completo.js"),
    ("Painel", "ES3C28P ESP32-S3", 1, "IHM 2,8 pol., touch e microSD integrado", "painel_interativo/src/data/painel_completo.js"),
    ("Painel", "Conversor de nível UART", 1, "Adaptação de níveis entre Mega 5 V e IHM 3,3 V", "painel_interativo/src/data/painel_completo.js"),
    ("Painel", "Sinaleiros LED 22 mm 5 V", 4, "RUN, COOL, HEAT e FAULT; validar corrente por pino antes da ligação direta", "painel_interativo/src/data/painel_completo.js"),
    ("Painel", "Botoeiras", 3, "Emergência, LIGAR verde e STOP preto", "painel_interativo/src/data/painel_completo.js"),
    ("Camara", "Peltier TEC1-12706", 2, "Ligadas em série; 24 V e aproximadamente 6 A no conjunto", "painel_interativo/src/data/camara.js"),
    ("Camara", "PTC proposto 12 V / 50 W — BLOQUEADO", 1, "Estimativa de 4,17 A; modelo, topologia de corte DC, proteção, condutores e limites térmicos não aprovados. Não comprar/montar/energizar.", "painel_interativo/src/data/camara.js"),
    ("Camara", "ST-1: termostato NF 90 C de rearme manual — modelo pendente", 1, "NAO COMPRAR: identificar variante exata e exigir ficha com rearme manual, tolerância, proteção ambiental e capacidade CC apropriada para o ramal de 12 V; validar corte/trava.", "painel_interativo/src/data/camara.js"),
    ("Camara", "ST-2: termostato NF 70 C de rearme manual — modelo pendente", 1, "NAO COMPRAR NEM LIGAR DIRETO AO PTC: rating AC não comprova interrupção CC. Exigir ficha do modelo exato com rating 12 Vcc adequado, temperatura/tolerância e proteção ambiental.", "painel_interativo/src/data/camara.js"),
    ("Camara", "Ventoinhas internas 12 V", 5, "4 de circulação + ventoinha integrada do PTC; dois fios e sem tacômetro. A ventoinha do PTC pode parar durante emergência; a estratégia térmica permanece pendente.", "painel_interativo/src/data/camara.js"),
    ("Fora da camara", "Coolers do radiador 3 fios", 2, "12 V; somente estes dois sinais de RPM são monitorados", "painel_interativo/src/data/camara.js"),
    ("Camara", "AM2315C", 1, "Temperatura e umidade dentro da câmara", "painel_interativo/src/data/camara.js"),
    ("Fora da camara", "DS18B20", 1, "Temperatura do dissipador quente; não mede o corpo do PTC nem substitui ST-1", "painel_interativo/src/data/camara.js"),
    ("Camara", "Placas PL-1 e PL-2 / DUT", 2, "Oito posições totais, quatro por placa; retornos individuais medidos no N4AIC24", "painel_interativo/src/data/discretos.js"),
    ("Camara", "Porta-fusível das posições", 1, "Oito vias, um canal por DUT; confirmar especificação final do conjunto", "painel_interativo/src/data/camara.js"),
]

REACT_FIACAO = [
    ("127 V CA + PE", "Conforme condutores cadastrados", "1,5 mm²", "Entrada AC, proteção Q0 e fonte; conferir montagem física", "painel_interativo/src/data/fiacao.js"),
    ("24 V potência / BD-POT", "Conforme FIOS", "1,5 / 0,5 mm²", "KM1, barramento comutado e drivers BTS", "painel_interativo/src/data/fiacao.js"),
    ("24 V permanente / BD-24V", "Conforme FIOS", "0,75 / 0,5 mm²", "Comando e alimentação do N4AIC24; não é V1", "painel_interativo/src/data/fiacao.js"),
    ("12 V auxiliar / BD-AUX", "Conforme FIOS", "0,75 / 0,5 mm²", "Coolers do radiador e grupo de cinco ventoinhas internas", "painel_interativo/src/data/fiacao.js"),
    ("12 V proposto / BD-PTC", "Não definido", "Não definido", "Ramal proposto direto do T3, ainda sem corte DC independente, F3 e bitola aprovados; não montar nem energizar", "painel_interativo/src/sim/energia.js"),
    ("5 V / BD-5V", "Conforme FIOS", "0,5 mm²", "Mega, IHM, interfaces e sinaleiros de 5 V", "painel_interativo/src/data/fiacao.js"),
    ("Modbus RS-485", "Par trançado A/B", "Conforme FIOS", "N4AIC24 ↔ MAX485 ↔ Serial3 do Mega", "painel_interativo/src/data/fiacao.js"),
    ("Sinais e sensores", "Conforme FIOS", "Conforme FIOS", "Entradas do Mega, sensores, RPM do radiador e comandos", "painel_interativo/src/data/fiacao.js"),
]

DIVERGENCIAS = [
    ("Resolvido", "Corte do PTC na emergência", "KM1 atualizado para 14 pinos (HH64P/LY4NJ)", "Contato 2 do KM1 chaveia o BD-PTC 12 V; ao bater emergência ou STOP, KM1 abre simultaneamente Peltier (24 V) e PTC (12 V)", "Adotado relé HH64P/LY4NJ 10 A com base PTF14A. Validação física de montagem e fiação liberada."),
    ("Bloqueante", "F3 e condutores do PTC", "Valores legados não se aplicam ao ramal novo", "Corrente estimada do PTC ≈ 4,17 A; proteção e cabos de saída T3 não definidos", "Dimensionar F3, dispositivo com capacidade de interrupção CC, cabos, terminais e coordenação com a fonte/T3; não escolher valor por anúncio."),
    ("Pendente", "T2/T3", "Anúncios/capacidades nominais sem modelo e ficha aprovados", "T2: 24→5,0 V/5 A; T3: 24→12 V/20 A são apenas propostas", "Confirmar faixa máxima/transientes de T2 e capacidade contínua, térmica e de proteção de T3."),
    ("Bloqueante", "ST-1 — proteção térmica", "Modelo, rearme, tolerância, rating CC e proteção ambiental sem confirmação", "Componente ainda pendente no modelo e na lista", "Não comprar nem energizar o PTC até identificar variante e validar a arquitetura de corte/trava."),
    ("Bloqueante", "ST-2 — proteção térmica", "Rating AC de KSD301 não comprova interrupção em 12 Vcc", "Componente ainda pendente no modelo e na lista", "Não comprar nem ligar diretamente em série; exigir ficha da variante exata ou dimensionar corte alternativo DC."),
    ("Pendente", "Acrílico e temperaturas", "Tipo GS/XT e lote comprado não registrados", "ST-2 nominal 70 °C não comprova temperatura máxima real", "Identificar material e medir vários pontos, com tolerância e atraso térmico antes de aprovar."),
    ("Limitação", "Ventilação interna", "Cinco ventoinhas internas são de dois fios, sem tacômetro", "RPM1/RPM2 medem apenas os dois coolers do radiador", "Documentar que KA3 ou a ventoinha do PTC podem falhar sem diagnóstico de RPM."),
]


def adicionar_aba_tabela(wb, nome, cabecalho, linhas, larguras=None):
    ws = wb.create_sheet(nome)
    for coluna, titulo in enumerate(cabecalho, start=1):
        c = ws.cell(row=1, column=coluna, value=titulo)
        c.font = Font(bold=True, color="FFFFFF")
        c.fill = PatternFill("solid", fgColor=AZUL_ESCURO)
        c.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        c.border = BORDA
        if larguras:
            ws.column_dimensions[get_column_letter(coluna)].width = larguras[coluna - 1]
    for linha, valores in enumerate(linhas, start=2):
        for coluna, valor in enumerate(valores, start=1):
            c = ws.cell(row=linha, column=coluna, value=valor)
            c.border = BORDA
            c.alignment = Alignment(vertical="top", wrap_text=True)
            if linha % 2 == 0:
                c.fill = PatternFill("solid", fgColor=CINZA_CLARO)
    ws.freeze_panes = "A2"
    ws.auto_filter.ref = f"A1:{get_column_letter(len(cabecalho))}{max(1, len(linhas) + 1)}"
    return ws


def aplicar_react_como_fonte(itens: list[dict]) -> list[dict]:
    """Reconcile legacy Markdown rows with the current panel and chamber model."""
    corrigidos: list[dict] = []
    descartar = (
        "sensor de tensao dc 0-25", "modulo sensor de tensao 0-25", "sv-1",
        "wcs2702", "acs712", "cd74hc4067", "ina219", "placa pi-1",
        "placa pi-2", "divisor d25", "divisor de realimentacao", "d25",
        "sinaleiro 22 mm 24 v", "sinaleiro led 22 mm 24 v",
        "n4aic24", "max485", "ds18b20", "resistor 10 k", "resistor 4,7 k",
        "ptc", "lm2596", "t2 (poste p2", "t3 (poste p3",
    )
    for reg in itens:
        item = reg["item"].lower().translate(ACENTOS).replace("–", "-").replace("—", "-")
        texto = " ".join((reg["item"], reg["espec"], reg["obs"])).lower().translate(ACENTOS)
        if any(termo in item for termo in descartar):
            continue
        if "placa ilhada" in item or "resistor 22 k" in item:
            continue
        if reg["secao"].lower().startswith("l.4b") and "capacitor ceramico" in item:
            continue
        if "sinaleiro" in item and "24 v" in texto:
            continue
        if "caixa de comando ou mdf" in item:
            reg["espec"] = "700 x 700 x 250 mm — dimensao do modelo React; conferir medidas antes de fabricar"
        elif "arduino mega 2560" in item:
            reg["qtd"] = "1"
            reg["espec"] = "1 controlador em uso; reserva opcional"
        elif "km1" in item:
            reg["qtd"] = "2"
            reg["espec"] = "1 conjunto em uso + 1 reserva; confirmar rating CC na ficha do modelo exato"
        elif "modulo rele 1 canal 5 v" in item:
            reg["qtd"] = "3"
            reg["espec"] = "KA1 (NO), KA2 (NC) e KA3 (NO), conforme módulos e contatos do modelo atual"
        elif "sensor ds18b20" in item:
            reg["qtd"] = "1"
            reg["espec"] = "1-Wire, 3 fios, no dissipador quente; não mede o corpo do PTC"
        elif "ds18b20" in item and "adaptador" in item:
            reg["qtd"] = "1"
            reg["espec"] = "Uma sonda + adaptador; confirmar pull-up integrado"
        elif "t2" in item and "poste p2" in item:
            reg["espec"] = "Proposta T2: 24→5,0 V/5 A; modelo, faixa de entrada e ficha ainda pendentes. Não comprar/energizar."
        elif "lm2596" in item:
            reg["espec"] = "Referência legada, substituída pelas propostas T2 24→5 V/5 A e T3 24→12 V/20 A; não comprar LM2596."
        elif "resistor 10 k" in item:
            reg["qtd"] = "5"
            reg["espec"] = "R8/R9 nos BTS7960 e pull-downs dos módulos KA1/KA2/KA3"
        elif "resistor 4,7 k" in item:
            reg["qtd"] = "1"
            reg["espec"] = "Reserva caso o adaptador DS18B20 não tenha pull-up integrado"
        elif "bloco de distribuicao" in item:
            if "4 mm" in item and "4 saidas" in item:
                reg["espec"] = "BD-POT · 24 V comutados pelo KM1 para os dois drivers; sem divisor D25"
            elif "2,5 mm" in item and "6 saidas" in item:
                reg["espec"] = "BD-24V · 24 V permanente para comando e N4AIC24"
            elif "2,5 mm" in item and "8 saidas" in item:
                reg["espec"] = "BD-5V · alimentação do Mega, IHM, interfaces e sinaleiros de 5 V"
            elif "2,5 mm" in item and "4 saidas" in item:
                reg["espec"] = "BD-AUX · 12 V para coolers e ventoinhas"
        elif "barra de distribuicao" in item:
            reg["espec"] = "Barra de retorno conforme o desenho atual; conferir quantidade de terminais"
        elif "porta-fusivel" in item and "din" in item:
            reg["qtd"] = "8"
            reg["espec"] = "Um canal seccionável por posição DUT; fusível conforme Doc 13"
        elif "resistor 220" in item and "sinaleiro" in texto:
            continue
        elif "cabo flexivel 1,5 mm" in item and "preto" in item:
            reg["item"] = "Cabo flexível 1,5 mm² — retorno 0 V"
            reg["espec"] = "Cor e comprimento conforme a tabela de fios atual; não usar identificação legada"

        if "posic" in item and ("dut" in texto or "ensaio" in item):
            reg["qtd"] = "8"
            reg["espec"] = "Oito posições LED em 12 V, em duas placas de quatro canais, com retorno medido no N4AIC24"
        corrigidos.append(reg)

    def adicionar(
        item: str, qtd: str, espec: str, fonte_busca: str = "", *, bloqueado: bool = False
    ) -> None:
        corrigidos.append({
            "secao": "L.6 — Itens reconciliados com o modelo atual",
            "item": item,
            "qtd": qtd,
            "espec": espec,
            "obs": "",
            "link_manual": "",
            "busca_ml": "" if bloqueado else url_mercadolivre(termo_de_busca(fonte_busca or item)),
            "busca_amz": "" if bloqueado else url_amazon(termo_de_busca(fonte_busca or item)),
            "termo": termo_de_busca(fonte_busca or item),
            "termo_en": "",
            "busca_ali": "" if bloqueado else url_aliexpress(busca_aliexpress(fonte_busca or item)),
        })

    adicionar("Módulo N4AIC24", "1", "V1 mede BD-POT; aquisição de tensões e correntes por Modbus RTU RS-485")
    adicionar("Transceptor MAX485", "1", "Interface RS-485 entre o N4AIC24 e Serial3 do Mega")
    adicionar("PTC proposto 12 V / 50 W — BLOQUEADO", "1", "≈4,17 A estimados; não comprar, montar ou energizar até definir corte DC independente, F3, condutores, termostatos e validação térmica", bloqueado=True)
    adicionar("Conversor T2 — 24 V para 5,0 V / 5 A (proposta bloqueada)", "1", "Modelo, faixa máxima/transientes de entrada e ficha técnica pendentes; não comprar", bloqueado=True)
    adicionar("Conversor T3 — 24 V para 12 V / 20 A (proposta bloqueada)", "1", "Modelo e capacidade contínua/térmica pendentes; proteção de saída e corte do PTC não definidos; não comprar", bloqueado=True)
    adicionar("F3 e proteção do ramal 12 V do PTC — pendentes", "a dimensionar", "Não reutilizar o valor legado de 2 A; coordenar corrente, cabos, terminais, fusível e capacidade de interrupção CC", bloqueado=True)
    adicionar("Sinaleiros LED 22 mm 5 V", "4", "RUN, COOL, HEAT e FAULT; medir corrente antes de ligar diretamente aos pinos")
    adicionar("Placas PL-1/PL-2 — oito posições DUT", "2", "Quatro canais LED de 12 V em cada placa; correntes individuais pelo N4AIC24")
    adicionar("Ventoinhas internas 12 V", "5", "Quatro de circulação e uma do PTC; dois fios, sem tacômetro")
    adicionar("Coolers do radiador 12 V, 3 fios", "2", "RPM1/RPM2 supervisionam somente os coolers externos do radiador")
    adicionar("ST-1 — termostato NF manual, modelo pendente", "1", "NÃO COMPRAR: ficha do modelo exato deve comprovar rating 12 Vcc adequado, temperatura/tolerância e proteção ambiental")
    adicionar("ST-2 — termostato NF manual, modelo pendente", "1", "NÃO COMPRAR NEM LIGAR DIRETO AO PTC: rating AC não comprova interrupção 12 Vcc; exigir ficha da variante exata")
    adicionar("Resistor 10 kΩ 1/4 W — R8/R9 e pull-downs KA1/KA2/KA3", "5", "2 para BTS7960 + 3 para módulos KA1/KA2/KA3; quantidade consolidada")
    adicionar("Resistor 4,7 kΩ 1/4 W — reserva do DS18B20", "1", "Reserva única caso o adaptador/sonda DS18B20 não tenha pull-up integrado")
    adicionar("⭐ DS18B20 à prova d'água + adaptador", "1", "Um conjunto, não uma sonda adicional; medir o dissipador quente, não o corpo do PTC")
    return corrigidos


def ler_dados_manuais(destino: Path) -> dict[tuple[str, str], list[dict]]:
    """Read user-entered links and prices before rebuilding the generated workbook."""
    if not destino.exists():
        return {}
    wb_existente = load_workbook(destino, data_only=False)
    if "Lista de Compras" not in wb_existente.sheetnames:
        return {}
    ws = wb_existente["Lista de Compras"]
    dados: dict[tuple[str, str], list[dict]] = {}
    for linha in range(5, ws.max_row + 1):
        item = ws.cell(linha, 2).value
        qtd = ws.cell(linha, 3).value
        if not item or not qtd or not isinstance(ws.cell(linha, 1).value, (int, float)):
            continue
        link = ws.cell(linha, 9).value
        preco = ws.cell(linha, 10).value
        if link or preco not in (None, ""):
            chave = (str(item).strip().casefold(), str(qtd).strip().casefold())
            dados.setdefault(chave, []).append({"link": link, "preco": preco})
    return dados


def gerar(itens: list[dict], destino: Path) -> None:
    dados_manuais = ler_dados_manuais(destino)
    indices_manuais: dict[tuple[str, str], int] = {}
    for reg in itens:
        chave = (str(reg["item"]).strip().casefold(), str(reg["qtd"]).strip().casefold())
        indice = indices_manuais.get(chave, 0)
        registros = dados_manuais.get(chave, [])
        if indice < len(registros):
            anterior = registros[indice]
            reg["link_manual"] = reg["link_manual"] or anterior["link"] or ""
            reg["preco_unit"] = anterior["preco"]
            indices_manuais[chave] = indice + 1

    wb = Workbook()

    # ───────────────────────── aba 1: lista de compras ─────────────────────
    ws = wb.active
    ws.title = "Lista de Compras"

    ws.merge_cells("A1:K1")
    ws["A1"] = "PROJETO INTEGRADOR — Planta Industrial Didática com Câmara Frigorífica"
    ws["A1"].font = Font(size=15, bold=True, color="FFFFFF")
    ws["A1"].fill = PatternFill("solid", fgColor=AZUL_ESCURO)
    ws["A1"].alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[1].height = 30

    ws.merge_cells("A2:K2")
    ws["A2"] = (
        f"Lista de materiais · gerada de 03_lista_materiais.md em "
        f"{datetime.now():%d/%m/%Y %H:%M} · arquitetura 127 V CA → 24 V CC → 12 / 5 / 3,3 V"
    )
    ws["A2"].font = Font(size=10, italic=True, color="44546A")
    ws["A2"].alignment = Alignment(horizontal="center")

    ws.merge_cells("A3:K3")
    ws["A3"] = (
        "BLOQUEIO: NÃO COMPRAR/MONTAR/ENERGIZAR PTC, T2 OU T3. "
        "BD-PTC permanece energizado na emergência; BTS em curto pode manter "
        "≈4,17 A e desligar a ventoinha. Corte DC independente, F3 e condutores "
        "não definidos. Consulte Divergencias."
    )
    ws["A3"].font = Font(bold=True, color="9C0006")
    ws["A3"].fill = PatternFill("solid", fgColor="FFC7CE")
    ws["A3"].alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)
    ws.row_dimensions[3].height = 42

    colunas = [
        ("#", 5),
        ("Item", 44),
        ("Qtd", 7),
        ("Especificação", 56),
        ("Observação", 32),
        ("🔎 Mercado Livre", 24),
        ("🔎 Amazon BR", 14),
        ("🌏 AliExpress (importar)", 26),
        ("Link escolhido (cole aqui)", 28),
        ("Preço unit. (R$)", 15),
        ("Total (R$)", 13),
    ]
    linha_cab = 4
    for indice, (titulo, largura) in enumerate(colunas, start=1):
        celula = ws.cell(row=linha_cab, column=indice, value=titulo)
        celula.font = Font(bold=True, color="FFFFFF")
        celula.fill = PatternFill("solid", fgColor=AZUL_ESCURO)
        celula.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        celula.border = BORDA
        ws.column_dimensions[get_column_letter(indice)].width = largura
    ws.row_dimensions[linha_cab].height = 30
    ws.freeze_panes = f"A{linha_cab + 1}"

    linha = linha_cab + 1
    numero = 0
    secao_atual = None

    for reg in itens:
        if reg["secao"] != secao_atual:
            secao_atual = reg["secao"]
            ws.merge_cells(start_row=linha, start_column=1, end_row=linha, end_column=11)
            celula = ws.cell(row=linha, column=1, value=secao_atual)
            celula.font = Font(bold=True, size=11, color=AZUL_ESCURO)
            celula.fill = PatternFill("solid", fgColor=AMBAR)
            celula.alignment = Alignment(horizontal="left", vertical="center", indent=1)
            celula.border = BORDA
            ws.row_dimensions[linha].height = 22
            linha += 1

        numero += 1
        valores = [numero, reg["item"], reg["qtd"], reg["espec"], reg["obs"],
                   "", "", "", reg["link_manual"], reg.get("preco_unit"), ""]
        for indice, valor in enumerate(valores, start=1):
            celula = ws.cell(row=linha, column=indice, value=valor)
            celula.border = BORDA
            celula.alignment = Alignment(
                horizontal="center" if indice in (1, 3, 10, 11) else "left",
                vertical="top",
                wrap_text=indice in (2, 4, 5),
            )
            if linha % 2 == 0:
                celula.fill = PatternFill("solid", fgColor=CINZA_CLARO)

        # Links de busca clicáveis. Sempre válidos: a busca mostra o que
        # existe hoje, enquanto um link de anúncio sai do ar.
        if reg["busca_ml"]:
            c = ws.cell(row=linha, column=6)
            c.value = f'=HYPERLINK("{reg["busca_ml"]}","🔎 {reg["termo"][:28]}")'
            c.font = Font(color="0563C1", underline="single", size=9)
        if reg["busca_amz"]:
            c = ws.cell(row=linha, column=7)
            c.value = f'=HYPERLINK("{reg["busca_amz"]}","🔎 Amazon")'
            c.font = Font(color="0563C1", underline="single", size=9)
        if reg["busca_ali"]:
            c = ws.cell(row=linha, column=8)
            c.value = f'=HYPERLINK("{reg["busca_ali"]}","🌏 {reg["termo_en"][:26]}")'
            c.font = Font(color="C55A11", underline="single", size=9)

        ws.cell(row=linha, column=11).value = (
            f"=IF(C{linha}*J{linha}=0,\"\",C{linha}*J{linha})"
        )
        ws.cell(row=linha, column=10).number_format = "#,##0.00"
        ws.cell(row=linha, column=11).number_format = "#,##0.00"
        linha += 1

    ws.cell(row=linha + 1, column=9, value="TOTAL GERAL").font = Font(bold=True, size=12)
    total = ws.cell(row=linha + 1, column=11, value=f"=SUM(K{linha_cab + 1}:K{linha - 1})")
    total.font = Font(bold=True, size=12, color="FFFFFF")
    total.fill = PatternFill("solid", fgColor=VERDE)
    total.number_format = "#,##0.00"
    total.border = BORDA

    ws.auto_filter.ref = f"A{linha_cab}:K{linha - 1}"

    adicionar_aba_tabela(
        wb,
        "Inventario React",
        ["Grupo", "Componente", "Qtd", "Especificacao conferida", "Fonte React"],
        REACT_INVENTARIO,
        [18, 34, 8, 64, 48],
    )
    adicionar_aba_tabela(
        wb,
        "Fiacao React",
        ["Circuito", "Cor(es)", "Bitola", "Uso", "Fonte React"],
        REACT_FIACAO,
        [22, 32, 16, 62, 48],
    )
    adicionar_aba_tabela(
        wb,
        "Divergencias",
        ["Prioridade", "Tema", "BOM/Documentacao", "React atual", "Decisao para compra"],
        DIVERGENCIAS,
        [14, 24, 52, 56, 64],
    )

    # ───────────────────────── aba 2: ordem de construção ──────────────────
    ws2 = wb.create_sheet("Ordem de Construção")
    ws2.merge_cells("A1:D1")
    ws2["A1"] = "ORDEM DE CONSTRUÇÃO — 5 camadas"
    ws2["A1"].font = Font(size=14, bold=True, color="FFFFFF")
    ws2["A1"].fill = PatternFill("solid", fgColor=AZUL_ESCURO)
    ws2["A1"].alignment = Alignment(horizontal="center", vertical="center")
    ws2.row_dimensions[1].height = 28

    etapas = [
        ("CAMADA 0", "Fundamentos", "Visão geral · Arquitetura de energia · BOM", "Entregável: BOM reconciliada; itens bloqueados e ensaios pendentes identificados"),
        ("CAMADA 1", "Maquete", "Base e chão de fábrica · Subestação e postes · Câmara térmica", "Entregável: cenário pronto, sem eletrônica"),
        ("CAMADA 2", "Painel", "Dimensionamento · Layout · Furação · Fixação nos trilhos", "Entregável: painel montado, sem um fio ligado"),
        ("CAMADA 3", "Elétrica", "Força e distribuição · Comando e proteções · Sinais e sensores", "Entregável: energizado e medido, sem firmware"),
        ("CAMADA 4", "Programação", "Firmware Arduino · ESP32, IHM e IoT", "Entregável: software gravado e testado em bancada"),
        ("CAMADA 5", "Integração", "Montagem final · Comissionamento · Ensaios", "Entregável: projeto funcionando e documentado"),
    ]
    for indice, titulo in enumerate(["Camada", "Nome", "Documentos", "Critério de aceitação"], start=1):
        celula = ws2.cell(row=3, column=indice, value=titulo)
        celula.font = Font(bold=True, color="FFFFFF")
        celula.fill = PatternFill("solid", fgColor=AZUL_ESCURO)
        celula.border = BORDA
    for largura, letra in zip((12, 18, 58, 52), "ABCD"):
        ws2.column_dimensions[letra].width = largura

    for i, etapa in enumerate(etapas, start=4):
        for j, valor in enumerate(etapa, start=1):
            celula = ws2.cell(row=i, column=j, value=valor)
            celula.border = BORDA
            celula.alignment = Alignment(vertical="top", wrap_text=True)
            if j == 1:
                celula.font = Font(bold=True, color=AZUL_ESCURO)
                celula.fill = PatternFill("solid", fgColor=AMBAR)

    # ───────────────────────── aba 3: dados do projeto ─────────────────────
    ws3 = wb.create_sheet("Dados do Projeto")
    ws3.merge_cells("A1:B1")
    ws3["A1"] = "NÚMEROS DO PROJETO"
    ws3["A1"].font = Font(size=14, bold=True, color="FFFFFF")
    ws3["A1"].fill = PatternFill("solid", fgColor=AZUL_ESCURO)
    ws3["A1"].alignment = Alignment(horizontal="center", vertical="center")
    ws3.row_dimensions[1].height = 28
    ws3.column_dimensions["A"].width = 46
    ws3.column_dimensions["B"].width = 46

    dados = [
        ("Arquitetura de energia", "24 Vcc · propostas T2 5 V/5 A e T3 12 V/20 A (modelos e proteções pendentes)"),
        ("Tensão de entrada", "127 V CA"),
        ("Barramento de distribuição", "24 V CC (SELV)"),
        ("Potência instalada (fonte)", "240 W · 10 A"),
        ("Consumo calculado", "≈ 170,2 W · 7,09 A @ 24 V (estimativa do modelo; validar em bancada)"),
        ("Folga da fonte", "Estimativa sujeita a perdas reais e fichas dos conversores; não aprova a fonte"),
        ("Corrente CA de entrada", "2,43 A"),
        ("Queda de tensão na linha dos postes", "0,21 V (0,86 %)"),
        ("Conversores", "Propostas: T2 24→5 V/5 A e T3 24→12 V/20 A · modelos não aprovados"),
        ("Tensões derivadas", "24 V Peltier · 12 V auxiliar/PTC proposto · 5,0 V lógica proposto · 3,3 V ESP32"),
        ("Fusíveis dos ramais", "F1/F2/F3 e proteção/corte do PTC pendentes de dimensionamento; valores legados não são especificação"),
        ("Proteção do PTC", "Solução adotada: Relé KM1 14 pinos (HH64P/LY4NJ 10 A) chaveia 24 V (Peltier) e 12 V (PTC) simultaneamente no corte da emergência/STOP"),
        ("Volume da câmara", "15,00 L bruto (300 × 200 × 250 mm) · 14,63 L com EPS 1 mm · 14,09 L livres"),
        ("Carga térmica calculada", "≈ 9,5 W"),
        ("Refrigeração", "2 × TEC1-12706 em série · 24 V · 6,0 A · 144 W"),
        ("Capacidade das Peltier a ΔT = 20 K", "≈ 60 W (margem de 6,3×)"),
        ("Dissipação no lado quente", "≈ 200 W — 2 conjuntos dissipador + cooler 80 mm"),
        ("Aquecimento", "Proposta PTC 12 V · 50 W · ≈4,17 A; modelo e arquitetura de corte ainda não aprovados — NÃO COMPRAR/MONTAR/ENERGIZAR"),
        ("Aquisição", "N4AIC24 V1 mede BD-POT; leitura do simulador via Modbus RTU/RS-485"),
        ("Posições DUT", "8 posições LED em 12 V · 2 placas de 4 canais · retornos medidos no N4AIC24"),
        ("Supervisão de ventilação", "RPM1/RPM2 cobrem apenas 2 coolers do radiador; 5 ventoinhas internas e fan do PTC sem tacômetro"),
        ("Bloqueio do PTC", "BD-PTC permanece energizado na emergência; BTS em curto pode manter ≈4,17 A e desligar a ventoinha. Corte DC independente, F3, cabos e estratégia de ventilação pendentes. Não energizar."),
        ("Acrílico", "Identificar GS/XT e validar temperaturas em diversos pontos antes da energização do PTC"),
        ("Porta", "Acrílico de 5 mm, uma chapa só · mesma U das paredes"),
        ("Base da maquete", "1500 × 500 mm · escala cenográfica 1:50"),
        ("Painel", "700 × 700 × 250 mm · conferir medidas e furação no modelo atual"),
        ("Componentes discretos", "Sem PI-1/PI-2, CD74HC4067, INA219 ou divisor D25; medição por N4AIC24/Modbus"),
        ("Sinalização", "4 sinaleiros de painel 22 mm / 5 V · conferir corrente antes de ligar direto aos pinos"),
    ]
    for i, (rotulo, valor) in enumerate(dados, start=3):
        c1 = ws3.cell(row=i, column=1, value=rotulo)
        c2 = ws3.cell(row=i, column=2, value=valor)
        c1.font = Font(bold=True)
        for c in (c1, c2):
            c.border = BORDA
            c.alignment = Alignment(vertical="center", wrap_text=True)
            if i % 2 == 0:
                c.fill = PatternFill("solid", fgColor=CINZA_CLARO)

    destino.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(
        prefix=f"{destino.stem}.", suffix=".xlsx", dir=destino.parent, delete=False
    ) as temporario:
        caminho_temporario = Path(temporario.name)
    try:
        wb.save(caminho_temporario)
        os.replace(caminho_temporario, destino)
    finally:
        if caminho_temporario.exists():
            caminho_temporario.unlink()
    print(f"  Planilha gerada: {destino}")
    print(f"  {numero} itens em {len({i['secao'] for i in itens})} seções")


if __name__ == "__main__":
    gerar(aplicar_react_como_fonte(ler_bom(BOM_MD)), SAIDA)
