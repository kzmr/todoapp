export declare class ValidationMiddleware {
    private readonly logger;
    validateDescription(description: string, fieldName?: string): string;
    validateId(id: number, fieldName?: string): number;
    validateBoolean(value: boolean, fieldName: string): boolean;
    validateCreateTodoRequest(request: any): {
        description: string;
    };
    validateUpdateTodoRequest(request: any): {
        id: number;
        description?: string;
        completed?: boolean;
    };
    validateDeleteTodoRequest(request: any): {
        id: number;
    };
    handleDatabaseError(error: any, operation: string): never;
    handleGenericError(error: any, operation: string): never;
}
