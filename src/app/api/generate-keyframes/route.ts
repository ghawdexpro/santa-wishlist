import { generateScenePrompts, generateAllKeyframes } from '@/lib/imagen'
import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 300 // 5 minutes for keyframe generation

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { scenes, childName } = body

    if (!scenes || !Array.isArray(scenes) || scenes.length === 0) {
      return NextResponse.json(
        { error: 'Missing or invalid scenes array' },
        { status: 400 }
      )
    }

    if (!childName) {
      return NextResponse.json(
        { error: 'Missing childName' },
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

    // Generate prompts for each scene
    const scenePrompts = generateScenePrompts(scenes, childName)

    // Generate keyframes for all scenes
    const keyframes = await generateAllKeyframes(scenePrompts)

    // Return keyframes as base64 with scene numbers
    return NextResponse.json({
      keyframes: keyframes.map(k => ({
        sceneNumber: k.sceneNumber,
        imageDataUrl: `data:${k.mimeType};base64,${k.imageBase64}`,
      })),
    })
  } catch (error) {
    console.error('Keyframe generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate keyframes. Please try again.' },
      { status: 500 }
    )
  }
}
