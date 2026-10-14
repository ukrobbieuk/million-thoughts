import 'server-only'
import { and, count, desc, eq, inArray, isNotNull, lt, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { keychainOrders, thoughts } from '@/lib/db/schema'
import { getStripe } from '@/lib/stripe'

export interface PublicThought {
  number: number
  name: string
  message: string
  lockedAt: string
}

function toPublic(row: typeof thoughts.$inferSelect): PublicThought {
  return {
    number: row.thoughtNumber ?? 0,
    name: row.name,
    message: row.message,
    lockedAt: (row.lockedAt ?? row.createdAt).toISOString(),
  }
}

export async function getLockedCount() {
  const [row] = await db
    .select({ value: count() })
    .from(thoughts)
    .where(eq(thoughts.status, 'locked'))
  return row?.value ?? 0
}

export async function getThoughtsPage(cursor: number | null, limit: number) {
  const rows = await db
    .select()
    .from(thoughts)
    .where(
      and(
        eq(thoughts.status, 'locked'),
        isNotNull(thoughts.thoughtNumber),
        cursor ? lt(thoughts.thoughtNumber, cursor) : undefined,
      ),
    )
    .orderBy(desc(thoughts.thoughtNumber))
    .limit(limit + 1)

  const hasMore = rows.length > limit
  const items = rows.slice(0, limit).map(toPublic)
  return { items, nextCursor: hasMore ? items[items.length - 1].number : null }
}

export type ConfirmedSession =
  | { kind: 'thought'; thought: PublicThought; previous: PublicThought[]; sessionId: string }
  | { kind: 'keychain'; thought: PublicThought | null; orderId: number }
  | { kind: 'unpaid' }
  | { kind: 'invalid' }

export async function confirmCheckoutSession(sessionId: string): Promise<ConfirmedSession> {
  if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return { kind: 'invalid' }

  let session
  try {
    session = await getStripe().checkout.sessions.retrieve(sessionId)
  } catch {
    return { kind: 'invalid' }
  }

  if (session.payment_status !== 'paid') return { kind: 'unpaid' }

  const kind = session.metadata?.kind

  if (kind === 'thought') {
    const thoughtId = Number(session.metadata?.thoughtId)
    if (!Number.isInteger(thoughtId)) return { kind: 'invalid' }

    await db
      .update(thoughts)
      .set({
        status: 'locked',
        thoughtNumber: sql`nextval('thought_number_seq')`,
        lockedAt: new Date(),
      })
      .where(
        and(
          eq(thoughts.id, thoughtId),
          eq(thoughts.stripeSessionId, sessionId),
          eq(thoughts.status, 'pending'),
        ),
      )

    const [row] = await db
      .select()
      .from(thoughts)
      .where(and(eq(thoughts.id, thoughtId), eq(thoughts.stripeSessionId, sessionId)))
    if (!row?.thoughtNumber) return { kind: 'invalid' }

    const neighbourNumbers = [row.thoughtNumber - 2, row.thoughtNumber - 1].filter((n) => n > 0)
    const neighbours = neighbourNumbers.length
      ? await db
          .select()
          .from(thoughts)
          .where(inArray(thoughts.thoughtNumber, neighbourNumbers))
      : []

    return {
      kind: 'thought',
      sessionId,
      thought: toPublic(row),
      previous: neighbours.map(toPublic).sort((a, b) => a.number - b.number),
    }
  }

  if (kind === 'keychain') {
    const orderId = Number(session.metadata?.orderId)
    if (!Number.isInteger(orderId)) return { kind: 'invalid' }

    await db
      .update(keychainOrders)
      .set({ status: 'paid', paidAt: new Date() })
      .where(
        and(
          eq(keychainOrders.id, orderId),
          eq(keychainOrders.stripeSessionId, sessionId),
          eq(keychainOrders.status, 'pending'),
        ),
      )

    const [order] = await db
      .select()
      .from(keychainOrders)
      .where(and(eq(keychainOrders.id, orderId), eq(keychainOrders.stripeSessionId, sessionId)))
    if (!order) return { kind: 'invalid' }

    const [row] = await db.select().from(thoughts).where(eq(thoughts.id, order.thoughtId))
    return { kind: 'keychain', orderId: order.id, thought: row ? toPublic(row) : null }
  }

  return { kind: 'invalid' }
}
