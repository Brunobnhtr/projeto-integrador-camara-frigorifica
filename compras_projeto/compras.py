"""Banco de compras do Projeto Integrador — câmara térmica + painel.

O que NÃO entra nesta lista (fornecido pelo SENAI):
  cabos de alimentação · trilho DIN · canaletas · parafusos · gabinete/painel ·
  acrílico · bornes internos de distribuição (BD-24V, BD-POT, BD-5V, BD-AUX, BD-0V)

Fluxo: a lista de itens já está pronta. O aluno procura no Mercado Livre /
AliExpress e devolve o link. O script guarda link, loja, valor, frete e a foto do
anúncio, e regenera a lista em markdown e o catálogo em HTML.

Uso:
    python compras_projeto/compras.py init
    python compras_projeto/compras.py add --id CAM-01 --loja ML --link URL --preco 189.90
    python compras_projeto/compras.py add --id CAM-01 --loja ALI --link URL --preco 96.40 --frete 18
    python compras_projeto/compras.py escolher --id CAM-01 --loja ALI
    python compras_projeto/compras.py print --id CAM-01 --loja ML --arquivo print.png
    python compras_projeto/compras.py build
    python compras_projeto/compras.py show
"""
from __future__ import annotations

import argparse
import datetime as dt
import io
import json
import re
import unicodedata
import urllib.request
from pathlib import Path

BASE = Path(__file__).resolve().parent
DADOS = BASE / "dados.json"
FOTOS = BASE / "fotos"
MD = BASE / "LISTA_COMPRAS.md"
HTML = BASE / "catalogo_compras.html"

LOJAS = {"ML": "Mercado Livre", "ALI": "AliExpress", "LOCAL": "Loja local", "OUTRO": "Outro"}

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/122.0 Safari/537.36")

