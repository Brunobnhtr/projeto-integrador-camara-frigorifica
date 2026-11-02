"""Aplica quantitativos rastreáveis ao planejamento de compras."""
import json, math
from collections import defaultdict

def mapear_cabo_br(func):
    if func in ['pot24', 'srv24', 'aux12', 'log5']:
        return ('vermelho', 'positivo (+Vcc)', 'Alimentação positiva contínua (+24V potência, +24V comando, +12V ou +5V)')
    elif func in ['zero']:
        return ('azul ou preto', '0 Vcc / retorno', 'Retorno de corrente e referência comum 0 Vcc (GND)')
    elif func in ['digital', 'medida']:
        return ('amarelo', 'sinais e comando', 'Sinais digitais, PWM, entradas analógicas (ACS712), 1-Wire, I2C e comando')
    elif func in ['pe']:
        return ('verde/amarelo', 'proteção PE', 'Condutor de proteção e aterramento de segurança interligado à barra PE')
    elif func in ['ac']:
        return ('preto', 'fase AC', 'Alimentação em corrente alternada da rede entre disjuntor Q0 e fonte PS1')
    return ('preto', 'geral', 'Condutor de uso geral')

def aplicar(root, records, add):
    d = json.loads((root / 'tmp/pdfs/dimensionamento_compras.json').read_text(encoding='utf8'))
    for r in records:
        n = r['item']
        if n == 'Base de suporte em madeira de pinus':
            r['espec'] = 'Pinus 1400 × 600 × 18 mm, uma peça apoiada sobre bancada. ' + d['base']['calculo']
            r['nota'] = 'Câmara de acrílico: 290 × 110 × 260 mm, sem envelope externo do kit Peltier. Medir kit antes do corte. Prever cantoneiras/ancoragem do gabinete; não transportar o conjunto segurando só pelo tampo.'
        if n == 'Trilho DIN 35 mm':
            r['qtd'] = '1 barra de 3 m'
            r['espec'] = 'Quatro trechos de 616 mm = 2,464 m úteis. Comprar uma barra contínua de 3 m; se só houver barras de 2 m, comprar duas (4 m). Três barras de 1 m não rendem os quatro cortes. Conferir gabinete antes de cortar.'
        if n == 'Canaleta perfurada 30 × 30 mm':
            r['qtd'] = '3 barras de 2 m'
            r['espec'] = 'Placa: 5,214 m líquidos; compra 6 m (15% de folga). Trechos exclusivos AC também estão incluídos nesta metragem; manter segregação física. Validar ocupação e seção comercial.'
        if n == 'Canaleta perfurada 25 × 25 mm':
            r['qtd'] = '2 barras de 2 m'
            r['espec'] = 'Porta: 2,480 m líquidos; compra 4 m, incluindo perdas/arredondamento. Conferir seção comercial e profundidade da porta.'
        if n == 'Espiral organizador Ø 12 mm':
            r['qtd'] = '2 m'
            r['espec'] = 'Dois trechos estimados de 1 m para chicotes móveis separados da porta. Conferir diâmetro pelo feixe real e raio de curvatura.'
        if n == 'Prensa-cabos do painel':
            r['qtd'] = '3'
            r['situacao'] = 'Conferir diâmetro'
        if n == 'Perfil EPDM tubular autoadesivo 9 × 6 mm':
            r['qtd'] = '1,5 m'
            r['espec'] = 'Perímetro conservador do envelope 290 × 250 mm: 1,08 m; comprar 1,5 m para emenda e ajuste. Conferir vão e compressão da porta.'
        if n == 'Tubo de silicone Ø 4 mm':
            r['qtd'] = '0,5 m'
            r['espec'] = 'Montagem exige 300 mm no respiro. Comprar 0,5 m para corte/encaixe; conferir diâmetros interno/externo e passa-fio.'
        if n == 'Fita adesiva de alumínio 50 mm':
            r['qtd'] = '1 rolo de 20 m'
            r['espec'] = 'Estimativa de faces opacas e dutos ~0,415 m²; fita 50 mm equivale a 8,3 m sem sobreposição. Rolo de 20 m deixa margem para recortes e sobreposições. Não cobrir os vidros de observação.'
        if n == 'Terminais tubulares simples e duplos':
            counts = {}
            for f in d['detalhes']:
                counts[f['secao']] = counts.get(f['secao'], 0) + 2
            r['qtd'] = 'Até 290 pontas'
            r['espec'] = '248 pontas nos 124 fios + terminações de derivações/PE e margem. Estimativa por bitola comercial (arredondar pacote): ' + ', '.join(f'{sec:g} mm²: {math.ceil(q*1.15)}' for sec, q in sorted(counts.items())) + '. Usar terminais ilhós pré-isolados simples ou duplos nos bornes.'
        if n == 'Anilhas de identificação de cabos':
            r['qtd'] = '290 identificações'
            r['espec'] = '124 condutores × 2 pontas = 248 identificações, mais ~15% e derivações. Anilhas tubulares ou impressas nas pontas de cada fio para rastreabilidade de circuito sem depender de cores exóticas de capa.'
        if n == 'Cabo de entrada AC com PE':
            r['qtd'] = '3 m de cabo 3 vias'
            r['situacao'] = 'Seção a dimensionar'
        if n == 'Condutor de proteção e ligação flexível da porta':
            r['qtd'] = '2 m'
            r['espec'] = 'Proposta: dois vínculos de 0,8 m para gabinete/porta, com margem. Verde/amarelo e terminais olhal próprios. Além do PE fonte já contado no modelo. Seção de proteção a dimensionar.'
        if n in ['Cabos de potência 24 V / retorno', 'Cabos de alimentação 5 V / 12 V', 'Cabos de sinais e comandos']:
            r['_remover'] = True
        if n == 'Módulo relé 1 canal 5 V, optoacoplado':
            r['espec'] += ' Montagem direta no trilho DIN conforme definição do usuário; selecionar conjunto mecanicamente compatível. Sem caixa modular C014.'
    records[:] = [r for r in records if not r.get('_remover')]

    # Consolidação técnica por BITOLA e cores padrão do mercado brasileiro (NBR 5410 / IEC 60204-1)
    grupos = defaultdict(lambda: {'condutores': 0, 'bruto_m': 0, 'compra_m': 0, 'funcs': set(), 'desc': ''})
    for c in d['cabos']:
        cor, funcao, desc = mapear_cabo_br(c['func'])
        k = (c['secao'], cor, funcao)
        grupos[k]['condutores'] += c['condutores']
        grupos[k]['bruto_m'] += c['bruto_m']
        grupos[k]['funcs'].add(c['func'])
        grupos[k]['desc'] = desc

    for (sec, cor, funcao), v in sorted(grupos.items(), key=lambda x: (-x[0][0], x[0][1])):
        extra = 2 if sec == 0.75 and cor in ['vermelho', 'azul ou preto'] else (1 if funcao == 'fase AC' else 0)
        compra = round(v['bruto_m'] * 1.15) + extra
        if compra < 1: compra = 1
        name = f'Cabo flexível {sec:g} mm² - {cor}'
        spec = f'{v["condutores"]} condutores no modelo elétrico ({v["desc"]}). Soma de cortes estimados: {v["bruto_m"]:.2f} m (+0,20 m por fio para pontas e 15% de margem). Padrão NBR 5410 / NR-10: cores comerciais básicas (vermelho, preto/azul, amarelo e verde/amarelo), com identificação individual por anilhas numéricas nas duas pontas.'
        if sec == 0.25:
            spec += ' Nota de bancada: pode-se padronizar em 0,50 mm² comercial se for mais acessível no mercado local.'
        add(name, f'{compra} m', spec, 'painel_interativo/scripts/dimensiona_compras.mjs + fiacao.js', 'Cabos - quantitativo estimado', alias='Cabo flexível comercial por bitola', status='Estimativa de compra')
    return d
