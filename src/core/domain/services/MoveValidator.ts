import { Board } from '../entities/Board';
import { Position } from '../value-objects/Position';
import { PieceColor } from '../value-objects/PieceColor';
import { PieceType } from '../value-objects/PieceType';

/**
 * Tipo de movimento detectado
 */
export enum MoveType {
  /** Movimento simples (sem captura) */
  SIMPLE = 'SIMPLE',
  /** Movimento com captura */
  CAPTURE = 'CAPTURE',
}

/**
 * Resultado da validação de movimento
 */
export interface MoveValidationResult {
  /** Se o movimento é válido */
  isValid: boolean;
  /** Tipo de movimento */
  type?: MoveType;
  /** Posições das peças capturadas (se houver) */
  capturedPositions?: Position[];
  /** Mensagem de erro (se inválido) */
  error?: string;
}

/**
 * Serviço de validação de movimentos seguindo as regras brasileiras de Damas
 * 
 * Regras implementadas:
 * - FR-001: Movimentos apenas em diagonais
 * - FR-002: Apenas casas escuras são válidas
 * - Peças comuns: movem 1 casa para frente na diagonal
 * - Damas: movem múltiplas casas para frente ou trás na diagonal
 * - Capturas: peça pula sobre adversário em diagonal
 */
export class MoveValidator {
  /**
   * Valida se um movimento é permitido
   */
  validate(
    board: Board,
    from: Position,
    to: Position,
    playerColor: PieceColor
  ): MoveValidationResult {
    // Validação 1: Casa de destino deve ser escura (FR-002)
    if (!to.isDarkSquare()) {
      return {
        isValid: false,
        error: 'Destino deve ser uma casa escura',
      };
    }

    // Validação 2: Deve haver peça na origem
    const piece = board.getPieceAt(from);
    if (!piece) {
      return {
        isValid: false,
        error: 'Nenhuma peça na posição de origem',
      };
    }

    // Validação 3: Peça deve pertencer ao jogador atual
    if (piece.color !== playerColor) {
      return {
        isValid: false,
        error: 'Peça não pertence ao jogador atual',
      };
    }

    // Validação 4: Casa de destino deve estar vazia
    if (board.getPieceAt(to) !== null) {
      return {
        isValid: false,
        error: 'Casa de destino já ocupada',
      };
    }

    // Validação 5: Movimento deve ser diagonal
    if (!this.isDiagonalMove(from, to)) {
      return {
        isValid: false,
        error: 'Movimento deve ser diagonal',
      };
    }

    // Validação específica por tipo de peça
    if (piece.type === PieceType.COMMON) {
      return this.validateCommonPieceMove(board, from, to, playerColor);
    } else {
      return this.validateQueenMove(board, from, to, playerColor);
    }
  }

  /**
   * Valida movimento de peça comum
   */
  private validateCommonPieceMove(
    board: Board,
    from: Position,
    to: Position,
    playerColor: PieceColor
  ): MoveValidationResult {
    const rowDiff = to.row - from.row;
    const colDiff = Math.abs(to.col - from.col);

    // Direção correta para peça comum
    const forwardDirection = playerColor === PieceColor.LIGHT ? -1 : 1;

    // Movimento simples (1 casa para frente)
    if (Math.abs(rowDiff) === 1 && colDiff === 1) {
      // Validação de direção: peça comum só move para frente
      if (rowDiff !== forwardDirection) {
        return {
          isValid: false,
          error: 'Peça comum só pode mover para frente',
        };
      }

      return {
        isValid: true,
        type: MoveType.SIMPLE,
        capturedPositions: [],
      };
    }

    // Movimento de captura (2 casas)
    if (Math.abs(rowDiff) === 2 && colDiff === 2) {
      // Posição da peça a ser capturada
      const middleRow = from.row + rowDiff / 2;
      const middleCol = from.col + (to.col - from.col) / 2;
      const middlePos = new Position(middleRow, middleCol);

      const capturedPiece = board.getPieceAt(middlePos);

      // Deve haver uma peça adversária na posição intermediária
      if (!capturedPiece) {
        return {
          isValid: false,
          error: 'Não há peça para capturar',
        };
      }

      if (capturedPiece.color === playerColor) {
        return {
          isValid: false,
          error: 'Não pode capturar própria peça',
        };
      }

      return {
        isValid: true,
        type: MoveType.CAPTURE,
        capturedPositions: [middlePos],
      };
    }

    return {
      isValid: false,
      error: 'Movimento inválido para peça comum',
    };
  }

