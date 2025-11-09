# WebSocket Events Contracts

**Feature**: Jogo de Damas | **Date**: 2025-11-08 | **Plan**: [plan.md](../plan.md)

Este documento especifica os eventos WebSocket para comunicação em tempo real em partidas online. Implementação em `infrastructure/websocket/` usando Socket.io ou ws.

---

## Connection Events

### Client → Server: `connect`

Cliente estabelece conexão WebSocket (automático via Socket.io).

**Payload**: None (handled by Socket.io)

**Server Response**: Emits `connected` event

**Functional Requirements**: FR-012 (online mode)

---

### Server → Client: `connected`

Confirma conexão estabelecida e envia ID de socket ao cliente.

**Payload**:
```typescript
type ConnectedPayload = {
  socketId: string;
  timestamp: Date;
};
```

---

### Client → Server: `disconnect`

Cliente desconecta (automático via Socket.io ou explícito).

**Payload**: None

**Server Behavior**:
- Marca `RoomMember.connectionStatus = 'DISCONNECTED'`
- Inicia janela de reconexão de 30s (FR-027)
- Emite `player_disconnected` para outros membros da sala

**Functional Requirements**: FR-027, FR-028

---

## Room Events

### Client → Server: `join_room`

Cliente entra em uma sala (após `joinRoom` Server Action retornar sucesso).

**Payload**:
```typescript
type JoinRoomPayload = {
  roomId: string;
  userId: string;
  role: 'PLAYER' | 'SPECTATOR';
};
```

**Server Response**:
- Adiciona socket ao room group (Socket.io room)
- Emite `room_joined` para o cliente
- Emite `player_joined` para outros membros

**Validation**:
- `roomId` existe
- `userId` autenticado
- `role` corresponde ao registrado no banco

---

### Server → Client: `room_joined`

Confirma entrada na sala e envia estado inicial.

**Payload**:
```typescript
type RoomJoinedPayload = {
  roomId: string;
  roomCode: string;
  role: 'PLAYER' | 'SPECTATOR';
  gameState: GameStateDTO | null; // null se partida não iniciada
  members: Array<{
    userId: string;
    role: 'PLAYER' | 'SPECTATOR';
    connectionStatus: 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING';
  }>;
};
```

**Functional Requirements**: FR-022, FR-023

---

### Server → All Room Members: `player_joined`

Notifica todos os membros da sala que novo jogador/espectador entrou.

**Payload**:
```typescript
type PlayerJoinedPayload = {
  userId: string;
  role: 'PLAYER' | 'SPECTATOR';
  timestamp: Date;
};
```

**Functional Requirements**: FR-023 (spectator mode)

---

### Client → Server: `leave_room`

Cliente sai da sala explicitamente.

**Payload**:
```typescript
type LeaveRoomPayload = {
  roomId: string;
  userId: string;
};
```

**Server Response**:
- Remove socket do room group
- Atualiza `RoomMember` no banco (pode deletar registro)
- Emite `player_left` para outros membros
- Se sala ficar vazia por 5min, agenda cleanup (FR-032)

---

### Server → All Room Members: `player_left`

Notifica que jogador/espectador saiu da sala.

**Payload**:
```typescript
type PlayerLeftPayload = {
  userId: string;
  role: 'PLAYER' | 'SPECTATOR';
  reason: 'MANUAL' | 'DISCONNECTED' | 'TIMEOUT';
  timestamp: Date;
};
```

**Functional Requirements**: FR-010 (forfeit), FR-027 (timeout)

---

## Game Events

### Client → Server: `move_executed`

Cliente notifica servidor que executou movimento (após `executeMove` Server Action).

**Payload**:
```typescript
type MoveExecutedPayload = {
  gameId: string;
  moveId: string; // ID retornado pelo Server Action
};
```

**Server Behavior**:
- Valida que movimento foi realmente salvo no banco
- Emite `game_state_update` para todos os membros da sala

**Functional Requirements**: FR-012, FR-019 (server-side validation)

---

