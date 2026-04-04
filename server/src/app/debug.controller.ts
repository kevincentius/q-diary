import { Controller, Get, Post, Body, Logger } from '@nestjs/common';
import type { QEntry } from '@org/shared';
import Database from 'better-sqlite3';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

const appDataPath = path.join(os.homedir(), 'AppData', 'Roaming', 'q-diary');
if (!fs.existsSync(appDataPath)) {
  fs.mkdirSync(appDataPath, { recursive: true });
}

const logPath = path.join(appDataPath, 'server.log');
const logger = new Logger('DebugController');

const dbPath = path.join(appDataPath, 'q-diary.db');
const db = new Database(dbPath);

fs.writeFileSync(
  logPath,
  `[${new Date().toISOString()}] Server starting, db: ${dbPath}\n`
);

db.exec(`
  CREATE TABLE IF NOT EXISTS qentry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

fs.appendFileSync(
  logPath,
  `[${new Date().toISOString()}] Database initialized\n`
);

@Controller('debug')
export class DebugController {
  @Get('qentry')
  getQEntry(): QEntry {
    logger.log('GET /api/debug/qentry');
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] GET qentry\n`);
    const row = db
      .prepare('SELECT content FROM qentry ORDER BY id DESC LIMIT 1')
      .get() as { content: string } | undefined;
    const result = { content: row?.content ?? 'No entry yet' };
    fs.appendFileSync(
      logPath,
      `[${new Date().toISOString()}] Result: ${JSON.stringify(result)}\n`
    );
    return result;
  }

  @Post('qentry')
  createQEntry(@Body() body: QEntry): QEntry {
    fs.appendFileSync(
      logPath,
      `[${new Date().toISOString()}] POST qentry: ${JSON.stringify(body)}\n`
    );
    const stmt = db.prepare('INSERT INTO qentry (content) VALUES (?)');
    stmt.run(body.content);
    return { content: body.content };
  }
}
