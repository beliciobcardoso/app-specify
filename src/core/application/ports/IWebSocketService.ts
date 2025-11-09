import { Move } from '../../domain/entities/Move';
import { RoomMember } from '../../domain/entities/Room';
import { ConnectionStatus } from '../../domain/value-objects/RoomTypes';

/**
 * Eventos enviados do servidor para clientes
 */
export enum WebSocketServerEvent {
  // Sala
  ROOM_CREATED = 'room:created',
  ROOM_JOINED = 'room:joined',
  ROOM_LEFT = 'room:left',
  ROOM_UPDATED = 'room:updated',
  ROOM_CLOSED = 'room:closed',

  // Jogo
  GAME_STARTED = 'game:started',
  GAME_MOVE = 'game:move',
  GAME_FINISHED = 'game:finished',

  // Conexão
  PLAYER_CONNECTED = 'player:connected',
  PLAYER_DISCONNECTED = 'player:disconnected',
  PLAYER_RECONNECTED = 'player:reconnected',

  // Erros
  ERROR = 'error',
}

/**
 * Eventos enviados de clientes para servidor
 */
export enum WebSocketClientEvent {
  // Sala
  CREATE_ROOM = 'room:create',
  JOIN_ROOM = 'room:join',
  LEAVE_ROOM = 'room:leave',
  START_GAME = 'game:start',

  // Jogo
  MAKE_MOVE = 'game:makeMove',
  FORFEIT = 'game:forfeit',

  // Conexão
  PING = 'ping',
}

/**
 * Interface de serviço WebSocket para comunicação real-time
 */
export interface IWebSocketService {
  /**
   * Emite evento para usuário específico
   */
  emitToUser(userId: string, event: WebSocketServerEvent, data: unknown): void;

  /**
   * Emite evento para sala específica
   */
  emitToRoom(roomId: string, event: WebSocketServerEvent, data: unknown): void;

  /**
   * Registra usuário em sala (para receber eventos)
   */
  joinRoom(userId: string, roomId: string): void;

  /**
   * Remove usuário de sala
   */
  leaveRoom(userId: string, roomId: string): void;

  /**
   * Verifica se usuário está conectado
   */
  isUserConnected(userId: string): boolean;

  /**
   * Notifica movimento para sala
   */
  notifyMove(roomId: string, move: Move): void;

  /**
   * Notifica atualização de membros
   */
  notifyMembersUpdate(roomId: string, members: RoomMember[]): void;

  /**
   * Notifica mudança de status de conexão
   */
  notifyConnectionStatus(
    roomId: string,
    userId: string,
    status: ConnectionStatus
  ): void;
}
