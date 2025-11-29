'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function CreateWishlistButton() {
  const router = useRouter()
  const supabase = createClient()
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('wishlists')
      .insert({
        user_id: user.id,
        title,
        description: description || null,
        is_public: true,
      })
      .select()
      .single()

    if (error) {
      alert('Error creating wishlist: ' + error.message)
      setLoading(false)
      return
    }

    setIsOpen(false)
    setTitle('')
    setDescription('')
    setLoading(false)
    router.push(`/dashboard/wishlist/${data.id}`)
    router.refresh()
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="btn-christmas"
      >
        + New Wishlist
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card-christmas w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 glow-gold">Create New Wishlist 🎄</h2>

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-white/80 mb-1">
              Wishlist Name
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-christmas"
              placeholder="My Christmas Wishlist 2024"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-white/80 mb-1">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-christmas min-h-[80px]"
              placeholder="Things I'd love to receive this Christmas..."
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="btn-christmas btn-green flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-christmas flex-1"
            >
              {loading ? 'Creating...' : 'Create 🎁'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
