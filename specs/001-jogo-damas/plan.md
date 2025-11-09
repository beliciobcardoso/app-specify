# Implementation Plan: Jogo de Damas Completo

**Branch**: `001-jogo-damas` | **Date**: 2025-11-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-jogo-damas/spec.md`

**Note**: This plan implements the Brazilian Checkers game with Clean Architecture, following the App-Specify Constitution v1.0.0.

## Summary

Implementar um jogo de Damas completo seguindo as regras brasileiras (captura obrigatória, Lei da Maioria, capturas bidirecionais, promoção a Dama) com três modos de jogo: local, online e contra Bot. O sistema usa Clean Architecture com lógica de negócio totalmente desacoplada em TypeScript puro (`core/domain` e `core/application`), persistência via Prisma + PostgreSQL com Repository Pattern, autenticação Better-Auth para salvar/carregar partidas, comunicação em tempo real via WebSocket para modo online com sistema de salas baseado em códigos únicos, e UI responsiva em Next.js (App Router) com Server/Client Components. Bot implementado com algoritmo Minimax (Medium/Hard) e jogadas aleatórias (Easy). Todas as 32 requisições funcionais da especificação clarificada serão atendidas, incluindo modo espectador, reconexão progressiva (30s + 2min timeout), logging estruturado com auditoria completa, e retenção indefinida de partidas finalizadas com controle do usuário.

## Technical Context

**Language/Version**: TypeScript 5+ (strict mode enabled)
**Framework**: Next.js 16+ (App Router)
**Primary Dependencies**: 
- React 19+ (Server Components padrão, Client Components para interatividade)
- Better-Auth (latest) com Prisma adapter
- Prisma (latest) com PostgreSQL
- Zod (latest) para validação server-side
- Socket.io ou ws para WebSocket real-time
- Tailwind CSS para estilização

**Storage**: PostgreSQL (via Docker container, connection string em `.env`)
**ORM**: Prisma ORM (encapsulado via Repository Pattern em `infrastructure/database/repositories/`)
**Authentication**: Better-Auth (headless framework, configuração em `infrastructure/auth/`)
**Validation**: Zod schemas em Server Actions e Route Handlers
**Testing**: Jest (unit tests), React Testing Library (component tests)
**Target Platform**: Web (SSR + Client interactivity)
**Architecture**: Clean Architecture (core/domain + core/application + infrastructure + app)
**Project Type**: Next.js web application (App Router)

**Performance Goals**:
- Game state sync <1 segundo para partidas online (95% dos casos com latency <200ms)
- Bot (IA) responde em <3 segundos
- Room cleanup automático após 5 minutos de inatividade
- Reconexão automática em 30s após desconexão

**Constraints**:
- TypeScript strict mode (sem uso de `any`)
- Lógica de jogo (regras de movimento, captura, Lei da Maioria) 100% framework-agnostic
- Todas as validações de movimento no servidor (segurança)
- 80% test coverage mínimo para lógica de negócio (core/)
- Logging estruturado com auditoria completa (INFO/WARN/ERROR)

**Scale/Scope**:
- Salas online ilimitadas (garbage collection automático)
- Espectadores ilimitados por sala (2 jogadores ativos max)
- 50 partidas salvas (em andamento) por usuário
- Partidas finalizadas sem limite (retenção indefinida até usuário deletar)
- Suporte a 3 níveis de dificuldade de Bot (Easy, Medium, Hard)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Clean Architecture Compliance**:
- [x] Core business logic is framework-agnostic (no Next.js/Prisma imports in `core/`)
  - Game engine (movement rules, capture logic, Lei da Maioria, win conditions) em TypeScript puro
  - Domain entities (Board, Piece, Player, Game, Move) sem dependências externas
- [x] Dependencies flow inward (UI → Application → Domain)
  - `app/` chama Server Actions → Use Cases em `core/application` → Domain Services em `core/domain`
- [x] Repository interfaces defined in `core/application/ports/`
  - `IGameRepository`, `IUserRepository`, `IRoomRepository` definidos em ports/
- [x] Prisma implementations in `infrastructure/database/repositories/`
  - `PrismaGameRepository`, `PrismaUserRepository`, `PrismaRoomRepository` implementam interfaces

**Type Safety**:
- [x] TypeScript strict mode enabled (`tsconfig.json`)
- [x] No usage of `any` (all entities, DTOs, use cases have explicit types)
- [x] All public APIs have JSDoc documentation
  - Use cases, domain services e repository interfaces documentados

**Security**:
- [x] All data validation occurs on server (Zod schemas)
  - Schemas para validateMove, createRoom, joinRoom em `infrastructure/validation/schemas/`
- [x] Better-Auth authorization applied in Server Components/Route Handlers
  - Verificação de autenticação antes de salvar/carregar partidas
  - Autorização para criar/entrar em salas online
- [x] No credentials hardcoded (`.env` only)
  - `DATABASE_URL`, `BETTER_AUTH_SECRET`, `WEBSOCKET_PORT` em `.env`

**Testing**:
- [x] Unit tests for core business logic planned
  - Tests para GameEngine, MoveValidator, LeiDaMaioriaService, WinConditionChecker
- [x] Integration tests for Server Actions/Route Handlers planned
  - Tests para validateMoveAction, createRoomAction, saveGameAction
- [x] 80% coverage target for business logic
  - Foco em `core/domain` e `core/application` (regras críticas)

**Documentation-First**:
- [x] Official Next.js/Prisma/Better-Auth docs consulted
  - Next.js App Router patterns, Prisma schema design, Better-Auth Prisma adapter
- [x] MCP servers or LLMs.txt files referenced
  - Better-Auth LLMs.txt para configuração headless
- [x] `Docs/` folder checked for project-specific guidance
  - `Docs/Better-Auth-llms.txt` consultado

**Game-Specific Compliance**:
- [x] Regras brasileiras implementadas corretamente
  - Captura obrigatória (FR-003), Lei da Maioria (FR-004), capturas bidirecionais (FR-005)
- [x] Três modos de jogo (local, online, bot) com arquitetura unificada
- [x] WebSocket para comunicação real-time (online + spectators)
- [x] Logging estruturado com auditoria completa (FR-025, FR-026)

## Project Structure

### Documentation (this feature)

```text
specs/001-jogo-damas/
├── spec.md              # Feature specification (32 FRs, 4 user stories, 5 clarifications)
├── plan.md              # This file (implementation plan)
├── data-model.md        # Prisma schema design (to be created)
├── contracts/           # API contracts (to be created)
│   ├── server-actions.md    # Server Actions signatures
│   ├── websocket-events.md  # WebSocket event schemas
│   └── use-cases.md         # Use case interfaces
├── quickstart.md        # Developer setup guide (to be created)
└── tasks.md             # Task breakdown (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/                          # Next.js App Router (Presentation Layer)
│   ├── (auth)/                  # Authenticated routes (Better-Auth protected)
│   │   ├── dashboard/           # User dashboard (partidas salvas, histórico)
│   │   ├── game/                # Game UI routes
│   │   │   ├── local/          # Local game mode
│   │   │   ├── online/         # Online game mode (create/join room)
│   │   │   └── bot/            # Bot game mode
│   │   └── profile/            # User profile & stats
│   ├── (public)/               # Public routes
│   │   ├── login/
│   │   └── register/
│   ├── api/                    # Route Handlers
│   │   ├── auth/              # Better-Auth endpoints
│   │   └── health/            # Health check
│   ├── _components/           # React Components
│   │   ├── game/             # Game-specific components
│   │   │   ├── Board.tsx           # Tabuleiro (Client Component)
│   │   │   ├── Piece.tsx           # Peça visual
│   │   │   ├── MoveIndicator.tsx   # Feedback visual de jogadas válidas
│   │   │   ├── GameStatus.tsx      # Turno atual, status de conexão
│   │   │   ├── RoomControls.tsx    # Criar/entrar sala, código compartilhável
│   │   │   └── SpectatorBadge.tsx  # Indicador de modo espectador
│   │   ├── shared/           # Componentes compartilhados
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Spinner.tsx
│   │   └── layout/           # Layout components
│   │       ├── Header.tsx
│   │       └── Footer.tsx
│   ├── _actions/             # Server Actions (Next.js 13+)
│   │   ├── game-actions.ts       # validateMove, saveGame, loadGame
│   │   ├── room-actions.ts       # createRoom, joinRoom, leaveRoom
│   │   └── user-actions.ts       # getUserStats, deleteGameHistory
│   ├── layout.tsx
│   ├── page.tsx              # Landing page
│   └── globals.css           # Tailwind CSS
│
├── core/                         # Core Business Logic (Framework-agnostic)
│   ├── domain/                   # Entities, Value Objects, Domain Services
│   │   ├── entities/
│   │   │   ├── Board.ts              # Tabuleiro 8x8, casas válidas
│   │   │   ├── Piece.ts              # Peça (cor, tipo, posição)
│   │   │   ├── Player.ts             # Jogador (tipo, cor, stats)
│   │   │   ├── Game.ts               # Partida (modo, estado, resultado)
│   │   │   ├── Move.ts               # Movimento (origem, destino, capturas)
│   │   │   └── Room.ts               # Sala online (código, jogadores, espectadores)
│   │   ├── value-objects/
│   │   │   ├── Position.ts           # Posição (row, col) com validação
│   │   │   ├── PieceColor.ts         # Enum: LIGHT | DARK
│   │   │   ├── PieceType.ts          # Enum: COMMON | QUEEN
│   │   │   ├── GameMode.ts           # Enum: LOCAL | ONLINE | BOT
│   │   │   ├── GameStatus.ts         # Enum: IN_PROGRESS | FINISHED
│   │   │   └── PlayerType.ts         # Enum: HUMAN_LOCAL | HUMAN_ONLINE | BOT
│   │   ├── services/
│   │   │   ├── GameEngine.ts         # Motor do jogo (orquestra regras)
│   │   │   ├── MoveValidator.ts      # Valida movimentos (diagonal, captura)
│   │   │   ├── CaptureDetector.ts    # Detecta capturas obrigatórias
│   │   │   ├── LeiDaMaioriaService.ts # Aplica Lei da Maioria
│   │   │   ├── PromotionService.ts   # Promoção a Dama
│   │   │   ├── WinConditionChecker.ts # Detecta vitória/derrota/empate
│   │   │   └── RoomManager.ts        # Gestão de salas (códigos únicos, cleanup)
│   │   └── errors/
│   │       ├── InvalidMoveError.ts
│   │       ├── MandatoryCaptureError.ts
│   │       └── RoomFullError.ts
│   │
│   └── application/              # Use Cases, DTOs, Repository Interfaces
│       ├── use-cases/
│       │   ├── local/
│       │   │   ├── ExecuteMoveUseCase.ts       # Executar jogada local
│       │   │   └── StartLocalGameUseCase.ts    # Iniciar jogo local
│       │   ├── online/
│       │   │   ├── CreateRoomUseCase.ts        # Criar sala com código
│       │   │   ├── JoinRoomUseCase.ts          # Entrar sala via código
│       │   │   ├── ExecuteOnlineMoveUseCase.ts # Jogada online + WebSocket
│       │   │   └── HandleReconnectionUseCase.ts # Reconexão 30s + 2min timeout
│       │   ├── bot/
│       │   │   ├── ExecuteBotMoveUseCase.ts    # Bot executa jogada
│       │   │   └── StartBotGameUseCase.ts      # Iniciar jogo vs Bot
│       │   ├── persistence/
│       │   │   ├── SaveGameUseCase.ts          # Salvar partida (max 50)
│       │   │   ├── LoadGameUseCase.ts          # Carregar partida
│       │   │   └── DeleteGameHistoryUseCase.ts # Deletar histórico
│       │   └── stats/
│       │       └── GetUserStatsUseCase.ts      # Estatísticas de usuário
│       ├── dtos/
│       │   ├── ExecuteMoveDTO.ts       # Input: pieceId, targetPosition
│       │   ├── GameStateDTO.ts         # Output: board, currentPlayer, status
│       │   ├── CreateRoomDTO.ts        # Input: userId, Output: roomCode
│       │   └── RoomStatusDTO.ts        # Output: players, spectators, gameState
│       └── ports/                  # Interfaces (Repositories, Services)
│           ├── IGameRepository.ts      # CRUD partidas
│           ├── IUserRepository.ts      # CRUD usuários
│           ├── IRoomRepository.ts      # CRUD salas online
│           ├── IMoveRepository.ts      # Histórico de movimentos
│           ├── IBotService.ts          # Interface para IA
│           └── IWebSocketService.ts    # Interface para comunicação real-time
│
├── infrastructure/              # External Concerns (Framework-specific)
│   ├── auth/                   # Better-Auth configuration
│   │   ├── config.ts              # Better-Auth setup (Prisma adapter)
│   │   └── middleware.ts          # Auth middleware para Server Components
│   ├── database/               # Prisma client, Repository implementations
│   │   ├── prisma/
│   │   │   ├── schema.prisma         # User, Game, Room, Move, GameStats
│   │   │   ├── migrations/           # Prisma migrations
│   │   │   └── seed.ts               # Seed data (opcional)
│   │   └── repositories/
│   │       ├── PrismaGameRepository.ts    # Implementa IGameRepository
│   │       ├── PrismaUserRepository.ts    # Implementa IUserRepository
│   │       ├── PrismaRoomRepository.ts    # Implementa IRoomRepository
│   │       └── PrismaMoveRepository.ts    # Implementa IMoveRepository
│   ├── bot/                    # Bot (IA) implementation
│   │   ├── MinimaxBotService.ts      # Minimax com alpha-beta pruning (Medium/Hard)
│   │   └── RandomBotService.ts       # Jogadas aleatórias (Easy)
│   ├── websocket/              # WebSocket server (Socket.io ou ws)
│   │   ├── WebSocketServer.ts        # Servidor WebSocket
│   │   ├── events/
│   │   │   ├── gameStateUpdate.ts    # Evento: atualização de estado
│   │   │   ├── playerDisconnected.ts # Evento: desconexão de jogador
│   │   │   └── reconnectionStatus.ts # Evento: status de reconexão
│   │   └── handlers/
│   │       ├── ConnectionHandler.ts  # Gerencia conexões
│   │       └── RoomHandler.ts        # Gerencia salas (join/leave)
│   ├── validation/             # Zod schemas
│   │   └── schemas/
│   │       ├── move-schema.ts        # Schema para validar movimentos
│   │       ├── room-schema.ts        # Schema para criar/entrar salas
│   │       └── game-schema.ts        # Schema para salvar/carregar partidas
│   ├── logging/                # Structured logging (auditoria completa)
│   │   ├── logger.ts                 # Winston ou Pino logger
│   │   └── log-events.ts             # Eventos auditáveis (FR-025)
│   └── config/                 # Environment, settings
│       └── env.ts                    # Type-safe env vars (DATABASE_URL, etc.)
│
└── shared/                     # Shared utilities
    ├── types/
    │   ├── api-responses.ts          # Tipos de resposta de API
    │   └── websocket-messages.ts     # Tipos de mensagens WebSocket
    └── utils/
        ├── position-utils.ts         # Utilitários para posições do tabuleiro
        └── room-code-generator.ts    # Gera códigos únicos de 6 caracteres

