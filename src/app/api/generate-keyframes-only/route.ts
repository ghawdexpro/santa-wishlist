/**
 * Generate keyframes only (no video) for review before Veo generation
 *
 * Flow:
 * 1. Order paid → this endpoint generates keyframes
 * 2. Keyframes saved to storage + database
 * 3. Admin reviews in /admin/review/[orderId]
 * 4. Admin approves → /api/generate-videos triggers Veo
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateDualKeyframes, ChildData } from '@/lib/hollywood-scene-generator'
import { SceneNumber } from '@/lib/hollywood-prompts'

export const maxDuration = 300 // 5 minutes for keyframe generation

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface KeyframeData {
  sceneNumber: number
  childId?: string
  childName?: string
  startKeyframeUrl: string
  endKeyframeUrl: string
}

/**
 * Upload keyframe to Supabase Storage
 */
async function uploadKeyframe(
  base64: string,
  mimeType: string,
  orderId: string,
  sceneNumber: number,
  childName: string | null,
  keyframeType: 'start' | 'end'
): Promise<string> {
  const bucket = 'keyframes'
  const ext = mimeType.includes('png') ? 'png' : 'jpg'
  const childPart = childName ? `-${childName.toLowerCase().replace(/\s+/g, '-')}` : ''
  const fileName = `${orderId}/scene-${sceneNumber}${childPart}-${keyframeType}-${Date.now()}.${ext}`

  const buffer = Buffer.from(base64, 'base64')

  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(fileName, buffer, {
      contentType: mimeType,
      upsert: true,
    })

  if (error) {
    console.error(`Failed to upload keyframe:`, error)
    // Fallback to data URL
    return `data:${mimeType};base64,${base64}`
  }

  const { data: urlData } = supabaseAdmin.storage.from(bucket).getPublicUrl(fileName)
  return urlData.publicUrl
}

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: 'orderId required' }, { status: 400 })
    }

    console.log(`[KeyframesOnly] Starting keyframe generation for order: ${orderId}`)

    // Fetch order with children
    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('*, children(*)')
      .eq('id', orderId)
      .single()

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const children = (order.children || []).sort(
      (a: any, b: any) => a.sequence_number - b.sequence_number
    )

    console.log(`[KeyframesOnly] Order has ${children.length} child(ren)`)

    // Update status
    await supabaseAdmin
      .from('orders')
      .update({ status: 'generating_keyframes' })
      .eq('id', orderId)

    const allKeyframes: KeyframeData[] = []

    // Generate keyframes for each child's personalized scenes (4, 5, 6, 8)
    for (const child of children) {
      console.log(`[KeyframesOnly] Generating keyframes for ${child.name}...`)

      const childData: ChildData = {
        name: child.name,
        age: child.age ?? 7,
        photoUrl: child.photo_url,
        goodBehavior: child.good_behavior,
        thingToImprove: child.thing_to_improve,
        thingToLearn: child.thing_to_learn,
      }

      // Generate dual keyframes for each personalized scene
      for (const sceneNum of [4, 5, 6, 8] as SceneNumber[]) {
        console.log(`[KeyframesOnly] Scene ${sceneNum} for ${child.name}...`)

        try {
          const keyframes = await generateDualKeyframes(sceneNum, childData)

          // Upload keyframes to storage
          const startUrl = await uploadKeyframe(
            keyframes.startKeyframeBase64,
            keyframes.startKeyframeMimeType,
            orderId,
            sceneNum,
            child.name,
            'start'
          )

          const endUrl = await uploadKeyframe(
            keyframes.endKeyframeBase64,
            keyframes.endKeyframeMimeType,
            orderId,
            sceneNum,
            child.name,
            'end'
          )

          allKeyframes.push({
            sceneNumber: sceneNum,
            childId: child.id,
            childName: child.name,
            startKeyframeUrl: startUrl,
            endKeyframeUrl: endUrl,
          })

          console.log(`[KeyframesOnly] Scene ${sceneNum} keyframes saved for ${child.name}`)
        } catch (error) {
          console.error(`[KeyframesOnly] Failed scene ${sceneNum} for ${child.name}:`, error)
        }
      }
    }

    // Save keyframes to order
    await supabaseAdmin
      .from('orders')
      .update({
        status: 'keyframes_ready',
        keyframe_urls: allKeyframes,
        generation_progress: {
          stage: 'keyframes_ready',
          keyframesGenerated: allKeyframes.length,
          childrenProcessed: children.length,
        },
      })
      .eq('id', orderId)

    console.log(`[KeyframesOnly] All keyframes generated: ${allKeyframes.length} total`)

    return NextResponse.json({
      success: true,
      orderId,
      keyframeCount: allKeyframes.length,
      keyframes: allKeyframes,
      reviewUrl: `/admin/review/${orderId}`,
    })
  } catch (error) {
    console.error('[KeyframesOnly] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
