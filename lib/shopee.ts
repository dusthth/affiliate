export interface ShopeeProduct {
  id: string
  itemid: number
  shopid: number
  name: string
  image: string
  description: string
  price: number
  priceOriginal: number
  sold: number
  clicks: number
  shopeeUrl: string
  addedAt: string
}

export function parseShopeeUrl(url: string): { itemid: number; shopid: number } | null {
  const match = url.match(/[.-](\d{6,12})\.(\d{6,15})(?:[?#]|$)/)
  if (!match) return null
  return { shopid: Number(match[1]), itemid: Number(match[2]) }
}
