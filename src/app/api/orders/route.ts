import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the current user (optional - allow guest checkout)
    const { data: { user } } = await supabase.auth.getUser()

    const body = await request.json()
    const {
      childName,
      childAge,
      childPhotoUrl,
      goodBehavior,
      thingToImprove,
      thingToLearn,
      customMessage,
    } = body

    // Validate required fields
    if (!childName || !childAge || !goodBehavior || !thingToImprove || !thingToLearn) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create the order
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: user?.id || null,
        child_name: childName,
        child_age: childAge,
        child_photo_url: childPhotoUrl || null,
        good_behavior: goodBehavior,
        thing_to_improve: thingToImprove,
        thing_to_learn: thingToLearn,
        custom_message: customMessage || null,
        status: 'draft',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating order:', error)
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      )
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('id')

    if (orderId) {
      // Get specific order
      const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single()

      if (error || !order) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ order })
    }

    // Get all orders for user
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      )
    }

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Order fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
