"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ValidationMiddleware_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationMiddleware = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const grpc = require("@grpc/grpc-js");
let ValidationMiddleware = ValidationMiddleware_1 = class ValidationMiddleware {
    constructor() {
        this.logger = new common_1.Logger(ValidationMiddleware_1.name);
    }
    validateDescription(description, fieldName = 'description') {
        if (description === undefined || description === null) {
            throw new microservices_1.RpcException({
                code: grpc.status.INVALID_ARGUMENT,
                message: `${fieldName} is required`,
            });
        }
        if (typeof description !== 'string') {
            throw new microservices_1.RpcException({
                code: grpc.status.INVALID_ARGUMENT,
                message: `${fieldName} must be a string`,
            });
        }
        const trimmed = description.trim();
        if (trimmed.length === 0) {
            throw new microservices_1.RpcException({
                code: grpc.status.INVALID_ARGUMENT,
                message: `${fieldName} cannot be empty`,
            });
        }
        if (trimmed.length > 500) {
            throw new microservices_1.RpcException({
                code: grpc.status.INVALID_ARGUMENT,
                message: `${fieldName} too long (max 500 characters)`,
            });
        }
        return trimmed;
    }
    validateId(id, fieldName = 'id') {
        if (id === undefined || id === null) {
            throw new microservices_1.RpcException({
                code: grpc.status.INVALID_ARGUMENT,
                message: `${fieldName} is required`,
            });
        }
        if (!Number.isInteger(id)) {
            throw new microservices_1.RpcException({
                code: grpc.status.INVALID_ARGUMENT,
                message: `${fieldName} must be an integer`,
            });
        }
        if (id <= 0) {
            throw new microservices_1.RpcException({
                code: grpc.status.INVALID_ARGUMENT,
                message: `${fieldName} must be a positive integer`,
            });
        }
        return id;
    }
    validateBoolean(value, fieldName) {
        if (value === undefined || value === null) {
            throw new microservices_1.RpcException({
                code: grpc.status.INVALID_ARGUMENT,
                message: `${fieldName} is required`,
            });
        }
        if (typeof value !== 'boolean') {
            throw new microservices_1.RpcException({
                code: grpc.status.INVALID_ARGUMENT,
                message: `${fieldName} must be a boolean`,
            });
        }
        return value;
    }
    validateCreateTodoRequest(request) {
        if (!request) {
            throw new microservices_1.RpcException({
                code: grpc.status.INVALID_ARGUMENT,
                message: 'Request body is required',
            });
        }
        return {
            description: this.validateDescription(request.description),
        };
    }
    validateUpdateTodoRequest(request) {
        if (!request) {
            throw new microservices_1.RpcException({
                code: grpc.status.INVALID_ARGUMENT,
                message: 'Request body is required',
            });
        }
        const id = this.validateId(request.id);
        if (request.description === undefined && request.completed === undefined) {
            throw new microservices_1.RpcException({
                code: grpc.status.INVALID_ARGUMENT,
                message: 'At least one field (description or completed) must be provided for update',
            });
        }
        const result = { id };
        if (request.description !== undefined) {
            result.description = this.validateDescription(request.description);
        }
        if (request.completed !== undefined) {
            result.completed = this.validateBoolean(request.completed, 'completed');
        }
        return result;
    }
    validateDeleteTodoRequest(request) {
        if (!request) {
            throw new microservices_1.RpcException({
                code: grpc.status.INVALID_ARGUMENT,
                message: 'Request body is required',
            });
        }
        return {
            id: this.validateId(request.id),
        };
    }
    handleDatabaseError(error, operation) {
        this.logger.error(`Database error during ${operation}`, error);
        if (error.message?.includes('not found')) {
            throw new microservices_1.RpcException({
                code: grpc.status.NOT_FOUND,
                message: error.message,
            });
        }
        if (error.code === '23505') {
            throw new microservices_1.RpcException({
                code: grpc.status.ALREADY_EXISTS,
                message: 'Resource already exists',
            });
        }
        if (error.code === '23503') {
            throw new microservices_1.RpcException({
                code: grpc.status.FAILED_PRECONDITION,
                message: 'Operation violates data constraints',
            });
        }
        if (error.code === '23514') {
            throw new microservices_1.RpcException({
                code: grpc.status.INVALID_ARGUMENT,
                message: 'Data validation failed',
            });
        }
        throw new microservices_1.RpcException({
            code: grpc.status.INTERNAL,
            message: `Database operation failed: ${operation}`,
        });
    }
    handleGenericError(error, operation) {
        this.logger.error(`Error during ${operation}`, error);
        if (error instanceof microservices_1.RpcException) {
            throw error;
        }
        throw new microservices_1.RpcException({
            code: grpc.status.INTERNAL,
            message: `Internal server error during ${operation}`,
        });
    }
};
exports.ValidationMiddleware = ValidationMiddleware;
exports.ValidationMiddleware = ValidationMiddleware = ValidationMiddleware_1 = __decorate([
    (0, common_1.Injectable)()
], ValidationMiddleware);
//# sourceMappingURL=validation.middleware.js.map