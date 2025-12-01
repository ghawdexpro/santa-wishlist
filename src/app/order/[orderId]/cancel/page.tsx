'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function PaymentCancelPage() {
  const params = useParams()
  const orderId = params.orderId as string

  return (
    <div className="min-h-screen px-4 py-8 flex items-center justify-center">
      <div className="max-w-lg mx-auto text-center">
        {/* Cancel Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-white/10 rounded-full flex items-center justify-center">
            <span className="text-5xl">😢</span>
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-4">
          Payment Cancelled
        </h1>

        <p className="text-lg text-white/80 mb-8">
          Don&apos;t worry! Your order has been saved. You can complete your
          purchase when you&apos;re ready.
        </p>

        <div className="card-christmas mb-8">
          <p className="text-white/70 text-sm mb-4">
            Order number: <span className="font-mono">{orderId}</span>
          </p>
          <p className="text-white/60 text-sm">
            Your order will be saved for 24 hours. After that, you may need
            to re-enter your information.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/create/summary"
            className="btn-christmas px-6 py-3"
          >
            Try Again 🎅
          </Link>
          <Link
            href="/"
            className="px-6 py-3 text-white/70 hover:text-white transition-colors"
          >
            Return to Home
          </Link>
        </div>

        {/* Encouragement */}
        <p className="mt-8 text-white/50 text-sm">
          Questions? Contact us at support@thesantaexperience.com
        </p>
      </div>
    </div>
  )
}
