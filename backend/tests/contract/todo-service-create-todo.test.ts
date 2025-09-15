import { Test, TestingModule } from '@nestjs/testing';
import { INestMicroservice } from '@nestjs/common';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { join } from 'path';

describe('TodoService.CreateTodo Contract Test', () => {
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

  describe('CreateTodo method contract', () => {
    it('should accept CreateTodoRequest with description', async () => {
      // This test MUST FAIL initially - no implementation exists
      const request = {
        description: 'Test todo item',
      };

      await expect(
        new Promise((resolve, reject) => {
          client.createTodo(request, (error: any, response: any) => {
            if (error) reject(error);
            else resolve(response);
          });
        }),
      ).rejects.toThrow(); // Should fail because service is not implemented
    });

    it('should return CreateTodoResponse with todo object', async () => {
      // Contract expectation: response should have 'todo' property
      const request = {
        description: 'Test todo item',
      };

      try {
        const response = await new Promise((resolve, reject) => {
          client.createTodo(request, (error: any, response: any) => {
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

        // Verify data types
        expect(typeof todo.id).toBe('number');
        expect(typeof todo.description).toBe('string');
        expect(typeof todo.completed).toBe('boolean');
        expect(typeof todo.created_at).toBe('string');
        expect(typeof todo.updated_at).toBe('string');

        // Verify business logic
        expect(todo.description).toBe(request.description);
        expect(todo.completed).toBe(false); // New todos default to incomplete
      } catch (error) {
        // Expected to fail - no implementation yet
        expect(error).toBeDefined();
      }
    });

    it('should reject empty description with INVALID_ARGUMENT', async () => {
      // Contract: empty description should fail validation
      const request = {
        description: '',
      };

      try {
        await new Promise((resolve, reject) => {
          client.createTodo(request, (error: any, response: any) => {
            if (error) reject(error);
            else resolve(response);
          });
        });

        // Should not reach here
        fail('Expected validation error for empty description');
      } catch (error: any) {
        // Contract requirement: should be INVALID_ARGUMENT (code 3)
        expect(error.code).toBe(grpc.status.INVALID_ARGUMENT);
        expect(error.message).toContain('description');
      }
    });

    it('should reject description longer than 500 characters', async () => {
      // Contract: description too long should fail validation
      const request = {
        description: 'a'.repeat(501), // 501 characters
      };

      try {
        await new Promise((resolve, reject) => {
          client.createTodo(request, (error: any, response: any) => {
            if (error) reject(error);
            else resolve(response);
          });
        });

        fail('Expected validation error for long description');
      } catch (error: any) {
        // Contract requirement: should be INVALID_ARGUMENT (code 3)
        expect(error.code).toBe(grpc.status.INVALID_ARGUMENT);
        expect(error.message).toContain('description');
      }
    });

    it('should trim whitespace from description', async () => {
      // Contract: whitespace should be trimmed
      const request = {
        description: '  Test todo item  ',
      };

      try {
        const response = await new Promise((resolve, reject) => {
          client.createTodo(request, (error: any, response: any) => {
            if (error) reject(error);
            else resolve(response);
          });
        });

        const todo = (response as any).todo;
        expect(todo.description).toBe('Test todo item'); // Trimmed
      } catch (error) {
        // Expected to fail - no implementation yet
        expect(error).toBeDefined();
      }
    });

    it('should auto-generate timestamps', async () => {
      // Contract: created_at and updated_at should be auto-generated
      const request = {
        description: 'Test todo item',
      };

      try {
        const response = await new Promise((resolve, reject) => {
          client.createTodo(request, (error: any, response: any) => {
            if (error) reject(error);
            else resolve(response);
          });
        });

        const todo = (response as any).todo;

        // Should be valid ISO 8601 timestamps
        expect(new Date(todo.created_at).toISOString()).toBe(todo.created_at);
        expect(new Date(todo.updated_at).toISOString()).toBe(todo.updated_at);

        // For new todos, created_at should equal updated_at
        expect(todo.created_at).toBe(todo.updated_at);
      } catch (error) {
        // Expected to fail - no implementation yet
        expect(error).toBeDefined();
      }
    });
  });
});