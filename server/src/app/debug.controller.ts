import { Controller, Get, Post, Body } from '@nestjs/common';
import { db } from '../db/client';
import { qEntries, type QEntryInsert } from '../db/schema';
import { desc } from 'drizzle-orm';

@Controller('debug')
export class DebugController {
  @Get('entry')
  async getQEntry() {
    const result = await db
      .select()
      .from(qEntries)
      .orderBy(desc(qEntries.id))
      .limit(1);
    if (result.length === 0) {
      return { content: 'No entry yet' };
    }
    return { content: result[0].content };
  }

  @Post('entry')
  async createQEntry(@Body() body: QEntryInsert) {
    const result = await db
      .insert(qEntries)
      .values({
        userId: body.userId ?? 1,
        content: body.content,
        createdAt: Date.now(), // number in milliseconds
        timeSpentWriting: body.timeSpentWriting,
      })
      .returning();
    return { content: result[0].content };
  }
}
