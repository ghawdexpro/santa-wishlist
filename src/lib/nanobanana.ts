/**
 * Nano Banana Pro (Gemini 3 Pro Image) Integration
 * Generates high-quality keyframe images for video scenes
 */

import { GoogleAuth } from 'google-auth-library'
import * as fs from 'fs/promises'

const MODEL = 'gemini-3-pro-image' // Nano Banana Pro
const LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT

// Initialize auth
let authClient: GoogleAuth | null = null

async function getAuthClient() {
  if (authClient) return authClient

  // Use service account from environment
  const credsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
  if (!credsJson) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON not set')
  }

  const creds = JSON.parse(credsJson)

  authClient = new GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  })

  return authClient
}

async function getAccessToken() {
  const auth = await getAuthClient()
  const client = auth.getClient()
  const { token } = await client.getAccessToken()
  if (!token) throw new Error('Failed to get access token')
  return token
}

export interface KeyframeRequest {
  prompt: string
  sceneNumber: number
  width?: number
  height?: number
  referenceImage?: {
    base64: string
    mimeType: 'image/jpeg' | 'image/png' | 'image/webp'
  }
}

export interface KeyframeResult {
  sceneNumber: number
  imageBase64: string
  mimeType: string
}

/**
 * Generate a single keyframe image using Nano Banana Pro
 * Supports both text-only and image-to-image (with reference image) generation
 */
export async function generateKeyframe(request: KeyframeRequest): Promise<KeyframeResult> {
  console.log(
    `[NanoBanana] Generating keyframe for scene ${request.sceneNumber}: "${request.prompt.substring(0, 50)}..."`
  )

  const accessToken = await getAccessToken()

  // If reference image provided, use generateContent API (supports image-to-image)
  if (request.referenceImage) {
    return generateKeyframeWithReference(request, accessToken)
  }

  // Otherwise use text-only generation
  return generateKeyframeTextOnly(request, accessToken)
}

/**
 * Generate keyframe with reference image using generateContent API
 */
async function generateKeyframeWithReference(
  request: KeyframeRequest,
  accessToken: string
): Promise<KeyframeResult> {
  const endpoint = `https://aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/global/publishers/google/models/gemini-3-pro-image-preview:generateContent`

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            // Reference image FIRST
            {
              inlineData: {
                mimeType: request.referenceImage!.mimeType,
                data: request.referenceImage!.base64,
              },
            },
            // Text prompt AFTER
            {
              text: request.prompt,
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
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`NanoBanana image-to-image error: ${response.status} ${error}`)
  }

  const result = (await response.json()) as any

  const imageData =
    result.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData)?.inlineData?.data

  if (!imageData) {
    throw new Error('No image generated from NanoBanana API')
  }

  console.log(`[NanoBanana] Generated keyframe for scene ${request.sceneNumber} with reference image`)

  return {
    sceneNumber: request.sceneNumber,
    imageBase64: imageData,
    mimeType: 'image/png',
  }
}

/**
 * Generate keyframe text-only using older endpoint
 */
async function generateKeyframeTextOnly(
  request: KeyframeRequest,
  accessToken: string
): Promise<KeyframeResult> {
  const response = await fetch(
    `https://${request.location || 'us-central1'}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${request.location || 'us-central1'}/endpoints/generic_model:rawPredict`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: `projects/${PROJECT_ID}/locations/${request.location || 'us-central1'}/models/${MODEL}`,
        instances: [
          {
            prompt: request.prompt,
          },
        ],
        parameters: {
          width: request.width || 1024,
          height: request.height || 576,
          aspect_ratio: '16:9',
        },
      }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`NanoBanana text-only error: ${response.status} ${error}`)
  }

  const result = (await response.json()) as any

  if (!result.predictions || !result.predictions[0]) {
    throw new Error('No image generated from NanoBanana API')
  }

  const imageData = result.predictions[0].bytesBase64Encoded || result.predictions[0].image_base64

  console.log(`[NanoBanana] Generated keyframe for scene ${request.sceneNumber}`)

  return {
    sceneNumber: request.sceneNumber,
    imageBase64: imageData,
    mimeType: 'image/png',
  }
}

/**
 * Generate multiple keyframes in parallel
 */
export async function generateAllKeyframes(requests: KeyframeRequest[]): Promise<KeyframeResult[]> {
  console.log(`[NanoBanana] Generating ${requests.length} keyframes...`)

  const results = await Promise.all(requests.map((req) => generateKeyframe(req)))

  console.log(`[NanoBanana] Successfully generated ${results.length} keyframes`)

  return results
}
