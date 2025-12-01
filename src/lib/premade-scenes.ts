/**
 * Scene definitions for Santa_PL - Adventure Edition
 *
 * 8-scene structure (~93 seconds total for 1 child):
 * - PRE-MADE (1, 2, 3, 7): Generate once, reuse forever (32s total)
 * - PERSONALIZED (4, 5, 6, 8): Generate per order with child's data (~61s per child with HeyGen)
 *
 * SCENES 1-3: Epic adventure - storm, crash, magical rescue
 * SCENES 4-6: Personalized content with child's photo/name/message
 * SCENE 7: Sleigh ready for delivery
 * SCENE 8: Epic launch
 *
 * NOTE: Veo 3.1 supports max 8 seconds per generation
 * Scene 6 uses HeyGen for 30-60s talking Santa avatar
 */

import {
  SANTA_CHARACTER,
  SLEIGH_DESCRIPTION,
  REINDEER_DESCRIPTION,
  CINEMATIC_STYLE,
  VFX_STYLE,
  ADVENTURE_SCENES,
} from './style-bible'

export interface SceneConfig {
  sceneNumber: number
  name: string
  description: string
  durationSeconds: number
  type: 'premade' | 'personalized'
  videoPrompt: string
  audioDescription: string
}

// Santa's cozy study for indoor scenes (neutral, no Malta)
const SANTA_STUDY = `Santa's cozy study at the North Pole:
Warm wooden walls with high vaulted ceiling,
magnificent stone fireplace with crackling orange flames,
antique leather wingback chair in deep burgundy, ornate wooden desk covered in letters from children,
shelves lined with antique toys and magical artifacts,
frosted windows showing Northern Lights outside,
warm golden ambient lighting from oil lamps and candles, magical dust particles floating in air,
cozy intimate feeling of a magical workshop room.`

// ============================================================================
// PRE-MADE SCENES (4 total) - Generate once, reuse for all orders
// ============================================================================

