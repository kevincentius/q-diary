import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DebugController } from './debug.controller';
import { EntriesController } from './entries.controller';
import { EntriesService } from './entries.service';

@Module({
  imports: [],
  controllers: [AppController, DebugController, EntriesController],
  providers: [AppService, EntriesService],
})
export class AppModule {}
