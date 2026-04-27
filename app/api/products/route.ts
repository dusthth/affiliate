import { NextRequest } from 'next/server'
import { readProducts, saveProduct, updateProduct, deleteProduct } from '@/lib/products'
import type { ShopeeProduct } from '@/lib/shopee'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS })
}

export async function GET() {
  return Response.json(await readProducts(), { headers: CORS })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Partial<ShopeeProduct>
    const { id, name, shopeeUrl } = body
    if (!id || !name || !shopeeUrl) {
      return Response.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400, headers: CORS })
    }
    const product: ShopeeProduct = {
      id,
      itemid: body.itemid ?? 0,
      shopid: body.shopid ?? 0,
      name,
      image: body.image ?? '',
      description: body.description ?? '',
      price: body.price ?? 0,
      priceOriginal: body.priceOriginal ?? 0,
      sold: 0,
      clicks: 0,
      shopeeUrl,
      addedAt: new Date().toISOString(),
    }
    await saveProduct(product)
    return Response.json(product, { status: 201, headers: CORS })
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'Lỗi' }, { status: 500, headers: CORS })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, ...patch } = await req.json() as Partial<ShopeeProduct> & { id: string }
    if (!id) return Response.json({ error: 'Thiếu id' }, { status: 400, headers: CORS })
    const updated = await updateProduct(id, patch)
    if (!updated) return Response.json({ error: 'Không tìm thấy sản phẩm' }, { status: 404, headers: CORS })
    return Response.json(updated, { headers: CORS })
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'Lỗi' }, { status: 500, headers: CORS })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    if (!id) return Response.json({ error: 'Thiếu id' }, { status: 400, headers: CORS })
    await deleteProduct(id)
    return Response.json({ ok: true }, { headers: CORS })
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'Lỗi' }, { status: 500, headers: CORS })
  }
}
