-- Santa Experience - Complete Schema
-- Fresh setup for all tables

-- Drop existing tables if they exist (clean slate)
DROP TABLE IF EXISTS children CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS premade_scenes CASCADE;

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft',
  child_count INTEGER DEFAULT 1,
  child_name TEXT,
  child_age INTEGER,
  child_photo_url TEXT,
  good_behavior TEXT,
  thing_to_improve TEXT,
  thing_to_learn TEXT,
  custom_message TEXT,
  generated_script JSONB,
  keyframe_urls JSONB,
  final_video_url TEXT,
  generation_progress JSONB,
  error_message TEXT,
  stripe_payment_intent_id TEXT,
  stripe_session_id TEXT,
  amount_paid INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own orders" ON orders FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

-- Children table
CREATE TABLE children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER,
  sequence_number INTEGER NOT NULL,
  photo_url TEXT,
  good_behavior TEXT,
  thing_to_improve TEXT,
  thing_to_learn TEXT,
  custom_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_child_per_order UNIQUE (order_id, sequence_number)
);

CREATE INDEX idx_children_order_id ON children(order_id);

-- Premade scenes table
CREATE TABLE premade_scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_number INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration_seconds INTEGER DEFAULT 10,
  prompt_used TEXT,
  keyframe_url TEXT,
  keyframe_end_url TEXT,
  video_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_premade_scenes_number ON premade_scenes(scene_number);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
