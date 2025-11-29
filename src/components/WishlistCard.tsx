'use client'

import Link from 'next/link'
import { Wishlist } from '@/types/database'

interface WishlistCardProps {
  wishlist: Wishlist
}

export default function WishlistCard({ wishlist }: WishlistCardProps) {
  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/list/${wishlist.share_code}`

  const copyShareLink = async () => {
    await navigator.clipboard.writeText(shareUrl)
    alert('Share link copied to clipboard!')
  }

  return (
    <div className="card-christmas group">
      <div className="flex justify-between items-start mb-4">
        <div className="text-4xl gift-icon">🎁</div>
        <span className={`px-2 py-1 rounded text-xs ${wishlist.is_public ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
          {wishlist.is_public ? 'Public' : 'Private'}
        </span>
      </div>

      <h3 className="text-xl font-bold mb-2 group-hover:text-christmas-gold transition-colors">
        {wishlist.title}
      </h3>

      {wishlist.description && (
        <p className="text-white/60 text-sm mb-4 line-clamp-2">
          {wishlist.description}
        </p>
      )}

      <div className="flex gap-2 mt-4">
        <Link
          href={`/dashboard/wishlist/${wishlist.id}`}
          className="btn-christmas text-sm py-2 px-4 flex-1 text-center"
        >
          Edit
        </Link>
        <button
          onClick={copyShareLink}
          className="btn-christmas btn-green text-sm py-2 px-4"
          title="Copy share link"
        >
          🔗
        </button>
      </div>
    </div>
  )
}
