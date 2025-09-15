import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoEntity } from './entities/todo.entity';
import { TodoRepository } from './repositories/todo.repository';
import { TodoService } from './services/todo.service';
import { TodoHttpService } from './services/todo-http.service';
import { TodoController } from './grpc/todo.controller';
import { TodoHttpController } from './http/todo-http.controller';
import { ValidationMiddleware } from './middleware/validation.middleware';
import { getSqliteConfig } from './config/database-sqlite.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => getSqliteConfig(configService),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([TodoEntity]),
  ],
  controllers: [TodoController, TodoHttpController],
  providers: [
    TodoRepository,
    TodoService,
    TodoHttpService,
    ValidationMiddleware,
  ],
})
export class AppModule {}