tests/
├── unit/                       # Core business logic tests
│   ├── domain/
│   │   ├── GameEngine.test.ts
│   │   ├── MoveValidator.test.ts
│   │   ├── LeiDaMaioriaService.test.ts
│   │   └── WinConditionChecker.test.ts
│   └── application/
│       ├── ExecuteMoveUseCase.test.ts
│       └── CreateRoomUseCase.test.ts
├── integration/                # Server Actions, Route Handlers, Repository tests
│   ├── game-actions.test.ts
│   ├── room-actions.test.ts
│   └── PrismaGameRepository.test.ts
└── e2e/                        # End-to-end tests (opcional)
    └── complete-game.test.ts

prisma/
└── schema.prisma              # Symlink to src/infrastructure/database/prisma/schema.prisma
```

**Structure Decision**: Next.js App Router com Clean Architecture. A estrutura foi escolhida para:

1. **Separação Total de Responsabilidades**: Lógica de jogo (`core/`) 100% desacoplada de Next.js/Prisma/Better-Auth
2. **Testabilidade Máxima**: Game engine pode ser testado unitariamente sem dependências externas
3. **Três Modos Unificados**: Arquitetura suporta local/online/bot com mesmo core domain
4. **Real-time Ready**: WebSocket em `infrastructure/` comunica com use cases via interfaces
5. **Repository Pattern**: Prisma encapsulado; fácil trocar ORM ou adicionar cache layer
6. **Escalabilidade**: Room management e garbage collection centralizados em `RoomManager`
7. **Conformidade Constitucional**: Fluxo de dependência UI → Application → Domain respeitado

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | All constitution checks passed | No violations detected |

**Justification Notes**:

- **Clean Architecture**: Necessária para isolar lógica de jogo (regras complexas de captura, Lei da Maioria, win conditions) de frameworks. Permite testar game engine sem Next.js/Prisma.
- **Repository Pattern**: Justificado pela necessidade de abstrair Prisma para facilitar testes unitários de use cases e possibilitar cache layer futuro para salas online ativas.
- **WebSocket Infrastructure**: Requerido por FR-012, FR-021-024 (partidas online em tempo real). Alternativa (polling) violaria SC-006 (<1s sync).
- **Three Game Modes**: Arquitetura unificada com use cases específicos (local/online/bot) compartilhando mesmo domain core é mais simples que 3 aplicações separadas.

Nenhuma violação constitucional identificada. Toda complexidade arquitetural é justificada pelos requisitos funcionais e não-funcionais da especificação.
