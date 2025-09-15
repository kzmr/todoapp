# Tasks: Simple Web TODO App

**Input**: Design documents from `/specs/001-web-todo/`
**Prerequisites**: plan.md (✓), research.md (✓), data-model.md (✓), contracts/ (✓)

## Execution Flow (main)
```
1. Load plan.md from feature directory ✓
   → Tech stack: TypeScript, React/Next.js, NestJS gRPC, PostgreSQL
   → Structure: Web app (frontend + backend)
2. Load optional design documents ✓
   → data-model.md: Todo entity with CRUD operations
   → contracts/: gRPC service with 4 methods
   → research.md: Single-user, persistent storage decisions
3. Generate tasks by category ✓
   → Setup: 8 tasks (projects, proto, DB, env)
   → Tests: 9 tasks (contract + integration)
   → Core: 15 tasks (models, services, gRPC handlers, components)
   → Integration: 6 tasks (client, error handling, polish)
   → Polish: 5 tasks (unit tests, performance, docs)
4. Apply task rules ✓
   → [P] = parallel tasks (different files)
   → TDD order: tests before implementation
5. Number tasks sequentially (T001-T043) ✓
6. Generate dependency graph ✓
7. Create parallel execution examples ✓
8. Validate task completeness ✓
   → All gRPC methods have tests ✓
   → Todo entity has model ✓
   → All contract tests before implementation ✓
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Web app**: `backend/src/`, `frontend/src/`
- Paths adjusted based on plan.md structure decision

## Phase 3.1: Setup (8 tasks)

- [ ] T001 Create project structure: backend/ and frontend/ directories with package.json files
- [ ] T002 [P] Initialize backend project with NestJS, gRPC, TypeORM, PostgreSQL dependencies in backend/package.json
- [ ] T003 [P] Initialize frontend project with Next.js, React, gRPC-Web, Tailwind CSS dependencies in frontend/package.json
- [ ] T004 [P] Configure Protocol Buffers compilation tooling and scripts in backend/package.json
- [ ] T005 [P] Setup PostgreSQL database creation script and environment configuration in backend/.env.example
- [ ] T006 [P] Configure ESLint, Prettier, and TypeScript for backend in backend/tsconfig.json and .eslintrc.js
- [ ] T007 [P] Configure ESLint, Prettier, and TypeScript for frontend in frontend/tsconfig.json and .eslintrc.js
- [ ] T008 Copy gRPC proto file to backend/src/proto/todo.proto and frontend/src/proto/todo.proto

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Contract Tests (4 tasks)
- [ ] T009 [P] Contract test TodoService.GetTodos() in backend/tests/contract/todo-service-get-todos.test.ts
- [ ] T010 [P] Contract test TodoService.CreateTodo() in backend/tests/contract/todo-service-create-todo.test.ts
- [ ] T011 [P] Contract test TodoService.UpdateTodo() in backend/tests/contract/todo-service-update-todo.test.ts
- [ ] T012 [P] Contract test TodoService.DeleteTodo() in backend/tests/contract/todo-service-delete-todo.test.ts

### Integration Tests (5 tasks)
- [ ] T013 [P] Integration test "Create New Todo" scenario in frontend/tests/integration/create-todo.test.ts
- [ ] T014 [P] Integration test "Mark Todo Complete/Incomplete" scenario in frontend/tests/integration/toggle-todo.test.ts
- [ ] T015 [P] Integration test "Edit Todo Description" scenario in frontend/tests/integration/edit-todo.test.ts
- [ ] T016 [P] Integration test "Delete Todo" scenario in frontend/tests/integration/delete-todo.test.ts
- [ ] T017 [P] Integration test "Data Persistence" scenario in frontend/tests/integration/data-persistence.test.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Database Layer (4 tasks)
- [ ] T018 [P] Todo entity definition with TypeORM in backend/src/entities/todo.entity.ts
- [ ] T019 [P] Database migration for todos table in backend/src/migrations/001-create-todos.ts
- [ ] T020 [P] Todo repository with CRUD methods in backend/src/repositories/todo.repository.ts
- [ ] T021 Database connection and configuration in backend/src/config/database.config.ts

### Backend gRPC Implementation (5 tasks)
- [ ] T022 [P] Generate TypeScript types from proto file in backend/src/generated/todo.ts
- [ ] T023 [P] Todo service business logic in backend/src/services/todo.service.ts
- [ ] T024 gRPC TodoService implementation with all method handlers in backend/src/grpc/todo.controller.ts
- [ ] T025 Request validation and error handling middleware in backend/src/middleware/validation.middleware.ts
- [ ] T026 gRPC server configuration and startup in backend/src/main.ts

### Frontend Implementation (6 tasks)
- [ ] T027 [P] Generate TypeScript gRPC client from proto file in frontend/src/generated/todo.ts
- [ ] T028 [P] gRPC client wrapper service in frontend/src/services/todo-grpc.service.ts
- [ ] T029 [P] TodoItem component with toggle, edit, delete functionality in frontend/src/components/TodoItem.tsx
- [ ] T030 [P] TodoList component with state management in frontend/src/components/TodoList.tsx
- [ ] T031 [P] AddTodo form component with validation in frontend/src/components/AddTodo.tsx
- [ ] T032 Main Todo app page integrating all components in frontend/src/pages/index.tsx

## Phase 3.4: Integration (6 tasks)

- [ ] T033 Connect Todo service to database repository in backend/src/services/todo.service.ts
- [ ] T034 gRPC error handling and status code mapping in backend/src/middleware/error.middleware.ts
- [ ] T035 [P] Frontend error handling and loading states in frontend/src/hooks/useErrorHandling.ts
- [ ] T036 [P] Frontend gRPC client configuration and connection in frontend/src/config/grpc.config.ts
- [ ] T037 Environment variables setup for both frontend and backend in .env files
- [ ] T038 CORS and security configuration for gRPC-Web in backend/src/config/cors.config.ts

## Phase 3.5: Polish (5 tasks)

- [ ] T039 [P] Unit tests for Todo entity validation in backend/tests/unit/todo.entity.test.ts
- [ ] T040 [P] Unit tests for TodoItem component in frontend/tests/unit/TodoItem.test.tsx
- [ ] T041 [P] Performance tests for gRPC methods (<500ms) in backend/tests/performance/grpc-performance.test.ts
- [ ] T042 [P] Update development documentation in README.md
- [ ] T043 Run manual testing scenarios from quickstart.md and validate all user stories

## Dependencies

### Setup Dependencies
- T001 → T002, T003 (project structure before initialization)
- T004 → T008, T022, T027 (proto tooling before compilation)
- T005 → T019, T021 (database config before migrations)

### Test-First Dependencies (TDD)
- T008 → T009-T012 (proto file before contract tests)
- T009-T017 → T018-T038 (ALL tests before ANY implementation)

### Implementation Dependencies
- T018 → T020 → T023 → T033 (entity → repository → service → integration)
- T022 → T024, T028 (proto generation before gRPC implementation)
- T027 → T028 → T029-T032 (client generation before components)
- T021 → T033 (database connection before service integration)
- T025, T034 → T026 (middleware before server startup)

### Polish Dependencies
- T018-T038 → T039-T043 (implementation before polish)

## Parallel Execution Examples

### Setup Phase (can run simultaneously)
```bash
# T002-T003 together (different projects):
Task: "Initialize backend project with NestJS, gRPC, TypeORM dependencies"
Task: "Initialize frontend project with Next.js, React, gRPC-Web dependencies"

