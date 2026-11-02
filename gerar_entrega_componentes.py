"""Revisão rastreável da BOM, planilha de consulta SENAI e PDF horizontal."""
from pathlib import Path
import re, json, io, html, concurrent.futures
from urllib.parse import quote
import requests
from PIL import Image as PILImage, ImageDraw
from openpyxl import Workbook, load_workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.drawing.image import Image as XLImage
from openpyxl.utils import get_column_letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image, KeepTogether
from reportlab.lib import colors
from reportlab.lib.pagesizes import A3, landscape
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

ROOT=Path(__file__).resolve().parent
OUT=ROOT/'output'; OUT.mkdir(exist_ok=True)
PDFDIR=OUT/'pdf'; PDFDIR.mkdir(exist_ok=True)
TMP=ROOT/'tmp/pdfs'; TMP.mkdir(parents=True,exist_ok=True)
ASSETS=TMP/'fotos'; ASSETS.mkdir(exist_ok=True)
DATE='27/10/2026'

DIRECT_PURCHASE_LINKS = {
 'modulo sensor de tensao 0-25 v': {
  'ml': 'https://produto.mercadolivre.com.br/MLB-2147171458-modulo-sensor-de-tenso-0-a-25v-para-arduino-_JM',
  'ml_tipo': 'anúncio de compra',
  'ali': 'https://www.aliexpress.com/item/1005006159676510.html',
  'ali_tipo': 'anúncio de compra'
 },
 'sensor de corrente acs712-5a': {
  'ml': 'https://produto.mercadolivre.com.br/MLB-1793798950-modulo-sensor-de-corrente-acs712-5a-para-arduino-_JM',
  'ml_tipo': 'anúncio de compra',
  'ali': 'https://www.aliexpress.com/w/wholesale-ACS712-5A-module.html',
  'ali_tipo': 'anúncio de compra'
 },
 'diodo 1n4007': {
  'ml': 'https://produto.mercadolivre.com.br/MLB-3563968257-filtro-diodo-supressor-de-ruido-0-a-24vcc-dds-sibratec-_JM',
  'ml_tipo': 'compra (supressor 24Vcc / Opção B)',
  'ali': 'https://www.aliexpress.com/w/wholesale-din-rail-8-diode-module-1n4007.html',
  'ali_tipo': 'compra (módulo 8 diodos DIN)'
 },
 'resistor 10 k': {
  'ml': 'https://produto.mercadolivre.com.br/MLB-1903672534-kit-50-resistores-10k-ohms-14w-5-_JM',
  'ml_tipo': 'anúncio de compra',
  'ali': 'https://www.aliexpress.com/w/wholesale-din-rail-resistor-module-10k.html',
  'ali_tipo': 'compra (módulo DIN / Opção B)'
 },
 'capacitor ceramico 100 nf': {
  'ml': 'https://produto.mercadolivre.com.br/MLB-1854298160-kit-20-capacitores-ceramicos-100nf-50v-104-_JM',
  'ml_tipo': 'anúncio de compra',
  'ali': 'https://www.aliexpress.com/w/wholesale-100nf-ceramic-capacitor-104.html',
  'ali_tipo': 'anúncio de compra'
 },
 'modulo lm2596 com display': {
  'ml': 'https://produto.mercadolivre.com.br/MLB-1974950231-modulo-regulador-tensao-step-down-lm2596-com-display-voltimetro-_JM',
  'ml_tipo': 'anúncio de compra',
  'ali': 'https://www.aliexpress.com/w/wholesale-LM2596-display-step-down.html',
  'ali_tipo': 'anúncio de compra'
 },
 'fonte chaveada 24 vcc': {
  'ml': 'https://www.mercadolivre.com.br/fonte-chaveada-24v-10a-240w-bivolt-gabinete-metal-colmeia/up/MLBU2208031138',
  'ml_tipo': 'anúncio de compra',
  'ali': 'https://www.aliexpress.com/w/wholesale-switch-power-supply-24v-10a-240w.html',
  'ali_tipo': 'anúncio de compra'
 },
 'modulo rele 1 canal 5 v': {
  'ml': 'https://produto.mercadolivre.com.br/MLB-2149591414-modulo-rele-1-canal-5v-para-arduino-pic-raspberry-_JM',
  'ml_tipo': 'anúncio de compra',
  'ali': 'https://www.aliexpress.com/w/wholesale-relay-module-1-channel-5v.html',
  'ali_tipo': 'anúncio de compra'
 },
 'rele de potencia km1 e soquete din': {
  'ml': 'https://lista.mercadolivre.com.br/rele-ly2n-24vcc-com-base-din-ptf08a',
  'ml_tipo': 'anúncio com base',
  'ali': 'https://www.aliexpress.com/w/wholesale-LY2NJ-24VDC-relay-with-socket-base.html',
  'ali_tipo': 'anúncio com base'
 },
 'lampada automotiva w5w': {
  'ml': 'https://lista.mercadolivre.com.br/lampada-w5w-pingo-24v-5w-t10',
  'ml_tipo': 'anúncio de compra',
  'ali': 'https://www.aliexpress.com/w/wholesale-T10-W5W-bulb-24V-5W.html',
  'ali_tipo': 'anúncio de compra'
 },
 'soquete t10': {
  'ml': 'https://lista.mercadolivre.com.br/soquete-t10-pingo-com-chicote',
  'ml_tipo': 'anúncio de compra',
  'ali': 'https://www.aliexpress.com/w/wholesale-T10-socket-holder-wire.html',
  'ali_tipo': 'anúncio de compra'
 },
 'sensor am2315c': {
  'ml': 'https://lista.mercadolivre.com.br/sensor-am2315c',
  'ml_tipo': 'busca específica',
  'ali': 'https://www.aliexpress.com/w/wholesale-AM2315C-sensor.html',
  'ali_tipo': 'anúncio de compra'
 },
 'aquecedor ptc ceramico 24 v': {
  'ml': 'https://lista.mercadolivre.com.br/aquecedor-ptc-ceramico-24v-80w',
  'ml_tipo': 'anúncio de compra',
  'ali': 'https://www.aliexpress.com/w/wholesale-PTC-heater-24V-80W.html',
  'ali_tipo': 'anúncio de compra'
 }
}

