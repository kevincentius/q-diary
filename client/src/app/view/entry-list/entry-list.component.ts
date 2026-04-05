import { Component, inject, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EntriesService } from '../../service/entries.service';
import type { Entry } from '@org/shared';

@Component({
  imports: [CommonModule],
  selector: 'app-entry-list',
  standalone: true,
  templateUrl: './entry-list.component.html',
  styleUrl: './entry-list.component.scss',
})
export class EntryListComponent {
  private entriesService = inject(EntriesService);

  @Output() entrySelected = new EventEmitter<number>();

  entries = signal<Entry[]>([]);
  selectedId = signal<number | null>(null);

  constructor() {
    this.loadEntries();
  }

  loadEntries() {
    this.entriesService.getAllEntries().subscribe((data) => {
      this.entries.set(data);
    });
  }

  selectEntry(id: number) {
    this.selectedId.set(id);
    this.entrySelected.emit(id);
  }

  formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleString();
  }

  refresh() {
    this.loadEntries();
  }
}
