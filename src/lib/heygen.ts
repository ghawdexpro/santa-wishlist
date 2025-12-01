/**
 * HeyGen Video Generation API Integration
 * For Scene 6: Santa's Personal Message (30-60 seconds talking head)
 *
 * Uses HeyGen V2 API to generate pre-rendered avatar videos
 * Documentation: docs/HEYGEN-VIDEO-API-BIBLE.md
 */

const HEYGEN_API_URL = 'https://api.heygen.com'

// Environment variables
const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY
const SANTA_AVATAR_ID = process.env.NEXT_PUBLIC_SANTA_AVATAR_ID
const SANTA_VOICE_ID = process.env.NEXT_PUBLIC_SANTA_VOICE_ID

// Types
export interface HeyGenVideoRequest {
  script: string
  childName: string
  backgroundUrl?: string // Optional custom background
  dimension?: { width: number; height: number }
}

export interface HeyGenVideoStatus {
  status: 'pending' | 'waiting' | 'processing' | 'completed' | 'failed'
  video_id: string
  video_url?: string
  thumbnail_url?: string
  duration?: number
  error?: string
}

export interface HeyGenAvatar {
  avatar_id: string
  avatar_name: string
  gender: string
  preview_image_url: string
  preview_video_url: string
}

export interface HeyGenVoice {
  voice_id: string
  name: string
  language: string
  gender: string
  preview_audio: string
}

/**
 * Generate a Santa video using HeyGen Video API
 * This is the main function for Scene 6 generation
 *
 * @param request - Video generation parameters
 * @returns Video ID for polling status
 */
export async function generateSantaVideo(request: HeyGenVideoRequest): Promise<string> {
  if (!HEYGEN_API_KEY) {
    throw new Error('HEYGEN_API_KEY is not configured')
  }

  if (!SANTA_AVATAR_ID) {
    throw new Error('NEXT_PUBLIC_SANTA_AVATAR_ID is not configured')
  }

  if (!SANTA_VOICE_ID) {
    throw new Error('NEXT_PUBLIC_SANTA_VOICE_ID is not configured')
  }

  console.log(`[HeyGen] Generating Santa video for ${request.childName}`)
  console.log(`[HeyGen] Script length: ${request.script.length} characters`)

  // Validate script length (HeyGen max is 5000 characters)
  if (request.script.length > 5000) {
    throw new Error(`Script too long: ${request.script.length} chars (max 5000)`)
  }

  const dimension = request.dimension || { width: 1920, height: 1080 }

  // Build background config
  let background: { type: string; value?: string; url?: string }
  if (request.backgroundUrl) {
    background = { type: 'image', url: request.backgroundUrl }
  } else {
    // Default: Warm Christmas-themed dark blue
    background = { type: 'color', value: '#1a1a2e' }
  }

  const payload = {
    video_inputs: [
      {
        character: {
          type: 'avatar',
          avatar_id: SANTA_AVATAR_ID,
          avatar_style: 'normal',
        },
        voice: {
          type: 'text',
          input_text: request.script,
          voice_id: SANTA_VOICE_ID,
          speed: 0.95, // Slightly slower for warmth
          pitch: -2, // Slightly lower for Santa's deep voice
        },
        background,
      },
    ],
    dimension,
    test: false, // Set to true for watermarked test videos during development
  }

  try {
    const response = await fetch(`${HEYGEN_API_URL}/v2/video/generate`, {
      method: 'POST',
      headers: {
        'X-Api-Key': HEYGEN_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error(`[HeyGen] API error: ${response.status}`, errorBody)
      throw new Error(`HeyGen API error: ${response.status} - ${errorBody}`)
    }

    const result = await response.json()

    if (result.error) {
      throw new Error(`HeyGen error: ${result.error.message || JSON.stringify(result.error)}`)
    }

    const videoId = result.data?.video_id
    if (!videoId) {
      throw new Error('HeyGen did not return a video_id')
    }

    console.log(`[HeyGen] Video generation started: ${videoId}`)
    return videoId
  } catch (error) {
    console.error('[HeyGen] Failed to start video generation:', error)
    throw error
  }
}

/**
 * Check the status of a HeyGen video generation
 *
 * @param videoId - The video ID from generateSantaVideo
 * @returns Current status and video URL if completed
 */
export async function checkVideoStatus(videoId: string): Promise<HeyGenVideoStatus> {
  if (!HEYGEN_API_KEY) {
    throw new Error('HEYGEN_API_KEY is not configured')
  }

  try {
    const response = await fetch(
      `${HEYGEN_API_URL}/v1/video_status.get?video_id=${encodeURIComponent(videoId)}`,
      {
        method: 'GET',
        headers: {
          'X-Api-Key': HEYGEN_API_KEY,
        },
      }
    )

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`HeyGen status API error: ${response.status} - ${errorBody}`)
    }

    const result = await response.json()

    if (result.error) {
      throw new Error(`HeyGen error: ${result.error.message || JSON.stringify(result.error)}`)
    }

    return result.data as HeyGenVideoStatus
  } catch (error) {
    console.error('[HeyGen] Failed to check video status:', error)
    throw error
  }
}

