'use client'

import useSWR from 'swr'
import { formatPadded } from '@/lib/format'
import { MAX_THOUGHTS } from '@/lib/products'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function ScrollHeader({ initialTotal }: { initialTotal: number }) {
  const { data } = useSWR<{ total: number }>('/api/thoughts?limit=1', fetcher, {
    refreshInterval: 15000,
    fallbackData: { total: initialTotal },
  })
  const total = data?.total ?? initialTotal
  const progress = Math.min(100, (total / MAX_THOUGHTS) * 100)

  return (
    <header className="mx-auto w-full max-w-3xl px-5 pt-14 pb-8 md:pt-20">
      <a href="/" className="block">
        <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
          Million Thoughts
          <br />
          <span className="text-neutral-500">One Scroll</span>
        </h1>
      </a>
      <div className="mt-8 flex items-baseline gap-3">
        <span className="relative flex size-2 shrink-0" aria-hidden="true">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-white/60" />
          <span className="relative inline-flex size-2 rounded-full bg-white" />
        </span>
        <p className="font-mono text-sm tabular-nums text-neutral-300 md:text-base" aria-live="polite">
          <span className="font-semibold text-white">{formatPadded(total)}</span>
          <span className="text-neutral-500">{' / 1,000,000'}</span> Thoughts Locked
        </p>
      </div>
      <div
        className="mt-4 h-px w-full bg-neutral-900"
        role="progressbar"
        aria-label="Scroll capacity"
        aria-valuemin={0}
        aria-valuemax={MAX_THOUGHTS}
        aria-valuenow={total}
      >
        <div className="h-px bg-white transition-all" style={{ width: `${Math.max(progress, 0.4)}%` }} />
      </div>
    </header>
  )
}
