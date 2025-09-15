import { Metadata } from "@grpc/grpc-js";
import { Observable } from "rxjs";
export declare const protobufPackage = "todo";
export interface Todo {
    id: number;
    description: string;
    completed: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface GetTodosRequest {
}
export interface CreateTodoRequest {
    description: string;
}
export interface UpdateTodoRequest {
    id: number;
    description?: string | undefined;
    completed?: boolean | undefined;
}
export interface DeleteTodoRequest {
    id: number;
}
export interface GetTodosResponse {
    todos: Todo[];
}
export interface CreateTodoResponse {
    todo: Todo | undefined;
}
export interface UpdateTodoResponse {
    todo: Todo | undefined;
}
export interface DeleteTodoResponse {
}
export interface ErrorDetail {
    field: string;
    message: string;
}
export interface ErrorResponse {
    message: string;
    code: number;
    details: ErrorDetail[];
}
export declare const TODO_PACKAGE_NAME = "todo";
export interface TodoServiceClient {
    getTodos(request: GetTodosRequest, metadata: Metadata, ...rest: any): Observable<GetTodosResponse>;
    createTodo(request: CreateTodoRequest, metadata: Metadata, ...rest: any): Observable<CreateTodoResponse>;
    updateTodo(request: UpdateTodoRequest, metadata: Metadata, ...rest: any): Observable<UpdateTodoResponse>;
    deleteTodo(request: DeleteTodoRequest, metadata: Metadata, ...rest: any): Observable<DeleteTodoResponse>;
}
export interface TodoServiceController {
    getTodos(request: GetTodosRequest, metadata: Metadata, ...rest: any): Promise<GetTodosResponse> | Observable<GetTodosResponse> | GetTodosResponse;
    createTodo(request: CreateTodoRequest, metadata: Metadata, ...rest: any): Promise<CreateTodoResponse> | Observable<CreateTodoResponse> | CreateTodoResponse;
    updateTodo(request: UpdateTodoRequest, metadata: Metadata, ...rest: any): Promise<UpdateTodoResponse> | Observable<UpdateTodoResponse> | UpdateTodoResponse;
    deleteTodo(request: DeleteTodoRequest, metadata: Metadata, ...rest: any): Promise<DeleteTodoResponse> | Observable<DeleteTodoResponse> | DeleteTodoResponse;
}
export declare function TodoServiceControllerMethods(): (constructor: Function) => void;
export declare const TODO_SERVICE_NAME = "TodoService";
