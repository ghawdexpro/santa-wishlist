/**
 * Scene Generators for Scenes 5, 6, and 8
 * Personalized scene generation for each child
 */

import { generateKeyframe, KeyframeRequest } from './nanobanana'
import { startVideoGeneration, VideoGenerationRequest } from './veo'
import { generateHeyGenVideo } from './heygen'

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

    // Step 2: Animate keyframe with Veo
    const videoPrompt = `Animate the golden 3D name "${childData.childName.toUpperCase()}"
floating in Santa's magical workshop. Letters slowly rotate and glow with warm golden light.
Magical sparkles surround the name. Santa watches with joy in the background.
Warm, cozy workshop lighting. Pure magic and wonder.
Premium cinematic quality, 10 seconds duration.`

    const videoRequest: VideoGenerationRequest = {
      prompt: videoPrompt,
      imageBase64: keyframeResult.imageBase64,
      imageMimeType: keyframeResult.mimeType,
      durationSeconds: 10,
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
 * Use HeyGen talking head with personalized script
 */
export async function generateScene6SantasMessage(childData: SceneGenerationRequest): Promise<string> {
  console.log(`[Scene6] Generating Santa's Message for ${childData.childName}`)

  try {
    // Build personalized script if not provided
    const script =
      childData.personalizedScript ||
      buildScene6Script(
        childData.childName,
        childData.childAge,
        childData.goodBehavior,
        childData.thingToImprove,
        childData.thingToLearn
      )

    // Use HeyGen to generate talking head video
    const videoUrl = await generateHeyGenVideo({
      script,
      durationSeconds: 25,
      characterId: 'santa', // Should match configured Santa character
    })

    console.log(`[Scene6] Successfully generated Santa's Message for ${childData.childName}`)

    return videoUrl
  } catch (error) {
    console.error(`[Scene6] Failed to generate Scene 6 for ${childData.childName}:`, error)
    throw error
  }
}

/**
 * Build default Scene 6 script if not provided by Gemini
 */
function buildScene6Script(
  childName: string,
  childAge: number,
  goodBehavior: string,
  thingToImprove: string,
  thingToLearn: string
): string {
  return `Hello ${childName}! I wanted to tell you how proud I am of you.
I've been watching, and I've noticed how ${goodBehavior}. That's wonderful!

I also wanted to mention, I'd love to see you work on ${thingToImprove}.
I know you can do it!

And ${childName}, this year I hope you'll learn about ${thingToLearn}.
It's something very special.

You're on my Nice List, and I have something very special waiting for you under the tree this Christmas.
Keep being amazing, ${childName}. Merry Christmas!`
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

    // Step 2: Animate keyframe with Veo
    const videoPrompt = `Epic cinematic animation: Santa's golden sleigh launches into the starry Christmas night sky.
Magical reindeer in powerful flight. Golden light trail behind the sleigh.
${childData.childName}'s name appears glowing in the stars.
Stars, planets, and magical aurora. Shooting stars and celestial effects.
Warm golden light contrasts with cool night sky.
Epic, adventurous, magical finale. 10 seconds duration. Premium cinematic quality.`

    const videoRequest: VideoGenerationRequest = {
      prompt: videoPrompt,
      imageBase64: keyframeResult.imageBase64,
      imageMimeType: keyframeResult.mimeType,
      durationSeconds: 10,
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
 */
export async function generateAllPersonalizedScenesForChild(
  childData: SceneGenerationRequest
): Promise<{
  scene4: string // Veo operation name
  scene5: string // Veo operation name
  scene6: string // HeyGen video URL
  scene8: string // Veo operation name
}> {
  console.log(`[Orchestration] Generating all personalized scenes for ${childData.childName}`)

  try {
    // Generate all scenes in parallel for speed
    const [scene5Op, scene6Url, scene8Op] = await Promise.all([
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
      scene6: scene6Url,
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
