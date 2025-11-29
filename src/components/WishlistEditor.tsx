'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Wishlist, WishlistItem } from '@/types/database'
import ItemCard from './ItemCard'
import AddItemForm from './AddItemForm'

interface WishlistEditorProps {
  wishlist: Wishlist
  items: WishlistItem[]
  isOwner: boolean
}

export default function WishlistEditor({ wishlist, items: initialItems, isOwner }: WishlistEditorProps) {
  const router = useRouter()
  const supabase = createClient()
  const [items, setItems] = useState(initialItems)
  const [showAddForm, setShowAddForm] = useState(false)
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/list/${wishlist.share_code}`
    : ''

  const copyShareLink = async () => {
    await navigator.clipboard.writeText(shareUrl)
    alert('Share link copied to clipboard!')
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this wishlist?')) return

    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('id', wishlist.id)

    if (error) {
      alert('Error deleting wishlist')
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  const handleItemAdded = (newItem: WishlistItem) => {
    setItems([newItem, ...items])
    setShowAddForm(false)
  }

  const handleItemDeleted = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId))
  }

  const handleItemUpdated = (updatedItem: WishlistItem) => {
    setItems(items.map(item => item.id === updatedItem.id ? updatedItem : item))
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard" className="text-white/60 hover:text-white">
          ← Back
        </Link>
      </div>

      <div className="card-christmas mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold glow-gold">{wishlist.title}</h1>
            {wishlist.description && (
              <p className="text-white/70 mt-2">{wishlist.description}</p>
            )}
          </div>
          {isOwner && (
            <div className="flex gap-2">
              <button
                onClick={copyShareLink}
                className="btn-christmas btn-green text-sm py-2 px-4"
              >
                Share 🔗
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-4 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {isOwner && (
          <div className="mt-4 p-3 bg-white/5 rounded-lg">
            <p className="text-sm text-white/60">Share this link with family:</p>
            <code className="text-christmas-gold text-sm break-all">{shareUrl}</code>
          </div>
        )}
      </div>

      {isOwner && (
        <div className="mb-6">
          {showAddForm ? (
            <AddItemForm
              wishlistId={wishlist.id}
              onItemAdded={handleItemAdded}
              onCancel={() => setShowAddForm(false)}
            />
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-christmas w-full sm:w-auto"
            >
              + Add Gift Item
            </button>
          )}
        </div>
      )}

      {items.length > 0 ? (
        <div className="grid gap-4">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              isOwner={isOwner}
              onDelete={handleItemDeleted}
              onUpdate={handleItemUpdated}
            />
          ))}
        </div>
      ) : (
        <div className="card-christmas text-center py-12">
          <div className="text-5xl mb-4">🎁</div>
          <p className="text-white/70">
            {isOwner
              ? 'No items yet! Add your first gift wish above.'
              : 'No items in this wishlist yet.'}
          </p>
        </div>
      )}
    </div>
  )
}
