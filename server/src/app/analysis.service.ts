import { Injectable } from '@nestjs/common';
import { db } from '../db/client';
import { entries } from '../db/schema';
import { and, eq, gte, lt, asc, desc } from 'drizzle-orm';
import { getCurrentUserId } from '../db/user';
import type { Thread, Note } from '@org/shared';

interface AbortSignal {
  value: boolean;
}

@Injectable()
export class AnalysisService {
  private baseUrl = process.env.OPENAI_BASE_URL || 'http://localhost:8080';
  private model = process.env.OPENAI_MODEL || 'Qwen3.5 4B';
  private apiToken = process.env.OPENAI_API_TOKEN || '';

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
      return `## ${header}\n\n${entry.content}`;
    });

    return { content: sections.join('\n\n') };
  }

  async findNotesForThread(
    thread: Thread,
    maxEntries: number,
    aborted: AbortSignal,
  ): Promise<Note[]> {
    const userId = getCurrentUserId();
    const dbEntries = db
      .select()
      .from(entries)
      .where(eq(entries.userId, userId))
      .orderBy(desc(entries.createdAt))
      .limit(maxEntries)
      .all();
    const notes: Note[] = [];

    for (const entry of dbEntries) {
      if (aborted.value) break;
      const entryNotes = await this.checkEntryForThread(entry, thread);
      notes.push(...entryNotes);
    }
    return notes;
  }

  private async checkEntryForThread(
    entry: { id: number; content: string },
    thread: Thread,
  ): Promise<Note[]> {
    const systemPrompt = `You are a helpful assistant that analyzes diary entries to find relevant information matching a specific thread.

Thread title: ${thread.title}
${thread.description ? `Thread description: ${thread.description}` : ''}

Analyze the diary entry and determine if it contains information relevant to this thread.

Output ONLY valid JSON in this exact format:
{"matches": [{"originalEntrySegment": "...", "additionalContext": "..."}]}

The originalEntrySegment should be a direct excerpt from the entry content that is relevant to the thread. It can be a sentence or multiple paragraphs or even the full entry if everything is relevant. If the excerpt is continuous, it should be represented as a single match. Multiple matches are only needed if there are separate segments in the entry that are relevant to the thread.
The additionalContext is only needed if the originalEntrySegment is unclear on its own due to lack of context. It should provide any necessary information such as what the segment is referring to. If the originalEntrySegment is clear on its own, additionalContext should be omitted.

If there is no match, output: {"matches": []}`;

    const response = await this.callOpenAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: entry.content },
    ]);

    try {
      const parsed = JSON.parse(response);
      if (
        parsed.matches &&
        Array.isArray(parsed.matches) &&
        parsed.matches.length > 0
      ) {
        return parsed.matches.map(
          (m: {
            originalEntrySegment: string;
            additionalContext?: string;
          }) => ({
            threadTitle: thread.title,
            originalEntryId: entry.id,
            originalEntrySegment: m.originalEntrySegment,
            additionalContext: m.additionalContext,
          }),
        );
      }
    } catch {
      console.error('[NoteFinder] Failed to parse LLM response:', response);
    }
    return [];
  }

  private async callOpenAI(
    messages: { role: string; content: string }[],
  ): Promise<string> {
    const headers = { 'Content-Type': 'application/json' };
    const authHeader = this.apiToken
      ? { Authorization: `Bearer ${this.apiToken}` }
      : {};
    const allHeaders = { ...headers, ...authHeader };

    const fetchResult = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: allHeaders,
      body: JSON.stringify({
        model: this.model,
        messages,
        max_tokens: 2000,
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'note_finder',
            schema: {
              type: 'object',
              properties: {
                matches: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      originalEntrySegment: { type: 'string' },
                      additionalContext: { type: 'string' },
                    },
                    required: ['originalEntrySegment'],
                    additionalProperties: false,
                  },
                },
              },
              required: ['matches'],
              additionalProperties: false,
            },
            strict: true,
          },
        },
      }),
    });

    if (!fetchResult.ok) {
      const errText = await fetchResult.text();
      throw new Error(`OpenAI API error: ${fetchResult.status} ${errText}`);
    }

    const json = (await fetchResult.json()) as {
      choices?: { message: { content: string } }[];
    };
    return json.choices?.[0]?.message?.content ?? '';
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
    if (minutes === 0) return `${seconds}s`;
    if (seconds === 0) return `${minutes}m`;
    return `${minutes}m ${seconds}s`;
  }
}
