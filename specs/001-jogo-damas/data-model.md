# Data Model: Jogo de Damas Completo

**Feature**: Jogo de Damas | **Date**: 2025-11-08 | **Plan**: [plan.md](./plan.md)

Este documento especifica o schema Prisma para persistência do Jogo de Damas, alinhado aos 32 requisitos funcionais da especificação.

---

## Prisma Schema

```prisma
// src/infrastructure/database/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================================
// BETTER-AUTH MODELS (Better-Auth Prisma Adapter)
// ============================================================================

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  name          String?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Better-Auth relations
  accounts      Account[]
  sessions      Session[]
  
  // Game-specific relations
  gamesAsPlayer1  Game[]   @relation("Player1Games")
  gamesAsPlayer2  Game[]   @relation("Player2Games")
  savedGames      Game[]   @relation("SavedGames")
  stats           GameStats?
  roomsCreated    Room[]   @relation("RoomCreator")
  roomMemberships RoomMember[]

  @@map("users")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}

// ============================================================================
// GAME MODELS
// ============================================================================

model Game {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Game mode (FR-011, FR-012, FR-013)
  mode      GameMode @default(LOCAL) // LOCAL | ONLINE | BOT

  // Game status (FR-008, FR-009, FR-010)
  status    GameStatus @default(IN_PROGRESS) // IN_PROGRESS | FINISHED
  result    GameResult? // PLAYER1_WIN | PLAYER2_WIN | DRAW | FORFEIT

  // Board state (FR-001) - JSON serialized
  // Format: { pieces: [{ id, color, type, position }], currentTurn: "LIGHT"|"DARK" }
  boardState Json

  // Turn tracking
  currentTurn PieceColor @default(LIGHT) // LIGHT | DARK

  // Players (FR-011, FR-012, FR-013)
  player1Id   String?
  player1     User?   @relation("Player1Games", fields: [player1Id], references: [id], onDelete: SetNull)
  player1Type PlayerType @default(HUMAN_LOCAL) // HUMAN_LOCAL | HUMAN_ONLINE | BOT

  player2Id   String?
  player2     User?   @relation("Player2Games", fields: [player2Id], references: [id], onDelete: SetNull)
  player2Type PlayerType @default(HUMAN_LOCAL) // HUMAN_LOCAL | HUMAN_ONLINE | BOT

  // Bot difficulty (FR-013)
  botDifficulty BotDifficulty? // EASY | MEDIUM | HARD

  // Save/Load feature (FR-014, FR-015)
  savedById String?
  savedBy   User?   @relation("SavedGames", fields: [savedById], references: [id], onDelete: SetNull)
  isSaved   Boolean @default(false)

  // Online game room (FR-012, FR-021-024)
  roomId String? @unique
  room   Room?   @relation(fields: [roomId], references: [id], onDelete: SetNull)

  // Move history (FR-018)
  moves Move[]

  // Metadata
  duration Int? // Duration in seconds (for SC-010, stats)

  @@index([player1Id])
  @@index([player2Id])
  @@index([savedById])
  @@index([status])
  @@index([mode])
  @@map("games")
}

model Move {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())

  // Move details
  gameId       String
  game         Game   @relation(fields: [gameId], references: [id], onDelete: Cascade)
  
  moveNumber   Int    // Sequential move number (1, 2, 3...)
  pieceColor   PieceColor // LIGHT | DARK
  
  // Position data
  fromPosition Json   // { row: number, col: number }
  toPosition   Json   // { row: number, col: number }
  
  // Capture data (FR-003, FR-004, FR-005)
  capturedPieces Json? // [{ row: number, col: number }] - Lista de peças capturadas
  
  // Promotion (FR-006)
  wasPromoted Boolean @default(false)
  
  // Metadata for logging/audit (FR-025, FR-026)
  executedAt DateTime @default(now())
  executionTime Int? // Time to execute move in ms

  @@index([gameId])
  @@map("moves")
}

model Room {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Room code (FR-021, FR-022) - 6 caracteres alfanuméricos únicos
  code      String   @unique @db.VarChar(6)

  // Room status
  status    RoomStatus @default(WAITING) // WAITING | PLAYING | FINISHED

  // Creator
  createdById String
  createdBy   User   @relation("RoomCreator", fields: [createdById], references: [id], onDelete: Cascade)

  // Game association (FR-012)
  game      Game?

  // Room members (players + spectators) (FR-023, FR-024)
  members   RoomMember[]

  // Cleanup tracking (FR-032)
  lastActivityAt DateTime @default(now())

  @@index([code])
  @@index([status])
  @@index([lastActivityAt])
  @@map("rooms")
}

model RoomMember {
  id        String   @id @default(cuid())
  joinedAt  DateTime @default(now())

  // Room and User
  roomId    String
  room      Room     @relation(fields: [roomId], references: [id], onDelete: Cascade)
  
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Member role (FR-023, FR-024)
  role      RoomRole @default(SPECTATOR) // PLAYER | SPECTATOR

  // Connection status (FR-027, FR-028)
  connectionStatus ConnectionStatus @default(CONNECTED) // CONNECTED | DISCONNECTED | RECONNECTING

  // Reconnection tracking (FR-027)
  disconnectedAt DateTime?
  reconnectionDeadline DateTime?

  @@unique([roomId, userId])
  @@index([roomId])
  @@index([userId])
  @@map("room_members")
}

model GameStats {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Overall statistics
  totalGames     Int @default(0)
  wins           Int @default(0)
  losses         Int @default(0)
  draws          Int @default(0)
  forfeits       Int @default(0)

  // Mode-specific stats
  localGames     Int @default(0)
  onlineGames    Int @default(0)
  botGames       Int @default(0)

  // Bot difficulty wins
  botEasyWins    Int @default(0)
  botMediumWins  Int @default(0)
  botHardWins    Int @default(0)

  // Advanced metrics
  totalMovesPlayed    Int @default(0)
  totalCapturesMade   Int @default(0)
  queensPromoted      Int @default(0)
  averageGameDuration Float? // Average duration in seconds

  updatedAt DateTime @updatedAt

  @@map("game_stats")
}

// ============================================================================
// ENUMS
// ============================================================================

enum GameMode {
  LOCAL   // FR-011: Two players on same device
  ONLINE  // FR-012: Two players over network
  BOT     // FR-013: Player vs AI
}

enum GameStatus {
  IN_PROGRESS // Game is ongoing
  FINISHED    // Game completed (win/loss/draw/forfeit)
}

enum GameResult {
  PLAYER1_WIN // Player 1 (LIGHT) wins
  PLAYER2_WIN // Player 2 (DARK) wins
  DRAW        // FR-009: Both players stalemate with equal pieces
  FORFEIT     // FR-010: Player forfeited
}

enum PieceColor {
  LIGHT // White/Light pieces (start at bottom)
  DARK  // Black/Dark pieces (start at top)
}

enum PlayerType {
  HUMAN_LOCAL  // Local player on same device
  HUMAN_ONLINE // Remote player via network
  BOT          // AI opponent
}

enum BotDifficulty {
  EASY   // Random valid moves
  MEDIUM // Minimax depth 4
  HARD   // Minimax depth 6+ with alpha-beta pruning
}

enum RoomStatus {
  WAITING  // Room created, waiting for second player
  PLAYING  // Game in progress
  FINISHED // Game completed
}

enum RoomRole {
  PLAYER     // Active player (max 2 per room) - FR-024
  SPECTATOR  // Observer (unlimited) - FR-023
}

enum ConnectionStatus {
  CONNECTED    // User connected
  DISCONNECTED // User disconnected (30s reconnection window) - FR-027
  RECONNECTING // User reconnecting (2min inactivity timeout) - FR-027
}
```

