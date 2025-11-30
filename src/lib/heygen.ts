/**
 * HeyGen API Integration for generating talking head videos with Mikołaj avatar
 * Uses HeyGen API v2 for video generation and polling
 */

interface HeyGenRequest {
  script: string
  voiceId?: string
  avatarId?: string
}

interface HeyGenResponse {
  video_id: string
  [key: string]: unknown
}

interface HeyGenStatusResponse {
  status: string // 'pending' | 'processing' | 'completed' | 'failed'
  video_url?: string
  [key: string]: unknown
}

/**
 * Generate a talking head video with HeyGen API
 */
export async function generateTalkingHead(
  request: HeyGenRequest
): Promise<{ videoId: string }> {
  const apiKey = process.env.HEYGEN_API_KEY

  if (!apiKey) {
    throw new Error('HEYGEN_API_KEY environment variable not set')
  }

  const response = await fetch('https://api.heygen.com/v2/video/generate', {
    method: 'POST',
    headers: {
      'X-Api-Key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      test: false,
      caption: false,
      dimension: {
        width: 1920,
        height: 1080,
      },
      video_inputs: [
        {
          character: {
            type: 'avatar',
            avatar_id: request.avatarId || process.env.HEYGEN_AVATAR_ID || 'default_santa',
            avatar_style: 'normal',
          },
          voice: {
            type: 'text',
            input_text: request.script,
            voice_id: request.voiceId || 'polish_male_warm', // Polish voice
          },
        },
      ],
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('HeyGen API error:', error)
    throw new Error(`HeyGen API error: ${response.status} - ${error}`)
  }

  const data = (await response.json()) as HeyGenResponse

  if (!data.video_id) {
    throw new Error(`HeyGen generation failed: ${JSON.stringify(data)}`)
  }

  return { videoId: data.video_id }
}

/**
 * Poll HeyGen API for video generation status
 */
export async function pollHeyGenStatus(
  videoId: string
): Promise<{ status: string; videoUrl?: string }> {
  const apiKey = process.env.HEYGEN_API_KEY

  if (!apiKey) {
    throw new Error('HEYGEN_API_KEY environment variable not set')
  }

  const response = await fetch(
    `https://api.heygen.com/v1/video_status.get?video_id=${videoId}`,
    {
      headers: { 'X-Api-Key': apiKey },
    }
  )

  if (!response.ok) {
    const error = await response.text()
    console.error('HeyGen status check error:', error)
    throw new Error(`HeyGen status check error: ${response.status} - ${error}`)
  }

  const data = (await response.json()) as HeyGenStatusResponse

  return {
    status: data.status, // 'pending' | 'processing' | 'completed' | 'failed'
    videoUrl: data.video_url,
  }
}

/**
 * Wait for HeyGen video to complete generation
 * Polls every 10 seconds until complete or timeout
 */
export async function waitForHeyGenCompletion(
  videoId: string,
  maxWaitMs: number = 600000 // 10 minutes
): Promise<string> {
  const startTime = Date.now()
  let pollCount = 0

  while (Date.now() - startTime < maxWaitMs) {
    const { status, videoUrl } = await pollHeyGenStatus(videoId)

    pollCount++
    console.log(
      `[HeyGen ${videoId}] Poll ${pollCount}: status=${status}${videoUrl ? ` videoUrl=${videoUrl}` : ''}`
    )

    if (status === 'completed' && videoUrl) {
      console.log(`[HeyGen ${videoId}] Generation complete`)
      return videoUrl
    }

    if (status === 'failed') {
      throw new Error('HeyGen generation failed')
    }

    // Poll every 10 seconds
    await new Promise(resolve => setTimeout(resolve, 10000))
  }

  throw new Error(`HeyGen generation timeout (waited ${maxWaitMs}ms)`)
}

/**
 * Generate HeyGen video and wait for completion
 * Convenience function that combines generation + polling
 */
export async function generateHeyGenVideo(options: {
  script: string
  durationSeconds?: number
  characterId?: string
}): Promise<string> {
  const { videoId } = await generateTalkingHead({
    script: options.script,
    avatarId: options.characterId,
  })

  // Wait for video to complete and return URL
  const videoUrl = await waitForHeyGenCompletion(videoId)
  return videoUrl
}
