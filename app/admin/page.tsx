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

// ---------- Extension setup ----------
function ExtensionSetup() {
  const [apiUrl, setApiUrl] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => { setApiUrl(window.location.origin + '/api/products') }, [])

  function copy() {
    navigator.clipboard.writeText(apiUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 space-y-5">
      <h2 className="text-base font-bold text-gray-700">Cài Extension (Chrome / Edge)</h2>

      {/* Step 1 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#ee4d2d] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>
          <p className="text-sm font-semibold text-gray-700">Tải thư mục extension về máy</p>
        </div>
        <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-600">
          Thư mục <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs font-mono">extension/</code> nằm trong repo GitHub của dự án này.
          Clone hoặc download ZIP → giải nén.
        </div>
      </div>

      {/* Step 2 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#ee4d2d] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">2</span>
          <p className="text-sm font-semibold text-gray-700">Load extension vào Chrome / Edge</p>
        </div>
        <div className="bg-gray-50 rounded-xl px-4 py-3 space-y-1.5 text-sm text-gray-600">
          <p>① Mở <code className="bg-gray-200 px-1 rounded text-xs">chrome://extensions</code></p>
          <p>② Bật <strong>Developer mode</strong> (góc trên phải)</p>
          <p>③ Click <strong>Load unpacked</strong> → chọn thư mục <code className="bg-gray-200 px-1 rounded text-xs">extension/</code></p>
        </div>
      </div>

      {/* Step 3 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#ee4d2d] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">3</span>
          <p className="text-sm font-semibold text-gray-700">Cấu hình API URL (làm 1 lần)</p>
        </div>
        <p className="text-sm text-gray-500">Copy URL bên dưới, sau đó dán vào extension khi nó hỏi:</p>
        <div className="flex gap-2">
          <code className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-mono text-gray-600 break-all">
            {apiUrl}
          </code>
          <button onClick={copy}
            className={`flex-shrink-0 text-xs border rounded-xl px-4 font-semibold transition-colors ${
              copied ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-600'
            }`}>
            {copied ? '✓' : 'Copy'}
          </button>
        </div>
      </div>

      {/* How to use */}
      <div className="bg-orange-50 rounded-xl p-4 space-y-1.5">
        <p className="text-sm font-bold text-orange-700 mb-2">Sau khi cài — cách dùng mỗi ngày</p>
        <p className="text-sm text-orange-700">① Vào trang sản phẩm bất kỳ trên Shopee</p>
        <p className="text-sm text-orange-700">② Click icon 🛍️ trên thanh công cụ trình duyệt</p>
        <p className="text-sm text-orange-700">③ Popup hiện ra với tên, ảnh, giá đã điền sẵn</p>
        <p className="text-sm text-orange-700">④ Kiểm tra, sửa nếu cần → <strong>Đăng sản phẩm</strong></p>
      </div>
    </div>
  )
}

// ---------- Add form ----------
function AddForm({ onAdded }: { onAdded: () => void }) {
  const [f, setF] = useState(BLANK)
  const [saving, setSaving] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const set = (k: keyof typeof BLANK, v: string) => setF(p => ({ ...p, [k]: v }))

  async function autoFill() {
    const url = f.shopeeUrl.trim()
    if (!isValidUrl(url)) { setMsg({ ok: false, text: 'Nhập link Shopee trước' }); return }
    setFetching(true); setMsg(null)
    try {
      const res = await fetch(`/api/fetch-product?url=${encodeURIComponent(url)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const filled: string[] = []
      setF(p => {
        const next = { ...p }
        if (data.name)  { next.name = data.name;              filled.push('tên') }
        if (data.image) { next.image = data.image;            filled.push('ảnh') }
        if (data.description) next.description = data.description
        if (data.price) { next.price = String(data.price);   filled.push('giá') }
        return next
      })
      setMsg({ ok: true, text: `Đã điền: ${filled.join(', ') || '(không có dữ liệu)'}` })
    } catch (err) {
      setMsg({ ok: false, text: 'Không tự lấy được — nhập thủ công nhé' })
    } finally { setFetching(false) }
  }

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

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Link Shopee *</label>
        <div className="flex gap-2">
          <input value={f.shopeeUrl} onChange={e => set('shopeeUrl', e.target.value)}
            placeholder="https://shopee.vn/..."
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ee4d2d]" />
          <button type="button" onClick={autoFill} disabled={fetching || !f.shopeeUrl.trim()}
            className="flex-shrink-0 bg-orange-50 text-orange-600 border border-orange-200 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-100 disabled:opacity-40 transition-colors whitespace-nowrap">
            {fetching ? '...' : '✨ Tự động'}
          </button>
        </div>
      </div>

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
            🧩 Extension
          </button>
        </div>

        {tab === 'manual' ? <AddForm onAdded={load} /> : <ExtensionSetup />}

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
