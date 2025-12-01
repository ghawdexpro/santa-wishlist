/**
 * Video Stitcher for Multi-Child Orders
 * Handles scene ordering and FFmpeg concatenation
 *
 * Scene durations:
 * - Pre-made (Veo): 8 seconds each
 * - Personalized (Veo): 8 seconds each
 * - Scene 6 (HeyGen): 30-60 seconds (variable, talking avatar)
 */

import { stitchFinalVideo } from './ffmpeg'
import { Child } from '@/types/database'
import { Scene6Result } from './scene-generators'

export interface PersonalizedSceneVideos {
  scene4: string // Veo video URL
  scene5: string // Veo video URL
  scene6: Scene6Result // HeyGen video URL (with duration) or Veo fallback
  scene8: string // Veo video URL
}

export interface VideoSegment {
  url: string
  duration?: number
  type: 'premade' | 'personalized'
  sceneNumber: number
  childId?: string
  childName?: string
}

/**
 * Generate stitch order for multi-child videos
 * Interleaves personalized scenes by type
 *
 * Order:
 * [1: Sky Dive] [2: Workshop] [3: Book Magic]
 * [4A, 4B, 4C: Photos Alive]
 * [5A, 5B, 5C: Name Reveals]
 * [6A, 6B, 6C: Messages]
 * [7: Sleigh Ready]
 * [8A, 8B, 8C: Epic Launches]
 */
export function generateStitchOrder(
  premadeScenes: Map<number, string>,
  childSceneVideos: Map<string, PersonalizedSceneVideos>,
  children: Child[]
): VideoSegment[] {
  console.log(`[VideoStitcher] Generating stitch order for ${children.length} child(ren)`)

  const order: VideoSegment[] = []

  // Pre-made intro scenes
  order.push({
    url: premadeScenes.get(1)!,
    type: 'premade',
    sceneNumber: 1,
  })

  order.push({
    url: premadeScenes.get(2)!,
    type: 'premade',
    sceneNumber: 2,
  })

  order.push({
    url: premadeScenes.get(3)!,
    type: 'premade',
    sceneNumber: 3,
  })

  // Scene 4: Photo Comes Alive (all children)
  for (const child of children) {
    const videos = childSceneVideos.get(child.id)
    if (videos?.scene4) {
      order.push({
        url: videos.scene4,
        type: 'personalized',
        sceneNumber: 4,
        childId: child.id,
        childName: child.name,
      })
    }
  }

  // Scene 5: Name Reveal (all children)
  for (const child of children) {
    const videos = childSceneVideos.get(child.id)
    if (videos?.scene5) {
      order.push({
        url: videos.scene5,
        type: 'personalized',
        sceneNumber: 5,
        childId: child.id,
        childName: child.name,
      })
    }
  }

  // Scene 6: Santa's Message (all children)
  // Scene 6 uses HeyGen talking avatar (30-60s) or Veo fallback (8s)
  for (const child of children) {
    const videos = childSceneVideos.get(child.id)
    if (videos?.scene6) {
      order.push({
        url: videos.scene6.value,
        duration: videos.scene6.duration,
        type: 'personalized',
        sceneNumber: 6,
        childId: child.id,
        childName: child.name,
      })
    }
  }

  // Pre-made transition
  order.push({
    url: premadeScenes.get(7)!,
    type: 'premade',
    sceneNumber: 7,
  })

  // Scene 8: Epic Launch (all children)
  for (const child of children) {
    const videos = childSceneVideos.get(child.id)
    if (videos?.scene8) {
      order.push({
        url: videos.scene8,
        type: 'personalized',
        sceneNumber: 8,
        childId: child.id,
        childName: child.name,
      })
    }
  }

  console.log(`[VideoStitcher] Stitch order generated: ${order.length} segments`)

  return order
}

/**
 * Convert segments to FFmpeg format and stitch
 */
export async function stitchVideoSegments(
  segments: VideoSegment[],
  outputPath: string
): Promise<void> {
  console.log(`[VideoStitcher] Stitching ${segments.length} segments to ${outputPath}`)

  try {
    // Convert to FFmpeg segment format
    const ffmpegSegments = segments.map((seg, idx) => ({
      url: seg.url,
      type: 'heygen' as const, // All are video files, FFmpeg doesn't care about type
      order: idx + 1,
    }))

    // Use existing FFmpeg stitching function
    await stitchFinalVideo(ffmpegSegments, outputPath)

    console.log(`[VideoStitcher] Successfully stitched video to ${outputPath}`)
  } catch (error) {
    console.error(`[VideoStitcher] Failed to stitch video:`, error)
    throw error
  }
}

/**
 * Calculate total video duration from segments
 *
 * @param children - Number of children
 * @param useHeyGen - Whether Scene 6 uses HeyGen (true) or Veo (false)
 */
export function calculateTotalDuration(children: number, useHeyGen: boolean = true): number {
  // Pre-made scenes (Veo): 1(8) + 2(8) + 3(8) + 7(8) = 32 seconds
  const premadeDuration = 32

  // Personalized per child with HeyGen Scene 6:
  // 4(8) + 5(8) + 6(45 avg) + 8(8) = 69 seconds per child
  const personalizedWithHeyGen = 69

  // Personalized per child with Veo Scene 6 (fallback):
  // 4(8) + 5(8) + 6(8) + 8(8) = 32 seconds per child
  const personalizedWithVeo = 32

  const personalizedPerChild = useHeyGen ? personalizedWithHeyGen : personalizedWithVeo
  const totalDuration = premadeDuration + personalizedPerChild * children

  return totalDuration
}

/**
 * Calculate actual total duration from segments with known durations
 */
export function calculateActualDuration(segments: VideoSegment[]): number {
  let total = 0

  for (const segment of segments) {
    if (segment.duration) {
      total += segment.duration
    } else {
      // Default to 8 seconds for Veo scenes
      total += 8
    }
  }

  return total
}

/**
 * Estimate video generation time based on children count
 *
 * @param children - Number of children
 * @param useHeyGen - Whether Scene 6 uses HeyGen (adds ~90s per child)
 */
export function estimateGenerationTime(children: number, useHeyGen: boolean = true): number {
  // Rough estimates in seconds:
  // - Script generation: 15s
  // - Pre-made scenes (parallel): 30s (max of any single scene)
  // - Personalized Veo scenes per child: ~60s (can be somewhat parallel)
  // - HeyGen Scene 6 per child: ~90s (sequential, render time)
  // - Stitching: 30s
  // - Upload: 30s

  const scriptTime = 15
  const premadeTime = 30
  const veoPersonalizedTime = 60 * Math.min(children, 2) // Parallelize up to 2
  const heyGenTime = useHeyGen ? 90 * children : 0 // HeyGen renders are sequential
  const stitchTime = 30
  const uploadTime = 30

  return scriptTime + premadeTime + veoPersonalizedTime + heyGenTime + stitchTime + uploadTime
}
