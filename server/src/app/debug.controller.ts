import { Controller, Get, Post, Body } from '@nestjs/common';
import type { QEntry } from '@org/shared';
import Database from 'better-sqlite3';
import * as path from 'path';
import * as os from 'os';

const dbPath = path.join(
  os.homedir(),
  'AppData',
  'Roaming',
  'q-diary',
  'q-diary.db'
);
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS qentry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

@Controller('debug')
export class DebugController {
  @Get('qentry')
  getQEntry(): QEntry {
    const row = db
      .prepare('SELECT content FROM qentry ORDER BY id DESC LIMIT 1')
      .get() as { content: string } | undefined;
    return { content: row?.content ?? 'No entry yet' };
  }

  @Post('qentry')
  createQEntry(@Body() body: QEntry): QEntry {
    const stmt = db.prepare('INSERT INTO qentry (content) VALUES (?)');
    const result = stmt.run(body.content);
    return { content: body.content };
  }
}
