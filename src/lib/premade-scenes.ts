/**
 * Scene definitions for Il-Milied Magic - Santa's Maltese Adventure
 *
 * 8-scene structure (~93 seconds total for 1 child):
 * - PRE-MADE (1, 2, 3, 7): Generate once, reuse forever (32s total)
 * - PERSONALIZED (4, 5, 6, 8): Generate per order with child's data (~61s per child with HeyGen)
 *
 * NOTE: Veo 3.1 supports max 8 seconds per generation (5-8s range)
 * Scene 6 uses HeyGen for 30-60s talking Santa avatar
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

// Cinematic quality settings for Veo - Mediterranean warmth
const CINEMATIC_STYLE = `Cinematic quality, 4K resolution, professional Hollywood film lighting,
warm Mediterranean color grading, golden hour warmth, smooth camera movement,
photorealistic rendering, no artifacts, seamless motion, Pixar-quality magic,
honey-colored Maltese limestone tones, azure Mediterranean blue waters.`

const SANTA_CHARACTER = `Santa Claus: distinguished elderly man in his 60s,
full natural white beard perfectly groomed, rosy cheeks glowing with warmth,
kind twinkling blue eyes with crow's feet from smiling, genuine warm smile,
classic red velvet suit with pristine white fur trim, polished black leather belt with ornate gold buckle,
soft gentle demeanor like a beloved grandfather, magical presence.`

const MALTA_SETTING = `Santa's secret study hidden within Mdina's ancient walls:
Warm honey-colored Maltese limestone walls with high vaulted ceiling,
magnificent stone fireplace with crackling orange flames,
antique leather wingback chair in deep burgundy, ornate wooden desk covered in letters,
shelves lined with antique toys and Mediterranean treasures,
arched windows showing starlit Maltese night sky,
warm golden ambient lighting from oil lamps and candles, magical dust particles floating in air,
subtle Maltese cross decorations, traditional colorful tiles on floor,
the cozy intimate feeling of an ancient Mediterranean palace room.`

// ============================================================================
// PRE-MADE SCENES (4 total) - Generate once, reuse for all orders
// ============================================================================

export const PREMADE_SCENES: SceneConfig[] = [
  {
    sceneNumber: 1,
    name: 'Three Islands Reveal',
    description: 'Epic aerial journey over Malta, Gozo, and Comino at golden hour',
    durationSeconds: 8, // Veo max
    type: 'premade',
    videoPrompt: `${CINEMATIC_STYLE}

EPIC OPENING - Soaring over the Maltese Islands.

Camera POV flying over the Mediterranean Sea at golden hour sunset.
Starting high above azure blue waters, golden sunlight sparkling on waves.
SWEEP DOWN toward the THREE ISLANDS OF MALTA visible below.
The islands glow warm in the Mediterranean sunset light.
MALTA - the main island with Valletta's iconic domes and bastions visible.
GOZO - the sister island with green hills and the Citadel.
COMINO - the tiny island with the famous turquoise BLUE LAGOON sparkling.
Magical golden sparkles and stardust trail behind the camera.
Christmas lights twinkling from villages across all three islands.
Ancient watchtowers and fortifications dot the golden limestone coastline.
Camera continues toward MDINA - the ancient Silent City on a hilltop.
The walled city glows mysteriously in the fading light.

Camera: First-person POV, sweeping cinematic movement, majestic and warm.
VFX: Golden particle trails, lens flares, Mediterranean light reflections, magical sparkles.
Mood: BEAUTIFUL, awe-inspiring, "That's MY home!", local pride and wonder.`,
    audioDescription: 'Warm Mediterranean wind, magical chimes building, orchestral swell, distant church bells',
  },
  {
    sceneNumber: 2,
    name: 'Mdina Silent City',
    description: 'Magical descent through the ancient streets of the Silent City',
    durationSeconds: 8, // Veo max
    type: 'premade',
    videoPrompt: `${CINEMATIC_STYLE}

MDINA MAGIC - The Silent City at Christmas.

Camera glides through the iconic MDINA GATE at dusk.
Ancient honey-colored MALTESE LIMESTONE walls glow warm gold.
Narrow medieval streets lit by warm lanterns and Christmas lights.
Baroque architecture with ornate balconies (gallariji) decorated for Christmas.
Golden garlands wrapping around ancient stone pillars.
Fairy lights twinkling in arched doorways and windows.
Red velvet ribbons on ornate wooden doors.
The magnificent ST. PAUL'S CATHEDRAL dome visible against purple twilight sky.
Gentle MAGICAL SNOWFLAKES begin to fall (artistic Christmas touch).
Santa's shadow passes over the ancient cobblestones.
A mysterious GOLDEN GLOW emanates from a palace archway ahead.
Camera enters through the ancient archway toward the light...

Camera: Smooth gliding movement through narrow streets, intimate and magical.
VFX: Appearing Christmas decorations, magical snow, warm golden glows.
Mood: ENCHANTING, mysterious, "This is magical!", ancient wonder meets Christmas.`,
    audioDescription: 'Soft footsteps on stone, magical chimes, distant cathedral bells, warm mysterious music',
  },
  {
    sceneNumber: 3,
    name: 'Book of Maltese Children',
    description: 'Santa summons his magic book with the children of Malta',
    durationSeconds: 8, // Veo max
    type: 'premade',
    videoPrompt: `${CINEMATIC_STYLE}

${MALTA_SETTING}

${SANTA_CHARACTER}

SANTA'S MAGICAL POWERS revealed in his Maltese retreat.

Santa sits in his cozy Mdina study by the crackling fireplace.
He looks toward camera with a knowing twinkle in his eye.
Santa raises his hand with a MAGICAL GESTURE - fingers spread, gentle wave.
Across the room, an ancient leather-bound book begins to GLOW golden.
The book cover shows "THE CHILDREN OF MALTA" in gold lettering.
A MALTESE CROSS emblem adorns the leather binding.
The book FLIES through the air toward Santa!
Trails of golden sparkles follow the floating book.
The book lands gently in Santa's hands.
He opens it and GOLDEN LIGHT EXPLODES from the pages!
Magical particles swirl up from the illuminated pages.
Santa's face is bathed in warm golden light from below.
Pages begin to flip by themselves, searching for someone special...
Santa's expression shows anticipation and excitement.

Camera: Medium shot of Santa, dramatic lighting from book's glow.
VFX: Telekinesis effect, floating book, golden light burst, magical particles, page flip.
Mood: "He has POWERS!", real movie magic, wizardly Santa, awe-inspiring.`,
    audioDescription: 'Magical whoosh, golden shimmer sounds, book flutter, dramatic orchestral swell',
  },
  {
    sceneNumber: 7,
    name: 'Sleigh on Mdina Ramparts',
    description: 'Santa walks to door revealing sleigh on ancient Mdina battlements',
    durationSeconds: 8, // Veo max
    type: 'premade',
    videoPrompt: `${CINEMATIC_STYLE}

${SANTA_CHARACTER}

THE GRAND DEPARTURE from Mdina's ancient ramparts.

Santa rises from his chair with purpose and excitement.
He walks toward massive wooden doors set in ancient limestone walls.
Ornate iron door handles with Maltese cross details.
Santa places his hand on the handle.
Door SWINGS OPEN dramatically, revealing:

The magnificent MDINA RAMPARTS at night:
- The legendary RED AND GOLD SLEIGH on the ancient battlements
- Piled HIGH with beautifully wrapped presents, ribbons glowing softly
- EIGHT MAJESTIC REINDEER harnessed and ready, breath visible in cool night air
- RUDOLPH at the front, nose BLAZING bright red, casting red glow on limestone
- Below: The TWINKLING LIGHTS OF MALTA spreading to the Mediterranean Sea
- The THREE ISLANDS visible in the moonlit distance
- Starlit Mediterranean sky above
- Cheerful ELVES making final preparations

Santa steps through the doorway, silhouetted against the spectacular Maltese panorama.
Reindeer paw the ancient stones eagerly, ready to fly over the islands.

Camera: Following Santa, then wide reveal of Malta below.
VFX: Glowing Rudolph nose, breath vapor, sea reflections, starlit atmosphere.
Mood: Anticipation, the promise of Christmas coming to Malta, epic Mediterranean setup.`,
    audioDescription: 'Door creaking open, reindeer snorting, bells jingling, Mediterranean wind, magical anticipation',
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
    name: 'Photo Discovery',
    description: "Child's photo appears in Santa's Magic Book with Maltese cross frame",
    durationSeconds: 8, // Veo max
    type: 'personalized',
    videoPromptTemplate: `${CINEMATIC_STYLE}

${MALTA_SETTING}

${SANTA_CHARACTER}

THE MAGICAL MOMENT - Child's photo discovered in Malta!

Santa looks down at the glowing Magic Book in his hands.
The page glows intensely with golden light.
On the page, a PHOTOGRAPH appears - surrounded by an ornate GOLDEN MALTESE CROSS FRAME.
The frame features elegant Maltese filigree patterns and Mediterranean motifs.
The photograph shows [CHILD_DESCRIPTION].
Santa's face lights up with recognition and pure JOY.
"Ah! There you are!" Santa says warmly.

THE PHOTO BEGINS TO COME ALIVE:
- Subtle movement within the frame
- The image gains depth and dimension
- Magical golden sparkles swirl around the Maltese cross border
- The frame pulses with warm Mediterranean golden light
- Santa watches with wonder and delight

Santa speaks to the photo: "I've been watching over Malta, and I found you..."

Camera: Close-up on book with photo in Maltese frame, then Santa's joyful reaction.
VFX: Photo animation, Maltese cross frame glow, golden particles, depth effect.
Mood: "THAT'S ME!!!", magical recognition, personal connection, Maltese pride.`,
    audioDescription: 'Magical shimmer, warm orchestral swell, Santa speaking gently, sparkle sounds',
  },
  {
    sceneNumber: 5,
    name: 'Name Over Malta',
    description: "Child's name rises as golden letters over Valletta skyline",
    durationSeconds: 8, // Veo max
    type: 'personalized',
    videoPromptTemplate: `${CINEMATIC_STYLE}

THE NAME REVEAL - Over the Maltese Skyline!

Background: VALLETTA SKYLINE at dusk, Grand Harbour visible below.
Iconic domes of St. John's Co-Cathedral and Carmelite Church.
Mediterranean sunset colors - orange, pink, purple blending.
Ancient bastions and fortifications silhouetted.

From below, letters begin to RISE UP:
[NAME] forms in GIANT 3D GOLDEN LETTERS!
The letters are luminous, casting golden light across the Maltese sky.
They FLOAT and SPIN majestically above Valletta.
Golden sparkles trail behind each letter.
The letters arrange themselves, hovering over the harbour.
Stars begin to appear around the floating name.

"[NAME]!" Santa's voice exclaims with joy. "What a wonderful child from Malta!"

The letters pulse with warm Mediterranean golden light.
The THREE ISLANDS visible in the distance below.

Camera: Dynamic shot - letters rising over Valletta, epic wide angle.
VFX: 3D text animation, golden glow, particle trails, magical floating, sunset reflections.
Mood: "MY NAME over MY country!", personalized magic, spectacular, proud.`,
    audioDescription: 'Magical rising sound, triumphant orchestral notes, sparkle crescendo, Santa exclaiming',
  },
  {
    sceneNumber: 6,
    name: "Santa's Personal Message",
    description: 'Santa speaks directly to camera with personalized message (HeyGen 30-60s)',
    durationSeconds: 45, // HeyGen generates 30-60s talking avatar
    type: 'personalized',
    videoPromptTemplate: `${CINEMATIC_STYLE}

${MALTA_SETTING}

${SANTA_CHARACTER}

SANTA'S PERSONAL MESSAGE - Emotional core of the video.

Santa looks directly at camera with warm, grandfatherly love.
Firelight flickers warmly on his face in the Mdina palace study.
Ancient Maltese limestone walls visible in background.
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
    audioDescription: 'Warm Santa voice in English, crackling fire, gentle orchestral underscore, sparkle accents',
  },
  {
    sceneNumber: 8,
    name: 'Epic Launch Over Malta',
    description: 'Sleigh rockets from Mdina ramparts over the three islands',
    durationSeconds: 8, // Veo max
    type: 'personalized',
    videoPromptTemplate: `${CINEMATIC_STYLE}

THE EPIC FINALE - Launch from Mdina over Malta!

Exterior: The magnificent sleigh on MDINA'S ANCIENT RAMPARTS.
${SANTA_CHARACTER} takes his seat in the sleigh.
Below: The twinkling lights of Malta spread to the Mediterranean Sea.
Reindeer paw eagerly on ancient limestone, Rudolph's nose blazing bright.
Elves wave and cheer from the battlements.

Santa calls out: "Now Dasher, now Dancer...!"
The reindeer LEAP into action!
The sleigh ROCKETS UPWARD from the ancient walls!
A magnificent GOLDEN RAINBOW TRAIL streams behind the sleigh!
Golden stardust swirls in their wake!

The sleigh arcs across the starlit Mediterranean sky.
Below: The THREE ISLANDS OF MALTA glow with Christmas lights.
In the stars, [NAME] appears written in GLOWING CONSTELLATION letters!
Santa looks back, waves his hand:
"See you soon, [NAME]! Merry Christmas from Malta! Ho ho ho!"

His warm laughter echoes across the islands.
The sleigh becomes a streak of golden light among the stars.
A heart-shaped aurora forms over the Mediterranean before fading.

TRANSITION: Magical sparkles swirl and transform into:
Elegant end card - "Il-Milied Magic" in golden script
on deep red velvet background with Maltese cross accent.

Camera: Ground level on ramparts looking up, following the launch over Malta.
VFX: Rainbow trail, speed blur, stardust, sea reflections, magical transition, logo reveal.
Mood: "GO GO GO!", exhilarating, perfect Maltese ending, memorable farewell.`,
    audioDescription: 'Reindeer hooves on stone, whooshing launch, Santa Ho Ho Ho, triumphant orchestra, sleigh bells over Malta',
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
