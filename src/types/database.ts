export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
}

export interface Wishlist {
  id: string
  user_id: string
  title: string
  description: string | null
  share_code: string
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface WishlistItem {
  id: string
  wishlist_id: string
  name: string
  description: string | null
  url: string | null
  price: number | null
  priority: 'low' | 'medium' | 'high'
  image_url: string | null
  is_claimed: boolean
  claimed_by: string | null
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      wishlists: {
        Row: Wishlist
        Insert: Omit<Wishlist, 'id' | 'created_at' | 'updated_at' | 'share_code'>
        Update: Partial<Omit<Wishlist, 'id' | 'user_id' | 'created_at' | 'share_code'>>
      }
      wishlist_items: {
        Row: WishlistItem
        Insert: Omit<WishlistItem, 'id' | 'created_at' | 'is_claimed' | 'claimed_by'>
        Update: Partial<Omit<WishlistItem, 'id' | 'wishlist_id' | 'created_at'>>
      }
    }
  }
}
