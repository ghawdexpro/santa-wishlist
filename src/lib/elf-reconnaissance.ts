/**
 * Elf Reconnaissance: Elves Checking the Room
 * Uses NanoBanana Pro to composite Santa's elves into the child's room photo
 * Creates magical "scouting" scenes before Santa's visit
 */

import { GoogleAuth } from 'google-auth-library'
import fetch from 'node-fetch'
import { startVideoGeneration } from './veo'
import { getElfReferenceImage, elfReferenceImageExists } from './style-bible-server'

const MODEL = 'gemini-3-pro-image-preview' // Pro model for multi-image support
const LOCATION = 'global' // CRITICAL: Pro model requires global location
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'primal-turbine-478412-k9'

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

export type ElfSceneVariant = 'peeking' | 'inspecting' | 'reporting'

export interface ElfReconRequest {
  childName: string
  roomPhotoBase64: string
  roomPhotoMimeType: 'image/jpeg' | 'image/png' | 'image/webp'
  variant: ElfSceneVariant
}

export interface ElfReconResult {
  sceneId: string // e.g., 'elf-peeking', 'elf-inspecting', 'elf-reporting'
  variant: ElfSceneVariant
  childName: string
  imageBase64: string
  mimeType: 'image/png'
  generatedAt: string
}

/**
 * Build prompts for different elf reconnaissance variants
 */
function buildElfReconPrompt(childName: string, variant: ElfSceneVariant, hasElfReference: boolean = false): string {
  const elfReferenceNote = hasElfReference
    ? `\nELF REFERENCE IMAGE PROVIDED:
- The SECOND image shows our official elf character design
- Use this elf's appearance (face, outfit, style) for consistency
- Match the elf's proportions and color scheme exactly`
    : ''

  const baseContext = `CINEMATIC VFX INSTRUCTION - Elf Reconnaissance Scene${elfReferenceNote}

CONTEXT:
You are creating a magical moment from "Magia Świąt" - a premium personalized Santa video for the Polish market.
This scene shows Santa's elves secretly checking out ${childName}'s home before Christmas Eve.
The reference image is the ACTUAL room/Christmas tree from the child's home - this MUST be preserved and recognizable.

CRITICAL RULES:
- The reference image (room photo) MUST remain the main background - DO NOT replace it
- Add elves INTO the existing scene, not a new scene
- The room/tree should be instantly recognizable to the child
- Elves should look like they're ACTUALLY IN the room
- Warm, magical lighting that enhances but doesn't obscure the room
- Premium cinematic quality (259+ PLN product)

ELF APPEARANCE:
- Classic Christmas elves with pointy ears and festive outfits
- Red and green clothing with golden accents
- Friendly, mischievous expressions
- About 60-80cm tall (child-sized)
- Magical sparkles around them`

  const variants: Record<ElfSceneVariant, string> = {
    peeking: `${baseContext}

SPECIFIC SCENE: "Elf Peeking" 👀
- ONE elf peeking out from behind the Christmas tree
- Curious, excited expression - like they just discovered the place
- Only head and one hand visible, rest hidden behind tree
- Eyes wide with wonder, slight smile
- Magical dust particles floating around
- The elf is clearly checking if the coast is clear

MOOD: Sneaky, playful, excited anticipation
CAPTION (if visible): "Psst... to tutaj mieszka ${childName}!"`,

    inspecting: `${baseContext}

SPECIFIC SCENE: "Elves Inspecting Gifts" 🎁
- TWO elves near the Christmas tree or presents
- One elf with a magical glowing clipboard/scroll taking notes
- Second elf pointing at ornaments or gifts with approval
- Both look professional but friendly - like official inspectors
- Magical measuring tape or sparkly tools visible
- They're clearly doing important Christmas preparation work

MOOD: Busy, professional, magical efficiency
CAPTION (if visible): "Sprawdzamy czy wszystko gotowe dla ${childName}!"`,

    reporting: `${baseContext}

SPECIFIC SCENE: "Elf Reporting to North Pole" 📝
- ONE elf in the foreground with a magical glowing book/tablet
- The book shows a golden checkmark or thumbs up symbol
- Elf looking pleased, giving subtle thumbs up
- Magical communication sparkles rising up (like sending to Santa)
- The room beautifully visible in background
- Elf's expression says "This home is APPROVED for Santa's visit"

MOOD: Satisfied, accomplished, magical connection to North Pole
CAPTION (if visible): "Melduję Mikołajowi: ${childName} - dom sprawdzony! ✓"`,
  }

  return `${variants[variant]}

TECHNICAL REQUIREMENTS:
- Aspect ratio: 16:9 (1920x1080)
- Cinematic quality with depth of field
- Warm Christmas lighting (golden, amber tones)
- Subtle magical particles/sparkles
- The original room MUST be clearly recognizable
- Elves seamlessly composited into the real environment`
}

