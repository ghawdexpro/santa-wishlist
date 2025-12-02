import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Santa Hotline - Call Santa Claus 🎅',
  description: 'Magical phone to Santa Claus! Chat, call and receive messages from the North Pole.',
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
