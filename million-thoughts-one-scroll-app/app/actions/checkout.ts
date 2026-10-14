'use server'

import { randomUUID } from 'node:crypto'
import { and, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { keychainOrders, thoughts } from '@/lib/db/schema'
import { MAX_MESSAGE_LENGTH, MAX_NAME_LENGTH, PRODUCTS } from '@/lib/products'
import { getStripe } from '@/lib/stripe'

async function getOrigin() {
  const h = await headers()
  const origin = h.get('origin')
  if (origin) return origin
  const host = h.get('x-forwarded-host') ?? h.get('host')
  const proto = h.get('x-forwarded-proto') ?? 'https'
  return `${proto}://${host}`
}

function clean(value: unknown, max: number) {
  if (typeof value !== 'string') return ''
  return value.replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, max + 1)
}

export async function createThoughtCheckout(input: { name: string; message: string }) {
  const name = clean(input.name, MAX_NAME_LENGTH)
  const message = clean(input.message, MAX_MESSAGE_LENGTH)

  if (!name || name.length > MAX_NAME_LENGTH) throw new Error('Please enter a valid name.')
  if (!message || message.length > MAX_MESSAGE_LENGTH) {
    throw new Error(`Your thought must be between 1 and ${MAX_MESSAGE_LENGTH} characters.`)
  }

  const [row] = await db.insert(thoughts).values({ name, message }).returning({ id: thoughts.id })
  const product = PRODUCTS.thought
  const origin = await getOrigin()

  const session = await getStripe().checkout.sessions.create(
    {
      ui_mode: 'embedded_page',
      mode: 'payment',
      return_url: `${origin}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      metadata: { kind: 'thought', thoughtId: String(row.id) },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'gbp',
            unit_amount: product.priceInPence,
            product_data: { name: product.name, description: product.description },
          },
        },
      ],
    },
    { idempotencyKey: `thought-${row.id}-${randomUUID()}` },
  )

  await db.update(thoughts).set({ stripeSessionId: session.id }).where(eq(thoughts.id, row.id))

  if (!session.client_secret) throw new Error('Unable to start checkout.')
  return session.client_secret
}

export async function createKeychainCheckout(input: {
  thoughtSessionId: string
  fullName: string
  address: string
  country: string
}) {
  const fullName = clean(input.fullName, 100)
  const address = clean(input.address, 300)
  const country = clean(input.country, 80)

  if (!fullName || fullName.length > 100) throw new Error('Please enter your full name.')
  if (!address || address.length > 300) throw new Error('Please enter a valid shipping address.')
  if (!country || country.length > 80) throw new Error('Please enter your country.')

  const [thought] = await db
    .select({ id: thoughts.id })
    .from(thoughts)
    .where(
      and(eq(thoughts.stripeSessionId, input.thoughtSessionId), eq(thoughts.status, 'locked')),
    )
  if (!thought) throw new Error('We could not find your locked thought.')

  const [order] = await db
    .insert(keychainOrders)
    .values({ thoughtId: thought.id, fullName, address, country })
    .returning({ id: keychainOrders.id })

  const product = PRODUCTS.keychain
  const origin = await getOrigin()

  const session = await getStripe().checkout.sessions.create(
    {
      ui_mode: 'embedded_page',
      mode: 'payment',
      return_url: `${origin}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      metadata: { kind: 'keychain', orderId: String(order.id) },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'gbp',
            unit_amount: product.priceInPence,
            product_data: { name: product.name, description: product.description },
          },
        },
      ],
    },
    { idempotencyKey: `keychain-${order.id}-${randomUUID()}` },
  )

  await db
    .update(keychainOrders)
    .set({ stripeSessionId: session.id })
    .where(eq(keychainOrders.id, order.id))

  if (!session.client_secret) throw new Error('Unable to start checkout.')
  return session.client_secret
}
