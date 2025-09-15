import { Repository } from 'typeorm';
import { TodoEntity } from '../entities/todo.entity';
export declare class TodoRepository {
    private readonly repository;
    constructor(repository: Repository<TodoEntity>);
    findAll(): Promise<TodoEntity[]>;
    findByCompletionStatus(completed: boolean): Promise<TodoEntity[]>;
    findById(id: number): Promise<TodoEntity | null>;
    create(description: string): Promise<TodoEntity>;
    update(id: number, updates: {
        description?: string;
        completed?: boolean;
    }): Promise<TodoEntity>;
    delete(id: number): Promise<void>;
    exists(id: number): Promise<boolean>;
    countByStatus(completed?: boolean): Promise<number>;
    markAsCompleted(id: number): Promise<TodoEntity>;
    markAsIncomplete(id: number): Promise<TodoEntity>;
    updateDescription(id: number, description: string): Promise<TodoEntity>;
    findWithPagination(page?: number, limit?: number): Promise<{
        todos: TodoEntity[];
        total: number;
        totalPages: number;
    }>;
    searchByDescription(searchTerm: string): Promise<TodoEntity[]>;
}
