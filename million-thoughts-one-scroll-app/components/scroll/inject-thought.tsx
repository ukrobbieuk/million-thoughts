'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { ArrowLeft, X } from 'lucide-react'
import { createThoughtCheckout } from '@/app/actions/checkout'
import { StripeEmbeddedCheckout } from '@/components/scroll/embedded-checkout'
import { MAX_MESSAGE_LENGTH, MAX_NAME_LENGTH } from '@/lib/products'

export function InjectThought({ publishableKey }: { publishableKey: string }) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<'compose' | 'pay'>('compose')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const titleId = useId()
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    const t = setTimeout(() => nameRef.current?.focus(), 250)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      clearTimeout(t)
    }
  }, [open])

  const fetchClientSecret = useCallback(async () => {
    try {
      return await createThoughtCheckout({ name, message })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to start checkout.')
      setStep('compose')
      throw e
    }
  }, [name, message])

  const remaining = MAX_MESSAGE_LENGTH - message.length
  const valid = name.trim().length > 0 && message.trim().length > 0 && remaining >= 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!valid) return
    setError(null)
    setStep('pay')
  }

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black via-black/90 to-transparent px-5 pt-16 pb-6">
        <div className="mx-auto max-w-3xl">
          <button
            type="button"
            onClick={() => {
              setStep('compose')
              setOpen(true)
            }}
            className="pointer-events-auto flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-base font-semibold text-black shadow-[0_0_40px_rgba(255,255,255,0.15)] transition hover:bg-neutral-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            Inject Your Thought <span className="font-mono text-neutral-500">(£1)</span>
          </button>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-hidden={!open}
        inert={!open}
        className={`fixed inset-x-0 bottom-0 z-50 max-h-[92dvh] overflow-y-auto rounded-t-3xl border-t border-neutral-800 bg-neutral-950 transition-transform duration-300 ease-out ${open ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="mx-auto max-w-xl px-5 pt-3 pb-8">
          <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-neutral-800" aria-hidden="true" />
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {step === 'pay' && (
                <button
                  type="button"
                  onClick={() => setStep('compose')}
                  className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-900 hover:text-white"
                >
                  <ArrowLeft className="size-5" />
                  <span className="sr-only">Back to edit</span>
                </button>
              )}
              <h2 id={titleId} className="text-xl font-semibold tracking-tight">
                {step === 'compose' ? 'Inject Your Thought' : 'Lock it in for £1'}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-900 hover:text-white"
            >
              <X className="size-5" />
              <span className="sr-only">Close</span>
            </button>
          </div>

          {step === 'compose' ? (
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
              <p className="text-sm leading-relaxed text-neutral-400">
                Once paid, your words receive a permanent number on the scroll and can never be
                edited or removed.
              </p>
              <div className="flex flex-col gap-2">
                <label htmlFor="thought-name" className="text-sm font-medium text-neutral-300">
                  Name
                </label>
                <input
                  ref={nameRef}
                  id="thought-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={MAX_NAME_LENGTH}
                  required
                  autoComplete="nickname"
                  placeholder="How history should remember you"
                  className="rounded-xl border border-neutral-800 bg-black px-4 py-3 text-white placeholder:text-neutral-600 focus:border-white focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between">
                  <label htmlFor="thought-message" className="text-sm font-medium text-neutral-300">
                    Message
                  </label>
                  <span
                    className={`font-mono text-xs tabular-nums ${remaining < 10 ? 'text-white' : 'text-neutral-600'}`}
                    aria-live="polite"
                  >
                    {remaining}
                  </span>
                </div>
                <textarea
                  id="thought-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={MAX_MESSAGE_LENGTH}
                  required
                  rows={4}
                  placeholder="A thought worth keeping for 2062…"
                  className="resize-none rounded-xl border border-neutral-800 bg-black px-4 py-3 text-lg leading-relaxed text-white placeholder:text-neutral-600 focus:border-white focus:outline-none"
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
                Continue to payment
              </button>
            </form>
          ) : (
            <div className="mt-6 flex flex-col gap-4">
              <blockquote className="rounded-xl border border-neutral-800 p-4">
                <p className="text-sm text-neutral-500">{name}</p>
                <p className="mt-1 text-pretty break-words text-white">{message}</p>
              </blockquote>
              <StripeEmbeddedCheckout
                publishableKey={publishableKey}
                fetchClientSecret={fetchClientSecret}
              />
            </div>
          )}
        </div>
      </div>
    </>
  )
}