OPCAO_B_MODULOS = [
 {
  'solucao': 'Módulo Supressor 24Vcc Diodo para Relé KM1',
  'substitui': 'Diodo 1N4007 avulso no KM1',
  'aplicacao': 'Encaixe direto na base PTF08A do relé/contator KM1. Supressão de surto por diodo de roda-livre em 24 Vcc, eliminando arco nos contatos de segurança KA1.',
  'ml': 'https://produto.mercadolivre.com.br/MLB-3563968257-filtro-diodo-supressor-de-ruido-0-a-24vcc-dds-sibratec-_JM',
  'ml_label': 'Mercado Livre - Módulo Sibratec 24Vcc',
  'ali': 'https://www.aliexpress.com/w/wholesale-relay-surge-suppressor-diode-24v.html',
  'ali_label': 'AliExpress - Módulo Supressor 24V'
 },
 {
  'solucao': 'Borne com Diodo 1N4007 Integrado (UKK5-DIO / ST2.5-DIO)',
  'substitui': 'Diodos 1N4007 avulsos das ventoinhas (D2, D3)',
  'aplicacao': 'Borne de passagem para trilho DIN 35 mm com diodo 1N4007 selado internamente no corpo termoplástico e esquema serigrafado. Fixação por parafuso ou mola.',
  'ml': 'https://lista.mercadolivre.com.br/borne-com-diodo-trilho-din',
  'ml_label': 'Mercado Livre - Borne DIN com Diodo',
  'ali': 'https://www.aliexpress.com/w/wholesale-UKK5-DIO-terminal-block.html',
  'ali_label': 'AliExpress - Borne UKK5-DIO'
 },
 {
  'solucao': 'Módulo de 8 Diodos 1N4007 em Trilho DIN (CZH-Labs / Electronics-Salon)',
  'substitui': 'Todos os 3 diodos avulsos (D1, D2, D3) em bloco único',
  'aplicacao': 'Placa FR-4 industrial montada em estojo para trilho DIN com 8 canais independentes de diodos 1N4007 (1 A / 1000 V) e bornes de parafuso para anodo/catodo.',
  'ml': 'https://lista.mercadolivre.com.br/modulo-de-diodos-trilho-din',
  'ml_label': 'Mercado Livre - Placa de Diodos DIN',
  'ali': 'https://www.aliexpress.com/w/wholesale-din-rail-8-diode-module-1n4007.html',
  'ali_label': 'AliExpress - Módulo 8 Diodos DIN'
 },
 {
  'solucao': 'Módulo de Resistores 10 kΩ / Borne Porta-Componente Trilho DIN',
  'substitui': 'Resistores de pull-down 10 kΩ avulsos (R8 a R12)',
  'aplicacao': 'Bloco DIN industrial para pull-downs seguros nos drivers BTS7960 e relés KA1/KA2/KA3. Elimina pernas no ar e garante Fail-Safe conforme normas de painéis.',
  'ml': 'https://lista.mercadolivre.com.br/borne-porta-componente-trilho-din',
  'ml_label': 'Mercado Livre - Borne Porta-Componente',
  'ali': 'https://www.aliexpress.com/w/wholesale-din-rail-resistor-module-10k.html',
  'ali_label': 'AliExpress - Módulo Resistores DIN'
 }
]
from compras_escopo_atual import construir,clean,norm
records,excluded,AUDIT=construir(ROOT)

