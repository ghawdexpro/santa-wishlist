import { stripe, PRODUCT_PRICE } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Use service role for webhook (no user context)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session

      const orderId = session.metadata?.orderId
      if (!orderId) {
        console.error('No orderId in session metadata')
        break
      }

      // Update order status to paid
      const { error } = await supabaseAdmin
        .from('orders')
        .update({
          status: 'paid',
          stripe_payment_intent_id: session.payment_intent as string,
          amount_paid: PRODUCT_PRICE,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)

      if (error) {
        console.error('Error updating order:', error)
        return NextResponse.json(
          { error: 'Failed to update order' },
          { status: 500 }
        )
      }

      console.log(`Order ${orderId} marked as paid`)

      // Trigger keyframe generation (admin will review before Veo video generation)
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://santapl-production.up.railway.app'
        const response = await fetch(`${baseUrl}/api/generate-keyframes-only`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        })

        if (!response.ok) {
          console.error(`Failed to trigger keyframe generation: ${response.statusText}`)
        } else {
          const data = await response.json()
          console.log(`Keyframes generation triggered for order ${orderId}`)
          console.log(`Review at: ${data.reviewUrl}`)
        }
      } catch (err) {
        console.error('Error triggering keyframe generation:', err)
      }
      break
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log('Payment failed:', paymentIntent.id)
      // Could send notification email here
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
