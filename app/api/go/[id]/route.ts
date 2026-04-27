import { NextRequest, NextResponse } from 'next/server'
import { readProducts, incrementClicks } from '@/lib/products'

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/go/[id]'>) {
  const { id } = await ctx.params
  const products = readProducts()
  const product = products.find(p => p.id === id)
  if (!product) return NextResponse.redirect('https://shopee.vn')
  incrementClicks(id)
  return NextResponse.redirect(product.shopeeUrl)
}
