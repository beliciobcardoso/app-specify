---

description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Next.js with Clean Architecture (DEFAULT for App-Specify)**:
  - `src/app/` - Next.js App Router (Presentation Layer)
  - `src/core/domain/` - Entities, Value Objects, Domain Services
  - `src/core/application/` - Use Cases, DTOs, Repository Interfaces (Ports)
  - `src/infrastructure/` - Prisma, Better-Auth, Repository Implementations
  - `tests/unit/` - Core business logic tests
  - `tests/integration/` - Server Actions, Route Handlers, Repository tests
- **Monorepo**: Adjust paths with `apps/[app-name]/src/` prefix
- **Mobile + API**: `apps/api/src/` for Next.js, `mobile/ios/` or `mobile/android/`

Paths shown below assume Next.js Clean Architecture - adjust based on plan.md structure

<!-- 
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.
  
  The /speckit.tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/
  
  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment
  
  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project structure per implementation plan
- [ ] T002 Initialize [language] project with [framework] dependencies
- [ ] T003 [P] Configure linting and formatting tools

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

Examples of foundational tasks (adjust based on your project):

- [ ] T004 Setup Prisma schema and migrations in `src/infrastructure/database/prisma/`
- [ ] T005 [P] Configure Better-Auth in `src/infrastructure/auth/` (garantir `advanced.database.generateId = false`)
- [ ] T006 [P] Setup Next.js App Router structure in `src/app/`
- [ ] T007 Define core domain entities in `src/core/domain/entities/`
- [ ] T008 Define repository interfaces (ports) in `src/core/application/ports/`
- [ ] T009 Implement repository pattern in `src/infrastructure/database/repositories/`
- [ ] T010 Configure Zod validation schemas in `src/infrastructure/validation/`
- [ ] T011 Setup error handling infrastructure
- [ ] T012 Configure environment management (`.env` + config module)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 1 (OPTIONAL - only if tests requested) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T013 [P] [US1] Unit test for [Use Case] in tests/unit/core/application/test_[use-case].ts
- [ ] T014 [P] [US1] Integration test for [Server Action] in tests/integration/app/test_[action].ts

### Implementation for User Story 1

- [ ] T015 [P] [US1] Create [Entity] in src/core/domain/entities/[entity].ts
- [ ] T016 [P] [US1] Create [Value Object] in src/core/domain/value-objects/[vo].ts
- [ ] T017 [US1] Implement [Use Case] in src/core/application/use-cases/[use-case].ts (depends on T015, T016)
- [ ] T018 [US1] Create Zod schema for [Input/Output] in src/infrastructure/validation/[schema].ts
- [ ] T019 [US1] Implement Server Action in src/app/[route]/_actions/[action].ts
- [ ] T020 [US1] Create Server Component in src/app/[route]/_components/[component].tsx
- [ ] T021 [US1] Add authorization checks using Better-Auth
- [ ] T022 [US1] Add error handling and validation

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 2 (OPTIONAL - only if tests requested) ⚠️

- [ ] T023 [P] [US2] Unit test for [Use Case] in tests/unit/core/application/test_[use-case].ts
- [ ] T024 [P] [US2] Integration test for [Server Action] in tests/integration/app/test_[action].ts

### Implementation for User Story 2

- [ ] T025 [P] [US2] Create [Entity] in src/core/domain/entities/[entity].ts
- [ ] T026 [US2] Implement [Use Case] in src/core/application/use-cases/[use-case].ts
- [ ] T027 [US2] Implement Server Action in src/app/[route]/_actions/[action].ts
- [ ] T028 [US2] Create Component in src/app/[route]/_components/[component].tsx
- [ ] T029 [US2] Integrate with User Story 1 components (if needed)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 3 (OPTIONAL - only if tests requested) ⚠️

- [ ] T030 [P] [US3] Unit test for [Use Case] in tests/unit/core/application/test_[use-case].ts
- [ ] T031 [P] [US3] Integration test for [Server Action] in tests/integration/app/test_[action].ts

### Implementation for User Story 3

- [ ] T032 [P] [US3] Create [Entity] in src/core/domain/entities/[entity].ts
- [ ] T033 [US3] Implement [Use Case] in src/core/application/use-cases/[use-case].ts
- [ ] T034 [US3] Implement Server Action in src/app/[route]/_actions/[action].ts
- [ ] T035 [US3] Create Component in src/app/[route]/_components/[component].tsx

**Checkpoint**: All user stories should now be independently functional

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] TXXX [P] Documentation updates in docs/
- [ ] TXXX Code cleanup and refactoring
- [ ] TXXX Performance optimization across all stories
- [ ] TXXX [P] Additional unit tests (if requested) in tests/unit/
- [ ] TXXX Security hardening
- [ ] TXXX Run quickstart.md validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (if tests requested):
Task: "Unit test for [Use Case] in tests/unit/core/application/test_[use-case].ts"
Task: "Integration test for [Server Action] in tests/integration/app/test_[action].ts"

# Launch all domain models for User Story 1 together:
Task: "Create [Entity] in src/core/domain/entities/[entity].ts"
Task: "Create [Value Object] in src/core/domain/value-objects/[vo].ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