# --------------------------------------------------------------------------- #
# Lista de itens. Ordem = ordem de decisão de compra.
# --------------------------------------------------------------------------- #
SEED = [
    # ================= BLOCO 1 — núcleo térmico da câmara =================
    dict(id="CAM-01", bloco="1 · Núcleo térmico da câmara", critico=True,
         item="Kit Peltier duplo 2× TEC1-12706",
         qtd="1 kit",
         espec="Duas pastilhas TEC1-12706 (40×40×3,8 mm, 12 V / 6 A cada) com fios "
               "independentes para ligar em SÉRIE. O kit deve trazer 2 dissipadores, "
               "2 ventoinhas do lado quente, parafusos e pasta térmica.",
         conferir="Tem que ser 12706 — não 12710 nem 12715. As ventoinhas do radiador "
                  "precisam ter 3 fios (RPM), porque o firmware monitora o giro. "
                  "Medir o conjunto montado: essa medida é o vão da tampa (CAM-05), "
                  "que ainda está em branco no CAD.",
         busca_ml="kit peltier duplo tec1-12706 dissipador",
         busca_ali="TEC1-12706 dual peltier cooler kit heatsink"),
    dict(id="CAM-02", bloco="1 · Núcleo térmico da câmara", critico=True,
         item="Dissipador do lado quente (rejeitar 184 W a 43 °C)",
         qtd="1",
         espec="Dissipador aletado grande ou water block para 40×40 mm, capaz de "
               "rejeitar 184 W com ar a 43 °C.",
         conferir="Se o do kit do CAM-01 já der conta, não comprar. Se for pequeno, "
                  "este é o gargalo térmico do projeto — vale pagar mais aqui.",
         busca_ml="dissipador alumínio 40x40 peltier grande aletado",
         busca_ali="aluminum heatsink 40x40 peltier high performance"),
    dict(id="CAM-03", bloco="1 · Núcleo térmico da câmara", critico=True,
         item="PTC proposto 12 V / 50 W — BLOQUEADO, NÃO COMPRAR",
         qtd="1",
         espec="Proposta provisória de 12 V/50 W (~4,17 A); modelo, dimensões, "
               "proteções e caminho de corte DC ainda não foram aprovados.",
         conferir="Não comprar nem energizar. Exige ramal separado, corte DC "
                  "independente, fusível e condutores dimensionados, além da "
                  "validação de ST-1/ST-2 e dos limites térmicos do acrílico."),
    dict(id="CAM-04", bloco="1 · Núcleo térmico da câmara",
         item="Ventoinha 40 mm 12 V (boca dos dutos)",
         qtd="2",
         espec="40×40 mm, 12 V, para a entrada dos dois dutos laterais (VD1 e VD2).",
         conferir="Só comprar se o kit do CAM-01 não trouxer. As frias (VF) normalmente vêm nele.",
         busca_ml="cooler 40mm 12v 40x40",
         busca_ali="40mm 12V fan 40x40x10"),
    dict(id="CAM-05", bloco="1 · Núcleo térmico da câmara", critico=True,
         item="Sensor AM2315C (temperatura + umidade)",
         qtd="1",
         espec="Sensor I²C de temperatura e umidade, cápsula sinterizada, para o "
               "interior da câmara. É o único sensor do controle PID.",
         conferir="Tem que ser o AM2315C (o AM2315 antigo não serve). Conferir se vem com cabo.",
         link_ml="https://lista.mercadolivre.com.br/sensor-am2315c",
         link_ali="https://www.aliexpress.com/w/wholesale-AM2315C-sensor.html",
         nota_link="busca salva no projeto — escolher anúncio dentro dela"),

    # ================= BLOCO 2 — vedação e montagem da câmara =================
    dict(id="VED-01", bloco="2 · Vedação e montagem da câmara", critico=True,
         item="Cola S-320 Sinteglas (acrílico)",
         qtd="1 frasco",
         espec="Adesivo para acrílico por capilaridade. É o que dá junta cristalina e resistente.",
         conferir="Não substituir por superbonder: trinca o acrílico e fica opaco.",
         busca_ml="cola s-320 sinteglas acrílico",
         busca_ali="acrylic cement S-320"),
    dict(id="VED-02", bloco="2 · Vedação e montagem da câmara", critico=True,
         item="Silicone neutro transparente",
         qtd="1 tubo",
         espec="Vedação das juntas e da passagem de cabos.",
         conferir="Tem que ser NEUTRO. O acético (cheiro de vinagre) corrói contato e metal.",
         busca_ml="silicone neutro transparente bisnaga",
         busca_ali="neutral silicone sealant clear"),
    dict(id="VED-03", bloco="2 · Vedação e montagem da câmara",
         item="Fita adesiva de alumínio 50 mm",
         qtd="1 rolo 20 m",
         espec="Fita de alumínio colada direto nas faces, sobre o isolante.",
         conferir="Fita de alumínio de verdade, não fita prateada de PVC.",
         busca_ml="fita alumínio 50mm 20m",
         busca_ali="aluminum foil tape 50mm"),
    dict(id="VED-04", bloco="2 · Vedação e montagem da câmara", critico=True,
         item="Perfil EPDM tubular autoadesivo 9 × 6 mm",
         qtd="~1,5 m",
         espec="Borracha tubular de vedação da porta, com adesivo.",
         conferir="Tubular (oco) veda melhor que espuma maciça. Conferir comprimento do rolo.",
         busca_ml="perfil epdm tubular 9x6 vedação",
         busca_ali="EPDM rubber seal strip 9x6mm"),
    dict(id="VED-05", bloco="2 · Vedação e montagem da câmara",
         item="Dobradiça piano de alumínio 250 mm",
         qtd="1",
         espec="Dobradiça contínua de alumínio, trecho de 250 mm, para a porta dupla.",
         conferir="Conferir se vem com parafusos. Acrílico exige furo piloto.",
         busca_ml="dobradiça piano alumínio 250mm",
         busca_ali="aluminum piano hinge 250mm"),
    dict(id="VED-06", bloco="2 · Vedação e montagem da câmara",
         item="Fecho de pressão tipo borboleta (inox)",
         qtd="2",
         espec="Dois fechos que comprimem a vedação da porta.",
         conferir="Tamanho pequeno — fecho grande deforma o acrílico de 5 mm.",
         busca_ml="fecho borboleta inox pequeno caixa",
         busca_ali="stainless butterfly latch small"),
    dict(id="VED-07", bloco="2 · Vedação e montagem da câmara",
         item="Sílica gel indicadora",
         qtd="4 sachês",
         espec="1 sachê na porta dupla e 3 dentro da câmara, contra condensação.",
         conferir="Indicadora (muda de cor) ajuda a diagnosticar vedação ruim.",
         busca_ml="sílica gel indicadora sachê",
         busca_ali="silica gel desiccant indicator sachet"),
    dict(id="VED-08", bloco="2 · Vedação e montagem da câmara",
         item="Bandeja de alumínio removível (condensado)",
         qtd="1",
         espec="Bandeja retirada pela porta. Sem dreno fixo — decisão da V9.",
         conferir="Dimensionar pelo piso útil real: 200 × 100 mm.",
         busca_ml="bandeja alumínio pequena",
         busca_ali="small aluminum tray"),
    dict(id="VED-09", bloco="2 · Vedação e montagem da câmara",
         item="Tubo de silicone Ø 4 mm (respiro)",
         qtd="0,5 m",
         espec="Respiro da câmara pelo furo de 6 mm da parede traseira.",
         conferir="Silicone, não PVC: precisa manter flexibilidade no frio.",
         busca_ml="tubo silicone 4mm",
         busca_ali="silicone tube 4mm"),
    dict(id="VED-10", bloco="2 · Vedação e montagem da câmara",
         item="Pasta térmica de alta condutividade",
         qtd="1 bisnaga",
         espec="Entre pastilha e dissipador, nas duas faces.",
         conferir="Só comprar se o kit do CAM-01 não trouxer.",
         busca_ml="pasta térmica alta condutividade",
         busca_ali="thermal paste high conductivity"),
    dict(id="VED-11", bloco="2 · Vedação e montagem da câmara",
         item="Prensa-cabo PG13,5 (PC-1) + prensa-cabo PG11 (PC-2)",
         qtd="1 de cada",
         espec="PC-1 potência (furo 20,5 mm) e PC-2 medição e sinal (furo 18,6 mm), na parede traseira.",
         conferir="⚠️ NÃO são dois PG9 iguais: com as 8 posições da placa de LED o feixe do PC-1 é de 10,6 mm e o do PC-2 de 9,5 mm — um PG9 (até 8 mm) não fecha em nenhum dos dois. Furos de tamanhos diferentes de propósito.",
         busca_ml="prensa cabo pg13,5 pg11 nylon",
         busca_ali="PG13.5 PG11 cable gland"),
    dict(id="VED-12", bloco="2 · Vedação e montagem da câmara",
         item="Passa-fio / bucha do respiro Ø 6 mm",
         qtd="1",
         espec="Acomoda o tubo de silicone no furo de 6 mm da parede traseira.",
         conferir="Pode sair de uma bucha de nylon; medida final pela peça real.",
         busca_ml="passa fio 6mm nylon",
         busca_ali="6mm cable grommet"),
    dict(id="VED-13", bloco="2 · Vedação e montagem da câmara",
         item="Isolante EPS/XPS 1 mm",
         qtd="a medir",
         espec="Manta de 1 mm para as faces isoladas (paredes, tampa, base e dutos), "
               "por dentro do acrílico e sob a fita de alumínio.",
         conferir="Conferir se o SENAI fornece junto com o acrílico. Nenhum EPS/XPS é "
                  "incombustível — manter longe do PTC.",
         busca_ml="manta eps 1mm isolamento",
         busca_ali="EPS foam sheet 1mm"),

    # ================= BLOCO 3 — elétrico dentro da câmara =================
    dict(id="ELE-01", bloco="3 · Cargas de ensaio (LED 12 V)",
         item="LED 5 mm difuso (kit)",
         qtd="8",
         espec="Carga de ensaio no lugar da lâmpada W5W. 8 posições em 2 placas de "
               "4 canais. Corrente de projeto 9–11 mA com resistor de 1 kΩ em 12 V.",
         conferir="Qualquer cor serve. Difuso aparece melhor atrás do acrílico. "
                  "Conferir corrente máxima de 20 mA no datasheet.",
         busca_ml="kit led 5mm difuso cores",
         busca_ali="5mm diffused LED assortment"),
    dict(id="ELE-02", bloco="3 · Cargas de ensaio (LED 12 V)",
         item="Resistor 1 kΩ 1/4 W",
         qtd="8",
         espec="Limitador de corrente de cada canal, em 12 V. Dissipa 83 mW — 1/4 W "
               "dá margem de 3×.",
         conferir="1 kΩ ±5%. Não precisa de 1/2 W nesta tensão.",
         busca_ml="kit resistores 1k 1/4w",
         busca_ali="1K ohm 1/4W resistor"),
    dict(id="ELE-03", bloco="3 · Cargas de ensaio (LED 12 V)",
         item="Borne 2 vias 5,08 mm para PCB",
         qtd="10 (5 por placa)",
         espec="4 bornes de canal + 2 de entrada (12 V e 0 V) em cada uma das 2 placas.",
         conferir="Passo 5,08 mm, furo de 1,3 mm. Com parafuso, não de mola.",
         busca_ml="borne kf301 2 vias 5.08mm pcb",
         busca_ali="KF301-2P 5.08mm terminal block"),
    dict(id="ELE-04", bloco="3 · Cargas de ensaio (LED 12 V)",
         item="Placa ilhada 10 × 15 cm — corta em 2 de 150 × 50 mm",
         qtd="1",
         espec="Uma placa de 10 × 15 cm é cortada em duas de 150 × 50 mm, que são "
               "as 2 placas PL-1 do projeto (8 canais).",
         conferir="Face simples, passo 2,54 mm. Desenho 1:1 em placa_leds/ "
                  "(SVG e DXF). Alternativa: PCB sob medida 150×50, 5 peças.",
         busca_ml="placa ilhada 10x15 fenolite",
         busca_ali="perfboard 10x15 single side"),
    dict(id="ELE-05", bloco="3 · Cargas de ensaio (LED 12 V)", critico=True,
         item="Verniz isolante para PCB (conformal coating)",
         qtd="1 frasco",
         espec="Proteção das 2 placas contra condensação. A câmara trabalha a 5 °C "
               "com umidade e o módulo resolve 0,01 mA — fuga por umidade aparece "
               "como corrente de carga.",
         conferir="Verniz acrílico ou de poliuretano para eletrônica. Não usar "
                  "esmalte comum nem silicone spray.",
         busca_ml="verniz conformal coating placa eletrônica",
         busca_ali="PCB conformal coating acrylic spray"),
    dict(id="ELE-06", bloco="3 · Cargas de ensaio (LED 12 V)",
         item="Régua de borne plugável 8 vias 5,08 mm (macho + fêmea)",
         qtd="2 conjuntos",
         espec="Uma régua para os 8 POSITIVOS e outra para os 8 RETORNOS das "
               "posições. Ficam na chapa, do lado de dentro dos prensa-cabos: o "
               "chicote da câmara vira um plugue e a maquete desmonta em dois "
               "movimentos, sem desparafusar 16 bornes.",
         conferir="8 vias, passo 5,08 mm, com trava. ⚠️ As duas réguas são "
                  "SEPARADAS de propósito: uma é potência chaveada de 12 V e a "
                  "outra é o 0 V do shunt — juntar as duas no mesmo borne é o "
                  "caminho mais curto para medir a corrente no lugar errado. "
                  "Com 8 posições o DB25 e o furo de 20 mm SAÍRAM do projeto: os "
                  "16 condutores passam no PG13-2 e no PG9-3 que já existem.",
         busca_ml="borne plugável 8 vias 5.08mm macho fêmea",
         busca_ali="8 pin pluggable terminal block 5.08mm"),
    dict(id="ELE-07", bloco="3 · Cargas de ensaio (LED 12 V)",
         item="Tiras de alumínio (2× barras chatas 210 × 20 mm) — Suporte das Placas",
         qtd="2 tiras",
         espec="Duas tiras de alumínio (barra chata comercial 210 × 20 mm, espessura 1,0 a 2,0 mm) "
               "parafusadas nas cantoneiras CAM-24 das laterais de acrílico. Substitui a antiga chapa "
               "maciça dobrada, deixando a passagem de ar vertical 100% livre.",
         conferir="Duas barras chatas de 210 mm. Podem ser cortadas de barra chata comercial ou retalho "
                  "no próprio SENAI. Furação Ø4,5 mm nas pontas e Ø3,2 mm para os espaçadores M3.",
         busca_ml="barra chata aluminio 3/4 x 1/16",
         busca_ali="aluminum flat bar strip 20mm"),
    dict(id="ELE-08", bloco="3 · Cargas de ensaio (LED 12 V)",
         item="Parafuso M4 × 10 mm + porca (fixação das tiras nas cantoneiras CAM-24)",
         qtd="4 conjuntos",
         espec="Quatro parafusos M4 × 10 mm com porca e arruela para fixar as duas tiras de alumínio "
               "nas 4 cantoneiras CAM-24 coladas no acrílico.",
         conferir="M4 × 10 mm em aço inox ou latão com porca e arruela.",
         busca_ml="parafuso m4 10mm porca",
         busca_ali="M4 10mm screw and nut stainless steel"),
    dict(id="ELE-09", bloco="3 · Cargas de ensaio (LED 12 V)",
         item="Kit 8× Espaçadores M3 (8 a 10 mm) nylon/latão + parafusos M3",
         qtd="8 conjuntos",
         espec="8 espaçadores roscados M3 de 8 mm a 10 mm (nylon ou latão) com parafusos e porcas M3. "
               "Fixam as 2 placas nas tiras de alumínio com 10 mm de vão livre, garantindo isolamento "
               "elétrico das soldas e convecção de ar por baixo da placa.",
         conferir="Espaçadores M3 de 8 ou 10 mm (nylon ou latão com arruela isolante). Evitam qualquer contato "
                  "das soldas e trilhas com o alumínio.",
         busca_ml="espacador sextavado m3 nylon 10mm",
         busca_ali="M3 nylon standoff spacer screws nuts kit"),
    # ================= BLOCO 4 — controle e interface =================
    dict(id="CTR-01", bloco="4 · Controle e interface", critico=True,
         item="Arduino Mega 2560 R3",
         qtd="1",
         espec="Controlador principal. Um só — a lista antiga somava reserva sem necessidade.",
         conferir="Conferir se é R3 com chip ATmega2560 e cabo USB incluso.",
         busca_ml="arduino mega 2560 r3 original",
         busca_ali="Arduino Mega 2560 R3 ATmega2560"),
    dict(id="CTR-02", bloco="4 · Controle e interface",
         item="Adaptador DIN do Mega com bornes parafuso",
         qtd="1",
         espec="Placa de 82 bornes compatível com o Mega, para montar no trilho DIN.",
         conferir="Comprar o conjunto completo (shield + suporte). Não duplicar com o Mega.",
         busca_ml="shield borne parafuso arduino mega 2560 din",
         busca_ali="Arduino Mega 2560 screw terminal shield DIN"),
    dict(id="CTR-03", bloco="4 · Controle e interface", critico=True,
         item="ESP32-WROOM-32U (DevKit 30 pinos, u.FL)",
         qtd="1",
         espec="Gateway Wi-Fi com conector u.FL para antena externa, compatível com a base DNLCB30.",
         conferir="Precisa ser a versão -32U (u.FL), não a -32 com antena de placa.",
         busca_ml="esp32 wroom 32u devkit 30 pinos u.fl",
         busca_ali="ESP32-WROOM-32U devkit 30pin u.FL"),
    dict(id="CTR-04", bloco="4 · Controle e interface",
         item="DNLCB30 — base DIN para ESP32",
         qtd="1",
         espec="Base de bornes para o ESP32, alimentada em 24 V. O ESP32 é peça separada.",
         conferir="Conferir se o anúncio inclui o ESP32 — se incluir, não comprar o CTR-03.",
         busca_ml="dnlcb30 base din esp32",
         busca_ali="DNLCB30 ESP32 DIN rail base"),
    dict(id="CTR-05", bloco="4 · Controle e interface", critico=True,
         item="IHM ES3C28P — ESP32-S3 2,8\" toque, microSD, microfone (LCDWIKI)",
         qtd="1",
         espec="Tela capacitiva com slot microSD integrado. Substitui Nextion e módulo SD separado.",
         conferir="É o modelo ES3C28P da LCDWIKI. Conferir se vem com cabo e suporte.",
         busca_ml="es3c28p esp32-s3 display 2.8 touch",
         busca_ali="LCDWIKI ES3C28P ESP32-S3 2.8 inch touch display"),
    dict(id="CTR-06", bloco="4 · Controle e interface",
         item="Cartão microSD 8–16 GB Classe 10",
         qtd="1",
         espec="Para o slot da ES3C28P — log dos ensaios.",
         conferir="Classe 10. Não precisa de 64 GB; o log é texto.",
         busca_ml="cartão micro sd 16gb classe 10",
         busca_ali="micro SD card 16GB class 10"),
    dict(id="CTR-07", bloco="4 · Controle e interface",
         item="Conversor de nível lógico bidirecional 4 canais",
         qtd="1",
         espec="Conversão 5 V ↔ 3,3 V entre o Mega e a IHM.",
         conferir="Bidirecional (não o de 1 direção). Serve TXB0104 ou similar.",
         busca_ml="conversor nível lógico bidirecional 4 canais 3.3v 5v",
         busca_ali="logic level converter bidirectional 4 channel"),
    dict(id="CTR-08", bloco="4 · Controle e interface",
         item="Módulo RTC DS3231",
         qtd="1",
         espec="Relógio de registro dos ensaios, barramento I²C.",
         conferir="DS3231 (preciso), não DS1307. Conferir se vem com bateria.",
         busca_ml="módulo rtc ds3231",
         busca_ali="DS3231 RTC module"),
    dict(id="CTR-09", bloco="4 · Controle e interface",
         item="Bateria CR2032",
         qtd="1",
         espec="Backup do RTC.",
         conferir="Conferir se o módulo aceita pilha não recarregável sem circuito de carga ativo.",
         busca_ml="bateria cr2032",
         busca_ali="CR2032 battery"),

    # ================= BLOCO 5 — sensores e potência =================
    dict(id="POT-01", bloco="5 · Sensores e potência", critico=True,
         item="Módulo N4AIC24 — 22 canais 0–20 mA + 2 canais 0–30 V, RS-485 (eletechsup)",
         qtd="1",
         espec="É O INSTRUMENTO DO PAINEL. Mede as correntes das posições de ensaio "
               "(só 8 dos 22 canais em uso) E as duas tensões do sistema, em um só "
               "módulo: 22 entradas de corrente (0–20 mA) na barra superior e 2 de "
               "tensão (0–30 V) na inferior — V1 lê o 24 V comutado e V2 o 12 V das "
               "posições. É o que dispensa divisor de tensão e mantém A2/A3 do Mega "
               "livres.",
         conferir="É o de 22+2, não o N4AIA08 de 8 canais: o de 8 não mede tensão e "
                  "obrigaria a montar dois divisores de resistor. Confirmar que lê "
                  "abaixo de 4 mA e que o retorno dos 22 canais é um COM único. Pedir "
                  "o mapa de registradores DESTE modelo — o de 24 canais não lê 8 "
                  "registradores a partir de 0x0000.",
         busca_ml="modulo aquisição 24 canais corrente 0-20ma rs485 modbus",
         busca_ali="N4AIC24 24 channel 0-20mA acquisition module RS485 Modbus"),
    dict(id="POT-03", bloco="5 · Sensores e potência", critico=True,
         item="DS18B20 à prova d'água + adaptador com pull-up 4,7 kΩ",
         qtd="1 kit",
         espec="Uma sonda no dissipador quente, com adaptador AD-1 já com o pull-up.",
         conferir="Comprar o kit (sonda + adaptador). Não somar outra sonda solta.",
         busca_ml="ds18b20 à prova d'água com adaptador",
         busca_ali="DS18B20 waterproof probe with adapter module"),
    dict(id="POT-04", bloco="5 · Sensores e potência", critico=True,
         item="Driver ponte-H BTS7960 (IBT-2)",
         qtd="2",
         espec="BTS1 para o par Peltier (24 V / 6 A) e BTS2 para o PTC. Uma placa por função.",
         conferir="Módulo BTS7960 de 43 A. Conferir se vem com dissipador montado.",
         busca_ml="driver bts7960 43a ponte h",
         busca_ali="BTS7960 43A motor driver module"),
    dict(id="POT-05", bloco="5 · Sensores e potência",
         item="Suporte SPCI4 para trilho DIN (placa BTS7960)",
         qtd="2",
         espec="Um suporte por placa BTS7960.",
         conferir="Conferir o passo dos furos da placa real antes de comprar.",
         busca_ml="suporte spci4 trilho din placa",
         busca_ali="SPCI4 DIN rail mounting bracket"),

    dict(id="POT-06", bloco="5 · Sensores e potência",
         item="Módulo MAX485 TTL ↔ RS-485",
         qtd="1",
         espec="Interface entre o Mega e o N4AIC24. RO→D15 (RX3), DI→D14 (TX3), "
               "DE/RE→D26, A/B no par trançado do módulo. Um só serve: o módulo tem "
               "um endereço. Precisa de R13 (10 kΩ) do DE/RE para o 0 V.",
         conferir="Módulo com borne A/B. Se o DE e o /RE vierem em pinos separados, "
                  "amarre os dois no mesmo borne. Serve o MAX485 clássico; não precisa "
                  "de versão isolada nesta distância (< 1 m dentro do painel).",
         busca_ml="módulo max485 ttl rs485",
         busca_ali="MAX485 TTL to RS485 module"),
    # ================= BLOCO 6 — comando e proteção =================
    dict(id="CMD-01", bloco="6 · Comando e proteção", critico=True,
         item="KM1 — relé 8 pinos 24 Vcc + base DIN",
         qtd="1",
         espec="Relé com 2 contatos reversíveis: um para a potência (6 A em 24 Vcc) e um "
               "para o selo. Base inclusa.",
         conferir="Confirmar capacidade de interrupção em 24 Vcc sob a carga real. "
                  "Não trocar por relé de um contato mantendo o mesmo selo.",
         link_ml="https://lista.mercadolivre.com.br/rele-ly2n-24vcc-com-base-din-ptf08a",
         link_ali="https://www.aliexpress.com/w/wholesale-LY2NJ-24VDC-relay-with-socket-base.html",
         nota_link="busca salva no projeto — LY2N 24 Vcc + base PTF08A"),
    dict(id="CMD-02", bloco="6 · Comando e proteção",
         item="Módulo relé 1 canal 5 V optoacoplado",
         qtd="3",
         espec="KA1 (veto do firmware, NA), KA2 (ventoinhas do radiador, NF) e KA3 "
               "(5 ventoinhas internas, NA). Com jumper H/L.",
         conferir="Optoacoplado, com jumper de nível. Conferir se o contato é NA/NC conforme a função.",
         link_ml="https://produto.mercadolivre.com.br/MLB-2149591414-modulo-rele-1-canal-5v-para-arduino-pic-raspberry-_JM",
         nota_link="anúncio salvo no projeto em 23/10 — confirmar preço"),
    dict(id="CMD-03", bloco="6 · Comando e proteção", critico=True,
         item="Botão de emergência cogumelo 22 mm com trava",
         qtd="1",
         espec="Conjunto com 2 contatos NF separados: um corta o comando 24 V, o outro o Mega lê.",
         conferir="Precisa dos DOIS blocos NF. Se o anúncio só trouxer um, comprar o bloco avulso.",
         busca_ml="botão emergência cogumelo 22mm com trava 2 nf",
         busca_ali="22mm emergency stop button 2NC"),
    dict(id="CMD-04", bloco="6 · Comando e proteção",
         item="Botão START / LIGAR 22 mm verde",
         qtd="1",
         espec="Momentâneo, com 1 contato NA para o selo do KM1.",
         conferir="Momentâneo (não retenção). Verde.",
         busca_ml="botão pulsador 22mm verde 1 na",
         busca_ali="22mm green push button 1NO momentary"),
    dict(id="CMD-05", bloco="6 · Comando e proteção",
         item="Botão STOP 22 mm preto",
         qtd="1",
         espec="Momentâneo, 1 NF para a potência e 1 NA para leitura do Mega.",
         conferir="Precisa dos dois contatos — conferir o que vem no conjunto.",
         busca_ml="botão pulsador 22mm preto 1 nf 1 na",
         busca_ali="22mm black push button 1NO 1NC"),
    dict(id="CMD-06", bloco="6 · Comando e proteção",
         item="Sinaleiro LED 22 mm 5 V",
         qtd="4",
         espec="H1 verde, H2 azul, H3 amarelo, H4 vermelho. Aceso direto pelo pino do Arduino.",
         conferir="Tem que ser de 5 V (não 24 V). Conferir a corrente para o pino.",
         busca_ml="sinaleiro led 22mm 5v",
         busca_ali="22mm LED pilot light 5V"),
    dict(id="CMD-07", bloco="6 · Comando e proteção",
         item="Disjuntor bipolar DIN 2P",
         qtd="1",
         espec="Q0 na entrada AC, acumulando proteção e chave geral.",
         conferir="Corrente e curva a dimensionar pela fonte e pelo cabo — o C6 do desenho "
                  "é referência preliminar, não comprar por suposição.",
         busca_ml="disjuntor din 2p curva c",
         busca_ali="DIN rail circuit breaker 2P C curve"),
    dict(id="CMD-08", bloco="6 · Comando e proteção",
         item="Porta-fusível DIN 1 via com gaveta (ramais DC)",
         qtd="3",
         espec="F1 10 A é referência legada da Peltier. F2/T2 e F3/T3 precisam "
               "de dimensionamento pela corrente real, condutores e modelo selecionado.",
         conferir="Não comprar os valores legados de F2/F3. Confirmar tensão, "
                  "capacidade de interrupção DC e coordenação de cada ramal.",
         busca_ml="porta fusível din 1 via gaveta",
         busca_ali="DIN rail fuse holder 1 pole"),
    dict(id="CMD-09", bloco="6 · Comando e proteção",
         item="Fusíveis para F1/F2/F3 — valores e formato pendentes",
         qtd="a dimensionar",
         espec="F1 10 A é apenas referência legada; F2/F3 dependem dos conversores "
               "e dos condutores selecionados. A proteção de saída/corte do PTC é separada.",
         conferir="Não comprar valores antigos sem cálculo, ficha DC e coordenação "
                  "com os cabos e porta-fusíveis reais.",
         busca_ml="fusível vidro 5x20 10a",
         busca_ali="glass fuse 5x20 10A"),
    dict(id="CMD-10", bloco="6 · Comando e proteção", critico=True,
         item="Placa de distribuição 8 canais com chave + porta-fusível (trilho DIN)",
         qtd="1",
         espec="MODELO ESCOLHIDO: placa de 8 posições em trilho DIN, FR-4 dupla face, "
               "5–32 V AC/DC, 5 A por canal, com chave liga/desliga e LED indicador "
               "por canal, porta-fusível de lâmina (vem com 5 A). Entrada de 30 A por "
               "posição, borne 7,62 mm, 26–10 AWG. É ela que demonstra a falha: "
               "desliga a chave da posição 3 e o canal I3 cai a 0,00 mA.",
         conferir="⭐ TROCAR OS 8 FUSÍVEIS DE 5 A POR 1 A (o menor em ATO/ATC; 2 A "
                  "serve se não achar 1 A). A posição puxa ~10 mA, então o fusível "
                  "protege o cabo, não o LED. ⚠️ Os 8 bornes n− SAEM VAZIOS: o "
                  "retorno da posição tem que passar pelo canal I_n do módulo, senão "
                  "a corrente desvia do shunt e o canal lê zero para sempre. O GND "
                  "da placa (entrada) alimenta só os LEDs indicadores.",
         busca_ml="placa distribuição fusível 8 vias trilho din com chave",
         busca_ali="8 way fuse block DIN rail with switch each channel"),
    dict(id="CMD-12", bloco="6 · Comando e proteção",
         item="Fusíveis de lâmina ATO/ATC 1 A (para o CMD-10)",
         qtd="10 (8 + 2 de reserva)",
         espec="Substituem os 5 A que vêm de fábrica na placa de distribuição. "
               "Cada posição de ensaio puxa ~10 mA em 12 V, então 1 A é o menor "
               "fusível de lâmina que existe — e já é 100× a carga.",
         conferir="ATO/ATC (lâmina média, 19 mm). 2 A serve se não achar 1 A, mas "
                  "não suba mais que isso: acima de 2 A o fusível deixa de proteger "
                  "o cabo de 0,5 mm². Comprar em par — fusível de lâmina não se "
                  "conserta.",
         busca_ml="fusível lâmina ato 1a",
         busca_ali="ATO blade fuse 1A assortment"),
    dict(id="CMD-11", bloco="6 · Comando e proteção",
         item="Barra de terra PE para painel",
         qtd="1",
         espec="Ao menos 4 conexões: entrada PE, fonte, gabinete e porta.",
         conferir="PE não é 0 V. Incluir a ligação flexível da porta.",
         busca_ml="barra de terra painel elétrico cobre",
         busca_ali="PE earth bar terminal block"),

    # ================= BLOCO 7 — alimentação =================
    dict(id="ALI-01", bloco="7 · Alimentação", critico=True,
         item="Fonte chaveada 24 Vcc 10 A / 240 W",
         qtd="1",
         espec="PS1 dentro do painel. Alimenta todo o barramento de 24 V.",
         conferir="Confirmar corrente simultânea, dimensões e ventilação. "
                  "O consumo do simulador é estimativo; confirmar perdas e corrente "
                  "de entrada dos conversores escolhidos.",
         link_ml="https://www.mercadolivre.com.br/fonte-chaveada-24v-10a-240w-bivolt-gabinete-metal-colmeia/up/MLBU2208031138",
         nota_link="anúncio salvo no projeto em 23/10 — confirmar preço"),
    dict(id="ALI-02", bloco="7 · Alimentação",
         item="T2/T3 — conversores propostos, modelos não aprovados",
         qtd="2",
         espec="T2: 24→5,0 V/5 A; T3: 24→12 V/20 A (capacidades propostas, "
               "não confirmadas por fichas).",
         conferir="Não comprar até confirmar modelo, faixa máxima/transientes de "
                  "entrada de T2 e capacidade contínua/térmica de T3."),

    # ================= BLOCO 8 — comunicação =================
    dict(id="COM-01", bloco="8 · Comunicação",
         item="Antena 2,4 GHz SMA macho 3 dBi articulável",
         qtd="1",
         espec="Antena externa do ESP32.",
         conferir="Conferir se base, pigtail e antena usam o mesmo padrão (SMA ou RP-SMA).",
         busca_ml="antena 2.4ghz sma macho 3dbi",
         busca_ali="2.4GHz antenna SMA male 3dBi"),
    dict(id="COM-02", bloco="8 · Comunicação",
         item="Pigtail IPEX (u.FL) → SMA fêmea de painel, 20–30 cm",
         qtd="1",
         espec="Ligação da placa ao conector de painel.",
         conferir="Comprar o conjunto com conector de painel — evita peça redundante.",
         busca_ml="pigtail ipex u.fl para sma fêmea painel",
         busca_ali="IPEX u.FL to SMA female bulkhead pigtail"),

    # ================= BLOCO 9 — passivos =================
    dict(id="PAS-01", bloco="9 · Passivos",
         item="Capacitor cerâmico 100 nF",
         qtd="2",
         espec="C1/C2 nos bornes A0/A1 dos BTS. Os C3/C4 saíram com o ACS712 e não "
               "voltam: as entradas A2/A3 continuam livres, porque a medição — "
               "corrente e tensão — é toda por Modbus.",
         conferir="Kit de 20 já resolve. Não precisa de reserva extra.",
         link_ml="https://produto.mercadolivre.com.br/MLB-1854298160-kit-20-capacitores-ceramicos-100nf-50v-104-_JM",
         nota_link="anúncio salvo no projeto em 23/10 — confirmar preço"),
    dict(id="PAS-02", bloco="9 · Passivos",
         item="Resistor 10 kΩ ¼ W",
         qtd="6",
         espec="R8/R9 nos BTS, R10/R11/R12 nos relés e R13 no DE/RE do MAX485.",
         conferir="Kit de 50 resolve.",
         link_ml="https://produto.mercadolivre.com.br/MLB-1903672534-kit-50-resistores-10k-ohms-14w-5-_JM",
         nota_link="anúncio salvo no projeto em 23/10 — confirmar preço"),
    dict(id="PAS-03", bloco="9 · Passivos",
         item="Diodo 1N4007",
         qtd="3",
         espec="D1 na bobina do KM1, D2 no radiador, D3 na ventilação interna.",
         conferir="Se o relé do CMD-01 tiver supressor interno apropriado, o D1 externo é dispensável.",
         link_ml="https://produto.mercadolivre.com.br/MLB-3563968257-filtro-diodo-supressor-de-ruido-0-a-24vcc-dds-sibratec-_JM",
         nota_link="alternativa do projeto: supressor de ruído 24 Vcc pronto"),
]

