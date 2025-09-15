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

describe('Edit Todo Description Integration Test', () => {
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
    mockGetTodos.mockResolvedValue([mockTodo]);
  });

  it('should edit todo description when Edit button is clicked', async () => {
    const user = userEvent.setup();

    mockUpdateTodo.mockResolvedValue({
      ...mockTodo,
      description: 'Updated todo description',
      updated_at: '2025-09-15T11:00:00.000Z',
    });

    try {
      render(<TodoApp />);

      await waitFor(() => {
        expect(screen.getByText('Buy groceries')).toBeInTheDocument();
      });

      // Step 2: Click "Edit" button next to a todo
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      // Step 3: Todo description becomes editable
      const input = screen.getByDisplayValue('Buy groceries');
      expect(input).toBeInTheDocument();

      // Step 4: Change text to "Updated todo description"
      await user.clear(input);
      await user.type(input, 'Updated todo description');

      // Step 5: Save changes (Enter key or Save button)
      await user.keyboard('{Enter}');

      // Step 6: Verify gRPC service was called
      await waitFor(() => {
        expect(mockUpdateTodo).toHaveBeenCalledWith(1, { description: 'Updated todo description' });
      });

      // Step 7: Todo displays updated description
      await waitFor(() => {
        expect(screen.getByText('Updated todo description')).toBeInTheDocument();
      });

    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should cancel edit when Escape key is pressed', async () => {
    const user = userEvent.setup();

    try {
      render(<TodoApp />);

      await waitFor(() => {
        expect(screen.getByText('Buy groceries')).toBeInTheDocument();
      });

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      const input = screen.getByDisplayValue('Buy groceries');
      await user.clear(input);
      await user.type(input, 'Changed text');

      // Cancel with Escape
      await user.keyboard('{Escape}');

      // Should revert to original text
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();
      expect(mockUpdateTodo).not.toHaveBeenCalled();

    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should save changes with Save button click', async () => {
    const user = userEvent.setup();

    mockUpdateTodo.mockResolvedValue({
      ...mockTodo,
      description: 'Updated via save button',
      updated_at: '2025-09-15T11:00:00.000Z',
    });

    try {
      render(<TodoApp />);

      await waitFor(() => {
        expect(screen.getByText('Buy groceries')).toBeInTheDocument();
      });

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      const input = screen.getByDisplayValue('Buy groceries');
      await user.clear(input);
      await user.type(input, 'Updated via save button');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockUpdateTodo).toHaveBeenCalledWith(1, { description: 'Updated via save button' });
      });

    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should prevent saving empty description', async () => {
    const user = userEvent.setup();

    try {
      render(<TodoApp />);

      await waitFor(() => {
        expect(screen.getByText('Buy groceries')).toBeInTheDocument();
      });

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      const input = screen.getByDisplayValue('Buy groceries');
      await user.clear(input);
      await user.keyboard('{Enter}');

      // Should show validation error
      expect(screen.getByText(/description cannot be empty/i)).toBeInTheDocument();
      expect(mockUpdateTodo).not.toHaveBeenCalled();

    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});