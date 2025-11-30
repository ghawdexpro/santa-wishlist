/**
 * Approve keyframes and start Veo video generation
 *
 * Called after admin reviews keyframes in /admin/review/[orderId]
 * Uses saved keyframes to generate videos with Veo
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { startVideoGeneration, waitForVideoGeneration } from '@/lib/veo'
import { getScenePrompts, SceneNumber } from '@/lib/hollywood-prompts'
import { getAllPremadeScenes } from '@/lib/premade-cache'
import { generateStitchOrder, stitchVideoSegments } from '@/lib/video-stitcher'
import fs from 'fs/promises'

export const maxDuration = 900 // 15 minutes for video generation

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface SavedKeyframe {
  sceneNumber: number
  childId?: string
  childName?: string
  startKeyframeUrl: string
  endKeyframeUrl: string
}

/**
 * Download image from URL and convert to base64
 */
async function downloadToBase64(url: string): Promise<{ base64: string; mimeType: string }> {
  // Handle data URLs
  if (url.startsWith('data:')) {
    const match = url.match(/^data:([^;]+);base64,(.+)$/)
    if (match) {
      return { base64: match[2], mimeType: match[1] }
    }
  }

  const response = await fetch(url)
  const buffer = await response.arrayBuffer()
  const base64 = Buffer.from(buffer).toString('base64')
  const mimeType = response.headers.get('content-type') || 'image/png'

  return { base64, mimeType }
}

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: 'orderId required' }, { status: 400 })
    }

    console.log(`[ApproveGenerate] Starting video generation for order: ${orderId}`)

    // Fetch order with keyframes and children
    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('*, children(*)')
      .eq('id', orderId)
      .single()

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.status !== 'keyframes_ready') {
      return NextResponse.json(
        { error: `Order status is ${order.status}, expected keyframes_ready` },
        { status: 400 }
      )
    }

    const savedKeyframes = (order.keyframe_urls || []) as SavedKeyframe[]
    const children = (order.children || []).sort(
      (a: any, b: any) => a.sequence_number - b.sequence_number
    )

    if (savedKeyframes.length === 0) {
      return NextResponse.json({ error: 'No keyframes found for this order' }, { status: 400 })
    }

    console.log(`[ApproveGenerate] Found ${savedKeyframes.length} keyframes, ${children.length} children`)

    // Update status
    await supabaseAdmin
      .from('orders')
      .update({ status: 'generating_videos' })
      .eq('id', orderId)

    // Load pre-made scenes
    const premadeScenes = await getAllPremadeScenes()
    console.log(`[ApproveGenerate] Pre-made scenes loaded: ${Array.from(premadeScenes.keys()).join(', ')}`)

    // Start Veo generation for each saved keyframe
    const veoOperations: Array<{
      sceneNumber: number
      childId: string
      childName: string
      operationName: string
    }> = []

    for (const keyframe of savedKeyframes) {
      console.log(`[ApproveGenerate] Starting Veo for Scene ${keyframe.sceneNumber} (${keyframe.childName})...`)

      try {
        // Download keyframes
        const [startKf, endKf] = await Promise.all([
          downloadToBase64(keyframe.startKeyframeUrl),
          downloadToBase64(keyframe.endKeyframeUrl),
        ])

        // Get video prompt
        const prompts = getScenePrompts(keyframe.sceneNumber as SceneNumber, keyframe.childName)

        // Start Veo generation
        const operationName = await startVideoGeneration({
          prompt: prompts.videoPrompt,
          imageBase64: startKf.base64,
          imageMimeType: startKf.mimeType,
          endImageBase64: endKf.base64,
          endImageMimeType: endKf.mimeType,
          durationSeconds: 8,
          aspectRatio: '16:9',
          negativePrompt: 'cartoon, anime, low quality, blurry, distorted, glitch, text overlay',
        })

        veoOperations.push({
          sceneNumber: keyframe.sceneNumber,
          childId: keyframe.childId || '',
          childName: keyframe.childName || '',
          operationName,
        })

        console.log(`[ApproveGenerate] Veo started for Scene ${keyframe.sceneNumber}: ${operationName}`)
      } catch (error) {
        console.error(`[ApproveGenerate] Failed to start Veo for Scene ${keyframe.sceneNumber}:`, error)
      }
    }

    // Poll for completions
    console.log(`[ApproveGenerate] Polling ${veoOperations.length} Veo operations...`)

    const childSceneVideos = new Map<string, { scene4: string; scene5: string; scene6: string; scene8: string }>()

    // Initialize maps for each child
    for (const child of children) {
      childSceneVideos.set(child.id, { scene4: '', scene5: '', scene6: '', scene8: '' })
    }

    // Poll all operations
    await Promise.all(
      veoOperations.map(async (op) => {
        try {
          const result = await waitForVideoGeneration(op.operationName)
          const videos = childSceneVideos.get(op.childId)
          if (videos && result.videoUrl) {
            const sceneKey = `scene${op.sceneNumber}` as keyof typeof videos
            videos[sceneKey] = result.videoUrl
            console.log(`[ApproveGenerate] Scene ${op.sceneNumber} complete for ${op.childName}`)
          }
        } catch (error) {
          console.error(`[ApproveGenerate] Polling failed for ${op.operationName}:`, error)
        }
      })
    )

    console.log(`[ApproveGenerate] All Veo operations complete`)

    // Stitch video
    console.log(`[ApproveGenerate] Stitching final video...`)

    const stitchOrder = generateStitchOrder(premadeScenes, childSceneVideos, children)
    const tempOutputPath = `/tmp/final-${orderId}.mp4`

    await stitchVideoSegments(stitchOrder, tempOutputPath)

    // Upload to storage
    console.log(`[ApproveGenerate] Uploading final video...`)

    const fileBuffer = await fs.readFile(tempOutputPath)
    const fileName = `${orderId}/final.mp4`

    const { error: uploadError } = await supabaseAdmin.storage
      .from('videos')
      .upload(fileName, fileBuffer, {
        contentType: 'video/mp4',
        cacheControl: '31536000',
        upsert: true,
      })

    if (uploadError) {
      throw uploadError
    }

    const { data: urlData } = supabaseAdmin.storage.from('videos').getPublicUrl(fileName)
    const finalVideoUrl = urlData.publicUrl

    // Update order
    await supabaseAdmin
      .from('orders')
      .update({
        final_video_url: finalVideoUrl,
        status: 'complete',
        completed_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    // Cleanup
    try {
      await fs.unlink(tempOutputPath)
    } catch {}

    console.log(`[ApproveGenerate] Order ${orderId} completed: ${finalVideoUrl}`)

    return NextResponse.json({
      success: true,
      orderId,
      videoUrl: finalVideoUrl,
    })
  } catch (error) {
    console.error('[ApproveGenerate] Error:', error)

    // Update order with error
    try {
      const { orderId } = await request.json()
      await supabaseAdmin
        .from('orders')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
        })
        .eq('id', orderId)
    } catch {}

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
