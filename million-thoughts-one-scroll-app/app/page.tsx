import { Suspense } from 'react'
import { BillboardBanner } from '@/components/scroll/billboard-banner'
import { KeychainPortal } from '@/components/scroll/keychain-portal'
import { OrderConfirmed } from '@/components/scroll/order-confirmed'
import { PaymentIssue } from '@/components/scroll/payment-issue'
import { ScrollFeed } from '@/components/scroll/scroll-feed'
import { ScrollHeader } from '@/components/scroll/scroll-header'
import { InjectThought } from '@/components/scroll/inject-thought'
import { confirmCheckoutSession, getLockedCount } from '@/lib/thoughts'

export const dynamic = 'force-dynamic'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string; session_id?: string }>
}) {
  const { payment, session_id: sessionId } = await searchParams
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY ?? ''

  if (payment === 'success') {
    const result = sessionId ? await confirmCheckoutSession(sessionId) : ({ kind: 'invalid' } as const)
    const total = await getLockedCount()

    return (
      <main className="min-h-dvh">
        <ScrollHeader initialTotal={total} />
        <BillboardBanner />
        {result.kind === 'thought' && (
          <KeychainPortal
            publishableKey={publishableKey}
            sessionId={result.sessionId}
            thought={result.thought}
            previous={result.previous}
          />
        )}
        {result.kind === 'keychain' && (
          <OrderConfirmed orderId={result.orderId} thought={result.thought} />
        )}
        {(result.kind === 'unpaid' || result.kind === 'invalid') && (
          <PaymentIssue kind={result.kind} />
        )}
      </main>
    )
  }

  const total = await getLockedCount()

  return (
    <main className="min-h-dvh pb-32">
      <ScrollHeader initialTotal={total} />
      <BillboardBanner />
      <Suspense>
        <ScrollFeed />
      </Suspense>
      <InjectThought publishableKey={publishableKey} />
    </main>
  )
}
