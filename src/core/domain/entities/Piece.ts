import { Position } from '../value-objects/Position';
import { PieceColor } from '../value-objects/PieceColor';
import { PieceType } from '../value-objects/PieceType';

/**
 * Representa uma peça no tabuleiro de Damas
 */
export class Piece {
  constructor(
    public readonly id: string,
    public readonly color: PieceColor,
    public type: PieceType,
    public position: Position,
    public isActive: boolean = true
  ) {}

  /**
   * Promove peça comum a Dama
   */
  promote(): void {
    if (this.type === PieceType.QUEEN) {
      throw new Error('Piece is already a Queen');
    }
    this.type = PieceType.QUEEN;
  }

  /**
   * Captura a peça (marca como inativa)
   */
  capture(): void {
    this.isActive = false;
  }

  /**
   * Move a peça para nova posição
   */
  moveTo(newPosition: Position): void {
    if (!this.isActive) {
      throw new Error('Cannot move captured piece');
    }
    this.position = newPosition;
  }

  /**
   * Verifica se a peça está na linha de promoção
   */
  isOnPromotionRow(): boolean {
    if (this.color === PieceColor.LIGHT) {
      return this.position.row === 0; // Linha 0 (topo) para peças claras
    }
    return this.position.row === 7; // Linha 7 (base) para peças escuras
  }

  /**
   * Serializa para JSON
   */
  toJSON(): {
    id: string;
    color: PieceColor;
    type: PieceType;
    position: { row: number; col: number };
    isActive: boolean;
  } {
    return {
      id: this.id,
      color: this.color,
      type: this.type,
      position: this.position.toJSON(),
      isActive: this.isActive,
    };
  }

  /**
   * Cria Piece a partir de JSON
   */
  static fromJSON(json: {
    id: string;
    color: PieceColor;
    type: PieceType;
    position: { row: number; col: number };
    isActive: boolean;
  }): Piece {
    return new Piece(
      json.id,
      json.color,
      json.type,
      Position.fromJSON(json.position),
      json.isActive
    );
  }
}
