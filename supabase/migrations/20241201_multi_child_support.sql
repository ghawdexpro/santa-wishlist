-- Create children table for multi-child order support
CREATE TABLE IF NOT EXISTS children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  -- Child information
  name TEXT NOT NULL,
  age INTEGER,
  sequence_number INTEGER NOT NULL CHECK (sequence_number >= 1 AND sequence_number <= 3),

  -- Photo for Scene 4 (Photo Comes Alive)
  photo_url TEXT,

  -- Personalization data
  good_behavior TEXT,
  thing_to_improve TEXT,
  thing_to_learn TEXT,
  custom_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Constraints
  CONSTRAINT unique_child_per_order UNIQUE (order_id, sequence_number),
  CONSTRAINT valid_sequence CHECK (sequence_number >= 1 AND sequence_number <= 3)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_children_order_id ON children(order_id);
CREATE INDEX IF NOT EXISTS idx_children_sequence ON children(order_id, sequence_number);

-- Add multi-child support columns to orders table
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS child_count INTEGER DEFAULT 1 CHECK (child_count >= 1 AND child_count <= 3),
  ADD COLUMN IF NOT EXISTS generation_progress JSONB,
  ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Migrate existing single-child data from orders to children table
-- Only insert if this child doesn't already exist (backward compatibility)
INSERT INTO children (order_id, name, age, sequence_number, photo_url, good_behavior, thing_to_improve, thing_to_learn)
SELECT
  id,
  child_name,
  child_age,
  1,
  child_photo_url,
  good_behavior,
  thing_to_improve,
  thing_to_learn
FROM orders
WHERE child_name IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM children WHERE children.order_id = orders.id)
ON CONFLICT DO NOTHING;

-- Update child_count for existing orders (all current orders have 1 child)
UPDATE orders SET child_count = 1 WHERE child_count IS NULL;

-- Create index on orders for child_count queries
CREATE INDEX IF NOT EXISTS idx_orders_child_count ON orders(child_count);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