/**
 * Generate a single elf reconnaissance keyframe
 */
export async function generateElfReconKeyframe(
  request: ElfReconRequest
): Promise<ElfReconResult> {
  console.log(`[ElfRecon] Generating ${request.variant} scene for ${request.childName}`)

  const accessToken = await getAccessToken()
  const hasElfRef = elfReferenceImageExists()
  const prompt = buildElfReconPrompt(request.childName, request.variant, hasElfRef)

  const endpoint = `https://aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL}:generateContent`

  // Build parts array with room photo and optional elf reference
  const parts: any[] = [
    // Room photo FIRST (main background reference)
    {
      inlineData: {
        mimeType: request.roomPhotoMimeType,
        data: request.roomPhotoBase64,
      },
    },
  ]

  // Add elf reference image if available (for consistent elf appearance)
  if (hasElfRef) {
    const elfRef = getElfReferenceImage()
    parts.push({
      inlineData: {
        mimeType: elfRef.mimeType,
        data: elfRef.base64,
      },
    })
    console.log('[ElfRecon] Using elf reference image for consistent appearance')
  }

  // Text prompt LAST
  parts.push({ text: prompt })

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts,
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
        Authorization: `Bearer ${accessToken}`,
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

    const imageData = result.candidates?.[0]?.content?.parts?.find(
      (p: any) => p.inlineData
    )?.inlineData?.data

    if (!imageData) {
      throw new Error('No image generated from NanoBanana API')
    }

    console.log(`[ElfRecon] Successfully generated ${request.variant} for ${request.childName}`)

    return {
      sceneId: `elf-${request.variant}`,
      variant: request.variant,
      childName: request.childName,
      imageBase64: imageData,
      mimeType: 'image/png',
      generatedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error(`[ElfRecon] Failed to generate ${request.variant}:`, error)
    throw error
  }
}

/**
 * Download room photo from URL and convert to base64
 */
export async function downloadAndEncodeRoomPhoto(photoUrl: string): Promise<{
  base64: string
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp'
}> {
  try {
    console.log(`[ElfRecon] Downloading room photo from: ${photoUrl}`)

    const response = await fetch(photoUrl)

    if (!response.ok) {
      throw new Error(`Failed to download room photo: ${response.status}`)
    }

    const buffer = await response.buffer()
    const base64 = Buffer.from(buffer).toString('base64')

    const contentType = response.headers.get('content-type') || 'image/jpeg'
    let mimeType: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg'

    if (contentType.includes('png')) {
      mimeType = 'image/png'
    } else if (contentType.includes('webp')) {
      mimeType = 'image/webp'
    }

    console.log(`[ElfRecon] Room photo downloaded and encoded: ${mimeType}`)

    return { base64, mimeType }
  } catch (error) {
    console.error('[ElfRecon] Failed to download room photo:', error)
    throw error
  }
}

/**
 * Animation prompts for each elf scene variant
 */
