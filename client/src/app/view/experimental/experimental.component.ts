import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalysisService } from '../../service/analysis.service';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-experimental',
  standalone: true,
  templateUrl: './experimental.component.html',
  styleUrl: './experimental.component.scss',
})
export class ExperimentalComponent {
  private analysisService = inject(AnalysisService);

  startDateTime = signal(this.getDefaultStart());
  endDateTime = signal(this.getDefaultEnd());
  includeTimeSpent = signal(true);
  result = signal<string>('');
  loading = signal(false);

  private getDefaultStart(): string {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    d.setHours(3, 0, 0, 0);
    return this.toDatetimeLocal(d);
  }

  private getDefaultEnd(): string {
    const d = new Date();
    d.setHours(3, 0, 0, 0);
    return this.toDatetimeLocal(d);
  }

  private toDatetimeLocal(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  private toTimestamp(str: string): number {
    return new Date(str).getTime();
  }

  concat() {
    this.loading.set(true);
    this.analysisService
      .concatEntries(
        this.toTimestamp(this.startDateTime()),
        this.toTimestamp(this.endDateTime()),
        this.includeTimeSpent(),
      )
      .subscribe({
        next: (res) => {
          this.result.set(res.content);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }

  get contentLength(): number {
    return this.result().length;
  }
}
