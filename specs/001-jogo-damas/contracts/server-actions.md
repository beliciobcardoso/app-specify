# Server Actions Contracts

**Feature**: Jogo de Damas | **Date**: 2025-11-08 | **Plan**: [plan.md](../plan.md)

Este documento especifica os contratos de Server Actions (Next.js 13+) para o Jogo de Damas. Todas as actions validam entrada com Zod, chamam use cases da camada `core/application`, e retornam tipos seguros.

---

## Game Actions (`app/_actions/game-actions.ts`)

### `executeMove`

Executa uma jogada no tabuleiro, aplicando regras de movimento, captura obrigatória e Lei da Maioria.

**Input (Zod Schema)**:
```typescript
const ExecuteMoveSchema = z.object({
  gameId: z.string().cuid(),
  pieceId: z.string(), // ID da peça a mover
  targetPosition: z.object({
    row: z.number().int().min(0).max(7),
    col: z.number().int().min(0).max(7),
  }),
});

type ExecuteMoveInput = z.infer<typeof ExecuteMoveSchema>;
```

**Output**:
```typescript
type ExecuteMoveResult =
  | { success: true; gameState: GameStateDTO; moveId: string }
  | { success: false; error: 'INVALID_MOVE' | 'MANDATORY_CAPTURE' | 'NOT_YOUR_TURN' | 'GAME_FINISHED'; message: string };
```

**Use Case**: `ExecuteMoveUseCase` (local) ou `ExecuteOnlineMoveUseCase` (online)

**Functional Requirements**: FR-002, FR-003, FR-004, FR-005, FR-019

**Validation Rules**:
- Movimento diagonal válido (apenas casas escuras)
- Captura obrigatória aplicada (bloqueia outros movimentos)
- Lei da Maioria respeitada (se múltiplos caminhos, escolhe o que captura mais peças)
- Validação server-side antes de aplicar ao estado

**Error Handling**:
- `INVALID_MOVE`: Movimento não respeita regras (casa clara, direção inválida)
- `MANDATORY_CAPTURE`: Captura disponível mas jogador tentou movimento simples
- `NOT_YOUR_TURN`: Jogador tentou mover fora do seu turno
- `GAME_FINISHED`: Partida já finalizada

---

### `saveGame`

Salva o estado atual de uma partida em andamento (máximo 50 partidas salvas por usuário).

**Input (Zod Schema)**:
```typescript
const SaveGameSchema = z.object({
  gameId: z.string().cuid(),
  userId: z.string().cuid(),
});

type SaveGameInput = z.infer<typeof SaveGameSchema>;
```

**Output**:
```typescript
type SaveGameResult =
  | { success: true; savedGameId: string }
  | { success: false; error: 'MAX_SAVED_GAMES' | 'GAME_ALREADY_SAVED' | 'UNAUTHORIZED'; message: string };
```

**Use Case**: `SaveGameUseCase`

**Functional Requirements**: FR-014, FR-020

**Validation Rules**:
- Usuário autenticado (Better-Auth)
- Máximo 50 partidas salvas (em andamento) por usuário
- Partida ainda em andamento (status `IN_PROGRESS`)

**Error Handling**:
- `MAX_SAVED_GAMES`: Usuário já possui 50 partidas salvas
- `GAME_ALREADY_SAVED`: Partida já foi salva anteriormente
- `UNAUTHORIZED`: Usuário não autenticado ou não é participante da partida

---

### `loadGame`

Carrega uma partida previamente salva, restaurando o estado completo do tabuleiro.

**Input (Zod Schema)**:
```typescript
const LoadGameSchema = z.object({
  gameId: z.string().cuid(),
  userId: z.string().cuid(),
});

type LoadGameInput = z.infer<typeof LoadGameSchema>;
```

**Output**:
```typescript
type LoadGameResult =
  | { success: true; gameState: GameStateDTO; moveHistory: MoveDTO[] }
  | { success: false; error: 'GAME_NOT_FOUND' | 'UNAUTHORIZED'; message: string };
```

**Use Case**: `LoadGameUseCase`

**Functional Requirements**: FR-015, FR-018

**Validation Rules**:
- Usuário autenticado
- Usuário é o dono da partida salva (`savedById`)
- Partida existe e está salva (`isSaved=true`)

**Error Handling**:
- `GAME_NOT_FOUND`: ID de partida inválido ou partida não existe
- `UNAUTHORIZED`: Usuário não é o dono da partida salva

---

### `deleteGameHistory`

Deleta partidas finalizadas do histórico do usuário (individual ou em lote).

