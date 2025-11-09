/**
 * Representa o nível de dificuldade do Bot
 */
export enum BotDifficulty {
  /** Fácil: jogadas aleatórias válidas */
  EASY = 'EASY',
  /** Médio: Minimax profundidade 4 */
  MEDIUM = 'MEDIUM',
  /** Difícil: Minimax profundidade 6+ com alpha-beta pruning */
  HARD = 'HARD',
}
