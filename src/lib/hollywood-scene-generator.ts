/**
 * Hollywood-Level Scene Generator
 *
 * Key improvements over previous version:
 * 1. DUAL KEYFRAMES (start + end) for controlled Veo animation
 * 2. CHILD PHOTO REFERENCE in scenes 4 and 6 (photo LARGE - 40-50% of frame)
 * 3. PHOTOREALISTIC PROMPTS (Hollywood VFX terminology)
 * 4. PROPER KEYFRAME WORKFLOW
 *
 * Photo reference scenes:
 * - Scene 4: Photo in magical book (photo is HERO - 50% of frame)
 * - Scene 6: Photo in Santa's hands (photo is HERO - 50% of frame)
 *
 * Non-photo scenes:
 * - Scene 5: Golden letters only (name is HERO - 70% of frame)
 * - Scene 8: Name in stars (no photo needed)
 */

import { generateKeyframe, KeyframeRequest } from './nanobanana'
import { startVideoGeneration, VideoGenerationRequest } from './veo'
import {
  getScenePrompts,
  sceneUsesPhotoReference,
  SceneNumber,
  KeyframePrompts,
} from './hollywood-prompts'

// =============================================================================
// TYPES
// =============================================================================

export interface ChildData {
  name: string
  age: number
  photoBase64: string
  photoMimeType: 'image/jpeg' | 'image/png' | 'image/webp'
  goodBehavior?: string
  thingToImprove?: string
  thingToLearn?: string
}

export interface KeyframeResult {
  sceneNumber: SceneNumber
  startKeyframeBase64: string
  startKeyframeMimeType: string
  endKeyframeBase64: string
  endKeyframeMimeType: string
}

export interface SceneGenerationResult {
  sceneNumber: SceneNumber
  operationName: string
  keyframes: KeyframeResult
}

// =============================================================================
// KEYFRAME GENERATION (NanoBanana)
// =============================================================================

/**
 * Generate START keyframe without photo reference
 * Used for pre-made scenes (1, 2, 3, 7) and scene 8
 */
async function generateStartKeyframeSimple(
  sceneNumber: SceneNumber,
  prompt: string
): Promise<{ base64: string; mimeType: string }> {
  console.log(`[Hollywood] Generating START keyframe for scene ${sceneNumber}`)

  const request: KeyframeRequest = {
    prompt,
    sceneNumber,
  }

  const result = await generateKeyframe(request)
  return {
    base64: result.imageBase64,
    mimeType: result.mimeType,
  }
}

/**
 * Generate END keyframe without photo reference
 */
async function generateEndKeyframeSimple(
  sceneNumber: SceneNumber,
  prompt: string
): Promise<{ base64: string; mimeType: string }> {
  console.log(`[Hollywood] Generating END keyframe for scene ${sceneNumber}`)

  const request: KeyframeRequest = {
    prompt,
    sceneNumber,
  }

  const result = await generateKeyframe(request)
  return {
    base64: result.imageBase64,
    mimeType: result.mimeType,
  }
}

/**
 * Generate keyframe WITH photo reference
 * Used for personalized scenes (4, 5, 6) where child's photo appears
 */
async function generateKeyframeWithPhoto(
  sceneNumber: SceneNumber,
  prompt: string,
  photoBase64: string,
  photoMimeType: 'image/jpeg' | 'image/png' | 'image/webp'
): Promise<{ base64: string; mimeType: string }> {
  console.log(`[Hollywood] Generating keyframe WITH PHOTO for scene ${sceneNumber}`)

  const request: KeyframeRequest = {
    prompt,
    sceneNumber,
    referenceImage: {
      base64: photoBase64,
      mimeType: photoMimeType,
    },
  }

  const result = await generateKeyframe(request)
  return {
    base64: result.imageBase64,
    mimeType: result.mimeType,
  }
}

// =============================================================================
// DUAL KEYFRAME GENERATION
// =============================================================================

/**
 * Generate BOTH start and end keyframes for a scene
 * For scenes with photo reference (4, 5, 6), both keyframes include the photo
 */
