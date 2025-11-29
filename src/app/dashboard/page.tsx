import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import WishlistCard from '@/components/WishlistCard'
import CreateWishlistButton from '@/components/CreateWishlistButton'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: wishlists } = await supabase
    .from('wishlists')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold glow-gold">My Wishlists 🎁</h1>
            <p className="text-white/70 mt-1">
              Manage your Christmas wishlists
            </p>
          </div>
          <CreateWishlistButton />
        </div>

        {wishlists && wishlists.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlists.map((wishlist) => (
              <WishlistCard key={wishlist.id} wishlist={wishlist} />
            ))}
          </div>
        ) : (
          <div className="card-christmas text-center py-16">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold mb-2">No wishlists yet!</h2>
            <p className="text-white/70 mb-6">
              Create your first Christmas wishlist and share it with family
            </p>
            <CreateWishlistButton />
          </div>
        )}

        <div className="mt-12 card-christmas">
          <h2 className="text-xl font-bold mb-4 glow-gold">Quick Tips 💡</h2>
          <ul className="space-y-2 text-white/70">
            <li>• Share your wishlist link with family and friends</li>
            <li>• Add links to products so gift-givers know exactly where to buy</li>
            <li>• Set priority levels to help Santa decide what&apos;s most important</li>
            <li>• When someone claims a gift, it stays hidden from you!</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
