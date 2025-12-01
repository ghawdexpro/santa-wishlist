import { stripe, PRICING, PricingTier } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { orderId, tier = 'basic' } = body as { orderId: string; tier?: PricingTier }

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Validate tier
    if (!PRICING[tier]) {
      return NextResponse.json(
        { error: 'Invalid pricing tier' },
        { status: 400 }
      )
    }

    const selectedPricing = PRICING[tier]

    // Get the order to verify it exists
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Don't allow checkout for orders that are already paid
    if (order.status === 'paid' || order.status === 'generating' || order.status === 'complete') {
      return NextResponse.json(
        { error: 'Order has already been paid' },
        { status: 400 }
      )
    }

    // Get children names for multi-child orders
    const { data: children } = await supabase
      .from('children')
      .select('name')
      .eq('order_id', orderId)
      .order('sequence_number', { ascending: true })

    // Build description based on children
    let description: string
    if (children && children.length > 0) {
      const names = children.map(c => c.name)
      if (names.length === 1) {
        description = `Personalized Santa video for ${names[0]}`
      } else if (names.length === 2) {
        description = `Personalized Santa video for ${names[0]} and ${names[1]}`
      } else {
        const lastChild = names.pop()
        description = `Personalized Santa video for ${names.join(', ')}, and ${lastChild}`
      }
    } else {
      // Fallback to legacy child_name field
      description = `Personalized Santa video for ${order.child_name || 'your child'}`
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'p24', 'blik'], // PLN payment methods
      line_items: [
        {
          price_data: {
            currency: selectedPricing.currency,
            product_data: {
              name: selectedPricing.name,
              description: `${selectedPricing.description} - ${description}`,
              images: [`${appUrl}/santa-product.png`],
            },
            unit_amount: selectedPricing.amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${appUrl}/order/${orderId}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/order/${orderId}/cancel`,
      metadata: {
        orderId: orderId,
        childCount: String(children?.length || 1),
        tier: tier,
        includesLiveCall: String(selectedPricing.includesLiveCall),
      },
    })

    // Update order with Stripe session ID
    await supabase
      .from('orders')
      .update({ stripe_session_id: session.id })
      .eq('id', orderId)

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
