/**
 * Representa o tipo de jogador
 */
export enum PlayerType {
  /** Jogador humano local (mesmo dispositivo) */
  HUMAN_LOCAL = 'HUMAN_LOCAL',
  /** Jogador humano online (via WebSocket) */
  HUMAN_ONLINE = 'HUMAN_ONLINE',
  /** Bot (IA) */
  BOT = 'BOT',
}