const elfAnimationPrompts: Record<ElfSceneVariant, string> = {
  peeking: `A Christmas elf peeks out from behind a decorated Christmas tree.
The elf's eyes dart around curiously, then shows an excited smile.
Magical sparkles float gently around the elf.
Subtle, sneaky movements. Warm Christmas lighting.
Premium cinematic quality, smooth animation.`,

  inspecting: `Two Christmas elves inspect the room with magical tools.
One elf writes on a glowing clipboard while the other points at decorations.
They nod approvingly at each other.
Magical particles swirl around their inspection tools.
Busy, efficient movements. Warm golden lighting.
Premium cinematic quality.`,

  reporting: `A Christmas elf holds up a magical glowing book showing approval.
Golden sparkles rise from the book, sending a message to the North Pole.
The elf gives a satisfied thumbs up and smiles.
Magical communication particles float upward.
Accomplished, happy mood. Warm Christmas atmosphere.
Premium cinematic quality.`,
}

/**
 * Generate elf reconnaissance video for a single variant
 * Returns Veo operation name for polling
 */
export async function generateElfReconVideo(
  childName: string,
  roomPhotoUrl: string,
  variant: ElfSceneVariant
): Promise<string> {
  console.log(`[ElfRecon] Starting ${variant} video generation for ${childName}`)

  // Download and encode the room photo
  const { base64, mimeType } = await downloadAndEncodeRoomPhoto(roomPhotoUrl)

  // Generate the keyframe
  const keyframe = await generateElfReconKeyframe({
    childName,
    roomPhotoBase64: base64,
    roomPhotoMimeType: mimeType,
    variant,
  })

  // Animate with Veo (6 seconds for elf scenes)
  const operationName = await startVideoGeneration({
    prompt: elfAnimationPrompts[variant],
    imageBase64: keyframe.imageBase64,
    imageMimeType: keyframe.mimeType,
    durationSeconds: 6,
    aspectRatio: '16:9',
  })

  console.log(`[ElfRecon] Started Veo animation for ${variant}: ${operationName}`)

  return operationName
}

/**
 * Generate all elf reconnaissance scenes for an order
 * Returns array of Veo operation names
 */
export async function generateAllElfReconScenes(
  childName: string,
  roomPhotoUrl: string,
  variants: ElfSceneVariant[] = ['peeking', 'inspecting', 'reporting']
): Promise<{ variant: ElfSceneVariant; operationName: string }[]> {
  console.log(`[ElfRecon] Generating ${variants.length} elf scenes for ${childName}`)

  const results: { variant: ElfSceneVariant; operationName: string }[] = []

  // Download photo once, reuse for all variants
  const { base64, mimeType } = await downloadAndEncodeRoomPhoto(roomPhotoUrl)

  for (const variant of variants) {
    try {
      // Generate keyframe
      const keyframe = await generateElfReconKeyframe({
        childName,
        roomPhotoBase64: base64,
        roomPhotoMimeType: mimeType,
        variant,
      })

      // Start video generation
      const operationName = await startVideoGeneration({
        prompt: elfAnimationPrompts[variant],
        imageBase64: keyframe.imageBase64,
        imageMimeType: keyframe.mimeType,
        durationSeconds: 6,
        aspectRatio: '16:9',
      })

      results.push({ variant, operationName })
      console.log(`[ElfRecon] Started ${variant} video: ${operationName}`)
    } catch (error) {
      console.error(`[ElfRecon] Failed to generate ${variant}:`, error)
      // Continue with other variants even if one fails
    }
  }

  console.log(`[ElfRecon] Successfully started ${results.length}/${variants.length} elf scenes`)

  return results
}

/**
 * Get recommended elf scenes based on tier
 */
export function getElfScenesForTier(tier: 'basic' | 'standard' | 'premium'): ElfSceneVariant[] {
  switch (tier) {
    case 'basic':
      return ['peeking'] // 1 scene
    case 'standard':
      return ['peeking', 'reporting'] // 2 scenes
    case 'premium':
      return ['peeking', 'inspecting', 'reporting'] // All 3 scenes
    default:
      return ['peeking']
  }
}
