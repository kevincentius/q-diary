import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Thread, Note } from '@org/shared';
import { Subject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AnalysisService {
  private http = inject(HttpClient);

  concatEntries(
    startDateTime: number,
    endDateTime: number,
    includeTimeSpent = true,
  ) {
    return this.http.post<{ content: string }>('/api/analysis/concat', {
      startDateTime,
      endDateTime,
      includeTimeSpent,
    });
  }

  findNotesStream(threads: Thread[], maxEntries = 10): Observable<Note> {
    const subject = new Subject<Note>();

    fetch('/api/analysis/find-notes/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threads, maxEntries }),
    })
      .then(async (response) => {
        if (!response.body) {
          subject.error(new Error('No response body'));
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const note = JSON.parse(line.slice(6)) as Note;
                subject.next(note);
              } catch {
                // not a valid note
              }
            } else if (line.startsWith('event: done')) {
              subject.complete();
            } else if (line.startsWith('event: error')) {
              const errorLine = lines.find((l) => l.startsWith('data: '));
              if (errorLine) {
                try {
                  const err = JSON.parse(errorLine.slice(6));
                  subject.error(new Error(err.message));
                } catch {
                  subject.error(new Error('Unknown error'));
                }
              } else {
                subject.error(new Error('Unknown error'));
              }
            }
          }
        }
      })
      .catch((err) => subject.error(err));

    return subject.asObservable();
  }
}
