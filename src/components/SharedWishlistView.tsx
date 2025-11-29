'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Wishlist, WishlistItem } from '@/types/database'
import ItemCard from './ItemCard'

interface SharedWishlistViewProps {
  wishlist: Wishlist & { profiles?: { full_name: string | null } | null }
  items: WishlistItem[]
  isOwner: boolean
}

export default function SharedWishlistView({ wishlist, items: initialItems, isOwner }: SharedWishlistViewProps) {
  const [items, setItems] = useState(initialItems)
  const ownerName = wishlist.profiles?.full_name || 'Someone special'

  const handleItemUpdated = (updatedItem: WishlistItem) => {
    setItems(items.map(item => item.id === updatedItem.id ? updatedItem : item))
  }

  // Filter out claimed items for the owner (surprise!)
  const visibleItems = isOwner
    ? items.filter(item => !item.is_claimed)
    : items

  return (
    <div>
      <div className="card-christmas mb-8 text-center">
        <div className="text-6xl mb-4">🎄</div>
        <h1 className="text-3xl font-bold glow-gold">{wishlist.title}</h1>
        <p className="text-white/70 mt-2">
          {isOwner
            ? "This is your wishlist! Share this link with family."
            : `${ownerName}'s Christmas Wishlist`}
        </p>
        {wishlist.description && (
          <p className="text-white/60 mt-4 italic">&ldquo;{wishlist.description}&rdquo;</p>
        )}

        {isOwner && (
          <Link
            href={`/dashboard/wishlist/${wishlist.id}`}
            className="btn-christmas inline-block mt-4"
          >
            Edit Wishlist
          </Link>
        )}
      </div>

      {!isOwner && (
        <div className="card-christmas mb-6 bg-green-500/10 border-green-500/30">
          <p className="text-center text-green-300">
            🎁 Click &ldquo;Claim Gift&rdquo; to let others know you&apos;re getting this item.
            Don&apos;t worry - {ownerName} won&apos;t see who claimed what!
          </p>
        </div>
      )}

      {visibleItems.length > 0 ? (
        <div className="grid gap-4">
          {visibleItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              isOwner={isOwner}
              onDelete={() => {}}
              onUpdate={handleItemUpdated}
            />
          ))}
        </div>
      ) : (
        <div className="card-christmas text-center py-12">
          <div className="text-5xl mb-4">📝</div>
          <p className="text-white/70">
            {isOwner
              ? 'No unclaimed items! Looks like your family is taking care of everything.'
              : 'No items in this wishlist yet. Check back later!'}
          </p>
        </div>
      )}

      {!isOwner && (
        <div className="mt-8 text-center">
          <p className="text-white/60 mb-4">Want to create your own wishlist?</p>
          <Link href="/signup" className="btn-christmas">
            Create Your List 🎅
          </Link>
        </div>
      )}
    </div>
  )
}
