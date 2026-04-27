import { createClient } from '@supabase/supabase-js'
import type { ShopeeProduct } from './shopee'

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const TABLE = 'aff_products'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toProduct(row: any): ShopeeProduct {
  return {
    id: row.id,
    itemid: Number(row.itemid ?? 0),
    shopid: Number(row.shopid ?? 0),
    name: row.name,
    image: row.image ?? '',
    description: row.description ?? '',
    price: Number(row.price ?? 0),
    priceOriginal: Number(row.price_original ?? 0),
    sold: Number(row.sold ?? 0),
    clicks: Number(row.clicks ?? 0),
    shopeeUrl: row.shopee_url,
    addedAt: row.added_at,
  }
}

export async function readProducts(): Promise<ShopeeProduct[]> {
  const { data } = await db.from(TABLE).select('*').order('added_at', { ascending: false })
  return (data ?? []).map(toProduct)
}

export async function saveProduct(product: ShopeeProduct): Promise<void> {
  await db.from(TABLE).upsert({
    id: product.id,
    itemid: product.itemid,
    shopid: product.shopid,
    name: product.name,
    image: product.image,
    description: product.description,
    price: product.price,
    price_original: product.priceOriginal,
    sold: product.sold,
    clicks: product.clicks,
    shopee_url: product.shopeeUrl,
    added_at: product.addedAt,
  })
}

export async function updateProduct(id: string, patch: Partial<ShopeeProduct>): Promise<ShopeeProduct | null> {
  const dbPatch: Record<string, unknown> = {}
  if (patch.name !== undefined) dbPatch.name = patch.name
  if (patch.image !== undefined) dbPatch.image = patch.image
  if (patch.description !== undefined) dbPatch.description = patch.description
  if (patch.price !== undefined) dbPatch.price = patch.price
  if (patch.priceOriginal !== undefined) dbPatch.price_original = patch.priceOriginal
  if (patch.shopeeUrl !== undefined) dbPatch.shopee_url = patch.shopeeUrl

  const { data } = await db.from(TABLE).update(dbPatch).eq('id', id).select().single()
  return data ? toProduct(data) : null
}

export async function deleteProduct(id: string): Promise<void> {
  await db.from(TABLE).delete().eq('id', id)
}

export async function incrementClicks(id: string): Promise<void> {
  await db.rpc('increment_aff_clicks', { product_id: id })
}
