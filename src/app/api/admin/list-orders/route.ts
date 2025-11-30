/**
 * Admin API to list all orders with their statuses
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_KEY = process.env.ADMIN_KEY || 'santa-admin-2024'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const adminKey = searchParams.get('adminKey')

  if (!adminKey || adminKey !== ADMIN_KEY) {
    return NextResponse.json({ error: 'Invalid admin key' }, { status: 401 })
  }

  try {
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('id, status, created_at, child_count, final_video_url, error_message, keyframe_urls, children(name)')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      throw error
    }

    // Transform for frontend
    const orderSummaries = (orders || []).map(order => ({
      id: order.id,
      status: order.status,
      created_at: order.created_at,
      child_count: order.child_count || 1,
      keyframe_count: Array.isArray(order.keyframe_urls) ? order.keyframe_urls.length : 0,
      children_names: (order.children || []).map((c: any) => c.name),
      final_video_url: order.final_video_url,
      error_message: order.error_message,
    }))

    return NextResponse.json({ orders: orderSummaries })
  } catch (error) {
    console.error('[ListOrders] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
