import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabsModule } from 'primeng/tabs';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { EntriesService } from '../../service/entries.service';
import type { Entry } from '@org/shared';

@Component({
  imports: [
    CommonModule,
    FormsModule,
    TabsModule,
    ButtonModule,
    TextareaModule,
  ],
  selector: 'app-entry-detail',
  standalone: true,
  templateUrl: './entry-detail.component.html',
  styleUrl: './entry-detail.component.scss',
})
export class EntryDetailComponent {
  @Input() entry = signal<Entry | null>(null);
  @Output() entrySaved = new EventEmitter<void>();

  private entriesService = inject(EntriesService);

  activeIndex = signal(0);
  isEditing = signal(false);
  editContent = '';

  isWriting = signal(false);
  newEntryContent = '';
  writingStartTime = 0;

  switchTab(index: number) {
    this.activeIndex.set(index);
  }

  startEdit() {
    this.editContent = this.entry()?.content || '';
    this.isEditing.set(true);
  }

  endEdit() {
    this.isEditing.set(false);
    this.editContent = '';
  }

  saveEdit() {
    const currentEntry = this.entry();
    if (!currentEntry) return;

    this.entriesService
      .updateEntry(
        currentEntry.id,
        this.editContent,
        currentEntry.timeSpentWriting,
      )
      .subscribe(() => {
        this.isEditing.set(false);
        this.entrySaved.emit();
      });
  }

  startWriting() {
    this.isWriting.set(true);
    this.writingStartTime = Date.now();
  }

  saveNewEntry() {
    const timeSpent = Date.now() - this.writingStartTime;
    this.entriesService
      .createEntry(this.newEntryContent, timeSpent)
      .subscribe(() => {
        this.isWriting.set(false);
        this.newEntryContent = '';
        this.writingStartTime = 0;
        this.activeIndex.set(0);
        this.entrySaved.emit();
      });
  }

  formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleString();
  }

  formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
}
