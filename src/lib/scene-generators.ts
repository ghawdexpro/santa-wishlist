/**
 * Scene Generators for Scenes 5, 6, and 8
 * Personalized scene generation for each child
 *
 * Scene 5 & 8: NanoBanana (keyframes) + Veo (video generation)
 * Scene 6: HeyGen Talking Avatar (30-60 second Santa message)
 */

import { generateKeyframe, KeyframeRequest } from './nanobanana'
import { startVideoGeneration, VideoGenerationRequest } from './veo'
import {
  generateSantaVideo,
  waitForVideoCompletion,
  buildScene6Script,
  validateHeyGenConfig,
} from './heygen'

export interface SceneGenerationRequest {
  childName: string
  childAge: number
  goodBehavior: string
  thingToImprove: string
  thingToLearn: string
  personalizedScript?: string // From Gemini for Scene 6
}

// Flag to use HeyGen for Scene 6 (premium tier) or Veo (basic tier)
const USE_HEYGEN_FOR_SCENE_6 = process.env.USE_HEYGEN_FOR_SCENE_6 !== 'false'

/**
 * SCENE 5: Name Reveal
 * Generate keyframe with child's name in golden 3D letters, then animate with Veo
 */
export async function generateScene5NameReveal(childData: SceneGenerationRequest): Promise<string> {
  console.log(`[Scene5] Generating Name Reveal for ${childData.childName}`)

  try {
    // Step 1: Generate keyframe with NanoBanana
    const keyframePrompt = `CINEMATIC VFX INSTRUCTION - Scene 5: Name Reveal

MAGICAL NAME REVEAL MOMENT
Santa's workshop, magical atmosphere. Golden Christmas decorations glow with warm light.

VISUAL FOCUS:
Massive, three-dimensional GOLDEN LETTERS appear floating and slowly rotating in the magical workshop air.
The letters spell: "${childData.childName.toUpperCase()}"

LETTER CHARACTERISTICS:
- Made of gleaming, solid GOLD with metallic shine
- Each letter is MASSIVE, filling the frame
- Letters float and rotate slowly in space
- Surrounded by magical golden sparkles
- Bright, warm golden light illuminates the letters
- Subtle glow/halo effect around each letter
- Christmas decoration bokeh in background

ATMOSPHERE:
- Santa in background, watching with delight and amazement
- Workshop setting: magical tools, twinkling lights, cozy warmth
- Golden particles floating in the air
- Ethereal, magical, joyful atmosphere

EMOTION:
- This is the BIG REVEAL moment
- Pure joy and wonder
- "THAT'S MY NAME!!!" feeling
- Empowerment and excitement

TECHNICAL REQUIREMENTS:
- Aspect ratio: 16:9
- Cinematic quality
- Warm golden color palette
- Particles and sparkles
- Depth and dimension
- Fantasy/magical VFX style

This is a premium moment from a $59+ personalized Santa video.`

    const keyframeRequest: KeyframeRequest = {
      prompt: keyframePrompt,
      sceneNumber: 5,
    }

    const keyframeResult = await generateKeyframe(keyframeRequest)

    // Step 2: Animate keyframe with Veo (max 8 seconds)
    const videoPrompt = `Animate the golden 3D name "${childData.childName.toUpperCase()}"
floating in Santa's magical workshop. Letters slowly rotate and glow with warm golden light.
Magical sparkles surround the name. Santa watches with joy in the background.
Warm, cozy workshop lighting. Pure magic and wonder. Premium cinematic quality.`

    const videoRequest: VideoGenerationRequest = {
      prompt: videoPrompt,
      imageBase64: keyframeResult.imageBase64,
      imageMimeType: keyframeResult.mimeType,
      durationSeconds: 8,
      aspectRatio: '16:9',
    }

    const operationName = await startVideoGeneration(videoRequest)

    console.log(`[Scene5] Successfully started video generation for ${childData.childName}`)

    return operationName
  } catch (error) {
    console.error(`[Scene5] Failed to generate Scene 5 for ${childData.childName}:`, error)
    throw error
  }
}

/**
 * SCENE 6: Santa's Personal Message
 *
 * Premium Tier (HeyGen): 30-60 second talking Santa avatar with personalized script
 * Basic Tier (Veo): 8 second animated Santa keyframe
 *
 * HeyGen provides a realistic talking head with lip-sync, perfect for personal messages.
 * Returns: HeyGen video URL (ready to use) OR Veo operation name (needs polling)
 */
export async function generateScene6SantasMessage(
  childData: SceneGenerationRequest
): Promise<{ type: 'heygen' | 'veo'; value: string; duration?: number }> {
  console.log(`[Scene6] Generating Santa's Message for ${childData.childName}`)
  console.log(`[Scene6] Using ${USE_HEYGEN_FOR_SCENE_6 ? 'HeyGen (premium)' : 'Veo (basic)'} mode`)

  if (USE_HEYGEN_FOR_SCENE_6) {
    // PREMIUM: HeyGen Talking Avatar (30-60 seconds)
    return generateScene6WithHeyGen(childData)
  } else {
    // BASIC: Veo animated keyframe (8 seconds)
    return generateScene6WithVeo(childData)
  }
}

