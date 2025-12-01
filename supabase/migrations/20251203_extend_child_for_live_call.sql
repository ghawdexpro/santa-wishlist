-- Extend children table with more personalization fields for live Santa calls
-- These fields help create deeply personalized conversations

-- Interests and favorites
ALTER TABLE children ADD COLUMN IF NOT EXISTS favorite_toy TEXT;
ALTER TABLE children ADD COLUMN IF NOT EXISTS favorite_animal TEXT;
ALTER TABLE children ADD COLUMN IF NOT EXISTS favorite_color TEXT;
ALTER TABLE children ADD COLUMN IF NOT EXISTS hobbies TEXT; -- comma-separated or free text

-- Family context
ALTER TABLE children ADD COLUMN IF NOT EXISTS siblings_info TEXT; -- "ma młodszą siostrę Zuzię"
ALTER TABLE children ADD COLUMN IF NOT EXISTS pet_name TEXT; -- "piesek Burek"

-- For personalized story
ALTER TABLE children ADD COLUMN IF NOT EXISTS story_moral TEXT; -- what lesson should the story teach
ALTER TABLE children ADD COLUMN IF NOT EXISTS special_achievement TEXT; -- something to praise specifically

-- Santa conversation context
ALTER TABLE children ADD COLUMN IF NOT EXISTS santa_conversation_context JSONB; -- generated context for AI
ALTER TABLE children ADD COLUMN IF NOT EXISTS santa_story TEXT; -- pre-generated personalized story

-- Comments
COMMENT ON COLUMN children.favorite_toy IS 'Child favorite toy for Santa to mention';
COMMENT ON COLUMN children.favorite_animal IS 'Favorite animal - Santa can include in story';
COMMENT ON COLUMN children.hobbies IS 'Child hobbies and interests';
COMMENT ON COLUMN children.siblings_info IS 'Info about siblings for natural conversation';
COMMENT ON COLUMN children.pet_name IS 'Pet name - Santa can ask about it';
COMMENT ON COLUMN children.story_moral IS 'What lesson/moral parents want in Santa story';
COMMENT ON COLUMN children.special_achievement IS 'Specific achievement to praise';
COMMENT ON COLUMN children.santa_conversation_context IS 'AI-generated conversation context JSON';
COMMENT ON COLUMN children.santa_story IS 'Pre-generated personalized magical story';
