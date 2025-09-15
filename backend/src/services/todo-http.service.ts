import { Injectable, NotFoundException } from '@nestjs/common';
import { TodoRepository } from '../repositories/todo.repository';
import { TodoEntity } from '../entities/todo.entity';

@Injectable()
export class TodoHttpService {
  constructor(private readonly todoRepository: TodoRepository) {}

  async getAllTodos(): Promise<TodoEntity[]> {
    return this.todoRepository.findAll();
  }

  async createTodo(description: string): Promise<TodoEntity> {
    return this.todoRepository.create(description);
  }

  async updateTodo(id: number, updates: { description?: string; completed?: boolean }): Promise<TodoEntity> {
    try {
      return await this.todoRepository.update(id, updates);
    } catch (error) {
      if (error.message.includes('not found')) {
        throw new NotFoundException(`Todo with ID ${id} not found`);
      }
      throw error;
    }
  }

  async deleteTodo(id: number): Promise<void> {
    try {
      await this.todoRepository.delete(id);
    } catch (error) {
      if (error.message.includes('not found')) {
        throw new NotFoundException(`Todo with ID ${id} not found`);
      }
      throw error;
    }
  }
}