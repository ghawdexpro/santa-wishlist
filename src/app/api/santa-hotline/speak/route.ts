import { NextRequest, NextResponse } from 'next/server'
import { GoogleAuth } from 'google-auth-library'

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text } = body

    if (!text) {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 })
    }

    const accessToken = await getAccessToken()

    // Use Google Cloud Text-to-Speech API
    const endpoint = `https://texttospeech.googleapis.com/v1/text:synthesize`

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'x-goog-user-project': PROJECT_ID,
      },
      body: JSON.stringify({
        input: {
          text: text,
        },
        voice: {
          // Polish male voice - warm and friendly
          languageCode: 'pl-PL',
          name: 'pl-PL-Wavenet-B', // Male voice
          ssmlGender: 'MALE',
        },
        audioConfig: {
          audioEncoding: 'MP3',
          pitch: -2.0, // Slightly lower pitch for Santa
          speakingRate: 0.9, // Slightly slower for warmth
          volumeGainDb: 0.0,
          effectsProfileId: ['headphone-class-device'],
        },
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('[SantaHotline] TTS error:', error)
      return NextResponse.json({ error: 'TTS failed' }, { status: 500 })
    }

    const result = await response.json()
    const audioContent = result.audioContent

    if (!audioContent) {
      return NextResponse.json({ error: 'No audio generated' }, { status: 500 })
    }

    // Convert base64 to binary
    const audioBuffer = Buffer.from(audioContent, 'base64')

    // Return as audio file
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
      },
    })
  } catch (error: any) {
    console.error('[SantaHotline] Speak error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal error' },
      { status: 500 }
    )
  }
}
