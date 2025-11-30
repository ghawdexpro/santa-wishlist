/**
 * Scene 4: Photo Comes Alive
 * Uses NanoBanana Pro with reference images to composite child's photo into magical book scene
 * Then animates the keyframe with Veo to create the final video
 */

import { GoogleAuth } from 'google-auth-library'
import fetch from 'node-fetch'
import { startVideoGeneration } from './veo'

const MODEL = 'gemini-3-pro-image-preview' // Pro model for multi-image support
const LOCATION = 'global' // CRITICAL: Pro model requires global location
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'primal-turbine-478412-k9'

async function getAccessToken(): Promise<string> {
  // Check for service account JSON (for Railway deployment)
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

  // Use Application Default Credentials
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  })
  const client = await auth.getClient()
  const token = await client.getAccessToken()
  return token.token || ''
}

export interface PhotoAliveRequest {
  childName: string
  photoBase64: string
  photoMimeType: 'image/jpeg' | 'image/png' | 'image/webp'
}

export interface PhotoAliveResult {
  sceneNumber: 4
  childName: string
  imageBase64: string
  mimeType: 'image/png'
  generatedAt: string
}

/**
 * Build scene 4 prompt for NanoBanana with photo reference
 */
function buildScene4Prompt(childName: string): string {
  return `CINEMATIC VFX INSTRUCTION - Scene 4: Photo Comes Alive

CONTEXT:
You are creating a magical moment from "The Santa Experience" - a premium personalized Santa video.
This is Scene 4, where the child's own photograph comes alive with magic in Santa's enchanted book.

VISUAL ELEMENTS TO GENERATE:
1. The book page with the reference image (child's photo) integrated beautifully
2. The photo should be framed in an ORNATE GOLDEN MAGICAL BORDER
3. Magical sparkles and light effects surrounding the framed photo
4. The book setting: warm, glowing pages with magical aura
5. Perfect cinematic quality suitable for a $59+ premium product

SPECIFIC INSTRUCTIONS FOR REFERENCE IMAGE:
- Use the provided reference image as the CENTERPIECE
- Do NOT replace or ignore the reference image
- Frame it elegantly with golden ornaments and magical borders
- Add subtle vignette with warm golden lighting
- The photo should feel like it's IN the magical book, not on top of it

MOOD & TONE:
- Pure magic and wonder
- Warm, glowing atmosphere
- Personal and touching moment
- "THAT'S ME!!!" recognition moment for the child

TECHNICAL REQUIREMENTS:
- Aspect ratio: 16:9 (1920x1080 or equivalent)
- Cinematic quality
- Golden and warm color palette
- Sparkles and particle effects
- Depth and dimension

SCENE TEXT (if visible):
Santa's voice caption: "Ah! There you are, ${childName}! Your photo comes alive!"

Generate a stunning, magical moment where ${childName}'s photo is beautifully integrated into Santa's magical book.`
}

/**
 * Generate Scene 4 keyframe with photo reference
 */
export async function generateScene4KeyframeWithPhoto(
  request: PhotoAliveRequest
): Promise<PhotoAliveResult> {
  console.log(`[PhotoAlive] Generating Scene 4 for ${request.childName}`)

  const accessToken = await getAccessToken()

  // Build the API request with reference image
  const prompt = buildScene4Prompt(request.childName)

  const endpoint = `https://aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL}:generateContent`

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [
          // Reference image FIRST
          {
            inlineData: {
              mimeType: request.photoMimeType,
              data: request.photoBase64,
            },
          },
          // Text prompt AFTER
          {
            text: prompt,
          },
        ],
      },
    ],
    generationConfig: {
      responseModalities: ['IMAGE'],
      imageConfig: {
        aspectRatio: '16:9',
      },
    },
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('NanoBanana API error:', error)
      throw new Error(`NanoBanana API error: ${response.status} - ${error}`)
    }

    const result = (await response.json()) as any

    // Extract image from response
    const imageData =
      result.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData)?.inlineData
        ?.data

    if (!imageData) {
      throw new Error('No image generated from NanoBanana API')
    }

    console.log(`[PhotoAlive] Successfully generated Scene 4 for ${request.childName}`)

    return {
      sceneNumber: 4,
      childName: request.childName,
      imageBase64: imageData,
      mimeType: 'image/png',
      generatedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error(`[PhotoAlive] Failed to generate Scene 4 for ${request.childName}:`, error)
    throw error
  }
}

/**
 * Download photo from URL and convert to base64
 */
export async function downloadAndEncodePhoto(photoUrl: string): Promise<{
  base64: string
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp'
}> {
  try {
    console.log(`[PhotoAlive] Downloading photo from: ${photoUrl}`)

    const response = await fetch(photoUrl)

    if (!response.ok) {
      throw new Error(`Failed to download photo: ${response.status}`)
    }

    const buffer = await response.buffer()
    const base64 = Buffer.from(buffer).toString('base64')

    // Detect MIME type from URL or content-type
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    let mimeType: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg'

    if (contentType.includes('png')) {
      mimeType = 'image/png'
    } else if (contentType.includes('webp')) {
      mimeType = 'image/webp'
    }

    console.log(`[PhotoAlive] Photo downloaded and encoded: ${mimeType}`)

    return { base64, mimeType }
  } catch (error) {
    console.error('[PhotoAlive] Failed to download photo:', error)
    throw error
  }
}

/**
 * Main function: Generate Scene 4 from child info
 * Returns operation name for polling (Veo async generation)
 */
export async function generateScene4ForChild(childData: {
  name: string
  photoUrl: string
}): Promise<string> {
  try {
    console.log(`[PhotoAlive] Generating Scene 4 (Photo Comes Alive) for ${childData.name}`)

    // Download and encode the child's photo
    const { base64, mimeType } = await downloadAndEncodePhoto(childData.photoUrl)

    // Generate the keyframe with photo reference
    const keyframeResult = await generateScene4KeyframeWithPhoto({
      childName: childData.name,
      photoBase64: base64,
      photoMimeType: mimeType,
    })

    // Animate the keyframe with Veo (max 8 seconds)
    const videoPrompt = `The child's photograph comes alive in Santa's magical book with golden border and sparkles.
${childData.name}'s photo is beautifully framed with ornate golden decorations.
Magical sparkles surround the image as it glows with warm light.
Cinematic, magical, warm atmosphere. Premium quality.`

    const operationName = await startVideoGeneration({
      prompt: videoPrompt,
      imageBase64: keyframeResult.imageBase64,
      imageMimeType: keyframeResult.mimeType,
      durationSeconds: 8,
      aspectRatio: '16:9',
    })

    console.log(
      `[PhotoAlive] Successfully started Veo animation for Scene 4 (${childData.name}): ${operationName}`
    )

    return operationName
  } catch (error) {
    console.error(`[PhotoAlive] Failed to generate Scene 4 for ${childData.name}:`, error)
    throw error
  }
}
