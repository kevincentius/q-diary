import type { Thread, Note } from '@org/shared';
import { OpenAIClient } from './openai-client';

export interface NoteFinderDependencies {
  getEntries: (
    maxEntries: number,
  ) => Promise<{ id: number; content: string }[]>;
}

export class NoteFinder {
  private client: OpenAIClient;
  private entryFetcher: NoteFinderDependencies['getEntries'];

  constructor(
    entryFetcher: NoteFinderDependencies['getEntries'],
    client?: OpenAIClient,
  ) {
    this.entryFetcher = entryFetcher;
    this.client = client || new OpenAIClient();
  }

  setBaseUrl(baseUrl: string) {
    this.client.setBaseUrl(baseUrl);
  }

  setModel(model: string) {
    this.client.setModel(model);
  }

  setApiToken(apiToken: string) {
    this.client.setApiToken(apiToken);
  }

  async findNotesForThread(
    thread: Thread,
    maxEntries: number,
    aborted: { value: boolean },
  ): Promise<Note[]> {
    const entries = await this.entryFetcher(maxEntries);
    const notes: Note[] = [];

    for (const entry of entries) {
      if (aborted.value) break;
      const entryNotes = await this.client.checkEntryForThread(entry, thread);
      for (const note of entryNotes) {
        note.threadTitle = thread.title;
      }
      notes.push(...entryNotes);
    }
    return notes;
  }

  async processEntryThread(
    entry: { id: number; content: string },
    thread: Thread,
  ): Promise<Note[]> {
    const notes = await this.client.checkEntryForThread(entry, thread);
    for (const note of notes) {
      note.threadTitle = thread.title;
    }
    return notes;
  }

  async getEntries(
    maxEntries: number,
  ): Promise<{ id: number; content: string }[]> {
    return this.entryFetcher(maxEntries);
  }
}
