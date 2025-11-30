/**
 * Scene definitions for The Santa Experience - "The Brightest Star"
 *
 * 8-scene structure (~64 seconds total for 1 child):
 * - PRE-MADE (1, 2, 3, 7): Generate once, reuse forever (32s total)
 * - PERSONALIZED (4, 5, 6, 8): Generate per order with child's data (32s per child)
 *
 * NOTE: Veo 3.1 supports max 8 seconds per generation (5-8s range)
 */

export interface SceneConfig {
  sceneNumber: number
  name: string
  description: string
  durationSeconds: number
  type: 'premade' | 'personalized'
  videoPrompt: string
  audioDescription: string
}

// Cinematic quality settings for Veo
const CINEMATIC_STYLE = `Cinematic quality, 4K resolution, professional Hollywood film lighting,
shallow depth of field, warm color grading, smooth camera movement,
photorealistic rendering, no artifacts, seamless motion, Pixar-quality magic.`

const SANTA_CHARACTER = `Santa Claus: distinguished elderly man in his 60s,
full natural white beard perfectly groomed, rosy cheeks glowing with warmth,
kind twinkling blue eyes with crow's feet from smiling, genuine warm smile,
classic red velvet suit with pristine white fur trim, polished black leather belt with ornate gold buckle,
soft gentle demeanor like a beloved grandfather, magical presence.`

const WORKSHOP_SETTING = `Santa's private study in the North Pole workshop:
Warm honey-colored wood paneling, magnificent stone fireplace with crackling orange flames,
antique leather wingback chair in deep burgundy, ornate wooden desk covered in letters,
shelves lined with antique toys and snow globes, frosted windows showing gentle snowfall outside,
warm golden ambient lighting from oil lamps and candles, magical dust particles floating in air,
Christmas garlands with golden bells, the cozy intimate feeling of a treasured family room.`

// ============================================================================
// PRE-MADE SCENES (4 total) - Generate once, reuse for all orders
// ============================================================================

