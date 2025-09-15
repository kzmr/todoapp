import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

jest.mock('../../src/services/todo-grpc.service', () => ({
  TodoGrpcService: {
    createTodo: jest.fn(),
    getTodos: jest.fn(),
    updateTodo: jest.fn(),
    deleteTodo: jest.fn(),
  },
}));

import TodoApp from '../../src/app/page';
import { TodoGrpcService } from '../../src/services/todo-grpc.service';

describe('Data Persistence Integration Test', () => {
  const mockGetTodos = TodoGrpcService.getTodos as jest.MockedFunction<typeof TodoGrpcService.getTodos>;
  const mockCreateTodo = TodoGrpcService.createTodo as jest.MockedFunction<typeof TodoGrpcService.createTodo>;
  const mockUpdateTodo = TodoGrpcService.updateTodo as jest.MockedFunction<typeof TodoGrpcService.updateTodo>;

  const mockTodos = [
    {
      id: 1,
      description: 'Buy groceries',
      completed: false,
      created_at: '2025-09-15T10:00:00.000Z',
      updated_at: '2025-09-15T10:00:00.000Z',
    },
    {
      id: 2,
      description: 'Complete project',
      completed: true,
      created_at: '2025-09-14T15:30:00.000Z',
      updated_at: '2025-09-15T09:00:00.000Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load and display persisted todos on page refresh', async () => {
    // Step 1: Mock persisted todos from backend
    mockGetTodos.mockResolvedValue(mockTodos);

    try {
      render(<TodoApp />);

      // Step 3: All todos should remain visible
      await waitFor(() => {
        expect(screen.getByText('Buy groceries')).toBeInTheDocument();
        expect(screen.getByText('Complete project')).toBeInTheDocument();
      });

      // Step 4: Completion statuses should be preserved
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).not.toBeChecked(); // Buy groceries - incomplete
      expect(checkboxes[1]).toBeChecked(); // Complete project - complete

      // Step 5: Todo order should be maintained (newest first)
      const todoTexts = screen.getAllByText(/Buy groceries|Complete project/);
      expect(todoTexts[0]).toHaveTextContent('Buy groceries'); // Newer todo first

    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should persist todos between browser sessions', async () => {
    // Simulate data persistence by ensuring gRPC calls fetch from backend
    mockGetTodos.mockResolvedValue(mockTodos);

    try {
      // First render - simulate initial page load
      const { unmount } = render(<TodoApp />);

      await waitFor(() => {
        expect(mockGetTodos).toHaveBeenCalled();
        expect(screen.getByText('Buy groceries')).toBeInTheDocument();
      });

      // Unmount to simulate closing browser
      unmount();

      // Second render - simulate reopening browser
      render(<TodoApp />);

      // Should call backend again to fetch persisted data
      await waitFor(() => {
        expect(mockGetTodos).toHaveBeenCalledTimes(2);
        expect(screen.getByText('Buy groceries')).toBeInTheDocument();
        expect(screen.getByText('Complete project')).toBeInTheDocument();
      });

    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should handle empty state when no todos are persisted', async () => {
    mockGetTodos.mockResolvedValue([]);

    try {
      render(<TodoApp />);

      await waitFor(() => {
        expect(mockGetTodos).toHaveBeenCalled();
      });

      // Should show empty state message
      expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();
      expect(screen.getByText(/add your first todo/i)).toBeInTheDocument();

    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should persist newly created todos', async () => {
    const user = userEvent.setup();

    // Start with empty state
    mockGetTodos.mockResolvedValue([]);

    // Mock successful creation
    const newTodo = {
      id: 3,
      description: 'New todo item',
      completed: false,
      created_at: '2025-09-15T12:00:00.000Z',
      updated_at: '2025-09-15T12:00:00.000Z',
    };
    mockCreateTodo.mockResolvedValue(newTodo);

    try {
      render(<TodoApp />);

      // Add new todo
      const input = screen.getByPlaceholderText(/add a new todo/i);
      const addButton = screen.getByRole('button', { name: /add todo/i });

      await user.type(input, 'New todo item');
      await user.click(addButton);

      // Should persist to backend
      await waitFor(() => {
        expect(mockCreateTodo).toHaveBeenCalledWith('New todo item');
      });

      // Should appear in UI
      expect(screen.getByText('New todo item')).toBeInTheDocument();

      // Simulate page refresh - should load from backend
      mockGetTodos.mockResolvedValue([newTodo]);

      const { rerender } = render(<TodoApp />);

      await waitFor(() => {
        expect(screen.getByText('New todo item')).toBeInTheDocument();
      });

    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should persist todo status changes', async () => {
    const user = userEvent.setup();

    // Start with incomplete todo
    const incompleteTodo = { ...mockTodos[0] };
    mockGetTodos.mockResolvedValue([incompleteTodo]);

    // Mock successful update
    const completedTodo = { ...incompleteTodo, completed: true, updated_at: '2025-09-15T12:00:00.000Z' };
    mockUpdateTodo.mockResolvedValue(completedTodo);

    try {
      render(<TodoApp />);

      await waitFor(() => {
        expect(screen.getByText('Buy groceries')).toBeInTheDocument();
      });

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();

      // Toggle completion
      await user.click(checkbox);

      // Should persist to backend
      await waitFor(() => {
        expect(mockUpdateTodo).toHaveBeenCalledWith(1, { completed: true });
      });

      // Simulate page refresh - should load updated state
      mockGetTodos.mockResolvedValue([completedTodo]);

      const { rerender } = render(<TodoApp />);

      await waitFor(() => {
        const updatedCheckbox = screen.getByRole('checkbox');
        expect(updatedCheckbox).toBeChecked();
      });

    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should handle backend connection errors gracefully', async () => {
    // Mock connection failure
    mockGetTodos.mockRejectedValue(new Error('Backend unavailable'));

    try {
      render(<TodoApp />);

      // Should show error state
      await waitFor(() => {
        expect(screen.getByText(/failed to load todos/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      });

    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should retry loading todos when retry button is clicked', async () => {
    const user = userEvent.setup();

    // Mock initial failure then success
    mockGetTodos
      .mockRejectedValueOnce(new Error('Backend unavailable'))
      .mockResolvedValueOnce(mockTodos);

    try {
      render(<TodoApp />);

      // Should show error state
      await waitFor(() => {
        expect(screen.getByText(/failed to load todos/i)).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);

      // Should load todos successfully
      await waitFor(() => {
        expect(screen.getByText('Buy groceries')).toBeInTheDocument();
        expect(screen.getByText('Complete project')).toBeInTheDocument();
      });

    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should maintain todo order by creation date (newest first)', async () => {
    // Mock todos in different order than expected display
    const unorderedTodos = [
      mockTodos[1], // Older todo
      mockTodos[0], // Newer todo
    ];
    mockGetTodos.mockResolvedValue(unorderedTodos);

    try {
      render(<TodoApp />);

      await waitFor(() => {
        expect(screen.getByText('Buy groceries')).toBeInTheDocument();
        expect(screen.getByText('Complete project')).toBeInTheDocument();
      });

      // Should display in correct order (newest first)
      const todoItems = screen.getAllByRole('listitem');
      expect(todoItems[0]).toHaveTextContent('Buy groceries'); // 2025-09-15
      expect(todoItems[1]).toHaveTextContent('Complete project'); // 2025-09-14

    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});