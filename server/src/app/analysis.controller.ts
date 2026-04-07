import { Controller, Post, Body } from '@nestjs/common';
import { AnalysisService } from './analysis.service';

@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post('concat')
  concatEntries(
    @Body()
    body: {
      startDateTime: number;
      endDateTime: number;
      includeTimeSpent?: boolean;
    },
  ) {
    return this.analysisService.concatEntries(
      body.startDateTime,
      body.endDateTime,
      body.includeTimeSpent ?? true,
    );
  }
}
