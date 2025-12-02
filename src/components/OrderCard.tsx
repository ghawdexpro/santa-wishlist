'use client'

import Link from 'next/link'
import { useState } from 'react'

interface Child {
  id: string
  name: string
  age: number | null
  photo_url: string | null
}

interface Order {
  id: string
  status: string
  child_count: number
  final_video_url: string | null
  created_at: string
  completed_at: string | null
  generation_progress: {
    stage: string
    scenesComplete: number[]
    scenesInProgress: number[]
  } | null
  error_message: string | null
  children?: Child[]
  // Legacy single child fields
  child_name?: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  draft: { label: 'Szkic', color: 'bg-gray-500', icon: '📝' },
  script_approved: { label: 'Skrypt zatwierdzony', color: 'bg-blue-500', icon: '✅' },
  paid: { label: 'Opłacone', color: 'bg-yellow-500', icon: '💳' },
  keyframes_ready: { label: 'Klatki gotowe', color: 'bg-purple-500', icon: '🖼️' },
  generating: { label: 'Generowanie...', color: 'bg-orange-500', icon: '⏳' },
  complete: { label: 'Gotowe!', color: 'bg-green-500', icon: '🎬' },
  failed: { label: 'Błąd', color: 'bg-red-500', icon: '❌' },
}

export function OrderCard({ order, onRetry }: { order: Order; onRetry?: (orderId: string) => void }) {
  const [downloading, setDownloading] = useState(false)
  const [retrying, setRetrying] = useState(false)

  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.draft
  const isComplete = order.status === 'complete'
  const isGenerating = order.status === 'generating' || order.status === 'paid' || order.status === 'keyframes_ready'
  const hasFailed = order.status === 'failed'

  // Get children names
  const childrenNames = order.children?.map(c => c.name).join(', ') || order.child_name || 'Dziecko'

  // Calculate progress
  const getProgress = () => {
    if (!order.generation_progress) return 0
    const { scenesComplete = [] } = order.generation_progress
    // Total 8 scenes per child
    const totalScenes = 8 * (order.child_count || 1)
    return Math.round((scenesComplete.length / totalScenes) * 100)
  }

  const handleDownload = async () => {
    if (!order.final_video_url) return

    setDownloading(true)
    try {
      // Open video URL in new tab for download
      window.open(order.final_video_url, '_blank')
    } finally {
      setDownloading(false)
    }
  }

  const handleRetry = async () => {
    setRetrying(true)
    try {
      const response = await fetch('/api/retry-generation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      })

      if (response.ok) {
        onRetry?.(order.id)
        window.location.reload()
      } else {
        const data = await response.json()
        alert(data.error || 'Nie udało się ponowić generowania')
      }
    } catch {
      alert('Wystąpił błąd. Spróbuj ponownie.')
    } finally {
      setRetrying(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div className="card-christmas">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{statusConfig.icon}</span>
            <div>
              <h3 className="text-xl font-bold text-christmas-gold">
                Film dla: {childrenNames}
              </h3>
              <p className="text-white/50 text-sm">
                Utworzono: {formatDate(order.created_at)}
              </p>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`px-4 py-2 rounded-full text-white text-sm font-medium ${statusConfig.color}`}>
          {statusConfig.label}
        </div>
      </div>

      {/* Progress Bar (if generating) */}
      {isGenerating && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-white/70 mb-1">
            <span>Generowanie filmu...</span>
            <span>{getProgress()}%</span>
          </div>
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-christmas-red to-christmas-gold transition-all duration-500 animate-pulse"
              style={{ width: `${Math.max(getProgress(), 10)}%` }}
            />
          </div>
          <p className="text-white/50 text-xs mt-2">
            {order.generation_progress?.stage || 'Przygotowywanie...'}
          </p>
        </div>
      )}

      {/* Error Message */}
      {hasFailed && order.error_message && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-red-300 text-sm">
            <strong>Błąd:</strong> {order.error_message}
          </p>
        </div>
      )}

      {/* Children List */}
      {order.children && order.children.length > 1 && (
        <div className="mb-4">
          <p className="text-white/60 text-sm mb-2">Dzieci w filmie:</p>
          <div className="flex flex-wrap gap-2">
            {order.children.map((child) => (
              <span
                key={child.id}
                className="px-3 py-1 bg-white/10 rounded-full text-sm text-white/80"
              >
                {child.name} {child.age && `(${child.age} lat)`}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10">
        {/* Download Video Button */}
        {isComplete && order.final_video_url && (
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="btn-christmas flex items-center gap-2"
          >
            {downloading ? (
              <>
                <span className="animate-spin">⏳</span>
                Pobieranie...
              </>
            ) : (
              <>
                <span>📥</span>
                Pobierz Film
              </>
            )}
          </button>
        )}

        {/* Share Video Button */}
        {isComplete && order.final_video_url && (
          <Link
            href={`/video/${order.id}`}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors flex items-center gap-2"
          >
            <span>🔗</span>
            Udostępnij
          </Link>
        )}

        {/* Talk to Santa Button */}
        {(isComplete || order.status === 'paid') && (
          <Link
            href={`/call/${order.id}`}
            className="px-4 py-2 bg-christmas-green hover:bg-green-600 rounded-xl text-white transition-colors flex items-center gap-2"
          >
            <span>📞</span>
            Rozmowa z Mikołajem
          </Link>
        )}

        {/* View Script Button */}
        {order.status !== 'draft' && (
          <Link
            href={`/order/${order.id}/script`}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors flex items-center gap-2"
          >
            <span>📜</span>
            Zobacz Skrypt
          </Link>
        )}

        {/* Edit Order Button */}
        <Link
          href={`/order/${order.id}/edit`}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors flex items-center gap-2"
        >
          <span>✏️</span>
          Edytuj
        </Link>

        {/* Continue Draft */}
        {order.status === 'draft' && (
          <Link
            href={`/create?order=${order.id}`}
            className="btn-christmas flex items-center gap-2"
          >
            <span>✏️</span>
            Kontynuuj
          </Link>
        )}

        {/* Retry Failed */}
        {hasFailed && (
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="px-4 py-2 bg-christmas-red hover:bg-red-600 rounded-xl text-white transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {retrying ? (
              <>
                <span className="animate-spin">⏳</span>
                Ponawiam...
              </>
            ) : (
              <>
                <span>🔄</span>
                Spróbuj ponownie
              </>
            )}
          </button>
        )}
      </div>

      {/* Completion Message */}
      {isComplete && (
        <div className="mt-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
          <p className="text-green-300 text-sm flex items-center gap-2">
            <span>🎉</span>
            Twój film jest gotowy! Pobierz go lub udostępnij rodzinie.
          </p>
        </div>
      )}
    </div>
  )
}
