# gRPC-Web TODO Application

A fullstack TODO application built with gRPC communication between frontend and backend.

## Tech Stack

- **Backend**: NestJS with gRPC server
- **Frontend**: Next.js with gRPC-Web client
- **Database**: SQLite with TypeORM
- **Proxy**: Envoy for gRPC-Web browser compatibility
- **Language**: TypeScript

## Architecture

```
Browser (Next.js) -> Envoy Proxy -> NestJS gRPC Server
```

The application uses gRPC for communication between frontend and backend, with Envoy proxy to enable gRPC-Web support in browsers.

## Prerequisites

- Node.js (v18 or higher)
- npm
- Docker (for Envoy proxy)

## Setup Instructions

### 1. Install Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### 2. Generate Protocol Buffer Types

#### Backend
```bash
cd backend
npm run proto:generate
```

#### Frontend
```bash
cd frontend
npm run proto:generate
```

### 3. Build Applications

#### Backend
```bash
cd backend
npm run build
```

#### Frontend
```bash
cd frontend
npm run build
```

## Running the Application

### Development Mode

#### 1. Start Envoy Proxy
```bash
# From project root
docker-compose up envoy
```

#### 2. Start Backend Server
```bash
cd backend
npm run start:dev
```
- gRPC server runs on port 50051
- HTTP server runs on port 8080

#### 3. Start Frontend Development Server
```bash
cd frontend
npm run dev
```
- Frontend runs on port 3000

#### 4. Access Application
Open your browser and navigate to `http://localhost:3000`

### Production Mode

#### 1. Start Envoy Proxy
```bash
docker-compose up envoy
```

#### 2. Start Backend Server
```bash
cd backend
npm run build
npm run start:prod
```

#### 3. Start Frontend Server
```bash
cd frontend
npm run build
npm start
```

## API Endpoints

The application uses gRPC with the following service methods:

- `GetTodos()` - Retrieve all todos
- `CreateTodo(CreateTodoRequest)` - Create a new todo
- `UpdateTodo(UpdateTodoRequest)` - Update an existing todo
- `DeleteTodo(DeleteTodoRequest)` - Delete a todo

## gRPC-Web Configuration

Envoy proxy is configured to:
- Listen on port 8081 for gRPC-Web requests
- Forward requests to the gRPC server on port 50051
- Handle CORS and protocol translation

## Testing

#### Backend Tests
```bash
cd backend
npm test
```

#### Frontend Tests
```bash
cd frontend
npm test
```

## Database

The application uses SQLite as the database, which is automatically created when the backend starts. The database file is located at `backend/database.sqlite`.

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000, 8080, 8081, and 50051 are available
2. **Envoy not starting**: Check Docker is running and port 8081 is free
3. **gRPC connection errors**: Verify Envoy proxy is running and accessible
4. **Protocol buffer errors**: Regenerate proto types with `npm run proto:generate`

### Logs

- Backend logs: Check console output from `npm run start:dev`
- Frontend logs: Check browser console and terminal output
- Envoy logs: Check Docker container logs with `docker-compose logs envoy`

## Development

This project follows Test-Driven Development (TDD) principles with comprehensive test coverage for both backend and frontend components.