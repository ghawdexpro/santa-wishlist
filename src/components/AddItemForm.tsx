'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { WishlistItem } from '@/types/database'

interface AddItemFormProps {
  wishlistId: string
  onItemAdded: (item: WishlistItem) => void
  onCancel: () => void
}

export default function AddItemForm({ wishlistId, onItemAdded, onCancel }: AddItemFormProps) {
  const supabase = createClient()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const [price, setPrice] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase
      .from('wishlist_items')
      .insert({
        wishlist_id: wishlistId,
        name,
        description: description || null,
        url: url || null,
        price: price ? parseFloat(price) : null,
        priority,
        image_url: null,
      })
      .select()
      .single()

    if (error) {
      alert('Error adding item: ' + error.message)
      setLoading(false)
      return
    }

    onItemAdded(data)
    setLoading(false)
  }

  return (
    <div className="card-christmas">
      <h3 className="text-xl font-bold mb-4">Add New Gift 🎁</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1">
            Gift Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-christmas"
            placeholder="PlayStation 5"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-christmas min-h-[60px]"
            placeholder="Any specific details..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">
              Link (URL)
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="input-christmas"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">
              Price
            </label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="input-christmas"
              placeholder="99.99"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-1">
            Priority
          </label>
          <div className="flex gap-2">
            {(['low', 'medium', 'high'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                  priority === p
                    ? p === 'high'
                      ? 'bg-red-500 text-white'
                      : p === 'medium'
                      ? 'bg-yellow-500 text-black'
                      : 'bg-green-500 text-white'
                    : 'bg-white/10 text-white/70'
                }`}
              >
                {p === 'high' ? '🔥 High' : p === 'medium' ? '⭐ Medium' : '💚 Low'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="btn-christmas btn-green flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-christmas flex-1"
          >
            {loading ? 'Adding...' : 'Add Gift'}
          </button>
        </div>
      </form>
    </div>
  )
}
