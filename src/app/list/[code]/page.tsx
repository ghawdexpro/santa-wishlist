import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SharedWishlistView from '@/components/SharedWishlistView'

interface PageProps {
  params: Promise<{ code: string }>
}

export default async function SharedWishlistPage({ params }: PageProps) {
  const { code } = await params
  const supabase = await createClient()

  const { data: wishlist } = await supabase
    .from('wishlists')
    .select('*, profiles(full_name)')
    .eq('share_code', code)
    .single()

  if (!wishlist) {
    notFound()
  }

  const { data: items } = await supabase
    .from('wishlist_items')
    .select('*')
    .eq('wishlist_id', wishlist.id)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false })

  // Get current user to check if they're the owner
  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user?.id === wishlist.user_id

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <SharedWishlistView
          wishlist={wishlist}
          items={items || []}
          isOwner={isOwner}
        />
      </div>
    </div>
  )
}
