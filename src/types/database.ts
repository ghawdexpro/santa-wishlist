// Order status type
export type OrderStatus = 'draft' | 'script_approved' | 'keyframes_approved' | 'paid' | 'generating' | 'complete' | 'failed'

// Script scene structure
export interface ScriptScene {
  scene_number: number
  dialogue: string
  emotion_note: string
  is_personalized: boolean
}

// Profile type (from Supabase Auth)
export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
}

// Order type
export interface Order {
  id: string
  user_id: string
  status: OrderStatus

  // Child info
  child_name: string
  child_photo_url: string | null
  child_age: number | null

  // Personalization
  good_behavior: string | null
  thing_to_improve: string | null
  thing_to_learn: string | null
  custom_message: string | null

  // Generated content
  generated_script: ScriptScene[] | null
  keyframe_urls: string[] | null
  final_video_url: string | null

  // Payment
  stripe_payment_intent_id: string | null
  stripe_session_id: string | null
  amount_paid: number | null

  // Timestamps
  created_at: string
  updated_at: string
  completed_at: string | null
}

// Order insert type (for creating new orders)
export interface OrderInsert {
  user_id: string
  child_name: string
  child_photo_url?: string | null
  child_age?: number | null
  good_behavior?: string | null
  thing_to_improve?: string | null
  thing_to_learn?: string | null
  custom_message?: string | null
}

// Order update type
export interface OrderUpdate {
  status?: OrderStatus
  child_name?: string
  child_photo_url?: string | null
  child_age?: number | null
  good_behavior?: string | null
  thing_to_improve?: string | null
  thing_to_learn?: string | null
  custom_message?: string | null
  generated_script?: ScriptScene[] | null
  keyframe_urls?: string[] | null
  final_video_url?: string | null
  stripe_payment_intent_id?: string | null
  stripe_session_id?: string | null
  amount_paid?: number | null
  completed_at?: string | null
}

// Premade scene type
export interface PremadeScene {
  id: string
  scene_number: number
  name: string
  description: string | null
  video_url: string | null
  keyframe_url: string | null
  duration_seconds: number
  prompt_used: string | null
  created_at: string
}

// Database type for Supabase
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      orders: {
        Row: Order
        Insert: OrderInsert
        Update: OrderUpdate
      }
      premade_scenes: {
        Row: PremadeScene
        Insert: Omit<PremadeScene, 'id' | 'created_at'>
        Update: Partial<Omit<PremadeScene, 'id' | 'created_at'>>
      }
    }
  }
}
