# Implementation Plan: Simple Web TODO App

**Branch**: `001-web-todo` | **Date**: 2025-09-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-web-todo/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
4. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
5. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, or `GEMINI.md` for Gemini CLI).
6. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
7. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
8. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Simple web-based TODO application allowing users to create, read, update, and delete personal tasks. Built as a fullstack TypeScript application with React/Next.js frontend and NestJS gRPC backend, using PostgreSQL for data persistence and Protocol Buffers for type-safe API communication.

## Technical Context
**Language/Version**: TypeScript (latest stable)
**Primary Dependencies**: React, Next.js (frontend), NestJS + gRPC (backend), PostgreSQL (database), Protocol Buffers
**Storage**: PostgreSQL for persistent data storage
**Testing**: Jest + React Testing Library (frontend), Jest + Supertest (backend)
**Target Platform**: Web browsers (modern JavaScript support required)
**Project Type**: web - determines source structure (frontend + backend)
**Performance Goals**: Standard web app performance (<2s initial load, <500ms API responses)
**Constraints**: Simple interface, minimal learning curve, web-accessible only
**Scale/Scope**: Single-user focused, ~10-50 TODO items typical usage

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Simplicity**:
- Projects: 2 (frontend, backend) ✓ (within max 3)
- Using framework directly? ✓ (Next.js/NestJS without wrappers)
- Single data model? ✓ (Todo entity only, DTOs for API validation)
- Avoiding patterns? ✓ (Direct framework usage, no unnecessary abstractions)

**Architecture**:
- EVERY feature as library? N/A (web app, not library project)
- Libraries listed: Todo management (CRUD operations)
- CLI per library: N/A (web application)
- Library docs: API documentation via OpenAPI ✓

**Testing (NON-NEGOTIABLE)**:
- RED-GREEN-Refactor cycle enforced? ✓ (contract tests will fail first)
- Git commits show tests before implementation? ✓ (planned in tasks)
- Order: Contract→Integration→E2E→Unit strictly followed? ✓
- Real dependencies used? ✓ (actual PostgreSQL database)
- Integration tests for: API contracts, database operations ✓
- FORBIDDEN: Implementation before test ✓ (acknowledged)

**Observability**:
- Structured logging included? ✓ (NestJS built-in logging)
- Frontend logs → backend? ✓ (error reporting planned)
- Error context sufficient? ✓ (detailed API error responses)

**Versioning**:
- Version number assigned? ✓ (1.0.0 for initial release)
- BUILD increments on every change? ✓ (planned in CI)
- Breaking changes handled? ✓ (API versioning strategy)

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure]
```

**Structure Decision**: Option 2 - Web application (frontend + backend detected in Technical Context)

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `/scripts/bash/update-agent-context.sh claude` for your AI assistant
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each gRPC method → contract test task [P]
- Protocol buffer definitions → proto compilation and type generation [P]
- Todo entity → database model creation task [P]
- Each user story from quickstart → integration test task
- Frontend components with gRPC client → component test tasks [P]
- Implementation tasks to make all tests pass

**Specific Task Categories**:
1. **Infrastructure Setup** (6-8 tasks):
   - Backend project initialization with NestJS + gRPC
   - Frontend project initialization with Next.js + gRPC-Web
   - Protocol buffer setup and compilation tooling
   - PostgreSQL database setup and connection
   - Environment configuration
   - Basic project structure creation

2. **gRPC Contract Tests** (5 tasks) [P]:
   - TodoService.GetTodos() contract test
   - TodoService.CreateTodo() contract test
   - TodoService.UpdateTodo() contract test
   - TodoService.DeleteTodo() contract test
   - Proto file compilation and type generation validation

3. **Database Layer** (3-4 tasks):
   - Todo entity definition with TypeORM/Prisma
   - Database migration creation
   - Database connection and configuration
   - Basic CRUD repository methods

4. **Backend Implementation** (7-9 tasks):
   - gRPC Todo service implementation (business logic)
   - gRPC method handlers implementation
   - Request/response validation with proto types
   - gRPC error handling and status codes
   - gRPC server configuration and middleware
   - Proto file documentation generation

5. **Frontend Implementation** (9-11 tasks) [P]:
   - gRPC client setup and configuration
   - Todo list component with gRPC integration
   - Todo item component
   - Add todo form component
   - Edit todo functionality
   - Delete todo functionality
   - gRPC error handling and status management
   - Loading states for gRPC calls
   - Type-safe gRPC client wrapper service

6. **Integration & E2E Tests** (4-5 tasks):
   - User story integration tests from quickstart (adapted for gRPC)
   - gRPC client-server integration tests
   - End-to-end test scenarios with gRPC-Web
   - Performance validation tests for gRPC calls
   - Proto contract validation and compatibility tests

**Ordering Strategy**:
- TDD order: Proto definition → Contract tests → Integration tests → Implementation
- Dependency order: Proto compilation → Database → Backend gRPC services → Frontend gRPC client
- Infrastructure and proto setup first, then parallel development where possible
- Mark [P] for parallel execution (independent components)

**Estimated Output**: 33-42 numbered, ordered tasks in tasks.md

**Dependencies Identified**:
- Proto file compilation must complete before any gRPC development
- Database setup must complete before backend implementation
- Backend gRPC service must be working before frontend client integration
- gRPC contract tests must exist and fail before implementation
- Frontend components can be developed in parallel once gRPC client is configured

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (none required)

**Artifacts Generated**:
- [x] research.md - Technology decisions and clarifications resolved
- [x] data-model.md - Database schema and TypeScript types
- [x] contracts/todo-api.yaml - OpenAPI specification for REST API
- [x] quickstart.md - User acceptance testing scenarios and API validation
- [x] CLAUDE.md - Agent context file with development guidelines

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*