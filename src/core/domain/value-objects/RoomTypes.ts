/**
 * Representa o status de uma sala online
 */
export enum RoomStatus {
  /** Aguardando segundo jogador */
  WAITING = 'WAITING',
  /** Jogo em andamento */
  IN_GAME = 'IN_GAME',
  /** Jogo finalizado */
  FINISHED = 'FINISHED',
  /** Sala fechada */
  CLOSED = 'CLOSED',
}

/**
 * Representa o papel de um membro na sala
 */
export enum RoomRole {
  /** Jogador ativo (máximo 2 por sala) */
  PLAYER = 'PLAYER',
  /** Espectador (ilimitados) */
  SPECTATOR = 'SPECTATOR',
}

/**
 * Representa o status de conexão de um membro
 */
export enum ConnectionStatus {
  /** Conectado */
  CONNECTED = 'CONNECTED',
  /** Desconectado (janela de reconexão 30s) */
  DISCONNECTED = 'DISCONNECTED',
  /** Reconectando (timeout de inatividade 2min) */
  RECONNECTING = 'RECONNECTING',
}
