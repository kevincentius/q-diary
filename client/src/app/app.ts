import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import type { Entry } from '@org/shared';

@Component({
  imports: [CommonModule],
  selector: 'app-root',
  standalone: true,
  template: `
    <h1>Q-Diary</h1>
    @if (entry(); as e) {
    <p>{{ e.content }}</p>
    } @else {
    <p>Loading...</p>
    }
  `,
})
export class App {
  private http = inject(HttpClient);
  entry = toSignal<Entry | undefined>(
    this.http.get<Entry>('http://localhost:3000/api/debug/entry')
  );
}
