-- Create premade_scenes table for reusable video scenes
CREATE TABLE IF NOT EXISTS premade_scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_number INT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  keyframe_url TEXT,
  duration_seconds INT DEFAULT 8,
  prompt_used TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for scene number lookups
CREATE INDEX IF NOT EXISTS premade_scenes_number_idx ON premade_scenes(scene_number);

-- Enable RLS (read-only for all, admin-only write)
ALTER TABLE premade_scenes ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read premade scenes
CREATE POLICY "Anyone can view premade scenes"
  ON premade_scenes FOR SELECT
  TO authenticated
  USING (true);

-- Insert placeholder scenes (will be updated with actual content in Stage 9)
INSERT INTO premade_scenes (scene_number, name, description, duration_seconds)
VALUES
  (1, 'Workshop Introduction', 'Santa sitting by fire in cozy workshop at night', 8),
  (2, 'Reaching for Book', 'Santa reaches for glowing Nice List book', 7),
  (3, 'Opening Book', 'Close-up of hands opening book with golden glow', 7),
  (9, 'Window View', 'Santa walks to window, snowy North Pole view', 8),
  (10, 'Reindeer Scene', 'Through window: reindeer and sleigh being prepared', 7),
  (13, 'Goodbye Wink', 'Santa winks, Ho ho ho, fade to logo', 7)
ON CONFLICT (scene_number) DO NOTHING;
