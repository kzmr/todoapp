# Simple Web TODO App Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-09-15

## Active Technologies
- **Language**: TypeScript (latest stable)
- **Frontend**: React 18+, Next.js 14+ (App Router), gRPC-Web client
- **Backend**: NestJS with TypeScript, gRPC microservices
- **Database**: PostgreSQL 15+ with TypeORM/Prisma
- **Testing**: Jest + React Testing Library (frontend), Jest + gRPC testing (backend)
- **API**: gRPC with Protocol Buffers, generated TypeScript clients

## Project Structure
```
backend/
├── src/
│   ├── models/          # Data entities and DTOs
│   ├── services/        # Business logic
│   └── api/            # Controllers and routes
└── tests/
    ├── contract/       # API contract tests
    ├── integration/    # Database integration tests
    └── unit/          # Unit tests

frontend/
├── src/
│   ├── components/     # React components
│   ├── pages/         # Next.js pages
│   └── services/      # API client services
└── tests/
    ├── component/     # Component tests
    └── integration/   # E2E tests

specs/001-web-todo/    # Feature documentation
├── spec.md           # Feature specification
├── plan.md           # Implementation plan
├── research.md       # Technology decisions
├── data-model.md     # Database design
├── quickstart.md     # Testing scenarios
└── contracts/        # gRPC proto files and documentation
```

## Commands
```bash
# Development
npm run dev:backend     # Start NestJS gRPC server (:50051)
npm run dev:frontend    # Start Next.js dev server (:3000)

# gRPC
npm run proto:generate  # Generate TypeScript types from proto files
npm run grpc:client     # Generate gRPC client for frontend

# Testing
npm run test           # Run all tests
npm run test:grpc      # Run gRPC contract tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Generate coverage report

# Database
npm run migration:run     # Apply database migrations
npm run migration:create  # Create new migration

# Production
npm run build         # Build for production
npm run start         # Start production gRPC server
```

## Code Style
### TypeScript
- Use strict TypeScript configuration
- Prefer interfaces over types for objects
- Use class-validator decorators for DTOs
- Implement proper error handling with typed exceptions

### React/Next.js
- Use functional components with hooks
- Prefer Server Components when possible
- Use Client Components for interactivity
- Implement proper loading and error states

### NestJS
- Use decorators for routing, validation, and dependency injection
- Structure code in modules (todo.module.ts)
- Implement DTOs for request/response validation
- Use dependency injection for services

### Database
- Use migrations for schema changes
- Implement proper indexing for performance
- Use parameterized queries to prevent SQL injection
- Follow normalized database design principles

## Recent Changes
### Feature 001: Simple Web TODO App (2025-09-15)
- Added CRUD operations for TODO items
- Implemented PostgreSQL data persistence
- Created RESTful API with OpenAPI documentation
- Built React frontend with real-time updates

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->