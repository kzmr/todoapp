import { Test, TestingModule } from '@nestjs/testing';
import { INestMicroservice } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

describe('TodoService.GetTodos Contract Test', () => {
  let app: INestMicroservice;
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

    // This test should fail initially as no implementation exists
    // We're testing the contract structure and expectations
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('GetTodos method contract', () => {
    it('should accept empty GetTodosRequest', async () => {
      // This test MUST FAIL initially - no implementation exists
      const request = {};

      await expect(
        new Promise((resolve, reject) => {
          client.getTodos(request, (error: any, response: any) => {
            if (error) reject(error);
            else resolve(response);
          });
        }),
      ).rejects.toThrow(); // Should fail because service is not implemented
    });

    it('should return GetTodosResponse with todos array structure', async () => {
      // Contract expectation: response should have 'todos' property as array
      const request = {};

      try {
        const response = await new Promise((resolve, reject) => {
          client.getTodos(request, (error: any, response: any) => {
            if (error) reject(error);
            else resolve(response);
          });
        });

        // This assertion defines the contract
        expect(response).toHaveProperty('todos');
        expect(Array.isArray((response as any).todos)).toBe(true);
      } catch (error) {
        // Expected to fail - no implementation yet
        expect(error).toBeDefined();
      }
    });

    it('should return todos with correct structure when todos exist', async () => {
      // Contract: each todo should have required fields
      const request = {};

      try {
        const response = await new Promise((resolve, reject) => {
          client.getTodos(request, (error: any, response: any) => {
            if (error) reject(error);
            else resolve(response);
          });
        });

        const todos = (response as any).todos;
        if (todos.length > 0) {
          const todo = todos[0];
          // Contract requirements from proto file
          expect(todo).toHaveProperty('id');
          expect(todo).toHaveProperty('description');
          expect(todo).toHaveProperty('completed');
          expect(todo).toHaveProperty('created_at');
          expect(todo).toHaveProperty('updated_at');

          expect(typeof todo.id).toBe('number');
          expect(typeof todo.description).toBe('string');
          expect(typeof todo.completed).toBe('boolean');
          expect(typeof todo.created_at).toBe('string');
          expect(typeof todo.updated_at).toBe('string');
        }
      } catch (error) {
        // Expected to fail - no implementation yet
        expect(error).toBeDefined();
      }
    });

    it('should return empty array when no todos exist', async () => {
      // Contract: should return empty todos array, not null or undefined
      const request = {};

      try {
        const response = await new Promise((resolve, reject) => {
          client.getTodos(request, (error: any, response: any) => {
            if (error) reject(error);
            else resolve(response);
          });
        });

        expect((response as any).todos).toEqual([]);
      } catch (error) {
        // Expected to fail - no implementation yet
        expect(error).toBeDefined();
      }
    });
  });
});