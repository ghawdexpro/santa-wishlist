'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { WizardData } from '@/components/CreateWizard/WizardContext'

type PricingTier = 'basic' | 'premium'

export default function SummaryPage() {
  const router = useRouter()
  const [data, setData] = useState<WizardData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTier, setSelectedTier] = useState<PricingTier>('basic')

  useEffect(() => {
    const stored = sessionStorage.getItem('pendingOrder')
    if (stored) {
      setData(JSON.parse(stored))
    } else {
      router.push('/create')
    }
  }, [router])

  const handleProceedToPayment = async () => {
    if (!data) return

    setIsProcessing(true)
    setError(null)

    try {
      // Step 1: Create the order
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childName: data.childName,
          childAge: data.childAge,
          childPhotoUrl: data.childPhotoPreview, // In production, upload to Supabase Storage first
          goodBehavior: data.goodBehavior,
          thingToImprove: data.thingToImprove,
          thingToLearn: data.thingToLearn,
          customMessage: data.customMessage,
        }),
      })

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json()
        throw new Error(errorData.error || 'Failed to create order')
      }

      const { order } = await orderResponse.json()

      // Step 2: Create Stripe checkout session with selected tier
      const checkoutResponse = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, tier: selectedTier }),
      })

      if (!checkoutResponse.ok) {
        const errorData = await checkoutResponse.json()
        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      const { url } = await checkoutResponse.json()

      // Step 3: Redirect to Stripe Checkout
      window.location.href = url
    } catch (err) {
      console.error('Payment error:', err)
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setIsProcessing(false)
    }
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-4xl">🎅</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">✨</div>
          <h1 className="text-3xl font-bold glow-gold">Gotowe do stworzenia magii!</h1>
          <p className="text-white/70 mt-2">
            Sprawdź dane przed przejściem do płatności
          </p>
        </div>

        <div className="card-christmas space-y-6">
          {/* Child Info */}
          <div className="flex items-center gap-4 pb-4 border-b border-white/10">
            {data.childPhotoPreview ? (
              <img
                src={data.childPhotoPreview}
                alt={data.childName}
                className="w-20 h-20 rounded-full object-cover border-4 border-christmas-gold"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center text-3xl">
                👶
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-christmas-gold">{data.childName}</h2>
              <p className="text-white/70">{data.childAge} lat</p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-christmas-gold mb-1">
                Dobre zachowanie ⭐
              </h3>
              <p className="text-white/80">{data.goodBehavior}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-christmas-gold mb-1">
                Do poprawy 💪
              </h3>
              <p className="text-white/80">{data.thingToImprove}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-christmas-gold mb-1">
                Cel do osiągnięcia 🎯
              </h3>
              <p className="text-white/80">{data.thingToLearn}</p>
            </div>

            {data.customMessage && (
              <div>
                <h3 className="text-sm font-medium text-christmas-gold mb-1">
                  Własna wiadomość 💌
                </h3>
                <p className="text-white/80">{data.customMessage}</p>
              </div>
            )}
          </div>
        </div>

        {/* Tier Selection */}
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-bold text-christmas-gold text-center">Wybierz pakiet</h3>

          {/* Basic Tier */}
          <div
            onClick={() => setSelectedTier('basic')}
            className={`card-christmas cursor-pointer transition-all ${
              selectedTier === 'basic'
                ? 'ring-2 ring-christmas-gold'
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedTier === 'basic' ? 'border-christmas-gold bg-christmas-gold' : 'border-white/50'
                }`}>
                  {selectedTier === 'basic' && <span className="text-black text-xs">✓</span>}
                </div>
                <div>
                  <h4 className="font-bold text-white">Film od Mikołaja</h4>
                  <p className="text-white/60 text-sm">~2 minutowy spersonalizowany film</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-christmas-gold">259 zł</span>
              </div>
            </div>
            <ul className="space-y-1 text-white/70 text-sm pl-8">
              <li className="flex items-center gap-2">
                <span className="text-christmas-green">✓</span>
                Mikołaj mówi do {data.childName}
              </li>
              <li className="flex items-center gap-2">
                <span className="text-christmas-green">✓</span>
                Zdjęcie w magicznej księdze
              </li>
              <li className="flex items-center gap-2">
                <span className="text-christmas-green">✓</span>
                Pobieranie HD na zawsze
              </li>
            </ul>
          </div>

          {/* Premium Tier */}
          <div
            onClick={() => setSelectedTier('premium')}
            className={`card-christmas cursor-pointer transition-all relative ${
              selectedTier === 'premium'
                ? 'ring-2 ring-christmas-gold'
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-christmas-gold text-black px-3 py-0.5 rounded-full text-xs font-bold">
              NAJPOPULARNIEJSZY
            </div>
            <div className="flex items-center justify-between mb-3 mt-2">
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedTier === 'premium' ? 'border-christmas-gold bg-christmas-gold' : 'border-white/50'
                }`}>
                  {selectedTier === 'premium' && <span className="text-black text-xs">✓</span>}
                </div>
                <div>
                  <h4 className="font-bold text-white">Film + Rozmowa z Mikołajem</h4>
                  <p className="text-white/60 text-sm">Film + 5 minut rozmowy video na żywo!</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-christmas-gold">399 zł</span>
              </div>
            </div>
            <ul className="space-y-1 text-white/70 text-sm pl-8">
              <li className="flex items-center gap-2">
                <span className="text-christmas-green">✓</span>
                Wszystko z pakietu podstawowego
              </li>
              <li className="flex items-center gap-2">
                <span className="text-christmas-gold">⭐</span>
                Rozmowa video z Mikołajem NA ŻYWO!
              </li>
              <li className="flex items-center gap-2">
                <span className="text-christmas-gold">⭐</span>
                Mikołaj odpowiada na pytania dziecka
              </li>
              <li className="flex items-center gap-2">
                <span className="text-christmas-gold">⭐</span>
                Spersonalizowana bajka od Mikołaja
              </li>
            </ul>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-center">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/create"
            className="px-6 py-3 text-white/70 hover:text-white transition-colors text-center"
          >
            ← Edytuj dane
          </Link>
          <button
            onClick={handleProceedToPayment}
            disabled={isProcessing}
            className={`btn-christmas px-8 py-3 flex items-center justify-center gap-2 ${
              isProcessing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isProcessing ? (
              <>
                <span className="animate-spin">⏳</span>
                Przetwarzanie...
              </>
            ) : (
              <>
                Przejdź do płatności <span className="text-xl">💳</span>
              </>
            )}
          </button>
        </div>

        <p className="text-center mt-4 text-white/50 text-sm">
          Bezpieczna płatność przez Stripe 🔒
        </p>
      </div>
    </div>
  )
}
