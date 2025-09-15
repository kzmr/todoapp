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
var TodoEntity_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodoEntity = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
let TodoEntity = TodoEntity_1 = class TodoEntity {
    constructor(partial = {}) {
        Object.assign(this, partial);
    }
    markAsCompleted() {
        this.completed = true;
    }
    markAsIncomplete() {
        this.completed = false;
    }
    updateDescription(description) {
        if (!description || description.trim().length === 0) {
            throw new Error('Description cannot be empty');
        }
        if (description.length > 500) {
            throw new Error('Description too long (max 500 characters)');
        }
        this.description = description.trim();
    }
    toGrpcFormat() {
        return {
            id: this.id,
            description: this.description,
            completed: this.completed,
            created_at: this.createdAt.toISOString(),
            updated_at: this.updatedAt.toISOString(),
        };
    }
    static fromCreateRequest(description) {
        const todo = new TodoEntity_1();
        todo.updateDescription(description);
        todo.completed = false;
        return todo;
    }
    applyUpdates(updates) {
        if (updates.description !== undefined) {
            this.updateDescription(updates.description);
        }
        if (updates.completed !== undefined) {
            this.completed = updates.completed;
        }
    }
};
exports.TodoEntity = TodoEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TodoEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 500,
        nullable: false,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Description cannot be empty' }),
    (0, class_validator_1.Length)(1, 500, { message: 'Description must be between 1 and 500 characters' }),
    __metadata("design:type", String)
], TodoEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'boolean',
        default: false,
        nullable: false,
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TodoEntity.prototype, "completed", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        name: 'created_at',
    }),
    __metadata("design:type", Date)
], TodoEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        name: 'updated_at',
    }),
    __metadata("design:type", Date)
], TodoEntity.prototype, "updatedAt", void 0);
exports.TodoEntity = TodoEntity = TodoEntity_1 = __decorate([
    (0, typeorm_1.Entity)('todos'),
    __metadata("design:paramtypes", [Object])
], TodoEntity);
//# sourceMappingURL=todo.entity.js.map