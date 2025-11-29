import { NextRequest, NextResponse } from 'next/server'
import { startAllSceneVideos, type SceneVideoOperation } from '@/lib/veo'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 300 // 5 minutes

// Create admin client for server-side operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, scenes, keyframes } = body

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
    }

    if (!scenes || !Array.isArray(scenes) || scenes.length === 0) {
      return NextResponse.json({ error: 'Missing or invalid scenes' }, { status: 400 })
    }

    // Check if Google Cloud is configured
    if (!process.env.GOOGLE_CLOUD_PROJECT && !process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
      return NextResponse.json({ error: 'Google Cloud not configured' }, { status: 503 })
    }

    // Verify order exists and is paid
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.status !== 'paid') {
      return NextResponse.json(
        { error: 'Order must be paid before generating video' },
        { status: 400 }
      )
    }

    // Update order status to generating
    await supabaseAdmin
      .from('orders')
      .update({ status: 'generating' })
      .eq('id', orderId)

    // Build scene data for video generation
    const sceneData = scenes.map((scene: { sceneNumber: number; visualDescription: string; santaDialogue: string }, index: number) => {
      // Find matching keyframe if available
      const keyframe = keyframes?.find((k: { sceneNumber: number }) => k.sceneNumber === scene.sceneNumber)

      // Build a rich video prompt from the scene data
      const prompt = `Santa Claus in his cozy workshop. ${scene.visualDescription}
Santa speaks: "${scene.santaDialogue}"
Cinematic quality, warm Christmas lighting, photorealistic Santa.`

      return {
        sceneNumber: scene.sceneNumber,
        prompt,
        keyframeBase64: keyframe?.imageBase64,
        keyframeMimeType: keyframe?.mimeType || 'image/png',
      }
    })

    // Start video generation for all scenes
    const operations = await startAllSceneVideos(sceneData)

    // Store operations in order metadata for polling
    // We'll use a simple JSON field for now
    const operationsJson = JSON.stringify(operations)

    // For MVP, we'll store the operation data in a simple way
    // In production, you'd want a separate video_operations table
    console.log(`Started ${operations.length} video operations for order ${orderId}`)

    return NextResponse.json({
      success: true,
      orderId,
      operationsCount: operations.length,
      operations: operations.map(op => ({
        sceneNumber: op.sceneNumber,
        status: op.status,
        operationName: op.operationName,
      })),
    })
  } catch (error) {
    console.error('Video generation error:', error)
    return NextResponse.json(
      { error: 'Failed to start video generation' },
      { status: 500 }
    )
  }
}
