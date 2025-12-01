import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { prepareChildForSantaCall } from '@/lib/santa-story-generator'
import { Child } from '@/types/database'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Prepare Santa Call API
 *
 * Generates personalized story and conversation context for a child
 * before their live video call with Santa.
 *
 * POST /api/prepare-santa-call
 * Body: { childId: string }
 *
 * Returns: { success: true, story: string, context: SantaConversationContext }
 */
export async function POST(request: NextRequest) {
  try {
    const { childId } = await request.json()

    if (!childId) {
      return NextResponse.json(
        { error: 'childId is required' },
        { status: 400 }
      )
    }

    // Load child data
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('*')
      .eq('id', childId)
      .single()

    if (childError || !child) {
      return NextResponse.json(
        { error: 'Child not found' },
        { status: 404 }
      )
    }

    // Check if already prepared (has story and context)
    if (child.santa_story && child.santa_conversation_context) {
      console.log(`Child ${child.name} already prepared, returning cached data`)
      return NextResponse.json({
        success: true,
        story: child.santa_story,
        context: child.santa_conversation_context,
        cached: true,
      })
    }

    console.log(`Preparing Santa call for ${child.name}...`)

    // Generate story and context
    const { story, context } = await prepareChildForSantaCall(child as Child)

    // Save to database for caching
    const { error: updateError } = await supabase
      .from('children')
      .update({
        santa_story: story,
        santa_conversation_context: context,
      })
      .eq('id', childId)

    if (updateError) {
      console.error('Failed to cache story/context:', updateError)
      // Continue anyway - we still have the data
    }

    console.log(`Santa call prepared for ${child.name}!`)

    return NextResponse.json({
      success: true,
      story,
      context,
      cached: false,
    })
  } catch (error) {
    console.error('Prepare Santa call error:', error)
    return NextResponse.json(
      { error: 'Failed to prepare Santa call' },
      { status: 500 }
    )
  }
}

/**
 * GET - Check if child is prepared
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const childId = searchParams.get('childId')

  if (!childId) {
    return NextResponse.json(
      { error: 'childId is required' },
      { status: 400 }
    )
  }

  const { data: child, error } = await supabase
    .from('children')
    .select('santa_story, santa_conversation_context')
    .eq('id', childId)
    .single()

  if (error || !child) {
    return NextResponse.json(
      { error: 'Child not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    prepared: !!(child.santa_story && child.santa_conversation_context),
    hasStory: !!child.santa_story,
    hasContext: !!child.santa_conversation_context,
  })
}
