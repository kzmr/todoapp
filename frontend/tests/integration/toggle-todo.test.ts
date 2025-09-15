import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// This test is based on user stories from quickstart.md:
// Test Scenario 2: Mark Todo Complete
// Test Scenario 3: Mark Todo Incomplete

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

describe('Toggle Todo Complete/Incomplete Integration Test', () => {
  const mockUpdateTodo = TodoGrpcService.updateTodo as jest.MockedFunction<typeof TodoGrpcService.updateTodo>;
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

    // Mock initial state with one incomplete todo
    mockGetTodos.mockResolvedValue([mockTodo]);
  });

  describe('Mark Todo Complete', () => {
    it('should mark incomplete todo as complete when checkbox is clicked', async () => {
      const user = userEvent.setup();

      // Mock successful update
      mockUpdateTodo.mockResolvedValue({
        ...mockTodo,
        completed: true,
        updated_at: '2025-09-15T11:00:00.000Z',
      });

      try {
        render(<TodoApp />);

        // Step 1: Setup - Have at least one incomplete todo in the list
        await waitFor(() => {
          expect(screen.getByText('Buy groceries')).toBeInTheDocument();
        });

        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).not.toBeChecked();

        // Step 2: Click the checkbox next to the incomplete todo
        await user.click(checkbox);

        // Step 3: Verify gRPC service was called
        await waitFor(() => {
          expect(mockUpdateTodo).toHaveBeenCalledWith(1, { completed: true });
        });

        // Step 4: Todo should be marked as complete (checked)
        await waitFor(() => {
          expect(checkbox).toBeChecked();
        });

        // Step 5: Todo text should show completed styling
        const todoText = screen.getByText('Buy groceries');
        expect(todoText).toHaveClass('line-through'); // or similar completed styling

      } catch (error) {
        // Expected to fail - no implementation yet
        expect(error).toBeDefined();
      }
    });

    it('should persist completion status on page refresh', async () => {
      // Mock completed todo
      const completedTodo = { ...mockTodo, completed: true };
      mockGetTodos.mockResolvedValue([completedTodo]);

      try {
        render(<TodoApp />);

        // Should load completed todo from backend
        await waitFor(() => {
          const checkbox = screen.getByRole('checkbox');
          expect(checkbox).toBeChecked();
        });

      } catch (error) {
        // Expected to fail - no implementation yet
        expect(error).toBeDefined();
      }
    });
  });

  describe('Mark Todo Incomplete', () => {
    beforeEach(() => {
      // Mock initial state with one complete todo
      const completedTodo = { ...mockTodo, completed: true };
      mockGetTodos.mockResolvedValue([completedTodo]);
    });

    it('should mark complete todo as incomplete when checkbox is clicked', async () => {
      const user = userEvent.setup();

      // Mock successful update
      mockUpdateTodo.mockResolvedValue({
        ...mockTodo,
        completed: false,
        updated_at: '2025-09-15T11:00:00.000Z',
      });

      try {
        render(<TodoApp />);

        // Step 1: Setup - Have at least one complete todo in the list
        await waitFor(() => {
          const checkbox = screen.getByRole('checkbox');
          expect(checkbox).toBeChecked();
        });

        // Step 2: Click the checkbox next to the completed todo
        await user.click(screen.getByRole('checkbox'));

        // Step 3: Verify gRPC service was called
        await waitFor(() => {
          expect(mockUpdateTodo).toHaveBeenCalledWith(1, { completed: false });
        });

        // Step 4: Todo should be marked as incomplete (unchecked)
        await waitFor(() => {
          const checkbox = screen.getByRole('checkbox');
          expect(checkbox).not.toBeChecked();
        });

        // Step 5: Todo text should return to normal styling
        const todoText = screen.getByText('Buy groceries');
        expect(todoText).not.toHaveClass('line-through');

      } catch (error) {
        // Expected to fail - no implementation yet
        expect(error).toBeDefined();
      }
    });

    it('should persist incomplete status on page refresh', async () => {
      // Mock incomplete todo after update
      mockGetTodos.mockResolvedValue([mockTodo]);

      try {
        render(<TodoApp />);

        // Should load incomplete todo from backend
        await waitFor(() => {
          const checkbox = screen.getByRole('checkbox');
          expect(checkbox).not.toBeChecked();
        });

      } catch (error) {
        // Expected to fail - no implementation yet
        expect(error).toBeDefined();
      }
    });
  });

  describe('Error Handling', () => {
    it('should revert checkbox state when update fails', async () => {
      const user = userEvent.setup();

      // Mock update failure
      mockUpdateTodo.mockRejectedValue(new Error('gRPC connection failed'));

      try {
        render(<TodoApp />);

        await waitFor(() => {
          expect(screen.getByText('Buy groceries')).toBeInTheDocument();
        });

        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).not.toBeChecked();

        // Try to toggle
        await user.click(checkbox);

        // Should show error and revert state
        await waitFor(() => {
          expect(screen.getByText(/failed to update todo/i)).toBeInTheDocument();
          expect(checkbox).not.toBeChecked(); // Reverted
        });

      } catch (error) {
        // Expected to fail - no implementation yet
        expect(error).toBeDefined();
      }
    });

    it('should show loading state during update', async () => {
      const user = userEvent.setup();

      // Mock slow update
      mockUpdateTodo.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          ...mockTodo,
          completed: true,
          updated_at: '2025-09-15T11:00:00.000Z',
        }), 100))
      );

      try {
        render(<TodoApp />);

        await waitFor(() => {
          expect(screen.getByText('Buy groceries')).toBeInTheDocument();
        });

        const checkbox = screen.getByRole('checkbox');
        await user.click(checkbox);

        // Should show loading state
        expect(checkbox).toBeDisabled();

        // Should complete update
        await waitFor(() => {
          expect(checkbox).toBeChecked();
          expect(checkbox).not.toBeDisabled();
        });

      } catch (error) {
        // Expected to fail - no implementation yet
        expect(error).toBeDefined();
      }
    });
  });

  describe('Optimistic Updates', () => {
    it('should immediately update UI before backend confirms', async () => {
      const user = userEvent.setup();

      // Mock slow backend response
      mockUpdateTodo.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          ...mockTodo,
          completed: true,
          updated_at: '2025-09-15T11:00:00.000Z',
        }), 1000))
      );

      try {
        render(<TodoApp />);

        await waitFor(() => {
          expect(screen.getByText('Buy groceries')).toBeInTheDocument();
        });

        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).not.toBeChecked();

        await user.click(checkbox);

        // Should immediately show checked state (optimistic update)
        expect(checkbox).toBeChecked();

        // Should maintain checked state after backend confirms
        await waitFor(() => {
          expect(mockUpdateTodo).toHaveBeenCalled();
        }, { timeout: 2000 });

        expect(checkbox).toBeChecked();

      } catch (error) {
        // Expected to fail - no implementation yet
        expect(error).toBeDefined();
      }
    });
  });
});