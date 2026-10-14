import { integer, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core'

export const thoughts = pgTable('thoughts', {
  id: serial('id').primaryKey(),
  thoughtNumber: integer('thought_number').unique(),
  name: varchar('name', { length: 40 }).notNull(),
  message: varchar('message', { length: 140 }).notNull(),
  status: text('status').notNull().default('pending'),
  stripeSessionId: text('stripe_session_id').unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  lockedAt: timestamp('locked_at', { withTimezone: true }),
})

export const keychainOrders = pgTable('keychain_orders', {
  id: serial('id').primaryKey(),
  thoughtId: integer('thought_id').notNull(),
  fullName: varchar('full_name', { length: 100 }).notNull(),
  address: varchar('address', { length: 300 }).notNull(),
  country: varchar('country', { length: 80 }).notNull(),
  status: text('status').notNull().default('pending'),
  stripeSessionId: text('stripe_session_id').unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  paidAt: timestamp('paid_at', { withTimezone: true }),
})
