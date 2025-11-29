-- Create wishlists table
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  share_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- Wishlists policies
CREATE POLICY "Users can view own wishlists" ON wishlists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public wishlists by share code" ON wishlists
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can create wishlists" ON wishlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wishlists" ON wishlists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wishlists" ON wishlists
  FOR DELETE USING (auth.uid() = user_id);

-- Index for share code lookups
CREATE INDEX IF NOT EXISTS wishlists_share_code_idx ON wishlists(share_code);