### Server → All Room Members: `game_state_update`

Atualiza estado do jogo em tempo real para todos os membros.

**Payload**:
```typescript
type GameStateUpdatePayload = {
  gameState: GameStateDTO;
  lastMove: MoveDTO;
  timestamp: Date;
};
```

**Frequency**: Após cada movimento válido executado

**Functional Requirements**: FR-012, SC-006 (sync <1s)

**Performance Requirement**: Payload deve ser enviado em <1 segundo após movimento (95% dos casos com latency <200ms)

---

### Server → All Room Members: `game_finished`

Notifica que partida foi finalizada (vitória, derrota, empate, forfeit).

**Payload**:
```typescript
type GameFinishedPayload = {
  gameId: string;
  result: 'PLAYER1_WIN' | 'PLAYER2_WIN' | 'DRAW' | 'FORFEIT';
  winner?: string; // userId do vencedor (se aplicável)
  reason: 'CHECKMATE' | 'STALEMATE' | 'FORFEIT' | 'TIMEOUT';
  finalState: GameStateDTO;
  timestamp: Date;
};
```

**Functional Requirements**: FR-008, FR-009, FR-010

---

## Connection Status Events

### Server → All Room Members: `player_disconnected`

Notifica que jogador perdeu conexão (inicia janela de reconexão).

**Payload**:
```typescript
type PlayerDisconnectedPayload = {
  userId: string;
  role: 'PLAYER' | 'SPECTATOR';
  reconnectionDeadline: Date; // 30s a partir de agora
  message: string; // "Player {name} disconnected. Waiting for reconnection..."
};
```

**Functional Requirements**: FR-027, FR-028

**Server Behavior**:
- Aguarda 30s para reconexão automática
- Após 30s sem reconectar, inicia timeout de inatividade (2min)

---

### Server → All Room Members: `player_reconnecting`

Atualiza status de jogador em processo de reconexão.

**Payload**:
```typescript
type PlayerReconnectingPayload = {
  userId: string;
  timeoutDeadline: Date; // 2min a partir de agora
  message: string; // "Player {name} reconnecting. 2 minutes until forfeit."
};
```

**Functional Requirements**: FR-027, FR-028

---

### Server → All Room Members: `player_reconnected`

Notifica que jogador reconectou com sucesso.

**Payload**:
```typescript
type PlayerReconnectedPayload = {
  userId: string;
  role: 'PLAYER' | 'SPECTATOR';
  currentGameState: GameStateDTO; // Estado sincronizado
  message: string; // "Player {name} reconnected."
};
```

**Functional Requirements**: FR-027

---

### Server → All Room Members: `player_timeout`

Notifica que jogador não reconectou após timeout total (2min 30s).

**Payload**:
```typescript
type PlayerTimeoutPayload = {
  userId: string;
  role: 'PLAYER';
  gameResult: 'PLAYER1_WIN' | 'PLAYER2_WIN'; // Oponente vence
  message: string; // "Player {name} timed out. {Opponent} wins by forfeit."
};
```

**Functional Requirements**: FR-027, FR-010 (forfeit)

**Server Behavior**:
- Marca partida como `FINISHED` com resultado `FORFEIT`
- Emite `game_finished` em seguida

---

## Error Events

### Server → Client: `error`

Notifica cliente de erro durante operação WebSocket.

**Payload**:
```typescript
type ErrorPayload = {
  code: 'ROOM_NOT_FOUND' | 'UNAUTHORIZED' | 'INVALID_MOVE' | 'SERVER_ERROR';
  message: string;
  details?: any; // Detalhes adicionais (opcional)
};
```

**Examples**:
- `ROOM_NOT_FOUND`: Cliente tentou entrar em sala inexistente
- `UNAUTHORIZED`: Token de autenticação inválido
- `INVALID_MOVE`: Movimento enviado não é válido (não deveria ocorrer se Server Action validar corretamente)

---

## Heartbeat Events

### Client ↔ Server: `ping` / `pong`

