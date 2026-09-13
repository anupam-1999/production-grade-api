import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RedisService } from '../cache/redis.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskStatus } from './entities/task.entity';

export interface TaskPage {
  items: Task[];
  page: number;
  limit: number;
  total: number;
}

@Injectable()
export class TasksService {
  private readonly cachePrefix = 'tasks:list';

  constructor(
    @InjectRepository(Task)
    private readonly repository: Repository<Task>,
    private readonly redis: RedisService,
  ) {}

  async create(dto: CreateTaskDto): Promise<Task> {
    const task = this.repository.create({
      title: dto.title,
      description: dto.description ?? null,
    });

    const saved = await this.repository.save(task);
    await this.invalidateListCache();

    return saved;
  }

  async findAll(query: TaskQueryDto): Promise<TaskPage> {
    const cacheKey = this.getCacheKey(query);
    const cached = await this.redis.get<TaskPage>(cacheKey);

    if (cached) {
      return cached;
    }

    const qb = this.repository
      .createQueryBuilder('task')
      .orderBy('task.createdAt', 'DESC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit);

    if (query.status) {
      qb.andWhere('task.status = :status', { status: query.status });
    }

    const [items, total] = await qb.getManyAndCount();

    const result = {
      items,
      page: query.page,
      limit: query.limit,
      total,
    };

    await this.redis.set(cacheKey, result);
    return result;
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.repository.findOne({ where: { id } });

    if (!task) {
      throw new NotFoundException(`Task ${id} not found`);
    }

    return task;
  }

  async update(id: string, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);

    Object.assign(task, dto);
    const saved = await this.repository.save(task);

    await this.invalidateListCache();
    return saved;
  }

  async remove(id: string): Promise<void> {
    const task = await this.findOne(id);
    await this.repository.remove(task);

    await this.invalidateListCache();
  }

  private getCacheKey(query: TaskQueryDto) {
    return `${this.cachePrefix}:${query.page}:${query.limit}:${query.status ?? 'ALL'}`;
  }

  private async invalidateListCache() {
    // The demo uses a bounded keyspace. A production implementation could
    // use Redis SCAN or versioned cache keys for a large keyspace.
    for (let page = 1; page <= 10; page += 1) {
      for (const limit of [10, 20, 50, 100]) {
        for (const status of ['ALL', ...Object.values(TaskStatus)]) {
          await this.redis.del(
            `${this.cachePrefix}:${page}:${limit}:${status}`,
          );
        }
      }
    }
  }
}
