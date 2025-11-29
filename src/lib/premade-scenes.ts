/**
 * Pre-made scene definitions for The Santa Experience
 * These scenes are generated once and reused for all videos
 *
 * Scenes: 1, 2, 3, 9, 10, 13 (6 pre-made scenes)
 */

export interface PremadeSceneConfig {
  sceneNumber: number
  name: string
  description: string
  durationSeconds: number
  videoPrompt: string
  keyframePrompt: string
  audioDescription: string
}

// Cinematic quality settings for Veo 3.1
const CINEMATIC_STYLE = `Cinematic quality, 4K resolution, professional film lighting,
shallow depth of field, warm color grading, gentle camera movement,
photorealistic rendering, no artifacts, smooth motion.`

const SANTA_CHARACTER = `Santa Claus: distinguished elderly man in his 60s,
full natural white beard perfectly groomed, rosy cheeks glowing with warmth,
kind twinkling blue eyes with crow's feet, genuine warm smile,
classic red velvet suit with pristine white fur trim, polished black leather belt with ornate gold buckle,
soft gentle demeanor like a beloved grandfather.`

const WORKSHOP_SETTING = `Santa's private study in the North Pole workshop:
Warm honey-colored wood paneling, magnificent stone fireplace with crackling orange flames,
antique leather wingback chair in deep burgundy, ornate wooden desk covered in letters,
shelves lined with antique toys and snow globes, frosted windows showing gentle snowfall outside,
warm golden ambient lighting from oil lamps and candles, magical dust particles floating in air,
Christmas garlands with golden bells, the cozy intimate feeling of a treasured family room.`

