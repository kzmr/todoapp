import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import * as grpc from '@grpc/grpc-js';
import { TodoRepository } from '../repositories/todo.repository';
import { TodoEntity } from '../entities/todo.entity';
import {
  GetTodosRequest,
  GetTodosResponse,
  CreateTodoRequest,
  CreateTodoResponse,
  UpdateTodoRequest,
  UpdateTodoResponse,
  DeleteTodoRequest,
  DeleteTodoResponse,
  Todo,
} from '../generated/todo';

@Injectable()
export class TodoService {
  private readonly logger = new Logger(TodoService.name);

  constructor(private readonly todoRepository: TodoRepository) {}

  /**
   * Get all todos ordered by creation date (newest first)
   */
  async getTodos(request: GetTodosRequest): Promise<GetTodosResponse> {
    try {
      this.logger.debug('Getting all todos');

      const todos = await this.todoRepository.findAll();
      const grpcTodos = todos.map(todo => this.entityToGrpc(todo));

      this.logger.debug(`Found ${todos.length} todos`);

      return {
        todos: grpcTodos,
      };
    } catch (error) {
      this.logger.error('Failed to get todos', error);
      throw new RpcException({
        code: grpc.status.INTERNAL,
        message: 'Failed to retrieve todos',
      });
    }
  }

  /**
   * Create a new todo
   */
  async createTodo(request: CreateTodoRequest): Promise<CreateTodoResponse> {
    try {
      this.logger.debug('Creating todo', { description: request.description });

      // Validate description
      this.validateDescription(request.description);

      const todo = await this.todoRepository.create(request.description);
      const grpcTodo = this.entityToGrpc(todo);

      this.logger.debug('Todo created successfully', { id: todo.id });

      return {
        todo: grpcTodo,
      };
    } catch (error) {
      this.logger.error('Failed to create todo', error);

      if (error.message.includes('Description cannot be empty') ||
          error.message.includes('Description too long')) {
        throw new RpcException({
          code: grpc.status.INVALID_ARGUMENT,
          message: error.message,
        });
      }

      throw new RpcException({
        code: grpc.status.INTERNAL,
        message: 'Failed to create todo',
      });
    }
  }

  /**
   * Update an existing todo
   */
  async updateTodo(request: UpdateTodoRequest): Promise<UpdateTodoResponse> {
    try {
      this.logger.debug('Updating todo', { id: request.id, updates: request });

      // Validate request
      this.validateUpdateRequest(request);

      const updates: { description?: string; completed?: boolean } = {};

      if (request.description !== undefined) {
        this.validateDescription(request.description);
        updates.description = request.description;
      }

      if (request.completed !== undefined) {
        updates.completed = request.completed;
      }

      const todo = await this.todoRepository.update(request.id, updates);
      const grpcTodo = this.entityToGrpc(todo);

      this.logger.debug('Todo updated successfully', { id: todo.id });

      return {
        todo: grpcTodo,
      };
    } catch (error) {
      this.logger.error('Failed to update todo', error);

      if (error.message.includes('not found')) {
        throw new RpcException({
          code: grpc.status.NOT_FOUND,
          message: `Todo with ID ${request.id} not found`,
        });
      }

      if (error.message.includes('Description cannot be empty') ||
          error.message.includes('Description too long') ||
          error.message.includes('id')) {
        throw new RpcException({
          code: grpc.status.INVALID_ARGUMENT,
          message: error.message,
        });
      }

      throw new RpcException({
        code: grpc.status.INTERNAL,
        message: 'Failed to update todo',
      });
    }
  }

  /**
   * Delete a todo
   */
  async deleteTodo(request: DeleteTodoRequest): Promise<DeleteTodoResponse> {
    try {
      this.logger.debug('Deleting todo', { id: request.id });

      // Validate ID
      this.validateId(request.id);

      await this.todoRepository.delete(request.id);

      this.logger.debug('Todo deleted successfully', { id: request.id });

      return {};
    } catch (error) {
      this.logger.error('Failed to delete todo', error);

      if (error.message.includes('not found')) {
        throw new RpcException({
          code: grpc.status.NOT_FOUND,
          message: `Todo with ID ${request.id} not found`,
        });
      }

      if (error.message.includes('id')) {
        throw new RpcException({
          code: grpc.status.INVALID_ARGUMENT,
          message: error.message,
        });
      }

      throw new RpcException({
        code: grpc.status.INTERNAL,
        message: 'Failed to delete todo',
      });
    }
  }

  /**
   * Convert TodoEntity to gRPC Todo format
   */
  private entityToGrpc(entity: TodoEntity): Todo {
    return {
      id: entity.id,
      description: entity.description,
      completed: entity.completed,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  /**
   * Validate description field
   */
  private validateDescription(description: string): void {
    if (!description) {
      throw new Error('Description is required');
    }

    const trimmed = description.trim();
    if (trimmed.length === 0) {
      throw new Error('Description cannot be empty');
    }

    if (trimmed.length > 500) {
      throw new Error('Description too long (max 500 characters)');
    }
  }

  /**
   * Validate ID field
   */
  private validateId(id: number): void {
    if (!id || !Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid id: must be a positive integer');
    }
  }

  /**
   * Validate update request
   */
  private validateUpdateRequest(request: UpdateTodoRequest): void {
    this.validateId(request.id);

    // At least one field must be provided
    if (request.description === undefined && request.completed === undefined) {
      throw new Error('At least one field (description or completed) must be provided for update');
    }
  }

  /**
   * Get todos by completion status (utility method)
   */
  async getTodosByStatus(completed: boolean): Promise<TodoEntity[]> {
    try {
      return await this.todoRepository.findByCompletionStatus(completed);
    } catch (error) {
      this.logger.error('Failed to get todos by status', error);
      throw new RpcException({
        code: grpc.status.INTERNAL,
        message: 'Failed to retrieve todos by status',
      });
    }
  }

  /**
   * Get todo count (utility method)
   */
  async getTodoCount(): Promise<{ total: number; completed: number; incomplete: number }> {
    try {
      const [total, completed] = await Promise.all([
        this.todoRepository.countByStatus(),
        this.todoRepository.countByStatus(true),
      ]);

      return {
        total,
        completed,
        incomplete: total - completed,
      };
    } catch (error) {
      this.logger.error('Failed to get todo count', error);
      throw new RpcException({
        code: grpc.status.INTERNAL,
        message: 'Failed to get todo count',
      });
    }
  }
}