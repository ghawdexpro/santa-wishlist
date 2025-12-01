import { NextRequest, NextResponse } from 'next/server'
import { GoogleAuth } from 'google-auth-library'
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
- Pixar/Disney-like quality, appealing to children
- Suitable for premium children's video product
- Warm, magical lighting
- Slight sparkle/magical dust around the character
- Clean solid dark background for easy compositing

TECHNICAL:
- Full body shot showing entire character
- Clear details for reference purposes
- Consistent with premium Polish Christmas aesthetic
- No text or watermarks`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, imageBase64 } = body

    if (action === 'save' && imageBase64) {
      // Save the approved image
      const outputPath = join(process.cwd(), 'public', 'assets', 'elf-reference.png')
      const buffer = Buffer.from(imageBase64, 'base64')
      writeFileSync(outputPath, buffer)

      return NextResponse.json({
        success: true,
        message: 'Elf reference saved successfully',
        path: 'public/assets/elf-reference.png',
      })
    }

    if (action === 'generate') {
      console.log('[GenerateElf] Starting elf reference generation...')

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
            aspectRatio: '1:1',
          },
        },
      }

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
        console.error('[GenerateElf] API Error:', error)
        return NextResponse.json(
          { error: `NanoBanana API error: ${response.status}` },
          { status: 500 }
        )
      }

      const result = (await response.json()) as any
      const imageData = result.candidates?.[0]?.content?.parts?.find(
        (p: any) => p.inlineData
      )?.inlineData?.data

      if (!imageData) {
        return NextResponse.json(
          { error: 'No image generated from API' },
          { status: 500 }
        )
      }

      console.log('[GenerateElf] Successfully generated elf reference image')

      return NextResponse.json({
        success: true,
        imageBase64: imageData,
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('[GenerateElf] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
