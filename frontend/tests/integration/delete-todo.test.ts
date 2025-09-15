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

describe('Delete Todo Integration Test', () => {
  const mockDeleteTodo = TodoGrpcService.deleteTodo as jest.MockedFunction<typeof TodoGrpcService.deleteTodo>;
  const mockGetTodos = TodoGrpcService.getTodos as jest.MockedFunction<typeof TodoGrpcService.getTodos>;

  const mockTodo = {
    id: 1,
    description: 'Buy groceries',
    completed: false,
    created_at: '2025-09-15T10:00:00.000Z',
    updated_at: '2025-09-15T10:00:00.000Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetTodos.mockResolvedValue([mockTodo]);
    mockDeleteTodo.mockResolvedValue(undefined); // gRPC delete returns void
  });

  it('should delete todo when Delete button is clicked', async () => {
    const user = userEvent.setup();

    try {
      render(<TodoApp />);

      // Step 1: Setup - Have at least one todo in the list
      await waitFor(() => {
        expect(screen.getByText('Buy groceries')).toBeInTheDocument();
      });

      // Step 2: Click "Delete" button next to a todo
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      // Step 3: Verify gRPC service was called
      await waitFor(() => {
        expect(mockDeleteTodo).toHaveBeenCalledWith(1);
      });

      // Step 4: Todo is removed from the list immediately
      await waitFor(() => {
        expect(screen.queryByText('Buy groceries')).not.toBeInTheDocument();
      });

    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should show confirmation dialog before deleting', async () => {
    const user = userEvent.setup();

    // Mock window.confirm
    const mockConfirm = jest.spyOn(window, 'confirm').mockReturnValue(true);

    try {
      render(<TodoApp />);

      await waitFor(() => {
        expect(screen.getByText('Buy groceries')).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      // Should show confirmation
      expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to delete this todo?');

      await waitFor(() => {
        expect(mockDeleteTodo).toHaveBeenCalledWith(1);
      });

    } catch (error) {
      expect(error).toBeDefined();
    } finally {
      mockConfirm.mockRestore();
    }
  });

  it('should not delete when confirmation is cancelled', async () => {
    const user = userEvent.setup();

    // Mock window.confirm to return false (cancelled)
    const mockConfirm = jest.spyOn(window, 'confirm').mockReturnValue(false);

    try {
      render(<TodoApp />);

      await waitFor(() => {
        expect(screen.getByText('Buy groceries')).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      // Should not call delete service
      expect(mockDeleteTodo).not.toHaveBeenCalled();

      // Todo should still be in the list
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();

    } catch (error) {
      expect(error).toBeDefined();
    } finally {
      mockConfirm.mockRestore();
    }
  });

  it('should handle delete error gracefully', async () => {
    const user = userEvent.setup();

    // Mock delete failure
    mockDeleteTodo.mockRejectedValue(new Error('gRPC connection failed'));

    const mockConfirm = jest.spyOn(window, 'confirm').mockReturnValue(true);

    try {
      render(<TodoApp />);

      await waitFor(() => {
        expect(screen.getByText('Buy groceries')).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/failed to delete todo/i)).toBeInTheDocument();
      });

      // Todo should still be in the list
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();

    } catch (error) {
      expect(error).toBeDefined();
    } finally {
      mockConfirm.mockRestore();
    }
  });

  it('should show loading state during deletion', async () => {
    const user = userEvent.setup();

    // Mock slow deletion
    mockDeleteTodo.mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve(undefined), 100))
    );

    const mockConfirm = jest.spyOn(window, 'confirm').mockReturnValue(true);

    try {
      render(<TodoApp />);

      await waitFor(() => {
        expect(screen.getByText('Buy groceries')).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      // Should show loading state
      expect(deleteButton).toBeDisabled();
      expect(screen.getByText(/deleting/i)).toBeInTheDocument();

      // Should complete deletion
      await waitFor(() => {
        expect(screen.queryByText('Buy groceries')).not.toBeInTheDocument();
      });

    } catch (error) {
      expect(error).toBeDefined();
    } finally {
      mockConfirm.mockRestore();
    }
  });

  it('should use optimistic deletion for better UX', async () => {
    const user = userEvent.setup();

    // Mock slow backend response
    mockDeleteTodo.mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve(undefined), 1000))
    );

    const mockConfirm = jest.spyOn(window, 'confirm').mockReturnValue(true);

    try {
      render(<TodoApp />);

      await waitFor(() => {
        expect(screen.getByText('Buy groceries')).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      // Should immediately remove from UI (optimistic deletion)
      await waitFor(() => {
        expect(screen.queryByText('Buy groceries')).not.toBeInTheDocument();
      });

      // Should maintain deleted state after backend confirms
      await waitFor(() => {
        expect(mockDeleteTodo).toHaveBeenCalled();
      }, { timeout: 2000 });

      expect(screen.queryByText('Buy groceries')).not.toBeInTheDocument();

    } catch (error) {
      expect(error).toBeDefined();
    } finally {
      mockConfirm.mockRestore();
    }
  });
});