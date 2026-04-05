import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Entry } from '@org/shared';

@Injectable({ providedIn: 'root' })
export class EntriesService {
  private http = inject(HttpClient);

  getAllEntries() {
    return this.http.get<Entry[]>('/api/entries');
  }

  getEntry(id: number) {
    return this.http.get<Entry>(`/api/entries/${id}`);
  }

  createEntry(content: string, timeSpentWriting: number) {
    return this.http.post<Entry>('/api/entries', { content, timeSpentWriting });
  }

  updateEntry(id: number, content: string, timeSpentWriting: number) {
    return this.http.patch<Entry>(`/api/entries/${id}`, {
      content,
      timeSpentWriting,
    });
  }

  deleteEntry(id: number) {
    return this.http.delete(`/api/entries/${id}`);
  }
}
