import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';

import { HealthService } from './health.service';

@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('/health')
  health() {
    return this.healthService.health();
  }

  @Get('/ready')
  async ready() {
    const result = await this.healthService.ready();

    if (!result.ready) {
      throw new HttpException(result, HttpStatus.SERVICE_UNAVAILABLE);
    }

    return result;
  }
}
