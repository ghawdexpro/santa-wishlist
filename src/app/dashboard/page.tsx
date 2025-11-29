import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold glow-gold">My Orders</h1>
            <p className="text-white/70 mt-1">
              Your personalized Santa videos
            </p>
          </div>
          <Link
            href="/create"
            className="btn-christmas"
          >
            Create New Video
          </Link>
        </div>

        {/* Placeholder - will be replaced with order list in Stage 10 */}
        <div className="card-christmas text-center py-16">
          <div className="text-6xl mb-4">🎅</div>
          <h2 className="text-2xl font-bold mb-2">No videos yet!</h2>
          <p className="text-white/70 mb-6">
            Create a magical personalized Santa video for your child
          </p>
          <Link
            href="/create"
            className="btn-christmas inline-block"
          >
            Create Your First Video
          </Link>
        </div>
      </div>
    </div>
  )
}
