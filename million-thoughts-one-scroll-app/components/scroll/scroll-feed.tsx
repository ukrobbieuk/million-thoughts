'use client'

import { useEffect, useRef } from 'react'
import useSWRInfinite from 'swr/infinite'
import { ThoughtCard } from '@/components/scroll/thought-card'
import type { PublicThought } from '@/lib/thoughts'

interface Page {
  items: PublicThought[]
  nextCursor: number | null
  total: number
}

const PAGE_SIZE = 20
const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error('Failed to load thoughts')
    return r.json()
  })

function getKey(index: number, previous: Page | null) {
  if (previous && previous.nextCursor === null) return null
  if (index === 0) return `/api/thoughts?limit=${PAGE_SIZE}`
  return `/api/thoughts?limit=${PAGE_SIZE}&cursor=${previous?.nextCursor}`
}

export function ScrollFeed() {
  const { data, error, size, setSize, isLoading, isValidating } = useSWRInfinite<Page>(
    getKey,
    fetcher,
    { revalidateFirstPage: true },
  )
  const sentinel = useRef<HTMLDivElement>(null)

  const thoughts = data?.flatMap((p) => p.items) ?? []
  const reachedEnd = data ? data[data.length - 1]?.nextCursor === null : false
  const loadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined')

  useEffect(() => {
    const el = sentinel.current
    if (!el || reachedEnd) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isValidating) setSize((s) => s + 1)
      },
      { rootMargin: '600px 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [reachedEnd, isValidating, setSize])

  return (
    <section aria-label="The master scroll" className="mx-auto w-full max-w-3xl px-5">
      {isLoading && (
        <ul className="divide-y divide-neutral-900" aria-hidden="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="flex gap-5 py-7">
              <div className="h-7 w-24 animate-pulse rounded bg-neutral-900" />
              <div className="flex-1 space-y-3">
                <div className="h-3 w-24 animate-pulse rounded bg-neutral-900" />
                <div className="h-4 w-full animate-pulse rounded bg-neutral-900" />
              </div>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p className="py-16 text-center text-sm text-neutral-500">
          The scroll could not be unrolled right now. Please refresh.
        </p>
      )}

      {!isLoading && !error && thoughts.length === 0 && (
        <div className="py-24 text-center">
          <p className="font-mono text-5xl font-semibold tracking-tight text-neutral-800">#000,001</p>
          <p className="mt-4 text-pretty text-neutral-400">
            The scroll is blank. The very first thought in human history&apos;s master scroll is
            still waiting to be written.
          </p>
        </div>
      )}

      {thoughts.length > 0 && (
        <ol className="divide-y divide-neutral-900">
          {thoughts.map((t) => (
            <li key={t.number}>
              <ThoughtCard thought={t} />
            </li>
          ))}
        </ol>
      )}

      <div ref={sentinel} className="h-px" />

      {loadingMore && !isLoading && (
        <p className="py-8 text-center font-mono text-xs uppercase tracking-widest text-neutral-600">
          Unrolling…
        </p>
      )}
      {reachedEnd && thoughts.length > 0 && (
        <p className="py-12 text-center font-mono text-xs uppercase tracking-widest text-neutral-600">
          {'The beginning of the scroll'}
        </p>
      )}
    </section>
  )
}
