import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { VideoPlayer } from '@/components/VideoPlayer'
import Snowfall from '@/components/Snowfall'

// Use service role for public access (no auth required)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface Props {
  params: Promise<{ orderId: string }>
}

export default async function VideoPage({ params }: Props) {
  const { orderId } = await params

  // Fetch order with children
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      id,
      status,
      final_video_url,
      completed_at,
      child_count,
      children (name, age)
    `)
    .eq('id', orderId)
    .single()

  if (error || !order) {
    notFound()
  }

  // Check if video is ready
  if (order.status !== 'complete' || !order.final_video_url) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Snowfall />
        <div className="card-christmas max-w-md text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold text-christmas-gold mb-4">
            Film jeszcze nie jest gotowy
          </h1>
          <p className="text-white/70 mb-6">
            Ten film jest jeszcze w trakcie tworzenia. Sprawdź ponownie za chwilę!
          </p>
          <Link href="/" className="btn-christmas inline-block">
            Strona główna
          </Link>
        </div>
      </div>
    )
  }

  // Get children names
  const childrenNames = order.children?.map((c: { name: string }) => c.name).join(' i ') || 'Dziecko'

  return (
    <div className="min-h-screen py-8 px-4">
      <Snowfall />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎅</div>
          <h1 className="text-3xl md:text-4xl font-bold glow-gold mb-2">
            Film od Świętego Mikołaja
          </h1>
          <p className="text-xl text-white/80">
            Specjalnie dla: <span className="text-christmas-gold font-bold">{childrenNames}</span>
          </p>
        </div>

        {/* Video Player */}
        <div className="card-christmas p-0 overflow-hidden mb-8">
          <VideoPlayer
            src={order.final_video_url}
            poster="/assets/santa-video-poster.jpg"
          />
        </div>

        {/* Share Section */}
        <div className="card-christmas text-center">
          <h2 className="text-xl font-bold text-christmas-gold mb-4">
            Udostępnij ten magiczny moment!
          </h2>
          <p className="text-white/70 mb-6">
            Wyślij ten link rodzinie i przyjaciołom
          </p>

          {/* Share URL */}
          <div className="bg-black/30 rounded-xl p-4 mb-6">
            <code className="text-christmas-gold text-sm break-all">
              {typeof window !== 'undefined'
                ? window.location.href
                : `${process.env.NEXT_PUBLIC_APP_URL}/video/${orderId}`}
            </code>
          </div>

          {/* Share Buttons */}
          <div className="flex flex-wrap justify-center gap-3">
            <ShareButton
              platform="whatsapp"
              url={`${process.env.NEXT_PUBLIC_APP_URL}/video/${orderId}`}
              text={`Zobacz magiczny film od Mikołaja dla ${childrenNames}! 🎅🎄`}
            />
            <ShareButton
              platform="facebook"
              url={`${process.env.NEXT_PUBLIC_APP_URL}/video/${orderId}`}
              text={`Zobacz magiczny film od Mikołaja! 🎅`}
            />
            <ShareButton
              platform="copy"
              url={`${process.env.NEXT_PUBLIC_APP_URL}/video/${orderId}`}
              text=""
            />
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <p className="text-white/60 mb-4">
            Chcesz stworzyć własny film od Mikołaja?
          </p>
          <Link href="/create" className="btn-christmas inline-block">
            Stwórz Swój Film 🎁
          </Link>
        </div>
      </div>
    </div>
  )
}

// Share Button Component
function ShareButton({
  platform,
  url,
  text,
}: {
  platform: 'whatsapp' | 'facebook' | 'copy'
  url: string
  text: string
}) {
  const getShareUrl = () => {
    switch (platform) {
      case 'whatsapp':
        return `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
      default:
        return '#'
    }
  }

  const config = {
    whatsapp: { icon: '📱', label: 'WhatsApp', color: 'bg-green-600 hover:bg-green-700' },
    facebook: { icon: '📘', label: 'Facebook', color: 'bg-blue-600 hover:bg-blue-700' },
    copy: { icon: '📋', label: 'Kopiuj link', color: 'bg-white/20 hover:bg-white/30' },
  }

  const { icon, label, color } = config[platform]

  if (platform === 'copy') {
    return (
      <button
        onClick={() => {
          navigator.clipboard.writeText(url)
          alert('Link skopiowany!')
        }}
        className={`px-4 py-2 rounded-xl text-white transition-colors flex items-center gap-2 ${color}`}
      >
        <span>{icon}</span>
        {label}
      </button>
    )
  }

  return (
    <a
      href={getShareUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className={`px-4 py-2 rounded-xl text-white transition-colors flex items-center gap-2 ${color}`}
    >
      <span>{icon}</span>
      {label}
    </a>
  )
}
