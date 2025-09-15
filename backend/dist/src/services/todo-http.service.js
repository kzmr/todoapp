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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodoHttpService = void 0;
const common_1 = require("@nestjs/common");
const todo_repository_1 = require("../repositories/todo.repository");
let TodoHttpService = class TodoHttpService {
    constructor(todoRepository) {
        this.todoRepository = todoRepository;
    }
    async getAllTodos() {
        return this.todoRepository.findAll();
    }
    async createTodo(description) {
        return this.todoRepository.create(description);
    }
    async updateTodo(id, updates) {
        try {
            return await this.todoRepository.update(id, updates);
        }
        catch (error) {
            if (error.message.includes('not found')) {
                throw new common_1.NotFoundException(`Todo with ID ${id} not found`);
            }
            throw error;
        }
    }
    async deleteTodo(id) {
        try {
            await this.todoRepository.delete(id);
        }
        catch (error) {
            if (error.message.includes('not found')) {
                throw new common_1.NotFoundException(`Todo with ID ${id} not found`);
            }
            throw error;
        }
    }
};
exports.TodoHttpService = TodoHttpService;
exports.TodoHttpService = TodoHttpService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [todo_repository_1.TodoRepository])
], TodoHttpService);
//# sourceMappingURL=todo-http.service.js.map