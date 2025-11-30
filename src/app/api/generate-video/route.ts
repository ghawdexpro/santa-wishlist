import { NextRequest, NextResponse } from 'next/server'
import { startVideoGeneration } from '@/lib/veo'
import { generateKeyframe, makePhotoMagical } from '@/lib/nanobanana'
import {
  isPremadeScene,
  isPersonalizedScene,
  getPersonalizedTemplate,
  generatePersonalizedPrompt,
} from '@/lib/premade-scenes'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 300 // 5 minutes

// Create admin client for server-side operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface SceneInput {
  sceneNumber: number
  visualDescription?: string
  santaDialogue?: string
}

interface PersonalizationData {
  name: string
  childDescription?: string
  goodBehavior?: string
  thingToImprove?: string
  thingToLearn?: string
  customMessage?: string
  photoBase64?: string
  photoMimeType?: string
}

interface VideoOperation {
  sceneNumber: number
  status: 'pending' | 'generating' | 'complete' | 'failed' | 'premade'
  operationName?: string
  videoUrl?: string
  error?: string
  keyframeGenerated?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      orderId,
      scenes,
      personalization,
      generateKeyframes = true,
    }: {
      orderId: string
      scenes: SceneInput[]
      personalization: PersonalizationData
      generateKeyframes?: boolean
    } = body

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
    }

    if (!scenes || !Array.isArray(scenes) || scenes.length === 0) {
      return NextResponse.json({ error: 'Missing or invalid scenes' }, { status: 400 })
    }

    if (!personalization?.name) {
      return NextResponse.json({ error: 'Missing personalization data' }, { status: 400 })
    }

    // Check if Google Cloud is configured
    if (!process.env.GOOGLE_CLOUD_PROJECT && !process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
      return NextResponse.json({ error: 'Google Cloud not configured' }, { status: 503 })
    }

    // Verify order exists and is paid
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.status !== 'paid') {
      return NextResponse.json(
        { error: 'Order must be paid before generating video' },
        { status: 400 }
      )
    }

    // Update order status to generating
    await supabaseAdmin
      .from('orders')
      .update({ status: 'generating' })
      .eq('id', orderId)

    const operations: VideoOperation[] = []

    // Process each scene
    for (const scene of scenes) {
      console.log(`Processing scene ${scene.sceneNumber} for order ${orderId}`)

      // =====================================================
      // PRE-MADE SCENES (1, 2, 3, 7) - Use pre-generated video
      // =====================================================
      if (isPremadeScene(scene.sceneNumber)) {
        // Fetch pre-made video from database
        const { data: premadeScene } = await supabaseAdmin
          .from('premade_scenes')
          .select('video_url')
          .eq('scene_number', scene.sceneNumber)
          .single()

        if (premadeScene?.video_url) {
          operations.push({
            sceneNumber: scene.sceneNumber,
            status: 'premade',
            videoUrl: premadeScene.video_url,
          })
          console.log(`Scene ${scene.sceneNumber}: Using pre-made video`)
        } else {
          operations.push({
            sceneNumber: scene.sceneNumber,
            status: 'failed',
            error: 'Pre-made video not yet generated',
          })
          console.warn(`Scene ${scene.sceneNumber}: Pre-made video not found`)
        }
        continue
      }

      // =====================================================
      // PERSONALIZED SCENES (4, 5, 6, 8) - Generate on demand
      // =====================================================
      if (isPersonalizedScene(scene.sceneNumber)) {
        try {
          const template = getPersonalizedTemplate(scene.sceneNumber)
          if (!template) {
            operations.push({
              sceneNumber: scene.sceneNumber,
              status: 'failed',
              error: 'Template not found',
            })
            continue
          }

          // Generate personalized prompt
          const promptData = generatePersonalizedPrompt(scene.sceneNumber, personalization)
          if (!promptData) {
            operations.push({
              sceneNumber: scene.sceneNumber,
              status: 'failed',
              error: 'Failed to generate prompt',
            })
            continue
          }

          let startKeyframeBase64: string | undefined
          let startKeyframeMimeType: string | undefined
          let endKeyframeBase64: string | undefined
          let endKeyframeMimeType: string | undefined

          // =====================================================
          // SCENE 4 SPECIAL: Photo Comes Alive
          // =====================================================
          if (scene.sceneNumber === 4 && personalization.photoBase64) {
            console.log(`Scene 4: Making photo magical for ${personalization.name}`)

            // Use NanoBanana to make the photo magical
            const magicalResult = await makePhotoMagical(
              personalization.photoBase64,
              personalization.photoMimeType || 'image/jpeg',
              personalization.name
            )

            if (magicalResult.images.length > 0) {
              startKeyframeBase64 = magicalResult.images[0].base64
              startKeyframeMimeType = magicalResult.images[0].mimeType
              console.log(`Scene 4: Magical keyframe generated`)
            }
          }
          // =====================================================
          // OTHER PERSONALIZED SCENES: Generate keyframes if enabled
          // =====================================================
          else if (generateKeyframes) {
            console.log(`Scene ${scene.sceneNumber}: Generating keyframe...`)

            // Generate start keyframe
            const startKeyframe = await generateKeyframe(
              promptData.videoPrompt.slice(0, 2000),
              '16:9'
            )
            if (startKeyframe) {
              startKeyframeBase64 = startKeyframe.base64
              startKeyframeMimeType = startKeyframe.mimeType
              console.log(`Scene ${scene.sceneNumber}: Start keyframe generated`)
            }

            // Optionally generate end keyframe for longer scenes
            if (template.durationSeconds >= 15) {
              const endPrompt = `Final moment of: ${template.description}. ${template.name} conclusion.`
              const endKeyframe = await generateKeyframe(endPrompt, '16:9')
              if (endKeyframe) {
                endKeyframeBase64 = endKeyframe.base64
                endKeyframeMimeType = endKeyframe.mimeType
                console.log(`Scene ${scene.sceneNumber}: End keyframe generated`)
              }
            }
          }

          // Start video generation with Veo
          console.log(`Scene ${scene.sceneNumber}: Starting Veo video generation...`)

          const operationName = await startVideoGeneration({
            prompt: promptData.videoPrompt,
            durationSeconds: template.durationSeconds,
            aspectRatio: '16:9',
            imageBase64: startKeyframeBase64,
            imageMimeType: startKeyframeMimeType,
            endImageBase64: endKeyframeBase64,
            endImageMimeType: endKeyframeMimeType,
          })

          operations.push({
            sceneNumber: scene.sceneNumber,
            status: 'generating',
            operationName,
            keyframeGenerated: !!startKeyframeBase64,
          })

          console.log(`Scene ${scene.sceneNumber}: Video operation started: ${operationName}`)

          // Delay between scenes to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 3000))

        } catch (error) {
          console.error(`Scene ${scene.sceneNumber} error:`, error)
          operations.push({
            sceneNumber: scene.sceneNumber,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
          })
        }
      }
    }

    // Store operations in order metadata
    await supabaseAdmin
      .from('orders')
      .update({
        video_operations: JSON.stringify(operations),
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    console.log(`Order ${orderId}: Started ${operations.length} video operations`)

    return NextResponse.json({
      success: true,
      orderId,
      operationsCount: operations.length,
      operations: operations.map(op => ({
        sceneNumber: op.sceneNumber,
        status: op.status,
        operationName: op.operationName,
        keyframeGenerated: op.keyframeGenerated,
        error: op.error,
      })),
    })
  } catch (error) {
    console.error('Video generation error:', error)
    return NextResponse.json(
      { error: 'Failed to start video generation' },
      { status: 500 }
    )
  }
}
