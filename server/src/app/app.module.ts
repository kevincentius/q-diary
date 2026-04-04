import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DebugController } from './debug.controller';

@Module({
  imports: [],
  controllers: [AppController, DebugController],
  providers: [AppService],
})
export class AppModule {}
