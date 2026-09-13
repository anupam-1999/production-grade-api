import 'reflect-metadata';
import { DataSource } from 'typeorm';

import { Task } from '../tasks/entities/task.entity';

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: Number(process.env.DATABASE_PORT ?? 5432),
  username: process.env.DATABASE_USER ?? 'postgres',
  password: process.env.DATABASE_PASSWORD ?? 'postgres',
  database: process.env.DATABASE_NAME ?? 'production_api',
  entities: [Task],
  migrations: ['src/database/migrations/*.ts'],
});
