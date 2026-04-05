import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { EntriesService } from './entries.service';

@Controller('entries')
export class EntriesController {
  constructor(private readonly entriesService: EntriesService) {}

  @Get()
  getAllEntries() {
    return this.entriesService.getAllEntries();
  }

  @Get(':id')
  getEntryById(@Param('id', ParseIntPipe) id: number) {
    const entry = this.entriesService.getEntryById(id);
    if (!entry) {
      return { error: 'Entry not found' };
    }
    return entry;
  }

  @Post()
  createEntry(@Body() body: { content: string; timeSpentWriting: number }) {
    return this.entriesService.createEntry(body.content, body.timeSpentWriting);
  }

  @Patch(':id')
  updateEntry(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { content: string; timeSpentWriting: number },
  ) {
    const entry = this.entriesService.updateEntry(
      id,
      body.content,
      body.timeSpentWriting,
    );
    if (!entry) {
      return { error: 'Entry not found' };
    }
    return entry;
  }

  @Delete(':id')
  deleteEntry(@Param('id', ParseIntPipe) id: number) {
    const deleted = this.entriesService.deleteEntry(id);
    return { success: deleted };
  }
}
