import { Injectable } from '@nestjs/common';
import { db } from '../db/client';
import { entries } from '../db/schema';
import { and, eq, gte, lt, asc } from 'drizzle-orm';
import { getCurrentUserId } from '../db/user';

@Injectable()
export class AnalysisService {
  concatEntries(
    startDateTime: number,
    endDateTime: number,
    includeTimeSpent = true,
  ): { content: string } {
    const userId = getCurrentUserId();
    const result = db
      .select()
      .from(entries)
      .where(
        and(
          eq(entries.userId, userId),
          gte(entries.createdAt, startDateTime),
          lt(entries.createdAt, endDateTime),
        ),
      )
      .orderBy(asc(entries.createdAt))
      .all();

    if (result.length === 0) {
      return { content: '' };
    }

    const sections = result.map((entry) => {
      const date = new Date(entry.createdAt);
      const dateStr = this.formatDate(date);
      let header = dateStr;
      if (includeTimeSpent) {
        header += ` (${this.formatTimeSpent(entry.timeSpentWriting)})`;
      }
      const content = entry.content;

      return `## ${header}

${content}`;
    });

    return { content: sections.join('\n\n') };
  }

  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  }

  private formatTimeSpent(ms: number): string {
    const totalSeconds = Math.round(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes === 0) {
      return `${seconds}s`;
    }
    if (seconds === 0) {
      return `${minutes}m`;
    }
    return `${minutes}m ${seconds}s`;
  }
}
