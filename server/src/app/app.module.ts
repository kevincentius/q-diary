import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DebugController } from './debug.controller';
import { EntriesController } from './entries.controller';
import { EntriesService } from './entries.service';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';

@Module({
  imports: [],
  controllers: [
    AppController,
    DebugController,
    EntriesController,
    AnalysisController,
  ],
  providers: [AppService, EntriesService, AnalysisService],
})
export class AppModule {}
