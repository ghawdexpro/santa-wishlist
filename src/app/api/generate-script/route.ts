import { generateSantaScript } from '@/lib/gemini'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      childName,
      childAge,
      goodBehavior,
      thingToImprove,
      thingToLearn,
      customMessage,
    } = body

    // Validate required fields
    if (!childName || !childAge || !goodBehavior || !thingToImprove || !thingToLearn) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if Google Cloud is configured
    if (!process.env.GOOGLE_CLOUD_PROJECT && !process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
      return NextResponse.json(
        { error: 'Google Cloud not configured' },
        { status: 503 }
      )
    }

    const script = await generateSantaScript({
      childName,
      childAge: parseInt(childAge, 10),
      goodBehavior,
      thingToImprove,
      thingToLearn,
      customMessage,
    })

    return NextResponse.json({ script })
  } catch (error) {
    console.error('Script generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate script. Please try again.' },
      { status: 500 }
    )
  }
}
