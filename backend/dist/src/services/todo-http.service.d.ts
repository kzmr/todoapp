import { TodoRepository } from '../repositories/todo.repository';
import { TodoEntity } from '../entities/todo.entity';
export declare class TodoHttpService {
    private readonly todoRepository;
    constructor(todoRepository: TodoRepository);
    getAllTodos(): Promise<TodoEntity[]>;
    createTodo(description: string): Promise<TodoEntity>;
    updateTodo(id: number, updates: {
        description?: string;
        completed?: boolean;
    }): Promise<TodoEntity>;
    deleteTodo(id: number): Promise<void>;
}
