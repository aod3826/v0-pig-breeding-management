import type { Metadata, Viewport } from 'next'
import { Noto_Sans_Thai } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const notoSansThai = Noto_Sans_Thai({ 
  subsets: ["thai", "latin"],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700']
});

export const metadata: Metadata = {
  title: 'PigBreed Pro - ระบบจัดการการผสมพันธุ์สุกร',
  description: 'ระบบจัดการการผสมพันธุ์สุกรอัจฉริยะ ติดตามการตั้งท้อง คำนวณวันคลอด และวิเคราะห์ข้อมูลด้วย AI',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#22c55e' },
    { media: '(prefers-color-scheme: dark)', color: '#16a34a' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th">
      <body className={`${notoSansThai.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
