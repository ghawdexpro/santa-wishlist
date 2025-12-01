import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
    }

    // Get order and first child data
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, status')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Get first child for this order
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('name, age, good_behavior, favorite_toy, favorite_animal, hobbies')
      .eq('order_id', orderId)
      .limit(1)
      .single()

    if (childError || !child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 })
    }

    return NextResponse.json({
      orderId,
      name: child.name,
      age: child.age,
      goodBehavior: child.good_behavior,
      favoriteToy: child.favorite_toy,
      favoriteAnimal: child.favorite_animal,
      hobbies: child.hobbies,
    })
  } catch (error: any) {
    console.error('[SantaHotline] Child data error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal error' },
      { status: 500 }
    )
  }
}
