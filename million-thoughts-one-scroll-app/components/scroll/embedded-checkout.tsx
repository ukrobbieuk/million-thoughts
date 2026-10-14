'use client'

import { useMemo } from 'react'
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

const stripeCache = new Map<string, ReturnType<typeof loadStripe>>()

function getStripe(publishableKey: string) {
  if (!stripeCache.has(publishableKey)) stripeCache.set(publishableKey, loadStripe(publishableKey))
  return stripeCache.get(publishableKey)!
}

export function StripeEmbeddedCheckout({
  publishableKey,
  fetchClientSecret,
}: {
  publishableKey: string
  fetchClientSecret: () => Promise<string>
}) {
  const stripePromise = useMemo(() => getStripe(publishableKey), [publishableKey])

  return (
    <div className="overflow-hidden rounded-xl bg-white">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
