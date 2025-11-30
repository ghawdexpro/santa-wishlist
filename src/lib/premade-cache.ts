/**
 * Pre-Made Scene Caching System
 * Generates scenes 1, 2, 3, 7 once and reuses forever across all orders
 */

import { createClient } from '@/lib/supabase/server'
import { startVideoGeneration, waitForVideoGeneration } from './veo'
import { getPremadeScene } from './premade-scenes'

export interface CachedScene {
  sceneNumber: 1 | 2 | 3 | 7
  videoUrl: string
  generatedAt: string
}

/**
 * Get or generate a pre-made scene
 * Checks cache first, generates if needed
 */
export async function getPremadeSceneVideo(sceneNumber: 1 | 2 | 3 | 7): Promise<string> {
  console.log(`[PremadeCache] Fetching Scene ${sceneNumber}...`)

  try {
    const supabase = await createClient()

    // 1. Check if already cached in database
    const { data: cached, error: cacheError } = await supabase
      .from('premade_scenes')
      .select('video_url')
      .eq('scene_number', sceneNumber)
      .maybeSingle()

    if (cached?.video_url) {
      console.log(`[PremadeCache] Scene ${sceneNumber} found in cache`)
      return cached.video_url
    }

    // 2. Not in cache, generate new
    console.log(`[PremadeCache] Scene ${sceneNumber} not in cache, generating...`)

    const sceneConfig = getPremadeScene(sceneNumber)

    if (!sceneConfig) {
      throw new Error(`Scene ${sceneNumber} configuration not found`)
    }

    // Start Veo video generation
    const operationName = await startVideoGeneration({
      prompt: sceneConfig.videoPrompt,
      durationSeconds: sceneConfig.durationSeconds,
      aspectRatio: '16:9',
    })

    console.log(`[PremadeCache] Scene ${sceneNumber} generation started: ${operationName}`)

    // Wait for completion
    const result = await waitForVideoGeneration(operationName)

    if (!result.videoUrl) {
      throw new Error(`Scene ${sceneNumber} video generation failed`)
    }

    // 3. Cache in database
    const { error: insertError } = await supabase.from('premade_scenes').upsert(
      {
        scene_number: sceneNumber,
        name: sceneConfig.name,
        description: sceneConfig.description,
        duration_seconds: sceneConfig.durationSeconds,
        video_url: result.videoUrl,
        prompt_used: sceneConfig.videoPrompt,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'scene_number' }
    )

    if (insertError) {
      console.error(`[PremadeCache] Failed to cache Scene ${sceneNumber}:`, insertError)
      // Still return the video URL even if caching fails
    } else {
      console.log(`[PremadeCache] Scene ${sceneNumber} cached successfully`)
    }

    return result.videoUrl
  } catch (error) {
    console.error(`[PremadeCache] Failed to get Scene ${sceneNumber}:`, error)
    throw error
  }
}

/**
 * Get all pre-made scenes in parallel
 * Efficient for orchestration pipeline
 */
export async function getAllPremadeScenes(): Promise<Map<number, string>> {
  console.log(`[PremadeCache] Loading all pre-made scenes...`)

  try {
    const results = await Promise.all([
      getPremadeSceneVideo(1), // Sky Dive
      getPremadeSceneVideo(2), // Workshop
      getPremadeSceneVideo(3), // Book Magic
      getPremadeSceneVideo(7), // Sleigh Ready
    ])

    const sceneMap = new Map<number, string>([
      [1, results[0]],
      [2, results[1]],
      [3, results[2]],
      [7, results[3]],
    ])

    console.log(`[PremadeCache] All pre-made scenes loaded successfully`)

    return sceneMap
  } catch (error) {
    console.error(`[PremadeCache] Failed to load all pre-made scenes:`, error)
    throw error
  }
}
