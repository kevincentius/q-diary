import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const qEntries = sqliteTable('qentries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().default(1),
  content: text('content').notNull(),
  createdAt: integer('created_at').notNull(), // plain integer (milliseconds)
  timeSpentWriting: integer('time_spent_writing').notNull(),
});

export type QEntrySelect = typeof qEntries.$inferSelect;
export type QEntryInsert = typeof qEntries.$inferInsert;