Mantém conexão ativa e detecta desconexões (Socket.io built-in).

**Payload**: None

**Frequency**: A cada 25s (Socket.io default)

**Purpose**: Detectar desconexões de rede antes do timeout de 30s

---

## Event Flow Examples

### Example 1: Normal Move Execution

1. **Player A** executa movimento via `executeMove` Server Action
2. **Server Action** valida, atualiza banco, retorna `{ success: true, moveId }`
3. **Player A Client** emite `move_executed` com `moveId`
4. **WebSocket Server** valida que movimento existe no banco
5. **WebSocket Server** emite `game_state_update` para **Player A**, **Player B**, **Spectators**
6. **All clients** atualizam UI com novo estado (<1s total)

**Functional Requirements**: FR-012, FR-019, SC-006

---

### Example 2: Player Disconnection & Reconnection

1. **Player A** perde conexão (evento `disconnect` automático)
2. **WebSocket Server** detecta desconexão, marca `connectionStatus = 'DISCONNECTED'`
3. **WebSocket Server** emite `player_disconnected` para **Player B** e **Spectators**
4. **Timer 30s** inicia no servidor
5. **Player A** reconecta antes de 30s
6. **WebSocket Server** emite `player_reconnected` para todos
7. **Player A** recebe `currentGameState` sincronizado

**Functional Requirements**: FR-027, FR-028

---

### Example 3: Player Timeout (No Reconnection)

1. **Player A** perde conexão
2. **WebSocket Server** emite `player_disconnected` (janela de 30s)
3. **30s passam sem reconexão**
4. **WebSocket Server** emite `player_reconnecting` (timeout de 2min inicia)
5. **2min passam sem reconexão**
6. **WebSocket Server** emite `player_timeout`
7. **WebSocket Server** finaliza partida com `FORFEIT`, **Player B** vence
8. **WebSocket Server** emite `game_finished`

**Functional Requirements**: FR-027, FR-010

---

## Implementation Notes

### Technology Choice: Socket.io vs ws

**Recommendation**: **Socket.io**

**Rationale**:
- Built-in room management (`socket.join(roomId)`)
- Automatic reconnection with exponential backoff
- Event-based API (cleaner than raw ws messages)
- Binary protocol support (efficient for large payloads)
- Fallback to HTTP long-polling (compatibility)

**Alternative** (ws):
- Lower-level, requires manual room management
- No automatic reconnection (must implement manually)
- Lighter weight (smaller bundle size)

---

### Authentication Strategy

**Approach**: JWT token validation on WebSocket connection

```typescript
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  try {
    const decoded = verifyJWT(token); // Better-Auth JWT
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    next(new Error('Unauthorized'));
  }
});
```

**Functional Requirements**: FR-020 (secure persistence), Security Constitution

---

### Scaling Considerations

**Single Server** (MVP):
- Socket.io with in-memory adapter
- Room state stored in PostgreSQL
- Works for <1000 concurrent users

**Multi-Server** (Production):
- Socket.io with Redis adapter (`@socket.io/redis-adapter`)
- Shared room state via Redis
- Load balancer with sticky sessions (nginx)

**Functional Requirements**: Scalability (deferred to planning phase)

---

### Logging & Monitoring

All WebSocket events MUST be logged (FR-025, FR-026):

```typescript
logger.info('WebSocket event', {
  event: 'game_state_update',
  roomId,
  userId,
  gameId,
  timestamp: new Date(),
  latency: Date.now() - moveExecutedAt, // For SC-006 monitoring
});
```

**Metrics to Track**:
- Event latency (move execution → state update propagation)
- Reconnection success rate
- Average room size (players + spectators)
- Active connections count

---

**Next Steps**:
- Implement WebSocket server in `infrastructure/websocket/WebSocketServer.ts`
- Create event handlers in `infrastructure/websocket/handlers/`
- Define TypeScript types in `shared/types/websocket-messages.ts`
- Write integration tests for reconnection flow
- Document use case interfaces (`contracts/use-cases.md`)