/**
 * Poll for video completion with exponential backoff
 * Average HeyGen video takes 30-120 seconds to generate
 *
 * @param videoId - The video ID to poll
 * @param maxAttempts - Maximum polling attempts (default: 60 = ~10 minutes)
 * @returns Video URL when completed
 */
export async function waitForVideoCompletion(
  videoId: string,
  maxAttempts: number = 60
): Promise<string> {
  console.log(`[HeyGen] Waiting for video ${videoId} to complete...`)

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const status = await checkVideoStatus(videoId)

    console.log(`[HeyGen] Status check ${attempt + 1}/${maxAttempts}: ${status.status}`)

    if (status.status === 'completed') {
      if (!status.video_url) {
        throw new Error('HeyGen video completed but no URL returned')
      }
      console.log(`[HeyGen] Video completed! Duration: ${status.duration}s`)
      return status.video_url
    }

    if (status.status === 'failed') {
      throw new Error(`HeyGen video generation failed: ${status.error || 'Unknown error'}`)
    }

    // Exponential backoff: 5s, 10s, 15s... up to 30s max
    const delay = Math.min(5000 * (attempt + 1), 30000)
    await sleep(delay)
  }

  throw new Error(`HeyGen video generation timed out after ${maxAttempts} attempts`)
}

/**
 * Generate Santa video and wait for completion (convenience function)
 * This is the all-in-one function for Scene 6
 *
 * @param request - Video generation parameters
 * @returns Final video URL
 */
export async function generateAndWaitForSantaVideo(
  request: HeyGenVideoRequest
): Promise<{ videoUrl: string; videoId: string; duration: number }> {
  // Start generation
  const videoId = await generateSantaVideo(request)

  // Wait for completion
  const videoUrl = await waitForVideoCompletion(videoId)

  // Get final status to retrieve duration
  const finalStatus = await checkVideoStatus(videoId)

  return {
    videoUrl,
    videoId,
    duration: finalStatus.duration || 0,
  }
}

/**
 * Download video from HeyGen URL
 * Important: HeyGen URLs expire after 7 days!
 *
 * @param videoUrl - The HeyGen video URL
 * @returns Video buffer
 */
