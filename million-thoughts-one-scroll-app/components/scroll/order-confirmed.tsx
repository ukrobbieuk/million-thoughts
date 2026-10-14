import { Package } from 'lucide-react'
import { formatThoughtId } from '@/lib/format'
import type { PublicThought } from '@/lib/thoughts'

export function OrderConfirmed({ orderId, thought }: { orderId: number; thought: PublicThought | null }) {
  return (
    <section className="mx-auto w-full max-w-3xl px-5 py-16">
      <Package className="size-8 text-white" aria-hidden="true" />
      <h2 className="mt-6 text-balance text-3xl font-semibold tracking-tight">Your piece of the scroll is on its way.</h2>
      <p className="mt-4 text-pretty leading-relaxed text-neutral-400">
        Order <span className="font-mono text-white">KR-{String(orderId).padStart(5, '0')}</span> is confirmed
        {thought ? (
          <>
            {' '}
            for thought <span className="font-mono text-white">{formatThoughtId(thought.number)}</span>
          </>
        ) : null}
        . We&apos;ll engrave and dispatch your keyring tag shortly.
      </p>
      <a
        href="/"
        className="mt-10 inline-flex rounded-full bg-white px-6 py-3 font-semibold text-black hover:bg-neutral-200"
      >
        Return to the scroll
      </a>
    </section>
  )
}
