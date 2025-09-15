# gRPC Contract: Todo Service

## Service Definition
**Service Name**: `TodoService`
**Protocol**: gRPC with Protocol Buffers v3
**Port**: 50051 (default gRPC port)

## Methods

### GetTodos
**Description**: Retrieve all TODO items ordered by creation date (newest first)
**Request**: `GetTodosRequest` (empty)
**Response**: `GetTodosResponse` containing array of todos
**Errors**:
- `INTERNAL` (13) - Database connection error

**Example Call**:
```typescript
const response = await todoClient.getTodos({});
console.log(response.todos); // Todo[]
```

### CreateTodo
**Description**: Create a new TODO item
**Request**: `CreateTodoRequest` with description
**Response**: `CreateTodoResponse` with created todo
**Validation**:
- `description`: Required, 1-500 characters, trimmed
**Errors**:
- `INVALID_ARGUMENT` (3) - Empty or invalid description
- `INTERNAL` (13) - Database error

**Example Call**:
```typescript
const response = await todoClient.createTodo({
  description: "Buy groceries"
});
console.log(response.todo); // Todo object
```

### UpdateTodo
**Description**: Update an existing TODO item
**Request**: `UpdateTodoRequest` with id and optional fields
**Response**: `UpdateTodoResponse` with updated todo
**Validation**:
- `id`: Required, must exist
- `description`: Optional, 1-500 characters if provided
- `completed`: Optional boolean
**Errors**:
- `INVALID_ARGUMENT` (3) - Invalid ID or validation error
- `NOT_FOUND` (5) - Todo ID does not exist
- `INTERNAL` (13) - Database error

**Example Call**:
```typescript
const response = await todoClient.updateTodo({
  id: 1,
  description: "Buy groceries and cook dinner",
  completed: true
});
console.log(response.todo); // Updated Todo object
```

### DeleteTodo
**Description**: Delete a TODO item
**Request**: `DeleteTodoRequest` with id
**Response**: `DeleteTodoResponse` (empty)
**Validation**:
- `id`: Required, must exist
**Errors**:
- `INVALID_ARGUMENT` (3) - Invalid ID
- `NOT_FOUND` (5) - Todo ID does not exist
- `INTERNAL` (13) - Database error

**Example Call**:
```typescript
await todoClient.deleteTodo({ id: 1 });
// No response body for successful deletion
```

## Data Types

### Todo
```protobuf
message Todo {
  int32 id = 1;
  string description = 2;
  bool completed = 3;
  string created_at = 4;  // ISO 8601 format
  string updated_at = 5;  // ISO 8601 format
}
```

**Example**:
```json
{
  "id": 1,
  "description": "Buy groceries",
  "completed": false,
  "created_at": "2025-09-15T10:00:00.000Z",
  "updated_at": "2025-09-15T10:00:00.000Z"
}
```

## Error Handling

### gRPC Status Codes Used
- `OK` (0) - Success
- `INVALID_ARGUMENT` (3) - Validation errors, malformed requests
- `NOT_FOUND` (5) - Todo not found
- `INTERNAL` (13) - Server errors, database issues

### Error Response Format
```protobuf
message ErrorResponse {
  string message = 1;        // Human-readable error message
  int32 code = 2;           // gRPC status code
  repeated ErrorDetail details = 3;  // Validation details
}

message ErrorDetail {
  string field = 1;         // Field name that failed validation
  string message = 2;       // Specific error for this field
}
```

**Example Error**:
```json
{
  "message": "Validation failed",
  "code": 3,
  "details": [
    {
      "field": "description",
      "message": "description must be longer than or equal to 1 characters"
    }
  ]
}
```

## Client Generation

### TypeScript (Frontend)
```bash
# Generate TypeScript client from proto file
protoc --plugin=protoc-gen-ts_proto=./node_modules/.bin/protoc-gen-ts_proto \
  --ts_proto_out=./src/generated \
  --ts_proto_opt=esModuleInterop=true \
  --ts_proto_opt=outputClientImpl=grpc-web \
  ./proto/todo.proto
```

### NestJS (Backend)
```bash
# NestJS will auto-generate interfaces from proto
# Place proto file in src/proto/todo.proto
# Import in module:
# @Module({
#   imports: [
#     ClientsModule.register([{
#       name: 'TODO_PACKAGE',
#       transport: Transport.GRPC,
#       options: {
#         package: 'todo',
#         protoPath: join(__dirname, 'proto/todo.proto'),
#       },
#     }]),
#   ],
# })
```

## Testing Strategy

### Contract Testing
1. **Proto Validation**: Verify proto file compiles correctly
2. **Type Generation**: Ensure TypeScript types are generated properly
3. **Schema Validation**: Test request/response schemas match proto
4. **Error Code Testing**: Verify proper gRPC status codes returned

### Integration Testing
1. **Service Methods**: Test each gRPC method with valid inputs
2. **Error Scenarios**: Test validation errors and not found cases
3. **Data Persistence**: Verify database operations work correctly
4. **Client-Server**: Test frontend gRPC-Web client integration

## Performance Considerations

### gRPC Advantages
- Binary protocol (smaller payload than JSON)
- HTTP/2 multiplexing
- Built-in compression
- Strong typing with schema validation

### Frontend Integration
- Use gRPC-Web for browser compatibility
- Consider connection pooling for multiple requests
- Implement proper error handling and retries
- Use streaming for real-time updates (future enhancement)