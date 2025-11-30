/**
 * Master orchestration endpoint for full video generation
 * Triggered by Stripe webhook after successful payment
 * Handles: script → keyframes → Veo video → HeyGen → FFmpeg stitch → delivery
 */

import { generateSantaScript } from '@/lib/gemini'
import { generateAllKeyframes } from '@/lib/nanobanana'
import { startVideoGeneration, waitForVideoGeneration } from '@/lib/veo'
import { generateTalkingHead, waitForHeyGenCompletion } from '@/lib/heygen'
import { stitchFinalVideo } from '@/lib/ffmpeg'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'

export const maxDuration = 600 // 10 minutes

export async function POST(request: NextRequest) {
  const { orderId } = await request.json() as { orderId: string }

  try {
    const supabase = await createClient()

    console.log(`[Orchestration] Starting full video generation for order: ${orderId}`)

    // 1. Fetch order data
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (fetchError || !order) {
      throw new Error(`Order not found: ${orderId}`)
    }

    console.log(`[Orchestration] Order data loaded for ${order.child_name}`)

    // Update status to generating
    await supabase.from('orders').update({ status: 'generating' }).eq('id', orderId)

    // 2. Generate script (if not already generated)
    console.log(`[Orchestration] Generating script with Gemini...`)
    let script = order.generated_script

    if (!script) {
      script = await generateSantaScript({
        childName: order.child_name,
        childAge: order.child_age,
        goodBehavior: order.good_behavior,
        thingToImprove: order.thing_to_improve,
        thingToLearn: order.thing_to_learn,
        customMessage: order.custom_message,
      })

      await supabase.from('orders').update({ generated_script: script }).eq('id', orderId)

      console.log(`[Orchestration] Script generated with ${script.scenes.length} scenes`)
    }

    // 3. Generate HeyGen intro (Scene 1: 30s talking head)
    console.log(`[Orchestration] Generating HeyGen intro...`)
    const introScript = script.scenes[0]?.santaDialogue || `Ho ho ho, ${order.child_name}!`
    const { videoId: introVideoId } = await generateTalkingHead({
      script: introScript,
    })
    const introUrl = await waitForHeyGenCompletion(introVideoId)
    console.log(`[Orchestration] HeyGen intro complete`)

    // 4. Generate Veo magic scene (Scene 2: 30s video with keyframe)
    console.log(`[Orchestration] Generating Veo magic scene...`)
    const veoScene = script.scenes[1]
    const veoPrompt = veoScene?.visualDescription || `Magical book opens with ${order.child_name}'s name in gold letters`

    // Generate keyframe for image-to-video
    const keyframes = await generateAllKeyframes([{ prompt: veoPrompt, sceneNumber: 2 }])
    const keyframeBase64 = keyframes[0]?.imageBase64

    const veoOperationName = await startVideoGeneration({
      prompt: veoPrompt,
      imageBase64: keyframeBase64,
      imageMimeType: 'image/png',
      durationSeconds: 8,
    })

    const veoResult = await waitForVideoGeneration(veoOperationName)
    const veoUrl = veoResult.videoUrl

    if (!veoUrl) {
      throw new Error('Veo video generation failed')
    }

    console.log(`[Orchestration] Veo scene complete`)

    // 5. Generate HeyGen outro (Scene 3: 30s talking head)
    console.log(`[Orchestration] Generating HeyGen outro...`)
    const outroScript =
      script.scenes[2]?.santaDialogue || `${order.child_name}, see you on Christmas Eve!`
    const { videoId: outroVideoId } = await generateTalkingHead({
      script: outroScript,
    })
    const outroUrl = await waitForHeyGenCompletion(outroVideoId)
    console.log(`[Orchestration] HeyGen outro complete`)

    // 6. Stitch final video with FFmpeg
    console.log(`[Orchestration] Stitching final video with FFmpeg...`)
    const segments = [
      { url: introUrl, type: 'heygen' as const, order: 1 },
      { url: veoUrl, type: 'veo' as const, order: 2 },
      { url: outroUrl, type: 'heygen' as const, order: 3 },
    ]

    const tempOutputPath = `/tmp/final-${orderId}.mp4`
    await stitchFinalVideo(segments, tempOutputPath)

    console.log(`[Orchestration] Final video stitched: ${tempOutputPath}`)

    // 7. Upload to Supabase Storage
    console.log(`[Orchestration] Uploading to Supabase Storage...`)
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
