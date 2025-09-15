"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TodoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodoService = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const grpc = require("@grpc/grpc-js");
const todo_repository_1 = require("../repositories/todo.repository");
let TodoService = TodoService_1 = class TodoService {
    constructor(todoRepository) {
        this.todoRepository = todoRepository;
        this.logger = new common_1.Logger(TodoService_1.name);
    }
    async getTodos(request) {
        try {
            this.logger.debug('Getting all todos');
            const todos = await this.todoRepository.findAll();
            const grpcTodos = todos.map(todo => this.entityToGrpc(todo));
            this.logger.debug(`Found ${todos.length} todos`);
            return {
                todos: grpcTodos,
            };
        }
        catch (error) {
            this.logger.error('Failed to get todos', error);
            throw new microservices_1.RpcException({
                code: grpc.status.INTERNAL,
                message: 'Failed to retrieve todos',
            });
        }
    }
    async createTodo(request) {
        try {
            this.logger.debug('Creating todo', { description: request.description });
            this.validateDescription(request.description);
            const todo = await this.todoRepository.create(request.description);
            const grpcTodo = this.entityToGrpc(todo);
            this.logger.debug('Todo created successfully', { id: todo.id });
            return {
                todo: grpcTodo,
            };
        }
        catch (error) {
            this.logger.error('Failed to create todo', error);
            if (error.message.includes('Description cannot be empty') ||
                error.message.includes('Description too long')) {
                throw new microservices_1.RpcException({
                    code: grpc.status.INVALID_ARGUMENT,
                    message: error.message,
                });
            }
            throw new microservices_1.RpcException({
                code: grpc.status.INTERNAL,
                message: 'Failed to create todo',
            });
        }
    }
    async updateTodo(request) {
        try {
            this.logger.debug('Updating todo', { id: request.id, updates: request });
            this.validateUpdateRequest(request);
            const updates = {};
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
        }
        catch (error) {
            this.logger.error('Failed to update todo', error);
            if (error.message.includes('not found')) {
                throw new microservices_1.RpcException({
                    code: grpc.status.NOT_FOUND,
                    message: `Todo with ID ${request.id} not found`,
                });
            }
            if (error.message.includes('Description cannot be empty') ||
                error.message.includes('Description too long') ||
                error.message.includes('id')) {
                throw new microservices_1.RpcException({
                    code: grpc.status.INVALID_ARGUMENT,
                    message: error.message,
                });
            }
            throw new microservices_1.RpcException({
                code: grpc.status.INTERNAL,
                message: 'Failed to update todo',
            });
        }
    }
    async deleteTodo(request) {
        try {
            this.logger.debug('Deleting todo', { id: request.id });
            this.validateId(request.id);
            await this.todoRepository.delete(request.id);
            this.logger.debug('Todo deleted successfully', { id: request.id });
            return {};
        }
        catch (error) {
            this.logger.error('Failed to delete todo', error);
            if (error.message.includes('not found')) {
                throw new microservices_1.RpcException({
                    code: grpc.status.NOT_FOUND,
                    message: `Todo with ID ${request.id} not found`,
                });
            }
            if (error.message.includes('id')) {
                throw new microservices_1.RpcException({
                    code: grpc.status.INVALID_ARGUMENT,
                    message: error.message,
                });
            }
            throw new microservices_1.RpcException({
                code: grpc.status.INTERNAL,
                message: 'Failed to delete todo',
            });
        }
    }
    entityToGrpc(entity) {
        return {
            id: entity.id,
            description: entity.description,
            completed: entity.completed,
            createdAt: entity.createdAt.toISOString(),
            updatedAt: entity.updatedAt.toISOString(),
        };
    }
    validateDescription(description) {
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
    validateId(id) {
        if (!id || !Number.isInteger(id) || id <= 0) {
            throw new Error('Invalid id: must be a positive integer');
        }
    }
    validateUpdateRequest(request) {
        this.validateId(request.id);
        if (request.description === undefined && request.completed === undefined) {
            throw new Error('At least one field (description or completed) must be provided for update');
        }
    }
    async getTodosByStatus(completed) {
        try {
            return await this.todoRepository.findByCompletionStatus(completed);
        }
        catch (error) {
            this.logger.error('Failed to get todos by status', error);
            throw new microservices_1.RpcException({
                code: grpc.status.INTERNAL,
                message: 'Failed to retrieve todos by status',
            });
        }
    }
    async getTodoCount() {
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
        }
        catch (error) {
            this.logger.error('Failed to get todo count', error);
            throw new microservices_1.RpcException({
                code: grpc.status.INTERNAL,
                message: 'Failed to get todo count',
            });
        }
    }
};
exports.TodoService = TodoService;
exports.TodoService = TodoService = TodoService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [todo_repository_1.TodoRepository])
], TodoService);
//# sourceMappingURL=todo.service.js.map