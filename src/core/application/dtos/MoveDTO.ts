import { PieceColor } from '@/core/domain/value-objects/PieceColor';

/**
 * DTO representando movimento executado
 */
export interface MoveDTO {
  /**
   * ID do movimento
   */
  id: string;

  /**
   * Número sequencial da jogada
   */
  moveNumber: number;

  /**
   * Cor da peça que moveu
   */
  pieceColor: PieceColor;

  /**
   * Posição de origem
   */
  from: { row: number; col: number };

  /**
   * Posição de destino
   */
  to: { row: number; col: number };

  /**
   * Peças capturadas
   */
  capturedPositions?: Array<{ row: number; col: number }>;

  /**
   * Indica promoção
   */
  wasPromoted: boolean;

  /**
   * Timestamp do movimento
   */
  executedAt: Date;
}
