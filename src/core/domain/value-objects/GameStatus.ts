/**
 * Representa o status atual do jogo
 */
export enum GameStatus {
  /** Jogo em andamento */
  IN_PROGRESS = 'IN_PROGRESS',
  /** Jogo finalizado */
  FINISHED = 'FINISHED',
}

/**
 * Representa o resultado final do jogo
 */
export enum GameResult {
  /** Jogador 1 (LIGHT) venceu */
  PLAYER1_WIN = 'PLAYER1_WIN',
  /** Jogador 2 (DARK) venceu */
  PLAYER2_WIN = 'PLAYER2_WIN',
  /** Empate (ambos sem movimentos, peças iguais) */
  DRAW = 'DRAW',
  /** Desistência formal */
  FORFEIT = 'FORFEIT',
}
