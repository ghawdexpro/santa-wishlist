import { NextRequest, NextResponse } from 'next/server'
import { PREMADE_SCENES } from '@/lib/premade-scenes'
import { startVideoGeneration } from '@/lib/veo'
import { generateKeyframeSimple as generateKeyframeLegacy } from '@/lib/nanobanana'
import { getScenePrompts, SceneNumber } from '@/lib/hollywood-prompts'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 300 // 5 minutes

// Create admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Try to upload keyframe to Supabase Storage, fallback to data URL
 */
async function uploadKeyframeToStorage(
  base64: string,
  mimeType: string,
  sceneNumber: number,
  keyframeType: 'start' | 'end'
): Promise<string> {
  const bucket = 'keyframes'
  const extension = mimeType.includes('png') ? 'png' : 'jpg'
  const fileName = `scene-${sceneNumber}-${keyframeType}-${Date.now()}.${extension}`

  try {
    // Convert base64 to buffer
    const buffer = Buffer.from(base64, 'base64')

    // Try upload to Supabase Storage
    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: mimeType,
        upsert: true,
      })

    if (error) {
      // Bucket might not exist - fall back to data URL
      console.log(`Storage upload failed (bucket may not exist), using data URL`)
      return `data:${mimeType};base64,${base64}`
    }

    // Get public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(fileName)

    return publicUrlData.publicUrl
  } catch {
    // Any error - fall back to data URL
    console.log(`Storage error, using data URL`)
    return `data:${mimeType};base64,${base64}`
  }
}

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

        // Get Hollywood-quality prompts for this scene
        const hollywoodPrompts = getScenePrompts(scene.sceneNumber as SceneNumber)

        // Generate START keyframe with Hollywood prompt
        if (action === 'keyframe_start' || action === 'all') {
          console.log(`Generating HOLLYWOOD START keyframe for scene ${scene.sceneNumber}...`)
          const startKeyframe = await generateKeyframeLegacy(hollywoodPrompts.startKeyframe, '16:9')
          if (startKeyframe) {
            startKeyframeBase64 = startKeyframe.base64
            startKeyframeMimeType = startKeyframe.mimeType
            result.startKeyframeGenerated = true

            // Upload to Supabase Storage
            try {
              keyframeUrl = await uploadKeyframeToStorage(
                startKeyframe.base64,
                startKeyframe.mimeType,
                scene.sceneNumber,
                'start'
              )
              console.log(`START keyframe uploaded: ${keyframeUrl}`)
            } catch (uploadError) {
              console.error('Failed to upload start keyframe:', uploadError)
              // Fallback to data URL if storage fails
              keyframeUrl = `data:${startKeyframe.mimeType};base64,${startKeyframe.base64}`
            }
          }
        }

        // Generate END keyframe with Hollywood prompt
        if (action === 'keyframe_end' || action === 'all') {
          console.log(`Generating HOLLYWOOD END keyframe for scene ${scene.sceneNumber}...`)
          const endKeyframe = await generateKeyframeLegacy(hollywoodPrompts.endKeyframe, '16:9')
          if (endKeyframe) {
            endKeyframeBase64 = endKeyframe.base64
            endKeyframeMimeType = endKeyframe.mimeType
            result.endKeyframeGenerated = true

            // Upload to Supabase Storage
            try {
              keyframeEndUrl = await uploadKeyframeToStorage(
                endKeyframe.base64,
                endKeyframe.mimeType,
                scene.sceneNumber,
                'end'
              )
              console.log(`END keyframe uploaded: ${keyframeEndUrl}`)
            } catch (uploadError) {
              console.error('Failed to upload end keyframe:', uploadError)
              // Fallback to data URL if storage fails
              keyframeEndUrl = `data:${endKeyframe.mimeType};base64,${endKeyframe.base64}`
            }
          }
        }

        // Generate VIDEO
        if (action === 'video' || action === 'all') {
          console.log(`Starting HOLLYWOOD video generation for scene ${scene.sceneNumber}...`)

          // Use Hollywood video prompt
          const videoRequest: Parameters<typeof startVideoGeneration>[0] = {
            prompt: hollywoodPrompts.videoPrompt,
            durationSeconds: scene.durationSeconds,
            aspectRatio: '16:9',
            negativePrompt: 'cartoon, anime, low quality, blurry, distorted, glitch, text overlay, watermark, animated style',
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
