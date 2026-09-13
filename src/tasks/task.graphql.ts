import { Field, Int, ObjectType } from '@nestjs/graphql';

import { TaskStatus } from './entities/task.entity';

@ObjectType()
export class TaskObject {
  @Field()
  id!: string;

  @Field()
  title!: string;

  @Field({ nullable: true })
  description!: string | null;

  @Field(() => TaskStatus)
  status!: TaskStatus;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}

@ObjectType()
export class TaskPage {
  @Field(() => [TaskObject])
  items!: TaskObject[];

  @Field(() => Int)
  page!: number;

  @Field(() => Int)
  limit!: number;

  @Field(() => Int)
  total!: number;
}