**Input (Zod Schema)**:
```typescript
const DeleteGameHistorySchema = z.object({
  userId: z.string().cuid(),
  gameIds: z.array(z.string().cuid()).min(1).max(100), // Max 100 por vez
});

type DeleteGameHistoryInput = z.infer<typeof DeleteGameHistorySchema>;
```

**Output**:
```typescript
type DeleteGameHistoryResult =
  | { success: true; deletedCount: number }
  | { success: false; error: 'UNAUTHORIZED' | 'NO_GAMES_FOUND'; message: string };
```

**Use Case**: `DeleteGameHistoryUseCase`

**Functional Requirements**: FR-029, FR-030

**Validation Rules**:
- Usuário autenticado
- Partidas são finalizadas (`status=FINISHED`)
- Usuário é participante das partidas (player1 ou player2)

**Error Handling**:
- `UNAUTHORIZED`: Usuário não é participante das partidas
- `NO_GAMES_FOUND`: Nenhuma partida encontrada com os IDs fornecidos

---

### `startLocalGame`

Inicia uma nova partida local (dois jogadores no mesmo dispositivo).

**Input (Zod Schema)**:
```typescript
const StartLocalGameSchema = z.object({
  player1Name: z.string().optional(),
  player2Name: z.string().optional(),
});

type StartLocalGameInput = z.infer<typeof StartLocalGameSchema>;
```

**Output**:
```typescript
type StartLocalGameResult = {
  success: true;
  gameId: string;
  gameState: GameStateDTO;
};
```

**Use Case**: `StartLocalGameUseCase`

**Functional Requirements**: FR-011, FR-001

**Validation Rules**:
- Nenhuma (partida local não requer autenticação)

---

### `startBotGame`

Inicia uma nova partida contra o Bot (IA).

**Input (Zod Schema)**:
```typescript
const StartBotGameSchema = z.object({
  userId: z.string().cuid().optional(), // Opcional: permite bot sem login
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  playerColor: z.enum(['LIGHT', 'DARK']), // Usuário escolhe cor
});

type StartBotGameInput = z.infer<typeof StartBotGameSchema>;
```

**Output**:
```typescript
type StartBotGameResult = {
  success: true;
  gameId: string;
  gameState: GameStateDTO;
  botFirstMove?: MoveDTO; // Se usuário escolheu DARK, bot joga primeiro
};
```

**Use Case**: `StartBotGameUseCase`

**Functional Requirements**: FR-013

**Validation Rules**:
- Dificuldade válida (EASY, MEDIUM, HARD)
- Cor válida (LIGHT ou DARK)

---

### `getUserStats`

Retorna estatísticas de jogo do usuário autenticado.

**Input (Zod Schema)**:
```typescript
const GetUserStatsSchema = z.object({
  userId: z.string().cuid(),
});

type GetUserStatsInput = z.infer<typeof GetUserStatsSchema>;
```

**Output**:
```typescript
type GetUserStatsResult = {
  success: true;
  stats: {
    totalGames: number;
    wins: number;
    losses: number;
    draws: number;
    forfeits: number;
    winRate: number; // Calculated: wins / (totalGames - draws)
    localGames: number;
    onlineGames: number;
    botGames: number;
    botWinsByDifficulty: {
      easy: number;
      medium: number;
      hard: number;
    };
  };
};
```

**Use Case**: `GetUserStatsUseCase`

**Functional Requirements**: FR-020 (persistence), Success Criteria relacionados

---

## Room Actions (`app/_actions/room-actions.ts`)

### `createRoom`

Cria uma nova sala de jogo online com código único de 6 caracteres.

**Input (Zod Schema)**:
```typescript
const CreateRoomSchema = z.object({
  userId: z.string().cuid(),
});

type CreateRoomInput = z.infer<typeof CreateRoomSchema>;
```

**Output**:
```typescript
type CreateRoomResult =
  | { success: true; roomCode: string; roomId: string }
  | { success: false; error: 'UNAUTHORIZED'; message: string };
```

**Use Case**: `CreateRoomUseCase`

**Functional Requirements**: FR-021, FR-031

**Validation Rules**:
- Usuário autenticado (Better-Auth)
- Código único de 6 caracteres alfanuméricos gerado
- Sem limite de taxa (FR-031)

**Error Handling**:
- `UNAUTHORIZED`: Usuário não autenticado

---

### `joinRoom`

Permite usuário entrar em uma sala existente via código (como jogador ou espectador).

**Input (Zod Schema)**:
```typescript
const JoinRoomSchema = z.object({
  userId: z.string().cuid(),
  roomCode: z.string().length(6).regex(/^[A-Z0-9]{6}$/),
});

type JoinRoomInput = z.infer<typeof JoinRoomSchema>;
```