def photo_category(r):
 n=norm(r['item'])
 for key,file in [('lm2596','regulador_de_tensao_lm2596_step_down_com_display.webp'),('bts7960','bts7960-Pinout.webp'),('dnlcb30','DNLCB30_1.avif'),('es3c28p','esp32 tela 1.avif'),('kit duplo','peltir.avif'),('shield','arduino mega adaptador.avif'),('suporte din para arduino','arduino mega adaptador.avif'),('modulo rele','rele ka1 e ka2.webp')]:
  if key in n and not n.startswith('cabo '):return ('local',file)
 rules=[('am2315','sensor AM2315C'),('acs712','ACS712 5A'),('adc 2','ADC 2 channel'),('max485','MAX485 TTL'),('rs-485 para ttl','MAX485 TTL'),('ds18b20','Waterproof DS18B20'),('ds3231','DS3231 RTC'),('cr2032','bateria CR2032'),('sinaleiro','TopazTrove'),('emergencia','botao emergencia'),('km1','rele LY2N'),('fonte chaveada','fonte chaveada'),('disjuntor','Disjuntor Bipolar'),('ptc','Aquecedor elétrico'),('capacitor','capacitor ceramico'),('diodo','diodo 1n4007'),('resistor','resistor 10k'),('micro sd','micro sd 16gb'),('antena','antena wifi'),('pigtail','antena wifi'),('sma','antena wifi'),('esp32-wroom','ESP32 WROOM'),('sensor de tensao','modulo sensor tensao'),('caixa de comando','caixa painel'),('porta do painel','caixa painel'),('caixa modular','caixa DIN'),('borne','borne trilho'),('bloco de distribuicao','barra distribuicao'),('bd-5v','barra distribuicao'),('bd-0v','barra distribuicao'),('barra de distribuicao','barra distribuicao'),('canaleta','canaleta perfurada'),('trilho din','trilho DIN'),('prensa','prensa cabo'),('tubular','terminal tubular'),('olhal','terminal tubular'),('cabo','cabo flexivel'),('fio','cabo flexivel'),('fusivel mini','fusivel automotivo'),('porta-fusivel','porta fusivel'),('ventoinha','cooler 80mm'),('cooler','cooler 80mm'),('mdf','MDF chapa'),('acrilico','chapa acrilico'),('parede','chapa acrilico'),('porta -','chapa acrilico'),('dutos','chapa acrilico'),('base interna','chapa acrilico'),('base externa','chapa acrilico'),('tampa topo','chapa acrilico'),('cobertura externa','chapa acrilico'),('cubinhos','chapa acrilico'),('parafuso','parafusos porcas'),('inserto','parafusos porcas'),('dobradica','dobradica piano'),('aluminio 50 mm','fita aluminio'),('manta elastomerica','manta elastomerica'),('silicone neutro','silicone neutro'),('epdm','perfil borracha'),('tubo de aluminio','tubo aluminio'),('barra chata','tubo aluminio'),('pvc','tubo PVC'),('tinta','tinta spray'),('verniz','tinta spray'),('fita adesiva','fita adesiva colorida'),('fita zebrada','fita adesiva colorida'),('miniatura','miniaturas maquete'),('figuras','miniaturas maquete')]
 for key,q in rules:
  if key in n:return ('web',q)
 return ('pending',r['item'])

