import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import * as grpc from '@grpc/grpc-js';

@Injectable()
export class ValidationMiddleware {
  private readonly logger = new Logger(ValidationMiddleware.name);

  /**
   * Validate todo description
   */
  validateDescription(description: string, fieldName: string = 'description'): string {
    if (description === undefined || description === null) {
      throw new RpcException({
        code: grpc.status.INVALID_ARGUMENT,
        message: `${fieldName} is required`,
      });
    }

    if (typeof description !== 'string') {
      throw new RpcException({
        code: grpc.status.INVALID_ARGUMENT,
        message: `${fieldName} must be a string`,
      });
    }

    const trimmed = description.trim();

    if (trimmed.length === 0) {
      throw new RpcException({
        code: grpc.status.INVALID_ARGUMENT,
        message: `${fieldName} cannot be empty`,
      });
    }

    if (trimmed.length > 500) {
      throw new RpcException({
        code: grpc.status.INVALID_ARGUMENT,
        message: `${fieldName} too long (max 500 characters)`,
      });
    }

    return trimmed;
  }

  /**
   * Validate todo ID
   */
  validateId(id: number, fieldName: string = 'id'): number {
    if (id === undefined || id === null) {
      throw new RpcException({
        code: grpc.status.INVALID_ARGUMENT,
        message: `${fieldName} is required`,
      });
    }

    if (!Number.isInteger(id)) {
      throw new RpcException({
        code: grpc.status.INVALID_ARGUMENT,
        message: `${fieldName} must be an integer`,
      });
    }

    if (id <= 0) {
      throw new RpcException({
        code: grpc.status.INVALID_ARGUMENT,
        message: `${fieldName} must be a positive integer`,
      });
    }

    return id;
  }

  /**
   * Validate boolean field
   */
  validateBoolean(value: boolean, fieldName: string): boolean {
    if (value === undefined || value === null) {
      throw new RpcException({
        code: grpc.status.INVALID_ARGUMENT,
        message: `${fieldName} is required`,
      });
    }

    if (typeof value !== 'boolean') {
      throw new RpcException({
        code: grpc.status.INVALID_ARGUMENT,
        message: `${fieldName} must be a boolean`,
      });
    }

    return value;
  }

  /**
   * Validate CreateTodoRequest
   */
  validateCreateTodoRequest(request: any): { description: string } {
    if (!request) {
      throw new RpcException({
        code: grpc.status.INVALID_ARGUMENT,
        message: 'Request body is required',
      });
    }

    return {
      description: this.validateDescription(request.description),
    };
  }

  /**
   * Validate UpdateTodoRequest
   */
  validateUpdateTodoRequest(request: any): {
    id: number;
    description?: string;
    completed?: boolean;
  } {
    if (!request) {
      throw new RpcException({
        code: grpc.status.INVALID_ARGUMENT,
        message: 'Request body is required',
      });
    }

    const id = this.validateId(request.id);

    // At least one field must be provided for update
    if (request.description === undefined && request.completed === undefined) {
      throw new RpcException({
        code: grpc.status.INVALID_ARGUMENT,
        message: 'At least one field (description or completed) must be provided for update',
      });
    }

    const result: { id: number; description?: string; completed?: boolean } = { id };

    if (request.description !== undefined) {
      result.description = this.validateDescription(request.description);
    }

    if (request.completed !== undefined) {
      result.completed = this.validateBoolean(request.completed, 'completed');
    }

    return result;
  }

  /**
   * Validate DeleteTodoRequest
   */
  validateDeleteTodoRequest(request: any): { id: number } {
    if (!request) {
      throw new RpcException({
        code: grpc.status.INVALID_ARGUMENT,
        message: 'Request body is required',
      });
    }

    return {
      id: this.validateId(request.id),
    };
  }

  /**
   * Handle and transform database errors to gRPC errors
   */
  handleDatabaseError(error: any, operation: string): never {
    this.logger.error(`Database error during ${operation}`, error);

    if (error.message?.includes('not found')) {
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: error.message,
      });
    }

    if (error.code === '23505') { // Unique constraint violation
      throw new RpcException({
        code: grpc.status.ALREADY_EXISTS,
        message: 'Resource already exists',
      });
    }

    if (error.code === '23503') { // Foreign key constraint violation
      throw new RpcException({
        code: grpc.status.FAILED_PRECONDITION,
        message: 'Operation violates data constraints',
      });
    }

    if (error.code === '23514') { // Check constraint violation
      throw new RpcException({
        code: grpc.status.INVALID_ARGUMENT,
        message: 'Data validation failed',
      });
    }

    // Generic database error
    throw new RpcException({
      code: grpc.status.INTERNAL,
      message: `Database operation failed: ${operation}`,
    });
  }

  /**
   * Handle generic errors
   */
  handleGenericError(error: any, operation: string): never {
    this.logger.error(`Error during ${operation}`, error);

    if (error instanceof RpcException) {
      throw error;
    }

    throw new RpcException({
      code: grpc.status.INTERNAL,
      message: `Internal server error during ${operation}`,
    });
  }
}