# T006-T007 together (different projects):
Task: "Configure ESLint, Prettier, TypeScript for backend"
Task: "Configure ESLint, Prettier, TypeScript for frontend"
```

### Contract Tests Phase (can run simultaneously)
```bash
# T009-T012 together (different test files):
Task: "Contract test TodoService.GetTodos() in backend/tests/contract/todo-service-get-todos.test.ts"
Task: "Contract test TodoService.CreateTodo() in backend/tests/contract/todo-service-create-todo.test.ts"
Task: "Contract test TodoService.UpdateTodo() in backend/tests/contract/todo-service-update-todo.test.ts"
Task: "Contract test TodoService.DeleteTodo() in backend/tests/contract/todo-service-delete-todo.test.ts"
```

### Integration Tests Phase (can run simultaneously)
```bash
# T013-T017 together (different test files):
Task: "Integration test Create New Todo scenario in frontend/tests/integration/create-todo.test.ts"
Task: "Integration test Mark Todo Complete scenario in frontend/tests/integration/toggle-todo.test.ts"
Task: "Integration test Edit Todo Description scenario in frontend/tests/integration/edit-todo.test.ts"
Task: "Integration test Delete Todo scenario in frontend/tests/integration/delete-todo.test.ts"
Task: "Integration test Data Persistence scenario in frontend/tests/integration/data-persistence.test.ts"
```

### Core Implementation Phase (selective parallelism)
```bash
# T018-T020 together (different backend files):
Task: "Todo entity definition with TypeORM in backend/src/entities/todo.entity.ts"
Task: "Database migration for todos table in backend/src/migrations/001-create-todos.ts"
Task: "Todo repository with CRUD methods in backend/src/repositories/todo.repository.ts"