/**
 * Scene 6 with HeyGen Talking Avatar (Premium Tier)
 * Generates a 30-60 second video of Santa speaking the personalized script
 */
async function generateScene6WithHeyGen(
  childData: SceneGenerationRequest
): Promise<{ type: 'heygen'; value: string; duration: number }> {
  console.log(`[Scene6-HeyGen] Starting HeyGen generation for ${childData.childName}`)

  // Validate HeyGen is configured
  const config = validateHeyGenConfig()
  if (!config.valid) {
    console.error(`[Scene6-HeyGen] Missing config: ${config.missing.join(', ')}`)
    throw new Error(`HeyGen not configured. Missing: ${config.missing.join(', ')}`)
  }

  try {
    // Build script - use pre-generated Gemini script or default template
    const script = buildScene6Script(
      childData.childName,
      childData.childAge,
      childData.goodBehavior,
      childData.thingToImprove,
      childData.thingToLearn,
      childData.personalizedScript
    )

    console.log(`[Scene6-HeyGen] Script length: ${script.length} characters`)

    // Start HeyGen video generation
    const videoId = await generateSantaVideo({
      script,
      childName: childData.childName,
    })

    console.log(`[Scene6-HeyGen] Video started: ${videoId}`)

    // Wait for completion (HeyGen takes 30-120 seconds typically)
    const videoUrl = await waitForVideoCompletion(videoId, 60)

    console.log(`[Scene6-HeyGen] Video completed for ${childData.childName}`)

    // Estimate duration based on script length (~2.5 words per second)
    const wordCount = script.split(/\s+/).length
    const estimatedDuration = Math.max(30, Math.min(60, wordCount / 2.5))

    return {
      type: 'heygen',
      value: videoUrl,
      duration: estimatedDuration,
    }
  } catch (error) {
    console.error(`[Scene6-HeyGen] Failed for ${childData.childName}:`, error)

    // Fallback to Veo if HeyGen fails
    console.log(`[Scene6-HeyGen] Falling back to Veo for ${childData.childName}`)
    const veoResult = await generateScene6WithVeo(childData)
    return {
      type: 'heygen', // Keep type for consistency
      value: veoResult.value,
      duration: 8,
    }
  }
}

/**
 * Scene 6 with Veo (Basic Tier / Fallback)
 * Generates an 8-second animated keyframe of Santa
 */
async function generateScene6WithVeo(
  childData: SceneGenerationRequest
): Promise<{ type: 'veo'; value: string; duration: number }> {
  console.log(`[Scene6-Veo] Starting Veo generation for ${childData.childName}`)

  try {
    // Step 1: Generate keyframe with NanoBanana
    const keyframePrompt = `CINEMATIC VFX INSTRUCTION - Scene 6: Santa's Personal Message

HEARTFELT SANTA MOMENT
Santa Claus in his cozy workshop study, warm and personal setting.

VISUAL FOCUS:
Santa sitting in a comfortable armchair by a warm fireplace.
He is looking directly at the camera with a warm, loving smile.
Holding a beautiful golden scroll with "${childData.childName}" written in elegant calligraphy.

SANTA'S APPEARANCE:
- Traditional red suit with white fur trim
- Kind, twinkling eyes full of warmth
- Gentle, grandfatherly smile
- White fluffy beard
- Rosy cheeks
- Reading glasses perched on nose

SETTING:
- Cozy workshop study/reading nook
- Warm fireplace with golden flames
- Christmas decorations: garlands, stockings, candles
- Soft, warm lighting from fire and candles
- Snow visible through frosted window
- Nice List book visible nearby

ATMOSPHERE:
- Intimate, personal moment
- Warm, loving, caring
- Like Santa is speaking directly to ${childData.childName}
- Cozy Christmas Eve feeling
- Safe, magical, special

TECHNICAL REQUIREMENTS:
- Aspect ratio: 16:9
- Cinematic quality, soft focus background
- Warm golden color palette
- Premium, professional quality

This is the emotional heart of a personalized Santa video for ${childData.childName}.`

    const keyframeRequest: KeyframeRequest = {
      prompt: keyframePrompt,
      sceneNumber: 6,
    }

    const keyframeResult = await generateKeyframe(keyframeRequest)

    // Step 2: Animate keyframe with Veo (max 8 seconds)
    const videoPrompt = `Gentle animation: Santa Claus sitting by warm fireplace, holding golden scroll with "${childData.childName}" written on it.
Santa looks at the camera with warm, loving eyes and a gentle smile.
Fireplace flames flicker warmly. Soft candlelight glows.
Santa nods gently, radiating warmth and care. Premium cinematic quality.`

    const videoRequest: VideoGenerationRequest = {
      prompt: videoPrompt,
      imageBase64: keyframeResult.imageBase64,
      imageMimeType: keyframeResult.mimeType,
      durationSeconds: 8,
      aspectRatio: '16:9',
    }

    const operationName = await startVideoGeneration(videoRequest)

    console.log(`[Scene6-Veo] Video generation started for ${childData.childName}`)

    return {
      type: 'veo',
      value: operationName,
      duration: 8,
    }
  } catch (error) {
    console.error(`[Scene6-Veo] Failed for ${childData.childName}:`, error)
    throw error
  }
}

