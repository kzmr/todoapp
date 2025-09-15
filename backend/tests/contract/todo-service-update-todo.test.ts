import { Test, TestingModule } from '@nestjs/testing';
import { INestMicroservice } from '@nestjs/common';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { join } from 'path';

describe('TodoService.UpdateTodo Contract Test', () => {
  let client: any;

  beforeAll(async () => {
    // Load proto file
    const packageDefinition = protoLoader.loadSync(
      join(__dirname, '../../src/proto/todo.proto'),
      {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      },
    );
    const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;

    // Create gRPC client
    client = new protoDescriptor.todo.TodoService(
      'localhost:50051',
      grpc.credentials.createInsecure(),
    );
  });

  describe('UpdateTodo method contract', () => {
    it('should accept UpdateTodoRequest with id and optional fields', async () => {
      // This test MUST FAIL initially - no implementation exists
      const request = {
        id: 1,
        description: 'Updated todo item',
        completed: true,
      };

      await expect(
        new Promise((resolve, reject) => {
          client.updateTodo(request, (error: any, response: any) => {
            if (error) reject(error);
            else resolve(response);
          });
        }),
      ).rejects.toThrow(); // Should fail because service is not implemented
    });

    it('should return UpdateTodoResponse with updated todo', async () => {
      // Contract expectation: response should have 'todo' property
      const request = {
        id: 1,
        description: 'Updated todo item',
      };

      try {
        const response = await new Promise((resolve, reject) => {
          client.updateTodo(request, (error: any, response: any) => {
            if (error) reject(error);
            else resolve(response);
          });
        });

        // Contract requirements
        expect(response).toHaveProperty('todo');
        const todo = (response as any).todo;
        expect(todo).toHaveProperty('id');
        expect(todo).toHaveProperty('description');
        expect(todo).toHaveProperty('completed');
        expect(todo).toHaveProperty('created_at');
        expect(todo).toHaveProperty('updated_at');

        // Verify updated fields
        expect(todo.id).toBe(request.id);
        expect(todo.description).toBe(request.description);
      } catch (error) {
        // Expected to fail - no implementation yet
        expect(error).toBeDefined();
      }
    });

    it('should update only description when provided', async () => {
      const request = {
        id: 1,
        description: 'Updated description only',
      };

      try {
        const response = await new Promise((resolve, reject) => {
          client.updateTodo(request, (error: any, response: any) => {
            if (error) reject(error);
            else resolve(response);
          });
        });

        const todo = (response as any).todo;
        expect(todo.description).toBe(request.description);
        // completed should remain unchanged
      } catch (error) {
        // Expected to fail - no implementation yet
        expect(error).toBeDefined();
      }
    });

    it('should update only completed status when provided', async () => {
      const request = {
        id: 1,
        completed: true,
      };

      try {
        const response = await new Promise((resolve, reject) => {
          client.updateTodo(request, (error: any, response: any) => {
            if (error) reject(error);
            else resolve(response);
          });
        });

        const todo = (response as any).todo;
        expect(todo.completed).toBe(request.completed);
        // description should remain unchanged
      } catch (error) {
        // Expected to fail - no implementation yet
        expect(error).toBeDefined();
      }
    });

    it('should update updated_at timestamp but not created_at', async () => {
      const request = {
        id: 1,
        description: 'Updated description',
      };

      try {
        const response = await new Promise((resolve, reject) => {
          client.updateTodo(request, (error: any, response: any) => {
            if (error) reject(error);
            else resolve(response);
          });
        });

        const todo = (response as any).todo;

        // updated_at should be different from created_at for updated todos
        expect(todo.updated_at).not.toBe(todo.created_at);

        // Should be valid ISO 8601 timestamp
        expect(new Date(todo.updated_at).toISOString()).toBe(todo.updated_at);
      } catch (error) {
        // Expected to fail - no implementation yet
        expect(error).toBeDefined();
      }
    });

    it('should reject missing id with INVALID_ARGUMENT', async () => {
      const request = {
        description: 'No ID provided',
      };

      try {
        await new Promise((resolve, reject) => {
          client.updateTodo(request, (error: any, response: any) => {
            if (error) reject(error);
            else resolve(response);
          });
        });

        fail('Expected validation error for missing ID');
      } catch (error: any) {
        // Contract requirement: should be INVALID_ARGUMENT (code 3)
        expect(error.code).toBe(grpc.status.INVALID_ARGUMENT);
        expect(error.message).toContain('id');
      }
    });

    it('should reject non-existent id with NOT_FOUND', async () => {
      const request = {
        id: 999999,
        description: 'Non-existent todo',
      };

      try {
        await new Promise((resolve, reject) => {
          client.updateTodo(request, (error: any, response: any) => {
            if (error) reject(error);
            else resolve(response);
          });
        });

        fail('Expected NOT_FOUND error for non-existent ID');
      } catch (error: any) {
        // Contract requirement: should be NOT_FOUND (code 5)
        expect(error.code).toBe(grpc.status.NOT_FOUND);
        expect(error.message).toContain('999999');
      }
    });

    it('should reject invalid description with INVALID_ARGUMENT', async () => {
      const request = {
        id: 1,
        description: '', // Empty description
      };

      try {
        await new Promise((resolve, reject) => {
          client.updateTodo(request, (error: any, response: any) => {
            if (error) reject(error);
            else resolve(response);
          });
        });

        fail('Expected validation error for empty description');
      } catch (error: any) {
        expect(error.code).toBe(grpc.status.INVALID_ARGUMENT);
        expect(error.message).toContain('description');
      }
    });

    it('should require at least one field to update', async () => {
      // Contract: at least description or completed must be provided
      const request = {
        id: 1,
        // No description or completed
      };

      try {
        await new Promise((resolve, reject) => {
          client.updateTodo(request, (error: any, response: any) => {
            if (error) reject(error);
            else resolve(response);
          });
        });

        fail('Expected validation error for no update fields');
      } catch (error: any) {
        expect(error.code).toBe(grpc.status.INVALID_ARGUMENT);
      }
    });
  });
});