export const PREMADE_SCENES: SceneConfig[] = [
  {
    sceneNumber: 1,
    name: 'Sky Dive',
    description: 'Epic fly-through clouds into North Pole like roller coaster',
    durationSeconds: 8, // Veo max
    type: 'premade',
    videoPrompt: `${CINEMATIC_STYLE}

EPIC OPENING - Thrilling aerial journey to the North Pole.

Camera POV flying through a magical winter night sky at high speed.
Starting above the clouds, stars twinkling brilliantly all around.
DIVE DOWN through layers of fluffy clouds, like a roller coaster drop.
Pass through spectacular AURORA BOREALIS - ribbons of green and purple light dancing.
Magical sparkles and stardust trail behind the camera as it moves.
Speed increases - WHOOSH through more clouds with motion blur.
Snowflakes whip past the camera.
Finally break through the last cloud layer to reveal:
The magnificent NORTH POLE VILLAGE below - hundreds of warm glowing windows,
snow-covered rooftops, candy cane lampposts, giant Christmas tree in the center,
all nestled in a snowy valley surrounded by snow-capped mountains.
Camera continues diving toward the largest building - Santa's Workshop.

Camera: First-person POV, dynamic movement, roller-coaster energy, diving motion.
VFX: Particle trails, lens flares, speed blur, aurora effects, magical sparkles.
Mood: EXCITING, thrilling, "WOOOAH!", sense of magic and wonder.`,
    audioDescription: 'Whooshing wind, magical chimes building, orchestral crescendo, sleigh bells distant',
  },
  {
    sceneNumber: 2,
    name: 'Workshop Wonder',
    description: 'Inside magical workshop with flying toys and acrobatic elves',
    durationSeconds: 8, // Veo max
    type: 'premade',
    videoPrompt: `${CINEMATIC_STYLE}

MAGICAL WORKSHOP - Pure wonder and spectacle.

Interior of Santa's magnificent toy workshop - a massive space full of magic.
Toys FLYING through the air - teddy bears, toy trains, dolls, robots.
Toys ASSEMBLING THEMSELVES mid-flight - pieces spinning together with sparkles.
Conveyor belts carrying beautifully wrapped presents with glowing ribbons.
Cheerful ELVES in green and red outfits:
- Some doing ACROBATIC FLIPS between workstations
- Others riding on flying toys
- Some painting toys with magical brushes that leave rainbow trails
Giant candy canes as pillars, gingerbread trim on railings.
Snow globes the size of beach balls floating and spinning.
Christmas lights EVERYWHERE - twinkling in rainbow patterns.
Golden sparkles and magical dust filling the air.
Warm lighting from countless candles and magical orbs.

Camera: Sweeping crane shot through the workshop, following a flying toy.
VFX: Floating objects, magic sparkles, glowing trails, busy magical motion.
Mood: "SO COOL!", wonder, childhood dream come true, pure magic.`,
    audioDescription: 'Cheerful workshop sounds, magical chimes, elf laughter, toy sounds, joyful music',
  },
  {
    sceneNumber: 3,
    name: 'Book Magic',
    description: 'Santa uses telekinesis to summon the Magic Book with golden light explosion',
    durationSeconds: 8, // Veo max
    type: 'premade',
    videoPrompt: `${CINEMATIC_STYLE}

${WORKSHOP_SETTING}

${SANTA_CHARACTER}

SANTA'S MAGICAL POWERS revealed.

Santa sits in his cozy study by the crackling fireplace.
He looks toward camera with a knowing twinkle in his eye.
Santa raises his hand with a MAGICAL GESTURE - fingers spread, gentle wave.
Across the room, an ancient leather-bound book begins to GLOW golden.
The book - THE NICE LIST - FLIES through the air toward Santa!
Trails of golden sparkles follow the floating book.
The book lands gently in Santa's hands.
He opens it and GOLDEN LIGHT EXPLODES from the pages!
Magical particles swirl up from the illuminated pages.
Santa's face is bathed in warm golden light from below.
Pages begin to flip by themselves, searching...
Santa's expression shows anticipation and excitement.

Camera: Medium shot of Santa, dramatic lighting from book's glow.
VFX: Telekinesis effect, floating book, golden light burst, magical particles, page flip.
Mood: "He has POWERS!", real movie magic, wizardly Santa, awe-inspiring.`,
    audioDescription: 'Magical whoosh, golden shimmer sounds, book flutter, dramatic orchestral swell',
  },
  {
    sceneNumber: 7,
    name: 'Sleigh Ready',
    description: 'Santa walks to door revealing magnificent sleigh with reindeer',
    durationSeconds: 8, // Veo max
    type: 'premade',
    videoPrompt: `${CINEMATIC_STYLE}

${SANTA_CHARACTER}

THE GRAND DEPARTURE setup.

Santa rises from his chair with purpose and excitement.
He walks toward a large wooden door with ornate Christmas carvings.
Santa places his hand on the golden door handle.
Door SWINGS OPEN dramatically, revealing:

The magnificent SNOWY COURTYARD in all its glory:
- The legendary RED AND GOLD SLEIGH, polished to perfection
- Piled HIGH with beautifully wrapped presents, ribbons glowing softly
- EIGHT MAJESTIC REINDEER harnessed and ready, breath visible in cold air
- RUDOLPH at the front, nose BLAZING bright red, casting red glow on snow
- Cheerful ELVES in winter gear making final preparations
- Snow falling gently, catching the warm light from the workshop
- Northern lights dancing in the sky above
- Stars twinkling brilliantly

Santa steps through the doorway, silhouetted against the magical scene.
Reindeer paw the snow eagerly, ready to fly.

Camera: Following Santa, then wide reveal of the spectacular scene.
VFX: Glowing Rudolph nose, breath vapor, magical atmosphere, northern lights.
Mood: Anticipation, the promise of Christmas, epic setup for finale.`,
    audioDescription: 'Door creaking open, reindeer snorting, bells jingling, wind, magical anticipation',
  },
]

// ============================================================================
// PERSONALIZED SCENE TEMPLATES (4 total) - Generate per order
// ============================================================================

export interface PersonalizedSceneTemplate {
  sceneNumber: number
  name: string
  description: string
  durationSeconds: number
  type: 'personalized'
  // These have placeholders: [NAME], [GOOD_BEHAVIOR], [THING_TO_IMPROVE], [CUSTOM_MESSAGE]
  videoPromptTemplate: string
  audioDescription: string
}

