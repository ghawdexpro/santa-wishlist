import type { Metadata } from 'next'
import './globals.css'
import Snowfall from '@/components/Snowfall'
import Header from '@/components/Header'

export const metadata: Metadata = {
  title: "The Santa Experience - Personalized Video from Santa Claus",
  description: 'Give your child a magical, personalized video from Santa Claus. Santa speaks directly to your child by name. An unforgettable Christmas gift!',
  keywords: ['santa video', 'personalized santa', 'christmas gift', 'message from santa', 'christmas for kids', 'christmas magic', 'santa claus video'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Snowfall />
        <Header />
        <main className="pt-16 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
