'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Child {
  id: string
  name: string
  age: number | null
  good_behavior: string | null
  thing_to_improve: string | null
  thing_to_learn: string | null
  custom_message: string | null
  sequence_number: number
}

interface Order {
  id: string
  status: string
  final_video_url: string | null
  created_at: string
  children: Child[]
}

export default function OrderEditPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params)
  const router = useRouter()
  const supabase = createClient()
  const [order, setOrder] = useState<Order | null>(null)
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    const fetchOrder = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('orders')
        .select('id, status, final_video_url, created_at, children(*)')
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single()

      if (error || !data) {
        router.push('/dashboard')
        return
      }

      setOrder(data as Order)
      setChildren((data.children as Child[]).sort((a, b) => a.sequence_number - b.sequence_number))
      setLoading(false)
    }

    fetchOrder()
  }, [orderId, supabase, router])

  const updateChild = (childId: string, field: keyof Child, value: string | number) => {
    setChildren(prev =>
      prev.map(child =>
        child.id === childId ? { ...child, [field]: value } : child
      )
    )
    setHasChanges(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      // Update each child
      for (const child of children) {
        const { error } = await supabase
          .from('children')
          .update({
            name: child.name,
            age: child.age,
            good_behavior: child.good_behavior,
            thing_to_improve: child.thing_to_improve,
            thing_to_learn: child.thing_to_learn,
            custom_message: child.custom_message,
          })
          .eq('id', child.id)

        if (error) throw error
      }

      // If order is already complete/paid, mark for re-generation
      if (order && (order.status === 'complete' || order.status === 'paid')) {
        await supabase
          .from('orders')
          .update({ status: 'needs_regeneration' })
          .eq('id', orderId)
      }

      setMessage({ type: 'success', text: 'Changes saved successfully!' })
      setHasChanges(false)
    } catch {
      setMessage({ type: 'error', text: 'Failed to save changes' })
    }

    setSaving(false)
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      complete: 'bg-green-500/20 text-green-400',
      generating: 'bg-yellow-500/20 text-yellow-400',
      paid: 'bg-blue-500/20 text-blue-400',
      failed: 'bg-red-500/20 text-red-400',
      draft: 'bg-gray-500/20 text-gray-400',
      needs_regeneration: 'bg-orange-500/20 text-orange-400',
    }
    return colors[status] || 'bg-gray-500/20 text-gray-400'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/60">Loading...</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/60">Order not found</div>
      </div>
    )
  }

  const isPaidOrComplete = order.status === 'paid' || order.status === 'complete'

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/account" className="text-white/60 hover:text-white text-sm mb-2 inline-block">
              &larr; Back to Account
            </Link>
            <h1 className="text-3xl font-bold glow-gold">Edit Order</h1>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(order.status)}`}>
            {order.status.replace('_', ' ').charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
          </span>
        </div>

        {/* Warning for paid orders */}
        {isPaidOrComplete && (
          <div className="bg-orange-500/20 border border-orange-500/50 rounded-lg px-4 py-3 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-orange-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-orange-400 font-medium">Video already generated</p>
                <p className="text-orange-400/80 text-sm">Changes will require video re-generation. Additional charges may apply.</p>
              </div>
            </div>
          </div>
        )}

        {/* Video Download */}
        {order.final_video_url && (
          <div className="card-christmas mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-christmas-gold/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-christmas-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-medium">Your Video is Ready!</p>
                  <p className="text-white/50 text-sm">Download your personalized Santa video</p>
                </div>
              </div>
              <a
                href={order.final_video_url}
                download
                className="btn-christmas text-sm py-2 px-4 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </a>
            </div>
          </div>
        )}

        {/* Children Editing */}
        <h2 className="text-xl font-bold text-white mb-4">Children</h2>
        <div className="space-y-6">
          {children.map((child, index) => (
            <div key={child.id} className="card-christmas">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">
                  {index === 0 ? '👧' : index === 1 ? '👦' : '🧒'}
                </span>
                <h3 className="text-lg font-bold text-white">Child {index + 1}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/60 text-sm mb-1">Name</label>
                  <input
                    type="text"
                    value={child.name}
                    onChange={(e) => updateChild(child.id, 'name', e.target.value)}
                    className="input-christmas w-full"
                    placeholder="Child's name"
                  />
                </div>

                <div>
                  <label className="block text-white/60 text-sm mb-1">Age</label>
                  <input
                    type="number"
                    value={child.age || ''}
                    onChange={(e) => updateChild(child.id, 'age', parseInt(e.target.value) || 0)}
                    className="input-christmas w-full"
                    placeholder="Age"
                    min="1"
                    max="18"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-white/60 text-sm mb-1">Good Behavior</label>
                  <textarea
                    value={child.good_behavior || ''}
                    onChange={(e) => updateChild(child.id, 'good_behavior', e.target.value)}
                    className="input-christmas w-full h-20 resize-none"
                    placeholder="What has this child done well?"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-white/60 text-sm mb-1">Thing to Improve</label>
                  <textarea
                    value={child.thing_to_improve || ''}
                    onChange={(e) => updateChild(child.id, 'thing_to_improve', e.target.value)}
                    className="input-christmas w-full h-20 resize-none"
                    placeholder="What could they work on?"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-white/60 text-sm mb-1">Thing to Learn</label>
                  <textarea
                    value={child.thing_to_learn || ''}
                    onChange={(e) => updateChild(child.id, 'thing_to_learn', e.target.value)}
                    className="input-christmas w-full h-20 resize-none"
                    placeholder="What would you like them to learn?"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-white/60 text-sm mb-1">Custom Message from Santa</label>
                  <textarea
                    value={child.custom_message || ''}
                    onChange={(e) => updateChild(child.id, 'custom_message', e.target.value)}
                    className="input-christmas w-full h-24 resize-none"
                    placeholder="Any special message Santa should say?"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Message */}
        {message && (
          <div className={`mt-6 px-4 py-3 rounded-lg ${
            message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
          <Link
            href="/account"
            className="text-white/60 hover:text-white transition-colors"
          >
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="btn-christmas py-2 px-6 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
