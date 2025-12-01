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
          Płatność anulowana
        </h1>

        <p className="text-lg text-white/80 mb-8">
          Nie martw się! Twoje zamówienie zostało zapisane. Możesz dokończyć
          zakup kiedy będziesz gotowy.
        </p>

        <div className="card-christmas mb-8">
          <p className="text-white/70 text-sm mb-4">
            Numer zamówienia: <span className="font-mono">{orderId}</span>
          </p>
          <p className="text-white/60 text-sm">
            Twoje zamówienie będzie zapisane przez 24 godziny. Po tym czasie może być
            konieczne ponowne wprowadzenie danych.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/create/summary"
            className="btn-christmas px-6 py-3"
          >
            Spróbuj ponownie 🎅
          </Link>
          <Link
            href="/"
            className="px-6 py-3 text-white/70 hover:text-white transition-colors"
          >
            Wróć na stronę główną
          </Link>
        </div>

        {/* Encouragement */}
        <p className="mt-8 text-white/50 text-sm">
          Pytania? Napisz do nas na magiaswiat@kontakt.pl
        </p>
      </div>
    </div>
  )
}
