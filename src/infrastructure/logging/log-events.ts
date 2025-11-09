import { logger } from './logger';

/**
 * Eventos auditáveis do sistema
 */
export enum AuditEvent {
  // Autenticação
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  USER_REGISTER = 'USER_REGISTER',

  // Jogo Local
  LOCAL_GAME_STARTED = 'LOCAL_GAME_STARTED',
  LOCAL_GAME_FINISHED = 'LOCAL_GAME_FINISHED',

  // Jogo Bot
  BOT_GAME_STARTED = 'BOT_GAME_STARTED',
  BOT_MOVE_EXECUTED = 'BOT_MOVE_EXECUTED',
  BOT_GAME_FINISHED = 'BOT_GAME_FINISHED',

  // Movimentos
  MOVE_EXECUTED = 'MOVE_EXECUTED',
  MOVE_INVALID = 'MOVE_INVALID',
  CAPTURE_EXECUTED = 'CAPTURE_EXECUTED',
  PIECE_PROMOTED = 'PIECE_PROMOTED',

  // Vitória/Derrota
  GAME_WON = 'GAME_WON',
  GAME_DRAW = 'GAME_DRAW',
  GAME_FORFEIT = 'GAME_FORFEIT',

  // Salvar/Carregar
  GAME_SAVED = 'GAME_SAVED',
  GAME_LOADED = 'GAME_LOADED',
  GAME_DELETED = 'GAME_DELETED',

  // Salas Online
  ROOM_CREATED = 'ROOM_CREATED',
  ROOM_JOINED = 'ROOM_JOINED',
  ROOM_LEFT = 'ROOM_LEFT',
  ROOM_CLOSED = 'ROOM_CLOSED',

  // Conexões
  PLAYER_CONNECTED = 'PLAYER_CONNECTED',
  PLAYER_DISCONNECTED = 'PLAYER_DISCONNECTED',
  PLAYER_RECONNECTED = 'PLAYER_RECONNECTED',
  RECONNECTION_TIMEOUT = 'RECONNECTION_TIMEOUT',

  // Erros
  ERROR_OCCURRED = 'ERROR_OCCURRED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

/**
 * Interface para metadados de eventos
 */
interface EventMetadata {
  userId?: string;
  gameId?: string;
  roomId?: string;
  [key: string]: unknown;
}

/**
 * Logger de eventos auditáveis
 */
export class AuditLogger {
  /**
   * Loga evento auditável
   */
  static logEvent(
    event: AuditEvent,
    metadata: EventMetadata = {},
    message?: string
  ): void {
    const logData = {
      event,
      timestamp: new Date().toISOString(),
      ...metadata,
    };

    logger.info(message || event, logData);
  }

  /**
   * Loga erro auditável
   */
  static logError(
    error: Error,
    metadata: EventMetadata = {},
    context?: string
  ): void {
    const logData = {
      event: AuditEvent.ERROR_OCCURRED,
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      context,
      ...metadata,
    };

    logger.error(`Error: ${error.message}`, logData);
  }

  /**
   * Loga movimento de jogo
   */
  static logMove(
    gameId: string,
    userId: string,
    from: { row: number; col: number },
    to: { row: number; col: number },
    captured: number
  ): void {
    this.logEvent(AuditEvent.MOVE_EXECUTED, {
      gameId,
      userId,
      from,
      to,
      capturedPieces: captured,
    });
  }

  /**
   * Loga criação de sala
   */
  static logRoomCreated(roomId: string, userId: string, code: string): void {
    this.logEvent(
      AuditEvent.ROOM_CREATED,
      { roomId, userId, code },
      `Room created: ${code}`
    );
  }

  /**
   * Loga vitória
   */
  static logGameWon(gameId: string, winnerId: string, loserId: string): void {
    this.logEvent(
      AuditEvent.GAME_WON,
      { gameId, winnerId, loserId },
      `Game won by ${winnerId}`
    );
  }
}