export const PREMADE_SCENES: PremadeSceneConfig[] = [
  {
    sceneNumber: 1,
    name: 'Workshop Welcome',
    description: 'Santa sitting contentedly by the fire in his cozy workshop',
    durationSeconds: 8,
    videoPrompt: `${CINEMATIC_STYLE}

Opening shot of a magical Christmas scene.
${WORKSHOP_SETTING}

${SANTA_CHARACTER}

Santa sits in his leather chair by the crackling fireplace, looking peaceful and content.
He gazes warmly toward the camera with a gentle knowing smile.
Firelight flickers across his face, creating dancing shadows.
Snow falls gently outside the frosted window behind him.
Magical golden particles drift through the air.
The scene feels intimate, warm, and inviting - like visiting a beloved grandfather.

Camera: Slow gentle push-in from medium wide to medium shot.
Mood: Cozy, magical, welcoming, peaceful anticipation.`,
    keyframePrompt: `${SANTA_CHARACTER} seated in burgundy leather wingback chair, ${WORKSHOP_SETTING}, firelight on face, gentle smile, looking at camera, warm golden lighting, photorealistic, cinematic`,
    audioDescription: 'Crackling fireplace, soft wind outside, gentle magical chimes',
  },
  {
    sceneNumber: 2,
    name: 'The Nice List',
    description: 'Santa reaches for the magical glowing Nice List book',
    durationSeconds: 7,
    videoPrompt: `${CINEMATIC_STYLE}

${WORKSHOP_SETTING}

${SANTA_CHARACTER}

Santa leans forward with anticipation, his eyes twinkling with excitement.
He reaches toward an ancient leather-bound book on his desk - THE NICE LIST.
The book is extraordinary: thick worn leather with golden embossed lettering,
ornate golden clasps, emanating a soft magical golden glow.
As his hand approaches, the glow intensifies warmly.
His face lights up with joy and purpose.

Santa speaks warmly: "Let me check on someone very special tonight..."

Camera: Close-up on Santa's face transitioning to his hands reaching for the book.
Mood: Anticipation, magic awakening, the moment before wonder.`,
    keyframePrompt: `${SANTA_CHARACTER} reaching toward ancient magical leather book with golden glow, ornate golden clasps, THE NICE LIST embossed, ${WORKSHOP_SETTING}, excited anticipation, warm lighting, photorealistic, cinematic`,
    audioDescription: 'Magical shimmer sound, soft orchestral swell, Santa speaking warmly',
  },
  {
    sceneNumber: 3,
    name: 'Opening the Book',
    description: 'Close-up of hands opening the magical book with golden light',
    durationSeconds: 7,
    videoPrompt: `${CINEMATIC_STYLE}

Extreme close-up shot focusing on Santa's hands and the magical book.

Santa's hands: aged but strong, wearing a simple gold wedding band,
gentle and careful as they handle precious things.

The Nice List book opens slowly, reverently.
Golden light pours from between the pages like captured sunshine.
Magical golden particles swirl up from the illuminated pages.
Ancient parchment pages with beautiful calligraphy visible.
Names written in elegant golden ink shimmer and glow.
The light illuminates Santa's face from below, casting wonder.

Soft gentle humming from Santa as he searches.

Camera: Extreme close-up on hands and book, slight tilt up to catch light on face.
Mood: Pure magic, sacred moment, wonder and reverence.`,
    keyframePrompt: `Close-up of elderly hands opening ancient magical book, golden light pouring from pages, magical particles swirling, illuminated face from below, ${WORKSHOP_SETTING} background blurred, photorealistic, cinematic lighting`,
    audioDescription: 'Magical whoosh, golden shimmer sounds, gentle humming, orchestral wonder',
  },
  {
    sceneNumber: 9,
    name: 'The Window',
    description: 'Santa walks to window showing the magical North Pole',
    durationSeconds: 8,
    videoPrompt: `${CINEMATIC_STYLE}

${SANTA_CHARACTER}

Santa rises gracefully from his chair with purpose.
He walks slowly toward a large frost-covered window.
His silhouette against the window is majestic.
Outside: the magical North Pole in all its glory -
Gentle snowfall, northern lights dancing green and purple in the sky,
distant warm lights of the elf village, snow-covered pine trees.

Santa places his hand on the cold glass, looking out with wonder.
His breath fogs slightly on the window.

Santa speaks with anticipation: "Christmas Eve is coming soon..."

Camera: Following shot as Santa walks, settling into a beautiful silhouette composition.
Mood: Anticipation of magic to come, the promise of Christmas.`,
    keyframePrompt: `${SANTA_CHARACTER} standing at frost-covered window, silhouette against magical North Pole night sky, northern lights green purple, snowy village lights in distance, hand on glass, ${WORKSHOP_SETTING}, cinematic, photorealistic`,
    audioDescription: 'Footsteps on wood, wind howling softly, magical orchestral anticipation',
  },
  {
    sceneNumber: 10,
    name: 'Reindeer Ready',
    description: 'Through window: reindeer, sleigh, and elves preparing',
    durationSeconds: 7,
    videoPrompt: `${CINEMATIC_STYLE}

Shot through the frost-framed window, looking out at the magical scene.

The North Pole courtyard in enchanting detail:
The magnificent red and gold sleigh, polished to perfection, loaded with colorful presents.
Eight majestic reindeer harnessed and ready, breath visible in cold air,
Rudolph at the front, nose glowing warm red.
Cheerful elves in green and red outfits making final preparations,
checking lists, adjusting ribbons on presents.
Snow falling gently, northern lights reflecting off everything.
Warm lantern light from the workshop casting golden pools on snow.

Santa speaks with joy: "And I have a very special delivery to make..."

Camera: Point of view through window, slight movement as if leaning closer.
Mood: Excitement, magic is real, Christmas is coming.`,
    keyframePrompt: `View through frost-framed window, magnificent red gold sleigh with presents, eight reindeer with Rudolph's glowing nose, cheerful elves preparing, snowy North Pole courtyard, northern lights, warm lantern glow, magical Christmas scene, photorealistic, cinematic`,
    audioDescription: 'Reindeer bells jingling, elves chattering, magical sleigh bells, excitement',
  },
  {
    sceneNumber: 13,
    name: 'Ho Ho Ho Goodbye',
    description: 'Santa winks and laughs with magical ending',
    durationSeconds: 7,
    videoPrompt: `${CINEMATIC_STYLE}

${WORKSHOP_SETTING}

${SANTA_CHARACTER}

The grand finale - pure joy and magic.
Santa looks directly at camera with his warmest smile.
His eyes twinkle mischievously, then he gives a knowing wink.
He throws his head back slightly with genuine laughter.
"Ho ho ho!" - deep, warm, from the belly, full of love.

As he laughs, magical golden sparkles swirl around him.
The sparkles increase, becoming a beautiful golden cascade.
Fade through the sparkles to reveal:

Elegant end card: "The Santa Experience" in golden script
on deep red velvet background with subtle snowflakes.

Camera: Close-up on Santa, pulling back as magic swirls, dissolve to end card.
Mood: Pure joy, magic, the warmth of Christmas love, memorable goodbye.`,
    keyframePrompt: `${SANTA_CHARACTER} laughing joyfully, warm twinkle in eye, mid-wink, golden magical sparkles swirling around, ${WORKSHOP_SETTING}, pure joy, warm lighting, photorealistic, cinematic`,
    audioDescription: 'Deep warm Ho Ho Ho laugh, magical sparkle crescendo, triumphant orchestral flourish',
  },
]

// Helper to get pre-made scene by number
export function getPremadeScene(sceneNumber: number): PremadeSceneConfig | undefined {
  return PREMADE_SCENES.find(s => s.sceneNumber === sceneNumber)
}

// Check if a scene number is pre-made
export function isPremadeScene(sceneNumber: number): boolean {
  return [1, 2, 3, 9, 10, 13].includes(sceneNumber)
}
