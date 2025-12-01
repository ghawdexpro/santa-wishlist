import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Santa Hotline - Telefon do Mikołaja 🎅',
  description: 'Magiczny telefon do Świętego Mikołaja! Rozmawiaj, pisz i odbieraj wiadomości z Bieguna Północnego.',
  manifest: '/santa-manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Santa Hotline',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#991b1b',
}

export default function SantaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link rel="apple-touch-icon" href="/santa-icon-192.png" />
      {children}
    </>
  )
}
