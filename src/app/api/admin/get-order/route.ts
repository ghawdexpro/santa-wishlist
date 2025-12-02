/**
 * Admin API to fetch order details for keyframe review
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Admin key check - ADMIN_KEY env var required
const ADMIN_KEY = process.env.ADMIN_KEY
if (!ADMIN_KEY) {
  console.warn('[SECURITY] ADMIN_KEY environment variable not set!')
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const orderId = searchParams.get('orderId')
  const adminKey = searchParams.get('adminKey')

  if (!ADMIN_KEY || !adminKey || adminKey !== ADMIN_KEY) {
    return NextResponse.json({ error: 'Invalid admin key' }, { status: 401 })
  }

  if (!orderId) {
    return NextResponse.json({ error: 'orderId required' }, { status: 400 })
  }

  try {
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*, children(*)')
      .eq('id', orderId)
      .single()

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('[GetOrder] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
