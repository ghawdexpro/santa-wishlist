/**
 * Order status endpoint for customer progress tracking
 * Allows polling for video generation progress
 */

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface ProgressData {
  stage: 'loading' | 'script' | 'premade' | 'personalized' | 'polling' | 'stitching' | 'uploading'
  scenesComplete: number[]
  scenesInProgress: { [sceneNum: number]: { childId: string; operationName: string }[] }
  scenesFailed: { [sceneNum: number]: string[] }
}

interface StatusResponse {
  orderId: string
  status: 'draft' | 'paid' | 'generating' | 'complete' | 'failed'
  progress: {
    stage: string
    stageLabel: string
    percentage: number
    scenesComplete: number
    totalScenes: number
    estimatedTimeRemaining?: number
  }
  videoUrl?: string
  errorMessage?: string
  childrenNames: string[]
  createdAt: string
  updatedAt: string
}

// Stage labels for user-friendly display
const STAGE_LABELS: Record<string, string> = {
  loading: 'Loading order details...',
  script: 'Writing Santa\'s magical script...',
  premade: 'Preparing magical scenes...',
  personalized: 'Creating personalized moments...',
  polling: 'Generating video magic...',
  stitching: 'Assembling your video...',
  uploading: 'Finalizing your magical video...',
}

// Estimated time per stage (seconds)
const STAGE_TIMES: Record<string, number> = {
  loading: 5,
  script: 10,
  premade: 15,
  personalized: 60,
  polling: 180,
  stitching: 30,
  uploading: 15,
}

// Calculate progress percentage based on stage and scenes
function calculateProgress(
  status: string,
  progress: ProgressData | null,
  childCount: number
): { percentage: number; scenesComplete: number; totalScenes: number } {
  if (status === 'complete') {
    return { percentage: 100, scenesComplete: 8, totalScenes: 8 }
  }

  if (status === 'failed' || status === 'draft') {
    return { percentage: 0, scenesComplete: 0, totalScenes: 8 }
  }

  if (status === 'paid') {
    return { percentage: 5, scenesComplete: 0, totalScenes: 8 }
  }

  if (!progress) {
    return { percentage: 10, scenesComplete: 0, totalScenes: 8 }
  }

  const scenesComplete = progress.scenesComplete?.length || 0

  // Base progress on stage
  const stageProgress: Record<string, number> = {
    loading: 10,
    script: 15,
    premade: 25,
    personalized: 40,
    polling: 70,
    stitching: 90,
    uploading: 95,
  }

  const baseProgress = stageProgress[progress.stage] || 10

  // Add bonus for completed scenes
  const sceneBonus = Math.min(scenesComplete * 5, 25)

  return {
    percentage: Math.min(baseProgress + sceneBonus, 99),
    scenesComplete,
    totalScenes: 8,
  }
}

// Estimate remaining time based on stage
function estimateTimeRemaining(stage: string, scenesComplete: number): number {
  const remainingStages = Object.keys(STAGE_TIMES).slice(
    Object.keys(STAGE_TIMES).indexOf(stage)
  )

  let total = 0
  for (const s of remainingStages) {
    total += STAGE_TIMES[s] || 0
  }

  // Reduce estimate based on scenes complete
  total = Math.max(total - scenesComplete * 15, 30)

  return total
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params

  try {
    const supabase = await createClient()

    // Fetch order with children
    const { data: order, error } = await supabase
      .from('orders')
      .select('*, children(name, sequence_number)')
      .eq('id', orderId)
      .single()

    if (error || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    const progress = order.generation_progress as ProgressData | null
    const childCount = order.child_count || 1
    const children = (order.children || []).sort(
      (a: { sequence_number: number }, b: { sequence_number: number }) =>
        a.sequence_number - b.sequence_number
    )
    const childrenNames = children.map((c: { name: string }) => c.name)

    const progressCalc = calculateProgress(order.status, progress, childCount)
    const stage = progress?.stage || 'loading'
    const stageLabel = STAGE_LABELS[stage] || 'Processing...'

    const response: StatusResponse = {
      orderId,
      status: order.status,
      progress: {
        stage,
        stageLabel,
        percentage: progressCalc.percentage,
        scenesComplete: progressCalc.scenesComplete,
        totalScenes: progressCalc.totalScenes,
        estimatedTimeRemaining:
          order.status === 'generating'
            ? estimateTimeRemaining(stage, progressCalc.scenesComplete)
            : undefined,
      },
      childrenNames,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
    }

    // Add video URL if complete
    if (order.status === 'complete' && order.final_video_url) {
      response.videoUrl = order.final_video_url
    }

    // Add error message if failed
    if (order.status === 'failed' && order.error_message) {
      response.errorMessage = order.error_message
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('[Status API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order status' },
      { status: 500 }
    )
  }
}
