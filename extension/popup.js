const root = document.getElementById('root')

// ── helpers ──────────────────────────────────────────────
function h(tag, attrs, ...children) {
  const el = document.createElement(tag)
  Object.entries(attrs || {}).forEach(([k, v]) => {
    if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v)
    else el.setAttribute(k, v)
  })
  children.flat().forEach(c => el.append(typeof c === 'string' ? document.createTextNode(c) : c))
  return el
}

function getApiUrl() {
  return new Promise(resolve =>
    chrome.storage.local.get('apiUrl', d => resolve(d.apiUrl || ''))
  )
}
function saveApiUrl(url) {
  return new Promise(resolve => chrome.storage.local.set({ apiUrl: url }, resolve))
}

// ── content script (runs inside Shopee tab) ──────────────
function extractProduct() {
  function meta(p) {
    const e = document.querySelector('meta[property="og:' + p + '"]') ||
              document.querySelector('meta[property="product:' + p + '"]')
    return e ? e.content : ''
  }
  const name = meta('title') || document.title.replace(/\s*[|–|-].*/, '').trim()
  const image = meta('image')
  const desc = meta('description')
  const url = location.href.split('?')[0]
  let price = 0
  const pa = meta('price:amount')
  if (pa) price = Math.round(parseFloat(pa))
  if (!price) {
    try {
      const ld = document.querySelector('script[type="application/ld+json"]')
      if (ld) {
        const d = JSON.parse(ld.textContent)
        if (d.offers && d.offers.price) price = Math.round(parseFloat(d.offers.price))
      }
    } catch (e) {}
  }
  const m = url.match(/[.-](\d{6,12})\.(\d{6,15})(?:[?#]|$)/)
  const id = m ? (m[1] + '-' + m[2]) : Date.now().toString(36)
  return { name, image, desc, url, price, id }
}

// ── views ─────────────────────────────────────────────────
function showLoading() {
  root.innerHTML = '<div id="loading">Đang tải...</div>'
}

function showNotShopee() {
  root.innerHTML = ''
  root.append(
    h('div', { class: 'msg info' }, '⚠️ Vui lòng mở trang sản phẩm Shopee trước.'),
    h('button', { class: 'secondary', onClick: showSetup }, '⚙️ Cài đặt API URL')
  )
}

function showSetup(currentUrl) {
  root.innerHTML = ''
  const input = h('input', { type: 'text', placeholder: 'https://xxx.vercel.app/api/products', value: currentUrl || '' })
  const btn = h('button', {
    onClick: async () => {
      const val = input.value.trim()
      if (!val) return
      await saveApiUrl(val)
      main()
    }
  }, 'Lưu & tiếp tục')

  root.append(
    h('div', { class: 'msg info' }, '🔧 Nhập URL API của trang affiliate:'),
    h('label', {}, 'API URL'),
    input,
    btn,
    h('p', { class: 'setup-note' }, 'Lấy ở trang admin → tab Bookmarklet → mục API URL')
  )
}

function showForm(product, apiUrl) {
  root.innerHTML = ''

  const nameEl = h('input', { type: 'text', value: product.name || '', placeholder: 'Tên sản phẩm' })
  const imgEl = h('input', { type: 'text', value: product.image || '', placeholder: 'https://cf.shopee.vn/...' })
  const priceEl = h('input', { type: 'number', value: product.price || '', placeholder: '0' })
  const origEl = h('input', { type: 'number', value: '', placeholder: '0' })

  const thumb = product.image
    ? h('img', { class: 'thumb', src: product.image })
    : h('div', { class: 'thumb-placeholder' }, '🛍️')

  imgEl.addEventListener('input', () => {
    if (thumb.tagName === 'IMG') thumb.src = imgEl.value
  })

  const msg = h('div', { class: 'msg', style: 'display:none' })

  const btn = h('button', {
    onClick: async () => {
      const name = nameEl.value.trim()
      if (!name) { showMsg(msg, 'err', 'Vui lòng nhập tên sản phẩm'); return }
      btn.disabled = true
      btn.textContent = 'Đang đăng...'
      try {
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: product.id, itemid: 0, shopid: 0,
            name,
            image: imgEl.value.trim(),
            description: product.desc || '',
            price: parseInt(priceEl.value) || 0,
            priceOriginal: parseInt(origEl.value) || 0,
            shopeeUrl: product.url,
          }),
        })
        const text = await res.text()
        if (!text) throw new Error(`HTTP ${res.status} – Response rỗng. Kiểm tra API URL và Vercel logs.`)
        let data
        try { data = JSON.parse(text) }
        catch { throw new Error(`HTTP ${res.status} – Không phải JSON: ${text.slice(0, 80)}`) }
        if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
        showMsg(msg, 'ok', '✓ Đã đăng: ' + data.name)
        btn.textContent = '✓ Thành công!'
      } catch (e) {
        showMsg(msg, 'err', '✗ ' + e.message)
        btn.disabled = false
        btn.textContent = 'Đăng sản phẩm'
      }
    }
  }, 'Đăng sản phẩm')

  const settingsBtn = h('button', { class: 'secondary', onClick: () => showSetup(apiUrl) }, '⚙️ Đổi API URL')

  const imgRow = h('div', { class: 'img-row' })
  const imgInputWrap = h('div', {})
  imgInputWrap.append(h('label', {}, 'LINK ẢNH'), imgEl)
  imgRow.append(thumb, imgInputWrap)

  const priceRow = h('div', { class: 'row' })
  const priceWrap = h('div', {})
  priceWrap.append(h('label', {}, 'GIÁ BÁN (đ)'), priceEl)
  const origWrap = h('div', {})
  origWrap.append(h('label', {}, 'GIÁ GỐC (đ)'), origEl)
  priceRow.append(priceWrap, origWrap)

  root.append(msg, imgRow, h('label', {}, 'TÊN SẢN PHẨM'), nameEl, priceRow, btn, settingsBtn)
}

function showMsg(el, type, text) {
  el.className = 'msg ' + type
  el.textContent = text
  el.style.display = 'block'
}

// ── main ──────────────────────────────────────────────────
async function main() {
  showLoading()
  const apiUrl = await getApiUrl()
  if (!apiUrl) { showSetup(); return }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  const isShopee = tab.url && (tab.url.includes('shopee.vn') || tab.url.includes('shopee.com'))

  if (!isShopee) { showNotShopee(); return }

  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractProduct,
    })
    showForm(results[0].result, apiUrl)
  } catch (e) {
    root.innerHTML = ''
    root.append(h('div', { class: 'msg err' }, '✗ ' + e.message))
  }
}

main()
