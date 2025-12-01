import { NextResponse } from 'next/server'

/**
 * HeyGen Streaming Avatar Token Endpoint
 *
 * Creates a session token for the HeyGen Streaming Avatar SDK.
 * Each token is single-use and must be generated per session.
 */
export async function POST() {
  try {
    const apiKey = process.env.HEYGEN_API_KEY

    if (!apiKey) {
      console.error('HEYGEN_API_KEY not configured')
      return NextResponse.json(
        { error: 'HeyGen API not configured' },
        { status: 500 }
      )
    }

    const response = await fetch('https://api.heygen.com/v1/streaming.create_token', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
      },
    })

    const data = await response.json()

    if (data.error) {
      console.error('HeyGen token error:', data.error)
      return NextResponse.json(
        { error: data.error.message || 'Failed to create token' },
        { status: 400 }
      )
    }

    return NextResponse.json({ token: data.data.token })
  } catch (error) {
    console.error('HeyGen token error:', error)
    return NextResponse.json(
      { error: 'Failed to create streaming token' },
      { status: 500 }
    )
  }
}

// Also support GET for simpler client calls
export async function GET() {
  return POST()
}
