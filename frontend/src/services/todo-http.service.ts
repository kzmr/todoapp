export interface Todo {
  id: number;
  description: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TodoServiceInterface {
  getTodos(): Promise<Todo[]>;
  createTodo(description: string): Promise<Todo>;
  updateTodo(id: number, updates: { description?: string; completed?: boolean }): Promise<Todo>;
  deleteTodo(id: number): Promise<void>;
}

class TodoHttpServiceImpl implements TodoServiceInterface {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
  }

  async getTodos(): Promise<Todo[]> {
    try {
      const response = await fetch(`${this.baseUrl}/todos`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get todos:', error);
      throw new Error('Failed to load todos. Please check your connection and try again.');
    }
  }

  async createTodo(description: string): Promise<Todo> {
    try {
      const trimmed = description.trim();
      if (!trimmed) {
        throw new Error('Description cannot be empty');
      }

      const response = await fetch(`${this.baseUrl}/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description: trimmed }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to create todo:', error);
      if (error instanceof Error && error.message.includes('empty')) {
        throw error;
      }
      throw new Error('Failed to create todo. Please try again.');
    }
  }

  async updateTodo(
    id: number,
    updates: { description?: string; completed?: boolean }
  ): Promise<Todo> {
    try {
      if (!id || id <= 0) {
        throw new Error('Invalid todo ID');
      }

      if (updates.description !== undefined && !updates.description.trim()) {
        throw new Error('Description cannot be empty');
      }

      const response = await fetch(`${this.baseUrl}/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to update todo:', error);
      if (error instanceof Error && error.message.includes('empty')) {
        throw error;
      }
      throw new Error('Failed to update todo. Please try again.');
    }
  }

  async deleteTodo(id: number): Promise<void> {
    try {
      if (!id || id <= 0) {
        throw new Error('Invalid todo ID');
      }

      const response = await fetch(`${this.baseUrl}/todos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to delete todo:', error);
      throw new Error('Failed to delete todo. Please try again.');
    }
  }
}

export const TodoService = new TodoHttpServiceImpl();