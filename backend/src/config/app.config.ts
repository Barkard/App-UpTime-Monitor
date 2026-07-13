import { ConfigService } from '@nestjs/config';

export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  apiPrefix: process.env.API_PREFIX || 'api',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-prod',
  apiKey: process.env.API_KEY,
  monitoring: {
    interval: parseInt(process.env.MONITORING_INTERVAL || '60', 10),
    timeout: parseInt(process.env.MONITORING_TIMEOUT || '3', 10),
    maxConcurrentChecks: parseInt(
      process.env.MAX_CONCURRENT_CHECKS || '20',
      10,
    ),
  },
  retention: {
    logDays: parseInt(process.env.LOG_RETENTION_DAYS || '30', 10),
    incidentDays: parseInt(process.env.INCIDENT_RETENTION_DAYS || '365', 10),
  },
});
