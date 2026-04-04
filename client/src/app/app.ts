import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import type { QEntry } from '@org/shared';

@Component({
  imports: [CommonModule],
  selector: 'app-root',
  standalone: true,
  template: `
    <h1>Q-Diary</h1>
    @if (qEntry(); as entry) {
    <p>{{ entry.content }}</p>
    } @else {
    <p>Loading...</p>
    }
  `,
})
export class App {
  private http = inject(HttpClient);
  qEntry = toSignal<QEntry | undefined>(
    this.http.get<QEntry>('http://localhost:3000/api/debug/qentry')
  );
}
