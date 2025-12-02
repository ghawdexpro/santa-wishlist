'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
}

interface Order {
  id: string
  status: string
  child_count: number
  created_at: string
  final_video_url: string | null
  children: { name: string }[]
}

export default function AccountPage() {
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [fullName, setFullName] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile({ ...profileData, email: user.email || '' })
        setFullName(profileData.full_name || '')
      }

      // Fetch orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('id, status, child_count, created_at, final_video_url, children(name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (ordersData) {
        setOrders(ordersData as Order[])
      }

      setLoading(false)
    }

    fetchData()
  }, [supabase, router])

  const handleSave = async () => {
    if (!profile) return

    setSaving(true)
    setMessage(null)

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', profile.id)

    if (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' })
    } else {
      setProfile({ ...profile, full_name: fullName })
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setEditMode(false)
    }

    setSaving(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-500/20 text-green-400'
      case 'generating': return 'bg-yellow-500/20 text-yellow-400'
      case 'paid': return 'bg-blue-500/20 text-blue-400'
      case 'failed': return 'bg-red-500/20 text-red-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/60">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold glow-gold mb-8">My Profile</h1>

        {/* Profile Card */}
        <div className="card-christmas mb-8">
          <div className="flex items-start gap-6">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-20 h-20 rounded-full border-4 border-christmas-gold"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-christmas-gold/20 border-4 border-christmas-gold flex items-center justify-center">
                <span className="text-christmas-gold text-3xl font-bold">
                  {(profile?.full_name || profile?.email || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            <div className="flex-1">
              {editMode ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/60 text-sm mb-1">Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="input-christmas w-full max-w-xs"
                      placeholder="Your name"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="btn-christmas text-sm py-2 px-4"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => {
                        setEditMode(false)
                        setFullName(profile?.full_name || '')
                      }}
                      className="px-4 py-2 text-white/60 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-white">
                    {profile?.full_name || 'No name set'}
                  </h2>
                  <p className="text-white/60">{profile?.email}</p>
                  <button
                    onClick={() => setEditMode(true)}
                    className="mt-3 text-christmas-gold hover:text-christmas-gold/80 text-sm flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit Profile
                  </button>
                </>
              )}

              {message && (
                <div className={`mt-4 px-4 py-2 rounded-lg text-sm ${
                  message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {message.text}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">My Orders</h2>
          <Link href="/create" className="btn-christmas text-sm py-2 px-4">
            + New Video
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="card-christmas text-center py-12">
            <div className="text-5xl mb-4">🎬</div>
            <p className="text-white/60 mb-4">No orders yet</p>
            <Link href="/create" className="btn-christmas inline-block">
              Create Your First Video
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="card-christmas">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <span className="text-white/40 text-sm">
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-white font-medium">
                      {order.children.map(c => c.name).join(', ')}
                    </p>
                    <p className="text-white/50 text-sm">
                      {order.child_count} {order.child_count === 1 ? 'child' : 'children'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {order.final_video_url && (
                      <a
                        href={order.final_video_url}
                        download
                        className="p-2 text-white/60 hover:text-christmas-gold transition-colors"
                        title="Download Video"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </a>
                    )}
                    <Link
                      href={`/order/${order.id}/edit`}
                      className="p-2 text-white/60 hover:text-christmas-gold transition-colors"
                      title="Edit Order"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