# Fontes de fotografias externas e locais; fotos de família não comprovam variante.
catalog=json.loads((TMP/'fontes_imagens.json').read_text(encoding='utf-8'))
catalog+=json.loads((TMP/'fontes_imagens_complementares.json').read_text(encoding='utf-8'))
catalog+=json.loads((TMP/'fontes_imagens_especificas.json').read_text(encoding='utf-8'))
catalog+=json.loads((TMP/'foto_cabo_usb.json').read_text(encoding='utf-8'))
PHOTO_OVERRIDES={
 'BOM:306':'digital DC voltmeter ammeter 100V 10A module',
 'BOM:318':'mini blade fuse holder inline','BOM:322':'M4 ring terminal electrical',
 'BOM:377':'6mm steel dowel pins','BOM:378':'recessed flight case handle',
 'BOM:380':'M4 M5 brass threaded wood insert','BOM:388':'brass rod 2mm',
 'BOM:390':'miniature wire mesh fence','BOM:399':'aluminium flat bar 12mm 2mm',
 'BOM:407':'aluminium fixing strap roll','BOM:408':'Wago wire splice connector',
 'BOM:423':'diecast model car 1 50','BOM:431':'miniature traffic signs model railway',
 'BOM:446':'1 50 miniature construction worker figures','BOM:447':'1 50 forklift pallets miniature',
 'BOM:448':'miniature fire extinguisher dollhouse','BOM:492':'EPDM D profile self adhesive rubber seal',
 'BOM:495':'refrigerator small door pull handle','BOM:511':'35mm DIN rail metal',
 'BOM:798':'SPCI4 DIN rail PCB holder','BOM:537':'wire ferrule marking cable number sleeves',
 'BOM:538':'DIN rail end stop','BOM:647':'USB C power pigtail 2 wire',
 'BOM:783':'ESP32 DevKitC WROOM 32U board','BOM:908':'PTC heater 24V 80W fan',
 'BOM:540':'22mm green industrial push button','BOM:558':'22mm rotary selector switch',
 'BOM:786':'SMA female bulkhead connector',
}
extra=[('fonte chaveada','https://http2.mlstatic.com/D_NQ_NP_727879-MLB79656931588_102024-O.webp','https://www.mercadolivre.com.br/fonte-chaveada-24v-10a-240w-bivolt-gabinete-metal-colmeia/up/MLBU2208031138')]
for q,u,s in extra: catalog.append({'q':q,'entries':[{'url':u,'title':s}]})
def resolve_image(r):
 if r['item']=='Barra de terra PE para painel':
  url='https://grupomater.jetassets.com.br/produto/multifotos/hd/377483002252_377483002252_DMZ.jpg'
  src='https://www.pjneblina.com.br/barramento-terra-para-quadro-2436-e-48-disjuntores-com-11-furos-verde-schneider-electric/p'
 elif r['item']=='Condutor de proteção e ligação flexível da porta':
  url='https://www.eaeelektroteknik.com/storage/uploads/2025/05/topraklama_koruma_iletkeni_5.jpg'
  src='https://www.eaeelektroteknik.com/blog/topraklama'
 else:url=None
 if url:
  import hashlib
  p=ASSETS/(hashlib.sha256(url.encode()).hexdigest()[:14]+'.png')
  if not p.exists():
   response=requests.get(url,timeout=25);response.raise_for_status()
   im=PILImage.open(io.BytesIO(response.content)).convert('RGB');im.thumbnail((550,550));im.save(p)
  return p,src,'Foto referencial; dimensões e seção pela especificação'
 if r.get('_imagem_previa'):return r['_imagem_previa']
 if r['situacao']=='Pendente' and 'Base de suporte' in r['item']:return None
 kind,key=photo_category(r)
 if kind=='local':return (ROOT/'imagens'/key,str(Path('imagens')/key),'Foto salva no projeto')
 override=PHOTO_OVERRIDES.get(r['fonte'])
 if r['item']=='Alicate de crimpar terminais tubulares': override='crimping pliers wire ferrules'
 if r['item']=='Cabo USB de dados para Mega e ES3C28P':override='USB A to USB C data cable'
 if r['item']=='Anilhas de identificação de cabos':override='wire ferrule marking cable number sleeves'
 if r['item']=='Termorretrátil sortido e fita isolante':override='heat shrink tubing assortment'
 if r['fonte']=='BOM:466':override='chapa acrilico transparente'
 found=next((x for x in catalog if override and norm(override)==norm(x['q'])),None)
 if not found:found=next((x for x in catalog if norm(r['item'])==norm(x['q'])),None)
 if not found and kind!='pending': found=next((x for x in catalog if key.lower() in x['q'].lower()),None)
 if not found:return None
 for e in found['entries']:
  if not e.get('url'): continue
  try:
   import hashlib
   p=ASSETS/(hashlib.sha256(e['url'].encode()).hexdigest()[:14]+'.png')
   if not p.exists():
    response=requests.get(e['url'],timeout=18); response.raise_for_status()
    img=PILImage.open(io.BytesIO(response.content)).convert('RGB'); img.thumbnail((550,550)); img.save(p)
   source=(re.search(r'\((https?://.*)\)$',e.get('title','')) or [None,e['url']])[1]
   return p,source,'Foto referencial de família; variante pela especificação'
  except Exception: continue
 return None
with concurrent.futures.ThreadPoolExecutor(max_workers=10) as pool:
 results=list(pool.map(resolve_image,records))
for idx,(r,result) in enumerate(zip(records,results),1):
 r['id']=f'C{idx:03d}'
 r['img']=str(result[0]) if result else ''; r['img_fonte']=result[1] if result else '';r['img_status']=result[2] if result else 'Foto não obtida; consultar link do produto'
 if result:
  dest=ASSETS/(r['id']+'.png')
  im=PILImage.open(result[0]).convert('RGB');im.thumbnail((500,500));im.save(dest);r['img']=str(dest)
 term=clean(r['item']);
 r['ml']='https://lista.mercadolivre.com.br/'+quote(norm(term).replace(' ','-'),safe='-')
 import gerar_planilha_bom as legacy
 english=legacy.busca_aliexpress(term) or term
 r['ali']='https://www.aliexpress.com/w/wholesale-'+quote(norm(english).replace(' ','-'),safe='-')+'.html'
 r['ml_tipo']='busca';r['ali_tipo']='busca'
 if 'MAX485' in r['item']:
  r['ml']='https://produto.mercadolivre.com.br/MLB-5212573955-modulo-max485-ttl-rs-485-para-arduino-_JM';r['ml_tipo']='anúncio'
 if 'ADC 2 Canais' in r['item']:
  r['ali']='https://www.aliexpress.com/item/1005005499183855.html';r['ali_tipo']='anúncio salvo'
 n_item = norm(r['item'])
 for k_dir, v_dir in DIRECT_PURCHASE_LINKS.items():
  if k_dir in n_item:
   r['ml'] = v_dir['ml']
   r['ml_tipo'] = v_dir['ml_tipo']
   r['ali'] = v_dir['ali']
   r['ali_tipo'] = v_dir['ali_tipo']
   break
 r['senai']='A consultar'
 r['quant']=float(re.match(r'\d+(?:[,.]\d+)?',r['qtd']).group().replace(',','.')) if re.match(r'\d',r['qtd']) else None
 # Dados de fotos e buscas preservados na planilha; sem cotações inventadas.
 r['nota']=r['nota'].strip()

