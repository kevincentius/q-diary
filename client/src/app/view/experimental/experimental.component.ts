import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalysisService } from '../../service/analysis.service';
import { OpenAIService } from '../../service/openai.service';
import { TopicSuggesterComponent } from './topic-suggester.component';
import { NoteFinderComponent } from './note-finder.component';
import { openaiConfigDefaults } from '../../config/openai.config';

@Component({
  imports: [
    CommonModule,
    FormsModule,
    TopicSuggesterComponent,
    NoteFinderComponent,
  ],
  selector: 'app-experimental',
  standalone: true,
  templateUrl: './experimental.component.html',
  styleUrl: './experimental.component.scss',
})
export class ExperimentalComponent {
  private analysisService = inject(AnalysisService);
  openaiService = inject(OpenAIService);

  startDateTime = signal(this.getDefaultStart());
  endDateTime = signal(this.getDefaultEnd());
  includeTimeSpent = signal(true);
  result = signal<string>('');
  loading = signal(false);

  baseUrl = signal(openaiConfigDefaults.baseUrl);
  model = signal(openaiConfigDefaults.model);
  apiToken = signal(openaiConfigDefaults.apiToken);
  testResult = signal<string>('');
  testing = signal(false);

  updateBaseUrl(value: string) {
    this.baseUrl.set(value);
    this.openaiService.baseUrl.set(value);
  }

  updateModel(value: string) {
    this.model.set(value);
    this.openaiService.model.set(value);
  }

  updateApiToken(value: string) {
    this.apiToken.set(value);
    this.openaiService.apiToken.set(value);
  }

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

  testConnection() {
    this.openaiService.baseUrl.set(this.baseUrl());
    this.openaiService.model.set(this.model());
    this.openaiService.apiToken.set(this.apiToken());

    this.testing.set(true);
    this.testResult.set('');

    this.openaiService.testConnection().subscribe({
      next: (res) => {
        const content = res.choices?.[0]?.message?.content ?? '';
        this.testResult.set(`Connected! Response: ${content}`);
        this.testing.set(false);
      },
      error: (err) => {
        this.testResult.set(`Error: ${err.message}`);
        this.testing.set(false);
      },
    });
  }
}
