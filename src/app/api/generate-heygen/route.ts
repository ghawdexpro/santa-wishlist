import { generateTalkingHead, waitForHeyGenCompletion } from '@/lib/heygen'
import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 300 // 5 minutes

export async function POST(request: NextRequest) {
  try {
    const { script, type } = await request.json() as { script: string; type: 'intro' | 'outro' }

    if (!script || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: script, type' },
        { status: 400 }
      )
    }

    console.log(`[HeyGen] Generating ${type} video...`)

    // Start generation
    const { videoId } = await generateTalkingHead({ script })

    console.log(`[HeyGen] Video generation started: ${videoId}`)

    // Wait for completion (polls every 10s, timeout 10 min)
    const videoUrl = await waitForHeyGenCompletion(videoId)

    console.log(`[HeyGen] Video generation complete: ${videoUrl}`)

    return NextResponse.json({ videoUrl })
  } catch (error) {
    console.error('[HeyGen] Generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