FORNECIDO_SENAI = [
    "Cabos de alimentação e de sinal",
    "Trilho DIN 35 mm",
    "Canaletas perfuradas 30×30 e 25×25",
    "Parafusos, porcas e arruelas",
    "Gabinete/painel 600×800×250 (ou 700×700×250)",
    "Chapa de acrílico (corte da câmara)",
    "Bornes internos de distribuição (BD-24V, BD-POT, BD-5V, BD-AUX, BD-0V)",
]


# --------------------------------------------------------------------------- #
# Infra
# --------------------------------------------------------------------------- #
def slug(t: str) -> str:
    t = unicodedata.normalize("NFKD", t)
    t = "".join(c for c in t if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]+", "-", t.lower()).strip("-")


def hoje() -> str:
    return dt.date.today().isoformat()


def brl(v: float) -> str:
    return f"{v:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def http_get(url: str, timeout: int = 25) -> bytes:
    req = urllib.request.Request(url, headers={
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml,image/*,*/*",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
    })
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def carregar() -> dict:
    if not DADOS.exists():
        itens = []
        for x in SEED:
            it = dict(x)
            it.setdefault("opcoes", [])
            it.setdefault("escolha", None)
            for loja, chave in (("ML", "link_ml"), ("ALI", "link_ali")):
                if it.get(chave):
                    it["opcoes"].append(dict(
                        loja=loja, loja_nome=LOJAS[loja], link=it[chave], preco=None,
                        frete=0.0, vendedor="", foto=None, data=hoje(),
                        obs=it.get("nota_link", "")))
            itens.append(it)
        return {"projeto": "Projeto Integrador — câmara térmica + painel",
                "moeda": "BRL", "atualizado": hoje(),
                "fornecido_senai": FORNECIDO_SENAI, "itens": itens}
    return json.loads(DADOS.read_text(encoding="utf8"))


