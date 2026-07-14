import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().port().default(3000),
  FRONTEND_URL: Joi.string().uri().default('http://localhost:5173'),
  API_PREFIX: Joi.string().default('api'),
  JWT_SECRET: Joi.string().min(32).required(),
  API_KEY: Joi.string().allow('').optional(),

  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().port().default(5432),
  DB_USERNAME: Joi.string().default('uptime_user'),
  DB_PASSWORD: Joi.string().default('uptime_pass'),
  DB_NAME: Joi.string().default('uptime_monitor'),
  DB_SYNCHRONIZE: Joi.boolean().default(false),
  DB_LOGGING: Joi.boolean().default(false),
  DB_SSL: Joi.boolean().default(false),
  DB_POOL_MAX: Joi.number().default(20),

  MONITORING_INTERVAL: Joi.number()
    .valid(10, 30, 60, 300, 600, 1800, 3600)
    .default(60),
  MONITORING_TIMEOUT: Joi.number().min(1).max(30).default(3),
  MAX_CONCURRENT_CHECKS: Joi.number().min(5).max(100).default(20),
  LOG_RETENTION_DAYS: Joi.number().min(1).max(365).default(30),
  INCIDENT_RETENTION_DAYS: Joi.number().min(30).max(1095).default(365),
});
