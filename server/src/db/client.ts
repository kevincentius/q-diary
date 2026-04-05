import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

const appDataPath = path.join(os.homedir(), 'AppData', 'Roaming', 'q-diary');
if (!fs.existsSync(appDataPath)) {
  fs.mkdirSync(appDataPath, { recursive: true });
}

const dbPath = path.join(appDataPath, 'q-diary.db');
const sqlite = new Database(dbPath);

// Enable WAL mode for better performance
sqlite.pragma('journal_mode = WAL');

// Initialize database - create all tables if not exist
sqlite.exec(`
  -- Entries (raw user input)
  CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL DEFAULT 1,
    content TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    time_spent_writing INTEGER NOT NULL
  );

  -- Points (extracted data from entries)
  CREATE TABLE IF NOT EXISTS points (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL DEFAULT 1,
    source_entry_id INTEGER NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
    created_at INTEGER NOT NULL
  );

  -- Tags (per user)
  CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL DEFAULT 1,
    name TEXT NOT NULL,
    parent_tag_id INTEGER REFERENCES tags(id)
  );

  -- Point Tags (many-to-many, per user)
  CREATE TABLE IF NOT EXISTS point_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL DEFAULT 1,
    point_id INTEGER NOT NULL REFERENCES points(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE
  );

  -- Fields (definitions, per user)
  CREATE TABLE IF NOT EXISTS fields (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL DEFAULT 1,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('numeric', 'timestamp', 'enum', 'text')),
    description TEXT
  );

  -- Enum Values (for enum fields, per user)
  CREATE TABLE IF NOT EXISTS enum_values (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL DEFAULT 1,
    field_id INTEGER NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
    value TEXT NOT NULL
  );

  -- Field Values (actual data, per user)
  CREATE TABLE IF NOT EXISTS field_values (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL DEFAULT 1,
    point_id INTEGER NOT NULL REFERENCES points(id) ON DELETE CASCADE,
    field_id INTEGER NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
    numeric_value INTEGER,
    string_value TEXT
  );

  -- Indexes for performance
  CREATE INDEX IF NOT EXISTS idx_entries_user ON entries(user_id);
  CREATE INDEX IF NOT EXISTS idx_points_user ON points(user_id);
  CREATE INDEX IF NOT EXISTS idx_points_source_entry ON points(source_entry_id);
  CREATE INDEX IF NOT EXISTS idx_tags_user_name ON tags(user_id, name);
  CREATE INDEX IF NOT EXISTS idx_point_tags_user ON point_tags(user_id);
  CREATE INDEX IF NOT EXISTS idx_point_tags_point ON point_tags(point_id);
  CREATE INDEX IF NOT EXISTS idx_point_tags_tag ON point_tags(tag_id);
  CREATE INDEX IF NOT EXISTS idx_fields_user_name ON fields(user_id, name);
  CREATE INDEX IF NOT EXISTS idx_enum_values_user ON enum_values(user_id);
  CREATE INDEX IF NOT EXISTS idx_enum_values_field ON enum_values(field_id);
  CREATE INDEX IF NOT EXISTS idx_field_values_user ON field_values(user_id);
  CREATE INDEX IF NOT EXISTS idx_field_values_point ON field_values(point_id);
  CREATE INDEX IF NOT EXISTS idx_field_values_field ON field_values(field_id);
`);

export const db = drizzle(sqlite, { schema });

export { dbPath };
