import { TodoService } from '../services/todo.service';
import { GetTodosRequest, GetTodosResponse, CreateTodoRequest, CreateTodoResponse, UpdateTodoRequest, UpdateTodoResponse, DeleteTodoRequest, DeleteTodoResponse } from '../generated/todo';
export declare class TodoController {
    private readonly todoService;
    private readonly logger;
    constructor(todoService: TodoService);
    getTodos(request: GetTodosRequest): Promise<GetTodosResponse>;
    createTodo(request: CreateTodoRequest): Promise<CreateTodoResponse>;
    updateTodo(request: UpdateTodoRequest): Promise<UpdateTodoResponse>;
    deleteTodo(request: DeleteTodoRequest): Promise<DeleteTodoResponse>;
}
