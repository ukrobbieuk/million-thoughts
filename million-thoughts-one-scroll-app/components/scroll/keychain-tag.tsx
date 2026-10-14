'use client'

import { useEffect, useRef, useState } from 'react'
import { formatThoughtId } from '@/lib/format'
import type { PublicThought } from '@/lib/thoughts'

interface Panel {
  number: number
  name?: string
  message: string
  variant: 'past' | 'current' | 'future'
}

export function KeychainTag({
  thought,
  previous,
}: {
  thought: PublicThought
  previous: PublicThought[]
}) {
  const [tilt, setTilt] = useState({ x: 8, y: -14 })
  const centerRef = useRef<HTMLLIElement>(null)
  const stripRef = useRef<HTMLOListElement>(null)

  const panels: Panel[] = [-2, -1].map((offset) => {
    const n = thought.number + offset
    const found = previous.find((p) => p.number === n)
    return {
      number: n,
      name: found?.name,
      message: n < 1 ? 'Before the first word' : (found?.message ?? '—'),
      variant: 'past' as const,
    }
  })
  panels.push({ number: thought.number, name: thought.name, message: thought.message, variant: 'current' })
  panels.push(
    ...[1, 2].map((offset) => ({
      number: thought.number + offset,
      message: 'Awaiting the next voice',
      variant: 'future' as const,
    })),
  )

  useEffect(() => {
    const strip = stripRef.current
    const center = centerRef.current
    if (!strip || !center) return
    strip.scrollLeft = center.offsetLeft - strip.clientWidth / 2 + center.clientWidth / 2
  }, [])

  function handleMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === 'touch') return
    const rect = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: py * -18, y: px * 22 })
  }

  return (
    <div
      className="flex justify-center py-6 [perspective:1200px]"
      onPointerMove={handleMove}
      onPointerLeave={() => setTilt({ x: 8, y: -14 })}
    >
      <div
        className="relative w-full max-w-lg transition-transform duration-300 ease-out [transform-style:preserve-3d]"
        style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
      >
        <div
          className="absolute top-1/2 -left-7 size-14 -translate-y-1/2 rounded-full border-[5px] border-neutral-400 shadow-[inset_0_2px_3px_rgba(255,255,255,0.5),0_4px_10px_rgba(0,0,0,0.6)]"
          style={{ transform: 'translateZ(-6px) rotateY(55deg)' }}
          aria-hidden="true"
        />
        <figure
          className="relative overflow-hidden rounded-2xl border border-neutral-500/60 bg-[linear-gradient(135deg,#e5e5e5_0%,#a3a3a3_22%,#f5f5f5_48%,#737373_78%,#d4d4d4_100%)] p-[3px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.08)]"
          style={{ transform: 'translateZ(0)' }}
        >
          <div className="relative flex items-stretch rounded-[13px] bg-neutral-950">
            <div className="flex w-10 shrink-0 items-center justify-center border-r border-neutral-800" aria-hidden="true">
              <span className="size-4 rounded-full bg-black shadow-[inset_0_2px_4px_rgba(255,255,255,0.15),0_0_0_2px_#525252]" />
            </div>
            <ol
              ref={stripRef}
              className="relative flex min-w-0 flex-1 snap-x snap-mandatory overflow-x-auto py-4 [scrollbar-width:none]"
              aria-label="Your place on the scroll"
            >
              <span
                className="pointer-events-none absolute top-[2.15rem] left-0 h-px w-[calc(5*9rem)] bg-neutral-700"
                aria-hidden="true"
              />
              {panels.map((p) => (
                <li
                  key={p.number}
                  ref={p.variant === 'current' ? centerRef : undefined}
                  className="relative flex w-36 shrink-0 snap-center flex-col gap-2 px-3"
                  aria-current={p.variant === 'current' ? 'true' : undefined}
                >
                  <span
                    className={`relative z-10 block size-2.5 rounded-full ${p.variant === 'current' ? 'bg-white ring-4 ring-white/20' : p.variant === 'past' ? 'bg-neutral-500' : 'border border-dashed border-neutral-600 bg-neutral-950'}`}
                    aria-hidden="true"
                  />
                  <span
                    className={`font-mono text-[11px] tabular-nums ${p.variant === 'current' ? 'font-bold text-white' : 'text-neutral-500'}`}
                  >
                    {p.number < 1 ? '—' : formatThoughtId(p.number)}
                  </span>
                  <p
                    className={`line-clamp-4 text-pretty break-words text-xs leading-snug ${p.variant === 'current' ? 'font-bold text-white' : p.variant === 'past' ? 'text-neutral-400' : 'italic text-neutral-600'}`}
                  >
                    {p.message}
                  </p>
                  {p.name && (
                    <span className="truncate text-[10px] uppercase tracking-wider text-neutral-600">
                      {p.name}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </div>
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl bg-[linear-gradient(115deg,transparent_30%,rgba(255,255,255,0.12)_45%,transparent_60%)]"
            style={{ transform: `translateX(${tilt.y * 2}%)` }}
            aria-hidden="true"
          />
          <figcaption className="sr-only">
            Keyring tag engraved with thoughts {formatThoughtId(Math.max(1, thought.number - 2))} to{' '}
            {formatThoughtId(thought.number + 2)}, with your thought highlighted in the centre.
          </figcaption>
        </figure>
      </div>
    </div>
  )
}
