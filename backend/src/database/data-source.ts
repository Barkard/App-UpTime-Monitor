import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';

dotenv.config({ path: ['.env.local', '.env'] });

ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: ['.env.local', '.env'],
});

const configService = new ConfigService();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: configService.get('DB_HOST', 'localhost'),
  port: configService.get('DB_PORT', 5432),
  username: configService.get('DB_USERNAME', 'uptime_user'),
  password: configService.get('DB_PASSWORD', 'uptime_pass'),
  database: configService.get('DB_NAME', 'uptime_monitor'),
  synchronize: configService.get('DB_SYNCHRONIZE') === 'true',
  logging: configService.get('DB_LOGGING') === 'true',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
  ssl:
    configService.get('DB_SSL') === 'true'
      ? { rejectUnauthorized: false }
      : false,
};

export const dataSource = new DataSource(dataSourceOptions);
