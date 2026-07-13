import { Injectable, Logger } from '@nestjs/common';
import { Checker, CheckerResult } from './checker.interface';
import * as ping from 'ping';

@Injectable()
export class IcmpChecker implements Checker {
  private readonly logger = new Logger(IcmpChecker.name);

  async check(
    host: string,
    _port?: number,
    timeout: number = 3000,
  ): Promise<CheckerResult> {
    const startTime = Date.now();

    try {
      const result = await ping.promise.probe(host, {
        timeout: Math.ceil(timeout / 1000),
        deadline: Math.ceil(timeout / 1000) + 1,
        extra: ['-c', '1'],
      });

      const latency = Date.now() - startTime;

      return {
        success: result.alive,
        latency: result.alive ? latency : null,
        error: result.alive ? null : 'Host unreachable',
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.warn(`ICMP check failed for ${host}: ${error.message}`);
      return {
        success: false,
        latency: null,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }
}