---

## Model Relationships

### User Relations
- **1:N** with `Game` (as player1, player2, savedBy)
- **1:N** with `Room` (as creator)
- **1:N** with `RoomMember` (participations in rooms)
- **1:1** with `GameStats` (user statistics)

### Game Relations
- **1:N** with `Move` (game move history)
- **1:1** with `Room` (online game room)
- **N:1** with `User` (players and saver)

### Room Relations
- **1:1** with `Game` (active game in room)
- **1:N** with `RoomMember` (players + spectators)
- **N:1** with `User` (room creator)

### Cascade Rules
- Deleting `User` → Cascades to `Account`, `Session`, `RoomMember`, `GameStats`
- Deleting `User` → Sets `NULL` in `Game.player1Id`, `Game.player2Id`, `Game.savedById`
- Deleting `Room` → Cascades to `RoomMember`, Sets `NULL` in `Game.roomId`
- Deleting `Game` → Cascades to `Move`

---

## Key Design Decisions

1. **Board State as JSON** (FR-001, FR-002):
   - Stores full board state: pieces array with positions, types, colors
   - Allows flexible querying and reconstruction of game state
   - Alternative (64 individual rows) rejected due to complexity

2. **Move History Table** (FR-018):
   - Separate `Move` table for audit trail and replay functionality
   - Enables advanced analytics (most common captures, game patterns)

