/**
 * Master orchestration endpoint for full video generation
 * Triggered by Stripe webhook after successful payment
 * Handles 8-scene multi-child video generation:
 * Scenes 1,2,3,7: Pre-made (cached)
 * Scenes 4,5,8: Personalized per child - HOLLYWOOD QUALITY (dual keyframes)
 * Scene 6: HeyGen talking avatar (30-60s) OR Hollywood fallback
 */

import { generateMultiChildScript } from '@/lib/gemini'
import {
  generateScene4ForChildHollywood,
  generateScene5NameRevealHollywood,
  generateScene8EpicLaunchHollywood,
} from '@/lib/hollywood-scene-generator'
import {
  generateScene6SantasMessage,
  Scene6Result,
} from '@/lib/scene-generators'
import { getAllPremadeScenes } from '@/lib/premade-cache'
import {
  generateStitchOrder,
  stitchVideoSegments,
  PersonalizedSceneVideos,
} from '@/lib/video-stitcher'
import { waitForVideoGeneration } from '@/lib/veo'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import type { OrderWithChildren } from '@/types/database'

export const maxDuration = 900 // 15 minutes for multi-child processing

interface GenerationProgress {
  stage: 'loading' | 'script' | 'premade' | 'personalized' | 'polling' | 'stitching' | 'uploading'
  scenesComplete: number[]
  scenesInProgress: { [sceneNum: number]: { childId: string; operationName: string }[] }
  scenesFailed: { [sceneNum: number]: string[] }
}

