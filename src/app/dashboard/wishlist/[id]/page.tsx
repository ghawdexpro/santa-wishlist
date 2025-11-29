import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import WishlistEditor from '@/components/WishlistEditor'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function WishlistPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: wishlist } = await supabase
    .from('wishlists')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!wishlist) {
    notFound()
  }

  const { data: items } = await supabase
    .from('wishlist_items')
    .select('*')
    .eq('wishlist_id', id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <WishlistEditor
          wishlist={wishlist}
          items={items || []}
          isOwner={true}
        />
      </div>
    </div>
  )
}