export async function generateDualKeyframes(
  sceneNumber: SceneNumber,
  childData?: ChildData
): Promise<KeyframeResult> {
  const childName = childData?.name
  const prompts = getScenePrompts(sceneNumber, childName)
  const usesPhoto = sceneUsesPhotoReference(sceneNumber)

  console.log(`[Hollywood] Generating dual keyframes for scene ${sceneNumber}`)
  console.log(`[Hollywood] Uses photo reference: ${usesPhoto}`)

  let startKeyframe: { base64: string; mimeType: string }
  let endKeyframe: { base64: string; mimeType: string }

  if (usesPhoto && childData) {
    // Generate both keyframes WITH photo reference
    // Run in parallel for speed
    const [start, end] = await Promise.all([
      generateKeyframeWithPhoto(
        sceneNumber,
        prompts.startKeyframe,
        childData.photoBase64,
        childData.photoMimeType
      ),
      generateKeyframeWithPhoto(
        sceneNumber,
        prompts.endKeyframe,
        childData.photoBase64,
        childData.photoMimeType
      ),
    ])
    startKeyframe = start
    endKeyframe = end
  } else {
    // Generate both keyframes WITHOUT photo reference
    const [start, end] = await Promise.all([
      generateStartKeyframeSimple(sceneNumber, prompts.startKeyframe),
      generateEndKeyframeSimple(sceneNumber, prompts.endKeyframe),
    ])
    startKeyframe = start
    endKeyframe = end
  }

  console.log(`[Hollywood] Dual keyframes complete for scene ${sceneNumber}`)

  return {
    sceneNumber,
    startKeyframeBase64: startKeyframe.base64,
    startKeyframeMimeType: startKeyframe.mimeType,
    endKeyframeBase64: endKeyframe.base64,
    endKeyframeMimeType: endKeyframe.mimeType,
  }
}

// =============================================================================
// VIDEO GENERATION (Veo with dual keyframes)
// =============================================================================

/**
 * Generate video for a scene using DUAL KEYFRAMES
 * Veo will animate FROM start keyframe TO end keyframe
 */
export async function generateSceneVideoWithDualKeyframes(
  sceneNumber: SceneNumber,
  keyframes: KeyframeResult,
  videoPrompt: string
): Promise<string> {
  console.log(`[Hollywood] Starting Veo generation for scene ${sceneNumber}`)
  console.log(`[Hollywood] Using DUAL KEYFRAMES for controlled animation`)

  const request: VideoGenerationRequest = {
    prompt: videoPrompt,
    // START keyframe - where animation begins
    imageBase64: keyframes.startKeyframeBase64,
    imageMimeType: keyframes.startKeyframeMimeType,
    // END keyframe - where animation should end
    endImageBase64: keyframes.endKeyframeBase64,
    endImageMimeType: keyframes.endKeyframeMimeType,
    durationSeconds: 8,
    aspectRatio: '16:9',
    negativePrompt: 'cartoon, anime, low quality, blurry, distorted, glitch, text overlay, watermark',
  }

  const operationName = await startVideoGeneration(request)
  console.log(`[Hollywood] Veo operation started: ${operationName}`)

  return operationName
}

// =============================================================================
// FULL SCENE GENERATION PIPELINE
// =============================================================================

/**
 * Generate a complete scene:
 * 1. Generate dual keyframes (NanoBanana)
 * 2. Start video generation (Veo) with both keyframes
 * 3. Return operation name for polling
 */
export async function generateScene(
  sceneNumber: SceneNumber,
  childData?: ChildData
): Promise<SceneGenerationResult> {
  const childName = childData?.name
  const prompts = getScenePrompts(sceneNumber, childName)

  console.log(`[Hollywood] === GENERATING SCENE ${sceneNumber} ===`)

  // Step 1: Generate dual keyframes
  const keyframes = await generateDualKeyframes(sceneNumber, childData)

  // Step 2: Start Veo video generation with both keyframes
  const operationName = await generateSceneVideoWithDualKeyframes(
    sceneNumber,
    keyframes,
    prompts.videoPrompt
  )

  console.log(`[Hollywood] === SCENE ${sceneNumber} STARTED ===`)

  return {
    sceneNumber,
    operationName,
    keyframes,
  }
}

// =============================================================================
// PERSONALIZED SCENE GENERATION (Scenes 4, 5, 6, 8)
// =============================================================================

