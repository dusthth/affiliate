import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Shopee Deals',
  description: 'Sản phẩm giá tốt từ Shopee',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  )
}
