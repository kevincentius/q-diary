import { Component, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EntryListComponent } from '../entry-list/entry-list.component';
import { EntryDetailComponent } from '../entry-detail/entry-detail.component';
import { EntriesService } from '../../service/entries.service';
import type { Entry } from '@org/shared';

@Component({
  imports: [
    CommonModule,
    RouterModule,
    EntryListComponent,
    EntryDetailComponent,
  ],
  selector: 'app-entries',
  standalone: true,
  templateUrl: './entries.component.html',
  styleUrl: './entries.component.scss',
})
export class EntriesComponent {
  private entriesService = inject(EntriesService);

  @ViewChild('entryList') entryList!: EntryListComponent;

  selectedEntry = signal<Entry | null>(null);

  onEntrySelected(id: number) {
    this.entriesService.getEntry(id).subscribe((entry) => {
      this.selectedEntry.set(entry);
    });
  }

  onEntrySaved() {
    this.selectedEntry.set(null);
    this.entryList.refresh();
  }
}
