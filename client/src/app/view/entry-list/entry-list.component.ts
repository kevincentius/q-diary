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
    const d = new Date(timestamp);
    const dd = String(d.getDate()).padStart(2, '0');
    const MM = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${dd}.${MM}.${yyyy} - ${hh}:${mm}`;
  }

  refresh() {
    this.loadEntries();
  }
}
