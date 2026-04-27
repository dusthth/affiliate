'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

interface Product {
  id: string
  name: string
  image: string
  description: string
  price: number
  priceOriginal: number
  clicks: number
  shopeeUrl: string
}

const fmt = (n: number) => n.toLocaleString('vi-VN') + 'đ'

function isValidUrl(u: string) {
  try { new URL(u); return true } catch { return false }
}

function makeId(url: string) {
  const m = url.match(/[.-](\d{6,12})\.(\d{6,15})(?:[?#]|$)/)
  return m ? `${m[1]}-${m[2]}` : Date.now().toString(36)
}

const BLANK = { shopeeUrl: '', image: '', name: '', description: '', price: '', priceOriginal: '' }

// ---------- Bookmarklet builder ----------
function buildBookmarklet(apiUrl: string): string {
  const code = `(function(){var A="${apiUrl}";if(!location.hostname.includes("shopee")){alert("Chỉ dùng được trên trang Shopee!");return;}function m(p){var e=document.querySelector('meta[property="og:'+p+'"]')||document.querySelector('meta[property="product:'+p+'"]');return e?e.content:"";}var name=m("title")||document.title.replace(/\\s*[|–-].*/,"").trim(),image=m("image"),desc=m("description"),url=location.href.split("?")[0],price=0,pa=m("price:amount");if(pa)price=Math.round(parseFloat(pa));if(!price){try{var ld=document.querySelector('script[type="application/ld+json"]');if(ld){var d=JSON.parse(ld.textContent);if(d.offers&&d.offers.price)price=Math.round(parseFloat(d.offers.price));}}catch(e){}}var mr=url.match(/[.-](\\d{6,12})\\.(\\d{6,15})(?:[?#]|$)/),id=mr?(mr[1]+"-"+mr[2]):Date.now().toString(36),ex=document.getElementById("__sbm");if(ex)ex.remove();var div=document.createElement("div");div.id="__sbm";div.innerHTML='<div style="position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:16px"><div style="background:#fff;border-radius:16px;padding:24px;width:100%;max-width:400px;font-family:system-ui,sans-serif;box-shadow:0 24px 80px rgba(0,0,0,.3)"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px"><span style="font-size:15px;font-weight:700">🛍️ Thêm sản phẩm</span><span id="__sx" style="cursor:pointer;font-size:22px;color:#aaa;line-height:1">×</span></div><div id="__sm" style="display:none;padding:10px;border-radius:8px;font-size:13px;margin-bottom:12px"></div><div style="display:flex;gap:10px;margin-bottom:12px"><div style="width:64px;height:64px;border-radius:10px;overflow:hidden;background:#f5f5f5;flex-shrink:0"><img id="__sth" style="width:100%;height:100%;object-fit:cover;display:none" src=""></div><div style="flex:1"><div style="font-size:11px;font-weight:700;color:#888;margin-bottom:4px">LINK ẢNH</div><input id="__si" placeholder="https://cf.shopee.vn/..." style="width:100%;box-sizing:border-box;border:1px solid #ddd;border-radius:8px;padding:7px 10px;font-size:12px"></div></div><div style="font-size:11px;font-weight:700;color:#888;margin-bottom:4px">TÊN SẢN PHẨM</div><input id="__sn" style="width:100%;box-sizing:border-box;border:1px solid #ddd;border-radius:8px;padding:8px 12px;font-size:13px;margin-bottom:10px"><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px"><div><div style="font-size:11px;font-weight:700;color:#888;margin-bottom:4px">GIÁ BÁN (đ)</div><input id="__sp" type="number" style="width:100%;box-sizing:border-box;border:1px solid #ddd;border-radius:8px;padding:8px 12px;font-size:13px"></div><div><div style="font-size:11px;font-weight:700;color:#888;margin-bottom:4px">GIÁ GỐC (đ)</div><input id="__so" type="number" style="width:100%;box-sizing:border-box;border:1px solid #ddd;border-radius:8px;padding:8px 12px;font-size:13px"></div></div><button id="__sb" style="width:100%;background:#ee4d2d;color:#fff;border:none;border-radius:10px;padding:11px;font-size:14px;font-weight:700;cursor:pointer">Đăng sản phẩm</button></div></div>';document.body.appendChild(div);var ni=document.getElementById("__sn"),ii=document.getElementById("__si"),th=document.getElementById("__sth"),pi=document.getElementById("__sp"),oi=document.getElementById("__so");ni.value=name;ii.value=image;if(image){th.src=image;th.style.display="block";}pi.value=price||"";ii.addEventListener("input",function(){th.src=ii.value;th.style.display=ii.value?"block":"none";});function close(){div.remove();}document.getElementById("__sx").addEventListener("click",close);div.firstElementChild.addEventListener("click",function(e){if(e.target===this)close();});document.getElementById("__sb").addEventListener("click",function(){var btn=document.getElementById("__sb"),msg=document.getElementById("__sm"),nv=ni.value.trim();if(!nv){msg.textContent="Vui lòng nhập tên sản phẩm";msg.style.cssText="display:block;background:#fee2e2;color:#dc2626;padding:10px;border-radius:8px;font-size:13px;margin-bottom:12px";return;}btn.textContent="Đang đăng...";btn.disabled=true;fetch(A,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:id,itemid:0,shopid:0,name:nv,image:ii.value.trim(),description:desc,price:parseInt(pi.value)||0,priceOriginal:parseInt(oi.value)||0,shopeeUrl:url})}).then(function(r){return r.json();}).then(function(data){if(data.error)throw new Error(data.error);msg.textContent="✓ Đã đăng: "+data.name;msg.style.cssText="display:block;background:#dcfce7;color:#16a34a;padding:10px;border-radius:8px;font-size:13px;margin-bottom:12px";btn.textContent="✓ Thành công!";setTimeout(close,1800);}).catch(function(e){msg.textContent="✗ "+e.message;msg.style.cssText="display:block;background:#fee2e2;color:#dc2626;padding:10px;border-radius:8px;font-size:13px;margin-bottom:12px";btn.textContent="Đăng sản phẩm";btn.disabled=false;});});})();`
  return 'javascript:' + encodeURIComponent(code)
}

// ---------- Bookmarklet setup ----------
function BookmarkletSetup() {
  const [bm, setBm] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setBm(buildBookmarklet(window.location.origin + '/api/products'))
  }, [])

  function copy() {
    navigator.clipboard.writeText(bm)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 space-y-5">
      <h2 className="text-base font-bold text-gray-700">Cài Bookmarklet</h2>

      {/* Step 1 */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#ee4d2d] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>
          <p className="text-sm font-semibold text-gray-700">Copy đoạn code bên dưới</p>
        </div>
        <div className="relative">
          <textarea readOnly value={bm} rows={3}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-mono text-gray-400 resize-none focus:outline-none bg-gray-50" />
          <button onClick={copy}
            className={`absolute right-2 top-2 text-xs border rounded-lg px-3 py-1.5 transition-colors font-semibold ${
              copied ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-600'
            }`}>
            {copied ? '✓ Đã copy' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Step 2 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#ee4d2d] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">2</span>
          <p className="text-sm font-semibold text-gray-700">Thêm vào bookmark (Chrome / Edge)</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm text-gray-600">
          <p>① Chuột phải vào thanh bookmark → <strong>Thêm trang mới</strong></p>
          <p>② Điền tên: <strong>Thêm Shopee</strong></p>
          <p>③ Xoá hết trong ô URL → dán code vừa copy vào → Lưu</p>
        </div>
        <p className="text-xs text-gray-400 px-1">Hoặc chuột phải vào nút bên dưới → <strong>Lưu liên kết dưới dạng dấu trang</strong></p>
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-ignore – javascript: href is intentional for bookmarklet */}
        <a href={bm} onClick={e => e.preventDefault()}
          className="inline-flex items-center gap-2 bg-[#ee4d2d] text-white text-sm font-bold px-5 py-2.5 rounded-xl select-none">
          🛍️ Thêm Shopee
        </a>
      </div>

      {/* How to use */}
      <div className="bg-orange-50 rounded-xl p-4 space-y-1.5">
        <p className="text-sm font-bold text-orange-700 mb-2">Sau khi cài xong — cách dùng</p>
        <p className="text-sm text-orange-700">① Vào trang sản phẩm bất kỳ trên Shopee</p>
        <p className="text-sm text-orange-700">② Click bookmark <strong>🛍️ Thêm Shopee</strong></p>
        <p className="text-sm text-orange-700">③ Popup hiện ra, kiểm tra thông tin → <strong>Đăng sản phẩm</strong></p>
      </div>
    </div>
  )
}

// ---------- Add form ----------
function AddForm({ onAdded }: { onAdded: () => void }) {
  const [f, setF] = useState(BLANK)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const set = (k: keyof typeof BLANK, v: string) => setF(p => ({ ...p, [k]: v }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const url = f.shopeeUrl.trim()
    if (!isValidUrl(url)) { setMsg({ ok: false, text: 'Link không hợp lệ' }); return }
    setSaving(true); setMsg(null)
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: makeId(url),
          itemid: 0, shopid: 0,
          name: f.name.trim(),
          image: f.image.trim(),
          description: f.description.trim(),
          price: Number(f.price.replace(/\D/g, '')) || 0,
          priceOriginal: Number(f.priceOriginal.replace(/\D/g, '')) || 0,
          shopeeUrl: url,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMsg({ ok: true, text: `Đã thêm: ${data.name}` })
      setF(BLANK)
      onAdded()
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : 'Lỗi' })
    } finally { setSaving(false) }
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl shadow-sm p-6 mb-8 space-y-4">
      {msg && (
        <div className={`rounded-xl px-4 py-3 text-sm ${msg.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
          {msg.ok ? '✓ ' : '✗ '}{msg.text}
        </div>
      )}

      <Field label="Link Shopee *" value={f.shopeeUrl} onChange={v => set('shopeeUrl', v)}
        placeholder="https://shopee.vn/... hoặc https://shp.ee/..." />

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Link hình ảnh</label>
        <div className="flex gap-3 items-start">
          <div className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 border relative">
            {f.image
              ? <Image src={f.image} alt="" fill sizes="64px" className="object-cover" unoptimized />
              : <div className="flex items-center justify-center h-full text-gray-300 text-2xl">🖼</div>}
          </div>
          <div className="flex-1">
            <input value={f.image} onChange={e => set('image', e.target.value)}
              placeholder="https://cf.shopee.vn/file/..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ee4d2d]" />
            <p className="text-xs text-gray-400 mt-1">Chuột phải ảnh Shopee → Sao chép địa chỉ hình ảnh</p>
          </div>
        </div>
      </div>

      <Field label="Tên sản phẩm *" value={f.name} onChange={v => set('name', v)} placeholder="Nhập tên" required />

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mô tả</label>
        <textarea value={f.description} onChange={e => set('description', e.target.value)}
          placeholder="Mô tả ngắn..." rows={2}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ee4d2d] resize-none" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Giá bán (đ)" value={f.price} onChange={v => set('price', v)} placeholder="100000" suffix="đ" />
        <Field label="Giá gốc (đ)" value={f.priceOriginal} onChange={v => set('priceOriginal', v)} placeholder="112000" suffix="đ" />
      </div>

      <button type="submit" disabled={saving || !f.name.trim() || !f.shopeeUrl.trim()}
        className="w-full bg-[#ee4d2d] text-white py-3 rounded-xl text-sm font-bold hover:bg-[#d73211] disabled:opacity-40 transition-colors">
        {saving ? 'Đang đăng...' : 'Đăng sản phẩm'}
      </button>
    </form>
  )
}

// ---------- Edit form (inline) ----------
function EditRow({ product, onDone }: { product: Product; onDone: () => void }) {
  const [f, setF] = useState({
    shopeeUrl: product.shopeeUrl,
    image: product.image,
    name: product.name,
    description: product.description,
    price: String(product.price),
    priceOriginal: String(product.priceOriginal),
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const set = (k: keyof typeof f, v: string) => setF(p => ({ ...p, [k]: v }))

  async function save() {
    setSaving(true); setErr('')
    try {
      const res = await fetch('/api/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: product.id,
          shopeeUrl: f.shopeeUrl.trim(),
          image: f.image.trim(),
          name: f.name.trim(),
          description: f.description.trim(),
          price: Number(f.price.replace(/\D/g, '')) || 0,
          priceOriginal: Number(f.priceOriginal.replace(/\D/g, '')) || 0,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onDone()
    } catch (err) {
      setErr(err instanceof Error ? err.message : 'Lỗi')
    } finally { setSaving(false) }
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
      <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">Chỉnh sửa sản phẩm</p>

      <div className="flex gap-3 items-start">
        <div className="w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 border relative">
          {f.image
            ? <Image src={f.image} alt="" fill sizes="56px" className="object-cover" unoptimized />
            : <div className="flex items-center justify-center h-full text-gray-300 text-xl">🖼</div>}
        </div>
        <input value={f.image} onChange={e => set('image', e.target.value)}
          placeholder="URL hình ảnh"
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
      </div>

      <input value={f.shopeeUrl} onChange={e => set('shopeeUrl', e.target.value)}
        placeholder="Link Shopee"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />

      <input value={f.name} onChange={e => set('name', e.target.value)}
        placeholder="Tên sản phẩm"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />

      <textarea value={f.description} onChange={e => set('description', e.target.value)}
        placeholder="Mô tả" rows={2}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />

      <div className="grid grid-cols-2 gap-2">
        <input value={f.price} onChange={e => set('price', e.target.value)}
          placeholder="Giá bán (đ)"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
        <input value={f.priceOriginal} onChange={e => set('priceOriginal', e.target.value)}
          placeholder="Giá gốc (đ)"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
      </div>

      {err && <p className="text-xs text-red-600">{err}</p>}

      <div className="flex gap-2">
        <button onClick={save} disabled={saving}
          className="flex-1 bg-amber-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-amber-600 disabled:opacity-50 transition-colors">
          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
        <button onClick={onDone}
          className="px-4 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
          Hủy
        </button>
      </div>
    </div>
  )
}

// ---------- Field helper ----------
function Field({ label, value, onChange, placeholder, required, suffix }:
  { label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean; suffix?: string }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          required={required}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ee4d2d] pr-8" />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{suffix}</span>}
      </div>
    </div>
  )
}

// ---------- Main ----------
export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [tab, setTab] = useState<'manual' | 'bookmarklet'>('manual')
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  async function load() {
    const r = await fetch('/api/products')
    setProducts(await r.json())
  }
  useEffect(() => { load() }, [])

  async function handleDelete(id: string) {
    if (!confirm('Xóa sản phẩm này?')) return
    setDeleting(id)
    await fetch('/api/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    await load()
    setDeleting(null)
  }

  const totalClicks = products.reduce((s, p) => s + (p.clicks ?? 0), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Admin</h1>
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm text-gray-400 hover:text-gray-600">← Trang chủ</a>
            <button onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-red-500 transition-colors">
              Đăng xuất
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-xs text-gray-400 mb-1">Sản phẩm</p>
            <p className="text-2xl font-bold text-gray-800">{products.length}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-xs text-gray-400 mb-1">Tổng lượt click</p>
            <p className="text-2xl font-bold text-[#ee4d2d]">{totalClicks.toLocaleString('vi-VN')}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4">
          <button onClick={() => setTab('manual')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === 'manual' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            ✏️ Nhập tay
          </button>
          <button onClick={() => setTab('bookmarklet')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === 'bookmarklet' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            🔖 Bookmarklet
          </button>
        </div>

        {tab === 'manual' ? <AddForm onAdded={load} /> : <BookmarkletSetup />}

        {/* Product list */}
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
          Danh sách ({products.length})
        </h2>

        {products.length === 0
          ? <p className="text-gray-400 text-sm text-center py-10">Chưa có sản phẩm nào</p>
          : (
            <div className="flex flex-col gap-2">
              {products.map(p => (
                <div key={p.id}>
                  {editingId === p.id
                    ? <EditRow product={p} onDone={() => { setEditingId(null); load() }} />
                    : (
                      <div className="bg-white rounded-2xl shadow-sm p-4 flex gap-3 items-center">
                        <div className="w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 relative">
                          {p.image
                            ? <Image src={p.image} alt={p.name} fill sizes="56px" className="object-cover" />
                            : <span className="flex items-center justify-center h-full text-2xl">🛍️</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-[#ee4d2d] text-sm font-medium">{fmt(p.price)}</span>
                            {p.priceOriginal > p.price && (
                              <span className="text-gray-400 text-xs line-through">{fmt(p.priceOriginal)}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-xs text-gray-400">
                              👆 {(p.clicks ?? 0).toLocaleString('vi-VN')} click
                            </span>
                            <a href={p.shopeeUrl} target="_blank" rel="noopener noreferrer"
                              className="text-xs text-blue-500 hover:underline">↗ Shopee</a>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 flex-shrink-0">
                          <button onClick={() => setEditingId(p.id)}
                            className="text-xs text-amber-600 hover:text-amber-800 px-2 py-1 rounded border border-amber-200 hover:bg-amber-50 transition-colors">
                            Sửa
                          </button>
                          <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id}
                            className="text-xs text-gray-400 hover:text-red-500 px-2 py-1 rounded border border-gray-200 hover:bg-red-50 transition-colors">
                            {deleting === p.id ? '...' : 'Xóa'}
                          </button>
                        </div>
                      </div>
                    )
                  }
                </div>
              ))}
            </div>
          )
        }
      </div>
    </div>
  )
}
