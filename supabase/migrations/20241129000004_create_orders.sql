-- Create orders table for The Santa Experience
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'script_approved', 'keyframes_approved', 'paid', 'generating', 'complete', 'failed')),

  -- Child info
  child_name TEXT NOT NULL,
  child_photo_url TEXT,
  child_age INT CHECK (child_age >= 1 AND child_age <= 18),

  -- Personalization
  good_behavior TEXT,
  thing_to_improve TEXT,
  thing_to_learn TEXT,
  custom_message TEXT,

  -- Generated content
  generated_script JSONB,
  keyframe_urls TEXT[],
  final_video_url TEXT,

  -- Payment
  stripe_payment_intent_id TEXT,
  stripe_session_id TEXT,
  amount_paid INT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Create index for user lookups
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders(user_id);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own orders
CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own orders
CREATE POLICY "Users can update own orders"
  ON orders FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own draft orders
CREATE POLICY "Users can delete own draft orders"
  ON orders FOR DELETE
  USING (auth.uid() = user_id AND status = 'draft');

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_orders_updated_at();
