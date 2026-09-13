import { Injectable } from '@nestjs/common';
import {
  Counter,
  Histogram,
  Registry,
  collectDefaultMetrics,
} from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly registry = new Registry();

  private readonly httpRequests = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status'],
    registers: [this.registry],
  });

  private readonly httpDuration = new Histogram({
    name: 'http_request_duration_ms',
    help: 'HTTP request duration in milliseconds',
    labelNames: ['method', 'route', 'status'],
    buckets: [5, 10, 25, 50, 100, 250, 500, 1000],
    registers: [this.registry],
  });

  constructor() {
    collectDefaultMetrics({ register: this.registry });
  }

  observeHttpRequest(
    method: string,
    route: string,
    status: number,
    durationMs: number,
  ) {
    const labels = {
      method,
      route,
      status: String(status),
    };

    this.httpRequests.inc(labels);
    this.httpDuration.observe(labels, durationMs);
  }

  getMetrics() {
    return this.registry.metrics();
  }
}
