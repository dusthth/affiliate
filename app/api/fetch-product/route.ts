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
        'Cache-Control': 'no-cache',
      },
    })

    if (!res.ok) return Response.json({ error: `Shopee trả về ${res.status}` }, { status: 502 })

    const html = await res.text()

    function og(prop: string) {
      const m = html.match(new RegExp(
        `<meta[^>]+property=["']og:${prop}["'][^>]+content=["']([^"']+)["']`, 'i'
      )) || html.match(new RegExp(
        `<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:${prop}["']`, 'i'
      ))
      return m ? m[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim() : ''
    }

    const name = og('title').replace(/\s*[|\-–].*Shopee.*$/i, '').trim()
    const image = og('image')
    const description = og('description')

    const priceMatch = html.match(/"price"\s*:\s*"?([\d.]+)"?/)
    const price = priceMatch ? Math.round(parseFloat(priceMatch[1])) : 0

    return Response.json({ name, image, description, price })
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'Lỗi' }, { status: 500 })
  }
}
