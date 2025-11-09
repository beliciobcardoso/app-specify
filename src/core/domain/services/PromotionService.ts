import { Position } from '../value-objects/Position';
import { PieceColor } from '../value-objects/PieceColor';
import { PieceType } from '../value-objects/PieceType';

/**
 * Serviço para gerenciar promoção de peças a Damas (FR-006)
 * 
 * Regras implementadas:
 * - FR-006: Peça comum promovida a Dama ao atingir 8ª fileira adversária
 * - Peças LIGHT (claras) promovem na linha 0 (topo)
 * - Peças DARK (escuras) promovem na linha 7 (base)
 */
export class PromotionService {
  /**
   * Verifica se uma posição é linha de promoção para determinada cor
   */
  isPromotionRow(position: Position, pieceColor: PieceColor): boolean {
    // Peças LIGHT (começam embaixo) promovem no topo (row 0)
    if (pieceColor === PieceColor.LIGHT) {
      return position.row === 0;
    }
    
    // Peças DARK (começam em cima) promovem na base (row 7)
    return position.row === 7;
  }

  /**
   * Verifica se uma peça deve ser promovida após um movimento
   */
  shouldPromote(
    fromPosition: Position,
    toPosition: Position,
    pieceColor: PieceColor,
    pieceType: PieceType
  ): boolean {
    // Apenas peças comuns podem ser promovidas
    if (pieceType === PieceType.QUEEN) {
      return false;
    }

    // Verifica se chegou na linha de promoção
    return this.isPromotionRow(toPosition, pieceColor);
  }

  /**
   * Retorna a linha de promoção para uma cor específica
   */
  getPromotionRow(pieceColor: PieceColor): number {
    return pieceColor === PieceColor.LIGHT ? 0 : 7;
  }

  /**
   * Verifica se um movimento resultará em promoção
   */
  willPromote(
    toPosition: Position,
    pieceColor: PieceColor,
    pieceType: PieceType
  ): boolean {
    if (pieceType === PieceType.QUEEN) {
      return false;
    }

    return this.isPromotionRow(toPosition, pieceColor);
  }
}
