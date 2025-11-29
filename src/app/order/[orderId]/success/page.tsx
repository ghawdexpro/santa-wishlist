'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface VideoOperation {
  sceneNumber: number
  status: 'pending' | 'generating' | 'complete' | 'failed'
  operationName: string
  videoUrl?: string
  error?: string
}

export default function PaymentSuccessPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const orderId = params.orderId as string
  const sessionId = searchParams.get('session_id')
  const [loading, setLoading] = useState(true)
  const [generationStarted, setGenerationStarted] = useState(false)
  const [operations, setOperations] = useState<VideoOperation[]>([])
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'generating' | 'complete' | 'failed'>('idle')
  const [completedCount, setCompletedCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)

  // Start video generation
  const startVideoGeneration = useCallback(async () => {
    // Get stored script and keyframes from session
    const storedScript = sessionStorage.getItem('generatedScript')
    const storedKeyframes = sessionStorage.getItem('generatedKeyframes')

    if (!storedScript) {
      console.log('No script found, skipping video generation')
      return
    }

    const script = JSON.parse(storedScript)
    const keyframes = storedKeyframes ? JSON.parse(storedKeyframes) : []

    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          scenes: script.scenes,
          keyframes,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setOperations(data.operations)
        setTotalCount(data.operationsCount)
        setGenerationStarted(true)
        setGenerationStatus('generating')
      }
    } catch (error) {
      console.error('Failed to start video generation:', error)
    }
  }, [orderId])

  // Poll for status updates
  const pollStatus = useCallback(async () => {
    if (operations.length === 0 || generationStatus !== 'generating') return

    try {
      const response = await fetch('/api/generate-video/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          operations,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setOperations(data.operations)
        setCompletedCount(data.completedCount)

        if (data.allComplete) {
          setGenerationStatus(data.anyFailed ? 'failed' : 'complete')
        }
      }
    } catch (error) {
      console.error('Failed to poll status:', error)
    }
  }, [orderId, operations, generationStatus])

  useEffect(() => {
    // Clear the pending order from session storage after capturing data
    const initGeneration = async () => {
      await startVideoGeneration()
      sessionStorage.removeItem('pendingOrder')
      setLoading(false)
    }
    initGeneration()
  }, [startVideoGeneration])

  // Poll every 15 seconds while generating
  useEffect(() => {
    if (generationStatus !== 'generating') return

    const interval = setInterval(pollStatus, 15000)
    return () => clearInterval(interval)
  }, [generationStatus, pollStatus])

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
          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${
            generationStatus === 'complete' ? 'bg-christmas-green' :
            generationStatus === 'failed' ? 'bg-red-600' :
            'bg-christmas-gold animate-pulse'
          }`}>
            <span className="text-5xl">
              {generationStatus === 'complete' ? '✓' :
               generationStatus === 'failed' ? '✗' : '🎬'}
            </span>
          </div>
        </div>

        <h1 className="text-4xl font-bold glow-gold mb-4">
          {generationStatus === 'complete' ? 'Video Complete! 🎄' :
           generationStatus === 'failed' ? 'Generation Issue' :
           'Payment Successful! 🎄'}
        </h1>

        <p className="text-xl text-white/80 mb-8">
          {generationStatus === 'complete'
            ? 'Your magical Santa video is ready!'
            : generationStatus === 'failed'
            ? 'There was an issue generating some scenes. Our team will look into it.'
            : generationStatus === 'generating'
            ? 'The elves are creating your magical video right now...'
            : 'Thank you for your order!'}
        </p>

        {/* Video Generation Progress */}
        {generationStarted && generationStatus === 'generating' && (
          <div className="card-christmas mb-8">
            <h2 className="text-lg font-bold text-christmas-gold mb-4">Video Generation Progress</h2>

            {/* Progress bar */}
            <div className="w-full bg-white/10 rounded-full h-4 mb-4">
              <div
                className="bg-christmas-green h-4 rounded-full transition-all duration-500"
                style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
              />
            </div>
            <p className="text-white/70 mb-4">
              {completedCount} of {totalCount} scenes complete
            </p>

            {/* Scene status list */}
            <div className="space-y-2 text-left">
              {operations.map((op) => (
                <div key={op.sceneNumber} className="flex items-center gap-3 text-sm">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    op.status === 'complete' ? 'bg-christmas-green' :
                    op.status === 'failed' ? 'bg-red-600' :
                    op.status === 'generating' ? 'bg-christmas-gold animate-pulse' :
                    'bg-white/20'
                  }`}>
                    {op.status === 'complete' ? '✓' :
                     op.status === 'failed' ? '✗' :
                     op.status === 'generating' ? '⏳' : op.sceneNumber}
                  </span>
                  <span className="text-white/80">Scene {op.sceneNumber}</span>
                  <span className={`ml-auto text-xs ${
                    op.status === 'complete' ? 'text-green-400' :
                    op.status === 'failed' ? 'text-red-400' :
                    op.status === 'generating' ? 'text-yellow-400' :
                    'text-white/40'
                  }`}>
                    {op.status}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-white/50 text-xs mt-4">
              This may take 5-10 minutes. Feel free to leave this page - we&apos;ll email you when ready!
            </p>
          </div>
        )}

        {/* Completed state */}
        {generationStatus === 'complete' && (
          <div className="card-christmas text-left mb-8">
            <h2 className="text-lg font-bold text-christmas-gold mb-4">Your video is ready!</h2>
            <p className="text-white/80 mb-4">
              Your personalized Santa video has been created. You can download it from your dashboard.
            </p>
            <Link
              href="/dashboard"
              className="btn-christmas px-6 py-3 inline-block"
            >
              Download Video 📥
            </Link>
          </div>
        )}

        {/* Default info (when not generating) */}
        {!generationStarted && (
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
        )}

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
