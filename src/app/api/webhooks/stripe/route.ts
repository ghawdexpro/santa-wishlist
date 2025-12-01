/**
 * Stripe webhook handler
 * Processes payment events and triggers video generation
 *
 * Flow (AUTO_APPROVE=true - default):
 *   Payment → Email confirmation → Direct video generation
 *
 * Flow (AUTO_APPROVE=false):
 *   Payment → Email confirmation → Keyframe generation → Admin review
 */

import { stripe, PRODUCT_PRICE } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { sendOrderConfirmedEmail } from '@/lib/email'

// Use service role for webhook (no user context)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Auto-approve by default (skip admin review)
const AUTO_APPROVE = process.env.AUTO_APPROVE_VIDEOS !== 'false'

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

      console.log(`[Webhook] Processing payment for order ${orderId}`)

      // Fetch order with children to get email and names
      const { data: order, error: fetchError } = await supabaseAdmin
        .from('orders')
        .select('*, children(*), profiles(email)')
        .eq('id', orderId)
        .single()

      if (fetchError || !order) {
        console.error('Error fetching order:', fetchError)
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        )
      }

      // Update order status to paid
      const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update({
          status: 'paid',
          stripe_payment_intent_id: session.payment_intent as string,
          amount_paid: PRODUCT_PRICE,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)

      if (updateError) {
        console.error('Error updating order:', updateError)
        return NextResponse.json(
          { error: 'Failed to update order' },
          { status: 500 }
        )
      }

      console.log(`[Webhook] Order ${orderId} marked as paid`)

      // Get customer email and children names
      const customerEmail = session.customer_email ||
        order.profiles?.email ||
        session.customer_details?.email

      const children = (order.children || []).sort(
        (a: { sequence_number: number }, b: { sequence_number: number }) =>
          a.sequence_number - b.sequence_number
      )
      const childrenNames = children.map((c: { name: string }) => c.name)

      // Send confirmation email
      if (customerEmail) {
        await sendOrderConfirmedEmail({
          orderId,
          customerEmail,
          childrenNames,
        })
      } else {
        console.warn(`[Webhook] No email found for order ${orderId}`)
      }

      // Trigger video generation based on AUTO_APPROVE setting
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://santapl-production.up.railway.app'

      if (AUTO_APPROVE) {
        // Direct video generation (no admin review)
        console.log(`[Webhook] AUTO_APPROVE enabled, triggering direct video generation`)

        try {
          const response = await fetch(`${baseUrl}/api/generate-full-video`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId }),
          })

          if (!response.ok) {
            const errorText = await response.text()
            console.error(`[Webhook] Failed to trigger video generation: ${response.status} - ${errorText}`)
          } else {
            console.log(`[Webhook] Video generation triggered for order ${orderId}`)
          }
        } catch (err) {
          console.error('[Webhook] Error triggering video generation:', err)
          // Don't fail the webhook - order is paid, video can be retried
        }
      } else {
        // Keyframe generation with admin review
        console.log(`[Webhook] AUTO_APPROVE disabled, triggering keyframe generation for review`)

        try {
          const response = await fetch(`${baseUrl}/api/generate-keyframes-only`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId }),
          })

          if (!response.ok) {
            console.error(`[Webhook] Failed to trigger keyframe generation: ${response.statusText}`)
          } else {
            const data = await response.json()
            console.log(`[Webhook] Keyframes generation triggered for order ${orderId}`)
            console.log(`[Webhook] Review at: ${data.reviewUrl}`)
          }
        } catch (err) {
          console.error('[Webhook] Error triggering keyframe generation:', err)
        }
      }
      break
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log('[Webhook] Payment failed:', paymentIntent.id)
      // Could send notification email here
      break
    }

    default:
      console.log(`[Webhook] Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
