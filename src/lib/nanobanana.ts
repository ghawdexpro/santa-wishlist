/**
 * NanoBanana Pro - Image Generation via Vertex AI
 *
 * Models:
 * - gemini-2.5-flash-image (Fast, $0.039/image, max 1024px)
 * - gemini-3-pro-image-preview (Advanced, $0.14-0.24/image, max 4K, needs location=global)
 *
 * Documentation: docs/NANOBANANA-BIBLE.md
 */

import { GoogleAuth } from 'google-auth-library'

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'primal-turbine-478412-k9'
const DEFAULT_LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'

// Model IDs
const MODEL_FLASH = 'gemini-2.5-flash-image'
const MODEL_PRO = 'gemini-3-pro-image-preview'

// Supported aspect ratios
export type AspectRatio = '1:1' | '16:9' | '9:16' | '3:2' | '2:3' | '3:4' | '4:3' | '4:5' | '5:4' | '21:9'

export interface ImageGenerationConfig {
  prompt: string
  model?: 'flash' | 'pro'
  aspectRatio?: AspectRatio
  inputImages?: Array<{
    base64: string
    mimeType: string
  }>
}

export interface ImageGenerationResult {
  text?: string
  images: Array<{
    base64: string
    mimeType: string
  }>
}

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

/**
 * Generate images using NanoBanana (Gemini Image models)
 */
export async function generateImage(config: ImageGenerationConfig): Promise<ImageGenerationResult> {
  const accessToken = await getAccessToken()

  // Model selection
  const model = config.model === 'pro' ? MODEL_PRO : MODEL_FLASH

  // Location - Pro REQUIRES global
  const location = config.model === 'pro' ? 'global' : DEFAULT_LOCATION

  // Build endpoint
  const baseUrl = location === 'global'
    ? 'https://aiplatform.googleapis.com/v1'
    : `https://${location}-aiplatform.googleapis.com/v1`

  const endpoint = `${baseUrl}/projects/${PROJECT_ID}/locations/${location}/publishers/google/models/${model}:generateContent`

  // Build parts array - images first, then text
  const parts: Array<Record<string, unknown>> = []

  // Add input images first (if any)
  if (config.inputImages) {
    for (const img of config.inputImages) {
      parts.push({
        inlineData: {
          mimeType: img.mimeType,
          data: img.base64,
        }
      })
    }
  }

  // Add text prompt
  parts.push({ text: config.prompt })

  const body = {
    contents: [{
      role: 'user',
      parts,
    }],
    generationConfig: {
      responseModalities: ['TEXT', 'IMAGE'],
      ...(config.aspectRatio && {
        imageConfig: {
          aspectRatio: config.aspectRatio,
        }
      }),
    },
  }

  console.log(`NanoBanana: Generating image with ${model} at ${location}`)

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
    console.error('NanoBanana API error:', error)
    throw new Error(`NanoBanana API error: ${response.status} - ${error}`)
  }

  const result = await response.json()

  // Parse response
  const output: ImageGenerationResult = { images: [] }

  const candidate = result.candidates?.[0]
  if (candidate?.content?.parts) {
    for (const part of candidate.content.parts) {
      if (part.text) {
        output.text = part.text
      } else if (part.inlineData) {
        output.images.push({
          base64: part.inlineData.data,
          mimeType: part.inlineData.mimeType || 'image/png',
        })
      }
    }
  }

  console.log(`NanoBanana: Generated ${output.images.length} image(s)`)

  return output
}

/**
 * Simple text-to-image generation
 */
export async function textToImage(
  prompt: string,
  aspectRatio: AspectRatio = '16:9',
  model: 'flash' | 'pro' = 'flash'
): Promise<ImageGenerationResult> {
  return generateImage({ prompt, aspectRatio, model })
}

/**
 * Edit an existing image with a text prompt
 */
export async function editImage(
  imageBase64: string,
  imageMimeType: string,
  editPrompt: string,
  model: 'flash' | 'pro' = 'flash'
): Promise<ImageGenerationResult> {
  return generateImage({
    prompt: editPrompt,
    inputImages: [{ base64: imageBase64, mimeType: imageMimeType }],
    model,
  })
}

/**
 * Composite multiple images with a text prompt
 * Note: Pro model supports up to 14 images, Flash supports up to 3
 */
export async function compositeImages(
  images: Array<{ base64: string; mimeType: string }>,
  prompt: string,
  aspectRatio: AspectRatio = '16:9'
): Promise<ImageGenerationResult> {
  // Use Pro model for compositing as it handles multiple images better
  return generateImage({
    prompt,
    inputImages: images,
    model: images.length > 3 ? 'pro' : 'flash',
    aspectRatio,
  })
}

/**
 * Make a child's photo "come alive" - composite with magical effects
 * Used for Scene 4: Photo Comes Alive
 */
export async function makePhotoMagical(
  childPhotoBase64: string,
  childPhotoMimeType: string,
  childName: string
): Promise<ImageGenerationResult> {
  const magicalPrompt = `Transform this child's photo into a magical scene:
The photo should appear on an ornate golden magical book page.
The photo is surrounded by a glowing golden magical frame with sparkles.
The frame pulses with warm light and golden particles swirl around it.
The image gains depth and dimension, like it's coming alive.
Cinematic quality, warm lighting, photorealistic magical effects.
The child in the photo is named ${childName}.`

  return generateImage({
    prompt: magicalPrompt,
    inputImages: [{ base64: childPhotoBase64, mimeType: childPhotoMimeType }],
    model: 'pro', // Pro for better quality on this key personalization
    aspectRatio: '16:9',
  })
}

/**
 * Generate a keyframe image for video generation
 * Can be used as input to Veo for image-to-video
 */
export async function generateKeyframe(
  prompt: string,
  aspectRatio: AspectRatio = '16:9'
): Promise<{ base64: string; mimeType: string } | null> {
  const result = await textToImage(prompt, aspectRatio, 'flash')

  if (result.images.length > 0) {
    return result.images[0]
  }

  return null
}

/**
 * Generate with retry logic
 */
export async function generateWithRetry(
  config: ImageGenerationConfig,
  maxRetries = 3
): Promise<ImageGenerationResult> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await generateImage(config)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'

      // Don't retry client errors (4xx)
      if (message.includes('400') || message.includes('403') || message.includes('401')) {
        throw error
      }

      // Retry server errors with exponential backoff
      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000
        console.log(`NanoBanana: Retry ${attempt + 1}/${maxRetries} after ${delay}ms`)
        await new Promise(r => setTimeout(r, delay))
      } else {
        throw error
      }
    }
  }
  throw new Error('NanoBanana: Max retries exceeded')
}
