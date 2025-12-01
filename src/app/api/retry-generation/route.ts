import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Get the order and verify ownership
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Only allow retry for failed orders
    if (order.status !== 'failed') {
      return NextResponse.json(
        { error: 'Only failed orders can be retried' },
        { status: 400 }
      )
    }

    // Reset order status to 'paid' to trigger regeneration
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        error_message: null,
        generation_progress: null,
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('Error updating order:', updateError)
      return NextResponse.json(
        { error: 'Failed to retry generation' },
        { status: 500 }
      )
    }

    // Trigger video generation asynchronously
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    fetch(`${appUrl}/api/generate-full-video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    }).catch(err => {
      console.error('Failed to trigger video generation:', err)
    })

    return NextResponse.json({
      success: true,
      message: 'Video generation restarted'
    })
  } catch (error) {
    console.error('Retry generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
