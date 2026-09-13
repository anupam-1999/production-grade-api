import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CreateTaskDto } from './dto/create-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { TaskObject, TaskPage } from './task.graphql';
import { TasksService } from './tasks.service';

@Resolver(() => TaskObject)
export class TasksResolver {
  constructor(private readonly tasksService: TasksService) {}

  @Query(() => TaskPage)
  tasks(
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number,
  ) {
    const query = new TaskQueryDto();
    query.page = page;
    query.limit = limit;

    return this.tasksService.findAll(query);
  }

  @Query(() => TaskObject)
  task(@Args('id', { type: () => ID }) id: string) {
    return this.tasksService.findOne(id);
  }

  @Mutation(() => TaskObject)
  createTask(@Args('input') input: CreateTaskDto) {
    return this.tasksService.create(input);
  }

  @Mutation(() => TaskObject)
  updateTask(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, input);
  }

  @Mutation(() => Boolean)
  async deleteTask(@Args('id', { type: () => ID }) id: string) {
    await this.tasksService.remove(id);
    return true;
  }
}
