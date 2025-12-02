import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-11-17.clover',
  typescript: true,
})

// Pricing tiers in USD (cents)
export const PRICING = {
  basic: {
    amount: 5900, // $59.00 USD
    currency: 'usd',
    name: 'Santa Video Message',
    description: 'Personalized ~2 minute video from Santa Claus',
    includesLiveCall: false,
  },
  premium: {
    amount: 9900, // $99.00 USD
    currency: 'usd',
    name: 'Video + Live Santa Call',
    description: 'Video + 5 minute live video call with Santa',
    includesLiveCall: true,
  },
} as const

export type PricingTier = keyof typeof PRICING

// Legacy export for backwards compatibility
export const PRODUCT_PRICE = PRICING.basic.amount