def salvar(d: dict) -> None:
    d["atualizado"] = hoje()
    DADOS.write_text(json.dumps(d, ensure_ascii=False, indent=1), encoding="utf8")


def achar(d: dict, ident: str) -> dict:
    for it in d["itens"]:
        if it["id"].lower() == ident.lower():
            return it
    raise SystemExit(f"Item não encontrado: {ident}")


def baixar_imagem(url: str, destino: Path) -> str | None:
    try:
        dados = http_get(url, timeout=30)
    except Exception as e:
        print(f"  ! imagem não baixada ({type(e).__name__}): {e}")
        return None
    try:
        from PIL import Image
        im = Image.open(io.BytesIO(dados)).convert("RGB")
        im.thumbnail((900, 900))
        im.save(destino, "JPEG", quality=85)
        return destino.relative_to(BASE).as_posix()
    except Exception as e:
        print(f"  ! imagem baixada mas não convertida ({type(e).__name__}): {e}")
        return None


def og_image(url: str) -> str | None:
    try:
        html = http_get(url, timeout=20).decode("utf8", "ignore")
        m = re.search(r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)',
                      html, re.I)
        return m.group(1) if m else None
    except Exception:
        return None


def ler_preco_do_link(url: str) -> float | None:
    try:
        txt = http_get(url, timeout=20).decode("utf8", "ignore")
    except Exception:
        return None
    for pat in (r'"price"\s*:\s*([0-9]+\.?[0-9]*)',
                r'R\$\s*([0-9]{1,3}(?:\.[0-9]{3})*,[0-9]{2})'):
        m = re.search(pat, txt)
        if m:
            v = m.group(1)
            try:
                return float(v.replace(".", "").replace(",", ".")) if "," in v else float(v)
            except ValueError:
                pass
    return None


