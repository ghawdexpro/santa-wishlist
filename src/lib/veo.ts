import { GoogleAuth } from 'google-auth-library'

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'primal-turbine-478412-k9'
const LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'
const MODEL = 'veo-3.1-generate-001' // Upgraded to Veo 3.1 with native audio generation

async function getAccessToken(): Promise<string> {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)
    const auth = new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    })
    const client = await auth.getClient()
    const token = await client.getAccessToken()
    return token.token || ''
  }

  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  })
  const client = await auth.getClient()
  const token = await client.getAccessToken()
  return token.token || ''
}

export interface VideoGenerationRequest {
  prompt: string
  imageBase64?: string  // Optional: start keyframe image
  imageMimeType?: string
  endImageBase64?: string  // Optional: end keyframe image
  endImageMimeType?: string
  durationSeconds?: number  // 5-8 for Veo 2
  aspectRatio?: '16:9' | '9:16'
  sampleCount?: number
  negativePrompt?: string
}

export interface VideoGenerationOperation {
  operationName: string
  done: boolean
  videoUrl?: string
  videoBase64?: string
  mimeType?: string
  error?: string
}

/**
 * Start video generation - returns an operation ID to poll
 */
export async function startVideoGeneration(request: VideoGenerationRequest): Promise<string> {
  const accessToken = await getAccessToken()

  const endpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL}:predictLongRunning`

  // Build the request body
  const instance: Record<string, unknown> = {
    prompt: request.prompt,
  }

  // If we have a start keyframe image, use image-to-video
  if (request.imageBase64 && request.imageMimeType) {
    instance.image = {
      bytesBase64Encoded: request.imageBase64,
      mimeType: request.imageMimeType,
    }
  }

  // If we have an end keyframe image, add it for guided generation
  if (request.endImageBase64 && request.endImageMimeType) {
    instance.endImage = {
      bytesBase64Encoded: request.endImageBase64,
      mimeType: request.endImageMimeType,
    }
  }

  const body = {
    instances: [instance],
    parameters: {
      aspectRatio: request.aspectRatio || '16:9',
      sampleCount: request.sampleCount || 1,
      durationSeconds: request.durationSeconds || 8,
      personGeneration: 'allow_adult',
      generateAudio: true,  // Veo 3.1 native audio generation
      ...(request.negativePrompt && { negativePrompt: request.negativePrompt }),
    },
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Veo API error:', error)
    throw new Error(`Veo API error: ${response.status} - ${error}`)
  }

  const result = await response.json()

  // Extract operation name
  if (!result.name) {
    throw new Error('No operation name returned from Veo API')
  }

  return result.name
}

/**
 * Poll for video generation completion
 */
export async function pollVideoGeneration(operationName: string): Promise<VideoGenerationOperation> {
  const accessToken = await getAccessToken()

  // Extract model ID from operation name for the fetch endpoint
  const modelMatch = operationName.match(/models\/([^/]+)\/operations/)
  const modelId = modelMatch ? modelMatch[1] : MODEL

  const endpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${modelId}:fetchPredictOperation`

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      operationName: operationName,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Veo poll error:', error)
    throw new Error(`Veo poll error: ${response.status}`)
  }

  const result = await response.json()

  // Check if operation is done
  if (!result.done) {
    return {
      operationName,
      done: false,
    }
  }

  // Check for error
  if (result.error) {
    return {
      operationName,
      done: true,
      error: result.error.message || 'Video generation failed',
    }
  }

  // Extract video from response
  const videos = result.response?.videos || []
  if (videos.length === 0) {
    return {
      operationName,
      done: true,
      error: 'No videos generated',
    }
  }

  const video = videos[0]

  return {
    operationName,
    done: true,
    videoUrl: video.gcsUri,
    videoBase64: video.bytesBase64Encoded,
    mimeType: video.mimeType || 'video/mp4',
  }
}

/**
 * Wait for video generation to complete (with timeout)
 */
