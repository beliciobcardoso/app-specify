# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. For App-Specify, the following defaults apply unless overridden.
-->

**Language/Version**: TypeScript 5+ (strict mode enabled)
**Framework**: Next.js 16+ (App Router)
**Primary Dependencies**: React 19+, Better-Auth (latest), Prisma (latest), Zod (latest)
**Storage**: PostgreSQL (via Docker container, connection via .env)
**ORM**: Prisma ORM (encapsulated via Repository Pattern)
**Authentication**: Better-Auth (headless framework with Prisma adapter)
**Validation**: Zod (server-side schemas)
**Testing**: Jest, React Testing Library
**Target Platform**: Web (Server-side rendering + Client components)
**Architecture**: Clean Architecture (core/domain + core/application + infrastructure + app)
**Project Type**: Next.js web application (App Router)
**Performance Goals**: [domain-specific, e.g., <200ms API response, <3s page load or NEEDS CLARIFICATION]
**Constraints**: [domain-specific, e.g., TypeScript strict mode, no `any` types, 80% test coverage or NEEDS CLARIFICATION]
**Scale/Scope**: [domain-specific, e.g., 1k users, 20 routes, 50 components or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Clean Architecture Compliance**:
- [ ] Core business logic is framework-agnostic (no Next.js/Prisma imports in `core/`)
- [ ] Dependencies flow inward (UI → Application → Domain)
- [ ] Repository interfaces defined in `core/application/ports/`
- [ ] Prisma implementations in `infrastructure/database/repositories/`

**Type Safety**:
- [ ] TypeScript strict mode enabled
- [ ] No usage of `any` (or justified with JSDoc comment)
- [ ] All public APIs have JSDoc documentation

**Security**:
- [ ] All data validation occurs on server (Zod schemas)
- [ ] Better-Auth authorization applied in Server Components/Route Handlers
- [ ] No credentials hardcoded (`.env` only)

**Testing**:
- [ ] Unit tests for core business logic planned
- [ ] Integration tests for Server Actions/Route Handlers planned
- [ ] 80% coverage target for business logic

**Documentation-First**:
- [ ] Official Next.js/Prisma/Better-Auth docs consulted
- [ ] MCP servers or LLMs.txt files referenced
- [ ] `Docs/` folder checked for project-specific guidance

[Additional gates determined based on feature requirements]

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Next.js App with Clean Architecture (DEFAULT for App-Specify)
src/
├── app/                      # Next.js App Router (Presentation Layer)
│   ├── (auth)/              # Route groups
│   ├── api/                 # Route Handlers
│   └── _components/         # Server/Client Components
├── core/                    # Core Business Logic (Framework-agnostic)
│   ├── domain/              # Entities, Value Objects, Domain Services
│   │   ├── entities/
│   │   ├── value-objects/
│   │   └── errors/
│   └── application/         # Use Cases, DTOs, Repository Interfaces
│       ├── use-cases/
│       ├── dtos/
│       └── ports/           # Interfaces (Repositories, Services)
├── infrastructure/          # External Concerns (Framework-specific)
│   ├── auth/               # Better-Auth configuration
│   ├── database/           # Prisma client, Repository implementations
│   │   ├── prisma/         # Schema, migrations
│   │   └── repositories/   # Repository Pattern implementations
│   ├── validation/         # Zod schemas
│   └── config/             # Environment, settings
└── shared/                 # Shared utilities (if needed)
    ├── types/
    └── utils/

tests/
├── unit/                   # Core business logic tests
├── integration/            # Server Actions, Route Handlers, Repository tests
└── e2e/                    # End-to-end tests (optional)

# [REMOVE IF UNUSED] Option 2: Monorepo with multiple Next.js apps
apps/
├── web/                    # Main web application (structure as Option 1)
└── admin/                  # Admin dashboard (structure as Option 1)

packages/
├── shared-core/            # Shared business logic
├── ui/                     # Shared UI components
└── config/                 # Shared configuration

# [REMOVE IF UNUSED] Option 3: Mobile + Next.js API
apps/
└── api/                    # Next.js API (structure as Option 1, focus on api routes)

mobile/
├── ios/                    # iOS app
└── android/                # Android app
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
