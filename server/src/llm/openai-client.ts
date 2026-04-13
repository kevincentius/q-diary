import type { Thread, Note } from '@org/shared';

const DEFAULT_BASE_URL = process.env.OPENAI_BASE_URL || 'http://localhost:8080';
const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'Qwen3.5 4B';
const DEFAULT_API_TOKEN = process.env.OPENAI_API_TOKEN || '';

export class OpenAIClient {
  private baseUrl: string;
  private model: string;
  private apiToken: string;

  constructor(
    baseUrl: string = DEFAULT_BASE_URL,
    model: string = DEFAULT_MODEL,
    apiToken: string = DEFAULT_API_TOKEN,
  ) {
    this.baseUrl = baseUrl;
    this.model = model;
    this.apiToken = apiToken;
  }

  setBaseUrl(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setModel(model: string) {
    this.model = model;
  }

  setApiToken(apiToken: string) {
    this.apiToken = apiToken;
  }

  async checkEntryForThread(
    entry: { id: number; content: string },
    thread: Thread,
  ): Promise<Note[]> {
    const systemPrompt = this.buildSystemPrompt(thread);
    return this.callOpenAIwithSchema(entry, systemPrompt);
  }

  private buildSystemPrompt(thread: Thread): string {
    return `You are a helpful assistant that analyzes diary entries to find relevant information matching a specific thread.

Thread title: ${thread.title}
${thread.description ? `Thread description: ${thread.description}` : ''}

Analyze the diary entry and determine if it contains information relevant to this thread.

Output ONLY valid JSON in this exact format:
{"matches": [{"originalEntrySegment": "...", "additionalContext": "..."}]}

The originalEntrySegment should be a direct excerpt from the entry content that is relevant to the thread. It can be a sentence or multiple paragraphs or even the full entry if everything is relevant. If the excerpt is continuous, it should be represented as a single match. Multiple matches are only needed if there are separate segments in the entry that are relevant to the thread.
The additionalContext is only needed if the originalEntrySegment is unclear on its own due to lack of context. It should provide any necessary information such as what the segment is referring to. If the originalEntrySegment is clear on its own, additionalContext should be omitted.

If there is no match, output: {"matches": []}`;
  }

  private async callOpenAIwithSchema(
    entry: { id: number; content: string },
    systemPrompt: string,
  ): Promise<Note[]> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.apiToken) {
      headers['Authorization'] = `Bearer ${this.apiToken}`;
    }

    const fetchResult = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: entry.content },
        ],
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
    const response = json.choices?.[0]?.message?.content ?? '';

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
            threadTitle: '',
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
}
