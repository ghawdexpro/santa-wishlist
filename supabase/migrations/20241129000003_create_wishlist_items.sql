-- Create priority enum if not exists
DO $$ BEGIN
  CREATE TYPE item_priority AS ENUM ('low', 'medium', 'high');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create wishlist_items table
CREATE TABLE IF NOT EXISTS wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id UUID NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  url TEXT,
  price DECIMAL(10,2),
  priority item_priority DEFAULT 'medium',
  image_url TEXT,
  is_claimed BOOLEAN DEFAULT false,
  claimed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

-- Items policies
CREATE POLICY "Users can view items from own wishlists" ON wishlist_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND wishlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view items from public wishlists" ON wishlist_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND wishlists.is_public = true
    )
  );

CREATE POLICY "Users can create items in own wishlists" ON wishlist_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND wishlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items in own wishlists" ON wishlist_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND wishlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can claim items in public wishlists" ON wishlist_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND wishlists.is_public = true
    )
  );

CREATE POLICY "Users can delete items from own wishlists" ON wishlist_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND wishlists.user_id = auth.uid()
    )
  );

-- Index for wishlist lookups
CREATE INDEX IF NOT EXISTS wishlist_items_wishlist_id_idx ON wishlist_items(wishlist_id);
