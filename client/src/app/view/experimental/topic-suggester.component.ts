import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EntriesService } from '../../service/entries.service';
import { OpenAIService } from '../../service/openai.service';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-topic-suggester',
  standalone: true,
  templateUrl: './topic-suggester.component.html',
  styleUrl: './topic-suggester.component.scss',
})
export class TopicSuggesterComponent {
  private entriesService = inject(EntriesService);
  private openaiService = inject(OpenAIService);

  maxTokens = signal(2000);
  trackedTopics = signal('work, health, family, hobbies');

  suggestions = signal<string[]>([]);
  error = signal<string>('');
  loading = signal(false);

  suggestTopics() {
    this.loading.set(true);
    this.error.set('');
    this.suggestions.set([]);

    this.entriesService.getAllEntries().subscribe({
      next: (entries) => {
        const limit = this.maxTokens();
        let concatenated = '';
        const usedEntries: typeof entries = [];

        for (const entry of entries) {
          if (concatenated.length + entry.content.length > limit) {
            break;
          }
          concatenated += entry.content + '\n\n';
          usedEntries.push(entry);
        }

        const topics = this.trackedTopics()
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t);

        this.callOpenAI(concatenated, topics, usedEntries.length);
      },
      error: (err) => {
        this.error.set(`Failed to load entries: ${err.message}`);
        this.loading.set(false);
      },
    });
  }

  private callOpenAI(
    content: string,
    trackedTopics: string[],
    entryCount: number,
  ) {
    const systemPrompt = `You are a helpful assistant that analyzes diary entries to suggest new topics the user might want to track.
Currently tracked topics: ${trackedTopics.join(', ') || 'none'}
Analyze the diary entries and suggest 3-5 new topics that the user might find valuable to track but aren't currently tracking.
Output ONLY valid JSON in this exact format:
{"suggestions": ["topic1", "topic2", "topic3"]}`;

    this.openaiService
      .chatComplete({
        model: this.openaiService.model(),
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Here are the last ${entryCount} diary entries:\n\n${content}`,
          },
        ],
        max_tokens: 500,
        response_format: OpenAIService.jsonResponseFormat('suggestions', {
          type: 'object',
          properties: {
            suggestions: {
              type: 'array',
              items: { type: 'string' },
            },
          },
          required: ['suggestions'],
          additionalProperties: false,
        }),
      })
      .subscribe({
        next: (res) => {
          const content = res.choices?.[0]?.message?.content ?? '';
          try {
            const parsed = JSON.parse(content);
            if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
              this.suggestions.set(parsed.suggestions);
            } else {
              this.error.set('Invalid response format from model');
            }
          } catch {
            this.error.set(`Failed to parse response: ${content}`);
          }
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(`API Error: ${err.message}`);
          this.loading.set(false);
        },
      });
  }
}