3. **Room Management** (FR-021-024, FR-032):
   - `Room` + `RoomMember` separation for flexible player/spectator roles
   - `lastActivityAt` enables garbage collection (FR-032: 5min cleanup)
   - `connectionStatus` tracks reconnection states (FR-027, FR-028)

4. **Statistics Denormalization** (GameStats):
   - Pre-aggregated stats avoid expensive real-time calculations
   - Updated via triggers or application logic after game completion

5. **Better-Auth Integration**:
   - Uses standard Better-Auth Prisma adapter models
   - `User` extended with game-specific relations

6. **Save vs Finished Games** (FR-014, FR-015, FR-029):
   - `isSaved=true` + `status=IN_PROGRESS` → Saved game (max 50 per user)
   - `status=FINISHED` → Finished game (unlimited, FK-029)
   - Application logic enforces 50-save limit via repository

---

## Indexes

Optimized for common queries:

- **Games by user**: `player1Id`, `player2Id`, `savedById`
- **Active games**: `status`
- **Game mode filtering**: `mode`
- **Room lookup**: `code` (unique), `status`
- **Garbage collection**: `lastActivityAt` (for cleanup cron job)
- **Room members**: `roomId`, `userId`

---

## Sample Queries

### Create Local Game
```typescript
const game = await prisma.game.create({
  data: {
    mode: 'LOCAL',
    boardState: initialBoardState,
    currentTurn: 'LIGHT',
    player1Type: 'HUMAN_LOCAL',
    player2Type: 'HUMAN_LOCAL',
  },
});
```

### Create Online Room
```typescript
const room = await prisma.room.create({
  data: {
    code: generateRoomCode(), // 6-char alphanumeric
    createdById: userId,
    members: {
      create: {
        userId: userId,
        role: 'PLAYER',
      },
    },
  },
});
```

### Save Game (max 50 check in repository layer)
```typescript
// Repository layer enforces limit
const savedGamesCount = await prisma.game.count({
  where: { savedById: userId, isSaved: true, status: 'IN_PROGRESS' },
});
if (savedGamesCount >= 50) throw new Error('Max 50 saved games');

await prisma.game.update({
  where: { id: gameId },
  data: { isSaved: true, savedById: userId },
});
```

### Cleanup Inactive Rooms (FR-032)
```typescript
const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
await prisma.room.deleteMany({
  where: {
    lastActivityAt: { lt: fiveMinutesAgo },
    members: { none: {} }, // No members connected
  },
});
```

---

## Migration Strategy

1. **Initial Migration**: Run `prisma migrate dev --name init` to create all tables
2. **Seed Data** (optional): Create test users, sample games for development
3. **Indexes**: Automatically created from `@@index` directives
4. **Future Migrations**: Use `prisma migrate dev --name <description>` for schema changes

---

**Next Steps**:
- Implement Repository Pattern interfaces in `core/application/ports/`
- Create Prisma repository implementations in `infrastructure/database/repositories/`
- Write integration tests for repositories
- Document API contracts in `contracts/`
