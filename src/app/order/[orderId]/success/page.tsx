'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function PaymentSuccessPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const orderId = params.orderId as string
  const sessionId = searchParams.get('session_id')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Clear the pending order from session storage
    sessionStorage.removeItem('pendingOrder')
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-4xl">🎅</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-8 flex items-center justify-center">
      <div className="max-w-lg mx-auto text-center">
        {/* Success Animation */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-christmas-green rounded-full flex items-center justify-center animate-bounce">
            <span className="text-5xl">✓</span>
          </div>
        </div>

        <h1 className="text-4xl font-bold glow-gold mb-4">
          Payment Successful! 🎄
        </h1>

        <p className="text-xl text-white/80 mb-8">
          Thank you for your order! The elves are now working on creating
          your magical Santa video.
        </p>

        <div className="card-christmas text-left mb-8">
          <h2 className="text-lg font-bold text-christmas-gold mb-4">What happens next?</h2>
          <ol className="space-y-3 text-white/80">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-christmas-red flex items-center justify-center text-sm font-bold">1</span>
              <span>Our team will start generating your personalized video</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-christmas-red flex items-center justify-center text-sm font-bold">2</span>
              <span>You&apos;ll receive an email when your video is ready (within 24-48 hours)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-christmas-green flex items-center justify-center text-sm font-bold">3</span>
              <span>Download and share the magic with your child!</span>
            </li>
          </ol>
        </div>

        <div className="space-y-4">
          <p className="text-white/60 text-sm">
            Order ID: <span className="font-mono">{orderId}</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="btn-christmas px-6 py-3"
            >
              View My Orders
            </Link>
            <Link
              href="/"
              className="px-6 py-3 text-white/70 hover:text-white transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>

        {/* Festive decoration */}
        <div className="mt-12 text-4xl space-x-4">
          🎁 🎄 ⭐ 🎄 🎁
        </div>
      </div>
    </div>
  )
}
