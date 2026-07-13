import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { MonitoringService } from './monitoring.service';
import { CheckResultDto } from './dto/check-result.dto';
import { ApiKeyGuard } from '../common/guards/api-key.guard';

@ApiTags('Monitoring')
@Controller('monitoring')
@UseGuards(ApiKeyGuard)
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Post('check/:deviceId')
  @ApiOperation({ summary: 'Run a manual check for a device' })
  @ApiParam({ name: 'deviceId', description: 'Device UUID' })
  @ApiResponse({ status: 200, type: CheckResultDto })
  async manualCheck(
    @Param('deviceId') deviceId: string,
  ): Promise<CheckResultDto> {
    return this.monitoringService.runManualCheck(deviceId);
  }

  @Get('status')
  @ApiOperation({ summary: 'Get monitoring engine status' })
  @ApiResponse({
    status: 200,
    schema: {
      properties: {
        running: { type: 'boolean' },
        interval: { type: 'number', nullable: true },
      },
    },
  })
  async getStatus() {
    return this.monitoringService.getStatus();
  }
}
