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
var TodoController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodoController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const todo_service_1 = require("../services/todo.service");
let TodoController = TodoController_1 = class TodoController {
    constructor(todoService) {
        this.todoService = todoService;
        this.logger = new common_1.Logger(TodoController_1.name);
    }
    async getTodos(request) {
        this.logger.log('gRPC GetTodos called');
        return this.todoService.getTodos(request);
    }
    async createTodo(request) {
        this.logger.log('gRPC CreateTodo called', { description: request.description });
        return this.todoService.createTodo(request);
    }
    async updateTodo(request) {
        this.logger.log('gRPC UpdateTodo called', { id: request.id });
        return this.todoService.updateTodo(request);
    }
    async deleteTodo(request) {
        this.logger.log('gRPC DeleteTodo called', { id: request.id });
        return this.todoService.deleteTodo(request);
    }
};
exports.TodoController = TodoController;
__decorate([
    (0, microservices_1.GrpcMethod)('TodoService', 'GetTodos'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TodoController.prototype, "getTodos", null);
__decorate([
    (0, microservices_1.GrpcMethod)('TodoService', 'CreateTodo'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TodoController.prototype, "createTodo", null);
__decorate([
    (0, microservices_1.GrpcMethod)('TodoService', 'UpdateTodo'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TodoController.prototype, "updateTodo", null);
__decorate([
    (0, microservices_1.GrpcMethod)('TodoService', 'DeleteTodo'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TodoController.prototype, "deleteTodo", null);
exports.TodoController = TodoController = TodoController_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [todo_service_1.TodoService])
], TodoController);
//# sourceMappingURL=todo.controller.js.map