# T022, T027 together (different projects):
Task: "Generate TypeScript types from proto file in backend/src/generated/todo.ts"
Task: "Generate TypeScript gRPC client from proto file in frontend/src/generated/todo.ts"

# T029-T031 together (different component files):
Task: "TodoItem component with toggle, edit, delete functionality"
Task: "TodoList component with state management"
Task: "AddTodo form component with validation"
```

### Polish Phase (can run simultaneously)
```bash
# T039-T042 together (different files):
Task: "Unit tests for Todo entity validation in backend/tests/unit/todo.entity.test.ts"
Task: "Unit tests for TodoItem component in frontend/tests/unit/TodoItem.test.tsx"
Task: "Performance tests for gRPC methods in backend/tests/performance/grpc-performance.test.ts"
Task: "Update development documentation in README.md"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify ALL contract and integration tests fail before implementing
- Commit after each task completion
- Run `npm run proto:generate` after T004 setup
- Run database migrations after T019
- Test gRPC connectivity with grpcurl after T026

## Task Generation Rules Applied

1. **From gRPC Contracts** (4 methods):
   - TodoService.GetTodos → T009 contract test
   - TodoService.CreateTodo → T010 contract test
   - TodoService.UpdateTodo → T011 contract test
   - TodoService.DeleteTodo → T012 contract test

2. **From Data Model** (1 entity):
   - Todo entity → T018 model creation
   - CRUD operations → T020 repository, T023 service

3. **From User Stories** (10 scenarios):
   - Create New Todo → T013 integration test
   - Mark Complete/Incomplete → T014 integration test
   - Edit Description → T015 integration test
   - Delete Todo → T016 integration test
   - Data Persistence → T017 integration test
   - Error scenarios → T025, T034 error handling

4. **Ordering Applied**:
   - Setup (T001-T008) → Tests (T009-T017) → Models (T018-T021) → Services (T022-T026) → Frontend (T027-T032) → Integration (T033-T038) → Polish (T039-T043)

## Validation Checklist ✓

- [x] All gRPC methods have corresponding contract tests (T009-T012)
- [x] Todo entity has model creation task (T018)
- [x] All tests come before implementation (T009-T017 before T018-T038)
- [x] Parallel tasks are truly independent (verified file paths)
- [x] Each task specifies exact file path
- [x] No [P] task modifies same file as another [P] task
- [x] TDD order enforced: failing tests mandatory before implementation
- [x] Database setup before backend implementation
- [x] Proto compilation before gRPC development
- [x] Frontend components after gRPC client is ready

**Total Tasks**: 43
**Estimated Completion**: 3-5 days for experienced developer
**Critical Path**: T001 → T008 → T009-T017 (tests) → T018-T038 (implementation) → T039-T043 (polish)