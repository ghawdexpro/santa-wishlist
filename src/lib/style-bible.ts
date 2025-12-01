/**
 * Style Bible for Santa_PL
 *
 * Defines consistent visual style across all generated content.
 * Uses HeyGen Santa avatar as the reference for all Veo generations.
 *
 * NOTE: This file must be client-safe (no fs/path imports)
 * For server-side image loading, see style-bible-server.ts
 */

// ============================================================================
// SANTA REFERENCE IMAGE PATH
// ============================================================================

/**
 * Path to Santa reference image (relative to public folder)
 * Use getSantaReferenceImageServer() from style-bible-server.ts in API routes
 */
export const SANTA_IMAGE_PATH = '/assets/santa-avatar-reference.png'

// ============================================================================
// SANTA CHARACTER DESCRIPTION (backup for text-only prompts)
// ============================================================================

export const SANTA_CHARACTER = `
EXACT SANTA CHARACTER (must match reference image):
- Elderly Caucasian man, late 60s-70s, grandfatherly
- Full, long white beard reaching mid-chest, fluffy and well-groomed
- DISTINCTIVE: Pink/rose-tinted round glasses
- Rosy cheeks, kind warm expression
- White bushy eyebrows

COSTUME (Premium European style):
- Deep BURGUNDY/WINE colored velvet coat (NOT bright red - more wine/maroon)
- Luxurious white fluffy fur trim on all edges
- GOLD EMBROIDERED ornate floral patterns on sleeves and hem
- Black leather belt with LARGE ornate brass buckle with design
- White satin gloves
- Traditional pointed Santa hat with white fur trim and gold medallion at front
`

// ============================================================================
// SLEIGH & REINDEER (consistent across scenes)
// ============================================================================

export const SLEIGH_DESCRIPTION = `
SANTA'S SLEIGH:
- Classic wooden sleigh, hand-carved, vintage but well-maintained
- Deep burgundy red with gold leaf decorative scrollwork
- Large enough for massive red velvet gift sack
- Brass runners that glow golden when flying
- Leather seat with fur blanket
- Ornate brass lantern at front
`

export const REINDEER_DESCRIPTION = `
REINDEER TEAM:
- 9 majestic reindeer, Rudolph at front with glowing red nose
- Thick winter coats, powerful muscular build
- Magnificent full antlers with frost crystals
- Red leather harnesses with brass bells and golden buckles
- Breath visible in cold air as steam
`

// ============================================================================
// VISUAL STYLE
// ============================================================================

export const CINEMATIC_STYLE = `
CINEMATIC QUALITY:
- Photorealistic rendering, NOT cartoon or CGI-looking
- Hollywood blockbuster cinematography
- Dynamic camera movements, smooth motion
- Volumetric lighting, atmospheric effects
- 4K quality, film grain subtle
- Dramatic lighting with rim lights and lens flares where appropriate
`

export const VFX_STYLE = `
VFX ELEMENTS:
- Volumetric clouds and fog
- Realistic snow particles
- Lightning with proper illumination
- Motion blur for speed
- Magical golden particles/sparkles
- Ice crystals and frost effects
`

// ============================================================================
// ADVENTURE SCENES PROMPTS (Scenes 1-3)
// ============================================================================

export const SCENE_1_STORM = {
  name: 'Storm Over Arctic',
  description: 'Santa battles through epic snowstorm - tension builds',
  durationSeconds: 8,

  prompt: `${CINEMATIC_STYLE}

SCENE: SANTA BATTLES EPIC ARCTIC STORM

${SANTA_CHARACTER}
${SLEIGH_DESCRIPTION}
${REINDEER_DESCRIPTION}

ACTION:
Santa grips the reins tightly as his sleigh flies through a MASSIVE SNOWSTORM.
Wind howls, snow whips horizontally across frame.
Lightning flashes illuminate the dark storm clouds.
Reindeer struggle against the wind, muscles straining.
Santa's coat and beard blow wildly in the wind.
His expression shows determination and slight concern.
The sleigh rocks and tilts dangerously.

CAMERA: Dynamic tracking shot, slight shake for turbulence feel.
Following the sleigh from side angle, showing full action.

VFX:
- Intense horizontal snow/blizzard
- Lightning flashes with thunder
- Volumetric storm clouds
- Wind effects on clothing and beard
- Dramatic rim lighting from lightning
- Motion blur for speed

MOOD: TENSION. "Will he make it?" Exciting, slightly scary but not terrifying.
Kids should be worried but engaged.

${VFX_STYLE}`,

  audioDescription: 'Howling wind, thunder, sleigh bells struggling, reindeer calls',
}