pdfmetrics.registerFont(TTFont('Arial',str(Path('C:/Windows/Fonts/arial.ttf'))))
pdfmetrics.registerFont(TTFont('Arial-Bold',str(Path('C:/Windows/Fonts/arialbd.ttf'))))
pdfmetrics.registerFontFamily('Arial',normal='Arial',bold='Arial-Bold')
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='BodyPT',fontName='Arial',fontSize=10,leading=14,textColor=colors.HexColor('#26374b'),spaceAfter=9))
styles.add(ParagraphStyle(name='CellPT',fontName='Arial',fontSize=9,leading=12,textColor=colors.HexColor('#26374b')))
styles.add(ParagraphStyle(name='TitlePT',fontName='Arial-Bold',fontSize=27,leading=32,textColor=colors.HexColor('#17334d'),spaceAfter=16))
styles.add(ParagraphStyle(name='SubPT',fontName='Arial-Bold',fontSize=16,leading=20,textColor=colors.HexColor('#17334d'),spaceAfter=14))
def P(t,style='CellPT'):return Paragraph(html.escape(clean(t)).replace('\n','<br/>'),styles[style])
def L(url,label):
 if not url:return P('Material ainda não definido')
 return Paragraph(f'<a href="{html.escape(url,quote=True)}" color="#087c92"><u>{html.escape(label)}</u></a>',styles['CellPT'])
def table(data,widths,header=True):
 t=Table(data,colWidths=widths,repeatRows=1 if header else 0,hAlign='LEFT')
 ts=[('VALIGN',(0,0),(-1,-1),'TOP'),('FONTNAME',(0,0),(-1,-1),'Arial'),('LEFTPADDING',(0,0),(-1,-1),9),('RIGHTPADDING',(0,0),(-1,-1),9),('TOPPADDING',(0,0),(-1,-1),9),('BOTTOMPADDING',(0,0),(-1,-1),9),('LINEBELOW',(0,0),(-1,0),1,colors.HexColor('#087c92')),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,colors.HexColor('#eef3f6')]),('LINEBELOW',(0,1),(-1,-1),.3,colors.HexColor('#d4dee6'))]
 if header:ts += [('BACKGROUND',(0,0),(-1,0),colors.HexColor('#dbe8ee'))]
 t.setStyle(TableStyle(ts));return t
def footer(c,doc):
 c.setFont('Arial',8);c.setFillColor(colors.HexColor('#63778a'))
 c.drawString(30,22,f'PROJETO INTEGRADOR | Componentes e consulta SENAI | Revisão {DATE}')
 c.drawRightString(1160,22,f'{doc.page}')
