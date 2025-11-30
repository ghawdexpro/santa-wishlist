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

// ============================================================================
// VIDEO EXTENSION SUPPORT (Veo 3.1)
// ============================================================================

/**
 * Video Extension Request
 * Uses an existing video as a starting point and extends it by 5-8 seconds
 * Requires the source video to be stored in GCS
 */
export interface VideoExtensionRequest {
  prompt: string
  sourceVideoGcsUri: string  // gs://bucket/path/to/video.mp4
  durationSeconds?: number   // 5-8 seconds per extension
  aspectRatio?: '16:9' | '9:16'
}

/**
 * Video Extension Result
 */
export interface VideoExtensionResult {
  operationName: string
  done: boolean
  videoUrl?: string
  videoBase64?: string
  error?: string
}

/**
 * Start video extension - extends an existing video with more content
 * The video must be stored in GCS to be used as a reference
 */
export async function startVideoExtension(request: VideoExtensionRequest): Promise<string> {
  const accessToken = await getAccessToken()

  const endpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL}:predictLongRunning`

  // Build instance with video reference for extension
  const instance: Record<string, unknown> = {
    prompt: request.prompt,
    video: {
      gcsUri: request.sourceVideoGcsUri,
      mimeType: 'video/mp4',
    },
  }

  const body = {
    instances: [instance],
    parameters: {
      aspectRatio: request.aspectRatio || '16:9',
      sampleCount: 1,
      durationSeconds: request.durationSeconds || 8,
      personGeneration: 'allow_adult',
      generateAudio: true,
    },
  }

  console.log(`[Veo Extension] Starting extension from ${request.sourceVideoGcsUri}`)

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
    console.error('Veo extension API error:', error)
    throw new Error(`Veo extension API error: ${response.status} - ${error}`)
  }

  const result = await response.json()

  if (!result.name) {
    throw new Error('No operation name returned from Veo extension API')
  }

  console.log(`[Veo Extension] Started: ${result.name}`)
  return result.name
}

/**
 * Wait for video extension to complete
 */
export async function waitForVideoExtension(
  operationName: string,
  maxWaitMs: number = 600000,
  pollIntervalMs: number = 15000
): Promise<VideoExtensionResult> {
  const startTime = Date.now()

  while (Date.now() - startTime < maxWaitMs) {
    const result = await pollVideoGeneration(operationName)

    if (result.done) {
      return {
        operationName,
        done: true,
        videoUrl: result.videoUrl,
        videoBase64: result.videoBase64,
        error: result.error,
      }
    }

    await new Promise(resolve => setTimeout(resolve, pollIntervalMs))
  }

  return {
    operationName,
    done: false,
    error: 'Video extension timed out',
  }
}

/**
 * Build an extension chain - extends a video multiple times for longer content
 * Each hop adds ~5-8 seconds
 *
 * @param initialVideoGcsUri - GCS URI of the starting video
 * @param prompts - Array of prompts for each extension hop
 * @param uploadToGcs - Function to upload video buffer to GCS and return URI
 */
export async function buildExtensionChain(
  initialVideoGcsUri: string,
  prompts: string[],
  uploadToGcs: (videoBuffer: Buffer, fileName: string) => Promise<string>
): Promise<{ finalVideoGcsUri: string; hopCount: number }> {
  let currentVideoUri = initialVideoGcsUri
  let hopCount = 0

  for (const prompt of prompts) {
    console.log(`[Extension Chain] Hop ${hopCount + 1}/${prompts.length}: ${prompt.substring(0, 50)}...`)

    // Start extension
    const operationName = await startVideoExtension({
      prompt,
      sourceVideoGcsUri: currentVideoUri,
      durationSeconds: 8,
    })

    // Wait for completion
    const result = await waitForVideoExtension(operationName)

    if (result.error || !result.videoBase64) {
      throw new Error(`Extension hop ${hopCount + 1} failed: ${result.error || 'No video returned'}`)
    }

    // Upload the extended video to GCS for the next hop
    const videoBuffer = Buffer.from(result.videoBase64, 'base64')
    const fileName = `extension-hop-${hopCount + 1}-${Date.now()}.mp4`
    currentVideoUri = await uploadToGcs(videoBuffer, fileName)

    hopCount++
    console.log(`[Extension Chain] Hop ${hopCount} complete: ${currentVideoUri}`)
  }

  return {
    finalVideoGcsUri: currentVideoUri,
    hopCount,
  }
}

/**
 * Start video generation with output to GCS
 * Required for video extension (extension requires GCS URI as input)
 */
export async function startVideoGenerationToGcs(
  request: VideoGenerationRequest,
  outputGcsUri: string
): Promise<string> {
  const accessToken = await getAccessToken()

  const endpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL}:predictLongRunning`

  const instance: Record<string, unknown> = {
    prompt: request.prompt,
  }

  if (request.imageBase64 && request.imageMimeType) {
    instance.image = {
      bytesBase64Encoded: request.imageBase64,
      mimeType: request.imageMimeType,
    }
  }

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
      generateAudio: true,
      storageUri: outputGcsUri, // Output directly to GCS
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
    throw new Error(`Veo API error (GCS output): ${response.status} - ${error}`)
  }

  const result = await response.json()

  if (!result.name) {
    throw new Error('No operation name returned from Veo API (GCS output)')
  }

  return result.name
}
