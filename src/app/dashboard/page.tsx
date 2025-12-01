import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { OrderCard } from '@/components/OrderCard'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user's orders with children
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      children (*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching orders:', error)
  }

  const hasOrders = orders && orders.length > 0

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold glow-gold">Moje Zamówienia</h1>
            <p className="text-white/70 mt-1">
              Twoje spersonalizowane filmy od Mikołaja
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
