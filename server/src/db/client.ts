import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { qEntries } from './schema';
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

// Initialize database - create table if not exists
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS qentries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL DEFAULT 1,
    content TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    time_spent_writing INTEGER NOT NULL
  )
`);

export const db = drizzle(sqlite, { schema: { qEntries } });

export { dbPath };
