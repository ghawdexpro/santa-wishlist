/**
 * Extension Chain Orchestrator for BLOK A/B/C Architecture
 *
 * Uses Veo 3.1 video extension to create continuous video chains
 * with only 2 cuts instead of 7 scene transitions.
 *
 * BLOK A (Pre-made): Scenes 1-3 as continuous ~30s video
 * BLOK B (Per Child): Scenes 4-6 as continuous ~45s video
 * BLOK C (Finale): Scenes 7-8 as continuous ~20s video
 */

import {
  startVideoGeneration,
  waitForVideoGeneration,
  startVideoExtension,
  waitForVideoExtension,
  VideoGenerationRequest,
} from './veo'
import { generateKeyframe, KeyframeRequest } from './nanobanana'

// ============================================================================
// Types
// ============================================================================

export interface ChildData {
  name: string
  age: number
  photoUrl?: string
  photoBase64?: string
  photoMimeType?: 'image/jpeg' | 'image/png' | 'image/webp'
  goodBehavior: string
  thingToImprove: string
  thingToLearn: string
  customMessage?: string
}

export interface BlokAResult {
  videoUrl: string
  duration: number // ~30 seconds
}

export interface BlokBResult {
  childName: string
  videoUrl: string
  duration: number // ~45 seconds
}

export interface BlokCResult {
  videoUrl: string
  duration: number // ~20 seconds
}

export interface FullVideoResult {
  blokA: BlokAResult
  blokBs: BlokBResult[] // One per child
  blokC: BlokCResult
  totalDuration: number
}

// ============================================================================
// GCS Upload Helper (placeholder - implement with actual GCS client)
// ============================================================================

async function uploadToGcs(videoBuffer: Buffer, fileName: string): Promise<string> {
  // TODO: Implement actual GCS upload
  // For now, this is a placeholder that would need to be implemented
  // with @google-cloud/storage or similar
  console.log(`[GCS] Would upload ${fileName} (${videoBuffer.length} bytes)`)
  return `gs://santa-experience-videos/${fileName}`
}

// ============================================================================
// BLOK A: Pre-made Intro (Scenes 1-3)
// ============================================================================

const BLOK_A_PROMPTS = {
  scene1: `SCENE 1: MAGICAL SKY DIVE
Santa bursts through magical clouds on his flying sleigh.
Aurora borealis dances in the sky. Stars twinkle.
Reindeer lead the way through cotton-candy clouds.
Warm golden light from the sleigh contrasts with cool blue sky.
Cinematic, magical, wonder. 8 seconds.`,

  scene1to2: `Transition: The sleigh descends toward a glowing light below.
Through the clouds, we glimpse the warm glow of the North Pole.
Santa's workshop emerges from the snow below.
Magical particles swirl as we approach. 8 seconds.`,

  scene2: `SCENE 2: WORKSHOP BUSTLE
Inside Santa's magical workshop. Cozy, warm, festive.
Elves busy at workbenches. Toys coming to life.
Warm firelight mixes with magical sparkles.
Santa walks through, greeting elves. 8 seconds.`,

  scene2to3: `Transition: Santa picks up a large, ornate book.
He carries it to his favorite chair by the fire.
The book glows with golden light.
We zoom in on the book as it opens. 8 seconds.`,

  scene3: `SCENE 3: THE MAGIC BOOK
Close-up of Santa's hands opening the Magic Book.
Pages glow with warm golden light.
Magical dust rises from the ancient pages.
Names and photos appear, floating in magical light. 8 seconds.`,
}

/**
 * Generate BLOK A (Scenes 1-3) as a continuous video using extensions
 */