def importar_print(origem: Path, ident: str, loja: str) -> str | None:
    try:
        from PIL import Image
    except Exception:
        return None
    if not origem.exists():
        print(f"  ! print não encontrado: {origem}")
        return None
    destino = FOTOS / f"{slug(ident + '-' + loja)}.jpg"
    im = Image.open(origem).convert("RGB")
    im.thumbnail((1400, 1400))
    im.save(destino, "JPEG", quality=85)
    return destino.relative_to(BASE).as_posix()


# --------------------------------------------------------------------------- #
# Comandos
# --------------------------------------------------------------------------- #
def cmd_add(a) -> None:
    d = carregar()
    it = achar(d, a.id)
    loja = a.loja.upper()
    if loja not in LOJAS:
        raise SystemExit(f"Loja inválida: {a.loja} (use ML, ALI, LOCAL ou OUTRO)")
    preco = a.preco if a.preco is not None else ler_preco_do_link(a.link)
    if preco is None:
        print("  ! não consegui ler o preço no link (ML e Ali bloqueiam robô).")
        print("    rode de novo com --preco 189.90")
    op = dict(loja=loja, loja_nome=LOJAS[loja], link=a.link, preco=preco,
              frete=a.frete or 0.0, vendedor=a.vendedor or "", obs=a.obs or "",
              data=hoje(), foto=None)
    if a.img:
        op["foto"] = baixar_imagem(a.img, FOTOS / f"{slug(it['id'] + '-' + loja)}.jpg")
    elif a.print:
        op["foto"] = importar_print(Path(a.print), it["id"], loja)
    else:
        og = og_image(a.link)
        if og:
            op["foto"] = baixar_imagem(og, FOTOS / f"{slug(it['id'] + '-' + loja)}.jpg")
    it["opcoes"] = [o for o in it["opcoes"] if o["loja"] != loja] + [op]
    if not it.get("escolha"):
        it["escolha"] = loja
    salvar(d)
    build(d)
    print(f"  ✓ {it['id']} · {LOJAS[loja]} · "
          + (f"R$ {brl(preco)}" if preco is not None else "preço pendente"))


