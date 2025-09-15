import { TodoRepository } from '../repositories/todo.repository';
import { TodoEntity } from '../entities/todo.entity';
import { GetTodosRequest, GetTodosResponse, CreateTodoRequest, CreateTodoResponse, UpdateTodoRequest, UpdateTodoResponse, DeleteTodoRequest, DeleteTodoResponse } from '../generated/todo';
export declare class TodoService {
    private readonly todoRepository;
    private readonly logger;
    constructor(todoRepository: TodoRepository);
    getTodos(request: GetTodosRequest): Promise<GetTodosResponse>;
    createTodo(request: CreateTodoRequest): Promise<CreateTodoResponse>;
    updateTodo(request: UpdateTodoRequest): Promise<UpdateTodoResponse>;
    deleteTodo(request: DeleteTodoRequest): Promise<DeleteTodoResponse>;
    private entityToGrpc;
    private validateDescription;
    private validateId;
    private validateUpdateRequest;
    getTodosByStatus(completed: boolean): Promise<TodoEntity[]>;
    getTodoCount(): Promise<{
        total: number;
        completed: number;
        incomplete: number;
    }>;
}