export async function generateBlokA(): Promise<BlokAResult> {
  console.log('[BLOK A] Starting pre-made intro generation...')

  // Generate keyframe for Scene 1
  const scene1Keyframe = await generateKeyframe({
    prompt: BLOK_A_PROMPTS.scene1,
    sceneNumber: 1,
  })

  // Start Scene 1 video
  const scene1Op = await startVideoGeneration({
    prompt: BLOK_A_PROMPTS.scene1,
    imageBase64: scene1Keyframe.imageBase64,
    imageMimeType: scene1Keyframe.mimeType,
    durationSeconds: 8,
    aspectRatio: '16:9',
  })

  const scene1Result = await waitForVideoGeneration(scene1Op)
  if (scene1Result.error || !scene1Result.videoBase64) {
    throw new Error(`BLOK A Scene 1 failed: ${scene1Result.error}`)
  }

  // Upload to GCS for extension
  const scene1GcsUri = await uploadToGcs(
    Buffer.from(scene1Result.videoBase64, 'base64'),
    `blok-a-scene1-${Date.now()}.mp4`
  )

  // Extend with transition 1→2
  const trans1Op = await startVideoExtension({
    prompt: BLOK_A_PROMPTS.scene1to2,
    sourceVideoGcsUri: scene1GcsUri,
    durationSeconds: 8,
  })

  const trans1Result = await waitForVideoExtension(trans1Op)
  if (trans1Result.error || !trans1Result.videoBase64) {
    throw new Error(`BLOK A transition 1→2 failed: ${trans1Result.error}`)
  }

  const trans1GcsUri = await uploadToGcs(
    Buffer.from(trans1Result.videoBase64, 'base64'),
    `blok-a-trans1-${Date.now()}.mp4`
  )

  // Extend with Scene 2
  const scene2Op = await startVideoExtension({
    prompt: BLOK_A_PROMPTS.scene2,
    sourceVideoGcsUri: trans1GcsUri,
    durationSeconds: 8,
  })

  const scene2Result = await waitForVideoExtension(scene2Op)
  if (scene2Result.error || !scene2Result.videoBase64) {
    throw new Error(`BLOK A Scene 2 failed: ${scene2Result.error}`)
  }

  const scene2GcsUri = await uploadToGcs(
    Buffer.from(scene2Result.videoBase64, 'base64'),
    `blok-a-scene2-${Date.now()}.mp4`
  )

  // Extend with transition 2→3
  const trans2Op = await startVideoExtension({
    prompt: BLOK_A_PROMPTS.scene2to3,
    sourceVideoGcsUri: scene2GcsUri,
    durationSeconds: 8,
  })

  const trans2Result = await waitForVideoExtension(trans2Op)
  if (trans2Result.error || !trans2Result.videoBase64) {
    throw new Error(`BLOK A transition 2→3 failed: ${trans2Result.error}`)
  }

  const trans2GcsUri = await uploadToGcs(
    Buffer.from(trans2Result.videoBase64, 'base64'),
    `blok-a-trans2-${Date.now()}.mp4`
  )

  // Extend with Scene 3
  const scene3Op = await startVideoExtension({
    prompt: BLOK_A_PROMPTS.scene3,
    sourceVideoGcsUri: trans2GcsUri,
    durationSeconds: 8,
  })

  const scene3Result = await waitForVideoExtension(scene3Op)
  if (scene3Result.error) {
    throw new Error(`BLOK A Scene 3 failed: ${scene3Result.error}`)
  }

  console.log('[BLOK A] Complete!')

  return {
    videoUrl: scene3Result.videoUrl || trans2GcsUri,
    duration: 40, // 5 segments × 8 seconds
  }
}

// ============================================================================
// BLOK B: Personalized Scenes (4-6) per Child
// ============================================================================

