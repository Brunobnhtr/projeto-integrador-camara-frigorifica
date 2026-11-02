// Extrator único de dados do anúncio (AliExpress / Mercado Livre).
// Fonte da verdade usada por: bookmarklet do Brave, extração headless e janela robô.
// O arquivo inteiro é UMA expressão de função: () => ({...dados}).
// Retorna: { url, loja, titulo, variacao, preco, frete, freteGratis, freteTexto, foto }
//   frete/freteGratis = null quando a página não mostrou o frete (não sobrescrever).
() => {
  const $ = (sel, raiz = document) => { try { return raiz.querySelector(sel); } catch (e) { return null; } };
  const $$ = (sel, raiz = document) => { try { return Array.from(raiz.querySelectorAll(sel)); } catch (e) { return []; } };
  const limpa = (t) => String(t || '').replace(/\s+/g, ' ').trim();
  const host = location.hostname;
  const loja = /aliexpress/.test(host) ? 'ALI' : /mercadoli[vb]re/.test(host) ? 'ML' : /shopee/.test(host) ? 'SHOPEE' : 'OUTRO';

  // "R$ 1.234,56" -> 1234.56
  const numBR = (texto) => {
    const m = String(texto || '').match(/R\$\s*(\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?|\d+(?:,\d{1,2})?)/);
    return m ? parseFloat(m[1].replace(/\./g, '').replace(',', '.')) : null;
  };
  // Mercado Livre separa reais e centavos em spans (innerText vira "R$1990")
  const valorAndes = (el) => {
    if (!el) return null;
    const fr = $('.andes-money-amount__fraction', el);
    if (!fr) return null;
    const ct = $('.andes-money-amount__cents', el);
    return parseFloat(fr.innerText.replace(/\D/g, '') + '.' + (ct ? ct.innerText.replace(/\D/g, '').padEnd(2, '0') : '00'));
  };

  // ---------- Título ----------
  const titulo = limpa(($('h1.ui-pdp-title') || $('h1[data-pl="product-title"]') || $('h1') || {}).innerText || document.title)
    .replace(/\s*-\s*(AliExpress|Mercado Livre).*$/i, '');

  // ---------- Variação / SKU ----------
  let variacao = '';
  const tituloSku = $('[class*="sku-item--title"],[class*="sku-title"],[class*="sku-property--title"]');
  if (tituloSku && tituloSku.innerText) {
    variacao = limpa(tituloSku.innerText.replace(/Ver mais.*/is, '')).replace(/^(cor|color|tamanho|size|modelo)\s*:\s*/i, '');
  }
  if (!variacao) {
    const selML = $$('.ui-pdp-variations__selected-text, .ui-pdp-variations__label').map(e => limpa(e.innerText)).filter(Boolean);
    variacao = selML.join(' | ');
  }
  if (!variacao) {
    const sel = $('[class*="sku-item--selected"],[class*="sku-property-item--selected"],[class*="slider--active"]');
    if (sel) variacao = limpa(sel.innerText || sel.getAttribute('title') || $('img', sel)?.alt || '');
  }

  // ---------- Preço do SKU selecionado ----------
  let preco = null;
  if (loja === 'ML') {
    preco = valorAndes($('.ui-pdp-price__second-line .andes-money-amount')) ?? valorAndes($('.andes-money-amount'));
  }
  if (preco == null) {
    const pEl = $('[class*="price-default--current"],[class*="price--current"],[class*="product-price-current"],.product-price-value');
    if (pEl) preco = numBR(pEl.innerText) ?? numBR('R$ ' + pEl.innerText.replace(/[^\d.,]/g, ''));
  }

  // ---------- Frete ----------
  // Remove limiares do tipo "Frete grátis acima de R$ 79" para não confundir com o valor do frete.
  const semLimiar = (t) => t.replace(/(acima de|a partir de|em compras (de|acima de)?|pedidos (acima de|de)|compras de)\s*R\$\s*[\d.,]+/gi, ' ');
  const reGratis = /(frete|envio|entrega)\s*(é\s*)?gr[aá]tis|chegar[aá]\s*gr[aá]tis|free shipping|frete\s*:\s*gr[aá]tis/i;
  const blocosFrete = [];
  const seletoresFrete = [
    // AliExpress
    '[class*="dynamic-shipping"]', '[class*="shipping--wrap"]', '[class*="shipping--content"]',
    '[class*="delivery-v2"]', '[class*="delivery--wrap"]', '[data-pl="product-shipping"]',
    // Mercado Livre
    '#shipping_summary', '.ui-pdp-container__row--shipping-summary', '.ui-pdp-shipping', '.ui-pdp-media--shipping',
    '.ui-vpp-shipping', '[class*="shipping-summary"]',
    // genérico (por último)
    '[class*="shipping"]', '[class*="frete"]'
  ];
  const vistos = new Set();
  for (const s of seletoresFrete) {
    for (const el of $$(s)) {
      if (vistos.has(el)) continue;
      vistos.add(el);
      const t = limpa(el.innerText);
      if (t && t.length < 500) blocosFrete.push({ el, t });
    }
  }
  // Fallback: linhas soltas da página que falam de frete
  if (!blocosFrete.length) {
    (document.body.innerText || '').split('\n')
      .filter(l => /frete|envio|entrega|chegar[aá]/i.test(l) && l.length < 200)
      .forEach(l => blocosFrete.push({ el: null, t: limpa(l) }));
  }

  // Valor só conta se estiver colado a uma palavra de frete ("Frete: R$ 12,34", "R$ 12,34 de frete")
  const NUM = 'R\\$\\s*(\\d{1,3}(?:\\.\\d{3})*(?:,\\d{1,2})?|\\d+(?:,\\d{1,2})?)';
  const reValorFrete = [
    new RegExp('(?:frete|envio|entrega|shipping|chegar[aá][^R$]{0,40}?por|receba[^R$]{0,40}?por)\\s*:?\\s*(?:de\\s*)?' + NUM, 'i'),
    new RegExp(NUM + '\\s*(?:de\\s*)?(?:frete|envio|shipping)', 'i')
  ];
  const valorFrete = (texto) => {
    for (const re of reValorFrete) {
      const m = texto.match(re);
      if (m) return parseFloat(m[1].replace(/\./g, '').replace(',', '.'));
    }
    return null;
  };
  const elPreco = $('.ui-pdp-price__second-line, [class*="price-default--current"], [class*="price--current"], [class*="product-price-current"], .product-price-value');

  let frete = null, freteGratis = null, freteTexto = '';
  for (const { el, t } of blocosFrete) {
    if (el && elPreco && el.contains(elPreco)) continue;  // bloco grande que engloba o preço do produto
    const texto = semLimiar(t);
    if (!/frete|envio|entrega|shipping|chegar[aá]|receba/i.test(texto)) continue;
    const valor = (el && valorAndes($('.andes-money-amount', el))) ?? valorFrete(texto);
    if (valor != null && valor > 0) { frete = valor; freteGratis = false; freteTexto = t; break; }
    if (reGratis.test(texto)) { frete = 0; freteGratis = true; freteTexto = t; break; }
  }

  // ---------- Foto da variação ----------
  const altaRes = (src) => String(src || '')
    .replace(/(\.(jpe?g|png|webp))_\d+x\d+[^/]*$/i, '$1')
    .replace(/_\d+x\d+(q\d+)?\.(jpe?g|png|webp)/i, '_960x960q75.$2')
    .replace(/\s+\./g, '.').trim();
  let foto = '';
  const imgSku = $('[class*="sku-item--selected"] img, [class*="slider--active"] img, [aria-checked="true"] img, ' +
                   '[class*="selected"] img[src*="kf/"], [class*="active"] img[src*="kf/"], ' +
                   '.ui-pdp-variations [aria-selected="true"] img, .ui-pdp-thumbnail--SELECTED img');
  if (imgSku && imgSku.src) foto = altaRes(imgSku.src);
  if (!foto) {
    const principal = $('img[class*="magnifier--image"], .gallery-preview-panel img, .image-view--previewBox img, ' +
                        '.ui-pdp-gallery__figure img, .product-img img');
    if (principal) foto = principal.currentSrc || principal.src || principal.getAttribute('data-zoom') || '';
  }
  if (!foto) foto = $('meta[property="og:image"]')?.content || '';

  return { url: location.href, loja, titulo, variacao, preco, frete, freteGratis, freteTexto: freteTexto.slice(0, 160), foto };
}
