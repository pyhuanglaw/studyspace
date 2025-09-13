import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '每日讀書時間紀錄',
  description: '記錄每日讀書時間',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body className="font-sans">{children}</body>
    </html>
  )
}