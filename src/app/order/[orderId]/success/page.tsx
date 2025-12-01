'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface StatusResponse {
  orderId: string
  status: 'draft' | 'paid' | 'generating' | 'complete' | 'failed'
  progress: {
    stage: string
    stageLabel: string
    percentage: number
    scenesComplete: number
    totalScenes: number
    estimatedTimeRemaining?: number
  }
  videoUrl?: string
  errorMessage?: string
  childrenNames: string[]
  createdAt: string
  updatedAt: string
}

export default function PaymentSuccessPage() {
  const params = useParams()
  const orderId = params.orderId as string
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<StatusResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch order status
  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`)
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
        setError(null)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to fetch status')
      }
    } catch (err) {
      console.error('Failed to fetch status:', err)
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }, [orderId])

  // Initial fetch
  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  // Poll every 10 seconds while generating or paid
  useEffect(() => {
    if (!status || status.status === 'complete' || status.status === 'failed') {
      return
    }

    const interval = setInterval(fetchStatus, 10000)
    return () => clearInterval(interval)
  }, [status, fetchStatus])

  // Format time remaining
  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds} seconds`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return secs > 0 ? `${mins}m ${secs}s` : `${mins} minutes`
  }

  // Format children names for display
  const formatChildrenNames = (names: string[]): string => {
    if (names.length === 0) return 'your child'
    if (names.length === 1) return names[0]
    if (names.length === 2) return `${names[0]} and ${names[1]}`
    return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">🎅</div>
          <p className="text-white/60">Loading order...</p>
        </div>
      </div>
    )
  }

  if (error || !status) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-24 h-24 mx-auto rounded-full bg-red-600 flex items-center justify-center mb-8">
            <span className="text-5xl">⚠️</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Something went wrong</h1>
          <p className="text-white/70 mb-8">{error || 'Order not found'}</p>
          <Link href="/" className="btn-christmas px-6 py-3">
            Return to Home
          </Link>
        </div>
      </div>
    )
  }

  const childrenText = formatChildrenNames(status.childrenNames)
  const isGenerating = status.status === 'generating' || status.status === 'paid'
  const isComplete = status.status === 'complete'
  const isFailed = status.status === 'failed'

  return (
    <div className="min-h-screen px-4 py-8 flex items-center justify-center">
      <div className="max-w-lg mx-auto text-center">
        {/* Status Icon */}
        <div className="mb-8">
          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${
            isComplete ? 'bg-christmas-green' :
            isFailed ? 'bg-red-600' :
            'bg-christmas-gold animate-pulse'
          }`}>
            <span className="text-5xl">
              {isComplete ? '✓' : isFailed ? '✗' : '🎬'}
            </span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold glow-gold mb-4">
          {isComplete ? 'Video Ready! 🎄' :
           isFailed ? 'Something Went Wrong' :
           'Creating Your Magic! 🎅'}
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-white/80 mb-8">
          {isComplete
            ? `The magical video from Santa for ${childrenText} is ready!`
            : isFailed
            ? 'There was a problem creating your video. Our team is working on it!'
            : `Santa&apos;s elves are creating a magical video for ${childrenText}...`}
        </p>

        {/* Progress Card (Generating) */}
        {isGenerating && (
          <div className="card-christmas mb-8">
            <h2 className="text-lg font-bold text-christmas-gold mb-4">
              {status.progress.stageLabel}
            </h2>

            {/* Progress bar */}
            <div className="w-full bg-white/10 rounded-full h-4 mb-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-christmas-green to-christmas-gold h-4 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${status.progress.percentage}%` }}
              />
            </div>

            <div className="flex justify-between text-sm text-white/70 mb-4">
              <span>{status.progress.percentage}% complete</span>
              <span>{status.progress.scenesComplete} of {status.progress.totalScenes} scenes</span>
            </div>

            {/* Time estimate */}
            {status.progress.estimatedTimeRemaining && (
              <p className="text-white/60 text-sm mb-4">
                Estimated time remaining: {formatTime(status.progress.estimatedTimeRemaining)}
              </p>
            )}

            {/* Scene progress visualization */}
            <div className="flex justify-center gap-2 mb-4">
              {Array.from({ length: 8 }, (_, i) => i + 1).map((sceneNum) => (
                <div
                  key={sceneNum}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                    sceneNum <= status.progress.scenesComplete
                      ? 'bg-christmas-green text-white'
                      : 'bg-white/10 text-white/40'
                  }`}
                >
                  {sceneNum <= status.progress.scenesComplete ? '✓' : sceneNum}
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 pt-4 mt-4">
              <p className="text-white/50 text-xs">
                You can close this page - we&apos;ll email you when your video is ready!
              </p>
            </div>
          </div>
        )}

        {/* Complete Card */}
        {isComplete && status.videoUrl && (
          <div className="card-christmas mb-8">
            <h2 className="text-lg font-bold text-christmas-gold mb-4">
              Your magical video is ready!
            </h2>
            <p className="text-white/80 mb-6">
              Santa has created a special message for {childrenText}.
              Download now and share the magic!
            </p>
            <div className="space-y-4">
              <a
                href={status.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-christmas px-8 py-4 inline-block text-lg"
              >
                Watch Video 🎬
              </a>
              <div>
                <a
                  href={status.videoUrl}
                  download={`santa-video-${status.childrenNames.join('-')}.mp4`}
                  className="text-christmas-gold hover:text-christmas-gold/80 underline text-sm"
                >
                  Download MP4
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Live Santa Call - Premium Bonus (only after video is ready) */}
        {isComplete && (
          <div className="card-christmas mb-8 border-2 border-christmas-gold/50 bg-gradient-to-br from-christmas-red/20 to-christmas-green/20">
            <div className="text-center">
              <div className="text-5xl mb-4">📞🎅</div>
              <h2 className="text-2xl font-bold text-christmas-gold mb-2">
                Talk to Santa LIVE!
              </h2>
              <p className="text-white/80 mb-4">
                Your video is ready - now {childrenText} can talk
                to Santa live!
              </p>
              <div className="bg-black/20 rounded-lg p-4 mb-6">
                <ul className="text-white/70 text-sm space-y-2 text-left max-w-xs mx-auto">
                  <li className="flex items-center gap-2">
                    <span className="text-christmas-green">✓</span>
                    Santa knows everything about {childrenText}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-christmas-green">✓</span>
                    Real-time conversation
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-christmas-green">✓</span>
                    Ask Santa questions live!
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-christmas-gold">⚡</span>
                    Requires stable internet connection
                  </li>
                </ul>
              </div>
              <Link
                href={`/call/${orderId}`}
                className="btn-christmas px-8 py-4 text-lg inline-flex items-center gap-2 animate-pulse hover:animate-none"
              >
                <span>Start Call with Santa</span>
                <span className="text-2xl">🎄</span>
              </Link>
            </div>
          </div>
        )}

        {/* Failed Card */}
        {isFailed && (
          <div className="card-christmas border-red-500/50 mb-8">
            <h2 className="text-lg font-bold text-red-400 mb-4">
              We encountered a problem
            </h2>
            <p className="text-white/80 mb-4">
              Santa&apos;s elves encountered an issue while creating your video.
              Don&apos;t worry - our team has been notified and is working on it!
            </p>
            {status.errorMessage && (
              <p className="text-white/50 text-xs font-mono bg-white/5 p-2 rounded mb-4">
                {status.errorMessage}
              </p>
            )}
            <p className="text-white/70 text-sm">
              We&apos;ll email you when the issue is resolved. If you don&apos;t hear from us within 24 hours,
              please contact us.
            </p>
          </div>
        )}

        {/* Order Info */}
        <div className="space-y-4">
          <p className="text-white/60 text-sm">
            Order number: <span className="font-mono">{orderId}</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="btn-christmas px-6 py-3"
            >
              My Orders
            </Link>
            <Link
              href="/"
              className="px-6 py-3 text-white/70 hover:text-white transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>

        {/* Festive decoration */}
        <div className="mt-12 text-4xl space-x-4">
          🎁 🎄 ⭐ 🎄 🎁
        </div>

        {/* Branding */}
        <p className="mt-8 text-white/30 text-xs">
          The Santa Experience - Personalized Video from Santa 🎅
        </p>
      </div>
    </div>
  )
}