export const PREMADE_SCENES: SceneConfig[] = [
  {
    sceneNumber: 1,
    name: ADVENTURE_SCENES.scene1.name,
    description: ADVENTURE_SCENES.scene1.description,
    durationSeconds: ADVENTURE_SCENES.scene1.durationSeconds,
    type: 'premade',
    videoPrompt: ADVENTURE_SCENES.scene1.prompt,
    audioDescription: ADVENTURE_SCENES.scene1.audioDescription,
  },
  {
    sceneNumber: 2,
    name: ADVENTURE_SCENES.scene2.name,
    description: ADVENTURE_SCENES.scene2.description,
    durationSeconds: ADVENTURE_SCENES.scene2.durationSeconds,
    type: 'premade',
    videoPrompt: ADVENTURE_SCENES.scene2.prompt,
    audioDescription: ADVENTURE_SCENES.scene2.audioDescription,
  },
  {
    sceneNumber: 3,
    name: ADVENTURE_SCENES.scene3.name,
    description: ADVENTURE_SCENES.scene3.description,
    durationSeconds: ADVENTURE_SCENES.scene3.durationSeconds,
    type: 'premade',
    videoPrompt: ADVENTURE_SCENES.scene3.prompt,
    audioDescription: ADVENTURE_SCENES.scene3.audioDescription,
  },
  {
    sceneNumber: 7,
    name: ADVENTURE_SCENES.scene7.name,
    description: ADVENTURE_SCENES.scene7.description,
    durationSeconds: ADVENTURE_SCENES.scene7.durationSeconds,
    type: 'premade',
    videoPrompt: ADVENTURE_SCENES.scene7.prompt,
    audioDescription: ADVENTURE_SCENES.scene7.audioDescription,
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
    description: "Child's photo appears in Santa's Magic Book",
    durationSeconds: 8,
    type: 'personalized',
    videoPromptTemplate: `${CINEMATIC_STYLE}

${SANTA_STUDY}

${SANTA_CHARACTER}

THE MAGICAL MOMENT - Child discovered in the Magic Book!

Santa sits by the warm fireplace, recovered from his adventure.
He holds his ancient leather-bound MAGIC BOOK OF CHILDREN.
The book glows with golden light.
On the page, a PHOTOGRAPH appears - surrounded by an ornate GOLDEN FRAME.
The frame features elegant magical patterns and sparkles.
The photograph shows [CHILD_DESCRIPTION].
Santa's face lights up with recognition and pure JOY.
"Ah! There you are!" Santa says warmly, adjusting his pink glasses.

THE PHOTO BEGINS TO COME ALIVE:
- Subtle movement within the frame
- The image gains depth and dimension
- Magical golden sparkles swirl around the border
- The frame pulses with warm golden light
- Santa watches with wonder and delight

Santa speaks to the photo: "I've been looking for you..."

Camera: Close-up on book with photo in magical frame, then Santa's joyful reaction.
VFX: Photo animation, frame glow, golden particles, depth effect.
Mood: "THAT'S ME!!!", magical recognition, personal connection.

${VFX_STYLE}`,
    audioDescription: 'Magical shimmer, warm orchestral swell, Santa speaking gently in Polish, sparkle sounds',
  },
  {
    sceneNumber: 5,
    name: 'Name in the Stars',
    description: "Child's name rises as golden letters in the Northern sky",
    durationSeconds: 8,
    type: 'personalized',
    videoPromptTemplate: `${CINEMATIC_STYLE}

THE NAME REVEAL - In the Northern Lights!

Background: NORTHERN SKY at magical twilight.
Spectacular AURORA BOREALIS dancing - green, purple, blue ribbons of light.
Stars twinkling in the dark Arctic sky.
Snow-covered mountains below.

From the aurora, letters begin to FORM:
[NAME] materializes in GIANT 3D GOLDEN LETTERS!
The letters are luminous, casting golden light across the sky.
They FLOAT and SPIN majestically among the Northern Lights.
Golden sparkles trail behind each letter.
The letters arrange themselves, hovering in the aurora.
Stars seem to dance around the floating name.

"[NAME]!" Santa's voice exclaims with joy. "Co za wspaniałe dziecko!"

The letters pulse with warm golden light.
The aurora intensifies, framing the name.

Camera: Dynamic shot - letters rising into aurora, epic wide angle.
VFX: 3D text animation, golden glow, particle trails, magical floating, aurora reflections.
Mood: "MY NAME in the SKY!", personalized magic, spectacular, proud.

${VFX_STYLE}`,
    audioDescription: 'Magical rising sound, triumphant orchestral notes, sparkle crescendo, Santa exclaiming in Polish',
  },
  {
    sceneNumber: 6,
    name: "Santa's Personal Message",
    description: 'Santa speaks directly to camera with personalized message (HeyGen 30-60s)',
    durationSeconds: 45, // HeyGen generates 30-60s talking avatar
    type: 'personalized',
    videoPromptTemplate: `${CINEMATIC_STYLE}

${SANTA_STUDY}

${SANTA_CHARACTER}

SANTA'S PERSONAL MESSAGE - Emotional core of the video.

Santa looks directly at camera with warm, grandfatherly love.
Firelight flickers warmly on his face.
His pink glasses reflect the golden firelight.
He speaks with genuine emotion and warmth IN POLISH:

"[NAME], chcę ci powiedzieć coś bardzo ważnego..."

As Santa mentions GOOD BEHAVIORS:
- "[GOOD_BEHAVIOR]" - SPARKLE BURST of golden light!
- Santa nods approvingly, eyes twinkling behind pink glasses

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
    audioDescription: 'Warm Santa voice in Polish, crackling fire, gentle orchestral underscore, sparkle accents',
  },
  {
    sceneNumber: 8,
    name: 'Epic Launch to Delivery',
    description: 'Sleigh rockets from North Pole to deliver presents',
    durationSeconds: 8,
    type: 'personalized',
    videoPromptTemplate: `${CINEMATIC_STYLE}

THE EPIC FINALE - Launch to Christmas!

Exterior: The magnificent sleigh at the North Pole workshop.
${SANTA_CHARACTER} takes his seat in the sleigh.
${SLEIGH_DESCRIPTION}
${REINDEER_DESCRIPTION}
Below: The twinkling lights of the North Pole village.
Reindeer paw eagerly, Rudolph's nose blazing bright red.
Elves wave and cheer from the workshop doors.
Northern Lights dance overhead.

Santa calls out: "A teraz lecimy do [NAME]!"
The reindeer LEAP into action!
The sleigh ROCKETS UPWARD into the aurora-filled sky!
A magnificent GOLDEN RAINBOW TRAIL streams behind the sleigh!
Golden stardust swirls in their wake!

The sleigh arcs across the starlit Northern sky.
In the stars, [NAME] appears written in GLOWING CONSTELLATION letters!
Santa looks back toward camera, waves his hand:
"Do zobaczenia wkrótce, [NAME]! Wesołych Świąt! Ho ho ho!"

His warm laughter echoes across the Arctic.
The sleigh becomes a streak of golden light among the stars.
A heart-shaped aurora forms before fading.

TRANSITION: Magical sparkles swirl and transform into:
Elegant end card - "Magia Świąt" in golden script
on deep red velvet background.

Camera: Ground level looking up, following the launch into aurora.
VFX: Rainbow trail, speed blur, stardust, aurora reflections, magical transition, logo reveal.
Mood: "GO GO GO!", exhilarating, perfect ending, memorable farewell.

${VFX_STYLE}`,
    audioDescription: 'Reindeer hooves, whooshing launch, Santa Ho Ho Ho in Polish, triumphant orchestra, sleigh bells',
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
    '[CHILD_DESCRIPTION]': data.childDescription || 'szczęśliwe dziecko',
    '[GOOD_BEHAVIOR]': data.goodBehavior || 'byłeś bardzo grzeczny i pomocny',
    '[THING_TO_IMPROVE]': data.thingToImprove || 'dalej staraj się ze wszystkich sił',
    '[THING_TO_LEARN]': data.thingToLearn || 'coś niesamowitego',
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
  return premadeDuration + personalizedDuration // ~93 seconds
}