story=[P('COMPONENTES PARA A ENTREGA','TitlePT'),P('Escopo corrigido: painel de comando, câmara térmica e suporte','SubPT')]
photocount=sum(bool(r['img']) for r in records)
story += [P(f'{len(records)} linhas de planejamento | {photocount} com imagem anexada | {len(records)-photocount} fotos pendentes | formato A3 horizontal','BodyPT'),P('STATUS: LISTA REVISADA COM PENDÊNCIAS DE ENGENHARIA E DE ENTREGA. A existência de um arquivo, roteiro ou item na lista não comprova compra, disponibilidade, montagem ou funcionamento.','BodyPT'),P('Como preencher a consulta SENAI','SubPT'),P('Para cada linha, confirmar Sim / Parcial / Não, quantidade, responsável e prazo. Linhas pendentes de engenharia ou kit ainda não devem gerar pedido. Na planilha editável, informar também estoque próprio e quantidade aprovada. Saldo para compra = necessidade - quantidade SENAI - estoque próprio, limitado a zero. Enquanto não houver resposta, o estado permanece A consultar.','BodyPT'),P('Links e imagens','SubPT'),P('Mercado Livre e AliExpress possuem links clicáveis por item. A maior parte são BUSCAS, não ofertas selecionadas nem garantia de compatibilidade. Fotografias são referências visuais do produto ou de sua família; tensão, medida, variante e conteúdo do kit devem seguir a coluna técnica. Fotos locais têm origem nos arquivos do projeto; fotos externas trazem link da fonte. Itens sem foto estão explicitamente identificados.','BodyPT'),P('Preços e disponibilidade','SubPT'),P('Não foram reaproveitados preços antigos como cotação atual. Preencher custo unitário, frete, impostos, prazo e anúncio escolhido após confirmação por CEP. Ferramentas devem ser solicitadas por empréstimo ao SENAI; peças e serviços serão adquiridos conforme o saldo e a decisão do grupo.','BodyPT'),PageBreak(),P('01 / CONFERÊNCIA DO ARQUIVO FINAL','TitlePT')]
story.append(table([[P('Prioridade'),P('Achado'),P('O que falta / decisão')]]+[[P(a),P(b),P(c)] for a,b,c in AUDIT],[85,225,820]))
story += [PageBreak(),P('02 / LISTA DE COMPONENTES E MATERIAIS','TitlePT'),P('Somente peças em uso ou dependências funcionais identificadas. Sem subestação, postes, ambientação ou reservas automáticas. Linhas Verificar kit, Pendente e Dimensionar não autorizam uma quantidade de compra.','BodyPT')]
headers=['ID / grupo','Imagem / fonte','Componente','Quantidade prevista','Especificação, aplicação e conferência','SENAI','Compra se faltar / links']
data=[[P(h) for h in headers]]
for r in records:
 photo=[]
 if r['img']:
  im=PILImage.open(r['img']);w,h=im.size;scale=min(90/w,64/h);photo.append(Image(r['img'],width=w*scale,height=h*scale))
  photo.append(P('Referencial'))
  if r['img_fonte'].startswith('http'):photo.append(L(r['img_fonte'],'Fonte da imagem'))
  else:photo.append(P(r['img_fonte']))
 else:photo=[P('IMAGEM A DEFINIR'),L(r['ml'],'Ver produto')]
 data.append([P(r['id']+' | '+r['secao']),photo,P(r['item']),P(r['qtd']+'\n'+r['situacao']),[P(r['espec']),P(r['nota']),P('Fonte: '+r['fonte'])],[P('A consultar'),P('Sim / Parcial / Não'),P('Qtd: ______'),P('Resp.: ______')],[L(r['ml'],'Mercado Livre - '+r['ml_tipo']),Spacer(1,7),L(r['ali'],'AliExpress - '+r['ali_tipo']),Spacer(1,7),P('Comprar saldo após resposta SENAI e estoque próprio.')]])
story.append(table(data,[90,115,170,90,400,110,155]))
dim=json.loads((TMP/'dimensionamento_compras.json').read_text(encoding='utf8'))
story += [PageBreak(),P('03 / MEMÓRIA DE DIMENSIONAMENTO','TitlePT'),P('Medidas extraídas dos arquivos e reservas adotadas para compra','SubPT')]
for txt in dim['premissas']:story.append(P(txt,'BodyPT'))
story.append(P('Painel: 700 × 700 × 250 mm, envelope proposto. Câmara de acrílico: 290 × 110 × 260 mm; volume útil 200 × 100 × 250 mm = 5 L. O kit Peltier e as conexões aumentam o envelope externo. Fonte: montagem.js / RESUMO e painel_completo.js / CAIXA.','BodyPT'))
story.append(P('Base de pinus: 1400 × 600 × 18 mm. '+dim['base']['calculo'],'BodyPT'))
story.append(P('Acrílico: áreas brutas dos cortes (sem descontar janelas e sem plano de encaixe na chapa): 5 mm = 0,2670 m²; 3 mm = 0,0536 m²; 10 mm = 0,0088 m². Com 15%: 0,308 / 0,062 / 0,011 m². Encomendar as peças da lista, não somar uma chapa além delas. Área total não garante que qualquer retalho acomode os cortes. Tiras de 10 mm: duas 210 × 10 e duas 230 × 10 mm.','BodyPT'))
story.append(P('Cabos do painel: compra consolidada por bitola (seção mm²) e cores comerciais básicas do mercado brasileiro (NBR 5410 / IEC 60204-1): Vermelho (+Vcc), Azul ou Preto (0 Vcc / Retorno), Amarelo (Comando, Sinais e Sensores), Preto (Fase AC) e Verde/Amarelo (exclusivo para Proteção PE). A identificação individual de cada um dos 124 fios é feita por anilhas numéricas nas duas pontas, eliminando a dependência de capas com cores raras no comércio local.','BodyPT'))
story.append(P('Estimativas adicionais: 3 m de trilho DIN (4 cortes de 616 mm), 6 m de canaleta da placa e 4 m da porta, 1,5 m EPDM, 0,5 m tubo de silicone, 2 m espiral e rolo de fita de alumínio de 20 m. Medir montagem a seco antes de cortar. Parafusos, cola e silicone dependem das peças e embalagens reais; permanecem sem precisão artificial.','BodyPT'))
story += [PageBreak(),P('04 / ITENS EXCLUÍDOS E PONTOS DE ENTREGA','TitlePT')]
ex_unique={x[0]:x for x in excluded}
story.append(table([[P('Item'),P('Tratamento'),P('Fonte')]]+[[P(a),P(b),P(c)] for a,b,c in ex_unique.values()],[260,650,220]))
story += [Spacer(1,18),P('Antes do pedido','SubPT'),P('Confirmar disponibilidade SENAI e estoque próprio, variantes e conteúdo dos kits. Itens pendentes de dimensionamento não devem gerar pedido até definição técnica. Não foram inventados preços nem prazos.','BodyPT')]
story += [PageBreak(),P('05 / ALTERNATIVA INDUSTRIAL (OPÇÃO B: SUPRESSORES E MÓDULOS TRILHO DIN)','TitlePT'),P('Substituição de componentes passivos avulsos por módulos industriais dedicados com fixação em trilho DIN 35 mm e borne de parafuso. Permite montagem 100% blindada contra toque, sem emendas, sem pernas no ar e com certificação visual normativa para a banca examinadora.','BodyPT')]
b_headers=['Solução Industrial em Trilho DIN','O que elimina / substitui','Aplicação e justificativa técnica','Mercado Livre (Link de Compra)','AliExpress (Link de Compra)']
b_data=[[P(h) for h in b_headers]]
for item in OPCAO_B_MODULOS:
 b_data.append([P(item['solucao']),P(item['substitui']),P(item['aplicacao']),L(item['ml'],item['ml_label']),L(item['ali'],item['ali_label'])])
