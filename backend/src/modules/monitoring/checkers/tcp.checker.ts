import { Injectable, Logger } from '@nestjs/common';
import { Checker, CheckerResult } from './checker.interface';
import { createConnection } from 'net';

@Injectable()
export class TcpChecker implements Checker {
  private readonly logger = new Logger(TcpChecker.name);

  async check(
    host: string,
    port: number,
    timeout: number = 3000,
  ): Promise<CheckerResult> {
    if (!port) {
      return {
        success: false,
        latency: null,
        error: 'Port is required for TCP checks',
        timestamp: new Date(),
      };
    }

    const startTime = Date.now();

    return new Promise((resolve) => {
      const socket = createConnection({ host, port, timeout }, () => {
        const latency = Date.now() - startTime;
        socket.destroy();
        resolve({
          success: true,
          latency,
          error: null,
          timestamp: new Date(),
        });
      });

      socket.on('error', (error) => {
        resolve({
          success: false,
          latency: null,
          error: error.message,
          timestamp: new Date(),
        });
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve({
          success: false,
          latency: null,
          error: 'Connection timeout',
          timestamp: new Date(),
        });
      });
    });
  }
}
