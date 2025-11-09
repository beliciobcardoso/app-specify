import { Position } from '../value-objects/Position';
import { PieceColor } from '../value-objects/PieceColor';

/**
 * Representa uma jogada no jogo de Damas
 */
export class Move {
  constructor(
    public readonly id: string,
    public readonly from: Position,
    public readonly to: Position,
    public readonly pieceColor: PieceColor,
    public readonly capturedPositions: Position[] = [],
    public readonly wasPromoted: boolean = false,
    public readonly timestamp: Date = new Date()
  ) {}

  /**
   * Verifica se é movimento de captura
   */
  isCapture(): boolean {
    return this.capturedPositions.length > 0;
  }

  /**
   * Verifica se é captura múltipla
   */
  isMultiCapture(): boolean {
    return this.capturedPositions.length > 1;
  }

  /**
   * Serializa para JSON
   */
  toJSON(): {
    id: string;
    from: { row: number; col: number };
    to: { row: number; col: number };
    pieceColor: PieceColor;
    capturedPositions: Array<{ row: number; col: number }>;
    wasPromoted: boolean;
    timestamp: string;
  } {
    return {
      id: this.id,
      from: this.from.toJSON(),
      to: this.to.toJSON(),
      pieceColor: this.pieceColor,
      capturedPositions: this.capturedPositions.map((pos) => pos.toJSON()),
      wasPromoted: this.wasPromoted,
      timestamp: this.timestamp.toISOString(),
    };
  }

  /**
   * Cria Move a partir de JSON
   */
  static fromJSON(json: {
    id: string;
    from: { row: number; col: number };
    to: { row: number; col: number };
    pieceColor: PieceColor;
    capturedPositions: Array<{ row: number; col: number }>;
    wasPromoted: boolean;
    timestamp: string;
  }): Move {
    return new Move(
      json.id,
      Position.fromJSON(json.from),
      Position.fromJSON(json.to),
      json.pieceColor,
      json.capturedPositions.map((pos) => Position.fromJSON(pos)),
      json.wasPromoted,
      new Date(json.timestamp)
    );
  }
}
