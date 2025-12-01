import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Get child by ID
 * GET /api/children/[childId]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ childId: string }> }
) {
  const { childId } = await params

  const { data: child, error } = await supabase
    .from('children')
    .select('*')
    .eq('id', childId)
    .single()

  if (error || !child) {
    return NextResponse.json(
      { error: 'Child not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({ child })
}
