import { NextRequest } from 'next/server'

function nameFromSlug(url: string): string {
  try {
    const path = new URL(url).pathname
    const slug = path.replace(/^\//, '').replace(/-i\.\d+\.\d+.*$/, '').replace(/\.\d+\.\d+.*$/, '')
    return decodeURIComponent(slug).replace(/-/g, ' ').trim()
  } catch { return '' }
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) return Response.json({ error: 'Missing url' }, { status: 400 })

  // 1. Try Microlink — headless browser, gets og tags reliably
  try {
    const ml = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 0 },
    })
    if (ml.ok) {
      const body = await ml.json()
      if (body.status === 'success' && body.data) {
        const { title, description, image } = body.data
        return Response.json({
          name: title || nameFromSlug(url),
          image: image?.url || '',
          description: description || '',
          price: 0,
        })
      }
    }
  } catch { /* fall through */ }

  // 2. Fallback — extract name from URL slug (always works for Shopee)
  const name = nameFromSlug(url)
  if (name) {
    return Response.json({ name, image: '', description: '', price: 0 })
  }

  return Response.json({ error: 'Không lấy được thông tin từ link này' }, { status: 422 })
}
