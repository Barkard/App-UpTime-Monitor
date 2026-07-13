import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Device, DeviceProtocol, DeviceStatus } from './entities/device.entity';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { DeviceQueryDto } from './dto/device-query.dto';
import { DeviceResponseDto } from './dto/device-response.dto';
import { DeviceStatsDto } from './dto/device-stats.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';
import {
  MonitoringLog,
  LogStatus,
} from '../monitoring/entities/monitoring-log.entity';

@Injectable()
export class DevicesService {
  private readonly logger = new Logger(DevicesService.name);

  constructor(
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
    @InjectRepository(MonitoringLog)
    private readonly logRepository: Repository<MonitoringLog>,
  ) {}

  async create(createDeviceDto: CreateDeviceDto): Promise<DeviceResponseDto> {
    const existing = await this.deviceRepository.findOne({
      where: {
        host: createDeviceDto.host,
        protocol: createDeviceDto.protocol,
        port: createDeviceDto.port ?? undefined,
      },
    });

    if (existing) {
      throw new ConflictException(
        'Device with this host, protocol, and port already exists',
      );
    }

    const device = this.deviceRepository.create(createDeviceDto);
    const saved = await this.deviceRepository.save(device);
    this.logger.log(`Created device: ${saved.name} (${saved.id})`);
    return this.mapToResponse(saved);
  }

  async findAll(
    query: DeviceQueryDto,
  ): Promise<PaginatedResponseDto<DeviceResponseDto>> {
    const {
      page = 1,
      limit = 20,
      search,
      protocol,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const qb = this.deviceRepository.createQueryBuilder('device');

    if (search) {
      qb.andWhere('(device.name ILIKE :search OR device.host ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (protocol) {
      qb.andWhere('device.protocol = :protocol', { protocol });
    }

    if (isActive !== undefined) {
      qb.andWhere('device.isActive = :isActive', { isActive });
    }

    const validSortFields = [
      'name',
      'host',
      'protocol',
      'createdAt',
      'updatedAt',
    ];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    qb.orderBy(`device.${sortField}`, sortOrder);

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: data.map(this.mapToResponse),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<DeviceResponseDto> {
    const device = await this.deviceRepository.findOne({ where: { id } });
    if (!device) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }
    return this.mapToResponse(device);
  }

  async findOneWithStats(
    id: string,
  ): Promise<DeviceResponseDto & { stats: DeviceStatsDto }> {
    const device = await this.findOne(id);
    const stats = await this.getStats(id);
    return { ...device, stats };
  }

  async update(
    id: string,
    updateDeviceDto: UpdateDeviceDto,
  ): Promise<DeviceResponseDto> {
    const device = await this.deviceRepository.findOne({ where: { id } });
    if (!device) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }

    if (
      updateDeviceDto.host ||
      updateDeviceDto.protocol ||
      updateDeviceDto.port !== undefined
    ) {
      const host = updateDeviceDto.host ?? device.host;
      const protocol = updateDeviceDto.protocol ?? device.protocol;
      const port = updateDeviceDto.port ?? device.port;

      const existing = await this.deviceRepository.findOne({
        where: { host, protocol, port: port ?? undefined },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(
          'Device with this host, protocol, and port already exists',
        );
      }
    }

    Object.assign(device, updateDeviceDto);
    const saved = await this.deviceRepository.save(device);
    this.logger.log(`Updated device: ${saved.name} (${saved.id})`);
    return this.mapToResponse(saved);
  }

  async remove(id: string): Promise<void> {
    const device = await this.deviceRepository.findOne({ where: { id } });
    if (!device) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }

    await this.deviceRepository.remove(device);
    this.logger.log(`Deleted device: ${device.name} (${device.id})`);
  }

  async getStats(deviceId: string): Promise<DeviceStatsDto> {
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [logs24h, logs7d] = await Promise.all([
      this.logRepository.find({
        where: { deviceId, timestamp: Between(dayAgo, now) },
        select: ['status', 'latency'],
      }),
      this.logRepository.find({
        where: { deviceId, timestamp: Between(weekAgo, now) },
        select: ['status', 'latency'],
      }),
    ]);

    const calcStats = (logs: MonitoringLog[]) => {
      const upLogs = logs.filter((l) => l.status === LogStatus.UP);
      const latencies = upLogs
        .filter((l) => l.latency !== null)
        .map((l) => l.latency!);
      const avgLatency =
        latencies.length > 0
          ? latencies.reduce((a, b) => a + b, 0) / latencies.length
          : null;
      return {
        avgLatency,
        uptime: logs.length > 0 ? (upLogs.length / logs.length) * 100 : 100,
        total: logs.length,
        up: upLogs.length,
        down: logs.length - upLogs.length,
      };
    };

    const stats24h = calcStats(logs24h);
    const stats7d = calcStats(logs7d);

    return {
      averageLatency24h: stats24h.avgLatency
        ? Math.round(stats24h.avgLatency)
        : null,
      averageLatency7d: stats7d.avgLatency
        ? Math.round(stats7d.avgLatency)
        : null,
      uptimePercentage24h: Math.round(stats24h.uptime * 100) / 100,
      uptimePercentage7d: Math.round(stats7d.uptime * 100) / 100,
      totalChecks24h: stats24h.total,
      upChecks24h: stats24h.up,
      downChecks24h: stats24h.down,
    };
  }

  async updateLastCheck(
    deviceId: string,
    status: DeviceStatus,
    latency: number | null,
  ): Promise<void> {
    await this.deviceRepository.update(deviceId, {
      lastCheck: new Date(),
      lastStatus: status,
      lastLatency: latency,
    });
  }

  private mapToResponse(device: Device): DeviceResponseDto {
    return {
      id: device.id,
      name: device.name,
      host: device.host,
      protocol: device.protocol,
      port: device.port,
      isActive: device.isActive,
      lastCheck: device.lastCheck,
      lastStatus: device.lastStatus,
      createdAt: device.createdAt,
      updatedAt: device.updatedAt,
    };
  }
}
