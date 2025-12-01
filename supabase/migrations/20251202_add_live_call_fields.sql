-- Add live call fields to orders table
-- For "Talk to Santa" interactive video call feature

-- Add fields to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS includes_live_call BOOLEAN DEFAULT FALSE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS call_scheduled_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS call_completed_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS call_duration_seconds INTEGER;

-- Create table to track active live call sessions
CREATE TABLE IF NOT EXISTS live_call_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  child_id UUID REFERENCES children(id) ON DELETE SET NULL,
  session_id TEXT, -- HeyGen session ID
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  credits_used DECIMAL(10, 2),
  status TEXT DEFAULT 'active', -- active, completed, failed
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_live_call_sessions_order_id ON live_call_sessions(order_id);
CREATE INDEX IF NOT EXISTS idx_live_call_sessions_status ON live_call_sessions(status);

-- RLS policies for live_call_sessions
ALTER TABLE live_call_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view their own call sessions (via order ownership)
CREATE POLICY "Users can view own call sessions" ON live_call_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = live_call_sessions.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Users can insert call sessions for their own orders
CREATE POLICY "Users can insert own call sessions" ON live_call_sessions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = live_call_sessions.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Users can update their own call sessions
CREATE POLICY "Users can update own call sessions" ON live_call_sessions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = live_call_sessions.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Comment for documentation
COMMENT ON TABLE live_call_sessions IS 'Tracks HeyGen streaming avatar sessions for "Talk to Santa" feature';
COMMENT ON COLUMN orders.includes_live_call IS 'Whether this order includes the "Talk to Santa" live video call add-on';
COMMENT ON COLUMN orders.call_scheduled_at IS 'Scheduled time for the live call (if using scheduling)';
COMMENT ON COLUMN orders.call_completed_at IS 'When the live call was completed';
COMMENT ON COLUMN orders.call_duration_seconds IS 'Total duration of all live calls for this order';