export async function waitForVideoGeneration(
  operationName: string,
  maxWaitMs: number = 600000, // 10 minutes default
  pollIntervalMs: number = 15000 // 15 seconds
): Promise<VideoGenerationOperation> {
  const startTime = Date.now()

  while (Date.now() - startTime < maxWaitMs) {
    const result = await pollVideoGeneration(operationName)

    if (result.done) {
      return result
    }

    // Wait before polling again
    await new Promise(resolve => setTimeout(resolve, pollIntervalMs))
  }

  return {
    operationName,
    done: false,
    error: 'Video generation timed out',
  }
}

/**
 * Generate a video for a single scene
 */
export async function generateSceneVideo(
  sceneNumber: number,
  prompt: string,
  startKeyframeBase64?: string,
  startKeyframeMimeType?: string,
  endKeyframeBase64?: string,
  endKeyframeMimeType?: string
): Promise<{ operationName: string }> {
  // Build a detailed prompt for video generation
  const videoPrompt = `Cinematic video scene: ${prompt}
Style: Photorealistic, warm cozy Christmas atmosphere, soft cinematic lighting.
Camera: Smooth subtle movement, professional cinematography.
Quality: High detail, no artifacts, natural motion.`

  const operationName = await startVideoGeneration({
    prompt: videoPrompt,
    imageBase64: startKeyframeBase64,
    imageMimeType: startKeyframeMimeType,
    endImageBase64: endKeyframeBase64,
    endImageMimeType: endKeyframeMimeType,
    durationSeconds: 8,
    aspectRatio: '16:9',
    negativePrompt: 'cartoon, anime, low quality, blurry, distorted, glitch, text overlay',
  })

  console.log(`Started video generation for scene ${sceneNumber}: ${operationName}`)

  return { operationName }
}

/**
 * Scene video data with operation tracking
 */
export interface SceneVideoOperation {
  sceneNumber: number
  operationName: string
  status: 'pending' | 'generating' | 'complete' | 'failed'
  videoUrl?: string
  videoBase64?: string
  error?: string
}

/**
 * Start generating videos for all scenes
 */
export async function startAllSceneVideos(
  scenes: Array<{
    sceneNumber: number
    prompt: string
    startKeyframeBase64?: string
    startKeyframeMimeType?: string
    endKeyframeBase64?: string
    endKeyframeMimeType?: string
  }>
): Promise<SceneVideoOperation[]> {
  const operations: SceneVideoOperation[] = []

  // Start generation for each scene sequentially to avoid rate limits
  for (const scene of scenes) {
    try {
      const { operationName } = await generateSceneVideo(
        scene.sceneNumber,
        scene.prompt,
        scene.startKeyframeBase64,
        scene.startKeyframeMimeType,
        scene.endKeyframeBase64,
        scene.endKeyframeMimeType
      )

      operations.push({
        sceneNumber: scene.sceneNumber,
        operationName,
        status: 'generating',
      })

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 2000))
    } catch (error) {
      console.error(`Failed to start video for scene ${scene.sceneNumber}:`, error)
      operations.push({
        sceneNumber: scene.sceneNumber,
        operationName: '',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return operations
}

/**
 * Check status of all scene video operations
 */
export async function checkAllSceneVideos(
  operations: SceneVideoOperation[]
): Promise<SceneVideoOperation[]> {
  const updated: SceneVideoOperation[] = []

  for (const op of operations) {
    if (op.status === 'complete' || op.status === 'failed' || !op.operationName) {
      updated.push(op)
      continue
    }

    try {
      const result = await pollVideoGeneration(op.operationName)

      if (result.done) {
        if (result.error) {
          updated.push({
            ...op,
            status: 'failed',
            error: result.error,
          })
        } else {
          updated.push({
            ...op,
            status: 'complete',
            videoUrl: result.videoUrl,
            videoBase64: result.videoBase64,
          })
        }
      } else {
        updated.push({
          ...op,
          status: 'generating',
        })
      }
    } catch (error) {
      updated.push({
        ...op,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Poll failed',
      })
    }

    // Small delay between polls
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  return updated
}