def cmd_escolher(a) -> None:
    d = carregar()
    it = achar(d, a.id)
    if a.loja.upper() not in [o["loja"] for o in it["opcoes"]]:
        raise SystemExit(f"{a.id} não tem opção {a.loja}")
    it["escolha"] = a.loja.upper()
    salvar(d)
    build(d)
    print(f"  ✓ escolhido: {it['id']} · {LOJAS[it['escolha']]}")


def cmd_print(a) -> None:
    d = carregar()
    it = achar(d, a.id)
    loja = a.loja.upper()
    foto = importar_print(Path(a.arquivo), it["id"], loja)
    for o in it["opcoes"]:
        if o["loja"] == loja:
            o["foto"] = foto
    salvar(d)
    build(d)
    print(f"  ✓ print salvo em {foto}")


def total(d: dict):
    soma, com_preco, pend = 0.0, 0, 0
    for it in d["itens"]:
        op = next((o for o in it["opcoes"] if o["loja"] == it.get("escolha")), None)
        if op and op.get("preco") is not None:
            soma += op["preco"] + (op.get("frete") or 0)
            com_preco += 1
        else:
            pend += 1
    return soma, com_preco, pend


def build(d: dict) -> None:
    soma, com_preco, pend = total(d)
    itens = d["itens"]
    n = len(itens)

    # ---------- markdown ----------
    L = ["# Lista de compras — Projeto Integrador", "",
         f"Atualizado em {dt.date.today().strftime('%d/%m/%Y')} · "
         f"**{com_preco} de {n}** itens com preço · total **R$ {brl(soma)}**", "",
         "> **BLOQUEIO DE COMPRA:** PTC 12 V/50 W e conversores T2 (5 V/5 A) e "
         "T3 (12 V/20 A) são propostas sem modelos/fichas aprovados. Não comprar "
         "nem energizar. Corte DC do PTC, F3, proteção da saída de 12 V e "
         "condutores seguem pendentes; esta lista não autoriza compra.", "",
         "> Não entram na lista porque o SENAI fornece: "
         + "; ".join(d.get("fornecido_senai", FORNECIDO_SENAI)) + ".", ""]
    bloco = None
    for it in itens:
        if it["bloco"] != bloco:
            bloco = it["bloco"]
            L += ["", f"## Bloco {bloco}", "",
                  "| ID | Item | Qtd | Loja | Preço | Link |", "|---|---|---|---|---|---|"]
        if not it["opcoes"]:
            L.append(f"| {it['id']} | {it['item']} | {it['qtd']} | — | a procurar | — |")
        for o in it["opcoes"]:
            marca = "✅ " if it.get("escolha") == o["loja"] else ""
            preco = f"R$ {brl(o['preco'])}" if o.get("preco") is not None else "a confirmar"
            frete = f" + frete R$ {brl(o['frete'])}" if o.get("frete") else ""
            L.append(f"| {marca}{it['id']} | {it['item']} | {it['qtd']} | {o['loja_nome']} | "
                     f"{preco}{frete} | [abrir]({o['link']}) |")
    MD.write_text("\n".join(L) + "\n", encoding="utf8")

    # ---------- html ----------
    out, bloco = [], None
    for it in itens:
        if it["bloco"] != bloco:
            if bloco is not None:
                out.append("</div>")
            bloco = it["bloco"]
            out.append(f'<h2>Bloco {bloco}</h2><div class="grid">')
        ops = []
        for o in it["opcoes"]:
            sel = it.get("escolha") == o["loja"]
            preco = f"R$ {brl(o['preco'])}" if o.get("preco") is not None else "preço a confirmar"
            frete = f'<span class="frete">+ frete R$ {brl(o["frete"])}</span>' if o.get("frete") else ""
            img = (f'<img src="{o["foto"]}" alt="">' if o.get("foto")
                   else '<div class="semfoto">sem foto</div>')
            ops.append(f'''<div class="op{' sel' if sel else ''}">
      <a class="thumb" href="{o['link']}" target="_blank">{img}</a>
      <div class="info">
        <div class="loja">{o['loja_nome']}{' · escolhido' if sel else ''}</div>
        <div class="preco">{preco} {frete}</div>
        {f'<div class="vend">{o["vendedor"]}</div>' if o.get("vendedor") else ''}
        {f'<div class="obs">{o["obs"]}</div>' if o.get("obs") else ''}
        <a class="btn" href="{o['link']}" target="_blank">abrir anúncio</a>
      </div>
    </div>''')
        if not ops:
            ops = ['<div class="op vazio"><div class="info"><div class="loja">a procurar</div>'
                   '</div></div>']
        out.append(f'''<article class="item{' crit' if it.get('critico') else ''}">
    <header><span class="id">{it['id']}</span><h3>{it['item']}</h3><span class="qtd">{it['qtd']}</span></header>
    <p class="espec">{it['espec']}</p>
    <p class="conf"><b>Conferir no anúncio:</b> {it['conferir']}</p>
    <div class="ops">{''.join(ops)}</div>
  </article>''')
    out.append("</div>")

    senai = "".join(f"<li>{x}</li>" for x in d.get("fornecido_senai", FORNECIDO_SENAI))
    doc = f'''<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Compras do projeto — câmara + painel</title>
<style>
:root{{--bg:#f6f7f9;--card:#fff;--ink:#1a1d21;--mut:#5d6673;--line:#e3e7ec;--accent:#0b6bcb;--ok:#1a7f4b;--warn:#b45309}}
*{{box-sizing:border-box}}
body{{margin:0;background:var(--bg);color:var(--ink);font:15px/1.5 "Segoe UI",system-ui,sans-serif}}
header.top{{padding:28px 32px 18px;background:var(--card);border-bottom:1px solid var(--line)}}
h1{{margin:0 0 6px;font-size:22px}}
.sub{{color:var(--mut);font-size:14px}}
.kpis{{display:flex;gap:14px;margin-top:16px;flex-wrap:wrap}}
.kpi{{background:#eef4fb;border:1px solid #d7e6f7;border-radius:10px;padding:10px 16px;min-width:130px}}
.kpi b{{display:block;font-size:20px;color:var(--accent)}}
.kpi span{{font-size:12px;color:var(--mut);text-transform:uppercase;letter-spacing:.04em}}
.senai{{margin:18px 0 0;font-size:13px;color:var(--mut);background:#fbf7ee;border:1px solid #efe2c8;border-radius:10px;padding:12px 16px}}
.senai ul{{margin:6px 0 0;padding-left:18px;columns:2}}
.bloqueio{{margin:18px 0 0;font-size:14px;font-weight:600;color:#7f1d1d;background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:12px 16px}}
main{{padding:8px 32px 60px;max-width:1320px;margin:0 auto}}
h2{{font-size:15px;text-transform:uppercase;letter-spacing:.08em;color:var(--mut);margin:34px 0 12px}}
.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:16px}}
.item{{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px}}
.item.crit{{border-left:4px solid var(--warn)}}
.item header{{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}}
.item h3{{font-size:15px;margin:0;flex:1}}
.id{{font:600 11px/1 ui-monospace,monospace;background:#eef1f5;color:var(--mut);padding:4px 7px;border-radius:6px}}
.qtd{{font-size:12px;color:var(--mut);background:#f2f4f7;padding:3px 8px;border-radius:20px}}
.espec{{font-size:13px;color:#333a44;margin:10px 0 6px}}
.conf{{font-size:12px;color:var(--mut);margin:0 0 12px}}
.ops{{display:flex;flex-direction:column;gap:10px}}
.op{{display:flex;gap:12px;border:1px solid var(--line);border-radius:10px;padding:10px;background:#fbfcfd}}
.op.sel{{border-color:var(--ok);background:#f2fbf6}}
.op.vazio{{opacity:.55;justify-content:center;text-align:center}}
.thumb{{width:96px;height:96px;flex:0 0 96px;border-radius:8px;overflow:hidden;background:#eef1f5;display:block}}
.thumb img{{width:100%;height:100%;object-fit:cover}}
.semfoto{{width:100%;height:100%;display:grid;place-items:center;font-size:11px;color:#9aa4b1}}
.info{{flex:1;min-width:0}}
.loja{{font-size:12px;color:var(--mut);text-transform:uppercase;letter-spacing:.04em}}
.preco{{font-weight:700;font-size:16px;margin:2px 0}}
.frete{{font-weight:400;font-size:12px;color:var(--mut)}}
.vend,.obs{{font-size:12px;color:var(--mut)}}
.btn{{display:inline-block;margin-top:8px;font-size:12px;color:var(--accent);text-decoration:none;border:1px solid #cfe0f4;padding:5px 10px;border-radius:8px;background:#f4f9ff}}
.btn:hover{{background:#e6f1ff}}
</style></head><body>
<header class="top">
  <h1>Compras do projeto — câmara térmica + painel</h1>
  <div class="sub">Cada link salvo vira registro: loja, valor, frete, foto e o que conferir no anúncio.</div>
  <div class="kpis">
    <div class="kpi"><b>{com_preco}/{n}</b><span>itens com preço</span></div>
    <div class="kpi"><b>R$ {brl(soma)}</b><span>total escolhido</span></div>
    <div class="kpi"><b>{pend}</b><span>a procurar</span></div>
    <div class="kpi"><b>{dt.date.today().strftime('%d/%m')}</b><span>atualizado</span></div>
  </div>
  <div class="bloqueio">BLOQUEIO DE COMPRA: PTC 12 V/50 W e conversores T2 (5 V/5 A) e T3 (12 V/20 A) são propostas sem modelos/fichas aprovados. Não comprar nem energizar. Corte DC do PTC, F3, proteção da saída de 12 V e condutores seguem pendentes; esta lista não autoriza compra.</div>
  <div class="senai"><b>O SENAI fornece — fora da lista:</b><ul>{senai}</ul></div>
</header>
<main>{''.join(out)}</main></body></html>'''
    HTML.write_text(doc, encoding="utf8")


