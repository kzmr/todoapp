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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodoHttpController = exports.UpdateTodoDto = exports.CreateTodoDto = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const todo_http_service_1 = require("../services/todo-http.service");
class CreateTodoDto {
}
exports.CreateTodoDto = CreateTodoDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Description cannot be empty' }),
    (0, class_validator_1.Length)(1, 500, { message: 'Description must be between 1 and 500 characters' }),
    __metadata("design:type", String)
], CreateTodoDto.prototype, "description", void 0);
class UpdateTodoDto {
}
exports.UpdateTodoDto = UpdateTodoDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Description cannot be empty' }),
    (0, class_validator_1.Length)(1, 500, { message: 'Description must be between 1 and 500 characters' }),
    __metadata("design:type", String)
], UpdateTodoDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateTodoDto.prototype, "completed", void 0);
let TodoHttpController = class TodoHttpController {
    constructor(todoHttpService) {
        this.todoHttpService = todoHttpService;
    }
    async getAllTodos() {
        return this.todoHttpService.getAllTodos();
    }
    async createTodo(createTodoDto) {
        return this.todoHttpService.createTodo(createTodoDto.description);
    }
    async updateTodo(id, updateTodoDto) {
        return this.todoHttpService.updateTodo(id, updateTodoDto);
    }
    async deleteTodo(id) {
        return this.todoHttpService.deleteTodo(id);
    }
};
exports.TodoHttpController = TodoHttpController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TodoHttpController.prototype, "getAllTodos", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, whitelist: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateTodoDto]),
    __metadata("design:returntype", Promise)
], TodoHttpController.prototype, "createTodo", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, whitelist: true })),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, UpdateTodoDto]),
    __metadata("design:returntype", Promise)
], TodoHttpController.prototype, "updateTodo", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TodoHttpController.prototype, "deleteTodo", null);
exports.TodoHttpController = TodoHttpController = __decorate([
    (0, common_1.Controller)('api/todos'),
    __metadata("design:paramtypes", [todo_http_service_1.TodoHttpService])
], TodoHttpController);
//# sourceMappingURL=todo-http.controller.js.map