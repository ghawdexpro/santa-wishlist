/**
 * Master orchestration endpoint for full video generation
 * Triggered by Stripe webhook after successful payment
 * Handles 8-scene multi-child video generation:
 * Scenes 1,2,3,7: Pre-made (cached)
 * Scenes 4,5,6,8: Personalized per child (NanoBanana + Veo + HeyGen)
 */

import { generateMultiChildScript } from '@/lib/gemini'
import { generateScene4ForChild } from '@/lib/photo-alive-generation'
import {
  generateScene5NameReveal,
  generateScene6SantasMessage,
  generateScene8EpicLaunch,
} from '@/lib/scene-generators'
import { getAllPremadeScenes } from '@/lib/premade-cache'
import { generateStitchOrder, stitchVideoSegments } from '@/lib/video-stitcher'
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
          age: c.age,
          goodBehavior: c.good_behavior,
          thingToImprove: c.thing_to_improve,
          thingToLearn: c.thing_to_learn,
        })),
        customMessage: order.custom_message,
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

    const childSceneVideos = new Map<
      string,
      {
        scene4: string
        scene5: string
        scene6: string
        scene8: string
      }
    >()

    const veoOperations = new Map<
      string,
      { scene4Op: string; scene5Op: string; scene8Op: string } // Store operation names for polling
    >()

    // Generate Scene 4 (photo) + Scene 5 (name) + Scene 6 (message) + Scene 8 (launch) for each child
    const childGenerationPromises = children.map(async child => {
      console.log(`[Orchestration] Starting scene generation for ${child.name}...`)

      try {
        // Scene 4: Photo Comes Alive (async Veo generation with photo reference keyframe)
        const scene4Op = await generateScene4ForChild({
          name: child.name,
          photoUrl: child.photo_url,
        })

        // Scene 5: Name Reveal (async Veo generation)
        const scene5Op = await generateScene5NameReveal({
          childName: child.name,
          childAge: child.age,
          goodBehavior: child.good_behavior,
          thingToImprove: child.thing_to_improve,
          thingToLearn: child.thing_to_learn,
        })

        // Scene 6: Santa's Message (HeyGen - returns URL directly)
        const scene6Url = await generateScene6SantasMessage({
          childName: child.name,
          childAge: child.age,
          goodBehavior: child.good_behavior,
          thingToImprove: child.thing_to_improve,
          thingToLearn: child.thing_to_learn,
          personalizedScript: script.personalized?.[child.name]
            ?.find(s => s.sceneNumber === 6)
            ?.santaDialogue,
        })

        // Scene 8: Epic Launch (async Veo generation)
        const scene8Op = await generateScene8EpicLaunch({
          childName: child.name,
          childAge: child.age,
          goodBehavior: child.good_behavior,
          thingToImprove: child.thing_to_improve,
          thingToLearn: child.thing_to_learn,
        })

        // Store results
        childSceneVideos.set(child.id, {
          scene4: scene4Op,
          scene5: scene5Op,
          scene6: scene6Url,
          scene8: scene8Op,
        })

        veoOperations.set(child.id, { scene4Op, scene5Op, scene8Op })

        console.log(`[Orchestration] Scene generation started for ${child.name}`)
      } catch (error) {
        console.error(`[Orchestration] Failed to generate scenes for ${child.name}:`, error)
        progress.scenesFailed[4] = progress.scenesFailed[4] || []
        progress.scenesFailed[4].push(child.id)
        throw error
      }
    })

    await Promise.all(childGenerationPromises)

    // 5. Poll for Veo video completions (Scenes 4, 5, and 8)
    console.log(`[Orchestration] Polling for Veo completions (Scenes 4, 5 & 8)...`)
    progress.stage = 'polling'

    const veoCompletionPromises = Array.from(veoOperations.entries()).flatMap(
      ([childId, ops]) => [
        (async () => {
          try {
            const result = await waitForVideoGeneration(ops.scene4Op)
            const videos = childSceneVideos.get(childId)!
            videos.scene4 = result.videoUrl
            console.log(`[Orchestration] Scene 4 (Photo Comes Alive) complete for child ${childId}`)
          } catch (error) {
            console.error(`[Orchestration] Scene 4 polling failed for child ${childId}:`, error)
            progress.scenesFailed[4] = progress.scenesFailed[4] || []
            progress.scenesFailed[4].push(childId)
            throw error
          }
        })(),
        (async () => {
          try {
            const result = await waitForVideoGeneration(ops.scene5Op)
            const videos = childSceneVideos.get(childId)!
            videos.scene5 = result.videoUrl
            console.log(`[Orchestration] Scene 5 (Name Reveal) complete for child ${childId}`)
          } catch (error) {
            console.error(`[Orchestration] Scene 5 polling failed for child ${childId}:`, error)
            progress.scenesFailed[5] = progress.scenesFailed[5] || []
            progress.scenesFailed[5].push(childId)
            throw error
          }
        })(),
        (async () => {
          try {
            const result = await waitForVideoGeneration(ops.scene8Op)
            const videos = childSceneVideos.get(childId)!
            videos.scene8 = result.videoUrl
            console.log(`[Orchestration] Scene 8 (Epic Launch) complete for child ${childId}`)
          } catch (error) {
            console.error(`[Orchestration] Scene 8 polling failed for child ${childId}:`, error)
            progress.scenesFailed[8] = progress.scenesFailed[8] || []
            progress.scenesFailed[8].push(childId)
            throw error
          }
        })(),
      ]
    )

    await Promise.all(veoCompletionPromises)

    console.log(`[Orchestration] All Veo completions finished`)
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