function buildBlokBPrompts(child: ChildData) {
  return {
    scene4: `SCENE 4: PHOTO COMES ALIVE - ${child.name}
The Magic Book glows brighter. A golden frame appears on the page.
Inside the frame, ${child.name}'s photo appears, surrounded by sparkles.
The photo seems to come alive with magical light.
Santa smiles warmly, recognizing ${child.name}. 8 seconds.`,

    scene4to5: `Transition: Magical golden letters begin forming in the air.
Sparkles swirl around as the letters take shape.
The letters spell out "${child.name.toUpperCase()}".
Pure wonder and magic. 8 seconds.`,

    scene5: `SCENE 5: NAME REVEAL - ${child.name}
"${child.name.toUpperCase()}" floats in massive golden 3D letters.
The letters slowly rotate, glowing with warm light.
Magical sparkles surround each letter.
Santa watches with pride and joy. 8 seconds.`,

    scene5to6: `Transition: The letters gently fade.
Santa leans forward, looking directly at the camera.
His expression becomes warm and personal.
He prepares to speak directly to ${child.name}. 8 seconds.`,

    scene6: `SCENE 6: SANTA'S MESSAGE TO ${child.name}
Santa speaks directly to camera with warm grandfatherly love.
"${child.name}, I'm so proud of you for ${child.goodBehavior}!"
His eyes twinkle as he talks about ${child.thingToLearn}.
Magical sparkles punctuate his words. 8 seconds.`,

    scene6b: `Santa continues his message to ${child.name}.
"Remember to work on ${child.thingToImprove}."
His expression shows gentle encouragement and love.
Warm firelight flickers on his face. 8 seconds.`,

    scene6c: `Santa's final words to ${child.name}.
"Jesteś na mojej liście grzecznych dzieci! Coś wspaniałego na ciebie czeka."
Pure joy and excitement in his expression.
Magical golden glow surrounds him. Wesołych Świąt! 8 seconds.`,
  }
}

/**
 * Generate BLOK B (Scenes 4-6) for a single child
 */
export async function generateBlokBForChild(child: ChildData): Promise<BlokBResult> {
  console.log(`[BLOK B] Starting personalized scenes for ${child.name}...`)

  const prompts = buildBlokBPrompts(child)

  // Generate keyframe for Scene 4 (with child's photo if available)
  const keyframeRequest: KeyframeRequest = {
    prompt: prompts.scene4,
    sceneNumber: 4,
  }

  if (child.photoBase64 && child.photoMimeType) {
    keyframeRequest.referenceImage = {
      base64: child.photoBase64,
      mimeType: child.photoMimeType,
    }
  }

  const scene4Keyframe = await generateKeyframe(keyframeRequest)

  // Start Scene 4 video
  const scene4Op = await startVideoGeneration({
    prompt: prompts.scene4,
    imageBase64: scene4Keyframe.imageBase64,
    imageMimeType: scene4Keyframe.mimeType,
    durationSeconds: 8,
    aspectRatio: '16:9',
  })

  const scene4Result = await waitForVideoGeneration(scene4Op)
  if (scene4Result.error || !scene4Result.videoBase64) {
    throw new Error(`BLOK B Scene 4 failed for ${child.name}: ${scene4Result.error}`)
  }

  // Upload and extend through all segments
  let currentGcsUri = await uploadToGcs(
    Buffer.from(scene4Result.videoBase64, 'base64'),
    `blok-b-${child.name}-scene4-${Date.now()}.mp4`
  )

  const extensionPrompts = [
    prompts.scene4to5,
    prompts.scene5,
    prompts.scene5to6,
    prompts.scene6,
    prompts.scene6b,
    prompts.scene6c,
  ]

  for (let i = 0; i < extensionPrompts.length; i++) {
    const prompt = extensionPrompts[i]
    console.log(`[BLOK B] ${child.name} extension ${i + 1}/${extensionPrompts.length}`)

    const extOp = await startVideoExtension({
      prompt,
      sourceVideoGcsUri: currentGcsUri,
      durationSeconds: 8,
    })

    const extResult = await waitForVideoExtension(extOp)
    if (extResult.error || !extResult.videoBase64) {
      throw new Error(`BLOK B extension ${i + 1} failed for ${child.name}: ${extResult.error}`)
    }

    currentGcsUri = await uploadToGcs(
      Buffer.from(extResult.videoBase64, 'base64'),
      `blok-b-${child.name}-ext${i + 1}-${Date.now()}.mp4`
    )
  }

  console.log(`[BLOK B] Complete for ${child.name}!`)

  return {
    childName: child.name,
    videoUrl: currentGcsUri,
    duration: 56, // 7 segments × 8 seconds
  }
}

// ============================================================================
// BLOK C: Finale (Scenes 7-8)
// ============================================================================

