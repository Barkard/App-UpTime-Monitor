import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { IncidentsService } from './incidents.service';
import { IncidentQueryDto } from './dto/incident-query.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { Incident } from './entities/incident.entity';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';

@ApiTags('Incidents')
@Controller('incidents')
@UseGuards(ApiKeyGuard)
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Get()
  @ApiOperation({ summary: 'List incidents with pagination and filters' })
  @ApiResponse({ status: 200, type: PaginatedResponseDto<Incident> })
  async findAll(
    @Query() query: IncidentQueryDto,
  ): Promise<PaginatedResponseDto<Incident>> {
    return this.incidentsService.findAll(query);
  }

  @Get('device/:deviceId')
  @ApiOperation({ summary: 'Get incidents for a specific device' })
  @ApiParam({ name: 'deviceId', description: 'Device UUID' })
  @ApiResponse({ status: 200, type: PaginatedResponseDto<Incident> })
  async findByDevice(
    @Param('deviceId') deviceId: string,
    @Query() query: IncidentQueryDto,
  ): Promise<PaginatedResponseDto<Incident>> {
    return this.incidentsService.findByDevice(deviceId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get incident by ID' })
  @ApiParam({ name: 'id', description: 'Incident UUID' })
  @ApiResponse({ status: 200, type: Incident })
  async findOne(@Param('id') id: string): Promise<Incident | null> {
    return this.incidentsService.findOne(id);
  }
}
