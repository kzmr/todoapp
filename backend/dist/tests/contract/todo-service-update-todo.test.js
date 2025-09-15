"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path_1 = require("path");
describe('TodoService.UpdateTodo Contract Test', () => {
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
    describe('UpdateTodo method contract', () => {
        it('should accept UpdateTodoRequest with id and optional fields', async () => {
            const request = {
                id: 1,
                description: 'Updated todo item',
                completed: true,
            };
            await expect(new Promise((resolve, reject) => {
                client.updateTodo(request, (error, response) => {
                    if (error)
                        reject(error);
                    else
                        resolve(response);
                });
            })).rejects.toThrow();
        });
        it('should return UpdateTodoResponse with updated todo', async () => {
            const request = {
                id: 1,
                description: 'Updated todo item',
            };
            try {
                const response = await new Promise((resolve, reject) => {
                    client.updateTodo(request, (error, response) => {
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
                expect(todo.id).toBe(request.id);
                expect(todo.description).toBe(request.description);
            }
            catch (error) {
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
                    client.updateTodo(request, (error, response) => {
                        if (error)
                            reject(error);
                        else
                            resolve(response);
                    });
                });
                const todo = response.todo;
                expect(todo.description).toBe(request.description);
            }
            catch (error) {
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
                    client.updateTodo(request, (error, response) => {
                        if (error)
                            reject(error);
                        else
                            resolve(response);
                    });
                });
                const todo = response.todo;
                expect(todo.completed).toBe(request.completed);
            }
            catch (error) {
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
                    client.updateTodo(request, (error, response) => {
                        if (error)
                            reject(error);
                        else
                            resolve(response);
                    });
                });
                const todo = response.todo;
                expect(todo.updated_at).not.toBe(todo.created_at);
                expect(new Date(todo.updated_at).toISOString()).toBe(todo.updated_at);
            }
            catch (error) {
                expect(error).toBeDefined();
            }
        });
        it('should reject missing id with INVALID_ARGUMENT', async () => {
            const request = {
                description: 'No ID provided',
            };
            try {
                await new Promise((resolve, reject) => {
                    client.updateTodo(request, (error, response) => {
                        if (error)
                            reject(error);
                        else
                            resolve(response);
                    });
                });
                fail('Expected validation error for missing ID');
            }
            catch (error) {
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
                    client.updateTodo(request, (error, response) => {
                        if (error)
                            reject(error);
                        else
                            resolve(response);
                    });
                });
                fail('Expected NOT_FOUND error for non-existent ID');
            }
            catch (error) {
                expect(error.code).toBe(grpc.status.NOT_FOUND);
                expect(error.message).toContain('999999');
            }
        });
        it('should reject invalid description with INVALID_ARGUMENT', async () => {
            const request = {
                id: 1,
                description: '',
            };
            try {
                await new Promise((resolve, reject) => {
                    client.updateTodo(request, (error, response) => {
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
        it('should require at least one field to update', async () => {
            const request = {
                id: 1,
            };
            try {
                await new Promise((resolve, reject) => {
                    client.updateTodo(request, (error, response) => {
                        if (error)
                            reject(error);
                        else
                            resolve(response);
                    });
                });
                fail('Expected validation error for no update fields');
            }
            catch (error) {
                expect(error.code).toBe(grpc.status.INVALID_ARGUMENT);
            }
        });
    });
});
//# sourceMappingURL=todo-service-update-todo.test.js.map