const BLOK_C_PROMPTS = {
  scene7: `SCENE 7: SLEIGH READY
Outside Santa's workshop. Night sky, stars twinkling.
The sleigh is loaded with presents, reindeer harnessed.
Elves wave goodbye. Snow falls gently.
Santa climbs aboard, ready for his journey. 8 seconds.`,

  scene7to8: `Transition: The reindeer begin to prance.
Magical energy builds around the sleigh.
Golden light surrounds the runners.
Santa calls out to his reindeer! 8 seconds.`,

  scene8: `SCENE 8: EPIC LAUNCH
The sleigh launches into the starry night sky!
Magical golden trail streams behind.
Reindeer in powerful flight, silhouetted against the moon.
Stars spell out "WESOŁYCH ŚWIĄT!" Epic finale! 8 seconds.`,
}

/**
 * Generate BLOK C (Scenes 7-8) as finale
 */
export async function generateBlokC(): Promise<BlokCResult> {
  console.log('[BLOK C] Starting finale generation...')

  // Generate keyframe for Scene 7
  const scene7Keyframe = await generateKeyframe({
    prompt: BLOK_C_PROMPTS.scene7,
    sceneNumber: 7,
  })

  // Start Scene 7 video
  const scene7Op = await startVideoGeneration({
    prompt: BLOK_C_PROMPTS.scene7,
    imageBase64: scene7Keyframe.imageBase64,
    imageMimeType: scene7Keyframe.mimeType,
    durationSeconds: 8,
    aspectRatio: '16:9',
  })

  const scene7Result = await waitForVideoGeneration(scene7Op)
  if (scene7Result.error || !scene7Result.videoBase64) {
    throw new Error(`BLOK C Scene 7 failed: ${scene7Result.error}`)
  }

  const scene7GcsUri = await uploadToGcs(
    Buffer.from(scene7Result.videoBase64, 'base64'),
    `blok-c-scene7-${Date.now()}.mp4`
  )

  // Extend with transition
  const transOp = await startVideoExtension({
    prompt: BLOK_C_PROMPTS.scene7to8,
    sourceVideoGcsUri: scene7GcsUri,
    durationSeconds: 8,
  })

  const transResult = await waitForVideoExtension(transOp)
  if (transResult.error || !transResult.videoBase64) {
    throw new Error(`BLOK C transition failed: ${transResult.error}`)
  }

  const transGcsUri = await uploadToGcs(
    Buffer.from(transResult.videoBase64, 'base64'),
    `blok-c-trans-${Date.now()}.mp4`
  )

  // Extend with Scene 8
  const scene8Op = await startVideoExtension({
    prompt: BLOK_C_PROMPTS.scene8,
    sourceVideoGcsUri: transGcsUri,
    durationSeconds: 8,
  })

  const scene8Result = await waitForVideoExtension(scene8Op)
  if (scene8Result.error) {
    throw new Error(`BLOK C Scene 8 failed: ${scene8Result.error}`)
  }

  console.log('[BLOK C] Complete!')

  return {
    videoUrl: scene8Result.videoUrl || transGcsUri,
    duration: 24, // 3 segments × 8 seconds
  }
}

// ============================================================================
// Master Orchestrator
// ============================================================================

/**
 * Generate full video using BLOK A/B/C architecture
 * Only 2 cuts in the final video (between A-B and B-C)
 */
export async function generateFullVideoWithExtensionChains(
  children: ChildData[]
): Promise<FullVideoResult> {
  console.log(`[Orchestrator] Starting BLOK generation for ${children.length} child(ren)`)

  // Generate BLOK A (can be cached for all orders)
  const blokA = await generateBlokA()

  // Generate BLOK B for each child
  const blokBs: BlokBResult[] = []
  for (const child of children) {
    const blokB = await generateBlokBForChild(child)
    blokBs.push(blokB)
  }

  // Generate BLOK C (can be cached for all orders)
  const blokC = await generateBlokC()

  // Calculate total duration
  const totalDuration =
    blokA.duration +
    blokBs.reduce((sum, b) => sum + b.duration, 0) +
    blokC.duration

  console.log(`[Orchestrator] Complete! Total duration: ${totalDuration}s`)

  return {
    blokA,
    blokBs,
    blokC,
    totalDuration,
  }
}
