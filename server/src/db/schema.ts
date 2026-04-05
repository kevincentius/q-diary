import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// ======================
// Core Entry Table
// ======================

export const entries = sqliteTable('entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().default(1),
  content: text('content').notNull(),
  createdAt: integer('created_at').notNull(),
  timeSpentWriting: integer('time_spent_writing').notNull(),
});

export type Entry = typeof entries.$inferSelect;
export type NewEntry = typeof entries.$inferInsert;

// ======================
// Points (extracted data from entries)
// ======================

export const points = sqliteTable('points', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sourceEntryId: integer('source_entry_id')
    .notNull()
    .references(() => entries.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at').notNull(),
});

export type Point = typeof points.$inferSelect;
export type NewPoint = typeof points.$inferInsert;

// ======================
// Tags
// ======================

export const tags = sqliteTable('tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  parentTagId: integer('parent_tag_id').references((): any => tags.id),
});

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;

// ======================
// Point Tags (many-to-many)
// ======================

export const pointTags = sqliteTable('point_tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  pointId: integer('point_id')
    .notNull()
    .references(() => points.id, { onDelete: 'cascade' }),
  tagId: integer('tag_id')
    .notNull()
    .references(() => tags.id, { onDelete: 'cascade' }),
});

export type PointTag = typeof pointTags.$inferSelect;
export type NewPointTag = typeof pointTags.$inferInsert;

// ======================
// Fields (definitions)
// ======================

export const fieldTypes = {
  numeric: 'numeric',
  timestamp: 'timestamp',
  enum: 'enum',
  text: 'text',
} as const;

export const fields = sqliteTable('fields', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'numeric' | 'timestamp' | 'enum' | 'text'
  description: text('description'),
});

export type Field = typeof fields.$inferSelect;
export type NewField = typeof fields.$inferInsert;

// ======================
// Enum Values (for enum fields)
// ======================

export const enumValues = sqliteTable('enum_values', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  fieldId: integer('field_id')
    .notNull()
    .references(() => fields.id, { onDelete: 'cascade' }),
  value: text('value').notNull(),
});

export type EnumValue = typeof enumValues.$inferSelect;
export type NewEnumValue = typeof enumValues.$inferInsert;

// ======================
// Field Values (actual data)
// ======================

export const fieldValues = sqliteTable('field_values', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  pointId: integer('point_id')
    .notNull()
    .references(() => points.id, { onDelete: 'cascade' }),
  fieldId: integer('field_id')
    .notNull()
    .references(() => fields.id, { onDelete: 'cascade' }),
  numericValue: integer('numeric_value'), // for numeric, timestamp
  stringValue: text('string_value'), // for text, enum (store enum value as string)
});

export type FieldValue = typeof fieldValues.$inferSelect;
export type NewFieldValue = typeof fieldValues.$inferInsert;
