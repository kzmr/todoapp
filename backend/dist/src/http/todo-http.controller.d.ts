import { TodoHttpService } from '../services/todo-http.service';
import { TodoEntity } from '../entities/todo.entity';
export declare class CreateTodoDto {
    description: string;
}
export declare class UpdateTodoDto {
    description?: string;
    completed?: boolean;
}
export declare class TodoHttpController {
    private readonly todoHttpService;
    constructor(todoHttpService: TodoHttpService);
    getAllTodos(): Promise<TodoEntity[]>;
    createTodo(createTodoDto: CreateTodoDto): Promise<TodoEntity>;
    updateTodo(id: number, updateTodoDto: UpdateTodoDto): Promise<TodoEntity>;
    deleteTodo(id: number): Promise<void>;
}
