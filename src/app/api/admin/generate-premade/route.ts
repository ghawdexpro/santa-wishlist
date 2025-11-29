import { NextRequest, NextResponse } from 'next/server'
import { PREMADE_SCENES } from '@/lib/premade-scenes'
import { generateKeyframe } from '@/lib/imagen'
import { startVideoGeneration, pollVideoGeneration } from '@/lib/veo'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 300 // 5 minutes

// Create admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Simple admin key check (in production, use proper auth)
const ADMIN_KEY = process.env.ADMIN_SECRET_KEY || 'santa-admin-2024'

/**
 * POST /api/admin/generate-premade
 *
 * Generate pre-made scenes for reuse.
 *
 * Body:
 * - adminKey: string (required)
 * - sceneNumbers: number[] (optional, defaults to all)
 * - type: 'keyframes' | 'videos' | 'both' (default: 'keyframes')
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { adminKey, sceneNumbers, type = 'keyframes' } = body

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

    const results: Array<{
      sceneNumber: number
      name: string
      keyframeGenerated?: boolean
      videoOperationStarted?: boolean
      operationName?: string
      error?: string
    }> = []

    for (const scene of scenesToGenerate) {
      console.log(`Processing scene ${scene.sceneNumber}: ${scene.name}`)

      const result: typeof results[0] = {
        sceneNumber: scene.sceneNumber,
        name: scene.name,
      }

      try {
        // Generate keyframe
        if (type === 'keyframes' || type === 'both') {
          console.log(`Generating keyframe for scene ${scene.sceneNumber}...`)

          const { imageBase64, mimeType } = await generateKeyframe(scene.keyframePrompt)

          // Store in database
          const { error: dbError } = await supabaseAdmin
            .from('premade_scenes')
            .upsert({
              scene_number: scene.sceneNumber,
              name: scene.name,
              description: scene.description,
              duration_seconds: scene.durationSeconds,
              prompt_used: scene.keyframePrompt,
              // Store base64 keyframe (in production, upload to Supabase Storage)
              keyframe_url: `data:${mimeType};base64,${imageBase64}`,
            }, {
              onConflict: 'scene_number',
            })

          if (dbError) {
            console.error(`DB error for scene ${scene.sceneNumber}:`, dbError)
          }

          result.keyframeGenerated = true
        }

        // Start video generation
        if (type === 'videos' || type === 'both') {
          console.log(`Starting video generation for scene ${scene.sceneNumber}...`)

          const operationName = await startVideoGeneration({
            prompt: scene.videoPrompt,
            durationSeconds: scene.durationSeconds,
            aspectRatio: '16:9',
          })

          result.videoOperationStarted = true
          result.operationName = operationName

          // Update database with operation name
          await supabaseAdmin
            .from('premade_scenes')
            .update({
              // Store operation name for later polling
              prompt_used: JSON.stringify({
                videoPrompt: scene.videoPrompt,
                operationName,
                startedAt: new Date().toISOString(),
              }),
            })
            .eq('scene_number', scene.sceneNumber)
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
      type,
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
