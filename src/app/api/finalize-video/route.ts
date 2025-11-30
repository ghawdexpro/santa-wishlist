import { stitchFinalVideo } from '@/lib/ffmpeg'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'

export const maxDuration = 300 // 5 minutes

export async function POST(request: NextRequest) {
  let tempOutputPath: string | null = null

  try {
    const { orderId, segments } = await request.json() as {
      orderId: string
      segments: Array<{
        url: string
        type: 'heygen' | 'veo'
        order: number
      }>
    }

    if (!orderId || !segments || segments.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, segments' },
        { status: 400 }
      )
    }

    console.log(`[Finalize] Processing order ${orderId} with ${segments.length} segments...`)

    const supabase = createClient()

    // 1. Stitch videos
    tempOutputPath = `/tmp/final-${orderId}.mp4`
    await stitchFinalVideo(segments, tempOutputPath)

    console.log(`[Finalize] Video stitched: ${tempOutputPath}`)

    // 2. Upload to Supabase Storage
    console.log(`[Finalize] Uploading to Supabase Storage...`)
    const fileBuffer = await fs.readFile(tempOutputPath)
    const fileName = `${orderId}/final.mp4`

    const { data, error } = await supabase.storage
      .from('videos')
      .upload(fileName, fileBuffer, {
        contentType: 'video/mp4',
        cacheControl: '31536000', // 1 year
        upsert: true,
      })

    if (error) {
      console.error('[Finalize] Supabase upload error:', error)
      throw error
    }

    console.log(`[Finalize] Uploaded to Supabase: ${data?.path}`)

    // 3. Get public URL
    const { data: urlData } = supabase.storage.from('videos').getPublicUrl(fileName)

    const videoUrl = urlData.publicUrl

    console.log(`[Finalize] Public URL: ${videoUrl}`)

    // 4. Update order status
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        final_video_url: videoUrl,
        status: 'complete',
        completed_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('[Finalize] Order update error:', updateError)
      throw updateError
    }

    console.log(`[Finalize] Order ${orderId} completed`)

    return NextResponse.json({ videoUrl })
  } catch (error) {
    console.error('[Finalize] Error:', error)

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  } finally {
    // Cleanup temp output file
    if (tempOutputPath) {
      try {
        await fs.unlink(tempOutputPath)
      } catch (err) {
        console.error('[Finalize] Temp cleanup error:', err)
      }
    }
  }
}
