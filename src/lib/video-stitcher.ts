/**
 * Video Stitcher for Multi-Child Orders
 * Handles scene ordering and FFmpeg concatenation
 */

import { stitchFinalVideo } from './ffmpeg'
import { Child } from '@/types/database'

export interface PersonalizedSceneVideos {
  scene4: string // Veo operation name or video URL
  scene5: string // Veo operation name or video URL
  scene6: string // HeyGen video URL
  scene8: string // Veo operation name or video URL
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
  for (const child of children) {
    const videos = childSceneVideos.get(child.id)
    if (videos?.scene6) {
      order.push({
        url: videos.scene6,
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
 */
export function calculateTotalDuration(children: number): number {
  // Pre-made scenes: 1(12) + 2(12) + 3(10) + 7(10) = 44 seconds
  const premadeDuration = 44

  // Personalized per child: 4(12) + 5(10) + 6(25) + 8(10) = 57 seconds
  const personalizedPerChild = 57

  const totalDuration = premadeDuration + personalizedPerChild * children

  return totalDuration
}

/**
 * Estimate video generation time based on children count
 */
export function estimateGenerationTime(children: number): number {
  // Rough estimates in seconds:
  // - Script generation: 15s
  // - Pre-made scenes (parallel): 30s (max of any single scene)
  // - Personalized scenes per child: ~60s (can be somewhat parallel)
  // - Stitching: 20s
  // - Upload: 30s

  const scriptTime = 15
  const premadeTime = 30
  const personalizedTime = 60 * Math.min(children, 2) // Can parallelize 2 children
  const stitchTime = 20
  const uploadTime = 30

  return scriptTime + premadeTime + personalizedTime + stitchTime + uploadTime
}
