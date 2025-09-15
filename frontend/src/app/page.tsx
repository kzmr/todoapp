'use client';

import { useState, useEffect } from 'react';
import { TodoGrpcService as TodoService } from '../services/todo-grpc.service';
import { Todo } from '../generated/todo';

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoDescription, setNewTodoDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingDescription, setEditingDescription] = useState('');

  // Load todos on mount
  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedTodos = await TodoService.getTodos();
      setTodos(fetchedTodos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load todos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = newTodoDescription.trim();
    if (!trimmed) {
      setError('Description cannot be empty');
      return;
    }

    try {
      setCreating(true);
      setError(null);

      const newTodo = await TodoService.createTodo(trimmed);
      setTodos(prev => [newTodo, ...prev]);
      setNewTodoDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create todo');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleTodo = async (id: number, completed: boolean) => {
    try {
      // Optimistic update
      setTodos(prev => prev.map(todo =>
        todo.id === id ? { ...todo, completed } : todo
      ));

      await TodoService.updateTodo(id, { completed });
    } catch (err) {
      // Revert optimistic update
      setTodos(prev => prev.map(todo =>
        todo.id === id ? { ...todo, completed: !completed } : todo
      ));
      setError(err instanceof Error ? err.message : 'Failed to update todo');
    }
  };

  const handleEditStart = (todo: Todo) => {
    setEditingId(todo.id);
    setEditingDescription(todo.description);
  };

  const handleEditSave = async (id: number) => {
    const trimmed = editingDescription.trim();
    if (!trimmed) {
      setError('Description cannot be empty');
      return;
    }

    try {
      const updatedTodo = await TodoService.updateTodo(id, { description: trimmed });
      setTodos(prev => prev.map(todo =>
        todo.id === id ? updatedTodo : todo
      ));
      setEditingId(null);
      setEditingDescription('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update todo');
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingDescription('');
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this todo?')) {
      return;
    }

    try {
      // Optimistic update
      setTodos(prev => prev.filter(todo => todo.id !== id));

      await TodoService.deleteTodo(id);
    } catch (err) {
      // Reload todos on error
      await loadTodos();
      setError(err instanceof Error ? err.message : 'Failed to delete todo');
    }
  };

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-center mb-8">Simple TODO App</h1>
          <div className="text-center">Loading todos...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-8">Simple TODO App</h1>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button
              onClick={() => setError(null)}
              className="float-right font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Add Todo Form */}
        <form onSubmit={handleCreateTodo} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTodoDescription}
              onChange={(e) => setNewTodoDescription(e.target.value)}
              placeholder="Add a new todo..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              disabled={creating}
            />
            <button
              type="submit"
              disabled={creating || !newTodoDescription.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {creating ? 'Adding...' : 'Add Todo'}
            </button>
          </div>
        </form>

        {/* Todo List */}
        {todos.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No todos yet!</p>
            <p className="text-sm">Add your first todo above.</p>
          </div>
        ) : (
          <ul role="list" className="space-y-2">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border"
                role="listitem"
              >
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={(e) => handleToggleTodo(todo.id, e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />

                {/* Description */}
                <div className="flex-1">
                  {editingId === todo.id ? (
                    <input
                      type="text"
                      value={editingDescription}
                      onChange={(e) => setEditingDescription(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleEditSave(todo.id);
                        } else if (e.key === 'Escape') {
                          handleEditCancel();
                        }
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-black"
                      autoFocus
                    />
                  ) : (
                    <span
                      className={todo.completed ? 'line-through text-gray-500' : 'text-black'}
                    >
                      {todo.description}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-1">
                  {editingId === todo.id ? (
                    <>
                      <button
                        onClick={() => handleEditSave(todo.id)}
                        className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleEditCancel}
                        className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEditStart(todo)}
                        className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(todo.id)}
                        className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Retry Button for Connection Errors */}
        {error && error.includes('connection') && (
          <div className="text-center mt-4">
            <button
              onClick={loadTodos}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </main>
  );
}