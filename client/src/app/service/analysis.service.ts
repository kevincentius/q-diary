import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AnalysisService {
  private http = inject(HttpClient);

  concatEntries(
    startDateTime: number,
    endDateTime: number,
    includeTimeSpent = true,
  ) {
    return this.http.post<{ content: string }>('/api/analysis/concat', {
      startDateTime,
      endDateTime,
      includeTimeSpent,
    });
  }
}