/**
 * Generate Scene 4: Photo Comes Alive
 * Child's photo appears in Santa's magical book
 */
export async function generateScene4PhotoComesAlive(
  childData: ChildData
): Promise<SceneGenerationResult> {
  return generateScene(4, childData)
}

/**
 * Generate Scene 5: Name Reveal
 * Child's name in golden letters, photo visible in background
 */
export async function generateScene5NameReveal(
  childData: ChildData
): Promise<SceneGenerationResult> {
  return generateScene(5, childData)
}

/**
 * Generate Scene 6: Santa's Message
 * Santa holds child's photo while speaking
 */
export async function generateScene6SantasMessage(
  childData: ChildData
): Promise<SceneGenerationResult> {
  return generateScene(6, childData)
}

/**
 * Generate Scene 8: Epic Launch
 * Child's name appears in stars (no photo reference needed for this one)
 */
export async function generateScene8EpicLaunch(
  childData: ChildData
): Promise<SceneGenerationResult> {
  // Scene 8 doesn't use photo reference - just the name in stars
  return generateScene(8, childData)
}

/**
 * Generate all personalized scenes for a child
 * Returns operation names for polling
 */
export async function generateAllPersonalizedScenes(
  childData: ChildData
): Promise<{
  scene4: SceneGenerationResult
  scene5: SceneGenerationResult
  scene6: SceneGenerationResult
  scene8: SceneGenerationResult
}> {
  console.log(`[Hollywood] Generating ALL personalized scenes for ${childData.name}`)

  // Generate scenes in parallel for speed
  const [scene4, scene5, scene6, scene8] = await Promise.all([
    generateScene4PhotoComesAlive(childData),
    generateScene5NameReveal(childData),
    generateScene6SantasMessage(childData),
    generateScene8EpicLaunch(childData),
  ])

  console.log(`[Hollywood] All personalized scenes started for ${childData.name}`)

  return { scene4, scene5, scene6, scene8 }
}

// =============================================================================
// PRE-MADE SCENE GENERATION (Scenes 1, 2, 3, 7)
// =============================================================================

/**
 * Generate all pre-made scenes
 * These don't require child data - same for all videos
 */
export async function generateAllPremadeScenes(): Promise<{
  scene1: SceneGenerationResult
  scene2: SceneGenerationResult
  scene3: SceneGenerationResult
  scene7: SceneGenerationResult
}> {
  console.log(`[Hollywood] Generating ALL pre-made scenes`)

  // Generate scenes in parallel
  const [scene1, scene2, scene3, scene7] = await Promise.all([
    generateScene(1),
    generateScene(2),
    generateScene(3),
    generateScene(7),
  ])

  console.log(`[Hollywood] All pre-made scenes started`)

  return { scene1, scene2, scene3, scene7 }
}

// =============================================================================
// UTILITY: Generate just keyframes (for admin preview)
// =============================================================================

/**
 * Generate only the keyframes for a scene (no video)
 * Useful for admin preview/approval before spending on video generation
 */
export async function generateKeyframesOnly(
  sceneNumber: SceneNumber,
  childData?: ChildData
): Promise<KeyframeResult> {
  return generateDualKeyframes(sceneNumber, childData)
}

/**
 * Generate keyframes for all 8 scenes
 * For admin storyboard preview
 */
export async function generateAllKeyframesForStoryboard(
  childData?: ChildData
): Promise<KeyframeResult[]> {
  console.log(`[Hollywood] Generating storyboard keyframes for all 8 scenes`)

  const scenes: SceneNumber[] = [1, 2, 3, 4, 5, 6, 7, 8]

  const results = await Promise.all(
    scenes.map((sceneNumber) => {
      // Scenes 4, 5, 6 need child data
      if ([4, 5, 6].includes(sceneNumber) && childData) {
        return generateDualKeyframes(sceneNumber as SceneNumber, childData)
      }
      // Scene 8 needs child name but not photo
      if (sceneNumber === 8 && childData) {
        return generateDualKeyframes(8, childData)
      }
      // Pre-made scenes (1, 2, 3, 7) don't need child data
      return generateDualKeyframes(sceneNumber as SceneNumber)
    })
  )

  console.log(`[Hollywood] Storyboard keyframes complete`)

  return results
}
