import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { RedisService } from '../cache/redis.service';

@Injectable()
export class HealthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly redis: RedisService,
  ) {}

  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
    };
  }

  async ready() {
    const postgres = this.dataSource.isInitialized;

    let redis = false;
    if (postgres) {
      redis = await this.redis.ping();
    }

    return {
      ready: postgres && redis,
      dependencies: {
        postgres,
        redis,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
