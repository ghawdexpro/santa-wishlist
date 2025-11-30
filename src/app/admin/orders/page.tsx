'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface OrderSummary {
  id: string
  status: string
  created_at: string
  child_count: number
  keyframe_count: number
  children_names: string[]
  final_video_url?: string
  error_message?: string
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'text-white/60',
  paid: 'text-blue-400',
  generating_keyframes: 'text-yellow-400',
  keyframes_ready: 'text-purple-400',
  generating_videos: 'text-orange-400',
  complete: 'text-green-400',
  failed: 'text-red-400',
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  paid: 'Paid - Awaiting',
  generating_keyframes: 'Generating Keyframes...',
  keyframes_ready: 'Ready for Review',
  generating_videos: 'Generating Videos...',
  complete: 'Complete',
  failed: 'Failed',
}

export default function AdminOrdersPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminKey, setAdminKey] = useState('')
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/list-orders?adminKey=${adminKey}`)
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
        setIsAuthenticated(true)
      } else {
        const data = await response.json()
        setMessage({ type: 'error', text: data.error || 'Invalid admin key' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to fetch orders' })
    }
    setLoading(false)
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    fetchOrders()
  }

  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter(o => o.status === statusFilter)

  const readyForReviewCount = orders.filter(o => o.status === 'keyframes_ready').length

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen px-4 py-8 flex items-center justify-center">
        <div className="card-christmas max-w-md w-full">
          <h1 className="text-2xl font-bold glow-gold text-center mb-6">
            Order Management
          </h1>
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
              {loading ? 'Loading...' : 'View Orders'}
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

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold glow-gold">Order Management</h1>
            <p className="text-white/70 mt-1">
              {orders.length} total orders | {readyForReviewCount} ready for review
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchOrders}
              className="btn-christmas btn-green"
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <Link href="/admin/scenes" className="btn-christmas">
              Scene Generator
            </Link>
          </div>
        </div>

        {/* Alert for orders ready for review */}
        {readyForReviewCount > 0 && (
          <div className="card-christmas mb-6 border-purple-500 bg-purple-500/10">
            <div className="flex items-center gap-3">
              <span className="text-3xl">!</span>
              <div>
                <p className="font-bold text-purple-400">
                  {readyForReviewCount} order(s) ready for keyframe review
                </p>
                <p className="text-white/70 text-sm">
                  Review and approve keyframes to start video generation
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="card-christmas mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded text-sm transition-colors ${
                statusFilter === 'all'
                  ? 'bg-christmas-gold text-black font-bold'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              All ({orders.length})
            </button>
            <button
              onClick={() => setStatusFilter('keyframes_ready')}
              className={`px-4 py-2 rounded text-sm transition-colors ${
                statusFilter === 'keyframes_ready'
                  ? 'bg-purple-500 text-white font-bold'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              Ready for Review ({orders.filter(o => o.status === 'keyframes_ready').length})
            </button>
            <button
              onClick={() => setStatusFilter('generating_videos')}
              className={`px-4 py-2 rounded text-sm transition-colors ${
                statusFilter === 'generating_videos'
                  ? 'bg-orange-500 text-white font-bold'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              Generating ({orders.filter(o => o.status === 'generating_videos').length})
            </button>
            <button
              onClick={() => setStatusFilter('complete')}
              className={`px-4 py-2 rounded text-sm transition-colors ${
                statusFilter === 'complete'
                  ? 'bg-green-500 text-white font-bold'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              Complete ({orders.filter(o => o.status === 'complete').length})
            </button>
            <button
              onClick={() => setStatusFilter('failed')}
              className={`px-4 py-2 rounded text-sm transition-colors ${
                statusFilter === 'failed'
                  ? 'bg-red-500 text-white font-bold'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              Failed ({orders.filter(o => o.status === 'failed').length})
            </button>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="card-christmas text-center">
              <p className="text-white/60">No orders found</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="card-christmas">
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                  <div className="flex-grow">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className={`font-bold ${STATUS_COLORS[order.status] || 'text-white/60'}`}>
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                      <span className="text-white/40">|</span>
                      <span className="text-white/60 text-sm font-mono">
                        {order.id.slice(0, 8)}...
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="text-white/70">
                        Children: {order.children_names?.join(', ') || `${order.child_count} child(ren)`}
                      </span>
                      <span className="text-white/50">
                        {order.keyframe_count} keyframes
                      </span>
                      <span className="text-white/40">
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {order.error_message && (
                      <p className="text-red-400 text-sm mt-2">{order.error_message}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {order.status === 'keyframes_ready' && (
                      <Link
                        href={`/admin/review/${order.id}?key=${adminKey}`}
                        className="btn-christmas"
                      >
                        Review Keyframes
                      </Link>
                    )}

                    {order.status === 'complete' && order.final_video_url && (
                      <a
                        href={order.final_video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-christmas btn-green"
                      >
                        View Video
                      </a>
                    )}

                    <Link
                      href={`/admin/review/${order.id}?key=${adminKey}`}
                      className="bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-sm py-2 px-4 rounded transition-colors"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Stats */}
        <div className="card-christmas mt-8">
          <h3 className="text-lg font-bold mb-4">Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-white">
                {orders.length}
              </div>
              <div className="text-white/60 text-sm">Total Orders</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-400">
                {orders.filter(o => o.status === 'keyframes_ready').length}
              </div>
              <div className="text-white/60 text-sm">Awaiting Review</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-400">
                {orders.filter(o => o.status === 'generating_videos').length}
              </div>
              <div className="text-white/60 text-sm">Generating</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-400">
                {orders.filter(o => o.status === 'complete').length}
              </div>
              <div className="text-white/60 text-sm">Complete</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-400">
                {orders.filter(o => o.status === 'failed').length}
              </div>
              <div className="text-white/60 text-sm">Failed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
