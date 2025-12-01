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
  title: "Magia Świąt - Spersonalizowane Wideo od Mikołaja | Video od Świętego Mikołaja",
  description: 'Podaruj swojemu dziecku magiczne, spersonalizowane wideo od Świętego Mikołaja. Mikołaj mówi bezpośrednio do Twojego dziecka po imieniu. Niezapomniany prezent na Święta!',
  keywords: ['wideo mikołaj', 'spersonalizowany mikołaj', 'prezent świąteczny', 'wiadomość od mikołaja', 'święta dla dzieci', 'magia świąt', 'film od mikołaja'],
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
