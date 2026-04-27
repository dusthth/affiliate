import fs from 'fs'
import path from 'path'
import type { ShopeeProduct } from './shopee'

const FILE = path.join(process.cwd(), 'data', 'products.json')

export function readProducts(): ShopeeProduct[] {
  try {
    return JSON.parse(fs.readFileSync(FILE, 'utf-8')) as ShopeeProduct[]
  } catch {
    return []
  }
}

function write(products: ShopeeProduct[]) {
  fs.writeFileSync(FILE, JSON.stringify(products, null, 2), 'utf-8')
}

export function saveProduct(product: ShopeeProduct): void {
  const list = readProducts()
  const idx = list.findIndex(p => p.id === product.id)
  if (idx >= 0) list[idx] = product
  else list.unshift(product)
  write(list)
}

export function updateProduct(id: string, patch: Partial<ShopeeProduct>): ShopeeProduct | null {
  const list = readProducts()
  const idx = list.findIndex(p => p.id === id)
  if (idx < 0) return null
  list[idx] = { ...list[idx], ...patch }
  write(list)
  return list[idx]
}

export function deleteProduct(id: string): void {
  write(readProducts().filter(p => p.id !== id))
}

export function incrementClicks(id: string): void {
  const list = readProducts()
  const idx = list.findIndex(p => p.id === id)
  if (idx >= 0) {
    list[idx].clicks = (list[idx].clicks ?? 0) + 1
    write(list)
  }
}
