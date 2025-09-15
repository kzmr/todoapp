import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { TodoService } from '../services/todo.service';
import {
  GetTodosRequest,
  GetTodosResponse,
  CreateTodoRequest,
  CreateTodoResponse,
  UpdateTodoRequest,
  UpdateTodoResponse,
  DeleteTodoRequest,
  DeleteTodoResponse,
} from '../generated/todo';

@Controller()
export class TodoController {
  private readonly logger = new Logger(TodoController.name);

  constructor(private readonly todoService: TodoService) {}

  @GrpcMethod('TodoService', 'GetTodos')
  async getTodos(request: GetTodosRequest): Promise<GetTodosResponse> {
    this.logger.log('gRPC GetTodos called');
    return this.todoService.getTodos(request);
  }

  @GrpcMethod('TodoService', 'CreateTodo')
  async createTodo(request: CreateTodoRequest): Promise<CreateTodoResponse> {
    this.logger.log('gRPC CreateTodo called', { description: request.description });
    return this.todoService.createTodo(request);
  }

  @GrpcMethod('TodoService', 'UpdateTodo')
  async updateTodo(request: UpdateTodoRequest): Promise<UpdateTodoResponse> {
    this.logger.log('gRPC UpdateTodo called', { id: request.id });
    return this.todoService.updateTodo(request);
  }

  @GrpcMethod('TodoService', 'DeleteTodo')
  async deleteTodo(request: DeleteTodoRequest): Promise<DeleteTodoResponse> {
    this.logger.log('gRPC DeleteTodo called', { id: request.id });
    return this.todoService.deleteTodo(request);
  }
}