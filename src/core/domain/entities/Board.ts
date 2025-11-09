import { Piece } from './Piece';
import { Position } from '../value-objects/Position';
import { PieceColor } from '../value-objects/PieceColor';
import { PieceType } from '../value-objects/PieceType';

/**
 * Tabuleiro 8x8 de Damas com gerenciamento de peças
 */
export class Board {
  private pieces: Map<string, Piece>; // key: "row-col"

  constructor(pieces: Piece[] = []) {
    this.pieces = new Map();
    pieces.forEach((piece) => {
      if (piece.isActive) {
        this.pieces.set(this.positionKey(piece.position), piece);
      }
    });
  }

  /**
   * Gera chave única para posição
   */
  private positionKey(position: Position): string {
    return `${position.row}-${position.col}`;
  }

  /**
   * Inicializa tabuleiro com peças no estado inicial
   */
  static createInitialBoard(): Board {
    const pieces: Piece[] = [];
    let pieceId = 1;

    // Peças escuras (3 primeiras linhas)
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 8; col++) {
        const position = new Position(row, col);
        if (position.isDarkSquare()) {
          pieces.push(
            new Piece(
              `piece-${pieceId++}`,
              PieceColor.DARK,
              PieceType.COMMON,
              position
            )
          );
        }
      }
    }

    // Peças claras (3 últimas linhas)
    for (let row = 5; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const position = new Position(row, col);
        if (position.isDarkSquare()) {
          pieces.push(
            new Piece(
              `piece-${pieceId++}`,
              PieceColor.LIGHT,
              PieceType.COMMON,
              position
            )
          );
        }
      }
    }

    return new Board(pieces);
  }

  /**
   * Obtém peça em posição específica
   */
  getPieceAt(position: Position): Piece | null {
    return this.pieces.get(this.positionKey(position)) || null;
  }

  /**
   * Retorna todas as peças ativas
   */
  getAllPieces(): Piece[] {
    return Array.from(this.pieces.values());
  }

  /**
   * Retorna peças de uma cor específica
   */
  getPiecesByColor(color: PieceColor): Piece[] {
    return this.getAllPieces().filter((piece) => piece.color === color);
  }

  /**
   * Move peça de uma posição para outra
   */
  movePiece(from: Position, to: Position): void {
    const piece = this.getPieceAt(from);
    if (!piece) {
      throw new Error('No piece at origin position');
    }

    // Remove da posição antiga
    this.pieces.delete(this.positionKey(from));

    // Move a peça
    piece.moveTo(to);

    // Adiciona na nova posição
    this.pieces.set(this.positionKey(to), piece);

    // Verifica promoção
    if (piece.type === PieceType.COMMON && piece.isOnPromotionRow()) {
      piece.promote();
    }
  }

  /**
   * Remove peça do tabuleiro (captura)
   */
  removePiece(position: Position): void {
    const piece = this.getPieceAt(position);
    if (piece) {
      piece.capture();
      this.pieces.delete(this.positionKey(position));
    }
  }

  /**
   * Conta peças ativas por cor
   */
  countPieces(color: PieceColor): number {
    return this.getPiecesByColor(color).length;
  }

  /**
   * Verifica se há peças restantes para uma cor
   */
  hasRemainingPieces(color: PieceColor): boolean {
    return this.countPieces(color) > 0;
  }

  /**
   * Serializa para JSON
   */
  toJSON(): Array<{
    id: string;
    color: PieceColor;
    type: PieceType;
    position: { row: number; col: number };
    isActive: boolean;
  }> {
    return this.getAllPieces().map((piece) => piece.toJSON());
  }

  /**
   * Cria Board a partir de JSON
   */
  static fromJSON(
    piecesJson: Array<{
      id: string;
      color: PieceColor;
      type: PieceType;
      position: { row: number; col: number };
      isActive: boolean;
    }>
  ): Board {
    const pieces = piecesJson.map((json) => Piece.fromJSON(json));
    return new Board(pieces);
  }
}
