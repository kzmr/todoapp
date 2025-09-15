# Quickstart Guide: Simple Web TODO App

## Development Setup

### Prerequisites
- Node.js 18+ installed
- PostgreSQL 15+ installed and running
- Git for version control

### Initial Setup
```bash
# Clone and navigate to project
git clone <repository-url>
cd todoapp

# Install dependencies for both frontend and backend
cd backend && npm install
cd ../frontend && npm install

# Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Configure database connection in backend/.env
DATABASE_URL="postgresql://username:password@localhost:5432/todoapp"

# Run database migrations
cd backend && npm run migration:run

# Start development servers
npm run dev:backend  # Terminal 1 - Backend on :3001
npm run dev:frontend # Terminal 2 - Frontend on :3000
```

### Quick Test Flow
```bash
# Test gRPC service with grpcurl
grpcurl -plaintext -d '{}' localhost:50051 todo.TodoService/GetTodos
grpcurl -plaintext -d '{"description": "Test todo"}' localhost:50051 todo.TodoService/CreateTodo

# Open browser
open http://localhost:3000
```

## User Acceptance Testing

### Test Scenario 1: Create New Todo
1. **Setup**: Open app at http://localhost:3000
2. **Action**: Enter "Buy groceries" in the input field
3. **Action**: Click "Add Todo" button
4. **Expected**: New todo appears in the list with "Buy groceries" text
5. **Expected**: Todo is marked as incomplete (unchecked)
6. **Expected**: Input field is cleared

### Test Scenario 2: Mark Todo Complete
1. **Setup**: Have at least one incomplete todo in the list
2. **Action**: Click the checkbox next to an incomplete todo
3. **Expected**: Todo is marked as complete (checked)
4. **Expected**: Todo text shows completed styling (strikethrough/grayed out)
5. **Expected**: Completion status persists on page refresh

### Test Scenario 3: Mark Todo Incomplete
1. **Setup**: Have at least one complete todo in the list
2. **Action**: Click the checkbox next to a completed todo
3. **Expected**: Todo is marked as incomplete (unchecked)
4. **Expected**: Todo text returns to normal styling
5. **Expected**: Status change persists on page refresh

### Test Scenario 4: Edit Todo Description
1. **Setup**: Have at least one todo in the list
2. **Action**: Click "Edit" button next to a todo
3. **Expected**: Todo description becomes editable (input field or inline edit)
4. **Action**: Change text to "Updated todo description"
5. **Action**: Save changes (Enter key or Save button)
6. **Expected**: Todo displays updated description
7. **Expected**: Changes persist on page refresh

### Test Scenario 5: Delete Todo
1. **Setup**: Have at least one todo in the list
2. **Action**: Click "Delete" button next to a todo
3. **Expected**: Todo is removed from the list immediately
4. **Expected**: Deletion persists on page refresh
5. **Expected**: No error messages shown

### Test Scenario 6: Empty Input Validation
1. **Setup**: Open app with empty input field
2. **Action**: Click "Add Todo" without entering text
3. **Expected**: No new todo is created
4. **Expected**: Error message shows "Description cannot be empty"
5. **Action**: Enter only spaces " " and click "Add Todo"
6. **Expected**: No new todo is created (spaces trimmed)

### Test Scenario 7: Long Description Validation
1. **Setup**: Open app input field
2. **Action**: Enter a description longer than 500 characters
3. **Action**: Click "Add Todo"
4. **Expected**: Error message shows "Description too long (max 500 characters)"
5. **Expected**: No todo is created

### Test Scenario 8: Data Persistence
1. **Setup**: Create 2-3 todos with mixed completion statuses
2. **Action**: Refresh the browser page (F5)
3. **Expected**: All todos remain visible
4. **Expected**: Completion statuses are preserved
5. **Expected**: Todo order is maintained (newest first)

### Test Scenario 9: Visual Distinction
1. **Setup**: Create todos with both completed and incomplete statuses
2. **Verify**: Completed todos are visually distinct from incomplete ones
3. **Expected**: Clear visual indicator (checkbox, strikethrough, color, etc.)
4. **Expected**: User can easily distinguish between states at a glance

