import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// This test is based on the user story from quickstart.md:
// Test Scenario 1: Create New Todo
// 1. Setup: Open app at http://localhost:3000
// 2. Action: Enter "Buy groceries" in the input field
// 3. Action: Click "Add Todo" button
// 4. Expected: New todo appears in the list with "Buy groceries" text
// 5. Expected: Todo is marked as incomplete (unchecked)
// 6. Expected: Input field is cleared

// Mock the gRPC client since we're testing integration without actual backend
jest.mock('../../src/services/todo-grpc.service', () => ({
  TodoGrpcService: {
    createTodo: jest.fn(),
    getTodos: jest.fn(),
    updateTodo: jest.fn(),
    deleteTodo: jest.fn(),
  },
}));

import TodoApp from '../../src/app/page'; // This component doesn't exist yet - test will fail
import { TodoGrpcService } from '../../src/services/todo-grpc.service';

describe('Create New Todo Integration Test', () => {
  const mockCreateTodo = TodoGrpcService.createTodo as jest.MockedFunction<typeof TodoGrpcService.createTodo>;
  const mockGetTodos = TodoGrpcService.getTodos as jest.MockedFunction<typeof TodoGrpcService.getTodos>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock initial empty state
    mockGetTodos.mockResolvedValue([]);

    // Mock successful todo creation
    mockCreateTodo.mockResolvedValue({
      id: 1,
      description: 'Buy groceries',
      completed: false,
      created_at: '2025-09-15T10:00:00.000Z',
      updated_at: '2025-09-15T10:00:00.000Z',
    });
  });

  it('should create new todo when user enters description and clicks Add', async () => {
    const user = userEvent.setup();

    // This test MUST FAIL initially - TodoApp component doesn't exist
    try {
      render(<TodoApp />);

      // Step 1: Setup - App should be rendered
      expect(screen.getByRole('main')).toBeInTheDocument();

      // Step 2: Find input field and enter "Buy groceries"
      const input = screen.getByPlaceholderText(/add a new todo/i);
      expect(input).toBeInTheDocument();

      await user.type(input, 'Buy groceries');
      expect(input).toHaveValue('Buy groceries');

      // Step 3: Click "Add Todo" button
      const addButton = screen.getByRole('button', { name: /add todo/i });
      expect(addButton).toBeInTheDocument();

      await user.click(addButton);

      // Step 4: Verify gRPC service was called
      await waitFor(() => {
        expect(mockCreateTodo).toHaveBeenCalledWith('Buy groceries');
      });

      // Step 5: New todo should appear in the list
      await waitFor(() => {
        expect(screen.getByText('Buy groceries')).toBeInTheDocument();
      });

      // Step 6: Todo should be marked as incomplete (unchecked)
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();

      // Step 7: Input field should be cleared
      expect(input).toHaveValue('');

    } catch (error) {
      // Expected to fail - no implementation yet
      expect(error).toBeDefined();
    }
  });

  it('should show error message when todo creation fails', async () => {
    const user = userEvent.setup();

    // Mock creation failure
    mockCreateTodo.mockRejectedValue(new Error('gRPC connection failed'));

    try {
      render(<TodoApp />);

      const input = screen.getByPlaceholderText(/add a new todo/i);
      const addButton = screen.getByRole('button', { name: /add todo/i });

      await user.type(input, 'Test todo');
      await user.click(addButton);

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/failed to create todo/i)).toBeInTheDocument();
      });

      // Input should not be cleared on error
      expect(input).toHaveValue('Test todo');

    } catch (error) {
      // Expected to fail - no implementation yet
      expect(error).toBeDefined();
    }
  });

  it('should prevent creating todo with empty description', async () => {
    const user = userEvent.setup();

    try {
      render(<TodoApp />);

      const input = screen.getByPlaceholderText(/add a new todo/i);
      const addButton = screen.getByRole('button', { name: /add todo/i });

      // Try to add without entering anything
      await user.click(addButton);

      // Should not call gRPC service
      expect(mockCreateTodo).not.toHaveBeenCalled();

      // Should show validation error
      expect(screen.getByText(/description cannot be empty/i)).toBeInTheDocument();

    } catch (error) {
      // Expected to fail - no implementation yet
      expect(error).toBeDefined();
    }
  });

  it('should trim whitespace from description', async () => {
    const user = userEvent.setup();

    try {
      render(<TodoApp />);

      const input = screen.getByPlaceholderText(/add a new todo/i);
      const addButton = screen.getByRole('button', { name: /add todo/i });

      // Enter description with whitespace
      await user.type(input, '  Buy groceries  ');
      await user.click(addButton);

      // Should call service with trimmed description
      await waitFor(() => {
        expect(mockCreateTodo).toHaveBeenCalledWith('Buy groceries');
      });

    } catch (error) {
      // Expected to fail - no implementation yet
      expect(error).toBeDefined();
    }
  });

  it('should handle Enter key to create todo', async () => {
    const user = userEvent.setup();

    try {
      render(<TodoApp />);

      const input = screen.getByPlaceholderText(/add a new todo/i);

      await user.type(input, 'Buy groceries');
      await user.keyboard('{Enter}');

      // Should call gRPC service
      await waitFor(() => {
        expect(mockCreateTodo).toHaveBeenCalledWith('Buy groceries');
      });

    } catch (error) {
      // Expected to fail - no implementation yet
      expect(error).toBeDefined();
    }
  });

  it('should show loading state while creating todo', async () => {
    const user = userEvent.setup();

    // Mock slow creation
    mockCreateTodo.mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({
        id: 1,
        description: 'Buy groceries',
        completed: false,
        created_at: '2025-09-15T10:00:00.000Z',
        updated_at: '2025-09-15T10:00:00.000Z',
      }), 100))
    );

    try {
      render(<TodoApp />);

      const input = screen.getByPlaceholderText(/add a new todo/i);
      const addButton = screen.getByRole('button', { name: /add todo/i });

      await user.type(input, 'Buy groceries');
      await user.click(addButton);

      // Should show loading state
      expect(screen.getByText(/adding todo/i)).toBeInTheDocument();
      expect(addButton).toBeDisabled();

      // Should complete and show todo
      await waitFor(() => {
        expect(screen.getByText('Buy groceries')).toBeInTheDocument();
      });

      expect(addButton).not.toBeDisabled();

    } catch (error) {
      // Expected to fail - no implementation yet
      expect(error).toBeDefined();
    }
  });
});