'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SantaVideoCall } from '@/components/SantaVideoCall'
import Snowfall from '@/components/Snowfall'

interface Child {
  id: string
  name: string
  age: number
  sequence_number: number
}

interface Order {
  id: string
  status: string
  child_count: number
}

export default function CallPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.orderId as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [order, setOrder] = useState<Order | null>(null)
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [callStarted, setCallStarted] = useState(false)
  const [callEnded, setCallEnded] = useState(false)

  useEffect(() => {
    async function loadOrder() {
      try {
        const supabase = createClient()

        // Check authentication
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        // Load order
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single()

        if (orderError || !orderData) {
          setError('Order not found')
          setLoading(false)
          return
        }

        // Verify ownership
        if (orderData.user_id !== user.id) {
          setError('Access denied to this order')
          setLoading(false)
          return
        }

        setOrder(orderData)

        // Load children
        const { data: childrenData, error: childrenError } = await supabase
          .from('children')
          .select('*')
          .eq('order_id', orderId)
          .order('sequence_number')

        if (childrenError) {
          console.error('Error loading children:', childrenError)
        }

        if (childrenData && childrenData.length > 0) {
          setChildren(childrenData)
          // Auto-select first child if only one
          if (childrenData.length === 1) {
            setSelectedChild(childrenData[0])
          }
        } else {
          // Fallback to legacy single-child data
          // This handles orders created before multi-child support
          setChildren([{
            id: 'legacy',
            name: (orderData as unknown as { child_name?: string }).child_name || 'Child',
            age: (orderData as unknown as { child_age?: number }).child_age || 8,
            sequence_number: 1,
          }])
          setSelectedChild({
            id: 'legacy',
            name: (orderData as unknown as { child_name?: string }).child_name || 'Child',
            age: (orderData as unknown as { child_age?: number }).child_age || 8,
            sequence_number: 1,
          })
        }

        setLoading(false)
      } catch (err) {
        console.error('Error loading order:', err)
        setError('Error loading order')
        setLoading(false)
      }
    }

    loadOrder()
  }, [orderId, router])

  const handleCallEnd = () => {
    setCallEnded(true)
    setCallStarted(false)
  }

  const handleCallError = (errorMsg: string) => {
    console.error('Call error:', errorMsg)
    setError(errorMsg)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Snowfall />
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">🎅</div>
          <p className="text-white text-xl">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Snowfall />
        <div className="card-christmas max-w-md text-center">
          <div className="text-6xl mb-4">❄️</div>
          <h1 className="text-2xl font-bold text-christmas-red mb-4">Error</h1>
          <p className="text-white/70 mb-6">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="btn-christmas"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Child selection screen (for multi-child orders)
  if (!selectedChild && children.length > 1) {
    return (
      <div className="min-h-screen py-8 px-4">
        <Snowfall />
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎅</div>
            <h1 className="text-3xl font-bold glow-gold mb-2">
              Call with Santa Claus
            </h1>
            <p className="text-white/70">
              Select the child who will talk to Santa
            </p>
          </div>

          <div className="grid gap-4">
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => setSelectedChild(child)}
                className="card-christmas text-left hover:border-christmas-gold/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="text-4xl">👦</div>
                  <div>
                    <h3 className="text-xl font-bold text-christmas-gold">
                      {child.name}
                    </h3>
                    <p className="text-white/60">
                      {child.age} years old
                    </p>
                  </div>
                  <div className="ml-auto text-christmas-gold">
                    →
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-white/60 hover:text-white transition-colors"
            >
              ← Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Call ended screen
  if (callEnded) {
    return (
      <div className="min-h-screen flex items-center justify-center py-8 px-4">
        <Snowfall />
        <div className="card-christmas max-w-md text-center">
          <div className="text-6xl mb-4">🎄</div>
          <h1 className="text-3xl font-bold glow-gold mb-4">
            Merry Christmas!
          </h1>
          <p className="text-white/70 mb-2">
            {selectedChild?.name} had a wonderful chat with Santa!
          </p>
          <p className="text-white/50 text-sm mb-6">
            Santa remembers all the good children.
          </p>

          <div className="space-y-3">
            {children.length > 1 && (
              <button
                onClick={() => {
                  setSelectedChild(null)
                  setCallEnded(false)
                }}
                className="btn-christmas w-full"
              >
                Select Another Child
              </button>
            )}
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Main call interface
  return (
    <div className="min-h-screen py-8 px-4">
      <Snowfall />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold glow-gold mb-2">
            Call with Santa Claus
          </h1>
          {selectedChild && (
            <p className="text-white/70">
              Child: <span className="text-christmas-gold font-medium">{selectedChild.name}</span>
            </p>
          )}
        </div>

        {/* Video Call Component */}
        {selectedChild && (
          <SantaVideoCall
            childName={selectedChild.name}
            childId={selectedChild.id !== 'legacy' ? selectedChild.id : undefined}
            childAge={selectedChild.age}
            onEnd={handleCallEnd}
            onError={handleCallError}
          />
        )}

        {/* Back button */}
        <div className="mt-8 text-center">
          {children.length > 1 && !callStarted && (
            <button
              onClick={() => setSelectedChild(null)}
              className="text-white/60 hover:text-white transition-colors"
            >
              ← Select Another Child
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
