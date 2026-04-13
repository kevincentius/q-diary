import { Controller, Post, Get, Body, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AnalysisService } from './analysis.service';
import { NoteFinder } from '../llm/note-finder';
import type { Thread, Note } from '@org/shared';

@Controller('analysis')
export class AnalysisController {
  private noteFinder: NoteFinder;

  constructor(private readonly analysisService: AnalysisService) {
    this.noteFinder = new NoteFinder((maxEntries) =>
      analysisService.getEntriesForNotes(maxEntries),
    );
  }

  @Post('concat')
  concatEntries(
    @Body()
    body: {
      startDateTime: number;
      endDateTime: number;
      includeTimeSpent?: boolean;
    },
  ) {
    return this.analysisService.concatEntries(
      body.startDateTime,
      body.endDateTime,
      body.includeTimeSpent ?? true,
    );
  }

  @Post('find-notes/stream')
  async findNotesStream(
    @Body() body: { threads: Thread[]; maxEntries?: number },
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const maxEntries = body.maxEntries ?? 10;
    const aborted = { value: false };

    res.on('close', () => {
      aborted.value = true;
    });

    try {
      const entries = await this.noteFinder.getEntries(maxEntries);

      for (let i = 0; i < entries.length && !aborted.value; i++) {
        const entry = entries[i];

        for (const thread of body.threads) {
          if (aborted.value) break;

          const notes = await this.noteFinder.processEntryThread(entry, thread);
          for (const note of notes) {
            if (aborted.value) break;
            res.write(`data: ${JSON.stringify(note)}\n\n`);
          }
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      res.write(`event: error\ndata: ${JSON.stringify({ message })}\n\n`);
    } finally {
      res.write('event: done\ndata: {"done": true}\n\n');
      res.end();
    }
  }
}
