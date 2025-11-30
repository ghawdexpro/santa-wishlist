-- Add end keyframe URL column to premade_scenes table for guided video generation
ALTER TABLE premade_scenes
ADD COLUMN IF NOT EXISTS keyframe_end_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN premade_scenes.keyframe_end_url IS 'URL of the end keyframe image for guided video generation';
