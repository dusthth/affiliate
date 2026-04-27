import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) return Response.json({ error: 'Missing url' }, { status: 400 })

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'vi-VN,vi;q=0.9',
        'Referer': 'https://shopee.vn/',
      },
    })

    if (!res.ok) return Response.json({ error: `HTTP ${res.status}` }, { status: 502 })

    const html = await res.text()

    // Extract meta tag with any attribute order and optional extra attrs like data-rh
    function og(prop: string): string {
      const escaped = prop.replace('.', '\\.')
      const patterns = [
        new RegExp(`<meta[^>]*property=["']og:${escaped}["'][^>]*content=["']([^"']+)["']`, 'i'),
        new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:${escaped}["']`, 'i'),
        new RegExp(`<meta[^>]*name=["']og:${escaped}["'][^>]*content=["']([^"']+)["']`, 'i'),
      ]
      for (const re of patterns) {
        const m = html.match(re)
        if (m?.[1]) return m[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim()
      }
      return ''
    }

    // Try JSON-LD (more reliable than meta tags)
    let ldName = '', ldImage = '', ldPrice = 0
    const ldMatch = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i)
    if (ldMatch) {
      try {
        const ld = JSON.parse(ldMatch[1])
        ldName = ld.name || ''
        ldImage = Array.isArray(ld.image) ? ld.image[0] : (ld.image || '')
        if (ld.offers?.price) ldPrice = Math.round(parseFloat(ld.offers.price))
      } catch {}
    }

    // Try inline JSON state (Shopee embeds product data as window.__INITIAL_STATE__)
    let statePrice = 0
    const priceMatch = html.match(/"price_min_before_discount"\s*:\s*(\d+)/)
                    || html.match(/"price"\s*:\s*(\d{4,})/)
    if (priceMatch) statePrice = Math.round(parseInt(priceMatch[1]) / 100000) * 1000

    const name = ldName || og('title').replace(/\s*[|\-–].*Shopee.*$/i, '').trim()
    const image = ldImage || og('image')
    const description = og('description')
    const price = ldPrice || statePrice

    if (!name && !image) {
      return Response.json({ error: 'Shopee không trả về thông tin sản phẩm (có thể bị chặn)' }, { status: 422 })
    }

    return Response.json({ name, image, description, price })
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'Lỗi' }, { status: 500 })
  }
}
