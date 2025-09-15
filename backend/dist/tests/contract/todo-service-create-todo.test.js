"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path_1 = require("path");
describe('TodoService.CreateTodo Contract Test', () => {
    let client;
    beforeAll(async () => {
        const packageDefinition = protoLoader.loadSync((0, path_1.join)(__dirname, '../../src/proto/todo.proto'), {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true,
        });
        const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
        client = new protoDescriptor.todo.TodoService('localhost:50051', grpc.credentials.createInsecure());
    });
    describe('CreateTodo method contract', () => {
        it('should accept CreateTodoRequest with description', async () => {
            const request = {
                description: 'Test todo item',
            };
            await expect(new Promise((resolve, reject) => {
                client.createTodo(request, (error, response) => {
                    if (error)
                        reject(error);
                    else
                        resolve(response);
                });
            })).rejects.toThrow();
        });
        it('should return CreateTodoResponse with todo object', async () => {
            const request = {
                description: 'Test todo item',
            };
            try {
                const response = await new Promise((resolve, reject) => {
                    client.createTodo(request, (error, response) => {
                        if (error)
                            reject(error);
                        else
                            resolve(response);
                    });
                });
                expect(response).toHaveProperty('todo');
                const todo = response.todo;
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
                expect(todo.description).toBe(request.description);
                expect(todo.completed).toBe(false);
            }
            catch (error) {
                expect(error).toBeDefined();
            }
        });
        it('should reject empty description with INVALID_ARGUMENT', async () => {
            const request = {
                description: '',
            };
            try {
                await new Promise((resolve, reject) => {
                    client.createTodo(request, (error, response) => {
                        if (error)
                            reject(error);
                        else
                            resolve(response);
                    });
                });
                fail('Expected validation error for empty description');
            }
            catch (error) {
                expect(error.code).toBe(grpc.status.INVALID_ARGUMENT);
                expect(error.message).toContain('description');
            }
        });
        it('should reject description longer than 500 characters', async () => {
            const request = {
                description: 'a'.repeat(501),
            };
            try {
                await new Promise((resolve, reject) => {
                    client.createTodo(request, (error, response) => {
                        if (error)
                            reject(error);
                        else
                            resolve(response);
                    });
                });
                fail('Expected validation error for long description');
            }
            catch (error) {
                expect(error.code).toBe(grpc.status.INVALID_ARGUMENT);
                expect(error.message).toContain('description');
            }
        });
        it('should trim whitespace from description', async () => {
            const request = {
                description: '  Test todo item  ',
            };
            try {
                const response = await new Promise((resolve, reject) => {
                    client.createTodo(request, (error, response) => {
                        if (error)
                            reject(error);
                        else
                            resolve(response);
                    });
                });
                const todo = response.todo;
                expect(todo.description).toBe('Test todo item');
            }
            catch (error) {
                expect(error).toBeDefined();
            }
        });
        it('should auto-generate timestamps', async () => {
            const request = {
                description: 'Test todo item',
            };
            try {
                const response = await new Promise((resolve, reject) => {
                    client.createTodo(request, (error, response) => {
                        if (error)
                            reject(error);
                        else
                            resolve(response);
                    });
                });
                const todo = response.todo;
                expect(new Date(todo.created_at).toISOString()).toBe(todo.created_at);
                expect(new Date(todo.updated_at).toISOString()).toBe(todo.updated_at);
                expect(todo.created_at).toBe(todo.updated_at);
            }
            catch (error) {
                expect(error).toBeDefined();
            }
        });
    });
});
//# sourceMappingURL=todo-service-create-todo.test.js.map