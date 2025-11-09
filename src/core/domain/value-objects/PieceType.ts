/**
 * Representa o tipo de uma peça no jogo de Damas
 */
export enum PieceType {
  /** Peça comum (pedra) - move apenas para frente */
  COMMON = 'COMMON',
  /** Dama - move para frente e trás, múltiplas casas */
  QUEEN = 'QUEEN',
}
