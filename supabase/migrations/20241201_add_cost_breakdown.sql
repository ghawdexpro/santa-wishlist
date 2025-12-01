-- Add cost_breakdown column to track AI service costs per order
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cost_breakdown JSONB;

-- Add comment for documentation
COMMENT ON COLUMN orders.cost_breakdown IS 'JSON tracking cost per AI service: {veo, heygen, nanobanana, gemini, total}';