def cmd_show() -> None:
    d = carregar()
    soma, com_preco, pend = total(d)
    bloco = None
    for it in d["itens"]:
        if it["bloco"] != bloco:
            bloco = it["bloco"]
            print(f"\n— Bloco {bloco} —")
        ops = ", ".join(f"{o['loja']}:{'R$' + brl(o['preco']) if o.get('preco') else '?'}"
                        for o in it["opcoes"]) or "a procurar"
        print(f"  {it['id']}  {it['item'][:56]:<56} {ops}")
    print(f"\n{com_preco}/{len(d['itens'])} com preço · total R$ {brl(soma)}")


def main() -> None:
    p = argparse.ArgumentParser(description="Banco de compras do projeto")
    sub = p.add_subparsers(dest="cmd", required=True)
    for nome in ("init", "build", "show"):
        sub.add_parser(nome)
    a1 = sub.add_parser("add")
    a1.add_argument("--id", required=True)
    a1.add_argument("--loja", required=True, help="ML, ALI, LOCAL ou OUTRO")
    a1.add_argument("--link", required=True)
    a1.add_argument("--preco", type=float)
    a1.add_argument("--frete", type=float)
    a1.add_argument("--img", help="URL da imagem do produto")
    a1.add_argument("--print", help="caminho de um print do anúncio")
    a1.add_argument("--vendedor")
    a1.add_argument("--obs")
    a2 = sub.add_parser("escolher")
    a2.add_argument("--id", required=True)
    a2.add_argument("--loja", required=True)
    a3 = sub.add_parser("print")
    a3.add_argument("--id", required=True)
    a3.add_argument("--loja", required=True)
    a3.add_argument("--arquivo", required=True)
    a = p.parse_args()
    if a.cmd == "init":
        d = carregar()
        salvar(d)
        build(d)
        print(f"criado: {DADOS.name} ({len(d['itens'])} itens)")
    elif a.cmd == "add":
        cmd_add(a)
    elif a.cmd == "escolher":
        cmd_escolher(a)
    elif a.cmd == "print":
        cmd_print(a)
    elif a.cmd == "build":
        d = carregar()
        build(d)
        print(f"gerado: {MD.name} e {HTML.name}")
    elif a.cmd == "show":
        cmd_show()


if __name__ == "__main__":
    main()
