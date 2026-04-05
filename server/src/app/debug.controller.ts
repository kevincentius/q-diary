import { Controller, Get, Post, Body } from '@nestjs/common';
import { db } from '../db/client';
import { entries, type NewEntry } from '../db/schema';
import { desc } from 'drizzle-orm';

@Controller('debug')
export class DebugController {
  @Get('entry')
  async getEntry() {
    const result = await db
      .select()
      .from(entries)
      .orderBy(desc(entries.id))
      .limit(1);
    if (result.length === 0) {
      return { content: 'No entry yet' };
    }
    return { content: result[0].content };
  }

  @Post('entry')
  async createEntry(@Body() body: NewEntry) {
    const result = await db
      .insert(entries)
      .values({
        userId: body.userId ?? 1,
        content: body.content,
        createdAt: Date.now(),
        timeSpentWriting: body.timeSpentWriting,
      })
      .returning();
    return { content: result[0].content };
  }
}
