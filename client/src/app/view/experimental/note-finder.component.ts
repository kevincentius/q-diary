import { Component, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalysisService } from '../../service/analysis.service';
import { Note } from '@org/shared';
import { Subscription } from 'rxjs';

interface ThreadInput {
  title: string;
  description?: string;
}

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-note-finder',
  standalone: true,
  templateUrl: './note-finder.component.html',
  styleUrl: './note-finder.component.scss',
})
export class NoteFinderComponent implements OnDestroy {
  private analysisService = inject(AnalysisService);

  threadInput = signal(
    'Rain,Any outdoor activity done while it is raining\nCoding,Programming or working on code',
  );
  maxEntries = signal(10);

  notesByThread = signal<Map<string, Note[]>>(new Map());
  error = signal('');
  loading = signal(false);
  done = signal(false);

  private subscription: Subscription | null = null;

  start() {
    const threads = this.parseThreads(this.threadInput());
    if (threads.length === 0) {
      this.error.set('No valid threads found. Please check the input format.');
      return;
    }

    this.loading.set(true);
    this.done.set(false);
    this.error.set('');
    this.notesByThread.set(new Map());

    this.subscription = this.analysisService
      .findNotesStream(threads, this.maxEntries())
      .subscribe({
        next: (note) => this.addNote(note),
        error: (err) => {
          this.error.set(err.message);
          this.loading.set(false);
        },
        complete: () => {
          this.loading.set(false);
          this.done.set(true);
        },
      });
  }

  ngOnDestroy() {
    this.cancel();
  }

  private parseThreads(input: string): ThreadInput[] {
    const lines = input.trim().split('\n');
    const threads: ThreadInput[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const parts = trimmed.split(',');
      if (parts.length >= 1 && parts[0].trim()) {
        threads.push({
          title: parts[0].trim(),
          description: parts.slice(1).join(',').trim() || undefined,
        });
      }
    }

    return threads;
  }

  private addNote(note: Note) {
    const current = this.notesByThread();
    const threadNotes = current.get(note.threadTitle) || [];
    threadNotes.push(note);
    current.set(note.threadTitle, threadNotes);
    this.notesByThread.set(new Map(current));
  }

  cancel() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    this.loading.set(false);
    this.done.set(true);
  }
}
