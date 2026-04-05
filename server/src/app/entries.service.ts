import { Injectable } from '@nestjs/common';
import { db } from '../db/client';
import { entries } from '../db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { getCurrentUserId } from '../db/user';
import type { Entry } from '@org/shared';

@Injectable()
export class EntriesService {
  getAllEntries(): Entry[] {
    const userId = getCurrentUserId();
    const result = db
      .select()
      .from(entries)
      .where(eq(entries.userId, userId))
      .orderBy(desc(entries.createdAt))
      .limit(100)
      .all();
    return result;
  }

  getEntryById(id: number): Entry | undefined {
    const userId = getCurrentUserId();
    const result = db
      .select()
      .from(entries)
      .where(and(eq(entries.userId, userId), eq(entries.id, id)))
      .limit(1)
      .get();
    return result;
  }

  createEntry(content: string, timeSpentWriting: number): Entry {
    const userId = getCurrentUserId();
    const createdAt = Date.now();
    const result = db
      .insert(entries)
      .values({
        userId,
        content,
        createdAt,
        timeSpentWriting,
      })
      .returning()
      .get();
    return result;
  }

  updateEntry(
    id: number,
    content: string,
    timeSpentWriting: number,
  ): Entry | undefined {
    const userId = getCurrentUserId();
    const result = db
      .update(entries)
      .set({ content, timeSpentWriting })
      .where(and(eq(entries.id, id), eq(entries.userId, userId)))
      .returning()
      .get();
    return result;
  }

  deleteEntry(id: number): boolean {
    const userId = getCurrentUserId();
    const result = db
      .delete(entries)
      .where(and(eq(entries.id, id), eq(entries.userId, userId)))
      .run();
    return result.changes > 0;
  }
}