export const PERSONALIZED_SCENE_TEMPLATES: PersonalizedSceneTemplate[] = [
  {
    sceneNumber: 4,
    name: 'Photo Comes Alive',
    description: "Child's photo appears on Magic Book page and comes alive with animation",
    durationSeconds: 8, // Veo max
    type: 'personalized',
    videoPromptTemplate: `${CINEMATIC_STYLE}

${WORKSHOP_SETTING}

${SANTA_CHARACTER}

THE MAGICAL MOMENT - Child's photo comes alive!

Santa looks down at the glowing Magic Book in his hands.
The page glows intensely with golden light.
On the page, a PHOTOGRAPH appears - surrounded by an ornate golden magical frame.
The photograph shows [CHILD_DESCRIPTION].
Santa's face lights up with recognition and pure JOY.
"Ah! There you are!" Santa says warmly.

THE PHOTO BEGINS TO COME ALIVE:
- Subtle movement within the frame
- The image gains depth and dimension
- Magical golden sparkles swirl around the photo
- The frame pulses with warm light
- Santa watches with wonder and delight

Santa speaks to the photo: "I've been watching you, and I'm so proud..."

Camera: Close-up on book with photo, then Santa's joyful reaction.
VFX: Photo animation, magical frame glow, golden particles, depth effect.
Mood: "THAT'S ME!!!", magical recognition, personal connection, wonder.`,
    audioDescription: 'Magical shimmer, warm orchestral swell, Santa speaking gently, sparkle sounds',
  },
  {
    sceneNumber: 5,
    name: 'Name Reveal',
    description: "Child's name rises from book as giant 3D golden letters",
    durationSeconds: 8, // Veo max
    type: 'personalized',
    videoPromptTemplate: `${CINEMATIC_STYLE}

${WORKSHOP_SETTING}

${SANTA_CHARACTER}

THE NAME REVEAL - Spectacular personalization moment!

Santa holds the Magic Book, the photo still glowing on the page.
From the book, letters begin to RISE UP:
[NAME] forms in GIANT 3D GOLDEN LETTERS!
The letters are luminous, casting golden light across the room.
They FLOAT and SPIN in the air around Santa.
Golden sparkles trail behind each letter.
The letters arrange themselves, hovering majestically.
Santa looks up at the floating name with pure delight.

"[NAME]!" Santa exclaims with joy. "What a wonderful child!"

The letters pulse with warm light, magical particles swirling.
Santa's face glows in the golden light of the floating name.

Camera: Dynamic shot - letters rising, spinning around Santa.
VFX: 3D text animation, golden glow, particle trails, magical floating.
Mood: "MY NAME!", personalized magic, spectacular, memorable.`,
    audioDescription: 'Magical rising sound, triumphant orchestral notes, sparkle crescendo, Santa exclaiming',
  },
  {
    sceneNumber: 6,
    name: "Santa's Message",
    description: 'Santa speaks directly to camera with personalized message about behaviors',
    durationSeconds: 8, // Veo max (was 25s with HeyGen)
    type: 'personalized',
    videoPromptTemplate: `${CINEMATIC_STYLE}

${WORKSHOP_SETTING}

${SANTA_CHARACTER}

SANTA'S PERSONAL MESSAGE - Emotional core of the video.

Santa looks directly at camera with warm, grandfatherly love.
Firelight flickers warmly on his face.
He speaks with genuine emotion and warmth:

"[NAME], I want you to know something very important..."

As Santa mentions GOOD BEHAVIORS:
- "[GOOD_BEHAVIOR]" - SPARKLE BURST of golden light!
- Santa nods approvingly, eyes twinkling

As Santa gives gentle encouragement:
- "[THING_TO_IMPROVE]" - Santa gives understanding nod
- Warm smile, no judgment, just love

As Santa mentions something exciting:
- "[THING_TO_LEARN]" - Santa's eyes light up with excitement
- Enthusiastic gesture, sparkles dance

[CUSTOM_MESSAGE if provided]

Throughout: magical sparkles punctuate emotional moments.
Santa's expressions shift naturally - pride, encouragement, joy.
The fireplace crackles warmly in the background.
Occasional magical dust particles float through frame.

Camera: Medium close-up on Santa, intimate and personal.
VFX: Sparkle bursts on key moments, warm glow, floating particles.
Mood: Eyes glued, "He KNOWS me!", emotional, validating, loving.`,
    audioDescription: 'Warm Santa voice, crackling fire, gentle orchestral underscore, sparkle accents',
  },
  {
    sceneNumber: 8,
    name: 'Epic Launch',
    description: 'Sleigh rockets into sky with rainbow trail and personalized goodbye',
    durationSeconds: 8, // Veo max
    type: 'personalized',
    videoPromptTemplate: `${CINEMATIC_STYLE}

THE EPIC FINALE - Rocket launch and farewell!

Exterior: The magnificent sleigh in the snowy courtyard.
${SANTA_CHARACTER} takes his seat in the sleigh.
Reindeer paw eagerly, Rudolph's nose blazing bright.
Elves wave and cheer from below.

Santa calls out: "Now Dasher, now Dancer...!"
The reindeer LEAP into action!
The sleigh ROCKETS UPWARD with incredible speed!
A magnificent RAINBOW TRAIL streams behind the sleigh!
Golden stardust swirls in their wake!

The sleigh arcs across the starlit sky.
Santa looks back, waves his hand:
"See you soon, [NAME]! Ho ho ho!"

His warm laughter echoes across the sky.
The sleigh becomes a streak of light among the stars.
The rainbow trail forms a heart shape before fading.

TRANSITION: Magical sparkles swirl and transform into:
Elegant end card - "The Santa Experience" in golden script
on deep red velvet background with gentle snowflakes.

Camera: Ground level looking up, following the launch, epic wide shot.
VFX: Rainbow trail, speed blur, stardust, magical transition, logo reveal.
Mood: "GO GO GO!", exhilarating, perfect ending, memorable farewell.`,
    audioDescription: 'Reindeer hooves, whooshing launch, Santa Ho Ho Ho, triumphant orchestra, sleigh bells',
  },
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get a pre-made scene by number
 */
export function getPremadeScene(sceneNumber: number): SceneConfig | undefined {
  return PREMADE_SCENES.find(s => s.sceneNumber === sceneNumber)
}

/**
 * Check if a scene number is pre-made (vs personalized)
 */
export function isPremadeScene(sceneNumber: number): boolean {
  return [1, 2, 3, 7].includes(sceneNumber)
}

/**
 * Check if a scene number is personalized
 */
export function isPersonalizedScene(sceneNumber: number): boolean {
  return [4, 5, 6, 8].includes(sceneNumber)
}

/**
 * Get personalized scene template by number
 */
export function getPersonalizedTemplate(sceneNumber: number): PersonalizedSceneTemplate | undefined {
  return PERSONALIZED_SCENE_TEMPLATES.find(s => s.sceneNumber === sceneNumber)
}

/**
 * Generate personalized scene prompt by filling in placeholders
 */
export function generatePersonalizedPrompt(
  sceneNumber: number,
  data: {
    name: string
    childDescription?: string
    goodBehavior?: string
    thingToImprove?: string
    thingToLearn?: string
    customMessage?: string
  }
): { videoPrompt: string } | null {
  const template = getPersonalizedTemplate(sceneNumber)
  if (!template) return null

  let videoPrompt = template.videoPromptTemplate

  // Replace placeholders
  const replacements: Record<string, string> = {
    '[NAME]': data.name,
    '[CHILD_DESCRIPTION]': data.childDescription || 'a happy child',
    '[GOOD_BEHAVIOR]': data.goodBehavior || 'being kind and helpful',
    '[THING_TO_IMPROVE]': data.thingToImprove || 'keep trying your best',
    '[THING_TO_LEARN]': data.thingToLearn || 'something amazing',
    '[CUSTOM_MESSAGE]': data.customMessage || '',
  }

  for (const [placeholder, value] of Object.entries(replacements)) {
    videoPrompt = videoPrompt.replace(new RegExp(placeholder.replace(/[[\]]/g, '\\$&'), 'g'), value)
  }

  return { videoPrompt }
}

/**
 * Get all scene numbers in order for final video stitching
 */
export function getSceneOrder(): number[] {
  return [1, 2, 3, 4, 5, 6, 7, 8]
}

/**
 * Get total video duration in seconds
 */
export function getTotalDuration(): number {
  const premadeDuration = PREMADE_SCENES.reduce((sum, s) => sum + s.durationSeconds, 0)
  const personalizedDuration = PERSONALIZED_SCENE_TEMPLATES.reduce((sum, s) => sum + s.durationSeconds, 0)
  return premadeDuration + personalizedDuration // ~95 seconds
}
