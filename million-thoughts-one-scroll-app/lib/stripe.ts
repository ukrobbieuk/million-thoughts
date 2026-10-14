import 'server-only'
import Stripe from 'stripe'

let client: Stripe | null = null

export function getStripe() {
  if (client) return client
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error('Payments are not configured yet (STRIPE_SECRET_KEY is missing).')
  }
  client = new Stripe(secretKey)
  return client
}
