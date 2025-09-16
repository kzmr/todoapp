import { grpc } from "@improbable-eng/grpc-web";
import {
  TodoServiceClientImpl,
  GrpcWebImpl,
  GetTodosRequest,
  CreateTodoRequest,
  UpdateTodoRequest,
  DeleteTodoRequest,
  Todo,
} from "../generated/todo";

export interface TodoGrpcClientInterface {
  getTodos(): Promise<Todo[]>;
  createTodo(description: string): Promise<Todo>;
  updateTodo(id: number, updates: { description?: string; completed?: boolean }): Promise<Todo>;
  deleteTodo(id: number): Promise<void>;
}

class TodoGrpcServiceImpl implements TodoGrpcClientInterface {
  private client: TodoServiceClientImpl;

  constructor() {
    const grpcUrl = process.env.NEXT_PUBLIC_GRPC_URL || "http://localhost:8081";
    console.log("Initializing gRPC client with URL:", grpcUrl);

    const rpc = new GrpcWebImpl(
      grpcUrl,
      {
        transport: grpc.CrossBrowserHttpTransport({
          withCredentials: false,
        }),
      }
    );

    this.client = new TodoServiceClientImpl(rpc);
  }

  async getTodos(): Promise<Todo[]> {
    try {
      const request: GetTodosRequest = {};
      const response = await this.client.GetTodos(request);
      return response.todos || [];
    } catch (error) {
      console.error("Failed to get todos:", error);
      throw new Error("Failed to load todos. Please check your connection and try again.");
    }
  }

  async createTodo(description: string): Promise<Todo> {
    try {
      const trimmed = description.trim();
      if (!trimmed) {
        throw new Error("Description cannot be empty");
      }

      const request: CreateTodoRequest = {
        description: trimmed,
      };

      const response = await this.client.CreateTodo(request);
      if (!response.todo) {
        throw new Error("Invalid response from server");
      }

      return response.todo;
    } catch (error) {
      console.error("Failed to create todo:", error);
      if (error instanceof Error && error.message.includes("empty")) {
        throw error;
      }
      throw new Error("Failed to create todo. Please try again.");
    }
  }

  async updateTodo(
    id: number,
    updates: { description?: string; completed?: boolean }
  ): Promise<Todo> {
    try {
      if (!id || id <= 0) {
        throw new Error("Invalid todo ID");
      }

      if (updates.description !== undefined && !updates.description.trim()) {
        throw new Error("Description cannot be empty");
      }

      const request: UpdateTodoRequest = {
        id,
        ...updates,
      };

      const response = await this.client.UpdateTodo(request);
      if (!response.todo) {
        throw new Error("Invalid response from server");
      }

      return response.todo;
    } catch (error) {
      console.error("Failed to update todo:", error);
      if (error instanceof Error && error.message.includes("empty")) {
        throw error;
      }
      throw new Error("Failed to update todo. Please try again.");
    }
  }

  async deleteTodo(id: number): Promise<void> {
    try {
      if (!id || id <= 0) {
        throw new Error("Invalid todo ID");
      }

      const request: DeleteTodoRequest = {
        id,
      };

      await this.client.DeleteTodo(request);
    } catch (error) {
      console.error("Failed to delete todo:", error);
      throw new Error("Failed to delete todo. Please try again.");
    }
  }
}

// Export singleton instance
export const TodoGrpcService = new TodoGrpcServiceImpl();