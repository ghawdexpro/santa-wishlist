/**
 * Generate Elf Reference Image for consistent elf appearance
 * Run with: npx ts-node scripts/generate-elf-reference.ts
 */

import { GoogleAuth } from 'google-auth-library'
import fetch from 'node-fetch'
import { writeFileSync } from 'fs'
import { join } from 'path'

const MODEL = 'gemini-2.0-flash-preview-image-generation'
const LOCATION = 'us-central1'
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

const ELF_PROMPT = `Generate a reference image of Santa's helper elf for "Magia Świąt" Polish Christmas video product.

ELF CHARACTER DESIGN:
- Classic Christmas elf, friendly and magical
- Height: appears to be about 60-80cm (child-sized)
- Pointy ears with slight pink tips
- Rosy cheeks, bright sparkling eyes
- Warm, friendly smile

OUTFIT:
- Traditional elf costume in rich Christmas colors
- Main color: Deep emerald green velvet tunic
- Accents: Ruby red trim and golden buttons
- Pointed shoes with small bells
- Matching pointed hat with golden tassel
- Brown leather belt with golden buckle

POSE & EXPRESSION:
- Standing in a friendly, welcoming pose
- Slightly turned (3/4 view for better reference)
- One hand raised in a friendly wave
- Expression: Cheerful, mischievous, magical

STYLE:
- High quality, professional character design
- Suitable for premium children's video product
- Warm, magical lighting
- Slight sparkle/magical dust around the character
- Clean background (solid dark green or transparent-friendly)

TECHNICAL:
- Full body shot showing entire character
- Clear details for reference purposes
- Consistent with premium Polish Christmas aesthetic
- No text or watermarks`

async function generateElfReference() {
  console.log('🧝 Generating Elf Reference Image...')

  const accessToken = await getAccessToken()

  const endpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL}:generateContent`

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [{ text: ELF_PROMPT }],
      },
    ],
    generationConfig: {
      responseModalities: ['IMAGE'],
      imageConfig: {
        aspectRatio: '1:1', // Square for reference image
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
      console.error('API Error:', error)
      throw new Error(`API error: ${response.status}`)
    }

    const result = (await response.json()) as any
    const imageData = result.candidates?.[0]?.content?.parts?.find(
      (p: any) => p.inlineData
    )?.inlineData?.data

    if (!imageData) {
      throw new Error('No image generated')
    }

    // Save to public/assets
    const outputPath = join(process.cwd(), 'public', 'assets', 'elf-reference.png')
    const buffer = Buffer.from(imageData, 'base64')
    writeFileSync(outputPath, buffer)

    console.log('✅ Elf reference image saved to:', outputPath)
    console.log('📏 Size:', Math.round(buffer.length / 1024), 'KB')

    return outputPath
  } catch (error) {
    console.error('❌ Failed to generate elf reference:', error)
    throw error
  }
}

// Run
generateElfReference()
  .then(() => {
    console.log('🎄 Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Failed:', error)
    process.exit(1)
  })
