import { Field, Int, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, Max, Min } from 'class-validator';

import { TaskStatus } from '../entities/task.entity';

@InputType()
export class TaskQueryDto {
  @Field(() => Int, { defaultValue: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @Field(() => Int, { defaultValue: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @Field(() => TaskStatus, { nullable: true })
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}