export const SCENE_2_LIGHTNING_STRIKE = {
  name: 'Lightning Strike Crisis',
  description: 'Lightning hits sleigh - peak danger moment',
  durationSeconds: 8,

  prompt: `${CINEMATIC_STYLE}

SCENE: LIGHTNING STRIKES SANTA'S SLEIGH - CRISIS MOMENT!

${SANTA_CHARACTER}
${SLEIGH_DESCRIPTION}
${REINDEER_DESCRIPTION}

ACTION:
A MASSIVE LIGHTNING BOLT strikes Santa's sleigh!
EXPLOSION of sparks and electrical discharge.
The sleigh SHUDDERS and begins to lose altitude.
Smoke trails from where lightning hit.
Santa's eyes go wide with shock.
He shouts "HO HO HOOOO!" in alarm.
The sleigh starts SPIRALING downward.
Reindeer scramble to regain control.
Gift sack nearly flies off the back.
Through the clouds below, snowy landscape visible - they're FALLING.

CAMERA: Dramatic angle, capturing the strike and immediate aftermath.
Quick cuts showing Santa's reaction, the damage, the fall.

VFX:
- MASSIVE lightning bolt impact
- Electrical sparks cascading over sleigh
- Smoke and small flames
- Spiral motion as sleigh falls
- Clouds rushing past (falling effect)
- Debris flying off sleigh

MOOD: PEAK DANGER! "OH NO!" Kids should gasp. Maximum tension before rescue.

${VFX_STYLE}`,

  audioDescription: 'Massive thunder crack, electrical zap, Santa yelling, wind rushing, bells jangling chaotically',
}

export const SCENE_3_MAGICAL_RESCUE = {
  name: 'Magical Rescue',
  description: 'Santa uses magic to save the day - relief and wonder',
  durationSeconds: 8,

  prompt: `${CINEMATIC_STYLE}

SCENE: SANTA'S MAGICAL RESCUE - HE SAVES THE DAY!

${SANTA_CHARACTER}
${SLEIGH_DESCRIPTION}
${REINDEER_DESCRIPTION}

ACTION:
Santa reaches into his coat and pulls out a GLOWING GOLDEN ORNAMENT.
He holds it up high - it PULSES with magical energy.
A MASSIVE WAVE of golden light EXPLODES outward!
The golden magic REPAIRS the sleigh before our eyes.
Damaged wood regenerates, burns heal, sparks become sparkles.
The falling sleigh LEVELS OUT smoothly.
Reindeer are bathed in golden glow, rejuvenated.
Santa's worried expression transforms into his warm, confident smile.
He winks at camera knowingly.
The storm clouds part, revealing starry night sky and aurora borealis.
Safe and sound - crisis averted!

CAMERA: Wide shot capturing the magical explosion, then closer on Santa's relieved smile.

VFX:
- GOLDEN LIGHT EXPLOSION (main event)
- Magical repair effect (wood regenerating)
- Sparkles replacing sparks
- Aurora borealis appearing
- Stars visible through parted clouds
- Warm golden glow on everything

MOOD: RELIEF AND WONDER! "He did it!" Kids cheer. Magic is real. Santa is amazing.

${VFX_STYLE}`,

  audioDescription: 'Magical shimmer, orchestral swell, sleigh bells ringing clear, Santa warm chuckle, peaceful wind',
}

// ============================================================================
// SCENE 7 - SLEIGH READY (Pre-made, after personalized scenes)
// ============================================================================

export const SCENE_7_SLEIGH_READY = {
  name: 'Sleigh Ready for Delivery',
  description: 'Santa prepares sleigh for Christmas Eve delivery',
  durationSeconds: 8,

  prompt: `${CINEMATIC_STYLE}

SCENE: SANTA PREPARES FOR CHRISTMAS DELIVERY

${SANTA_CHARACTER}
${SLEIGH_DESCRIPTION}
${REINDEER_DESCRIPTION}

SETTING: North Pole workshop exterior at magical twilight.
Cozy wooden buildings with warm glowing windows.
Fresh snow everywhere, gentle snowfall.
Aurora borealis dancing in the sky.

ACTION:
Santa stands proudly next to his fully-loaded sleigh.
The sleigh is overflowing with wrapped presents - all colors and sizes.
Reindeer stamp their hooves eagerly, ready to fly.
Rudolph's nose glows bright red.
Santa adjusts his belt, pats his belly, takes a deep breath.
He looks up at the starry sky with determination and joy.
This is the moment - Christmas is about to happen.
He climbs into the sleigh, takes the reins.

CAMERA: Epic wide shot showing full sleigh, reindeer team, Northern lights.

VFX:
- Gentle falling snow
- Aurora borealis (green/purple)
- Warm light from workshop windows
- Rudolph's glowing nose
- Breath vapor from reindeer
- Twinkling stars

MOOD: ANTICIPATION AND JOY. "Here we go!" The excitement of Christmas Eve.

${VFX_STYLE}`,

  audioDescription: 'Gentle wind, sleigh bells ready, reindeer eager snorts, distant Christmas music',
}

// ============================================================================
// EXPORT ALL ADVENTURE SCENES
// ============================================================================

export const ADVENTURE_SCENES = {
  scene1: SCENE_1_STORM,
  scene2: SCENE_2_LIGHTNING_STRIKE,
  scene3: SCENE_3_MAGICAL_RESCUE,
  scene7: SCENE_7_SLEIGH_READY,
}

export type AdventureSceneKey = keyof typeof ADVENTURE_SCENES
