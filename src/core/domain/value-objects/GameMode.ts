/**
 * Representa o modo de jogo
 */
export enum GameMode {
  /** Dois jogadores no mesmo dispositivo */
  LOCAL = 'LOCAL',
  /** Dois jogadores online via WebSocket */
  ONLINE = 'ONLINE',
  /** Jogador vs Bot (IA) */
  BOT = 'BOT',
}