**Output**:
```typescript
type JoinRoomResult =
  | { success: true; roomId: string; role: 'PLAYER' | 'SPECTATOR'; gameState: GameStateDTO | null }
  | { success: false; error: 'ROOM_NOT_FOUND' | 'ROOM_FULL' | 'UNAUTHORIZED'; message: string };
```

**Use Case**: `JoinRoomUseCase`

**Functional Requirements**: FR-022, FR-023, FR-024

**Validation Rules**:
- Código de sala válido (6 caracteres alfanuméricos)
- Usuário autenticado
- Se sala tem 2 jogadores, entra como espectador (FR-023)
- Se sala tem <2 jogadores, entra como jogador (FR-024)

**Error Handling**:
- `ROOM_NOT_FOUND`: Código de sala inválido ou sala não existe
- `ROOM_FULL`: Sala já possui 2 jogadores e espectadores ilimitados (nunca deve ocorrer)
- `UNAUTHORIZED`: Usuário não autenticado

---

### `leaveRoom`

Remove usuário de uma sala (jogador ou espectador).

**Input (Zod Schema)**:
```typescript
const LeaveRoomSchema = z.object({
  userId: z.string().cuid(),
  roomId: z.string().cuid(),
});

type LeaveRoomInput = z.infer<typeof LeaveRoomSchema>;
```

**Output**:
```typescript
type LeaveRoomResult =
  | { success: true; message: string }
  | { success: false; error: 'ROOM_NOT_FOUND' | 'NOT_IN_ROOM'; message: string };
```

**Use Case**: `LeaveRoomUseCase` (implícito em room management)

**Functional Requirements**: FR-010 (forfeit), FR-032 (cleanup)

**Validation Rules**:
- Usuário está na sala
- Se jogador sai, partida pode ser finalizada com derrota por forfeit

**Error Handling**:
- `ROOM_NOT_FOUND`: ID de sala inválido
- `NOT_IN_ROOM`: Usuário não é membro da sala

---

## Common Types (DTOs)

### `GameStateDTO`
```typescript
type GameStateDTO = {
  gameId: string;
  mode: 'LOCAL' | 'ONLINE' | 'BOT';
  status: 'IN_PROGRESS' | 'FINISHED';
  result: 'PLAYER1_WIN' | 'PLAYER2_WIN' | 'DRAW' | 'FORFEIT' | null;
  currentTurn: 'LIGHT' | 'DARK';
  board: {
    pieces: Array<{
      id: string;
      color: 'LIGHT' | 'DARK';
      type: 'COMMON' | 'QUEEN';
      position: { row: number; col: number };
    }>;
  };
  player1: { id?: string; type: 'HUMAN_LOCAL' | 'HUMAN_ONLINE' | 'BOT'; name?: string };
  player2: { id?: string; type: 'HUMAN_LOCAL' | 'HUMAN_ONLINE' | 'BOT'; name?: string };
  availableMoves?: Array<{ from: Position; to: Position; captures?: Position[] }>; // Opcional: para feedback visual
};
```

### `MoveDTO`
```typescript
type MoveDTO = {
  id: string;
  moveNumber: number;
  pieceColor: 'LIGHT' | 'DARK';
  from: { row: number; col: number };
  to: { row: number; col: number };
  capturedPieces?: Array<{ row: number; col: number }>;
  wasPromoted: boolean;
  executedAt: Date;
};
```

---

## Security & Validation Notes

1. **All Server Actions**:
   - Use `'use server'` directive
   - Validate input with Zod schemas (reject invalid data immediately)
   - Check Better-Auth authentication where required
   - Return typed results (success/error union types)
   - Log all actions (FR-025, FR-026)

2. **Authorization**:
   - `saveGame`, `loadGame`: Verify user owns/participates in game
   - `createRoom`, `joinRoom`: Require authenticated user
   - `executeMove` (online): Verify user is active player in room

3. **Rate Limiting**:
   - No explicit rate limiting for `createRoom` (FR-031)
   - Consider implementing per-user throttling in production (prevent abuse)

4. **Error Logging**:
   - All errors logged with context (userId, gameId, roomId, action name)
   - Structured logging with levels (INFO, WARN, ERROR)
   - Audit trail for sensitive actions (saveGame, deleteGameHistory)

---

**Next Steps**:
- Implement WebSocket event contracts (`contracts/websocket-events.md`)
- Define use case interfaces (`contracts/use-cases.md`)
- Create Zod schemas in `infrastructure/validation/schemas/`
- Implement Server Actions in `app/_actions/`
