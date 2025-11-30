-- Pre-made scenes table for storing generated VFX scenes
CREATE TABLE IF NOT EXISTS premade_scenes (
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

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_premade_scenes_number ON premade_scenes(scene_number);

-- Add comment for documentation
COMMENT ON COLUMN premade_scenes.keyframe_end_url IS 'URL of the end keyframe image for guided video generation';