export async function downloadVideo(videoUrl: string): Promise<Buffer> {
  console.log(`[HeyGen] Downloading video from ${videoUrl.substring(0, 50)}...`)

  try {
    const response = await fetch(videoUrl)

    if (!response.ok) {
      throw new Error(`Failed to download video: ${response.status}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    console.log(`[HeyGen] Downloaded ${(buffer.length / 1024 / 1024).toFixed(2)} MB`)
    return buffer
  } catch (error) {
    console.error('[HeyGen] Failed to download video:', error)
    throw error
  }
}

/**
 * List all available HeyGen avatars
 * Use this to find suitable Santa avatars
 */
export async function listAvatars(): Promise<HeyGenAvatar[]> {
  if (!HEYGEN_API_KEY) {
    throw new Error('HEYGEN_API_KEY is not configured')
  }

  try {
    const response = await fetch(`${HEYGEN_API_URL}/v2/avatars`, {
      method: 'GET',
      headers: {
        'X-Api-Key': HEYGEN_API_KEY,
      },
    })

    if (!response.ok) {
      throw new Error(`HeyGen avatars API error: ${response.status}`)
    }

    const result = await response.json()
    return result.data?.avatars || []
  } catch (error) {
    console.error('[HeyGen] Failed to list avatars:', error)
    throw error
  }
}

/**
 * List all available HeyGen voices
 * Use this to find suitable Santa voices (look for deep, warm voices)
 */
export async function listVoices(): Promise<HeyGenVoice[]> {
  if (!HEYGEN_API_KEY) {
    throw new Error('HEYGEN_API_KEY is not configured')
  }

  try {
    const response = await fetch(`${HEYGEN_API_URL}/v2/voices`, {
      method: 'GET',
      headers: {
        'X-Api-Key': HEYGEN_API_KEY,
      },
    })

    if (!response.ok) {
      throw new Error(`HeyGen voices API error: ${response.status}`)
    }

    const result = await response.json()
    return result.data?.voices || []
  } catch (error) {
    console.error('[HeyGen] Failed to list voices:', error)
    throw error
  }
}

/**
 * Build Scene 6 script for a child
 * Creates a personalized Santa message in Polish
 * Part of Magia Świąt - Spersonalizowane Wideo od Mikołaja
 *
 * @param childName - Child's name
 * @param age - Child's age
 * @param goodBehavior - Something good the child did
 * @param thingToImprove - Something the child should work on
 * @param thingToLearn - Something the child wants to learn
 * @param customScript - Optional: Pre-generated script from Gemini
 * @returns Full script for HeyGen
 */
export function buildScene6Script(
  childName: string,
  age: number,
  goodBehavior: string,
  thingToImprove: string,
  thingToLearn: string,
  customScript?: string
): string {
  // If a custom script was provided (from Gemini), use it
  if (customScript) {
    return customScript
  }

  // Default Polish script template
  return `Ho ho ho! Witaj, ${childName}!

Tak, tak... Właśnie patrzę w moją magiczną księgę tu na Biegunie Północnym,
i widzę twoje imię świecące jasno! ${childName}, lat ${age}.

Wiesz co mnie bardzo ucieszyło? Kiedy ${goodBehavior}.
To było wspaniałe! Moje elfy mówiły o tym przez cały tydzień!

Wiem też, że ${thingToImprove}.
Wierzę w ciebie całkowicie - jesteś naprawdę wyjątkowym dzieckiem!

Słyszałem też, że chcesz się nauczyć ${thingToLearn}!
Co za świetny pomysł! Może sprawdź pod choinką...

Pamiętaj, drogi ${childName} - bądź grzeczny, słuchaj rodziców,
i nigdy nie przestawaj wierzyć w magię Świąt!

Wkrótce przylecę do Polski!
Wesołych Świąt z Bieguna Północnego! Ho ho ho!`
}

// Utility function
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Validate HeyGen configuration
 * Call this at startup to verify all required env vars are set
 */
export function validateHeyGenConfig(): {
  valid: boolean
  missing: string[]
} {
  const missing: string[] = []

  if (!HEYGEN_API_KEY) missing.push('HEYGEN_API_KEY')
  if (!SANTA_AVATAR_ID) missing.push('NEXT_PUBLIC_SANTA_AVATAR_ID')
  if (!SANTA_VOICE_ID) missing.push('NEXT_PUBLIC_SANTA_VOICE_ID')

  return {
    valid: missing.length === 0,
    missing,
  }
}
