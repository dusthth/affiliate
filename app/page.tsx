import Image from 'next/image'
import { readProducts } from '@/lib/products'
import type { ShopeeProduct } from '@/lib/shopee'

export const dynamic = 'force-dynamic'

function discount(price: number, original: number) {
  if (!original || original <= price) return 0
  return Math.round((1 - price / original) * 100)
}

function fmt(n: number) {
  return n.toLocaleString('vi-VN')
}

function ProductCard({ p }: { p: ShopeeProduct }) {
  const pct = discount(p.price, p.priceOriginal)
  const href = `/api/go/${p.id}`

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-200 flex flex-col">
      <a href={href} target="_blank" rel="noopener noreferrer" className="block">
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {p.image ? (
            <Image
              src={p.image}
              alt={p.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-200 text-5xl">🛍️</div>
          )}
          {pct > 0 && (
            <span className="absolute top-2 right-2 bg-[#ee4d2d] text-white text-xs font-bold px-2 py-0.5 rounded-full">
              GIẢM {pct}%
            </span>
          )}
        </div>
      </a>

      <div className="p-3 flex flex-col gap-1 flex-1">
        <a href={href} target="_blank" rel="noopener noreferrer">
          <p className="text-sm text-gray-800 font-medium line-clamp-2 leading-snug min-h-[2.5rem] hover:text-[#ee4d2d] transition-colors">
            {p.name}
          </p>
        </a>

        {p.description && (
          <p className="text-xs text-gray-400 line-clamp-1">{p.description}</p>
        )}

        <div className="mt-1 flex items-baseline gap-2 flex-wrap">
          <span className="text-[#ee4d2d] font-bold text-base">
            {fmt(p.price)}đ
          </span>
          {p.priceOriginal > p.price && (
            <span className="text-gray-400 text-xs line-through">
              {fmt(p.priceOriginal)}đ
            </span>
          )}
        </div>

        <a href={href} target="_blank" rel="noopener noreferrer"
          className="mt-2 block w-full text-center bg-[#ee4d2d] hover:bg-[#d73211] text-white text-xs font-bold py-2 rounded-xl transition-colors">
          Mua ngay
        </a>
      </div>
    </div>
  )
}

export default async function Home() {
  const products = await readProducts()

  return (
    <main className="max-w-5xl mx-auto px-3 py-5">
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
          <span className="text-6xl mb-4">🛒</span>
          <p className="text-lg">Chưa có sản phẩm nào</p>
          <a href="/admin" className="mt-3 text-[#ee4d2d] hover:underline text-sm">Thêm sản phẩm →</a>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {products.map(p => <ProductCard key={p.id} p={p} />)}
        </div>
      )}
    </main>
  )
}
