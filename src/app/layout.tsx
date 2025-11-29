import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Snowfall from '@/components/Snowfall'
import Header from '@/components/Header'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: "Santa's Nice List - Christmas Wishlist App",
  description: 'Create and share your Christmas wishlist with family and friends. Let Santa know what you want!',
  keywords: ['christmas', 'wishlist', 'santa', 'gifts', 'holiday'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Snowfall />
        <Header />
        <main className="pt-16 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