export async function POST(request: NextRequest) {
  const { orderId } = await request.json() as { orderId: string }

  try {
    const supabase = await createClient()

    console.log(`[Orchestration] Starting 8-scene multi-child video generation for order: ${orderId}`)

    // 1. Fetch order with children
    const { data: orderData, error: fetchError } = await supabase
      .from('orders')
      .select('*, children(*)')
      .eq('id', orderId)
      .single()

    if (fetchError || !orderData) {
      throw new Error(`Order not found: ${orderId}`)
    }

    const order = orderData as OrderWithChildren
    const children = (order.children || []).sort((a, b) => a.sequence_number - b.sequence_number)

    console.log(
      `[Orchestration] Order loaded with ${children.length} child(ren): ${children.map(c => c.name).join(', ')}`
    )

    // Update status to generating
    const initialProgress: GenerationProgress = {
      stage: 'loading',
      scenesComplete: [],
      scenesInProgress: {},
      scenesFailed: {},
    }

    await supabase
      .from('orders')
      .update({
        status: 'generating',
        generation_progress: initialProgress,
      })
      .eq('id', orderId)

    // 2. Generate multi-child script
    console.log(`[Orchestration] Generating script for ${children.length} child(ren)...`)
    let script = order.generated_script

    if (!script) {
      script = await generateMultiChildScript({
        children: children.map(c => ({
          name: c.name,
          age: c.age ?? 7, // Default age if not provided
          goodBehavior: c.good_behavior ?? 'being kind and helpful',
          thingToImprove: c.thing_to_improve ?? 'listening more carefully',
          thingToLearn: c.thing_to_learn ?? 'new things',
        })),
        customMessage: order.custom_message ?? undefined,
      })

      await supabase.from('orders').update({ generated_script: script }).eq('id', orderId)

      console.log(`[Orchestration] Script generated for ${children.length} child(ren)`)
    }

    let progress = initialProgress
    progress.stage = 'premade'

    // 3. Load all pre-made scenes (1, 2, 3, 7)
    console.log(`[Orchestration] Loading pre-made scenes...`)
    const premadeScenes = await getAllPremadeScenes()
    console.log(
      `[Orchestration] Pre-made scenes loaded: ${Array.from(premadeScenes.keys()).join(', ')}`
    )

    progress.stage = 'personalized'
    progress.scenesComplete = [1, 2, 3, 7] // Mark pre-made as complete

    // 4. Generate all personalized scenes for each child (parallel by child)
    console.log(`[Orchestration] Generating personalized scenes for ${children.length} child(ren)...`)

    // Map to store final video URLs for stitching
    const childSceneVideos = new Map<string, PersonalizedSceneVideos>()

    // Map to store Veo operation names that need polling
    // Scene 6 may be HeyGen (already complete) or Veo (needs polling)
    const veoOperations = new Map<
      string,
      {
        scene4Op: string
        scene5Op: string
        scene6Op?: string // Only set if Scene 6 uses Veo fallback
        scene8Op: string
      }
    >()

    // Store Scene 6 results separately (may be HeyGen URL or Veo op)
    const scene6Results = new Map<string, Scene6Result>()

    // Generate Scene 4 (photo) + Scene 5 (name) + Scene 6 (message) + Scene 8 (launch) for each child
    const childGenerationPromises = children.map(async child => {
      console.log(`[Orchestration] Starting scene generation for ${child.name}...`)

      // Default values for nullable fields
      const childAge = child.age ?? 7
      const goodBehavior = child.good_behavior ?? 'being kind and helpful'
      const thingToImprove = child.thing_to_improve ?? 'listening more carefully'
      const thingToLearn = child.thing_to_learn ?? 'new things'
      const photoUrl = child.photo_url ?? ''

      try {
        // Scene 4: Photo Comes Alive - HOLLYWOOD dual-keyframe with photo reference
        const scene4Op = await generateScene4ForChildHollywood({
          name: child.name,
          photoUrl,
        })

        // Scene 5: Name Reveal - HOLLYWOOD dual-keyframe (golden letters, no photo)
        const scene5Op = await generateScene5NameRevealHollywood({
          childName: child.name,
          childAge,
          goodBehavior,
          thingToImprove,
          thingToLearn,
        })

        // Scene 6: Santa's Message (HeyGen talking avatar or Veo fallback)
        // HeyGen returns completed video URL, Veo returns operation name
        const scene6Result = await generateScene6SantasMessage({
          childName: child.name,
          childAge,
          goodBehavior,
          thingToImprove,
          thingToLearn,
          personalizedScript: script.personalized?.[child.name]
            ?.find(s => s.sceneNumber === 6)
            ?.santaDialogue,
        })

        // Store Scene 6 result separately
        scene6Results.set(child.id, scene6Result)

        console.log(
          `[Orchestration] Scene 6 for ${child.name}: type=${scene6Result.type}, duration=${scene6Result.duration}s`
        )

        // Scene 8: Epic Launch - HOLLYWOOD dual-keyframe (name in stars)
        const scene8Op = await generateScene8EpicLaunchHollywood({
          childName: child.name,
          childAge,
          goodBehavior,
          thingToImprove,
          thingToLearn,
        })

        // Store Veo operations for polling
        // Scene 6 only needs polling if it's Veo (not HeyGen)
        const veoOps: {
          scene4Op: string
          scene5Op: string
          scene6Op?: string
          scene8Op: string
        } = {
          scene4Op,
          scene5Op,
          scene8Op,
        }

        if (scene6Result.type === 'veo') {
          veoOps.scene6Op = scene6Result.value
        }

        veoOperations.set(child.id, veoOps)

        // Initialize child scene videos (will be filled during polling)
        childSceneVideos.set(child.id, {
          scene4: scene4Op, // Will be replaced with URL after polling
          scene5: scene5Op, // Will be replaced with URL after polling
          scene6: scene6Result, // Already has the right structure
          scene8: scene8Op, // Will be replaced with URL after polling
        })

        console.log(`[Orchestration] Scene generation started for ${child.name}`)
      } catch (error) {
        console.error(`[Orchestration] Failed to generate scenes for ${child.name}:`, error)
        progress.scenesFailed[4] = progress.scenesFailed[4] || []
        progress.scenesFailed[4].push(child.id)
        throw error
      }
    })

    await Promise.all(childGenerationPromises)

    // 5. Poll for Veo video completions (Scenes 4, 5, 8 always; Scene 6 only if Veo fallback)
    console.log(`[Orchestration] Polling for Veo completions...`)
    progress.stage = 'polling'

    const veoCompletionPromises: Promise<void>[] = []

    for (const [childId, ops] of veoOperations.entries()) {
      // Scene 4: Photo Comes Alive
      veoCompletionPromises.push(
        (async () => {
          try {
            const result = await waitForVideoGeneration(ops.scene4Op)
            const videos = childSceneVideos.get(childId)!
            videos.scene4 = result.videoUrl ?? ''
            console.log(`[Orchestration] Scene 4 (Photo Comes Alive) complete for child ${childId}`)
          } catch (error) {
            console.error(`[Orchestration] Scene 4 polling failed for child ${childId}:`, error)
            progress.scenesFailed[4] = progress.scenesFailed[4] || []
            progress.scenesFailed[4].push(childId)
            throw error
          }
        })()
      )

      // Scene 5: Name Reveal
      veoCompletionPromises.push(
        (async () => {
          try {
            const result = await waitForVideoGeneration(ops.scene5Op)
            const videos = childSceneVideos.get(childId)!
            videos.scene5 = result.videoUrl ?? ''
            console.log(`[Orchestration] Scene 5 (Name Reveal) complete for child ${childId}`)
          } catch (error) {
            console.error(`[Orchestration] Scene 5 polling failed for child ${childId}:`, error)
            progress.scenesFailed[5] = progress.scenesFailed[5] || []
            progress.scenesFailed[5].push(childId)
            throw error
          }
        })()
      )

      // Scene 6: Santa's Message - only poll if Veo (HeyGen already completed)
      if (ops.scene6Op) {
        veoCompletionPromises.push(
          (async () => {
            try {
              const result = await waitForVideoGeneration(ops.scene6Op!)
              const videos = childSceneVideos.get(childId)!
              // Update Scene 6 with polled URL
              videos.scene6 = {
                type: 'veo',
                value: result.videoUrl ?? '',
                duration: 8,
              }
              console.log(`[Orchestration] Scene 6 (Veo fallback) complete for child ${childId}`)
            } catch (error) {
              console.error(`[Orchestration] Scene 6 polling failed for child ${childId}:`, error)
              progress.scenesFailed[6] = progress.scenesFailed[6] || []
              progress.scenesFailed[6].push(childId)
              throw error
            }
          })()
        )
      } else {
        // HeyGen already completed - log for tracking
        const scene6 = scene6Results.get(childId)
        console.log(
          `[Orchestration] Scene 6 (HeyGen) already complete for child ${childId}: ${scene6?.duration}s`
        )
      }

      // Scene 8: Epic Launch
      veoCompletionPromises.push(
        (async () => {
          try {
            const result = await waitForVideoGeneration(ops.scene8Op)
            const videos = childSceneVideos.get(childId)!
            videos.scene8 = result.videoUrl ?? ''
            console.log(`[Orchestration] Scene 8 (Epic Launch) complete for child ${childId}`)
          } catch (error) {
            console.error(`[Orchestration] Scene 8 polling failed for child ${childId}:`, error)
            progress.scenesFailed[8] = progress.scenesFailed[8] || []
            progress.scenesFailed[8].push(childId)
            throw error
          }
        })()
      )
    }

    await Promise.all(veoCompletionPromises)

    console.log(`[Orchestration] All video completions finished`)
    progress.scenesComplete = [1, 2, 3, 4, 5, 6, 7, 8]

    // 6. Generate stitch order and stitch video
    console.log(`[Orchestration] Generating stitch order...`)
    progress.stage = 'stitching'

    const stitchOrder = generateStitchOrder(premadeScenes, childSceneVideos, children)
    console.log(`[Orchestration] Stitch order generated: ${stitchOrder.length} segments`)

    const tempOutputPath = `/tmp/final-${orderId}.mp4`
    await stitchVideoSegments(stitchOrder, tempOutputPath)

    console.log(`[Orchestration] Final video stitched: ${tempOutputPath}`)

    // 7. Upload to Supabase Storage
    console.log(`[Orchestration] Uploading to Supabase Storage...`)
    progress.stage = 'uploading'

    const fileBuffer = await fs.readFile(tempOutputPath)
    const fileName = `${orderId}/final.mp4`

    const { error: uploadError } = await supabase.storage
      .from('videos')
      .upload(fileName, fileBuffer, {
        contentType: 'video/mp4',
        cacheControl: '31536000',
        upsert: true,
      })

    if (uploadError) {
      throw uploadError
    }

    const { data: urlData } = supabase.storage.from('videos').getPublicUrl(fileName)
    const finalVideoUrl = urlData.publicUrl

    console.log(`[Orchestration] Video uploaded: ${finalVideoUrl}`)

    // 8. Update order with final video URL
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        final_video_url: finalVideoUrl,
        status: 'complete',
        completed_at: new Date().toISOString(),
        generation_progress: progress,
      })
      .eq('id', orderId)

    if (updateError) {
      throw updateError
    }

    console.log(`[Orchestration] Order ${orderId} completed successfully`)

    // 9. Cleanup
    try {
      await fs.unlink(tempOutputPath)
    } catch (err) {
      console.error('[Orchestration] Temp file cleanup error:', err)
    }

    return NextResponse.json({
      success: true,
      videoUrl: finalVideoUrl,
      orderId,
      childCount: children.length,
    })
  } catch (error) {
    console.error(`[Orchestration] Error for order ${orderId}:`, error)

    // Update order with error status
    try {
      const supabase = await createClient()
      await supabase
        .from('orders')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
        })
        .eq('id', orderId)
    } catch (updateErr) {
      console.error('[Orchestration] Error update failed:', updateErr)
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        orderId,
      },
      { status: 500 }
    )
  }
}
