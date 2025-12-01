'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { OrderCard } from '@/components/OrderCard'
import type { Order } from '@/types/database'

interface DashboardClientProps {
  initialOrders: Order[]
}

export function DashboardClient({ initialOrders }: DashboardClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch('/api/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Failed to refresh orders:', error)
    }
  }, [])

  // Auto-refresh every 10 seconds if there are orders being generated
  useEffect(() => {
    const hasGeneratingOrders = orders.some(
      order => order.status === 'paid' || order.status === 'generating' || order.status === 'keyframes_ready'
    )

    if (!hasGeneratingOrders) return

    const interval = setInterval(() => {
      setIsRefreshing(true)
      fetchOrders().finally(() => setIsRefreshing(false))
    }, 10000)

    return () => clearInterval(interval)
  }, [orders, fetchOrders])

  const hasOrders = orders && orders.length > 0

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold glow-gold">Moje Zamówienia</h1>
            <p className="text-white/70 mt-1">
              Twoje spersonalizowane filmy od Mikołaja
              {isRefreshing && (
                <span className="ml-2 text-christmas-gold animate-pulse">
                  (odświeżanie...)
                </span>
              )}
            </p>
          </div>
          <Link
            href="/create"
            className="btn-christmas"
          >
            Stwórz Nowy Film
          </Link>
        </div>

        {hasOrders ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <div className="card-christmas text-center py-16">
            <div className="text-6xl mb-4">🎅</div>
            <h2 className="text-2xl font-bold mb-2">Brak filmów!</h2>
            <p className="text-white/70 mb-6">
              Stwórz magiczny, spersonalizowany film od Mikołaja dla swojego dziecka
            </p>
            <Link
              href="/create"
              className="btn-christmas inline-block"
            >
              Stwórz Swój Pierwszy Film
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
