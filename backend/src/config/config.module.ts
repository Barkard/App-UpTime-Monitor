import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { validationSchema } from './validation.schema';
import databaseConfig from './database.config';
import appConfig from './app.config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
      load: [databaseConfig, appConfig],
      envFilePath: ['.env.local', '.env'],
      cache: true,
    }),
  ],
})
export class ConfigModule {}
