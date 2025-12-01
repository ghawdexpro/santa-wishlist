-- Add locale column to separate EN and PL data
ALTER TABLE orders ADD COLUMN IF NOT EXISTS locale VARCHAR(5) DEFAULT 'en' NOT NULL;
ALTER TABLE children ADD COLUMN IF NOT EXISTS locale VARCHAR(5) DEFAULT 'en' NOT NULL;

-- Create indexes for faster filtering
CREATE INDEX IF NOT EXISTS idx_orders_locale ON orders(locale);
CREATE INDEX IF NOT EXISTS idx_children_locale ON children(locale);
