import { NextRequest, NextResponse } from 'next/server'
import { checkAllSceneVideos, type SceneVideoOperation } from '@/lib/veo'
import { createClient } from '@supabase/supabase-js'

// Create admin client for server-side operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, operations } = body

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
    }

    if (!operations || !Array.isArray(operations)) {
      return NextResponse.json({ error: 'Missing operations' }, { status: 400 })
    }

    // Check status of all operations
    const updatedOperations = await checkAllSceneVideos(operations)

    // Check if all are complete
    const allComplete = updatedOperations.every(
      op => op.status === 'complete' || op.status === 'failed'
    )
    const anyFailed = updatedOperations.some(op => op.status === 'failed')
    const completedCount = updatedOperations.filter(op => op.status === 'complete').length

    // If all complete, update order status
    if (allComplete) {
      if (anyFailed) {
        // Some videos failed
        await supabaseAdmin
          .from('orders')
          .update({ status: 'failed' })
          .eq('id', orderId)
      } else {
        // All videos complete - collect video URLs
        const videoUrls = updatedOperations
          .filter(op => op.videoUrl)
          .map(op => op.videoUrl)

        // For MVP, we'll just mark as complete
        // In production, you'd stitch videos together
        await supabaseAdmin
          .from('orders')
          .update({
            status: 'complete',
            // Store first video URL for now (in production, this would be the stitched final video)
            final_video_url: videoUrls[0] || null,
            completed_at: new Date().toISOString(),
          })
          .eq('id', orderId)
      }
    }

    return NextResponse.json({
      orderId,
      allComplete,
      anyFailed,
      completedCount,
      totalCount: updatedOperations.length,
      operations: updatedOperations.map(op => ({
        sceneNumber: op.sceneNumber,
        status: op.status,
        videoUrl: op.videoUrl,
        error: op.error,
      })),
    })
  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { error: 'Failed to check video status' },
      { status: 500 }
    )
  }
}
