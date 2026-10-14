import { formatThoughtId, formatTimestamp } from '@/lib/format'
import type { PublicThought } from '@/lib/thoughts'

export function ThoughtCard({ thought }: { thought: PublicThought }) {
  return (
    <article className="flex flex-col gap-3 py-7 sm:flex-row sm:gap-8">
      <p className="shrink-0 font-mono text-2xl font-semibold tabular-nums tracking-tight text-white sm:w-36 sm:text-3xl">
        {formatThoughtId(thought.number)}
      </p>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 className="truncate text-sm font-medium text-neutral-300">{thought.name}</h2>
          <time dateTime={thought.lockedAt} className="font-mono text-xs text-neutral-600">
            {formatTimestamp(thought.lockedAt)}
          </time>
        </div>
        <p className="mt-2 text-pretty break-words text-lg leading-relaxed text-white">
          {thought.message}
        </p>
      </div>
    </article>
  )
}