### Test Scenario 10: Error Handling
1. **Setup**: Stop the backend server (simulate API failure)
2. **Action**: Try to create, update, or delete a todo
3. **Expected**: User-friendly error message displayed
4. **Expected**: App doesn't crash or become unusable
5. **Action**: Restart backend server
6. **Expected**: App functionality resumes normally

## gRPC API Testing

### Manual gRPC Tests
```bash
# Install grpcurl for testing
brew install grpcurl  # macOS
# or: go install github.com/fullstorydev/grpcurl/cmd/grpcurl@latest

# Test 1: Get all todos (should return empty list initially)
grpcurl -plaintext -d '{}' localhost:50051 todo.TodoService/GetTodos

# Test 2: Create a new todo
grpcurl -plaintext -d '{"description": "Test todo item"}' localhost:50051 todo.TodoService/CreateTodo

# Test 3: Update todo (replace 1 with actual ID from create response)
grpcurl -plaintext -d '{"id": 1, "description": "Updated todo", "completed": true}' localhost:50051 todo.TodoService/UpdateTodo

# Test 4: Delete todo (replace 1 with actual ID)
grpcurl -plaintext -d '{"id": 1}' localhost:50051 todo.TodoService/DeleteTodo

# Test 5: Validation error (empty description)
grpcurl -plaintext -d '{"description": ""}' localhost:50051 todo.TodoService/CreateTodo

# Test 6: Not found error (non-existent ID)
grpcurl -plaintext -d '{"id": 999999}' localhost:50051 todo.TodoService/UpdateTodo

# List available services and methods
grpcurl -plaintext localhost:50051 list
grpcurl -plaintext localhost:50051 describe todo.TodoService
```

### Expected gRPC Responses
```json
// TodoService/GetTodos - Success
{
  "todos": [
    {
      "id": 1,
      "description": "Test todo item",
      "completed": false,
      "createdAt": "2025-09-15T10:00:00.000Z",
      "updatedAt": "2025-09-15T10:00:00.000Z"
    }
  ]
}

// TodoService/CreateTodo - Success
{
  "todo": {
    "id": 1,
    "description": "Test todo item",
    "completed": false,
    "createdAt": "2025-09-15T10:00:00.000Z",
    "updatedAt": "2025-09-15T10:00:00.000Z"
  }
}

// TodoService/CreateTodo - Validation Error (gRPC status INVALID_ARGUMENT)
{
  "error": {
    "code": 3,
    "message": "INVALID_ARGUMENT",
    "details": [
      {
        "type_url": "type.googleapis.com/todo.ErrorResponse",
        "value": {
          "message": "Validation failed",
          "code": 3,
          "details": [
            {
              "field": "description",
              "message": "description must be longer than or equal to 1 characters"
            }
          ]
        }
      }
    ]
  }
}

// TodoService/UpdateTodo - Not Found Error (gRPC status NOT_FOUND)
{
  "error": {
    "code": 5,
    "message": "NOT_FOUND: Todo with ID 999999 not found",
    "details": []
  }
}
```

## Performance Validation

### Loading Performance
- **Initial page load**: < 2 seconds
- **Todo list rendering**: < 500ms for 50 items
- **API response times**: < 200ms average

### Accessibility Testing
- **Keyboard navigation**: Tab through all interactive elements
- **Screen reader**: Proper ARIA labels and roles
- **Color contrast**: WCAG AA compliance
- **Focus indicators**: Visible focus states

## Browser Compatibility
- **Chrome**: Latest version
- **Firefox**: Latest version
- **Safari**: Latest version
- **Edge**: Latest version

## Production Readiness Checklist
- [ ] All test scenarios pass
- [ ] API contract validation complete
- [ ] Performance benchmarks met
- [ ] Error handling verified
- [ ] Data persistence confirmed
- [ ] Security headers configured
- [ ] Environment variables properly set
- [ ] Database migrations work
- [ ] Build process successful
- [ ] Deployment configuration ready