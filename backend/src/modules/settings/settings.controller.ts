import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { ApiKeyGuard } from '../common/guards/api-key.guard';

@ApiTags('Settings')
@Controller('settings')
@UseGuards(ApiKeyGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all settings' })
  @ApiResponse({ status: 200, schema: { type: 'object' } })
  async getAll() {
    return this.settingsService.getAll();
  }

  @Patch()
  @ApiOperation({ summary: 'Update settings' })
  @ApiResponse({ status: 200, schema: { type: 'object' } })
  async update(@Body() dto: UpdateSettingsDto) {
    await this.settingsService.updateMultiple(dto as Record<string, string>);
    return this.settingsService.getAll();
  }
}