/**
 * SCENE 8: Epic Launch
 * Generate keyframe with personalized goodbye, then animate with Veo
 */
export async function generateScene8EpicLaunch(childData: SceneGenerationRequest): Promise<string> {
  console.log(`[Scene8] Generating Epic Launch for ${childData.childName}`)

  try {
    // Step 1: Generate keyframe with NanoBanana
    const keyframePrompt = `CINEMATIC VFX INSTRUCTION - Scene 8: Epic Launch

SPECTACULAR SLEIGH LAUNCH MOMENT
Nighttime, starlit sky. Santa's magical sleigh launches into the Christmas night.

VISUAL ELEMENTS:
1. Santa's golden sleigh soars upward into the starry night sky
2. Magical reindeer in powerful flight, silhouetted against stars
3. Celestial panorama: stars, planets, aurora-like glow
4. Golden magical trail of light and sparkles behind the sleigh
5. Meteors or shooting stars streaking across the sky
6. "${childData.childName}" appears written in GLOWING STARS in the constellation

ATMOSPHERE:
- Epic, adventurous, magical farewell moment
- Warm golden lights from sleigh against cool night sky
- Cozy, yet adventurous feeling
- Christmas magic in full force
- "See you soon!" energy

EMOTION:
- Epic conclusion to the adventure
- "BYE SANTA!" excitement
- Wonder and magic
- Anticipation for Christmas morning
- Grateful, happy, magical

TECHNICAL REQUIREMENTS:
- Aspect ratio: 16:9
- Cinematic, cinematic quality
- Night sky color palette with golden warm lights
- Particle effects and light trails
- Epic scope and scale
- Fantasy/magical VFX style

This is the epic finale of a premium $59+ personalized Santa video.`

    const keyframeRequest: KeyframeRequest = {
      prompt: keyframePrompt,
      sceneNumber: 8,
    }

    const keyframeResult = await generateKeyframe(keyframeRequest)

    // Step 2: Animate keyframe with Veo (max 8 seconds)
    const videoPrompt = `Epic cinematic animation: Santa's golden sleigh launches into the starry Christmas night sky.
Magical reindeer in powerful flight. Golden light trail behind the sleigh.
${childData.childName}'s name appears glowing in the stars.
Stars, planets, and magical aurora. Shooting stars and celestial effects.
Warm golden light contrasts with cool night sky. Premium cinematic quality.`

    const videoRequest: VideoGenerationRequest = {
      prompt: videoPrompt,
      imageBase64: keyframeResult.imageBase64,
      imageMimeType: keyframeResult.mimeType,
      durationSeconds: 8,
      aspectRatio: '16:9',
    }

    const operationName = await startVideoGeneration(videoRequest)

    console.log(`[Scene8] Successfully started video generation for ${childData.childName}`)

    return operationName
  } catch (error) {
    console.error(`[Scene8] Failed to generate Scene 8 for ${childData.childName}:`, error)
    throw error
  }
}

/**
 * Scene 6 result type for the orchestration pipeline
 */
export interface Scene6Result {
  type: 'heygen' | 'veo'
  value: string // HeyGen video URL or Veo operation name
  duration: number
}

/**
 * Generate all personalized scenes for a single child
 * Used in the main orchestration pipeline
 *
 * Scene 5 & 8: NanoBanana + Veo (returns operation name, needs polling)
 * Scene 6: HeyGen (returns video URL) or Veo (returns operation name)
 */
export async function generateAllPersonalizedScenesForChild(
  childData: SceneGenerationRequest
): Promise<{
  scene4: string // Veo operation name (set by photo-alive-generation.ts)
  scene5: string // Veo operation name
  scene6: Scene6Result // HeyGen video URL or Veo operation name
  scene8: string // Veo operation name
}> {
  console.log(`[Orchestration] Generating all personalized scenes for ${childData.childName}`)

  try {
    // Generate scenes in parallel for speed
    // Scene 6 may take longer if using HeyGen (30-120 sec render time)
    const [scene5Op, scene6Result, scene8Op] = await Promise.all([
      generateScene5NameReveal(childData),
      generateScene6SantasMessage(childData),
      generateScene8EpicLaunch(childData),
    ])

    // Note: Scene 4 should be generated separately using photo-alive-generation.ts
    // as it requires the child's photo as a reference image

    console.log(`[Orchestration] Successfully generated personalized scenes for ${childData.childName}`)
    console.log(`[Orchestration] Scene 6 type: ${scene6Result.type}, duration: ${scene6Result.duration}s`)

    return {
      scene4: '', // Will be set by photo-alive-generation.ts
      scene5: scene5Op,
      scene6: scene6Result,
      scene8: scene8Op,
    }
  } catch (error) {
    console.error(
      `[Orchestration] Failed to generate personalized scenes for ${childData.childName}:`,
      error
    )
    throw error
  }
}
