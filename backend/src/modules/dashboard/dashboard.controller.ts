import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(ApiKeyGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get KPI stats for dashboard' })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        active: { type: 'number' },
        up: { type: 'number' },
        down: { type: 'number' },
      },
    },
  })
  async getStats() {
    return this.dashboardService.getStats();
  }

  @Get('devices')
  @ApiOperation({ summary: 'Get device grid data with sparklines' })
  @ApiResponse({ status: 200, schema: { type: 'array' } })
  async getDevices() {
    return this.dashboardService.getDevicesWithSparkline();
  }

  @Get('incidents')
  @ApiOperation({ summary: 'Get recent incidents for bento widget' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, schema: { type: 'array' } })
  async getIncidents(@Query('limit') limit?: number) {
    return this.dashboardService.getRecentIncidents(limit || 10);
  }
}
