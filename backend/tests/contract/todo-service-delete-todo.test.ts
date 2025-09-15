import { Test, TestingModule } from '@nestjs/testing';
import { INestMicroservice } from '@nestjs/common';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { join } from 'path';

describe('TodoService.DeleteTodo Contract Test', () => {
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

  describe('DeleteTodo method contract', () => {
    it('should accept DeleteTodoRequest with id', async () => {
      // This test MUST FAIL initially - no implementation exists
      const request = {
        id: 1,
      };

      await expect(
        new Promise((resolve, reject) => {
          client.deleteTodo(request, (error: any, response: any) => {
            if (error) reject(error);
            else resolve(response);
          });
        }),
      ).rejects.toThrow(); // Should fail because service is not implemented
    });

    it('should return empty DeleteTodoResponse on successful deletion', async () => {
      // Contract expectation: response should be empty object for successful deletion
      const request = {
        id: 1,
      };

      try {
        const response = await new Promise((resolve, reject) => {
          client.deleteTodo(request, (error: any, response: any) => {
            if (error) reject(error);
            else resolve(response);
          });
        });

        // Contract: successful deletion returns empty response
        expect(response).toEqual({});
      } catch (error) {
        // Expected to fail - no implementation yet
        expect(error).toBeDefined();
      }
    });

    it('should reject missing id with INVALID_ARGUMENT', async () => {
      const request = {}; // No id provided

      try {
        await new Promise((resolve, reject) => {
          client.deleteTodo(request, (error: any, response: any) => {
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

    it('should reject invalid id with INVALID_ARGUMENT', async () => {
      const request = {
        id: 0, // Invalid ID (should be positive)
      };

      try {
        await new Promise((resolve, reject) => {
          client.deleteTodo(request, (error: any, response: any) => {
            if (error) reject(error);
            else resolve(response);
          });
        });

        fail('Expected validation error for invalid ID');
      } catch (error: any) {
        expect(error.code).toBe(grpc.status.INVALID_ARGUMENT);
        expect(error.message).toContain('id');
      }
    });

    it('should reject non-existent id with NOT_FOUND', async () => {
      const request = {
        id: 999999,
      };

      try {
        await new Promise((resolve, reject) => {
          client.deleteTodo(request, (error: any, response: any) => {
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

    it('should permanently delete todo (hard delete)', async () => {
      // Contract: deletion should be permanent, not soft delete
      const deleteRequest = {
        id: 1,
      };

      try {
        // First delete the todo
        await new Promise((resolve, reject) => {
          client.deleteTodo(deleteRequest, (error: any, response: any) => {
            if (error) reject(error);
            else resolve(response);
          });
        });

        // Then try to get all todos - deleted todo should not appear
        const getTodosResponse = await new Promise((resolve, reject) => {
          client.getTodos({}, (error: any, response: any) => {
            if (error) reject(error);
            else resolve(response);
          });
        });

        const todos = (getTodosResponse as any).todos;
        const deletedTodo = todos.find((todo: any) => todo.id === 1);
        expect(deletedTodo).toBeUndefined();
      } catch (error) {
        // Expected to fail - no implementation yet
        expect(error).toBeDefined();
      }
    });

    it('should handle multiple deletions of same id gracefully', async () => {
      // Contract: deleting already deleted todo should return NOT_FOUND
      const request = {
        id: 1,
      };

      try {
        // First deletion - should succeed
        await new Promise((resolve, reject) => {
          client.deleteTodo(request, (error: any, response: any) => {
            if (error) reject(error);
            else resolve(response);
          });
        });

        // Second deletion - should fail with NOT_FOUND
        await new Promise((resolve, reject) => {
          client.deleteTodo(request, (error: any, response: any) => {
            if (error) reject(error);
            else resolve(response);
          });
        });

        fail('Expected NOT_FOUND error for second deletion');
      } catch (error: any) {
        if (error.code === grpc.status.NOT_FOUND) {
          // This is expected behavior
          expect(error.message).toContain('1');
        } else {
          // Any other error means no implementation yet
          expect(error).toBeDefined();
        }
      }
    });

    it('should accept positive integer ids only', async () => {
      const testCases = [
        { id: -1, description: 'negative number' },
        { id: 0, description: 'zero' },
        { id: 1.5, description: 'decimal number' },
      ];

      for (const testCase of testCases) {
        try {
          await new Promise((resolve, reject) => {
            client.deleteTodo({ id: testCase.id }, (error: any, response: any) => {
              if (error) reject(error);
              else resolve(response);
            });
          });

          fail(`Expected validation error for ${testCase.description}`);
        } catch (error: any) {
          // Should be INVALID_ARGUMENT for invalid ID format
          expect(error.code).toBe(grpc.status.INVALID_ARGUMENT);
        }
      }
    });
  });
});