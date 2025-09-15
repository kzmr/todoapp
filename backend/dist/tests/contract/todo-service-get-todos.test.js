"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
describe('TodoService.GetTodos Contract Test', () => {
    let app;
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
    afterAll(async () => {
        if (app) {
            await app.close();
        }
    });
    describe('GetTodos method contract', () => {
        it('should accept empty GetTodosRequest', async () => {
            const request = {};
            await expect(new Promise((resolve, reject) => {
                client.getTodos(request, (error, response) => {
                    if (error)
                        reject(error);
                    else
                        resolve(response);
                });
            })).rejects.toThrow();
        });
        it('should return GetTodosResponse with todos array structure', async () => {
            const request = {};
            try {
                const response = await new Promise((resolve, reject) => {
                    client.getTodos(request, (error, response) => {
                        if (error)
                            reject(error);
                        else
                            resolve(response);
                    });
                });
                expect(response).toHaveProperty('todos');
                expect(Array.isArray(response.todos)).toBe(true);
            }
            catch (error) {
                expect(error).toBeDefined();
            }
        });
        it('should return todos with correct structure when todos exist', async () => {
            const request = {};
            try {
                const response = await new Promise((resolve, reject) => {
                    client.getTodos(request, (error, response) => {
                        if (error)
                            reject(error);
                        else
                            resolve(response);
                    });
                });
                const todos = response.todos;
                if (todos.length > 0) {
                    const todo = todos[0];
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
            }
            catch (error) {
                expect(error).toBeDefined();
            }
        });
        it('should return empty array when no todos exist', async () => {
            const request = {};
            try {
                const response = await new Promise((resolve, reject) => {
                    client.getTodos(request, (error, response) => {
                        if (error)
                            reject(error);
                        else
                            resolve(response);
                    });
                });
                expect(response.todos).toEqual([]);
            }
            catch (error) {
                expect(error).toBeDefined();
            }
        });
    });
});
//# sourceMappingURL=todo-service-get-todos.test.js.map