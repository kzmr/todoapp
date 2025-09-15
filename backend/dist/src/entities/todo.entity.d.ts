export declare class TodoEntity {
    id: number;
    description: string;
    completed: boolean;
    createdAt: Date;
    updatedAt: Date;
    constructor(partial?: Partial<TodoEntity>);
    markAsCompleted(): void;
    markAsIncomplete(): void;
    updateDescription(description: string): void;
    toGrpcFormat(): {
        id: number;
        description: string;
        completed: boolean;
        created_at: string;
        updated_at: string;
    };
    static fromCreateRequest(description: string): TodoEntity;
    applyUpdates(updates: {
        description?: string;
        completed?: boolean;
    }): void;
}
