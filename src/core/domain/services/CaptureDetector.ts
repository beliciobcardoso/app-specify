import { Board } from '../entities/Board';
import { Position } from '../value-objects/Position';
import { PieceColor } from '../value-objects/PieceColor';
import { PieceType } from '../value-objects/PieceType';

/**
 * Representa um movimento de captura possível
 */
export interface CaptureMove {
  /** Posição de origem */
  from: Position;
  /** Posição de destino */
  to: Position;
  /** Posições das peças capturadas */
  capturedPositions: Position[];
}

/**
 * Serviço de detecção de capturas obrigatórias (FR-003)
 * 
 * Regras implementadas:
 * - FR-003: Capturas são obrigatórias quando disponíveis
 * - FR-005: Damas podem capturar para frente e para trás (bidirecionais)
 * - Peças comuns capturam em diagonal (1 casa de distância)
 * - Damas capturam em diagonal (múltiplas casas de distância)
 */
export class CaptureDetector {
  /**
   * Detecta se há capturas obrigatórias disponíveis para o jogador
   */
  hasCaptures(board: Board, playerColor: PieceColor): boolean {
    const captures = this.getAllCaptures(board, playerColor);
    return captures.length > 0;
  }

  /**
   * Retorna todas as capturas possíveis para o jogador
   */
  getAllCaptures(board: Board, playerColor: PieceColor): CaptureMove[] {
    const allCaptures: CaptureMove[] = [];

    const pieces = board.getPiecesByColor(playerColor);
    for (const piece of pieces) {
      const pieceCaptures = this.getCapturesForPiece(
        board,
        piece.position,
        playerColor
      );
      allCaptures.push(...pieceCaptures);
    }

    return allCaptures;
  }

  /**
   * Retorna todas as capturas possíveis para uma peça específica
   */
  getCapturesForPiece(
    board: Board,
    position: Position,
    playerColor: PieceColor
  ): CaptureMove[] {
    const piece = board.getPieceAt(position);
    if (!piece || piece.color !== playerColor) {
      return [];
    }

    if (piece.type === PieceType.COMMON) {
      return this.getCommonPieceCaptures(board, position, playerColor);
    } else {
      return this.getQueenCaptures(board, position, playerColor);
    }
  }

  /**
   * Detecta capturas disponíveis para peça comum
   * Peça comum captura 1 casa de distância em diagonal
   */
  private getCommonPieceCaptures(
    board: Board,
    from: Position,
    playerColor: PieceColor
  ): CaptureMove[] {
    const captures: CaptureMove[] = [];

    // 4 direções diagonais possíveis
    const directions = [
      { rowDelta: -1, colDelta: -1 }, // Cima-esquerda
      { rowDelta: -1, colDelta: 1 },  // Cima-direita
      { rowDelta: 1, colDelta: -1 },  // Baixo-esquerda
      { rowDelta: 1, colDelta: 1 },   // Baixo-direita
    ];

    for (const dir of directions) {
      // Posição da peça a ser capturada
      const captureRow = from.row + dir.rowDelta;
      const captureCol = from.col + dir.colDelta;

      // Verifica se está dentro do tabuleiro
      if (captureRow < 0 || captureRow > 7 || captureCol < 0 || captureCol > 7) {
        continue;
      }

      const capturePos = new Position(captureRow, captureCol);
      const capturedPiece = board.getPieceAt(capturePos);

      // Deve haver peça adversária
      if (!capturedPiece || capturedPiece.color === playerColor) {
        continue;
      }

      // Posição de destino (após captura)
      const landingRow = from.row + dir.rowDelta * 2;
      const landingCol = from.col + dir.colDelta * 2;

      // Verifica se destino está dentro do tabuleiro
      if (landingRow < 0 || landingRow > 7 || landingCol < 0 || landingCol > 7) {
        continue;
      }

      const landingPos = new Position(landingRow, landingCol);

      // Casa de destino deve estar vazia e ser escura
      if (board.getPieceAt(landingPos) === null && landingPos.isDarkSquare()) {
        captures.push({
          from,
          to: landingPos,
          capturedPositions: [capturePos],
        });
      }
    }

    return captures;
  }

  /**
   * Detecta capturas disponíveis para Dama
   * Dama pode capturar em qualquer direção diagonal, múltiplas casas
   * (FR-005: capturas bidirecionais)
   */
  private getQueenCaptures(
    board: Board,
    from: Position,
    playerColor: PieceColor
  ): CaptureMove[] {
    const captures: CaptureMove[] = [];

    // 4 direções diagonais
    const directions = [
      { rowStep: -1, colStep: -1 }, // Cima-esquerda
      { rowStep: -1, colStep: 1 },  // Cima-direita
      { rowStep: 1, colStep: -1 },  // Baixo-esquerda
      { rowStep: 1, colStep: 1 },   // Baixo-direita
    ];

    for (const dir of directions) {
      let currentRow = from.row + dir.rowStep;
      let currentCol = from.col + dir.colStep;
      let capturedPiece: Position | null = null;

      // Percorre a diagonal
      while (currentRow >= 0 && currentRow <= 7 && currentCol >= 0 && currentCol <= 7) {
        const currentPos = new Position(currentRow, currentCol);
        const pieceAtPos = board.getPieceAt(currentPos);

        if (pieceAtPos) {
          // Se já encontrou uma peça, não pode capturar duas em uma direção
          if (capturedPiece !== null) {
            break;
          }

          // Se é peça própria, não pode continuar nesta direção
          if (pieceAtPos.color === playerColor) {
            break;
          }

          // Marca peça adversária para captura
          capturedPiece = currentPos;
        } else if (capturedPiece !== null && currentPos.isDarkSquare()) {
          // Após encontrar peça adversária, qualquer casa vazia é destino válido
          captures.push({
            from,
            to: currentPos,
            capturedPositions: [capturedPiece],
          });
        }

        currentRow += dir.rowStep;
        currentCol += dir.colStep;
      }
    }

    return captures;
  }

  /**
   * Verifica se uma peça específica tem capturas disponíveis
   */
  pieceHasCaptures(
    board: Board,
    position: Position,
    playerColor: PieceColor
  ): boolean {
    const captures = this.getCapturesForPiece(board, position, playerColor);
    return captures.length > 0;
  }

  /**
   * Verifica se um movimento específico é uma captura
   */
  isCaptureMove(
    board: Board,
    from: Position,
    to: Position,
    playerColor: PieceColor
  ): boolean {
    const captures = this.getCapturesForPiece(board, from, playerColor);
    return captures.some((capture) => capture.to.equals(to));
  }

  /**
   * Obtém as posições capturadas em um movimento específico
   */
  getCapturedPositions(
    board: Board,
    from: Position,
    to: Position,
    playerColor: PieceColor
  ): Position[] {
    const captures = this.getCapturesForPiece(board, from, playerColor);
    const matchingCapture = captures.find((capture) => capture.to.equals(to));
    return matchingCapture ? matchingCapture.capturedPositions : [];
  }
}
