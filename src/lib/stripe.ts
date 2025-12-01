import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-11-17.clover',
  typescript: true,
})

// Pricing tiers in PLN (grosze = cents equivalent)
export const PRICING = {
  basic: {
    amount: 25900, // 259.00 PLN
    currency: 'pln',
    name: 'Film od Mikołaja',
    description: 'Spersonalizowany ~2 minutowy film od Świętego Mikołaja',
    includesLiveCall: false,
  },
  premium: {
    amount: 39900, // 399.00 PLN
    currency: 'pln',
    name: 'Film + Rozmowa z Mikołajem',
    description: 'Film + 5 minut rozmowy video z Mikołajem na żywo',
    includesLiveCall: true,
  },
} as const

export type PricingTier = keyof typeof PRICING

// Legacy export for backwards compatibility
export const PRODUCT_PRICE = PRICING.basic.amount
