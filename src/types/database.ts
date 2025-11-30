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

// Child type (for multi-child order support)
export interface Child {
  id: string
  order_id: string
  name: string
  age: number | null
  sequence_number: 1 | 2 | 3
  photo_url: string | null
  good_behavior: string | null
  thing_to_improve: string | null
  thing_to_learn: string | null
  custom_message: string | null
  created_at: string
  updated_at: string
}

// Child insert type
export interface ChildInsert {
  order_id: string
  name: string
  age?: number | null
  sequence_number: 1 | 2 | 3
  photo_url?: string | null
  good_behavior?: string | null
  thing_to_improve?: string | null
  thing_to_learn?: string | null
  custom_message?: string | null
}

// Order type (updated for multi-child support)
export interface Order {
  id: string
  user_id: string
  status: OrderStatus

  // Multi-child support
  child_count: 1 | 2 | 3

  // Generated content (shared across all children)
  generated_script: ScriptScene[] | null
  keyframe_urls: string[] | null
  final_video_url: string | null

  // Progress tracking
  generation_progress: {
    stage: string
    scenesComplete: number[]
    scenesInProgress: number[]
    scenesFailed: number[]
  } | null
  error_message: string | null

  // Payment
  stripe_payment_intent_id: string | null
  stripe_session_id: string | null
  amount_paid: number | null

  // Timestamps
  created_at: string
  updated_at: string
  completed_at: string | null

  // Backward compatibility (old single-child fields, can be deprecated)
  child_name?: string
  child_photo_url?: string | null
  child_age?: number | null
  good_behavior?: string | null
  thing_to_improve?: string | null
  thing_to_learn?: string | null
  custom_message?: string | null
}

// Order insert type (for creating new orders)
export interface OrderInsert {
  user_id: string
  child_count?: 1 | 2 | 3
  // Backward compatibility
  child_name?: string
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
  child_count?: 1 | 2 | 3
  generated_script?: ScriptScene[] | null
  keyframe_urls?: string[] | null
  final_video_url?: string | null
  generation_progress?: Order['generation_progress']
  error_message?: string | null
  stripe_payment_intent_id?: string | null
  stripe_session_id?: string | null
  amount_paid?: number | null
  completed_at?: string | null
  // Backward compatibility
  child_name?: string
  child_photo_url?: string | null
  child_age?: number | null
  good_behavior?: string | null
  thing_to_improve?: string | null
  thing_to_learn?: string | null
  custom_message?: string | null
}

// Extended order type that includes children array
export interface OrderWithChildren extends Order {
  children: Child[]
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
      children: {
        Row: Child
        Insert: ChildInsert
        Update: Partial<Omit<ChildInsert, 'order_id'>>
      }
      premade_scenes: {
        Row: PremadeScene
        Insert: Omit<PremadeScene, 'id' | 'created_at'>
        Update: Partial<Omit<PremadeScene, 'id' | 'created_at'>>
      }
    }
  }
}
