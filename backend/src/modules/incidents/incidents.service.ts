import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Incident } from './entities/incident.entity';
import { IncidentQueryDto } from './dto/incident-query.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class IncidentsService {
  constructor(
    @InjectRepository(Incident)
    private incidentRepository: Repository<Incident>,
  ) {}

  async findAll(
    query: IncidentQueryDto,
  ): Promise<PaginatedResponseDto<Incident>> {
    const {
      page = 1,
      limit = 20,
      deviceId,
      resolved,
      startDate,
      endDate,
      sortOrder = 'DESC',
    } = query;

    const qb = this.incidentRepository
      .createQueryBuilder('incident')
      .leftJoinAndSelect('incident.device', 'device');

    if (deviceId) {
      qb.andWhere('incident.deviceId = :deviceId', { deviceId });
    }

    if (resolved !== undefined) {
      if (resolved) {
        qb.andWhere('incident.resolvedAt IS NOT NULL');
      } else {
        qb.andWhere('incident.resolvedAt IS NULL');
      }
    }

    if (startDate) {
      qb.andWhere('incident.startedAt >= :startDate', {
        startDate: new Date(startDate),
      });
    }

    if (endDate) {
      qb.andWhere('incident.startedAt <= :endDate', {
        endDate: new Date(endDate),
      });
    }

    qb.orderBy('incident.startedAt', sortOrder);

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: {
        timestamp: new Date().toISOString(),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  async findByDevice(
    deviceId: string,
    query: IncidentQueryDto,
  ): Promise<PaginatedResponseDto<Incident>> {
    return this.findAll({ ...query, deviceId });
  }

  async findOne(id: string): Promise<Incident | null> {
    return this.incidentRepository.findOne({
      where: { id },
      relations: ['device'],
    });
  }
}
