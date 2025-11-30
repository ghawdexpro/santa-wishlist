'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'

interface SavedKeyframe {
  sceneNumber: number
  childId?: string
  childName?: string
  startKeyframeUrl: string
  endKeyframeUrl: string
}

interface OrderData {
  id: string
  status: string
  keyframe_urls: SavedKeyframe[]
  final_video_url?: string
  error_message?: string
  children: Array<{
    id: string
    name: string
    age: number
    photo_url?: string
  }>
}

const SCENE_NAMES: Record<number, string> = {
  4: 'Photo Comes Alive',
  5: 'Name Reveal',
  6: "Santa's Message",
  8: 'Epic Launch',
}

export default function AdminReviewPage() {
  const params = useParams()
  const orderId = params.orderId as string

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminKey, setAdminKey] = useState('')
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(false)
  const [approving, setApproving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [expandedKeyframes, setExpandedKeyframes] = useState<Set<string>>(new Set())

  const fetchOrder = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/get-order?orderId=${orderId}&adminKey=${adminKey}`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data.order)
        setIsAuthenticated(true)
      } else {
        const data = await response.json()
        setMessage({ type: 'error', text: data.error || 'Invalid admin key' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to fetch order' })
    }
    setLoading(false)
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    fetchOrder()
  }

  const handleApprove = async () => {
    setApproving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/approve-and-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setMessage({ type: 'success', text: 'Video generation started! Refresh to check status.' })
        // Refresh order data
        setTimeout(() => fetchOrder(), 2000)
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to start video generation' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Request failed' })
    }

    setApproving(false)
  }

  const toggleKeyframe = (key: string) => {
    setExpandedKeyframes(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  // Group keyframes by child
  const keyframesByChild = (order?.keyframe_urls || []).reduce((acc, kf) => {
    const childName = kf.childName || 'Unknown'
    if (!acc[childName]) {
      acc[childName] = []
    }
    acc[childName].push(kf)
    return acc
  }, {} as Record<string, SavedKeyframe[]>)

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen px-4 py-8 flex items-center justify-center">
        <div className="card-christmas max-w-md w-full">
          <h1 className="text-2xl font-bold glow-gold text-center mb-6">
            Review Order Keyframes
          </h1>
          <p className="text-white/70 text-center mb-4 text-sm">
            Order: {orderId.slice(0, 8)}...
          </p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="Enter admin key..."
              className="input-christmas mb-4"
            />
            <button
              type="submit"
              className="btn-christmas w-full"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'View Keyframes'}
            </button>
          </form>
          {message && (
            <p className={`mt-4 text-center ${message.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
              {message.text}
            </p>
          )}
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen px-4 py-8 flex items-center justify-center">
        <div className="card-christmas">
          <p className="text-white/70">Order not found</p>
        </div>
      </div>
    )
  }

  const canApprove = order.status === 'keyframes_ready'
  const isGenerating = order.status === 'generating_videos'
  const isComplete = order.status === 'complete'
  const isFailed = order.status === 'failed'

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold glow-gold">Keyframe Review</h1>
            <p className="text-white/70 mt-1">
              Order: {orderId.slice(0, 8)}... | Children: {order.children?.length || 0}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchOrder}
              className="btn-christmas btn-green"
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <a href="/admin/scenes" className="btn-christmas">
              Back to Scenes
            </a>
          </div>
        </div>

        {/* Status Banner */}
        <div className={`card-christmas mb-6 ${
          isComplete ? 'border-green-500' :
          isFailed ? 'border-red-500' :
          isGenerating ? 'border-yellow-500' :
          canApprove ? 'border-blue-500' : 'border-white/20'
        }`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-lg font-bold">
                Status: <span className={
                  isComplete ? 'text-green-400' :
                  isFailed ? 'text-red-400' :
                  isGenerating ? 'text-yellow-400' :
                  canApprove ? 'text-blue-400' : 'text-white/70'
                }>
                  {order.status.toUpperCase().replace(/_/g, ' ')}
                </span>
              </p>
              {order.error_message && (
                <p className="text-red-400 text-sm mt-1">{order.error_message}</p>
              )}
              {isComplete && order.final_video_url && (
                <a
                  href={order.final_video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300 text-sm mt-1 inline-block"
                >
                  View Final Video
                </a>
              )}
            </div>

            {canApprove && (
              <button
                onClick={handleApprove}
                disabled={approving}
                className="btn-christmas text-lg py-3 px-8"
              >
                {approving ? 'Starting Video Generation...' : 'Approve & Generate Videos'}
              </button>
            )}
          </div>
        </div>

        {message && (
          <div className={`card-christmas mb-6 ${message.type === 'error' ? 'border-red-500' : 'border-green-500'}`}>
            <p className={message.type === 'error' ? 'text-red-400' : 'text-green-400'}>
              {message.text}
            </p>
          </div>
        )}

        {/* Children Overview */}
        <div className="card-christmas mb-6">
          <h2 className="text-xl font-bold mb-4">Children in Order</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {order.children?.map((child, idx) => (
              <div key={child.id} className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  {child.photo_url ? (
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-christmas-gold">
                      <Image
                        src={child.photo_url}
                        alt={child.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border-2 border-white/20">
                      <span className="text-xl">{idx + 1}</span>
                    </div>
                  )}
                  <div>
                    <p className="font-bold">{child.name}</p>
                    <p className="text-white/60 text-sm">Age: {child.age}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Keyframes by Child */}
        {Object.entries(keyframesByChild).map(([childName, keyframes]) => (
          <div key={childName} className="card-christmas mb-6">
            <h2 className="text-xl font-bold mb-4 glow-gold">
              {childName}&apos;s Scenes
            </h2>

            <div className="grid gap-6">
              {keyframes.sort((a, b) => a.sceneNumber - b.sceneNumber).map((kf) => {
                const key = `${kf.childId}-${kf.sceneNumber}`
                const isExpanded = expandedKeyframes.has(key)

                return (
                  <div key={key} className="bg-white/5 rounded-lg p-4">
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleKeyframe(key)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-christmas-gold/30 flex items-center justify-center text-sm font-bold">
                          {kf.sceneNumber}
                        </span>
                        <span className="font-medium">
                          Scene {kf.sceneNumber}: {SCENE_NAMES[kf.sceneNumber] || 'Unknown'}
                        </span>
                      </div>
                      <span className="text-2xl">{isExpanded ? '−' : '+'}</span>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Start Keyframe */}
                        <div className="bg-black/30 rounded-lg p-3">
                          <p className="text-blue-400 text-sm font-medium mb-2">START Keyframe</p>
                          <div className="aspect-video relative rounded overflow-hidden border border-white/20">
                            {kf.startKeyframeUrl ? (
                              <Image
                                src={kf.startKeyframeUrl}
                                alt={`Scene ${kf.sceneNumber} Start`}
                                fill
                                className="object-contain"
                                unoptimized={kf.startKeyframeUrl.startsWith('data:')}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white/40">
                                No keyframe
                              </div>
                            )}
                          </div>
                        </div>

                        {/* End Keyframe */}
                        <div className="bg-black/30 rounded-lg p-3">
                          <p className="text-purple-400 text-sm font-medium mb-2">END Keyframe</p>
                          <div className="aspect-video relative rounded overflow-hidden border border-white/20">
                            {kf.endKeyframeUrl ? (
                              <Image
                                src={kf.endKeyframeUrl}
                                alt={`Scene ${kf.sceneNumber} End`}
                                fill
                                className="object-contain"
                                unoptimized={kf.endKeyframeUrl.startsWith('data:')}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white/40">
                                No keyframe
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* Summary */}
        <div className="card-christmas">
          <h3 className="text-lg font-bold mb-4">Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-400">
                {order.keyframe_urls?.length || 0}
              </div>
              <div className="text-white/60 text-sm">Total Scenes</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-400">
                {(order.keyframe_urls?.length || 0) * 2}
              </div>
              <div className="text-white/60 text-sm">Total Keyframes</div>
            </div>
            <div>
              <div className="text-3xl font-bold glow-gold">
                {order.children?.length || 0}
              </div>
              <div className="text-white/60 text-sm">Children</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-400">
                {Object.keys(keyframesByChild).length}
              </div>
              <div className="text-white/60 text-sm">Sets Ready</div>
            </div>
          </div>
        </div>

        {/* Cost Info */}
        <div className="card-christmas mt-4 text-sm text-white/60">
          <p><strong>Next step:</strong> Click &quot;Approve &amp; Generate Videos&quot; to start Veo video generation (~$2-4 per child)</p>
        </div>
      </div>
    </div>
  )
}
