import { Injectable, Logger } from '@nestjs/common';
import { networkInterfaces } from 'os';
import { promises as dns } from 'dns';
import { readFile } from 'fs/promises';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IcmpChecker } from '../monitoring/checkers/icmp.checker';
import { Device } from '../devices/entities/device.entity';
import { DiscoveredDeviceDto } from './dto/discovered-device.dto';

const SCAN_CONCURRENCY = 80;
const SCAN_TIMEOUT_MS = 500;

// Keys are the first 3 MAC octets, uppercase, no separators (OUI prefix).
const OUI_VENDORS: Record<string, string> = {
  '001A11': 'Google',
  F4F5E8: 'Google',
  '3C5AB4': 'Apple',
  A483E7: 'Apple',
  '001CB3': 'Apple',
  D0817A: 'Apple',
  '843835': 'Apple',
  '4C57CA': 'Samsung',
  '8C79F5': 'Samsung',
  '5C0A5B': 'Samsung',
  '9C69D3': 'Samsung',
  '54271E': 'TP-Link',
  '50C7BF': 'TP-Link',
  B09575: 'TP-Link',
  '18D6C7': 'TP-Link',
  '30D52E': 'Xiaomi',
  '7811DC': 'Xiaomi',
  F0F5E7: 'Xiaomi',
  '689CE2': 'Amazon',
  FCA183: 'Amazon',
  '44650D': 'Amazon',
  '00B827': 'Raspberry Pi',
  DCA632: 'Raspberry Pi',
  E45F01: 'Raspberry Pi',
  '240AC4': 'Espressif (ESP8266/ESP32)',
  '3C71BF': 'Espressif (ESP8266/ESP32)',
  A020A6: 'Espressif (ESP8266/ESP32)',
  '001B63': 'Intel',
  '00166F': 'Intel',
  '7070AA': 'Cloud Network Technology',
};

@Injectable()
export class NetworkDiscoveryService {
  private readonly logger = new Logger(NetworkDiscoveryService.name);

  constructor(
    private readonly icmpChecker: IcmpChecker,
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
  ) {}

  private getLocalSubnetBase(): string | null {
    const interfaces = networkInterfaces();
    for (const entries of Object.values(interfaces)) {
      for (const entry of entries ?? []) {
        if (entry.family === 'IPv4' && !entry.internal) {
          const parts = entry.address.split('.');
          return `${parts[0]}.${parts[1]}.${parts[2]}`;
        }
      }
    }
    return null;
  }

  private async readArpTable(): Promise<Map<string, string>> {
    const map = new Map<string, string>();
    try {
      const content = await readFile('/proc/net/arp', 'utf-8');
      const lines = content.trim().split('\n').slice(1);
      for (const line of lines) {
        const cols = line.trim().split(/\s+/);
        const [ip, , , mac] = cols;
        if (ip && mac && mac !== '00:00:00:00:00:00') {
          map.set(ip, mac.toUpperCase());
        }
      }
    } catch {
      this.logger.debug('ARP table unavailable on this platform');
    }
    return map;
  }

  private vendorFromMac(mac: string | null): string | null {
    if (!mac) return null;
    const prefix = mac.replace(/:/g, '').toUpperCase().slice(0, 6);
    return OUI_VENDORS[prefix] ?? null;
  }

  private async reverseDns(ip: string): Promise<string | null> {
    try {
      const names = await Promise.race([
        dns.reverse(ip),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 500),
        ),
      ]);
      return names[0] ?? null;
    } catch {
      return null;
    }
  }

  private async runWithConcurrency<T>(
    items: T[],
    limit: number,
    task: (item: T) => Promise<void>,
  ): Promise<void> {
    let index = 0;
    const workers = Array.from({ length: limit }, async () => {
      while (index < items.length) {
        const current = items[index];
        index += 1;
        await task(current);
      }
    });
    await Promise.all(workers);
  }

  async discover(): Promise<DiscoveredDeviceDto[]> {
    const subnetBase = this.getLocalSubnetBase();
    if (!subnetBase) {
      this.logger.warn('Could not determine local subnet for discovery');
      return [];
    }

    const candidates = Array.from({ length: 254 }, (_, i) => i + 1).map(
      (host) => `${subnetBase}.${host}`,
    );

    const aliveIps: string[] = [];
    await this.runWithConcurrency(candidates, SCAN_CONCURRENCY, async (ip) => {
      const result = await this.icmpChecker.check(
        ip,
        undefined,
        SCAN_TIMEOUT_MS,
      );
      if (result.success) {
        aliveIps.push(ip);
      }
    });

    const [arpTable, existingDevices] = await Promise.all([
      this.readArpTable(),
      this.deviceRepository.find({ select: ['id', 'host'] }),
    ]);
    const existingByHost = new Map(existingDevices.map((d) => [d.host, d.id]));

    const results = await Promise.all(
      aliveIps.sort().map(async (ip) => {
        const mac = arpTable.get(ip) ?? null;
        const hostname = await this.reverseDns(ip);
        const existingDeviceId = existingByHost.get(ip) ?? null;
        return {
          ip,
          hostname,
          mac,
          vendor: this.vendorFromMac(mac),
          alreadyMonitored: !!existingDeviceId,
          existingDeviceId,
        };
      }),
    );

    return results;
  }
}
