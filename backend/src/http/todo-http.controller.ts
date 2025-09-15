import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, Length } from 'class-validator';
import { TodoHttpService } from '../services/todo-http.service';
import { TodoEntity } from '../entities/todo.entity';

export class CreateTodoDto {
  @IsString()
  @IsNotEmpty({ message: 'Description cannot be empty' })
  @Length(1, 500, { message: 'Description must be between 1 and 500 characters' })
  description: string;
}

export class UpdateTodoDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Description cannot be empty' })
  @Length(1, 500, { message: 'Description must be between 1 and 500 characters' })
  description?: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}

@Controller('api/todos')
export class TodoHttpController {
  constructor(private readonly todoHttpService: TodoHttpService) {}

  @Get()
  async getAllTodos(): Promise<TodoEntity[]> {
    return this.todoHttpService.getAllTodos();
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createTodo(@Body() createTodoDto: CreateTodoDto): Promise<TodoEntity> {
    return this.todoHttpService.createTodo(createTodoDto.description);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateTodo(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTodoDto: UpdateTodoDto,
  ): Promise<TodoEntity> {
    return this.todoHttpService.updateTodo(id, updateTodoDto);
  }

  @Delete(':id')
  async deleteTodo(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.todoHttpService.deleteTodo(id);
  }
}