'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { WishlistItem } from '@/types/database'

interface ItemCardProps {
  item: WishlistItem
  isOwner: boolean
  onDelete: (id: string) => void
  onUpdate: (item: WishlistItem) => void
  showClaimed?: boolean
}

export default function ItemCard({ item, isOwner, onDelete, onUpdate, showClaimed = false }: ItemCardProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Delete this item?')) return
    setLoading(true)

    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('id', item.id)

    if (error) {
      alert('Error deleting item')
      setLoading(false)
      return
    }

    onDelete(item.id)
  }

  const handleClaim = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('wishlist_items')
      .update({
        is_claimed: !item.is_claimed,
        claimed_by: item.is_claimed ? null : user?.id || null,
      })
      .eq('id', item.id)
      .select()
      .single()

    if (error) {
      alert('Error updating item')
      setLoading(false)
      return
    }

    onUpdate(data)
    setLoading(false)
  }

  const priorityColors = {
    high: 'bg-red-500/20 text-red-300 border-red-500/50',
    medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
    low: 'bg-green-500/20 text-green-300 border-green-500/50',
  }

  const priorityIcons = {
    high: '🔥',
    medium: '⭐',
    low: '💚',
  }

  // Don't show claimed items to the owner (it's a surprise!)
  if (isOwner && item.is_claimed && !showClaimed) {
    return null
  }

  return (
    <div className={`card-christmas ${item.is_claimed && !isOwner ? 'opacity-60' : ''}`}>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="flex items-start gap-2 mb-2">
            <h3 className="text-xl font-bold">{item.name}</h3>
            <span className={`px-2 py-0.5 rounded text-xs border ${priorityColors[item.priority]}`}>
              {priorityIcons[item.priority]} {item.priority}
            </span>
          </div>

          {item.description && (
            <p className="text-white/70 text-sm mb-2">{item.description}</p>
          )}

          <div className="flex flex-wrap gap-3 text-sm">
            {item.price && (
              <span className="text-christmas-gold font-bold">
                ${item.price.toFixed(2)}
              </span>
            )}
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                View Product →
              </a>
            )}
          </div>

          {item.is_claimed && !isOwner && (
            <div className="mt-2 text-green-400 text-sm font-bold">
              ✓ Someone is getting this!
            </div>
          )}
        </div>

        <div className="flex sm:flex-col gap-2">
          {isOwner ? (
            <button
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-4 rounded-lg transition-colors"
            >
              Delete
            </button>
          ) : (
            <button
              onClick={handleClaim}
              disabled={loading}
              className={`text-sm py-2 px-4 rounded-lg transition-colors ${
                item.is_claimed
                  ? 'bg-gray-600 hover:bg-gray-700 text-white'
                  : 'btn-christmas btn-green'
              }`}
            >
              {loading ? '...' : item.is_claimed ? 'Unclaim' : 'Claim Gift 🎁'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
