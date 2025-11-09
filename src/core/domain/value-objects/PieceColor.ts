/**
 * Representa a cor de uma peça no jogo de Damas
 */
export enum PieceColor {
  LIGHT = 'LIGHT',
  DARK = 'DARK',
}

/**
 * Retorna a cor oposta
 */
export function oppositeColor(color: PieceColor): PieceColor {
  return color === PieceColor.LIGHT ? PieceColor.DARK : PieceColor.LIGHT;
}