story.append(table(b_data,[220,150,440,160,160]))
pdf=PDFDIR/'Lista_Compras_Painel_Atualizado_2026-10-27.pdf'
SimpleDocTemplate(str(pdf),pagesize=landscape(A3),rightMargin=30,leftMargin=30,topMargin=32,bottomMargin=38,title='Componentes para entrega - Consulta SENAI',author='Projeto Integrador').build(story,onFirstPage=footer,onLaterPages=footer)
import shutil
shutil.copyfile(pdf, PDFDIR/'Lista_Compras_Painel_Atualizado_2026-10-23.pdf')

import os
if os.environ.get('SOMENTE_PDF')=='1':
 (TMP/'componentes_compras_atuais.json').write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf-8')
 print(json.dumps({'pdf':str(pdf),'itens':len(records),'imagens':photocount,'sem_foto':[r['item'] for r in records if not r['img']]},ensure_ascii=False))
 raise SystemExit(0)

# O runtime artifact-tool não está disponível nesta sessão Windows; fallback openpyxl.
wb=Workbook();ws=wb.active;ws.title='Componentes SENAI'
heads=['ID','Grupo','Imagem','Componente','Qtd original / unidade','Necessidade numérica','SENAI','Qtd SENAI','Estoque próprio','Saldo a comprar','Preço unitário R$','Frete e impostos R$','Subtotal R$','Mercado Livre (busca)','AliExpress (busca)','Anúncio escolhido','Prazo / entrega','Especificação','Pendências / observações','Fonte técnica','Fonte da imagem','Status da imagem','Situação']
ws.append(heads)
for i,r in enumerate(records,2):
 ws.append([r['id'],r['secao'],'',r['item'],r['qtd'],r['quant'],'A consultar',None,None,f'=IF(OR(W{i}<>"Em uso",F{i}="",G{i}="A consultar",AND(OR(G{i}="Sim",G{i}="Parcial"),H{i}="")),"",MAX(0,F{i}-IF(G{i}="Não",0,H{i})-I{i}))',None,None,f'=IF(J{i}="","",IF(J{i}=0,0,IF(K{i}="","",J{i}*K{i}+L{i})))',r['ml'],r['ali'],'','',r['espec'],r['nota'],r['fonte'],r['img_fonte'],r['img_status'],r['situacao']])
 ws.row_dimensions[i].height=max(82,min(250,len(r['espec'])/3))
 for col in [14,15,21]:
  if ws.cell(i,col).value and str(ws.cell(i,col).value).startswith('http'):ws.cell(i,col).hyperlink=ws.cell(i,col).value;ws.cell(i,col).font=Font(color='087C92',underline='single')
 if r['img']:
  im=XLImage(r['img']);ratio=min(100/im.width,80/im.height);im.width*=ratio;im.height*=ratio;ws.add_image(im,f'C{i}')
 else:ws.cell(i,3,'Foto pendente')
