import { Field, InputType, PartialType } from '@nestjs/graphql';
import { IsEnum, IsOptional } from 'class-validator';

import { CreateTaskDto } from './create-task.dto';
import { TaskStatus } from '../entities/task.entity';

@InputType()
export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @Field(() => TaskStatus, { nullable: true })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}
