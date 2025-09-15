# Data Model: Simple Web TODO App

## Entities

### Todo
Represents a single task/todo item in the system.

**Fields**:
- `id`: Unique identifier (UUID or auto-increment integer)
- `description`: Text description of the task (required, 1-500 characters)
- `completed`: Boolean status indicating if task is done (default: false)
- `createdAt`: Timestamp when todo was created (auto-generated)
- `updatedAt`: Timestamp when todo was last modified (auto-updated)

**Validation Rules**:
- `description`: Required, minimum 1 character, maximum 500 characters, trimmed
- `completed`: Required boolean value
- `id`: Auto-generated, immutable after creation
- `createdAt`: Auto-generated on creation, immutable
- `updatedAt`: Auto-updated on any modification

**State Transitions**:
- New todo: `completed: false`
- Mark complete: `completed: false → true`
- Mark incomplete: `completed: true → false`
- Update description: `updatedAt` is refreshed
- Delete: Record removed from database

## Database Schema

### PostgreSQL Table Structure

```sql
CREATE TABLE todos (
    id SERIAL PRIMARY KEY,
    description VARCHAR(500) NOT NULL CHECK (LENGTH(TRIM(description)) > 0),
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Index for common queries
CREATE INDEX idx_todos_completed ON todos(completed);
CREATE INDEX idx_todos_created_at ON todos(created_at DESC);

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_todos_updated_at
    BEFORE UPDATE ON todos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## TypeScript Types

### Generated gRPC Types (Auto-generated from proto)

```typescript
// Generated from todo.proto
export interface Todo {
  id: number;
  description: string;
  completed: boolean;
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
}

export interface GetTodosRequest {
  // empty for now
}

export interface GetTodosResponse {
  todos: Todo[];
}

export interface CreateTodoRequest {
  description: string;
}

export interface CreateTodoResponse {
  todo: Todo;
}

export interface UpdateTodoRequest {
  id: number;
  description?: string;
  completed?: boolean;
}

export interface UpdateTodoResponse {
  todo: Todo;
}

export interface DeleteTodoRequest {
  id: number;
}

export interface DeleteTodoResponse {
  // empty
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
```

### Backend Types (NestJS + gRPC)

```typescript
// Database Entity (TypeORM/Prisma)
export class TodoEntity {
  id: number;
  description: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// gRPC Service Implementation
export class TodoService {
  async getTodos(request: GetTodosRequest): Promise<GetTodosResponse> {
    // Implementation
  }

  async createTodo(request: CreateTodoRequest): Promise<CreateTodoResponse> {
    // Implementation with validation
  }

  async updateTodo(request: UpdateTodoRequest): Promise<UpdateTodoResponse> {
    // Implementation with validation
  }

  async deleteTodo(request: DeleteTodoRequest): Promise<DeleteTodoResponse> {
    // Implementation
  }
}

// Validation DTOs (for internal use)
export class CreateTodoValidationDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 500)
  description: string;
}

export class UpdateTodoValidationDto {
  @IsInt()
  @IsPositive()
  id: number;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  description?: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
```

### Frontend Types (React + gRPC-Web)

```typescript
// Import generated gRPC types
import { Todo, CreateTodoRequest, UpdateTodoRequest } from '../generated/todo';

// Component prop types
export interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onEdit: (id: number, description: string) => void;
  onDelete: (id: number) => void;
}

export interface TodoListProps {
  todos: Todo[];
  onToggle: (id: number) => void;
  onEdit: (id: number, description: string) => void;
  onDelete: (id: number) => void;
}

// gRPC Client wrapper
export interface TodoGrpcClient {
  getTodos(): Promise<Todo[]>;
  createTodo(description: string): Promise<Todo>;
  updateTodo(id: number, updates: Partial<Pick<Todo, 'description' | 'completed'>>): Promise<Todo>;
  deleteTodo(id: number): Promise<void>;
}
```

## Business Rules

### Creation Rules
- Description must not be empty after trimming whitespace
- New todos are always created with `completed: false`
- Creation timestamp is automatically set
- ID is auto-generated and immutable

### Update Rules
- Description can be modified if provided and valid
- Completion status can be toggled independently
- Update timestamp is automatically refreshed on any change
- Cannot modify `id`, `createdAt` fields

### Deletion Rules
- Hard delete from database (no soft delete for simplicity)
- No cascading deletes needed (single entity system)
- No recovery mechanism in initial implementation

### Query Patterns
- List all todos: ORDER BY created_at DESC (newest first)
- Filter by completion status: WHERE completed = true/false
- Search by description: WHERE description ILIKE '%search%' (future enhancement)

## Error Handling

### gRPC Status Codes

### Validation Errors
- Empty description → `INVALID_ARGUMENT` (3)
- Description too long → `INVALID_ARGUMENT` (3)
- Invalid completion status → `INVALID_ARGUMENT` (3)
- Malformed request body → `INVALID_ARGUMENT` (3)

### Not Found Errors
- Non-existent todo ID → `NOT_FOUND` (5)
- Deleted todo access → `NOT_FOUND` (5)

### Database Errors
- Connection failures → `INTERNAL` (13)
- Constraint violations → `INVALID_ARGUMENT` (3)
- Unique violations → `ALREADY_EXISTS` (6) (if unique constraints added later)

### gRPC Error Structure
```typescript
// Thrown as gRPC errors in backend
throw new RpcException({
  code: status.INVALID_ARGUMENT,
  message: 'Validation failed',
  details: [
    { field: 'description', message: 'description cannot be empty' }
  ]
});

// Received as gRPC errors in frontend
catch (error: any) {
  if (error.code === status.INVALID_ARGUMENT) {
    // Handle validation error
    console.log(error.details); // Array of field errors
  } else if (error.code === status.NOT_FOUND) {
    // Handle not found error
  }
}
```