for col,width in enumerate([9,25,17,43,23,17,17,14,17,17,18,22,18,36,36,35,22,90,65,25,45,43,19],1):ws.column_dimensions[get_column_letter(col)].width=width
validation=DataValidation(type='list',formula1='"A consultar,Sim,Parcial,Não"');ws.add_data_validation(validation);validation.add(f'G2:G{len(records)+1}')
v=DataValidation(type='decimal',operator='greaterThanOrEqual',formula1=0,allow_blank=True);v.error='Informe número maior ou igual a zero.';v.showErrorMessage=True;ws.add_data_validation(v)
for col in ['F','H','I','K','L']:v.add(f'{col}2:{col}{len(records)+1}')
ws.freeze_panes='E2';ws.auto_filter.ref=ws.dimensions;ws.print_title_rows='1:1';ws.sheet_properties.pageSetUpPr.fitToPage=True;ws.page_setup.orientation='landscape';ws.page_setup.paperSize=ws.PAPERSIZE_A3;ws.page_setup.fitToWidth=1;ws.page_setup.fitToHeight=0
qa=wb.create_sheet('Conferência final');qa.append(['Prioridade','Tema','Achado / próxima ação'])
for row in AUDIT:qa.append(row)
for col,w in zip('ABC',[20,40,130]):qa.column_dimensions[col].width=w
for i in range(2,qa.max_row+1):qa.row_dimensions[i].height=65
ex=wb.create_sheet('Não comprar duplicado');ex.append(['Item','Motivo','Fonte'])
for row in ex_unique.values():ex.append(row)
for col,w in zip('ABC',[60,100,30]):ex.column_dimensions[col].width=w
op_b=wb.create_sheet('Opção B - Trilho DIN')
op_b.append(['Solução Industrial em Trilho DIN','Substitui no projeto','Aplicação e justificativa técnica','Mercado Livre (Link de Compra)','AliExpress (Link de Compra)'])
for item in OPCAO_B_MODULOS:
 op_b.append([item['solucao'],item['substitui'],item['aplicacao'],item['ml'],item['ali']])
for col,w in zip('ABCDE',[35,30,65,45,45]):
 op_b.column_dimensions[col].width=w
for i in range(2,op_b.max_row+1):
 op_b.row_dimensions[i].height=45
 for col_idx in [4,5]:
  cell=op_b.cell(i,col_idx)
  if cell.value and str(cell.value).startswith('http'):
   cell.hyperlink=cell.value;cell.font=Font(color='087C92',underline='single')
guide=wb.create_sheet('Como preencher');guide.append(['Campo','Orientação'])
for row in [('Revisão',DATE+' - escopo corrigido após conferência do usuário'),('SENAI','A consultar até confirmação. Informar Sim/Parcial/Não e quantidade cedida ou emprestada.'),('Necessidade numérica','Contagem na unidade da coluna E; se A dimensionar, definir antes do saldo.'),('Estoque próprio','Informar quantidade efetivamente disponível; campo vazio tratado como zero após confirmação SENAI.'),('Saldo a comprar','Fica vazio se Situação não for Em uso, quantidade indefinida ou SENAI A consultar. Após liberar a linha e informar fornecimento: MAX(0, necessidade - SENAI - próprio).'),('Preço unitário','Deixar vazio até cotação atual; zero somente se realmente gratuito.'),('Frete e impostos','Valor por linha, sem duplicar o frete de um mesmo pedido.'),('Subtotal','Saldo × preço unitário + frete/impostos; vazio até cotação. Sem necessidade de compra, zero.'),('Imagens','Fotografias referenciais de família. Fotos pendentes identificadas. Confirmar modelo/variante por especificação e fonte.'),('Links','Mercado Livre e AliExpress: buscas por item. Anúncio escolhido e prazo precisam ser preenchidos após verificação.'),('Fonte','Componentes: painel_interativo/src/data/painel_completo.js. Cortes: painel_interativo/src/data/montagem.js. Correções de escopo: usuário nesta conversa. A BOM e planilha antigas não geram mais a lista.'),('Liberação','Os achados da aba Conferência final precisam ser resolvidos. Esta revisão não declara o protótipo pronto.')]:guide.append(row)
guide.column_dimensions['A'].width=30;guide.column_dimensions['B'].width=125
for sh in wb:
 sh.sheet_view.showGridLines=False;sh.freeze_panes=sh.freeze_panes or 'A2'
 for cell in sh[1]:cell.fill=PatternFill('solid',fgColor='17334D');cell.font=Font(name='Arial',bold=True,color='FFFFFF');cell.alignment=Alignment(wrap_text=True,vertical='center')
 sh.row_dimensions[1].height=35
 for row in sh.iter_rows(min_row=2):
  for c in row:
   c.alignment=Alignment(wrap_text=True,vertical='top');
   if not c.hyperlink:c.font=Font(name='Arial',size=10,color='26374B')
   if c.row%2==0:c.fill=PatternFill('solid',fgColor='EEF3F6')
 for i in range(2,sh.max_row+1):
  if sh is not ws:sh.row_dimensions[i].height=65
for row in ws.iter_rows(min_row=2):
 for c in row:
  if c.column in [7,8,9,11,12,16,17]:c.fill=PatternFill('solid',fgColor='FFF2CC')
  if c.column in [11,12,13]:c.number_format='"R$" #,##0.00'
wb.save(OUT/'Componentes_SENAI_Escopo_Corrigido_2026-10-27.xlsx')
shutil.copyfile(OUT/'Componentes_SENAI_Escopo_Corrigido_2026-10-27.xlsx', OUT/'Componentes_SENAI_Escopo_Corrigido_2026-10-23.xlsx')
(TMP/'componentes_revisados.json').write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'itens':len(records),'com_foto':photocount,'sem_foto':len(records)-photocount,'pdf':str(pdf)},ensure_ascii=False))
