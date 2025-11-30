import { NextRequest, NextResponse } from 'next/server'
import { GoogleAuth } from 'google-auth-library'

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'primal-turbine-478412-k9'

interface ScriptScene {
  sceneNumber: number
  title: string
  visualDescription: string
  isPremade?: boolean
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

async function generateKeyframeImage(prompt: string, accessToken: string): Promise<string> {
  const endpoint = `https://aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/global/publishers/google/models/gemini-2.0-flash-preview-image-generation:generateContent`

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
            {
              text: `Generate a photorealistic Christmas scene image: ${prompt}.
              Style: Cinematic, warm lighting, magical atmosphere, snow, Christmas decorations.
              The image should be suitable for a children's Santa video.`,
            },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Keyframe generation error:', error)
    throw new Error(`Failed to generate keyframe: ${response.status}`)
  }

  const result = await response.json() as any

  // Find the image in the response
  const imagePart = result.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData)

  if (imagePart?.inlineData?.data) {
    return `data:${imagePart.inlineData.mimeType || 'image/png'};base64,${imagePart.inlineData.data}`
  }

  throw new Error('No image generated')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { scenes, childName } = body as { scenes: ScriptScene[], childName: string }

    if (!scenes || !Array.isArray(scenes)) {
      return NextResponse.json({ error: 'Scenes array required' }, { status: 400 })
    }

    console.log(`[Keyframes] Generating keyframes for ${scenes.length} scenes...`)

    const accessToken = await getAccessToken()

    // Generate keyframes for each scene (limit concurrent requests)
    const keyframes = []

    for (const scene of scenes) {
      try {
        console.log(`[Keyframes] Generating scene ${scene.sceneNumber}: ${scene.title}`)

        const prompt = scene.visualDescription || `Santa Claus in ${scene.title} scene for ${childName}`
        const imageDataUrl = await generateKeyframeImage(prompt, accessToken)

        keyframes.push({
          sceneNumber: scene.sceneNumber,
          imageDataUrl,
        })

        console.log(`[Keyframes] Scene ${scene.sceneNumber} done`)
      } catch (err) {
        console.error(`[Keyframes] Failed to generate scene ${scene.sceneNumber}:`, err)
        // Continue with other scenes even if one fails
        keyframes.push({
          sceneNumber: scene.sceneNumber,
          imageDataUrl: '', // Empty placeholder
        })
      }
    }

    console.log(`[Keyframes] Generated ${keyframes.filter(k => k.imageDataUrl).length}/${scenes.length} keyframes`)

    return NextResponse.json({ keyframes })
  } catch (error) {
    console.error('[Keyframes] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate keyframes' },
      { status: 500 }
    )
  }
}
