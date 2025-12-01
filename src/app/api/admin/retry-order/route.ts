/**
 * Admin endpoint to retry failed video generation
 * Allows recovery from errors without customer re-payment
 */

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const ADMIN_KEY = process.env.ADMIN_API_KEY || 'santa-admin-2024'

// Use service role for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface RetryRequest {
  adminKey: string
  orderId: string
  resetScript?: boolean // If true, regenerate script
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as RetryRequest
    const { adminKey, orderId, resetScript } = body

    // Verify admin key
    if (adminKey !== ADMIN_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId is required' },
        { status: 400 }
      )
    }

    console.log(`[Admin] Retry requested for order ${orderId}`)

    // Fetch order
    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('*, children(name)')
      .eq('id', orderId)
      .single()

    if (fetchError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Only retry failed or paid orders
    if (!['failed', 'paid'].includes(order.status)) {
      return NextResponse.json(
        { error: `Cannot retry order with status: ${order.status}. Only 'failed' or 'paid' orders can be retried.` },
        { status: 400 }
      )
    }

    // Reset order state for retry
    const updateData: Record<string, unknown> = {
      status: 'paid',
      error_message: null,
      generation_progress: null,
      updated_at: new Date().toISOString(),
    }

    // Optionally reset script for fresh generation
    if (resetScript) {
      updateData.generated_script = null
    }

    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', orderId)

    if (updateError) {
      console.error('[Admin] Failed to reset order:', updateError)
      return NextResponse.json(
        { error: 'Failed to reset order' },
        { status: 500 }
      )
    }

    console.log(`[Admin] Order ${orderId} reset, triggering video generation`)

    // Trigger video generation
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://santapl-production.up.railway.app'

    try {
      const response = await fetch(`${baseUrl}/api/generate-full-video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`[Admin] Video generation trigger failed: ${response.status} - ${errorText}`)
        return NextResponse.json({
          success: false,
          message: 'Order reset but video generation failed to start',
          error: errorText,
          orderId,
        }, { status: 500 })
      }

      console.log(`[Admin] Video generation triggered for order ${orderId}`)
    } catch (err) {
      console.error('[Admin] Error triggering video generation:', err)
      return NextResponse.json({
        success: false,
        message: 'Order reset but failed to trigger video generation',
        error: err instanceof Error ? err.message : 'Unknown error',
        orderId,
      }, { status: 500 })
    }

    const childrenNames = (order.children || []).map((c: { name: string }) => c.name)

    return NextResponse.json({
      success: true,
      message: 'Order retry initiated',
      orderId,
      childrenNames,
      resetScript: resetScript || false,
      previousStatus: order.status,
      previousError: order.error_message,
    })
  } catch (error) {
    console.error('[Admin] Retry error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// GET: List failed orders for retry
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const adminKey = searchParams.get('adminKey')

  if (adminKey !== ADMIN_KEY) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    // Fetch failed orders
    const { data: failedOrders, error } = await supabaseAdmin
      .from('orders')
      .select('id, status, error_message, created_at, updated_at, children(name)')
      .eq('status', 'failed')
      .order('updated_at', { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      failedOrders: failedOrders.map(order => ({
        id: order.id,
        status: order.status,
        errorMessage: order.error_message,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        childrenNames: (order.children || []).map((c: { name: string }) => c.name),
      })),
      count: failedOrders.length,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
