"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path_1 = require("path");
describe('TodoService.DeleteTodo Contract Test', () => {
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
    describe('DeleteTodo method contract', () => {
        it('should accept DeleteTodoRequest with id', async () => {
            const request = {
                id: 1,
            };
            await expect(new Promise((resolve, reject) => {
                client.deleteTodo(request, (error, response) => {
                    if (error)
                        reject(error);
                    else
                        resolve(response);
                });
            })).rejects.toThrow();
        });
        it('should return empty DeleteTodoResponse on successful deletion', async () => {
            const request = {
                id: 1,
            };
            try {
                const response = await new Promise((resolve, reject) => {
                    client.deleteTodo(request, (error, response) => {
                        if (error)
                            reject(error);
                        else
                            resolve(response);
                    });
                });
                expect(response).toEqual({});
            }
            catch (error) {
                expect(error).toBeDefined();
            }
        });
        it('should reject missing id with INVALID_ARGUMENT', async () => {
            const request = {};
            try {
                await new Promise((resolve, reject) => {
                    client.deleteTodo(request, (error, response) => {
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
        it('should reject invalid id with INVALID_ARGUMENT', async () => {
            const request = {
                id: 0,
            };
            try {
                await new Promise((resolve, reject) => {
                    client.deleteTodo(request, (error, response) => {
                        if (error)
                            reject(error);
                        else
                            resolve(response);
                    });
                });
                fail('Expected validation error for invalid ID');
            }
            catch (error) {
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
                    client.deleteTodo(request, (error, response) => {
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
        it('should permanently delete todo (hard delete)', async () => {
            const deleteRequest = {
                id: 1,
            };
            try {
                await new Promise((resolve, reject) => {
                    client.deleteTodo(deleteRequest, (error, response) => {
                        if (error)
                            reject(error);
                        else
                            resolve(response);
                    });
                });
                const getTodosResponse = await new Promise((resolve, reject) => {
                    client.getTodos({}, (error, response) => {
                        if (error)
                            reject(error);
                        else
                            resolve(response);
                    });
                });
                const todos = getTodosResponse.todos;
                const deletedTodo = todos.find((todo) => todo.id === 1);
                expect(deletedTodo).toBeUndefined();
            }
            catch (error) {
                expect(error).toBeDefined();
            }
        });
        it('should handle multiple deletions of same id gracefully', async () => {
            const request = {
                id: 1,
            };
            try {
                await new Promise((resolve, reject) => {
                    client.deleteTodo(request, (error, response) => {
                        if (error)
                            reject(error);
                        else
                            resolve(response);
                    });
                });
                await new Promise((resolve, reject) => {
                    client.deleteTodo(request, (error, response) => {
                        if (error)
                            reject(error);
                        else
                            resolve(response);
                    });
                });
                fail('Expected NOT_FOUND error for second deletion');
            }
            catch (error) {
                if (error.code === grpc.status.NOT_FOUND) {
                    expect(error.message).toContain('1');
                }
                else {
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
                        client.deleteTodo({ id: testCase.id }, (error, response) => {
                            if (error)
                                reject(error);
                            else
                                resolve(response);
                        });
                    });
                    fail(`Expected validation error for ${testCase.description}`);
                }
                catch (error) {
                    expect(error.code).toBe(grpc.status.INVALID_ARGUMENT);
                }
            }
        });
    });
});
//# sourceMappingURL=todo-service-delete-todo.test.js.map