  /**
   * Valida movimento de Dama
   * Damas podem mover múltiplas casas na diagonal em qualquer direção
   */
  private validateQueenMove(
    board: Board,
    from: Position,
    to: Position,
    playerColor: PieceColor
  ): MoveValidationResult {
    const rowDiff = to.row - from.row;
    const colDiff = to.col - from.col;

    // Calcula direção do movimento
    const rowStep = rowDiff > 0 ? 1 : -1;
    const colStep = colDiff > 0 ? 1 : -1;
    const distance = Math.abs(rowDiff);

    // Verifica caminho diagonal completo
    const pathPositions: Position[] = [];
    let capturedPiece: Position | null = null;

    for (let i = 1; i < distance; i++) {
      const currentRow = from.row + i * rowStep;
      const currentCol = from.col + i * colStep;
      const currentPos = new Position(currentRow, currentCol);
      pathPositions.push(currentPos);

      const pieceAtPos = board.getPieceAt(currentPos);

      if (pieceAtPos) {
        // Se já encontrou uma peça antes, não pode pular duas
        if (capturedPiece !== null) {
          return {
            isValid: false,
            error: 'Dama não pode pular múltiplas peças em um movimento',
          };
        }

        // Se é peça do mesmo time, movimento inválido
        if (pieceAtPos.color === playerColor) {
          return {
            isValid: false,
            error: 'Dama não pode pular própria peça',
          };
        }

        // Marca peça adversária para captura
        capturedPiece = currentPos;
      }
    }

    // Se encontrou peça adversária, é movimento de captura
    if (capturedPiece) {
      return {
        isValid: true,
        type: MoveType.CAPTURE,
        capturedPositions: [capturedPiece],
      };
    }

    // Movimento simples (sem captura)
    return {
      isValid: true,
      type: MoveType.SIMPLE,
      capturedPositions: [],
    };
  }

  /**
   * Verifica se movimento é diagonal
   */
  private isDiagonalMove(from: Position, to: Position): boolean {
    const rowDiff = Math.abs(to.row - from.row);
    const colDiff = Math.abs(to.col - from.col);

    // Diagonal: diferença em linhas deve ser igual à diferença em colunas
    return rowDiff === colDiff && rowDiff > 0;
  }

  /**
   * Lista todos os movimentos válidos para uma peça específica
   */
  getValidMovesForPiece(
    board: Board,
    position: Position,
    playerColor: PieceColor
  ): Position[] {
    const piece = board.getPieceAt(position);
    if (!piece || piece.color !== playerColor) {
      return [];
    }

    const validMoves: Position[] = [];

    // Para cada posição do tabuleiro, tenta validar o movimento
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const targetPos = new Position(row, col);
        if (!targetPos.isDarkSquare()) continue;

        const result = this.validate(board, position, targetPos, playerColor);
        if (result.isValid) {
          validMoves.push(targetPos);
        }
      }
    }

    return validMoves;
  }

  /**
   * Lista todos os movimentos válidos para todas as peças de uma cor
   */
  getAllValidMoves(
    board: Board,
    playerColor: PieceColor
  ): Map<Position, Position[]> {
    const allMoves = new Map<Position, Position[]>();

    const pieces = board.getPiecesByColor(playerColor);
    for (const piece of pieces) {
      const validMoves = this.getValidMovesForPiece(
        board,
        piece.position,
        playerColor
      );
      if (validMoves.length > 0) {
        allMoves.set(piece.position, validMoves);
      }
    }

    return allMoves;
  }
}
