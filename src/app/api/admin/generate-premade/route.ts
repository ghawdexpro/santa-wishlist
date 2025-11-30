import { NextRequest, NextResponse } from 'next/server'
import { PREMADE_SCENES } from '@/lib/premade-scenes'
import { startVideoGeneration } from '@/lib/veo'
import { generateKeyframeSimple as generateKeyframe } from '@/lib/nanobanana'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 300 // 5 minutes

// Create admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Simple admin key check (in production, use proper auth)
const ADMIN_KEY = process.env.ADMIN_SECRET_KEY || 'santa-admin-2024'

interface GenerateResult {
  sceneNumber: number
  name: string
  startKeyframeGenerated?: boolean
  endKeyframeGenerated?: boolean
  videoOperationStarted?: boolean
  operationName?: string
  error?: string
}

/**
 * POST /api/admin/generate-premade
 *
 * Generate pre-made scene content using NanoBanana (keyframes) and Veo (video).
 *
 * Body:
 * - adminKey: string (required)
 * - sceneNumbers: number[] (optional, defaults to all)
 * - action: 'keyframe_start' | 'keyframe_end' | 'video' | 'all' (default: 'all')
 * - useKeyframes: boolean (default: true) - whether to pass keyframes to Veo
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      adminKey,
      sceneNumbers,
      action = 'all',
      useKeyframes = true
    } = body

    // Verify admin key
    if (adminKey !== ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Determine which scenes to generate
    const scenesToGenerate = sceneNumbers
      ? PREMADE_SCENES.filter(s => sceneNumbers.includes(s.sceneNumber))
      : PREMADE_SCENES

    if (scenesToGenerate.length === 0) {
      return NextResponse.json({ error: 'No valid scenes specified' }, { status: 400 })
    }

    const results: GenerateResult[] = []

    for (const scene of scenesToGenerate) {
      console.log(`Processing scene ${scene.sceneNumber}: ${scene.name} (action: ${action})`)

      const result: GenerateResult = {
        sceneNumber: scene.sceneNumber,
        name: scene.name,
      }

      try {
        // Get existing scene data from database
        const { data: existingScene } = await supabaseAdmin
          .from('premade_scenes')
          .select('*')
          .eq('scene_number', scene.sceneNumber)
          .single()

        let startKeyframeBase64: string | undefined
        let startKeyframeMimeType: string | undefined
        let endKeyframeBase64: string | undefined
        let endKeyframeMimeType: string | undefined
        let keyframeUrl: string | undefined = existingScene?.keyframe_url
        let keyframeEndUrl: string | undefined = existingScene?.keyframe_end_url

        // Generate START keyframe
        if (action === 'keyframe_start' || action === 'all') {
          console.log(`Generating START keyframe for scene ${scene.sceneNumber}...`)
          const startKeyframe = await generateKeyframe(scene.videoPrompt, '16:9')
          if (startKeyframe) {
            startKeyframeBase64 = startKeyframe.base64
            startKeyframeMimeType = startKeyframe.mimeType
            result.startKeyframeGenerated = true

            // Store as data URL for now (in production, upload to Supabase Storage)
            keyframeUrl = `data:${startKeyframe.mimeType};base64,${startKeyframe.base64.slice(0, 100)}...`
            console.log(`START keyframe generated for scene ${scene.sceneNumber}`)
          }
        }

        // Generate END keyframe
        if (action === 'keyframe_end' || action === 'all') {
          console.log(`Generating END keyframe for scene ${scene.sceneNumber}...`)
          const endPrompt = `Final moment of: ${scene.description}. ${scene.videoPrompt.slice(0, 500)}`
          const endKeyframe = await generateKeyframe(endPrompt, '16:9')
          if (endKeyframe) {
            endKeyframeBase64 = endKeyframe.base64
            endKeyframeMimeType = endKeyframe.mimeType
            result.endKeyframeGenerated = true

            keyframeEndUrl = `data:${endKeyframe.mimeType};base64,${endKeyframe.base64.slice(0, 100)}...`
            console.log(`END keyframe generated for scene ${scene.sceneNumber}`)
          }
        }

        // Generate VIDEO
        if (action === 'video' || action === 'all') {
          console.log(`Starting video generation for scene ${scene.sceneNumber}...`)

          // Use keyframes if available and requested
          const videoRequest: Parameters<typeof startVideoGeneration>[0] = {
            prompt: scene.videoPrompt,
            durationSeconds: scene.durationSeconds,
            aspectRatio: '16:9',
          }

          if (useKeyframes) {
            if (startKeyframeBase64 && startKeyframeMimeType) {
              videoRequest.imageBase64 = startKeyframeBase64
              videoRequest.imageMimeType = startKeyframeMimeType
            }
            if (endKeyframeBase64 && endKeyframeMimeType) {
              videoRequest.endImageBase64 = endKeyframeBase64
              videoRequest.endImageMimeType = endKeyframeMimeType
            }
          }

          const operationName = await startVideoGeneration(videoRequest)
          result.videoOperationStarted = true
          result.operationName = operationName
        }

        // Store in database
        const updateData: Record<string, unknown> = {
          scene_number: scene.sceneNumber,
          name: scene.name,
          description: scene.description,
          duration_seconds: scene.durationSeconds,
        }

        if (keyframeUrl) {
          updateData.keyframe_url = keyframeUrl
        }
        if (keyframeEndUrl) {
          updateData.keyframe_end_url = keyframeEndUrl
        }
        if (result.operationName) {
          updateData.prompt_used = JSON.stringify({
            videoPrompt: scene.videoPrompt,
            operationName: result.operationName,
            startedAt: new Date().toISOString(),
            usedStartKeyframe: !!startKeyframeBase64,
            usedEndKeyframe: !!endKeyframeBase64,
          })
        }

        const { error: dbError } = await supabaseAdmin
          .from('premade_scenes')
          .upsert(updateData, { onConflict: 'scene_number' })

        if (dbError) {
          console.error(`DB error for scene ${scene.sceneNumber}:`, dbError)
        }

        // Delay between scenes to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 2000))

      } catch (error) {
        console.error(`Error processing scene ${scene.sceneNumber}:`, error)
        result.error = error instanceof Error ? error.message : 'Unknown error'
      }

      results.push(result)
    }

    return NextResponse.json({
      success: true,
      action,
      scenesProcessed: results.length,
      results,
    })

  } catch (error) {
    console.error('Admin generate-premade error:', error)
    return NextResponse.json(
      { error: 'Failed to generate pre-made scenes' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/generate-premade
 *
 * Check status of pre-made scenes
 */
export async function GET(request: NextRequest) {
  const adminKey = request.nextUrl.searchParams.get('adminKey')

  if (adminKey !== ADMIN_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data: scenes, error } = await supabaseAdmin
      .from('premade_scenes')
      .select('*')
      .order('scene_number')

    if (error) {
      throw error
    }

    return NextResponse.json({
      scenes: scenes || [],
      totalScenes: PREMADE_SCENES.length,
      generatedScenes: scenes?.length || 0,
    })

  } catch (error) {
    console.error('Error fetching premade scenes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scenes' },
      { status: 500 }
    )
  }
}
