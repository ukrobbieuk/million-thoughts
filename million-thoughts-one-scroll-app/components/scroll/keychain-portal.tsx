'use client'

import { useCallback, useState } from 'react'
import { Check } from 'lucide-react'
import { createKeychainCheckout } from '@/app/actions/checkout'
import { StripeEmbeddedCheckout } from '@/components/scroll/embedded-checkout'
import { KeychainTag } from '@/components/scroll/keychain-tag'
import { formatThoughtId } from '@/lib/format'
import type { PublicThought } from '@/lib/thoughts'

const inputClass =
  'rounded-xl border border-neutral-800 bg-black px-4 py-3 text-white placeholder:text-neutral-600 focus:border-white focus:outline-none'

export function KeychainPortal({
  publishableKey,
  sessionId,
  thought,
  previous,
}: {
  publishableKey: string
  sessionId: string
  thought: PublicThought
  previous: PublicThought[]
}) {
  const [shipping, setShipping] = useState({ fullName: '', address: '', country: '' })
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchClientSecret = useCallback(async () => {
    try {
      return await createKeychainCheckout({ thoughtSessionId: sessionId, ...shipping })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to start checkout.')
      setPaying(false)
      throw e
    }
  }, [sessionId, shipping])

  const valid = shipping.fullName.trim() && shipping.address.trim() && shipping.country.trim()

  return (
    <section className="mx-auto w-full max-w-3xl px-5 py-10" aria-labelledby="portal-title">
      <div className="flex items-center gap-3 rounded-xl border border-neutral-900 p-4">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-black">
          <Check className="size-4" />
        </span>
        <p className="text-sm text-neutral-300">
          Thought <span className="font-mono font-semibold text-white">{formatThoughtId(thought.number)}</span>{' '}
          is permanently locked into the scroll.
        </p>
      </div>

      <p className="mt-12 font-mono text-xs uppercase tracking-widest text-neutral-500">
        Limited physical edition
      </p>
      <h2 id="portal-title" className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
        Claim Your Physical Piece of the Scroll <span className="text-neutral-500">(£12.00)</span>
      </h2>
      <p className="mt-4 max-w-xl text-pretty leading-relaxed text-neutral-400">
        A brushed-steel keyring tag engraved with your thought and its neighbours on the master
        scroll — the exact five lines that will sit beside yours on the 2062 billboard.
      </p>

      <KeychainTag thought={thought} previous={previous} />

      <div className="mt-4 border-t border-neutral-900 pt-10">
        {!paying ? (
          <form
            className="flex flex-col gap-5"
            onSubmit={(e) => {
              e.preventDefault()
              if (!valid) return
              setError(null)
              setPaying(true)
            }}
          >
            <h3 className="text-lg font-semibold">Shipping details</h3>
            <div className="flex flex-col gap-2">
              <label htmlFor="ship-name" className="text-sm font-medium text-neutral-300">
                Full Name
              </label>
              <input
                id="ship-name"
                required
                maxLength={100}
                autoComplete="name"
                value={shipping.fullName}
                onChange={(e) => setShipping((s) => ({ ...s, fullName: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="ship-address" className="text-sm font-medium text-neutral-300">
                Address
              </label>
              <textarea
                id="ship-address"
                required
                rows={3}
                maxLength={300}
                autoComplete="street-address"
                value={shipping.address}
                onChange={(e) => setShipping((s) => ({ ...s, address: e.target.value }))}
                className={`${inputClass} resize-none`}
                placeholder="Street, city, postcode"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="ship-country" className="text-sm font-medium text-neutral-300">
                Country
              </label>
              <input
                id="ship-country"
                required
                maxLength={80}
                autoComplete="country-name"
                value={shipping.country}
                onChange={(e) => setShipping((s) => ({ ...s, country: e.target.value }))}
                className={inputClass}
              />
            </div>
            {error && (
              <p role="alert" className="text-sm text-red-400">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={!valid}
              className="rounded-full bg-white px-6 py-4 font-semibold text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Claim my keyring — £12.00
            </button>
            <a href="/" className="text-center text-sm text-neutral-500 underline-offset-4 hover:text-white hover:underline">
              No thanks, return to the scroll
            </a>
          </form>
        ) : (
          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => setPaying(false)}
              className="self-start text-sm text-neutral-400 underline-offset-4 hover:text-white hover:underline"
            >
              Edit shipping details
            </button>
            <StripeEmbeddedCheckout publishableKey={publishableKey} fetchClientSecret={fetchClientSecret} />
          </div>
        )}
      </div>
    </section>
  )
}
