import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { RedisService } from '../src/cache/redis.service';
import { Task, TaskStatus } from '../src/tasks/entities/task.entity';
import { TasksService } from '../src/tasks/tasks.service';

describe('TasksService', () => {
  let service: TasksService;

  const repository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const redis = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: repository,
        },
        {
          provide: RedisService,
          useValue: redis,
        },
      ],
    }).compile();

    service = module.get(TasksService);
  });

  it('creates a task and invalidates list cache', async () => {
    const task = {
      id: 'task-id',
      title: 'Build API',
      description: null,
      status: TaskStatus.TODO,
    } as Task;

    repository.create.mockReturnValue(task);
    repository.save.mockResolvedValue(task);

    const result = await service.create({ title: 'Build API' });

    expect(result).toEqual(task);
    expect(repository.save).toHaveBeenCalledWith(task);
    expect(redis.del).toHaveBeenCalled();
  });

  it('throws when a task does not exist', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.findOne('missing')).rejects.toThrow(
      'Task missing not found',
    );
  });
});
