/**
 * Scene Generators for Scenes 5, 6, and 8
 * Personalized scene generation for each child
 * All scenes use NanoBanana (keyframes) + Veo (video generation)
 */

import { generateKeyframe, KeyframeRequest } from './nanobanana'
import { startVideoGeneration, VideoGenerationRequest } from './veo'

export interface SceneGenerationRequest {
  childName: string
  childAge: number
  goodBehavior: string
  thingToImprove: string
  thingToLearn: string
  personalizedScript?: string // From Gemini for Scene 6
}

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
 * Generate keyframe with Santa and personalized message, then animate with Veo
 * (Temporarily using Veo instead of HeyGen)
 */
export async function generateScene6SantasMessage(childData: SceneGenerationRequest): Promise<string> {
  console.log(`[Scene6] Generating Santa's Message for ${childData.childName}`)

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

EMOTION:
- Pure love and warmth from Santa
- "You are special" feeling
- Personal connection
- Christmas magic at its most heartfelt

TECHNICAL REQUIREMENTS:
- Aspect ratio: 16:9
- Cinematic quality, soft focus background
- Warm golden color palette
- Santa should be the clear focus
- Premium, professional quality

This is the emotional heart of a $59+ personalized Santa video for ${childData.childName}.`

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

    console.log(`[Scene6] Successfully started video generation for ${childData.childName}`)

    return operationName
  } catch (error) {
    console.error(`[Scene6] Failed to generate Scene 6 for ${childData.childName}:`, error)
    throw error
  }
}

// Note: buildScene6Script removed - no longer needed since HeyGen is disabled
// Scene 6 now uses visual generation (NanoBanana + Veo) instead of talking head

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
 * Generate all personalized scenes for a single child
 * Used in the main orchestration pipeline
 * All scenes now use NanoBanana + Veo (HeyGen disabled temporarily)
 */
export async function generateAllPersonalizedScenesForChild(
  childData: SceneGenerationRequest
): Promise<{
  scene4: string // Veo operation name
  scene5: string // Veo operation name
  scene6: string // Veo operation name (was HeyGen URL)
  scene8: string // Veo operation name
}> {
  console.log(`[Orchestration] Generating all personalized scenes for ${childData.childName}`)

  try {
    // Generate all scenes in parallel for speed
    // All scenes now return Veo operation names
    const [scene5Op, scene6Op, scene8Op] = await Promise.all([
      generateScene5NameReveal(childData),
      generateScene6SantasMessage(childData),
      generateScene8EpicLaunch(childData),
    ])

    // Note: Scene 4 should be generated separately using photo-alive-generation.ts
    // as it requires the child's photo as a reference image

    console.log(`[Orchestration] Successfully started all personalized scene generations for ${childData.childName}`)

    return {
      scene4: '', // Will be set by photo-alive-generation.ts
      scene5: scene5Op,
      scene6: scene6Op, // Now Veo operation name, not HeyGen URL
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
